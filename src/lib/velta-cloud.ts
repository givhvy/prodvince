import "server-only";

import { createHash } from "node:crypto";

/**
 * Read-only client for Velta Cloud, the store the Velta DAW uploads saved beats to.
 *
 * A library's index lives in the R2 bucket behind stratum-cloud-api. That API has no
 * accounts: whoever knows the library id can list, download and overwrite the library.
 * This page is public, so the id must never reach a browser, and neither may R2 object
 * keys or signed R2 URLs, because a key contains the id. That is why audio is streamed
 * through this server instead of redirecting the player to R2. Only a beat's audio is ever
 * served, never project files, samples or the `source` rows that hold local paths from the PC.
 *
 * The WAV stays in the cloud as the master. What plays here is a 256 kbps AAC copy of it
 * (about a ninth of the bytes): Velta uploads one next to the WAV as `preview.m4a`, and
 * scripts/backfill-cloud-previews.mjs made one for beats saved before that, at a key derived
 * from the WAV's. A beat with neither plays its WAV.
 */

const DEFAULT_API_BASE = "https://stratum-cloud-api.vercel.app";
const REQUEST_TIMEOUT_MS = 30_000;
const PRESIGNED_HOST_SUFFIX = ".r2.cloudflarestorage.com";

/** A public page must not turn every visitor's refresh into a read of the whole index. */
const LIST_CACHE_MS = 15_000;
/** The API signs for an hour. Stop reusing an address well before it runs out. */
const SIGNED_URL_REUSE_MS = 50 * 60 * 1000;
/** Cap for open-ended ranges, so one reply can't tie up a server for a whole 50 MB WAV. */
const MAX_AUDIO_CHUNK_BYTES = 4 * 1024 * 1024;
/** The backfill manifest only changes when the script runs. */
const MANIFEST_CACHE_MS = 10 * 60 * 1000;
const MANIFEST_RETRY_MS = 30_000;
/** Audio whose address names exactly the bytes served may sit in the browser cache. */
const IMMUTABLE_AUDIO_CACHE = "private, max-age=604800, immutable";
/**
 * A whole AAC copy, asked for without a Range: the page's prefetch (players always send a Range).
 * Vercel's CDN only keeps replies to requests without one, so this is the form of the audio a
 * second listener can get from the nearest edge instead of from here.
 */
const WHOLE_AUDIO_CACHE = "public, max-age=31536000, immutable";
const WHOLE_AUDIO_CDN_CACHE = "max-age=2592000";

// Velta names it preview.m4a; the backfill names it preview-<hash>.m4a.
const PREVIEW_NAME = /^preview(?:-[0-9a-f]+)?\.m4a$/i;

type CloudFile = { kind?: string; key?: string; size?: number; name?: string; source?: string };

type CloudVersion = {
  savedAt?: string;
  wavKey?: string | null;
  media?: CloudFile[];
  files?: CloudFile[];
};

type CloudProject = {
  id?: string;
  projectId?: string;
  name?: string;
  bpm?: number;
  updatedAt?: string | null;
  latest?: CloudVersion | null;
  versions?: CloudVersion[];
};

export type CloudBeat = {
  id: string;
  title: string;
  fullName: string;
  number: number | null;
  bpm: number | null;
  musicalKey: string | null;
  savedAt: string | null;
  audio: {
    /** Size of the WAV master. */
    sizeBytes: number | null;
    /** Set when the newest save has no WAV and this audio comes from an earlier save. */
    olderSaveAt: string | null;
    /** What the player streams: the AAC preview, or the WAV while the beat has none. */
    stream: "aac" | "wav";
    /** Names the streamed file without revealing its key; the audio address carries it as ?v=. */
    token: string;
  } | null;
};

export type CloudListing = { beats: CloudBeat[]; checkedAt: string };

class CloudError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

// "151 - Seen Enough 110 BPM D# minor @prodvince"
const NUMBERED_NAME = /^(\d+)\s*-\s*(.+?)\s+\d+(?:\.\d+)?\s*BPM(?:\s+(.*?))?(?:\s+@\S+)?$/i;
const MUSICAL_KEY = /^[A-G][#b]?\s+(?:major|minor)$/i;

// DEV saves land in the same library as real beats, and names are the only signal.
// These stay in the cloud but are never listed or served here.
const TEST_SAVE_NAMES = [
  /^[a-z0-9]\S*$/, // tool-made slugs: "drip-test", "base1", "p"
  /\b(?:test|demo)\b/i,
  /^before/i,
  /^session before\b/i,
  /^zz\b/i,
  /\bcloud\d+\b/i, // "Save Card Cloud1"
];

function apiBase() {
  return (process.env.VELTA_CLOUD_API_BASE?.trim() || DEFAULT_API_BASE).replace(/\/+$/, "");
}

function libraryId() {
  return process.env.VELTA_CLOUD_LIBRARY_ID?.trim() ?? "";
}

export function isCloudConfigured() {
  return libraryId().length > 0;
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, libraryId: libraryId() }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new CloudError("Velta Cloud did not answer", 504);
  }
  if (!response.ok) {
    // The upstream error text can quote object keys, which contain the library id.
    console.error(`[velta-cloud] ${path} answered ${response.status}`);
    throw response.status === 404
      ? new CloudError("Not found in Velta Cloud", 404)
      : new CloudError(`Velta Cloud answered ${response.status}`, 502);
  }
  return (await response.json()) as T;
}

/** The cloud API's own segment rule, so the backfill key matches the one it handed out. */
function safeSegment(value: string, fallback: string) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

function hex16(text: string) {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

/**
 * Where scripts/backfill-cloud-previews.mjs puts the AAC copy of a WAV, and the manifest it
 * keeps of them (one read instead of a lookup per beat). Keep the two files in step.
 */
function backfillPreviewKey(projectId: string, wavKey: string) {
  const lib = safeSegment(libraryId(), "library");
  return `media/${lib}/${safeSegment(projectId, "project")}/asset/preview-${hex16(wavKey)}.m4a`;
}

function backfillManifestKey() {
  return `media/${safeSegment(libraryId(), "library")}/cloud-previews/asset/manifest.json`;
}

/** hex16(wavKey) -> size of its AAC copy. */
type PreviewManifest = Map<string, number | null>;

function fileName(row: CloudFile) {
  return row.name || row.key?.split("/").pop() || "";
}

function wavIn(version: CloudVersion) {
  const rows = [...(version.media ?? []), ...(version.files ?? [])];
  const key = version.wavKey || rows.find((row) => row.kind === "wav")?.key;
  if (!key) return null;
  // Samples are asset rows too, but they always carry the PC path they came from.
  const preview = rows.find((row) => row.key && !row.source && PREVIEW_NAME.test(fileName(row)));
  return {
    key,
    sizeBytes: rows.find((row) => row.key === key)?.size || null,
    savedAt: version.savedAt ?? null,
    preview: preview?.key ? { key: preview.key, sizeBytes: preview.size || null } : null,
  };
}

/** A plain save replaces `latest` with a project-only version, so older versions can still hold the WAV. */
function newestAudio(project: CloudProject) {
  const inLatest = project.latest ? wavIn(project.latest) : null;
  if (inLatest) return { ...inLatest, olderSaveAt: null };
  for (const version of project.versions ?? []) {
    const found = wavIn(version);
    if (found) return { ...found, olderSaveAt: found.savedAt };
  }
  return null;
}

type Streamed = { key: string; stream: "aac" | "wav"; sizeBytes: number | null };

function toBeat(
  project: CloudProject,
  id: string,
  audio: ReturnType<typeof newestAudio>,
  streamed: Streamed | null,
): CloudBeat {
  const fullName = project.name || id;
  const numbered = NUMBERED_NAME.exec(fullName);
  const keyText = numbered?.[3]?.trim() ?? "";
  return {
    id,
    title: numbered?.[2] ?? fullName,
    fullName,
    number: numbered ? Number(numbered[1]) : null,
    bpm: project.bpm ? Math.round(project.bpm * 10) / 10 : null,
    musicalKey: MUSICAL_KEY.test(keyText) ? keyText : null,
    // updatedAt also moves when only a beat's metadata changes, so sort on the save itself.
    savedAt: project.latest?.savedAt ?? project.updatedAt ?? null,
    audio:
      audio && streamed
        ? {
            sizeBytes: audio.sizeBytes,
            olderSaveAt: audio.olderSaveAt,
            stream: streamed.stream,
            token: streamToken(streamed.key),
          }
        : null,
  };
}

type SignedAudio = { url: string; reuseUntil: number };

type CloudState = {
  /** What each beat streams, by beat id. */
  streams: Map<string, Streamed>;
  /** By object key. */
  signedAudio: Map<string, SignedAudio>;
  listing?: { startedAt: number; promise: Promise<CloudListing> };
  manifest?: { reuseUntil: number; promise: Promise<PreviewManifest> };
};

// Route handlers are bundled separately, so what they share has to live on globalThis.
const shared = globalThis as typeof globalThis & { veltaCloudState?: CloudState };

function state() {
  shared.veltaCloudState ??= { streams: new Map(), signedAudio: new Map() };
  return shared.veltaCloudState;
}

function streamToken(key: string) {
  return hex16(`stream:${key}`);
}

async function readManifest(): Promise<PreviewManifest> {
  const previews: PreviewManifest = new Map();
  let url: string;
  try {
    url = await signedUrl(backfillManifestKey());
  } catch (error) {
    if (error instanceof CloudError && error.status === 404) return previews; // never backfilled
    throw error;
  }
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new CloudError(`Velta Cloud answered ${response.status}`, 502);
  const parsed = (await response.json()) as { previews?: Record<string, { size?: number }> };
  for (const [hash, row] of Object.entries(parsed.previews ?? {})) {
    if (/^[0-9a-f]{16}$/.test(hash)) previews.set(hash, row?.size || null);
  }
  return previews;
}

/** Never fails: without the manifest, backfilled beats just play their WAV for a while. */
function previewManifest(): Promise<PreviewManifest> {
  const current = state();
  if (current.manifest && Date.now() < current.manifest.reuseUntil) return current.manifest.promise;
  const promise = readManifest().catch((error: unknown) => {
    console.error("[velta-cloud] preview manifest unreadable", error instanceof CloudError ? error.status : "");
    if (current.manifest?.promise === promise) current.manifest.reuseUntil = Date.now() + MANIFEST_RETRY_MS;
    return new Map() as PreviewManifest;
  });
  current.manifest = { reuseUntil: Date.now() + MANIFEST_CACHE_MS, promise };
  return promise;
}

/** The AAC copy saved with the WAV, then a backfilled one, then the WAV itself. */
function streamFor(
  id: string,
  audio: NonNullable<ReturnType<typeof newestAudio>>,
  manifest: PreviewManifest,
): Streamed {
  if (audio.preview) return { key: audio.preview.key, stream: "aac", sizeBytes: audio.preview.sizeBytes };
  const hash = hex16(audio.key);
  if (manifest.has(hash)) {
    return { key: backfillPreviewKey(id, audio.key), stream: "aac", sizeBytes: manifest.get(hash) ?? null };
  }
  return { key: audio.key, stream: "wav", sizeBytes: audio.sizeBytes };
}

async function readListing(): Promise<CloudListing> {
  const [{ projects }, manifest] = await Promise.all([
    post<{ projects?: CloudProject[] }>("/api/cloud/projects/list", {}),
    previewManifest(),
  ]);
  const streams = new Map<string, Streamed>();
  const beats: CloudBeat[] = [];
  for (const project of projects ?? []) {
    const id = project.projectId || project.id;
    if (!id || TEST_SAVE_NAMES.some((pattern) => pattern.test(project.name || id))) continue;
    const audio = newestAudio(project);
    const streamed = audio ? streamFor(id, audio, manifest) : null;
    if (streamed) streams.set(id, streamed);
    beats.push(toBeat(project, id, audio, streamed));
  }
  state().streams = streams;
  beats.sort((a, b) => (b.savedAt ?? "").localeCompare(a.savedAt ?? ""));
  return { beats, checkedAt: new Date().toISOString() };
}

export function listCloudBeats(): Promise<CloudListing> {
  const current = state();
  if (current.listing && Date.now() - current.listing.startedAt < LIST_CACHE_MS) {
    return current.listing.promise;
  }
  const promise = readListing();
  current.listing = { startedAt: Date.now(), promise };
  promise.catch(() => {
    if (current.listing?.promise === promise) current.listing = undefined;
  });
  return promise;
}

async function signedUrl(key: string): Promise<string> {
  const current = state();
  const cached = current.signedAudio.get(key);
  if (cached && Date.now() < cached.reuseUntil) return cached.url;

  const { url } = await post<{ url?: string }>("/api/cloud/projects/download", { key });
  let host = "";
  try {
    const parsed = new URL(url ?? "");
    if (parsed.protocol === "https:") host = parsed.hostname;
  } catch {
    // handled below
  }
  if (!url || !host.endsWith(PRESIGNED_HOST_SUFFIX)) {
    throw new CloudError("Velta Cloud returned an unexpected audio address", 502);
  }
  current.signedAudio.set(key, { url, reuseUntil: Date.now() + SIGNED_URL_REUSE_MS });
  return url;
}

/** The file to stream for a beat: the AAC preview when there is one, else the WAV. */
async function streamedAudio(beatId: string): Promise<Streamed> {
  // listCloudBeats is cached, so a stream of made-up ids cannot hammer the index.
  if (!state().streams.has(beatId)) await listCloudBeats();
  const streamed = state().streams.get(beatId);
  if (!streamed) throw new CloudError("This beat has no audio in Velta Cloud", 404);
  return streamed;
}

function requestedBytes(rangeHeader: string | null) {
  const match = rangeHeader ? /^bytes=(\d+)-(\d*)$/.exec(rangeHeader.trim()) : null;
  const start = match ? Number(match[1]) : 0;
  // Safari names exact ranges and rejects a shorter reply. Chrome leaves the end open and asks again.
  const end = match?.[2] ? Number(match[2]) : start + MAX_AUDIO_CHUNK_BYTES - 1;
  return { start, end };
}

/**
 * A beat's audio. The upstream address and headers stop here.
 * With a Range (what players send): that byte range. Without one, for an AAC copy: the whole file,
 * which is what the page prefetches and the only form Vercel's CDN will cache.
 * `token` is the ?v= the listing gave the player. When it names the file served, the reply may be
 * kept: a re-save changes the token, and with it the address.
 */
export async function streamBeatAudio(
  beatId: string,
  rangeHeader: string | null,
  token: string | null,
): Promise<Response> {
  const streamed = await streamedAudio(beatId);
  const url = await signedUrl(streamed.key);
  const exact = token === streamToken(streamed.key);
  // WAVs run to 60 MB, so they only ever go out in ranges.
  const whole = rangeHeader === null && streamed.stream === "aac";
  const { start, end } = requestedBytes(rangeHeader);

  // The timeout covers the wait for headers only: a paused player reads the body slowly on purpose.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: whole ? {} : { Range: `bytes=${start}-${end}` },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    throw new CloudError("Velta Cloud did not answer", 504);
  } finally {
    clearTimeout(timer);
  }

  if (whole) {
    if (upstream.status !== 200 || !upstream.body) {
      void upstream.body?.cancel();
      state().signedAudio.delete(streamed.key);
      console.error(`[velta-cloud] audio read answered ${upstream.status}`);
      throw new CloudError(`Velta Cloud answered ${upstream.status}`, 502);
    }
    const headers = new Headers({
      "Accept-Ranges": "bytes",
      "Cache-Control": exact ? WHOLE_AUDIO_CACHE : "no-store",
      "Content-Type": "audio/mp4",
    });
    const length = upstream.headers.get("content-length");
    if (length) headers.set("Content-Length", length);
    if (exact) {
      headers.set("Vercel-CDN-Cache-Control", WHOLE_AUDIO_CDN_CACHE);
      headers.set("ETag", `"${token}"`);
    }
    return new Response(upstream.body, { status: 200, headers });
  }

  const contentRange = upstream.headers.get("content-range");
  if (upstream.status === 416) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": contentRange ?? "bytes */*", "Cache-Control": "no-store" },
    });
  }
  if (upstream.status !== 206 || !upstream.body || !contentRange) {
    void upstream.body?.cancel();
    state().signedAudio.delete(streamed.key);
    console.error(`[velta-cloud] audio read answered ${upstream.status}`);
    throw new CloudError(`Velta Cloud answered ${upstream.status}`, 502);
  }

  return new Response(upstream.body, {
    status: 206,
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": exact ? IMMUTABLE_AUDIO_CACHE : "no-store",
      "Content-Length": upstream.headers.get("content-length") ?? String(end - start + 1),
      "Content-Range": contentRange,
      "Content-Type":
        streamed.stream === "aac" ? "audio/mp4" : (upstream.headers.get("content-type") ?? "audio/wav"),
      // A strong validator lets the browser keep and combine byte ranges between plays.
      ...(exact ? { ETag: `"${token}"` } : {}),
    },
  });
}

export function cloudErrorResponse(error: unknown) {
  const status = error instanceof CloudError ? error.status : 500;
  const message = error instanceof CloudError ? error.message : "Could not read Velta Cloud";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

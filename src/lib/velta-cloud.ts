import "server-only";

/**
 * Read-only client for Velta Cloud, the store the Velta DAW uploads saved beats to.
 *
 * A library's index lives in the R2 bucket behind stratum-cloud-api. That API has no
 * accounts: whoever knows the library id can list, download and overwrite the library.
 * This page is public, so the id must never reach a browser, and neither may R2 object
 * keys or signed R2 URLs, because a key contains the id. That is why audio is streamed
 * through this server instead of redirecting the player to R2. Only WAVs are ever served,
 * never project files, samples or the `source` rows that hold local paths from the PC.
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

type CloudFile = { kind?: string; key?: string; size?: number };

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
    sizeBytes: number | null;
    /** Set when the newest save has no WAV and this audio comes from an earlier save. */
    olderSaveAt: string | null;
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

function wavIn(version: CloudVersion) {
  const rows = [...(version.media ?? []), ...(version.files ?? [])];
  const key = version.wavKey || rows.find((row) => row.kind === "wav")?.key;
  if (!key) return null;
  return {
    key,
    sizeBytes: rows.find((row) => row.key === key)?.size || null,
    savedAt: version.savedAt ?? null,
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

function toBeat(project: CloudProject, id: string, audio: ReturnType<typeof newestAudio>): CloudBeat {
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
    audio: audio ? { sizeBytes: audio.sizeBytes, olderSaveAt: audio.olderSaveAt } : null,
  };
}

type SignedAudio = { key: string; url: string; reuseUntil: number };

type CloudState = {
  audioKeys: Map<string, string>;
  signedAudio: Map<string, SignedAudio>;
  listing?: { startedAt: number; promise: Promise<CloudListing> };
};

// Route handlers are bundled separately, so what they share has to live on globalThis.
const shared = globalThis as typeof globalThis & { veltaCloudState?: CloudState };

function state() {
  shared.veltaCloudState ??= { audioKeys: new Map(), signedAudio: new Map() };
  return shared.veltaCloudState;
}

async function readListing(): Promise<CloudListing> {
  const { projects } = await post<{ projects?: CloudProject[] }>("/api/cloud/projects/list", {});
  const keys = new Map<string, string>();
  const beats: CloudBeat[] = [];
  for (const project of projects ?? []) {
    const id = project.projectId || project.id;
    if (!id || TEST_SAVE_NAMES.some((pattern) => pattern.test(project.name || id))) continue;
    const audio = newestAudio(project);
    if (audio) keys.set(id, audio.key);
    beats.push(toBeat(project, id, audio));
  }
  state().audioKeys = keys;
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

async function signedAudioUrl(beatId: string): Promise<string> {
  const current = state();
  // listCloudBeats is cached, so a stream of made-up ids cannot hammer the index.
  if (!current.audioKeys.has(beatId)) await listCloudBeats();
  const key = current.audioKeys.get(beatId);
  if (!key) throw new CloudError("This beat has no audio in Velta Cloud", 404);

  const cached = current.signedAudio.get(beatId);
  if (cached && cached.key === key && Date.now() < cached.reuseUntil) return cached.url;

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
  current.signedAudio.set(beatId, { key, url, reuseUntil: Date.now() + SIGNED_URL_REUSE_MS });
  return url;
}

function requestedBytes(rangeHeader: string | null) {
  const match = rangeHeader ? /^bytes=(\d+)-(\d*)$/.exec(rangeHeader.trim()) : null;
  const start = match ? Number(match[1]) : 0;
  // Safari names exact ranges and rejects a shorter reply. Chrome leaves the end open and asks again.
  const end = match?.[2] ? Number(match[2]) : start + MAX_AUDIO_CHUNK_BYTES - 1;
  return { start, end };
}

/** One byte range of a beat's WAV. The upstream address and headers stop here. */
export async function streamBeatAudio(beatId: string, rangeHeader: string | null): Promise<Response> {
  const url = await signedAudioUrl(beatId);
  const { start, end } = requestedBytes(rangeHeader);

  // The timeout covers the wait for headers only: a paused player reads the body slowly on purpose.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: { Range: `bytes=${start}-${end}` },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    throw new CloudError("Velta Cloud did not answer", 504);
  } finally {
    clearTimeout(timer);
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
    state().signedAudio.delete(beatId);
    console.error(`[velta-cloud] audio read answered ${upstream.status}`);
    throw new CloudError(`Velta Cloud answered ${upstream.status}`, 502);
  }

  return new Response(upstream.body, {
    status: 206,
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
      "Content-Length": upstream.headers.get("content-length") ?? String(end - start + 1),
      "Content-Range": contentRange,
      "Content-Type": upstream.headers.get("content-type") ?? "audio/wav",
    },
  });
}

export function cloudErrorResponse(error: unknown) {
  const status = error instanceof CloudError ? error.status : 500;
  const message = error instanceof CloudError ? error.message : "Could not read Velta Cloud";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

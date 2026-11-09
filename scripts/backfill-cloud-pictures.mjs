#!/usr/bin/env node
/**
 * Gives Velta Cloud beats saved before Velta uploaded a picture with every save the picture Velta
 * would pick for them, so /cloud can show it. Velta itself draws the picture (Control method
 * daw.project_picture on a running Velta DEV), from the beat's local project in D:\veltadaw:
 * its own cover unless black, a frame of its MP4, its kits' album art or its spectrogram.
 *
 * Each picture goes to media/<lib>/<project>/asset/picture-<sha256(jpeg) first 16 hex>.jpg, and
 * media/<lib>/cloud-previews/asset/manifest.json lists them under `pictures`, keyed by
 * sha256(projectId) first 16 hex. src/lib/velta-cloud.ts reads both: keep them in step.
 * Files go up through /api/cloud/media/add-start only, never add-complete or upload-complete:
 * those rewrite the library index, and a rewrite racing a save from Velta would lose that save.
 *
 *   node scripts/backfill-cloud-pictures.mjs                  # make what is missing
 *   node scripts/backfill-cloud-pictures.mjs --dry-run        # only list it
 *   node scripts/backfill-cloud-pictures.mjs --preview <dir>  # draw the pictures into <dir>, upload nothing
 *   node scripts/backfill-cloud-pictures.mjs --redo           # replace pictures made by an earlier run
 *
 * Reads VELTA_CLOUD_LIBRARY_ID from .env.local and prints neither it nor object keys (a key contains
 * it). VELTA_RPC_PORT is Velta DEV's Control port (9002); never point it at MAIN (9001).
 * VELTA_PROJECTS is the folder of .velta files (D:\veltadaw).
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { createConnection } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

const API_BASE = (process.env.VELTA_CLOUD_API_BASE?.trim() || "https://stratum-cloud-api.vercel.app").replace(/\/+$/, "");
const PRESIGNED_HOST_SUFFIX = ".r2.cloudflarestorage.com";
const RPC_PORT = Number(process.env.VELTA_RPC_PORT || 9002);
const PROJECTS_DIR = process.env.VELTA_PROJECTS || "D:\\veltadaw";
const MAX_PICTURE_BYTES = 4 * 1024 * 1024;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const redo = args.includes("--redo");
const previewAt = args.indexOf("--preview");
const previewDir = previewAt >= 0 ? args[previewAt + 1] : null;

if (RPC_PORT === 9001) {
  console.error("9001 is Velta MAIN, the daily driver. Use DEV (9002) or a private copy.");
  process.exit(1);
}

// Same as src/lib/velta-cloud.ts: test saves are never listed or served, so they get no picture.
const TEST_SAVE_NAMES = [/^[a-z0-9]\S*$/, /\b(?:test|demo)\b/i, /^before/i, /^session before\b/i, /^zz\b/i, /\bcloud\d+\b/i];
const PICTURE_NAME = /^picture\.(?:jpe?g|png|webp)$/i;

function readLibraryId() {
  if (process.env.VELTA_CLOUD_LIBRARY_ID?.trim()) return process.env.VELTA_CLOUD_LIBRARY_ID.trim();
  const env = existsSync(".env.local") ? readFileSync(".env.local", "utf8") : "";
  const line = env.split(/\r?\n/).find((row) => row.startsWith("VELTA_CLOUD_LIBRARY_ID="));
  return (line?.slice("VELTA_CLOUD_LIBRARY_ID=".length) ?? "").trim().replace(/^["']|["']$/g, "");
}

const libraryId = readLibraryId();
if (!libraryId) {
  console.error("VELTA_CLOUD_LIBRARY_ID is not set (.env.local).");
  process.exit(1);
}

function safeSegment(value, fallback) {
  const cleaned = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

const hex16 = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

class ApiError extends Error {
  constructor(path, status) {
    // The API's own error text can quote keys, so only the status is kept.
    super(`${path} answered ${status}`);
    this.status = status;
  }
}

async function post(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, libraryId }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new ApiError(path, response.status);
  return response.json();
}

function checkPresigned(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(PRESIGNED_HOST_SUFFIX)) {
    throw new Error("the API returned an unexpected storage address");
  }
  return url;
}

async function downloadUrl(key) {
  try {
    const { url } = await post("/api/cloud/projects/download", { key });
    return checkPresigned(url);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

async function storedSize(key) {
  const url = await downloadUrl(key);
  if (!url) return null;
  const response = await fetch(url, { headers: { Range: "bytes=0-0" }, signal: AbortSignal.timeout(60_000) });
  await response.body?.cancel();
  if (response.status !== 206) throw new Error(`size check answered ${response.status}`);
  return Number(/\/(\d+)$/.exec(response.headers.get("content-range") || "")?.[1] || 0);
}

/** Store a small file at media/<lib>/<project>/asset/<name>, refusing any other key. */
async function putAsset(projectId, name, body, contentType, expectedKey) {
  const { uploads } = await post("/api/cloud/media/add-start", {
    projectId,
    files: [{ name, kind: "asset", size: body.length, contentType }],
  });
  const upload = uploads?.[0];
  if (!upload?.uploadUrl || upload.key !== expectedKey) {
    throw new Error("the API would store the file somewhere /cloud does not look");
  }
  const put = await fetch(checkPresigned(upload.uploadUrl), {
    method: "PUT",
    headers: { "Content-Type": upload.contentType || contentType },
    body,
    signal: AbortSignal.timeout(5 * 60_000),
  });
  if (!put.ok) throw new Error(`upload answered ${put.status}`);
}

const MANIFEST_PROJECT = "cloud-previews";
const MANIFEST_NAME = "manifest.json";

async function readManifest(key) {
  const url = await downloadUrl(key);
  if (!url) return { version: 1, previews: {}, pictures: {} };
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`manifest read answered ${response.status}`);
  const parsed = await response.json();
  // Keep every other section (backfill-cloud-previews.mjs writes `previews` to the same file).
  return { ...parsed, version: 1, previews: parsed?.previews ?? {}, pictures: parsed?.pictures ?? {} };
}

/** One Control call to Velta: a JSON line out, the reply line with our id back. */
function rpc(method, params, timeoutMs = 120_000) {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host: "127.0.0.1", port: RPC_PORT });
    let buffer = "";
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`${method} timed out`));
    }, timeoutMs);
    socket.on("connect", () => socket.write(`${JSON.stringify({ id: 1, method, params })}\n`));
    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        try {
          const message = JSON.parse(line);
          if (message.id !== 1) continue;
          clearTimeout(timer);
          socket.end();
          resolve(message.result ?? message);
          return;
        } catch {
          // not ours, or not JSON
        }
      }
    });
    socket.on("error", (error) => {
      clearTimeout(timer);
      reject(new Error(`Velta on port ${RPC_PORT} did not answer (${error.code ?? error.message})`));
    });
  });
}

function rowsOf(version) {
  return [...(version?.media ?? []), ...(version?.files ?? [])];
}

/** Same choice as newestAudio in src/lib/velta-cloud.ts: is there a WAV in any version? */
function hasAudio(project) {
  return [project.latest, ...(project.versions ?? [])].some(
    (version) => version && (version.wavKey || rowsOf(version).some((row) => row.kind === "wav")),
  );
}

/** A picture Velta uploaded with a save (picture.jpg); older cover.png uploads don't count. */
function hasSavedPicture(project) {
  return [project.latest, ...(project.versions ?? [])].some(
    (version) =>
      version &&
      rowsOf(version).some((row) => row.key && !row.source && PICTURE_NAME.test(row.name || row.key.split("/").pop() || "")),
  );
}

/** The local project for a cloud beat: the .velta with the beat's name in the projects folder. */
const localProjects = new Map(
  (existsSync(PROJECTS_DIR) ? readdirSync(PROJECTS_DIR) : [])
    .filter((name) => name.toLowerCase().endsWith(".velta"))
    .map((name) => [name.slice(0, -".velta".length).toLowerCase(), join(PROJECTS_DIR, name)]),
);

const lib = safeSegment(libraryId, "library");
const manifestKey = `media/${lib}/${MANIFEST_PROJECT}/asset/${MANIFEST_NAME}`;
const [{ projects }, manifest] = await Promise.all([post("/api/cloud/projects/list", {}), readManifest(manifestKey)]);

const jobs = [];
const noLocal = [];
let fromVelta = 0;
let alreadyBackfilled = 0;
for (const project of projects ?? []) {
  const projectId = project.projectId || project.id;
  const name = project.name || projectId;
  if (!projectId || TEST_SAVE_NAMES.some((pattern) => pattern.test(name)) || !hasAudio(project)) continue;
  if (hasSavedPicture(project)) {
    fromVelta++;
    continue;
  }
  const hash = hex16(projectId);
  if (manifest.pictures[hash] && !redo) {
    alreadyBackfilled++;
    continue;
  }
  const local = localProjects.get(name.toLowerCase());
  if (!local) {
    noLocal.push(name);
    continue;
  }
  jobs.push({ projectId, hash, name, local });
}

console.log(
  `${jobs.length} beats need a picture; ${fromVelta} have one Velta saved, ${alreadyBackfilled} were backfilled before, ` +
    `${noLocal.length} have no project in ${PROJECTS_DIR}.`,
);
for (const name of noLocal) console.log(`  no local project: ${name}`);
if (dryRun) {
  for (const job of jobs) console.log(`  ${job.name}`);
  process.exit(0);
}

const workDir = previewDir || join(tmpdir(), `velta-cloud-pictures-${process.pid}`);
mkdirSync(workDir, { recursive: true });
const kinds = {};
let done = 0;
let failed = 0;
let bytes = 0;
for (const job of jobs) {
  const out = join(workDir, `${job.name.replace(/[^\w .@#()-]+/g, "_")}.jpg`);
  try {
    const started = Date.now();
    const reply = await rpc("daw.project_picture", { project: job.local, out });
    if (!reply?.ok) {
      console.log(`no picture  ${job.name}: ${reply?.error ?? "Velta gave no answer"}`);
      continue;
    }
    const body = readFileSync(out);
    if (body.length === 0 || body.length > MAX_PICTURE_BYTES) throw new Error(`picture is ${body.length} bytes`);
    kinds[reply.kind] = (kinds[reply.kind] ?? 0) + 1;
    bytes += body.length;
    if (previewDir) {
      console.log(`drawn  ${job.name}: ${reply.kind}, ${kb(body.length)} (${Date.now() - started} ms)`);
      done++;
      continue;
    }
    const pictureName = `picture-${hex16(body)}.jpg`;
    const key = `media/${lib}/${safeSegment(job.projectId, "project")}/asset/${pictureName}`;
    await putAsset(job.projectId, pictureName, body, "image/jpeg", key);
    if ((await storedSize(key)) !== body.length) throw new Error("the picture is not readable after upload");
    manifest.pictures[job.hash] = { name: pictureName, size: body.length, kind: reply.kind, at: new Date().toISOString() };
    console.log(`done  ${job.name}: ${reply.kind}, ${kb(body.length)} (${Date.now() - started} ms)`);
    done++;
  } catch (error) {
    failed++;
    console.log(`FAILED  ${job.name}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (!previewDir) rmSync(out, { force: true });
  }
}
if (!previewDir) {
  rmSync(workDir, { recursive: true, force: true });
  if (done > 0) {
    const body = Buffer.from(JSON.stringify(manifest, null, 2));
    await putAsset(MANIFEST_PROJECT, MANIFEST_NAME, body, "application/json", manifestKey);
  }
}
console.log(
  `${done} of ${jobs.length} ${previewDir ? `drawn into ${previewDir}` : "uploaded"}, ${failed} failed. ` +
    `${kb(bytes)} in all. Kinds: ${JSON.stringify(kinds)}`,
);
process.exit(failed ? 1 : 0);

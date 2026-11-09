#!/usr/bin/env node
/**
 * Gives every Velta Cloud beat saved before Velta uploaded its own `preview.m4a` a 256 kbps
 * AAC copy of its WAV, which /cloud streams instead of the WAV. The WAV is not touched.
 *
 * The copy goes to media/<lib>/<project>/asset/preview-<sha256(wavKey) first 16 hex>.m4a, and
 * media/<lib>/cloud-previews/asset/manifest.json lists every copy made, so /cloud reads one file
 * instead of looking for a copy per beat. src/lib/velta-cloud.ts reads both: keep them in step.
 * Files go up through /api/cloud/media/add-start only, never add-complete or upload-complete:
 * those rewrite the library index, and a rewrite racing a save from Velta would lose that save.
 *
 *   node scripts/backfill-cloud-previews.mjs            # make what is missing
 *   node scripts/backfill-cloud-previews.mjs --dry-run  # only list it
 *   node scripts/backfill-cloud-previews.mjs --limit 2
 *
 * Reads VELTA_CLOUD_LIBRARY_ID from .env.local. Prints neither the id nor object keys, since a
 * key contains the id. Needs ffmpeg on PATH, or FFMPEG=<path>.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const API_BASE = (process.env.VELTA_CLOUD_API_BASE?.trim() || "https://stratum-cloud-api.vercel.app").replace(/\/+$/, "");
const PRESIGNED_HOST_SUFFIX = ".r2.cloudflarestorage.com";
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const LANES = 3;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitAt = args.indexOf("--limit");
const limit = limitAt >= 0 ? Number(args[limitAt + 1]) : Infinity;

// Same as src/lib/velta-cloud.ts: test saves are never listed or served, so they get no preview.
const TEST_SAVE_NAMES = [/^[a-z0-9]\S*$/, /\b(?:test|demo)\b/i, /^before/i, /^session before\b/i, /^zz\b/i, /\bcloud\d+\b/i];
const PREVIEW_NAME = /^preview(?:-[0-9a-f]+)?\.m4a$/i;

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
const mb = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`;

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

/** A presigned GET for the key, or null when there is no such object. */
async function downloadUrl(key) {
  try {
    const { url } = await post("/api/cloud/projects/download", { key });
    return checkPresigned(url);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Size of a stored object, or null when there is none. */
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
  if (!url) return { version: 1, previews: {} };
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`manifest read answered ${response.status}`);
  const parsed = await response.json();
  // Keep every other section (backfill-cloud-pictures.mjs writes `pictures` to the same file).
  return { ...parsed, version: 1, previews: parsed?.previews ?? {} };
}

function rowsOf(version) {
  return [...(version?.media ?? []), ...(version?.files ?? [])];
}

/** Same choice as newestAudio in src/lib/velta-cloud.ts. */
function newestWav(project) {
  for (const version of [project.latest, ...(project.versions ?? [])]) {
    if (!version) continue;
    const rows = rowsOf(version);
    const key = version.wavKey || rows.find((row) => row.kind === "wav")?.key;
    if (!key) continue;
    const listedPreview = rows.some(
      (row) => row.key && !row.source && PREVIEW_NAME.test(row.name || row.key.split("/").pop() || ""),
    );
    return { key, sizeBytes: rows.find((row) => row.key === key)?.size || 0, listedPreview };
  }
  return null;
}

function run(command, commandArgs) {
  return new Promise((resolve) => {
    const child = spawn(command, commandArgs, { stdio: ["ignore", "ignore", "pipe"] });
    let errors = "";
    child.stderr.on("data", (chunk) => {
      errors = (errors + chunk).slice(-2000);
    });
    child.on("error", (error) => resolve({ code: -1, errors: String(error) }));
    child.on("close", (code) => resolve({ code, errors }));
  });
}

/** Same encode as Velta's encodeStreamingPreview (VeltaCloudSync.cpp). */
async function encode(wav, out) {
  const common = ["-hide_banner", "-nostdin", "-loglevel", "error", "-y", "-i", wav, "-vn", "-map", "0:a:0"];
  const tail = ["-b:a", "256k", "-ac", "2", "-movflags", "+faststart", out];
  for (const codec of [["-c:a", "aac_mf"], ["-c:a", "aac", "-ar", "48000"]]) {
    rmSync(out, { force: true });
    const { code } = await run(FFMPEG, [...common, ...codec, ...tail]);
    if (code === 0 && existsSync(out) && statSync(out).size > 0) return codec[1];
  }
  throw new Error("ffmpeg could not encode the preview");
}

async function backfill(job, workDir) {
  const { projectId, wav, previewName, previewKey } = job;
  const wavFile = join(workDir, `${hex16(previewKey)}.wav`);
  const previewFile = join(workDir, `${hex16(previewKey)}.m4a`);
  try {
    const started = Date.now();
    const { url } = await post("/api/cloud/projects/download", { key: wav.key });
    const download = await fetch(checkPresigned(url), { signal: AbortSignal.timeout(15 * 60_000) });
    if (!download.ok || !download.body) throw new Error(`WAV download answered ${download.status}`);
    await pipeline(Readable.fromWeb(download.body), createWriteStream(wavFile));
    const downloaded = Date.now();

    const codec = await encode(wavFile, previewFile);
    const encoded = Date.now();
    const body = readFileSync(previewFile);

    await putAsset(projectId, previewName, body, "audio/mp4", previewKey);
    if ((await storedSize(previewKey)) !== body.length) throw new Error("the preview is not readable after upload");

    return {
      ok: true,
      codec,
      line: `${mb(statSync(wavFile).size)} WAV -> ${mb(body.length)} ${codec} (download ${((downloaded - started) / 1000).toFixed(1)} s, encode ${((encoded - downloaded) / 1000).toFixed(1)} s, upload ${((Date.now() - encoded) / 1000).toFixed(1)} s)`,
      wavBytes: statSync(wavFile).size,
      previewBytes: body.length,
    };
  } catch (error) {
    return { ok: false, line: error instanceof Error ? error.message : String(error) };
  } finally {
    rmSync(wavFile, { force: true });
    rmSync(previewFile, { force: true });
  }
}

const lib = safeSegment(libraryId, "library");
const manifestKey = `media/${lib}/${MANIFEST_PROJECT}/asset/${MANIFEST_NAME}`;
const [{ projects }, manifest] = await Promise.all([post("/api/cloud/projects/list", {}), readManifest(manifestKey)]);
const jobs = [];
let alreadyListed = 0;
let alreadyBackfilled = 0;
let recovered = 0;
for (const project of projects ?? []) {
  const projectId = project.projectId || project.id;
  if (!projectId || TEST_SAVE_NAMES.some((pattern) => pattern.test(project.name || projectId))) continue;
  const wav = newestWav(project);
  if (!wav) continue;
  if (wav.listedPreview) {
    alreadyListed++;
    continue;
  }
  const hash = hex16(wav.key);
  if (manifest.previews[hash]) {
    alreadyBackfilled++;
    continue;
  }
  const previewName = `preview-${hash}.m4a`;
  const previewKey = `media/${lib}/${safeSegment(projectId, "project")}/asset/${previewName}`;
  // Uploaded by a run that stopped before it wrote the manifest.
  const size = dryRun ? null : await storedSize(previewKey);
  if (size) {
    manifest.previews[hash] = { size, at: new Date().toISOString() };
    recovered++;
    continue;
  }
  jobs.push({ projectId, hash, name: project.name || projectId, wav, previewName, previewKey });
}

console.log(
  `${jobs.length} beats need a preview (${mb(jobs.reduce((sum, job) => sum + job.wav.sizeBytes, 0))} of WAV); ` +
    `${alreadyListed} have one from Velta, ${alreadyBackfilled} were backfilled before.`,
);
for (const job of jobs) console.log(`  ${job.name} (${mb(job.wav.sizeBytes)})`);
if (dryRun) process.exit(0);

async function writeManifest() {
  const body = Buffer.from(JSON.stringify(manifest, null, 2));
  await putAsset(MANIFEST_PROJECT, MANIFEST_NAME, body, "application/json", manifestKey);
}

if (jobs.length === 0) {
  if (recovered) await writeManifest();
  process.exit(0);
}

const workDir = join(tmpdir(), `velta-cloud-previews-${process.pid}`);
mkdirSync(workDir, { recursive: true });
const todo = jobs.slice(0, limit);
let next = 0;
let failed = 0;
let wavTotal = 0;
let previewTotal = 0;
await Promise.all(
  Array.from({ length: Math.min(LANES, todo.length) }, async () => {
    while (next < todo.length) {
      const job = todo[next++];
      const result = await backfill(job, workDir);
      if (result.ok) {
        wavTotal += result.wavBytes;
        previewTotal += result.previewBytes;
        manifest.previews[job.hash] = { size: result.previewBytes, encoder: result.codec, at: new Date().toISOString() };
      } else {
        failed++;
      }
      console.log(`${result.ok ? "done" : "FAILED"}  ${job.name}: ${result.line}`);
    }
  }),
);
rmSync(workDir, { recursive: true, force: true });
await writeManifest();
console.log(
  `${todo.length - failed} of ${todo.length} done, ${failed} failed. ` +
    `${mb(wavTotal)} of WAV now streams as ${mb(previewTotal)}.`,
);
process.exit(failed ? 1 : 0);

import type { CloudBeat } from "@/lib/velta-cloud";

/**
 * Whole AAC copies fetched before anyone presses play, the way wavs.com does it: when the click
 * comes, the file is already in memory and starts at once instead of waiting on the server.
 * Requests go without a Range header, which is also what lets Vercel's CDN keep the reply, so
 * the next listener near the same edge gets it from there.
 *
 * WAVs are never prefetched (up to 60 MB), and nothing is fetched when the browser says data is
 * scarce (Save-Data, 2G).
 */

const MAX_ENTRIES = 6;
const MAX_BYTES = 48 * 1024 * 1024;
const MAX_RUNNING = 2;

type Entry = {
  controller: AbortController;
  /** Asked for by a listener (hover, press, next up), not just because it is near the top. */
  wanted: boolean;
  startedAt: number;
  usedAt: number;
  blob: Blob | null;
};

const entries = new Map<string, Entry>();

export function audioUrl(beat: CloudBeat) {
  // The token changes when the streamed file does, which is what lets browsers and the CDN keep it.
  const version = beat.audio ? `?v=${encodeURIComponent(beat.audio.token)}` : "";
  return `/api/velta-cloud/beats/${encodeURIComponent(beat.id)}/audio${version}`;
}

export function canPrefetch(beat: CloudBeat | null | undefined) {
  if (typeof window === "undefined" || beat?.audio?.stream !== "aac") return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (connection?.saveData) return false;
  // Not 3G: Chrome rates a fast link "3g" when the round trip is long (Asia to US servers).
  return !/2g/.test(connection?.effectiveType ?? "");
}

function inFlight() {
  return [...entries.entries()].filter(([, entry]) => !entry.blob);
}

/** Drop the least recently used finished files beyond the count and size budget. */
function trim() {
  const finished = [...entries.entries()]
    .filter(([, entry]) => entry.blob)
    .sort(([, a], [, b]) => b.usedAt - a.usedAt);
  let bytes = 0;
  finished.forEach(([url, entry], index) => {
    bytes += entry.blob?.size ?? 0;
    if (index >= MAX_ENTRIES || bytes > MAX_BYTES) entries.delete(url);
  });
}

/**
 * Start fetching a beat's AAC copy if it isn't here or on its way. `wanted` marks a listener's
 * intent; such a fetch may push out one that only started because the beat is near the top.
 */
export function prefetchAudio(beat: CloudBeat | null | undefined, wanted = false) {
  if (!beat || !canPrefetch(beat)) return;
  const url = audioUrl(beat);
  const known = entries.get(url);
  if (known) {
    known.usedAt = Date.now();
    known.wanted ||= wanted;
    return;
  }
  const running = inFlight();
  if (running.length >= MAX_RUNNING) {
    const idle = running.find(([, entry]) => !entry.wanted);
    if (!wanted || !idle) return;
    idle[1].controller.abort();
    entries.delete(idle[0]);
  }

  const entry: Entry = {
    controller: new AbortController(),
    wanted,
    startedAt: Date.now(),
    usedAt: Date.now(),
    blob: null,
  };
  entries.set(url, entry);
  void (async () => {
    try {
      const response = await fetch(url, { signal: entry.controller.signal, priority: "low" } as RequestInit);
      // Anything but the whole file (an older server answers 206) is no use to keep.
      if (response.status !== 200) {
        void response.body?.cancel();
        return;
      }
      entry.blob = await response.blob();
      trim();
    } catch {
      // aborted or offline: the click streams instead
    } finally {
      if (!entry.blob && entries.get(url) === entry) entries.delete(url);
    }
  })();
}

/**
 * The beat's whole file if it has fully arrived. A fetch still under way is stopped so the
 * stream the player starts instead has the connection to itself.
 */
export function takePrefetched(beat: CloudBeat): Blob | null {
  const url = audioUrl(beat);
  const entry = entries.get(url);
  if (!entry) return null;
  if (entry.blob) {
    entry.usedAt = Date.now();
    return entry.blob;
  }
  entry.controller.abort();
  entries.delete(url);
  return null;
}

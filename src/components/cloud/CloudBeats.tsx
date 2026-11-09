"use client";

import { format } from "date-fns";
import { Loader2, Pause, Play, RefreshCw, VolumeX } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Wrapper from "@/components/global/wrapper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib";
import type { CloudBeat, CloudListing } from "@/lib/velta-cloud";
import { prefetchAudio } from "./audioPrefetch";
import { CloudPlayerBar } from "./CloudPlayerBar";
import { useCloudPlayer, type Playback } from "./useCloudPlayer";

type Filter = "beats" | "playable";

const REFRESH_ON_FOCUS_AFTER_MS = 30_000;

const FILTERS: { id: Filter; label: string; empty: string }[] = [
  { id: "beats", label: "Beats", empty: "No beats here yet." },
  { id: "playable", label: "With audio", empty: "No beats with audio yet." },
];

function savedDate(iso: string | null) {
  return iso ? format(new Date(iso), "MMM d, yyyy") : "";
}

function beatDetails(beat: CloudBeat) {
  return [
    beat.number !== null ? `#${beat.number}` : null,
    beat.bpm !== null ? `${beat.bpm} BPM` : null,
    beat.musicalKey,
  ]
    .filter(Boolean)
    .join(" · ");
}

function audioLabel(beat: CloudBeat, failed: boolean): ReactNode {
  if (!beat.audio) return "No audio";
  if (failed) return "Couldn't load audio";
  if (beat.audio.olderSaveAt) return `Audio from ${format(new Date(beat.audio.olderSaveAt), "MMM d")} save`;
  const megabytes = beat.audio.sizeBytes ? Math.round(beat.audio.sizeBytes / 1e6) : null;
  if (beat.audio.stream === "wav") return megabytes ? `WAV · ${megabytes} MB` : "WAV";
  // Plays the AAC copy; the WAV master stays in Velta Cloud.
  return (
    <>
      AAC 256
      <span className="hidden sm:inline">{megabytes ? ` · WAV ${megabytes} MB` : " · WAV"}</span>
    </>
  );
}

/** A pointer that rests this long on a row is likely to press play there. */
const HOVER_PREFETCH_MS = 150;
/** Beats at the top of the list fetched as soon as it shows: the likeliest first plays. */
const PREFETCH_TOP = 2;

function BeatRow({
  beat,
  isCurrent,
  playback,
  failed,
  onToggle,
}: {
  beat: CloudBeat;
  isCurrent: boolean;
  playback: Playback;
  failed: boolean;
  onToggle: (beat: CloudBeat) => void;
}) {
  const isPlaying = isCurrent && playback === "playing";
  const isLoading = isCurrent && playback === "loading";
  const details = beatDetails(beat);
  const date = savedDate(beat.savedAt);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  return (
    <li
      className={cn(
        "grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 px-2 py-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_7rem_10rem] sm:gap-4",
        isCurrent && "rounded-lg bg-zinc-900",
      )}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => prefetchAudio(beat, true), HOVER_PREFETCH_MS);
      }}
      onPointerLeave={() => clearTimeout(hoverTimer.current)}
      // Touch has no hover: the press itself is the earliest sign.
      onPointerDown={() => prefetchAudio(beat, true)}
    >
      {beat.audio ? (
        <button
          type="button"
          onClick={() => onToggle(beat)}
          aria-label={`${isPlaying || isLoading ? "Pause" : "Play"} ${beat.title}`}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isCurrent
              ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-400"
              : "border-zinc-700 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800",
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" />
          )}
        </button>
      ) : (
        <span className="inline-flex h-10 w-10 items-center justify-center text-zinc-600">
          <VolumeX className="h-4 w-4" aria-hidden />
        </span>
      )}

      <div className="min-w-0">
        <p className={cn("truncate text-sm font-medium", !beat.audio && "text-zinc-400")} title={beat.fullName}>
          {beat.title}
        </p>
        <p className="truncate text-xs text-zinc-400">
          {details}
          {date ? <span className="sm:hidden">{details ? ` · ${date}` : date}</span> : null}
        </p>
      </div>

      <time dateTime={beat.savedAt ?? undefined} className="hidden text-xs tabular-nums text-zinc-400 sm:block">
        {date}
      </time>

      <p className={cn("text-right text-xs tabular-nums", failed ? "text-red-400" : "text-zinc-400")}>
        {audioLabel(beat, failed)}
      </p>
    </li>
  );
}

export function CloudBeats() {
  const [beats, setBeats] = useState<CloudBeat[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(true);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [filter, setFilter] = useState<Filter>("beats");
  const lastLoadRef = useRef(0);

  /** `fresh` (the Refresh button) skips the edge's copy of the list. */
  const fetchBeats = useCallback(async (fresh = false) => {
    lastLoadRef.current = Date.now();
    try {
      // Default cache mode: "no-store" would ask the edge to skip its copy too.
      const response = await fetch(fresh ? `/api/velta-cloud/beats?fresh=${Date.now()}` : "/api/velta-cloud/beats");
      const body = (await response.json().catch(() => null)) as (Partial<CloudListing> & { error?: string }) | null;
      if (!response.ok || !body?.beats) {
        setLoadError(body?.error ?? `This site answered ${response.status}`);
        return;
      }
      setBeats(body.beats);
      setCheckedAt(body.checkedAt ? new Date(body.checkedAt) : new Date());
      setLoadError(null);
    } catch {
      setLoadError("Could not reach this site");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(
    (fresh = true) => {
      setRefreshing(true);
      void fetchBeats(fresh);
    },
    [fetchBeats],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetchBeats only sets state after its await.
    void fetchBeats();
    const refreshIfStale = () => {
      if (Date.now() - lastLoadRef.current > REFRESH_ON_FOCUS_AFTER_MS) refresh(false);
    };
    window.addEventListener("focus", refreshIfStale);
    return () => window.removeEventListener("focus", refreshIfStale);
  }, [fetchBeats, refresh]);

  const playable = useMemo(() => (beats ?? []).filter((beat) => beat.audio !== null), [beats]);
  const visible = filter === "playable" ? playable : (beats ?? []);
  const player = useCloudPlayer(playable);

  useEffect(() => {
    // After the list has painted, so the fetches don't compete with the page itself.
    const timer = setTimeout(() => playable.slice(0, PREFETCH_TOP).forEach((beat) => prefetchAudio(beat)), 300);
    return () => clearTimeout(timer);
  }, [playable]);

  const counts: Record<Filter, number> = { beats: beats?.length ?? 0, playable: playable.length };
  const emptyMessage = FILTERS.find((item) => item.id === filter)?.empty;
  const someWithoutAudio = filter === "beats" && visible.length > playable.length;

  return (
    <Wrapper className="py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium md:text-4xl">
            Velta <span className="font-subheading italic">Cloud</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400" aria-live="polite">
            {beats ? `Newest save first. ${counts.playable} of ${counts.beats} beats have audio.` : "Beats saved from Velta."}
            {checkedAt ? ` Checked ${format(checkedAt, "HH:mm:ss")}.` : ""}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refresh()} disabled={refreshing}>
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} aria-hidden />
          {refreshing ? "Checking" : "Refresh"}
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-1" role="group" aria-label="Filter beats">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "h-9 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter === item.id ? "bg-zinc-800 text-zinc-50" : "text-zinc-400 hover:text-zinc-100",
            )}
          >
            {item.label}
            {beats ? <span className="ml-1.5 tabular-nums text-zinc-500">{counts[item.id]}</span> : null}
          </button>
        ))}
      </div>

      {loadError ? (
        <div role="alert" className="mt-4 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm">
          <p className="text-red-300">
            {loadError}.{" "}
            {beats && checkedAt ? `Showing the list from ${format(checkedAt, "HH:mm:ss")}.` : "Try again in a moment."}
          </p>
          <button type="button" onClick={() => refresh()} className="mt-1 text-zinc-200 underline underline-offset-2">
            Try again
          </button>
        </div>
      ) : null}

      {someWithoutAudio ? (
        <p className="mt-4 max-w-2xl text-sm text-zinc-400">
          Beats marked No audio don&apos;t have a recording uploaded yet.
        </p>
      ) : null}

      {!beats && refreshing ? (
        <p className="mt-8 text-sm text-zinc-400">Loading beats from Velta Cloud.</p>
      ) : beats && visible.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-400">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-900">
          {visible.map((beat) => (
            <BeatRow
              key={beat.id}
              beat={beat}
              isCurrent={player.current?.id === beat.id}
              playback={player.playback}
              failed={player.failedIds.has(beat.id)}
              onToggle={player.toggle}
            />
          ))}
        </ul>
      )}

      <audio {...player.audioProps} />
      <CloudPlayerBar
        audioRef={player.audioRef}
        beat={player.current}
        playback={player.playback}
        previous={player.previous}
        next={player.next}
        onToggle={player.toggle}
        onStart={player.start}
      />
    </Wrapper>
  );
}

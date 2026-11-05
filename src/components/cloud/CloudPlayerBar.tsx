"use client";

import { Loader2, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";
import type { CloudBeat } from "@/lib/velta-cloud";
import type { Playback } from "./useCloudPlayer";

type CloudPlayerBarProps = {
  audioRef: RefObject<HTMLAudioElement | null>;
  beat: CloudBeat | null;
  playback: Playback;
  previous: CloudBeat | null;
  next: CloudBeat | null;
  onToggle: (beat: CloudBeat) => void;
  onStart: (beat: CloudBeat) => void;
};

function clock(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

const TRANSPORT_BUTTON =
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:text-zinc-700 disabled:hover:bg-transparent";

export function CloudPlayerBar({ audioRef, beat, playback, previous, next, onToggle, onStart }: CloudPlayerBarProps) {
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubbing, setScrubbing] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const syncPosition = () => setPosition(audio.currentTime);
    const syncDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const reset = () => {
      setPosition(0);
      setDuration(0);
    };
    audio.addEventListener("timeupdate", syncPosition);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("emptied", reset);
    return () => {
      audio.removeEventListener("timeupdate", syncPosition);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("emptied", reset);
    };
  }, [audioRef]);

  if (!beat) return null;

  function commitSeek() {
    if (scrubbing !== null && audioRef.current) audioRef.current.currentTime = scrubbing;
    setScrubbing(null);
  }

  function changeVolume(value: number) {
    setVolume(value);
    if (audioRef.current) audioRef.current.volume = value;
  }

  const shownPosition = scrubbing ?? position;
  const isLoading = playback === "loading";
  const isPlaying = playback === "playing";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl md:inset-x-2 md:bottom-2 md:rounded-b-2xl md:border">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:flex-nowrap md:gap-6 md:px-12">
        <div className="min-w-0 flex-1 md:w-56 md:flex-none">
          <p className="truncate text-sm font-medium" title={beat.fullName}>
            {beat.title}
          </p>
          <p className="truncate text-xs text-zinc-400" aria-live="polite">
            {playback === "failed"
              ? "Couldn't load this audio"
              : isLoading
                ? "Loading audio"
                : beat.bpm
                  ? `${beat.bpm} BPM`
                  : "Velta Cloud"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className={TRANSPORT_BUTTON}
            disabled={!previous}
            onClick={() => previous && onStart(previous)}
            aria-label="Previous beat"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggle(beat)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={isPlaying || isLoading ? "Pause" : "Play"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            className={TRANSPORT_BUTTON}
            disabled={!next}
            onClick={() => next && onStart(next)}
            aria-label="Next beat"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="flex w-full min-w-0 items-center gap-3 md:w-auto md:flex-1">
          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-zinc-400">{clock(shownPosition)}</span>
          <input
            type="range"
            aria-label="Seek"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(shownPosition, duration || 0)}
            disabled={!duration}
            onChange={(event) => setScrubbing(Number(event.target.value))}
            onPointerUp={commitSeek}
            onKeyUp={commitSeek}
            className="h-1.5 min-w-0 flex-1 cursor-pointer accent-blue-500 disabled:cursor-default"
          />
          <span className="w-10 shrink-0 text-xs tabular-nums text-zinc-400">{clock(duration)}</span>
        </div>

        <div className="hidden w-28 shrink-0 items-center gap-2 md:flex">
          <Volume2 className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
          <input
            type="range"
            aria-label="Volume"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => changeVolume(Number(event.target.value))}
            className="h-1.5 min-w-0 flex-1 cursor-pointer accent-zinc-300"
          />
        </div>
      </div>
    </div>
  );
}

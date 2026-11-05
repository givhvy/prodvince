"use client";

import { useCallback, useRef, useState } from "react";
import type { CloudBeat } from "@/lib/velta-cloud";

export type Playback = "idle" | "loading" | "playing" | "paused" | "failed";

/** Drives one <audio> element through `queue`, the playable beats in the order on screen. */
export function useCloudPlayer(queue: CloudBeat[]) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<CloudBeat | null>(null);
  const [playback, setPlayback] = useState<Playback>("idle");
  const [failedIds, setFailedIds] = useState<ReadonlySet<string>>(new Set());

  const playElement = useCallback((audio: HTMLAudioElement) => {
    audio.play().catch((error: unknown) => {
      // Only a blocked autoplay lands here with nothing else to report: load failures reach
      // handleError through the element's error event, and a new pick aborts the old play().
      if (error instanceof DOMException && error.name === "NotAllowedError") setPlayback("paused");
    });
  }, []);

  const start = useCallback(
    (beat: CloudBeat) => {
      const audio = audioRef.current;
      if (!audio) return;
      setCurrent(beat);
      setPlayback("loading");
      setFailedIds((ids) => {
        const next = new Set(ids);
        next.delete(beat.id);
        return next;
      });
      audio.src = `/api/velta-cloud/beats/${encodeURIComponent(beat.id)}/audio`;
      playElement(audio);
    },
    [playElement],
  );

  const toggle = useCallback(
    (beat: CloudBeat) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (beat.id !== current?.id || playback === "failed") {
        start(beat);
      } else if (audio.paused) {
        playElement(audio);
      } else {
        audio.pause();
      }
    },
    [current?.id, playElement, playback, start],
  );

  const currentIndex = current ? queue.findIndex((beat) => beat.id === current.id) : -1;
  const previous = currentIndex > 0 ? queue[currentIndex - 1] : null;
  const next = currentIndex >= 0 ? (queue[currentIndex + 1] ?? null) : null;

  const handleError = useCallback(() => {
    if (!current) return;
    const failedId = current.id;
    setFailedIds((ids) => new Set(ids).add(failedId));
    setPlayback("failed");
  }, [current]);

  const handleEnded = useCallback(() => {
    if (next) start(next);
    else setPlayback("paused");
  }, [next, start]);

  return {
    current,
    playback,
    failedIds,
    previous,
    next,
    start,
    toggle,
    audioRef,
    audioProps: {
      ref: audioRef,
      preload: "none" as const,
      onPlaying: () => setPlayback("playing"),
      onPause: (event: React.SyntheticEvent<HTMLAudioElement>) => {
        // A failed load also fires pause; keep the failure on screen.
        if (!event.currentTarget.ended) setPlayback((state) => (state === "failed" ? state : "paused"));
      },
      onWaiting: () => setPlayback("loading"),
      onEnded: handleEnded,
      onError: handleError,
    },
  };
}

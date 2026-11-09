"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CloudBeat } from "@/lib/velta-cloud";
import { audioUrl, prefetchAudio, takePrefetched } from "./audioPrefetch";

export type Playback = "idle" | "loading" | "playing" | "paused" | "failed";

/** Drives one <audio> element through `queue`, the playable beats in the order on screen. */
export function useCloudPlayer(queue: CloudBeat[]) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<CloudBeat | null>(null);
  const [playback, setPlayback] = useState<Playback>("idle");
  const [failedIds, setFailedIds] = useState<ReadonlySet<string>>(new Set());
  /** Set while the element plays a prefetched file from memory rather than the stream. */
  const objectUrlRef = useRef<string | null>(null);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }, []);

  useEffect(() => releaseObjectUrl, [releaseObjectUrl]);

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
      // A prefetched file plays at once; anything else streams. Decided here, in the click,
      // so play() still counts as started by the listener.
      const previousObjectUrl = objectUrlRef.current;
      const prefetched = takePrefetched(beat);
      objectUrlRef.current = prefetched ? URL.createObjectURL(prefetched) : null;
      audio.src = objectUrlRef.current ?? audioUrl(beat);
      if (previousObjectUrl) URL.revokeObjectURL(previousObjectUrl);
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
    const audio = audioRef.current;
    // A file from memory that won't play gets one more try as the stream before it counts as failed.
    if (audio && objectUrlRef.current) {
      releaseObjectUrl();
      audio.src = audioUrl(current);
      playElement(audio);
      return;
    }
    const failedId = current.id;
    setFailedIds((ids) => new Set(ids).add(failedId));
    setPlayback("failed");
  }, [current, playElement, releaseObjectUrl]);

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
      onPlaying: () => {
        setPlayback("playing");
        // Next up starts at once too, whether it comes from the end of this one or the next button.
        prefetchAudio(next, true);
      },
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

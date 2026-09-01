"use client";

import Image from "next/image";
import { Pause, Play, X } from "lucide-react";
import { cn } from "@/lib";
import { designImage } from "@/lib/design-images";
import { usePlayer } from "@/components/player/PlayerProvider";

export function AudioPlayerBar({ inset = false }: { inset?: boolean }) {
  const { currentBeat, isPlaying, togglePlayback, stop } = usePlayer();
  if (!currentBeat) return null;

  return (
    <div
      className={cn(
        "fixed z-50 border-t border-border bg-background/95 backdrop-blur-xl",
        inset
          ? "inset-x-0 bottom-0 md:inset-x-2 md:bottom-2 md:rounded-b-2xl md:border"
          : "inset-x-0 bottom-0",
      )}
    >
      <div className="mx-auto flex max-w-screen-xl items-center gap-4 px-4 py-3 md:px-12">
        {currentBeat.coverImageUrl ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={designImage(currentBeat.coverImageUrl, 96)}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className={cn("h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br", currentBeat.coverGradient)} />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{currentBeat.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {currentBeat.sellerName} · {currentBeat.bpm} BPM
          </p>
        </div>
        <button
          type="button"
          onClick={togglePlayback}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <button type="button" onClick={stop} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

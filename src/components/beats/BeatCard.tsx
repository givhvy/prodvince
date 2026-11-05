"use client";

import Link from "next/link";
import { BadgeCheck, Heart, Play } from "lucide-react";
import { BeatCover } from "@/components/beats/BeatCover";
import { BeatWaveform } from "@/components/beats/BeatWaveform";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib";
import { formatCount, productKindLabel, sellerInitials } from "@/lib/format";
import type { Beat } from "@/types";
import { usePlayer } from "@/components/player/PlayerProvider";

type BeatCardProps = {
  beat: Beat;
  rank?: number;
  compact?: boolean;
  className?: string;
  priorityImage?: boolean;
};

function SellerAvatar({ name, gradient }: { name: string; gradient: string }) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white",
        gradient,
      )}
    >
      {sellerInitials(name)}
    </span>
  );
}

export function BeatCard({ beat, rank, compact, className, priorityImage }: BeatCardProps) {
  const { playBeat } = usePlayer();
  const lowestPrice = Math.min(...beat.licenses.map((license) => license.price));

  if (compact) {
    return (
      <article
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/60 hover:border-white/14",
          className,
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <BeatCover
            beat={beat}
            className="absolute inset-0 h-full w-full"
            priority={priorityImage}
            imageWidth={400}
            sizes="(max-width: 640px) 82vw, (max-width: 1280px) 50vw, 25vw"
          />
          {typeof rank === "number" ? (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
              #{rank}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => playBeat(beat)}
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/35"
            aria-label={`Preview ${beat.title}`}
          >
            <span className="flex h-11 w-11 scale-90 items-center justify-center rounded-full bg-white text-zinc-950 opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100">
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            </span>
          </button>
        </div>
        <div className="space-y-1.5 p-3 text-left">
          <Link
            href={`/beats/${beat.slug}`}
            className="line-clamp-2 text-sm font-semibold leading-snug hover:text-sky-400"
          >
            {beat.title}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{beat.sellerName}</span>
            {beat.sellerVerified ? <BadgeCheck className="h-3.5 w-3.5 text-sky-500" /> : null}
          </div>
          <p className="text-sm font-semibold tabular-nums">${lowestPrice.toFixed(2)}</p>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/50 hover:border-white/14",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden">
        <BeatCover
          beat={beat}
          className="absolute inset-0 h-full w-full"
          priority={priorityImage}
          imageWidth={480}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {typeof rank === "number" ? (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
            #{rank}
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => playBeat(beat)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/35"
          aria-label={`Preview ${beat.title}`}
        >
          <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-white text-zinc-950 opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 pb-3 pt-12">
          <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-white/90">
            <span className="rounded-md bg-black/70 px-2 py-0.5 tabular-nums">
              {beat.bpm} BPM · {beat.key}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5">
              <Heart className="h-3 w-3" />
              {formatCount(beat.likes)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div className="space-y-2">
          <Link
            href={`/beats/${beat.slug}`}
            className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight hover:text-sky-400"
          >
            {beat.title}
          </Link>
          {beat.kind !== "beat" ? (
            <p className="text-[10px] font-medium uppercase tracking-wide text-sky-400">
              {productKindLabel(beat.kind)}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <SellerAvatar name={beat.sellerName} gradient={beat.coverGradient} />
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{beat.sellerName}</p>
              <p className="text-[11px] tabular-nums text-muted-foreground/80">
                {formatCount(beat.plays)} plays
              </p>
            </div>
            {beat.sellerVerified ? (
              <BadgeCheck className="ml-auto h-3.5 w-3.5 shrink-0 text-sky-500" />
            ) : null}
          </div>
        </div>

        <BeatWaveform seed={beat.id} />

        <div className="flex flex-wrap gap-1.5">
          {beat.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-white/[0.06] pt-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              From
            </p>
            <p className="text-base font-semibold tabular-nums">${lowestPrice.toFixed(2)}</p>
          </div>
          <Link href={`/checkout/${beat.slug}?tier=mp3`}>
            <Button size="sm" variant="primary" className="h-8 px-3 text-xs">
              Buy lease
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

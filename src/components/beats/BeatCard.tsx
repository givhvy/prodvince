"use client";

import Link from "next/link";
import { BadgeCheck, Heart, Play } from "lucide-react";
import { BeatCover } from "@/components/beats/BeatCover";
import { cn } from "@/lib";
import type { Beat } from "@/types";
import { usePlayer } from "@/components/player/PlayerProvider";

type BeatCardProps = {
  beat: Beat;
  rank?: number;
  compact?: boolean;
  className?: string;
  priorityImage?: boolean;
};

export function BeatCard({ beat, rank, compact, className, priorityImage }: BeatCardProps) {
  const { playBeat } = usePlayer();
  const lowestPrice = Math.min(...beat.licenses.map((license) => license.price));

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-colors hover:border-border lg:rounded-3xl",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden", compact ? "aspect-[4/3]" : "aspect-square")}>
        <BeatCover beat={beat} className="absolute inset-0 h-full w-full" priority={priorityImage} />
        {typeof rank === "number" ? (
          <span className="absolute left-3 top-3 rounded-full border border-border/60 bg-background/70 px-2 py-1 text-xs font-semibold backdrop-blur-sm">
            #{rank}
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => playBeat(beat)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30"
          aria-label={`Preview ${beat.title}`}
        >
          <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-foreground text-background opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
            <Play className="ml-0.5 h-5 w-5" />
          </span>
        </button>
      </div>

      <div className="space-y-2 p-4 text-left">
        <Link
          href={`/beats/${beat.slug}`}
          className="block line-clamp-2 text-left text-sm font-semibold leading-5 hover:text-blue-400"
        >
          {beat.title}
        </Link>
        <div className="flex items-center justify-start gap-1 text-left text-xs text-muted-foreground">
          <span>{beat.sellerName}</span>
          {beat.sellerVerified ? <BadgeCheck className="h-3.5 w-3.5 text-blue-500" /> : null}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">${lowestPrice.toFixed(2)}</span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3.5 w-3.5" />
            {beat.likes.toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  );
}

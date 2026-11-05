"use client";

import type { BentoItem } from "@/components/ui/bento-grid";
import { BentoGrid } from "@/components/ui/bento-grid";
import type { HoverEffectItem } from "@/components/ui/hover-effect";
import { HoverEffect } from "@/components/ui/hover-effect";
import { GENRE_IMAGES } from "@/lib/design-images";
import { GENRE_CONFIG, type GenreEntry } from "@/lib/genres";
import { Mic2 } from "lucide-react";

function buildBentoItems(entries: GenreEntry[]): BentoItem[] {
  return entries.map(({ genre, description, tag, featured, count, href }) => {
    const Icon = GENRE_CONFIG[genre]?.icon ?? Mic2;

    return {
      title: genre,
      description,
      href,
      icon: <Icon className="size-4 text-blue-400" />,
      meta: `${count} beat${count === 1 ? "" : "s"}`,
      status: tag,
      tags: count > 0 ? ["Whop checkout", "Instant license"] : undefined,
      colSpan: featured ? 2 : 1,
      hasPersistentHover: featured,
      backgroundImage: GENRE_IMAGES[genre],
    };
  });
}

function buildHoverItems(entries: GenreEntry[]): HoverEffectItem[] {
  return entries.map(({ genre, description, count, href }) => ({
    title: genre,
    description,
    link: href,
    meta: `${count} beat${count === 1 ? "" : "s"}`,
    backgroundImage: GENRE_IMAGES[genre],
  }));
}

export function GenreBentoGrid({ entries }: { entries: GenreEntry[] }) {
  return <BentoGrid items={buildBentoItems(entries)} />;
}

export function GenreHoverList({ entries }: { entries: GenreEntry[] }) {
  return <HoverEffect items={buildHoverItems(entries)} />;
}

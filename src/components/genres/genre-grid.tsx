"use client";

import type { BentoItem } from "@/components/ui/bento-grid";
import { BentoGrid } from "@/components/ui/bento-grid";
import type { HoverEffectItem } from "@/components/ui/hover-effect";
import { HoverEffect } from "@/components/ui/hover-effect";
import { GENRE_IMAGES } from "@/lib/design-images";
import { getGenreEntries } from "@/lib/genres";

function buildBentoItems(): BentoItem[] {
  return getGenreEntries().map(({ genre, config, count, href }) => {
    const Icon = config.icon;

    return {
      title: genre,
      description: config.description,
      href,
      icon: <Icon className="size-4 text-blue-400" />,
      meta: `${count} beat${count === 1 ? "" : "s"}`,
      status: config.tag,
      tags: count > 0 ? ["Whop checkout", "Instant license"] : undefined,
      colSpan: config.featured ? 2 : 1,
      hasPersistentHover: config.featured,
      backgroundImage: GENRE_IMAGES[genre],
    };
  });
}

function buildHoverItems(): HoverEffectItem[] {
  return getGenreEntries().map(({ genre, config, count, href }) => ({
    title: genre,
    description: config.description,
    link: href,
    meta: `${count} beat${count === 1 ? "" : "s"}`,
    backgroundImage: GENRE_IMAGES[genre],
  }));
}

export function GenreBentoGrid() {
  return <BentoGrid items={buildBentoItems()} />;
}

export function GenreHoverList() {
  return <HoverEffect items={buildHoverItems()} />;
}

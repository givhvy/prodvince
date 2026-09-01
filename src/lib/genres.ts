import type { LucideIcon } from "lucide-react";
import { Disc3, Flame, Heart, Mic2, Sparkles } from "lucide-react";
import { getAllBeats } from "@/lib/catalog";

export type GenreConfig = {
  icon: LucideIcon;
  description: string;
  featured?: boolean;
  tag?: string;
};

export const GENRE_CONFIG: Record<string, GenreConfig> = {
  Trap: {
    icon: Flame,
    description: "Dark 808s, sliding hi-hats, and moody melodies ready for vocals.",
    featured: true,
    tag: "Trending",
  },
  "Hip Hop": {
    icon: Mic2,
    description: "Classic drum patterns and sample-driven beats for rap and freestyle.",
  },
  "R&B": {
    icon: Heart,
    description: "Smooth chords, slow tempos, and spacious mixes for singers.",
  },
  Soul: {
    icon: Sparkles,
    description: "Warm keys, live-feel drums, and nostalgic groove-driven instrumentals.",
  },
  "Boom Bap": {
    icon: Disc3,
    description: "Dusty drums, chopped samples, and golden-era hip hop energy.",
  },
};

export function getGenreEntries() {
  const beats = getAllBeats();
  const genres = [...new Set(beats.flatMap((beat) => beat.genres))].sort();

  return genres.map((genre) => {
    const config = GENRE_CONFIG[genre] ?? {
      icon: Mic2,
      description: `Discover ${genre.toLowerCase()} instrumentals on the marketplace.`,
    };
    const count = beats.filter((beat) => beat.genres.includes(genre)).length;
    const href = `/explore?genre=${encodeURIComponent(genre)}`;

    return {
      genre,
      config,
      count,
      href,
    };
  });
}

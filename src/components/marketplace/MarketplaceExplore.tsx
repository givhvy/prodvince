"use client";

import { useMemo, useState } from "react";
import { BeatCard } from "@/components/beats/BeatCard";
import {
  MarketplaceToolbar,
  type MarketplaceSort,
} from "@/components/marketplace/MarketplaceToolbar";
import type { Beat } from "@/types";
import type { MarketplaceKind } from "@/lib/product-kinds";

type MarketplaceExploreProps = {
  beats: Beat[];
  initialGenre?: string;
  initialKind?: MarketplaceKind;
};

function lowestPrice(beat: Beat) {
  return Math.min(...beat.licenses.map((license) => license.price));
}

export function MarketplaceExplore({ beats, initialGenre, initialKind }: MarketplaceExploreProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<MarketplaceSort>("trending");
  const [activeGenre, setActiveGenre] = useState(initialGenre ?? "all");
  const [activeKind, setActiveKind] = useState<MarketplaceKind>(initialKind ?? "all");

  const genres = useMemo(
    () => [...new Set(beats.flatMap((beat) => beat.genres))].sort(),
    [beats],
  );

  const filteredBeats = useMemo(() => {
    let list = [...beats];

    if (activeKind !== "all") {
      list = list.filter((beat) => beat.kind === activeKind);
    }

    if (activeGenre !== "all") {
      list = list.filter((beat) =>
        beat.genres.some((genre) => genre.toLowerCase() === activeGenre.toLowerCase()),
      );
    }

    const trimmed = query.trim().toLowerCase();
    if (trimmed) {
      list = list.filter(
        (beat) =>
          beat.title.toLowerCase().includes(trimmed) ||
          beat.sellerName.toLowerCase().includes(trimmed) ||
          beat.tags.some((tag) => tag.toLowerCase().includes(trimmed)) ||
          beat.genres.some((genre) => genre.toLowerCase().includes(trimmed)),
      );
    }

    switch (sort) {
      case "newest":
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "price-low":
        list.sort((a, b) => lowestPrice(a) - lowestPrice(b));
        break;
      case "price-high":
        list.sort((a, b) => lowestPrice(b) - lowestPrice(a));
        break;
      default:
        list.sort((a, b) => b.plays - a.plays);
    }

    return list;
  }, [activeGenre, activeKind, beats, query, sort]);

  return (
    <>
      <MarketplaceToolbar
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        genres={genres}
        activeGenre={activeGenre}
        onGenreChange={setActiveGenre}
        activeKind={activeKind}
        onKindChange={setActiveKind}
        resultCount={filteredBeats.length}
      />

      {filteredBeats.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.1] bg-zinc-900/30 px-6 py-16 text-center">
          <p className="text-base font-medium">No beats match your filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different genre or clear your search to browse the full catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBeats.map((beat, index) => (
            <BeatCard key={beat.id} beat={beat} priorityImage={index < 4} />
          ))}
        </div>
      )}
    </>
  );
}

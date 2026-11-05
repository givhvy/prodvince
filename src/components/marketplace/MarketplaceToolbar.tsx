"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib";
import { PRODUCT_KINDS, type MarketplaceKind } from "@/lib/product-kinds";

export type MarketplaceSort = "trending" | "newest" | "price-low" | "price-high";
export type { MarketplaceKind };
export { PRODUCT_KINDS };

type MarketplaceToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  sort: MarketplaceSort;
  onSortChange: (value: MarketplaceSort) => void;
  genres: string[];
  activeGenre: string;
  onGenreChange: (genre: string) => void;
  activeKind: MarketplaceKind;
  onKindChange: (kind: MarketplaceKind) => void;
  resultCount: number;
};

export function MarketplaceToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  genres,
  activeGenre,
  onGenreChange,
  activeKind,
  onKindChange,
  resultCount,
}: MarketplaceToolbarProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search beats, loops, MIDI, producers..."
            className="h-10 border-white/[0.08] bg-zinc-900/60 pl-9"
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-sm tabular-nums text-muted-foreground">
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </p>
          <Select value={sort} onValueChange={(value) => onSortChange(value as MarketplaceSort)}>
            <SelectTrigger className="h-10 w-[148px] border-white/[0.08] bg-zinc-900/60">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: low</SelectItem>
              <SelectItem value="price-high">Price: high</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PRODUCT_KINDS.map((kind) => (
          <GenreChip
            key={kind.id}
            label={kind.label}
            active={activeKind === kind.id}
            onClick={() => onKindChange(kind.id)}
          />
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <GenreChip
          label="All"
          active={activeGenre === "all"}
          onClick={() => onGenreChange("all")}
        />
        {genres.map((genre) => (
          <GenreChip
            key={genre}
            label={genre}
            active={activeGenre.toLowerCase() === genre.toLowerCase()}
            onClick={() => onGenreChange(genre)}
          />
        ))}
      </div>
    </div>
  );
}

function GenreChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition active:scale-[0.98]",
        active
          ? "border-sky-500/40 bg-sky-500/15 text-sky-300"
          : "border-white/[0.08] bg-zinc-900/40 text-muted-foreground hover:border-white/14 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

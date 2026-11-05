import type { ProductKind } from "@/types";

export type MarketplaceKind = "all" | ProductKind;

export const PRODUCT_KINDS: Array<{ id: MarketplaceKind; label: string }> = [
  { id: "all", label: "All" },
  { id: "beat", label: "Beats" },
  { id: "loop", label: "Loops" },
  { id: "midi", label: "MIDI" },
  { id: "drumkit", label: "Drum kits" },
  { id: "stems", label: "Stems" },
];

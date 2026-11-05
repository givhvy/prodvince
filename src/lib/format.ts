import type { ProductKind } from "@/types";

const KIND_LABEL: Record<ProductKind, string> = {
  beat: "Beat",
  loop: "Loop",
  midi: "MIDI",
  drumkit: "Drum kit",
  stems: "Stems",
};

export function productKindLabel(kind: ProductKind) {
  return KIND_LABEL[kind] ?? "Beat";
}

export function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 10_000) {
    return `${Math.round(value / 1000)}K`;
  }
  if (value >= 1_000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toLocaleString();
}

export function sellerInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

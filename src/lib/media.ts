import type { Beat } from "@/types";

export const MEDIA_BASE =
  process.env.R2_PUBLIC_URL?.replace(/\/$/, "") ?? "https://wavs.huy.global";

export const MEDIA_FALLBACK_BASE =
  process.env.R2_FALLBACK_PUBLIC_URL?.replace(/\/$/, "") ??
  "https://pub-5ef8d67300c44c55bf62d208c2663be4.r2.dev";

const DEMO_PREVIEWS: Record<string, string> = {
  beat_001:
    "https://stratum-cloud-api.vercel.app/api/cloud/preview-entry?id=cloud-trap-kit&path=Snare%2FSnare_SD_01.wav&offset=5377065&compSize=14650&method=8&size=22094",
  beat_002:
    "https://stratum-cloud-api.vercel.app/api/cloud/preview-entry?id=cloud-rnb-kit&path=Kick%2FKick_BD_01.wav&offset=1965675&compSize=10865&method=8&size=22096",
  beat_003:
    "https://stratum-cloud-api.vercel.app/api/cloud/preview-entry?id=cloud-dirt-drums&path=Hat%2F005_hh3kick1.wav&offset=888116&compSize=65361&method=8&size=81536",
  beat_004:
    "https://stratum-cloud-api.vercel.app/api/cloud/preview-entry?id=cloud-trap-kit&path=808%2F808_Sub_01.wav&offset=34&compSize=10895&method=8&size=22094",
};

export function previewR2Key(beat: Beat) {
  return `marketplace/previews/${beat.slug}.mp3`;
}

export function hydrateBeatMedia(beat: Beat): Beat {
  return {
    ...beat,
    previewUrl: beat.previewUrl ?? previewR2Key(beat),
    demoPreviewUrl: beat.demoPreviewUrl ?? DEMO_PREVIEWS[beat.id] ?? null,
  };
}

export function hydrateCatalogBeats(beats: Beat[]) {
  return beats.map(hydrateBeatMedia);
}

import { NextResponse } from "next/server";
import { getAllBeats, getProfiles, getReviews, getSubscriptionPlans, getUsageClips } from "@/lib/catalog";
import {
  hydrateCatalogBeats,
  MEDIA_BASE,
  MEDIA_FALLBACK_BASE,
} from "@/lib/media";

export async function GET(request: Request) {
  const webBase = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  return NextResponse.json(
    {
      app: "Velta",
      webBase,
      mediaBase: MEDIA_BASE,
      mediaFallbackBase: MEDIA_FALLBACK_BASE,
      beats: hydrateCatalogBeats(await getAllBeats()),
      clips: await getUsageClips(),
      profiles: await getProfiles(),
      reviews: await getReviews(),
      subscriptions: await getSubscriptionPlans(),
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=30",
      },
    },
  );
}

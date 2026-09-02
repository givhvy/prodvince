import { NextResponse } from "next/server";
import {
  createWhopCheckoutConfiguration,
  createWhopPlan,
  createWhopProduct,
  getWhopAccountId,
} from "@/lib/whop";
import { getAllBeats, updateBeatPlanId } from "@/lib/catalog";
import { getCurrentUser, canAccessStudio } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentUser();
  if (!user || !canAccessStudio(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accountId = getWhopAccountId();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const product = await createWhopProduct({
      accountId,
      title: "Velta Beat Marketplace",
      headline: "License beats instantly",
      description: "MP3, WAV, and exclusive beat licenses.",
      route: "velta-beats-marketplace",
    });

    const results: string[] = [`Product: ${product.id}`];

    for (const beat of getAllBeats()) {
      for (const license of beat.licenses) {
        const plan = await createWhopPlan({
          productId: product.id,
          title: `${beat.title} - ${license.label}`,
          initialPrice: license.price,
          metadata: {
            beat_id: beat.id,
            beat_slug: beat.slug,
            license_tier: license.tier,
          },
        });

        await createWhopCheckoutConfiguration({
          accountId,
          planId: plan.id,
          redirectUrl: `${appUrl}/checkout/complete?beat=${beat.slug}&tier=${license.tier}`,
          metadata: {
            beat_id: beat.id,
            license_tier: license.tier,
          },
        });

        updateBeatPlanId(beat.id, license.tier, plan.id);
        results.push(`${beat.slug} ${license.tier}: ${plan.id}`);
      }
    }

    return NextResponse.json({
      ok: true,
      message: results.join("\n"),
      productId: product.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Whop setup failed";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

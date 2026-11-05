import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fulfillPurchase, SaleError } from "@/lib/fulfillment";
import type { LicenseTier } from "@/types";

const tiers = new Set<LicenseTier>(["mp3", "wav", "exclusive"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const beatId = typeof body.beatId === "string" ? body.beatId : "";
  const tier = body.tier as LicenseTier;
  const receiptId = typeof body.receiptId === "string" ? body.receiptId.trim() : "";

  if (!beatId || !tiers.has(tier) || !receiptId) {
    return NextResponse.json({ error: "Missing purchase fields" }, { status: 400 });
  }

  try {
    const { sale, created } = await fulfillPurchase({
      userId: user.id,
      beatId,
      tier,
      paymentRef: receiptId,
    });
    return NextResponse.json({ ok: true, created, sale });
  } catch (error) {
    if (error instanceof SaleError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

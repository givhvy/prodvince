import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { recordPurchase } from "@/lib/catalog";
import type { LicenseTier } from "@/types";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const beatId = typeof body.beatId === "string" ? body.beatId : "";
  const tier = body.tier as LicenseTier;
  const receiptId = typeof body.receiptId === "string" ? body.receiptId : "";

  if (!beatId || !tier || !receiptId) {
    return NextResponse.json({ error: "Missing purchase fields" }, { status: 400 });
  }

  recordPurchase({
    id: `purchase_${Date.now()}`,
    userId: user.id,
    beatId,
    licenseTier: tier,
    whopReceiptId: receiptId,
    amount: 0,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

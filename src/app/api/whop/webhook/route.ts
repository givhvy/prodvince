import { NextResponse } from "next/server";
import { recordPurchase } from "@/lib/catalog";
import type { LicenseTier } from "@/types";

export async function POST(request: Request) {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  const signature = request.headers.get("x-whop-signature");

  if (secret && signature !== secret) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = await request.json().catch(() => ({}));
  const type = typeof event?.type === "string" ? event.type : "";
  const data = event?.data ?? {};

  if (type === "payment.succeeded" || type === "membership.created") {
    const metadata = data.metadata ?? {};
    const beatId = typeof metadata.beat_id === "string" ? metadata.beat_id : "";
    const tier = metadata.license_tier as LicenseTier | undefined;
    const userId = typeof metadata.user_id === "string" ? metadata.user_id : "user_demo_buyer";

    if (beatId && tier) {
      recordPurchase({
        id: `purchase_${data.id ?? Date.now()}`,
        userId,
        beatId,
        licenseTier: tier,
        whopReceiptId: String(data.id ?? ""),
        amount: Number(data.amount ?? 0),
        createdAt: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
}

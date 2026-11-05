import { NextResponse } from "next/server";
import { getUserFromAuthorization, publicUser } from "@/lib/auth";
import { getBeatById } from "@/lib/catalog";
import { fulfillPurchase, SaleError } from "@/lib/fulfillment";
import type { LicenseTier } from "@/types";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const beatId = typeof body.beatId === "string" ? body.beatId : "";
  const tier = body.tier as LicenseTier;
  const beat = await getBeatById(beatId);
  const license = beat?.licenses.find((item) => item.tier === tier);

  if (!beat || !license) {
    return NextResponse.json(
      { error: "Unknown beat or license" },
      { status: 404, headers: corsHeaders },
    );
  }

  const user = await getUserFromAuthorization(request);
  if (!user) {
    return NextResponse.json(
      { error: "Sign in required" },
      { status: 401, headers: corsHeaders },
    );
  }

  const paymentRef = typeof body.receiptId === "string" && body.receiptId.trim()
    ? body.receiptId.trim()
    : `ios_${crypto.randomUUID()}`;

  try {
    const { sale, created } = await fulfillPurchase({
      userId: user.id,
      beatId: beat.id,
      tier: license.tier,
      paymentRef,
    });

    return NextResponse.json(
      {
        ok: true,
        created,
        purchase: {
          id: sale.purchaseId,
          userId: user.id,
          beatId: beat.id,
          licenseTier: license.tier,
          whopReceiptId: sale.paymentRef,
          amount: sale.amount,
          createdAt: sale.purchasedAt,
        },
        user: publicUser(user),
        licenseNumber: sale.licenseNumber,
        receiptNumber: sale.receiptNumber,
        licenseUrl: `https://prodvince.com/licenses/${sale.licenseNumber}`,
        receiptUrl: `https://prodvince.com/receipts/${sale.receiptNumber}`,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    if (error instanceof SaleError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: corsHeaders });
    }
    throw error;
  }
}

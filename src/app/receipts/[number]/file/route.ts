import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canViewSale, getSaleByReceiptNumber, receiptPlainText } from "@/lib/fulfillment";

type RouteContext = { params: Promise<{ number: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { number } = await context.params;
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Sign in required", { status: 401 });

  const sale = await getSaleByReceiptNumber(number);
  if (!sale || !canViewSale(user, sale)) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(receiptPlainText(sale), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${sale.receiptNumber}.txt"`,
    },
  });
}

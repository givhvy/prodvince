import { notFound, redirect } from "next/navigation";
import { SaleDocument } from "@/components/commerce/SaleDocument";
import { getCurrentUser } from "@/lib/auth";
import { canViewSale, getSaleByReceiptNumber } from "@/lib/fulfillment";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/receipts/${number}`);

  const sale = await getSaleByReceiptNumber(number);
  if (!sale || !canViewSale(user, sale)) notFound();

  return <SaleDocument sale={sale} kind="receipt" />;
}

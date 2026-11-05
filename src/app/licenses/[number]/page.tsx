import { notFound, redirect } from "next/navigation";
import { SaleDocument } from "@/components/commerce/SaleDocument";
import { getCurrentUser } from "@/lib/auth";
import { canViewSale, getSaleByLicenseNumber } from "@/lib/fulfillment";

export default async function LicensePage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/licenses/${number}`);

  const sale = await getSaleByLicenseNumber(number);
  if (!sale || !canViewSale(user, sale)) notFound();

  return <SaleDocument sale={sale} kind="license" />;
}

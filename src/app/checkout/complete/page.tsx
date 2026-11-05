import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { canViewSale, getSaleByPurchaseId } from "@/lib/fulfillment";

type CompletePageProps = PageProps<"/checkout/complete">;

export default async function CheckoutCompletePage({ searchParams }: CompletePageProps) {
  const query = await searchParams;
  const saleId = typeof query.sale === "string" ? query.sale : "";
  const user = await getCurrentUser();
  const sale = user && saleId ? await getSaleByPurchaseId(saleId) : null;
  const visible = sale && user && canViewSale(user, sale) ? sale : null;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <CheckCircle2 className="h-14 w-14 text-success" />
      <h1 className="mt-6 text-3xl font-semibold">Purchase complete</h1>
      {visible ? (
        <>
          <p className="mt-3 text-muted">
            {visible.beatTitle} is licensed to {visible.licenseeName}. Your license and receipt are ready.
          </p>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            {visible.licenseNumber}
            <br />
            {visible.receiptNumber}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/licenses/${visible.licenseNumber}`}
              className="rounded-full bg-blue-500 px-5 py-3 text-sm font-medium text-white"
            >
              View license
            </Link>
            <Link
              href={`/receipts/${visible.receiptNumber}`}
              className="rounded-full border border-border px-5 py-3 text-sm"
            >
              View receipt
            </Link>
            <Link href="/library" className="rounded-full border border-border px-5 py-3 text-sm">
              Library
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-muted">
            Your license and receipt are saved to your library when checkout finishes.
          </p>
          <Link
            href="/library"
            className="mt-8 rounded-full bg-blue-500 px-5 py-3 text-sm font-medium text-white"
          >
            Open library
          </Link>
        </>
      )}
    </div>
  );
}

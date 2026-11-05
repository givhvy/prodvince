import Link from "next/link";
import { PaymentsClient } from "@/app/studio/payments/payments-client";
import { getCurrentUser } from "@/lib/auth";
import { listSalesForSeller } from "@/lib/fulfillment";

export default async function StudioPaymentsPage() {
  const user = await getCurrentUser();
  const sales = user ? await listSalesForSeller(user.id, user.role) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Whop payments</h2>
        <p className="mt-2 text-muted">
          Every paid checkout writes a license and a receipt. Live card payments still go through Whop.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-lg font-semibold">Sales</h3>
        </div>
        {sales.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">No licenses issued yet.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/30 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Beat</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">License</th>
                <th className="px-4 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.purchaseId} className="border-t border-border">
                  <td className="px-4 py-4">
                    <p className="font-medium">{sale.beatTitle}</p>
                    <p className="text-muted">{sale.tierLabel}</p>
                  </td>
                  <td className="px-4 py-4 text-muted">{sale.licenseeEmail}</td>
                  <td className="px-4 py-4">
                    <Link href={`/licenses/${sale.licenseNumber}`} className="text-accent">
                      {sale.licenseNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-4 tabular-nums">${sale.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PaymentsClient />
    </div>
  );
}

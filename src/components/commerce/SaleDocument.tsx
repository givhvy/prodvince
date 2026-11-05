import Link from "next/link";
import { PrintButton } from "@/components/commerce/PrintButton";
import type { Sale } from "@/types";

function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function SaleDocument({ sale, kind }: { sale: Sale; kind: "license" | "receipt" }) {
  const issued = new Date(sale.purchasedAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 print:max-w-none print:px-0 print:py-0">
      <article
        id="sale-document"
        className="rounded-2xl border border-zinc-200 bg-white p-8 text-zinc-900 shadow-sm print:rounded-none print:border-0 print:shadow-none sm:p-10"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Velta</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {kind === "license" ? "Beat license" : "Receipt"}
        </h1>
        <p className="mt-1 font-mono text-sm text-zinc-600">
          {kind === "license" ? sale.licenseNumber : sale.receiptNumber}
        </p>

        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Issued</dt>
            <dd className="mt-1 font-medium">{issued} UTC</dd>
          </div>
          <div>
            <dt className="text-zinc-500">{kind === "license" ? "Licensee" : "Billed to"}</dt>
            <dd className="mt-1 font-medium">
              {sale.licenseeName}
              <span className="block font-normal text-zinc-600">{sale.licenseeEmail}</span>
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Licensor</dt>
            <dd className="mt-1 font-medium">{sale.sellerName}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Beat</dt>
            <dd className="mt-1 font-medium">{sale.beatTitle}</dd>
          </div>
        </dl>

        {kind === "license" ? (
          <div className="mt-8 space-y-4 border-t border-zinc-200 pt-8 text-sm leading-6 text-zinc-800">
            <p>
              {sale.tierLabel} · {sale.fileFormat} · {sale.streamCap} · {sale.videoCap}
            </p>
            {sale.terms.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <table className="mt-8 w-full border-t border-zinc-200 text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="py-3 font-medium">Item</th>
                <th className="py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-zinc-100">
                <td className="py-4">
                  <p className="font-medium">{sale.beatTitle}</p>
                  <p className="text-zinc-600">{sale.tierLabel}</p>
                </td>
                <td className="py-4 text-right tabular-nums">{money(sale.amount)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-200">
                <td className="py-4 font-semibold">Paid</td>
                <td className="py-4 text-right text-base font-semibold tabular-nums">{money(sale.amount)}</td>
              </tr>
            </tfoot>
          </table>
        )}

        {kind === "receipt" ? (
          <div className="mt-6 space-y-1 text-sm text-zinc-600">
            <p>Payment reference: {sale.paymentRef}</p>
            <p>License: {sale.licenseNumber}</p>
            <p>Status: Paid</p>
          </div>
        ) : (
          <p className="mt-6 text-sm text-zinc-600">Fee paid: {money(sale.amount)}. Receipt {sale.receiptNumber}.</p>
        )}
      </article>

      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <PrintButton label="Save PDF" />
        <a
          href={kind === "license" ? `/licenses/${sale.licenseNumber}/file` : `/receipts/${sale.receiptNumber}/file`}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-100"
        >
          Download text
        </a>
        <Link
          href={kind === "license" ? `/receipts/${sale.receiptNumber}` : `/licenses/${sale.licenseNumber}`}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-100"
        >
          {kind === "license" ? "View receipt" : "View license"}
        </Link>
        <Link href="/library" className="rounded-full px-4 py-2 text-sm text-zinc-400">
          Library
        </Link>
      </div>
    </div>
  );
}

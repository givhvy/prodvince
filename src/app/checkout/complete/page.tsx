import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type CompletePageProps = PageProps<"/checkout/complete">;

export default async function CheckoutCompletePage({ searchParams }: CompletePageProps) {
  const query = await searchParams;
  const beatSlug = typeof query.beat === "string" ? query.beat : null;
  const status = typeof query.status === "string" ? query.status : "success";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <CheckCircle2 className="h-14 w-14 text-success" />
      <h1 className="mt-6 text-3xl font-semibold">
        {status === "success" ? "Purchase complete" : "Checkout update"}
      </h1>
      <p className="mt-3 text-muted">
        Your beat license is being added to your library. Whop will email your receipt.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/library"
          className="rounded-full bg-blue-500 px-5 py-3 text-sm font-medium text-white"
        >
          Open library
        </Link>
        {beatSlug ? (
          <Link
            href={`/beats/${beatSlug}`}
            className="rounded-full border border-border px-5 py-3 text-sm"
          >
            Back to beat
          </Link>
        ) : null}
      </div>
    </div>
  );
}

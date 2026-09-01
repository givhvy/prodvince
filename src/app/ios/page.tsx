import Link from "next/link";
import { Smartphone } from "lucide-react";

export default function IosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-border bg-card/60 p-8 sm:p-12">
        <Smartphone className="h-8 w-8 text-accent" />
        <h1 className="mt-6 text-3xl font-semibold">Velta Marketplace for iOS</h1>
        <p className="mt-4 max-w-2xl text-muted">
          The native iOS app lives in `VeltaMarketplace/` and shares the same catalog, purchases,
          and Whop checkout deep links. Android comes later.
        </p>
        <div className="mt-8 space-y-3 text-sm text-muted">
          <p>1. Web checkout completes via Whop embed or hosted link.</p>
          <p>2. Whop webhook grants entitlements in the shared API.</p>
          <p>3. iOS library tab reads `/api/purchases` for the signed-in user.</p>
        </div>
        <Link
          href="/explore"
          className="mt-8 inline-flex rounded-full bg-blue-500 px-5 py-3 text-sm font-medium text-white"
        >
          Browse on web
        </Link>
      </div>
    </div>
  );
}

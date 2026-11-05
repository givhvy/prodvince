import Link from "next/link";
import { Smartphone } from "lucide-react";

export default function IosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-border bg-card/60 p-8 sm:p-12">
        <Smartphone className="h-8 w-8 text-sky-400" />
        <h1 className="mt-6 text-3xl font-semibold">Velta for iOS</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          The native app in <code className="text-foreground">VeltaMarketplace/</code> mirrors
          this website: dark storefront, trending beats, license checkout on the web, and Studio
          for producers.
        </p>
        <div className="mt-8 space-y-3 text-sm text-muted-foreground">
          <p>1. Explore and search the same catalog as the web store.</p>
          <p>2. Buy lease opens Whop checkout on the website.</p>
          <p>3. Library and Studio stay in sync with your Velta account.</p>
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

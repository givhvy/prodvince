"use client";

import Link from "next/link";
import { BeatCover } from "@/components/beats/BeatCover";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { WhopCheckoutPanel } from "@/components/checkout/WhopCheckoutPanel";
import type { Beat, LicenseTier } from "@/types";

type CheckoutClientProps = {
  beat: Beat;
  tier: LicenseTier;
  userEmail?: string;
};

export function CheckoutClient({ beat, tier, userEmail }: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const license = beat.licenses.find((item) => item.tier === tier) ?? beat.licenses[0];
  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/checkout/complete?beat=${beat.slug}&tier=${license.tier}`
      : `/checkout/complete?beat=${beat.slug}&tier=${license.tier}`;

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-6xl gap-0 overflow-hidden rounded-3xl border border-border lg:grid-cols-[42%_58%]">
      <div className="border-b border-border bg-black/30 p-8 lg:border-b-0 lg:border-r">
        <Link href={`/beats/${beat.slug}`} className="text-sm text-muted hover:text-foreground">
          ← Back to beat
        </Link>
        <BeatCover beat={beat} className="mt-8 aspect-square max-w-xs rounded-3xl" sizes="320px" />
        <h1 className="mt-6 text-2xl font-semibold">{beat.title}</h1>
        <p className="mt-2 text-sm text-muted">{license.label}</p>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-4xl font-bold">${license.price.toFixed(2)}</span>
          <span className="text-muted">one-time</span>
        </div>
        <ul className="mt-8 space-y-3 text-sm">
          {[license.description, "Instant delivery to your library", "Secured by Whop"].map(
            (item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                  <Check className="h-3 w-3" />
                </span>
                {item}
              </li>
            ),
          )}
        </ul>
      </div>

      <div className="p-6 sm:p-10">
        <WhopCheckoutPanel
          planId={license.whopPlanId ?? ""}
          email={userEmail}
          returnUrl={returnUrl}
          onComplete={async (planId, receiptId) => {
            if (receiptId) {
              await fetch("/api/purchases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  beatId: beat.id,
                  tier: license.tier,
                  planId,
                  receiptId,
                }),
              });
            }
            router.push(
              `/checkout/complete?beat=${beat.slug}&tier=${license.tier}&status=success${receiptId ? `&receipt=${receiptId}` : ""}`,
            );
          }}
        />
      </div>
    </div>
  );
}

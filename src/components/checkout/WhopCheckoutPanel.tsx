"use client";

import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { Loader2 } from "lucide-react";

type WhopCheckoutPanelProps = {
  planId: string;
  email?: string;
  returnUrl: string;
  onComplete?: (planId: string, receiptId: string | undefined) => void;
};

export function WhopCheckoutPanel({ planId, email, returnUrl, onComplete }: WhopCheckoutPanelProps) {
  if (!planId) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Whop plan not configured. Run setup from Studio → Payments.
      </div>
    );
  }

  return (
    <WhopCheckoutEmbed
      planId={planId}
      theme="dark"
      prefill={email ? { email } : undefined}
      returnUrl={returnUrl}
      onComplete={onComplete}
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      }
      styles={{ container: { paddingTop: 0, paddingBottom: 12 } }}
    />
  );
}

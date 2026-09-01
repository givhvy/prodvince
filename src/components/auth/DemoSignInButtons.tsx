"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib";

export const DEMO_ACCOUNTS = {
  buyer: {
    email: "buyer@demo.local",
    label: "Buyer",
    description: "Browse, buy beats, library",
    redirect: "/explore",
  },
  seller: {
    email: "studio@velta.local",
    label: "Seller · Studio",
    description: "Demostack producer dashboard",
    redirect: "/studio",
  },
  admin: {
    email: "admin@velta.local",
    label: "Admin",
    description: "Full platform access",
    redirect: "/studio",
  },
} as const;

type DemoSignInButtonsProps = {
  redirectTo?: string;
  className?: string;
  layout?: "row" | "stack";
};

export function DemoSignInButtons({
  redirectTo = "/explore",
  className,
  layout = "row",
}: DemoSignInButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(account: (typeof DEMO_ACCOUNTS)[keyof typeof DEMO_ACCOUNTS]) {
    setError(null);
    setLoading(account.email);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: account.email }),
    });

    setLoading(null);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Unable to sign in");
      return;
    }

    const destination =
      account.email === DEMO_ACCOUNTS.buyer.email ? redirectTo : account.redirect;

    router.push(destination);
    router.refresh();
  }

  return (
    <div className={className}>
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Demo accounts
      </p>
      <div
        className={cn(
          "grid gap-2",
          layout === "row" ? "sm:grid-cols-3" : "grid-cols-1",
        )}
      >
        {Object.values(DEMO_ACCOUNTS).map((account) => (
          <button
            key={account.email}
            type="button"
            disabled={Boolean(loading)}
            onClick={() => signIn(account)}
            className={cn(
              "rounded-xl border border-border/70 bg-card/40 px-3 py-3 text-left transition hover:border-blue-500/40 hover:bg-card/70",
              account.email === DEMO_ACCOUNTS.seller.email && "border-blue-500/30 bg-blue-500/5",
              loading === account.email && "opacity-70",
            )}
          >
            <span className="block text-sm font-semibold">{account.label}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{account.description}</span>
          </button>
        ))}
      </div>
      {error ? <p className="mt-3 text-center text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

export function SellerStudioSignInButton({
  className,
  size = "lg",
}: {
  className?: string;
  size?: "lg" | "default" | "sm";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: DEMO_ACCOUNTS.seller.email }),
    });
    setLoading(false);
    if (response.ok) {
      router.push("/studio");
      router.refresh();
    }
  }

  return (
    <Button
      type="button"
      variant="primary"
      size={size}
      className={className}
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? "Opening Studio…" : "Sign in as seller · Open dashboard"}
    </Button>
  );
}

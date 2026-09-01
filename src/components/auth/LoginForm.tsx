"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AuthCheckboxLine,
  AuthDivider,
  AuthFieldBox,
  AuthFormShell,
} from "@/components/ui/auth-section-2";
import { DemoSignInButtons } from "@/components/auth/DemoSignInButtons";

const termsText = (
  <>
    By continuing, you agree to our{" "}
    <Link href="/pricing" className="font-medium text-foreground/70 underline underline-offset-2">
      Terms
    </Link>{" "}
    and{" "}
    <Link href="/ios" className="font-medium text-foreground/70 underline underline-offset-2">
      Privacy Policy
    </Link>
  </>
);

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(form.get("email") ?? "") }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Unable to sign in");
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as {
      user?: { role?: string };
    };
    const role = payload.user?.role;
    const destination =
      role === "seller" || role === "admin"
        ? redirectTo.startsWith("/studio")
          ? redirectTo
          : "/studio"
        : redirectTo;

    router.push(destination);
    router.refresh();
  }

  return (
    <AuthFormShell
      title="Sign in"
      subtitle="Use a demo account below or enter an email to continue."
      footer={
        <p className="mt-8 text-sm text-muted-foreground">
          New to Velta?{" "}
          <Link href="/signup" className="font-medium text-foreground underline underline-offset-2">
            Create an account
          </Link>
        </p>
      }
    >
      <DemoSignInButtons redirectTo={redirectTo} className="mt-2" />

      <AuthDivider label="or use email" />

      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <AuthFieldBox
          label="Email"
          name="email"
          type="email"
          defaultValue="buyer@demo.local"
          required
          autoComplete="email"
        />

        <AuthFieldBox
          label="Password"
          name="password"
          type="password"
          defaultValue="demo-password"
          autoComplete="current-password"
        />

        <div className="space-y-3 pt-2">
          <AuthCheckboxLine>{termsText}</AuthCheckboxLine>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <Button type="submit" variant="primary" size="lg" className="mt-4 w-full" disabled={loading}>
          {loading ? "Signing in…" : "Continue"}
        </Button>
      </form>
    </AuthFormShell>
  );
}

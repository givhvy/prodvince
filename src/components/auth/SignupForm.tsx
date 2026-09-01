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
  AppleIcon,
  GoogleIcon,
  SocialButton,
} from "@/components/ui/auth-section-2";

const termsText = (
  <>
    By creating an account, you agree to our{" "}
    <Link href="/pricing" className="font-medium text-foreground/70 underline underline-offset-2">
      Terms
    </Link>{" "}
    and{" "}
    <Link href="/ios" className="font-medium text-foreground/70 underline underline-offset-2">
      Privacy Policy
    </Link>
  </>
);

export function SignupForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(
        payload.error ??
          "Use a demo email: buyer@demo.local, studio@velta.local, or admin@velta.local",
      );
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <AuthFormShell
      title="Create an account"
      subtitle="Start selling beats or buying licenses with live Whop checkout."
      footer={
        <p className="mt-8 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-2">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <SocialButton icon={<GoogleIcon />} label="Sign up with Google" />
        <SocialButton icon={<AppleIcon />} label="Sign up with Apple" />
      </div>

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthFieldBox label="First Name" name="firstName" autoComplete="given-name" />
          <AuthFieldBox label="Last Name" name="lastName" autoComplete="family-name" />
        </div>

        <AuthFieldBox
          label="Email"
          name="email"
          type="email"
          defaultValue="studio@velta.local"
          required
          autoComplete="email"
        />
        <AuthFieldBox
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
        />

        <div className="space-y-3 pt-2">
          <AuthCheckboxLine>
            I want product updates about Studio, marketplace features, and Whop payouts
          </AuthCheckboxLine>
          <AuthCheckboxLine>{termsText}</AuthCheckboxLine>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <Button type="submit" variant="primary" size="lg" className="mt-4 w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthFormShell>
  );
}

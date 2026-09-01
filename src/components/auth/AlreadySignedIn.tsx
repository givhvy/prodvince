"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoSignInButtons } from "@/components/auth/DemoSignInButtons";
import { AuthFormShell } from "@/components/ui/auth-section-2";
import type { User } from "@/types";

function canAccessStudio(role: User["role"]) {
  return role === "seller" || role === "admin";
}

export function AlreadySignedIn({
  user,
  redirectTo,
}: {
  user: User;
  redirectTo: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const studioAccess = canAccessStudio(user.role);
  const wantsStudio = redirectTo.startsWith("/studio");
  const primaryHref = studioAccess ? "/studio" : redirectTo;
  const primaryLabel = studioAccess
    ? "Open Studio dashboard"
    : wantsStudio
      ? "Continue as buyer"
      : "Continue";

  async function signOut() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <AuthFormShell
      title="You're signed in"
      subtitle={`${user.email} · ${user.role}`}
    >
      {wantsStudio && !studioAccess ? (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Studio dashboard requires a seller account. Sign out and use the seller demo below, or
          switch accounts.
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3">
        <Button asChild variant="primary" size="lg" className="w-full">
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
        {studioAccess ? (
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href="/explore">Browse marketplace</Link>
          </Button>
        ) : (
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href="/library">Go to library</Link>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full"
          disabled={loading}
          onClick={signOut}
        >
          {loading ? "Signing out…" : "Sign out & use another account"}
        </Button>
      </div>

      {wantsStudio && !studioAccess ? (
        <DemoSignInButtons redirectTo="/studio" layout="stack" className="mt-8" />
      ) : null}
    </AuthFormShell>
  );
}

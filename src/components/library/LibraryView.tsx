"use client";

import Link from "next/link";
import { Headphones, ShoppingBag, Upload } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { BeatCard } from "@/components/beats/BeatCard";
import { MagicCard } from "@/components/ui/magic-card";
import type { Beat, Purchase } from "@/types";

type LibraryViewProps = {
  user: { name: string } | null;
  purchases: Purchase[];
  beats: Beat[];
};

export function LibraryView({ user, purchases, beats }: LibraryViewProps) {
  return (
    <Wrapper className="py-10 sm:py-14 md:py-16">
      <Container>
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <h1 className="font-heading text-3xl font-medium md:text-5xl">
            Your <span className="font-subheading italic">library</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Purchased beats sync here on web and in the Velta iOS app.
          </p>
        </div>
      </Container>

      <Container className="flex justify-center">
        {!user ? (
          <EmptyState
            title="Sign in to view purchases"
            description={"Your licensed beats and receipts live here.\nSign in once to sync across web and iOS."}
            icons={[Headphones, ShoppingBag, Upload]}
            actionHref="/login?redirect=/library"
            actionLabel="Sign in"
          />
        ) : purchases.length === 0 ? (
          <EmptyState
            title="No purchases yet"
            description={"Browse the marketplace, preview beats, and checkout with Whop.\nYour licenses will appear here instantly."}
            icons={[Headphones, ShoppingBag, Upload]}
            actionHref="/explore"
            actionLabel="Browse beats"
          />
        ) : null}
      </Container>

      {user && purchases.length > 0 ? (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:gap-6 sm:px-6 lg:grid-cols-3">
          {purchases.map((purchase) => {
            const beat = beats.find((item) => item.id === purchase.beatId);
            if (!beat) return null;

            return (
              <div key={purchase.id} className="rounded-2xl border border-border/50 bg-background/40 lg:rounded-3xl">
                <MagicCard
                  gradientFrom="#38bdf8"
                  gradientTo="#3b82f6"
                  gradientColor="rgba(59,130,246,0.1)"
                  className="p-3 lg:rounded-3xl"
                >
                  <BeatCard beat={beat} />
                  <p className="mt-2 px-4 pb-4 text-xs text-muted-foreground">
                    {purchase.licenseTier.toUpperCase()} · Receipt {purchase.whopReceiptId}
                  </p>
                </MagicCard>
              </div>
            );
          })}
        </div>
      ) : null}

      {user ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Need more beats?{" "}
          <Link href="/explore" className="text-blue-400 hover:underline">
            Browse the marketplace
          </Link>
        </p>
      ) : null}
    </Wrapper>
  );
}

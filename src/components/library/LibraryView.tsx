"use client";

import Link from "next/link";
import { Headphones, ShoppingBag, Upload } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { BeatCard } from "@/components/beats/BeatCard";
import type { Beat, Sale } from "@/types";

type LibraryViewProps = {
  user: { name: string } | null;
  sales: Sale[];
  beats: Beat[];
};

export function LibraryView({ user, sales, beats }: LibraryViewProps) {
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
        ) : sales.length === 0 ? (
          <EmptyState
            title="No purchases yet"
            description={"Browse the marketplace, preview beats, and checkout with Whop.\nYour licenses will appear here instantly."}
            icons={[Headphones, ShoppingBag, Upload]}
            actionHref="/explore"
            actionLabel="Browse beats"
          />
        ) : null}
      </Container>

      {user && sales.length > 0 ? (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:gap-6 sm:px-6 lg:grid-cols-3">
          {sales.map((sale) => {
            const beat = beats.find((item) => item.id === sale.beatId);

            return (
              <div
                key={sale.purchaseId}
                className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/40"
              >
                {beat ? <BeatCard beat={beat} /> : (
                  <div className="p-4">
                    <p className="font-medium">{sale.beatTitle}</p>
                    <p className="text-sm text-muted-foreground">{sale.sellerName}</p>
                  </div>
                )}
                <div className="space-y-2 border-t border-white/[0.06] px-4 py-3 text-xs text-muted-foreground">
                  <p>
                    {sale.tierLabel} · {sale.licenseNumber}
                  </p>
                  <p>Receipt {sale.receiptNumber}</p>
                  <p className="flex gap-3">
                    <Link href={`/licenses/${sale.licenseNumber}`} className="text-blue-400 hover:underline">
                      License
                    </Link>
                    <Link href={`/receipts/${sale.receiptNumber}`} className="text-blue-400 hover:underline">
                      Receipt
                    </Link>
                  </p>
                </div>
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

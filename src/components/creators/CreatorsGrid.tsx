"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { GlowCard, GlowCardGrid } from "@/components/ui/glow-card-grid";
import type { CreatorCard } from "@/lib/creators";

export function CreatorsGrid({ creators }: { creators: CreatorCard[] }) {
  return (
    <Wrapper className="py-10 sm:py-14 md:py-16">
      <Container>
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <h1 className="font-heading text-3xl font-medium md:text-5xl">
            Top <span className="font-subheading italic">creators</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Verified producers on Velta with live beats, Whop checkout, and Studio tooling.
          </p>
        </div>
      </Container>

      <GlowCardGrid className="mx-auto max-w-6xl px-4 sm:px-6">
        {creators.map((creator) => (
          <div key={creator.id} className="relative">
            <Link href={`/explore?seller=${encodeURIComponent(creator.id)}`}>
              <GlowCard
                name={creator.name}
                handle={`${creator.handle} · ${creator.beats} beats`}
                avatar={creator.avatar}
              />
            </Link>
            {creator.verified ? (
              <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs text-blue-400 ring-1 ring-border">
                <BadgeCheck className="size-3.5" />
                Verified
              </span>
            ) : null}
          </div>
        ))}
      </GlowCardGrid>
    </Wrapper>
  );
}

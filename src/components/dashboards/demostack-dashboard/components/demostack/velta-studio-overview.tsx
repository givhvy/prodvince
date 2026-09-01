"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import {
  BgFolderVector,
  DashboardFolderPlusIcon,
  DashboardImagesIcon,
  DashboardVideoIcon,
  FigGraduationIcon,
  FigLightbulbIcon,
  FigPlayIcon,
  FigSparkleIcon,
  InspireFourIcon,
  InspireOneIcon,
  InspireThreeIcon,
  InspireTwoIcon,
} from "./icons";
import { Button } from "@/components/ui/button";
import { designImage, FEATURE_IMAGES } from "@/lib/design-images";
import type { Beat } from "@/types";

type VeltaStudioOverviewProps = {
  beats: Beat[];
  totalPlays: number;
  draftCampaigns: number;
};

const dashboardActions = [
  {
    title: "Upload a beat",
    description: "Add WAV/MP3, metadata, and license tiers in minutes",
    image: "https://assets.watermelon.sh/components/bg-element-wave.webp",
    icon: DashboardFolderPlusIcon,
    href: "/studio/upload",
  },
  {
    title: "Email buyers",
    description: "Send campaigns to followers and past customers",
    image: "https://assets.watermelon.sh/components/bg-element-neon.webp",
    icon: DashboardVideoIcon,
    href: "/studio/marketing",
  },
  {
    title: "Connect Whop",
    description: "Configure live checkout and payout plans",
    image: "https://assets.watermelon.sh/components/bg-element-sky.webp",
    icon: DashboardImagesIcon,
    href: "/studio/payments",
  },
] as const;

const dashboardTips = [
  {
    title: "Price MP3 + WAV tiers",
    description: "Offer lease and exclusive options like BeatStars",
    image: designImage(FEATURE_IMAGES[0], 512),
  },
  {
    title: "Email after every drop",
    description: "Turn followers into repeat buyers with Studio mail",
    image: designImage(FEATURE_IMAGES[1], 512),
  },
  {
    title: "Feature your best beat",
    description: "Pin a hero listing on Explore and socials",
    image: designImage(FEATURE_IMAGES[2], 512),
  },
  {
    title: "Track conversion",
    description: "Watch plays, checkout clicks, and revenue trends",
    image: designImage(FEATURE_IMAGES[3], 512),
  },
] as const;

export function VeltaStudioOverview({ beats, totalPlays, draftCampaigns }: VeltaStudioOverviewProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:space-y-10 md:px-7 md:py-8" data-studio-overview>
      <section className="grid gap-3 sm:grid-cols-3">
        <StatPill label="Total plays" value={totalPlays.toLocaleString()} />
        <StatPill label="Live beats" value={String(beats.length)} />
        <StatPill label="Email drafts" value={String(draftCampaigns)} />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {dashboardActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="flex w-full flex-col items-start gap-8 rounded-2xl border px-4 pb-3.5 pt-4 transition-colors hover:bg-secondary"
          >
            <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={action.image} alt="" className="absolute inset-0 size-full object-cover" />
              <action.icon className="relative z-10 size-6 text-primary-foreground" />
            </div>
            <div className="flex w-full flex-col gap-1">
              <p className="font-medium">{action.title}</p>
              <p className="text-sm leading-4 text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </section>

      <DashboardTips />

      <div className="flex flex-col gap-8 lg:flex-row">
        <ResourcesSection />
        <RecentBeats beats={beats} />
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-secondary/40 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function DashboardTips() {
  const [visible, setVisible] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  if (!visible) return null;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">Producer tips</h2>
          <p className="mt-2 max-w-prose text-muted-foreground">
            Quick wins for licensing, marketing, and Whop checkout on Velta.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setVisible(false)}
          className="h-auto shrink-0 self-start rounded-full px-5 py-3"
        >
          Close tips
          <X className="size-4" />
        </Button>
      </div>

      <div className="relative overflow-hidden">
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto scroll-smooth pb-2">
          {dashboardTips.map((tip) => (
            <article key={tip.title} className="group flex w-64 shrink-0 flex-col items-start gap-4">
              <div className="relative aspect-[3/2] w-64 overflow-hidden rounded-2xl">
                <Image src={tip.image} alt="" fill sizes="256px" className="object-cover transition duration-300 group-hover:scale-105" />
              </div>
              <div className="flex w-full flex-col gap-1">
                <h3 className="font-medium">{tip.title}</h3>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="absolute right-0 top-0 h-64 w-16 bg-gradient-to-l from-background via-background/70 to-transparent md:w-36" />
        <Button
          variant="outline"
          size="icon"
          onClick={() => scrollRef.current?.scrollBy({ left: scrollRef.current.clientWidth, behavior: "smooth" })}
          className="absolute right-0 top-28 z-10 rounded-full border-0 bg-secondary"
          aria-label="Show more tips"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </section>
  );
}

function ResourcesSection() {
  const dashboardResources = [
    { label: "Explore marketplace", icon: FigGraduationIcon, href: "/explore" },
    { label: "Pricing plans", icon: FigLightbulbIcon, href: "/pricing" },
    { label: "Sell beats guide", icon: FigPlayIcon, href: "/sell" },
    { label: "iOS app", icon: FigSparkleIcon, href: "/ios" },
  ] as const;

  return (
    <section className="flex flex-1 flex-col items-start gap-6 lg:max-w-lg">
      <h2 className="text-lg font-semibold">Resources</h2>
      <div className="grid w-full grid-cols-2 gap-4">
        {dashboardResources.map((resource) => (
          <Link key={resource.label} href={resource.href} className="group flex cursor-pointer flex-col items-start gap-3">
            <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-secondary">
              <div className="relative flex size-20 items-center justify-center transition duration-200 group-hover:-translate-y-1 group-hover:rotate-1">
                <BgFolderVector className="absolute inset-0 size-full" />
                <resource.icon className="relative z-10 mt-4 size-6 transition duration-200 group-hover:scale-110" />
              </div>
            </div>
            <h3 className="font-medium">{resource.label}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentBeats({ beats }: { beats: Beat[] }) {
  const inspiredDemos = beats.slice(0, 4).map((beat, index) => ({
    title: beat.title,
    href: `/beats/${beat.slug}`,
    icon: [InspireOneIcon, InspireTwoIcon, InspireThreeIcon, InspireFourIcon][index] ?? InspireOneIcon,
  }));

  return (
    <section className="flex flex-1 flex-col items-start gap-6">
      <h2 className="text-lg font-semibold">Recent beats</h2>
      <div className="flex w-full flex-col gap-2">
        {inspiredDemos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Upload your first beat to see it here.</p>
        ) : (
          inspiredDemos.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex h-16 w-full cursor-pointer items-center justify-between rounded-2xl bg-secondary py-4 pl-6 pr-8"
            >
              <div className="flex min-w-0 items-center gap-4">
                <item.icon className="size-7 shrink-0" />
                <h3 className="truncate font-medium">{item.title}</h3>
              </div>
              <ArrowUpRight className="size-5 text-muted-foreground transition group-hover:-translate-y-1 group-hover:translate-x-1" />
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

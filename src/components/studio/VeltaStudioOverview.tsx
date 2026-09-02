"use client";

import Link from "next/link";
import {
  ChevronRight,
  CreditCard,
  Mail,
  TrendingUp,
  Upload,
} from "lucide-react";
import type { Beat } from "@/types";
import { MetricCubeIcon } from "@/components/watermelon/astrix-dashboard/components/astrix/icons";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type VeltaStudioOverviewProps = {
  beats: Beat[];
  totalPlays: number;
  draftCampaigns: number;
};

const quickActions = [
  {
    title: "Upload a beat",
    description: "Add WAV/MP3, metadata, and license tiers in minutes.",
    href: "/studio/upload",
    icon: Upload,
  },
  {
    title: "Email buyers",
    description: "Send campaigns to followers and past customers.",
    href: "/studio/marketing",
    icon: Mail,
  },
  {
    title: "Connect Whop",
    description: "Configure live checkout and payout plans.",
    href: "/studio/payments",
    icon: CreditCard,
  },
] as const;

export function VeltaStudioOverview({
  beats,
  totalPlays,
  draftCampaigns,
}: VeltaStudioOverviewProps) {
  const whopReady = beats.reduce(
    (sum, beat) =>
      sum + beat.licenses.filter((license) => license.whopPlanId).length,
    0,
  );

  const metrics = [
    {
      label: "Total plays",
      value: totalPlays.toLocaleString(),
      trend: { value: "+12.4%", label: "this week", tone: "positive" as const },
    },
    {
      label: "Live beats",
      value: String(beats.length),
      footnote: `${whopReady} Whop plans connected`,
    },
    {
      label: "Email drafts",
      value: String(draftCampaigns),
      trend:
        draftCampaigns > 0
          ? { value: String(draftCampaigns), label: "ready to send", tone: "warning" as const }
          : undefined,
    },
    {
      label: "Checkout",
      value: "Whop",
      footnote: "Live payments enabled",
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Studio Overview</h1>
          <p className="text-lg text-muted-foreground">
            Track plays, beats, campaigns, and Whop checkout from one dashboard.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-xl border bg-card p-3 md:p-4">
              <div className="flex flex-col gap-5 md:gap-8">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex size-7 items-center justify-center rounded-lg border md:size-8">
                    <MetricCubeIcon className="size-3.5 md:size-4" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground md:text-sm">
                    {metric.label}
                  </p>
                </div>
                <div className="flex flex-col gap-2 md:gap-3">
                  <p className="text-[1.625rem] leading-none font-semibold md:text-[2rem]">
                    {metric.value}
                  </p>
                  {metric.trend ? (
                    <div className="flex items-center gap-1">
                      {metric.trend.tone === "positive" ? (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          <TrendingUp className="size-3" />
                          {metric.trend.value}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-primary">
                          {metric.trend.value}
                        </span>
                      )}
                      <span className="text-xs font-medium text-muted-foreground">
                        {metric.trend.label}
                      </span>
                    </div>
                  ) : null}
                  {metric.footnote ? (
                    <p className="text-xs font-medium text-muted-foreground">
                      {metric.footnote}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-card/80"
          >
            <div className="flex size-10 items-center justify-center rounded-lg border">
              <action.icon className="size-5 text-primary" />
            </div>
            <h2 className="mt-4 text-base font-semibold">{action.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{action.description}</p>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Your beats</h2>
            <p className="text-sm text-muted-foreground">
              Recent catalog items, plays, and Whop license status.
            </p>
          </div>
          <Button variant="secondary" className="gap-1 pl-3 pr-2" asChild>
            <Link href="/studio/beats">
              See all
              <ChevronRight className="size-5" />
            </Link>
          </Button>
        </div>

        <Table className="min-w-[48rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>BPM</TableHead>
              <TableHead>Plays</TableHead>
              <TableHead>Whop plans</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {beats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No beats yet.{" "}
                  <Link href="/studio/upload" className="text-primary underline-offset-4 hover:underline">
                    Upload your first beat
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              beats.slice(0, 6).map((beat) => (
                <TableRow key={beat.id}>
                  <TableCell className="max-w-xs whitespace-normal font-medium">
                    {beat.title}
                  </TableCell>
                  <TableCell>{beat.bpm}</TableCell>
                  <TableCell className="tabular-nums">
                    {beat.plays.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {beat.licenses.filter((license) => license.whopPlanId).length}/
                    {beat.licenses.length}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/beats/${beat.slug}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

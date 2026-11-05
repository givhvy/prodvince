"use client";

import { useState } from 'react'
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExportIcon,
  MetricCubeIcon,
  TrendingUpIcon,
} from './icons'
import { DashboardLink } from './navigation'
import { ClassificationStatusBadge } from './shared'
import { useTheme } from './theme-provider'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  classificationStream,
  dashboardMetricsByRange,
  dateRangeOptions,
  type ClassificationRow,
  type DateRange,
  type MetricCard,
} from '../../data'

export function DashboardContent() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pt-8 pb-10 md:px-6">
      <OverviewSection />
      <PipelineSection />
      <StreamSection />
    </div>
  )
}

function OverviewSection() {
  const { theme } = useTheme()
  const [dateRange, setDateRange] = useState<DateRange>('last-7-days')
  const rangeLabel = dateRangeOptions.find(
    (option) => option.value === dateRange,
  )?.label

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">
            Studio Overview
          </h1>
          <p className="text-lg text-muted-foreground">
            Track plays, licenses, and Whop checkout for your beat catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                className="h-10 gap-2 px-3.5"
              >
                <CalendarIcon className="size-5" />
                {rangeLabel}
                <ChevronDownIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              collisionPadding={16}
              className="astrix-dashboard min-w-40"
              data-astrix-theme={theme}
            >
              <DropdownMenuRadioGroup
                value={dateRange}
                onValueChange={(value) => setDateRange(value as DateRange)}
              >
                {dateRangeOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                    className="font-normal text-muted-foreground data-[state=checked]:font-medium data-[state=checked]:text-foreground"
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            className="h-10 gap-1 px-3.5"
          >
            Export
            <ExportIcon className="size-5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetricsByRange[dateRange].map((metric) => (
          <MetricCardItem key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  )
}

function MetricCardItem({ metric }: { metric: MetricCard }) {
  return (
    <article className="rounded-xl border bg-card p-3 md:p-4">
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
              {metric.trend.tone === 'positive' ? (
                <span className="inline-flex items-center gap-1 rounded-xl bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  <TrendingUpIcon className="size-3" />
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
  )
}

function PipelineSection() {
  const stages = [
    { title: "Upload", detail: "WAV / MP3" },
    { title: "Preview", detail: "Waveform" },
    { title: "Licenses", detail: "MP3 · WAV · Exclusive" },
    { title: "Whop", detail: "Checkout" },
    { title: "Live", detail: "Storefront" },
  ] as const

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-medium">Live beat pipeline</h2>

      <div className="relative overflow-hidden rounded-3xl border bg-secondary">
        <div className="pipeline-dots absolute inset-0" />

        <div className="relative z-10 flex flex-col gap-6 px-4 py-5 md:px-6 md:py-6">
          <div className="flex flex-wrap items-center gap-0.5">
            <div className="flex h-12 items-center gap-2 rounded-xl border bg-card px-3">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
                <span className="relative size-full rounded-full bg-success" />
              </span>
              <span className="text-sm text-success">Live catalog</span>
            </div>
            <div className="flex h-12 items-center rounded-xl border bg-card px-3">
              <span className="truncate text-sm font-medium text-primary">
                Pipeline: Velta storefront + Whop checkout
              </span>
            </div>
          </div>

          <div className="no-scrollbar flex items-stretch gap-3 overflow-x-auto pb-2">
            {stages.map((stage, index) => (
              <div key={stage.title} className="flex min-w-40 flex-1 items-center gap-3">
                <article className="w-full rounded-xl border bg-card px-4 py-4 shadow-sm">
                  <p className="text-sm font-semibold">{stage.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stage.detail}</p>
                </article>
                {index < stages.length - 1 ? (
                  <span className="hidden shrink-0 text-muted-foreground md:inline">→</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StreamSection() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Live catalog</h2>
          <p className="text-sm text-muted-foreground">
            Recent beats, plays, and license status across the storefront
          </p>
        </div>
        <Button
          variant="secondary"
          className="gap-1 pl-3 pr-2"
          asChild
        >
          <DashboardLink href="/classification">
            See all
            <ChevronRightIcon className="size-5" />
          </DashboardLink>
        </Button>
      </div>

      <Table className="min-w-215">
        <colgroup>
          <col className="w-[32%]" />
          <col className="w-[16%]" />
          <col className="w-[14%]" />
          <col className="w-[20%]" />
          <col className="w-[18%]" />
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Beat</TableHead>
            <TableHead>BPM</TableHead>
            <TableHead>Plays</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Listed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classificationStream.map((row) => (
            <StreamRow key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

function StreamRow({ row }: { row: ClassificationRow }) {
  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <div className="space-y-1">
          <p className="truncate font-medium">{row.product}</p>
          <p className="truncate text-xs text-muted-foreground">{row.id}</p>
        </div>
      </TableCell>
      <TableCell className="font-mono">{row.hsCode}</TableCell>
      <TableCell className="tabular-nums">{row.confidence}</TableCell>
      <TableCell>
        <ClassificationStatusBadge status={row.status} />
      </TableCell>
      <TableCell className="text-muted-foreground">{row.submitted}</TableCell>
    </TableRow>
  )
}

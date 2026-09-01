"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib";
import { designImage } from "@/lib/design-images";
import type { ReactNode } from "react";

export interface BentoItem {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  status?: string;
  tags?: string[];
  meta?: string;
  cta?: string;
  colSpan?: number;
  hasPersistentHover?: boolean;
  backgroundImage?: string;
}

interface BentoGridProps {
  items: BentoItem[];
  className?: string;
}

function BentoTile({ item }: { item: BentoItem }) {
  const content = (
    <>
      {item.backgroundImage ? (
        <>
          <Image
            src={designImage(item.backgroundImage, 960)}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className={cn(
              "object-cover transition duration-500",
              item.hasPersistentHover ? "scale-105 opacity-70" : "opacity-50 group-hover:scale-105 group-hover:opacity-70",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/60" />
        </>
      ) : null}

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:4px_4px]" />
      </div>

      <div className="relative flex flex-col space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/40 transition-all duration-300 group-hover:bg-blue-500/15">
            {item.icon}
          </div>
          {item.status ? (
            <span className="rounded-lg border border-border bg-background/60 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              {item.status}
            </span>
          ) : null}
        </div>

        <div className="space-y-2">
          <h3 className="text-[15px] font-medium tracking-tight text-foreground">
            {item.title}
            {item.meta ? (
              <span className="ml-2 text-xs font-normal text-muted-foreground">{item.meta}</span>
            ) : null}
          </h3>
          <p className="text-sm leading-snug text-muted-foreground">{item.description}</p>
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {item.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border/60 bg-background/50 px-2 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-blue-400 opacity-0 transition-opacity group-hover:opacity-100">
            {item.cta ?? "Explore →"}
          </span>
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-transparent via-border/30 to-transparent p-px transition-opacity duration-300",
          item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      />
    </>
  );

  const className = cn(
    "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-4 transition-all duration-300",
    "hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)]",
    item.colSpan === 2 ? "md:col-span-2" : "col-span-1",
    item.hasPersistentHover && "border-blue-500/30 shadow-[0_8px_30px_rgba(59,130,246,0.08)]",
  );

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export function BentoGrid({ items, className }: BentoGridProps) {
  return (
    <div className={cn("mx-auto grid max-w-6xl grid-cols-1 gap-3 md:grid-cols-3", className)}>
      {items.map((item) => (
        <BentoTile key={item.title} item={item} />
      ))}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib";
import { designImage } from "@/lib/design-images";

export interface HoverEffectItem {
  title: string;
  description: string;
  link: string;
  meta?: string;
  backgroundImage?: string;
}

export function HoverEffect({
  items,
  className,
}: {
  items: HoverEffectItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2 py-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-3",
        className,
      )}
    >
      {items.map((item) => (
        <HoverEffectLink key={item.link} item={item} />
      ))}
    </div>
  );
}

function HoverEffectLink({ item }: { item: HoverEffectItem }) {
  return (
    <Link
      href={item.link}
      className="group relative block h-full w-full overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 transition-all duration-300 hover:border-blue-500/40 hover:bg-card/70"
    >
      {item.backgroundImage ? (
        <>
          <Image
            src={designImage(item.backgroundImage, 720)}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-40 transition duration-300 group-hover:scale-105 group-hover:opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-sky-500/0 opacity-0 transition-opacity duration-300 group-hover:from-blue-500/10 group-hover:to-sky-500/5 group-hover:opacity-100" />
      )}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.title}</h3>
          {item.meta ? (
            <span className="shrink-0 rounded-full border border-border bg-background/80 px-2 py-0.5 text-xs text-muted-foreground">
              {item.meta}
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        <span className="mt-5 inline-flex text-sm font-medium text-blue-400 opacity-80 transition group-hover:opacity-100">
          Browse beats →
        </span>
      </div>
    </Link>
  );
}

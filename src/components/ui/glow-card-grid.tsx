"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib";

export type GlowCardGridProps = React.ComponentPropsWithoutRef<"div"> & {
  cardRadius?: number;
  iconBlur?: number;
  iconSaturate?: number;
  iconBrightness?: number;
  iconScale?: number;
  iconOpacity?: number;
  borderWidth?: number;
  borderBlur?: number;
  borderSaturate?: number;
  borderBrightness?: number;
  borderContrast?: number;
  children: React.ReactNode;
};

export function GlowCardGrid({
  cardRadius = 16,
  iconBlur = 25,
  iconSaturate = 5.0,
  iconBrightness = 1.3,
  iconScale = 4,
  iconOpacity = 0.3,
  borderWidth = 3,
  borderBlur = 10,
  borderSaturate = 4.2,
  borderBrightness = 2.5,
  borderContrast = 2.5,
  className,
  style,
  ...props
}: GlowCardGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!gridRef.current) return;

      const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-slot='glow-card']");

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = (event.clientX - centerX) / (rect.width / 2);
        const y = (event.clientY - centerY) / (rect.height / 2);

        card.style.setProperty("--pointer-x", x.toFixed(3));
        card.style.setProperty("--pointer-y", y.toFixed(3));
      });
    };

    document.addEventListener("pointermove", handlePointerMove);
    return () => document.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div
      ref={gridRef}
      className={cn("grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      style={
        {
          "--card-radius": `${cardRadius}px`,
          "--card-icon-blur": `${iconBlur}px`,
          "--card-icon-saturate": iconSaturate,
          "--card-icon-brightness": iconBrightness,
          "--card-icon-scale": iconScale,
          "--card-icon-opacity": iconOpacity,
          "--card-border-width": `${borderWidth}px`,
          "--card-border-blur": `${borderBlur}px`,
          "--card-border-saturate": borderSaturate,
          "--card-border-brightness": borderBrightness,
          "--card-border-contrast": borderContrast,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export type GlowCardProps = {
  name: string;
  handle: string;
  avatar: string;
  className?: string;
};

export function GlowCard({ name, handle, avatar, className }: GlowCardProps) {
  return (
    <div
      data-slot="glow-card"
      className={cn(
        "relative h-52 w-full overflow-hidden rounded-2xl ring-1 ring-border transition-[translate,scale] select-none active:scale-[0.98]",
        className,
      )}
      style={{ borderRadius: "var(--card-radius, 16px)" }}
    >
      <div className="flex size-full overflow-hidden" style={{ borderRadius: "var(--card-radius, 16px)" }}>
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30 blur-[25px] brightness-[1.3] saturate-[5]"
          style={{
            transform:
              "translateX(calc(var(--pointer-x, -10) * 50%)) translateY(calc(var(--pointer-y, -10) * 50%)) scale(4)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="size-20" src={avatar} alt="" />
        </div>

        <div className="z-1 flex flex-1 flex-col items-center justify-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="size-20 rounded-full object-cover" src={avatar} alt={name} />
          <div className="flex flex-col items-center gap-1 px-4 text-center">
            <h2 className="text-base font-semibold leading-none text-foreground">{name}</h2>
            <p className="text-sm leading-none text-muted-foreground">{handle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

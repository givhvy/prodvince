"use client";

import { useCallback, type MouseEvent } from "react";
import { cn } from "@/lib";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#262626",
  gradientFrom = "#38bdf8",
  gradientTo = "#3b82f6",
  ...props
}: MagicCardProps) {
  const handleMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--magic-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--magic-y", `${event.clientY - rect.top}px`);
  }, []);

  return (
    <div
      {...props}
      onMouseMove={handleMouseMove}
      className={cn("group relative flex size-full rounded-xl", className)}
      style={{
        "--magic-size": `${gradientSize}px`,
        "--magic-color": gradientColor,
        "--magic-from": gradientFrom,
        "--magic-to": gradientTo,
        ...((props.style as object) ?? {}),
      } as React.CSSProperties}
    >
      <div className="absolute inset-px z-10 rounded-xl bg-background" />
      <div className="relative z-30 w-full">{children}</div>
      <div
        className="pointer-events-none absolute inset-px z-10 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(var(--magic-size) circle at var(--magic-x, -200px) var(--magic-y, -200px), var(--magic-color), transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-xl bg-border motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(var(--magic-size) circle at var(--magic-x, -200px) var(--magic-y, -200px), var(--magic-from), var(--magic-to), hsl(var(--border)) 100%)",
        }}
      />
    </div>
  );
}

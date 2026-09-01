"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icons?: LucideIcon[];
  action?: {
    label: string;
    onClick: () => void;
  };
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icons = [],
  action,
  actionHref,
  actionLabel = "Get started",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "group w-full max-w-[620px] rounded-xl border-2 border-dashed border-border bg-background p-10 text-center transition duration-500 hover:border-border/80 hover:bg-muted/50 hover:duration-200 sm:p-14",
        className,
      )}
    >
      <div className="isolate flex justify-center">
        {icons.length === 3 ? (
          <>
            <div className="relative left-2.5 top-1.5 grid size-12 -rotate-6 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:-translate-x-5 group-hover:-translate-y-0.5 group-hover:-rotate-12 group-hover:duration-200">
              {React.createElement(icons[0], { className: "h-6 w-6 text-muted-foreground" })}
            </div>
            <div className="relative z-10 grid size-12 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:-translate-y-0.5 group-hover:duration-200">
              {React.createElement(icons[1], { className: "h-6 w-6 text-muted-foreground" })}
            </div>
            <div className="relative right-2.5 top-1.5 grid size-12 rotate-6 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:translate-x-5 group-hover:-translate-y-0.5 group-hover:rotate-12 group-hover:duration-200">
              {React.createElement(icons[2], { className: "h-6 w-6 text-muted-foreground" })}
            </div>
          </>
        ) : (
          <div className="grid size-12 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:-translate-y-0.5 group-hover:duration-200">
            {icons[0] ? React.createElement(icons[0], { className: "h-6 w-6 text-muted-foreground" }) : null}
          </div>
        )}
      </div>
      <h2 className="mt-6 font-medium text-foreground">{title}</h2>
      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{description}</p>
      {action ? (
        <Button onClick={action.onClick} variant="outline" className="mt-4 shadow-sm active:shadow-none">
          {action.label}
        </Button>
      ) : null}
      {actionHref ? (
        <Button asChild variant="outline" className="mt-4 shadow-sm active:shadow-none">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

"use client";

import { cn } from "@/lib";
import { motion } from "framer-motion";
import type React from "react";

export type FREQUENCY = "monthly" | "yearly";

type FrequencyToggleProps = React.ComponentProps<"div"> & {
  frequency: FREQUENCY;
  setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
  frequencies?: FREQUENCY[];
};

export function FrequencyToggle({
  frequency,
  setFrequency,
  frequencies = ["monthly", "yearly"],
  className,
  ...props
}: FrequencyToggleProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-fit rounded-xl border border-border bg-card p-1 shadow-xs",
        className,
      )}
      {...props}
    >
      {frequencies.map((freq) => (
        <button
          className="relative px-4 py-1 text-sm capitalize text-foreground"
          key={freq}
          onClick={() => setFrequency(freq)}
          type="button"
        >
          <span className="relative z-10">{freq}</span>
          {frequency === freq && (
            <motion.span
              className="absolute inset-0 z-0 rounded-lg bg-accent"
              layoutId="frequency"
              transition={{ type: "spring", duration: 0.4 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

"use client";

import { cn } from "@/lib";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type FREQUENCY,
  FrequencyToggle,
} from "@/components/ui/pricing-4-utils/frequency-toggle";

export type PricingPlan = {
  name: string;
  info: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  btn: {
    text: string;
    href: string;
  };
  highlighted?: boolean;
};

type PricingSectionProps = {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  className?: string;
};

export function PricingSection({
  plans,
  title = "Plans that scale with you",
  description = "Flexible producer tiers with live Whop checkout on every beat license.",
  className,
}: PricingSectionProps) {
  const [frequency, setFrequency] = React.useState<FREQUENCY>("monthly");
  const columns = plans.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center space-y-7 p-4",
        className,
      )}
    >
      <div className="mx-auto max-w-xl space-y-2">
        <h2 className="text-center font-heading text-2xl font-medium tracking-tight md:text-3xl lg:text-4xl">
          {title}
        </h2>
        <p className="text-center text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      </div>

      <FrequencyToggle frequency={frequency} setFrequency={setFrequency} />

      <div className={cn("mx-auto grid w-full max-w-5xl grid-cols-1 gap-6", columns)}>
        {plans.map((plan) => (
          <PricingCard frequency={frequency} key={plan.name} plan={plan} />
        ))}
      </div>
    </div>
  );
}

type PricingCardProps = React.ComponentProps<"div"> & {
  plan: PricingPlan;
  frequency?: FREQUENCY;
};

export function PricingCard({
  plan,
  className,
  frequency = "monthly",
  ...props
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card/40 shadow-xs",
        plan.highlighted && "border-blue-500/60 md:scale-[1.02]",
        className,
      )}
      {...props}
    >
      {plan.highlighted && (
        <div className="pointer-events-none absolute inset-x-8 top-0 h-24 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      )}

      <div
        className={cn(
          "relative border-b border-border p-5",
          plan.highlighted && "bg-card/80",
        )}
      >
        <AnimatePresence mode="wait">
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            {plan.highlighted && (
              <motion.div
                className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-xs"
                key="popular-badge"
                layout
                transition={{ duration: 0.1 }}
              >
                <Star className="size-3 fill-current text-blue-400" />
                Popular
              </motion.div>
            )}

            {frequency === "yearly" && plan.price.monthly > plan.price.yearly && (
              <motion.div
                animate={{ opacity: 1 }}
                className="flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-xs text-blue-200"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key="discount-badge"
                layout
                transition={{ duration: 0.15 }}
              >
                {Math.round(
                  ((plan.price.monthly - plan.price.yearly) / plan.price.monthly) * 100,
                )}
                % off
              </motion.div>
            )}
          </div>
        </AnimatePresence>

        <div className="text-lg font-medium">{plan.name}</div>
        <p className="text-sm text-muted-foreground">{plan.info}</p>
        <h3 className="mt-6 mb-1 flex w-max items-end gap-1">
          <NumberFlow
            className="text-3xl font-extrabold [&::part(suffix)]:text-base [&::part(suffix)]:font-normal [&::part(suffix)]:text-muted-foreground"
            format={{
              style: "currency",
              currency: "USD",
              notation: "compact",
              maximumFractionDigits: 0,
            }}
            suffix="/month"
            value={plan.price[frequency]}
          />
        </h3>
        <p className="mb-2 text-xs text-muted-foreground">billed {frequency}</p>
      </div>

      <div
        className={cn(
          "space-y-3 px-5 pt-6 pb-8 text-sm text-muted-foreground",
          plan.highlighted && "bg-muted/10",
        )}
      >
        {plan.features.map((feature) => (
          <div className="flex items-center gap-2" key={feature}>
            <CheckCircle className="size-3.5 shrink-0 text-blue-400" />
            <p>{feature}</p>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "mt-auto w-full border-t border-border p-4",
          plan.highlighted && "bg-card/80",
        )}
      >
        <Button
          asChild
          className="w-full"
          variant={plan.highlighted ? "primary" : "secondary"}
        >
          <Link href={plan.btn.href}>{plan.btn.text}</Link>
        </Button>
      </div>
    </div>
  );
}

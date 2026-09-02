import type { PricingPlan } from "@/components/ui/pricing-4";

export const PRODUCER_PRICING_PLANS: PricingPlan[] = [
  {
    name: "Pay as you sell",
    info: "Whop checkout on every beat license. No platform subscription required.",
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      "Unlimited beat uploads",
      "MP3 / WAV / exclusive tiers",
      "Live Whop checkout",
      "Buyer library access",
      "Basic sales analytics",
    ],
    btn: {
      text: "Open Studio",
      href: "/studio",
    },
  },
  {
    highlighted: true,
    name: "Studio Pro",
    info: "For producers running email campaigns and a full storefront.",
    price: {
      monthly: 29,
      yearly: 24,
    },
    features: [
      "Everything in Pay as you sell",
      "Email marketing campaigns",
      "Featured marketplace placement",
      "Custom storefront branding",
      "Priority support",
    ],
    btn: {
      text: "Upgrade to Pro",
      href: "/studio/payments",
    },
  },
  {
    name: "Label",
    info: "Teams managing multiple producer accounts and catalog ops.",
    price: {
      monthly: 79,
      yearly: 66,
    },
    features: [
      "Multi-producer workspaces",
      "Shared beat libraries",
      "Advanced revenue reporting",
      "API + webhook access",
      "Dedicated success manager",
    ],
    btn: {
      text: "Contact sales",
      href: "/sell",
    },
  },
];

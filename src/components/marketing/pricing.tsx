"use client";

import { PricingSection } from "@/components/ui/pricing-4";
import { PRODUCER_PRICING_PLANS } from "@/lib/pricing-plans";

const Pricing = () => {
  return (
    <PricingSection
      className="py-12 md:py-20"
      plans={PRODUCER_PRICING_PLANS}
      title="Producer plans for every stage"
      description="Transform your beat business with Whop checkout, Studio tools, and email marketing. Pick monthly or annual billing."
    />
  );
};

export default Pricing;

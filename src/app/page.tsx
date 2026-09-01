import Wrapper from "@/components/global/wrapper";
import Analysis from "@/components/marketing/analysis";
import Companies from "@/components/marketing/companies";
import CTA from "@/components/marketing/cta";
import Features from "@/components/marketing/features";
import Hero from "@/components/marketing/hero";
import Integration from "@/components/marketing/integration";
import Marketplace from "@/components/marketing/marketplace";
import Pricing from "@/components/marketing/pricing";
import Testimonials from "@/components/marketing/testimonials";

export default function HomePage() {
  return (
    <Wrapper className="relative pb-8 sm:pb-12">
      <Hero />
      <Companies />
      <Marketplace />
      <Features />
      <Analysis />
      <Integration />
      <Testimonials />
      <Pricing />
      <CTA />
    </Wrapper>
  );
}

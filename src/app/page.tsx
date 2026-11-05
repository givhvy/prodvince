import dynamic from "next/dynamic";
import Wrapper from "@/components/global/wrapper";
import Hero from "@/components/marketing/hero";
import Marketplace from "@/components/marketing/marketplace";

const Features = dynamic(() => import("@/components/marketing/features"), {
  loading: () => null,
});
const Analysis = dynamic(() => import("@/components/marketing/analysis"), {
  loading: () => null,
});
const Integration = dynamic(() => import("@/components/marketing/integration"), {
  loading: () => null,
});
const Testimonials = dynamic(() => import("@/components/marketing/testimonials"), {
  loading: () => null,
});
const Pricing = dynamic(() => import("@/components/marketing/pricing"), {
  loading: () => null,
});
const CTA = dynamic(() => import("@/components/marketing/cta"), {
  loading: () => null,
});

export default function HomePage() {
  return (
    <Wrapper className="relative pb-8 sm:pb-12">
      <Hero />
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

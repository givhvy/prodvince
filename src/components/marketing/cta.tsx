import Link from "next/link";
import Container from "../global/container";
import { Button } from "../ui/button";

const CTA = () => {
  return (
    <div className="relative flex w-full flex-col items-center justify-center py-20">
      <Container className="mx-auto max-w-6xl py-20" simple>
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-foreground/20 bg-background/20 px-0 py-12 text-center lg:rounded-3xl lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-1/8 left-1/3 -z-10 h-24 w-40 -translate-x-1/2 rounded-full bg-sky-500/25 blur-2xl [contain:strict]"
          />
          <h2 className="text-3xl font-medium !leading-snug md:text-5xl lg:text-6xl">
            Ready to sell your <br /> <span className="font-subheading italic">next hit</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-accent-foreground/80 md:text-lg">
            Launch your beat store with live Whop checkout, Studio tools, and iOS-ready library sync.
          </p>
          <Link href="/studio" className="mt-8">
            <Button size="lg">Open Studio</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default CTA;

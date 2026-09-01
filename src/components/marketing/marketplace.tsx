import { BeatCard } from "@/components/beats/BeatCard";
import { getAllBeats } from "@/lib/catalog";
import Link from "next/link";
import Container from "../global/container";
import { MagicCard } from "../ui/magic-card";
import { Button } from "../ui/button";
import { ArrowRightIcon } from "lucide-react";

const Marketplace = () => {
  const beats = getAllBeats();

  return (
    <div className="relative flex w-full flex-col items-center py-10 sm:py-14 md:py-16">
      <Container>
        <div className="mx-auto mb-8 flex max-w-3xl flex-col items-center text-center sm:mb-10">
          <h2 className="font-heading text-2xl font-medium !leading-snug sm:text-3xl md:text-4xl lg:text-5xl">
            Trending on the <span className="font-subheading italic">marketplace</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base md:text-lg">
            Same card layout as Explore — uniform previews, license tiers, and Whop checkout.
          </p>
        </div>
      </Container>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {beats.map((beat, index) => (
          <Container key={beat.id} delay={0.05 * index} simple>
            <div className="h-full rounded-2xl border border-border/50 bg-background/40 lg:rounded-3xl">
              <MagicCard
                gradientFrom="#38bdf8"
                gradientTo="#3b82f6"
                gradientColor="rgba(59,130,246,0.1)"
                className="h-full p-3 lg:rounded-3xl"
              >
                <BeatCard beat={beat} rank={index + 1} className="h-full border-0 bg-transparent" />
              </MagicCard>
            </div>
          </Container>
        ))}
      </div>

      <Container delay={0.2} className="mt-8 text-center" simple>
        <Link href="/explore">
          <Button variant="secondary" size="lg">
            View full catalog
            <ArrowRightIcon className="size-4" />
          </Button>
        </Link>
      </Container>
    </div>
  );
};

export default Marketplace;

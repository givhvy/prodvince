import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import Container from "../global/container";
import Icons from "../global/icons";
import { Button } from "../ui/button";
import { OrbitingCircles } from "../ui/orbiting-circles";
import { BeatCard } from "../beats/BeatCard";
import { getTrendingBeats } from "@/lib/catalog";
import { cn } from "@/lib";

const Hero = () => {
  const trending = getTrendingBeats(4);

  return (
    <div className="relative flex w-full min-w-0 flex-col items-center py-4 sm:py-6 lg:py-8">
      {/* Full-width ambient glow: must not sit inside overflow-hidden wrappers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[min(92vh,920px)]"
      >
        <div className="absolute left-1/2 top-[46%] h-[min(70vw,680px)] w-[min(140vw,1200px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-500/50 via-blue-600/45 to-sky-400/50 blur-[90px] animate-image-glow sm:blur-[120px] lg:blur-[140px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* Orbit decoration: wide canvas, no clipping */}
      <div className="pointer-events-none absolute inset-x-0 top-12 -z-10 hidden h-[min(80vh,780px)] lg:block">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <OrbitingCircles speed={0.5} radius={300}>
            <Icons.circle1 className="size-4 text-foreground/70" />
            <Icons.circle2 className="size-1 text-foreground/80" />
          </OrbitingCircles>
          <OrbitingCircles speed={0.25} radius={400}>
            <Icons.circle2 className="size-1 text-foreground/50" />
            <Icons.circle1 className="size-4 text-foreground/60" />
            <Icons.circle2 className="size-1 text-foreground/90" />
          </OrbitingCircles>
          <OrbitingCircles speed={0.1} radius={500}>
            <Icons.circle2 className="size-1 text-foreground/50" />
            <Icons.circle2 className="size-1 text-foreground/90" />
            <Icons.circle1 className="size-4 text-foreground/60" />
            <Icons.circle2 className="size-1 text-foreground/90" />
          </OrbitingCircles>
        </div>
      </div>

      <div className="absolute left-1/2 top-0 -z-10 size-40 -translate-x-1/2 rounded-full bg-blue-500/60 blur-[10rem] lg:hidden" />

      <div className="relative z-10 flex w-full min-w-0 flex-col items-center gap-y-4 text-center sm:gap-y-5">
        <Container delay={0.1} simple>
          <h1 className="mx-auto max-w-4xl px-1 text-balance text-[1.75rem] font-bold leading-[1.08] sm:px-2 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Buy and sell beats with{" "}
            <span className="font-subheading italic">studio-grade</span> precision
          </h1>
        </Container>

        <Container delay={0.15} simple>
          <p className="mx-auto mt-2 max-w-xl px-2 text-sm text-muted-foreground sm:text-base lg:text-lg">
            Discover trending instrumentals, license instantly, and run your producer business
            from Studio on web and iOS.
          </p>
        </Container>

        <Container delay={0.2} className="z-20 w-full max-w-md sm:max-w-none" simple>
          <div className="mt-3 flex w-full flex-col items-stretch gap-3 px-1 sm:mt-4 sm:flex-row sm:items-center sm:justify-center sm:gap-x-4 sm:px-0">
            <Link href="/explore" className="group w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">
                Explore beats
                <ArrowRightIcon className="size-4 transition-all duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login?redirect=/studio" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Open Studio
              </Button>
            </Link>
          </div>
        </Container>

        <Container delay={0.25} className="relative w-full min-w-0" simple>
          {/* Glow sits behind the frame, not inside the bordered box */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-56 w-[min(100%,56rem)] -translate-x-1/2 -translate-y-1/2 animate-image-glow bg-gradient-to-r from-sky-500/80 to-blue-600/80 blur-[5rem] lg:h-72 lg:blur-[9rem]"
          />

          <div className="relative mx-auto mt-5 w-full min-w-0 max-w-6xl rounded-xl border border-border/40 bg-background/30 p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-sm sm:mt-6 lg:rounded-[32px]">
            <div className="rounded-lg border border-border/60 bg-background/95 lg:rounded-[22px]">
              <div
                className={cn(
                  "gap-3 p-2 sm:p-3 lg:p-4",
                  "flex snap-x snap-mandatory overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden",
                )}
              >
                {trending.map((beat, index) => (
                  <div
                    key={beat.id}
                    className="min-w-[82%] shrink-0 snap-center sm:min-w-0 sm:shrink"
                  >
                    <BeatCard beat={beat} rank={index + 1} compact priorityImage={index === 0} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Hero;

import { BeatCard } from "@/components/beats/BeatCard";
import { getTrendingBeats } from "@/lib/catalog";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "../ui/button";

const Marketplace = async () => {
  const beats = await getTrendingBeats(6);

  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl space-y-2">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Trending on Velta
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Top plays this week. Preview in-browser, then lease MP3, WAV, or exclusive rights.
          </p>
        </div>
        <Link href="/explore" className="shrink-0">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            Browse catalog
            <ArrowRightIcon className="size-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {beats.map((beat, index) => (
          <BeatCard key={beat.id} beat={beat} rank={index + 1} priorityImage={index < 3} />
        ))}
      </div>
    </section>
  );
};

export default Marketplace;

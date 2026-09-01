import { BeatCard } from "@/components/beats/BeatCard";
import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { MagicCard } from "@/components/ui/magic-card";
import { getAllBeats } from "@/lib/catalog";

type ExplorePageProps = {
  searchParams: Promise<{ genre?: string }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const query = await searchParams;
  const genreFilter = typeof query.genre === "string" ? query.genre : undefined;
  const beats = getAllBeats().filter((beat) =>
    genreFilter ? beat.genres.some((g) => g.toLowerCase() === genreFilter.toLowerCase()) : true,
  );

  return (
    <Wrapper className="py-12 sm:py-16 md:py-20">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <h1 className="font-heading text-3xl font-medium md:text-5xl">
            {genreFilter ? (
              <>
                <span className="font-subheading italic">{genreFilter}</span> beats
              </>
            ) : (
              <>
                Explore the <span className="font-subheading italic">marketplace</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            {genreFilter
              ? `Showing ${beats.length} listing${beats.length === 1 ? "" : "s"} in ${genreFilter}.`
              : "Full catalog with Vetra-style cards, animated sections, and live Whop licensing."}
          </p>
        </div>
      </Container>

      {beats.length === 0 ? (
        <p className="text-center text-muted-foreground">No beats found for this genre yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {beats.map((beat, index) => (
            <Container key={beat.id} delay={0.05 * index}>
              <div className="rounded-2xl border border-border/50 bg-background/40 lg:rounded-3xl">
                <MagicCard
                  gradientFrom="#38bdf8"
                  gradientTo="#3b82f6"
                  gradientColor="rgba(59,130,246,0.1)"
                  className="p-3 lg:rounded-3xl"
                >
                  <BeatCard beat={beat} rank={index + 1} />
                </MagicCard>
              </div>
            </Container>
          ))}
        </div>
      )}
    </Wrapper>
  );
}

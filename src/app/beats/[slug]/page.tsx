import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Share2 } from "lucide-react";
import { FavoriteButton } from "@/components/artist/FavoriteButton";
import { BeatCard } from "@/components/beats/BeatCard";
import { BeatCover } from "@/components/beats/BeatCover";
import { BeatPreviewButton } from "@/components/beats/BeatPreviewButton";
import { BeatWaveform } from "@/components/beats/BeatWaveform";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { Button } from "@/components/ui/button";
import { isFavorite } from "@/lib/artist";
import { getCurrentUser } from "@/lib/auth";
import { formatCount, productKindLabel } from "@/lib/format";
import { getAllBeats, getBeatBySlug, getReviewsForBeat } from "@/lib/catalog";

type BeatDetailPageProps = PageProps<"/beats/[slug]">;

export default async function BeatDetailPage({ params }: BeatDetailPageProps) {
  const { slug } = await params;
  const beat = await getBeatBySlug(slug);
  if (!beat) notFound();

  const user = await getCurrentUser();
  const [saved, reviews] = await Promise.all([
    user ? isFavorite(user.id, beat.id) : Promise.resolve(false),
    getReviewsForBeat(beat.id),
  ]);
  const related = (await getAllBeats())
    .filter((item) => item.id !== beat.id && item.genres.some((g) => beat.genres.includes(g)))
    .slice(0, 4);

  return (
    <Wrapper className="py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <BeatCover
              beat={beat}
              className="aspect-square h-auto w-full rounded-3xl"
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
            />
            <div className="flex flex-wrap gap-3">
              <BeatPreviewButton beat={beat} />
              <FavoriteButton beatId={beat.id} slug={beat.slug} saved={saved} />
              <Button variant="outline"><Share2 className="h-4 w-4" /> Share</Button>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-zinc-900/50 p-6 lg:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs text-sky-300">
                {productKindLabel(beat.kind)}
              </span>
              {beat.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">{beat.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                {beat.sellerName}
                {beat.sellerVerified ? <BadgeCheck className="h-4 w-4 text-sky-500" /> : null}
              </span>
              <span className="tabular-nums">{beat.bpm} BPM</span>
              <span>{beat.key}</span>
              <span className="tabular-nums">{formatCount(beat.plays)} plays</span>
            </div>

            <BeatWaveform seed={beat.id} className="mt-6 h-8" />

            <div className="mt-8 space-y-3">
              {beat.exclusiveSold ? (
                <p className="rounded-xl border border-white/[0.08] bg-zinc-950/40 p-4 text-sm text-muted-foreground">
                  This beat was sold exclusively and is no longer licensed.
                </p>
              ) : null}
              {beat.exclusiveSold
                ? null
                : beat.licenses.map((license) => (
                <div
                  key={license.tier}
                  className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-zinc-950/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{license.label}</p>
                    <p className="text-sm text-muted-foreground">{license.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold tabular-nums">
                      ${license.price.toFixed(2)}
                    </span>
                    <Link href={`/checkout/${beat.slug}?tier=${license.tier}`}>
                      <Button variant="blue">Buy now</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <ReviewSection beatId={beat.id} slug={beat.slug} signedIn={Boolean(user)} reviews={reviews} />

      {related.length ? (
        <div className="mt-16">
          <h2 className="text-2xl font-medium">Similar beats</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <BeatCard key={item.id} beat={item} />
            ))}
          </div>
        </div>
      ) : null}
    </Wrapper>
  );
}

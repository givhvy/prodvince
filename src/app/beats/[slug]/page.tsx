import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Heart, Share2 } from "lucide-react";
import { BeatCard } from "@/components/beats/BeatCard";
import { BeatCover } from "@/components/beats/BeatCover";
import { BeatPreviewButton } from "@/components/beats/BeatPreviewButton";
import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { getAllBeats, getBeatBySlug } from "@/lib/catalog";

type BeatDetailPageProps = PageProps<"/beats/[slug]">;

export default async function BeatDetailPage({ params }: BeatDetailPageProps) {
  const { slug } = await params;
  const beat = getBeatBySlug(slug);
  if (!beat) notFound();

  const related = getAllBeats()
    .filter((item) => item.id !== beat.id && item.genres.some((g) => beat.genres.includes(g)))
    .slice(0, 4);

  return (
    <Wrapper className="py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <BeatCover beat={beat} className="aspect-square rounded-3xl" priority sizes="(max-width: 1024px) 100vw, 560px" />
            <div className="flex flex-wrap gap-3">
              <BeatPreviewButton beat={beat} />
              <Button variant="outline"><Heart className="h-4 w-4" /> Like</Button>
              <Button variant="outline"><Share2 className="h-4 w-4" /> Share</Button>
            </div>
          </div>

          <MagicCard gradientFrom="#38bdf8" gradientTo="#3b82f6" className="rounded-3xl p-6 lg:p-8">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">{beat.genres.join(" · ")}</p>
            <h1 className="mt-3 text-3xl font-medium">{beat.title}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{beat.sellerName}</span>
              {beat.sellerVerified ? <BadgeCheck className="h-4 w-4 text-blue-500" /> : null}
              <span>· {beat.bpm} BPM · {beat.key}</span>
            </div>

            <div className="mt-8 space-y-3">
              {beat.licenses.map((license) => (
                <div key={license.tier} className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{license.label}</p>
                    <p className="text-sm text-muted-foreground">{license.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">${license.price.toFixed(2)}</span>
                    <Link href={`/checkout/${beat.slug}?tier=${license.tier}`}>
                      <Button variant="blue">Buy now</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </MagicCard>
        </div>
      </Container>

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

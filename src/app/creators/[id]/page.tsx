import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { BeatCard } from "@/components/beats/BeatCard";
import { CollabRequestForm } from "@/components/artist/CollabRequestForm";
import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { getCurrentUser } from "@/lib/auth";
import { getAllBeats, getUserById } from "@/lib/catalog";

type ProducerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProducerPage({ params }: ProducerPageProps) {
  const { id } = await params;
  const producer = await getUserById(id);
  if (!producer || producer.role !== "seller") notFound();

  const [beats, viewer] = await Promise.all([
    getAllBeats().then((catalog) => catalog.filter((beat) => beat.sellerId === producer.id)),
    getCurrentUser(),
  ]);
  const self = viewer?.id === producer.id;

  return (
    <Wrapper className="py-10 sm:py-14">
      <Container className="space-y-10">
        <header className="max-w-2xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-sky-400">Producer</p>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{producer.name}</h1>
            {beats.some((beat) => beat.sellerVerified) ? (
              <BadgeCheck className="h-5 w-5 text-sky-500" />
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {beats.length} {beats.length === 1 ? "beat" : "beats"} on Velta
          </p>
          <Link href={`/explore?seller=${encodeURIComponent(producer.id)}`} className="text-sm text-sky-400">
            Open in explore
          </Link>
        </header>

        {beats.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {beats.map((beat) => (
              <BeatCard key={beat.id} beat={beat} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No public beats right now.</p>
        )}

        {self ? null : (
          <section className="max-w-xl rounded-xl border border-white/[0.08] bg-zinc-900/50 p-5">
            <h2 className="text-lg font-semibold">Collaborate</h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">
              Send a request. {producer.name} can accept or decline it from their artist page.
            </p>
            <CollabRequestForm producerId={producer.id} signedIn={Boolean(viewer)} />
          </section>
        )}
      </Container>
    </Wrapper>
  );
}

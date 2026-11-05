import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { BeatCard } from "@/components/beats/BeatCard";
import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { getAllBeats, getProfileByHandle } from "@/lib/catalog";

type StorefrontPageProps = {
  params: Promise<{ handle: string }>;
};

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();

  const beats = profile.sellerId
    ? (await getAllBeats()).filter((beat) => beat.sellerId === profile.sellerId)
    : [];

  return (
    <Wrapper className="py-10 sm:py-14">
      <Container className="space-y-10">
        <header className="max-w-2xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-sky-400">
            {profile.kind === "producer" ? "Producer storefront" : "Artist storefront"}
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{profile.name}</h1>
            {profile.verified ? <BadgeCheck className="h-5 w-5 text-sky-500" /> : null}
          </div>
          <p className="text-sm text-muted-foreground">{profile.location}</p>
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
          {profile.sellerId ? (
            <Link href={`/creators/${profile.sellerId}`} className="text-sm text-sky-400">
              Producer page
            </Link>
          ) : (
            <Link href="/explore" className="text-sm text-sky-400">
              Find beats
            </Link>
          )}
        </header>

        {profile.kind === "producer" ? (
          beats.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {beats.map((beat) => (
                <BeatCard key={beat.id} beat={beat} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No public products right now.</p>
          )
        ) : (
          <p className="max-w-xl text-sm text-muted-foreground">
            {profile.name} licenses beats on Velta. Open Explore to hear the catalog, or request a collaboration from a producer storefront.
          </p>
        )}
      </Container>
    </Wrapper>
  );
}

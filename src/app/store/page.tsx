import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { getProfiles } from "@/lib/catalog";

export default async function StorefrontsPage() {
  const profiles = await getProfiles();
  const producers = profiles.filter((profile) => profile.kind === "producer");
  const artists = profiles.filter((profile) => profile.kind === "artist");

  return (
    <Wrapper className="py-10 sm:py-14">
      <Container className="space-y-12">
        <header className="max-w-2xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Storefronts</h1>
          <p className="text-sm text-muted-foreground">
            Producer shops for beats, loops, MIDI, kits, and stems. Artist pages for the people licensing them.
          </p>
        </header>
        <StorefrontGroup title="Producers" profiles={producers} />
        <StorefrontGroup title="Artists" profiles={artists} />
      </Container>
    </Wrapper>
  );
}

function StorefrontGroup({
  title,
  profiles,
}: {
  title: string;
  profiles: Awaited<ReturnType<typeof getProfiles>>;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map((profile) => (
          <Link
            key={profile.id}
            href={`/store/${profile.handle}`}
            className="rounded-xl border border-white/[0.08] bg-zinc-900/50 p-5 hover:border-white/14"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{profile.name}</h3>
              {profile.verified ? <BadgeCheck className="h-4 w-4 text-sky-500" /> : null}
            </div>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              {profile.kind} · {profile.location}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{profile.bio}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

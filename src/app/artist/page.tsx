import Link from "next/link";
import { BeatCard } from "@/components/beats/BeatCard";
import { ArtistProfileForm } from "@/components/artist/ArtistProfileForm";
import { CollabInbox } from "@/components/artist/CollabInbox";
import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { Button } from "@/components/ui/button";
import {
  getArtistProfile,
  listCollaborations,
  listFavoriteBeats,
  recommendBeatsForArtist,
} from "@/lib/artist";
import { getCurrentUser } from "@/lib/auth";
import type { Beat } from "@/types";

function BeatGrid({ beats }: { beats: Beat[] }) {
  if (!beats.length) {
    return <p className="text-sm text-muted-foreground">Nothing here yet.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  );
}

export default async function ArtistPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Wrapper className="py-16">
        <Container className="max-w-xl space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Artist</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to keep a profile, save beats, and request collaborations with producers.
          </p>
          <Link href="/login?redirect=/artist">
            <Button variant="blue">Sign in</Button>
          </Link>
        </Container>
      </Wrapper>
    );
  }

  const [profile, saved, recommended, collaborations] = await Promise.all([
    getArtistProfile(user.id),
    listFavoriteBeats(user.id),
    recommendBeatsForArtist(user.id),
    listCollaborations(user.id),
  ]);

  return (
    <Wrapper className="py-10 sm:py-14">
      <Container className="space-y-10">
        <header className="max-w-2xl space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-sky-400">Velta Artist</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </header>

        <section className="max-w-2xl rounded-xl border border-white/[0.08] bg-zinc-900/50 p-5">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Genres here shape the beats recommended below.
          </p>
          <ArtistProfileForm bio={profile.bio} genres={profile.genres} />
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold">Saved beats</h2>
            <Link href="/explore" className="text-sm text-sky-400 hover:text-sky-300">
              Find beats
            </Link>
          </div>
          <BeatGrid beats={saved} />
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">For you</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Matched to your genres, saves, and licenses.
              </p>
            </div>
            <Link href="/library" className="text-sm text-sky-400 hover:text-sky-300">
              Library
            </Link>
          </div>
          <BeatGrid beats={recommended} />
        </section>

        <section className="max-w-2xl space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold">Collaboration</h2>
            <Link href="/creators" className="text-sm text-sky-400 hover:text-sky-300">
              Find producers
            </Link>
          </div>
          <CollabInbox userId={user.id} collaborations={collaborations} />
        </section>
      </Container>
    </Wrapper>
  );
}

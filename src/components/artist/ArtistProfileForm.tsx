"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ArtistProfileFormProps = {
  bio: string;
  genres: string[];
};

export function ArtistProfileForm({ bio, genres }: ArtistProfileFormProps) {
  const router = useRouter();
  const [bioValue, setBioValue] = useState(bio);
  const [genreValue, setGenreValue] = useState(genres.join(", "));
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setStatus("");
    const response = await fetch("/api/artist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: bioValue,
        genres: genreValue.split(",").map((genre) => genre.trim()).filter(Boolean),
      }),
    });
    setPending(false);
    if (response.status === 401) {
      router.push("/login?redirect=/artist");
      return;
    }
    if (!response.ok) {
      setStatus("Could not save your profile");
      return;
    }
    setStatus("Saved");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <label className="block space-y-1.5 text-sm">
        <span className="text-muted-foreground">Bio</span>
        <textarea
          value={bioValue}
          maxLength={280}
          rows={3}
          onChange={(event) => setBioValue(event.target.value)}
          placeholder="What you make, and the beats you're looking for."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="text-muted-foreground">Genres</span>
        <Input
          value={genreValue}
          onChange={(event) => setGenreValue(event.target.value)}
          placeholder="Trap, R&B, Soul"
        />
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="blue" disabled={pending}>
          {pending ? "Saving" : "Save profile"}
        </Button>
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </div>
    </form>
  );
}

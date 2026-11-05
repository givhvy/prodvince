"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { BeatReview } from "@/types";

type ReviewSectionProps = {
  beatId: string;
  slug: string;
  signedIn: boolean;
  reviews: BeatReview[];
};

export function ReviewSection({ beatId, slug, signedIn, reviews }: ReviewSectionProps) {
  const router = useRouter();
  const [rating, setRating] = useState("5");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!signedIn) {
      router.push(`/login?redirect=/beats/${slug}`);
      return;
    }
    setPending(true);
    setStatus("");
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beatId, rating: Number(rating), body }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setStatus(data.error ?? "Could not save the review");
      return;
    }
    setBody("");
    setStatus("Saved");
    router.refresh();
  }

  return (
    <section className="mt-16 max-w-3xl space-y-4">
      <h2 className="text-2xl font-medium">Reviews</h2>
      {reviews.length ? (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl border border-white/[0.08] bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{review.authorName}</p>
                <p className="text-sm tabular-nums text-sky-300">{review.rating}/5</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      )}

      <form onSubmit={submit} className="space-y-3 rounded-xl border border-white/[0.08] bg-zinc-950/40 p-4">
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted-foreground">Rating</span>
          <select
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value}/5
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted-foreground">Review</span>
          <textarea
            value={body}
            required
            minLength={8}
            maxLength={500}
            rows={3}
            onChange={(event) => setBody(event.target.value)}
            placeholder="How the beat, loop, or kit worked in the session."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <div className="flex items-center gap-3">
          <Button type="submit" variant="blue" disabled={pending}>
            {pending ? "Saving" : "Post review"}
          </Button>
          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        </div>
      </form>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UploadForm({ onSuccess }: { onSuccess: (title: string) => void }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      bpm: Number(form.get("bpm") ?? 140),
      key: String(form.get("key") ?? "Cm"),
      genres: String(form.get("genres") ?? "Trap")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const response = await fetch("/api/beats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (response.ok) onSuccess(payload.title);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-border/50 bg-card p-6 sm:grid-cols-2 lg:rounded-3xl">
      <label className="space-y-2 sm:col-span-2">
        <span className="text-sm font-medium">Track title</span>
        <input name="title" required className="w-full rounded-md border border-input bg-background px-4 py-3" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">BPM</span>
        <input name="bpm" type="number" defaultValue={140} className="w-full rounded-md border border-input bg-background px-4 py-3" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Key</span>
        <input name="key" defaultValue="F# min" className="w-full rounded-md border border-input bg-background px-4 py-3" />
      </label>
      <label className="space-y-2 sm:col-span-2">
        <span className="text-sm font-medium">Genres</span>
        <input name="genres" defaultValue="Trap, Hip Hop" className="w-full rounded-md border border-input bg-background px-4 py-3" />
      </label>
      <Button type="submit" variant="blue" disabled={loading} className="sm:col-span-2">
        {loading ? "Uploading…" : "Publish beat"}
      </Button>
    </form>
  );
}

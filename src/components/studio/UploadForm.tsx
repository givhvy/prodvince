"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UploadForm({ onSuccess }: { onSuccess: (title: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = event.currentTarget;
    const payload = new FormData(form);
    const title = String(payload.get("title") ?? "");

    const response = await fetch("/api/beats", {
      method: "POST",
      body: payload,
    });

    setLoading(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(typeof body.error === "string" ? body.error : "Upload failed");
      return;
    }

    form.reset();
    onSuccess(title);
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
      <label className="space-y-2 sm:col-span-2">
        <span className="text-sm font-medium">Audio</span>
        <input name="audio" type="file" accept="audio/*" required className="w-full text-sm" />
      </label>
      <label className="space-y-2 sm:col-span-2">
        <span className="text-sm font-medium">Cover image</span>
        <input name="cover" type="file" accept="image/*" className="w-full text-sm" />
      </label>
      {error ? <p className="text-sm text-red-400 sm:col-span-2">{error}</p> : null}
      <Button type="submit" variant="blue" disabled={loading} className="sm:col-span-2">
        {loading ? "Uploading…" : "Publish beat"}
      </Button>
    </form>
  );
}

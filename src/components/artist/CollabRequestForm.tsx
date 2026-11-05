"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type CollabRequestFormProps = {
  producerId: string;
  signedIn: boolean;
};

export function CollabRequestForm({ producerId, signedIn }: CollabRequestFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!signedIn) {
      router.push(`/login?redirect=/creators/${producerId}`);
      return;
    }
    setPending(true);
    setStatus("");
    const response = await fetch("/api/collaborations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producerId, message }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setStatus(data.error ?? "Could not send the request");
      return;
    }
    setMessage("");
    setStatus("Request sent");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block space-y-1.5 text-sm">
        <span className="text-muted-foreground">Note to the producer</span>
        <textarea
          value={message}
          required
          minLength={8}
          maxLength={500}
          rows={4}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="The record, the vibe, and how you want to work together."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="blue" disabled={pending}>
          {pending ? "Sending" : "Request collaboration"}
        </Button>
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Collaboration } from "@/lib/artist";

type CollabInboxProps = {
  userId: string;
  collaborations: Collaboration[];
};

export function CollabInbox({ userId, collaborations }: CollabInboxProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState("");

  async function respond(id: string, status: "accepted" | "declined") {
    setPendingId(id);
    await fetch("/api/collaborations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setPendingId("");
    router.refresh();
  }

  if (!collaborations.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No requests yet. Open a producer and send one.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {collaborations.map((collab) => {
        const incoming = collab.producerId === userId;
        return (
          <li
            key={collab.id}
            className="rounded-xl border border-white/[0.08] bg-zinc-950/40 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {incoming ? collab.artistName : collab.producerName}
              </p>
              <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                {incoming ? "Incoming" : "Sent"} · {collab.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{collab.message}</p>
            {incoming && collab.status === "pending" ? (
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="blue"
                  disabled={pendingId === collab.id}
                  onClick={() => respond(collab.id, "accepted")}
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pendingId === collab.id}
                  onClick={() => respond(collab.id, "declined")}
                >
                  Decline
                </Button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

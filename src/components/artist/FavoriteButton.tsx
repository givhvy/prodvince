"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

type FavoriteButtonProps = {
  beatId: string;
  slug: string;
  saved: boolean;
};

export function FavoriteButton({ beatId, slug, saved }: FavoriteButtonProps) {
  const router = useRouter();
  const [on, setOn] = useState(saved);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beatId }),
    });
    setPending(false);
    if (response.status === 401) {
      router.push(`/login?redirect=/beats/${slug}`);
      return;
    }
    const data = (await response.json().catch(() => ({}))) as { saved?: boolean };
    if (response.ok) setOn(Boolean(data.saved));
  }

  return (
    <Button type="button" variant="outline" disabled={pending} onClick={toggle}>
      <Heart className={on ? "h-4 w-4 fill-current text-sky-400" : "h-4 w-4"} />
      {on ? "Saved" : "Save"}
    </Button>
  );
}

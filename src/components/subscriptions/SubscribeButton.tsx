"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type SubscribeButtonProps = {
  planId: string;
  signedIn: boolean;
  active: boolean;
};

export function SubscribeButton({ planId, signedIn, active }: SubscribeButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [on, setOn] = useState(active);

  async function subscribe() {
    if (!signedIn) {
      router.push("/login?redirect=/subscriptions");
      return;
    }
    setPending(true);
    const response = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    setPending(false);
    if (response.ok) {
      setOn(true);
      router.refresh();
    }
  }

  return (
    <Button type="button" variant="blue" disabled={pending || on} onClick={subscribe}>
      {on ? "Active" : pending ? "Starting" : "Start membership"}
    </Button>
  );
}

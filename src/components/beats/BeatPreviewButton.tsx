"use client";

import { Play } from "lucide-react";
import type { Beat } from "@/types";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/components/player/PlayerProvider";

export function BeatPreviewButton({ beat }: { beat: Beat }) {
  const { playBeat, currentBeat, isPlaying } = usePlayer();
  const active = currentBeat?.id === beat.id && isPlaying;

  return (
    <Button variant="white" onClick={() => playBeat(beat)}>
      <Play className="h-4 w-4" />
      {active ? "Playing preview" : "Play preview"}
    </Button>
  );
}

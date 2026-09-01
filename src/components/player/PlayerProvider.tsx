"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Beat } from "@/types";

type PlayerContextValue = {
  currentBeat: Beat | null;
  isPlaying: boolean;
  playBeat: (beat: Beat) => void;
  togglePlayback: () => void;
  stop: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const value = useMemo<PlayerContextValue>(
    () => ({
      currentBeat,
      isPlaying,
      playBeat: (beat) => {
        setCurrentBeat(beat);
        setIsPlaying(true);
      },
      togglePlayback: () => setIsPlaying((value) => !value),
      stop: () => {
        setIsPlaying(false);
        setCurrentBeat(null);
      },
    }),
    [currentBeat, isPlaying],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
}

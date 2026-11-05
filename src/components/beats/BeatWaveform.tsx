import { cn } from "@/lib";

function barsFromSeed(seed: string, count: number): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return Array.from({ length: count }, (_, index) => {
    const value = Math.abs(Math.sin(hash * (index + 1) * 12.9898) * 43758.5453) % 1;
    return 0.18 + value * 0.82;
  });
}

type BeatWaveformProps = {
  seed: string;
  className?: string;
  barCount?: number;
};

export function BeatWaveform({ seed, className, barCount = 28 }: BeatWaveformProps) {
  const bars = barsFromSeed(seed, barCount);

  return (
    <div
      className={cn("flex h-5 items-end gap-[2px]", className)}
      aria-hidden
    >
      {bars.map((height, index) => (
        <span
          key={`${seed}-${index}`}
          className="w-[3px] rounded-full bg-sky-500/35 transition-colors group-hover:bg-sky-400/55"
          style={{ height: `${height * 100}%` }}
        />
      ))}
    </div>
  );
}

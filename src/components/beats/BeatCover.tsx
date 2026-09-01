import Image from "next/image";
import { cn } from "@/lib";
import { designImage } from "@/lib/design-images";
import type { Beat } from "@/types";

type BeatCoverProps = {
  beat: Beat;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export function BeatCover({
  beat,
  className,
  imageClassName,
  priority,
  sizes = "(max-width: 768px) 100vw, 400px",
}: BeatCoverProps) {
  if (beat.coverImageUrl) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <Image
          src={designImage(beat.coverImageUrl, 960)}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover transition duration-500 group-hover:scale-105", imageClassName)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-br transition duration-500 group-hover:scale-105",
        beat.coverGradient,
        className,
      )}
    />
  );
}

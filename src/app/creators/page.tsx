import { CreatorsGrid } from "@/components/creators/CreatorsGrid";
import { buildCreatorCards } from "@/lib/creators";
import { getAllBeats } from "@/lib/catalog";

export default async function CreatorsPage() {
  const beats = await getAllBeats();
  const creators = new Map(
    beats.map((beat) => [
      beat.sellerId,
      {
        id: beat.sellerId,
        name: beat.sellerName,
        verified: beat.sellerVerified,
        beats: 0,
      },
    ]),
  );

  for (const beat of beats) {
    const creator = creators.get(beat.sellerId);
    if (creator) creator.beats += 1;
  }

  return <CreatorsGrid creators={buildCreatorCards([...creators.values()])} />;
}

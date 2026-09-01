import { CreatorsGrid } from "@/components/creators/CreatorsGrid";
import { buildCreatorCards } from "@/lib/creators";
import { getAllBeats } from "@/lib/catalog";

export default function CreatorsPage() {
  const creators = new Map(
    getAllBeats().map((beat) => [
      beat.sellerId,
      {
        id: beat.sellerId,
        name: beat.sellerName,
        verified: beat.sellerVerified,
        beats: 0,
      },
    ]),
  );

  for (const beat of getAllBeats()) {
    const creator = creators.get(beat.sellerId);
    if (creator) creator.beats += 1;
  }

  return <CreatorsGrid creators={buildCreatorCards([...creators.values()])} />;
}

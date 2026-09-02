import { VeltaStudioOverview } from "@/components/studio/VeltaStudioOverview";
import { getCurrentUser } from "@/lib/auth";
import { getAllBeats, getCampaignsForSeller } from "@/lib/catalog";

export default async function StudioOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const beats = getAllBeats().filter((beat) => beat.sellerId === user.id);
  const campaigns = getCampaignsForSeller(user.id);
  const totalPlays = beats.reduce((sum, beat) => sum + beat.plays, 0);
  const draftCampaigns = campaigns.filter((item) => item.status === "draft").length;

  return (
    <VeltaStudioOverview
      beats={beats}
      totalPlays={totalPlays}
      draftCampaigns={draftCampaigns}
    />
  );
}

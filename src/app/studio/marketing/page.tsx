import { MarketingClient } from "@/app/studio/marketing/marketing-client";
import { getCurrentUser } from "@/lib/auth";
import { getCampaignsForSeller } from "@/lib/catalog";

export default async function StudioMarketingPage() {
  const user = await getCurrentUser();
  const campaigns = user ? await getCampaignsForSeller(user.id) : [];
  return <MarketingClient campaigns={campaigns} />;
}

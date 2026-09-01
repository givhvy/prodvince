import beats from "@/data/beats.json";
import type { Beat, EmailCampaign, Purchase, User } from "@/types";
import { hydrateBeatWhopPlans } from "@/lib/whop-config";

const users: User[] = [
  {
    id: "user_demo_buyer",
    email: "buyer@demo.local",
    name: "Demo Buyer",
    role: "buyer",
    avatarUrl: null,
    sellerSlug: null,
    whopMemberId: null,
  },
  {
    id: "seller_velta",
    email: "studio@velta.local",
    name: "Velta Beats",
    role: "seller",
    avatarUrl: null,
    sellerSlug: "velta-beats",
    whopMemberId: null,
  },
  {
    id: "user_admin",
    email: "admin@velta.local",
    name: "Platform Admin",
    role: "admin",
    avatarUrl: null,
    sellerSlug: null,
    whopMemberId: null,
  },
];

const purchases: Purchase[] = [];
const campaigns: EmailCampaign[] = [
  {
    id: "camp_001",
    sellerId: "seller_velta",
    subject: "New trap drops this week",
    body: "3 new Drake-type beats just landed. First listen inside.",
    audience: "followers",
    status: "draft",
    scheduledAt: null,
    sentAt: null,
    recipientCount: 0,
  },
];

export function getAllBeats(): Beat[] {
  return (beats as Beat[]).map(hydrateBeatWhopPlans);
}

export function getBeatBySlug(slug: string): Beat | undefined {
  return getAllBeats().find((beat) => beat.slug === slug);
}

export function getFeaturedBeats(): Beat[] {
  return getAllBeats().filter((beat) => beat.featured);
}

export function getTrendingBeats(limit = 12): Beat[] {
  return [...getAllBeats()]
    .sort((a, b) => b.plays - a.plays)
    .slice(0, limit);
}

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
}

export function getPurchasesForUser(userId: string): Purchase[] {
  return purchases.filter((purchase) => purchase.userId === userId);
}

export function getCampaignsForSeller(sellerId: string): EmailCampaign[] {
  return campaigns.filter((campaign) => campaign.sellerId === sellerId);
}

export function recordPurchase(purchase: Purchase) {
  purchases.push(purchase);
}

export function updateBeatPlanId(
  beatId: string,
  tier: Beat["licenses"][number]["tier"],
  planId: string,
) {
  const beat = getAllBeats().find((item) => item.id === beatId);
  if (!beat) return;
  const license = beat.licenses.find((item) => item.tier === tier);
  if (license) license.whopPlanId = planId;
}

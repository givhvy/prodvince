export type UserRole = "buyer" | "seller" | "admin";

export type LicenseTier = "mp3" | "wav" | "exclusive";

export type BeatLicense = {
  tier: LicenseTier;
  label: string;
  price: number;
  whopPlanId: string | null;
  description: string;
};

export type Beat = {
  id: string;
  slug: string;
  title: string;
  bpm: number;
  key: string;
  genres: string[];
  tags: string[];
  coverGradient: string;
  coverImageUrl?: string | null;
  previewUrl: string | null;
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  plays: number;
  likes: number;
  featured: boolean;
  licenses: BeatLicense[];
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  sellerSlug: string | null;
  whopMemberId: string | null;
};

export type Purchase = {
  id: string;
  userId: string;
  beatId: string;
  licenseTier: LicenseTier;
  whopReceiptId: string;
  amount: number;
  createdAt: string;
};

export type EmailCampaign = {
  id: string;
  sellerId: string;
  subject: string;
  body: string;
  audience: "buyers" | "followers" | "all";
  status: "draft" | "scheduled" | "sent";
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
};

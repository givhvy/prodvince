export type UserRole = "buyer" | "seller" | "admin";

export type LicenseTier = "mp3" | "wav" | "exclusive";

export type BeatLicense = {
  tier: LicenseTier;
  label: string;
  price: number;
  whopPlanId: string | null;
  storeKitProductId: string | null;
  description: string;
};

export type UsageClip = {
  id: string;
  beatId: string;
  creatorName: string;
  caption: string;
  videoURL: string;
  likes: number;
  location: string;
};

export type ProductKind = "beat" | "loop" | "midi" | "drumkit" | "stems";

export type Beat = {
  id: string;
  slug: string;
  title: string;
  kind: ProductKind;
  bpm: number;
  key: string;
  genres: string[];
  tags: string[];
  coverGradient: string;
  coverImageUrl?: string | null;
  previewUrl: string | null;
  demoPreviewUrl?: string | null;
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  plays: number;
  likes: number;
  featured: boolean;
  exclusiveSold: boolean;
  licenses: BeatLicense[];
  createdAt: string;
};

export type Sale = {
  purchaseId: string;
  userId: string;
  sellerId: string;
  beatId: string;
  beatTitle: string;
  beatSlug: string;
  sellerName: string;
  tier: LicenseTier;
  tierLabel: string;
  amount: number;
  currency: "USD";
  paymentRef: string;
  purchasedAt: string;
  licenseId: string;
  licenseNumber: string;
  receiptId: string;
  receiptNumber: string;
  licenseeName: string;
  licenseeEmail: string;
  terms: string;
  fileFormat: string;
  streamCap: string;
  videoCap: string;
  exclusive: boolean;
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

export type MarketplaceProfile = {
  id: string;
  kind: "producer" | "artist";
  name: string;
  handle: string;
  bio: string;
  location: string;
  verified: boolean;
  sellerId: string | null;
};

export type BeatReview = {
  id: string;
  beatId: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  audience: "artist" | "producer";
  price: number;
  interval: "month";
  perks: string[];
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

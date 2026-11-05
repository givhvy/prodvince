import { ensureCommerceSchema } from "@/db/commerce";
import { getSql } from "@/db/client";
import { hydrateBeatWhopPlans } from "@/lib/whop-config";
import type {
  Beat,
  BeatLicense,
  BeatReview,
  EmailCampaign,
  LicenseTier,
  MarketplaceProfile,
  ProductKind,
  Purchase,
  SubscriptionPlan,
  UsageClip,
  User,
  UserRole,
} from "@/types";

type BeatRow = {
  id: string;
  slug: string;
  title: string;
  product_kind: ProductKind | null;
  bpm: number;
  musical_key: string;
  genres: string[];
  tags: string[];
  cover_gradient: string;
  cover_image_url: string | null;
  preview_url: string | null;
  demo_preview_url: string | null;
  seller_id: string;
  seller_name: string;
  seller_verified: boolean;
  plays: number;
  likes: number;
  featured: boolean;
  exclusive_sold?: boolean;
  created_at: string | Date;
};

type LicenseRow = {
  id: string;
  beat_id: string;
  tier: LicenseTier;
  label: string;
  price: string | number;
  whop_plan_id: string | null;
  store_kit_product_id: string | null;
  description: string;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: UserRole;
  avatar_url: string | null;
  seller_slug: string | null;
  whop_member_id: string | null;
};

const DEFAULT_LICENSES: Omit<BeatLicense, "whopPlanId" | "storeKitProductId">[] = [
  {
    tier: "mp3",
    label: "MP3 Lease",
    price: 29.99,
    description: "Tagged MP3, 50k streams, 1 music video",
  },
  {
    tier: "wav",
    label: "WAV Lease",
    price: 49.99,
    description: "Untagged WAV, 150k streams, 2 music videos",
  },
  {
    tier: "exclusive",
    label: "Exclusive",
    price: 299.99,
    description: "Full exclusive rights, beat removed from store",
  },
];

function iso(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    avatarUrl: row.avatar_url,
    sellerSlug: row.seller_slug,
    whopMemberId: row.whop_member_id,
  };
}

function assembleBeat(row: BeatRow, licenses: LicenseRow[]): Beat {
  return hydrateBeatWhopPlans({
    id: row.id,
    slug: row.slug,
    title: row.title,
    kind: row.product_kind ?? "beat",
    bpm: row.bpm,
    key: row.musical_key,
    genres: row.genres ?? [],
    tags: row.tags ?? [],
    coverGradient: row.cover_gradient,
    coverImageUrl: row.cover_image_url,
    previewUrl: row.preview_url,
    demoPreviewUrl: row.demo_preview_url,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    sellerVerified: row.seller_verified,
    plays: row.plays,
    likes: row.likes,
    featured: row.featured,
    exclusiveSold: Boolean(row.exclusive_sold),
    createdAt: iso(row.created_at),
    licenses: licenses
      .filter((license) => license.beat_id === row.id)
      .map((license) => ({
        tier: license.tier,
        label: license.label,
        price: Number(license.price),
        whopPlanId: license.whop_plan_id,
        storeKitProductId: license.store_kit_product_id,
        description: license.description,
      })),
  });
}

export async function getAllBeats(): Promise<Beat[]> {
  await ensureCommerceSchema();
  const sql = getSql();
  const beats = (await sql`SELECT * FROM beats WHERE exclusive_sold = false ORDER BY created_at DESC`) as BeatRow[];
  const licenses = (await sql`SELECT * FROM beat_licenses`) as LicenseRow[];
  return beats.map((beat) => assembleBeat(beat, licenses));
}

export async function getSellerBeats(sellerId: string): Promise<Beat[]> {
  await ensureCommerceSchema();
  const sql = getSql();
  const beats = (await sql`
    SELECT * FROM beats WHERE seller_id = ${sellerId} ORDER BY created_at DESC
  `) as BeatRow[];
  const licenses = (await sql`SELECT * FROM beat_licenses`) as LicenseRow[];
  return beats.map((beat) => assembleBeat(beat, licenses));
}

export async function getBeatById(id: string): Promise<Beat | undefined> {
  await ensureCommerceSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM beats WHERE id = ${id} LIMIT 1`) as BeatRow[];
  if (!rows[0]) return undefined;
  const licenses = (await sql`SELECT * FROM beat_licenses WHERE beat_id = ${id}`) as LicenseRow[];
  return assembleBeat(rows[0], licenses);
}

export async function getBeatBySlug(slug: string): Promise<Beat | undefined> {
  await ensureCommerceSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM beats WHERE slug = ${slug} LIMIT 1`) as BeatRow[];
  if (!rows[0]) return undefined;
  const licenses = (await sql`SELECT * FROM beat_licenses WHERE beat_id = ${rows[0].id}`) as LicenseRow[];
  return assembleBeat(rows[0], licenses);
}

export async function getUsageClips(): Promise<UsageClip[]> {
  await ensureCommerceSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, beat_id, creator_name, caption, video_url, likes, location
    FROM usage_clips
    ORDER BY likes DESC
  `) as Array<{
    id: string;
    beat_id: string;
    creator_name: string;
    caption: string;
    video_url: string;
    likes: number;
    location: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    beatId: row.beat_id,
    creatorName: row.creator_name,
    caption: row.caption,
    videoURL: row.video_url,
    likes: row.likes,
    location: row.location,
  }));
}

export async function getProfiles(): Promise<MarketplaceProfile[]> {
  await ensureCommerceSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM marketplace_profiles ORDER BY name`) as Array<{
    id: string;
    kind: "producer" | "artist";
    name: string;
    handle: string;
    bio: string;
    location: string;
    verified: boolean;
    seller_id: string | null;
  }>;
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    name: row.name,
    handle: row.handle,
    bio: row.bio,
    location: row.location,
    verified: row.verified,
    sellerId: row.seller_id,
  }));
}

export async function getReviewsForBeat(beatId: string): Promise<BeatReview[]> {
  const reviews = await getReviews();
  return reviews.filter((review) => review.beatId === beatId);
}

export async function addReview(input: {
  beatId: string;
  userId: string;
  authorName: string;
  rating: number;
  body: string;
}) {
  await ensureCommerceSchema();
  const sql = getSql();
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
  const body = input.body.trim().slice(0, 500);
  if (body.length < 8) {
    throw new Error("Write a short review");
  }
  const existing = (await sql`
    SELECT id FROM beat_reviews WHERE beat_id = ${input.beatId} AND user_id = ${input.userId} LIMIT 1
  `) as Array<{ id: string }>;
  if (existing[0]) {
    await sql`
      UPDATE beat_reviews
      SET rating = ${rating}, body = ${body}, author_name = ${input.authorName}
      WHERE id = ${existing[0].id}
    `;
    return { id: existing[0].id, updated: true };
  }
  const id = `review_${crypto.randomUUID().slice(0, 8)}`;
  await sql`
    INSERT INTO beat_reviews (id, beat_id, author_name, rating, body, created_at, user_id)
    VALUES (${id}, ${input.beatId}, ${input.authorName}, ${rating}, ${body}, ${new Date().toISOString()}, ${input.userId})
  `;
  return { id, updated: false };
}

export async function getProfileByHandle(handle: string): Promise<MarketplaceProfile | undefined> {
  const profiles = await getProfiles();
  return profiles.find((profile) => profile.handle === handle);
}

export async function getSubscriptionsForEmail(email: string) {
  await ensureCommerceSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, plan_id, status FROM subscriptions
    WHERE lower(user_email) = lower(${email}) AND status = 'active'
    ORDER BY created_at DESC
  `) as Array<{ id: string; plan_id: string; status: string }>;
  return rows.map((row) => ({ id: row.id, planId: row.plan_id, status: row.status }));
}

export async function getReviews(): Promise<BeatReview[]> {
  await ensureCommerceSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM beat_reviews ORDER BY created_at DESC`) as Array<{
    id: string;
    beat_id: string;
    author_name: string;
    rating: number;
    body: string;
    created_at: string | Date;
  }>;
  return rows.map((row) => ({
    id: row.id,
    beatId: row.beat_id,
    authorName: row.author_name,
    rating: row.rating,
    body: row.body,
    createdAt: iso(row.created_at),
  }));
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  await ensureCommerceSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM subscription_plans ORDER BY price`) as Array<{
    id: string;
    name: string;
    audience: "artist" | "producer";
    price: string | number;
    billing_interval: "month";
    perks: string[] | string;
  }>;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    audience: row.audience,
    price: Number(row.price),
    interval: row.billing_interval,
    perks: Array.isArray(row.perks) ? row.perks : JSON.parse(row.perks),
  }));
}

export async function createCollaboration(input: {
  fromName: string;
  profileId: string;
  beatId: string | null;
  message: string;
}) {
  await ensureCommerceSchema();
  const sql = getSql();
  const id = `collab_${crypto.randomUUID()}`;
  await sql`
    INSERT INTO collaboration_requests (id, from_name, profile_id, beat_id, message, status, created_at)
    VALUES (${id}, ${input.fromName}, ${input.profileId}, ${input.beatId}, ${input.message}, ${"open"}, ${new Date().toISOString()})
  `;
  return { id, status: "open" as const };
}

export async function createSubscription(input: { email: string; planId: string }) {
  await ensureCommerceSchema();
  const sql = getSql();
  const id = `sub_${crypto.randomUUID()}`;
  await sql`
    INSERT INTO subscriptions (id, user_email, plan_id, status, created_at)
    VALUES (${id}, ${input.email}, ${input.planId}, ${"active"}, ${new Date().toISOString()})
  `;
  return { id, status: "active" as const };
}

export async function getFeaturedBeats(): Promise<Beat[]> {
  const beats = await getAllBeats();
  return beats.filter((beat) => beat.featured);
}

export async function getTrendingBeats(limit = 12): Promise<Beat[]> {
  const beats = await getAllBeats();
  return [...beats].sort((a, b) => b.plays - a.plays).slice(0, limit);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`) as UserRow[];
  return rows[0] ? toUser(rows[0]) : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM users WHERE lower(email) = lower(${email}) LIMIT 1`) as UserRow[];
  return rows[0] ? toUser(rows[0]) : undefined;
}

export async function getAuthUserByEmail(email: string) {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM users WHERE lower(email) = lower(${email}) LIMIT 1`) as UserRow[];
  if (!rows[0]) return undefined;
  return { user: toUser(rows[0]), passwordHash: rows[0].password_hash };
}

export async function getPurchasesForUser(userId: string): Promise<Purchase[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM purchases WHERE user_id = ${userId} ORDER BY created_at DESC
  `) as Array<{
    id: string;
    user_id: string;
    beat_id: string;
    license_tier: LicenseTier;
    whop_receipt_id: string;
    amount: string | number;
    created_at: string | Date;
  }>;

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    beatId: row.beat_id,
    licenseTier: row.license_tier,
    whopReceiptId: row.whop_receipt_id,
    amount: Number(row.amount),
    createdAt: iso(row.created_at),
  }));
}

export async function getCampaignsForSeller(sellerId: string): Promise<EmailCampaign[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM email_campaigns WHERE seller_id = ${sellerId} ORDER BY COALESCE(sent_at, scheduled_at) DESC NULLS LAST
  `) as Array<{
    id: string;
    seller_id: string;
    subject: string;
    body: string;
    audience: EmailCampaign["audience"];
    status: EmailCampaign["status"];
    scheduled_at: string | Date | null;
    sent_at: string | Date | null;
    recipient_count: number;
  }>;

  return rows.map((row) => ({
    id: row.id,
    sellerId: row.seller_id,
    subject: row.subject,
    body: row.body,
    audience: row.audience,
    status: row.status,
    scheduledAt: row.scheduled_at ? iso(row.scheduled_at) : null,
    sentAt: row.sent_at ? iso(row.sent_at) : null,
    recipientCount: row.recipient_count,
  }));
}

export async function updateBeatPlanId(beatId: string, tier: LicenseTier, planId: string) {
  const sql = getSql();
  await sql`
    UPDATE beat_licenses
    SET whop_plan_id = ${planId}
    WHERE beat_id = ${beatId} AND tier = ${tier}
  `;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  sellerSlug?: string | null;
}) {
  const sql = getSql();
  const id = `user_${crypto.randomUUID()}`;
  const rows = (await sql`
    INSERT INTO users (id, email, name, password_hash, role, avatar_url, seller_slug, whop_member_id)
    VALUES (
      ${id},
      ${input.email.trim().toLowerCase()},
      ${input.name},
      ${input.passwordHash},
      ${input.role},
      ${null},
      ${input.sellerSlug ?? null},
      ${null}
    )
    RETURNING *
  `) as UserRow[];

  return toUser(rows[0]);
}

export async function saveCampaign(input: {
  sellerId: string;
  subject: string;
  body: string;
  audience: EmailCampaign["audience"];
  recipientCount: number;
}) {
  const sql = getSql();
  const id = `camp_${crypto.randomUUID()}`;
  await sql`
    INSERT INTO email_campaigns (
      id, seller_id, subject, body, audience, status, scheduled_at, sent_at, recipient_count
    )
    VALUES (
      ${id},
      ${input.sellerId},
      ${input.subject},
      ${input.body},
      ${input.audience},
      ${"sent"},
      ${null},
      ${new Date().toISOString()},
      ${input.recipientCount}
    )
  `;
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "beat";
}

export async function createBeat(input: {
  title: string;
  bpm: number;
  key: string;
  genres: string[];
  coverImageUrl: string | null;
  previewUrl: string;
  seller: User;
}) {
  const sql = getSql();
  let slug = slugify(input.title);
  const existing = await getBeatBySlug(slug);
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const id = `beat_${crypto.randomUUID()}`;
  const tags = input.genres.map((genre) => genre.toLowerCase());
  const createdAt = new Date().toISOString();

  await sql`
    INSERT INTO beats (
      id, slug, title, product_kind, bpm, musical_key, genres, tags, cover_gradient, cover_image_url,
      preview_url, demo_preview_url, seller_id, seller_name, seller_verified, plays, likes, featured, created_at
    )
    VALUES (
      ${id},
      ${slug},
      ${input.title},
      ${"beat"},
      ${input.bpm},
      ${input.key},
      ${JSON.stringify(input.genres)}::jsonb,
      ${JSON.stringify(tags)}::jsonb,
      ${"from-zinc-800 via-zinc-950 to-black"},
      ${input.coverImageUrl},
      ${input.previewUrl},
      ${null},
      ${input.seller.id},
      ${input.seller.name},
      ${input.seller.role === "seller" || input.seller.role === "admin"},
      ${0},
      ${0},
      ${false},
      ${createdAt}
    )
  `;

  for (const license of DEFAULT_LICENSES) {
    await sql`
      INSERT INTO beat_licenses (id, beat_id, tier, label, price, whop_plan_id, description)
      VALUES (
        ${`${id}:${license.tier}`},
        ${id},
        ${license.tier},
        ${license.label},
        ${license.price},
        ${null},
        ${license.description}
      )
    `;
  }

  const beat = await getBeatById(id);
  if (!beat) throw new Error("Beat was saved but could not be read back");
  return beat;
}

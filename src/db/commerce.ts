import { queryRaw } from "@/db/client";

let ready: Promise<void> | null = null;

const statements = [
  `ALTER TABLE beats ADD COLUMN IF NOT EXISTS exclusive_sold BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE beats ADD COLUMN IF NOT EXISTS product_kind TEXT NOT NULL DEFAULT 'beat'`,
  `CREATE TABLE IF NOT EXISTS marketplace_profiles (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    bio TEXT NOT NULL,
    location TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    seller_id TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS beat_reviews (
    id TEXT PRIMARY KEY,
    beat_id TEXT NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
  )`,
  `ALTER TABLE beat_reviews ADD COLUMN IF NOT EXISTS user_id TEXT`,
  `CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    audience TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    billing_interval TEXT NOT NULL,
    perks JSONB NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS collaboration_requests (
    id TEXT PRIMARY KEY,
    from_name TEXT NOT NULL,
    profile_id TEXT NOT NULL,
    beat_id TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
  )`,
  `ALTER TABLE beat_licenses ADD COLUMN IF NOT EXISTS store_kit_product_id TEXT`,
  `CREATE TABLE IF NOT EXISTS usage_clips (
    id TEXT PRIMARY KEY,
    beat_id TEXT NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    creator_name TEXT NOT NULL,
    caption TEXT NOT NULL,
    video_url TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    location TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    purchase_id TEXT NOT NULL UNIQUE REFERENCES purchases(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    beat_id TEXT NOT NULL REFERENCES beats(id),
    seller_id TEXT NOT NULL REFERENCES users(id),
    tier TEXT NOT NULL,
    tier_label TEXT NOT NULL,
    licensee_name TEXT NOT NULL,
    licensee_email TEXT NOT NULL,
    licensor_name TEXT NOT NULL,
    beat_title TEXT NOT NULL,
    beat_slug TEXT NOT NULL,
    terms TEXT NOT NULL,
    file_format TEXT NOT NULL,
    stream_cap TEXT NOT NULL,
    video_cap TEXT NOT NULL,
    exclusive BOOLEAN NOT NULL DEFAULT false,
    issued_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    purchase_id TEXT NOT NULL UNIQUE REFERENCES purchases(id),
    license_id TEXT NOT NULL UNIQUE REFERENCES licenses(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    beat_id TEXT NOT NULL REFERENCES beats(id),
    licensee_name TEXT NOT NULL,
    licensee_email TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    beat_title TEXT NOT NULL,
    tier_label TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_ref TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS purchases_buyer_beat_tier_idx ON purchases (user_id, beat_id, license_tier)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS artist_genres JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `CREATE TABLE IF NOT EXISTS favorites (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    beat_id TEXT NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, beat_id)
  )`,
  `CREATE TABLE IF NOT EXISTS collaborations (
    id TEXT PRIMARY KEY,
    artist_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    producer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS daw_projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bpm INTEGER NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1,
    document JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
];

export function ensureCommerceSchema() {
  if (!ready) {
    ready = (async () => {
      for (const statement of statements) {
        await queryRaw(statement);
      }
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

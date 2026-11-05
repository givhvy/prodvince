import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Run from beat-marketplace after vercel env pull.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const beats = JSON.parse(readFileSync(new URL("../src/data/beats.json", import.meta.url), "utf8"));
const clips = JSON.parse(readFileSync(new URL("../src/data/clips.json", import.meta.url), "utf8"));
const whop = JSON.parse(readFileSync(new URL("../src/data/whop-config.json", import.meta.url), "utf8"));
const passwordHash = bcrypt.hashSync("demo-password", 10);

const users = [
  {
    id: "user_demo_buyer",
    email: "buyer@demo.local",
    name: "Demo Buyer",
    role: "buyer",
    sellerSlug: null,
  },
  {
    id: "seller_velta",
    email: "studio@velta.local",
    name: "Velta Beats",
    role: "seller",
    sellerSlug: "velta-beats",
  },
  {
    id: "user_admin",
    email: "admin@velta.local",
    name: "Platform Admin",
    role: "admin",
    sellerSlug: null,
  },
  {
    id: "seller_blackrose",
    email: "blackrose@velta.local",
    name: "Black Rose Beatz",
    role: "seller",
    sellerSlug: "black-rose-beatz",
  },
];

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar_url TEXT,
    seller_slug TEXT,
    whop_member_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS beats (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    bpm INTEGER NOT NULL,
    musical_key TEXT NOT NULL,
    genres JSONB NOT NULL,
    tags JSONB NOT NULL,
    cover_gradient TEXT NOT NULL,
    cover_image_url TEXT,
    preview_url TEXT,
    demo_preview_url TEXT,
    seller_id TEXT NOT NULL REFERENCES users(id),
    seller_name TEXT NOT NULL,
    seller_verified BOOLEAN NOT NULL DEFAULT false,
    plays INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS beat_licenses (
    id TEXT PRIMARY KEY,
    beat_id TEXT NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    label TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    whop_plan_id TEXT,
    description TEXT NOT NULL,
    UNIQUE (beat_id, tier)
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    beat_id TEXT NOT NULL REFERENCES beats(id),
    license_tier TEXT NOT NULL,
    whop_receipt_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
  )
`;

await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS exclusive_sold BOOLEAN NOT NULL DEFAULT false`;
await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS product_kind TEXT NOT NULL DEFAULT 'beat'`;
await sql`ALTER TABLE beat_licenses ADD COLUMN IF NOT EXISTS store_kit_product_id TEXT`;

await sql`
  CREATE TABLE IF NOT EXISTS usage_clips (
    id TEXT PRIMARY KEY,
    beat_id TEXT NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    creator_name TEXT NOT NULL,
    caption TEXT NOT NULL,
    video_url TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    location TEXT NOT NULL
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS email_campaigns (
    id TEXT PRIMARY KEY,
    seller_id TEXT NOT NULL REFERENCES users(id),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    audience TEXT NOT NULL,
    status TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    recipient_count INTEGER NOT NULL DEFAULT 0
  )
`;

for (const user of users) {
  await sql`
    INSERT INTO users (id, email, name, password_hash, role, avatar_url, seller_slug, whop_member_id)
    VALUES (
      ${user.id},
      ${user.email},
      ${user.name},
      ${passwordHash},
      ${user.role},
      ${null},
      ${user.sellerSlug},
      ${null}
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role,
      seller_slug = EXCLUDED.seller_slug
  `;
}

for (const beat of beats) {
  await sql`
    INSERT INTO beats (
      id, slug, title, bpm, musical_key, genres, tags, cover_gradient, cover_image_url,
      preview_url, demo_preview_url, seller_id, seller_name, seller_verified, plays, likes, featured, created_at
    )
    VALUES (
      ${beat.id},
      ${beat.slug},
      ${beat.title},
      ${beat.bpm},
      ${beat.key},
      ${JSON.stringify(beat.genres)}::jsonb,
      ${JSON.stringify(beat.tags)}::jsonb,
      ${beat.coverGradient},
      ${beat.coverImageUrl ?? null},
      ${beat.previewUrl ?? null},
      ${beat.demoPreviewUrl ?? null},
      ${beat.sellerId},
      ${beat.sellerName},
      ${beat.sellerVerified},
      ${beat.plays},
      ${beat.likes},
      ${beat.featured},
      ${beat.createdAt}
    )
    ON CONFLICT (id) DO UPDATE SET
      slug = EXCLUDED.slug,
      title = EXCLUDED.title,
      bpm = EXCLUDED.bpm,
      musical_key = EXCLUDED.musical_key,
      genres = EXCLUDED.genres,
      tags = EXCLUDED.tags,
      cover_gradient = EXCLUDED.cover_gradient,
      cover_image_url = EXCLUDED.cover_image_url,
      preview_url = EXCLUDED.preview_url,
      demo_preview_url = EXCLUDED.demo_preview_url,
      seller_id = EXCLUDED.seller_id,
      seller_name = EXCLUDED.seller_name,
      seller_verified = EXCLUDED.seller_verified,
      plays = EXCLUDED.plays,
      likes = EXCLUDED.likes,
      featured = EXCLUDED.featured,
      created_at = EXCLUDED.created_at
  `;

  for (const license of beat.licenses) {
    const planId = whop.plans?.[beat.id]?.[license.tier] ?? license.whopPlanId ?? null;
    await sql`
      INSERT INTO beat_licenses (id, beat_id, tier, label, price, whop_plan_id, store_kit_product_id, description)
      VALUES (
        ${`${beat.id}:${license.tier}`},
        ${beat.id},
        ${license.tier},
        ${license.label},
        ${license.price},
        ${planId},
        ${license.storeKitProductId ?? null},
        ${license.description}
      )
      ON CONFLICT (id) DO UPDATE SET
        label = EXCLUDED.label,
        price = EXCLUDED.price,
        whop_plan_id = EXCLUDED.whop_plan_id,
        store_kit_product_id = EXCLUDED.store_kit_product_id,
        description = EXCLUDED.description
    `;
  }
}

for (const clip of clips) {
  await sql`
    INSERT INTO usage_clips (id, beat_id, creator_name, caption, video_url, likes, location)
    VALUES (
      ${clip.id},
      ${clip.beatId},
      ${clip.creatorName},
      ${clip.caption},
      ${clip.videoURL},
      ${clip.likes},
      ${clip.location}
    )
    ON CONFLICT (id) DO UPDATE SET
      beat_id = EXCLUDED.beat_id,
      creator_name = EXCLUDED.creator_name,
      caption = EXCLUDED.caption,
      video_url = EXCLUDED.video_url,
      likes = EXCLUDED.likes,
      location = EXCLUDED.location
  `;
}

await sql`
  INSERT INTO email_campaigns (
    id, seller_id, subject, body, audience, status, scheduled_at, sent_at, recipient_count
  )
  VALUES (
    ${"camp_001"},
    ${"seller_velta"},
    ${"New trap drops this week"},
    ${"3 new Drake-type beats just landed. First listen inside."},
    ${"followers"},
    ${"draft"},
    ${null},
    ${null},
    ${0}
  )
  ON CONFLICT (id) DO UPDATE SET
    subject = EXCLUDED.subject,
    body = EXCLUDED.body,
    audience = EXCLUDED.audience,
    status = EXCLUDED.status
`;

await sql`
  CREATE TABLE IF NOT EXISTS marketplace_profiles (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    bio TEXT NOT NULL,
    location TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    seller_id TEXT
  )
`;
await sql`
  CREATE TABLE IF NOT EXISTS beat_reviews (
    id TEXT PRIMARY KEY,
    beat_id TEXT NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
  )
`;
await sql`
  CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    audience TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    billing_interval TEXT NOT NULL,
    perks JSONB NOT NULL
  )
`;
await sql`
  CREATE TABLE IF NOT EXISTS collaboration_requests (
    id TEXT PRIMARY KEY,
    from_name TEXT NOT NULL,
    profile_id TEXT NOT NULL,
    beat_id TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
  )
`;
await sql`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
  )
`;

const extras = [
  {
    id: "loop_001",
    slug: "midnight-trap-drum-loop",
    title: "Midnight Trap Drum Loop",
    kind: "loop",
    sourceId: "beat_001",
    bpm: 142,
    key: "F# min",
    genres: ["Trap", "Hip Hop"],
    tags: ["loop", "drums", "trap"],
    plays: 4200,
    likes: 310,
  },
  {
    id: "midi_001",
    slug: "velvet-soul-chord-midi",
    title: "Velvet Soul Chord MIDI",
    kind: "midi",
    sourceId: "beat_002",
    bpm: 88,
    key: "D maj",
    genres: ["R&B", "Soul"],
    tags: ["midi", "chords", "rnb"],
    plays: 2800,
    likes: 240,
  },
  {
    id: "kit_001",
    slug: "red-rum-boom-bap-kit",
    title: "Red Rum Boom Bap Kit",
    kind: "drumkit",
    sourceId: "beat_003",
    bpm: 96,
    key: "Cm",
    genres: ["Boom Bap", "Hip Hop"],
    tags: ["drum kit", "boom bap", "one shots"],
    plays: 6100,
    likes: 480,
  },
  {
    id: "stems_001",
    slug: "night-drive-stems",
    title: "Night Drive Stems",
    kind: "stems",
    sourceId: "beat_004",
    bpm: 104,
    key: "G min",
    genres: ["Afrobeats", "Trap"],
    tags: ["stems", "afro", "multitrack"],
    plays: 1900,
    likes: 160,
  },
];

const profiles = [
  {
    id: "producer_velta",
    kind: "producer",
    name: "Velta Beats",
    handle: "velta-beats",
    bio: "Trap, R&B, and Afro type beats. Leases and exclusives from the Velta store.",
    location: "Los Angeles",
    verified: true,
    sellerId: "seller_velta",
  },
  {
    id: "producer_blackrose",
    kind: "producer",
    name: "Black Rose Beatz",
    handle: "black-rose-beatz",
    bio: "90s boom bap, dusty samples, and drum kits.",
    location: "Brooklyn",
    verified: true,
    sellerId: "seller_blackrose",
  },
  {
    id: "artist_nova",
    kind: "artist",
    name: "NOVA",
    handle: "nova",
    bio: "Records hooks over Velta leases and posts booth clips.",
    location: "Atlanta",
    verified: true,
    sellerId: null,
  },
  {
    id: "artist_lina",
    kind: "artist",
    name: "Lina V.",
    handle: "lina-v",
    bio: "Late-night R&B vocals. Open to producer collabs.",
    location: "London",
    verified: false,
    sellerId: null,
  },
];

const reviews = [
  ["review_001", "beat_001", "NOVA", 5, "The melody sits under a hook without fighting it."],
  ["review_002", "beat_001", "Jett", 4, "Dark enough for a night record, drums are already mixed."],
  ["review_003", "beat_002", "Lina V.", 5, "Velvet Soul left room for the vocal. Leased the WAV."],
  ["review_004", "beat_003", "Kade", 5, "Red Rum sounds like a real 90s session, not a preset."],
  ["review_005", "beat_004", "Amara", 4, "Night Drive moves. The Afro trap pocket is easy to write to."],
];

const plans = [
  {
    id: "plan_artist_monthly",
    name: "Artist",
    audience: "artist",
    price: 12,
    perks: ["Save favorites across devices", "Artist profile", "Collab requests", "Recommended beats"],
  },
  {
    id: "plan_producer_monthly",
    name: "Producer",
    audience: "producer",
    price: 29,
    perks: ["Producer storefront", "Upload beats, loops, MIDI, kits, and stems", "Seller dashboard", "Exclusive licenses"],
  },
];

for (const extra of extras) {
  const source = beats.find((beat) => beat.id === extra.sourceId);
  if (!source) continue;
  await sql`
    INSERT INTO beats (
      id, slug, title, product_kind, bpm, musical_key, genres, tags, cover_gradient, cover_image_url,
      preview_url, demo_preview_url, seller_id, seller_name, seller_verified, plays, likes, featured, created_at
    )
    VALUES (
      ${extra.id},
      ${extra.slug},
      ${extra.title},
      ${extra.kind},
      ${extra.bpm},
      ${extra.key},
      ${JSON.stringify(extra.genres)}::jsonb,
      ${JSON.stringify(extra.tags)}::jsonb,
      ${source.coverGradient},
      ${source.coverImageUrl ?? null},
      ${source.previewUrl ?? null},
      ${source.demoPreviewUrl ?? null},
      ${source.sellerId},
      ${source.sellerName},
      ${source.sellerVerified},
      ${extra.plays},
      ${extra.likes},
      ${false},
      ${source.createdAt}
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      product_kind = EXCLUDED.product_kind,
      plays = EXCLUDED.plays,
      likes = EXCLUDED.likes
  `;

  for (const license of source.licenses) {
    const planId = whop.plans?.[source.id]?.[license.tier] ?? license.whopPlanId ?? null;
    await sql`
      INSERT INTO beat_licenses (id, beat_id, tier, label, price, whop_plan_id, store_kit_product_id, description)
      VALUES (
        ${`${extra.id}:${license.tier}`},
        ${extra.id},
        ${license.tier},
        ${license.label},
        ${license.price},
        ${planId},
        ${null},
        ${license.description}
      )
      ON CONFLICT (id) DO UPDATE SET
        label = EXCLUDED.label,
        price = EXCLUDED.price,
        whop_plan_id = EXCLUDED.whop_plan_id,
        description = EXCLUDED.description
  `;
  }
}

for (const profile of profiles) {
  await sql`
    INSERT INTO marketplace_profiles (id, kind, name, handle, bio, location, verified, seller_id)
    VALUES (
      ${profile.id},
      ${profile.kind},
      ${profile.name},
      ${profile.handle},
      ${profile.bio},
      ${profile.location},
      ${profile.verified},
      ${profile.sellerId}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      bio = EXCLUDED.bio,
      location = EXCLUDED.location,
      verified = EXCLUDED.verified,
      seller_id = EXCLUDED.seller_id
  `;
}

for (const [id, beatId, author, rating, body] of reviews) {
  await sql`
    INSERT INTO beat_reviews (id, beat_id, author_name, rating, body, created_at)
    VALUES (${id}, ${beatId}, ${author}, ${rating}, ${body}, ${"2026-09-10T12:00:00.000Z"})
    ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, rating = EXCLUDED.rating
  `;
}

for (const plan of plans) {
  await sql`
    INSERT INTO subscription_plans (id, name, audience, price, billing_interval, perks)
    VALUES (
      ${plan.id},
      ${plan.name},
      ${plan.audience},
      ${plan.price},
      ${"month"},
      ${JSON.stringify(plan.perks)}::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      price = EXCLUDED.price,
      perks = EXCLUDED.perks
  `;
}

const counts = await sql`
  SELECT
    (SELECT count(*)::int FROM users) AS users,
    (SELECT count(*)::int FROM beats) AS beats,
    (SELECT count(*)::int FROM beat_licenses) AS licenses,
    (SELECT count(*)::int FROM usage_clips) AS clips,
    (SELECT count(*)::int FROM email_campaigns) AS campaigns,
    (SELECT count(*)::int FROM beats WHERE product_kind <> 'beat') AS products,
    (SELECT count(*)::int FROM marketplace_profiles) AS profiles,
    (SELECT count(*)::int FROM beat_reviews) AS reviews,
    (SELECT count(*)::int FROM subscription_plans) AS plans
`;

console.log(counts[0]);

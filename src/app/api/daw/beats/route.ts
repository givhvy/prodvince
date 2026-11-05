import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSql } from "@/db/client";
import { ensureCommerceSchema } from "@/db/commerce";
import { canAccessStudio, getUserFromAuthorization } from "@/lib/auth";
import { MEDIA_FALLBACK_BASE } from "@/lib/media";

/**
 * Velta DAW <-> prodvince.com.
 *
 * A finished beat is published by the DAW in two steps:
 *   1. files go to the shared R2 bucket (via stratum-cloud-api, which checks this
 *      seller's token against /api/mobile/auth/me),
 *   2. the DAW calls POST /api/daw/beats with the slug and metadata and the beat
 *      appears in the catalog (web + iOS).
 *
 * The slug is "<title>-<sellerTag><projectTag>": sellerTag is the first 4 hex of
 * sha256(user id), so a seller can only ever write their own slugs, and the same
 * Velta project always maps to the same beat (re-finishing updates it).
 */

export const maxDuration = 30;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SLUG = /^[a-z0-9][a-z0-9-]{2,90}-[0-9a-f]{8}$/;

const DEFAULT_LICENSES = [
  { tier: "mp3", label: "MP3 Lease", price: 29.99, description: "Tagged MP3, 50k streams, 1 music video" },
  { tier: "wav", label: "WAV Lease", price: 49.99, description: "Untagged WAV, 150k streams, 2 music videos" },
  { tier: "exclusive", label: "Exclusive", price: 299.99, description: "Full exclusive rights, beat removed from store" },
];

function sellerTag(userId: string) {
  return createHash("sha256").update(userId).digest("hex").slice(0, 4);
}

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: corsHeaders });
}

async function exists(key: string) {
  try {
    const response = await fetch(`${MEDIA_FALLBACK_BASE}/${key}`, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function list(value: unknown, fallback: string[]) {
  const items = Array.isArray(value) ? value : [];
  const clean = items
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 8);
  return clean.length > 0 ? clean : fallback;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  const user = await getUserFromAuthorization(request);
  if (!user || !canAccessStudio(user.role)) return fail("Sign in as a seller", 401);
  await ensureCommerceSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, slug, title, bpm, musical_key, preview_url, cover_image_url, created_at
    FROM beats WHERE seller_id = ${user.id} ORDER BY created_at DESC LIMIT 200
  `) as Array<Record<string, unknown>>;
  return NextResponse.json(
    {
      ok: true,
      sellerTag: sellerTag(user.id),
      beats: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        bpm: row.bpm,
        key: row.musical_key,
        previewUrl: row.preview_url,
        coverImageUrl: row.cover_image_url,
        fromVelta: SLUG.test(String(row.slug)),
      })),
    },
    { headers: corsHeaders },
  );
}

export async function POST(request: Request) {
  const user = await getUserFromAuthorization(request);
  if (!user || !canAccessStudio(user.role)) return fail("Sign in as a seller", 401);

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const slug = typeof body.slug === "string" ? body.slug : "";
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
  if (!SLUG.test(slug)) return fail("Invalid slug", 400);
  if (slug.slice(-8, -4) !== sellerTag(user.id)) return fail("That slug belongs to another seller", 403);
  if (!title) return fail("Title is required", 400);

  const bpm = Math.min(250, Math.max(40, Math.round(Number(body.bpm) || 140)));
  const key = typeof body.key === "string" && body.key.trim() ? body.key.trim().slice(0, 12) : "C min";
  const genres = list(body.genres, ["Hip Hop"]);
  const tags = list(body.tags, genres.map((genre) => genre.toLowerCase()));

  // Both the preview and the WAV must really be in the bucket before the beat goes live.
  const previewKey = `marketplace/previews/${slug}.mp3`;
  const wavKey = `marketplace/downloads/${slug}.wav`;
  const [hasPreview, hasWav] = await Promise.all([exists(previewKey), exists(wavKey)]);
  if (!hasPreview || !hasWav) {
    return fail(`Upload the ${!hasPreview ? "preview" : "WAV"} first (${!hasPreview ? previewKey : wavKey})`, 409);
  }
  const coverKey = typeof body.coverKey === "string" && /^marketplace\/covers\/[a-z0-9-]+\.(jpg|png)$/.test(body.coverKey)
    ? body.coverKey
    : null;
  const coverUrl = coverKey && (await exists(coverKey)) ? `${MEDIA_FALLBACK_BASE}/${coverKey}` : null;
  const previewUrl = `${MEDIA_FALLBACK_BASE}/${previewKey}`;

  await ensureCommerceSchema();
  const sql = getSql();
  const found = (await sql`SELECT id, seller_id, exclusive_sold FROM beats WHERE slug = ${slug} LIMIT 1`) as Array<{
    id: string;
    seller_id: string;
    exclusive_sold: boolean;
  }>;

  if (found[0]) {
    if (found[0].seller_id !== user.id) return fail("That slug belongs to another seller", 403);
    await sql`
      UPDATE beats SET
        title = ${title}, bpm = ${bpm}, musical_key = ${key},
        genres = ${JSON.stringify(genres)}::jsonb, tags = ${JSON.stringify(tags)}::jsonb,
        preview_url = ${previewUrl},
        cover_image_url = COALESCE(${coverUrl}, cover_image_url)
      WHERE id = ${found[0].id}
    `;
    return NextResponse.json(
      { ok: true, created: false, id: found[0].id, slug, url: `https://prodvince.com/beats/${slug}` },
      { headers: corsHeaders },
    );
  }

  const id = `beat_${crypto.randomUUID()}`;
  await sql`
    INSERT INTO beats (
      id, slug, title, product_kind, bpm, musical_key, genres, tags, cover_gradient, cover_image_url,
      preview_url, demo_preview_url, seller_id, seller_name, seller_verified, plays, likes, featured, created_at
    )
    VALUES (
      ${id}, ${slug}, ${title}, ${"beat"}, ${bpm}, ${key},
      ${JSON.stringify(genres)}::jsonb, ${JSON.stringify(tags)}::jsonb,
      ${"from-zinc-800 via-zinc-950 to-black"}, ${coverUrl},
      ${previewUrl}, ${null}, ${user.id}, ${user.name}, ${true}, ${0}, ${0}, ${false}, ${new Date().toISOString()}
    )
  `;
  for (const license of DEFAULT_LICENSES) {
    await sql`
      INSERT INTO beat_licenses (id, beat_id, tier, label, price, whop_plan_id, description)
      VALUES (${`${id}:${license.tier}`}, ${id}, ${license.tier}, ${license.label}, ${license.price}, ${null}, ${license.description})
    `;
  }
  return NextResponse.json(
    { ok: true, created: true, id, slug, url: `https://prodvince.com/beats/${slug}` },
    { status: 201, headers: corsHeaders },
  );
}

/** Take a Velta beat off the marketplace. Beats with a sale stay (buyers keep their licence). */
export async function DELETE(request: Request) {
  const user = await getUserFromAuthorization(request);
  if (!user || !canAccessStudio(user.role)) return fail("Sign in as a seller", 401);
  const slug = new URL(request.url).searchParams.get("slug") ?? "";
  if (!SLUG.test(slug)) return fail("Invalid slug", 400);

  await ensureCommerceSchema();
  const sql = getSql();
  const found = (await sql`SELECT id, seller_id FROM beats WHERE slug = ${slug} LIMIT 1`) as Array<{
    id: string;
    seller_id: string;
  }>;
  if (!found[0]) return NextResponse.json({ ok: true, removed: false }, { headers: corsHeaders });
  if (found[0].seller_id !== user.id && user.role !== "admin") return fail("That beat belongs to another seller", 403);

  const sold = (await sql`SELECT 1 AS n FROM purchases WHERE beat_id = ${found[0].id} LIMIT 1`) as unknown[];
  if (sold.length > 0) return fail("This beat has sales, so it cannot be removed", 409);

  await sql`DELETE FROM beat_licenses WHERE beat_id = ${found[0].id}`;
  await sql`DELETE FROM beats WHERE id = ${found[0].id}`;
  return NextResponse.json({ ok: true, removed: true }, { headers: corsHeaders });
}

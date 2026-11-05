import { ensureCommerceSchema } from "@/db/commerce";
import { queryRows } from "@/db/client";
import { getAllBeats, getBeatById, getPurchasesForUser, getUserById } from "@/lib/catalog";
import type { Beat } from "@/types";

export type ArtistProfile = {
  bio: string;
  genres: string[];
};

export type CollaborationStatus = "pending" | "accepted" | "declined";

export type Collaboration = {
  id: string;
  artistId: string;
  artistName: string;
  producerId: string;
  producerName: string;
  message: string;
  status: CollaborationStatus;
  createdAt: string;
};

type ProfileRow = {
  bio: string | null;
  artist_genres: unknown;
};

type FavoriteRow = {
  beat_id: string;
};

type CollabRow = {
  id: string;
  artist_id: string;
  artist_name: string;
  producer_id: string;
  producer_name: string;
  message: string;
  status: string;
  created_at: string | Date;
};

function iso(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function asGenres(value: unknown): string[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? safeJsonArray(value)
      : [];
  return list.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function safeJsonArray(value: string): unknown[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cleanGenres(genres: string[]) {
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const genre of genres) {
    const next = genre.trim().slice(0, 32);
    const key = next.toLowerCase();
    if (!next || seen.has(key)) continue;
    seen.add(key);
    cleaned.push(next);
    if (cleaned.length === 8) break;
  }
  return cleaned;
}

export async function getArtistProfile(userId: string): Promise<ArtistProfile> {
  await ensureCommerceSchema();
  const rows = await queryRows<ProfileRow>(
    `SELECT bio, artist_genres FROM users WHERE id = $1 LIMIT 1`,
    [userId],
  );
  const row = rows[0];
  return {
    bio: row?.bio ?? "",
    genres: asGenres(row?.artist_genres),
  };
}

export async function updateArtistProfile(
  userId: string,
  input: { bio: string; genres: string[] },
) {
  await ensureCommerceSchema();
  const bio = input.bio.trim().slice(0, 280);
  const genres = cleanGenres(input.genres);
  await queryRows(
    `UPDATE users SET bio = $1, artist_genres = $2::jsonb WHERE id = $3`,
    [bio, JSON.stringify(genres), userId],
  );
  return { bio, genres };
}

export async function listFavoriteBeatIds(userId: string) {
  await ensureCommerceSchema();
  const rows = await queryRows<FavoriteRow>(
    `SELECT beat_id FROM favorites WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map((row) => row.beat_id);
}

export async function isFavorite(userId: string, beatId: string) {
  await ensureCommerceSchema();
  const rows = await queryRows<FavoriteRow>(
    `SELECT beat_id FROM favorites WHERE user_id = $1 AND beat_id = $2 LIMIT 1`,
    [userId, beatId],
  );
  return rows.length > 0;
}

export async function listFavoriteBeats(userId: string) {
  const ids = await listFavoriteBeatIds(userId);
  const beats = await Promise.all(ids.map((id) => getBeatById(id)));
  return beats.filter((beat): beat is Beat => Boolean(beat));
}

export async function toggleFavorite(userId: string, beatId: string) {
  await ensureCommerceSchema();
  const beat = await getBeatById(beatId);
  if (!beat) return null;
  const saved = await isFavorite(userId, beatId);
  if (saved) {
    await queryRows(`DELETE FROM favorites WHERE user_id = $1 AND beat_id = $2`, [userId, beatId]);
    return { saved: false };
  }
  await queryRows(
    `INSERT INTO favorites (user_id, beat_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [userId, beatId],
  );
  return { saved: true };
}

function toCollaboration(row: CollabRow): Collaboration {
  const status: CollaborationStatus =
    row.status === "accepted" || row.status === "declined" ? row.status : "pending";
  return {
    id: row.id,
    artistId: row.artist_id,
    artistName: row.artist_name,
    producerId: row.producer_id,
    producerName: row.producer_name,
    message: row.message,
    status,
    createdAt: iso(row.created_at),
  };
}

const collabSelect = `
  SELECT c.id, c.artist_id, artist.name AS artist_name, c.producer_id,
         producer.name AS producer_name, c.message, c.status, c.created_at
  FROM collaborations c
  JOIN users artist ON artist.id = c.artist_id
  JOIN users producer ON producer.id = c.producer_id
`;

export async function listCollaborations(userId: string) {
  await ensureCommerceSchema();
  const rows = await queryRows<CollabRow>(
    `${collabSelect} WHERE c.artist_id = $1 OR c.producer_id = $1 ORDER BY c.created_at DESC`,
    [userId],
  );
  return rows.map(toCollaboration);
}

export async function createCollaboration(input: {
  artistId: string;
  producerId: string;
  message: string;
}) {
  await ensureCommerceSchema();
  const message = input.message.trim().slice(0, 500);
  if (message.length < 8) {
    throw new ArtistError("Write a short note about the collaboration", 400);
  }
  if (input.artistId === input.producerId) {
    throw new ArtistError("You can't request a collaboration with yourself", 400);
  }
  const producer = await getUserById(input.producerId);
  if (!producer || producer.role !== "seller") {
    throw new ArtistError("That producer is not on Velta", 404);
  }
  const pending = await queryRows<{ id: string }>(
    `SELECT id FROM collaborations
     WHERE artist_id = $1 AND producer_id = $2 AND status = 'pending' LIMIT 1`,
    [input.artistId, input.producerId],
  );
  if (pending.length) {
    throw new ArtistError("You already have an open request with this producer", 409);
  }
  const id = `collab_${crypto.randomUUID().slice(0, 8)}`;
  await queryRows(
    `INSERT INTO collaborations (id, artist_id, producer_id, message, status)
     VALUES ($1, $2, $3, $4, 'pending')`,
    [id, input.artistId, input.producerId, message],
  );
  const rows = await queryRows<CollabRow>(`${collabSelect} WHERE c.id = $1 LIMIT 1`, [id]);
  const created = rows[0] ? toCollaboration(rows[0]) : null;
  if (!created) throw new ArtistError("The request was saved but could not be read back", 500);
  return created;
}

export async function setCollaborationStatus(
  id: string,
  userId: string,
  status: Exclude<CollaborationStatus, "pending">,
) {
  await ensureCommerceSchema();
  const rows = await queryRows<CollabRow>(`${collabSelect} WHERE c.id = $1 LIMIT 1`, [id]);
  const current = rows[0] ? toCollaboration(rows[0]) : null;
  if (!current) throw new ArtistError("Collaboration not found", 404);
  if (current.producerId !== userId) {
    throw new ArtistError("Only the producer can respond to this request", 403);
  }
  if (current.status !== "pending") {
    throw new ArtistError("This request has already been answered", 409);
  }
  await queryRows(`UPDATE collaborations SET status = $1 WHERE id = $2`, [status, id]);
  return { ...current, status };
}

export async function recommendBeatsForArtist(userId: string, limit = 8): Promise<Beat[]> {
  const [profile, favoriteIds, purchases, catalog] = await Promise.all([
    getArtistProfile(userId),
    listFavoriteBeatIds(userId),
    getPurchasesForUser(userId),
    getAllBeats(),
  ]);
  const owned = new Set(purchases.map((purchase) => purchase.beatId));
  const saved = new Set(favoriteIds);
  const taste = new Set(profile.genres.map((genre) => genre.toLowerCase()));

  for (const beat of catalog) {
    if (!owned.has(beat.id) && !saved.has(beat.id)) continue;
    for (const genre of beat.genres) taste.add(genre.toLowerCase());
  }

  const candidates = catalog.filter(
    (beat) => !owned.has(beat.id) && !saved.has(beat.id) && !beat.exclusiveSold,
  );
  if (taste.size === 0) {
    return [...candidates].sort((a, b) => b.plays - a.plays).slice(0, limit);
  }

  return candidates
    .map((beat) => ({
      beat,
      score:
        beat.genres.filter((genre) => taste.has(genre.toLowerCase())).length * 100 +
        beat.plays / 1000 +
        (beat.featured ? 5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.beat);
}

export class ArtistError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

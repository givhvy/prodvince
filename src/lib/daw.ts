import { ensureCommerceSchema } from "@/db/commerce";
import { queryRows } from "@/db/client";

export type DawChannel = {
  id: string;
  name: string;
  steps: boolean[];
};

export type DawNote = {
  pitch: number;
  step: number;
};

export type DawClip = {
  id: string;
  name: string;
  url: string;
};

export type DawDocument = {
  channels: DawChannel[];
  notes: DawNote[];
  clips: DawClip[];
  activeClipId: string | null;
};

export type DawProject = {
  id: string;
  name: string;
  bpm: number;
  revision: number;
  updatedAt: string;
  document: DawDocument;
};

type ProjectRow = {
  id: string;
  name: string;
  bpm: number;
  revision: number;
  document: DawDocument | string;
  updated_at: string | Date;
};

function iso(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function asDocument(value: DawDocument | string): DawDocument {
  const parsed = typeof value === "string" ? (JSON.parse(value) as DawDocument) : value;
  return {
    channels: Array.isArray(parsed.channels) ? parsed.channels : emptyDocument().channels,
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    clips: Array.isArray(parsed.clips) ? parsed.clips : [],
    activeClipId: parsed.activeClipId ?? null,
  };
}

export function emptyDocument(): DawDocument {
  return {
    channels: [
      { id: "kick", name: "Kick", steps: Array(16).fill(false) },
      { id: "snare", name: "Snare", steps: Array(16).fill(false) },
      { id: "hat", name: "Hat", steps: Array(16).fill(false) },
    ],
    notes: [],
    clips: [],
    activeClipId: null,
  };
}

function toProject(row: ProjectRow): DawProject {
  return {
    id: row.id,
    name: row.name,
    bpm: row.bpm,
    revision: row.revision,
    updatedAt: iso(row.updated_at),
    document: asDocument(row.document),
  };
}

export async function listDawProjects(userId: string) {
  await ensureCommerceSchema();
  const rows = await queryRows<ProjectRow>(
    `SELECT id, name, bpm, revision, document, updated_at
     FROM daw_projects WHERE user_id = $1 ORDER BY updated_at DESC`,
    [userId],
  );
  return rows.map(toProject);
}

export async function getDawProject(userId: string, id: string) {
  await ensureCommerceSchema();
  const rows = await queryRows<ProjectRow>(
    `SELECT id, name, bpm, revision, document, updated_at
     FROM daw_projects WHERE user_id = $1 AND id = $2 LIMIT 1`,
    [userId, id],
  );
  return rows[0] ? toProject(rows[0]) : null;
}

export async function createDawProject(userId: string, name: string) {
  await ensureCommerceSchema();
  const id = `daw_${crypto.randomUUID().slice(0, 8)}`;
  const document = emptyDocument();
  const rows = await queryRows<ProjectRow>(
    `INSERT INTO daw_projects (id, user_id, name, bpm, revision, document)
     VALUES ($1, $2, $3, 140, 1, $4::jsonb)
     RETURNING id, name, bpm, revision, document, updated_at`,
    [id, userId, name.trim().slice(0, 80) || "Untitled beat", JSON.stringify(document)],
  );
  const created = rows[0] ? toProject(rows[0]) : null;
  if (!created) throw new Error("The project was saved but could not be read back");
  return created;
}

export async function saveDawProject(
  userId: string,
  input: { id: string; name: string; bpm: number; revision: number; document: DawDocument },
) {
  await ensureCommerceSchema();
  const bpm = Math.min(200, Math.max(60, Math.round(input.bpm) || 140));
  const rows = await queryRows<{ revision: number; updated_at: string | Date }>(
    `UPDATE daw_projects
     SET name = $1, bpm = $2, document = $3::jsonb, revision = revision + 1, updated_at = now()
     WHERE id = $4 AND user_id = $5 AND revision = $6
     RETURNING revision, updated_at`,
    [
      input.name.trim().slice(0, 80) || "Untitled beat",
      bpm,
      JSON.stringify(input.document),
      input.id,
      userId,
      input.revision,
    ],
  );
  if (rows[0]) {
    return { revision: rows[0].revision, updatedAt: iso(rows[0].updated_at), conflict: null as DawProject | null };
  }
  const current = await getDawProject(userId, input.id);
  if (!current) return null;
  return { revision: current.revision, updatedAt: current.updatedAt, conflict: current };
}

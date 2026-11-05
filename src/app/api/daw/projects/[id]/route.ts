import { NextResponse } from "next/server";
import { getUserFromAuthorization } from "@/lib/auth";
import { getDawProject, saveDawProject, type DawDocument } from "@/lib/daw";

type RouteContext = { params: Promise<{ id: string }> };

function isDocument(value: unknown): value is DawDocument {
  if (!value || typeof value !== "object") return false;
  const document = value as DawDocument;
  return Array.isArray(document.channels) && Array.isArray(document.notes) && Array.isArray(document.clips);
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getUserFromAuthorization(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const project = await getDawProject(user.id, id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PUT(request: Request, context: RouteContext) {
  const user = await getUserFromAuthorization(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  if (!isDocument(body.document) || typeof body.revision !== "number") {
    return NextResponse.json({ error: "Missing project" }, { status: 400 });
  }
  const saved = await saveDawProject(user.id, {
    id,
    name: typeof body.name === "string" ? body.name : "Untitled beat",
    bpm: Number(body.bpm),
    revision: body.revision,
    document: body.document,
  });
  if (!saved) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (saved.conflict) {
    return NextResponse.json({ error: "Newer version on another device", project: saved.conflict }, { status: 409 });
  }
  return NextResponse.json({ ok: true, revision: saved.revision, updatedAt: saved.updatedAt });
}

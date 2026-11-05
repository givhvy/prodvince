import { NextResponse } from "next/server";
import { getUserFromAuthorization } from "@/lib/auth";
import { createDawProject, listDawProjects } from "@/lib/daw";

export async function GET(request: Request) {
  const user = await getUserFromAuthorization(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await listDawProjects(user.id);
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const user = await getUserFromAuthorization(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "Untitled beat";
  const project = await createDawProject(user.id, name);
  return NextResponse.json({ project });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toggleFavorite } from "@/lib/artist";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const beatId = typeof body.beatId === "string" ? body.beatId : "";
  if (!beatId) {
    return NextResponse.json({ error: "Missing beat" }, { status: 400 });
  }

  const result = await toggleFavorite(user.id, beatId);
  if (!result) {
    return NextResponse.json({ error: "Beat not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, saved: result.saved });
}

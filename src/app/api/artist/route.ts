import { NextResponse } from "next/server";
import { ArtistError, updateArtistProfile } from "@/lib/artist";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const bio = typeof body.bio === "string" ? body.bio : "";
  const genres = Array.isArray(body.genres)
    ? body.genres.filter((genre: unknown): genre is string => typeof genre === "string")
    : [];

  try {
    const profile = await updateArtistProfile(user.id, { bio, genres });
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    if (error instanceof ArtistError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { canAccessStudio, getCurrentUser } from "@/lib/auth";
import { createBeat } from "@/lib/catalog";

export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canAccessStudio(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const bpm = Number(form.get("bpm") ?? 140);
  const key = String(form.get("key") ?? "C min").trim() || "C min";
  const genres = String(form.get("genres") ?? "Trap")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const audio = form.get("audio");
  const cover = form.get("cover");

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "Upload an audio file" }, { status: 400 });
  }

  const audioBlob = await put(`beats/${user.id}/audio/${audio.name}`, audio, {
    access: "public",
    addRandomSuffix: true,
    contentType: audio.type || "audio/mpeg",
  });

  let coverImageUrl: string | null = null;
  if (cover instanceof File && cover.size > 0) {
    const coverBlob = await put(`beats/${user.id}/covers/${cover.name}`, cover, {
      access: "public",
      addRandomSuffix: true,
      contentType: cover.type || "image/jpeg",
    });
    coverImageUrl = coverBlob.url;
  }

  const beat = await createBeat({
    title,
    bpm: Number.isFinite(bpm) ? bpm : 140,
    key,
    genres: genres.length > 0 ? genres : ["Trap"],
    coverImageUrl,
    previewUrl: audioBlob.url,
    seller: user,
  });

  return NextResponse.json({ ok: true, beat });
}

import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getUserFromAuthorization } from "@/lib/auth";

export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getUserFromAuthorization(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "Choose an audio file" }, { status: 400 });
  }
  if (audio.size > 40 * 1024 * 1024) {
    return NextResponse.json({ error: "Keep uploads under 40 MB" }, { status: 400 });
  }

  const blob = await put(`daw/${user.id}/${audio.name}`, audio, {
    access: "public",
    addRandomSuffix: true,
    contentType: audio.type || "audio/mpeg",
  });

  return NextResponse.json({
    clip: {
      id: `clip_${crypto.randomUUID().slice(0, 8)}`,
      name: audio.name,
      url: blob.url,
    },
  });
}

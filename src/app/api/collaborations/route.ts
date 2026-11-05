import { NextResponse } from "next/server";
import { ArtistError, createCollaboration, setCollaborationStatus } from "@/lib/artist";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const producerId = typeof body.producerId === "string" ? body.producerId : "";
  const message = typeof body.message === "string" ? body.message : "";
  if (!producerId) {
    return NextResponse.json({ error: "Missing producer" }, { status: 400 });
  }

  try {
    const collaboration = await createCollaboration({
      artistId: user.id,
      producerId,
      message,
    });
    return NextResponse.json({ ok: true, collaboration });
  } catch (error) {
    if (error instanceof ArtistError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status === "accepted" || body.status === "declined" ? body.status : null;
  if (!id || !status) {
    return NextResponse.json({ error: "Missing response" }, { status: 400 });
  }

  try {
    const collaboration = await setCollaborationStatus(id, user.id, status);
    return NextResponse.json({ ok: true, collaboration });
  } catch (error) {
    if (error instanceof ArtistError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

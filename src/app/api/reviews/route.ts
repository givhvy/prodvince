import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addReview, getBeatById } from "@/lib/catalog";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const beatId = typeof body.beatId === "string" ? body.beatId : "";
  const rating = Number(body.rating);
  const text = typeof body.body === "string" ? body.body : "";
  if (!beatId || !Number.isFinite(rating)) {
    return NextResponse.json({ error: "Missing review" }, { status: 400 });
  }

  const beat = await getBeatById(beatId);
  if (!beat) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const review = await addReview({
      beatId,
      userId: user.id,
      authorName: user.name,
      rating,
      body: text,
    });
    return NextResponse.json({ ok: true, review });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the review";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

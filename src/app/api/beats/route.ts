import { NextResponse } from "next/server";
import { canAccessStudio, getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canAccessStudio(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title : "Untitled Beat";

  return NextResponse.json({
    ok: true,
    beat: {
      id: `beat_${Date.now()}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title,
    },
    message: "Beat metadata saved. Attach audio storage + Whop plans next.",
  });
}

import { NextResponse } from "next/server";
import { createCollaboration } from "@/lib/catalog";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const fromName = typeof body.fromName === "string" ? body.fromName.trim() : "";
  const profileId = typeof body.profileId === "string" ? body.profileId.trim() : "";
  const beatId = typeof body.beatId === "string" && body.beatId.trim() ? body.beatId.trim() : null;
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!fromName || !profileId || message.length < 8) {
    return NextResponse.json(
      { error: "Name, producer, and a short note are required" },
      { status: 400, headers: corsHeaders },
    );
  }

  const collaboration = await createCollaboration({ fromName, profileId, beatId, message });
  return NextResponse.json({ ok: true, collaboration }, { headers: corsHeaders });
}

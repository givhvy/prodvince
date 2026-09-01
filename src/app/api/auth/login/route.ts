import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getUserByEmail } from "@/lib/catalog";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "";

  const user = getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Unknown demo account" }, { status: 401 });
  }

  await createSession(user);
  return NextResponse.json({ ok: true, user: { id: user.id, role: user.role } });
}

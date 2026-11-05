import { NextResponse } from "next/server";
import { authenticate } from "@/lib/accounts";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : undefined;

  const user = await authenticate(email, password);
  if (!user) {
    return NextResponse.json({ error: "Email or password is incorrect" }, { status: 401 });
  }

  await createSession(user);
  return NextResponse.json({ ok: true, user: { id: user.id, role: user.role } });
}

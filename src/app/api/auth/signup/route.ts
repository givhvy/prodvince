import { NextResponse } from "next/server";
import { registerAccount } from "@/lib/accounts";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const name = [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0] || "Velta user";
  const role = body.role === "seller" ? "seller" : "buyer";

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const result = await registerAccount({ email, name, password, role });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  await createSession(result.user);
  return NextResponse.json({
    ok: true,
    user: { id: result.user.id, role: result.user.role },
  });
}

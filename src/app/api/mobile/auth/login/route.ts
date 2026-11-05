import { NextResponse } from "next/server";
import { authenticate } from "@/lib/accounts";
import { createMobileToken, publicUser } from "@/lib/auth";

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
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : undefined;

  const user = await authenticate(email, password);
  if (!user) {
    return NextResponse.json(
      { error: "Email or password is incorrect" },
      { status: 401, headers: corsHeaders },
    );
  }

  const token = await createMobileToken(user);
  return NextResponse.json(
    { ok: true, token, user: publicUser(user) },
    { headers: corsHeaders },
  );
}

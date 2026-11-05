import { NextResponse } from "next/server";
import { getUserFromAuthorization, publicUser } from "@/lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  const user = await getUserFromAuthorization(request);
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401, headers: corsHeaders });
  }

  return NextResponse.json({ ok: true, user: publicUser(user) }, { headers: corsHeaders });
}

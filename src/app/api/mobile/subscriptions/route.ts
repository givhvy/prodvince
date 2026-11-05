import { NextResponse } from "next/server";
import { createSubscription, getSubscriptionPlans } from "@/lib/catalog";

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
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const planId = typeof body.planId === "string" ? body.planId.trim() : "";
  const plans = await getSubscriptionPlans();

  if (!email.includes("@") || !plans.some((plan) => plan.id === planId)) {
    return NextResponse.json(
      { error: "Choose a plan and a valid email" },
      { status: 400, headers: corsHeaders },
    );
  }

  const subscription = await createSubscription({ email, planId });
  return NextResponse.json({ ok: true, subscription }, { headers: corsHeaders });
}

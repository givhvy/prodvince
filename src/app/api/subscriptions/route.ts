import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSubscription, getSubscriptionPlans, getSubscriptionsForEmail } from "@/lib/catalog";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const planId = typeof body.planId === "string" ? body.planId : "";
  const plans = await getSubscriptionPlans();
  if (!plans.some((plan) => plan.id === planId)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const existing = await getSubscriptionsForEmail(user.email);
  if (existing.some((subscription) => subscription.planId === planId)) {
    return NextResponse.json({ ok: true, created: false });
  }

  const subscription = await createSubscription({ email: user.email, planId });
  return NextResponse.json({ ok: true, created: true, subscription });
}

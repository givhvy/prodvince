const WHOP_API_BASE = "https://api.whop.com/api/v2";

type WhopRequestInit = RequestInit & { accountId?: string };

async function whopFetch<T>(
  path: string,
  init: WhopRequestInit = {},
): Promise<T> {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) {
    throw new Error("WHOP_API_KEY is not configured");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${WHOP_API_BASE}${path}`, {
    ...init,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : `Whop API error (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
}

export type WhopProduct = {
  id: string;
  title: string;
  route: string | null;
};

export type WhopPlan = {
  id: string;
  initial_price: number;
  plan_type: string;
  title: string | null;
};

export type WhopCheckoutConfiguration = {
  id: string;
  purchase_url: string;
  plan_id: string;
};

export async function createWhopProduct(input: {
  accountId: string;
  title: string;
  headline?: string;
  description?: string;
  route?: string;
}) {
  return whopFetch<WhopProduct>("/products", {
    method: "POST",
    body: JSON.stringify({
      account_id: input.accountId,
      title: input.title,
      headline: input.headline,
      description: input.description,
      route: input.route,
      visibility: "visible",
      custom_cta: "purchase",
    }),
  });
}

export async function createWhopPlan(input: {
  productId: string;
  title: string;
  initialPrice: number;
  metadata?: Record<string, string>;
}) {
  return whopFetch<WhopPlan>("/plans", {
    method: "POST",
    body: JSON.stringify({
      product_id: input.productId,
      plan_type: "one_time",
      release_method: "buy_now",
      initial_price: input.initialPrice,
      currency: "usd",
      title: input.title,
      unlimited_stock: true,
      visibility: "visible",
      metadata: input.metadata,
    }),
  });
}

export async function createWhopCheckoutConfiguration(input: {
  accountId: string;
  planId: string;
  redirectUrl: string;
  metadata?: Record<string, string>;
}) {
  return whopFetch<WhopCheckoutConfiguration>("/checkout_configurations", {
    method: "POST",
    body: JSON.stringify({
      account_id: input.accountId,
      plan_id: input.planId,
      redirect_url: input.redirectUrl,
      mode: "payment",
      metadata: input.metadata,
    }),
  });
}

import { getWhopAccountIdFromConfig } from "@/lib/whop-config";

export function getWhopAccountId() {
  return process.env.WHOP_ACCOUNT_ID ?? getWhopAccountIdFromConfig();
}

export function getWhopAppId() {
  return process.env.NEXT_PUBLIC_WHOP_APP_ID ?? "";
}

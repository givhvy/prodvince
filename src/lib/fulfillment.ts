import { getSql, queryRows } from "@/db/client";
import { ensureCommerceSchema } from "@/db/commerce";
import { getBeatById, getUserById } from "@/lib/catalog";
import { sendMarketingEmail } from "@/lib/email";
import { buildLicenseTerms, buildReceiptText, TIER_GRANTS } from "@/lib/license-document";
import type { LicenseTier, Sale, UserRole } from "@/types";

export class SaleError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type SaleRow = {
  purchase_id: string;
  beat_id: string;
  beat_title: string;
  beat_slug: string;
  seller_name: string;
  seller_id: string;
  tier: LicenseTier;
  tier_label: string;
  amount: string | number;
  payment_ref: string;
  purchased_at: string | Date;
  license_id: string;
  license_number: string;
  receipt_id: string;
  receipt_number: string;
  licensee_name: string;
  licensee_email: string;
  user_id: string;
  terms: string;
  file_format: string;
  stream_cap: string;
  video_cap: string;
  exclusive: boolean;
};

function iso(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function documentNumber(kind: "LIC" | "RCT") {
  const now = new Date();
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  ].join("");
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `VL-${kind}-${stamp}-${suffix}`;
}

function appBase() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured && !configured.includes("localhost") && !configured.includes("127.0.0.1")) {
    return configured;
  }
  return "https://prodvince.com";
}

function toSale(row: SaleRow): Sale {
  return {
    purchaseId: row.purchase_id,
    userId: row.user_id,
    sellerId: row.seller_id,
    beatId: row.beat_id,
    beatTitle: row.beat_title,
    beatSlug: row.beat_slug,
    sellerName: row.seller_name,
    tier: row.tier,
    tierLabel: row.tier_label,
    amount: Number(row.amount),
    currency: "USD",
    paymentRef: row.payment_ref,
    purchasedAt: iso(row.purchased_at),
    licenseId: row.license_id,
    licenseNumber: row.license_number,
    receiptId: row.receipt_id,
    receiptNumber: row.receipt_number,
    licenseeName: row.licensee_name,
    licenseeEmail: row.licensee_email,
    terms: row.terms,
    fileFormat: row.file_format,
    streamCap: row.stream_cap,
    videoCap: row.video_cap,
    exclusive: row.exclusive,
  };
}

const saleSelect = `
  SELECT
    p.id AS purchase_id,
    p.user_id,
    p.beat_id,
    p.license_tier AS tier,
    p.whop_receipt_id AS payment_ref,
    p.amount,
    p.created_at AS purchased_at,
    l.id AS license_id,
    l.number AS license_number,
    l.seller_id,
    l.tier_label,
    l.licensee_name,
    l.licensee_email,
    l.licensor_name AS seller_name,
    l.beat_title,
    l.beat_slug,
    l.terms,
    l.file_format,
    l.stream_cap,
    l.video_cap,
    l.exclusive,
    r.id AS receipt_id,
    r.number AS receipt_number
  FROM purchases p
  JOIN licenses l ON l.purchase_id = p.id
  JOIN receipts r ON r.license_id = l.id
`;

async function readSaleByPurchase(purchaseId: string) {
  const sql = getSql();
  const rows = await queryRows<SaleRow>(`${saleSelect} WHERE p.id = $1 LIMIT 1`, [purchaseId]);
  return rows[0] ? toSale(rows[0]) : null;
}

export async function getSaleByPurchaseId(purchaseId: string) {
  await ensureCommerceSchema();
  return readSaleByPurchase(purchaseId);
}

export async function getSaleByLicenseNumber(number: string) {
  await ensureCommerceSchema();
  const rows = await queryRows<SaleRow>(`${saleSelect} WHERE l.number = $1 LIMIT 1`, [number]);
  return rows[0] ? toSale(rows[0]) : null;
}

export async function getSaleByReceiptNumber(number: string) {
  await ensureCommerceSchema();
  const rows = await queryRows<SaleRow>(`${saleSelect} WHERE r.number = $1 LIMIT 1`, [number]);
  return rows[0] ? toSale(rows[0]) : null;
}

export function canViewSale(user: { id: string; role: UserRole }, sale: Sale) {
  return user.role === "admin" || user.id === sale.userId || user.id === sale.sellerId;
}

export async function listSalesForUser(userId: string) {
  await ensureCommerceSchema();
  const rows = await queryRows<SaleRow>(
    `${saleSelect} WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
    [userId],
  );
  return rows.map(toSale);
}

export async function listSalesForSeller(sellerId: string, role: UserRole) {
  await ensureCommerceSchema();
  const rows =
    role === "admin"
      ? await queryRows<SaleRow>(`${saleSelect} ORDER BY p.created_at DESC`)
      : await queryRows<SaleRow>(`${saleSelect} WHERE l.seller_id = $1 ORDER BY p.created_at DESC`, [
          sellerId,
        ]);
  return rows.map(toSale);
}

async function sendSaleEmail(sale: Sale) {
  const base = appBase();
  const licenseUrl = `${base}/licenses/${sale.licenseNumber}`;
  const receiptUrl = `${base}/receipts/${sale.receiptNumber}`;
  await sendMarketingEmail({
    to: [sale.licenseeEmail],
    subject: `Your Velta license for ${sale.beatTitle}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;background:#0f0f0f;color:#fff;padding:32px;">
        <p style="letter-spacing:.14em;text-transform:uppercase;color:#a1a1aa;font-size:12px;">Velta</p>
        <h1 style="margin:8px 0 12px;font-size:24px;">License issued</h1>
        <p style="color:#d4d4d8;margin:0 0 8px;">${sale.beatTitle} · ${sale.tierLabel}</p>
        <p style="color:#a1a1aa;margin:0 0 20px;">License ${sale.licenseNumber}<br/>Receipt ${sale.receiptNumber}<br/>USD ${sale.amount.toFixed(2)}</p>
        <a href="${licenseUrl}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600;margin-right:8px;">View license</a>
        <a href="${receiptUrl}" style="display:inline-block;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;border:1px solid #3f3f46;">View receipt</a>
      </div>
    `,
  }).catch(() => undefined);
}

export async function fulfillPurchase(input: {
  userId: string;
  beatId: string;
  tier: LicenseTier;
  paymentRef: string;
}) {
  await ensureCommerceSchema();
  const sql = getSql();
  const [user, beat] = await Promise.all([getUserById(input.userId), getBeatById(input.beatId)]);
  if (!user) throw new SaleError("Buyer account was not found", 404);
  if (!beat) throw new SaleError("Beat was not found", 404);

  const offer = beat.licenses.find((item) => item.tier === input.tier);
  const grant = TIER_GRANTS[input.tier];
  if (!offer || !grant) throw new SaleError("That license tier is not for sale", 400);
  if (!input.paymentRef.trim()) throw new SaleError("A payment reference is required", 400);

  if (grant.exclusive) {
    const taken = (await sql`
      SELECT user_id FROM licenses
      WHERE beat_id = ${beat.id} AND exclusive = true AND user_id <> ${user.id}
      LIMIT 1
    `) as Array<{ user_id: string }>;
    if (taken[0] || beat.exclusiveSold) {
      throw new SaleError("This beat has already been sold exclusively", 409);
    }
  }

  const existing = (await sql`
    SELECT id FROM purchases
    WHERE user_id = ${user.id} AND beat_id = ${beat.id} AND license_tier = ${input.tier}
    LIMIT 1
  `) as Array<{ id: string }>;

  if (existing[0]) {
    const sale = await readSaleByPurchase(existing[0].id);
    if (sale) return { sale, created: false };
  }

  const purchaseId = existing[0]?.id ?? `purchase_${crypto.randomUUID()}`;
  const issuedAt = new Date().toISOString();

  if (!existing[0]) {
    await sql`
      INSERT INTO purchases (id, user_id, beat_id, license_tier, whop_receipt_id, amount, created_at)
      VALUES (
        ${purchaseId},
        ${user.id},
        ${beat.id},
        ${input.tier},
        ${input.paymentRef},
        ${offer.price},
        ${issuedAt}
      )
    `;
  }

  const licenseId = `lic_${crypto.randomUUID()}`;
  const receiptId = `rcpt_${crypto.randomUUID()}`;
  const licenseNumber = documentNumber("LIC");
  const receiptNumber = documentNumber("RCT");
  const terms = buildLicenseTerms({
    number: licenseNumber,
    licenseeName: user.name,
    licenseeEmail: user.email,
    licensorName: beat.sellerName,
    beatTitle: beat.title,
    tier: input.tier,
    price: offer.price,
    issuedAt,
  });

  await sql`
    INSERT INTO licenses (
      id, number, purchase_id, user_id, beat_id, seller_id, tier, tier_label,
      licensee_name, licensee_email, licensor_name, beat_title, beat_slug, terms,
      file_format, stream_cap, video_cap, exclusive, issued_at
    )
    VALUES (
      ${licenseId},
      ${licenseNumber},
      ${purchaseId},
      ${user.id},
      ${beat.id},
      ${beat.sellerId},
      ${input.tier},
      ${grant.label},
      ${user.name},
      ${user.email},
      ${beat.sellerName},
      ${beat.title},
      ${beat.slug},
      ${terms},
      ${grant.fileFormat},
      ${grant.streamCap},
      ${grant.videoCap},
      ${grant.exclusive},
      ${issuedAt}
    )
  `;

  await sql`
    INSERT INTO receipts (
      id, number, purchase_id, license_id, user_id, beat_id, licensee_name, licensee_email,
      seller_name, beat_title, tier_label, amount, currency, payment_ref, issued_at
    )
    VALUES (
      ${receiptId},
      ${receiptNumber},
      ${purchaseId},
      ${licenseId},
      ${user.id},
      ${beat.id},
      ${user.name},
      ${user.email},
      ${beat.sellerName},
      ${beat.title},
      ${grant.label},
      ${offer.price},
      ${"USD"},
      ${input.paymentRef},
      ${issuedAt}
    )
  `;

  if (grant.exclusive) {
    await sql`
      UPDATE beats SET exclusive_sold = true, featured = false WHERE id = ${beat.id}
    `;
  }

  const sale = await readSaleByPurchase(purchaseId);
  if (!sale) throw new SaleError("The license was saved but could not be read back", 500);
  await sendSaleEmail(sale);
  return { sale, created: true };
}

export function receiptPlainText(sale: Sale) {
  return buildReceiptText({
    number: sale.receiptNumber,
    licenseNumber: sale.licenseNumber,
    licenseeName: sale.licenseeName,
    licenseeEmail: sale.licenseeEmail,
    sellerName: sale.sellerName,
    beatTitle: sale.beatTitle,
    tierLabel: sale.tierLabel,
    amount: sale.amount,
    paymentRef: sale.paymentRef,
    issuedAt: sale.purchasedAt,
  });
}

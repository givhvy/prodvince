# Velta Beat Marketplace

Full-stack BeatStars-style beat marketplace with **Studio dashboard**, **buyer/seller roles**, **email marketing**, **Whop live checkout**, and **iOS app integration**.

## Stack

- Next.js 16 App Router + Tailwind CSS 4
- Whop checkout embed (`@whop/checkout`) + Whop REST API
- Resend for email campaigns (optional)
- Demo auth via signed cookie session
- iOS companion: `/Users/huy/Desktop/Developer/VeltaMarketplace`

## Run locally

```bash
cd /Users/huy/Desktop/Developer/beat-marketplace
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

### Demo accounts

| Email | Role |
|-------|------|
| `buyer@demo.local` | Buyer |
| `studio@velta.local` | Seller (Studio access) |
| `admin@velta.local` | Admin |

## Whop live payments — configured

Whop product and plans are already created on the **Velta** account:

| Resource | ID |
|----------|-----|
| Product | `prod_imXcEdf9omfeW` |
| Account | `biz_bp62t2c8gtVxnP` |
| Example MP3 plan | `plan_9KVgxrN1965Cf` ($29.99) |

Plan IDs are mapped in `src/data/whop-config.json` and injected into beat licenses at runtime.

**Important:** Your shell `WHOP_API_KEY` predates newer Whop scopes. Either:

1. Remove `WHOP_API_KEY` from your shell profile and rely on OAuth (`whop auth login --method oauth --format jsonl`), or
2. Generate a fresh company API key in the Whop dashboard with product/plan/checkout scopes.

## Whop live payments setup (if re-running)

Your current `WHOP_API_KEY` is missing newer scopes. Re-authorize once:

```bash
whop auth login --method oauth --format jsonl
```

Complete the browser prompt, then set in `.env.local`:

```env
WHOP_API_KEY=...
WHOP_ACCOUNT_ID=biz_bp62t2c8gtVxnP
WHOP_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WHOP_FALLBACK_PLAN_ID=plan_xxx   # optional fallback
AUTH_SECRET=replace-with-long-random-string
RESEND_API_KEY=re_...                        # optional email
RESEND_FROM="Velta Beats <beats@velta.studio>"
```

Then in Studio → **Payments**, click **Run Whop setup** (or `POST /api/whop/setup`).

That creates:

1. A Whop product for the marketplace
2. One-time plans per beat license tier (MP3 / WAV / Exclusive)
3. Checkout configurations with redirect back to `/checkout/complete`

Buy flow: beat page → **Buy now** → embedded Whop checkout → library + webhook entitlement.

## Features

- **Marketplace** — trending grid, explore filters, beat detail, preview player bar
- **Studio** — upload beats, manage catalog, email campaigns, Whop setup
- **Roles** — buyer, seller, admin session roles
- **Email marketing** — `/studio/marketing` with Resend integration
- **iOS** — documented bridge to `VeltaMarketplace` SwiftUI app

## Production notes

- Replace in-memory catalog with Neon/Postgres (see `mywavs/wavs-clone` for R2 upload patterns)
- Register Whop webhook to `/api/whop/webhook`
- Verify payment method domain for Apple Pay on your production hostname
- Deploy to Vercel and set env vars

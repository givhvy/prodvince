#!/usr/bin/env bash
# Point prodvince.com (GoDaddy) at Vercel.
# Requires GoDaddy Production API key: https://developer.godaddy.com/keys
#
# Usage:
#   export GODADDY_API_KEY=...
#   export GODADDY_API_SECRET=...
#   ./scripts/godaddy-vercel-dns.sh

set -euo pipefail

DOMAIN="${DOMAIN:-prodvince.com}"
GODADDY_API_KEY="${GODADDY_API_KEY:?Set GODADDY_API_KEY}"
GODADDY_API_SECRET="${GODADDY_API_SECRET:?Set GODADDY_API_SECRET}"

AUTH="sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}"
BASE="https://api.godaddy.com/v1/domains/${DOMAIN}/records"

echo "Setting A @ -> 76.76.21.21 on ${DOMAIN}..."
curl -sf -X PUT "${BASE}/A/@" \
  -H "Authorization: ${AUTH}" \
  -H "Content-Type: application/json" \
  -d '[{"data":"76.76.21.21","ttl":600}]'

echo "Setting A www -> 76.76.21.21 on ${DOMAIN}..."
curl -sf -X PUT "${BASE}/A/www" \
  -H "Authorization: ${AUTH}" \
  -H "Content-Type: application/json" \
  -d '[{"data":"76.76.21.21","ttl":600}]'

echo "Done. Vercel should verify prodvince.com within a few minutes."
echo "Check: vercel domains inspect prodvince.com"

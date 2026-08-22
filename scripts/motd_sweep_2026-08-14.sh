#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# FemSaidia — MOTD queue inserts (generated 2026-08-14)
# NOTE: the Community Pulse post (@NyakundiReport) was ALREADY inserted with the
#       anon key on 2026-08-14 — do NOT re-add it. This script only queues the
#       two MOTD posts, which are RLS-locked to authenticated/service_role.
#
# One-time: grab your service_role key from
#   Supabase Dashboard → Project Settings → API → "service_role" secret
# then run:   export SERVICE_KEY='paste-service-role-key-here'
# then:       bash scripts/motd_sweep_2026-08-14.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE="https://uuluuhltphgwfblcghlp.supabase.co/rest/v1"
# Auto-load the service_role key from the gitignored secrets file.
SECRETS="$(dirname "$0")/.secrets"
[ -f "$SECRETS" ] && set -a && . "$SECRETS" && set +a
: "${SERVICE_KEY:?No key. Put SERVICE_KEY=... in scripts/.secrets (see setup) or export it.}"

post () {  # $1 = table, $2 = json
  curl -sS -X POST "$BASE/$1" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$2"
  echo
}

echo "1/2  MOTD queue  ← @ClintonObonyo (scheduled 2026-08-17, active=false)"
post misogyny_highlights '{
  "platform":"X",
  "handle":"@ClintonObonyo",
  "content":"Ann Gitari looks soft & pure in that ruffled dress… until the husband opens the phone and finds “Niilisikia ukiwa mtamu… ulinipea poa”. Bro thought he married a saint. Turns out the “stress” she was talking about was just managing the other men in the group chat.",
  "context":"High-reach public slut-shaming of a named woman — humiliation-as-entertainment that normalises surveillance and control of women’s bodies.",
  "active":false,
  "scheduled_for":"2026-08-17",
  "highlight_date":"2026-08-17",
  "reach":"280,948 views",
  "auto_scraped":false,
  "misogyny_score":8,
  "source_url":"https://x.com/ClintonObonyo/status/2087786954251276797",
  "embed_url":"https://x.com/ClintonObonyo/status/2087786954251276797",
  "media_url":null,
  "media_type":null
}'

echo "2/2  MOTD queue  ← @thekenyatimes (scheduled 2026-08-19, active=false)"
post misogyny_highlights '{
  "platform":"X",
  "handle":"@thekenyatimes",
  "content":"A young lady complains that her boyfriend does not give her money",
  "context":"Mainstream outlet framing a woman’s expectation of financial support as mockery-worthy — everyday transactional contempt toward women.",
  "active":false,
  "scheduled_for":"2026-08-19",
  "highlight_date":"2026-08-19",
  "reach":"507 views",
  "auto_scraped":false,
  "misogyny_score":8,
  "source_url":"https://x.com/thekenyatimes/status/2087931039440085453",
  "embed_url":"https://x.com/thekenyatimes/status/2087931039440085453",
  "media_url":null,
  "media_type":null
}'

echo "Done. Both MOTD posts sit in the queue (active=false) for your review before they go live."

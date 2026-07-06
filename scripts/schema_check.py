#!/usr/bin/env python3
"""
Schema / contract smoke test.

Verifies that every table + column the code depends on actually exists in the
live Supabase database. A missing column makes PostgREST return HTTP 400
(code 42703) — exactly the failure that silently broke the Intel Brief's
"Recorded Incidents" (it referenced `suspect_relationship`, which does not
exist, so the whole query 400'd and the code fell back to stale text).

Run locally or in CI:  python3 scripts/schema_check.py
Exits non-zero (and prints the offending table/column) if anything is missing.

Uses the public anon key (already shipped in the frontend). Override with the
SUPABASE_URL / SUPABASE_ANON_KEY env vars if needed.
"""
import os
import sys
import requests

# `... or default` (not the get() default) so an empty CI secret doesn't win.
SUPABASE_URL = (
    os.environ.get("SUPABASE_URL") or "https://uuluuhltphgwfblcghlp.supabase.co"
).rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY") or (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwi"
    "cm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0"
    ".KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E"
)

HEADERS = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

# ── Column-level contracts: the exact columns the code SELECTs. ──────────────
# A missing column here is a real bug waiting to happen. Keep this in sync with
# the queries in scripts/generate_brief.py and the shared front-end reads.
COLUMN_CONTRACTS = {
    "femicide_cases": [
        "id", "victim_name", "county", "location", "incident_date",
        "incident_type", "perpetrator_relationship", "tech_facilitated",
        "tech_platforms", "source_url", "status", "published",
        "archetype", "halafu_lane",
    ],
    "intel_briefs": ["id", "generated_at", "period_label", "published"],
    "sentiment_articles": [
        "id", "misogyny_score", "tech_facilitated", "gbv_relevance",
        "sentiment", "is_kibe_related", "is_protest",
    ],
    "misogyny_index": ["score", "date"],
}

# ── Existence-only checks: tables the apps depend on. ───────────────────────
# RLS may return 0 rows for anon (that is fine — the table exists). We only
# fail if the table itself is missing.
EXISTENCE_ONLY = [
    "project_stories", "saint_synthesis", "saint_analytics", "fund_expressions",
    "invite_codes", "misogyny_highlights", "safety_norms", "archetype_content",
    "archetype_voices", "kaarada", "redflag_profiles", "petition_signatures",
    "site_contacts", "responders", "responder_alerts", "push_subscriptions",
]

TIMEOUT = 15
failures = []


def check_columns(table, cols):
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={','.join(cols)}&limit=1"
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    except Exception as e:
        failures.append(f"{table}: request error — {e}")
        return
    if r.status_code == 200:
        print(f"  OK   {table} ({len(cols)} columns)")
        return
    if r.status_code == 400:
        # 42703 = undefined column; surface the exact message.
        failures.append(f"{table}: {r.text[:200]}")
        print(f"  FAIL {table} — {r.text[:120]}")
        return
    # 401/403 = table exists but RLS denies anon SELECT (fine for PII tables).
    if r.status_code in (401, 403):
        print(f"  OK   {table} (exists, RLS-protected — {r.status_code})")
        return
    failures.append(f"{table}: unexpected HTTP {r.status_code} — {r.text[:120]}")
    print(f"  WARN {table} — HTTP {r.status_code}")


def check_exists(table):
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=1"
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    except Exception as e:
        failures.append(f"{table}: request error — {e}")
        return
    if r.status_code in (200, 401, 403):
        print(f"  OK   {table}")
        return
    failures.append(f"{table}: HTTP {r.status_code} — {r.text[:120]}")
    print(f"  FAIL {table} — HTTP {r.status_code}")


def main():
    print(f"Schema check against {SUPABASE_URL}")
    print("\nColumn contracts:")
    for table, cols in COLUMN_CONTRACTS.items():
        check_columns(table, cols)
    print("\nTable existence:")
    for table in EXISTENCE_ONLY:
        check_exists(table)

    print()
    if failures:
        print(f"SCHEMA CHECK FAILED — {len(failures)} problem(s):")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    print("SCHEMA CHECK PASSED — all tables and columns present.")


if __name__ == "__main__":
    main()

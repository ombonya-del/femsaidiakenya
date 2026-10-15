-- ════════════════════════════════════════════════════════════════════════════
-- CASE CANDIDATES — admin review queue for femicide cases surfaced by the
-- social pipeline (e.g. the curated Facebook femicide-analysis page, fed via a
-- bridge into the social-ingest edge function).
--
-- Social posts that classify as femicide are NOT written straight into
-- femicide_cases. They land here as 'pending' so an admin can verify the facts,
-- apply the under-18 name-masking rule, and only then promote to the tracker.
--
-- Idempotent — safe to re-run. Apply by pasting into Supabase → SQL Editor → Run
-- (or `supabase db push`).
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.case_candidates (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  -- provenance
  source_name      text,                       -- e.g. "Facebook / <page name>"
  source_url       text unique,                -- dedupe key; nullable
  platform         text default 'facebook',
  raw_text         text,                        -- the original post text
  thumbnail_url    text,
  -- AI best-effort context (admin verifies before anything enters the tracker)
  ai_summary       text,
  gbv_relevance    int,
  misogyny_score   int,
  content_category text,
  suspected        jsonb not null default '{}'::jsonb,  -- optional extracted hints
  -- review workflow (mirrors redflag_submissions)
  status           text not null default 'pending',     -- pending | approved | rejected
  reviewed_by      text,
  reviewed_at      timestamptz,
  review_note      text,
  linked_case_id   text                          -- femicide_cases id once promoted
);

create index if not exists case_candidates_status_idx
  on public.case_candidates (status, created_at desc);

-- RLS: service role (edge function) inserts & bypasses RLS. Signed-in admins
-- read & moderate. NO anon read — rows may contain victim names.
alter table public.case_candidates enable row level security;
drop policy if exists "cc_admin_select" on public.case_candidates;
drop policy if exists "cc_admin_update" on public.case_candidates;
create policy "cc_admin_select" on public.case_candidates
  for select to authenticated using (true);
create policy "cc_admin_update" on public.case_candidates
  for update to authenticated using (true) with check (true);

-- Verify (optional):
-- select to_regclass('public.case_candidates');
-- select status, count(*) from public.case_candidates group by status;

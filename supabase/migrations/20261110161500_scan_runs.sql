-- scan_runs: one row per rss-scanner run, written by the scanner's recordRun().
-- The health-check reads the latest row to judge scanner HEALTH (ran recently?
-- classifier ok? feeds returning items?) instead of the age of the newest article,
-- so quiet femicide-news periods no longer trip a false "data is stale" alert.
create table if not exists public.scan_runs (
  id                bigint generated always as identity primary key,
  ran_at            timestamptz not null default now(),
  ok                boolean     not null default false,
  total             int,
  new_items         int,
  classified        int,
  classifier_failed int,
  inserted          int,
  kenya_gbv         int,
  note              text
);
create index if not exists scan_runs_ran_at_idx on public.scan_runs (ran_at desc);
-- The scanner and health-check use the service-role key, which bypasses RLS.
-- Enable RLS with no policies so nothing is readable via anon/public.
alter table public.scan_runs enable row level security;

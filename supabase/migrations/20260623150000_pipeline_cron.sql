-- ════════════════════════════════════════════════════════════════════════════
-- PIPELINE SCHEDULER — in-platform pg_cron (replaces the unreliable GitHub
-- Actions cron). Runs entirely inside Supabase via pg_net; no third-party.
--   • rss-scanner   every 2 hours  → Socials & Sentiment feed + case alerts
--   • health-check  every 6 hours  → status email + auto-remediation safety net
--
-- Run in the Supabase SQL Editor (recommended for extensions/cron), or via
-- `supabase db push`. Safe to re-run — it re-creates the jobs cleanly.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Drop any prior copies so re-running this is idempotent
do $$
begin
  if exists (select 1 from cron.job where jobname = 'rss-scanner-2h')  then perform cron.unschedule('rss-scanner-2h');  end if;
  if exists (select 1 from cron.job where jobname = 'health-check-6h') then perform cron.unschedule('health-check-6h'); end if;
end $$;

-- ── RSS scanner — every 2 hours at :15 ──────────────────────────────────────
select cron.schedule('rss-scanner-2h', '15 */2 * * *', $$
  select net.http_post(
    url     := 'https://uuluuhltphgwfblcghlp.supabase.co/functions/v1/rss-scanner',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E'
    ),
    body    := '{}'::jsonb
  );
$$);

-- ── Health check — every 6 hours on the hour ────────────────────────────────
select cron.schedule('health-check-6h', '0 */6 * * *', $$
  select net.http_post(
    url     := 'https://uuluuhltphgwfblcghlp.supabase.co/functions/v1/health-check',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E'
    ),
    body    := '{}'::jsonb
  );
$$);

-- ── Verify (run after applying) ─────────────────────────────────────────────
-- select jobname, schedule, active from cron.job order by jobname;
-- select jobname, status, return_message, start_time
--   from cron.job_run_details order by start_time desc limit 10;

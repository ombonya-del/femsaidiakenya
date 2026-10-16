-- ════════════════════════════════════════════════════════════════════════════
-- FB POLLER CRON — fetch the configured external feed(s) (e.g. an RSS.app feed
-- built from a public Facebook femicide-analysis page) every 2 hours and forward
-- items to social-ingest → Community Pulse + case_candidates review queue.
--
-- Activates only once FB_FEED_URLS is set on the fb-poller function; until then
-- each run is a harmless no-op. Offset to :45 so it doesn't collide with the
-- rss-scanner (:15). Idempotent — safe to re-run.
-- ════════════════════════════════════════════════════════════════════════════
create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'fb-poller-2h') then perform cron.unschedule('fb-poller-2h'); end if;
end $$;

select cron.schedule('fb-poller-2h', '45 */2 * * *', $$
  select net.http_post(
    url     := 'https://uuluuhltphgwfblcghlp.supabase.co/functions/v1/fb-poller',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E'
    ),
    body    := '{}'::jsonb
  );
$$);

-- Verify: select jobname, schedule, active from cron.job where jobname='fb-poller-2h';

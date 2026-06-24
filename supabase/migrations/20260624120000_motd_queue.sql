-- ════════════════════════════════════════════════════════════════════════════
-- MISOGYNY-OF-THE-DAY QUEUE — park curated posts and let them auto-publish.
--   • Admin "Add to queue" saves a highlight with active=false + scheduled_for.
--   • A daily pg_cron job flips any queued post live once its date arrives.
--
-- Run in the Supabase SQL Editor (recommended for extensions/cron) or via
-- `supabase db push`. Safe to re-run — idempotent.
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Schedule column (nullable; only set on queued rows)
alter table public.misogyny_highlights
  add column if not exists scheduled_for date;

create index if not exists idx_motd_scheduled
  on public.misogyny_highlights (scheduled_for)
  where scheduled_for is not null;

-- 2. RLS — let signed-in admins fully manage highlights (incl. queued/draft rows
--    where active=false) and hand-pick community-pulse posts. Additive: the
--    existing public "active=true" read policy is untouched. This is what was
--    silently blocking "Save as draft"/queue inserts before.
do $$
begin
  if exists (select 1 from pg_class where relname='misogyny_highlights' and relrowsecurity) then
    drop policy if exists "authenticated manage highlights" on public.misogyny_highlights;
    create policy "authenticated manage highlights" on public.misogyny_highlights
      for all to authenticated using (true) with check (true);
  end if;
  if exists (select 1 from pg_class where relname='sentiment_articles' and relrowsecurity) then
    drop policy if exists "authenticated manage pulse" on public.sentiment_articles;
    create policy "authenticated manage pulse" on public.sentiment_articles
      for all to authenticated using (true) with check (true);
  end if;
end $$;

-- 3. Daily auto-publish job
create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'motd-queue-fire') then
    perform cron.unschedule('motd-queue-fire');
  end if;
end $$;

-- Every day at 04:05 UTC (07:05 EAT): publish queued posts whose date has come.
-- The most recently dated queued item becomes the live "Misogyny of the Day".
select cron.schedule('motd-queue-fire', '5 4 * * *', $$
  update public.misogyny_highlights
     set active         = true,
         highlight_date = current_date,
         scheduled_for  = null
   where active = false
     and scheduled_for is not null
     and scheduled_for <= current_date;
$$);

-- ── Verify (run after applying) ─────────────────────────────────────────────
-- select id, active, scheduled_for, highlight_date, left(content,50)
--   from misogyny_highlights where scheduled_for is not null order by scheduled_for;
-- select jobname, schedule, active from cron.job where jobname = 'motd-queue-fire';

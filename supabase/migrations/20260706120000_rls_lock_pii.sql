-- Lock PII/contact tables so the public anon key can WRITE (the forms) but not
-- READ them. Fixes a leak where these were world-readable via the public anon key.
--
-- Scope: petition_signatures + push_subscriptions (both write-only from the
-- public app — no anon SELECT anywhere in the code — so locking reads is safe).
--
-- IMPORTANT: these tables had a pre-existing permissive read policy (a dashboard
-- "Enable read access for all users" style policy, `for select to public using
-- (true)`). Because policies are OR'd, simply adding a restrictive policy is not
-- enough — the permissive one keeps the leak open. So we DROP every existing
-- policy on each table first, then recreate exactly the correct set.
--
-- Access model:
--   anon / authenticated (public forms) -> INSERT (and UPDATE for the push upsert)
--   authenticated (admin, signed in via OTP) -> SELECT
--   service_role (edge functions: send-push, health-check) -> bypasses RLS

-- ── Drop ALL existing policies on the two tables (kills any permissive read) ──
do $$
declare pol record;
begin
  for pol in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('petition_signatures', 'push_subscriptions')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- ── petition_signatures: public signs (INSERT); admin reads ──────────────────
alter table public.petition_signatures enable row level security;
create policy petition_anon_insert on public.petition_signatures
  for insert to anon, authenticated with check (true);
create policy petition_admin_select on public.petition_signatures
  for select to authenticated using (true);

-- ── push_subscriptions: public subscribes via upsert (INSERT + UPDATE) ───────
alter table public.push_subscriptions enable row level security;
create policy push_anon_insert on public.push_subscriptions
  for insert to anon, authenticated with check (true);
create policy push_anon_update on public.push_subscriptions
  for update to anon, authenticated using (true) with check (true);
create policy push_admin_select on public.push_subscriptions
  for select to authenticated using (true);
create policy push_admin_delete on public.push_subscriptions
  for delete to authenticated using (true);

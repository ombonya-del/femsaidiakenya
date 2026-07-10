-- Lock the `responders` table. Bulk read of volunteer names + phone numbers was
-- exposed via the public anon key (and, as with the other tables, a permissive
-- dashboard read policy overrides a plain restrictive one — so we drop ALL
-- existing policies first, then recreate the correct set).
--
-- Access model after this migration:
--   anon / authenticated  -> INSERT (public responder registration, itika)
--   authenticated (admin, OTP session) -> SELECT (admin responder list)
--   service_role (itika-auth edge function) -> bypasses RLS, returns ONE record
--
-- ORDER OF OPERATIONS — apply this LAST:
--   1. supabase functions deploy itika-auth
--   2. deploy the itika client change (build + push)
--   3. THEN run this migration
-- If you run it before the function + client are live, responder login breaks.

-- ── Drop ALL existing policies on responders (kills any permissive read) ──────
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'responders'
  loop
    execute format('drop policy if exists %I on public.responders', pol.policyname);
  end loop;
end $$;

alter table public.responders enable row level security;
create policy responders_anon_insert on public.responders
  for insert to anon, authenticated with check (true);
create policy responders_admin_select on public.responders
  for select to authenticated using (true);

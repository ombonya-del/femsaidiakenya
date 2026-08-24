-- ════════════════════════════════════════════════════════════════════════════
-- RED FLAG — let signed-in admins moderate submissions (Approve / Reject)
--
-- Symptom: Approve & Reject did nothing — status stayed 'pending'. Cause: RLS on
-- redflag_submissions had no UPDATE policy for the authenticated (admin) role, so
-- the update was silently filtered to zero rows (Supabase returns no error).
--
-- Public writes still arrive via the turnstile-verify edge function (service role,
-- bypasses RLS); nothing anon reads redflag_submissions, so enabling RLS here is safe.
-- Idempotent. Apply with `psql -f`, `supabase db push`, or the SQL Editor.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.redflag_submissions enable row level security;

drop policy if exists "redflag_admin_select" on public.redflag_submissions;
drop policy if exists "redflag_admin_update" on public.redflag_submissions;
drop policy if exists "redflag_admin_delete" on public.redflag_submissions;

create policy "redflag_admin_select" on public.redflag_submissions
  for select to authenticated using (true);
create policy "redflag_admin_update" on public.redflag_submissions
  for update to authenticated using (true) with check (true);
create policy "redflag_admin_delete" on public.redflag_submissions
  for delete to authenticated using (true);

-- redflag_profiles: keep whatever public-read policy already exists (no RLS toggle
-- here, so public profile reads are untouched) — just make sure a signed-in admin
-- can insert (Approve & publish) and edit.
drop policy if exists "redflag_profiles_admin_insert" on public.redflag_profiles;
drop policy if exists "redflag_profiles_admin_update" on public.redflag_profiles;

create policy "redflag_profiles_admin_insert" on public.redflag_profiles
  for insert to authenticated with check (true);
create policy "redflag_profiles_admin_update" on public.redflag_profiles
  for update to authenticated using (true) with check (true);

-- Verify (optional):
-- select policyname, cmd, roles from pg_policies
--   where schemaname='public' and tablename in ('redflag_submissions','redflag_profiles') order by tablename, cmd;

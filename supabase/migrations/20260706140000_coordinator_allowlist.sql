-- Coordinator allowlist.
--
-- Before this, RLS granted responder/contact PII to the `authenticated` role —
-- i.e. ANY email that completed OTP could read responders. This restricts that
-- to a named allowlist (public.coordinators). The admin portal + Itika Command
-- both authenticate via OTP; only emails in this table get access.
--
-- ==========================================================================
-- !!  BEFORE YOU RUN THIS: add EVERY current admin/coordinator email to the
-- !!  seed in step 4, or they will lose access to the admin portal + Command.
-- ==========================================================================

-- 1. Allowlist table
create table if not exists public.coordinators (
  email    text primary key,
  name     text,
  added_at timestamptz default now()
);

-- 2. Helper — is the current user an allowlisted coordinator?
--    SECURITY DEFINER so it reads the table regardless of RLS (no recursion).
create or replace function public.is_coordinator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coordinators
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;

-- 3. Lock the allowlist table itself — only coordinators can read it.
alter table public.coordinators enable row level security;
drop policy if exists coordinators_read on public.coordinators;
create policy coordinators_read on public.coordinators
  for select to authenticated using (public.is_coordinator());

-- 4. SEED — EDIT THIS: one row per admin/coordinator email.
insert into public.coordinators (email, name) values
  ('ombonya@gmail.com',          'Victor Ombonya'),
  ('cmt.kenya@gmail.com',        'CMT Kenya'),
  ('admin@femsaidiakenya.org',   'FemSaidia Admin')
on conflict (email) do nothing;

-- 5. Tighten the PII tables: authenticated reads/writes now require coordinator.
--    Public INSERT (the forms) is unchanged; service_role bypasses RLS.

-- responders
drop policy if exists responders_admin_select on public.responders;
drop policy if exists responders_admin_update on public.responders;
drop policy if exists responders_admin_delete on public.responders;
create policy responders_coord_select on public.responders
  for select to authenticated using (public.is_coordinator());
create policy responders_coord_update on public.responders
  for update to authenticated using (public.is_coordinator()) with check (public.is_coordinator());
create policy responders_coord_delete on public.responders
  for delete to authenticated using (public.is_coordinator());

-- petition_signatures
drop policy if exists petition_admin_select on public.petition_signatures;
create policy petition_coord_select on public.petition_signatures
  for select to authenticated using (public.is_coordinator());

-- push_subscriptions
drop policy if exists push_admin_select on public.push_subscriptions;
drop policy if exists push_admin_delete on public.push_subscriptions;
create policy push_coord_select on public.push_subscriptions
  for select to authenticated using (public.is_coordinator());
create policy push_coord_delete on public.push_subscriptions
  for delete to authenticated using (public.is_coordinator());

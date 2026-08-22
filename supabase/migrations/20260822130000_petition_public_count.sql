-- ════════════════════════════════════════════════════════════════════════════
-- PETITION — create signatures table (if missing) + public COUNT without PII
--
-- The petition counter, the sign form and the Intel-Brief donut all use
-- public.petition_signatures. If it doesn't exist (ERROR 42P01) the whole
-- petition feature is broken. This creates it (matching the turnstile-verify
-- column whitelist), applies the correct RLS (anon may INSERT, only signed-in
-- admins may SELECT — signer emails are never world-readable), and exposes ONLY
-- an aggregate count via a SECURITY DEFINER function so the public counter and
-- the brief donut can show a number without leaking rows.
--
-- Idempotent. Apply with `supabase db push`, `psql -f`, or the SQL Editor.
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Table (matches the edge-function whitelist: name, email, county, country, message).
create table if not exists public.petition_signatures (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  county      text,
  country     text default 'Kenya',
  message     text,
  created_at  timestamptz not null default now()
);

-- Dedupe on email (the app lowercases before insert; the edge function surfaces
-- the resulting 23505 as "already signed").
create unique index if not exists petition_signatures_email_key
  on public.petition_signatures (lower(email));

-- 2. RLS: anon signs (INSERT); only signed-in admins read rows (PII).
alter table public.petition_signatures enable row level security;
drop policy if exists petition_anon_insert  on public.petition_signatures;
drop policy if exists petition_admin_select on public.petition_signatures;
create policy petition_anon_insert on public.petition_signatures
  for insert to anon, authenticated with check (true);
create policy petition_admin_select on public.petition_signatures
  for select to authenticated using (true);

-- 3. Public aggregate count — exposes ONLY an integer, never any row/PII, so the
--    anon key (public counter + brief generator) can show the number.
create or replace function public.petition_signature_count()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from public.petition_signatures;
$$;

revoke all on function public.petition_signature_count() from public;
grant execute on function public.petition_signature_count() to anon, authenticated;

-- Verify (optional):
-- select to_regclass('public.petition_signatures');
-- select public.petition_signature_count();

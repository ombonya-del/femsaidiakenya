-- ════════════════════════════════════════════════════════════════════════════
-- RED FLAG — create submissions table + photo evidence support
--
-- Fixes the public Red Flag report failing with "Could not save your submission."
-- Root cause: public.redflag_submissions did not exist (ERROR 42P01), so the
-- service-role insert in the turnstile-verify edge function errored. This creates
-- the table the public form, the turnstile-verify whitelist and the admin
-- Submissions tab all expect, adds the photo_url column, and creates the
-- redflag-evidence storage bucket the photo upload targets.
--
-- Idempotent — safe to re-run. Apply with `supabase db push`, `psql -f`, or by
-- pasting into Supabase Dashboard → SQL Editor → New query → Run.
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Table (matches the edge-function column whitelist + admin fields).
create table if not exists public.redflag_submissions (
  id              uuid primary key default gen_random_uuid(),
  name            text,
  aliases         text,
  county          text,
  social_handles  text,
  modus_operandi  text,
  details         text,
  photo_url       text,
  status          text not null default 'pending',   -- pending | approved | rejected
  created_at      timestamptz not null default now()
);

-- If the table already existed from a dashboard build without photo_url, add it.
alter table public.redflag_submissions add column if not exists photo_url text;

create index if not exists redflag_submissions_status_idx
  on public.redflag_submissions (status, created_at desc);

-- 2. RLS. Public submissions arrive through the turnstile-verify edge function
--    (service role → bypasses RLS), so no anon policy is needed. Signed-in
--    admins read and moderate. No anon read (these are unreviewed reports).
alter table public.redflag_submissions enable row level security;
drop policy if exists "redflag_admin_select" on public.redflag_submissions;
drop policy if exists "redflag_admin_update" on public.redflag_submissions;
create policy "redflag_admin_select" on public.redflag_submissions
  for select to authenticated using (true);
create policy "redflag_admin_update" on public.redflag_submissions
  for update to authenticated using (true) with check (true);

-- 3. Storage bucket for the optional evidence photo (public read; anon upload;
--    5 MB image cap).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'redflag-evidence',
  'redflag-evidence',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif','image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "redflag_evidence_read"   on storage.objects;
drop policy if exists "redflag_evidence_upload" on storage.objects;

create policy "redflag_evidence_read" on storage.objects
  for select using (bucket_id = 'redflag-evidence');

create policy "redflag_evidence_upload" on storage.objects
  for insert with check (bucket_id = 'redflag-evidence');

-- 4. Verify (optional):
-- select to_regclass('public.redflag_submissions');           -- not null = table exists
-- select id, public, file_size_limit from storage.buckets where id='redflag-evidence';

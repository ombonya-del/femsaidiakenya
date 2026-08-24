-- ════════════════════════════════════════════════════════════════════════════
-- RED FLAG — reporter contact is email OR phone (not both required)
--
-- The redflag_submissions table required BOTH submitter_email and
-- submitter_phone (NOT NULL). We want the reporter to give at least ONE.
-- This drops those NOT NULLs and adds a CHECK that at least one is present,
-- so the form's "email or phone" rule is enforced at the database too.
--
-- Idempotent. Apply with `psql -f`, `supabase db push`, or the SQL Editor.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.redflag_submissions alter column submitter_email drop not null;
alter table public.redflag_submissions alter column submitter_phone drop not null;

alter table public.redflag_submissions drop constraint if exists redflag_submissions_contact_chk;
alter table public.redflag_submissions
  add constraint redflag_submissions_contact_chk
  check (
    (submitter_email is not null and length(btrim(submitter_email)) > 0)
    or (submitter_phone is not null and length(btrim(submitter_phone)) > 0)
  ) not valid;   -- NOT VALID: enforced for new rows; skips checking any legacy rows

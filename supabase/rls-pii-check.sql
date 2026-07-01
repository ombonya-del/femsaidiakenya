-- ═══════════════════════════════════════════════════════════════════════════════
--  RLS / PII exposure check  —  run in the Supabase SQL editor, paste me the output
--  Goal: confirm the public (anon) key can INSERT into report forms but CANNOT READ
--  anyone's submitted reports, alerts, or contact details.
-- ═══════════════════════════════════════════════════════════════════════════════

-- A) Is RLS enabled on every table?  Any row with rls_enabled = false is WIDE OPEN.
select tablename, rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
order by rowsecurity asc, tablename;

-- B) Who can SELECT (read) the sensitive tables?
--    A SELECT policy whose "roles" include anon or public (with qual = true) means the
--    table is PUBLICLY READABLE — that must NOT be true for any report / PII table.
--    Expect: either no SELECT policy for anon, or one gated to admins / authenticated.
select tablename, policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public'
  and cmd = 'SELECT'
  and tablename in (
    'incident_reports','redflag_submissions','petition_signatures',
    'partner_applications','halafu_donor_interest','safety_norms',
    'archetype_voices','submissions','alerts','case_submissions',
    'push_subscriptions','contacts'
  )
order by tablename;

-- C) Confirm anon can still INSERT (public forms keep working) — and see the full
--    policy set per sensitive table.
select tablename, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'incident_reports','redflag_submissions','petition_signatures',
    'partner_applications','halafu_donor_interest','safety_norms',
    'archetype_voices','submissions','alerts','push_subscriptions','contacts'
  )
order by tablename, cmd;

-- ───────────────────────────────────────────────────────────────────────────────
-- HOW TO READ IT
--  • Section A: every table should say rls_enabled = true.
--  • Section B: for report/PII tables you want NO rows here with roles {anon}/{public}
--    and qual = true. If you see one, that table's submissions are public — fix it (below).
--  • Section C: each of these should have an INSERT policy open to anon (so forms work),
--    but the reading is controlled by Section B.
--
-- IF A SENSITIVE TABLE IS ANON-READABLE, lock it (adjust the admin check to your setup):
--    drop policy "<the anon select policy name>" on public.<table>;
--    -- allow only signed-in admins to read (example — use your own admin condition):
--    create policy "admin_read_<table>" on public.<table>
--      for select using ( auth.role() = 'authenticated' );
--  (femicide_cases is intentionally public — it's a memorial of public-record cases —
--   so it is deliberately left off this list.)

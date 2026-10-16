-- Allow signed-in admins to add manual case candidates (the Case Review
-- "Add from a post" fallback). Edge-function inserts already bypass RLS.
alter table public.case_candidates enable row level security;
drop policy if exists "cc_admin_insert" on public.case_candidates;
create policy "cc_admin_insert" on public.case_candidates
  for insert to authenticated with check (true);

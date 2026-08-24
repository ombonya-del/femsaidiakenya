-- ════════════════════════════════════════════════════════════════════════════
-- RED FLAG — back-fill public profiles for already-approved submissions
--
-- Approvals made before the admin's redflag_profiles mapping was fixed flipped the
-- submission to 'approved' but never created the public profile (the insert used
-- columns that don't exist here). This creates the missing profiles from those
-- approved submissions. Safe to re-run — it skips any that already have a profile.
-- ════════════════════════════════════════════════════════════════════════════

insert into public.redflag_profiles
  (name, aliases, county, modus_operandi, platforms, social_link, photo_url,
   court_ref, admin_notes, tier, status, submission_count)
select
  s.accused_name,
  case when coalesce(btrim(s.accused_aliases), '') = '' then null
       else string_to_array(regexp_replace(btrim(s.accused_aliases), '\s*,\s*', ',', 'g'), ',')
  end,
  s.accused_county,
  s.modus_operandi,
  case when coalesce(btrim(s.platforms), '') = '' then null
       else string_to_array(regexp_replace(btrim(s.platforms), '\s*,\s*', ',', 'g'), ',')
  end,
  s.social_link,
  s.photo_url,
  s.court_ref,
  s.additional_info,
  'reported',
  'approved',
  1
from public.redflag_submissions s
where s.status = 'approved'
  and not exists (
    select 1 from public.redflag_profiles p
    where p.name = s.accused_name
      and coalesce(p.county,'') = coalesce(s.accused_county,'')
  );

-- Verify (optional):
-- select name, county, tier, status from public.redflag_profiles order by created_at desc limit 10;

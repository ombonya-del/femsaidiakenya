-- Archetype tag on femicide cases, powering the "cases by archetype" breakdown.
-- Nullable: null = unclassified / not an intimate-partner archetype.
-- Admins set or override it per case in the Case Tracker.
alter table femicide_cases
  add column if not exists archetype text;

-- Guard the allowed values (null stays valid for unclassified).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'femicide_cases_archetype_check') then
    alter table femicide_cases
      add constraint femicide_cases_archetype_check
      check (archetype in ('naive','precocious','allin','onoff'));
  end if;
end $$;

-- Coarse first-pass seed from the perpetrator relationship (admins refine per case):
--   husband          → The All-In  (established / married partner)
--   intimate_partner → The Naive   (default intimate; refine to On & Off / Precocious as needed)
-- Non-partner perpetrators (father / relative / stranger / acquaintance / unknown) stay null.
update femicide_cases set archetype = 'allin'
  where archetype is null and perpetrator_relationship = 'husband';
update femicide_cases set archetype = 'naive'
  where archetype is null and perpetrator_relationship = 'intimate_partner';

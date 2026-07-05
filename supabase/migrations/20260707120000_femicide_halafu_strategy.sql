-- Attribute each femicide case to a Halafu? strategy lane and a specific project,
-- so the case load can be prioritised against the response pipeline.
-- Both nullable: null = not yet attributed. Admins set them in the Case Tracker.
alter table femicide_cases add column if not exists halafu_lane text;
alter table femicide_cases add column if not exists halafu_project text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'femicide_cases_halafu_lane_check') then
    alter table femicide_cases
      add constraint femicide_cases_halafu_lane_check
      check (halafu_lane in ('understand','interrupt','build'));
  end if;
end $$;

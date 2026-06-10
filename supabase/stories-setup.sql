-- ════════════════════════════════════════════════════════════════════════════
-- REAL-LIFE STORIES for Halafu?/SaInt project cards
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Table
create table if not exists public.project_stories (
  id          uuid primary key default gen_random_uuid(),
  project_id  text not null,            -- p1..p10, matches PROJECTS ids in Halafu?/SaInt
  title       text not null,
  summary     text,
  story_url   text,                     -- link to the source article
  source_name text,                     -- e.g. Tuko.co.ke
  media_url   text,                     -- uploaded or external image/video
  media_type  text,                     -- 'image' | 'video'
  active      boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists project_stories_project_idx on public.project_stories (project_id) where active;

-- 2. Row-level security
alter table public.project_stories enable row level security;

drop policy if exists "stories_public_read"  on public.project_stories;
drop policy if exists "stories_anon_insert"  on public.project_stories;
drop policy if exists "stories_anon_update"  on public.project_stories;

-- Read all rows (the public apps filter active=true client-side;
-- the admin Mbona tab needs to see hidden stories too).
create policy "stories_public_read" on public.project_stories
  for select using (true);

-- Writes go through the anon key; the UI gates Add/Edit behind the admin pass.
create policy "stories_anon_insert" on public.project_stories
  for insert with check (true);

create policy "stories_anon_update" on public.project_stories
  for update using (true);

-- 3. Storage bucket for uploaded media
insert into storage.buckets (id, name, public)
values ('story-media', 'story-media', true)
on conflict (id) do nothing;

drop policy if exists "story_media_read"   on storage.objects;
drop policy if exists "story_media_upload" on storage.objects;

create policy "story_media_read" on storage.objects
  for select using (bucket_id = 'story-media');

create policy "story_media_upload" on storage.objects
  for insert with check (bucket_id = 'story-media');

-- 4. Fix: Synthesis History showed nothing because saint_synthesis has RLS
--    with no read policy for the anon key (writes come from the service role).
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'saint_synthesis') then
    execute 'alter table public.saint_synthesis enable row level security';
    execute 'drop policy if exists "synthesis_public_read" on public.saint_synthesis';
    execute 'create policy "synthesis_public_read" on public.saint_synthesis for select using (true)';
  end if;
end $$;

-- 5. Seed: Kennedy Kamau Kabaiko → Salmin for Men (p6)
insert into public.project_stories (project_id, title, summary, story_url, source_name, media_url, media_type)
select
  'p6',
  'Kennedy Kamau Kabaiko — Githunguri, Kiambu',
  'After surviving an April 2024 motorcycle crash on Thika Road that killed his brother Kabiru, Kennedy carried two years of guilt, blame and family accusations with nowhere to take them. In June 2026 he killed his wife and two-year-old son before taking his own life, leaving a three-page note describing the psychological burden he could no longer carry. A crisis line built for men in crisis — anonymous, accessible, staffed by perpetrator-intervention counsellors — is exactly the intervention that could have caught him before that morning.',
  'https://www.tuko.co.ke/people/family/629152-kiambu-how-surviving-road-crash-allegedly-set-chain-tragedy-leading-3-deaths/',
  'Tuko.co.ke',
  'https://cdn.tuko.co.ke/images/1120/294afde22c5549e8.jpeg?v=1',
  'image'
where not exists (
  select 1 from public.project_stories
  where project_id = 'p6' and title like 'Kennedy Kamau Kabaiko%'
);

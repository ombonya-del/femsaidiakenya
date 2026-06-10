# Deploy guide — June 10, 2026 changes

One sequence, run top to bottom. This replaces all previously suggested commands.
Everything is run from Terminal inside this folder.

What's being deployed: pipeline scheduler (GitHub Actions), mobile overflow fix,
SaInt branding, date-format fix, Mbona story manager (admin), Synthesis History fix,
read-only stories on Halafu?/SaInt, Kennedy Kamau Kabaiko seed story.

---

## Step 0 — One-time prerequisites

Skip anything you already have.

```bash
# Check what's installed
git --version
supabase --version

# If the Supabase CLI is missing (macOS):
brew install supabase/tap/supabase
```

---

## Step 1 — Apply the database changes

Creates the `project_stories` table, the `story-media` upload bucket, fixes the
Synthesis History read policy, and seeds the Kennedy Kamau Kabaiko story.

```bash
cd ~/Downloads/femsaidiakenya-main

supabase login          # opens browser, one time only
supabase link --project-ref uuluuhltphgwfblcghlp
# ↑ asks for your database password: Supabase Dashboard → Settings → Database

supabase db push        # applies supabase/migrations/20260610210000_mbona_stories_and_synthesis.sql
```

**If `db push` errors** (e.g. migration-history complaints on an existing project),
use the direct fallback — same SQL, same result:

```bash
psql "postgresql://postgres:YOUR_DB_PASSWORD@db.uuluuhltphgwfblcghlp.supabase.co:5432/postgres" \
  -f supabase/stories-setup.sql
```

---

## Step 2 — Reconnect this folder to your GitHub repo

This folder has no `.git` (it looks like a downloaded zip), so reconnect it first.
Replace the URL with your actual repo.

```bash
cd ~/Downloads/femsaidiakenya-main

git init
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git fetch origin main
git reset --mixed origin/main   # adopts the repo's history, keeps all local files
git status                      # review: should list only the files changed in this session
```

⚠️ If `git status` shows unexpected deletions or changes to files you didn't touch,
stop — your zip may be older than the repo. In that case clone the repo fresh
elsewhere and copy in the changed files listed at the bottom of this guide.

---

## Step 3 — Commit and push

Vercel auto-deploys all the apps from the push.

```bash
git add -A
git commit -m "feat: Mbona story manager, synthesis history fix, intel pipeline scheduler, mobile/date/branding fixes"
git push origin main
```

---

## Step 4 — Kick the scheduler once

The new GitHub Actions scheduler activates on push, but give it a first manual run:

Browser: GitHub repo → **Actions** → *Intelligence Pipeline Scheduler* → **Run workflow** (target: both)

Or with the GitHub CLI:

```bash
gh workflow run intel-pipeline.yml -f target=both
```

---

## Step 5 — Verify

1. **Mbona**: admin.femsaidiakenya.org → Halafu? → SaInt → Mbona — Kennedy's story is there; try Edit/Hide.
2. **Public cards**: femsaidiakenya.org Halafu? tab + saint.femsaidiakenya.org → open *Salmin for Men* — story shows, no edit buttons.
3. **Synthesis History**: same SaInt admin section — entries now appear; try "⚡ Generate new synthesis".
4. **Scheduler**: GitHub → Actions shows green runs; health-check email arrives at cmt.kenya@gmail.com every 6h.
5. **Optional forensics** — see why the old Supabase cron died:
   ```bash
   psql "postgresql://postgres:YOUR_DB_PASSWORD@db.uuluuhltphgwfblcghlp.supabase.co:5432/postgres" \
     -c "select jobname, schedule, active from cron.job;" \
     -c "select jobid, status, return_message, start_time from cron.job_run_details order by start_time desc limit 20;"
   ```

---

## Files changed in this session (for manual copying if needed)

New:
- `.github/workflows/intel-pipeline.yml`
- `supabase/stories-setup.sql`
- `supabase/migrations/20260610210000_mbona_stories_and_synthesis.sql`
- `src/ProjectStories.jsx`
- `saint/src/ProjectStories.jsx`
- `DEPLOY.md` (this file)

Modified:
- `src/App.jsx`, `src/Halafu.jsx`, `src/CaseTracker.jsx`, `src/RedFlag.jsx`, `src/SocialsSentiment.jsx`, `src/Petition.jsx`
- `saint/src/App.jsx`
- `admin/src/App.jsx`, `admin/src/RedFlag.jsx`, `admin/src/CaseTracker.jsx`, `admin/src/SocialsSentiment.jsx`, `admin/src/Petition.jsx`
- `redflag/src/App.jsx`

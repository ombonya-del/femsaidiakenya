# Reliable scheduler setup — FemSaidia pipeline

## Why this change
The pipeline was being triggered by **GitHub Actions cron** (`.github/workflows/intel-pipeline.yml`),
which replaced Supabase `pg_cron` jobs that had "stopped firing". GitHub's scheduled
workflows are **best-effort by design** — during peak load they are delayed (often
15–60+ min) or **skipped entirely**, and they auto-disable after 60 days with no commits.
That is why the scanner kept going stale and the health-check had to keep
auto-remediating it.

## The fix: a dedicated external cron (most reliable, no remediation)
A purpose-built uptime-cron pings the function URLs on an exact schedule. It is
independent of GitHub and Supabase, and the regular pings also keep the Supabase
project warm. [cron-job.org](https://cron-job.org) is free and reliable; EasyCron or
UptimeRobot work the same way.

### Job 1 — RSS scanner (every 2 hours)
- **URL:** `https://uuluuhltphgwfblcghlp.supabase.co/functions/v1/rss-scanner`
- **Method:** `POST`
- **Schedule:** every 2 hours (e.g. `*/120` minutes, or `:15` past every 2nd hour)
- **Request headers:**
  - `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E`
  - `apikey: <same anon key as above>`
  - `Content-Type: application/json`
- **Request body:** `{}`
- **Expected response:** HTTP 200 with `{"success":true,...}`

### Job 2 — Health check (every 6 hours)
- **URL:** `https://uuluuhltphgwfblcghlp.supabase.co/functions/v1/health-check`
- Same method, headers and body as above.
- **Schedule:** every 6 hours.

### cron-job.org quick steps
1. Sign up (free) at https://cron-job.org and verify your email.
2. **Create cronjob** → paste the scanner URL → **Common → every 2 hours**.
3. Open **Advanced**: set request method **POST**, add the three headers above, set
   request body to `{}`.
4. Enable **"Save responses"** so you can see each run's JSON. Save.
5. Repeat for the health-check URL on a 6-hour schedule.
6. Hit **"Test run"** on each — you should get HTTP 200 immediately.

## Backups (already in place — leave them on)
- The **GitHub Actions** workflow stays as a manual/secondary trigger (it can't hurt:
  the scanner de-dupes by title, so an occasional double-run inserts nothing twice).
- The **health-check** still auto-triggers the scanner if it ever sees data >8h old —
  but with the external cron firing on time, it should rarely need to.

## Optional in-platform alternative (no third party)
If you would rather keep everything inside Supabase and the project is on an always-on
(paid) plan, a `pg_cron` + `pg_net` job can call the function from Postgres instead.
Tell me and I'll add the migration. On the free tier the external cron above is the
safer choice because it also keeps the project from pausing.

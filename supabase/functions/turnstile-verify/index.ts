// turnstile-verify — verify a Cloudflare Turnstile token, then insert a public
// form submission with the service role. Client payloads are sanitised against a
// per-table column whitelist, and status is forced server-side, so a manipulated
// form cannot inject fields (e.g. status:"approved").
//
// Deploy:  supabase functions deploy turnstile-verify --project-ref uuluuhltphgwfblcghlp --no-verify-jwt
// Secret:  supabase secrets set TURNSTILE_SECRET=<your-secret> --project-ref uuluuhltphgwfblcghlp
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Only these columns are accepted from the client, per table. Anything else is dropped.
const ALLOWED: Record<string, string[]> = {
  redflag_submissions:  ['name', 'aliases', 'county', 'social_handles', 'modus_operandi', 'details', 'photo_url'],
  incident_reports:     ['incident_date', 'county', 'location', 'incident_type', 'description', 'victim_age_range',
                         'tech_facilitated', 'tech_details', 'source_url', 'source_type', 'reported_to_police',
                         'ob_number', 'submitter_name', 'submitter_email', 'submitter_phone', 'terms_accepted'],
  petition_signatures:  ['name', 'email', 'county', 'country', 'message'],
  partner_applications: ['org_name', 'org_type', 'county', 'website', 'contact_name', 'contact_email',
                         'contact_phone', 'description', 'partnership_interest', 'data_sharing', 'referral_pathway'],
  halafu_donor_interest:['project_id', 'project_title', 'donor_type', 'name', 'organisation', 'email', 'message'],
}
// Tables whose rows must always start as 'pending' (never client-controlled).
const STATUS_PENDING = new Set(['redflag_submissions', 'incident_reports', 'partner_applications'])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

  try {
    if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405)

    const { token, table, payload } = await req.json().catch(() => ({}))
    if (!token) return json({ ok: false, error: 'Missing verification token.' })
    const cols = ALLOWED[table]
    if (!cols) return json({ ok: false, error: 'Unknown form.' }, 400)

    // 1) Verify the Turnstile token with Cloudflare.
    const secret = Deno.env.get('TURNSTILE_SECRET') || ''
    if (!secret) return json({ ok: false, error: 'Verification is not configured.' }, 500)
    const ip = (req.headers.get('CF-Connecting-IP') || req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    const body = new URLSearchParams({ secret, response: String(token) })
    if (ip) body.set('remoteip', ip)
    const vr = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
    const outcome = await vr.json().catch(() => ({ success: false }))
    if (!outcome.success) return json({ ok: false, error: 'Verification failed. Please try again.' })

    // 2) Build a clean row from the whitelist only.
    const row: Record<string, unknown> = {}
    for (const k of cols) if (payload && payload[k] !== undefined) row[k] = payload[k]
    if (STATUS_PENDING.has(table)) row.status = 'pending'

    // 3) Insert with the service role (row is already sanitised).
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { error } = await admin.from(table).insert([row])
    if (error) return json({ ok: false, error: error.code === '23505'
      ? 'This looks like a duplicate — it may already have been submitted.'
      : 'Could not save your submission.' })

    return json({ ok: true })
  } catch (_e) {
    return json({ ok: false, error: 'Unexpected error.' }, 500)
  }
})

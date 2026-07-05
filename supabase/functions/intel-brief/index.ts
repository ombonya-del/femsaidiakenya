import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)
const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const REVIEW_EMAIL   = Deno.env.get('BRIEF_REVIEW_EMAIL') ?? 'ombonya@gmail.com'
const REVIEW_FROM    = Deno.env.get('BRIEF_FROM') ?? 'FemSaidia Intel <alerts@femsaidiakenya.org>'
const GH_TOKEN       = Deno.env.get('GH_DISPATCH_TOKEN') ?? ''
const GH_REPO        = Deno.env.get('GH_REPO') ?? 'ombonya-del/femsaidiakenya'
const ADMIN_URL      = Deno.env.get('ADMIN_URL') ?? 'https://admin.femsaidiakenya.org'
const BRIEF_PUBLISHERS = (Deno.env.get('BRIEF_PUBLISHERS') ?? 'ombonya@gmail.com')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

// Allow the admin frontend (browser) to call this function — without these,
// the preflight/response is blocked and the client sees "Failed to fetch".
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function resultPage(emoji: string, color: string, msg: string): Response {
  return new Response(
    `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
     <div style="font-family:sans-serif;max-width:480px;margin:60px auto;text-align:center;padding:24px">
       <div style="font-size:44px">${emoji}</div>
       <h2 style="color:${color};margin:8px 0">${msg}</h2>
       <p style="color:#888;font-size:12px">FemSaidia Kenya · Intel Brief</p>
     </div>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS } }
  )
}

function jsonResp(obj: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...CORS } })
}

// Publish a draft brief — only an authenticated, allow-listed admin may do this.
async function handlePublish(briefId: string, authHeader: string): Promise<Response> {
  const token = (authHeader || '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return jsonResp({ error: 'Not authorised — publish from the signed-in admin.' }, 401)
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return jsonResp({ error: 'Session invalid or expired — sign in again.' }, 401)
  if (!BRIEF_PUBLISHERS.includes((user.email || '').toLowerCase()))
    return jsonResp({ error: 'Your account is not authorised to publish briefs.' }, 403)
  const { data: brief, error } = await supabase.from('intel_briefs')
    .update({ active: true }).eq('id', briefId).select().single()
  if (error || !brief) return jsonResp({ error: 'Brief not found.' }, 404)
  let dispatched = false
  if (GH_TOKEN) {
    try {
      const r = await fetch(`https://api.github.com/repos/${GH_REPO}/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GH_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'femsaidia-intel-brief',
        },
        body: JSON.stringify({ event_type: 'publish-brief', client_payload: { brief_id: briefId } }),
      })
      dispatched = r.ok
      if (!r.ok) console.error('GitHub dispatch failed:', r.status, await r.text())
    } catch (e: any) { console.error('GitHub dispatch error:', e.message) }
  }
  return jsonResp({ success: true, title: brief.title, pdf_rebuild_triggered: dispatched, by: user.email })
}

// Email the freshly-generated DRAFT brief to the editor for review + one-click publish.
async function emailBriefForReview(title: string, period: string, briefText: string, pdfUrl: string): Promise<boolean> {
  if (!RESEND_API_KEY) { console.log('Review email skipped — RESEND_API_KEY not set'); return false }
  const esc = (s: string) => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const bodyHtml = esc(briefText)
    .replace(/---([A-Z_]+)---/g, '<br><strong style="color:#8A1030;font-size:11px;letter-spacing:.06em">$1</strong><br>')
    .replace(/\n/g, '<br>')
  const html = `<div style="font-family:sans-serif;max-width:640px;margin:0 auto;background:#fff">
    <div style="background:#8A1030;padding:18px 24px">
      <p style="margin:0;color:#fff;font-size:11px;font-weight:800;letter-spacing:.08em">📋 INTEL BRIEF — DRAFT FOR REVIEW</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:18px">${esc(title)}</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:12px">${esc(period)}</p>
    </div>
    <div style="padding:20px 24px">
      <div style="background:#FFF8E1;border:1px solid #F2C75C;border-radius:8px;padding:12px 14px;margin-bottom:16px;font-size:12.5px;color:#7A5A00">
        This brief is a <strong>private draft</strong> — it will not appear on the site until you publish it.
      </div>
      <a href="${ADMIN_URL}" style="display:inline-block;background:#1A5A2A;color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:12px 24px;border-radius:8px">Review &amp; publish in the admin →</a>
      <br>
      <a href="${esc(pdfUrl)}" style="display:inline-block;color:#8A1030;text-decoration:none;font-weight:700;font-size:12.5px;margin:10px 0 16px">Preview the draft PDF →</a>
      <div style="font-size:13px;line-height:1.7;color:#222;border-top:1px solid #eee;padding-top:14px">${bodyHtml}</div>
    </div>
    <div style="padding:14px 24px;background:#f7f3f5;border-top:1px solid #e8d8e0">
      <p style="margin:0;font-size:11px;color:#999">FemSaidia Kenya · auto-generated brief for editorial review · ${new Date().toISOString().slice(0,16).replace('T',' ')} UTC</p>
    </div>
  </div>`
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{ 'Authorization':`Bearer ${RESEND_API_KEY}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ from:REVIEW_FROM, to:[REVIEW_EMAIL], subject:`📋 Review & publish: Intel Brief — ${title}`, html }),
    })
    if (!r.ok) { console.error('Review email failed:', r.status, await r.text()); return false }
    return true
  } catch (e: any) { console.error('Review email error:', e.message); return false }
}

// ── COLORS ────────────────────────────────────────────────────────────────────
const C = {
  bg:      rgb(0.067, 0.094, 0.153),
  dark2:   rgb(0.102, 0.125, 0.208),
  accent:  rgb(0.541, 0.063, 0.188),
  accent2: rgb(0.753, 0.314, 0.063),
  text:    rgb(0.941, 0.816, 0.847),
  muted:   rgb(0.533, 0.573, 0.690),
  white:   rgb(1, 1, 1),
  red:     rgb(0.800, 0.063, 0.063),
}

// ── GENERATE BRIEF TEXT ───────────────────────────────────────────────────────
async function generateBriefText(data: any): Promise<string> {
  const prompt = `You are a senior analyst at a Kenyan femicide intelligence platform. Based on the data below, write a sharp, urgent, evidence-based intelligence brief.

Write in this exact structure with these exact markers:
---OVERVIEW---
2-3 sentences. The number. What moved. What matters.

---MISOGYNY_INDEX---
2-3 sentences. Where the index is, what drove it, media vs community split.

---TOP_INCIDENTS---
3 bullet points starting with "- **Victim Name (detail):**". Lead with the victim's full name in bold. Include location, what happened, platform where misogyny erupted.

---SCANNER_CAUGHT---
3 bullet points starting with "- **Source:**". Most alarming articles/posts from the intelligence feed.

---MOTD_PATTERN---
2-3 sentences. What the Misogyny of the Day posts tell us about the pipeline this period.

---TECH_FACILITATED---
2-3 sentences. Tech platform patterns in GBV cases this period.

---COMMUNITY_PULSE---
2-3 sentences. What the X/social conversation looks like. Include any protest movements, marches, or community mobilisation if present in the data.

---THE_INSIGHT---
One analytical paragraph (4-5 sentences) connecting all the dots. FemSaidia Kenya's editorial voice. Make it count.

---THE_ASK---
5 numbered priority actions for policymakers, platform companies, and civil society partners. Format exactly as:
1. [Action for government/ministry — specific, named institution]
2. [Action for platforms — Meta, X, specific requirement]
3. [Action for compliance/enforcement — make it consequential]
4. [Action for advocacy/amplification — channels, coalitions]
5. [Action for documentation/intelligence — what to collect, who collects it]
Each action 1-2 sentences. Specific, urgent, evidence-based.

DATA:
${JSON.stringify(data, null, 2)}

Write with urgency and precision. Every number is a woman. Every pattern is a warning.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.content?.[0]?.text || ''
}

// ── PARSE SECTIONS ────────────────────────────────────────────────────────────
function parseSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {}
  let current = 'INTRO'
  let lines: string[] = []
  for (const line of text.split('\n')) {
    const m = line.trim().match(/^---([A-Z_]+)---$/)
    if (m) {
      sections[current] = lines.join('\n').trim()
      current = m[1]
      lines = []
    } else {
      lines.push(line)
    }
  }
  sections[current] = lines.join('\n').trim()
  return sections
}

// ── GENERATE PDF ──────────────────────────────────────────────────────────────

function sanitize(t: string): string {
  return t.replace(/→/g,'->')
          .replace(/←/g,'<-')
          .replace(/[^ -ÿ]/g,'?')
}
async function generatePDF(brief: any): Promise<Uint8Array> {
  const doc  = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const oblique = await doc.embedFont(StandardFonts.HelveticaOblique)

  const W = 595, H = 842
  const ML = 40, MR = 40, MT = 30, MB = 30
  const TW = W - ML - MR

  const sections = parseSections(brief.content || '')

  let page = doc.addPage([W, H])
  let y = H - MT

  const newPage = () => {
    page = doc.addPage([W, H])
    y = H - MT
    page.drawRectangle({ x:0, y:0, width:W, height:H, color:C.dark2 })
  }

  const checkY = (needed: number) => {
    if (y - needed < MB) newPage()
  }

  const drawText = (text: string, x: number, size: number, f: any, color: any, maxW: number) => {
    const words = text.split(' ')
    let line = ''
    const lineH = size * 1.5
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      const w = f.widthOfTextAtSize(test, size)
      if (w > maxW && line) {
        checkY(lineH)
        page.drawText(sanitize(line), { x, y, size, font: f, color })
        y -= lineH
        line = word
      } else {
        line = test
      }
    }
    if (line) {
      checkY(lineH)
      page.drawText(sanitize(line), { x, y, size, font: f, color })
      y -= lineH
    }
  }

  page.drawRectangle({ x:0, y:0, width:W, height:H, color:C.dark2 })
  page.drawRectangle({ x:0, y:H-60, width:W, height:60, color:C.bg })
  page.drawText('FEMSAIDIA KENYA', { x:ML, y:H-28, size:16, font:bold, color:C.white })
  page.drawText('INTELLIGENCE BRIEF', { x:ML, y:H-44, size:9, font, color:C.muted })
  const period = `${brief.period_start || ''} - ${brief.period_end || ''}`
  page.drawText(period, { x:W-ML-font.widthOfTextAtSize(period,8), y:H-36, size:8, font, color:C.muted })
  page.drawLine({ start:{x:0,y:H-60}, end:{x:W,y:H-60}, thickness:2, color:C.accent })
  y = H - 76

  const title = brief.title || 'FemSaidia Intelligence Brief'
  page.drawText(sanitize(title), { x:ML, y, size:18, font:bold, color:C.white })
  y -= 28
  page.drawLine({ start:{x:ML,y}, end:{x:W-MR,y}, thickness:1, color:C.accent })
  y -= 12

  const sectionMap = [
    ['OVERVIEW','Overview'],['MISOGYNY_INDEX','Misogyny Index'],
    ['TOP_INCIDENTS','Recorded Incidents'],['SCANNER_CAUGHT','What the Scanner Caught'],
    ['MOTD_PATTERN','Misogyny of the Day - Pattern'],['TECH_FACILITATED','Tech-Facilitated Violence'],
    ['COMMUNITY_PULSE','Community Pulse'],
  ]

  for (const [key, label] of sectionMap) {
    const text = sections[key]
    if (!text) continue
    checkY(32)
    y -= 6
    page.drawText(`* ${label.toUpperCase()}`, { x:ML, y, size:8, font:bold, color:C.accent })
    y -= 10
    page.drawLine({ start:{x:ML,y}, end:{x:W-MR,y}, thickness:0.3, color:C.accent })
    y -= 10
    for (const line of text.split('\n')) {
      const l = line.trim()
      if (!l) continue
      if (l.startsWith('- ') || l.startsWith('• ')) {
        checkY(18)
        page.drawText('>', { x:ML, y, size:9, font:bold, color:C.accent2 })
        drawText(l.slice(2).replace(/\*\*/g,''), ML+14, 9, font, C.text, TW-14)
      } else {
        drawText(l, ML, 9.5, font, C.text, TW)
      }
      y -= 2
    }
  }

  const insight = sections['THE_INSIGHT']
  if (insight) {
    checkY(32)
    y -= 8
    page.drawText('* THE INSIGHT', { x:ML, y, size:8, font:bold, color:C.accent })
    y -= 10
    page.drawLine({ start:{x:ML,y}, end:{x:W-MR,y}, thickness:0.3, color:C.accent })
    y -= 10
    drawText(`"${insight.trim()}"`, ML, 10, oblique, C.white, TW)
  }

  const ask = sections['THE_ASK']
  if (ask) {
    checkY(40)
    y -= 10
    page.drawLine({ start:{x:ML,y}, end:{x:W-MR,y}, thickness:1, color:C.accent2 })
    y -= 14
    page.drawText('> THE ASK', { x:ML, y, size:8, font:bold, color:C.accent2 })
    y -= 14
    for (const line of ask.split('\n')) {
      const l = line.trim()
      if (!l) continue
      drawText(l, ML, 10, font, C.accent2, TW)
      y -= 4
    }
  }

  checkY(30)
  y -= 10
  page.drawLine({ start:{x:ML,y}, end:{x:W-MR,y}, thickness:0.3, color:C.muted })
  y -= 12
  const footer = 'FemSaidia Kenya · femsaidiakenya.org · A woman is killed every 47 hours in Kenya.'
  page.drawText(sanitize(footer), { x:ML, y, size:7.5, font, color:C.muted })

  return await doc.save()
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  // Publish endpoint: editor clicks the one-click link in the review email
  const u = new URL(req.url)
  const publishId = u.searchParams.get('publish')
  if (publishId) return await handlePublish(publishId, req.headers.get('Authorization') || '')

  // Scheduled generation: the biweekly cron passes a shared CRON_SECRET so a fresh
  // draft can be produced automatically without an interactive admin sign-in.
  const cronSecret = Deno.env.get('CRON_SECRET') || ''
  const isCron = cronSecret !== '' && u.searchParams.get('cron') === cronSecret

  // Otherwise generating a brief calls the paid Anthropic API — require an authorised
  // admin (same allowlist as publishing). Blocks anonymous / bill-abuse calls.
  const genToken = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim()
  const { data: { user: genUser } } = genToken
    ? await supabase.auth.getUser(genToken)
    : { data: { user: null } } as any
  if (!isCron && (!genUser || !BRIEF_PUBLISHERS.includes((genUser.email || '').toLowerCase())))
    return jsonResp({ error: 'Not authorised — generate briefs from the signed-in admin.' }, 403)

  try {
    const now    = new Date()
    const since  = new Date(now.getTime() - 14*24*60*60*1000).toISOString()
    const today  = now.toISOString().split('T')[0]
    const weekNo = Math.ceil(now.getDate() / 7)
    const month  = now.toLocaleDateString('en-KE', { month:'long', year:'numeric' })

    // ── FIX: added protest/march query alongside existing ones ────────────────
    const [idxRes, artRes, hlRes, caseRes, protestRes] = await Promise.all([
      supabase.from('misogyny_index').select('*').order('date',{ascending:false}).limit(14),
      supabase.from('sentiment_articles')
        .select('article_title,source_name,misogyny_score,gbv_relevance,sentiment,tech_facilitated,tech_platforms,platform,content_type,is_kibe_related,scanned_at')
        .gte('scanned_at',since).order('misogyny_score',{ascending:false}).limit(20),
      supabase.from('misogyny_highlights').select('*').eq('active',true)
        .gte('highlight_date',since).order('highlight_date',{ascending:false}).limit(7),
      // ── FIX: victim_name was selected but never used — now it is ─────────
      supabase.from('femicide_cases')
        .select('victim_name,county,incident_date,incident_type,suspect_relationship,tech_facilitated,platform')
        .gte('incident_date',since).order('incident_date',{ascending:false}).limit(10),
      // ── FIX: new — capture protests, marches, community mobilisation ──────
      supabase.from('sentiment_articles')
        .select('article_title,source_name,platform,scanned_at')
        .gte('scanned_at',since)
        .or('article_title.ilike.%march%,article_title.ilike.%protest%,article_title.ilike.%rally%,article_title.ilike.%demonstration%,article_title.ilike.%femicide march%')
        .limit(5),
    ])

    const index      = idxRes.data || []
    // Guard: keep mis-scored off-topic Kibe gossip (house/car/lifestyle) out of the
    // brief. A Kibe-flagged item only counts if its title carries a real GBV/misogyny
    // /manosphere term — otherwise it's celebrity gossip that was wrongly scored high.
    const REL_RE = /(woman|women|girl|wife|misogyn|red.?pill|manosphere|28 commandment|lambistic|gbv|femicid|violence|harass|assault|rape|defil|simp|incel|noisy women|red flag|abuse|feminis|hypergam|high.?value|provider|dating|marriage|relationship)/i
    const offTopicKibe = (a:any) => (a.is_kibe_related || /kibe/i.test(a.article_title||'')) && !REL_RE.test(a.article_title||'')
    const articles   = (artRes.data || []).filter((a:any)=>!offTopicKibe(a))
    const highlights = hlRes.data || []
    const cases      = caseRes.data || []
    const protests   = protestRes.data || []
    const latestIdx  = index[0]
    const prevIdx    = index[1]

    const briefData = {
      period: `${since.split('T')[0]} to ${today}`,
      misogyny_index: {
        current:      latestIdx?.score,
        previous:     prevIdx?.score,
        delta:        latestIdx && prevIdx ? latestIdx.score - prevIdx.score : 0,
        news_score:   latestIdx?.news_score,
        social_score: latestIdx?.social_score,
      },
      cases_recorded: cases.length,
      // ── FIX: victim names now included so Claude can name them ────────────
      cases: cases.map((c:any) => ({
        name:         c.victim_name,          // was missing before
        county:       c.county,
        type:         c.incident_type,
        relationship: c.suspect_relationship,
        platform:     c.platform,
        tech:         c.tech_facilitated,
        date:         c.incident_date,
      })),
      top_articles: articles.filter((a:any)=>a.misogyny_score>=7).slice(0,5)
        .map((a:any) => ({ title:a.article_title, source:a.source_name, score:a.misogyny_score, sentiment:a.sentiment })),
      tech_facilitated_count: articles.filter((a:any)=>a.tech_facilitated).length,
      tech_platforms: [...new Set(
        articles.filter((a:any)=>a.tech_facilitated).flatMap((a:any)=>a.tech_platforms||[])
      )].slice(0,5),
      social_posts_count: articles.filter((a:any)=>a.platform==='x').length,
      motd_highlights: highlights.map((h:any) => ({
        platform: h.platform, content: h.content.slice(0,150),
        context: h.context, date: h.highlight_date,
      })),
      // ── FIX: community events now surfaced to Claude ──────────────────────
      community_events: protests.map((p:any) => ({
        headline: p.article_title, source: p.source_name,
        platform: p.platform, date: p.scanned_at?.split('T')[0],
      })),
      total_articles_scanned: articles.length,
    }

    const briefText = await generateBriefText(briefData)
    console.log('Brief text generated, length:', briefText.length)

    const title = `FemSaidia Intelligence Brief - ${month} Week ${weekNo}`

    const { data: saved, error: dbErr } = await supabase.from('intel_briefs').insert([{
      title, content: briefText, data_snapshot: briefData,
      period_start: since.split('T')[0], period_end: today, active: false   // DRAFT — published via the email link
    }]).select().single()

    if (dbErr) throw dbErr

    const pdfBytes = await generatePDF({ ...saved, title, period_start: since.split('T')[0], period_end: today })

    // Draft PDF (preview only) — the live public PDF is built by the GitHub Action on publish
    const { error: storageErr } = await supabase.storage
      .from('public-assets')
      .upload('intel-brief-draft.pdf', pdfBytes, { contentType:'application/pdf', upsert:true })

    if (storageErr) console.error('Storage error:', storageErr)

    const pdfUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/public-assets/intel-brief-draft.pdf`
    await supabase.from('intel_briefs').update({ pdf_url: pdfUrl }).eq('id', saved.id)

    // Email the DRAFT to the editor — review/edit/publish happens in the signed-in admin
    const emailed = await emailBriefForReview(title, `${since.split('T')[0]} - ${today}`, briefText, pdfUrl)

    return new Response(JSON.stringify({
      success: true, brief_id: saved.id, title, draft: true, pdf_url: pdfUrl, review_email_sent: emailed,
      cases_with_names: cases.filter((c:any)=>c.victim_name).length,
      community_events_found: protests.length,
      preview: briefText.slice(0,200)
    }), { status:200, headers:{'Content-Type':'application/json'} })

  } catch (err: any) {
    console.error('Intel brief error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status:500 })
  }
})

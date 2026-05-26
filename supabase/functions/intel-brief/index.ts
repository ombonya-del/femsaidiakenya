import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)
const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''

// ── COLORS ────────────────────────────────────────────────────────────────────
const C = {
  bg:      rgb(0.067, 0.094, 0.153), // #111827
  dark2:   rgb(0.102, 0.125, 0.208), // #1A2035
  accent:  rgb(0.541, 0.063, 0.188), // #8A1030
  accent2: rgb(0.753, 0.314, 0.063), // #C05010
  text:    rgb(0.941, 0.816, 0.847), // #F0D0D8
  muted:   rgb(0.533, 0.573, 0.690), // #8892B0
  white:   rgb(1, 1, 1),
  red:     rgb(0.800, 0.063, 0.063), // #CC1010
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
3 bullet points starting with "- ". Most significant cases this period.

---SCANNER_CAUGHT---
3 bullet points starting with "- ". Most alarming articles from the intelligence feed.

---MOTD_PATTERN---
2-3 sentences. What the Misogyny of the Day posts tell us about the pipeline.

---TECH_FACILITATED---
2-3 sentences. Tech platform patterns in GBV cases.

---COMMUNITY_PULSE---
2-3 sentences. What the X/social conversation looks like this week.

---THE_INSIGHT---
One analytical paragraph (4-5 sentences) connecting all the dots. FemSaidia Kenya's editorial voice. Make it count.

---THE_ASK---
One specific actionable ask for policymakers or funders. One sentence. Direct.

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
      max_tokens: 2000,
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
async function generatePDF(brief: any): Promise<Uint8Array> {
  const doc  = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const oblique = await doc.embedFont(StandardFonts.HelveticaOblique)

  const W = 595, H = 842 // A4
  const ML = 40, MR = 40, MT = 30, MB = 30
  const TW = W - ML - MR

  const sections = parseSections(brief.content || '')

  let page = doc.addPage([W, H])
  let y = H - MT

  const newPage = () => {
    page = doc.addPage([W, H])
    y = H - MT
    // Background
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
        page.drawText(line, { x, y, size, font: f, color })
        y -= lineH
        line = word
      } else {
        line = test
      }
    }
    if (line) {
      checkY(lineH)
      page.drawText(line, { x, y, size, font: f, color })
      y -= lineH
    }
  }

  // Draw background on first page
  page.drawRectangle({ x:0, y:0, width:W, height:H, color:C.dark2 })

  // ── HEADER BAR ──
  page.drawRectangle({ x:0, y:H-60, width:W, height:60, color:C.bg })
  page.drawText('FEMSAIDIA KENYA', { x:ML, y:H-28, size:16, font:bold, color:C.white })
  page.drawText('INTELLIGENCE BRIEF', { x:ML, y:H-44, size:9, font, color:C.muted })
  const period = `${brief.period_start || ''} - ${brief.period_end || ''}`
  page.drawText(period, { x:W-ML-font.widthOfTextAtSize(period,8), y:H-36, size:8, font, color:C.muted })
  page.drawLine({ start:{x:0,y:H-60}, end:{x:W,y:H-60}, thickness:2, color:C.accent })
  y = H - 76

  // ── TITLE ──
  const title = brief.title || 'FemSaidia Intelligence Brief'
  page.drawText(title, { x:ML, y, size:18, font:bold, color:C.white })
  y -= 28
  page.drawLine({ start:{x:ML,y}, end:{x:W-MR,y}, thickness:1, color:C.accent })
  y -= 12

  // ── SECTIONS ──
  const sectionMap = [
    ['OVERVIEW',         'Overview'],
    ['MISOGYNY_INDEX',   'Misogyny Index'],
    ['TOP_INCIDENTS',    'Recorded Incidents'],
    ['SCANNER_CAUGHT',   'What the Scanner Caught'],
    ['MOTD_PATTERN',     'Misogyny of the Day - Pattern'],
    ['TECH_FACILITATED', 'Tech-Facilitated Violence'],
    ['COMMUNITY_PULSE',  'Community Pulse'],
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
        drawText(l.slice(2), ML+14, 9, font, C.text, TW-14)
      } else {
        drawText(l, ML, 9.5, font, C.text, TW)
      }
      y -= 2
    }
  }

  // ── THE INSIGHT ──
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

  // ── THE ASK ──
  const ask = sections['THE_ASK']
  if (ask) {
    checkY(40)
    y -= 10
    page.drawLine({ start:{x:ML,y}, end:{x:W-MR,y}, thickness:1, color:C.accent2 })
    y -= 14
    page.drawText('> THE ASK', { x:ML, y, size:8, font:bold, color:C.accent2 })
    y -= 14
    drawText(ask.trim(), ML, 11, font, C.accent2, TW)
  }

  // ── FOOTER ──
  checkY(30)
  y -= 10
  page.drawLine({ start:{x:ML,y}, end:{x:W-MR,y}, thickness:0.3, color:C.muted })
  y -= 12
  const footer = 'FemSaidia Kenya · femsaidiakenya.org · halafu@femsaidiakenya.org · A woman is killed every 47 hours in Kenya.'
  page.drawText(footer, { x:ML, y, size:7.5, font, color:C.muted })

  return await doc.save()
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  try {
    const now    = new Date()
    const since  = new Date(now.getTime() - 14*24*60*60*1000).toISOString()
    const today  = now.toISOString().split('T')[0]
    const weekNo = Math.ceil(now.getDate() / 7)
    const month  = now.toLocaleDateString('en-KE', { month:'long', year:'numeric' })

    // Fetch all data
    const [idxRes, artRes, hlRes, caseRes] = await Promise.all([
      supabase.from('misogyny_index').select('*').order('date',{ascending:false}).limit(14),
      supabase.from('sentiment_articles').select('article_title,source_name,misogyny_score,gbv_relevance,sentiment,tech_facilitated,tech_platforms,platform,content_type,scanned_at').gte('scanned_at',since).order('misogyny_score',{ascending:false}).limit(20),
      supabase.from('misogyny_highlights').select('*').eq('active',true).gte('highlight_date',since).order('highlight_date',{ascending:false}).limit(7),
      supabase.from('femicide_cases').select('victim_name,county,incident_date,incident_type,suspect_relationship,tech_facilitated').gte('incident_date',since).order('incident_date',{ascending:false}).limit(10),
    ])

    const index      = idxRes.data || []
    const articles   = artRes.data || []
    const highlights = hlRes.data || []
    const cases      = caseRes.data || []
    const latestIdx  = index[0]
    const prevIdx    = index[1]

    const briefData = {
      period: `${since.split('T')[0]} to ${today}`,
      misogyny_index: {
        current: latestIdx?.score, previous: prevIdx?.score,
        delta: latestIdx && prevIdx ? latestIdx.score - prevIdx.score : 0,
        news_score: latestIdx?.news_score, social_score: latestIdx?.social_score,
      },
      cases_recorded: cases.length,
      cases: cases.map((c:any) => ({ county:c.county, type:c.incident_type, relationship:c.suspect_relationship, tech:c.tech_facilitated, date:c.incident_date })),
      top_articles: articles.filter((a:any)=>a.misogyny_score>=7).slice(0,5).map((a:any) => ({ title:a.article_title, source:a.source_name, score:a.misogyny_score, sentiment:a.sentiment })),
      tech_facilitated_count: articles.filter((a:any)=>a.tech_facilitated).length,
      tech_platforms: [...new Set(articles.filter((a:any)=>a.tech_facilitated).flatMap((a:any)=>a.tech_platforms||[]))].slice(0,5),
      social_posts_count: articles.filter((a:any)=>a.platform==='x').length,
      motd_highlights: highlights.map((h:any) => ({ platform:h.platform, content:h.content.slice(0,150), context:h.context, date:h.highlight_date })),
      total_articles_scanned: articles.length,
    }

    // Generate text
    const briefText = await generateBriefText(briefData)
    console.log('Brief text generated, length:', briefText.length)

    const title = `FemSaidia Intelligence Brief - ${month} Week ${weekNo}`

    // Save to DB
    const { data: saved, error: dbErr } = await supabase.from('intel_briefs').insert([{
      title, content: briefText, data_snapshot: briefData,
      period_start: since.split('T')[0], period_end: today, active: true
    }]).select().single()

    if (dbErr) throw dbErr

    // Generate PDF
    const pdfBytes = await generatePDF({ ...saved, title, period_start: since.split('T')[0], period_end: today })
    console.log('PDF generated, size:', pdfBytes.length)

    // Upload PDF to Supabase storage
    const { error: storageErr } = await supabase.storage
      .from('public-assets')
      .upload('intel-brief-latest.pdf', pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (storageErr) console.error('Storage error:', storageErr)
    else console.log('PDF uploaded to storage')

    // Update DB record with PDF URL
    const pdfUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/public-assets/intel-brief-latest.pdf`
    await supabase.from('intel_briefs').update({ pdf_url: pdfUrl }).eq('id', saved.id)

    return new Response(JSON.stringify({
      success: true,
      brief_id: saved.id,
      title,
      pdf_url: pdfUrl,
      preview: briefText.slice(0, 200)
    }), { status:200, headers:{'Content-Type':'application/json'} })

  } catch (err: any) {
    console.error('Intel brief error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status:500 })
  }
})

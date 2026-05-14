// ─────────────────────────────────────────────────────────────────────────────
// FemSaidia Kenya — Social Media Ingest Edge Function
// Receives webhooks from: IFTTT (X/Twitter), RSSHub (TikTok), manual submissions
// Classifies via Claude · Inserts into sentiment_articles
// Endpoint: https://uuluuhltphgwfblcghlp.supabase.co/functions/v1/social-ingest
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_KEY    = Deno.env.get('ANTHROPIC_API_KEY') || ''
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase         = createClient(SUPABASE_URL, SUPABASE_SERVICE)

// ── GBV KEYWORDS (same as RSS scanner) ───────────────────────────────────────
const GBV_KEYWORDS = [
  'femicide','murdered','killed','found dead','gender-based violence','gbv',
  'domestic violence','sexual assault','rape','acid attack','strangled',
  'stabbed woman','beaten to death','intimate partner','missing woman',
  'missing girl','body found','woman dead','girl dead','violence against women',
  'gender violence','gbv kenya','she was killed','woman killed','she died',
  'her body','killed her','he killed','beaten her','abused her',
  'gender justice','feminist','patriarchy','misogyn','toxic masculin',
  'dating app','airbnb','tinder','whatsapp','facebook','tiktok','instagram',
  'online predator','kenya femicide','cyber harassment','revenge porn',
  'digital abuse','woman found','girl found','acid','strangled her',
  'end femicide','gender equality','women rights','gbv kenya',
  '#femicide','#gbvkenya','#endfemicide','#killedher','#endgbv',
]

const isGBVRelevant = (text: string) => {
  const lower = text.toLowerCase()
  return GBV_KEYWORDS.some(k => lower.includes(k))
}

// ── CLASSIFY WITH CLAUDE ──────────────────────────────────────────────────────
async function classify(item: {
  title: string
  snippet: string
  content_type: string
  source: string
}) {
  const prompt = `You are a gender-based violence researcher analysing Kenyan social media content.

Classify this single item. Return ONLY valid JSON, no other text.

Required fields:
- "gbv_relevance": 0-10 (how relevant is this to GBV/femicide in Kenya)
- "misogyny_score": 0-10 (level of misogynistic content or framing)
- "sentiment": "alarming" | "negative" | "neutral" | "positive"
- "tech_facilitated": true if GBV occurred via digital platform
- "tech_platforms": array of platform names if tech_facilitated, else []
- "summary": 1-2 sentence summary of the content's GBV relevance

ITEM:
[${item.content_type.toUpperCase()}] ${item.source}
${item.title}
${item.snippet}

Return only JSON.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data  = await res.json()
    const text  = data.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (err) {
    console.error('Claude classification error:', err)
    return {
      gbv_relevance: 5, misogyny_score: 3, sentiment: 'neutral',
      tech_facilitated: false, tech_platforms: [], summary: '',
    }
  }
}

// ── NORMALISE INCOMING WEBHOOK ────────────────────────────────────────────────
function normalise(body: any): {
  source: string
  platform: string
  title: string
  snippet: string
  source_url: string
  content_type: string
  thumbnail_url: string
  scanned_at: string
} | null {

  // ── IFTTT format ─────────────────────────────────────────────────────────
  // Body sent from IFTTT webhook action — fields match IFTTT ingredient names
  // Configure IFTTT body as:
  // {"source":"ifttt","platform":"x","account":"@USERNAME",
  //  "text":"{{Text}}","link":"{{LinkToTweet}}",
  //  "user":"{{UserName}}","created_at":"{{CreatedAt}}"}
  if (body.source === 'ifttt') {
    const text    = body.text     || ''
    const link    = body.link     || body.LinkToTweet || ''
    const user    = body.user     || body.UserName    || body.account || ''
    const created = body.created_at || body.CreatedAt || new Date().toISOString()
    return {
      source:        `X / @${user.replace('@','')}`,
      platform:      'x',
      title:         text.slice(0, 140) + (text.length > 140 ? '…' : ''),
      snippet:       text,
      source_url:    link,
      content_type:  'social_post',
      thumbnail_url: '',
      scanned_at:    new Date(created).toISOString(),
    }
  }

  // ── RSSHub / generic RSS format ──────────────────────────────────────────
  // RSSHub sends standard RSS item fields
  if (body.source === 'rsshub' || body.source === 'rss') {
    return {
      source:        body.feed_source || body.author || 'RSSHub',
      platform:      body.platform   || 'tiktok',
      title:         body.title      || body.description?.slice(0,140) || '',
      snippet:       body.description || body.content || body.title || '',
      source_url:    body.link       || body.url      || '',
      content_type:  body.platform === 'tiktok' ? 'video' : 'social_post',
      thumbnail_url: body.image      || body.thumbnail || '',
      scanned_at:    body.pubDate
                       ? new Date(body.pubDate).toISOString()
                       : new Date().toISOString(),
    }
  }

  // ── Manual submission format ─────────────────────────────────────────────
  // From the "Submit a post" form on the dashboard
  if (body.source === 'manual') {
    return {
      source:        body.account   || body.platform || 'Manual submission',
      platform:      body.platform  || 'x',
      title:         body.title     || body.text?.slice(0,140) || '',
      snippet:       body.text      || body.title    || '',
      source_url:    body.url       || body.link     || '',
      content_type:  body.content_type || 'social_post',
      thumbnail_url: body.thumbnail  || '',
      scanned_at:    new Date().toISOString(),
    }
  }

  // ── Facebook RSS format ──────────────────────────────────────────────────
  if (body.source === 'facebook') {
    return {
      source:        body.page_name || 'Facebook',
      platform:      'facebook',
      title:         body.title     || body.text?.slice(0,140) || '',
      snippet:       body.text      || body.description         || '',
      source_url:    body.link      || body.url                  || '',
      content_type:  'social_post',
      thumbnail_url: body.image     || '',
      scanned_at:    new Date().toISOString(),
    }
  }

  return null
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // Health check
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', fn: 'social-ingest' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    console.log('social-ingest received:', JSON.stringify(body).slice(0, 200))

    // Normalise to standard format
    const item = normalise(body)
    if (!item) {
      return new Response(JSON.stringify({ error: 'Unrecognised webhook format' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    // Deduplication — check if URL already exists
    if (item.source_url) {
      const { data: existing } = await supabase
        .from('sentiment_articles')
        .select('id')
        .eq('source_url', item.source_url)
        .limit(1)

      if (existing && existing.length > 0) {
        console.log('Duplicate, skipping:', item.source_url)
        return new Response(JSON.stringify({ status: 'duplicate', skipped: true }), {
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // GBV relevance pre-filter — skip if clearly irrelevant
    const combinedText = `${item.title} ${item.snippet}`
    if (!isGBVRelevant(combinedText)) {
      console.log('Not GBV relevant, skipping:', item.title.slice(0, 60))
      return new Response(JSON.stringify({ status: 'skipped', reason: 'not_gbv_relevant' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Classify with Claude
    const scores = await classify({
      title:        item.title,
      snippet:      item.snippet,
      content_type: item.content_type,
      source:       item.source,
    })

    // Build final record
    const record = {
      title:           item.title,
      source_url:      item.source_url,
      source:          item.source,
      platform:        item.platform,
      content_type:    item.content_type,
      thumbnail_url:   item.thumbnail_url || null,
      summary:         scores.summary     || '',
      gbv_relevance:   scores.gbv_relevance    ?? 5,
      misogyny_score:  scores.misogyny_score   ?? 3,
      sentiment:       scores.sentiment        ?? 'neutral',
      tech_facilitated: scores.tech_facilitated ?? false,
      tech_platforms:  scores.tech_platforms   ?? [],
      scanned_at:      item.scanned_at,
    }

    // Insert into sentiment_articles
    const { error } = await supabase
      .from('sentiment_articles')
      .insert(record)

    if (error) {
      console.error('Insert error:', error.message)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`Inserted: [${record.misogyny_score}/10] ${record.title.slice(0,60)}`)

    return new Response(JSON.stringify({
      status:          'inserted',
      title:           record.title.slice(0, 80),
      misogyny_score:  record.misogyny_score,
      gbv_relevance:   record.gbv_relevance,
      sentiment:       record.sentiment,
      tech_facilitated: record.tech_facilitated,
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (err: any) {
    console.error('social-ingest error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
})
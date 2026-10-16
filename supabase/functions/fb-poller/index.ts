// fb-poller — reads configured external feeds (e.g. an RSS.app feed built from a
// public Facebook page) and forwards each item to the social-ingest function,
// which GBV-gates, AI-scores, writes Community Pulse (sentiment_articles) and
// routes femicide-looking posts to the case_candidates review queue.
//
// Config (Supabase → Edge Functions → fb-poller → Secrets):
//   FB_FEED_URLS   comma-separated feed URLs (RSS 2.0 / Atom / JSON Feed)
//   INGEST_SECRET  optional; forwarded to social-ingest as x-ingest-secret
// SUPABASE_URL and SUPABASE_ANON_KEY are injected automatically.
// Until FB_FEED_URLS is set this is a harmless no-op (feeds=0).

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL') || ''
const ANON_KEY      = Deno.env.get('SUPABASE_ANON_KEY') || ''
const INGEST_SECRET = Deno.env.get('INGEST_SECRET') || ''
const FEED_URLS     = (Deno.env.get('FB_FEED_URLS') || '').split(',').map(s => s.trim()).filter(Boolean)

const strip = (s: string) => (s || '')
  .replace(/<!\[CDATA\[|\]\]>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ').trim()
const tag  = (xml: string, t: string) => { const m = xml.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, 'i')); return m ? m[1] : '' }
const attr = (xml: string, t: string, a: string) => { const m = xml.match(new RegExp(`<${t}[^>]*\\b${a}="([^"]*)"`, 'i')); return m ? m[1] : '' }

function parseXml(xml: string): any[] {
  const feedTitle = strip(tag(xml, 'title')) || 'Facebook'
  const out: any[] = []
  for (const it of (xml.match(/<item[\s\S]*?<\/item>/gi) || [])) {
    out.push({
      title: strip(tag(it, 'title')),
      text: strip(tag(it, 'description') || tag(it, 'content:encoded')),
      url: strip(tag(it, 'link')) || attr(it, 'enclosure', 'url'),
      thumbnail: attr(it, 'enclosure', 'url') || attr(it, 'media:content', 'url') || attr(it, 'media:thumbnail', 'url'),
      created_at: strip(tag(it, 'pubDate')),
      feed_title: feedTitle,
    })
  }
  if (!out.length) for (const it of (xml.match(/<entry[\s\S]*?<\/entry>/gi) || [])) {
    out.push({
      title: strip(tag(it, 'title')),
      text: strip(tag(it, 'summary') || tag(it, 'content')),
      url: attr(it, 'link', 'href'),
      thumbnail: '',
      created_at: strip(tag(it, 'updated') || tag(it, 'published')),
      feed_title: feedTitle,
    })
  }
  return out
}

function parseJson(j: any): any[] {
  const title = j.title || 'Facebook'
  return (j.items || []).map((it: any) => ({
    title: it.title || '',
    text: it.content_text || (it.content_html ? it.content_html.replace(/<[^>]+>/g, ' ') : '') || it.summary || it.title || '',
    url: it.url || it.external_url || '',
    thumbnail: it.image || it.banner_image || '',
    created_at: it.date_published || '',
    feed_title: title,
  }))
}

async function forward(item: any) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/social-ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
      'apikey': ANON_KEY,
      ...(INGEST_SECRET ? { 'x-ingest-secret': INGEST_SECRET } : {}),
    },
    body: JSON.stringify({
      source: 'facebook',
      page_name: item.feed_title || 'Facebook',
      title: (item.title || item.text || '').slice(0, 140),
      text: item.text || item.title || '',
      url: item.url || '',
      thumbnail: item.thumbnail || '',
      created_at: item.created_at || '',
    }),
  })
  try { return await res.json() } catch { return { status: res.status } }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'GET') return new Response(JSON.stringify({ status: 'ok', fn: 'fb-poller', feeds: FEED_URLS.length }), { headers: { 'Content-Type': 'application/json' } })
  const summary = { feeds: FEED_URLS.length, items: 0, inserted: 0, queued: 0, skipped: 0, errors: [] as string[] }
  for (const feed of FEED_URLS) {
    try {
      const r = await fetch(feed, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FemSaidiaBot/1.0)' } })
      const body = await r.text()
      let items: any[] = []
      if ((r.headers.get('content-type') || '').includes('json') || body.trim().startsWith('{')) {
        try { items = parseJson(JSON.parse(body)) } catch { items = [] }
      }
      if (!items.length) items = parseXml(body)
      for (const it of items) {
        if (!it.url && !it.text) continue
        summary.items++
        const out = await forward(it)
        if (out && out.status === 'inserted') { summary.inserted++; if (out.case_queued) summary.queued++ }
        else summary.skipped++
      }
    } catch (e: any) { summary.errors.push(`${feed}: ${e.message}`) }
  }
  return new Response(JSON.stringify(summary), { headers: { 'Content-Type': 'application/json' } })
})

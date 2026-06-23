import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_KEY    = Deno.env.get('ANTHROPIC_API_KEY') || ''
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase         = createClient(SUPABASE_URL, SUPABASE_SERVICE)

// ── Case-alert email (Resend) ────────────────────────────────────────────────
// Fires when the scanner inserts a high-probability case (gbv_relevance >= 8),
// so new cases are never missed between manual admin checks.
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const ALERT_TO       = Deno.env.get('CASE_ALERT_TO')   || 'ombonya@gmail.com'
const ALERT_FROM     = Deno.env.get('CASE_ALERT_FROM') || 'FemSaidia Alert <alerts@femsaidiakenya.org>'
const ADMIN_URL      = 'https://admin.femsaidiakenya.org'
const ALERT_THRESHOLD = 8

function esc(s: string): string {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

async function sendCaseAlert(a: any): Promise<boolean> {
  if (!RESEND_API_KEY) { console.log('Case alert skipped — RESEND_API_KEY not set'); return false }
  const title = esc(stripHtml(a.article_title || a.title || 'Untitled'))
  const source = esc(a.source_name || a.source || 'Unknown source')
  const snippet = esc(stripHtml((a.article_snippet || a.snippet || '').slice(0, 300)))
  const link = a.article_url || a.url || '#'
  const cat = esc(a.content_category || 'general')
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e4e4e7">
      <div style="background:#B3261E;padding:16px 22px">
        <p style="margin:0;color:#fff;font-size:12px;font-weight:800;letter-spacing:.08em">🚨 HIGH-PROBABILITY CASE DETECTED</p>
      </div>
      <div style="padding:22px">
        <h1 style="margin:0 0 6px;font-size:19px;line-height:1.3;color:#18181b">${title}</h1>
        <p style="margin:0 0 14px;font-size:13px;color:#71717a">${source} · ${cat}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tr>
            <td style="padding:8px 10px;background:#fef2f2;border-radius:8px;text-align:center">
              <div style="font-size:22px;font-weight:800;color:#B3261E">${a.gbv_relevance ?? '—'}</div>
              <div style="font-size:10px;color:#71717a">GBV relevance</div>
            </td>
            <td style="width:8px"></td>
            <td style="padding:8px 10px;background:#fff7ed;border-radius:8px;text-align:center">
              <div style="font-size:22px;font-weight:800;color:#c2410c">${a.misogyny_score ?? '—'}</div>
              <div style="font-size:10px;color:#71717a">Misogyny</div>
            </td>
            <td style="width:8px"></td>
            <td style="padding:8px 10px;background:#f4f4f5;border-radius:8px;text-align:center">
              <div style="font-size:15px;font-weight:800;color:#3f3f46;padding-top:4px">${esc(a.sentiment || '—')}</div>
              <div style="font-size:10px;color:#71717a">Sentiment</div>
            </td>
          </tr>
        </table>
        ${snippet ? `<p style="margin:0 0 18px;font-size:13.5px;line-height:1.6;color:#3f3f46">${snippet}…</p>` : ''}
        <a href="${ADMIN_URL}" style="display:inline-block;background:#B3261E;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:10px">Log this case in Admin →</a>
        <p style="margin:14px 0 0;font-size:12px"><a href="${esc(link)}" style="color:#71717a">Read the source article</a></p>
      </div>
    </div>
    <p style="text-align:center;color:#a1a1aa;font-size:11px;margin:16px 0 0">FemSaidia Kenya · automated case alert</p>
  </div></body></html>`
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: ALERT_FROM, to: [ALERT_TO],
        subject: `🚨 New case (GBV ${a.gbv_relevance}/10): ${stripHtml(a.article_title || a.title || '').slice(0, 70)}`,
        html,
      }),
    })
    if (!res.ok) { console.error('Resend error:', res.status, await res.text()); return false }
    return true
  } catch (e: any) { console.error('sendCaseAlert error:', e.message); return false }
}

// Strip HTML tags and decode common entities
function stripHtml(str: string): string {
  return (str || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}


// ── FEEDS ─────────────────────────────────────────────────────────────────────
const FEEDS = [
  // Core Kenya femicide/GBV — Google News (most reliable)
  'https://news.google.com/rss/search?q=Kenya+femicide+women+killed&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+gender+based+violence+GBV&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+woman+killed+boyfriend+husband+2026&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+femicide+court+convicted+2026&hl=en-KE&gl=KE&ceid=KE:en',
  // Manosphere / Kibe pipeline
  'https://news.google.com/rss/search?q=Andrew+Kibe+Kenya&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=BBC+Manosphere+Messiahs+Kibe&hl=en&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=%2228+Commandments%22+Kibe+Kenya&hl=en-KE&gl=KE&ceid=KE:en',
  // Protests / community events
  'https://news.google.com/rss/search?q=Kenya+femicide+march+protest+2026&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Nairobi+femicide+march+women&hl=en-KE&gl=KE&ceid=KE:en',
  // Campus / university
  'https://news.google.com/rss/search?q=Kenya+university+student+killed+campus&hl=en-KE&gl=KE&ceid=KE:en',
  // Direct news sources
  'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
  // YouTube — BBC Eye (has Manosphere Messiahs content)
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCnUYZLuoy1rq1aVMwx4aTzw',
]

// ── KENYA FILTER — article must mention Kenya or a Kenyan location ─────────────
const KENYA_TERMS = [
  'kenya','nairobi','mombasa','kisumu','nakuru','kiambu','eldoret',
  'thika','malindi','nyeri','jooust','rvist','kibera','eastleigh',
  'karen','westlands','langata','kenyan','kenyans','kbc','nation',
]
const GBV_TERMS = [
  'femicide','murdered','killed','found dead','gender-based violence','gbv',
  'domestic violence','sexual assault','rape','acid attack','strangled',
  'beaten to death','intimate partner','missing woman','body found',
  'woman dead','woman killed','killed her','he killed','abused her',
  'andrew kibe','kibe','lambistic','28 commandments','manosphere',
  'femicide march','protest','rally','end femicide','campus murder',
  'alice rianga','diana cherono','faridah','missing girl',
]

function isKenyaGBV(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase()
  const hasKenya = KENYA_TERMS.some(t => text.includes(t))
  const hasGBV   = GBV_TERMS.some(t => text.includes(t))
  // BBC/YouTube: allow without Kenya tag (they have Kenya-specific content)
  const isBBC    = title.toLowerCase().includes('bbc') || snippet.toLowerCase().includes('bbc')
  return (hasKenya && hasGBV) || (isBBC && hasGBV)
}

// ── FETCH FEED ────────────────────────────────────────────────────────────────
async function fetchFeed(url: string): Promise<any[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)', 'Accept': 'application/rss+xml,application/xml' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) { console.log(`Feed ${url.slice(0,60)}: HTTP ${res.status}`); return [] }
    const text = await res.text()
    const items: any[] = []

    // Atom feeds (YouTube)
    if (text.includes('<feed') && text.includes('<entry>')) {
      const chanTitle = text.match(/<title>([^<]+)<\/title>/)?.[1] || new URL(url).hostname
      const entryRx = /<entry>([\s\S]*?)<\/entry>/g
      let m
      while ((m = entryRx.exec(text)) !== null) {
        const e = m[1]
        const t = e.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() || ''
        const lnk = e.match(/<link[^>]*href="([^"]+)"/)?.[1] || ''
        const snip = (e.match(/<media:description>([^<]*)<\/media:description>/)?.[1] || '').trim()
        if (t && lnk) items.push({ source: chanTitle, title: t, snippet: snip, url: lnk, pubDate: '', content_type: 'video' })
      }
    } else {
      // RSS feeds
      const itemRx = /<item>([\s\S]*?)<\/item>/g
      let m
      while ((m = itemRx.exec(text)) !== null) {
        const item = m[1]
        const tm = item.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/)
        const title = (tm?.[1] || tm?.[2] || '').trim()
        const dm = item.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description[^>]*>([\s\S]*?)<\/description>/)
        const desc = (dm?.[1] || dm?.[2] || '').trim()
        const linkRaw = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() || ''
        const linkClean = linkRaw.replace(/<[^>]+>/g, '').trim()
        // Extract real URL from Google News redirect
        const realUrl = linkClean.match(/url=([^&]+)/)?.[1]
        const link = realUrl ? decodeURIComponent(realUrl) : linkClean
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
        const source = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || new URL(url).hostname
        const snippet = desc.replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').trim()
        if (title) items.push({ source, title, snippet, url: link, pubDate })
      }
    }
    console.log(`Fetched ${items.length} from ${url.slice(0,55)}`)
    return items
  } catch(e: any) { console.error(`Feed error: ${e.message}`); return [] }
}

// ── TITLE-BASED DEDUP (reliable — URL encoding inconsistencies don't matter) ──
async function getExistingTitles(): Promise<Set<string>> {
  const since = new Date(Date.now() - 30*24*60*60*1000).toISOString()
  const { data } = await supabase
    .from('sentiment_articles')
    .select('article_title')
    .gte('scanned_at', since)
  const titles = new Set<string>()
  for (const row of data || []) {
    if (row.article_title) titles.add(row.article_title.slice(0,80).toLowerCase().trim())
  }
  return titles
}

// ── CLASSIFY WITH CLAUDE ──────────────────────────────────────────────────────
async function classifyArticles(articles: any[]): Promise<any[]> {
  if (!articles.length) return []
  const list = articles.map((a,i) => `${i+1}. SOURCE: ${a.source}\nTITLE: ${a.title}\nSNIPPET: ${(a.snippet||'').slice(0,200)}`).join('\n\n')

  const prompt = `You are a GBV researcher analysing Kenyan news. For each article return a JSON array.

Each object: "index"(1-based), "gbv_relevance"(0-10), "misogyny_score"(0-10), "sentiment"("alarming"|"negative"|"neutral"|"positive"), "tech_facilitated"(bool), "tech_platforms"(array), "content_category"("femicide"|"gbv"|"manosphere"|"protest"|"campus"|"policy"|"general"), "is_kibe_related"(bool), "is_protest"(bool).

IMPORTANT SCORING RULES:
1. Andrew Kibe / 28 Commandments / Lambistic / Manosphere Messiahs: misogyny_score 7-10 even without direct violence — this is the ideological pipeline to femicide. Set is_kibe_related=true for ANY article that: mentions Andrew Kibe by name, references "28 Commandments", references "Lambistic" or "Kibe's Den", or discusses the BBC Manosphere Messiahs documentary. This includes news articles REPORTING ON or CRITIQUING Kibe — not just content promoting him.
2. Protest / march / rally / vigil about femicide or GBV: is_protest=true, gbv_relevance 7-8.
3. Campus murders / university student femicide (JOOUST, RVIST, any Kenyan university): content_category="campus", gbv_relevance 8-10.
4. Court cases, convictions, acquittals for femicide: content_category="policy", gbv_relevance 7-9.

ARTICLES:
${list}

Return ONLY the JSON array.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json','x-api-key':ANTHROPIC_KEY,'anthropic-version':'2023-06-01' },
      body: JSON.stringify({ model:'claude-opus-4-6', max_tokens:2500, messages:[{role:'user',content:prompt}] })
    })
    const data = await res.json()
    const text = data.content?.[0]?.text || '[]'
    const scores = JSON.parse(text.replace(/```json|```/g,'').trim())
    return articles.map((a,i) => {
      const s = scores.find((x:any)=>x.index===i+1)||{}
      return { ...a, gbv_relevance:s.gbv_relevance??0, misogyny_score:s.misogyny_score??0,
        sentiment:s.sentiment??'neutral', tech_facilitated:s.tech_facilitated??false,
        tech_platforms:s.tech_platforms??[], content_category:s.content_category??'general',
        is_kibe_related:s.is_kibe_related??false, is_protest:s.is_protest??false }
    })
  } catch(e:any) {
    console.error('Claude error:', e.message)
    return articles.map(a=>({...a,gbv_relevance:5,misogyny_score:3,sentiment:'neutral',
      tech_facilitated:false,tech_platforms:[],content_category:'general',is_kibe_related:false,is_protest:false}))
  }
}

// ── UPDATE MISOGYNY INDEX ─────────────────────────────────────────────────────
async function updateMisogynyIndex() {
  const since7 = new Date(Date.now() - 7*24*60*60*1000).toISOString()
  const today  = new Date().toISOString().split('T')[0]
  const yest   = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0]
  const { data:all } = await supabase.from('sentiment_articles')
    .select('gbv_relevance,misogyny_score,sentiment,tech_facilitated,platform,content_type,content_category,is_kibe_related,is_protest')
    .gte('scanned_at', since7)
  if (!all?.length) return

  const news   = all.filter((a:any) => a.platform==='news'||a.content_type==='article'||a.content_type==='video')
  const social = all.filter((a:any) => a.platform==='x'||a.content_type==='social_post')
  const calc   = (arr:any[]) => {
    if (!arr.length) return 0
    const hm=arr.filter((a:any)=>a.misogyny_score>=7).length
    const tf=arr.filter((a:any)=>a.tech_facilitated).length
    const al=arr.filter((a:any)=>a.sentiment==='alarming'||a.sentiment==='negative').length
    const hg=arr.filter((a:any)=>a.gbv_relevance>=8).length
    return Math.min(100, Math.round((hm/arr.length)*40+(tf/arr.length)*20+(al/arr.length)*25+(hg/arr.length)*15))
  }
  const score=calc(all), news_score=calc(news), social_score=calc(social)
  const { data:yd } = await supabase.from('misogyny_index').select('score').eq('date',yest).single()
  const prev_score = yd?.score ?? score

  await supabase.from('misogyny_index').upsert({
    date:today, score, news_score, social_score, prev_score,
    article_count:all.length, news_count:news.length, social_count:social.length,
    high_alert:score>=60,
    manosphere_signals: all.filter((a:any)=>a.is_kibe_related||a.content_category==='manosphere').length,
    protest_signals:    all.filter((a:any)=>a.is_protest||a.content_category==='protest').length,
    campus_signals:     all.filter((a:any)=>a.content_category==='campus').length,
  }, { onConflict:'date' })
  console.log(`Misogyny index: ${score} (news:${news_score} social:${social_score})`)
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'GET') return new Response(JSON.stringify({status:'ok'}), {headers:{'Content-Type':'application/json'}})

  // ── Manual test path: POST {"test_alert": true} sends one sample case alert ──
  // Lets you verify the Resend pipeline end-to-end without waiting for a real case.
  try {
    const body = await req.clone().json().catch(() => ({}))
    if (body?.test_alert) {
      const sample = {
        article_title: 'TEST — Woman killed in Nairobi, partner in custody',
        source_name: 'Manual test trigger',
        article_snippet: 'This is a test of the FemSaidia case-alert email pipeline. Not a real case — you can ignore it.',
        article_url: 'https://femsaidiakenya.org',
        gbv_relevance: 9, misogyny_score: 8, sentiment: 'alarming', content_category: 'femicide',
      }
      const ok = await sendCaseAlert(sample)
      return new Response(JSON.stringify({
        test_alert: true, sent: ok, to: ALERT_TO,
        note: ok ? 'Sample case alert sent — check the inbox (and spam).'
                 : 'Send failed — confirm RESEND_API_KEY is set and the sending domain is verified in Resend.',
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
  } catch { /* not a test request — fall through to a normal scan */ }

  try {
    // 1. Fetch all feeds in parallel batches
    const allArticles: any[] = []
    const BATCH = 4
    for (let i = 0; i < FEEDS.length; i += BATCH) {
      const results = await Promise.all(FEEDS.slice(i, i+BATCH).map(f => fetchFeed(f)))
      results.forEach(items => allArticles.push(...items))
    }

    // 2. Deduplicate by URL
    const seen = new Set<string>()
    const unique = allArticles.filter(a => { if (!a.url||seen.has(a.url)) return false; seen.add(a.url); return true })

    // 3. Kenya + GBV filter (strict — must be relevant to Kenya AND GBV/manosphere)
    const relevant = unique.filter(a => isKenyaGBV(a.title, a.snippet||''))
    console.log(`Total: ${allArticles.length}, unique: ${unique.length}, Kenya+GBV: ${relevant.length}`)

    if (!relevant.length) return new Response(JSON.stringify({success:true,message:'No relevant content',total:allArticles.length}), {status:200})

    // 4. Dedup against DB by TITLE (reliable — no URL encoding issues)
    const existingTitles = await getExistingTitles()
    const newItems = relevant.filter(a => {
      const key = a.title.slice(0,80).toLowerCase().trim()
      return !existingTitles.has(key)
    })
    console.log(`New items after title dedup: ${newItems.length}`)

    if (!newItems.length) {
      await updateMisogynyIndex()
      return new Response(JSON.stringify({success:true,message:'All already stored',total:allArticles.length,relevant:relevant.length,new:0}), {status:200})
    }

    // 5. Classify with Claude in batches of 8
    const toClassify = newItems.slice(0, 24) // max 24 per run
    const classified: any[] = []
    for (let i = 0; i < toClassify.length; i += 8) {
      const batch = await classifyArticles(toClassify.slice(i, i+8))
      classified.push(...batch)
      if (i + 8 < toClassify.length) await new Promise(r => setTimeout(r, 400))
    }

    // 6. Insert qualifying articles
    const toInsert = classified
      .filter(a => a.gbv_relevance >= 4 || a.is_kibe_related || a.is_protest)
      .map(a => ({
        source_name:a.source, channel_name:a.source, source_url:a.url, article_url:a.url,
        article_title:stripHtml(a.title), article_snippet:stripHtml((a.snippet||'').slice(0,500)),
        content_type:a.content_type||'article', thumbnail_url:null,
        published_at:a.pubDate?new Date(a.pubDate).toISOString():null,
        gbv_relevance:a.gbv_relevance, misogyny_score:a.misogyny_score,
        sentiment:a.sentiment, tech_facilitated:a.tech_facilitated,
        tech_platforms:a.tech_platforms, tech_details:'',
        platform:a.url?.includes('youtube')?'youtube':'news',
        summary:'', published:true, verified:false,
        content_category:a.content_category||'general',
        is_kibe_related:a.is_kibe_related||false,
        is_protest:a.is_protest||false,
        scanned_at:new Date().toISOString(),
      }))

    let alertsSent = 0
    if (toInsert.length) {
      const { error } = await supabase.from('sentiment_articles').insert(toInsert)
      if (error) console.error('Insert error:', error.message)
      else {
        console.log(`Inserted ${toInsert.length} articles`)
        // Fire a case alert for every newly-inserted high-probability case
        const highCases = toInsert.filter(a => (a.gbv_relevance ?? 0) >= ALERT_THRESHOLD)
        for (const a of highCases) { if (await sendCaseAlert(a)) alertsSent++ }
        if (highCases.length) console.log(`Case alerts: ${alertsSent}/${highCases.length} sent`)
      }
    }

    await updateMisogynyIndex()

    return new Response(JSON.stringify({
      success:true, total:allArticles.length, unique:unique.length,
      kenya_gbv:relevant.length, new:newItems.length, classified:classified.length,
      inserted:toInsert.length, case_alerts_sent:alertsSent,
      kibe_hits:toInsert.filter(a=>a.is_kibe_related).length,
      protest_hits:toInsert.filter(a=>a.is_protest).length,
    }), {status:200, headers:{'Content-Type':'application/json'}})

  } catch(e:any) {
    console.error('Scanner error:', e.message)
    return new Response(JSON.stringify({error:e.message}), {status:500})
  }
})

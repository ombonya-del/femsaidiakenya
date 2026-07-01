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
  // Curated manosphere / red-pill creators — the street-level "Community" register.
  // (Diversifies beyond Kibe; each item is still AI-scored, so off-topic uploads score low.)
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCYQfNWgM1W_-9WpoeCFLt-A', // Jacob Aliet — "Unplugged" male-supremacy author/coach
  'https://anchor.fm/s/b56da78/podcast/rss',                                       // GUY CODE Kenya — red-pill podcast
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCuZTHA5RaqiVrnCYmOOv0sQ', // BTP Studios Kenya — "Financial Red Pill" series
  'https://anchor.fm/s/34b75ed8/podcast/rss',                                      // Red Pill Podcast (KE)
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC3mEX7L5GcOnX7LVYYlHlaw', // Dialogues With Jagero — platforms Jacob Aliet / red-pill content
  // Manosphere creators — news coverage / cross-platform mentions (feeds the Media register:
  // profiles, interviews, backlash, op-eds about these figures wherever news indexes them).
  'https://news.google.com/rss/search?q=%22Jacob+Aliet%22+Kenya&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Amerix+OR+%22Eric+Amunga%22+masculinity&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+manosphere+red+pill+misogyny&hl=en-KE&gl=KE&ceid=KE:en',
]

// Curated sources whose content is the manosphere/red-pill register. Their items
// bypass the Kenya-keyword gate (titles rarely say "Kenya") but must still match the
// red-pill lexicon below — keeps off-topic uploads (faith, money, sports) out — and
// every passing item is still AI-classified before it counts.
const MANOSPHERE_SOURCES = ['unplugged','jacob aliet','guy code','btp','red pill','jagero']
const REDPILL_TERMS = [
  'red pill','redpill','high value','high-value','wife material','alpha','beta',
  'hypergamy','feminism','feminist','submission','submissive','masculine','masculinity',
  'provider','body count','single mother','simp','divorce','women','woman','female',
  'girlfriend','wife','dating','relationship','marriage','smv','sexual market','manosphere',
]
const isManoSource = (src: string) => MANOSPHERE_SOURCES.some(s => (src||'').toLowerCase().includes(s))

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
  // Manosphere creators / red-pill register (for news coverage about these figures)
  'amerix','eric amunga','jacob aliet','red pill','red-pill','high value man',
  'masculinity coach','masculinity saturday','hypergamy','toxic masculinity',
]

function isKenyaGBV(title: string, snippet: string, source = ''): boolean {
  const text = `${title} ${snippet}`.toLowerCase()
  const hasKenya = KENYA_TERMS.some(t => text.includes(t))
  const hasGBV   = GBV_TERMS.some(t => text.includes(t))
  // BBC/YouTube: allow without Kenya tag (they have Kenya-specific content)
  const isBBC    = title.toLowerCase().includes('bbc') || snippet.toLowerCase().includes('bbc')
  // Curated manosphere sources: bypass the Kenya gate but require a red-pill term
  // (filters out their off-topic uploads); AI classification still has final say.
  const manosphere = isManoSource(source) && REDPILL_TERMS.some(t => text.includes(t))
  return (hasKenya && hasGBV) || (isBBC && hasGBV) || manosphere
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
      // RSS feeds — capture the channel-level title so podcast items carry the show
      // name as their source (needed for the curated-manosphere bypass).
      const chRaw = text.match(/<channel>[\s\S]*?<title[^>]*>([\s\S]*?)<\/title>/)?.[1] || ''
      const chanTitle = chRaw.replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,'').trim() || new URL(url).hostname
      // Podcast feeds (Anchor / iTunes namespace) → tag as 'podcast' so items land in
      // the street-level Community register, not the Media (article) register.
      const isPodcast = url.includes('anchor.fm') || /<itunes:/.test(text)
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
        const source = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || chanTitle
        const snippet = desc.replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').trim()
        if (title) items.push({ source, title, snippet, url: link, pubDate, content_type: isPodcast ? 'podcast' : 'article' })
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
1. Andrew Kibe / 28 Commandments / Lambistic / Manosphere Messiahs: set is_kibe_related=true and misogyny_score 7-10 ONLY when the article is genuinely about his misogynistic rhetoric, the red-pill/manosphere ideology, his treatment of or statements about women, or critiques of that pipeline (including the BBC Manosphere Messiahs documentary). This is the ideological pipeline to femicide. Do NOT flag or inflate the score for incidental/off-topic articles that merely mention his name — e.g. his personal finances, house, car, career moves, lifestyle, health, relationships or general celebrity gossip. Those are general news: is_kibe_related=false and score them on their actual content (typically misogyny_score 0-3, gbv_relevance 0-2).
2. Protest / march / rally / vigil about femicide or GBV: is_protest=true, gbv_relevance 7-8.
3. Campus murders / university student femicide (JOOUST, RVIST, any Kenyan university): content_category="campus", gbv_relevance 8-10.
4. Court cases, convictions, acquittals for femicide: content_category="policy", gbv_relevance 7-9.
5. Manosphere / red-pill creators (e.g. Jacob Aliet / "Unplugged", Guy Code, Red Pill Podcast, BTP, Amerix, and similar "high-value man", hypergamy, female-nature, "wife material", anti-feminism content): set content_category="manosphere" and set misogyny_score by how dehumanising or contemptuous toward women the content is — red-pill framing of women as deceitful, hypergamous, or disposable is typically 6-9. These are usually ideological rather than incident reports, so gbv_relevance may be modest; that is fine. Off-topic uploads from these same sources (faith, money, sport, lifestyle with no gender angle) → content_category="general" and low scores.

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

  // Advocacy & protest are the RESPONSE, not the harm — excluded from the index entirely.
  const ADV = /femicidecount|njeriwamigwi|vocalafrica|usikimye|nanjala|femsaidia|wanjikurevolt|akilidada|amnesty|kenyahuman|endfemicide|treasonousbabe|c_nyakundi|fida|zamara|womenco/i
  const isAdvocacy = (a:any) => a.is_protest || a.content_category==='protest' || ADV.test(a.source_name||'')
  const relevant = all.filter((a:any) => !isAdvocacy(a))
  // 🔥 COMMUNITY — street-level, lived, conversational intelligence: the day-to-day
  //    manifestation. Manosphere/Kibe discourse, known misogynists, social posts, and
  //    video / podcast / TikTok / YouTube commentary.
  const social = relevant.filter((a:any) => a.is_kibe_related || a.content_category==='manosphere'
    || a.platform==='x' || a.platform==='tiktok' || a.platform==='youtube'
    || a.content_type==='social_post' || a.content_type==='video' || a.content_type==='podcast')
  // 📰 MEDIA — scholarly / analytical / formal-press intelligence: news articles, court
  //    rulings, policy and reported femicide/GBV coverage.
  const news   = relevant.filter((a:any) => !social.includes(a))
  const calc   = (arr:any[]) => {
    if (!arr.length) return 0
    const n=arr.length
    const hm=arr.filter((a:any)=>a.misogyny_score>=7).length
    const tf=arr.filter((a:any)=>a.tech_facilitated).length
    const al=arr.filter((a:any)=>a.sentiment==='alarming'||a.sentiment==='negative').length
    const hg=arr.filter((a:any)=>a.gbv_relevance>=8).length
    // 1) proportion / intensity of the discourse (0-100)
    const prop = ((hm/n)*0.40 + (tf/n)*0.15 + (al/n)*0.25 + (hg/n)*0.20) * 100
    // 2) average misogyny magnitude (0-10 → 0-100): severity, not just a threshold count
    const mag  = (arr.reduce((s:number,a:any)=>s+(a.misogyny_score||0),0)/n/10) * 100
    // 3) absolute severe-volume / persistence: ~12 severe pieces in the window = full,
    //    so a flood of mild general articles can't dilute a sustained problem away
    const vol  = Math.min(1, hm/12) * 100
    return Math.min(100, Math.round(prop*0.5 + mag*0.2 + vol*0.3))
  }
  const score=calc(relevant), news_score=calc(news), social_score=calc(social)
  const { data:yd } = await supabase.from('misogyny_index').select('score').eq('date',yest).single()
  const prev_score = yd?.score ?? score

  await supabase.from('misogyny_index').upsert({
    date:today, score, news_score, social_score, prev_score,
    article_count:relevant.length, news_count:news.length, social_count:social.length,
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
    const relevant = unique.filter(a => isKenyaGBV(a.title, a.snippet||'', a.source||''))
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
    // Prioritise curated manosphere items so a news flood can't starve the Community lane.
    const toClassify = newItems
      .slice()
      .sort((a,b) => (isManoSource(b.source||'') ? 1 : 0) - (isManoSource(a.source||'') ? 1 : 0))
      .slice(0, 24) // max 24 per run
    const classified: any[] = []
    for (let i = 0; i < toClassify.length; i += 8) {
      const batch = await classifyArticles(toClassify.slice(i, i+8))
      classified.push(...batch)
      if (i + 8 < toClassify.length) await new Promise(r => setTimeout(r, 400))
    }

    // 6. Insert qualifying articles
    const toInsert = classified
      .filter(a => a.gbv_relevance >= 4 || a.misogyny_score >= 5 || a.is_kibe_related || a.is_protest || a.content_category === 'manosphere')
      .map(a => ({
        source_name:a.source, channel_name:a.source, source_url:a.url, article_url:a.url,
        article_title:stripHtml(a.title), article_snippet:stripHtml((a.snippet||'').slice(0,500)),
        content_type:a.content_type||'article', thumbnail_url:null,
        published_at:a.pubDate?new Date(a.pubDate).toISOString():null,
        gbv_relevance:a.gbv_relevance, misogyny_score:a.misogyny_score,
        sentiment:a.sentiment, tech_facilitated:a.tech_facilitated,
        tech_platforms:a.tech_platforms, tech_details:'',
        platform: a.content_type==='podcast' ? 'podcast' : (a.url?.includes('youtube') ? 'youtube' : 'news'),
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

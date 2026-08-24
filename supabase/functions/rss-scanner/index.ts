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
// Only EMAIL a case alert when the article is genuinely recent by its own publish
// date. Old cases that resurface in the feeds are still stored — just not emailed.
// Undated items are stored but never alerted. Widen/narrow this window as needed.
const ALERT_MAX_AGE_DAYS = 60

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

// ── Classifier-down alert (Resend) ───────────────────────────────────────────
// Fires when the AI classifier fails (e.g. Anthropic credits exhausted). Paired
// with skip-on-failure, a scoring outage is caught in hours, not days.
async function sendClassifierAlert(count: number, err: string): Promise<boolean> {
  if (!RESEND_API_KEY) { console.log('Classifier alert skipped — RESEND_API_KEY not set'); return false }
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e4e4e7">
      <div style="background:#B3261E;padding:16px 22px">
        <p style="margin:0;color:#fff;font-size:12px;font-weight:800;letter-spacing:.08em">SCANNER CLASSIFIER DOWN</p>
      </div>
      <div style="padding:22px">
        <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#18181b">The scanner could not score <b>${count}</b> new item(s) this run, so it <b>skipped inserting them</b> (no default-scored junk added). The misogyny index will drift until this is fixed.</p>
        <p style="margin:0 0 6px;font-size:12px;color:#71717a">Error from the AI classifier:</p>
        <pre style="margin:0 0 16px;padding:12px;background:#fef2f2;border-radius:8px;font-size:12px;color:#B3261E;white-space:pre-wrap">${esc(err)}</pre>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#3f3f46">If this is a credit balance error, top up at <b>console.anthropic.com &rarr; Plans &amp; Billing</b>, then re-run the scanner.</p>
      </div>
    </div>
    <p style="text-align:center;color:#a1a1aa;font-size:11px;margin:16px 0 0">FemSaidia Kenya &middot; automated scanner alert</p>
  </div></body></html>`
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: ALERT_FROM, to: [ALERT_TO], subject: `FemSaidia scanner: classifier down (${count} items skipped)`, html }),
    })
    if (!res.ok) { console.error('Classifier alert send error:', res.status, await res.text()); return false }
    return true
  } catch (e: any) { console.error('sendClassifierAlert error:', e.message); return false }
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
  // ── Core Kenya femicide / GBV (the mission) ──
  'https://news.google.com/rss/search?q=Kenya+femicide+women+killed&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+gender+based+violence+GBV&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+woman+killed+partner+husband&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+femicide+court+convicted+sentenced&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+university+student+killed+campus&hl=en-KE&gl=KE&ceid=KE:en',
  // ── SRHR — sexual & reproductive health and rights ──
  'https://news.google.com/rss/search?q=Kenya+reproductive+health+rights+women&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+teenage+pregnancy+contraception+abortion+access&hl=en-KE&gl=KE&ceid=KE:en',
  // ── Harmful cultural / patriarchal practices ──
  'https://news.google.com/rss/search?q=Kenya+FGM+child+marriage+girls&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+patriarchy+gender+roles+women+rights&hl=en-KE&gl=KE&ceid=KE:en',
  // ── Gendered disinformation / online abuse ──
  'https://news.google.com/rss/search?q=Kenya+women+online+harassment+abuse+trolling&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+women+journalists+politicians+online+disinformation&hl=en-KE&gl=KE&ceid=KE:en',
  // ── Policy, law & advocacy wins ──
  'https://news.google.com/rss/search?q=Kenya+sexual+offences+act+GBV+policy+protection&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+women+rights+activists+justice+femicide&hl=en-KE&gl=KE&ceid=KE:en',
  // ── Regional pulse (African feminist / GBV) ──
  'https://news.google.com/rss/search?q=Africa+femicide+gender+violence+women+rights&hl=en&gl=KE&ceid=KE:en',
  // ── Direct outlet ──
  'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
  // ── Manosphere / red-pill PIPELINE — this is the misogyny SIGNAL that drives the
  //    index's Community register. Diverse creators (NOT Kibe celebrity gossip); the
  //    de-dupe + AI scoring keep repetition and off-topic uploads out. ──
  'https://news.google.com/rss/search?q=Kenya+manosphere+red+pill+misogyny&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=BBC+Manosphere+Messiahs+Kenya&hl=en&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Amerix+OR+%22Eric+Amunga%22+masculinity&hl=en-KE&gl=KE&ceid=KE:en',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCYQfNWgM1W_-9WpoeCFLt-A', // Jacob Aliet — "Unplugged"
  'https://anchor.fm/s/b56da78/podcast/rss',                                       // GUY CODE Kenya — red-pill podcast
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCuZTHA5RaqiVrnCYmOOv0sQ', // BTP Studios — "Financial Red Pill"
  'https://anchor.fm/s/34b75ed8/podcast/rss',                                      // Red Pill Podcast (KE)
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC3mEX7L5GcOnX7LVYYlHlaw', // Dialogues With Jagero — red-pill
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
  // Femicide / violence
  'femicide','murdered','killed','found dead','gender-based violence','gbv',
  'domestic violence','sexual assault','rape','defilement','acid attack','strangled',
  'beaten to death','intimate partner','missing woman','body found',
  'woman dead','woman killed','killed her','he killed','abused her','missing girl',
  'sexual harassment','harassment','gender violence','violence against women',
  // SRHR — sexual & reproductive health and rights
  'reproductive','sexual health','contraception','family planning','abortion',
  'teenage pregnancy','teen pregnancy','maternal','safe motherhood','menstrual',
  // Harmful cultural / patriarchal practices
  'fgm','female genital mutilation','child marriage','early marriage','wife inheritance',
  'patriarchy','patriarchal','gender roles','gender equality','women rights',"women's rights",
  'girls rights',"girls' rights",'widow',
  // Gendered disinformation / online abuse
  'online harassment','online abuse','cyberbullying','trolling','doxxing','doxing',
  'disinformation','image-based abuse','revenge porn','online gender','tech-facilitated',
  // Policy / law / advocacy
  'sexual offences act','protection order','gbv policy','women activists','end femicide',
  'femicide march','protest','rally','vigil','campus murder',
  // Manosphere / red-pill IDEOLOGY (not celebrity gossip — the pipeline register)
  'manosphere','red pill','red-pill','high value man','masculinity coach',
  'hypergamy','toxic masculinity','anti-feminist','wife material','body count',
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
        const pub = e.match(/<published>([^<]+)<\/published>/)?.[1] || e.match(/<updated>([^<]+)<\/updated>/)?.[1] || ''
        if (t && lnk) items.push({ source: chanTitle, title: t, snippet: snip, url: lnk, pubDate: pub, content_type: 'video' })
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

// ── RECENCY + TITLE NORMALISATION ─────────────────────────────────────────────
// Currency guard: skip items older than this when the feed gives a usable date.
// Undated items (some YouTube/podcast entries) are kept — we can't age them out.
const MAX_AGE_DAYS = 180  // ~6 months. Lower to 90 for a stricter 3-month window.

function withinMaxAge(pubDate: string): boolean {
  if (!pubDate) return true            // no/unknown date → keep (can't age it out)
  const t = Date.parse(pubDate)
  if (Number.isNaN(t)) return true     // unparseable date → keep
  return (Date.now() - t) <= MAX_AGE_DAYS * 24 * 60 * 60 * 1000
}

// Should this stored case trigger an EMAIL? Only if it's recent by publish date.
// Undated / unparseable → false (store, don't email) so resurfaced old cases go quiet.
function alertFresh(publishedAt: string | null): boolean {
  if (!publishedAt) return false
  const t = Date.parse(publishedAt)
  if (Number.isNaN(t)) return false
  return (Date.now() - t) <= ALERT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
}

// Normalise a title for dedup: strip Google News' trailing " - Publisher" suffix,
// collapse whitespace, lowercase, cap length. Catches the same story arriving from
// multiple feeds with slightly different source suffixes.
function normTitle(title: string): string {
  return (title || '')
    .replace(/\s+[-–—|]\s+[^-–—|]{2,40}$/, '')  // drop trailing " - Publisher"
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, 80)
}

// Normalise a URL for dedup: drop protocol / www / hash / trailing slash but KEEP
// the query (YouTube's ?v=ID lives there). Catches the same article resurfacing
// under a re-headlined Google News title — the underlying link stays stable.
function normUrl(u: string): string {
  return (u || '').trim().toLowerCase()
    .replace(/^https?:\/\//, '').replace(/^www\./, '')
    .replace(/#.*$/, '').replace(/\/+$/, '')
}

// Collapse alert candidates to one per normalised title, so two re-headlined
// variants that slipped into the same insert batch still email only once.
function eligibleTitleDedup(rows: any[]): any[] {
  const seen = new Set<string>(), out: any[] = []
  for (const r of rows) {
    const k = normTitle(r.article_title || r.title || '')
    if (k && seen.has(k)) continue
    if (k) seen.add(k)
    out.push(r)
  }
  return out
}

// ── DEDUP (accurate, archive-size-proof) ──────────────────────────────────────
// A plain select caps at 1000 rows, so once the archive grew past that the old
// check went blind to everything older — the cause of repeat / stale alerts.
// Instead we look up ONLY the candidate URLs/titles (a small, bounded set), so the
// existence check is always complete no matter how large the archive is.
// URL is the reliable key when Google News re-headlines the same story; title is
// the fallback for feeds whose URLs vary.
const chunk = <X,>(arr: X[], n: number): X[][] => {
  const out: X[][] = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}
async function findExisting(items: any[]): Promise<{ titles: Set<string>, urls: Set<string> }> {
  const urls   = [...new Set(items.map(a => a.url).filter(Boolean))]
  const titles = [...new Set(items.map(a => stripHtml(a.title)).filter(Boolean))]
  const existingUrls = new Set<string>(), existingTitles = new Set<string>()
  for (const c of chunk(urls, 80)) {
    const { data } = await supabase.from('sentiment_articles').select('article_url').in('article_url', c)
    for (const r of data || []) if (r.article_url) existingUrls.add(normUrl(r.article_url))
  }
  for (const c of chunk(titles, 80)) {
    const { data } = await supabase.from('sentiment_articles').select('article_title').in('article_title', c)
    for (const r of data || []) if (r.article_title) existingTitles.add(normTitle(r.article_title))
  }
  // Recent-window backfill: the exact .in() lookups above miss a story that
  // arrives re-headlined (Google News rotates a trailing " - Publisher" suffix),
  // so it was re-inserted AND re-emailed every run. Pull a bounded recent window
  // and add its NORMALISED title/url keys, so normTitle/normUrl collapse those
  // variants to one key and the story is recognised as already stored.
  const since = new Date(Date.now() - (ALERT_MAX_AGE_DAYS + 15) * 24 * 60 * 60 * 1000).toISOString()
  const { data: recent } = await supabase.from('sentiment_articles')
    .select('article_title,article_url')
    .gte('scanned_at', since)
    .order('scanned_at', { ascending: false })
    .limit(3000)
  for (const r of recent || []) {
    if (r.article_title) existingTitles.add(normTitle(r.article_title))
    if (r.article_url)   existingUrls.add(normUrl(r.article_url))
  }
  return { titles: existingTitles, urls: existingUrls }
}

// ── CLASSIFY WITH CLAUDE ──────────────────────────────────────────────────────
async function classifyArticles(articles: any[]): Promise<any[]> {
  if (!articles.length) return []
  const list = articles.map((a,i) => `${i+1}. SOURCE: ${a.source}\nTITLE: ${a.title}\nSNIPPET: ${(a.snippet||'').slice(0,200)}`).join('\n\n')

  const prompt = `You are a GBV researcher analysing Kenyan news. For each article return a JSON array.

Each object: "index"(1-based), "gbv_relevance"(0-10), "misogyny_score"(0-10), "sentiment"("alarming"|"negative"|"neutral"|"positive"), "tech_facilitated"(bool), "tech_platforms"(array), "content_category"("femicide"|"gbv"|"manosphere"|"protest"|"campus"|"policy"|"srhr"|"disinformation"|"culture"|"general"), "is_kibe_related"(bool), "is_protest"(bool).

IMPORTANT SCORING RULES:
1. Andrew Kibe / 28 Commandments / Lambistic / Manosphere Messiahs: set is_kibe_related=true and misogyny_score 7-10 ONLY when the article is genuinely about his misogynistic rhetoric, the red-pill/manosphere ideology, his treatment of or statements about women, or critiques of that pipeline (including the BBC Manosphere Messiahs documentary). This is the ideological pipeline to femicide. Do NOT flag or inflate the score for incidental/off-topic articles that merely mention his name — e.g. his personal finances, house, car, career moves, lifestyle, health, relationships or general celebrity gossip. Those are general news: is_kibe_related=false and score them on their actual content (typically misogyny_score 0-3, gbv_relevance 0-2).
2. Protest / march / rally / vigil about femicide or GBV: is_protest=true, gbv_relevance 7-8.
3. Campus murders / university student femicide (JOOUST, RVIST, any Kenyan university): content_category="campus", gbv_relevance 8-10.
4. Court cases, convictions, acquittals for femicide: content_category="policy", gbv_relevance 7-9.
5. Manosphere / red-pill creators (e.g. Jacob Aliet / "Unplugged", Guy Code, Red Pill Podcast, BTP, Amerix, and similar "high-value man", hypergamy, female-nature, "wife material", anti-feminism content): set content_category="manosphere" and set misogyny_score by how dehumanising or contemptuous toward women the content is — red-pill framing of women as deceitful, hypergamous, or disposable is typically 6-9. These are usually ideological rather than incident reports, so gbv_relevance may be modest; that is fine. Off-topic uploads from these same sources (faith, money, sport, lifestyle with no gender angle) → content_category="general" and low scores.
6. SRHR (reproductive health/rights, contraception, abortion access, teen pregnancy, maternal health): content_category="srhr", gbv_relevance 4-7 by how much it concerns women's bodily autonomy or access.
7. Gendered disinformation / online abuse (trolling, doxxing, image-based abuse, coordinated harassment of women journalists/politicians/activists): content_category="disinformation", tech_facilitated=true, misogyny_score 5-8 by hostility.
8. Harmful cultural / patriarchal practices (FGM, child/early marriage, wife inheritance, widow abuse) and patriarchy/gender-role commentary: content_category="culture", gbv_relevance 5-8 for the harmful-practice reports; opinion/commentary about patriarchy scores by its actual stance. Positive advocacy wins are still logged but sentiment="positive" and low misogyny.

ARTICLES:
${list}

Return ONLY the JSON array.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json','x-api-key':ANTHROPIC_KEY,'anthropic-version':'2023-06-01' },
      body: JSON.stringify({ model:'claude-opus-4-8', max_tokens:2500, messages:[{role:'user',content:prompt}] }),
      // Time-box the model call so a slow/hung batch can't freeze the whole scan
      // (the caller aborts at 55s; keep each batch well under that).
      signal: AbortSignal.timeout(40000),
    })
    const data = await res.json()
    // If the model call errored (bad model, rate limit, quota), there is no
    // `content`. Throw so we hit the catch below and fall back to PASSING default
    // scores — otherwise every item silently scores 0 and gets filtered out,
    // freezing the pipeline (the exact "stale for days" failure).
    if (!res.ok || !data.content) throw new Error(data?.error?.message || `Anthropic HTTP ${res.status}`)
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
    // SAFEGUARD: do NOT fabricate passing fallback scores. Silently scoring everything
    // "misogyny 3 / general" pollutes the feed and floors the index (the exact failure
    // that hid a ~6-day credit outage). Tag the batch as failed so the caller skips it.
    return articles.map(a=>({...a, _classifyFailed:true, _classifyError:e.message,
      gbv_relevance:0, misogyny_score:0, sentiment:'neutral',
      tech_facilitated:false, tech_platforms:[], content_category:'general',
      is_kibe_related:false, is_protest:false}))
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

    // 2b. Currency filter — drop dated items older than MAX_AGE_DAYS (undated kept)
    const fresh = unique.filter(a => withinMaxAge(a.pubDate || ''))

    // 3. Kenya + GBV filter (strict — must be relevant to Kenya AND GBV/manosphere)
    const relevant = fresh.filter(a => isKenyaGBV(a.title, a.snippet||'', a.source||''))
    console.log(`Total: ${allArticles.length}, unique: ${unique.length}, fresh: ${fresh.length}, Kenya+GBV: ${relevant.length}`)

    if (!relevant.length) return new Response(JSON.stringify({success:true,message:'No relevant content',total:allArticles.length}), {status:200})

    // 4. Dedup against DB by TITLE (reliable — no URL encoding issues)
    const { titles: existingTitles, urls: existingUrls } = await findExisting(relevant)
    const seenTitles = new Set<string>(), seenUrls = new Set<string>()
    let dupesSkipped = 0
    const newItems = relevant.filter(a => {
      const tkey = normTitle(a.title), ukey = normUrl(a.url || '')
      // Skip if the title OR the underlying URL matches anything in the DB window
      // or already seen this run. URL match catches re-headlined repeats.
      if (existingTitles.has(tkey) || seenTitles.has(tkey) ||
          (ukey && (existingUrls.has(ukey) || seenUrls.has(ukey)))) { dupesSkipped++; return false }
      seenTitles.add(tkey); if (ukey) seenUrls.add(ukey)
      return true
    })
    console.log(`New items after title dedup: ${newItems.length}`)

    if (!newItems.length) {
      await updateMisogynyIndex()
      return new Response(JSON.stringify({success:true,message:'All already stored',total:allArticles.length,fresh:fresh.length,relevant:relevant.length,dupes_skipped:dupesSkipped,new:0}), {status:200})
    }

    // 5. Classify with Claude in batches of 8
    // Prioritise curated manosphere items so a news flood can't starve the Community lane.
    const toClassify = newItems
      .slice()
      .sort((a,b) => (isManoSource(b.source||'') ? 1 : 0) - (isManoSource(a.source||'') ? 1 : 0))
      .slice(0, 24) // max 24 per run
    // Classify batches CONCURRENTLY (each is time-boxed above) so total wall time
    // stays well under the caller's timeout even when the model is slow — a hung
    // batch now fails fast and is skipped, instead of freezing the whole scan.
    const batches: any[][] = []
    for (let i = 0; i < toClassify.length; i += 8) batches.push(toClassify.slice(i, i+8))
    const classified: any[] = (await Promise.all(batches.map(b => classifyArticles(b)))).flat()

    // 6a. SAFEGUARD: if the AI classifier failed for a batch (e.g. Anthropic credits
    //     out), skip those items entirely — never insert default-scored junk — and
    //     raise an alert so the outage is caught in hours, not days.
    const classifyFailures = classified.filter(a => a._classifyFailed)
    if (classifyFailures.length) {
      console.error(`CLASSIFIER DOWN — skipped ${classifyFailures.length} unscored items. Error: ${classifyFailures[0]._classifyError}`)
      await sendClassifierAlert(classifyFailures.length, classifyFailures[0]._classifyError || 'unknown')
    }

    // 6b. Insert qualifying, successfully-classified articles.
    //    Protests/marches/vigils are excluded — they're the response, not the harm,
    //    and were repetitive/redundant in the feed.
    const toInsert = classified
      .filter(a => !a._classifyFailed)
      .filter(a => !(a.is_protest || a.content_category === 'protest'))
      .filter(a => a.gbv_relevance >= 4 || a.misogyny_score >= 5 || a.is_kibe_related || a.content_category === 'manosphere')
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

    let alertsSent = 0, alertsSuppressedStale = 0
    if (toInsert.length) {
      const { error } = await supabase.from('sentiment_articles').insert(toInsert)
      if (error) console.error('Insert error:', error.message)
      else {
        console.log(`Inserted ${toInsert.length} articles`)
        // Email a case alert only for high-probability cases that are genuinely recent
        // by publish date. Old resurfaced cases are stored above but not emailed.
        const eligible  = eligibleTitleDedup(toInsert.filter(a => (a.gbv_relevance ?? 0) >= ALERT_THRESHOLD))
        const highCases = eligible.filter(a => alertFresh(a.published_at))
        alertsSuppressedStale = eligible.length - highCases.length
        // Backstop: never send more than a handful of alerts in one run, so a
        // dedup miss or feed flood can't turn into an inbox flood.
        const MAX_ALERTS_PER_RUN = 6
        const toAlert = highCases.slice(0, MAX_ALERTS_PER_RUN)
        for (const a of toAlert) { if (await sendCaseAlert(a)) alertsSent++ }
        if (highCases.length > MAX_ALERTS_PER_RUN)
          console.warn(`Case alerts capped: ${highCases.length} eligible, sent ${MAX_ALERTS_PER_RUN}`)
        if (eligible.length) console.log(`Case alerts: ${alertsSent}/${Math.min(highCases.length,MAX_ALERTS_PER_RUN)} sent, ${alertsSuppressedStale} suppressed (stale/undated)`)
      }
    }

    await updateMisogynyIndex()

    return new Response(JSON.stringify({
      success:true, total:allArticles.length, unique:unique.length,
      fresh:fresh.length, stale_skipped:unique.length-fresh.length,
      kenya_gbv:relevant.length, dupes_skipped:dupesSkipped,
      new:newItems.length, classified:classified.length,
      classifier_failed:classifyFailures.length,
      inserted:toInsert.length, case_alerts_sent:alertsSent,
      alerts_suppressed_stale:alertsSuppressedStale,
      kibe_hits:toInsert.filter(a=>a.is_kibe_related).length,
      protest_hits:toInsert.filter(a=>a.is_protest).length,
    }), {status:200, headers:{'Content-Type':'application/json'}})

  } catch(e:any) {
    console.error('Scanner error:', e.message)
    return new Response(JSON.stringify({error:e.message}), {status:500})
  }
})

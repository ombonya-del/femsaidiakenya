import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_KEY    = Deno.env.get('ANTHROPIC_API_KEY') || ''
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase         = createClient(SUPABASE_URL, SUPABASE_SERVICE)

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

    if (toInsert.length) {
      const { error } = await supabase.from('sentiment_articles').insert(toInsert)
      if (error) console.error('Insert error:', error.message)
      else console.log(`Inserted ${toInsert.length} articles`)
    }

    await updateMisogynyIndex()

    return new Response(JSON.stringify({
      success:true, total:allArticles.length, unique:unique.length,
      kenya_gbv:relevant.length, new:newItems.length, classified:classified.length,
      inserted:toInsert.length,
      kibe_hits:toInsert.filter(a=>a.is_kibe_related).length,
      protest_hits:toInsert.filter(a=>a.is_protest).length,
    }), {status:200, headers:{'Content-Type':'application/json'}})

  } catch(e:any) {
    console.error('Scanner error:', e.message)
    return new Response(JSON.stringify({error:e.message}), {status:500})
  }
})

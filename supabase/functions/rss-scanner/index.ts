import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_KEY    = Deno.env.get('ANTHROPIC_API_KEY') || ''
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase         = createClient(SUPABASE_URL, SUPABASE_SERVICE)

const FEEDS = [
  // ── EXISTING: Google News targeted searches ───────────────────────────────
  'https://news.google.com/rss/search?q=Kenya+femicide+women+killed&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+gender+based+violence+GBV+2026&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+woman+killed+boyfriend+husband+2026&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+femicide+court+convicted+sentenced+2026&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=manosphere+misogyny+incel+Kenya+2026&hl=en&gl=KE&ceid=KE:en',
  // ── NEW: Kibe / manosphere / BBC documentary ──────────────────────────────
  'https://news.google.com/rss/search?q=Andrew+Kibe+Kenya+women+manosphere&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=BBC+Manosphere+Messiahs+Kenya+Kibe&hl=en&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=%2228+Commandments%22+Kenya+Kibe&hl=en-KE&gl=KE&ceid=KE:en',
  // ── NEW: Protests / community events ─────────────────────────────────────
  'https://news.google.com/rss/search?q=Kenya+femicide+march+protest+2026&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Nairobi+march+women+rights+femicide&hl=en-KE&gl=KE&ceid=KE:en',
  // ── NEW: Campus / university femicide ────────────────────────────────────
  'https://news.google.com/rss/search?q=Kenya+university+student+killed+campus+2026&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=JOOUST+RVIST+student+femicide+murder&hl=en-KE&gl=KE&ceid=KE:en',
  // ── EXISTING: News publishers ─────────────────────────────────────────────
  'https://nation.africa/kenya/rss',
  'https://www.standardmedia.co.ke/rss/kenya.xml',
  // ── NEW: BBC Africa direct feed (captures Manosphere Messiahs, GBV docs) ─
  'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  // ── EXISTING: YouTube — Kenyan TV ─────────────────────────────────────────
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCsEukrAd64fqA7FjwkmZ_Dg',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCQgrVNIIDV2tLYhKkvLquoA',
  // ── NEW: YouTube — BBC Africa / BBC Eye (captures documentary videos) ─────
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCnUYZLuoy1rq1aVMwx4aTzw',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC16niRr50-MSBwiO3YDb3RA',
]

// ── KEYWORDS — expanded with Kibe + protests ──────────────────────────────────
const GBV_KEYWORDS = [
  // Existing
  'femicide','murdered','killed','found dead','gender-based violence','gbv',
  'domestic violence','sexual assault','rape','acid attack','strangled',
  'beaten to death','intimate partner','missing woman','missing girl','body found',
  'woman dead','girl dead','violence against women','gender violence','woman killed',
  'she died','killed her','he killed','beaten her','abused her','feminist',
  'patriarchy','misogyn','toxic masculin','dating app','airbnb','tinder',
  'whatsapp','facebook','tiktok','online predator','cyber harassment',
  'revenge porn','digital abuse','end femicide','women rights',
  '#femicide','#gbvkenya','#endfemicide',
  // NEW — Kibe / manosphere
  'andrew kibe','kibe','lambistic','28 commandments','manosphere',
  'kibe\'s den','rogue radio','mrlambistic','noisy women','simping',
  'masculinity crisis','incel','red pill','alpha male',
  'manosphere messiahs',
  // NEW — protests / community events
  'femicide march','march against femicide','protest','rally',
  'nairobi march','end gbv march','demonstration','vigil',
  '#endfemicideke','#nairobimarch',
  // NEW — campus / university cases
  'campus femicide','university student killed','jooust','rvist',
  'student murdered','campus murder','alice rianga','diana cherono',
  'faridah changawa',
]

const isRelevant = (a: any) => {
  const t = `${a.title} ${a.snippet}`.toLowerCase()
  return GBV_KEYWORDS.some(k => t.includes(k))
}

// ── FEED FETCHER (unchanged from original) ────────────────────────────────────
async function fetchFeed(url: string): Promise<any[]> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent':'Mozilla/5.0 (compatible; Googlebot/2.1)','Accept':'application/rss+xml,application/xml' } })
    if (!res.ok) { console.log(`Feed ${url.slice(0,60)}: HTTP ${res.status}`); return [] }
    const text = await res.text()
    const items: any[] = []
    const isAtom = text.includes("<feed") && text.includes("<entry>")
    if (isAtom) {
      const entryRx = /<entry>([\s\S]*?)<\/entry>/g
      let m2
      const chanTitle = text.match(/<title>([^<]+)<\/title>/)?.[1] || new URL(url).hostname
      while ((m2 = entryRx.exec(text)) !== null) {
        const e = m2[1]
        const t = e.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() || ""
        const lnk = e.match(/<link[^>]*href="([^"]+)"/)?.[1] || ""
        const pd = e.match(/<published>([^<]+)<\/published>/)?.[1] || ""
        const snip = (e.match(/<media:description>([^<]*)<\/media:description>/)?.[1] || "").trim()
        // Wider YouTube filter — don't restrict to Kenya only (catches BBC Eye docs)
        if (t && lnk) items.push({ source: chanTitle, title: t, snippet: snip, url: lnk, pubDate: pd, content_type: "video" })
      }
    } else {
      const itemRegex = /<item>([\s\S]*?)<\/item>/g
      let match
      while ((match = itemRegex.exec(text)) !== null) {
        const item    = match[1]
        const tmatch  = item.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/)
        const title   = (tmatch?.[1] || tmatch?.[2] || '').trim()
        const dmatch  = item.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description[^>]*>([\s\S]*?)<\/description>/)
        const desc    = (dmatch?.[1] || dmatch?.[2] || '').trim()
        const linkRaw = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() || ''
        const linkClean = linkRaw.replace(/<[^>]+>/g,'').trim()
        const realUrl   = linkClean.match(/url=([^&]+)/)?.[1]
        const link      = realUrl ? decodeURIComponent(realUrl) : linkClean
        const pubDate   = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
        const source    = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || 'Feed'
        const snippet   = desc.replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&#\d+;/g,'').trim()
        if (title) items.push({ source, title, snippet, url:link, pubDate })
      }
    }
    console.log(`Feed fetched: ${items.length} items from ${url.slice(0,50)}`)
    return items
  } catch (err:any) { console.error(`Feed error: ${err.message}`); return [] }
}

// ── CLASSIFIER — updated to detect manosphere + protest signals ───────────────
async function classifyArticles(articles: any[]): Promise<any[]> {
  if (!articles.length) return []
  const list = articles.map((a,i) => `${i+1}. SOURCE: ${a.source}\nTITLE: ${a.title}\nSNIPPET: ${a.snippet}`).join('\n\n')
  const prompt = `You are a GBV researcher analysing Kenyan news and social content. For each article return a JSON array.

Each object needs:
- "index" (1-based)
- "gbv_relevance" (0-10): relevance to gender-based violence or femicide
- "misogyny_score" (0-10): level of misogynistic content or framing
- "sentiment" ("alarming"|"negative"|"neutral"|"positive")
- "tech_facilitated" (bool): does the violence/harassment involve tech platforms?
- "tech_platforms" (array of strings): which platforms (x, facebook, tiktok, youtube, whatsapp, etc.)
- "tech_details" (string)
- "content_category" (string): one of "femicide"|"gbv"|"manosphere"|"protest"|"policy"|"campus"|"general"
- "is_kibe_related" (bool): mentions Andrew Kibe, 28 Commandments, Lambistic, or Kibe's Den
- "is_protest" (bool): relates to marches, rallies, protests against femicide/GBV

IMPORTANT: Content about Andrew Kibe, the manosphere, or "28 Commandments" should score 7-10 on misogyny_score even without direct violence, because it represents the ideological pipeline to femicide.

ARTICLES:
${list}

Return ONLY the JSON array, no other text.`
  try {
    const res  = await fetch('https://api.anthropic.com/v1/messages', { method:'POST', headers:{'Content-Type':'application/json','x-api-key':ANTHROPIC_KEY,'anthropic-version':'2023-06-01'}, body:JSON.stringify({ model:'claude-opus-4-6', max_tokens:2500, messages:[{role:'user',content:prompt}] }) })
    const data = await res.json()
    const text = data.content?.[0]?.text || '[]'
    const scores = JSON.parse(text.replace(/```json|```/g,'').trim())
    return articles.map((a,i) => {
      const s = scores.find((x:any)=>x.index===i+1)||{}
      return { ...a,
        gbv_relevance:    s.gbv_relevance    ?? 0,
        misogyny_score:   s.misogyny_score   ?? 0,
        sentiment:        s.sentiment        ?? 'neutral',
        tech_facilitated: s.tech_facilitated ?? false,
        tech_platforms:   s.tech_platforms   ?? [],
        tech_details:     s.tech_details     ?? '',
        content_category: s.content_category ?? 'general',
        is_kibe_related:  s.is_kibe_related  ?? false,
        is_protest:       s.is_protest       ?? false,
      }
    })
  } catch(err:any) {
    console.error('Claude error:',err.message)
    return articles.map(a=>({...a,gbv_relevance:5,misogyny_score:3,sentiment:'neutral',tech_facilitated:false,tech_platforms:[],tech_details:'',content_category:'general',is_kibe_related:false,is_protest:false}))
  }
}

// ── MISOGYNY INDEX UPDATE — now tracks manosphere + protest separately ─────────
async function updateMisogynyIndex() {
  const now=Date.now(), since7=new Date(now-7*24*60*60*1000).toISOString()
  const today=new Date().toISOString().split('T')[0], yest=new Date(now-24*60*60*1000).toISOString().split('T')[0]
  const {data:all}=await supabase.from('sentiment_articles').select('gbv_relevance,misogyny_score,sentiment,tech_facilitated,platform,content_type,content_category,is_kibe_related,is_protest').gte('scanned_at',since7)
  if (!all?.length) return
  const news   = all.filter((a:any)=>a.platform==='news'||a.content_type==='article'||a.content_type==='video')
  const social = all.filter((a:any)=>a.platform==='x'||a.content_type==='social_post')
  const calc=(arr:any[])=>{if(!arr.length)return 0;const hm=arr.filter((a:any)=>a.misogyny_score>=7).length,tf=arr.filter((a:any)=>a.tech_facilitated).length,al=arr.filter((a:any)=>a.sentiment==='alarming'||a.sentiment==='negative').length,hg=arr.filter((a:any)=>a.gbv_relevance>=8).length;return Math.min(100,Math.round((hm/arr.length)*40+(tf/arr.length)*20+(al/arr.length)*25+(hg/arr.length)*15))}
  const score=calc(all), news_score=calc(news), social_score=calc(social)
  const {data:yd}=await supabase.from('misogyny_index').select('score').eq('date',yest).single()
  const prev_score=yd?.score??score
  // Extended metadata including manosphere + protest signals
  const manosphere_count = all.filter((a:any)=>a.is_kibe_related||a.content_category==='manosphere').length
  const protest_count    = all.filter((a:any)=>a.is_protest||a.content_category==='protest').length
  const campus_count     = all.filter((a:any)=>a.content_category==='campus').length
  await supabase.from('misogyny_index').upsert({
    date:today, score, news_score, social_score, prev_score,
    article_count:all.length, news_count:news.length, social_count:social.length,
    high_alert:score>=60,
    // New fields — add these columns to misogyny_index table if not present
    manosphere_signals: manosphere_count,
    protest_signals:    protest_count,
    campus_signals:     campus_count,
  },{onConflict:'date'})
  console.log(`Index: ${score} (news:${news_score} social:${social_score}) manosphere:${manosphere_count} protests:${protest_count}`)
}

// ── MAIN HANDLER (structure unchanged) ───────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method==='GET') return new Response(JSON.stringify({status:'ok'}),{headers:{'Content-Type':'application/json'}})
  try {
    const allArticles: any[] = []
    for (const feed of FEEDS) {
      const items = await fetchFeed(feed)
      allArticles.push(...items)
      await new Promise(r=>setTimeout(r,2000))
    }

    const seen=new Set<string>()
    const unique=allArticles.filter(a=>{if(!a.url||seen.has(a.url))return false;seen.add(a.url);return true})
    const relevant=unique.filter(isRelevant)
    console.log(`Total: ${allArticles.length}, unique: ${unique.length}, relevant: ${relevant.length}`)

    if (!relevant.length) return new Response(JSON.stringify({success:true,message:'No relevant content',fetched:allArticles.length}),{status:200})

    const urls=relevant.map(a=>a.url).filter(Boolean)
    const {data:existing}=await supabase.from('sentiment_articles').select('article_url').in('article_url',urls)
    const existingUrls=new Set((existing||[]).map((e:any)=>e.article_url))
    const newItems=relevant.filter(a=>!existingUrls.has(a.url))
    console.log(`New items: ${newItems.length}`)

    if (!newItems.length) return new Response(JSON.stringify({success:true,message:'No new content',fetched:allArticles.length,relevant:relevant.length,classified:0,inserted:0}),{status:200})

    const limited=newItems.slice(0,20)
    const classified:any[]=[]
    for (let i=0;i<limited.length;i+=5) {
      const results=await classifyArticles(limited.slice(i,i+5))
      classified.push(...results)
      if (i+5<limited.length) await new Promise(r=>setTimeout(r,1000))
    }

    const toInsert=classified.filter(a=>a.gbv_relevance>=4||a.is_kibe_related||a.is_protest).map(a=>({
      source_name:a.source, channel_name:a.source, source_url:a.url, article_url:a.url,
      article_title:a.title, article_snippet:(a.snippet||'').slice(0,500),
      content_type:a.content_type||'article', thumbnail_url:null,
      published_at:a.pubDate?new Date(a.pubDate).toISOString():null,
      gbv_relevance:a.gbv_relevance, misogyny_score:a.misogyny_score,
      sentiment:a.sentiment, tech_facilitated:a.tech_facilitated,
      tech_platforms:a.tech_platforms, tech_details:a.tech_details||'',
      platform:a.url?.includes('youtube')?'youtube':'news',
      summary:'', published:true, verified:false,
      content_category:a.content_category||'general',
      // Store Kibe + protest flags so intel-brief can use them
      is_kibe_related:a.is_kibe_related||false,
      is_protest:a.is_protest||false,
    }))

    if (toInsert.length) {
      const {error}=await supabase.from('sentiment_articles').insert(toInsert)
      if (error) console.error('Insert error:',error.message)
      else console.log(`Inserted ${toInsert.length} articles`)
    }

    await updateMisogynyIndex()

    const kibeHits    = toInsert.filter(a=>a.is_kibe_related).length
    const protestHits = toInsert.filter(a=>a.is_protest).length
    return new Response(JSON.stringify({success:true,fetched:allArticles.length,relevant:relevant.length,classified:classified.length,inserted:toInsert.length,kibe_hits:kibeHits,protest_hits:protestHits}),{status:200})
  } catch(err:any) {
    console.error('Scanner error:',err.message)
    return new Response(JSON.stringify({error:err.message}),{status:500})
  }
})

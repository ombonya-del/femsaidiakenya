import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_KEY    = Deno.env.get('ANTHROPIC_API_KEY') || ''
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase         = createClient(SUPABASE_URL, SUPABASE_SERVICE)

const FEEDS = [
  'https://news.google.com/rss/search?q=Kenya+femicide+women+killed&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+gender+based+violence+GBV+2025+2026&hl=en-KE&gl=KE&ceid=KE:en',
  'https://news.google.com/rss/search?q=Kenya+domestic+violence+rape+sexual+assault&hl=en-KE&gl=KE&ceid=KE:en',
]

const GBV_KEYWORDS = ['femicide','murdered','killed','found dead','gender-based violence','gbv','domestic violence','sexual assault','rape','acid attack','strangled','beaten to death','intimate partner','missing woman','missing girl','body found','woman dead','girl dead','violence against women','gender violence','woman killed','she died','killed her','he killed','beaten her','abused her','feminist','patriarchy','misogyn','toxic masculin','dating app','airbnb','tinder','whatsapp','facebook','tiktok','online predator','cyber harassment','revenge porn','digital abuse','end femicide','women rights','#femicide','#gbvkenya','#endfemicide']

const isRelevant = (a: any) => { const t = `${a.title} ${a.snippet}`.toLowerCase(); return GBV_KEYWORDS.some(k => t.includes(k)) }

async function fetchFeed(url: string): Promise<any[]> {
  try {
    const res  = await fetch(url, { headers: { 'User-Agent':'Mozilla/5.0 (compatible; Googlebot/2.1)','Accept':'application/rss+xml,application/xml' } })
    if (!res.ok) { console.log(`Feed ${url.slice(0,60)}: HTTP ${res.status}`); return [] }
    const text = await res.text()
    const items: any[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    while ((match = itemRegex.exec(text)) !== null) {
      const item     = match[1]
      const tmatch   = item.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/)
      const title    = (tmatch?.[1] || tmatch?.[2] || '').trim()
      const dmatch   = item.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description[^>]*>([\s\S]*?)<\/description>/)
      const desc     = (dmatch?.[1] || dmatch?.[2] || '').trim()
      const linkRaw  = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() || ''
      const link     = linkRaw.replace(/<[^>]+>/g, '').trim()
      const pubDate  = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const source   = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || 'Google News'
      const snippet  = desc.replace(/<[^>]+>/g,'').trim()
      if (title) items.push({ source, title, snippet, url:link, pubDate })
    }
    console.log(`Feed fetched: ${items.length} items`)
    return items
  } catch (err:any) { console.error(`Feed error: ${err.message}`); return [] }
}

async function classifyArticles(articles: any[]): Promise<any[]> {
  if (!articles.length) return []
  const list   = articles.map((a,i) => `${i+1}. SOURCE: ${a.source}\nTITLE: ${a.title}\nSNIPPET: ${a.snippet}`).join('\n\n')
  const prompt = `You are a GBV researcher analysing Kenyan news. For each article return a JSON array. Each object needs: "index"(1-based), "gbv_relevance"(0-10), "misogyny_score"(0-10), "sentiment"("alarming"|"negative"|"neutral"|"positive"), "tech_facilitated"(bool), "tech_platforms"(array of strings), "tech_details"(string).\n\nARTICLES:\n${list}\n\nReturn ONLY the JSON array, no other text.`
  try {
    const res    = await fetch('https://api.anthropic.com/v1/messages', { method:'POST', headers:{'Content-Type':'application/json','x-api-key':ANTHROPIC_KEY,'anthropic-version':'2023-06-01'}, body:JSON.stringify({ model:'claude-opus-4-6', max_tokens:2000, messages:[{role:'user',content:prompt}] }) })
    const data   = await res.json()
    const text   = data.content?.[0]?.text || '[]'
    const scores = JSON.parse(text.replace(/```json|```/g,'').trim())
    return articles.map((a,i) => { const s = scores.find((x:any)=>x.index===i+1)||{}; return {...a,gbv_relevance:s.gbv_relevance??0,misogyny_score:s.misogyny_score??0,sentiment:s.sentiment??'neutral',tech_facilitated:s.tech_facilitated??false,tech_platforms:s.tech_platforms??[],tech_details:s.tech_details??''} })
  } catch(err:any) { console.error('Claude error:',err.message); return articles.map(a=>({...a,gbv_relevance:5,misogyny_score:3,sentiment:'neutral',tech_facilitated:false,tech_platforms:[],tech_details:''})) }
}

async function updateMisogynyIndex() {
  const since = new Date(Date.now()-30*24*60*60*1000).toISOString()
  const { data } = await supabase.from('sentiment_articles').select('gbv_relevance,misogyny_score,sentiment,tech_facilitated').gte('scanned_at',since)
  if (!data?.length) return
  const total=data.length, highMiso=data.filter((a:any)=>a.misogyny_score>=7).length, techFacil=data.filter((a:any)=>a.tech_facilitated).length, alarming=data.filter((a:any)=>a.sentiment==='alarming'||a.sentiment==='negative').length, highGBV=data.filter((a:any)=>a.gbv_relevance>=8).length
  const score=Math.min(100,Math.round((highMiso/total)*40+(techFacil/total)*20+(alarming/total)*25+(highGBV/total)*15))
  await supabase.from('misogyny_index').upsert({date:new Date().toISOString().split('T')[0],score,article_count:total,high_alert:score>=60},{onConflict:'date'})
  console.log(`Misogyny index: ${score}/100 from ${total} articles`)
}

Deno.serve(async (req: Request) => {
  if (req.method==='GET') return new Response(JSON.stringify({status:'ok'}),{headers:{'Content-Type':'application/json'}})
  try {
    const allArticles: any[] = []
    for (const feed of FEEDS) {
      const items = await fetchFeed(feed)
      allArticles.push(...items)
      await new Promise(r=>setTimeout(r,2000)) // 2s delay between feeds
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

    const toInsert=classified.filter(a=>a.gbv_relevance>=4).map(a=>({
      source_name:a.source, channel_name:a.source, source_url:a.url, article_url:a.url,
      article_title:a.title, article_snippet:(a.snippet||'').slice(0,500),
      content_type:'article', thumbnail_url:null,
      published_at:a.pubDate?new Date(a.pubDate).toISOString():null,
      gbv_relevance:a.gbv_relevance, misogyny_score:a.misogyny_score,
      sentiment:a.sentiment, tech_facilitated:a.tech_facilitated,
      tech_platforms:a.tech_platforms, tech_details:a.tech_details||'',
      platform:'news', summary:'', published:true, verified:false,
    }))

    if (toInsert.length) {
      const {error}=await supabase.from('sentiment_articles').insert(toInsert)
      if (error) console.error('Insert error:',error.message)
      else console.log(`Inserted ${toInsert.length} articles`)
    }

    await updateMisogynyIndex()

    return new Response(JSON.stringify({success:true,fetched:allArticles.length,relevant:relevant.length,classified:classified.length,inserted:toInsert.length}),{status:200})
  } catch(err:any) {
    console.error('Scanner error:',err.message)
    return new Response(JSON.stringify({error:err.message}),{status:500})
  }
})

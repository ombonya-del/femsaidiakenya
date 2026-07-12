import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_KEY    = Deno.env.get('ANTHROPIC_API_KEY') || ''
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase         = createClient(SUPABASE_URL, SUPABASE_SERVICE)

const GBV_KEYWORDS = [
  // Existing
  'femicide','murdered','killed','found dead','gender-based violence','gbv',
  'domestic violence','sexual assault','rape','acid attack','strangled',
  'stabbed woman','beaten to death','intimate partner','missing woman','missing girl',
  'body found','woman dead','girl dead','violence against women','gender violence',
  'gbv kenya','she was killed','woman killed','she died','her body','killed her',
  'he killed','beaten her','abused her','gender justice','feminist','patriarchy',
  'misogyn','toxic masculin','dating app','airbnb','tinder','whatsapp','facebook',
  'tiktok','instagram','online predator','kenya femicide','cyber harassment',
  'revenge porn','digital abuse','woman found','girl found','acid','strangled her',
  'end femicide','gender equality','women rights',
  '#femicide','#gbvkenya','#endfemicide','#killedher','#endgbv',
  // NEW — manosphere / Kibe pipeline
  'andrew kibe','kibe','lambistic','28 commandments','manosphere',
  'kibe\'s den','rogue radio','mrlambistic','noisy women','simping','incel',
  'red pill','alpha male','manosphere messiahs','male supremacy',
  // NEW — protests / community events
  'femicide march','march against femicide','protest','rally','nairobi march',
  'end gbv march','demonstration','vigil','#endfemicideke','#nairobimarch',
  // NEW — campus / university
  'campus femicide','university student killed','jooust','rvist',
  'student murdered','campus murder','alice rianga','diana cherono','faridah changawa',
]

const isGBV = (text: string) => { const l = text.toLowerCase(); return GBV_KEYWORDS.some(k => l.includes(k)) }

async function classify(item: any) {
  const isKibe = GBV_KEYWORDS.slice(30, 40).some(k => `${item.article_title} ${item.article_snippet}`.toLowerCase().includes(k))
  const prompt = `You are a GBV researcher analysing Kenyan social media. Classify this item. Return ONLY valid JSON with:
- gbv_relevance (0-10)
- misogyny_score (0-10): NOTE — Andrew Kibe / manosphere content scores 7-10 even without direct violence
- sentiment ("alarming"|"negative"|"neutral"|"positive")
- tech_facilitated (bool)
- tech_platforms (array)
- content_category ("femicide"|"gbv"|"manosphere"|"protest"|"campus"|"policy"|"general")
- is_kibe_related (bool)
- is_protest (bool)
- summary (1-2 sentences)

ITEM: [${item.content_type}] ${item.source_name}
${item.article_title}
${item.article_snippet}

Return only JSON.`
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', { method:'POST', headers:{'Content-Type':'application/json','x-api-key':ANTHROPIC_KEY,'anthropic-version':'2023-06-01'}, body:JSON.stringify({ model:'claude-opus-4-8', max_tokens:400, messages:[{role:'user',content:prompt}] }) })
    const data = await res.json()
    const text = data.content?.[0]?.text || '{}'
    return JSON.parse(text.replace(/```json|```/g,'').trim())
  } catch {
    return { gbv_relevance:isKibe?7:5, misogyny_score:isKibe?8:3, sentiment:isKibe?'alarming':'neutral', tech_facilitated:false, tech_platforms:[], content_category:isKibe?'manosphere':'general', is_kibe_related:isKibe, is_protest:false, summary:'' }
  }
}

function normalise(body: any) {
  if (body.source === 'ifttt') return { source_name:`X / @${(body.user||body.account||'').replace('@','')}`, platform:'x', article_title:(body.text||'').slice(0,140), article_snippet:body.text||'', article_url:body.link||'', content_type:'social_post', thumbnail_url:'', scanned_at:new Date(body.created_at||Date.now()).toISOString() }
  if (body.source === 'rsshub' || body.source === 'rss') return { source_name:body.feed_source||'RSSHub', platform:body.platform||'tiktok', article_title:body.title||(body.description||'').slice(0,140), article_snippet:body.description||body.title||'', article_url:body.link||body.url||'', content_type:body.platform==='tiktok'?'video':'social_post', thumbnail_url:body.image||'', scanned_at:body.pubDate?new Date(body.pubDate).toISOString():new Date().toISOString() }
  if (body.source === 'manual' || body.source === 'facebook') return { source_name:body.account||body.page_name||body.platform||'Manual', platform:body.platform||'x', article_title:body.title||(body.text||'').slice(0,140), article_snippet:body.text||body.description||'', article_url:body.url||body.link||'', content_type:body.content_type||'social_post', thumbnail_url:body.thumbnail||'', scanned_at:new Date().toISOString() }
  return null
}

Deno.serve(async (req: Request) => {
  if (req.method === 'GET') return new Response(JSON.stringify({status:'ok',fn:'social-ingest-v2'}), {headers:{'Content-Type':'application/json'}})
  if (req.method !== 'POST') return new Response('Method not allowed', {status:405})
  try {
    const body = await req.json()
    const item = normalise(body)
    if (!item) return new Response(JSON.stringify({error:'Unrecognised format'}), {status:400,headers:{'Content-Type':'application/json'}})
    if (item.article_url) {
      const { data: ex } = await supabase.from('sentiment_articles').select('id').eq('article_url',item.article_url).limit(1)
      if (ex?.length) return new Response(JSON.stringify({status:'duplicate'}), {headers:{'Content-Type':'application/json'}})
    }
    if (!isGBV(`${item.article_title} ${item.article_snippet}`)) return new Response(JSON.stringify({status:'skipped',reason:'not_gbv_relevant'}), {headers:{'Content-Type':'application/json'}})
    const scores = await classify(item)
    const record = {
      article_title:    item.article_title,
      article_url:      item.article_url,
      source_name:      item.source_name,
      platform:         item.platform,
      content_type:     item.content_type,
      thumbnail_url:    item.thumbnail_url||null,
      summary:          scores.summary||'',
      article_snippet:  item.article_snippet.slice(0,500),
      gbv_relevance:    scores.gbv_relevance??5,
      misogyny_score:   scores.misogyny_score??3,
      sentiment:        scores.sentiment??'neutral',
      tech_facilitated: scores.tech_facilitated??false,
      tech_platforms:   scores.tech_platforms??[],
      tech_details:     '',
      scanned_at:       item.scanned_at,
      verified:         false,
      published:        true,
      content_category: scores.content_category??'general',
      is_kibe_related:  scores.is_kibe_related??false,
      is_protest:       scores.is_protest??false,
    }
    const { error } = await supabase.from('sentiment_articles').insert(record)
    if (error) return new Response(JSON.stringify({error:error.message}), {status:500,headers:{'Content-Type':'application/json'}})
    return new Response(JSON.stringify({status:'inserted',title:record.article_title.slice(0,80),misogyny_score:record.misogyny_score,sentiment:record.sentiment,category:record.content_category}), {headers:{'Content-Type':'application/json'}})
  } catch (err: any) {
    return new Response(JSON.stringify({error:err.message}), {status:500,headers:{'Content-Type':'application/json'}})
  }
})

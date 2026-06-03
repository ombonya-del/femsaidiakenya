import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)
const BEARER = Deno.env.get('X_BEARER_TOKEN') ?? ''

// ── HANDLES — existing advocacy accounts + NEW: Kibe ─────────────────────────
const HANDLES = [
  // Existing — femicide/advocacy
  'FemicideCountKE','NjeriWaMigwi','VOCALAfrica_','usikimye',
  'NanjalaOK','FemSaidiaKenya','WanjikuRevolt','AkiliDada',
  'AmnestyKenya','KenyaHumanRights',
  // NEW — manosphere tracking (monitor, not endorse)
  'kibeandy',       // Andrew Kibe — manosphere pipeline
  'amerix',          // Amerix — red pill masculinity influencer, same pipeline as Kibe
  'kenyagossips',    // Kenya Gossips — high reach, surfaces GBV incidents
  'primemediakenya', // Prime Media Kenya — mainstream news
  'EndFemicideKE',   // End Femicide KE — advocacy
  'TreasonousBabe',  // Feminist/advocacy voice
  'C_NyaKundiH',     // Advocacy
  'kijana_misa',     // Youth voice
  'hivileo1',        // Kenya commentary
]

// ── KEYWORD SEARCHES — hashtags + topic queries ───────────────────────────────
// These run as search queries, not handle-specific
const KEYWORD_SEARCHES = [
  'femicide kenya -is:retweet',
  'gbv kenya -is:retweet',
  '#EndFemicide -is:retweet',
  '#FemicideMarch -is:retweet',
  '#KenyaFemicide -is:retweet',
  'femicide march nairobi -is:retweet',
  'andrew kibe women -is:retweet',
  '28 commandments kibe -is:retweet',
  'campus murder kenya student -is:retweet',
]

// ── KEYWORDS for handle relevance filter ─────────────────────────────────────
const KEYWORDS = [
  'femicide','gbv','gender','violence','rape','assault','killed','murdered',
  'manosphere','misogyn','woman','women','girl','rights','justice',
  'kibe','28 commandments','lambistic','march','protest','rally',
  'campus','university student','victim','body found','missing',
  'mwanamke','mke','mama','dada','unyanyasaji','haki',
]

// ── FETCH BY HANDLE (unchanged logic) ────────────────────────────────────────
async function pollHandle(handle: string) {
  const results = { fetched:0, relevant:0, inserted:0 }
  const query = encodeURIComponent(`from:${handle} -is:retweet`)
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=10&tweet.fields=created_at,text`
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${BEARER}` } })
  if (!res.ok) { console.error(`${handle}: ${res.status}`); return results }
  const data = await res.json()
  const tweets = data.data || []
  results.fetched += tweets.length

  for (const tweet of tweets) {
    const text = tweet.text || ''
    // For Kibe specifically: lower threshold — all posts are signal
    const isKibe = handle === 'kibeandy' || handle === 'amerix'
    if (!isKibe && !KEYWORDS.some(k => text.toLowerCase().includes(k))) continue
    results.relevant++
    const { error } = await supabase.from('sentiment_articles').upsert({
      source_name:      `X / @${handle}`,
      article_title:    text.slice(0,200),
      article_snippet:  text,
      article_url:      `https://x.com/${handle}/status/${tweet.id}`,
      platform:         'x',
      content_type:     'social_post',
      scanned_at:       tweet.created_at || new Date().toISOString(),
      gbv_relevance:    isKibe ? 8 : 7,
      misogyny_score:   isKibe ? 8 : 5,
      sentiment:        isKibe ? 'alarming' : 'negative',
      is_kibe_related:  isKibe,
      is_protest:       false,
      content_category: isKibe ? 'manosphere' : 'gbv',
    }, { onConflict: 'article_url' })
    if (!error) results.inserted++
  }
  return results
}

// ── FETCH BY KEYWORD SEARCH — NEW ────────────────────────────────────────────
async function pollKeyword(searchQuery: string) {
  const results = { fetched:0, inserted:0 }
  const query = encodeURIComponent(searchQuery)
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=10&tweet.fields=created_at,text,author_id`
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${BEARER}` } })
  if (!res.ok) { console.error(`Keyword search "${searchQuery}": ${res.status}`); return results }
  const data = await res.json()
  const tweets = data.data || []
  results.fetched += tweets.length

  const isKibeQuery   = searchQuery.includes('kibe') || searchQuery.includes('28 commandments')
  const isProtestQuery = searchQuery.includes('march') || searchQuery.includes('EndFemicide') || searchQuery.includes('FemicideMarch')

  for (const tweet of tweets) {
    const text = tweet.text || ''
    const { error } = await supabase.from('sentiment_articles').upsert({
      source_name:      'X / Keyword Search',
      article_title:    text.slice(0,200),
      article_snippet:  text,
      article_url:      `https://x.com/i/web/status/${tweet.id}`,
      platform:         'x',
      content_type:     'social_post',
      scanned_at:       tweet.created_at || new Date().toISOString(),
      gbv_relevance:    isProtestQuery ? 8 : 7,
      misogyny_score:   isKibeQuery ? 8 : 5,
      sentiment:        isKibeQuery ? 'alarming' : 'negative',
      is_kibe_related:  isKibeQuery,
      is_protest:       isProtestQuery,
      content_category: isKibeQuery ? 'manosphere' : isProtestQuery ? 'protest' : 'gbv',
    }, { onConflict: 'article_url' })
    if (!error) results.inserted++
  }
  return results
}

Deno.serve(async (req: Request) => {
  try {
    const totals = { fetched:0, relevant:0, inserted:0, kibe_posts:0, protest_posts:0 }

    // Poll handles
    for (const handle of HANDLES) {
      const r = await pollHandle(handle)
      totals.fetched   += r.fetched
      totals.relevant  += r.relevant
      totals.inserted  += r.inserted
      if (handle === 'kibeandy') totals.kibe_posts += r.inserted
      await new Promise(r=>setTimeout(r,1200))
    }

    // Keyword / hashtag searches — NEW
    for (const query of KEYWORD_SEARCHES) {
      const r = await pollKeyword(query)
      totals.fetched  += r.fetched
      totals.inserted += r.inserted
      const isProtest = query.includes('march') || query.includes('EndFemicide') || query.includes('FemicideMarch')
      const isKibe    = query.includes('kibe') || query.includes('28 commandments')
      if (isProtest) totals.protest_posts += r.inserted
      if (isKibe)    totals.kibe_posts    += r.inserted
      await new Promise(r=>setTimeout(r,1200))
    }

    console.log(`Poller v2: ${JSON.stringify(totals)}`)
    return new Response(JSON.stringify({ success:true, ...totals }), { status:200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status:500 })
  }
})

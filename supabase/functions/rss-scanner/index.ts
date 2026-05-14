// ─────────────────────────────────────────────────────────────────────────────
// FemSaidia Kenya — RSS Scanner Edge Function
// Fetches Kenyan news RSS feeds, classifies via Claude API,
// stores results in Supabase, updates Misogyny Index
// Deploy: supabase functions deploy rss-scanner --project-ref uuluuhltphgwfblcghlp
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_KEY     = Deno.env.get('ANTHROPIC_API_KEY') || ''
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE)

// ── RSS SOURCES ───────────────────────────────────────────────────────────────
const RSS_FEEDS = [
  { source: 'Google News — Femicide Kenya',    url: 'https://news.google.com/rss/search?q=Kenya+femicide&hl=en-KE&gl=KE&ceid=KE:en' },
  { source: 'Google News — GBV Women Kenya',  url: 'https://news.google.com/rss/search?q=Kenya+gender+violence+women+killed&hl=en-KE&gl=KE&ceid=KE:en' },
  { source: 'Google News — Domestic Violence', url: 'https://news.google.com/rss/search?q=Kenya+domestic+violence+murder+woman&hl=en-KE&gl=KE&ceid=KE:en' },
  { source: 'Google News — Sexual Violence',   url: 'https://news.google.com/rss/search?q=Kenya+rape+sexual+assault+woman&hl=en-KE&gl=KE&ceid=KE:en' },
  { source: 'Google News — Missing Women',    url: 'https://news.google.com/rss/search?q=Kenya+missing+woman+girl+body+found&hl=en-KE&gl=KE&ceid=KE:en' },
  { source: 'Google News — Misogyny Kenya',   url: 'https://news.google.com/rss/search?q=Kenya+misogyny+toxic+masculinity&hl=en-KE&gl=KE&ceid=KE:en' },
]

// ── GBV KEYWORDS (pre-filter before Claude API) ───────────────────────────────
const GBV_KEYWORDS = [
  'femicide','murdered','killed','found dead','gender-based violence','gbv',
  'domestic violence','sexual assault','rape','acid attack','strangled',
  'stabbed woman','beaten','intimate partner','missing woman','missing girl',
  'body found','woman dead','girl dead','violence against women',
  'manosphere','red pill','incel','misogyn','toxic masculin',
  'dating app','airbnb','instagram','tinder','whatsapp','facebook',
  'tiktok','bumble','social media','online predator',
]

// ── FETCH & PARSE RSS ─────────────────────────────────────────────────────────
async function fetchRSS(source: string, url: string): Promise<any[]> {
  try {
    const res  = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FemSaidiaBot/1.0)','Accept':'application/rss+xml,application/xml,text/xml' } })
    const text = await res.text()

    // Extract items with regex (no XML parser needed)
    const items: any[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(text)) !== null) {
      const item    = match[1]
      const titleMatch = item.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/)
      const title   = (titleMatch?.[1] || titleMatch?.[2] || '').trim()
      const descMatch = item.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description[^>]*>([\s\S]*?)<\/description>/)
      const desc    = (descMatch?.[1] || descMatch?.[2] || '').trim()
      const link    = (item.match(/<link>(.*?)<\/link>|<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] || item.match(/<link>(.*?)<\/link>|<link[^>]*href="([^"]*)"[^>]*\/>/)?.[2] || '').trim()
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''

      // Clean HTML tags from description
      const clean   = desc.replace(/<[^>]+>/g, '').substring(0, 300)

      if (title) items.push({ source, title, snippet: clean, url: link, pubDate })
    }
    return items
  } catch (err) {
    console.error(`RSS fetch failed for ${source}:`, err.message)
    return []
  }
}

// ── FILTER RELEVANT ARTICLES ──────────────────────────────────────────────────
function isRelevant(article: any): boolean {
  const text = `${article.title} ${article.snippet}`.toLowerCase()
  return GBV_KEYWORDS.some(kw => text.includes(kw))
}

// ── CLASSIFY WITH CLAUDE API ──────────────────────────────────────────────────
async function classifyArticles(articles: any[]): Promise<any[]> {
  if (!articles.length) return []

  const articleList = articles.map((a, i) =>
    `${i + 1}. SOURCE: ${a.source}\nTITLE: ${a.title}\nSNIPPET: ${a.snippet}`
  ).join('\n\n')

  const prompt = `You are a gender-based violence researcher analysing Kenyan news articles.

For each article below, provide a JSON classification. Return ONLY a JSON array, no other text.

Each object in the array must have:
- "index": article number (1-based)
- "gbv_relevance": 0-10 (0=not relevant, 10=directly about femicide/GBV)
- "misogyny_score": 0-10 (0=no misogyny, 10=extreme misogynistic content)
- "sentiment": one of "alarming" | "negative" | "neutral" | "positive"
  (alarming=reports violence, negative=promotes harm, neutral=factual, positive=about justice/action)
- "tech_facilitated": true or false (was technology used to facilitate harm?)
- "tech_platforms": array of platform names if tech_facilitated is true, else []
- "tech_details": brief string describing tech involvement, or ""

ARTICLES:
${articleList}

Return only the JSON array.`

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
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data   = await res.json()
    const text   = data.content?.[0]?.text || '[]'
    const clean  = text.replace(/```json|```/g, '').trim()
    const scores = JSON.parse(clean)

    return articles.map((a, i) => {
      const score = scores.find((s: any) => s.index === i + 1) || {}
      return {
        ...a,
        gbv_relevance:   score.gbv_relevance   ?? 0,
        misogyny_score:  score.misogyny_score  ?? 0,
        sentiment:       score.sentiment       ?? 'neutral',
        tech_facilitated: score.tech_facilitated ?? false,
        tech_platforms:  score.tech_platforms  ?? [],
        tech_details:    score.tech_details    ?? '',
      }
    })
  } catch (err) {
    console.error('Claude API error:', err.message)
    return articles.map(a => ({ ...a, gbv_relevance:5, misogyny_score:3, sentiment:'neutral', tech_facilitated:false, tech_platforms:[], tech_details:'' }))
  }
}

// ── UPDATE MISOGYNY INDEX ─────────────────────────────────────────────────────
async function updateMisogynyIndex(articles: any[]) {
  const relevant = articles.filter(a => a.gbv_relevance >= 5)
  if (!relevant.length) return

  const avgMisogyny = relevant.reduce((sum, a) => sum + a.misogyny_score, 0) / relevant.length
  // Scale 0-10 average to 0-100 index
  const score       = Math.round(avgMisogyny * 10)
  const highAlert   = score >= 60

  await supabase.from('misogyny_index').upsert({
    date:          new Date().toISOString().split('T')[0],
    score,
    article_count: relevant.length,
    high_alert:    highAlert,
  }, { onConflict: 'date' })

  console.log(`Misogyny index updated: ${score}/100 (${relevant.length} articles)`)
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
serve(async () => {
  console.log('RSS scanner starting...')

  try {
    // 1. Fetch all RSS feeds
    const allArticles: any[] = []
    for (const feed of RSS_FEEDS) {
      const articles = await fetchRSS(feed.source, feed.url)
      console.log(`${feed.source}: ${articles.length} articles fetched`)
      allArticles.push(...articles)
    }

    // 2. Filter relevant articles
    const relevant = allArticles.filter(isRelevant)
    console.log(`Relevant articles: ${relevant.length}/${allArticles.length}`)

    if (!relevant.length) {
      return new Response(JSON.stringify({ success: true, message: 'No relevant articles found' }), { status: 200 })
    }

    // 3. Check which URLs already exist in DB
    const urls = relevant.map(a => a.url).filter(Boolean)
    const titles = relevant.map(a => a.title?.slice(0,80)).filter(Boolean)
    const { data: existing } = await supabase
      .from('sentiment_articles')
      .select('article_url')
      .in('article_url', urls)

    const existingUrls = new Set((existing || []).map((e: any) => e.article_url))
    // Deduplicate by title (Google News uses redirect URLs that change)
    const { data: existingTitles } = await supabase
      .from('sentiment_articles')
      .select('article_title')
      .in('article_title', titles.map(t => t))
    const existingTitleSet = new Set((existingTitles || []).map((r:any) => r.article_title?.slice(0,80)))
    const newArticles = relevant.filter(a => 
      !existingUrls.has(a.url) && !existingTitleSet.has(a.title?.slice(0,80))
    )
    // Limit to 25 to stay within Edge Function 60s timeout
    const limited = newArticles.slice(0, 25)
    console.log(`New articles to classify: ${limited.length} (capped from ${newArticles.length})`)

    if (!newArticles.length) {
      return new Response(JSON.stringify({ success: true, message: 'No new articles' }), { status: 200 })
    }

    // 4. Classify in batches of 5 (API rate limits)
    const classified: any[] = []
    for (let i = 0; i < limited.length; i += 5) {
      const batch = limited.slice(i, i + 5)
      const results = await classifyArticles(batch)
      classified.push(...results)
      // Brief pause between batches
      if (i + 5 < newArticles.length) await new Promise(r => setTimeout(r, 1000))
    }

    // 5. Insert into DB (only GBV-relevant ones)
    const toInsert = classified
      .filter(a => a.gbv_relevance >= 4)
      .map(a => ({
        source_name:      a.source,
        source_url:       RSS_FEEDS.find(f => f.source === a.source)?.url || '',
        article_url:      a.url,
        article_title:    a.title,
        article_snippet:  a.snippet,
        published_at:     a.pubDate ? new Date(a.pubDate).toISOString() : null,
        gbv_relevance:    a.gbv_relevance,
        misogyny_score:   a.misogyny_score,
        sentiment:        a.sentiment,
        tech_facilitated: a.tech_facilitated,
        tech_platforms:   a.tech_platforms,
        tech_details:     a.tech_details,
        published:        true,
      }))

    console.log(`Classified: ${classified.length}, GBV>=4: ${classified.filter(a=>a.gbv_relevance>=4).length}, scores: ${JSON.stringify(classified.slice(0,3).map(a=>({t:a.title?.slice(0,30),g:a.gbv_relevance,m:a.misogyny_score})))}`)
    if (toInsert.length) {
      const { error } = await supabase
        .from('sentiment_articles')
        .insert(toInsert)
      if (error) console.error('Insert error:', error.message)
      else console.log(`Inserted ${toInsert.length} articles`)
    }

    // 6. Update daily misogyny index
    await updateMisogynyIndex(classified)

    return new Response(JSON.stringify({
      success: true,
      fetched:    allArticles.length,
      relevant:   relevant.length,
      classified: classified.length,
      inserted:   toInsert.length,
    }), { status: 200 })

  } catch (err) {
    console.error('Scanner error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
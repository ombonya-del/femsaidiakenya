import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''

async function generateBrief(data: any): Promise<string> {
  const prompt = `You are a senior analyst at a Kenyan femicide intelligence platform. Based on the data below, write a sharp, urgent, evidence-based intelligence brief. 

Write in this exact structure:
---OVERVIEW---
2-3 sentences. The number. What moved. What matters.

---MISOGYNY_INDEX---
2-3 sentences. Where the index is, what drove it, media vs community split.

---TOP_INCIDENTS---
3 bullet points. Most significant cases from the case tracker this period.

---SCANNER_CAUGHT---
3 bullet points. Most alarming articles from the intelligence feed.

---MOTD_PATTERN---
2-3 sentences. What the Misogyny of the Day posts this week tell us about the pipeline.

---TECH_FACILITATED---
2-3 sentences. Tech platform patterns in GBV cases.

---COMMUNITY_PULSE---
2-3 sentences. What the X/social conversation looks like this week.

---THE_INSIGHT---
One sharp analytical paragraph (4-5 sentences) connecting all the dots. This is the editorial voice of FemSaidia Kenya. Make it count.

---THE_ASK---
One specific, actionable ask directed at policymakers, funders, or community. One sentence. Bold and direct.

---

DATA:
${JSON.stringify(data, null, 2)}

Write with urgency and precision. Every number is a woman. Every pattern is a warning.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const json = await res.json()
  console.log('Anthropic response status:', res.status)
  console.log('Anthropic response:', JSON.stringify(json).slice(0, 300))
  if (json.error) throw new Error(json.error.message)
  return json.content?.[0]?.text || ''
}

Deno.serve(async (req: Request) => {
  try {
    const now    = new Date()
    const since  = new Date(now.getTime() - 14*24*60*60*1000).toISOString() // 14 days
    const today  = now.toISOString().split('T')[0]
    const weekNo = Math.ceil(now.getDate() / 7)
    const month  = now.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })

    // Fetch all data in parallel
    const [idxRes, artRes, hlRes, caseRes] = await Promise.all([
      supabase.from('misogyny_index').select('*').order('date', { ascending:false }).limit(14),
      supabase.from('sentiment_articles').select('article_title,source_name,misogyny_score,gbv_relevance,sentiment,tech_facilitated,tech_platforms,platform,content_type,scanned_at').gte('scanned_at', since).order('misogyny_score', { ascending:false }).limit(20),
      supabase.from('misogyny_highlights').select('*').eq('active', true).gte('highlight_date', since).order('highlight_date', { ascending:false }).limit(7),
      supabase.from('femicide_cases').select('victim_name,county,incident_date,incident_type,suspect_relationship,tech_facilitated').gte('incident_date', since).order('incident_date', { ascending:false }).limit(10),
    ])

    const index     = idxRes.data || []
    const articles  = artRes.data || []
    const highlights = hlRes.data || []
    const cases     = caseRes.data || []

    // Compute summary stats
    const latestIndex  = index[0]
    const prevIndex    = index[1]
    const highMiso     = articles.filter((a:any) => a.misogyny_score >= 7)
    const techArticles = articles.filter((a:any) => a.tech_facilitated)
    const socialPosts  = articles.filter((a:any) => a.platform === 'x')

    const briefData = {
      period: `${since.split('T')[0]} to ${today}`,
      misogyny_index: {
        current: latestIndex?.score,
        previous: prevIndex?.score,
        delta: latestIndex && prevIndex ? latestIndex.score - prevIndex.score : 0,
        news_score: latestIndex?.news_score,
        social_score: latestIndex?.social_score,
      },
      cases_recorded: cases.length,
      cases: cases.map((c:any) => ({
        county: c.county,
        type: c.incident_type,
        relationship: c.suspect_relationship,
        tech: c.tech_facilitated,
        date: c.incident_date
      })),
      top_articles: highMiso.slice(0,5).map((a:any) => ({
        title: a.article_title,
        source: a.source_name,
        score: a.misogyny_score,
        sentiment: a.sentiment
      })),
      tech_facilitated_count: techArticles.length,
      tech_platforms: [...new Set(techArticles.flatMap((a:any) => a.tech_platforms || []))].slice(0,5),
      social_posts_count: socialPosts.length,
      motd_highlights: highlights.map((h:any) => ({
        platform: h.platform,
        content: h.content.slice(0, 150),
        context: h.context,
        date: h.highlight_date
      })),
      total_articles_scanned: articles.length,
    }

    console.log('Generating brief for:', briefData.period)

    // Generate brief text via Claude
    const briefText = await generateBrief(briefData)
    console.log('Brief generated, length:', briefText.length)

    // Store brief text in Supabase for PDF generation
    const briefRecord = {
      generated_at: now.toISOString(),
      period_start: since.split('T')[0],
      period_end: today,
      title: `FemSaidia Intelligence Brief — ${month} Week ${weekNo}`,
      content: briefText,
      data_snapshot: briefData,
      active: true
    }

    const { data: saved, error } = await supabase
      .from('intel_briefs')
      .insert([briefRecord])
      .select()
      .single()

    if (error) {
      console.error('Save error:', error)
      throw error
    }

    return new Response(JSON.stringify({
      success: true,
      brief_id: saved.id,
      title: briefRecord.title,
      preview: briefText.slice(0, 300)
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })

  } catch (err: any) {
    console.error('Intel brief error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_KEY    = Deno.env.get('ANTHROPIC_API_KEY') || ''
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase         = createClient(SUPABASE_URL, SUPABASE_SERVICE)

Deno.serve(async (req: Request) => {
  try {
    // Get articles with empty summaries - batch of 10
    const { data: articles } = await supabase
      .from('sentiment_articles')
      .select('id, article_title, article_snippet, source_name')
      .or('summary.eq.,summary.is.null')
      .limit(10)

    if (!articles?.length) return new Response(
      JSON.stringify({ success:true, message:'All articles have summaries' }),
      { headers: { 'Content-Type':'application/json' } }
    )

    console.log(`Backfilling ${articles.length} articles`)

    const list = articles.map((a: any, i: number) =>
      `${i+1}. SOURCE: ${a.source_name}\nTITLE: ${a.article_title}\nSNIPPET: ${(a.article_snippet||'').slice(0,300)}`
    ).join('\n\n')

    const prompt = `You are a GBV researcher analysing Kenyan news. For each article return a JSON array.
Each object must have exactly: "index" (1-based integer) and "summary" (1-2 sentences describing what happened, who was affected, and why it matters for GBV tracking in Kenya. For advocacy/opinion pieces, summarise the argument.).

ARTICLES:
${list}

Return ONLY the JSON array. No preamble, no markdown fences.`

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

    const data = await res.json()
    console.log('Claude response type:', data.content?.[0]?.type)
    const raw  = data.content?.[0]?.text || '[]'
    console.log('Raw response (first 200):', raw.slice(0, 200))

    const clean  = raw.replace(/```json|```/g, '').trim()
    const scores = JSON.parse(clean)

    let updated = 0
    for (const s of scores) {
      const article = articles[s.index - 1] as any
      if (!article || !s.summary) continue
      const { error } = await supabase
        .from('sentiment_articles')
        .update({ summary: s.summary })
        .eq('id', article.id)
      if (error) console.error(`Update error for ${article.id}:`, error.message)
      else updated++
    }

    return new Response(
      JSON.stringify({ success: true, updated, total: articles.length, raw: raw.slice(0,100) }),
      { headers: { 'Content-Type':'application/json' } }
    )
  } catch(err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

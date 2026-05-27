import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const BEARER = Deno.env.get('X_BEARER_TOKEN') ?? ''

const HANDLES = [
  'FemicideCountKE','NjeriWaMigwi','VOCALAfrica_','usikimye',
  'NanjalaOK','FemSaidiaKenya','WanjikuRevolt','AkiliDada',
  'AmnestyKenya','KenyaHumanRights',
]

const KEYWORDS = [
  'femicide','gbv','gender','violence','rape','assault','killed','murdered',
  'manosphere','misogyn','woman','women','girl','rights','justice',
  'mwanamke','mke','mama','dada','unyanyasaji','haki'
]

Deno.serve(async (req: Request) => {
  try {
    const results = { fetched:0, relevant:0, inserted:0 }

    for (const handle of HANDLES) {
      const query = encodeURIComponent(`from:${handle} -is:retweet`)
      const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=10&tweet.fields=created_at,text`
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${BEARER}` } })

      if (!res.ok) { console.error(`${handle}: ${res.status}`); continue }
      const data = await res.json()
      const tweets = data.data || []
      results.fetched += tweets.length

      for (const tweet of tweets) {
        const text = tweet.text || ''
        if (!KEYWORDS.some(k => text.toLowerCase().includes(k))) continue
        results.relevant++

        const { error } = await supabase.from('sentiment_articles').upsert({
          source_name: `X / @${handle}`,
          article_title: text.slice(0, 200),
          article_snippet: text,
          article_url: `https://x.com/${handle}/status/${tweet.id}`,
          platform: 'x',
          content_type: 'social_post',
          scanned_at: tweet.created_at || new Date().toISOString(),
          gbv_relevance: 7,
          misogyny_score: 5,
          sentiment: 'negative',
        }, { onConflict: 'article_url' })

        if (!error) results.inserted++
      }
      await new Promise(r => setTimeout(r, 1200))
    }

    console.log(`Poller: ${JSON.stringify(results)}`)
    return new Response(JSON.stringify({ success:true, ...results }), { status:200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status:500 })
  }
})

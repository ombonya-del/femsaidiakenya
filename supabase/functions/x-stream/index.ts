import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req: Request) => {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const crc = url.searchParams.get('crc_token')
    if (crc) {
      const key = Deno.env.get('X_CONSUMER_SECRET') ?? ''
      const encoder = new TextEncoder()
      const cryptoKey = await crypto.subtle.importKey(
        'raw', encoder.encode(key),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      )
      const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(crc))
      const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
      return new Response(
        JSON.stringify({ response_token: `sha256=${b64}` }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()
      console.log('Received body:', JSON.stringify(body).slice(0, 200))
      
      const events = body.tweet_create_events || body.events || []
      console.log('Events count:', events.length)
      
      for (const event of events) {
        const tweet = event.tweet || event
        if (!tweet?.text) continue
        const text = tweet.text || ''
        const user = tweet.author?.username || tweet.user?.screen_name || 'unknown'
        const tweetId = tweet.id || tweet.id_str || Date.now()
        const tweetUrl = `https://x.com/${user}/status/${tweetId}`

        const keywords = ['femicide','killed','gbv','gender','violence','rape','assault','murdered','manosphere','misogyn','patriarchy','mke','mwanamke','unyanyasaji','jeuri']
        if (!keywords.some(k => text.toLowerCase().includes(k))) {
          console.log('Not relevant:', text.slice(0, 50))
          continue
        }

        const { error } = await supabase.from('sentiment_articles').upsert({
          source_name: `X / @${user}`,
          article_title: text.slice(0, 200),
          article_snippet: text,
          article_url: tweetUrl,
          platform: 'x',
          content_type: 'social_post',
          scanned_at: new Date().toISOString(),
          gbv_relevance: 7,
          misogyny_score: 5,
          sentiment: 'negative',
        }, { onConflict: 'article_url' })

        if (error) console.error('DB error:', JSON.stringify(error))
        else console.log('Inserted:', text.slice(0, 50))
      }

      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    } catch (err: any) {
      console.error('Error:', err.message)
      return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
  }

  return new Response('ok', { status: 200 })
})

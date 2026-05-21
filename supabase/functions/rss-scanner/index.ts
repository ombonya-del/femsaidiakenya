import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { url } = await req.json()
    if (!url) return new Response(JSON.stringify({ error: 'No URL provided' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })

    const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_KEY) return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `Fetch this Kenya Law judgment URL and extract fields as JSON only (no preamble, no markdown, no code fences):
URL: ${url}

Return ONLY a JSON object with these exact fields:
{
  "name": "full name or initials of the convicted person (e.g. J.K.M. or John Kamau Mwangi)",
  "alias": "any alias/nickname or null",
  "crime_type": "one of: Murder/Femicide, Rape/Sexual assault, GBV/Assault, Attempted murder, Defilement, Other",
  "conviction_date": "YYYY-MM-DD or null",
  "sentence": "sentence imposed e.g. 35 years imprisonment",
  "case_number": "case number e.g. Criminal Case E002 of 2022",
  "county": "Kenyan county where crime occurred or court is located",
  "status": "one of: Incarcerated, Released, On parole, Deceased, Unknown",
  "court_record_url": "${url}",
  "notes": "one sentence summary of the case"
}`
        }]
      })
    })

    const data = await response.json()

    // Extract text content from response
    const text = data.content
      ?.filter((b: any) => b.type === 'text')
      ?.map((b: any) => b.text)
      ?.join('') || ''

    // Clean and parse JSON
    const clean = text.replace(/```json|```/g, '').trim()

    try {
      const parsed = JSON.parse(clean)
      return new Response(JSON.stringify({ success: true, data: parsed }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      })
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Could not parse AI response', raw: clean }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      })
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  }
})
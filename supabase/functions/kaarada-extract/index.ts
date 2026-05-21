import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS })
  }
  try {
    const { url } = await req.json()
    if (!url) return new Response(JSON.stringify({ error: "No URL" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } })

    const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY")
    if (!ANTHROPIC_KEY) return new Response(JSON.stringify({ error: "No API key" }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } })

    // First: fetch the page content directly
    let pageContent = ""
    try {
      const pageRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
      pageContent = await pageRes.text()
      // Strip HTML tags roughly
      pageContent = pageContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').substring(0, 8000)
    } catch(e) {
      pageContent = "Could not fetch page directly."
    }

    const prompt = `Here is the text content of a Kenya Law court judgment page:

${pageContent}

Extract the following fields and return ONLY a valid JSON object (no preamble, no markdown, no code fences, just the raw JSON):
{
  "name": "full name or initials of the convicted/accused person",
  "alias": "any alias or nickname, or null",
  "crime_type": "one of: Murder/Femicide, Rape/Sexual assault, GBV/Assault, Attempted murder, Defilement, Other",
  "conviction_date": "YYYY-MM-DD format or null",
  "sentence": "the sentence imposed e.g. 35 years imprisonment",
  "case_number": "e.g. Criminal Case E002 of 2022",
  "county": "Kenyan county name",
  "status": "one of: Incarcerated, Released, On parole, Deceased, Unknown",
  "court_record_url": "${url}",
  "notes": "one sentence summary of the case"
}`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }]
      })
    })

    const data = await response.json()
    
    if (data.error) {
      return new Response(JSON.stringify({ success: false, error: data.error.message }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" }
      })
    }

    const text = (data.content || [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")

    // Find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return new Response(JSON.stringify({ success: false, error: "No JSON found in response", raw: text.substring(0, 200) }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" }
      })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...CORS, "Content-Type": "application/json" }
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" }
    })
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Fetch live data
    const [idxRes, artsRes, casesRes] = await Promise.all([
      sb.from("misogyny_index").select("score,date").order("date", { ascending:false }).limit(2),
      sb.from("sentiment_articles").select("is_kibe_related,is_protest,tech_facilitated,misogyny_score", { count:"exact" }).limit(1000),
      sb.from("femicide_cases").select("id,county,status", { count:"exact" }).eq("published", true),
    ])

    const latest = idxRes.data?.[0] || {}
    const prev   = idxRes.data?.[1] || {}
    const arts   = artsRes.data || []
    const cases  = casesRes.data || []

    const score    = latest.score || 51
    const delta    = prev.score ? Math.round((score - prev.score) * 10) / 10 : 0
    const articles = artsRes.count || 0
    const kibe     = arts.filter((a: any) => a.is_kibe_related).length
    const protest  = arts.filter((a: any) => a.is_protest).length
    const techGBV  = arts.filter((a: any) => a.tech_facilitated).length
    const highScore = arts.filter((a: any) => a.misogyny_score >= 8).length
    const femicides = casesRes.count || 0
    const counties  = new Set(cases.map((c: any) => c.county)).size
    const convicted = cases.filter((c: any) => c.status === "convicted").length

    // Call Claude for synthesis
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{
          role: "user",
          content: `You are SaInt — the Saidia Intelligence desk. Write 3 precise sentences for an international funder or policymaker reviewing our 10 project proposals. Make Kenya femicide crisis undeniable and our projects the logical response.

Live data:
- Misogyny Index: ${score}/100 (${delta > 0 ? "+" : ""}${delta} from last week)
- ${articles} articles classified. ${kibe} manosphere-tagged. ${protest} community mobilisation.
- ${techGBV} tech-facilitated GBV cases. ${highScore} scored 8+/10 misogyny.
- ${femicides} femicide cases across ${counties} counties. ${convicted} convictions.

3 sentences only. No fluff. Precise. Urgent.`
        }]
      })
    })

    const claudeData = await claudeRes.json()
    const synthesis = claudeData.content?.[0]?.text || ""

    // Store in saint_synthesis table
    await sb.from("saint_synthesis").insert({
      synthesis,
      score,
      articles_count: articles,
      kibe_count: kibe,
    })

    return new Response(JSON.stringify({ success: true, synthesis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})

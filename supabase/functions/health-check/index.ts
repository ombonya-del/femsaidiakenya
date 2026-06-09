import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
const RESEND_API_KEY    = Deno.env.get("RESEND_API_KEY") ?? ""
const ANTHROPIC_KEY     = Deno.env.get("ANTHROPIC_API_KEY") ?? ""
const ALERT_EMAIL       = "cmt.kenya@gmail.com"
const FROM_EMAIL        = "halafu@femsaidiakenya.org"
const ANON_KEY          = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E"

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE)

interface Check {
  name: string
  ok: boolean
  detail: string
  autoFixed?: boolean
}

// ── AUTO-REMEDIATION ──────────────────────────────────────────────────────────
async function triggerFunction(name: string): Promise<boolean> {
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: "POST",
      headers: { "Content-Type":"application/json", "Authorization":`Bearer ${ANON_KEY}` },
      body: "{}",
      signal: AbortSignal.timeout(55000)
    })
    return r.ok
  } catch { return false }
}

// ── CHECKS ────────────────────────────────────────────────────────────────────
async function checkSites(): Promise<Check[]> {
  const sites = [
    { name:"femsaidiakenya.org",         url:"https://femsaidiakenya.org" },
    { name:"admin.femsaidiakenya.org",   url:"https://admin.femsaidiakenya.org" },
    { name:"hepa.femsaidiakenya.org",    url:"https://hepa.femsaidiakenya.org" },
    { name:"redflag.femsaidiakenya.org", url:"https://redflag.femsaidiakenya.org" },
    { name:"itika.femsaidiakenya.org",   url:"https://itika.femsaidiakenya.org" },
    { name:"saint.femsaidiakenya.org",   url:"https://saint.femsaidiakenya.org" },
  ]
  return Promise.all(sites.map(async s => {
    try {
      const r = await fetch(s.url, { method:"HEAD", signal:AbortSignal.timeout(8000) })
      return { name:s.name, ok:r.ok||r.status===301||r.status===302, detail:`HTTP ${r.status}` }
    } catch(e) {
      return { name:s.name, ok:false, detail:`Unreachable: ${String(e).slice(0,60)}` }
    }
  }))
}

async function checkRssScanner(): Promise<Check> {
  const { data } = await sb.from("sentiment_articles")
    .select("scanned_at").order("scanned_at",{ascending:false}).limit(1)
  if (!data?.[0]) return { name:"RSS Scanner", ok:false, detail:"No articles found" }
  const hoursAgo = (Date.now() - new Date(data[0].scanned_at).getTime()) / 3600000
  if (hoursAgo < 8) return { name:"RSS Scanner", ok:true, detail:`Last scan: ${hoursAgo.toFixed(1)}h ago` }
  // Auto-fix: trigger scanner
  console.log("RSS Scanner stale — auto-triggering...")
  const fixed = await triggerFunction("rss-scanner")
  return { name:"RSS Scanner", ok:fixed, autoFixed:fixed,
    detail: fixed ? `Auto-fixed: triggered scan (was ${hoursAgo.toFixed(1)}h stale)` : `Still stale after retry (${hoursAgo.toFixed(1)}h ago)` }
}

async function checkSaintSynthesis(): Promise<Check> {
  const { data } = await sb.from("saint_synthesis")
    .select("generated_at").order("generated_at",{ascending:false}).limit(1)
  if (!data?.[0]) {
    const fixed = await triggerFunction("saint-synthesis")
    return { name:"SaInt Synthesis", ok:fixed, autoFixed:fixed, detail:fixed?"Auto-fixed: generated first synthesis":"Failed to generate synthesis" }
  }
  const hoursAgo = (Date.now() - new Date(data[0].generated_at).getTime()) / 3600000
  if (hoursAgo < 25) return { name:"SaInt Synthesis", ok:true, detail:`Last generated: ${hoursAgo.toFixed(1)}h ago` }
  const fixed = await triggerFunction("saint-synthesis")
  return { name:"SaInt Synthesis", ok:fixed, autoFixed:fixed,
    detail: fixed ? `Auto-fixed: regenerated (was ${hoursAgo.toFixed(1)}h stale)` : `Still stale after retry (${hoursAgo.toFixed(1)}h ago)` }
}

async function checkPushSubscriptions(): Promise<Check> {
  const { count } = await sb.from("push_subscriptions").select("id",{count:"exact"})
  const n = count ?? 0
  return { name:"Push Subscriptions", ok:n>0, detail:`${n} active subscription${n!==1?"s":""}` }
}

async function checkResponders(): Promise<Check> {
  const { count } = await sb.from("responders").select("id",{count:"exact"}).eq("active",true).eq("verified",true)
  return { name:"Itika Responders", ok:(count??0)>0, detail:`${count??0} active verified responder(s)` }
}

async function checkFemicideCases(): Promise<Check> {
  const { count } = await sb.from("femicide_cases").select("id",{count:"exact"})
  return { name:"Femicide Cases DB", ok:(count??0)>0, detail:`${count??0} cases on record` }
}

async function checkIntelBriefs(): Promise<Check> {
  const { data } = await sb.from("intel_briefs").select("id").eq("active",true)
  return { name:"Intel Briefs", ok:(data?.length??0)>0, detail:`${data?.length??0} active brief(s)` }
}

// ── CLAUDE DIAGNOSIS ──────────────────────────────────────────────────────────
async function getClaudeDiagnosis(checks: Check[]): Promise<string> {
  const failures = checks.filter(c => !c.ok && !c.autoFixed)
  if (failures.length === 0) return ""
  try {
    const prompt = `You are the technical monitor for FemSaidia Kenya — a femicide intelligence and emergency response platform. 
The following health checks have FAILED:
${failures.map(f => `- ${f.name}: ${f.detail}`).join("\n")}

Write exactly 2 sentences: first, a plain-English diagnosis of what likely went wrong. Second, the recommended immediate action for a non-technical team member. Be direct and specific.`
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-api-key":ANTHROPIC_KEY, "anthropic-version":"2023-06-01" },
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:200, messages:[{role:"user",content:prompt}] })
    })
    const d = await r.json()
    return d.content?.[0]?.text ?? ""
  } catch { return "" }
}

// ── EMAIL ─────────────────────────────────────────────────────────────────────
async function sendEmail(checks: Check[], diagnosis: string) {
  const failures  = checks.filter(c => !c.ok)
  const autoFixed = checks.filter(c => c.autoFixed)
  const allGreen  = failures.length === 0
  const now       = new Date().toISOString().slice(0,16).replace("T"," ") + " UTC"

  const rowColor = (c: Check) => c.autoFixed ? "#FFF3CD" : c.ok ? "#F0FFF4" : "#FFF0F0"
  const statusIcon = (c: Check) => c.autoFixed ? "🔧" : c.ok ? "✅" : "❌"

  const statusRows = checks.map(c =>
    `<tr style="background:${rowColor(c)};border-bottom:1px solid #eee">
      <td style="padding:8px 12px;font-size:16px">${statusIcon(c)}</td>
      <td style="padding:8px 12px;font-weight:600;font-size:13px">${c.name}</td>
      <td style="padding:8px 12px;font-size:12px;color:#555">${c.detail}</td>
    </tr>`
  ).join("")

  const subject = allGreen
    ? `✅ FemSaidia — All systems green (${now})`
    : `🚨 FemSaidia Health Alert — ${failures.length} issue(s) (${now})`

  const html = `
<div style="font-family:sans-serif;max-width:620px;margin:0 auto;background:#fff">
  <div style="background:${allGreen?"#1A4A2A":"#8A1030"};padding:20px 24px">
    <h1 style="color:#fff;margin:0;font-size:20px">
      ${allGreen?"✅ All Systems Operational":"🚨 Issues Detected"}
    </h1>
    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:12px">
      FemSaidia Kenya · Health Check · ${now}
    </p>
  </div>

  ${autoFixed.length > 0 ? `
  <div style="background:#FFF8E1;border-left:4px solid #C05010;padding:12px 16px;margin:0">
    <strong style="color:#8A4000">🔧 Auto-remediated ${autoFixed.length} issue(s):</strong><br/>
    ${autoFixed.map(f=>`<span style="color:#5A3000;font-size:12px">• ${f.name}: ${f.detail}</span>`).join("<br/>")}
  </div>` : ""}

  ${failures.length > 0 ? `
  <div style="background:#FFF0F0;border-left:4px solid #8A1030;padding:12px 16px;margin:0">
    <strong style="color:#8A1030">❌ ${failures.length} unresolved issue(s):</strong><br/>
    ${failures.map(f=>`<span style="color:#5A1020;font-size:12px">• ${f.name}: ${f.detail}</span>`).join("<br/>")}
  </div>
  ${diagnosis ? `
  <div style="background:#F8F0F4;border-left:4px solid #8A1030;padding:14px 16px;margin:0">
    <p style="margin:0 0 4px;font-size:10px;font-weight:800;letter-spacing:.1em;color:#8A1030;text-transform:uppercase">
      🤖 AI Diagnosis
    </p>
    <p style="margin:0;font-size:13px;color:#2A0810;line-height:1.7">${diagnosis}</p>
  </div>` : ""}` : ""}

  <table style="width:100%;border-collapse:collapse;margin:0">
    <thead>
      <tr style="background:#F5F0F4">
        <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#8A1030">Status</th>
        <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#8A1030">Component</th>
        <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#8A1030">Detail</th>
      </tr>
    </thead>
    <tbody>${statusRows}</tbody>
  </table>

  <div style="padding:16px 24px;background:#F9F5F7;border-top:1px solid #E8D8E4">
    <p style="margin:0;font-size:10px;color:#999">
      FemSaidia Kenya Intelligence Infrastructure · Auto health check every 6 hours<br/>
      🔧 = Auto-remediated · ✅ = Healthy · ❌ = Needs attention
    </p>
  </div>
</div>`

  await fetch("https://api.resend.com/emails", {
    method:"POST",
    headers:{ "Authorization":`Bearer ${RESEND_API_KEY}`, "Content-Type":"application/json" },
    body: JSON.stringify({ from:FROM_EMAIL, to:ALERT_EMAIL, subject, html })
  })
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
serve(async () => {
  try {
    // Run independent checks in parallel, sequential for auto-fix ones
    const [sites, femicide, intel, subs, responders] = await Promise.all([
      checkSites(),
      checkFemicideCases(),
      checkIntelBriefs(),
      checkPushSubscriptions(),
      checkResponders(),
    ])
    // Auto-fix checks run sequentially (they trigger Edge Functions)
    const rss       = await checkRssScanner()
    const synthesis = await checkSaintSynthesis()

    const all = [...sites, rss, synthesis, subs, responders, femicide, intel]
    const diagnosis = await getClaudeDiagnosis(all)
    await sendEmail(all, diagnosis)

    const failures  = all.filter(c=>!c.ok).length
    const autoFixed = all.filter(c=>c.autoFixed).length
    return new Response(JSON.stringify({
      checked:all.length, ok:all.length-failures, failures, autoFixed,
      timestamp:new Date().toISOString()
    }), { headers:{"Content-Type":"application/json"} })
  } catch(e) {
    return new Response(JSON.stringify({error:String(e)}),{status:500})
  }
})

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
  // Intel brief is produced biweekly (~14 days). Flag if the newest one is stale.
  const { data } = await sb.from("intel_briefs")
    .select("period_end").order("period_end",{ascending:false}).limit(1)
  if (!data?.[0]?.period_end)
    return { name:"Intel Brief Production", ok:false, detail:"No briefs on record — generator may never have run" }
  const daysAgo = (Date.now() - new Date(data[0].period_end).getTime()) / 86400000
  if (daysAgo > 16)
    return { name:"Intel Brief Production", ok:false,
      detail:`Newest brief is ${daysAgo.toFixed(0)} days old — biweekly generation may have stalled` }
  return { name:"Intel Brief Production", ok:true, detail:`Newest brief ${daysAgo.toFixed(0)}d ago` }
}

async function checkSchemaContract(): Promise<Check> {
  // The exact columns the Intel Brief pipeline + shared reads depend on. A
  // renamed/dropped column makes PostgREST 400 the query — the failure that
  // silently broke "Recorded Incidents" (it referenced a column that no longer
  // existed). Catching it here means drift is flagged every 6h, not on a push.
  const cols = "victim_name,county,location,incident_date,incident_type," +
    "perpetrator_relationship,tech_facilitated,tech_platforms,source_url," +
    "status,published,archetype,halafu_lane"
  const { error } = await sb.from("femicide_cases").select(cols).limit(1)
  if (error)
    return { name:"Schema Contract (femicide_cases)", ok:false,
      detail:`Column/schema drift: ${String(error.message).slice(0,140)}` }
  return { name:"Schema Contract (femicide_cases)", ok:true, detail:"All pipeline columns present" }
}

async function checkLiveIncidents(): Promise<Check> {
  // Mirrors the Intel Brief's fetch_live_cases exactly, so a broken incidents
  // query surfaces here instead of as a wrong/stale PDF.
  const { data, error } = await sb.from("femicide_cases")
    .select("victim_name,incident_date")
    .eq("published", true)
    .order("incident_date", { ascending:false, nullsFirst:false })
    .limit(6)
  if (error)
    return { name:"Intel Brief live incidents", ok:false,
      detail:`Query failed: ${String(error.message).slice(0,120)}` }
  if (!data || data.length === 0)
    return { name:"Intel Brief live incidents", ok:false,
      detail:"0 published cases — brief would show none" }
  return { name:"Intel Brief live incidents", ok:true,
    detail:`${data.length} rows; newest ${data[0].incident_date ?? "?"}` }
}

async function checkAdminPushSubs(): Promise<Check> {
  // The Itika loop notifies admins on new registrations + responders en route.
  // Those go to the "itika_admins" push group. If every admin device's
  // subscription has expired (or none ever subscribed), registrations would
  // silently go unseen — so page if the group is empty.
  const { count, error } = await sb.from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("subscription_group", "itika_admins")
  if (error)
    return { name:"Itika admin push", ok:false, detail:`Query failed: ${String(error.message).slice(0,120)}` }
  if ((count ?? 0) === 0)
    return { name:"Itika admin push", ok:false,
      detail:"No admin devices subscribed — new-responder / en-route alerts have nowhere to go. An admin must open the admin app and tap 'Enable admin alerts'." }
  return { name:"Itika admin push", ok:true, detail:`${count} admin device(s) subscribed` }
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


// ── ADVISORY CHECKS (cannot auto-fix — provide exact commands) ────────────────
async function checkVapidKeyConsistency(): Promise<Check & {fixCmd?:string}> {
  const expected = "BOcENhE48dHNQuPWaxsV1rvT_vH7HwRAO6u_CThCP1068nWP5MvDYwQeI43yhEnq6x7SgdpR4mxXqTwPXfYPau0"
  const { count } = await sb.from("push_subscriptions").select("id",{count:"exact",head:true})
  const n = count ?? 0
  // Only a genuine problem worth flagging: NO subscriptions at all (keys unset, or
  // nobody has subscribed). Age is NOT staleness — push subscriptions stay valid for
  // months, and any that actually stop working return 404/410 and are auto-pruned by
  // send-push. So we no longer nag to DELETE the table on age.
  if (n === 0) return { name:"VAPID / Push Config", ok:false,
    detail:"No active push subscriptions — VAPID keys may be unset, or responders haven't subscribed yet",
    fixCmd:`supabase secrets set VAPID_PUBLIC_KEY=${expected}\nsupabase secrets set VAPID_PRIVATE_KEY=<your-private-key>\nsupabase functions deploy send-push\n# then ask responders to reopen Itika so it re-subscribes` }
  return { name:"VAPID / Push Config", ok:true,
    detail:`${n} active subscription${n!==1?"s":""} · dead ones auto-prune on send (404/410)` }
}

async function checkResendConfig(): Promise<Check & {fixCmd?:string}> {
  // Try sending a test to verify Resend is configured
  const key = Deno.env.get("RESEND_API_KEY") ?? ""
  if (!key) return { name:"Resend Email Config", ok:false,
    detail:"RESEND_API_KEY secret not set",
    fixCmd:"supabase secrets set RESEND_API_KEY=re_YOUR_KEY_HERE" }
  return { name:"Resend Email Config", ok:true, detail:"API key configured" }
}

async function checkAnthropicConfig(): Promise<Check & {fixCmd?:string}> {
  const key = Deno.env.get("ANTHROPIC_API_KEY") ?? ""
  if (!key) return { name:"Anthropic API Config", ok:false,
    detail:"ANTHROPIC_API_KEY secret not set — AI diagnosis disabled",
    fixCmd:"supabase secrets set ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE" }
  return { name:"Anthropic API Config", ok:true, detail:"API key configured" }
}

async function checkHepaTimerWiring(): Promise<Check & {fixCmd?:string}> {
  // Check if recent responder_alerts have been created (indicator hepa is firing)
  const { data } = await sb.from("responder_alerts")
    .select("created_at,alert_type").order("created_at",{ascending:false}).limit(5)
  if (!data?.length) return { name:"hepa Alert Wiring", ok:false,
    detail:"No responder alerts recorded — hepa panic/timer may not be wired",
    fixCmd:"// Check hepa/src/App.jsx for send-push calls after responder_alerts insert" }
  const latest = data[0]
  const hoursAgo = (Date.now() - new Date(latest.created_at).getTime()) / 3600000
  return { name:"hepa Alert Activity", ok:true,
    detail:`Last alert: ${hoursAgo.toFixed(1)}h ago (${latest.alert_type})` }
}


// ── EMAIL V3 — auto-fix + advisory + Claude diagnosis ────────────────────────
async function sendEmailV3(checks: Check[], advisory: (Check & {fixCmd?:string})[], diagnosis: string) {
  const failures  = checks.filter(c => !c.ok)
  const autoFixed = checks.filter(c => c.autoFixed)
  const warnings  = advisory.filter(c => !c.ok)
  const allGreen  = failures.length === 0 && warnings.length === 0
  const now       = new Date().toISOString().slice(0,16).replace("T"," ") + " UTC"

  const rowColor  = (c: Check) => c.autoFixed ? "#FFF8E1" : c.ok ? "#F0FFF4" : "#FFF0F0"
  const statusIcon = (c: Check) => c.autoFixed ? "🔧" : c.ok ? "✅" : "❌"

  const statusRows = checks.map(c =>
    `<tr style="background:${rowColor(c)};border-bottom:1px solid #eee">
      <td style="padding:8px 12px;font-size:16px">${statusIcon(c)}</td>
      <td style="padding:8px 12px;font-weight:600;font-size:13px">${c.name}</td>
      <td style="padding:8px 12px;font-size:12px;color:#555">${c.detail}</td>
    </tr>`
  ).join("")

  const advisoryRows = advisory.map(c =>
    `<tr style="background:${c.ok?"#F0FFF4":"#FFFBEA"};border-bottom:1px solid #eee">
      <td style="padding:8px 12px;font-size:16px">${c.ok?"✅":"⚠️"}</td>
      <td style="padding:8px 12px;font-weight:600;font-size:13px">${c.name}</td>
      <td style="padding:8px 12px;font-size:12px;color:#555">
        ${c.detail}
        ${!c.ok && c.fixCmd ? `<br/><code style="font-size:10px;background:#1A2035;color:#C8F0A0;padding:6px 8px;display:block;margin-top:6px;white-space:pre-wrap">${c.fixCmd}</code>` : ""}
      </td>
    </tr>`
  ).join("")

  const subject = allGreen
    ? `✅ FemSaidia — All systems green (${now})`
    : failures.length > 0
      ? `🚨 FemSaidia Health Alert — ${failures.length} failure(s), ${warnings.length} warning(s) (${now})`
      : `⚠️ FemSaidia Health Check — ${warnings.length} advisory item(s) (${now})`

  const html = `
<div style="font-family:sans-serif;max-width:640px;margin:0 auto;background:#fff">
  <div style="background:${allGreen?"#1A4A2A":failures.length>0?"#8A1030":"#7A4A00"};padding:20px 24px">
    <h1 style="color:#fff;margin:0;font-size:20px">
      ${allGreen?"✅ All Systems Operational":failures.length>0?"🚨 Failures Detected":"⚠️ Advisory Items"}
    </h1>
    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:12px">
      FemSaidia Kenya · Health Check · ${now}
    </p>
  </div>

  ${autoFixed.length > 0 ? `
  <div style="background:#FFF8E1;border-left:4px solid #C05010;padding:12px 16px">
    <strong style="color:#8A4000;font-size:13px">🔧 Auto-remediated ${autoFixed.length} issue(s):</strong><br/>
    ${autoFixed.map(f=>`<span style="color:#5A3000;font-size:12px">• ${f.name}: ${f.detail}</span>`).join("<br/>")}
  </div>` : ""}

  ${failures.length > 0 ? `
  <div style="background:#FFF0F0;border-left:4px solid #8A1030;padding:12px 16px">
    <strong style="color:#8A1030;font-size:13px">❌ ${failures.length} unresolved failure(s):</strong><br/>
    ${failures.map(f=>`<span style="color:#5A1020;font-size:12px">• ${f.name}: ${f.detail}</span>`).join("<br/>")}
  </div>
  ${diagnosis ? `
  <div style="background:#F8F0F4;border-left:4px solid #8A1030;padding:14px 16px">
    <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:.1em;color:#8A1030;text-transform:uppercase">🤖 AI Diagnosis</p>
    <p style="margin:0;font-size:13px;color:#2A0810;line-height:1.7">${diagnosis}</p>
  </div>` : ""}` : ""}

  <h3 style="margin:16px 24px 4px;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#8A1030">System Health</h3>
  <table style="width:100%;border-collapse:collapse">
    <thead><tr style="background:#F5F0F4">
      <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#8A1030;width:40px">Status</th>
      <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#8A1030">Component</th>
      <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#8A1030">Detail</th>
    </tr></thead>
    <tbody>${statusRows}</tbody>
  </table>

  <h3 style="margin:16px 24px 4px;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#7A5A00">Advisory & Housekeeping</h3>
  <table style="width:100%;border-collapse:collapse">
    <tbody>${advisoryRows}</tbody>
  </table>

  <div style="padding:14px 24px;background:#F9F5F7;border-top:1px solid #E8D8E4;margin-top:8px">
    <p style="margin:0;font-size:10px;color:#999">
      FemSaidia Kenya Intelligence Infrastructure · Auto health check every 6 hours<br/>
      🔧 Auto-remediated · ✅ Healthy · ⚠️ Advisory · ❌ Needs attention
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
    const [sites, femicide, intel, subs, responders, schema, liveInc, adminPush] = await Promise.all([
      checkSites(),
      checkFemicideCases(),
      checkIntelBriefs(),
      checkPushSubscriptions(),
      checkResponders(),
      checkSchemaContract(),
      checkLiveIncidents(),
      checkAdminPushSubs(),
    ])
    const rss       = await checkRssScanner()
    const synthesis = await checkSaintSynthesis()

    // Advisory checks
    const [vapid, resend, anthropic, hepaWiring] = await Promise.all([
      checkVapidKeyConsistency(),
      checkResendConfig(),
      checkAnthropicConfig(),
      checkHepaTimerWiring(),
    ])

    const all      = [...sites, rss, synthesis, subs, responders, femicide, intel, schema, liveInc, adminPush]
    const advisory = [vapid, resend, anthropic, hepaWiring]
    const diagnosis = await getClaudeDiagnosis(all)
    await sendEmailV3(all, advisory, diagnosis)

    const failures  = all.filter(c=>!c.ok).length
    const autoFixed = all.filter(c=>c.autoFixed).length
    const warnings  = advisory.filter(c=>!c.ok).length
    return new Response(JSON.stringify({
      checked:all.length, ok:all.length-failures, failures, autoFixed, warnings,
      timestamp:new Date().toISOString()
    }), { headers:{"Content-Type":"application/json"} })
  } catch(e) {
    return new Response(JSON.stringify({error:String(e)}),{status:500})
  }
})

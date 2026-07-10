import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "npm:web-push"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Targeted web-push sender for the Itika responder network.
//
// Recipients are selected by any combination of:
//   county        — everyone subscribed in that county (HEPA incident alerts)
//   group         — a subscription_group, e.g. "itika_admins" / "itika_responders"
//   responder_id  — a single responder (e.g. their activation confirmation)
//
// The payload is real JSON { title, body, tag } so the service worker renders
// the actual message (registration / activation / response / incident) instead
// of one hardcoded string. Back-compat: if no title/body is sent, the SW falls
// back to its emergency-alert default.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const { county, group, responder_id, title, body, tag } = await req.json()

    const pubKey  = Deno.env.get("VAPID_PUBLIC_KEY") ?? ""
    const privKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? ""
    webpush.setVapidDetails("mailto:halafu@femsaidiakenya.org", pubKey, privKey)

    const sb = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    let q = sb.from("push_subscriptions").select("*")
    if (county && county !== "all") q = q.eq("county", county)
    if (group)        q = q.eq("subscription_group", group)
    if (responder_id) q = q.eq("responder_id", responder_id)
    const { data: subs } = await q

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscribers" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      })
    }

    const payload = JSON.stringify({
      title: title || "Itika",
      body:  body  || "",
      tag:   tag   || "itika",
    })

    let sent = 0
    const errors: string[] = []
    for (const s of subs) {
      try {
        const sub = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }
        await webpush.sendNotification(sub, payload, { TTL: 60 })
        sent++
      } catch (e: any) {
        errors.push(String(e.statusCode ?? e.message))
        if (e.statusCode === 410 || e.statusCode === 404) {
          await sb.from("push_subscriptions").delete().eq("id", s.id)
        }
      }
    }

    return new Response(JSON.stringify({ sent, total: subs.length, errors }), {
      headers: { ...cors, "Content-Type": "application/json" },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    })
  }
})

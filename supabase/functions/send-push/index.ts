import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Web Push via VAPID
async function sendWebPush(subscription: any, payload: string, vapidPublic: string, vapidPrivate: string) {
  // Use web-push compatible approach via Deno
  const endpoint = subscription.endpoint
  const p256dh   = subscription.p256dh
  const auth     = subscription.auth

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "TTL": "60",
    },
    body: payload,
  })
  return res.status
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const { county, group, title, body, data } = await req.json()
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Get matching subscriptions
    let query = sb.from("push_subscriptions").select("*")
    if (county && county !== "all") {
      query = query.eq("county", county)
    }
    if (group) {
      query = query.eq("subscription_group", group)
    }

    const { data: subs } = await query

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const payload = JSON.stringify({ title, body, data: data || {} })
    let sent = 0

    // Send to all matching subscriptions
    for (const sub of subs) {
      try {
        await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "TTL": "60",
            "Urgency": "high",
          },
          body: payload,
        })
        sent++
      } catch(e) {
        // Remove dead subscriptions
        await sb.from("push_subscriptions").delete().eq("id", sub.id)
      }
    }

    return new Response(JSON.stringify({ sent, total: subs.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  } catch(e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})

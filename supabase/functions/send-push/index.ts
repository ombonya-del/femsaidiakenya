import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Base64url encode
function base64urlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// Base64url decode  
function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
  const binary = atob(padded)
  return new Uint8Array(binary.split('').map(c => c.charCodeAt(0)))
}

// Generate VAPID JWT
async function generateVapidJWT(audience: string, subject: string, vapidPrivateKeyB64: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' }
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 43200, // 12 hours
    sub: subject,
  }

  const encodedHeader  = base64urlEncode(new TextEncoder().encode(JSON.stringify(header)))
  const encodedPayload = base64urlEncode(new TextEncoder().encode(JSON.stringify(payload)))
  const signingInput   = `${encodedHeader}.${encodedPayload}`

  // Import VAPID private key (raw EC private key, 32 bytes)
  const rawKey = base64urlDecode(vapidPrivateKeyB64)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  ).catch(async () => {
    // Try pkcs8 format
    return await crypto.subtle.importKey(
      'pkcs8',
      rawKey,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    )
  })

  // Use ECDSA for signing
  const signingKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  ).catch(async () => {
    // jwk format fallback
    const jwk = {
      kty: 'EC', crv: 'P-256',
      d: vapidPrivateKeyB64,
      x: '', y: '',
      key_ops: ['sign'],
      ext: true
    }
    return await crypto.subtle.importKey('jwk', jwk, { name:'ECDSA', namedCurve:'P-256' }, false, ['sign'])
  })

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    signingKey,
    new TextEncoder().encode(signingInput)
  )

  return `${signingInput}.${base64urlEncode(new Uint8Array(signature))}`
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const { county, group, title, body, data } = await req.json()
    
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const vapidPublicKey  = Deno.env.get("VAPID_PUBLIC_KEY")  || ""
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || ""
    const vapidSubject    = "mailto:halafu@femsaidiakenya.org"

    // Get matching subscriptions
    let query = sb.from("push_subscriptions").select("*")
    if (county && county !== "all") query = query.eq("county", county)
    if (group)  query = query.eq("subscription_group", group)

    const { data: subs } = await query
    if (!subs?.length) {
      return new Response(JSON.stringify({ sent:0, message:"No subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const payload = JSON.stringify({
      title:  title  || "🚨 FemSaidia Alert",
      body:   body   || "A new emergency alert has been dispatched.",
      icon:   "/icon-192.png",
      badge:  "/icon-192.png",
      data:   data   || {},
      tag:    "itika-alert",
      renotify: true,
      requireInteraction: true,
    })

    let sent = 0
    const errors: string[] = []

    for (const sub of subs) {
      try {
        const url      = new URL(sub.endpoint)
        const audience = `${url.protocol}//${url.host}`
        const jwt      = await generateVapidJWT(audience, vapidSubject, vapidPrivateKey)

        const res = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type":  "application/json",
            "TTL":           "60",
            "Urgency":       "high",
            "Authorization": `vapid t=${jwt},k=${vapidPublicKey}`,
          },
          body: payload,
        })

        if (res.ok || res.status === 201) {
          sent++
        } else {
          const errText = await res.text()
          errors.push(`${res.status}: ${errText.slice(0,100)}`)
          // Remove dead subscriptions (410 Gone)
          if (res.status === 410 || res.status === 404) {
            await sb.from("push_subscriptions").delete().eq("id", sub.id)
          }
        }
      } catch(e) {
        errors.push(String(e))
      }
    }

    return new Response(JSON.stringify({ sent, total: subs.length, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch(e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})

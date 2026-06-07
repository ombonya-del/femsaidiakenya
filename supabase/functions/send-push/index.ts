import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function b64u(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")
}
function db64u(s: string): Uint8Array {
  const b = s.replace(/-/g,"+").replace(/_/g,"/")
  const p = b + "==".slice(0,(4-b.length%4)%4)
  return new Uint8Array(atob(p).split("").map(c=>c.charCodeAt(0)))
}

async function vapidJWT(audience: string, sub: string, pubKey: string, privKey: string): Promise<string> {
  const hdr = b64u(new TextEncoder().encode(JSON.stringify({typ:"JWT",alg:"ES256"})))
  const pay = b64u(new TextEncoder().encode(JSON.stringify({aud:audience,exp:Math.floor(Date.now()/1000)+43200,sub})))
  const msg = `${hdr}.${pay}`
  // Build JWK from raw private key + uncompressed public key
  const pub = db64u(pubKey) // 65 bytes: 04 || x || y
  const jwk = {kty:"EC",crv:"P-256",
    d: privKey,
    x: b64u(pub.slice(1,33)),
    y: b64u(pub.slice(33,65)),
    key_ops:["sign"],ext:true}
  const key = await crypto.subtle.importKey("jwk", jwk, {name:"ECDSA",namedCurve:"P-256"}, false, ["sign"])
  const sig = await crypto.subtle.sign({name:"ECDSA",hash:{name:"SHA-256"}}, key, new TextEncoder().encode(msg))
  return `${msg}.${b64u(new Uint8Array(sig))}`
}

serve(async (req) => {
  if (req.method==="OPTIONS") return new Response("ok",{headers:corsHeaders})
  try {
    const {county,group,title,body,data} = await req.json()
    const pubKey  = Deno.env.get("VAPID_PUBLIC_KEY") || ""
    const privKey = Deno.env.get("VAPID_PRIVATE_KEY") || ""
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
    let q = sb.from("push_subscriptions").select("*")
    if (county && county!=="all") q = q.eq("county",county)
    if (group) q = q.eq("subscription_group",group)
    const {data:subs} = await q
    if (!subs?.length) return new Response(JSON.stringify({sent:0,message:"No subscribers"}),{headers:{...corsHeaders,"Content-Type":"application/json"}})
    const payload = JSON.stringify({title:title||"Itika Alert",body:body||"New emergency alert",icon:"/icon-192.png",tag:"itika-alert",renotify:true,requireInteraction:true,data:data||{}})
    let sent=0; const errors:string[]=[]
    for (const s of subs) {
      try {
        const url = new URL(s.endpoint)
        const aud = `${url.protocol}//${url.host}`
        const jwt = await vapidJWT(aud,"mailto:halafu@femsaidiakenya.org",pubKey,privKey)
        // Send ping (no body) — Chrome requires encryption for payload
        // Service worker shows default notification on push event
        const res = await fetch(s.endpoint,{method:"POST",headers:{"TTL":"60","Urgency":"high","Content-Length":"0","Authorization":`vapid t=${jwt},k=${pubKey}`}})
        if (res.ok||res.status===201||res.status===202) { sent++ }
        else { const t=await res.text(); errors.push(`${res.status}:${t.slice(0,80)}`); if(res.status===410||res.status===404) await sb.from("push_subscriptions").delete().eq("id",s.id) }
      } catch(e) { errors.push(String(e)) }
    }
    return new Response(JSON.stringify({sent,total:subs.length,errors}),{headers:{...corsHeaders,"Content-Type":"application/json"}})
  } catch(e) {
    return new Response(JSON.stringify({error:String(e)}),{status:500,headers:{...corsHeaders,"Content-Type":"application/json"}})
  }
})

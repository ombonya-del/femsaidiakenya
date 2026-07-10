import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Itika responder auth gateway.
//
// The itika PWA logs volunteers in by phone number. Previously it read the
// `responders` table directly with the anon key, which meant anyone with the
// public key could dump every responder's name + phone. This function is the
// only path that reads `responders`: it runs with the service-role key (so the
// table can be locked to anon) and returns EXACTLY ONE record — the phone/id
// asked for — so there is no way to enumerate the table.
//
// Note: this stops the bulk leak. Phone-number-as-identifier remains; adding an
// SMS OTP step here later would make it true authentication.

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL") ?? ""
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Only the fields the app needs — never `select('*')` (that would re-expose
// internal columns like admin notes).
const FIELDS = "id,full_name,phone,county,organisation,role,skills,verified,active,created_at"

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status, headers: { ...CORS, "Content-Type": "application/json" },
    })

  try {
    const { action, phone, id } = await req.json().catch(() => ({}))

    if (action === "login") {
      const clean = String(phone ?? "").replace(/\s/g, "")
      if (!clean) return json({ error: "Phone required" }, 400)
      const { data, error } = await sb.from("responders")
        .select(FIELDS).eq("phone", clean).limit(1).maybeSingle()
      if (error) return json({ error: error.message }, 500)
      if (!data) return json({ error: "not_found" }, 404)
      return json({ responder: data })
    }

    if (action === "restore") {
      const rid = String(id ?? "")
      if (!rid) return json({ error: "id required" }, 400)
      const { data, error } = await sb.from("responders")
        .select(FIELDS).eq("id", rid).limit(1).maybeSingle()
      if (error) return json({ error: error.message }, 500)
      if (!data) return json({ error: "not_found" }, 404)
      return json({ responder: data })
    }

    return json({ error: "Unknown action" }, 400)
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

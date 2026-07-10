import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uuluuhltphgwfblcghlp.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E'
const SEND_PUSH = `${SUPABASE_URL}/functions/v1/send-push`
const VAPID = 'BOcENhE48dHNQuPWaxsV1rvT_vH7HwRAO6u_CThCP1068nWP5MvDYwQeI43yhEnq6x7SgdpR4mxXqTwPXfYPau0'

const sb = createClient(SUPABASE_URL, ANON_KEY)

// ── PALETTE ──────────────────────────────────────────────────────────────────
const BG='#071A0F', SURF='#0A2A1A', CARD='#0F3A22', GRN='#1A6A3A', BGRN='#2A9A5A'
const TXT='#E8F5EE', MUT='#7AAA8A', BD='#1A4A2A', RED='#CC1010', GOLD='#CA8A04'

const font = "'Nunito Sans',sans-serif"
const serif = "'Lora',serif"

function pushNotify(payload) {
  return fetch(SEND_PUSH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
               'Authorization': `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
    body: JSON.stringify(payload),
  }).catch(() => {})
}

export default function App() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!ready) return <Center>Loading…</Center>
  return session ? <Dashboard session={session} /> : <Login />
}

function Center({ children }) {
  return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center',
      justifyContent:'center', color:MUT, fontFamily:font, fontSize:14 }}>{children}</div>
  )
}

// ── LOGIN (OTP magic link) ────────────────────────────────────────────────────
function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  const sendLink = async () => {
    if (!email.trim()) return
    setStatus('sending')
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setStatus(error ? 'error' : 'sent')
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center',
      justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:360, textAlign:'center' }}>
        <div style={{ fontSize:44, marginBottom:12 }}>🛰️</div>
        <h1 style={{ fontFamily:serif, fontSize:30, fontWeight:700, color:TXT, marginBottom:6 }}>Itika Command</h1>
        <p style={{ fontFamily:font, fontSize:13, color:MUT, lineHeight:1.6, marginBottom:28 }}>
          Coordinator sign-in. A one-time link will be emailed to you.
        </p>
        {status === 'sent' ? (
          <div style={{ background:SURF, border:`1px solid ${BD}`, padding:20, color:TXT, fontFamily:font, fontSize:14, lineHeight:1.7 }}>
            ✅ Check <strong>{email}</strong> for your sign-in link, then open it on this device.
          </div>
        ) : (
          <>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="coordinator@femsaidiakenya.org" autoComplete="email"
              style={{ width:'100%', padding:'14px', background:SURF, border:`1px solid ${BD}`,
                color:TXT, fontSize:15, marginBottom:12, outline:'none' }}/>
            <button onClick={sendLink} disabled={status==='sending'}
              style={{ width:'100%', padding:14, background:GRN, color:'#fff', border:'none',
                fontSize:15, fontWeight:700, cursor:'pointer' }}>
              {status==='sending' ? 'Sending…' : 'Email me a sign-in link'}
            </button>
            {status==='error' && <p style={{ color:RED, fontFamily:font, fontSize:12, marginTop:10 }}>Could not send — check the address and try again.</p>}
          </>
        )}
        <p style={{ fontFamily:font, fontSize:10, color:MUT, marginTop:20, lineHeight:1.6 }}>
          Access is limited to authorised FemSaidia coordinators. Responder data is protected by row-level security.
        </p>
      </div>
    </div>
  )
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ session }) {
  const [responders, setResponders] = useState([])
  const [alerts, setAlerts] = useState([])
  const [pushState, setPushState] = useState('idle')
  const [busy, setBusy] = useState(null)

  const load = () => {
    sb.from('responders').select('*').order('created_at',{ascending:false})
      .then(({ data }) => setResponders(data || []))
    sb.from('responder_alerts').select('*').order('created_at',{ascending:false}).limit(15)
      .then(({ data }) => setAlerts(data || []))
  }
  // Reflect an existing push subscription on load, so a refresh doesn't reset
  // the button to "Enable…" when this device is already subscribed.
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    navigator.serviceWorker.getRegistration()
      .then(reg => reg?.pushManager?.getSubscription())
      .then(s => { if (s) setPushState('enabled') })
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
    const i = setInterval(load, 20000)
    const onVis = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(i); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  const enableAlerts = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) { setPushState('unsupported'); return }
      setPushState('working')
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setPushState('denied'); return }
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:VAPID })
      const j = sub.toJSON()
      const { error } = await sb.from('push_subscriptions').upsert({
        endpoint:j.endpoint, p256dh:j.keys?.p256dh, auth:j.keys?.auth,
        county:null, subscription_group:'itika_admins', responder_id:null,
      }, { onConflict:'endpoint' })
      setPushState(error ? 'error' : 'enabled')
    } catch (e) { setPushState('error') }
  }

  const activate = async (r) => {
    setBusy(r.id)
    await sb.from('responders').update({ verified:true, active:true }).eq('id', r.id)
    pushNotify({ responder_id:r.id, title:"You're activated on Itika",
      body:"Your responder account is active — you'll now receive alerts in your county.", tag:'itika' })
    setBusy(null); load()
  }

  const reject = async (r) => {
    if (!window.confirm(`Remove ${r.full_name}? This deletes their registration.`)) return
    setBusy(r.id)
    // Clear child rows first (foreign keys) then the responder, or the delete
    // is blocked for anyone who has already responded to alerts.
    await sb.from('responder_responses').delete().eq('responder_id', r.id)
    await sb.from('responder_alerts').delete().eq('responder_id', r.id)
    await sb.from('push_subscriptions').delete().eq('responder_id', r.id)
    const { error } = await sb.from('responders').delete().eq('id', r.id)
    if (error) alert('Remove failed: ' + error.message)
    setBusy(null); load()
  }

  const pending = responders.filter(r => !r.verified || !r.active)
  const active  = responders.filter(r => r.verified && r.active)

  return (
    <div style={{ minHeight:'100vh', background:BG, color:TXT, fontFamily:font, paddingBottom:40 }}>
      {/* Header */}
      <div style={{ position:'sticky', top:0, zIndex:5, background:SURF, borderBottom:`2px solid ${GRN}`,
        padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontFamily:serif, fontSize:19, fontWeight:700 }}>Itika Command 🛰️</div>
          <div style={{ fontSize:10, color:MUT }}>{session.user?.email}</div>
        </div>
        <button onClick={()=>sb.auth.signOut()} style={{ background:'none', border:`1px solid ${BD}`,
          color:MUT, fontSize:11, fontWeight:700, padding:'7px 12px', cursor:'pointer' }}>Sign out</button>
      </div>

      <div style={{ maxWidth:560, margin:'0 auto', padding:'16px' }}>
        {/* Enable push */}
        <button onClick={enableAlerts} disabled={pushState==='working'||pushState==='enabled'}
          style={{ width:'100%', padding:'12px', marginBottom:16, border:`1px solid ${GRN}`,
            cursor: pushState==='enabled'?'default':'pointer', fontSize:13, fontWeight:700,
            background: pushState==='enabled'?GRN:CARD, color: pushState==='enabled'?'#fff':BGRN }}>
          {pushState==='enabled' ? '🔔 Alerts enabled on this device'
            : pushState==='working' ? 'Enabling…'
            : pushState==='denied' ? '🔕 Blocked — allow notifications in your browser'
            : pushState==='unsupported' ? 'Push not supported on this browser'
            : pushState==='error' ? '⚠ Failed — tap to retry'
            : '🔔 Enable dispatch alerts on this device'}
        </button>

        {/* Stats */}
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          <Stat n={pending.length} label="Awaiting review" color={GOLD}/>
          <Stat n={active.length}  label="Active responders" color={BGRN}/>
          <Stat n={alerts.filter(a=>a.status==='active').length} label="Open alerts" color={RED}/>
        </div>

        {/* Pending queue */}
        <Section title={`Awaiting review (${pending.length})`}>
          {pending.length === 0 && <Empty>No responders waiting. You're all caught up.</Empty>}
          {pending.map(r => (
            <div key={r.id} style={{ background:CARD, border:`1px solid ${BD}`, padding:'13px 14px', marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8 }}>
                <div style={{ fontSize:15, fontWeight:700 }}>{r.full_name}</div>
                <div style={{ fontSize:10, color:GOLD }}>{!r.verified ? 'UNVERIFIED' : 'INACTIVE'}</div>
              </div>
              <div style={{ fontSize:12, color:MUT, marginTop:3 }}>
                {r.role || 'Responder'} · {r.county} · {r.phone}
              </div>
              {Array.isArray(r.skills) && r.skills.length > 0 && (
                <div style={{ fontSize:11, color:MUT, marginTop:5, fontStyle:'italic' }}>{r.skills.join(' · ')}</div>
              )}
              <div style={{ display:'flex', gap:8, marginTop:11 }}>
                <button onClick={()=>activate(r)} disabled={busy===r.id}
                  style={{ flex:1, padding:'10px', background:GRN, color:'#fff', border:'none',
                    fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  {busy===r.id ? '…' : '✓ Verify & activate'}
                </button>
                <button onClick={()=>reject(r)} disabled={busy===r.id}
                  style={{ padding:'10px 14px', background:'none', color:RED, border:`1px solid ${RED}`,
                    fontSize:13, fontWeight:700, cursor:'pointer' }}>Remove</button>
              </div>
            </div>
          ))}
        </Section>

        {/* Recent alerts */}
        <Section title={`Recent alerts (${alerts.length})`}>
          {alerts.length === 0 && <Empty>No alerts yet.</Empty>}
          {alerts.map(a => {
            const mins = Math.floor((Date.now() - new Date(a.created_at)) / 60000)
            const age = mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h`
            const col = { active:RED, responded:GOLD, resolved:BGRN }[a.status] || MUT
            return (
              <div key={a.id} style={{ background:SURF, border:`1px solid ${BD}`,
                borderLeft:`3px solid ${col}`, padding:'10px 13px', marginBottom:6,
                display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700 }}>{a.county || 'Unknown county'}</div>
                  <div style={{ fontSize:10, color:MUT }}>{a.status || 'active'} · {age} ago</div>
                </div>
                <div style={{ fontSize:10, fontWeight:700, color:col, textTransform:'uppercase' }}>{a.status || 'active'}</div>
              </div>
            )
          })}
        </Section>

        {/* Active responders */}
        <Section title={`Active responders (${active.length})`}>
          {active.length === 0 && <Empty>No active responders yet.</Empty>}
          {active.map(r => (
            <div key={r.id} style={{ background:SURF, border:`1px solid ${BD}`, padding:'10px 13px', marginBottom:6,
              display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700 }}>{r.full_name}</div>
                <div style={{ fontSize:10, color:MUT }}>{r.role || 'Responder'} · {r.county}</div>
              </div>
              <button onClick={()=>sb.from('responders').update({active:false}).eq('id',r.id).then(load)}
                style={{ background:'none', border:`1px solid ${BD}`, color:MUT, fontSize:10,
                  fontWeight:700, padding:'6px 10px', cursor:'pointer' }}>Deactivate</button>
            </div>
          ))}
        </Section>
      </div>
    </div>
  )
}

function Stat({ n, label, color }) {
  return (
    <div style={{ flex:1, background:SURF, border:`1px solid ${BD}`, padding:'12px 10px', textAlign:'center' }}>
      <div style={{ fontFamily:serif, fontSize:26, fontWeight:700, color }}>{n}</div>
      <div style={{ fontSize:9, color:MUT, letterSpacing:'.04em', textTransform:'uppercase', marginTop:3 }}>{label}</div>
    </div>
  )
}
function Section({ title, children }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.12em', textTransform:'uppercase',
        color:BGRN, marginBottom:10 }}>{title}</div>
      {children}
    </div>
  )
}
function Empty({ children }) {
  return <div style={{ fontSize:12, color:MUT, fontStyle:'italic', padding:'8px 0' }}>{children}</div>
}

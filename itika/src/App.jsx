import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://uuluuhltphgwfblcghlp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E'
)

// ── PALETTE ──────────────────────────────────────────────────────────────────
const BG   = '#071A0F'
const SURF = '#0A2A1A'
const CARD = '#0F3A22'
const GRN  = '#1A6A3A'
const BGRN = '#2A9A5A'
const TXT  = '#E8F5EE'
const MUT  = '#7AAA8A'
const BD   = '#1A4A2A'
const RED  = '#CC1010'
const AMB  = '#CA8A04'

const ROLES = [
  'Boda-boda rider',
  'Social worker',
  'Community health worker',
  'SRHR advocate',
  'Paralegal / legal aid',
  'Nurse / clinical officer',
  'Faith leader',
  'Community elder',
  'Organisation staff',
  'Other',
]

const COUNTIES = [
  'Nairobi','Kiambu','Mombasa','Nakuru','Kisumu','Kajiado','Kwale',
  "Machakos","Murang'a",'Kilifi','Uasin Gishu','Trans Nzoia','Meru',
  'Kakamega','Nyeri','Nandi','Embu','Kirinyaga','Bungoma','Homa Bay',
  'Siaya','Migori','Kisii','Nyamira','Kericho','Bomet','Narok',
  'Laikipia','Nyandarua','Muranga','Tharaka Nithi','Isiolo','Marsabit',
  'Samburu','Turkana','West Pokot','Baringo','Elgeyo Marakwet',
  'Vihiga','Siaya','Busia','Tana River','Lamu','Taita Taveta',
  'Garissa','Wajir','Mandera','Mombasa','Kwale','Kilifi','Other'
]

// ── REGISTRATION SCREEN ───────────────────────────────────────────────────────
function RegisterScreen({ onDone }) {
  const [step,    setStep]    = useState(1)
  const [form,    setForm]    = useState({
    full_name:'', phone:'', county:'Nairobi', role:'Boda-boda rider',
    organisation:'', skills:[], notes:''
  })
  const [sending, setSending] = useState(false)
  const [done,    setDone]    = useState(false)

  const SKILLS = [
    'First aid','Crisis counselling','Legal knowledge',
    'Medical training','Community mobilisation','Swahili fluency',
    'Local area knowledge','Night availability','Vehicle / motorbike',
  ]

  const toggleSkill = (s) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills, s]
    }))
  }

  const submit = async () => {
    if(!form.full_name||!form.phone||!form.county) return
    setSending(true)
    await sb.from('responders').insert([{
      ...form,
      verified: false,
      active:   false,
    }])
    setSending(false)
    setDone(true)
    setTimeout(() => onDone(form), 1500)
  }

  if (done) return (
    <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:56,marginBottom:16}}>✅</div>
        <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,color:TXT,marginBottom:8}}>
          Asante, {form.full_name.split(' ')[0]}
        </h2>
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:14,color:MUT,lineHeight:1.7}}>
          Your registration is received. The FemSaidia team will verify and activate your account.
          You will receive an SMS when you are active.
        </p>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:BG,paddingBottom:40}}>
      {/* Header */}
      <div style={{background:SURF,padding:'20px 20px 16px',borderBottom:`1px solid ${BD}`}}>
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
          letterSpacing:'.2em',textTransform:'uppercase',color:BGRN,marginBottom:6}}>
          Itika · First Responder Network
        </p>
        <h1 style={{fontFamily:"'Lora',serif",fontSize:28,fontWeight:700,color:TXT}}>
          Register as a responder
        </h1>
        <div style={{display:'flex',gap:4,marginTop:12}}>
          {[1,2,3].map(n => (
            <div key={n} style={{flex:1,height:3,background:step>=n?BGRN:BD}}/>
          ))}
        </div>
      </div>

      <div style={{padding:'20px 20px'}}>
        {step===1 && (
          <div>
            <h2 style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:TXT,marginBottom:4}}>
              Who are you?
            </h2>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT,marginBottom:20,lineHeight:1.6}}>
              Your details are only shared with the FemSaidia admin team and used to route alerts to your area.
            </p>
            {[
              {k:'full_name', l:'Full name *', ph:'Your full name', t:'text'},
              {k:'phone',     l:'Phone number *', ph:'e.g. 0712345678', t:'tel'},
              {k:'organisation', l:'Organisation (optional)', ph:'e.g. FIDA Kenya, COVAW, freelance...', t:'text'},
            ].map(f => (
              <div key={f.k} style={{marginBottom:14}}>
                <label style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
                  letterSpacing:'.1em',textTransform:'uppercase',color:MUT,display:'block',marginBottom:5}}>
                  {f.l}
                </label>
                <input type={f.t} value={form[f.k]}
                  onChange={e=>setForm({...form,[f.k]:e.target.value})}
                  placeholder={f.ph}
                  style={{width:'100%',padding:'10px 14px',fontFamily:"'Nunito Sans',sans-serif",
                    fontSize:14,background:CARD,border:`1px solid ${BD}`,color:TXT,
                    outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
            <button onClick={()=>setStep(2)} disabled={!form.full_name||!form.phone}
              style={{width:'100%',padding:'14px',fontFamily:"'Nunito Sans',sans-serif",
                fontSize:14,fontWeight:700,background:form.full_name&&form.phone?GRN:'#0A2A1A',
                color:form.full_name&&form.phone?'#fff':MUT,border:'none',cursor:'pointer',marginTop:8}}>
              Continue →
            </button>
          </div>
        )}

        {step===2 && (
          <div>
            <h2 style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:TXT,marginBottom:4}}>
              Your role & area
            </h2>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT,marginBottom:20,lineHeight:1.6}}>
              Alerts are routed to responders in the same county as the distress signal.
            </p>
            <div style={{marginBottom:14}}>
              <label style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
                letterSpacing:'.1em',textTransform:'uppercase',color:MUT,display:'block',marginBottom:5}}>
                Your role *
              </label>
              <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}
                style={{width:'100%',padding:'10px 14px',fontFamily:"'Nunito Sans',sans-serif",
                  fontSize:14,background:CARD,border:`1px solid ${BD}`,color:TXT,outline:'none',boxSizing:'border-box'}}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
                letterSpacing:'.1em',textTransform:'uppercase',color:MUT,display:'block',marginBottom:5}}>
                Your county *
              </label>
              <select value={form.county} onChange={e=>setForm({...form,county:e.target.value})}
                style={{width:'100%',padding:'10px 14px',fontFamily:"'Nunito Sans',sans-serif",
                  fontSize:14,background:CARD,border:`1px solid ${BD}`,color:TXT,outline:'none',boxSizing:'border-box'}}>
                {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setStep(1)}
                style={{flex:1,padding:'14px',fontFamily:"'Nunito Sans',sans-serif",
                  fontSize:14,fontWeight:700,background:CARD,color:MUT,border:`1px solid ${BD}`,cursor:'pointer'}}>
                ← Back
              </button>
              <button onClick={()=>setStep(3)}
                style={{flex:2,padding:'14px',fontFamily:"'Nunito Sans',sans-serif",
                  fontSize:14,fontWeight:700,background:GRN,color:'#fff',border:'none',cursor:'pointer'}}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step===3 && (
          <div>
            <h2 style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:TXT,marginBottom:4}}>
              Your skills
            </h2>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT,marginBottom:16,lineHeight:1.6}}>
              Select all that apply. This helps us match you to the right alerts.
            </p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:20}}>
              {SKILLS.map(s => (
                <button key={s} onClick={()=>toggleSkill(s)}
                  style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:600,
                    padding:'10px 8px',border:`1px solid ${form.skills.includes(s)?BGRN:BD}`,
                    background:form.skills.includes(s)?GRN:CARD,
                    color:form.skills.includes(s)?'#fff':MUT,cursor:'pointer',textAlign:'left'}}>
                  {form.skills.includes(s)?'✓ ':''}{s}
                </button>
              ))}
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
                letterSpacing:'.1em',textTransform:'uppercase',color:MUT,display:'block',marginBottom:5}}>
                Anything else we should know (optional)
              </label>
              <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}
                placeholder="e.g. Available nights only, have a motorbike, speak Luo..."
                rows={3}
                style={{width:'100%',padding:'10px 14px',fontFamily:"'Nunito Sans',sans-serif",
                  fontSize:13,background:CARD,border:`1px solid ${BD}`,color:TXT,
                  outline:'none',resize:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setStep(2)}
                style={{flex:1,padding:'14px',fontFamily:"'Nunito Sans',sans-serif",
                  fontSize:14,fontWeight:700,background:CARD,color:MUT,border:`1px solid ${BD}`,cursor:'pointer'}}>
                ← Back
              </button>
              <button onClick={submit} disabled={sending}
                style={{flex:2,padding:'14px',fontFamily:"'Nunito Sans',sans-serif",
                  fontSize:14,fontWeight:700,background:GRN,color:'#fff',border:'none',cursor:'pointer'}}>
                {sending?'Submitting…':'Submit registration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── ALERT CARD ────────────────────────────────────────────────────────────────
function AlertCard({ alert, responder, onRespond }) {
  const [responding, setResponding] = useState(false)
  const age = Math.floor((Date.now() - new Date(alert.created_at)) / 60000)
  const ageStr = age < 60 ? `${age}m ago` : `${Math.floor(age/60)}h ago`

  const statusColor = {
    active:   RED,
    responded:'#CA8A04',
    resolved: GRN,
  }[alert.status] || MUT

  const respond = async (status) => {
    setResponding(true)
    await sb.from('responder_responses').insert([{
      alert_id:     alert.id,
      responder_id: responder.id,
      status,
      accepted_at:  status==='accepted' ? new Date().toISOString() : null,
    }])
    await sb.from('responder_alerts').update({status:'responded'}).eq('id',alert.id)
    setResponding(false)
    onRespond()
  }

  return (
    <div style={{background:CARD,border:`1px solid ${BD}`,borderLeft:`4px solid ${statusColor}`,
      padding:16,marginBottom:8}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div>
          <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:9,fontWeight:700,
            letterSpacing:'.1em',textTransform:'uppercase',padding:'2px 8px',
            background:statusColor,color:'#fff'}}>
            {alert.status?.toUpperCase()} · {alert.alert_type?.toUpperCase()}
          </span>
        </div>
        <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT}}>{ageStr}</span>
      </div>
      <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:TXT,marginBottom:4}}>
        {alert.county}
      </div>
      {alert.details && (
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT,lineHeight:1.6,marginBottom:10}}>
          {alert.details}
        </p>
      )}
      {alert.location_lat && (
        <a href={`https://maps.google.com/?q=${alert.location_lat},${alert.location_lng}`}
          target="_blank" rel="noopener noreferrer"
          style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:BGRN,
            fontWeight:700,textDecoration:'none',display:'block',marginBottom:10}}>
          📍 Open location in Maps →
        </a>
      )}
      {alert.status==='active' && (
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button onClick={()=>respond('accepted')} disabled={responding}
            style={{flex:2,fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,
              padding:'12px',background:GRN,color:'#fff',border:'none',cursor:'pointer'}}>
            ✓ I am responding
          </button>
          <button onClick={()=>respond('declined')} disabled={responding}
            style={{flex:1,fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,
              padding:'12px',background:CARD,color:MUT,border:`1px solid ${BD}`,cursor:'pointer'}}>
            Can't
          </button>
        </div>
      )}
      {alert.status==='responded' && (
        <button onClick={async()=>{
            await sb.from('responder_alerts').update({status:'resolved'}).eq('id',alert.id)
            onRespond()
          }}
          style={{width:'100%',fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,
            padding:'12px',background:AMB,color:'#fff',border:'none',cursor:'pointer',marginTop:8}}>
          Mark as resolved
        </button>
      )}
    </div>
  )
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
function Dashboard({ responder, onLogout }) {
  const [alerts,  setAlerts]  = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('alerts')
  const [myStats, setMyStats] = useState({total:0,accepted:0,resolved:0})

  const load = () => {
    setLoading(true)
    sb.from('responder_alerts')
      .select('*')
      .eq('county', responder.county)
      .order('created_at', {ascending:false})
      .limit(20)
      .then(({data}) => { setAlerts(data||[]); setLoading(false) })

    sb.from('responder_responses')
      .select('*')
      .eq('responder_id', responder.id)
      .then(({data}) => {
        setMyStats({
          total:    data?.length||0,
          accepted: data?.filter(r=>r.status==='accepted').length||0,
          resolved: data?.filter(r=>r.status==='resolved').length||0,
        })
      })
  }

  useEffect(() => { load() }, [])

  // Poll for new alerts every 60 seconds
  useEffect(() => {
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  const activeAlerts = alerts.filter(a => a.status==='active')

  return (
    <div style={{background:BG,minHeight:'100vh',paddingBottom:80,color:TXT}}>
      {/* Header */}
      <div style={{background:SURF,padding:'16px 20px',borderBottom:`1px solid ${BD}`,
        display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
            letterSpacing:'.2em',textTransform:'uppercase',color:BGRN,marginBottom:2}}>
            Itika · {responder.county}
          </p>
          <h1 style={{fontFamily:"'Lora',serif",fontSize:22,fontWeight:700,color:TXT}}>
            {responder.full_name.split(' ')[0]}
          </h1>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {activeAlerts.length > 0 && (
            <div style={{background:RED,color:'#fff',fontFamily:"'Nunito Sans',sans-serif",
              fontSize:11,fontWeight:700,padding:'4px 10px',animation:'pulse 1s infinite'}}>
              {activeAlerts.length} ACTIVE
            </div>
          )}
          <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
            padding:'4px 10px',background:responder.active?GRN:'#5A2010',color:'#fff'}}>
            {responder.active?'● ACTIVE':'○ PENDING'}
          </div>
        </div>
      </div>

      {/* Status bar if not yet active */}
      {!responder.active && (
        <div style={{background:'#3A1808',borderBottom:`1px solid ${AMB}`,
          padding:'10px 20px',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:16}}>⏳</span>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:'#E8C060',lineHeight:1.5}}>
            Your account is pending verification. The FemSaidia team will activate you shortly.
            You can still see alerts in your area.
          </p>
        </div>
      )}

      {/* Stats strip */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,padding:'12px 20px'}}>
        {[
          {l:'Alerts in county', v:alerts.length, c:BGRN},
          {l:'My responses',     v:myStats.accepted, c:AMB},
          {l:'Resolved',         v:myStats.resolved, c:GRN},
        ].map((s,i) => (
          <div key={i} style={{background:CARD,padding:'10px 12px',textAlign:'center'}}>
            <div style={{fontFamily:"'Lora',serif",fontSize:28,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{display:'flex',gap:2,padding:'0 20px',marginBottom:16}}>
        {[
          {id:'alerts',  label:`🚨 Alerts (${alerts.length})`},
          {id:'active',  label:`⚡ Active (${activeAlerts.length})`},
          {id:'profile', label:'👤 Profile'},
        ].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,
              padding:'8px 12px',border:'none',cursor:'pointer',flex:1,
              background:tab===t.id?GRN:CARD,color:tab===t.id?'#fff':MUT}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{padding:'0 20px'}}>
        {tab==='alerts' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT}}>
                Showing alerts for {responder.county}
              </p>
              <button onClick={load} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,
                color:BGRN,background:'none',border:'none',cursor:'pointer',fontWeight:700}}>
                ↻ Refresh
              </button>
            </div>
            {loading ? (
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,fontStyle:'italic'}}>Loading…</p>
            ) : alerts.length===0 ? (
              <div style={{background:CARD,border:`1px solid ${BD}`,padding:32,textAlign:'center'}}>
                <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT}}>
                  No alerts in {responder.county} right now.
                </p>
                <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT,marginTop:6}}>
                  Stay ready. Alerts will appear here automatically.
                </p>
              </div>
            ) : alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} responder={responder} onRespond={load}/>
            ))}
          </div>
        )}

        {tab==='active' && (
          <div>
            {activeAlerts.length===0 ? (
              <div style={{background:CARD,border:`1px solid ${BD}`,padding:32,textAlign:'center'}}>
                <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT}}>
                  No active alerts right now.
                </p>
              </div>
            ) : activeAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} responder={responder} onRespond={load}/>
            ))}
          </div>
        )}

        {tab==='profile' && (
          <div>
            <div style={{background:CARD,border:`1px solid ${BD}`,padding:16,marginBottom:12}}>
              <div style={{fontFamily:"'Lora',serif",fontSize:18,fontWeight:700,color:TXT,marginBottom:4}}>
                {responder.full_name}
              </div>
              {[
                ['Role',         responder.role],
                ['County',       responder.county],
                ['Phone',        responder.phone],
                ['Organisation', responder.organisation||'—'],
                ['Status',       responder.active?'Active':'Pending verification'],
              ].map(([label,val],i) => (
                <div key={i} style={{display:'flex',gap:12,padding:'8px 0',
                  borderBottom:i<4?`1px solid ${BD}`:'none'}}>
                  <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
                    letterSpacing:'.08em',textTransform:'uppercase',color:MUT,width:100,flexShrink:0}}>
                    {label}
                  </div>
                  <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:TXT}}>{val}</div>
                </div>
              ))}
              {responder.skills?.length > 0 && (
                <div style={{marginTop:10}}>
                  <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
                    letterSpacing:'.08em',textTransform:'uppercase',color:MUT,marginBottom:6}}>
                    Skills
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                    {responder.skills.map((s,i) => (
                      <span key={i} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,
                        padding:'3px 8px',background:GRN,color:'#fff'}}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{background:'#1A0A08',border:`1px solid #4A1818`,padding:16,marginBottom:12}}>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:'#E8C0B0',lineHeight:1.7}}>
                🔒 Your details are confidential and only visible to the FemSaidia admin team.
                You will never be identified to the public or to perpetrators.
              </p>
            </div>

            <button onClick={onLogout}
              style={{width:'100%',fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,
                padding:'12px',background:CARD,color:MUT,border:`1px solid ${BD}`,cursor:'pointer'}}>
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Bottom emergency bar */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#0A0A0A',
        borderTop:`1px solid ${RED}`,padding:'10px 16px',
        display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
        <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
          color:RED,letterSpacing:'.1em',textTransform:'uppercase'}}>FemSaidia Kenya</span>
        <a href="https://femsaidiakenya.org" target="_blank" rel="noopener noreferrer"
          style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT,textDecoration:'none'}}>
          femsaidiakenya.org
        </a>
        <a href="tel:*384*89056%23"
          style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,
            padding:'4px 10px',background:'#8A1030',color:'#fff',textDecoration:'none'}}>
          📞 Salmin
        </a>
      </div>
    </div>
  )
}

// ── PHONE LOGIN ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onRegister }) {
  const [phone,   setPhone]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const login = async () => {
    if(!phone.trim()) return
    setLoading(true); setError('')
    const clean = phone.trim().replace(/\s/g,'')
    const { data, error } = await sb.from('responders')
      .select('*').eq('phone', clean).single()
    if (error || !data) {
      setError('Phone number not found. Please register first or check your number.')
      setLoading(false); return
    }
    setLoading(false)
    onLogin(data)
  }

  return (
    <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',
      justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:360}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:12}}>🛡️</div>
          <h1 style={{fontFamily:"'Lora',serif",fontSize:32,fontWeight:700,color:TXT,marginBottom:8}}>
            Itika
          </h1>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT,lineHeight:1.6}}>
            FemSaidia Kenya · First Responder Network
          </p>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:BGRN,
            fontStyle:'italic',marginTop:4}}>
            "Heed the call"
          </p>
        </div>

        <div style={{background:SURF,border:`1px solid ${BD}`,padding:24}}>
          <label style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
            letterSpacing:'.1em',textTransform:'uppercase',color:MUT,display:'block',marginBottom:6}}>
            Your phone number
          </label>
          <input value={phone} onChange={e=>setPhone(e.target.value)}
            placeholder="e.g. 0712345678" type="tel"
            onKeyDown={e=>e.key==='Enter'&&login()}
            style={{width:'100%',padding:'12px 14px',fontFamily:"'Nunito Sans',sans-serif",
              fontSize:15,background:CARD,border:`1px solid ${BD}`,color:TXT,
              outline:'none',marginBottom:10,boxSizing:'border-box'}}/>
          {error && (
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:RED,marginBottom:10}}>
              {error}
            </p>
          )}
          <button onClick={login} disabled={loading||!phone}
            style={{width:'100%',padding:'14px',fontFamily:"'Nunito Sans',sans-serif",
              fontSize:14,fontWeight:700,background:phone?GRN:CARD,
              color:phone?'#fff':MUT,border:'none',cursor:phone?'pointer':'not-allowed',marginBottom:16}}>
            {loading?'Checking…':'Enter Itika'}
          </button>
          <div style={{borderTop:`1px solid ${BD}`,paddingTop:16,textAlign:'center'}}>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,marginBottom:10}}>
              Not registered yet?
            </p>
            <button onClick={onRegister}
              style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,
                padding:'10px 20px',background:'transparent',color:BGRN,
                border:`1px solid ${BGRN}`,cursor:'pointer'}}>
              Register as a responder
            </button>
          </div>
        </div>

        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT,
          textAlign:'center',marginTop:20,lineHeight:1.6}}>
          Itika is part of the FemSaidia Kenya safety ecosystem.<br/>
          For emergencies: <a href="tel:*384*89056%23" style={{color:BGRN,textDecoration:'none',fontWeight:700}}>*384*89056#</a>
        </p>
      </div>
    </div>
  )
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,    setScreen]    = useState('login') // login | register | dashboard
  const [responder, setResponder] = useState(null)

  // Check localStorage for returning responder
  useEffect(() => {
    const saved = localStorage.getItem('itika_responder')
    if (saved) {
      try {
        const r = JSON.parse(saved)
        // Refresh from DB
        sb.from('responders').select('*').eq('id', r.id).single()
          .then(({data}) => {
            if (data) { setResponder(data); setScreen('dashboard') }
          })
      } catch(e) {}
    }
  }, [])

  const handleLogin = (r) => {
    setResponder(r)
    localStorage.setItem('itika_responder', JSON.stringify(r))
    setScreen('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('itika_responder')
    setResponder(null)
    setScreen('login')
  }

  return (
    <>
      {screen==='login'     && <LoginScreen onLogin={handleLogin} onRegister={()=>setScreen('register')}/>}
      {screen==='register'  && <RegisterScreen onDone={handleLogin}/>}
      {screen==='dashboard' && responder && <Dashboard responder={responder} onLogout={handleLogout}/>}
    </>
  )
}

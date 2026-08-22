import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Check, Users, AlertTriangle, ChevronDown } from 'lucide-react'
import { TurnstileWidget, tsInsert, resetTurnstile } from './lib/turnstile'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const A   = '#8A1030'
const BD  = '#B89AAA'
const BG  = '#D4BEC4'
const CRD = '#C4AABB'
const TXT = '#180410'
const MUT = '#7A4A60'

const COUNTIES = [
  'Nairobi','Kiambu','Mombasa','Nakuru','Kisumu','Kajiado','Kwale',
  'Machakos',"Murang'a",'Kilifi','Uasin Gishu','Trans Nzoia','Meru',
  'Kakamega','Nyeri','Nandi','Embu','Kirinyaga','Bungoma','Homa Bay',
  'Nyamira','Laikipia','Baringo','Narok','Kericho','Bomet','Siaya',
  'Vihiga','Busia','Migori','Kisii','Nyandarua','Taita Taveta','Kitui',
  'Makueni','Samburu','Lamu','Tana River','Garissa','Wajir','Mandera',
  'Marsabit','Isiolo','Turkana','West Pokot','Elgeyo Marakwet','Tharaka Nithi',
  'Other (outside Kenya)',
]

const DEMANDS = [
  {
    n: '01',
    title: 'Declare femicide a national disaster',
    body: 'Compel the national government and all 47 county governments to formally declare femicide a national disaster and allocate dedicated resources — financial, institutional and human — to combating it.',
  },
  {
    n: '02',
    title: 'Establish a Special Victims Crime Unit',
    body: 'Establish a dedicated Special Victims Crime Unit within the Directorate of Criminal Investigations to investigate femicide, gender-based violence and tech-facilitated GBV crimes, with ring-fenced funding and specialised training.',
  },
  {
    n: '03',
    title: 'Pass the Special Victims Act',
    body: 'Compel the National Assembly, Senate and all 47 County Assemblies to pass the Special Victims Act — legislation that explicitly criminalises femicide and tech-facilitated gender-based violence in Kenya.',
  },
  {
    n: '04',
    title: 'Establish a Special Victims Taskforce',
    body: 'Create a permanent Special Victims Taskforce that tracks femicide and tech-facilitated GBV through rigorous research, and makes binding policy recommendations to Parliament, law enforcement, the judiciary and civil society.',
  },
]

export default function PetitionTab({ isMobile = false }) {
  const [count, setCount]     = useState(null)
  const [recent, setRecent]   = useState([])
  const [form, setForm]       = useState({name:'',email:'',county:'',country:'Kenya',message:''})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')
  const [errors, setErrors]   = useState({})
  const [tsToken, setTsToken] = useState('')
  // On mobile the demands become an accordion; the first is open for context.
  const [openDemand, setOpenDemand] = useState(0)

  useEffect(() => {
    loadCount()
    loadRecent()
  }, [])

  const loadCount = async () => {
    // petition_signatures is RLS-locked (anon may INSERT, not SELECT), so prefer
    // the public aggregate RPC; fall back to a direct count where the lock isn't applied.
    const { data, error } = await supabase.rpc('petition_signature_count')
    if (!error && (typeof data === 'number' || typeof data === 'string')) {
      setCount(Number(data) || 0)
      return
    }
    const { count } = await supabase
      .from('petition_signatures')
      .select('*', { count:'exact', head:true })
    setCount(count || 0)
  }

  const loadRecent = async () => {
    const { data } = await supabase
      .from('petition_signatures')
      .select('name, county, country, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    setRecent(data || [])
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Your name is required'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'A valid email is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const sign = async () => {
    if (!validate()) return
    if (!tsToken) { setError('Please complete the verification below.'); return }
    setLoading(true)
    setError('')
    const { error } = await tsInsert(supabase, 'petition_signatures', {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      county: form.county || null,
      country: form.country || 'Kenya',
      message: form.message.trim() || null,
    }, tsToken)
    if (error) {
      setError(error.message)
      resetTurnstile(); setTsToken('')
    } else {
      setSuccess(true)
      loadCount()
      loadRecent()
    }
    setLoading(false)
  }

  const inputStyle = {
    width:'100%', fontFamily:"'Nunito Sans',sans-serif", fontSize:16,
    color:TXT, background:'#DDD0D0', border:`1px solid ${BD}`,
    padding:'11px 12px', outline:'none', marginTop:4,
  }
  const labelStyle = {
    fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif",
    letterSpacing:'.08em', textTransform:'uppercase', fontWeight:600,
    display:'block', marginTop:14, marginBottom:2,
  }

  // ── Demands — full cards on desktop, tap-to-expand accordion on mobile ──
  const Demands = () => (
    <div>
      <p className="label" style={{ marginBottom:14, letterSpacing:'.12em' }}>Our four demands</p>
      {DEMANDS.map((d, i) => {
        const open = !isMobile || openDemand === i
        return (
          <div key={i} style={{
            background: CRD, border:`1px solid ${BD}`,
            marginBottom:2, borderLeft:`4px solid ${A}`,
          }}>
            <button
              onClick={() => isMobile && setOpenDemand(openDemand === i ? -1 : i)}
              aria-expanded={open}
              style={{
                width:'100%', textAlign:'left', background:'transparent', border:'none',
                cursor: isMobile ? 'pointer' : 'default',
                padding: isMobile ? '14px 16px' : '20px 22px',
                display:'flex', alignItems:'flex-start', gap:14,
                WebkitTapHighlightColor:'transparent',
              }}>
              <div className="serif" style={{ fontSize:isMobile?22:28, fontWeight:700, color:A, lineHeight:1, flexShrink:0 }}>{d.n}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Lora',serif", fontSize:15, fontWeight:700, color:TXT, marginBottom:open?6:0, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ flex:1 }}>{d.title}</span>
                  {isMobile && (
                    <ChevronDown size={16} color={MUT} style={{ flexShrink:0, transition:'transform .2s', transform:open?'rotate(180deg)':'none' }}/>
                  )}
                </div>
                {open && (
                  <p style={{ fontSize:13, color:MUT, lineHeight:1.8, fontFamily:"'Nunito Sans',sans-serif", overflowWrap:'anywhere' }}>{d.body}</p>
                )}
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )

  // ── Recent signatures list ──
  const Recent = () => (
    <div className="card" style={{ padding:20, marginTop:2 }}>
      <div className="section-head">
        <span>Recent signatures</span>
        <span style={{ display:'flex', alignItems:'center', gap:5, color:A }}>
          <Users size={12}/> {count !== null ? count.toLocaleString() : '—'} total
        </span>
      </div>
      {recent.map((s, i) => (
        <div key={i} style={{
          padding:'8px 0', borderBottom: i < recent.length-1 ? `1px solid ${BD}` : 'none',
          display:'flex', justifyContent:'space-between', alignItems:'center', gap:10,
        }}>
          <div style={{ minWidth:0 }}>
            <span style={{ fontSize:13, fontWeight:600, color:TXT, fontFamily:"'Nunito Sans',sans-serif" }}>{s.name}</span>
            {s.county && <span style={{ fontSize:11, color:MUT, marginLeft:6, fontFamily:"'Nunito Sans',sans-serif" }}>· {s.county}</span>}
          </div>
          <span style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", flexShrink:0 }}>
            {new Date(s.created_at).toLocaleDateString(['en-KE','en-GB'])}
          </span>
        </div>
      ))}
    </div>
  )

  // ── Sign form / success ──
  const SignForm = () => (
    <div>
      <p className="label" style={{ marginBottom:14, letterSpacing:'.12em' }}>Add your signature</p>
      <div className="card" style={{ padding:isMobile?18:24 }}>
        {success ? (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:'#C8D8C0', border:'2px solid #60A050', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Check size={24} color="#1A4810"/>
            </div>
            <div className="serif" style={{ fontSize:22, fontWeight:700, color:TXT, marginBottom:8 }}>
              Signature received
            </div>
            <p style={{ fontSize:13, color:MUT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.8, marginBottom:16 }}>
              Thank you, {form.name.split(' ')[0]}. Your signature has been added.
              Share this petition and help us reach more Kenyans.
            </p>
            <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
              <a href={`https://wa.me/?text=${encodeURIComponent('I just signed the FemSaidia Kenya petition demanding the government declare femicide a national disaster. Add your voice: https://femsaidiakenya.org')}`}
                target="_blank" rel="noopener noreferrer"
                style={{ background:'#25D366', color:'#fff', fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700, padding:'9px 18px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                Share on WhatsApp
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('I just signed the @FemSaidiaKE petition. Femicide is a national disaster. The Kenyan government must act NOW. Sign: https://femsaidiakenya.org #FemicideIsACrisis #TotalShutdownKE')}`}
                target="_blank" rel="noopener noreferrer"
                style={{ background:'#000', color:'#fff', fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700, padding:'9px 18px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                Share on X
              </a>
            </div>
            <button
              onClick={() => {
                setSuccess(false)
                setForm({ name:'', email:'', county:'', country:'Kenya', message:'' })
                setError(''); setErrors({}); setTsToken(''); resetTurnstile()
              }}
              style={{ marginTop:20, fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
                padding:'10px 20px', background:'transparent', color:A, border:`1px solid ${A}`, cursor:'pointer' }}>
              Add another signature
            </button>
          </div>
        ) : (
          <>
            <div style={{ background:'#E8D0C8', border:`1px solid #B07060`, padding:'10px 14px', marginBottom:16, display:'flex', gap:8 }}>
              <AlertTriangle size={13} color={A} style={{ flexShrink:0, marginTop:2 }}/>
              <p style={{ fontSize:11, color:TXT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.6 }}>
                Your email will not be shared publicly. It is used only to prevent duplicate signatures and to notify you of petition updates.
              </p>
            </div>

            <label style={labelStyle}>Full name <span style={{ color:A }}>*</span></label>
            <input style={inputStyle} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Your full name"/>
            {errors.name && <p style={{ fontSize:11, color:A, fontFamily:"'Nunito Sans',sans-serif", marginTop:3 }}>{errors.name}</p>}

            <label style={labelStyle}>Email address <span style={{ color:A }}>*</span></label>
            <input style={inputStyle} type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="your@email.com"/>
            {errors.email && <p style={{ fontSize:11, color:A, fontFamily:"'Nunito Sans',sans-serif", marginTop:3 }}>{errors.email}</p>}

            <label style={labelStyle}>County (optional)</label>
            <select style={inputStyle} value={form.county} onChange={e=>set('county',e.target.value)}>
              <option value="">Select your county</option>
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={labelStyle}>Country</label>
            <input style={inputStyle} value={form.country} onChange={e=>set('country',e.target.value)} placeholder="Kenya"/>

            <label style={labelStyle}>Message (optional)</label>
            <textarea style={{ ...inputStyle, minHeight:80, resize:'vertical' }}
              value={form.message} onChange={e=>set('message',e.target.value)}
              placeholder="Why does this matter to you? (optional)"/>

            {error && <p style={{ fontSize:12, color:A, fontFamily:"'Nunito Sans',sans-serif", marginTop:10, fontWeight:600 }}>{error}</p>}

            <TurnstileWidget onVerify={setTsToken} />

            <button onClick={sign} disabled={loading||!tsToken}
              style={{
                marginTop:16, width:'100%',
                fontFamily:"'Nunito Sans',sans-serif", fontSize:14, fontWeight:700,
                padding:'14px', background: (loading||!tsToken) ? MUT : A, color:'#F0D0D8',
                border:'none', cursor: loading ? 'wait' : (tsToken ? 'pointer' : 'not-allowed'),
                letterSpacing:'.04em',
              }}>
              {loading ? 'Signing...' : 'Sign this petition →'}
            </button>
          </>
        )}
      </div>
    </div>
  )

  // ── Share block ──
  const Share = () => (
    !success ? (
      <div className="card" style={{ padding:20, marginTop:2 }}>
        <div className="section-head"><span>Share the petition</span></div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <a href={`https://wa.me/?text=${encodeURIComponent('Add your voice. FemSaidia Kenya is demanding the government declare femicide a national disaster: https://femsaidiakenya.org')}`}
            target="_blank" rel="noopener noreferrer"
            style={{ background:'#25D366', color:'#fff', fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700, padding:'8px 14px', textDecoration:'none' }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Femicide is a national disaster in Kenya. Sign the @FemSaidiaKE petition and demand government action NOW. #FemicideIsACrisis https://femsaidiakenya.org')}`}
            target="_blank" rel="noopener noreferrer"
            style={{ background:'#000', color:'#fff', fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700, padding:'8px 14px', textDecoration:'none' }}>
            X / Twitter
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=https://femsaidiakenya.org`}
            target="_blank" rel="noopener noreferrer"
            style={{ background:'#1877F2', color:'#fff', fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700, padding:'8px 14px', textDecoration:'none' }}>
            Facebook
          </a>
        </div>
      </div>
    ) : null
  )

  return (
    <div className="fade-up" style={{ width:'100%' }}>

      {/* Hero */}
      <div style={{ borderBottom:`1px solid ${BD}`, paddingBottom:isMobile?20:28, marginBottom:isMobile?20:28 }}>
        <p className="label" style={{ marginBottom:12, color:A, letterSpacing:'.15em' }}>
          ● National petition · Kenya · 2026
        </p>
        <h1 className="serif" style={{ fontSize:isMobile?27:44, fontWeight:700, lineHeight:1.2, color:TXT, maxWidth:780 }}>
          Femicide is a national disaster.<br/>
          <em style={{ color:A }}>It is time the government acted like it.</em>
        </h1>
        <p style={{ marginTop:16, fontSize:14, color:MUT, maxWidth:680, lineHeight:1.9, fontWeight:300, fontFamily:"'Nunito Sans',sans-serif" }}>
          We call on the Government of Kenya — national and county — to take four urgent, concrete actions
          to address the femicide epidemic that claims a woman's life every 47 hours in this country.
          Sign below and add your voice to this demand.
        </p>
      </div>

      {/* Signature counter — stacks on mobile */}
      <div style={{ background:'#BC9EAE', border:`2px solid ${A}`, padding:isMobile?'18px 20px':'22px 28px', marginBottom:isMobile?20:28,
        display:'flex', flexDirection:isMobile?'column':'row', alignItems:isMobile?'flex-start':'center', gap:isMobile?14:24 }}>
        <div style={{ flexShrink:0 }}>
          <div className="serif" style={{ fontSize:isMobile?52:64, fontWeight:700, color:A, lineHeight:1 }}>
            {count !== null ? count.toLocaleString() : '—'}
          </div>
          <p style={{ fontSize:14, color:TXT, fontWeight:600, marginTop:6, fontFamily:"'Nunito Sans',sans-serif" }}>
            Kenyans and supporters have signed
          </p>
        </div>
        <div style={{ flex:1, borderLeft:isMobile?'none':`1px solid ${BD}`, borderTop:isMobile?`1px solid ${BD}`:'none',
          paddingLeft:isMobile?0:24, paddingTop:isMobile?14:0 }}>
          <p style={{ fontSize:13, color:MUT, lineHeight:1.8, fontFamily:"'Nunito Sans',sans-serif" }}>
            This petition will be presented to the National Assembly, the Senate, all 47 County Assemblies,
            the Inspector General of Police, the Director of Public Prosecutions, and the Cabinet Secretary
            for Interior and National Administration.
          </p>
        </div>
      </div>

      {isMobile ? (
        /* Mobile: single column, form kept high so it is never squeezed out */
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {Demands()}
          {SignForm()}
          {Recent()}
          {Share()}
        </div>
      ) : (
        /* Desktop: two columns */
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>
          <div>
            {Demands()}
            {Recent()}
          </div>
          <div>
            {SignForm()}
            {Share()}
          </div>
        </div>
      )}
    </div>
  )
}

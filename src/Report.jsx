import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { AlertTriangle, Check, Phone, ExternalLink } from 'lucide-react'
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
]

const INCIDENT_TYPES = [
  { v:'femicide',           l:'Femicide — death of a woman at the hands of a partner, family member or acquaintance' },
  { v:'attempted_femicide', l:'Attempted femicide — survived, but life was at risk' },
  { v:'disappearance',      l:'Disappearance — woman reported missing, believed in danger' },
  { v:'assault',            l:'Assault — physical violence, serious bodily harm' },
  { v:'rape',               l:'Rape / sexual violence' },
  { v:'other',              l:'Other gender-based violence incident' },
]

const SOURCE_TYPES = [
  { v:'eyewitness',  l:'Eyewitness account' },
  { v:'news',        l:'News / media report' },
  { v:'police',      l:'Police report / official record' },
  { v:'cso',         l:'CSO / NGO report' },
  { v:'family',      l:'Family or community member' },
  { v:'other',       l:'Other source' },
]

const AGE_RANGES = [
  { v:'under_18', l:'Under 18' },
  { v:'18_25',    l:'18 – 25' },
  { v:'26_35',    l:'26 – 35' },
  { v:'36_45',    l:'36 – 45' },
  { v:'46_plus',  l:'46 and above' },
  { v:'unknown',  l:'Unknown' },
]

export default function ReportTab({ isMobile = false }) {
  const [step, setStep]       = useState(1)
  const [tsToken, setTsToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors]   = useState({})
  const [form, setForm]       = useState({
    incident_date:'', county:'', location:'', incident_type:'',
    description:'', victim_age_range:'unknown',
    tech_facilitated:false, tech_details:'',
    source_url:'', source_type:'',
    reported_to_police:false, ob_number:'',
    submitter_name:'', submitter_email:'', submitter_phone:'',
    terms_accepted:false,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (step === 1) {
      if (!form.county)         e.county = 'County is required'
      if (!form.incident_type)  e.incident_type = 'Incident type is required'
      if (!form.description || form.description.length < 30)
        e.description = 'Please describe the incident in at least 30 characters'
    }
    if (step === 2) {
      if (!form.source_type) e.source_type = 'Please indicate the source'
    }
    if (step === 3) {
      if (!form.terms_accepted) e.terms_accepted = 'You must accept the terms'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate()) setStep(s => s + 1) }
  const back = () => setStep(s => s - 1)

  const submit = async () => {
    if (!validate()) return
    if (!tsToken) { setErrors({ submit: 'Please complete the verification below.' }); return }
    setLoading(true)
    const { error } = await tsInsert(supabase, 'incident_reports', {
      ...form,
      incident_date: form.incident_date || null,
    }, tsToken)
    if (error) { setErrors({ submit: error.message }); resetTurnstile(); setTsToken('') }
    else setSuccess(true)
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
  const errStyle = { fontSize:11, color:A, marginTop:3, fontFamily:"'Nunito Sans',sans-serif" }

  return (
    <div className="fade-up" style={{ width:'100%' }}>

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${BD}`, paddingBottom:20, marginBottom:24 }}>
        <p className="label" style={{ marginBottom:8, color:A }}>Phase C · Incident reporting pipeline</p>
        <h1 className="serif" style={{ fontSize:isMobile?26:36, fontWeight:700, color:TXT }}>Report an incident</h1>
        <p style={{ fontSize:13, color:MUT, marginTop:8, fontFamily:"'Nunito Sans',sans-serif", fontWeight:300, lineHeight:1.8, maxWidth:680 }}>
          Use this form to report a femicide, assault, disappearance or gender-based violence incident in Kenya.
          Every report is reviewed by our admin team and may be published on the public dashboard.
          Your identity is always protected.
        </p>
      </div>

      {/* Emergency strip */}
      <div style={{ background:'#BC9EAE', border:`1px solid ${BD}`, padding:'14px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:14 }}>
        <AlertTriangle size={18} color={A}/>
        <div>
          <div style={{ fontWeight:700, fontSize:13, color:TXT, fontFamily:"'Nunito Sans',sans-serif" }}>
            Is someone in immediate danger?
          </div>
          <div style={{ display:'flex', gap:16, marginTop:4, flexWrap:'wrap' }}>
            <a href="tel:999" style={{ fontSize:12, color:A, fontWeight:700, fontFamily:"'Nunito Sans',sans-serif", textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
              <Phone size={11}/> Emergency: 999
            </a>
            <a href="tel:0800722203" style={{ fontSize:12, color:A, fontWeight:700, fontFamily:"'Nunito Sans',sans-serif", textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
              <Phone size={11}/> DCI Gender Desk: 0800 722 203
            </a>
            <a href="tel:0800723253" style={{ fontSize:12, color:A, fontWeight:700, fontFamily:"'Nunito Sans',sans-serif", textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
              <Phone size={11}/> GVRC: 0800 723 253
            </a>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'2fr 1fr', gap:isMobile?16:24, alignItems:'start' }}>
        {/* Form */}
        <div className="card" style={{ padding:isMobile?18:24 }}>
          {success ? (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'#C8D8C0', border:'2px solid #60A050', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <Check size={24} color="#1A4810"/>
              </div>
              <div className="serif" style={{ fontSize:22, fontWeight:700, color:TXT, marginBottom:8 }}>Report submitted</div>
              <p style={{ fontSize:13, color:MUT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.8, maxWidth:400, margin:'0 auto' }}>
                Thank you. Your report has been received and will be reviewed within 48 hours.
                Verified incidents will be published on the public dashboard.
              </p>
              <button onClick={()=>{ setSuccess(false); setStep(1); setForm({incident_date:'',county:'',location:'',incident_type:'',description:'',victim_age_range:'unknown',tech_facilitated:false,tech_details:'',source_url:'',source_type:'',reported_to_police:false,ob_number:'',submitter_name:'',submitter_email:'',submitter_phone:'',terms_accepted:false}) }}
                style={{ marginTop:20, fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700, padding:'10px 24px', background:A, color:'#F0D0D8', border:'none', cursor:'pointer' }}>
                Submit another report
              </button>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div style={{ display:'flex', gap:2, marginBottom:20 }}>
                {['Incident details','Evidence & source','Confirm & submit'].map((s,i)=>(
                  <div key={i} style={{ flex:1, padding:'6px 8px', textAlign:'center',
                    background:step===i+1?A:step>i+1?'#C8D8C0':CRD,
                    border:`1px solid ${step===i+1?A:step>i+1?'#60A050':BD}` }}>
                    <p style={{ fontSize:10, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700,
                      color:step===i+1?'#F0D0D8':step>i+1?'#1A4810':MUT, letterSpacing:'.04em' }}>{s}</p>
                  </div>
                ))}
              </div>

              {/* Step 1 — Incident details */}
              {step===1 && (
                <div>
                  <label style={labelStyle}>Incident type <span style={{color:A}}>*</span></label>
                  <select style={inputStyle} value={form.incident_type} onChange={e=>set('incident_type',e.target.value)}>
                    <option value="">Select incident type</option>
                    {INCIDENT_TYPES.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
                  </select>
                  {errors.incident_type && <p style={errStyle}>{errors.incident_type}</p>}

                  <label style={labelStyle}>County <span style={{color:A}}>*</span></label>
                  <select style={inputStyle} value={form.county} onChange={e=>set('county',e.target.value)}>
                    <option value="">Select county</option>
                    {COUNTIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.county && <p style={errStyle}>{errors.county}</p>}

                  <label style={labelStyle}>Specific location (optional)</label>
                  <input style={inputStyle} value={form.location} onChange={e=>set('location',e.target.value)} placeholder="e.g. Westlands, Nakuru CBD"/>

                  <label style={labelStyle}>Date of incident (optional)</label>
                  <input style={inputStyle} type="date" value={form.incident_date} onChange={e=>set('incident_date',e.target.value)}/>

                  <label style={labelStyle}>Victim age range</label>
                  <select style={inputStyle} value={form.victim_age_range} onChange={e=>set('victim_age_range',e.target.value)}>
                    {AGE_RANGES.map(a=><option key={a.v} value={a.v}>{a.l}</option>)}
                  </select>

                  <label style={labelStyle}>Description <span style={{color:A}}>*</span></label>
                  <textarea style={{...inputStyle, minHeight:120, resize:'vertical'}}
                    value={form.description} onChange={e=>set('description',e.target.value)}
                    placeholder="Describe what happened. Include as much detail as you are comfortable sharing — date, sequence of events, relationship between victim and perpetrator (if known), outcome."/>
                  {errors.description && <p style={errStyle}>{errors.description}</p>}

                  <label style={{ ...labelStyle, marginTop:16 }}>
                    <input type="checkbox" checked={form.tech_facilitated}
                      onChange={e=>set('tech_facilitated',e.target.checked)}
                      style={{ marginRight:8, accentColor:A }}/>
                    Technology was used to facilitate this incident
                  </label>
                  {form.tech_facilitated && (
                    <>
                      <label style={labelStyle}>How was technology involved?</label>
                      <textarea style={{...inputStyle, minHeight:60, resize:'vertical'}}
                        value={form.tech_details} onChange={e=>set('tech_details',e.target.value)}
                        placeholder="e.g. Perpetrator used a dating app, Airbnb booking, social media to target victim..."/>
                    </>
                  )}
                </div>
              )}

              {/* Step 2 — Evidence & source */}
              {step===2 && (
                <div>
                  <label style={labelStyle}>Source of information <span style={{color:A}}>*</span></label>
                  <select style={inputStyle} value={form.source_type} onChange={e=>set('source_type',e.target.value)}>
                    <option value="">Select source type</option>
                    {SOURCE_TYPES.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}
                  </select>
                  {errors.source_type && <p style={errStyle}>{errors.source_type}</p>}

                  <label style={labelStyle}>Source URL (news link, police report link etc — optional)</label>
                  <input style={inputStyle} value={form.source_url} onChange={e=>set('source_url',e.target.value)} placeholder="https://..."/>

                  <label style={{ ...labelStyle, marginTop:16 }}>
                    <input type="checkbox" checked={form.reported_to_police}
                      onChange={e=>set('reported_to_police',e.target.checked)}
                      style={{ marginRight:8, accentColor:A }}/>
                    This incident has been reported to the police
                  </label>
                  {form.reported_to_police && (
                    <>
                      <label style={labelStyle}>Police OB number (if available)</label>
                      <input style={inputStyle} value={form.ob_number} onChange={e=>set('ob_number',e.target.value)} placeholder="OB number"/>
                    </>
                  )}

                  <div style={{ borderTop:`1px solid ${BD}`, marginTop:20, paddingTop:16 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:TXT, fontFamily:"'Nunito Sans',sans-serif", marginBottom:10 }}>
                      Your details (confidential — never shared publicly)
                    </p>
                    <label style={labelStyle}>Your name (optional)</label>
                    <input style={inputStyle} value={form.submitter_name} onChange={e=>set('submitter_name',e.target.value)}/>
                    <label style={labelStyle}>Your email (optional)</label>
                    <input style={inputStyle} type="email" value={form.submitter_email} onChange={e=>set('submitter_email',e.target.value)}/>
                    <label style={labelStyle}>Your phone (optional)</label>
                    <input style={inputStyle} type="tel" value={form.submitter_phone} onChange={e=>set('submitter_phone',e.target.value)}/>
                  </div>
                </div>
              )}

              {/* Step 3 — Confirm */}
              {step===3 && (
                <div>
                  <div style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:700, color:TXT, marginBottom:12 }}>Review your report</div>
                  <div style={{ background:CRD, border:`1px solid ${BD}`, padding:'14px 16px', marginBottom:16 }}>
                    {[
                      { l:'Incident type', v: INCIDENT_TYPES.find(t=>t.v===form.incident_type)?.l || form.incident_type },
                      { l:'County', v:form.county },
                      { l:'Description', v:form.description },
                      { l:'Tech facilitated', v:form.tech_facilitated?'Yes':'No' },
                    ].map((f,i)=>(
                      <div key={i} style={{ paddingBottom:10, marginBottom:10, borderBottom:i<3?`1px solid ${BD}`:'none' }}>
                        <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase' }}>{f.l}</p>
                        <p style={{ fontSize:13, color:TXT, marginTop:3, lineHeight:1.6, fontFamily:"'Nunito Sans',sans-serif" }}>{f.v}</p>
                      </div>
                    ))}
                  </div>
                  <label style={{ display:'flex', gap:10, cursor:'pointer', alignItems:'flex-start' }}>
                    <input type="checkbox" checked={form.terms_accepted} onChange={e=>set('terms_accepted',e.target.checked)}
                      style={{ marginTop:2, flexShrink:0, accentColor:A }}/>
                    <p style={{ fontSize:12, color:TXT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.6 }}>
                      I certify that to the best of my knowledge this information is accurate and truthful. I understand that submitting false information may have legal consequences.
                    </p>
                  </label>
                  {errors.terms_accepted && <p style={errStyle}>{errors.terms_accepted}</p>}
                  <TurnstileWidget onVerify={setTsToken} />
                  {errors.submit && <p style={errStyle}>{errors.submit}</p>}
                </div>
              )}

              {/* Navigation */}
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:20 }}>
                {step > 1
                  ? <button onClick={back} style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:600, padding:'10px 20px', border:`1px solid ${BD}`, background:CRD, color:MUT, cursor:'pointer' }}>← Back</button>
                  : <div/>
                }
                {step < 3
                  ? <button onClick={next} style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700, padding:'10px 24px', background:A, color:'#F0D0D8', border:'none', cursor:'pointer' }}>Continue →</button>
                  : <button onClick={submit} disabled={loading||!tsToken} style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700, padding:'10px 24px', background:(loading||!tsToken)?MUT:A, color:'#F0D0D8', border:'none', cursor:loading?'wait':(tsToken?'pointer':'not-allowed') }}>
                      {loading ? 'Submitting...' : 'Submit report'}
                    </button>
                }
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          <div className="card" style={{ padding:20 }}>
            <div className="section-head"><span>What happens next</span></div>
            {[
              { n:'1', t:'Admin review', b:'Your report is reviewed by a FemSaidia Kenya admin within 48 hours.' },
              { n:'2', t:'Verification',  b:'We verify details against available sources where possible.' },
              { n:'3', t:'Publication',   b:'Verified incidents are published on the dashboard with your identity protected.' },
              { n:'4', t:'LE pipeline',   b:'Aggregated data is shared monthly with NGEC and DCI for national tracking.' },
            ].map((s,i)=>(
              <div key={i} style={{ display:'flex', gap:12, marginBottom:14, paddingBottom:14, borderBottom:i<3?`1px solid ${BD}`:'none' }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background:A, color:'#F0D0D8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:700, fontFamily:"'Nunito Sans',sans-serif" }}>{s.n}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:TXT, fontFamily:"'Nunito Sans',sans-serif", marginBottom:3 }}>{s.t}</div>
                  <p style={{ fontSize:11, color:MUT, lineHeight:1.6, fontFamily:"'Nunito Sans',sans-serif" }}>{s.b}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding:20 }}>
            <div className="section-head"><span>Need immediate help?</span></div>
            {[
              { n:'Police emergency', p:'999 / 112' },
              { n:'DCI Gender Desk',  p:'0800 722 203' },
              { n:'GVRC',             p:'0800 723 253' },
              { n:'Kituo Cha Sheria', p:'0800 720 434' },
            ].map((r,i)=>(
              <div key={i} style={{ paddingBottom:10, marginBottom:10, borderBottom:i<3?`1px solid ${BD}`:'none' }}>
                <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>{r.n}</p>
                <a href={`tel:${r.p.replace(/\s|\//g,'')}`} style={{ fontSize:15, fontFamily:"'Lora',serif", fontWeight:700, color:A, textDecoration:'none' }}>{r.p}</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
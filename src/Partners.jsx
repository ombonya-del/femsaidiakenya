import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ExternalLink, Check } from 'lucide-react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const A   = '#8A1030'
const BD  = '#B89AAA'
const CRD = '#C4AABB'
const TXT = '#180410'
const MUT = '#7A4A60'

const CURRENT_PARTNERS = [
  { n:'NGEC Kenya',          t:'Government agency',    url:'https://ngeckenya.org',        desc:'National Gender & Equality Commission — primary government partner for data sharing and policy advocacy.' },
  { n:'FIDA Kenya',          t:'Legal aid / advocacy', url:'https://fidakenya.org',        desc:'Federation of Women Lawyers — provides legal aid referrals and strategic litigation support.' },
  { n:'Usikimye',            t:'CSO / helpline',       url:'https://usikimye.org',         desc:'Community-based helpline and advocacy organisation — frontline survivor support.' },
  { n:'Kituo Cha Sheria',    t:'Legal aid',            url:'https://kituochasheria.or.ke', desc:'Legal aid and human rights centre — provides free legal services to survivors.' },
  { n:'COVAW',               t:'Access to justice',    url:'https://covaw.or.ke',          desc:'Coalition on Violence Against Women — strategic litigation and survivor advocacy.' },
  { n:'GVRC',                t:'Medical & counselling',url:'https://gvrc.or.ke',           desc:'Gender Violence Recovery Centre — medical care, psychosocial support and legal aid.' },
  { n:'Africa Data Hub',     t:'Data / research',      url:'https://africadatahub.org',    desc:'Primary data partner — producers of the Silencing Women femicide dataset.' },
  { n:'Defenders Coalition', t:'HRD network',          url:'https://defenderscoalition.org',desc:'Human rights defenders network — NiMama programme for women HRDs.' },
  { n:'LVCT Health',         t:'Health services',      url:'https://lvcthealth.org',       desc:'Health and GBV support services — post-rape care and psychosocial support.' },
]

const ORG_TYPES = [
  {v:'cso',        l:'Civil society organisation (CSO)'},
  {v:'ngo',        l:'Non-governmental organisation (NGO)'},
  {v:'government', l:'Government agency / department'},
  {v:'academic',   l:'Academic / research institution'},
  {v:'media',      l:'Media organisation'},
  {v:'legal',      l:'Legal aid / law firm'},
  {v:'health',     l:'Health / medical organisation'},
  {v:'other',      l:'Other'},
]

const PARTNERSHIP_BENEFITS = [
  { t:'Data access',         b:'Access to FemSaidia Kenya\'s verified incident database and Red Flag data for research and programming.' },
  { t:'Referral pipeline',   b:'Receive direct survivor referrals from our platform to your services.' },
  { t:'Joint advocacy',      b:'Co-author policy briefs, position papers and advocacy campaigns using shared data.' },
  { t:'Platform visibility', b:'Listed as a verified partner on the FemSaidia Kenya platform, accessible to thousands of users.' },
  { t:'API access',          b:'Technical partners can access our data API for integration into their own platforms and dashboards.' },
]

export default function PartnersTab() {
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})
  const [form, setForm]       = useState({
    org_name:'', org_type:'', county:'', website:'',
    contact_name:'', contact_email:'', contact_phone:'',
    description:'', partnership_interest:'',
    data_sharing:false, referral_pathway:false,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.org_name.trim())     e.org_name = 'Organisation name is required'
    if (!form.org_type)            e.org_type = 'Organisation type is required'
    if (!form.contact_name.trim()) e.contact_name = 'Contact name is required'
    if (!form.contact_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email))
      e.contact_email = 'Valid email is required'
    if (!form.description.trim() || form.description.length < 30)
      e.description = 'Please describe your organisation in at least 30 characters'
    if (!form.partnership_interest.trim() || form.partnership_interest.length < 30)
      e.partnership_interest = 'Please describe your partnership interest in at least 30 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setLoading(true)
    const { error } = await supabase.from('partner_applications').insert([{ ...form, status:'pending' }])
    if (error) setErrors({ submit:'Submission failed. Please try again or email admin@femsaidiakenya.org' })
    else setSuccess(true)
    setLoading(false)
  }

  const inputStyle = {
    width:'100%', fontFamily:"'Nunito Sans',sans-serif", fontSize:13,
    color:TXT, background:'#DDD0D0', border:`1px solid ${BD}`,
    padding:'9px 12px', outline:'none', marginTop:4,
  }
  const labelStyle = {
    fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif",
    letterSpacing:'.08em', textTransform:'uppercase', fontWeight:600,
    display:'block', marginTop:14, marginBottom:2,
  }

  return (
    <div className="fade-up" style={{ width:'100%' }}>
      <div style={{ borderBottom:`1px solid ${BD}`, paddingBottom:20, marginBottom:24 }}>
        <p className="label" style={{ marginBottom:8 }}>Phase C · CSO & organisational partnerships</p>
        <h1 className="serif" style={{ fontSize:36, fontWeight:700, color:TXT }}>Partners</h1>
        <p style={{ fontSize:13, color:MUT, marginTop:8, fontFamily:"'Nunito Sans',sans-serif", fontWeight:300, lineHeight:1.8, maxWidth:680 }}>
          FemSaidia Kenya is a coalition platform. We work with CSOs, legal aid organisations, government
          agencies, researchers and media to build a coordinated response to femicide in Kenya.
          If your organisation works in this space, apply to join the network.
        </p>
      </div>

      {/* Partnership benefits */}
      <div style={{ marginBottom:2 }}>
        <p className="label" style={{ marginBottom:12 }}>What partnership offers</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2, marginBottom:16 }}>
          {PARTNERSHIP_BENEFITS.map((b,i)=>(
            <div key={i} style={{ background:CRD, border:`1px solid ${BD}`, padding:'16px 18px', borderTop:`3px solid ${A}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:TXT, fontFamily:"'Nunito Sans',sans-serif", marginBottom:6 }}>{b.t}</div>
              <p style={{ fontSize:11, color:MUT, lineHeight:1.7, fontFamily:"'Nunito Sans',sans-serif" }}>{b.b}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2 }}>

        {/* Current partners */}
        <div className="card" style={{ padding:24 }}>
          <div className="section-head">
            <span>Current partners</span>
            <span style={{ color:A }}>{CURRENT_PARTNERS.length} organisations</span>
          </div>
          {CURRENT_PARTNERS.map((p,i)=>(
            <div key={i} style={{ paddingBottom:14, marginBottom:14, borderBottom:i<CURRENT_PARTNERS.length-1?`1px solid ${BD}`:'none' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                <div>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
                    <div style={{ fontSize:14, fontWeight:700, color:A, fontFamily:"'Nunito Sans',sans-serif", display:'inline-flex', alignItems:'center', gap:5, marginBottom:3 }}>
                      {p.n} <ExternalLink size={11}/>
                    </div>
                  </a>
                  <p className="label" style={{ marginBottom:4 }}>{p.t}</p>
                  <p style={{ fontSize:12, color:MUT, lineHeight:1.6, fontFamily:"'Nunito Sans',sans-serif" }}>{p.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Application form */}
        <div className="card" style={{ padding:24 }}>
          <div className="section-head"><span>Apply to partner</span></div>
          {success ? (
            <div style={{ textAlign:'center', padding:'24px 0' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'#C8D8C0', border:'2px solid #60A050', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <Check size={22} color="#1A4810"/>
              </div>
              <div className="serif" style={{ fontSize:18, fontWeight:700, color:TXT, marginBottom:8 }}>Application received</div>
              <p style={{ fontSize:13, color:MUT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.7 }}>
                Thank you. We will review your application and respond to {form.contact_email} within 5 working days.
              </p>
            </div>
          ) : (
            <>
              <label style={labelStyle}>Organisation name <span style={{color:A}}>*</span></label>
              <input style={inputStyle} value={form.org_name} onChange={e=>set('org_name',e.target.value)}/>
              {errors.org_name && <p style={{fontSize:11,color:A,marginTop:3,fontFamily:"'Nunito Sans',sans-serif"}}>{errors.org_name}</p>}

              <label style={labelStyle}>Organisation type <span style={{color:A}}>*</span></label>
              <select style={inputStyle} value={form.org_type} onChange={e=>set('org_type',e.target.value)}>
                <option value="">Select type</option>
                {ORG_TYPES.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
              </select>
              {errors.org_type && <p style={{fontSize:11,color:A,marginTop:3,fontFamily:"'Nunito Sans',sans-serif"}}>{errors.org_type}</p>}

              <label style={labelStyle}>County / base of operations</label>
              <input style={inputStyle} value={form.county} onChange={e=>set('county',e.target.value)}/>

              <label style={labelStyle}>Website</label>
              <input style={inputStyle} value={form.website} onChange={e=>set('website',e.target.value)} placeholder="https://..."/>

              <label style={labelStyle}>Contact person name <span style={{color:A}}>*</span></label>
              <input style={inputStyle} value={form.contact_name} onChange={e=>set('contact_name',e.target.value)}/>
              {errors.contact_name && <p style={{fontSize:11,color:A,marginTop:3,fontFamily:"'Nunito Sans',sans-serif"}}>{errors.contact_name}</p>}

              <label style={labelStyle}>Contact email <span style={{color:A}}>*</span></label>
              <input style={inputStyle} type="email" value={form.contact_email} onChange={e=>set('contact_email',e.target.value)}/>
              {errors.contact_email && <p style={{fontSize:11,color:A,marginTop:3,fontFamily:"'Nunito Sans',sans-serif"}}>{errors.contact_email}</p>}

              <label style={labelStyle}>Contact phone</label>
              <input style={inputStyle} type="tel" value={form.contact_phone} onChange={e=>set('contact_phone',e.target.value)}/>

              <label style={labelStyle}>What does your organisation do? <span style={{color:A}}>*</span></label>
              <textarea style={{...inputStyle,minHeight:80,resize:'vertical'}}
                value={form.description} onChange={e=>set('description',e.target.value)}
                placeholder="Brief description of your organisation's mandate and activities"/>
              {errors.description && <p style={{fontSize:11,color:A,marginTop:3,fontFamily:"'Nunito Sans',sans-serif"}}>{errors.description}</p>}

              <label style={labelStyle}>Why do you want to partner with FemSaidia Kenya? <span style={{color:A}}>*</span></label>
              <textarea style={{...inputStyle,minHeight:80,resize:'vertical'}}
                value={form.partnership_interest} onChange={e=>set('partnership_interest',e.target.value)}
                placeholder="What specific collaboration are you interested in?"/>
              {errors.partnership_interest && <p style={{fontSize:11,color:A,marginTop:3,fontFamily:"'Nunito Sans',sans-serif"}}>{errors.partnership_interest}</p>}

              <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:16 }}>
                {[
                  {k:'data_sharing',     l:'We are willing to share anonymised data with FemSaidia Kenya'},
                  {k:'referral_pathway', l:'We can receive survivor referrals from the platform'},
                ].map(({k,l})=>(
                  <label key={k} style={{ display:'flex', gap:8, cursor:'pointer', alignItems:'flex-start' }}>
                    <input type="checkbox" checked={form[k]} onChange={e=>set(k,e.target.checked)}
                      style={{ marginTop:2, flexShrink:0, accentColor:A }}/>
                    <p style={{ fontSize:12, color:TXT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.6 }}>{l}</p>
                  </label>
                ))}
              </div>

              {errors.submit && <p style={{fontSize:11,color:A,marginTop:10,fontFamily:"'Nunito Sans',sans-serif"}}>{errors.submit}</p>}

              <button onClick={submit} disabled={loading}
                style={{ marginTop:16, width:'100%', fontFamily:"'Nunito Sans',sans-serif", fontSize:13, fontWeight:700, padding:'12px', background:loading?MUT:A, color:'#F0D0D8', border:'none', cursor:loading?'wait':'pointer', letterSpacing:'.04em' }}>
                {loading ? 'Submitting...' : 'Submit application →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
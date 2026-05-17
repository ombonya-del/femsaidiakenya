import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  LogOut, CheckCircle, XCircle, AlertTriangle, Edit2, Save, X,
  ChevronUp, Trash2, Eye, RefreshCw, Send, BarChart2, Flag,
  FileText, Users, Mail, Shield, BookOpen, MessageSquare, Heart
} from 'lucide-react'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase      = createClient(SUPABASE_URL, SUPABASE_KEY)

const A   = '#8A1030'
const BD  = '#B89AAA'
const BG  = '#D4BEC4'
const CRD = '#C4AABB'
const TXT = '#180410'
const MUT = '#7A4A60'

const labelSt = {
  fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif",
  letterSpacing:'.08em', textTransform:'uppercase',
  display:'block', marginBottom:3, marginTop:10
}
const inputSt = {
  fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:TXT,
  background:'#EAD8D8', border:`1px solid ${BD}`, padding:'7px 10px',
  outline:'none', width:'100%'
}

const STATUS_OPTIONS = [
  'reported','investigated','charged','trial','convicted','acquitted','dismissed','cold','no_action'
]
const COUNTIES = [
  'Nairobi','Kiambu','Mombasa','Nakuru','Kisumu','Kajiado','Kwale',
  "Machakos","Murang'a",'Kilifi','Uasin Gishu','Trans Nzoia','Meru',
  'Kakamega','Nyeri','Nandi','Embu','Kirinyaga','Bungoma','Homa Bay','Other'
]
const STATUS_COLORS = {
  reported:'#DDD0D0', investigated:'#E8D8C0', charged:'#D8E0C8',
  trial:'#C8D8E8', convicted:'#C8D8C0', acquitted:'#DCC8D8',
  dismissed:'#E0D0C0', cold:'#D0D4D8', no_action:'#E8D0C8'
}

// ── CASE FORM (module level — prevents input focus loss) ──────────────────────
const CaseForm = ({ data, setData, onSave, onCancel, saveLabel }) => (
  <div style={{ background:'#D4BCBC', border:`1px solid ${BD}`, padding:18, marginBottom:2 }}>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
      {[
        {l:'Victim name (if known)', k:'victim_name'},
        {l:'County',     k:'county', type:'county'},
        {l:'Location',   k:'location'},
        {l:'Date of incident', k:'incident_date', type:'date'},
        {l:'Age (if known)', k:'victim_age', type:'number'},
        {l:'Age range',  k:'victim_age_range', type:'age_range'},
        {l:'Status',     k:'status', type:'status'},
        {l:'Perpetrator relationship to victim', k:'perpetrator_relationship', type:'relationship'},
        {l:'Perpetrator age (if known)', k:'perpetrator_age', type:'number'},
        {l:'Source type', k:'source_type'},
        {l:'Source URL', k:'source_url'},
        {l:'Court reference', k:'court_ref'},
        {l:'Sentence (if convicted)', k:'sentence'},
        {l:'Next hearing date', k:'next_hearing', type:'date'},
        {l:'Tech platforms (comma separated)', k:'tech_platforms'},
        {l:'Admin notes', k:'admin_notes'},
      ].map(({l,k,type}) => (
        <div key={k} style={{ gridColumn: ['source_url','court_ref','admin_notes'].includes(k) ? 'span 2' : 'span 1' }}>
          <label style={labelSt}>{l}</label>
          {type==='county' ? (
            <select style={inputSt} value={data[k]||''} onChange={e=>setData(d=>({...d,[k]:e.target.value}))}>
              <option value="">Select</option>
              {COUNTIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          ) : type==='status' ? (
            <select style={inputSt} value={data[k]||''} onChange={e=>setData(d=>({...d,[k]:e.target.value}))}>
              {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
            </select>
          ) : type==='date' ? (
            <input style={inputSt} type="date" value={data[k]||''} onChange={e=>setData(d=>({...d,[k]:e.target.value}))}/>
          ) : type==='number' ? (
            <input style={inputSt} type="number" value={data[k]||''} onChange={e=>setData(d=>({...d,[k]:e.target.value?parseInt(e.target.value):null}))}/>
          ) : type==='age_range' ? (
            <select style={inputSt} value={data[k]||'unknown'} onChange={e=>setData(d=>({...d,[k]:e.target.value}))}>
              <option value='unknown'>Unknown</option>
              <option value='under_18'>Under 18</option>
              <option value='18_25'>18-25</option>
              <option value='26_35'>26-35</option>
              <option value='36_45'>36-45</option>
              <option value='46_plus'>46+</option>
            </select>
          ) : type==='relationship' ? (
            <select style={inputSt} value={data[k]||'unknown'} onChange={e=>setData(d=>({...d,[k]:e.target.value}))}>
              <option value='unknown'>Unknown</option>
              <option value='intimate_partner'>Intimate partner</option>
              <option value='ex_partner'>Ex-partner</option>
              <option value='family_member'>Family member</option>
              <option value='acquaintance'>Acquaintance</option>
              <option value='stranger'>Stranger</option>
              <option value='employer'>Employer / person of authority</option>
              <option value='online_contact'>Online contact</option>
            </select>
          ) : (
            <input style={inputSt} value={data[k]||''} onChange={e=>setData(d=>({...d,[k]:e.target.value}))}/>
          )}
        </div>
      ))}
      <div>
        <label style={labelSt}>Tech facilitated</label>
        <label style={{ display:'flex', gap:8, cursor:'pointer', alignItems:'center', marginTop:6 }}>
          <input type="checkbox" checked={!!data.tech_facilitated} onChange={e=>setData(d=>({...d,tech_facilitated:e.target.checked}))} style={{ accentColor:A }}/>
          <span style={{ fontSize:12, color:TXT, fontFamily:"'Nunito Sans',sans-serif" }}>Yes</span>
        </label>
      </div>
      <div>
        <label style={labelSt}>Verified</label>
        <label style={{ display:'flex', gap:8, cursor:'pointer', alignItems:'center', marginTop:6 }}>
          <input type="checkbox" checked={!!data.verified} onChange={e=>setData(d=>({...d,verified:e.target.checked}))} style={{ accentColor:A }}/>
          <span style={{ fontSize:12, color:TXT, fontFamily:"'Nunito Sans',sans-serif" }}>Yes</span>
        </label>
      </div>
    </div>
    <div style={{ display:'flex', gap:8, marginTop:16 }}>
      <button onClick={onSave}
        style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
          padding:'8px 20px', background:A, color:'#fff', border:'none', cursor:'pointer' }}>
        {saveLabel||'Save'}
      </button>
      <button onClick={onCancel}
        style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12,
          padding:'8px 16px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>
        Cancel
      </button>
    </div>
  </div>
)

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen() {
  const [email, setEmail]   = useState('')
  const [sent,  setSent]    = useState(false)
  const [error, setError]   = useState('')

  const login = async () => {
    if (!email) return
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:TXT, padding:40, maxWidth:400, width:'100%' }}>
        <h1 style={{ fontFamily:"'Lora',serif", fontSize:28, fontWeight:700, color:'#fff', marginBottom:8 }}>
          FemSaidia Admin
        </h1>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:BD, marginBottom:24 }}>
          Enter your admin email to receive a magic link.
        </p>
        {sent ? (
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:14, color:'#4ACA70' }}>
            ✓ Check your email for the login link.
          </p>
        ) : (
          <>
            <input value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="admin@femsaidiakenya.org" type="email"
              style={{ width:'100%', padding:'10px 14px', marginBottom:12, boxSizing:'border-box',
                fontFamily:"'Nunito Sans',sans-serif", fontSize:13, background:'#2A0818',
                border:`1px solid ${BD}`, color:'#fff', outline:'none' }}
              onKeyDown={e=>e.key==='Enter'&&login()}/>
            {error && <p style={{ color:'#FF6060', fontSize:12, marginBottom:8 }}>{error}</p>}
            <button onClick={login}
              style={{ width:'100%', padding:'10px', fontFamily:"'Nunito Sans',sans-serif",
                fontSize:13, fontWeight:700, background:A, color:'#fff', border:'none', cursor:'pointer' }}>
              Send magic link
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── SUBMISSIONS TAB ───────────────────────────────────────────────────────────
function SubmissionsTab() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('pending')
  const [editing, setEditing]         = useState(null)
  const [editData, setEditData]       = useState({})

  const load = () => {
    setLoading(true)
    supabase.from('redflag_submissions').select('*').order('created_at',{ascending:false})
      .then(({data}) => { setSubmissions(data||[]); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const update = async (id, updates) => {
    await supabase.from('redflag_submissions').update(updates).eq('id',id)
    load(); setEditing(null)
  }

  const approve = async (sub) => {
    await supabase.from('redflag_profiles').insert([{
      name: sub.name, aliases: sub.aliases, county: sub.county,
      social_handles: sub.social_handles, modus_operandi: sub.modus_operandi,
      details: sub.details, tier: 3, status: 'approved'
    }])
    await update(sub.id, { status:'approved' })
  }

  const filtered = submissions.filter(s => filter==='all' ? true : s.status===filter)
  const counts   = { pending: submissions.filter(s=>s.status==='pending').length, approved: submissions.filter(s=>s.status==='approved').length, rejected: submissions.filter(s=>s.status==='rejected').length, all: submissions.length }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:TXT }}>Red Flag Submissions</h2>
        <div style={{ display:'flex', gap:8 }}>
          {['pending','approved','rejected','all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                padding:'5px 12px', border:`1px solid ${BD}`, cursor:'pointer',
                background: filter===f ? A : CRD, color: filter===f ? '#fff' : MUT }}>
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {loading ? <p style={{ color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>Loading…</p>
      : filtered.map(sub => (
        <div key={sub.id} style={{ background:CRD, border:`1px solid ${BD}`, marginBottom:12, padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
            <div>
              <div style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:700, color:TXT }}>{sub.name}</div>
              <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:MUT, marginTop:3 }}>
                {sub.county && `${sub.county} · `}
                {sub.created_at && new Date(sub.created_at).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}
              </div>
            </div>
            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
              padding:'2px 8px', letterSpacing:'.08em', textTransform:'uppercase',
              background: sub.status==='approved'?'#1A5A2A':sub.status==='rejected'?'#8A1030':'#CA8A04',
              color:'#fff' }}>{sub.status}</span>
          </div>

          {editing===sub.id ? (
            <div>
              {['name','aliases','county','social_handles','modus_operandi','details'].map(k => (
                <div key={k} style={{ marginBottom:8 }}>
                  <label style={labelSt}>{k.replace(/_/g,' ')}</label>
                  <input value={editData[k]||''} onChange={e=>setEditData({...editData,[k]:e.target.value})}
                    style={inputSt}/>
                </div>
              ))}
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <button onClick={() => update(sub.id, editData)}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                    padding:'5px 12px', background:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>
                  Save
                </button>
                <button onClick={() => setEditing(null)}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                    padding:'5px 12px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {sub.aliases && <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, marginBottom:4 }}>Also: {sub.aliases}</p>}
              {sub.social_handles && <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, marginBottom:4 }}>Social: {sub.social_handles}</p>}
              <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:TXT, lineHeight:1.6, marginBottom:10 }}>{sub.modus_operandi}</p>
              {sub.details && <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT }}>{sub.details}</p>}
            </div>
          )}

          {editing!==sub.id && (
            <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
              <button onClick={() => { setEditing(sub.id); setEditData({...sub}) }}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                  padding:'5px 12px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>
                Edit
              </button>
              {sub.status!=='approved' && (
                <button onClick={() => approve(sub)}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                    padding:'5px 12px', background:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>
                  Approve & publish
                </button>
              )}
              {sub.status!=='rejected' && (
                <button onClick={() => update(sub.id,{status:'rejected'})}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                    padding:'5px 12px', background:A, color:'#fff', border:'none', cursor:'pointer' }}>
                  Reject
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── PROFILES TAB ──────────────────────────────────────────────────────────────
function ProfilesTab() {
  const [profiles, setProfiles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [editing,  setEditing]  = useState(null)
  const [editData, setEditData] = useState({})

  const load = () => {
    setLoading(true)
    supabase.from('redflag_profiles').select('*').order('created_at',{ascending:false})
      .then(({data}) => { setProfiles(data||[]); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const update = async (id, updates) => {
    await supabase.from('redflag_profiles').update(updates).eq('id',id)
    load(); setEditing(null)
  }

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase()
    return !q || p.name?.toLowerCase().includes(q) || p.county?.toLowerCase().includes(q)
  })

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:TXT }}>
          Profiles · {profiles.length} published
        </h2>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Search by name or county…"
        style={{ ...inputSt, marginBottom:12 }}/>

      {loading ? <p style={{ color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>Loading…</p>
      : filtered.map(p => (
        <div key={p.id} style={{ background:CRD, border:`1px solid ${BD}`, marginBottom:8, padding:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Lora',serif", fontSize:15, fontWeight:700, color:TXT, marginBottom:4 }}>{p.name}</div>
              <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:MUT }}>
                Tier {p.tier} · {p.county} · {p.status}
              </div>
              {editing!==p.id && <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, marginTop:6 }}>{p.modus_operandi?.slice(0,100)}…</p>}
            </div>
            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
              <button onClick={() => { setEditing(editing===p.id?null:p.id); setEditData({...p}) }}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  padding:'4px 10px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>
                {editing===p.id?'Close':'Edit'}
              </button>
              <button onClick={() => update(p.id,{status:p.status==='approved'?'hidden':'approved'})}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  padding:'4px 10px', background:p.status==='approved'?A:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>
                {p.status==='approved'?'Hide':'Show'}
              </button>
            </div>
          </div>
          {editing===p.id && (
            <div style={{ marginTop:12 }}>
              {['name','aliases','county','social_handles','modus_operandi','details'].map(k => (
                <div key={k} style={{ marginBottom:8 }}>
                  <label style={labelSt}>{k.replace(/_/g,' ')}</label>
                  <input value={editData[k]||''} onChange={e=>setEditData({...editData,[k]:e.target.value})} style={inputSt}/>
                </div>
              ))}
              <div style={{ display:'flex', gap:6, marginTop:8 }}>
                <label style={labelSt}>Tier</label>
                <select value={editData.tier||3} onChange={e=>setEditData({...editData,tier:parseInt(e.target.value)})} style={inputSt}>
                  <option value={1}>1 — Confirmed</option>
                  <option value={2}>2 — Multiple reports</option>
                  <option value={3}>3 — Flagged</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <button onClick={() => update(p.id,editData)}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                    padding:'5px 12px', background:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>
                  Save
                </button>
                <button onClick={() => setEditing(null)}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                    padding:'5px 12px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── LINDALINDA TAB ────────────────────────────────────────────────────────────
function LindaLindaTab() {
  const [norms,   setNorms]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('published')
  const [editing, setEditing] = useState(null)
  const [editText,setEditText]= useState({})

  const load = () => {
    setLoading(true)
    supabase.from('safety_norms').select('*').order('created_at',{ascending:false})
      .then(({data}) => { setNorms(data||[]); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const update = async (id, updates) => {
    await supabase.from('safety_norms').update(updates).eq('id',id)
    load(); setEditing(null)
  }

  const filtered = norms.filter(n => filter==='all' ? true : n.status===filter)
  const counts = {
    published: norms.filter(n=>n.status==='published').length,
    flagged:   norms.filter(n=>n.status==='flagged').length,
    removed:   norms.filter(n=>n.status==='removed').length,
    all:       norms.length
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:TXT, marginBottom:4 }}>LindaLinda · Safety Norms</h2>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT }}>Community-submitted safety stories.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[{id:'published',l:`Published (${counts.published})`},{id:'flagged',l:`Flagged (${counts.flagged})`},{id:'removed',l:`Removed (${counts.removed})`},{id:'all',l:`All (${counts.all})`}].map(f => (
            <button key={f.id} onClick={()=>setFilter(f.id)}
              style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                padding:'5px 12px', border:`1px solid ${BD}`, cursor:'pointer',
                background:filter===f.id?A:CRD, color:filter===f.id?'#fff':MUT }}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p style={{ color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontSize:12 }}>Loading…</p>
      : filtered.map(norm => (
        <div key={norm.id} style={{ background:CRD, border:`1px solid ${BD}`, marginBottom:12, padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Lora',serif", fontSize:15, fontWeight:700, color:TXT, marginBottom:4 }}>{norm.title}</div>
              <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:MUT }}>
                {norm.submitted_by||'Anonymous'} · {norm.context||'General'} · {norm.created_at&&new Date(norm.created_at).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}
              </div>
            </div>
            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
              padding:'2px 8px', letterSpacing:'.08em', textTransform:'uppercase',
              background:norm.status==='published'?'#1A5A2A':norm.status==='flagged'?'#CA8A04':'#8A1030',
              color:'#fff' }}>{norm.status}</span>
          </div>

          {editing===norm.id ? (
            <div>
              <textarea value={editText.story??norm.story} onChange={e=>setEditText({...editText,story:e.target.value})} rows={4}
                style={{ width:'100%', padding:'8px 12px', fontFamily:"'Nunito Sans',sans-serif",
                  fontSize:12, background:'rgba(255,255,255,0.7)', border:`1px solid ${BD}`,
                  color:TXT, outline:'none', resize:'vertical', boxSizing:'border-box', marginBottom:8 }}/>
              <input value={editText.caveat??norm.caveat??''} onChange={e=>setEditText({...editText,caveat:e.target.value})}
                placeholder="Admin caveat (optional)..."
                style={{ ...inputSt, marginBottom:8 }}/>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>update(norm.id,{story:editText.story??norm.story,caveat:editText.caveat??norm.caveat??''})}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                    padding:'5px 12px', background:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>
                  Save
                </button>
                <button onClick={()=>{setEditing(null);setEditText({})}}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                    padding:'5px 12px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:TXT, lineHeight:1.7 }}>{norm.story}</p>
          )}

          {editing!==norm.id && (
            <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
              <button onClick={()=>{setEditing(norm.id);setEditText({})}}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                  padding:'5px 12px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>
                Edit / Caveat
              </button>
              {norm.status!=='published'&&<button onClick={()=>update(norm.id,{status:'published'})}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                  padding:'5px 12px', background:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>
                Publish
              </button>}
              {norm.status!=='flagged'&&<button onClick={()=>update(norm.id,{status:'flagged'})}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                  padding:'5px 12px', background:'#CA8A04', color:'#fff', border:'none', cursor:'pointer' }}>
                Flag
              </button>}
              {norm.status!=='removed'&&<button onClick={()=>update(norm.id,{status:'removed'})}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                  padding:'5px 12px', background:A, color:'#fff', border:'none', cursor:'pointer' }}>
                Remove
              </button>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── ARCHETYPES TAB ────────────────────────────────────────────────────────────
function ArchetypesTab() {
  const ARCH_IDS = [
    {id:'naive',      label:'The Naive',      color:'#1A3F6F'},
    {id:'precocious', label:'The Precocious',  color:'#C06020'},
    {id:'allin',      label:'The All-In',      color:'#7A4ABA'},
  ]
  const SECTIONS = [
    {id:'protective', label:'Protect Yourself'},
    {id:'redflags',   label:'Red Flags'},
  ]
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [activeArch, setActiveArch] = useState('naive')
  const [activeSec,  setActiveSec]  = useState('protective')
  const [editing,    setEditing]    = useState(null)
  const [editText,   setEditText]   = useState('')
  const [newText,    setNewText]    = useState('')
  const [adding,     setAdding]     = useState(false)

  const load = () => {
    setLoading(true)
    supabase.from('archetype_content').select('*').order('sort_order',{ascending:true})
      .then(({data}) => { setItems(data||[]); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const filtered = items.filter(i=>i.archetype_id===activeArch&&i.section===activeSec)
  const arch = ARCH_IDS.find(a=>a.id===activeArch)

  const save = async (id) => {
    await supabase.from('archetype_content').update({content:editText,updated_at:new Date().toISOString()}).eq('id',id)
    setEditing(null); setEditText(''); load()
  }
  const toggle = async (id, active) => {
    await supabase.from('archetype_content').update({active:!active}).eq('id',id)
    load()
  }
  const addNew = async () => {
    if(!newText.trim()) return
    const maxOrder = filtered.reduce((m,i)=>Math.max(m,i.sort_order||0),0)
    await supabase.from('archetype_content').insert({
      archetype_id:activeArch, section:activeSec, content:newText.trim(), sort_order:maxOrder+1, active:true
    })
    setNewText(''); setAdding(false); load()
  }

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:TXT, marginBottom:4 }}>JiJue · JiTume Content</h2>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT }}>Edit protective measures and red flags. Changes go live immediately.</p>
      </div>
      <div style={{ display:'flex', gap:2, marginBottom:12 }}>
        {ARCH_IDS.map(a => (
          <button key={a.id} onClick={()=>setActiveArch(a.id)}
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
              padding:'8px 16px', border:'none', cursor:'pointer',
              background:activeArch===a.id?a.color:CRD, color:activeArch===a.id?'#fff':MUT }}>
            {a.label}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', gap:2, marginBottom:16 }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={()=>setActiveSec(s.id)}
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
              padding:'6px 14px', border:'none', cursor:'pointer',
              background:activeSec===s.id?arch?.color||A:CRD, color:activeSec===s.id?'#fff':MUT }}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontSize:12 }}>Loading…</p> : (
        <>
          {filtered.map((item,i) => (
            <div key={item.id} style={{ background:item.active?CRD:'rgba(180,150,160,0.3)', border:`1px solid ${BD}`, marginBottom:8, padding:14, opacity:item.active?1:0.6 }}>
              {editing===item.id ? (
                <div>
                  <textarea value={editText} onChange={e=>setEditText(e.target.value)} rows={3}
                    style={{ width:'100%', padding:'8px 12px', fontFamily:"'Nunito Sans',sans-serif",
                      fontSize:12, background:'rgba(255,255,255,0.8)', border:`1px solid ${BD}`,
                      color:TXT, outline:'none', resize:'vertical', boxSizing:'border-box', marginBottom:8 }}/>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={()=>save(item.id)}
                      style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                        padding:'5px 12px', background:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>Save</button>
                    <button onClick={()=>{setEditing(null);setEditText('')}}
                      style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                        padding:'5px 12px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:MUT, marginBottom:4 }}>#{i+1}</div>
                    <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:TXT, lineHeight:1.6 }}>{item.content}</div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <button onClick={()=>{setEditing(item.id);setEditText(item.content)}}
                      style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                        padding:'4px 10px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>Edit</button>
                    <button onClick={()=>toggle(item.id,item.active)}
                      style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                        padding:'4px 10px', background:item.active?A:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>
                      {item.active?'Hide':'Show'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length===0&&<p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, fontStyle:'italic', marginBottom:12 }}>No items yet. Add one below.</p>}

          {adding ? (
            <div style={{ background:'rgba(255,255,255,0.5)', border:`1px solid ${BD}`, padding:14, marginTop:8 }}>
              <textarea value={newText} onChange={e=>setNewText(e.target.value)} placeholder="Enter new item..." rows={3}
                style={{ width:'100%', padding:'8px 12px', fontFamily:"'Nunito Sans',sans-serif",
                  fontSize:12, background:'rgba(255,255,255,0.8)', border:`1px solid ${BD}`,
                  color:TXT, outline:'none', resize:'vertical', boxSizing:'border-box', marginBottom:8 }}/>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={addNew}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                    padding:'5px 12px', background:arch?.color||A, color:'#fff', border:'none', cursor:'pointer' }}>Add item</button>
                <button onClick={()=>{setAdding(false);setNewText('')}}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                    padding:'5px 12px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setAdding(true)}
              style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                padding:'8px 16px', background:arch?.color||A, color:'#fff', border:'none', cursor:'pointer', marginTop:8 }}>
              + Add new item
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ── VOICES TAB ────────────────────────────────────────────────────────────────
function VoicesTab() {
  const ARCHS = [
    {id:'naive',color:'#1A3F6F',label:'The Naive'},
    {id:'precocious',color:'#C06020',label:'The Precocious'},
    {id:'allin',color:'#7A4ABA',label:'The All-In'},
  ]
  const [voices,     setVoices]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('published')
  const [archFilter, setArchFilter] = useState('all')
  const [editing,    setEditing]    = useState(null)
  const [editStory,  setEditStory]  = useState('')
  const typeLabel = {survivor:'💪 Survivor',left_behind:'🕯 Left behind',witness:'👁 Witness'}

  const load = () => {
    setLoading(true)
    supabase.from('archetype_voices').select('*').order('created_at',{ascending:false})
      .then(({data}) => { setVoices(data||[]); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const update = async (id, updates) => {
    await supabase.from('archetype_voices').update(updates).eq('id',id)
    load(); setEditing(null)
  }

  const filtered = voices.filter(v =>
    (filter==='all'?true:v.status===filter) &&
    (archFilter==='all'?true:v.archetype_id===archFilter)
  )

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:TXT, marginBottom:4 }}>Community Voices</h2>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT }}>Survivor stories, left-behind reflections and witness accounts.</p>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
        {['all','naive','precocious','allin'].map(a => (
          <button key={a} onClick={()=>setArchFilter(a)}
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
              padding:'5px 12px', border:`1px solid ${BD}`, cursor:'pointer',
              background:archFilter===a?A:CRD, color:archFilter===a?'#fff':MUT }}>
            {a==='all'?'All':ARCHS.find(x=>x.id===a)?.label||a}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {[{id:'published',l:'Published'},{id:'flagged',l:'Flagged'},{id:'removed',l:'Removed'},{id:'all',l:'All'}].map(f => (
          <button key={f.id} onClick={()=>setFilter(f.id)}
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
              padding:'5px 12px', border:`1px solid ${BD}`, cursor:'pointer',
              background:filter===f.id?A:CRD, color:filter===f.id?'#fff':MUT }}>
            {f.l} ({voices.filter(v=>f.id==='all'?true:v.status===f.id).length})
          </button>
        ))}
      </div>

      {loading ? <p style={{ color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontSize:12 }}>Loading…</p>
      : filtered.length===0 ? <p style={{ color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontStyle:'italic' }}>No voices in this category.</p>
      : filtered.map(voice => (
        <div key={voice.id} style={{ background:CRD, border:`1px solid ${BD}`, marginBottom:10, padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:8 }}>
            <div>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
                  letterSpacing:'.08em', textTransform:'uppercase', padding:'2px 8px',
                  background:ARCHS.find(a=>a.id===voice.archetype_id)?.color||A, color:'#fff' }}>
                  {ARCHS.find(a=>a.id===voice.archetype_id)?.label||voice.archetype_id}
                </span>
                <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:MUT }}>{typeLabel[voice.voice_type]||voice.voice_type}</span>
              </div>
              <div style={{ fontFamily:"'Lora',serif", fontSize:14, fontWeight:700, color:TXT }}>
                {voice.name||'Anonymous'}{voice.relationship?` · ${voice.relationship}`:''}
              </div>
            </div>
            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
              padding:'2px 8px', letterSpacing:'.08em', textTransform:'uppercase',
              background:voice.status==='published'?'#1A5A2A':voice.status==='flagged'?'#CA8A04':'#8A1030',
              color:'#fff', flexShrink:0 }}>{voice.status}</span>
          </div>

          {editing===voice.id ? (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                <div>
                  <label style={labelSt}>Archetype</label>
                  <select value={editStory.archetype_id||voice.archetype_id}
                    onChange={e=>setEditStory({...editStory,archetype_id:e.target.value})}
                    style={inputSt}>
                    <option value="naive">The Naive</option>
                    <option value="precocious">The Precocious</option>
                    <option value="allin">The All-In</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Voice type</label>
                  <select value={editStory.voice_type||voice.voice_type}
                    onChange={e=>setEditStory({...editStory,voice_type:e.target.value})}
                    style={inputSt}>
                    <option value="survivor">💪 Survivor</option>
                    <option value="left_behind">🕯 Left behind</option>
                    <option value="witness">👁 Witness</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Name</label>
                  <input value={editStory.name||voice.name||''}
                    onChange={e=>setEditStory({...editStory,name:e.target.value})}
                    style={inputSt}/>
                </div>
                <div>
                  <label style={labelSt}>Relationship</label>
                  <input value={editStory.relationship||voice.relationship||''}
                    onChange={e=>setEditStory({...editStory,relationship:e.target.value})}
                    style={inputSt}/>
                </div>
              </div>
              <label style={labelSt}>Story</label>
              <textarea value={editStory.story||voice.story} onChange={e=>setEditStory({...editStory,story:e.target.value})} rows={4}
                style={{ width:'100%', padding:'8px 12px', fontFamily:"'Nunito Sans',sans-serif",
                  fontSize:12, background:'rgba(255,255,255,0.8)', border:`1px solid ${BD}`,
                  color:TXT, outline:'none', resize:'vertical', boxSizing:'border-box', marginBottom:8 }}/>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>update(voice.id,{
                    story:editStory.story||voice.story,
                    archetype_id:editStory.archetype_id||voice.archetype_id,
                    voice_type:editStory.voice_type||voice.voice_type,
                    name:editStory.name||voice.name,
                    relationship:editStory.relationship||voice.relationship,
                  })}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                    padding:'5px 12px', background:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>Save</button>
                <button onClick={()=>setEditing(null)}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                    padding:'5px 12px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:TXT, lineHeight:1.7, fontStyle:'italic', marginBottom:10 }}>"{voice.story}"</p>
          )}

          {editing!==voice.id && (
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <button onClick={()=>{setEditing(voice.id);setEditStory({...voice})}}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  padding:'4px 10px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>Edit</button>
              {voice.status!=='published'&&<button onClick={()=>update(voice.id,{status:'published'})}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  padding:'4px 10px', background:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>Publish</button>}
              {voice.status!=='flagged'&&<button onClick={()=>update(voice.id,{status:'flagged'})}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  padding:'4px 10px', background:'#CA8A04', color:'#fff', border:'none', cursor:'pointer' }}>Flag</button>}
              <button onClick={async()=>{
                  await supabase.from('archetype_voices').delete().eq('id',voice.id)
                  load()
                }}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  padding:'4px 10px', background:'#5A0010', color:'#fff', border:'none', cursor:'pointer' }}>
                Delete permanently
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── MEMORIAL TAB ──────────────────────────────────────────────────────────────
function MemorialTab() {
  const ARCHS = [
    {id:'naive',      label:'The Naive',      color:'#1A3F6F'},
    {id:'precocious', label:'The Precocious',  color:'#C06020'},
    {id:'allin',      label:'The All-In',      color:'#7A4ABA'},
  ]
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [active,  setActive]  = useState('naive')
  const [adding,  setAdding]  = useState(false)
  const [newForm, setNewForm] = useState({victim_name:'',age:'',county:'',incident_date:'',note:''})

  const load = () => {
    setLoading(true)
    supabase.from('archetype_memorial').select('*').order('sort_order',{ascending:true})
      .then(({data}) => { setItems(data||[]); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const toggle = async (id, isActive) => {
    await supabase.from('archetype_memorial').update({active:!isActive}).eq('id',id)
    load()
  }
  const addNew = async () => {
    if(!newForm.victim_name.trim()) return
    const maxOrder = items.filter(i=>i.archetype_id===active).reduce((m,i)=>Math.max(m,i.sort_order||0),0)
    await supabase.from('archetype_memorial').insert({...newForm,archetype_id:active,sort_order:maxOrder+1,active:true})
    setNewForm({victim_name:'',age:'',county:'',incident_date:'',note:''})
    setAdding(false); load()
  }

  const filtered = items.filter(i=>i.archetype_id===active)
  const arch = ARCHS.find(a=>a.id===active)

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:TXT, marginBottom:4 }}>We Remember</h2>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT }}>Manage the memorial names shown in each archetype.</p>
      </div>
      <div style={{ display:'flex', gap:2, marginBottom:16 }}>
        {ARCHS.map(a => (
          <button key={a.id} onClick={()=>setActive(a.id)}
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
              padding:'8px 16px', border:'none', cursor:'pointer',
              background:active===a.id?a.color:CRD, color:active===a.id?'#fff':MUT }}>
            {a.label}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontSize:12 }}>Loading…</p> : (
        <>
          {filtered.map(item => (
            <div key={item.id} style={{ background:item.active?CRD:'rgba(180,150,160,0.3)',
              border:`1px solid ${BD}`, marginBottom:8, padding:14, opacity:item.active?1:0.5,
              display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
              <div>
                <div style={{ fontFamily:"'Lora',serif", fontSize:14, fontWeight:700, color:TXT }}>{item.victim_name}</div>
                <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:MUT }}>
                  {item.county}{item.age?` · ${item.age}`:''}{item.incident_date?` · ${new Date(item.incident_date).toLocaleDateString('en-KE',{month:'short',year:'numeric'})}`:''}</div>
              </div>
              <button onClick={()=>toggle(item.id,item.active)}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  padding:'4px 10px', background:item.active?A:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer', flexShrink:0 }}>
                {item.active?'Hide':'Show'}
              </button>
            </div>
          ))}

          {filtered.length===0&&<p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, fontStyle:'italic', marginBottom:12 }}>No names yet for this archetype.</p>}

          {adding ? (
            <div style={{ background:'rgba(255,255,255,0.5)', border:`1px solid ${BD}`, padding:14, marginTop:8 }}>
              {[{k:'victim_name',l:'Name *',t:'text'},{k:'age',l:'Age/Range',t:'text'},{k:'county',l:'County',t:'text'},{k:'incident_date',l:'Date',t:'date'},{k:'note',l:'Note',t:'text'}].map(f => (
                <div key={f.k} style={{ marginBottom:8 }}>
                  <label style={labelSt}>{f.l}</label>
                  <input type={f.t} value={newForm[f.k]} onChange={e=>setNewForm({...newForm,[f.k]:e.target.value})}
                    style={inputSt}/>
                </div>
              ))}
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <button onClick={addNew}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                    padding:'5px 12px', background:arch?.color||A, color:'#fff', border:'none', cursor:'pointer' }}>Add</button>
                <button onClick={()=>setAdding(false)}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                    padding:'5px 12px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setAdding(true)}
              style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                padding:'8px 16px', background:arch?.color||A, color:'#fff', border:'none', cursor:'pointer', marginTop:8 }}>
              + Add name
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ── ANALYTICS TAB ─────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [stats, setStats] = useState({cases:0,profiles:0,submissions:0,norms:0,voices:0})

  useEffect(() => {
    Promise.all([
      supabase.from('femicide_cases').select('id',{count:'exact'}),
      supabase.from('redflag_profiles').select('id',{count:'exact'}),
      supabase.from('redflag_submissions').select('id',{count:'exact'}),
      supabase.from('safety_norms').select('id',{count:'exact'}),
      supabase.from('archetype_voices').select('id',{count:'exact'}),
    ]).then(([cases,profiles,subs,norms,voices]) => {
      setStats({
        cases:cases.count||0, profiles:profiles.count||0,
        submissions:subs.count||0, norms:norms.count||0, voices:voices.count||0
      })
    })
  }, [])

  return (
    <div>
      <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:TXT, marginBottom:20 }}>Analytics</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          {l:'Femicide cases', v:stats.cases, c:'#8A1030'},
          {l:'Red Flag profiles', v:stats.profiles, c:'#5A1870'},
          {l:'Pending submissions', v:stats.submissions, c:'#CA8A04'},
          {l:'Safety norms', v:stats.norms, c:'#1A5A2A'},
          {l:'Community voices', v:stats.voices, c:'#1A3F6F'},
        ].map((s,i) => (
          <div key={i} style={{ background:CRD, border:`1px solid ${BD}`, padding:20 }}>
            <div style={{ fontFamily:"'Lora',serif", fontSize:36, fontWeight:700, color:s.c }}>{s.v}</div>
            <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, marginTop:6 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── CASES TAB ─────────────────────────────────────────────────────────────────
function CasesTab() {
  const [cases,    setCases]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(null)
  const [editData, setEditData] = useState({})
  const [showAdd,  setShowAdd]  = useState(false)
  const [newCase,  setNewCase]  = useState({
    case_ref:'', victim_name:'', victim_age_range:'unknown',
    incident_date:'', county:'', location:'', perpetrator_relationship:'unknown',
    tech_facilitated:false, tech_platforms:'',
    status:'reported', sentence:'', court_ref:'', next_hearing:'',
    source_url:'', source_type:'news', verified:false, published:true, admin_notes:''
  })

  const load = async () => {
    setLoading(true)
    const {data} = await supabase.from('femicide_cases').select('*').order('incident_date',{ascending:false})
    setCases(data||[])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const saveEdit = async (id) => {
    const {error} = await supabase.from('femicide_cases').update({
      ...editData,
      published: editData.published !== false,
      tech_platforms: typeof editData.tech_platforms === 'string'
        ? editData.tech_platforms.split(',').map(p=>p.trim()).filter(Boolean)
        : editData.tech_platforms,
      updated_at: new Date().toISOString()
    }).eq('id',id)
    if(error) console.error('Save error:',error.message)
    setEditing(null); load()
  }

  const addCase = async () => {
    // Auto-generate case ref: FSK-YYYY-NNN
    const year = newCase.incident_date ? new Date(newCase.incident_date).getFullYear() : new Date().getFullYear()
    const {data: yearCases} = await supabase.from('femicide_cases').select('case_ref').like('case_ref',`FSK-${year}-%`)
    const maxNum = (yearCases||[]).reduce((max,c) => {
      const num = parseInt(c.case_ref?.split('-')[2]||'0')
      return num > max ? num : max
    }, 0)
    const caseRef = `FSK-${year}-${String(maxNum+1).padStart(3,'0')}`
    const cleanCase = Object.fromEntries(Object.entries(newCase).map(([k,v])=>[k,v===''?null:v]))
    const {data, error} = await supabase.from('femicide_cases').insert([{
      ...cleanCase,
      case_ref: cleanCase.case_ref || caseRef,
      published: true,
      tech_platforms: (cleanCase.tech_platforms||'').split(',').map(p=>p.trim()).filter(Boolean)
    }]).select()
    if(error) { alert('Error: ' + error.message); return; }
    setShowAdd(false)
    setNewCase({case_ref:'',victim_name:'',victim_age_range:'unknown',incident_date:'',county:'',location:'',perpetrator_relationship:'unknown',tech_facilitated:false,tech_platforms:'',status:'reported',sentence:'',court_ref:'',next_hearing:'',source_url:'',source_type:'news',verified:false,published:true,admin_notes:''})
    load()
  }

  const togglePublish = async (id, published) => {
    await supabase.from('femicide_cases').update({published:!published}).eq('id',id)
    load()
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:TXT }}>Case Tracker · {cases.length} cases</h2>
        <button onClick={()=>setShowAdd(!showAdd)}
          style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
            padding:'8px 16px', background:A, color:'#fff', border:'none', cursor:'pointer' }}>
          {showAdd?'Cancel':'+ Add case'}
        </button>
      </div>

      {showAdd && (
        <CaseForm data={newCase} setData={setNewCase} onSave={addCase} onCancel={()=>setShowAdd(false)} saveLabel="Add case"/>
      )}

      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:"'Nunito Sans',sans-serif", fontSize:12 }}>
          <thead>
            <tr style={{ background:TXT, color:'#fff' }}>
              {['Victim','County','Date','Status','Verified','Published','Actions'].map(h => (
                <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontWeight:700, fontSize:11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign:'center', color:MUT, padding:20 }}>Loading...</td></tr>
            ) : cases.map(c => (
              <>
                <tr key={c.id} style={{ background:c.published?'#fff':'rgba(180,150,160,0.2)', borderBottom:`1px solid ${BD}` }}>
                  <td style={{ padding:'8px 12px', fontWeight:700 }}>{c.victim_name||'Unknown'}</td>
                  <td style={{ padding:'8px 12px' }}>{c.county}</td>
                  <td style={{ padding:'8px 12px', color:MUT, fontSize:11 }}>{c.incident_date?new Date(c.incident_date).toLocaleDateString('en-KE'):'-'}</td>
                  <td style={{ padding:'8px 12px' }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px',
                      background:STATUS_COLORS[c.status]||'#DDD', border:`1px solid ${BD}`, color:TXT }}>
                      {c.status?.replace(/_/g,' ')}
                    </span>
                  </td>
                  <td style={{ padding:'8px 12px', color:c.verified?'#166534':MUT, fontSize:11 }}>{c.verified?'✓ Yes':'Pending'}</td>
                  <td style={{ padding:'8px 12px', color:c.published?'#166534':'#8A1030', fontSize:11 }}>{c.published?'Yes':'Hidden'}</td>
                  <td style={{ padding:'8px 12px' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      <button onClick={()=>{setEditing(editing===c.id?null:c.id);setEditData({...c,tech_platforms:c.tech_platforms?.join(', ')||''})}}
                        style={{ fontFamily:"'Nunito Sans',sans-serif", padding:'3px 8px', fontSize:10, cursor:'pointer', background:CRD, border:`1px solid ${BD}`, color:MUT }}>
                        Edit
                      </button>
                      <button onClick={()=>togglePublish(c.id,c.published)}
                        style={{ fontFamily:"'Nunito Sans',sans-serif", padding:'3px 8px', fontSize:10, cursor:'pointer',
                          background:c.published?'#CA8A04':'#1A5A2A', color:'#fff', border:'none' }}>
                        {c.published?'Hide':'Show'}
                      </button>
                    </div>
                  </td>
                </tr>
                {editing===c.id && (
                  <tr key={`edit-${c.id}`}>
                    <td colSpan={7} style={{ padding:0 }}>
                      <CaseForm data={editData} setData={setEditData} onSave={()=>saveEdit(c.id)} onCancel={()=>setEditing(null)} saveLabel="Save changes"/>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── ACCESS CODES TAB ──────────────────────────────────────────────────────────
function AccessCodesTab() {
  const [codes,   setCodes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [newCode, setNewCode] = useState('')
  const [newOrg,  setNewOrg]  = useState('')

  const load = () => {
    setLoading(true)
    supabase.from('invite_codes').select('*').order('created_at',{ascending:false})
      .then(({data}) => { setCodes(data||[]); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const generate = async () => {
    const code = Math.random().toString(36).substring(2,10).toUpperCase()
    await supabase.from('invite_codes').insert([{code, org_name:newOrg, active:true}])
    setNewCode(code); load()
  }
  const toggle = async (id, active) => {
    await supabase.from('invite_codes').update({active:!active}).eq('id',id)
    load()
  }

  return (
    <div>
      <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:TXT, marginBottom:20 }}>Access Codes</h2>
      <div style={{ background:CRD, border:`1px solid ${BD}`, padding:16, marginBottom:20 }}>
        <label style={labelSt}>Organisation name</label>
        <input value={newOrg} onChange={e=>setNewOrg(e.target.value)} placeholder="e.g. FIDA Kenya"
          style={{ ...inputSt, marginBottom:8 }}/>
        <button onClick={generate}
          style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
            padding:'8px 16px', background:A, color:'#fff', border:'none', cursor:'pointer' }}>
          Generate code
        </button>
        {newCode && <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:14, color:'#1A5A2A', marginTop:10, fontWeight:700 }}>New code: {newCode}</p>}
      </div>

      {loading ? <p style={{ color:MUT }}>Loading…</p>
      : codes.map(c => (
        <div key={c.id} style={{ background:c.active?CRD:'rgba(180,150,160,0.3)', border:`1px solid ${BD}`,
          marginBottom:8, padding:12, display:'flex', justifyContent:'space-between', alignItems:'center', opacity:c.active?1:0.6 }}>
          <div>
            <div style={{ fontFamily:'monospace', fontSize:16, fontWeight:700, color:TXT, letterSpacing:'.1em' }}>{c.code}</div>
            <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:MUT, marginTop:2 }}>{c.org_name}</div>
          </div>
          <button onClick={()=>toggle(c.id,c.active)}
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
              padding:'4px 10px', background:c.active?A:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>
            {c.active?'Deactivate':'Activate'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ── TABS CONFIG ───────────────────────────────────────────────────────────────

// ── HIGHLIGHTS TAB ────────────────────────────────────────────────────────────
function HighlightsTab() {
  const PLATFORMS = ['X','TikTok','Facebook','Instagram','Reddit','Telegram','YouTube','WhatsApp']
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [adding,  setAdding]  = useState(false)
  const [form,    setForm]    = useState({
    platform:'X', content:'', context:'', reach:'', post_date:'',
    highlight_date: new Date().toISOString().slice(0,10)
  })

  const load = () => {
    setLoading(true)
    supabase.from('misogyny_highlights').select('*').order('highlight_date',{ascending:false})
      .then(({data})=>{ setItems(data||[]); setLoading(false) })
  }
  useEffect(()=>{ load() },[])

  const add = async () => {
    if(!form.content.trim()) return
    await supabase.from('misogyny_highlights').insert([{...form,active:true}])
    setAdding(false)
    setForm({platform:'X',content:'',context:'',reach:'',post_date:'',highlight_date:new Date().toISOString().slice(0,10)})
    load()
  }
  const toggle = async (id, active) => {
    await supabase.from('misogyny_highlights').update({active:!active}).eq('id',id)
    load()
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
        <div>
          <h2 style={{fontFamily:"'Lora',serif",fontSize:22,fontWeight:700,color:TXT,marginBottom:4}}>Misogyny of the Day</h2>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT}}>Curate posts that illustrate the pipeline from toxic rhetoric to violence. Appears at the top of Socials and Sentiment.</p>
        </div>
        <button onClick={()=>setAdding(!adding)}
          style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,padding:'8px 16px',background:A,color:'#fff',border:'none',cursor:'pointer',flexShrink:0}}>
          {adding?'Cancel':'+ Add highlight'}
        </button>
      </div>

      {adding && (
        <div style={{background:CRD,border:`1px solid ${BD}`,padding:16,marginBottom:16}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            <div>
              <label style={labelSt}>Platform *</label>
              <select value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})} style={inputSt}>
                {PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Date posted (optional)</label>
              <input type="date" value={form.post_date} onChange={e=>setForm({...form,post_date:e.target.value})} style={inputSt}/>
            </div>
            <div>
              <label style={labelSt}>Highlight date</label>
              <input type="date" value={form.highlight_date} onChange={e=>setForm({...form,highlight_date:e.target.value})} style={inputSt}/>
            </div>
            <div>
              <label style={labelSt}>Reach / engagement (optional)</label>
              <input value={form.reach} onChange={e=>setForm({...form,reach:e.target.value})} placeholder="e.g. 45,000 views" style={inputSt}/>
            </div>
          </div>
          <div style={{marginBottom:8}}>
            <label style={labelSt}>Post content *</label>
            <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})}
              placeholder="Paste the post text here..." rows={4}
              style={{width:'100%',padding:'8px 12px',fontFamily:"'Nunito Sans',sans-serif",fontSize:12,background:'rgba(255,255,255,0.8)',border:`1px solid ${BD}`,color:TXT,outline:'none',resize:'vertical',boxSizing:'border-box'}}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={labelSt}>Context / framing</label>
            <input value={form.context} onChange={e=>setForm({...form,context:e.target.value})}
              placeholder="e.g. This post has 45K likes. This is what normalisation looks like."
              style={inputSt}/>
          </div>
          <button onClick={add}
            style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,padding:'8px 20px',background:A,color:'#fff',border:'none',cursor:'pointer'}}>
            Publish highlight
          </button>
        </div>
      )}

      {loading ? <p style={{color:MUT,fontFamily:"'Nunito Sans',sans-serif",fontSize:12}}>Loading...</p>
      : items.length===0 ? <p style={{color:MUT,fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontStyle:'italic'}}>No highlights yet.</p>
      : items.map(item => (
        <div key={item.id} style={{background:item.active?CRD:'rgba(180,150,160,0.3)',border:`1px solid ${BD}`,marginBottom:8,padding:14,opacity:item.active?1:0.5}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,marginBottom:8}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:9,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',padding:'2px 8px',background:TXT,color:'#fff'}}>{item.platform}</span>
              <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT}}>{item.highlight_date}</span>
              {item.reach&&<span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT}}>{item.reach}</span>}
            </div>
            <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:9,fontWeight:700,padding:'2px 8px',background:item.active?'#1A5A2A':A,color:'#fff',flexShrink:0}}>{item.active?'Active':'Hidden'}</span>
          </div>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:TXT,lineHeight:1.7,fontStyle:'italic',marginBottom:item.context?8:0}}>"{item.content}"</p>
          {item.context&&<p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:A,marginBottom:10}}>↳ {item.context}</p>}
          <button onClick={()=>toggle(item.id,item.active)}
            style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,padding:'4px 10px',background:item.active?A:'#1A5A2A',color:'#fff',border:'none',cursor:'pointer'}}>
            {item.active?'Hide':'Show'}
          </button>
        </div>
      ))}
    </div>
  )
}

const TABS = [
  { id:'submissions', label:'Submissions',    icon:<Flag size={14}/> },
  { id:'profiles',    label:'Profiles',       icon:<Users size={14}/> },
  { id:'lindalinda',  label:'LindaLinda',     icon:<Shield size={14}/> },
  { id:'archetypes',  label:'JiJue/JiTume',   icon:<BookOpen size={14}/> },
  { id:'voices',      label:'Voices',         icon:<MessageSquare size={14}/> },
  { id:'memorial',    label:'We Remember',    icon:<Heart size={14}/> },
  { id:'analytics',   label:'Analytics',      icon:<BarChart2 size={14}/> },
  { id:'cases',       label:'Case tracker',   icon:<FileText size={14}/> },
  { id:'codes',       label:'Access codes',   icon:<Users size={14}/> },
  { id:'highlights',  label:'Misogyny of Day', icon:<AlertTriangle size={14}/> },
]

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('submissions')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:MUT, fontSize:13, fontFamily:"'Nunito Sans',sans-serif" }}>Loading...</p>
    </div>
  )

  if (!session) return <LoginScreen/>

  return (
    <div style={{ fontFamily:"'Nunito Sans',sans-serif", color:TXT, minHeight:'100vh', background:BG, width:'100%' }}>
      <header style={{ background:TXT, padding:'0 24px', display:'flex', alignItems:'center', gap:2, flexWrap:'wrap' }}>
        <div style={{ padding:'14px 0', marginRight:16, fontFamily:"'Lora',serif", fontSize:16, fontWeight:700, color:'#fff', whiteSpace:'nowrap' }}>
          FemSaidia Admin
        </div>
        {TABS.map(t => (
          <button key={t.id}
            className={`nav-tab${tab===t.id?' active':''}`}
            onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
        <button onClick={() => supabase.auth.signOut()}
          style={{ marginLeft:'auto', display:'inline-flex', alignItems:'center', gap:6,
            fontSize:11, color:'rgba(255,255,255,0.5)', fontFamily:"'Nunito Sans',sans-serif",
            padding:'12px 0', background:'none', border:'none', cursor:'pointer' }}>
          <LogOut size={13}/> Sign out
        </button>
      </header>

      <main style={{ padding:'24px', maxWidth:1100, margin:'0 auto' }}>
        {tab==='submissions' && <SubmissionsTab/>}
        {tab==='profiles'    && <ProfilesTab/>}
        {tab==='lindalinda'  && <LindaLindaTab/>}
        {tab==='archetypes'  && <ArchetypesTab/>}
        {tab==='voices'      && <VoicesTab/>}
        {tab==='memorial'    && <MemorialTab/>}
        {tab==='analytics'   && <AnalyticsTab/>}
        {tab==='cases'       && <CasesTab/>}
        {tab==='codes'       && <AccessCodesTab/>}
        {tab==='highlights'  && <HighlightsTab/>}
      </main>

      <footer style={{ borderTop:`1px solid ${BD}`, padding:'16px 24px', marginTop:40 }}>
        <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>Built for justice</p>
      </footer>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  LogOut, CheckCircle, XCircle, AlertTriangle, Edit2, Save, X,
  ChevronUp, Trash2, Eye, RefreshCw, Send, BarChart2, Flag,
  FileText, Users, Mail, Shield, BookOpen} from 'lucide-react'

// ── CONFIG ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const A   = '#8A1030'
const BD  = '#C4AABB'
const BG  = '#F0E8E8'
const CRD = '#E0CCCC'
const TXT = '#180410'
const MUT = '#7A4A60'

const TIER_CONFIG = {
  reported:     { label: 'Reported',     cls: 'tier-reported'     },
  corroborated: { label: 'Corroborated', cls: 'tier-corroborated' },
  convicted:    { label: 'Convicted',    cls: 'tier-convicted'    },
}

const COUNTIES = [
  'Nairobi','Kiambu','Mombasa','Nakuru','Kisumu','Kajiado','Kwale',
  'Machakos',"Murang'a",'Kilifi','Uasin Gishu','Trans Nzoia','Meru',
  'Kakamega','Nyeri','Nandi','Embu','Kirinyaga','Bungoma','Homa Bay',
  'Nyamira','Laikipia','Baringo','Narok','Kericho','Bomet','Siaya',
  'Vihiga','Busia','Migori','Kisii','Nyandarua','Taita Taveta','Kitui',
  'Makueni','Samburu','Lamu','Tana River','Garissa','Wajir','Mandera',
  'Marsabit','Isiolo','Turkana','West Pokot','Elgeyo Marakwet','Tharaka Nithi',
]

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const sendMagicLink = async () => {
    if (!email) { setError('Email is required'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:'100vh', background:BG,
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:24,
    }}>
      <div style={{width:'100%', maxWidth:420}}>

        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:32}}>
          <div className="serif" style={{fontSize:32,fontWeight:700,color:TXT}}>
            Fem<span style={{color:A}}>Saidia</span> Kenya
          </div>
          <p style={{fontSize:12,color:MUT,marginTop:6,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em'}}>
            ADMIN DASHBOARD
          </p>
        </div>

        <div className="card" style={{padding:28}}>
          {!sent ? (
            <>
              <div className="serif" style={{fontSize:20,fontWeight:700,color:TXT,marginBottom:6}}>
                Sign in
              </div>
              <p style={{fontSize:12,color:MUT,fontFamily:"'Nunito Sans',sans-serif",marginBottom:20,lineHeight:1.6}}>
                Enter your admin email. We'll send you a one-click magic link — no password needed.
              </p>
              <label style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',fontWeight:600,display:'block',marginBottom:6}}>
                Admin email
              </label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&sendMagicLink()}
                placeholder="cmt.kenya@gmail.com"
                style={{marginBottom:12}}
              />
              {error && <p style={{fontSize:11,color:A,fontFamily:"'Nunito Sans',sans-serif",marginBottom:10}}>{error}</p>}
              <button className="btn btn-primary" onClick={sendMagicLink} disabled={loading}
                style={{width:'100%',justifyContent:'center',padding:'11px'}}>
                <Mail size={14}/>
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
            </>
          ) : (
            <div style={{textAlign:'center', padding:'10px 0'}}>
              <CheckCircle size={40} color="#1A6A2A" style={{margin:'0 auto 16px'}}/>
              <div className="serif" style={{fontSize:18,fontWeight:700,color:TXT,marginBottom:8}}>
                Check your email
              </div>
              <p style={{fontSize:13,color:MUT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.7}}>
                We sent a magic link to <strong>{email}</strong>. Click it to sign in — it expires in 1 hour.
              </p>
              <button onClick={()=>setSent(false)}
                style={{marginTop:16,background:'none',border:'none',cursor:'pointer',
                  color:A,fontSize:12,fontFamily:"'Nunito Sans',sans-serif",fontWeight:600}}>
                Use a different email
              </button>
            </div>
          )}
        </div>

        <p style={{fontSize:11,color:MUT,textAlign:'center',marginTop:16,fontFamily:"'Nunito Sans',sans-serif"}}>
          FemSaidia Kenya Admin · Restricted access
        </p>
      </div>
    </div>
  )
}

// ── SUBMISSIONS QUEUE ─────────────────────────────────────────────────────────
function SubmissionsTab() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('pending')
  const [editing, setEditing]         = useState(null)
  const [editData, setEditData]       = useState({})
  const [expanded, setExpanded]       = useState(null)

  const load = async () => {
    setLoading(true)
    const q = supabase.from('redflag_submissions').select('*').order('created_at', {ascending:false})
    if (filter !== 'all') q.eq('status', filter)
    const { data } = await q
    setSubmissions(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const approve = async (s) => {
    const platforms = s.platforms?.split(',').map(p=>p.trim()).filter(Boolean) || []
    const { error } = await supabase.from('redflag_profiles').insert([{
      tier: 'reported',
      status: 'approved',
      name: s.accused_name || null,
      aliases: s.accused_aliases ? [s.accused_aliases] : [],
      county: s.accused_county,
      modus_operandi: s.modus_operandi,
      platforms,
      photo_url: s.photo_url || null,
      social_link: s.social_link || null,
      court_ref: s.court_ref || null,
    }])
    if (!error) {
      await supabase.from('redflag_submissions')
        .update({ status:'approved', processed_at: new Date().toISOString() })
        .eq('id', s.id)
      load()
    }
  }

  const updateStatus = async (id, status) => {
    await supabase.from('redflag_submissions')
      .update({ status, processed_at: new Date().toISOString() })
      .eq('id', id)
    load()
  }

  const saveEdit = async (id) => {
    await supabase.from('redflag_submissions').update(editData).eq('id', id)
    setEditing(null)
    load()
  }

  const STATUS_FILTERS = ['all','pending','approved','rejected','duplicate']

  return (
    <div className="fade-up">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
        <div>
          <p className="label" style={{marginBottom:6}}>Review queue</p>
          <h2 className="serif" style={{fontSize:26,fontWeight:700,color:TXT}}>Submissions</h2>
        </div>
        <button className="btn btn-ghost" onClick={load}>
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:2,marginBottom:16,flexWrap:'wrap'}}>
        {STATUS_FILTERS.map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{
              fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,
              padding:'6px 14px',border:`1px solid ${filter===f?A:BD}`,
              background:filter===f?A:CRD,
              color:filter===f?'#F0D0D8':MUT,
              cursor:'pointer',letterSpacing:'.04em',textTransform:'capitalize',
            }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{color:MUT,fontSize:12}}>Loading...</p>
      ) : submissions.length === 0 ? (
        <div style={{textAlign:'center',padding:40,background:CRD,border:`1px solid ${BD}`}}>
          <CheckCircle size={28} color="#1A6A2A" style={{margin:'0 auto 10px'}}/>
          <p style={{fontSize:13,color:MUT}}>No {filter} submissions</p>
        </div>
      ) : (
        <div>
          {submissions.map((s,i)=>(
            <div key={s.id} style={{background:CRD,border:`1px solid ${BD}`,marginBottom:2,overflow:'hidden'}}>

              {/* Row header */}
              <div style={{padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,cursor:'pointer'}}
                onClick={()=>setExpanded(expanded===s.id?null:s.id)}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span className={`badge status-${s.status}`}>{s.status}</span>
                    <span style={{fontSize:13,fontWeight:700,color:TXT}}>{s.accused_name||'No name'}</span>
                    <span style={{fontSize:12,color:MUT}}>· {s.accused_county}</span>
                  </div>
                  <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>
                    {new Date(s.created_at).toLocaleDateString('en-KE')} ·
                    {s.submitter_email} · {s.platforms||'No platforms'}
                  </p>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  {s.status==='pending' && <>
                    <button className="btn btn-success" style={{padding:'6px 12px',fontSize:11}}
                      onClick={e=>{e.stopPropagation();approve(s)}}>
                      <CheckCircle size={12}/> Approve
                    </button>
                    <button className="btn btn-warning" style={{padding:'6px 12px',fontSize:11}}
                      onClick={e=>{e.stopPropagation();updateStatus(s.id,'duplicate')}}>
                      Duplicate
                    </button>
                    <button className="btn btn-danger" style={{padding:'6px 12px',fontSize:11}}
                      onClick={e=>{e.stopPropagation();updateStatus(s.id,'rejected')}}>
                      <XCircle size={12}/> Reject
                    </button>
                  </>}
                  <button className="btn btn-ghost" style={{padding:'6px 10px',fontSize:11}}
                    onClick={e=>{e.stopPropagation();setEditing(s.id);setEditData({...s})}}>
                    <Edit2 size={12}/>
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded===s.id && (
                <div style={{padding:'0 18px 18px',borderTop:`1px solid ${BD}`}}>
                  {editing===s.id ? (
                    // Edit mode
                    <div style={{paddingTop:14}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                        {[
                          {l:'Name / alias',    k:'accused_name'},
                          {l:'Other aliases',   k:'accused_aliases'},
                          {l:'Platforms',       k:'platforms'},
                          {l:'Court reference', k:'court_ref'},
                          {l:'Social link',     k:'social_link'},
                          {l:'Admin notes',     k:'admin_notes'},
                        ].map(({l,k})=>(
                          <div key={k}>
                            <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:4}}>{l}</p>
                            <input className="input" value={editData[k]||''} onChange={e=>setEditData(d=>({...d,[k]:e.target.value}))}/>
                          </div>
                        ))}
                      </div>
                      <div style={{marginBottom:10}}>
                        <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:4}}>Mode of operation</p>
                        <textarea className="input" style={{minHeight:80,resize:'vertical'}}
                          value={editData.modus_operandi||''} onChange={e=>setEditData(d=>({...d,modus_operandi:e.target.value}))}/>
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn btn-primary" onClick={()=>saveEdit(s.id)}>
                          <Save size={13}/> Save changes
                        </button>
                        <button className="btn btn-ghost" onClick={()=>setEditing(null)}>
                          <X size={13}/> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div style={{paddingTop:14,display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                      <div>
                        <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:4}}>Mode of operation</p>
                        <p style={{fontSize:13,color:TXT,lineHeight:1.7}}>{s.modus_operandi}</p>
                      </div>
                      <div>
                        <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:4}}>Submitter (confidential)</p>
                        <p style={{fontSize:13,color:TXT}}>{s.submitter_name||'Anonymous'}</p>
                        <p style={{fontSize:12,color:MUT}}>{s.submitter_email} · {s.submitter_phone}</p>
                        {s.additional_info && <p style={{fontSize:12,color:TXT,marginTop:6}}>{s.additional_info}</p>}
                      </div>
                      {s.photo_url && (
                        <div>
                          <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:4}}>Photo</p>
                          <img src={s.photo_url} alt="Submitted" style={{maxHeight:120,maxWidth:200,objectFit:'cover',display:'block'}}/>
                        </div>
                      )}
                      {s.social_link && (
                        <div>
                          <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:4}}>Social link</p>
                          <a href={s.social_link} target="_blank" rel="noopener noreferrer"
                            style={{fontSize:12,color:A,wordBreak:'break-all'}}>{s.social_link}</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── PROFILES MANAGER ──────────────────────────────────────────────────────────
function ProfilesTab() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(null)
  const [editData, setEditData] = useState({})
  const [filter, setFilter]     = useState('all')

  const load = async () => {
    setLoading(true)
    const q = supabase.from('redflag_profiles').select('*').order('created_at',{ascending:false})
    if (filter !== 'all') q.eq('tier', filter)
    const { data } = await q
    setProfiles(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const saveEdit = async (id) => {
    const platforms = typeof editData.platforms === 'string'
      ? editData.platforms.split(',').map(p=>p.trim())
      : editData.platforms
    await supabase.from('redflag_profiles').update({...editData, platforms, updated_at: new Date().toISOString()}).eq('id', id)
    setEditing(null)
    load()
  }

  const promote = async (id, currentTier) => {
    const next = currentTier==='reported' ? 'corroborated' : 'convicted'
    await supabase.from('redflag_profiles').update({
      tier: next,
      promoted_from: currentTier,
      updated_at: new Date().toISOString()
    }).eq('id', id)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Remove this profile from public view?')) return
    await supabase.from('redflag_profiles').update({status:'removed'}).eq('id',id)
    load()
  }

  return (
    <div className="fade-up">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
        <div>
          <p className="label" style={{marginBottom:6}}>Published profiles</p>
          <h2 className="serif" style={{fontSize:26,fontWeight:700,color:TXT}}>Profile manager</h2>
        </div>
        <button className="btn btn-ghost" onClick={load}><RefreshCw size={13}/> Refresh</button>
      </div>

      {/* Tier filter */}
      <div style={{display:'flex',gap:2,marginBottom:16}}>
        {['all','reported','corroborated','convicted'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{
              fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,
              padding:'6px 14px',border:`1px solid ${filter===f?A:BD}`,
              background:filter===f?A:CRD,
              color:filter===f?'#F0D0D8':MUT,
              cursor:'pointer',letterSpacing:'.04em',textTransform:'capitalize',
            }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <p style={{color:MUT,fontSize:12}}>Loading...</p> : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Name / Alias</th>
              <th>County</th>
              <th>Tier</th>
              <th>Platforms</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p=>(
              <>
                <tr key={p.id}>
                  <td style={{fontWeight:700}}>{p.name || <em style={{color:MUT}}>Withheld</em>}</td>
                  <td>{p.county}</td>
                  <td><span className={`badge ${TIER_CONFIG[p.tier]?.cls}`}>{TIER_CONFIG[p.tier]?.label}</span></td>
                  <td style={{fontSize:11,color:MUT}}>{p.platforms?.join(', ')||'—'}</td>
                  <td style={{fontSize:11,color:MUT}}>{new Date(p.created_at).toLocaleDateString('en-KE')}</td>
                  <td>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      <button className="btn btn-ghost" style={{padding:'4px 8px',fontSize:11}}
                        onClick={()=>{setEditing(p.id);setEditData({...p,platforms:p.platforms?.join(', ')||''})}}>
                        <Edit2 size={11}/> Edit
                      </button>
                      {p.tier !== 'convicted' && (
                        <button className="btn btn-warning" style={{padding:'4px 8px',fontSize:11}}
                          onClick={()=>promote(p.id,p.tier)}>
                          <ChevronUp size={11}/> Promote
                        </button>
                      )}
                      <button className="btn btn-danger" style={{padding:'4px 8px',fontSize:11}}
                        onClick={()=>remove(p.id)}>
                        <Trash2 size={11}/> Remove
                      </button>
                    </div>
                  </td>
                </tr>
                {editing===p.id && (
                  <tr key={`edit-${p.id}`}>
                    <td colSpan={6} style={{background:'#D4BCBC',padding:18}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
                        {[
                          {l:'Name',           k:'name'},
                          {l:'Aliases (comma separated)', k:'aliases'},
                          {l:'County',         k:'county'},
                          {l:'Platforms (comma separated)', k:'platforms'},
                          {l:'Court reference',k:'court_ref'},
                          {l:'Social link',    k:'social_link'},
                        ].map(({l,k})=>(
                          <div key={k}>
                            <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:4}}>{l}</p>
                            {k==='county' ? (
                              <select className="input" value={editData[k]||''} onChange={e=>setEditData(d=>({...d,[k]:e.target.value}))}>
                                {COUNTIES.map(c=><option key={c} value={c}>{c}</option>)}
                              </select>
                            ) : (
                              <input className="input" value={editData[k]||''} onChange={e=>setEditData(d=>({...d,[k]:e.target.value}))}/>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{marginBottom:10}}>
                        <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:4}}>Mode of operation</p>
                        <textarea className="input" style={{minHeight:80,resize:'vertical'}}
                          value={editData.modus_operandi||''} onChange={e=>setEditData(d=>({...d,modus_operandi:e.target.value}))}/>
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn btn-primary" onClick={()=>saveEdit(p.id)}><Save size={13}/> Save</button>
                        <button className="btn btn-ghost" onClick={()=>setEditing(null)}><X size={13}/> Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [subs, profiles] = await Promise.all([
        supabase.from('redflag_submissions').select('status, accused_county, created_at'),
        supabase.from('redflag_profiles').select('tier, county, status, created_at'),
      ])

      const submissions = subs.data || []
      const profs = profiles.data || []

      // County breakdown
      const countyMap = {}
      submissions.forEach(s => {
        countyMap[s.accused_county] = (countyMap[s.accused_county]||0) + 1
      })
      const topCounties = Object.entries(countyMap)
        .sort((a,b)=>b[1]-a[1]).slice(0,8)

      // Monthly submissions
      const monthMap = {}
      submissions.forEach(s => {
        const m = new Date(s.created_at).toLocaleDateString('en-KE',{month:'short',year:'numeric'})
        monthMap[m] = (monthMap[m]||0) + 1
      })

      setStats({
        totalSubmissions: submissions.length,
        pending:    submissions.filter(s=>s.status==='pending').length,
        approved:   submissions.filter(s=>s.status==='approved').length,
        rejected:   submissions.filter(s=>s.status==='rejected').length,
        totalProfiles: profs.filter(p=>p.status==='approved').length,
        reported:   profs.filter(p=>p.tier==='reported').length,
        corroborated: profs.filter(p=>p.tier==='corroborated').length,
        convicted:  profs.filter(p=>p.tier==='convicted').length,
        topCounties,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p style={{color:MUT,fontSize:12}}>Loading analytics...</p>

  return (
    <div className="fade-up">
      <div style={{marginBottom:20}}>
        <p className="label" style={{marginBottom:6}}>Platform overview</p>
        <h2 className="serif" style={{fontSize:26,fontWeight:700,color:TXT}}>Analytics</h2>
      </div>

      {/* Summary stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2,marginBottom:16}}>
        {[
          {v:stats.totalSubmissions, l:'Total submissions',  c:A},
          {v:stats.pending,          l:'Pending review',     c:'#8A5010'},
          {v:stats.totalProfiles,    l:'Published profiles', c:'#1A6A2A'},
          {v:stats.convicted,        l:'Convicted profiles', c:'#1A4810'},
        ].map((s,i)=>(
          <div key={i} style={{background:CRD,border:`1px solid ${BD}`,padding:'20px 22px',
            borderLeft:`4px solid ${s.c}`}}>
            <div className="serif" style={{fontSize:36,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</div>
            <p style={{fontSize:12,color:TXT,fontWeight:600,marginTop:8,fontFamily:"'Nunito Sans',sans-serif"}}>{s.l}</p>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {/* Tier breakdown */}
        <div className="card" style={{padding:20}}>
          <div className="section-head"><span>Profiles by tier</span></div>
          {[
            {l:'Reported',     v:stats.reported,     c:'#B07060'},
            {l:'Corroborated', v:stats.corroborated, c:'#A07040'},
            {l:'Convicted',    v:stats.convicted,    c:'#60A050'},
          ].map((t,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{width:90,fontSize:12,fontWeight:700,color:TXT}}>{t.l}</div>
              <div style={{flex:1,height:20,background:'#D4BCBC',position:'relative'}}>
                <div style={{
                  height:'100%',background:t.c,
                  width:`${stats.totalProfiles>0?(t.v/stats.totalProfiles)*100:0}%`,
                  transition:'width .4s',
                }}/>
              </div>
              <div style={{width:24,fontSize:13,fontWeight:700,color:t.c,textAlign:'right'}}>{t.v}</div>
            </div>
          ))}
        </div>

        {/* Top counties */}
        <div className="card" style={{padding:20}}>
          <div className="section-head"><span>Top counties by submissions</span></div>
          {stats.topCounties.map(([county,count],i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
              <div style={{width:90,fontSize:12,fontWeight:700,color:TXT,flexShrink:0}}>{county}</div>
              <div style={{flex:1,height:18,background:'#D4BCBC',position:'relative'}}>
                <div style={{
                  height:'100%',background:A,
                  width:`${stats.topCounties[0]?( count/stats.topCounties[0][1])*100:0}%`,
                  transition:'width .4s',
                }}/>
              </div>
              <div style={{width:24,fontSize:12,fontWeight:700,color:A,textAlign:'right'}}>{count}</div>
            </div>
          ))}
        </div>

        {/* Submission status */}
        <div className="card" style={{padding:20}}>
          <div className="section-head"><span>Submissions by status</span></div>
          {[
            {l:'Pending',   v:stats.pending,   c:'#8A5010'},
            {l:'Approved',  v:stats.approved,  c:'#1A6A2A'},
            {l:'Rejected',  v:stats.rejected,  c:A},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{width:70,fontSize:12,fontWeight:700,color:TXT}}>{s.l}</div>
              <div style={{flex:1,height:18,background:'#D4BCBC'}}>
                <div style={{
                  height:'100%',background:s.c,
                  width:`${stats.totalSubmissions>0?(s.v/stats.totalSubmissions)*100:0}%`,
                }}/>
              </div>
              <div style={{width:24,fontSize:12,fontWeight:700,color:s.c,textAlign:'right'}}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
// ── ACCESS CODES ─────────────────────────────────────────────────────────────
function AccessCodesTab() {
  const [codes, setCodes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]     = useState({ code:'', label:'', expires_at:'', uses_limit:'' })
  const [adding, setAdding] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('invite_codes').select('*').order('created_at', { ascending:false })
    setCodes(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const generate = () => {
    const words = ['savher','justice','femke','saidia','ngec','shield','voice','arise']
    const word  = words[Math.floor(Math.random()*words.length)]
    const num   = Math.floor(1000+Math.random()*9000)
    setForm(f => ({ ...f, code:`${word}-${num}` }))
  }

  const add = async () => {
    if (!form.code || !form.label) return
    setAdding(true)
    await supabase.from('invite_codes').insert([{
      code:       form.code.trim().toLowerCase(),
      label:      form.label.trim(),
      active:     true,
      expires_at: form.expires_at || null,
      uses_limit: form.uses_limit ? parseInt(form.uses_limit) : null,
    }])
    setForm({ code:'', label:'', expires_at:'', uses_limit:'' })
    setAdding(false)
    load()
  }

  const toggle = async (id, active) => {
    await supabase.from('invite_codes').update({ active: !active }).eq('id', id)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Delete this code?')) return
    await supabase.from('invite_codes').delete().eq('id', id)
    load()
  }

  const copy = (code) => {
    navigator.clipboard.writeText(code)
  }

  const inputSt = {
    fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:TXT,
    background:'#EAD8D8', border:`1px solid ${BD}`, padding:'8px 12px',
    outline:'none', flex:1,
  }

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <p className="label" style={{ marginBottom:6 }}>Preview access management</p>
          <h2 className="serif" style={{ fontSize:26, fontWeight:700, color:TXT }}>Access codes</h2>
          <p style={{ fontSize:12, color:MUT, marginTop:6, fontFamily:"'Nunito Sans',sans-serif", maxWidth:500 }}>
            Create and manage invite codes for femsaidiakenya.org. Share a code with each reviewer — they enter it on the invite gate to access the platform.
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load}><RefreshCw size={13}/> Refresh</button>
      </div>

      {/* Add new code */}
      <div className="card" style={{ padding:20, marginBottom:16 }}>
        <div className="section-head"><span>Create new code</span></div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div style={{ flex:1, minWidth:200 }}>
            <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>Code</p>
            <div style={{ display:'flex', gap:6 }}>
              <input style={inputSt} value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} placeholder="e.g. ngec-2026"/>
              <button className="btn btn-ghost" style={{ padding:'8px 12px', fontSize:11, whiteSpace:'nowrap' }} onClick={generate}>Generate</button>
            </div>
          </div>
          <div style={{ flex:1, minWidth:160 }}>
            <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>Label (who is this for)</p>
            <input style={{...inputSt, width:'100%'}} value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} placeholder="e.g. NGEC Kenya"/>
          </div>
          <div style={{ minWidth:140 }}>
            <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>Expires (optional)</p>
            <input style={{...inputSt, width:'100%'}} type="date" value={form.expires_at} onChange={e=>setForm(f=>({...f,expires_at:e.target.value}))}/>
          </div>
          <div style={{ minWidth:100 }}>
            <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>Max uses</p>
            <input style={{...inputSt, width:'100%'}} type="number" value={form.uses_limit} onChange={e=>setForm(f=>({...f,uses_limit:e.target.value}))} placeholder="∞"/>
          </div>
          <button className="btn btn-primary" onClick={add} disabled={adding || !form.code || !form.label} style={{ whiteSpace:'nowrap' }}>
            {adding ? 'Adding...' : '+ Add code'}
          </button>
        </div>
      </div>

      {/* Codes table */}
      {loading ? <p style={{ color:MUT, fontSize:12 }}>Loading...</p> : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Code</th>
              <th>Label</th>
              <th>Status</th>
              <th>Uses</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <code style={{ fontFamily:'monospace', fontSize:13, color:A, fontWeight:700 }}>{c.code}</code>
                    <button onClick={()=>copy(c.code)} style={{ background:'none', border:'none', cursor:'pointer', color:MUT, fontSize:10, fontFamily:"'Nunito Sans',sans-serif" }}>
                      Copy
                    </button>
                  </div>
                </td>
                <td style={{ fontSize:13, color:TXT }}>{c.label}</td>
                <td>
                  <span className={`badge ${c.active ? 'status-approved' : 'status-rejected'}`}>
                    {c.active ? 'Active' : 'Revoked'}
                  </span>
                </td>
                <td style={{ fontSize:13, color:MUT }}>
                  {c.uses_count || 0}{c.uses_limit ? ` / ${c.uses_limit}` : ''}
                </td>
                <td style={{ fontSize:12, color:MUT }}>
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-KE') : '—'}
                </td>
                <td>
                  <div style={{ display:'flex', gap:4 }}>
                    <button className={`btn ${c.active ? 'btn-warning' : 'btn-success'}`} style={{ padding:'4px 10px', fontSize:11 }}
                      onClick={()=>toggle(c.id, c.active)}>
                      {c.active ? 'Revoke' : 'Restore'}
                    </button>
                    <button className="btn btn-danger" style={{ padding:'4px 10px', fontSize:11 }}
                      onClick={()=>remove(c.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── CASES MANAGER ────────────────────────────────────────────────────────────
function CasesTab() {
  const [cases, setCases]     = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editData, setEditData] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [newCase, setNewCase] = useState({
    case_ref:'', victim_name:'', victim_age_range:'unknown',
    incident_date:'', county:'', location:'', perpetrator_relationship:'unknown',
    tech_facilitated:false, tech_platforms:'',
    status:'reported', sentence:'', court_ref:'', next_hearing:'',
    source_url:'', source_type:'news', verified:false, admin_notes:''
  })

  const STATUS_OPTIONS = [
    'reported','investigated','charged','trial','convicted','acquitted','dismissed','cold','no_action'
  ]
  const COUNTIES = [
    'Nairobi','Kiambu','Mombasa','Nakuru','Kisumu','Kajiado','Kwale',
    'Machakos',"Murang'a",'Kilifi','Uasin Gishu','Trans Nzoia','Meru',
    'Kakamega','Nyeri','Nandi','Embu','Kirinyaga','Bungoma','Homa Bay',
    'Other',
  ]
  const STATUS_COLORS = {
    reported:'#DDD0D0', investigated:'#E8D8C0', charged:'#D8E0C8',
    trial:'#C8D8E8', convicted:'#C8D8C0', acquitted:'#DCC8D8',
    dismissed:'#E0D0C0', cold:'#D0D4D8', no_action:'#E8D0C8',
  }

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('femicide_cases').select('*').order('incident_date',{ascending:false})
    setCases(data||[])
    setLoading(false)
  }

  const saveEdit = async (id) => {
    await supabase.from('femicide_cases').update({
      ...editData,
      tech_platforms: typeof editData.tech_platforms === 'string'
        ? editData.tech_platforms.split(',').map(p=>p.trim()).filter(Boolean)
        : editData.tech_platforms,
      updated_at: new Date().toISOString()
    }).eq('id', id)
    setEditing(null)
    load()
  }

  const addCase = async () => {
    await supabase.from('femicide_cases').insert([{
      ...newCase,
      tech_platforms: newCase.tech_platforms.split(',').map(p=>p.trim()).filter(Boolean),
      case_ref: newCase.case_ref || `FSK-${new Date().getFullYear()}-${String(cases.length+1).padStart(3,'0')}`,
    }])
    setShowAdd(false)
    setNewCase({case_ref:'',victim_name:'',victim_age_range:'unknown',incident_date:'',county:'',location:'',perpetrator_relationship:'unknown',tech_facilitated:false,tech_platforms:'',status:'reported',sentence:'',court_ref:'',next_hearing:'',source_url:'',source_type:'news',verified:false,admin_notes:''})
    load()
  }

  const togglePublish = async (id, published) => {
    await supabase.from('femicide_cases').update({ published:!published }).eq('id',id)
    load()
  }

  const inputSt = { fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:TXT, background:'#EAD8D8', border:`1px solid ${BD}`, padding:'7px 10px', outline:'none', width:'100%' }
  const labelSt = { fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase', display:'block', marginBottom:3, marginTop:10 }

  const CaseForm = ({ data, setData, onSave, onCancel, saveLabel }) => (
    <div style={{ background:'#D4BCBC', border:`1px solid ${BD}`, padding:18, marginBottom:2 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
        {[
          {l:'Case ref',   k:'case_ref'},
          {l:'Victim name (if known)', k:'victim_name'},
          {l:'County',     k:'county', type:'county'},
          {l:'Location',   k:'location'},
          {l:'Date',       k:'incident_date', type:'date'},
          {l:'Status',     k:'status', type:'status'},
          {l:'Relationship to victim', k:'perpetrator_relationship'},
          {l:'Source type', k:'source_type'},
          {l:'Source URL', k:'source_url'},
          {l:'Court reference', k:'court_ref'},
          {l:'Sentence (if convicted)', k:'sentence'},
          {l:'Next hearing date', k:'next_hearing', type:'date'},
          {l:'Tech platforms (comma separated)', k:'tech_platforms'},
          {l:'Admin notes', k:'admin_notes'},
        ].map(({l,k,type})=>(
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
            <span style={{ fontSize:12, color:TXT, fontFamily:"'Nunito Sans',sans-serif" }}>Verified from source</span>
          </label>
        </div>
      </div>
      <div style={{ display:'flex', gap:8, marginTop:14 }}>
        <button className="btn btn-primary" onClick={onSave}><Save size={13}/> {saveLabel}</button>
        <button className="btn btn-ghost" onClick={onCancel}><X size={13}/> Cancel</button>
      </div>
    </div>
  )

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <p className="label" style={{ marginBottom:6 }}>Femicide case database</p>
          <h2 className="serif" style={{ fontSize:26, fontWeight:700, color:TXT }}>Case manager</h2>
          <p style={{ fontSize:12, color:MUT, marginTop:4, fontFamily:"'Nunito Sans',sans-serif" }}>
            {cases.length} cases on record · {cases.filter(c=>c.status==='no_action').length} with no legal action
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost" onClick={load}><RefreshCw size={13}/> Refresh</button>
          <button className="btn btn-primary" onClick={()=>setShowAdd(s=>!s)}>
            {showAdd ? <><X size={13}/> Cancel</> : <>+ Add case</>}
          </button>
        </div>
      </div>

      {showAdd && (
        <CaseForm data={newCase} setData={setNewCase} onSave={addCase} onCancel={()=>setShowAdd(false)} saveLabel="Add case"/>
      )}

      <table className="tbl">
        <thead>
          <tr>
            <th>Ref</th>
            <th>Victim</th>
            <th>County</th>
            <th>Date</th>
            <th>Status</th>
            <th>Verified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} style={{ textAlign:'center', color:MUT }}>Loading...</td></tr>
          ) : cases.map(c=>(
            <>
              <tr key={c.id} style={{ opacity: c.published ? 1 : 0.5 }}>
                <td style={{ fontFamily:'monospace', fontSize:11 }}>{c.case_ref}</td>
                <td style={{ fontWeight:700, fontSize:13 }}>{c.victim_name||'Unknown'}</td>
                <td>{c.county}</td>
                <td style={{ fontSize:11, color:MUT }}>{c.incident_date ? new Date(c.incident_date).toLocaleDateString('en-KE') : '—'}</td>
                <td>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', fontFamily:"'Nunito Sans',sans-serif", background:STATUS_COLORS[c.status]||'#DDD', border:'1px solid #B89AAA', color:TXT }}>
                    {c.status?.replace(/_/g,' ')}
                  </span>
                </td>
                <td style={{ fontSize:11, color: c.verified ? '#166534' : MUT }}>{c.verified ? '✓ Yes' : 'Pending'}</td>
                <td>
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="btn btn-ghost" style={{ padding:'4px 8px', fontSize:11 }}
                      onClick={()=>{setEditing(c.id);setEditData({...c,tech_platforms:c.tech_platforms?.join(', ')||''})}}>
                      <Edit2 size={11}/> Edit
                    </button>
                    <button className={`btn ${c.published?'btn-warning':'btn-success'}`} style={{ padding:'4px 8px', fontSize:11 }}
                      onClick={()=>togglePublish(c.id,c.published)}>
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
  )
}

// ── LINDALINDA (SAFETY NORMS) TAB ────────────────────────────────────────────
function LindaLindaTab() {
  const [norms,   setNorms]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('published')
  const [editing, setEditing] = useState(null)
  const [editText, setEditText] = useState({})

  const load = () => {
    setLoading(true)
    supabase.from('safety_norms').select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setNorms(data || []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const update = async (id, updates) => {
    await supabase.from('safety_norms').update(updates).eq('id', id)
    load()
    setEditing(null)
  }

  const filtered = norms.filter(n => filter === 'all' ? true : n.status === filter)

  const counts = {
    published: norms.filter(n=>n.status==='published').length,
    flagged:   norms.filter(n=>n.status==='flagged').length,
    removed:   norms.filter(n=>n.status==='removed').length,
    all:       norms.length,
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
        marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:TXT, marginBottom:4 }}>
            LindaLinda · Safety Norms
          </h2>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT }}>
            Community-submitted safety stories. Review, add caveats, flag or remove as needed.
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[
            { id:'published', label:`Published (${counts.published})` },
            { id:'flagged',   label:`Flagged (${counts.flagged})` },
            { id:'removed',   label:`Removed (${counts.removed})` },
            { id:'all',       label:`All (${counts.all})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                padding:'6px 12px', border:`1px solid ${BD}`, cursor:'pointer',
                background: filter===f.id ? A : CRD, color: filter===f.id ? '#fff' : MUT }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontSize:12 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontStyle:'italic' }}>
          No stories in this category yet.
        </p>
      ) : filtered.map(norm => (
        <div key={norm.id} style={{ background:CRD, border:`1px solid ${BD}`,
          marginBottom:12, padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
            gap:12, marginBottom:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Lora',serif", fontSize:15, fontWeight:700,
                color:TXT, marginBottom:4 }}>{norm.title}</div>
              <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:MUT }}>
                {norm.submitted_by || 'Anonymous'} · {norm.context || 'General'} ·{' '}
                {norm.created_at && new Date(norm.created_at).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}
              </div>
            </div>
            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
              <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
                padding:'2px 8px', letterSpacing:'.08em', textTransform:'uppercase',
                background: norm.status==='published'?'#1A5A2A':norm.status==='flagged'?'#CA8A04':'#8A1030',
                color:'#fff' }}>
                {norm.status}
              </span>
            </div>
          </div>

          {editing === norm.id ? (
            <div>
              <textarea
                value={editText.story ?? norm.story}
                onChange={e => setEditText({...editText, story:e.target.value})}
                rows={4}
                style={{ width:'100%', padding:'8px 12px', fontFamily:"'Nunito Sans',sans-serif",
                  fontSize:12, background:'rgba(255,255,255,0.7)', border:`1px solid ${BD}`,
                  color:TXT, outline:'none', resize:'vertical', boxSizing:'border-box', marginBottom:8 }}/>
              <div style={{ marginBottom:8 }}>
                <label style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  letterSpacing:'.08em', textTransform:'uppercase', color:MUT, display:'block', marginBottom:4 }}>
                  Admin caveat (optional — shown below the story)
                </label>
                <input
                  value={editText.caveat ?? norm.caveat ?? ''}
                  onChange={e => setEditText({...editText, caveat:e.target.value})}
                  placeholder="e.g. Editor note: this practice may not work in all situations..."
                  style={{ width:'100%', padding:'8px 12px', fontFamily:"'Nunito Sans',sans-serif",
                    fontSize:12, background:'rgba(255,255,255,0.7)', border:`1px solid ${BD}`,
                    color:TXT, outline:'none', boxSizing:'border-box' }}/>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => update(norm.id, { story:editText.story??norm.story, caveat:editText.caveat??norm.caveat??'' })}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                    padding:'6px 14px', background:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>
                  Save changes
                </button>
                <button onClick={() => { setEditing(null); setEditText({}) }}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                    padding:'6px 14px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:TXT,
                lineHeight:1.7, marginBottom: norm.caveat ? 8 : 0 }}>{norm.story}</p>
              {norm.caveat && (
                <div style={{ background:'rgba(202,138,4,0.1)', borderLeft:'3px solid #CA8A04',
                  padding:'8px 12px', marginTop:8 }}>
                  <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:'#8A6000',
                    fontStyle:'italic' }}>📝 Admin note: {norm.caveat}</p>
                </div>
              )}
            </div>
          )}

          {editing !== norm.id && (
            <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
              <button onClick={() => { setEditing(norm.id); setEditText({}) }}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                  padding:'5px 12px', background:CRD, color:MUT, border:`1px solid ${BD}`, cursor:'pointer' }}>
                Edit / Add caveat
              </button>
              {norm.status !== 'published' && (
                <button onClick={() => update(norm.id, { status:'published' })}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                    padding:'5px 12px', background:'#1A5A2A', color:'#fff', border:'none', cursor:'pointer' }}>
                  Publish
                </button>
              )}
              {norm.status !== 'flagged' && (
                <button onClick={() => update(norm.id, { status:'flagged' })}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                    padding:'5px 12px', background:'#CA8A04', color:'#fff', border:'none', cursor:'pointer' }}>
                  Flag
                </button>
              )}
              {norm.status !== 'removed' && (
                <button onClick={() => update(norm.id, { status:'removed' })}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                    padding:'5px 12px', background:A, color:'#fff', border:'none', cursor:'pointer' }}>
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── ARCHETYPES CONTENT EDITOR ────────────────────────────────────────────────
function ArchetypesTab() {
  const ARCH_IDS = [
    {id:'naive',      label:'The Naive',      color:'#1A3F6F'},
    {id:'precocious', label:'The Precocious',  color:'#8A4010'},
    {id:'allin',      label:'The All-In',      color:'#3A1870'},
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
    supabase.from('archetype_content').select('*')
      .order('sort_order',{ascending:true})
      .then(({data})=>{ setItems(data||[]); setLoading(false) })
  }

  useEffect(()=>{ load() },[])

  const filtered = items.filter(i=>i.archetype_id===activeArch && i.section===activeSec)

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
      archetype_id: activeArch, section: activeSec,
      content: newText.trim(), sort_order: maxOrder+1, active: true
    })
    setNewText(''); setAdding(false); load()
  }

  const arch = ARCH_IDS.find(a=>a.id===activeArch)

  return (
    <div>
      <div style={{marginBottom:20}}>
        <h2 style={{fontFamily:"'Lora',serif",fontSize:22,fontWeight:700,color:TXT,marginBottom:4}}>JiJue · JiTume Content Editor</h2>
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT}}>Edit protective measures and red flags for each archetype. Changes go live immediately on femsaidiakenya.org.</p>
      </div>

      <div style={{display:'flex',gap:2,marginBottom:12}}>
        {ARCH_IDS.map(a=>(
          <button key={a.id} onClick={()=>setActiveArch(a.id)}
            style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,padding:'8px 16px',border:'none',cursor:'pointer',background:activeArch===a.id?a.color:CRD,color:activeArch===a.id?'#fff':MUT}}>
            {a.label}
          </button>
        ))}
      </div>

      <div style={{display:'flex',gap:2,marginBottom:16}}>
        {SECTIONS.map(s=>(
          <button key={s.id} onClick={()=>setActiveSec(s.id)}
            style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,padding:'6px 14px',border:'none',cursor:'pointer',background:activeSec===s.id?arch?.color||A:CRD,color:activeSec===s.id?'#fff':MUT}}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{color:MUT,fontFamily:"'Nunito Sans',sans-serif",fontSize:12}}>Loading…</p>
      ) : (
        <>
          {filtered.map((item,i)=>(
            <div key={item.id} style={{background:item.active?CRD:'rgba(180,150,160,0.3)',border:`1px solid ${BD}`,marginBottom:8,padding:14,opacity:item.active?1:0.6}}>
              {editing===item.id ? (
                <div>
                  <textarea value={editText} onChange={e=>setEditText(e.target.value)} rows={3}
                    style={{width:'100%',padding:'8px 12px',fontFamily:"'Nunito Sans',sans-serif",fontSize:12,background:'rgba(255,255,255,0.8)',border:`1px solid ${BD}`,color:TXT,outline:'none',resize:'vertical',boxSizing:'border-box',marginBottom:8}}/>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>save(item.id)} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,padding:'5px 12px',background:'#1A5A2A',color:'#fff',border:'none',cursor:'pointer'}}>Save</button>
                    <button onClick={()=>{setEditing(null);setEditText('')}} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,padding:'5px 12px',background:CRD,color:MUT,border:`1px solid ${BD}`,cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT,marginBottom:4}}>#{i+1}</div>
                    <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:TXT,lineHeight:1.6}}>{item.content}</div>
                  </div>
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <button onClick={()=>{setEditing(item.id);setEditText(item.content)}}
                      style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,padding:'4px 10px',background:CRD,color:MUT,border:`1px solid ${BD}`,cursor:'pointer'}}>Edit</button>
                    <button onClick={()=>toggle(item.id,item.active)}
                      style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,padding:'4px 10px',background:item.active?A:'#1A5A2A',color:'#fff',border:'none',cursor:'pointer'}}>
                      {item.active?'Hide':'Show'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length===0 && (
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,fontStyle:'italic',marginBottom:12}}>No items yet for this archetype/section. Add one below.</p>
          )}

          {adding ? (
            <div style={{background:'rgba(255,255,255,0.5)',border:`1px solid ${BD}`,padding:14,marginTop:8}}>
              <textarea value={newText} onChange={e=>setNewText(e.target.value)}
                placeholder="Enter new item..." rows={3}
                style={{width:'100%',padding:'8px 12px',fontFamily:"'Nunito Sans',sans-serif",fontSize:12,background:'rgba(255,255,255,0.8)',border:`1px solid ${BD}`,color:TXT,outline:'none',resize:'vertical',boxSizing:'border-box',marginBottom:8}}/>
              <div style={{display:'flex',gap:8}}>
                <button onClick={addNew} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,padding:'5px 12px',background:arch?.color||A,color:'#fff',border:'none',cursor:'pointer'}}>Add item</button>
                <button onClick={()=>{setAdding(false);setNewText('')}} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,padding:'5px 12px',background:CRD,color:MUT,border:`1px solid ${BD}`,cursor:'pointer'}}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setAdding(true)}
              style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,padding:'8px 16px',background:arch?.color||A,color:'#fff',border:'none',cursor:'pointer',marginTop:8}}>
              + Add new item
            </button>
          )}
        </>
      )}
    </div>
  )
}

const TABS = [
  { id:'submissions', label:'Submissions',    icon:<Flag size={14}/> },
  { id:'profiles',    label:'Profiles',       icon:<Users size={14}/> },
  { id:'lindalinda',  label:'LindaLinda',     icon:<Shield size={14}/> },
  { id:'archetypes',  label:'JiJue / JiTume', icon:<BookOpen size={14}/> },
  { id:'analytics',   label:'Analytics',      icon:<BarChart2 size={14}/> },
  { id:'cases',       label:'Case tracker',   icon:<FileText size={14}/> },
  { id:'codes',       label:'Access codes',   icon:<Users size={14}/> },
]

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
    <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:MUT,fontSize:13,fontFamily:"'Nunito Sans',sans-serif"}}>Loading...</p>
    </div>
  )

  if (!session) return <LoginScreen/>

  return (
    <div style={{fontFamily:"'Nunito Sans',sans-serif",color:TXT,minHeight:'100vh',background:BG,width:'100%'}}>

      {/* Header */}
      <header style={{background:'#D4BCBC',borderBottom:`1px solid ${BD}`,padding:'0 32px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 0',borderBottom:`1px solid ${BD}`}}>
          <div>
            <div className="serif" style={{fontSize:28,fontWeight:700,color:TXT,lineHeight:1}}>
              Fem<span style={{color:A}}>Saidia</span> Kenya
            </div>
            <p style={{fontSize:11,color:MUT,marginTop:4,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.1em',fontWeight:700}}>
              ADMIN DASHBOARD
            </p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>
              {session.user.email}
            </p>
            <button className="btn btn-ghost" style={{padding:'7px 12px',fontSize:11}}
              onClick={()=>supabase.auth.signOut()}>
              <LogOut size={12}/> Sign out
            </button>
          </div>
        </div>
        <nav style={{display:'flex'}}>
          {TABS.map(t=>(
            <button key={t.id} className={`nav-tab${tab===t.id?' active':''}`}
              onClick={()=>setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
          <a href="https://femsaidiakenya.org" target="_blank" rel="noopener noreferrer"
            style={{marginLeft:'auto',display:'inline-flex',alignItems:'center',gap:6,
              fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif",padding:'12px 0',
              textDecoration:'none',fontWeight:600}}>
            <Eye size={13}/> View public site
          </a>
        </nav>
      </header>

      <main style={{padding:'28px 32px',width:'100%'}}>
        {tab==='submissions' && <SubmissionsTab/>}
        {tab==='profiles'    && <ProfilesTab/>}
        {tab==='lindalinda'  && <LindaLindaTab/>}
        {tab==='archetypes'  && <ArchetypesTab/>}
        {tab==='analytics'   && <AnalyticsTab/>}
        {tab==='codes'       && <AccessCodesTab/>}
        {tab==='cases'       && <CasesTab/>}
      </main>

      <footer style={{borderTop:`1px solid ${BD}`,padding:'14px 32px',
        display:'flex',justifyContent:'space-between',background:'#D4BCBC'}}>
        <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>FemSaidia Kenya Admin · Restricted access</p>
        <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>Built for justice</p>
      </footer>
    </div>
  )
}
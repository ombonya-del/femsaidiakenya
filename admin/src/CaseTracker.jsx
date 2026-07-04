import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ExternalLink, RefreshCw, Filter, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const A   = '#8A1030'
const A2  = '#8A4010'
const BD  = '#B89AAA'
const CRD = '#C4AABB'
const TXT = '#180410'
const MUT = '#7A4A60'

const STATUS_CONFIG = {
  reported:     { label:'Reported',     bg:'#DDD0D0', bc:'#B89AAA', tc:'#5A3050', desc:'Case reported — no further action confirmed' },
  investigated: { label:'Investigated', bg:'#E8D8C0', bc:'#B09060', tc:'#5A4010', desc:'Police investigation opened' },
  charged:      { label:'Charged',      bg:'#D8E0C8', bc:'#80A060', tc:'#2A4810', desc:'Suspect charged in court' },
  trial:        { label:'Trial',        bg:'#C8D8E8', bc:'#6080A0', tc:'#102040', desc:'Case in active trial' },
  convicted:    { label:'Convicted',    bg:'#C8D8C0', bc:'#60A050', tc:'#1A4810', desc:'Found guilty — sentence issued' },
  acquitted:    { label:'Acquitted',    bg:'#DCC8D8', bc:'#A060A0', tc:'#4A1050', desc:'Suspect found not guilty' },
  dismissed:    { label:'Dismissed',    bg:'#E0D0C0', bc:'#A08060', tc:'#5A3010', desc:'Case dismissed by court' },
  cold:         { label:'Cold case',    bg:'#D0D4D8', bc:'#8090A0', tc:'#203040', desc:'No suspects — case gone cold' },
  no_action:    { label:'No action',    bg:'#E8D0C8', bc:'#B07060', tc:'#6A1008', desc:'Known suspect — no legal action taken' },
}

const COUNTIES = [
  'All counties','Nairobi','Kiambu','Mombasa','Nakuru','Kisumu','Kajiado','Kwale',
  'Machakos',"Murang'a",'Kilifi','Uasin Gishu','Trans Nzoia','Meru',
  'Kakamega','Nyeri','Nandi','Embu','Other',
]

// ── JUSTICE FUNNEL ────────────────────────────────────────────────────────────
function JusticeFunnel({ cases, mobile }) {
  if (!cases.length) return null

  const total        = cases.length
  const investigated = cases.filter(c => ['investigated','charged','trial','convicted','acquitted'].includes(c.status)).length
  const charged      = cases.filter(c => ['charged','trial','convicted','acquitted'].includes(c.status)).length
  const trial        = cases.filter(c => ['trial','convicted','acquitted'].includes(c.status)).length
  const convicted    = cases.filter(c => c.status === 'convicted').length
  const noAction     = cases.filter(c => ['no_action','cold','dismissed','reported'].includes(c.status)).length

  const stages = [
    { label:'Reported',     n:total,        color:'#7A4A60' },
    { label:'Investigated', n:investigated, color:'#CA8A04' },
    { label:'Charged',      n:charged,      color:'#2563EB' },
    { label:'Trial',        n:trial,        color:'#7C3AED' },
    { label:'Convicted',    n:convicted,    color:'#166534' },
  ]

  return (
    <div>
      {/* Funnel bars */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:100, marginBottom:12 }}>
        {stages.map((s, i) => {
          const pct = total > 0 ? (s.n / total) : 0
          const h   = Math.max(20, Math.round(pct * 100))
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', gap:3 }}>
              <div style={{ fontFamily:"'Lora',serif", fontSize: mobile ? 13 : 16, fontWeight:700, color:s.color }}>{s.n}</div>
              <div style={{ width:'100%', height:h, background:s.color, opacity:.88, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:3 }}>
                {s.n > 0 && <span style={{ fontSize:9, color:'#fff', fontWeight:700, fontFamily:"'Nunito Sans',sans-serif" }}>
                  {Math.round(pct*100)}%
                </span>}
              </div>
              <div style={{ fontSize: mobile ? 8 : 10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", textAlign:'center', fontWeight:700, letterSpacing:'.02em' }}>
                {s.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Justice gap */}
      <div style={{ background:'#C4B0B8', border:`1px solid ${A}`, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontFamily:"'Lora',serif", fontSize:28, fontWeight:700, color:A }}>{noAction}</div>
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:TXT, fontFamily:"'Nunito Sans',sans-serif" }}>cases with no justice</p>
            <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>No charges · dismissed · cold · no action</p>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:700, color:A }}>
            {total > 0 ? Math.round((noAction/total)*100) : 0}%
          </div>
          <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>justice gap</p>
        </div>
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

// ── WE REMEMBER TOGGLE ────────────────────────────────────────────────────────
function WeRememberToggle({ caseId, current, onToggle }) {
  const [busy, setBusy] = useState(false)
  const isOn = current !== false

  const toggle = async (e) => {
    e.stopPropagation()
    setBusy(true)
    const { error } = await supabase.from('femicide_cases').update({ we_remember: !isOn }).eq('id', caseId)
    setBusy(false)
    if (!error) onToggle(caseId, !isOn)
  }

  return (
    <button onClick={toggle} disabled={busy} title={isOn?'Shown in We Remember — click to hide':'Hidden — click to show'}
      style={{
        display:'inline-flex', alignItems:'center', gap:4,
        padding:'3px 9px', borderRadius:12, cursor:busy?'wait':'pointer',
        border:`1px solid ${isOn?'#60A050':'#B89AAA'}`,
        background:isOn?'#C8D8C0':'#EEE0E8',
        fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
        color:isOn?'#1A4810':'#7A4A60', whiteSpace:'nowrap',
        opacity:busy?0.5:1,
      }}>
      {isOn ? '● We Remember' : '○ Hidden'}
    </button>
  )
}

const safePlatforms = (arr) => Array.isArray(arr) ? arr : typeof arr === 'string' ? arr.replace(/[{}\'\"]/g,'').split(',').map(s=>s.trim()).filter(Boolean) : []

export default function CaseTrackerTab() {
  const mobile = window.innerWidth < 768

  const [cases, setCases]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [countyFilter, setCountyFilter] = useState('All counties')
  const [yearFilter, setYearFilter]     = useState('all')
  const [techFilter, setTechFilter]     = useState('all')
  const [search, setSearch]             = useState('')

  const handleWeRemember = (id, val) => setCases(cs => cs.map(c => c.id===id ? {...c,we_remember:val} : c))

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('femicide_cases')
      .select('*')
      .eq('published', true)
      .order('incident_date', { ascending:false })
    setCases(data || [])
    setLoading(false)
  }

  const thisYear      = new Date().getFullYear()
  const thisYearCases = cases.filter(c => c.incident_date && new Date(c.incident_date).getFullYear() === thisYear)
  const noActionCount = cases.filter(c => c.status === 'no_action' || c.status === 'cold').length
  const convictedCount = cases.filter(c => c.status === 'convicted').length
  const justiceRate   = cases.length ? Math.round((convictedCount/cases.length)*100) : 0

  const filtered = cases.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchCounty = countyFilter === 'All counties' || c.county === countyFilter
    const matchYear   = yearFilter === 'all' || (c.incident_date && new Date(c.incident_date).getFullYear() === parseInt(yearFilter))
    const matchTech   = techFilter === 'all' || (techFilter === 'yes' ? c.tech_facilitated : !c.tech_facilitated)
    const matchSearch = !search || c.victim_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.county?.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase()) ||
      c.case_ref?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchCounty && matchYear && matchTech && matchSearch
  })

  const selectStyle = {
    fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT,
    background:CRD, border:`1px solid ${BD}`, padding:'10px 12px',
    outline:'none', cursor:'pointer', width:'100%',
  }

  return (
    <div className="fade-up" style={{ width:'100%' }}>

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${BD}`, paddingBottom:20, marginBottom:24 }}>
        <p className="label" style={{ marginBottom:8, color:A }}>● Live case database · updated by admin team</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
          <h1 className="serif" style={{ fontSize: mobile ? 28 : 36, fontWeight:700, color:TXT }}>Case Tracker</h1>
          <button onClick={load} style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:600, padding:'8px 14px', border:`1px solid ${BD}`, background:CRD, color:MUT, cursor:'pointer', flexShrink:0 }}>
            <RefreshCw size={12}/> Refresh
          </button>
        </div>
        <p style={{ fontSize:13, color:MUT, marginTop:8, fontFamily:"'Nunito Sans',sans-serif", fontWeight:300, lineHeight:1.8, maxWidth:720 }}>
          A manually curated database tracking femicide cases in Kenya from first report through to legal outcome —
          or the devastating absence of one.
        </p>
      </div>

      {/* Live counter — stacked on mobile */}
      <div style={{ background:'#BC9EAE', border:`2px solid ${A}`, padding: mobile ? '18px 16px' : '24px 28px', marginBottom:2 }}>
        {/* Top: big number */}
        <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:16 }}>
          <div className="serif" style={{ fontSize: mobile ? 56 : 80, fontWeight:700, color:A, lineHeight:1 }}>
            {thisYearCases.length}
          </div>
          <div style={{ paddingBottom:8 }}>
            <p style={{ fontSize:13, color:TXT, fontWeight:700, fontFamily:"'Nunito Sans',sans-serif" }}>Cases in {thisYear}</p>
            <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>{cases.length} total on record</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:20, marginBottom:16, flexWrap:'wrap' }}>
          {[
            { v:convictedCount,   l:'Convictions', c:'#166534' },
            { v:noActionCount,    l:'No justice',  c:A },
            { v:`${justiceRate}%`,l:'Justice rate', c: justiceRate >= 30 ? '#166534' : A },
          ].map((s,i) => (
            <div key={i}>
              <div style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.06em', textTransform:'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Funnel section */}
        <div style={{ background:'#B89AAA', border:`2px solid ${A}`, padding: mobile ? '14px' : '20px' }}>
          <p style={{ fontSize:10, color:A, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.12em', textTransform:'uppercase', marginBottom:4, fontWeight:700 }}>Justice status breakdown</p>
          <p style={{ fontSize: mobile ? 14 : 18, fontFamily:"'Lora',serif", fontWeight:700, color:TXT, marginBottom:16, borderBottom:`1px solid ${BD}`, paddingBottom:10 }}>Where do cases end up?</p>
          <JusticeFunnel cases={cases} mobile={mobile}/>
          <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", marginTop:10, fontStyle:'italic' }}>
            {noActionCount} cases ({cases.length ? Math.round((noActionCount/cases.length)*100) : 0}%) have no known legal action.
          </p>
          <div style={{ marginTop:10, padding:'8px 12px', background:'#C4AABB', border:`1px solid ${BD}`, fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.6 }}>
            <strong style={{ color:TXT }}>Data source:</strong> Cases sourced from NGEC reports, verified news and court records.
            <strong style={{ color:A }}> Real numbers are significantly higher.</strong>
          </div>
        </div>
      </div>

      {/* Status summary — 2-col grid on mobile */}
      <div style={{ display:'grid', gridTemplateColumns: mobile ? 'repeat(2,1fr)' : 'repeat(7,1fr)', gap:2, marginBottom:2, marginTop:2 }}>
        {Object.entries(STATUS_CONFIG).filter(([k]) => !['acquitted','dismissed'].includes(k)).map(([status, conf]) => {
          const count = cases.filter(c => c.status === status).length
          return (
            <button key={status} onClick={() => setStatusFilter(statusFilter===status?'all':status)}
              style={{
                background: statusFilter===status ? conf.bc : conf.bg,
                border:`1px solid ${statusFilter===status ? A : conf.bc}`,
                padding:'12px 14px', cursor:'pointer', textAlign:'left',

              }}>
              <div style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:statusFilter===status?'#fff':conf.tc }}>{count}</div>
              <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700, color:statusFilter===status?'#fff':conf.tc, marginTop:4 }}>{conf.label}</div>
              {!mobile && <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:statusFilter===status?'rgba(255,255,255,.7)':MUT, marginTop:2 }}>{conf.desc}</div>}
            </button>
          )
        })}
      </div>

      {/* Filters — stacked on mobile */}
      <div style={{ display:'grid', gridTemplateColumns: mobile ? '1fr' : '1fr auto auto auto', gap:2, marginBottom:12 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by name, county, location or case ref..."
          style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:TXT, background:CRD, border:`1px solid ${BD}`, padding:'10px 14px', outline:'none' }}/>
        <select value={countyFilter} onChange={e=>setCountyFilter(e.target.value)} style={selectStyle}>
          {COUNTIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} style={selectStyle}>
          <option value="all">All years</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>
        <select value={techFilter} onChange={e=>setTechFilter(e.target.value)} style={selectStyle}>
          <option value="all">All cases</option>
          <option value="yes">Tech-facilitated</option>
          <option value="no">Non-tech</option>
        </select>
      </div>

      <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", marginBottom:10 }}>
        Showing {filtered.length} of {cases.length} cases
        {statusFilter !== 'all' && ` · filtered by: ${STATUS_CONFIG[statusFilter]?.label}`}
      </p>

      {/* Cases list */}
      {loading ? (
        <p style={{ color:MUT, fontSize:12 }}>Loading cases...</p>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:40 }}>
              <p style={{ fontSize:13, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>No cases match your filters.</p>
              <button onClick={()=>{setStatusFilter('all');setCountyFilter('All counties');setYearFilter('all');setTechFilter('all');setSearch('')}}
                style={{ marginTop:10, background:'none', border:'none', cursor:'pointer', color:A, fontSize:12, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700 }}>
                Clear all filters
              </button>
            </div>
          ) : (
            filtered.map((c, i) => {
              const conf   = STATUS_CONFIG[c.status] || STATUS_CONFIG.reported
              const isOpen = expanded === c.id
              const dateStr = c.incident_date
                ? new Date(c.incident_date).toLocaleDateString(['en-KE','en-GB'],{day:'numeric',month:'short',year:'numeric'})
                : 'Date unknown'

              return (
                <div key={c.id} style={{ borderBottom: i < filtered.length-1 ? `1px solid ${BD}` : 'none' }}>

                  {/* ── MOBILE ROW ── */}
                  {mobile ? (
                    <div onClick={() => setExpanded(isOpen ? null : c.id)}
                      style={{ padding:'12px 14px', cursor:'pointer', background: isOpen ? '#C8B0C0' : 'transparent' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          {/* Name + age on one line */}
                          <div style={{ fontWeight:700, fontSize:13, color:TXT, fontFamily:"'Nunito Sans',sans-serif", display:'flex', alignItems:'baseline', gap:6, flexWrap:'wrap' }}>
                            <span>{c.victim_name || 'Name withheld'}</span>
                            {c.victim_age && <span style={{ fontWeight:400, fontSize:11, color:MUT }}>· {c.victim_age}</span>}
                          </div>
                          {/* Location */}
                          <div style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", marginTop:2 }}>
                            {c.location ? `${c.location}, ` : ''}{c.county}
                          </div>
                          {/* Tech badge — single line */}
                          {c.tech_facilitated && (
                            <div style={{ marginTop:4 }}>
                              <span style={{ fontSize:10, background:'#8A4010', color:'#fff', padding:'2px 6px', fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, whiteSpace:'nowrap', display:'inline-block', maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis' }}>
                                Tech: {safePlatforms(c.tech_platforms).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Status + chevron on right */}
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
                          <span className="badge" style={{ background:conf.bg, borderColor:conf.bc, color:conf.tc, fontSize:9, whiteSpace:'nowrap' }}>
                            {conf.label}
                          </span>
                          <div style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", textAlign:'right' }}>{dateStr}</div>
                          <div onClick={e=>e.stopPropagation()} style={{marginTop:2}}>
            <WeRememberToggle caseId={c.id} current={c.we_remember} onToggle={handleWeRemember}/>
          </div>
          {isOpen ? <ChevronUp size={14} color={MUT}/> : <ChevronDown size={14} color={MUT}/>}
                        </div>
                      </div>
                    </div>
                  ) : (
                  /* ── DESKTOP ROW ── */
                    <div onClick={() => setExpanded(isOpen ? null : c.id)}
                      style={{ padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, cursor:'pointer', background: isOpen ? '#C8B0C0' : 'transparent' }}>
                      <div style={{ flex:1, display:'grid', gridTemplateColumns:'120px 1fr 140px 140px auto', gap:12, alignItems:'center' }}>
                        <div>
                          <div style={{ fontFamily:'monospace', fontSize:11, color:MUT, marginBottom:2 }}>{c.case_ref}</div>
                          <div style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>{dateStr}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, color:TXT, fontFamily:"'Nunito Sans',sans-serif" }}>
                            {c.victim_name || 'Name withheld'}
                            {c.victim_age && <span style={{ fontWeight:400, color:MUT }}> · {c.victim_age}</span>}
                          </div>
                          <div style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", marginTop:2 }}>
                            {c.location ? `${c.location}, ` : ''}{c.county}
                            {c.tech_facilitated && (
                              <span style={{ marginLeft:6, fontSize:10, background:'#8A4010', color:'#fff', padding:'1px 5px', fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, whiteSpace:'nowrap' }}>
                                Tech: {safePlatforms(c.tech_platforms).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>
                          {c.perpetrator_relationship?.replace(/_/g,' ') || 'Unknown relationship'}
                        </div>
                        <div>
                          <span className="badge" style={{ background:conf.bg, borderColor:conf.bc, color:conf.tc }}>
                            {conf.label}
                          </span>
                        </div>
                      </div>
                      <div style={{ color:MUT, flexShrink:0 }}>
                        {isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      </div>
                    </div>
                  )}

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ padding: mobile ? '12px 14px 16px' : '14px 20px 20px', borderTop:`1px solid ${BD}`, background:'#C8B0C0' }}>
                      <div style={{ display:'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3,1fr)', gap: mobile ? 12 : 14 }}>
                        <div>
                          <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>Case status</p>
                          <span className="badge" style={{ background:conf.bg, borderColor:conf.bc, color:conf.tc, fontSize:11 }}>{conf.label}</span>
                          <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", marginTop:4, lineHeight:1.6 }}>{conf.desc}</p>
                          {c.sentence && <p style={{ fontSize:12, color:TXT, fontFamily:"'Nunito Sans',sans-serif", marginTop:6, fontWeight:600 }}>Sentence: {c.sentence}</p>}
                        </div>
                        <div>
                          <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>Incident details</p>
                          <p style={{ fontSize:12, color:TXT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.7 }}>
                            {dateStr}<br/>
                            {c.location && <>{c.location}, </>}{c.county}<br/>
                            Perpetrator: {c.perpetrator_relationship?.replace(/_/g,' ') || 'Unknown'}<br/>
                            {c.tech_facilitated && `Tech: ${safePlatforms(c.tech_platforms).join(', ')}`}
                          </p>
                          <div style={{ marginTop:8 }}>
                            <label style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase', display:'block', marginBottom:3 }}>Archetype</label>
                            <select value={c.archetype || ''} onChange={async e => {
                                const val = e.target.value || null
                                await supabase.from('femicide_cases').update({ archetype: val }).eq('id', c.id)
                                setCases(cs => cs.map(x => x.id===c.id ? { ...x, archetype: val } : x))
                              }}
                              style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, padding:'5px 8px', background:'#fff', border:`1px solid ${BD}`, color:TXT, cursor:'pointer' }}>
                              <option value="">Unclassified</option>
                              <option value="naive">The Naive</option>
                              <option value="precocious">The Precocious</option>
                              <option value="allin">The All-In</option>
                              <option value="onoff">The On & Off</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>Source</p>
                          <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.6 }}>
                            Type: {c.source_type || 'Not specified'}<br/>
                            Verified: {c.verified ? 'Yes' : 'Seeded — pending verification'}
                          </p>
                          {c.source_url && (
                            <a href={c.source_url} target="_blank" rel="noopener noreferrer"
                              style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:6, fontSize:11, color:A, fontFamily:"'Nunito Sans',sans-serif", fontWeight:600, textDecoration:'none' }}>
                              View source <ExternalLink size={10}/>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Data note */}
      <div style={{ paddingTop:16, marginTop:16, borderTop:`1px solid ${BD}` }}>
        <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
          <AlertTriangle size={13} color={A} style={{ flexShrink:0, marginTop:2 }}/>
          <p style={{ fontSize:11, color:MUT, lineHeight:1.8, fontFamily:"'Nunito Sans',sans-serif" }}>
            Case data is compiled from verified news sources, court records and CSO reports.
            Victim names are published only where families have consented or where the case is already publicly documented.
            To report a new case or update an existing one, use the Report tab or contact admin@femsaidiakenya.org.
          </p>
        </div>
      </div>
    </div>
  )
}
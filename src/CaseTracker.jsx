import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ExternalLink, RefreshCw, Filter, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const A   = '#8A1030'
const A2  = '#8A4010'
const BD  = '#B89AAA'
const BG  = '#D4BEC4'
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

const JUSTICE_GROUPS = {
  justice:    ['convicted'],
  process:    ['charged','trial'],
  active:     ['investigated'],
  pending:    ['reported'],
  failed:     ['no_action','dismissed','acquitted','cold'],
}

const COUNTIES = [
  'All counties','Nairobi','Kiambu','Mombasa','Nakuru','Kisumu','Kajiado','Kwale',
  'Machakos',"Murang'a",'Kilifi','Uasin Gishu','Trans Nzoia','Meru',
  'Kakamega','Nyeri','Nandi','Embu','Other',
]

// ── JUSTICE FUNNEL ────────────────────────────────────────────────────────────
function JusticeFunnel({ cases }) {
  if (!cases.length) return null

  const total        = cases.length
  const investigated = cases.filter(c => ['investigated','charged','trial','convicted','acquitted'].includes(c.status)).length
  const charged      = cases.filter(c => ['charged','trial','convicted','acquitted'].includes(c.status)).length
  const trial        = cases.filter(c => ['trial','convicted','acquitted'].includes(c.status)).length
  const convicted    = cases.filter(c => c.status === 'convicted').length
  const noAction     = cases.filter(c => ['no_action','cold','dismissed','reported'].includes(c.status)).length

  const stages = [
    { label:'Reported',     n:total,        color:'#7A4A60', desc:'Total femicide cases on record' },
    { label:'Investigated', n:investigated, color:'#CA8A04', desc:'Police investigation opened' },
    { label:'Charged',      n:charged,      color:'#2563EB', desc:'Suspect charged in court' },
    { label:'Trial',        n:trial,        color:'#7C3AED', desc:'Case reached active trial' },
    { label:'Convicted',    n:convicted,    color:'#166534', desc:'Guilty verdict, sentence issued' },
  ]

  return (
    <div>
      {/* Funnel visualization */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:120, marginBottom:16 }}>
        {stages.map((s, i) => {
          const pct = total > 0 ? (s.n / total) : 0
          const h   = Math.max(24, Math.round(pct * 120))
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', gap:4 }}>
              <div style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:700, color:s.color }}>{s.n}</div>
              <div style={{
                width:'100%', height:h,
                background:s.color, opacity: 0.85 + (i*0.03),
                display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:4,
              }}>
                {s.n > 0 && <span style={{ fontSize:9, color:'#fff', fontWeight:700, fontFamily:"'Nunito Sans',sans-serif" }}>
                  {Math.round(pct*100)}%
                </span>}
              </div>
              <div style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", textAlign:'center', letterSpacing:'.04em', fontWeight:700 }}>
                {s.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Justice gap callout */}
      <div style={{ background:'#C4B0B8', border:`1px solid ${A}`, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontFamily:"'Lora',serif", fontSize:32, fontWeight:700, color:A }}>{noAction}</div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:TXT, fontFamily:"'Nunito Sans',sans-serif" }}>cases with no justice</p>
            <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>
              No charges filed · case dismissed · gone cold · no action taken
            </p>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:"'Lora',serif", fontSize:24, fontWeight:700, color:A }}>
            {total > 0 ? Math.round((noAction/total)*100) : 0}%
          </div>
          <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>justice gap</p>
        </div>
      </div>

      {/* Stage descriptions */}
      <div style={{ display:'flex', gap:2, marginTop:2 }}>
        {stages.map((s,i) => (
          <div key={i} style={{ flex:1, background:CRD, border:`1px solid ${BD}`, borderTop:`3px solid ${s.color}`, padding:'8px 10px' }}>
            <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.5 }}>{s.desc}</p>
            {i > 0 && total > 0 && (
              <p style={{ fontSize:10, fontWeight:700, color:s.color, fontFamily:"'Nunito Sans',sans-serif", marginTop:4 }}>
                {stages[i-1].n - s.n} lost at this stage
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function CaseTrackerTab() {
  const [cases, setCases]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [statusFilter, setStatusFilter]   = useState('all')
  const [countyFilter, setCountyFilter]   = useState('All counties')
  const [yearFilter, setYearFilter]       = useState('all')
  const [techFilter, setTechFilter]       = useState('all')
  const [search, setSearch]               = useState('')

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

  // Stats
  const thisYear = new Date().getFullYear()
  const thisYearCases = cases.filter(c => c.incident_date && new Date(c.incident_date).getFullYear() === thisYear)
  const noActionCount = cases.filter(c => c.status === 'no_action' || c.status === 'cold').length
  const convictedCount = cases.filter(c => c.status === 'convicted').length
  const justiceRate = cases.length ? Math.round((convictedCount/cases.length)*100) : 0

  // Filters
  const filtered = cases.filter(c => {
    const matchStatus  = statusFilter === 'all' || c.status === statusFilter
    const matchCounty  = countyFilter === 'All counties' || c.county === countyFilter
    const matchYear    = yearFilter === 'all' || (c.incident_date && new Date(c.incident_date).getFullYear() === parseInt(yearFilter))
    const matchTech    = techFilter === 'all' || (techFilter === 'yes' ? c.tech_facilitated : !c.tech_facilitated)
    const matchSearch  = !search || c.victim_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.county?.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase()) ||
      c.case_ref?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchCounty && matchYear && matchTech && matchSearch
  })

  return (
    <div className="fade-up" style={{ width:'100%' }}>

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${BD}`, paddingBottom:20, marginBottom:24 }}>
        <p className="label" style={{ marginBottom:8, color:A }}>● Live case database · updated by admin team</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <h1 className="serif" style={{ fontSize:36, fontWeight:700, color:TXT }}>Case Tracker</h1>
          <button onClick={load} style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:600, padding:'8px 14px', border:`1px solid ${BD}`, background:CRD, color:MUT, cursor:'pointer' }}>
            <RefreshCw size={12}/> Refresh
          </button>
        </div>
        <p style={{ fontSize:13, color:MUT, marginTop:8, fontFamily:"'Nunito Sans',sans-serif", fontWeight:300, lineHeight:1.8, maxWidth:720 }}>
          A manually curated database tracking femicide cases in Kenya from first report through to legal outcome —
          or the devastating absence of one. Each case is verified from news, NGEC reports, court records and CSO sources.
          The justice funnel shows exactly how many cases drop out at every stage of the system.
        </p>
      </div>

      {/* Live counter — big and bold */}
      <div style={{ background:'#BC9EAE', border:`2px solid ${A}`, padding:'24px 28px', marginBottom:2, display:'grid', gridTemplateColumns:'auto 1fr', gap:32, alignItems:'center' }}>
        <div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:12 }}>
            <div className="serif" style={{ fontSize:80, fontWeight:700, color:A, lineHeight:1 }}>
              {thisYearCases.length}
            </div>
            <div style={{ paddingBottom:10 }}>
              <p style={{ fontSize:13, color:TXT, fontWeight:700, fontFamily:"'Nunito Sans',sans-serif" }}>Cases in {thisYear}</p>
              <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>{cases.length} total on record</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:16, marginTop:10, flexWrap:'wrap' }}>
            {[
              { v:convictedCount, l:'Convictions', c:'#166534' },
              { v:noActionCount,  l:'No justice',  c:A },
              { v:`${justiceRate}%`, l:'Justice rate', c: justiceRate >= 30 ? '#166534' : A },
            ].map((s,i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Lora',serif", fontSize:24, fontWeight:700, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.06em', textTransform:'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:10, fontWeight:600 }}>Justice status breakdown — all cases</p>
          <JusticeFunnel cases={cases}/>
          <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", marginTop:10, fontStyle:'italic' }}>
            {noActionCount} cases ({cases.length ? Math.round((noActionCount/cases.length)*100) : 0}%) have no known legal action — suspects free, families without justice.
          </p>
          <div style={{ marginTop:10, padding:'8px 12px', background:'#C4B0B8', border:`1px solid ${BD}`, fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.6 }}>
            <strong style={{ color:TXT }}>Data source:</strong> Cases sourced from NGEC reports, verified news sources, CSO data and court records.
            Each case is manually verified by the FemSaidia Kenya admin team.
            <strong style={{ color:A }}> This is not an automated count</strong> — it reflects cases we have been able to document and verify.
            Real numbers are significantly higher.
          </div>
        </div>
      </div>

      {/* Status summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2, marginBottom:2, marginTop:2 }}>
        {Object.entries(STATUS_CONFIG).filter(([k]) => !['acquitted','dismissed'].includes(k)).map(([status, conf]) => {
          const count = cases.filter(c => c.status === status).length
          return (
            <button key={status} onClick={() => setStatusFilter(statusFilter===status?'all':status)}
              style={{
                background: statusFilter===status ? conf.bc : conf.bg,
                border:`1px solid ${statusFilter===status ? A : conf.bc}`,
                padding:'12px 14px', cursor:'pointer', textAlign:'left',
              }}>
              <div style={{ fontFamily:"'Lora',serif", fontSize:24, fontWeight:700, color:statusFilter===status?'#fff':conf.tc }}>{count}</div>
              <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700, color:statusFilter===status?'#fff':conf.tc, marginTop:4 }}>{conf.label}</div>
              <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:statusFilter===status?'rgba(255,255,255,.7)':MUT, marginTop:2 }}>{conf.desc}</div>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:2, marginBottom:16 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by name, county, location or case ref..."
          style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:TXT, background:CRD, border:`1px solid ${BD}`, padding:'10px 14px', outline:'none' }}/>
        <select value={countyFilter} onChange={e=>setCountyFilter(e.target.value)}
          style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, background:CRD, border:`1px solid ${BD}`, padding:'10px 14px', outline:'none', cursor:'pointer' }}>
          {COUNTIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)}
          style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, background:CRD, border:`1px solid ${BD}`, padding:'10px 14px', outline:'none', cursor:'pointer' }}>
          <option value="all">All years</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>
        <select value={techFilter} onChange={e=>setTechFilter(e.target.value)}
          style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, background:CRD, border:`1px solid ${BD}`, padding:'10px 14px', outline:'none', cursor:'pointer' }}>
          <option value="all">All cases</option>
          <option value="yes">Tech-facilitated</option>
          <option value="no">Non-tech</option>
        </select>
      </div>

      {/* Results count */}
      <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", marginBottom:10 }}>
        Showing {filtered.length} of {cases.length} cases
        {statusFilter !== 'all' && ` · filtered by: ${STATUS_CONFIG[statusFilter]?.label}`}
      </p>

      {/* Cases table */}
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
              const conf = STATUS_CONFIG[c.status] || STATUS_CONFIG.reported
              const isOpen = expanded === c.id
              return (
                <div key={c.id} style={{ borderBottom: i < filtered.length-1 ? `1px solid ${BD}` : 'none' }}>
                  {/* Row */}
                  <div onClick={() => setExpanded(isOpen ? null : c.id)}
                    style={{ padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, cursor:'pointer', background: isOpen ? '#C8B0C0' : 'transparent' }}>
                    <div style={{ flex:1, display:'grid', gridTemplateColumns:'120px 1fr 140px 140px auto', gap:12, alignItems:'center' }}>
                      {/* Case ref + date */}
                      <div>
                        <div style={{ fontFamily:'monospace', fontSize:11, color:MUT, marginBottom:2 }}>{c.case_ref}</div>
                        <div style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>
                          {c.incident_date ? new Date(c.incident_date).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}) : 'Date unknown'}
                        </div>
                      </div>
                      {/* Victim + location */}
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:TXT, fontFamily:"'Nunito Sans',sans-serif" }}>
                          {c.victim_name || 'Name withheld'}
                          {c.victim_age && <span style={{ fontWeight:400, color:MUT }}> · {c.victim_age}</span>}
                        </div>
                        <div style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", marginTop:2 }}>
                          {c.location ? `${c.location}, ` : ''}{c.county}
                          {c.tech_facilitated && (
                            <span style={{ marginLeft:6, fontSize:10, background:'#8A4010', color:'#fff', padding:'1px 5px', fontFamily:"'Nunito Sans',sans-serif", fontWeight:700 }}>
                              Tech: {c.tech_platforms?.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Perpetrator relationship */}
                      <div style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>
                        {c.perpetrator_relationship?.replace(/_/g,' ') || 'Unknown relationship'}
                      </div>
                      {/* Status badge */}
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

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ padding:'14px 20px 20px', borderTop:`1px solid ${BD}`, background:'#C8B0C0' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                        <div>
                          <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>Case status</p>
                          <div style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                            <span className="badge" style={{ background:conf.bg, borderColor:conf.bc, color:conf.tc, fontSize:11 }}>{conf.label}</span>
                          </div>
                          <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", marginTop:4, lineHeight:1.6 }}>{conf.desc}</p>
                          {c.sentence && (
                            <p style={{ fontSize:12, color:TXT, fontFamily:"'Nunito Sans',sans-serif", marginTop:6, fontWeight:600 }}>Sentence: {c.sentence}</p>
                          )}
                          {c.next_hearing && (
                            <p style={{ fontSize:11, color:'#2563EB', fontFamily:"'Nunito Sans',sans-serif", marginTop:4 }}>
                              Next hearing: {new Date(c.next_hearing).toLocaleDateString('en-KE')}
                            </p>
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>Incident details</p>
                          <p style={{ fontSize:12, color:TXT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.7 }}>
                            {c.incident_date ? new Date(c.incident_date).toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : 'Date unknown'}<br/>
                            {c.location && <>{c.location}, </>}{c.county}<br/>
                            Perpetrator: {c.perpetrator_relationship?.replace(/_/g,' ') || 'Unknown'}<br/>
                            {c.tech_facilitated && `Tech-facilitated via ${c.tech_platforms?.join(', ')}`}
                          </p>
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
                          {c.court_ref && (
                            <a href={c.court_ref} target="_blank" rel="noopener noreferrer"
                              style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:4, fontSize:11, color:'#166534', fontFamily:"'Nunito Sans',sans-serif", fontWeight:600, textDecoration:'none' }}>
                              Court record <ExternalLink size={10}/>
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
            Case statuses are updated as new information becomes available.
            To report a new case or update an existing one, use the Report tab or contact admin@femsaidiakenya.org.
          </p>
        </div>
      </div>
    </div>
  )
}
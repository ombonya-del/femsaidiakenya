import { useState, useEffect } from 'react'
import RedFlagTab from './RedFlag.jsx'
import PetitionTab from './Petition.jsx'
import ReportTab from './Report.jsx'
import PartnersTab from './Partners.jsx'
import SocialsSentimentTab from './SocialsSentiment.jsx'
import TechTrackerTab from './TechTracker.jsx'
import SurvivalGuideTab from './SurvivalGuide.jsx'
import CaseTrackerTab from './CaseTracker.jsx'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import {
  Lock, ExternalLink, AlertTriangle, Download, Play, FileText,
  Scale, Database, Newspaper,
  Home, TrendingUp, ShieldCheck, Flame, Users
} from 'lucide-react'
import { INCIDENTS, DOCUMENTS, RESOURCES } from './data.js'
import KenyaCountyMap from './KenyaCountyMap.jsx'
import './App.css'
import { createClient } from '@supabase/supabase-js'
const _sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

const A   = '#8A1030'
const A2  = '#8A4010'
const BD  = '#B89AAA'
const BG  = '#D4BEC4'
const CRD = '#C4AABB'
const TXT = '#180410'
const MUT = '#7A4A60'
const HDR = '#C8AFBA'

const TREND = [
  {m:"J'24",f:97,n:88},{m:"F'24",f:42,n:94},{m:"M'24",f:37,n:88},
  {m:"A'24",f:33,n:82},{m:"M'24",f:29,n:76},{m:"J'24",f:32,n:79},
  {m:"J'24",f:27,n:73},{m:"A'24",f:31,n:78},{m:"S'24",f:34,n:82},
  {m:"O'24",f:38,n:87},{m:"N'24",f:41,n:91},{m:"D'24",f:44,n:95},
  {m:"J'25",f:38,n:89},{m:"F'25",f:35,n:85},{m:"M'25",f:40,n:91},
  {m:"A'25",f:36,n:87},{m:"M'25",f:33,n:83},{m:"J'25",f:37,n:88},
  {m:"J'25",f:41,n:93},{m:"A'25",f:39,n:90},{m:"S'25",f:43,n:96},
  {m:"O'25",f:46,n:99},{m:"N'25",f:44,n:97},{m:"D'25",f:48,n:102},
]

const COUNTIES = [
  {n:'Nairobi',c:142,r:0},{n:'Kiambu',c:67,r:1},{n:'Mombasa',c:54,r:1},
  {n:'Nakuru',c:48,r:1},{n:'Kisumu',c:31,r:2},{n:'Kajiado',c:27,r:2},
  {n:'Kwale',c:24,r:2},{n:'Machakos',c:22,r:2},{n:"Murang'a",c:20,r:2},
  {n:'Kilifi',c:18,r:2},{n:'Uasin G.',c:15,r:3},{n:'Trans N.',c:13,r:3},
  {n:'Meru',c:12,r:3},{n:'Kakamega',c:11,r:3},{n:'Nyeri',c:10,r:3},
  {n:'Nandi',c:7,r:4},{n:'Embu',c:6,r:4},{n:'Kirinyaga',c:5,r:4},
  {n:'Bungoma',c:5,r:4},{n:'Homa Bay',c:4,r:4},{n:'Nyamira',c:3,r:4},
  {n:'Laikipia',c:3,r:5},{n:'Baringo',c:3,r:5},{n:'Narok',c:3,r:5},
  {n:'Kericho',c:2,r:5},{n:'Bomet',c:2,r:5},{n:'Siaya',c:2,r:5},
  {n:'Vihiga',c:2,r:5},{n:'Busia',c:2,r:5},{n:'Migori',c:1,r:5},
  {n:'Kisii',c:1,r:5},{n:'Nyandarua',c:1,r:5},{n:'Taita-T.',c:1,r:5},
  {n:'Kitui',c:1,r:5},{n:'Makueni',c:1,r:5},{n:'Samburu',c:0,r:5},
  {n:'Lamu',c:0,r:5},{n:'Tana R.',c:0,r:5},{n:'Garissa',c:0,r:5},
  {n:'Wajir',c:0,r:5},{n:'Mandera',c:0,r:5},{n:'Marsabit',c:0,r:5},
  {n:'Isiolo',c:0,r:5},{n:'Turkana',c:0,r:5},{n:'W. Pokot',c:0,r:5},
  {n:'Elgeyo',c:0,r:5},{n:'Tharaka',c:0,r:5},
]

const RISK = [
  {label:'Critical',      bg:'#B07080', fg:'#200010'},
  {label:'High',          bg:'#C08898', fg:'#280818'},
  {label:'Elevated',      bg:'#C09878', fg:'#281808'},
  {label:'Medium',        bg:'#C0B080', fg:'#282000'},
  {label:'Low',           bg:'#90B898', fg:'#102818'},
  {label:'Gap / minimal', bg:'#C8B8C0', fg:'#7A5068'},
]

const TOP = COUNTIES.filter(c=>c.c>0).sort((a,b)=>b.c-a.c).slice(0,12).map(c=>({name:c.n,cases:c.c}))

const CAT_ICON = {
  'Dataset':    <Database size={13}/>,
  'Report':     <FileText size={13}/>,
  'Law / Act':  <Scale size={13}/>,
  'Video':      <Play size={13}/>,
  'Media':      <Newspaper size={13}/>,
}

const CAT_COLOR = {
  'Dataset':    {bg:'#BC9EAE', tc:A},
  'Report':     {bg:'#C4AABB', tc:'#4A2030'},
  'Law / Act':  {bg:'#C0B490', tc:'#3A2800'},
  'Video':      {bg:'#A8B8C0', tc:'#102030'},
  'Media':      {bg:'#C0B8A8', tc:'#302010'},
}

const CATEGORIES = ['Dataset','Report','Law / Act','Video','Media']

// ── NAV GROUPS — 5 buckets for the mobile bottom nav ─────────────────────────
const NAV_GROUPS = [
  {
    id:    'home',
    label: 'Home',
    icon:  <Home size={19}/>,
    tabs:  ['dashboard'],
  },
  {
    id:    'data',
    label: 'Intel',
    icon:  <TrendingUp size={19}/>,
    tabs:  ['data', 'silencing-women', 'tech-tracker', 'sentiment', 'cases'],
  },
  {
    id:    'safety',
    label: 'Safety',
    icon:  <ShieldCheck size={19}/>,
    tabs:  ['resources', 'survival', 'redflag'],
  },
  {
    id:    'act',
    label: 'Act',
    icon:  <Flame size={19}/>,
    tabs:  ['petition', 'report'],
  },
  {
    id:    'partners',
    label: 'Partners',
    icon:  <Users size={19}/>,
    tabs:  ['partners'],
  },
]

// Short display labels for mobile sub-tab bar
const TAB_SHORT = {
  'dashboard':       'Overview',
  'data':            'Reports',
  'silencing-women': 'Silencing W.',
  'tech-tracker':    'TechTrack',
  'sentiment':       'Socials',
  'resources':       'Help Lines',
  'survival':        'Guide',
  'redflag':         'Red Flag',
  'petition':        'Petition',
  'report':          'Report',
  'cases':           'Cases',
  'partners':        'Partners',
}

// Full tab registry — used by desktop nav + locked-state lookup in SubTabBar
const TABS = [
  {id:'dashboard',       label:'Dashboard'},
  {id:'data',            label:'Data & reports'},
  {id:'silencing-women', label:'Silencing Women'},
  {id:'resources',       label:'Available Help'},
  {id:'survival',        label:'Survival Guide', red:true},
  {id:'redflag',         label:'Red Flag',        red:true},
  {id:'petition',        label:'Petition',        red:true},
  {id:'report',          label:'Report'},
  {id:'partners',        label:'Partners'},
  {id:'sentiment',       label:'Socials & Sentiment'},
  {id:'tech-tracker',    label:'Tech Tracker'},
  {id:'cases',           label:'Case Tracker',    red:true},
]

// ── CHART TOOLTIP ─────────────────────────────────────────────────────────────
function ChartTip({active,payload,label}){
  if(!active||!payload?.length) return null
  return(
    <div style={{background:CRD,color:TXT,border:`1px solid ${BD}`,fontFamily:"'Nunito Sans',sans-serif",fontSize:11,padding:'8px 12px'}}>
      <div style={{opacity:.5,marginBottom:4}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{color:p.color}}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  )
}

// ── ADH FEATURED CARD ─────────────────────────────────────────────────────────
function ADHCard(){
  return(
    <div style={{background:'#BC9EAE',border:`2px solid ${A}`,padding:'24px 28px',marginBottom:2,position:'relative'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:24}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,letterSpacing:'.12em',color:'#fff',background:A,padding:'3px 10px',textTransform:'uppercase',fontWeight:600}}>Featured Dataset</span>
            <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT}}>Africa Data Hub · Odipodev · Africa Uncensored · 2024</span>
          </div>
          <h2 className="serif" style={{fontSize:22,fontWeight:700,color:TXT,lineHeight:1.3,marginBottom:10}}>
            Silencing Women:<br/><em style={{color:A}}>Femicide in Kenya</em>
          </h2>
          <p style={{fontSize:13,color:MUT,lineHeight:1.8,fontFamily:"'Nunito Sans',sans-serif",maxWidth:680,fontWeight:300}}>
            The most comprehensive femicide dataset for Kenya — covering 842 verified cases spanning 2016–2024,
            drawn from court records and media reports. Tracks county distribution, victim profiles,
            perpetrator relationships, and justice outcomes. The primary data source for FemSaidia Kenya.
          </p>
          <div style={{display:'flex',gap:10,marginTop:16}}>
            <a href="https://www.africadatahub.org/femicide-kenya" target="_blank" rel="noopener noreferrer"
              style={{display:'inline-flex',alignItems:'center',gap:6,background:A,color:'#F0D0D8',fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:600,padding:'9px 18px',textDecoration:'none',letterSpacing:'.04em'}}>
              Explore full dataset <ExternalLink size={13}/>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SILENCING WOMEN TAB ───────────────────────────────────────────────────────
function SilencingWomenTab(){
  return(
    <div className="fade-up" style={{width:'100%'}}>
      <div style={{borderBottom:`1px solid ${BD}`,paddingBottom:20,marginBottom:24}}>
        <p className="label" style={{marginBottom:10,color:A}}>Featured dataset · Africa Data Hub · Odipodev · Africa Uncensored</p>
        <h1 className="serif" style={{fontSize:36,fontWeight:700,color:TXT}}>Silencing Women: Femicide in Kenya</h1>
        <p style={{fontSize:13,color:MUT,marginTop:8,fontFamily:"'Nunito Sans',sans-serif",fontWeight:300,lineHeight:1.8}}>
          842 verified femicide cases · 2016–2024 · court records + media reports · live interactive data.
          Use the filters to explore by county, year, perpetrator relationship and more.
        </p>
        <a href="https://www.africadatahub.org/femicide-kenya" target="_blank" rel="noopener noreferrer"
          style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:14,color:A,fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:'.04em',textDecoration:'none'}}>
          Open in full screen <ExternalLink size={12}/>
        </a>
      </div>
      <div style={{width:'100%',border:`1px solid ${BD}`,background:CRD,overflow:'hidden'}}>
        <iframe
          src="https://www.africadatahub.org/femicide-kenya"
          title="Silencing Women: Femicide in Kenya — Africa Data Hub"
          style={{width:'100%',height:'80vh',border:'none',display:'block'}}
          allowFullScreen
        />
      </div>
      <p style={{fontSize:11,color:MUT,marginTop:10,fontFamily:"'Nunito Sans',sans-serif"}}>
        Data by Africa Data Hub, Odipodev and Africa Uncensored ·
        <a href="https://www.africadatahub.org" target="_blank" rel="noopener noreferrer" style={{color:A,marginLeft:4}}>africadatahub.org</a>
      </p>
    </div>
  )
}

// ── DASHBOARD TAB ─────────────────────────────────────────────────────────────
function DashboardTab({ isMobile = false }){
  const [recentCases,  setRecentCases]  = useState([])
  const [intelStats,   setIntelStats]   = useState({total:0,highMiso:0,techGBV:0,alarming:0})
  const [countyCounts, setCountyCounts] = useState({})

  useEffect(()=>{
    _sb.from('femicide_cases')
      .select('id,victim_name,incident_date,county,location,status,source_url,source_type')
      .order('incident_date',{ascending:false}).limit(6)
      .then(({data})=>{ if(data) setRecentCases(data) })

    _sb.from('sentiment_articles')
      .select('misogyny_score,tech_facilitated,gbv_relevance,sentiment')
      .then(({data})=>{
        if(!data) return
        setIntelStats({
          total:    data.length,
          highMiso: data.filter(a=>a.misogyny_score>=7).length,
          techGBV:  data.filter(a=>a.tech_facilitated).length,
          alarming: data.filter(a=>a.sentiment==='alarming'||a.sentiment==='negative').length,
        })
      })

    _sb.from('femicide_cases').select('county')
      .then(({data})=>{
        if(!data) return
        const counts={}
        data.forEach(c=>{ if(c.county) counts[c.county]=(counts[c.county]||0)+1 })
        setCountyCounts(counts)
      })
  },[])

  return(
    <div className="fade-up" style={{width:'100%'}}>
      <div style={{borderBottom:`1px solid ${BD}`,paddingBottom:32,marginBottom:32}}>
        <p className="label" style={{marginBottom:14,color:A,letterSpacing:'.15em'}}>● Kenya · Active crisis · 2023–2026</p>
        <h1 className="serif" style={{fontSize:52,fontWeight:700,lineHeight:1.2,color:TXT}}>
          A woman is killed<br/><em style={{color:A}}>every 47 hours</em><br/>in Kenya.
        </h1>
        <p style={{marginTop:18,fontSize:15,color:MUT,maxWidth:640,lineHeight:1.9,fontWeight:300,fontFamily:"'Nunito Sans',sans-serif"}}>
          FemSaidia Kenya maps the femicide epidemic — connecting incident data,
          misogynistic online narratives, and the digital pathways perpetrators exploit.
          Built in memory of those already lost. Built for those still here.
        </p>
      </div>

      <ADHCard/>

      <div style={{
        background:'#0A2D1A', padding:'20px 24px', marginBottom:2, marginTop:2,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        flexWrap:'wrap', gap:16,
      }}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:6}}>
            <div style={{fontFamily:"'Lora',serif",fontSize:22,fontWeight:700,color:'#FF5C28'}}>hepa</div>
            <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:'rgba(255,255,255,0.5)',letterSpacing:'.12em',textTransform:'uppercase',fontWeight:700}}>Personal safety tool for women</div>
          </div>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.6)',lineHeight:1.7,maxWidth:560}}>
            A personal safety tool with offline survival guidance, emergency contacts and location sharing.
            Also accessible via Salmin — <a href="tel:*384*89056%23" style={{color:'rgba(255,255,255,0.9)',fontWeight:700,textDecoration:'none'}}>*384*89056#</a> — on any phone, any network, no internet needed.
          </p>
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <a href="https://hepa.femsaidiakenya.org" target="_blank" rel="noopener noreferrer"
            style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,padding:'10px 20px',background:'#FF5C28',color:'#fff',textDecoration:'none',letterSpacing:'.04em',whiteSpace:'nowrap'}}>
            Access hepa →
          </a>
          <a href="https://redflag.femsaidiakenya.org" target="_blank" rel="noopener noreferrer"
            style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,padding:'10px 20px',background:'#8A1030',color:'#fff',textDecoration:'none',letterSpacing:'.04em',whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',gap:6}}>
            🚩 <span><span style={{color:'#FF4040'}}>Red</span> Flag PWA →</span>
          </a>
          <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.5)',padding:'10px 0',display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:16}}>📞</span>
            Dial <a href="tel:*384*89056%23" style={{color:'#FF5C28',fontWeight:700,textDecoration:'none'}}>*384*89056#</a>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)',gap:2,marginBottom:2,marginTop:2}}>
        {[
          {v:'600+', l:'Reported cases',        s:'2023–2025 · verified',                   c:A},
          {v:'47',   l:'Counties affected',      s:'No county is untouched',                 c:A2},
          {v:'4',    l:'Critical risk counties', s:'Nairobi · Kiambu · Mombasa · Nakuru',    c:A},
          {v:'+312%',l:'Spike in Jan 2024',      s:'#TotalShutdownKE was the turning point', c:A},
        ].map((s,i)=>(
          <div key={i} className="stat-block">
            <div className="serif" style={{fontSize:52,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</div>
            <p style={{fontSize:14,color:TXT,fontWeight:600,marginTop:10,fontFamily:"'Nunito Sans',sans-serif"}}>{s.l}</p>
            <p style={{fontSize:11,color:MUT,marginTop:5,fontFamily:"'Nunito Sans',sans-serif"}}>{s.s}</p>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:2,marginTop:2}}>
        <div className="card" style={{padding:24}}>
          <div className="section-head">
            <span>Reported cases by county · top 12</span>
            <span style={{color:A}}>Indicative</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={TOP} layout="vertical" margin={{left:8,right:20,top:0,bottom:0}}>
              <XAxis type="number" tick={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fill:MUT}} tickLine={false} axisLine={{stroke:BD}}/>
              <YAxis type="category" dataKey="name" width={76} tick={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fill:TXT}} tickLine={false} axisLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="cases" name="Reported cases" fill={A} radius={0}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{padding:24}}>
          <div className="section-head">
            <span>Incident trend vs online misogyny index · 2024–2025</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={TREND} margin={{left:0,right:12,top:10,bottom:0}}>
              <defs>
                <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={A}  stopOpacity={0.35}/><stop offset="95%" stopColor={A}  stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={A2} stopOpacity={0.25}/><stop offset="95%" stopColor={A2} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="m" interval={3} tick={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fill:MUT}} tickLine={false} axisLine={{stroke:BD}}/>
              <YAxis tick={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fill:MUT}} tickLine={false} axisLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <ReferenceLine x="J'24" stroke={A} strokeDasharray="3 3"
                label={{value:'#TotalShutdownKE',position:'insideTopLeft',fill:A,fontSize:10,fontFamily:"'Nunito Sans',sans-serif"}}/>
              <Area type="monotone" dataKey="n" name="Misogyny index"    stroke={A2} strokeWidth={1.5} fill="url(#gN)" dot={false}/>
              <Area type="monotone" dataKey="f" name="Reported incidents" stroke={A} strokeWidth={2}   fill="url(#gF)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
          <p style={{fontSize:11,color:MUT,marginTop:8,fontFamily:"'Nunito Sans',sans-serif"}}>Misogyny index = composite online narrative signal · indicative</p>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:2,marginTop:2}}>
        <div className="card" style={{padding:24}}>
          <div className="section-head" style={{flexDirection:'column',alignItems:'flex-start',gap:8}}>
            <span>All 47 counties · risk level</span>
            <span style={{display:'flex',flexWrap:'wrap',gap:10}}>
              {RISK.map((r,i)=>(
                <span key={i} style={{display:'flex',alignItems:'center',gap:4}}>
                  <span style={{width:8,height:8,background:r.bg,border:`1px solid ${BD}`,display:'inline-block'}}/>
                  <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT}}>{r.label}</span>
                </span>
              ))}
            </span>
          </div>
          <KenyaCountyMap countyCounts={countyCounts}/>
        </div>

        <div className="card" style={{padding:24}}>
          <div style={{borderBottom:`1px solid ${BD}`,paddingBottom:12,marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:A,marginBottom:4}}>● Live from database</p>
              <h2 style={{fontFamily:"'Lora',serif",fontSize:isMobile?16:22,fontWeight:700,color:TXT}}>Recent incidents</h2>
            </div>
            <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT,fontWeight:600}}>{recentCases.length} most recent</span>
          </div>
          {recentCases.length===0?(
            <p style={{fontSize:12,color:MUT,fontFamily:"'Nunito Sans',sans-serif",fontStyle:'italic'}}>Loading…</p>
          ):recentCases.map((inc,i)=>{
            const statusMap={convicted:{bg:'#1A5A2A',bc:'#2D7A3A',tc:'#fff'},charged:{bg:'#1A3F6F',bc:'#2A5FAF',tc:'#fff'},trial:{bg:'#5A3A8A',bc:'#7A5AAA',tc:'#fff'},investigated:{bg:'#8A4010',bc:'#AA6030',tc:'#fff'},reported:{bg:CRD,bc:BD,tc:TXT},no_action:{bg:'#8A1030',bc:'#AA2050',tc:'#fff'},dismissed:{bg:'#5A4A60',bc:'#7A6A80',tc:'#fff'}}
            const s=statusMap[inc.status]||statusMap['reported']
            const dateStr=inc.incident_date?new Date(inc.incident_date).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}):'—'
            return(
              <div key={inc.id} style={{padding:'14px 0',borderBottom:i<recentCases.length-1?`1px solid ${BD}`:'none'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Lora',serif",fontWeight:700,fontSize:isMobile?13:15,color:TXT,marginBottom:4}}>{inc.victim_name||'Name withheld'}</div>
                    <div style={{fontWeight:600,fontSize:12,color:MUT,fontFamily:"'Nunito Sans',sans-serif",marginBottom:4}}>{inc.county}{inc.location?` · ${inc.location}`:''}</div>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                      <span style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>{dateStr}</span>
                      {inc.source_url?(
                        <a href={inc.source_url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:A,fontFamily:"'Nunito Sans',sans-serif",fontWeight:600,display:'inline-flex',alignItems:'center',gap:3,textDecoration:'none'}}>
                          {inc.source_type||'Source'} <ExternalLink size={10}/>
                        </a>
                      ):inc.source_type?(
                        <span style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>{inc.source_type}</span>
                      ):null}
                    </div>
                  </div>
                  <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,padding:'3px 10px',background:s.bg,border:`1px solid ${s.bc}`,color:s.tc,whiteSpace:'nowrap',flexShrink:0,textTransform:'uppercase',letterSpacing:'.06em'}}>
                    {inc.status?.replace('_',' ')||'reported'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card" style={{padding:24,marginTop:2}}>
        <div className="section-head">
          <span>Online narrative & misogyny intelligence</span>
          <span style={{fontSize:10,color:MUT,fontStyle:'italic',fontWeight:400,alignSelf:'flex-end',paddingBottom:1,opacity:.8}}>Social listening integration pending</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)',gap:2,marginBottom:18}}>
          {[
            {v:intelStats.total>0?intelStats.total:'—',       l:'Articles & posts scanned',  n:'GBV intelligence feed · live',   c:A},
            {v:intelStats.highMiso>0?intelStats.highMiso:'—', l:'High misogyny content',      n:'Scored 7+ out of 10',            c:'#7A3020'},
            {v:intelStats.techGBV>0?intelStats.techGBV:'—',   l:'Tech-facilitated GBV',      n:'Via apps · platforms · social',  c:'#6A4010'},
            {v:intelStats.alarming>0?intelStats.alarming:'—', l:'Alarming sentiment items',   n:'Alarming or negative tone',      c:'#1A5A2A'},
          ].map((m,i)=>(
            <div key={i} style={{background:'#BC9EAE',border:`1px solid ${BD}`,padding:'18px 20px'}}>
              <div className="serif" style={{fontSize:36,fontWeight:700,color:m.c,lineHeight:1}}>{m.v}</div>
              <p style={{fontSize:13,color:TXT,marginTop:10,fontWeight:600,fontFamily:"'Nunito Sans',sans-serif"}}>{m.l}</p>
              <p style={{fontSize:11,color:MUT,marginTop:5,fontFamily:"'Nunito Sans',sans-serif"}}>{m.n}</p>
            </div>
          ))}
        </div>
        <div className="pullquote">
          <p className="serif" style={{fontSize:16,fontStyle:'italic',color:TXT,lineHeight:1.9}}>
            "When the manosphere grows, women die. The data makes this correlation undeniable. FemSaidia Kenya exists to force that reckoning — in policy, in platforms, and in public conscience."
          </p>
          <p style={{fontSize:11,color:MUT,marginTop:10,fontFamily:"'Nunito Sans',sans-serif"}}>FemSaidia Kenya research framework · 2026</p>
        </div>
      </div>

      <div style={{paddingTop:18,marginTop:18,borderTop:`1px solid ${BD}`}}>
        <p className="label" style={{marginBottom:8}}>Primary data sources</p>
        <p style={{fontSize:11,color:MUT,lineHeight:2.2,fontFamily:"'Nunito Sans',sans-serif"}}>
          Africa Data Hub · Odipodev · Africa Uncensored · NGEC Kenya · Usikimye ·
          Nation / Standard / The Star / Citizen Digital · UNFPA Kenya ·
          Kenya Police Service · Ministry of Health · GVRC · #TotalShutdownKE ·
          Femicide Count Kenya · Crowdsourced submissions (verified before publication)
        </p>
      </div>
    </div>
  )
}

// ── DATA TAB ──────────────────────────────────────────────────────────────────
function DataTab(){
  const [activeCategory, setActiveCategory] = useState('All')
  const storageKey = 'femsaidia_documents'

  const loadDocs = () => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : DOCUMENTS.map(d=>({...d}))
    } catch { return DOCUMENTS.map(d=>({...d})) }
  }

  const [docs, setDocs] = useState(loadDocs)



  const allCategories = ['All', ...CATEGORIES]
  const filtered = activeCategory === 'All'
    ? docs.map((d,i)=>({...d,_idx:i}))
    : docs.map((d,i)=>({...d,_idx:i})).filter(d => d.category === activeCategory)



  return(
    <div className="fade-up" style={{width:'100%'}}>
      <div style={{borderBottom:`1px solid ${BD}`,paddingBottom:20,marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <p className="label" style={{marginBottom:10}}>Evidence base</p>
            <h1 className="serif" style={{fontSize:36,fontWeight:700,color:TXT}}>Reports, research & source documents</h1>
            <p style={{fontSize:13,color:MUT,marginTop:8,fontFamily:"'Nunito Sans',sans-serif",fontWeight:300}}>
              {docs.length} resources
            </p>
          </div>
        </div>
      </div>

      <div style={{display:'flex',gap:2,marginBottom:2,flexWrap:'wrap'}}>
        {allCategories.map(cat=>(
          <button key={cat} onClick={()=>setActiveCategory(cat)}
            style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:600,padding:'7px 14px',border:`1px solid ${activeCategory===cat?A:BD}`,background:activeCategory===cat?A:CRD,color:activeCategory===cat?'#F0D0D8':MUT,cursor:'pointer',letterSpacing:'.04em',display:'inline-flex',alignItems:'center',gap:5}}>
            {CAT_ICON[cat]} {cat}
            <span style={{opacity:.6,fontSize:10}}>({cat==='All'?docs.length:docs.filter(d=>d.category===cat).length})</span>
          </button>
        ))}
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {filtered.map((d,i)=>{
          const cc  = CAT_COLOR[d.category]||{bg:CRD,tc:MUT}
          const idx = d._idx
          return(
            <div key={idx} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',borderBottom:i<filtered.length-1?`1px solid ${BD}`:'none',gap:16,background:d.featured?'#BC9EAE':'transparent'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  {d.featured&&<span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:'#fff',background:A,padding:'2px 8px',letterSpacing:'.08em',fontWeight:600}}>Primary dataset</span>}
                  <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:600,padding:'2px 8px',background:cc.bg,color:cc.tc,display:'inline-flex',alignItems:'center',gap:4,letterSpacing:'.04em'}}>
                    {CAT_ICON[d.category]} {d.category}
                  </span>
                  <span style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>{d.y}</span>
                </div>
                <div style={{fontWeight:600,fontSize:d.featured?15:14,color:TXT,lineHeight:1.5}}>{d.t}</div>
              </div>
              <div style={{display:'flex',gap:8,flexShrink:0}}>
                <a href={d.url} target="_blank" rel="noopener noreferrer"
                  style={{color:A,display:'inline-flex',alignItems:'center',gap:4,fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:600,padding:'7px 14px',border:`1px solid ${A}`,textDecoration:'none',opacity:d.url?1:0.4,pointerEvents:d.url?'auto':'none'}}>
                  {d.category==='Video'?'Watch':'View'} <ExternalLink size={11}/>
                </a>
                {d.pdf&&(
                  <a href={d.url} target="_blank" rel="noopener noreferrer" download
                    style={{color:MUT,display:'inline-flex',alignItems:'center',gap:4,fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:600,padding:'7px 12px',border:`1px solid ${BD}`,textDecoration:'none'}}>
                    <Download size={12}/> PDF
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── RESOURCES TAB ─────────────────────────────────────────────────────────────
function ResourcesTab(){
  const isMobile = window.innerWidth < 768
  const storageKey = 'femsaidia_resources'

  const loadRes = () => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) return JSON.parse(saved)
      return (Array.isArray(RESOURCES) ? RESOURCES : []).map(r=>({...r}))
    } catch { return (Array.isArray(RESOURCES) ? RESOURCES : []) }
  }

  const [res, setRes] = useState(() => { try { return loadRes() } catch { return [] } })

  // Safety: if res is still empty after load, show a fallback UI rather than blank
  if (!Array.isArray(res)) {
    return <div style={{padding:24,color:'#7A4A60',fontFamily:"'Nunito Sans',sans-serif",fontSize:13}}>Loading resources...</div>
  }



  const urgent  = res.map((r,i)=>({...r,_idx:i})).filter(r=>r.urgent)
  const support = res.map((r,i)=>({...r,_idx:i})).filter(r=>!r.urgent)



  const ResRow = ({r, size='large'}) => {
    const idx = r._idx
    return (
      <div style={{padding:size==='large'?'16px 0':'12px 0',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <a href={r.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
            <div style={{fontWeight:600,fontSize:size==='large'?14:13,color:A,fontFamily:"'Nunito Sans',sans-serif",display:'inline-flex',alignItems:'center',gap:5}}>
              {r.n} {r.url&&<ExternalLink size={11}/>}
            </div>
          </a>
          <p className="label" style={{margin:'5px 0'}}>{r.t}</p>
          {size==='large'&&<p className="serif" style={{fontSize:22,color:A,fontWeight:700}}>{r.p}</p>}
          {size==='small'&&<p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>{r.p}</p>}
        </div>
      </div>
    )
  }

  return(
    <div className="fade-up" style={{width:'100%'}}>
      <div style={{borderBottom:`1px solid ${BD}`,paddingBottom:20,marginBottom:24}}>
        <div>
          <p className="label" style={{marginBottom:10,color:A}}>If you are in danger, call now</p>
          <h1 className="serif" style={{fontSize:36,fontWeight:700,color:TXT}}>Help is available. You are not alone.</h1>
          <p style={{fontSize:13,color:MUT,marginTop:8,fontFamily:"'Nunito Sans',sans-serif",fontWeight:300}}>
            {res.length} organisations
            </p>
          </div>
      </div>

      <div style={{background:'#BC9EAE',border:`1px solid ${BD}`,padding:'20px 26px',marginBottom:2,display:'flex',alignItems:'center',gap:18}}>
        <AlertTriangle size={24} color={A}/>
        <div>
          <div style={{fontWeight:600,fontSize:16,color:TXT,fontFamily:"'Nunito Sans',sans-serif"}}>Emergency? Call 999 or 112 immediately.</div>
          <p style={{fontSize:12,color:MUT,marginTop:4,fontFamily:"'Nunito Sans',sans-serif"}}>DCI Gender Desk: 0800 722 203 · Available 24 hours</p>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:2,marginTop:2}}>
        <div className="card" style={{padding:24}}>
          <div className="section-head"><span>Emergency lines</span><span style={{color:A}}>24/7</span></div>
          {urgent.map((r,i)=><ResRow key={i} r={r} size="large"/>)}
        </div>
        <div className="card" style={{padding:24}}>
          <div className="section-head"><span>CSO, legal & data support</span></div>
          {support.map((r,i)=><ResRow key={i} r={r} size="small"/>)}
        </div>
      </div>

      <div style={{marginTop:2}}>
        <div style={{borderTop:`1px solid ${BD}`,paddingTop:24,marginTop:2,marginBottom:2}}>
          <p className="label" style={{marginBottom:8}}>Safety guides & referral pathways</p>
          <h2 className="serif" style={{fontSize:28,fontWeight:700,color:TXT,lineHeight:1.3}}>
            Know your rights. Know what to do.<br/>
            <em style={{color:A,fontWeight:400}}>Step by step.</em>
          </h2>
        </div>

        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:2,marginBottom:2}}>
          <div style={{background:'#B89AAA',border:'1px solid #A07888',padding:24}}>
            <div style={{marginBottom:16}}>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,letterSpacing:'.12em',color:'#8A1030',textTransform:'uppercase',fontWeight:700,marginBottom:6}}>Referral pathway · Step by step</p>
              <div style={{fontFamily:"'Lora',serif",fontSize:18,fontWeight:700,color:'#180410',borderBottom:'2px solid #8A1030',paddingBottom:10}}>How to report an incident</div>
            </div>
            {[
              {n:'1',title:'Ensure immediate safety first',    body:'If in danger, leave the location. Go to a neighbour, public place, or call 999/112. Do not confront the perpetrator alone.'},
              {n:'2',title:'Go to the nearest police station', body:'Report at the Gender Desk. You have the right to be attended to immediately. If turned away, ask for the OCS (Officer in Charge of Station).'},
              {n:'3',title:'Obtain and fill a P3 Form',        body:'The P3 is a police medical form required to document injuries. Request it at the station — it is free of charge. Take it to a government hospital for examination.'},
              {n:'4',title:'Visit a government hospital',      body:'A medical officer fills the P3 form documenting injuries. This is critical evidence in court. Go within 72 hours of the incident — the sooner the better.'},
              {n:'5',title:'File an official statement',       body:'Return the completed P3 to the police. Ensure you receive a copy of your OB (Occurrence Book) number. This is your case reference — keep it safe.'},
              {n:'6',title:'Follow up regularly',              body:'Cases stall when survivors stop following up. Visit the station every 2 weeks. Note the name and badge number of your investigating officer.'},
            ].map((s,i)=>(
              <div key={i} style={{display:'flex',gap:14,paddingBottom:14,marginBottom:14,borderBottom:i<5?`1px solid ${BD}`:'none'}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:A,color:'#F0D0D8',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,flexShrink:0,marginTop:2}}>{s.n}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:TXT,fontFamily:"'Nunito Sans',sans-serif",marginBottom:4}}>{s.title}</div>
                  <p style={{fontSize:12,color:'#2A0818',lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:2}}>
            <div style={{background:'#B89AAA',border:'1px solid #A07888',padding:24}}>
              <div style={{marginBottom:16}}>
                <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,letterSpacing:'.12em',color:'#8A1030',textTransform:'uppercase',fontWeight:700,marginBottom:6}}>Legal tool · Know your rights</p>
                <div style={{fontFamily:"'Lora',serif",fontSize:18,fontWeight:700,color:'#180410',borderBottom:'2px solid #8A1030',paddingBottom:10}}>The P3 Form — what you need to know</div>
              </div>
              {[
                {q:'What is a P3 Form?',  a:'A Police Medical Form used to document physical injuries in cases of assault, GBV or attempted murder. It is legally admissible evidence in Kenyan courts.'},
                {q:'Where do I get it?',  a:'From any police station in Kenya. It is free. You do not need money to obtain one. If asked to pay, report it to the IPOA (Independent Policing Oversight Authority).'},
                {q:'Who fills it?',       a:'A medical officer at a government hospital (or approved facility) completes the medical section. The police complete the other sections.'},
                {q:'How long do I have?', a:'Injuries heal and forensic evidence degrades. Go within 72 hours. Courts can accept late P3s but early documentation is far stronger evidence.'},
                {q:'What if I am refused?',a:'You have a legal right to a P3. Contact FIDA Kenya (020 387 1231), Kituo Cha Sheria (0800 720 434) or COVAW (020 273 8881) immediately.'},
              ].map((item,i,arr)=>(
                <div key={i} style={{paddingBottom:12,marginBottom:12,borderBottom:i<arr.length-1?`1px solid ${BD}`:'none'}}>
                  <div style={{fontWeight:700,fontSize:12,color:A,fontFamily:"'Nunito Sans',sans-serif",marginBottom:3}}>{item.q}</div>
                  <p style={{fontSize:12,color:'#2A0818',lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{item.a}</p>
                </div>
              ))}
            </div>

            <div style={{background:'#B89AAA',border:'1px solid #A07888',padding:24}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:10,borderBottom:'1px solid #A07888',marginBottom:14,fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:'#5A3050',letterSpacing:'.06em'}}>
                <span>Preserving material evidence</span>
                <span style={{color:'#8A1030',fontWeight:700}}>Critical</span>
              </div>
              {[
                {icon:'📱',tip:'Screenshot all threatening messages, calls, social media posts. Back them up to email or cloud immediately.'},
                {icon:'👕',tip:'Do not wash clothing worn during an incident. Place in a paper bag (not plastic) and hand to police or hospital.'},
                {icon:'📸',tip:'Photograph injuries immediately — with timestamps on. Use a trusted friend as witness if possible.'},
                {icon:'🏠',tip:'Do not clean the scene. If possible, lock the area until police arrive to document it.'},
                {icon:'✍️',tip:'Write down everything you remember — time, sequence, exact words used — while memory is fresh.'},
                {icon:'👥',tip:'Identify any witnesses. Get their names and contacts before they leave the scene.'},
              ].map((e,i)=>(
                <div key={i} style={{display:'flex',gap:10,paddingBottom:10,marginBottom:10,borderBottom:i<5?`1px solid ${BD}`:'none',alignItems:'flex-start'}}>
                  <span style={{fontSize:16,flexShrink:0}}>{e.icon}</span>
                  <p style={{fontSize:12,color:'#2A0818',lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{e.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr 1fr',gap:2,marginBottom:2}}>
          <div className="card" style={{padding:24}}>
            <div style={{marginBottom:16}}>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,letterSpacing:'.12em',color:'#8A1030',textTransform:'uppercase',fontWeight:700,marginBottom:6}}>Safety protocol</p>
              <div style={{fontFamily:"'Lora',serif",fontSize:18,fontWeight:700,color:'#180410',borderBottom:'2px solid #8A1030',paddingBottom:10,marginBottom:2}}>Meeting someone for the first time</div>
            </div>
            {[
              'Always meet in a public place — café, mall, busy street. Never a private residence or Airbnb first.',
              'Tell a trusted person where you are going, who you are meeting and when you expect to be back.',
              'Share your live location with someone you trust before the meeting.',
              'Arrange your own transport. Do not depend on the person you are meeting to get home.',
              'Keep your phone charged and accessible at all times.',
              'If anything feels wrong — leave. You do not owe anyone an explanation.',
              'Run their name, phone number or social media handle through available safety databases before meeting.',
            ].map((tip,i)=>(
              <div key={i} style={{display:'flex',gap:10,paddingBottom:10,marginBottom:10,borderBottom:i<6?`1px solid ${BD}`:'none'}}>
                <span style={{color:A,fontWeight:700,fontFamily:"'Nunito Sans',sans-serif",fontSize:13,flexShrink:0}}>{i+1}.</span>
                <p style={{fontSize:12,color:'#2A0818',lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{tip}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{padding:24}}>
            <div style={{marginBottom:16}}>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,letterSpacing:'.12em',color:'#8A1030',textTransform:'uppercase',fontWeight:700,marginBottom:6}}>Engagement safety</p>
              <div style={{fontFamily:"'Lora',serif",fontSize:18,fontWeight:700,color:'#180410',borderBottom:'2px solid #8A1030',paddingBottom:10,marginBottom:2}}>Communication & engagement protocols</div>
            </div>
            {[
              {t:'Online dating safety',      b:'Use platforms with verified profiles. Never share your home address, workplace or daily routine early in a relationship.'},
              {t:'Red flags in messaging',    b:'Excessive urgency, pressure for money, requests for intimate images, isolation from family/friends — these are warning signs.'},
              {t:'Protect your location',     b:'Turn off location metadata on photos before sending. Use messaging apps that do not expose your IP address.'},
              {t:'Financial independence',    b:'Never allow a new partner access to your finances, accounts or property. Financial control is a key precursor to violence.'},
              {t:'Trust your instincts',      b:'If a person makes you feel unsafe, uncomfortable or controlled — that feeling is valid data. Act on it.'},
              {t:'Document patterns',         b:'Screenshot controlling behaviour, threats or manipulation. Patterns matter in court, not just single incidents.'},
            ].map((item,i,arr)=>(
              <div key={i} style={{paddingBottom:12,marginBottom:12,borderBottom:i<arr.length-1?`1px solid ${BD}`:'none'}}>
                <div style={{fontWeight:700,fontSize:12,color:A,fontFamily:"'Nunito Sans',sans-serif",marginBottom:3}}>{item.t}</div>
                <p style={{fontSize:12,color:'#2A0818',lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{item.b}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{padding:24}}>
            <div style={{marginBottom:16}}>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,letterSpacing:'.12em',color:'#8A1030',textTransform:'uppercase',fontWeight:700,marginBottom:6}}>Expert voices</p>
              <div style={{fontFamily:"'Lora',serif",fontSize:18,fontWeight:700,color:'#180410',borderBottom:'2px solid #8A1030',paddingBottom:10,marginBottom:2}}>Survival tips from professionals</div>
            </div>
            {[
              {src:'GVRC Kenya',      tip:'"Document everything. A medical report, a screenshot, a witness name — each one is a brick in your case. Build it from day one."'},
              {src:'Kituo Cha Sheria',tip:'"You do not need money to access justice. Legal aid is your right. Do not let anyone tell you otherwise."'},
              {src:'FIDA Kenya',      tip:'"Report even when you are not ready to prosecute. A recorded complaint creates a paper trail that protects you later."'},
              {src:'Usikimye',        tip:'"Reach out. The silence protects the abuser, not you. Over 150 women call our helpline every day — you will not be judged."'},
              {src:'COVAW',           tip:'"Court delays are real but not permanent. Cases with strong early evidence — P3, photos, messages — move faster and result in convictions."'},
            ].map((item,i,arr)=>(
              <div key={i} style={{paddingBottom:14,marginBottom:14,borderBottom:i<arr.length-1?`1px solid ${BD}`:'none'}}>
                <div className="pullquote" style={{marginTop:0,padding:'12px 16px'}}>
                  <p className="serif" style={{fontSize:12,fontStyle:'italic',color:TXT,lineHeight:1.8}}>{item.tip}</p>
                  <p style={{fontSize:10,color:MUT,marginTop:6,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.06em',textTransform:'uppercase'}}>{item.src}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{padding:24}}>
          <div className="section-head">
            <span>Survivor voices & expert testimonials</span>
            <span style={{fontSize:11,color:MUT}}>Opens on YouTube</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)',gap:2}}>
            {[
              {title:'France 24 · The 51%: Confronting femicide in Kenya',       year:'2025',url:'https://www.youtube.com/watch?v=sdE-bO9vNrA', desc:'Feminist & security professor Awino Okech on the systemic roots of femicide in Kenya.'},
              {title:'Al Jazeera: Femicide in Kenya exposes a dark reality',      year:'2026',url:'https://www.youtube.com/watch?v=CD27I4tK0fg', desc:'Investigative report on patterns of femicide and the failure of state response.'},
              {title:'Voice of the Global South: Protests erupt over femicides', year:'2024',url:'https://www.youtube.com/watch?v=t9fB5Wm3e7s', desc:'Coverage of the January 2024 #TotalShutdownKE marches — 10,000 women in the streets.'},
            ].map((v,i)=>(
              <a key={i} href={v.url} target="_blank" rel="noopener noreferrer"
                style={{textDecoration:'none',display:'block',background:'#BC9EAE',border:`1px solid ${BD}`,padding:18}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <div style={{width:36,height:36,background:A,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{color:'#F0D0D8',fontSize:14}}>▶</span>
                  </div>
                  <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT,letterSpacing:'.06em'}}>{v.year}</span>
                </div>
                <div style={{fontWeight:600,fontSize:13,color:TXT,lineHeight:1.4,marginBottom:6,fontFamily:"'Nunito Sans',sans-serif"}}>{v.title}</div>
                <p style={{fontSize:11,color:MUT,lineHeight:1.6,fontFamily:"'Nunito Sans',sans-serif"}}>{v.desc}</p>
                <div style={{marginTop:10,display:'inline-flex',alignItems:'center',gap:4,color:A,fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:600}}>Watch <ExternalLink size={10}/></div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── INVITE GATE ───────────────────────────────────────────────────────────────
function InviteGate({ children }) {
  const stored = sessionStorage.getItem('femsaidia_access')
  const [unlocked, setUnlocked] = useState(!!stored)
  const [code,     setCode]     = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const tryCode = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    const { data } = await _sb
      .from('invite_codes')
      .select('id, uses_limit, uses_count, expires_at')
      .eq('code', code.trim().toLowerCase())
      .eq('active', true)
      .single()

    if (!data) {
      setError('Invalid access code. Please check your invitation.')
      setCode(''); setLoading(false); return
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setError('This access code has expired.')
      setCode(''); setLoading(false); return
    }
    if (data.uses_limit && data.uses_count >= data.uses_limit) {
      setError('This access code has reached its usage limit.')
      setCode(''); setLoading(false); return
    }
    await _sb.from('invite_codes').update({ uses_count: (data.uses_count||0)+1 }).eq('id', data.id)
    sessionStorage.setItem('femsaidia_access', '1')
    setUnlocked(true)
    setLoading(false)
  }

  if (unlocked) return children

  return (
    <div style={{minHeight:'100vh',background:'#D4BEC4',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Nunito Sans',sans-serif"}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontFamily:"'Lora',serif",fontSize:32,fontWeight:700,color:'#180410'}}>
            Fem<span style={{color:'#8A1030'}}>Saidia</span> Kenya
          </div>
          <p style={{fontSize:12,color:'#7A4A60',marginTop:6,letterSpacing:'.08em',fontFamily:"'Lora',serif",fontStyle:'italic'}}>
            A Woman is Killed Every 47 Hours in Kenya
          </p>
        </div>
        <div style={{background:'#C4AABB',border:'1px solid #B89AAA',padding:28}}>
          <div style={{fontFamily:"'Lora',serif",fontSize:18,fontWeight:700,color:'#180410',marginBottom:8}}>Preview access</div>
          <p style={{fontSize:12,color:'#7A4A60',lineHeight:1.7,marginBottom:20}}>
            FemSaidia Kenya is currently in preview. Enter your access code to continue.
          </p>
          <input
            value={code}
            onChange={e=>setCode(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&tryCode()}
            placeholder="Enter access code"
            style={{width:'100%',fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:'#180410',background:'#DDD0D0',border:'1px solid #B89AAA',padding:'10px 12px',outline:'none',marginBottom:10}}
          />
          {error&&<p style={{fontSize:11,color:'#8A1030',marginBottom:10,fontFamily:"'Nunito Sans',sans-serif"}}>{error}</p>}
          <button onClick={tryCode} disabled={loading}
            style={{width:'100%',fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,padding:'11px',background:loading?'#7A4A60':'#8A1030',color:'#F0D0D8',border:'none',cursor:loading?'wait':'pointer',letterSpacing:'.04em'}}>
            {loading?'Checking...':'Access platform →'}
          </button>
        </div>
        <p style={{fontSize:11,color:'#7A4A60',textAlign:'center',marginTop:16,fontFamily:"'Nunito Sans',sans-serif"}}>
          To request access contact admin@femsaidiakenya.org
        </p>
      </div>
    </div>
  )
}

// ── MOBILE SUB-TAB BAR ────────────────────────────────────────────────────────
// Shown below the mobile header when the active group has more than one tab.
function SubTabBar({ group, activeTab, onTabChange }) {
  return (
    <div style={{
      position:'sticky',
      top:0,
      zIndex:100,
      background:HDR,
      borderBottom:`1px solid ${BD}`,
      display:'flex',
      overflowX:'auto',
      padding:'0 8px',
      WebkitOverflowScrolling:'touch',
      scrollbarWidth:'none',
      msOverflowStyle:'none',
    }}>
      {group.tabs.map(tabId => {
        const tabDef  = TABS.find(t => t.id === tabId)
        const isActive = activeTab === tabId
        const isRed    = tabDef?.red
        return (
          <button
            key={tabId}
            onClick={() => onTabChange(tabId)}
            disabled={!!tabDef?.locked}
            style={{
              fontFamily:"'Nunito Sans',sans-serif",
              fontSize:12,
              fontWeight: isActive ? 700 : 500,
              padding:'8px 9px',
              border:'none',
              borderBottom:`2px solid ${isActive ? A : 'transparent'}`,
              background:'transparent',
              color: isActive ? A : isRed ? '#8A1030' : MUT,
              cursor: tabDef?.locked ? 'default' : 'pointer',
              whiteSpace:'nowrap',
              letterSpacing:'.03em',
              flexShrink:0,
              opacity: tabDef?.locked ? 0.45 : 1,
              transition:'color .15s, border-color .15s',
            }}>
            {tabId === 'redflag'
              ? <span><span style={{color:'#CC1010',fontWeight:800}}>Red</span> Flag</span>
              : (TAB_SHORT[tabId] || tabDef?.label)
            }
          </button>
        )
      })}
    </div>
  )
}

// ── MOBILE BOTTOM NAV ─────────────────────────────────────────────────────────
function BottomNav({ groups, activeGroup, onGroupTap }) {
  return (
    <nav style={{
      position:'fixed',
      bottom:0,
      left:0,
      right:0,
      zIndex:200,
      background:HDR,
      borderTop:`2px solid ${BD}`,
      display:'flex',
      paddingBottom:'env(safe-area-inset-bottom, 4px)',
    }}>
      {groups.map(g => {
        const isActive = activeGroup === g.id
        const isUrgent = g.id === 'safety' || g.id === 'act'
        const clr      = isActive ? A : isUrgent ? '#8A3040' : MUT
        return (
          <button
            key={g.id}
            onClick={() => onGroupTap(g)}
            style={{
              flex:1,
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              gap:3,
              padding:'8px 2px 6px',
              border:'none',
              background:'transparent',
              cursor:'pointer',
              position:'relative',
              WebkitTapHighlightColor:'transparent',
            }}>
            {/* Active indicator line at top */}
            {isActive && (
              <span style={{
                position:'absolute',
                top:0,
                left:'50%',
                transform:'translateX(-50%)',
                width:28,
                height:2,
                background:A,
                borderRadius:'0 0 2px 2px',
              }}/>
            )}
            <span style={{color:clr,display:'flex',lineHeight:1}}>{g.icon}</span>
            <span style={{
              fontFamily:"'Nunito Sans',sans-serif",
              fontSize:10,
              fontWeight: isActive ? 700 : 500,
              color:clr,
              letterSpacing:'.03em',
              lineHeight:1,
            }}>
              {g.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem('femsaidia_tab') || 'dashboard' } catch { return 'dashboard' }
  })
  // Persist active tab so PWA restores position on reload
  useEffect(() => {
    try { localStorage.setItem('femsaidia_tab', activeTab) } catch {}
    window.scrollTo({ top:0, behavior:'instant' })
  }, [activeTab])

  // Responsive breakpoint — recalculates on resize
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  useEffect(() => {
    const mq      = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = e => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Derive active group from the active tab
  const activeGroup  = NAV_GROUPS.find(g => g.tabs.includes(activeTab))?.id || 'home'
  const currentGroup = NAV_GROUPS.find(g => g.id === activeGroup)
  const showSubBar   = isMobile && currentGroup && currentGroup.tabs.length > 1

  // Bottom-nav tap: if already in this group keep current sub-tab,
  // otherwise jump to the group's first tab.
  const handleGroupTap = (group) => {
    if (!group.tabs.includes(activeTab)) {
      setActiveTab(group.tabs[0])
    }
  }

  return (
    <InviteGate>
      <div style={{fontFamily:"'Nunito Sans',sans-serif",color:TXT,minHeight:'100vh',background:BG,width:'100%'}}>

        {/* ── ALERT BANNER ── */}
        <div style={{background:A,color:'#F0D0D8',padding:'7px 32px',display:'flex',alignItems:'center',gap:12,fontSize:11,fontFamily:"'Nunito Sans',sans-serif",width:'100%'}}>
          <span className="pulse" style={{display:'inline-block'}}>●</span>
          <span style={{flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            FemSaidia Kenya — femicide is a national emergency. Share this platform. Submit verified incidents.
          </span>
          <span style={{marginLeft:'auto',opacity:.7,flexShrink:0}}>femsaidiakenya.org</span>
        </div>

        {/* ── DESKTOP HEADER + NAV (≥768 px) — 100% unchanged ── */}
        {!isMobile && (
          <header style={{background:HDR,borderBottom:`1px solid ${BD}`,padding:'0 32px',width:'100%'}}>
            <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',padding:'28px 0 20px',borderBottom:`1px solid ${BD}`}}>
              <div>
                <div className="serif" style={{fontSize:56,fontWeight:700,color:TXT,letterSpacing:'-.02em',lineHeight:1}}>
                  Fem<span style={{color:A}}>Saidia</span> Kenya
                </div>
                <p style={{fontSize:11,color:MUT,marginTop:8,fontFamily:"'Lora',serif",fontStyle:'italic',fontWeight:400,letterSpacing:'.01em'}}>
                  A Woman is Killed Every 47 Hours in Kenya
                </p>
              </div>
              <div style={{textAlign:'right',paddingBottom:4}}>
                <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>Last updated</p>
                <p style={{fontSize:12,color:'#5A3050',fontFamily:"'Nunito Sans',sans-serif",marginTop:2}}>04 May 2026 · 08:00 EAT</p>
              </div>
            </div>
            <nav style={{display:'flex',overflowX:'auto'}}>
              {TABS.map(t=>(
                <button
                  key={t.id}
                  className={`nav-tab${activeTab===t.id?' active':''}`}
                  disabled={t.locked===true}
                  onClick={()=>!t.locked&&setActiveTab(t.id)}
                  style={t.red&&activeTab!==t.id?{color:'#8A1030',fontWeight:700}:{}}>
                  {t.locked&&<Lock size={10}/>}
                  {t.id==='redflag'
                    ? <span><span style={{color:'#CC1010',fontWeight:800}}>Red</span> Flag</span>
                    : t.label}
                  {t.locked&&<span style={{fontSize:10,opacity:.5}}>· soon</span>}
                </button>
              ))}
            </nav>
          </header>
        )}

        {/* ── MOBILE HEADER (<768 px) ── */}
        {isMobile && (
          <header style={{
            background:HDR,
            borderBottom:`1px solid ${BD}`,
            padding:'12px 16px',
            display:'flex',
            alignItems:'center',
            justifyContent:'space-between',
          }}>
            <div className="serif" style={{fontSize:26,fontWeight:700,color:TXT,letterSpacing:'-.02em',lineHeight:1}}>
              Fem<span style={{color:A}}>Saidia</span> Kenya
            </div>
            <p style={{fontSize:10,color:MUT,fontFamily:"'Lora',serif",fontStyle:'italic',maxWidth:140,textAlign:'right',lineHeight:1.3}}>
              A Woman is Killed<br/>Every 47 Hours
            </p>
          </header>
        )}

        {/* ── MOBILE SUB-TAB BAR ── */}
        {showSubBar && (
          <SubTabBar group={currentGroup} activeTab={activeTab} onTabChange={setActiveTab}/>
        )}

        {/* ── MAIN CONTENT ── */}
        <main style={{
          padding:       isMobile ? '16px 12px' : '28px 32px',
          paddingBottom: isMobile
            ? 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)'
            : '28px',
          width:'100%',
        }}>
          {activeTab==='dashboard'       && <DashboardTab isMobile={isMobile}/>}
          {activeTab==='data'            && <DataTab/>}
          {activeTab==='silencing-women' && <SilencingWomenTab/>}
          {activeTab==='resources'       && <ResourcesTab key='resources'/>}
          {activeTab==='survival'        && <SurvivalGuideTab/>}
          {activeTab==='redflag'         && <RedFlagTab/>}
          {activeTab==='petition'        && <PetitionTab/>}
          {activeTab==='report'          && <ReportTab/>}
          {activeTab==='partners'        && <PartnersTab/>}
          {activeTab==='sentiment'       && <SocialsSentimentTab/>}
          {activeTab==='tech-tracker'    && <TechTrackerTab/>}
          {activeTab==='cases'           && <CaseTrackerTab/>}
        </main>

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop:`1px solid ${BD}`,
          padding: isMobile ? '14px 16px' : '18px 32px',
          display:'flex',justifyContent:'space-between',alignItems:'center',
          flexWrap:'wrap',gap:8,
          background:HDR,width:'100%',
        }}>
          <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>FemSaidia Kenya · femsaidiakenya.org · 2026</p>
          <p className="serif" style={{fontSize:12,color:MUT,fontStyle:'italic'}}>Built for justice · in memory of those we lost</p>
        </footer>

        {/* ── MOBILE BOTTOM NAV ── */}
        {isMobile && (
          <BottomNav groups={NAV_GROUPS} activeGroup={activeGroup} onGroupTap={handleGroupTap}/>
        )}

      </div>
    </InviteGate>
  )
}
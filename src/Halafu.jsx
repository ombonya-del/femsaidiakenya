import { useState } from 'react'
import { ExternalLink, ArrowRight, Users, Zap, Search, ChevronDown, ChevronUp } from 'lucide-react'

const A   = '#8A1030'
const BD  = '#B89AAA'
const BG  = '#D4BEC4'
const CRD = '#C4AABB'
const TXT = '#180410'
const MUT = '#7A4A60'
const HDR = '#C8AFBA'

const STATUS_STYLES = {
  'Idea':           { bg:'#E8D8C0', tc:'#5A4010', dot:'#CA8A04' },
  'In development': { bg:'#C8D8E8', tc:'#102040', dot:'#2563EB' },
  'Active':         { bg:'#C8D8C0', tc:'#1A4810', dot:'#16A34A' },
  'Scaling':        { bg:'#D0C8E8', tc:'#180830', dot:'#7C3AED' },
}

const LANE_STYLES = {
  'Understand': { bg:'#1A0830', border:'#3A1850', label:'🔍 Understand', desc:'What is turning boys into men who harm?' },
  'Interrupt':  { bg:'#0A2010', border:'#1A4020', label:'⚡ Interrupt',  desc:'Where can we intervene before harm happens?' },
  'Build':      { bg:'#200818', border:'#401828', label:'🔨 Build',       desc:'What do we create to prevent the next death?' },
}

const PROJECTS = [
  // ── UNDERSTAND ──────────────────────────────────────────────────────────────
  {
    id:'p1', lane:'Understand',
    title:'The Misogyny Pipeline in Kenya',
    tagline:'Mapping how online hate speech becomes offline violence',
    problem:'We know manosphere content is reaching Kenyan boys and young men through TikTok, YouTube and Telegram. We do not know the specific pathways, the most dangerous content creators, or the age at which the radicalisation typically begins.',
    what:'A structured research project that maps the journey from algorithm-served misogynistic content to real-world attitudes and behaviour. Interviews with young men, content analysis, platform audits.',
    who:['University researchers', 'Digital rights organisations', 'Tech platforms (TikTok, Google)', 'Youth workers', 'Schools'],
    tech:'Social media monitoring tools, NLP sentiment analysis, content flagging APIs',
    status:'Idea',
    join:'research@femsaidiakenya.org',
  },
  {
    id:'p2', lane:'Understand',
    title:'The Economics of Male Violence',
    tagline:'What is the relationship between unemployment, debt and femicide in Kenya?',
    problem:'Anecdotal evidence strongly suggests that financial stress — job loss, gambling debt, hustle culture failure — is a significant trigger in intimate partner violence escalations. There is no systematic Kenyan data on this.',
    what:'A community-level study correlating economic indicators (unemployment, mobile loan defaults, betting activity) with GBV incident reports across 10 counties. Build a predictive risk model.',
    who:['KNBS', 'County governments', 'Mobile money providers', 'NGEC', 'Economists', 'Community health workers'],
    tech:'Data integration APIs, predictive modelling, county-level dashboards',
    status:'Idea',
    join:'research@femsaidiakenya.org',
  },
  {
    id:'p3', lane:'Understand',
    title:'Boys Who Witnessed It',
    tagline:'Understanding intergenerational transmission of violence',
    problem:'A significant proportion of men who kill women grew up watching their mothers be beaten. The link between childhood exposure to domestic violence and adult perpetration is well-documented globally — but not systematically studied in Kenya.',
    what:'Oral history project collecting testimonies from men in perpetrator intervention programmes about their childhood experiences. Build a trauma map that informs early intervention design.',
    who:['Prison Fellowship Kenya', 'Probation officers', 'Mental health professionals', 'CSOs working with perpetrators', 'Survivors\' families'],
    tech:'Secure testimony collection platform, anonymisation tools, thematic analysis AI',
    status:'Idea',
    join:'research@femsaidiakenya.org',
  },

  // ── INTERRUPT ───────────────────────────────────────────────────────────────
  {
    id:'p4', lane:'Interrupt',
    title:'Counter-Narrative Content Lab',
    tagline:'Kenyan creators making alternative masculinity content at scale',
    problem:'The misogyny pipeline wins because it is entertaining, relatable and algorithmically amplified. Counter-content is usually preachy, poorly produced and funded by NGOs who do not understand how young men consume media.',
    what:'A funded content lab that recruits 20 Kenyan male creators (YouTubers, TikTokers, podcasters) who already have audiences, and supports them to make compelling content about healthy masculinity — in Sheng, in formats young men actually watch.',
    who:['Content creators', 'Media companies', 'Corporate sponsors', 'Schools', 'Youth organisations', 'Mental health professionals as advisors'],
    tech:'Content analytics, A/B testing for reach and retention, platform partnership APIs',
    status:'In development',
    join:'halafu@femsaidiakenya.org',
  },
  {
    id:'p5', lane:'Interrupt',
    title:'The 10-16 Curriculum',
    tagline:'Reaching boys before the pipeline does',
    problem:'By the time most intervention programmes reach men, the attitudes are already formed. The window is 10–16 — before social media algorithms have fully shaped their understanding of gender, power and relationships.',
    what:'A school-based programme co-designed with girls that teaches boys about consent, emotional regulation, online misogyny recognition and bystander action. Piloted in 20 schools across 5 counties.',
    who:['Ministry of Education', 'Teachers', 'School counsellors', 'Girls\' organisations', 'Parents', 'County governments'],
    tech:'Interactive learning app, teacher training platform, impact measurement dashboard',
    status:'Idea',
    join:'halafu@femsaidiakenya.org',
  },
  {
    id:'p6', lane:'Interrupt',
    title:'Salmin for Men',
    tagline:'A crisis line for men in danger of becoming dangerous',
    problem:'There is no safe space for a man in Kenya to call and say "I am losing control and I am scared of what I might do." Every crisis line is for victims. But some perpetrators are also men in crisis — and catching them before the act is prevention.',
    what:'A USSD-based anonymous crisis line specifically for men experiencing rage, suicidal ideation, relationship breakdown, or impulse control crises. Routes to counsellors trained in perpetrator intervention.',
    who:['Mental health professionals', 'Telcos', 'Men\'s health organisations', 'GBV counsellors', 'Crisis counsellors'],
    tech:'USSD platform (same infrastructure as Salmin *384*89056#), AI triage, counsellor matching',
    status:'Idea',
    join:'halafu@femsaidiakenya.org',
  },
  {
    id:'p7', lane:'Interrupt',
    title:'The Baraza Network',
    tagline:'Activating community men as femicide prevention infrastructure',
    problem:'Most prevention work talks at men through campaigns. The most effective interventions use respected men within communities to hold other men accountable. Kenya has a tradition of community accountability structures — the baraza — that has never been activated for GBV prevention.',
    what:'A network of trained community men (elders, coaches, religious leaders, boda boda leaders) who serve as first-response mediators, early warning systems, and accountability holders in their communities.',
    who:['Community leaders', 'County governments', 'Chiefs and assistant chiefs', 'Religious leaders', 'Sports coaches', 'Boda boda saccos'],
    tech:'WhatsApp coordination platform, incident reporting tool, community mapping dashboard',
    status:'In development',
    join:'halafu@femsaidiakenya.org',
  },

  // ── BUILD ────────────────────────────────────────────────────────────────────
  {
    id:'p8', lane:'Build',
    title:'Fathers & Daughters Initiative',
    tagline:'The most powerful masculinity intervention is a present father',
    problem:'Absent and emotionally unavailable fathers are a significant factor in both male violence and female vulnerability. Boys without fathers are disproportionately represented in violent crime. Girls without fathers are disproportionately targeted by older predatory men.',
    what:'A community programme that rebuilds father-child relationships through structured activities, counselling and peer support. Specifically targets fathers of girls aged 8–16, and boys aged 8–16 without fathers.',
    who:['Family counsellors', 'Schools', 'Religious organisations', 'Corporates (CSR)', 'County social services'],
    tech:'Family engagement app, progress tracking, peer support network platform',
    status:'Idea',
    join:'halafu@femsaidiakenya.org',
  },
  {
    id:'p9', lane:'Build',
    title:'KaaRada Perpetrator Intervention Programme',
    tagline:'Not just a registry — a rehabilitation pathway',
    problem:'KaaRada documents convicted perpetrators. But conviction without behaviour change means released men re-offend. Kenya has no structured post-conviction GBV behaviour change programme.',
    what:'A structured 6-month behaviour change programme for men convicted of GBV offences, delivered in partnership with the Kenya Prisons Service. Completion reduces sentence. Non-completion is flagged on KaaRada.',
    who:['Kenya Prisons Service', 'Ministry of Justice', 'Mental health professionals', 'Survivor organisations', 'Probation officers'],
    tech:'Programme tracking platform, recidivism monitoring, integration with KaaRada registry',
    status:'Idea',
    join:'halafu@femsaidiakenya.org',
  },
  {
    id:'p10', lane:'Build',
    title:'FemSaidia Intelligence Brief',
    tagline:'Monthly evidence brief for policymakers who need to act, not just know',
    problem:'Government departments and donors have access to data but not to actionable intelligence. The gap between knowing femicide is happening and knowing what specifically to fund, legislate or deploy is where most policy stalls.',
    what:'A monthly 2-page intelligence brief synthesising FemSaidia data, community intelligence and ThinkTank project pipeline — formatted for Cabinet Secretaries, donors and county governors. Delivered by email and WhatsApp.',
    who:['FemSaidia data team', 'Policy analysts', 'County governments', 'National Treasury', 'Bilateral donors', 'UN agencies'],
    tech:'Automated report generation from FemSaidia dashboard, distribution platform, engagement tracking',
    status:'In development',
    join:'halafu@femsaidiakenya.org',
  },
]

function ProjectCard({ p, isMobile }) {
  const [open, setOpen] = useState(false)
  const laneStyle   = LANE_STYLES[p.lane]
  const statusStyle = STATUS_STYLES[p.status]

  return (
    <div style={{ background:CRD, border:`1px solid ${BD}`, overflow:'hidden', marginBottom:2 }}>
      {/* Card header */}
      <div onClick={() => setOpen(o => !o)}
        style={{ padding:'18px 20px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
            <span style={{ fontSize:10, padding:'2px 8px', background:statusStyle.bg, color:statusStyle.tc,
              fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, letterSpacing:'.06em' }}>
              <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:statusStyle.dot, marginRight:4, verticalAlign:'middle' }}/>
              {p.status.toUpperCase()}
            </span>
            <span style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.06em', textTransform:'uppercase' }}>
              {p.lane}
            </span>
          </div>
          <div style={{ fontFamily:"'Lora',serif", fontSize: isMobile?16:18, fontWeight:700, color:TXT, marginBottom:4 }}>{p.title}</div>
          <p style={{ fontSize:12, color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontStyle:'italic' }}>{p.tagline}</p>
        </div>
        {open ? <ChevronUp size={16} color={MUT}/> : <ChevronDown size={16} color={MUT}/>}
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ borderTop:`1px solid ${BD}`, padding:'20px 20px 24px' }}>
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:11, color:A, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:6 }}>The problem</p>
            <p style={{ fontSize:13, color:TXT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.8 }}>{p.problem}</p>
          </div>
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:11, color:A, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:6 }}>What we build</p>
            <p style={{ fontSize:13, color:TXT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.8 }}>{p.what}</p>
          </div>
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:11, color:A, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>Who needs to be in the room</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {p.who.map((w,i) => (
                <span key={i} style={{ fontSize:11, padding:'3px 10px', background:HDR, color:TXT,
                  fontFamily:"'Nunito Sans',sans-serif", fontWeight:600 }}>{w}</span>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:11, color:A, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:6 }}>Tech angle</p>
            <p style={{ fontSize:12, color:MUT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.7 }}>{p.tech}</p>
          </div>
          <a href={`mailto:${p.join}?subject=Halafu? — ${encodeURIComponent(p.title)}`}
            style={{ display:'inline-flex', alignItems:'center', gap:8, background:A, color:'#F0D0D8',
              fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700, padding:'10px 20px',
              textDecoration:'none', letterSpacing:'.04em' }}>
            Join this project <ArrowRight size={13}/>
          </a>
        </div>
      )}
    </div>
  )
}

export default function HalaFuTab({ isMobile }) {
  const [lane, setLane] = useState('all')

  const filtered = lane === 'all' ? PROJECTS : PROJECTS.filter(p => p.lane === lane)
  const counts = {
    all: PROJECTS.length,
    Understand: PROJECTS.filter(p=>p.lane==='Understand').length,
    Interrupt:  PROJECTS.filter(p=>p.lane==='Interrupt').length,
    Build:      PROJECTS.filter(p=>p.lane==='Build').length,
  }

  return (
    <div className="fade-up" style={{ width:'100%' }}>

      {/* ── HEADER ── */}
      <div style={{ borderBottom:`1px solid ${BD}`, paddingBottom:20, marginBottom:2 }}>
        <p className="label" style={{ marginBottom:10, color:A }}>FemSaidia Action Lab · From outrage to architecture</p>
        <h1 className="serif" style={{ fontSize: isMobile?28:36, fontWeight:700, color:TXT }}>
          Halafu<span style={{ color:A }}>?</span>
        </h1>
        <div style={{ marginTop:12, background:'#180410', padding:'16px 20px', borderLeft:`4px solid ${A}` }}>
          <p style={{ fontFamily:"'Lora',serif", fontSize: isMobile?13:15, color:'#D4B0B8', lineHeight:1.8, fontStyle:'italic' }}>
            "Too much admiration of the pink elephant and very little slaying of the dragon."
          </p>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:'#7A4A60', marginTop:8, lineHeight:1.7 }}>
            We have enough data. We have enough reports. We have enough outrage. What Kenya needs now is <strong style={{ color:'#D4B0B8' }}>architecture</strong> — specific, fundable, executable projects that interrupt the pipeline from misogyny to murder. This is where we build them.
          </p>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr 1fr':'repeat(4,1fr)', gap:2, marginBottom:2 }}>
        {[
          { v:PROJECTS.length,                                         l:'Projects in pipeline' },
          { v:PROJECTS.filter(p=>p.status==='In development').length,  l:'In development' },
          { v:PROJECTS.filter(p=>p.status==='Active').length,          l:'Active' },
          { v:[...new Set(PROJECTS.flatMap(p=>p.who))].length,         l:'Stakeholder types needed' },
        ].map((s,i) => (
          <div key={i} style={{ background:CRD, border:`1px solid ${BD}`, padding:'14px 18px', borderLeft:`3px solid ${A}` }}>
            <div style={{ fontFamily:"'Lora',serif", fontSize:32, fontWeight:700, color:A }}>{s.v}</div>
            <p style={{ fontSize:11, color:MUT, marginTop:4, fontFamily:"'Nunito Sans',sans-serif" }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* ── LANE FILTER ── */}
      <div style={{ display:'flex', gap:2, marginBottom:2, flexWrap:'wrap' }}>
        {['all','Understand','Interrupt','Build'].map(l => (
          <button key={l} onClick={() => setLane(l)}
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
              padding:'8px 16px', border:`1px solid ${lane===l?A:BD}`,
              background:lane===l?A:CRD, color:lane===l?'#F0D0D8':MUT,
              cursor:'pointer', letterSpacing:'.04em' }}>
            {l==='all' ? `All projects (${counts.all})` : `${LANE_STYLES[l].label} (${counts[l]})`}
          </button>
        ))}
      </div>

      {/* ── LANE DESCRIPTION ── */}
      {lane !== 'all' && (
        <div style={{ background:LANE_STYLES[lane].bg, border:`1px solid ${LANE_STYLES[lane].border}`,
          padding:'12px 18px', marginBottom:2 }}>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:'#D4B0B8', lineHeight:1.7 }}>
            {LANE_STYLES[lane].desc}
          </p>
        </div>
      )}

      {/* ── PROJECT CARDS ── */}
      <div style={{ marginTop:2 }}>
        {filtered.map(p => <ProjectCard key={p.id} p={p} isMobile={isMobile}/>)}
      </div>

      {/* ── SUBMIT A PROJECT ── */}
      <div style={{ marginTop:16, background:'#180410', border:`1px solid #3A1830`, padding: isMobile?'20px 16px':'24px 28px' }}>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:A, marginBottom:8 }}>
          Have a project idea?
        </p>
        <h3 style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:700, color:'#F0D0D8', marginBottom:8 }}>
          Add it to the pipeline
        </h3>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:'#7A4A60', lineHeight:1.7, marginBottom:16 }}>
          If you have a project idea that addresses the root causes of femicide and GBV in Kenya — whether you are a researcher, technologist, community organiser, policymaker or survivor — we want to hear it.
        </p>
        <a href="mailto:halafu@femsaidiakenya.org?subject=Project idea for Halafu?"
          style={{ display:'inline-flex', alignItems:'center', gap:8, background:A, color:'#F0D0D8',
            fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700, padding:'11px 22px',
            textDecoration:'none', letterSpacing:'.04em' }}>
          Submit a project <ArrowRight size={13}/>
        </a>
      </div>

    </div>
  )
}

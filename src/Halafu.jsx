import { useState } from 'react'
import { ArrowRight, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const _sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

const A   = '#8A1030'
const BD  = '#B89AAA'
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

const DONOR_META = {
  'Reset':                          { url:'https://www.reset.tech/open-calls/',                          area:'Digital Harms & Platform Accountability' },
  'Luminate':                       { url:'https://luminategroup.com/grants',                            area:'Civic Tech & Digital Rights' },
  'Open Society Foundations':       { url:'https://www.opensocietyfoundations.org/grants',               area:'Human Rights & Rule of Law' },
  'Google.org':                     { url:'https://www.google.org/our-work/',                            area:'AI for Social Good & Women\'s Safety' },
  'Ford Foundation':                { url:'https://www.fordfoundation.org/work/our-grants/',             area:'Gender Justice & Feminist Movements' },
  'MacArthur Foundation':           { url:'https://www.macfound.org/programs/',                          area:'Safety & Justice · Digital Technology' },
  'Hewlett Foundation':             { url:'https://hewlett.org/grants/',                                 area:'Gender Equity & Education' },
  'Omidyar Network':                { url:'https://omidyar.com/our-work/',                               area:'Tech + Democracy + Social Change' },
  'CIFF':                           { url:'https://ciff.org/grant-portfolio/',                           area:'Adolescent Health & Child Protection · Africa' },
  'Wellcome Trust':                 { url:'https://wellcome.org/grant-funding',                          area:'Mental Health & Behaviour Change' },
  'Oak Foundation':                 { url:'https://oakfnd.org/programmes/issues-affecting-women/',       area:'Violence Against Women Prevention' },
  'NoVo Foundation':                { url:'https://novofoundation.org/advancing-social-justice/',        area:'Girls\' Rights & Ending Violence' },
  'Sigrid Rausing Trust':           { url:'https://www.sigrid-rausing-trust.org/grants',                 area:'Human Rights Defenders' },
  'The Audacious Project':          { url:'https://audaciousproject.org/apply',                          area:'Bold Systems-Change Ideas at Scale' },
  'Twilio.org':                     { url:'https://www.twilio.org/social-impact/funding',                area:'Communications Tech for Social Impact' },
  'Vodafone Foundation':            { url:'https://www.vodafone.com/vodafone-foundation',                area:'Mobile Tech for Social Good · Africa' },
  'Robert Wood Johnson Foundation': { url:'https://www.rwjf.org/en/grants.html',                        area:'Community Health & Violence Prevention' },
  'MacKenzie Scott':                { url:'https://mackenzie-scott.medium.com/',                         area:'Trust-Based · Feminist Causes · Bold Ideas' },
  'Priscilla Chan / CZI':           { url:'https://chanzuckerberg.com/grants-ventures/',                 area:'Justice & Opportunity · Education' },
  'Laurene Powell Jobs':            { url:'https://emersoncollective.com/',                              area:'Social Change & Community' },
  'Sheryl Sandberg':                { url:'https://leanin.org/',                                         area:'Women\'s Empowerment' },
  'Mo Ibrahim Foundation':          { url:'https://mo.ibrahim.foundation/fellowships-grants',            area:'African Governance & Community Accountability' },
  'Mastercard Foundation':          { url:'https://mastercardfdn.org/apply/',                            area:'Youth & Community Development · Africa' },
  'Skoll Foundation':               { url:'https://skoll.org/about/skoll-foundation/grant-information/', area:'Social Entrepreneurs · Systems Change' },
}

const PROJECTS = [
  {
    id:'p1', lane:'Understand',
    title:'The Misogyny Pipeline in Kenya',
    tagline:'Mapping how online hate speech becomes offline violence',
    problem:'We know manosphere content is reaching Kenyan boys and young men through TikTok, YouTube and Telegram. We do not know the specific pathways, the most dangerous content creators, or the age at which radicalisation typically begins.',
    what:'A structured research project mapping the journey from algorithm-served misogynistic content to real-world attitudes and behaviour. Interviews with young men, content analysis, platform audits.',
    who:['University researchers','Digital rights organisations','Tech platforms (TikTok, Google)','Youth workers','Schools'],
    tech:'Social media monitoring tools, NLP sentiment analysis, content flagging APIs',
    status:'Idea',
    donors:[
      { name:'Reset', why:'Core mandate — countering digital harms and platform accountability. This project is exactly their thesis.' },
      { name:'Luminate', why:'Funds digital rights and civic tech globally. Online misogyny as a civic harm is squarely in their portfolio.' },
      { name:'Open Society Foundations', why:'Funds research exposing human rights abuses including platform-enabled violence.' },
      { name:'Google.org', why:'Direct liability interest — YouTube\'s algorithm is part of the pipeline. AI for social good framing.' },
      { name:'Ford Foundation', why:'Feminist movements and gender justice are core priorities. Systems-change research is their language.' },
    ],
  },
  {
    id:'p2', lane:'Understand',
    title:'The Economics of Male Violence',
    tagline:'What is the relationship between unemployment, debt and femicide in Kenya?',
    problem:'Anecdotal evidence strongly suggests that financial stress — job loss, gambling debt, hustle culture failure — is a significant trigger in intimate partner violence escalations. There is no systematic Kenyan data on this.',
    what:'A community-level study correlating economic indicators (unemployment, mobile loan defaults, betting activity) with GBV incident reports across 10 counties. Build a predictive risk model.',
    who:['KNBS','County governments','Mobile money providers','NGEC','Economists','Community health workers'],
    tech:'Data integration APIs, predictive modelling, county-level dashboards',
    status:'Idea',
    donors:[
      { name:'MacArthur Foundation', why:'Safety & justice and digital technology are twin priorities. A predictive risk model is exactly the systems infrastructure they fund.' },
      { name:'Hewlett Foundation', why:'Gender equity with a strong research and evidence base. Economic drivers of GBV is underexplored.' },
      { name:'Omidyar Network', why:'Tech + social change. A data model mapping economic precarity to violence risk is a classic Omidyar thesis.' },
      { name:'CIFF', why:'Economic drivers of household violence directly impact children\'s safety.' },
      { name:'Wellcome Trust', why:'Financial stress, male mental health and violence are interconnected public health issues.' },
    ],
  },
  {
    id:'p3', lane:'Understand',
    title:'Boys Who Witnessed It',
    tagline:'Understanding intergenerational transmission of violence',
    problem:'A significant proportion of men who kill women grew up watching their mothers be beaten. The link between childhood exposure to domestic violence and adult perpetration is well-documented globally — but not systematically studied in Kenya.',
    what:'Oral history project collecting testimonies from men in perpetrator intervention programmes about their childhood experiences. Build a trauma map that informs early intervention design.',
    who:['Prison Fellowship Kenya','Probation officers','Mental health professionals','CSOs working with perpetrators','Survivors\' families'],
    tech:'Secure testimony collection platform, anonymisation tools, thematic analysis AI',
    status:'Idea',
    donors:[
      { name:'Oak Foundation', why:'Violence against women — intergenerational transmission research is exactly the upstream work they fund.' },
      { name:'NoVo Foundation', why:'Ending violence against women — specifically funds work that breaks cycles, not just responds to them.' },
      { name:'Wellcome Trust', why:'Mental health and trauma research with public health impact.' },
      { name:'CIFF', why:'Children exposed to domestic violence is a core concern. This research directly informs child protection policy.' },
      { name:'Sigrid Rausing Trust', why:'Human rights defenders and documentation of abuse. Testimonial research with policy implications.' },
    ],
  },
  {
    id:'p4', lane:'Interrupt',
    title:'Counter-Narrative Content Lab',
    tagline:'Kenyan creators making alternative masculinity content at scale',
    problem:'The misogyny pipeline wins because it is entertaining, relatable and algorithmically amplified. Counter-content is usually preachy, poorly produced and funded by NGOs who do not understand how young men consume media.',
    what:'A funded content lab recruiting 20 Kenyan male creators (YouTubers, TikTokers, podcasters) who already have audiences, supported to make compelling content about healthy masculinity — in Sheng, in formats young men actually watch.',
    who:['Content creators','Media companies','Corporate sponsors','Schools','Youth organisations','Mental health professionals'],
    tech:'Content analytics, A/B testing for reach and retention, platform partnership APIs',
    status:'In development',
    donors:[
      { name:'The Audacious Project', why:'A content lab reaching millions of Kenyan boys through creators they already follow is exactly the Audacious thesis.' },
      { name:'Reset', why:'Counter-narrative to online misogyny is Reset\'s core mandate. A creator lab that produces algorithmic counter-content is their dream project.' },
      { name:'MacKenzie Scott', why:'Trust-based, rapid funding for feminist causes. A Kenyan-led, creator-driven masculinity project is bold and local — her sweet spot.' },
      { name:'Meta Social Impact', why:'Direct reputational interest in countering misogyny on their platforms.' },
      { name:'Luminate', why:'Counter-narrative content as democratic infrastructure.' },
    ],
  },
  {
    id:'p5', lane:'Interrupt',
    title:'The 10-16 Curriculum',
    tagline:'Reaching boys before the pipeline does',
    problem:'By the time most intervention programmes reach men, the attitudes are already formed. The window is 10–16 — before social media algorithms have fully shaped their understanding of gender, power and relationships.',
    what:'A school-based programme co-designed with girls that teaches boys about consent, emotional regulation, online misogyny recognition and bystander action. Piloted in 20 schools across 5 counties.',
    who:['Ministry of Education','Teachers','School counsellors','Girls\' organisations','Parents','County governments'],
    tech:'Interactive learning app, teacher training platform, impact measurement dashboard',
    status:'Idea',
    donors:[
      { name:'CIFF', why:'Adolescent programming is their primary focus. A curriculum reaching boys 10-16 on gender attitudes is exactly what CIFF funds at scale across Africa.' },
      { name:'The Audacious Project', why:'A curriculum that changes how an entire generation of Kenyan boys understands women is the definition of an audacious bet.' },
      { name:'Priscilla Chan / CZI', why:'Justice and opportunity with strong education focus. A school curriculum on gender equity is CZI territory.' },
      { name:'Hewlett Foundation', why:'Gender equity and education are twin priorities. Co-designed curriculum with girls is strong on equity framing.' },
      { name:'NoVo Foundation', why:'A curriculum that addresses girls\' rights by working with boys is exactly their complementary approach.' },
    ],
  },
  {
    id:'p6', lane:'Interrupt',
    title:'Salmin for Men',
    tagline:'A crisis line for men in danger of becoming dangerous',
    problem:'There is no safe space for a man in Kenya to call and say "I am losing control and I am scared of what I might do." Every crisis line is for victims. But some perpetrators are also men in crisis — and catching them before the act is prevention.',
    what:'A USSD-based anonymous crisis line for men experiencing rage, suicidal ideation, relationship breakdown, or impulse control crises. Routes to counsellors trained in perpetrator intervention.',
    who:['Mental health professionals','Telcos','Men\'s health organisations','GBV counsellors','Crisis counsellors'],
    tech:'USSD platform (same infrastructure as Salmin *384*89056#), AI triage, counsellor matching',
    status:'Idea',
    donors:[
      { name:'Twilio.org', why:'USSD and communications infrastructure for social impact is Twilio\'s exact philanthropic lane.' },
      { name:'Vodafone Foundation', why:'Mobile technology for social good across Africa. A USSD crisis line is their infrastructure, their mandate.' },
      { name:'Wellcome Trust', why:'Mental health innovation with population-level impact. Male mental health crisis intervention is a gap Wellcome funds.' },
      { name:'Oak Foundation', why:'A men\'s crisis line that prevents perpetration is upstream prevention at its most direct.' },
      { name:'Robert Wood Johnson Foundation', why:'Community health and violence prevention. A crisis intervention that reduces intimate partner violence is a public health win.' },
    ],
  },
  {
    id:'p7', lane:'Interrupt',
    title:'The Baraza Network',
    tagline:'Activating community men as femicide prevention infrastructure',
    problem:'Most prevention work talks at men through campaigns. The most effective interventions use respected men within communities to hold other men accountable. Kenya has a tradition of community accountability — the baraza — never activated for GBV prevention.',
    what:'A network of trained community men (elders, coaches, religious leaders, boda boda leaders) serving as first-response mediators, early warning systems, and accountability holders in their communities.',
    who:['Community leaders','County governments','Chiefs and assistant chiefs','Religious leaders','Sports coaches','Boda boda saccos'],
    tech:'WhatsApp coordination platform, incident reporting tool, community mapping dashboard',
    status:'In development',
    donors:[
      { name:'Ford Foundation', why:'Community organising and feminist movements — the Baraza Network is community-led feminist infrastructure. Core Ford thesis.' },
      { name:'Skoll Foundation', why:'A community accountability network that scales across Kenya is Skoll-scale impact.' },
      { name:'Open Society Foundations', why:'Community-led accountability structures complement formal justice systems.' },
      { name:'Omidyar Network', why:'WhatsApp-based coordination for community safety is their kind of appropriate-tech solution.' },
      { name:'Mo Ibrahim Foundation', why:'The Baraza as governance infrastructure for safety is squarely Mo Ibrahim.' },
    ],
  },
  {
    id:'p8', lane:'Build',
    title:'Fathers & Daughters Initiative',
    tagline:'The most powerful masculinity intervention is a present father',
    problem:'Absent and emotionally unavailable fathers are a significant factor in both male violence and female vulnerability. Boys without fathers are disproportionately represented in violent crime. Girls without fathers are disproportionately targeted by predatory men.',
    what:'A community programme rebuilding father-child relationships through structured activities, counselling and peer support. Targets fathers of girls aged 8–16, and boys aged 8–16 without fathers.',
    who:['Family counsellors','Schools','Religious organisations','Corporates (CSR)','County social services'],
    tech:'Family engagement app, progress tracking, peer support network platform',
    status:'Idea',
    donors:[
      { name:'CIFF', why:'Father-daughter relationships directly impact girls\' safety outcomes — strong CIFF case.' },
      { name:'NoVo Foundation', why:'A programme that reduces girls\' vulnerability by investing in present, safe fathers is upstream prevention.' },
      { name:'Laurene Powell Jobs', why:'A fathers programme that changes family dynamics at scale is Emerson territory.' },
      { name:'Sheryl Sandberg', why:'Father-daughter relationships shape girls\' self-worth and safety radar.' },
      { name:'Mastercard Foundation', why:'Kenya-focused youth and community development. Fits their Africa portfolio.' },
    ],
  },
  {
    id:'p9', lane:'Build',
    title:'KaaRada Perpetrator Intervention Programme',
    tagline:'Not just a registry — a rehabilitation pathway',
    problem:'KaaRada documents convicted perpetrators. But conviction without behaviour change means released men re-offend. Kenya has no structured post-conviction GBV behaviour change programme.',
    what:'A structured 6-month behaviour change programme for men convicted of GBV offences, delivered with Kenya Prisons Service. Completion reduces sentence. Non-completion flagged on KaaRada.',
    who:['Kenya Prisons Service','Ministry of Justice','Mental health professionals','Survivor organisations','Probation officers'],
    tech:'Programme tracking platform, recidivism monitoring, integration with KaaRada registry',
    status:'Idea',
    donors:[
      { name:'MacArthur Foundation', why:'Safety and justice reform — perpetrator behaviour change as justice innovation is exactly MacArthur\'s criminal justice programme.' },
      { name:'Open Society Foundations', why:'A programme combining accountability with rehabilitation is OSF\'s model.' },
      { name:'Oak Foundation', why:'Oak funds the full cycle of violence against women prevention — including perpetrator intervention.' },
      { name:'Sigrid Rausing Trust', why:'A programme linking conviction, rehabilitation and community monitoring is systemic change.' },
      { name:'Wellcome Trust', why:'A science-based perpetrator programme with measurable recidivism outcomes is Wellcome territory.' },
    ],
  },
  {
    id:'p10', lane:'Build',
    title:'FemSaidia Intelligence Brief',
    tagline:'Monthly evidence brief for policymakers who need to act, not just know',
    problem:'Government departments and donors have access to data but not actionable intelligence. The gap between knowing femicide is happening and knowing what to fund, legislate or deploy is where most policy stalls.',
    what:'A monthly 2-page intelligence brief synthesising FemSaidia data, community intelligence and ThinkTank project pipeline — formatted for Cabinet Secretaries, donors and county governors. Delivered by email and WhatsApp.',
    who:['FemSaidia data team','Policy analysts','County governments','National Treasury','Bilateral donors','UN agencies'],
    tech:'Automated report generation from FemSaidia dashboard, distribution platform, engagement tracking',
    status:'In development',
    donors:[
      { name:'The Audacious Project', why:'Intelligence that changes how governments respond to femicide at national scale — this is audacious policy infrastructure.' },
      { name:'Luminate', why:'Evidence briefs that hold governments accountable are Luminate\'s core mandate.' },
      { name:'Ford Foundation', why:'An intelligence brief that puts community data in front of Cabinet Secretaries is movement infrastructure.' },
      { name:'Skoll Foundation', why:'An evidence brief that shifts how governments allocate resources is systems-level impact.' },
      { name:'MacKenzie Scott', why:'An intelligence product that gives policymakers no excuse not to act is exactly her impatient philanthropy.' },
    ],
  },
]

function DonorCard({ donor }) {
  const meta = DONOR_META[donor.name] || {}
  return (
    <div style={{ background:'rgba(200,175,186,0.2)', border:`1px solid ${BD}`, padding:'10px 14px', marginBottom:6 }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
        <span style={{ fontSize:16, flexShrink:0 }}>💰</span>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2, flexWrap:'wrap' }}>
            {meta.url ? (
              <a href={meta.url} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, fontWeight:700, color:A,
                  textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4 }}>
                {donor.name} <ExternalLink size={10}/>
              </a>
            ) : (
              <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, fontWeight:700, color:TXT }}>{donor.name}</span>
            )}
            {meta.area && (
              <span style={{ fontSize:9, padding:'1px 7px', background:HDR, color:MUT,
                fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, letterSpacing:'.04em' }}>
                {meta.area}
              </span>
            )}
          </div>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:MUT, lineHeight:1.6 }}>{donor.why}</p>
        </div>
      </div>
    </div>
  )
}

function FundModal({ project, onClose }) {
  const [form,    setForm]    = useState({ name:'', organisation:'', email:'', type:'foundation', message:'' })
  const [sending, setSending] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  const submit = async () => {
    if (!form.name || !form.email) { setError('Name and email are required'); return }
    setSending(true)
    const { error:err } = await _sb.from('halafu_donor_interest').insert([{
      project_id:    project.id,
      project_title: project.title,
      donor_type:    form.type,
      name:          form.name,
      organisation:  form.organisation || null,
      email:         form.email,
      message:       form.message || null,
    }])
    if (err) { setError(err.message); setSending(false); return }
    setDone(true)
    setSending(false)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(24,4,16,0.85)', zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:CRD, border:`1px solid ${BD}`, padding:28, maxWidth:480, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
        {done ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🙌</div>
            <h3 style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:TXT, marginBottom:8 }}>
              Thank you for stepping forward
            </h3>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:MUT, lineHeight:1.7, marginBottom:20 }}>
              We will be in touch about <strong>{project.title}</strong>. This is exactly how change starts — not with a grant application, but with someone saying "I want to help build this."
            </p>
            <button onClick={onClose}
              style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700, padding:'10px 20px',
                background:A, color:'#F0D0D8', border:'none', cursor:'pointer' }}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <p style={{ fontSize:11, color:A, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700,
                  letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4 }}>Fund this project</p>
                <h3 style={{ fontFamily:"'Lora',serif", fontSize:18, fontWeight:700, color:TXT }}>{project.title}</h3>
              </div>
              <button onClick={onClose}
                style={{ background:'none', border:'none', cursor:'pointer', color:MUT, fontSize:18, lineHeight:1 }}>×</button>
            </div>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, lineHeight:1.7, marginBottom:20,
              background:'#180410', padding:'12px 14px', borderLeft:`3px solid ${A}`, color:'#B89AAA' }}>
              You are coming to us. That is how this should work. Tell us who you are and we will build the conversation from there — no 50-page application required.
            </p>
            {error && <p style={{ fontSize:12, color:A, marginBottom:10, fontFamily:"'Nunito Sans',sans-serif" }}>{error}</p>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700,
                  letterSpacing:'.08em', textTransform:'uppercase', display:'block', marginBottom:3 }}>Your name *</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                  style={{ width:'100%', fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:TXT,
                    background:'#DDD0D0', border:`1px solid ${BD}`, padding:'8px 10px', outline:'none' }}/>
              </div>
              <div>
                <label style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700,
                  letterSpacing:'.08em', textTransform:'uppercase', display:'block', marginBottom:3 }}>Organisation</label>
                <input value={form.organisation} onChange={e=>setForm(f=>({...f,organisation:e.target.value}))}
                  placeholder="Optional"
                  style={{ width:'100%', fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:TXT,
                    background:'#DDD0D0', border:`1px solid ${BD}`, padding:'8px 10px', outline:'none' }}/>
              </div>
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700,
                letterSpacing:'.08em', textTransform:'uppercase', display:'block', marginBottom:3 }}>Email *</label>
              <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                style={{ width:'100%', fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:TXT,
                  background:'#DDD0D0', border:`1px solid ${BD}`, padding:'8px 10px', outline:'none' }}/>
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700,
                letterSpacing:'.08em', textTransform:'uppercase', display:'block', marginBottom:3 }}>Funder type</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                style={{ width:'100%', fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:TXT,
                  background:'#DDD0D0', border:`1px solid ${BD}`, padding:'8px 10px', outline:'none', cursor:'pointer' }}>
                <option value="foundation">Foundation / Trust</option>
                <option value="tech_company">Tech company</option>
                <option value="individual">Individual philanthropist</option>
                <option value="government">Government / bilateral</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700,
                letterSpacing:'.08em', textTransform:'uppercase', display:'block', marginBottom:3 }}>
                Why this project? What do you bring?
              </label>
              <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
                rows={3} placeholder="Optional but helpful..."
                style={{ width:'100%', fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:TXT,
                  background:'#DDD0D0', border:`1px solid ${BD}`, padding:'8px 10px', outline:'none',
                  resize:'vertical' }}/>
            </div>
            <button onClick={submit} disabled={sending}
              style={{ width:'100%', fontFamily:"'Nunito Sans',sans-serif", fontSize:13, fontWeight:700,
                padding:'12px', background:sending?MUT:A, color:'#F0D0D8', border:'none', cursor:sending?'wait':'pointer' }}>
              {sending ? 'Sending...' : 'I want to fund this →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ p, isMobile }) {
  const [open,      setOpen]      = useState(false)
  const [donorOpen, setDonorOpen] = useState(false)
  const [joinType,  setJoinType]  = useState(null)
  const [fundOpen,  setFundOpen]  = useState(false)
  const statusStyle = STATUS_STYLES[p.status]

  return (
    <>
      {fundOpen && <FundModal project={p} onClose={() => setFundOpen(false)}/>}
      <div style={{ background:CRD, border:`1px solid ${BD}`, overflow:'hidden', marginBottom:2 }}>
        {/* Header */}
        <div onClick={() => setOpen(o => !o)}
          style={{ padding:'18px 20px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
              <span style={{ fontSize:10, padding:'2px 8px', background:statusStyle.bg, color:statusStyle.tc,
                fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, letterSpacing:'.06em' }}>
                <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%',
                  background:statusStyle.dot, marginRight:4, verticalAlign:'middle' }}/>
                {p.status.toUpperCase()}
              </span>
              <span style={{ fontSize:10, color:MUT, fontFamily:"'Nunito Sans',sans-serif", letterSpacing:'.06em', textTransform:'uppercase' }}>
                {p.lane}
              </span>
            </div>
            <div style={{ fontFamily:"'Lora',serif", fontSize:isMobile?16:18, fontWeight:700, color:TXT, marginBottom:4 }}>{p.title}</div>
            <p style={{ fontSize:12, color:MUT, fontFamily:"'Nunito Sans',sans-serif", fontStyle:'italic' }}>{p.tagline}</p>
          </div>
          {open ? <ChevronUp size={16} color={MUT}/> : <ChevronDown size={16} color={MUT}/>}
        </div>

        {/* Expanded */}
        {open && (
          <div style={{ borderTop:`1px solid ${BD}`, padding:'20px 20px 24px' }}>
            {[
              { label:'The problem',   text:p.problem },
              { label:'What we build', text:p.what },
              { label:'Tech angle',    text:p.tech },
            ].map(({label,text}) => (
              <div key={label} style={{ marginBottom:16 }}>
                <p style={{ fontSize:11, color:A, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700,
                  letterSpacing:'.1em', textTransform:'uppercase', marginBottom:6 }}>{label}</p>
                <p style={{ fontSize:13, color:TXT, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.8 }}>{text}</p>
              </div>
            ))}

            {/* Who */}
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:11, color:A, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700,
                letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>Who needs to be in the room</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {p.who.map((w,i) => (
                  <span key={i} style={{ fontSize:11, padding:'3px 10px', background:HDR, color:TXT,
                    fontFamily:"'Nunito Sans',sans-serif", fontWeight:600 }}>{w}</span>
                ))}
              </div>
            </div>

            {/* Donors */}
            <div style={{ marginBottom:20 }}>
              <button onClick={() => setDonorOpen(d => !d)}
                style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:`1px solid ${BD}`,
                  padding:'8px 14px', cursor:'pointer', fontFamily:"'Nunito Sans',sans-serif",
                  fontSize:11, fontWeight:700, color:MUT, letterSpacing:'.06em', marginBottom:donorOpen?8:0 }}>
                💰 Funding prospects ({p.donors.length})
                {donorOpen ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
              </button>
              {donorOpen && (
                <div style={{ marginTop:8 }}>
                  <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif",
                    fontStyle:'italic', marginBottom:10, lineHeight:1.6 }}>
                    Best-fit funders based on mandate alignment. Click any name to visit their grants page.
                  </p>
                  {p.donors.map((d,i) => <DonorCard key={i} donor={d}/>)}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {/* Fund this project */}
              <button onClick={() => setFundOpen(true)}
                style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#180410',
                  color:'#D4B0B8', fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
                  padding:'10px 18px', border:`1px solid #3A1830`, cursor:'pointer', letterSpacing:'.04em' }}>
                💰 Fund this project
              </button>

              {/* Join */}
              {!joinType ? (
                <>
                  <button onClick={() => setJoinType('individual')}
                    style={{ display:'inline-flex', alignItems:'center', gap:6, background:A, color:'#F0D0D8',
                      fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
                      padding:'10px 18px', border:'none', cursor:'pointer' }}>
                    👤 Join as individual
                  </button>
                  <button onClick={() => setJoinType('organisation')}
                    style={{ display:'inline-flex', alignItems:'center', gap:6, background:CRD,
                      color:A, fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
                      padding:'10px 18px', border:`1px solid ${A}`, cursor:'pointer' }}>
                    🏢 Join as organisation
                  </button>
                </>
              ) : (
                <div style={{ width:'100%', background:'#180410', border:`1px solid #3A1830`, padding:16 }}>
                  <p style={{ fontSize:12, color:'#D4B0B8', fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, marginBottom:4 }}>
                    {joinType === 'individual' ? '👤 Joining as an individual' : '🏢 Joining as an organisation'}
                  </p>
                  <p style={{ fontSize:11, color:'#7A4A60', fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.7, marginBottom:12 }}>
                    {joinType === 'individual'
                      ? 'Tell us who you are, what you bring (skills, experience, networks, lived experience) and where you are based.'
                      : 'Tell us about your organisation, what you can contribute and where you operate.'}
                  </p>
                  <div style={{ display:'flex', gap:8 }}>
                    <a href={`mailto:halafu@femsaidiakenya.org?subject=Halafu? — Joining: ${encodeURIComponent(p.title)} (${joinType})`}
                      style={{ display:'inline-flex', alignItems:'center', gap:8, background:A, color:'#F0D0D8',
                        fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700, padding:'10px 18px',
                        textDecoration:'none' }}>
                      Send us an email <ArrowRight size={13}/>
                    </a>
                    <button onClick={() => setJoinType(null)}
                      style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, padding:'10px 14px',
                        background:'none', border:`1px solid ${BD}`, color:MUT, cursor:'pointer' }}>
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default function HalaFuTab({ isMobile }) {
  const [lane, setLane] = useState('all')
  const [briefs, setBriefs] = useState([])
  const filtered = lane === 'all' ? PROJECTS : PROJECTS.filter(p => p.lane === lane)

  useState(() => {
    _sb.from('intel_briefs').select('id,title,generated_at,period_start,period_end').eq('active', true)
      .order('generated_at', { ascending: false }).limit(10)
      .then(({ data }) => setBriefs(data || []))
  }, [])
  const counts = {
    all:        PROJECTS.length,
    Understand: PROJECTS.filter(p=>p.lane==='Understand').length,
    Interrupt:  PROJECTS.filter(p=>p.lane==='Interrupt').length,
    Build:      PROJECTS.filter(p=>p.lane==='Build').length,
  }

  return (
    <div className="fade-up" style={{ width:'100%' }}>
      {/* Header */}
      <div style={{ borderBottom:`1px solid ${BD}`, paddingBottom:20, marginBottom:2 }}>
        <p className="label" style={{ marginBottom:10, color:A }}>FemSaidia Action Lab · From outrage to architecture</p>
        <h1 className="serif" style={{ fontSize:isMobile?28:36, fontWeight:700, color:TXT }}>
          Halafu<span style={{ color:A }}>?</span>
        </h1>
        <div style={{ marginTop:12, background:'#180410', padding:'16px 20px', borderLeft:`4px solid ${A}` }}>
          <p style={{ fontFamily:"'Lora',serif", fontSize:isMobile?13:15, color:'#D4B0B8', lineHeight:1.8, fontStyle:'italic' }}>
            "Too much admiration of the pink elephant and very little slaying of the dragon."
          </p>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:'#7A4A60', marginTop:8, lineHeight:1.7 }}>
            We have enough data. We have enough reports. We have enough outrage. What Kenya needs now is <strong style={{ color:'#D4B0B8' }}>architecture</strong> — specific, fundable, executable projects that interrupt the pipeline from misogyny to murder. This is where we build them.
          </p>
        </div>
      </div>

      {/* Donor magnet strip */}
      <div style={{ background:'#180410', border:`1px solid #3A1830`, padding: isMobile?'16px 14px':'20px 24px',
        marginBottom:2, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:'.1em',
            textTransform:'uppercase', color:A, marginBottom:6 }}>● Are you a funder? These projects need you.</p>
          <p style={{ fontFamily:"'Lora',serif", fontSize:isMobile?14:17, fontWeight:700, color:'#F0D0D8', lineHeight:1.4 }}>
            {[...new Set(PROJECTS.flatMap(p=>p.donors.map(d=>d.name)))].length} funding prospects identified across {PROJECTS.length} projects.
            <br/><em style={{ fontWeight:400, color:'#B89AAA' }}>Are you one of them?</em>
          </p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <a href="mailto:halafu@femsaidiakenya.org?subject=Funding interest — Halafu? project pipeline"
            style={{ display:'inline-flex', alignItems:'center', gap:8, background:A, color:'#F0D0D8',
              fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700, padding:'10px 18px',
              textDecoration:'none', letterSpacing:'.04em', whiteSpace:'nowrap' }}>
            💰 I want to fund one of these
          </a>
          <a href="https://uuluuhltphgwfblcghlp.supabase.co/storage/v1/object/public/public-assets/halafu-brief.pdf" target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.08)',
              color:'#D4B0B8', fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:600,
              padding:'10px 18px', textDecoration:'none', border:'1px solid rgba(255,255,255,0.15)',
              letterSpacing:'.04em', whiteSpace:'nowrap' }}>
            📄 Download Halafu? brief
          </a>
          <a href="https://uuluuhltphgwfblcghlp.supabase.co/storage/v1/object/public/public-assets/intel-brief-latest.pdf" target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.08)',
              color:'#D4B0B8', fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:600,
              padding:'10px 18px', textDecoration:'none', border:'1px solid rgba(255,255,255,0.15)',
              letterSpacing:'.04em', whiteSpace:'nowrap' }}>
            📊 Download Intel Brief
          </a>
        </div>
      </div>

      {/* Intel Brief strip */}
      <div style={{ background:'#0A0818', border:'1px solid #8A1030', padding:'16px 20px', marginBottom:2,
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
            letterSpacing:'.12em', textTransform:'uppercase', color:'#8A1030', marginBottom:4 }}>
            📊 FemSaidia Intelligence Brief
          </p>
          <p style={{ fontFamily:"'Lora',serif", fontSize:14, fontWeight:700, color:'#F0D0D8', marginBottom:4 }}>
            Bi-weekly femicide & misogyny intelligence
          </p>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:'#8892B0', lineHeight:1.6 }}>
            AI-generated from live platform data — case tracker, misogyny index, scanner catches and community pulse.
            Updated every two weeks. Share with policymakers, funders and researchers.
          </p>
        </div>
        <a href="https://uuluuhltphgwfblcghlp.supabase.co/storage/v1/object/public/public-assets/intel-brief-latest.pdf"
          target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#8A1030',
            color:'#F0D0D8', fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
            padding:'12px 20px', textDecoration:'none', letterSpacing:'.04em', whiteSpace:'nowrap', flexShrink:0 }}>
          📥 Download latest brief
        </a>
      </div>

      {/* Brief archive */}
      {briefs.length > 1 && (
        <div style={{ marginBottom:2 }}>
          <div style={{ background:'#180410', padding:'10px 20px', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
              letterSpacing:'.1em', textTransform:'uppercase', color:'#8A1030' }}>📁 Brief archive</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
            {briefs.map((b,i) => (
              <div key={b.id} style={{ background:i===0?'#1A0818':'rgba(255,255,255,0.02)',
                border:'1px solid rgba(138,16,48,0.2)', padding:'10px 20px',
                display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                <div>
                  <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
                    color:'#F0D0D8', marginBottom:2 }}>{b.title}</p>
                  <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:'#8892B0' }}>
                    {b.period_start} — {b.period_end}
                  </p>
                </div>
                <a href="https://uuluuhltphgwfblcghlp.supabase.co/storage/v1/object/public/public-assets/intel-brief-latest.pdf"
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                    color:'#8A1030', textDecoration:'none', flexShrink:0 }}>
                  📥 Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:2, marginBottom:2 }}>
        {[
          { v:PROJECTS.length,                                        l:'Projects in pipeline' },
          { v:PROJECTS.filter(p=>p.status==='In development').length, l:'In development' },
          { v:PROJECTS.filter(p=>p.status==='Active').length,         l:'Active' },
          { v:[...new Set(PROJECTS.flatMap(p=>p.donors.map(d=>d.name)))].length, l:'Funding prospects identified' },
        ].map((s,i) => (
          <div key={i} style={{ background:CRD, border:`1px solid ${BD}`, padding:'14px 18px', borderLeft:`3px solid ${A}` }}>
            <div style={{ fontFamily:"'Lora',serif", fontSize:32, fontWeight:700, color:A }}>{s.v}</div>
            <p style={{ fontSize:11, color:MUT, marginTop:4, fontFamily:"'Nunito Sans',sans-serif" }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Lane filter */}
      <div style={{ display:'flex', gap:2, marginBottom:2, flexWrap:'wrap' }}>
        {['all','Understand','Interrupt','Build'].map(l => (
          <button key={l} onClick={() => setLane(l)}
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
              padding:'8px 16px', border:`1px solid ${lane===l?A:BD}`,
              background:lane===l?A:CRD, color:lane===l?'#F0D0D8':MUT,
              cursor:'pointer', letterSpacing:'.04em' }}>
            {l==='all' ? `All (${counts.all})` : `${LANE_STYLES[l].label} (${counts[l]})`}
          </button>
        ))}
      </div>

      {lane !== 'all' && (
        <div style={{ background:LANE_STYLES[lane].bg, border:`1px solid ${LANE_STYLES[lane].border}`,
          padding:'12px 18px', marginBottom:2 }}>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:'#D4B0B8', lineHeight:1.7 }}>
            {LANE_STYLES[lane].desc}
          </p>
        </div>
      )}

      {/* Projects */}
      <div style={{ marginTop:2 }}>
        {filtered.map(p => <ProjectCard key={p.id} p={p} isMobile={isMobile}/>)}
      </div>

      {/* Submit */}
      <div style={{ marginTop:16, background:'#180410', border:`1px solid #3A1830`,
        padding:isMobile?'20px 16px':'24px 28px' }}>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
          letterSpacing:'.12em', textTransform:'uppercase', color:A, marginBottom:8 }}>
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

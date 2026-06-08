import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)


// ── ANALYTICS TRACKER ─────────────────────────────────────────────────────────
const track = async (event, data = {}) => {
  try {
    await sb.from('saint_analytics').insert({
      event,
      project_id:    data.project_id    || null,
      project_title: data.project_title || null,
      lane:          data.lane          || null,
      tab:           data.tab           || null,
      metadata:      data.metadata      || null,
    })
  } catch(e) { /* silent */ }
}

// ── PALETTE ───────────────────────────────────────────────────────────────────
const BG    = '#0A0D14'
const SURF  = '#111827'
const CARD  = '#1A2035'
const RED   = '#8A1030'
const RED2  = '#C05010'
const GOLD  = '#C8A040'
const GRN   = '#16A34A'
const BLUE  = '#2563EB'
const PURP  = '#7C3AED'
const TXT   = '#F0E8F0'
const MUT   = '#8892B0'
const BD    = 'rgba(138,16,48,0.25)'

// ── PROJECTS (from FemSaidia ThinkTank) ──────────────────────────────────────
const PROJECTS = [
  {
    id:'p1', lane:'Understand', laneColor:PURP,
    title:'The Misogyny Pipeline in Kenya',
    tagline:'Mapping how online hate speech becomes offline violence',
    problem:'Manosphere content is reaching Kenyan boys through TikTok, YouTube and Telegram. The specific pathways, most dangerous creators, and radicalisation onset are unmapped.',
    what:'Structured research mapping algorithm-served misogynistic content to real-world attitudes. Interviews, content analysis, platform audits.',
    frameworks:['SDG 5.2','SDG 16.1','Maputo Protocol Art.4'],
    donors:['Reset','Luminate','Open Society Foundations','Google.org','Ford Foundation'],
    stat:'kibe', statLabel:'manosphere articles tracked', status:'Idea',
  },
  {
    id:'p2', lane:'Understand', laneColor:PURP,
    title:'The Economics of Male Violence',
    tagline:'Unemployment, debt and femicide — the data gap',
    problem:'Financial stress is a documented trigger in intimate partner violence escalations. No systematic Kenyan data exists on this relationship.',
    what:'Community-level study correlating economic indicators with GBV incidents across 10 counties. Build a predictive risk model.',
    frameworks:['SDG 1.3','SDG 5.2','AU Agenda 2063 Goal 17'],
    donors:['MacArthur Foundation','Hewlett Foundation','Omidyar Network','CIFF','Wellcome Trust'],
    stat:'femicides', statLabel:'femicide cases in tracker', status:'Idea',
  },
  {
    id:'p3', lane:'Understand', laneColor:PURP,
    title:'Boys Who Witnessed It',
    tagline:'Understanding intergenerational transmission of violence',
    problem:'A significant proportion of men who kill women grew up watching their mothers be beaten. This link is undocumented in Kenya.',
    what:'Oral history project collecting testimonies from men in perpetrator programmes. Build a trauma map for early intervention design.',
    frameworks:['SDG 3.4','SDG 16.2','CRC Article 19'],
    donors:['Oak Foundation','NoVo Foundation','Wellcome Trust','CIFF','Sigrid Rausing Trust'],
    stat:'femicides', statLabel:'documented cases — each with a perpetrator history', status:'Idea',
  },
  {
    id:'p4', lane:'Interrupt', laneColor:GRN,
    title:'Counter-Narrative Content Lab',
    tagline:'Kenyan creators making alternative masculinity content at scale',
    problem:'The misogyny pipeline wins because it is entertaining and algorithmically amplified. Counter-content is preachy and NGO-funded.',
    what:'A funded content lab recruiting 20 Kenyan male creators to make compelling healthy masculinity content — in Sheng, in formats young men watch.',
    frameworks:['SDG 4.7','SDG 5.C','AU Youth Charter'],
    donors:['The Audacious Project','Reset','MacKenzie Scott','Luminate'],
    stat:'kibe', statLabel:'manosphere articles the lab counters', status:'In development',
  },
  {
    id:'p5', lane:'Interrupt', laneColor:GRN,
    title:'The 10-16 Curriculum',
    tagline:'Reaching boys before the pipeline does',
    problem:'By the time most programmes reach men, the attitudes are formed. The window is 10–16.',
    what:'School-based programme co-designed with girls teaching consent, emotional regulation, online misogyny recognition and bystander action. 20 schools, 5 counties.',
    frameworks:['SDG 4.1','SDG 5.1','Maputo Protocol Art.12'],
    donors:['CIFF','The Audacious Project','Priscilla Chan / CZI','Hewlett Foundation','NoVo Foundation'],
    stat:'score', statLabel:'misogyny index — what this curriculum fights', status:'Idea',
  },
  {
    id:'p6', lane:'Interrupt', laneColor:GRN,
    title:'Salmin for Men',
    tagline:'A crisis line for men in danger of becoming dangerous',
    problem:'No safe space exists for a man in Kenya to say "I am losing control." Every crisis line is for victims.',
    what:'USSD anonymous crisis line for men experiencing rage, suicidal ideation or impulse control crises. Routes to perpetrator intervention counsellors.',
    frameworks:['SDG 3.4','SDG 5.2','WHO Mental Health Action Plan'],
    donors:['Twilio.org','Vodafone Foundation','Wellcome Trust','Oak Foundation','Robert Wood Johnson Foundation'],
    stat:'techGBV', statLabel:'tech-facilitated cases — perpetrators had warning signs', status:'Idea',
  },
  {
    id:'p7', lane:'Interrupt', laneColor:GRN,
    title:'The Baraza Network',
    tagline:'Activating community men as femicide prevention infrastructure',
    problem:'Most prevention talks at men through campaigns. Kenya has a tradition of community accountability — the baraza — never activated for GBV.',
    what:'Network of trained community men (elders, coaches, religious leaders, boda boda) as first-response mediators and early warning systems.',
    frameworks:['SDG 16.7','SDG 5.C','AU Agenda 2063 Goal 1'],
    donors:['Ford Foundation','Skoll Foundation','Open Society Foundations','Omidyar Network','Mo Ibrahim Foundation'],
    stat:'protest', statLabel:'community mobilisation events tracked', status:'In development',
  },
  {
    id:'p8', lane:'Build', laneColor:RED,
    title:'Fathers & Daughters Initiative',
    tagline:'The most powerful masculinity intervention is a present father',
    problem:'Absent fathers correlate with both male violence perpetration and female vulnerability. No structured Kenyan programme addresses this.',
    what:'Community programme rebuilding father-child relationships. Targets fathers of girls 8–16 and boys 8–16 without fathers.',
    frameworks:['SDG 5.4','SDG 16.2','African Charter on the Rights of the Child'],
    donors:['CIFF','NoVo Foundation','Laurene Powell Jobs','Sheryl Sandberg','Mastercard Foundation'],
    stat:'femicides', statLabel:'cases with absent-father patterns', status:'Idea',
  },
  {
    id:'p9', lane:'Build', laneColor:RED,
    title:'KaaRada Perpetrator Intervention Programme',
    tagline:'Not just a registry — a rehabilitation pathway',
    problem:'Kenya has no structured post-conviction GBV behaviour change programme. Conviction without change means re-offending.',
    what:'6-month behaviour change programme for men convicted of GBV, with Kenya Prisons Service. Completion reduces sentence. Non-completion flagged on KaaRada.',
    frameworks:['SDG 16.3','SDG 5.2','Maputo Protocol Art.4c'],
    donors:['MacArthur Foundation','Open Society Foundations','Oak Foundation','Sigrid Rausing Trust','Wellcome Trust'],
    stat:'convicted', statLabel:'convictions — each a rehabilitation opportunity', status:'Idea',
  },
  {
    id:'p10', lane:'Build', laneColor:RED,
    title:'SaInt Intelligence Brief',
    tagline:'Monthly evidence for policymakers who need to act, not just know',
    problem:'Government departments have data but not actionable intelligence. The gap between knowing and acting is where policy stalls.',
    what:'Monthly 2-page intelligence brief synthesising FemSaidia data and project pipeline — for Cabinet Secretaries, donors and county governors.',
    frameworks:['SDG 16.6','SDG 5.C','AU Agenda 2063 Goal 3'],
    donors:['The Audacious Project','Luminate','Ford Foundation','Skoll Foundation','MacKenzie Scott'],
    stat:'articles', statLabel:'data points in the latest brief', status:'In development',
  },
]

const LANE_META = {
  'Understand': { icon:'🔍', color:PURP, desc:'What is turning boys into men who harm?', bg:'rgba(124,58,237,0.08)' },
  'Interrupt':  { icon:'⚡', color:GRN,  desc:'Where can we intervene before harm happens?', bg:'rgba(22,163,74,0.08)' },
  'Build':      { icon:'🔨', color:RED,  desc:'What do we create to prevent the next death?', bg:'rgba(138,16,48,0.08)' },
}

// ── LIVE SIGNAL BAR ───────────────────────────────────────────────────────────
function LiveBar({ intel }) {
  if (!intel) return null
  const alert = intel.score >= 60
  return (
    <div style={{ background: alert ? 'rgba(138,16,48,0.15)' : 'rgba(22,163,74,0.08)',
      borderBottom:`1px solid ${BD}`, padding:'8px 24px',
      display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <div style={{ width:7, height:7, borderRadius:'50%', background:alert?RED:GRN,
          animation:'pulse 1.5s infinite' }}/>
        <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
          letterSpacing:'.15em', color:alert?RED:GRN }}>LIVE SIGNAL</span>
      </div>
      {[
        { v:intel.score+'/100', l:'Misogyny Index', c:alert?RED:GOLD },
        { v:intel.articles,      l:'Articles classified', c:MUT },
        { v:intel.kibe,          l:'Manosphere tracked', c:PURP },
        { v:intel.techGBV,       l:'Tech-GBV cases', c:BLUE },
        { v:intel.femicides,     l:'Femicide cases', c:RED },
      ].map((m,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ fontFamily:"'Lora',serif", fontSize:14, fontWeight:700, color:m.c }}>{m.v}</span>
          <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
            color:MUT, letterSpacing:'.08em' }}>{m.l.toUpperCase()}</span>
        </div>
      ))}
      <span style={{ marginLeft:'auto', fontFamily:"'Nunito Sans',sans-serif",
        fontSize:9, color:MUT }}>Updated {intel.lastUpdated}</span>
    </div>
  )
}

// ── PROJECT CARD ──────────────────────────────────────────────────────────────
function ProjectCard({ p, intel, onFund }) {
  const [open, setOpen] = useState(false)
  const lm = LANE_META[p.lane]
  const toggleOpen = () => {
    const next = !open
    setOpen(next)
    if (next) track('project_click', { project_id:p.id, project_title:p.title, lane:p.lane })
  }
  const statValue = intel ? (intel[p.stat] ?? '—') : '—'

  return (
    <div style={{ background:CARD, border:`1px solid ${BD}`,
      borderTop:`3px solid ${p.laneColor}`, animation:'fadeIn .4s both' }}>
      {/* Card header */}
      <div onClick={toggleOpen} style={{ padding:'20px 22px',
        cursor:'pointer', userSelect:'none' }}>
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'flex-start', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
              letterSpacing:'.12em', padding:'2px 8px',
              background:`rgba(${p.laneColor===PURP?'124,58,237':p.laneColor===GRN?'22,163,74':'138,16,48'},0.2)`,
              color:p.laneColor, border:`1px solid ${p.laneColor}` }}>
              {lm.icon} {p.lane.toUpperCase()}
            </span>
            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
              letterSpacing:'.1em', padding:'2px 8px', color:MUT,
              border:`1px solid rgba(136,146,176,0.2)` }}>
              {p.status.toUpperCase()}
            </span>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700,
              color:p.laneColor, lineHeight:1 }}>{statValue}</div>
            <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:8,
              color:MUT, marginTop:2, maxWidth:80, textAlign:'right' }}>
              {p.statLabel}
            </div>
          </div>
        </div>
        <h3 style={{ fontFamily:"'Lora',serif", fontSize:18, fontWeight:700,
          color:TXT, marginBottom:6, lineHeight:1.3 }}>{p.title}</h3>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12,
          color:MUT, fontStyle:'italic' }}>{p.tagline}</p>
      </div>

      {open && (
        <div style={{ padding:'0 22px 20px', borderTop:`1px solid ${BD}` }}>
          <div style={{ marginTop:16, marginBottom:14 }}>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
              fontWeight:700, color:RED, letterSpacing:'.1em',
              textTransform:'uppercase', marginBottom:8 }}>The gap</p>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13,
              color:'rgba(240,232,240,0.8)', lineHeight:1.8 }}>{p.problem}</p>
          </div>
          <div style={{ marginBottom:14 }}>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
              fontWeight:700, color:GOLD, letterSpacing:'.1em',
              textTransform:'uppercase', marginBottom:8 }}>The intervention</p>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13,
              color:'rgba(240,232,240,0.8)', lineHeight:1.8 }}>{p.what}</p>
          </div>
          {/* Frameworks */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
            {p.frameworks.map((f,i) => (
              <span key={i} style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                fontWeight:700, padding:'2px 8px', color:GOLD,
                border:`1px solid rgba(200,160,64,0.3)`,
                background:'rgba(200,160,64,0.08)' }}>{f}</span>
            ))}
          </div>
          {/* Funders */}
          <div style={{ marginBottom:14 }}>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
              letterSpacing:'.12em', color:MUT, marginBottom:8 }}>ALIGNED FUNDERS</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
              {p.donors.map((d,i) => (
                <span key={i} style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10,
                  padding:'3px 8px', background:'rgba(255,255,255,0.05)',
                  border:`1px solid ${BD}`, color:TXT }}>{d}</span>
              ))}
            </div>
          </div>
          <button onClick={()=>{ onFund(p); track('fund_modal_open', { project_id:p.id, project_title:p.title, lane:p.lane }) }}
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
              padding:'10px 20px', background:RED, color:TXT,
              border:'none', cursor:'pointer', letterSpacing:'.06em' }}>
            Fund this project →
          </button>
        </div>
      )}
    </div>
  )
}

// ── FUND MODAL ────────────────────────────────────────────────────────────────
function FundModal({ project, onClose }) {
  const [form, setForm] = useState({ name:'', org:'', email:'', role:'', note:'' })
  const [sent, setSent] = useState(false)
  const submit = async () => {
    if (!form.email || !form.name) return
    await sb.from('fund_expressions').insert({
      project_id: project.id,
      project_title: project.title,
      ...form,
      source: 'saint'
    })
    setSent(true)
  }
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)',
      zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center',
      padding:20 }} onClick={onClose}>
      <div style={{ background:SURF, border:`1px solid ${BD}`, borderTop:`3px solid ${RED}`,
        padding:32, maxWidth:520, width:'100%', animation:'fadeIn .2s' }}
        onClick={e=>e.stopPropagation()}>
        {sent ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <p style={{ fontFamily:"'Lora',serif", fontSize:22, color:TXT, marginBottom:12 }}>
              Thank you.
            </p>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:MUT, lineHeight:1.8 }}>
              We will be in touch about <strong style={{color:TXT}}>{project.title}</strong>.
              This is how change starts — not with a grant application, but with
              someone saying "I want to help build this."
            </p>
            <button onClick={onClose} style={{ marginTop:20, fontFamily:"'Nunito Sans',sans-serif",
              fontSize:11, padding:'8px 20px', background:RED, color:TXT, border:'none', cursor:'pointer' }}>
              Close
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
              letterSpacing:'.15em', color:RED, marginBottom:8 }}>FUND THIS PROJECT</p>
            <h3 style={{ fontFamily:"'Lora',serif", fontSize:18, fontWeight:700,
              color:TXT, marginBottom:20 }}>{project.title}</h3>
            {[['name','Your name *'],['org','Organisation'],['email','Email address *'],['role','Your role']].map(([k,l]) => (
              <div key={k} style={{ marginBottom:12 }}>
                <label style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                  fontWeight:700, letterSpacing:'.1em', color:MUT,
                  display:'block', marginBottom:4 }}>{l.toUpperCase()}</label>
                <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
                  style={{ width:'100%', padding:'8px 12px',
                    background:CARD, border:`1px solid ${BD}`,
                    color:TXT, fontFamily:"'Nunito Sans',sans-serif", fontSize:12,
                    outline:'none' }}/>
              </div>
            ))}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                fontWeight:700, letterSpacing:'.1em', color:MUT,
                display:'block', marginBottom:4 }}>WHY THIS PROJECT</label>
              <textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})}
                rows={3} style={{ width:'100%', padding:'8px 12px',
                  background:CARD, border:`1px solid ${BD}`,
                  color:TXT, fontFamily:"'Nunito Sans',sans-serif", fontSize:12,
                  outline:'none', resize:'none' }}/>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={submit}
                style={{ flex:2, padding:'10px', background:RED, color:TXT,
                  fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                  border:'none', cursor:'pointer' }}>
                Express interest →
              </button>
              <button onClick={onClose}
                style={{ flex:1, padding:'10px', background:'none',
                  border:`1px solid ${BD}`, color:MUT,
                  fontFamily:"'Nunito Sans',sans-serif", fontSize:11, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── INTELLIGENCE PANEL ────────────────────────────────────────────────────────
function IntelPanel({ intel }) {
  const [synthesis, setSynthesis] = useState('')
  const [generating, setGenerating] = useState(false)
  const [cached, setCached] = useState(false)

  // Load cached synthesis on mount
  useEffect(() => {
    sb.from('saint_synthesis')
      .select('synthesis,generated_at')
      .order('generated_at', { ascending:false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]?.synthesis) {
          setSynthesis(data[0].synthesis)
          setCached(true)
        }
      })
  }, [])

  const generate = async () => {
    if (!intel) return
    setGenerating(true)
    track('synthesis_generate', { metadata: { score: intel?.score } })
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:1000,
          messages:[{role:'user', content:
            `You are SaInt — the Saidia Intelligence desk. A senior program officer at a major international foundation is reading our project proposals right now. Write 3 precise, unsparing sentences that make our live data impossible to ignore.

Data:
- Misogyny Index: ${intel.score}/100 (${intel.delta>0?'+':''  }${intel.delta} from last week). Alert threshold: 60.
- ${intel.articles} articles classified. ${intel.kibe} manosphere-tagged. ${intel.protest} community mobilisation.
- ${intel.techGBV} tech-facilitated GBV cases. ${intel.highScore} articles scored 8+/10 for misogyny.
- ${intel.femicides} femicide cases across ${intel.counties} counties. ${intel.convicted} convictions.

Our 10 projects span: understanding the misogyny pipeline, interrupting radicalisation, and building perpetrator accountability systems.

3 sentences. For a funder who funds globally. Make Kenya\'s crisis undeniable and our projects the logical response.`
          }]
        })
      })
      const d = await res.json()
      setSynthesis(d.content?.[0]?.text || '')
    } catch(e) { setSynthesis('Synthesis unavailable.') }
    setGenerating(false)
  }

  return (
    <div style={{ background:CARD, border:`1px solid ${BD}`,
      borderLeft:`4px solid ${RED}`, padding:28, marginBottom:2 }}>
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
            letterSpacing:'.2em', color:RED, marginBottom:8 }}>FIELD INTELLIGENCE</p>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:24, fontWeight:700,
            color:TXT, lineHeight:1.3, maxWidth:480 }}>
            The data behind the 10 projects
          </h2>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:"'Lora',serif", fontSize:48, fontWeight:700,
            color: intel?.score >= 60 ? RED : GOLD, lineHeight:1 }}>
            {intel?.score ?? '—'}
          </div>
          <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10,
            color:MUT }}>Misogyny Index / 100</div>
          <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
            color: intel?.delta > 0 ? RED : GRN, marginTop:2 }}>
            {intel ? `${intel.delta > 0 ? '↑' : '↓'}${Math.abs(intel.delta)}pt from last week` : ''}
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      {intel && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',
          gap:1, marginBottom:24 }}>
          {[
            {v:intel.kibe,     l:'Manosphere',   s:'articles tracked',  c:PURP},
            {v:intel.techGBV,  l:'Tech-GBV',     s:'cases documented',   c:BLUE},
            {v:intel.femicides,l:'Femicides',     s:`${intel.counties} counties`,  c:RED},
            {v:intel.protest,  l:'Mobilisations',s:'marches + protests', c:GRN},
            {v:intel.convicted,l:'Convictions',   s:'of documented cases',c:GOLD},
          ].map((m,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.03)',
              padding:'14px 16px', borderLeft:`2px solid ${m.c}` }}>
              <div style={{ fontFamily:"'Lora',serif", fontSize:28, fontWeight:700,
                color:m.c, lineHeight:1 }}>{m.v}</div>
              <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10,
                fontWeight:700, color:TXT, marginTop:4 }}>{m.l}</div>
              <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                color:MUT, marginTop:2 }}>{m.s}</div>
            </div>
          ))}
        </div>
      )}

      {/* Synthesis */}
      {synthesis && cached && (
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:8,
          color:MUT, marginBottom:8 }}>Auto-generated daily · Last updated today</p>
      )}
      {synthesis ? (
        <div>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
            letterSpacing:'.15em', color:GOLD, marginBottom:12 }}>
            INTELLIGENCE SYNTHESIS · GENERATED FROM LIVE DATA
          </p>
          <p style={{ fontFamily:"'Lora',serif", fontSize:15, fontStyle:'italic',
            color:TXT, lineHeight:1.9, marginBottom:12 }}>{synthesis}</p>
          <button onClick={()=>{ setSynthesis(''); setCached(false); }}
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
              color:MUT, background:'none', border:'none', cursor:'pointer', padding:0 }}>
            ↻ Regenerate
          </button>
        </div>
      ) : (
        <button onClick={generate} disabled={generating||!intel}
          style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
            padding:'10px 20px', background:'rgba(138,16,48,0.2)',
            border:`1px solid ${BD}`, color:TXT, cursor:'pointer' }}>
          {generating ? '⟳ Generating...' : '⚡ Generate intelligence synthesis for funders'}
        </button>
      )}
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

// ── ABOUT TAB ─────────────────────────────────────────────────────────────────
function AboutTab() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const ECOSYSTEM = [
    {
      name: 'FemSaidia Kenya',
      url: 'https://femsaidiakenya.org',
      icon: '🛡',
      color: '#8A1030',
      desc: 'The core platform. Tracks femicide cases, runs the misogyny scanner, publishes Intel Briefs, and hosts the JiJue archetype safety tool for women.',
      what: 'Intelligence · Case tracking · Community safety',
    },
    {
      name: 'hepa',
      url: 'https://hepa.femsaidiakenya.org',
      icon: '🔒',
      color: '#0A2D1A',
      desc: 'A panic safety PWA that works offline. Sets a check-in timer — if you do not respond, it alerts your contacts automatically. Disguised as a calculator.',
      what: 'Personal safety · Offline-capable · PWA',
    },
    {
      name: 'RedFlag',
      url: 'https://redflag.femsaidiakenya.org',
      icon: '🚩',
      color: '#8A1030',
      desc: 'JiJue/JiTume — Know yourself, know your risk. Four archetype-based safety profiles with red flags, protective measures and community voices. Also hosts KaaRada perpetrator registry.',
      what: 'Risk profiling · Perpetrator registry · Community voices',
    },
    {
      name: 'Itika',
      url: 'https://itika.femsaidiakenya.org',
      icon: '📡',
      color: '#0A2A1A',
      desc: 'Community First Responder Network. Boda-boda riders, SRHR advocates and local HRDs register to receive real-time alerts and dispatch calls from hepa and RedFlag.',
      what: 'First responders · Alert dispatch · Community network',
    },
    {
      name: 'SaInt',
      url: 'https://saint.femsaidiakenya.org',
      icon: '⚡',
      color: '#0A0D14',
      desc: 'Saidia Intelligence. Live femicide data, misogyny index tracking, and 10 specific research and intervention proposals for funders and policymakers. You are here.',
      what: 'Intelligence · Proposals · Funder engagement',
    },
  ]

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '32px 24px', maxWidth:1100, margin:'0 auto' }}>
      <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
        letterSpacing:'.2em', color:RED, marginBottom:12 }}>ABOUT SAINT</p>
      <h2 style={{ fontFamily:"'Lora',serif", fontSize: isMobile ? 24 : 32,
        fontWeight:700, color:TXT, lineHeight:1.3, marginBottom:16, maxWidth:640 }}>
        Intelligence infrastructure for the crisis that kills a woman every 47 hours in Kenya.
      </h2>
      <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:MUT,
        lineHeight:1.9, maxWidth:680, marginBottom:32 }}>
        SaInt is built by FemSaidia Kenya — an independent intelligence and advocacy
        organisation tracking femicide, misogyny and gender-based violence in Kenya.
        Our scanner classifies hundreds of articles every day. Our misogyny index
        tracks the gap between media coverage and community response. Our Intel Brief
        reaches Cabinet Secretaries, donors and county governors fortnightly.
        The 10 projects on this platform are proposals we are actively seeking to fund
        and implement — not aspirations, but architectures ready to build.
      </p>

      {/* Ecosystem */}
      <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
        letterSpacing:'.2em', color:GOLD, marginBottom:16 }}>THE FEMSAIDIA ECOSYSTEM</p>
      <div style={{ display:'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)',
        gap:2, marginBottom:32 }}>
        {ECOSYSTEM.map((e,i) => (
          <a key={i} href={e.url} target="_blank" rel="noopener noreferrer"
            style={{ background:CARD, border:`1px solid ${BD}`,
              borderLeft:`3px solid ${e.color}`,
              padding:'18px 20px', textDecoration:'none',
              display:'block', transition:'background .15s' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{e.icon}</span>
              <span style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:700,
                color:TXT }}>{e.name}</span>
              {e.name === 'SaInt' && (
                <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:8,
                  padding:'1px 6px', background:`${RED}33`, color:RED,
                  fontWeight:700, letterSpacing:'.1em' }}>YOU ARE HERE</span>
              )}
            </div>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12,
              color:MUT, lineHeight:1.7, marginBottom:8 }}>{e.desc}</p>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
              fontWeight:700, color:`${e.color === BG ? GOLD : e.color}`,
              letterSpacing:'.1em' }}>{e.what}</p>
          </a>
        ))}
      </div>

      {/* Contact */}
      <div style={{ background:CARD, border:`1px solid ${BD}`,
        borderTop:`3px solid ${RED}`, padding:'24px 20px' }}>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
          letterSpacing:'.2em', color:RED, marginBottom:12 }}>PARTNER WITH US</p>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13,
          color:MUT, lineHeight:1.8, marginBottom:16, maxWidth:560 }}>
          If you are a funder, policymaker, researcher or organisation that wants
          to build any of these 10 projects — or commission intelligence for your
          own work — get in touch.
        </p>
        <a href="mailto:halafu@femsaidiakenya.org?subject=SaInt Partnership"
          style={{ display:'inline-flex', alignItems:'center', gap:8,
            fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
            padding:'10px 20px', background:RED, color:TXT, textDecoration:'none',
            letterSpacing:'.06em' }}>
          halafu@femsaidiakenya.org →
        </a>
      </div>
    </div>
  )
}


export default function App() {
  const [intel, setIntel]   = useState(null)
  const [lane, setLane]     = useState('all')
  const [activeTab, setActiveTab]     = useState('intel')
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showIOSHint, setShowIOSHint]     = useState(false)
  const isIOS = /iphone|ipad|ipod/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '')
  const isInstalled = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (isIOS) { setShowIOSHint(true); return }
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') setInstallPrompt(null)
    } else {
      // Chrome hasn't fired prompt yet — show manual instructions
      setShowIOSHint(true)
    }
  }
  const [fundProject, setFundProject] = useState(null)
  const [contactOpen, setContactOpen] = useState(false)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    Promise.all([
      sb.from('misogyny_index').select('score,date').order('date',{ascending:false}).limit(2),
      sb.from('sentiment_articles').select('is_kibe_related,is_protest,tech_facilitated,misogyny_score',{count:'exact'}).limit(1000),
      sb.from('femicide_cases').select('id,county,status',{count:'exact'}).eq('published',true),
    ]).then(([idx, arts, cases]) => {
      const latest = idx.data?.[0] || {}
      const prev   = idx.data?.[1] || {}
      const a = arts.data || []
      const c = cases.data || []
      setIntel({
        score:     latest.score || 51,
        delta:     prev.score ? Math.round((latest.score-prev.score)*10)/10 : 0,
        articles:  arts.count || 0,
        kibe:      a.filter(x=>x.is_kibe_related).length,
        protest:   a.filter(x=>x.is_protest).length,
        techGBV:   a.filter(x=>x.tech_facilitated).length,
        highScore: a.filter(x=>x.misogyny_score>=8).length,
        femicides: cases.count || 0,
        counties:  new Set(c.map(x=>x.county)).size,
        convicted: c.filter(x=>x.status==='convicted').length,
        lastUpdated: latest.date ? new Date(latest.date).toLocaleDateString('en-KE',{day:'numeric',month:'short'}) : 'today',
      })
    })
  }, [])

  const projects = lane==='all' ? PROJECTS : PROJECTS.filter(p=>p.lane===lane)

  return (
    <div style={{ background:BG, minHeight:'100vh', color:TXT, paddingBottom: isMobile ? 60 : 0 }}>

      {/* Top navigation */}
      <nav style={{ background:SURF, borderBottom:`1px solid ${BD}`,
        padding:'0 24px', display:'flex', justifyContent:'space-between',
        alignItems:'center', height:52, position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:700, cursor:'pointer' }}
            onClick={()=>setActiveTab('intel')}>
            <span style={{ color:TXT }}>Sa</span><span style={{ color:RED }}><span style={{ position:'relative', display:'inline-block' }}>I<span style={{ position:'absolute', top:'-0.04em', left:'50%', transform:'translateX(-50%)', width:'0.18em', height:'0.18em', borderRadius:'50%', background:'#FFFFFF', display:'block' }}/></span>nt</span>
          </span>
          <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:8,
            fontWeight:700, letterSpacing:'.2em', color:MUT,
            borderLeft:`1px solid ${BD}`, paddingLeft:8 }}>
            SAIDIA INTELLIGENCE
          </span>
        </div>
        {/* Tab nav — desktop only (mobile tabs at bottom) */}
        {!isMobile && (
          <div style={{ display:'flex', gap:0, position:'absolute',
            left:'50%', transform:'translateX(-50%)' }}>
            {[
              { id:'intel',    label:'⚡ Intel' },
              { id:'projects', label:'🔨 Projects' },
              { id:'briefs',   label:'📄 Briefs' },
              { id:'about',    label:'ℹ About' },
            ].map(t => (
              <button key={t.id} onClick={()=>setActiveTab(t.id)}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  padding:'0 16px', height:52, border:'none', cursor:'pointer',
                  background:'transparent',
                  borderBottom: activeTab===t.id ? `2px solid ${RED}` : '2px solid transparent',
                  color: activeTab===t.id ? TXT : MUT,
                  letterSpacing:'.04em' }}>
                {t.label}
              </button>
            ))}
          </div>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {intel && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:'50%',
                background:intel.score>=60?RED:GRN, animation:'pulse 1.5s infinite'}}/>
              <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10,
                fontWeight:700, color:intel.score>=60?RED:GRN }}>
                {intel.score}/100
              </span>
            </div>
          )}
          {!isInstalled && (
            <button onClick={handleInstall}
              style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                padding:'6px 12px', background:'transparent',
                border:`1px solid ${BD}`, color:MUT,
                cursor:'pointer', letterSpacing:'.04em',
                display:'flex', alignItems:'center', gap:5 }}>
              ⬇ Install
            </button>
          )}
          <button onClick={()=>setActiveTab('about')}
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
              padding:'6px 14px', background:RED, color:TXT,
              border:'none', cursor:'pointer', letterSpacing:'.06em' }}>
            Partner →
          </button>
        </div>
      </nav>

      {/* Live bar - always visible */}
      <LiveBar intel={intel}/>

      {/* Tab content */}
      {activeTab === 'intel' && (
      <div>

      {/* Hero */}
      <div style={{ padding: isMobile ? '48px 20px' : '64px 40px',
        maxWidth:900, margin:'0 auto', textAlign:'center' }}>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
          letterSpacing:'.25em', color:RED, marginBottom:16 }}>
          FEMSAIDIA KENYA · THINK TANK
        </p>
        <h1 style={{ fontFamily:"'Lora',serif", fontSize: isMobile ? 32 : 52,
          fontWeight:700, color:TXT, lineHeight:1.15, marginBottom:20 }}>
          A woman is killed every<br/>
          <span style={{ color:RED }}>47 hours</span> in Kenya.
        </h1>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:16, color:MUT,
          lineHeight:1.9, maxWidth:640, margin:'0 auto 28px' }}>
          SaInt is the intelligence infrastructure behind 10 specific, fundable,
          executable projects that interrupt the pipeline from misogyny to murder.
          This is not another awareness campaign. This is architecture.
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <a href="#projects"
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
              padding:'12px 24px', background:RED, color:TXT, textDecoration:'none',
              letterSpacing:'.06em' }}>
            See the 10 projects →
          </a>
          <a href="https://uuluuhltphgwfblcghlp.supabase.co/storage/v1/object/public/public-assets/intel-brief-latest.pdf?v=20260606"
            target="_blank" rel="noopener noreferrer"
            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
              padding:'12px 24px', background:'transparent',
              border:`1px solid ${BD}`, color:TXT, textDecoration:'none',
              letterSpacing:'.06em' }}>
            Download Intel Brief
          </a>
        </div>
      </div>

      {/* Intelligence panel */}
      <div style={{ padding:'0 24px', maxWidth:1100, margin:'0 auto 2px' }}>
        <IntelPanel intel={intel}/>
      </div>

      {/* Context strip */}
      <div style={{ background:'rgba(138,16,48,0.08)', borderTop:`1px solid ${BD}`,
        borderBottom:`1px solid ${BD}`, padding:'24px 24px',
        maxWidth:'100%', marginBottom:2 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:16 }}>
          {[
            { icon:'🌍', label:'Regional context', text:'Kenya femicide rate is among the highest in Sub-Saharan Africa. East African governments have no shared intelligence framework for tracking or responding to the crisis.' },
            { icon:'📱', label:'The digital accelerant', text:'Manosphere content on TikTok, YouTube and Telegram reaches millions of Kenyan boys daily. Platform accountability is non-existent. Our scanner tracks this in real time.' },
            { icon:'⚖️', label:'The accountability gap', text:'Fewer than 12% of documented femicide cases in our tracker have resulted in a conviction. The Maputo Protocol and SDG 16 commitments are unmet.' },
          ].map((c,i) => (
            <div key={i}>
              <div style={{ fontSize:24, marginBottom:8 }}>{c.icon}</div>
              <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
                letterSpacing:'.15em', color:GOLD, marginBottom:6 }}>{c.label.toUpperCase()}</p>
              <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12,
                color:MUT, lineHeight:1.8 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Projects moved to Projects tab */}

      </div>
      )}

      {activeTab === 'projects' && (
        <div style={{ padding: isMobile ? '24px 16px' : '32px 24px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
                letterSpacing:'.2em', color:RED, marginBottom:6 }}>THE 10 PROJECTS</p>
              <h2 style={{ fontFamily:"'Lora',serif", fontSize:26, fontWeight:700, color:TXT }}>
                Specific. Fundable. Executable.
              </h2>
            </div>
            <div style={{ display:'flex', gap:2 }}>
              {['all','Understand','Interrupt','Build'].map(l => (
                <button key={l} onClick={()=>{ setLane(l); track('lane_filter', { lane:l }) }}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                    padding:'7px 14px', border:'none', cursor:'pointer',
                    background: lane===l ? (l==='all'?RED:LANE_META[l]?.color||RED) : SURF,
                    color: lane===l ? TXT : MUT }}>
                  {l==='all'?'All':LANE_META[l].icon+' '+l}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:2 }}>
            {projects.map(p => (
              <ProjectCard key={p.id} p={p} intel={intel} onFund={setFundProject}/>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'briefs' && (
        <div style={{ padding: isMobile ? '24px 16px' : '32px 24px', maxWidth:900, margin:'0 auto' }}>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
            letterSpacing:'.2em', color:RED, marginBottom:12 }}>INTELLIGENCE BRIEFS</p>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:26, fontWeight:700,
            color:TXT, marginBottom:20 }}>Monthly evidence for policymakers.</h2>
          <div style={{ background:CARD, border:`1px solid ${BD}`, borderTop:`3px solid ${RED}`,
            padding:24, marginBottom:8 }}>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
              letterSpacing:'.12em', color:GOLD, marginBottom:8 }}>LATEST BRIEF</p>
            <p style={{ fontFamily:"'Lora',serif", fontSize:18, fontWeight:700,
              color:TXT, marginBottom:16 }}>FemSaidia Intel Brief — June 2026</p>
            <div style={{ display:'flex', gap:10 }}>
              <a href="https://uuluuhltphgwfblcghlp.supabase.co/storage/v1/object/public/public-assets/intel-brief-latest.pdf?v=20260606"
                target="_blank" rel="noopener noreferrer"
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                  padding:'10px 20px', background:RED, color:TXT,
                  textDecoration:'none', letterSpacing:'.06em' }}>
                📄 Download PDF →
              </a>
              <a href="https://uuluuhltphgwfblcghlp.supabase.co/storage/v1/object/public/public-assets/intel-brief-latest.pdf?v=20260606"
                target="_blank" rel="noopener noreferrer"
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                  padding:'10px 20px', background:'transparent',
                  border:`1px solid ${BD}`, color:TXT,
                  textDecoration:'none', letterSpacing:'.06em' }}>
                Open in browser →
              </a>
            </div>
          </div>
          <div style={{ background:CARD, border:`1px solid ${BD}`, padding:20 }}>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12,
              color:MUT, lineHeight:1.8 }}>
              Intel Briefs are published fortnightly — on the 1st and 15th of each month.
              Each brief synthesises the latest misogyny index data, scanner catches,
              community pulse and case tracker updates into a 2-page document formatted
              for Cabinet Secretaries, donors and county governors.
              To receive briefs by email, contact halafu@femsaidiakenya.org.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'about' && <AboutTab/>}

      {/* Mobile bottom nav */}
      {isMobile && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200,
          background:SURF, borderTop:`1px solid ${BD}`,
          display:'flex', height:60 }}>
          {[
            { id:'intel',    icon:'⚡', label:'Intel' },
            { id:'projects', icon:'🔨', label:'Projects' },
            { id:'briefs',   icon:'📄', label:'Briefs' },
            { id:'about',    icon:'🌍', label:'About' },
          ].map(t => (
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              style={{ flex:1, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:2,
                border:'none', cursor:'pointer', background:'transparent',
                borderTop: activeTab===t.id ? `2px solid ${RED}` : '2px solid transparent' }}>
              <span style={{ fontSize:18 }}>{t.icon}</span>
              <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                fontWeight:700, color: activeTab===t.id ? TXT : MUT,
                letterSpacing:'.06em' }}>{t.label}</span>
            </button>
          ))}
          {!isInstalled && (
            <button onClick={handleInstall}
              style={{ flex:1, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:3,
                border:'none', cursor:'pointer',
                background:'rgba(200,160,64,0.15)',
                borderTop:'2px solid #C8A040' }}>
              <span style={{ fontSize:14, background:'#C8A040',
                borderRadius:'50%', width:24, height:24,
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#0A0D14', fontWeight:700 }}>↓</span>
              <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                fontWeight:700, color:'#C8A040', letterSpacing:'.06em' }}>Install</span>
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <footer style={{ background:SURF, borderTop:`1px solid ${BD}`,
        padding:'28px 24px', marginTop:32 }}>
        <div style={{ maxWidth:1100, margin:'0 auto',
          display:'flex', justifyContent:'space-between',
          alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <p style={{ fontFamily:"'Lora',serif", fontSize:18, fontWeight:700, marginBottom:4 }}>
              <span style={{ color:TXT }}>Sa</span><span style={{ color:RED }}><span style={{ position:'relative', display:'inline-block' }}>I<span style={{ position:'absolute', top:'-0.04em', left:'50%', transform:'translateX(-50%)', width:'0.18em', height:'0.18em', borderRadius:'50%', background:'#FFFFFF', display:'block' }}/></span>nt</span>
              <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10,
                color:MUT, marginLeft:8, fontWeight:400 }}>· Saidia Intelligence</span>
            </p>
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:MUT }}>
              A FemSaidia Kenya intelligence initiative · femsaidiakenya.org
            </p>
          </div>
          <div style={{ display:'flex', gap:16 }}>
            <a href="mailto:halafu@femsaidiakenya.org"
              style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                color:MUT, textDecoration:'none' }}>
              halafu@femsaidiakenya.org
            </a>
            <a href="https://uuluuhltphgwfblcghlp.supabase.co/storage/v1/object/public/public-assets/intel-brief-latest.pdf?v=20260606"
              target="_blank" rel="noopener noreferrer"
              style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                color:RED, textDecoration:'none', fontWeight:700 }}>
              Latest Intel Brief →
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {fundProject && <FundModal project={fundProject} onClose={()=>setFundProject(null)}/>}
      {contactOpen && <FundModal project={{id:'general',title:'FemSaidia Kenya Partnership'}} onClose={()=>setContactOpen(false)}/>}
    </div>
  )
}

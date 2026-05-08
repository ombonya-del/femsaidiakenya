import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { ExternalLink, AlertTriangle, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const A   = '#8A1030'
const A2  = '#8A4010'
const BD  = '#B89AAA'
const CRD = '#C4AABB'
const TXT = '#180410'
const MUT = '#7A4A60'

// ── MISOGYNY METER GAUGE ──────────────────────────────────────────────────────
function MisogynyGauge({ score }) {
  const pct     = Math.min(100, Math.max(0, score || 0))
  const angle   = -135 + (pct / 100) * 270
  const color   = pct >= 70 ? '#8A1030' : pct >= 50 ? '#C05000' : pct >= 30 ? '#CA8A04' : '#166534'
  const label   = pct >= 70 ? 'Critical' : pct >= 50 ? 'High' : pct >= 30 ? 'Elevated' : 'Moderate'

  return (
    <div style={{ textAlign:'center' }}>
      <svg viewBox="0 0 200 130" style={{ width:'100%', maxWidth:260 }}>
        {/* Background arc */}
        <path d="M 20 110 A 80 80 0 1 1 180 110" fill="none" stroke="#D4C4C4" strokeWidth="16" strokeLinecap="round"/>
        {/* Score arc */}
        <path d="M 20 110 A 80 80 0 1 1 180 110" fill="none" stroke={color} strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 251} 251`}/>
        {/* Needle */}
        <line
          x1="100" y1="110"
          x2={100 + 65 * Math.cos((angle - 90) * Math.PI / 180)}
          y2={110 + 65 * Math.sin((angle - 90) * Math.PI / 180)}
          stroke={color} strokeWidth="3" strokeLinecap="round"/>
        <circle cx="100" cy="110" r="6" fill={color}/>
        {/* Labels */}
        <text x="16" y="128" fontSize="9" fill={MUT} fontFamily="'Nunito Sans',sans-serif">Low</text>
        <text x="88" y="28"  fontSize="9" fill={MUT} fontFamily="'Nunito Sans',sans-serif">Mid</text>
        <text x="168" y="128"fontSize="9" fill={MUT} fontFamily="'Nunito Sans',sans-serif">High</text>
        {/* Score */}
        <text x="100" y="90" fontSize="28" fill={color} textAnchor="middle"
          fontFamily="'Lora',serif" fontWeight="700">{pct}</text>
        <text x="100" y="106" fontSize="11" fill={MUT} textAnchor="middle"
          fontFamily="'Nunito Sans',sans-serif">/100</text>
      </svg>
      <div style={{ fontFamily:"'Lora',serif", fontSize:18, fontWeight:700, color, marginTop:-8 }}>{label}</div>
      <p style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif", marginTop:4 }}>
        Today's misogyny index
      </p>
    </div>
  )
}

const SentimentColors = {
  alarming: { bg:'#E8D0C8', bc:'#B07060', tc:'#6A1008', label:'Alarming'  },
  negative: { bg:'#DCC8B8', bc:'#A07040', tc:'#5A2808', label:'Negative'  },
  neutral:  { bg:'#DDD0D0', bc:'#B89AAA', tc:'#5A3050', label:'Neutral'   },
  positive: { bg:'#C8D8C0', bc:'#60A050', tc:'#1A4810', label:'Positive'  },
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:CRD, color:TXT, border:`1px solid ${BD}`, fontFamily:"'Nunito Sans',sans-serif", fontSize:11, padding:'8px 12px' }}>
      <div style={{ opacity:.6, marginBottom:4 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ color: p.value >= 70 ? A : p.value >= 50 ? A2 : '#166534' }}>
          Index: <strong>{p.value}</strong>
          {p.payload.high_alert && ' ⚠ High alert'}
        </div>
      ))}
    </div>
  )
}

export default function SocialsSentimentTab() {
  const [index, setIndex]       = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const today                   = index[index.length - 1]
  const yesterday               = index[index.length - 2]
  const trend                   = today && yesterday
    ? today.score - yesterday.score
    : 0

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [idxRes, artRes] = await Promise.all([
      supabase.from('misogyny_index').select('*').order('date', { ascending:true }).limit(30),
      supabase.from('sentiment_articles').select('*').order('scanned_at', { ascending:false }).limit(50),
    ])
    setIndex(idxRes.data || [])
    setArticles(artRes.data || [])
    setLoading(false)
  }

  const filtered = filter === 'all'
    ? articles
    : articles.filter(a => a.sentiment === filter)

  const techCount = articles.filter(a => a.tech_facilitated).length
  const highMiso  = articles.filter(a => a.misogyny_score >= 7).length

  return (
    <div className="fade-up" style={{ width:'100%' }}>

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${BD}`, paddingBottom:20, marginBottom:24 }}>
        <p className="label" style={{ marginBottom:8, color:A }}>
          ● Live pulse · Updated every 6 hours
        </p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <h1 className="serif" style={{ fontSize:36, fontWeight:700, color:TXT }}>
            Socials & Sentiment
          </h1>
          <button onClick={load} style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:600, padding:'8px 14px', border:`1px solid ${BD}`, background:CRD, color:MUT, cursor:'pointer' }}>
            <RefreshCw size={12}/> Refresh
          </button>
        </div>
        <p style={{ fontSize:13, color:MUT, marginTop:8, fontFamily:"'Nunito Sans',sans-serif", fontWeight:300, lineHeight:1.8, maxWidth:680 }}>
          Real-time sentiment tracking across Kenyan news and online platforms.
          The Misogyny Index is a composite score (0–100) derived from the level of
          misogynistic content detected in scanned articles each day.
        </p>
      </div>

      {/* Top row: Gauge + Stats + Trend */}
      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:2, marginBottom:2 }}>

        {/* Gauge */}
        <div className="card" style={{ padding:24, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          {loading ? (
            <p style={{ color:MUT, fontSize:12, fontFamily:"'Nunito Sans',sans-serif" }}>Loading...</p>
          ) : (
            <>
              <MisogynyGauge score={today?.score || 0}/>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10 }}>
                {trend > 0
                  ? <TrendingUp size={14} color={A}/>
                  : trend < 0
                    ? <TrendingDown size={14} color="#166534"/>
                    : <Minus size={14} color={MUT}/>
                }
                <span style={{ fontSize:12, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700,
                  color: trend > 0 ? A : trend < 0 ? '#166534' : MUT }}>
                  {trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1)} from yesterday
                </span>
              </div>
              {today?.high_alert && (
                <div style={{ marginTop:10, background:'#E8D0C8', border:`1px solid #B07060`, padding:'8px 14px', display:'flex', gap:6, alignItems:'center' }}>
                  <AlertTriangle size={12} color={A}/>
                  <p style={{ fontSize:11, color:'#6A1008', fontFamily:"'Nunito Sans',sans-serif", fontWeight:700 }}>High alert day</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:2 }}>
          {[
            { v: articles.length,  l:'Articles scanned today',      s:'Across 5 Kenyan news sources',  c:TXT },
            { v: highMiso,         l:'High misogyny articles',       s:'Misogyny score ≥ 7/10',         c:A   },
            { v: techCount,        l:'Tech-facilitated incidents',   s:'Detected in scanned content',   c:A2  },
            { v: articles.filter(a=>a.gbv_relevance>=8).length, l:'High-relevance GBV articles', s:'GBV relevance ≥ 8/10', c:A },
          ].map((s,i) => (
            <div key={i} style={{ background:CRD, border:`1px solid ${BD}`, padding:'20px 22px', borderLeft:`4px solid ${s.c}` }}>
              <div className="serif" style={{ fontSize:40, fontWeight:700, color:s.c, lineHeight:1 }}>{s.v}</div>
              <p style={{ fontSize:13, color:TXT, fontWeight:600, marginTop:8, fontFamily:"'Nunito Sans',sans-serif" }}>{s.l}</p>
              <p style={{ fontSize:11, color:MUT, marginTop:4, fontFamily:"'Nunito Sans',sans-serif" }}>{s.s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 30-day trend chart */}
      <div className="card" style={{ padding:24, marginBottom:2 }}>
        <div className="section-head">
          <span>Misogyny index · 30-day trend</span>
          <span style={{ color:A }}>Higher = more misogynistic content detected</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={index} margin={{ left:0, right:12, top:8, bottom:0 }}>
            <defs>
              <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={A} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={A} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date"
              tickFormatter={d => new Date(d).toLocaleDateString('en-KE',{day:'numeric',month:'short'})}
              tick={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fill:MUT }}
              tickLine={false} axisLine={{ stroke:BD }} interval={4}/>
            <YAxis domain={[0,100]}
              tick={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fill:MUT }}
              tickLine={false} axisLine={false}/>
            <Tooltip content={<ChartTip/>}/>
            <ReferenceLine y={70} stroke={A} strokeDasharray="3 3"
              label={{ value:'High alert threshold', position:'insideTopLeft', fill:A, fontSize:10, fontFamily:"'Nunito Sans',sans-serif" }}/>
            <ReferenceLine y={50} stroke={A2} strokeDasharray="2 2"/>
            <Area type="monotone" dataKey="score" name="Misogyny index"
              stroke={A} strokeWidth={2} fill="url(#mGrad)" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
        <p style={{ fontSize:11, color:MUT, marginTop:6, fontFamily:"'Nunito Sans',sans-serif" }}>
          Red dashed line = high alert threshold (70+) · Orange dashed = elevated (50+)
        </p>
      </div>

      {/* Article feed */}
      <div className="card" style={{ padding:24, marginTop:2 }}>
        <div className="section-head">
          <span>Scanned articles · classified by Claude AI</span>
          <span style={{ display:'flex', gap:6 }}>
            {['all','alarming','negative','neutral','positive'].map(f => (
              <button key={f} onClick={()=>setFilter(f)}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  padding:'3px 10px', border:`1px solid ${filter===f?A:BD}`,
                  background:filter===f?A:CRD, color:filter===f?'#F0D0D8':MUT,
                  cursor:'pointer', letterSpacing:'.04em', textTransform:'capitalize' }}>
                {f}
              </button>
            ))}
          </span>
        </div>

        {loading ? (
          <p style={{ color:MUT, fontSize:12 }}>Loading articles...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color:MUT, fontSize:12, fontFamily:"'Nunito Sans',sans-serif" }}>No articles found for this filter.</p>
        ) : (
          filtered.map((a, i) => {
            const sc = SentimentColors[a.sentiment] || SentimentColors.neutral
            return (
              <div key={a.id} style={{ padding:'14px 0', borderBottom: i < filtered.length-1 ? `1px solid ${BD}` : 'none' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                      <span className="badge" style={{ background:sc.bg, borderColor:sc.bc, color:sc.tc }}>{sc.label}</span>
                      <span style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>{a.source_name}</span>
                      <span style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>
                        {a.published_at ? new Date(a.published_at).toLocaleDateString('en-KE') : ''}
                      </span>
                      {a.tech_facilitated && (
                        <span className="badge" style={{ background:'#DCC8B8', borderColor:'#A07040', color:'#5A2808' }}>
                          Tech: {a.tech_platforms?.join(', ')}
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight:700, fontSize:14, color:TXT, marginBottom:5, fontFamily:"'Nunito Sans',sans-serif" }}>{a.article_title}</div>
                    <p style={{ fontSize:12, color:MUT, lineHeight:1.7, fontFamily:"'Nunito Sans',sans-serif" }}>{a.article_snippet}</p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0, alignItems:'flex-end' }}>
                    <a href={a.article_url} target="_blank" rel="noopener noreferrer"
                      style={{ color:A, display:'inline-flex', alignItems:'center', gap:3, fontSize:11, fontFamily:"'Nunito Sans',sans-serif", fontWeight:600, textDecoration:'none' }}>
                      Read <ExternalLink size={10}/>
                    </a>
                    <div style={{ display:'flex', gap:4 }}>
                      <div style={{ textAlign:'center', background:CRD, border:`1px solid ${BD}`, padding:'3px 7px' }}>
                        <div style={{ fontSize:13, fontWeight:700, color:A, fontFamily:"'Nunito Sans',sans-serif" }}>{a.misogyny_score}</div>
                        <div style={{ fontSize:9, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>miso</div>
                      </div>
                      <div style={{ textAlign:'center', background:CRD, border:`1px solid ${BD}`, padding:'3px 7px' }}>
                        <div style={{ fontSize:13, fontWeight:700, color:A2, fontFamily:"'Nunito Sans',sans-serif" }}>{a.gbv_relevance}</div>
                        <div style={{ fontSize:9, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>GBV</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Methodology note */}
      <div style={{ paddingTop:14, marginTop:14, borderTop:`1px solid ${BD}` }}>
        <p className="label" style={{ marginBottom:6 }}>Methodology</p>
        <p style={{ fontSize:11, color:MUT, lineHeight:2, fontFamily:"'Nunito Sans',sans-serif" }}>
          Articles are fetched every 6 hours from Nation Africa, Standard Media, The Star Kenya, Citizen Digital and Capital FM.
          Each article is classified by Claude AI on GBV relevance (0–10), misogyny level (0–10), sentiment, and tech-facilitation detection.
          The Misogyny Index is the daily mean misogyny score scaled to 0–100.
          Scores above 70 trigger a High Alert flag. Data is indicative and may contain classification errors.
        </p>
      </div>
    </div>
  )
}
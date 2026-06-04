import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ExternalLink, Smartphone, RefreshCw } from 'lucide-react'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const A   = '#8A1030'
const A2  = '#8A4010'
const BD  = '#B89AAA'
const CRD = '#C4AABB'
const TXT = '#180410'
const MUT = '#7A4A60'

const PLATFORM_COLORS = {
  'WhatsApp':   '#25D366',
  'Instagram':  '#E1306C',
  'Facebook':   '#1877F2',
  'TikTok':     '#000000',
  'Tinder':     '#FF4B2B',
  'Bumble':     '#FFC629',
  'Telegram':   '#2CA5E0',
  'Airbnb':     '#FF5A5F',
  'Snapchat':   '#FFFC00',
  'Twitter':    '#1DA1F2',
  'Other':      '#9B6080',
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:CRD, color:TXT, border:`1px solid ${BD}`, fontFamily:"'Nunito Sans',sans-serif", fontSize:11, padding:'8px 12px' }}>
      <div style={{ opacity:.6, marginBottom:4 }}>{label}</div>
      {payload.map((p,i) => <div key={i}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  )
}

export default function TechTrackerTab() {
  const mobile = window.innerWidth < 768

  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [platform, setPlatform] = useState('all')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sentiment_articles')
      .select('*')
      .eq('tech_facilitated', true)
      .order('scanned_at', { ascending:false })
      .limit(100)
    setArticles(data || [])
    setLoading(false)
  }

  const platformCounts = {}
  articles.forEach(a => {
    (a.tech_platforms || []).forEach(p => {
      platformCounts[p] = (platformCounts[p] || 0) + 1
    })
  })
  const platformData = Object.entries(platformCounts)
    .sort((a,b) => b[1]-a[1])
    .map(([name, count]) => ({ name, count }))

  const allPlatforms = [...new Set(articles.flatMap(a => a.tech_platforms || []))]

  const filtered = platform === 'all'
    ? articles
    : articles.filter(a => a.tech_platforms?.includes(platform))

  const SentimentColors = {
    alarming: { bg:'#E8D0C8', bc:'#B07060', tc:'#6A1008' },
    negative: { bg:'#DCC8B8', bc:'#A07040', tc:'#5A2808' },
    neutral:  { bg:'#DDD0D0', bc:'#B89AAA', tc:'#5A3050' },
    positive: { bg:'#C8D8C0', bc:'#60A050', tc:'#1A4810' },
  }

  return (
    <div className="fade-up" style={{ width:'100%' }}>

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${BD}`, paddingBottom:20, marginBottom:24 }}>
        <p className="label" style={{ marginBottom:8, color:A }}>● Technology-facilitated GBV tracker</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <h1 className="serif" style={{ fontSize: mobile ? 28 : 36, fontWeight:700, color:TXT }}>Tech Tracker</h1>
          <button onClick={load} style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:600, padding:'8px 14px', border:`1px solid ${BD}`, background:CRD, color:MUT, cursor:'pointer', flexShrink:0 }}>
            <RefreshCw size={12}/> Refresh
          </button>
        </div>
        <p style={{ fontSize:13, color:MUT, marginTop:8, fontFamily:"'Nunito Sans',sans-serif", fontWeight:300, lineHeight:1.8, maxWidth:720 }}>
          Automatically scrapes Kenyan news and online sources for instances where technology —
          dating apps, Airbnb, social media — was used to facilitate gender-based violence.
          Classified by Claude AI. Updated every 6 hours.
        </p>
      </div>

      {/* Stats — 2×2 on mobile */}
      <div style={{ display:'grid', gridTemplateColumns: mobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:2, marginBottom:2 }}>
        {[
          { v:articles.length,                                 l:'Tech-facilitated incidents',   s:'Detected in scanned content',            c:A  },
          { v:platformData.length,                             l:'Platforms implicated',         s:'Across all scanned articles',             c:A2 },
          { v:platformData[0]?.name || '—',                   l:'Most common platform',         s:`${platformData[0]?.count || 0} mentions`, c:A  },
          { v:articles.filter(a=>a.misogyny_score>=7).length, l:'High misogyny tech incidents', s:'Misogyny score ≥ 7/10',                   c:A  },
        ].map((s,i) => (
          <div key={i} style={{ background:CRD, border:`1px solid ${BD}`, padding:'18px 16px', borderLeft:`4px solid ${s.c}` }}>
            <div className="serif" style={{ fontSize: typeof s.v === 'number' ? (mobile ? 32 : 40) : (mobile ? 18 : 22), fontWeight:700, color:s.c, lineHeight:1 }}>{s.v}</div>
            <p style={{ fontSize: mobile ? 12 : 13, color:TXT, fontWeight:600, marginTop:8, fontFamily:"'Nunito Sans',sans-serif" }}>{s.l}</p>
            <p style={{ fontSize:11, color:MUT, marginTop:4, fontFamily:"'Nunito Sans',sans-serif" }}>{s.s}</p>
          </div>
        ))}
      </div>

      {/* Charts — stacked on mobile */}
      <div style={{ display:'grid', gridTemplateColumns: '1fr', gap:2, marginBottom:2 }}>

        {/* Platform bar chart */}
        <div className="card" style={{ padding:24 }}>
          <div className="section-head">
            <span>Platform frequency · most implicated</span>
            <span style={{ color:A }}>Mentions</span>
          </div>
          {platformData.length === 0 ? (
            <p style={{ color:MUT, fontSize:12, fontFamily:"'Nunito Sans',sans-serif" }}>No data yet — scanner will populate this.</p>
          ) : (
            <ResponsiveContainer width="100%" height={mobile ? 180 : 250}>
              <BarChart data={platformData} margin={{ left:8, right:20, top:4, bottom:0 }}>
                <XAxis dataKey="name"
                  tick={{ fontFamily:"'Nunito Sans',sans-serif", fontSize: mobile ? 9 : 11, fill:MUT }}
                  tickLine={false} axisLine={{ stroke:BD }}/>
                <YAxis hide={true}/>
                <Tooltip content={<ChartTip/>}/>
                <Bar dataKey="count" name="Mentions" radius={[2,2,0,0]} label={{ position:'top', fontSize:10, fill:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>
                  {platformData.map((entry, i) => (
                    <Cell key={i} fill={PLATFORM_COLORS[entry.name] || A}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platform breakdown — horizontal bar chart */}
        <div className="card" style={{ padding:24 }}>
          <div className="section-head">
            <span>Platforms detected · share of incidents</span>
            <span style={{ color:A }}>%</span>
          </div>
          {platformData.length === 0 ? (
            <p style={{ color:MUT, fontSize:12, fontFamily:"'Nunito Sans',sans-serif" }}>No platforms detected yet.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {platformData.map((p, i) => {
                const pct = articles.length ? Math.round((p.count/articles.length)*100) : 0
                return (
                  <div key={i}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:TXT, fontFamily:"'Nunito Sans',sans-serif" }}>{p.name}</span>
                      <span style={{ fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>{p.count} · {pct}%</span>
                    </div>
                    <div style={{ height:10, background:'#E8D8E0', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:PLATFORM_COLORS[p.name] || A, borderRadius:2, transition:'width 0.6s ease' }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* How tech is being used — 2×2 on mobile */}
      <div className="card" style={{ padding:24, marginBottom:2 }}>
        <div className="section-head">
          <span>How technology is being weaponised — pattern summary</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns: mobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:2 }}>
          {[
            { icon:'💬', t:'Dating apps',    b:'Perpetrators create fake profiles on Tinder, Bumble and Badoo to identify and groom victims, establishing trust before arranging in-person meetings.' },
            { icon:'🏠', t:'Airbnb',         b:'Private rental properties used as isolated locations where victims are lured under the pretence of legitimate meetings or dates.' },
            { icon:'📸', t:'Social media',   b:'Instagram, TikTok and Facebook used to identify targets, gather personal information, and in some cases to publicly humiliate survivors.' },
            { icon:'📱', t:'WhatsApp groups',b:'Private WhatsApp groups used to coordinate harassment campaigns, share non-consensual intimate images, and organise attacks against women.' },
          ].map((p, i) => (
            <div key={i} style={{ background:'#BC9EAE', border:`1px solid ${BD}`, padding:16 }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{p.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:TXT, fontFamily:"'Nunito Sans',sans-serif", marginBottom:6 }}>{p.t}</div>
              <p style={{ fontSize:11, color:MUT, lineHeight:1.7, fontFamily:"'Nunito Sans',sans-serif" }}>{p.b}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Article feed */}
      <div className="card" style={{ padding:24, marginTop:2 }}>
        <div className="section-head" style={{ flexWrap:'wrap', gap:8 }}>
          <span>Tech-facilitated incidents · article feed</span>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            <button onClick={()=>setPlatform('all')}
              style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700, padding:'3px 10px', border:`1px solid ${platform==='all'?A:BD}`, background:platform==='all'?A:CRD, color:platform==='all'?'#F0D0D8':MUT, cursor:'pointer' }}>
              All
            </button>
            {allPlatforms.map(p => (
              <button key={p} onClick={()=>setPlatform(p)}
                style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700, padding:'3px 10px', border:`1px solid ${platform===p?A:BD}`, background:platform===p?A:CRD, color:platform===p?'#F0D0D8':MUT, cursor:'pointer' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color:MUT, fontSize:12 }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:32 }}>
            <Smartphone size={28} color={MUT} style={{ margin:'0 auto 10px' }}/>
            <p style={{ fontSize:13, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>
              No tech-facilitated incidents detected yet. The scanner will populate this as it runs.
            </p>
          </div>
        ) : (
          filtered.map((a, i) => {
            const sc = SentimentColors[a.sentiment] || SentimentColors.neutral
            return (
              <div key={a.id} style={{ padding:'14px 0', borderBottom: i < filtered.length-1 ? `1px solid ${BD}` : 'none' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                  {a.thumbnail_url && !mobile && (
                    <a href={a.article_url} target="_blank" rel="noopener noreferrer" style={{ flexShrink:0, display:'block', position:'relative' }}>
                      <img src={a.thumbnail_url} alt={a.article_title} style={{ width:110, height:62, objectFit:'cover', display:'block' }}/>
                      {a.content_type==='video' && (
                        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.35)' }}>
                          <span style={{ fontSize:18, color:'#fff' }}>▶</span>
                        </div>
                      )}
                    </a>
                  )}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, flexWrap:'wrap' }}>
                      {a.content_type==='video' && <span style={{ fontSize:10, background:'#DC2626', color:'#fff', padding:'1px 6px', fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, flexShrink:0 }}>▶ VIDEO</span>}
                      {(a.tech_platforms || []).map((p,pi) => (
                        <span key={pi} style={{ display:'inline-flex', alignItems:'center', gap:4, fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700, padding:'2px 8px', background:PLATFORM_COLORS[p] || A, color:'#fff', flexShrink:0 }}>
                          {p}
                        </span>
                      ))}
                      <span className="badge" style={{ background:sc.bg, borderColor:sc.bc, color:sc.tc, flexShrink:0 }}>
                        {a.sentiment}
                      </span>
                    </div>
                    <div style={{ fontWeight:700, fontSize: mobile ? 13 : 14, color:TXT, marginBottom:5, fontFamily:"'Nunito Sans',sans-serif", wordBreak:'break-word' }}>{a.article_title}</div>
                    {a.tech_details && (
                      <div style={{ background:'#DCC8B8', border:`1px solid #A07040`, padding:'6px 10px', marginBottom:6, fontSize:11, color:'#5A2808', fontFamily:"'Nunito Sans',sans-serif", lineHeight:1.6, wordBreak:'break-word' }}>
                        <strong>Tech involvement:</strong> {(() => {
                          try {
                            const d = typeof a.tech_details === 'string' && a.tech_details.trim().startsWith('{')
                              ? JSON.parse(a.tech_details) : null
                            return d ? (d.involvement || d.method || d.description || a.tech_details) : a.tech_details
                          } catch(e) { return a.tech_details }
                        })()}
                      </div>
                    )}
                    <p style={{ fontSize:12, color:MUT, lineHeight:1.7, fontFamily:"'Nunito Sans',sans-serif" }}>{a.article_snippet}</p>
                    <a href={a.article_url} target="_blank" rel="noopener noreferrer"
                      style={{ color:A, display:'inline-flex', alignItems:'center', gap:3, fontSize:11, fontFamily:"'Nunito Sans',sans-serif", fontWeight:600, textDecoration:'none', marginTop:6 }}>
                      Read <ExternalLink size={10}/>
                    </a>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Methodology */}
      <div style={{ paddingTop:14, marginTop:14, borderTop:`1px solid ${BD}` }}>
        <p className="label" style={{ marginBottom:6 }}>How Tech Tracker works</p>
        <p style={{ fontSize:11, color:MUT, lineHeight:2, fontFamily:"'Nunito Sans',sans-serif" }}>
          The RSS Scanner fetches articles every 6 hours from 5 Kenyan news sources and filters for GBV-related content.
          Claude AI then classifies each article for tech-facilitation — identifying specific platforms, describing the method used,
          and scoring misogyny and GBV relevance on a 0–10 scale.
          Articles with a GBV relevance score of 4 or above are stored and displayed here.
          This is an automated system — classifications may contain errors and should not be used as sole evidence in legal proceedings.
        </p>
      </div>
    </div>
  )
}
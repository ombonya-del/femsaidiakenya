import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { ExternalLink, AlertTriangle, TrendingUp, TrendingDown, Minus,
         RefreshCw, ChevronDown, ChevronUp, X, Cpu, Radio, Play,
         FileText, Zap, Eye } from 'lucide-react'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const A   = '#8A1030'
const A2  = '#8A4010'
const BD  = '#B89AAA'
const CRD = '#C4AABB'
const BG  = '#D4BEC4'
const TXT = '#180410'
const MUT = '#7A4A60'

// ── SCORE COLOR ───────────────────────────────────────────────────────────────
const scoreColor = (s) =>
  s >= 8 ? '#CC1010' : s >= 6 ? '#C05010' : s >= 4 ? '#CA8A04' : '#2D7A3A'

const scoreLabel = (s) =>
  s >= 8 ? 'Critical' : s >= 6 ? 'High' : s >= 4 ? 'Elevated' : 'Low'

// ── MISOGYNY GAUGE ────────────────────────────────────────────────────────────
function MisogynyGauge({ score }) {
  const pct   = Math.min(100, Math.max(0, score || 0))
  const angle = -135 + (pct / 100) * 270
  const color = pct >= 70 ? '#CC1010' : pct >= 50 ? '#C05010' : pct >= 30 ? '#CA8A04' : '#2D7A3A'
  const r = 68, cx = 80, cy = 80
  const toRad = (d) => (d * Math.PI) / 180
  const arcPt = (deg) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  })
  const startDeg = 225, endDeg = startDeg + (pct / 100) * 270
  const s = arcPt(startDeg), e = arcPt(endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  const needlePt = arcPt(angle)
  return (
    <svg viewBox="0 0 160 120" style={{ width:180, height:135 }}>
      <path d={`M ${arcPt(225).x} ${arcPt(225).y} A ${r} ${r} 0 1 1 ${arcPt(495).x} ${arcPt(495).y}`}
        fill="none" stroke={BD} strokeWidth="10" strokeLinecap="round"/>
      {pct > 0 && (
        <path d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"/>
      )}
      <line x1={cx} y1={cy} x2={needlePt.x} y2={needlePt.y}
        stroke={TXT} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="5" fill={TXT}/>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="22" fontWeight="700"
        fill={color} fontFamily="Georgia,serif">{pct}%</text>
      <text x={cx} y={cy + 36} textAnchor="middle" fontSize="10" fill={MUT}
        fontFamily="Nunito Sans,sans-serif">{scoreLabel(pct / 10)}</text>
    </svg>
  )
}

// ── ARTICLE MODAL ─────────────────────────────────────────────────────────────
function ArticleModal({ article, onClose }) {
  if (!article) return null
  const mColor = scoreColor(article.misogyny_score)
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(24,4,16,0.7)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:BG, border:`2px solid ${BD}`, maxWidth:680, width:'100%',
        maxHeight:'85vh', overflowY:'auto', position:'relative' }}
        onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div style={{ background:TXT, padding:'16px 20px', display:'flex',
          justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
              {article.content_type && (
                <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                  fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase',
                  padding:'2px 8px', background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)' }}>
                  {article.content_type}
                </span>
              )}
              <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase',
                padding:'2px 8px', background:mColor, color:'#fff' }}>
                Misogyny {article.misogyny_score}/10
              </span>
              {article.tech_facilitated && (
                <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                  fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase',
                  padding:'2px 8px', background:'#8A4010', color:'#fff' }}>
                  Tech-facilitated
                </span>
              )}
            </div>
            <div style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:700,
              color:'#fff', lineHeight:1.4 }}>
              {article.article_title || article.article_url || article.source_name}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)',
            cursor:'pointer', fontSize:20, padding:0, flexShrink:0 }}>
            <X size={18}/>
          </button>
        </div>

        {/* Video embed or thumbnail */}
        {(() => {
          const videoUrl = article.article_url || ''
          const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
          if (ytMatch) {
            return (
              <div style={{ position:'relative', paddingBottom:'56.25%', height:0 }}>
                <iframe
                  src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                  style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}
                  allowFullScreen title={article.title || 'Video'}/>
              </div>
            )
          }
          if (article.thumbnail_url) {
            return (
              <img src={article.thumbnail_url} alt=""
                style={{ width:'100%', height:200, objectFit:'cover' }}
                onError={e => e.target.style.display='none'}/>
            )
          }
          return null
        })()}

        {/* Intelligence data */}
        <div style={{ padding:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2, marginBottom:16 }}>
            {[
              { l:'GBV Relevance', v:`${article.gbv_relevance || 0}/10` },
              { l:'Misogyny Score', v:`${article.misogyny_score || 0}/10`, c:mColor },
              { l:'Sentiment', v:article.sentiment || '—' },
            ].map((s,i) => (
              <div key={i} style={{ background:CRD, padding:'10px 12px' }}>
                <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                  color:MUT, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
                <div style={{ fontFamily:"'Lora',serif", fontSize:18, fontWeight:700,
                  color:s.c || TXT }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Platforms */}
          {article.tech_platforms?.length > 0 && (
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10,
                color:MUT, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6 }}>
                Platforms mentioned
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {article.tech_platforms.map((p,i) => (
                  <span key={i} style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                    padding:'3px 10px', background:'#8A4010', color:'#F0D0C0' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {(article.summary || article.article_snippet) && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10,
                color:MUT, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6 }}>
                Summary
              </div>
              <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13,
                color:TXT, lineHeight:1.7 }}>{article.summary || article.article_snippet}</p>
            </div>
          )}

          {/* Scan date */}
          {(article.scanned_at || article.published_at) && (
            <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:MUT, marginBottom:16 }}>
              Scanned: {new Date(article.scanned_at || article.published_at).toLocaleString('en-KE', { dateStyle:'medium', timeStyle:'short' })}
            </p>
          )}

          {/* Open source */}
          {article.article_url && (
            <a href={article.article_url} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:6,
                fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700,
                padding:'10px 18px', background:A, color:'#fff', textDecoration:'none' }}>
              <ExternalLink size={13}/> Read full article
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ARTICLE CARD ──────────────────────────────────────────────────────────────
function ArticleCard({ a, onClick }) {
  const mColor = scoreColor(a.misogyny_score)
  const typeIcon = a.content_type === 'video' ? <Play size={11}/> :
                   a.content_type === 'podcast' ? <Radio size={11}/> : <FileText size={11}/>
  return (
    <div onClick={() => onClick(a)}
      style={{ background:'#C4AABB', border:`1px solid ${BD}`, padding:14,
        cursor:'pointer', transition:'background .15s', borderLeft:`3px solid ${mColor}` }}
      onMouseEnter={e => e.currentTarget.style.background='#B89AAA'}
      onMouseLeave={e => e.currentTarget.style.background='#C4AABB'}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
        gap:8, marginBottom:6 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:3,
              fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
              letterSpacing:'.08em', textTransform:'uppercase', color:MUT }}>
              {typeIcon} {a.content_type || 'article'}
            </span>
            {a.tech_facilitated && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:3,
                fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
                padding:'1px 6px', background:'#8A4010', color:'#F0D0C0' }}>
                <Zap size={9}/> Tech GBV
              </span>
            )}
            {a.sentiment && (
              <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                padding:'1px 6px',
                background: a.sentiment==='negative' ? '#8A1030' : a.sentiment==='positive' ? '#1A5A2A' : '#5A4A60',
                color:'#fff' }}>
                {a.sentiment}
              </span>
            )}
          </div>
          <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:600,
            color:TXT, lineHeight:1.5, marginBottom:4 }}>
            {a.article_title || a.article_url || a.source_name}
          </div>
        </div>
        {/* Score badge */}
        <div style={{ flexShrink:0, width:38, height:38, background:mColor,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontFamily:"'Lora',serif", fontSize:14, fontWeight:700, color:'#fff',
            lineHeight:1 }}>{a.misogyny_score}</span>
          <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:8, color:'rgba(255,255,255,0.7)' }}>/10</span>
        </div>
      </div>

      {/* Thumbnail for video */}
      {a.thumbnail_url && a.content_type === 'video' && (
        <div style={{ position:'relative', marginBottom:8 }}
          onClick={e => {
            e.stopPropagation()
            const u = a.article_url
            if (u) window.open(u, '_blank')
          }}>
          <img src={a.thumbnail_url} alt="" style={{ width:'100%', height:90, objectFit:'cover' }}
            onError={e => e.target.style.display='none'}/>
          <div style={{ position:'absolute', inset:0, background:'rgba(24,4,16,0.4)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            gap:4 }}>
            <Play size={24} color="#fff" fill="#fff"/>
            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
              color:'rgba(255,255,255,0.8)', fontWeight:700 }}>Click to watch</span>
          </div>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {a.tech_platforms?.slice(0,3).map((p,i) => (
            <span key={i} style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
              padding:'1px 6px', background:'rgba(138,64,16,0.15)', color:'#8A4010' }}>
              {p}
            </span>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4,
          fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:MUT }}>
          <Eye size={10}/> {a.content_type === 'video' ? 'Watch video' : 'Read article'}
        </div>
      </div>
    </div>
  )
}

// ── MAIN TAB ──────────────────────────────────────────────────────────────────
export default function SocialsSentimentTab() {
  const [index,      setIndex]      = useState([])
  const [articles,   setArticles]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [search,     setSearch]     = useState('')
  const [modal,      setModal]      = useState(null)
  const [showAll,    setShowAll]    = useState(false)
  const [activeBreak, setActiveBreak] = useState(null) // clicked breakdown metric

  const today     = index[index.length - 1]
  const yesterday = index[index.length - 2]
  const trend     = today && yesterday ? today.score - yesterday.score : 0
  const score     = today?.score || 0

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [idxRes, artRes, hlRes] = await Promise.all([
      supabase.from('misogyny_index').select('*').order('date', { ascending:true }).limit(30),
      supabase.from('sentiment_articles').select('*').order('scanned_at', { ascending:false }).limit(100),
      supabase.from('misogyny_highlights').select('*').eq('active', true).order('highlight_date', { ascending:false }).limit(5),
    ])
    setIndex(idxRes.data || [])
    setArticles(artRes.data || [])
    setHighlights(hlRes.data || [])
    setLoading(false)
  }

  // ── INTELLIGENCE BREAKDOWN METRICS ─────────────────────────────────────────
  const total       = articles.length
  const highMiso    = articles.filter(a => a.misogyny_score >= 7)
  const techGBV     = articles.filter(a => a.tech_facilitated)
  const negSentiment = articles.filter(a => a.sentiment === 'negative')
  const gbvRelevant = articles.filter(a => a.gbv_relevance >= 7)
  const videos      = articles.filter(a => a.content_type === 'video')
  const podcasts    = articles.filter(a => a.content_type === 'podcast')
  const news        = articles.filter(a => a.content_type !== 'video' && a.content_type !== 'podcast')

  // Source platforms — where content comes from
  const sourceCounts = {}
  articles.forEach(a => {
    if (a.platform && a.platform !== 'news') {
      const label = a.platform === 'x' ? 'X / Twitter' : a.platform.charAt(0).toUpperCase() + a.platform.slice(1)
      sourceCounts[label] = (sourceCounts[label] || 0) + 1
    }
  })
  const topSources = Object.entries(sourceCounts).sort(([,a],[,b]) => b - a)

  // Mentioned platforms — platforms named in GBV content
  const mentionCounts = {}
  articles.forEach(a => {
    ;(a.tech_platforms || []).forEach((p) => {
      mentionCounts[p] = (mentionCounts[p] || 0) + 1
    })
  })
  const topMentions = Object.entries(mentionCounts).sort(([,a],[,b]) => b - a).slice(0, 6)

  // ── BREAKDOWN METRICS for click-to-filter ──────────────────────────────────
  const breakdownMetrics = [
    { id:'highMiso',   label:'High misogyny',    sublabel:'Score ≥ 7/10',   count:highMiso.length,
      pct:total ? Math.round(highMiso.length/total*100) : 0, color:'#CC1010', data:highMiso },
    { id:'techGBV',    label:'Tech-facilitated', sublabel:'GBV via platforms', count:techGBV.length,
      pct:total ? Math.round(techGBV.length/total*100) : 0, color:'#8A4010', data:techGBV },
    { id:'negSent',    label:'Negative sentiment', sublabel:'Hostile framing', count:negSentiment.length,
      pct:total ? Math.round(negSentiment.length/total*100) : 0, color:'#5A0818', data:negSentiment },
    { id:'gbvRel',     label:'High GBV relevance', sublabel:'Relevance ≥ 7/10', count:gbvRelevant.length,
      pct:total ? Math.round(gbvRelevant.length/total*100) : 0, color:'#1A3F6F', data:gbvRelevant },
  ]

  // ── FILTERING LOGIC ────────────────────────────────────────────────────────
  let displayed = articles
  if (activeBreak) {
    const bm = breakdownMetrics.find(b => b.id === activeBreak)
    if (bm) displayed = bm.data
  } else if (filter !== 'all') {
    if (filter === 'video')    displayed = videos
    else if (filter === 'podcast')  displayed = podcasts
    else if (filter === 'news')     displayed = news
    else if (filter === 'negative') displayed = negSentiment
    else if (filter === 'positive') displayed = articles.filter(a => a.sentiment === 'positive')
    else if (filter === 'tech')     displayed = techGBV
    else if (filter === 'alert')    displayed = highMiso
  }

  if (search.trim()) {
    const q = search.toLowerCase()
    displayed = displayed.filter(a =>
      (a.article_title || '').toLowerCase().includes(q) ||
      (a.article_snippet || '').toLowerCase().includes(q) ||
      (a.summary || '').toLowerCase().includes(q) ||
      (a.source_name || '').toLowerCase().includes(q) || (a.source_name || '').toLowerCase().replace('google news — ','').replace(' kenya','').includes(q) ||
      (a.tech_platforms || []).some(p => p.toLowerCase().includes(q))
    )
  }

  const shown = showAll ? displayed : displayed.slice(0, 12)

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="fade-up" style={{ width:'100%' }}>

      {/* ── HEADER ── */}
      <div style={{ borderBottom:`1px solid ${BD}`, paddingBottom:20, marginBottom:2 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <p className="label" style={{ marginBottom:8, color:A }}>● Live intelligence · Updated every 6 hours</p>
            <h1 className="serif" style={{ fontSize:36, fontWeight:700, color:TXT }}>
              Socials & Sentiment
            </h1>
            {(() => {
              const todayStr = new Date().toISOString().slice(0,10)
              const scannedToday = articles.filter(a => (a.scanned_at||'').startsWith(todayStr)).length
              return (
                <p style={{ fontSize:13, color:MUT, marginTop:6, fontFamily:"'Nunito Sans',sans-serif",
                  fontWeight:300 }}>
                  <strong style={{ color:A }}>{scannedToday} items scanned today</strong>
                  {' '}&nbsp;·&nbsp; {total} total in database &nbsp;·&nbsp; Real-time misogyny and GBV intelligence
                </p>
              )
            })()}
          </div>
          <button onClick={load} style={{ display:'inline-flex', alignItems:'center', gap:6,
            fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:600,
            padding:'8px 14px', border:`1px solid ${BD}`, background:CRD, color:MUT, cursor:'pointer' }}>
            <RefreshCw size={12}/> Refresh
          </button>
        </div>

        {/* ── MISOGYNY OF THE DAY ── */}
        <div style={{ marginBottom:2 }}>
          <div style={{ background:BG, border:`2px solid ${A}`, padding:'20px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:8 }}>
              <div>
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  letterSpacing:'.2em', textTransform:'uppercase', color:'#CC1010', marginBottom:6 }}>
                  ⚡ Misogyny of the Day
                </p>
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, lineHeight:1.6, maxWidth:500 }}>
                  Curated posts circulating online that illustrate the pipeline from toxic rhetoric to violence.
                  This is what normalisation looks like.
                </p>
              </div>
              <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:MUT,
                fontStyle:'italic', flexShrink:0 }}>
                {new Date().toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long'})}
              </span>
            </div>

            {/* Option A: Curated highlights */}
            {highlights.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
                {highlights.map((h, i) => (
                  <div key={h.id||i} style={{ background:'rgba(255,255,255,0.04)',
                    border:'1px solid rgba(139,16,48,0.4)', padding:'14px 16px',
                    borderLeft:'3px solid #CC1010' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                          letterSpacing:'.08em', textTransform:'uppercase', padding:'2px 8px',
                          background: h.platform==='TikTok'?'#010101':h.platform==='X'?'#1A1A1A':h.platform==='Facebook'?'#1877F2':h.platform==='Instagram'?'#C13584':h.platform==='Reddit'?'#FF4500':'#333',
                          color:'#fff' }}>
                          {h.platform}
                        </span>
                        {h.reach && <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:'rgba(255,255,255,0.4)' }}>{h.reach}</span>}
                      </div>
                      {h.post_date && <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:'rgba(255,255,255,0.3)' }}>
                        {new Date(h.post_date).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}
                      </span>}
                    </div>
                    <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:TXT,
                      lineHeight:1.7, margin:0, fontStyle:'italic' }}>
                      "{h.content}"
                    </p>
                    {h.context && (
                      <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                        color:A, marginTop:8, fontStyle:'normal' }}>
                        ↳ {h.context}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(139,16,48,0.3)',
                padding:16, marginBottom:20, textAlign:'center' }}>
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:'rgba(255,255,255,0.3)',
                  fontStyle:'italic' }}>
                  No curated highlights yet. Add them via the admin portal.
                </p>
              </div>
            )}

            {/* Option B: What the scanner caught — auto-flagged high misogyny */}
            {(() => {
              const todayStr = new Date().toISOString().slice(0,10)
              const autoFlagged = articles
                .filter(a => a.misogyny_score >= 7)
                .slice(0, 3)
              if (!autoFlagged.length) return null
              return (
                <div>
                  <div style={{ borderTop:`1px solid ${BD}`, paddingTop:14, marginBottom:12 }}>
                    <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                      letterSpacing:'.15em', textTransform:'uppercase', color:MUT, marginBottom:8 }}>
                      📡 What the scanner caught — highest misogyny scores today
                    </p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {autoFlagged.map((a, i) => (
                      <div key={a.id||i} style={{ background:CRD,
                        border:`1px solid ${BD}`, padding:'10px 14px',
                        display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
                              letterSpacing:'.08em', textTransform:'uppercase', padding:'1px 6px',
                              background:A, color:'#fff', border:'none' }}>
                              Misogyny {a.misogyny_score}/10
                            </span>
                            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:'rgba(255,255,255,0.3)' }}>
                              {a.source_name}
                            </span>
                          </div>
                          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12,
                            color:TXT, lineHeight:1.5, margin:0 }}>
                            {a.article_title}
                          </p>
                        </div>
                        {a.article_url && (
                          <a href={a.article_url} target="_blank" rel="noopener noreferrer"
                            style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:'#CC1010',
                              textDecoration:'none', flexShrink:0, fontWeight:700 }}>
                            Read →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center
        </div>
      </div>

      {loading ? (
        <div style={{ padding:40, textAlign:'center', fontFamily:"'Nunito Sans',sans-serif",
          fontSize:13, color:MUT }}>Loading intelligence feed…</div>
      ) : (
        <>
          {/* ── MISOGYNY INDEX COMMAND PANEL ── */}
          <div style={{ background:'#B89AAA', border:`2px solid ${A}`, padding:20, marginBottom:2 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:24, flexWrap:'wrap' }}>

              {/* Gauge */}
              <div style={{ textAlign:'center', flexShrink:0 }}>
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  letterSpacing:'.12em', textTransform:'uppercase', color:A, marginBottom:8 }}>
                  Misogyny Index · Today
                </p>
                <MisogynyGauge score={score}/>
                <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'center',
                  marginTop:4 }}>
                  {trend > 0 ? <TrendingUp size={14} color="#CC1010"/> :
                   trend < 0 ? <TrendingDown size={14} color="#2D7A3A"/> :
                   <Minus size={14} color={MUT}/>}
                  <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                    color: trend > 0 ? '#CC1010' : trend < 0 ? '#2D7A3A' : MUT }}>
                    {trend > 0 ? '+' : ''}{trend.toFixed(1)} from yesterday
                  </span>
                </div>
              </div>

              {/* What makes up the score */}
              <div style={{ flex:1, minWidth:280 }}>
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  letterSpacing:'.12em', textTransform:'uppercase', color:A, marginBottom:10 }}>
                  What makes up {score}%?  ·  Click to filter articles below
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {breakdownMetrics.map(m => (
                    <div key={m.id}
                      onClick={() => setActiveBreak(activeBreak === m.id ? null : m.id)}
                      style={{ cursor:'pointer', padding:'10px 12px',
                        background: activeBreak === m.id ? m.color : 'rgba(255,255,255,0.25)',
                        border:`1px solid ${activeBreak === m.id ? m.color : BD}`,
                        transition:'all .15s' }}>
                      <div style={{ display:'flex', justifyContent:'space-between',
                        alignItems:'center', marginBottom:4 }}>
                        <div>
                          <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12,
                            fontWeight:700, color: activeBreak === m.id ? '#fff' : TXT }}>
                            {m.label}
                          </span>
                          <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10,
                            color: activeBreak === m.id ? 'rgba(255,255,255,0.7)' : MUT,
                            marginLeft:8 }}>{m.sublabel}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontFamily:"'Lora',serif", fontSize:18, fontWeight:700,
                            color: activeBreak === m.id ? '#fff' : m.color }}>
                            {m.pct}%
                          </span>
                          <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10,
                            color: activeBreak === m.id ? 'rgba(255,255,255,0.7)' : MUT }}>
                            ({m.count} articles)
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div style={{ height:4, background:'rgba(0,0,0,0.1)', borderRadius:2 }}>
                        <div style={{ height:'100%', width:`${m.pct}%`,
                          background: activeBreak === m.id ? 'rgba(255,255,255,0.7)' : m.color,
                          transition:'width .4s ease', borderRadius:2 }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform breakdown */}
              <div style={{ minWidth:180, flexShrink:0 }}>
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  letterSpacing:'.12em', textTransform:'uppercase', color:A, marginBottom:8 }}>
                  Platforms in focus
                </p>

                {/* Source platforms */}
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                  color:MUT, letterSpacing:'.08em', textTransform:'uppercase',
                  fontWeight:700, marginBottom:4 }}>Source</p>
                {topSources.map(([p, c], i) => (
                  <div key={i} onClick={() => { setSearch(p); setActiveBreak(null); setFilter('all') }}
                    style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                      padding:'4px 0', borderBottom:`1px solid rgba(184,154,170,0.2)`, cursor:'pointer' }}>
                    <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                      color:TXT, fontWeight:600 }}>{p}</span>
                    <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                      color:A, fontWeight:700 }}>{c}</span>
                  </div>
                ))}

                {/* Mentioned platforms */}
                {topMentions.length > 0 && (<>
                  <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                    color:MUT, letterSpacing:'.08em', textTransform:'uppercase',
                    fontWeight:700, margin:'10px 0 4px' }}>Mentioned in content</p>
                  {topMentions.map(([p, c], i) => (
                    <div key={i} onClick={() => { setSearch(p); setActiveBreak(null); setFilter('all') }}
                      style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                        padding:'4px 0', borderBottom:`1px solid rgba(184,154,170,0.2)`, cursor:'pointer' }}>
                      <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                        color:TXT, fontWeight:600 }}>{p}</span>
                      <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                        color:'#8A4010', fontWeight:700 }}>{c}</span>
                    </div>
                  ))}
                </>)}
                {/* News sources breakdown */}
                {(() => {
                  const newsSources = {}
                  articles.forEach(a => {
                    if(a.source_name) newsSources[a.source_name] = (newsSources[a.source_name]||0)+1
                  })
                  const top = Object.entries(newsSources).sort((a,b)=>b[1]-a[1]).slice(0,6)
                  if(!top.length) return null
                  return (
                    <>
                      <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                        color:MUT, letterSpacing:'.08em', textTransform:'uppercase',
                        fontWeight:700, margin:'10px 0 4px' }}>News sources</p>
                      {top.map(([p,c],i) => (
                        <div key={i} onClick={()=>{ setSearch(p.replace('Google News — ','').replace(' Kenya','')); setActiveBreak(null); setFilter('all') }}
                          style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                            padding:'4px 0', borderBottom:`1px solid rgba(184,154,170,0.2)`, cursor:'pointer' }}
                          onMouseEnter={e=>e.currentTarget.style.opacity='0.7'}
                          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                          <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                            color:TXT, fontWeight:600 }}>{p.replace('Google News — ','').replace(' Kenya','')}</span>
                          <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                            color:'#1A5A2A', fontWeight:700 }}>{c}</span>
                        </div>
                      ))}
                    </>
                  )
                })()}
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                  color:MUT, marginTop:8, lineHeight:1.6 }}>
                  Click any to filter the feed
                </p>
              </div>
            </div>
          </div>

          {/* ── 30-DAY TREND ── */}
          <div style={{ background:CRD, border:`1px solid ${BD}`, padding:16, marginBottom:2 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              marginBottom:12 }}>
              <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                letterSpacing:'.1em', textTransform:'uppercase', color:A }}>
                30-day Misogyny Index trend
              </p>
              <div style={{ display:'flex', gap:16 }}>
                {[
                  { label:'Peak', val:`${Math.max(...index.map(d=>d.score||0))}%` },
                  { label:'Average', val:`${Math.round(index.reduce((s,d)=>s+(d.score||0),0)/(index.length||1))}%` },
                  { label:'Today', val:`${score}%` },
                ].map((s,i) => (
                  <div key={i} style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9,
                      color:MUT, letterSpacing:'.08em', textTransform:'uppercase' }}>{s.label}</div>
                    <div style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:700,
                      color:TXT }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={index} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="misoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={A} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={A} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize:9, fill:MUT, fontFamily:"'Nunito Sans',sans-serif" }}
                  tickFormatter={d => d?.slice(5)} interval={6}/>
                <YAxis tick={{ fontSize:9, fill:MUT }} domain={[0, 100]}/>
                <Tooltip
                  contentStyle={{ background:TXT, border:'none', borderRadius:0,
                    fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:'#fff' }}
                  formatter={(v) => [`${v}%`, 'Misogyny Index']}
                  labelStyle={{ color:'rgba(255,255,255,0.6)' }}/>
                <ReferenceLine y={70} stroke="#CC1010" strokeDasharray="3 3"
                  label={{ value:'Critical', fill:'#CC1010', fontSize:9, fontFamily:"'Nunito Sans',sans-serif" }}/>
                <Area type="monotone" dataKey="score" stroke={A} strokeWidth={2}
                  fill="url(#misoGrad)" dot={false} activeDot={{ r:4 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── CONTENT TYPE STATS ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2, marginBottom:2 }}>
            {[
              { icon:<FileText size={16}/>, label:'News articles', count:news.length,
                id:'news', color:A },
              { icon:<Play size={16}/>, label:'Videos scanned', count:videos.length,
                id:'video', color:'#1A3F6F' },
              { icon:<Radio size={16}/>, label:'Podcasts scanned', count:podcasts.length,
                id:'podcast', color:'#1A5A2A' },
            ].map(s => (
              <div key={s.id}
                onClick={() => {
                  setActiveBreak(null)
                  setFilter(filter === s.id ? 'all' : s.id)
                }}
                style={{ background: filter === s.id ? s.color : CRD,
                  border:`1px solid ${filter === s.id ? s.color : BD}`,
                  padding:'14px 16px', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:12, transition:'all .15s' }}>
                <span style={{ color: filter === s.id ? '#fff' : s.color }}>{s.icon}</span>
                <div>
                  <div style={{ fontFamily:"'Lora',serif", fontSize:24, fontWeight:700,
                    color: filter === s.id ? '#fff' : TXT }}>{s.count}</div>
                  <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                    color: filter === s.id ? 'rgba(255,255,255,0.7)' : MUT }}>
                    {s.label} {filter === s.id ? '· click to clear' : '· click to filter'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── INTELLIGENCE FEED ── */}
          <div style={{ background:'#B89AAA', border:`1px solid ${BD}`, padding:'14px 16px',
            marginBottom:2 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              marginBottom:12, flexWrap:'wrap', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Cpu size={14} color={A}/>
                <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                  letterSpacing:'.1em', textTransform:'uppercase', color:A }}>
                  Intelligence feed
                </span>
                {(activeBreak || filter !== 'all' || search) && (
                  <button onClick={() => { setActiveBreak(null); setFilter('all'); setSearch('') }}
                    style={{ display:'inline-flex', alignItems:'center', gap:4,
                      fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                      padding:'3px 8px', background:'rgba(138,16,48,0.1)',
                      border:`1px solid ${A}`, color:A, cursor:'pointer' }}>
                    <X size={10}/> Clear filters
                  </button>
                )}
              </div>
              <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:MUT }}>
                {displayed.length} results
              </span>
            </div>

            {/* Filter chips */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
              {[
                { id:'all',      label:'All' },
                { id:'alert',    label:'🚨 High Alert', count:highMiso.length },
                { id:'tech',     label:'⚡ Tech GBV', count:techGBV.length },
                { id:'negative', label:'Negative sentiment', count:negSentiment.length },
                { id:'positive', label:'Positive' },
                { id:'video',    label:'▶ Videos', count:videos.length },
                { id:'podcast',  label:'🎙 Podcasts', count:podcasts.length },
              ].map(f => (
                <button key={f.id}
                  onClick={() => { setFilter(f.id); setActiveBreak(null) }}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:600,
                    padding:'4px 10px', cursor:'pointer',
                    background: filter === f.id && !activeBreak ? A : 'rgba(255,255,255,0.4)',
                    border:`1px solid ${filter === f.id && !activeBreak ? A : BD}`,
                    color: filter === f.id && !activeBreak ? '#fff' : TXT }}>
                  {f.label}{f.count != null ? ` (${f.count})` : ''}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles, platforms, topics…"
              style={{ width:'100%', padding:'8px 12px', fontFamily:"'Nunito Sans',sans-serif",
                fontSize:12, background:'rgba(255,255,255,0.5)', border:`1px solid ${BD}`,
                color:TXT, outline:'none', marginBottom:12, boxSizing:'border-box' }}/>

            {/* Active breakdown label */}
            {activeBreak && (() => {
              const bm = breakdownMetrics.find(b => b.id === activeBreak)
              return bm ? (
                <div style={{ padding:'8px 12px', background:bm.color, marginBottom:10,
                  display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                    color:'#fff', fontWeight:700 }}>
                    Filtered by: {bm.label} — {bm.count} articles
                  </span>
                  <button onClick={() => setActiveBreak(null)}
                    style={{ background:'none', border:'none', color:'rgba(255,255,255,0.7)',
                      cursor:'pointer' }}>
                    <X size={14}/>
                  </button>
                </div>
              ) : null
            })()}

            {/* Article grid */}
            {shown.length === 0 ? (
              <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT,
                fontStyle:'italic', padding:'20px 0' }}>
                No articles match this filter. The scanner runs every 6 hours.
              </p>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {shown.map((a, i) => (
                    <ArticleCard key={a.id || i} a={a} onClick={setModal}/>
                  ))}
                </div>
                {displayed.length > 12 && (
                  <button onClick={() => setShowAll(!showAll)}
                    style={{ display:'flex', alignItems:'center', gap:6, margin:'12px auto 0',
                      fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                      padding:'8px 16px', background:'transparent',
                      border:`1px solid ${BD}`, color:MUT, cursor:'pointer' }}>
                    {showAll ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                    {showAll ? 'Show less' : `Show all ${displayed.length} articles`}
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* ── ARTICLE MODAL ── */}
      {modal && <ArticleModal article={modal} onClose={() => setModal(null)}/>}

    </div>
  )
}
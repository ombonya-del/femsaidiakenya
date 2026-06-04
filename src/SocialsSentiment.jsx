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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [index,      setIndex]      = useState([])
  const [articles,   setArticles]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [highlights,  setHighlights]  = useState([])
  const [search,     setSearch]     = useState('')
  const [modal,      setModal]      = useState(null)
  const [showAll,    setShowAll]    = useState(false)
  const [showAllHighlights, setShowAllHighlights] = useState(false)
  const [activeBreak, setActiveBreak] = useState(null) // clicked breakdown metric
  const [showAllPulse, setShowAllPulse] = useState(false)

  const today       = index[index.length - 1]
  const yesterday   = index[index.length - 2]
  const trend       = today && yesterday ? today.score - yesterday.score : 0
  const score       = today?.score       || 0
  const newsScore   = today?.news_score  || 0
  const socialScore = today?.social_score|| 0
  const prevScore   = today?.prev_score  || score

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [idxRes, artRes, hlRes, vidRes] = await Promise.all([
      supabase.from('misogyny_index').select('*').order('date', { ascending:true }).limit(30),
      supabase.from('sentiment_articles').select('*').order('scanned_at', { ascending:false }).limit(200),
      supabase.from('misogyny_highlights').select('*').eq('active', true).order('highlight_date', { ascending:false }).limit(10),
      supabase.from('sentiment_articles').select('*').eq('content_type', 'video').order('scanned_at', { ascending:false }).limit(20),
    ])
    setIndex(idxRes.data || [])
    const arts = artRes.data || []
    const vids = vidRes.data || []
    const merged = [...vids, ...arts.filter(a => a.content_type !== 'video')]
    setArticles(merged)
    setHighlights(hlRes.data || [])
    setLoading(false)
  }

  // ── INTELLIGENCE BREAKDOWN METRICS ─────────────────────────────────────────
  const intelligenceFeed = articles.filter(a => a.platform === 'news' || a.platform === 'youtube' || a.content_type === 'article' || a.content_type === 'video' || !a.platform)
  const pulseFeed        = articles
    .filter(a => a.platform === 'x' || a.content_type === 'social_post' || a.platform === 'tiktok' || (a.platform === 'youtube') || (a.platform === 'news' && (a.is_protest || a.is_kibe_related || ['march','podcast','video','community'].includes(a.content_category))))
    .sort((a,b) => new Date(b.scanned_at) - new Date(a.scanned_at))

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

        {/* ── WSC (left/Intelligence) + MOTD (right/Pulse) ── */}
        <div style={{ marginBottom:2, display: isMobile?'block':'grid', gridTemplateColumns:'1fr 1fr', gap:2, alignItems:'start' }}>

          {/* ── WHAT THE SCANNER CAUGHT — Intelligence side ── */}
          <div style={{ background:CRD, border:`1px solid ${BD}`, overflow:'hidden' }}>
            <div style={{ background:'#180410', padding:'10px 18px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:14 }}>📡</span>
              <div>
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                  letterSpacing:'.1em', textTransform:'uppercase', color:'#F0D0D8' }}>What the scanner caught</p>
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, color:'#7A4A60' }}>Highest misogyny scores in the last scan</p>
              </div>
            </div>
            <div style={{ padding:'14px 16px' }}>
            {(() => {
              const autoFlagged = articles.filter(a => a.misogyny_score >= 7).slice(0, 5)
              if (!autoFlagged.length) return (
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, fontStyle:'italic' }}>No high-alert items yet.</p>
              )
              return (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {autoFlagged.map((a, i) => (
                    <div key={a.id||i} style={{ background:'#F5EEF2', border:`1px solid ${BD}`,
                      padding:'10px 14px', display:'flex', justifyContent:'space-between',
                      alignItems:'flex-start', gap:12, borderLeft:`3px solid ${A}` }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, flexWrap:'wrap' }}>
                          <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
                            letterSpacing:'.06em', textTransform:'uppercase', padding:'1px 6px',
                            background:A, color:'#F0D0D8' }}>{a.misogyny_score}/10</span>
                          <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:MUT }}>{a.source_name}</span>
                        </div>
                        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:TXT, lineHeight:1.5, margin:0 }}>
                          {a.article_title}
                        </p>
                        {a.summary && (
                          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:MUT,
                            lineHeight:1.5, marginTop:4, fontStyle:'italic' }}>
                            {a.summary.slice(0,120)}...
                          </p>
                        )}
                      </div>
                      {a.article_url && (
                        <a href={a.article_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:A,
                            textDecoration:'none', flexShrink:0, fontWeight:700 }}>Read →</a>
                      )}
                    </div>
                  ))}
                </div>
              )
            })()}
            </div>
          </div>

          {/* ── MISOGYNY OF THE DAY — Community Pulse side ── */}
          <div style={{ background:CRD, border:`1px solid ${BD}`, overflow:'hidden' }}>
            <div style={{ background:'#CC1010', padding:'10px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:14 }}>⚡</span>
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                  letterSpacing:'.1em', textTransform:'uppercase', color:'#fff' }}>Misogyny of the Day</p>
              </div>
              <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, color:'rgba(255,255,255,0.7)', fontStyle:'italic' }}>
                {new Date().toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'short'})}
              </span>
            </div>
            <div style={{ padding:'4px 16px 6px', background:'rgba(204,16,16,0.08)', borderBottom:`1px solid ${BD}` }}>
              <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:MUT, lineHeight:1.5 }}>
                This is what normalisation looks like. One post. Every day.
              </p>
            </div>
            <div style={{ padding:'14px 16px' }}>
            {(() => {
              const sorted   = [...highlights].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
              const latestHL = sorted[0]
              const recentHL = sorted.slice(1, 8)

              const HighlightCard = ({h, featured}) => (
                <div style={{ background: featured?'#F5EEF2':'#EDE0E8',
                  border:`1px solid ${featured?A:BD}`,
                  padding:'14px 16px', borderLeft:`3px solid ${featured?'#CC1010':BD}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
                        letterSpacing:'.08em', textTransform:'uppercase', padding:'2px 8px',
                        background: h.platform==='TikTok'?'#010101':h.platform==='X'?'#1D9BF0':h.platform==='Facebook'?'#1877F2':h.platform==='Instagram'?'#C13584':h.platform==='Reddit'?'#FF4500':'#555',
                        color:'#fff' }}>{h.platform||'X'}</span>
                      {h.reach && <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, color:MUT }}>{h.reach}</span>}
                    </div>
                    <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, color:MUT }}>
                      {h.highlight_date && new Date(h.highlight_date).toLocaleDateString('en-KE',{day:'numeric',month:'short'})}
                    </span>
                  </div>
                  <p style={{ fontFamily:"'Lora',serif", fontSize: featured?14:12,
                    color:TXT, lineHeight:1.8, margin:0, fontStyle:'italic' }}>
                    "{h.content}"
                  </p>
                  {h.context && (
                    <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
                      color:A, marginTop:8, lineHeight:1.6 }}>↳ {h.context}</p>
                  )}
                  {/* Media — screenshot or video */}
                  {h.media_url && h.media_url.length > 0 && h.media_type === 'image' && (
                    <img src={h.media_url} alt="Post screenshot"
                      style={{ width:'100%', maxHeight:280, objectFit:'cover', marginTop:10, borderRadius:2 }}/>
                  )}
                  {h.media_url && h.media_url.length > 0 && h.media_type === 'video' && (
                    <video src={h.media_url} controls
                      style={{ width:'100%', maxHeight:280, marginTop:10 }}/>
                  )}
                  {h.embed_url && h.embed_url.includes('youtube') && (
                    <div style={{ marginTop:10, position:'relative', paddingBottom:'56.25%', height:0 }}>
                      <iframe
                        src={h.embed_url.replace('watch?v=','embed/').replace('youtu.be/','www.youtube.com/embed/')}
                        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}
                        allowFullScreen title="Video"/>
                    </div>
                  )}
                  {h.embed_url && h.embed_url.length > 0 && (h.embed_url.includes('tiktok') || h.embed_url.includes('x.com') || h.embed_url.includes('twitter')) && (
                    <a href={h.embed_url} target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:10,
                        fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700, textDecoration:'none', background:'#1D9BF0', padding:'6px 12px', color:'#fff' }}>
                      🐦 View on X →
                    </a>
                  )}
                </div>
              )

              return (
                <>
                  {latestHL && <HighlightCard h={latestHL} featured={true}/>}
                  {recentHL.length > 0 && (
                    <div style={{ marginTop:10 }}>
                      <button onClick={() => setShowAllHighlights(!showAllHighlights)}
                        style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                          color:MUT, background:'none', border:'none', cursor:'pointer',
                          padding:'6px 0', letterSpacing:'.06em', textTransform:'uppercase' }}>
                        {showAllHighlights ? '▲ Hide previous' : `▼ Show ${recentHL.length} previous posts`}
                      </button>
                      {showAllHighlights && (
                        <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:6 }}>
                          {recentHL.map((h,i) => <HighlightCard key={h.id||i} h={h} featured={false}/>)}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )
            })()}
            </div>
          </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        </div>
      </div>

      {loading ? (
        <div style={{ padding:40, textAlign:'center', fontFamily:"'Nunito Sans',sans-serif",
          fontSize:13, color:MUT }}>Loading intelligence feed…</div>
      ) : (
        <>
          {/* ── MISOGYNY INDEX — compact strip ── */}
          <div style={{ background:'#180410', border:`1px solid ${A}`, padding:'12px 20px',
            marginBottom:2, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              {/* Overall score */}
              <div style={{ textAlign:'center' }}>
                <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700,
                  letterSpacing:'.12em', textTransform:'uppercase', color:A, marginBottom:2 }}>
                  Overall · 7 days
                </p>
                <span style={{ fontFamily:"'Lora',serif", fontSize:32, fontWeight:700,
                  color: score>=70?'#CC1010':score>=50?'#C05010':score>=30?'#CA8A04':'#2D7A3A' }}>
                  {score}%
                </span>
              </div>
              {/* Delta */}
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                {trend > 0 ? <TrendingUp size={14} color="#CC1010"/> :
                 trend < 0 ? <TrendingDown size={14} color="#2D7A3A"/> :
                 <Minus size={14} color={MUT}/>}
                <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10,
                  color: trend > 0 ? '#CC1010' : trend < 0 ? '#2D7A3A' : '#B89AAA' }}>
                  {trend > 0 ? '+' : ''}{trend}pts
                </span>
              </div>
              {/* Split scores */}
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ background:'rgba(255,255,255,0.05)', padding:'4px 10px', borderLeft:'2px solid #1A3F6F' }}>
                  <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:8, color:'#B89AAA', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:1 }}>📰 Media</p>
                  <span style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:700,
                    color: newsScore>=70?'#CC1010':newsScore>=50?'#C05010':newsScore>=30?'#CA8A04':'#2D7A3A' }}>
                    {newsScore}%
                  </span>
                </div>
                <div style={{ background:'rgba(255,255,255,0.05)', padding:'4px 10px', borderLeft:'2px solid #8A1030' }}>
                  <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:8, color:'#B89AAA', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:1 }}>🔥 Community</p>
                  <span style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:700,
                    color: socialScore>=70?'#CC1010':socialScore>=50?'#C05010':socialScore>=30?'#CA8A04':'#2D7A3A' }}>
                    {socialScore>0 ? `${socialScore}%` : '—'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ flex:1, display:'flex', gap:8, flexWrap:'wrap' }}>
              {breakdownMetrics.map(m => (
                <button key={m.id} onClick={() => setActiveBreak(activeBreak===m.id?null:m.id)}
                  style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
                    padding:'4px 10px', border:`1px solid ${activeBreak===m.id?m.color:BD}`,
                    background: activeBreak===m.id?m.color:'rgba(255,255,255,0.05)',
                    color: activeBreak===m.id?'#fff':'#B89AAA', cursor:'pointer' }}>
                  {m.label} · {m.pct}%
                </button>
              ))}
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

            {/* Split layout — Intelligence + Community Pulse */}
            <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns:'1fr 1fr', gap:2, alignItems:'start' }}>

              {/* ── INTELLIGENCE FEED ── */}
              <div>
                <div style={{ background:'#180410', padding:'10px 14px', marginBottom:2, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:16 }}>📰</span>
                  <div>
                    <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700, color:'#F0D0D8', letterSpacing:'.06em', textTransform:'uppercase' }}>Intelligence Feed</p>
                    <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:'#7A4A60' }}>News · research · advocacy · verified media</p>
                  </div>
                  <span style={{ marginLeft:'auto', fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:MUT }}>{intelligenceFeed.length} articles</span>
                </div>
                {intelligenceFeed.length === 0 ? (
                  <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, fontStyle:'italic', padding:'16px 0' }}>No intelligence articles yet.</p>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {(showAll ? intelligenceFeed : intelligenceFeed.slice(0,10)).map((a,i) => (
                      <ArticleCard key={a.id||i} a={a} onClick={setModal}/>
                    ))}
                    {intelligenceFeed.length > 10 && (
                      <button onClick={() => setShowAll(!showAll)}
                        style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700,
                          padding:'8px', background:'transparent', border:`1px solid ${BD}`, color:MUT, cursor:'pointer', marginTop:4 }}>
                        {showAll ? 'Show less' : `+ ${intelligenceFeed.length - 10} more`}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── COMMUNITY PULSE ── */}
              <div style={{ marginTop: isMobile ? 16 : 0 }}>
                <div style={{ background:'#200818', padding:'10px 14px', marginBottom:2, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:16 }}>🔥</span>
                  <div>
                    <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, fontWeight:700, color:'#F0D0D8', letterSpacing:'.06em', textTransform:'uppercase' }}>Community Pulse</p>
                    <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:'#7A4A60' }}>X posts · testimonies · street-level signal</p>
                  </div>
                  <span style={{ marginLeft:'auto', fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:MUT }}>{pulseFeed.length} posts</span>
                </div>
                {pulseFeed.length === 0 ? (
                  <div style={{ background:CRD, border:`1px solid ${BD}`, padding:20, textAlign:'center' }}>
                    <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:MUT, fontStyle:'italic', marginBottom:8 }}>
                      Community intelligence — marches, podcasts, video interviews, femicide discourse. Updated every 6 hours.
                    </p>
                    <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:MUT }}>
                      Monitoring {10} X handles + 8 keyword searches
                    </p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {(showAllPulse ? pulseFeed : pulseFeed.slice(0,12)).map((a,i) => (
                      <div key={a.id||i} onClick={() => setModal(a)}
                        style={{ background:CRD, border:`1px solid ${BD}`, padding:'12px 14px', cursor:'pointer' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                          <span style={{ fontSize:10, fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, color:A }}>
                            @{a.source_name?.replace('X / @','').replace('@','')}
                          </span>
                          <span style={{ fontSize:9, color:MUT, fontFamily:"'Nunito Sans',sans-serif" }}>
                            {a.scanned_at ? new Date(a.scanned_at).toLocaleDateString('en-KE',{day:'numeric',month:'short'}) : ''}
                          </span>
                          {a.misogyny_score >= 7 && (
                            <span style={{ fontSize:9, padding:'1px 6px', background:'#CC1010', color:'#fff',
                              fontFamily:"'Nunito Sans',sans-serif", fontWeight:700, marginLeft:'auto' }}>
                              HIGH ALERT
                            </span>
                          )}
                        </div>
                        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:TXT, lineHeight:1.6, marginBottom:6 }}>
                          {a.article_title || a.article_snippet}
                        </p>
                        {a.summary && (
                          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:MUT, lineHeight:1.5, fontStyle:'italic' }}>
                            {a.summary}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {pulseFeed.length > 12 && <button onClick={()=>setShowAllPulse(v=>!v)} style={{width:'100%',padding:'10px',marginTop:8,fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,background:'rgba(138,16,48,0.08)',border:'1px solid rgba(138,16,48,0.2)',color:'#8A1030',cursor:'pointer'}}>{showAllPulse ? 'Show less' : `Show all ${pulseFeed.length} posts`}</button>}              </div>

            </div>
          </div>
        </>
      )}

        </div>
      {/* ── ARTICLE MODAL ── */}
      {modal && <ArticleModal article={modal} onClose={() => setModal(null)}/>}

    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

// How the femicide case load maps onto Halafu?'s three response lanes → projects.
const LANES = [
  { id:'understand', label:'Understand', color:'#7C3AED', projects:['The Misogyny Pipeline in Kenya','The Economics of Male Violence','Boys Who Witnessed It'] },
  { id:'interrupt',  label:'Interrupt',  color:'#16A34A', projects:['Counter-Narrative Content Lab','The 10-16 Curriculum','Salmin for Men','The Baraza Network'] },
  { id:'build',      label:'Build',      color:'#DC2626', projects:['Fathers & Daughters Initiative','KaaRada Perpetrator Intervention','FemSaidia Intelligence Brief'] },
]

export default function HalafuStrategyBreakdown({ isMobile = false, compact = false, theme = 'dark' }) {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    sb.from('femicide_cases').select('halafu_lane,halafu_project').eq('published', true)
      .then(({ data }) => setRows(data || []))
  }, [])
  if (!rows) return null

  const light = theme === 'light'
  const T = light ? {
    bg:'#fff', border:'1px solid #E6D6DC', top:'3px solid #8A1030',
    title:'#8A1030', sub:'#7A4A60', label:'#180410', count:'#7A4A60',
    track:'#F0E2E8', proj:'#5A3A48', projMut:'#C0A8B2', projNum:'#C0A8B2',
  } : {
    bg:'rgba(0,0,0,0.18)', border:'1px solid rgba(255,255,255,0.08)', top:'none',
    title:'#F0577A', sub:'rgba(255,255,255,0.45)', label:'#EAD8E0', count:'rgba(255,255,255,0.55)',
    track:'rgba(255,255,255,0.08)', proj:'rgba(255,255,255,0.6)', projMut:'rgba(255,255,255,0.28)', projNum:'rgba(255,255,255,0.3)',
  }

  const total = rows.length
  const laneCount = id => rows.filter(c => c.halafu_lane === id).length
  const projCount = p => rows.filter(c => c.halafu_project === p).length
  const attributed = rows.filter(c => c.halafu_lane).length
  const unattributed = total - attributed
  const maxLane = Math.max(1, ...LANES.map(l => laneCount(l.id)), unattributed)
  const pctOf = n => total ? Math.round(n / total * 100) : 0

  const laneRow = (label, color, n, projects) => (
    <div key={label} style={{ marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
        <span style={{ width:9, height:9, borderRadius:2, background:color, flexShrink:0 }}/>
        <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12.5, fontWeight:700, color:T.label }}>{label}</span>
        <span style={{ flex:1 }}/>
        <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:T.count, fontVariantNumeric:'tabular-nums' }}>{n} · {pctOf(n)}%</span>
      </div>
      <div style={{ height:8, background:T.track, borderRadius:4, overflow:'hidden' }}>
        <div style={{ width:`${Math.round(n / maxLane * 100)}%`, height:'100%', background:color, borderRadius:4 }}/>
      </div>
      {!compact && projects && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:'2px 12px', marginTop:6, paddingLeft:17 }}>
          {projects.map(p => (
            <span key={p} style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10.5, color: projCount(p) ? T.proj : T.projMut }}>
              {p} <strong style={{ color: projCount(p) ? color : T.projNum }}>{projCount(p)}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ padding: isMobile ? '16px' : '18px 22px', background:T.bg, border:T.border, borderTop:T.top }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10, marginBottom:12, flexWrap:'wrap' }}>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:T.title, margin:0 }}>
          Cases by response strategy
        </p>
        <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10.5, color:T.sub }}>{attributed} of {total} cases attributed</span>
      </div>
      {LANES.map(l => laneRow(l.label, l.color, laneCount(l.id), l.projects))}
      {unattributed > 0 && laneRow('Unattributed', '#8A8A9A', unattributed, null)}
    </div>
  )
}

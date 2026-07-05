import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

// How the femicide case load maps onto Halafu?'s three response lanes.
const LANES = [
  { id:'understand', label:'Understand', color:'#7C3AED', desc:'What is turning boys into men who harm?' },
  { id:'interrupt',  label:'Interrupt',  color:'#16A34A', desc:'Where can we intervene before harm happens?' },
  { id:'build',      label:'Build',      color:'#DC2626', desc:'What do we create to prevent the next death?' },
]

export default function HalafuStrategyBreakdown({ isMobile = false, theme = 'dark' }) {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    sb.from('femicide_cases').select('halafu_lane').eq('published', true)
      .then(({ data }) => setRows(data || []))
  }, [])
  if (!rows) return null

  const light = theme === 'light'
  const T = light ? {
    bg:'#fff', border:'1px solid #E6D6DC', top:'3px solid #8A1030',
    heading:'#180410', sub:'#7A4A60', label:'#180410', count:'#7A4A60', pctMut:'#9A7A88',
    ring:'#F1E4EA', divider:'#F4EAEE', center:'#180410', centerSub:'#7A4A60',
    explHead:'#8A1030', desc:'#5A3A48', foot:'#A08890',
  } : {
    bg:'rgba(0,0,0,0.18)', border:'1px solid rgba(255,255,255,0.08)', top:'none',
    heading:'#EAD8E0', sub:'rgba(255,255,255,0.45)', label:'#EAD8E0', count:'rgba(255,255,255,0.6)', pctMut:'rgba(255,255,255,0.4)',
    ring:'rgba(255,255,255,0.08)', divider:'rgba(255,255,255,0.08)', center:'#F0E0E6', centerSub:'rgba(255,255,255,0.5)',
    explHead:'#F0577A', desc:'rgba(255,255,255,0.62)', foot:'rgba(255,255,255,0.35)',
  }

  const total = rows.length
  const laneCount = id => rows.filter(c => c.halafu_lane === id).length
  const unattributed = total - rows.filter(c => c.halafu_lane).length
  const pctOf = n => total ? Math.round(n / total * 100) : 0

  const R = 54, C = 2 * Math.PI * R, SW = 18
  let acc = 0
  const segs = [
    ...LANES.map(l => ({ color:l.color, n:laneCount(l.id) })),
    { color:'#8A8A9A', n:unattributed },
  ].filter(s => s.n > 0).map(s => {
    const frac = total ? s.n / total : 0
    const seg = { ...s, dash:frac * C, offset:acc * C }
    acc += frac
    return seg
  })
  const legend = [
    ...LANES.map(l => ({ label:l.label, color:l.color, n:laneCount(l.id) })),
    { label:'Unattributed', color:'#8A8A9A', n:unattributed },
  ]

  return (
    <div style={{ background:T.bg, border:T.border, borderTop:T.top, padding: isMobile ? '18px 16px' : '24px 26px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12, marginBottom:4, flexWrap:'wrap' }}>
        <h3 style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:700, color:T.heading, margin:0 }}>Cases by response strategy</h3>
        <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:T.sub }}>Halafu? lane per case</span>
      </div>

      <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems:'center', gap: isMobile ? 18 : 28, marginTop:16 }}>
        <div style={{ position:'relative', flexShrink:0, width:150, height:150 }}>
          <svg width={150} height={150} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={R} fill="none" stroke={T.ring} strokeWidth={SW}/>
            {segs.map((s, i) => (
              <circle key={i} cx="60" cy="60" r={R} fill="none" stroke={s.color} strokeWidth={SW}
                strokeDasharray={`${s.dash} ${C}`} strokeDashoffset={-s.offset} transform="rotate(-90 60 60)"/>
            ))}
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:"'Lora',serif", fontSize:30, fontWeight:700, color:T.center, lineHeight:1 }}>{total}</span>
            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:T.centerSub, letterSpacing:'.06em', textTransform:'uppercase', marginTop:2 }}>cases</span>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:9, flex:1, width: isMobile ? '100%' : 'auto' }}>
          {legend.map(l => (
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:9, fontFamily:"'Nunito Sans',sans-serif", fontSize:12.5 }}>
              <span style={{ width:11, height:11, borderRadius:3, background:l.color, flexShrink:0 }}/>
              <span style={{ color:T.label, fontWeight:700 }}>{l.label}</span>
              <span style={{ flex:1, height:1, background:T.divider }}/>
              <span style={{ color:T.count, fontVariantNumeric:'tabular-nums' }}>{l.n}</span>
              <span style={{ color:T.pctMut, width:36, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{pctOf(l.n)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop:18, paddingTop:16, borderTop:`1px solid ${T.divider}` }}>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700, color:T.explHead, letterSpacing:'.1em', textTransform:'uppercase', margin:'0 0 10px' }}>
          What the lanes mean
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {LANES.map(l => (
            <div key={l.id} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
              <span style={{ width:9, height:9, borderRadius:2, background:l.color, marginTop:4, flexShrink:0 }}/>
              <p style={{ margin:0, fontFamily:"'Nunito Sans',sans-serif", fontSize:11.5, lineHeight:1.55, color:T.desc }}>
                <strong style={{ color:l.color }}>{l.label}</strong> — {l.desc}
              </p>
            </div>
          ))}
        </div>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:T.foot, margin:'12px 0 0', fontStyle:'italic', lineHeight:1.5 }}>
          Each case is attributed to the lane whose projects can best respond to its circumstances. "Unattributed" = not yet tagged.
        </p>
      </div>
    </div>
  )
}

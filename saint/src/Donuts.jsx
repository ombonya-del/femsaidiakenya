import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

// Dark-themed, self-fetching donut cards for the SaInt dashboard. They mirror
// the archetype + response-strategy breakdowns shown on the main platform, so a
// funder sees the same intelligence here as in the Intel Brief.

const T = {
  bg:'#1A2035', border:'1px solid rgba(255,255,255,0.10)',
  heading:'#EAD8E0', sub:'rgba(255,255,255,0.45)', label:'#EAD8E0',
  count:'rgba(255,255,255,0.6)', pctMut:'rgba(255,255,255,0.4)',
  ring:'rgba(255,255,255,0.08)', divider:'rgba(255,255,255,0.08)',
  center:'#F0E0E6', centerSub:'rgba(255,255,255,0.5)',
  explHead:'#F0577A', desc:'rgba(255,255,255,0.62)',
}

const R = 54, C = 2 * Math.PI * R, SW = 18

function DonutCard({ title, tag, segs, legend, explHead, expl, isMobile }) {
  const total = segs.reduce((s, x) => s + x.n, 0)
  const pctOf = n => total ? Math.round(n / total * 100) : 0
  let acc = 0
  const arcs = segs.filter(s => s.n > 0).map(s => {
    const frac = total ? s.n / total : 0
    const a = { ...s, dash: frac * C, offset: acc * C }
    acc += frac
    return a
  })
  return (
    <div style={{ background:T.bg, border:T.border, padding: isMobile ? '13px 14px' : '16px 18px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10, marginBottom:2, flexWrap:'wrap' }}>
        <h3 style={{ fontFamily:"'Lora',serif", fontSize:14, fontWeight:700, color:T.heading, margin:0 }}>{title}</h3>
        <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:T.sub }}>{tag}</span>
      </div>

      <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems:'center', gap: isMobile ? 12 : 16, marginTop:10 }}>
        <div style={{ position:'relative', flexShrink:0, width:150, height:150 }}>
          <svg width={150} height={150} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={R} fill="none" stroke={T.ring} strokeWidth={SW}/>
            {arcs.map((s, i) => (
              <circle key={i} cx="60" cy="60" r={R} fill="none" stroke={s.color} strokeWidth={SW}
                strokeDasharray={`${s.dash} ${C}`} strokeDashoffset={-s.offset} transform="rotate(-90 60 60)"/>
            ))}
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:"'Lora',serif", fontSize:28, fontWeight:700, color:T.center, lineHeight:1 }}>{total}</span>
            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, color:T.centerSub, letterSpacing:'.06em', textTransform:'uppercase', marginTop:2 }}>cases</span>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:5, flex:1, width: isMobile ? '100%' : 'auto' }}>
          {legend.map(l => (
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:7, fontFamily:"'Nunito Sans',sans-serif", fontSize:11 }}>
              <span style={{ width:9, height:9, borderRadius:2, background:l.color, flexShrink:0 }}/>
              <span style={{ color:T.label, fontWeight:700 }}>{l.label}</span>
              <span style={{ flex:1, height:1, background:T.divider }}/>
              <span style={{ color:T.count, fontVariantNumeric:'tabular-nums' }}>{l.n}</span>
              <span style={{ color:T.pctMut, width:32, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{pctOf(l.n)}%</span>
            </div>
          ))}
        </div>
      </div>

      {expl && expl.length > 0 && (
        <div style={{ marginTop:12, paddingTop:10, borderTop:`1px solid ${T.divider}` }}>
          <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:9, fontWeight:700, color:T.explHead, letterSpacing:'.1em', textTransform:'uppercase', margin:'0 0 7px' }}>{explHead}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {expl.map(e => (
              <div key={e.label} style={{ display:'flex', gap:7, alignItems:'flex-start' }}>
                <span style={{ width:8, height:8, borderRadius:2, background:e.color, marginTop:3, flexShrink:0 }}/>
                <p style={{ margin:0, fontFamily:"'Nunito Sans',sans-serif", fontSize:10, lineHeight:1.45, color:T.desc }}>
                  <strong style={{ color:e.color }}>{e.label}</strong> — {e.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const ARCHS = [
  { id:'naive',      label:'The Naive',      color:'#4A78B0', desc:'First serious relationship — the warning signs aren’t yet recognisable. ~17–19.' },
  { id:'precocious', label:'The Precocious', color:'#C06020', desc:'Young, often an age-gap or fast-moving dynamic. ~21–23.' },
  { id:'allin',      label:'The All-In',     color:'#9A6ADA', desc:'Married or long-term — control quietly tightens. ~24–27.' },
  { id:'onoff',      label:'The On & Off',   color:'#D0466A', desc:'Co-parents and on/off partners; danger peaks around separation. ~25–40.' },
  { id:'other',      label:'Unclassified',   color:'#9A8A92' },
]

export function ArchetypeDonut({ isMobile = false }) {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    sb.from('femicide_cases').select('archetype').eq('published', true).then(({ data }) => setRows(data || []))
  }, [])
  if (!rows) return null
  const count = id => id === 'other'
    ? rows.filter(c => !ARCHS.slice(0, 4).some(a => a.id === c.archetype)).length
    : rows.filter(c => c.archetype === id).length
  const segs   = ARCHS.map(a => ({ color:a.color, n:count(a.id) }))
  const legend = ARCHS.map(a => ({ label:a.label, color:a.color, n:count(a.id) }))
  const expl   = ARCHS.filter(a => a.desc).map(a => ({ label:a.label, color:a.color, desc:a.desc }))
  return <DonutCard title="Cases by archetype" tag="relationship pattern"
    segs={segs} legend={legend} explHead="What the archetypes mean" expl={expl} isMobile={isMobile}/>
}

const LANES = [
  { id:'understand', label:'Understand', color:'#9A6ADA', desc:'What is turning boys into men who harm?' },
  { id:'interrupt',  label:'Interrupt',  color:'#E8A13C', desc:'Where can we intervene before harm happens?' },
  { id:'build',      label:'Build',      color:'#DC2626', desc:'What do we create to prevent the next death?' },
]

export function StrategyDonut({ isMobile = false }) {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    sb.from('femicide_cases').select('halafu_lane').eq('published', true).then(({ data }) => setRows(data || []))
  }, [])
  if (!rows) return null
  const laneCount = id => rows.filter(c => c.halafu_lane === id).length
  const unattributed = rows.length - rows.filter(c => c.halafu_lane).length
  const segs = [
    ...LANES.map(l => ({ color:l.color, n:laneCount(l.id) })),
    { color:'#8A8A9A', n:unattributed },
  ]
  const legend = [
    ...LANES.map(l => ({ label:l.label, color:l.color, n:laneCount(l.id) })),
    { label:'Unattributed', color:'#8A8A9A', n:unattributed },
  ]
  const expl = LANES.map(l => ({ label:l.label, color:l.color, desc:l.desc }))
  return <DonutCard title="Cases by response strategy" tag="Halafu? lane"
    segs={segs} legend={legend} explHead="What the lanes mean" expl={expl} isMobile={isMobile}/>
}

import React from 'react'

// Donut breakdown of femicide cases across the four relationship archetypes,
// with a value/percentage legend and a short explainer of what each archetype means.
// One `cases` array in; each item may carry `archetype` (naive|precocious|allin|onoff).
// Untagged / non-intimate-partner cases fall into "Unclassified".
const ARCHS = [
  { id:'naive',      label:'The Naive',      color:'#2E5C93',
    desc:'A first serious relationship — the warning signs aren’t yet recognisable. Typically 17–19.' },
  { id:'precocious', label:'The Precocious', color:'#C06020',
    desc:'Young, often in an age-gap or fast-moving dynamic. Typically 21–23.' },
  { id:'allin',      label:'The All-In',     color:'#7A4ABA',
    desc:'Fully committed — married or long-term — as control quietly tightens. Typically 24–27.' },
  { id:'onoff',      label:'The On & Off',   color:'#8A1030',
    desc:'Co-parents and long-term on/off partners; danger peaks around separation and reconciliation. Typically 25–40.' },
  { id:'other',      label:'Unclassified',   color:'#9A8A92' },
]

export default function ArchetypeBreakdown({ cases = [], isMobile = false }) {
  const counts = { naive:0, precocious:0, allin:0, onoff:0, other:0 }
  cases.forEach(c => {
    const a = c && c.archetype
    if (a && counts[a] !== undefined) counts[a]++
    else counts.other++
  })
  const total = cases.length

  const R = 54, C = 2 * Math.PI * R, SW = 18
  let acc = 0
  const segments = ARCHS.map(a => {
    const n = counts[a.id]
    const frac = total ? n / total : 0
    const seg = { ...a, dash: frac * C, offset: acc * C, n }
    acc += frac
    return seg
  }).filter(s => s.n > 0)

  return (
    <div style={{ background:'#fff', border:'1px solid #E6D6DC', borderTop:'3px solid #8A1030',
      padding: isMobile ? '18px 16px' : '24px 26px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12,
        marginBottom:4, flexWrap:'wrap' }}>
        <h3 style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:700, color:'#180410', margin:0 }}>
          Cases by archetype
        </h3>
        <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:'#7A4A60' }}>
          relationship pattern per case
        </span>
      </div>

      <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems:'center',
        gap: isMobile ? 18 : 28, marginTop:16 }}>
        <div style={{ position:'relative', flexShrink:0, width:150, height:150 }}>
          <svg width={150} height={150} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={R} fill="none" stroke="#F1E4EA" strokeWidth={SW}/>
            {segments.map(s => (
              <circle key={s.id} cx="60" cy="60" r={R} fill="none" stroke={s.color} strokeWidth={SW}
                strokeDasharray={`${s.dash} ${C}`} strokeDashoffset={-s.offset}
                transform="rotate(-90 60 60)"/>
            ))}
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:"'Lora',serif", fontSize:30, fontWeight:700, color:'#180410', lineHeight:1 }}>{total}</span>
            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:'#7A4A60',
              letterSpacing:'.06em', textTransform:'uppercase', marginTop:2 }}>cases</span>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:9, flex:1, width: isMobile ? '100%' : 'auto' }}>
          {ARCHS.map(a => {
            const n = counts[a.id]
            const pct = total ? Math.round((n / total) * 100) : 0
            return (
              <div key={a.id} style={{ display:'flex', alignItems:'center', gap:9,
                fontFamily:"'Nunito Sans',sans-serif", fontSize:12.5 }}>
                <span style={{ width:11, height:11, borderRadius:3, background:a.color, flexShrink:0 }}/>
                <span style={{ color:'#180410', fontWeight:700 }}>{a.label}</span>
                <span style={{ flex:1, height:1, background:'#F4EAEE' }}/>
                <span style={{ color:'#7A4A60', fontVariantNumeric:'tabular-nums' }}>{n}</span>
                <span style={{ color:'#9A7A88', width:36, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid #F0E2E8' }}>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700, color:'#8A1030',
          letterSpacing:'.1em', textTransform:'uppercase', margin:'0 0 10px' }}>
          What the archetypes mean
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {ARCHS.filter(a => a.desc).map(a => (
            <div key={a.id} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
              <span style={{ width:9, height:9, borderRadius:2, background:a.color, marginTop:4, flexShrink:0 }}/>
              <p style={{ margin:0, fontFamily:"'Nunito Sans',sans-serif", fontSize:11.5, lineHeight:1.55, color:'#5A3A48' }}>
                <strong style={{ color:a.color }}>{a.label}</strong> — {a.desc}
              </p>
            </div>
          ))}
        </div>
        <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:'#A08890',
          margin:'12px 0 0', fontStyle:'italic', lineHeight:1.5 }}>
          "Unclassified" covers cases not yet tagged or outside the four intimate-partner archetypes.
        </p>
      </div>
    </div>
  )
}

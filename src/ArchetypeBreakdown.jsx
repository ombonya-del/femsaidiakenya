import React from 'react'

// Presentational breakdown of femicide cases across the four relationship archetypes.
// Fed a `cases` array (each item may carry an `archetype` field: naive|precocious|allin|onoff).
// Anything untagged or outside the four intimate-partner archetypes falls into "Unclassified".
const ARCHS = [
  { id:'naive',      label:'The Naive',      color:'#1A3F6F' },
  { id:'precocious', label:'The Precocious', color:'#C06020' },
  { id:'allin',      label:'The All-In',     color:'#7A4ABA' },
  { id:'onoff',      label:'The On & Off',   color:'#8A1030' },
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
  const max = Math.max(1, ...ARCHS.map(a => counts[a.id]))

  return (
    <div style={{ background:'#fff', border:'1px solid #E6D6DC', borderTop:'3px solid #8A1030',
      padding: isMobile ? '18px 16px' : '22px 24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12,
        marginBottom:4, flexWrap:'wrap' }}>
        <h3 style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:700, color:'#180410', margin:0 }}>
          Cases by archetype
        </h3>
        <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:'#7A4A60' }}>
          {total} documented case{total===1?'':'s'}
        </span>
      </div>
      <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:'#7A4A60',
        margin:'0 0 14px', lineHeight:1.5 }}>
        How the cases in our tracker map onto the four relationship archetypes.
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {ARCHS.map(a => {
          const n = counts[a.id]
          const pct = total ? Math.round((n / total) * 100) : 0
          const w = Math.round((n / max) * 100)
          return (
            <div key={a.id}>
              <div style={{ display:'flex', justifyContent:'space-between',
                fontFamily:"'Nunito Sans',sans-serif", fontSize:12, marginBottom:4 }}>
                <span style={{ color:'#180410', fontWeight:700 }}>
                  <span style={{ display:'inline-block', width:9, height:9, borderRadius:2,
                    background:a.color, marginRight:7 }}/>{a.label}
                </span>
                <span style={{ color:'#7A4A60' }}>{n} · {pct}%</span>
              </div>
              <div style={{ height:9, background:'#F0E6EA', borderRadius:5, overflow:'hidden' }}>
                <div style={{ width:`${w}%`, height:'100%', background:a.color, borderRadius:5,
                  transition:'width .4s' }}/>
              </div>
            </div>
          )
        })}
      </div>
      <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:'#A08890',
        margin:'14px 0 0', fontStyle:'italic', lineHeight:1.5 }}>
        Classification reflects the relationship pattern recorded for each case; "Unclassified"
        covers cases not yet tagged or outside the four intimate-partner archetypes.
      </p>
    </div>
  )
}

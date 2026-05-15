import { useState } from 'react'

const A   = '#8A1030'
const BD  = '#B89AAA'
const CRD = '#C4AABB'
const BG  = '#D4BEC4'
const TXT = '#180410'
const MUT = '#7A4A60'

// Risk levels based on case counts
const getRisk = (count) => {
  if (count >= 100) return { label:'Critical',      bg:'#8A1030', fg:'#fff', border:'#AA2050' }
  if (count >= 30)  return { label:'High',          bg:'#A03050', fg:'#fff', border:'#C05070' }
  if (count >= 15)  return { label:'Elevated',      bg:'#B05070', fg:'#fff', border:'#C07090' }
  if (count >= 5)   return { label:'Medium',        bg:'#C08898', fg:'#180410', border:'#D0A8B8' }
  if (count > 0)    return { label:'Low',           bg:'#C8A8B8', fg:'#180410', border:'#D8C0CC' }
  return               { label:'Gap / no data', bg:'#E0D0D8', fg:'#7A5068', border:'#C8B8C0' }
}

// Kenya county data with approximate SVG coordinates for a schematic map
// Using a grid-based positional layout that approximates Kenya's geography
const COUNTY_POSITIONS = [
  // Northern Kenya
  { n:'Turkana',    c:0,  x:120, y:60,  w:100, h:90 },
  { n:'Marsabit',   c:0,  x:230, y:30,  w:110, h:100 },
  { n:'Mandera',    c:0,  x:340, y:20,  w:90,  h:70 },
  { n:'Wajir',      c:0,  x:310, y:90,  w:100, h:90 },
  { n:'Garissa',    c:0,  x:290, y:185, w:100, h:80 },
  // West Kenya
  { n:'W. Pokot',   c:0,  x:100, y:155, w:60,  h:55 },
  { n:'Elgeyo',     c:0,  x:130, y:210, w:45,  h:45 },
  { n:'Trans N.',   c:13, x:85,  y:155, w:50,  h:50 },
  { n:'Bungoma',    c:5,  x:60,  y:205, w:55,  h:45 },
  { n:'Kakamega',   c:11, x:65,  y:250, w:55,  h:45 },
  { n:'Vihiga',     c:2,  x:70,  y:295, w:40,  h:35 },
  { n:'Siaya',      c:2,  x:60,  y:330, w:55,  h:45 },
  { n:'Kisumu',     c:31, x:100, y:310, w:60,  h:50 },
  { n:'Homa Bay',   c:4,  x:90,  y:358, w:65,  h:45 },
  { n:'Migori',     c:1,  x:85,  y:400, w:65,  h:45 },
  { n:'Kisii',      c:1,  x:140, y:360, w:50,  h:45 },
  { n:'Nyamira',    c:3,  x:150, y:315, w:45,  h:45 },
  // Rift Valley
  { n:'Samburu',    c:0,  x:195, y:120, w:75,  h:70 },
  { n:'Baringo',    c:3,  x:175, y:190, w:65,  h:60 },
  { n:'Laikipia',   c:3,  x:240, y:165, w:65,  h:60 },
  { n:'Nandi',      c:7,  x:155, y:250, w:55,  h:50 },
  { n:'Uasin G.',   c:15, x:140, y:200, w:55,  h:50 },
  { n:'Kericho',    c:2,  x:175, y:295, w:50,  h:45 },
  { n:'Bomet',      c:2,  x:175, y:340, w:50,  h:45 },
  { n:'Narok',      c:3,  x:185, y:380, w:70,  h:55 },
  { n:'Kajiado',    c:27, x:245, y:360, w:70,  h:80 },
  // Central Kenya
  { n:"Murang'a",   c:20, x:285, y:230, w:55,  h:50 },
  { n:'Nyeri',      c:10, x:265, y:180, w:55,  h:50 },
  { n:'Nyandarua',  c:1,  x:225, y:225, w:55,  h:50 },
  { n:'Kirinyaga',  c:5,  x:315, y:215, w:50,  h:45 },
  { n:'Embu',       c:6,  x:325, y:255, w:55,  h:50 },
  { n:'Meru',       c:12, x:295, y:140, w:75,  h:70 },
  { n:'Tharaka',    c:0,  x:345, y:185, w:55,  h:55 },
  // Nairobi metro
  { n:'Kiambu',     c:67, x:255, y:280, w:55,  h:48 },
  { n:'Nairobi',    c:142,x:255, y:326, w:55,  h:42 },
  { n:'Machakos',   c:22, x:305, y:300, w:60,  h:55 },
  { n:'Makueni',    c:1,  x:295, y:355, w:65,  h:55 },
  // Eastern
  { n:'Kitui',      c:1,  x:355, y:270, w:75,  h:90 },
  { n:'Tana R.',    c:0,  x:370, y:185, w:65,  h:90 },
  // Coast
  { n:'Kilifi',     c:18, x:365, y:360, w:65,  h:70 },
  { n:'Kwale',      c:24, x:300, y:410, w:65,  h:60 },
  { n:'Mombasa',    c:54, x:370, y:428, w:40,  h:38 },
  { n:'Taita-T.',   c:1,  x:310, y:455, w:65,  h:55 },
  { n:'Lamu',       c:0,  x:405, y:310, w:55,  h:60 },
  // Isiolo
  { n:'Isiolo',     c:0,  x:270, y:120, w:55,  h:50 },
]

const LEGEND = [
  { label:'Critical (100+)',    risk: getRisk(100) },
  { label:'High (30–99)',       risk: getRisk(50)  },
  { label:'Elevated (15–29)',   risk: getRisk(20)  },
  { label:'Medium (5–14)',      risk: getRisk(8)   },
  { label:'Low (1–4)',          risk: getRisk(2)   },
  { label:'Gap / no data',      risk: getRisk(0)   },
]

export default function KenyaCountyMap({ countyCounts = {} }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div style={{ width:'100%' }}>
      {/* Legend */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
        {LEGEND.map((l, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:12, height:12, background:l.risk.bg, border:`1px solid ${l.risk.border}` }}/>
            <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:MUT }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Map container */}
      <div style={{ position:'relative', width:'100%', background:'#E8DDE4', border:`1px solid ${BD}`, overflow:'hidden' }}>
        <svg
          viewBox="0 0 470 520"
          style={{ width:'100%', display:'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <rect width="470" height="520" fill="#E8DDE4"/>

          {/* Title */}
          <text x="10" y="18" fontFamily="'Nunito Sans',sans-serif" fontSize="9"
            fill={MUT} letterSpacing="2" textAnchor="start">KENYA · COUNTY RISK MAP · FEMICIDE CASES</text>

          {/* Counties */}
          {COUNTY_POSITIONS.map((county, i) => {
            const liveCount = countyCounts[county.n] ||
                              countyCounts[county.n + ' County'] ||
                              county.c
            const risk      = getRisk(liveCount)
            const isHovered = hovered === county.n

            return (
              <g key={i}
                onMouseEnter={() => setHovered(county.n)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor:'pointer' }}>
                <rect
                  x={county.x} y={county.y}
                  width={county.w} height={county.h}
                  fill={risk.bg}
                  stroke={isHovered ? TXT : risk.border}
                  strokeWidth={isHovered ? 2 : 1}
                  opacity={isHovered ? 1 : 0.9}
                />
                {/* County name */}
                <text
                  x={county.x + county.w / 2}
                  y={county.y + county.h / 2 - (liveCount > 0 ? 5 : 0)}
                  textAnchor="middle"
                  fontFamily="'Nunito Sans',sans-serif"
                  fontSize={county.w > 60 ? 9 : 8}
                  fontWeight="700"
                  fill={risk.fg}
                >
                  {county.n}
                </text>
                {/* Case count */}
                {liveCount > 0 && (
                  <text
                    x={county.x + county.w / 2}
                    y={county.y + county.h / 2 + 9}
                    textAnchor="middle"
                    fontFamily="'Lora',serif"
                    fontSize={county.w > 60 ? 11 : 9}
                    fontWeight="700"
                    fill={risk.fg}
                    opacity="0.85"
                  >
                    {liveCount}
                  </text>
                )}
              </g>
            )
          })}

          {/* Hover tooltip */}
          {hovered && (() => {
            const county = COUNTY_POSITIONS.find(c => c.n === hovered)
            if (!county) return null
            const liveCount = countyCounts[county.n] || countyCounts[county.n + ' County'] || county.c
            const risk      = getRisk(liveCount)
            const tx        = Math.min(county.x + county.w / 2, 360)
            const ty        = county.y > 260 ? county.y - 50 : county.y + county.h + 8
            return (
              <g>
                <rect x={tx - 60} y={ty} width={130} height={42}
                  fill={TXT} rx="2"/>
                <text x={tx + 5} y={ty + 14} textAnchor="middle"
                  fontFamily="'Lora',serif" fontSize="12" fontWeight="700" fill="#fff">
                  {county.n}
                </text>
                <text x={tx + 5} y={ty + 27} textAnchor="middle"
                  fontFamily="'Nunito Sans',sans-serif" fontSize="9" fill="rgba(255,255,255,0.7)">
                  {liveCount} reported cases · {risk.label}
                </text>
              </g>
            )
          })()}
        </svg>
      </div>

      <p style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:10, color:MUT, marginTop:8, lineHeight:1.6 }}>
        Case counts from verified femicide database · Hover over county for details · Updated in real time
      </p>
    </div>
  )
}
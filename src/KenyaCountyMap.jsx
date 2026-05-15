import { useState } from 'react'

const A   = '#8A1030'
const BD  = '#B89AAA'
const MUT = '#7A4A60'
const TXT = '#180410'

const getRisk = (count) => {
  if (count >= 100) return { label:'Critical',    bg:'#8A1030', fg:'#fff', border:'#AA2050' }
  if (count >= 30)  return { label:'High',        bg:'#A03050', fg:'#fff', border:'#C05070' }
  if (count >= 15)  return { label:'Elevated',    bg:'#B05070', fg:'#fff', border:'#C07090' }
  if (count >= 5)   return { label:'Medium',      bg:'#C08898', fg:'#180410', border:'#D0A8B8' }
  if (count > 0)    return { label:'Low',         bg:'#C8A8B8', fg:'#180410', border:'#D8C0CC' }
  return                   { label:'Gap',         bg:'#E0D0D8', fg:'#7A5068', border:'#C8B8C0' }
}

const COUNTIES = [
  {n:'Turkana',x:120,y:60,w:100,h:90,c:0},{n:'Marsabit',x:230,y:30,w:110,h:100,c:0},
  {n:'Mandera',x:340,y:20,w:90,h:70,c:0},{n:'Wajir',x:310,y:90,w:100,h:90,c:0},
  {n:'Garissa',x:290,y:185,w:100,h:80,c:0},{n:'W. Pokot',x:100,y:155,w:60,h:55,c:0},
  {n:'Elgeyo',x:130,y:210,w:45,h:45,c:0},{n:'Trans N.',x:85,y:155,w:50,h:50,c:13},
  {n:'Bungoma',x:60,y:205,w:55,h:45,c:5},{n:'Kakamega',x:65,y:250,w:55,h:45,c:11},
  {n:'Vihiga',x:70,y:295,w:40,h:35,c:2},{n:'Siaya',x:60,y:330,w:55,h:45,c:2},
  {n:'Kisumu',x:100,y:310,w:60,h:50,c:31},{n:'Homa Bay',x:90,y:358,w:65,h:45,c:4},
  {n:'Migori',x:85,y:400,w:65,h:45,c:1},{n:'Kisii',x:140,y:360,w:50,h:45,c:1},
  {n:'Nyamira',x:150,y:315,w:45,h:45,c:3},{n:'Samburu',x:195,y:120,w:75,h:70,c:0},
  {n:'Baringo',x:175,y:190,w:65,h:60,c:3},{n:'Laikipia',x:240,y:165,w:65,h:60,c:3},
  {n:'Nandi',x:155,y:250,w:55,h:50,c:7},{n:'Uasin G.',x:140,y:200,w:55,h:50,c:15},
  {n:'Kericho',x:175,y:295,w:50,h:45,c:2},{n:'Bomet',x:175,y:340,w:50,h:45,c:2},
  {n:'Narok',x:185,y:380,w:70,h:55,c:3},{n:'Kajiado',x:245,y:360,w:70,h:80,c:27},
  {n:"Murang'a",x:285,y:230,w:55,h:50,c:20},{n:'Nyeri',x:265,y:180,w:55,h:50,c:10},
  {n:'Nyandarua',x:225,y:225,w:55,h:50,c:1},{n:'Kirinyaga',x:315,y:215,w:50,h:45,c:5},
  {n:'Embu',x:325,y:255,w:55,h:50,c:6},{n:'Meru',x:295,y:140,w:75,h:70,c:12},
  {n:'Tharaka',x:345,y:185,w:55,h:55,c:0},{n:'Kiambu',x:255,y:280,w:55,h:48,c:67},
  {n:'Nairobi',x:255,y:326,w:55,h:42,c:142},{n:'Machakos',x:305,y:300,w:60,h:55,c:22},
  {n:'Makueni',x:295,y:355,w:65,h:55,c:1},{n:'Kitui',x:355,y:270,w:75,h:90,c:1},
  {n:'Tana R.',x:370,y:185,w:65,h:90,c:0},{n:'Kilifi',x:365,y:360,w:65,h:70,c:18},
  {n:'Kwale',x:300,y:410,w:65,h:60,c:24},{n:'Mombasa',x:370,y:428,w:40,h:38,c:54},
  {n:'Taita-T.',x:310,y:455,w:65,h:55,c:1},{n:'Lamu',x:405,y:310,w:55,h:60,c:0},
  {n:'Isiolo',x:270,y:120,w:55,h:50,c:0},
]

const LEGEND = [
  {label:'Critical (100+)',c:100},{label:'High (30–99)',c:50},
  {label:'Elevated (15–29)',c:20},{label:'Medium (5–14)',c:8},
  {label:'Low (1–4)',c:2},{label:'Gap / no data',c:0},
]

export default function KenyaCountyMap({ countyCounts = {} }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div style={{width:'100%'}}>
      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
        {LEGEND.map((l,i) => {
          const r = getRisk(l.c)
          return (
            <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:12,height:12,background:r.bg,border:`1px solid ${r.border}`}}/>
              <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT}}>{l.label}</span>
            </div>
          )
        })}
      </div>
      <div style={{position:'relative',width:'100%',background:'#E8DDE4',border:`1px solid ${BD}`,overflow:'hidden'}}>
        <svg viewBox="0 0 470 520" style={{width:'100%',display:'block'}} xmlns="http://www.w3.org/2000/svg">
          <rect width="470" height="520" fill="#E8DDE4"/>
          <text x="10" y="18" fontFamily="'Nunito Sans',sans-serif" fontSize="9" fill={MUT} letterSpacing="2">KENYA · COUNTY RISK MAP · FEMICIDE CASES</text>
          {COUNTIES.map((county,i) => {
            const liveCount = countyCounts[county.n] || countyCounts[county.n+' County'] || county.c
            const risk = getRisk(liveCount)
            const isHov = hovered === county.n
            return (
              <g key={i} onMouseEnter={()=>setHovered(county.n)} onMouseLeave={()=>setHovered(null)} style={{cursor:'pointer'}}>
                <rect x={county.x} y={county.y} width={county.w} height={county.h}
                  fill={risk.bg} stroke={isHov?TXT:risk.border} strokeWidth={isHov?2:1} opacity={isHov?1:0.9}/>
                <text x={county.x+county.w/2} y={county.y+county.h/2-(liveCount>0?5:0)}
                  textAnchor="middle" fontFamily="'Nunito Sans',sans-serif"
                  fontSize={county.w>60?9:8} fontWeight="700" fill={risk.fg}>{county.n}</text>
                {liveCount>0&&<text x={county.x+county.w/2} y={county.y+county.h/2+9}
                  textAnchor="middle" fontFamily="'Lora',serif"
                  fontSize={county.w>60?11:9} fontWeight="700" fill={risk.fg} opacity="0.85">{liveCount}</text>}
              </g>
            )
          })}
          {hovered&&(()=>{
            const county=COUNTIES.find(c=>c.n===hovered)
            if(!county)return null
            const liveCount=countyCounts[county.n]||countyCounts[county.n+' County']||county.c
            const risk=getRisk(liveCount)
            const tx=Math.min(county.x+county.w/2,350)
            const ty=county.y>260?county.y-52:county.y+county.h+8
            return(
              <g>
                <rect x={tx-65} y={ty} width={140} height={44} fill={TXT} rx="2"/>
                <text x={tx+5} y={ty+15} textAnchor="middle" fontFamily="'Lora',serif" fontSize="12" fontWeight="700" fill="#fff">{county.n}</text>
                <text x={tx+5} y={ty+30} textAnchor="middle" fontFamily="'Nunito Sans',sans-serif" fontSize="9" fill="rgba(255,255,255,0.7)">{liveCount} cases · {risk.label}</text>
              </g>
            )
          })()}
        </svg>
      </div>
      <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT,marginTop:8,lineHeight:1.6}}>
        Live counts from verified femicide database · Hover for details
      </p>
    </div>
  )
}

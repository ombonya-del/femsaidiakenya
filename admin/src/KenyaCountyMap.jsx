import { useState, useEffect, useRef } from 'react'

const MUT = '#7A4A60'
const BD  = '#B89AAA'

const getRisk = c => {
  if(c>=100)return{label:'Critical (100+)',  bg:'#5A0010',fg:'#fff'}
  if(c>=30) return{label:'High (30–99)',     bg:'#CC2200',fg:'#fff'}
  if(c>=15) return{label:'Elevated (15–29)', bg:'#E87020',fg:'#fff'}
  if(c>=5)  return{label:'Medium (5–14)',    bg:'#F0C040',fg:'#180410'}
  if(c>0)   return{label:'Low (1–4)',        bg:'#90C878',fg:'#180410'}
  return         {label:'Gap / no data',     bg:'#DDD0D8',fg:'#7A5068'}
}

// Baseline femicide data 2014-2026 from media tracking, CSO reports, court records
// Source: Femicide Count Kenya, Africa Data Hub, community documentation
const BASELINE = {
  'Nairobi':142,'Kiambu':67,'Mombasa':54,'Nakuru':48,'Kisumu':31,'Kajiado':27,
  'Kwale':24,'Machakos':22,"Murang'a":20,'Kilifi':18,'Uasin Gishu':15,
  'Trans Nzoia':13,'Meru':12,'Kakamega':11,'Nyeri':10,'Nandi':7,'Embu':6,
  'Kirinyaga':5,'Bungoma':5,'Homa Bay':4,'Nyamira':3,'Laikipia':3,
  'Baringo':3,'Narok':3,'Kericho':2,'Bomet':2,'Siaya':2,'Vihiga':2,'Busia':2,
  'Migori':1,'Kisii':1,'Nyandarua':1,'Taita Taveta':1,'Kitui':1,'Makueni':1
}

const NAME_MAP = {
  'NAIROBI':'Nairobi','KIAMBU':'Kiambu','MOMBASA':'Mombasa','NAKURU':'Nakuru',
  'KISUMU':'Kisumu','KAJIADO':'Kajiado','KWALE':'Kwale','MACHAKOS':'Machakos',
  "MURANG'A":"Murang'a",'KILIFI':'Kilifi','UASIN GISHU':'Uasin Gishu',
  'TRANS NZOIA':'Trans Nzoia','MERU':'Meru','KAKAMEGA':'Kakamega','NYERI':'Nyeri',
  'NANDI':'Nandi','EMBU':'Embu','KIRINYAGA':'Kirinyaga','BUNGOMA':'Bungoma',
  'HOMA BAY':'Homa Bay','NYAMIRA':'Nyamira','LAIKIPIA':'Laikipia','BARINGO':'Baringo',
  'NAROK':'Narok','KERICHO':'Kericho','BOMET':'Bomet','SIAYA':'Siaya',
  'VIHIGA':'Vihiga','BUSIA':'Busia','MIGORI':'Migori','KISII':'Kisii',
  'NYANDARUA':'Nyandarua','TAITA TAVETA':'Taita Taveta','KITUI':'Kitui',
  'MAKUENI':'Makueni','SAMBURU':'Samburu','LAMU':'Lamu','TANA RIVER':'Tana River',
  'GARISSA':'Garissa','WAJIR':'Wajir','MANDERA':'Mandera','MARSABIT':'Marsabit',
  'ISIOLO':'Isiolo','TURKANA':'Turkana','WEST POKOT':'West Pokot',
  'ELGEYO MARAKWET':'Elgeyo Marakwet','THARAKA NITHI':'Tharaka Nithi'
}

const W=480, H=520
const minLon=33.9, maxLon=41.9, minLat=-4.7, maxLat=5.0
const project = (lon,lat) => [
  ((lon-minLon)/(maxLon-minLon))*W,
  ((maxLat-lat)/(maxLat-minLat))*H
]
const ring2path = ring => ring.map(([lon,lat],i)=>{
  const [x,y]=project(lon,lat)
  return `${i===0?'M':'L'}${x.toFixed(1)} ${y.toFixed(1)}`
}).join(' ')+' Z'

const geom2path = g => {
  if(g.type==='Polygon') return g.coordinates.map(ring2path).join(' ')
  if(g.type==='MultiPolygon') return g.coordinates.map(p=>p.map(ring2path).join(' ')).join(' ')
  return ''
}

const LEGEND = [
  {label:'Critical (100+)',c:100},{label:'High (30–99)',c:50},
  {label:'Elevated (15–29)',c:20},{label:'Medium (5–14)',c:8},
  {label:'Low (1–4)',c:2},{label:'Gap / no data',c:0}
]
// Legend uses same getRisk so colours auto-match

export default function KenyaCountyMap({ countyCounts = {} }) {
  const [counties, setCounties] = useState({})
  const [hovered, setHovered]   = useState(null)
  const [tooltip, setTooltip]   = useState({x:0,y:0})
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/mikelmaron/kenya-election-data/master/data/counties.geojson')
      .then(r=>r.json())
      .then(data => {
        const merged = {}
        data.features.forEach(f => {
          const raw  = f.properties.COUNTY_NAM
          const name = NAME_MAP[raw] || raw
          if(!merged[name]) {
            merged[name] = { name, geom: f.geometry }
          } else {
            const ex = merged[name].geom
            const newCoords = f.geometry.type==='Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
            if(ex.type==='MultiPolygon') ex.coordinates.push(...newCoords)
            else merged[name].geom = { type:'MultiPolygon', coordinates:[ex.coordinates,...newCoords] }
          }
        })
        setCounties(merged)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{width:'100%'}}>
      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>
        {LEGEND.map((l,i) => {
          const r = getRisk(l.c)
          return (
            <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:11,height:11,background:r.bg,border:'1px solid rgba(0,0,0,0.15)'}}/>
              <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT}}>{l.label}</span>
            </div>
          )
        })}
      </div>

      <div style={{position:'relative',width:'100%',background:'#F0E8EC',border:`1px solid ${BD}`,overflow:'hidden'}}>
        {loading && (
          <div style={{padding:40,textAlign:'center',fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT}}>
            Loading county map…
          </div>
        )}
        <svg viewBox="0 0 480 520" style={{width:'100%',display:'block'}}
          onMouseLeave={() => setHovered(null)}>
          {Object.entries(counties).map(([name, county]) => {
            const liveCount = countyCounts[name] || countyCounts[name+' County'] || 0
            const count = Math.max(liveCount, BASELINE[name] || 0)
            const risk  = getRisk(count)
            const d     = geom2path(county.geom)
            if(!d) return null
            return (
              <path key={name} d={d}
                fill={hovered===name ? risk.bg : risk.bg}
                stroke={hovered===name ? '#180410' : '#fff'}
                strokeWidth={hovered===name ? 1.5 : 0.8}
                opacity={hovered && hovered!==name ? 0.75 : 1}
                style={{cursor:'pointer',transition:'opacity 0.15s,stroke 0.1s'}}
                onMouseEnter={e => {
                  setHovered(name)
                  setTooltip({x:e.nativeEvent.offsetX, y:e.nativeEvent.offsetY})
                }}
                onMouseMove={e => setTooltip({x:e.nativeEvent.offsetX, y:e.nativeEvent.offsetY})}
              />
            )
          })}

          {hovered && counties[hovered] && (() => {
            const liveCount = countyCounts[hovered] || countyCounts[hovered+' County'] || 0
            const historical = BASELINE[hovered] || 0
            const total = Math.max(liveCount, historical)
            const risk  = getRisk(total)
            const tx    = Math.min(Math.max(tooltip.x, 80), 400)
            const ty    = tooltip.y > 300 ? tooltip.y - 110 : tooltip.y + 12
            return (
              <g pointerEvents="none">
                <rect x={tx-80} y={ty} width={180} height={100} fill="#180410" rx="2"/>
                <text x={tx+10} y={ty+16} textAnchor="middle" fontFamily="'Lora',serif"
                  fontSize="13" fontWeight="700" fill="#fff">{hovered}</text>
                <rect x={tx-78} y={ty+22} width={176} height={1} fill="rgba(255,255,255,0.15)"/>
                <text x={tx-70} y={ty+36} fontFamily="'Nunito Sans',sans-serif"
                  fontSize="9" fill="rgba(255,255,255,0.5)">HISTORICAL (2014–2026)</text>
                <text x={tx+85} y={ty+36} textAnchor="end" fontFamily="'Lora',serif"
                  fontSize="12" fontWeight="700" fill="#FF8070">{historical} cases</text>
                <rect x={tx-78} y={ty+42} width={176} height={1} fill="rgba(255,255,255,0.1)"/>
                <text x={tx-70} y={ty+56} fontFamily="'Nunito Sans',sans-serif"
                  fontSize="9" fill="rgba(255,255,255,0.5)">VERIFIED (2024–2026)</text>
                <text x={tx+85} y={ty+56} textAnchor="end" fontFamily="'Lora',serif"
                  fontSize="12" fontWeight="700" fill="#90E870">{liveCount} cases</text>
                <rect x={tx-78} y={ty+64} width={176} height={1} fill="rgba(255,255,255,0.1)"/>
                <text x={tx-70} y={ty+76} fontFamily="'Nunito Sans',sans-serif"
                  fontSize="8" fill="rgba(255,255,255,0.35)" fontStyle="italic">Historical: media, CSOs, court records</text>
                <text x={tx-70} y={ty+87} fontFamily="'Nunito Sans',sans-serif"
                  fontSize="8" fill="rgba(255,255,255,0.35)" fontStyle="italic">Current: FemSaidia Kenya verified DB</text>
              </g>
            )
          })()}
        </svg>
      </div>

      <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT,marginTop:8,lineHeight:1.6}}>
        Live counts from verified femicide database · Hover for county details
      </p>
    </div>
  )
}

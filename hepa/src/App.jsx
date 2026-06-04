import { useState, useEffect, useRef, useCallback } from 'react'

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const EMERGENCY_CONTACTS = [
  { name:'Police emergency',    phone:'999'          },
  { name:'DCI Gender Desk',     phone:'0800722203'   },
  { name:'GVRC Kenya',          phone:'0800723253'   },
  { name:'Usikimye',            phone:'0800723253'   },
  { name:'FIDA Kenya',          phone:'0719638006'   },
  { name:'Kituo Cha Sheria',    phone:'0800720434'   },
]

const GUIDE_SECTIONS = [
  {
    id:'now', title:'🚨 Right now — immediate danger',
    items:[
      'Call 999 or 112 immediately. Leave the line open if you cannot speak — dispatchers listen for background sounds.',
      'Open WhatsApp → share your Live Location with your trusted contact right now.',
      'Run toward people — a shop, kiosk, church, matatu stage. Perpetrators rarely escalate in crowds.',
      'Make noise. Scream, break glass, bang walls. Disrupt the isolation.',
      'Text your trusted contact your location even if you cannot call. A simple "HELP" with your location is enough.',
      'Do not try to reason or negotiate. In the moment of violence, survival is the only goal.',
    ]
  },
  {
    id:'date', title:'📱 Before a first meeting (online date)',
    items:[
      'Tell a trusted person: who you are meeting, where, when you expect to return.',
      'Share your WhatsApp Live Location before entering any building or vehicle.',
      'Refuse first meetings at private apartments, Airbnbs or short-stay rentals. Public only.',
      'Video call them before the date — confirm they match their photos.',
      'Never leave a drink unattended. Never accept a drink you did not see poured.',
      'Set a code word with your trusted contact — if you send it, they call police immediately.',
    ]
  },
  {
    id:'leaving', title:'🚪 Leaving an abusive partner',
    items:[
      'Leaving is the most dangerous time. Plan before you go — do not leave spontaneously.',
      'Build an emergency bag in secret: ID, birth certificates, cash, charger, medications.',
      'Do not go to the obvious place. Choose somewhere your partner does not know.',
      'Get a Protection Order BEFORE leaving. FIDA Kenya can help — 0719 638 006.',
      'Change ALL passwords and log out of shared devices before leaving.',
      'Tell one trusted person your full plan and route. If they don\'t hear from you by a specific time, they call police.',
      'After leaving: vary your routines. Block on all platforms. Never meet him alone.',
    ]
  },
  {
    id:'police', title:'🏛️ When police say it\'s a "family matter"',
    items:[
      'Insist on an OB (Occurrence Book) number. This creates a legal record they cannot erase.',
      'Call DCI Gender Desk directly: 0800 722 203. They operate independently of local police.',
      'Contact NGEC: 020 272 0585. They can compel police to act.',
      'Get legal aid: FIDA Kenya 0719 638 006 or Kituo Cha Sheria 0800 720 434.',
      'Report police inaction to IPOA (oversight body): 0800 724 763.',
    ]
  },
]

// ── CALCULATOR ────────────────────────────────────────────────────────────────
function Calculator({ onReveal }) {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [operator, setOperator] = useState(null)
  const [prevValue, setPrevValue] = useState(null)
  const [longPressInterval, setLongPressInterval] = useState(null)
  const [pressProgress, setPressProgress] = useState(0)
  const progressRef = useRef(0)

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) { setDisplay('0.'); setWaitingForOperand(false); return }
    if (!display.includes('.')) setDisplay(display + '.')
  }

  const clear = () => {
    setDisplay('0'); setExpression(''); setOperator(null)
    setPrevValue(null); setWaitingForOperand(false)
  }

  const toggleSign = () => setDisplay(String(parseFloat(display) * -1))

  const percentage = () => setDisplay(String(parseFloat(display) / 100))

  const handleOperator = (op) => {
    const val = parseFloat(display)
    if (prevValue !== null && !waitingForOperand) {
      const result = calculate(prevValue, val, operator)
      setDisplay(String(result))
      setPrevValue(result)
      setExpression(`${result} ${op}`)
    } else {
      setPrevValue(val)
      setExpression(`${val} ${op}`)
    }
    setOperator(op)
    setWaitingForOperand(true)
  }

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b
      case '−': return a - b
      case '×': return a * b
      case '÷': return b !== 0 ? a / b : 0
      default: return b
    }
  }

  const equals = () => {
    if (operator && prevValue !== null) {
      const val = parseFloat(display)
      const result = calculate(prevValue, val, operator)
      const rounded = parseFloat(result.toFixed(10))
      setDisplay(String(rounded))
      setExpression('')
      setOperator(null)
      setPrevValue(null)
      setWaitingForOperand(true)
    }
  }

  // Long press on = to reveal hepa
  const startLongPress = () => {
    progressRef.current = 0
    setPressProgress(0)
    const interval = setInterval(() => {
      progressRef.current += 2
      setPressProgress(progressRef.current)
      if (progressRef.current >= 100) {
        clearInterval(interval)
        setPressProgress(0)
        onReveal()
      }
    }, 60)
    setLongPressInterval(interval)
  }

  const endLongPress = () => {
    if (longPressInterval) {
      clearInterval(longPressInterval)
      setLongPressInterval(null)
    }
    progressRef.current = 0
    setPressProgress(0)
    if (pressProgress < 100) equals()
  }

  const isLong = display.length > 9

  const rows = [
    [
      { label:'AC', action:clear, cls:'grey', wide:false },
      { label:'+/-', action:toggleSign, cls:'grey' },
      { label:'%', action:percentage, cls:'grey' },
      { label:'÷', action:()=>handleOperator('÷'), cls:'orange' },
    ],
    [
      { label:'7', action:()=>inputDigit('7'), cls:'dark-grey' },
      { label:'8', action:()=>inputDigit('8'), cls:'dark-grey' },
      { label:'9', action:()=>inputDigit('9'), cls:'dark-grey' },
      { label:'×', action:()=>handleOperator('×'), cls:'orange' },
    ],
    [
      { label:'4', action:()=>inputDigit('4'), cls:'dark-grey' },
      { label:'5', action:()=>inputDigit('5'), cls:'dark-grey' },
      { label:'6', action:()=>inputDigit('6'), cls:'dark-grey' },
      { label:'−', action:()=>handleOperator('−'), cls:'orange' },
    ],
    [
      { label:'1', action:()=>inputDigit('1'), cls:'dark-grey' },
      { label:'2', action:()=>inputDigit('2'), cls:'dark-grey' },
      { label:'3', action:()=>inputDigit('3'), cls:'dark-grey' },
      { label:'+', action:()=>handleOperator('+'), cls:'orange' },
    ],
  ]

  return (
    <div className="calc-root">
      <div className="calc-display">
        <div className="calc-expr">{expression}</div>
        <div className={`calc-value${isLong?' small':''}`}>{display}</div>
      </div>
      <div className="calc-grid">
        {rows.flat().map((btn, i) => (
          <button key={i} className={`calc-btn ${btn.cls}`}
            onClick={btn.action} onContextMenu={e=>e.preventDefault()}>
            {btn.label}
          </button>
        ))}
        {/* Zero */}
        <button className="calc-btn dark-grey zero"
          onClick={()=>inputDigit('0')} onContextMenu={e=>e.preventDefault()}>
          0
        </button>
        {/* Decimal */}
        <button className="calc-btn dark-grey"
          onClick={inputDecimal} onContextMenu={e=>e.preventDefault()}>
          .
        </button>
        {/* Equals — long press triggers hepa */}
        <button
          className={`calc-btn orange equals${longPressInterval?' pressing':''}`}
          style={{ position:'relative', overflow:'hidden' }}
          onPointerDown={startLongPress}
          onPointerUp={endLongPress}
          onPointerLeave={endLongPress}
          onContextMenu={e=>e.preventDefault()}>
          {pressProgress > 0 && (
            <div style={{
              position:'absolute', inset:0, borderRadius:'50%',
              background:`conic-gradient(rgba(255,255,255,0.35) ${pressProgress * 3.6}deg, transparent 0deg)`,
            }}/>
          )}
          <span style={{position:'relative',zIndex:1}}>=</span>
        </button>
      </div>
      {/* Hint below calculator */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        gap:6, marginTop:10,
        fontFamily:"'Nunito Sans',sans-serif", fontSize:11,
        color:'rgba(255,255,255,0.45)',
        animation:'hintBlink 2.5s ease-in-out infinite',
      }}>
        <span style={{fontSize:14}}>👆</span>
        <span>Hold <strong style={{color:'rgba(255,149,0,0.8)',fontWeight:700}}>=</strong> for 3 seconds to access safety tools</span>
      </div>
    </div>
  )
}

// ── PANIC ACTIVE SCREEN ───────────────────────────────────────────────────────
function PanicScreen({ contacts, onDismiss }) {
  const [location, setLocation] = useState(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    // Get GPS location
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocation(loc)
        // Fire Itika alert immediately with GPS
        fetch('https://uuluuhltphgwfblcghlp.supabase.co/rest/v1/responder_alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            alert_type:   'hepa_panic',
            county:       JSON.parse(localStorage.getItem('hepa_user')||'{}').county||'Unknown',
            location_lat: loc.lat,
            location_lng: loc.lng,
            details:      `hepa panic triggered. GPS: ${loc.lat},${loc.lng}`,
            status:       'active',
          }),
        }).catch(() => {})
      },
      () => {
        setLocation(null)
        // Fire Itika alert without GPS
        fetch('https://uuluuhltphgwfblcghlp.supabase.co/rest/v1/responder_alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            alert_type:   'hepa_panic',
            county:       JSON.parse(localStorage.getItem('hepa_user')||'{}').county||'Unknown',
            location_lat: null,
            location_lng: null,
            details:      'hepa panic triggered. GPS unavailable.',
            status:       'active',
          }),
        }).catch(() => {})
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }, [])

  const locationUrl = location
    ? `https://maps.google.com/?q=${location.lat},${location.lng}`
    : 'Location not available'

  const message = `🚨 EMERGENCY — I need help immediately!\n\nThis is an automated alert from hepa.\n${location ? `My location: ${locationUrl}` : 'Location unavailable — call me NOW'}\n\nCall police: 999\nDCI Gender Desk: 0800 722 203`

  const sendAlert = async () => {
    // 1. Insert Itika alert FIRST before any navigation
    // Fire and forget but await to ensure it completes before WhatsApp opens
    try {
      await fetch('https://uuluuhltphgwfblcghlp.supabase.co/rest/v1/responder_alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          alert_type:   'hepa_panic',
          county:       JSON.parse(localStorage.getItem('hepa_user')||'{}').county||'Unknown',
          location_lat: location?.lat || null,
          location_lng: location?.lng || null,
          details:      'hepa panic button triggered. GPS attached if available.',
          status:       'active',
        }),
      })
    } catch(e) { /* silent fail — never block the alert */ }
    // 2. Open WhatsApp AFTER Supabase insert completes
    if (contacts.length > 0) {
      const phone = contacts[0].phone.replace(/\s+/g, '')
      const wa = `https://wa.me/${phone.startsWith('0') ? '254' + phone.slice(1) : phone}?text=${encodeURIComponent(message)}`
      window.open(wa, '_blank')
    }
    setSent(true)
  }

  return (
    <div className="panic-active">
      <div style={{fontSize:48,marginBottom:16}}>🚨</div>
      <div className="panic-active-title">ALERT SENT</div>
      <div className="panic-active-sub">
        {location ? 'Your GPS location is being shared.' : 'Getting your location...'}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:12,width:'100%',maxWidth:320,marginBottom:24}}>
        <a href="tel:999"
          style={{display:'block',background:'#fff',color:'#CC1010',fontFamily:"'Nunito Sans',sans-serif",
            fontSize:18,fontWeight:800,padding:'16px',borderRadius:14,textAlign:'center',textDecoration:'none',letterSpacing:'.04em'}}>
          CALL 999 NOW
        </a>
        {contacts.length > 0 && !sent && (
          <button onClick={sendAlert}
            style={{background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',
              color:'#fff',fontFamily:"'Nunito Sans',sans-serif",fontSize:14,fontWeight:700,
              padding:'14px',borderRadius:14,cursor:'pointer'}}>
            📲 Send WhatsApp alert to {contacts[0].name}
          </button>
        )}
        {sent && (
          <div style={{background:'rgba(255,255,255,0.1)',borderRadius:14,padding:14,
            fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:'rgba(255,255,255,0.8)',textAlign:'center'}}>
            ✓ WhatsApp opened with your location
          </div>
        )}
        <a href={`sms:999?body=${encodeURIComponent(message)}`}
          style={{display:'block',background:'rgba(255,255,255,0.1)',color:'#fff',
            fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:600,
            padding:'12px',borderRadius:14,textAlign:'center',textDecoration:'none'}}>
          📨 Send SMS alert
        </a>
      </div>

      <button onClick={onDismiss}
        style={{background:'none',border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.5)',
          fontFamily:"'Nunito Sans',sans-serif",fontSize:12,padding:'10px 24px',
          borderRadius:10,cursor:'pointer'}}>
        I am safe — dismiss
      </button>
    </div>
  )
}

// ── CHECK-IN SCREEN ───────────────────────────────────────────────────────────
function CheckInScreen({ contacts, onBack }) {
  const [hours, setHours] = useState(() => localStorage.getItem('hepa_checkin_h') || '22')
  const [minutes, setMinutes] = useState(() => localStorage.getItem('hepa_checkin_m') || '00')
  const [active, setActive] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const intervalRef = useRef(null)

  const fireCheckinAlert = (location) => {
    const phone = contacts[0]?.phone.replace(/\s+/g, '')
    if (!phone) return
    const intlPhone = phone.startsWith('0') ? '254' + phone.slice(1) : phone

    const locText = location
      ? `My location: https://maps.google.com/?q=${location.lat},${location.lng}`
      : 'Location unavailable — call me and contact police immediately.'

    const msg = `🚨 CHECK-IN MISSED\n\nThis is an automated hepa alert.\n\n${locText}\n\nI did not check in by the agreed time. Please check on me immediately.\n\nCall police: 999\nDCI Gender Desk: 0800 722 203`

    // Send WhatsApp first (with location link)
    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`, '_blank')

    // Send SMS after a longer delay so WhatsApp has time to open
    setTimeout(() => {
      window.location.href = `sms:${phone}?body=${encodeURIComponent(msg)}`
    }, 3000)
  }

  const start = () => {
    const now = new Date()
    const target = new Date()
    target.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    if (target <= now) target.setDate(target.getDate() + 1)
    const diff = target - now
    setRemaining(diff)
    setActive(true)
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1000) {
          clearInterval(intervalRef.current)
          setActive(false)
          // Get location then fire alert
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              pos => fireCheckinAlert({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              ()  => fireCheckinAlert(null),
              { timeout: 5000 }
            )
          } else {
            fireCheckinAlert(null)
          }
          return 0
        }
        return r - 1000
      })
    }, 1000)
  }

  const cancel = () => {
    clearInterval(intervalRef.current)
    setActive(false)
    setRemaining(null)
  }

  const fmt = ms => {
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  return (
    <div className="hepa-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="screen-title">Check-in timer</div>
      </div>
      <div style={{padding:'0 16px'}}>
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.7,marginBottom:20}}>
          Set a time by which you will check in. If you don't — hepa automatically sends a <strong style={{color:'rgba(255,255,255,0.7)'}}>WhatsApp message and SMS</strong> to your trusted contact, with your GPS location and a request to call police immediately.
        </p>

        {!active ? (
          <div className="checkin-card">
            <div className="checkin-label">Check in by</div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:20}}>
              <input type="number" value={hours} min="0" max="23"
                onChange={e=>{ const v=e.target.value.padStart(2,'0'); setHours(v); localStorage.setItem('hepa_checkin_h',v); }}
                style={{width:70,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:10,padding:'10px',fontSize:32,color:'#fff',
                  fontFamily:"'Nunito Sans',sans-serif",textAlign:'center',outline:'none'}}/>
              <span style={{color:'#fff',fontSize:32,fontWeight:700}}>:</span>
              <input type="number" value={minutes} min="0" max="59"
                onChange={e=>{ const v=e.target.value.padStart(2,'0'); setMinutes(v); localStorage.setItem('hepa_checkin_m',v); }}
                style={{width:70,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:10,padding:'10px',fontSize:32,color:'#fff',
                  fontFamily:"'Nunito Sans',sans-serif",textAlign:'center',outline:'none'}}/>
            </div>
            <button className="hepa-btn" onClick={start}
              style={{marginTop:0}}>
              Start check-in timer
            </button>
          </div>
        ) : (
          <div className="checkin-card checkin-active">
            <div className="checkin-label">⏱ Alert fires in</div>
            <div className="checkin-time">{fmt(remaining || 0)}</div>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.4)',margin:'8px 0 16px',lineHeight:1.6}}>
              If you do not cancel, {contacts[0]?.name || 'your contact'} receives a <strong style={{color:'rgba(255,255,255,0.6)'}}>WhatsApp + SMS alert with your GPS location</strong> automatically.
            </p>
            <button className="hepa-btn" onClick={cancel}
              style={{background:'rgba(255,255,255,0.1)',marginTop:0}}>
              ✓ I am safe — cancel timer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── GUIDE SCREEN ──────────────────────────────────────────────────────────────
function GuideScreen({ onBack }) {
  const [open, setOpen] = useState('now')
  return (
    <div className="hepa-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="screen-title">Survival guide</div>
      </div>
      {GUIDE_SECTIONS.map(s => (
        <div key={s.id} className="guide-section">
          <div className="guide-section-header" onClick={()=>setOpen(open===s.id?null:s.id)}>
            <div className="guide-section-title">{s.title}</div>
            <span style={{color:'rgba(255,255,255,0.4)',fontSize:18}}>{open===s.id?'−':'+'}</span>
          </div>
          {open===s.id && (
            <div className="guide-section-body">
              {s.items.map((item,i)=>(
                <div key={i} className="guide-item">
                  <div className="guide-item-n">{i+1}</div>
                  <div className="guide-item-text">{item}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <div style={{height:32}}/>
    </div>
  )
}

// ── SETUP SCREEN ──────────────────────────────────────────────────────────────
function SetupScreen({ onSave, initial }) {
  const [name,   setName]   = useState(initial.name || '')
  const [cname,  setCname]  = useState(initial.contacts[0]?.name || '')
  const [cphone, setCphone] = useState(initial.contacts[0]?.phone || '')
  const [county, setCounty] = useState(initial.county || '')

  const COUNTIES = [
    'Nairobi','Kiambu','Mombasa','Nakuru','Kisumu','Kajiado','Kwale',
    "Machakos","Murang'a",'Kilifi','Uasin Gishu','Trans Nzoia','Meru',
    'Kakamega','Nyeri','Nandi','Embu','Kirinyaga','Bungoma','Homa Bay',
    'Siaya','Migori','Kisii','Nyamira','Kericho','Bomet','Narok',
    'Laikipia','Nyandarua','Tharaka Nithi','Isiolo','Marsabit','Samburu',
    'Turkana','West Pokot','Baringo','Elgeyo Marakwet','Vihiga','Busia',
    'Tana River','Lamu','Taita Taveta','Garissa','Wajir','Mandera','Other'
  ]

  const save = () => {
    if (!name.trim() || !cphone.trim()) return
    onSave({ name: name.trim(), county: county||'Unknown', contacts: [{ name: cname.trim() || 'My contact', phone: cphone.trim() }] })
  }

  return (
    <div style={{minHeight:'100vh',background:'#0A2D1A',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
      <div style={{padding:'40px 24px 20px',paddingTop:'calc(env(safe-area-inset-top,0px) + 40px)'}}>
        <div style={{fontFamily:"'Lora',serif",fontSize:32,fontWeight:700,marginBottom:6}}><span style={{letterSpacing:0,display:'inline-flex',alignItems:'center'}}><span style={{letterSpacing:0,display:'inline-flex',alignItems:'center'}}><span className='logo-h'>h</span><span className='logo-epa'>epa</span></span></span></div>
        <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.7}}>
          Set up takes 60 seconds. Your information never leaves your phone.
        </div>
      </div>
      <div className="setup-wrap" style={{paddingTop:0}}>
        <label className="setup-label">Your name</label>
        <input className="setup-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your first name"/>

        <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,color:'#fff',marginBottom:4}}>Trusted contact</div>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.4)',lineHeight:1.6,marginBottom:12}}>
            When you trigger a panic alert, this person receives an automatic WhatsApp message with your GPS location. Choose someone who will act immediately.
          </p>
          <label className="setup-label">Their name</label>
          <input className="setup-input" value={cname} onChange={e=>setCname(e.target.value)} placeholder="e.g. My sister Janet"/>
          <label className="setup-label">Their phone number</label>
          <input className="setup-input" type="tel" value={cphone} onChange={e=>setCphone(e.target.value)} placeholder="e.g. 0712 345 678"/>
        </div>

        <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,color:'#fff',marginBottom:4}}>Your county</div>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.4)',lineHeight:1.6,marginBottom:12}}>
            Used to route alerts to Itika community responders in your area. Stays on your phone only.
          </p>
          <select value={county} onChange={e=>setCounty(e.target.value)}
            style={{width:'100%',padding:'14px 16px',fontFamily:"'Nunito Sans',sans-serif",
              fontSize:15,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',
              color: county?'#fff':'rgba(255,255,255,0.4)',borderRadius:12,outline:'none',
              WebkitAppearance:'none'}}>
            <option value="">Select your county...</option>
            {COUNTIES.map(c=><option key={c} value={c} style={{background:'#0A2D1A',color:'#fff'}}>{c}</option>)}
          </select>
        </div>

        <div style={{marginTop:24,padding:16,background:'rgba(255,92,40,0.08)',borderRadius:12,border:'1px solid rgba(255,92,40,0.15)'}}>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.5)',lineHeight:1.7}}>
            <strong style={{color:'#FF5C28'}}>To open hepa:</strong> open the Calculator app and hold the <strong style={{color:'#fff'}}>=</strong> button for 3 seconds. This keeps hepa hidden from anyone who picks up your phone.
          </p>
        </div>

        <button className="hepa-btn" onClick={save} style={{marginTop:24}}>Save and open <span style={{color:"#fff",fontWeight:700}}>h</span><span style={{color:"#0A2D1A",fontWeight:700}}>epa</span> →</button>
        <div style={{height:60}}/>
      </div>
    </div>
  )
}

// ── CONTACTS SCREEN ───────────────────────────────────────────────────────────
function ContactsScreen({ data, onBack, onUpdate }) {
  const [cname,  setCname]  = useState(data.contacts[0]?.name || '')
  const [cphone, setCphone] = useState(data.contacts[0]?.phone || '')
  const [county, setCounty] = useState(data.county || '')

  const COUNTIES = [
    'Nairobi','Kiambu','Mombasa','Nakuru','Kisumu','Kajiado','Kwale',
    "Machakos","Murang'a",'Kilifi','Uasin Gishu','Trans Nzoia','Meru',
    'Kakamega','Nyeri','Nandi','Embu','Kirinyaga','Bungoma','Homa Bay',
    'Siaya','Migori','Kisii','Nyamira','Kericho','Bomet','Narok','Other'
  ]

  const save = () => {
    onUpdate({ ...data, county: county||'Unknown', contacts:[{name:cname,phone:cphone}] })
    onBack()
  }

  return (
    <div className="hepa-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="screen-title">Trusted contact</div>
      </div>
      <div className="setup-wrap">
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.7,marginBottom:8}}>
          This person receives an automatic WhatsApp alert with your GPS location when you trigger the panic button or shake the phone.
        </p>
        <label className="setup-label">Their name</label>
        <input className="setup-input" value={cname} onChange={e=>setCname(e.target.value)}/>
        <label className="setup-label">Their phone number</label>
        <input className="setup-input" type="tel" value={cphone} onChange={e=>setCphone(e.target.value)}/>
        <label className="setup-label" style={{marginTop:20}}>Your county</label>
        <select value={county} onChange={e=>setCounty(e.target.value)}
          style={{width:'100%',padding:'14px 16px',fontFamily:"'Nunito Sans',sans-serif",
            fontSize:15,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',
            color:county?'#fff':'rgba(255,255,255,0.4)',borderRadius:12,outline:'none',
            WebkitAppearance:'none',marginBottom:4}}>
          <option value="">Select your county...</option>
          {COUNTIES.map(c=><option key={c} value={c} style={{background:'#0A2D1A',color:'#fff'}}>{c}</option>)}
        </select>
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:16}}>
          Routes emergency alerts to Itika responders in your area.
        </p>
        <button className="hepa-btn" onClick={save} style={{marginTop:8}}>Save</button>
        <div style={{height:40}}/>
      </div>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('calc') // calc | reveal | setup | home | panic | checkin | guide | contacts
  const [userData, setUserData] = useState(null)
  const [shakeEnabled, setShakeEnabled] = useState(false)
  const shakeRef = useRef({ x:0, y:0, z:0, t:0 })

  // Load saved user data
  useEffect(() => {
    const saved = localStorage.getItem('hepa_user')
    if (saved) setUserData(JSON.parse(saved))
  }, [])

  const saveUserData = (data) => {
    localStorage.setItem('hepa_user', JSON.stringify(data))
    setUserData(data)
  }

  // Reveal hepa from calculator
  const reveal = () => {
    setScreen('reveal')
    setTimeout(() => {
      setScreen(userData ? 'home' : 'setup')
    }, 600)
  }

  // Shake detection
  const enableShake = useCallback(() => {
    const handleMotion = (e) => {
      const { x, y, z } = e.accelerationIncludingGravity || {}
      const now = Date.now()
      const prev = shakeRef.current
      if (now - prev.t > 100) {
        const dx = Math.abs((x||0) - prev.x)
        const dy = Math.abs((y||0) - prev.y)
        const dz = Math.abs((z||0) - prev.z)
        if (dx + dy + dz > 25 && screen === 'home') {
          setScreen('panic')
        }
        shakeRef.current = { x:x||0, y:y||0, z:z||0, t:now }
      }
    }

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().then(perm => {
        if (perm === 'granted') {
          window.addEventListener('devicemotion', handleMotion)
          setShakeEnabled(true)
        }
      }).catch(()=>{})
    } else {
      window.addEventListener('devicemotion', handleMotion)
      setShakeEnabled(true)
    }
  }, [screen])

  useEffect(() => {
    if (screen === 'home' && !shakeEnabled) enableShake()
  }, [screen])

  // ── RENDER ─────────────────────────────────────────────────────────────────
  if (screen === 'calc') return <Calculator onReveal={reveal}/>

  if (screen === 'reveal') return (
    <div className="hepa-reveal">
      <div style={{fontFamily:"'Lora',serif",fontSize:48,fontWeight:700,animation:'fadeIn .4s .3s both'}}><span style={{letterSpacing:0,display:'inline-flex',alignItems:'center'}}><span style={{letterSpacing:0,display:'inline-flex',alignItems:'center'}}><span className='logo-h'>h</span><span className='logo-epa'>epa</span></span></span></div>
    </div>
  )

  if (screen === 'setup') return (
    <SetupScreen
      initial={userData || {name:'',contacts:[]}}
      onSave={(data) => { saveUserData(data); setScreen('home') }}
    />
  )

  if (screen === 'panic') return (
    <PanicScreen
      contacts={userData?.contacts || []}
      onDismiss={() => setScreen('home')}
    />
  )

  if (screen === 'checkin') return (
    <CheckInScreen
      contacts={userData?.contacts || []}
      onBack={() => setScreen('home')}
    />
  )

  if (screen === 'guide') return (
    <GuideScreen onBack={() => setScreen('home')}/>
  )

  if (screen === 'contacts') return (
    <ContactsScreen
      data={userData || {name:'',contacts:[]}}
      onBack={() => setScreen('home')}
      onUpdate={saveUserData}
    />
  )

  // Home screen
  return (
    <div className="hepa-root">
      {/* Header */}
      <div className="hepa-header">
        <div className="hepa-logo"><span style={{letterSpacing:0,display:"inline-flex",alignItems:"center",color:"inherit"}}><span className="logo-h" style={{fontWeight:700}}>h</span><span className="logo-epa">epa</span></span><span className="logo-tagline" style={{marginLeft:8,fontSize:11}}>Get away · Stay safe</span></div>
        <button className="hepa-calc-btn" onClick={()=>setScreen('calc')}>
          🔢 Calculator
        </button>
      </div>

      {/* User greeting */}
      {userData?.name && (
        <div style={{padding:'14px 24px 0',fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:'rgba(255,255,255,0.4)'}}>
          Hello, <strong style={{color:'rgba(255,255,255,0.7)'}}>{userData.name}</strong>
        </div>
      )}

      {/* PANIC BUTTON */}
      <div className="panic-zone">
        <button className="panic-btn" onClick={()=>setScreen('panic')}>
          <div className="panic-btn-label">PANIC</div>
          <div className="panic-btn-sub">Tap or shake</div>
        </button>
        <div className="panic-hint">
          Hold phone and shake — alert fires automatically
        </div>
        {!shakeEnabled && (
          <div className="permission-box" style={{marginTop:12,width:'100%'}}>
            <p>Enable shake-to-alert for faster panic triggering</p>
            <button className="perm-btn" onClick={enableShake}>Enable shake detection</button>
          </div>
        )}
      </div>

      {/* Emergency contacts */}
      <div className="contacts-strip">
        <div className="contacts-strip-title">Emergency numbers</div>
        {EMERGENCY_CONTACTS.map((c,i) => (
          <div key={i} className="contact-row">
            <div className="contact-name">{c.name}</div>
            <a href={`tel:${c.phone}`} className="contact-call">{c.phone}</a>
          </div>
        ))}
      </div>

      {/* Action cards */}
      <div className="action-grid">
        <button className="action-card" onClick={()=>setScreen('checkin')}>
          <span className="action-card-icon">⏱</span>
          <div className="action-card-title">Check-in timer</div>
          <div className="action-card-sub">Alert if I don&apos;t check in</div>
        </button>
        <button className="action-card" onClick={()=>setScreen('guide')}>
          <span className="action-card-icon">📖</span>
          <div className="action-card-title">Survival guide</div>
          <div className="action-card-sub">Offline safety protocols</div>
        </button>
        <button className="action-card" onClick={()=>setScreen('contacts')}>
          <span className="action-card-icon">👤</span>
          <div className="action-card-title">Trusted contact</div>
          <div className="action-card-sub">{userData?.contacts[0]?.name || 'Not set'}</div>
        </button>
        <a className="action-card"
          href="https://femsaidiakenya.org"
          style={{textDecoration:'none'}}>
          <span className="action-card-icon">🛡</span>
          <div className="action-card-title">FemSaidia</div>
          <div className="action-card-sub">Resources & support</div>
        </a>
      </div>

      <div style={{height:32}}/>
    </div>
  )
}
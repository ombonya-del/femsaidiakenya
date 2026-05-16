import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://uuluuhltphgwfblcghlp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E'
)

// ── PALETTE ──────────────────────────────────────────────────────────────────
const BG   = '#0F020A'
const SURF = '#1A0510'
const CARD = '#2A0818'
const RED  = '#CC1010'
const BRED = '#FF4040'
const TXT  = '#F5E8ED'
const MUT  = '#B89AAA'
const BD   = '#4A1828'
const GRN  = '#1A5A2A'

// ── ARCHETYPE DATA ────────────────────────────────────────────────────────────
// Age ranges map to femicide_cases.victim_age_range DB values
const ARCH_AGE_RANGES = {
  naive:      '18_25',
  precocious: '18_25',
  allin:      '26_35',
}

const ARCHETYPES = [
  {
    id:'naive', emoji:'🌱', color:'#1A3F6F', light:'#E8F2FF', bg:'#F0F6FF', surf:'#E0ECFF', card:'#fff', text:'#0A1828', muted:'#3A5A8A',
    label:'The Naive', age:'17–19 · School leavers & 1st-2nd year students',
    intro:`You just got into university, moved to a new town, or started living alone for the first time. Everything is exciting and you want to experience it all — and there is nothing wrong with that.\n\nBut here is what nobody warned you about: you are the most targeted. Not because you are stupid. Because you are new. You have not seen the patterns yet.`,
    redFlags:[
      {flag:'He offers to take you somewhere "quieter"',why:'Isolation is the first step. If someone you just met wants to be alone with you, that is the move — not the vibe.'},
      {flag:'You feel bad saying no to him',why:'If he is making you feel rude for setting a limit, that is on purpose.'},
      {flag:'He knows more about you than you have told him',why:'Looking you up and using it to seem close to you — that is not romantic, it is research.'},
      {flag:'Your friends do not know where you are',why:'The most dangerous situations happen when nobody knows your location.'},
      {flag:'He tracks how many drinks you have had',why:'Someone monitoring your alcohol intake is not watching out for you.'},
      {flag:'He says "you are not like other girls"',why:'A technique designed to separate you from your community and make you feel special to him only.'},
    ],
    protective:[
      'Screenshot every plan — where, with who, when you expect to be back — and send it to a friend.',
      'Never be the most experienced person in your group. Go somewhere new with someone who knows the environment, the risks and the scene.',
      'Share your live location before going anywhere unfamiliar.',
      'Have a code word with your friends. One text and they call you with an "emergency."',
      'Trust the weird feeling. If something feels off, leave first. Analyse later.',
      'You do not owe anyone your time, company, or an explanation for leaving.',
      'Stick to public places the first few times you meet someone.',
      '📱 Install hepa on your phone — safety app disguised as a calculator. One long press on = sends your GPS to your emergency contact. hepa.femsaidiakenya.org',
      '📞 Save Salmin: *384*89056# — works on any phone, any network, no internet needed.',
      '🚩 Before meeting someone new, check Red Flag on femsaidiakenya.org for community-sourced profiles of known abusers.',
    ],
    sisterSays:`The man who seems the most interested, the most attentive, the most keen to spend time with you one-on-one? He is sometimes the one you need to watch most carefully. Real interest respects your pace. Pressure disguised as affection is still pressure.`,
  },
  {
    id:'precocious', emoji:'🔥', color:'#C06020', light:'#FFF0E0', bg:'#FFF8F0', surf:'#FFEEDD', card:'#fff', text:'#2A1000', muted:'#8A5010',
    label:'The Precocious', age:'21–23 · 3rd-4th year students & early graduates',
    intro:`You have been around a bit. You know what you like and how to handle yourself. You are not naive — you are adventurous. Older men do not intimidate you.\n\nHere is the thing: the people who are most dangerous to you know that. They are not going to try the lines that work on younger girls. They are going to offer you access. A lifestyle. The feeling of being chosen from a higher shelf.`,
    redFlags:[
      {flag:'He is offering things faster than a relationship normally moves',why:'Gifts, travel, hotel stays early on — not romance, investment. Investments expect returns.'},
      {flag:'You are keeping him secret from your close friends',why:'If you are hiding him, some part of you knows something is wrong.'},
      {flag:'You are using more substances than usual when with him',why:'If your consumption has changed since you started seeing him — why? Is he encouraging it?'},
      {flag:'Your female friendships have quietly faded',why:'Isolation from other women is a classic control pattern. It happens slowly.'},
      {flag:'He gets upset when you make decisions without telling him',why:'Jealousy disguised as love. Controlling disguised as caring.'},
      {flag:'He praises you for being "mature for your age"',why:'Men who seek younger women and praise their maturity have a reason to want someone less experienced.'},
    ],
    protective:[
      'Keep at least one close female friendship completely separate from any man you are seeing.',
      'Do not go to unfamiliar scenes alone or with only girls who are also new to them. Take someone who knows the terrain.',
      'Before accepting anything expensive, ask: what does he think this means?',
      'Tell someone who loves you who you are seeing — so someone knows.',
      'Know your baseline. How much do you normally use? Compare that to when you are with him.',
      'Have your own money accessible. Always.',
      'If you find yourself constantly explaining his behaviour to friends — listen to what you are saying.',
      '📱 Install hepa — safety app disguised as a calculator. One long press on = and help is on the way. hepa.femsaidiakenya.org',
      '📞 Know Salmin: *384*89056# — emergency contacts, safety tips, incident reporting. Share it with every girl you know.',
      '🚩 Check Red Flag before meeting anyone new. One check could change everything.',
    ],
    sisterSays:`The women in this category are often the ones who end up most shocked when something goes wrong. Because they thought they were too smart, too experienced, too self-aware. They were not targeted despite those things. They were targeted because of them.`,
  },
  {
    id:'allin', emoji:'⚡', color:'#7A4ABA', light:'#F0E8FF', bg:'#F8F0FF', surf:'#EEE0FF', card:'#fff', text:'#180830', muted:'#6A3A9A',
    label:'The All-In', age:'24–27 · Graduates & junior professionals',
    intro:`You are ambitious, you know what you want, and you are not willing to wait. You have probably had relationships that were more strategic than romantic — and that is fine.\n\nI am not here to judge that. I am here to tell you what the risks look like in your specific lane — because they are different from everyone else's, and most safety advice was not written for you.`,
    redFlags:[
      {flag:'Nobody knows the full picture of your situation',why:'Secrecy is a vulnerability. If something happens, will anyone know where to look?'},
      {flag:'You have information on him that could damage him, and he knows it',why:'What feels like leverage can become a reason for him to see you as a threat.'},
      {flag:'He has introduced you to his world but not to anyone who could verify who he is',why:'Men who operate in shadows rely on you not knowing how to find them if things go wrong.'},
      {flag:'The relationship has no clear exit for you',why:'What happens if you want to end things? Have you thought about it?'},
      {flag:'Sudden mood changes when you assert independence',why:'The moment you stop being controllable is often when danger escalates.'},
      {flag:'You are financially dependent with no formal security',why:'Dependency without documentation is a trap. A generous man with no paperwork has power over you.'},
    ],
    protective:[
      'Document everything. Not obsessively — but a record of who, what, where and when is everything if something goes wrong.',
      'Have one person who knows the real situation. One trusted person is enough.',
      'Know his real name, where he actually lives, and one way to verify his identity independently.',
      'Have an exit plan before you need one. Where do you go? Who do you call?',
      'Keep something that is yours — money, housing, income — that he has no access to.',
      'If you ever feel threatened, even indirectly, take it seriously immediately. Do not wait.',
      '📱 Install hepa — looks like a calculator, works as a panic button. Your trusted contact gets your GPS the moment you need them. hepa.femsaidiakenya.org',
      '📞 Save Salmin: *384*89056# — if things go wrong and your smartphone is gone, this still works.',
      '🚩 Visit femsaidiakenya.org and the Red Flag section. Know who is operating in your space.',
    ],
    sisterSays:`You are probably the least likely person to think this applies to you. That is the thing I want you to sit with. The women who end up in the most dangerous situations in this lane are often the sharpest, the most strategic — the ones who thought they had it under control. Your intelligence is real. So is their experience.`,
  },
]

// ── ECOSYSTEM DATA ────────────────────────────────────────────────────────────
const ECOSYSTEM = [
  {role:'Bartenders & bar staff',emoji:'🍺',color:'#1A5A2A',
    signs:["A woman's drink changing colour or becoming cloudy","Someone ordering for a woman repeatedly without her asking","A woman who was coherent becoming suddenly very disoriented","A man steering a very drunk woman away from other patrons","A woman trying to signal you with her eyes while someone talks for her"],
    actions:['Offer her water directly. Make eye contact with her, not him.','Use the Angel Shot signal if your bar has it — she orders it, you call her a cab or get security.','If she says she is fine but looks scared, ask her a direct question only she can answer.','You have every right to refuse service and call for help.','Tell your colleagues. Three people watching is a wall.']},
  {role:'Bouncers & security',emoji:'🛡️',color:'#5A1870',
    signs:['A man supporting a woman who cannot walk under her own power','A woman being guided somewhere while looking confused or resisting','Someone leaving in a hurry with a woman who does not match his energy','A group of men surrounding one woman','A woman using her phone frantically and then it disappearing'],
    actions:['Intercept at the door. "Are you okay?" directly to her. Watch his reaction.','Ask for ID — to slow things down if something looks wrong.','Offer to call her a cab. If she cannot tell you her own address, do not let her leave.','A woman truly with a friend will not mind a 30-second check.','If he objects aggressively to you checking on her, that is your answer.']},
  {role:'Ride-hail & taxi drivers',emoji:'🚗',color:'#8A4010',
    signs:['A passenger who is semi-conscious and the person booking is not with her','A woman who whispers her destination or changes it after someone gets out','Someone directing you to stop somewhere other than the destination','A woman who asks you to keep driving without saying where','A passenger who texts you something different from what she says out loud'],
    actions:['If a woman cannot confirm her own destination, call the number she is registered with.','Ask "Is this your Uber?" directly to her — not to the person putting her in.','If she texts you something different from what is being said — follow the text.','You can end the trip and call police.','If something feels wrong, tell someone.']},
  {role:'AirBnB & short-stay hosts',emoji:'🏠',color:'#1A3F6F',
    signs:['A booking made by a man for a woman not part of the communication','Sounds of distress, crying, or argument at unusual hours','A woman who seems scared when she comes to common areas','Requests to disable cameras or avoid particular areas','Multiple men and one woman arriving late at night'],
    actions:['Check in with female guests directly and separately when possible.','You can refuse entry or ask people to leave — you are on your property.','If you hear something concerning, knock. "Just checking everything is okay."','Keep a record of who booked and who arrived. They should match.','Your duty of care to a guest is real. Trust your instincts.']},
  {role:'Friends & bystanders',emoji:'🤝',color:'#6A0818',
    signs:["Your friend's personality changes when she is around him","She has started cancelling plans more since she has been with him","She defends behaviour in him she would never accept from anyone else","You have not met him even though they have been together for months","She is vague about where she is or who she is with"],
    actions:['The parking lot intervention: if you see a very drunk woman being taken somewhere, ask for proof. "Can I see a photo of you two together?" is not rude — it is potentially lifesaving.','You do not have to accuse anyone. "Are you okay?" directly to her is enough.','Stay in her life even when she pushes you away.','If she tells you something that scares you, believe her.','Know that leaving takes time. Your job is to be the door she can come back through.']},
  {role:'Neighbours & building guards',emoji:'👁️',color:'#2A5A1A',
    signs:['Repeated late-night arrivals of different men','A woman who seems to be avoiding going out or does not make eye contact','Sounds of argument, crying, or physical altercation','A woman who asks you not to tell someone she is home','Unusual activity — people waiting outside at odd hours'],
    actions:['Say hello. Consistent human contact makes isolation harder.','If she asks you to say she is not home to someone — do it. She has a reason.','You can knock and ask if everything is okay. You do not need a formal reason.','Know who lives in your building. Notice when someone stops being visible.','If genuinely worried, you can call for a wellness check without her knowing.']},
]

// ── EMERGENCY BAR ─────────────────────────────────────────────────────────────
function EmergencyBar() {
  return (
    <div style={{background:'#1A0008',borderBottom:`1px solid ${RED}`,padding:'10px 16px',
      display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
      <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
        letterSpacing:'.12em',textTransform:'uppercase',color:RED}}>⚡ Emergency</span>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <a href="https://hepa.femsaidiakenya.org" target="_blank" rel="noopener noreferrer"
          style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,
            padding:'5px 10px',background:GRN,color:'#fff',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>
          📱 Install hepa
        </a>
        <a href="tel:*384*89056%23" style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,
          padding:'5px 10px',background:'#8A1030',color:'#fff',textDecoration:'none',display:'inline-block'}}>
          📞 Salmin *384*89056#
        </a>
        <a href="https://femsaidiakenya.org" target="_blank" rel="noopener noreferrer"
          style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT,textDecoration:'none'}}>
          femsaidiakenya.org
        </a>
      </div>
    </div>
  )
}

// ── HOME SCREEN ───────────────────────────────────────────────────────────────
function HomeScreen({ setTab }) {
  return (
    <div style={{padding:'24px 16px',paddingBottom:32}}>
      <div style={{marginBottom:32}}>
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
          letterSpacing:'.2em',textTransform:'uppercase',color:RED,marginBottom:12}}>
          FemSaidia Kenya · Safety Intelligence
        </p>
        <h1 style={{fontFamily:"'Lora',serif",fontSize:56,fontWeight:700,lineHeight:1,marginBottom:16}}>
          <span style={{color:RED}}>Red</span><br/>
          <span style={{color:TXT}}>Flag</span>
        </h1>
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:15,color:MUT,lineHeight:1.7,maxWidth:340}}>
          Community intelligence. Safety education. Survivor knowledge. For young women in Kenya — and everyone around them.
        </p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:24}}>
        {[
          {id:'jijue',    emoji:'🌱', sw:'JiJue',      en:'Know Yourself',        color:'#1A3F6F', desc:'Find your archetype. Know your red flags.'},
          {id:'jitume',   emoji:'🛡️', sw:'JiTume',     en:'Take Action',          color:'#1A5A2A', desc:'For the ecosystem around her.'},
          {id:'linda',    emoji:'💬', sw:'LindaLinda', en:'Protect & Share',      color:'#8A4010', desc:'Real safety norms from real people.'},
          {id:'database', emoji:'🚩', sw:'Red Flag',   en:'Perpetrator Profiles', color:'#8A1030', desc:'Community-sourced database.'},
        ].map(tile => (
          <div key={tile.id} onClick={() => setTab(tile.id)}
            style={{background:CARD,border:`1px solid ${BD}`,borderTop:`3px solid ${tile.color}`,
              padding:16,cursor:'pointer',transition:'background .15s'}}
            onTouchStart={e => e.currentTarget.style.background='#3A0820'}
            onTouchEnd={e => e.currentTarget.style.background=CARD}>
            <div style={{fontSize:28,marginBottom:8}}>{tile.emoji}</div>
            <div style={{fontFamily:"'Lora',serif",fontSize:18,fontWeight:700,color:TXT,marginBottom:2}}>{tile.sw}</div>
            <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:tile.color,
              fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:6}}>{tile.en}</div>
            <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,lineHeight:1.5}}>{tile.desc}</div>
          </div>
        ))}
      </div>

      <div style={{background:CARD,border:`1px solid ${BD}`,borderLeft:`3px solid ${RED}`,padding:16}}>
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,
          letterSpacing:'.1em',textTransform:'uppercase',color:RED,marginBottom:8}}>Salama Salmin</p>
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT,lineHeight:1.7,marginBottom:10}}>
          Safe and sound. This platform, hepa, Salmin (*384*89056#) and Red Flag are part of one safety ecosystem built for Kenyan women.
        </p>
        <a href="https://femsaidiakenya.org" target="_blank" rel="noopener noreferrer"
          style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:RED,fontWeight:700,textDecoration:'none'}}>
          Learn more at femsaidiakenya.org →
        </a>
      </div>
    </div>
  )
}

// ── VICTIM CARD ──────────────────────────────────────────────────────────────
function VictimCard({ v }) {
  const [open, setOpen] = useState(false)
  return (
    <div onClick={() => setOpen(!open)}
      style={{borderBottom:`1px solid #2A0818`,padding:'16px 0',cursor:'pointer'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,
            color:'#F5E8ED',marginBottom:4}}>{v.victim_name}</div>
          <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:'#B89AAA'}}>
            {v.county}{v.victim_age ? ` · ${v.victim_age} years old` : ''}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0}}>
          <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,
            color:'#7A2030',fontWeight:600}}>
            {v.incident_date ? new Date(v.incident_date).toLocaleDateString('en-KE',
              {day:'numeric',month:'short',year:'numeric'}) : ''}
          </div>
          <span style={{fontSize:12,color:'#5A2030'}}>{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <div style={{marginTop:12,background:'#1A0008',padding:'14px',
          borderLeft:'3px solid #8A1030'}}>
          {[
            ['County', v.county],
            ['Age', v.victim_age ? `${v.victim_age} years old` : v.victim_age_range?.replace(/_/g,' ') || '—'],
            ['Date', v.incident_date ? new Date(v.incident_date).toLocaleDateString('en-KE',{day:'numeric',month:'long',year:'numeric'}) : '—'],
            ['Incident type', v.incident_type || 'Femicide'],
          ].map(([label, val], j) => (
            <div key={j} style={{marginBottom:8}}>
              <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:9,fontWeight:700,
                letterSpacing:'.1em',textTransform:'uppercase',color:'#5A2030',marginBottom:2}}>
                {label}
              </div>
              <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,
                color:'#F5E8ED',textTransform:'capitalize'}}>{val}</div>
            </div>
          ))}
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,
            color:'#5A2030',fontStyle:'italic',marginTop:8,lineHeight:1.6}}>
            🕯 May she rest in power.
          </p>
        </div>
      )}
    </div>
  )
}

// ── JIJUE SCREEN ──────────────────────────────────────────────────────────────
function JiJueScreen() {
  const [active, setActive]   = useState(0)
  const [tab, setTab]         = useState('intro')
  const [dbContent, setDbContent] = useState({})
  const [victims,   setVictims]   = useState({})

  useEffect(() => {
    sb.from('archetype_content').select('*').eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (!data?.length) return
        const g = {}
        data.forEach(r => {
          const k = `${r.archetype_id}_${r.section}`
          if (!g[k]) g[k] = []
          g[k].push(r.content)
        })
        setDbContent(g)
      })

    // Load victims for all age ranges
    sb.from('femicide_cases')
      .select('victim_name, victim_age, incident_date, county, victim_age_range, incident_type')
      .eq('published', true)
      .not('victim_name', 'like', 'Name unknown%')
      .not('victim_name', 'like', 'Unknown%')
      .not('victim_name', 'like', "%niece%")
      .not('victim_name', 'like', "%years old%")
      .not('victim_name', 'like', "Amina%niece%")
      .order('incident_date', { ascending: false })
      .then(({ data }) => {
        if (!data) return
        const grouped = {}
        data.forEach(v => {
          const r = v.victim_age_range
          if (!grouped[r]) grouped[r] = []
          grouped[r].push(v)
        })
        setVictims(grouped)
      })
  }, [])

  const a = ARCHETYPES[active]
  const getC = (id, sec, fallback) => dbContent[`${id}_${sec}`]?.length ? dbContent[`${id}_${sec}`] : fallback

  return (
    <div style={{paddingBottom:16,background:'#faf4f7',minHeight:'100vh'}}>
      {/* Archetype selector */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,marginBottom:0}}>
        {ARCHETYPES.map((arch, i) => (
          <button key={arch.id} onClick={() => { setActive(i); setTab('intro') }}
            style={{fontFamily:"'Nunito Sans',sans-serif",border:'none',cursor:'pointer',
              padding:'14px 8px',
              background:active===i?'#fff':'#f8f0f4',
              borderBottom:active===i?`3px solid ${arch.color}`:'3px solid transparent',
              display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <span style={{fontSize:24}}>{arch.emoji}</span>
            <span style={{fontSize:12,fontWeight:700,color:active===i?arch.color:'#7A4A60'}}>{arch.label}</span>
            <span style={{fontSize:9,color:'#B89AAA',
              textTransform:'uppercase',letterSpacing:'.06em'}}>
              {arch.age.split('·')[0].trim()}
            </span>
          </button>
        ))}
      </div>

      {/* Content area — archetype-specific background */}
      <div style={{padding:'0 16px',background:'#fff',minHeight:'60vh'}}>
        {/* Sub-tabs */}
        <div style={{display:'flex',gap:2,margin:'16px 0'}}>
          {[{id:'intro',label:'Who is this?'},{id:'redflags',label:'🚩 Red flags'},{id:'protect',label:'🛡️ Protect yourself'},{id:'talk',label:'💬 Real talk'},{id:'remember',label:'🕯 We remember'}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
                padding:'7px 10px',border:'none',cursor:'pointer',flex:1,
                background:tab===t.id?a.color:a.card||CARD,
                color:tab===t.id?'#fff':a.muted||MUT}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Intro */}
        {tab==='intro' && (
          <div>
            <div style={{background:'#fff',border:'1px solid #e8dde4',
              borderLeft:`4px solid ${a.color}`,padding:'20px 16px',marginBottom:12}}>
              <div style={{fontFamily:"'Lora',serif",fontSize:26,fontWeight:700,color:TXT,marginBottom:4}}>
                {a.emoji} {a.label}
              </div>
              <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:a.color,
                fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:16}}>
                {a.age}
              </div>
              {a.intro.split('\n\n').map((p, i) => (
                <p key={i} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:14,
                  color:'#180410',lineHeight:1.8,marginBottom:i<a.intro.split('\n\n').length-1?12:0}}>{p}</p>
              ))}
            </div>
          </div>
        )}

        {/* Red flags */}
        {tab==='redflags' && (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {(getC(a.id,'redflags',null)
              ? getC(a.id,'redflags',null).map((text,i) => {
                  const [flag,...rest] = text.split(' — ')
                  const why = rest.join(' — ')
                  return (
                    <div key={i} style={{background:'#fff',padding:'16px',borderLeft:`3px solid ${a.color}`,border:'1px solid #e8dde4',borderLeft:`3px solid ${a.color}`}}>
                      <div style={{fontFamily:"'Lora',serif",fontSize:15,fontWeight:700,color:#180410,marginBottom:6}}>🚩 {flag}</div>
                      {why && <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:#7A4A60,lineHeight:1.6}}>{why}</div>}
                    </div>
                  )
                })
              : a.redFlags.map((rf,i) => (
                  <div key={i} style={{background:'#fff',padding:'16px',borderLeft:`3px solid ${a.color}`,border:'1px solid #e8dde4',borderLeft:`3px solid ${a.color}`}}>
                    <div style={{fontFamily:"'Lora',serif",fontSize:15,fontWeight:700,color:#180410,marginBottom:6}}>🚩 {rf.flag}</div>
                    <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:#7A4A60,lineHeight:1.6}}>{rf.why}</div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Protect yourself */}
        {tab==='protect' && (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {(getC(a.id,'protective',null) || a.protective).map((p,i) => {
              const isDigital = p.includes('hepa')||p.includes('Salmin')||p.includes('Red Flag')||p.includes('femsaidiakenya')
              return (
                <div key={i} style={{background:isDigital?'#F0FFF4':a.card||'#fff',padding:'16px',
                  borderLeft:`4px solid ${isDigital?GRN:'#2D7A3A'}`,display:'flex',gap:12}}>
                  <span style={{color:isDigital?'#4ACA70':'#2D7A3A',fontWeight:700,
                    fontSize:18,flexShrink:0,lineHeight:1.3}}>{isDigital?'📱':'✓'}</span>
                  <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:14,
                    color:isDigital?'#166534':'#180410',lineHeight:1.7}}>{p}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Real talk */}
        {tab==='talk' && (
          <div style={{background:a.light,border:`1px solid ${a.color}`,
            borderLeft:`4px solid ${a.color}`,padding:'24px 20px'}}>
            <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,
              letterSpacing:'.15em',textTransform:'uppercase',color:a.color,marginBottom:20}}>
              From someone who has seen this
            </div>
            <p style={{fontFamily:"'Lora',serif",fontSize:18,color:'#180410',lineHeight:1.9,fontStyle:'italic',margin:0}}>
              "{a.sisterSays}"
            </p>
          </div>
        )}

        {/* We Remember */}
        {tab==='remember' && (
          <div>
            <div style={{background:'#0A0008',border:`1px solid #3A0820`,
              borderLeft:`4px solid #8A1030`,padding:'20px 16px',marginBottom:16}}>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,lineHeight:1.8}}>
                These are women and girls whose lives were taken. They are not cautionary tales.
                They are not statistics. They were here. We say their names.
              </p>
            </div>
            {(victims[ARCH_AGE_RANGES[a.id]] || []).length === 0 ? (
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,fontStyle:'italic'}}>
                Loading…
              </p>
            ) : (victims[ARCH_AGE_RANGES[a.id]] || []).map((v, i) => (
              <VictimCard key={i} v={v}/>
            ))}
            <div style={{marginTop:20,paddingTop:16,borderTop:`1px solid #2A0818`}}>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:'#5A2030',
                lineHeight:1.7,fontStyle:'italic'}}>
                🕯 Data from the FemSaidia Kenya femicide database. If you know of a case not recorded here,
                report it at femsaidiakenya.org
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── JITUME SCREEN ─────────────────────────────────────────────────────────────
function JiTumeScreen() {
  const [open, setOpen] = useState(null)
  const [tab, setTab]   = useState('signs')

  return (
    <div style={{padding:'0 16px 24px'}}>
      <div style={{padding:'20px 0 16px'}}>
        <h2 style={{fontFamily:"'Lora',serif",fontSize:28,fontWeight:700,color:TXT,marginBottom:6}}>JiTume</h2>
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT,lineHeight:1.7}}>
          Most femicides do not happen without warning signs that other people saw. This section is for everyone around her. Tap your role.
        </p>
      </div>

      {ECOSYSTEM.map((role, i) => (
        <div key={i} style={{marginBottom:8}}>
          <div onClick={() => { setOpen(open===i?null:i); setTab('signs') }}
            style={{background:role.color,padding:'14px 16px',cursor:'pointer',
              display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:24}}>{role.emoji}</span>
              <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:'#fff'}}>{role.role}</div>
            </div>
            <span style={{color:'rgba(255,255,255,0.7)',fontSize:20}}>{open===i?'▲':'▼'}</span>
          </div>

          {open===i && (
            <div style={{background:'#faf4f7',border:'1px solid #e8dde4',borderTop:'none'}}>
              <div style={{display:'flex',gap:2,padding:'12px 12px 0'}}>
                {[{id:'signs',label:'What to watch for'},{id:'actions',label:'What to do'}].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,
                      padding:'7px 14px',border:'none',cursor:'pointer',
                      background:tab===t.id?role.color:'#f0e8ed',color:tab===t.id?'#fff':'#7A4A60'}}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div style={{padding:'12px'}}>
                {(tab==='signs'?role.signs:role.actions).map((item,j) => (
                  <div key={j} style={{display:'flex',gap:12,padding:'12px 14px',
                    background:'#fff',border:'1px solid #e8dde4',borderLeft:`3px solid ${tab==='signs'?role.color:GRN}`,
                    marginBottom:6}}>
                    <span style={{flexShrink:0,fontSize:16}}>{tab==='signs'?'👁':'→'}</span>
                    <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,
                      color:TXT,lineHeight:1.6}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── LINDALINDA SCREEN ─────────────────────────────────────────────────────────
function LindaLindaScreen() {
  const [norms,   setNorms]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showing, setShowing] = useState(false)
  const [form,    setForm]    = useState({title:'',story:'',submitted_by:'',context:''})
  const [sending, setSending] = useState(false)
  const [done,    setDone]    = useState(false)

  const load = () => {
    sb.from('safety_norms').select('*').eq('status','published')
      .order('created_at',{ascending:false})
      .then(({data}) => { setNorms(data||[]); setLoading(false) })
  }
  useEffect(load, [])

  const submit = async () => {
    if(!form.title.trim()||!form.story.trim()) return
    setSending(true)
    await sb.from('safety_norms').insert({
      title:form.title.trim(), story:form.story.trim(),
      submitted_by:form.submitted_by.trim()||'Anonymous',
      context:form.context.trim()||'General',
      helpful_count:0, status:'published'
    })
    setSending(false)
    setDone(true)
    setTimeout(() => { setDone(false); setShowing(false); setForm({title:'',story:'',submitted_by:'',context:''}); load() }, 1500)
  }

  return (
    <div style={{padding:'0 16px 24px'}}>
      <div style={{padding:'20px 0 16px',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <h2 style={{fontFamily:"'Lora',serif",fontSize:28,fontWeight:700,color:TXT,marginBottom:6}}>LindaLinda</h2>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT,lineHeight:1.6,maxWidth:280}}>
            Real safety practices from real people. First person. Unfiltered. Like the stranger at the parking lot.
          </p>
        </div>
        <button onClick={() => setShowing(!showing)}
          style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,
            padding:'10px 14px',background:RED,color:'#fff',border:'none',cursor:'pointer',flexShrink:0}}>
          + Share yours
        </button>
      </div>

      {showing && (
        <div style={{background:CARD,border:`1px solid ${RED}`,padding:16,marginBottom:16}}>
          <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:TXT,marginBottom:12}}>
            Share a safety norm
          </div>
          {done ? (
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:14,color:'#4ACA70',textAlign:'center',padding:16}}>
              ✓ Shared. Thank you.
            </p>
          ) : (
            <>
              {[
                {k:'title',label:'Give it a title *',ph:'e.g. The parking lot intervention',multi:false},
                {k:'story',label:'Your story *',ph:'Tell it exactly as it happened...',multi:true},
                {k:'context',label:'Context (optional)',ph:'e.g. Club, taxi, neighbourhood...',multi:false},
                {k:'submitted_by',label:'Your name (optional)',ph:'Anonymous',multi:false},
              ].map(f => (
                <div key={f.k} style={{marginBottom:10}}>
                  <label style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:9,fontWeight:700,
                    letterSpacing:'.1em',textTransform:'uppercase',color:MUT,display:'block',marginBottom:4}}>{f.label}</label>
                  {f.multi
                    ? <textarea value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})}
                        placeholder={f.ph} rows={4}
                        style={{width:'100%',padding:'8px 10px',fontFamily:"'Nunito Sans',sans-serif",
                          fontSize:13,background:SURF,border:`1px solid ${BD}`,color:TXT,
                          outline:'none',resize:'vertical',boxSizing:'border-box'}}/>
                    : <input value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})}
                        placeholder={f.ph}
                        style={{width:'100%',padding:'8px 10px',fontFamily:"'Nunito Sans',sans-serif",
                          fontSize:13,background:SURF,border:`1px solid ${BD}`,color:TXT,
                          outline:'none',boxSizing:'border-box'}}/>
                  }
                </div>
              ))}
              <button onClick={submit} disabled={sending||!form.title||!form.story}
                style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,
                  padding:'10px 20px',background:form.title&&form.story?RED:'#5A0010',
                  color:'#fff',border:'none',cursor:form.title&&form.story?'pointer':'not-allowed'}}>
                {sending?'Sharing…':'Share this norm'}
              </button>
            </>
          )}
        </div>
      )}

      {loading ? (
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,fontStyle:'italic'}}>Loading…</p>
      ) : norms.length===0 ? (
        <div style={{background:CARD,border:`1px solid ${BD}`,padding:32,textAlign:'center'}}>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT,marginBottom:12}}>
            No stories yet. Be the first.
          </p>
        </div>
      ) : norms.map((n,i) => (
        <NormCard key={n.id||i} norm={n}/>
      ))}
    </div>
  )
}

function NormCard({norm}) {
  const [exp, setExp] = useState(false)
  const long = norm.story?.length > 180
  return (
    <div style={{background:CARD,border:`1px solid ${BD}`,padding:16,marginBottom:8}}>
      <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:TXT,marginBottom:6}}>{norm.title}</div>
      <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT,marginBottom:10}}>
        {norm.submitted_by||'Anonymous'} · {norm.context||'General'}
        {norm.created_at&&` · ${new Date(norm.created_at).toLocaleDateString('en-KE',{day:'numeric',month:'short'})}`}
      </div>
      <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:14,color:TXT,lineHeight:1.7,margin:0}}>
        {long&&!exp?`${norm.story?.slice(0,180)}…`:norm.story}
      </p>
      {long && <button onClick={()=>setExp(!exp)} style={{fontFamily:"'Nunito Sans',sans-serif",
        fontSize:12,color:BRED,background:'none',border:'none',cursor:'pointer',
        marginTop:6,padding:0}}>{exp?'Show less':'Read full story'}</button>}
      {norm.caveat && (
        <div style={{background:'rgba(202,138,4,0.15)',borderLeft:'3px solid #CA8A04',
          padding:'8px 12px',marginTop:10}}>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:'#EFC060',fontStyle:'italic',margin:0}}>
            📝 {norm.caveat}
          </p>
        </div>
      )}
    </div>
  )
}

// ── DATABASE SCREEN ───────────────────────────────────────────────────────────
function DatabaseScreen() {
  const [profiles, setProfiles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    sb.from('redflag_profiles').select('*').eq('status','approved')
      .order('created_at',{ascending:false})
      .then(({data}) => { setProfiles(data||[]); setLoading(false) })
  }, [])

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase()
    return !q||p.name?.toLowerCase().includes(q)||p.aliases?.toLowerCase().includes(q)||p.county?.toLowerCase().includes(q)||p.modus_operandi?.toLowerCase().includes(q)
  })

  return (
    <div style={{padding:'0 16px 24px'}}>
      <div style={{padding:'20px 0 12px'}}>
        <h2 style={{fontFamily:"'Lora',serif",fontSize:28,fontWeight:700,marginBottom:4}}>
          <span style={{color:RED}}>Red</span>
          <span style={{color:TXT}}> Flag</span>
          <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT,fontWeight:400,display:'block',marginTop:4}}>Community-sourced · Admin verified</span>
        </h2>
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Search by name, alias, county, modus operandi…"
        style={{width:'100%',padding:'10px 14px',fontFamily:"'Nunito Sans',sans-serif",
          fontSize:13,background:CARD,border:`1px solid ${BD}`,color:TXT,
          outline:'none',marginBottom:12,boxSizing:'border-box'}}/>

      {loading ? (
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,fontStyle:'italic'}}>Loading…</p>
      ) : filtered.length===0 ? (
        <div style={{background:CARD,border:`1px solid ${BD}`,padding:32,textAlign:'center'}}>
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT}}>
            {search ? 'No results for that search.' : 'No approved profiles yet.'}
          </p>
        </div>
      ) : filtered.map((p,i) => (
        <div key={p.id||i} onClick={() => setSelected(selected===p.id?null:p.id)}
          style={{background:CARD,border:`1px solid ${BD}`,borderLeft:`3px solid ${RED}`,
            padding:14,marginBottom:8,cursor:'pointer'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
            <div style={{fontFamily:"'Lora',serif",fontSize:15,fontWeight:700,color:TXT}}>{p.name}</div>
            <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:9,fontWeight:700,
              letterSpacing:'.08em',textTransform:'uppercase',padding:'2px 8px',
              background:RED,color:'#fff',flexShrink:0}}>
              {p.tier===1?'Confirmed':p.tier===2?'Multiple reports':'Flagged'}
            </span>
          </div>
          {p.aliases&&<p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT,marginBottom:4}}>Also: {p.aliases}</p>}
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT}}>{p.county&&`${p.county} · `}{p.modus_operandi?.slice(0,80)}…</p>

          {selected===p.id && (
            <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${BD}`}}>
              {[['County',p.county],['Social media',p.social_handles],['How they operate',p.modus_operandi],['Additional details',p.details]].filter(([,v])=>v).map(([label,val],j)=>(
                <div key={j} style={{marginBottom:10}}>
                  <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:9,fontWeight:700,
                    letterSpacing:'.1em',textTransform:'uppercase',color:MUT,marginBottom:3}}>{label}</div>
                  <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:TXT,lineHeight:1.5}}>{val}</div>
                </div>
              ))}
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT,
                borderTop:`1px solid ${BD}`,paddingTop:10,marginTop:10,lineHeight:1.6}}>
                ⚠️ Community-submitted, admin-reviewed. Not a conviction.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab }) {
  const tabs = [
    {id:'home',     emoji:'🏠', label:'Home'},
    {id:'jijue',    emoji:'🌱', label:'JiJue'},
    {id:'jitume',   emoji:'🛡️', label:'JiTume'},
    {id:'linda',    emoji:'💬', label:'LindaLinda'},
    {id:'database', emoji:'🚩', label:'Red Flag'},
  ]
  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,background:SURF,
      borderTop:`2px solid ${BD}`,display:'flex',
      paddingBottom:'env(safe-area-inset-bottom)'}}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)}
          style={{flex:1,border:'none',cursor:'pointer',padding:'10px 4px 8px',
            display:'flex',flexDirection:'column',alignItems:'center',gap:3,
            background:tab===t.id?CARD:SURF,
            borderTop:tab===t.id?`2px solid ${t.id==='database'?RED:'#B89AAA'}`:'2px solid transparent'}}>
          <span style={{fontSize:18}}>{t.emoji}</span>
          <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:9,fontWeight:700,
            color:tab===t.id?TXT:MUT,letterSpacing:'.02em'}}>
            {t.id==='database'
              ? <><span style={{color:tab===t.id?RED:MUT}}>Red</span> Flag</>
              : t.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('home')

  return (
    <div style={{background:BG,minHeight:'100vh',color:TXT,
      fontFamily:"'Nunito Sans',sans-serif",
      paddingBottom:'calc(65px + env(safe-area-inset-bottom))'}}>

      <EmergencyBar/>

      <div style={{overflowY:'auto'}}>
        {tab==='home'     && <HomeScreen setTab={setTab}/>}
        {tab==='jijue'    && <JiJueScreen/>}
        {tab==='jitume'   && <JiTumeScreen/>}
        {tab==='linda'    && <LindaLindaScreen/>}
        {tab==='database' && <DatabaseScreen/>}
      </div>

      <BottomNav tab={tab} setTab={setTab}/>
    </div>
  )
}

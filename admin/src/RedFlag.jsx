import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { AlertTriangle, Shield, Users, MessageSquare, ChevronDown, ChevronUp,
         Send, X, Plus, Heart } from 'lucide-react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const A   = '#8A1030'
const BD  = '#B89AAA'
const BG  = '#D4BEC4'
const CRD = '#C4AABB'
const TXT = '#180410'
const MUT = '#7A4A60'

const ARCHETYPES = [
  {
    id:'naive', label:'The Naive', age:'17–19 · School leavers & 1st-2nd year students',
    color:'#1A3F6F', light:'#E8F0F8', emoji:'🌱',
    intro:`You just got into university, moved to a new town, or started living alone for the first time. Everything is exciting and you want to experience it all. You're genuinely looking for a good time — and there is nothing wrong with that. But here is what nobody warned you about: you are also the most targeted.\n\nNot because you are stupid. Because you are new. You have not seen the patterns yet. The guy who offers to drive you home, the older man who seems genuinely interested in your future, the "networking event" that somehow ends up at someone's apartment — these do not look dangerous to you yet. They do to us.`,
    redFlags:[
      {flag:'He offers to take you somewhere "quieter"',why:'Isolation is the first step. If someone you just met wants to be alone with you, that is the move — not the vibe.'},
      {flag:'You feel bad saying no to him',why:'You should never feel guilty for protecting yourself. If he is making you feel rude for setting a limit, that is on purpose.'},
      {flag:'He knows more about you than you have told him',why:'If he has looked you up and is using that information to seem closer to you, that is not romantic — it is research.'},
      {flag:'Your friends do not know where you are',why:'The most dangerous situations happen when nobody knows your location.'},
      {flag:'He buys you drinks and tracks how many you have had',why:'Someone who is monitoring your alcohol intake is not watching out for you.'},
      {flag:'He says "you are not like other girls"',why:'This is a technique. It is designed to separate you from your community and make you feel special to him specifically.'},
    ],
    protective:[
      'Screenshot every plan and send it to a friend. Where, with who, when you expect to be back.',
      'Share your live location with at least one person before you go anywhere unfamiliar.',
      'Have a code word with your friends. One text and they call you with an "emergency."',
      'Trust the weird feeling. If something feels off, it probably is. Leave first, analyse later.',
      'You do not owe anyone your time, your company, or an explanation for leaving.',
      'Stick to public places for the first few times you meet someone. Non-negotiable.',
    ],
    sisterSays:`I wish someone had told me this at 18. The man who seems the most interested, the most attentive, the most keen to spend time with you one-on-one? He is sometimes the one you need to watch most carefully. Real interest respects your pace. Pressure disguised as affection is still pressure.`,
  },
  {
    id:'precocious', label:'The Precocious', age:'21–23 · 3rd-4th year students & early graduates',
    color:'#8A4010', light:'#F8F0E8', emoji:'🔥',
    intro:`You have been around a bit. You know what you like, you know how to handle yourself — or so you think. You are not naive, you are adventurous. You have dated, you have partied, you know the scene. Older men do not intimidate you, and you are smart enough to know when you are being played.\n\nHere is the thing: the people who are most dangerous to you know that you think that. They are not going to try the same lines on you that work on younger girls. They are going to offer you access. A lifestyle. The feeling that you have been chosen from a higher shelf. That is their game.`,
    redFlags:[
      {flag:'He is offering you things faster than a relationship would normally move',why:'Travel, hotel stays, expensive gifts early on — this is not romance, it is investment. And investments expect returns.'},
      {flag:'You are keeping him a secret from your close friends',why:'If you are hiding him, some part of you knows something is wrong. What is it?'},
      {flag:'You are using more substances than usual when you are with him',why:'If your consumption has changed since you started seeing him, ask yourself why. Is he encouraging it? Supplying it?'},
      {flag:'Your female friendships have quietly faded',why:'Isolation from other women is a classic control pattern. It happens slowly. Pay attention.'},
      {flag:'He gets upset when you make decisions without telling him',why:'Jealousy disguised as love. Controlling disguised as caring. Learn the difference.'},
      {flag:'He specifically seeks younger women and praises you for being "mature for your age"',why:'Men who frame a woman\'s youth as a compliment have a reason to want someone less experienced.'},
    ],
    protective:[
      'Keep at least one close female friendship completely separate from any man you are seeing.',
      'Before accepting anything expensive, ask yourself: what does he think this means?',
      'Tell someone who loves you who you are seeing. Not to get their approval — so someone knows.',
      'Know your baseline. How much do you normally drink or use? Compare that to when you are with him.',
      'Have your own money accessible. Always. No matter how comfortable things are.',
      'If you find yourself explaining his behaviour to your friends constantly, listen to what you are saying.',
    ],
    sisterSays:`You are not a child and I am not going to talk to you like one. But here is what I have seen: the women in this category are often the ones who end up most shocked when something goes wrong. Because they thought they were too smart, too experienced, too self-aware. They were not targeted despite those things. They were targeted because of them.`,
  },
  {
    id:'allin', label:'The All-In', age:'24–27 · Final year students, graduates & junior professionals',
    color:'#3A1870', light:'#F0EAF8', emoji:'⚡',
    intro:`You are ambitious, you know what you want, and you are not willing to wait around for it. You have probably had relationships that were more strategic than romantic — and that is fine. You know what men can provide, and you have decided to use what you have to get where you want to go.\n\nI am not here to judge that. I am here to tell you what the risks look like in your specific lane — because they are different from anyone else's, and most safety advice was not written for you.`,
    redFlags:[
      {flag:'Nobody in your life knows the full picture of your situation',why:'Secrecy is a vulnerability. If something happens to you, will anyone know where to look or who to call?'},
      {flag:'You have information on him that could damage him, and he knows it',why:'What feels like leverage can quickly become a reason for someone to see you as a threat rather than an asset.'},
      {flag:'He has introduced you to his world but not to anyone who could verify who he is',why:'Men who operate in shadows rely on you not knowing how to find them if things go wrong.'},
      {flag:'The relationship has no clear exit for you',why:'What happens if you want to end things? Do you know? Does he know? Have you thought about it?'},
      {flag:'You have experienced sudden mood changes in him when you assert independence',why:'The moment you stop being useful or controllable is often when danger escalates.'},
      {flag:'You are financially dependent on someone who has given you no formal security',why:'Dependency without documentation is a trap. A generous man with no paperwork is just a man with power over you.'},
    ],
    protective:[
      'Document everything. Not obsessively — but if something ever goes wrong, a record of who, what, where and when is everything.',
      'Have one person — one — who knows the real situation. A friend, a sister, someone you trust completely.',
      'Know his real name, where he actually lives, and have at least one way to verify his identity independently.',
      'Have an exit plan before you need one. What do you do if this ends badly? Where do you go? Who do you call?',
      'Keep something that is yours — money, housing, income — that he has no access to or control over.',
      'If you ever feel like you are being threatened, even indirectly, take it seriously immediately. Do not wait.',
    ],
    sisterSays:`You are probably the least likely of any woman to think this information applies to you. That is the thing I want you to sit with. The women who end up in the most dangerous situations in this lane are often the sharpest, the most strategic, the ones who thought they had it under control. Your intelligence is real. So is their experience.`,
  },
  {
    id:'onoff', label:'The On & Off', age:'25–40 · Co-parents & long-term on/off partners',
    color:'#8A4A10', light:'#FFF0E0', emoji:'🔄',
    intro:`You have history with him. Real history — maybe children, shared finances, years of your life. You have left before. Maybe more than once. And something always brought you back — love, the kids, hope, pressure, fear.\n\nThis is what the elders call Vumbi la Zamani — the dust of the past that keeps blowing back in. And it is one of the most dangerous places a woman can be. Not because you are weak. Because the pattern is designed to keep you there.`,
    redFlags:[
      {flag:'The breakups never quite stick',why:'Every separation followed by reconciliation teaches him that you will come back. It also teaches him how far he can push.'},
      {flag:'He uses the children as leverage',why:'Threatening custody, withholding support, using the kids as messengers — these are control tactics, not parenting.'},
      {flag:'He monitors who you are seeing after a breakup',why:'Surveillance disguised as co-parenting communication is still surveillance.'},
      {flag:'Violence or threats escalated after a separation',why:'Separation is statistically the most dangerous time. When he feels he is losing control permanently, the risk spikes.'},
      {flag:'He tells the children things about you',why:'Weaponising your children against you is emotional abuse of both you and them.'},
      {flag:'He shows up uninvited after you separated',why:'Showing up at your home, workplace or family is not love. It is a warning.'},
      {flag:'You feel responsible for his emotional state',why:'If you are managing his feelings so he does not explode, you are already in a cycle of control.'},
    ],
    protective:[
      'Document everything — every threat, every incident, every missed payment. Dates, screenshots, messages. Patterns matter in court.',
      "Tell your children's school who is and is not authorised to pick them up. Get it in writing.",
      'Do handovers in public places or at a police station — they are peak danger moments.',
      'Never meet him alone to "talk things through" after a separation. Bring someone or meet in public.',
      'A court order is only useful if you report violations. Report every single one.',
      'Your children need you alive more than they need their parents together.',
      'Know that leaving is a process, not a single moment. You are not weak for taking more than one attempt.',
    ],
    sisterSays:`The most dangerous moment in an on/off relationship is not when she goes back. It is when she finally, truly, leaves for good. That is when he realises the control is gone. That is when you need a plan — not just courage. Plan the exit like your life depends on it. Because it might.`,
  },
]

const ECOSYSTEM = [
  {
    role:'Bartenders & bar staff', icon:'🍺', color:'#1A5A2A',
    signs:['A woman\'s drink changing colour or becoming cloudy','Someone ordering for a woman repeatedly without her asking','A woman who was coherent becoming suddenly very disoriented','A man steering a very drunk woman away from other patrons','A woman trying to signal you with her eyes while someone else is talking for her'],
    actions:['Offer her water directly. Make eye contact with her, not him.','Use the Angel Shot signal if your bar has it — she orders it, you call her a cab or get security.','If she says she is fine but looks scared, ask her a direct question only she can answer.','You have every right to refuse service and every right to call for help.','Tell your colleagues. One person noticed is good. Three people watching is a wall.'],
  },
  {
    role:'Bouncers & security', icon:'🛡️', color:'#5A1870',
    signs:['A man supporting a woman who cannot walk under her own power','A woman being guided somewhere while looking confused or resisting slightly','Someone leaving in a hurry with a woman who does not match his energy','A group of men surrounding one woman','A woman using her phone frantically and then it disappearing'],
    actions:['Intercept at the door. "Are you okay?" directly to her. Watch his reaction.','Ask for ID — yours is to slow things down if something looks wrong.','Offer to call her a cab. If she cannot tell you her own address, do not let her leave.','A woman who is truly drunk and with a friend will not mind a 30-second check.','If he objects aggressively to you checking on her, that is your answer.'],
  },
  {
    role:'Ride-hail & taxi drivers', icon:'🚗', color:'#8A4010',
    signs:['A passenger who is semi-conscious and the person booking is not with her','A woman who whispers her destination or changes it after someone else gets out','Someone directing you to stop somewhere other than the entered destination','A woman who asks you to keep driving without saying where','A passenger who texts you something different from what she is saying out loud'],
    actions:['If a woman cannot confirm her own destination, call the number she is registered with.','Ask "Is this your Uber?" directly to her. Not to the person putting her in.','If she texts you something different from what is being said out loud — follow the text.','You can end the trip and call police. Your safety matters too — but so does hers.','Share your live trip details. If something feels wrong, tell someone.'],
  },
  {
    role:'AirBnB & short-stay hosts', icon:'🏠', color:'#1A3F6F',
    signs:['A booking made by a man for a woman who was not part of the communication','Sounds of distress, crying, or argument at unusual hours','A woman who seems scared when she comes to reception or common areas','Requests to disable cameras or avoid particular areas of the property','Multiple men and one woman arriving, especially late at night'],
    actions:['Check in with female guests directly and separately when possible.','Know that you can refuse entry or ask people to leave — you are on your property.','If you hear something that concerns you, knock. "Just checking everything is okay with the room."','Keep a record of who booked and who arrived. They should match.','Your duty of care to a guest is real. Trust your instincts about what is happening in your space.'],
  },
  {
    role:'Friends & bystanders', icon:'🤝', color:'#6A0818',
    signs:['Your friend\'s personality changes when she is around him','She has started cancelling plans more since she has been with him','She defends behaviour in him that she would never accept from anyone else','You have not met him even though they have been together for months','She is vague about where she is or who she is with'],
    actions:['The parking lot intervention: if you see a very drunk woman being taken somewhere by someone, ask for proof. "Can I see a photo of you two together?" is not rude. It is potentially lifesaving.','You do not have to accuse anyone. "Are you okay?" directly to her is enough.','Stay in her life even when she pushes you away. Being there matters.','If she tells you something that scares you, believe her. And tell her you believe her.','Know that leaving an abusive situation takes time. Your job is to be the door she can come back through.'],
  },
  {
    role:'Neighbours & building guards', icon:'👁️', color:'#2A5A1A',
    signs:['Repeated late-night arrivals of different men','A woman who seems to be avoiding going out or does not make eye contact','Sounds of argument, crying, or physical altercation','A woman who asks you not to tell someone she is home','Unusual activity — deliveries at odd hours, people waiting outside'],
    actions:['Say hello. Consistent human contact makes isolation harder.','If she asks you to say she is not home to someone — do it. She has a reason.','You can knock and ask if everything is okay. You do not need a formal reason.','Know who lives in your building. Notice when someone stops being visible.','If you are genuinely worried, you can call for a wellness check without her knowing.'],
  },
]

function TierBadge({tier}) {
  const cfg = {1:{l:'Confirmed',bg:'#8A1030'},2:{l:'Multiple reports',bg:'#C05010'},3:{l:'Flagged',bg:'#CA8A04'}}
  const c = cfg[tier]||cfg[3]
  return <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:9,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',padding:'2px 8px',background:c.bg,color:'#fff'}}>{c.l}</span>
}

function ProfileCard({p, onClick}) {
  return (
    <div onClick={()=>onClick(p)} style={{background:CRD,border:`1px solid ${BD}`,padding:16,cursor:'pointer',borderLeft:`3px solid ${A}`}}
      onMouseEnter={e=>e.currentTarget.style.background='#B89AAA'} onMouseLeave={e=>e.currentTarget.style.background=CRD}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
        <div style={{fontFamily:"'Lora',serif",fontSize:15,fontWeight:700,color:TXT}}>{p.name}</div>
        <TierBadge tier={p.tier}/>
      </div>
      {p.aliases&&<p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT,marginBottom:6}}>Also known as: {p.aliases}</p>}
      <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT}}>{p.county&&`${p.county} · `}{p.modus_operandi?.slice(0,80)}…</p>
    </div>
  )
}

function ProfileModal({p, onClose}) {
  if(!p) return null
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(24,4,16,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}>
      <div style={{background:BG,border:`2px solid ${A}`,maxWidth:600,width:'100%',maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{background:TXT,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><div style={{fontFamily:"'Lora',serif",fontSize:18,fontWeight:700,color:'#fff',marginBottom:4}}>{p.name}</div><TierBadge tier={p.tier}/></div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{padding:20}}>
          {[['Also known as',p.aliases],['County / Location',p.county],['Social media',p.social_handles],['Modus operandi',p.modus_operandi],['Additional details',p.details]].filter(([,v])=>v).map(([label,val],i)=>(
            <div key={i} style={{marginBottom:14}}>
              <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:MUT,marginBottom:4}}>{label}</div>
              <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:TXT}}>{val}</div>
            </div>
          ))}
          <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT,borderTop:`1px solid ${BD}`,paddingTop:12,marginTop:12,lineHeight:1.6}}>⚠️ Reports are community-submitted and reviewed by the FemSaidia Kenya team. This is not a conviction. If you have additional information, submit a report below.</p>
        </div>
      </div>
    </div>
  )
}

function ArchetypeCard({a, getContent}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab]   = useState('redflags')
  const redFlags   = (getContent ? getContent(a.id,'redflags',null) : null) || a.redFlags || []
  const protective = (getContent ? getContent(a.id,'protective',null) : null) || a.protective || []
  return (
    <div style={{border:`2px solid ${a.color}`,marginBottom:16,background:CRD}}>
      <div onClick={()=>setOpen(!open)} style={{background:a.color,padding:'16px 20px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{fontSize:40,lineHeight:1}}>{a.emoji}</span>
          <div>
            <div style={{fontFamily:"'Lora',serif",fontSize:22,fontWeight:700,color:'#fff',lineHeight:1.1,marginBottom:4}}>{a.label}</div>
            <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.9)',letterSpacing:'.02em'}}>{a.age}</div>
          </div>
        </div>
        {open?<ChevronUp color="#fff" size={22}/>:<ChevronDown color="#fff" size={22}/>}
      </div>
      {open&&(
        <div style={{padding:20}}>
          <div style={{background:CRD,padding:'24px 28px',marginBottom:20,borderLeft:`4px solid ${a.color}`}}>
            {a.intro.split('\n\n').map((p,i)=>(
              <p key={i} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:15,color:TXT,lineHeight:1.9,marginBottom:i<a.intro.split('\n\n').length-1?16:0}}>{p}</p>
            ))}
          </div>
          <div style={{display:'flex',gap:2,marginBottom:20}}>
            {[{id:'redflags',label:'🚩 Red flags'},{id:'protective',label:'🛡️ Protect yourself'},{id:'sister',label:'💬 Real talk'}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,padding:'10px 20px',cursor:'pointer',border:'none',background:tab===t.id?a.color:CRD,color:tab===t.id?'#fff':MUT}}>{t.label}</button>
            ))}
          </div>
          {tab==='redflags'&&<div style={{display:'flex',flexDirection:'column',gap:10}}>
            {(redFlags
              ? redFlags.map((text,i) => {
                  const [flag,...whyParts] = text.split(' — ')
                  const why = whyParts.join(' — ')
                  return (
                    <div key={i} style={{background:CRD,padding:'18px 20px',borderLeft:`4px solid ${a.color}`}}>
                      <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:TXT,marginBottom:8}}>🚩 {flag}</div>
                      {why && <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:14,color:MUT,lineHeight:1.7}}>{why}</div>}
                    </div>
                  )
                })
              : a.redFlags.map((rf,i)=>(
                  <div key={i} style={{background:CRD,padding:'18px 20px',borderLeft:`4px solid ${a.color}`}}>
                    <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:TXT,marginBottom:8}}>🚩 {rf.flag}</div>
                    <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:14,color:MUT,lineHeight:1.7}}>{rf.why}</div>
                  </div>
                ))
            )}
          </div>}
          {tab==='protective'&&<div style={{display:'flex',flexDirection:'column',gap:10}}>
            {(protective || a.protective).map((p,i)=>{
              const isDigital = p.includes('hepa')||p.includes('Salmin')||p.includes('Red Flag')||p.includes('femsaidiakenya')
              return (
                <div key={i} style={{background:isDigital?'#0A2D1A':CRD,padding:'18px 20px',borderLeft:`4px solid ${isDigital?'#FF5C28':'#2D7A3A'}`,display:'flex',gap:14}}>
                  <span style={{color:isDigital?'#FF5C28':'#2D7A3A',fontWeight:700,fontSize:20,flexShrink:0,lineHeight:1.4}}>{isDigital?'📱':'✓'}</span>
                  <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:15,color:isDigital?'#E8F5EE':TXT,lineHeight:1.7}}>{p}</div>
                </div>
              )
            })}
          </div>}
          {tab==='sister'&&(
            <div style={{background:CRD,padding:'32px 28px',borderLeft:`4px solid ${a.color}`}}>
              <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:a.color,marginBottom:20}}>From someone who has seen this</div>
              <p style={{fontFamily:"'Lora',serif",fontSize:20,color:TXT,lineHeight:1.85,fontStyle:'italic',margin:0}}>"{a.sisterSays}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EcosystemCard({role}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab]   = useState('signs')
  return (
    <div style={{border:`1px solid ${BD}`,marginBottom:10}}>
      <div onClick={()=>setOpen(!open)} style={{background:role.color,padding:'12px 16px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <span style={{fontSize:22}}>{role.icon}</span>
          <div style={{fontFamily:"'Lora',serif",fontSize:15,fontWeight:700,color:'#fff'}}>{role.role}</div>
        </div>
        {open?<ChevronUp color="#fff" size={20}/>:<ChevronDown color="#fff" size={20}/>}
      </div>
      {open&&(
        <div style={{padding:16,background:BG}}>
          <div style={{display:'flex',gap:2,marginBottom:14}}>
            {[{id:'signs',label:'What to watch for'},{id:'actions',label:'What to do'}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,padding:'5px 12px',cursor:'pointer',border:'none',background:tab===t.id?role.color:CRD,color:tab===t.id?'#fff':MUT}}>{t.label}</button>
            ))}
          </div>
          {tab==='signs'&&<div style={{display:'flex',flexDirection:'column',gap:8}}>{role.signs.map((s,i)=>(
            <div key={i} style={{display:'flex',gap:14,padding:'16px 18px',background:CRD,borderLeft:`3px solid ${role.color}`}}>
              <span style={{flexShrink:0,fontSize:18}}>👁</span>
              <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:14,color:TXT,lineHeight:1.7}}>{s}</span>
            </div>
          ))}</div>}
          {tab==='actions'&&<div style={{display:'flex',flexDirection:'column',gap:8}}>{role.actions.map((a,i)=>(
            <div key={i} style={{display:'flex',gap:14,padding:'16px 18px',background:CRD,borderLeft:'3px solid #2D7A3A'}}>
              <span style={{color:'#2D7A3A',fontWeight:700,flexShrink:0,fontSize:18}}>→</span>
              <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:14,color:TXT,lineHeight:1.7}}>{a}</span>
            </div>
          ))}</div>}
        </div>
      )}
    </div>
  )
}

function NormCard({norm}) {
  const [expanded, setExpanded] = useState(false)
  const isLong = norm.story?.length > 200
  return (
    <div style={{background:CRD,border:`1px solid ${BD}`,padding:16,marginBottom:8}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:8}}>
        <div>
          <div style={{fontFamily:"'Lora',serif",fontSize:18,fontWeight:700,color:TXT,marginBottom:6}}>{norm.title}</div>
          <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT}}>
            {norm.submitted_by||'Anonymous'} · {norm.context||'General'}
            {norm.created_at&&` · ${new Date(norm.created_at).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}`}
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0,fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT}}>
          <Heart size={12}/> {norm.helpful_count||0}
        </div>
      </div>
      <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:15,color:TXT,lineHeight:1.8,margin:0}}>
        {isLong&&!expanded?`${norm.story?.slice(0,200)}…`:norm.story}
      </p>
      {isLong&&<button onClick={()=>setExpanded(!expanded)} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:A,background:'none',border:'none',cursor:'pointer',marginTop:6,padding:0}}>{expanded?'Show less':'Read full story'}</button>}
    </div>
  )
}

function NormSubmitForm({onClose, onSubmit}) {
  const [form, setForm]     = useState({title:'',story:'',submitted_by:'',context:''})
  const [sending, setSending] = useState(false)
  const [done, setDone]     = useState(false)
  const submit = async () => {
    if(!form.title.trim()||!form.story.trim()) return
    setSending(true)
    const {error} = await supabase.from('safety_norms').insert({title:form.title.trim(),story:form.story.trim(),submitted_by:form.submitted_by.trim()||'Anonymous',context:form.context.trim()||'General',helpful_count:0,status:'published'})
    setSending(false)
    if(!error){setDone(true);setTimeout(()=>{onSubmit();onClose()},1500)}
  }
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(24,4,16,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}>
      <div style={{background:BG,border:`2px solid ${A}`,maxWidth:560,width:'100%'}} onClick={e=>e.stopPropagation()}>
        <div style={{background:TXT,padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:'#fff'}}>Share a safety norm</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div style={{padding:20}}>
          {done?<p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:14,color:'#2D7A3A',textAlign:'center',padding:20}}>✓ Your story has been shared. Thank you.</p>:(
            <>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,lineHeight:1.7,marginBottom:16}}>Tell it in your own words. First person. What happened, what you did, what it meant. You can be anonymous.</p>
              {[{key:'title',label:'Give it a title *',placeholder:'e.g. The parking lot intervention that changed how I think',multiline:false},{key:'story',label:'Your story *',placeholder:'Tell it exactly as it happened...',multiline:true},{key:'context',label:'Context (optional)',placeholder:'e.g. Club, university, taxi, neighbourhood...',multiline:false},{key:'submitted_by',label:'Your name (optional — leave blank to stay anonymous)',placeholder:'Anonymous',multiline:false}].map(field=>(
                <div key={field.key} style={{marginBottom:12}}>
                  <label style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:MUT,display:'block',marginBottom:4}}>{field.label}</label>
                  {field.multiline?(
                    <textarea value={form[field.key]} onChange={e=>setForm({...form,[field.key]:e.target.value})} placeholder={field.placeholder} rows={5} style={{width:'100%',padding:'8px 12px',fontFamily:"'Nunito Sans',sans-serif",fontSize:12,background:'rgba(255,255,255,0.6)',border:`1px solid ${BD}`,color:TXT,outline:'none',resize:'vertical',boxSizing:'border-box'}}/>
                  ):(
                    <input value={form[field.key]} onChange={e=>setForm({...form,[field.key]:e.target.value})} placeholder={field.placeholder} style={{width:'100%',padding:'8px 12px',fontFamily:"'Nunito Sans',sans-serif",fontSize:12,background:'rgba(255,255,255,0.6)',border:`1px solid ${BD}`,color:TXT,outline:'none',boxSizing:'border-box'}}/>
                  )}
                </div>
              ))}
              <button onClick={submit} disabled={sending||!form.title||!form.story} style={{display:'inline-flex',alignItems:'center',gap:6,fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,padding:'10px 20px',background:A,color:'#fff',border:'none',cursor:form.title&&form.story?'pointer':'not-allowed',opacity:form.title&&form.story?1:0.5}}>
                <Send size={13}/> {sending?'Sharing…':'Share this norm'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PerpetratorForm({onClose}) {
  const [form, setForm]     = useState({name:'',aliases:'',county:'',social_handles:'',modus_operandi:'',details:''})
  const [sending, setSending] = useState(false)
  const [done, setDone]     = useState(false)
  const submit = async () => {
    if(!form.name.trim()||!form.modus_operandi.trim()) return
    setSending(true)
    await supabase.from('redflag_submissions').insert({...form,status:'pending'})
    setSending(false)
    setDone(true)
    setTimeout(onClose, 1500)
  }
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(24,4,16,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}>
      <div style={{background:BG,border:`2px solid ${A}`,maxWidth:560,width:'100%',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{background:TXT,padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:'#fff'}}>Submit a Red Flag report</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div style={{padding:20}}>
          {done?<p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:14,color:'#2D7A3A',textAlign:'center',padding:20}}>✓ Report submitted. The FemSaidia team will review it.</p>:(
            <>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,lineHeight:1.7,marginBottom:16}}>Reports go to the FemSaidia Kenya admin team for verification before publishing. Please be as specific and factual as possible.</p>
              {[{key:'name',label:'Name or known identity *',placeholder:'Full name or commonly known as...',multiline:false},{key:'aliases',label:'Aliases / nicknames',placeholder:'Other names used...',multiline:false},{key:'county',label:'County / Area',placeholder:'Where they operate...',multiline:false},{key:'social_handles',label:'Social media handles',placeholder:'@username on X, Instagram, TikTok...',multiline:false},{key:'modus_operandi',label:'How they operate *',placeholder:'Describe their typical approach, methods, patterns...',multiline:true},{key:'details',label:'Additional details',placeholder:'Any other relevant information...',multiline:true}].map(field=>(
                <div key={field.key} style={{marginBottom:12}}>
                  <label style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:MUT,display:'block',marginBottom:4}}>{field.label}</label>
                  {field.multiline?(
                    <textarea value={form[field.key]} onChange={e=>setForm({...form,[field.key]:e.target.value})} placeholder={field.placeholder} rows={3} style={{width:'100%',padding:'8px 12px',fontFamily:"'Nunito Sans',sans-serif",fontSize:12,background:'rgba(255,255,255,0.6)',border:`1px solid ${BD}`,color:TXT,outline:'none',resize:'vertical',boxSizing:'border-box'}}/>
                  ):(
                    <input value={form[field.key]} onChange={e=>setForm({...form,[field.key]:e.target.value})} placeholder={field.placeholder} style={{width:'100%',padding:'8px 12px',fontFamily:"'Nunito Sans',sans-serif",fontSize:12,background:'rgba(255,255,255,0.6)',border:`1px solid ${BD}`,color:TXT,outline:'none',boxSizing:'border-box'}}/>
                  )}
                </div>
              ))}
              <button onClick={submit} disabled={sending||!form.name||!form.modus_operandi} style={{display:'inline-flex',alignItems:'center',gap:6,fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,padding:'10px 20px',background:A,color:'#fff',border:'none',cursor:form.name&&form.modus_operandi?'pointer':'not-allowed',opacity:form.name&&form.modus_operandi?1:0.5}}>
                <Send size={13}/> {sending?'Submitting…':'Submit report'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RedFlagTab() {
  const [section,      setSection]      = useState('profiles')
  const [profiles,     setProfiles]     = useState([])
  const [norms,        setNorms]        = useState([])
  const [dbContent,    setDbContent]    = useState({})
  const [selected,     setSelected]     = useState(null)
  const [showPerp,     setShowPerp]     = useState(false)
  const [showNorm,     setShowNorm]     = useState(false)
  const [search,       setSearch]       = useState('')
  const [loading,      setLoading]      = useState(true)

  const loadNorms = () =>
    supabase.from('safety_norms').select('*').eq('status','published')
      .order('created_at',{ascending:false}).then(({data})=>setNorms(data||[]))

  useEffect(() => {
    supabase.from('redflag_profiles').select('*').eq('status','approved')
      .order('created_at',{ascending:false}).then(({data})=>{setProfiles(data||[]);setLoading(false)})
    loadNorms()
    // Load editable archetype content from DB
    supabase.from('archetype_content').select('*').eq('active',true)
      .order('sort_order',{ascending:true})
      .then(({data}) => {
        if(!data?.length) return
        const grouped = {}
        data.forEach(row => {
          const key = `${row.archetype_id}_${row.section}`
          if(!grouped[key]) grouped[key] = []
          grouped[key].push(row.content)
        })
        setDbContent(grouped)
      })
  }, [])

  // Helper: get content from DB or fall back to hardcoded
  const getContent = (archetypeId, section, fallback) => {
    const key = `${archetypeId}_${section}`
    return dbContent[key]?.length ? dbContent[key] : fallback
  }

  const filtered = profiles.filter(p=>{
    const q=search.toLowerCase()
    return !q||p.name?.toLowerCase().includes(q)||p.aliases?.toLowerCase().includes(q)||p.county?.toLowerCase().includes(q)||p.modus_operandi?.toLowerCase().includes(q)
  })

  const SECTIONS = [
    {id:'profiles',   sw:<span><span style={{color:'#FF4040'}}>Red</span> Flag</span>, en:'Perpetrator Intelligence', icon:<AlertTriangle size={13}/>},
    {id:'archetypes', sw:'JiJue',      en:'Know Yourself',            icon:<Users size={13}/>},
    {id:'ecosystem',  sw:'JiTume',     en:'Take Action',              icon:<Shield size={13}/>},
    {id:'norms',      sw:'LindaLinda', en:'Protect & Share',          icon:<MessageSquare size={13}/>},
  ]

  return (
    <div className="fade-up" style={{width:'100%'}}>
      <div style={{borderBottom:`2px solid ${A}`,paddingBottom:24,marginBottom:24}}>
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:A,marginBottom:12}}>● Community intelligence · Safety education · Survivor knowledge</p>
        <h1 style={{fontFamily:"'Lora',serif",fontSize:52,fontWeight:700,lineHeight:1.1,marginBottom:12}}>
          <span style={{color:'#CC1010'}}>Red</span>
          <span style={{color:TXT}}> Flag</span>
        </h1>
        <p style={{fontSize:16,color:MUT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.7,maxWidth:600}}>Perpetrator profiles · Victim archetypes · Ecosystem guidance · Community safety norms</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:typeof window!=='undefined'&&window.innerWidth<768?'repeat(2,1fr)':'repeat(4,1fr)',gap:2,marginBottom:20}}>
        {SECTIONS.map(s=>(
          <button key={s.id} onClick={()=>setSection(s.id)}
            style={{fontFamily:"'Nunito Sans',sans-serif",border:'none',cursor:'pointer',
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              gap:3,padding:'12px 8px',
              background:section===s.id?A:CRD,
              color:section===s.id?'#fff':TXT,
              borderBottom:section===s.id?`3px solid rgba(255,255,255,0.4)`:'3px solid transparent'}}>
            <span style={{fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>{s.icon}</span>
            <span style={{fontSize:13,fontWeight:700,letterSpacing:'-.01em'}}>{s.sw}</span>
            <span style={{fontSize:10,fontWeight:400,opacity:0.7,letterSpacing:'.04em',textTransform:'uppercase'}}>{s.en}</span>
          </button>
        ))}
      </div>

      {section==='profiles'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}>
            <div>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:A,marginBottom:4}}>Community-sourced · Admin verified</p>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT}}>{profiles.length} profiles · Reports reviewed before publishing</p>
            </div>
            <button onClick={()=>setShowPerp(true)} style={{display:'inline-flex',alignItems:'center',gap:6,fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,padding:'8px 16px',background:A,color:'#fff',border:'none',cursor:'pointer'}}>
              <Plus size={13}/> Submit a report
            </button>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, alias, county or modus operandi…" style={{width:'100%',padding:'10px 14px',fontFamily:"'Nunito Sans',sans-serif",fontSize:12,background:CRD,border:`1px solid ${BD}`,color:TXT,outline:'none',marginBottom:12,boxSizing:'border-box'}}/>
          {loading?(
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,fontStyle:'italic'}}>Loading profiles…</p>
          ):filtered.length===0?(
            <div style={{background:CRD,border:`1px solid ${BD}`,padding:32,textAlign:'center'}}>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT,marginBottom:12}}>No profiles published yet. Be the first to submit a report.</p>
              <button onClick={()=>setShowPerp(true)} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,padding:'10px 20px',background:A,color:'#fff',border:'none',cursor:'pointer'}}>Submit a report</button>
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:typeof window!=='undefined'&&window.innerWidth<768?'1fr':'1fr 1fr',gap:8}}>
              {filtered.map((p,i)=><ProfileCard key={p.id||i} p={p} onClick={setSelected}/>)}
            </div>
          )}
        </div>
      )}

      {section==='archetypes'&&(
        <div>
          <div style={{background:CRD,border:`1px solid ${BD}`,padding:16,marginBottom:20}}>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:A,marginBottom:6}}>A note before you read</p>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:TXT,lineHeight:1.8}}>These profiles are not judgements. They are patterns — ways of being in the world at different life stages that create specific vulnerabilities. You might recognise yourself in one of them, or in parts of several. That recognition is the point. Knowing your risk profile is the first step to changing it.</p>
          </div>
          {ARCHETYPES.map(a=><ArchetypeCard key={a.id} a={a} getContent={getContent}/>)}
        </div>
      )}

      {section==='ecosystem'&&(
        <div>
          <div style={{background:CRD,border:`1px solid ${BD}`,padding:16,marginBottom:20}}>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:A,marginBottom:6}}>The people around her</p>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:TXT,lineHeight:1.8}}>Most femicides do not happen without warning signs that other people saw. Bartenders, drivers, bouncers, friends, neighbours — the people around a woman in danger often have a window to intervene. This section is for them. Click on your role.</p>
          </div>
          {ECOSYSTEM.map((role,i)=><EcosystemCard key={i} role={role}/>)}
        </div>
      )}

      {section==='norms'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:12}}>
            <div>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:A,marginBottom:4}}>First-person · Organic · Community-sourced</p>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,lineHeight:1.6,maxWidth:500}}>Real safety practices that real people have used or witnessed. Told in their own words. Like the stranger at the parking lot who asked for proof of friendship before letting a drunk woman leave with someone she did not know. That stranger may have saved a life.</p>
            </div>
            <button onClick={()=>setShowNorm(true)} style={{display:'inline-flex',alignItems:'center',gap:6,fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,padding:'10px 16px',background:A,color:'#fff',border:'none',cursor:'pointer',flexShrink:0}}>
              <Plus size={13}/> Share your story
            </button>
          </div>
          {norms.length===0?(
            <div style={{background:CRD,border:`1px solid ${BD}`,padding:32,textAlign:'center'}}>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:MUT,marginBottom:12}}>No stories yet. Be the first to share a safety norm that has made a difference.</p>
              <button onClick={()=>setShowNorm(true)} style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,padding:'10px 20px',background:A,color:'#fff',border:'none',cursor:'pointer'}}>Share your story</button>
            </div>
          ):norms.map((n,i)=><NormCard key={n.id||i} norm={n}/>)}
        </div>
      )}

      {selected&&<ProfileModal p={selected} onClose={()=>setSelected(null)}/>}
      {showPerp&&<PerpetratorForm onClose={()=>setShowPerp(false)}/>}
      {showNorm&&<NormSubmitForm onClose={()=>setShowNorm(false)} onSubmit={loadNorms}/>}
    </div>
  )
}
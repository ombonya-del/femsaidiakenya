import { useState } from 'react'
import { AlertTriangle, Phone } from 'lucide-react'

const A   = '#8A1030'
const BD  = '#B89AAA'
const BG  = '#D4BEC4'
const CRD = '#C4AABB'
const TXT = '#180410'
const MUT = '#7A4A60'

export default function SurvivalGuideTab() {
  const mobile = window.innerWidth < 768
  return (
    <div className="fade-up" style={{width:'100%'}}>

      {/* ── FEMSAIDIA TOOLS STRIP ── */}
      <div style={{background:'#180410',padding: mobile ? '16px 14px' : '20px 28px',marginBottom:2}}>
        <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'#8A1030',marginBottom:12}}>
          ● FemSaidia Safety Tools · Use these before you need them
        </p>
        <div style={{display:'grid',gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4,1fr)',gap:8}}>

          {/* hepa */}
          <a href="https://hepa.femsaidiakenya.org" target="_blank" rel="noopener noreferrer"
            style={{textDecoration:'none',background:'#1A0818',border:'1px solid #3A1828',padding:'14px 16px',display:'flex',flexDirection:'column',gap:6}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:20}}>🛡</span>
              <span style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:'#F0D0D8'}}>hepa</span>
            </div>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:'#B89AAA',lineHeight:1.5}}>
              Disguised as a calculator. Hold <strong style={{color:'#FF9500'}}>=</strong> for 3 seconds to access safety tools.
            </p>
            <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:'#8A1030',fontWeight:700,letterSpacing:'.06em'}}>hepa.femsaidiakenya.org →</span>
          </a>

          {/* Salmin */}
          <a href="tel:*384*89056%23"
            style={{textDecoration:'none',background:'#1A0818',border:'1px solid #3A1828',padding:'14px 16px',display:'flex',flexDirection:'column',gap:6}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:20}}>📞</span>
              <span style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:'#F0D0D8'}}>Salmin</span>
            </div>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:'#B89AAA',lineHeight:1.5}}>
              <em style={{color:'#D4B0B8'}}>Salama Salmin · Safe & Sound</em><br/>
              Works on any phone, any network, no internet needed.
            </p>
            <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:'#F0D0D8',fontWeight:700,letterSpacing:'.04em'}}>*384*89056#</span>
          </a>

          {/* Red Flag */}
          <a href="https://redflag.femsaidiakenya.org" target="_blank" rel="noopener noreferrer"
            style={{textDecoration:'none',background:'#1A0818',border:'1px solid #3A1828',padding:'14px 16px',display:'flex',flexDirection:'column',gap:6}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:20}}>🚩</span>
              <span style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:'#F0D0D8'}}>Red Flag</span>
            </div>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:'#B89AAA',lineHeight:1.5}}>
              Know who is operating near you. Community-sourced perpetrator profiles & safety intelligence.
            </p>
            <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:'#8A1030',fontWeight:700,letterSpacing:'.06em'}}>redflag.femsaidiakenya.org →</span>
          </a>

          {/* Itika */}
          <div style={{background:'#1A0818',border:'1px solid #3A1828',padding:'14px 16px',display:'flex',flexDirection:'column',gap:6}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:20}}>🤝</span>
              <span style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:'#F0D0D8'}}>Itika</span>
            </div>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:'#B89AAA',lineHeight:1.5}}>
              Community responders activated automatically when you trigger hepa or Red Flag SOS. Always on.
            </p>
            <span style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:'#7A4A60',fontWeight:700,letterSpacing:'.06em'}}>Activated via hepa · *384*89056#</span>
          </div>

        </div>
      </div>

      {/* Header */}
      <div style={{borderBottom:`1px solid ${BD}`,paddingBottom:20,marginBottom:2}}>
        <p className="label" style={{marginBottom:8,color:A}}>● Safety protocols · evidence-based · Kenya context</p>
        <h1 className="serif" style={{fontSize:36,fontWeight:700,color:TXT}}>Survival Guide</h1>
        <p style={{fontSize:13,color:MUT,marginTop:8,fontFamily:"'Nunito Sans',sans-serif",fontWeight:300,lineHeight:1.8,maxWidth:720}}>
          Most femicide is not random. <strong style={{color:TXT}}>70% of cases in Kenya involve someone the victim knew</strong> — a partner,
          family member or acquaintance. That means most femicide has warning signs, escalation patterns,
          and intervention windows. This guide exists to help you see them — and act before it is too late.
        </p>
      </div>

<div style={{marginTop:2}}>

        {/* PANIC STRIP */}
        <div style={{background:'#8A1030',padding:'18px 26px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <AlertTriangle size={20} color='#F0D0D8'/>
            <div>
              <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:14,fontWeight:700,color:'#F0D0D8'}}>Are you in immediate danger right now?</div>
              <p style={{fontSize:11,color:'#D4B0B8',fontFamily:"'Nunito Sans',sans-serif",marginTop:2}}>Do not hesitate. Your life matters. Make this call.</p>
            </div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[
              {l:'Emergency',      p:'999'},
              {l:'DCI Gender Desk',p:'0800 722 203'},
              {l:'GVRC',           p:'0800 723 253'},
              {l:'Usikimye',       p:'0800 723 253'},
            ].map((c,i)=>(
              <a key={i} href={`tel:${c.p.replace(/\s/g,'')}`}
                style={{background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',
                  padding:'8px 14px',textDecoration:'none',display:'flex',flexDirection:'column',alignItems:'center'}}>
                <span style={{fontSize:9,color:'#D4B0B8',fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase'}}>{c.l}</span>
                <span style={{fontSize:15,color:'#fff',fontFamily:"'Lora',serif",fontWeight:700}}>{c.p}</span>
              </a>
            ))}
          </div>
        </div>

        {/* SECTION HEADER */}
        <div style={{borderTop:`1px solid ${BD}`,paddingTop:24,marginTop:2,marginBottom:2}}>
          <p className="label" style={{marginBottom:8,color:A}}>Survival protocols · evidence-based</p>
          <h2 className="serif" style={{fontSize:28,fontWeight:700,color:TXT,lineHeight:1.3}}>
            You are not powerless.<br/>
            <em style={{color:A,fontWeight:400}}>Here is what you can do.</em>
          </h2>
          <p style={{fontSize:13,color:MUT,fontFamily:"'Nunito Sans',sans-serif",fontWeight:300,lineHeight:1.8,marginTop:8,maxWidth:700}}>
            Most femicide is not spontaneous. There are warning signs, escalation patterns, and intervention windows.
            The protocols below are drawn from international safety research adapted for the Kenyan context.
          </p>
        </div>

        {/* SCENARIO 1: RIGHT NOW */}
        <div style={{background:'#BC9EAE',border:`2px solid ${A}`,padding:24,marginBottom:2}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <div style={{background:A,color:'#F0D0D8',fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,padding:'3px 10px',letterSpacing:'.1em',textTransform:'uppercase'}}>Right now</div>
            <div style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:TXT}}>Someone is threatening your life this moment</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:mobile?'1fr':'1fr 1fr 1fr',gap:2}}>
            {[
              {n:'01', t:'Call 999 or 112', b:'Kenya\'s emergency number. You do not need to speak — leave the line open. Dispatchers are trained to listen for background sounds and locate you via cell tower.'},
              {n:'02', t:'Send your location', b:'Open WhatsApp → share Live Location with a trusted contact. It updates every few minutes. Say the code word you\'ve agreed on in advance, or simply: "I need help now."'},
              {n:'03', t:'Make noise', b:'Scream, break glass, bang walls. Noise draws attention. Perpetrators depend on silence and isolation. Disrupt that dynamic at any cost.'},
              {n:'04', t:'Get to a public space', b:'Run toward people — a shop, a police post, a church, a matatu stage. Perpetrators rarely escalate in crowded public spaces. Put bodies between you and them.'},
              {n:'05', t:'Do not try to reason', b:'In the moment of violence, reasoning does not work. Survival is the only goal. Do not negotiate. Move, call, make noise — in any order.'},
              {n:'06', t:'If you cannot call', b:'Text DCI on 0800 722 203 — texts work even with low signal. Some areas support SMS to 999. Alternatively, text a friend your location and say "call police."'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#C4AABB',border:`1px solid ${BD}`,padding:16}}>
                <div style={{fontFamily:"'Lora',serif",fontSize:22,fontWeight:700,color:A,marginBottom:6}}>{s.n}</div>
                <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,color:TXT,marginBottom:6}}>{s.t}</div>
                <p style={{fontSize:11,color:MUT,lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SCENARIO 2: ONLINE DATING / FIRST MEETING */}
        <div style={{background:'#C4AABB',border:`1px solid ${BD}`,padding:24,marginBottom:2}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <div style={{background:'#8A4010',color:'#F0D8C0',fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,padding:'3px 10px',letterSpacing:'.1em',textTransform:'uppercase'}}>Online dating</div>
            <div style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:TXT}}>Before you meet someone from an app or online</div>
          </div>
          <div style={{background:'#E8D0C8',border:'1px solid #B07060',padding:'12px 16px',marginBottom:14,display:'flex',gap:8}}>
            <AlertTriangle size={13} color={A} style={{flexShrink:0,marginTop:2}}/>
            <p style={{fontSize:12,color:'#6A1008',fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.7}}>
              <strong>The Consolata Githinji case (April 2026) and Starlet Wahu (2024) both involve a first meeting with someone met online.</strong> These protocols are drawn directly from what could have changed the outcome.
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:mobile?'1fr':'1fr 1fr',gap:2}}>
            {[
              {t:'Before you go — tell someone', b:'Tell a trusted friend or family member: who you are meeting, where, and when you expect to be home. Share the person\'s name, phone number, and social media profile. If you don\'t return or check in, they call police. This is non-negotiable.'},
              {t:'Share your live location', b:'Before entering any vehicle or building with this person, share your WhatsApp Live Location with your trusted contact. Update them when you arrive and when you leave. This creates a real-time trail.'},
              {t:'Always choose a public venue first', b:'Refuse any first meeting at a private home, Airbnb, or short-stay apartment. If they insist, leave. A genuine person will respect your safety. A dangerous person will pressure you — that pressure is your signal.'},
              {t:'Verify their identity before going', b:'Video call before the meeting to confirm the person matches their photos. Reverse-image search their profile picture (Google Lens). If they\'ve avoided video calls, trust that signal.'},
              {t:'Guard your drink — always', b:'Never accept a drink you did not see poured. Never leave a drink unattended. Rohypnol and other sedatives are colourless and tasteless. If you feel suddenly disoriented, tell a staff member immediately.'},
              {t:'Have an exit code', b:'Arrange a code word with a trusted contact before the date. If you text them that word, they call you immediately with a "family emergency." This gives you a safe reason to leave without confrontation.'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#D4BEC4',border:`1px solid ${BD}`,padding:16}}>
                <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,color:TXT,marginBottom:6}}>{s.t}</div>
                <p style={{fontSize:11,color:MUT,lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SCENARIO 3: INTIMATE PARTNER ESCALATION */}
        <div style={{background:'#C4AABB',border:`1px solid ${BD}`,padding:24,marginBottom:2}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <div style={{background:'#1A4810',color:'#D0F0D8',fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,padding:'3px 10px',letterSpacing:'.1em',textTransform:'uppercase'}}>Intimate partner</div>
            <div style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:TXT}}>When someone you know is becoming dangerous</div>
          </div>
          <p style={{fontSize:12,color:MUT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.8,marginBottom:14}}>
            70% of femicide in Kenya is committed by intimate partners or family members. The violence almost always escalates over time — from control, to threats, to physical harm, to lethal violence. Recognising the pattern early is survival.
          </p>
          <div style={{display:'grid',gridTemplateColumns:mobile?'1fr':'1fr 1fr 1fr',gap:2,marginBottom:14}}>
            <div style={{background:'#D4BEC4',border:`1px solid ${BD}`,padding:16,borderLeft:'4px solid #8A1030'}}>
              <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,color:TXT,marginBottom:8}}>Warning signs of escalation</div>
              {['Controlling who you talk to or where you go','Monitoring your phone, location or finances','Threatening you, your children or your family','Physical violence — even "minor" incidents','Strangulation — the most lethal warning sign. If a partner has strangled you even once, the risk of lethal violence increases 700%.','Threats with weapons or access to weapons','Isolating you from family and friends'].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:6,alignItems:'flex-start'}}>
                  <span style={{color:A,fontWeight:700,flexShrink:0,fontFamily:"'Nunito Sans',sans-serif",fontSize:11}}>▸</span>
                  <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.6}}>{s}</p>
                </div>
              ))}
            </div>
            <div style={{background:'#D4BEC4',border:`1px solid ${BD}`,padding:16,borderLeft:'4px solid #CA8A04'}}>
              <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,color:TXT,marginBottom:8}}>Build a safety plan now — before you need it</div>
              {[
                'Identify a trusted person — neighbour, friend, family — who can shelter you',
                'Agree a code word or signal that means "call police now" without alerting the perpetrator',
                'Keep an emergency bag ready: ID, children\'s documents, some cash, phone charger, medications',
                'Memorise key phone numbers in case your phone is taken',
                'Know your nearest police station, GVRC clinic, or shelter',
                'Keep evidence: photograph injuries, save threatening messages',
              ].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:6,alignItems:'flex-start'}}>
                  <span style={{color:'#CA8A04',fontWeight:700,flexShrink:0,fontFamily:"'Nunito Sans',sans-serif",fontSize:11}}>▸</span>
                  <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.6}}>{s}</p>
                </div>
              ))}
            </div>
            <div style={{background:'#D4BEC4',border:`1px solid ${BD}`,padding:16,borderLeft:'4px solid #2563EB'}}>
              <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,color:TXT,marginBottom:8}}>The Danger Assessment tool</div>
              <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.7,marginBottom:8}}>
                A clinically validated 20-question tool that predicts lethal risk in intimate partner violence. Used by GVRC Kenya and trained counsellors across the country. Ask your GVRC counsellor to administer it.
              </p>
              <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.7,marginBottom:8}}>
                <strong style={{color:TXT}}>The most lethal predictors identified by the tool:</strong>
              </p>
              {['Partner has used a weapon against you','Partner has threatened to kill you','Partner is extremely jealous','Violence is increasing in frequency or severity','Partner has strangled you'].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:4,alignItems:'flex-start'}}>
                  <span style={{color:'#2563EB',fontWeight:700,flexShrink:0}}>▸</span>
                  <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.5}}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SCENARIO 4: WHEN POLICE DISMISS YOU */}
        <div style={{background:'#C4AABB',border:`1px solid ${BD}`,padding:24,marginBottom:2}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <div style={{background:'#5A0820',color:'#F0D0D8',fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,padding:'3px 10px',letterSpacing:'.1em',textTransform:'uppercase'}}>Law enforcement</div>
            <div style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:TXT}}>When police say it\'s a "family matter" — what to do next</div>
          </div>
          <p style={{fontSize:12,color:MUT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.8,marginBottom:16}}>
            Most femicide victims had prior police contact. The system failed them — not because laws don\'t exist, but because enforcement is inconsistent.
            If police dismiss you, escalate immediately. You have the right to.
          </p>
          <div style={{display:'grid',gridTemplateColumns:mobile?'1fr':'repeat(4,1fr)',gap:2}}>
            {[
              {n:'Step 1',t:'Record the OB number',b:'When you report to a police station, insist on an Occurrence Book (OB) number. This creates a legal record. Write it down. If they refuse to give you one, go to a senior officer or to a different station.'},
              {n:'Step 2',t:'Escalate to DCI directly',b:'Call the DCI Gender Desk: 0800 722 203. The DCI operates independently of local police. Reporting to DCI creates a parallel investigation trail that local officers cannot easily suppress.'},
              {n:'Step 3',t:'Contact NGEC',b:'The National Gender & Equality Commission can compel police to act. Call NGEC: 020 272 0585. They have a mandate to intervene in GBV cases where law enforcement has failed. They are a FemSaidia Kenya partner.'},
              {n:'Step 4',t:'Get legal aid',b:'FIDA Kenya provides free legal representation for GBV survivors: 0719 638 006. Kituo Cha Sheria: 0800 720 434. A lawyer\'s call to a police station changes everything. Do not face this alone.'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#D4BEC4',border:`1px solid ${BD}`,padding:16,borderTop:`3px solid ${A}`}}>
                <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,color:MUT,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}}>{s.n}</div>
                <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,color:TXT,marginBottom:6}}>{s.t}</div>
                <p style={{fontSize:11,color:MUT,lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{s.b}</p>
              </div>
            ))}
          </div>
          <div style={{background:'#D4BEC4',border:`1px solid ${BD}`,padding:'14px 18px',marginTop:2}}>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,color:TXT,marginBottom:6}}>Additional escalation paths if all else fails:</p>
            <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
              {[
                {l:'IPOA (Police oversight)',   p:'0800 724 763', note:'Report police misconduct and inaction'},
                {l:'ODPP (Prosecution)',         p:'020 271 8036', note:'Request prosecution even without police cooperation'},
                {l:'Amnesty International Kenya',p:'020 444 8082', note:'For cases involving security forces or systemic failure'},
              ].map((c,i)=>(
                <div key={i}>
                  <div style={{fontSize:12,fontWeight:700,color:TXT,fontFamily:"'Nunito Sans',sans-serif"}}>{c.l}</div>
                  <a href={`tel:${c.p.replace(/\s/g,'')}`} style={{fontSize:14,color:A,fontFamily:"'Lora',serif",fontWeight:700,textDecoration:'none'}}>{c.p}</a>
                  <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>{c.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LEAVING SAFELY */}
        <div style={{background:'#C4AABB',border:`2px solid #8A4010`,padding:24,marginBottom:2}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <div style={{background:'#8A4010',color:'#F0D8C0',fontFamily:"'Nunito Sans',sans-serif",fontSize:10,fontWeight:700,padding:'3px 10px',letterSpacing:'.1em',textTransform:'uppercase'}}>Leaving an abuser</div>
            <div style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:'#180410'}}>How to leave safely — and stay alive after you do</div>
          </div>

          {/* Critical warning */}
          <div style={{background:'#8A1030',padding:'14px 18px',marginBottom:16,display:'flex',gap:10,alignItems:'flex-start'}}>
            <AlertTriangle size={16} color='#F0D0D8' style={{flexShrink:0,marginTop:2}}/>
            <p style={{fontSize:12,color:'#F0D0D8',fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.8,fontWeight:600}}>
              Leaving is the most dangerous time. Research shows that a woman\'s risk of being killed is highest
              in the weeks and months after she leaves — not before. Many femicide cases in Kenya involve
              partners who lured women back, followed them, or tracked them down after separation.
              <strong style={{color:'#FFD0D8'}}> Do not leave without a plan.</strong>
            </p>
          </div>

          {/* The pattern */}
          <div style={{marginBottom:16}}>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,color:'#180410',marginBottom:10}}>
              Recognise the pattern that follows leaving:
            </p>
            <div style={{display:'grid',gridTemplateColumns:mobile?'1fr':'repeat(4,1fr)',gap:2}}>
              {[
                {n:'Phase 1',t:'The hoover',     c:'#CA8A04',b:'"I\'ve changed." "I miss you." "The children need you home." Abusers often become loving, apologetic and attentive immediately after you leave. This is not change. This is manipulation designed to bring you back within reach.'},
                {n:'Phase 2',t:'The escalation', c:'#C05000',b:'When the manipulation fails, abusers escalate. Threats. Showing up at your workplace, your mother\'s home, your church. Sending family members to pressure you. Monitoring your social media. Tracking your phone.'},
                {n:'Phase 3',t:'The stalking',   c:'#8A1030',b:'Driving past your new location repeatedly. Watching you. Recruiting mutual friends as informants. Installing tracking apps on shared devices. This phase can last months and often escalates to physical confrontation.'},
                {n:'Phase 4',t:'The attack',     c:'#5A0820',b:'Most intimate partner femicides happen at this stage — often months after leaving, when the abuser believes they have lost all control. This is why a safety plan that accounts for life after leaving is not optional. It is survival.'},
              ].map((s,i)=>(
                <div key={i} style={{background:'#D4BEC4',border:`1px solid #B89AAA`,borderTop:`4px solid ${s.c}`,padding:14}}>
                  <div style={{fontSize:9,color:'#7A4A60',fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>{s.n}</div>
                  <div style={{fontSize:13,fontWeight:700,color:'#180410',fontFamily:"'Nunito Sans',sans-serif",marginBottom:6}}>{s.t}</div>
                  <p style={{fontSize:11,color:'#7A4A60',lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{s.b}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Before you leave */}
          <div style={{display:'grid',gridTemplateColumns:mobile?'1fr':'1fr 1fr',gap:2,marginBottom:2}}>
            <div style={{background:'#D4BEC4',border:'1px solid #B89AAA',padding:18}}>
              <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:'#180410',marginBottom:4,borderBottom:'2px solid #8A4010',paddingBottom:8}}>
                Before you leave — prepare
              </div>
              <p style={{fontSize:11,color:'#7A4A60',fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.7,marginBottom:10}}>
                A planned exit is a safe exit. Do this quietly over days or weeks before you go.
              </p>
              {[
                {t:'Build your emergency bag in secret', b:'ID card, birth certificates (yours and children\'s), marriage certificate, any court documents. Small amount of cash. A phone charger. Essential medications. Keep it somewhere you can grab it in 60 seconds — at a trusted neighbour\'s, or hidden at home.'},
                {t:'Choose your destination carefully', b:'Do not go to the first obvious place — your mother\'s home or your sister\'s. These are the first places an abuser will look. Choose someone he has no relationship with, or contact a shelter before you leave.'},
                {t:'Tell one person your full plan', b:'One trusted person — not mutual friends — should know: where you are going, your route, when to expect your call, and what to do if they don\'t hear from you by a specific time.'},
                {t:'Secure digital accounts first', b:'Before leaving: change your email and social media passwords. Log out of shared devices. Check for tracking apps on your phone (look for unfamiliar apps in settings). Get a new SIM card if possible. He will try to find you digitally.'},
                {t:'Get a Protection Order',  b:'Under the Protection Against Domestic Violence Act 2015, a magistrate can issue a Protection Order within 24 hours of application — without the abuser present. FIDA Kenya or Kituo Cha Sheria can help you apply. This gives police legal authority to arrest him if he comes near you.'},
              ].map((s,i)=>(
                <div key={i} style={{paddingBottom:12,marginBottom:12,borderBottom:i<4?'1px solid #C4AABB':'none'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#180410',fontFamily:"'Nunito Sans',sans-serif",marginBottom:4}}>{s.t}</div>
                  <p style={{fontSize:11,color:'#7A4A60',lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{s.b}</p>
                </div>
              ))}
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:2}}>
              {/* After leaving */}
              <div style={{background:'#D4BEC4',border:'1px solid #B89AAA',padding:18,flex:1}}>
                <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:'#180410',marginBottom:4,borderBottom:'2px solid #8A4010',paddingBottom:8}}>
                  After you leave — the first 30 days
                </div>
                <p style={{fontSize:11,color:'#7A4A60',fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.7,marginBottom:10}}>
                  This is the highest-risk window. Stay alert.
                </p>
                {[
                  'Change your routines — vary your route to work, market, church. Unpredictability is safety.',
                  'Block him on all platforms — but do not delete evidence. Screenshot all threats first.',
                  'Inform your workplace, school and place of worship that he is not permitted to contact you there.',
                  'If he shows up anywhere — call 999 and your lawyer immediately. His presence is a violation of the Protection Order.',
                  'Document every contact attempt — save messages, photograph notes, note dates and times of sightings.',
                  'Do not meet him alone — not to "talk", not for the children, not at a friend\'s request. Every meeting is a risk.',
                ].map((s,i)=>(
                  <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'flex-start'}}>
                    <span style={{color:'#8A1030',fontWeight:700,flexShrink:0,fontFamily:"'Nunito Sans',sans-serif",fontSize:11}}>▸</span>
                    <p style={{fontSize:11,color:'#7A4A60',lineHeight:1.6,fontFamily:"'Nunito Sans',sans-serif"}}>{s}</p>
                  </div>
                ))}
              </div>

              {/* When he says I\'ve changed */}
              <div style={{background:'#E8D0C8',border:'1px solid #B07060',padding:18}}>
                <div style={{fontFamily:"'Lora',serif",fontSize:15,fontWeight:700,color:'#6A1008',marginBottom:10}}>
                  When he says "I\'ve changed" — what to know
                </div>
                {[
                  {t:'Genuine change takes years', b:'Not weeks. Not a month of good behaviour. Not a new church attendance. The patterns of control and violence that led to this moment were built over years and require intensive professional intervention — not just willpower — to change.'},
                  {t:'"The children need their father"', b:'Children need safety first. A father who terrorises their mother is not providing safety. If contact is required, it must happen through formal channels — court-ordered, supervised, in a neutral public space.'},
                  {t:'Family pressure is not evidence of change', b:'His family, your family, mutual friends — none of them live inside that relationship. Their pressure to reconcile is not an assessment of risk. Your safety is not a community decision.'},
                ].map((s,i)=>(
                  <div key={i} style={{paddingBottom:10,marginBottom:10,borderBottom:i<2?'1px solid #C4A090':'none'}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#6A1008',fontFamily:"'Nunito Sans',sans-serif",marginBottom:3}}>{s.t}</div>
                    <p style={{fontSize:11,color:'#7A4060',lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{s.b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shelters and legal */}
          <div style={{display:'grid',gridTemplateColumns:mobile?'1fr':'1fr 1fr',gap:2,marginTop:2}}>
            <div style={{background:'#D4BEC4',border:'1px solid #B89AAA',padding:18}}>
              <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,color:'#180410',marginBottom:10,letterSpacing:'.06em',textTransform:'uppercase'}}>Immediate shelter & refuge</div>
              {[
                {n:'GVRC Kenya',             p:'0800 723 253', note:'Safe accommodation, counselling, medical care — Nairobi and county branches'},
                {n:'Usikimye',               p:'0800 723 253', note:'Can connect you to safe housing and legal support'},
                {n:'COVAW',                  p:'020 386 1625', note:'Access to justice and safe referrals for survivors'},
                {n:'FIDA Kenya',             p:'0719 638 006', note:'Legal aid including applying for Protection Orders — free'},
                {n:'Kituo Cha Sheria',       p:'0800 720 434', note:'Free legal advice and representation'},
              ].map((r,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',paddingBottom:10,marginBottom:10,borderBottom:i<4?'1px solid #C4AABB':'none'}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:'#180410',fontFamily:"'Nunito Sans',sans-serif"}}>{r.n}</div>
                    <p style={{fontSize:11,color:'#7A4A60',fontFamily:"'Nunito Sans',sans-serif",marginTop:2}}>{r.note}</p>
                  </div>
                  <a href={`tel:${r.p.replace(/\s/g,'')}`} style={{fontSize:14,color:'#8A1030',fontFamily:"'Lora',serif",fontWeight:700,textDecoration:'none',flexShrink:0,marginLeft:12}}>{r.p}</a>
                </div>
              ))}
            </div>
            <div style={{background:'#D4BEC4',border:'1px solid #B89AAA',padding:18}}>
              <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,color:'#180410',marginBottom:10,letterSpacing:'.06em',textTransform:'uppercase'}}>Your legal rights when leaving</div>
              {[
                {t:'Protection Order', b:'Under the Protection Against Domestic Violence Act 2015. A magistrate can issue it within 24 hours. It legally prohibits him from contacting you, coming near your home or workplace, and from harassing you or your children. Violation = arrest.'},
                {t:'Occupation Order', b:'You can apply to remain in the family home and have him removed — even if the property is in his name. This requires legal representation. FIDA Kenya handles these cases.'},
                {t:'Custody and access', b:'You are entitled to emergency custody of children when fleeing domestic violence. Inform the court immediately. A children\'s officer can assist with emergency placement.'},
                {t:'Divorce on grounds of cruelty', b:'Physical or psychological abuse is legal grounds for divorce in Kenya. You do not need to prove "fault" beyond the abuse itself. FIDA and Kituo Cha Sheria can represent you at no cost.'},
              ].map((s,i)=>(
                <div key={i} style={{paddingBottom:10,marginBottom:10,borderBottom:i<3?'1px solid #C4AABB':'none'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#180410',fontFamily:"'Nunito Sans',sans-serif",marginBottom:3}}>{s.t}</div>
                  <p style={{fontSize:11,color:'#7A4A60',lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{s.b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANIC APPS */}
        <div style={{background:'#C4AABB',border:`1px solid ${BD}`,padding:24,marginBottom:2}}>
          <div style={{marginBottom:14}}>
            <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,letterSpacing:'.12em',color:A,textTransform:'uppercase',fontWeight:700,marginBottom:6}}>Digital safety tools</p>
            <div style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:TXT,borderBottom:'2px solid #8A1030',paddingBottom:10}}>Panic buttons & location sharing tools</div>
          </div>
          <p style={{fontSize:12,color:MUT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.8,marginBottom:14}}>
            There is no perfect panic button system in Kenya yet — this is a gap the government and CSOs are working to fill.
            These are the most practical tools available right now, in order of reliability:
          </p>
          <div style={{display:'grid',gridTemplateColumns:mobile?'1fr':'repeat(3,1fr)',gap:2}}>
            {[
              {t:'WhatsApp Live Location',r:'★★★★★',c:'Free · Everyone has it',b:'The most widely used de facto safety tool in Kenya. Share your location before any meeting. If you stop moving and don\'t respond to messages, your contact can see exactly where you are and call police. Simple. Effective. Free.'},
              {t:'Usikimye helpline',r:'★★★★★',c:'0800 723 253 · Toll-free',b:'Kenya\'s most active GBV helpline. 150+ calls daily. Staffed by trained counsellors who can help you build a safety plan, connect to shelter, and navigate the police reporting process. Call any time.'},
              {t:'GVRC Kenya',r:'★★★★☆',c:'Nairobi & major counties',b:'Gender Violence Recovery Centre provides immediate medical care, psychosocial counselling, and legal support. Their trained staff administer the Danger Assessment tool and can help build a personalised safety plan.'},
              {t:'Bsafe App',r:'★★★☆☆',c:'Free download · Kenya-compatible',b:'Safety app with a panic alarm that alerts emergency contacts with your GPS location. The "follow me" feature lets contacts track your journey in real time. Works even when you can\'t speak.'},
              {t:'M-Salama (Safaricom)',r:'★★★☆☆',c:'USSD *100# · Available on all phones',b:'Safaricom\'s safety feature. Shake your phone or dial a short code to send your GPS coordinates to pre-set contacts via SMS. Works on basic phones without internet.'},
              {t:'Google Maps location share',r:'★★★☆☆',c:'Free · Android & iPhone',b:'Share your real-time location for a set duration. More precise than WhatsApp in some areas. Set up sharing with trusted contacts before you go anywhere that feels unsafe.'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#D4BEC4',border:`1px solid ${BD}`,padding:16}}>
                <div style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:13,fontWeight:700,color:TXT,marginBottom:3}}>{s.t}</div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontSize:12,color:'#CA8A04'}}>{s.r}</span>
                  <span style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>{s.c}</span>
                </div>
                <p style={{fontSize:11,color:MUT,lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{s.b}</p>
              </div>
            ))}
          </div>
          <div style={{background:'#E8D0C8',border:`1px solid #B07060`,padding:'12px 16px',marginTop:2,display:'flex',gap:8}}>
            <AlertTriangle size={13} color={A} style={{flexShrink:0,marginTop:2}}/>
            <p style={{fontSize:11,color:'#6A1008',fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.7}}>
              <strong>None of these apps replace human intervention.</strong> Always pair any app with a trusted human contact who knows your plan and has committed to acting if they don\'t hear from you. Technology fails — people don\'t have to.
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}
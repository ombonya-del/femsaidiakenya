import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, ExternalLink, AlertTriangle, Upload, X, Check, Clock, ChevronDown } from 'lucide-react'

// ── CONFIG ────────────────────────────────────────────────────────────────────
// Replace with your actual Supabase URL and anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const A   = '#8A1030'
const BD  = '#B89AAA'
const BG  = '#D4BEC4'
const CRD = '#C4AABB'
const TXT = '#180410'
const MUT = '#7A4A60'

const COUNTIES = [
  'Nairobi','Kiambu','Mombasa','Nakuru','Kisumu','Kajiado','Kwale',
  'Machakos',"Murang'a",'Kilifi','Uasin Gishu','Trans Nzoia','Meru',
  'Kakamega','Nyeri','Nandi','Embu','Kirinyaga','Bungoma','Homa Bay',
  'Nyamira','Laikipia','Baringo','Narok','Kericho','Bomet','Siaya',
  'Vihiga','Busia','Migori','Kisii','Nyandarua','Taita Taveta','Kitui',
  'Makueni','Samburu','Lamu','Tana River','Garissa','Wajir','Mandera',
  'Marsabit','Isiolo','Turkana','West Pokot','Elgeyo Marakwet','Tharaka Nithi',
]

const PLATFORMS = [
  'WhatsApp','Instagram','Facebook','TikTok','Tinder','Bumble',
  'Badoo','Twitter / X','Snapchat','Telegram','OkCupid','Hinge','Other',
]

const TIER_CONFIG = {
  reported:     { label:'Reported',     bg:'#E8D0C8', bc:'#B07060', tc:'#6A1008', dot:'#C05040' },
  corroborated: { label:'Corroborated', bg:'#DCC8B8', bc:'#A07040', tc:'#5A2808', dot:'#A06030' },
  convicted:    { label:'Convicted',    bg:'#C8D8C0', bc:'#60A050', tc:'#1A4810', dot:'#2A8020' },
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function TierBadge({ tier }) {
  const c = TIER_CONFIG[tier] || TIER_CONFIG.reported
  return (
    <span style={{
      fontFamily:"'Nunito Sans',sans-serif", fontSize:10, fontWeight:700,
      padding:'3px 9px', border:`1px solid ${c.bc}`,
      background:c.bg, color:c.tc, letterSpacing:'.08em',
      textTransform:'uppercase', display:'inline-flex', alignItems:'center', gap:4,
    }}>
      <span style={{width:6,height:6,borderRadius:'50%',background:c.dot,display:'inline-block'}}/>
      {c.label}
    </span>
  )
}

function ProfileCard({ profile, onClick }) {
  const tier = profile.tier || 'reported'
  const showName = tier !== 'reported'
  return (
    <div onClick={() => onClick(profile)}
      style={{
        background:CRD, border:`1px solid ${BD}`,
        cursor:'pointer', transition:'border-color .15s',
        overflow:'hidden',
      }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=A}
      onMouseLeave={e=>e.currentTarget.style.borderColor=BD}>

      {/* Photo area */}
      <div style={{
        height:160, background:'#BC9EAE',
        display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative', overflow:'hidden',
      }}>
        {profile.photo_url ? (
          <img src={profile.photo_url} alt="Profile"
            style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        ) : (
          <div style={{textAlign:'center'}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:'#A89AAA',margin:'0 auto 8px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:22,color:'#7A5068'}}>?</span>
            </div>
            <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>No photo submitted</p>
          </div>
        )}
        <div style={{position:'absolute',top:10,left:10}}>
          <TierBadge tier={tier}/>
        </div>
      </div>

      {/* Card body */}
      <div style={{padding:'14px 16px'}}>
        <div style={{fontFamily:"'Lora',serif",fontSize:15,fontWeight:700,color:showName?TXT:MUT,marginBottom:6,fontStyle:showName?'normal':'italic'}}>
          {showName ? (profile.name || profile.aliases?.[0] || 'Name withheld') : 'Name withheld — pending corroboration'}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
          <span style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif",fontWeight:600}}>{profile.county}</span>
          {profile.platforms?.length > 0 && (
            <>
              <span style={{color:BD}}>·</span>
              <span style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>{profile.platforms.slice(0,2).join(', ')}{profile.platforms.length>2?` +${profile.platforms.length-2}`:''}</span>
            </>
          )}
        </div>
        <p style={{fontSize:12,color:TXT,lineHeight:1.6,fontFamily:"'Nunito Sans',sans-serif",
          display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
          {profile.modus_operandi}
        </p>
        {tier === 'convicted' && profile.court_ref && (
          <a href={profile.court_ref} target="_blank" rel="noopener noreferrer"
            onClick={e=>e.stopPropagation()}
            style={{display:'inline-flex',alignItems:'center',gap:4,marginTop:8,
              fontSize:11,color:A,fontFamily:"'Nunito Sans',sans-serif",fontWeight:600,textDecoration:'none'}}>
            Court record <ExternalLink size={10}/>
          </a>
        )}
      </div>
    </div>
  )
}

function ProfileModal({ profile, onClose }) {
  if (!profile) return null
  const tier = profile.tier || 'reported'
  const showName = tier !== 'reported'

  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(24,4,16,0.7)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:1000,padding:24,
    }} onClick={onClose}>
      <div style={{
        background:BG,border:`1px solid ${BD}`,maxWidth:600,width:'100%',
        maxHeight:'90vh',overflowY:'auto',
      }} onClick={e=>e.stopPropagation()}>

        {/* Modal header */}
        <div style={{background:CRD,padding:'16px 20px',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <TierBadge tier={tier}/>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:MUT,display:'flex'}}>
            <X size={18}/>
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{background:'#DDD0D0',padding:'10px 20px',borderBottom:`1px solid ${BD}`,display:'flex',gap:8,alignItems:'flex-start'}}>
          <AlertTriangle size={14} color={A} style={{flexShrink:0,marginTop:2}}/>
          <p style={{fontSize:11,color:TXT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.6}}>
            {tier==='reported' && 'This profile has been submitted and is pending corroboration. It has not been independently verified. Treat with caution.'}
            {tier==='corroborated' && 'This profile has been corroborated by multiple independent reports and reviewed by FemSaidia Kenya admins.'}
            {tier==='convicted' && 'This profile is linked to a verified court record. See the case reference below.'}
          </p>
        </div>

        <div style={{padding:20}}>
          {/* Photo */}
          {profile.photo_url && (
            <div style={{marginBottom:16}}>
              <img src={profile.photo_url} alt="Profile"
                style={{width:'100%',maxHeight:280,objectFit:'cover',display:'block'}}/>
            </div>
          )}

          {/* Name */}
          <div style={{marginBottom:14}}>
            <p className="label" style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,letterSpacing:'.1em',color:MUT,textTransform:'uppercase',marginBottom:4}}>Name / Aliases</p>
            <div style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:showName?TXT:MUT,fontStyle:showName?'normal':'italic'}}>
              {showName ? (profile.name || 'Not provided') : 'Withheld — pending corroboration'}
            </div>
            {showName && profile.aliases?.length > 0 && (
              <p style={{fontSize:12,color:MUT,marginTop:4,fontFamily:"'Nunito Sans',sans-serif"}}>Also known as: {profile.aliases.join(', ')}</p>
            )}
          </div>

          {/* Details grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:2,marginBottom:14}}>
            {[
              {l:'County',   v:profile.county},
              {l:'Platforms used', v:profile.platforms?.join(', ') || 'Not specified'},
            ].map((f,i)=>(
              <div key={i} style={{background:CRD,border:`1px solid ${BD}`,padding:'12px 14px'}}>
                <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:4}}>{f.l}</p>
                <p style={{fontSize:13,color:TXT,fontFamily:"'Nunito Sans',sans-serif",fontWeight:600}}>{f.v}</p>
              </div>
            ))}
          </div>

          {/* MO */}
          <div style={{background:CRD,border:`1px solid ${BD}`,padding:'14px 16px',marginBottom:14}}>
            <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:6}}>Mode of operation</p>
            <p style={{fontSize:13,color:TXT,lineHeight:1.7,fontFamily:"'Nunito Sans',sans-serif"}}>{profile.modus_operandi}</p>
          </div>

          {/* Court ref */}
          {tier==='convicted' && profile.court_ref && (
            <div style={{background:'#C8D8C0',border:'1px solid #60A050',padding:'12px 16px',marginBottom:14}}>
              <p style={{fontSize:10,color:'#1A4810',fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:4}}>Court record</p>
              <a href={profile.court_ref} target="_blank" rel="noopener noreferrer"
                style={{fontSize:12,color:'#1A4810',fontFamily:"'Nunito Sans',sans-serif",fontWeight:700,display:'inline-flex',alignItems:'center',gap:4,textDecoration:'none'}}>
                View case on Kenya Law Reports <ExternalLink size={11}/>
              </a>
            </div>
          )}

          {/* Social sharing */}
          <div style={{marginBottom:10}}>
            <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8,fontWeight:600}}>Share this warning</p>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              <a href={`https://wa.me/?text=${encodeURIComponent(`⚠️ Red Flag Alert · ${profile.county} · FemSaidia Kenya\n\nMode of operation: ${profile.modus_operandi?.substring(0,120)}...\n\nCheck the full profile and stay safe: https://femsaidiakenya.org`)}`}
                target="_blank" rel="noopener noreferrer"
                style={{background:'#25D366',color:'#fff',fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,padding:'7px 14px',textDecoration:'none'}}>
                WhatsApp
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`⚠️ Red Flag Alert · ${profile.county} · ${profile.tier} report on @FemSaidiaKE\n\n${profile.modus_operandi?.substring(0,100)}...\n\nStay safe: https://femsaidiakenya.org #FemicideIsACrisis`)}`}
                target="_blank" rel="noopener noreferrer"
                style={{background:'#000',color:'#fff',fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,padding:'7px 14px',textDecoration:'none'}}>
                X / Twitter
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=https://femsaidiakenya.org`}
                target="_blank" rel="noopener noreferrer"
                style={{background:'#1877F2',color:'#fff',fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,padding:'7px 14px',textDecoration:'none'}}>
                Facebook
              </a>
              <button onClick={()=>navigator.clipboard.writeText(`Red Flag Alert · ${profile.county} · FemSaidia Kenya\nMode of operation: ${profile.modus_operandi}\nhttps://femsaidiakenya.org`)}
                style={{background:CRD,color:MUT,fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,padding:'7px 14px',border:`1px solid ${BD}`,cursor:'pointer'}}>
                Copy text
              </button>
            </div>
          </div>

          {/* Report to DCI */}
          <div style={{background:'#E8D0C8',border:`1px solid #B07060`,padding:'14px 16px',display:'flex',alignItems:'center',gap:12}}>
            <AlertTriangle size={16} color={A}/>
            <div>
              <p style={{fontSize:12,color:TXT,fontWeight:600,fontFamily:"'Nunito Sans',sans-serif"}}>Know this person or have more information?</p>
              <div style={{display:'flex',gap:10,marginTop:6,flexWrap:'wrap'}}>
                <a href="tel:0800722203" style={{fontSize:11,color:A,fontFamily:"'Nunito Sans',sans-serif",fontWeight:700,textDecoration:'none'}}>Call DCI: 0800 722 203</a>
                <span style={{color:BD}}>·</span>
                <a href="tel:999" style={{fontSize:11,color:A,fontFamily:"'Nunito Sans',sans-serif",fontWeight:700,textDecoration:'none'}}>Emergency: 999</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SUBMISSION FORM ───────────────────────────────────────────────────────────
function SubmissionForm({ onClose }) {
  const [step, setStep]       = useState(1) // 1=details, 2=photo, 3=submitter, 4=confirm
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm]       = useState({
    accused_name:'', accused_aliases:'', accused_county:'',
    modus_operandi:'', platforms:[], photo_url:'', social_link:'',
    additional_info:'', court_ref:'',
    submitter_name:'', submitter_email:'', submitter_phone:'',
    terms_accepted:false, certifies_truth:false,
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [errors, setErrors] = useState({})

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const togglePlatform = (p) => {
    setForm(f=>({...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter(x=>x!==p)
        : [...f.platforms, p]
    }))
  }

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const validatePhone = (phone) => {
    const p = phone.replace(/\s+/g,'')
    return /^(\+254|254|0)[17][0-9]{8}$/.test(p)
  }

  const validate = () => {
    const e = {}
    if (step===1) {
      if (!form.accused_county) e.accused_county = 'County is required'
      if (!form.modus_operandi || form.modus_operandi.length < 30)
        e.modus_operandi = 'Please describe the mode of operation in at least 30 characters'
    }
    if (step===3) {
      if (!form.submitter_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitter_email))
        e.submitter_email = 'Please enter a valid email address'
      if (!form.submitter_phone)
        e.submitter_phone = 'Phone number is required'
      else if (!validatePhone(form.submitter_phone))
        e.submitter_phone = 'Enter a valid Kenyan number: 0712 345 678 or +254712345678'
    }
    if (step===4) {
      // Re-validate phone and email before final submit
      if (!form.submitter_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitter_email))
        e.submitter_email = 'Valid email is required'
      if (!form.submitter_phone || !validatePhone(form.submitter_phone))
        e.submitter_phone = 'Valid Kenyan phone number is required — go back and fix'
      if (!form.terms_accepted) e.terms_accepted = 'You must accept the terms'
      if (!form.certifies_truth) e.certifies_truth = 'You must certify the truthfulness of your submission'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate()) setStep(s=>s+1) }
  const back = () => setStep(s=>s-1)

  const submit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      let photo_url = form.photo_url
      // Upload photo if provided
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const fileName = `${Date.now()}.${ext}`
        const { data, error } = await supabase.storage
          .from('redflag-photos')
          .upload(fileName, photoFile, { cacheControl:'3600', upsert:false })
        if (!error) {
          const { data: urlData } = supabase.storage.from('redflag-photos').getPublicUrl(fileName)
          photo_url = urlData.publicUrl
        }
      }
      // Insert submission
      const { error } = await supabase.from('redflag_submissions').insert([{
        ...form,
        photo_url,
        platforms: form.platforms.join(','),
        status: 'pending',
      }])
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setErrors({submit:'Submission failed. Please try again or contact us at femsaidiakenya.org'})
    }
    setLoading(false)
  }

  const inputStyle = {
    width:'100%', fontFamily:"'Nunito Sans',sans-serif", fontSize:13,
    color:TXT, background:'#DDD0D0', border:`1px solid ${BD}`,
    padding:'9px 12px', outline:'none', marginTop:4,
  }
  const labelStyle = {
    fontSize:11, color:MUT, fontFamily:"'Nunito Sans',sans-serif",
    letterSpacing:'.08em', textTransform:'uppercase', fontWeight:600,
    display:'block', marginTop:14, marginBottom:2,
  }
  const errorStyle = { fontSize:11, color:A, fontFamily:"'Nunito Sans',sans-serif", marginTop:3 }

  if (success) return (
    <div style={{textAlign:'center',padding:'40px 20px'}}>
      <div style={{width:48,height:48,borderRadius:'50%',background:'#C8D8C0',border:'2px solid #60A050',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
        <Check size={22} color="#1A4810"/>
      </div>
      <div style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:TXT,marginBottom:8}}>Report submitted</div>
      <p style={{fontSize:13,color:MUT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.7,maxWidth:400,margin:'0 auto 20px'}}>
        Thank you. Your report has been received and will be reviewed by our admin team within 48 hours.
        You will not receive a public notification — this protects your anonymity.
      </p>
      <button onClick={onClose}
        style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:600,
          padding:'10px 24px',background:A,color:'#F0D0D8',border:'none',cursor:'pointer'}}>
        Close
      </button>
    </div>
  )

  return (
    <div>
      {/* Progress */}
      <div style={{display:'flex',gap:2,marginBottom:20}}>
        {['Accused details','Photo','Your details','Confirm & submit'].map((s,i)=>(
          <div key={i} style={{flex:1,padding:'6px 8px',textAlign:'center',
            background:step===i+1?A:step>i+1?'#C8D8C0':CRD,
            border:`1px solid ${step===i+1?A:step>i+1?'#60A050':BD}`}}>
            <p style={{fontSize:10,fontFamily:"'Nunito Sans',sans-serif",fontWeight:700,
              color:step===i+1?'#F0D0D8':step>i+1?'#1A4810':MUT,letterSpacing:'.04em'}}>{s}</p>
          </div>
        ))}
      </div>

      {/* Step 1 — Accused details */}
      {step===1 && (
        <div>
          <div style={{background:'#E8D0C8',border:`1px solid #B07060`,padding:'10px 14px',marginBottom:14,display:'flex',gap:8}}>
            <AlertTriangle size={14} color={A} style={{flexShrink:0,marginTop:1}}/>
            <p style={{fontSize:11,color:TXT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.6}}>
              Submitting a false report is a criminal offence under Kenyan law. All submissions are reviewed by our admin team before any profile goes live.
            </p>
          </div>
          <label style={labelStyle}>Name or alias (if known)</label>
          <input style={inputStyle} value={form.accused_name} onChange={e=>set('accused_name',e.target.value)} placeholder="Full name or known alias"/>
          <label style={labelStyle}>Other aliases (optional)</label>
          <input style={inputStyle} value={form.accused_aliases} onChange={e=>set('accused_aliases',e.target.value)} placeholder="Other names this person uses"/>
          <label style={labelStyle}>County <span style={{color:A}}>*</span></label>
          <select style={inputStyle} value={form.accused_county} onChange={e=>set('accused_county',e.target.value)}>
            <option value="">Select county</option>
            {COUNTIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          {errors.accused_county && <p style={errorStyle}>{errors.accused_county}</p>}
          <label style={labelStyle}>Mode of operation <span style={{color:A}}>*</span></label>
          <textarea style={{...inputStyle,minHeight:100,resize:'vertical'}}
            value={form.modus_operandi}
            onChange={e=>set('modus_operandi',e.target.value)}
            placeholder="Describe how this person targets, approaches and harms victims. Include locations, patterns and methods used."/>
          {errors.modus_operandi && <p style={errorStyle}>{errors.modus_operandi}</p>}
          <label style={labelStyle}>Platforms used to target victims</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}}>
            {PLATFORMS.map(p=>(
              <button key={p} onClick={()=>togglePlatform(p)}
                style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:600,
                  padding:'5px 12px',border:`1px solid ${form.platforms.includes(p)?A:BD}`,
                  background:form.platforms.includes(p)?A:CRD,
                  color:form.platforms.includes(p)?'#F0D0D8':MUT,cursor:'pointer'}}>
                {p}
              </button>
            ))}
          </div>
          <label style={labelStyle}>Court case reference (if convicted)</label>
          <input style={inputStyle} value={form.court_ref} onChange={e=>set('court_ref',e.target.value)} placeholder="e.g. Kenya Law Reports URL or case number"/>
        </div>
      )}

      {/* Step 2 — Photo */}
      {step===2 && (
        <div>
          <p style={{fontSize:13,color:MUT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.7,marginBottom:16}}>
            A photo helps warn potential victims. You can upload a photo directly or provide a link to a public social media profile. The photo will be reviewed by our admin team before the profile goes live.
          </p>
          <label style={labelStyle}>Upload a photo</label>
          <div style={{border:`2px dashed ${BD}`,padding:24,textAlign:'center',background:'#DDD0D0',cursor:'pointer',position:'relative'}}
            onClick={()=>document.getElementById('photo-upload').click()}>
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" style={{maxHeight:200,maxWidth:'100%',display:'block',margin:'0 auto'}}/>
            ) : (
              <div>
                <Upload size={24} color={MUT} style={{margin:'0 auto 8px'}}/>
                <p style={{fontSize:12,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>Click to upload a photo (JPG, PNG, max 5MB)</p>
              </div>
            )}
            <input id="photo-upload" type="file" accept="image/jpeg,image/png,image/webp"
              style={{display:'none'}} onChange={handlePhoto}/>
          </div>
          {photoPreview && (
            <button onClick={()=>{setPhotoFile(null);setPhotoPreview(null)}}
              style={{marginTop:6,fontFamily:"'Nunito Sans',sans-serif",fontSize:11,color:MUT,background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
              <X size={12}/> Remove photo
            </button>
          )}
          <label style={{...labelStyle,marginTop:20}}>OR provide a social media link</label>
          <input style={inputStyle} value={form.social_link} onChange={e=>set('social_link',e.target.value)}
            placeholder="e.g. Instagram, Facebook or TikTok profile URL"/>
          <label style={labelStyle}>Additional information (optional)</label>
          <textarea style={{...inputStyle,minHeight:80,resize:'vertical'}}
            value={form.additional_info}
            onChange={e=>set('additional_info',e.target.value)}
            placeholder="Any other evidence, context or information that may help verification"/>
        </div>
      )}

      {/* Step 3 — Submitter details */}
      {step===3 && (
        <div>
          <div style={{background:'#C8D8C0',border:'1px solid #60A050',padding:'10px 14px',marginBottom:14,display:'flex',gap:8}}>
            <Check size={14} color="#1A4810" style={{flexShrink:0,marginTop:1}}/>
            <p style={{fontSize:11,color:'#1A4810',fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.6}}>
              Your details are strictly confidential. They will never be shared publicly. We may contact you for follow-up verification only.
            </p>
          </div>
          <label style={labelStyle}>Your name (optional)</label>
          <input style={inputStyle} value={form.submitter_name} onChange={e=>set('submitter_name',e.target.value)} placeholder="Your name (optional)"/>
          <label style={labelStyle}>Your email address <span style={{color:A}}>*</span></label>
          <input style={inputStyle} type="email" value={form.submitter_email} onChange={e=>set('submitter_email',e.target.value)} placeholder="your@email.com"/>
          {errors.submitter_email && <p style={errorStyle}>{errors.submitter_email}</p>}
          <label style={labelStyle}>Your phone number <span style={{color:A}}>*</span></label>
          <input style={inputStyle} type="tel" value={form.submitter_phone} onChange={e=>set('submitter_phone',e.target.value)} placeholder="+254..."/>
          {errors.submitter_phone && <p style={errorStyle}>{errors.submitter_phone}</p>}
        </div>
      )}

      {/* Step 4 — Confirm */}
      {step===4 && (
        <div>
          <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:TXT,marginBottom:12}}>Review your submission</div>
          <div style={{background:CRD,border:`1px solid ${BD}`,padding:'14px 16px',marginBottom:14}}>
            {[
              {l:'County', v:form.accused_county},
              {l:'Platforms', v:form.platforms.join(', ')||'None specified'},
              {l:'Mode of operation', v:form.modus_operandi},
              {l:'Name / alias', v:form.accused_name||'Not provided'},
            ].map((f,i)=>(
              <div key={i} style={{paddingBottom:10,marginBottom:10,borderBottom:i<3?`1px solid ${BD}`:'none'}}>
                <p style={{fontSize:10,color:MUT,fontFamily:"'Nunito Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase'}}>{f.l}</p>
                <p style={{fontSize:13,color:TXT,fontFamily:"'Nunito Sans',sans-serif",marginTop:3,lineHeight:1.6}}>{f.v}</p>
              </div>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[
              {k:'terms_accepted', label:'I accept the FemSaidia Kenya terms of submission and understand that false reports are a criminal offence under Kenyan law.'},
              {k:'certifies_truth', label:'I certify that to the best of my knowledge, the information I have submitted is truthful and accurate.'},
            ].map(({k,label})=>(
              <label key={k} style={{display:'flex',gap:10,cursor:'pointer',alignItems:'flex-start'}}>
                <input type="checkbox" checked={form[k]} onChange={e=>set(k,e.target.checked)}
                  style={{marginTop:2,flexShrink:0,accentColor:A}}/>
                <p style={{fontSize:12,color:TXT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.6}}>{label}</p>
              </label>
            ))}
            {errors.terms_accepted && <p style={errorStyle}>{errors.terms_accepted}</p>}
            {errors.certifies_truth && <p style={errorStyle}>{errors.certifies_truth}</p>}
            {errors.submit && <p style={errorStyle}>{errors.submit}</p>}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{display:'flex',justifyContent:'space-between',marginTop:20,gap:10}}>
        {step > 1 ? (
          <button onClick={back}
            style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:600,
              padding:'10px 20px',border:`1px solid ${BD}`,background:CRD,color:MUT,cursor:'pointer'}}>
            ← Back
          </button>
        ) : <div/>}
        {step < 4 ? (
          <button onClick={next}
            style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:600,
              padding:'10px 24px',background:A,color:'#F0D0D8',border:'none',cursor:'pointer'}}>
            Continue →
          </button>
        ) : (
          <button onClick={submit} disabled={loading}
            style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:600,
              padding:'10px 24px',background:loading?MUT:A,color:'#F0D0D8',border:'none',cursor:loading?'wait':'pointer'}}>
            {loading ? 'Submitting...' : 'Submit report'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── ADMIN QUEUE ───────────────────────────────────────────────────────────────
function AdminQueue() {
  const [queue, setQueue]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('redflag_submissions')
      .select('*').eq('status','pending').order('created_at',{ascending:true})
      .then(({data}) => { setQueue(data||[]); setLoading(false) })
  }, [])

  const action = async (id, action, profileData) => {
    if (action === 'approve') {
      // Create profile
      await supabase.from('redflag_profiles').insert([{
        tier: 'reported',
        status: 'approved',
        name: profileData.accused_name,
        county: profileData.accused_county,
        modus_operandi: profileData.modus_operandi,
        platforms: profileData.platforms?.split(',').map(p=>p.trim()),
        photo_url: profileData.photo_url,
        social_link: profileData.social_link,
        court_ref: profileData.court_ref,
      }])
      await supabase.from('redflag_submissions').update({status:'approved',processed_at:new Date().toISOString()}).eq('id',id)
    } else {
      await supabase.from('redflag_submissions').update({status:action,processed_at:new Date().toISOString()}).eq('id',id)
    }
    setQueue(q=>q.filter(s=>s.id!==id))
  }

  if (loading) return <p style={{fontSize:12,color:MUT,fontFamily:"'Nunito Sans',sans-serif",padding:20}}>Loading queue...</p>
  if (!queue.length) return (
    <div style={{textAlign:'center',padding:'32px 20px'}}>
      <Check size={28} color="#1A4810" style={{margin:'0 auto 10px'}}/>
      <p style={{fontSize:13,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>No pending submissions</p>
    </div>
  )

  return (
    <div>
      <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif",marginBottom:12}}>
        {queue.length} pending submission{queue.length!==1?'s':''} · Review each carefully before approving
      </p>
      {queue.map((s,i)=>(
        <div key={s.id} style={{background:CRD,border:`1px solid ${BD}`,padding:'16px',marginBottom:2}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:13,color:TXT,fontFamily:"'Nunito Sans',sans-serif",marginBottom:4}}>
                {s.accused_name||'No name'} · {s.accused_county}
              </div>
              <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif",marginBottom:6}}>
                Submitted: {new Date(s.created_at).toLocaleDateString('en-KE')} ·
                Platforms: {s.platforms||'None'}
              </p>
              <p style={{fontSize:12,color:TXT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.6,marginBottom:8}}>
                {s.modus_operandi}
              </p>
              {s.photo_url && <p style={{fontSize:11,color:'#1A4810',fontFamily:"'Nunito Sans',sans-serif",marginBottom:4}}>📷 Photo attached</p>}
              {s.social_link && <a href={s.social_link} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:A,fontFamily:"'Nunito Sans',sans-serif"}}>View social link →</a>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0}}>
              <button onClick={()=>action(s.id,'approve',s)}
                style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,
                  padding:'7px 14px',background:'#C8D8C0',border:'1px solid #60A050',color:'#1A4810',cursor:'pointer'}}>
                ✓ Approve
              </button>
              <button onClick={()=>action(s.id,'duplicate',s)}
                style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,
                  padding:'7px 14px',background:'#DCC8B8',border:'1px solid #A07040',color:'#5A2808',cursor:'pointer'}}>
                ⊕ Duplicate
              </button>
              <button onClick={()=>action(s.id,'rejected',s)}
                style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,fontWeight:700,
                  padding:'7px 14px',background:'#E8D0C8',border:'1px solid #B07060',color:'#6A1008',cursor:'pointer'}}>
                ✕ Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── MAIN RED FLAG TAB ─────────────────────────────────────────────────────────
export default function RedFlagTab() {
  const [profiles, setProfiles]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [tierFilter, setTierFilter]   = useState('all')
  const [countyFilter, setCountyFilter] = useState('')
  const [selected, setSelected]       = useState(null)
  const [showForm, setShowForm]       = useState(false)
  const [showAdmin, setShowAdmin]     = useState(false)
  const [adminMode, setAdminMode]     = useState(false)
  const [adminPass, setAdminPass]     = useState('')
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'femsaidia-admin-2026'

  useEffect(() => {
    supabase.from('redflag_profiles')
      .select('*').eq('status','approved').order('created_at',{ascending:false})
      .then(({data}) => { setProfiles(data||[]); setLoading(false) })
  }, [])

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.aliases?.some(a=>a.toLowerCase().includes(q)) ||
      p.modus_operandi?.toLowerCase().includes(q) ||
      p.county?.toLowerCase().includes(q)
    const matchTier   = tierFilter==='all' || p.tier===tierFilter
    const matchCounty = !countyFilter || p.county===countyFilter
    return matchSearch && matchTier && matchCounty
  })

  return (
    <div className="fade-up" style={{width:'100%'}}>

      {/* Header */}
      <div style={{borderBottom:`1px solid ${BD}`,paddingBottom:20,marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <p className="label" style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:10,letterSpacing:'.12em',color:A,textTransform:'uppercase',marginBottom:10}}>
              ● Community safety database
            </p>
            <h1 className="serif" style={{fontSize:36,fontWeight:700,color:A}}>Red Flag</h1>
            <p style={{fontSize:13,color:MUT,marginTop:6,fontFamily:"'Nunito Sans',sans-serif",fontWeight:300,maxWidth:580,lineHeight:1.8}}>
              A verified database of individuals reported for gender-based violence. Search by name, county or mode of operation.
              All profiles are reviewed by FemSaidia Kenya admins before publication.
            </p>
          </div>
          <div style={{display:'flex',gap:8,flexShrink:0,marginTop:4,flexDirection:'column',alignItems:'flex-end'}}>
            <button onClick={()=>setShowForm(true)}
              style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,
                padding:'10px 20px',background:A,color:'#F0D0D8',border:'none',cursor:'pointer',
                letterSpacing:'.04em',whiteSpace:'nowrap'}}>
              + Submit a report
            </button>
            <button onClick={()=>setShowAdmin(a=>!a)}
              style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,
                padding:'6px 12px',background:'none',border:`1px solid ${BD}`,color:MUT,cursor:'pointer'}}>
              {showAdmin ? 'Hide admin' : 'Admin'}
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{background:'#DDD0D0',border:`1px solid ${BD}`,padding:'12px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'flex-start'}}>
        <AlertTriangle size={14} color={A} style={{flexShrink:0,marginTop:2}}/>
        <p style={{fontSize:11,color:TXT,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1.7}}>
          Profiles are marked <strong>Reported</strong> (submitted, pending corroboration), <strong>Corroborated</strong> (multiple verified reports) or <strong>Convicted</strong> (court record verified).
          A Reported profile is not a confirmed finding. If you believe a profile is inaccurate, contact <a href="mailto:admin@femsaidiakenya.org" style={{color:A}}>admin@femsaidiakenya.org</a>.
        </p>
      </div>

      {/* Admin panel */}
      {showAdmin && (
        <div style={{background:'#E8D0C8',border:`1px solid #B07060`,padding:20,marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <p style={{fontSize:12,fontWeight:700,color:TXT,fontFamily:"'Nunito Sans',sans-serif"}}>Admin queue</p>
            {!adminMode && (
              <div style={{display:'flex',gap:8}}>
                <input type="password" placeholder="Admin password"
                  value={adminPass} onChange={e=>setAdminPass(e.target.value)}
                  style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,padding:'6px 10px',
                    border:`1px solid ${BD}`,background:'#DDD0D0',color:TXT,outline:'none'}}/>
                <button onClick={()=>adminPass===ADMIN_PASS&&setAdminMode(true)}
                  style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,fontWeight:700,
                    padding:'6px 14px',background:A,color:'#F0D0D8',border:'none',cursor:'pointer'}}>
                  Unlock
                </button>
              </div>
            )}
          </div>
          {adminMode ? <AdminQueue/> : (
            <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>Enter the admin password to access the review queue.</p>
          )}
        </div>
      )}

      {/* Search + filters */}
      <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:2,marginBottom:16}}>
        <div style={{position:'relative'}}>
          <Search size={14} color={MUT} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}}/>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name, alias, county, or mode of operation..."
            style={{width:'100%',fontFamily:"'Nunito Sans',sans-serif",fontSize:13,color:TXT,
              background:CRD,border:`1px solid ${BD}`,padding:'10px 12px 10px 34px',outline:'none'}}/>
        </div>
        <select value={tierFilter} onChange={e=>setTierFilter(e.target.value)}
          style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,
            background:CRD,border:`1px solid ${BD}`,padding:'10px 14px',outline:'none',cursor:'pointer'}}>
          <option value="all">All tiers</option>
          <option value="reported">Reported</option>
          <option value="corroborated">Corroborated</option>
          <option value="convicted">Convicted</option>
        </select>
        <select value={countyFilter} onChange={e=>setCountyFilter(e.target.value)}
          style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:MUT,
            background:CRD,border:`1px solid ${BD}`,padding:'10px 14px',outline:'none',cursor:'pointer'}}>
          <option value="">All counties</option>
          {COUNTIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Results count */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <p style={{fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>
          {loading ? 'Loading...' : `${filtered.length} profile${filtered.length!==1?'s':''} found`}
        </p>
        <div style={{display:'flex',gap:8}}>
          {['reported','corroborated','convicted'].map(t=>(
            <span key={t} style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:TIER_CONFIG[t].dot,display:'inline-block'}}/>
              {profiles.filter(p=>p.tier===t).length} {t}
            </span>
          ))}
        </div>
      </div>

      {/* Profile grid */}
      {loading ? (
        <div style={{textAlign:'center',padding:40}}>
          <Clock size={24} color={MUT} style={{margin:'0 auto 10px'}}/>
          <p style={{fontSize:12,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>Loading profiles...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:40,background:CRD,border:`1px solid ${BD}`}}>
          <p style={{fontSize:13,color:MUT,fontFamily:"'Nunito Sans',sans-serif"}}>No profiles found matching your search.</p>
          <button onClick={()=>{setSearch('');setTierFilter('all');setCountyFilter('')}}
            style={{marginTop:10,fontFamily:"'Nunito Sans',sans-serif",fontSize:12,color:A,background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:2}}>
          {filtered.map(p=><ProfileCard key={p.id} profile={p} onClick={setSelected}/>)}
        </div>
      )}

      {/* Profile modal */}
      {selected && <ProfileModal profile={selected} onClose={()=>setSelected(null)}/>}

      {/* Submission form modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(24,4,16,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:24}}
          onClick={()=>setShowForm(false)}>
          <div style={{background:BG,border:`1px solid ${BD}`,maxWidth:580,width:'100%',maxHeight:'90vh',overflowY:'auto'}}
            onClick={e=>e.stopPropagation()}>
            <div style={{background:CRD,padding:'16px 20px',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:700,color:TXT}}>Submit a Red Flag report</div>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',cursor:'pointer',color:MUT,display:'flex'}}>
                <X size={18}/>
              </button>
            </div>
            <div style={{padding:20}}>
              <SubmissionForm onClose={()=>setShowForm(false)}/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
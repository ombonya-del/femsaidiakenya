// hepa USSD — Bilingual SW/EN
// Navigation state simulator — correct back at every level
// Supabase Edge Function — Africa's Talking

Deno.serve(async (req: Request) => {
  const fd   = await req.formData().catch(() => null)
  const body = fd ? Object.fromEntries(fd.entries()) : {}
  const text = (body.text ?? '') as string
  const inp  = text !== '' ? text.split('*') : []

  // Silently log session to Supabase for usage tracking
  const phone    = (body.phoneNumber ?? '') as string
  const session  = (body.sessionId ?? '') as string
  const svcCode  = (body.serviceCode ?? '') as string
  if (text === '' && phone) {
    // New session started — log it (fire and forget, don't block response)
    fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/hepa_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        session_id:   session,
        phone_hash:   phone.slice(-4), // store only last 4 digits for privacy
        service_code: svcCode,
        started_at:   new Date().toISOString(),
      }),
    }).catch(() => {}) // silent fail — never block the USSD response
  }

  // Language from first press: 2=English, else Swahili
  const e   = inp[0] === '2'
  const nav = inp.slice(1)

  // ── LANGUAGE SELECTION ─────────────────────────────────────────────────
  if (text === '') return ok(
`CON Karibu Salmin
Welcome to Salmin
Gharama: Ksh 1.25/ombi
Cost: Ksh 1.25/session
Nambari yako itatumika kuboresha huduma
Your number helps improve this service

1. Kiswahili
2. English
0. Cancel/Futa`)

  // Cancel at language screen
  if (inp[0] === '0') return ok(
`END Asante. Thank you.
Piga tena/Dial again: *384*89056#`)

  // ── BACK FROM MAIN MENU → LANGUAGE SCREEN ────────────────────────────
  if (nav.length === 1 && nav[0] === '0') return ok(
`CON Karibu Salmin
Welcome to Salmin
Chagua lugha/Choose language:
1. Kiswahili
2. English
0. Cancel/Futa`)

  // ── EXPLICIT BACK FROM LEVEL 1 → MAIN MENU ───────────────────────────
  // Belt-and-suspenders: if nav ends in 0 and effective depth is 1, go to main
  // This catches AT session edge cases where state simulator might misfire
  if (nav.length >= 1 && nav[nav.length-1] === '0') {
    // Count effective depth: replay but stop at last 0
    let chk = 0
    for (const p of nav.slice(0, -1)) {
      if (p === '0') { if (chk > 0) chk-- }
      else chk++
    }
    // If we were at level 1 (submenu), go to main menu
    if (chk <= 1) return ok(main(e))
  }

  // ── REPLAY NAV TO FIND CURRENT STATE ──────────────────────────────────
  // Each press either goes deeper (number) or back (0)
  // Replay all presses to find where user actually is now
  let level = 0, o1 = '', o2 = ''
  for (const p of nav) {
    if (p === '0') {
      if (level > 0) level--
      if (level === 0) { o1 = ''; o2 = '' }
      if (level === 1) o2 = ''
    } else {
      level++
      if (level === 1) o1 = p
      else if (level === 2) o2 = p
    }
  }

  const B = e ? 'Back' : 'Rudi'

  // ── RENDER BASED ON CURRENT STATE ─────────────────────────────────────
  if (level === 0) return ok(main(e))
  if (level === 1) return ok(lvl1(o1, e, B))
  if (level === 2) return ok(lvl2(o1, o2, e, B))
  return ok(main(e))
})

// ── LEVEL 0: MAIN MENU ────────────────────────────────────────────────────
function main(e: boolean): string {
  return e
?`CON Welcome to hepa:
1. I am in danger RIGHT NOW
2. Emergency numbers
3. Safety tips
4. Plan to leave safely
5. Make a report
0. Back/Rudi`
:`CON Karibu hepa:
1. Niko hatarini SAA HII
2. Nambari za dharura
3. Vidokezo vya usalama
4. Mpango wa kutoroka
5. Piga ripoti
0. Rudi/Back`
}

// ── LEVEL 1: SUBMENUS ─────────────────────────────────────────────────────
function lvl1(o1: string, e: boolean, B: string): string {
  if (o1==='1') return e
?`CON DANGER - Choose action:
1. Call 999
2. Call DCI Gender Desk
3. Call GVRC
4. Emergency message to copy
0. ${B}`
:`CON HATARI - Chagua hatua:
1. Pigia 999
2. Pigia DCI Jinsia
3. Pigia GVRC
4. Ujumbe wa dharura
0. ${B}`

  if (o1==='2') return e
?`CON Emergency numbers:
1. Police: 999/112
2. DCI: 0800 722 203
3. GVRC: 0800 723 253
4. Usikimye: 0800 723 253
5. FIDA: 0719 638 006
6. Kituo: 0800 720 434
0. ${B}`
:`CON Nambari za dharura:
1. Polisi: 999/112
2. DCI: 0800 722 203
3. GVRC: 0800 723 253
4. Usikimye: 0800 723 253
5. FIDA: 0719 638 006
6. Kituo: 0800 720 434
0. ${B}`

  if (o1==='3') return e
?`CON Safety tips:
1. Steps for right now
2. Before meeting someone new
3. Warning signs
4. Police say it is family matter
0. ${B}`
:`CON Vidokezo vya usalama:
1. Hatua za saa hii
2. Kabla ya kukutana na mgeni
3. Dalili za mpenzi hatari
4. Polisi wakisema ni kinyumbani
0. ${B}`

  if (o1==='4') return e
?`CON Plan to leave safely:
WARNING: Leaving is most dangerous.
Plan BEFORE you go.
1. Preparation
2. The day you leave
3. After you leave
4. Protection Order
0. ${B}`
:`CON Mpango wa kutoroka:
ONYO: Kutoroka ni hatari zaidi.
Panga KABLA ya kwenda.
1. Kujiandaa
2. Siku ya kutoroka
3. Baada ya kutoroka
4. Amri ya Ulinzi
0. ${B}`

  if (o1==='5') return e
?`CON Make a report:
Visit: femsaidiakenya.org
Click Report to submit.
DCI: 0800 722 203
NGEC: 020 272 0585
FIDA: 0719 638 006
Your identity is protected.
0. ${B}`
:`CON Piga ripoti:
Tembelea: femsaidiakenya.org
Bonyeza Report kutuma.
DCI: 0800 722 203
NGEC: 020 272 0585
FIDA: 0719 638 006
Jina lako litabaki siri.
0. ${B}`

  return main(e)
}

// ── LEVEL 2: SUB-SUBMENUS ─────────────────────────────────────────────────
function lvl2(o1: string, o2: string, e: boolean, B: string): string {

  // ── SECTION 1: DANGER ───────────────────────────────────────────────
  if (o1==='1') {
    if (o2==='1') return e
?`CON Call 999 or 112 NOW
Leave line open - they listen.
Get to a crowded place.
Make noise. Do not negotiate.
0. ${B}`
:`CON Pigia 999 au 112 SASA
Acha simu ikilia - watasikia.
Enda pahali kuna watu.
Fanya kelele. Usikubali kuongea.
0. ${B}`

    if (o2==='2') return e
?`CON DCI Gender Desk:
Call: 0800 722 203
FREE. 24 hours.
Independent of local police.
0. ${B}`
:`CON DCI Kitengo cha Jinsia:
Pigia: 0800 722 203
BURE. Masaa 24.
Huru na polisi wa mtaa.
0. ${B}`

    if (o2==='3') return e
?`CON GVRC Kenya:
Call: 0800 723 253
Medical, counselling,
legal support. FREE. 24hrs.
0. ${B}`
:`CON GVRC Kenya:
Pigia: 0800 723 253
Matibabu, ushauri,
msaada wa kisheria. BURE.
0. ${B}`

    if (o2==='4') return e
?`CON Copy & send to trusted contact:
"I am in danger. Call police
on my behalf: 999 or
DCI: 0800 722 203
I am sharing my WhatsApp
location now."
0. ${B}`
:`CON Nakili na tuma kwa rafiki:
"Niko hatarini. Nipigie polisi
kwa niaba yangu: 999 au
DCI: 0800 722 203
Natuma maeneo yangu
kwa WhatsApp sasa."
0. ${B}`
  }

  // ── SECTION 2: EMERGENCY NUMBERS ────────────────────────────────────
  if (o1==='2') {
    const nums: Record<string,[string,string]> = {
      '1':['CON Police Emergency\nCall: 999 or 112\nFree on all networks.','CON Polisi wa Dharura\nPigia: 999 au 112\nBure kwa mitandao yote.'],
      '2':['CON DCI Gender Desk\nCall: 0800 722 203\nFREE. 24 hours.','CON DCI Kitengo Jinsia\nPigia: 0800 722 203\nBURE. Masaa 24.'],
      '3':['CON GVRC Kenya\nCall: 0800 723 253\nFree. Medical & legal.','CON GVRC Kenya\nPigia: 0800 723 253\nBure. Matibabu na kisheria.'],
      '4':['CON Usikimye Helpline\nCall: 0800 723 253\nFree counselling.','CON Usikimye Helpline\nPigia: 0800 723 253\nUshauri bure.'],
      '5':['CON FIDA Kenya\nCall: 0719 638 006\nFree legal aid.','CON FIDA Kenya\nPigia: 0719 638 006\nMsaada wa kisheria bure.'],
      '6':['CON Kituo Cha Sheria\nCall: 0800 720 434\nFree legal aid.','CON Kituo Cha Sheria\nPigia: 0800 720 434\nMsaada wa kisheria bure.'],
    }
    const m = nums[o2]
    if (m) return `${e?m[0]:m[1]}\n0. ${B}`
  }

  // ── SECTION 3: SAFETY TIPS ───────────────────────────────────────────
  if (o1==='3') {
    if (o2==='1') return e
?`CON Steps for RIGHT NOW:
. Call 999, leave line open
. Share location-WhatsApp Live
. Get to a crowded place
. Make noise, break glass
. Do not negotiate
0. ${B}`
:`CON Hatua za SAA HII:
. Pigia 999, acha simu ikilia
. Tuma maeneo uko-WhatsApp Live
. Enda pahali kuna watu
. Fanya kelele, vunja kioo
. Usikubali kuongea
0. ${B}`

    if (o2==='2') return e
?`CON Before meeting someone new:
. Tell someone-who, where, when
. Share location-WhatsApp Live
. Public places only, no Airbnb
. Never leave your drink
. Code word with trusted friend
0. ${B}`
:`CON Kabla ya kukutana na mgeni:
. Elezea watu-nani, wapi, lini
. Tuma maeneo-WhatsApp Live
. Mahali ya umma tu, si Airbnb
. Chunga kinywaji chako
. Neno la siri na rafiki
0. ${B}`

    if (o2==='3') return e
?`CON Warning signs:
. Controls your phone/movements
. Threatens you or family
. Has hit you even once
. Has strangled you-VERY DANGEROUS
. Isolates you from loved ones
0. ${B}`
:`CON Dalili za mpenzi hatari:
. Anakudhibiti simu na mahali
. Anakutishia au familia yako
. Amekupiga hata mara moja
. Amekusonga shingo-HATARI SANA
. Anakutenga na wapendwa
0. ${B}`

    if (o2==='4') return e
?`CON Police say it is family matter:
1. Demand OB number-they must give it
2. Call DCI: 0800 722 203
3. Call NGEC: 020 272 0585
4. FIDA: 0719 638 006
5. IPOA: 0800 724 763
0. ${B}`
:`CON Polisi wakisema ni kinyumbani:
1. Chukua nambari ya OB-lazima
2. Pigia DCI: 0800 722 203
3. Pigia NGEC: 020 272 0585
4. FIDA: 0719 638 006
5. IPOA: 0800 724 763
0. ${B}`
  }

  // ── SECTION 4: LEAVING ───────────────────────────────────────────────
  if (o1==='4') {
    if (o2==='1') return e
?`CON Preparation:
. Secret bag: ID, docs, cash, charger
. Go somewhere they don't know
. Change ALL passwords quietly
. Get Protection Order first
  FIDA: 0719 638 006 (FREE)
0. ${B}`
:`CON Kujiandaa:
. Mkoba wa siri: ID, hati, pesa, chaja
. Chagua mahali hajui
. Badilisha passwords ZOTE polepole
. Pata Amri ya Ulinzi kwanza
  FIDA: 0719 638 006 (BURE)
0. ${B}`

    if (o2==='2') return e
?`CON The day you leave:
. Leave while they are away
. Tell ONE person only
. Go somewhere they don't know
. Change your usual routes
. Call police when leaving
0. ${B}`
:`CON Siku ya kutoroka:
. Toka akiwa hayupo
. Mwambie mtu MMOJA tu
. Enda mahali hajui
. Badilisha njia wewe hutumia
. Pigia polisi ukitoroka
0. ${B}`

    if (o2==='3') return e
?`CON After you leave:
. Vary routes every day
. Block online, save evidence first
. Tell workplace and school
. Never meet them alone-ever
. Save all their contact attempts
0. ${B}`
:`CON Baada ya kutoroka:
. Badilisha njia kila siku
. Mzuie mtandaoni, weka ushahidi
. Elezea hali kazini na shule
. Usikutane naye peke yako kamwe
. Hifadhi majaribio ya kuwasiliana
0. ${B}`

    if (o2==='4') return e
?`CON Protection Order-Law 2015:
. Court issues within 24 hours
. They cannot approach you
. Violation = immediate arrest

FIDA (FREE): 0719 638 006
Kituo: 0800 720 434
0. ${B}`
:`CON Amri ya Ulinzi-Sheria la 2015:
. Mahakama inaitoa masaa 24
. Anapigwa marufuku kukukaribia
. Akikiuka = anashikwa mara moja

FIDA (BURE): 0719 638 006
Kituo: 0800 720 434
0. ${B}`
  }

  return lvl1(o1, e, B)
}

function ok(text: string): Response {
  return new Response(text, {
    status: 200,
    headers: { 'Content-Type':'text/plain;charset=utf-8', 'Cache-Control':'no-cache' },
  })
}
// ─────────────────────────────────────────────────────────────────────────────
// hepa — Africa's Talking USSD Handler
// Vercel Serverless Function
// Endpoint: https://hepa.femsaidiakenya.org/api/ussd
// ─────────────────────────────────────────────────────────────────────────────

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId, serviceCode, phoneNumber, text } = req.body

  // Parse menu navigation
  // text is empty on first dial, then accumulates: "1", "1*2", "1*2*1" etc
  const input = text ? text.split('*') : []
  const level = input.length
  const last  = input[level - 1] || ''

  let response = ''

  // ── LEVEL 0: Main menu ────────────────────────────────────────────────────
  if (text === '' || text === undefined) {
    response = `CON Karibu hepa - Usalama wako ni muhimu
Hepa: Get Away, Stay Safe

1. Nina hatari SASA HIVI
2. Nambari za dharura
3. Vidokezo vya usalama
4. Ninataka kuondoka - mpango wa kutoroka
5. Ripoti tukio`
  }

  // ── OPTION 1: I am in danger RIGHT NOW ───────────────────────────────────
  else if (input[0] === '1' && level === 1) {
    response = `CON HATARI - Chagua hatua:

1. Piga simu 999 (Polisi wa dharura)
2. Piga simu DCI - Kitengo cha Jinsia
3. Piga simu GVRC
4. Tuma ujumbe wa dharura kwa mtu wangu wa kuamini
5. Rudi menyu kuu`
  }

  else if (input[0] === '1' && input[1] === '1') {
    response = `END Piga simu SASA: 999

Unaweza kuacha simu wazi - 
Wasimamizi watasikia na kukusaidia.

Kaa mahali pa watu wengi.
Fanya kelele. Usiogope.`
  }

  else if (input[0] === '1' && input[1] === '2') {
    response = `END Piga simu DCI - Kitengo cha Jinsia:
0800 722 203

Nambari hii ni BURE.
Inapatikana saa 24.
DCI wanaweza kukusaidia hata kama polisi wa karibu hawakusikiliza.`
  }

  else if (input[0] === '1' && input[1] === '3') {
    response = `END Piga simu GVRC:
0800 723 253

Gender Violence Recovery Centre.
Msaada wa matibabu, kisaikolojia na kisheria.
BURE. Saa 24.`
  }

  else if (input[0] === '1' && input[1] === '4') {
    response = `END Tuma ujumbe huu kwa mtu wangu wa kuamini:

"HEPA ALERT: Ninahitaji msaada SASA. 
Piga simu polisi: 999
DCI: 0800 722 203"

Nakili ujumbe huu na umtumie mtu unayemwamini SASA.`
  }

  // ── OPTION 2: Emergency numbers ───────────────────────────────────────────
  else if (input[0] === '2' && level === 1) {
    response = `CON Nambari za dharura - Kenya:

1. Polisi: 999 / 112
2. DCI Kitengo cha Jinsia: 0800 722 203
3. GVRC: 0800 723 253
4. Usikimye: 0800 723 253
5. FIDA Kenya: 0719 638 006
6. Kituo Cha Sheria: 0800 720 434`
  }

  else if (input[0] === '2') {
    const numbers = {
      '1': 'Polisi wa Dharura\nPiga: 999 au 112',
      '2': 'DCI - Kitengo cha Jinsia\nPiga: 0800 722 203\n(BURE, Saa 24)',
      '3': 'GVRC Kenya\nPiga: 0800 723 253\n(BURE, Saa 24)',
      '4': 'Usikimye Helpline\nPiga: 0800 723 253\n(BURE, Saa 24)',
      '5': 'FIDA Kenya - Msaada wa Kisheria\nPiga: 0719 638 006',
      '6': 'Kituo Cha Sheria\nPiga: 0800 720 434\n(BURE)',
    }
    response = `END ${numbers[last] || 'Nambari haipatikani'}`
  }

  // ── OPTION 3: Safety tips ─────────────────────────────────────────────────
  else if (input[0] === '3' && level === 1) {
    response = `CON Vidokezo vya usalama:

1. Wakati wa hatari - hatua za sasa hivi
2. Kabla ya kukutana na mgeni (app ya dating)
3. Dalili za mpenzi wa hatari
4. Polisi wakisema "ni jambo la familia"`
  }

  else if (input[0] === '3' && input[1] === '1') {
    response = `END Hatua za SASA HIVI:

1. Piga 999 - acha simu wazi
2. Tuma mahali pako kwa WhatsApp kwa mtu wa kuamini
3. Nenda mahali pa watu wengi
4. Fanya kelele - vunja kioo, piga kelele
5. USIBISHANE - usalama wako ndio muhimu`
  }

  else if (input[0] === '3' && input[1] === '2') {
    response = `END Kabla ya kukutana na mgeni:

1. Mwambie mtu anayekuamini - nani, wapi, lini
2. Shiriki mahali pako kwa WhatsApp - Live Location
3. Kataa kukutana nyumbani au Airbnb - mahali pa watu tu
4. Usiache kinywaji chako bila uangalizi
5. Panga neno la siri na rafiki - akipokea, apige polisi`
  }

  else if (input[0] === '3' && input[1] === '3') {
    response = `END Dalili za mpenzi wa hatari:

- Anakudhibiti - simu, mahali, marafiki
- Anakutishia wewe au familia yako
- Amekupiga hata mara moja
- Amekusonga shingo (hatari sana - ongeza hatari ya kuuawa mara 700%)
- Anatengana nawe na watu wanaokupenda
- Jeuri inaongezeka polepole`
  }

  else if (input[0] === '3' && input[1] === '4') {
    response = `END Polisi wakisema "ni jambo la familia":

1. Omba nambari ya OB - lazima wakupe
2. Piga DCI moja kwa moja: 0800 722 203
3. Wasiliana na NGEC: 020 272 0585
4. Pata msaada wa kisheria - FIDA: 0719 638 006
5. Ripoti polisi kwa IPOA: 0800 724 763`
  }

  // ── OPTION 4: Leaving plan ────────────────────────────────────────────────
  else if (input[0] === '4' && level === 1) {
    response = `CON Mpango wa kutoroka salama:

ONYO: Wakati wa kutoroka ni HATARI zaidi.
Panga kabla ya kwenda.

1. Kabla ya kutoroka - maandalizi
2. Siku ya kutoroka - hatua
3. Baada ya kutoroka - jiepushe naye
4. Haki zako kisheria (Amri ya Ulinzi)`
  }

  else if (input[0] === '4' && input[1] === '1') {
    response = `END Kabla ya kutoroka - maandalizi:

1. Jitayarisha mfuko wa dharura kwa siri:
   - Kitambulisho, hati za watoto, pesa kidogo
   - Chaja ya simu, dawa muhimu
2. Chagua mahali pasipojulikana - si nyumba ya mama au dada
3. Badilisha nywila zote na toka kwenye vifaa vyote vya pamoja
4. Pata Amri ya Ulinzi KABLA ya kutoroka - FIDA: 0719 638 006`
  }

  else if (input[0] === '4' && input[1] === '2') {
    response = `END Siku ya kutoroka:

1. Mwambie mtu MMOJA tu mpango wako kamili
2. Toka wakati yeye hayupo
3. Nenda mahali asipojua
4. Piga simu polisi ukitoroka ikiwa una Amri ya Ulinzi
5. Badilisha njia yako ya kawaida - asubuhi, kazini, kanisani`
  }

  else if (input[0] === '4' && input[1] === '3') {
    response = `END Baada ya kutoroka - wiki 4 za kwanza:

- Badilisha njia yako kila siku
- Mzuie kwenye mitandao yote - lakini hifadhi ushahidi kwanza
- Arifu kazini, shule, kanisa - asiruhusiwe kukufikia
- Usikutane naye PEKE YAKO - hata kwa watoto
- Hifadhi kila ujumbe wa vitisho - tarehe na muda`
  }

  else if (input[0] === '4' && input[1] === '4') {
    response = `END Amri ya Ulinzi - Haki yako:

Chini ya Sheria ya Ulinzi Dhidi ya Jeuri ya Ndani ya Nyumba 2015:

- Mahakama inaweza kutoa amri ndani ya masaa 24
- Inamkataza kukukaribia nyumbani au kazini
- Ukikiuka = kukamatwa mara moja

FIDA Kenya - BURE: 0719 638 006
Kituo Cha Sheria - BURE: 0800 720 434`
  }

  // ── OPTION 5: Report incident ─────────────────────────────────────────────
  else if (input[0] === '5') {
    response = `END Ripoti tukio la jeuri:

Tembelea: femsaidiakenya.org
Kisha bonyeza "Report" kutuma ripoti.

Au wasiliana na:
- DCI: 0800 722 203
- NGEC: 020 272 0585
- FIDA: 0719 638 006

Jina lako litabaki siri.`
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  else {
    response = `CON hepa - Usalama wako ni muhimu

1. Nina hatari SASA HIVI
2. Nambari za dharura
3. Vidokezo vya usalama
4. Ninataka kuondoka
5. Ripoti tukio`
  }

  res.setHeader('Content-Type', 'text/plain')
  res.status(200).send(response)
}
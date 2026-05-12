// hepa USSD Handler — Africa's Talking
// https://hepa.femsaidiakenya.org/api/ussd

export const config = { api: { bodyParser: true } }

export default async function handler(req, res) {
  // Handle both GET and POST
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).send('Method not allowed')
  }

  // Africa's Talking sends form-urlencoded — parse from body or query
  const sessionId   = req.body?.sessionId   || req.query?.sessionId   || ''
  const serviceCode = req.body?.serviceCode || req.query?.serviceCode || ''
  const phoneNumber = req.body?.phoneNumber || req.query?.phoneNumber || ''
  const text        = req.body?.text        !== undefined ? req.body.text : (req.query?.text || '')
  const networkCode = req.body?.networkCode || req.query?.networkCode || ''

  console.log(`USSD: phone=${phoneNumber} text="${text}"`)

  const input = text !== '' ? text.split('*') : []
  const level = input.length
  const last  = input[level - 1] || ''

  let response = ''

  // ── MAIN MENU ────────────────────────────────────────────────────────────
  if (text === '') {
    response = `CON Karibu hepa - Usalama wako ni muhimu

1. Nina hatari SASA HIVI
2. Nambari za dharura
3. Vidokezo vya usalama
4. Ninataka kuondoka salama
5. Ripoti tukio`
  }

  // ── 1. DANGER NOW ────────────────────────────────────────────────────────
  else if (input[0] === '1' && level === 1) {
    response = `CON HATARI - Chagua hatua:

1. Piga simu 999 (Polisi)
2. Piga DCI - Kitengo cha Jinsia
3. Piga GVRC Kenya
4. Ujumbe wa dharura - copy na tuma
5. Rudi menyu kuu`
  }
  else if (input[0] === '1' && input[1] === '1') {
    response = `END Piga sasa: 999 au 112

Unaweza kuacha simu wazi.
Wasimamizi watasikia.
Nenda mahali pa watu wengi.
Fanya kelele. Usibishane.`
  }
  else if (input[0] === '1' && input[1] === '2') {
    response = `END DCI - Kitengo cha Jinsia:
Piga: 0800 722 203

Nambari hii ni BURE.
Inapatikana saa 24.
DCI ni huru na polisi wa mtaa.`
  }
  else if (input[0] === '1' && input[1] === '3') {
    response = `END GVRC Kenya:
Piga: 0800 723 253

Gender Violence Recovery Centre.
Msaada wa matibabu, kisaikolojia
na kisheria. BURE. Saa 24.`
  }
  else if (input[0] === '1' && input[1] === '4') {
    response = `END Nakili ujumbe huu na tuma:

"HATARI: Ninahitaji msaada SASA.
Piga polisi: 999
DCI: 0800 722 203
[Tuma mahali pako kwa WhatsApp]"`
  }
  else if (input[0] === '1' && input[1] === '5') {
    response = `CON Karibu hepa - Usalama wako ni muhimu

1. Nina hatari SASA HIVI
2. Nambari za dharura
3. Vidokezo vya usalama
4. Ninataka kuondoka salama
5. Ripoti tukio`
  }

  // ── 2. EMERGENCY NUMBERS ─────────────────────────────────────────────────
  else if (input[0] === '2' && level === 1) {
    response = `CON Nambari za dharura - Kenya:

1. Polisi: 999 / 112
2. DCI Jinsia: 0800 722 203
3. GVRC: 0800 723 253
4. Usikimye: 0800 723 253
5. FIDA Kenya: 0719 638 006
6. Kituo Cha Sheria: 0800 720 434`
  }
  else if (input[0] === '2') {
    const nums = {
      '1': 'Polisi wa Dharura\nPiga: 999 au 112',
      '2': 'DCI - Kitengo cha Jinsia\nPiga: 0800 722 203\n(BURE, Saa 24)',
      '3': 'GVRC Kenya\nPiga: 0800 723 253\n(BURE, Saa 24)',
      '4': 'Usikimye Helpline\nPiga: 0800 723 253\n(BURE)',
      '5': 'FIDA Kenya\nPiga: 0719 638 006\n(Msaada wa kisheria bure)',
      '6': 'Kituo Cha Sheria\nPiga: 0800 720 434\n(Msaada wa kisheria bure)',
    }
    response = `END ${nums[last] || 'Chaguo halipatikani'}`
  }

  // ── 3. SAFETY TIPS ───────────────────────────────────────────────────────
  else if (input[0] === '3' && level === 1) {
    response = `CON Vidokezo vya usalama:

1. Hatua za sasa hivi - hatari
2. Kukutana na mgeni (dating)
3. Dalili za mpenzi wa hatari
4. Polisi wakisema "ni familia"`
  }
  else if (input[0] === '3' && input[1] === '1') {
    response = `END Hatua za SASA:

1. Piga 999 - acha simu wazi
2. Tuma mahali pako - WhatsApp Live Location
3. Nenda mahali pa watu wengi
4. Fanya kelele - vunja kioo
5. Usibishane - usalama wako ni muhimu`
  }
  else if (input[0] === '3' && input[1] === '2') {
    response = `END Kabla ya kukutana na mgeni:

1. Mwambie mtu - nani, wapi, lini
2. Shiriki mahali pako - Live Location
3. Kataa nyumba/Airbnb - watu wengi tu
4. Usiache kinywaji chako
5. Neno la siri na rafiki wa kuamini`
  }
  else if (input[0] === '3' && input[1] === '3') {
    response = `END Dalili za hatari:

- Anakudhibiti simu na mahali pako
- Anakutishia wewe au familia
- Amekupiga hata mara moja
- Amekusonga shingo - HATARI SANA
- Anatengana nawe na wapendwa`
  }
  else if (input[0] === '3' && input[1] === '4') {
    response = `END Polisi wakisema "ni familia":

1. Omba nambari ya OB - lazima
2. Piga DCI: 0800 722 203
3. Piga NGEC: 020 272 0585
4. FIDA Kenya: 0719 638 006
5. IPOA (malalamiko): 0800 724 763`
  }

  // ── 4. LEAVING SAFELY ────────────────────────────────────────────────────
  else if (input[0] === '4' && level === 1) {
    response = `CON Mpango wa kutoroka salama:

ONYO: Wakati wa kutoroka ni hatari.
Panga KABLA ya kwenda.

1. Maandalizi ya kutoroka
2. Siku ya kutoroka - hatua
3. Baada ya kutoroka
4. Amri ya Ulinzi - haki yako`
  }
  else if (input[0] === '4' && input[1] === '1') {
    response = `END Maandalizi ya kutoroka:

1. Jitayarisha mfuko wa siri:
   Kitambulisho, hati, pesa, chaja
2. Chagua mahali asipojua
3. Badilisha nywila ZOTE kwa siri
4. Pata Amri ya Ulinzi kwanza
   FIDA: 0719 638 006 (BURE)`
  }
  else if (input[0] === '4' && input[1] === '2') {
    response = `END Siku ya kutoroka:

1. Toka akiwa hayupo
2. Mwambie mtu MMOJA tu
3. Nenda mahali asipojua
4. Badilisha njia yako ya kawaida
5. Piga polisi ukitoroka - Amri ya Ulinzi`
  }
  else if (input[0] === '4' && input[1] === '3') {
    response = `END Baada ya kutoroka:

- Badilisha njia kila siku
- Mzuie mitandaoni - hifadhi ushahidi kwanza
- Arifu kazini na shule
- Usikutane naye peke yako kamwe
- Hifadhi vitisho vyote - tarehe na muda`
  }
  else if (input[0] === '4' && input[1] === '4') {
    response = `END Amri ya Ulinzi:

Sheria ya 2015 - haki yako:
- Mahakama inatoa ndani ya masaa 24
- Anapigwa marufuku kukukaribia
- Akikiuka = kukamatwa mara moja

FIDA Kenya (BURE): 0719 638 006
Kituo Cha Sheria: 0800 720 434`
  }

  // ── 5. REPORT ────────────────────────────────────────────────────────────
  else if (input[0] === '5') {
    response = `END Ripoti tukio:

Tembelea: femsaidiakenya.org
Bonyeza "Report" kutuma ripoti.

Au wasiliana na:
DCI: 0800 722 203
NGEC: 020 272 0585
FIDA: 0719 638 006

Jina lako litabaki siri.`
  }

  // ── FALLBACK ─────────────────────────────────────────────────────────────
  else {
    response = `CON hepa - Usalama wako ni muhimu

1. Nina hatari SASA HIVI
2. Nambari za dharura
3. Vidokezo vya usalama
4. Ninataka kuondoka salama
5. Ripoti tukio`
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache')
  return res.status(200).send(response)
}
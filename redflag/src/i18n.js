import { useState, useEffect } from 'react'

// ── RedFlag i18n — English / Kiswahili / Sheng ───────────────────────────────
// Stage 1: full interface chrome. The long-form archetype/ecosystem safety
// content is translated in stage 2. Sheng strings are a first draft pending a
// native-speaker review. Brand names (RedFlag, JiJue, JiTume, LindaLinda, hepa,
// Salmin, Itika, FemSaidia) are kept as-is across all three languages.

const STRINGS = {
  en: {
    // emergency bar
    emergency: 'Emergency', helplines: 'Helplines', install_hepa: 'Install hepa',
    emergency_numbers: 'Emergency numbers',
    // home
    home_kicker: 'FemSaidia Kenya · Safety Intelligence',
    home_tagline: 'Community intelligence. Safety education. Survivor knowledge. For young women in Kenya — and everyone around them.',
    tile_jijue_sub: 'Know Yourself', tile_jijue_desc: 'Find your archetype. Know your red flags.',
    tile_jitume_sub: 'Take Action', tile_jitume_desc: 'For the ecosystem around her.',
    tile_linda_sub: 'Protect & Share', tile_linda_desc: 'Real safety norms from real people.',
    tile_db_sub: 'Perpetrator Profiles', tile_db_desc: 'Community-sourced database.',
    salmin_title: 'Salama Salmin',
    salmin_body: 'Safe and sound. This platform, hepa, Salmin (*384*89056#) and Red Flag are part of one safety ecosystem built for Kenyan women.',
    learn_more: 'Learn more at femsaidiakenya.org →',
    // nav
    nav_home: 'Home',
    // shared
    back_home: '← Home', loading: 'Loading…', share_yours: '+ Share yours',
    read_full: 'Read full story', show_less: 'Show less', anonymous: 'Anonymous',
    // jijue sub-tabs
    jj_intro: 'Who is this?', jj_redflags: '🚩 Red flags', jj_protect: '🛡️ Protect yourself',
    jj_talk: '💬 Real talk', jj_remember: '🕯 We remember',
    jj_seen_this: 'From someone who has seen this',
    jj_voices: 'Community voices', jj_voices_sub: 'Survivors · Those left behind · Witnesses',
    jj_no_voices: 'No voices shared yet for this archetype.', jj_be_first: 'Be the first',
    jj_remember_intro: 'These are women and girls whose lives were taken. They are not cautionary tales. They are not statistics. They were here. We say their names.',
    jj_memorial_footer: '🕯 Curated from the FemSaidia Kenya femicide database. To add a name, contact us at femsaidiakenya.org',
    jj_rest_power: '🕯 May she rest in power.',
    // voice form
    vf_title: 'Share your voice', vf_sharing_as: 'I am sharing as *',
    vf_survivor: '💪 Survivor', vf_left_behind: '🕯 Left behind', vf_witness: '👁 Witness',
    vf_story: 'Your story *', vf_story_ph: 'Tell it in your own words...',
    vf_connection: 'Your connection (optional)', vf_connection_ph: 'e.g. Sister, friend, neighbour...',
    vf_name: 'Your name (optional)', vf_share_btn: 'Share your story', vf_sharing: 'Sharing…',
    vf_thanks: '✓ Thank you for sharing. Your voice matters.',
    // jitume
    jt_tagline: 'Most femicides do not happen without warning signs that other people saw. This section is for everyone around her. Tap your role.',
    jt_watch: 'What to watch for', jt_do: 'What to do',
    // lindalinda
    ll_tagline: 'Real safety practices from real people. First person. Unfiltered. Like the stranger at the parking lot.',
    ll_share_title: 'Share a safety norm', ll_shared: '✓ Shared. Thank you.',
    ll_f_title: 'Give it a title *', ll_f_title_ph: 'e.g. The parking lot intervention',
    ll_f_story: 'Your story *', ll_f_story_ph: 'Tell it exactly as it happened...',
    ll_f_context: 'Context (optional)', ll_f_context_ph: 'e.g. Club, taxi, neighbourhood...',
    ll_share_btn: 'Share this norm', ll_no_stories: 'No stories yet. Be the first.',
    // database
    db_subtitle: 'Community-sourced · Admin verified',
    db_search_ph: 'Search by name, alias, county, modus operandi…',
    db_tier1: 'Confirmed', db_tier2: 'Multiple reports', db_tier3: 'Flagged',
    db_also: 'Also:', db_county: 'County', db_social: 'Social media',
    db_how: 'How they operate', db_details: 'Additional details',
    db_disclaimer: '⚠️ Community-submitted, admin-reviewed. Not a conviction.',
    db_no_results: 'No results for that search.', db_no_profiles: 'No approved profiles yet.',
    // county prompt
    cp_title: 'What county are you in?',
    cp_body: 'Used to route emergency alerts to Itika community responders near you. Stays on your phone only.',
    cp_select: 'Select your county...', cp_skip: 'Skip for now',
    // labels shared
    name_optional: 'Your name (optional)',
  },

  sw: {
    emergency: 'Dharura', helplines: 'Nambari za Msaada', install_hepa: 'Sakinisha hepa',
    emergency_numbers: 'Nambari za dharura',
    home_kicker: 'FemSaidia Kenya · Akili ya Usalama',
    home_tagline: 'Akili ya jamii. Elimu ya usalama. Maarifa ya walionusurika. Kwa wasichana wa Kenya — na kila mtu aliye karibu nao.',
    tile_jijue_sub: 'Jijue Mwenyewe', tile_jijue_desc: 'Tambua aina yako. Jua alama zako za hatari.',
    tile_jitume_sub: 'Chukua Hatua', tile_jitume_desc: 'Kwa mfumo mzima unaomzunguka.',
    tile_linda_sub: 'Linda na Shiriki', tile_linda_desc: 'Kanuni halisi za usalama kutoka kwa watu halisi.',
    tile_db_sub: 'Wasifu wa Wahalifu', tile_db_desc: 'Hifadhidata kutoka kwa jamii.',
    salmin_title: 'Salama Salmin',
    salmin_body: 'Salama na mzima. Jukwaa hili, hepa, Salmin (*384*89056#) na Red Flag ni sehemu ya mfumo mmoja wa usalama uliojengwa kwa wanawake wa Kenya.',
    learn_more: 'Jifunze zaidi kwa femsaidiakenya.org →',
    nav_home: 'Nyumbani',
    back_home: '← Nyumbani', loading: 'Inapakia…', share_yours: '+ Shiriki yako',
    read_full: 'Soma hadithi nzima', show_less: 'Onyesha kidogo', anonymous: 'Bila jina',
    jj_intro: 'Huyu ni nani?', jj_redflags: '🚩 Alama za hatari', jj_protect: '🛡️ Jilinde',
    jj_talk: '💬 Mazungumzo halisi', jj_remember: '🕯 Tunawakumbuka',
    jj_seen_this: 'Kutoka kwa mtu aliyeyaona haya',
    jj_voices: 'Sauti za jamii', jj_voices_sub: 'Walionusurika · Walioachwa · Mashahidi',
    jj_no_voices: 'Bado hakuna sauti zilizoshirikiwa kwa aina hii.', jj_be_first: 'Kuwa wa kwanza',
    jj_remember_intro: 'Hawa ni wanawake na wasichana ambao maisha yao yalitwaliwa. Sio hadithi za onyo. Sio takwimu. Walikuwa hapa. Tunasema majina yao.',
    jj_memorial_footer: '🕯 Imeandaliwa kutoka hifadhidata ya mauaji ya wanawake ya FemSaidia Kenya. Kuongeza jina, wasiliana nasi kwa femsaidiakenya.org',
    jj_rest_power: '🕯 Apumzike kwa amani na nguvu.',
    vf_title: 'Shiriki sauti yako', vf_sharing_as: 'Ninashiriki kama *',
    vf_survivor: '💪 Niliyenusurika', vf_left_behind: '🕯 Niliyeachwa', vf_witness: '👁 Shahidi',
    vf_story: 'Hadithi yako *', vf_story_ph: 'Ieleze kwa maneno yako mwenyewe...',
    vf_connection: 'Uhusiano wako (hiari)', vf_connection_ph: 'mf. Dada, rafiki, jirani...',
    vf_name: 'Jina lako (hiari)', vf_share_btn: 'Shiriki hadithi yako', vf_sharing: 'Inashirikiwa…',
    vf_thanks: '✓ Asante kwa kushiriki. Sauti yako ni muhimu.',
    jt_tagline: 'Mauaji mengi ya wanawake hayatokei bila alama za onyo ambazo watu wengine waliziona. Sehemu hii ni kwa kila mtu aliye karibu naye. Gusa jukumu lako.',
    jt_watch: 'Cha kuangalia', jt_do: 'Cha kufanya',
    ll_tagline: 'Mbinu halisi za usalama kutoka kwa watu halisi. Nafsi ya kwanza. Bila kuchujwa. Kama yule mgeni kwenye eneo la maegesho.',
    ll_share_title: 'Shiriki kanuni ya usalama', ll_shared: '✓ Imeshirikiwa. Asante.',
    ll_f_title: 'Ipe kichwa *', ll_f_title_ph: 'mf. Uingiliaji wa eneo la maegesho',
    ll_f_story: 'Hadithi yako *', ll_f_story_ph: 'Ieleze kama ilivyotokea hasa...',
    ll_f_context: 'Mazingira (hiari)', ll_f_context_ph: 'mf. Klabu, teksi, mtaa...',
    ll_share_btn: 'Shiriki kanuni hii', ll_no_stories: 'Bado hakuna hadithi. Kuwa wa kwanza.',
    db_subtitle: 'Kutoka kwa jamii · Imethibitishwa na msimamizi',
    db_search_ph: 'Tafuta kwa jina, jina la utani, kaunti, mbinu…',
    db_tier1: 'Imethibitishwa', db_tier2: 'Ripoti nyingi', db_tier3: 'Imeripotiwa',
    db_also: 'Pia:', db_county: 'Kaunti', db_social: 'Mitandao ya kijamii',
    db_how: 'Jinsi wanavyofanya', db_details: 'Maelezo ya ziada',
    db_disclaimer: '⚠️ Imewasilishwa na jamii, imepitiwa na msimamizi. Sio hukumu.',
    db_no_results: 'Hakuna matokeo ya utafutaji huo.', db_no_profiles: 'Bado hakuna wasifu ulioidhinishwa.',
    cp_title: 'Uko kaunti gani?',
    cp_body: 'Inatumika kuelekeza arifa za dharura kwa waitikiaji wa jamii wa Itika walio karibu nawe. Inabaki kwenye simu yako pekee.',
    cp_select: 'Chagua kaunti yako...', cp_skip: 'Ruka kwa sasa',
    name_optional: 'Jina lako (hiari)',
  },

  sheng: {
    emergency: 'Dharura', helplines: 'Lines za Msaada', install_hepa: 'Install hepa',
    emergency_numbers: 'Namba za dharura',
    home_kicker: 'FemSaidia Kenya · Intel ya Usalama',
    home_tagline: 'Intel ya community. Elimu ya safety. Maarifa ya wale wameokoka. Kwa madem wa Kenya — na kila mtu wako karibu nao.',
    tile_jijue_sub: 'Jijue Wewe', tile_jijue_desc: 'Pata archetype yako. Jua red flags zako.',
    tile_jitume_sub: 'Chukua Action', tile_jitume_desc: 'Kwa kila mtu wako karibu naye.',
    tile_linda_sub: 'Linda na Share', tile_linda_desc: 'Safety tips za ukweli kutoka kwa watu wa ukweli.',
    tile_db_sub: 'Profiles za Wahalifu', tile_db_desc: 'Database kutoka kwa community.',
    salmin_title: 'Salama Salmin',
    salmin_body: 'Safe na sound. Hii platform, hepa, Salmin (*384*89056#) na Red Flag ni sehemu ya ecosystem moja ya safety iliyojengwa kwa madem wa Kenya.',
    learn_more: 'Jua zaidi kwa femsaidiakenya.org →',
    nav_home: 'Home',
    back_home: '← Home', loading: 'Inapakia…', share_yours: '+ Share yako',
    read_full: 'Soma story nzima', show_less: 'Onyesha kidogo', anonymous: 'Bila jina',
    jj_intro: 'Huyu ni nani?', jj_redflags: '🚩 Red flags', jj_protect: '🛡️ Jilinde',
    jj_talk: '💬 Real talk', jj_remember: '🕯 Tunawakumbuka',
    jj_seen_this: 'Kutoka kwa mtu ameona hii',
    jj_voices: 'Voices za community', jj_voices_sub: 'Waliookoka · Walioachwa · Mashahidi',
    jj_no_voices: 'Bado hakuna voice imesharewa kwa archetype hii.', jj_be_first: 'Kuwa wa kwanza',
    jj_remember_intro: 'Hawa ni madem na wasichana ambao maisha yao yalichukuliwa. Sio stories za onyo. Sio statistics. Walikuwa hapa. Tunasema majina yao.',
    jj_memorial_footer: '🕯 Imetolewa kutoka database ya femicide ya FemSaidia Kenya. Ku-add jina, tu-contact kwa femsaidiakenya.org',
    jj_rest_power: '🕯 Apumzike kwa amani na power.',
    vf_title: 'Share voice yako', vf_sharing_as: 'Naskshare kama *',
    vf_survivor: '💪 Niliokoka', vf_left_behind: '🕯 Niliachwa', vf_witness: '👁 Shahidi',
    vf_story: 'Story yako *', vf_story_ph: 'Ieleze kwa words zako...',
    vf_connection: 'Connection yako (optional)', vf_connection_ph: 'mf. Dada, beshte, jirani...',
    vf_name: 'Jina lako (optional)', vf_share_btn: 'Share story yako', vf_sharing: 'Inasharewa…',
    vf_thanks: '✓ Asante kwa ku-share. Voice yako ni muhimu.',
    jt_tagline: 'Femicides nyingi hazifanyiki bila warning signs ambazo watu wengine waliziona. Hii section ni kwa kila mtu wako karibu naye. Bonyeza role yako.',
    jt_watch: 'Cha kuangalia', jt_do: 'Cha kufanya',
    ll_tagline: 'Safety practices za ukweli kutoka kwa watu wa ukweli. First person. Bila filter. Kama yule stranger kwa parking.',
    ll_share_title: 'Share safety norm', ll_shared: '✓ Imesharewa. Asante.',
    ll_f_title: 'Ipe title *', ll_f_title_ph: 'mf. The parking lot intervention',
    ll_f_story: 'Story yako *', ll_f_story_ph: 'Ieleze vile ilifanyika exactly...',
    ll_f_context: 'Context (optional)', ll_f_context_ph: 'mf. Club, teksi, mtaa...',
    ll_share_btn: 'Share norm hii', ll_no_stories: 'Bado hakuna stories. Kuwa wa kwanza.',
    db_subtitle: 'Kutoka kwa community · Imeverify-iwa na admin',
    db_search_ph: 'Tafuta kwa jina, alias, county, modus operandi…',
    db_tier1: 'Imeconfirm-iwa', db_tier2: 'Reports nyingi', db_tier3: 'Imeflag-iwa',
    db_also: 'Pia:', db_county: 'County', db_social: 'Social media',
    db_how: 'Vile wanaoperate', db_details: 'Details za ziada',
    db_disclaimer: '⚠️ Imesubmitiwa na community, imereview-iwa na admin. Sio conviction.',
    db_no_results: 'Hakuna results za hiyo search.', db_no_profiles: 'Bado hakuna profiles zimeapprove-iwa.',
    cp_title: 'Uko county gani?',
    cp_body: 'Inatumika kuroute alerts za dharura kwa responders wa Itika wako karibu nawe. Inabaki kwa simu yako pekee.',
    cp_select: 'Chagua county yako...', cp_skip: 'Ruka kwa sasa',
    name_optional: 'Jina lako (optional)',
  },
}

let current = (() => { try { return localStorage.getItem('redflag_lang') || 'en' } catch { return 'en' } })()
const listeners = new Set()

export const LANGS = [['en','EN'], ['sw','SW'], ['sheng','Sheng']]

export function useLang() {
  const [lang, setLang] = useState(current)
  useEffect(() => { const fn = l => setLang(l); listeners.add(fn); return () => listeners.delete(fn) }, [])
  const set = (l) => { current = l; try { localStorage.setItem('redflag_lang', l) } catch {} listeners.forEach(fn => fn(l)) }
  const t = (key) => (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key
  return { lang, setLang: set, t }
}

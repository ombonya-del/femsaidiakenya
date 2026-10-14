// FemSaidia · Halafu? — proposal kits for the 10 fundable projects.
// Per-project description, verified supporting sources, funder fit and
// client-generated individual / collective (consortium) Word proposal templates.
// Pattern ported from the MazingiraKenya "Je, Hatua?" hub. Sources checked Oct 2026.

export const KIND_LABEL = {
  research: 'Research', article: 'Article', 'case study': 'Case study',
  'law/policy': 'Law / policy', toolkit: 'Toolkit', data: 'Data', report: 'Report',
}

// Shared proposal-writing guides (collab:true items only appear in the consortium template).
export const GUIDES = [
  { t: 'Logframe vs Theory of Change: what’s the difference?', u: 'https://tools4dev.org/blog/logframe-vs-theory-of-change-whats-the-difference/', s: 'tools4dev', w: 'Build both for an individual or a joint proposal.' },
  { t: 'How to write a funding proposal (free template)', u: 'https://tools4dev.org/resources/how-to-write-a-funding-proposal/', s: 'tools4dev', w: 'Section-by-section guidance for a first full proposal.' },
  { t: 'Memorandum of Understanding (MoU) template', u: 'https://tools4dev.org/resources/memorandum-of-understanding-mou-template/', s: 'tools4dev', w: 'Agree consortium roles and money flow before a joint submission.', collab: true },
]

// Kenyan GBV legal / policy hooks reused across kits (each kit also adds its own).
const LAW = {
  soa: 'Sexual Offences Act, 2006 — defines and penalises sexual violence; anchor to survivor protection and perpetrator accountability.',
  pdva: 'Protection Against Domestic Violence Act, 2015 — Kenya’s domestic-violence framework; its definition covers exposing a child to domestic violence.',
  kdpa: 'Data Protection Act, 2019 — governs how you collect, store and share survivors’ and witnesses’ personal data; attach a data-protection policy.',
  const: 'Constitution of Kenya 2010, Art. 2(6) & 27 — domesticates ratified treaties (incl. the Maputo Protocol) and guarantees equality and freedom from discrimination.',
  maputo: 'Maputo Protocol (Protocol to the African Charter on the Rights of Women), Art. 4 — obliges the state to prevent and eliminate violence against women.',
  gbvpol: 'National Policy for Prevention and Response to Gender-Based Violence (2014, under revision) — the national coordination framework for GBV programming.',
  children: 'Children Act, 2022 — duty to protect children from violence and from exposure to it; relevant to school- and family-based work.',
}

// ── THE KITS ──────────────────────────────────────────────────────────────────
// keyed by project id (matches PROJECTS[].id in App.jsx)
export const KITS = {
  p1: {
    estBudget: 'KES 12–18M over 18 months (~USD 90k–140k). Main lines: research team and ethics, platform/algorithm audit, fieldwork and interviews, quarterly index tracking, publication.',
    description: 'Manosphere content — incel, red-pill and “high-value man” material from creators like Andrew Kibe and Amerix — reaches Kenyan boys through TikTok, YouTube and Telegram and is echoed in Sheng on local podcasts. The specific algorithmic pathways, the most influential creators, and the point at which consumption hardens into violence-supportive attitudes are undocumented in Kenya. This project maps that pipeline so that platform-accountability, education and prevention work can target the real on-ramps rather than guess.',
    objectives: [
      'Map the Kenyan manosphere: catalogue the leading creators, platforms, formats and recommendation pathways that serve misogynistic content to boys.',
      'Measure the link between exposure and violence-supportive attitudes through interviews, content analysis and platform audits.',
      'Produce an evidence base usable by platforms, schools and policymakers, and feed indicators into the FemSaidia misogyny index.',
    ],
    activities: [
      'Content analysis of a sampled corpus of Kenyan manosphere creators across TikTok, YouTube and Telegram',
      'Platform / algorithm audit (sock-puppet accounts tracing what boys are served)',
      'Interviews and focus groups with young men on how they encounter and interpret the content',
      'Quarterly tracking of manosphere signals feeding the public misogyny index',
      'Publish a public report and a platform-accountability brief',
    ],
    outcomes: [
      'A documented, Kenya-specific map of the online-to-offline misogyny pipeline',
      'An exposure–attitude evidence base cited by platforms, educators and policymakers',
    ],
    legal: [LAW.const, LAW.maputo, 'Computer Misuse and Cybercrimes Act, 2018 — relevant where content crosses into incitement, harassment or image-based abuse.', LAW.kdpa],
    partners: [
      ['Pollicy / Nendo', 'Kenyan digital-rights research and data on technology-facilitated GBV'],
      ['Institute for Strategic Dialogue (ISD)', 'Global methodology for mapping manosphere communities'],
      ['A Kenyan university (e.g. Maseno / media studies)', 'Local discourse analysis and research ethics'],
    ],
    resources: [
      { t: 'Dada Disinfo: Technology-Facilitated Gender-Based Violence in Kenya', u: 'https://pollicy.org/wp-content/uploads/2024/06/Dada-Disinfo-report.pdf', k: 'research', s: 'Nendo & Pollicy, 2024', w: 'Kenya-specific evidence that online gendered disinformation drives women out of public life.' },
      { t: 'Enter the Manosphere: Misogyny and Gendered Discourse in Kenya’s Online Spaces', u: 'https://journals.mu.ac.ke/index.php/lift/article/view/611', k: 'research', s: 'Maseno University (LiFT), 2025', w: 'Peer-reviewed analysis of Kenyan manosphere figures in local terms.' },
      { t: 'The “Manosphere”: An Overview of Extreme Misogyny Online', u: 'https://www.isdglobal.org/wp-content/uploads/2022/09/Manosphere-ISD-External-August2022.pdf', k: 'research', s: 'Institute for Strategic Dialogue, 2022', w: 'Authoritative map of manosphere communities and online-to-offline pathways.' },
      { t: '“Women’s bodies are the battlefield”: Digital misogyny during the femicide protests', u: 'https://www.nation.africa/kenya/news/gender/-women-s-bodies-are-the-battlefield-survivors-recount-digital-misogyny-during-femicide-protests-5284338', k: 'case study', s: 'Nation Africa / FIDA-Kenya, 2025', w: 'First-hand Kenyan accounts tying online misogyny to the offline movement.' },
      { t: 'Andrew Kibe in BBC Eye documentary “Manosphere Messiahs”', u: 'https://www.nation.africa/kenya/life-and-style/andrew-kibe-features-in-bbc-eye-documentary-investigating-online-masculinity-5477342', k: 'case study', s: 'BBC Eye / Nation Africa, 2025', w: 'Shows how algorithms push Kenyan boys toward extreme-masculinity influencers.' },
    ],
    funderNotes: 'Strong fit for digital-rights and online-safety funders (Luminate, Mozilla, Ford Foundation, Omidyar) and tech-accountability programmes. Frame as research + platform accountability that stops online radicalisation becoming offline femicide — pairing ISD’s global credibility with Pollicy/Nendo’s local data.',
  },

  p2: {
    estBudget: 'KES 15–25M over 18–24 months (~USD 115k–190k). Main lines: data acquisition and integration, multi-county survey, model development and validation, costed policy note.',
    description: 'Financial stress — unemployment, debt, loss of the “provider” role — is a documented trigger in the escalation of intimate-partner violence, and UN Women’s 2026 Kenya briefs link economic dependency and transactionality directly to femicide risk. Yet Kenya has no systematic dataset correlating economic indicators with GBV incidents. This project builds that evidence and a community-level risk model, giving prevention services an early-warning signal and giving advocates the cost-of-inaction numbers.',
    objectives: [
      'Correlate county- and community-level economic indicators (unemployment, debt distress, shocks) with GBV and femicide incidence.',
      'Build and validate a community-level risk model usable by county GBV committees and responders.',
      'Quantify the economic cost of GBV at household and county level to strengthen the investment case.',
    ],
    activities: [
      'Assemble a linked dataset of economic indicators and GBV / femicide incidence across selected counties',
      'Community study (survey + qualitative) on economic stress and violence escalation',
      'Develop and validate a predictive risk model',
      'Produce a public data brief and a costed policy note',
    ],
    outcomes: [
      'A validated economic-risk model for GBV adopted by county GBV coordination',
      'A published cost-of-GBV evidence base used in budget and policy advocacy',
    ],
    legal: [LAW.gbvpol, LAW.const, LAW.kdpa],
    partners: [
      ['Kenya National Bureau of Statistics / a research institute (e.g. APHRC)', 'Economic and demographic data and survey design'],
      ['UN Women Kenya', 'Femicide evidence base and policy reach'],
      ['County GBV technical working groups', 'Field access and uptake of the risk model'],
    ],
    resources: [
      { t: 'Economic Drivers of Femicide in Kenya — Dependency, Poverty and Transactionality', u: 'https://africa.unwomen.org/sites/default/files/2026-05/technical_brief-economic_drivers_dependency_poverty_and_transactionality-web_1.pdf', k: 'research', s: 'UN Women Kenya, 2026', w: 'Directly links financial dependency and economic control to femicide risk.' },
      { t: 'Intimate Partner Femicide (IPF) in Kenya', u: 'https://africa.unwomen.org/sites/default/files/2026-05/technical_brief-intimate_partner_femicide_in_kenya-web.pdf', k: 'research', s: 'UN Women Kenya, 2026', w: 'Names financial strain as a factor heightening IPF risk for women 18–34.' },
      { t: 'Thematic Analysis on Addressing Femicide in Kenya (12-brief series)', u: 'https://africa.unwomen.org/en/digital-library/publications/2026/05/briefs-thematic-analysis-on-addressing-femicide-in-kenya', k: 'report', s: 'UN Women Kenya, 2026', w: 'The full socio-economic evidence base a proposal can cite.' },
      { t: 'Economic Toll of GBV: Kenya Loses Sh41 Billion Annually', u: 'https://beta.nation.co.ke/kenya/news/gender/economic-toll-of-gbv-kenya-loses-sh41-billion-annually-taskforce-finds-5085996', k: 'article', s: 'Nation / GBV Taskforce & KU WEE Hub, 2025', w: 'Quantifies the national cost of GBV — a powerful cost-of-inaction hook.' },
      { t: 'Counting the Cost: A Decade of Femicide in Kenya (2016–2025)', u: 'https://odipodev.com/odipodev/wp-content/uploads/2026/02/FEMICIDE-2025-Report-7.pdf', k: 'data', s: 'Odipo Dev, Africa Uncensored & Africa Data Hub, 2026', w: 'The usable decade-long femicide dataset that also documents the data gap.' },
    ],
    funderNotes: 'Fits economic-justice and women’s-economic-empowerment funders (Gates, Hewlett, UN Women, World Bank/SIDA GBV programmes) and data-for-development donors. Lead with the Sh41bn cost figure and the documented data gap to justify a new evidence-and-measurement project.',
  },

  p3: {
    estBudget: 'KES 8–14M over 12–18 months (~USD 60k–105k). Main lines: trauma-informed interviewing and counsellor time, anonymisation and secure data handling, analysis, design brief.',
    description: 'A large share of men who kill or abuse women grew up watching their mothers be beaten; the peer-reviewed evidence from Nairobi and globally shows men who witnessed inter-parental violence as boys carry markedly higher odds of perpetrating it themselves. This link is under-documented in Kenya and almost never used for early intervention. This project collects testimony to build a trauma map that tells prevention programmes where and when to reach boys before the pattern sets.',
    objectives: [
      'Document the childhood-exposure histories of men in perpetrator and rehabilitation programmes.',
      'Build a trauma map identifying the ages, settings and signals where intergenerational transmission can be interrupted.',
      'Translate findings into design guidance for school, family and community prevention programmes.',
    ],
    activities: [
      'Oral-history interviews with men in perpetrator-intervention programmes (with consent and trauma-informed protocols)',
      'Thematic analysis to map exposure pathways and intervention windows',
      'Co-design workshops with prevention practitioners to turn the map into programme guidance',
      'Publish the trauma map and an early-intervention design brief',
    ],
    outcomes: [
      'A Kenyan evidence base on intergenerational transmission of violence',
      'Early-intervention design guidance adopted by prevention programmes',
    ],
    legal: [LAW.pdva, LAW.children, LAW.kdpa],
    partners: [
      ['A perpetrator-intervention / counselling provider', 'Access to participants and trauma-informed facilitation'],
      ['A child-protection NGO', 'Safeguarding and referral pathways'],
      ['A research / public-health institute', 'Ethics, method and analysis'],
    ],
    resources: [
      { t: 'Experiences and Perpetration of Recent IPV in an Informal Settlement in Nairobi', u: 'https://research.lstmed.ac.uk/en/publications/experiences-and-perpetration-of-recent-intimate-partner-violence--6/', k: 'research', s: 'J. Interpersonal Violence (Ringwald et al.), 2022', w: 'Kenya study: men who witnessed inter-parental violence are more likely to perpetrate.' },
      { t: 'Witnessing Inter-Parental Violence and the Perpetration of IPV', u: 'https://doaj.org/article/bfbccd066e824c74a7fbbfe08b2d5e2e', k: 'research', s: 'BMC Public Health (Islam et al.), 2017', w: 'Over 3× odds of perpetration among men who witnessed their fathers’ abuse.' },
      { t: 'Witnessing Domestic Violence: Effects into the Next Generation', u: 'https://repository.upenn.edu/entities/publication/90b37f08-01a1-46de-b146-9ca88b46b556/full', k: 'research', s: 'University of Pennsylvania (Forke), 2017', w: 'Effects of boyhood exposure carry into the next generation.' },
      { t: 'Violence Against Women (fact sheet)', u: 'https://www.who.int/news-room/fact-sheets/detail/violence-against-women', k: 'article', s: 'World Health Organization, 2026', w: 'Establishes childhood exposure as a recognised risk factor for perpetration.' },
      { t: 'Protection Against Domestic Violence Act, 2015', u: 'https://new.kenyalaw.org/akn/ke/act/2015/2', k: 'law/policy', s: 'Laws of Kenya, 2015', w: 'Its definition covers exposing a child to domestic violence — anchors the work legally.' },
    ],
    funderNotes: 'Strong fit for child-protection, prevention and public-health funders (Oak Foundation, UNICEF, WHO/SVRI, Wellspring) and male-engagement programmes. Frame as breaking the cycle early, pairing the Nairobi and global peer-reviewed evidence with Kenya’s own legal mandate on children exposed to violence.',
  },

  p4: {
    estBudget: 'KES 20–35M over 18–24 months (~USD 150k–270k). Main lines: creator production fund, training, paid distribution, independent attitude measurement.',
    description: 'The misogyny pipeline wins because it is entertaining and algorithmically amplified; most counter-content is preachy, NGO-branded and ignored. This project funds a content lab that recruits Kenyan male creators to make genuinely compelling healthy-masculinity content — in Sheng, in the formats young men already watch — and measures whether it shifts attitudes. The evidence that structured male-engagement content can change norms is strong; the gap is Kenyan, creator-led delivery at scale.',
    objectives: [
      'Recruit and support ~20 Kenyan male creators to produce healthy-masculinity content in local languages and native formats.',
      'Distribute at scale on the platforms where the manosphere operates and A/B test what shifts attitudes.',
      'Build a reusable playbook and creator network for norm-change media.',
    ],
    activities: [
      'Creator recruitment, training and a content-production fund',
      'Content production in Sheng / native short-form formats',
      'Paid and organic distribution with engagement and attitude measurement',
      'Publish a creator playbook and evaluation',
    ],
    outcomes: [
      'A measurable shift in violence-supportive attitudes among reached audiences',
      'A Kenyan creator network and open playbook for counter-narrative media',
    ],
    legal: [LAW.const, LAW.maputo, LAW.gbvpol],
    partners: [
      ['A Kenyan youth-media house (e.g. Shujaaz-style)', 'Creative production and reach among young men'],
      ['Equimundo / MenEngage-aligned partner', 'Evidence-based male-engagement curriculum'],
      ['An evaluation partner', 'Attitude measurement and A/B testing'],
    ],
    resources: [
      { t: 'Program H: A Review of the Evidence (engaging young men)', u: 'https://www.equimundo.org/wp-content/uploads/2021/11/Program-H-Eva.-Report-2.-September-2021.pdf', k: 'research', s: 'Equimundo, 2021', w: 'Evidence that structured engagement of young men shifts inequitable norms.' },
      { t: 'Engaging the manosphere to prevent technology-facilitated GBV', u: 'https://www.svri.org/engaging-manosphere-prevent-tfgbv/', k: 'article', s: 'SVRI / UN Women, 2025', w: 'Names positive role models and counter-content as prevention strategies.' },
      { t: 'The Manosphere unmasked', u: 'https://www.ofcom.org.uk/online-safety/protecting-children/the-manosphere-unmasked', k: 'research', s: 'Ofcom (UK), 2025', w: 'Regulator research on how boys engage manosphere content — scale and risk.' },
      { t: 'What young Kenyan men say when no one is watching', u: 'https://africanarguments.org/?p=48158', k: 'article', s: 'African Arguments (Shujaaz/Sema na Me), 2026', w: 'Localises the need and shows Kenyan creative-media precedent.' },
      { t: 'Final Evaluation: “A Real Man Is…” (Kenya & Zambia)', u: 'https://untf.unwomen.org/en/learning-hub/evaluations/2019/02/final-evaluation-a-real-man-is-kenya-zambia', k: 'case study', s: 'UN Trust Fund to End VAW, 2019', w: 'A funded, evaluated Kenyan precedent for content-led norm change.' },
    ],
    funderNotes: 'Strong fit for information-integrity / tech funders (Luminate, Ford, Omidyar) and youth/media funders (Fondation Botnar). Pair manosphere-risk evidence (Ofcom, SVRI) with Kenyan delivery track record (Shujaaz, “A Real Man Is…”); the UN Trust Fund to End VAW is a natural home.',
  },

  p5: {
    estBudget: 'KES 18–30M over 24 months (~USD 140k–230k). Main lines: curriculum co-design, teacher training, delivery across 20 schools, pre/post evaluation.',
    description: 'By the time most programmes reach men, attitudes are already formed — the window to shape them is roughly ages 10–16. This project delivers a school-based programme, co-designed with girls, teaching boys consent, emotional regulation, recognition of online misogyny and bystander action, anchored to Kenya’s CBC Life-Skills strand so schools can adopt it. The “what works” evidence — including a published Nairobi-schools study — supports both the age band and the method.',
    objectives: [
      'Co-design an age-appropriate boys’ curriculum (10–16) with girls, teachers and the CBC framework.',
      'Deliver and evaluate it across 20 schools in 5 counties.',
      'Package it for KICD/TSC uptake so it can scale within the school system.',
    ],
    activities: [
      'Curriculum co-design and teacher training',
      'Delivery across 20 schools with pre/post attitude measurement',
      'Girls’ advisory panels and bystander-action components',
      'Alignment to CBC Life-Skills strands and a KICD uptake brief',
    ],
    outcomes: [
      'Improved consent knowledge, empathy and bystander behaviour among participating boys',
      'A CBC-aligned curriculum ready for system adoption',
    ],
    legal: [LAW.children, LAW.soa, LAW.gbvpol, 'Basic Education Act, 2013 & the Competency-Based Curriculum — the entry point for school-based Life-Skills content.'],
    partners: [
      ['Kenya Institute of Curriculum Development (KICD)', 'Curriculum alignment and endorsement'],
      ['A schools-based GBV-prevention NGO (e.g. No Means No-style)', 'Delivery model and facilitators'],
      ['A girls’-rights organisation', 'Co-design and safeguarding'],
    ],
    resources: [
      { t: 'In Kenya, program changes male attitudes about sexual violence', u: 'https://stanfordchildrens.org/en/about/news/releases/2015/in-kenya-program-changes-male-attitudes-about-sexual-violence-study-finds.html', k: 'case study', s: 'Stanford Children’s Health, 2015', w: 'Nairobi-schools boys’ curriculum improved attitudes and bystander action.' },
      { t: 'RESPECT women: A Framework for Policymakers', u: 'https://wkc.who.int/resources/publications/i/item/WHORHR1819', k: 'toolkit', s: 'World Health Organization, 2020', w: 'The seven-strategy prevention framework the curriculum operationalises.' },
      { t: 'Interventions to prevent VAWG: systematic review updating RESPECT', u: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11816861', k: 'research', s: 'BMJ Public Health, 2025', w: 'Confirms school- and norms-based adolescent prevention as evidence-backed.' },
      { t: 'Changing gender norms: RCT in Haryana (Taaron ki Toli)', u: 'https://www.alignplatform.org/resources/changing-gender-norms-evidence-randomised-control-trial-haryana', k: 'research', s: 'Breakthrough / J-PAL, 2018', w: 'A 314-school RCT shifting adolescents’ gender attitudes — esp. boys.' },
      { t: 'CBC Junior School Social Studies, Grade 7 (design)', u: 'https://kicd.ac.ke/wp-content/uploads/2024/06/Social-Studies-Grade-7-Formatted-April-2024.pdf', k: 'law/policy', s: 'KICD, 2022/rev. 2024', w: 'Shows where the 10–16 content anchors for school uptake.' },
    ],
    funderNotes: 'Fits education and child-protection funders (Echidna Giving, Porticus, Oak, UNICEF) and GBV-prevention funders (UN Trust Fund to End VAW). Lead with the Kenyan evidence (No Means No) plus the RESPECT base, and show system-readiness by mapping onto KICD/CBC strands.',
  },

  p6: {
    estBudget: 'KES 10–18M over 18 months (~USD 75k–140k). Main lines: USSD/shortcode build and telecom fees, counsellor roster and clinical supervision, anonymised monitoring.',
    description: 'No safe space exists for a Kenyan man to say “I am losing control” — every crisis line is built for victims. This project stands up an anonymous USSD line for men in rage, impulse-control or suicidal crisis, routing them to perpetrator-prevention counsellors. The logic is dual-benefit: crisis lines are evidence-informed for suicide risk, and impulse-control interventions (e.g. CBT “slow your thinking”) measurably cut violent behaviour — so reaching men at the moment of crisis prevents harm to them and to women.',
    objectives: [
      'Launch an anonymous, low-barrier USSD crisis line for men at risk of violence or self-harm.',
      'Build a trained counsellor roster and a safe referral / de-escalation protocol.',
      'Measure reach, de-escalation and onward referral while protecting anonymity.',
    ],
    activities: [
      'USSD build and telecom/shortcode setup',
      'Counsellor recruitment, training and supervision (perpetrator-prevention + suicide-safe)',
      'De-escalation and referral protocol with survivor-safety safeguards',
      'Promotion where young men are, plus anonymised monitoring',
    ],
    outcomes: [
      'Men in crisis reached and safely de-escalated / referred before violence',
      'A replicable male-crisis-line model with safety and anonymity standards',
    ],
    legal: [LAW.kdpa, 'Mental Health (Amendment) Act, 2022 — frames crisis support and referral.', LAW.pdva],
    partners: [
      ['A telco / USSD aggregator', 'Shortcode and channel'],
      ['A mental-health / counselling provider', 'Counsellor roster, clinical supervision'],
      ['A perpetrator-intervention provider', 'Violence-prevention referral pathway'],
    ],
    resources: [
      { t: 'Crisis lines (What Works for Health)', u: 'https://www.countyhealthrankings.org/strategies-and-solutions/what-works-for-health/strategies/crisis-lines', k: 'research', s: 'County Health Rankings (Wisconsin/RWJF), 2020', w: 'Rates crisis lines as evidence-informed for reducing suicide risk.' },
      { t: 'Intervention lowers violent-crime arrests for at-risk young men (Becoming a Man)', u: 'https://news.uchicago.edu/story/intervention-dramatically-lowers-violent-crime-arrests-risk-teens', k: 'case study', s: 'University of Chicago Crime Lab, 2016', w: 'CBT “slow your thinking” cut violent-crime arrests ~50%.' },
      { t: 'Masculine norms and the mental health of African men', u: 'https://www.mentalhealthdataprizeafrica.aphrc.org/repository/paper/34237/masculine-norms-and-mental-health-of-african-men-what-can-psychology-do', k: 'research', s: 'Heliyon (APHRC repository)', w: 'Explains why African men avoid help-seeking — justifies an anonymous channel.' },
      { t: 'Confronting the stigma around men’s mental health in Kenya', u: 'https://citizen.digital/article/confronting-the-stigma-around-mens-mental-health-in-kenya-n360473', k: 'article', s: 'Citizen Digital, 2025', w: 'Localises the help-seeking barrier (“mwanaume ni kujikaza”).' },
    ],
    funderNotes: 'Fits global mental-health and innovation funders (Grand Challenges Canada, Wellcome, Fondation Botnar, Comic Relief) and perpetrator-prevention GBV funders (UN Trust Fund to End VAW, SVRI). Frame as dual-benefit — suicide prevention plus primary violence prevention — and lean on the USSD channel’s low cost and anonymity.',
  },

  p7: {
    estBudget: 'KES 15–28M over 24 months (~USD 115k–215k). Main lines: recruitment and training of community networks, community dialogues, referral system, evaluation.',
    description: 'Most prevention talks at men through campaigns; Kenya already has a tradition of community accountability — the baraza — that has never been activated for GBV. This project trains community men (elders, coaches, religious leaders, boda boda riders) as first-response mediators and early-warning nodes. The SASA! community-mobilisation model produced a 52% drop in past-year physical IPV, and faith-leader engagement is shown to shift men’s attitudes — so trusted local messengers are the multiplier.',
    objectives: [
      'Recruit and train networks of respected community men as GBV first-responders and early-warning nodes.',
      'Establish safe referral links to formal services and survivor support.',
      'Measure change in community attitudes and in early identification of at-risk situations.',
    ],
    activities: [
      'Mapping and recruitment of trusted community men (elders, coaches, clergy, boda boda)',
      'Training on bystander action, safe referral and do-no-harm',
      'Community dialogues and early-warning / referral system',
      'Attitude and referral measurement against a SASA!-style benchmark',
    ],
    outcomes: [
      'Reduced community acceptance of partner violence',
      'Earlier identification and referral of at-risk situations',
    ],
    legal: [LAW.pdva, LAW.gbvpol, LAW.const],
    partners: [
      ['Raising Voices / a SASA!-trained partner', 'Community-mobilisation method and toolkit'],
      ['Faith networks / Inter-Religious Council of Kenya', 'Trusted-messenger reach'],
      ['County GBV committees', 'Referral linkage to formal services'],
    ],
    resources: [
      { t: 'SASA! Study (community mobilisation to prevent VAW) — protocol', u: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3503643', k: 'research', s: 'Trials (Raising Voices/LSHTM), 2012', w: 'The landmark cluster-RCT design this network adapts.' },
      { t: 'Community intervention reduces violence against women', u: 'https://www.lshtm.ac.uk/newsevents/news/2014/community_intervention_reduce_violence.html', k: 'data', s: 'LSHTM, 2014', w: 'SASA! produced a 52% drop in past-year physical IPV — the impact anchor.' },
      { t: 'SASA! Activist Kit', u: 'https://www.girlsnotbrides.org/learning-resources/resource-centre/sasa-activist-kit/', k: 'toolkit', s: 'Raising Voices, 2016', w: 'Ready-made toolkit showing the method is packaged and replicable.' },
      { t: 'Faith-based organizations’ role in addressing GBV', u: 'https://www.prb.org/news/faith-based-organizations-have-a-large-role-to-play-in-addressing-gender-based-violence/', k: 'article', s: 'Population Reference Bureau, 2017', w: 'Case for engaging religious and faith leaders as trusted GBV actors.' },
      { t: 'Religion plays a key role in limiting SGBV', u: 'https://www.tearfund.org/stories/media/press-releases/research-shows-religion-plays-key-role-in-limiting-sexual-and-gender-based-violence', k: 'research', s: 'Tearfund, 2017', w: 'Men engaged in a faith group were 2× as likely to reject partner violence.' },
    ],
    funderNotes: 'Fits large GBV-prevention funders (UN Trust Fund to End VAW, EU/UN Spotlight Initiative, Wellspring) and faith-engaged funders (GHR Foundation, Tearfund). Position as a contextualised SASA!-style model with a proven 52% IPV-reduction benchmark; highlight faith/elder engagement as the trusted-messenger multiplier.',
  },

  p8: {
    estBudget: 'KES 14–24M over 18–24 months (~USD 105k–185k). Main lines: curriculum adaptation, facilitator training, mentoring cohorts, evaluation.',
    description: 'The most powerful masculinity intervention may be a present, non-violent father. The global and African evidence (State of the World’s / Africa’s Fathers) shows engaging men as equitable caregivers is a proven lever for violence prevention, and a longitudinal study finds fathering a daughter measurably shifts men away from sexist attitudes. This project adapts a scaled East African fatherhood model (REAL Fathers) to Kenya, using fathers as a primary-prevention entry point whose returns reach daughters, sons and partners.',
    objectives: [
      'Adapt an evidence-based fatherhood / caregiving curriculum (e.g. Program P / REAL Fathers) to Kenya.',
      'Deliver mentoring to young fathers to reduce IPV and harsh discipline and model equitable caregiving.',
      'Measure change in fathers’ attitudes and behaviour and in household violence.',
    ],
    activities: [
      'Curriculum adaptation and facilitator training',
      'Community-based mentoring cohorts for young fathers',
      'Father–daughter / father–family engagement activities',
      'Evaluation of attitude and behaviour change',
    ],
    outcomes: [
      'Reduced intimate-partner violence and harsh child punishment among participating fathers',
      'A Kenya-adapted fatherhood model ready to scale',
    ],
    legal: [LAW.children, LAW.pdva, LAW.const],
    partners: [
      ['Equimundo / MenCare-aligned partner', 'Program P / fatherhood curriculum'],
      ['A Kenyan community / faith organisation', 'Delivery and reach to young fathers'],
      ['An evaluation partner', 'Attitude and behaviour measurement'],
    ],
    resources: [
      { t: 'State of the World’s Fathers 2023', u: 'https://www.equimundo.org/resources/state-of-the-worlds-fathers-2023/', k: 'research', s: 'Equimundo / MenCare, 2023', w: 'Global evidence that engaging men as caregivers prevents violence.' },
      { t: 'State of Africa’s Fathers 2015', u: 'https://resourcecentre.savethechildren.net/library/state-africas-fathers-2015', k: 'research', s: 'MenCare / Sonke / Promundo, 2015', w: 'Africa-specific data to ground the fatherhood rationale.' },
      { t: 'REAL Fathers Initiative (Uganda)', u: 'https://www.irh.org/resource-library/real-fathers-qualitative-brief/', k: 'case study', s: 'Georgetown IRH & Save the Children, 2016–18', w: 'A scaled East African model reducing IPV and harsh punishment — transferable.' },
      { t: 'Program P: Engaging Men in Fatherhood, Caregiving & MCH', u: 'https://www.equimundo.org/resources/program-p-a-manual-for-engaging-men-in-fatherhood-caregiving-and-maternal-and-child-health/', k: 'toolkit', s: 'Equimundo / Promundo, 2013', w: 'A field-tested curriculum to adapt — delivery doesn’t start from zero.' },
      { t: 'Fathers less likely to hold sexist attitudes if they have a girl', u: 'https://www.lse.ac.uk/news/latest-news-from-lse/fathers-less-likely-to-hold-sexist-attitudes-if-they-have-a-girl', k: 'research', s: 'LSE / Oxford Economic Papers, 2018', w: 'Longitudinal evidence underpinning the “fathers as intervention” theory of change.' },
    ],
    funderNotes: 'Strong fit for gender-equality and child-protection funders that back male-engagement work (Oak, Wellspring, Comic Relief, Global Fund for Women, MenEngage-aligned donors). Frame fathers as a primary-prevention entry point whose returns accrue to daughters, sons and partners; cite REAL Fathers for feasibility at scale.',
  },

  p9: {
    estBudget: 'KES 18–30M over 24 months (~USD 140k–230k). Main lines: accreditation and programme design, facilitator training, partner-safety protocol, delivery, independent evaluation.',
    description: 'Kenya’s GBV response is almost entirely survivor-facing and punitive; there is no rehabilitation pathway for perpetrators. KaaRada is a structured, accountability-first perpetrator-intervention programme. The current umbrella evidence and the landmark Project Mirabal study (injury of partners fell from 61% to 2% among completers) show well-run programmes can reduce reoffending and harm to children — and the Rwandan Indashyikirwa RCT shows it works in an African context — provided survivor safety and accreditation come first.',
    objectives: [
      'Stand up an accredited perpetrator-intervention programme with survivor-safety at its centre.',
      'Deliver a structured behaviour-change pathway with partner-contact and risk-management protocols.',
      'Evaluate reoffending, partner safety and completion against recognised standards.',
    ],
    activities: [
      'Programme design to Respect-style accreditation standards',
      'Facilitator training and a partner-safety / risk-management protocol',
      'Delivery of structured group behaviour-change cohorts',
      'Independent evaluation of safety and reoffending outcomes',
    ],
    outcomes: [
      'Reduced reoffending and reduced harm to partners and children',
      'An accredited, survivor-safe perpetrator-intervention model for Kenya',
    ],
    legal: [LAW.soa, LAW.pdva, 'Probation and Aftercare / court-mandated referral pathways — for diversion and sentencing linkage.', LAW.kdpa],
    partners: [
      ['Respect UK / an accrediting body', 'Standards and quality assurance'],
      ['A survivor-support organisation', 'Partner-contact and safety oversight'],
      ['The Judiciary / Probation service', 'Referral and court linkage'],
    ],
    resources: [
      { t: 'Interventions for Perpetrators of IPV: An Umbrella Review', u: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12770810', k: 'research', s: 'Aggressive Behavior (Punzo & Velotti), 2026', w: 'Current synthesis of 41 reviews on which modalities work.' },
      { t: 'Project Mirabal Final Report (Steps Towards Change)', u: 'https://www.respect.org.uk/resources/27-domestic-violence-perpetrator-programmes-steps-towards-change-project-mirabal-final-report', k: 'research', s: 'Kelly & Westmarland, 2015', w: 'Landmark study documenting large reductions in violence among completers.' },
      { t: 'Do perpetrator programmes work? (factsheet)', u: 'https://respectphoneline.org.uk/resources/frontline-workers/factsheets/domestic-abuse-perpetrator-programmes-do-they-work-factsheet-for-frontline-workers/', k: 'article', s: 'Respect UK, 2021', w: 'Concise evidence-and-safety summary incl. accreditation standards.' },
      { t: 'Indashyikirwa couples programme RCT (Rwanda)', u: 'https://gh.bmj.com/content/5/12/e002439', k: 'research', s: 'BMJ Global Health, 2020', w: 'African-context RCT showing a behaviour-change pathway can cut IPV perpetration.' },
      { t: 'RESPECT Women: a framework for action', u: 'https://www.who.int/news/item/19-05-2019-respect-women-preventing-violence-against-women', k: 'toolkit', s: 'WHO / UN Women, 2019', w: 'Locates perpetrator rehabilitation within the endorsed prevention framework.' },
    ],
    funderNotes: 'Suits violence-prevention and justice-reform funders comfortable with offender-focused work (WHO/UN prevention partners, Ford, OSF justice, SVRI grantors). Lead with survivor safety, accreditation standards and the independent Mirabal and Indashyikirwa evidence — rehabilitation-plus-accountability, not a soft alternative to prosecution.',
  },

  p10: {
    estBudget: 'KES 8–15M per year (~USD 60k–115k). Main lines: lead analyst and data pipeline, monthly brief production and design, policy engagement.',
    description: 'Kenya has rich raw femicide data (trackers, court records, the FemSaidia database) and a live policy window — the national GBV/femicide taskforce reporting to the President — but no recurring, decision-ready evidence layer between the two. The SaInt Intelligence Brief is a monthly, standards-based brief that turns tracked incidents and index signals into the specific, timely evidence policymakers need to act. The UNODC/UN Women femicide-data methodology and the Latin American observatory model give it a proven blueprint.',
    objectives: [
      'Produce a monthly, standards-aligned femicide/GBV intelligence brief for Kenyan policymakers.',
      'Build a sustainable data-to-policy pipeline from trackers, courts and the FemSaidia index.',
      'Measure uptake — citations, hearings, policy and budget decisions informed.',
    ],
    activities: [
      'Standardise data intake (FemSaidia DB, trackers, court records) to UNODC/UN Women definitions',
      'Monthly analysis and brief production for a named policymaker audience',
      'Distribution and engagement with the GBV taskforce / Parliament / counties',
      'Track policy uptake and iterate',
    ],
    outcomes: [
      'A recurring, cited evidence product used in Kenyan GBV policymaking',
      'A measurable data-to-policy pipeline and uptake record',
    ],
    legal: [LAW.gbvpol, LAW.kdpa, LAW.const],
    partners: [
      ['UN Women Kenya / UNODC', 'Femicide-data standards and policy reach'],
      ['Africa Data Hub / Odipo Dev / Africa Uncensored', 'Data pipeline and analysis'],
      ['The national GBV / femicide taskforce', 'Policy audience and uptake'],
    ],
    resources: [
      { t: 'Femicides in 2024: Global Estimates (IP/family femicide)', u: 'https://www.unwomen.org/en/digital-library/publications/2025/11/femicides-in-2024-global-estimates-of-intimate-partner-family-member-femicides', k: 'data', s: 'UNODC & UN Women, 2025', w: 'Authoritative global dataset to localise and benchmark against.' },
      { t: 'Improving data to improve responses to femicide', u: 'https://www.unwomen.org/en/digital-library/publications/2022/11/gender-related-killings-of-women-and-girls-improving-data-to-improve-responses-to-femicide-feminicide', k: 'data', s: 'UNODC & UN Women, 2022', w: 'The UN methodology paper — a credible technical blueprint to cite.' },
      { t: 'Counting the Cost: A Decade of Femicide in Kenya', u: 'https://africauncensored.online/blog/2026/02/11/counting-the-cost-a-decade-of-femicide-in-kenya/', k: 'case study', s: 'Africa Uncensored / Odipo Dev / Africa Data Hub, 2026', w: 'Proof that national data-to-narrative work is feasible and resonant.' },
      { t: 'How data journalists uncover femicide patterns in Kenya', u: 'https://ijnet.org/en/story/how-data-journalists-are-uncovering-scale-and-patterns-femicide-kenya', k: 'article', s: 'IJNet / ICFJ, 2025', w: 'Evidences demand for exactly the briefs SaInt would produce.' },
      { t: 'Measuring femicide: the Latin American observatory model', u: 'https://oig.cepal.org/en/infographics/measuring-femicide-challenges-and-efforts-bolster-process-latin-america-and-caribbean', k: 'data', s: 'ECLAC Gender Equality Observatory, 2019', w: 'A proven observatory model — a transferable template for Kenya.' },
    ],
    funderNotes: 'Fits data, open-government and women’s-rights funders (Hewlett, Luminate, Open Society, Wellcome data-for-health, UN Women programme funds). Sell SaInt as the evidence layer that makes Kenya’s femicide-taskforce reforms accountable and measurable — recurring monthly briefs as low-cost, high-leverage infrastructure.',
  },
}

// ── Word proposal template generator (individual / collective) ────────────────
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) }
export function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
function g(t) { return '<p class="g"><i>' + esc(t) + '</i></p>' }
function blank(n) { let s = ''; for (let i = 0; i < (n || 1); i++) s += '<p class="f"> </p>'; return s }
function table(head, rows) {
  let h = '<tr>' + head.map(x => '<th>' + esc(x) + '</th>').join('') + '</tr>'
  let b = rows.map(r => '<tr>' + r.map(c => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('')
  return '<table>' + h + b + '</table>'
}

export function buildDoc(p, kit, mode) {
  const C = mode === 'collective'
  let n = 0; const H = t => { n++; return '<h2>' + n + '. ' + esc(t) + '</h2>' }
  let d = ''
  d += '<p class="kick">FemSaidia Kenya · Halafu? proposal kit · ' + (C ? 'Collective / consortium template' : 'Individual organisation template') + '</p>'
  d += '<h1>' + esc(p.title) + '</h1>'
  d += '<p class="sub">' + esc(p.tagline) + ' — ' + esc(p.lane) + ' lane</p>'
  d += g('How to use: grey italic text is guidance — replace or delete it. Pre-filled text comes from the FemSaidia SaInt portfolio; rewrite it in your own voice and check every figure against the sources in the References section. If the funder has its own form, copy sections across.')

  d += '<h2>Cover sheet</h2>'
  const cover = [['Project title', p.title], ['Lead applicant (organisation)', ''], ['Registration no. / legal status', ''], ['Contact person, email, phone', '']]
  if (C) cover.push(['Co-applicants / consortium members', ''])
  cover.push(['Thematic lane', p.lane], ['Alignment frameworks', (p.frameworks || []).join(', ')], ['Duration', ''], ['Amount requested', ''], ['Total project cost / co-funding', ''], ['Funder & call reference', ''])
  d += table(['Item', 'Details'], cover)

  d += H('Executive summary')
  d += g('Half a page. Who you are' + (C ? ' (as a consortium)' : '') + ', the problem, what you will do, for whom, the change you expect and the amount requested. Write this last.')
  d += '<p>' + esc(kit.description) + '</p>' + blank(1)

  d += H(C ? 'The consortium' : 'About the applicant')
  if (C) {
    d += g('Introduce the lead applicant and each member. Funders want to see why this group, and why together — what each partner brings that others don’t.')
    d += table(['Organisation', 'Type / registration', 'Base (county)', 'Role in this project', 'Relevant track record'], [['Lead: ', '', '', '', ''], ['Member: ', '', '', '', ''], ['Member: ', '', '', '', '']])
    d += '<h3>Why this partnership</h3>' + g('How the members complement each other (e.g. community presence + clinical expertise + research). History of working together, if any.')
    d += '<h3>Partners identified in the portfolio</h3><ul>' + (kit.partners || []).map(x => '<li><b>' + esc(x[0]) + '</b> — ' + esc(x[1]) + '</li>').join('') + '</ul>' + g('Confirm each partner’s interest and role directly before naming them in a submission.')
  } else {
    d += g('Mission, year founded, governance, staff/volunteers, geographic presence, 2–3 relevant past projects with results, and your relationship with the affected community.')
    d += blank(2)
    d += '<h3>Partners and allies you may work with</h3><ul>' + (kit.partners || []).map(x => '<li><b>' + esc(x[0]) + '</b> — ' + esc(x[1]) + '</li>').join('') + '</ul>' + g('Name only partners who have agreed. Attach letters of support where available.')
  }

  d += H('Problem statement and evidence')
  d += g('Describe the problem, who is affected, why now, and what is missing. Cite the sources in the References section.')
  d += '<p><b>The gap:</b> ' + esc(p.problem || '') + '</p>'
  d += '<p><b>The intervention:</b> ' + esc(p.what || '') + '</p>' + blank(1)

  d += H('Goal, objectives and theory of change')
  d += '<p><b>Overall goal:</b></p>' + g('One sentence on the long-term change you contribute to.') + blank(1)
  d += '<p><b>Specific objectives:</b></p><ol>' + (kit.objectives || []).map(o => '<li>' + esc(o) + '</li>').join('') + '</ol>'
  d += '<p><b>Theory of change:</b></p>' + g('IF we do [activities], THEN [outputs], WHICH LEADS TO [outcomes], BECAUSE [assumptions]. State the key assumptions.') + blank(1)

  d += H('Activities and workplan')
  d += g('List activities under each objective and mark the quarter(s) each happens in.' + (C ? ' Add the responsible partner.' : ''))
  const qs = ['Q1', 'Q2', 'Q3', 'Q4']
  const whead = ['#', 'Activity'].concat(C ? ['Lead partner'] : []).concat(qs)
  d += table(whead, (kit.activities || []).map((a, i) => [String(i + 1), a].concat(C ? [''] : []).concat(qs.map(() => ''))))

  if (C) {
    d += H('Division of labour')
    d += g('Who leads (L) and who supports (S) each workstream. Every activity needs exactly one lead.')
    d += table(['Workstream / activity', 'Lead applicant', 'Member 2', 'Member 3'], (kit.activities || []).map(a => [a, '', '', '']))
    d += H('Governance and decision-making')
    d += g('Describe the steering committee, how decisions are made, how funds flow from lead to members, internal reporting deadlines, and how disputes are resolved. Reference the signed MoU / consortium agreement (attach as annex).')
    d += table(['Mechanism', 'Details'], [['Steering committee & frequency', ''], ['Decision rule', ''], ['Fund flow & disbursement', ''], ['Internal reporting deadlines', ''], ['Conflict resolution', ''], ['Data ownership & sharing between partners', '']])
  }

  d += H('Expected results and indicators (logframe)')
  d += g('One row per outcome. Indicators should be measurable; give a baseline and a target, and say how you’ll verify.')
  d += table(['Result', 'Indicator', 'Baseline', 'Target', 'Means of verification'], (kit.outcomes || []).map(o => [o, '', '', '', '']).concat([['Output: ', '', '', '', '']]))

  d += H('Survivor safety, consent and safeguarding')
  d += g('How affected people shape the work; how you obtain informed consent for testimony, photos and data; how you protect survivors, witnesses and staff from retaliation; and how personal data is stored and shared under Kenya’s Data Protection Act 2019. For any work touching perpetrators, describe your survivor-safety-first protocol. Attach your safeguarding and data-protection policies.')
  d += table(['Area', 'Our approach'], [['Survivor-centred design & feedback', ''], ['Informed consent for testimony / data', ''], ['Security of survivors / witnesses / staff', ''], ['Data protection (Data Protection Act 2019)', ''], ['Child safeguarding (where minors are involved)', ''], ['Complaints / grievance mechanism', '']])

  d += H('Legal and policy framework')
  d += g('Show how the project uses or aligns with existing law and policy. Pre-filled hooks below — keep those that apply.')
  d += '<ul>' + (kit.legal || []).map(l => '<li>' + esc(l) + '</li>').join('') + '</ul>'

  d += H('Risks and mitigation')
  d += table(['Risk', 'Likelihood (L/M/H)', 'Impact (L/M/H)', 'Mitigation'], [['Backlash or threats against staff / participants', '', '', ''], ['Re-traumatisation of survivors', '', '', ''], ['Data loss or breach of sensitive testimony', '', '', ''], ['Political or funding changes alter the timeline', '', '', '']].concat(C ? [['Partner withdraws or under-delivers', '', '', '']] : []))

  d += H('Monitoring, evaluation and learning')
  d += g('How you will track progress (data, frequency, who), how participants take part in reviewing results, and how you’ll share learning' + (C ? ' across the consortium' : '') + '. Mention any mid-term or final review.') + blank(1)

  d += H('Budget summary')
  d += g('Build a detailed budget in the funder’s format; this summary shows the main lines. Many funders cap indirect/admin costs at 7–15%.' + (kit.estBudget ? ' Indicative scale from the portfolio: ' + kit.estBudget : ''))
  const bl = ['Personnel (coordination, facilitators, counsellors)', 'Training & community activities', 'Content / fieldwork / research', 'Technology & tools', 'Survivor support & safeguarding', 'Monitoring, evaluation & learning', 'Communications & advocacy', 'Indirect / administrative costs', 'TOTAL']
  if (C) d += table(['Budget line', 'Lead applicant', 'Member 2', 'Member 3', 'Total (KES)'], bl.map(r => [r, '', '', '', '']))
  else d += table(['Budget line', 'Year 1 (KES)', 'Year 2 (KES)', 'Total (KES)', 'Co-funding'], bl.map(r => [r, '', '', '', '']))

  d += H('Sustainability and exit')
  d += g('What continues after the grant: skills, structures, data, relationships, follow-on funding. Who owns the data and evidence afterwards?') + blank(1)

  d += H('Annexes checklist')
  let ann = ['Certificate of registration', 'KRA PIN / tax compliance', 'Latest audited accounts', 'Board / governance list', 'Safeguarding policy', 'Data protection policy', 'CVs of key staff', 'Letters of support from communities or partners']
  if (C) ann = ann.concat(['Signed consortium agreement / MoU', 'Letters of commitment from each member', 'Each member’s registration documents'])
  d += '<ul>' + ann.map(a => '<li>☐ ' + esc(a) + '</li>').join('') + '</ul>'

  d += H('References and supporting evidence')
  d += '<ol>' + (kit.resources || []).map(r => '<li>' + esc(r.t) + ' — ' + esc(r.s) + '. <a href="' + esc(r.u) + '">' + esc(r.u) + '</a></li>').join('') + '</ol>'
  d += '<h3>Proposal-writing guides</h3><ul>' + GUIDES.filter(gd => C || !gd.collab).map(gd => '<li>' + esc(gd.t) + ' (' + esc(gd.s) + '): <a href="' + esc(gd.u) + '">' + esc(gd.u) + '</a></li>').join('') + '</ul>'
  d += '<p class="g">Prepared from the FemSaidia Kenya Halafu? portfolio, ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '. Figures are planning estimates, not quotes.</p>'

  const style = 'body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1a1a1a;line-height:1.4}' +
    'h1{font-family:Georgia,serif;font-size:20pt;color:#8A1030;margin:4pt 0}' +
    'h2{font-family:Georgia,serif;font-size:14pt;color:#8A1030;border-bottom:1px solid #d8a9b7;padding-bottom:2pt;margin:18pt 0 6pt}' +
    'h3{font-size:11.5pt;color:#b3261e;margin:10pt 0 4pt}' +
    '.kick{font-size:8.5pt;letter-spacing:1px;text-transform:uppercase;color:#b3261e;margin:0}' +
    '.sub{color:#555;margin:0 0 8pt}.g{color:#7a7a7a;font-style:italic;font-size:10pt}.f{color:#999}' +
    'table{border-collapse:collapse;width:100%;margin:6pt 0}' +
    'th,td{border:1px solid #d8a9b7;padding:4pt 6pt;vertical-align:top;font-size:10pt;text-align:left}' +
    'th{background:#f6e6ea;color:#8A1030}'
  return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="utf-8"><title>' + esc(p.title) + ' — proposal template</title>' +
    '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->' +
    '<style>' + style + '</style></head><body>' + d + '</body></html>'
}

export function downloadTemplate(p, kit, mode) {
  const html = '﻿' + buildDoc(p, kit, mode)
  const blob = new Blob([html], { type: 'application/msword' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'Proposal-' + (mode === 'collective' ? 'Consortium' : 'Individual') + '-' + slug(p.title) + '.doc'
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}

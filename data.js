'use strict';
const rep = v => Array(12).fill(v);
const s12 = (...a) => a;
const mk = (name, country, lat, lng, data) => ({ name, country, lat, lng, data });
const bc = (name, from, to, lat, lng, status, hours, note) => ({ name, from, to, lat, lng, status, hours, note });

const RC  = ['#4ade80','#facc15','#fb923c','#f87171'];
const RC2 = ['#22c55e','#eab308','#f97316','#ef4444'];
const MONTHS   = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const MONTHS_F = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const LAYERS = {
  weather:  { name:'Weather',          emoji:'🌤', color:'#7EC8E3', levels:['Excellent','Good','Mixed','Harsh'] },
  safety:   { name:'Safety',           emoji:'🛡', color:'#5B9BD5', levels:['Very Safe','Moderate','Caution','Avoid'] },
  cost:     { name:'Cost',             emoji:'💰', color:'#C8A84B', levels:['Budget','Mid-range','Expensive','Premium'] },
  family:   { name:'Family',           emoji:'👨‍👩‍👧', color:'#B87FC4', levels:['Ideal','Suitable','Limited','Not Recommended'] },
  solo:     { name:'Solo Female',      emoji:'👩', color:'#E87AAF', levels:['Excellent','Good','Take Care','High Risk'] },
  remote:   { name:'Remote Work',      emoji:'💻', color:'#00B4D8', levels:['Excellent','Good','Adequate','Poor'] },
  corrupt:  { name:'Corruption',       emoji:'🏛', color:'#A07840', levels:['Clean','Minor','Moderate','Severe'] },
  health:   { name:'Health Risk',      emoji:'💊', color:'#D9607A', levels:['Low','Moderate','Elevated','High'] },
  crowds:   { name:'Overtourism',      emoji:'👁', color:'#8878C8', levels:['Uncrowded','Busy','Crowded','Saturated'] },
  disaster: { name:'Natural Disaster', emoji:'🌋', color:'#C06E3E', levels:['Low Risk','Some Risk','Moderate','High Risk'] },
  visa:     { name:'Visa',             emoji:'🗂', color:'#6898C0', levels:['Visa Free','Easy','Moderate','Difficult'] },
  lgbtq:    { name:'LGBTQ+',           emoji:'🏳️‍🌈', color:'#D055A8', levels:['Welcoming','Accepted','Hostile','Dangerous'] },
  beaches:  { name:'Public Beaches',   emoji:'🏖', color:'#2EC4B6', levels:['Excellent','Good','Limited','Poor'] },
  vaccines: { name:'Vaccines',         emoji:'💉', color:'#7888D8', levels:['None','Routine','Required','Extensive'] },
};

const DESCS = {
  weather: [
    "Clear skies and comfortable temperatures — ideal for outdoor exploration and long days on the road.",
    "Warm and mostly pleasant with occasional showers. Most activities remain fully accessible.",
    "Variable conditions — heat, humidity, or rain may affect comfort. Check local forecasts.",
    "Monsoon, extreme heat, polar cold, or active hurricane season. Check advisories and pack accordingly."
  ],
  safety: [
    "Low crime, stable government, reliable emergency services. Standard urban awareness applies.",
    "Generally safe with isolated concerns. Petty theft in tourist areas, political demonstrations possible.",
    "Elevated risk in some areas — violent crime, civil unrest, or unstable conditions. Research regions carefully.",
    "Serious safety concerns, armed conflict, or widespread violence. Government travel advisories in effect."
  ],
  cost: [
    "~$40–70/day covers a comfortable bed, good food, and local transport.",
    "~$80–150/day for mid-range travel. Budget options available with some effort.",
    "~$180–260/day. Budget travel is difficult — most prices are elevated.",
    "$300+/day. Among the most expensive destinations on the planet."
  ],
  family: [
    "Excellent infrastructure for families — child-friendly attractions, safe transport, quality accommodation.",
    "Suitable with planning — most destinations are family-friendly with minor limitations.",
    "Limited family facilities. Long journeys, heat, or safety concerns may challenge families.",
    "Not recommended for families with young children — safety risks, limited healthcare, or poor infrastructure."
  ],
  solo: [
    "Consistently rated safe and welcoming for solo women. Minimal awareness required.",
    "Generally safe with normal precautions. Dress codes or cultural norms vary by region.",
    "Significant awareness required — harassment reported, especially in crowded or rural areas.",
    "Significant harassment risk, legal restrictions on dress or movement, or documented danger. Plan carefully."
  ],
  remote: [
    "Fast, reliable internet widely available. Strong digital nomad community. Coworking spaces easily found.",
    "Good connectivity in cities. Rural areas may have gaps. SIM cards affordable and widely available.",
    "Adequate in major cities only. Expect outages, slow speeds, or limited options outside urban areas.",
    "Unreliable internet, frequent power cuts, or government restrictions. Remote work is seriously hampered."
  ],
  corrupt: [
    "Transparent institutions and low corruption. Business and travel interactions are clean.",
    "Minor bureaucratic friction in some areas. Unofficial processes or tips may be expected.",
    "Police stops, customs hassle, and unofficial 'fees' are common. Document everything.",
    "Systemic corruption affects daily life. Bribes may be expected by officials, police, and at borders."
  ],
  health: [
    "Excellent healthcare infrastructure. No significant disease risks for most travellers.",
    "Standard precautions recommended. Good hospital access in major cities. Travel insurance advised.",
    "Elevated risk from tropical disease, food and water safety issues. Consult a travel clinic before departing.",
    "Serious health risks — malaria, yellow fever, dengue, cholera, or inadequate medical facilities. Prepare thoroughly."
  ],
  crowds: [
    "Genuinely uncrowded. You may have major sites to yourself. Emerging or off-season destination.",
    "Moderate traffic. Busier during peak season but manageable. Book ahead for popular sites.",
    "Heavy tourist traffic. Major landmarks can feel overwhelming. Queues and premium pricing are the norm.",
    "Extreme overtourism. Infrastructure strained, authentic experience significantly diminished."
  ],
  disaster: [
    "Minimal natural disaster risk. Low seismic activity, no hurricane exposure, stable climate.",
    "Some seasonal or geological risk. Flooding, minor earthquakes, or seasonal storms possible.",
    "Notable natural hazard risk — earthquakes, volcanoes, typhoons, or severe flooding in affected areas.",
    "Frequent severe weather events, active seismic risk, or tsunami-prone coastline. Monitor alerts."
  ],
  visa: [
    "Visa free or visa on arrival with no restrictions for most passport holders. Cross the border and go.",
    "Simple e-visa or short visa-on-arrival process. Minimal documentation required.",
    "Formal visa application required. Allow 2–4 weeks and prepare supporting documents.",
    "Restrictive visa regime. Applications may be refused, require sponsorship, or involve lengthy bureaucracy."
  ],
  lgbtq: [
    "Legal, openly celebrated. Pride events, inclusive venues. No special precautions needed.",
    "Legal, socially tolerated in most areas. Urban centres welcoming, rural attitudes more conservative.",
    "Legal but unwelcoming in practice — discrimination common, limited legal protections. Public affection inadvisable.",
    "Criminalised, actively enforced. Real risk of arrest or harm. Serious advisory applies."
  ],
  beaches: [
    "Free, clean, publicly accessible, open to all travellers. Good facilities maintained.",
    "Good beaches accessible with modest facilities. Some private stretches but public options available.",
    "Beach access limited — privatisation, restricted areas, or infrastructure gaps.",
    "Beaches largely privatised, unsafe, prohibitively restricted, or destination is landlocked."
  ],
  vaccines: [
    "No specific vaccines required beyond routine immunisations.",
    "Routine vaccines plus Hepatitis A/B and Typhoid recommended for most travellers.",
    "Several vaccines required or strongly recommended — Yellow Fever, Meningitis, or Rabies. Confirm with a travel clinic.",
    "Extensive pre-travel vaccination schedule required. Yellow Fever certificate mandatory in some cases. Consult a specialist."
  ]
};

// ─── Safety context notes ─────────────────────────────────────────────────────
// Keyed by ISO-2. Shown beneath the generic Safety description in the tooltip
// when the Safety layer is active. Brief, factual, traveller-relevant.
const SAFETY_NOTES = {
  'AU': 'Very low violent crime; wildlife awareness needed in bush; 000 reliable nationwide.',
  'AT': 'One of Europe\'s safest; extremely low violent crime; pickpockets rare.',
  'BE': 'Generally safe; pickpockets in central Brussels and Bruges; stay alert at major stations.',
  'BR': 'Homicide rate ~20/100k; street robbery common in Rio and São Paulo; resort zones well-policed.',
  'CA': 'Very low violent crime; 911 nationwide; drug issues in parts of Vancouver / Toronto.',
  'CL': 'Low crime by South American standards; occasional political unrest; earthquake preparedness essential.',
  'CN': 'Violent crime toward tourists is extremely rare; petty theft in crowded areas; political detention risk for activism.',
  'CO': 'Tourist hotspots (Medellín, Cartagena) have transformed; rural areas carry kidnap risk; FARC remnants active in some zones.',
  'DE': 'Very low crime; pickpockets at tourist sites; politically motivated incidents occasional.',
  'EG': 'Terrorism risk in Sinai peninsula; Cairo street harassment common; tourist sites well-guarded; do not photograph security forces.',
  'ES': 'Petty theft and distraction scams in Barcelona and Madrid; violent crime rare; safe overall.',
  'FR': 'Paris is Europe\'s pickpocket capital; outer suburbs (banlieues) of major cities have elevated crime; rural France very safe.',
  'GB': 'Low violent crime; knife crime in parts of London; bag-snatch risk in tourist areas; terrorism threat at public events.',
  'GH': 'One of West Africa\'s safest destinations; petty crime in Accra; political stability consistent since 1992.',
  'ID': 'Low violent crime toward tourists; bag-snatching by motorbike in cities; Bali very safe; Papua remote-risk areas.',
  'IN': 'Petty theft and scams common; sexual harassment a serious concern, especially for solo women; Delhi / Mumbai require extra urban vigilance.',
  'IT': 'Very low violent crime; pickpockets aggressive in Rome, Naples, Florence; moped theft endemic in Naples.',
  'JP': 'One of the world\'s safest countries; violent crime almost non-existent; lost wallets are frequently returned.',
  'KE': 'Nairobi has violent street crime; carjackings reported; tourist areas and safari circuits well-patrolled; exercise caution after dark.',
  'KR': 'Extremely safe; very low crime in tourist areas; nightlife safe; North Korea political tension remains distant.',
  'MX': 'Homicide rate ~28/100k nationally; cartel violence in border states, Guerrero, Sinaloa; Yucatán Peninsula and CDMX tourist zones comparatively safer.',
  'MY': 'Petty crime in KL; occasional snatch-theft on foot; very safe by Southeast Asian standards overall.',
  'NL': 'Safe country; bicycle theft endemic; pickpockets on Amsterdam trams and Dam Square; bag-snatch risk in Red Light District.',
  'NZ': 'Very safe; low violent crime; earthquake and volcanic risk awareness needed; some property crime in Auckland.',
  'NG': 'Kidnapping for ransom risk; armed robbery; terrorism in north from Boko Haram; stay within secured accommodation in Lagos.',
  'PH': 'Violent crime in parts of Mindanao; Manila requires heightened awareness; tourist islands (Palawan, Cebu) generally safe.',
  'PL': 'Very safe; low crime; pickpockets in Warsaw and Kraków tourist zones; increasing hate crime reports toward LGBTQ+ people.',
  'PT': 'Among Europe\'s safest; pickpockets on Lisbon\'s tram 28 and in Alfama; Porto very safe.',
  'RU': 'State threat to foreign nationals since 2022; petty crime in Moscow/St. Petersburg; do not travel.',
  'SG': 'World\'s safest city; capital punishment a strong deterrent; near-zero violent crime.',
  'TH': 'Low violent crime toward tourists; taxi scams and gem cons in Bangkok; full-moon party theft on Koh Phangan; safe overall.',
  'TR': 'Pickpockets in Istanbul Grand Bazaar; terrorism risk (PKK-linked) in southeast; coastal and tourist areas safe.',
  'TW': 'Extremely safe; violent crime negligible; politically tense with China but internal safety excellent.',
  'TZ': 'Petty crime in Dar es Salaam; tourist circuits well-policed; Zanzibar safer than mainland; express kidnap reported.',
  'US': 'Gun homicide rate ~4/100k; property crime elevated in urban cores; 911 nationwide; wide city-to-city variation.',
  'VN': 'Very safe for tourists; motorbike bag-snatching in HCMC; political restrictions; violent crime toward visitors rare.',
  'ZA': 'Homicide rate ~35/100k; carjacking and mugging common; townships and some CBDs high-risk; tourism zones manageable with vigilance.',
};

const CD = {
  // Southeast Asia
  'TH': { weather:s12(0,0,0,1,2,3,2,2,1,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,2,2,2,1,1,0,0,1,1), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,2,3,3,3,2,1,0,0), vaccines:rep(1) },
  'VN': { weather:s12(1,1,1,1,2,2,2,2,2,1,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(1,1,1,1,2,2,1,1,1,1,1,1), vaccines:rep(1) },
  'KH': { weather:s12(0,0,1,2,2,3,3,3,2,2,1,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(1,1,1,2,1,1,1,1,1,1,1,1), disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:s12(1,1,1,2,3,3,3,3,2,1,1,1), vaccines:rep(2) },
  'LA': { weather:s12(0,0,1,2,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2) },
  'ID': { weather:s12(2,2,2,1,1,1,0,0,0,1,2,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,2,2,2,2,1,1,1,1,1,1), disaster:rep(3), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,1,1,0,0,0,0,0,0), vaccines:rep(2) },
  'PH': { weather:s12(0,0,0,1,2,2,3,3,2,2,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,2,2,2,1,1,1,1,1,1,1,1), disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,2,1,0,0,0), vaccines:rep(1) },
  'MY': { weather:s12(1,1,1,1,2,2,2,2,2,2,2,2), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1), remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,1,1,1,1,1,2,2,2), disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(1,1,1,1,2,2,1,1,1,2,2,1), vaccines:rep(1) },
  'SG': { weather:rep(2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:rep(2), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(2), vaccines:rep(0) },
  'MM': { weather:s12(0,0,1,2,2,3,3,3,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(2), vaccines:rep(2) },
  'BN': { weather:rep(2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(1), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(1), vaccines:rep(1) },
  // East Asia
  'JP': { weather:s12(1,1,0,0,1,2,2,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(1,0,2,1,1,2,1,2,3,2,1,1), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), vaccines:rep(0) },
  'CN': { weather:s12(2,1,1,1,1,1,2,2,1,1,2,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(2), disaster:rep(2), visa:rep(2), lgbtq:rep(2), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), vaccines:rep(0) },
  'KR': { weather:s12(1,1,1,1,2,2,1,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,1,1,2,2,1,1), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), vaccines:rep(0) },
  'TW': { weather:s12(1,1,1,1,2,2,3,3,2,1,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,2,2,2,2,1,1,1,1,1,1), disaster:rep(3), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,2,2,1,0,1,1,1,1,2,2), vaccines:rep(0) },
  'HK': { weather:s12(1,1,1,2,2,2,3,3,2,1,1,1), safety:rep(0), cost:rep(3), family:rep(1), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:rep(3), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(2,2,2,2,1,0,0,1,1,1,2,2), vaccines:rep(0) },
  'MO': { weather:s12(1,1,1,2,2,2,3,3,2,1,1,1), safety:rep(0), cost:rep(3), family:rep(1), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(3), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0) },
  'MN': { weather:s12(3,3,2,1,1,0,0,0,0,1,2,3), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(1) },
  // South Asia
  'IN': { weather:s12(0,0,1,2,3,3,3,2,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(3), remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,2,2,3,2,2,2,1,1,1), disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(1,1,1,2,3,2,2,2,2,1,1,1), vaccines:rep(2) },
  'NP': { weather:s12(1,1,1,1,2,3,3,3,2,0,0,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,1,2,0,0,0,0,2,1,0), disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2) },
  'LK': { weather:s12(0,0,1,2,3,3,2,2,2,2,2,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,2,2,2,1,1,1,1,1,1,1,1), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,0,1,2,2,1,1,2,1,1,0), vaccines:rep(1) },
  'MV': { weather:s12(0,0,0,0,1,2,2,2,1,1,1,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:rep(0), vaccines:rep(1) },
  'PK': { weather:s12(1,1,1,2,3,3,3,3,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(2), vaccines:rep(2) },
  'BD': { weather:s12(1,1,2,2,3,3,3,3,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3), remote:rep(2), corrupt:rep(3), health:rep(3), crowds:rep(1), disaster:rep(3), visa:rep(1), lgbtq:rep(3), beaches:rep(2), vaccines:rep(2) },
  'BT': { weather:s12(1,1,1,1,2,3,3,3,2,0,0,1), safety:rep(0), cost:rep(3), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(1), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(2), lgbtq:rep(2), beaches:rep(3), vaccines:rep(1) },
  // Middle East
  'AE': { weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(1), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(2,2,2,1,1,1,1,1,1,2,2,2), disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(3,3,3,2,1,3,3,3,2,1,3,3), vaccines:rep(0) },
  'SA': { weather:s12(0,0,1,2,3,3,3,3,2,1,0,0), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(3), remote:rep(1), corrupt:rep(2), health:rep(0), crowds:rep(1), disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:rep(2), vaccines:rep(0) },
  'TR': { weather:s12(1,1,1,1,0,0,0,0,0,1,1,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,2,2,2,3,3,2,1,0,0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(3,3,3,2,1,0,0,0,1,2,3,3), vaccines:rep(1) },
  'IL': { weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(2), cost:rep(3), family:rep(1), solo:rep(1), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,2,2,2,2,1,1), disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2), vaccines:rep(0) },
  'JO': { weather:s12(1,1,0,0,0,1,1,1,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), vaccines:rep(1) },
  'LB': { weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(3), cost:rep(2), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(2), vaccines:rep(1) },
  'OM': { weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(1), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(0), disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:s12(1,1,1,1,3,3,3,3,3,1,1,1), vaccines:rep(0) },
  'QA': { weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(1), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(1), disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(2), vaccines:rep(0) },
  'KW': { weather:s12(0,0,1,2,3,3,3,3,2,1,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(1), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(0), disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:rep(2), vaccines:rep(0) },
  'BH': { weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(1), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:rep(1), disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:rep(2), vaccines:rep(0) },
  'IQ': { weather:s12(1,1,1,2,3,3,3,3,2,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(1) },
  'IR': { weather:s12(1,1,1,1,1,2,3,3,1,0,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(2), vaccines:rep(1) },
  'YE': { weather:s12(1,1,1,1,1,2,2,2,1,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'SY': { weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(2) },
  // Africa - North
  'EG': { weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(3), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:s12(1,2,2,2,1,1,1,1,1,1,1,1), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(2,2,2,1,0,0,0,0,0,1,1,2), vaccines:rep(1) },
  'MA': { weather:s12(1,1,0,0,1,1,2,2,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,2,2,2,1,1,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(1,1,0,0,0,0,0,0,0,0,1,1), vaccines:rep(1) },
  'TN': { weather:s12(1,1,0,0,0,0,1,1,0,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(1), disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2), vaccines:rep(1) },
  'DZ': { weather:s12(1,1,0,0,2,3,3,3,1,0,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3), remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(2), vaccines:rep(1) },
  'LY': { weather:s12(1,1,0,1,2,3,3,3,2,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(0), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(1) },
  // Africa - East
  'ET': { weather:s12(1,1,2,2,3,3,2,2,2,1,0,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'KE': { weather:s12(1,1,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(1,1,1,1,1,0,0,0,1,1,1,1), vaccines:rep(3) },
  'TZ': { weather:s12(2,2,2,2,1,0,0,0,1,2,2,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:s12(0,0,1,1,0,0,0,0,0,1,1,0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,1,1,1,1,0,0,0,1,1,0), vaccines:rep(3) },
  'MG': { weather:s12(3,3,2,1,1,0,0,0,0,1,2,3), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(3), visa:rep(1), lgbtq:rep(3), beaches:s12(1,2,1,0,0,0,0,0,0,0,1,1), vaccines:rep(3) },
  'MZ': { weather:s12(3,3,2,1,1,0,0,0,0,1,2,3), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(0,1,1,0,0,0,0,0,0,0,0,0), vaccines:rep(3) },
  'RW': { weather:s12(1,1,2,2,1,0,0,0,1,2,2,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(1), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(2) },
  'UG': { weather:s12(1,1,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'SO': { weather:s12(1,2,2,3,2,1,1,1,2,2,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'SD': { weather:s12(1,1,1,2,3,3,3,3,2,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'ER': { weather:s12(1,1,1,2,2,2,2,2,1,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'DJ': { weather:s12(1,1,2,2,3,3,3,3,2,2,1,1), safety:rep(2), cost:rep(2), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(2), vaccines:rep(2) },
  // Africa - West
  'NG': { weather:s12(1,1,2,2,3,3,3,3,2,2,1,1), safety:rep(3), cost:rep(1), family:rep(2), solo:rep(3), remote:rep(2), corrupt:rep(3), health:rep(3), crowds:rep(1), disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:s12(1,1,1,2,3,3,3,3,2,2,1,1), vaccines:rep(3) },
  'GH': { weather:s12(1,2,2,2,3,3,2,2,2,1,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(1,1,1,2,3,3,2,2,2,1,1,1), vaccines:rep(3) },
  'SN': { weather:s12(1,1,1,1,2,3,3,3,3,2,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,1,2,2,2,2,1,0,0), vaccines:rep(3) },
  'CI': { weather:s12(1,1,2,2,3,3,3,3,3,2,1,1), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,1,2,3,3,3,3,3,1,0,0), vaccines:rep(3) },
  'CM': { weather:s12(1,1,2,2,3,3,3,3,3,2,1,1), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(2), vaccines:rep(3) },
  'SL': { weather:s12(1,1,1,2,3,3,3,3,3,2,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,0,1,3,3,3,3,3,1,0,0), vaccines:rep(3) },
  'GM': { weather:s12(0,0,1,1,2,3,3,3,3,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:s12(2,2,1,0,0,1,1,1,1,0,1,2), disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,1,2,2,2,2,0,0,0), vaccines:rep(3) },
  'BF': { weather:s12(1,1,1,2,3,3,3,3,2,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'ML': { weather:s12(1,1,2,3,3,3,3,3,2,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'NE': { weather:s12(1,1,2,3,3,3,3,3,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'TD': { weather:s12(1,1,2,3,3,3,3,3,2,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'MR': { weather:s12(0,0,1,2,3,3,3,3,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(2), vaccines:rep(3) },
  // Africa - Central
  'CD': { weather:s12(2,2,2,2,2,2,1,1,2,2,2,2), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'CF': { weather:s12(1,2,2,2,3,3,3,3,2,2,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'CG': { weather:s12(2,2,2,2,2,1,0,1,2,2,2,2), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(2), vaccines:rep(3) },
  'GA': { weather:s12(2,2,2,2,2,1,0,1,2,2,2,2), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(1), vaccines:rep(3) },
  // Africa - South
  'ZA': { weather:s12(1,1,1,0,1,2,2,2,1,0,0,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,0,0,1,2,2,1,0,0,1), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,2,2,3,2,1,0,0,0), vaccines:rep(1) },
  'BW': { weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(0), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2) },
  'NA': { weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(1), health:rep(1), crowds:rep(0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:s12(2,2,2,1,1,1,1,1,1,1,1,2), vaccines:rep(2) },
  'ZM': { weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  'ZW': { weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(1), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(2) },
  'AO': { weather:s12(2,2,2,2,1,0,0,0,1,2,2,2), safety:rep(2), cost:rep(2), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(1), vaccines:rep(3) },
  // Western Europe
  'FR': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,3,3,3,2,1,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), vaccines:rep(0) },
  'ES': { weather:s12(1,1,1,0,0,0,1,1,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,3,3,2,1,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,2,1,1,0,0,0,0,1,2,2), vaccines:rep(0) },
  'IT': { weather:s12(1,1,1,0,0,0,1,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,3,2,2,3,3,2,2,1,1), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,2,1,0,0,0,0,1,2,3), vaccines:rep(0) },
  'PT': { weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,2,2,2,3,3,2,1,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,1,1,0,0,0,0,0,0,1,2), vaccines:rep(0) },
  'GR': { weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,2,2,2,3,3,2,1,0,0), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(2,2,2,1,0,0,0,0,0,0,1,2), vaccines:rep(0) },
  'DE': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,1,2,2,2,2,2,2,1,2), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'GB': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,3,3,2,1,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,2,3,3), vaccines:rep(0) },
  'NL': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,3,2,2,1,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'BE': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,1,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'AT': { weather:s12(2,2,1,1,0,0,0,0,0,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(2,2,1,1,1,1,2,2,1,1,2,3), disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0) },
  'CH': { weather:s12(2,2,1,1,0,0,0,0,0,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,1,1,2,2,1,1,2,2), disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0) },
  'SE': { weather:s12(3,2,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,1,2,2,1,1,0,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'NO': { weather:s12(3,3,2,1,1,0,0,0,1,2,2,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,1,2,2,1,1,0,0,0), disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'DK': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'FI': { weather:s12(3,3,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,0,1,1,2,1,0,0,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'IE': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,2,1,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,2,2,1,1,1,2,2,3,3), vaccines:rep(0) },
  'IS': { weather:s12(3,3,2,2,1,1,1,1,2,2,3,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0), disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0) },
  // Central/Eastern Europe
  'PL': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'CZ': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,3,3,2,2,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0) },
  'HU': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,3,3,2,1,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0) },
  'RO': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,2,1,0,0,1,2,3,3), vaccines:rep(0) },
  'BG': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(2), health:rep(0), crowds:s12(0,0,0,1,1,2,3,3,1,0,0,0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,2,1,0,0,1,2,3,3), vaccines:rep(0) },
  'HR': { weather:s12(2,2,1,1,0,0,0,0,0,1,1,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,2,1,0,0,0,0,1,2,3), vaccines:rep(0) },
  'SI': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0), disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,0,0,1,2,3,3), vaccines:rep(0) },
  'SK': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:rep(0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0) },
  'RS': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0) },
  'AL': { weather:s12(1,2,1,1,0,0,0,0,0,1,1,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,2,1,0,0,0,0,1,2,3), vaccines:rep(0) },
  'ME': { weather:s12(1,2,1,1,0,0,0,0,0,1,1,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(2), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,2,1,0,0,0,0,1,2,3), vaccines:rep(0) },
  'BA': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0) },
  'MK': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(2), health:rep(0), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0) },
  'XK': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(0), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0) },
  // Baltic + Eastern Europe
  'EE': { weather:s12(3,2,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,1,2,2,1,1,0,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'LV': { weather:s12(3,2,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:rep(0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'LT': { weather:s12(3,2,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:rep(0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'UA': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(1) },
  'BY': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(0), visa:rep(2), lgbtq:rep(3), beaches:rep(3), vaccines:rep(0) },
  'MD': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0) },
  'RU': { weather:s12(3,3,2,1,1,0,0,0,1,1,2,3), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:s12(3,3,3,3,3,2,1,1,2,3,3,3), vaccines:rep(0) },
  'GE': { weather:s12(1,1,1,1,1,0,0,0,0,1,1,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(0), corrupt:rep(1), health:rep(1), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'AM': { weather:s12(2,2,1,1,0,0,0,0,0,1,2,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0) },
  'AZ': { weather:s12(1,1,1,1,0,0,1,1,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(3,3,3,3,2,1,0,0,1,2,3,3), vaccines:rep(0) },
  // Americas - North
  'US': { weather:s12(1,1,1,1,1,0,0,0,0,1,1,1), safety:rep(1), cost:rep(3), family:rep(0), solo:rep(1), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,1), disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:s12(2,2,2,2,1,0,0,0,1,1,2,2), vaccines:rep(0) },
  'CA': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,1,2,2,2,2,2,1,1,1), disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0) },
  'MX': { weather:s12(1,1,1,2,3,1,1,1,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(3), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,2,1,1,1,1,1,0,0), vaccines:rep(1) },
  'GT': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(1), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(2), vaccines:rep(2) },
  'BZ': { weather:s12(0,0,0,1,2,2,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,1,2,2,3,3,2,1,0,0), vaccines:rep(2) },
  'HN': { weather:s12(0,0,1,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(2), vaccines:rep(2) },
  'SV': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(1), vaccines:rep(2) },
  'NI': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(1), vaccines:rep(2) },
  'CR': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1), remote:rep(1), corrupt:rep(1), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:s12(0,0,0,0,1,2,2,2,1,0,0,0), vaccines:rep(1) },
  'PA': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,2,2,2,1,0,0,0), vaccines:rep(2) },
  'CU': { weather:s12(0,0,0,1,2,2,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(3), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(2), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,1,0,0,0), vaccines:rep(1) },
  'JM': { weather:s12(0,0,0,1,2,2,3,3,2,1,0,0), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(1), disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,1,2,3,3,1,0,0,0), vaccines:rep(1) },
  'DO': { weather:s12(0,0,0,1,2,2,3,3,2,1,0,0), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(2,2,2,2,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,1,0,0,0), vaccines:rep(1) },
  'TT': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,1,1,1,1,0,0,0), vaccines:rep(1) },
  'BB': { weather:s12(0,0,0,1,2,2,3,3,2,1,0,0), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,1,0,0,0), vaccines:rep(1) },
  'BS': { weather:s12(0,0,0,1,2,2,3,3,2,1,0,0), safety:rep(1), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(1), health:rep(0), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,1,0,0,0), vaccines:rep(1) },
  'PR': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(0), crowds:rep(1), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,1,2,2,1,0,0,0), vaccines:rep(0) },
  // South America
  'BR': { weather:s12(2,2,2,2,1,1,0,0,1,2,2,2), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(2,3,1,1,1,1,1,1,1,1,1,2), disaster:rep(2), visa:rep(1), lgbtq:rep(1), beaches:s12(0,0,0,1,1,2,2,2,1,0,0,0), vaccines:rep(2) },
  'AR': { weather:s12(1,1,0,1,2,2,2,2,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,1,2), disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:s12(1,1,0,1,2,3,3,2,1,0,0,0), vaccines:rep(1) },
  'CL': { weather:s12(1,1,0,0,1,2,2,2,1,0,0,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(1), crowds:s12(1,1,0,0,1,1,1,1,1,0,0,1), disaster:rep(3), visa:rep(0), lgbtq:rep(1), beaches:s12(1,1,0,0,1,2,2,2,1,0,0,0), vaccines:rep(1) },
  'CO': { weather:s12(0,1,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(1,1,1,1,1,0,0,0,0,1,1,1), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(1,1,1,1,1,0,0,0,0,1,1,1), vaccines:rep(2) },
  'PE': { weather:s12(0,0,1,1,1,2,2,2,1,0,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,1,1,1,1,1,1,2,2,1), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(2,2,1,1,1,2,3,3,2,1,1,2), vaccines:rep(2) },
  'EC': { weather:s12(1,2,2,1,1,0,0,0,1,2,1,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(1,1,1,1,1,0,0,0,0,1,1,1), vaccines:rep(2) },
  'BO': { weather:s12(2,2,2,1,0,1,2,2,1,0,0,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2) },
  'UY': { weather:s12(1,1,0,1,1,2,2,2,1,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(1,2,0,0,0,1,1,1,0,0,0,1), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(0,1,0,0,1,2,2,2,1,0,0,0), vaccines:rep(0) },
  'PY': { weather:s12(1,1,1,1,1,2,2,2,1,1,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(1) },
  'VE': { weather:s12(0,0,0,1,2,2,2,2,1,0,0,0), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(2), lgbtq:rep(2), beaches:rep(2), vaccines:rep(2) },
  'GY': { weather:s12(2,2,3,3,3,2,1,1,2,3,2,2), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(2), vaccines:rep(3) },
  'SR': { weather:s12(2,2,3,3,3,2,1,1,2,3,2,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:rep(2), vaccines:rep(3) },
  // Oceania
  'AU': { weather:s12(1,1,0,0,1,2,2,2,1,0,0,1), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,2,1,1,1,1,1,1,1,0,1,1), disaster:rep(2), visa:rep(1), lgbtq:rep(0), beaches:s12(0,0,0,1,2,2,3,3,2,1,0,0), vaccines:rep(0) },
  'NZ': { weather:s12(0,0,0,1,1,2,2,2,1,0,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(2,2,1,1,1,1,1,1,1,1,1,2), disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:s12(0,0,0,1,2,2,3,3,2,1,0,0), vaccines:rep(0) },
  'FJ': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(1), remote:rep(2), corrupt:rep(1), health:rep(1), crowds:s12(1,1,1,1,1,1,0,0,1,1,1,1), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,1,1,0,0,0,0,0), vaccines:rep(1) },
  'VU': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(1), solo:rep(0), remote:rep(3), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:rep(1), vaccines:rep(2) },
  'PG': { weather:s12(2,2,2,2,2,2,1,1,2,2,2,2), safety:rep(2), cost:rep(2), family:rep(2), solo:rep(3), remote:rep(3), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:rep(1), vaccines:rep(3) },
  'WS': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(1), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(0), vaccines:rep(1) },
  'TO': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(1), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(0), vaccines:rep(1) },
  'PW': { weather:s12(1,1,1,1,2,2,2,2,2,1,1,1), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(1), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(0), vaccines:rep(1) },
  'SB': { weather:s12(2,2,2,2,2,2,1,1,2,2,2,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(3), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(1), vaccines:rep(2) },
  'PF': { weather:s12(1,2,2,1,1,1,1,1,1,1,1,1), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(1), health:rep(0), crowds:rep(1), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(0), vaccines:rep(1) },
  'FM': { weather:s12(1,1,1,1,2,2,2,2,2,1,1,1), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(3), corrupt:rep(1), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(0), vaccines:rep(1) },
  // Central Asia
  'KZ': { weather:s12(3,2,1,1,1,0,0,0,0,1,2,3), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(1) },
  'UZ': { weather:s12(1,1,1,1,2,3,3,3,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), vaccines:rep(1) },
  'KG': { weather:s12(3,2,1,1,0,0,0,0,0,1,2,3), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:rep(3), vaccines:rep(1) },
  'TJ': { weather:s12(2,2,1,1,2,3,3,3,1,0,1,2), safety:rep(1), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(2) },
  'TM': { weather:s12(1,1,1,2,3,3,3,3,2,1,1,1), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(1) },
  'AF': { weather:s12(1,1,1,2,2,3,3,3,1,0,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3) },
  // Special territories (custom keys — not ISO3166)
  'GZ':  { weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(1), vaccines:rep(2) },
  // West Bank — Palestinian Authority areas; Israeli military checkpoints; no coastline
  'XWB': { weather:s12(1,1,0,0,0,1,2,2,1,0,1,1), safety:rep(3), cost:rep(1), family:rep(3), solo:rep(3), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(1), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(2) },
};

// ─── Sub-national climate data ────────────────────────────────────────────────
// Keyed by ISO 3166-2 subdivision code (e.g. 'CN-11', 'US-AK').
// Only layers that meaningfully differ from the parent country are included;
// all other layers fall through to the parent CD entry at runtime.
const CD_A1 = {

  // ── China ─────────────────────────────────────────────────────────────────
  // Northeast — extreme cold winters, pleasant short summer
  'CN-23': { weather: s12(3,3,3,2,1,0,0,0,0,1,2,3) }, // Heilongjiang (Harbin)
  'CN-22': { weather: s12(3,3,2,1,0,0,0,0,0,1,2,3) }, // Jilin
  'CN-21': { weather: s12(3,2,2,1,0,0,0,0,0,1,1,3) }, // Liaoning (Shenyang)

  // North — cold dry winters, hot humid summers, excellent Sep–Oct
  // Beijing — capital; most expensive for China; intense tourist and commuter crowds
  'CN-11': { weather: s12(2,2,1,1,1,1,2,2,0,0,1,2), cost:rep(2), crowds:rep(3) },
  'CN-12': { weather: s12(2,2,1,1,1,1,2,2,0,0,1,2) }, // Tianjin
  'CN-13': { weather: s12(2,2,1,1,1,1,2,2,0,0,1,2) }, // Hebei
  'CN-14': { weather: s12(2,2,1,1,0,1,1,2,0,0,1,2) }, // Shanxi
  'CN-37': { weather: s12(2,2,1,1,1,1,2,2,0,0,1,2) }, // Shandong (Qingdao)
  'CN-41': { weather: s12(2,2,1,1,1,1,2,2,0,0,1,2) }, // Henan

  // Inner Mongolia — extreme continental steppe
  'CN-15': { weather: s12(3,3,2,1,0,0,0,0,0,1,2,3) },

  // East / Lower Yangtze — subtropical; plum rain Jun, typhoon Jul–Sep
  // Shanghai — most international city in China; premium prices; best nightlife
  'CN-31': { weather: s12(1,2,1,1,1,2,3,3,2,0,1,1), cost:rep(2), crowds:rep(2) },
  'CN-32': { weather: s12(1,2,1,1,1,2,2,3,2,0,1,1) }, // Jiangsu (Nanjing)
  'CN-33': { weather: s12(1,2,1,1,1,2,2,3,2,0,1,1) }, // Zhejiang (Hangzhou)
  'CN-34': { weather: s12(2,2,1,1,1,2,2,2,1,0,1,2) }, // Anhui
  'CN-35': { weather: s12(1,1,1,1,1,2,2,2,2,1,1,1) }, // Fujian (Xiamen)
  'CN-36': { weather: s12(1,2,1,1,1,2,2,3,1,0,1,1) }, // Jiangxi

  // Central — hot, humid summers; flooding risk Jul–Aug
  'CN-42': { weather: s12(1,2,1,1,1,2,2,3,1,0,1,1) }, // Hubei (Wuhan)
  'CN-43': { weather: s12(1,2,1,1,1,2,2,3,1,0,1,1) }, // Hunan (Changsha)

  // South — subtropical/tropical; excellent Nov–Mar
  // Guangdong — megacity belt (Guangzhou/Shenzhen); expensive; gateway to HK/Macau
  'CN-44': { weather: s12(1,2,2,2,2,2,2,2,2,1,0,1), cost:rep(2), crowds:rep(2) },
  'CN-45': { weather: s12(1,2,2,2,2,2,2,2,1,0,1,1) }, // Guangxi (Guilin)
  // Hainan — China's tropical island; resort prices; best beaches in the country
  'CN-46': { weather: s12(0,0,0,1,2,2,2,2,2,1,0,0), beaches:rep(0), cost:rep(2) },

  // Southwest — Chengdu/Chongqing basin foggy; Yunnan "spring city"
  'CN-50': { weather: s12(1,1,1,1,1,2,2,3,2,1,1,1) }, // Chongqing
  'CN-51': { weather: s12(1,1,1,1,1,2,2,2,2,1,1,2) }, // Sichuan (Chengdu)
  'CN-52': { weather: s12(1,1,1,1,1,2,1,1,1,0,1,1) }, // Guizhou (mild/overcast)
  'CN-53': { weather: s12(0,0,0,0,1,2,2,2,1,0,0,0) }, // Yunnan (Kunming — spring city)

  // Northwest — arid, extreme continental
  'CN-61': { weather: s12(2,2,1,1,0,1,1,2,0,0,1,2) }, // Shaanxi (Xi'an)
  'CN-62': { weather: s12(2,2,1,1,0,0,1,2,0,1,2,2) }, // Gansu (Lanzhou)
  'CN-64': { weather: s12(2,2,1,1,0,0,1,2,0,0,1,2) }, // Ningxia
  // Xinjiang — pervasive surveillance; restricted zones near borders; Silk Road sites open but monitored
  'CN-65': { weather: s12(3,3,2,1,0,0,3,3,1,1,2,3), safety:rep(2), crowds:rep(0), visa:rep(2) },

  // High plateau
  // Tibet/Xizang — Tibet Travel Permit required beyond Chinese visa; strict surveillance; very few tourists
  'CN-54': { weather: s12(3,3,2,1,0,1,1,1,0,1,2,3), visa:rep(3), crowds:rep(0), safety:rep(2) },
  // Qinghai — high plateau; no special permit; remote but accessible; low tourist density
  'CN-63': { weather: s12(3,3,2,1,0,1,1,1,0,1,2,3), crowds:rep(0) },

  // ── India ────────────────────────────────────────────────────────────────
  // Delhi — solo female safety significantly worse than national average; extreme heat/pollution
  'IN-DL': { weather: s12(1,1,2,2,3,3,2,2,2,1,0,1), solo:rep(3), safety:rep(2) }, // — extreme heat May–Jun; humid Jul–Sep
  'IN-RJ': { weather: s12(0,1,1,2,3,3,2,2,2,1,0,0) }, // Rajasthan — Thar desert; scorching Apr–Jun
  // Kerala — most progressive state; lower solo risk; excellent public healthcare
  'IN-KL': { weather: s12(0,0,0,1,2,3,3,3,2,1,0,0), solo:rep(1), safety:rep(1), lgbtq:rep(1) }, // — heavy monsoon Jun–Aug; best Nov–Feb
  // Goa — India's most LGBTQ-tolerant state; international beach scene; safer for solo travellers
  'IN-GA': { weather: s12(0,0,0,1,2,3,3,3,3,2,1,0), lgbtq:rep(1), solo:rep(1), safety:rep(1) }, // — best Nov–Feb; heavy monsoon Jun–Sep
  'IN-HP': { weather: s12(3,3,2,1,0,1,2,2,1,0,1,3) }, // Himachal Pradesh — mountain; snow Nov–Mar
  'IN-UK': { weather: s12(2,2,1,1,1,2,3,3,2,0,1,2) }, // Uttarakhand — Himalayan foothills
  'IN-MH': { weather: s12(0,0,1,2,3,3,3,3,3,1,1,0) }, // Maharashtra (Mumbai) — heavy monsoon Jun–Sep
  'IN-GJ': { weather: s12(0,0,1,2,3,3,2,2,2,1,0,0) }, // Gujarat — hot/arid; monsoon Jun–Sep
  'IN-TN': { weather: s12(0,0,1,1,2,2,2,2,1,2,3,1) }, // Tamil Nadu — NE monsoon Oct–Dec!
  'IN-WB': { weather: s12(1,1,2,2,3,3,3,3,2,1,1,1) }, // West Bengal (Kolkata)
  'IN-AS': { weather: s12(1,1,2,2,3,3,3,3,3,2,1,1) }, // Assam — very heavy monsoon
  // Jammu & Kashmir — active conflict zone; special permits; do not travel near LoC
  'IN-JK': { weather: s12(3,3,2,1,0,0,1,1,0,0,1,3), safety:rep(3), visa:rep(3), crowds:rep(0), solo:rep(3) }, // — valley; snowy winters

  // ── USA — all 50 states ───────────────────────────────────────────────────
  // US national fallbacks: cost:rep(3), safety:rep(1), lgbtq:rep(1), disaster:rep(1)
  // Per-state entries only specify layers that meaningfully differ from those defaults.

  // Pacific Coast
  'US-AK': { weather: s12(3,3,3,2,1,1,1,1,2,2,3,3), safety:rep(0), disaster:rep(1), beaches:rep(3) },
  'US-HI': { weather: s12(0,0,0,0,0,0,0,0,0,0,0,0), lgbtq:rep(0), beaches:rep(0), disaster:rep(2) },
  'US-WA': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2), lgbtq:rep(0) },
  'US-OR': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2), cost:rep(2), lgbtq:rep(0) },
  'US-CA': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), lgbtq:rep(0), disaster:rep(2) },

  // Mountain West
  'US-MT': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(1), safety:rep(0), lgbtq:rep(2) },
  'US-ID': { weather: s12(2,2,1,1,1,0,0,0,1,1,1,2), cost:rep(1), safety:rep(0), lgbtq:rep(2) },
  'US-WY': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(1), safety:rep(0), lgbtq:rep(2) },
  'US-CO': { weather: s12(1,1,1,1,1,0,0,0,0,1,1,1), cost:rep(2), lgbtq:rep(0) },
  'US-NV': { weather: s12(1,1,1,1,1,2,3,3,2,1,0,0), cost:rep(1), lgbtq:rep(1) },
  'US-UT': { weather: s12(1,1,1,1,1,1,2,2,1,0,0,1), cost:rep(1), lgbtq:rep(3) },
  'US-AZ': { weather: s12(0,0,0,1,2,3,3,3,2,1,0,0), cost:rep(1), lgbtq:rep(1) },
  'US-NM': { weather: s12(1,1,1,1,1,2,2,2,1,0,0,1), cost:rep(1), safety:rep(2), lgbtq:rep(1) },

  // Great Plains
  'US-ND': { weather: s12(3,3,3,2,1,0,0,0,1,1,2,3), cost:rep(1), safety:rep(0), lgbtq:rep(2) },
  'US-SD': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(1), safety:rep(0), lgbtq:rep(2), disaster:rep(2) },
  'US-NE': { weather: s12(2,2,1,1,2,1,1,2,0,1,1,2), cost:rep(1), lgbtq:rep(2), disaster:rep(2) },
  'US-KS': { weather: s12(1,1,1,1,2,1,2,3,1,1,1,1), cost:rep(1), lgbtq:rep(2), disaster:rep(2) },
  'US-OK': { weather: s12(1,1,1,1,2,2,3,3,2,1,1,1), cost:rep(1), safety:rep(2), lgbtq:rep(2), disaster:rep(2) },
  'US-TX': { weather: s12(1,1,1,1,2,2,3,3,2,1,1,1), cost:rep(2), lgbtq:rep(2), disaster:rep(2) },

  // Upper Midwest
  'US-MN': { weather: s12(3,3,3,2,1,0,0,0,1,1,2,3), cost:rep(1), lgbtq:rep(0) },
  'US-WI': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(1), lgbtq:rep(1) },
  'US-MI': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(1), lgbtq:rep(1) },
  'US-IA': { weather: s12(3,2,2,1,1,0,0,0,1,1,2,3), cost:rep(1), lgbtq:rep(2), disaster:rep(2) },
  'US-MO': { weather: s12(2,2,1,1,2,1,2,2,1,1,1,2), cost:rep(1), lgbtq:rep(2) },
  'US-IL': { weather: s12(3,2,2,1,1,0,1,1,0,1,1,3), cost:rep(2), lgbtq:rep(0) },
  'US-IN': { weather: s12(2,2,1,1,1,0,1,1,0,1,1,2), cost:rep(1), lgbtq:rep(2) },
  'US-OH': { weather: s12(2,2,1,1,1,0,0,0,0,1,1,2), cost:rep(1), lgbtq:rep(1) },

  // South / Gulf Coast
  'US-LA': { weather: s12(1,1,1,2,2,2,3,3,2,1,1,1), cost:rep(1), safety:rep(2), lgbtq:rep(2), disaster:rep(3) },
  'US-AR': { weather: s12(1,1,1,1,2,1,2,2,1,1,1,1), cost:rep(0), safety:rep(2), lgbtq:rep(2) },
  'US-MS': { weather: s12(1,1,1,1,2,2,2,2,2,1,1,1), cost:rep(0), safety:rep(2), lgbtq:rep(3) },
  'US-AL': { weather: s12(1,1,1,0,1,1,2,2,1,0,1,1), cost:rep(0), safety:rep(2), lgbtq:rep(3) },
  'US-TN': { weather: s12(1,1,1,1,1,0,1,1,0,1,1,1), cost:rep(1), lgbtq:rep(2) },
  'US-KY': { weather: s12(2,2,1,1,1,0,1,1,0,1,1,2), cost:rep(1), lgbtq:rep(2) },
  'US-WV': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2), cost:rep(1), lgbtq:rep(2) },
  'US-FL': { weather: s12(1,1,0,0,1,2,2,2,2,1,1,1), cost:rep(2), lgbtq:rep(1), disaster:rep(2) },

  // Southeast Atlantic
  'US-GA': { weather: s12(1,1,1,0,1,1,2,2,1,0,0,1), cost:rep(1), lgbtq:rep(2) },
  'US-SC': { weather: s12(1,1,0,0,0,0,1,1,0,0,0,1), cost:rep(1), lgbtq:rep(2) },
  'US-NC': { weather: s12(1,1,1,1,0,0,1,1,0,0,1,1), cost:rep(1), lgbtq:rep(2) },
  'US-VA': { weather: s12(1,1,1,1,0,0,1,1,0,0,1,1), cost:rep(2), lgbtq:rep(1) },
  'US-MD': { weather: s12(1,1,1,1,1,0,1,1,0,0,1,2), cost:rep(2), lgbtq:rep(0) },
  'US-DE': { weather: s12(2,2,1,1,0,0,1,1,0,0,1,2), cost:rep(2), lgbtq:rep(0) },

  // Northeast
  'US-NJ': { weather: s12(2,2,1,1,0,0,1,1,0,1,1,2), lgbtq:rep(0) },
  'US-NY': { weather: s12(2,2,1,1,0,0,1,1,0,0,1,2), lgbtq:rep(0) },
  'US-PA': { weather: s12(2,2,1,1,1,0,1,1,0,1,1,2), cost:rep(2), lgbtq:rep(1) },
  'US-CT': { weather: s12(2,2,1,1,1,0,0,0,1,1,1,2), lgbtq:rep(0) },
  'US-RI': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2), cost:rep(2), lgbtq:rep(0) },
  'US-MA': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2), lgbtq:rep(0) },
  'US-VT': { weather: s12(3,3,3,2,1,0,0,0,1,1,2,3), cost:rep(2), safety:rep(0), lgbtq:rep(0) },
  'US-NH': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(2), safety:rep(0), lgbtq:rep(1) },
  'US-ME': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(2), safety:rep(0), lgbtq:rep(1) },

  // ── Australia ────────────────────────────────────────────────────────────
  'AU-QLD': { weather: s12(2,2,2,1,0,0,0,0,0,1,1,2) }, // Queensland — tropical north; cyclone season Dec–Mar
  'AU-NT':  { weather: s12(3,3,3,2,0,0,0,0,0,0,1,3) }, // Northern Territory — severe wet season Nov–Apr
  'AU-WA':  { weather: s12(1,1,1,1,1,2,2,2,1,0,0,1) }, // Western Australia — Perth Mediterranean
  'AU-SA':  { weather: s12(1,1,0,0,1,2,2,2,1,0,0,1) }, // South Australia — hot summers; mild winters
  'AU-NSW': { weather: s12(1,1,1,0,0,1,1,1,1,0,0,1) }, // New South Wales (Sydney) — mostly pleasant
  'AU-VIC': { weather: s12(1,1,1,1,1,2,2,2,1,0,0,1) }, // Victoria (Melbourne) — variable; warm summers
  'AU-TAS': { weather: s12(2,2,2,1,1,2,2,2,1,1,1,2) }, // Tasmania — cooler; windier

  // ── Russia ───────────────────────────────────────────────────────────────
  'RU-MOW': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3) }, // Moscow — harsh continental winters
  'RU-KDA': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1) }, // Krasnodar (Sochi/Black Sea) — much milder
  'RU-SA':  { weather: s12(3,3,3,3,1,0,0,1,2,3,3,3) }, // Sakha/Yakutia — coldest inhabited region on Earth
  'RU-PRI': { weather: s12(3,2,1,1,1,1,2,2,1,0,2,3) }, // Primorsky (Vladivostok) — monsoon influenced

  // ── Brazil ───────────────────────────────────────────────────────────────
  'BR-AM': { weather: s12(2,2,2,2,2,1,1,1,1,1,2,2) }, // Amazonas (Manaus) — hot/wet year-round
  'BR-PA': { weather: s12(2,3,3,3,2,1,1,1,1,1,2,2) }, // Pará — very heavy rain Mar–May
  'BR-BA': { weather: s12(1,1,2,2,2,2,2,2,1,1,1,1) }, // Bahia (Salvador) — wet Apr–Jul
  'BR-SP': { weather: s12(2,2,2,2,1,1,1,1,1,1,2,2) }, // São Paulo — subtropical; mild most of year
  'BR-RS': { weather: s12(1,1,1,2,2,2,3,2,2,1,1,1) }, // Rio Grande do Sul — coldest Brazil; cool winters
  'BR-CE': { weather: s12(2,2,3,3,2,1,0,0,0,0,1,1) }, // Ceará (Fortaleza) — NE; rainy Feb–May

  // ── Canada ───────────────────────────────────────────────────────────────
  'CA-BC': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2) }, // British Columbia — mild coast; rainy winters
  'CA-ON': { weather: s12(3,3,2,1,1,0,0,0,0,1,2,3) }, // Ontario (Toronto) — cold winters; hot summers
  'CA-QC': { weather: s12(3,3,3,2,1,0,0,0,1,1,2,3) }, // Quebec (Montreal) — harsh winters
  'CA-AB': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3) }, // Alberta (Calgary) — continental; cold winters
  'CA-YT': { weather: s12(3,3,3,3,2,1,1,1,2,3,3,3) }, // Yukon — subarctic; very cold
  'CA-NS': { weather: s12(3,3,2,2,1,1,1,1,1,1,2,3) }, // Nova Scotia — maritime; foggy; cold winters

  // ── France ───────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(2), safety:rep(0), lgbtq:rep(0), corrupt:rep(0)
  // Ile-de-France — Paris; most expensive; Europe's pickpocket capital; extreme summer crowds
  'FR-IDF': { weather: s12(2,2,1,1,1,0,0,0,0,1,2,2), cost:rep(3), crowds:rep(3), safety:rep(1) },
  // Provence-Alpes-Cote d'Azur — Mediterranean coast; Riviera; excellent beaches; very crowded Jul-Aug
  'FR-PAC': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,3), crowds:s12(0,0,1,1,2,2,3,3,2,1,0,0) },
  // Occitanie — Toulouse/Montpellier; Mediterranean access; affordable; beautiful countryside
  'FR-OCC': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), cost:rep(1), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,3) },
  // Bretagne — Atlantic coast; rainy; Celtic culture; seafood; affordable
  'FR-BRE': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(1), beaches:s12(2,2,2,1,1,1,1,1,1,1,1,2) },
  // Nouvelle-Aquitaine — Bordeaux wine country; Atlantic Basque coast; affordable
  'FR-NAQ': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), cost:rep(1), beaches:s12(2,2,1,1,0,0,0,0,0,1,2,2) },
  // Auvergne-Rhone-Alpes — Lyon/Alps; ski season inflates cost Dec-Mar
  'FR-ARA': { weather: s12(2,2,1,1,0,0,0,0,0,1,2,2), cost:rep(1) },
  // Normandie — rainy Atlantic climate; D-Day history; affordable; cider and cheese country
  'FR-NOR': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(1) },
  // Grand Est — Alsace/Strasbourg; continental winters; Germanic culture; affordable
  'FR-GES': { weather: s12(2,2,1,1,1,0,0,0,0,1,2,2), cost:rep(1) },
  // Corse — island; hot dry summers; expensive; low crime; very limited winter tourism
  'FR-COR': { weather: s12(1,2,1,0,0,0,0,0,0,0,1,2), cost:rep(2), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,3), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0) },

  // ── Germany ──────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(2), safety:rep(0), lgbtq:rep(0)
  // Bavaria — Munich; Oktoberfest; conservative south; most expensive German state
  'DE-BY': { weather: s12(2,2,1,1,0,0,0,0,0,1,2,2), cost:rep(2), lgbtq:rep(1), crowds:s12(1,1,1,1,1,1,2,2,2,2,3,1) },
  // Berlin — city-state; most progressive; significantly cheaper than Munich; cultural capital
  'DE-BE': { weather: s12(2,2,1,1,1,0,0,0,0,1,2,2), cost:rep(1), lgbtq:rep(0), crowds:rep(2) },
  // Hamburg — maritime gateway; progressive; milder Atlantic climate
  'DE-HH': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(2), lgbtq:rep(0) },
  // North Rhine-Westphalia — Cologne/Dusseldorf; densely urban; industrial heartland
  'DE-NW': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(2) },
  // Baden-Wurttemberg — Stuttgart/Black Forest; wealthy; expensive; tech industry
  'DE-BW': { weather: s12(2,2,1,1,0,0,0,0,0,1,2,2), cost:rep(2) },

  // ── Spain ────────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(1), safety:rep(0), lgbtq:rep(0)
  // Catalonia — Barcelona; premium prices; severe overtourism Jul-Aug; active separatist politics
  'ES-CT': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), cost:rep(2), crowds:s12(1,1,2,2,2,2,3,3,2,2,1,1), beaches:s12(2,2,1,1,0,0,0,0,0,1,2,2) },
  // Andalucia — cheapest region; extreme heat Jul-Aug (45C in Sevilla); Flamenco/Alhambra
  'ES-AN': { weather: s12(1,1,0,0,0,2,3,3,1,0,0,1), cost:rep(0), beaches:s12(2,2,1,0,0,0,0,0,0,1,2,2) },
  // Canary Islands — perpetual spring; excellent beaches; year-round destination; EU territory
  'ES-CN': { weather: s12(0,0,0,0,0,0,0,0,0,0,0,0), beaches:rep(0), crowds:s12(2,2,1,1,1,1,2,2,1,1,1,2) },
  // Balearic Islands — Ibiza/Majorca; very expensive in summer; extreme overtourism Jul-Aug
  'ES-IB': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0), cost:rep(2) },
  // Basque Country — rainy Atlantic; San Sebastian food capital; high cost; cultural autonomy
  'ES-PV': { weather: s12(2,2,1,1,1,1,1,1,1,1,2,2), cost:rep(2) },
  // Madrid region — hot dry summers; expensive capital; lively nightlife year-round
  'ES-MD': { weather: s12(1,1,1,1,0,1,2,2,0,0,1,1), cost:rep(2), crowds:s12(1,1,2,2,2,2,2,2,2,2,1,1) },
  // Valencia — sunniest major city; good beaches; more affordable than Barcelona
  'ES-VC': { weather: s12(1,1,0,0,0,0,0,0,0,0,0,1), cost:rep(1), beaches:s12(2,2,1,1,0,0,0,0,0,0,1,2) },

  // ── Italy ─────────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(2), safety:rep(0), lgbtq:rep(1), corrupt:rep(1)
  // Lombardia — Milan; most expensive region; fashion/finance; top healthcare
  'IT-25': { weather: s12(2,2,1,1,1,0,0,0,0,1,2,2), cost:rep(3) },
  // Veneto — Venice; extremely crowded; premium prices; flooding risk in Venice
  'IT-34': { weather: s12(1,1,1,1,1,0,0,0,0,1,1,2), cost:rep(2), crowds:s12(1,1,2,3,3,3,3,3,3,2,2,1) },
  // Toscana — Florence/Tuscany; severe overtourism May-Sep; excellent spring and fall
  'IT-52': { weather: s12(1,1,1,1,1,0,0,0,0,1,1,1), cost:rep(2), crowds:s12(1,1,2,3,3,3,3,3,3,2,1,1) },
  // Lazio — Rome; extreme summer crowds and heat; premium tourist pricing
  'IT-62': { weather: s12(1,1,1,0,0,0,1,1,0,0,1,1), cost:rep(2), crowds:s12(1,1,2,3,2,2,3,3,2,2,1,1) },
  // Campania — Naples/Amalfi; cheapest mainland; higher petty crime; Camorra influence
  'IT-72': { weather: s12(1,1,1,0,0,0,1,1,0,0,1,1), cost:rep(0), safety:rep(1), corrupt:rep(2), beaches:s12(2,2,1,1,0,0,0,0,0,1,2,2) },
  // Puglia — heel of Italy; very affordable; beautiful beaches; less crowded than north
  'IT-75': { weather: s12(1,1,0,0,0,0,1,1,0,0,0,1), cost:rep(0), beaches:s12(2,2,1,0,0,0,0,0,0,1,2,2) },
  // Sicilia — warm, cheap, Mafia-related corruption still present; best in spring/fall
  'IT-82': { weather: s12(1,1,0,0,0,0,0,0,0,0,1,1), cost:rep(0), safety:rep(1), corrupt:rep(2), beaches:s12(2,2,1,0,0,0,0,0,0,1,2,2) },
  // Sardegna — beautiful beaches; very expensive Jul-Aug; deserted in winter
  'IT-88': { weather: s12(2,2,1,0,0,0,0,0,0,0,1,2), cost:rep(2), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,3), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0) },
};

// ─── City markers ─────────────────────────────────────────────────────────────
const CITIES = [
  // ── Southeast Asia ──────────────────────────────────────────────────────────
  mk('Bangkok','TH',13.756,100.502,{
    weather:s12(0,0,0,1,2,3,2,2,1,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,2,2,2,1,1,0,0,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Chiang Mai','TH',18.788,98.993,{
    weather:s12(0,0,1,2,2,3,2,2,1,1,0,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,0,0,0,0,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Phuket','TH',7.878,98.398,{
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,2,2,1,1,1,1,1,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,3,3,3,2,1,0,0), vaccines:rep(1)
  }),
  mk('Koh Samui','TH',9.530,100.063,{
    weather:s12(1,0,0,0,1,2,2,2,2,2,3,2), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,2,2,2,2,2,3,2), vaccines:rep(1)
  }),
  mk('Ho Chi Minh City','VN',10.823,106.630,{
    weather:s12(0,0,0,1,2,3,2,2,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,1,1,1,1,1,1,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Hanoi','VN',21.028,105.854,{
    weather:s12(2,2,1,1,1,2,2,2,2,1,1,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,1,1,1,1,1,1,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Hoi An','VN',15.880,108.335,{
    weather:s12(1,1,1,1,1,2,2,2,2,3,3,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,3,2,2,2,2,2,2,2,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,1,1,2,3,3,1), vaccines:rep(1)
  }),
  mk('Da Nang','VN',16.054,108.202,{
    weather:s12(1,1,1,1,0,0,0,0,1,2,3,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,2,2,2,2,2,1,1,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(0,0,0,0,0,0,0,0,1,2,3,1), vaccines:rep(1)
  }),
  mk('Siem Reap','KH',13.363,103.860,{
    weather:s12(0,0,1,2,2,3,3,3,2,2,1,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(2,2,2,2,1,1,1,1,1,1,1,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Phnom Penh','KH',11.562,104.916,{
    weather:s12(0,0,1,2,2,3,3,3,2,1,1,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(1,1,1,1,1,1,1,1,1,1,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Luang Prabang','LA',19.883,102.135,{
    weather:s12(0,0,1,2,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,2,1,1,0,0,0,0,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Vientiane','LA',17.975,102.600,{
    weather:s12(0,0,1,2,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Bali','ID',-8.340,115.092,{
    weather:s12(2,2,2,1,1,1,0,0,0,1,2,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,2,1,1,1,1,2,2),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,1,0,1,1,0,0,0,0,1,1), vaccines:rep(2)
  }),
  mk('Jakarta','ID',-6.211,106.845,{
    weather:s12(3,3,2,1,1,1,0,0,1,1,2,3), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:rep(2),
    disaster:rep(3), visa:rep(0), lgbtq:rep(3), beaches:rep(2), vaccines:rep(2)
  }),
  mk('Yogyakarta','ID',-7.797,110.370,{
    weather:s12(2,2,2,1,1,1,0,0,1,1,2,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,1,1,1,0,0,0,1,1,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(3), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Lombok','ID',-8.553,116.348,{
    weather:s12(2,2,2,1,1,1,0,0,0,1,2,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,1,0,0,0,0,1,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,1,1,0,0,0,0,0,0), vaccines:rep(2)
  }),
  mk('Manila','PH',14.599,120.984,{
    weather:s12(0,0,0,1,2,2,3,3,2,2,1,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:rep(2),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:rep(2), vaccines:rep(1)
  }),
  mk('Cebu City','PH',10.311,123.893,{
    weather:s12(0,0,0,1,1,2,3,3,2,1,1,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,2,2,2,1,1,1,1,1,1,1,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,1,2,2,1,0,0,0), vaccines:rep(1)
  }),
  mk('El Nido','PH',11.195,119.422,{
    weather:s12(0,0,0,0,1,2,3,3,2,1,1,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(2,2,2,2,1,1,0,0,1,1,1,2),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,2,1,1,0), vaccines:rep(1)
  }),
  mk('Kuala Lumpur','MY',3.140,101.687,{
    weather:s12(1,1,1,1,2,2,2,2,2,2,2,2), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,1,1,1,1,2,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Penang','MY',5.414,100.330,{
    weather:s12(1,1,1,1,2,2,2,2,2,2,2,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,1,1,1,1,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(1,1,1,1,2,2,2,2,2,2,2,1), vaccines:rep(1)
  }),
  mk('Singapore','SG',1.352,103.820,{
    weather:rep(2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:rep(2),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(2), vaccines:rep(0)
  }),
  // ── East Asia ────────────────────────────────────────────────────────────────
  mk('Tokyo','JP',35.682,139.691,{
    weather:s12(1,1,0,0,1,2,2,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(1,0,2,1,1,2,1,2,3,2,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Kyoto','JP',35.012,135.768,{
    weather:s12(1,1,0,0,1,2,2,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(1,0,3,2,1,1,1,2,2,2,2,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Osaka','JP',34.693,135.502,{
    weather:s12(1,1,0,0,1,2,2,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(1,0,2,1,1,2,1,2,2,1,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Seoul','KR',37.566,126.978,{
    weather:s12(1,1,1,1,1,2,1,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,1,1,2,2,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Busan','KR',35.180,129.074,{
    weather:s12(1,1,1,1,1,1,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,1,2,1,1,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), vaccines:rep(0)
  }),
  mk('Taipei','TW',25.041,121.564,{
    weather:s12(1,1,1,1,2,2,3,3,2,1,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,2,2,2,2,1,1,1,1,1,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Hong Kong','HK',22.320,114.170,{
    weather:s12(1,1,1,2,2,2,3,3,2,1,1,1), safety:rep(0), cost:rep(3), family:rep(1), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:rep(3),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(2,2,2,2,1,0,0,1,1,1,2,2), vaccines:rep(0)
  }),
  mk('Shanghai','CN',31.224,121.469,{
    weather:s12(1,1,1,1,1,1,2,2,1,1,1,1), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(2),
    disaster:rep(1), visa:rep(2), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Beijing','CN',39.905,116.391,{
    weather:s12(2,1,1,1,1,1,2,2,1,1,1,2), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,2),
    disaster:rep(1), visa:rep(2), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Chengdu','CN',30.572,104.066,{
    weather:s12(1,1,1,1,2,2,2,2,2,1,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,1),
    disaster:rep(1), visa:rep(2), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Guangzhou','CN',23.130,113.264,{
    // South China trade hub; warm subtropical; visa-friendly entry point
    weather:s12(1,2,2,2,2,2,2,2,2,1,0,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(2),
    disaster:rep(1), visa:rep(2), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Shenzhen','CN',22.543,114.057,{
    // Tech megacity; ultra-modern; near Hong Kong; subtropical
    weather:s12(1,2,2,2,2,2,2,2,2,1,0,1), safety:rep(0), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(0), crowds:rep(2),
    disaster:rep(1), visa:rep(2), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Xi\'an','CN',34.341,108.940,{
    // Terracotta warriors; ancient Silk Road capital; dry continental climate
    weather:s12(2,2,1,1,0,1,1,2,0,0,1,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,2,2,2,2,2,1,1,0,0),
    disaster:rep(1), visa:rep(2), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Fukuoka','JP',33.590,130.401,{
    // Japan's most liveable city; gateway to Korea/China; mild climate; affordable
    weather:s12(1,1,1,1,1,2,2,1,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,1,1,1,1,0,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), vaccines:rep(0)
  }),
  mk('Sapporo','JP',43.064,141.347,{
    // Snow Festival; powder skiing; cooler summers; ramen culture
    weather:s12(3,3,2,1,0,0,0,0,0,0,1,3), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,0,0,0,2,0,0,0,2),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  // ── South Asia ───────────────────────────────────────────────────────────────
  mk('Delhi','IN',28.660,77.228,{
    weather:s12(1,1,1,2,3,3,2,2,2,1,0,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,2,2,2,1,1,2,2,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Mumbai','IN',19.076,72.878,{
    weather:s12(0,0,1,1,2,3,3,3,3,1,0,0), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:rep(3),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(2,2,2,2,3,3,3,3,3,1,1,1), vaccines:rep(2)
  }),
  mk('Goa','IN',15.492,73.826,{
    weather:s12(0,0,0,1,2,3,3,3,3,2,1,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,0,1,1,1,1,1,2,3),
    disaster:rep(2), visa:rep(1), lgbtq:rep(1), beaches:s12(0,0,0,1,2,3,3,3,3,2,1,0), vaccines:rep(1)
  }),
  mk('Jaipur','IN',26.912,75.787,{
    weather:s12(1,1,1,2,3,3,2,2,2,1,0,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(3),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(2,2,1,1,1,1,0,0,1,2,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Kathmandu','NP',27.717,85.316,{
    weather:s12(1,1,1,1,2,3,3,3,2,0,0,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,1,2,1,0,0,1,2,1,0),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Bangalore','IN',12.972,77.594,{
    // India's tech capital at 900m — best climate in India year-round; cosmopolitan
    weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,2,2,1,1,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Chennai','IN',13.082,80.270,{
    // Hot and humid coastal Tamil Nadu; Oct–Dec NE monsoon; good beach access
    weather:s12(0,0,1,1,2,2,2,2,1,2,3,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,2,2,1,1,1,1,1,0),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(1,1,1,1,2,2,1,1,1,2,3,1), vaccines:rep(2)
  }),
  mk('Colombo','LK',6.927,79.861,{
    weather:s12(0,0,1,2,3,3,2,2,2,2,2,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,2,2,2,1,1,1,1,1,1,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(1,1,1,2,3,3,2,2,3,2,1,1), vaccines:rep(1)
  }),
  mk('Malé','MV',4.175,73.509,{
    weather:s12(0,0,0,0,1,2,2,2,1,1,1,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2),
    disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:rep(0), vaccines:rep(1)
  }),
  // ── Middle East ──────────────────────────────────────────────────────────────
  mk('Dubai','AE',25.204,55.270,{
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(2,2,2,1,1,1,1,1,1,2,2,2),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(1,1,1,0,0,3,3,3,1,0,1,1), vaccines:rep(0)
  }),
  mk('Istanbul','TR',41.013,28.979,{
    weather:s12(1,1,1,1,0,0,0,0,0,1,1,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,2,2,2,3,3,2,2,1,0),
    disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(3,3,3,2,1,0,0,0,1,2,3,3), vaccines:rep(1)
  }),
  mk('Tel Aviv','IL',32.066,34.771,{
    weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(2), cost:rep(3), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,2,2,2,2,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2), vaccines:rep(0)
  }),
  mk('Jerusalem','IL',31.769,35.216,{
    weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(2), cost:rep(3), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,3,3,2,1,1,2,2,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Amman','JO',31.956,35.945,{
    weather:s12(1,1,0,0,0,1,1,1,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0),
    disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Muscat','OM',23.614,58.593,{
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(0),
    disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:s12(1,1,1,1,3,3,3,3,3,1,1,1), vaccines:rep(0)
  }),
  mk('Tbilisi','GE',41.694,44.833,{
    weather:s12(1,1,1,1,1,0,0,0,0,1,1,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(1), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  // ── Africa ───────────────────────────────────────────────────────────────────
  mk('Cairo','EG',30.033,31.233,{
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(3),
    remote:rep(2), corrupt:rep(3), health:rep(2), crowds:s12(1,2,2,2,1,1,1,1,1,1,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Marrakech','MA',31.630,-7.981,{
    weather:s12(1,1,0,0,1,1,2,2,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,2,2,2,1,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Nairobi','KE',-1.292,36.821,{
    weather:s12(1,1,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3)
  }),
  mk('Zanzibar','TZ',-6.165,39.199,{
    weather:s12(2,2,2,2,1,0,0,0,1,2,2,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(3), crowds:s12(0,0,1,1,0,0,0,0,0,1,1,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,1,1,1,1,0,0,0,0,0,0), vaccines:rep(3)
  }),
  mk('Cape Town','ZA',-33.924,18.424,{
    weather:s12(1,1,1,0,1,2,2,2,1,0,0,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,0,0,1,2,2,1,0,0,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,2,3,3,2,1,0,0,0), vaccines:rep(1)
  }),
  // ── Europe ───────────────────────────────────────────────────────────────────
  mk('Paris','FR',48.857,2.352,{
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(1), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,3,3,3,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Barcelona','ES',41.383,2.183,{
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,3,3,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,2,1,1,0,0,0,0,1,2,3), vaccines:rep(0)
  }),
  mk('Lisbon','PT',38.722,-9.139,{
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,2,2,2,3,3,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,1,1,0,0,0,0,0,0,1,2), vaccines:rep(0)
  }),
  mk('Amsterdam','NL',52.370,4.895,{
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,3,2,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Prague','CZ',50.076,14.418,{
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,3,3,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Budapest','HU',47.497,19.040,{
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,3,3,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Berlin','DE',52.520,13.405,{
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,1,2,2,2,2,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Rome','IT',41.897,12.482,{
    weather:s12(1,1,1,0,0,0,1,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,3,2,2,3,3,2,2,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Athens','GR',37.984,23.728,{
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,2,2,2,3,3,2,2,1,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,2), vaccines:rep(0)
  }),
  mk('Dubrovnik','HR',42.651,18.094,{
    weather:s12(2,2,1,1,0,0,0,0,0,1,1,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(1), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,2,1,0,0,0,0,1,2,3), vaccines:rep(0)
  }),
  mk('London','GB',51.507,-0.127,{
    // Grey, mild, frequently overcast; one of Europe's most expensive cities
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,3,3,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,3,2,2,2,3,3,3,3), vaccines:rep(0)
  }),
  mk('Edinburgh','GB',55.953,-3.189,{
    // Colder and wetter than London; dramatically cheaper; world-class culture
    weather:s12(2,2,2,2,1,1,1,1,1,2,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,1,2,3,3,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Vienna','AT',48.208,16.373,{
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,2),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Reykjavik','IS',64.133,-21.895,{
    // Sub-arctic; dramatic landscape; extremely expensive
    weather:s12(3,3,2,2,1,1,1,1,2,2,3,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Marseille','FR',43.296,5.370,{
    // Mediterranean coast — hot dry summers; gritty, affordable; North Africa influence
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,3,3,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,2), vaccines:rep(0)
  }),
  mk('Nice','FR',43.710,7.262,{
    // French Riviera: excellent weather, expensive in summer peak
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,3,3,2,2,1,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,2,1,0,0,0,0,0,1,2,3), vaccines:rep(0)
  }),
  mk('Lyon','FR',45.748,4.847,{
    // France's culinary capital; affordable vs Paris; good rail links
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Bordeaux','FR',44.838,-0.578,{
    // Atlantic coast; wine region; pleasant year-round
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,1,2,2,2,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,2,1,0,0,0,0,0,1,2,3), vaccines:rep(0)
  }),
  mk('Munich','DE',48.135,11.582,{
    // Expensive German city; Alpine access; Oktoberfest; liveable
    weather:s12(2,2,1,1,0,0,0,0,0,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,1,2,2,2,2,2,2,3,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Hamburg','DE',53.551,10.000,{
    // Maritime gateway; milder than Berlin; mid-cost; vibrant arts scene
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,1,2,2,2,2,2,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Madrid','ES',40.416,-3.703,{
    // Hot dry continental summers; affordable vs London/Paris
    weather:s12(1,1,1,0,0,1,1,1,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,2,2,2,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Seville','ES',37.389,-5.985,{
    // Hottest city in mainland Europe Jul–Aug (45 °C possible); magical spring/fall
    weather:s12(1,1,0,0,0,2,3,3,1,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,2,2,1,1,1,1,2,1,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,2,1,0,0,0,0,1,2,3,3), vaccines:rep(0)
  }),
  mk('Valencia','ES',39.470,-0.376,{
    // Sunniest major European city; beach access; more affordable than Barcelona
    weather:s12(1,1,0,0,0,0,0,0,0,0,0,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,1,1,0,0,0,0,0,0,1,2), vaccines:rep(0)
  }),
  mk('Milan','IT',45.465,9.186,{
    // Italy's most expensive city; fashion/finance hub; Alpine proximity
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,2,2,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Florence','IT',43.769,11.256,{
    // Renaissance art; extremely overcrowded May–Sep; great spring/fall
    weather:s12(1,1,1,1,1,0,0,0,0,1,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,3,3,3,3,3,3,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Venice','IT',45.441,12.315,{
    // Unique city; flood-prone; premium prices; avoid Jul–Aug cruise crowds
    weather:s12(1,1,1,1,1,0,0,0,0,1,1,2), safety:rep(0), cost:rep(3), family:rep(1), solo:rep(0),
    remote:rep(2), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,3,3,3,3,3,3,2,2,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Naples','IT',40.851,14.268,{
    // Affordable Italy; pizza capital; chaotic; Vesuvius nearby
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,2,1,0,0,0,0,0,1,2,3), vaccines:rep(0)
  }),
  mk('Porto','PT',41.157,-8.629,{
    // Charming; one of Europe's best-value cities; mild Atlantic climate
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,3,3,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,1,1,0,0,0,0,0,0,1,2), vaccines:rep(0)
  }),
  mk('Copenhagen','DK',55.676,12.568,{
    // Expensive Scandinavian capital; cycling-friendly; very high quality of life
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,3,2,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Stockholm','SE',59.330,18.068,{
    // Beautiful archipelago city; very expensive; bright summer; dark winter
    weather:s12(3,2,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,1,2,3,3,1,0,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Dublin','IE',53.344,-6.267,{
    // Rainy but friendly; expensive; great pub culture
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Brussels','BE',50.850,4.351,{
    // EU capital; mid-cost; multicultural; grey winters
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Warsaw','PL',52.237,21.017,{
    // Fast-growing; excellent value; cold winters; welcoming for remote workers
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Krakow','PL',50.062,19.940,{
    // Best-value city in Central Europe; beautiful Old Town; cold winters
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,2,2,2,3,3,2,2,1,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Tallinn','EE',59.437,24.754,{
    // Medieval gem; affordable; cold dark winters; thriving digital scene
    weather:s12(3,2,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,1,2,3,3,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Zurich','CH',47.378,8.540,{
    // World's most expensive city; exceptionally clean and efficient
    weather:s12(2,2,1,1,0,0,0,0,0,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Split','HR',43.508,16.440,{
    // Adriatic gateway; cheaper than Dubrovnik; excellent summer
    weather:s12(2,2,1,1,0,0,0,0,0,1,1,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,2,1,0,0,0,0,1,2,3), vaccines:rep(0)
  }),
  // ── Americas ─────────────────────────────────────────────────────────────────
  mk('New York','US',40.712,-74.006,{
    weather:s12(2,2,1,1,0,0,0,0,0,1,1,2), safety:rep(1), cost:rep(3), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), vaccines:rep(0)
  }),
  mk('Miami','US',25.774,-80.194,{
    weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(1), cost:rep(3), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(2,2,2,2,1,1,1,1,1,1,2,2),
    disaster:rep(2), visa:rep(1), lgbtq:rep(0), beaches:s12(1,1,1,1,1,1,1,1,1,1,1,1), vaccines:rep(0)
  }),
  // ── USA — city-level granularity (weather, cost, safety vary significantly) ──
  mk('Los Angeles','US',34.052,-118.244,{
    weather:s12(0,0,0,0,0,0,0,0,0,0,0,0), safety:rep(1), cost:rep(3), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(0), beaches:s12(0,0,0,0,0,0,0,0,0,0,0,0), vaccines:rep(0)
  }),
  mk('San Francisco','US',37.774,-122.419,{
    // Mild Mediterranean coast — noticeably cooler than inland CA all year
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(2), cost:rep(3), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,1,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0)
  }),
  mk('Bakersfield','US',35.373,-119.019,{
    // Central Valley: 40 °C+ summers — much hotter and cheaper than coastal CA
    weather:s12(0,0,1,1,1,2,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(1), crowds:rep(0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Sacramento','US',38.582,-121.494,{
    // Inland valley — hot dry summers, mild winters; moderately priced
    weather:s12(0,0,1,1,1,1,3,3,2,1,0,0), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,1,1,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Las Vegas','US',36.175,-115.137,{
    // Desert: extreme heat Jun–Sep; cheap accommodation, poor walkability
    weather:s12(0,1,1,1,1,2,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(2), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(2,2,2,2,2,1,1,1,2,2,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Seattle','US',47.607,-122.331,{
    // Rainy but mild; excellent summer; expensive tech-hub city
    weather:s12(2,2,2,1,1,0,0,0,1,1,2,2), safety:rep(1), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,2,1,1,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0)
  }),
  mk('Denver','US',39.739,-104.984,{
    // Mile-high: variable weather, cold snaps Oct–Apr; growing but moderate cost
    weather:s12(1,1,1,1,1,0,0,0,0,1,1,1), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,1,2,2,2,2,2,1,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Chicago','US',41.881,-87.623,{
    // Brutally cold winters and wind; good summer; mid-high cost
    weather:s12(3,2,2,1,1,0,0,0,0,1,1,3), safety:rep(2), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,2,1,1,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,0,0,1,3,3,3), vaccines:rep(0)
  }),
  mk('Boston','US',42.360,-71.059,{
    // Cold winters, pleasant fall/spring; one of the most expensive US cities
    weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(1), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,2,2,2,2,2,2,2,1,0),
    disaster:rep(0), visa:rep(1), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0)
  }),
  mk('Worcester','US',42.262,-71.802,{
    // Same climate as Boston but significantly cheaper; few tourists
    weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(0),
    disaster:rep(0), visa:rep(1), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Austin','US',30.267,-97.743,{
    // Hot summers (≥38 °C Jul–Aug), mild winters; fast-growing, moderately expensive
    weather:s12(1,1,1,1,2,2,3,3,2,1,1,1), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,1,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Houston','US',29.760,-95.370,{
    // Humid subtropical: sweltering summers; hurricane risk; affordable
    weather:s12(1,1,1,2,2,2,3,3,3,2,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(1), crowds:s12(0,0,1,1,2,2,1,1,1,1,0,0),
    disaster:rep(3), visa:rep(1), lgbtq:rep(1), beaches:s12(2,2,2,2,2,2,3,3,3,2,2,2), vaccines:rep(0)
  }),
  mk('New Orleans','US',29.951,-90.071,{
    // Hot and very humid Jun–Sep; hurricane season; affordable; rich culture
    weather:s12(1,1,1,2,2,2,3,3,3,2,1,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,2,3,2,1,1,1,1,1,2,2),
    disaster:rep(3), visa:rep(1), lgbtq:rep(1), beaches:s12(2,2,2,2,2,3,3,3,3,2,2,2), vaccines:rep(0)
  }),
  mk('Nashville','US',36.162,-86.782,{
    // Four distinct seasons; hot humid summers; affordable, rapidly gentrifying
    weather:s12(1,1,2,1,1,0,1,1,0,1,1,2), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Phoenix','US',33.448,-112.074,{
    // Sonoran Desert: brutal dry heat Jun–Sep (45 °C); excellent Nov–Apr
    weather:s12(0,0,0,1,2,3,3,3,3,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(2,2,2,1,1,0,0,0,1,2,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Portland','US',45.523,-122.676,{
    // Mild rainy winters; excellent warm dry summer; moderately expensive
    weather:s12(2,2,2,1,1,0,0,0,1,1,2,2), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,2,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), vaccines:rep(0)
  }),
  mk('San Diego','US',32.716,-117.163,{
    // Near-perfect weather year-round; expensive but less than LA; Navy city
    weather:s12(0,0,0,0,0,0,0,0,0,0,0,0), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:s12(0,0,0,0,0,0,0,0,0,0,0,0), vaccines:rep(0)
  }),
  mk('Minneapolis','US',44.978,-93.265,{
    // Extremely cold winters; excellent culture and lakes; mid-cost
    weather:s12(3,3,3,2,1,0,0,0,1,1,2,3), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,0,1,1,2,2,2,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Dallas','US',32.776,-96.797,{
    // Hot Dallas summers; sprawling metro; business hub; tornado risk
    weather:s12(1,1,1,1,2,2,3,3,2,1,1,1), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,1,2,2,1,1,1,1,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Atlanta','US',33.749,-84.388,{
    // Hot humid summers; international airport; significant cost variation by area
    weather:s12(1,1,1,0,1,1,2,2,1,0,0,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,2,1,1,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Orlando','US',28.538,-81.379,{
    // Theme park capital; hot humid summers; hurricane season; very busy
    weather:s12(1,1,0,0,1,2,2,2,2,1,1,1), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(3,3,2,2,2,2,2,2,2,2,3,3),
    disaster:rep(2), visa:rep(1), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Charlotte','US',35.227,-80.843,{
    // Fast-growing banking hub; mild four seasons; mid-cost
    weather:s12(1,1,1,1,0,0,1,1,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Salt Lake City','US',40.760,-111.891,{
    // Gateway to Utah's parks; cold winters; near-perfect powder skiing
    weather:s12(1,1,1,1,1,1,2,2,1,0,0,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,1,2,2,1,1,1,1,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Indianapolis','US',39.769,-86.158,{
    // Affordable Midwest hub; cold winters; F1/IndyCar racing
    weather:s12(2,2,1,1,1,0,1,1,0,1,1,2), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,0,1,1,2,1,1,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Detroit','US',42.331,-83.046,{
    // Very affordable; industrial revival; brutal winters; excellent music/food
    weather:s12(3,3,2,1,1,0,0,0,1,1,2,3), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(0), crowds:s12(0,0,0,1,1,2,2,2,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('San Antonio','US',29.425,-98.494,{
    // Affordable Texas city; River Walk; hot summers but less intense than Dallas
    weather:s12(1,1,1,1,2,2,3,3,2,1,1,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,1,2,2,1,1,1,1,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Honolulu','US',21.307,-157.858,{
    // Tropical paradise; premium cost; ideal year-round weather
    weather:s12(0,0,0,0,0,0,0,0,0,0,0,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(2,2,2,2,1,1,1,1,1,2,2,2),
    disaster:rep(2), visa:rep(1), lgbtq:rep(0), beaches:s12(0,0,0,0,0,0,0,0,0,0,0,0), vaccines:rep(0)
  }),
  mk('Mexico City','MX',19.433,-99.133,{
    weather:s12(1,1,1,1,2,1,1,1,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(1), crowds:s12(1,2,1,1,1,1,0,0,1,1,2,2),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Playa del Carmen','MX',20.628,-87.080,{
    weather:s12(0,0,0,1,2,1,1,1,2,1,0,0), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,1,1,1,1,1,1,0,0), vaccines:rep(1)
  }),
  mk('Cancún','MX',21.161,-86.851,{
    weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(2), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(3,2,2,2,1,1,1,1,1,1,2,3),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,1,2,2,2,1,1,0,0), vaccines:rep(1)
  }),
  mk('Medellín','CO',6.251,-75.564,{
    weather:s12(0,1,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(0), corrupt:rep(3), health:rep(2), crowds:s12(1,1,1,1,1,0,0,0,0,1,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Cartagena','CO',10.391,-75.479,{
    weather:s12(0,0,0,1,1,1,0,0,0,0,1,0), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(2,2,1,1,1,0,0,0,0,1,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,1,1,0,0,0,0,1,0), vaccines:rep(2)
  }),
  mk('Buenos Aires','AR',-34.610,-58.370,{
    weather:s12(1,1,0,1,2,2,2,2,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Rio de Janeiro','BR',-22.907,-43.173,{
    weather:s12(2,2,2,2,1,1,0,0,1,2,2,2), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(2,3,1,1,1,1,1,1,1,1,1,2),
    disaster:rep(2), visa:rep(1), lgbtq:rep(1), beaches:s12(0,0,0,1,1,2,2,2,1,0,0,0), vaccines:rep(2)
  }),
  mk('Cusco','PE',-13.531,-71.967,{
    weather:s12(0,0,1,1,1,2,2,2,1,0,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,0,1,1,1,1,1,2,2,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Lima','PE',-12.046,-77.043,{
    // Pacific coast capital; perpetual grey overcast Jun-Oct; South America's best food scene
    weather:s12(0,0,1,1,1,2,2,2,1,0,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,1,1,1,1,1,1,2,2,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(2,2,1,1,1,2,3,3,2,1,1,2), vaccines:rep(2)
  }),
  mk('Bogota','CO',4.711,-74.073,{
    // High-altitude capital at 2,600m; transformed safety; cool climate year-round; thriving food scene
    weather:s12(1,2,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(0), corrupt:rep(3), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Santiago','CL',-33.459,-70.648,{
    // South America's most developed city; Andes access; wine country nearby; earthquake-prone
    weather:s12(1,1,0,0,1,2,2,2,1,0,0,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(1,1,0,0,1,1,1,1,1,0,0,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Quito','EC',-0.229,-78.524,{
    // Equatorial capital at 2,850m; near-perfect spring climate year-round; Galapagos gateway
    weather:s12(1,2,2,1,1,0,0,0,1,2,1,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,0),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Havana','CU',23.135,-82.358,{
    // Frozen-in-time capital; vibrant music and art; very limited internet; genuinely unique
    weather:s12(0,0,0,1,1,2,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(3), corrupt:rep(3), health:rep(1), crowds:s12(0,0,0,1,1,1,1,1,0,0,0,0),
    disaster:rep(2), visa:rep(2), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,1,0,0,0), vaccines:rep(1)
  }),
  mk('Guadalajara','MX',20.676,-103.347,{
    // Mexico's cultural capital; tequila and mariachi heartland; safer than CDMX; colonial charm
    weather:s12(0,0,1,1,2,1,1,1,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(1), crowds:s12(0,0,1,1,1,1,1,1,1,1,1,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(1)
  }),
  // ── Africa (new) ─────────────────────────────────────────────────────────────
  mk('Johannesburg','ZA',-26.205,28.049,{
    // Africa's economic hub; world-class food and arts; among the world's highest crime rates
    weather:s12(1,1,1,0,1,2,2,2,1,0,0,1), safety:rep(3), cost:rep(1), family:rep(2), solo:rep(3),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,0,0,1,1,2,2,1,0,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Lagos','NG',6.524,3.379,{
    // Africa's largest city; raw energy; serious safety concerns; major trade hub
    weather:s12(1,1,2,2,3,3,3,3,2,2,1,1), safety:rep(3), cost:rep(2), family:rep(3), solo:rep(3),
    remote:rep(2), corrupt:rep(3), health:rep(3), crowds:rep(3),
    disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:s12(1,1,1,2,3,3,3,3,2,2,1,1), vaccines:rep(3)
  }),
  mk('Accra','GH',5.614,-0.205,{
    // West Africa's most welcoming capital; English-speaking; stable democracy; rising tech scene
    weather:s12(1,2,2,2,3,3,2,2,2,1,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(1,1,1,2,3,3,2,2,2,1,1,1), vaccines:rep(3)
  }),
  mk('Addis Ababa','ET',8.995,38.763,{
    // High-altitude capital at 2,400m; Africa's diplomatic centre; improving infrastructure
    weather:s12(1,1,2,2,3,3,2,2,2,1,0,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0),
    disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(3)
  }),
  mk('Dakar','SN',14.693,-17.447,{
    // West Africa's cultural capital; ocean breezes keep temperatures bearable; friendly and safe
    weather:s12(1,1,1,1,2,3,3,3,3,2,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,1,2,2,2,2,1,0,0), vaccines:rep(3)
  }),
  mk('Casablanca','MA',33.573,-7.589,{
    // Morocco's business capital; less touristy than Marrakech; cosmopolitan Atlantic city
    weather:s12(1,1,0,0,1,1,1,1,1,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,1,1,1,1,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(1,1,1,0,0,0,0,0,0,0,1,1), vaccines:rep(1)
  }),
  mk('Kigali','RW',-1.941,30.060,{
    // Cleanest city in Africa; remarkable post-genocide development; very safe; gorilla trekking base
    weather:s12(1,1,2,2,1,0,0,0,1,2,2,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(2), crowds:rep(0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Mombasa','KE',-4.043,39.668,{
    // Kenya's coastal city; Swahili culture; Old Town; Indian Ocean beaches; less safe than Nairobi
    weather:s12(1,1,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,1,1,1,0,0,0,0,1,1,0), vaccines:rep(3)
  }),
  // ── Central Asia (new) ────────────────────────────────────────────────────────
  mk('Almaty','KZ',43.238,76.896,{
    // Kazakhstan's financial hub; Tian Shan ski resorts nearby; excellent food scene; cold winters
    weather:s12(3,2,1,1,0,0,0,0,0,1,2,3), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Tashkent','UZ',41.300,69.240,{
    // Modernised Silk Road capital; Soviet architecture meets new developments; very affordable
    weather:s12(1,1,1,1,2,3,3,3,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Samarkand','UZ',39.655,66.975,{
    // Legendary Silk Road city; Registan and Bibi-Khanym; unmissable blue-tiled architecture
    weather:s12(1,1,1,1,2,3,3,3,1,0,0,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(3), health:rep(1), crowds:s12(0,0,1,1,2,2,2,2,2,1,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), vaccines:rep(1)
  }),
  mk('Bishkek','KG',42.870,74.590,{
    // Central Asian nomadic gateway; Tian Shan trekking; very cheap; limited urban infrastructure
    weather:s12(3,2,1,1,0,0,0,0,0,1,2,3), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:rep(3), vaccines:rep(1)
  }),
  // ── South Asia (new) ─────────────────────────────────────────────────────────
  mk('Kolkata','IN',22.573,88.364,{
    // India's most intellectual city; extreme monsoon flooding; very affordable; intense atmosphere
    weather:s12(1,1,2,2,3,3,3,3,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:rep(2),
    disaster:rep(3), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Varanasi','IN',25.318,83.007,{
    // One of the world's oldest inhabited cities; Ganges ghats; spiritually intense
    weather:s12(1,1,2,2,3,3,2,2,2,1,0,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,2,2,2,1,1,2,2,2,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), vaccines:rep(2)
  }),
  mk('Lahore','PK',31.552,74.343,{
    // Pakistan's cultural capital; Mughal architecture; Lahori cuisine; safety improving steadily
    weather:s12(1,1,2,2,3,3,3,3,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3),
    remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(1),
    disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(3), vaccines:rep(2)
  }),
  // ── Southeast Asia (new) ──────────────────────────────────────────────────────
  mk('Nha Trang','VN',12.242,109.194,{
    // Vietnam's beach resort city; clear blue water; international party scene
    weather:s12(1,1,1,0,0,0,0,0,1,2,2,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,1,1,0,0,0,1,2,2,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(0,0,0,0,0,0,0,0,1,2,2,0), vaccines:rep(1)
  }),
  mk('Kota Kinabalu','MY',5.840,116.047,{
    // Borneo gateway; world-class diving; orangutan encounters; affordable island hopping
    weather:s12(1,1,1,2,2,2,2,1,1,1,2,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,1,1,0,0,0,0,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,1,1,2,1,0,0,0,1,1), vaccines:rep(2)
  }),
  mk('Yangon','MM',16.867,96.195,{
    // Myanmar's largest city; Shwedagon Pagoda; military junta control; check current advisories
    weather:s12(0,0,1,2,2,3,3,3,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2),
    remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0),
    disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(2), vaccines:rep(2)
  }),
  // ── Middle East (new) ─────────────────────────────────────────────────────────
  mk('Riyadh','SA',24.688,46.722,{
    // Saudi capital; Vision 2030 rapid change; still strict dress and behaviour codes
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(0), crowds:s12(0,0,0,1,1,1,1,1,1,1,0,0),
    disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:rep(3), vaccines:rep(0)
  }),
  mk('Doha','QA',25.286,51.533,{
    // Ultra-modern Gulf capital; FIFA World Cup legacy; expensive; strict laws but tolerant of tourists
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(2), vaccines:rep(0)
  }),
];

// ─── Border crossings ─────────────────────────────────────────────────────────
const BORDERS = [
  // ── Thailand ─────────────────────────────────────────────────────────────────
  bc('Mae Sai / Tachileik','TH','MM',20.437,99.882,'restricted','06:00–18:00','Day-pass only; deep entry restricted'),
  bc('Mae Sot / Myawaddy','TH','MM',16.716,98.574,'restricted','06:00–18:00','Limited access; check current advisories'),
  bc('Three Pagodas Pass','TH','MM',15.304,98.374,'closed','Closed','Closed indefinitely to foreign visitors'),
  bc('Nong Khai / Vientiane','TH','LA',17.876,102.741,'open','06:00–22:00','Friendship Bridge; main Mekong crossing'),
  bc('Mukdahan / Savannakhet','TH','LA',16.538,104.726,'open','06:00–20:00','Second Friendship Bridge'),
  bc('Chong Mek / Pakse','TH','LA',15.143,105.447,'open','06:00–18:00','Southern Laos gateway'),
  bc('Aranyaprathet / Poipet','TH','KH',13.692,102.547,'open','07:00–20:00','Busy land border; exercise caution in the area'),
  bc('Hat Lek / Cham Yeam','TH','KH',11.724,102.901,'open','07:00–20:00','Coastal crossing to Koh Kong'),
  bc('Sadao / Bukit Kayu Hitam','TH','MY',6.635,100.430,'open','24 hours','Main highway crossing; high traffic volume'),
  bc('Padang Besar','TH','MY',6.652,100.308,'open','05:00–24:00','Rail and road crossing'),
  bc('Sungai Kolok / Rantau Panjang','TH','MY',6.029,101.966,'open','06:00–21:00','East-coast crossing; verify regional security'),
  // ── Vietnam ──────────────────────────────────────────────────────────────────
  bc('Moc Bai / Bavet','VN','KH',11.048,106.005,'open','06:00–22:00','Main Saigon–Phnom Penh road crossing'),
  bc('Xa Mat / Trapeang Phlong','VN','KH',11.776,105.947,'open','07:00–18:00','Secondary crossing; lower traffic'),
  bc('Lao Bao / Dansavanh','VN','LA',16.619,106.597,'open','07:00–18:00','Ho Chi Minh Trail gateway to Laos'),
  bc('Nam Phao / Cau Treo','VN','LA',18.258,105.124,'open','07:00–18:00','Central Vietnam to Laos'),
  bc('Lao Cai / Hekou','VN','CN',22.505,103.971,'open','07:00–22:00','Main crossing to Yunnan province'),
  bc('Mong Cai / Dongxing','VN','CN',21.527,107.968,'open','07:00–21:00','Busy northern trade border'),
  // ── Singapore / Malaysia ─────────────────────────────────────────────────────
  bc('Woodlands / Johor Bahru','SG','MY',1.440,103.769,'open','24 hours','One of the world\'s busiest land crossings'),
  bc('Tuas Second Link','SG','MY',1.330,103.638,'open','24 hours','Western causeway; lighter traffic than Woodlands'),
  // ── Malaysia / Indonesia ─────────────────────────────────────────────────────
  bc('Entikong / Tebedu','MY','ID',1.124,109.972,'open','07:00–17:00','Borneo overland; Kuching to Pontianak'),
  // ── Israel / Jordan / Egypt ──────────────────────────────────────────────────
  bc('Sheikh Hussein / Jordan River','IL','JO',32.618,35.549,'open','08:00–20:00','Northern crossing; quieter than Allenby'),
  bc('King Hussein / Allenby Bridge','IL','JO',31.888,35.546,'restricted','08:00–20:00','Complex protocols; confirm requirements in advance'),
  bc('Wadi Araba / Eilat–Aqaba','IL','JO',29.545,34.948,'open','08:00–20:00','Southern crossing near resort areas'),
  bc('Taba / Eilat','EG','IL',29.492,34.896,'open','24 hours','Sinai crossing into Egypt'),
  // ── Americas ─────────────────────────────────────────────────────────────────
  bc('San Ysidro / Tijuana','US','MX',32.542,-117.035,'open','24 hours','World\'s busiest land port of entry'),
  bc('El Paso / Ciudad Juárez','US','MX',31.759,-106.492,'open','24 hours','Major Texas–Chihuahua crossing'),
  bc('Laredo / Nuevo Laredo','US','MX',27.524,-99.489,'open','24 hours','Largest commercial trade crossing'),
  bc('Hidalgo / Reynosa','US','MX',26.097,-98.261,'open','24 hours','Rio Grande Valley crossing'),
  bc('Niagara Falls Rainbow Bridge','US','CA',43.087,-79.068,'open','24 hours','Iconic Niagara gateway'),
  bc('Detroit / Windsor Ambassador Bridge','US','CA',42.322,-83.040,'open','24 hours','Busiest US–Canada crossing by trade value'),
  bc('Peace Arch — Blaine','US','CA',48.993,-122.753,'open','24 hours','Pacific coast crossing; typically short waits'),
  bc('Desaguadero','PE','BO',-16.560,-69.048,'open','06:00–21:00','Lake Titicaca border; Puno to La Paz'),
  bc('Paso Los Libertadores','AR','CL',-32.832,-70.084,'open','24 hours','Main Andes highway crossing'),
  bc('Foz do Iguaçu / Ciudad del Este','BR','PY',-25.560,-54.587,'open','24 hours','Triple-border crossing point'),
  bc('Chuy / Chui','BR','UY',-33.685,-53.462,'open','24 hours','Quiet coastal crossing with free-trade zone'),
  // ── Africa ───────────────────────────────────────────────────────────────────
  bc('Beit Bridge','ZA','ZW',-22.221,30.002,'open','06:00–22:00','Busiest sub-Saharan Africa land crossing'),
  bc('Namanga','KE','TZ',-2.543,36.789,'open','06:00–22:00','Nairobi to Arusha; safari gateway'),
  bc('Malaba','KE','UG',0.632,34.259,'open','07:00–18:00','Main Kenya–Uganda highway crossing'),
  bc('Katuna / Gatuna','RW','UG',-1.116,30.152,'open','06:00–22:00','Kigali to Kampala; well-maintained road'),
  bc('Victoria Falls Bridge','ZM','ZW',-17.931,25.844,'open','06:00–20:00','Bridge crossing adjacent to the falls'),
  bc('Kasumbalesa','CD','ZM',-11.213,27.790,'restricted','06:00–18:00','Copper-belt crossing; expect significant delays'),
  bc('Salloum / Amsaed','EG','LY',31.558,25.168,'restricted','08:00–18:00','Libya border; check current government advisories'),
  bc('Oujda / Zouj Bghal','MA','DZ',34.672,-1.911,'closed','Closed','Closed since 1994; no crossing permitted'),
  bc('Ceuta — Tarajal','MA','ES',35.889,-5.320,'open','24 hours','Spanish enclave; Schengen area entry point'),
  bc('Melilla — Beni Enzar','MA','ES',35.291,-2.963,'open','24 hours','Spanish enclave; EU territory crossing'),
  // ── Caucasus ─────────────────────────────────────────────────────────────────
  bc('Lars / Russian Military Highway','GE','RU',42.637,44.602,'restricted','09:00–18:00','Restricted; verify eligibility before travel'),
  bc('Bagratashen / Akarak','GE','AM',41.189,44.800,'open','24 hours','Main Georgia–Armenia highway crossing'),
  bc('Red Bridge / Shixov','GE','AZ',41.340,45.348,'open','24 hours','Main Georgia–Azerbaijan highway crossing'),
  bc('Agarak / Norduz','AM','IR',38.870,46.153,'open','09:00–20:00','Armenia–Iran; limited traveller traffic'),
  // ── Central Asia ─────────────────────────────────────────────────────────────
  bc('Korgas','KZ','CN',44.168,80.374,'open','09:00–18:00','Silk Road gateway to Xinjiang'),
  bc('Torugart Pass','KG','CN',40.522,75.405,'restricted','09:00–16:00','High altitude; pre-arranged permits required'),
  bc('Friendship Bridge — Termez','UZ','AF',37.241,67.270,'restricted','08:00–17:00','Humanitarian access only; tourists not admitted'),
  bc('Irkeshtam','KG','CN',39.667,73.895,'open','09:00–17:00','Southern Xinjiang route; seasonal closure possible'),
  // ── Europe ───────────────────────────────────────────────────────────────────
  bc('Medyka / Shehyni','PL','UA',49.800,22.872,'open','24 hours','Main Poland–Ukraine crossing; high wartime use'),
  bc('Siret / Porubne','RO','UA',47.921,26.073,'open','24 hours','Romania–Ukraine crossing; humanitarian traffic'),
  bc('Horgos / Röszke','RS','HU',46.177,19.976,'open','24 hours','Main Serbia–Hungary motorway crossing'),
  bc('Bruzgi / Kuznica','BY','PL',53.394,23.851,'closed','Closed','Closed to tourist traffic; security exclusion zone'),

  // ── Europe — Schengen / EU external ──────────────────────────────────────────
  bc('Vaalimaa / Torfyanovka','FI','RU',60.724,27.813,'closed','Closed','Closed since 2023; all Finnish–Russian border crossings shut'),
  bc('Nuijamaa / Brusnichnoe','FI','RU',61.057,28.584,'closed','Closed','Closed since 2023'),
  bc('Imatra / Svetogorsk','FI','RU',61.172,28.773,'closed','Closed','Closed since 2023'),
  bc('Narva / Ivangorod','EE','RU',59.376,28.194,'restricted','07:00–21:00','Freight only since 2023; tourist access suspended'),
  bc('Terehova / Burachki','LV','RU',56.832,27.622,'closed','Closed','Closed since 2023'),
  bc('Kybartai / Nesterov','LT','RU',54.638,22.752,'closed','Closed','Kaliningrad transit; closed since 2023'),
  bc('Terespol / Brest','PL','BY',52.075,23.606,'restricted','24 hours','Humanitarian and freight only; razor-wire exclusion zone in effect'),
  bc('Vyšné Nemecké / Uzhhorod','SK','UA',48.607,22.152,'open','24 hours','Main Slovakia–Ukraine road crossing'),
  bc('Záhony / Chop','HU','UA',48.396,22.182,'open','24 hours','Main Hungary–Ukraine road and rail crossing'),
  bc('Albița / Leușeni','RO','MD',46.551,28.226,'open','24 hours','Main Romania–Moldova crossing'),
  bc('Palanca','MD','UA',46.418,29.960,'open','24 hours','Main Moldova–Ukraine southern crossing'),

  // ── Balkans / Western Balkans ─────────────────────────────────────────────────
  bc('Merdare','RS','XK',43.227,21.390,'restricted','07:00–22:00','Kosovo not recognized by Serbia; passport protocols differ by direction'),
  bc('Bratunac / Ljubovija','BA','RS',44.012,19.345,'open','06:00–22:00','Drina River crossing between Bosnia and Serbia'),
  bc('Dobrakovo','ME','RS',42.959,19.764,'open','24 hours','Main Montenegro–Serbia motorway crossing'),
  bc('Evzoni / Gevgelija','GR','MK',41.133,22.582,'open','24 hours','Main E75 highway crossing between Greece and North Macedonia'),
  bc('Kakavijë / Kakavia','AL','GR',40.090,20.363,'open','24 hours','Primary Albania–Greece road crossing'),
  bc('Hani i Hotit','AL','ME',42.282,19.487,'open','06:00–22:00','Albania–Montenegro crossing near Lake Shkodër'),

  // ── Turkey borders ────────────────────────────────────────────────────────────
  bc('Sarp / Sarpi','TR','GE',41.494,41.505,'open','24 hours','Main Turkey–Georgia crossing; Batumi gateway'),
  bc('Doğukapı / Akyaka','TR','AM',40.036,43.566,'closed','Closed','Closed since 1993; Armenia–Turkey border sealed'),
  bc('Gürbulak / Razi','TR','IR',39.380,44.414,'open','24 hours','Main Turkey–Iran truck route'),
  bc('Habur / Ibrahim Khalil','TR','IQ',37.205,42.349,'open','24 hours','Main Turkey–Iraq road crossing'),
  bc('Cilvegözü / Bab al-Hawa','TR','SY',36.636,36.648,'restricted','Daylight hours','Humanitarian and repatriation traffic only'),
  bc('Kapitan Andreevo / Kapıkule','TR','BG',41.710,26.342,'open','24 hours','Busiest Turkey–EU road crossing'),
  bc('Pazarkule / Kastanies','TR','GR',41.669,26.494,'restricted','Variable','Subject to closure due to irregular migration pressure; verify before travel'),

  // ── Middle East / North Africa ────────────────────────────────────────────────
  bc('Khosravi / Khanaqin','IQ','IR',34.350,45.464,'open','07:00–21:00','Iraq–Iran crossing on the Baghdad–Tehran route'),
  bc('Trebil / Karameh','IQ','JO',32.680,38.194,'open','08:00–20:00','Trans-desert highway; Jordan–Iraq'),
  bc('Durra / Haditha','JO','SA',29.533,36.011,'open','08:00–17:00','Jordan–Saudi Arabia; check permit requirements'),
  bc('Rafah','EG','GZ',31.277,34.261,'closed','Closed','Closed due to crisis; intermittent humanitarian openings only'),
  bc('Rosh HaNikra / Naqoura','IL','LB',33.084,35.116,'closed','Closed','All Israel–Lebanon crossings closed'),
  bc('Masnaa / Jdeidat Yabus','LB','SY',33.629,35.997,'open','08:00–20:00','Main Beirut–Damascus road; verify current conditions'),
  bc('Guerguerat','MA','MR',21.336,-16.996,'open','24 hours','Trans-Sahara route; Mauritania gateway'),
  bc('Bab el-Assa','DZ','TN',36.654,8.306,'open','06:00–20:00','Main Algeria–Tunisia northern crossing'),
  bc('Ras Ajdir','TN','LY',33.153,11.515,'open','07:00–19:00','Main Tunisia–Libya crossing; check travel advisories'),

  // ── Sub-Saharan Africa ────────────────────────────────────────────────────────
  bc('Moyale','ET','KE',3.528,39.057,'open','06:00–18:00','Ethiopia–Kenya; Addis Ababa to Nairobi overland route'),
  bc('Tunduma / Nakonde','TZ','ZM',-9.300,32.766,'open','06:00–22:00','TAZARA corridor; Tanzania–Zambia'),
  bc('Chirundu','ZM','ZW',-16.026,28.851,'open','06:00–22:00','Zambia–Zimbabwe crossing on the Zambezi'),
  bc('Ramokgwebana / Plumtree','BW','ZW',-20.818,27.808,'open','06:00–22:00','Botswana–Zimbabwe; A1 highway crossing'),
  bc('Ressano Garcia / Komatipoort','MZ','ZA',-25.429,32.017,'open','24 hours','Busiest Mozambique–South Africa crossing'),
  bc('Forbes / Machipanda','MZ','ZW',-18.993,32.777,'open','06:00–18:00','Beira corridor; Mozambique to Zimbabwe'),
  bc('Mchinji','MW','ZM',-13.820,32.888,'open','06:00–18:00','Main Malawi–Zambia crossing'),
  bc('Nimule / Elegu','SS','UG',3.596,32.062,'restricted','06:00–18:00','South Sudan–Uganda; check current security advisories'),
  bc('Aflao / Kodjoviakopé','GH','TG',6.104,1.190,'open','24 hours','Ghana–Togo; busy west African crossing'),
  bc('Farafenni','SN','GM',13.567,-15.601,'open','06:00–20:00','Senegal–Gambia; ferry across the Gambia River'),
  bc('Seme / Kraké','NG','BJ',6.355,2.713,'open','24 hours','Nigeria–Benin; Lagos corridor'),
  bc('Petite Barrière Goma','CD','RW',-1.678,29.233,'open','06:00–18:00','DRC–Rwanda urban crossing; Goma–Gisenyi'),
  bc('Metema / Gallabat','SD','ET',12.947,36.205,'restricted','Daylight hours','Armed conflict nearby; check advisories before travel'),

  // ── South Asia ────────────────────────────────────────────────────────────────
  bc('Wagah / Attari','IN','PK',31.604,74.572,'restricted','09:00–17:00','Ceremonial crossing; advance permit required; limited tourist access'),
  bc('Sunauli / Bhairahawa','IN','NP',27.508,83.433,'open','24 hours','Main Varanasi–Pokhara overland route'),
  bc('Raxaul / Birgunj','IN','NP',26.983,84.927,'open','24 hours','Busy Patna–Kathmandu corridor'),
  bc('Kakarbhitta / Panitanki','IN','NP',26.878,88.126,'open','24 hours','Northeast India gateway to Nepal'),
  bc('Phuentsholing / Jaigaon','IN','BT',26.851,89.389,'open','09:00–18:00','Most-used India–Bhutan crossing; permit required for Bhutan'),
  bc('Petrapole / Benapole','IN','BD',23.023,88.588,'open','06:00–20:00','Main India–Bangladesh road crossing'),
  bc('Akhaura / Agartala','BD','IN',23.875,91.200,'open','06:00–18:00','Secondary India–Bangladesh crossing'),
  bc('Rasuwagadhi / Gyirong','NP','CN',28.534,85.821,'restricted','09:00–17:00','Tibet permit required; closed to most foreign nationals'),
  bc('Torkham','PK','AF',34.101,71.103,'restricted','Daylight hours','Volatile; check current conditions before travel'),
  bc('Chaman / Spin Boldak','PK','AF',30.920,66.457,'restricted','Daylight hours','Volatile; check current conditions before travel'),
  bc('Taftan / Mirjaveh','PK','IR',28.960,61.596,'restricted','Daylight hours','Security concerns; travel advisories in effect'),
  bc('Islam Qala','AF','IR',34.685,61.259,'closed','Closed','De facto closed; no regular civilian crossing'),
  bc('Teknaf','BD','MM',20.864,92.297,'closed','Closed','Sealed due to Rohingya crisis'),

  // ── East Asia / Northeast Asia ────────────────────────────────────────────────
  bc('Erlian / Zamyn-Üüd','CN','MN',43.646,111.974,'open','09:00–18:00','Trans-Mongolian Railway gateway; main China–Mongolia crossing'),
  bc('Altai / Bulgan','CN','MN',46.371,90.855,'open','09:00–17:00','Western overland route between China and Mongolia'),
  bc('Altanbulag / Kyakhta','MN','RU',50.336,106.466,'open','09:00–18:00','Trans-Mongolian Railway gateway; Mongolia–Russia'),
  bc('Manzhouli / Zabaikalsk','CN','RU',49.572,117.452,'open','09:00–17:00','Main northeast China–Russia land crossing'),
  bc('Dostyk / Alashankou','KZ','CN',45.282,82.261,'open','09:00–18:00','Silk Road rail and road; Kazakhstan–China'),
  bc('Khunjerab Pass','PK','CN',36.848,75.467,'open','08:00–17:00','Seasonal May–Nov; CPEC highway at 4,693 m'),
  bc('Panmunjom / JSA','KP','KR',37.953,126.680,'closed','Closed','DMZ; no public crossing permitted'),
  bc('Sinuiju / Dandong','KP','CN',40.092,124.396,'closed','Closed','Sealed since 2020; no tourist crossing permitted'),
  bc('Tumangang / Khasan','KP','RU',42.367,130.619,'closed','Closed','Rare freight only; no tourist crossing'),

  // ── Southeast Asia additions ──────────────────────────────────────────────────
  bc('Moreh / Tamu','IN','MM',24.237,94.280,'restricted','Daylight hours','Suspended since 2024 due to armed conflict; verify current status'),
  bc('Trapaeng Kreal / Nong Nok Khiene','KH','LA',13.984,106.002,'open','07:00–17:00','Cambodia–Laos crossing in northeastern Cambodia'),
  bc('Mota\'ain / Batugade','TL','ID',-8.930,124.972,'open','07:00–17:00','Main Timor-Leste–Indonesia land crossing'),
  bc('Sungai Tujoh / Kuala Lurah','BN','MY',4.967,114.897,'open','06:00–22:00','Brunei–Malaysia crossing on Borneo'),

  // ── Additional Americas ───────────────────────────────────────────────────────
  bc('Nogales / Heroica Nogales','US','MX',31.338,-110.934,'open','24 hours','Arizona–Sonora crossing'),
  bc('Brownsville / Matamoros','US','MX',25.905,-97.498,'open','24 hours','Texas Rio Grande Valley crossing'),
  bc('Simon Bolivar Bridge — Cucuta','CO','VE',7.897,-72.453,'restricted','Variable','Intermittent; political tensions; verify hours before travel'),
  bc('Rumichaca Bridge','CO','EC',0.819,-77.671,'open','24 hours','Main Colombia–Ecuador crossing on the Pan-American Highway'),
  bc('Macará / La Tina','EC','PE',-4.383,-79.940,'open','24 hours','Ecuador–Peru crossing; secondary to the main Pan-American route'),
  bc('Chacalluta / Santa Rosa','PE','CL',-18.340,-70.120,'open','24 hours','Main Peru–Chile crossing near Arica'),
  bc('Tambo Quemado / Chungará','BO','CL',-18.472,-69.083,'open','07:00–20:00','High-altitude Bolivia–Chile crossing at 4,600 m'),
  bc('Fray Bentos','AR','UY',-33.129,-58.298,'open','24 hours','Rail-road bridge over the Uruguay River'),
  bc('La Quiaca / Villazón','AR','BO',-22.104,-65.595,'open','07:00–21:00','Argentina–Bolivia; Jujuy to Potosí route'),
  bc('Rivera / Santana do Livramento','BR','UY',-30.889,-55.532,'open','24 hours','Integrated conurbation; open border town'),
  bc('Puerto Uruguayana / Paso de los Libres','BR','AR',-29.754,-57.082,'open','24 hours','Busy Brazil–Argentina crossing on the Uruguay River'),
  bc('Paso Canoas','PA','CR',8.532,-82.860,'open','06:00–22:00','Main Panama–Costa Rica road crossing'),
  bc('Ciudad Hidalgo / Suchiate','MX','GT',14.678,-92.146,'open','06:00–22:00','Busy Mexico–Guatemala crossing on the Suchiate River'),
  bc('Benque Viejo / Melchor de Mencos','BZ','GT',17.080,-89.143,'open','06:00–20:00','Belize–Guatemala; access to Tikal'),

  // ── Russia / Former Soviet space (non-Ukraine) ────────────────────────────────
  bc('Storskog / Borisoglebsk','NO','RU',69.596,29.996,'closed','Closed','Closed since February 2024'),
  bc('Troitsk / Karabutak','RU','KZ',54.088,61.557,'open','07:00–20:00','One of the busiest Russia–Kazakhstan land crossings'),

  // ── Pacific / Oceania ─────────────────────────────────────────────────────────
  bc('Skouw / Wutung','PG','ID',-2.617,140.975,'restricted','07:00–17:00','PNG–Indonesia; visa-on-arrival available for PNG; check advisories'),
];

// ─── Special territories (hardcoded GeoJSON polygons) ─────────────────────────
// type: 'territory' = own entry in CD; 'contested' = disputed, no unified data;
//       'admin'     = administered by adminIso country
const TERRITORIES = [
  {
    id: 'GZ', name: 'Gaza Strip', type: 'territory',
    geometry: { type: 'Polygon', coordinates: [[[
      34.218,31.217],[34.338,31.217],[34.559,31.231],[34.559,31.486],
      [34.505,31.604],[34.365,31.604],[34.280,31.548],[34.218,31.440],
      [34.218,31.217
    ]]]}
  },
  {
    id: 'XWB', name: 'West Bank', type: 'contested',
    geometry: { type: 'Polygon', coordinates: [[[
      34.879,31.353],[35.103,31.353],[35.547,31.490],[35.547,31.765],
      [35.547,32.417],[35.194,32.548],[34.879,32.197],[34.879,31.875],
      [34.879,31.531],[34.879,31.353
    ]]]}
  },
  {
    id: 'XGOL', name: 'Golan Heights', type: 'admin', adminIso: 'IL',
    geometry: { type: 'Polygon', coordinates: [[[
      35.621,32.700],[36.085,32.700],[36.085,33.287],
      [35.621,33.287],[35.621,32.700
    ]]]}
  },
];

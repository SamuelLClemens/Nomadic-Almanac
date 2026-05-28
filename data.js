'use strict';
const rep = v => Array(12).fill(v);
const s12 = (...a) => a;
const mk = (name, country, lat, lng, data) => ({ name, country, lat, lng, data });
const bc  = (name, from, to, lat, lng, status, hours, note) => ({ name, from, to, lat, lng, status, hours, note });
const bch = (name, country, lat, lng, status, season, water, facilities, dresscode, note) =>
  ({ name, country, lat, lng, status, season, water, facilities, dresscode, note });

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
  road:     { name:'Road Safety',      emoji:'🛣', color:'#3D8B6E', levels:['Low Risk','Some Hazards','Caution','Dangerous'] },
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
  ],
  road: [
    "Excellent road infrastructure with strong enforcement. Road fatalities among the lowest globally. Driving and motorbike hire are low-risk activities.",
    "Generally safe roads with some hazards. Drive defensively, observe speed limits, and avoid rural roads after dark.",
    "Poor road conditions, aggressive driving culture, or limited enforcement. Motorbike hire carries real risk; night driving is inadvisable.",
    "Very high road-fatality rates. Hire experienced local drivers where possible; avoid motorbikes and any night driving."
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
  'TH': { weather:s12(0,0,0,1,2,3,2,2,1,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,2,2,2,1,1,0,0,1,1), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,2,3,3,3,2,1,0,0), road:rep(2), vaccines:rep(1) },
  'VN': { weather:s12(1,1,1,1,2,2,2,2,2,1,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(1,1,1,1,2,2,1,1,1,1,1,1), road:rep(2), vaccines:rep(1) },
  'KH': { weather:s12(0,0,1,2,2,3,3,3,2,2,1,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(1,1,1,2,1,1,1,1,1,1,1,1), disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:s12(1,1,1,2,3,3,3,3,2,1,1,1), road:rep(2), vaccines:rep(2) },
  'LA': { weather:s12(0,0,1,2,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2) },
  'ID': { weather:s12(2,2,2,1,1,1,0,0,0,1,2,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,2,2,2,2,1,1,1,1,1,1), disaster:rep(3), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,1,1,0,0,0,0,0,0), road:rep(2), vaccines:rep(2) },
  'PH': { weather:s12(0,0,0,1,2,2,3,3,2,2,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,2,2,2,1,1,1,1,1,1,1,1), disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,2,1,0,0,0), road:rep(2), vaccines:rep(1) },
  'MY': { weather:s12(1,1,1,1,2,2,2,2,2,2,2,2), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1), remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,1,1,1,1,1,2,2,2), disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(1,1,1,1,2,2,1,1,1,2,2,1), road:rep(1), vaccines:rep(1) },
  'SG': { weather:rep(2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:rep(2), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(2), road:rep(0), vaccines:rep(0) },
  'MM': { weather:s12(0,0,1,2,2,3,3,3,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(2), road:rep(3), vaccines:rep(2) },
  'BN': { weather:rep(2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(1), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(1), road:rep(1), vaccines:rep(1) },
  // East Asia
  'JP': { weather:s12(1,1,0,0,1,2,2,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(1,0,2,1,1,2,1,2,3,2,1,1), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), road:rep(0), vaccines:rep(0) },
  'CN': { weather:s12(2,1,1,1,1,1,2,2,1,1,2,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(2), disaster:rep(2), visa:rep(2), lgbtq:rep(2), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), road:rep(2), vaccines:rep(0) },
  'KR': { weather:s12(1,1,1,1,2,2,1,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,1,1,2,2,1,1), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), road:rep(1), vaccines:rep(0) },
  'TW': { weather:s12(1,1,1,1,2,2,3,3,2,1,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,2,2,2,2,1,1,1,1,1,1), disaster:rep(3), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,2,2,1,0,1,1,1,1,2,2), road:rep(1), vaccines:rep(0) },
  'HK': { weather:s12(1,1,1,2,2,2,3,3,2,1,1,1), safety:rep(0), cost:rep(3), family:rep(1), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:rep(3), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(2,2,2,2,1,0,0,1,1,1,2,2), road:rep(0), vaccines:rep(0) },
  'MO': { weather:s12(1,1,1,2,2,2,3,3,2,1,1,1), safety:rep(0), cost:rep(3), family:rep(1), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(3), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(0), vaccines:rep(0) },
  'MN': { weather:s12(3,3,2,1,1,0,0,0,0,1,2,3), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(1) },
  // South Asia
  'IN': { weather:s12(0,0,1,2,3,3,3,2,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(3), remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,2,2,3,2,2,2,1,1,1), disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(1,1,1,2,3,2,2,2,2,1,1,1), road:rep(2), vaccines:rep(2) },
  'NP': { weather:s12(1,1,1,1,2,3,3,3,2,0,0,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,1,2,0,0,0,0,2,1,0), disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2) },
  'LK': { weather:s12(0,0,1,2,3,3,2,2,2,2,2,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,2,2,2,1,1,1,1,1,1,1,1), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,0,1,2,2,1,1,2,1,1,0), road:rep(2), vaccines:rep(1) },
  'MV': { weather:s12(0,0,0,0,1,2,2,2,1,1,1,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:rep(0), road:rep(2), vaccines:rep(1) },
  'PK': { weather:s12(1,1,1,2,3,3,3,3,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(2), road:rep(2), vaccines:rep(2) },
  'BD': { weather:s12(1,1,2,2,3,3,3,3,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3), remote:rep(2), corrupt:rep(3), health:rep(3), crowds:rep(1), disaster:rep(3), visa:rep(1), lgbtq:rep(3), beaches:rep(2), road:rep(2), vaccines:rep(2) },
  'BT': { weather:s12(1,1,1,1,2,3,3,3,2,0,0,1), safety:rep(0), cost:rep(3), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(1), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(2), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1) },
  // Middle East
  'AE': { weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(1), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(2,2,2,1,1,1,1,1,1,2,2,2), disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(3,3,3,2,1,3,3,3,2,1,3,3), road:rep(1), vaccines:rep(0) },
  'SA': { weather:s12(0,0,1,2,3,3,3,3,2,1,0,0), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(3), remote:rep(1), corrupt:rep(2), health:rep(0), crowds:rep(1), disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:rep(2), road:rep(1), vaccines:rep(0) },
  'TR': { weather:s12(1,1,1,1,0,0,0,0,0,1,1,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,2,2,2,3,3,2,1,0,0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(3,3,3,2,1,0,0,0,1,2,3,3), road:rep(1), vaccines:rep(1) },
  'IL': { weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(2), cost:rep(3), family:rep(1), solo:rep(1), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,2,2,2,2,1,1), disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2), road:rep(1), vaccines:rep(0) },
  'JO': { weather:s12(1,1,0,0,0,1,1,1,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), road:rep(1), vaccines:rep(1) },
  'LB': { weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(3), cost:rep(2), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(2), road:rep(2), vaccines:rep(1) },
  'OM': { weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(1), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(0), disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:s12(1,1,1,1,3,3,3,3,3,1,1,1), road:rep(1), vaccines:rep(0) },
  'QA': { weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(1), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(1), disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(2), road:rep(1), vaccines:rep(0) },
  'KW': { weather:s12(0,0,1,2,3,3,3,3,2,1,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(1), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(0), disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:rep(2), road:rep(1), vaccines:rep(0) },
  'BH': { weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(1), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:rep(1), disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:rep(2), road:rep(1), vaccines:rep(0) },
  'IQ': { weather:s12(1,1,1,2,3,3,3,3,2,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(1) },
  'IR': { weather:s12(1,1,1,1,1,2,3,3,1,0,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(2), road:rep(2), vaccines:rep(1) },
  'YE': { weather:s12(1,1,1,1,1,2,2,2,1,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(3) },
  'SY': { weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(2) },
  // Africa - North
  'EG': { weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(3), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:s12(1,2,2,2,1,1,1,1,1,1,1,1), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(2,2,2,1,0,0,0,0,0,1,1,2), road:rep(2), vaccines:rep(1) },
  'MA': { weather:s12(1,1,0,0,1,1,2,2,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,2,2,2,1,1,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(1,1,0,0,0,0,0,0,0,0,1,1), road:rep(2), vaccines:rep(1) },
  'TN': { weather:s12(1,1,0,0,0,0,1,1,0,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(1), disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2), road:rep(1), vaccines:rep(1) },
  'DZ': { weather:s12(1,1,0,0,2,3,3,3,1,0,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3), remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(2), road:rep(1), vaccines:rep(1) },
  'LY': { weather:s12(1,1,0,1,2,3,3,3,2,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(0), visa:rep(3), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(1) },
  // Africa - East
  'ET': { weather:s12(1,1,2,2,3,3,2,2,2,1,0,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(3) },
  'KE': { weather:s12(1,1,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(1,1,1,1,1,0,0,0,1,1,1,1), road:rep(2), vaccines:rep(3) },
  'TZ': { weather:s12(2,2,2,2,1,0,0,0,1,2,2,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:s12(0,0,1,1,0,0,0,0,0,1,1,0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,1,1,1,1,0,0,0,1,1,0), road:rep(2), vaccines:rep(3) },
  'MG': { weather:s12(3,3,2,1,1,0,0,0,0,1,2,3), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(3), visa:rep(1), lgbtq:rep(3), beaches:s12(1,2,1,0,0,0,0,0,0,0,1,1), road:rep(2), vaccines:rep(3) },
  'MZ': { weather:s12(3,3,2,1,1,0,0,0,0,1,2,3), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(0,1,1,0,0,0,0,0,0,0,0,0), road:rep(2), vaccines:rep(3) },
  'RW': { weather:s12(1,1,2,2,1,0,0,0,1,2,2,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(1), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2) },
  'UG': { weather:s12(1,1,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(3) },
  'SO': { weather:s12(1,2,2,3,2,1,1,1,2,2,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(3) },
  'SD': { weather:s12(1,1,1,2,3,3,3,3,2,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(3) },
  'ER': { weather:s12(1,1,1,2,2,2,2,2,1,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(3) },
  'DJ': { weather:s12(1,1,2,2,3,3,3,3,2,2,1,1), safety:rep(2), cost:rep(2), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(2), road:rep(2), vaccines:rep(2) },
  // Africa - West
  'NG': { weather:s12(1,1,2,2,3,3,3,3,2,2,1,1), safety:rep(3), cost:rep(1), family:rep(2), solo:rep(3), remote:rep(2), corrupt:rep(3), health:rep(3), crowds:rep(1), disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:s12(1,1,1,2,3,3,3,3,2,2,1,1), road:rep(2), vaccines:rep(3) },
  'GH': { weather:s12(1,2,2,2,3,3,2,2,2,1,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(1,1,1,2,3,3,2,2,2,1,1,1), road:rep(2), vaccines:rep(3) },
  'SN': { weather:s12(1,1,1,1,2,3,3,3,3,2,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,1,2,2,2,2,1,0,0), road:rep(2), vaccines:rep(3) },
  'CI': { weather:s12(1,1,2,2,3,3,3,3,3,2,1,1), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,1,2,3,3,3,3,3,1,0,0), road:rep(2), vaccines:rep(3) },
  'CM': { weather:s12(1,1,2,2,3,3,3,3,3,2,1,1), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(2), road:rep(2), vaccines:rep(3) },
  'SL': { weather:s12(1,1,1,2,3,3,3,3,3,2,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,0,1,3,3,3,3,3,1,0,0), road:rep(3), vaccines:rep(3) },
  'GM': { weather:s12(0,0,1,1,2,3,3,3,3,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:s12(2,2,1,0,0,1,1,1,1,0,1,2), disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,1,2,2,2,2,0,0,0), road:rep(2), vaccines:rep(3) },
  'BF': { weather:s12(1,1,1,2,3,3,3,3,2,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(3) },
  'ML': { weather:s12(1,1,2,3,3,3,3,3,2,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(3) },
  'NE': { weather:s12(1,1,2,3,3,3,3,3,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(3) },
  'TD': { weather:s12(1,1,2,3,3,3,3,3,2,1,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(3) },
  'MR': { weather:s12(0,0,1,2,3,3,3,3,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(2), road:rep(2), vaccines:rep(3) },
  // Africa - Central
  'CD': { weather:s12(2,2,2,2,2,2,1,1,2,2,2,2), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(3) },
  'CF': { weather:s12(1,2,2,2,3,3,3,3,2,2,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(3) },
  'CG': { weather:s12(2,2,2,2,2,1,0,1,2,2,2,2), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(2), road:rep(2), vaccines:rep(3) },
  'GA': { weather:s12(2,2,2,2,2,1,0,1,2,2,2,2), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(1), road:rep(2), vaccines:rep(3) },
  // Africa - South
  'ZA': { weather:s12(1,1,1,0,1,2,2,2,1,0,0,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,0,0,1,2,2,1,0,0,1), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,2,2,3,2,1,0,0,0), road:rep(2), vaccines:rep(1) },
  'BW': { weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(0), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2) },
  'NA': { weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(1), health:rep(1), crowds:rep(0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:s12(2,2,2,1,1,1,1,1,1,1,1,2), road:rep(2), vaccines:rep(2) },
  'ZM': { weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(3) },
  'ZW': { weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(1), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(2) },
  'AO': { weather:s12(2,2,2,2,1,0,0,0,1,2,2,2), safety:rep(2), cost:rep(2), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(1), road:rep(2), vaccines:rep(3) },
  // Western Europe
  'FR': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,3,3,3,2,1,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), road:rep(1), vaccines:rep(0) },
  'ES': { weather:s12(1,1,1,0,0,0,1,1,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,3,3,2,1,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,2,1,1,0,0,0,0,1,2,2), road:rep(1), vaccines:rep(0) },
  'IT': { weather:s12(1,1,1,0,0,0,1,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,3,2,2,3,3,2,2,1,1), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,2,1,0,0,0,0,1,2,3), road:rep(1), vaccines:rep(0) },
  'PT': { weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,2,2,2,3,3,2,1,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,1,1,0,0,0,0,0,0,1,2), road:rep(1), vaccines:rep(0) },
  'GR': { weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,2,2,2,3,3,2,1,0,0), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(2,2,2,1,0,0,0,0,0,0,1,2), road:rep(1), vaccines:rep(0) },
  'DE': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,1,2,2,2,2,2,2,1,2), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(0), vaccines:rep(0) },
  'GB': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,3,3,2,1,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,2,3,3), road:rep(0), vaccines:rep(0) },
  'NL': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,3,2,2,1,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(0), vaccines:rep(0) },
  'BE': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,1,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(0), vaccines:rep(0) },
  'AT': { weather:s12(2,2,1,1,0,0,0,0,0,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(2,2,1,1,1,1,2,2,1,1,2,3), disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0) },
  'CH': { weather:s12(2,2,1,1,0,0,0,0,0,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,1,1,2,2,1,1,2,2), disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0) },
  'SE': { weather:s12(3,2,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,1,2,2,1,1,0,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(0), vaccines:rep(0) },
  'NO': { weather:s12(3,3,2,1,1,0,0,0,1,2,2,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,1,2,2,1,1,0,0,0), disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(0), vaccines:rep(0) },
  'DK': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(0), vaccines:rep(0) },
  'FI': { weather:s12(3,3,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,0,1,1,2,1,0,0,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(0), vaccines:rep(0) },
  'IE': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,2,1,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,2,2,1,1,1,2,2,3,3), road:rep(0), vaccines:rep(0) },
  'IS': { weather:s12(3,3,2,2,1,1,1,1,2,2,3,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0), disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0) },
  // Central/Eastern Europe
  'PL': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(1), vaccines:rep(0) },
  'CZ': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,3,3,2,2,1,1), disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0) },
  'HU': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,3,3,2,1,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0) },
  'RO': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,2,1,0,0,1,2,3,3), road:rep(1), vaccines:rep(0) },
  'BG': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(2), health:rep(0), crowds:s12(0,0,0,1,1,2,3,3,1,0,0,0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,2,1,0,0,1,2,3,3), road:rep(1), vaccines:rep(0) },
  'HR': { weather:s12(2,2,1,1,0,0,0,0,0,1,1,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,2,1,0,0,0,0,1,2,3), road:rep(1), vaccines:rep(0) },
  'SI': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0), disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,0,0,1,2,3,3), road:rep(1), vaccines:rep(0) },
  'SK': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:rep(0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0) },
  'RS': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0) },
  'AL': { weather:s12(1,2,1,1,0,0,0,0,0,1,1,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,2,1,0,0,0,0,1,2,3), road:rep(1), vaccines:rep(0) },
  'ME': { weather:s12(1,2,1,1,0,0,0,0,0,1,1,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(2), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,2,1,0,0,0,0,1,2,3), road:rep(1), vaccines:rep(0) },
  'BA': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0) },
  'MK': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(2), health:rep(0), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0) },
  'XK': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(0), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0) },
  // Baltic + Eastern Europe
  'EE': { weather:s12(3,2,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,1,2,2,1,1,0,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(1), vaccines:rep(0) },
  'LV': { weather:s12(3,2,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:rep(0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(1), vaccines:rep(0) },
  'LT': { weather:s12(3,2,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:rep(0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(1), vaccines:rep(0) },
  'UA': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(1) },
  'BY': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(0), visa:rep(2), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(0) },
  'MD': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0) },
  'RU': { weather:s12(3,3,2,1,1,0,0,0,1,1,2,3), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:s12(3,3,3,3,3,2,1,1,2,3,3,3), road:rep(2), vaccines:rep(0) },
  'GE': { weather:s12(1,1,1,1,1,0,0,0,0,1,1,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(0), corrupt:rep(1), health:rep(1), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(1), vaccines:rep(0) },
  'AM': { weather:s12(2,2,1,1,0,0,0,0,0,1,2,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0) },
  'AZ': { weather:s12(1,1,1,1,0,0,1,1,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(3,3,3,3,2,1,0,0,1,2,3,3), road:rep(1), vaccines:rep(0) },
  // Americas - North
  'US': { weather:s12(1,1,1,1,1,0,0,0,0,1,1,1), safety:rep(1), cost:rep(3), family:rep(0), solo:rep(1), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,1), disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:s12(2,2,2,2,1,0,0,0,1,1,2,2), road:rep(1), vaccines:rep(0) },
  'CA': { weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,1,2,2,2,2,2,1,1,1), disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(0), vaccines:rep(0) },
  'MX': { weather:s12(1,1,1,2,3,1,1,1,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(3), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,2,1,1,1,1,1,0,0), road:rep(2), vaccines:rep(1) },
  'GT': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(1), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(2), road:rep(2), vaccines:rep(2) },
  'BZ': { weather:s12(0,0,0,1,2,2,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,1,2,2,3,3,2,1,0,0), road:rep(2), vaccines:rep(2) },
  'HN': { weather:s12(0,0,1,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(2), road:rep(2), vaccines:rep(2) },
  'SV': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(1), road:rep(2), vaccines:rep(2) },
  'NI': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(1), road:rep(2), vaccines:rep(2) },
  'CR': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1), remote:rep(1), corrupt:rep(1), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:s12(0,0,0,0,1,2,2,2,1,0,0,0), road:rep(1), vaccines:rep(1) },
  'PA': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,2,2,2,1,0,0,0), road:rep(1), vaccines:rep(2) },
  'CU': { weather:s12(0,0,0,1,2,2,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(3), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(2), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,1,0,0,0), road:rep(1), vaccines:rep(1) },
  'JM': { weather:s12(0,0,0,1,2,2,3,3,2,1,0,0), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(1), disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,1,2,3,3,1,0,0,0), road:rep(1), vaccines:rep(1) },
  'DO': { weather:s12(0,0,0,1,2,2,3,3,2,1,0,0), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(2,2,2,2,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,1,0,0,0), road:rep(2), vaccines:rep(1) },
  'TT': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,1,1,1,1,0,0,0), road:rep(1), vaccines:rep(1) },
  'BB': { weather:s12(0,0,0,1,2,2,3,3,2,1,0,0), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,1,0,0,0), road:rep(1), vaccines:rep(1) },
  'BS': { weather:s12(0,0,0,1,2,2,3,3,2,1,0,0), safety:rep(1), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(1), health:rep(0), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,1,0,0,0), road:rep(1), vaccines:rep(1) },
  'PR': { weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(0), crowds:rep(1), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,1,2,2,1,0,0,0), road:rep(1), vaccines:rep(0) },
  // South America
  'BR': { weather:s12(2,2,2,2,1,1,0,0,1,2,2,2), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(2,3,1,1,1,1,1,1,1,1,1,2), disaster:rep(2), visa:rep(1), lgbtq:rep(1), beaches:s12(0,0,0,1,1,2,2,2,1,0,0,0), road:rep(2), vaccines:rep(2) },
  'AR': { weather:s12(1,1,0,1,2,2,2,2,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,1,2), disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:s12(1,1,0,1,2,3,3,2,1,0,0,0), road:rep(1), vaccines:rep(1) },
  'CL': { weather:s12(1,1,0,0,1,2,2,2,1,0,0,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(1), crowds:s12(1,1,0,0,1,1,1,1,1,0,0,1), disaster:rep(3), visa:rep(0), lgbtq:rep(1), beaches:s12(1,1,0,0,1,2,2,2,1,0,0,0), road:rep(1), vaccines:rep(1) },
  'CO': { weather:s12(0,1,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(1,1,1,1,1,0,0,0,0,1,1,1), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(1,1,1,1,1,0,0,0,0,1,1,1), road:rep(2), vaccines:rep(2) },
  'PE': { weather:s12(0,0,1,1,1,2,2,2,1,0,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,1,1,1,1,1,1,2,2,1), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(2,2,1,1,1,2,3,3,2,1,1,2), road:rep(2), vaccines:rep(2) },
  'EC': { weather:s12(1,2,2,1,1,0,0,0,1,2,1,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(1,1,1,1,1,0,0,0,0,1,1,1), road:rep(2), vaccines:rep(2) },
  'BO': { weather:s12(2,2,2,1,0,1,2,2,1,0,0,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2) },
  'UY': { weather:s12(1,1,0,1,1,2,2,2,1,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(1,2,0,0,0,1,1,1,0,0,0,1), disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(0,1,0,0,1,2,2,2,1,0,0,0), road:rep(1), vaccines:rep(0) },
  'PY': { weather:s12(1,1,1,1,1,2,2,2,1,1,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1) },
  'VE': { weather:s12(0,0,0,1,2,2,2,2,1,0,0,0), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(2), lgbtq:rep(2), beaches:rep(2), road:rep(2), vaccines:rep(2) },
  'GY': { weather:s12(2,2,3,3,3,2,1,1,2,3,2,2), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(2), road:rep(2), vaccines:rep(3) },
  'SR': { weather:s12(2,2,3,3,3,2,1,1,2,3,2,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:rep(2), road:rep(2), vaccines:rep(3) },
  // Oceania
  'AU': { weather:s12(1,1,0,0,1,2,2,2,1,0,0,1), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,2,1,1,1,1,1,1,1,0,1,1), disaster:rep(2), visa:rep(1), lgbtq:rep(0), beaches:s12(0,0,0,1,2,2,3,3,2,1,0,0), road:rep(0), vaccines:rep(0) },
  'NZ': { weather:s12(0,0,0,1,1,2,2,2,1,0,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(2,2,1,1,1,1,1,1,1,1,1,2), disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:s12(0,0,0,1,2,2,3,3,2,1,0,0), road:rep(0), vaccines:rep(0) },
  'FJ': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(1), remote:rep(2), corrupt:rep(1), health:rep(1), crowds:s12(1,1,1,1,1,1,0,0,1,1,1,1), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,1,1,0,0,0,0,0), road:rep(1), vaccines:rep(1) },
  'VU': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(1), solo:rep(0), remote:rep(3), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:rep(1), road:rep(2), vaccines:rep(2) },
  'PG': { weather:s12(2,2,2,2,2,2,1,1,2,2,2,2), safety:rep(2), cost:rep(2), family:rep(2), solo:rep(3), remote:rep(3), corrupt:rep(2), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:rep(1), road:rep(2), vaccines:rep(3) },
  'WS': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(1), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(0), road:rep(1), vaccines:rep(1) },
  'TO': { weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(1), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(0), road:rep(2), vaccines:rep(1) },
  'PW': { weather:s12(1,1,1,1,2,2,2,2,2,1,1,1), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(1), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(0), road:rep(2), vaccines:rep(1) },
  'SB': { weather:s12(2,2,2,2,2,2,1,1,2,2,2,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(3), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(1), road:rep(2), vaccines:rep(2) },
  'PF': { weather:s12(1,2,2,1,1,1,1,1,1,1,1,1), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(2), corrupt:rep(1), health:rep(0), crowds:rep(1), disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(0), road:rep(1), vaccines:rep(1) },
  'FM': { weather:s12(1,1,1,1,2,2,2,2,2,1,1,1), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0), remote:rep(3), corrupt:rep(1), health:rep(1), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(0), road:rep(2), vaccines:rep(1) },
  // Central Asia
  'KZ': { weather:s12(3,2,1,1,1,0,0,0,0,1,2,3), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(1) },
  'UZ': { weather:s12(1,1,1,1,2,3,3,3,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1), remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1) },
  'KG': { weather:s12(3,2,1,1,0,0,0,0,0,1,2,3), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2), remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1) },
  'TJ': { weather:s12(2,2,1,1,2,3,3,3,1,0,1,2), safety:rep(1), cost:rep(0), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(2) },
  'TM': { weather:s12(1,1,1,2,3,3,3,3,2,1,1,1), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2), remote:rep(3), corrupt:rep(3), health:rep(1), crowds:rep(0), disaster:rep(1), visa:rep(3), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(1) },
  'AF': { weather:s12(1,1,1,2,2,3,3,3,1,0,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(3), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(3) },
  // Special territories (custom keys — not ISO3166)
  'GZ':  { weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(1), road:rep(2), vaccines:rep(2) },
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

  // ── Japan ─────────────────────────────────────────────────────────────────────
  // Hokkaido — subarctic; powder ski paradise Dec-Mar; cool pleasant summers; best Jul-Sep
  'JP-01': { weather: s12(3,3,2,2,1,0,0,0,1,1,2,3) },
  // Niigata / Sea of Japan coast — record snowfall Dec-Mar; pleasant summers; sake country
  'JP-15': { weather: s12(2,3,2,1,0,0,0,0,1,1,1,2) },
  // Nagano — Japanese Alps; cold winters; ski resorts; excellent fall foliage; mild summers
  'JP-20': { weather: s12(2,2,2,1,0,0,0,0,0,1,1,2) },
  // Kanto (Tokyo) — humid subtropical; spring cherry blossom Apr excellent; brutal heat Jul-Aug; best Oct
  'JP-13': { weather: s12(1,1,1,0,1,2,3,3,2,0,1,1), cost:rep(3), crowds:s12(1,1,2,3,2,1,1,2,1,3,2,1) },
  // Kyoto — same brutal summer heat as Tokyo; most extreme spring/fall overtourism in Japan
  'JP-26': { weather: s12(1,1,1,0,1,2,3,3,2,0,1,1), crowds:s12(1,1,3,3,2,2,1,2,2,3,3,1) },
  // Osaka — slightly warmer than Kyoto; lively city; crowded but less acute than Kyoto peaks
  'JP-27': { weather: s12(1,1,0,0,1,2,3,3,2,0,0,1) },
  // Kyushu (Fukuoka) — warmest Honshu/Kyushu; mild winters; typhoon season Aug-Sep
  'JP-40': { weather: s12(0,1,1,0,1,1,2,2,2,0,0,0) },
  // Okinawa — subtropical; rainy tsuyu May-Jun; typhoons Aug-Oct; mild winters; excellent beaches
  'JP-47': { weather: s12(1,0,0,0,2,2,1,2,2,1,1,1), beaches:rep(0) },

  // ── Mexico ────────────────────────────────────────────────────────────────────
  // CDMX / Mexico City — highland 2240 m; mild and spring-like year-round; rainy Jun-Sep; safest major city
  'MX-CMX': { weather: s12(0,0,0,0,1,2,2,2,2,1,0,0), cost:rep(1) },
  // Quintana Roo (Cancún, Tulum, Playa) — hot/humid; hurricane season Jun-Nov; peak crowds Dec-Jan/Mar
  'MX-ROO': { weather: s12(0,0,0,1,1,2,2,2,2,2,1,0), disaster:rep(3), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2), beaches:s12(0,0,0,1,1,2,2,2,2,2,1,0) },
  // Oaxaca — highland city 1550 m; spring-like; rainy Jun-Sep; extremely affordable; rich culture
  'MX-OAX': { weather: s12(0,0,0,0,1,2,2,2,1,0,0,0), cost:rep(0) },
  // Jalisco (Guadalajara + Puerto Vallarta) — highland city mild; PV coast hot; rainy Jun-Sep
  'MX-JAL': { weather: s12(0,0,0,0,1,2,2,2,2,1,0,0), cost:rep(1) },
  // Sonora (Hermosillo, border) — Sonoran Desert; scorching Jun-Sep 45 °C; mild Oct-Apr
  'MX-SON': { weather: s12(0,0,1,1,2,3,3,3,2,1,0,0), safety:rep(2) },
  // Baja California Sur (Los Cabos, La Paz) — desert peninsula; excellent Oct-May; brutal Jul-Aug
  'MX-BCS': { weather: s12(0,0,0,0,1,2,3,3,2,1,0,0), beaches:s12(0,0,0,0,1,2,3,3,2,0,0,0) },
  // Baja California Norte (Tijuana, Ensenada) — Mediterranean-ish; warm winters; safety concerns near border
  'MX-BCN': { weather: s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(2) },
  // Yucatan (Mérida, Chichén Itzá) — very hot; drier than Q.Roo; oppressive heat May-Aug
  'MX-YUC': { weather: s12(0,0,0,1,2,2,3,3,2,1,1,0) },
  // Chiapas (San Cristóbal, Palenque) — highland cool / jungle hot; rainy Jun-Oct
  'MX-CHP': { weather: s12(0,0,0,0,1,2,2,2,2,1,0,0), cost:rep(0) },
  // Guerrero (Acapulco) — high homicide rate; avoid non-resort areas; hot/humid coast
  'MX-GRO': { weather: s12(0,0,0,0,1,2,2,2,2,2,1,0), safety:rep(3) },
  // Tabasco (Villahermosa) — hot, wet, jungle gateway; not a leisure destination
  'MX-TAB': { weather: s12(1,1,1,2,2,3,3,3,3,2,1,1) },

  // ── Thailand ─────────────────────────────────────────────────────────────────
  // Bangkok — hot year-round; cool dry season Nov-Jan; rainy May-Oct; air quality variable
  'TH-10': { weather: s12(0,0,1,1,2,2,2,2,2,2,1,0) },
  // Chiang Mai — SMOKE SEASON Mar-Apr critical; cool dry Nov-Jan; rainy Jun-Oct; forest fires from slash-and-burn
  'TH-50': { weather: s12(0,0,3,3,2,1,1,1,2,1,0,0) },
  // Phuket — Andaman coast; DRY season Nov-Apr; monsoon May-Oct (rough seas, some resorts close)
  'TH-83': { weather: s12(0,0,0,0,2,2,2,2,2,2,1,0), beaches:s12(0,0,0,0,2,3,3,3,2,2,1,0) },
  // Krabi — Andaman coast; same pattern as Phuket; dry Nov-Apr excellent
  'TH-81': { weather: s12(0,0,0,0,2,2,2,2,2,2,1,0), beaches:s12(0,0,0,0,2,3,3,3,2,2,1,0) },
  // Surat Thani (Koh Samui / Gulf coast) — OPPOSITE rain season to Phuket; dry Jan-Sep; heavy rain Oct-Dec
  'TH-84': { weather: s12(0,0,0,0,0,1,1,1,1,2,3,2), beaches:s12(0,0,0,0,0,1,1,1,1,2,3,2) },
  // Prachuap Khiri Khan (Hua Hin / Gulf coast) — similar to Samui; driest Jan-May
  'TH-77': { weather: s12(0,0,0,0,0,1,1,1,1,2,2,1) },

  // ── Vietnam ───────────────────────────────────────────────────────────────────
  // Hanoi — 4 seasons; cool drizzly Jan-Mar; hot humid summer; rainy Jul-Aug; best Oct-Dec
  'VN-HN': { weather: s12(2,2,2,1,1,1,2,2,1,0,0,1) },
  // Haiphong — similar to Hanoi; typhoon risk Aug-Sep
  'VN-HP': { weather: s12(2,2,2,1,1,1,2,2,2,1,0,1) },
  // Da Nang / Central coast — FLOOD SEASON Oct-Dec severe; dry hot Feb-Aug; best Feb-May
  'VN-DN': { weather: s12(2,1,0,0,0,1,1,1,1,2,3,2) },
  // Ho Chi Minh City (South) — 2 seasons; dry cool Nov-Apr; hot rainy May-Oct
  'VN-SG': { weather: s12(0,0,0,1,2,3,3,3,2,2,1,0) },
  // Can Tho / Mekong Delta — very similar to HCMC; flooding Aug-Oct
  'VN-CT': { weather: s12(0,0,0,1,2,3,3,3,3,2,1,0) },

  // ── Turkey ────────────────────────────────────────────────────────────────────
  // Istanbul — hybrid climate; hot dry summers; cold wet winters; best Apr-May, Sep-Oct
  'TR-34': { weather: s12(2,2,1,0,0,0,1,1,0,1,2,2) },
  // Ankara — steppe continental; cold dry winters; hot dry summers; best Apr-May, Sep-Oct
  'TR-06': { weather: s12(2,2,1,1,0,1,2,2,0,1,1,2) },
  // Antalya / Turkish Riviera — excellent beaches; nearly year-round sun; best Apr-Jun, Sep-Oct
  'TR-07': { weather: s12(1,1,0,0,0,0,1,2,0,0,1,1), beaches:s12(2,2,1,0,0,0,0,1,0,0,2,2) },
  // Izmir / Aegean coast — very similar to Antalya; slightly cooler; excellent spring/fall
  'TR-35': { weather: s12(1,1,0,0,0,0,1,2,0,0,1,1), beaches:s12(2,2,1,0,0,0,0,1,0,0,2,2) },
  // Erzurum / Eastern Anatolia — extreme cold; snow Oct-Apr; short pleasant summer
  'TR-25': { weather: s12(3,3,3,2,1,0,0,0,1,2,3,3) },
  // Rize / Black Sea coast — very rainy year-round; lush green; mild temperatures
  'TR-53': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2) },

  // ── Greece ────────────────────────────────────────────────────────────────────
  // Attica (Athens) — scorching Jul-Aug (38-42 °C); great spring and fall; mild winter
  'GR-I': { weather: s12(1,1,1,0,0,0,2,2,0,0,1,1), crowds:s12(1,1,2,2,2,3,3,3,3,2,1,1) },
  // South Aegean (Santorini, Mykonos, Rhodes) — premium prices; extreme Jul-Aug crowds; excellent beaches
  'GR-L': { weather: s12(1,1,1,0,0,0,1,2,0,0,1,1), cost:rep(3), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0), beaches:s12(2,2,1,0,0,0,0,1,0,0,1,2) },
  // Crete — warmest Greek region; best Oct-May; slightly more breeze than Athens; very crowded Jul-Aug
  'GR-M': { weather: s12(1,1,1,0,0,0,1,1,0,0,1,1), crowds:s12(0,0,1,2,2,3,3,3,2,1,0,0), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2) },
  // West Macedonia — mountainous; cold snowy winters; cool summers; off the tourist trail
  'GR-C': { weather: s12(3,3,2,1,0,0,0,0,0,1,2,3) },
  // Ionian Islands (Corfu, Zakynthos) — lush/rainy in winter; excellent May-Sep; cheaper than Aegean
  'GR-F': { weather: s12(2,2,1,0,0,0,0,0,0,0,1,2), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2) },

  // ── Portugal ──────────────────────────────────────────────────────────────────
  // Lisboa (Lisbon) — mild Atlantic climate; warm sunny summers (but rarely brutal); best Apr-Oct
  'PT-11': { weather: s12(1,1,1,1,0,0,0,0,0,0,1,1) },
  // Porto — rainier and cooler than Lisbon; lush green Douro valley; best May-Sep
  'PT-13': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2) },
  // Faro / Algarve — southern beach coast; best beaches in Portugal; driest region; best Apr-Oct
  'PT-08': { weather: s12(1,1,0,0,0,0,0,0,0,0,1,1), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2) },
  // Madeira — "island of eternal spring"; subtropical; mild year-round; best Apr-Oct
  'PT-30': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), beaches:s12(2,2,2,1,1,1,1,1,1,1,2,2) },
  // Azores — mid-Atlantic; rainy/windy; very variable; whale watching; dramatic landscapes
  'PT-20': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2) },

  // ── India — additional states ─────────────────────────────────────────────────
  // Karnataka (Bengaluru/Hampi) — Deccan plateau 920 m; most pleasant in India year-round; monsoon Jun-Sep
  'IN-KA': { weather: s12(0,0,1,1,2,2,2,2,2,1,0,0) },
  // Uttar Pradesh (Agra/Varanasi) — brutal heat May-Jun; very crowded monuments; moderate solo risk
  'IN-UP': { weather: s12(0,0,1,2,3,3,3,3,2,1,0,0), crowds:rep(3), safety:rep(2), solo:rep(2) },
  // Punjab (Amritsar/Golden Temple) — hot dry summers; cold foggy winters; best Oct-Mar
  'IN-PB': { weather: s12(1,1,1,2,3,3,3,3,2,1,0,1) },
  // Madhya Pradesh (Khajuraho, Orchha, Kanha) — hot central India; best Oct-Feb
  'IN-MP': { weather: s12(0,0,1,2,3,3,3,3,2,1,0,0) },
  // Telangana (Hyderabad) — hot plateau; best Nov-Feb; intense heat Apr-Jun
  'IN-TS': { weather: s12(0,0,1,2,3,3,2,2,2,1,0,0) },
  // Tamil Nadu (Chennai, Madurai) — hot all year; NE monsoon Oct-Dec (opposite to rest of India!)
  // IN-TN already exists above — skip
  // Odisha (Puri, Konark) — hot coast; very cyclone-prone; best Nov-Feb
  'IN-OD': { weather: s12(0,0,1,2,3,3,2,2,2,2,1,0), disaster:rep(3) },
  // Bihar (Bodh Gaya, Patna) — hot humid Gangetic plain; best Nov-Feb
  'IN-BR': { weather: s12(0,0,1,2,3,3,3,3,2,1,0,0) },
  // Sikkim — Himalayan mountain state; cold winters; spring rhododendrons; monsoon Jun-Sep
  'IN-SK': { weather: s12(2,2,2,1,0,1,2,2,1,0,1,2) },
  // Andhra Pradesh (Vizag coast) — tropical coast; NE monsoon Oct-Dec; hot summers
  'IN-AP': { weather: s12(0,0,1,1,2,2,2,2,2,1,2,1) },

  // ── Indonesia ─────────────────────────────────────────────────────────────────
  // Bali — dry season Apr-Oct excellent; rainy Nov-Mar (still warm but humid storms); best Jun-Sep
  'ID-BA': { weather: s12(2,2,2,1,0,0,0,0,0,1,2,2), beaches:s12(2,2,2,1,0,0,0,0,0,1,2,2) },
  // Jakarta / Java West — equatorial; hot/humid year-round; rainy Nov-Apr; flooding risk Jan-Feb
  'ID-JK': { weather: s12(2,3,2,1,1,0,0,0,0,0,1,2) },
  // East Java (Surabaya, Bromo) — slightly drier than west; dry Jun-Oct best for Bromo
  'ID-JI': { weather: s12(2,2,2,1,0,0,0,0,0,1,1,2) },
  // North Sumatra (Medan, Bukit Lawang) — equatorial; very rainy; relatively cool at altitude
  'ID-SU': { weather: s12(2,2,2,2,2,2,1,1,1,2,2,2) },
  // East Kalimantan (Borneo) — equatorial rainforest; very rainy; extreme humidity
  'ID-KI': { weather: s12(2,2,2,2,1,1,1,1,1,1,2,2) },
  // Papua — extreme rainfall; frontier; very limited infrastructure; best Jun-Sep
  'ID-PA': { weather: s12(2,2,3,3,2,1,1,1,1,2,2,2) },

  // ── South Africa ──────────────────────────────────────────────────────────────
  // Western Cape (Cape Town) — Mediterranean (SOUTHERN HEMISPHERE); best Oct-Apr; winter rain Jun-Aug
  'ZA-WC': { weather: s12(0,0,0,1,1,2,2,2,1,0,0,0), beaches:s12(0,0,0,1,1,2,2,2,1,0,0,0) },
  // Gauteng (Johannesburg, Pretoria) — highveld 1700 m; warm dry winters excellent; summer afternoon thunderstorms
  'ZA-GP': { weather: s12(1,1,1,0,0,0,0,0,0,1,1,1) },
  // KwaZulu-Natal (Durban) — subtropical coast; warm all year; best May-Oct (dry); humid summers
  'ZA-KZN': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), beaches:s12(1,1,1,0,0,0,0,0,0,0,1,1) },
  // Northern Cape (Kalahari, Upington) — extreme desert heat Dec-Feb (Jan often 45 °C); best Jun-Sep
  'ZA-NC': { weather: s12(3,3,2,1,0,0,0,0,0,1,2,3) },
  // Mpumalanga (Kruger National Park) — best game viewing May-Sep (dry); malaria risk year-round
  'ZA-MP': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), health:rep(2) },

  // ── Morocco ───────────────────────────────────────────────────────────────────
  // Grand Casablanca-Settat — coastal Atlantic; mild year-round; best Mar-May, Sep-Nov
  'MA-06': { weather: s12(1,1,0,0,0,0,1,1,0,0,1,1) },
  // Marrakesh-Safi (Marrakech) — pre-Saharan heat; extreme Jul-Aug (45 °C+); best Oct-Apr
  'MA-07': { weather: s12(0,0,0,0,1,2,3,3,1,0,0,0) },
  // Fès-Meknès (Fez) — inland continental; hot summers; best Mar-May, Sep-Nov
  'MA-03': { weather: s12(1,1,0,0,0,2,3,3,1,0,1,1) },
  // Draa-Tafilalet (Ouarzazate, Sahara Desert) — extreme desert; best Oct-Mar; summer brutal
  'MA-08': { weather: s12(0,0,0,0,1,2,3,3,2,1,0,0) },
  // Tanger-Tétouan-Al Hoceima (Tangier) — Mediterranean north; mild Atlantic; best Apr-Sep
  'MA-01': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1) },

  // ── United Kingdom ─────────────────────────────────────────────────────────────
  // National fallbacks: safety:rep(0), cost:rep(2), lgbtq:rep(0)
  // England — temperate maritime; mixed year-round; London premium costs; busy summers
  'GB-ENG': { weather: s12(2,2,1,1,1,1,1,1,1,1,2,2), crowds:s12(1,1,1,2,2,2,3,3,2,1,1,1) },
  // Scotland — Atlantic/North Sea; significantly wetter and colder; Highland wilderness; cheaper
  'GB-SCT': { weather: s12(3,3,2,2,1,1,1,1,1,2,2,3), cost:rep(1) },
  // Wales — rainy Atlantic coast; mountainous; Celtic heritage; cheaper than England; best Jun-Sep
  'GB-WLS': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(1) },
  // Northern Ireland — similar to Scotland climate; Belfast resurgent; cheaper; peaceful since GFA
  'GB-NIR': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(1) },

  // ── Argentina ──────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(1), safety:rep(1), lgbtq:rep(0)
  // Buenos Aires (CABA) — cosmopolitan capital; mild subtropical; humid summers; most expensive
  'AR-C': { weather: s12(1,1,1,0,0,1,1,1,0,0,0,1), cost:rep(2), crowds:rep(2) },
  // Buenos Aires Province — Atlantic coast + pampas; similar climate to CABA
  'AR-B': { weather: s12(1,1,1,0,0,1,1,1,0,0,0,1) },
  // Mendoza — Andes foothills; dry & sunny; wine country; extreme summer heat; harvest Mar-Apr
  'AR-M': { weather: s12(1,1,0,0,0,1,2,1,0,0,0,1), crowds:s12(1,2,2,2,1,0,0,0,1,1,1,1) },
  // Misiones (Iguazú Falls) — subtropical jungle; hot & humid year-round; cooler/drier Jul-Aug
  'AR-N': { weather: s12(2,2,1,1,1,1,1,1,1,1,1,2), health:rep(1), crowds:s12(2,2,1,0,0,0,2,2,1,0,0,1) },
  // Neuquén (Bariloche / Lake District) — ski Jun-Sep; trekking Dec-Feb; shoulder Mar-May
  'AR-Q': { weather: s12(0,0,1,1,2,2,2,2,2,1,0,0), cost:s12(1,1,1,1,1,2,2,2,1,1,1,1), crowds:s12(2,2,1,0,0,1,2,2,1,0,0,1) },
  // Santa Cruz (El Calafate / El Chaltén / Perito Moreno) — Patagonia; ferocious wind; Nov-Feb only
  'AR-Z': { weather: s12(0,0,1,2,3,3,3,3,2,1,0,0), cost:rep(2), remote:rep(2), crowds:s12(3,3,2,1,0,0,0,0,0,0,1,2) },
  // Jujuy (Quebrada de Humahuaca / Altiplano) — 3000-4400 m; rainy Dec-Feb; dry May-Oct best
  'AR-Y': { weather: s12(2,2,1,0,0,0,0,0,0,0,1,2), health:rep(1) },

  // ── Colombia ───────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(1), safety:rep(1), lgbtq:rep(1)
  // Bogotá DC — 2600 m; year-round spring ~14°C; two rainy seasons Apr-May & Oct-Nov; most expensive
  'CO-DC': { weather: s12(0,0,1,2,2,1,0,0,1,2,2,1), cost:rep(2) },
  // Antioquia (Medellín) — "eternal spring" 22°C; two brief rainy seasons; top digital-nomad hub
  'CO-ANT': { weather: s12(0,0,0,1,1,0,0,0,1,1,0,0), crowds:rep(2) },
  // Bolívar (Cartagena) — hot Caribbean coast; dry Dec-Apr; rainy May-Nov; historic walled city
  'CO-BOL': { weather: s12(0,0,0,0,1,2,2,2,1,1,1,0), health:rep(1) },
  // Magdalena (Santa Marta / Tayrona NP) — Caribbean coast; hot; best Dec-Mar; park crowded on holidays
  'CO-MAG': { weather: s12(0,0,0,0,1,1,1,1,1,1,1,0), health:rep(1), crowds:s12(2,1,1,0,0,0,0,0,0,0,1,2) },
  // Valle del Cauca (Cali) — warm year-round; two rainy seasons; salsa capital; higher urban crime
  'CO-VAC': { weather: s12(0,0,1,1,1,1,1,0,1,1,1,0), safety:rep(2) },
  // Quindío (Salento / Coffee Region) — lush Andean hills; eternal spring; ecotourism
  'CO-QUI': { weather: s12(0,0,0,1,1,0,0,0,1,1,0,0) },

  // ── Peru ───────────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(1), safety:rep(1), health:rep(1)
  // Lima Metro — Pacific desert coast; sunny Jan-Apr; garúa gray fog Jun-Nov; food capital
  'PE-LIM': { weather: s12(0,0,0,1,1,2,2,2,2,1,1,0), cost:rep(2) },
  // Cusco (Machu Picchu gateway) — 3400 m; dry May-Oct; rainy Nov-Apr (landslides); altitude risk
  'PE-CUS': { weather: s12(2,2,1,0,0,0,0,0,0,0,1,2), health:rep(1), crowds:s12(0,0,1,1,2,3,3,3,2,2,1,0) },
  // Madre de Dios (Amazon / Puerto Maldonado) — tropical; very wet Nov-Apr; drier May-Oct
  'PE-MDD': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), health:rep(2), remote:rep(2) },
  // Arequipa — 2300 m; dry & sunny most of year; brief rains Jan-Mar; the "White City"
  'PE-ARE': { weather: s12(1,1,1,0,0,0,0,0,0,0,0,1) },
  // Puno (Lake Titicaca) — 3800 m; dry May-Oct (hard frosts at night); rainy Nov-Apr; altitude risk
  'PE-PUN': { weather: s12(2,2,1,0,0,1,1,1,0,0,1,2), health:rep(1) },
  // Ica (Nazca Lines / Huacachina) — coastal desert; sunny & dry year-round; hot Dec-Mar
  'PE-ICA': { weather: s12(1,1,0,0,0,0,0,0,0,0,0,1) },

  // ── New Zealand ────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(2), safety:rep(0)
  // Auckland — subtropical north; warm humid summer Dec-Feb; wetter winter; busiest gateway
  'NZ-AUK': { weather: s12(0,0,0,1,2,2,2,2,1,1,0,0), crowds:rep(2) },
  // Bay of Plenty (Rotorua / Tauranga) — geothermal; warm; best Nov-Apr; lush kiwi heartland
  'NZ-BOP': { weather: s12(0,0,0,1,1,2,2,2,1,1,0,0) },
  // Wellington — windiest capital on earth; cooler; excellent arts and food scene
  'NZ-WGN': { weather: s12(1,1,1,2,2,2,2,2,2,1,1,1) },
  // Canterbury (Christchurch) — drier east coast; continental; coldest winters; best Dec-Feb
  'NZ-CAN': { weather: s12(0,0,1,1,2,2,3,3,2,1,0,0) },
  // Otago (Queenstown / Dunedin) — ski Jun-Sep; summer trekking Dec-Feb; premium resort costs
  'NZ-OTA': { weather: s12(0,0,1,1,2,2,2,2,2,1,0,0), cost:s12(2,2,2,2,2,3,3,3,2,2,2,2), crowds:s12(3,3,2,1,1,2,3,3,1,1,2,3) },
  // Southland / Fiordland (Milford Sound) — wettest region NZ; dramatic; cold; unpredictable
  'NZ-STL': { weather: s12(1,1,2,2,2,3,3,3,2,2,1,1) },

  // ── Egypt ──────────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(1), safety:rep(1)
  // Cairo / Giza — extreme heat Jun-Sep (45°C+); best Oct-Apr; pyramids always overcrowded
  'EG-C': { weather: s12(0,0,0,1,2,3,3,3,2,0,0,0), crowds:rep(3) },
  // Alexandria — Mediterranean coast; cooler and wetter than Cairo; Roman heritage; best Mar-Jun
  'EG-ALX': { weather: s12(1,1,1,0,0,0,0,1,0,0,1,1) },
  // Red Sea / Al Bahr al Ahmar (Hurghada / Marsa Alam) — desert coast; best Oct-May; diving year-round
  'EG-BA': { weather: s12(1,1,0,0,0,1,2,2,1,0,0,1), beaches:s12(0,0,0,0,0,1,1,1,0,0,0,0) },
  // South Sinai (Sharm el-Sheikh / Dahab) — Red Sea resorts; best Oct-May; Sinai peninsula caution
  'EG-JS': { weather: s12(1,1,0,0,0,1,2,2,1,0,0,1), beaches:s12(0,0,0,0,0,1,1,1,0,0,0,0) },
  // Luxor — Upper Egypt; Valley of Kings / Karnak; brutal Jun-Sep heat; best Nov-Feb
  'EG-LX': { weather: s12(0,0,0,1,2,3,3,3,2,1,0,0), crowds:rep(2) },

  // ── Nigeria ─────────────────────────────────────────────────────────────────────
  // National fallbacks: safety:rep(2), health:rep(2), lgbtq:rep(3)
  // Lagos State — commercial megacity; urban crime + traffic chaos; most expensive; very crowded
  'NG-LA': { cost:rep(2), crowds:rep(3) },
  // FCT Abuja — purpose-built capital; more orderly; diplomatic/expat hub; safer than Lagos
  'NG-FC': { safety:rep(1), cost:rep(2) },
  // Kano State — major northern city; Islamic conservative; sharia law applies; high security risk
  'NG-KN': { safety:rep(3) },
  // Rivers State (Port Harcourt) — Niger Delta oil hub; kidnapping and armed-gang risk
  'NG-RI': { safety:rep(3) },
  // Cross River (Calabar) — southeast; wildlife / ecotourism; more stable than Delta/North
  'NG-CR': { safety:rep(1) },

  // ── Pakistan ───────────────────────────────────────────────────────────────────
  // National fallbacks: safety:rep(2), lgbtq:rep(3), health:rep(1)
  // Islamabad Capital Territory — well-planned diplomatic capital; Margalla Hills; safest major city
  'PK-IS': { safety:rep(1), weather: s12(1,1,1,0,0,1,2,2,1,0,1,1) },
  // Punjab (Lahore) — Mughal heritage; safe for tourism; extreme summer heat; best Oct-Mar
  'PK-PB': { safety:rep(1), weather: s12(1,1,0,0,2,3,3,3,1,0,0,1), crowds:rep(2) },
  // Sindh (Karachi) — port megacity; urban crime; extreme heat Apr-Jun; best Nov-Feb
  'PK-SD': { weather: s12(0,0,1,2,3,2,1,1,1,0,0,0) },
  // Gilgit-Baltistan (Karakoram / K2 base camp) — spectacular mountain trekking; best May-Sep
  'PK-GB': { safety:rep(1), weather: s12(3,3,2,1,0,0,0,0,0,0,1,3), remote:rep(2) },
  // Balochistan — insurgency; kidnapping risk; vast remote desert; travel strongly discouraged
  'PK-BA': { safety:rep(3), remote:rep(3) },

};

// ─── City markers ─────────────────────────────────────────────────────────────
const CITIES = [
  // ── Southeast Asia ──────────────────────────────────────────────────────────
  mk('Bangkok','TH',13.756,100.502,{
    weather:s12(0,0,0,1,2,3,2,2,1,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,2,2,2,1,1,0,0,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Chiang Mai','TH',18.788,98.993,{
    weather:s12(0,0,1,2,2,3,2,2,1,1,0,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,0,0,0,0,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Phuket','TH',7.878,98.398,{
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,2,2,1,1,1,1,1,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,3,3,3,2,1,0,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Koh Samui','TH',9.530,100.063,{
    weather:s12(1,0,0,0,1,2,2,2,2,2,3,2), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,2,2,2,2,2,3,2), road:rep(2), vaccines:rep(1)
  }),
  mk('Ho Chi Minh City','VN',10.823,106.630,{
    weather:s12(0,0,0,1,2,3,2,2,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,1,1,1,1,1,1,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Hanoi','VN',21.028,105.854,{
    weather:s12(2,2,1,1,1,2,2,2,2,1,1,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,1,1,1,1,1,1,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Hoi An','VN',15.880,108.335,{
    weather:s12(1,1,1,1,1,2,2,2,2,3,3,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,3,2,2,2,2,2,2,2,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,1,1,2,3,3,1), road:rep(2), vaccines:rep(1)
  }),
  mk('Da Nang','VN',16.054,108.202,{
    weather:s12(1,1,1,1,0,0,0,0,1,2,3,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,2,2,2,2,2,1,1,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(0,0,0,0,0,0,0,0,1,2,3,1), road:rep(2), vaccines:rep(1)
  }),
  mk('Siem Reap','KH',13.363,103.860,{
    weather:s12(0,0,1,2,2,3,3,3,2,2,1,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(2,2,2,2,1,1,1,1,1,1,1,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Phnom Penh','KH',11.562,104.916,{
    weather:s12(0,0,1,2,2,3,3,3,2,1,1,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(1,1,1,1,1,1,1,1,1,1,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Luang Prabang','LA',19.883,102.135,{
    weather:s12(0,0,1,2,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,2,1,1,0,0,0,0,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Vientiane','LA',17.975,102.600,{
    weather:s12(0,0,1,2,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Bali','ID',-8.340,115.092,{
    weather:s12(2,2,2,1,1,1,0,0,0,1,2,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,2,1,1,1,1,2,2),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,1,0,1,1,0,0,0,0,1,1), road:rep(2), vaccines:rep(2)
  }),
  mk('Jakarta','ID',-6.211,106.845,{
    weather:s12(3,3,2,1,1,1,0,0,1,1,2,3), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:rep(2),
    disaster:rep(3), visa:rep(0), lgbtq:rep(3), beaches:rep(2), road:rep(2), vaccines:rep(2)
  }),
  mk('Yogyakarta','ID',-7.797,110.370,{
    weather:s12(2,2,2,1,1,1,0,0,1,1,2,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,1,1,1,0,0,0,1,1,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Lombok','ID',-8.553,116.348,{
    weather:s12(2,2,2,1,1,1,0,0,0,1,2,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,1,0,0,0,0,1,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,1,1,0,0,0,0,0,0), road:rep(2), vaccines:rep(2)
  }),
  mk('Manila','PH',14.599,120.984,{
    weather:s12(0,0,0,1,2,2,3,3,2,2,1,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:rep(2),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:rep(2), road:rep(2), vaccines:rep(1)
  }),
  mk('Cebu City','PH',10.311,123.893,{
    weather:s12(0,0,0,1,1,2,3,3,2,1,1,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,2,2,2,1,1,1,1,1,1,1,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,1,2,2,1,0,0,0), road:rep(2), vaccines:rep(1)
  }),
  mk('El Nido','PH',11.195,119.422,{
    weather:s12(0,0,0,0,1,2,3,3,2,1,1,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(2,2,2,2,1,1,0,0,1,1,1,2),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,2,1,1,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Kuala Lumpur','MY',3.140,101.687,{
    weather:s12(1,1,1,1,2,2,2,2,2,2,2,2), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,1,1,1,1,2,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Penang','MY',5.414,100.330,{
    weather:s12(1,1,1,1,2,2,2,2,2,2,2,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,1,1,1,1,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(1,1,1,1,2,2,2,2,2,2,2,1), road:rep(1), vaccines:rep(1)
  }),
  mk('Singapore','SG',1.352,103.820,{
    weather:rep(2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:rep(2),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(2), road:rep(0), vaccines:rep(0)
  }),
  // ── East Asia ────────────────────────────────────────────────────────────────
  mk('Tokyo','JP',35.682,139.691,{
    weather:s12(1,1,0,0,1,2,2,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(1,0,2,1,1,2,1,2,3,2,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Kyoto','JP',35.012,135.768,{
    weather:s12(1,1,0,0,1,2,2,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(1,0,3,2,1,1,1,2,2,2,2,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Osaka','JP',34.693,135.502,{
    weather:s12(1,1,0,0,1,2,2,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(1,0,2,1,1,2,1,2,2,1,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Seoul','KR',37.566,126.978,{
    weather:s12(1,1,1,1,1,2,1,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,1,1,2,2,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Busan','KR',35.180,129.074,{
    weather:s12(1,1,1,1,1,1,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,1,2,1,1,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), road:rep(1), vaccines:rep(0)
  }),
  mk('Taipei','TW',25.041,121.564,{
    weather:s12(1,1,1,1,2,2,3,3,2,1,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,2,2,2,2,1,1,1,1,1,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Hong Kong','HK',22.320,114.170,{
    weather:s12(1,1,1,2,2,2,3,3,2,1,1,1), safety:rep(0), cost:rep(3), family:rep(1), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:rep(3),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(2,2,2,2,1,0,0,1,1,1,2,2), road:rep(0), vaccines:rep(0)
  }),
  mk('Shanghai','CN',31.224,121.469,{
    weather:s12(1,1,1,1,1,1,2,2,1,1,1,1), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(2),
    disaster:rep(1), visa:rep(2), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(0)
  }),
  mk('Beijing','CN',39.905,116.391,{
    weather:s12(2,1,1,1,1,1,2,2,1,1,1,2), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,2),
    disaster:rep(1), visa:rep(2), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(0)
  }),
  mk('Chengdu','CN',30.572,104.066,{
    weather:s12(1,1,1,1,2,2,2,2,2,1,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,1),
    disaster:rep(1), visa:rep(2), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(0)
  }),
  mk('Guangzhou','CN',23.130,113.264,{
    // South China trade hub; warm subtropical; visa-friendly entry point
    weather:s12(1,2,2,2,2,2,2,2,2,1,0,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:rep(2),
    disaster:rep(1), visa:rep(2), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(0)
  }),
  mk('Shenzhen','CN',22.543,114.057,{
    // Tech megacity; ultra-modern; near Hong Kong; subtropical
    weather:s12(1,2,2,2,2,2,2,2,2,1,0,1), safety:rep(0), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(0), crowds:rep(2),
    disaster:rep(1), visa:rep(2), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(0)
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
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), road:rep(0), vaccines:rep(0)
  }),
  mk('Sapporo','JP',43.064,141.347,{
    // Snow Festival; powder skiing; cooler summers; ramen culture
    weather:s12(3,3,2,1,0,0,0,0,0,0,1,3), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,0,0,0,2,0,0,0,2),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  // ── South Asia ───────────────────────────────────────────────────────────────
  mk('Delhi','IN',28.660,77.228,{
    weather:s12(1,1,1,2,3,3,2,2,2,1,0,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,2,2,2,1,1,2,2,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Mumbai','IN',19.076,72.878,{
    weather:s12(0,0,1,1,2,3,3,3,3,1,0,0), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:rep(3),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(2,2,2,2,3,3,3,3,3,1,1,1), road:rep(2), vaccines:rep(2)
  }),
  mk('Goa','IN',15.492,73.826,{
    weather:s12(0,0,0,1,2,3,3,3,3,2,1,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,0,1,1,1,1,1,2,3),
    disaster:rep(2), visa:rep(1), lgbtq:rep(1), beaches:s12(0,0,0,1,2,3,3,3,3,2,1,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Jaipur','IN',26.912,75.787,{
    weather:s12(1,1,1,2,3,3,2,2,2,1,0,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(3),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(2,2,1,1,1,1,0,0,1,2,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Kathmandu','NP',27.717,85.316,{
    weather:s12(1,1,1,1,2,3,3,3,2,0,0,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,1,2,1,0,0,1,2,1,0),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Bangalore','IN',12.972,77.594,{
    // India's tech capital at 900m — best climate in India year-round; cosmopolitan
    weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,2,2,1,1,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Chennai','IN',13.082,80.270,{
    // Hot and humid coastal Tamil Nadu; Oct–Dec NE monsoon; good beach access
    weather:s12(0,0,1,1,2,2,2,2,1,2,3,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,2,2,1,1,1,1,1,0),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(1,1,1,1,2,2,1,1,1,2,3,1), road:rep(2), vaccines:rep(2)
  }),
  mk('Colombo','LK',6.927,79.861,{
    weather:s12(0,0,1,2,3,3,2,2,2,2,2,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,2,2,2,1,1,1,1,1,1,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(1,1,1,2,3,3,2,2,3,2,1,1), road:rep(2), vaccines:rep(1)
  }),
  mk('Malé','MV',4.175,73.509,{
    weather:s12(0,0,0,0,1,2,2,2,1,1,1,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2),
    disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:rep(0), road:rep(2), vaccines:rep(1)
  }),
  // ── Middle East ──────────────────────────────────────────────────────────────
  mk('Dubai','AE',25.204,55.270,{
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(2,2,2,1,1,1,1,1,1,2,2,2),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(1,1,1,0,0,3,3,3,1,0,1,1), road:rep(1), vaccines:rep(0)
  }),
  mk('Istanbul','TR',41.013,28.979,{
    weather:s12(1,1,1,1,0,0,0,0,0,1,1,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,2,2,2,3,3,2,2,1,0),
    disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:s12(3,3,3,2,1,0,0,0,1,2,3,3), road:rep(1), vaccines:rep(1)
  }),
  mk('Tel Aviv','IL',32.066,34.771,{
    weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(2), cost:rep(3), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,2,2,2,2,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2), road:rep(1), vaccines:rep(0)
  }),
  mk('Jerusalem','IL',31.769,35.216,{
    weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(2), cost:rep(3), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,3,3,2,1,1,2,2,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Amman','JO',31.956,35.945,{
    weather:s12(1,1,0,0,0,1,1,1,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0),
    disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Muscat','OM',23.614,58.593,{
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(0),
    disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:s12(1,1,1,1,3,3,3,3,3,1,1,1), road:rep(1), vaccines:rep(0)
  }),
  mk('Tbilisi','GE',41.694,44.833,{
    weather:s12(1,1,1,1,1,0,0,0,0,1,1,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(1), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  // ── Africa ───────────────────────────────────────────────────────────────────
  mk('Cairo','EG',30.033,31.233,{
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(3),
    remote:rep(2), corrupt:rep(3), health:rep(2), crowds:s12(1,2,2,2,1,1,1,1,1,1,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Marrakech','MA',31.630,-7.981,{
    weather:s12(1,1,0,0,1,1,2,2,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,2,2,2,1,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Nairobi','KE',-1.292,36.821,{
    weather:s12(1,1,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(3)
  }),
  mk('Zanzibar','TZ',-6.165,39.199,{
    weather:s12(2,2,2,2,1,0,0,0,1,2,2,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(3), crowds:s12(0,0,1,1,0,0,0,0,0,1,1,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,1,1,1,1,0,0,0,0,0,0), road:rep(2), vaccines:rep(3)
  }),
  mk('Cape Town','ZA',-33.924,18.424,{
    weather:s12(1,1,1,0,1,2,2,2,1,0,0,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,0,0,1,2,2,1,0,0,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,2,3,3,2,1,0,0,0), road:rep(2), vaccines:rep(1)
  }),
  // ── Europe ───────────────────────────────────────────────────────────────────
  mk('Paris','FR',48.857,2.352,{
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(1), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,3,3,3,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Barcelona','ES',41.383,2.183,{
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,3,3,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,2,1,1,0,0,0,0,1,2,3), road:rep(1), vaccines:rep(0)
  }),
  mk('Lisbon','PT',38.722,-9.139,{
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,2,2,2,3,3,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,1,1,0,0,0,0,0,0,1,2), road:rep(1), vaccines:rep(0)
  }),
  mk('Amsterdam','NL',52.370,4.895,{
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,3,2,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Prague','CZ',50.076,14.418,{
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,3,3,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Budapest','HU',47.497,19.040,{
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,3,3,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Berlin','DE',52.520,13.405,{
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,1,2,2,2,2,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Rome','IT',41.897,12.482,{
    weather:s12(1,1,1,0,0,0,1,1,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,3,2,2,3,3,2,2,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Athens','GR',37.984,23.728,{
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,2,2,2,3,3,2,2,1,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,2), road:rep(1), vaccines:rep(0)
  }),
  mk('Dubrovnik','HR',42.651,18.094,{
    weather:s12(2,2,1,1,0,0,0,0,0,1,1,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(1), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,2,1,0,0,0,0,1,2,3), road:rep(1), vaccines:rep(0)
  }),
  mk('London','GB',51.507,-0.127,{
    // Grey, mild, frequently overcast; one of Europe's most expensive cities
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,3,3,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,3,3,3,2,2,2,3,3,3,3), road:rep(0), vaccines:rep(0)
  }),
  mk('Edinburgh','GB',55.953,-3.189,{
    // Colder and wetter than London; dramatically cheaper; world-class culture
    weather:s12(2,2,2,2,1,1,1,1,1,2,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,1,2,3,3,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Vienna','AT',48.208,16.373,{
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,2),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Reykjavik','IS',64.133,-21.895,{
    // Sub-arctic; dramatic landscape; extremely expensive
    weather:s12(3,3,2,2,1,1,1,1,2,2,3,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Marseille','FR',43.296,5.370,{
    // Mediterranean coast — hot dry summers; gritty, affordable; North Africa influence
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,3,3,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,2), road:rep(1), vaccines:rep(0)
  }),
  mk('Nice','FR',43.710,7.262,{
    // French Riviera: excellent weather, expensive in summer peak
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,3,3,2,2,1,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,2,1,0,0,0,0,0,1,2,3), road:rep(1), vaccines:rep(0)
  }),
  mk('Lyon','FR',45.748,4.847,{
    // France's culinary capital; affordable vs Paris; good rail links
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Bordeaux','FR',44.838,-0.578,{
    // Atlantic coast; wine region; pleasant year-round
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,1,2,2,2,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,2,1,0,0,0,0,0,1,2,3), road:rep(1), vaccines:rep(0)
  }),
  mk('Munich','DE',48.135,11.582,{
    // Expensive German city; Alpine access; Oktoberfest; liveable
    weather:s12(2,2,1,1,0,0,0,0,0,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,1,2,2,2,2,2,2,3,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Hamburg','DE',53.551,10.000,{
    // Maritime gateway; milder than Berlin; mid-cost; vibrant arts scene
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,1,2,2,2,2,2,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Madrid','ES',40.416,-3.703,{
    // Hot dry continental summers; affordable vs London/Paris
    weather:s12(1,1,1,0,0,1,1,1,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,2,2,2,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Seville','ES',37.389,-5.985,{
    // Hottest city in mainland Europe Jul–Aug (45 °C possible); magical spring/fall
    weather:s12(1,1,0,0,0,2,3,3,1,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,2,2,1,1,1,1,2,1,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(3,3,2,1,0,0,0,0,1,2,3,3), road:rep(1), vaccines:rep(0)
  }),
  mk('Valencia','ES',39.470,-0.376,{
    // Sunniest major European city; beach access; more affordable than Barcelona
    weather:s12(1,1,0,0,0,0,0,0,0,0,0,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,1,1,0,0,0,0,0,0,1,2), road:rep(1), vaccines:rep(0)
  }),
  mk('Milan','IT',45.465,9.186,{
    // Italy's most expensive city; fashion/finance hub; Alpine proximity
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,2,2,2,2,2,2,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Florence','IT',43.769,11.256,{
    // Renaissance art; extremely overcrowded May–Sep; great spring/fall
    weather:s12(1,1,1,1,1,0,0,0,0,1,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,3,3,3,3,3,3,2,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Venice','IT',45.441,12.315,{
    // Unique city; flood-prone; premium prices; avoid Jul–Aug cruise crowds
    weather:s12(1,1,1,1,1,0,0,0,0,1,1,2), safety:rep(0), cost:rep(3), family:rep(1), solo:rep(0),
    remote:rep(2), corrupt:rep(1), health:rep(0), crowds:s12(1,1,2,3,3,3,3,3,3,2,2,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Naples','IT',40.851,14.268,{
    // Affordable Italy; pizza capital; chaotic; Vesuvius nearby
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,2,1,0,0,0,0,0,1,2,3), road:rep(1), vaccines:rep(0)
  }),
  mk('Porto','PT',41.157,-8.629,{
    // Charming; one of Europe's best-value cities; mild Atlantic climate
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,3,3,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(2,2,1,1,0,0,0,0,0,0,1,2), road:rep(1), vaccines:rep(0)
  }),
  mk('Copenhagen','DK',55.676,12.568,{
    // Expensive Scandinavian capital; cycling-friendly; very high quality of life
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,3,2,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Stockholm','SE',59.330,18.068,{
    // Beautiful archipelago city; very expensive; bright summer; dark winter
    weather:s12(3,2,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,1,2,3,3,1,0,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Dublin','IE',53.344,-6.267,{
    // Rainy but friendly; expensive; great pub culture
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Brussels','BE',50.850,4.351,{
    // EU capital; mid-cost; multicultural; grey winters
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Warsaw','PL',52.237,21.017,{
    // Fast-growing; excellent value; cold winters; welcoming for remote workers
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Krakow','PL',50.062,19.940,{
    // Best-value city in Central Europe; beautiful Old Town; cold winters
    weather:s12(2,2,1,1,1,0,0,0,0,1,2,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,2,2,2,3,3,2,2,1,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Tallinn','EE',59.437,24.754,{
    // Medieval gem; affordable; cold dark winters; thriving digital scene
    weather:s12(3,2,2,1,1,0,0,0,1,1,2,3), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,1,2,3,3,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Zurich','CH',47.378,8.540,{
    // World's most expensive city; exceptionally clean and efficient
    weather:s12(2,2,1,1,0,0,0,0,0,1,2,2), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Split','HR',43.508,16.440,{
    // Adriatic gateway; cheaper than Dubrovnik; excellent summer
    weather:s12(2,2,1,1,0,0,0,0,0,1,1,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(0,0,0,1,2,2,3,3,2,1,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,3,2,1,0,0,0,0,1,2,3), road:rep(1), vaccines:rep(0)
  }),
  // ── Americas ─────────────────────────────────────────────────────────────────
  mk('New York','US',40.712,-74.006,{
    weather:s12(2,2,1,1,0,0,0,0,0,1,1,2), safety:rep(1), cost:rep(3), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:s12(3,3,3,3,1,0,0,0,1,2,3,3), road:rep(1), vaccines:rep(0)
  }),
  mk('Miami','US',25.774,-80.194,{
    weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(1), cost:rep(3), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(2,2,2,2,1,1,1,1,1,1,2,2),
    disaster:rep(2), visa:rep(1), lgbtq:rep(0), beaches:s12(1,1,1,1,1,1,1,1,1,1,1,1), road:rep(1), vaccines:rep(0)
  }),
  // ── USA — city-level granularity (weather, cost, safety vary significantly) ──
  mk('Los Angeles','US',34.052,-118.244,{
    weather:s12(0,0,0,0,0,0,0,0,0,0,0,0), safety:rep(1), cost:rep(3), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(0), beaches:s12(0,0,0,0,0,0,0,0,0,0,0,0), road:rep(1), vaccines:rep(0)
  }),
  mk('San Francisco','US',37.774,-122.419,{
    // Mild Mediterranean coast — noticeably cooler than inland CA all year
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(2), cost:rep(3), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,1,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(1), vaccines:rep(0)
  }),
  mk('Bakersfield','US',35.373,-119.019,{
    // Central Valley: 40 °C+ summers — much hotter and cheaper than coastal CA
    weather:s12(0,0,1,1,1,2,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(1), crowds:rep(0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Sacramento','US',38.582,-121.494,{
    // Inland valley — hot dry summers, mild winters; moderately priced
    weather:s12(0,0,1,1,1,1,3,3,2,1,0,0), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,1,1,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Las Vegas','US',36.175,-115.137,{
    // Desert: extreme heat Jun–Sep; cheap accommodation, poor walkability
    weather:s12(0,1,1,1,1,2,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(2), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(2,2,2,2,2,1,1,1,2,2,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Seattle','US',47.607,-122.331,{
    // Rainy but mild; excellent summer; expensive tech-hub city
    weather:s12(2,2,2,1,1,0,0,0,1,1,2,2), safety:rep(1), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,2,1,1,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(1), vaccines:rep(0)
  }),
  mk('Denver','US',39.739,-104.984,{
    // Mile-high: variable weather, cold snaps Oct–Apr; growing but moderate cost
    weather:s12(1,1,1,1,1,0,0,0,0,1,1,1), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,1,2,2,2,2,2,1,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Chicago','US',41.881,-87.623,{
    // Brutally cold winters and wind; good summer; mid-high cost
    weather:s12(3,2,2,1,1,0,0,0,0,1,1,3), safety:rep(2), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,2,1,1,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,0,0,1,3,3,3), road:rep(1), vaccines:rep(0)
  }),
  mk('Boston','US',42.360,-71.059,{
    // Cold winters, pleasant fall/spring; one of the most expensive US cities
    weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(1), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,2,2,2,2,2,2,2,1,0),
    disaster:rep(0), visa:rep(1), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(1), vaccines:rep(0)
  }),
  mk('Worcester','US',42.262,-71.802,{
    // Same climate as Boston but significantly cheaper; few tourists
    weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(0),
    disaster:rep(0), visa:rep(1), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Austin','US',30.267,-97.743,{
    // Hot summers (≥38 °C Jul–Aug), mild winters; fast-growing, moderately expensive
    weather:s12(1,1,1,1,2,2,3,3,2,1,1,1), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,1,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Houston','US',29.760,-95.370,{
    // Humid subtropical: sweltering summers; hurricane risk; affordable
    weather:s12(1,1,1,2,2,2,3,3,3,2,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(1), crowds:s12(0,0,1,1,2,2,1,1,1,1,0,0),
    disaster:rep(3), visa:rep(1), lgbtq:rep(1), beaches:s12(2,2,2,2,2,2,3,3,3,2,2,2), road:rep(1), vaccines:rep(0)
  }),
  mk('New Orleans','US',29.951,-90.071,{
    // Hot and very humid Jun–Sep; hurricane season; affordable; rich culture
    weather:s12(1,1,1,2,2,2,3,3,3,2,1,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,2,3,2,1,1,1,1,1,2,2),
    disaster:rep(3), visa:rep(1), lgbtq:rep(1), beaches:s12(2,2,2,2,2,3,3,3,3,2,2,2), road:rep(1), vaccines:rep(0)
  }),
  mk('Nashville','US',36.162,-86.782,{
    // Four distinct seasons; hot humid summers; affordable, rapidly gentrifying
    weather:s12(1,1,2,1,1,0,1,1,0,1,1,2), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Phoenix','US',33.448,-112.074,{
    // Sonoran Desert: brutal dry heat Jun–Sep (45 °C); excellent Nov–Apr
    weather:s12(0,0,0,1,2,3,3,3,3,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(2,2,2,1,1,0,0,0,1,2,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Portland','US',45.523,-122.676,{
    // Mild rainy winters; excellent warm dry summer; moderately expensive
    weather:s12(2,2,2,1,1,0,0,0,1,1,2,2), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,2,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:s12(3,3,3,3,2,1,1,1,2,3,3,3), road:rep(1), vaccines:rep(0)
  }),
  mk('San Diego','US',32.716,-117.163,{
    // Near-perfect weather year-round; expensive but less than LA; Navy city
    weather:s12(0,0,0,0,0,0,0,0,0,0,0,0), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,2,2,2,2,2,2,2,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:s12(0,0,0,0,0,0,0,0,0,0,0,0), road:rep(1), vaccines:rep(0)
  }),
  mk('Minneapolis','US',44.978,-93.265,{
    // Extremely cold winters; excellent culture and lakes; mid-cost
    weather:s12(3,3,3,2,1,0,0,0,1,1,2,3), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,0,1,1,2,2,2,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Dallas','US',32.776,-96.797,{
    // Hot Dallas summers; sprawling metro; business hub; tornado risk
    weather:s12(1,1,1,1,2,2,3,3,2,1,1,1), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,1,2,2,1,1,1,1,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Atlanta','US',33.749,-84.388,{
    // Hot humid summers; international airport; significant cost variation by area
    weather:s12(1,1,1,0,1,1,2,2,1,0,0,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,2,1,1,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Orlando','US',28.538,-81.379,{
    // Theme park capital; hot humid summers; hurricane season; very busy
    weather:s12(1,1,0,0,1,2,2,2,2,1,1,1), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(3,3,2,2,2,2,2,2,2,2,3,3),
    disaster:rep(2), visa:rep(1), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Charlotte','US',35.227,-80.843,{
    // Fast-growing banking hub; mild four seasons; mid-cost
    weather:s12(1,1,1,1,0,0,1,1,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,2,2,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Salt Lake City','US',40.760,-111.891,{
    // Gateway to Utah's parks; cold winters; near-perfect powder skiing
    weather:s12(1,1,1,1,1,1,2,2,1,0,0,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,1,2,2,1,1,1,1,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Indianapolis','US',39.769,-86.158,{
    // Affordable Midwest hub; cold winters; F1/IndyCar racing
    weather:s12(2,2,1,1,1,0,1,1,0,1,1,2), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(0,0,0,1,1,2,1,1,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Detroit','US',42.331,-83.046,{
    // Very affordable; industrial revival; brutal winters; excellent music/food
    weather:s12(3,3,2,1,1,0,0,0,1,1,2,3), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(0), crowds:s12(0,0,0,1,1,2,2,2,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('San Antonio','US',29.425,-98.494,{
    // Affordable Texas city; River Walk; hot summers but less intense than Dallas
    weather:s12(1,1,1,1,2,2,3,3,2,1,1,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,1,2,2,1,1,1,1,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Honolulu','US',21.307,-157.858,{
    // Tropical paradise; premium cost; ideal year-round weather
    weather:s12(0,0,0,0,0,0,0,0,0,0,0,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(2,2,2,2,1,1,1,1,1,2,2,2),
    disaster:rep(2), visa:rep(1), lgbtq:rep(0), beaches:s12(0,0,0,0,0,0,0,0,0,0,0,0), road:rep(1), vaccines:rep(0)
  }),
  mk('Mexico City','MX',19.433,-99.133,{
    weather:s12(1,1,1,1,2,1,1,1,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(1), crowds:s12(1,2,1,1,1,1,0,0,1,1,2,2),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Playa del Carmen','MX',20.628,-87.080,{
    weather:s12(0,0,0,1,2,1,1,1,2,1,0,0), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,1,1,1,1,1,1,0,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Cancún','MX',21.161,-86.851,{
    weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(2), cost:rep(2), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(3,2,2,2,1,1,1,1,1,1,2,3),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,1,2,2,2,1,1,0,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Medellín','CO',6.251,-75.564,{
    weather:s12(0,1,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(0), corrupt:rep(3), health:rep(2), crowds:s12(1,1,1,1,1,0,0,0,0,1,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Cartagena','CO',10.391,-75.479,{
    weather:s12(0,0,0,1,1,1,0,0,0,0,1,0), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(2,2,1,1,1,0,0,0,0,1,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,1,1,0,0,0,0,1,0), road:rep(2), vaccines:rep(2)
  }),
  mk('Buenos Aires','AR',-34.610,-58.370,{
    weather:s12(1,1,0,1,2,2,2,2,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Rio de Janeiro','BR',-22.907,-43.173,{
    weather:s12(2,2,2,2,1,1,0,0,1,2,2,2), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(2,3,1,1,1,1,1,1,1,1,1,2),
    disaster:rep(2), visa:rep(1), lgbtq:rep(1), beaches:s12(0,0,0,1,1,2,2,2,1,0,0,0), road:rep(2), vaccines:rep(2)
  }),
  mk('Cusco','PE',-13.531,-71.967,{
    weather:s12(0,0,1,1,1,2,2,2,1,0,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,0,1,1,1,1,1,2,2,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Lima','PE',-12.046,-77.043,{
    // Pacific coast capital; perpetual grey overcast Jun-Oct; South America's best food scene
    weather:s12(0,0,1,1,1,2,2,2,1,0,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,1,1,1,1,1,1,2,2,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(2,2,1,1,1,2,3,3,2,1,1,2), road:rep(2), vaccines:rep(2)
  }),
  mk('Bogota','CO',4.711,-74.073,{
    // High-altitude capital at 2,600m; transformed safety; cool climate year-round; thriving food scene
    weather:s12(1,2,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(0), corrupt:rep(3), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Santiago','CL',-33.459,-70.648,{
    // South America's most developed city; Andes access; wine country nearby; earthquake-prone
    weather:s12(1,1,0,0,1,2,2,2,1,0,0,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(1,1,0,0,1,1,1,1,1,0,0,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Quito','EC',-0.229,-78.524,{
    // Equatorial capital at 2,850m; near-perfect spring climate year-round; Galapagos gateway
    weather:s12(1,2,2,1,1,0,0,0,1,2,1,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,0),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Havana','CU',23.135,-82.358,{
    // Frozen-in-time capital; vibrant music and art; very limited internet; genuinely unique
    weather:s12(0,0,0,1,1,2,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(3), corrupt:rep(3), health:rep(1), crowds:s12(0,0,0,1,1,1,1,1,0,0,0,0),
    disaster:rep(2), visa:rep(2), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,1,0,0,0), road:rep(1), vaccines:rep(1)
  }),
  mk('Guadalajara','MX',20.676,-103.347,{
    // Mexico's cultural capital; tequila and mariachi heartland; safer than CDMX; colonial charm
    weather:s12(0,0,1,1,2,1,1,1,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(1), crowds:s12(0,0,1,1,1,1,1,1,1,1,1,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  // ── Africa (new) ─────────────────────────────────────────────────────────────
  mk('Johannesburg','ZA',-26.205,28.049,{
    // Africa's economic hub; world-class food and arts; among the world's highest crime rates
    weather:s12(1,1,1,0,1,2,2,2,1,0,0,1), safety:rep(3), cost:rep(1), family:rep(2), solo:rep(3),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,0,0,1,1,2,2,1,0,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Lagos','NG',6.524,3.379,{
    // Africa's largest city; raw energy; serious safety concerns; major trade hub
    weather:s12(1,1,2,2,3,3,3,3,2,2,1,1), safety:rep(3), cost:rep(2), family:rep(3), solo:rep(3),
    remote:rep(2), corrupt:rep(3), health:rep(3), crowds:rep(3),
    disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:s12(1,1,1,2,3,3,3,3,2,2,1,1), road:rep(2), vaccines:rep(3)
  }),
  mk('Accra','GH',5.614,-0.205,{
    // West Africa's most welcoming capital; English-speaking; stable democracy; rising tech scene
    weather:s12(1,2,2,2,3,3,2,2,2,1,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(1,1,1,2,3,3,2,2,2,1,1,1), road:rep(2), vaccines:rep(3)
  }),
  mk('Addis Ababa','ET',8.995,38.763,{
    // High-altitude capital at 2,400m; Africa's diplomatic centre; improving infrastructure
    weather:s12(1,1,2,2,3,3,2,2,2,1,0,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0),
    disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(3)
  }),
  mk('Dakar','SN',14.693,-17.447,{
    // West Africa's cultural capital; ocean breezes keep temperatures bearable; friendly and safe
    weather:s12(1,1,1,1,2,3,3,3,3,2,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(3), crowds:rep(0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,1,2,2,2,2,1,0,0), road:rep(2), vaccines:rep(3)
  }),
  mk('Casablanca','MA',33.573,-7.589,{
    // Morocco's business capital; less touristy than Marrakech; cosmopolitan Atlantic city
    weather:s12(1,1,0,0,1,1,1,1,1,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,1,1,1,1,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(1,1,1,0,0,0,0,0,0,0,1,1), road:rep(2), vaccines:rep(1)
  }),
  mk('Kigali','RW',-1.941,30.060,{
    // Cleanest city in Africa; remarkable post-genocide development; very safe; gorilla trekking base
    weather:s12(1,1,2,2,1,0,0,0,1,2,2,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(2), crowds:rep(0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Mombasa','KE',-4.043,39.668,{
    // Kenya's coastal city; Swahili culture; Old Town; Indian Ocean beaches; less safe than Nairobi
    weather:s12(1,1,2,2,2,1,0,0,1,2,2,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,1,1,1,0,0,0,0,1,1,0), road:rep(2), vaccines:rep(3)
  }),
  // ── Central Asia (new) ────────────────────────────────────────────────────────
  mk('Almaty','KZ',43.238,76.896,{
    // Kazakhstan's financial hub; Tian Shan ski resorts nearby; excellent food scene; cold winters
    weather:s12(3,2,1,1,0,0,0,0,0,1,2,3), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Tashkent','UZ',41.300,69.240,{
    // Modernised Silk Road capital; Soviet architecture meets new developments; very affordable
    weather:s12(1,1,1,1,2,3,3,3,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(3), health:rep(1), crowds:rep(0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Samarkand','UZ',39.655,66.975,{
    // Legendary Silk Road city; Registan and Bibi-Khanym; unmissable blue-tiled architecture
    weather:s12(1,1,1,1,2,3,3,3,1,0,0,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(3), health:rep(1), crowds:s12(0,0,1,1,2,2,2,2,2,1,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Bishkek','KG',42.870,74.590,{
    // Central Asian nomadic gateway; Tian Shan trekking; very cheap; limited urban infrastructure
    weather:s12(3,2,1,1,0,0,0,0,0,1,2,3), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  // ── South Asia (new) ─────────────────────────────────────────────────────────
  mk('Kolkata','IN',22.573,88.364,{
    // India's most intellectual city; extreme monsoon flooding; very affordable; intense atmosphere
    weather:s12(1,1,2,2,3,3,3,3,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:rep(2),
    disaster:rep(3), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Varanasi','IN',25.318,83.007,{
    // One of the world's oldest inhabited cities; Ganges ghats; spiritually intense
    weather:s12(1,1,2,2,3,3,2,2,2,1,0,1), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,2,2,2,1,1,2,2,2,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Lahore','PK',31.552,74.343,{
    // Pakistan's cultural capital; Mughal architecture; Lahori cuisine; safety improving steadily
    weather:s12(1,1,2,2,3,3,3,3,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(3),
    remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(1),
    disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  // ── Southeast Asia (new) ──────────────────────────────────────────────────────
  mk('Nha Trang','VN',12.242,109.194,{
    // Vietnam's beach resort city; clear blue water; international party scene
    weather:s12(1,1,1,0,0,0,0,0,1,2,2,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,1,1,0,0,0,1,2,2,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:s12(0,0,0,0,0,0,0,0,1,2,2,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Kota Kinabalu','MY',5.840,116.047,{
    // Borneo gateway; world-class diving; orangutan encounters; affordable island hopping
    weather:s12(1,1,1,2,2,2,2,1,1,1,2,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,1,1,0,0,0,0,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,1,1,2,1,0,0,0,1,1), road:rep(1), vaccines:rep(2)
  }),
  mk('Yangon','MM',16.867,96.195,{
    // Myanmar's largest city; Shwedagon Pagoda; military junta control; check current advisories
    weather:s12(0,0,1,2,2,3,3,3,2,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2),
    remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0),
    disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(2), road:rep(3), vaccines:rep(2)
  }),
  // ── Middle East (new) ─────────────────────────────────────────────────────────
  mk('Riyadh','SA',24.688,46.722,{
    // Saudi capital; Vision 2030 rapid change; still strict dress and behaviour codes
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(0), crowds:s12(0,0,0,1,1,1,1,1,1,1,0,0),
    disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Doha','QA',25.286,51.533,{
    // Ultra-modern Gulf capital; FIFA World Cup legacy; expensive; strict laws but tolerant of tourists
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:rep(1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(2), road:rep(1), vaccines:rep(0)
  }),
  // ── Jordan (new) ─────────────────────────────────────────────────────────────
  mk('Petra','JO',30.328,35.444,{
    // Rose-red Nabataean city; best spring/fall; brutal summer heat in desert canyon
    weather:s12(0,0,0,0,2,3,3,3,2,0,0,0), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(2), crowds:s12(0,0,1,2,2,1,1,1,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Aqaba','JO',29.527,35.006,{
    // Red Sea resort; year-round diving; hot summers; Jordan's only sea access
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(1), crowds:s12(0,0,1,1,1,0,1,0,1,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,1,2,3,3,3,2,1,0,0), road:rep(1), vaccines:rep(0)
  }),
  // ── Georgia (new) ─────────────────────────────────────────────────────────────
  mk('Batumi','GE',41.641,41.636,{
    // Black Sea subtropical resort; palm-lined boulevard; lively casinos; rainy climate
    weather:s12(2,2,1,1,1,2,1,1,1,2,2,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(1), crowds:s12(0,0,0,0,0,2,3,3,1,0,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:s12(2,2,2,2,1,1,0,0,1,1,2,2), road:rep(1), vaccines:rep(0)
  }),
  mk('Kazbegi','GE',42.653,44.634,{
    // High Caucasus trekking; Gergeti Trinity Church; road closed by snow Nov–Apr
    weather:s12(3,3,2,1,1,1,0,0,1,1,2,3), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(1), health:rep(2), crowds:s12(0,0,0,0,1,2,3,3,2,1,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  // ── Armenia (new) ─────────────────────────────────────────────────────────────
  mk('Yerevan','AM',40.181,44.514,{
    // Pink tuff capital; Mt Ararat views on clear days; very hot Jul–Aug; cold winters
    weather:s12(2,2,1,1,1,2,3,3,2,1,1,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(0,0,0,1,2,2,2,2,2,1,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Dilijan','AM',40.742,44.863,{
    // Armenian "Little Switzerland"; forested resort; cool summers; charming craft centre
    weather:s12(3,2,2,1,1,1,0,0,1,1,2,3), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,0,1,2,2,2,1,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  // ── Nepal (new) ───────────────────────────────────────────────────────────────
  mk('Pokhara','NP',28.210,83.984,{
    // Annapurna base; Phewa Lake; paragliding hub; heavy monsoon Jun–Sep grounds trekking
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,2,1,1,1,1,1,2,2,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  // ── Sri Lanka (new) ───────────────────────────────────────────────────────────
  mk('Galle','LK',6.053,80.220,{
    // SW coast Dutch fort; surfing; SW monsoon soaks May–Sep; perfect Dec–Mar
    weather:s12(0,0,0,1,2,3,3,3,2,1,1,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,0,0,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,1,2,3,3,3,2,1,1,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Trincomalee','LK',8.571,81.234,{
    // NE coast; dry season opposite SW coast; whale sharks Apr–Sep; NE monsoon Oct–Feb
    weather:s12(2,1,0,0,0,0,0,0,1,2,3,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,1,2,2,1,1,1,1,0,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(2,1,0,0,0,0,0,0,1,2,3,2), road:rep(2), vaccines:rep(1)
  }),
  mk('Sigiriya','LK',7.957,80.760,{
    // Lion Rock ancient fortress; Cultural Triangle; inter-monsoon showers year-round; best Jan–Mar
    weather:s12(0,0,0,1,2,2,1,1,1,2,2,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,1,2,1,1,0,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  // ── Taiwan (new) ──────────────────────────────────────────────────────────────
  mk('Tainan','TW',22.990,120.212,{
    // Historic SW Taiwan; street food capital; temples; typhoon risk Jul–Sep
    weather:s12(0,0,1,1,1,2,2,3,2,1,0,0), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,2,1,1,1,0,0,0,0,1,1,2),
    disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:s12(1,1,1,1,1,0,0,2,1,1,1,1), road:rep(1), vaccines:rep(0)
  }),
  mk('Kenting','TW',21.942,120.803,{
    // Southern tip tropical beaches; popular domestic destination; typhoons Jul–Sep
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(1,2,2,1,2,1,1,1,1,1,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:s12(0,0,0,1,2,3,3,3,2,1,0,0), road:rep(1), vaccines:rep(0)
  }),
  // ── Myanmar (new) ─────────────────────────────────────────────────────────────
  mk('Bagan','MM',21.174,94.856,{
    // Ancient temple plains; best Oct–Feb; brutal Apr–May heat; military coup severely impacts safety
    weather:s12(0,0,1,2,3,3,2,2,2,1,0,0), safety:rep(3), cost:rep(1), family:rep(2), solo:rep(3),
    remote:rep(2), corrupt:rep(3), health:rep(3), crowds:s12(0,0,1,1,0,0,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(2)
  }),
  mk('Inle Lake','MM',20.574,96.924,{
    // Floating villages; leg-rowing fishermen; cool Shan Plateau altitude; best Nov–Feb
    weather:s12(0,0,0,2,3,3,3,3,2,1,0,0), safety:rep(3), cost:rep(1), family:rep(2), solo:rep(3),
    remote:rep(2), corrupt:rep(3), health:rep(3), crowds:s12(0,0,0,0,0,0,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(2), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(2)
  }),
  // ── Laos (new) ────────────────────────────────────────────────────────────────
  mk('Vang Vieng','LA',18.919,102.450,{
    // Karst limestone scenery; adventure hub; tubing; monsoon May–Sep
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,0,0,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  // ── Cambodia (new) ────────────────────────────────────────────────────────────
  mk('Kampot','KH',10.610,104.181,{
    // Colonial riverside town; famous pepper; Bokor Hill Station; quiet charm
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(2), road:rep(2), vaccines:rep(1)
  }),
  mk('Koh Rong','KH',10.714,103.252,{
    // Remote island; bioluminescent bays; backpacker beaches; monsoon shuts access May–Oct
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(3), crowds:s12(0,0,1,1,0,0,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:s12(0,0,0,1,2,3,3,3,2,1,0,0), road:rep(2), vaccines:rep(1)
  }),
  // ── Malaysia (new) ────────────────────────────────────────────────────────────
  mk('Langkawi','MY',6.350,99.800,{
    // Duty-free island archipelago; beaches; best Nov–Apr dry season; NE monsoon Oct–Dec
    weather:s12(0,0,0,1,1,2,2,1,2,2,1,0), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(1), crowds:s12(0,0,1,1,1,0,0,0,0,1,2,2),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,1,1,2,2,1,2,2,1,0), road:rep(1), vaccines:rep(1)
  }),
  // ── Philippines (new) ─────────────────────────────────────────────────────────
  mk('Puerto Princesa','PH',9.740,118.736,{
    // Palawan; UNESCO Underground River; best Dec–May; wet Jun–Sep
    weather:s12(0,0,0,0,1,2,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,2,1,0,0,0,0,0,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,2,3,3,2,1,0,0), road:rep(2), vaccines:rep(1)
  }),
  // ── Thailand expansion ────────────────────────────────────────────────────────
  mk('Krabi','TH',8.085,98.906,{
    // Andaman coast; dramatic limestone cliffs; Railay Beach; SW monsoon wipes May–Oct
    weather:s12(0,0,0,0,1,3,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,2,2,1,0,0,0,0,0,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,2,3,3,3,2,1,0,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Koh Phangan','TH',9.742,100.029,{
    // Full Moon Party island; Gulf of Thailand; NE monsoon batters Nov–Jan
    weather:s12(1,0,0,0,1,2,2,2,2,2,3,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,1,1,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,2,2,2,2,2,3,1), road:rep(2), vaccines:rep(1)
  }),
  mk('Koh Tao','TH',10.099,99.840,{
    // Premier dive island; Gulf of Thailand; best visibility Feb–Sep
    weather:s12(1,0,0,0,1,1,1,1,1,2,3,2), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,1,1,1,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,0,0,0,0,0,1,2,1), road:rep(2), vaccines:rep(1)
  }),
  mk('Pattaya','TH',12.927,100.877,{
    // Beach resort and nightlife city 2h from Bangkok; Gulf coast; year-round but wet Jun–Sep
    weather:s12(0,0,0,1,1,2,2,2,1,1,0,0), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,2,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,1,1,2,2,2,1,1,0,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Hua Hin','TH',12.570,99.957,{
    // Royal beach resort; quiet and family-friendly; Gulf coast; drier than central Thailand
    weather:s12(0,0,0,0,1,2,2,2,2,2,1,0), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(1), crowds:s12(1,1,1,1,1,1,0,0,0,1,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,2,2,2,2,2,1,0), road:rep(1), vaccines:rep(1)
  }),
  mk('Chiang Rai','TH',19.908,99.831,{
    // Golden Triangle; White Temple (Wat Rong Khun); slower than Chiang Mai; cool Nov–Feb
    weather:s12(0,0,1,2,2,3,2,2,1,1,0,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,1,0,0,0,0,0,0,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Pai','TH',19.357,98.441,{
    // Northern hippy mountain town; waterfalls; misty and cool Dec–Feb; backpacker scene
    weather:s12(1,1,1,2,2,3,3,3,2,1,0,1), safety:rep(0), cost:rep(0), family:rep(1), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,0,0,0,0,0,0,0,0,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Ayutthaya','TH',14.357,100.570,{
    // UNESCO ancient capital; temples and ruins; flood-prone in Oct; 1.5h from Bangkok
    weather:s12(0,0,0,1,2,3,2,2,1,1,0,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,1,0,0,0,0,1,2,2),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Kanchanaburi','TH',14.022,99.533,{
    // Bridge on the River Kwai; WWII Death Railway; waterfalls; peaceful riverside guesthouses
    weather:s12(0,0,0,1,2,3,2,2,2,1,0,0), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,1,0,0,0,0,0,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Koh Chang','TH',12.086,102.310,{
    // Mountainous island; less developed; Gulf NE monsoon; best Nov–May
    weather:s12(0,0,0,0,1,2,2,2,2,2,3,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(2,2,1,1,0,0,0,0,0,1,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,2,2,2,2,2,3,1), road:rep(2), vaccines:rep(1)
  }),
  mk('Koh Lanta','TH',7.630,99.043,{
    // Family-friendly Andaman island; long calm beaches; SW monsoon closes May–Oct
    weather:s12(0,0,0,0,1,3,3,3,2,1,0,0), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(2), health:rep(1), crowds:s12(2,2,2,2,0,0,0,0,0,0,0,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,2,3,3,3,2,1,0,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Koh Phi Phi','TH',7.740,98.778,{
    // Iconic twin islands; The Beach film location; massively crowded Nov–Apr; Andaman
    weather:s12(0,0,0,0,1,3,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(3,3,3,3,1,0,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,2,3,3,3,2,1,0,0), road:rep(3), vaccines:rep(1)
  }),
  mk('Hat Yai','TH',7.009,100.476,{
    // Major southern transport hub near Malaysia border; Muslim majority; near-equatorial rain
    weather:s12(1,1,1,1,2,2,2,2,2,2,2,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,0,0,0,0,0,0,0,1,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  // ── Vietnam expansion ────────────────────────────────────────────────────────
  mk('Hue','VN',16.463,107.590,{
    // Imperial citadel; UNESCO; rain peaks Oct–Jan; best Feb–Sep; typhoon corridor
    weather:s12(1,1,1,1,0,0,0,0,1,3,3,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,2,2,1,1,1,1,1,2,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:rep(2), road:rep(2), vaccines:rep(1)
  }),
  mk('Phu Quoc','VN',10.290,103.984,{
    // Gulf of Thailand island resort; long beaches; visa-free zone; dry Nov–Apr
    weather:s12(0,0,0,0,1,2,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,2,2,2,1,0,0,0,0,0,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,2,3,3,3,2,1,0,0), road:rep(1), vaccines:rep(1)
  }),
  mk('Ha Long Bay','VN',20.910,107.184,{
    // UNESCO limestone karsts; cruise destination; misty fog Feb–Mar; typhoon risk Jul–Sep
    weather:s12(1,2,2,1,1,2,2,2,2,1,0,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,1,1,1,1,1,2,2),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Sapa','VN',22.336,103.844,{
    // Northern highlands trekking; Fansipan; rice terraces; hill tribe villages; cool mist
    weather:s12(2,2,1,1,1,2,2,2,2,1,1,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,1,2,2,1,1,1,1,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Dalat','VN',11.940,108.458,{
    // Southern Highlands hill station; French colonial; cool year-round; rain May–Nov
    weather:s12(0,0,0,1,1,2,2,2,2,1,1,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,1,1,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Mui Ne','VN',10.943,108.285,{
    // Kitesurfing and windsurfing hub; red and white sand dunes; micro-climate stays dry
    weather:s12(0,0,0,0,0,1,1,1,1,1,1,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,2,2,1,0,0,0,0,0,1,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:s12(0,0,0,0,0,1,1,1,1,1,1,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Can Tho','VN',10.046,105.748,{
    // Mekong Delta capital; floating markets; flat waterways; floods May–Nov
    weather:s12(0,0,0,1,2,2,2,2,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,1,1,1,0,0,0,0,1,1,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Ninh Binh','VN',20.252,105.975,{
    // Inland Halong Bay; Trang An boat tours; limestone karsts amid rice paddies; best Oct–Apr
    weather:s12(1,1,1,1,1,2,2,2,2,1,1,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,3,2,1,1,1,1,1,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  // ── Indonesia expansion ──────────────────────────────────────────────────────
  mk('Ubud','ID',-8.507,115.263,{
    // Bali cultural heart; rice terraces; Monkey Forest; inland arts and wellness hub
    weather:s12(2,2,2,1,1,1,0,0,0,1,2,2), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,2,1,1,1,1,2,2),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Seminyak','ID',-8.697,115.165,{
    // Upscale Bali beach strip; luxury resorts; rooftop bars; sunset surf breaks
    weather:s12(2,2,2,1,1,1,0,0,0,1,2,2), safety:rep(1), cost:rep(2), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,2,1,1,1,1,2,2),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,1,0,1,1,0,0,0,0,1,1), road:rep(2), vaccines:rep(2)
  }),
  mk('Canggu','ID',-8.647,115.134,{
    // Bali digital nomad hub; cafes; surf breaks; rice field villas; very fast growth
    weather:s12(2,2,2,1,1,1,0,0,0,1,2,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(0),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,2,1,1,1,1,2,2),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,1,0,1,1,0,0,0,0,1,1), road:rep(2), vaccines:rep(2)
  }),
  mk('Gili Islands','ID',-8.352,116.040,{
    // Three car-free islands off Lombok; snorkelling; sea turtle encounters; no motorised transport
    weather:s12(2,2,2,1,1,1,0,0,0,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,1,2,1,1,1,1,1,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,1,0,1,1,0,0,0,0,1,1), road:rep(3), vaccines:rep(2)
  }),
  mk('Labuan Bajo','ID',-8.496,119.889,{
    // Gateway to Komodo National Park; komodo dragons; world-class diving; best Apr–Oct
    weather:s12(3,3,2,1,1,1,0,0,0,1,2,3), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,1,1,2,1,1,1,1,0,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:s12(3,3,2,0,0,1,0,0,0,0,1,2), road:rep(2), vaccines:rep(2)
  }),
  mk('Medan','ID',3.591,98.674,{
    // North Sumatra capital; gateway to Lake Toba and Bukit Lawang orangutans; equatorial
    weather:rep(2), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,0,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(2)
  }),
  mk('Lake Toba','ID',2.606,98.831,{
    // Massive volcanic caldera lake; Batak culture; Samosir Island; cool plateau altitude
    weather:s12(1,1,1,1,1,2,1,1,1,1,2,2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,1,1,1,0,0,0,1,1,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Surabaya','ID',-7.250,112.750,{
    // East Java metropolis; gateway to Bromo and Ijen volcanoes; Trowulan Majapahit ruins
    weather:s12(2,2,2,1,1,1,0,0,1,1,2,2), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(1,1,1,1,1,0,0,0,0,1,1,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Makassar','ID',-5.147,119.432,{
    // South Sulawesi capital; gateway to Tana Toraja highlands; dry Apr–Nov
    weather:s12(3,2,2,1,1,1,0,0,0,1,1,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,1,1,1,0,0,0,0,0,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(3), beaches:rep(2), road:rep(2), vaccines:rep(2)
  }),
  mk('Raja Ampat','ID',-0.234,130.525,{
    // Most biodiverse marine ecosystem on earth; remote West Papua; liveaboard dive base
    weather:s12(0,0,1,2,2,2,1,1,1,1,0,0), safety:rep(0), cost:rep(2), family:rep(1), solo:rep(0),
    remote:rep(3), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,0,0,0,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,1,2,2,2,1,1,1,1,0,0), road:rep(3), vaccines:rep(2)
  }),
  // ── Philippines expansion ────────────────────────────────────────────────────
  mk('Boracay','PH',11.968,121.925,{
    // Famous white-sand beach; rebuilt after 2018 closure; dry Nov–May; typhoon Jun–Oct
    weather:s12(0,0,0,0,1,2,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(2,2,3,3,2,1,0,0,1,1,2,2),
    disaster:rep(3), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,2,3,3,2,1,0,0), road:rep(3), vaccines:rep(1)
  }),
  mk('Siargao','PH',9.844,126.046,{
    // World-class surf (Cloud 9 break); rapidly growing; typhoon corridor Jun–Nov
    weather:s12(0,0,0,0,0,0,1,1,2,2,2,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,2,2,1,1,1,0,0,0,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,0,0,1,1,2,2,2,1), road:rep(2), vaccines:rep(1)
  }),
  mk('Bohol','PH',9.844,124.144,{
    // Chocolate Hills; Philippine tarsiers; Alona Beach diving; best Dec–May
    weather:s12(0,0,0,0,0,1,2,2,2,1,1,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(1,1,2,2,1,0,0,0,0,0,1,1),
    disaster:rep(3), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,0,1,2,2,2,1,1,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Coron','PH',12.002,120.202,{
    // WWII Japanese wreck diving; mountain lakes; dramatic limestone Palawan island; best Dec–May
    weather:s12(0,0,0,0,1,2,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(1,1,2,2,1,0,0,0,0,0,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,2,1,0,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Davao','PH',7.073,125.613,{
    // Safest large Mindanao city; durian capital; gateway to Mt Apo; no distinct dry season
    weather:s12(0,0,0,0,0,0,1,1,1,0,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:rep(0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(2), road:rep(1), vaccines:rep(1)
  }),
  mk('Batanes','PH',20.448,121.970,{
    // Northernmost Philippines; dramatic sea cliffs and rolling hills; Ivatan stone villages
    weather:s12(1,1,1,2,2,2,3,3,3,2,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(1), health:rep(2), crowds:s12(0,0,0,1,1,0,0,0,0,0,0,0),
    disaster:rep(3), visa:rep(0), lgbtq:rep(1), beaches:rep(2), road:rep(1), vaccines:rep(1)
  }),
  mk('Dumaguete','PH',9.307,123.307,{
    // University city; relaxed expat scene; dive hub (Apo Island nearby); affordable
    weather:s12(0,0,0,0,0,1,1,2,2,1,1,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,0,0,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,0,1,1,2,2,1,1,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Vigan','PH',17.575,120.387,{
    // UNESCO Spanish colonial town; cobblestone Calle Crisologo; Ilocos; typhoon corridor
    weather:s12(0,0,0,1,2,2,2,2,2,2,2,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,0,1,1,0,0,0,0,0,0,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  // ── Malaysia expansion ───────────────────────────────────────────────────────
  mk('Malacca','MY',2.190,102.254,{
    // UNESCO port city; Portuguese Dutch British colonial layers; street food capital
    weather:s12(1,1,1,2,1,1,1,1,2,1,1,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,2,1,1,2,2,2,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Johor Bahru','MY',1.492,103.740,{
    // Singapore border city; day-trip shopping and dining; much cheaper than SG
    weather:rep(2), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Ipoh','MY',4.597,101.091,{
    // Silver mining heritage; exceptional street food; cave temples; charming old town
    weather:s12(1,1,1,2,2,2,2,2,2,2,2,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Cameron Highlands','MY',4.471,101.374,{
    // British hill station at 1500m; tea estates; strawberry farms; cool year-round escape
    weather:s12(1,1,1,1,2,2,2,2,2,2,1,1), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(1,1,2,2,1,1,0,0,0,1,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Kuching','MY',1.552,110.345,{
    // Sarawak Borneo capital; orangutans; proboscis monkeys; colonial waterfront; rainforest
    weather:rep(2), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,1,0,0,0,0,0,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Miri','MY',4.399,113.984,{
    // Sarawak oil city; gateway to Gunung Mulu National Park caves and Bario highlands
    weather:rep(2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:rep(0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(2), road:rep(1), vaccines:rep(1)
  }),
  // ── Myanmar expansion ────────────────────────────────────────────────────────
  mk('Mandalay','MM',21.959,96.083,{
    // Myanmar 2nd city; temples and pagodas; Irrawaddy; military coup severely impacts safety
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3),
    remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0),
    disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(3), road:rep(3), vaccines:rep(2)
  }),
  // ── Cambodia expansion ───────────────────────────────────────────────────────
  mk('Kep','KH',10.483,104.315,{
    // Quiet seaside town; French colonial ruins; famous crab market; pepper plantations
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,2,2,1,1,0,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Battambang','KH',13.094,103.202,{
    // 2nd city; French colonial quarter; bamboo train; Phare Circus; relaxed art scene
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(0),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,0,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Sihanoukville','KH',10.627,103.527,{
    // Former backpacker beach town; massively overdeveloped since 2017; quality sharply degraded
    weather:s12(0,0,0,0,1,2,3,3,2,1,1,0), safety:rep(2), cost:rep(0), family:rep(3), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(0,0,0,0,0,0,0,0,0,0,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:s12(0,0,0,0,1,2,3,3,2,1,1,0), road:rep(2), vaccines:rep(1)
  }),
  // ── Laos expansion ───────────────────────────────────────────────────────────
  mk('Pakse','LA',15.122,105.800,{
    // South Laos gateway; Bolaven Plateau coffee; Wat Phu UNESCO temple; monsoon May–Sep
    weather:s12(0,0,1,2,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(0),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,1,0,0,0,0,0,0,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Don Det','LA',13.932,105.980,{
    // Si Phan Don (4000 Islands); slow Mekong travel; Irrawaddy dolphin sanctuary
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(0), cost:rep(0), family:rep(1), solo:rep(0),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,1,0,0,0,0,0,0,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(3), vaccines:rep(1)
  }),
  mk('Savannakhet','LA',16.557,104.751,{
    // Laos second city; French colonial quarter; key overland crossing to Thailand and Vietnam
    weather:s12(0,0,1,2,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  // ── Brunei ───────────────────────────────────────────────────────────────────
  mk('Bandar Seri Begawan','BN',4.940,114.948,{
    // Wealthy sultanate capital; Omar Ali Saifuddien Mosque; Kampong Ayer water village; no alcohol
    weather:rep(2), safety:rep(0), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(0), health:rep(0), crowds:rep(0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(2), road:rep(0), vaccines:rep(1)
  }),
  // ── Timor-Leste ──────────────────────────────────────────────────────────────
  mk('Dili','TL',-8.560,125.574,{
    // Capital of the world's newest democracy; post-conflict; excellent diving; Portuguese heritage
    weather:s12(2,2,2,1,0,0,0,0,0,1,2,2), safety:rep(2), cost:rep(1), family:rep(2), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:rep(0),
    disaster:rep(2), visa:rep(1), lgbtq:rep(2), beaches:rep(2), road:rep(3), vaccines:rep(2)
  }),
  // ── Pakistan (new) ────────────────────────────────────────────────────────────
  mk('Islamabad','PK',33.729,73.093,{
    // Modern planned capital; gateway to KKH and northern mountains; hot summers with monsoon
    weather:s12(1,1,1,1,2,3,3,3,2,1,1,1), safety:rep(2), cost:rep(0), family:rep(2), solo:rep(2),
    remote:rep(0), corrupt:rep(3), health:rep(2), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,0),
    disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Hunza Valley','PK',36.316,74.647,{
    // Karakoram gem; stunning K2 views; apricot blossoms Apr; best May–Oct; extreme winter
    weather:s12(2,2,1,0,0,1,1,1,1,1,2,3), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(3), corrupt:rep(2), health:rep(3), crowds:s12(0,0,1,2,2,1,1,1,1,0,0,0),
    disaster:rep(2), visa:rep(2), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  // ── Kyrgyzstan (new) ──────────────────────────────────────────────────────────
  mk('Karakol','KG',42.492,78.393,{
    // Tien Shan gateway; Issyk-Kul lake; epic trekking Jul–Aug; winter ski resort
    weather:s12(2,2,2,1,1,1,0,0,1,1,2,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,0,1,2,3,3,1,0,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  // ── Uzbekistan (new) ──────────────────────────────────────────────────────────
  mk('Bukhara','UZ',39.774,64.419,{
    // Silk Road treasure; stunning madrassas and minarets; brutal Jun–Aug heat
    weather:s12(1,1,1,0,1,3,3,3,2,0,1,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,2,2,0,0,0,1,2,1,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  // ── Kazakhstan (new) ──────────────────────────────────────────────────────────
  mk('Astana','KZ',51.180,71.446,{
    // Futuristic capital; extreme continental climate; -30°C winters; short warm summer
    weather:s12(3,3,2,1,1,1,0,0,1,2,3,3), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,0,0,1,1,2,2,1,0,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  // ── Ethiopia (new) ────────────────────────────────────────────────────────────
  mk('Lalibela','ET',12.031,39.047,{
    // Rock-hewn churches; 2600m altitude; Ethiopian Christmas pilgrimage Jan; rains Jun–Sep
    weather:s12(0,0,1,1,2,3,3,3,2,0,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(3), crowds:s12(0,0,0,0,0,0,0,0,0,1,2,2),
    disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Bahir Dar','ET',11.593,37.389,{
    // Lake Tana; source of Blue Nile; Blue Nile Falls; mild plateau altitude
    weather:s12(0,0,1,1,2,3,3,3,2,0,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(3), crowds:s12(0,0,0,0,0,0,0,0,0,1,2,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Gondar','ET',12.603,37.467,{
    // "Camelot of Africa"; Fasilides Castle complex; gateway to Simien Mountains
    weather:s12(0,0,1,1,2,3,3,3,2,0,0,0), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(3), crowds:s12(0,0,0,0,0,0,0,0,0,1,2,1),
    disaster:rep(2), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  // ── Kenya (new) ───────────────────────────────────────────────────────────────
  mk('Lamu','KE',-2.270,40.902,{
    // Ancient Swahili island town; UNESCO; no cars; dhow sailing; best Dec–Mar dry season
    weather:s12(0,0,0,0,2,2,1,1,1,1,2,1), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,0,0,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,0,0,2,2,1,1,1,1,2,1), road:rep(2), vaccines:rep(2)
  }),
  mk('Nanyuki','KE',0.017,37.072,{
    // Mt Kenya gateway; equator marker; ranch tourism; dry seasons Jan–Feb and Jun–Sep
    weather:s12(0,0,1,2,2,2,0,0,0,1,2,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,1,0,0,1,1,1,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  // ── Tanzania (new) ────────────────────────────────────────────────────────────
  mk('Dar es Salaam','TZ',-6.792,39.208,{
    // Largest city; ferry gateway to Zanzibar; long rains Mar–May; hot humid coast
    weather:s12(0,0,2,2,2,1,0,0,0,1,2,2), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(0), corrupt:rep(2), health:rep(2), crowds:s12(1,1,1,1,0,0,1,1,1,1,1,1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:s12(0,0,1,2,2,1,0,0,0,1,1,2), road:rep(2), vaccines:rep(2)
  }),
  mk('Arusha','TZ',-3.387,36.682,{
    // Gateway city for Kilimanjaro, Serengeti, and Ngorongoro; cool altitude; best Jun–Oct
    weather:s12(0,0,1,2,2,1,0,0,0,1,2,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,1,0,0,2,2,2,1,0,0),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  // ── Morocco (new) ─────────────────────────────────────────────────────────────
  mk('Fez','MA',34.037,-5.000,{
    // Largest intact medieval medina; best Apr–May and Sep–Oct; Jul–Aug brutally hot
    weather:s12(1,1,0,0,1,2,3,3,2,0,1,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,2,2,1,2,2,1,2,1,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(0)
  }),
  mk('Essaouira','MA',31.508,-9.759,{
    // Atlantic walled city; windsurfing capital; cool ocean breeze softens summer heat
    weather:s12(1,1,1,0,0,1,1,1,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,2,2,1,2,2,1,1,1,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(1,1,1,1,1,2,2,2,1,1,1,1), road:rep(2), vaccines:rep(0)
  }),
  mk('Chefchaouen','MA',35.171,-5.269,{
    // The blue city; Rif Mountains; cool altitude; hippie heritage; photogenic alleys
    weather:s12(1,1,0,0,0,1,2,2,1,0,1,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,2,2,1,2,2,1,2,1,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(0)
  }),
  mk('Merzouga','MA',31.080,-4.012,{
    // Erg Chebbi Sahara dunes; camel treks; dramatic sunrises; extreme summer heat
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(3), crowds:s12(0,0,1,1,1,0,0,0,1,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(0)
  }),
  // ── Peru (new) ────────────────────────────────────────────────────────────────
  mk('Arequipa','PE',-16.409,-71.537,{
    // White city of sillar stone; 2335m; gateway to Colca Canyon; dry May–Dec
    weather:s12(1,2,1,0,0,0,0,0,0,0,0,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,0,0,1,2,2,2,1,1,1,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Huaraz','PE',-9.527,-77.528,{
    // Cordillera Blanca; 3052m; trekking Mecca; Huayhuash Circuit; dry May–Sep
    weather:s12(2,2,2,1,0,0,0,0,0,0,1,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,0,2,3,3,3,2,1,0,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  // ── Bolivia (new) ─────────────────────────────────────────────────────────────
  mk('La Paz','BO',-16.495,-68.137,{
    // World's highest capital at 3625m; cable cars; witches market; dry Jun–Aug best
    weather:s12(2,2,1,1,0,0,0,0,0,1,1,2), safety:rep(2), cost:rep(0), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(0,0,0,0,0,2,2,2,1,1,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Sucre','BO',-19.047,-65.260,{
    // Constitutional white city; 2790m; mild year-round climate; best Apr–Oct dry season
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:s12(0,0,0,0,1,1,1,1,1,0,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Uyuni','BO',-20.461,-66.825,{
    // Salar de Uyuni; world's largest salt flat; mirror effect in wet season Dec–Mar
    weather:s12(2,2,1,0,0,0,0,0,0,0,1,2), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(3), health:rep(3), crowds:s12(0,0,0,0,0,1,1,1,0,0,0,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  // ── Ecuador (new) ─────────────────────────────────────────────────────────────
  mk('Guayaquil','EC',-2.170,-79.922,{
    // Pacific port city; Galápagos gateway; hot and humid; wet season Jan–May
    weather:s12(2,2,2,1,1,0,0,0,0,1,1,2), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(0), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,1,0,0,0,0,1,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(2), beaches:rep(2), road:rep(2), vaccines:rep(2)
  }),
  mk('Cuenca','EC',-2.897,-79.005,{
    // Highland colonial city; 2560m; mild spring-like climate year-round; artisan heritage
    weather:s12(1,1,1,1,1,0,0,0,0,1,1,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(1),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,0,0,0,1,1,1,1,0,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Baños','EC',-1.396,-78.425,{
    // Adventure hub at Tungurahua volcano base; jungle gateway; zip-lines; taffy candy
    weather:s12(1,1,1,1,0,0,0,0,0,1,1,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(2), health:rep(2), crowds:s12(0,0,1,1,1,2,2,2,1,1,1,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  // ── Colombia (new) ────────────────────────────────────────────────────────────
  mk('Santa Marta','CO',11.241,-74.212,{
    // Oldest city in Colombia; Sierra Nevada gateway; Caribbean beaches; dry Dec–Apr
    weather:s12(0,0,0,0,1,1,1,1,1,1,1,0), safety:rep(2), cost:rep(1), family:rep(1), solo:rep(2),
    remote:rep(1), corrupt:rep(2), health:rep(1), crowds:s12(0,0,1,1,1,0,0,0,0,1,2,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:s12(0,0,0,0,1,1,1,1,1,1,1,0), road:rep(2), vaccines:rep(2)
  }),
  mk('San Gil','CO',6.557,-73.136,{
    // Adventure capital of Colombia; rafting on Rio Fonce; rappelling; cool climate
    weather:s12(1,1,1,1,2,1,1,1,1,2,1,1), safety:rep(1), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(2), health:rep(2), crowds:s12(0,0,0,0,0,1,2,2,1,0,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(2), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  // ── Costa Rica (new) ──────────────────────────────────────────────────────────
  mk('San José','CR',9.934,-84.088,{
    // Central Valley capital; cool altitude; transport hub; dry Dec–Apr; rainy May–Nov
    weather:s12(0,0,0,0,1,2,2,2,2,2,1,0), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,1,0,0,0,0,0,0,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Tamarindo','CR',10.300,-85.837,{
    // Pacific surf beach town; Guanacaste dry season Dec–Apr; Green Sea Turtles nesting
    weather:s12(0,0,0,0,1,2,3,3,2,2,1,0), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(1), crowds:s12(0,0,0,1,0,0,0,0,0,0,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(0,0,0,0,1,2,3,3,2,2,1,0), road:rep(1), vaccines:rep(1)
  }),
  mk('Puerto Viejo','CR',9.656,-82.756,{
    // Caribbean coast; reggae vibe; sloths; chocolate farms; dry Feb–Sep opposite Pacific
    weather:s12(1,0,0,0,0,0,1,1,1,2,2,2), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(2), corrupt:rep(1), health:rep(2), crowds:s12(1,2,2,2,1,1,0,0,0,0,0,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:s12(1,0,0,0,0,0,1,1,1,2,2,2), road:rep(1), vaccines:rep(1)
  }),
  mk('Monteverde','CR',10.301,-84.820,{
    // Cloud forest; quetzals; canopy zip-lines; perpetual mist and wind; dry Jan–Apr
    weather:s12(0,0,0,1,2,2,2,2,2,2,2,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(1), health:rep(1), crowds:s12(0,0,1,2,1,0,0,0,0,0,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(1), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),
  mk('Manuel Antonio','CR',9.391,-84.142,{
    // National Park; white sand beaches; monkeys; sloths; Costa Rica's most visited NP
    weather:s12(0,0,0,0,1,2,3,3,2,2,1,0), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(1), crowds:s12(0,0,1,2,0,0,0,0,0,0,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:s12(0,0,0,0,1,2,3,3,2,2,1,0), road:rep(1), vaccines:rep(1)
  }),
  // ── Portugal (new) ────────────────────────────────────────────────────────────
  mk('Lagos','PT',37.100,-8.674,{
    // Algarve sea caves; golden cliffs; best Apr–Oct; Europe's most southerly surf
    weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,2,3,3,3,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(1,1,0,0,0,0,0,0,0,0,1,1), road:rep(1), vaccines:rep(0)
  }),
  mk('Sintra','PT',38.798,-9.390,{
    // Fairy-tale palaces and castles; UNESCO; cool Atlantic fog; popular Lisbon day-trip
    weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,1,2,3,3,3,3,2,2,1,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Évora','PT',38.572,-7.910,{
    // Alentejo Roman temple; cork oak forests; walled medieval centre; very hot summers
    weather:s12(1,1,0,0,1,2,3,3,2,0,1,1), safety:rep(0), cost:rep(0), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,2,2,2,2,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Faro','PT',37.019,-7.935,{
    // Algarve capital; Ria Formosa lagoon; flamingos; sunny coast gateway
    weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,1,2,3,3,3,2,1,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:s12(1,1,0,0,0,0,0,0,0,0,1,1), road:rep(1), vaccines:rep(0)
  }),
  // ── Iceland (new) ─────────────────────────────────────────────────────────────
  mk('Akureyri','IS',65.683,-18.091,{
    // Capital of the North; midnight sun Jun–Jul; whale watching; winter Northern Lights
    weather:s12(3,3,2,2,1,0,0,0,1,2,3,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(0,0,0,0,1,2,3,3,2,1,0,0),
    disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Höfn','IS',64.254,-15.205,{
    // Glacier lagoon gateway; Vatnajökull edge; lobster capital of Iceland; remote SE coast
    weather:s12(3,3,2,2,1,0,0,0,1,2,3,3), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(0), health:rep(1), crowds:s12(0,0,0,0,1,2,2,2,1,1,0,0),
    disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),

  // ── United Kingdom (additions) ─────────────────────────────────────────────
  mk('Manchester','GB',53.483,-2.244,{
    // Northern Quarter arts; Oasis/Smiths heritage; football; cheaper than London
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,1,1,1,2,2,2,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Glasgow','GB',55.864,-4.251,{
    // Scotland's largest city; revitalised culture scene; cheapest UK city to visit
    weather:s12(3,3,2,2,1,1,1,1,1,2,2,3), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:rep(1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Cardiff','GB',51.483,-3.168,{
    // Welsh capital; castle, Bay waterfront, rugby culture; cheapest UK capital
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:rep(1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(2), road:rep(0), vaccines:rep(0)
  }),
  mk('Belfast','GB',54.597,-5.930,{
    // Titanic museum, Game of Thrones country; post-Troubles renaissance; cheapest UK city
    weather:s12(2,2,2,1,1,1,1,1,1,1,2,2), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:rep(1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),

  // ── New Zealand ──────────────────────────────────────────────────────────────
  mk('Auckland','NZ',-36.848,174.763,{
    // Gateway city; Waitemata Harbour; day trips to Waiheke and Coromandel; subtropical
    weather:s12(0,0,0,1,2,2,2,2,1,1,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(2,2,2,1,1,1,1,1,1,1,1,2),
    disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:s12(0,0,0,1,2,3,3,3,2,1,0,0), road:rep(0), vaccines:rep(0)
  }),
  mk('Wellington','NZ',-41.286,174.776,{
    // Capital; Te Papa museum; best coffee and food scene in NZ; notoriously windy
    weather:s12(1,1,1,2,2,2,2,2,2,1,1,1), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:rep(1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Queenstown','NZ',-45.031,168.662,{
    // Adventure capital; ski Jul-Sep; bungee/skydive; Remarkables peaks; most expensive NZ city
    weather:s12(0,0,1,1,2,2,2,2,2,1,0,0), safety:rep(0), cost:rep(3), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(0), health:rep(0), crowds:s12(3,3,2,1,1,2,3,3,2,1,2,3),
    disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),
  mk('Christchurch','NZ',-43.532,172.637,{
    // South Island base; rebuilt post-2011 earthquake; Antarctic gateway; drier east coast
    weather:s12(0,0,1,1,2,2,3,3,2,1,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:rep(1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:s12(0,0,1,1,2,3,3,3,2,1,0,0), road:rep(0), vaccines:rep(0)
  }),
  mk('Rotorua','NZ',-38.137,176.251,{
    // Geothermal: geysers, hot springs, mud pools; heart of Maori culture; year-round draw
    weather:s12(0,0,0,1,1,2,2,2,1,1,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(0), corrupt:rep(0), health:rep(0), crowds:s12(1,1,1,1,1,1,1,1,0,0,1,1),
    disaster:rep(2), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(0), vaccines:rep(0)
  }),

  // ── Argentina (additions) ─────────────────────────────────────────────────
  mk('Mendoza','AR',-32.889,-68.845,{
    // Wine capital of South America; Malbec vineyards; Andes views; harvest festival Mar
    weather:s12(1,1,0,0,0,1,2,1,0,0,0,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(1,2,2,2,1,0,0,0,1,1,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Bariloche','AR',-41.133,-71.311,{
    // Patagonian lakes and peaks; ski resort Jul-Sep; trekking Dec-Feb; Swiss-style chocolate
    weather:s12(0,0,1,1,2,2,2,2,2,1,0,0), safety:rep(0), cost:s12(1,1,1,1,1,2,2,2,1,1,1,1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(2,2,1,0,0,1,2,2,1,0,0,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Salta','AR',-24.789,-65.412,{
    // Colonial gem; gateway to Quebrada de Humahuaca and Altiplano; best NW Argentina base
    weather:s12(2,2,1,0,0,0,0,0,0,0,0,1), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(1,1,0,0,0,0,0,0,1,1,1,1),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('El Calafate','AR',-50.338,-72.264,{
    // Perito Moreno Glacier and Los Glaciares NP; Nov-Feb only; expensive logistics
    weather:s12(0,0,1,2,3,3,3,3,2,1,0,0), safety:rep(0), cost:rep(2), family:rep(0), solo:rep(0),
    remote:rep(2), corrupt:rep(0), health:rep(0), crowds:s12(3,3,2,1,0,0,0,0,0,0,1,2),
    disaster:rep(0), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(0)
  }),
  mk('Puerto Iguazú','AR',-25.599,-54.570,{
    // Argentine side of Iguazú Falls; triple frontier Brazil–Paraguay; subtropical jungle
    weather:s12(2,2,1,1,1,1,1,1,1,1,1,2), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(0),
    remote:rep(1), corrupt:rep(1), health:rep(1), crowds:s12(1,1,1,1,0,0,1,2,1,1,1,1),
    disaster:rep(1), visa:rep(0), lgbtq:rep(0), beaches:rep(3), road:rep(1), vaccines:rep(1)
  }),

  // ── Egypt (additions) ─────────────────────────────────────────────────────
  mk('Alexandria','EG',31.200,29.918,{
    // Mediterranean port; Bibliotheca Alexandrina; Ptolemaic and Roman ruins; domestic beach hub
    weather:s12(1,1,1,0,0,0,0,1,0,0,1,1), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(1), crowds:s12(0,0,0,1,1,2,3,3,1,0,0,0),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(1,1,1,1,1,0,0,0,1,1,1,1), road:rep(2), vaccines:rep(1)
  }),
  mk('Luxor','EG',25.687,32.639,{
    // Valley of Kings, Karnak, Luxor Temple; greatest open-air museum; brutal Jun-Sep heat
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(1), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(1), crowds:s12(2,2,1,1,1,0,0,0,0,1,2,2),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Aswan','EG',24.088,32.899,{
    // Nile Nubian culture; most relaxed city in Egypt; Abu Simbel day trip; felucca sailing
    weather:s12(0,0,0,1,2,3,3,3,2,1,0,0), safety:rep(1), cost:rep(0), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(1), crowds:s12(1,1,0,0,0,0,0,0,0,0,1,2),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(1)
  }),
  mk('Sharm el-Sheikh','EG',27.915,34.329,{
    // Red Sea diving and snorkelling; Naama Bay resort strip; international enclave; Sinai
    weather:s12(1,1,0,0,0,1,2,2,1,0,0,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,0,1,2,2,1,0,0,0), road:rep(2), vaccines:rep(1)
  }),
  mk('Hurghada','EG',27.258,33.812,{
    // Long Red Sea resort strip; scuba and snorkelling; glass-bottomed boats; budget diving hub
    weather:s12(1,1,0,0,0,1,2,2,1,0,0,1), safety:rep(1), cost:rep(1), family:rep(0), solo:rep(1),
    remote:rep(0), corrupt:rep(1), health:rep(1), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2),
    disaster:rep(0), visa:rep(0), lgbtq:rep(3), beaches:s12(0,0,0,0,0,1,1,1,0,0,0,0), road:rep(2), vaccines:rep(1)
  }),

  // ── Nigeria (additions) ───────────────────────────────────────────────────
  mk('Abuja','NG',9.057,7.495,{
    // Planned federal capital; cleaner and safer than Lagos; diplomatic expat hub; Aso Rock
    weather:s12(0,0,1,1,2,2,2,2,2,1,0,0), safety:rep(1), cost:rep(2), family:rep(1), solo:rep(1),
    remote:rep(0), corrupt:rep(2), health:rep(2), crowds:rep(1),
    disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Kano','NG',12.000,8.517,{
    // Ancient walled city; Emir's Palace; leather dye pits; Hausa heritage; Sahel climate
    weather:s12(0,0,1,2,3,2,1,1,1,0,0,0), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3),
    remote:rep(1), corrupt:rep(3), health:rep(2), crowds:rep(1),
    disaster:rep(0), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
  }),
  mk('Port Harcourt','NG',4.815,7.049,{
    // Niger Delta oil hub; armed crime and kidnapping risk; primarily oil-sector business travel
    weather:s12(1,1,1,1,2,2,2,2,2,1,1,1), safety:rep(3), cost:rep(2), family:rep(3), solo:rep(3),
    remote:rep(0), corrupt:rep(3), health:rep(2), crowds:rep(1),
    disaster:rep(1), visa:rep(1), lgbtq:rep(3), beaches:rep(3), road:rep(2), vaccines:rep(2)
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
  bc("Mota'ain / Batugade",'TL','ID',-8.930,124.972,'open','07:00–17:00','Main Timor-Leste–Indonesia land crossing'),
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

  // ── India – Nepal ─────────────────────────────────────────────────────────────
  bc('Sunauli / Bhairahawa','IN','NP',27.508,83.430,'open','06:00–20:00','Main tourist crossing; closest to Lumbini; connects UP to Pokhara/Kathmandu'),
  bc('Birganj / Raxaul','IN','NP',27.013,84.929,'open','06:00–22:00','Busiest commercial crossing; Bihar to Kathmandu highway'),
  bc('Kakarbhitta / Panitanki','IN','NP',26.648,88.154,'open','06:00–20:00','East Nepal gateway; en route from Darjeeling/Sikkim'),
  bc('Nepalgunj Road','IN','NP',28.059,81.649,'open','07:00–19:00','Mid-western Nepal; access to Bardia National Park'),
  bc('Mahendranagar / Banbasa','IN','NP',28.961,80.183,'open','07:00–19:00','Far-west Nepal; gateway to Shuklaphanta and onward to India (Uttarakhand)'),

  // ── India – Bangladesh ────────────────────────────────────────────────────────
  bc('Petrapole / Benapole','IN','BD',23.006,88.779,'open','06:00–21:00','Busiest India–Bangladesh road crossing; West Bengal to Dhaka'),
  bc('Dawki / Tamabil','IN','BD',25.192,92.025,'open','07:00–18:00','Meghalaya to Sylhet; scenic river crossing; relatively quick process'),
  bc('Akhaura / Agartala','IN','BD',23.895,91.192,'open','07:00–18:00','Tripura to Brahmanbaria; connects northeast India to Dhaka'),

  // ── US – Mexico (additional) ──────────────────────────────────────────────────
  bc('San Ysidro / El Chaparral','US','MX',32.549,-117.035,'open','24 hours','San Diego–Tijuana; busiest land border crossing in the world'),
  bc('Calexico West / Mexicali','US','MX',32.669,-115.489,'open','24 hours','Imperial Valley–Mexicali; high commercial traffic'),
  bc('El Paso / Paso del Norte','US','MX',31.763,-106.488,'open','24 hours','Major crossing; downtown El Paso to Ciudad Juárez'),
  bc('Laredo / Nuevo Laredo','US','MX',27.506,-99.507,'open','24 hours','Busiest commercial US–Mexico crossing; I-35 corridor'),
  bc('McAllen / Hidalgo','US','MX',26.101,-98.265,'open','24 hours','Rio Grande Valley; high volume commercial and pedestrian'),
  bc('Eagle Pass / Piedras Negras','US','MX',28.709,-100.496,'open','24 hours','Texas to Coahuila; Maverick County crossing'),

  // ── East Africa ───────────────────────────────────────────────────────────────
  bc('Namanga','KE','TZ',-2.541,36.787,'open','06:00–22:00','Kenya–Tanzania; main Nairobi–Arusha safari route; busy but usually straightforward'),
  bc('Taveta / Holili','KE','TZ',-3.396,37.684,'open','06:00–18:00','Kenya–Tanzania near Kilimanjaro; quieter alternative to Namanga'),
  bc('Malaba','KE','UG',0.625,34.263,'open','06:00–22:00','Busiest Kenya–Uganda crossing; Nairobi–Kampala highway'),
  bc('Busia','KE','UG',0.459,34.089,'open','06:00–20:00','Alternative Kenya–Uganda crossing; less traffic than Malaba'),
  bc('Moyale','KE','ET',3.527,39.056,'open','07:00–18:00','Kenya–Ethiopia; long dusty route; basic facilities; carry extra water'),
  bc('Katuna / Gatuna','RW','UG',-1.190,29.748,'open','06:00–22:00','Rwanda–Uganda; busy Kigali–Kampala route; efficient border'),
  bc('Gisenyi / Goma','RW','CD',-1.688,29.253,'restricted','07:00–18:00','Rwanda–DR Congo; open for local traffic; check security situation before crossing'),
  bc('Tunduma / Nakonde','TZ','ZM',-9.283,32.752,'open','06:00–22:00','Tanzania–Zambia on the TAZARA corridor; major regional trade route'),
  bc('Songwe / Kasumulu','TZ','MW',-9.741,34.076,'open','06:00–18:00','Tanzania–Malawi; northern Lake Malawi route'),
  bc('Holimola / Kilambo','TZ','MZ',-10.779,40.509,'open','07:00–17:00','Tanzania–Mozambique; remote coastal crossing; dusty road'),

  // ── West Africa ───────────────────────────────────────────────────────────────
  bc('Aflao / Kodjoviakopé','GH','TG',6.108,1.191,'open','06:00–22:00','Ghana–Togo; busiest crossing; Accra–Lomé route; efficient'),
  bc('Elubo / Noé','GH','CI',5.091,-3.215,'open','06:00–22:00','Ghana–Côte d\'Ivoire; western coastal route; moderate traffic'),
  bc('Sème / Kraké','NG','BJ',6.343,2.718,'open','06:00–22:00','Nigeria–Benin; Lagos to Cotonou; very busy; expect queues'),
  bc('Karang / Farafenni','SN','GM',13.573,-15.893,'open','07:00–20:00','Senegal–Gambia; Trans-Gambia crossing; sometimes queues at ferry'),
  bc('Rosso','SN','MR',16.513,-15.806,'open','07:00–19:00','Senegal–Mauritania; Dakar–Nouakchott route; ferry across Senegal River'),

  // ── Southeast Asia – China border ─────────────────────────────────────────────
  bc('Lao Cai / Hekou','VN','CN',22.505,103.975,'open','07:00–22:00','Vietnam–Yunnan; Hanoi–Kunming rail and road route; high traffic'),
  bc('Lang Son / Youyi Guan','VN','CN',21.973,106.734,'open','07:00–22:00','Vietnam–Guangxi; busiest China–Vietnam crossing; Hanoi to Nanning route'),
  bc('Mong Cai / Dongxing','VN','CN',21.540,107.979,'open','07:00–22:00','Northeast Vietnam–Guangxi coast; significant commercial traffic'),
  bc('Boten / Boten','LA','CN',21.176,101.690,'open','08:00–17:00','Laos–Yunnan; Laos-China railway terminus; tourist visas available'),
  bc('Muse / Ruili','MM','CN',23.996,97.860,'open','08:00–18:00','Myanmar–Yunnan; busiest China–Myanmar crossing; jade and goods trade'),
  bc('Mae Sai / Tachileik','TH','MM',20.437,99.884,'open','06:00–18:00','Thailand–Myanmar; most-used tourist crossing; day trips from Chiang Rai'),
  bc('Phnom Den / Tinh Bien','KH','VN',10.972,104.957,'open','07:00–18:00','Cambodia–Vietnam; Mekong Delta route; Ha Tien access'),

  // ── Central America ───────────────────────────────────────────────────────────
  bc('El Florido','HN','GT',14.923,-89.220,'open','06:00–18:00','Honduras–Guatemala; Copán ruins access route'),
  bc('El Amatillo','HN','SV',13.474,-87.887,'open','06:00–22:00','Honduras–El Salvador on the Pan-American Highway; high traffic'),
  bc('El Espino','HN','NI',13.323,-86.413,'open','06:00–22:00','Honduras–Nicaragua on the Pan-American Highway; straightforward crossing'),
  bc('Guasaule','HN','NI',13.305,-87.197,'open','06:00–22:00','Honduras–Nicaragua western crossing; second option on Pan-Am route'),
  bc('Las Tablillas / Los Chiles','CR','NI',11.039,-84.707,'open','08:00–18:00','Costa Rica–Nicaragua border by the San Juan River'),

  // ── Balkans ───────────────────────────────────────────────────────────────────
  bc('Blace / Blace','XK','MK',42.099,21.365,'open','24 hours','Kosovo–North Macedonia; main Pristina–Skopje crossing; efficient'),
  bc('Hani i Hotit','AL','ME',42.340,19.563,'open','24 hours','Albania–Montenegro; coastal mountain crossing; Shkodër to Bar'),
  bc('Muriqan / Sukobin','AL','ME',41.892,19.555,'open','06:00–22:00','Albania–Montenegro; secondary lake-shore crossing near Shkodër'),
  bc('Gradina / Gradiška','BA','HR',45.153,17.320,'open','24 hours','Bosnia–Croatia; Banja Luka to Zagreb; major highway corridor'),
  bc('Zvorniče / Rača','BA','RS',44.372,19.107,'open','24 hours','Bosnia–Serbia eastern crossing; Sarajevo to Belgrade via Zvornik'),
  bc('Preševo / Tabanovce','RS','MK',42.302,21.651,'open','24 hours','Serbia–North Macedonia; main Belgrade–Skopje highway; E75 corridor'),

  // ── South America – additional ────────────────────────────────────────────────
  bc('Tumbes / Aguas Verdes','PE','EC',-3.556,-80.453,'open','24 hours','Main Peru–Ecuador Pacific coast crossing on Pan-American Hwy'),
  bc('Desaguadero','BO','PE',-16.569,-69.052,'open','07:00–19:00','Bolivia–Peru; high-altitude Lake Titicaca route; Puno to La Paz'),
  bc('Kasani / Yunguyo','BO','PE',-16.330,-68.980,'open','07:00–18:00','Bolivia–Peru; southern Lake Titicaca shore; alternative to Desaguadero'),
  bc('Salvador Mazza / Pocitos','AR','BO',-22.066,-63.692,'open','07:00–20:00','Argentina–Bolivia; Salta Province to Tarija; Ruta 34 corridor'),
  bc('Paso Cardenal Samoré','AR','CL',-40.756,-72.158,'open','08:00–21:00','Argentina–Chile Patagonia crossing; Villa Angostura to Osorno; scenic lakes'),
  bc('Paso Jama','AR','CL',-23.242,-67.082,'open','07:00–22:00','Argentina–Chile; Jujuy to San Pedro de Atacama; puna desert; 4200 m'),
  bc('Foz do Iguaçu / Puerto Iguazú','BR','AR',-25.598,-54.591,'open','24 hours','Brazil–Argentina at the Iguazú Falls triple frontier; also Paraguayan side nearby'),
  bc('Dionísio Cerqueira / Barracão','BR','AR',-26.261,-53.636,'open','24 hours','Southern Brazil–Argentina; secondary but useful crossing in far south'),

  // ── Colombia – additional ─────────────────────────────────────────────────────
  bc('Leticia / Tabatinga','CO','BR',-4.215,-69.943,'open','08:00–18:00','Amazon triple frontier (Colombia/Brazil/Peru); fly-in only; no road; remote jungle crossing'),

  // ── Egypt – additional ────────────────────────────────────────────────────────
  bc('Nuweiba / Aqaba (Ferry)','EG','JO',28.965,34.656,'open','See schedule','Car and passenger ferry across Gulf of Aqaba; multiple departures daily; book in advance'),
  bc('Salloum / Musaid','EG','LY',31.516,25.163,'restricted','06:00–18:00','Egypt–Libya; currently restricted; check FCO/State Dept advisories before attempting'),
  bc('Qustul / Wadi Halfa','EG','SD',22.089,31.374,'restricted','06:00–18:00','Egypt–Sudan land crossing; limited services; most travelers use the Aswan–Wadi Halfa ferry instead'),

  // ── Nigeria – additional ──────────────────────────────────────────────────────
  bc('Jibia / Maradi','NG','NE',13.086,7.198,'restricted','06:00–18:00','Nigeria–Niger; Katsina State; insecurity in region; verify current advisories before travel'),
];

// ─── Named beaches ────────────────────────────────────────────────────────────
const BEACHES = [
  // ── Mediterranean Europe — Spain ──
  bch('La Barceloneta','ES',41.378,2.194,'open','Year-round','good','showers,toilets,lifeguard,parking,cafes,accessible','standard','Most accessible urban beach in Barcelona; crowded Jul–Aug; sea can be murky near harbour'),
  bch('Playa de la Concha','ES',43.328,-1.984,'open','Jun–Sep','excellent','showers,toilets,lifeguard,parking,cafes,first-aid,accessible','standard','Most beautiful urban beach in Spain; calm sheltered bay; busy Jul–Aug; Blue Flag'),
  bch('Playa de Muro','ES',39.863,3.114,'open','May–Oct','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs,accessible','standard','Mallorca; 7km white sand; shallow warm water; very family-friendly'),
  bch('Cala Comte','ES',38.973,1.274,'seasonal','May–Oct','excellent','toilets,parking,cafes','standard','Ibiza; multi-tier turquoise coves; best at sunset; gets very crowded Jul–Aug'),
  bch('Playa de las Teresitas','ES',28.520,-16.197,'open','Year-round','good','showers,toilets,lifeguard,parking,cafes,accessible','standard','Tenerife; imported Saharan sand; palm-lined; calm lagoon; near Santa Cruz'),
  bch('Las Canteras','ES',28.138,-15.437,'open','Year-round','excellent','showers,toilets,lifeguard,parking,cafes,first-aid,accessible','standard','Gran Canaria; 3km urban beach; natural reef breaks swell; excellent year-round swimming; Blue Flag'),
  bch('Playa de Bolonia','ES',36.082,-5.778,'open','Apr–Oct','excellent','toilets,parking','standard','Wild Atlantic beach near Tarifa; massive sand dune behind it; windy but stunning; no sunbeds'),
  bch('La Zurriola','ES',43.324,-1.979,'open','Jun–Sep','good','showers,toilets,lifeguard,parking,cafes','standard','San Sebastián surf beach; waves year-round; cooler water than Concha; popular with surfers'),
  bch('Cala Salada','ES',38.996,1.267,'seasonal','May–Oct','excellent','toilets,cafes','standard','Ibiza; small turquoise cove; rocky bottom; snorkelling; limited parking'),
  bch('Playa de ses Illetes','ES',38.736,1.399,'open','May–Oct','excellent','toilets,cafes,water-sports','topless-ok','Formentera; finest powder sand in Europe; crystal-clear shallow water; no motorised access'),
  bch('Playa d\'en Bossa','ES',38.867,1.413,'open','May–Oct','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports','topless-ok','Ibiza; 3km party beach strip; beach clubs, DJs; very crowded Jul–Aug'),
  bch('Playa de Valdoviño','ES',43.584,-8.181,'open','Jun–Sep','good','showers,toilets,parking','standard','Galicia; Atlantic surf beach; wild and uncrowded; cold water even in summer'),
  bch('Playa de Langre','ES',43.467,-3.876,'open','Jun–Sep','excellent','toilets,parking','naturist','Cantabria; cliff-backed clothing-optional beach; hard to find; wild and beautiful'),
  // ── Mediterranean Europe — France ──
  bch('Plage de Pampelonne','FR',43.240,6.632,'open','May–Sep','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports','topless-ok','St Tropez; 5km of famous beach clubs (Club 55, Nikki Beach); very expensive; beautiful sand'),
  bch('Plage de la Croisette','FR',43.553,7.015,'open','May–Sep','good','showers,toilets,lifeguard,cafes,rental-chairs,accessible','topless-ok','Cannes; glamorous promenade beach; mostly private paying sections; free public strip'),
  bch('Plage des Catalans','FR',43.291,5.358,'open','Jun–Sep','fair','showers,toilets,lifeguard,parking,cafes','topless-ok','Marseille city beach; small pebble/sand; accessible by bus from centre; some pollution concerns'),
  bch('Plage de Biarritz Grande Plage','FR',43.483,-1.558,'open','Jun–Sep','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports','topless-ok','Classic Basque surf resort; reliable waves; elegant Belle Époque backdrop; busy in summer'),
  bch('Plage de la Baule','FR',47.279,-2.394,'seasonal','Jun–Aug','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,accessible','standard','Loire-Atlantique; 8km crescent; finest Atlantic beach in France; warm shallow bay; family ideal'),
  bch('Plage Naturiste de Montalivet','FR',45.376,-1.143,'restricted','Jun–Aug','good','showers,toilets,lifeguard,parking,cafes','naturist','Oldest official naturist resort in Europe (est. 1950); full facilities; 4km Atlantic beach'),
  bch('Plage d\'Étretat','FR',49.707,0.207,'open','Jun–Aug','good','toilets,parking,cafes','standard','Dramatic chalk-arch cliffs; pebble beach unsuitable for swimming; primarily scenic; very photogenic'),
  // ── Mediterranean Europe — Italy ──
  bch('Spiaggia dei Conigli','IT',35.498,12.620,'open','May–Sep','excellent','toilets,lifeguard,parking','standard','Lampedusa; consistently voted best beach in Europe; turquoise lagoon; loggerhead turtles nest here; limited access during nesting'),
  bch('Cala Goloritzé','IT',40.121,9.620,'restricted','May–Oct','excellent','toilets','standard','Sardinia; UNESCO site; 2hr hike or boat only; crystal water; climbing routes on limestone pinnacle'),
  bch('La Pelosa','IT',40.980,8.183,'restricted','May–Sep','excellent','showers,toilets,lifeguard,parking','standard','Sardinia; N tip; entry fee + timed tickets to protect sand; Caribbean-style shallow water; arrive early'),
  bch('Spiaggia di Tuerredda','IT',38.929,8.904,'open','May–Sep','excellent','toilets,cafes','standard','Sardinia SW; among finest beaches in Italy; turquoise lagoon; small rocky island to swim to'),
  bch('Spiaggia di Positano','IT',40.627,14.484,'open','Jun–Sep','good','showers,toilets,lifeguard,cafes,rental-chairs','topless-ok','Amalfi Coast; small pebble beach; dominated by colourful village backdrop; expensive sun-bed hire'),
  bch('San Vito Lo Capo','IT',38.174,12.737,'open','May–Oct','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs,accessible','standard','Sicily; powder-white sand; turquoise water; friendly village; September couscous festival'),
  bch('Rimini','IT',44.057,12.560,'open','May–Sep','fair','showers,toilets,lifeguard,parking,cafes,rental-chairs,first-aid,accessible,water-sports','standard','Mass-market resort; 15km of managed beach; excellent facilities; Adriatic not its cleanest; very family-popular'),
  bch('Punta Prosciutto','IT',40.235,17.837,'open','Jun–Sep','excellent','toilets,parking','standard','Puglia; shallow transparent water; fine white sand; protected dunes; relatively uncrowded'),
  bch('Spiaggia di Vignanotica','IT',41.710,16.056,'open','Jun–Sep','excellent','toilets','standard','Puglia Gargano coast; dramatic white cliffs; pebble and sand; boat or steep path access; wild and beautiful'),
  // ── Mediterranean Europe — Greece ──
  bch('Navagio (Shipwreck Beach)','GR',37.860,20.603,'restricted','May–Oct','excellent','toilets','standard','Zakynthos; most photographed beach in Greece; access by boat only; 1980 smuggler shipwreck; limestone cliffs'),
  bch('Elafonissi','GR',35.268,23.539,'open','May–Oct','excellent','showers,toilets,parking,cafes','standard','Crete SW corner; pink-tinged sand lagoon; wading depth only; gets crowded Jul–Aug'),
  bch('Balos Lagoon','GR',35.601,23.573,'open','May–Oct','excellent','toilets,cafes','standard','Crete NW; pink/white sand; turquoise lagoon; ferry or 4WD track; very busy in peak season'),
  bch('Myrtos','GR',38.287,20.456,'open','Jun–Sep','excellent','showers,toilets,parking,cafes','standard','Kefalonia; steep white cliffs framing vivid blue water; one of most dramatic beaches in Greece; no shade'),
  bch('Porto Katsiki','GR',38.522,20.543,'seasonal','Jun–Sep','excellent','toilets,cafes','standard','Lefkada; stunning white-cliff descent to turquoise cove; only accessible Jul–Oct (road closes); steps to beach'),
  bch('Sarakiniko','GR',36.744,24.443,'open','Jun–Sep','excellent','toilets','standard','Milos; lunar volcanic landscape; white pumice rocks; no sand; popular for cliff jumping and snorkelling'),
  bch('Super Paradise','GR',37.407,25.381,'open','Jun–Sep','good','showers,toilets,lifeguard,cafes,rental-chairs,water-sports','topless-ok','Mykonos; famous gay-friendly section at one end; party atmosphere; beautiful clear water'),
  bch('Vlychada','GR',36.356,25.443,'open','May–Oct','excellent','toilets,parking,cafes','standard','Santorini; volcanic ash cliff formations; quieter than Perissa; striking monochrome landscape'),
  bch('Perissa','GR',36.348,25.478,'open','May–Oct','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports','standard','Santorini; black sand volcanic beach; long strip of tavernas; very popular; hot sand in summer'),
  bch('Falassarna','GR',35.520,23.572,'open','May–Oct','excellent','showers,toilets,parking,cafes','standard','Crete NW; one of widest most beautiful beaches in Crete; faces west for spectacular sunsets; Blue Flag'),
  bch('Preveli','GR',35.199,24.572,'open','May–Oct','excellent','toilets','standard','Crete; palm tree gorge meets the sea; snorkelling in freshwater/saltwater mix; short hike required'),
  bch('Koukounaries','GR',39.118,23.417,'open','May–Oct','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs','standard','Skiathos; fine golden sand backed by pine forest; shallow turquoise water; family-friendly; Blue Flag'),
  // ── Mediterranean Europe — Croatia / Montenegro ──
  bch('Zlatni Rat','HR',43.460,16.637,'open','Jun–Sep','excellent','showers,toilets,lifeguard,parking,cafes,water-sports','topless-ok','Brač; iconic shifting pebble spit that changes shape with currents; brilliant turquoise water; windsurfing'),
  bch('Stiniva','HR',43.033,16.275,'open','Jun–Sep','excellent','cafes','topless-ok','Vis; spectacular enclosed cove accessed through narrow cliff gap; pebble beach; boat or challenging hike'),
  bch('Saharun','HR',44.015,14.873,'open','Jun–Sep','excellent','toilets,parking','topless-ok','Dugi Otok; fine sand; unusually flat and calm; very clear water; one of few sandy beaches in Dalmatia'),
  bch('Rajska Plaža','HR',44.783,14.755,'open','Jun–Sep','excellent','showers,toilets,lifeguard,parking,cafes,water-sports','topless-ok','Rab island; 1.7km sandy beach; one of longest in Adriatic; shallow, calm, family-perfect'),
  bch('Zrće','HR',44.466,15.046,'open','Jun–Sep','good','showers,toilets,lifeguard,parking,cafes,water-sports','topless-ok','Pag island; Croatia\'s party beach; open-air dance clubs run all night Jun–Sep; younger crowd'),
  bch('Sveti Stefan','ME',42.256,18.892,'open','Jun–Sep','excellent','showers,toilets,lifeguard,cafes,rental-chairs,water-sports','topless-ok','Montenegro; pebble beach flanking a luxury villa island; Adriatic views; upmarket area'),
  // ── Turkey ──
  bch('Ölüdeniz / Blue Lagoon','TR',36.548,29.122,'open','Apr–Oct','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports','standard','Fethiye; world-famous lagoon sheltered by mountains; Blue Flag; paragliding from Babadağ above; beautiful'),
  bch('Kaputaş','TR',36.222,29.393,'open','May–Oct','excellent','showers,toilets,cafes','standard','Kalkan; small turquoise cove at base of a gorge; 200 steps down; no sunbeds on sand; very photogenic'),
  bch('Patara','TR',36.296,29.318,'restricted','Apr–Oct','excellent','showers,toilets,parking,cafes','standard','18km longest beach in Turkey; loggerhead turtle nesting site; access prohibited at night; also ancient ruins'),
  bch('Cleopatra Beach','TR',36.546,32.009,'open','May–Oct','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,accessible','standard','Alanya; legend says sand imported from Egypt for Cleopatra; fine pale sand; calm water; resort strip'),
  bch('Çirali','TR',36.434,30.477,'open','May–Oct','excellent','showers,toilets,parking,cafes','standard','Loggerhead nesting beach; quiet village atmosphere; adjacent Olympos ruins and Chimaera flames; no large hotels'),
  // ── Portugal — Algarve ──
  bch('Praia do Camilo','PT',37.083,-8.669,'open','May–Oct','excellent','toilets,parking,cafes','standard','Lagos; small sheltered cove between golden limestone arches; wooden boardwalk stairs; very photogenic'),
  bch('Praia da Marinha','PT',37.091,-8.409,'open','May–Oct','excellent','toilets,parking,cafes','standard','Algarve; dramatic rock arch formations; snorkelling; one of most photographed coastlines in Portugal'),
  bch('Praia de Benagil','PT',37.093,-8.424,'restricted','May–Oct','excellent','toilets,cafes','standard','Algarve; sea cave with sky-hole only accessible by kayak or swim; no boat landings inside; magical'),
  bch('Praia da Falésia','PT',37.079,-8.104,'open','May–Oct','excellent','showers,toilets,lifeguard,parking,cafes,accessible','standard','Algarve; 6km beach backed by red and orange cliffs; Blue Flag; quieter than central Algarve'),
  bch('Praia da Comporta','PT',38.378,-8.773,'open','Jun–Sep','excellent','toilets,parking,cafes','standard','Alentejo; wild dune beach; stylish bohemian village; no high-rise; sea is cold; beautiful emptiness'),
  bch('Praia do Guincho','PT',38.727,-9.473,'open','Jun–Sep','good','showers,toilets,parking,cafes','standard','Cascais; windy Atlantic beach; world-class windsurfing/kitesurfing; dramatic dunes; cold water; no facilities beyond basics'),
  bch('Praia de Odeceixe','PT',37.438,-8.779,'open','Jun–Sep','excellent','showers,toilets,parking,cafes','standard','Where river meets the sea behind a sandbar; surf-able; very scenic; gateway to Alentejo coast'),
  // ── Other Mediterranean ──
  bch('Comino Blue Lagoon','MT',36.016,14.335,'seasonal','May–Oct','excellent','toilets','standard','Malta; turquoise enclosed lagoon; day-trippers by boat from Gozo/Malta; extremely crowded Jun–Sep; go early morning'),
  bch('Golden Bay','MT',35.988,14.348,'open','May–Oct','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,accessible','standard','Malta; largest sandy beach on main island; safe swimming; can be crowded; facility-rich'),
  bch('Hammamet South','TN',36.396,10.578,'open','May–Oct','fair','showers,toilets,lifeguard,parking,cafes,rental-chairs,accessible','standard','Tunisia; main resort beach strip; warm Mediterranean; popular with European charter tourists'),
  // ── Atlantic & Northern Europe ──
  bch('Praia do Norte','PT',39.600,-9.070,'open','Year-round','good','toilets,parking,cafes','standard','Nazaré; world-record giant waves in winter (do not swim Oct–Mar); summer swimming is safe; spectacular for watching'),
  bch('Inch Beach','IE',52.126,-9.985,'open','Jun–Aug','good','toilets,parking,cafes','standard','Dingle Peninsula; 5km Atlantic spit; horse riding; cold water but dramatic Kerry mountains backdrop'),
  bch('Keem Bay','IE',53.975,-10.100,'open','Jun–Aug','excellent','toilets,parking','standard','Achill Island; remote turquoise arc; one of Ireland\'s most beautiful; strong currents; Blue Flag; bask sharks offshore'),
  bch('Reynisfjara','IS',63.403,-19.046,'open','Year-round','good','parking,cafes','standard','Black sand beach with basalt columns and sea stacks; extremely dangerous sneaker waves — do not approach water edge'),
  bch('Diamond Beach','IS',64.056,-16.231,'open','Year-round','good','parking,cafes','standard','Glacier lagoon (Jökulsárlón); ice blocks wash onto black sand; stunning in golden hour; no swimming'),
  bch('Nauthólsvík','IS',64.123,-21.937,'seasonal','Jun–Aug','good','showers,toilets,cafes,accessible','standard','Reykjavik geothermally heated beach; hot-pot in the sea; popular with locals; only warm enough Jun–Aug'),
  // ── Caribbean & Atlantic Islands ──
  bch('Grace Bay','TC',21.789,-72.231,'open','Year-round','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports,accessible','standard','Turks & Caicos; #1-ranked beach in the world repeatedly; powder white sand; perfectly calm turquoise water'),
  bch('Pink Sands Beach','BS',25.541,-76.635,'open','Year-round','excellent','toilets,cafes,rental-chairs','standard','Harbour Island, Eleuthera; unique pink coral sand; Atlantic side is calm; private and serene'),
  bch('Eagle Beach','AW',12.558,-70.060,'open','Year-round','excellent','showers,toilets,lifeguard,cafes,rental-chairs','standard','Aruba; calm protected water; wide white sand; outside main resort strip so less crowded than Palm Beach'),
  bch('Playa Rincón','DO',19.571,-69.977,'open','Year-round','excellent','cafes','standard','Dominican Republic; 3km wild beach only reached by boat or dirt road; no development; one of Caribbean\'s finest'),
  bch('Flamenco Beach','PR',18.324,-65.305,'open','Year-round','excellent','showers,toilets,lifeguard,parking,cafes,camping','standard','Culebra island; best beach in US territory; turquoise; snorkel; World War II tanks on beach; ferry from Culebra town'),
  bch('Negril Seven Mile','JM',18.266,-78.360,'open','Year-round','good','showers,toilets,lifeguard,cafes,rental-chairs,water-sports','standard','Jamaica\'s most famous beach; resort strip with calm water and spectacular sunsets; street vendors aggressive'),
  bch('Anse Chastanet','LC',13.851,-61.070,'open','Year-round','excellent','showers,toilets,cafes,water-sports','standard','St Lucia; volcanic black-sand beside the Pitons; excellent diving and snorkelling directly off beach'),
  bch('Grand Anse','GD',12.032,-61.770,'open','Year-round','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs,accessible','standard','Grenada; 3km white sand with gentle waves; most developed beach on island; spice island backdrop'),
  bch('Les Salines','MQ',14.397,-60.869,'open','Year-round','excellent','toilets,parking,cafes','topless-ok','Martinique S tip; finest beach on island; clear calm water; lined with almond trees for shade; local atmosphere'),
  bch('Cas Abao','CW',12.167,-69.050,'open','Year-round','excellent','showers,toilets,parking,cafes,water-sports','standard','Curaçao; pristine small bay; excellent snorkelling/diving; entry fee; calm clear water'),
  bch('Maracas Bay','TT',10.749,-61.382,'open','Year-round','good','showers,toilets,lifeguard,parking,cafes','standard','Trinidad; national beach; shark-and-bake fish sandwiches are a local tradition; rough surf; 45 min from Port of Spain'),
  // ── USA ──
  bch('Hanauma Bay','US',21.270,-157.695,'restricted','Year-round','excellent','showers,toilets,parking,cafes,first-aid,accessible','standard','Oahu; world-class snorkel reserve; entry fee + mandatory 10-min education video; no touching coral; book online; spectacular marine life'),
  bch('Lanikai','US',21.391,-157.718,'open','Year-round','excellent','parking','standard','Oahu; calm lagoon; impossibly blue water; Mokulua islands offshore; residential area — street parking only; no facilities'),
  bch('Hapuna','US',19.976,-155.831,'open','Year-round','excellent','showers,toilets,lifeguard,parking,cafes,camping','standard','Big Island; half-mile white sand; best swimmable beach on island; can get rough surf in winter'),
  bch('Coronado','US',32.698,-117.177,'open','Year-round','good','showers,toilets,lifeguard,parking,cafes,accessible','standard','San Diego; broad white sand backed by Hotel del Coronado; family beach; mild year-round; accessible by ferry'),
  bch('Cannon Beach','US',45.893,-123.961,'open','Year-round','good','toilets,parking,cafes','standard','Oregon; Haystack Rock sea stack is iconic; tide pools; too cold to swim; beautiful for walking; fog common'),
  bch('South Beach Miami','US',25.780,-80.131,'open','Year-round','good','showers,toilets,lifeguard,parking,cafes,first-aid,accessible','standard','Art Deco backdrop; wide flat beach; warm water; gay-friendly area; crowded year-round; strong undertow possible'),
  bch('Siesta Key','US',27.266,-82.546,'open','Year-round','excellent','showers,toilets,lifeguard,parking,cafes,accessible','standard','Florida; quartz sand is cool to touch even in heat; multiple #1 US beach rankings; gentle Gulf water; very family-friendly'),
  bch('Cape Hatteras','US',35.239,-75.527,'open','Year-round','good','toilets,parking','standard','North Carolina; wild Outer Banks; lighthouse; powerful rip currents; good for surfing; 4WD beach driving allowed'),
  bch('Acadia Sand Beach','US',44.327,-68.185,'seasonal','Jun–Sep','excellent','showers,toilets,parking','standard','Maine; most photographed beach in Acadia NP; 60°F water even in summer; stunning granite headlands; entry fee'),
  // ── Mexico ──
  bch('Playa Norte (Isla Mujeres)','MX',21.237,-86.740,'open','Year-round','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports','standard','Calmest clearest water in Mexico; shallow Caribbean turquoise; powder sand; 10min ferry from Cancún; can wade far'),
  bch('Balandra','MX',24.264,-110.363,'open','Oct–Jun','excellent','toilets,parking','standard','La Paz, BCS; calm turquoise lagoon; no motorised watercraft; no facilities beyond basics; wild; best avoided Jul–Sep heat'),
  bch('Sayulita','MX',20.869,-105.439,'open','Nov–Apr','good','toilets,parking,cafes,water-sports','standard','Nayarit; bohemian surf village; beginner-friendly waves; colourful streets; rainy May–Oct makes beach muddy'),
  bch('Playa Carrizalillo','MX',15.856,-97.069,'open','Nov–May','excellent','showers,toilets,parking,cafes','standard','Puerto Escondido; small sheltered cove; calm swimming; down 170 steps; far safer than Zicatela'),
  bch('Playa Zicatela','MX',15.860,-97.059,'open','Year-round','good','showers,toilets,cafes,water-sports','standard','Puerto Escondido; Mexican Pipeline; world-class shore break for experts only; extremely dangerous swimming; best watched from beach bars'),
  bch('Tulum Beach','MX',20.148,-87.436,'open','Year-round','good','toilets,cafes,rental-chairs','standard','Quintana Roo; boutique eco-hotels on cliffs above; seaweed (sargassum) can be heavy Apr–Oct; cenote swimming nearby'),
  // ── Brazil ──
  bch('Praia do Sancho','BR',-3.861,-32.423,'restricted','Year-round','excellent','toilets,cafes','standard','Fernando de Noronha; repeatedly #1 world beach; vertical cliff descent; restricted daily visitor numbers; entry fee to archipelago; crystal clear water'),
  bch('Jericoacoara','BR',-2.793,-40.511,'open','Jul–Jan','excellent','toilets,parking,cafes,water-sports','standard','Ceará; dune lagoon sunsets; kitesurfing hub; paved road only recently arrived; best dry season Jul–Jan'),
  bch('Praia da Pipa','BR',-6.225,-35.052,'open','Sep–Feb','good','showers,toilets,parking,cafes,water-sports','standard','Rio Grande do Norte; dramatic 70m red-clay cliffs; dolphins in bay; good atmosphere; rainy Mar–Aug'),
  bch('Morro de São Paulo','BR',-13.381,-38.916,'open','Oct–Mar','good','toilets,cafes,water-sports','standard','Bahia; car-free island; 4 beaches increasing in wildness; ferry from Salvador; high season Dec–Feb'),
  bch('Ipanema','BR',-22.984,-43.199,'open','Year-round','good','showers,toilets,lifeguard,parking,cafes','topless-ok','Rio; one of world\'s most famous beaches; designated spots (arpoador = surfers, posto 9 = LGBTQ+); petty theft risk'),
  // ── Colombia ──
  bch('Playa Blanca (Bolívar)','CO',10.063,-75.543,'open','Nov–Mar','fair','cafes','standard','Day trip from Cartagena by boat; beautiful turquoise water; vendors very persistent; sanitation facilities basic; stay overnight to get it quiet'),
  bch('Cabo San Juan del Guía','CO',11.320,-73.927,'restricted','Nov–Apr','excellent','toilets,cafes,camping','standard','Tayrona NP; 2hr hike through jungle; limited visitor numbers; no infrastructure; some of best beaches in Colombia'),
  // ── Peru ──
  bch('Máncora','PE',-4.109,-81.048,'open','Year-round','good','showers,toilets,parking,cafes,water-sports','standard','Warm water year-round; surf; popular backpacker scene; relatively affordable; some petty theft; best Dec–Mar'),
  // ── Africa ──
  bch('Legzira','MA',29.380,-10.213,'open','May–Oct','good','toilets,parking,cafes','standard','Morocco; dramatic arched sea stacks at low tide; swimming marginal; one of most dramatic beaches in North Africa; original arch collapsed 2016 but others remain'),
  bch('Taghazout','MA',30.543,-9.709,'open','Oct–Apr','good','toilets,parking,cafes','standard','Morocco; best surf season Oct–Apr; laid-back village; cheap accommodation; beginners to expert waves; hot dry summers'),
  bch('Clifton 3rd Beach','ZA',-33.938,18.372,'open','Nov–Mar','excellent','toilets,parking,cafes,rental-chairs','standard','Cape Town; boulders divide beach into private coves; cold Atlantic (14°C); beautiful mountains; no dogs allowed'),
  bch('Clifton 4th Beach','ZA',-33.940,18.370,'open','Nov–Mar','excellent','toilets,parking,cafes,rental-chairs','topless-ok','Cape Town; gay-friendly corner; most social beach; cold Atlantic; sunbathing rather than swimming; fashionable scene'),
  bch('Camps Bay','ZA',-33.951,18.376,'open','Nov–Mar','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,accessible','topless-ok','Cape Town; wide beach with dramatic Table Mountain backdrop; very cold water; trendy seafront restaurants'),
  bch('Boulders Beach','ZA',-34.199,18.452,'restricted','Year-round','excellent','showers,toilets,parking,cafes,first-aid,accessible','standard','Simon\'s Town; resident African penguin colony; boardwalks over colony; entry fee; swim in coves beside penguins'),
  bch('Coffee Bay','ZA',-31.975,29.142,'open','Year-round','good','toilets,parking,cafes,camping','standard','Wild Coast; remote surfer\'s paradise; Hole in the Wall rock arch nearby; rough road access; authentic Xhosa area'),
  bch('Diani Beach','KE',-4.317,39.568,'open','Year-round','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports,accessible','standard','Mombasa south; 17km white sand; Blue Flag (one of first in Africa); calm warm water; colobus monkeys in forest behind'),
  bch('Nungwi','TZ',-5.729,39.298,'open','Year-round','excellent','showers,toilets,cafes,water-sports','standard','Zanzibar N; calm warm water all day (no tidal extremes); beach bars lively at sunset; dhow trips; busiest part of island'),
  bch('Kendwa','TZ',-5.773,39.288,'open','Year-round','excellent','showers,toilets,cafes,water-sports','standard','Zanzibar; minimal tidal variation unlike rest of island; Full Moon Party; calmer than Nungwi; good snorkelling'),
  bch('Paje','TZ',-6.276,39.527,'open','Jun–Sep','good','showers,toilets,cafes,water-sports','standard','Zanzibar; world-class kitesurfing in SE trade winds; wide tidal flat; shallow and low tide leaves big walking areas'),
  bch('Tofo Beach','MZ',-23.856,35.546,'open','Year-round','excellent','showers,toilets,cafes,water-sports','standard','Mozambique; whale shark snorkelling capital of the world; manta rays; excellent diving; laid-back backpacker scene'),
  bch('Anse Source d\'Argent','SC',-4.368,55.839,'open','Year-round','excellent','toilets,cafes','standard','La Digue, Seychelles; world\'s most photographed beach; giant pink-orange granite boulders; shallow turquoise water; reached by bicycle'),
  bch('Beau Vallon','SC',-4.619,55.434,'open','Year-round','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports,accessible','standard','Mahé; most developed beach in Seychelles; calm Oct–Apr; BBQ evenings Thursday market; family-friendly'),
  bch('Belle Mare','MU',-20.168,57.757,'open','Year-round','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports,accessible','standard','Mauritius E coast; calm lagoon; luxury resort beach; snorkelling in reef; beautiful sunrise beach'),
  bch('Santa Monica (Boa Vista)','CV',16.058,-22.921,'open','Year-round','excellent','toilets,parking','standard','Cape Verde; 50km wild white sand; one of longest beaches in Africa; loggerhead turtle nesting; no development; windy'),
  // ── Middle East ──
  bch('Tel Aviv Gordon Beach','IL',32.079,34.769,'open','May–Oct','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports,accessible','standard','Urban beach 10min walk from centre; gay-friendly; vibrant; Blue Flag; free public access; very social scene'),
  bch('Jumeirah Public Beach','AE',25.208,55.259,'open','Oct–May','good','showers,toilets,lifeguard,parking,cafes,accessible','standard','Dubai; free public beach; Burj Al Arab visible; very hot Jun–Sep (36°C water); women in swimwear accepted; no alcohol'),
  bch('Saadiyat Island Beach','AE',24.543,54.426,'open','Oct–May','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs,accessible','standard','Abu Dhabi; protected turtle nesting; entry fee; cleaner and calmer than Jumeirah; lounge-chair culture'),
  bch('Mughsail','OM',17.032,54.063,'open','Oct–May','excellent','toilets,parking','standard','Dhofar, Oman; dramatic blowholes in rocks; dramatic cliffs; uncrowded; khareef monsoon Jul–Sep brings unusual mist and green'),
  // ── South Asia ──
  bch('Radhanagar Beach','IN',11.999,92.930,'open','Oct–May','excellent','showers,toilets,parking,cafes','standard','Havelock Island, Andamans; consistently India\'s best; crystal water; jungle-backed; sunset-facing; monsoon closes May–Sep'),
  bch('Palolem','IN',15.010,74.024,'open','Nov–Mar','good','showers,toilets,cafes,rental-chairs,water-sports','standard','South Goa; perfect crescent bay; calm water; backpacker/traveller scene; party scene manageable; gets busier Dec–Jan'),
  bch('Agonda','IN',15.045,74.003,'open','Nov–Mar','good','toilets,cafes','standard','South Goa; quieter than Palolem; olive ridley turtles nest at S end; minimal commercialisation; slower pace'),
  bch('Arambol','IN',15.681,73.705,'open','Nov–Mar','fair','showers,toilets,cafes,water-sports','standard','North Goa; hippy drumming circles and fire spinners at sunset; sweet-water lake behind dunes; alternative scene'),
  bch('Varkala','IN',8.729,76.716,'open','Nov–Mar','good','showers,toilets,cafes,rental-chairs','standard','Kerala; dramatic red laterite cliffs above the beach; more relaxed dress norms than rest of Kerala; yoga retreats; touts manageable'),
  bch('Mirissa','LK',5.944,80.461,'open','Nov–Apr','good','showers,toilets,parking,cafes,water-sports','standard','Sri Lanka SW; whale-watching hub Nov–Apr (blue whales); snorkelling off Parrot Rock; laid-back scene; calmer than Unawatuna'),
  bch('Hiriketiya','LK',5.933,80.547,'open','Nov–Apr','excellent','toilets,cafes,water-sports','standard','Sri Lanka S; bowl-shaped bay; beginner surfing; yoga and wellness community; less crowded than Mirissa and Unawatuna'),
  bch('Uppuveli','LK',8.599,81.218,'seasonal','May–Sep','excellent','showers,toilets,cafes,water-sports','standard','Trincomalee, E Sri Lanka; calm clear turquoise water May–Sep (dry season); whale sharks Jul–Aug; opposite season to SW'),
  bch('Maafushi','MV',3.948,73.540,'open','Year-round','excellent','toilets,cafes,water-sports','standard','Maldives; guesthouse island accessible without resort prices; bikini beach on one end; local beach covered on other end'),
  // ── Southeast Asia — Thailand ──
  bch('Railay West','TH',8.012,98.836,'open','Nov–Apr','excellent','showers,toilets,cafes,water-sports','standard','Krabi; boat access only from Ao Nang; dramatic limestone cliffs; rock climbing on adjacent cliffs; best Nov–Apr; gets crowded'),
  bch('Phra Nang Cave Beach','TH',8.000,98.837,'open','Nov–Apr','excellent','toilets','standard','Krabi; most stunning beach in Thailand; princess shrine cave behind; access only by longtail; part of same peninsula as Railay'),
  bch('Ko Phi Phi Don Beach','TH',7.745,98.778,'open','Nov–Apr','good','showers,toilets,lifeguard,cafes,rental-chairs,water-sports','standard','Andaman; iconic beach; very crowded Dec–Mar; gorgeous water; boats everywhere; the quiet season is May–Oct'),
  bch('Haad Rin (Full Moon Party)','TH',9.681,100.053,'open','Year-round','fair','showers,toilets,cafes,water-sports','standard','Koh Phangan; famous Full Moon Party beach; packed on party nights; daily rubbish problem; bucket cocktails; avoid if you want peace'),
  bch('Kata Noi','TH',7.824,98.293,'open','Nov–Apr','excellent','showers,toilets,lifeguard,cafes,rental-chairs,water-sports','standard','Phuket; smaller and quieter than Kata or Patong; excellent snorkelling at S end; gets rough May–Oct'),
  bch('Koh Kood (Klong Chao)','TH',11.602,102.475,'seasonal','Nov–Apr','excellent','toilets,cafes','standard','Ko Kut; last unspoiled large Thai island; crystal water; limited accommodation; best Nov–Apr; remote but magical'),
  // ── Southeast Asia — Vietnam ──
  bch('An Bang','VN',15.923,108.348,'open','Feb–Aug','good','showers,toilets,cafes,rental-chairs','standard','Hoi An area; local atmosphere; good beach cafes; fresher and less commercial than Cua Dai; flooded Oct–Dec'),
  bch('Bai Sao','VN',10.040,103.997,'open','Nov–May','excellent','showers,toilets,parking,cafes,rental-chairs,water-sports','standard','Phu Quoc S; white sand; calm clear water; best Nov–May dry season; some development but still beautiful'),
  // ── Southeast Asia — Indonesia ──
  bch('Kuta','ID',-8.718,115.169,'open','May–Oct','fair','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports','standard','Bali; learn-to-surf beach; famous sunsets; extremely crowded; hawkers; poor water quality at times; best May–Oct'),
  bch('Seminyak','ID',-8.697,115.156,'open','May–Oct','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports','topless-ok','Bali; upmarket beach clubs; famous sunset strip; less chaotic than Kuta; potato head beach club; waves suitable for intermediate surfers'),
  bch('Nusa Dua','ID',-8.801,115.231,'open','May–Oct','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports,accessible','standard','Bali; calm lagoon; resort enclave; families and honeymooners; most serene swimming in Bali; gated but accessible'),
  bch('Pink Beach','ID',-8.649,119.450,'restricted','May–Oct','excellent','toilets','standard','Komodo NP; pink-tinted coral sand; entry only with guide on NP tour; excellent snorkelling in strong currents; Komodo dragons on Rinca'),
  bch('Tanjung Aan','ID',-8.891,116.276,'open','May–Oct','excellent','toilets,cafes','standard','Lombok; twin crescent bays divided by headland; one side surf, one side calm; stunning; Kuta Lombok is a different place from Kuta Bali'),
  // ── Southeast Asia — Malaysia / Philippines ──
  bch('Tanjung Rhu','MY',6.376,99.876,'open','Nov–Mar','excellent','toilets,parking,cafes','standard','Langkawi N; shallow turquoise bay; mangroves; very calm; best Nov–Mar dry season; deserted at low tide'),
  bch('Perhentian Islands','MY',5.908,102.764,'seasonal','Mar–Oct','excellent','showers,toilets,cafes,water-sports','standard','Terengganu; crystal clear backpacker paradise; excellent snorkelling; sea turtles; closed Nov–Feb (monsoon)'),
  bch('El Nido Nacpan','PH',11.267,119.337,'open','Nov–May','excellent','cafes','standard','Palawan; 4km wild white sand; few facilities; far end is undeveloped; quiet even in season; one of best in Philippines'),
  bch('Boracay White Beach','PH',11.958,121.925,'open','Nov–May','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports,accessible','standard','Station 1 is finest and calmest end; sunset views; very developed; underwent rehabilitation 2018; sea can have seaweed Apr–May'),
  bch('Alona Beach','PH',9.612,123.784,'open','Nov–May','excellent','showers,toilets,cafes,water-sports','standard','Bohol; dive base for Balicasag island (great coral walls); budget-friendly; thresher sharks at Moalboal nearby'),
  bch('Siargao Cloud 9','PH',9.822,126.088,'open','Year-round','good','toilets,cafes,water-sports','standard','World-class hollow reef break; Philippines surf capital; non-surfers enjoy the lagoon and coconut scenery; typhoon possible Aug–Nov'),
  // ── East Asia ──
  bch('Yonaha Maehama','JP',24.702,125.173,'seasonal','May–Oct','excellent','showers,toilets,lifeguard,parking,cafes,accessible','standard','Miyako-jima, Okinawa; finest beach in Japan; 7km of white powder sand; extremely shallow; jellyfish nets in summer'),
  bch('Furuzamami','JP',26.232,127.303,'seasonal','May–Oct','excellent','showers,toilets,lifeguard,parking,cafes,water-sports','standard','Zamami island, Okinawa; exceptional snorkelling; sea turtles very common; humpback whales Jan–Mar; fast ferry from Naha'),
  bch('Haeundae','KR',35.159,129.160,'seasonal','Jun–Aug','good','showers,toilets,lifeguard,parking,cafes,first-aid,accessible','standard','Busan; Korea\'s most famous; 1.5km white sand; over 1M visitors in August; jellyfish nets; Korean beach culture'),
  bch('Woljeongri','KR',33.556,126.794,'open','Jun–Sep','excellent','showers,toilets,parking,cafes','standard','Jeju; unusually clear turquoise water for Korea; volcanic black lava rocks at edges; trendy cafes behind beach'),
  // ── Oceania ──
  bch('Whitehaven Beach','AU',-20.282,149.042,'restricted','Year-round','excellent','toilets','standard','Whitsundays, QLD; 98% pure silica sand; no permanent facilities; NP access by tour boat; Hill Inlet lookout gives iconic white swirl view'),
  bch('Hyams Beach','AU',-35.107,150.679,'open','Nov–Mar','excellent','toilets,parking,cafes','standard','Jervis Bay, NSW; whitest sand in the world by Guinness record; crystal clear water; small holiday village; dolphins common'),
  bch('Bondi Beach','AU',-33.889,151.275,'open','Year-round','good','showers,toilets,lifeguard,parking,cafes,first-aid,accessible,water-sports','standard','Sydney; iconic; Blue Flag; shark nets and lifeguards (Bondi Rescue TV show); coastal walk to Coogee; can be crowded year-round'),
  bch('Cable Beach','AU',-17.978,122.191,'open','May–Oct','good','showers,toilets,parking,cafes','standard','Broome, WA; 22km red pindan cliffs meeting white sand; camel rides at sunset; stingers Nov–Apr restrict swimming; Cable Beach Club'),
  bch('Hahei / Cathedral Cove','NZ',-36.852,175.779,'restricted','Nov–Mar','excellent','toilets,parking,cafes','standard','Coromandel; walk-in only 35 min or kayak; sea arch leads to private cove; stars in the "Chronicles of Narnia" film; water cool but swimmable Dec–Feb'),
  bch('Hot Water Beach','NZ',-36.895,175.853,'open','Year-round','good','showers,toilets,parking,cafes','standard','Coromandel; dig your own hot-pool in the sand 2hrs either side of low tide; hire a spade; geothermal seawater'),
  bch('Piha','NZ',-36.959,174.467,'open','Year-round','good','showers,toilets,lifeguard,parking,cafes','standard','Auckland; black sand surf beach; Lion Rock splits the bay; strong rip currents; only swim between flags; dramatic scenery'),
  bch('Natadola Beach','FJ',-18.100,177.338,'open','Year-round','excellent','showers,toilets,parking,cafes,water-sports,accessible','standard','Fiji; most accessible quality beach from Nadi (1hr); calm lagoon; resort-style services; snorkelling and horse riding'),
  bch('Matira','PF',-16.582,-151.737,'open','Year-round','excellent','toilets,cafes','standard','Bora Bora; only free public beach on the island; all other beaches front private resorts; fine white sand; calm lagoon; beautiful views of Mt Otemanu'),
  bch('Muri Beach','CK',-21.241,-159.747,'open','Year-round','excellent','showers,toilets,cafes,water-sports','standard','Rarotonga; calm lagoon perfect for kayaking to Motu islets; snorkelling; colourful fish; Pacific village atmosphere'),
  // ── United Kingdom ──
  bch('Brighton Beach','GB',50.820,-0.137,'open','May–Sep','fair','showers,toilets,lifeguard,parking,cafes,first-aid,accessible,water-sports','standard','England; iconic pebble beach on the English Channel; lively pier, music and nightlife; water swimmable Jun-Sep; Blue Flag for water quality; busy summer weekends'),
  bch('Luskentyre','GB',57.910,-6.959,'seasonal','Jun–Sep','excellent','toilets,parking','standard','Outer Hebrides, Scotland; white sand and turquoise water that rivals the Caribbean in appearance; remote and often deserted; cold water year-round; midges May-Aug; wild and pristine'),
  bch('Rhossili Bay','GB',51.567,-4.285,'open','May–Sep','good','toilets,parking,cafes','standard','Gower Peninsula, Wales; 5km west-facing arc of sand; dramatic headland and Worms Head tidal island; strong swell popular with surfers; Blue Flag; cold Atlantic water'),
  bch('Perranporth','GB',50.352,-5.156,'open','May–Sep','good','showers,toilets,lifeguard,parking,cafes','standard','Cornwall, England; 3km surf beach; consistent swell; Atlantic-facing; cool water; lifeguards in summer; dunes behind the beach; charming village'),
  // ── Egypt ──
  bch('Dahab','EG',28.490,34.515,'open','Year-round','excellent','showers,toilets,cafes,water-sports','standard','South Sinai; legendary backpacker and diving town; Blue Hole snorkelling 5 min away; laid-back Bedouin atmosphere; best Oct-May; strong currents at Blue Hole'),
  bch('Marsa Matruh','EG',31.353,27.238,'seasonal','May–Sep','excellent','showers,toilets,lifeguard,parking,cafes','standard','Mediterranean coast; most beautiful beach in Egypt; turquoise water and white sand in sheltered bays; domestic summer resort; very hot Jul-Aug; minimal international tourism'),
  // ── Argentina ──
  bch('Mar del Plata','AR',-38.003,-57.542,'open','Dec–Mar','fair','showers,toilets,lifeguard,parking,cafes,first-aid,accessible,water-sports','standard','Buenos Aires Province; Argentina\'s main Atlantic beach resort; 8km of beaches; very crowded Dec-Feb (Argentines on holiday); cold South Atlantic water; lively casino and nightlife'),
  bch('Pinamar','AR',-37.104,-56.863,'seasonal','Dec–Mar','good','showers,toilets,lifeguard,parking,cafes,water-sports','standard','Buenos Aires Province; fashionable dune-backed Atlantic resort; pine forests planted in the dunes; upscale compared to Mar del Plata; cold water; peak Jan-Feb'),
  bch('Puerto Madryn','AR',-42.768,-65.031,'seasonal','Sep–Apr','good','showers,toilets,parking,cafes','standard','Patagonian coast; gateway to Valdés Peninsula whale watching; quiet grey-sand beach; cold Atlantic; right whales Jun-Dec; penguins Sep-Apr at Punta Tombo nearby'),
];

// ─── Climate Zones (geographic polygons, follow terrain not politics) ────────
const CLIMATE_ZONES = [
  // ── Europe ──
  { id:'eu-alps-arc', name:'Alpine Arc', parent:'CH', layers:{ weather:s12(2,2,2,1,0,0,0,0,0,1,2,2), crowds:s12(1,2,2,1,1,1,2,2,2,1,1,2) }, geometry:{ type:'Polygon', coordinates:[[[6.5,43.8],[7.2,44.3],[6.8,45.0],[7.0,46.0],[7.5,47.2],[8.5,47.8],[9.5,47.8],[11.0,47.8],[12.5,47.7],[13.5,47.5],[14.5,46.5],[14.8,46.0],[13.5,45.6],[12.0,44.8],[10.5,44.2],[9.0,44.0],[7.5,43.8],[6.5,43.8]]] } },
  { id:'eu-med-coast-spain', name:'Spanish Mediterranean Coast', parent:'ES', layers:{ weather:s12(1,1,0,0,0,0,1,1,0,0,0,1), beaches:s12(2,2,1,1,0,0,0,0,0,1,2,2), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[-2.5,36.5],[3.3,42.5],[3.3,41.0],[2.5,40.8],[1.5,40.0],[0.5,39.0],[-0.2,38.2],[-1.0,37.5],[-2.3,36.7],[-2.5,36.5]]] } },
  { id:'eu-med-coast-france', name:'French Riviera', parent:'FR', layers:{ weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), beaches:s12(2,2,1,1,0,0,0,0,0,0,1,2), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[3.3,42.5],[3.5,43.5],[4.5,43.8],[5.5,43.5],[6.0,43.5],[6.5,43.8],[7.5,43.7],[7.7,43.5],[7.5,43.0],[6.5,43.0],[5.5,43.0],[4.5,43.2],[3.5,43.0],[3.3,42.5]]] } },
  { id:'eu-atlantic-iberia', name:'Atlantic Iberia (Green Spain & N Portugal)', parent:'ES', layers:{ weather:s12(2,2,2,1,1,1,0,0,1,1,2,2), beaches:s12(2,2,2,1,1,1,1,1,1,1,2,2) }, geometry:{ type:'Polygon', coordinates:[[[-9.5,36.8],[-9.2,38.5],[-9.5,39.5],[-9.3,41.5],[-8.5,43.0],[-7.5,43.8],[-6.0,43.8],[-4.5,43.5],[-3.0,43.4],[-1.8,43.4],[-1.8,42.5],[-3.0,42.0],[-4.5,41.5],[-6.0,41.0],[-7.0,40.0],[-8.0,38.5],[-8.5,37.5],[-9.5,36.8]]] } },
  { id:'eu-algarve-coast', name:'Portuguese Algarve Coast', parent:'PT', layers:{ weather:s12(1,1,0,0,0,0,0,0,0,0,0,1), beaches:s12(1,2,1,0,0,0,0,0,0,0,1,1), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[-9.0,37.2],[-9.5,37.0],[-9.0,36.9],[-8.0,37.0],[-7.5,37.1],[-7.0,37.2],[-7.0,37.5],[-8.0,37.5],[-9.0,37.5],[-9.0,37.2]]] } },
  { id:'eu-scottish-highlands', name:'Scottish Highlands', parent:'GB', layers:{ weather:s12(3,3,3,2,1,0,0,1,1,2,3,3) }, geometry:{ type:'Polygon', coordinates:[[[-5.5,56.0],[-4.5,56.5],[-3.5,57.0],[-2.5,57.5],[-3.0,58.0],[-4.0,58.5],[-5.0,58.5],[-6.5,58.0],[-7.5,57.5],[-6.0,56.5],[-5.5,56.0]]] } },
  { id:'eu-scandinavian-arctic', name:'Scandinavian Arctic (above 66.5°N)', parent:'NO', layers:{ weather:s12(3,3,3,3,1,0,0,1,3,3,3,3) }, geometry:{ type:'Polygon', coordinates:[[[14.5,66.5],[18.0,66.5],[22.0,66.5],[26.0,66.5],[29.5,66.5],[31.0,68.0],[29.5,70.0],[25.0,71.5],[20.0,70.5],[16.0,69.5],[14.0,68.5],[13.0,67.5],[14.5,66.5]]] } },
  { id:'eu-greek-islands-aegean', name:'Greek Aegean Islands', parent:'GR', layers:{ weather:s12(1,1,1,0,0,0,0,1,0,0,1,1), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[23.5,36.5],[24.5,36.0],[25.5,36.0],[26.5,36.5],[27.0,37.5],[26.5,38.5],[25.5,39.0],[24.0,39.0],[23.0,38.5],[23.0,37.5],[23.5,36.5]]] } },
  { id:'eu-greek-crete', name:'Crete', parent:'GR', layers:{ weather:s12(1,1,1,0,0,0,0,1,0,0,1,1), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2), crowds:s12(0,0,1,1,2,2,3,3,2,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[23.5,35.5],[24.5,34.9],[25.5,35.0],[26.0,35.2],[26.5,35.5],[26.0,35.8],[25.0,35.8],[24.0,35.5],[23.5,35.5]]] } },
  { id:'eu-ionian-islands', name:'Greek Ionian Islands', parent:'GR', layers:{ weather:s12(2,2,1,0,0,0,0,0,0,0,1,2), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2) }, geometry:{ type:'Polygon', coordinates:[[[19.5,37.5],[20.5,37.5],[21.5,37.5],[21.5,38.5],[21.0,39.5],[20.0,40.0],[19.5,39.5],[19.5,38.5],[19.5,37.5]]] } },
  { id:'eu-canary-islands', name:'Canary Islands (Year-round Spring)', parent:'ES', layers:{ weather:s12(0,0,0,0,0,0,0,0,0,0,0,0), beaches:s12(0,0,0,0,0,0,0,0,0,0,0,0), crowds:s12(2,2,1,1,1,1,2,2,1,1,1,2) }, geometry:{ type:'Polygon', coordinates:[[[-18.5,27.5],[-13.0,27.5],[-13.0,29.5],[-18.5,29.5],[-18.5,27.5]]] } },
  { id:'eu-dinaric-coast', name:'Adriatic (Dalmatia & Montenegro)', parent:'HR', layers:{ weather:s12(1,1,1,0,0,0,0,0,0,0,1,1), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[13.5,44.0],[14.5,45.0],[16.5,43.5],[17.0,43.0],[18.0,43.0],[19.0,42.0],[20.0,41.5],[19.5,41.0],[18.5,41.5],[17.5,42.5],[16.0,42.5],[15.0,43.5],[14.0,44.0],[13.5,44.0]]] } },
  { id:'eu-iceland-south', name:'Iceland — South & Reykjavik', parent:'IS', layers:{ weather:s12(3,3,3,2,1,0,0,1,2,3,3,3) }, geometry:{ type:'Polygon', coordinates:[[[-24.0,63.5],[-22.0,63.5],[-20.0,63.5],[-18.0,64.0],[-20.0,64.5],[-22.0,64.5],[-24.0,64.0],[-24.0,63.5]]] } },
  // ── Middle East & Central Asia ──
  { id:'me-levant-coast', name:'Levant Mediterranean Coast', parent:'TR', layers:{ weather:s12(1,1,0,0,0,0,1,2,0,0,1,1), beaches:s12(2,2,1,0,0,0,0,1,0,0,1,2) }, geometry:{ type:'Polygon', coordinates:[[[27.0,36.5],[28.5,37.0],[29.5,37.0],[31.0,37.0],[32.5,36.5],[34.0,36.5],[36.5,35.5],[36.5,34.5],[36.0,33.5],[35.5,33.0],[35.0,32.0],[34.5,31.5],[34.0,31.5],[34.5,32.5],[35.0,33.5],[35.0,34.5],[35.5,35.5],[35.0,36.5],[33.0,37.0],[31.0,37.5],[29.0,37.5],[27.0,37.5],[27.0,36.5]]] } },
  { id:'me-anatolian-plateau', name:'Central Anatolian Plateau', parent:'TR', layers:{ weather:s12(2,2,1,1,0,1,2,2,0,1,1,2) }, geometry:{ type:'Polygon', coordinates:[[[29.0,39.5],[30.5,40.5],[32.0,40.5],[34.0,41.0],[36.0,41.0],[38.0,40.0],[38.0,38.5],[37.0,37.5],[35.0,37.0],[33.0,37.0],[31.0,37.5],[29.0,38.0],[29.0,39.5]]] } },
  { id:'me-east-anatolia', name:'Eastern Anatolia Highlands', parent:'TR', layers:{ weather:s12(3,3,3,2,1,0,0,0,1,2,3,3) }, geometry:{ type:'Polygon', coordinates:[[[38.0,38.5],[40.0,39.0],[42.0,40.5],[43.5,40.0],[44.5,38.5],[44.0,37.5],[43.0,37.0],[41.0,37.0],[39.0,37.5],[38.0,38.5]]] } },
  { id:'me-black-sea-coast-turkey', name:'Turkish Black Sea Coast', parent:'TR', layers:{ weather:s12(2,2,2,1,1,1,1,1,1,1,2,2) }, geometry:{ type:'Polygon', coordinates:[[[31.5,41.2],[33.0,41.5],[35.0,41.5],[37.0,41.2],[39.0,41.0],[41.5,41.0],[41.0,40.5],[39.0,40.5],[37.0,40.8],[35.0,40.8],[33.0,41.0],[31.5,41.2]]] } },
  { id:'me-gulf-coast', name:'Arabian Gulf (Extreme Summer Heat)', parent:'AE', layers:{ weather:s12(0,0,0,0,1,3,3,3,3,1,0,0), health:rep(1) }, geometry:{ type:'Polygon', coordinates:[[[47.0,27.0],[48.5,27.5],[50.0,26.5],[51.0,25.5],[51.5,24.5],[52.0,23.5],[56.0,22.0],[57.0,22.5],[59.0,22.0],[58.0,24.0],[56.5,24.5],[54.0,24.0],[52.0,26.0],[50.5,29.0],[48.0,29.5],[47.0,27.0]]] } },
  { id:'me-asir-highlands', name:'Asir & Hejaz Highlands (SW Saudi)', parent:'SA', layers:{ weather:s12(0,0,0,0,0,1,2,2,1,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[39.0,21.0],[40.0,21.5],[41.0,21.0],[42.0,19.5],[43.0,18.0],[43.5,17.0],[43.0,16.5],[42.0,17.0],[41.0,18.5],[40.0,20.0],[39.0,21.0]]] } },
  { id:'me-nile-delta', name:'Nile Delta & Alexandria Coast', parent:'EG', layers:{ weather:s12(1,1,0,0,0,1,2,2,1,0,1,1) }, geometry:{ type:'Polygon', coordinates:[[[29.0,30.0],[30.5,30.5],[31.5,30.5],[32.5,31.0],[33.0,31.5],[32.5,32.0],[31.0,31.5],[29.5,31.0],[28.5,30.5],[29.0,30.0]]] } },
  { id:'ca-fergana-valley', name:'Fergana Valley', parent:'UZ', layers:{ weather:s12(1,1,1,1,0,1,2,3,1,0,1,1) }, geometry:{ type:'Polygon', coordinates:[[[69.5,40.0],[70.0,40.5],[71.0,40.5],[71.5,41.0],[72.5,40.5],[73.5,39.5],[72.5,39.0],[71.0,39.5],[70.0,39.5],[69.5,40.0]]] } },
  { id:'ca-pamir-highlands', name:'Pamir Highlands (above 3000m)', parent:'TJ', layers:{ weather:s12(3,3,3,3,2,0,0,0,1,3,3,3) }, geometry:{ type:'Polygon', coordinates:[[[70.0,37.0],[71.5,37.5],[73.0,37.5],[74.5,38.0],[76.5,38.0],[77.5,38.5],[77.0,39.5],[75.0,40.0],[73.0,39.5],[71.0,38.5],[70.0,37.5],[70.0,37.0]]] } },
  { id:'ca-kazakh-steppe', name:'Kazakh Steppe (Extreme Continental)', parent:'KZ', layers:{ weather:s12(3,3,2,1,0,1,2,3,1,1,3,3) }, geometry:{ type:'Polygon', coordinates:[[[55.0,47.0],[60.0,50.0],[65.0,51.0],[70.0,51.0],[75.0,50.0],[80.0,50.0],[82.0,48.0],[80.0,45.0],[75.0,44.0],[70.0,44.0],[65.0,45.0],[60.0,46.0],[55.0,47.0]]] } },
  { id:'ca-caspian-humid', name:'Western Caspian Coast (Humid)', parent:'IR', layers:{ weather:s12(1,2,2,1,1,2,2,2,1,1,2,2) }, geometry:{ type:'Polygon', coordinates:[[[48.0,37.5],[49.0,37.0],[50.5,36.5],[50.5,37.5],[50.0,38.5],[50.5,38.5],[50.5,39.5],[50.0,40.0],[49.0,40.5],[48.5,41.0],[48.0,40.0],[48.0,37.5]]] } },
  // ── South Asia ──
  { id:'sa-western-ghats-slope', name:'Western Ghats & Kerala Coast', parent:'IN', layers:{ weather:s12(0,0,0,1,2,3,3,3,3,2,1,0), health:rep(2), disaster:s12(0,0,0,0,1,3,3,3,3,2,0,0) }, geometry:{ type:'Polygon', coordinates:[[[73.0,8.5],[76.0,8.0],[77.5,8.5],[77.5,9.5],[76.5,10.5],[76.0,11.5],[75.5,12.5],[75.0,13.5],[74.5,14.5],[73.5,15.5],[73.5,16.5],[73.5,17.5],[73.0,18.5],[73.0,17.0],[73.5,15.0],[73.5,13.0],[73.0,11.0],[73.0,8.5]]] } },
  { id:'sa-deccan-plateau-dry', name:'Deccan Plateau (Rain Shadow)', parent:'IN', layers:{ weather:s12(0,0,1,2,3,3,2,2,2,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[74.0,18.0],[76.0,18.5],[78.0,18.0],[80.0,17.5],[81.0,17.0],[80.5,15.0],[79.5,13.5],[78.5,12.5],[77.5,11.0],[77.0,10.0],[76.5,11.0],[77.5,13.0],[78.0,15.0],[77.5,17.0],[76.0,17.5],[74.0,18.0]]] } },
  { id:'sa-gangetic-plain', name:'Indo-Gangetic Plain', parent:'IN', layers:{ weather:s12(0,0,1,2,3,3,2,2,2,1,0,0), health:rep(2), disaster:s12(0,0,0,0,1,2,3,3,2,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[73.5,26.0],[76.0,27.0],[78.0,27.5],[80.0,27.0],[82.0,26.5],[84.0,26.5],[86.0,25.5],[88.0,24.5],[89.0,25.0],[88.0,25.5],[86.0,26.5],[84.0,27.0],[82.0,27.5],[80.0,28.0],[78.0,29.0],[76.0,29.0],[73.5,28.0],[73.5,26.0]]] } },
  { id:'sa-himalayan-foothills', name:'Himalayan Foothills (500–2000m)', parent:'NP', layers:{ weather:s12(1,1,1,0,0,1,2,2,1,0,0,1), health:rep(1), disaster:s12(0,0,0,0,0,2,3,3,1,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[74.0,29.0],[76.5,30.5],[79.0,30.5],[81.0,29.5],[83.5,28.5],[85.5,28.0],[87.5,27.5],[89.0,27.0],[90.5,27.0],[91.5,27.5],[92.0,27.0],[91.0,26.5],[89.0,26.0],[87.0,26.5],[85.0,27.0],[83.0,27.5],[80.5,28.5],[78.0,28.5],[76.0,29.0],[74.0,29.0]]] } },
  { id:'sa-himalayan-high', name:'High Himalaya (above 3000m)', parent:'NP', layers:{ weather:s12(3,3,2,1,0,1,2,2,1,0,1,3) }, geometry:{ type:'Polygon', coordinates:[[[76.0,31.0],[78.0,32.5],[80.0,33.5],[82.5,32.0],[85.0,29.5],[87.5,28.5],[89.0,27.5],[91.0,27.8],[92.5,28.0],[92.5,29.0],[91.0,29.0],[88.0,30.0],[85.5,30.5],[83.0,29.5],[80.5,30.5],[78.0,31.5],[76.0,32.0],[76.0,31.0]]] } },
  { id:'sa-thar-desert', name:'Thar Desert & Rajasthan', parent:'IN', layers:{ weather:s12(0,0,1,2,3,3,3,3,2,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[68.0,28.0],[70.0,28.5],[72.0,27.5],[74.0,27.0],[74.0,25.0],[72.0,24.0],[70.0,24.5],[68.5,25.5],[67.5,27.0],[68.0,28.0]]] } },
  { id:'sa-bangladesh-delta', name:'Ganges–Brahmaputra Delta', parent:'BD', layers:{ weather:s12(0,0,1,2,3,3,3,3,2,1,0,0), disaster:s12(0,0,0,0,1,3,3,3,3,2,0,0), health:rep(2) }, geometry:{ type:'Polygon', coordinates:[[[88.0,22.0],[89.0,21.5],[90.0,21.5],[91.5,22.0],[92.5,22.5],[92.0,23.5],[91.0,24.0],[90.0,24.5],[89.0,24.5],[88.0,24.0],[88.0,22.0]]] } },
  { id:'sa-sri-lanka-wet-zone', name:'SW Sri Lanka (Wet Zone)', parent:'LK', layers:{ weather:s12(1,1,1,1,2,3,3,3,2,2,1,1), beaches:s12(0,0,1,1,2,3,3,3,2,2,0,0) }, geometry:{ type:'Polygon', coordinates:[[[79.8,6.0],[80.5,5.9],[80.5,7.0],[80.2,8.5],[79.8,9.5],[79.5,9.5],[79.5,7.5],[79.5,6.0],[79.8,6.0]]] } },
  { id:'sa-sri-lanka-dry-zone', name:'NE Sri Lanka (Dry Zone — Trinco)', parent:'LK', layers:{ weather:s12(2,1,0,0,0,0,0,0,1,2,3,2), beaches:s12(2,1,0,0,0,0,0,0,1,2,3,2) }, geometry:{ type:'Polygon', coordinates:[[[80.5,7.0],[80.8,7.5],[81.5,8.0],[81.9,9.0],[81.0,9.5],[80.5,9.5],[80.2,8.5],[80.5,7.0]]] } },
  // ── East & Southeast Asia ──
  { id:'ea-hokkaido', name:'Hokkaido (Subarctic Japan)', parent:'JP', layers:{ weather:s12(3,3,2,2,1,0,0,0,1,1,2,3) }, geometry:{ type:'Polygon', coordinates:[[[141.0,44.0],[141.5,44.5],[142.5,44.5],[143.5,44.0],[144.5,44.0],[145.0,43.5],[145.5,43.0],[145.0,42.5],[144.0,42.0],[143.0,42.0],[142.0,42.5],[141.0,43.0],[140.5,43.5],[141.0,44.0]]] } },
  { id:'ea-honshu-sea-of-japan-coast', name:'Sea of Japan Coast (Heavy Snow)', parent:'JP', layers:{ weather:s12(2,3,2,1,0,0,0,0,1,1,1,2) }, geometry:{ type:'Polygon', coordinates:[[[132.5,34.5],[133.5,35.0],[135.0,35.5],[136.5,36.5],[137.5,37.0],[138.5,38.0],[139.5,39.5],[140.5,41.5],[141.5,42.5],[141.5,43.0],[140.5,42.0],[139.0,40.0],[138.0,37.5],[136.5,36.0],[135.0,35.0],[133.5,34.5],[132.5,34.5]]] } },
  { id:'ea-okinawa-ryukyu', name:'Okinawa & Ryukyu Islands', parent:'JP', layers:{ weather:s12(1,0,0,0,2,2,1,2,2,1,1,1), beaches:s12(0,0,0,0,2,2,1,2,2,1,1,1), disaster:s12(0,0,0,0,1,1,1,3,3,2,0,0) }, geometry:{ type:'Polygon', coordinates:[[[123.0,24.0],[124.5,24.5],[126.0,26.0],[127.5,26.5],[128.5,27.0],[129.0,28.0],[129.0,28.5],[127.5,28.0],[126.0,27.0],[124.5,25.5],[123.0,25.0],[123.0,24.0]]] } },
  { id:'ea-tibetan-plateau', name:'Tibetan Plateau (above 3500m)', parent:'CN', layers:{ weather:s12(3,3,2,1,0,1,1,1,0,1,2,3) }, geometry:{ type:'Polygon', coordinates:[[[80.0,31.0],[82.0,32.0],[84.0,32.0],[86.0,31.5],[88.0,32.0],[90.0,32.5],[92.0,32.0],[94.0,33.0],[96.0,33.0],[97.0,34.0],[96.0,35.0],[94.0,34.5],[92.0,33.5],[90.0,33.0],[88.0,33.0],[86.0,32.5],[84.0,33.0],[82.0,33.0],[80.0,32.5],[80.0,31.0]]] } },
  { id:'ea-yunnan-highlands', name:'Yunnan Highlands — Spring City Zone', parent:'CN', layers:{ weather:s12(0,0,0,0,1,2,2,2,1,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[99.0,25.5],[100.0,26.5],[101.0,27.0],[102.5,27.0],[103.0,26.0],[103.0,24.5],[102.5,23.0],[101.5,22.5],[100.5,22.5],[100.0,23.5],[99.5,24.5],[99.0,25.5]]] } },
  { id:'ea-sichuan-basin', name:'Sichuan Basin (Overcast & Foggy)', parent:'CN', layers:{ weather:s12(1,1,1,1,1,2,2,3,2,1,1,2) }, geometry:{ type:'Polygon', coordinates:[[[102.5,28.0],[103.5,29.0],[104.5,30.0],[105.5,30.5],[107.0,31.0],[108.5,30.5],[108.5,29.0],[107.5,28.0],[106.0,28.5],[104.5,28.5],[103.0,28.0],[102.5,28.0]]] } },
  { id:'ea-south-china-tropical', name:'South China & Hainan (Subtropical)', parent:'CN', layers:{ weather:s12(1,2,2,2,2,2,2,2,2,1,0,1), beaches:s12(0,0,1,1,2,2,2,2,2,1,0,0), disaster:s12(0,0,0,0,1,2,2,3,3,2,0,0) }, geometry:{ type:'Polygon', coordinates:[[[108.0,18.0],[110.5,18.5],[110.5,20.0],[110.0,21.0],[109.0,21.5],[108.0,22.0],[110.0,23.5],[111.5,24.0],[113.0,23.5],[114.0,23.0],[115.5,22.5],[117.0,23.0],[117.5,24.0],[115.5,24.0],[113.0,24.5],[110.5,22.5],[109.5,21.5],[108.5,21.0],[108.0,19.5],[108.0,18.0]]] } },
  { id:'ea-north-vietnam', name:'Northern Vietnam (4-Season Hanoi)', parent:'VN', layers:{ weather:s12(2,2,2,1,1,1,2,2,1,0,0,1) }, geometry:{ type:'Polygon', coordinates:[[[102.0,21.5],[103.0,22.5],[104.5,22.5],[106.5,22.0],[107.5,21.5],[108.0,21.0],[107.0,20.0],[106.0,19.5],[105.0,19.5],[104.0,20.0],[103.0,20.5],[102.0,21.5]]] } },
  { id:'ea-central-vietnam-coast', name:'Central Vietnam Coast (Flood Oct–Dec)', parent:'VN', layers:{ weather:s12(2,1,0,0,0,1,1,1,1,2,3,2), disaster:s12(0,0,0,0,0,0,0,0,0,2,3,2) }, geometry:{ type:'Polygon', coordinates:[[[105.0,19.5],[107.0,20.0],[107.5,18.5],[107.5,17.0],[107.0,16.0],[106.5,15.0],[107.5,14.0],[108.0,13.0],[108.0,11.5],[107.5,11.0],[107.0,11.5],[107.0,13.0],[106.5,14.5],[106.5,16.0],[106.5,17.5],[107.0,18.5],[105.5,19.5],[105.0,19.5]]] } },
  { id:'ea-mekong-south-vietnam', name:'Southern Vietnam & Mekong Delta', parent:'VN', layers:{ weather:s12(0,0,0,1,2,3,3,3,2,2,1,0), health:rep(2) }, geometry:{ type:'Polygon', coordinates:[[[103.5,10.5],[104.5,10.0],[105.5,9.5],[106.5,9.5],[107.0,10.5],[107.5,11.0],[107.0,11.5],[106.5,10.5],[105.5,10.0],[104.0,10.5],[103.5,10.5]]] } },
  { id:'ea-andaman-coast-thailand', name:'Thailand Andaman Coast (Phuket / Krabi)', parent:'TH', layers:{ weather:s12(0,0,0,0,2,2,2,2,2,2,1,0), beaches:s12(0,0,0,0,2,3,3,3,2,2,1,0) }, geometry:{ type:'Polygon', coordinates:[[[99.7,6.4],[99.5,7.0],[98.5,7.5],[98.3,8.5],[98.5,9.5],[98.7,10.5],[99.0,11.0],[99.5,11.5],[99.5,12.5],[99.5,13.5],[100.0,14.0],[100.5,13.5],[100.5,12.0],[100.0,10.5],[100.0,9.0],[100.5,7.5],[101.0,6.5],[99.7,6.4]]] } },
  { id:'ea-gulf-thailand-coast', name:'Gulf of Thailand Coast (Koh Samui / Hua Hin)', parent:'TH', layers:{ weather:s12(0,0,0,0,0,1,1,1,1,2,3,2), beaches:s12(0,0,0,0,0,1,1,1,1,2,3,2) }, geometry:{ type:'Polygon', coordinates:[[[102.0,6.0],[102.5,7.0],[103.0,8.5],[102.5,10.0],[101.5,11.0],[100.5,12.0],[100.5,13.5],[100.5,14.0],[101.5,14.0],[102.5,13.0],[103.0,11.0],[103.0,8.0],[102.5,6.5],[102.0,6.0]]] } },
  { id:'ea-chiang-mai-north-thailand', name:'North Thailand Highlands (Smoke Season)', parent:'TH', layers:{ weather:s12(0,0,3,3,2,1,1,1,2,1,0,0), health:s12(0,0,3,3,2,0,0,0,0,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[98.5,16.5],[99.5,17.5],[100.0,18.0],[100.5,19.0],[101.0,20.0],[101.5,20.5],[102.5,20.5],[102.5,19.0],[101.5,18.0],[100.5,17.0],[99.5,16.5],[98.5,16.5]]] } },
  { id:'ea-luzon-pacific-coast', name:'Luzon Pacific Coast (Typhoon Corridor)', parent:'PH', layers:{ weather:s12(1,1,1,2,2,2,2,2,2,2,2,1), disaster:rep(3) }, geometry:{ type:'Polygon', coordinates:[[[120.0,14.0],[120.5,14.5],[121.0,15.5],[122.0,16.5],[123.0,17.5],[124.0,18.0],[124.0,17.0],[123.0,16.5],[122.5,15.5],[121.5,14.5],[120.5,13.5],[120.0,14.0]]] } },
  { id:'ea-luzon-west-manila', name:'Manila & West Luzon', parent:'PH', layers:{ weather:s12(0,0,0,1,2,2,2,2,2,2,1,0) }, geometry:{ type:'Polygon', coordinates:[[[119.5,16.5],[120.0,16.0],[120.5,15.0],[121.0,14.5],[120.5,14.0],[120.0,13.5],[119.5,13.0],[119.0,14.0],[119.0,15.5],[119.5,16.5]]] } },
  { id:'ea-visayas-sulu', name:'Visayas (Cebu / Bohol — Outside Typhoon Belt)', parent:'PH', layers:{ weather:s12(0,0,0,1,1,1,1,1,1,1,1,0), beaches:s12(0,0,0,1,1,1,1,1,1,1,1,0), disaster:rep(1) }, geometry:{ type:'Polygon', coordinates:[[[122.5,10.5],[123.5,11.0],[124.5,11.5],[125.0,11.0],[124.5,10.0],[123.5,9.5],[122.5,9.5],[121.5,9.5],[121.0,10.5],[122.5,10.5]]] } },
  { id:'ea-mindanao-palawan', name:'Mindanao & Palawan (South of Typhoon Belt)', parent:'PH', layers:{ weather:s12(0,0,0,0,0,1,1,1,1,1,0,0), beaches:s12(0,0,0,0,0,1,1,1,1,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[117.5,9.0],[118.5,9.5],[119.5,10.0],[120.5,10.5],[121.5,9.0],[122.5,8.5],[124.0,7.5],[125.5,8.0],[126.0,8.5],[125.5,9.0],[124.0,8.5],[122.5,8.0],[120.5,9.0],[119.0,9.5],[117.5,9.0]]] } },
  { id:'ea-borneo-equatorial', name:'Borneo (Equatorial — Always Rainy)', parent:'MY', layers:{ weather:s12(2,2,2,2,2,2,1,1,1,2,2,2), health:rep(2) }, geometry:{ type:'Polygon', coordinates:[[[108.0,1.5],[109.5,1.0],[111.0,1.5],[113.0,1.5],[114.5,2.0],[115.5,3.5],[117.0,4.0],[118.0,5.0],[118.0,6.5],[116.5,7.0],[115.0,6.5],[113.0,5.5],[111.0,4.0],[109.5,2.5],[108.0,1.5]]] } },
  { id:'ea-bali-lombok', name:'Bali & Lombok (Dry Season Apr–Oct)', parent:'ID', layers:{ weather:s12(2,2,2,1,0,0,0,0,0,1,2,2), beaches:s12(2,2,2,1,0,0,0,0,0,1,2,2) }, geometry:{ type:'Polygon', coordinates:[[[114.5,-8.8],[115.5,-8.2],[116.5,-8.2],[117.5,-8.8],[117.5,-9.0],[116.5,-9.0],[115.5,-8.8],[114.5,-9.0],[114.5,-8.8]]] } },
  { id:'ea-java-west-jakarta', name:'West Java & Jakarta (Flooding Nov–Mar)', parent:'ID', layers:{ weather:s12(2,3,2,1,1,0,0,0,0,0,1,2), disaster:s12(0,2,3,1,0,0,0,0,0,0,0,1) }, geometry:{ type:'Polygon', coordinates:[[[106.0,-5.8],[107.5,-6.0],[109.0,-6.5],[109.5,-7.0],[109.0,-7.5],[107.5,-7.5],[106.0,-7.0],[105.5,-6.5],[106.0,-5.8]]] } },
  { id:'ea-sumatra-west-coast', name:'Sumatra West Coast (Extreme Rainfall)', parent:'ID', layers:{ weather:s12(2,2,3,3,2,1,1,1,1,2,3,2), disaster:rep(2) }, geometry:{ type:'Polygon', coordinates:[[[95.5,5.5],[97.0,4.5],[98.0,3.0],[99.0,2.0],[100.0,1.0],[101.0,0.0],[103.0,-2.5],[104.5,-5.0],[106.0,-6.0],[105.5,-6.5],[104.0,-5.5],[102.5,-3.5],[101.0,-1.0],[100.5,0.5],[99.5,1.5],[98.5,3.0],[97.5,4.5],[96.0,5.0],[95.5,5.5]]] } },
  // ── Africa ──
  { id:'af-sahara-core', name:'Sahara Desert Core', parent:'DZ', layers:{ weather:s12(0,0,1,2,3,3,3,3,3,2,1,0) }, geometry:{ type:'Polygon', coordinates:[[[-17.0,15.5],[-10.0,15.0],[-5.0,14.0],[0.0,13.5],[5.0,14.0],[10.0,15.5],[15.0,18.0],[20.0,20.0],[25.0,22.0],[25.0,30.0],[20.0,30.0],[15.0,28.0],[10.0,25.0],[5.0,22.0],[0.0,20.0],[-5.0,18.0],[-10.0,17.0],[-17.0,15.5]]] } },
  { id:'af-sahel-belt', name:'Sahel Belt (Semi-Arid)', parent:'ML', layers:{ weather:s12(0,0,1,2,3,3,2,2,2,1,0,0), health:rep(2) }, geometry:{ type:'Polygon', coordinates:[[[-17.0,12.0],[-10.0,12.0],[-5.0,12.0],[0.0,12.0],[5.0,12.0],[10.0,12.0],[15.0,13.0],[20.0,14.0],[24.0,12.5],[24.0,11.0],[20.0,11.0],[15.0,11.5],[10.0,11.0],[5.0,10.0],[0.0,11.0],[-5.0,12.0],[-10.0,12.5],[-17.0,13.0],[-17.0,12.0]]] } },
  { id:'af-west-coast-humid', name:'Gulf of Guinea Coast (Hot & Humid)', parent:'GH', layers:{ weather:s12(1,1,2,2,2,2,2,2,2,2,2,1), health:rep(2) }, geometry:{ type:'Polygon', coordinates:[[[-17.0,11.0],[-15.0,11.5],[-13.0,10.5],[-11.0,9.5],[-9.0,8.0],[-7.0,7.0],[-5.0,5.5],[-3.0,5.0],[-1.0,5.5],[1.0,5.5],[3.0,4.5],[5.0,4.0],[7.0,4.5],[9.0,4.0],[10.0,4.5],[10.0,6.0],[8.0,6.0],[6.0,6.5],[4.0,7.0],[2.0,6.5],[0.0,6.5],[-2.0,6.0],[-4.0,6.5],[-6.0,7.5],[-8.0,8.5],[-10.0,9.5],[-12.0,10.0],[-14.0,11.0],[-17.0,11.0]]] } },
  { id:'af-ethiopian-highlands', name:'Ethiopian Highlands (Mild Year-round)', parent:'ET', layers:{ weather:s12(0,0,0,0,0,2,2,2,1,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[35.0,8.0],[36.5,9.5],[38.0,10.5],[39.5,11.5],[40.5,11.5],[41.0,10.5],[40.0,9.0],[39.0,8.0],[38.0,7.0],[37.0,6.5],[36.0,7.0],[35.0,8.0]]] } },
  { id:'af-horn-arid-coast', name:'Horn of Africa (Extreme Heat)', parent:'DJ', layers:{ weather:s12(1,1,2,2,3,3,3,3,3,2,2,1), health:rep(2) }, geometry:{ type:'Polygon', coordinates:[[[41.5,12.0],[43.0,11.5],[44.0,11.0],[45.0,10.5],[45.5,10.0],[44.5,11.5],[43.5,12.5],[42.5,11.5],[41.5,12.0]]] } },
  { id:'af-east-rift-highlands', name:'East African Rift Highlands', parent:'KE', layers:{ weather:s12(0,0,0,1,2,1,0,0,0,0,2,1) }, geometry:{ type:'Polygon', coordinates:[[[29.5,-1.5],[30.5,0.0],[31.5,1.0],[32.0,2.0],[34.0,2.5],[36.0,2.0],[37.5,0.5],[37.0,-1.0],[35.5,-2.5],[34.0,-2.5],[32.0,-2.5],[30.0,-1.5],[29.5,-1.5]]] } },
  { id:'af-east-coast-tropical', name:'East African Tropical Coast', parent:'TZ', layers:{ weather:s12(0,0,0,2,2,1,1,1,1,1,1,0), beaches:s12(0,0,1,2,2,1,1,1,1,1,1,0), health:rep(2) }, geometry:{ type:'Polygon', coordinates:[[[40.5,-11.0],[40.0,-10.0],[39.5,-8.5],[39.0,-6.5],[38.5,-5.0],[40.0,-4.0],[41.0,-2.5],[41.5,-1.0],[40.5,0.0],[39.5,-1.0],[39.0,-2.5],[37.5,-4.0],[36.5,-5.5],[36.0,-8.0],[37.0,-10.0],[37.5,-11.5],[40.5,-11.0]]] } },
  { id:'af-cape-mediterranean', name:'Cape Town Mediterranean Zone', parent:'ZA', layers:{ weather:s12(0,0,0,1,1,2,2,2,1,0,0,0), beaches:s12(0,0,0,1,1,2,2,2,1,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[17.5,-34.5],[18.5,-34.0],[19.5,-33.5],[20.5,-33.5],[21.5,-34.0],[22.5,-34.5],[22.5,-35.0],[20.5,-35.5],[18.5,-35.5],[17.5,-34.5]]] } },
  { id:'af-kalahari-semi-arid', name:'Kalahari Semi-Arid', parent:'BW', layers:{ weather:s12(2,2,1,0,0,0,0,0,0,1,1,2) }, geometry:{ type:'Polygon', coordinates:[[[19.5,-22.5],[22.0,-20.0],[24.5,-18.5],[26.0,-18.5],[27.5,-20.0],[27.5,-22.5],[26.0,-25.0],[24.0,-26.0],[21.5,-25.5],[20.0,-24.0],[19.5,-22.5]]] } },
  { id:'af-congo-basin-rainforest', name:'Congo Basin Rainforest', parent:'CD', layers:{ weather:s12(2,2,2,2,2,2,2,2,2,2,2,2), health:rep(3), disaster:rep(1) }, geometry:{ type:'Polygon', coordinates:[[[15.0,3.0],[17.0,5.0],[18.5,5.5],[20.0,5.0],[22.0,4.5],[24.0,4.5],[26.5,3.5],[28.0,2.0],[28.5,-1.0],[27.5,-3.0],[25.5,-5.0],[23.0,-6.0],[20.5,-5.0],[18.5,-3.5],[16.0,-2.5],[14.5,0.0],[14.5,2.5],[15.0,3.0]]] } },
  { id:'af-atlas-mountains', name:'Atlas Mountains', parent:'MA', layers:{ weather:s12(1,1,1,0,0,0,0,0,0,0,1,1) }, geometry:{ type:'Polygon', coordinates:[[[-5.5,35.5],[-3.5,35.5],[-1.5,34.5],[0.5,33.5],[2.5,32.5],[4.0,32.0],[6.0,30.0],[7.5,30.5],[9.0,32.0],[8.0,33.5],[6.0,34.5],[4.0,35.0],[2.0,35.5],[0.0,35.5],[-2.0,35.5],[-4.0,35.5],[-5.5,35.5]]] } },
  { id:'af-morocco-atlantic-coast', name:'Atlantic Morocco Coast', parent:'MA', layers:{ weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), beaches:s12(1,2,1,0,0,0,0,0,0,0,1,1) }, geometry:{ type:'Polygon', coordinates:[[[-5.5,35.5],[-6.0,33.5],[-7.0,31.5],[-8.5,30.0],[-9.5,29.0],[-9.5,28.0],[-8.5,28.0],[-8.0,29.0],[-7.5,30.5],[-6.0,32.0],[-5.5,33.5],[-5.0,35.0],[-5.5,35.5]]] } },
  { id:'af-madagascar-east-coast', name:'Madagascar East Coast (Cyclone Zone)', parent:'MG', layers:{ weather:s12(2,3,3,2,1,1,0,0,0,1,2,2), disaster:s12(3,3,3,2,0,0,0,0,0,1,2,3) }, geometry:{ type:'Polygon', coordinates:[[[49.5,-14.5],[50.5,-15.0],[50.5,-17.0],[50.0,-19.5],[49.5,-21.5],[49.0,-23.0],[47.5,-25.5],[45.0,-25.5],[45.5,-23.0],[46.0,-21.0],[47.0,-19.0],[47.5,-17.0],[49.0,-15.0],[49.5,-14.5]]] } },
  { id:'af-madagascar-highlands', name:'Madagascar Central Highlands', parent:'MG', layers:{ weather:s12(2,2,2,1,0,0,0,0,0,0,1,2) }, geometry:{ type:'Polygon', coordinates:[[[46.0,-14.0],[47.0,-13.5],[48.0,-13.5],[48.5,-14.5],[48.0,-16.5],[47.0,-19.0],[46.0,-21.0],[45.0,-22.5],[44.5,-21.0],[44.5,-19.0],[45.0,-17.0],[46.0,-15.0],[46.0,-14.0]]] } },
  // ── Americas ──
  { id:'am-pacific-coast-nw-us', name:'US Pacific NW Coast (Marine Layer)', parent:'US', layers:{ weather:s12(2,2,2,1,1,0,0,0,1,1,2,2) }, geometry:{ type:'Polygon', coordinates:[[[-124.5,36.5],[-123.0,37.5],[-122.0,38.5],[-124.0,40.0],[-124.5,42.0],[-124.5,44.5],[-124.0,46.0],[-123.5,47.5],[-124.5,48.5],[-124.5,36.5]]] } },
  { id:'am-california-central-valley', name:'California Central Valley (Tule Fog)', parent:'US', layers:{ weather:s12(1,1,1,1,2,2,3,3,2,1,1,1) }, geometry:{ type:'Polygon', coordinates:[[[-122.5,37.0],[-121.5,37.5],[-120.5,37.5],[-119.5,37.0],[-119.0,36.5],[-119.0,35.5],[-119.5,35.0],[-120.5,35.5],[-121.5,36.0],[-122.5,37.0]]] } },
  { id:'am-mojave-sonoran-desert', name:'Mojave & Sonoran Desert', parent:'US', layers:{ weather:s12(0,0,0,1,2,3,3,3,2,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[-120.0,34.0],[-117.5,34.5],[-114.5,35.0],[-112.0,36.5],[-110.5,37.0],[-109.5,35.5],[-109.0,33.0],[-111.0,31.5],[-113.0,30.5],[-114.5,31.5],[-116.0,32.5],[-118.0,33.5],[-120.0,34.0]]] } },
  { id:'am-rocky-mountain-high', name:'Rocky Mountains (above 1500m)', parent:'US', layers:{ weather:s12(2,2,2,1,1,0,0,0,0,1,2,2) }, geometry:{ type:'Polygon', coordinates:[[[-117.5,44.0],[-115.0,46.0],[-113.0,47.5],[-111.0,47.5],[-110.0,44.5],[-108.5,41.5],[-108.0,39.0],[-106.5,37.5],[-105.0,37.0],[-105.0,40.5],[-106.0,42.5],[-109.0,43.5],[-111.5,44.0],[-113.5,43.0],[-115.5,43.5],[-117.5,44.0]]] } },
  { id:'am-gulf-coast-humid', name:'US Gulf Coast (Humid Subtropical)', parent:'US', layers:{ weather:s12(1,1,1,2,2,2,3,3,2,1,1,1), disaster:s12(0,0,0,0,0,2,3,3,3,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[-97.5,26.0],[-95.0,27.0],[-91.0,28.5],[-89.0,29.5],[-87.5,30.5],[-85.0,30.5],[-83.5,29.5],[-83.5,28.0],[-85.0,29.0],[-87.5,30.0],[-90.0,28.5],[-92.0,27.5],[-95.0,25.5],[-97.5,26.0]]] } },
  { id:'am-florida-subtropical', name:'Florida Peninsula (Near-Tropical)', parent:'US', layers:{ weather:s12(1,1,0,0,1,2,2,2,2,1,1,1), beaches:s12(0,0,0,0,1,2,2,2,2,1,0,0), disaster:s12(0,0,0,0,0,2,3,3,3,2,0,0) }, geometry:{ type:'Polygon', coordinates:[[[-84.5,30.5],[-82.5,28.0],[-80.5,25.5],[-80.0,24.5],[-81.5,24.5],[-82.0,25.0],[-82.0,28.0],[-84.0,30.0],[-84.5,30.5]]] } },
  { id:'am-baja-peninsula', name:'Baja California Peninsula', parent:'MX', layers:{ weather:s12(0,0,0,0,1,2,3,3,2,1,0,0), beaches:s12(0,0,0,0,1,2,3,3,2,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[-117.0,32.5],[-115.0,30.5],[-113.0,29.0],[-111.5,27.0],[-110.0,24.5],[-109.5,23.5],[-110.0,22.5],[-110.5,24.0],[-112.0,27.5],[-114.0,30.0],[-116.0,31.5],[-117.0,32.5]]] } },
  { id:'am-oaxaca-chiapas-highlands', name:'Southern Mexican Highlands (Oaxaca)', parent:'MX', layers:{ weather:s12(0,0,0,0,1,2,2,2,1,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[-98.5,16.5],[-97.0,16.0],[-95.0,16.0],[-93.5,16.5],[-92.5,16.5],[-92.0,17.5],[-93.5,17.5],[-95.0,17.0],[-97.0,17.0],[-98.5,17.0],[-98.5,16.5]]] } },
  { id:'am-yucatan-caribbean', name:'Yucatán & Quintana Roo', parent:'MX', layers:{ weather:s12(0,0,0,1,2,2,2,2,2,2,1,0), beaches:s12(0,0,0,1,1,2,2,2,2,2,1,0), disaster:s12(0,0,0,0,0,2,3,3,3,3,1,0) }, geometry:{ type:'Polygon', coordinates:[[[-90.5,18.0],[-89.0,18.5],[-87.5,19.0],[-86.5,20.5],[-87.5,21.5],[-88.5,21.5],[-89.5,21.0],[-90.5,20.0],[-90.5,18.0]]] } },
  { id:'am-central-america-pacific', name:'Pacific Slope Central America', parent:'CR', layers:{ weather:s12(0,0,0,0,1,2,2,2,2,2,1,0), beaches:s12(0,0,0,0,1,2,2,2,2,2,1,0) }, geometry:{ type:'Polygon', coordinates:[[[-85.0,11.0],[-83.5,10.5],[-82.5,9.5],[-83.5,9.0],[-84.5,9.5],[-85.5,10.0],[-86.0,11.0],[-85.0,11.0]]] } },
  { id:'am-central-america-caribbean', name:'Caribbean Slope Central America', parent:'CR', layers:{ weather:s12(1,1,2,2,2,2,1,1,1,2,2,2), disaster:rep(1), health:rep(2) }, geometry:{ type:'Polygon', coordinates:[[[-83.0,10.5],[-82.0,9.5],[-81.0,8.5],[-79.5,8.5],[-78.5,9.5],[-80.0,9.5],[-81.0,9.0],[-82.5,10.0],[-83.5,10.5],[-83.0,10.5]]] } },
  { id:'am-colombia-coffee-andes', name:'Colombian Coffee Region & Medellín', parent:'CO', layers:{ weather:s12(0,0,0,1,1,0,0,0,0,1,1,0) }, geometry:{ type:'Polygon', coordinates:[[[-76.5,6.5],[-75.5,7.0],[-75.0,8.0],[-75.5,9.0],[-76.5,9.5],[-77.0,8.0],[-76.5,6.5]]] } },
  { id:'am-amazon-basin-core', name:'Amazon Basin (Always Hot & Wet)', parent:'BR', layers:{ weather:s12(2,2,2,2,2,1,1,1,1,1,2,2), health:rep(3), disaster:s12(1,1,2,2,1,0,0,0,0,0,1,1) }, geometry:{ type:'Polygon', coordinates:[[[-75.0,-5.0],[-72.0,-4.0],[-69.0,-2.5],[-65.0,-2.0],[-62.0,-3.5],[-58.0,-2.0],[-55.0,-2.5],[-53.0,-4.5],[-55.0,-8.0],[-60.0,-10.0],[-65.0,-12.0],[-70.0,-10.0],[-72.5,-9.0],[-74.5,-9.0],[-75.0,-5.0]]] } },
  { id:'am-atacama-desert', name:'Atacama & Peruvian Desert Coast', parent:'PE', layers:{ weather:s12(0,0,0,0,0,0,0,0,0,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[-81.0,-5.5],[-79.5,-6.0],[-76.5,-8.0],[-75.0,-12.0],[-72.0,-16.0],[-70.0,-19.0],[-68.0,-22.0],[-69.5,-24.5],[-71.5,-22.0],[-72.0,-18.0],[-74.0,-14.0],[-77.0,-10.0],[-79.0,-7.0],[-81.0,-5.5]]] } },
  { id:'am-andes-tropical-highlands', name:'Tropical Andes (Cusco / Quito / La Paz)', parent:'PE', layers:{ weather:s12(1,1,1,1,1,0,0,0,0,0,1,1) }, geometry:{ type:'Polygon', coordinates:[[[-78.5,-2.5],[-79.5,-4.0],[-79.5,-5.5],[-78.5,-7.0],[-77.0,-8.5],[-75.5,-10.0],[-73.5,-12.0],[-72.5,-14.5],[-71.5,-16.5],[-70.0,-18.0],[-68.5,-19.5],[-66.5,-21.5],[-65.0,-22.0],[-64.5,-20.5],[-66.0,-17.5],[-67.0,-16.0],[-68.5,-14.5],[-69.5,-12.0],[-71.0,-9.5],[-73.5,-7.0],[-74.5,-5.0],[-76.0,-2.5],[-77.5,-1.5],[-78.5,-1.5],[-78.5,-2.5]]] } },
  { id:'am-patagonia', name:'Patagonia (Dramatic & Windy)', parent:'AR', layers:{ weather:s12(0,0,1,2,2,3,3,3,2,2,1,0) }, geometry:{ type:'Polygon', coordinates:[[[-73.0,-40.0],[-70.5,-40.0],[-68.0,-40.5],[-65.0,-40.5],[-63.0,-41.5],[-63.0,-44.0],[-65.0,-46.0],[-67.0,-47.5],[-68.5,-49.0],[-70.0,-50.5],[-72.0,-51.5],[-73.0,-50.0],[-73.5,-47.0],[-73.0,-44.0],[-73.5,-41.5],[-73.0,-40.0]]] } },
  { id:'am-caribbean-islands', name:'Caribbean Islands', parent:'DO', layers:{ weather:s12(0,0,0,0,0,1,1,1,1,1,0,0), beaches:s12(0,0,0,0,0,1,1,1,1,1,0,0), disaster:s12(0,0,0,0,0,2,3,3,3,2,0,0) }, geometry:{ type:'Polygon', coordinates:[[[-85.0,19.5],[-77.5,20.0],[-75.0,22.0],[-72.0,20.5],[-68.0,18.0],[-62.5,15.5],[-60.0,16.0],[-60.5,17.5],[-63.0,17.5],[-66.5,18.5],[-70.0,19.5],[-73.5,19.5],[-76.5,20.0],[-80.0,22.5],[-85.0,23.0],[-85.0,19.5]]] } },
  // ── Oceania ──
  { id:'oc-queensland-tropical', name:'Tropical Queensland (Wet Season Nov–Apr)', parent:'AU', layers:{ weather:s12(2,2,3,2,0,0,0,0,0,0,1,2), disaster:s12(3,3,2,1,0,0,0,0,0,0,0,2), beaches:s12(2,2,3,2,0,0,0,0,0,0,1,2) }, geometry:{ type:'Polygon', coordinates:[[[138.0,-20.0],[142.0,-18.5],[144.0,-17.5],[146.0,-17.0],[148.0,-17.5],[150.0,-20.0],[149.0,-22.0],[148.0,-24.0],[146.5,-25.0],[145.0,-25.0],[143.0,-24.0],[141.0,-22.0],[138.5,-20.0],[138.0,-20.0]]] } },
  { id:'oc-queensland-se', name:'SE Queensland & Gold Coast', parent:'AU', layers:{ weather:s12(1,1,1,1,0,0,0,0,0,0,1,1), beaches:s12(0,0,1,1,0,0,0,0,0,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[149.5,-24.5],[151.5,-26.0],[153.0,-27.5],[153.5,-29.5],[152.5,-30.0],[151.0,-30.5],[149.5,-30.0],[148.5,-28.0],[149.5,-24.5]]] } },
  { id:'oc-outback-core', name:'Australian Outback (Extreme Heat Oct–Mar)', parent:'AU', layers:{ weather:s12(3,3,2,1,0,0,0,0,0,1,2,3) }, geometry:{ type:'Polygon', coordinates:[[[118.0,-22.0],[126.0,-22.0],[130.0,-22.0],[134.0,-22.0],[138.0,-22.0],[138.0,-28.0],[134.0,-30.0],[130.0,-30.0],[126.0,-28.0],[122.0,-26.0],[118.0,-24.0],[118.0,-22.0]]] } },
  { id:'oc-sw-australia-perth', name:'SW Australia — Perth Mediterranean', parent:'AU', layers:{ weather:s12(0,0,0,0,1,2,2,2,1,0,0,0), beaches:s12(0,0,0,0,1,2,2,2,1,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[113.5,-32.0],[115.0,-32.5],[116.5,-33.5],[116.5,-35.5],[115.0,-35.0],[113.5,-33.5],[113.5,-32.0]]] } },
  { id:'oc-south-island-nz', name:'New Zealand South Island', parent:'NZ', layers:{ weather:s12(1,1,1,2,2,2,2,2,2,1,1,1) }, geometry:{ type:'Polygon', coordinates:[[[166.0,-45.5],[167.5,-46.0],[168.5,-46.5],[169.5,-46.5],[170.5,-44.5],[171.5,-42.5],[172.5,-41.0],[173.5,-42.5],[172.0,-44.0],[170.5,-45.5],[168.5,-46.0],[167.0,-46.5],[166.0,-45.5]]] } },
  { id:'oc-north-island-nz', name:'New Zealand North Island', parent:'NZ', layers:{ weather:s12(1,1,1,1,1,2,2,2,1,0,0,1) }, geometry:{ type:'Polygon', coordinates:[[[172.5,-41.0],[173.0,-40.5],[174.5,-39.5],[175.5,-39.0],[176.5,-38.0],[177.5,-38.5],[178.0,-39.5],[177.5,-41.0],[176.0,-41.5],[175.0,-42.0],[173.5,-41.5],[172.5,-41.0]]] } },
  { id:'oc-polynesia', name:'Polynesia (Fiji / Samoa / Tonga)', parent:'FJ', layers:{ weather:s12(1,2,2,1,0,0,0,0,0,0,0,1), beaches:s12(1,2,2,1,0,0,0,0,0,0,0,1), disaster:s12(2,3,3,2,0,0,0,0,0,0,0,2) }, geometry:{ type:'Polygon', coordinates:[[[172.0,-23.0],[178.0,-23.0],[179.5,-18.0],[178.0,-13.5],[175.0,-10.0],[172.0,-14.0],[172.0,-23.0]]] } },
  { id:'oc-micronesia-typhoon', name:'Micronesia & Guam (Typhoon Belt)', parent:'PW', layers:{ weather:s12(0,0,0,0,1,1,2,2,2,2,1,0), disaster:rep(2) }, geometry:{ type:'Polygon', coordinates:[[[130.0,4.0],[134.0,7.5],[138.0,9.5],[142.0,12.0],[144.0,13.5],[146.0,10.0],[143.0,8.0],[140.0,6.5],[136.0,5.0],[132.0,4.0],[130.0,4.0]]] } },
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

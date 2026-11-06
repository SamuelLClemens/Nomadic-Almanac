'use strict';
const rep = v => Array(12).fill(v);
const s12 = (...a) => a;
const mk = (name, country, lat, lng, data) => ({ name, country, lat, lng, data });
const bc  = (name, from, to, lat, lng, status, hours, note) => ({ name, from, to, lat, lng, status, hours, note });
const bch = (name, country, lat, lng, status, season, water, facilities, dresscode, note) =>
  ({ name, country, lat, lng, status, season, water, facilities, dresscode, note });

// Rating colour ramps (0=best … 3=worst). `classic` is the original green→red.
// `cvd` is a colour-blind-safe, luminance-varied ramp (ColorBrewer RdYlBu, reversed)
// that stays distinguishable under deuteranopia/protanopia and in greyscale.
// Consumers read RC/RC2 by reference; na_setRatingPalette() mutates them in place.
const RC_PALETTES = {
  classic: ['#43A047', '#FDD835', '#EF6C00', '#C62828'],
  cvd:     ['#2C7BB6', '#ABD9E9', '#FDAE61', '#D7191C'],
};
const RC  = RC_PALETTES.classic.slice();
const RC2 = RC;                       // legend swatches share the working palette
const RC_NODATA = '#B0BEC5';

// ─── Static Travel Layer Data ─────────────────────────────────────────────────
// Cost of living index: 0=budget, 1=moderate, 2=expensive, 3=very expensive
// Source: Numbeo Cost of Living Index / Expatistan (2024–2025)
const CD_COST = {
  AR:0, AU:2, BR:1, CA:2, CN:1, CO:0, DE:2, EG:0, ES:2, FR:2,
  GB:3, GR:1, ID:0, IN:0, IT:2, JP:2, KR:2, MA:0, MX:0, NG:0,
  NZ:2, PE:0, PH:0, PK:0, PT:1, RU:1, SG:3, TH:0, TR:0, US:2, VN:0,
  AE:3, ZA:1,
  MY:0, KH:0, LA:0, MM:0, LK:0, NP:0, KE:0, TZ:0, GH:0,
  CL:1, EC:0, CU:1, CZ:1, PL:1, HU:1,
  // East & Southeast Asia
  TW:1, HK:3, MN:0, BN:1, BD:0, BT:1, MV:3, MO:3,
  // Middle East
  SA:2, IL:2, JO:1, LB:1, OM:2, QA:3, KW:3, BH:2, IQ:1, IR:0, YE:0, SY:0,
  // North Africa
  TN:0, DZ:0, LY:0,
  // East Africa
  ET:0, MZ:0, RW:0, UG:0, SO:0, SD:0, ER:0, DJ:0,
  // West Africa
  SL:0, GM:0, BF:0, ML:0, NE:0, TD:0, MR:0,
  // Central & Southern Africa
  CG:0, GA:1, BW:1, NA:1, ZM:0, ZW:0, AO:0, SZ:0, LS:0, MW:0, SS:0,
  // Western Europe (new)
  NL:2, BE:2, AT:2, CH:3, SE:2, NO:3, DK:3, FI:2, IE:2, IS:3,
  // Eastern Europe (new)
  RO:1, BG:1, HR:1, SI:2, SK:1, RS:1, AL:0, ME:1, BA:1, MK:1, XK:0,
  // Microstates
  LU:3, MT:1, SM:2, VA:2, LI:3, MC:3, AD:2, CY:1,
  // Central Asia & Caucasus
  UZ:0, KZ:1, GE:0, AM:0, AZ:0, AF:0, KP:0,
  // South America (new)
  BO:0, PY:0, UY:1, GY:0, SR:0,
  // Pacific Islands
  TL:0, FJ:1, PG:0, VU:1, SB:0, WS:1, TO:1, KI:0, TV:0, NR:1, FM:0, PW:1,
  // Central America & Caribbean (new)
  GT:0, BZ:0, SV:0, HN:0, NI:0, CR:1, PA:1,
  JM:1, HT:0, DO:0, TT:1, BB:2,
};
// National parks & protected areas: 0=Abundant (world-class park network),
// 1=Good, 2=Some, 3=Few. Reflects the prominence/extent of a country's national
// park and nature-reserve system. Source: IUCN / UNEP-WCMC protected-area coverage.
const CD_PARKS = {
  // World-class national-park & protected-area systems
  US:0, CA:0, AU:0, NZ:0, ZA:0, TZ:0, KE:0, CR:0, BR:0, CL:0,
  AR:0, NA:0, BW:0, ZW:0, ZM:0, EC:0, PE:0, BO:0, NP:0, IN:0,
  ID:0, NO:0, IS:0, RU:0, UG:0, RW:0, CD:0, MG:0, CO:0, MZ:0,
  // Strong systems
  GB:1, FR:1, DE:1, ES:1, IT:1, PT:1, GR:1, HR:1, SI:1, AT:1,
  CH:1, SE:1, FI:1, PL:1, RO:1, BG:1, SK:1, ME:1, AL:1, MX:1,
  GT:1, PA:1, NI:1, HN:1, BZ:1, JP:1, KR:1, TW:1, TH:1, VN:1,
  MY:1, PH:1, LK:1, BT:1, MN:1, ET:1, GH:1, CM:1, GA:1, CG:1,
  MW:1, AO:1, UY:1, PY:1, GY:1, SR:1, TR:1, GE:1, AM:1, KZ:1,
  KG:1, IR:1, MA:1, TN:1, EG:1, JO:1, OM:1, SA:1, FJ:1, PG:1,
  CU:1, DO:1, IE:1, CZ:1, HU:1, UA:1, BY:1,
  // Modest / developing systems
  NL:2, BE:2, DK:2, RS:2, BA:2, MK:2, XK:2, AE:2, QA:2, IL:2,
  LB:2, IQ:2, DZ:2, LY:2, SD:2, NG:2, SN:2, ML:2, NE:2, TD:2,
  BD:2, PK:2, AF:2, UZ:2, AZ:2, TM:2, TJ:2, JM:2, TT:2, HT:2,
  SV:2, SG:2, HK:2, YE:2, SY:2, SO:2, ER:2, DJ:2, MR:2, BF:2,
  GM:2, SS:2, SZ:2, LS:2, BJ:2, TG:2, CI:2, GN:2, SL:2, LR:2,
  // Few / minimal
  LU:3, MT:3, SM:3, VA:3, LI:3, MC:3, AD:3, MV:3, BN:3, KP:3,
  CY:3, BH:3, KW:3, BB:3,
};
// Safety index: 0=very safe, 1=generally safe, 2=exercise caution, 3=high risk
// Source: Global Peace Index 2024 / US State Dept advisories
const CD_SAFETY = {
  AR:1, AU:0, BR:2, CA:0, CN:1, CO:2, DE:0, EG:2, ES:0, FR:1,
  GB:0, GR:0, ID:1, IN:1, IT:0, JP:0, KR:0, MA:1, MX:2, NG:3,
  NZ:0, PE:1, PH:1, PK:2, PT:0, RU:2, SG:0, TH:1, TR:1, US:1, VN:1,
  AE:0, ZA:2,
  MY:0, KH:1, LA:0, MM:2, LK:1, NP:1, KE:2, TZ:1, GH:1,
  CL:1, EC:2, CU:1, CZ:0, PL:0, HU:0,
  // East & Southeast Asia
  TW:0, HK:0, MN:1, BN:0, BD:2, BT:0, MV:0, MO:0,
  // Middle East
  SA:1, IL:2, JO:1, LB:2, OM:0, QA:0, KW:0, BH:0, IQ:3, IR:2, YE:3, SY:3,
  // North Africa
  TN:1, DZ:2, LY:3,
  // East Africa
  ET:2, MZ:2, RW:1, UG:2, SO:3, SD:3, ER:3, DJ:2,
  // West Africa
  SL:2, GM:1, BF:3, ML:3, NE:3, TD:3, MR:2,
  // Central & Southern Africa
  CG:2, GA:1, BW:1, NA:1, ZM:1, ZW:2, AO:2, SZ:1, LS:2, MW:1, SS:3,
  // Western Europe (new)
  NL:0, BE:0, AT:0, CH:0, SE:0, NO:0, DK:0, FI:0, IE:0, IS:0,
  // Eastern Europe (new)
  RO:1, BG:1, HR:0, SI:0, SK:0, RS:1, AL:1, ME:1, BA:1, MK:1, XK:1,
  // Microstates
  LU:0, MT:0, SM:0, VA:0, LI:0, MC:0, AD:0, CY:0,
  // Central Asia & Caucasus
  UZ:1, KZ:1, GE:1, AM:1, AZ:2, AF:3, KP:3,
  // South America (new)
  BO:1, PY:2, UY:0, GY:2, SR:1,
  // Pacific Islands
  TL:1, FJ:1, PG:2, VU:1, SB:2, WS:1, TO:1, KI:1, TV:1, NR:1, FM:1, PW:1,
  // Central America & Caribbean (new)
  GT:2, BZ:2, SV:2, HN:2, NI:2, CR:1, PA:1,
  JM:2, HT:3, DO:2, TT:2, BB:1,
};
// Internet quality: 0=excellent, 1=good, 2=fair, 3=poor
// Source: Speedtest Global Index / Ookla 2024
const CD_INTERNET = {
  AR:1, AU:1, BR:1, CA:0, CN:1, CO:1, DE:0, EG:2, ES:1, FR:0,
  GB:0, GR:1, ID:2, IN:1, IT:1, JP:0, KR:0, MA:2, MX:2, NG:2,
  NZ:1, PE:2, PH:2, PK:2, PT:1, RU:1, SG:0, TH:1, TR:1, US:0, VN:1,
  AE:0, ZA:1,
  MY:1, KH:2, LA:2, MM:2, LK:1, NP:2, KE:2, TZ:2, GH:2,
  CL:1, EC:2, CU:3, CZ:0, PL:0, HU:0,
  // East & Southeast Asia
  TW:0, HK:0, MN:2, BN:1, BD:2, BT:2, MV:1, MO:0,
  // Middle East
  SA:1, IL:0, JO:1, LB:2, OM:1, QA:0, KW:0, BH:0, IQ:2, IR:1, YE:3, SY:3,
  // North Africa
  TN:1, DZ:2, LY:3,
  // East Africa
  ET:2, MZ:3, RW:2, UG:2, SO:3, SD:3, ER:3, DJ:2,
  // West Africa
  SL:3, GM:2, BF:3, ML:3, NE:3, TD:3, MR:3,
  // Central & Southern Africa
  CG:3, GA:2, BW:2, NA:2, ZM:2, ZW:2, AO:2, SZ:2, LS:2, MW:3, SS:3,
  // Western Europe (new)
  NL:0, BE:0, AT:0, CH:0, SE:0, NO:0, DK:0, FI:0, IE:0, IS:1,
  // Eastern Europe (new)
  RO:0, BG:0, HR:1, SI:0, SK:0, RS:1, AL:1, ME:1, BA:1, MK:1, XK:2,
  // Microstates
  LU:0, MT:1, SM:1, VA:1, LI:0, MC:0, AD:1, CY:1,
  // Central Asia & Caucasus
  UZ:2, KZ:1, GE:1, AM:1, AZ:1, AF:3, KP:3,
  // South America (new)
  BO:2, PY:2, UY:1, GY:2, SR:2,
  // Pacific Islands
  TL:2, FJ:2, PG:3, VU:2, SB:3, WS:2, TO:2, KI:3, TV:3, NR:2, FM:3, PW:2,
  // Central America & Caribbean (new)
  GT:2, BZ:2, SV:2, HN:2, NI:2, CR:1, PA:1,
  JM:2, HT:3, DO:2, TT:1, BB:1,
};
// Layer display metadata: rating labels for each layer type
const LAYER_LABELS = {
  weather:  ['Excellent','Acceptable','Challenging','Harsh'],
  cost:     ['Budget','Moderate','Expensive','Very Expensive'],
  safety:   ['Very Safe','Safe','Use Caution','High Risk'],
  internet: ['Excellent','Good','Fair','Poor'],
  visa:     ['Visa-free','Easy Access','Visa Required','Restricted'],
  strength: ['Open & Sunny','Visa-Free','Accessible','Restricted'],
  kids:     ['Excellent','Good','Fair','Limited'],
  parks:    ['Abundant','Good Coverage','Some','Few'],
  cannabis: ['Legal','Medical/Decrim','Minor Penalties','Severe/Zero Tolerance'],
  tipping:  ['No Tipping Culture','Tip Optional','Tip Appreciated','Tipping Expected'],
  nomad:    ['Excellent Base','Good Option','Fair','Not Recommended'],
  english:      ['Very High Proficiency','High Proficiency','Moderate Proficiency','Low Proficiency'],
  healthcare:   ['Excellent Healthcare','Good Healthcare','Fair Healthcare','Poor Healthcare'],
  tapwater:     ['Safe to Drink','Mostly Safe','Use Bottled Water','Severely Unsafe'],
  airquality:   ['Good Air Quality','Moderate AQ','Unhealthy AQ','Very Unhealthy AQ'],
  femalesafety: ['Very Safe for Solo Women','Safe for Solo Women','Caution Advised','High Caution'],
  nightlife:    ['World-class Nightlife','Good Scene','Moderate Scene','Restricted'],
  scam:         ['Minimal Scam Risk','Low Risk','Moderate Risk','High Scam Risk'],
  malaria:      ['No Malaria Risk','Low Risk Area','Moderate Risk','High Risk Zone'],
};
// ISO 4217 currency codes per country
const CURRENCY = {
  AE:'AED', AR:'ARS', AU:'AUD', BR:'BRL', CA:'CAD', CN:'CNY', CO:'COP',
  DE:'EUR', EG:'EGP', ES:'EUR', FR:'EUR', GB:'GBP',
  GR:'EUR', ID:'IDR', IN:'INR', IT:'EUR', JP:'JPY', KR:'KRW',
  MA:'MAD', MX:'MXN', NG:'NGN', NZ:'NZD', PE:'PEN', PH:'PHP',
  PK:'PKR', PT:'EUR', RU:'RUB', SG:'SGD', TH:'THB', TR:'TRY',
  US:'USD', VN:'VND', ZA:'ZAR',
  MY:'MYR', KH:'KHR', LA:'LAK', MM:'MMK', LK:'LKR', NP:'NPR',
  KE:'KES', TZ:'TZS', GH:'GHS', CL:'CLP', EC:'USD', CU:'CUP',
  CZ:'CZK', PL:'PLN', HU:'HUF',
};
// Pre-computed best travel month per country (0-indexed January=0)
// Scoring: month with the lowest weather rating across available data
// Ties broken by earliest month in the year
const BEST_MONTH_LABEL = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const BEST_TRAVEL_MONTH = {
  AR:2, AU:9, CA:8, CN:3, CO:11, DE:5, EG:9, ES:4, FR:5, GB:6,
  GR:5, ID:6, IN:9, IT:4, JP:3, MA:3, MX:9, NG:10, NZ:2, PE:5,
  PK:9, PT:4, RU:5, TH:10, TR:4, US:8, VN:0, ZA:3,
  AE:10, BR:6, KR:3, PH:1, SG:1,
  MY:5, KH:10, LA:10, MM:10, LK:0, NP:9, KE:6, TZ:6, GH:10,
  CL:11, EC:5, CU:1, CZ:4, PL:4, HU:4,
};
// Best range (2-month window centred on best month)
const BEST_TRAVEL_RANGE = {
  AR:'Feb-Apr', AU:'Sep-Nov', CA:'Aug-Oct', CN:'Mar-May',
  CO:'Oct-Jan', DE:'May-Jul', EG:'Sep-Nov', ES:'Apr-Jun',
  FR:'May-Jul', GB:'Jun-Aug', GR:'May-Jul', ID:'Jun-Sep',
  IN:'Sep-Nov', IT:'Apr-Jun', JP:'Mar-May', MA:'Mar-May',
  MX:'Sep-Nov', NG:'Oct-Dec', NZ:'Feb-Apr', PE:'Apr-Jun',
  PK:'Sep-Nov', PT:'Apr-Jun', RU:'May-Jul', TH:'Oct-Dec',
  TR:'Apr-Jun', US:'Aug-Oct', VN:'Dec-Feb', ZA:'Mar-May',
  AE:'Oct-Dec', BR:'Jun-Aug', KR:'Mar-May', PH:'Feb-Apr', SG:'Feb-Mar',
  MY:'May-Jul', KH:'Oct-Dec', LA:'Oct-Dec', MM:'Oct-Dec', LK:'Dec-Feb',
  NP:'Sep-Nov', KE:'Jun-Sep', TZ:'Jun-Sep', GH:'Oct-Dec', CL:'Nov-Feb',
  EC:'May-Jul', CU:'Feb-Apr', CZ:'Apr-Jun', PL:'Apr-Jun', HU:'Apr-Jun',
};
// Primary timezone(s) per country: first entry is the main zone, rest are regional
const COUNTRY_TIMEZONES = {
  AR:['UTC−3 (ART)'],
  AU:['UTC+8–11 (multiple)','AEST UTC+10 · Sydney, Melbourne','AWST UTC+8 · Perth','ACST UTC+9:30 · Adelaide'],
  CA:['UTC−3:30 to −8 (multiple)','EST UTC−5 · Toronto','CST UTC−6 · Winnipeg','MST UTC−7 · Calgary','PST UTC−8 · Vancouver'],
  CN:['UTC+8 (CST: single national zone)'],
  CO:['UTC−5 (COT)'],
  DE:['UTC+1 / UTC+2 DST (CET/CEST)'],
  EG:['UTC+2 (EET)'],
  ES:['UTC+1 / UTC+2 DST (CET/CEST)'],
  FR:['UTC+1 / UTC+2 DST (CET/CEST)'],
  GB:['UTC+0 / UTC+1 BST (GMT/BST)'],
  GR:['UTC+2 / UTC+3 DST (EET/EEST)'],
  ID:['UTC+7–9 (multiple)','WIB UTC+7 · Jakarta, Bali','WITA UTC+8 · Lombok','WIT UTC+9 · Papua'],
  IN:['UTC+5:30 (IST: single national zone)'],
  IT:['UTC+1 / UTC+2 DST (CET/CEST)'],
  JP:['UTC+9 (JST: single national zone)'],
  MA:['UTC+1 (WET)'],
  MX:['UTC−6 to −8 (multiple)','CST UTC−6 · Mexico City','MST UTC−7 · Chihuahua','PST UTC−8 · Tijuana'],
  NG:['UTC+1 (WAT)'],
  NZ:['UTC+12 / UTC+13 DST (NZST/NZDT)'],
  PE:['UTC−5 (PET)'],
  PK:['UTC+5 (PKT)'],
  PT:['UTC+0 / UTC+1 BST (WET/WEST)'],
  RU:['UTC+2–12 (11 zones)','MSK UTC+3 · Moscow','YEKT UTC+5 · Yekaterinburg','IRKT UTC+8 · Irkutsk','VLAT UTC+10 · Vladivostok'],
  TH:['UTC+7 (ICT)'],
  TR:['UTC+3 (TRT: no DST since 2016)'],
  US:['UTC−5 to −10 (6 zones)','EST UTC−5 · New York, Miami','CST UTC−6 · Chicago, Dallas','MST UTC−7 · Denver, Phoenix','PST UTC−8 · LA, Seattle','HST UTC−10 · Hawaii'],
  VN:['UTC+7 (ICT: single national zone)'],
  ZA:['UTC+2 (SAST: no DST)'],
  MY:['UTC+8 (MYT)'],
  KH:['UTC+7 (ICT)'],
  LA:['UTC+7 (ICT)'],
  MM:['UTC+6:30 (MMT)'],
  LK:['UTC+5:30 (SLST)'],
  NP:['UTC+5:45 (NPT)'],
  KE:['UTC+3 (EAT)'],
  TZ:['UTC+3 (EAT)'],
  GH:['UTC+0 (GMT)'],
  CL:['UTC-3/-4 (CLT/CLST)'],
  EC:['UTC-5 (ECT)'],
  CU:['UTC-5/-4 (CST/CDT)'],
  CZ:['UTC+1/+2 DST (CET)'],
  PL:['UTC+1/+2 DST (CET)'],
  HU:['UTC+1/+2 DST (CET)'],
  // New countries
  AE:['UTC+4 (GST: no DST)'],
  BR:['UTC−2 to −5 (multiple)','BRT UTC−3 · São Paulo, Rio de Janeiro','AMT UTC−4 · Manaus','ACT UTC−5 · Acre'],
  KR:['UTC+9 (KST: single national zone, no DST)'],
  PH:['UTC+8 (PST: single national zone)'],
  SG:['UTC+8 (SGT: single national zone, no DST)'],
};

const SEASONAL_EVENTS = [
  { id:'songkran', country:'TH', month:3, name:'Songkran', emoji:'💦', desc:'Thai New Year water festival. Street parties, water fights nationwide. Book 3 months ahead.' },
  { id:'golden-week-jp', country:'JP', month:4, name:'Golden Week', emoji:'🎏', desc:'Japan national holiday week. Very crowded and expensive. Avoid if possible or book 6 months ahead.' },
  { id:'carnival-br', country:'BR', month:1, name:'Carnival', emoji:'🎭', desc:'World-famous Rio Carnival. Samba, parades, street parties. Hotels book out a year ahead.' },
  { id:'diwali', country:'IN', month:9, name:'Diwali', emoji:'🪔', desc:'Festival of Lights. October/November. Spectacular fireworks, sweets, family celebrations.' },
  { id:'oktoberfest', country:'DE', month:8, name:'Oktoberfest', emoji:'🍺', desc:'Munich beer festival. Late Sept–early Oct. Book accommodation months ahead.' },
  { id:'cherry-blossom', country:'JP', month:2, name:'Cherry Blossom', emoji:'🌸', desc:'Sakura season March–April. Peak varies by region. Extremely popular: book early.' },
  { id:'lunar-new-year-cn', country:'CN', month:0, name:'Chinese New Year', emoji:'🧧', desc:'January/February. Domestic travel peaks. Many businesses close 1-2 weeks.' },
  { id:'ramadan', country:'MA', month:2, name:'Ramadan', emoji:'🌙', desc:'Timing varies by lunar calendar. Daytime restaurant closures; vibrant night markets.' },
  { id:'hajj-sa', country:'AE', month:5, name:'Peak Travel Season', emoji:'☀️', desc:'Nov–Mar ideal in UAE. Summer (Jun-Sep) extremely hot (45°C+). Avoid unless prepared.' },
  { id:'monsoon-in', country:'IN', month:5, name:'Monsoon Season', emoji:'🌧', desc:'Jun-Sep heavy rainfall across subcontinent. Kerala and Goa flood. Northern plains extremely hot.' },
  { id:'dry-season-th', country:'TH', month:10, name:'Best Season', emoji:'🌴', desc:'Nov–Apr dry season. Bangkok, Chiang Mai, islands all ideal. Peak Dec-Jan.' },
  { id:'wet-season-id', country:'ID', month:10, name:'Dry Season Bali', emoji:'🏝', desc:'May–Sep dry season. Best for beaches and diving. Avoid Dec-Mar for Bali.' },
  { id:'northern-lights', country:'NO', month:11, name:'Northern Lights', emoji:'🌌', desc:'Oct–Mar in Arctic Norway. Best visibility Dec-Feb above the Arctic Circle.' },
  { id:'midnight-sun', country:'NO', month:5, name:'Midnight Sun', emoji:'☀️', desc:'June-July in northern Norway. 24-hour daylight above Arctic Circle.' },
  { id:'inca-trail', country:'PE', month:5, name:'Inca Trail Season', emoji:'🏔', desc:'May–Sep dry season. Best trekking weather. Permit quota: book 6 months ahead.' },
  { id:'safari-ke', country:'KE', month:6, name:'Great Migration', emoji:'🦁', desc:'Jul-Oct: wildebeest migration in Masai Mara. Peak game viewing season.' },
  { id:'cherry-kr', country:'KR', month:3, name:'Cherry Blossom', emoji:'🌸', desc:'Late March to mid-April. Jeju Island, Gyeongbokgung Palace. Extremely popular.' },
  { id:'rainy-vn', country:'VN', month:9, name:'North Vietnam Autumn', emoji:'🍂', desc:'Oct–Dec: best weather in Hanoi and Ha Long Bay. South best Nov-Apr.' },
  { id:'august-eu', country:'FR', month:7, name:'Summer Peak', emoji:'☀️', desc:'July-August: peak tourist season. Beaches packed. Paris quieter as locals leave.' },
  { id:'holi', country:'IN', month:2, name:'Holi', emoji:'🎨', desc:'Festival of Colors. March. Vibrant celebration across North India. Be prepared to get colorful.' },

  // East & Southeast Asia
  { id:'tet-vn',        country:'VN', month:0,  name:'Tết New Year',      emoji:'🧧', desc:'Vietnamese Lunar New Year. Jan/Feb. Cities empty as everyone returns home: domestic travel near impossible. Book early or avoid travel dates.' },
  { id:'lantern-tw',    country:'TW', month:1,  name:'Lantern Festival',  emoji:'🏮', desc:'15th day of Lunar New Year. Massive sky lantern release in Pingxi. Crowds are intense but magical.' },
  { id:'naadam-mn',     country:'MN', month:6,  name:'Naadam Festival',   emoji:'🏹', desc:'July 11-13. National festival of three games: wrestling, horse racing, archery. Best way to experience Mongolian culture. Book Ulaanbaatar hotels months ahead.' },
  { id:'bun-pi-mai-la', country:'LA', month:3,  name:'Bun Pi Mai',        emoji:'💦', desc:'Lao New Year water festival (April 13-15). Luang Prabang is spectacular: water fights, processions, sand stupas.' },
  { id:'whale-shark-ph',country:'PH', month:2,  name:'Whale Shark Season',emoji:'🦈', desc:'Feb–May best chance to swim with whale sharks in Oslob, Cebu and Donsol. Dry season also best for islands.' },
  { id:'dry-my',        country:'MY', month:2,  name:'East Coast Dry Season',emoji:'🌴', desc:'Feb–Aug dry on Perhentian, Redang, Tioman islands. West coast (Langkawi) best Dec–Apr. East coast monsoon Nov–Jan: islands close.' },
  { id:'water-festival-mm', country:'MM', month:3, name:'Thingyan Water Festival', emoji:'💦', desc:'Myanmar New Year water festival (Apr 13-16). Nationwide street celebrations. Travel heavily disrupted.' },
  { id:'monsoon-lk',    country:'LK', month:4,  name:'SW Monsoon',        emoji:'🌧', desc:'May–Sep: heavy rain on west and south coasts (Galle, Colombo). East coast (Trincomalee, Arugam Bay) is dry and perfect Jun–Sep.' },

  // South Asia
  { id:'trekking-np',   country:'NP', month:9,  name:'Trekking Season',   emoji:'🏔', desc:'Oct–Nov: clear skies, golden light, crisp air. Best for Everest Base Camp and Annapurna. Spring (Mar–May) is second season. Monsoon (Jun–Sep) makes trails muddy and leechy.' },
  { id:'whale-lk',      country:'LK', month:1,  name:'Blue Whale Season', emoji:'🐋', desc:'Jan–Apr off Mirissa: highest concentration of blue whales on Earth. Best Feb–Mar. Morning boat trips required.' },

  // Middle East & Central Asia
  { id:'ramadan-sa',    country:'SA', month:2,  name:'Ramadan',           emoji:'🌙', desc:'Dates shift annually with lunar calendar. Daytime food and drink prohibited in public. Night markets vibrant. Dramatic change to daily rhythms.' },
  { id:'silk-road-uz',  country:'UZ', month:3,  name:'Spring Blossom',    emoji:'🌸', desc:'Apr–May: Silk Road cities (Samarkand, Bukhara) at peak beauty. Fruit trees in bloom, pleasant 20–25°C. Summer exceeds 40°C.' },
  { id:'tulip-tr',      country:'TR', month:3,  name:'Tulip Festival',    emoji:'🌷', desc:'April in Istanbul: millions of tulips in bloom across parks and squares. Tulips originated in Ottoman Turkey: spectacular and free.' },
  { id:'nevruz-uz',     country:'UZ', month:2,  name:'Navruz / New Year', emoji:'🎊', desc:'March 21. Central Asian New Year. Sumalak (wheat porridge), music, dancing across every city. Best cultural immersion.' },

  // Africa
  { id:'migration-tz',  country:'TZ', month:11, name:'Serengeti Migration',emoji:'🦓', desc:'Dec–Mar: calving season in southern Serengeti. Predators follow: best wildlife drama. Jul–Sep: river crossings at Mara River.' },
  { id:'whale-za',      country:'ZA', month:6,  name:'Whale Season',      emoji:'🐳', desc:'Jun–Nov: southern right whales in Hermanus (Walker Bay). World-class land-based whale watching. Peak Aug–Sep.' },
  { id:'gorilla-rw',    country:'RW', month:5,  name:'Gorilla Trekking',  emoji:'🦍', desc:'Jun–Sep and Dec–Feb dry seasons are best for gorilla permits in Volcanoes NP. Permits ($1,500 per person) must be booked months ahead.' },
  { id:'atlas-ma',      country:'MA', month:9,  name:'Atlas Trekking',    emoji:'⛰', desc:'Sep–Nov best for trekking High Atlas. Marrakech and desert tours ideal Oct–Apr. Summer desert exceeds 45°C.' },
  { id:'harmattan-gh',  country:'GH', month:11, name:'Harmattan Season',  emoji:'💨', desc:'Nov–Mar: dry dusty Harmattan wind from the Sahara. Visibility poor, skin dries. Peak dry season otherwise good for travel.' },

  // Europe
  { id:'northern-lights-is', country:'IS', month:9, name:'Northern Lights',emoji:'🌌', desc:'Sep–Mar: Aurora Borealis visible. Best away from Reykjavik. App alerts (Vedur) recommended. Clear skies required.' },
  { id:'midnight-sun-is', country:'IS', month:5, name:'Midnight Sun',     emoji:'☀️', desc:'May–Jul: nearly 24-hour daylight. Puffins arrive May–Aug. Ideal for hiking, waterfalls, and road trips.' },
  { id:'northern-lights-fi', country:'FI', month:1, name:'Northern Lights',emoji:'🌌', desc:'Feb–Mar prime Aurora season in Lapland. Santa Claus Village, reindeer safaris, ice fishing. Dec–Jan coldest but festive.' },
  { id:'midsommar-se',  country:'SE', month:5,  name:'Midsommar',         emoji:'🌻', desc:'Late June: biggest Swedish celebration. Maypoles, herring, schnapps, dancing. Swedes travel en masse: ferries to islands packed.' },
  { id:'white-nights-ru', country:'RU', month:5, name:'White Nights',     emoji:'🌕', desc:'Jun–Jul: St Petersburg never gets fully dark. Mariinsky Ballet, canal cruises, rooftop parties. Most magical time to visit.' },
  { id:'venice-carnival', country:'IT', month:1, name:'Venice Carnival',  emoji:'🎭', desc:'Feb: elaborate masks, costumes, and balls. Extremely crowded. Prices triple. Book 6 months ahead for best masked balls.' },
  { id:'bull-run-es',   country:'ES', month:6,  name:'San Fermín / Bull Run', emoji:'🐂', desc:'July 6-14 in Pamplona. Running of the Bulls draws global crowds. Rioja wine region also excellent Sep–Oct harvest.' },
  { id:'harvest-pt',    country:'PT', month:8,  name:'Wine Harvest',      emoji:'🍇', desc:'Sep–Oct: Douro Valley grape harvest. Quinta estate visits, treading grapes, port wine tastings. Best season overall.' },
  { id:'xmas-cz',       country:'CZ', month:11, name:'Christmas Markets', emoji:'🎄', desc:'Nov–Dec: Prague\'s Old Town Square and Wenceslas Square transform. Trdelník, mulled wine, hand-crafted gifts. Europe\'s most atmospheric.' },
  { id:'xmas-pl',       country:'PL', month:11, name:'Christmas Markets', emoji:'🎄', desc:'Dec: Kraków and Warsaw markets. Pierogi, gingerbread, hand-painted ornaments. Cold but beautiful under snow.' },
  { id:'glastonbury-gb',country:'GB', month:5,  name:'Glastonbury',       emoji:'🎸', desc:'Late June: world\'s largest greenfield music festival. Somerset, UK. Tickets sell out in minutes: set an alert.' },
  { id:'oktoberfest-at',country:'AT', month:11, name:'Ski Season Opens',  emoji:'⛷', desc:'Dec–Apr: Austrian Alps (Innsbruck, Kitzbühel, St Anton) world-class skiing. Christmas markets in Vienna Dec.' },

  // Americas
  { id:'day-of-dead-mx',country:'MX', month:9,  name:'Día de los Muertos',emoji:'💀', desc:'Nov 1-2: stunning cemetery vigils especially in Oaxaca and Pátzcuaro. UNESCO Intangible Cultural Heritage. Book accommodation months ahead.' },
  { id:'monarch-mx',    country:'MX', month:10, name:'Monarch Butterflies',emoji:'🦋', desc:'Nov–Mar: 100 million monarch butterflies overwinter in Michoacán. Biosphere Reserve, 2 hours from Mexico City. Surreal experience.' },
  { id:'fall-foliage-us', country:'US', month:8, name:'Fall Foliage',     emoji:'🍂', desc:'Sep–Oct: New England, Appalachians, Rocky Mountains turn gold and red. Peak varies by latitude: check foliage reports.' },
  { id:'maple-ca',      country:'CA', month:2,  name:'Maple Syrup Season',emoji:'🍁', desc:'Mar–Apr in Quebec and Ontario. Sugar shacks open for tastings. Cross-country skiing still good. Best shoulder season.' },
  { id:'northern-lights-ca', country:'CA', month:1, name:'Northern Lights', emoji:'🌌', desc:'Feb–Mar in Yukon and Northwest Territories. Whitehorse best base. Clear cold nights essential.' },
  { id:'carnival-co',   country:'CO', month:1,  name:'Carnaval de Barranquilla', emoji:'🎭', desc:'Feb: second largest carnival in the world after Rio. Costumes, cumbia, vallenato. Less crowded and cheaper than Rio.' },
  { id:'flower-co',     country:'CO', month:7,  name:'Flower Festival',   emoji:'🌺', desc:'Early August in Medellín. Silleteros parade with elaborate flower arrangements. City transformed. Spectacular photography.' },
  { id:'inti-raymi-pe', country:'PE', month:5,  name:'Inti Raymi',        emoji:'🌞', desc:'June 24 in Cusco: Inca festival of the sun. Massive ceremony at Sacsayhuamán. Timed to winter solstice: Inca New Year.' },
  { id:'carnival-oruro-bo', country:'BO', month:1, name:'Carnaval de Oruro', emoji:'🎭', desc:'Feb/Mar: UNESCO Intangible Heritage. Elaborate devil dances (diablada), 18,000 dancers, 10,000+ musicians. 3,700m altitude.' },
  { id:'patagonia-cl',  country:'CL', month:11, name:'Patagonia Season',  emoji:'🏔', desc:'Nov–Mar: Torres del Paine open season. Winds strong Nov–Dec; Jan–Feb best balance of weather and daylight.' },
  { id:'galapagos-ec',  country:'EC', month:5,  name:'Dry Season',        emoji:'🐢', desc:'Jun–Nov: cooler, clearer water. Penguin and sea lion breeding. Dec–May warmer water, lush vegetation, baby sea turtles hatching.' },
  { id:'reef-au',       country:'AU', month:5,  name:'Great Barrier Reef Season', emoji:'🐠', desc:'Jun–Oct: best visibility, no jellyfish, cooler temps (22–26°C). Cyclone risk Nov–Apr on north Queensland coast.' },
  { id:'outback-au',    country:'AU', month:4,  name:'Outback Season',    emoji:'🦘', desc:'Apr–Sep: Uluru, Alice Springs, Kakadu best in dry season. Summer (Dec–Feb) can reach 50°C in outback. Wildflower season Aug–Sep WA.' },
  { id:'turtle-cr',     country:'CR', month:6,  name:'Turtle Nesting',    emoji:'🐢', desc:'Jul–Oct: leatherback and green turtles nest on Caribbean and Pacific beaches. Tortuguero (Caribbean) most accessible.' },
  { id:'reggae-jm',     country:'JM', month:7,  name:'Reggae Sumfest',    emoji:'🎵', desc:'July in Montego Bay. Jamaica\'s biggest music festival. International and local reggae, dancehall, soca.' },

  // Oceania / Pacific
  { id:'humpback-tonga', country:'TO', month:6, name:'Whale Season',      emoji:'🐳', desc:'Jul–Oct: humpback whales come to warm Tonga waters to breed. Swim with whales (legal only in Tonga). Book permits months ahead.' },
];


// ── Kids-friendly rating per country (0=excellent, 1=good, 2=fair, 3=poor) ──
// Factors: playgrounds, family attractions, child healthcare, safety for families
const CD_KIDS = {
  AR:1, AU:0, CA:0, CN:1, CO:2, DE:0, EG:2, ES:0, FR:0,
  GB:0, GR:1, ID:1, IN:2, IT:0, JP:0, MA:2, MX:2, NG:3,
  NZ:0, PE:2, PK:3, PT:0, RU:1, TH:1, TR:1, US:0, VN:1, ZA:2,
  AE:0, BR:1, KR:0, PH:1, SG:0,
  MY:1, KH:2, LA:2, MM:3, LK:1, NP:2, KE:2, TZ:2, GH:2,
  CL:1, EC:2, CU:1, CZ:0, PL:0, HU:0,
  // East & Southeast Asia
  TW:0, HK:0, MN:2, BN:1, BD:2, BT:1, MV:1, MO:0,
  // Middle East
  SA:1, IL:0, JO:1, LB:2, OM:1, QA:0, KW:0, BH:0, IQ:3, IR:2, YE:3, SY:3,
  // North Africa
  TN:1, DZ:2, LY:3,
  // East Africa
  ET:2, MZ:3, RW:2, UG:2, SO:3, SD:3, ER:3, DJ:2,
  // West Africa
  SL:3, GM:2, BF:3, ML:3, NE:3, TD:3, MR:3,
  // Central & Southern Africa
  CG:3, GA:2, BW:2, NA:2, ZM:2, ZW:2, AO:2, SZ:2, LS:2, MW:3, SS:3,
  // Western Europe (new)
  NL:0, BE:0, AT:0, CH:0, SE:0, NO:0, DK:0, FI:0, IE:0, IS:0,
  // Eastern Europe (new)
  RO:1, BG:1, HR:1, SI:0, SK:0, RS:1, AL:2, ME:1, BA:1, MK:1, XK:2,
  // Microstates
  LU:0, MT:0, SM:0, VA:1, LI:0, MC:0, AD:0, CY:0,
  // Central Asia & Caucasus
  UZ:1, KZ:1, GE:1, AM:1, AZ:1, AF:3, KP:3,
  // South America (new)
  BO:2, PY:2, UY:0, GY:2, SR:2,
  // Pacific Islands
  TL:2, FJ:1, PG:2, VU:2, SB:2, WS:1, TO:1, KI:2, TV:2, NR:1, FM:2, PW:1,
  // Central America & Caribbean (new)
  GT:2, BZ:1, SV:2, HN:2, NI:2, CR:1, PA:1,
  JM:2, HT:3, DO:2, TT:1, BB:1,
};

// Cannabis legality: 0=Legal recreational, 1=Medical/Decrim, 2=Minor Penalties, 3=Severe/Zero Tolerance
// Sources: EMCDDA, HRI Global Drug Policy Index 2024, IDPC, individual country legislation (verified 2026-06)
// Traveller perspective: severity reflects the realistic risk to a foreign visitor.
const CD_CANNABIS = {
  // 0 = Legal recreational adult use (licensed retail or equivalent)
  CA:0,   // Fully legal nationwide since 2018
  DE:0,   // Cannabis Act April 2024: adults may possess ≤25g, grow 3 plants, join social clubs
  MT:0,   // Cannabis Authority of Malta: personal cultivation + possession legal since 2021
  UY:0,   // First country to fully legalize; pharmacies sell registered product

  // 1 = Medical legal and/or personal possession formally decriminalized
  US:1,   // Federal schedule 1, but 24 states fully legalized; possession ≤30g decrim in ~33 states
  AU:1,   // ACT full legalization; other states decrim + medical; federal medical scheme
  NZ:1,   // Medical prescription legal; 2020 referendum failed but enforcement minimal
  IL:1,   // Medical widely legal; personal possession effectively decriminalized (2023 reform)
  PT:1,   // All drugs decriminalized since 2001; no criminal penalty for personal amounts
  CZ:1,   // Possession ≤10g = civil offence (fine); medical legal since 2013
  ES:1,   // Legal in private spaces and licensed cannabis clubs; public possession is fine only
  NL:1,   // Coffeeshops tolerated under gedoogbeleid; possession ≤5g = no prosecution
  IT:1,   // Medical legal; minor possession is administrative offence; CBD widely sold
  CH:1,   // Possession ≤10g = no criminal charge; 2024 pilot programs for recreational retail
  BE:1,   // Decriminalized (≤3g / 1 plant) since 2022; medical scheme active
  LU:1,   // Personal cultivation (4 plants) legal since 2023; possession ≤3g decrim
  AR:1,   // Supreme Court ruling 2009 decriminalised personal use; medical decree 2017
  BR:1,   // STF ruling effectively decriminalizes personal possession; medical ANVISA
  ZA:1,   // Constitutional Court 2018: private use, possession, cultivation decriminalised
  CO:1,   // Personal dose (≤20g) legal; medical decree; major exporter
  CL:1,   // Medical legal; possession up to 10g for personal use decriminalized (2015)
  MX:1,   // Supreme Court decriminalized personal use; medical regulations active
  JM:1,   // Decriminalized ≤2oz (2015); Rastafari sacramental exemption; medical
  BB:1,   // Decriminalized personal amounts (2019); medical scheme
  CR:1,   // Medical legal; personal possession rarely prosecuted
  EC:1,   // Constitutional Court: personal possession decriminalized 2019
  PE:1,   // Medical legal; personal possession (≤8g) decriminalized
  GR:1,   // Medical legal (2017); personal possession fine only, no arrest
  CY:1,   // Medical cannabis legal; personal possession = administrative offence
  GE:1,   // Constitutional Court 2018 ruled consumption punishment unconstitutional; production/sale still criminal

  // 2 = Minor penalties: technically illegal; small amounts typically result in fine/caution
  GB:2, FR:2, IE:2, AT:2, SE:2, FI:2, NO:2, DK:2, SI:2, SK:2, RO:2, BG:2,
  HR:2, BA:2, RS:2, MK:2, AL:2, ME:2, IN:2, NP:2, LK:2,
  KE:2, GH:2, MZ:2, RW:2, UG:2, ET:2, MN:2,
  HU:2, PL:2, EE:2, LV:2, LT:2, BY:2, UA:2, MD:2, GY:2, SR:2, BO:2, PY:2,
  PA:2, DO:2, TT:2, CU:2, HT:2, GT:2, BZ:2, SV:2, HN:2, NI:2,
  MA:2, SD:2, UZ:2, KZ:2, AM:2, AZ:2, TZ:2,

  // 3 = Severe penalties: significant prison time, caning, or death penalty for trafficking
  SG:3,   // Death penalty for >500g; mandatory prison for any possession
  MY:3,   // Death for trafficking; long prison for possession
  ID:3,   // 4-12 years for possession; death for trafficking
  PH:3,   // 12 years minimum for possession; "drug war" enforcement
  JP:3,   // 5 years for possession; zero tolerance culture
  KR:3,   // 5 years for possession; enforced even for foreign use abroad
  CN:3,   // Criminal detention to 15 years; very strict enforcement
  HK:3,   // Up to life imprisonment for trafficking; 7 years for possession
  RU:3,   // 3-10 years for possession; severe for any amount
  MM:3,   // 5-15 years mandatory prison for possession
  BN:3,   // Death penalty possible for trafficking; strict Islamic law enforcement
  TH:3,   // Re-criminalized recreational use late 2024 (Cannabis Act reversal); severe possession penalties restored
  VN:3,   // Death penalty for trafficking ≥600g; 2-7 years possession
  KH:3,   // Crackdown intensified 2020+; 1-10 years possession; death for trafficking
  LA:3,   // 1-5 years for possession; death for trafficking
  NG:3,   // NDLEA enforcement harsh; 5-25 years for minor possession
  TN:3,   // Law 52: mandatory 1 year minimum for first offence; widespread arrests of tourists
  AE:3,   // 4+ years minimum; trace amounts on clothing prosecuted; no tolerance
  QA:3,   // Criminal charges; deportation for foreigners; zero tolerance
  SA:3,   // Flogging, prison, deportation; death for large amounts
  KW:3,   // Criminal sentence; foreigners deported; zero tolerance
  BH:3,   // Criminal sentence; foreigners face deportation
  OM:3,   // Mandatory prison; foreigners deported
  IR:3,   // Death penalty enforced for trafficking; prison for possession
  IQ:3,   // Up to life imprisonment; irregular enforcement
  SY:3,   // Severe; conflict conditions make unpredictable
  YE:3,   // Severe; war conditions make enforcement unpredictable
  LB:3,   // 3 months to 3 years; reform law passed 2020 but rarely applied
  PK:3,   // Up to 2 years possession; death for large trafficking
  BD:3,   // Mandatory 2 years to life; zero tolerance
  TR:3,   // 2-5 years possession; 10-20 years trafficking; tourists regularly prosecuted
  JO:3,   // Mandatory 1 year minimum; no suspended sentences; tourists arrested
  DZ:3,   // 2 months to 10 years mandatory; strict enforcement
  EG:3,   // Mandatory prison even for small amounts; tourists regularly arrested
  AF:3,   // Ironically, Taliban crackdown on poppy but cannabis laws unpredictable
  KP:3,   // Extremely severe; any foreign activity criminalized
  LY:3, SO:3, SS:3, TD:3, NE:3, ML:3, BF:3, ER:3, MR:3,
  MV:3,   // Maldives: very strict; foreigners arrested and deported
  MO:3,   // Macau: criminal charges; casinos conduct surveillance
  BT:2,   // Bhutan: technically illegal but possession rarely prosecuted
};

const CD_TIPPING = {
  JP:0,KR:0,CN:0,TW:0,HK:0,SG:0,BN:0,
  GB:1,DE:1,FR:1,IT:1,ES:1,PT:1,NL:1,BE:1,CH:1,AT:1,
  SE:1,NO:1,DK:1,FI:1,IS:1,IE:1,LU:1,GR:1,PL:1,CZ:1,
  HU:1,SK:1,RO:1,BG:1,HR:1,SI:1,RS:1,ME:1,MK:1,AL:1,
  BA:1,EE:1,LV:1,LT:1,UA:1,MD:1,BY:1,GE:1,AM:1,AZ:1,
  AU:1,NZ:1,TH:1,ID:1,MY:1,VN:1,KH:1,LA:1,MM:1,PH:1,IN:1,LK:1,
  CA:2,MX:2,BR:2,AR:2,CL:2,CO:2,PE:2,VE:2,EC:2,BO:2,
  PY:2,UY:2,CR:2,GT:2,BZ:2,HN:2,SV:2,NI:2,PA:2,
  CU:2,DO:2,JM:2,TT:2,BB:2,HT:2,
  TR:2,IL:2,JO:2,LB:2,EG:2,MA:2,TN:2,DZ:2,
  AE:2,SA:2,KW:2,BH:2,QA:2,OM:2,IQ:2,IR:2,
  ZA:2,KE:2,GH:2,NG:2,TZ:2,ET:2,SN:2,UG:2,ZM:2,ZW:2,
  RW:2,CM:2,CI:2,MZ:2,MG:2,AO:2,
  PK:2,BD:2,NP:2,RU:2,KZ:2,UZ:2,MN:2,MV:2,
  US:3
};

const CD_NOMAD = {
  PT:0,GE:0,MX:0,TH:0,VN:0,CO:0,ID:0,PH:0,MY:0,UY:0,
  CZ:0,PL:0,EE:0,HU:0,RO:0,BG:0,RS:0,BA:0,MK:0,AL:0,ME:0,
  KH:0,LA:0,NP:0,MA:0,GT:0,AR:0,
  ES:1,IT:1,GR:1,HR:1,TR:1,CL:1,EC:1,PE:1,BR:1,
  DE:1,NL:1,BE:1,AT:1,CH:1,FR:1,JP:1,KR:1,TW:1,HK:1,
  SG:1,CY:1,MT:1,SI:1,SK:1,LV:1,LT:1,UA:1,AM:1,AZ:1,
  KE:1,GH:1,ZA:1,TZ:1,IN:1,LK:1,
  GB:2,US:2,CA:2,AU:2,NZ:2,SE:2,NO:2,DK:2,FI:2,IS:2,
  JO:2,IL:2,AE:2,QA:2,BH:2,SA:2,KW:2,OM:2,EG:2,TN:2,
  BO:2,PY:2,GY:2,CR:2,PA:2,JM:2,DO:2,TT:2,CN:2,MN:2,UZ:2,KZ:2,
  NG:3,SD:3,AF:3,KP:3,SY:3,YE:3,LY:3,SO:3,IQ:3,IR:3,MM:3,CU:3,RU:3,BY:3,
};

// ── English Proficiency (EF EPI 2024 | 0=Very High → 3=Low) ──────────────
const CD_ENGLISH = {NL:0,AT:0,NO:0,DK:0,SE:0,BE:0,FI:0,PT:0,SG:0,ZA:0,IS:0,LU:0,DE:1,PL:1,RO:1,HR:1,CH:1,HU:1,SK:1,CZ:1,GR:1,BG:1,RS:1,UA:1,EE:1,LV:1,LT:1,MY:1,PH:1,NZ:1,AU:1,IE:1,GB:1,US:1,CA:1,IN:1,IL:1,CY:1,MT:1,ME:1,FR:2,ES:2,IT:2,CN:2,BR:2,RU:2,JP:2,KR:2,TH:2,MX:2,TR:2,VN:2,ID:2,TW:2,AR:2,CO:2,CL:2,UY:2,GE:2,AM:2,AZ:2,KZ:2,TN:2,MA:2,EG:2,SA:2,AE:2,QA:2,KW:2,BH:2,JO:2,LB:2,ZM:2,ZW:2,GH:2,KE:2,TZ:2,RW:2,SN:2,UG:2,FJ:2,DO:2,JM:2,TT:2,PE:2,GY:2,KH:2,MV:2,LK:2,MK:2,AL:2,BA:2,XK:2,UZ:2,SY:3,IQ:3,IR:3,AF:3,PK:3,BD:3,ET:3,NG:3,CM:3,MG:3,MZ:3,AO:3,CD:3,ML:3,BF:3,NE:3,TD:3,SO:3,SD:3,LY:3,YE:3,GT:3,HN:3,SV:3,NI:3,CU:3,EC:3,BO:3,PY:3,VE:3,MM:3,LA:3,NP:3,BT:3,KG:3,TJ:3,TM:3,DJ:3,ER:3,MR:3,GM:3,PG:3,VU:3,MN:3};

// ── Healthcare Quality (WHO/GHS 2023 | 0=Excellent → 3=Poor) ──────────────
const CD_HEALTHCARE = {SG:0,AU:0,CA:0,JP:0,KR:0,CH:0,DE:0,FR:0,NL:0,SE:0,NO:0,DK:0,FI:0,AT:0,BE:0,GB:0,IE:0,NZ:0,IL:0,IS:0,LU:0,US:1,ES:1,IT:1,PT:1,GR:1,CZ:1,PL:1,HU:1,RO:1,BG:1,HR:1,SK:1,EE:1,LV:1,LT:1,TW:1,MY:1,TH:1,AR:1,CL:1,UY:1,MX:1,BR:1,TR:1,AE:1,QA:1,KW:1,BH:1,SA:1,CY:1,MT:1,RS:1,ME:1,SI:1,CN:2,IN:2,RU:2,UA:2,MK:2,AL:2,BA:2,XK:2,GE:2,AM:2,AZ:2,KZ:2,VN:2,ID:2,PH:2,LK:2,CO:2,PE:2,EC:2,VE:2,ZA:2,EG:2,MA:2,TN:2,JO:2,LB:2,IR:2,TZ:2,KE:2,GH:2,SN:2,ZM:2,ZW:2,UG:2,RW:2,MV:2,MN:2,UZ:2,FJ:2,PK:3,BD:3,NP:3,MM:3,KH:3,LA:3,AF:3,IQ:3,SY:3,YE:3,LY:3,SO:3,SD:3,NG:3,ET:3,CM:3,CD:3,MZ:3,MG:3,AO:3,HN:3,GT:3,SV:3,NI:3,BO:3,PG:3,ML:3,BF:3,NE:3,TD:3};

// ── Tap Water Safety (WHO/UNICEF JMP | 0=Safe → 3=Severely Unsafe) ─────────
const CD_TAPWATER = {DE:0,CH:0,AT:0,SE:0,NO:0,DK:0,FI:0,NL:0,BE:0,LU:0,FR:0,GB:0,IE:0,US:0,CA:0,AU:0,NZ:0,JP:0,SG:0,KR:0,IS:0,MT:0,CY:0,IL:0,AE:0,QA:0,ES:1,IT:1,PT:1,GR:1,CZ:1,PL:1,HU:1,RO:1,SK:1,EE:1,LV:1,LT:1,HR:1,BG:1,TW:1,MY:1,TR:1,AR:1,CL:1,UY:1,MX:1,RS:1,ME:1,BA:1,MK:1,AL:1,GE:1,AM:1,BH:1,KW:1,SA:1,SI:1,CN:2,TH:2,VN:2,ID:2,PH:2,IN:2,LK:2,MV:2,BR:2,CO:2,PE:2,EC:2,BO:2,ZA:2,EG:2,MA:2,TN:2,JO:2,LB:2,RU:2,UA:2,KZ:2,UZ:2,MN:2,AZ:2,RW:2,KE:2,TZ:2,GH:2,SN:2,ZM:2,ZW:2,UG:2,IR:2,FJ:2,BD:3,NP:3,MM:3,KH:3,LA:3,PK:3,AF:3,IQ:3,SY:3,YE:3,LY:3,ET:3,NG:3,CD:3,MZ:3,MG:3,AO:3,SD:3,SO:3,HN:3,GT:3,NI:3,CM:3,ML:3,BF:3,NE:3,TD:3};

// ── Air Quality (IQAir 2023 avg PM2.5 | 0=Good → 3=Very Unhealthy) ─────────
const CD_AIRQUALITY = {IS:0,NO:0,FI:0,SE:0,AU:0,NZ:0,CA:0,IE:0,EE:0,LV:0,LT:0,PT:0,US:1,DE:1,GB:1,FR:1,NL:1,AT:1,CH:1,BE:1,DK:1,JP:1,SG:1,KR:1,TW:1,CL:1,AR:1,ZA:1,IL:1,GR:1,ES:1,IT:1,CY:1,MT:1,LU:1,SI:1,SK:1,HR:1,CN:2,TH:2,VN:2,ID:2,PH:2,MX:2,CO:2,PE:2,EC:2,TR:2,RU:2,UA:2,PL:2,CZ:2,HU:2,RO:2,BG:2,EG:2,MA:2,TN:2,KE:2,NG:2,ET:2,AM:2,GE:2,RS:2,IN:2,BD:3,PK:3,AF:3,IQ:3,IR:3,KW:3,QA:3,SA:3,AE:3,MN:3,MM:3,KH:3,LA:3,NP:3,LK:3,SD:3,LY:3,CM:3};

// ── Female Solo Safety (composite index | 0=Very Safe → 3=High Caution) ────
const CD_FEMALE_SAFETY = {
  // 0 = Very safe: minimal extra caution needed
  IS:0,NO:0,FI:0,SE:0,DK:0,NL:0,NZ:0,AU:0,CH:0,AT:0,IE:0,CA:0,JP:0,SG:0,LU:0,
  AD:0,LI:0,MC:0,SM:0,   // European micro-states: essentially host-country safe
  RW:0,CV:0,MU:0,SC:0,   // Africa safest: Rwanda (actively policed), island states
  CR:0,CU:0,BB:0,         // Americas: Costa Rica, Cuba, Barbados
  // 1 = Generally safe: standard awareness recommended
  DE:1,GB:1,FR:1,ES:1,PT:1,BE:1,US:1,KR:1,TW:1,CZ:1,SK:1,EE:1,LV:1,LT:1,
  SI:1,HR:1,MT:1,CY:1,IL:1,UY:1,AR:1,CL:1,GE:1,
  AL:1,MK:1,XK:1,MD:1,BY:1, // Balkans/Eastern Europe: caution but not elevated
  // 2 = Use caution: heightened awareness, avoid solo night travel
  IT:2,GR:2,PL:2,HU:2,RO:2,BG:2,TR:2,RU:2,UA:2,MX:2,BR:2,CO:2,TH:2,VN:2,
  MY:2,ID:2,PH:2,MN:2,AM:2,AZ:2,ZA:2,KE:2,GH:2,TZ:2,MA:2,TN:2,JO:2,BO:2,
  PE:2,EC:2,LB:2,AE:2,ME:2,RS:2,BA:2,
  BT:1,                                   // Bhutan: regulated tourism, generally safe
  KP:3,                                   // North Korea: authoritarian; extremely limited freedoms
  BN:2,KZ:2,KG:2,OM:2,TJ:2,TL:2,UZ:2, // Central/Southeast Asia
  BJ:2,BW:2,KM:2,DJ:2,SZ:2,GA:2,GM:2,CI:2,LS:2,MG:2,MW:2,MZ:2,NA:2,
  ST:2,TG:2,ZM:2,ZW:2,                  // Africa moderate
  AG:2,BS:2,DM:2,DO:2,GD:2,GY:2,KN:2,LC:2,PA:2,PY:2,SR:2,TT:2,VC:2, // Caribbean/SA
  FJ:2,PW:2,WS:2,SB:2,TO:2,TV:2,VU:2,FJ:2, // Pacific islands
  KI:2,MH:2,FM:2,NR:2,PG:2,             // Micronesia/PNG
  // 3 = High risk: serious safety concerns for solo female travelers
  IN:3,PK:3,BD:3,NP:3,AF:3,IQ:3,SY:3,YE:3,IR:3,SA:3,KW:3,QA:3,BH:3,
  EG:3,LY:3,SD:3,SO:3,NG:3,ET:3,MM:3,KH:3,LA:3,GT:3,HN:3,SV:3,CD:3,
  PS:3,TM:3,MV:3,                        // Palestine, Turkmenistan, Maldives (strict laws)
  DZ:3,AO:3,BF:3,BI:3,CM:3,CF:3,TD:3,CG:3,ER:3,GN:3,GW:3,LR:3,ML:3,
  MR:3,NE:3,SL:3,SS:3,UG:3,             // High-risk African states
  NI:3,HT:3,JM:3,VE:3,BZ:3,            // Americas high risk
};

// ── Nightlife & Social Scene (0=World-class → 3=Restricted) ─────────────────
const CD_NIGHTLIFE = {DE:0,ES:0,CO:0,AR:0,TH:0,PT:0,NL:0,GB:0,US:0,AU:0,JP:0,CZ:0,BR:0,FR:1,IT:1,GR:1,TR:1,MX:1,RU:1,UA:1,RO:1,RS:1,HR:1,BA:1,ME:1,PH:1,MY:1,SG:1,KR:1,TW:1,CH:1,AT:1,BE:1,SE:1,DK:1,NO:1,FI:1,IE:1,CA:1,NZ:1,ZA:1,LB:1,IL:1,IN:2,ID:2,VN:2,CN:2,PE:2,CL:2,EC:2,BO:2,PL:2,HU:2,SK:2,BG:2,EE:2,LV:2,LT:2,CY:2,MT:2,GE:2,AM:2,TN:2,MA:2,EG:2,NP:2,KH:2,LA:2,JO:2,SA:3,IR:3,AF:3,PK:3,SD:3,LY:3,SY:3,YE:3,IQ:3,KW:3,QA:3,BH:3,AE:3,UZ:3,TM:3,TJ:3,MM:3,MV:3,BN:3,BD:3};

// ── Scam Risk Index (tourist-facing | 0=Minimal → 3=High Risk) ──────────────
const CD_SCAM = {JP:0,SG:0,IS:0,NO:0,FI:0,DK:0,NZ:0,AU:0,CH:0,AT:0,LU:0,DE:1,SE:1,NL:1,BE:1,GB:1,IE:1,FR:1,CA:1,US:1,KR:1,TW:1,CZ:1,SK:1,EE:1,LV:1,LT:1,PT:1,SI:1,ES:2,IT:2,GR:2,TR:2,RU:2,MX:2,BR:2,AR:2,CO:2,PL:2,HU:2,RO:2,BG:2,RS:2,HR:2,CY:2,TH:2,VN:2,MY:2,ID:2,PH:2,ZA:2,MA:2,TN:2,JO:2,IL:2,AE:2,GE:2,AM:2,UA:2,CN:2,KH:2,ME:2,BA:2,LB:2,EG:3,IN:3,ET:3,NG:3,KE:3,TZ:3,MM:3,BD:3,NP:3,PK:3,LK:3,CM:3,SN:3,GH:3,PE:3,EC:3,BO:3,GT:3,HN:3,MG:3};

// ── Malaria / Mosquito Risk (WHO 2023 | 0=No risk → 3=High risk) ─────────────
const CD_MALARIA = {US:0,CA:0,GB:0,DE:0,FR:0,IT:0,ES:0,PT:0,NL:0,BE:0,LU:0,CH:0,AT:0,SE:0,NO:0,DK:0,FI:0,IS:0,IE:0,MT:0,CY:0,GR:0,PL:0,CZ:0,SK:0,HU:0,RO:0,BG:0,HR:0,SI:0,EE:0,LV:0,LT:0,RS:0,ME:0,MK:0,AL:0,BA:0,XK:0,JP:0,KR:0,TW:0,SG:0,NZ:0,AU:0,IL:0,AE:0,QA:0,KW:0,BH:0,SA:0,JO:0,LB:0,CL:0,AR:0,UY:0,GE:0,AM:0,AZ:0,UA:0,RU:0,MX:1,GT:1,HN:1,SV:1,NI:1,CR:1,PA:1,DO:1,JM:1,TT:1,CU:1,MA:1,TN:1,LY:1,EG:1,DZ:1,TR:1,IR:1,TH:1,VN:1,MY:1,ID:1,PH:1,KH:1,LA:1,MM:1,ZA:1,NA:1,BW:1,ZW:1,IN:2,BD:2,NP:2,LK:2,PK:2,AF:2,ET:2,KE:2,TZ:2,UG:2,RW:2,SN:2,GH:2,CI:2,CM:2,MZ:2,ZM:2,MG:2,AO:2,BR:2,CO:2,PE:2,EC:2,BO:2,VE:2,GY:2,NG:3,CD:3,ML:3,BF:3,NE:3,TD:3,CF:3,SS:3,SD:3,SO:3,DJ:3,PG:3,SB:3,VU:3,LR:3,SL:3,GN:3,GW:3,MR:3,GM:3};

// CD_TIMEZONE: ISO-2 → integer UTC offset (capital / dominant zone; half-hour
// offsets rounded to nearest integer; multi-timezone countries use the most-
// populated zone, e.g. US→Eastern, RU→Moscow, AU→AEST, CN→Beijing).
const CD_TIMEZONE = {
  // UTC -11
  NU:-11, AS:-11,
  // UTC -10
  CK:-10, PF:-10,
  // UTC -6
  MX:-6, GT:-6, BZ:-6, SV:-6, HN:-6, NI:-6, CR:-6,
  // UTC -5
  US:-5, CA:-5, EC:-5, PE:-5, CO:-5, PA:-5, CU:-5, JM:-5, HT:-5, BS:-5, TC:-5,
  // UTC -4
  DO:-4, BB:-4, TT:-4, GY:-4, SR:-4, BO:-4, PY:-4, VE:-4,
  AG:-4, DM:-4, GD:-4, KN:-4, LC:-4, VC:-4,
  // UTC -3
  BR:-3, AR:-3, UY:-3, CL:-3, FK:-3, GF:-3,
  // UTC -1
  CV:-1,
  // UTC +0
  GB:0, IE:0, PT:0, IS:0, GL:0,
  SN:0, GM:0, GW:0, GN:0, SL:0, LR:0, CI:0, GH:0, BF:0, ML:0, MR:0, TG:0, BJ:0, ST:0,
  // UTC +1
  FR:1, ES:1, DE:1, IT:1, BE:1, NL:1, LU:1, AT:1, CH:1, LI:1,
  DK:1, NO:1, SE:1, PL:1, CZ:1, SK:1, HU:1, SI:1, HR:1, BA:1,
  RS:1, ME:1, MK:1, AL:1, XK:1, MC:1, SM:1, VA:1, AD:1,
  NG:1, CM:1, CF:1, GA:1, CG:1, CD:1, AO:1, NA:1, ZM:1, MW:1,
  TN:1, DZ:1, MA:1, LY:1, NE:1, TD:1, GQ:1,
  // UTC +2
  FI:2, EE:2, LV:2, LT:2, BY:2, UA:2, MD:2, RO:2, BG:2, GR:2,
  CY:2, TR:2, LB:2, IL:2, PS:2, JO:2, SY:2,
  EG:2, SD:2, ZA:2, LS:2, SZ:2, BW:2, ZW:2, MZ:2, BI:2, RW:2,
  // UTC +3
  RU:3, SA:3, IQ:3, KW:3, YE:3, QA:3, BH:3, OM:3,
  ET:3, KE:3, TZ:3, UG:3, SO:3, DJ:3, ER:3, SS:3, MG:3, KM:3,
  // UTC +4
  AE:4, GE:4, AM:4, AZ:4, SC:4, MU:4,
  // UTC +5  (IN = UTC+5:30 → 5;  LK = UTC+5:30 → 5)
  PK:5, UZ:5, TJ:5, TM:5, MV:5, IN:5, LK:5,
  // UTC +6  (NP = UTC+5:45 → 6;  MM = UTC+6:30 → 6)
  NP:6, BD:6, BT:6, KZ:6, KG:6, MM:6,
  // UTC +7  (ID = Jakarta / WIB, most-populated zone)
  TH:7, VN:7, LA:7, KH:7, ID:7, MN:7,
  // UTC +8
  CN:8, MY:8, SG:8, PH:8, BN:8, TW:8,
  // UTC +9
  JP:9, KR:9, KP:9, TL:9, PW:9,
  // UTC +10  (AU = Sydney/AEST, most-populated zone)
  AU:10, PG:10,
  // UTC +11
  SB:11, VU:11, NR:11, FM:11,
  // UTC +12
  NZ:12, FJ:12, TV:12, TO:12,
  // UTC +13  (WS switched east of IDL in 2011)
  WS:13,
  // UTC +14  (Kiribati Line Islands: Kiritimati)
  KI:14,
};

// ── Major public holidays by country and month (0=Jan … 11=Dec) ─────────────
// Signature festivals & cultural events by country, keyed by month index (0=Jan).
// Distinct from COUNTRY_HOLIDAYS (statutory public holidays): these are the events a
// traveller plans a trip around. Rendered on the map by _renderHolidayMarkers().
const COUNTRY_EVENTS = {
  US: { 0:['🎬 Sundance Film Festival: Park City (late Jan)'], 1:['💗 Mardi Gras: New Orleans (Feb/Mar)'], 2:['🎸 SXSW: Austin music & tech (Mar)'], 3:['🎡 Coachella: California (Apr)'], 5:['🏳️‍🌈 NYC Pride (Jun)'], 6:['🎆 Independence Day (Jul 4)'], 8:['🔥 Burning Man: Nevada (late Aug/Sep)'], 9:['🎃 Halloween (Oct 31)'], 10:['🦃 Thanksgiving (4th Thu Nov)'], 11:['🎄 Holiday season (Dec)'] },
  GB: { 5:['🎶 Glastonbury Festival (late Jun)'], 7:['🎭 Edinburgh Festival Fringe (Aug)',"🎉 Notting Hill Carnival: London (late Aug)"], 11:['🎄 Christmas markets (Dec)'] },
  IE: { 2:["🍀 St Patrick's Day: Dublin (Mar 17)"] },
  FR: { 4:['🎬 Cannes Film Festival (May)'], 5:['🎵 Fête de la Musique (Jun 21)'], 6:['🇫🇷 Bastille Day (Jul 14)'] },
  DE: { 8:['🍺 Oktoberfest, Munich (mid-Sep to early Oct)'], 11:['🎄 Christmas Markets, nationwide (Dec)'] },
  AT: { 0:['🎻 New Year Concert, Vienna (Jan 1)'], 11:['🎄 Christmas Markets, Vienna & Salzburg (Dec)'] },
  CH: { 1:['🎭 Basel Fasnacht: carnival (Feb/Mar)'] },
  IT: { 1:['🎭 Venice Carnival (Feb)'], 6:['🐎 Palio di Siena (Jul 2)'], 7:['🐎 Palio di Siena (Aug 16)'] },
  ES: { 2:['🔥 Las Fallas: Valencia (Mar)'], 3:['💃 Feria de Abril: Seville (Apr)'], 6:['🐂 San Fermín / Running of the Bulls: Pamplona (Jul)'], 7:['🍅 La Tomatina: Buñol (last Wed Aug)'] },
  PT: { 5:['🎉 Festas de Lisboa / Santo António (Jun)'] },
  NL: { 3:["👑 King's Day (Apr 27)",'🌷 Tulip season: Keukenhof (Apr)'] },
  BE: { 6:['🎶 Tomorrowland: Boom (Jul)'] },
  CZ: { 11:['🎄 Christmas Markets: Prague (Dec)'] },
  GR: { 6:['🎭 Athens & Epidaurus Festival (summer)'] },
  SE: { 5:['🌼 Midsummer (late Jun)'] },
  NO: { 4:['🇳🇴 Constitution Day (May 17)'] },
  IS: { 7:['🎶 Verslunarmannahelgi / summer festivals (Aug)'] },
  BR: { 1:['🎭 Carnival, Rio & Salvador (Feb/Mar)'], 11:['🎆 Réveillon, Copacabana NYE (Dec 31)'] },
  MX: { 8:['🇲🇽 Independence Day (Sep 16)'], 10:['💀 Día de los Muertos (Nov 1–2)'] },
  PE: { 5:['☀ Inti Raymi: Cusco (Jun 24)'] },
  CO: { 0:['🎉 Feria de Cali (early Jan)'], 7:['🌸 Feria de las Flores: Medellín (Aug)'] },
  AR: { 2:['💃 Tango Festival: Buenos Aires (Mar)'] },
  JP: { 2:['🌸 Cherry Blossom (Hanami): late Mar'], 3:['🌸 Hanami & Golden Week (Apr/May)'], 6:['🎆 Gion Matsuri: Kyoto (Jul)','🏮 Nebuta Matsuri: Aomori (early Aug)'], 7:['💃 Awa Odori: Tokushima (Aug)'], 10:['🍁 Autumn foliage (kōyō): nationwide (Nov)'] },
  KR: { 3:['🌸 Cherry Blossom: Jinhae (Apr)'], 10:['🏮 Seoul Lantern Festival (Nov)'] },
  CN: { 1:['🏮 Spring Festival / Chinese New Year (Jan/Feb)'], 8:['🥮 Mid-Autumn Festival (Sep/Oct)'] },
  TW: { 1:['🏮 Lantern Festival (Feb)'] },
  TH: { 3:['💦 Songkran, Thai New Year water festival (Apr 13–15)'], 10:['🪔 Loy Krathong / Yi Peng, lights (Nov)'] },
  VN: { 0:['🧧 Tết: Lunar New Year (Jan/Feb)'] },
  ID: { 2:['🌑 Nyepi: Balinese Day of Silence (Mar)'] },
  IN: { 0:['🎉 Pongal & Republic Day (Jan)'], 2:['🎨 Holi: festival of colours (Mar)'], 7:['🐘 Onam: Kerala (Aug/Sep)'], 9:['🪔 Diwali: festival of lights (Oct/Nov)','🎭 Durga Puja: Kolkata (Oct)'], 10:['🐪 Pushkar Camel Fair: Rajasthan (Nov)'] },
  NP: { 2:['🎨 Holi (Mar)'] },
  AU: { 0:['🎆 Sydney Festival (Jan)','🇦🇺 Australia Day (Jan 26)'], 2:['🏳️‍🌈 Sydney Gay & Lesbian Mardi Gras (Feb/Mar)'] },
  NZ: { 1:['⛵ Waitangi Day (Feb 6)'] },
  AE: { 0:['🛍 Dubai Shopping Festival (Dec–Jan)'] },
  TR: { 3:['🌷 Istanbul Tulip Festival (Apr)'] },
  RU: { 1:['🥞 Maslenitsa (Feb/Mar)'], 5:['🌃 White Nights: St Petersburg (Jun)'] },
  ZA: { 2:['🎷 Cape Town Intl Jazz Festival (Mar)'], 8:['🌸 Namaqualand wildflowers (Aug/Sep)'] },
  // ── Americas ──
  CA: { 1:['🧊 Quebec Winter Carnival (Feb)'], 6:['🎆 Canada Day (Jul 1)'], 8:['🎬 Toronto Intl Film Festival (Sep)'] },
  CU: { 6:['🎺 Fiesta del Fuego: Santiago (Jul)'], 11:['🎬 Havana Film Festival (Dec)'] },
  JM: { 6:['🎶 Reggae Sumfest: Montego Bay (Jul)'] },
  CR: { 11:['🎉 Fiestas de Zapote: San José (late Dec)'] },
  GT: { 2:['✝ Semana Santa, Antigua (Mar/Apr)'], 10:['🪁 Giant Kite Festival, Sumpango (Nov 1)'] },
  CL: { 1:['🎶 Festival de Viña del Mar (Feb)'] },
  EC: { 1:['🎭 Carnival (Feb)'], 5:['☀ Inti Raymi: Andes (Jun)'] },
  BO: { 1:['🎭 Carnaval de Oruro (Feb)'] },
  // ── Africa ──
  EG: { 1:['🌞 Abu Simbel Sun Festival (Feb 22)'], 9:['🌞 Abu Simbel Sun Festival (Oct 22)'] },
  MA: { 5:['🎵 Fès Festival of World Sacred Music (Jun)','🎶 Mawazine: Rabat (Jun)'], 11:['🎬 Marrakech Intl Film Festival (Nov/Dec)'] },
  KE: { 6:['🦓 Great Migration: Maasai Mara (Jul–Oct)'] },
  TZ: { 1:['🎶 Sauti za Busara: Zanzibar (Feb)'], 6:['🦓 Serengeti river crossings (Jul–Sep)'] },
  ET: { 0:['✝ Timkat, Epiphany (Jan 19)'], 8:['🌼 Meskel, Finding of the True Cross (Sep 27)'] },
  MG: { 5:['🐋 Humpback whale watching, Île Sainte-Marie (Jun–Sep)'], 9:['🎶 Madajazzcar, Antananarivo (Oct)'] },
  NG: { 1:['🎭 Lagos Carnival (Feb)'], 11:['🎭 Calabar Carnival (Dec)'] },
  GH: { 7:['🥁 Homowo Festival (Aug/Sep)'], 11:['🎉 December in GH / Afro festivals: Accra (Dec)'] },
  SN: { 4:['🎷 Saint-Louis Jazz Festival (May)'] },
  // ── Middle East ──
  IL: { 2:['🎭 Purim (Mar)'], 8:['🍎 Rosh Hashanah (Sep/Oct)'] },
  LB: { 6:['🎶 Baalbeck Intl Festival (Jul–Aug)'] },
  SA: { 9:['🎉 Riyadh Season (Oct–Mar)'] },
  // ── Asia-Pacific ──
  SG: { 0:['🏮 Chinese New Year (Jan/Feb)'], 8:['🏎 F1 Singapore Grand Prix: night race (Sep)'] },
  MY: { 0:['🏮 Thaipusam (Jan/Feb)'] },
  PH: { 0:['🎭 Sinulog: Cebu & Ati-Atihan: Kalibo (Jan)'], 11:['🎄 Christmas season: world\'s longest (Sep–Dec)'] },
  LK: { 7:['🐘 Esala Perahera: Kandy (Jul/Aug)'] },
  MM: { 3:['💦 Thingyan: water festival (Apr)'] },
  KH: { 10:['🌕 Bon Om Touk: Water Festival (Nov)'] },
  LA: { 3:['💦 Pi Mai: Lao New Year (Apr)'], 10:['🕯 That Luang Festival (Nov)'] },
  MN: { 6:['🏇 Naadam Festival (Jul)'] },
  // ── More of Europe ──
  PL: { 11:['🎄 Christmas Markets: Kraków (Dec)'] },
  HU: { 7:['🎶 Sziget Festival: Budapest (Aug)'] },
  DK: { 5:['🎶 Roskilde Festival (late Jun/Jul)'] },
  FI: { 11:['🎅 Santa Claus Village: Rovaniemi (Dec)'] },
  HR: { 6:['🎶 Ultra Europe: Split (Jul)'] },
  MT: { 1:['🎭 Carnival: Valletta (Feb)'] },
};

const COUNTRY_HOLIDAYS = {
  AR:{ 0:['New Year\'s Day'],1:['Carnival (Feb)'],2:[],3:['Easter','Holy Thursday','Good Friday','Malvinas Veterans Day (Apr 2)'],4:['Labour Day (May 1)','May Revolution (May 25)'],5:['Sovereignty Flag Day (Jun 20)'],6:['Independence Day (Jul 9)'],7:['Death of San Martín (Aug 17)'],8:[],9:['Columbus Day (Oct 12)'],10:[],11:['Immaculate Conception (Dec 8)','Christmas (Dec 25)'] },
  AU:{ 0:['New Year\'s Day','Australia Day (Jan 26)'],1:[],2:[],3:['Easter Friday','Easter Monday','ANZAC Day (Apr 25)'],4:[],5:['Queen\'s Birthday (varies by state)'],6:[],7:[],8:[],9:[],10:['Melbourne Cup (VIC, Nov 1st Tue)'],11:['Christmas (Dec 25)','Boxing Day (Dec 26)'] },
  CA:{ 0:['New Year\'s Day'],1:[],2:[],3:['Easter Friday','Easter Monday'],4:['Victoria Day (May Mon before May 25)'],5:[],6:['Canada Day (Jul 1)'],7:[],8:['Labour Day (Sep Mon 1)'],9:['Thanksgiving (Oct 2nd Mon)','Remembrance Day (Nov 11)'],10:[],11:['Christmas (Dec 25)','Boxing Day (Dec 26)'] },
  CN:{ 0:['New Year\'s Day'],1:['Chinese New Year (7-day holiday)','Spring Festival'],2:[],3:['Qingming Festival (Tomb Sweeping)'],4:['Labour Day (May 1-5)'],5:[],6:['Dragon Boat Festival'],7:[],8:['Mid-Autumn Festival'],9:['National Day (Oct 1-7, Golden Week)'],10:[],11:[] },
  CO:{ 0:['New Year\'s Day','Epiphany (Jan 6)'],1:[],2:['Carnival (Barranquilla, pre-Lent)'],3:['Holy Thursday','Good Friday','Easter'],4:['Labour Day (May 1)'],5:['Sacred Heart','Corpus Christi'],6:['St. Peter & Paul (Jun 29)','Independence Day (Jul 4, 5, 20)'],7:['Battle of Boyacá (Aug 7)','Assumption (Aug 15)'],8:[],9:['Columbus Day (Oct 12)'],10:['All Saints Day (Nov 1)','Independence of Cartagena (Nov 11)'],11:['Immaculate Conception (Dec 8)','Christmas (Dec 25)'] },
  DE:{ 0:['New Year\'s Day'],1:[],2:[],3:['Good Friday','Easter Monday'],4:['Labour Day (May 1)','Ascension Day'],5:['Whit Monday'],6:[],7:['Assumption (Bavaria, Aug 15)'],8:['Oktoberfest begins (late Sep)'],9:['German Unity Day (Oct 3)'],10:['Reformation Day (Oct 31, some states)','All Saints (Nov 1, some states)'],11:['Christmas (Dec 25-26)','St. Nicholas Day (Dec 6)'] },
  EG:{ 0:['New Year\'s Day','Coptic Christmas (Jan 7)'],1:[],2:[],3:['Easter (Coptic, varies)','Sham El-Nessim (Easter Monday)'],4:['Labour Day (May 1)','Sinai Liberation (Apr 25)'],5:['June 30 Revolution'],6:['Revolution Day (Jul 23)'],7:[],8:[],9:['Armed Forces Day (Oct 6)'],10:[],11:[] },
  ES:{ 0:['New Year\'s Day','Epiphany (Jan 6, Three Kings)'],1:[],2:[],3:['Holy Thursday (some regions)','Good Friday','Easter Monday (some regions)'],4:['Labour Day (May 1)'],5:[],6:[],7:['Assumption (Aug 15)'],8:[],9:['Fiesta Nacional (Oct 12)'],10:['All Saints Day (Nov 1)'],11:['Constitution Day (Dec 6)','Immaculate Conception (Dec 8)','Christmas (Dec 25)'] },
  FR:{ 0:['New Year\'s Day'],1:[],2:[],3:['Easter Monday'],4:['Labour Day (May 1)','VE Day (May 8)','Ascension Day'],5:['Whit Monday'],6:['Bastille Day (Jul 14)'],7:['Assumption (Aug 15)'],8:[],9:[],10:['All Saints Day (Nov 1)','Armistice Day (Nov 11)'],11:['Christmas (Dec 25)'] },
  GB:{ 0:['New Year\'s Day'],1:[],2:[],3:['Good Friday','Easter Monday'],4:['Early May Bank Holiday','Spring Bank Holiday (last Mon May)'],5:[],6:['Summer Bank Holiday (Aug Mon)'],7:[],8:[],9:[],10:['Remembrance Sunday (Nov 2nd Sun)'],11:['Christmas (Dec 25)','Boxing Day (Dec 26)'] },
  GR:{ 0:['New Year\'s Day','Epiphany (Jan 6)'],1:['Carnival/Apokries'],2:['Clean Monday (Orthodox Lent)'],3:['Greek Independence Day (Mar 25)','Good Friday','Easter (Orthodox)','Easter Monday'],4:['Labour Day (May 1)'],5:['Holy Spirit Monday'],6:[],7:['Assumption (Aug 15)'],8:[],9:['Ohi Day (Oct 28)'],10:[],11:['Christmas (Dec 25-26)'] },
  ID:{ 0:['New Year\'s Day'],1:['Chinese New Year','Isra Mi\'raj (varies)'],2:['Nyepi (Bali Hindu New Year, varies)'],3:['Good Friday','Easter'],4:['Labour Day (May 1)','Ascension Day','Eid al-Fitr (varies)','Pancasila Day (Jun 1)'],5:['Eid al-Adha (varies)'],6:['Islamic New Year (varies)'],7:['Independence Day (Aug 17)'],8:[],9:[],10:['Prophet\'s Birthday (varies)'],11:['Christmas (Dec 25)'] },
  IN:{ 0:['New Year\'s Day','Lohri (Punjab)'],1:['Republic Day (Jan 26)'],2:['Holi (varies)','Mahashivaratri (varies)'],3:['Good Friday','Easter','Ram Navami (varies)','Baisakhi'],4:['Labour Day (May 1)','Buddha Purnima (varies)'],5:['Id-ul-Fitr (varies)'],6:['Rath Yatra (Puri)'],7:['Independence Day (Aug 15)','Raksha Bandhan'],8:['Ganesh Chaturthi','Krishna Janmashtami (varies)'],9:['Gandhi Jayanti (Oct 2)','Navratri','Dussehra'],10:['Diwali (Oct/Nov, varies)','Id-ul-Zuha (varies)'],11:['Guru Nanak Jayanti','Christmas (Dec 25)'] },
  IT:{ 0:['New Year\'s Day','Epiphany (Jan 6)'],1:[],2:[],3:['Easter','Easter Monday'],4:['Liberation Day (Apr 25)','Labour Day (May 1)'],5:['Republic Day (Jun 2)'],6:[],7:['Assumption (Aug 15, Ferragosto)'],8:[],9:[],10:['All Saints Day (Nov 1)'],11:['Immaculate Conception (Dec 8)','Christmas (Dec 25)','St. Stephen (Dec 26)'] },
  JP:{ 0:['New Year (Jan 1-3)','Coming of Age Day (2nd Mon)'],1:[],2:['Vernal Equinox Day'],3:['Showa Day (Apr 29)','Golden Week begins'],4:['Constitution Day (May 3)','Greenery Day (May 4)','Children\'s Day (May 5)'],5:[],6:['Marine Day (3rd Mon)'],7:['Mountain Day (Aug 11)'],8:['Respect for the Aged Day (3rd Mon)','Autumnal Equinox'],9:['Sports Day (2nd Mon)'],10:['Culture Day (Nov 3)','Labour Day (Nov 23)'],11:['Christmas Eve (Dec 24, commercial)','New Year preparations'] },
  MA:{ 0:['New Year\'s Day','Army Day (Jan 14)'],1:[],2:[],3:['Amazigh New Year (varies)'],4:['Labour Day (May 1)'],5:['Feast of the Throne (Jul 30)','Oued Ed-Dahab (Aug 14)'],6:['Revolution Day (Aug 20)','Youth Day (Aug 21)'],7:['Eid celebrations (varies by lunar cal)'],8:[],9:['Green March Anniversary (Nov 6)','Independence Day (Nov 18)'],10:[],11:['Prophet\'s Birthday (varies)'] },
  MX:{ 0:['New Year\'s Day'],1:['Constitution Day (1st Mon)'],2:['Benito Juárez Day (3rd Mon)','Good Friday'],3:['Holy Thursday','Good Friday'],4:['Labour Day (May 1)'],5:[],6:[],7:['Independence Day (Sep 16)'],8:[],9:['Columbus Day/Día de la Raza (Oct 12)'],10:['Día de los Muertos (Nov 1-2)','Revolution Day (3rd Mon)'],11:['Christmas (Dec 25)','Christmas Eve (Dec 24)'] },
  NZ:{ 0:['New Year (Jan 1-2)','Waitangi Day (Feb 6)'],1:[],2:[],3:['Good Friday','Easter Monday','Easter Tuesday'],4:['ANZAC Day (Apr 25)','Queen\'s Birthday (1st Mon Jun)'],5:[],6:[],7:[],8:['Labour Day (4th Mon Oct)'],9:[],10:[],11:['Christmas (Dec 25)','Boxing Day (Dec 26)'] },
  PE:{ 0:['New Year\'s Day'],1:[],2:['Carnival (varies, Feb/Mar)'],3:['Holy Thursday','Good Friday','Easter'],4:['Labour Day (May 1)'],5:['Inti Raymi (Cusco, Jun 24)'],6:['Fiestas Patrias (Jul 28-29)'],7:['Santa Rosa de Lima (Aug 30)'],8:[],9:['Battle of Angamos (Oct 8)'],10:['All Saints Day (Nov 1)'],11:['Immaculate Conception (Dec 8)','Christmas (Dec 25)'] },
  PT:{ 0:['New Year\'s Day'],1:[],2:[],3:['Good Friday','Easter'],4:['Freedom Day (Apr 25)','Labour Day (May 1)'],5:['Portugal Day (Jun 10)','Corpus Christi'],6:['Assumption (Aug 15)'],7:[],8:[],9:['Republic Day (Oct 5)'],10:['All Saints Day (Nov 1)','Independence Restoration Day (Dec 1)'],11:['Immaculate Conception (Dec 8)','Christmas (Dec 25)'] },
  RU:{ 0:['New Year (Jan 1-8)','Orthodox Christmas (Jan 7)'],1:['Defender of the Fatherland (Feb 23)'],2:['International Women\'s Day (Mar 8)'],3:[],4:['Labour Day (May 1)','Victory Day (May 9)'],5:['Russia Day (Jun 12)'],6:[],7:[],8:[],9:['National Unity Day (Nov 4)'],10:[],11:['New Year preparations (Dec 31)'] },
  TH:{ 0:['New Year\'s Day'],1:['Makha Bucha Day (varies)'],2:['Chakri Memorial Day (Apr 6)'],3:['Songkran (Apr 13-15, Thai New Year)'],4:['Labour Day (May 1)','Coronation Day (May 4)','Visakha Bucha (varies)'],5:['HM Queen\'s Birthday (Jun 3)'],6:['Asahna Bucha (varies)','Buddhist Lent begins'],7:[],8:['HM King\'s Birthday (Jul 28)','Queen Mother\'s Day (Aug 12)'],9:[],10:['Chulalongkorn Day (Oct 23)'],11:['Father\'s Day/National Day (Dec 5)','Constitution Day (Dec 10)','New Year\'s Eve (Dec 31)'] },
  TR:{ 0:['New Year\'s Day'],1:[],2:['Nowruz (Mar 21, unofficial)'],3:['National Sovereignty Day (Apr 23)'],4:['Labour Day (May 1)','Commemoration Day (May 19)'],5:[],6:['Democracy Day (Jul 15)'],7:['Victory Day (Aug 30)'],8:[],9:['Republic Day (Oct 29)'],10:[],11:[] },
  US:{ 0:['New Year\'s Day','Martin Luther King Jr Day (3rd Mon)'],1:['Presidents Day (3rd Mon)'],2:[],3:['Easter (varies)'],4:['Memorial Day (last Mon)'],5:['Juneteenth (Jun 19)','Independence Day (Jul 4)'],6:[],7:[],8:['Labour Day (1st Mon)'],9:['Columbus Day (2nd Mon)'],10:['Veterans Day (Nov 11)','Thanksgiving (4th Thu)'],11:['Christmas (Dec 25)'] },
  VN:{ 0:['New Year\'s Day'],1:['Tet (Lunar New Year, 7-day holiday)'],2:[],3:['Hung Kings Commemorations (Apr 10)','Liberation Day (Apr 30)','Labour Day (May 1)'],4:[],5:[],6:[],7:[],8:[],9:[],10:[],11:[],12:[] },
  ZA:{ 0:['New Year\'s Day'],1:[],2:['Human Rights Day (Mar 21)'],3:['Good Friday','Family Day (Easter Mon)','Freedom Day (Apr 27)'],4:['Workers Day (May 1)'],5:['Youth Day (Jun 16)'],6:[],7:['National Women\'s Day (Aug 9)'],8:[],9:['Heritage Day (Sep 24)'],10:[],11:['Day of Reconciliation (Dec 16)','Christmas (Dec 25)','Day of Goodwill (Dec 26)'] },
  AE:{ 0:['New Year\'s Day'],1:['Prophet\'s Birthday (varies)'],2:[],3:[],4:['Labour Day (May 1)','Eid al-Fitr (varies)'],5:['Eid al-Adha (varies)'],6:['Accession of Ruler','Islamic New Year (varies)'],7:[],8:[],9:[],10:['National Day (Dec 2-3)'],11:['National Day (Dec 2-3)'] },
  BR:{ 0:['New Year\'s Day'],1:['Carnival (Fri–Tue before Ash Wed)','Tiradentes Day (Apr 21)'],2:[],3:['Good Friday','Easter'],4:['Labour Day (May 1)','Corpus Christi (varies)'],5:[],6:['Independence Day (Sep 7)'],7:[],8:['Our Lady Aparecida (Oct 12)','All Souls Day (Nov 2)'],9:['Republic Day (Nov 15)'],10:[],11:['Christmas (Dec 25)','Christmas Eve (Dec 24)'] },
  KR:{ 0:['New Year\'s Day','Seollal – Lunar New Year (3 days, varies)'],1:[],2:['Independence Movement Day (Mar 1)'],3:['Children\'s Day (May 5)','Buddha\'s Birthday (varies, Apr/May)'],4:['Memorial Day (Jun 6)'],5:[],6:['Liberation Day (Aug 15)'],7:['Chuseok – Harvest Festival (3 days, Sep/Oct, varies)'],8:[],9:['National Foundation Day (Oct 3)','Hangul Day (Oct 9)'],10:[],11:['Christmas (Dec 25)'] },
  PH:{ 0:['New Year\'s Day'],1:['Chinese New Year (varies)'],2:['Araw ng Kagitingan (Apr 9)'],3:['Holy Thursday','Good Friday','Black Saturday'],4:['Labour Day (May 1)','Independence Day (Jun 12)'],5:[],6:['Ninoy Aquino Day (Aug 21)','National Heroes Day (last Mon Aug)'],7:[],8:[],9:['All Saints Day (Nov 1)','All Souls Day (Nov 2)','Bonifacio Day (Nov 30)'],10:['Feast of Immaculate Conception (Dec 8)','Christmas (Dec 25)','Rizal Day (Dec 30)'],11:[] },
  SG:{ 0:['New Year\'s Day'],1:['Chinese New Year (2 days, varies)'],2:[],3:['Good Friday','Hari Raya Puasa (varies)'],4:['Labour Day (May 1)','Vesak Day (varies)'],5:['Hari Raya Haji (varies)'],6:[],7:['National Day (Aug 9)'],8:[],9:[],10:['Deepavali (varies)'],11:['Christmas (Dec 25)'] },
  CZ:{ 0:['New Year\'s Day','Restoration of Czech Statehood Day'],1:[],2:[],3:['Easter Monday'],4:['Labour Day (May 1)','Liberation Day (May 8)'],5:[],6:['Cyril and Methodius Day (Jul 5)','Martyrdom of Jan Hus (Jul 6)'],7:['Czech Statehood Day (Sep 28)'],8:['Independence Day (Oct 28)'],9:[],10:['Struggle for Freedom (Nov 17)'],11:['Christmas Eve (Dec 24)','Christmas (Dec 25-26)'] },
  PL:{ 0:['New Year\'s Day','Epiphany (Jan 6)'],1:[],2:[],3:['Easter Sunday','Easter Monday'],4:['Labour Day (May 1)','Constitution Day (May 3)'],5:['Corpus Christi (varies)'],6:[],7:['Assumption (Aug 15)'],8:[],9:['All Saints Day (Nov 1)','Independence Day (Nov 11)'],10:[],11:['Christmas (Dec 25-26)'] },
  HU:{ 0:['New Year\'s Day'],1:[],2:['National Day (Mar 15)'],3:['Easter Sunday','Easter Monday'],4:['Labour Day (May 1)','Whit Monday'],5:[],6:[],7:['St. Stephen\'s Day (Aug 20)'],8:[],9:['Republic Day (Oct 23)'],10:['All Saints Day (Nov 1)'],11:['Christmas (Dec 25-26)'] },
  KE:{ 0:['New Year\'s Day'],1:['Madaraka Day (Jun 1)'],2:[],3:['Good Friday','Easter Monday'],4:['Labour Day (May 1)'],5:['Madaraka Day (Jun 1)'],6:['Mashujaa Day (Oct 20)'],7:[],8:[],9:['Mashujaa Day (Oct 20)','Jamhuri Day (Dec 12)'],10:[],11:['Christmas (Dec 25)','Boxing Day (Dec 26)'] },
  TZ:{ 0:['New Year\'s Day','Zanzibar Revolution Day (Jan 12)'],1:[],2:[],3:['Good Friday','Easter Monday','Union Day (Apr 26)'],4:['Labour Day (May 1)'],5:['Saba Saba Day (Jul 7)'],7:['Peasants Day (Aug 8)'],8:[],9:['Independence Day (Dec 9)'],10:[],11:['Independence Day (Dec 9)','Christmas (Dec 25)'] },
  GH:{ 0:['New Year\'s Day','Independence Day (Mar 6)'],1:[],2:['Independence Day (Mar 6)'],3:['Good Friday','Easter Monday'],4:['Labour Day (May 1)','Eid al-Fitr (varies)'],5:[],6:['Republic Day (Jul 1)'],7:[],8:[],9:['Farmers Day (1st Fri Dec)'],10:[],11:['Farmers Day','Christmas (Dec 25-26)'] },
  MY:{ 0:['New Year\'s Day'],1:['Chinese New Year (2 days, varies)','Thaipusam (varies)'],2:['Hari Raya Aidilfitri (2 days, varies)'],3:['Good Friday (Sabah/Sarawak only)','Wesak Day (varies)'],4:['Labour Day (May 1)','Hari Raya Haji (varies)'],5:['Yang di-Pertuan Agong Birthday (varies)'],6:[],7:['National Day (Aug 31)'],8:['Malaysia Day (Sep 16)'],9:[],10:['Deepavali (varies)'],11:['Christmas (Dec 25)'] },
  KH:{ 0:['New Year\'s Day'],3:['Khmer New Year (Apr 13-15)'],4:['Labour Day (May 1)','Visak Bochea (varies)'],5:['King\'s Birthday (May 14)'],6:['Queen Mother Birthday (Jun 18)'],7:['Pchum Ben / Ancestors Day (varies Sep/Oct)'],8:[],9:['Commemorations Day (Oct 23)','King Norodom Sihamoni Birthday (Oct 31)'],10:['Independence Day (Nov 9)'],11:[] },
  CL:{ 0:['New Year\'s Day'],1:['Good Friday','Easter','Labour Day (May 21)'],2:[],3:[],4:['Labour Day (May 21)','Navy Day (May 21)'],5:['Corpus Christi (varies)'],6:['Our Lady of Mount Carmel (Jul 16)'],7:['Assumption (Aug 15)'],8:['Independence Day (Sep 18)','Army Day (Sep 19)'],9:['Columbus Day (Oct 12)'],10:['All Saints Day (Nov 1)','Evangelical Day (Oct 31)'],11:['Immaculate Conception (Dec 8)','Christmas (Dec 25)'] },
  EC:{ 0:['New Year\'s Day'],1:['Carnival (Feb/Mar)'],2:['Good Friday','Easter'],3:[],4:['Labour Day (May 1)','Battle of Pichincha (May 24)'],5:['Simón Bolívar Birthday (Jul 24)'],6:['Independence Day (Aug 10)'],7:[],8:['Independence of Guayaquil (Oct 9)','Columbus Day (Oct 12)'],9:[],10:['All Saints Day (Nov 1-3)','Independence of Cuenca (Nov 3)'],11:['Christmas (Dec 25)'] },
  CU:{ 0:['Liberation Day (Jan 1-2)'],1:['Victory Day (Jan 8)'],2:[],3:[],4:['Labour Day (May 1)'],5:[],6:[],7:['National Rebellion Day (Jul 26)'],8:[],9:['Independence Day (Oct 10)'],10:[],11:['Christmas (Dec 25)'] },
  AT:{ 0:['New Year','Epiphany (Jan 6)'],1:[],2:[],3:['Easter Mon'],4:['Labour Day','Ascension'],5:['Whit Mon','Corpus Christi'],6:[],7:['Assumption (Aug 15)'],8:[],9:['National Day (Oct 26)'],10:['All Saints (Nov 1)'],11:['Immaculate Conception (Dec 8)','Christmas','St Stephen (Dec 26)'] },
  BE:{ 0:['New Year'],1:[],2:[],3:['Easter Mon'],4:['Labour Day','Ascension','Armistice 1918 (May 8)'],5:['Whit Mon'],6:['National Day (Jul 21)'],7:['Assumption'],8:[],9:[],10:['All Saints','Armistice (Nov 11)'],11:['Christmas'] },
  CH:{ 0:['New Year','Berchtolds Day'],1:[],2:[],3:['Good Fri','Easter Mon'],4:['Labour Day','Ascension'],5:['Whit Mon'],6:[],7:['Swiss National Day (Aug 1)'],8:[],9:[],10:['All Saints (some cantons)'],11:['Immaculate Conception (Dec 8)','Christmas'] },
  DK:{ 0:['New Year'],1:[],2:[],3:['Maundy Thu','Good Fri','Easter Mon'],4:['Ascension','Great Prayer Day (some areas)'],5:['Whit Mon'],6:[],7:[],8:[],9:[],10:[],11:['Christmas Eve (Dec 24)','Christmas','Boxing Day'] },
  FI:{ 0:['New Year','Epiphany (Jan 6)'],1:[],2:[],3:['Good Fri','Easter Mon'],4:['Labour Day'],5:['Ascension','Midsummer Eve & Day (Jun)'],6:[],7:[],8:[],9:[],11:['Independence Day (Dec 6)','Christmas Eve','Christmas','St Stephen'] },
  IE:{ 0:['New Year'],1:['St Brigid’s Day (Feb 1)'],2:['St Patrick’s Day (Mar 17)'],3:['Easter Mon'],4:['May Bank Holiday'],5:['June Bank Holiday'],6:['August Bank Holiday'],7:[],8:[],9:['October Bank Holiday'],10:[],11:['Christmas','St Stephen’s Day (Dec 26)'] },
  IL:{ 0:['New Year'],2:[],3:['Passover (Apr, varies)','Holocaust Remembrance Day','Memorial Day','Independence Day (Apr/May)'],4:['Lag B’Omer','Jerusalem Day'],5:['Shavuot'],6:[],7:[],8:['Rosh Hashanah (Sep, varies)','Yom Kippur','Sukkot'],9:['Simchat Torah'],10:[],11:['Hanukkah (varies)'] },
  IS:{ 0:['New Year'],3:['Maundy Thu','Good Fri','Easter Mon','First Day of Summer'],4:['Labour Day','Ascension'],5:['Whit Mon'],6:['National Day (Jun 17)'],7:['Bank Holiday'],8:[],9:[],10:[],11:['Christmas Eve','Christmas','Boxing Day','New Year’s Eve'] },
  LB:{ 0:['New Year'],1:['St Maroun’s Day (Feb 9)'],2:['St Joseph’s Day'],3:['Good Fri (Cath)','Easter (Orth)'],4:['Labour Day','Liberation Day (May 25)'],5:['Resistance Day'],6:[],7:['Assumption'],8:[],9:[],10:['All Saints'],11:['Independence Day (Nov 22)','Christmas (Dec 25)'] },
  MT:{ 0:['New Year'],1:['St Paul’s Shipwreck (Feb 10)'],2:['St Joseph’s Day (Mar 19)'],3:['Good Fri','Freedom Day (Mar 31)'],4:['Workers Day'],5:['Sette Giugno (Jun 7)','St Peter & Paul (Jun 29)'],6:[],7:['Assumption','Victory Day (Sep 8)'],8:['Independence Day (Sep 21)'],9:[],10:['All Saints','Immaculate Conception (Dec 8)'],11:['Republic Day (Dec 13)','Christmas'] },
  NO:{ 0:['New Year'],1:[],2:[],3:['Maundy Thu','Good Fri','Easter Mon'],4:['Labour Day (May 1)','Constitution Day (May 17)','Ascension'],5:['Whit Mon'],6:[],7:[],8:[],9:[],10:[],11:['Christmas Eve','Christmas','Boxing Day'] },
  NL:{ 0:['New Year'],1:[],2:[],3:['Good Fri','Easter Mon'],4:['King’s Day (Apr 27)','Liberation Day (May 5)','Ascension'],5:['Whit Mon'],6:[],7:[],8:[],9:[],10:[],11:['Christmas (Dec 25-26)'] },
  RO:{ 0:['New Year (Jan 1-2)','Unification Day (Jan 24)'],1:[],2:[],3:['Good Fri (Orth)','Easter Mon (Orth)'],4:['Labour Day','Children’s Day (Jun 1)'],5:['Whit Mon (Orth)'],6:[],7:['Assumption (Aug 15)'],8:[],9:['St Andrew’s Day (Nov 30)'],10:[],11:['National Day (Dec 1)','Christmas (Dec 25-26)'] },
  RS:{ 0:['New Year (Jan 1-2)','Orthodox Christmas (Jan 7-8)'],1:['Statehood Day (Feb 15-16)'],2:[],3:['Orthodox Easter (varies)'],4:['Labour Day (May 1-2)'],5:[],6:[],7:[],8:[],9:[],10:['Armistice Day (Nov 11)'],11:[] },
  SE:{ 0:['New Year','Epiphany (Jan 6)'],1:[],2:[],3:['Good Fri','Easter Mon'],4:['Labour Day','Ascension'],5:['National Day (Jun 6)','Whit Mon','Midsummer (Jun)'],6:[],7:[],8:[],10:['All Saints (Oct/Nov)'],11:['Christmas Eve','Christmas','Boxing Day'] },
  UA:{ 0:['New Year (Jan 1)','Orthodox Christmas (Jan 7)'],1:[],2:['International Women’s Day (Mar 8)'],3:['Orthodox Easter (varies)'],4:['Labour Day (May 1)','Victory Day (May 9)'],5:[],6:['Constitution Day (Jun 28)'],7:['Independence Day (Aug 24)'],8:['Day of Defenders (Oct 14)'],9:[],10:[],11:['Christmas (Dec 25)'] },
  SA:{ 0:[],1:['Founding Day (Feb 22)'],2:[],3:['Eid Al Fitr (varies)','Ramadan begins'],4:[],5:['Eid Al Adha (varies)'],6:[],7:[],8:['National Day (Sep 23)'],9:[],10:[],11:[] },
  JO:{ 0:['New Year'],1:[],2:['Arab League Day (Mar 22)'],3:['Easter (varies)','Eid Al Fitr (varies)'],4:['Labour Day','Independence Day (May 25)'],5:['Eid Al Adha (varies)'],6:['Islamic New Year (varies)'],7:['Great Arab Revolt (Aug 11)'],8:[],9:[],10:[],11:[] },
  NG:{ 0:['New Year'],2:[],3:['Good Fri','Easter Mon','Eid Al Fitr (varies)'],4:['Workers Day','Children’s Day (May 27)'],5:['Eid Al Adha (varies)'],6:[],7:[],8:[],9:['Independence Day (Oct 1)'],10:[],11:['Christmas','Boxing Day'] },
  ET:{ 0:['Ethiopian Christmas (Jan 7)','Epiphany (Jan 19)'],1:['Victory of Adwa (Mar 2)'],2:['Ethiopian Easter (varies)'],3:['International Labour Day (May 1)','Patriots Victory Day (May 5)'],4:['Downfall of Derg (May 28)'],5:['Eid Al Adha (varies)'],6:[],7:['Ethiopian New Year (Sep 11)','Finding of the True Cross (Sep 27)'],8:[],9:['Eid Al Mawlid (varies)'],10:[],11:[] },
  PK:{ 0:['New Year'],1:[],2:['Pakistan Day (Mar 23)'],3:['Easter (varies, minority)','Eid Al Fitr (3 days, varies)'],4:['Labour Day'],5:['Eid Al Adha (varies)'],6:['Independence Day (Aug 14)'],7:[],8:['Defence Day (Sep 6)','Birthday of Quaid (Sep 11)'],9:[],10:['Iqbal Day (Nov 9)'],11:['Birthday of Quaid-e-Azam (Dec 25)','Christmas (Dec 25)'] },
  BD:{ 0:['New Year'],1:['Ekushey February (Feb 21)'],2:['Pohela Boishakh (Apr 14, Bengali New Year)','Eid Al Fitr (varies)'],3:[],4:['May Day'],5:['Eid Al Adha (varies)'],6:['National Mourning Day (Aug 15)'],7:['National Revolution Day (Nov 7)'],8:[],9:[],10:[],11:['Victory Day (Dec 16)','Christmas (Dec 25)'] },
  LK:{ 0:['New Year'],1:['National Day (Feb 4)'],2:['Maha Sivarathri (varies)'],3:['Avurudhu (Apr 14)','Good Fri','Easter'],4:['Vesak Full Moon (varies)','May Day'],5:['Poson Poya'],6:['Esala Poya'],7:['National Heroes Day (Aug 15)'],8:[],9:[],10:['Deepavali (varies)'],11:['Christmas'] },
  NP:{ 0:['New Year (Bikram Sambat, mid-Apr)'],1:['Maha Shivaratri (varies)','National Democracy Day (Feb 19)'],2:['Ghode Jatra (Kathmandu)','Holi'],3:['Eid (varies)','Buddha Jayanti (May, varies)'],4:['Republic Day (May 29)'],5:[],6:[],7:['Teej (Aug/Sep)','Janai Purnima'],8:['Indra Jatra (Sep)','Constitution Day (Sep 20)'],9:['Dashain (Oct)','Tihar/Diwali (Oct/Nov)'],10:[],11:['Christmas (mainly tourist)'] },
  MM:{ 0:['Independence Day (Jan 4)'],1:['Union Day (Feb 12)'],2:['Armed Forces Day (Mar 27)'],3:['Thingyan Water Festival (Apr)','Burmese New Year'],4:['May Day','Full Moon Kason (May, Buddhist)'],5:[],6:[],7:['Waso/Buddhist Lent begins'],8:[],9:['Thadingyut Festival (Oct)'],10:['Tazaungdaing Festival (Nov)'],11:['National Day (Nov 27)','Christmas'] },
  CY:{ 0:['New Year\'s Day','Epiphany (Jan 6)'],1:[],2:['Greek Independence Day (Mar 25)'],3:['Cyprus National Day (Apr 1)','Good Friday','Easter Monday'],4:['Labour Day (May 1)'],5:['Whit Monday (Jun 15)'],6:[],7:['Assumption (Aug 15)'],8:[],9:['Cyprus Independence Day (Oct 1)','Ohi Day (Oct 28)'],10:[],11:['Christmas (Dec 25)','Boxing Day (Dec 26)'] },
  LU:{ 0:['New Year\'s Day'],1:['Carnival (Feb 9)'],2:[],3:['Easter Monday (Apr 1)'],4:['Labour Day (May 1)','Europe Day (May 9)','Ascension (May 19)'],5:[],6:['National Day (Jun 23)'],7:['Assumption (Aug 15)'],8:[],9:[],10:['All Saints Day (Nov 1)'],11:['Christmas (Dec 25)','Boxing Day (Dec 26)'] },
  LT:{ 0:['New Year\'s Day'],1:['Independence Day (Feb 16)'],2:['Independence Restoration Day (Mar 11)'],3:['Easter Sunday (Apr 1)','Easter Monday (Apr 4)'],4:['Labour Day (May 1)'],5:[],6:['St. John\'s Day (Jun 24)','Statehood Day (Jul 6)'],7:['Assumption (Aug 15)'],8:[],9:[],10:['All Saints Day (Nov 1)','Souls Day (Nov 2)'],11:['Christmas (Dec 25)','Boxing Day (Dec 26)'] },
  LV:{ 0:['New Year\'s Day'],1:[],2:[],3:['Easter Sunday (Apr 1)','Easter Monday (Apr 4)'],4:['Labour Day (May 1)','Restoration of Independence (May 4)'],5:[],6:['Midsummer Eve (Jun 23)','Midsummer Day (Jun 24)'],7:[],8:[],9:[],10:['Proclamation Day (Nov 18)'],11:['Christmas (Dec 25)','Boxing Day (Dec 26)','New Year\'s Eve (Dec 31)'] },
  EE:{ 0:['New Year\'s Day'],1:['Independence Day (Feb 24)'],2:[],3:['Good Friday (Apr 1)','Easter Sunday (Apr 4)'],4:['Labour Day (May 1)'],5:[],6:['Victory Day (Jun 23)','Midsummer Day (Jun 24)'],7:['Restoration of Independence (Aug 20)'],8:[],9:[],10:[],11:['Christmas (Dec 25)','Boxing Day (Dec 26)'] },
  SI:{ 0:['New Year\'s Day (Jan 1-2)'],1:['Preseren Day (Feb 8)'],2:[],3:['Easter Sunday (Apr 1)','Uprising against Occupation (Apr 28)'],4:['Labour Day (May 1-2)'],5:[],6:['Statehood Day (Jun 25)'],7:['Assumption (Aug 15)'],8:[],9:['Reformation Day (Oct 31)','All Saints Day (Nov 1)'],10:[],11:['Christmas (Dec 25)','Independence Day (Dec 26)'] },
  SK:{ 0:['New Year\'s Day / Slovak Statehood (Jan 1)','Epiphany (Jan 6)'],1:[],2:[],3:['Easter Friday (Apr 1)','Easter Monday (Apr 4)'],4:['Labour Day (May 1)','VE Day (May 8)'],5:[],6:['Cyril and Methodius Day (Jul 5)'],7:['SNP Anniversary (Aug 29)'],8:['Constitution Day (Sep 1)'],9:[],10:['All Saints Day (Nov 1)','Struggle for Freedom (Nov 17)'],11:['Christmas Eve (Dec 24)','Christmas (Dec 25)','St. Stephen (Dec 26)'] },
  HR:{ 0:['New Year\'s Day','Epiphany (Jan 6)'],1:[],2:[],3:['Easter Sunday (Apr 1)','Easter Monday (Apr 4)'],4:['Labour Day (May 1)'],5:['Anti-Fascist Struggle Day (Jun 22)','Statehood Day (Jun 25)'],6:[],7:['Victory Day (Aug 5)','Assumption (Aug 15)'],8:[],9:['Independence Day (Oct 8)','All Saints Day (Nov 1)','Remembrance Day (Nov 18)'],10:[],11:['Christmas (Dec 25)','St. Stephen (Dec 26)'] },
  MK:{ 0:['New Year\'s Day','Orthodox Christmas (Jan 7)'],1:[],2:[],3:['Easter Sunday (Apr 1)'],4:['Labour Day (May 1)','Saints Cyril and Methodius Day (May 24)'],5:[],6:[],7:['Ilinden Day (Aug 2)'],8:['Independence Day (Sep 8)'],9:['Day of the Macedonian Revolutionary Struggle (Oct 11)'],10:[],11:['St. Clement of Ohrid Day (Dec 8)','Christmas (Dec 25)'] },
  ME:{ 0:['New Year\'s Day (Jan 1-2)','Orthodox Christmas (Jan 7-8)'],1:[],2:[],3:['Good Friday (Apr 1)','Orthodox Easter (Apr 22)'],4:['Labour Day (May 1-2)','Independence Day (May 21)'],5:[],6:['Statehood Day (Jul 13)'],7:[],8:[],9:[],10:[],11:['Christmas (Dec 25)'] },
  KZ:{ 0:['New Year (Jan 1-2)','Orthodox Christmas (Jan 7)'],1:[],2:['International Women\'s Day (Mar 8)','Nowruz (Mar 21-22)'],3:[],4:['Kazakhstan People\'s Unity Day (May 1)','Defender of the Fatherland Day (May 7)','Victory Day (May 9)'],5:[],6:['Capital City Day (Jul 6)'],7:['Constitution Day (Aug 30)'],8:[],9:[],10:[],11:['Independence Day (Dec 16)'] },
  UZ:{ 0:['New Year\'s Day'],1:[],2:['International Women\'s Day (Mar 8)','Nowruz (Mar 21)'],3:[],4:['Labour Day (May 1)','Victory Day (May 9)'],5:[],6:[],7:['Independence Day (Sep 1)'],8:[],9:['Teachers Day (Oct 1)'],10:[],11:['Constitution Day (Dec 8)'] },
  MN:{ 0:['New Year (Jan 1-3)'],1:[],2:['International Women\'s Day (Mar 8)'],3:[],4:['Labour Day (May 1)'],5:['Children\'s Day (Jun 1)'],6:['Naadam (Jul 11-15, National Festival)'],7:[],8:[],9:[],10:[],11:['Constitution Day (Nov 26)','Mongolian New Year (Dec 29, varies)'] },
  ZW:{ 0:['New Year\'s Day'],1:['Robert Mugabe National Youth Day (Feb 21)'],2:[],3:['Good Friday (Apr 1)','Easter Monday (Apr 4)','Independence Day (Apr 18)'],4:['Workers Day (May 1)'],5:[],6:[],7:['Heroes Day (Aug 11)'],8:[],9:[],10:[],11:['Christmas (Dec 22)','Christmas Day (Dec 25)','Boxing Day (Dec 26)'] },
  CR:{ 0:['New Year\'s Day'],1:['St. Joseph\'s Day (Mar 19)'],2:[],3:['Good Friday (Apr 1)'],4:['Labour Day (May 1)'],5:[],6:['Annexation of Guanacaste (Jul 25)'],7:[],8:['Independence Day (Sep 15)'],9:['Columbus Day (Oct 12)'],10:[],11:['Immaculate Conception (Dec 8)','Christmas (Dec 25)'] },
  UY:{ 0:['New Year\'s Day','Epiphany (Jan 6)'],1:[],2:[],3:['Easter Thursday (Apr 1)'],4:['Labour Day (May 1)','Battle of Las Piedras (May 18)'],5:['Artigas Day (Jun 19)'],6:['Constitution Day (Jul 18)','Independence Day (Aug 25)'],7:[],8:[],9:['Columbus Day (Oct 12)','All Souls Day (Nov 2)'],10:[],11:['Immaculate Conception (Dec 8)','Christmas (Dec 25)'] },
  PY:{ 0:['New Year\'s Day'],1:['Heroes Day (Mar 1)'],2:[],3:['Easter Thursday (Apr 1)'],4:['Labour Day (May 1)','Independence Days (May 14-15)'],5:['Chaco Peace (Jun 12)'],6:[],7:['Founding of Asuncion (Aug 6)'],8:['Battle of Boqueron (Sep 29)'],9:[],10:['All Saints Day (Nov 1)','Immaculate Conception (Dec 8)'],11:['Christmas (Dec 25)'] },
  DO:{ 0:['New Year\'s Day','Epiphany (Jan 6)','Our Lady of Altagracia (Jan 21)','Duarte Day (Jan 26)'],1:['Independence Day (Feb 27)'],2:[],3:['Good Friday (Apr 1)'],4:['Labour Day (May 1)'],5:[],6:[],7:['Restoration Day (Aug 16)'],8:['Our Lady of Mercy (Sep 24)'],9:['Columbus Day (Oct 12)'],10:['All Saints Day (Nov 6)'],11:['Christmas (Dec 25)'] },
};

// Budget traveler cost estimates (approximate USD) for cost-of-living tooltip
// hostel=$/night, meal=$/meal, transport=$/day, coffee=$, beer=$
const COST_DETAILS = {
  AR: { hostel:12, meal:4,  transport:2,  coffee:2, beer:2,  note:'Official + unofficial exchange rates create dual pricing' },
  AU: { hostel:28, meal:14, transport:6,  coffee:4, beer:8,  note:'Food and accommodation expensive; varies widely by city' },
  CA: { hostel:30, meal:14, transport:8,  coffee:4, beer:7,  note:'Vancouver and Toronto are among the priciest cities' },
  CN: { hostel:10, meal:3,  transport:2,  coffee:3, beer:1,  note:'Very affordable; tier-1 cities (Shanghai/Beijing) cost more' },
  CO: { hostel:10, meal:4,  transport:2,  coffee:1, beer:2,  note:'Excellent value; Bogotá pricier than smaller cities' },
  DE: { hostel:25, meal:10, transport:9,  coffee:3, beer:4,  note:'Berlin cheaper than Munich; mid-range by European standards' },
  EG: { hostel:8,  meal:3,  transport:1,  coffee:1, beer:2,  note:'Very affordable; tourist areas may charge inflated prices' },
  ES: { hostel:20, meal:9,  transport:5,  coffee:2, beer:3,  note:'Affordable by W. European standards; coast peaks in summer' },
  FR: { hostel:25, meal:13, transport:10, coffee:3, beer:6,  note:'Paris significantly more expensive than rural France' },
  GB: { hostel:28, meal:12, transport:10, coffee:4, beer:6,  note:'London is among the most expensive European cities' },
  GR: { hostel:18, meal:9,  transport:4,  coffee:3, beer:4,  note:'Santorini and Mykonos significantly pricier than mainland' },
  ID: { hostel:7,  meal:2,  transport:2,  coffee:1, beer:3,  note:'Bali tourist areas more expensive; rural Java very affordable' },
  IN: { hostel:6,  meal:2,  transport:1,  coffee:1, beer:2,  note:'One of the most budget-friendly destinations globally' },
  IT: { hostel:22, meal:10, transport:7,  coffee:2, beer:4,  note:'Venice and Amalfi Coast substantially above average' },
  JP: { hostel:18, meal:7,  transport:8,  coffee:4, beer:5,  note:'Surprisingly affordable for food; excellent cheap options' },
  MA: { hostel:10, meal:4,  transport:2,  coffee:1, beer:3,  note:'Riads offer good value; Marrakech pricier than Fes' },
  MX: { hostel:12, meal:4,  transport:3,  coffee:2, beer:2,  note:'Resort areas (Cancún, Los Cabos) much more expensive' },
  NG: { hostel:15, meal:5,  transport:3,  coffee:2, beer:2,  note:'Lagos is most expensive; infrastructure costs add up' },
  NZ: { hostel:28, meal:14, transport:7,  coffee:4, beer:8,  note:'Remote location keeps prices high for most imported goods' },
  PE: { hostel:10, meal:4,  transport:2,  coffee:1, beer:2,  note:'Lima is pricier; highlands and Amazon remain very affordable' },
  PK: { hostel:8,  meal:2,  transport:1,  coffee:1, beer:0,  note:'Alcohol availability limited; extremely budget-friendly' },
  PT: { hostel:18, meal:8,  transport:4,  coffee:1, beer:2,  note:'Lisbon/Porto have risen sharply; Alentejo more affordable' },
  RU: { hostel:15, meal:5,  transport:3,  coffee:2, beer:2,  note:'Card payments may be restricted; carry local cash' },
  TH: { hostel:9,  meal:3,  transport:3,  coffee:2, beer:3,  note:'Bangkok affordable; islands cost more in high season' },
  TR: { hostel:12, meal:4,  transport:3,  coffee:2, beer:4,  note:'High inflation; USD and EUR go far; prices vary widely' },
  US: { hostel:35, meal:14, transport:10, coffee:5, beer:7,  note:'NYC, SF, and LA rank among the most expensive globally' },
  VN: { hostel:7,  meal:2,  transport:2,  coffee:1, beer:1,  note:'Exceptional budget destination; street food is outstanding' },
  ZA: { hostel:15, meal:5,  transport:4,  coffee:2, beer:3,  note:'Cape Town pricier; well-developed tourist infrastructure' },
  MY: { hostel:8,  meal:2,  transport:2,  coffee:1, beer:2,  note:'Kuala Lumpur affordable; beach resorts slightly pricier' },
  KH: { hostel:6,  meal:2,  transport:2,  coffee:1, beer:1,  note:'One of SE Asia cheapest; Siem Reap slightly pricier for tourists' },
  LA: { hostel:7,  meal:2,  transport:3,  coffee:1, beer:1,  note:'Very affordable; remote areas require extra transport budget' },
  MM: { hostel:8,  meal:2,  transport:3,  coffee:1, beer:1,  note:'Check travel advisories; cash economy, limited ATMs outside cities' },
  LK: { hostel:8,  meal:3,  transport:3,  coffee:1, beer:3,  note:'Beautiful island; tourism prices recovering post-2022 crisis' },
  NP: { hostel:5,  meal:2,  transport:2,  coffee:1, beer:1,  note:'Trekking permits add cost; Kathmandu valley very affordable' },
  KE: { hostel:12, meal:4,  transport:4,  coffee:2, beer:2,  note:'Safari lodges premium; Nairobi mid-range; coast affordable' },
  TZ: { hostel:10, meal:4,  transport:4,  coffee:2, beer:2,  note:'Zanzibar pricier; mainland and northern circuit budget-friendly' },
  GH: { hostel:10, meal:3,  transport:3,  coffee:2, beer:2,  note:'Accra most expensive; one of West Africa more accessible destinations' },
  CL: { hostel:16, meal:7,  transport:5,  coffee:3, beer:3,  note:'Most expensive in South America; Santiago particularly pricey' },
  EC: { hostel:10, meal:4,  transport:3,  coffee:2, beer:2,  note:'Uses USD; Galapagos very expensive; mainland excellent value' },
  CU: { hostel:15, meal:6,  transport:3,  coffee:2, beer:1,  note:'Dual currency system; card payments limited; bring cash' },
  CZ: { hostel:18, meal:7,  transport:5,  coffee:3, beer:3,  note:'Prague one of more expensive EU cities; regions much cheaper' },
  PL: { hostel:15, meal:5,  transport:4,  coffee:3, beer:2,  note:'Warsaw and Krakow excellent value by EU standards' },
  HU: { hostel:14, meal:5,  transport:4,  coffee:3, beer:2,  note:'Budapest one of Europe best value capitals; great thermal baths' },
  // New countries
  AE: { hostel:45, meal:12, transport:6,  coffee:5, beer:12, note:'Alcohol only in licensed venues; Dubai more expensive than Abu Dhabi' },
  BR: { hostel:12, meal:4,  transport:3,  coffee:2, beer:3,  note:'Rio and SP most expensive; Northeast coast very affordable; dynamic exchange rate' },
  KR: { hostel:22, meal:6,  transport:3,  coffee:5, beer:4,  note:'Seoul pricier; excellent subway system keeps transport cheap; street food outstanding value' },
  PH: { hostel:8,  meal:2,  transport:2,  coffee:2, beer:1,  note:'Islands cost more due to ferry/flight hopping; Manila mid-range; Palawan budget-friendly' },
  SG: { hostel:30, meal:8,  transport:3,  coffee:5, beer:10, note:'One of Asia\'s most expensive cities; excellent MRT keeps transport affordable' },
};

// Passport nationalities available in the visa selector
// Keys must be ISO-2 codes; 'DE' represents all Schengen / EU passports here
const PASSPORT_NATIONALITIES = {
  US:'🇺🇸 United States',
  GB:'🇬🇧 United Kingdom',
  CA:'🇨🇦 Canada',
  AU:'🇦🇺 Australia',
  NZ:'🇳🇿 New Zealand',
  IE:'🇮🇪 Ireland',
  DE:'🇩🇪 Germany',
  FR:'🇫🇷 France',
  IT:'🇮🇹 Italy',
  ES:'🇪🇸 Spain',
  PT:'🇵🇹 Portugal',
  NL:'🇳🇱 Netherlands',
  BE:'🇧🇪 Belgium',
  AT:'🇦🇹 Austria',
  CH:'🇨🇭 Switzerland',
  SE:'🇸🇪 Sweden',
  NO:'🇳🇴 Norway',
  DK:'🇩🇰 Denmark',
  FI:'🇫🇮 Finland',
  PL:'🇵🇱 Poland',
  CZ:'🇨🇿 Czechia',
  GR:'🇬🇷 Greece',
  JP:'🇯🇵 Japan',
  KR:'🇰🇷 South Korea',
  SG:'🇸🇬 Singapore',
  CN:'🇨🇳 China',
  IN:'🇮🇳 India',
  BR:'🇧🇷 Brazil',
  ZA:'🇿🇦 South Africa',
  IL:'🇮🇱 Israel',
};

// Visa requirements per destination × passport nationality
// t: 'free'=visa-free  'eta'=electronic auth  'evisa'=online visa  'voa'=on arrival  'req'=embassy required  'banned'=entry refused/banned
// d: max stay in days (0=variable/long-term)   c: approximate cost in USD
const VISA_DATA = {
  AR: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'free',d:90,c:0},  CN:{t:'free',d:30,c:0},  BR:{t:'free',d:90,c:0} },
  AU: { US:{t:'eta',d:365,c:13}, GB:{t:'free',d:365,c:0}, DE:{t:'free',d:365,c:0}, CA:{t:'eta',d:365,c:13}, JP:{t:'eta',d:365,c:13}, NZ:{t:'free',d:0,c:0},   ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   CN:{t:'req',d:0,c:0},   BR:{t:'eta',d:365,c:13} },
  CA: { US:{t:'free',d:180,c:0}, GB:{t:'eta',d:180,c:5},  DE:{t:'eta',d:180,c:5},  AU:{t:'eta',d:180,c:5},  JP:{t:'eta',d:180,c:5},  NZ:{t:'eta',d:180,c:5},  ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   CN:{t:'req',d:0,c:0},   BR:{t:'req',d:0,c:0} },
  CN: { US:{t:'req',d:0,c:185},  GB:{t:'free',d:15,c:0},  DE:{t:'free',d:15,c:0},  AU:{t:'free',d:15,c:0},  CA:{t:'req',d:0,c:185},  JP:{t:'req',d:0,c:185},  NZ:{t:'free',d:15,c:0},  ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   BR:{t:'free',d:15,c:0} },
  CO: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'req',d:0,c:0},   CN:{t:'free',d:90,c:0},  BR:{t:'free',d:90,c:0} },
  DE: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   CN:{t:'req',d:0,c:0},   BR:{t:'free',d:90,c:0} },
  EG: { US:{t:'evisa',d:30,c:25},GB:{t:'evisa',d:30,c:25},DE:{t:'evisa',d:30,c:25},AU:{t:'evisa',d:30,c:25},CA:{t:'evisa',d:30,c:25},JP:{t:'evisa',d:30,c:25},NZ:{t:'evisa',d:30,c:25},ZA:{t:'evisa',d:30,c:25},IN:{t:'evisa',d:30,c:25},CN:{t:'free',d:30,c:0},  BR:{t:'evisa',d:30,c:25} },
  ES: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   CN:{t:'req',d:0,c:0},   BR:{t:'free',d:90,c:0} },
  FR: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   CN:{t:'req',d:0,c:0},   BR:{t:'free',d:90,c:0} },
  GB: { US:{t:'eta',d:180,c:13}, DE:{t:'eta',d:180,c:13}, AU:{t:'eta',d:180,c:13}, CA:{t:'eta',d:180,c:13}, JP:{t:'eta',d:180,c:13}, NZ:{t:'eta',d:180,c:13}, ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   CN:{t:'req',d:0,c:0},   BR:{t:'req',d:0,c:0} },
  GR: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   CN:{t:'req',d:0,c:0},   BR:{t:'free',d:90,c:0} },
  ID: { US:{t:'free',d:30,c:0},  GB:{t:'free',d:30,c:0},  DE:{t:'free',d:30,c:0},  AU:{t:'free',d:30,c:0},  CA:{t:'free',d:30,c:0},  JP:{t:'free',d:30,c:0},  NZ:{t:'free',d:30,c:0},  ZA:{t:'free',d:30,c:0},  IN:{t:'free',d:30,c:0},  CN:{t:'free',d:30,c:0},  BR:{t:'free',d:30,c:0} },
  IN: { US:{t:'evisa',d:60,c:25},GB:{t:'evisa',d:60,c:25},DE:{t:'evisa',d:60,c:25},AU:{t:'evisa',d:60,c:25},CA:{t:'evisa',d:60,c:25},JP:{t:'evisa',d:60,c:25},NZ:{t:'evisa',d:60,c:25},ZA:{t:'evisa',d:60,c:25},CN:{t:'req',d:0,c:0},  BR:{t:'evisa',d:60,c:25} },
  IT: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   CN:{t:'req',d:0,c:0},   BR:{t:'free',d:90,c:0} },
  JP: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   CN:{t:'req',d:0,c:0},   BR:{t:'free',d:90,c:0} },
  MA: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'req',d:0,c:0},   CN:{t:'free',d:90,c:0},  BR:{t:'free',d:90,c:0} },
  MX: { US:{t:'free',d:180,c:0}, GB:{t:'free',d:180,c:0}, DE:{t:'free',d:180,c:0}, AU:{t:'free',d:180,c:0}, CA:{t:'free',d:180,c:0}, JP:{t:'free',d:180,c:0}, NZ:{t:'free',d:180,c:0}, ZA:{t:'free',d:180,c:0}, IN:{t:'free',d:180,c:0}, CN:{t:'free',d:180,c:0}, BR:{t:'free',d:180,c:0} },
  NG: { US:{t:'evisa',d:90,c:100},GB:{t:'evisa',d:90,c:100},DE:{t:'evisa',d:90,c:100},AU:{t:'evisa',d:90,c:100},CA:{t:'evisa',d:90,c:100},JP:{t:'evisa',d:90,c:100},NZ:{t:'evisa',d:90,c:100},ZA:{t:'req',d:0,c:0},IN:{t:'req',d:0,c:0},CN:{t:'free',d:30,c:0},BR:{t:'evisa',d:90,c:100} },
  NZ: { US:{t:'eta',d:90,c:14},  GB:{t:'eta',d:90,c:14},  DE:{t:'eta',d:90,c:14},  CA:{t:'eta',d:90,c:14},  JP:{t:'eta',d:90,c:14},  AU:{t:'free',d:0,c:0},   ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   CN:{t:'req',d:0,c:0},   BR:{t:'req',d:0,c:0} },
  PE: { US:{t:'free',d:183,c:0}, GB:{t:'free',d:183,c:0}, DE:{t:'free',d:183,c:0}, AU:{t:'free',d:183,c:0}, CA:{t:'free',d:183,c:0}, JP:{t:'free',d:183,c:0}, NZ:{t:'free',d:183,c:0}, ZA:{t:'free',d:90,c:0},  IN:{t:'req',d:0,c:0},   CN:{t:'free',d:90,c:0},  BR:{t:'free',d:183,c:0} },
  PK: { US:{t:'evisa',d:30,c:75},GB:{t:'evisa',d:30,c:75},DE:{t:'evisa',d:30,c:75},AU:{t:'evisa',d:30,c:75},CA:{t:'evisa',d:30,c:75},JP:{t:'evisa',d:30,c:75},NZ:{t:'evisa',d:30,c:75},ZA:{t:'evisa',d:30,c:75},IN:{t:'req',d:0,c:0},CN:{t:'free',d:90,c:0},BR:{t:'evisa',d:30,c:75}, IL:{t:'banned',d:0,c:0} },
  PT: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   CN:{t:'req',d:0,c:0},   BR:{t:'free',d:90,c:0} },
  RU: { US:{t:'req',d:0,c:0},    GB:{t:'req',d:0,c:0},    DE:{t:'req',d:0,c:0},    AU:{t:'req',d:0,c:0},    CA:{t:'req',d:0,c:0},    JP:{t:'req',d:0,c:0},    NZ:{t:'req',d:0,c:0},    ZA:{t:'evisa',d:30,c:40}, IN:{t:'evisa',d:30,c:40}, CN:{t:'free',d:15,c:0}, BR:{t:'free',d:90,c:0} },
  TH: { US:{t:'free',d:60,c:0},  GB:{t:'free',d:60,c:0},  DE:{t:'free',d:60,c:0},  AU:{t:'free',d:60,c:0},  CA:{t:'free',d:60,c:0},  JP:{t:'free',d:60,c:0},  NZ:{t:'free',d:60,c:0},  ZA:{t:'free',d:60,c:0},  IN:{t:'free',d:30,c:0},  CN:{t:'free',d:30,c:0},  BR:{t:'free',d:60,c:0} },
  TR: { US:{t:'evisa',d:90,c:50},GB:{t:'evisa',d:90,c:32},DE:{t:'free',d:90,c:0},  AU:{t:'evisa',d:90,c:50},CA:{t:'evisa',d:90,c:60},JP:{t:'free',d:90,c:0},  NZ:{t:'evisa',d:90,c:50},ZA:{t:'evisa',d:90,c:50},IN:{t:'evisa',d:90,c:50},CN:{t:'free',d:30,c:0},  BR:{t:'free',d:90,c:0} },
  US: { GB:{t:'eta',d:90,c:21},  DE:{t:'eta',d:90,c:21},  AU:{t:'eta',d:90,c:21},  CA:{t:'free',d:180,c:0}, JP:{t:'eta',d:90,c:21},  NZ:{t:'eta',d:90,c:21},  ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},   CN:{t:'req',d:0,c:0},   BR:{t:'eta',d:90,c:21} },
  VN: { US:{t:'evisa',d:90,c:25},GB:{t:'evisa',d:90,c:25},DE:{t:'evisa',d:90,c:25},AU:{t:'evisa',d:90,c:25},CA:{t:'evisa',d:90,c:25},JP:{t:'evisa',d:90,c:25},NZ:{t:'evisa',d:90,c:25},ZA:{t:'evisa',d:90,c:25},IN:{t:'evisa',d:90,c:25},CN:{t:'evisa',d:90,c:25},BR:{t:'evisa',d:90,c:25} },
  ZA: { US:{t:'free',d:30,c:0},  GB:{t:'free',d:30,c:0},  DE:{t:'free',d:30,c:0},  AU:{t:'free',d:30,c:0},  CA:{t:'free',d:30,c:0},  JP:{t:'free',d:30,c:0},  NZ:{t:'free',d:30,c:0},  IN:{t:'req',d:0,c:0},   CN:{t:'free',d:30,c:0},  BR:{t:'free',d:30,c:0} },
  // Malaysia bans Israeli passport holders; IL entry explicitly banned.
  MY: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'banned',d:0,c:0} },
  KH: { US:{t:'evisa',d:30,c:30}, GB:{t:'evisa',d:30,c:30}, DE:{t:'evisa',d:30,c:30}, AU:{t:'evisa',d:30,c:30}, CA:{t:'evisa',d:30,c:30}, JP:{t:'free',d:30,c:0}, NZ:{t:'evisa',d:30,c:30}, ZA:{t:'evisa',d:30,c:30}, IN:{t:'evisa',d:30,c:30}, CN:{t:'free',d:30,c:0}, BR:{t:'evisa',d:30,c:30}, IL:{t:'evisa',d:30,c:30} },
  LA: { US:{t:'voa',d:30,c:35}, GB:{t:'voa',d:30,c:35}, DE:{t:'voa',d:30,c:35}, AU:{t:'voa',d:30,c:35}, CA:{t:'voa',d:30,c:35}, JP:{t:'free',d:15,c:0}, NZ:{t:'voa',d:30,c:35}, ZA:{t:'voa',d:30,c:35}, IN:{t:'voa',d:30,c:35}, CN:{t:'free',d:15,c:0}, BR:{t:'voa',d:30,c:35}, IL:{t:'voa',d:30,c:35} },
  MM: { US:{t:'evisa',d:28,c:50}, GB:{t:'evisa',d:28,c:50}, DE:{t:'evisa',d:28,c:50}, AU:{t:'evisa',d:28,c:50}, CA:{t:'evisa',d:28,c:50}, JP:{t:'free',d:30,c:0}, NZ:{t:'evisa',d:28,c:50}, ZA:{t:'evisa',d:28,c:50}, IN:{t:'evisa',d:28,c:50}, CN:{t:'free',d:30,c:0}, BR:{t:'evisa',d:28,c:50}, IL:{t:'evisa',d:28,c:50} },
  LK: { US:{t:'evisa',d:30,c:20}, GB:{t:'evisa',d:30,c:20}, DE:{t:'evisa',d:30,c:20}, AU:{t:'evisa',d:30,c:20}, CA:{t:'evisa',d:30,c:20}, JP:{t:'evisa',d:30,c:20}, NZ:{t:'evisa',d:30,c:20}, ZA:{t:'evisa',d:30,c:20}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'evisa',d:30,c:20}, IL:{t:'evisa',d:30,c:20} },
  NP: { US:{t:'voa',d:90,c:30}, GB:{t:'voa',d:90,c:30}, DE:{t:'voa',d:90,c:30}, AU:{t:'voa',d:90,c:30}, CA:{t:'voa',d:90,c:30}, JP:{t:'voa',d:90,c:30}, NZ:{t:'voa',d:90,c:30}, ZA:{t:'voa',d:90,c:30}, IN:{t:'free',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'voa',d:90,c:30}, IL:{t:'voa',d:90,c:30} },
  KE: { US:{t:'evisa',d:90,c:52}, GB:{t:'evisa',d:90,c:52}, DE:{t:'evisa',d:90,c:52}, AU:{t:'evisa',d:90,c:52}, CA:{t:'evisa',d:90,c:52}, JP:{t:'evisa',d:90,c:52}, NZ:{t:'evisa',d:90,c:52}, ZA:{t:'free',d:90,c:0}, IN:{t:'evisa',d:90,c:52}, CN:{t:'evisa',d:90,c:52}, BR:{t:'evisa',d:90,c:52}, IL:{t:'evisa',d:90,c:52} },
  TZ: { US:{t:'evisa',d:90,c:50}, GB:{t:'evisa',d:90,c:50}, DE:{t:'evisa',d:90,c:50}, AU:{t:'evisa',d:90,c:50}, CA:{t:'evisa',d:90,c:50}, JP:{t:'evisa',d:90,c:50}, NZ:{t:'evisa',d:90,c:50}, ZA:{t:'free',d:90,c:0}, IN:{t:'evisa',d:90,c:50}, CN:{t:'evisa',d:90,c:50}, BR:{t:'evisa',d:90,c:50}, IL:{t:'evisa',d:90,c:50} },
  GH: { US:{t:'req',d:0,c:60}, GB:{t:'req',d:0,c:60}, DE:{t:'req',d:0,c:60}, AU:{t:'req',d:0,c:60}, CA:{t:'req',d:0,c:60}, JP:{t:'req',d:0,c:60}, NZ:{t:'req',d:0,c:60}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:60}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:60}, IL:{t:'req',d:0,c:60} },
  CL: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:90,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  EC: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'free',d:90,c:0}, CN:{t:'free',d:90,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  CU: { US:{t:'req',d:0,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'req',d:0,c:0} },
  CZ: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  PL: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  HU: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // New destination countries
  AE: { US:{t:'free',d:30,c:0},  GB:{t:'free',d:30,c:0},  DE:{t:'free',d:30,c:0},  AU:{t:'free',d:30,c:0},  CA:{t:'free',d:30,c:0},  JP:{t:'free',d:30,c:0},  NZ:{t:'free',d:30,c:0},  ZA:{t:'free',d:30,c:0},  IN:{t:'free',d:30,c:0},  CN:{t:'free',d:30,c:0},  BR:{t:'free',d:30,c:0} },
  BR: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'req',d:0,c:0},   JP:{t:'free',d:90,c:0},  NZ:{t:'req',d:0,c:0},   ZA:{t:'free',d:90,c:0},  IN:{t:'req',d:0,c:0},   CN:{t:'free',d:90,c:0} },
  KR: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:180,c:0}, JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'evisa',d:30,c:0}, CN:{t:'req',d:0,c:0},   BR:{t:'free',d:90,c:0} },
  PH: { US:{t:'free',d:30,c:0},  GB:{t:'free',d:30,c:0},  DE:{t:'free',d:30,c:0},  AU:{t:'free',d:30,c:0},  CA:{t:'free',d:30,c:0},  JP:{t:'free',d:30,c:0},  NZ:{t:'free',d:30,c:0},  ZA:{t:'free',d:30,c:0},  IN:{t:'free',d:30,c:0},  CN:{t:'free',d:30,c:0},  BR:{t:'free',d:30,c:0} },
  SG: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'free',d:30,c:0},  CN:{t:'free',d:30,c:0},  BR:{t:'free',d:90,c:0} },
  // Middle East & North Africa: includes IL:banned where entry is denied to Israeli passport holders
  SA: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'evisa',d:90,c:0}, IN:{t:'evisa',d:90,c:0}, CN:{t:'evisa',d:90,c:0}, BR:{t:'evisa',d:90,c:0}, IL:{t:'req',d:0,c:0} },
  JO: { US:{t:'voa',d:30,c:40},  GB:{t:'voa',d:30,c:40},  DE:{t:'voa',d:30,c:40},  AU:{t:'voa',d:30,c:40},  CA:{t:'voa',d:30,c:40},  JP:{t:'voa',d:30,c:40},  NZ:{t:'voa',d:30,c:40},  ZA:{t:'voa',d:30,c:40},  IN:{t:'voa',d:30,c:40},  CN:{t:'voa',d:30,c:40},  BR:{t:'voa',d:30,c:40},  IL:{t:'voa',d:30,c:40} },
  LB: { US:{t:'req',d:0,c:0},    GB:{t:'req',d:0,c:0},    DE:{t:'req',d:0,c:0},    AU:{t:'req',d:0,c:0},    CA:{t:'req',d:0,c:0},    JP:{t:'req',d:0,c:0},    NZ:{t:'req',d:0,c:0},    ZA:{t:'req',d:0,c:0},    IN:{t:'req',d:0,c:0},    CN:{t:'req',d:0,c:0},    BR:{t:'req',d:0,c:0},    IL:{t:'banned',d:0,c:0} },
  KW: { US:{t:'voa',d:90,c:0},   GB:{t:'voa',d:90,c:0},   DE:{t:'voa',d:90,c:0},   AU:{t:'voa',d:90,c:0},   CA:{t:'voa',d:90,c:0},   JP:{t:'voa',d:90,c:0},   NZ:{t:'voa',d:90,c:0},   ZA:{t:'req',d:0,c:0},    IN:{t:'voa',d:90,c:0},   CN:{t:'voa',d:90,c:0},   BR:{t:'voa',d:90,c:0},   IL:{t:'banned',d:0,c:0} },
  QA: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'evisa',d:90,c:0}, CN:{t:'evisa',d:90,c:0}, BR:{t:'free',d:90,c:0},  IL:{t:'req',d:0,c:0} },
  BH: { US:{t:'evisa',d:30,c:9}, GB:{t:'evisa',d:30,c:9}, DE:{t:'evisa',d:30,c:9}, AU:{t:'evisa',d:30,c:9}, CA:{t:'evisa',d:30,c:9}, JP:{t:'evisa',d:30,c:9}, NZ:{t:'evisa',d:30,c:9}, ZA:{t:'evisa',d:30,c:9}, IN:{t:'evisa',d:30,c:9}, CN:{t:'evisa',d:30,c:9}, BR:{t:'evisa',d:30,c:9}, IL:{t:'evisa',d:30,c:9} },
  // Oman opened limited tourism to Israelis post-2022, but no formal evisa exists for IL passports.
  // Israeli passport holders face practical entry restrictions; req is the accurate status.
  OM: { US:{t:'evisa',d:30,c:20},GB:{t:'evisa',d:30,c:20},DE:{t:'evisa',d:30,c:20},AU:{t:'evisa',d:30,c:20},CA:{t:'evisa',d:30,c:20},JP:{t:'evisa',d:30,c:20},NZ:{t:'evisa',d:30,c:20},ZA:{t:'evisa',d:30,c:20},IN:{t:'evisa',d:30,c:20},CN:{t:'evisa',d:30,c:20},BR:{t:'evisa',d:30,c:20},IL:{t:'req',d:0,c:0} },
  IR: { US:{t:'req',d:0,c:0},    GB:{t:'req',d:0,c:0},    DE:{t:'req',d:0,c:0},    AU:{t:'req',d:0,c:0},    CA:{t:'req',d:0,c:0},    JP:{t:'req',d:0,c:0},    NZ:{t:'req',d:0,c:0},    ZA:{t:'req',d:0,c:0},    IN:{t:'req',d:0,c:0},    CN:{t:'evisa',d:30,c:0}, BR:{t:'req',d:0,c:0},    IL:{t:'banned',d:0,c:0} },
  IQ: { US:{t:'voa',d:30,c:75},  GB:{t:'voa',d:30,c:75},  DE:{t:'voa',d:30,c:75},  AU:{t:'voa',d:30,c:75},  CA:{t:'voa',d:30,c:75},  JP:{t:'voa',d:30,c:75},  NZ:{t:'voa',d:30,c:75},  ZA:{t:'voa',d:30,c:75},  IN:{t:'voa',d:30,c:75},  CN:{t:'voa',d:30,c:75},  BR:{t:'voa',d:30,c:75},  IL:{t:'banned',d:0,c:0} },
  SY: { US:{t:'req',d:0,c:0},    GB:{t:'req',d:0,c:0},    DE:{t:'req',d:0,c:0},    AU:{t:'req',d:0,c:0},    CA:{t:'req',d:0,c:0},    JP:{t:'req',d:0,c:0},    NZ:{t:'req',d:0,c:0},    ZA:{t:'req',d:0,c:0},    IN:{t:'req',d:0,c:0},    CN:{t:'req',d:0,c:0},    BR:{t:'req',d:0,c:0},    IL:{t:'banned',d:0,c:0} },
  YE: { US:{t:'req',d:0,c:0},    GB:{t:'req',d:0,c:0},    DE:{t:'req',d:0,c:0},    AU:{t:'req',d:0,c:0},    CA:{t:'req',d:0,c:0},    JP:{t:'req',d:0,c:0},    NZ:{t:'req',d:0,c:0},    ZA:{t:'req',d:0,c:0},    IN:{t:'req',d:0,c:0},    CN:{t:'req',d:0,c:0},    BR:{t:'req',d:0,c:0},    IL:{t:'banned',d:0,c:0} },
  DZ: { US:{t:'req',d:0,c:0},    GB:{t:'req',d:0,c:0},    DE:{t:'req',d:0,c:0},    AU:{t:'req',d:0,c:0},    CA:{t:'req',d:0,c:0},    JP:{t:'req',d:0,c:0},    NZ:{t:'req',d:0,c:0},    ZA:{t:'req',d:0,c:0},    IN:{t:'req',d:0,c:0},    CN:{t:'req',d:0,c:0},    BR:{t:'req',d:0,c:0},    IL:{t:'banned',d:0,c:0} },
  LY: { US:{t:'req',d:0,c:0},    GB:{t:'req',d:0,c:0},    DE:{t:'req',d:0,c:0},    AU:{t:'req',d:0,c:0},    CA:{t:'req',d:0,c:0},    JP:{t:'req',d:0,c:0},    NZ:{t:'req',d:0,c:0},    ZA:{t:'req',d:0,c:0},    IN:{t:'req',d:0,c:0},    CN:{t:'req',d:0,c:0},    BR:{t:'req',d:0,c:0},    IL:{t:'banned',d:0,c:0} },
  BD: { US:{t:'voa',d:30,c:50},  GB:{t:'voa',d:30,c:50},  DE:{t:'voa',d:30,c:50},  AU:{t:'voa',d:30,c:50},  CA:{t:'voa',d:30,c:50},  JP:{t:'voa',d:30,c:50},  NZ:{t:'voa',d:30,c:50},  ZA:{t:'voa',d:30,c:50},  IN:{t:'voa',d:30,c:50},  CN:{t:'voa',d:30,c:50},  BR:{t:'voa',d:30,c:50},  IL:{t:'banned',d:0,c:0} },
  BN: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'free',d:90,c:0},  CN:{t:'free',d:90,c:0},  BR:{t:'free',d:90,c:0},  IL:{t:'banned',d:0,c:0} },
  // IL (Israel) as destination: allows visitors from most countries
  IL: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'free',d:90,c:0},  CN:{t:'evisa',d:30,c:0}, BR:{t:'free',d:90,c:0} },
  // Taiwan
  TW: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:14,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // Hong Kong SAR
  HK: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:180,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:14,c:0}, CN:{t:'free',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // Schengen / EEA countries: visa-free 90/180 days for US/GB/AU/CA/JP/NZ/BR; ZA/IN/CN typically require visa; IL visa-free
  IS: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  NO: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  SE: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  NL: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  BE: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  AT: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  CH: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  FI: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  DK: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  IE: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:0,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // Eastern Europe
  UA: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'evisa',d:30,c:65}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  RS: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  SK: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  EE: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  LV: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  LT: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  HR: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  SI: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // South Caucasus
  GE: { US:{t:'free',d:365,c:0}, GB:{t:'free',d:365,c:0}, DE:{t:'free',d:365,c:0}, AU:{t:'free',d:365,c:0}, CA:{t:'free',d:365,c:0}, JP:{t:'free',d:365,c:0}, NZ:{t:'free',d:365,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'free',d:365,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:365,c:0}, IL:{t:'free',d:365,c:0} },
  AM: { US:{t:'free',d:180,c:0}, GB:{t:'free',d:180,c:0}, DE:{t:'free',d:180,c:0}, AU:{t:'free',d:180,c:0}, CA:{t:'free',d:180,c:0}, JP:{t:'free',d:180,c:0}, NZ:{t:'free',d:180,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'free',d:180,c:0}, CN:{t:'free',d:90,c:0}, BR:{t:'free',d:180,c:0}, IL:{t:'free',d:180,c:0} },
  AZ: { US:{t:'evisa',d:30,c:26}, GB:{t:'evisa',d:30,c:26}, DE:{t:'evisa',d:30,c:26}, AU:{t:'evisa',d:30,c:26}, CA:{t:'evisa',d:30,c:26}, JP:{t:'evisa',d:30,c:26}, NZ:{t:'evisa',d:30,c:26}, ZA:{t:'evisa',d:30,c:26}, IN:{t:'evisa',d:30,c:26}, CN:{t:'evisa',d:30,c:26}, BR:{t:'evisa',d:30,c:26}, IL:{t:'banned',d:0,c:0} },
  // South America
  UY: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'free',d:90,c:0}, CN:{t:'free',d:90,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  BO: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:90,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  PY: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:90,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // North Africa & East Africa
  TN: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'voa',d:30,c:0}, CN:{t:'free',d:90,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'req',d:0,c:0} },
  ET: { US:{t:'evisa',d:30,c:52}, GB:{t:'evisa',d:30,c:52}, DE:{t:'evisa',d:30,c:52}, AU:{t:'evisa',d:30,c:52}, CA:{t:'evisa',d:30,c:52}, JP:{t:'evisa',d:30,c:52}, NZ:{t:'evisa',d:30,c:52}, ZA:{t:'evisa',d:30,c:52}, IN:{t:'evisa',d:30,c:52}, CN:{t:'evisa',d:30,c:52}, BR:{t:'evisa',d:30,c:52}, IL:{t:'evisa',d:30,c:52} },
};

const MONTHS   = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const MONTHS_F = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ── Monthly climate data per country ────────────────────────────────────────
// temp: average °C by month (J–D), representative city / dominant travel region
// rain: average mm by month (J–D)
// Sources: World Meteorological Organisation, climate-data.org, Weather2Visit
const CD_CLIMATE = {
  AR: { temp:[24,23,21,17,14,11,10,11,13,16,19,22], rain:[92, 93,118,111,90, 62, 54, 67, 77, 95, 92, 98] },
  AU: { temp:[22,22,21,18,15,13,12,13,15,18,19,21], rain:[103,117,131,126,117,137,112, 81, 68, 79, 98,106] },
  BR: { temp:[28,28,27,26,24,22,21,22,23,24,26,27], rain:[136,122,130,129,96, 54, 41, 40, 54, 77, 95,137] },
  CA: { temp:[-5,-4, 1, 8,14,19,22,22,17,11, 4,-2], rain:[ 56, 51, 53, 66, 71, 81, 70, 74, 81, 76, 87, 67] },
  CN: { temp:[-3, 0, 6,13,20,25,28,26,21,14, 5,-1], rain:[  3,  5,  8, 20, 35, 78,185,160, 55, 22,  6,  3] },
  CO: { temp:[14,15,15,15,15,14,13,14,14,13,14,14], rain:[ 94, 99,127,177,112, 78, 77, 93,118,153,131, 91] },
  DE: { temp:[ 1, 2, 6,12,17,20,23,22,18,12, 6, 2], rain:[ 43, 36, 41, 44, 57, 68, 57, 57, 49, 47, 43, 54] },
  EG: { temp:[14,15,18,21,25,28,28,28,26,24,19,15], rain:[  3,  2,  2,  1,  0,  0,  0,  0,  0,  1,  2,  4] },
  ES: { temp:[ 5, 6,10,13,17,22,26,25,21,15, 9, 5], rain:[ 47, 42, 31, 34, 46, 23,  9, 10, 18, 41, 55, 57] },
  FR: { temp:[ 4, 5, 8,12,16,19,21,21,18,13, 8, 5], rain:[ 57, 45, 55, 46, 51, 54, 50, 51, 56, 56, 51, 63] },
  GB: { temp:[ 5, 5, 7,10,13,16,18,18,15,11, 8, 5], rain:[ 74, 51, 52, 37, 49, 54, 57, 74, 66, 73, 67, 78] },
  GR: { temp:[10,11,13,17,21,26,28,28,25,20,15,11], rain:[ 62, 44, 40, 23, 15,  6,  2,  4,  9, 42, 64, 71] },
  ID: { temp:[28,28,29,30,30,29,28,28,28,29,29,28], rain:[354,292,253,193,126, 88, 65, 64, 77,120,194,289] },
  IN: { temp:[14,16,22,29,34,35,32,31,29,26,20,15], rain:[ 25, 22, 17,  7, 13, 65,185,173,120, 14,  4,  8] },
  IT: { temp:[ 8, 9,11,14,18,23,25,25,23,18,13, 9], rain:[ 74, 62, 65, 74, 62, 47, 15, 27, 63,104,116, 93] },
  JP: { temp:[ 6, 7,10,15,19,23,27,28,24,18,13, 8], rain:[ 60, 56,108,125,137,168,153,168,210,197, 92, 51] },
  KR: { temp:[-3, 0, 5,12,17,21,25,26,21,14, 7, 0], rain:[ 24, 43, 45, 78, 88,138,393,270,158, 44, 53, 21] },
  MA: { temp:[12,13,15,17,19,22,24,25,23,20,16,13], rain:[ 56, 49, 44, 31, 17,  5,  0,  1,  7, 31, 59, 74] },
  MX: { temp:[15,16,18,19,19,18,17,17,17,16,15,14], rain:[  9,  8, 13, 21, 53,124,145,139,116, 55, 23, 15] },
  NG: { temp:[27,28,29,29,28,26,26,26,26,27,28,27], rain:[ 13, 27, 71,135,202,242,212, 82,162,196, 57, 13] },
  NZ: { temp:[19,19,18,15,12,10,10,10,12,14,16,18], rain:[ 79, 54, 90, 91,105,105, 95, 95, 80, 81,103,101] },
  PE: { temp:[22,22,21,20,18,17,16,15,15,17,18,20], rain:[  1,  0,  0,  0,  3, 11, 17, 13,  8,  1,  0,  1] },
  PH: { temp:[27,28,29,31,33,32,30,29,30,29,28,27], rain:[ 19, 11, 14, 22,130,254,432,430,357,225,144, 73] },
  PK: { temp:[19,21,25,29,32,33,32,31,30,29,25,21], rain:[ 12, 14, 23,  6, 11, 11, 79, 72, 15,  2,  2,  9] },
  PT: { temp:[11,12,14,16,19,22,25,25,23,19,15,11], rain:[113, 93, 69, 54, 44, 16,  3,  4, 29, 74,104,103] },
  RU: { temp:[-9,-9,-4, 4,11,16,18,17,12, 5,-2,-7], rain:[ 42, 38, 35, 36, 43, 58, 74, 71, 55, 57, 49, 49] },
  SG: { temp:[27,27,27,28,29,29,29,29,28,28,27,27], rain:[252,112,193,188,173,130,155,174,163,154,208,257] },
  TH: { temp:[27,29,31,33,33,31,30,30,30,30,28,27], rain:[ 10, 23, 35, 65,158,160,175,197,306,231, 57,  8] },
  TR: { temp:[ 5, 6, 8,12,17,21,24,24,21,16,12, 7], rain:[ 78, 67, 59, 46, 30, 22, 12,  9, 16, 39, 71,111] },
  US: { temp:[ 0, 1, 5,12,18,23,26,25,21,14, 8, 2], rain:[ 79, 78,112,102,102, 84, 88, 80, 91,100, 97, 99] },
  VN: { temp:[17,18,20,24,28,30,30,30,28,25,22,18], rain:[ 18, 27, 38, 75, 82,162,260,318,355,284, 85, 21] },
  AE: { temp:[18,19,23,27,31,34,35,36,33,29,24,20], rain:[  6, 20, 18,  7,  0,  0,  0,  0,  0,  1,  5, 11] },
  ZA: { temp:[23,23,21,19,14,11,11,13,17,20,21,23], rain:[113, 89, 77, 51, 20,  5,  4,  6, 24, 56,108,119] },
  MY: { temp:[28,29,29,29,29,28,28,28,28,28,27,28], rain:[158,157,212,265,199,131,129,156,187,251,258,191] },
  KH: { temp:[27,28,30,32,32,30,29,29,29,29,28,27], rain:[  6, 11, 38, 80,133,155,171,193,268,264,133, 47] },
  LA: { temp:[22,25,28,30,30,29,28,28,28,27,26,22], rain:[  5, 12, 28, 64,156,225,237,255,195, 98, 27,  7] },
  MM: { temp:[25,27,31,34,33,30,28,28,28,29,28,26], rain:[  5,  7, 10, 20, 51,186,556,529,366,166, 48,  8] },
  LK: { temp:[27,28,29,29,29,28,28,28,28,28,27,27], rain:[ 89, 69, 95,231,371,224,135,109,215,348,315,147] },
  NP: { temp:[10,12,16,20,24,25,24,24,23,20,15,10], rain:[ 15, 20, 27, 58,123,243,373,371,222,113, 22,  8] },
  KE: { temp:[22,23,23,22,21,19,18,18,19,22,22,22], rain:[ 60, 48, 89,211,175, 38, 17, 19, 29, 63,122, 96] },
  TZ: { temp:[30,29,28,26,25,24,23,24,25,28,29,30], rain:[ 64, 72,133,290,139, 34, 26, 30, 27, 50,119, 93] },
  GH: { temp:[27,28,28,27,27,26,25,25,26,27,27,27], rain:[ 18, 29, 54, 97,128,169, 72, 34, 56,118,100, 38] },
  CL: { temp:[20,19,17,14,11, 8, 8, 9,12,14,16,19], rain:[  0,  0,  1,  5, 24, 66, 67, 50, 24,  9,  3,  1] },
  EC: { temp:[15,15,15,15,15,14,14,14,14,14,14,14], rain:[ 58, 77,136,175,107, 37, 25, 28, 64,104, 89, 55] },
  CU: { temp:[22,23,24,25,26,27,28,28,27,26,24,22], rain:[ 68, 57, 46, 57, 97,164,125,132,150,171, 79, 58] },
  CZ: { temp:[ 0, 1, 5,10,15,18,21,20,17,11, 5, 1], rain:[ 21, 19, 24, 33, 55, 71, 71, 64, 48, 32, 23, 23] },
  PL: { temp:[-2,-1, 3, 9,14,17,20,20,16,10, 4, 0], rain:[ 32, 27, 27, 35, 46, 65, 70, 66, 50, 37, 39, 38] },
  HU: { temp:[ 1, 3, 8,14,19,22,24,24,20,14, 8, 2], rain:[ 31, 27, 28, 41, 56, 65, 56, 56, 47, 37, 46, 40] },
  CY: { temp:[12,13,15,19,24,29,33,33,30,25,19,14], rain:[ 60, 37, 30, 14,  8,  0,  0,  0,  0,  9, 46, 73] },
  IL: { temp:[12,13,16,20,24,27,29,30,28,25,20,14], rain:[137, 90, 60, 17,  3,  0,  0,  0,  0,  9, 46,112] },
  JO: { temp:[ 9,10,14,20,25,28,30,30,28,24,17,11], rain:[ 27, 24, 13,  4,  1,  0,  0,  0,  0,  3, 15, 22] },
  LB: { temp:[11,12,15,19,23,26,29,30,28,24,18,13], rain:[130, 98, 64, 20,  8,  1,  0,  0,  0,  4, 44,116] },
  BH: { temp:[17,18,22,27,31,34,36,36,34,30,24,19], rain:[  8,  8,  7,  2,  0,  0,  0,  0,  0,  0,  3, 12] },
  OM: { temp:[19,20,24,29,33,34,30,28,29,30,26,21], rain:[  9,  6,  5,  1,  0,  0,  0,  0,  0,  0,  1,  6] },
  KW: { temp:[13,15,20,27,33,38,42,42,39,33,23,15], rain:[  9,  8,  9,  3,  0,  0,  0,  0,  0,  0,  2,  8] },
  QA: { temp:[17,18,22,27,32,36,39,39,37,31,24,19], rain:[  8,  7,  8,  2,  0,  0,  0,  0,  0,  0,  1, 10] },
};

const LAYERS = {
  weather:  { name:'Weather',          emoji:'🌤', color:'#7EC8E3', levels:['Excellent','Good','Mixed','Harsh'] },
  safety:   { name:'Safety',           emoji:'🛡', color:'#5B9BD5', levels:['Very Safe','Moderate','Caution','Avoid'] },
  cost:     { name:'Cost',             emoji:'💰', color:'#C8A84B', levels:['Budget','Mid-range','Expensive','Premium'] },
  family:   { name:'Family',           emoji:'👨‍👩‍👧', color:'#B87FC4', levels:['Ideal','Suitable','Limited','Not Recommended'] },
  solo:     { name:'Solo Female',      emoji:'👩', color:'#E87AAF', levels:['Excellent','Good','Take Care','High Risk'] },
  remote:   { name:'Remote Work',      emoji:'💻', color:'#00B4D8', levels:['Excellent','Good','Adequate','Poor'] },
  internet: { name:'Internet',         emoji:'📶', color:'#29B6F6', levels:['Excellent','Good','Fair','Poor'] },
  corrupt:  { name:'Corruption',       emoji:'🏛', color:'#A07840', levels:['Clean','Minor','Moderate','Severe'] },
  health:   { name:'Health Risk',      emoji:'💊', color:'#D9607A', levels:['Low','Moderate','Elevated','High'] },
  crowds:   { name:'Overtourism',      emoji:'👁', color:'#8878C8', levels:['Uncrowded','Busy','Crowded','Saturated'] },
  disaster: { name:'Natural Disaster', emoji:'🌋', color:'#C06E3E', levels:['Low Risk','Some Risk','Moderate','High Risk'] },
  visa:     { name:'Visa Access',       emoji:'🛂', color:'#6898C0', levels:['Visa-free','Easy Access','Visa Required','Restricted'] },
  strength: { name:'Passport Strength', emoji:'✈', color:'#22d3ee', levels:['Open & Sunny','Visa-Free','Accessible','Restricted'] },
  lgbtq:    { name:'LGBTQ+',           emoji:'🏳️‍🌈', color:'#D055A8', levels:['Welcoming','Accepted','Hostile','Dangerous'] },
  beaches:  { name:'Public Beaches',   emoji:'🏖', color:'#2EC4B6', levels:['Excellent','Good','Limited','Poor'] },
  vaccines: { name:'Vaccines',         emoji:'💉', color:'#7888D8', levels:['None','Routine','Required','Extensive'] },
  road:     { name:'Road Safety',      emoji:'🛣', color:'#3D8B6E', levels:['Low Risk','Some Hazards','Caution','Dangerous'] },
  events:   { name:'Seasonal Events',  emoji:'🎪', color:'#f59e0b', levels:['Jan','Feb','Mar','All'] },
  kids:     { name:'Kid Friendly',     emoji:'👶', color:'#f9c74f', levels:['Excellent','Good','Fair','Limited'] },
  parks:    { name:'National Parks',   emoji:'🌲', color:'#52b788', levels:['Abundant','Good','Some','Few'] },
  cannabis: { name:'Cannabis Laws',   emoji:'🌿', color:'#4ade80', levels:['Legal','Medical/Decrim','Minor Penalties','Severe/Zero Tolerance'] },
  tipping:  { name:'Tipping Culture', emoji:'$',  color:'#10b981', levels:['No Tipping','Tip Optional','Tip Appreciated','Tipping Expected'] },
  nomad:    { name:'Nomad Score',     emoji:'💻', color:'#38bdf8', levels:['Excellent','Good','Fair','Poor'] },
  english:      { name:'English Proficiency', emoji:'🌐', color:'#6366f1', levels:['Very High','High','Moderate','Low'] },
  healthcare:   { name:'Healthcare Quality',  emoji:'🏥', color:'#ec4899', levels:['Excellent','Good','Fair','Poor'] },
  tapwater:     { name:'Tap Water Safety',    emoji:'💧', color:'#06b6d4', levels:['Safe','Mostly Safe','Use Bottled','Severely Unsafe'] },
  airquality:   { name:'Air Quality',         emoji:'🌫', color:'#84cc16', levels:['Good','Moderate','Unhealthy','Very Unhealthy'] },
  femalesafety: { name:'Female Solo Safety',  emoji:'👩', color:'#f472b6', levels:['Very Safe','Safe','Caution','High Caution'] },
  nightlife:    { name:'Nightlife & Social',  emoji:'🎉', color:'#a78bfa', levels:['World-class','Good','Moderate','Restricted'] },
  scam:         { name:'Scam Risk',           emoji:'⚠', color:'#fb923c', levels:['Minimal','Low','Moderate','High Risk'] },
  malaria:      { name:'Malaria & Mosquito Risk', emoji:'🦟', color:'#a3e635', levels:['No Risk','Low Risk','Moderate','High Risk'] },
  elevation:    { label:'🏔 Elevation / Terrain', icon:'🏔', cat:'terrain', desc:'OpenTopoMap topographic overlay showing elevation and terrain. Based on OpenStreetMap + SRTM data.' },
  // Pin overlay, not a 0-3 score layer: it has no `levels` and never enters activeLayers (toggleLayer keeps its
  // on/off state in _naVisitors), so the choropleth, glyph chips and Combined View ignore it. Data: data/visitors.json.
  visitors:     { name:'Visitors', emoji:'🌍', color:'#E0A84B', cat:'overlay', overlay:true, desc:'Where visitors to this site come from: one pin per country, sized by number of visits. Countries with fewer than 3 visits are hidden.' },
};

const DESCS = {
  weather: [
    "Clear skies and comfortable temperatures: ideal for outdoor exploration and long days on the road.",
    "Warm and mostly pleasant with occasional showers. Most activities remain fully accessible.",
    "Variable conditions: heat, humidity, or rain may affect comfort. Check local forecasts.",
    "Monsoon, extreme heat, polar cold, or active hurricane season. Check advisories and pack accordingly."
  ],
  safety: [
    "Low crime, stable government, reliable emergency services. Standard urban awareness applies.",
    "Generally safe with isolated concerns. Petty theft in tourist areas, political demonstrations possible.",
    "Elevated risk in some areas: violent crime, civil unrest, or unstable conditions. Research regions carefully.",
    "Serious safety concerns, armed conflict, or widespread violence. Government travel advisories in effect."
  ],
  cost: [
    "~$40–70/day covers a comfortable bed, good food, and local transport.",
    "~$80–150/day for mid-range travel. Budget options available with some effort.",
    "~$180–260/day. Budget travel is difficult: most prices are elevated.",
    "$300+/day. Among the most expensive destinations on the planet."
  ],
  family: [
    "Excellent infrastructure for families: child-friendly attractions, safe transport, quality accommodation.",
    "Suitable with planning: most destinations are family-friendly with minor limitations.",
    "Limited family facilities. Long journeys, heat, or safety concerns may challenge families.",
    "Not recommended for families with young children: safety risks, limited healthcare, or poor infrastructure."
  ],
  solo: [
    "Consistently rated safe and welcoming for solo women. Minimal awareness required.",
    "Generally safe with normal precautions. Dress codes or cultural norms vary by region.",
    "Significant awareness required: harassment reported, especially in crowded or rural areas.",
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
    "Serious health risks: malaria, yellow fever, dengue, cholera, or inadequate medical facilities. Prepare thoroughly."
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
    "Notable natural hazard risk: earthquakes, volcanoes, typhoons, or severe flooding in affected areas.",
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
    "Legal but unwelcoming in practice: discrimination common, limited legal protections. Public affection inadvisable.",
    "Criminalised, actively enforced. Real risk of arrest or harm. Serious advisory applies."
  ],
  beaches: [
    "Free, clean, publicly accessible, open to all travellers. Good facilities maintained.",
    "Good beaches accessible with modest facilities. Some private stretches but public options available.",
    "Beach access limited: privatisation, restricted areas, or infrastructure gaps.",
    "Beaches largely privatised, unsafe, prohibitively restricted, or destination is landlocked."
  ],
  vaccines: [
    "No specific vaccines required beyond routine immunisations.",
    "Routine vaccines plus Hepatitis A/B and Typhoid recommended for most travellers.",
    "Several vaccines required or strongly recommended: Yellow Fever, Meningitis, or Rabies. Confirm with a travel clinic.",
    "Extensive pre-travel vaccination schedule required. Yellow Fever certificate mandatory in some cases. Consult a specialist."
  ],
  road: [
    "Excellent road infrastructure with strong enforcement. Road fatalities among the lowest globally. Driving and motorbike hire are low-risk activities.",
    "Generally safe roads with some hazards. Drive defensively, observe speed limits, and avoid rural roads after dark.",
    "Poor road conditions, aggressive driving culture, or limited enforcement. Motorbike hire carries real risk; night driving is inadvisable.",
    "Very high road-fatality rates. Hire experienced local drivers where possible; avoid motorbikes and any night driving."
  ],
  cannabis: [
    "Recreational adult use fully legal. Licensed dispensaries, social clubs, or home cultivation permitted. Check local age limits and public consumption rules.",
    "Medical use legal and/or personal possession decriminalized. Small amounts treated as a health matter. Purchase may still be restricted: verify current local rules.",
    "Technically illegal: possession of small amounts typically results in a fine or administrative sanction rather than criminal prosecution. Enforcement varies widely.",
    "Severe criminal penalties: arrest, significant prison time, caning, or deportation for any possession. Death penalty applies to trafficking in some jurisdictions. Do not carry."
  ],
  nomad: [
    "Top-tier digital nomad base. Fast internet, affordable, active remote community, easy long-stay visa.",
    "Good nomad option. Solid connectivity, reasonable costs, growing expat scene.",
    "Workable but with trade-offs. Internet, cost, visa, or safety issues make extended stays harder.",
    "Not recommended for nomads. Persistent connectivity issues, restrictive access, safety, or prohibitive cost."
  ],
  english: [
    "Near-universal English spoken. No language barrier for travellers.",
    "English widely spoken in cities and tourist areas. Minor gap in rural zones.",
    "Limited English outside tourist areas. Translation app strongly recommended.",
    "Very limited English. Local guide or interpreter is advisable for navigation."
  ],
  healthcare: [
    "World-class hospitals; universal or near-universal coverage; fast emergency response.",
    "Good hospitals in cities; quality care widely accessible. Travel insurance advisable.",
    "Adequate for routine care; significant gaps in rural areas. Medical insurance essential.",
    "Limited or poor facilities. Medical evacuation insurance is strongly recommended."
  ],
  tapwater: [
    "Tap water is safe to drink directly from the tap. No filter or bottled water needed.",
    "Tap water is generally safe; sensitive travellers may prefer bottled or filtered water.",
    "Tap water is not safe to drink. Use bottled or purified water at all times.",
    "Tap water is severely unsafe. Serious illness risk: bottled water is essential throughout."
  ],
  airquality: [
    "Air quality is consistently good. Safe and comfortable for all outdoor activities.",
    "Generally acceptable air quality; occasional moderate pollution days in cities.",
    "Pollution can reach unhealthy levels, especially in urban areas. Mask advisable.",
    "Air frequently very unhealthy (AQI > 150). N95 mask strongly recommended outdoors."
  ],
  femalesafety: [
    "Exceptionally safe for solo female travellers. Harassment is very rare nationwide.",
    "Generally safe. Standard urban precautions sufficient. Most areas welcoming.",
    "Exercise caution: harassment reported in some areas. Research local norms before visiting.",
    "High caution strongly advised. Dress conservatively; avoid solo night travel in most areas."
  ],
  nightlife: [
    "World-class nightlife: clubs, bars, live music and late-night dining for every taste.",
    "Good variety of bars, restaurants and entertainment. Most cities have active scenes.",
    "Moderate nightlife; primarily in major urban centres. Rural areas very quiet at night.",
    "Nightlife is very limited. Alcohol may be restricted, expensive, or socially discouraged."
  ],
  scam: [
    "Tourist scams are very rare. High-trust environment: standard awareness is plenty.",
    "Occasional petty scams near tourist sites. Standard vigilance is sufficient.",
    "Tourist scams are common: research typical local schemes (taxi, currency, tours) beforehand.",
    "High risk of scams targeting tourists. Stay alert; use only vetted operators and transport."
  ],
  malaria: [
    "No malaria transmission. No prophylaxis required for most travellers.",
    "Sporadic low-level transmission in some rural areas. Consult a travel doctor.",
    "Moderate malaria risk, especially rural and jungle areas. Prophylaxis recommended.",
    "High P. falciparum malaria risk. Prophylaxis is essential. Avoid stagnant water. Use nets."
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
  // Cyprus: Eastern Mediterranean island; EU member; warm sunny 11+ months; beaches Apr–Nov
  'CY': { weather:s12(1,1,0,0,0,0,0,0,0,0,0,1), safety:rep(0), cost:rep(1), family:rep(0), solo:rep(0), remote:rep(1), corrupt:rep(1), health:rep(0), crowds:s12(0,0,1,1,2,2,3,3,2,1,0,0), disaster:rep(0), visa:rep(0), lgbtq:rep(1), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,2), road:rep(1), vaccines:rep(0) },
  // Israel: Middle East; excellent weather Oct–May; security awareness required
  'IL': { weather:s12(0,0,0,0,0,1,2,2,1,0,0,0), safety:rep(2), cost:rep(2), family:rep(1), solo:rep(1), remote:rep(0), corrupt:rep(1), health:rep(0), crowds:s12(1,1,1,1,2,2,1,1,1,1,1,1), disaster:rep(2), visa:rep(0), lgbtq:rep(1), beaches:s12(1,1,1,0,0,2,3,3,1,0,0,1), road:rep(1), vaccines:rep(0) },
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
  // Special territories (custom keys, not ISO3166)
  'GZ':  { weather:s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(3), cost:rep(0), family:rep(3), solo:rep(3), remote:rep(3), corrupt:rep(3), health:rep(2), crowds:rep(0), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(1), road:rep(2), vaccines:rep(2) },
  // West Bank: Palestinian Authority areas; Israeli military checkpoints; no coastline
  'XWB': { weather:s12(1,1,0,0,0,1,2,2,1,0,1,1), safety:rep(3), cost:rep(1), family:rep(3), solo:rep(3), remote:rep(2), corrupt:rep(3), health:rep(2), crowds:rep(1), disaster:rep(2), visa:rep(3), lgbtq:rep(3), beaches:rep(3), vaccines:rep(2) },
};

// ─── Sub-national climate data ────────────────────────────────────────────────
// Keyed by ISO 3166-2 subdivision code (e.g. 'CN-11', 'US-AK').
// Only layers that meaningfully differ from the parent country are included;
// all other layers fall through to the parent CD entry at runtime.
const CD_A1 = {

  // ── China ─────────────────────────────────────────────────────────────────
  // Northeast: extreme cold winters, pleasant short summer
  'CN-23': { weather: s12(3,3,3,2,1,0,0,0,0,1,2,3) }, // Heilongjiang (Harbin)
  'CN-22': { weather: s12(3,3,2,1,0,0,0,0,0,1,2,3) }, // Jilin
  'CN-21': { weather: s12(3,2,2,1,0,0,0,0,0,1,1,3) }, // Liaoning (Shenyang)

  // North: cold dry winters, hot humid summers, excellent Sep–Oct
  // Beijing: capital; most expensive for China; intense tourist and commuter crowds
  'CN-11': { weather: s12(2,2,1,1,1,1,2,2,0,0,1,2), cost:rep(2), crowds:rep(3) },
  'CN-12': { weather: s12(2,2,1,1,1,1,2,2,0,0,1,2) }, // Tianjin
  'CN-13': { weather: s12(2,2,1,1,1,1,2,2,0,0,1,2) }, // Hebei
  'CN-14': { weather: s12(2,2,1,1,0,1,1,2,0,0,1,2) }, // Shanxi
  'CN-37': { weather: s12(2,2,1,1,1,1,2,2,0,0,1,2) }, // Shandong (Qingdao)
  'CN-41': { weather: s12(2,2,1,1,1,1,2,2,0,0,1,2) }, // Henan

  // Inner Mongolia: extreme continental steppe
  'CN-15': { weather: s12(3,3,2,1,0,0,0,0,0,1,2,3) },

  // East / Lower Yangtze: subtropical; plum rain Jun, typhoon Jul–Sep
  // Shanghai: most international city in China; premium prices; best nightlife
  'CN-31': { weather: s12(1,2,1,1,1,2,3,3,2,0,1,1), cost:rep(2), crowds:rep(2) },
  'CN-32': { weather: s12(1,2,1,1,1,2,2,3,2,0,1,1) }, // Jiangsu (Nanjing)
  'CN-33': { weather: s12(1,2,1,1,1,2,2,3,2,0,1,1) }, // Zhejiang (Hangzhou)
  'CN-34': { weather: s12(2,2,1,1,1,2,2,2,1,0,1,2) }, // Anhui
  'CN-35': { weather: s12(1,1,1,1,1,2,2,2,2,1,1,1) }, // Fujian (Xiamen)
  'CN-36': { weather: s12(1,2,1,1,1,2,2,3,1,0,1,1) }, // Jiangxi

  // Central: hot, humid summers; flooding risk Jul–Aug
  'CN-42': { weather: s12(1,2,1,1,1,2,2,3,1,0,1,1) }, // Hubei (Wuhan)
  'CN-43': { weather: s12(1,2,1,1,1,2,2,3,1,0,1,1) }, // Hunan (Changsha)

  // South: subtropical/tropical; excellent Nov–Mar
  // Guangdong: megacity belt (Guangzhou/Shenzhen); expensive; gateway to HK/Macau
  'CN-44': { weather: s12(1,2,2,2,2,2,2,2,2,1,0,1), cost:rep(2), crowds:rep(2) },
  'CN-45': { weather: s12(1,2,2,2,2,2,2,2,1,0,1,1) }, // Guangxi (Guilin)
  // Hainan: China's tropical island; resort prices; best beaches in the country
  'CN-46': { weather: s12(0,0,0,1,2,2,2,2,2,1,0,0), beaches:rep(0), cost:rep(2) },

  // Southwest: Chengdu/Chongqing basin foggy; Yunnan "spring city"
  'CN-50': { weather: s12(1,1,1,1,1,2,2,3,2,1,1,1) }, // Chongqing
  'CN-51': { weather: s12(1,1,1,1,1,2,2,2,2,1,1,2) }, // Sichuan (Chengdu)
  'CN-52': { weather: s12(1,1,1,1,1,2,1,1,1,0,1,1) }, // Guizhou (mild/overcast)
  'CN-53': { weather: s12(0,0,0,0,1,2,2,2,1,0,0,0) }, // Yunnan (Kunming: spring city)

  // Northwest: arid, extreme continental
  'CN-61': { weather: s12(2,2,1,1,0,1,1,2,0,0,1,2) }, // Shaanxi (Xi'an)
  'CN-62': { weather: s12(2,2,1,1,0,0,1,2,0,1,2,2) }, // Gansu (Lanzhou)
  'CN-64': { weather: s12(2,2,1,1,0,0,1,2,0,0,1,2) }, // Ningxia
  // Xinjiang: pervasive surveillance; restricted zones near borders; Silk Road sites open but monitored
  'CN-65': { weather: s12(3,3,2,1,0,0,3,3,1,1,2,3), safety:rep(2), crowds:rep(0), visa:rep(2) },

  // High plateau
  // Tibet/Xizang: Tibet Travel Permit required beyond Chinese visa; strict surveillance; very few tourists
  'CN-54': { weather: s12(3,3,2,1,0,1,1,1,0,1,2,3), visa:rep(3), crowds:rep(0), safety:rep(2) },
  // Qinghai: high plateau; no special permit; remote but accessible; low tourist density
  'CN-63': { weather: s12(3,3,2,1,0,1,1,1,0,1,2,3), crowds:rep(0) },

  // ── India ────────────────────────────────────────────────────────────────
  // Delhi: solo female safety significantly worse than national average; extreme heat/pollution
  'IN-DL': { weather: s12(1,1,2,2,3,3,2,2,2,1,0,1), solo:rep(3), safety:rep(2) }, //: extreme heat May–Jun; humid Jul–Sep
  'IN-RJ': { weather: s12(0,1,1,2,3,3,2,2,2,1,0,0) }, // Rajasthan: Thar desert; scorching Apr–Jun
  // Kerala: most progressive state; lower solo risk; excellent public healthcare
  'IN-KL': { weather: s12(0,0,0,1,2,3,3,3,2,1,0,0), solo:rep(1), safety:rep(1), lgbtq:rep(1) }, //: heavy monsoon Jun–Aug; best Nov–Feb
  // Goa: India's most LGBTQ-tolerant state; international beach scene; safer for solo travellers
  'IN-GA': { weather: s12(0,0,0,1,2,3,3,3,3,2,1,0), lgbtq:rep(1), solo:rep(1), safety:rep(1) }, //: best Nov–Feb; heavy monsoon Jun–Sep
  'IN-HP': { weather: s12(3,3,2,1,0,1,2,2,1,0,1,3) }, // Himachal Pradesh: mountain; snow Nov–Mar
  'IN-UK': { weather: s12(2,2,1,1,1,2,3,3,2,0,1,2) }, // Uttarakhand: Himalayan foothills
  'IN-MH': { weather: s12(0,0,1,2,3,3,3,3,3,1,1,0) }, // Maharashtra (Mumbai): heavy monsoon Jun–Sep
  'IN-GJ': { weather: s12(0,0,1,2,3,3,2,2,2,1,0,0) }, // Gujarat: hot/arid; monsoon Jun–Sep
  'IN-TN': { weather: s12(0,0,1,1,2,2,2,2,1,2,3,1) }, // Tamil Nadu: NE monsoon Oct–Dec!
  'IN-WB': { weather: s12(1,1,2,2,3,3,3,3,2,1,1,1) }, // West Bengal (Kolkata)
  'IN-AS': { weather: s12(1,1,2,2,3,3,3,3,3,2,1,1) }, // Assam: very heavy monsoon
  // Jammu & Kashmir: active conflict zone; special permits; do not travel near LoC
  'IN-JK': { weather: s12(3,3,2,1,0,0,1,1,0,0,1,3), safety:rep(3), visa:rep(3), crowds:rep(0), solo:rep(3) }, //: valley; snowy winters

  // ── USA: all 50 states ───────────────────────────────────────────────────
  // US national fallbacks: cost:rep(3), safety:rep(1), lgbtq:rep(1), disaster:rep(1)
  // Per-state entries only specify layers that meaningfully differ from those defaults.
  // cannabis scale: 0=Recreational Legal  1=Medical/Decrim  2=Minor Penalties  3=Severe
  // Source: NORML state laws database + individual state statutes, verified 2025.

  // Pacific Coast
  'US-AK': { weather: s12(3,3,3,2,1,1,1,1,2,2,3,3), safety:rep(0), disaster:rep(1), beaches:rep(3), cannabis:0 }, // Recreational since 2014
  'US-HI': { weather: s12(0,0,0,0,0,0,0,0,0,0,0,0), lgbtq:rep(0), beaches:rep(0), disaster:rep(2), cannabis:1 },  // Medical + decrim
  'US-WA': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2), lgbtq:rep(0), cannabis:0 },                                   // Recreational since 2012
  'US-OR': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2), cost:rep(2), lgbtq:rep(0), cannabis:0 },                      // Recreational since 2014
  'US-CA': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), lgbtq:rep(0), disaster:rep(2), cannabis:0 },                  // Recreational since 2016

  // Mountain West
  'US-MT': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(1), safety:rep(0), lgbtq:rep(2), cannabis:0 },       // Recreational since 2020
  'US-ID': { weather: s12(2,2,1,1,1,0,0,0,1,1,1,2), cost:rep(1), safety:rep(0), lgbtq:rep(2), cannabis:2 },       // No medical; misdemeanor possession
  'US-WY': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(1), safety:rep(0), lgbtq:rep(2), cannabis:2 },       // No medical; misdemeanor possession
  'US-CO': { weather: s12(1,1,1,1,1,0,0,0,0,1,1,1), cost:rep(2), lgbtq:rep(0), cannabis:0 },                      // Recreational since 2012, first state
  'US-NV': { weather: s12(1,1,1,1,1,2,3,3,2,1,0,0), cost:rep(1), lgbtq:rep(1), cannabis:0 },                      // Recreational since 2016
  'US-UT': { weather: s12(1,1,1,1,1,1,2,2,1,0,0,1), cost:rep(1), lgbtq:rep(3), cannabis:1 },                      // Medical since 2018
  'US-AZ': { weather: s12(0,0,0,1,2,3,3,3,2,1,0,0), cost:rep(1), lgbtq:rep(1), cannabis:0 },                      // Recreational since 2020
  'US-NM': { weather: s12(1,1,1,1,1,2,2,2,1,0,0,1), cost:rep(1), safety:rep(2), lgbtq:rep(1), cannabis:0 },       // Recreational since 2021

  // Great Plains
  'US-ND': { weather: s12(3,3,3,2,1,0,0,0,1,1,2,3), cost:rep(1), safety:rep(0), lgbtq:rep(2), cannabis:1 },       // Medical since 2016
  'US-SD': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(1), safety:rep(0), lgbtq:rep(2), disaster:rep(2), cannabis:1 }, // Medical since 2020; rec attempts failed
  'US-NE': { weather: s12(2,2,1,1,2,1,1,2,0,1,1,2), cost:rep(1), lgbtq:rep(2), disaster:rep(2), cannabis:1 },     // Medical passed Nov 2024
  'US-KS': { weather: s12(1,1,1,1,2,1,2,3,1,1,1,1), cost:rep(1), lgbtq:rep(2), disaster:rep(2), cannabis:2 },     // No medical; misdemeanor possession
  'US-OK': { weather: s12(1,1,1,1,2,2,3,3,2,1,1,1), cost:rep(1), safety:rep(2), lgbtq:rep(2), disaster:rep(2), cannabis:1 }, // Medical since 2018; rec SQ820 failed 2023
  'US-TX': { weather: s12(1,1,1,1,2,2,3,3,2,1,1,1), cost:rep(2), lgbtq:rep(2), disaster:rep(2), cannabis:1 },     // Very limited medical (CUP); possession misdemeanor

  // Upper Midwest
  'US-MN': { weather: s12(3,3,3,2,1,0,0,0,1,1,2,3), cost:rep(1), lgbtq:rep(0), cannabis:0 },                      // Recreational since 2023
  'US-WI': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(1), lgbtq:rep(1), cannabis:2 },                      // No medical statewide; misdemeanor possession
  'US-MI': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(1), lgbtq:rep(1), cannabis:0 },                      // Recreational since 2018
  'US-IA': { weather: s12(3,2,2,1,1,0,0,0,1,1,2,3), cost:rep(1), lgbtq:rep(2), disaster:rep(2), cannabis:1 },     // Very limited medical; possession criminal
  'US-MO': { weather: s12(2,2,1,1,2,1,2,2,1,1,1,2), cost:rep(1), lgbtq:rep(2), cannabis:0 },                      // Recreational since 2022
  'US-IL': { weather: s12(3,2,2,1,1,0,1,1,0,1,1,3), cost:rep(2), lgbtq:rep(0), cannabis:0 },                      // Recreational since 2020
  'US-IN': { weather: s12(2,2,1,1,1,0,1,1,0,1,1,2), cost:rep(1), lgbtq:rep(2), cannabis:2 },                      // CBD only; no medical; criminal possession
  'US-OH': { weather: s12(2,2,1,1,1,0,0,0,0,1,1,2), cost:rep(1), lgbtq:rep(1), cannabis:0 },                      // Recreational since 2023

  // South / Gulf Coast
  'US-LA': { weather: s12(1,1,1,2,2,2,3,3,2,1,1,1), cost:rep(1), safety:rep(2), lgbtq:rep(2), disaster:rep(3), cannabis:1 }, // Medical + decrim (≤14g)
  'US-AR': { weather: s12(1,1,1,1,2,1,2,2,1,1,1,1), cost:rep(0), safety:rep(2), lgbtq:rep(2), cannabis:1 },       // Medical since 2016
  'US-MS': { weather: s12(1,1,1,1,2,2,2,2,2,1,1,1), cost:rep(0), safety:rep(2), lgbtq:rep(3), cannabis:1 },       // Medical since 2022 + decrim
  'US-AL': { weather: s12(1,1,1,0,1,1,2,2,1,0,1,1), cost:rep(0), safety:rep(2), lgbtq:rep(3), cannabis:1 },       // Medical since 2021
  'US-TN': { weather: s12(1,1,1,1,1,0,1,1,0,1,1,1), cost:rep(1), lgbtq:rep(2), cannabis:2 },                      // No comprehensive medical; criminal possession
  'US-KY': { weather: s12(2,2,1,1,1,0,1,1,0,1,1,2), cost:rep(1), lgbtq:rep(2), cannabis:1 },                      // Medical since 2023 (SB 47)
  'US-WV': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2), cost:rep(1), lgbtq:rep(2), cannabis:1 },                      // Medical since 2017
  'US-FL': { weather: s12(1,1,0,0,1,2,2,2,2,1,1,1), cost:rep(2), lgbtq:rep(1), disaster:rep(2), cannabis:1 },     // Medical; Measure 3 (2024 rec) failed at 55.9%

  // Southeast Atlantic
  'US-GA': { weather: s12(1,1,1,0,1,1,2,2,1,0,0,1), cost:rep(1), lgbtq:rep(2), cannabis:1 },                      // Medical (low-THC oil only)
  'US-SC': { weather: s12(1,1,0,0,0,0,1,1,0,0,0,1), cost:rep(1), lgbtq:rep(2), cannabis:2 },                      // No medical; misdemeanor/felony possession
  'US-NC': { weather: s12(1,1,1,1,0,0,1,1,0,0,1,1), cost:rep(1), lgbtq:rep(2), cannabis:1 },                      // No medical program; decrim ≤0.5oz ($200 fine)
  'US-VA': { weather: s12(1,1,1,1,0,0,1,1,0,0,1,1), cost:rep(2), lgbtq:rep(1), cannabis:0 },                      // Recreational since 2021
  'US-MD': { weather: s12(1,1,1,1,1,0,1,1,0,0,1,2), cost:rep(2), lgbtq:rep(0), cannabis:0 },                      // Recreational since 2023
  'US-DE': { weather: s12(2,2,1,1,0,0,1,1,0,0,1,2), cost:rep(2), lgbtq:rep(0), cannabis:0 },                      // Recreational since 2023

  // Northeast
  'US-NJ': { weather: s12(2,2,1,1,0,0,1,1,0,1,1,2), lgbtq:rep(0), cannabis:0 },                                   // Recreational since 2021
  'US-NY': { weather: s12(2,2,1,1,0,0,1,1,0,0,1,2), lgbtq:rep(0), cannabis:0 },                                   // Recreational since 2021
  'US-PA': { weather: s12(2,2,1,1,1,0,1,1,0,1,1,2), cost:rep(2), lgbtq:rep(1), cannabis:1 },                      // Medical since 2016; no recreational yet
  'US-CT': { weather: s12(2,2,1,1,1,0,0,0,1,1,1,2), lgbtq:rep(0), cannabis:0 },                                   // Recreational since 2021
  'US-RI': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2), cost:rep(2), lgbtq:rep(0), cannabis:0 },                      // Recreational since 2022
  'US-MA': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2), lgbtq:rep(0), cannabis:0 },                                   // Recreational since 2016
  'US-VT': { weather: s12(3,3,3,2,1,0,0,0,1,1,2,3), cost:rep(2), safety:rep(0), lgbtq:rep(0), cannabis:0 },       // Recreational since 2020
  'US-NH': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(2), safety:rep(0), lgbtq:rep(1), cannabis:0 },       // Recreational since 2024
  'US-ME': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(2), safety:rep(0), lgbtq:rep(1), cannabis:0 },       // Recreational since 2016

  // ── Australia ────────────────────────────────────────────────────────────
  'AU-QLD': { weather: s12(2,2,2,1,0,0,0,0,0,1,1,2) }, // Queensland: tropical north; cyclone season Dec–Mar
  'AU-NT':  { weather: s12(3,3,3,2,0,0,0,0,0,0,1,3) }, // Northern Territory: severe wet season Nov–Apr
  'AU-WA':  { weather: s12(1,1,1,1,1,2,2,2,1,0,0,1) }, // Western Australia: Perth Mediterranean
  'AU-SA':  { weather: s12(1,1,0,0,1,2,2,2,1,0,0,1) }, // South Australia: hot summers; mild winters
  'AU-NSW': { weather: s12(1,1,1,0,0,1,1,1,1,0,0,1) }, // New South Wales (Sydney), mostly pleasant
  'AU-VIC': { weather: s12(1,1,1,1,1,2,2,2,1,0,0,1) }, // Victoria (Melbourne): variable; warm summers
  'AU-TAS': { weather: s12(2,2,2,1,1,2,2,2,1,1,1,2) }, // Tasmania: cooler; windier

  // ── Russia ───────────────────────────────────────────────────────────────
  'RU-MOW': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3) }, // Moscow: harsh continental winters
  'RU-KDA': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1) }, // Krasnodar (Sochi/Black Sea): much milder
  'RU-SA':  { weather: s12(3,3,3,3,1,0,0,1,2,3,3,3) }, // Sakha/Yakutia: coldest inhabited region on Earth
  'RU-PRI': { weather: s12(3,2,1,1,1,1,2,2,1,0,2,3) }, // Primorsky (Vladivostok): monsoon influenced

  // ── Brazil ───────────────────────────────────────────────────────────────
  'BR-AM': { weather: s12(2,2,2,2,2,1,1,1,1,1,2,2) }, // Amazonas (Manaus): hot/wet year-round
  'BR-PA': { weather: s12(2,3,3,3,2,1,1,1,1,1,2,2) }, // Pará: very heavy rain Mar–May
  'BR-BA': { weather: s12(1,1,2,2,2,2,2,2,1,1,1,1) }, // Bahia (Salvador): wet Apr–Jul
  'BR-SP': { weather: s12(2,2,2,2,1,1,1,1,1,1,2,2) }, // São Paulo: subtropical; mild most of year
  'BR-RS': { weather: s12(1,1,1,2,2,2,3,2,2,1,1,1) }, // Rio Grande do Sul: coldest Brazil; cool winters
  'BR-CE': { weather: s12(2,2,3,3,2,1,0,0,0,0,1,1) }, // Ceará (Fortaleza): NE; rainy Feb–May
  'BR-RJ':  { weather: s12(1,1,2,2,1,1,0,0,0,1,1,1), beaches:rep(0), cost:rep(2), crowds:rep(2), safety:rep(2) },
  'BR-MG':  { weather: s12(1,1,1,2,2,2,1,1,0,0,1,2), cost:rep(1) },
  'BR-SC':  { weather: s12(1,1,1,1,1,1,1,2,0,0,1,1), beaches:rep(1), cost:rep(1) },
  'BR-PE':  { weather: s12(1,1,2,2,2,2,1,0,0,0,1,1), beaches:rep(0), cost:rep(0) },

  // ── Canada ───────────────────────────────────────────────────────────────
  'CA-BC': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2) }, // British Columbia: mild coast; rainy winters
  'CA-ON': { weather: s12(3,3,2,1,1,0,0,0,0,1,2,3) }, // Ontario (Toronto): cold winters; hot summers
  'CA-QC': { weather: s12(3,3,3,2,1,0,0,0,1,1,2,3) }, // Quebec (Montreal): harsh winters
  'CA-AB': { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3) }, // Alberta (Calgary): continental; cold winters
  'CA-YT': { weather: s12(3,3,3,3,2,1,1,1,2,3,3,3) }, // Yukon: subarctic; very cold
  'CA-NS': { weather: s12(3,3,2,2,1,1,1,1,1,1,2,3) }, // Nova Scotia: maritime; foggy; cold winters

  // ── France ───────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(2), safety:rep(0), lgbtq:rep(0), corrupt:rep(0)
  // Ile-de-France: Paris; most expensive; Europe's pickpocket capital; extreme summer crowds
  'FR-IDF': { weather: s12(2,2,1,1,1,0,0,0,0,1,2,2), cost:rep(3), crowds:rep(3), safety:rep(1) },
  // Provence-Alpes-Cote d'Azur: Mediterranean coast; Riviera; excellent beaches; very crowded Jul-Aug
  'FR-PAC': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,3), crowds:s12(0,0,1,1,2,2,3,3,2,1,0,0) },
  // Occitanie: Toulouse/Montpellier; Mediterranean access; affordable; beautiful countryside
  'FR-OCC': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), cost:rep(1), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,3) },
  // Bretagne: Atlantic coast; rainy; Celtic culture; seafood; affordable
  'FR-BRE': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(1), beaches:s12(2,2,2,1,1,1,1,1,1,1,1,2) },
  // Nouvelle-Aquitaine: Bordeaux wine country; Atlantic Basque coast; affordable
  'FR-NAQ': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), cost:rep(1), beaches:s12(2,2,1,1,0,0,0,0,0,1,2,2) },
  // Auvergne-Rhone-Alpes: Lyon/Alps; ski season inflates cost Dec-Mar
  'FR-ARA': { weather: s12(2,2,1,1,0,0,0,0,0,1,2,2), cost:rep(1) },
  // Normandie: rainy Atlantic climate; D-Day history; affordable; cider and cheese country
  'FR-NOR': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(1) },
  // Grand Est: Alsace/Strasbourg; continental winters; Germanic culture; affordable
  'FR-GES': { weather: s12(2,2,1,1,1,0,0,0,0,1,2,2), cost:rep(1) },
  // Corse: island; hot dry summers; expensive; low crime; very limited winter tourism
  'FR-COR': { weather: s12(1,2,1,0,0,0,0,0,0,0,1,2), cost:rep(2), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,3), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0) },
  'FR-HDF': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(1) },
  'FR-CVL': { weather: s12(2,2,1,1,0,0,1,1,0,1,1,2), cost:rep(1) },
  'FR-PDL': { weather: s12(2,2,1,1,1,0,0,0,1,1,2,2), cost:rep(1) },
  'FR-BFC': { weather: s12(2,2,1,1,1,0,1,1,0,1,1,2), cost:rep(1) },

  // ── Germany ──────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(2), safety:rep(0), lgbtq:rep(0)
  // Bavaria: Munich; Oktoberfest; conservative south; most expensive German state
  'DE-BY': { weather: s12(2,2,1,1,0,0,0,0,0,1,2,2), cost:rep(2), lgbtq:rep(1), crowds:s12(1,1,1,1,1,1,2,2,2,2,3,1) },
  // Berlin: city-state; most progressive; significantly cheaper than Munich; cultural capital
  'DE-BE': { weather: s12(2,2,1,1,1,0,0,0,0,1,2,2), cost:rep(1), lgbtq:rep(0), crowds:rep(2) },
  // Hamburg: maritime gateway; progressive; milder Atlantic climate
  'DE-HH': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(2), lgbtq:rep(0) },
  // North Rhine-Westphalia: Cologne/Dusseldorf; densely urban; industrial heartland
  'DE-NW': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(2) },
  // Baden-Wurttemberg: Stuttgart/Black Forest; wealthy; expensive; tech industry
  'DE-BW': { weather: s12(2,2,1,1,0,0,0,0,0,1,2,2), cost:rep(2) },
  'DE-HE':  { weather: s12(2,2,1,1,1,0,0,0,1,1,2,2), cost:rep(2) },
  'DE-NI':  { weather: s12(2,2,2,1,1,1,0,0,1,1,2,2), cost:rep(1) },
  'DE-RP':  { weather: s12(2,2,1,1,1,0,0,0,1,1,1,2), cost:rep(1) },
  'DE-SH':  { weather: s12(2,2,2,1,1,1,0,0,1,1,2,2), cost:rep(1), beaches:rep(2) },
  'DE-BB':  { weather: s12(2,2,1,1,1,0,0,0,1,1,2,2), cost:rep(0) },
  'DE-MV':  { weather: s12(3,3,2,1,1,0,0,0,1,1,2,3), cost:rep(0), beaches:rep(1) },
  'DE-TH':  { weather: s12(2,2,1,1,1,0,0,0,1,1,2,2), cost:rep(0) },
  'DE-SN':  { weather: s12(2,2,1,1,1,0,0,0,1,1,2,2), cost:rep(0) },
  'DE-ST':  { weather: s12(2,2,1,1,1,0,0,0,1,1,2,2), cost:rep(0) },
  'DE-SL':  { weather: s12(2,2,1,1,1,0,0,0,1,1,1,2), cost:rep(1) },
  'DE-HB':  { weather: s12(2,2,2,1,1,1,0,0,1,1,2,2), cost:rep(1) },

  // ── Spain ────────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(1), safety:rep(0), lgbtq:rep(0)
  // Catalonia: Barcelona; premium prices; severe overtourism Jul-Aug; active separatist politics
  'ES-CT': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), cost:rep(2), crowds:s12(1,1,2,2,2,2,3,3,2,2,1,1), beaches:s12(2,2,1,1,0,0,0,0,0,1,2,2) },
  // Andalucia: cheapest region; extreme heat Jul-Aug (45C in Sevilla); Flamenco/Alhambra
  'ES-AN': { weather: s12(1,1,0,0,0,2,3,3,1,0,0,1), cost:rep(0), beaches:s12(2,2,1,0,0,0,0,0,0,1,2,2) },
  // Canary Islands: perpetual spring; excellent beaches; year-round destination; EU territory
  'ES-CN': { weather: s12(0,0,0,0,0,0,0,0,0,0,0,0), beaches:rep(0), cost:rep(1), crowds:s12(2,2,1,1,1,1,2,2,1,1,1,2) },
  // Balearic Islands: Ibiza/Majorca; very expensive in summer; extreme overtourism Jul-Aug
  'ES-IB': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0), cost:rep(2) },
  // Basque Country: rainy Atlantic; San Sebastian food capital; high cost; cultural autonomy
  'ES-PV': { weather: s12(2,2,1,1,1,1,1,1,1,1,2,2), cost:rep(2) },
  // Madrid region: hot dry summers; expensive capital; lively nightlife year-round
  'ES-MD': { weather: s12(1,1,1,1,0,1,2,2,0,0,1,1), cost:rep(2), crowds:s12(1,1,2,2,2,2,2,2,2,2,1,1) },
  // Valencia: sunniest major city; good beaches; more affordable than Barcelona
  'ES-VC': { weather: s12(1,1,0,0,0,0,0,0,0,0,0,1), cost:rep(1), beaches:s12(2,2,1,1,0,0,0,0,0,0,1,2) },
  'ES-GA':  { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(0), beaches:rep(1) },
  'ES-CM':  { weather: s12(2,2,1,1,1,2,3,3,1,0,1,2), cost:rep(0) },
  'ES-CL':  { weather: s12(2,2,1,1,1,1,2,3,1,0,1,2), cost:rep(0) },
  'ES-NC':  { weather: s12(2,2,1,1,1,1,1,1,1,1,1,2), cost:rep(1) },
  'ES-AR':  { weather: s12(2,2,1,1,1,1,2,2,1,1,1,2), cost:rep(0) },
  'ES-MC':  { weather: s12(1,1,0,0,1,2,2,2,1,0,0,1), cost:rep(1), beaches:rep(0) },
  'ES-EX':  { weather: s12(1,1,0,0,1,2,3,3,1,0,0,1), cost:rep(0) },
  'ES-AS':  { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(0), beaches:rep(1) },
  'ES-CB':  { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(0) },
  'ES-RI':  { weather: s12(2,2,1,1,1,1,2,2,1,0,1,2), cost:rep(0) },

  // ── Italy ─────────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(2), safety:rep(0), lgbtq:rep(1), corrupt:rep(1)
  // Lombardia: Milan; most expensive region; fashion/finance; top healthcare
  'IT-25': { weather: s12(2,2,1,1,1,0,0,0,0,1,2,2), cost:rep(3) },
  // Veneto: Venice; extremely crowded; premium prices; flooding risk in Venice
  'IT-34': { weather: s12(1,1,1,1,1,0,0,0,0,1,1,2), cost:rep(2), crowds:s12(1,1,2,3,3,3,3,3,3,2,2,1) },
  // Toscana: Florence/Tuscany; severe overtourism May-Sep; excellent spring and fall
  'IT-52': { weather: s12(1,1,1,1,1,0,0,0,0,1,1,1), cost:rep(2), crowds:s12(1,1,2,3,3,3,3,3,3,2,1,1) },
  // Lazio: Rome; extreme summer crowds and heat; premium tourist pricing
  'IT-62': { weather: s12(1,1,1,0,0,0,1,1,0,0,1,1), cost:rep(2), crowds:s12(1,1,2,3,2,2,3,3,2,2,1,1) },
  // Campania: Naples/Amalfi; cheapest mainland; higher petty crime; Camorra influence
  'IT-72': { weather: s12(1,1,1,0,0,0,1,1,0,0,1,1), cost:rep(0), safety:rep(1), corrupt:rep(2), beaches:s12(2,2,1,1,0,0,0,0,0,1,2,2) },
  // Puglia: heel of Italy; very affordable; beautiful beaches; less crowded than north
  'IT-75': { weather: s12(1,1,0,0,0,0,1,1,0,0,0,1), cost:rep(0), beaches:s12(2,2,1,0,0,0,0,0,0,1,2,2) },
  // Sicilia: warm, cheap, Mafia-related corruption still present; best in spring/fall
  'IT-82': { weather: s12(1,1,0,0,0,0,0,0,0,0,1,1), cost:rep(0), safety:rep(1), corrupt:rep(2), beaches:s12(2,2,1,0,0,0,0,0,0,1,2,2) },
  // Sardegna: beautiful beaches; very expensive Jul-Aug; deserted in winter
  'IT-88': { weather: s12(2,2,1,0,0,0,0,0,0,0,1,2), cost:rep(2), beaches:s12(3,3,2,1,0,0,0,0,0,0,1,3), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0) },
  // (The older alpha-coded duplicates of the numeric regions above: IT-LOM,
  //  IT-LAZ, IT-TOS, IT-VEN, IT-CAM, IT-SIC, IT-SAR, and Spain's ES-IC: were
  //  merged into their canonical twins and removed; CD_A1_ALIAS resolves the
  //  Natural Earth codes onto the canonical keys.)
  'IT-TAA': { weather: s12(3,3,2,1,0,0,0,0,0,1,2,3), cost:rep(2) },
  'IT-LIG': { weather: s12(1,1,0,0,1,1,1,1,1,0,0,1), beaches:rep(0), cost:rep(2) },

  // ── Japan ─────────────────────────────────────────────────────────────────────
  // Hokkaido: subarctic; powder ski paradise Dec-Mar; cool pleasant summers; best Jul-Sep
  'JP-01': { weather: s12(3,3,2,2,1,0,0,0,1,1,2,3) },
  // Niigata / Sea of Japan coast: record snowfall Dec-Mar; pleasant summers; sake country
  'JP-15': { weather: s12(2,3,2,1,0,0,0,0,1,1,1,2) },
  // Nagano: Japanese Alps; cold winters; ski resorts; excellent fall foliage; mild summers
  'JP-20': { weather: s12(2,2,2,1,0,0,0,0,0,1,1,2) },
  // Kanto (Tokyo): humid subtropical; spring cherry blossom Apr excellent; brutal heat Jul-Aug; best Oct
  'JP-13': { weather: s12(1,1,1,0,1,2,3,3,2,0,1,1), cost:rep(3), crowds:s12(1,1,2,3,2,1,1,2,1,3,2,1) },
  // Kyoto: same brutal summer heat as Tokyo; most extreme spring/fall overtourism in Japan
  'JP-26': { weather: s12(1,1,1,0,1,2,3,3,2,0,1,1), crowds:s12(1,1,3,3,2,2,1,2,2,3,3,1) },
  // Osaka: slightly warmer than Kyoto; lively city; crowded but less acute than Kyoto peaks
  'JP-27': { weather: s12(1,1,0,0,1,2,3,3,2,0,0,1) },
  // Kyushu (Fukuoka): warmest Honshu/Kyushu; mild winters; typhoon season Aug-Sep
  'JP-40': { weather: s12(0,1,1,0,1,1,2,2,2,0,0,0) },
  // Okinawa: subtropical; rainy tsuyu May-Jun; typhoons Aug-Oct; mild winters; excellent beaches
  'JP-47': { weather: s12(1,0,0,0,2,2,1,2,2,1,1,1), beaches:rep(0) },

  // ── Mexico ────────────────────────────────────────────────────────────────────
  // CDMX / Mexico City: highland 2240 m; mild and spring-like year-round; rainy Jun-Sep; safest major city
  'MX-CMX': { weather: s12(0,0,0,0,1,2,2,2,2,1,0,0), cost:rep(1) },
  // Quintana Roo (Cancún, Tulum, Playa): hot/humid; hurricane season Jun-Nov; peak crowds Dec-Jan/Mar
  'MX-ROO': { weather: s12(0,0,0,1,1,2,2,2,2,2,1,0), disaster:rep(3), crowds:s12(2,2,1,1,1,1,1,1,1,1,2,2), beaches:s12(0,0,0,1,1,2,2,2,2,2,1,0) },
  // Oaxaca: highland city 1550 m; spring-like; rainy Jun-Sep; extremely affordable; rich culture
  'MX-OAX': { weather: s12(0,0,0,0,1,2,2,2,1,0,0,0), cost:rep(0) },
  // Jalisco (Guadalajara + Puerto Vallarta): highland city mild; PV coast hot; rainy Jun-Sep
  'MX-JAL': { weather: s12(0,0,0,0,1,2,2,2,2,1,0,0), cost:rep(1) },
  // Sonora (Hermosillo, border): Sonoran Desert; scorching Jun-Sep 45 °C; mild Oct-Apr
  'MX-SON': { weather: s12(0,0,1,1,2,3,3,3,2,1,0,0), safety:rep(2) },
  // Baja California Sur (Los Cabos, La Paz): desert peninsula; excellent Oct-May; brutal Jul-Aug
  'MX-BCS': { weather: s12(0,0,0,0,1,2,3,3,2,1,0,0), beaches:s12(0,0,0,0,1,2,3,3,2,0,0,0) },
  // Baja California Norte (Tijuana, Ensenada): Mediterranean-ish; warm winters; safety concerns near border
  'MX-BCN': { weather: s12(1,1,0,0,0,0,0,0,0,0,1,1), safety:rep(2) },
  // Yucatan (Mérida, Chichén Itzá): very hot; drier than Q.Roo; oppressive heat May-Aug
  'MX-YUC': { weather: s12(0,0,0,1,2,2,3,3,2,1,1,0) },
  // Chiapas (San Cristóbal, Palenque): highland cool / jungle hot; rainy Jun-Oct
  'MX-CHP': { weather: s12(0,0,0,0,1,2,2,2,2,1,0,0), cost:rep(0) },
  // Guerrero (Acapulco): high homicide rate; avoid non-resort areas; hot/humid coast
  'MX-GRO': { weather: s12(0,0,0,0,1,2,2,2,2,2,1,0), safety:rep(3) },
  // Tabasco (Villahermosa): hot, wet, jungle gateway; not a leisure destination
  'MX-TAB': { weather: s12(1,1,1,2,2,3,3,3,3,2,1,1) },

  // ── Thailand ─────────────────────────────────────────────────────────────────
  // Bangkok: hot year-round; cool dry season Nov-Jan; rainy May-Oct; air quality variable
  'TH-10': { weather: s12(0,0,1,1,2,2,2,2,2,2,1,0) },
  // Chiang Mai: SMOKE SEASON Mar-Apr critical; cool dry Nov-Jan; rainy Jun-Oct; forest fires from slash-and-burn
  'TH-50': { weather: s12(0,0,3,3,2,1,1,1,2,1,0,0) },
  // Phuket: Andaman coast; DRY season Nov-Apr; monsoon May-Oct (rough seas, some resorts close)
  'TH-83': { weather: s12(0,0,0,0,2,2,2,2,2,2,1,0), beaches:s12(0,0,0,0,2,3,3,3,2,2,1,0) },
  // Krabi: Andaman coast; same pattern as Phuket; dry Nov-Apr excellent
  'TH-81': { weather: s12(0,0,0,0,2,2,2,2,2,2,1,0), beaches:s12(0,0,0,0,2,3,3,3,2,2,1,0) },
  // Surat Thani (Koh Samui / Gulf coast): OPPOSITE rain season to Phuket; dry Jan-Sep; heavy rain Oct-Dec
  'TH-84': { weather: s12(0,0,0,0,0,1,1,1,1,2,3,2), beaches:s12(0,0,0,0,0,1,1,1,1,2,3,2) },
  // Prachuap Khiri Khan (Hua Hin / Gulf coast): similar to Samui; driest Jan-May
  'TH-77': { weather: s12(0,0,0,0,0,1,1,1,1,2,2,1) },

  // ── Vietnam ───────────────────────────────────────────────────────────────────
  // Hanoi: 4 seasons; cool drizzly Jan-Mar; hot humid summer; rainy Jul-Aug; best Oct-Dec
  'VN-HN': { weather: s12(2,2,2,1,1,1,2,2,1,0,0,1) },
  // Haiphong: similar to Hanoi; typhoon risk Aug-Sep
  'VN-HP': { weather: s12(2,2,2,1,1,1,2,2,2,1,0,1) },
  // Da Nang / Central coast: FLOOD SEASON Oct-Dec severe; dry hot Feb-Aug; best Feb-May
  'VN-DN': { weather: s12(2,1,0,0,0,1,1,1,1,2,3,2) },
  // Ho Chi Minh City (South): 2 seasons; dry cool Nov-Apr; hot rainy May-Oct
  'VN-SG': { weather: s12(0,0,0,1,2,3,3,3,2,2,1,0) },
  // Can Tho / Mekong Delta: very similar to HCMC; flooding Aug-Oct
  'VN-CT': { weather: s12(0,0,0,1,2,3,3,3,3,2,1,0) },

  // ── Turkey ────────────────────────────────────────────────────────────────────
  // Istanbul: hybrid climate; hot dry summers; cold wet winters; best Apr-May, Sep-Oct
  'TR-34': { weather: s12(2,2,1,0,0,0,1,1,0,1,2,2) },
  // Ankara: steppe continental; cold dry winters; hot dry summers; best Apr-May, Sep-Oct
  'TR-06': { weather: s12(2,2,1,1,0,1,2,2,0,1,1,2) },
  // Antalya / Turkish Riviera: excellent beaches; nearly year-round sun; best Apr-Jun, Sep-Oct
  'TR-07': { weather: s12(1,1,0,0,0,0,1,2,0,0,1,1), beaches:s12(2,2,1,0,0,0,0,1,0,0,2,2) },
  // Izmir / Aegean coast: very similar to Antalya; slightly cooler; excellent spring/fall
  'TR-35': { weather: s12(1,1,0,0,0,0,1,2,0,0,1,1), beaches:s12(2,2,1,0,0,0,0,1,0,0,2,2) },
  // Erzurum / Eastern Anatolia: extreme cold; snow Oct-Apr; short pleasant summer
  'TR-25': { weather: s12(3,3,3,2,1,0,0,0,1,2,3,3) },
  // Rize / Black Sea coast: very rainy year-round; lush green; mild temperatures
  'TR-53': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2) },

  // ── Greece ────────────────────────────────────────────────────────────────────
  // Attica (Athens): scorching Jul-Aug (38-42 °C); great spring and fall; mild winter
  'GR-I': { weather: s12(1,1,1,0,0,0,2,2,0,0,1,1), crowds:s12(1,1,2,2,2,3,3,3,3,2,1,1) },
  // South Aegean (Santorini, Mykonos, Rhodes): premium prices; extreme Jul-Aug crowds; excellent beaches
  'GR-L': { weather: s12(1,1,1,0,0,0,1,2,0,0,1,1), cost:rep(3), crowds:s12(0,0,1,1,2,3,3,3,2,1,0,0), beaches:s12(2,2,1,0,0,0,0,1,0,0,1,2) },
  // Crete: warmest Greek region; best Oct-May; slightly more breeze than Athens; very crowded Jul-Aug
  'GR-M': { weather: s12(1,1,1,0,0,0,1,1,0,0,1,1), crowds:s12(0,0,1,2,2,3,3,3,2,1,0,0), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2) },
  // West Macedonia: mountainous; cold snowy winters; cool summers; off the tourist trail
  'GR-C': { weather: s12(3,3,2,1,0,0,0,0,0,1,2,3) },
  // Ionian Islands (Corfu, Zakynthos): lush/rainy in winter; excellent May-Sep; cheaper than Aegean
  'GR-F': { weather: s12(2,2,1,0,0,0,0,0,0,0,1,2), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2) },

  // ── Portugal ──────────────────────────────────────────────────────────────────
  // Lisboa (Lisbon): mild Atlantic climate; warm sunny summers (but rarely brutal); best Apr-Oct
  'PT-11': { weather: s12(1,1,1,1,0,0,0,0,0,0,1,1) },
  // Porto: rainier and cooler than Lisbon; lush green Douro valley; best May-Sep
  'PT-13': { weather: s12(2,2,2,1,1,0,0,0,1,1,2,2) },
  // Faro / Algarve: southern beach coast; best beaches in Portugal; driest region; best Apr-Oct
  'PT-08': { weather: s12(1,1,0,0,0,0,0,0,0,0,1,1), beaches:s12(2,2,1,0,0,0,0,0,0,0,1,2) },
  // Madeira: "island of eternal spring"; subtropical; mild year-round; best Apr-Oct
  'PT-30': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), beaches:s12(2,2,2,1,1,1,1,1,1,1,2,2) },
  // Azores: mid-Atlantic; rainy/windy; very variable; whale watching; dramatic landscapes
  'PT-20': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2) },

  // ── India: additional states ─────────────────────────────────────────────────
  // Karnataka (Bengaluru/Hampi): Deccan plateau 920 m; most pleasant in India year-round; monsoon Jun-Sep
  'IN-KA': { weather: s12(0,0,1,1,2,2,2,2,2,1,0,0) },
  // Uttar Pradesh (Agra/Varanasi): brutal heat May-Jun; very crowded monuments; moderate solo risk
  'IN-UP': { weather: s12(0,0,1,2,3,3,3,3,2,1,0,0), crowds:rep(3), safety:rep(2), solo:rep(2) },
  // Punjab (Amritsar/Golden Temple): hot dry summers; cold foggy winters; best Oct-Mar
  'IN-PB': { weather: s12(1,1,1,2,3,3,3,3,2,1,0,1) },
  // Madhya Pradesh (Khajuraho, Orchha, Kanha): hot central India; best Oct-Feb
  'IN-MP': { weather: s12(0,0,1,2,3,3,3,3,2,1,0,0) },
  // Telangana (Hyderabad): hot plateau; best Nov-Feb; intense heat Apr-Jun
  'IN-TS': { weather: s12(0,0,1,2,3,3,2,2,2,1,0,0) },
  // Tamil Nadu (Chennai, Madurai): hot all year; NE monsoon Oct-Dec (opposite to rest of India!)
  // IN-TN already exists above: skip
  // Odisha (Puri, Konark): hot coast; very cyclone-prone; best Nov-Feb
  'IN-OD': { weather: s12(0,0,1,2,3,3,2,2,2,2,1,0), disaster:rep(3) },
  // Bihar (Bodh Gaya, Patna): hot humid Gangetic plain; best Nov-Feb
  'IN-BR': { weather: s12(0,0,1,2,3,3,3,3,2,1,0,0) },
  // Sikkim: Himalayan mountain state; cold winters; spring rhododendrons; monsoon Jun-Sep
  'IN-SK': { weather: s12(2,2,2,1,0,1,2,2,1,0,1,2) },
  // Andhra Pradesh (Vizag coast): tropical coast; NE monsoon Oct-Dec; hot summers
  'IN-AP': { weather: s12(0,0,1,1,2,2,2,2,2,1,2,1) },

  // ── Indonesia ─────────────────────────────────────────────────────────────────
  // Bali: dry season Apr-Oct excellent; rainy Nov-Mar (still warm but humid storms); best Jun-Sep
  'ID-BA': { weather: s12(2,2,2,1,0,0,0,0,0,1,2,2), beaches:s12(2,2,2,1,0,0,0,0,0,1,2,2) },
  // Jakarta / Java West: equatorial; hot/humid year-round; rainy Nov-Apr; flooding risk Jan-Feb
  'ID-JK': { weather: s12(2,3,2,1,1,0,0,0,0,0,1,2) },
  // East Java (Surabaya, Bromo): slightly drier than west; dry Jun-Oct best for Bromo
  'ID-JI': { weather: s12(2,2,2,1,0,0,0,0,0,1,1,2) },
  // North Sumatra (Medan, Bukit Lawang): equatorial; very rainy; relatively cool at altitude
  'ID-SU': { weather: s12(2,2,2,2,2,2,1,1,1,2,2,2) },
  // East Kalimantan (Borneo): equatorial rainforest; very rainy; extreme humidity
  'ID-KI': { weather: s12(2,2,2,2,1,1,1,1,1,1,2,2) },
  // Papua: extreme rainfall; frontier; very limited infrastructure; best Jun-Sep
  'ID-PA': { weather: s12(2,2,3,3,2,1,1,1,1,2,2,2) },

  // ── South Africa ──────────────────────────────────────────────────────────────
  // Western Cape (Cape Town): Mediterranean (SOUTHERN HEMISPHERE); best Oct-Apr; winter rain Jun-Aug
  'ZA-WC': { weather: s12(0,0,0,1,1,2,2,2,1,0,0,0), beaches:s12(0,0,0,1,1,2,2,2,1,0,0,0) },
  // Gauteng (Johannesburg, Pretoria): highveld 1700 m; warm dry winters excellent; summer afternoon thunderstorms
  'ZA-GP': { weather: s12(1,1,1,0,0,0,0,0,0,1,1,1) },
  // KwaZulu-Natal (Durban): subtropical coast; warm all year; best May-Oct (dry); humid summers
  'ZA-KZN': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), beaches:s12(1,1,1,0,0,0,0,0,0,0,1,1) },
  // Northern Cape (Kalahari, Upington): extreme desert heat Dec-Feb (Jan often 45 °C); best Jun-Sep
  'ZA-NC': { weather: s12(3,3,2,1,0,0,0,0,0,1,2,3) },
  // Mpumalanga (Kruger National Park): best game viewing May-Sep (dry); malaria risk year-round
  'ZA-MP': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1), health:rep(2) },
  'ZA-LP':  { weather: s12(0,0,0,1,1,2,2,1,1,0,0,0), cost:rep(0) },
  'ZA-EC':  { weather: s12(0,0,0,1,1,2,2,2,1,0,0,0), beaches:rep(1), cost:rep(0), safety:rep(2) },
  'ZA-NW':  { weather: s12(0,0,0,1,1,2,2,2,1,0,0,0), cost:rep(0) },
  'ZA-FS':  { weather: s12(0,0,0,1,1,2,2,2,1,0,0,0), cost:rep(0) },

  // ── Morocco ───────────────────────────────────────────────────────────────────
  // Grand Casablanca-Settat: coastal Atlantic; mild year-round; best Mar-May, Sep-Nov
  'MA-06': { weather: s12(1,1,0,0,0,0,1,1,0,0,1,1) },
  // Marrakesh-Safi (Marrakech): pre-Saharan heat; extreme Jul-Aug (45 °C+); best Oct-Apr
  'MA-07': { weather: s12(0,0,0,0,1,2,3,3,1,0,0,0) },
  // Fès-Meknès (Fez): inland continental; hot summers; best Mar-May, Sep-Nov
  'MA-03': { weather: s12(1,1,0,0,0,2,3,3,1,0,1,1) },
  // Draa-Tafilalet (Ouarzazate, Sahara Desert): extreme desert; best Oct-Mar; summer brutal
  'MA-08': { weather: s12(0,0,0,0,1,2,3,3,2,1,0,0) },
  // Tanger-Tétouan-Al Hoceima (Tangier): Mediterranean north; mild Atlantic; best Apr-Sep
  'MA-01': { weather: s12(1,1,1,0,0,0,0,0,0,0,1,1) },

  // ── United Kingdom ─────────────────────────────────────────────────────────────
  // National fallbacks: safety:rep(0), cost:rep(2), lgbtq:rep(0)
  // England: temperate maritime; mixed year-round; London premium costs; busy summers
  'GB-ENG': { weather: s12(2,2,1,1,1,1,1,1,1,1,2,2), crowds:s12(1,1,1,2,2,2,3,3,2,1,1,1) },
  // Scotland: Atlantic/North Sea; significantly wetter and colder; Highland wilderness; cheaper
  'GB-SCT': { weather: s12(3,3,2,2,1,1,1,1,1,2,2,3), cost:rep(1) },
  // Wales: rainy Atlantic coast; mountainous; Celtic heritage; cheaper than England; best Jun-Sep
  'GB-WLS': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(1) },
  // Northern Ireland: similar to Scotland climate; Belfast resurgent; cheaper; peaceful since GFA
  'GB-NIR': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), cost:rep(1) },

  // ── Argentina ──────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(1), safety:rep(1), lgbtq:rep(0)
  // Buenos Aires (CABA): cosmopolitan capital; mild subtropical; humid summers; most expensive
  'AR-C': { weather: s12(1,1,1,0,0,1,1,1,0,0,0,1), cost:rep(2), crowds:rep(2) },
  // Buenos Aires Province: Atlantic coast + pampas; similar climate to CABA
  'AR-B': { weather: s12(1,1,1,0,0,1,1,1,0,0,0,1) },
  // Mendoza: Andes foothills; dry & sunny; wine country; extreme summer heat; harvest Mar-Apr
  'AR-M': { weather: s12(1,1,0,0,0,1,2,1,0,0,0,1), crowds:s12(1,2,2,2,1,0,0,0,1,1,1,1) },
  // Misiones (Iguazú Falls): subtropical jungle; hot & humid year-round; cooler/drier Jul-Aug
  'AR-N': { weather: s12(2,2,1,1,1,1,1,1,1,1,1,2), health:rep(1), crowds:s12(2,2,1,0,0,0,2,2,1,0,0,1) },
  // Neuquén (Bariloche / Lake District): ski Jun-Sep; trekking Dec-Feb; shoulder Mar-May
  'AR-Q': { weather: s12(0,0,1,1,2,2,2,2,2,1,0,0), cost:s12(1,1,1,1,1,2,2,2,1,1,1,1), crowds:s12(2,2,1,0,0,1,2,2,1,0,0,1) },
  // Santa Cruz (El Calafate / El Chaltén / Perito Moreno): Patagonia; ferocious wind; Nov-Feb only
  'AR-Z': { weather: s12(0,0,1,2,3,3,3,3,2,1,0,0), cost:rep(2), remote:rep(2), crowds:s12(3,3,2,1,0,0,0,0,0,0,1,2) },
  // Jujuy (Quebrada de Humahuaca / Altiplano): 3000-4400 m; rainy Dec-Feb; dry May-Oct best
  'AR-Y': { weather: s12(2,2,1,0,0,0,0,0,0,0,1,2), health:rep(1) },

  // ── Colombia ───────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(1), safety:rep(1), lgbtq:rep(1)
  // Bogotá DC: 2600 m; year-round spring ~14°C; two rainy seasons Apr-May & Oct-Nov; most expensive
  'CO-DC': { weather: s12(0,0,1,2,2,1,0,0,1,2,2,1), cost:rep(2) },
  // Antioquia (Medellín): "eternal spring" 22°C; two brief rainy seasons; top digital-nomad hub
  'CO-ANT': { weather: s12(0,0,0,1,1,0,0,0,1,1,0,0), crowds:rep(2) },
  // Bolívar (Cartagena): hot Caribbean coast; dry Dec-Apr; rainy May-Nov; historic walled city
  'CO-BOL': { weather: s12(0,0,0,0,1,2,2,2,1,1,1,0), health:rep(1) },
  // Magdalena (Santa Marta / Tayrona NP): Caribbean coast; hot; best Dec-Mar; park crowded on holidays
  'CO-MAG': { weather: s12(0,0,0,0,1,1,1,1,1,1,1,0), health:rep(1), crowds:s12(2,1,1,0,0,0,0,0,0,0,1,2) },
  // Valle del Cauca (Cali): warm year-round; two rainy seasons; salsa capital; higher urban crime
  'CO-VAC': { weather: s12(0,0,1,1,1,1,1,0,1,1,1,0), safety:rep(2) },
  // Quindío (Salento / Coffee Region): lush Andean hills; eternal spring; ecotourism
  'CO-QUI': { weather: s12(0,0,0,1,1,0,0,0,1,1,0,0) },

  // ── Peru ───────────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(1), safety:rep(1), health:rep(1)
  // Lima Metro: Pacific desert coast; sunny Jan-Apr; garúa gray fog Jun-Nov; food capital
  'PE-LIM': { weather: s12(0,0,0,1,1,2,2,2,2,1,1,0), cost:rep(2) },
  // Cusco (Machu Picchu gateway): 3400 m; dry May-Oct; rainy Nov-Apr (landslides); altitude risk
  'PE-CUS': { weather: s12(2,2,1,0,0,0,0,0,0,0,1,2), health:rep(1), crowds:s12(0,0,1,1,2,3,3,3,2,2,1,0) },
  // Madre de Dios (Amazon / Puerto Maldonado): tropical; very wet Nov-Apr; drier May-Oct
  'PE-MDD': { weather: s12(2,2,2,1,1,1,1,1,1,1,2,2), health:rep(2), remote:rep(2) },
  // Arequipa: 2300 m; dry & sunny most of year; brief rains Jan-Mar; the "White City"
  'PE-ARE': { weather: s12(1,1,1,0,0,0,0,0,0,0,0,1) },
  // Puno (Lake Titicaca): 3800 m; dry May-Oct (hard frosts at night); rainy Nov-Apr; altitude risk
  'PE-PUN': { weather: s12(2,2,1,0,0,1,1,1,0,0,1,2), health:rep(1) },
  // Ica (Nazca Lines / Huacachina): coastal desert; sunny & dry year-round; hot Dec-Mar
  'PE-ICA': { weather: s12(1,1,0,0,0,0,0,0,0,0,0,1) },

  // ── New Zealand ────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(2), safety:rep(0)
  // Auckland: subtropical north; warm humid summer Dec-Feb; wetter winter; busiest gateway
  'NZ-AUK': { weather: s12(0,0,0,1,2,2,2,2,1,1,0,0), crowds:rep(2) },
  // Bay of Plenty (Rotorua / Tauranga): geothermal; warm; best Nov-Apr; lush kiwi heartland
  'NZ-BOP': { weather: s12(0,0,0,1,1,2,2,2,1,1,0,0) },
  // Wellington: windiest capital on earth; cooler; excellent arts and food scene
  'NZ-WGN': { weather: s12(1,1,1,2,2,2,2,2,2,1,1,1) },
  // Canterbury (Christchurch): drier east coast; continental; coldest winters; best Dec-Feb
  'NZ-CAN': { weather: s12(0,0,1,1,2,2,3,3,2,1,0,0) },
  // Otago (Queenstown / Dunedin): ski Jun-Sep; summer trekking Dec-Feb; premium resort costs
  'NZ-OTA': { weather: s12(0,0,1,1,2,2,2,2,2,1,0,0), cost:s12(2,2,2,2,2,3,3,3,2,2,2,2), crowds:s12(3,3,2,1,1,2,3,3,1,1,2,3) },
  // Southland / Fiordland (Milford Sound): wettest region NZ; dramatic; cold; unpredictable
  'NZ-STL': { weather: s12(1,1,2,2,2,3,3,3,2,2,1,1) },

  // ── Egypt ──────────────────────────────────────────────────────────────────────
  // National fallbacks: cost:rep(1), safety:rep(1)
  // Cairo / Giza: extreme heat Jun-Sep (45°C+); best Oct-Apr; pyramids always overcrowded
  'EG-C': { weather: s12(0,0,0,1,2,3,3,3,2,0,0,0), crowds:rep(3) },
  // Alexandria: Mediterranean coast; cooler and wetter than Cairo; Roman heritage; best Mar-Jun
  'EG-ALX': { weather: s12(1,1,1,0,0,0,0,1,0,0,1,1) },
  // Red Sea / Al Bahr al Ahmar (Hurghada / Marsa Alam): desert coast; best Oct-May; diving year-round
  'EG-BA': { weather: s12(1,1,0,0,0,1,2,2,1,0,0,1), beaches:s12(0,0,0,0,0,1,1,1,0,0,0,0) },
  // South Sinai (Sharm el-Sheikh / Dahab): Red Sea resorts; best Oct-May; Sinai peninsula caution
  'EG-JS': { weather: s12(1,1,0,0,0,1,2,2,1,0,0,1), beaches:s12(0,0,0,0,0,1,1,1,0,0,0,0) },
  // Luxor: Upper Egypt; Valley of Kings / Karnak; brutal Jun-Sep heat; best Nov-Feb
  'EG-LX': { weather: s12(0,0,0,1,2,3,3,3,2,1,0,0), crowds:rep(2) },

  // ── Nigeria ─────────────────────────────────────────────────────────────────────
  // National fallbacks: safety:rep(2), health:rep(2), lgbtq:rep(3)
  // Lagos State: commercial megacity; urban crime + traffic chaos; most expensive; very crowded
  'NG-LA': { cost:rep(2), crowds:rep(3) },
  // FCT Abuja: purpose-built capital; more orderly; diplomatic/expat hub; safer than Lagos
  'NG-FC': { safety:rep(1), cost:rep(2) },
  // Kano State: major northern city; Islamic conservative; sharia law applies; high security risk
  'NG-KN': { safety:rep(3) },
  // Rivers State (Port Harcourt): Niger Delta oil hub; kidnapping and armed-gang risk
  'NG-RI': { safety:rep(3) },
  // Cross River (Calabar): southeast; wildlife / ecotourism; more stable than Delta/North
  'NG-CR': { safety:rep(1) },

  // ── Pakistan ───────────────────────────────────────────────────────────────────
  // National fallbacks: safety:rep(2), lgbtq:rep(3), health:rep(1)
  // Islamabad Capital Territory: well-planned diplomatic capital; Margalla Hills; safest major city
  'PK-IS': { safety:rep(1), weather: s12(1,1,1,0,0,1,2,2,1,0,1,1) },
  // Punjab (Lahore): Mughal heritage; safe for tourism; extreme summer heat; best Oct-Mar
  'PK-PB': { safety:rep(1), weather: s12(1,1,0,0,2,3,3,3,1,0,0,1), crowds:rep(2) },
  // Sindh (Karachi): port megacity; urban crime; extreme heat Apr-Jun; best Nov-Feb
  'PK-SD': { weather: s12(0,0,1,2,3,2,1,1,1,0,0,0) },
  // Gilgit-Baltistan (Karakoram / K2 base camp): spectacular mountain trekking; best May-Sep
  'PK-GB': { safety:rep(1), weather: s12(3,3,2,1,0,0,0,0,0,0,1,3), remote:rep(2) },
  // Balochistan: insurgency; kidnapping risk; vast remote desert; travel strongly discouraged
  'PK-BA': { safety:rep(3), remote:rep(3) },

  // ── Philippines ─────────────────────────────────────────────────────────────────
  // Metro Manila: dense megacity; dry Dec-Apr; typhoon-season rains Jul-Oct; heavy traffic
  'PH-MNL': { weather: s12(0,0,1,1,2,2,3,3,3,2,1,0), crowds:rep(2) },
  // Cebu: Visayas hub; beaches + diving; drier than Luzon; less typhoon-exposed
  'PH-CEB': { weather: s12(0,0,0,1,1,2,2,2,2,2,1,0), beaches:s12(0,0,0,1,1,2,2,2,2,1,1,0) },
  // Palawan (El Nido, Coron): the country's best beaches; dry Dec-May, wet Jun-Oct
  'PH-PLW': { weather: s12(0,0,0,0,1,2,3,3,3,2,1,0), beaches:s12(0,0,0,0,1,2,3,3,3,2,1,0) },
  // Bohol: Chocolate Hills, Panglao beaches; similar rhythm to Cebu
  'PH-BOH': { weather: s12(0,0,0,1,1,2,2,2,2,2,1,0), beaches:s12(0,0,0,1,1,2,2,2,2,1,1,0) },
  // Aklan (Boracay): premium island resort; peak crowds Dec-Mar + Holy Week; wet Jul-Sep
  'PH-AKL': { weather: s12(0,0,0,1,1,2,3,3,3,2,1,0), beaches:s12(0,0,0,0,1,2,3,3,2,2,1,0), crowds:s12(3,3,2,2,1,1,1,1,1,1,2,3), cost:rep(2) },
  // Benguet (Baguio): cool mountain "summer capital"; landslide-prone monsoon Jul-Sep
  'PH-BEN': { weather: s12(0,0,0,0,1,2,3,3,3,2,1,0) },
  // Davao: Mindanao's safest major city; outside the typhoon belt; even climate year-round
  'PH-DAV': { weather: rep(1), crowds:rep(1) },
  // Sulu archipelago: active insurgency; kidnapping risk; travel strongly discouraged
  'PH-SLU': { weather: s12(1,1,1,1,1,2,2,2,2,2,1,1), safety:rep(3), solo:rep(3), crowds:rep(0) },

  // ── Malaysia ────────────────────────────────────────────────────────────────────
  // Kuala Lumpur: equatorial; inter-monsoon thunderstorms Mar-Apr & Oct-Nov
  'MY-14': { weather: s12(1,1,2,2,1,1,1,1,1,2,2,1), crowds:rep(1) },
  // Penang (George Town): heritage + food capital; wettest Sep-Nov
  'MY-07': { weather: s12(0,0,1,1,1,1,1,2,2,2,2,1), beaches:s12(1,1,1,1,1,1,1,2,2,2,2,1) },
  // Sabah (Kota Kinabalu, Sipadan): diving best Apr-Sep; eastern-island coastal advisories
  'MY-12': { weather: s12(2,1,1,1,1,1,1,1,1,2,2,2), beaches:s12(1,1,0,0,0,0,0,0,0,1,1,1), safety:rep(2) },
  // Sarawak (Kuching): Borneo longhouses + national parks; NE monsoon soaks Nov-Feb
  'MY-13': { weather: s12(3,2,1,1,1,0,0,0,1,1,2,3) },
  // Terengganu (Perhentian, Redang): east-coast islands shut during Nov-Feb monsoon
  'MY-11': { weather: s12(3,3,1,0,0,0,0,0,1,2,3,3), beaches:s12(3,3,1,0,0,0,0,0,1,2,3,3) },
  // Pahang (Tioman, Cameron Highlands): east-coast monsoon Nov-Feb; highlands cool year-round
  'MY-06': { weather: s12(3,2,1,0,0,0,0,0,1,2,3,3), beaches:s12(3,3,1,0,0,0,0,0,1,2,3,3) },

  // ── South Korea ─────────────────────────────────────────────────────────────────
  // Seoul: bitter winters; jangma monsoon Jul; superb Apr-May & Sep-Oct
  'KR-11': { weather: s12(3,2,1,0,0,1,3,2,0,0,1,2), crowds:rep(2) },
  // Gyeonggi (Suwon, DMZ tours): same continental rhythm as Seoul
  'KR-41': { weather: s12(3,2,1,0,0,1,3,2,0,0,1,2) },
  // Busan: milder coastal; Haeundae beach season Jul-Aug; typhoon fringe Aug-Sep
  'KR-26': { weather: s12(2,2,1,0,0,1,2,2,1,0,1,2), beaches:s12(3,3,2,1,1,1,0,0,1,1,2,3) },
  // Jeju: volcanic resort island; mildest region; very crowded in summer holidays
  'KR-49': { weather: s12(2,2,1,0,0,1,2,2,1,0,1,2), beaches:s12(3,3,2,1,1,0,0,0,1,1,2,3), crowds:s12(1,1,1,2,2,2,3,3,2,2,1,1) },
  // Gangwon (Seoraksan, Pyeongchang): ski Dec-Feb; cool summers; blazing autumn foliage
  'KR-42': { weather: s12(2,2,2,1,0,1,2,2,0,0,1,2) },
  // North Gyeongsang (Gyeongju, Andong): Silla heritage; pleasant spring and autumn
  'KR-47': { weather: s12(2,2,1,0,0,1,2,2,1,0,1,2) },

  // ── Chile ───────────────────────────────────────────────────────────────────────
  // Santiago Metropolitan: Mediterranean; dry warm Nov-Mar; winter rain + smog Jun-Aug
  'CL-RM': { weather: s12(0,0,0,1,2,2,2,2,1,0,0,0) },
  // Antofagasta (San Pedro de Atacama): driest desert on earth; superb year-round; altiplano showers Jan-Feb
  'CL-AN': { weather: s12(1,1,0,0,0,0,0,0,0,0,0,1) },
  // Valparaíso / Viña del Mar: coastal Mediterranean; beach season Dec-Mar (cold Humboldt water)
  'CL-VS': { weather: s12(0,0,0,1,2,2,2,2,1,1,0,0), beaches:s12(0,0,1,2,3,3,3,3,2,2,1,0) },
  // La Araucanía (Pucón): lakes + volcanoes; best Dec-Mar; long rainy winter
  'CL-AR': { weather: s12(0,0,1,2,3,3,3,3,2,1,1,0) },
  // Los Lagos (Puerto Varas, Chiloé): lush and rainy; austral summer is the window
  'CL-LL': { weather: s12(0,1,1,2,3,3,3,3,2,2,1,0) },
  // Magallanes (Torres del Paine): Patagonia; Nov-Mar trekking season; park saturated Dec-Feb
  'CL-MA': { weather: s12(1,1,1,2,3,3,3,3,2,2,1,1), crowds:s12(3,3,2,1,0,0,0,0,0,1,2,3) },

  // ── Poland ──────────────────────────────────────────────────────────────────────
  // Masovian (Warsaw): continental; best May-Sep; grey freezing Nov-Feb
  'PL-MZ': { weather: s12(3,2,2,1,0,0,0,0,0,1,2,3) },
  // Lesser Poland (Kraków, Zakopane): Poland's tourism magnet; busy year-round, packed in summer
  'PL-MA': { weather: s12(3,2,2,1,0,0,0,0,0,1,2,3), crowds:s12(1,1,1,2,2,3,3,3,2,2,1,2) },
  // Pomeranian (Gdańsk, Sopot): Baltic coast; short Jun-Aug beach season
  'PL-PM': { weather: s12(3,3,2,1,1,0,0,0,1,2,2,3), beaches:s12(3,3,3,2,2,1,0,0,2,3,3,3) },
  // Lower Silesian (Wrocław): slightly milder southwest; Christmas markets in December
  'PL-DS': { weather: s12(3,2,2,1,0,0,0,0,0,1,2,3) },
  // Warmian-Masurian: land of a thousand lakes; sailing Jun-Aug; bleak off-season
  'PL-WN': { weather: s12(3,3,2,1,1,0,0,0,1,2,3,3) },

  // ── Switzerland ─────────────────────────────────────────────────────────────────
  // Zürich: lakeside city; best May-Sep; grey inversion fog Nov-Jan
  'CH-ZH': { weather: s12(2,2,1,1,0,0,0,0,0,1,2,2) },
  // Geneva: Lac Léman; mild for Switzerland; best May-Sep
  'CH-GE': { weather: s12(2,2,1,1,0,0,0,0,0,1,2,2) },
  // Bern (incl. Bernese Oberland, Interlaken, Grindelwald), alpine icon; peak-season crowds Jun-Aug
  'CH-BE': { weather: s12(2,2,2,1,1,0,0,0,0,1,2,2), crowds:s12(2,2,1,1,2,3,3,3,2,1,1,2) },
  // Valais (Zermatt, Matterhorn): ski Dec-Apr, hiking Jul-Sep; muddy shoulder May + Nov; premium prices
  'CH-VS': { weather: s12(1,1,1,2,2,1,0,0,0,1,2,1), cost:rep(3) },
  // Graubünden (St. Moritz, Davos): glamour ski resorts; same dual season as Valais
  'CH-GR': { weather: s12(1,1,1,2,2,1,0,0,0,1,2,1), cost:rep(3) },
  // Ticino (Lugano): Italian-speaking south; mildest canton; palm-lined lakes
  'CH-TI': { weather: s12(2,1,1,0,0,0,0,0,0,1,1,2) },

  // ── Sweden ──────────────────────────────────────────────────────────────────────
  // Stockholm: archipelago summers May-Sep; dark Nov-Feb
  'SE-AB': { weather: s12(3,3,2,1,0,0,0,0,1,2,3,3) },
  // Skåne (Malmö, Lund): mildest region; long shoulder seasons
  'SE-M': { weather: s12(3,2,2,1,0,0,0,0,1,1,2,3) },
  // Västra Götaland (Gothenburg): rainy west coast; Jun-Aug window
  'SE-O': { weather: s12(3,3,2,1,0,0,0,0,1,2,3,3) },
  // Gotland (Visby): medieval island; all of Sweden descends in July
  'SE-I': { weather: s12(3,3,2,1,1,0,0,0,1,2,3,3), crowds:s12(0,0,0,0,1,2,3,3,1,0,0,0) },
  // Norrbotten (Swedish Lapland, Abisko, Kiruna), aurora Sep-Mar, midnight sun Jun-Jul; brutal winters
  'SE-BD': { weather: s12(3,3,2,2,1,0,0,0,1,2,3,3), crowds:rep(0) },
  // Jämtland (Åre): Scandinavia's top ski resort Dec-Apr; hiking Jul-Aug
  'SE-Z': { weather: s12(2,2,2,2,2,1,0,0,1,2,2,2) },

  // ── Norway ──────────────────────────────────────────────────────────────────────
  // Oslo: fjord-side capital; best May-Sep
  'NO-03': { weather: s12(3,3,2,1,0,0,0,0,1,2,3,3) },
  // Hordaland (Bergen): gateway to the fjords; rains ~240 days a year
  'NO-12': { weather: s12(3,3,2,2,1,1,1,1,2,2,3,3) },
  // Møre og Romsdal (Geirangerfjord, Ålesund): fjord cruising May-Sep
  'NO-15': { weather: s12(3,3,2,2,1,0,0,0,1,2,3,3) },
  // Nordland (Lofoten): midnight-sun peaks Jun-Aug; surf + aurora shoulder seasons
  'NO-18': { weather: s12(3,3,2,2,1,0,0,0,1,2,3,3) },
  // Troms (Tromsø): aurora capital Sep-Mar; polar night Nov-Jan
  'NO-19': { weather: s12(3,3,2,2,1,0,0,0,1,2,3,3) },
  // Svalbard: high-Arctic frontier; expedition season May-Sep; polar bears outnumber people
  'NO-21': { weather: s12(3,3,3,2,2,1,1,1,2,3,3,3), crowds:rep(0), cost:rep(3) },

  // ── Kenya ───────────────────────────────────────────────────────────────────────
  // Nairobi: 1 800 m altitude keeps it mild; long rains Apr-May; petty-crime caution
  'KE-110': { weather: s12(0,0,2,3,2,1,1,1,0,1,2,1), safety:rep(2) },
  // Coast (Mombasa, Diani, Lamu): Indian Ocean beaches; soaked Apr-Jun
  'KE-300': { weather: s12(0,0,1,3,3,2,1,1,1,1,2,1), beaches:s12(0,0,1,3,3,2,1,0,0,0,1,0) },
  // Rift Valley (Maasai Mara, Nakuru, Naivasha): migration Jul-Oct; lodges packed Jul-Sep
  'KE-700': { weather: s12(1,1,2,3,2,1,0,0,0,1,2,1), crowds:s12(1,1,1,1,1,2,3,3,3,2,1,2) },
  // Eastern (Amboseli, Tsavo East): classic dry-season safari Jun-Oct + Jan-Feb
  'KE-400': { weather: s12(1,1,2,3,2,1,0,0,0,1,2,1) },
  // North-Eastern: Somalia border region; terrorism risk; travel strongly discouraged
  'KE-500': { weather: s12(2,2,2,2,2,1,1,1,1,2,2,2), safety:rep(3), solo:rep(3), crowds:rep(0) },

  // ── Tanzania ────────────────────────────────────────────────────────────────────
  // Arusha: safari capital (Serengeti/Ngorongoro gateway); dry Jun-Oct; long rains Mar-May
  'TZ-01': { weather: s12(1,1,2,3,2,0,0,0,0,1,2,1), crowds:s12(1,1,1,1,1,2,3,3,2,2,1,2) },
  // Mara (northern Serengeti): river-crossing season Jul-Sep draws the world's safari crowds
  'TZ-13': { weather: s12(1,1,2,3,2,1,0,0,0,1,2,1), crowds:s12(1,1,1,1,1,2,3,3,3,2,1,1) },
  // Kilimanjaro (Moshi): summit windows Jan-Mar & Jun-Oct; avoid the Apr-May rains
  'TZ-09': { weather: s12(0,0,1,3,3,1,0,0,0,0,2,1) },
  // Dar es Salaam: hot humid commercial coast; heaviest rain Apr-May
  'TZ-02': { weather: s12(1,1,2,3,3,1,1,1,1,1,2,1) },
  // Zanzibar North (Nungwi, Kendwa): flagship beaches; monsoon rains Mar-May
  'TZ-07': { weather: s12(0,0,1,3,3,1,0,0,0,1,2,1), beaches:s12(0,0,1,3,3,1,0,0,0,0,1,0) },
  // Zanzibar West (Stone Town): Swahili heritage port; same monsoon rhythm
  'TZ-15': { weather: s12(1,1,1,3,3,1,0,0,0,1,2,1) },

  // ── Ecuador ─────────────────────────────────────────────────────────────────────
  // Pichincha (Quito): 2 850 m "eternal spring"; afternoon rains Feb-Apr; acclimatise on arrival
  'EC-P': { weather: s12(1,2,2,2,1,0,0,0,1,1,2,1) },
  // Guayas (Guayaquil): hot humid port; gang violence has sharply raised risk; transit with care
  'EC-G': { weather: s12(2,3,3,2,1,1,1,1,1,1,1,2), safety:rep(3), solo:rep(3) },
  // Galápagos: wildlife unmatched year-round; warm seas Jan-May, cool garúa mist Jun-Dec
  'EC-W': { weather: s12(0,0,0,0,0,1,1,1,1,1,1,0), beaches:rep(0), crowds:rep(1), cost:rep(3) },
  // Azuay (Cuenca): colonial highland gem; mild and spring-like all year
  'EC-A': { weather: s12(1,1,2,2,1,0,0,0,1,1,1,1) },
  // Santa Elena (Montañita, Salinas): surf coast; sunny season Dec-Apr, overcast May-Nov
  'EC-SE': { weather: s12(1,1,1,1,2,2,2,2,2,2,2,1), beaches:s12(0,0,0,0,1,2,2,2,2,2,1,0) },
  // Napo (Tena): Amazon basin; hot, humid and rainy whatever the month
  'EC-N': { weather: rep(2) },

  // ── Costa Rica ──────────────────────────────────────────────────────────────────
  // San José (Central Valley): eternal-spring capital; dry Dec-Apr, wettest Sep-Oct
  'CR-SJ': { weather: s12(0,0,0,1,2,2,2,2,3,3,2,0) },
  // Guanacaste (Tamarindo, Papagayo): driest beach coast; high-season crowds Dec-Feb
  'CR-G': { weather: s12(0,0,0,0,1,2,1,1,2,2,1,0), beaches:s12(0,0,0,0,1,2,1,1,2,2,1,0), crowds:s12(3,3,2,1,1,1,2,1,1,1,2,3) },
  // Puntarenas (Manuel Antonio, Monteverde, Osa): lush Pacific; deluges Sep-Oct
  'CR-P': { weather: s12(0,0,0,1,2,2,2,2,3,3,2,1) },
  // Limón (Puerto Viejo, Tortuguero), Caribbean side; inverted seasons, driest Feb-Mar & Sep-Oct
  'CR-L': { weather: s12(1,0,0,1,2,2,2,1,0,0,2,2) },
  // Alajuela (Arenal, La Fortuna): volcano + hot springs; rain eases Feb-Apr
  'CR-A': { weather: s12(0,0,0,1,2,2,2,2,2,2,2,1) },

};

// ─── Admin-1 code aliases ─────────────────────────────────────────────────────
// Natural Earth's iso_3166_2 uses different subdivision conventions than
// CD_A1 for several countries (China letter codes vs GB/T numeric; Spanish
// provinces vs autonomous communities; French departments vs regions; Italian
// provinces vs regions; GB districts vs home nations; assorted legacy codes).
// Maps NE feature code → the CD_A1 key whose ratings it should inherit.
// GENERATED from the original NE properties: regenerate alongside CD_A1.
const CD_A1_ALIAS = {
  'CN-AH': 'CN-34',
  'CN-BJ': 'CN-11',
  'CN-CQ': 'CN-50',
  'CN-FJ': 'CN-35',
  'CN-GD': 'CN-44',
  'CN-GS': 'CN-62',
  'CN-GX': 'CN-45',
  'CN-GZ': 'CN-52',
  'CN-HA': 'CN-41',
  'CN-HB': 'CN-42',
  'CN-HE': 'CN-13',
  'CN-HI': 'CN-46',
  'CN-HL': 'CN-23',
  'CN-HN': 'CN-43',
  'CN-JL': 'CN-22',
  'CN-JS': 'CN-32',
  'CN-JX': 'CN-36',
  'CN-LN': 'CN-21',
  'CN-NM': 'CN-15',
  'CN-NX': 'CN-64',
  'CN-QH': 'CN-63',
  'CN-SC': 'CN-51',
  'CN-SD': 'CN-37',
  'CN-SH': 'CN-31',
  'CN-SN': 'CN-61',
  'CN-SX': 'CN-14',
  'CN-TJ': 'CN-12',
  'CN-XJ': 'CN-65',
  'CN-XZ': 'CN-54',
  'CN-YN': 'CN-53',
  'CN-ZJ': 'CN-33',
  'CO-CUN': 'CO-DC',
  'ES-A': 'ES-VC',
  'ES-AB': 'ES-CM',
  'ES-AL': 'ES-AN',
  'ES-AV': 'ES-CL',
  'ES-B': 'ES-CT',
  'ES-BA': 'ES-EX',
  'ES-BI': 'ES-PV',
  'ES-BU': 'ES-CL',
  'ES-C': 'ES-GA',
  'ES-CA': 'ES-AN',
  'ES-CC': 'ES-EX',
  'ES-CO': 'ES-AN',
  'ES-CR': 'ES-CM',
  'ES-CS': 'ES-VC',
  'ES-CU': 'ES-CM',
  'ES-GC': 'ES-CN',
  'ES-GI': 'ES-CT',
  'ES-GR': 'ES-AN',
  'ES-GU': 'ES-CM',
  'ES-H': 'ES-AN',
  'ES-HU': 'ES-AR',
  'ES-J': 'ES-AN',
  'ES-L': 'ES-CT',
  'ES-LE': 'ES-CL',
  'ES-LO': 'ES-RI',
  'ES-LU': 'ES-GA',
  'ES-M': 'ES-MD',
  'ES-MA': 'ES-AN',
  'ES-MU': 'ES-MC',
  'ES-NA': 'ES-NC',
  'ES-O': 'ES-AS',
  'ES-OR': 'ES-GA',
  'ES-P': 'ES-CL',
  'ES-PM': 'ES-IB',
  'ES-PO': 'ES-GA',
  'ES-S': 'ES-CB',
  'ES-SA': 'ES-CL',
  'ES-SE': 'ES-AN',
  'ES-SG': 'ES-CL',
  'ES-SO': 'ES-CL',
  'ES-SS': 'ES-PV',
  'ES-T': 'ES-CT',
  'ES-TE': 'ES-AR',
  'ES-TF': 'ES-CN',
  'ES-TO': 'ES-CM',
  'ES-V': 'ES-VC',
  'ES-VA': 'ES-CL',
  'ES-VI': 'ES-PV',
  'ES-Z': 'ES-AR',
  'ES-ZA': 'ES-CL',
  'FR-01': 'FR-ARA',
  'FR-02': 'FR-HDF',
  'FR-03': 'FR-ARA',
  'FR-04': 'FR-PAC',
  'FR-05': 'FR-PAC',
  'FR-06': 'FR-PAC',
  'FR-07': 'FR-ARA',
  'FR-08': 'FR-GES',
  'FR-09': 'FR-OCC',
  'FR-10': 'FR-GES',
  'FR-11': 'FR-OCC',
  'FR-12': 'FR-OCC',
  'FR-13': 'FR-PAC',
  'FR-14': 'FR-NOR',
  'FR-15': 'FR-ARA',
  'FR-16': 'FR-NAQ',
  'FR-17': 'FR-NAQ',
  'FR-18': 'FR-CVL',
  'FR-19': 'FR-NAQ',
  'FR-21': 'FR-BFC',
  'FR-22': 'FR-BRE',
  'FR-23': 'FR-NAQ',
  'FR-24': 'FR-NAQ',
  'FR-25': 'FR-BFC',
  'FR-26': 'FR-ARA',
  'FR-27': 'FR-NOR',
  'FR-28': 'FR-CVL',
  'FR-29': 'FR-BRE',
  'FR-2A': 'FR-COR',
  'FR-2B': 'FR-COR',
  'FR-30': 'FR-OCC',
  'FR-31': 'FR-OCC',
  'FR-32': 'FR-OCC',
  'FR-33': 'FR-NAQ',
  'FR-34': 'FR-OCC',
  'FR-35': 'FR-BRE',
  'FR-36': 'FR-CVL',
  'FR-37': 'FR-CVL',
  'FR-38': 'FR-ARA',
  'FR-39': 'FR-BFC',
  'FR-40': 'FR-NAQ',
  'FR-41': 'FR-CVL',
  'FR-42': 'FR-ARA',
  'FR-43': 'FR-ARA',
  'FR-44': 'FR-PDL',
  'FR-45': 'FR-CVL',
  'FR-46': 'FR-OCC',
  'FR-47': 'FR-NAQ',
  'FR-48': 'FR-OCC',
  'FR-49': 'FR-PDL',
  'FR-50': 'FR-NOR',
  'FR-51': 'FR-GES',
  'FR-52': 'FR-GES',
  'FR-53': 'FR-PDL',
  'FR-54': 'FR-GES',
  'FR-55': 'FR-GES',
  'FR-56': 'FR-BRE',
  'FR-57': 'FR-GES',
  'FR-58': 'FR-BFC',
  'FR-59': 'FR-HDF',
  'FR-60': 'FR-HDF',
  'FR-61': 'FR-NOR',
  'FR-62': 'FR-HDF',
  'FR-63': 'FR-ARA',
  'FR-64': 'FR-NAQ',
  'FR-65': 'FR-OCC',
  'FR-66': 'FR-OCC',
  'FR-67': 'FR-GES',
  'FR-68': 'FR-GES',
  'FR-69': 'FR-ARA',
  'FR-70': 'FR-BFC',
  'FR-71': 'FR-BFC',
  'FR-72': 'FR-PDL',
  'FR-73': 'FR-ARA',
  'FR-74': 'FR-ARA',
  'FR-75': 'FR-IDF',
  'FR-76': 'FR-NOR',
  'FR-77': 'FR-IDF',
  'FR-78': 'FR-IDF',
  'FR-79': 'FR-NAQ',
  'FR-80': 'FR-HDF',
  'FR-81': 'FR-OCC',
  'FR-82': 'FR-OCC',
  'FR-83': 'FR-PAC',
  'FR-84': 'FR-PAC',
  'FR-85': 'FR-PDL',
  'FR-86': 'FR-NAQ',
  'FR-87': 'FR-NAQ',
  'FR-88': 'FR-GES',
  'FR-89': 'FR-BFC',
  'FR-90': 'FR-BFC',
  'FR-91': 'FR-IDF',
  'FR-92': 'FR-IDF',
  'FR-93': 'FR-IDF',
  'FR-94': 'FR-IDF',
  'FR-95': 'FR-IDF',
  'GB-ABD': 'GB-SCT',
  'GB-ABE': 'GB-SCT',
  'GB-AGB': 'GB-SCT',
  'GB-AGY': 'GB-WLS',
  'GB-ANS': 'GB-SCT',
  'GB-ANT': 'GB-NIR',
  'GB-ARD': 'GB-NIR',
  'GB-ARM': 'GB-NIR',
  'GB-BAS': 'GB-ENG',
  'GB-BBD': 'GB-ENG',
  'GB-BDF': 'GB-ENG',
  'GB-BDG': 'GB-ENG',
  'GB-BEN': 'GB-ENG',
  'GB-BEX': 'GB-ENG',
  'GB-BFS': 'GB-NIR',
  'GB-BGE': 'GB-WLS',
  'GB-BGW': 'GB-WLS',
  'GB-BIR': 'GB-ENG',
  'GB-BKM': 'GB-ENG',
  'GB-BLA': 'GB-NIR',
  'GB-BLY': 'GB-NIR',
  'GB-BMH': 'GB-ENG',
  'GB-BNB': 'GB-NIR',
  'GB-BNE': 'GB-ENG',
  'GB-BNH': 'GB-ENG',
  'GB-BNS': 'GB-ENG',
  'GB-BOL': 'GB-ENG',
  'GB-BPL': 'GB-ENG',
  'GB-BRC': 'GB-ENG',
  'GB-BRD': 'GB-ENG',
  'GB-BRY': 'GB-ENG',
  'GB-BST': 'GB-ENG',
  'GB-BUR': 'GB-ENG',
  'GB-CAM': 'GB-ENG',
  'GB-CAY': 'GB-WLS',
  'GB-CBF': 'GB-ENG',
  'GB-CGN': 'GB-WLS',
  'GB-CGV': 'GB-NIR',
  'GB-CHE': 'GB-ENG',
  'GB-CHW': 'GB-ENG',
  'GB-CKF': 'GB-NIR',
  'GB-CKT': 'GB-NIR',
  'GB-CLD': 'GB-ENG',
  'GB-CLK': 'GB-SCT',
  'GB-CLR': 'GB-NIR',
  'GB-CMA': 'GB-ENG',
  'GB-CMD': 'GB-ENG',
  'GB-CMN': 'GB-WLS',
  'GB-CON': 'GB-ENG',
  'GB-COV': 'GB-ENG',
  'GB-CRF': 'GB-WLS',
  'GB-CRY': 'GB-ENG',
  'GB-CSR': 'GB-NIR',
  'GB-CWY': 'GB-WLS',
  'GB-DAL': 'GB-ENG',
  'GB-DBY': 'GB-ENG',
  'GB-DEN': 'GB-WLS',
  'GB-DER': 'GB-ENG',
  'GB-DEV': 'GB-ENG',
  'GB-DGN': 'GB-NIR',
  'GB-DGY': 'GB-SCT',
  'GB-DNC': 'GB-ENG',
  'GB-DND': 'GB-SCT',
  'GB-DOR': 'GB-ENG',
  'GB-DOW': 'GB-NIR',
  'GB-DRY': 'GB-NIR',
  'GB-DUD': 'GB-ENG',
  'GB-DUR': 'GB-ENG',
  'GB-EAL': 'GB-ENG',
  'GB-EAY': 'GB-SCT',
  'GB-EDH': 'GB-SCT',
  'GB-EDU': 'GB-SCT',
  'GB-ELN': 'GB-SCT',
  'GB-ELS': 'GB-SCT',
  'GB-ENF': 'GB-ENG',
  'GB-ERW': 'GB-SCT',
  'GB-ERY': 'GB-ENG',
  'GB-ESS': 'GB-ENG',
  'GB-ESX': 'GB-ENG',
  'GB-FAL': 'GB-SCT',
  'GB-FER': 'GB-NIR',
  'GB-FIF': 'GB-SCT',
  'GB-FLN': 'GB-WLS',
  'GB-GAT': 'GB-ENG',
  'GB-GLG': 'GB-SCT',
  'GB-GLS': 'GB-ENG',
  'GB-GRE': 'GB-ENG',
  'GB-GWN': 'GB-WLS',
  'GB-HAL': 'GB-ENG',
  'GB-HAM': 'GB-ENG',
  'GB-HAV': 'GB-ENG',
  'GB-HCK': 'GB-ENG',
  'GB-HEF': 'GB-ENG',
  'GB-HIL': 'GB-ENG',
  'GB-HLD': 'GB-SCT',
  'GB-HMF': 'GB-ENG',
  'GB-HNS': 'GB-ENG',
  'GB-HPL': 'GB-ENG',
  'GB-HRT': 'GB-ENG',
  'GB-HRW': 'GB-ENG',
  'GB-HRY': 'GB-ENG',
  'GB-IOS': 'GB-ENG',
  'GB-IOW': 'GB-ENG',
  'GB-ISL': 'GB-ENG',
  'GB-IVC': 'GB-SCT',
  'GB-KEC': 'GB-ENG',
  'GB-KEN': 'GB-ENG',
  'GB-KHL': 'GB-ENG',
  'GB-KIR': 'GB-ENG',
  'GB-KTT': 'GB-ENG',
  'GB-KWL': 'GB-ENG',
  'GB-LAN': 'GB-ENG',
  'GB-LBH': 'GB-ENG',
  'GB-LCE': 'GB-ENG',
  'GB-LDS': 'GB-ENG',
  'GB-LEC': 'GB-ENG',
  'GB-LEW': 'GB-ENG',
  'GB-LIN': 'GB-ENG',
  'GB-LIV': 'GB-ENG',
  'GB-LMV': 'GB-NIR',
  'GB-LND': 'GB-ENG',
  'GB-LRN': 'GB-NIR',
  'GB-LSB': 'GB-NIR',
  'GB-LUT': 'GB-ENG',
  'GB-MAN': 'GB-ENG',
  'GB-MDB': 'GB-ENG',
  'GB-MDW': 'GB-ENG',
  'GB-MFT': 'GB-NIR',
  'GB-MIK': 'GB-ENG',
  'GB-MLN': 'GB-SCT',
  'GB-MON': 'GB-WLS',
  'GB-MRT': 'GB-ENG',
  'GB-MRY': 'GB-SCT',
  'GB-MTY': 'GB-WLS',
  'GB-MYL': 'GB-NIR',
  'GB-NAY': 'GB-SCT',
  'GB-NBL': 'GB-ENG',
  'GB-NDN': 'GB-NIR',
  'GB-NEL': 'GB-ENG',
  'GB-NET': 'GB-ENG',
  'GB-NFK': 'GB-ENG',
  'GB-NGM': 'GB-ENG',
  'GB-NLK': 'GB-SCT',
  'GB-NLN': 'GB-ENG',
  'GB-NSM': 'GB-ENG',
  'GB-NTA': 'GB-NIR',
  'GB-NTH': 'GB-ENG',
  'GB-NTL': 'GB-WLS',
  'GB-NTT': 'GB-ENG',
  'GB-NTY': 'GB-ENG',
  'GB-NWM': 'GB-ENG',
  'GB-NWP': 'GB-WLS',
  'GB-NYK': 'GB-ENG',
  'GB-NYM': 'GB-NIR',
  'GB-OLD': 'GB-ENG',
  'GB-OMH': 'GB-NIR',
  'GB-ORK': 'GB-SCT',
  'GB-OXF': 'GB-ENG',
  'GB-PEM': 'GB-WLS',
  'GB-PKN': 'GB-SCT',
  'GB-PLY': 'GB-ENG',
  'GB-POL': 'GB-ENG',
  'GB-POR': 'GB-ENG',
  'GB-POW': 'GB-WLS',
  'GB-PTE': 'GB-ENG',
  'GB-RCC': 'GB-ENG',
  'GB-RCH': 'GB-ENG',
  'GB-RCT': 'GB-WLS',
  'GB-RDB': 'GB-ENG',
  'GB-RDG': 'GB-ENG',
  'GB-RFW': 'GB-SCT',
  'GB-RIC': 'GB-ENG',
  'GB-ROT': 'GB-ENG',
  'GB-RUT': 'GB-ENG',
  'GB-SAW': 'GB-ENG',
  'GB-SAY': 'GB-SCT',
  'GB-SCB': 'GB-SCT',
  'GB-SFK': 'GB-ENG',
  'GB-SFT': 'GB-ENG',
  'GB-SGC': 'GB-ENG',
  'GB-SHF': 'GB-ENG',
  'GB-SHN': 'GB-ENG',
  'GB-SHR': 'GB-ENG',
  'GB-SKP': 'GB-ENG',
  'GB-SLF': 'GB-ENG',
  'GB-SLG': 'GB-ENG',
  'GB-SLK': 'GB-SCT',
  'GB-SND': 'GB-ENG',
  'GB-SOL': 'GB-ENG',
  'GB-SOM': 'GB-ENG',
  'GB-SOS': 'GB-ENG',
  'GB-SRY': 'GB-ENG',
  'GB-STB': 'GB-NIR',
  'GB-STE': 'GB-ENG',
  'GB-STG': 'GB-SCT',
  'GB-STH': 'GB-ENG',
  'GB-STN': 'GB-ENG',
  'GB-STS': 'GB-ENG',
  'GB-STT': 'GB-ENG',
  'GB-STY': 'GB-ENG',
  'GB-SWA': 'GB-WLS',
  'GB-SWD': 'GB-ENG',
  'GB-SWK': 'GB-ENG',
  'GB-TAM': 'GB-ENG',
  'GB-TFW': 'GB-ENG',
  'GB-THR': 'GB-ENG',
  'GB-TOB': 'GB-ENG',
  'GB-TOF': 'GB-WLS',
  'GB-TRF': 'GB-ENG',
  'GB-TWH': 'GB-ENG',
  'GB-VGL': 'GB-WLS',
  'GB-WAR': 'GB-ENG',
  'GB-WBK': 'GB-ENG',
  'GB-WDU': 'GB-SCT',
  'GB-WFT': 'GB-ENG',
  'GB-WGN': 'GB-ENG',
  'GB-WIL': 'GB-ENG',
  'GB-WKF': 'GB-ENG',
  'GB-WLL': 'GB-ENG',
  'GB-WLN': 'GB-SCT',
  'GB-WLV': 'GB-ENG',
  'GB-WND': 'GB-ENG',
  'GB-WNM': 'GB-ENG',
  'GB-WOK': 'GB-ENG',
  'GB-WOR': 'GB-ENG',
  'GB-WRL': 'GB-ENG',
  'GB-WRT': 'GB-ENG',
  'GB-WRX': 'GB-WLS',
  'GB-WSM': 'GB-ENG',
  'GB-WSX': 'GB-ENG',
  'GB-YOR': 'GB-ENG',
  'GB-ZET': 'GB-SCT',
  'GR-A1': 'GR-I',
  'IN-OR': 'IN-OD',
  'IN-TG': 'IN-TS',
  'IN-UT': 'IN-UK',
  'IT-AG': 'IT-82',
  'IT-AR': 'IT-52',
  'IT-AV': 'IT-72',
  'IT-BA': 'IT-75',
  'IT-BG': 'IT-25',
  'IT-BL': 'IT-34',
  'IT-BN': 'IT-72',
  'IT-BR': 'IT-75',
  'IT-BS': 'IT-25',
  'IT-BT': 'IT-75',
  'IT-BZ': 'IT-TAA',
  'IT-CA': 'IT-88',
  'IT-CE': 'IT-72',
  'IT-CI': 'IT-88',
  'IT-CL': 'IT-82',
  'IT-CO': 'IT-25',
  'IT-CR': 'IT-25',
  'IT-CT': 'IT-82',
  'IT-EN': 'IT-82',
  'IT-FG': 'IT-75',
  'IT-FI': 'IT-52',
  'IT-FR': 'IT-62',
  'IT-GE': 'IT-LIG',
  'IT-GR': 'IT-52',
  'IT-IM': 'IT-LIG',
  'IT-LC': 'IT-25',
  'IT-LE': 'IT-75',
  'IT-LI': 'IT-52',
  'IT-LO': 'IT-25',
  'IT-LT': 'IT-62',
  'IT-LU': 'IT-52',
  'IT-MB': 'IT-25',
  'IT-ME': 'IT-82',
  'IT-MI': 'IT-25',
  'IT-MN': 'IT-25',
  'IT-MS': 'IT-52',
  'IT-NA': 'IT-72',
  'IT-NU': 'IT-88',
  'IT-OG': 'IT-88',
  'IT-OR': 'IT-88',
  'IT-OT': 'IT-88',
  'IT-PA': 'IT-82',
  'IT-PD': 'IT-34',
  'IT-PI': 'IT-52',
  'IT-PO': 'IT-52',
  'IT-PT': 'IT-52',
  'IT-PV': 'IT-25',
  'IT-RG': 'IT-82',
  'IT-RI': 'IT-62',
  'IT-RM': 'IT-62',
  'IT-RO': 'IT-34',
  'IT-SA': 'IT-72',
  'IT-SI': 'IT-52',
  'IT-SO': 'IT-25',
  'IT-SP': 'IT-LIG',
  'IT-SR': 'IT-82',
  'IT-SS': 'IT-88',
  'IT-SV': 'IT-LIG',
  'IT-TA': 'IT-75',
  'IT-TN': 'IT-TAA',
  'IT-TP': 'IT-82',
  'IT-TV': 'IT-34',
  'IT-VA': 'IT-25',
  'IT-VE': 'IT-34',
  'IT-VI': 'IT-34',
  'IT-VR': 'IT-34',
  'IT-VS': 'IT-88',
  'IT-VT': 'IT-62',
  'MX-DIF': 'MX-CMX',
  'ZA-GT': 'ZA-GP',
  'ZA-NL': 'ZA-KZN',
};

// ─── Province search index ────────────────────────────────────────────────────
// One entry per CD_A1-rated province: n = English display name, a = optional
// local/alternate name (both searched), c = display centre. GENERATED from
// data/admin1.geojson (alias-aware): regenerate when CD_A1 gains countries.
const ADMIN1_SEARCH = {
  'AR-B': { n:'Buenos Aires', c:[-37.15,-60.03] },
  'AR-C': { n:'Buenos Aires', a:'Ciudad de Buenos Aires', c:[-34.65,-58.44] },
  'AR-M': { n:'Mendoza', c:[-34.76,-68.54] },
  'AR-N': { n:'Misiones', c:[-26.82,-54.84] },
  'AR-Q': { n:'Neuquén', c:[-38.61,-69.98] },
  'AR-Y': { n:'Jujuy', c:[-23.20,-65.71] },
  'AR-Z': { n:'Santa Cruz', c:[-49.20,-69.64] },
  'AU-NSW': { n:'Lord Howe Island', c:[-32.83,150.05] },
  'AU-NT': { n:'Northern Territory', c:[-18.48,133.50] },
  'AU-QLD': { n:'Queensland', c:[-19.21,145.77] },
  'AU-SA': { n:'South Australia', c:[-32.04,135.00] },
  'AU-TAS': { n:'Tasmania', c:[-41.61,146.16] },
  'AU-VIC': { n:'Victoria', c:[-36.57,145.47] },
  'AU-WA': { n:'Western Australia', c:[-24.43,120.96] },
  'BR-AM': { n:'Amazonas', c:[-3.80,-65.06] },
  'BR-BA': { n:'Bahia', c:[-13.43,-41.97] },
  'BR-CE': { n:'Ceará', c:[-5.32,-39.34] },
  'BR-MG': { n:'Minas Gerais', c:[-18.57,-45.44] },
  'BR-PA': { n:'Pará', c:[-3.62,-52.52] },
  'BR-PE': { n:'Pernambuco', c:[-8.38,-38.09] },
  'BR-RJ': { n:'Rio de Janeiro', c:[-22.07,-42.91] },
  'BR-RS': { n:'Rio Grande do Sul', c:[-30.41,-53.66] },
  'BR-SC': { n:'Santa Catarina', c:[-27.66,-51.11] },
  'BR-SP': { n:'São Paulo', c:[-22.54,-48.66] },
  'CA-AB': { n:'Alberta', c:[54.50,-115.00] },
  'CA-BC': { n:'British Columbia', c:[54.15,-126.55] },
  'CA-NS': { n:'Nova Scotia', c:[45.23,-63.01] },
  'CA-ON': { n:'Ontario', c:[49.27,-84.75] },
  'CA-QC': { n:'Quebec', a:'Québec', c:[53.80,-68.43] },
  'CA-YT': { n:'Yukon', c:[64.83,-132.41] },
  'CH-BE': { n:'Bern', c:[46.84,7.65] },
  'CH-GE': { n:'Geneva', a:'Genève', c:[46.23,6.12] },
  'CH-GR': { n:'Grisons', a:'Graubünden', c:[46.62,9.56] },
  'CH-TI': { n:'Ticino', c:[46.23,8.77] },
  'CH-VS': { n:'Valais', c:[46.27,7.61] },
  'CH-ZH': { n:'Zürich', c:[47.43,8.66] },
  'CL-AN': { n:'Antofagasta', c:[-23.48,-68.88] },
  'CL-AR': { n:'Araucanía', a:'La Araucanía', c:[-38.69,-72.39] },
  'CL-LL': { n:'Los Lagos', c:[-42.16,-73.03] },
  'CL-MA': { n:'Magellan and the Chilean Antarctic', a:'Magallanes y Antártica Chilena', c:[-52.28,-71.04] },
  'CL-RM': { n:'Santiago', a:'Región Metropolitana de Santiago', c:[-33.62,-70.75] },
  'CL-VS': { n:'Valparaíso', c:[-30.12,-89.73] },
  'CN-11': { n:'North China', c:[40.24,116.46] },
  'CN-12': { n:'North China', c:[39.41,117.35] },
  'CN-13': { n:'North China', c:[39.34,116.64] },
  'CN-14': { n:'North China', c:[37.66,112.39] },
  'CN-15': { n:'North China', c:[45.36,111.62] },
  'CN-21': { n:'Northeast China', c:[41.10,122.31] },
  'CN-22': { n:'Northeast China', c:[43.58,126.47] },
  'CN-23': { n:'Northeast China', c:[48.50,127.97] },
  'CN-31': { n:'East China', c:[31.27,121.42] },
  'CN-32': { n:'East China', c:[32.94,119.15] },
  'CN-33': { n:'East China', c:[29.18,120.27] },
  'CN-34': { n:'East China', c:[32.03,117.25] },
  'CN-35': { n:'CN-35', c:[25.95,118.14] },
  'CN-36': { n:'East China', c:[27.28,116.02] },
  'CN-37': { n:'East China', c:[36.40,118.76] },
  'CN-41': { n:'South Central China', c:[33.88,113.48] },
  'CN-42': { n:'South Central China', c:[31.17,112.26] },
  'CN-43': { n:'South Central China', c:[27.37,111.51] },
  'CN-44': { n:'South Central China', c:[22.88,113.42] },
  'CN-45': { n:'South Central China', c:[23.71,108.27] },
  'CN-46': { n:'South Central China', c:[19.17,109.82] },
  'CN-50': { n:'Southwest China', c:[30.19,107.73] },
  'CN-51': { n:'Southwest China', c:[30.17,102.94] },
  'CN-52': { n:'Southwest China', c:[26.94,106.56] },
  'CN-53': { n:'Southwest China', c:[25.18,101.86] },
  'CN-54': { n:'Southwest China', c:[31.88,88.74] },
  'CN-61': { n:'Northwest China', c:[35.64,108.36] },
  'CN-62': { n:'Northwest China', c:[37.69,100.73] },
  'CN-63': { n:'Northwest China', c:[35.43,96.24] },
  'CN-64': { n:'Northwest China', c:[37.31,106.01] },
  'CN-65': { n:'Northwest China', c:[41.75,84.98] },
  'CO-ANT': { n:'Antioquia', c:[7.15,-75.51] },
  'CO-BOL': { n:'Bolívar', c:[8.90,-74.73] },
  'CO-DC': { n:'CO-DC', c:[4.75,-73.97] },
  'CO-MAG': { n:'Magdalena', c:[10.12,-74.25] },
  'CO-QUI': { n:'Quindío', c:[4.40,-75.64] },
  'CO-VAC': { n:'Valle del Cauca', c:[4.06,-76.59] },
  'CR-A': { n:'Alajuela', c:[10.45,-84.80] },
  'CR-G': { n:'Guanacaste', c:[10.47,-85.36] },
  'CR-L': { n:'Limón', c:[10.00,-83.25] },
  'CR-P': { n:'Puntarenas', c:[7.92,-84.92] },
  'CR-SJ': { n:'San José', c:[9.63,-84.01] },
  'DE-BB': { n:'Brandenburg', c:[52.45,13.02] },
  'DE-BE': { n:'Berlin', c:[52.50,13.42] },
  'DE-BW': { n:'Baden-Württemberg', c:[48.66,9.00] },
  'DE-BY': { n:'Bavaria', a:'Bayern', c:[48.92,11.40] },
  'DE-HB': { n:'Free Hanseatic Bremen', a:'Bremen', c:[53.32,8.74] },
  'DE-HE': { n:'Hesse', a:'Hessen', c:[50.53,9.00] },
  'DE-HH': { n:'Hamburg', c:[53.57,10.03] },
  'DE-MV': { n:'Mecklenburg-Western Pomerania', a:'Mecklenburg-Vorpommern', c:[53.90,12.50] },
  'DE-NI': { n:'Lower Saxony', a:'Niedersachsen', c:[52.59,9.12] },
  'DE-NW': { n:'North Rhine-Westphalia', a:'Nordrhein-Westfalen', c:[51.42,7.66] },
  'DE-RP': { n:'Rhineland-Palatinate', a:'Rheinland-Pfalz', c:[49.95,7.30] },
  'DE-SH': { n:'Schleswig-Holstein', c:[54.21,9.60] },
  'DE-SL': { n:'Saarland', c:[49.37,6.87] },
  'DE-SN': { n:'Saxony', a:'Sachsen', c:[50.92,13.46] },
  'DE-ST': { n:'Saxony-Anhalt', a:'Sachsen-Anhalt', c:[51.99,11.90] },
  'DE-TH': { n:'Thuringia', a:'Thüringen', c:[50.92,11.26] },
  'EC-A': { n:'Azuay', c:[-3.07,-79.09] },
  'EC-G': { n:'Guayas', c:[-1.95,-79.84] },
  'EC-N': { n:'Napo', c:[-1.24,-78.52] },
  'EC-P': { n:'Pichincha', c:[-0.18,-78.60] },
  'EC-SE': { n:'Santa Elena', c:[-2.09,-80.61] },
  'EC-W': { n:'Galápagos', c:[0.13,-90.63] },
  'EG-ALX': { n:'Alexandria', a:'Al Iskandariyah', c:[30.84,29.85] },
  'EG-BA': { n:'Red Sea', a:'Al Bahr al Ahmar', c:[25.65,33.86] },
  'EG-C': { n:'Cairo', a:'Al Qahirah', c:[30.05,31.58] },
  'EG-JS': { n:'South Sinai', a:'Janub Sina\'', c:[28.83,33.77] },
  'EG-LX': { n:'Luxor', c:[25.71,32.65] },
  'ES-AN': { n:'Andalusia', a:'Andalucía', c:[37.37,-4.59] },
  'ES-AR': { n:'Aragon', a:'Aragón', c:[41.39,-0.70] },
  'ES-AS': { n:'Asturias', c:[43.28,-5.84] },
  'ES-CB': { n:'Cantabria', c:[43.14,-3.99] },
  'ES-CL': { n:'Castile and León', a:'Castilla y León', c:[41.66,-4.43] },
  'ES-CM': { n:'Castilla-La Mancha', c:[39.67,-3.15] },
  'ES-CN': { n:'Canary Islands', a:'Canarias', c:[28.47,-15.79] },
  'ES-CT': { n:'Catalonia', a:'Cataluña', c:[41.69,1.74] },
  'ES-EX': { n:'Extremadura', c:[39.21,-6.11] },
  'ES-GA': { n:'Galicia', c:[42.80,-8.01] },
  'ES-IB': { n:'Balearic Islands', a:'Islas Baleares', c:[39.36,2.77] },
  'ES-MC': { n:'Murcia', c:[38.07,-1.52] },
  'ES-MD': { n:'Madrid', c:[40.53,-3.82] },
  'ES-NC': { n:'Navarre', a:'Navarra', c:[42.61,-1.62] },
  'ES-PV': { n:'Basque Country', a:'País Vasco', c:[42.97,-2.60] },
  'ES-RI': { n:'La Rioja', c:[42.28,-2.40] },
  'ES-VC': { n:'Valencia', a:'Comunidad Valenciana', c:[39.31,-0.50] },
  'FR-ARA': { n:'Auvergne-Rhône-Alpes', c:[45.46,4.61] },
  'FR-BFC': { n:'Bourgogne-Franche-Comté', c:[47.29,4.99] },
  'FR-BRE': { n:'Bretagne', c:[48.09,-3.09] },
  'FR-COR': { n:'Corse', c:[42.19,9.05] },
  'FR-CVL': { n:'Centre-Val de Loire', c:[47.65,1.59] },
  'FR-GES': { n:'Grand Est', c:[48.79,5.79] },
  'FR-HDF': { n:'Hauts-de-France', c:[49.97,2.81] },
  'FR-IDF': { n:'Île-de-France', a:'Paris region', c:[48.68,2.49] },
  'FR-NAQ': { n:'Nouvelle-Aquitaine', c:[44.97,0.40] },
  'FR-NOR': { n:'Normandie', c:[49.12,-0.08] },
  'FR-OCC': { n:'Occitanie', c:[43.69,2.27] },
  'FR-PAC': { n:'Provence-Alpes-Côte d\'Azur', a:'Provence', c:[44.06,5.95] },
  'FR-PDL': { n:'Pays de la Loire', c:[47.42,-0.82] },
  'GB-ENG': { n:'England', c:[52.86,-2.29] },
  'GB-NIR': { n:'Northern Ireland', c:[54.67,-6.80] },
  'GB-SCT': { n:'Scotland', c:[57.74,-7.22] },
  'GB-WLS': { n:'Wales', c:[52.41,-3.98] },
  'GR-C': { n:'West Macedonia', a:'Dytiki Makedonia', c:[40.36,21.46] },
  'GR-F': { n:'Ionian Islands', a:'Ionioi Nisoi', c:[38.74,20.31] },
  'GR-I': { n:'Peloponnisos', c:[37.09,23.49] },
  'GR-L': { n:'South Aegean', a:'Notio Aigaio', c:[36.67,26.26] },
  'GR-M': { n:'Crete', a:'Kriti', c:[35.25,24.92] },
  'ID-BA': { n:'Bali', c:[-8.45,115.08] },
  'ID-JI': { n:'East Java', a:'Jawa Timur', c:[-7.25,113.42] },
  'ID-JK': { n:'Jakarta', a:'Jakarta Raya', c:[-6.22,106.84] },
  'ID-KI': { n:'East Kalimantan', a:'Kalimantan Timur', c:[1.02,116.39] },
  'ID-PA': { n:'Papua', c:[-4.87,137.61] },
  'ID-SU': { n:'North Sumatra', a:'Sumatera Utara', c:[1.85,98.75] },
  'IN-AP': { n:'Andhra Pradesh', c:[15.90,80.75] },
  'IN-AS': { n:'Assam', c:[26.06,92.83] },
  'IN-BR': { n:'Bihar', c:[25.91,85.81] },
  'IN-DL': { n:'Delhi', c:[28.66,77.09] },
  'IN-GA': { n:'Goa', c:[15.34,74.00] },
  'IN-GJ': { n:'Gujarat', c:[22.39,71.30] },
  'IN-HP': { n:'Himachal Pradesh', c:[31.81,77.29] },
  'IN-JK': { n:'Jammu and Kashmir', c:[33.54,75.26] },
  'IN-KA': { n:'Karnataka', c:[15.04,76.33] },
  'IN-KL': { n:'Kerala', c:[10.53,76.13] },
  'IN-MH': { n:'Maharashtra', c:[18.82,76.77] },
  'IN-MP': { n:'Madhya Pradesh', c:[23.97,78.42] },
  'IN-OD': { n:'East', c:[20.17,84.43] },
  'IN-PB': { n:'Punjab', c:[31.04,75.38] },
  'IN-RJ': { n:'Rajasthan', c:[26.62,73.86] },
  'IN-SK': { n:'Sikkim', c:[27.60,88.45] },
  'IN-TN': { n:'Tamil Nadu', c:[10.81,78.29] },
  'IN-TS': { n:'South', c:[17.86,79.52] },
  'IN-UK': { n:'Central', c:[30.10,79.28] },
  'IN-UP': { n:'Uttar Pradesh', c:[27.16,80.84] },
  'IN-WB': { n:'West Bengal', c:[24.39,87.86] },
  'IT-25': { n:'Lombardy', a:'Lombardia', c:[45.65,9.96] },
  'IT-34': { n:'Veneto', c:[45.73,11.87] },
  'IT-52': { n:'Tuscany', a:'Toscana', c:[43.40,11.02] },
  'IT-62': { n:'Lazio', c:[41.82,12.73] },
  'IT-72': { n:'Campania', c:[40.74,14.77] },
  'IT-75': { n:'Puglia', a:'Apulia', c:[40.87,16.72] },
  'IT-82': { n:'Sicily', a:'Sicilia', c:[37.15,13.79] },
  'IT-88': { n:'Sardinia', a:'Sardegna', c:[40.06,8.98] },
  'IT-LIG': { n:'Liguria', c:[44.23,8.77] },
  'IT-TAA': { n:'Trentino-Alto Adige', a:'South Tyrol', c:[46.38,11.42] },
  'JP-01': { n:'Hokkaidō', c:[43.46,142.58] },
  'JP-13': { n:'Tokyo', c:[30.05,146.45] },
  'JP-15': { n:'Niigata Prefecture', a:'Niigata', c:[37.64,138.74] },
  'JP-20': { n:'Nagano Prefecture', a:'Nagano', c:[36.10,138.02] },
  'JP-26': { n:'Kyōto Prefecture', a:'Kyōto', c:[35.23,135.45] },
  'JP-27': { n:'Ōsaka Prefecture', a:'Ōsaka', c:[34.64,135.40] },
  'JP-40': { n:'Fukuoka Prefecture', a:'Fukuoka', c:[33.47,130.62] },
  'JP-47': { n:'Okinawa Prefecture', a:'Okinawa', c:[26.38,127.13] },
  'KE-110': { n:'Nairobi', c:[-1.28,36.90] },
  'KE-300': { n:'Coast', c:[-2.35,39.56] },
  'KE-400': { n:'Eastern', c:[0.69,37.75] },
  'KE-500': { n:'North Eastern', a:'North-Eastern', c:[1.10,40.27] },
  'KE-700': { n:'Rift Valley', c:[0.92,36.02] },
  'KR-11': { n:'Seoul', c:[37.56,126.99] },
  'KR-26': { n:'Busan', c:[35.16,129.07] },
  'KR-41': { n:'Gyeonggi', c:[37.55,126.22] },
  'KR-42': { n:'Gangwon', c:[37.62,128.22] },
  'KR-47': { n:'North Gyeongsang', c:[36.54,129.35] },
  'KR-49': { n:'Jeju', c:[33.38,126.56] },
  'MA-01': { n:'Tangier-Tetouan', a:'Tanger - Tétouan', c:[35.32,-5.36] },
  'MA-03': { n:'Taza-Al Hoceïma-Taounate', a:'Taza - Al Hoceima - Taounate', c:[34.39,-4.22] },
  'MA-06': { n:'Meknès-Tafilalet', a:'Meknès - Tafilalet', c:[32.25,-4.79] },
  'MA-07': { n:'Rabat-Salé-Zemmour-Zaër', a:'Rabat - Salé - Zemmour - Zaer', c:[33.69,-6.42] },
  'MA-08': { n:'Grand Casablanca', c:[33.55,-7.61] },
  'MX-BCN': { n:'Baja California', c:[30.36,-115.46] },
  'MX-BCS': { n:'Baja California Sur', c:[25.44,-112.58] },
  'MX-CHP': { n:'Chiapas', c:[16.27,-92.25] },
  'MX-CMX': { n:'MX-CMX', c:[19.31,-99.14] },
  'MX-GRO': { n:'Guerrero', c:[17.59,-100.09] },
  'MX-JAL': { n:'Jalisco', c:[20.86,-103.61] },
  'MX-OAX': { n:'Oaxaca', c:[17.16,-96.21] },
  'MX-ROO': { n:'Quintana Roo', c:[19.76,-88.06] },
  'MX-SON': { n:'Sonora', c:[29.37,-111.75] },
  'MX-TAB': { n:'Tabasco', c:[17.95,-92.56] },
  'MX-YUC': { n:'Yucatán', c:[20.63,-88.98] },
  'MY-06': { n:'Pahang', c:[3.61,102.49] },
  'MY-07': { n:'Penang', a:'Pulau Pinang', c:[5.34,100.37] },
  'MY-11': { n:'Terengganu', c:[4.87,102.94] },
  'MY-12': { n:'Sabah', c:[5.75,117.32] },
  'MY-13': { n:'Sarawak', c:[2.91,112.60] },
  'MY-14': { n:'Kuala Lumpur', c:[3.13,101.69] },
  'NG-CR': { n:'Cross River State', a:'Cross River', c:[5.80,8.68] },
  'NG-FC': { n:'Federal Capital Territory', c:[8.88,7.19] },
  'NG-KN': { n:'Kano State', a:'Kano', c:[11.56,8.52] },
  'NG-LA': { n:'Lagos', c:[6.54,3.53] },
  'NG-RI': { n:'Rivers State', a:'Rivers', c:[5.03,6.99] },
  'NO-03': { n:'Oslo', c:[59.98,10.64] },
  'NO-12': { n:'Hordaland', c:[60.26,6.23] },
  'NO-15': { n:'Møre og Romsdal', c:[62.72,7.49] },
  'NO-18': { n:'Nordland', c:[68.07,4.54] },
  'NO-19': { n:'Troms', c:[69.32,19.29] },
  'NO-21': { n:'Svalbard', c:[77.56,22.06] },
  'NZ-AUK': { n:'Auckland', c:[-36.68,174.87] },
  'NZ-BOP': { n:'Bay of Plenty', c:[-38.18,176.94] },
  'NZ-CAN': { n:'Canterbury', c:[-43.49,171.81] },
  'NZ-OTA': { n:'Otago', c:[-45.31,169.65] },
  'NZ-STL': { n:'Southland', c:[-45.77,167.85] },
  'NZ-WGN': { n:'Wellington', c:[-41.15,175.47] },
  'PE-ARE': { n:'Arequipa', c:[-15.99,-72.96] },
  'PE-CUS': { n:'Cusco Departament', a:'Cusco', c:[-13.27,-72.16] },
  'PE-ICA': { n:'Ica', c:[-14.21,-75.58] },
  'PE-LIM': { n:'Lima', a:'Lima Province', c:[-11.80,-76.68] },
  'PE-MDD': { n:'Madre de Dios', c:[-11.65,-70.53] },
  'PE-PUN': { n:'Puno', c:[-15.16,-69.98] },
  'PH-AKL': { n:'Aklan', c:[11.63,122.22] },
  'PH-BEN': { n:'Benguet', a:'Baguio', c:[16.55,120.69] },
  'PH-BOH': { n:'Bohol', c:[9.86,124.18] },
  'PH-CEB': { n:'Cebu', c:[10.35,123.69] },
  'PH-DAV': { n:'Davao', c:[7.45,125.58] },
  'PH-MNL': { n:'Metro Manila', a:'Manila', c:[14.56,121.04] },
  'PH-PLW': { n:'Palawan', a:'El Nido', c:[9.65,119.11] },
  'PH-SLU': { n:'Sulu', c:[5.94,121.22] },
  'PK-BA': { n:'Balochistan', a:'Baluchistan', c:[28.48,65.55] },
  'PK-GB': { n:'Gilgit-Baltistan', a:'Northern Areas', c:[35.78,74.78] },
  'PK-IS': { n:'Islamabad Capital Territory', a:'F.C.T.', c:[33.65,73.06] },
  'PK-PB': { n:'Punjab', c:[30.86,72.35] },
  'PK-SD': { n:'Sindh', a:'Sind', c:[26.11,68.87] },
  'PL-DS': { n:'Lower Silesian Voivodeship', a:'Lower Silesian', c:[50.93,16.26] },
  'PL-MA': { n:'Lesser Poland Voivodeship', a:'Lesser Poland', c:[49.83,20.31] },
  'PL-MZ': { n:'Masovian Voivodeship', a:'Masovian', c:[52.23,21.19] },
  'PL-PM': { n:'Pomeranian Voivodeship', a:'Pomeranian', c:[54.14,18.27] },
  'PL-WN': { n:'Warmian-Masurian Voivodeship', a:'Warmian-Masurian', c:[53.76,20.97] },
  'PT-08': { n:'Faro', c:[37.25,-8.20] },
  'PT-11': { n:'Lisbon', a:'Lisboa', c:[38.99,-9.14] },
  'PT-13': { n:'Porto', c:[41.24,-8.33] },
  'PT-20': { n:'Azores', c:[38.33,-28.15] },
  'PT-30': { n:'Madeira', c:[31.57,-16.55] },
  'RU-KDA': { n:'Krasnodar Krai', a:'Krasnodar', c:[45.13,39.15] },
  'RU-MOW': { n:'Moscow', a:'Moskovskaya', c:[55.60,37.69] },
  'RU-PRI': { n:'Primorsky Krai', a:'Primor\'ye', c:[45.37,134.70] },
  'RU-SA': { n:'Sakha Republic', a:'Sakha (Yakutia)', c:[66.30,134.19] },
  'SE-AB': { n:'Stockholm', c:[59.54,18.18] },
  'SE-BD': { n:'Norrbotten', c:[67.05,19.79] },
  'SE-I': { n:'Gotland', c:[57.65,18.72] },
  'SE-M': { n:'Skåne', c:[55.94,13.52] },
  'SE-O': { n:'Västra Götaland', c:[58.21,12.96] },
  'SE-Z': { n:'Jämtland', c:[63.35,14.48] },
  'TH-10': { n:'Bangkok', a:'Bangkok Metropolis', c:[13.72,100.63] },
  'TH-50': { n:'Chiang Mai', c:[18.70,98.84] },
  'TH-77': { n:'Prachuap Khiri Khan', c:[11.80,99.58] },
  'TH-81': { n:'Krabi', c:[8.07,98.98] },
  'TH-83': { n:'Phuket', c:[7.98,98.35] },
  'TH-84': { n:'Surat Thani', c:[9.06,99.27] },
  'TR-06': { n:'Ankara', c:[39.68,32.40] },
  'TR-07': { n:'Antalya', c:[36.76,30.96] },
  'TR-25': { n:'Erzurum', c:[40.05,41.40] },
  'TR-34': { n:'Istanbul', c:[41.21,29.02] },
  'TR-35': { n:'İzmir', a:'Izmir', c:[38.68,27.40] },
  'TR-53': { n:'Rize', c:[40.92,40.87] },
  'TZ-01': { n:'Arusha', c:[-2.92,36.09] },
  'TZ-02': { n:'Dar es Salaam', a:'Dar-Es-Salaam', c:[-6.87,39.29] },
  'TZ-07': { n:'Unguja North', a:'Kaskazini-Unguja', c:[-5.88,39.29] },
  'TZ-09': { n:'Kilimanjaro', c:[-3.75,37.65] },
  'TZ-13': { n:'Mara', c:[-1.75,34.02] },
  'TZ-15': { n:'Mjini Magharibi', a:'Zanzibar West', c:[-6.17,39.24] },
  'US-AK': { n:'Alaska', c:[64.20,-152.50] },
  'US-AL': { n:'Alabama', c:[32.62,-86.69] },
  'US-AR': { n:'Arkansas', c:[34.76,-92.14] },
  'US-AZ': { n:'Arizona', c:[34.17,-111.93] },
  'US-CA': { n:'California', c:[37.27,-119.26] },
  'US-CO': { n:'Colorado', c:[39.00,-105.54] },
  'US-CT': { n:'Connecticut', c:[41.53,-72.76] },
  'US-DE': { n:'Delaware', c:[39.15,-75.42] },
  'US-FL': { n:'Florida', c:[27.77,-83.83] },
  'US-GA': { n:'Georgia', c:[32.68,-83.22] },
  'US-HI': { n:'Hawaii', c:[23.65,-166.56] },
  'US-IA': { n:'Iowa', c:[41.94,-93.39] },
  'US-ID': { n:'Idaho', c:[45.50,-114.13] },
  'US-IL': { n:'Illinois', c:[39.75,-89.27] },
  'US-IN': { n:'Indiana', c:[39.77,-86.45] },
  'US-KS': { n:'Kansas', c:[38.50,-98.33] },
  'US-KY': { n:'Kentucky', c:[37.82,-85.77] },
  'US-LA': { n:'Louisiana', c:[30.97,-91.43] },
  'US-MA': { n:'Massachusetts', c:[42.06,-71.72] },
  'US-MD': { n:'Maryland', c:[38.83,-77.27] },
  'US-ME': { n:'Maine', c:[45.27,-69.03] },
  'US-MI': { n:'Michigan', c:[45.00,-86.28] },
  'US-MN': { n:'Minnesota', c:[46.43,-93.36] },
  'US-MO': { n:'Missouri', c:[38.30,-92.45] },
  'US-MS': { n:'Mississippi', c:[32.59,-89.87] },
  'US-MT': { n:'Montana', c:[46.68,-110.04] },
  'US-NC': { n:'North Carolina', c:[35.23,-79.89] },
  'US-ND': { n:'North Dakota', c:[47.47,-100.30] },
  'US-NE': { n:'Nebraska', c:[41.50,-99.69] },
  'US-NH': { n:'New Hampshire', c:[44.00,-71.63] },
  'US-NJ': { n:'New Jersey', c:[40.14,-74.73] },
  'US-NM': { n:'New Mexico', c:[34.16,-106.02] },
  'US-NV': { n:'Nevada', c:[38.50,-117.02] },
  'US-NY': { n:'New York', c:[42.75,-75.81] },
  'US-OH': { n:'Ohio', c:[40.36,-82.67] },
  'US-OK': { n:'Oklahoma', c:[35.32,-98.72] },
  'US-OR': { n:'Oregon', c:[44.13,-120.51] },
  'US-PA': { n:'Pennsylvania', c:[41.13,-77.61] },
  'US-RI': { n:'Rhode Island', c:[41.58,-71.50] },
  'US-SC': { n:'South Carolina', c:[33.63,-80.96] },
  'US-SD': { n:'South Dakota', c:[44.23,-100.26] },
  'US-TN': { n:'Tennessee', c:[35.84,-85.99] },
  'US-TX': { n:'Texas', c:[31.17,-100.09] },
  'US-UT': { n:'Utah', c:[39.50,-111.54] },
  'US-VA': { n:'Virginia', c:[38.00,-79.46] },
  'US-VT': { n:'Vermont', c:[43.87,-72.47] },
  'US-WA': { n:'Washington', c:[47.28,-120.81] },
  'US-WI': { n:'Wisconsin', c:[44.90,-89.58] },
  'US-WV': { n:'West Virginia', c:[38.93,-80.19] },
  'US-WY': { n:'Wyoming', c:[43.00,-107.55] },
  'VN-CT': { n:'Cần Thơ', a:'Can Tho', c:[10.25,105.58] },
  'VN-DN': { n:'Da Nang', a:'Đà Nẵng', c:[16.10,108.10] },
  'VN-HN': { n:'Hanoi', a:'Ha Noi', c:[20.97,105.65] },
  'VN-HP': { n:'Haiphong', a:'Hải Phòng', c:[20.81,106.61] },
  'VN-SG': { n:'Ho Chi Minh', a:'Hồ Chí Minh city', c:[10.75,106.69] },
  'ZA-EC': { n:'Eastern Cape', c:[-32.09,26.47] },
  'ZA-FS': { n:'Free State', c:[-28.67,27.06] },
  'ZA-GP': { n:'ZA-GP', c:[-26.01,28.12] },
  'ZA-KZN': { n:'ZA-KZN', c:[-28.94,30.88] },
  'ZA-LP': { n:'Limpopo', c:[-23.77,29.13] },
  'ZA-MP': { n:'Mpumalanga', c:[-25.74,30.13] },
  'ZA-NC': { n:'Northern Cape', c:[-28.84,21.00] },
  'ZA-NW': { n:'North West', c:[-26.36,25.46] },
  'ZA-WC': { n:'Western Cape', c:[-38.72,27.87] },
};



// ─── City markers ─────────────────────────────────────────────────────────────
// Filled by data-cities.js (loaded after boot); the entries live there. See app.js _naEnsureCities.
const CITIES = [];

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
  bc('Peace Arch: Blaine','US','CA',48.993,-122.753,'open','24 hours','Pacific coast crossing; typically short waits'),
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
  bc('Ceuta: Tarajal','MA','ES',35.889,-5.320,'open','24 hours','Spanish enclave; Schengen area entry point'),
  bc('Melilla: Beni Enzar','MA','ES',35.291,-2.963,'open','24 hours','Spanish enclave; EU territory crossing'),
  // ── Caucasus ─────────────────────────────────────────────────────────────────
  bc('Lars / Russian Military Highway','GE','RU',42.637,44.602,'restricted','09:00–18:00','Restricted; verify eligibility before travel'),
  bc('Bagratashen / Akarak','GE','AM',41.189,44.800,'open','24 hours','Main Georgia–Armenia highway crossing'),
  bc('Red Bridge / Shixov','GE','AZ',41.340,45.348,'open','24 hours','Main Georgia–Azerbaijan highway crossing'),
  bc('Agarak / Norduz','AM','IR',38.870,46.153,'open','09:00–20:00','Armenia–Iran; limited traveller traffic'),
  // ── Central Asia ─────────────────────────────────────────────────────────────
  bc('Korgas','KZ','CN',44.168,80.374,'open','09:00–18:00','Silk Road gateway to Xinjiang'),
  bc('Torugart Pass','KG','CN',40.522,75.405,'restricted','09:00–16:00','High altitude; pre-arranged permits required'),
  bc('Friendship Bridge: Termez','UZ','AF',37.241,67.270,'restricted','08:00–17:00','Humanitarian access only; tourists not admitted'),
  bc('Irkeshtam','KG','CN',39.667,73.895,'open','09:00–17:00','Southern Xinjiang route; seasonal closure possible'),
  // ── Europe ───────────────────────────────────────────────────────────────────
  bc('Medyka / Shehyni','PL','UA',49.800,22.872,'open','24 hours','Main Poland–Ukraine crossing; high wartime use'),
  bc('Siret / Porubne','RO','UA',47.921,26.073,'open','24 hours','Romania–Ukraine crossing; humanitarian traffic'),
  bc('Horgos / Röszke','RS','HU',46.177,19.976,'open','24 hours','Main Serbia–Hungary motorway crossing'),
  bc('Bruzgi / Kuznica','BY','PL',53.394,23.851,'closed','Closed','Closed to tourist traffic; security exclusion zone'),

  // ── Europe: Schengen / EU external ──────────────────────────────────────────
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
  bc('Simon Bolivar Bridge: Cucuta','CO','VE',7.897,-72.453,'restricted','Variable','Intermittent; political tensions; verify hours before travel'),
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
  // ── Mediterranean Europe: Spain ──
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
  // ── Mediterranean Europe: France ──
  bch('Plage de Pampelonne','FR',43.240,6.632,'open','May–Sep','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports','topless-ok','St Tropez; 5km of famous beach clubs (Club 55, Nikki Beach); very expensive; beautiful sand'),
  bch('Plage de la Croisette','FR',43.553,7.015,'open','May–Sep','good','showers,toilets,lifeguard,cafes,rental-chairs,accessible','topless-ok','Cannes; glamorous promenade beach; mostly private paying sections; free public strip'),
  bch('Plage des Catalans','FR',43.291,5.358,'open','Jun–Sep','fair','showers,toilets,lifeguard,parking,cafes','topless-ok','Marseille city beach; small pebble/sand; accessible by bus from centre; some pollution concerns'),
  bch('Plage de Biarritz Grande Plage','FR',43.483,-1.558,'open','Jun–Sep','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports','topless-ok','Classic Basque surf resort; reliable waves; elegant Belle Époque backdrop; busy in summer'),
  bch('Plage de la Baule','FR',47.279,-2.394,'seasonal','Jun–Aug','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,accessible','standard','Loire-Atlantique; 8km crescent; finest Atlantic beach in France; warm shallow bay; family ideal'),
  bch('Plage Naturiste de Montalivet','FR',45.376,-1.143,'restricted','Jun–Aug','good','showers,toilets,lifeguard,parking,cafes','naturist','Oldest official naturist resort in Europe (est. 1950); full facilities; 4km Atlantic beach'),
  bch('Plage d\'Étretat','FR',49.707,0.207,'open','Jun–Aug','good','toilets,parking,cafes','standard','Dramatic chalk-arch cliffs; pebble beach unsuitable for swimming; primarily scenic; very photogenic'),
  // ── Mediterranean Europe: Italy ──
  bch('Spiaggia dei Conigli','IT',35.498,12.620,'open','May–Sep','excellent','toilets,lifeguard,parking','standard','Lampedusa; consistently voted best beach in Europe; turquoise lagoon; loggerhead turtles nest here; limited access during nesting'),
  bch('Cala Goloritzé','IT',40.121,9.620,'restricted','May–Oct','excellent','toilets','standard','Sardinia; UNESCO site; 2hr hike or boat only; crystal water; climbing routes on limestone pinnacle'),
  bch('La Pelosa','IT',40.980,8.183,'restricted','May–Sep','excellent','showers,toilets,lifeguard,parking','standard','Sardinia; N tip; entry fee + timed tickets to protect sand; Caribbean-style shallow water; arrive early'),
  bch('Spiaggia di Tuerredda','IT',38.929,8.904,'open','May–Sep','excellent','toilets,cafes','standard','Sardinia SW; among finest beaches in Italy; turquoise lagoon; small rocky island to swim to'),
  bch('Spiaggia di Positano','IT',40.627,14.484,'open','Jun–Sep','good','showers,toilets,lifeguard,cafes,rental-chairs','topless-ok','Amalfi Coast; small pebble beach; dominated by colourful village backdrop; expensive sun-bed hire'),
  bch('San Vito Lo Capo','IT',38.174,12.737,'open','May–Oct','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs,accessible','standard','Sicily; powder-white sand; turquoise water; friendly village; September couscous festival'),
  bch('Rimini','IT',44.057,12.560,'open','May–Sep','fair','showers,toilets,lifeguard,parking,cafes,rental-chairs,first-aid,accessible,water-sports','standard','Mass-market resort; 15km of managed beach; excellent facilities; Adriatic not its cleanest; very family-popular'),
  bch('Punta Prosciutto','IT',40.235,17.837,'open','Jun–Sep','excellent','toilets,parking','standard','Puglia; shallow transparent water; fine white sand; protected dunes; relatively uncrowded'),
  bch('Spiaggia di Vignanotica','IT',41.710,16.056,'open','Jun–Sep','excellent','toilets','standard','Puglia Gargano coast; dramatic white cliffs; pebble and sand; boat or steep path access; wild and beautiful'),
  // ── Mediterranean Europe: Greece ──
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
  // ── Mediterranean Europe: Croatia / Montenegro ──
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
  // ── Portugal: Algarve ──
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
  bch('Reynisfjara','IS',63.403,-19.046,'open','Year-round','good','parking,cafes','standard','Black sand beach with basalt columns and sea stacks; extremely dangerous sneaker waves: do not approach water edge'),
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
  bch('Lanikai','US',21.391,-157.718,'open','Year-round','excellent','parking','standard','Oahu; calm lagoon; impossibly blue water; Mokulua islands offshore; residential area: street parking only; no facilities'),
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
  // ── Southeast Asia: Thailand ──
  bch('Railay West','TH',8.012,98.836,'open','Nov–Apr','excellent','showers,toilets,cafes,water-sports','standard','Krabi; boat access only from Ao Nang; dramatic limestone cliffs; rock climbing on adjacent cliffs; best Nov–Apr; gets crowded'),
  bch('Phra Nang Cave Beach','TH',8.000,98.837,'open','Nov–Apr','excellent','toilets','standard','Krabi; most stunning beach in Thailand; princess shrine cave behind; access only by longtail; part of same peninsula as Railay'),
  bch('Ko Phi Phi Don Beach','TH',7.745,98.778,'open','Nov–Apr','good','showers,toilets,lifeguard,cafes,rental-chairs,water-sports','standard','Andaman; iconic beach; very crowded Dec–Mar; gorgeous water; boats everywhere; the quiet season is May–Oct'),
  bch('Haad Rin (Full Moon Party)','TH',9.681,100.053,'open','Year-round','fair','showers,toilets,cafes,water-sports','standard','Koh Phangan; famous Full Moon Party beach; packed on party nights; daily rubbish problem; bucket cocktails; avoid if you want peace'),
  bch('Kata Noi','TH',7.824,98.293,'open','Nov–Apr','excellent','showers,toilets,lifeguard,cafes,rental-chairs,water-sports','standard','Phuket; smaller and quieter than Kata or Patong; excellent snorkelling at S end; gets rough May–Oct'),
  bch('Koh Kood (Klong Chao)','TH',11.602,102.475,'seasonal','Nov–Apr','excellent','toilets,cafes','standard','Ko Kut; last unspoiled large Thai island; crystal water; limited accommodation; best Nov–Apr; remote but magical'),
  // ── Southeast Asia: Vietnam ──
  bch('An Bang','VN',15.923,108.348,'open','Feb–Aug','good','showers,toilets,cafes,rental-chairs','standard','Hoi An area; local atmosphere; good beach cafes; fresher and less commercial than Cua Dai; flooded Oct–Dec'),
  bch('Bai Sao','VN',10.040,103.997,'open','Nov–May','excellent','showers,toilets,parking,cafes,rental-chairs,water-sports','standard','Phu Quoc S; white sand; calm clear water; best Nov–May dry season; some development but still beautiful'),
  // ── Southeast Asia: Indonesia ──
  bch('Kuta','ID',-8.718,115.169,'open','May–Oct','fair','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports','standard','Bali; learn-to-surf beach; famous sunsets; extremely crowded; hawkers; poor water quality at times; best May–Oct'),
  bch('Seminyak','ID',-8.697,115.156,'open','May–Oct','good','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports','topless-ok','Bali; upmarket beach clubs; famous sunset strip; less chaotic than Kuta; potato head beach club; waves suitable for intermediate surfers'),
  bch('Nusa Dua','ID',-8.801,115.231,'open','May–Oct','excellent','showers,toilets,lifeguard,parking,cafes,rental-chairs,water-sports,accessible','standard','Bali; calm lagoon; resort enclave; families and honeymooners; most serene swimming in Bali; gated but accessible'),
  bch('Pink Beach','ID',-8.649,119.450,'restricted','May–Oct','excellent','toilets','standard','Komodo NP; pink-tinted coral sand; entry only with guide on NP tour; excellent snorkelling in strong currents; Komodo dragons on Rinca'),
  bch('Tanjung Aan','ID',-8.891,116.276,'open','May–Oct','excellent','toilets,cafes','standard','Lombok; twin crescent bays divided by headland; one side surf, one side calm; stunning; Kuta Lombok is a different place from Kuta Bali'),
  // ── Southeast Asia: Malaysia / Philippines ──
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
  { id:'eu-iceland-south', name:'Iceland: South & Reykjavik', parent:'IS', layers:{ weather:s12(3,3,3,2,1,0,0,1,2,3,3,3) }, geometry:{ type:'Polygon', coordinates:[[[-24.0,63.5],[-22.0,63.5],[-20.0,63.5],[-18.0,64.0],[-20.0,64.5],[-22.0,64.5],[-24.0,64.0],[-24.0,63.5]]] } },
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
  { id:'sa-sri-lanka-dry-zone', name:'NE Sri Lanka (Dry Zone: Trinco)', parent:'LK', layers:{ weather:s12(2,1,0,0,0,0,0,0,1,2,3,2), beaches:s12(2,1,0,0,0,0,0,0,1,2,3,2) }, geometry:{ type:'Polygon', coordinates:[[[80.5,7.0],[80.8,7.5],[81.5,8.0],[81.9,9.0],[81.0,9.5],[80.5,9.5],[80.2,8.5],[80.5,7.0]]] } },
  // ── East & Southeast Asia ──
  { id:'ea-hokkaido', name:'Hokkaido (Subarctic Japan)', parent:'JP', layers:{ weather:s12(3,3,2,2,1,0,0,0,1,1,2,3) }, geometry:{ type:'Polygon', coordinates:[[[141.0,44.0],[141.5,44.5],[142.5,44.5],[143.5,44.0],[144.5,44.0],[145.0,43.5],[145.5,43.0],[145.0,42.5],[144.0,42.0],[143.0,42.0],[142.0,42.5],[141.0,43.0],[140.5,43.5],[141.0,44.0]]] } },
  { id:'ea-honshu-sea-of-japan-coast', name:'Sea of Japan Coast (Heavy Snow)', parent:'JP', layers:{ weather:s12(2,3,2,1,0,0,0,0,1,1,1,2) }, geometry:{ type:'Polygon', coordinates:[[[132.5,34.5],[133.5,35.0],[135.0,35.5],[136.5,36.5],[137.5,37.0],[138.5,38.0],[139.5,39.5],[140.5,41.5],[141.5,42.5],[141.5,43.0],[140.5,42.0],[139.0,40.0],[138.0,37.5],[136.5,36.0],[135.0,35.0],[133.5,34.5],[132.5,34.5]]] } },
  { id:'ea-okinawa-ryukyu', name:'Okinawa & Ryukyu Islands', parent:'JP', layers:{ weather:s12(1,0,0,0,2,2,1,2,2,1,1,1), beaches:s12(0,0,0,0,2,2,1,2,2,1,1,1), disaster:s12(0,0,0,0,1,1,1,3,3,2,0,0) }, geometry:{ type:'Polygon', coordinates:[[[123.0,24.0],[124.5,24.5],[126.0,26.0],[127.5,26.5],[128.5,27.0],[129.0,28.0],[129.0,28.5],[127.5,28.0],[126.0,27.0],[124.5,25.5],[123.0,25.0],[123.0,24.0]]] } },
  { id:'ea-tibetan-plateau', name:'Tibetan Plateau (above 3500m)', parent:'CN', layers:{ weather:s12(3,3,2,1,0,1,1,1,0,1,2,3) }, geometry:{ type:'Polygon', coordinates:[[[80.0,31.0],[82.0,32.0],[84.0,32.0],[86.0,31.5],[88.0,32.0],[90.0,32.5],[92.0,32.0],[94.0,33.0],[96.0,33.0],[97.0,34.0],[96.0,35.0],[94.0,34.5],[92.0,33.5],[90.0,33.0],[88.0,33.0],[86.0,32.5],[84.0,33.0],[82.0,33.0],[80.0,32.5],[80.0,31.0]]] } },
  { id:'ea-yunnan-highlands', name:'Yunnan Highlands: Spring City Zone', parent:'CN', layers:{ weather:s12(0,0,0,0,1,2,2,2,1,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[99.0,25.5],[100.0,26.5],[101.0,27.0],[102.5,27.0],[103.0,26.0],[103.0,24.5],[102.5,23.0],[101.5,22.5],[100.5,22.5],[100.0,23.5],[99.5,24.5],[99.0,25.5]]] } },
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
  { id:'ea-visayas-sulu', name:'Visayas (Cebu / Bohol: Outside Typhoon Belt)', parent:'PH', layers:{ weather:s12(0,0,0,1,1,1,1,1,1,1,1,0), beaches:s12(0,0,0,1,1,1,1,1,1,1,1,0), disaster:rep(1) }, geometry:{ type:'Polygon', coordinates:[[[122.5,10.5],[123.5,11.0],[124.5,11.5],[125.0,11.0],[124.5,10.0],[123.5,9.5],[122.5,9.5],[121.5,9.5],[121.0,10.5],[122.5,10.5]]] } },
  { id:'ea-mindanao-palawan', name:'Mindanao & Palawan (South of Typhoon Belt)', parent:'PH', layers:{ weather:s12(0,0,0,0,0,1,1,1,1,1,0,0), beaches:s12(0,0,0,0,0,1,1,1,1,1,0,0) }, geometry:{ type:'Polygon', coordinates:[[[117.5,9.0],[118.5,9.5],[119.5,10.0],[120.5,10.5],[121.5,9.0],[122.5,8.5],[124.0,7.5],[125.5,8.0],[126.0,8.5],[125.5,9.0],[124.0,8.5],[122.5,8.0],[120.5,9.0],[119.0,9.5],[117.5,9.0]]] } },
  { id:'ea-borneo-equatorial', name:'Borneo (Equatorial: Always Rainy)', parent:'MY', layers:{ weather:s12(2,2,2,2,2,2,1,1,1,2,2,2), health:rep(2) }, geometry:{ type:'Polygon', coordinates:[[[108.0,1.5],[109.5,1.0],[111.0,1.5],[113.0,1.5],[114.5,2.0],[115.5,3.5],[117.0,4.0],[118.0,5.0],[118.0,6.5],[116.5,7.0],[115.0,6.5],[113.0,5.5],[111.0,4.0],[109.5,2.5],[108.0,1.5]]] } },
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
  { id:'oc-sw-australia-perth', name:'SW Australia: Perth Mediterranean', parent:'AU', layers:{ weather:s12(0,0,0,0,1,2,2,2,1,0,0,0), beaches:s12(0,0,0,0,1,2,2,2,1,0,0,0) }, geometry:{ type:'Polygon', coordinates:[[[113.5,-32.0],[115.0,-32.5],[116.5,-33.5],[116.5,-35.5],[115.0,-35.0],[113.5,-33.5],[113.5,-32.0]]] } },
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

// ─── Admin-2 county/municipality data ─────────────────────────────────────────
// GeoJSON source: geoBoundaries (https://www.geoboundaries.org): CC-BY 4.0.
// Files self-hosted in data/admin2/. See data/admin2/README.md for download
// instructions and update procedure.

// ISO 3166-1 alpha-2 → alpha-3 mapping.
// Only countries that have CD_A1 data are included: admin-2 is only loaded
// for countries where we already have sub-national province data.
const ISO2_TO_ISO3 = {
  AR:'ARG', AU:'AUS', BR:'BRA', CA:'CAN', CN:'CHN', CO:'COL',
  DE:'DEU', EG:'EGY', ES:'ESP', FR:'FRA', GB:'GBR', GR:'GRC',
  ID:'IDN', IN:'IND', IT:'ITA', JP:'JPN', MA:'MAR', MX:'MEX',
  NG:'NGA', NZ:'NZL', PE:'PER', PK:'PAK', PT:'PRT', RU:'RUS',
  TH:'THA', TR:'TUR', US:'USA', VN:'VNM', ZA:'ZAF',
};



// ── NYC NYPD Precinct Crime Index (crimeIdx: 0=Low → 3=High) ──────────────────
const NYPD_PRECINCTS = [
  {p:1,  b:"Manhattan",     lat:40.7134,lng:-74.0107,ci:1},
  {p:5,  b:"Manhattan",     lat:40.7155,lng:-73.9981,ci:2},
  {p:6,  b:"Manhattan",     lat:40.7328,lng:-74.0026,ci:1},
  {p:7,  b:"Manhattan",     lat:40.7152,lng:-73.9837,ci:2},
  {p:9,  b:"Manhattan",     lat:40.7261,lng:-73.9876,ci:2},
  {p:10, b:"Manhattan",     lat:40.7503,lng:-74.0021,ci:2},
  {p:13, b:"Manhattan",     lat:40.7399,lng:-73.9879,ci:2},
  {p:14, b:"Manhattan",     lat:40.7561,lng:-73.9914,ci:2},
  {p:17, b:"Manhattan",     lat:40.7644,lng:-73.9726,ci:1},
  {p:18, b:"Manhattan",     lat:40.7784,lng:-73.9824,ci:2},
  {p:19, b:"Manhattan",     lat:40.7752,lng:-73.9548,ci:1},
  {p:20, b:"Manhattan",     lat:40.7884,lng:-73.9726,ci:1},
  {p:23, b:"Manhattan",     lat:40.7928,lng:-73.9439,ci:2},
  {p:24, b:"Manhattan",     lat:40.8055,lng:-73.9599,ci:1},
  {p:25, b:"Manhattan",     lat:40.8013,lng:-73.9367,ci:3},
  {p:26, b:"Manhattan",     lat:40.8128,lng:-73.9535,ci:2},
  {p:28, b:"Manhattan",     lat:40.8234,lng:-73.9437,ci:3},
  {p:30, b:"Manhattan",     lat:40.8348,lng:-73.9388,ci:3},
  {p:32, b:"Manhattan",     lat:40.8162,lng:-73.9515,ci:3},
  {p:33, b:"Manhattan",     lat:40.8319,lng:-73.9346,ci:3},
  {p:34, b:"Manhattan",     lat:40.8514,lng:-73.9345,ci:3},
  {p:40, b:"Bronx",         lat:40.8148,lng:-73.9274,ci:3},
  {p:41, b:"Bronx",         lat:40.8248,lng:-73.9052,ci:3},
  {p:42, b:"Bronx",         lat:40.8387,lng:-73.8989,ci:3},
  {p:43, b:"Bronx",         lat:40.8462,lng:-73.8926,ci:3},
  {p:44, b:"Bronx",         lat:40.8536,lng:-73.9064,ci:3},
  {p:45, b:"Bronx",         lat:40.8773,lng:-73.8643,ci:2},
  {p:46, b:"Bronx",         lat:40.8625,lng:-73.9131,ci:3},
  {p:47, b:"Bronx",         lat:40.8894,lng:-73.8669,ci:2},
  {p:48, b:"Bronx",         lat:40.8721,lng:-73.8979,ci:2},
  {p:49, b:"Bronx",         lat:40.8521,lng:-73.8574,ci:2},
  {p:50, b:"Bronx",         lat:40.8794,lng:-73.9127,ci:2},
  {p:52, b:"Bronx",         lat:40.8924,lng:-73.9022,ci:2},
  {p:60, b:"Brooklyn",      lat:40.5914,lng:-74.0090,ci:2},
  {p:61, b:"Brooklyn",      lat:40.6088,lng:-73.9425,ci:2},
  {p:62, b:"Brooklyn",      lat:40.6250,lng:-74.0316,ci:1},
  {p:63, b:"Brooklyn",      lat:40.6356,lng:-74.0024,ci:2},
  {p:66, b:"Brooklyn",      lat:40.6485,lng:-74.0143,ci:2},
  {p:67, b:"Brooklyn",      lat:40.6514,lng:-73.9574,ci:3},
  {p:68, b:"Brooklyn",      lat:40.6634,lng:-74.0197,ci:1},
  {p:69, b:"Brooklyn",      lat:40.6396,lng:-73.9349,ci:2},
  {p:70, b:"Brooklyn",      lat:40.6648,lng:-73.9756,ci:2},
  {p:71, b:"Brooklyn",      lat:40.6703,lng:-73.9361,ci:3},
  {p:72, b:"Brooklyn",      lat:40.6882,lng:-74.0013,ci:1},
  {p:73, b:"Brooklyn",      lat:40.6879,lng:-73.9452,ci:2},
  {p:75, b:"Brooklyn",      lat:40.6726,lng:-73.8726,ci:3},
  {p:76, b:"Brooklyn",      lat:40.6799,lng:-73.9912,ci:1},
  {p:77, b:"Brooklyn",      lat:40.6782,lng:-73.9566,ci:3},
  {p:78, b:"Brooklyn",      lat:40.6855,lng:-73.9856,ci:1},
  {p:79, b:"Brooklyn",      lat:40.6982,lng:-73.9386,ci:3},
  {p:81, b:"Brooklyn",      lat:40.7023,lng:-73.9266,ci:3},
  {p:83, b:"Brooklyn",      lat:40.7023,lng:-73.9068,ci:2},
  {p:84, b:"Brooklyn",      lat:40.6975,lng:-73.9874,ci:1},
  {p:88, b:"Brooklyn",      lat:40.7042,lng:-73.9602,ci:3},
  {p:90, b:"Brooklyn",      lat:40.7072,lng:-73.9488,ci:2},
  {p:94, b:"Brooklyn",      lat:40.7169,lng:-73.9882,ci:1},
  {p:100,b:"Queens",        lat:40.5746,lng:-73.8543,ci:1},
  {p:101,b:"Queens",        lat:40.6042,lng:-73.8267,ci:2},
  {p:102,b:"Queens",        lat:40.6146,lng:-73.8602,ci:2},
  {p:103,b:"Queens",        lat:40.6373,lng:-73.8765,ci:2},
  {p:104,b:"Queens",        lat:40.6285,lng:-73.9338,ci:1},
  {p:105,b:"Queens",        lat:40.6684,lng:-73.8007,ci:1},
  {p:106,b:"Queens",        lat:40.6820,lng:-73.8382,ci:2},
  {p:107,b:"Queens",        lat:40.6988,lng:-73.7953,ci:1},
  {p:108,b:"Queens",        lat:40.7237,lng:-73.8685,ci:2},
  {p:109,b:"Queens",        lat:40.7272,lng:-73.7901,ci:1},
  {p:110,b:"Queens",        lat:40.7373,lng:-73.8521,ci:2},
  {p:111,b:"Queens",        lat:40.7462,lng:-73.8038,ci:1},
  {p:112,b:"Queens",        lat:40.7355,lng:-73.8343,ci:2},
  {p:113,b:"Queens",        lat:40.7053,lng:-73.8086,ci:3},
  {p:114,b:"Queens",        lat:40.7625,lng:-73.8478,ci:2},
  {p:115,b:"Queens",        lat:40.7748,lng:-73.8115,ci:1},
  {p:120,b:"Staten Island", lat:40.6196,lng:-74.1196,ci:1},
  {p:121,b:"Staten Island", lat:40.5870,lng:-74.1591,ci:1},
  {p:122,b:"Staten Island", lat:40.5725,lng:-74.1046,ci:2},
  {p:123,b:"Staten Island", lat:40.5428,lng:-74.1778,ci:1},
];
// GATE 2: VISA_DATA additions (appended via Object.assign)
const VISA_DATA_ADDITIONS = {
  // ── Europe (remaining) ──────────────────────────────────────────────────────
  // Schengen / EU members not yet covered
  RO: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  BG: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  LU: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  MT: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  CY: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // Western Balkans
  BA: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  ME: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  MK: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  AL: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // Moldova & Belarus
  MD: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'evisa',d:30,c:60}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  BY: { US:{t:'evisa',d:30,c:65}, GB:{t:'evisa',d:30,c:65}, DE:{t:'evisa',d:30,c:65}, AU:{t:'evisa',d:30,c:65}, CA:{t:'evisa',d:30,c:65}, JP:{t:'evisa',d:30,c:65}, NZ:{t:'evisa',d:30,c:65}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'evisa',d:30,c:65}, IL:{t:'req',d:0,c:0} },
  // Central Asia
  KZ: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  UZ: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  TM: { US:{t:'req',d:0,c:0}, GB:{t:'req',d:0,c:0}, DE:{t:'req',d:0,c:0}, AU:{t:'req',d:0,c:0}, CA:{t:'req',d:0,c:0}, JP:{t:'req',d:0,c:0}, NZ:{t:'req',d:0,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  KG: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  TJ: { US:{t:'evisa',d:45,c:20}, GB:{t:'evisa',d:45,c:20}, DE:{t:'evisa',d:45,c:20}, AU:{t:'evisa',d:45,c:20}, CA:{t:'evisa',d:45,c:20}, JP:{t:'evisa',d:45,c:20}, NZ:{t:'evisa',d:45,c:20}, ZA:{t:'req',d:0,c:0}, IN:{t:'evisa',d:45,c:20}, CN:{t:'free',d:30,c:0}, BR:{t:'evisa',d:45,c:20}, IL:{t:'req',d:0,c:0} },
  AF: { US:{t:'req',d:0,c:0}, GB:{t:'req',d:0,c:0}, DE:{t:'req',d:0,c:0}, AU:{t:'req',d:0,c:0}, CA:{t:'req',d:0,c:0}, JP:{t:'req',d:0,c:0}, NZ:{t:'req',d:0,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  // ── East Asia ──────────────────────────────────────────────────────────────
  MN: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  KP: { US:{t:'banned',d:0,c:0}, GB:{t:'req',d:0,c:0}, DE:{t:'req',d:0,c:0}, AU:{t:'req',d:0,c:0}, CA:{t:'req',d:0,c:0}, JP:{t:'req',d:0,c:0}, NZ:{t:'req',d:0,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  // ── Southeast Asia (remaining) ─────────────────────────────────────────────
  TL: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  // ── South Asia ─────────────────────────────────────────────────────────────
  BT: { US:{t:'req',d:0,c:0}, GB:{t:'req',d:0,c:0}, DE:{t:'req',d:0,c:0}, AU:{t:'req',d:0,c:0}, CA:{t:'req',d:0,c:0}, JP:{t:'req',d:0,c:0}, NZ:{t:'req',d:0,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'free',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  MV: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  // ── Middle East (remaining) ────────────────────────────────────────────────
  PS: { US:{t:'req',d:0,c:0}, GB:{t:'req',d:0,c:0}, DE:{t:'req',d:0,c:0}, AU:{t:'req',d:0,c:0}, CA:{t:'req',d:0,c:0}, JP:{t:'req',d:0,c:0}, NZ:{t:'req',d:0,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'free',d:0,c:0} },
  // ── Sub-Saharan Africa ─────────────────────────────────────────────────────
  // West Africa
  SN: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:90,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  CI: { US:{t:'evisa',d:90,c:80}, GB:{t:'evisa',d:90,c:80}, DE:{t:'evisa',d:90,c:80}, AU:{t:'evisa',d:90,c:80}, CA:{t:'evisa',d:90,c:80}, JP:{t:'evisa',d:90,c:80}, NZ:{t:'evisa',d:90,c:80}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'evisa',d:90,c:80} },
  CM: { US:{t:'req',d:0,c:120}, GB:{t:'req',d:0,c:120}, DE:{t:'req',d:0,c:120}, AU:{t:'req',d:0,c:120}, CA:{t:'req',d:0,c:120}, JP:{t:'req',d:0,c:120}, NZ:{t:'req',d:0,c:120}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  GN: { US:{t:'voa',d:90,c:100}, GB:{t:'voa',d:90,c:100}, DE:{t:'voa',d:90,c:100}, AU:{t:'voa',d:90,c:100}, CA:{t:'voa',d:90,c:100}, JP:{t:'voa',d:90,c:100}, NZ:{t:'voa',d:90,c:100}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  ML: { US:{t:'req',d:0,c:131}, GB:{t:'req',d:0,c:131}, DE:{t:'req',d:0,c:131}, AU:{t:'req',d:0,c:131}, CA:{t:'req',d:0,c:131}, JP:{t:'req',d:0,c:131}, NZ:{t:'req',d:0,c:131}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  BF: { US:{t:'evisa',d:90,c:85}, GB:{t:'evisa',d:90,c:85}, DE:{t:'evisa',d:90,c:85}, AU:{t:'evisa',d:90,c:85}, CA:{t:'evisa',d:90,c:85}, JP:{t:'evisa',d:90,c:85}, NZ:{t:'evisa',d:90,c:85}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  NE: { US:{t:'req',d:0,c:100}, GB:{t:'req',d:0,c:100}, DE:{t:'req',d:0,c:100}, AU:{t:'req',d:0,c:100}, CA:{t:'req',d:0,c:100}, JP:{t:'req',d:0,c:100}, NZ:{t:'req',d:0,c:100}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  TG: { US:{t:'voa',d:7,c:35}, GB:{t:'voa',d:7,c:35}, DE:{t:'voa',d:7,c:35}, AU:{t:'voa',d:7,c:35}, CA:{t:'voa',d:7,c:35}, JP:{t:'voa',d:7,c:35}, NZ:{t:'voa',d:7,c:35}, ZA:{t:'voa',d:7,c:35}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  BJ: { US:{t:'evisa',d:30,c:50}, GB:{t:'evisa',d:30,c:50}, DE:{t:'evisa',d:30,c:50}, AU:{t:'evisa',d:30,c:50}, CA:{t:'evisa',d:30,c:50}, JP:{t:'evisa',d:30,c:50}, NZ:{t:'evisa',d:30,c:50}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  // Central Africa
  CD: { US:{t:'req',d:0,c:185}, GB:{t:'req',d:0,c:185}, DE:{t:'req',d:0,c:185}, AU:{t:'req',d:0,c:185}, CA:{t:'req',d:0,c:185}, JP:{t:'req',d:0,c:185}, NZ:{t:'req',d:0,c:185}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  CG: { US:{t:'req',d:0,c:130}, GB:{t:'req',d:0,c:130}, DE:{t:'req',d:0,c:130}, AU:{t:'req',d:0,c:130}, CA:{t:'req',d:0,c:130}, JP:{t:'req',d:0,c:130}, NZ:{t:'req',d:0,c:130}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  GA: { US:{t:'evisa',d:90,c:85}, GB:{t:'evisa',d:90,c:85}, DE:{t:'evisa',d:90,c:85}, AU:{t:'evisa',d:90,c:85}, CA:{t:'evisa',d:90,c:85}, JP:{t:'evisa',d:90,c:85}, NZ:{t:'evisa',d:90,c:85}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  TD: { US:{t:'req',d:0,c:100}, GB:{t:'req',d:0,c:100}, DE:{t:'req',d:0,c:100}, AU:{t:'req',d:0,c:100}, CA:{t:'req',d:0,c:100}, JP:{t:'req',d:0,c:100}, NZ:{t:'req',d:0,c:100}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  CF: { US:{t:'req',d:0,c:150}, GB:{t:'req',d:0,c:150}, DE:{t:'req',d:0,c:150}, AU:{t:'req',d:0,c:150}, CA:{t:'req',d:0,c:150}, JP:{t:'req',d:0,c:150}, NZ:{t:'req',d:0,c:150}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  // East Africa (remaining)
  UG: { US:{t:'evisa',d:90,c:52}, GB:{t:'evisa',d:90,c:52}, DE:{t:'evisa',d:90,c:52}, AU:{t:'evisa',d:90,c:52}, CA:{t:'evisa',d:90,c:52}, JP:{t:'evisa',d:90,c:52}, NZ:{t:'evisa',d:90,c:52}, ZA:{t:'free',d:90,c:0}, IN:{t:'evisa',d:90,c:52}, CN:{t:'evisa',d:90,c:52}, BR:{t:'evisa',d:90,c:52}, IL:{t:'evisa',d:90,c:52} },
  RW: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  BI: { US:{t:'evisa',d:30,c:40}, GB:{t:'evisa',d:30,c:40}, DE:{t:'evisa',d:30,c:40}, AU:{t:'evisa',d:30,c:40}, CA:{t:'evisa',d:30,c:40}, JP:{t:'evisa',d:30,c:40}, NZ:{t:'evisa',d:30,c:40}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  SO: { US:{t:'req',d:0,c:0}, GB:{t:'req',d:0,c:0}, DE:{t:'req',d:0,c:0}, AU:{t:'req',d:0,c:0}, CA:{t:'req',d:0,c:0}, JP:{t:'req',d:0,c:0}, NZ:{t:'req',d:0,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  DJ: { US:{t:'evisa',d:30,c:35}, GB:{t:'evisa',d:30,c:35}, DE:{t:'evisa',d:30,c:35}, AU:{t:'evisa',d:30,c:35}, CA:{t:'evisa',d:30,c:35}, JP:{t:'evisa',d:30,c:35}, NZ:{t:'evisa',d:30,c:35}, ZA:{t:'evisa',d:30,c:35}, IN:{t:'evisa',d:30,c:35}, CN:{t:'evisa',d:30,c:35}, BR:{t:'evisa',d:30,c:35}, IL:{t:'evisa',d:30,c:35} },
  ER: { US:{t:'req',d:0,c:0}, GB:{t:'req',d:0,c:0}, DE:{t:'req',d:0,c:0}, AU:{t:'req',d:0,c:0}, CA:{t:'req',d:0,c:0}, JP:{t:'req',d:0,c:0}, NZ:{t:'req',d:0,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  SS: { US:{t:'req',d:0,c:100}, GB:{t:'req',d:0,c:100}, DE:{t:'req',d:0,c:100}, AU:{t:'req',d:0,c:100}, CA:{t:'req',d:0,c:100}, JP:{t:'req',d:0,c:100}, NZ:{t:'req',d:0,c:100}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  SD: { US:{t:'req',d:0,c:0}, GB:{t:'req',d:0,c:0}, DE:{t:'req',d:0,c:0}, AU:{t:'req',d:0,c:0}, CA:{t:'req',d:0,c:0}, JP:{t:'req',d:0,c:0}, NZ:{t:'req',d:0,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'banned',d:0,c:0} },
  // Southern Africa
  MZ: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'evisa',d:30,c:75}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  ZW: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'evisa',d:30,c:75}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  ZM: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'evisa',d:30,c:75}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  BW: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  NA: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  LS: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  SZ: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  AO: { US:{t:'evisa',d:30,c:120}, GB:{t:'evisa',d:30,c:120}, DE:{t:'evisa',d:30,c:120}, AU:{t:'evisa',d:30,c:120}, CA:{t:'evisa',d:30,c:120}, JP:{t:'evisa',d:30,c:120}, NZ:{t:'evisa',d:30,c:120}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'evisa',d:30,c:120}, BR:{t:'evisa',d:30,c:120}, IL:{t:'req',d:0,c:0} },
  // Island nations
  MG: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  MU: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'free',d:90,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  SC: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  CV: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  ST: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  KM: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  // ── Caribbean ──────────────────────────────────────────────────────────────
  JM: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  TT: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'free',d:90,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  DO: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  HT: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'req',d:0,c:0} },
  BB: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'free',d:90,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  BS: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'free',d:90,c:0} },
  VC: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  GD: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  LC: { US:{t:'free',d:42,c:0}, GB:{t:'free',d:42,c:0}, DE:{t:'free',d:42,c:0}, AU:{t:'free',d:42,c:0}, CA:{t:'free',d:42,c:0}, JP:{t:'free',d:42,c:0}, NZ:{t:'free',d:42,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:42,c:0}, IL:{t:'free',d:42,c:0} },
  AG: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  KN: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // ── Central America ────────────────────────────────────────────────────────
  GT: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  BZ: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  HN: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  SV: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  NI: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  CR: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  PA: { US:{t:'free',d:180,c:0}, GB:{t:'free',d:180,c:0}, DE:{t:'free',d:180,c:0}, AU:{t:'free',d:180,c:0}, CA:{t:'free',d:180,c:0}, JP:{t:'free',d:180,c:0}, NZ:{t:'free',d:180,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:180,c:0}, IL:{t:'free',d:180,c:0} },
  // ── South America (remaining) ──────────────────────────────────────────────
  VE: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  GY: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  SR: { US:{t:'evisa',d:90,c:25}, GB:{t:'evisa',d:90,c:25}, DE:{t:'evisa',d:90,c:25}, AU:{t:'evisa',d:90,c:25}, CA:{t:'evisa',d:90,c:25}, JP:{t:'evisa',d:90,c:25}, NZ:{t:'evisa',d:90,c:25}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'evisa',d:90,c:25} },
  // ── Pacific ────────────────────────────────────────────────────────────────
  FJ: { US:{t:'free',d:120,c:0}, GB:{t:'free',d:120,c:0}, DE:{t:'free',d:120,c:0}, AU:{t:'free',d:120,c:0}, CA:{t:'free',d:120,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:120,c:0}, ZA:{t:'free',d:120,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:120,c:0}, IL:{t:'free',d:120,c:0} },
  PG: { US:{t:'free',d:60,c:0}, GB:{t:'free',d:60,c:0}, DE:{t:'free',d:60,c:0}, AU:{t:'free',d:60,c:0}, CA:{t:'free',d:60,c:0}, JP:{t:'free',d:60,c:0}, NZ:{t:'free',d:60,c:0}, ZA:{t:'free',d:60,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:60,c:0}, BR:{t:'free',d:60,c:0}, IL:{t:'free',d:60,c:0} },
  SB: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  VU: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  WS: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  TO: { US:{t:'free',d:31,c:0}, GB:{t:'free',d:31,c:0}, DE:{t:'free',d:31,c:0}, AU:{t:'free',d:31,c:0}, CA:{t:'free',d:31,c:0}, JP:{t:'free',d:31,c:0}, NZ:{t:'free',d:31,c:0}, ZA:{t:'free',d:31,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:31,c:0}, IL:{t:'free',d:31,c:0} },
  TV: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  KI: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  PW: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  FM: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  MH: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  NR: { US:{t:'free',d:30,c:0}, GB:{t:'free',d:30,c:0}, DE:{t:'free',d:30,c:0}, AU:{t:'free',d:30,c:0}, CA:{t:'free',d:30,c:0}, JP:{t:'free',d:30,c:0}, NZ:{t:'free',d:30,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:30,c:0}, IL:{t:'free',d:30,c:0} },
  // ── North Africa (remaining) ───────────────────────────────────────────────
  MR: { US:{t:'evisa',d:30,c:55}, GB:{t:'evisa',d:30,c:55}, DE:{t:'evisa',d:30,c:55}, AU:{t:'evisa',d:30,c:55}, CA:{t:'evisa',d:30,c:55}, JP:{t:'evisa',d:30,c:55}, NZ:{t:'evisa',d:30,c:55}, ZA:{t:'evisa',d:30,c:55}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'evisa',d:30,c:55}, IL:{t:'banned',d:0,c:0} },
  // ── Additional Asia ────────────────────────────────────────────────────────
  // Macau SAR
  MO: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:30,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // ── Remaining Schengen ─────────────────────────────────────────────────────
  // Liechtenstein (Schengen associated)
  LI: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // San Marino
  SM: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // Andorra
  AD: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // Monaco
  MC: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'req',d:0,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // Vatican
  VA: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'free',d:90,c:0}, CN:{t:'free',d:90,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // ── Africa (additional) ────────────────────────────────────────────────────
  LR: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  SL: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'req',d:0,c:0} },
  GW: { US:{t:'evisa',d:90,c:60}, GB:{t:'evisa',d:90,c:60}, DE:{t:'evisa',d:90,c:60}, AU:{t:'evisa',d:90,c:60}, CA:{t:'evisa',d:90,c:60}, JP:{t:'evisa',d:90,c:60}, NZ:{t:'evisa',d:90,c:60}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'req',d:0,c:0} },
  GM: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  GQ: { US:{t:'req',d:0,c:150}, GB:{t:'req',d:0,c:150}, DE:{t:'req',d:0,c:150}, AU:{t:'req',d:0,c:150}, CA:{t:'req',d:0,c:150}, JP:{t:'req',d:0,c:150}, NZ:{t:'req',d:0,c:150}, ZA:{t:'req',d:0,c:0}, IN:{t:'req',d:0,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0}, IL:{t:'req',d:0,c:0} },
  MW: { US:{t:'free',d:90,c:0}, GB:{t:'free',d:90,c:0}, DE:{t:'free',d:90,c:0}, AU:{t:'free',d:90,c:0}, CA:{t:'free',d:90,c:0}, JP:{t:'free',d:90,c:0}, NZ:{t:'free',d:90,c:0}, ZA:{t:'free',d:90,c:0}, IN:{t:'free',d:30,c:0}, CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  // ── Final 9 gap-fill entries ───────────────────────────────────────────────
  DM: { US:{t:'free',d:21,c:0},  GB:{t:'free',d:21,c:0},  DE:{t:'free',d:21,c:0},  AU:{t:'free',d:21,c:0},  CA:{t:'free',d:21,c:0},  JP:{t:'free',d:21,c:0},  NZ:{t:'free',d:21,c:0},  ZA:{t:'req',d:0,c:0},  IN:{t:'req',d:0,c:0},  CN:{t:'req',d:0,c:0},  BR:{t:'free',d:21,c:0},  IL:{t:'free',d:21,c:0} },
  GM: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'req',d:0,c:0},  CN:{t:'free',d:30,c:0},  BR:{t:'free',d:90,c:0},  IL:{t:'free',d:90,c:0} },
  GQ: { US:{t:'req',d:0,c:150},  GB:{t:'req',d:0,c:150},  DE:{t:'req',d:0,c:150},  AU:{t:'req',d:0,c:150},  CA:{t:'req',d:0,c:150},  JP:{t:'req',d:0,c:150},  NZ:{t:'req',d:0,c:150},  ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},  CN:{t:'free',d:30,c:0}, BR:{t:'req',d:0,c:0},   IL:{t:'req',d:0,c:0} },
  GW: { US:{t:'evisa',d:90,c:60},GB:{t:'evisa',d:90,c:60},DE:{t:'evisa',d:90,c:60},AU:{t:'evisa',d:90,c:60},CA:{t:'evisa',d:90,c:60},JP:{t:'evisa',d:90,c:60},NZ:{t:'evisa',d:90,c:60},ZA:{t:'req',d:0,c:0},  IN:{t:'req',d:0,c:0},  CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'req',d:0,c:0} },
  LR: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'req',d:0,c:0},  CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  MW: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'free',d:30,c:0},CN:{t:'free',d:30,c:0},  BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  SL: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'req',d:0,c:0},  CN:{t:'free',d:30,c:0}, BR:{t:'free',d:90,c:0}, IL:{t:'req',d:0,c:0} },
  VA: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'free',d:90,c:0},  IN:{t:'free',d:90,c:0},CN:{t:'free',d:90,c:0},  BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
  XK: { US:{t:'free',d:90,c:0},  GB:{t:'free',d:90,c:0},  DE:{t:'free',d:90,c:0},  AU:{t:'free',d:90,c:0},  CA:{t:'free',d:90,c:0},  JP:{t:'free',d:90,c:0},  NZ:{t:'free',d:90,c:0},  ZA:{t:'req',d:0,c:0},   IN:{t:'req',d:0,c:0},  CN:{t:'req',d:0,c:0},   BR:{t:'free',d:90,c:0}, IL:{t:'free',d:90,c:0} },
};

if(typeof VISA_DATA!=="undefined"&&typeof VISA_DATA_ADDITIONS!=="undefined")Object.assign(VISA_DATA,VISA_DATA_ADDITIONS);
// GATE 3: COST_DETAILS additions
const COST_DETAILS_ADDITIONS = {
  // Europe
  AD: { hostel:60, meal:14, transport:5,  coffee:3, beer:4,  note:'No VAT makes electronics and tobacco cheap; hotels are pricey' },
  AL: { hostel:12, meal:4,  transport:2,  coffee:1, beer:2,  note:'One of Europe cheapest; Tirana affordable; Albanian Riviera rising' },
  AM: { hostel:15, meal:4,  transport:1,  coffee:2, beer:2,  note:'Yerevan affordable; strong cafe culture; taxis very cheap' },
  AT: { hostel:28, meal:12, transport:9,  coffee:4, beer:5,  note:'Vienna expensive by EU standards; regions more affordable' },
  AZ: { hostel:18, meal:5,  transport:1,  coffee:2, beer:2,  note:'Baku pricier than regions; oil wealth raises some prices' },
  BA: { hostel:14, meal:5,  transport:2,  coffee:2, beer:2,  note:'Sarajevo excellent value; Mostar tourist area slightly higher' },
  BE: { hostel:28, meal:12, transport:8,  coffee:3, beer:4,  note:'Brussels expensive; Belgian beer culture offers outstanding value' },
  BG: { hostel:12, meal:4,  transport:2,  coffee:2, beer:2,  note:'One of EU cheapest; Sofia affordable; Black Sea rises in summer' },
  BY: { hostel:20, meal:6,  transport:2,  coffee:2, beer:2,  note:'Conflict-affected prices unreliable; sanctions limit card use' },
  CH: { hostel:45, meal:20, transport:12, coffee:6, beer:8,  note:'Among world most expensive; budget carefully; tap water free' },
  CY: { hostel:20, meal:9,  transport:4,  coffee:3, beer:4,  note:'EU island; Nicosia affordable; beach resorts pricier in summer' },
  DK: { hostel:35, meal:18, transport:12, coffee:5, beer:8,  note:'Copenhagen consistently among world most expensive cities' },
  EE: { hostel:20, meal:8,  transport:4,  coffee:3, beer:3,  note:'Tallinn Old Town popular; digital-first society; mid-range EU' },
  FI: { hostel:30, meal:15, transport:10, coffee:4, beer:7,  note:'Helsinki expensive; Allemansratten free-camping rights help' },
  GE: { hostel:12, meal:4,  transport:2,  coffee:2, beer:2,  note:'Tbilisi excellent value; wine culture; Batumi slightly pricier' },
  HR: { hostel:18, meal:8,  transport:4,  coffee:3, beer:3,  note:'Dubrovnik most expensive; islands pricier; interior affordable' },
  IE: { hostel:25, meal:13, transport:8,  coffee:4, beer:7,  note:'Dublin among Europe most expensive; rural Ireland more modest' },
  IS: { hostel:50, meal:20, transport:10, coffee:6, beer:12, note:'Extremely expensive; self-catering and wild camping reduce costs' },
  LI: { hostel:80, meal:20, transport:8,  coffee:5, beer:7,  note:'One of world priciest micro-states; best as day-trip from Zurich' },
  LT: { hostel:18, meal:6,  transport:3,  coffee:3, beer:2,  note:'Vilnius excellent value by EU standards; Old Town very walkable' },
  LU: { hostel:30, meal:13, transport:5,  coffee:3, beer:5,  note:'High wages drive up all prices; Europe most expensive small capital' },
  LV: { hostel:18, meal:6,  transport:3,  coffee:3, beer:2,  note:'Riga underrated budget EU capital; Art Nouveau architecture free' },
  MC: { hostel:0,  meal:25, transport:0,  coffee:6, beer:10, note:'No budget accommodation; luxury only; day-trip from Nice advised' },
  MD: { hostel:12, meal:4,  transport:1,  coffee:1, beer:1,  note:'One of Europe cheapest destinations; Chisinau very affordable' },
  ME: { hostel:16, meal:6,  transport:3,  coffee:2, beer:3,  note:'Bay of Kotor popular; coastal areas pricier than interior' },
  MK: { hostel:14, meal:5,  transport:2,  coffee:2, beer:2,  note:'Skopje excellent value; one of Balkans most affordable capitals' },
  MT: { hostel:22, meal:9,  transport:3,  coffee:2, beer:3,  note:'Affordable Mediterranean island; Valletta pricier than Gozo' },
  NL: { hostel:30, meal:12, transport:9,  coffee:3, beer:5,  note:'Amsterdam one of pricier EU cities; cycling infrastructure free' },
  NO: { hostel:35, meal:18, transport:12, coffee:5, beer:10, note:'Among world most expensive; supermarkets essential for budget' },
  RO: { hostel:13, meal:5,  transport:2,  coffee:2, beer:2,  note:'Bucharest excellent value by EU standards; Transylvania cheaper' },
  RS: { hostel:14, meal:5,  transport:2,  coffee:2, beer:2,  note:'Belgrade top-value European capital; nightlife very affordable' },
  SE: { hostel:30, meal:15, transport:10, coffee:5, beer:7,  note:'Stockholm expensive; Allemansratten free-camping law helps' },
  SI: { hostel:18, meal:8,  transport:4,  coffee:3, beer:3,  note:'Ljubljana walkable and affordable; Lake Bled pricier in summer' },
  SK: { hostel:16, meal:6,  transport:3,  coffee:3, beer:2,  note:'Bratislava affordable EU capital; Tatra Mountains good value' },
  SM: { hostel:0,  meal:14, transport:3,  coffee:3, beer:4,  note:'No hostels; ideal day-trip from Rimini; restaurants tourist-priced' },
  UA: { hostel:10, meal:4,  transport:2,  coffee:2, beer:2,  note:'Conflict-affected prices unreliable; western regions more stable' },
  VA: { hostel:0,  meal:15, transport:0,  coffee:4, beer:0,  note:'No overnight stays; day-visit only; use Rome accommodation' },
  XK: { hostel:14, meal:4,  transport:2,  coffee:1, beer:2,  note:'Pristina very affordable; one of Balkans cheapest destinations' },
  // Central Asia
  KG: { hostel:10, meal:3,  transport:1,  coffee:1, beer:2,  note:'Bishkek very affordable; yurt camp stays add cost in summer' },
  KZ: { hostel:15, meal:4,  transport:2,  coffee:2, beer:2,  note:'Almaty and Astana pricier; rural steppe regions very affordable' },
  TJ: { hostel:10, meal:3,  transport:2,  coffee:1, beer:2,  note:'Dushanbe cheap; Pamir Highway requires significant transport budget' },
  TM: { hostel:20, meal:5,  transport:3,  coffee:2, beer:2,  note:'Visa very difficult to obtain; state-controlled economy distorts prices' },
  UZ: { hostel:10, meal:3,  transport:2,  coffee:1, beer:2,  note:'Tashkent affordable; Silk Road cities of Samarkand exceptional value' },
  // Middle East / West Asia
  AF: { hostel:15, meal:4,  transport:3,  coffee:1, beer:0,  note:'Conflict-affected prices unreliable; travel not recommended' },
  BH: { hostel:35, meal:10, transport:5,  coffee:4, beer:8,  note:'Alcohol in licensed venues; Manama more affordable than Dubai' },
  IL: { hostel:30, meal:12, transport:7,  coffee:5, beer:8,  note:'Tel Aviv among Middle East priciest; Jerusalem slightly cheaper' },
  IQ: { hostel:20, meal:5,  transport:3,  coffee:2, beer:0,  note:'Conflict-affected prices unreliable; Kurdistan region more stable' },
  IR: { hostel:12, meal:3,  transport:2,  coffee:1, beer:0,  note:'Sanctions complicate payments; no alcohol; exchange rate volatile' },
  JO: { hostel:18, meal:6,  transport:3,  coffee:3, beer:4,  note:'Amman mid-range; Jordan Pass covers major sites and visa fee' },
  KW: { hostel:0,  meal:10, transport:5,  coffee:4, beer:0,  note:'No hostels; no alcohol; hotels expensive; food courts affordable' },
  LB: { hostel:20, meal:6,  transport:3,  coffee:3, beer:4,  note:'Conflict-affected prices unreliable; currency crisis ongoing' },
  OM: { hostel:30, meal:8,  transport:5,  coffee:3, beer:6,  note:'More affordable than UAE; alcohol in licensed hotels only' },
  PS: { hostel:20, meal:6,  transport:3,  coffee:2, beer:0,  note:'Conflict-affected prices unreliable; access highly restricted' },
  QA: { hostel:0,  meal:12, transport:5,  coffee:5, beer:10, note:'No hostels; alcohol in licensed venues only; hotels expensive' },
  SA: { hostel:30, meal:8,  transport:5,  coffee:4, beer:0,  note:'No alcohol; Riyadh and Jeddah mid-range; Mecca closed to non-Muslims' },
  SY: { hostel:15, meal:4,  transport:2,  coffee:1, beer:2,  note:'Conflict-affected prices unreliable; most areas inaccessible' },
  YE: { hostel:10, meal:3,  transport:3,  coffee:1, beer:0,  note:'Conflict-affected prices unreliable; travel not recommended' },
  // South Asia
  BD: { hostel:7,  meal:2,  transport:1,  coffee:1, beer:1,  note:'Dhaka very affordable; one of South Asia cheapest destinations' },
  BN: { hostel:0,  meal:8,  transport:3,  coffee:3, beer:0,  note:'No hostels; no alcohol; Bandar Seri Begawan mid-range hotels' },
  BT: { hostel:0,  meal:0,  transport:0,  coffee:0, beer:0,  note:'Mandatory $100/day sustainable development fee covers most costs' },
  MV: { hostel:0,  meal:15, transport:10, coffee:5, beer:12, note:'Budget travel near-impossible; local islands far cheaper than resorts' },
  TL: { hostel:15, meal:5,  transport:4,  coffee:2, beer:3,  note:'Dili pricier due to UN legacy; Atauro island relatively cheaper' },
  // East Asia
  KP: { hostel:0,  meal:0,  transport:0,  coffee:0, beer:0,  note:'Conflict-affected prices unreliable; tourism effectively suspended' },
  MN: { hostel:12, meal:4,  transport:3,  coffee:2, beer:2,  note:'Ulaanbaatar affordable; ger camp stays add to rural travel costs' },
  TW: { hostel:18, meal:5,  transport:4,  coffee:3, beer:3,  note:'Excellent value; night markets among world best cheap eats' },
  // Pacific / Oceania
  FJ: { hostel:20, meal:8,  transport:5,  coffee:3, beer:4,  note:'Budget resorts exist; inter-island transport adds up fast' },
  FM: { hostel:25, meal:10, transport:5,  coffee:3, beer:4,  note:'Remote Micronesia; limited budget options; diving expensive' },
  KI: { hostel:30, meal:10, transport:8,  coffee:3, beer:4,  note:'Very remote; inter-island flights dominate the travel budget' },
  MH: { hostel:35, meal:12, transport:8,  coffee:4, beer:5,  note:'Majuro limited cheap options; US military presence raises prices' },
  NR: { hostel:60, meal:15, transport:5,  coffee:4, beer:6,  note:'Tiny island; very limited accommodation; most goods imported' },
  PG: { hostel:25, meal:8,  transport:5,  coffee:3, beer:4,  note:'Port Moresby expensive for region; plan security costs carefully' },
  PW: { hostel:50, meal:14, transport:6,  coffee:4, beer:6,  note:'Diving paradise but expensive; most food is imported' },
  SB: { hostel:25, meal:8,  transport:5,  coffee:3, beer:4,  note:'Honiara mid-range; outer islands require charter transport' },
  TO: { hostel:25, meal:8,  transport:5,  coffee:3, beer:4,  note:'Affordable for Pacific; local food cheap; imports expensive' },
  TV: { hostel:40, meal:12, transport:5,  coffee:4, beer:5,  note:'One of world smallest nations; very limited facilities' },
  VU: { hostel:20, meal:8,  transport:5,  coffee:3, beer:4,  note:'Port Vila affordable; outer islands add significant transport cost' },
  WS: { hostel:25, meal:8,  transport:5,  coffee:3, beer:4,  note:'Apia relaxed; fale beach stays offer affordable accommodation' },
  // Sub-Saharan Africa
  AO: { hostel:30, meal:8,  transport:5,  coffee:3, beer:3,  note:'Luanda historically one of world most expensive cities' },
  BF: { hostel:12, meal:3,  transport:2,  coffee:1, beer:2,  note:'Conflict-affected prices unreliable; northern areas inaccessible' },
  BI: { hostel:15, meal:4,  transport:3,  coffee:2, beer:2,  note:'Bujumbura affordable; political instability creates uncertainty' },
  BJ: { hostel:12, meal:4,  transport:2,  coffee:2, beer:2,  note:'Cotonou affordable; stable West Africa hub with good transport' },
  BW: { hostel:25, meal:8,  transport:5,  coffee:3, beer:3,  note:'Safari lodges premium; Gaborone mid-range; good infrastructure' },
  CD: { hostel:20, meal:5,  transport:4,  coffee:2, beer:2,  note:'Conflict-affected prices unreliable; Kinshasa logistics costly' },
  CF: { hostel:20, meal:5,  transport:4,  coffee:2, beer:2,  note:'Conflict-affected prices unreliable; travel not recommended' },
  CG: { hostel:20, meal:6,  transport:4,  coffee:2, beer:2,  note:'Brazzaville mid-range; oil economy keeps some prices elevated' },
  CI: { hostel:15, meal:5,  transport:3,  coffee:2, beer:2,  note:'Abidjan West Africa commercial hub; mid-range prices' },
  CM: { hostel:15, meal:4,  transport:3,  coffee:2, beer:2,  note:'Yaounde and Douala affordable; English and French regions accessible' },
  CV: { hostel:20, meal:7,  transport:4,  coffee:2, beer:3,  note:'Island nation; inter-island flights add cost; Sal tourist-priced' },
  DJ: { hostel:25, meal:8,  transport:4,  coffee:3, beer:4,  note:'Djibouti City expensive for East Africa; strategic port economy' },
  DZ: { hostel:15, meal:4,  transport:2,  coffee:1, beer:2,  note:'Algiers affordable; alcohol limited to some venues; Sahara tours pricey' },
  EH: { hostel:15, meal:5,  transport:3,  coffee:2, beer:0,  note:'Western Sahara status disputed; Laayoune mid-range; alcohol rare' },
  ER: { hostel:15, meal:4,  transport:3,  coffee:1, beer:2,  note:'Asmara colonial architecture affordable; visa and banking very limited' },
  ET: { hostel:8,  meal:3,  transport:2,  coffee:1, beer:2,  note:'Addis Ababa excellent value; historical northern circuit affordable' },
  GA: { hostel:25, meal:8,  transport:5,  coffee:3, beer:3,  note:'Libreville expensive for Africa; oil wealth raises city prices' },
  GM: { hostel:15, meal:4,  transport:2,  coffee:2, beer:2,  note:'Banjul very affordable; popular budget beach destination' },
  GN: { hostel:15, meal:4,  transport:3,  coffee:2, beer:2,  note:'Conakry mid-range; infrastructure costs add up outside capital' },
  GQ: { hostel:50, meal:15, transport:8,  coffee:5, beer:5,  note:'Malabo extremely expensive; oil-driven economy; few budget options' },
  GW: { hostel:15, meal:4,  transport:3,  coffee:1, beer:2,  note:'One of West Africa cheapest; Bissau very affordable' },
  KM: { hostel:25, meal:7,  transport:5,  coffee:2, beer:0,  note:'Moroni mid-range; alcohol limited; inter-island ferries add cost' },
  LR: { hostel:20, meal:5,  transport:4,  coffee:2, beer:2,  note:'Monrovia uses USD; mid-range costs; infrastructure limited' },
  LS: { hostel:20, meal:5,  transport:3,  coffee:2, beer:3,  note:'Maseru affordable; landlocked within South Africa; stable prices' },
  LY: { hostel:20, meal:5,  transport:3,  coffee:1, beer:0,  note:'Conflict-affected prices unreliable; travel not recommended' },
  MG: { hostel:12, meal:4,  transport:3,  coffee:2, beer:2,  note:'Antananarivo affordable; remote national parks require costly logistics' },
  ML: { hostel:15, meal:4,  transport:3,  coffee:2, beer:2,  note:'Conflict-affected prices unreliable; Bamako still partially accessible' },
  MR: { hostel:15, meal:4,  transport:3,  coffee:1, beer:2,  note:'Nouakchott affordable; Saharan desert tours require significant budget' },
  MU: { hostel:0,  meal:10, transport:4,  coffee:3, beer:4,  note:'No hostels; guesthouses available; luxury resorts very expensive' },
  MW: { hostel:10, meal:3,  transport:3,  coffee:2, beer:2,  note:'One of Africa most affordable; Lake Malawi budget-friendly' },
  MZ: { hostel:12, meal:4,  transport:3,  coffee:2, beer:2,  note:'Maputo affordable; northern Mozambique islands add transport cost' },
  NA: { hostel:20, meal:7,  transport:5,  coffee:3, beer:3,  note:'Windhoek mid-range; self-drive camping in national parks affordable' },
  NE: { hostel:15, meal:4,  transport:3,  coffee:1, beer:2,  note:'Niamey affordable; Sahara expeditions are budget-intensive' },
  RW: { hostel:15, meal:5,  transport:3,  coffee:2, beer:2,  note:'Kigali clean and mid-range; mountain gorilla permits $1,500 per person' },
  SC: { hostel:0,  meal:15, transport:6,  coffee:4, beer:5,  note:'No hostels; guesthouses from $50; island paradise at premium price' },
  SD: { hostel:15, meal:4,  transport:3,  coffee:1, beer:0,  note:'Conflict-affected prices unreliable; travel not recommended' },
  SL: { hostel:20, meal:5,  transport:4,  coffee:2, beer:2,  note:'Freetown mid-range; beautiful beaches accessible; infrastructure limited' },
  SN: { hostel:15, meal:5,  transport:3,  coffee:2, beer:2,  note:'Dakar mid-range for West Africa; Casamance region very affordable' },
  SO: { hostel:25, meal:6,  transport:5,  coffee:2, beer:0,  note:'Conflict-affected prices unreliable; travel not recommended' },
  SS: { hostel:20, meal:5,  transport:5,  coffee:2, beer:2,  note:'Conflict-affected prices unreliable; Juba logistics very costly' },
  ST: { hostel:30, meal:10, transport:5,  coffee:3, beer:3,  note:'Small island nation; most goods imported; eco-tourism premium' },
  SZ: { hostel:20, meal:5,  transport:3,  coffee:2, beer:3,  note:'Mbabane affordable; rand-linked economy; great hiking trails' },
  TD: { hostel:20, meal:5,  transport:4,  coffee:2, beer:2,  note:'Conflict-affected prices unreliable; limited tourist infrastructure' },
  TG: { hostel:12, meal:4,  transport:2,  coffee:2, beer:2,  note:'Lome beach strip tourist-priced; interior and markets very cheap' },
  TN: { hostel:12, meal:4,  transport:2,  coffee:1, beer:3,  note:'Excellent value Mediterranean destination; Tunis highly affordable' },
  UG: { hostel:12, meal:4,  transport:3,  coffee:2, beer:2,  note:'Kampala affordable; gorilla permits add significantly to budget' },
  ZM: { hostel:15, meal:5,  transport:4,  coffee:2, beer:2,  note:'Lusaka mid-range; Victoria Falls area notably pricier for tourists' },
  ZW: { hostel:15, meal:5,  transport:3,  coffee:2, beer:2,  note:'Harare mid-range; USD economy; Victoria Falls area more expensive' },
  // Caribbean
  AG: { hostel:0,  meal:15, transport:5,  coffee:4, beer:5,  note:'No hostels; Antigua guesthouses mid-range; Caribbean standard pricing' },
  AW: { hostel:50, meal:15, transport:6,  coffee:4, beer:6,  note:'Aruba one of Caribbean most expensive; Dutch-level prices' },
  BB: { hostel:0,  meal:15, transport:6,  coffee:4, beer:5,  note:'No hostels; one of Caribbean most expensive islands' },
  BS: { hostel:0,  meal:15, transport:5,  coffee:4, beer:5,  note:'Nassau expensive; Out Islands require careful ferry budget planning' },
  CW: { hostel:40, meal:12, transport:5,  coffee:4, beer:5,  note:'Curacao mid-to-high range; colourful Willemstad popular' },
  DM: { hostel:20, meal:10, transport:5,  coffee:3, beer:4,  note:'Nature island; eco-lodges mid-range; hiking trails are free' },
  GD: { hostel:25, meal:10, transport:5,  coffee:3, beer:4,  note:'Grenada affordable Caribbean; spice island good value' },
  HT: { hostel:20, meal:5,  transport:4,  coffee:2, beer:2,  note:'Conflict-affected prices unreliable; travel advisory active' },
  JM: { hostel:25, meal:8,  transport:5,  coffee:3, beer:3,  note:'Resort corridors expensive; local towns much more affordable' },
  KN: { hostel:0,  meal:15, transport:5,  coffee:4, beer:5,  note:'No hostels; Nevis more exclusive than St Kitts; both mid-to-high' },
  LC: { hostel:25, meal:10, transport:5,  coffee:3, beer:4,  note:'St Lucia mid-range Caribbean; Rodney Bay is the priciest area' },
  TT: { hostel:25, meal:10, transport:5,  coffee:3, beer:4,  note:'Trinidad more affordable than Tobago; Carnival drives up prices' },
  VC: { hostel:25, meal:9,  transport:5,  coffee:3, beer:4,  note:'Grenadines expensive for yachting; St Vincent main island modest' },
  // Central America
  BZ: { hostel:15, meal:7,  transport:4,  coffee:2, beer:3,  note:'Pricier than Central American neighbours; uses Belize dollar' },
  CR: { hostel:16, meal:6,  transport:4,  coffee:2, beer:3,  note:'Pricier than regional neighbours; eco-tourism drives up park costs' },
  GT: { hostel:10, meal:4,  transport:3,  coffee:2, beer:2,  note:'Excellent budget destination; Antigua tourist area slightly pricier' },
  HN: { hostel:10, meal:4,  transport:3,  coffee:2, beer:2,  note:'Bay Islands pricier for diving; mainland cities very affordable' },
  NI: { hostel:9,  meal:4,  transport:2,  coffee:1, beer:2,  note:'Among Central America cheapest; Granada excellent budget value' },
  PA: { hostel:14, meal:6,  transport:4,  coffee:2, beer:2,  note:'Panama City pricier; Bocas del Toro and highlands more affordable' },
  SV: { hostel:12, meal:4,  transport:2,  coffee:2, beer:2,  note:'El Salvador uses USD; surf coast pricier; inland cities affordable' },
  // South America
  BO: { hostel:8,  meal:3,  transport:2,  coffee:1, beer:2,  note:'One of South America cheapest; altitude of La Paz unique challenge' },
  DO: { hostel:18, meal:6,  transport:4,  coffee:2, beer:2,  note:'All-inclusive resorts dominate; local towns much more affordable' },
  GY: { hostel:20, meal:6,  transport:5,  coffee:2, beer:3,  note:'Georgetown mid-range; interior jungle eco-lodges expensive' },
  PY: { hostel:10, meal:4,  transport:2,  coffee:2, beer:2,  note:'Asuncion very affordable; one of continent cheapest capitals' },
  SR: { hostel:20, meal:7,  transport:5,  coffee:2, beer:3,  note:'Paramaribo mid-range; interior Amazonia requires charter transport' },
  UY: { hostel:18, meal:8,  transport:5,  coffee:3, beer:3,  note:'Most expensive in Southern Cone after Chile; Montevideo walkable' },
  VE: { hostel:8,  meal:3,  transport:2,  coffee:1, beer:2,  note:'Hyperinflation history; USD accepted widely; prices volatile' },
  // ── Gap-fill: 48 remaining countries ──────────────────────────────────────
  // Gulf / Middle East
  AE: { hostel:35, meal:10, transport:4,  coffee:4, beer:0,  note:'Alcohol only in licensed hotels/bars; dining range is wide' },
  // East/Southeast Asia
  KR: { hostel:18, meal:6,  transport:2,  coffee:4, beer:3,  note:'Seoul has excellent budget street food; transport very cheap' },
  PH: { hostel:9,  meal:2,  transport:1,  coffee:2, beer:1,  note:'Very affordable; island-hopping adds boat fares; Manila pricier' },
  SG: { hostel:28, meal:7,  transport:3,  coffee:5, beer:8,  note:'Most expensive city in SE Asia; excellent street hawker centres' },
  // Europe
  AE: { hostel:35, meal:10, transport:4,  coffee:4, beer:0,  note:'Alcohol only in licensed venues; wide price range' },
  CZ: { hostel:15, meal:5,  transport:2,  coffee:2, beer:2,  note:'Prague among Europas best-value capitals; beer famously cheap' },
  HU: { hostel:14, meal:5,  transport:2,  coffee:2, beer:2,  note:'Budapest excellent value; thermal baths budget-friendly' },
  PL: { hostel:13, meal:4,  transport:2,  coffee:2, beer:2,  note:'Warsaw and Krakow very affordable by EU standards' },
  // Caribbean
  AG: { hostel:60, meal:15, transport:6,  coffee:4, beer:5,  note:'Antigua pricey island resort prices; Barbuda wilder and cheaper' },
  BB: { hostel:55, meal:14, transport:8,  coffee:4, beer:5,  note:'Barbados most expensive Eastern Caribbean island' },
  BS: { hostel:80, meal:18, transport:6,  coffee:5, beer:6,  note:'Bahamas expensive; Nassau and Exuma luxury-oriented' },
  CU: { hostel:15, meal:4,  transport:2,  coffee:2, beer:2,  note:'Two-currency legacy; CUP now unified; USD welcome in tourist zones' },
  DM: { hostel:40, meal:12, transport:5,  coffee:3, beer:4,  note:'Dominica eco-tourism; modest infrastructure keeps costs mid-range' },
  DO: { hostel:20, meal:5,  transport:3,  coffee:2, beer:2,  note:'Santo Domingo affordable; resorts (Punta Cana) add-on more' },
  GD: { hostel:45, meal:12, transport:5,  coffee:3, beer:4,  note:'Grenada small island; St. George charming and mid-range' },
  HT: { hostel:25, meal:6,  transport:3,  coffee:2, beer:2,  note:'Cheapest in Caribbean; security constraints limit tourism options' },
  JM: { hostel:30, meal:7,  transport:4,  coffee:3, beer:3,  note:'Resorts expensive; local guesthouses and jerk stalls very cheap' },
  KN: { hostel:55, meal:14, transport:5,  coffee:4, beer:5,  note:'St. Kitts resort-oriented; Nevis quieter and slightly cheaper' },
  LC: { hostel:50, meal:13, transport:6,  coffee:3, beer:4,  note:'Saint Lucia mid-luxury; volcanic scenery commands premium' },
  TT: { hostel:35, meal:8,  transport:4,  coffee:3, beer:3,  note:'Trinidad commercial hub; Tobago resort-pricier' },
  VC: { hostel:40, meal:10, transport:4,  coffee:3, beer:3,  note:'Saint Vincent quietest Windwards; Bequia is pricier sailing hub' },
  // Central America
  BZ: { hostel:18, meal:5,  transport:4,  coffee:3, beer:3,  note:'USD accepted; cheaper mainland vs expensive island (Caye Caulker)' },
  CR: { hostel:18, meal:6,  transport:3,  coffee:2, beer:3,  note:'Costa Rica priciest in Central America; eco-lodges add premium' },
  GT: { hostel:9,  meal:3,  transport:2,  coffee:2, beer:2,  note:'Guatemala cheapest in Central America; Antigua touristy but fair' },
  HN: { hostel:12, meal:3,  transport:2,  coffee:2, beer:2,  note:'Honduras budget; Bay Islands (diving) much more expensive' },
  NI: { hostel:10, meal:3,  transport:1,  coffee:2, beer:2,  note:'Cheapest in Central America; infrastructure impacts options' },
  PA: { hostel:18, meal:6,  transport:3,  coffee:3, beer:3,  note:'Panama City modern and pricier; Bocas del Toro mid-range' },
  SV: { hostel:14, meal:4,  transport:2,  coffee:2, beer:2,  note:'El Salvador uses USD; budget Central America; surf towns popular' },
  // South America
  BO: { hostel:8,  meal:2,  transport:1,  coffee:1, beer:2,  note:'Bolivian staples (salteñas, api) very cheap; altitude adds needs' },
  GY: { hostel:20, meal:6,  transport:4,  coffee:2, beer:3,  note:'Georgetown urban; Rupununi eco-lodges expensive' },
  PY: { hostel:15, meal:4,  transport:2,  coffee:2, beer:2,  note:'Asuncion cheapest S. American capital; triple-frontier bargains' },
  SR: { hostel:20, meal:7,  transport:5,  coffee:2, beer:3,  note:'Paramaribo charming; interior Amazon requires charter transport' },
  // Africa
  SC: { hostel:60, meal:16, transport:8,  coffee:5, beer:6,  note:'Seychelles among world most expensive island destinations' },
  SD: { hostel:20, meal:4,  transport:3,  coffee:2, beer:0,  note:'Sudan dry; no alcohol; Khartoum mid-range; limited tourist infrastructure' },
  SL: { hostel:20, meal:4,  transport:3,  coffee:2, beer:2,  note:'Sierra Leone Freetown mid-range; beach tourism growing' },
  SN: { hostel:18, meal:4,  transport:2,  coffee:2, beer:2,  note:'Dakar West Africa hub; pricier than neighbours but good value' },
  SO: { hostel:30, meal:5,  transport:5,  coffee:2, beer:0,  note:'Mogadishu; no alcohol; security constraints limit tourism severely' },
  SS: { hostel:30, meal:6,  transport:5,  coffee:2, beer:0,  note:'Juba; infrastructure limited; conflict zones; security surcharges' },
  ST: { hostel:45, meal:12, transport:6,  coffee:3, beer:3,  note:'São Tomé island premium; excellent cacao and seafood' },
  SZ: { hostel:25, meal:6,  transport:3,  coffee:2, beer:3,  note:'Eswatini compact; Mbabane affordable by Southern Africa standards' },
  TD: { hostel:25, meal:5,  transport:5,  coffee:2, beer:2,  note:'Ndjamena; conflict zones; expensive for limited tourism services' },
  TG: { hostel:18, meal:4,  transport:2,  coffee:2, beer:2,  note:'Lomé West Africa hub; affordable; beach hotels good value' },
  TN: { hostel:18, meal:5,  transport:2,  coffee:2, beer:2,  note:'Tunisia excellent value; Tunis medina food very cheap' },
  UG: { hostel:20, meal:4,  transport:2,  coffee:2, beer:2,  note:'Kampala affordable; gorilla permits ($800) are the big cost spike' },
  ZM: { hostel:20, meal:5,  transport:4,  coffee:2, beer:3,  note:'Lusaka mid-range; Victoria Falls side costly for safari/activities' },
  ZW: { hostel:18, meal:5,  transport:3,  coffee:2, beer:3,  note:'Harare recovering; USD used; Victoria Falls tourist zone pricier' },
  // Pacific Islands
  SB: { hostel:35, meal:8,  transport:6,  coffee:3, beer:4,  note:'Solomon Islands; limited infrastructure; diving premium' },
  TO: { hostel:35, meal:8,  transport:6,  coffee:3, beer:4,  note:'Tonga; small tourism sector; accommodation limited options' },
};

if(typeof COST_DETAILS!=="undefined"&&typeof COST_DETAILS_ADDITIONS!=="undefined")Object.assign(COST_DETAILS,COST_DETAILS_ADDITIONS);
// GATE 7: CD_CLIMATE additions
const CD_CLIMATE_ADDITIONS = {
  // Europe: Nordic
  NO: { temp:[-4,-4, 0, 5,11,16,18,17,13, 7, 2,-2], rain:[ 55, 40, 46, 41, 45, 58, 68, 80, 86, 93, 75, 64] },
  IS: { temp:[ 0, 1, 1, 4, 8,11,13,13,10, 6,  2, 1], rain:[ 76, 65, 62, 59, 42, 44, 52, 63, 72, 87, 81, 80] },
  // Europe: Western
  LU: { temp:[ 1, 2, 6,10,15,18,20,20,17,12,  6, 2], rain:[ 72, 60, 64, 59, 64, 75, 68, 72, 63, 67, 70, 76] },
  MT: { temp:[13,13,15,18,22,26,30,30,27,23, 18,14], rain:[ 80, 46, 37, 19,  6,  2,  0,  4, 27, 76,103, 96] },
  // Europe: Eastern / Balkans
  RO: { temp:[-3,-1, 4,11,17,21,23,23,18,12,  5,-1], rain:[ 37, 35, 31, 37, 58, 73, 62, 58, 40, 27, 40, 42] },
  BG: { temp:[ 1, 3, 8,13,18,22,25,25,21,15,  8, 3], rain:[ 36, 28, 31, 42, 56, 65, 52, 38, 33, 31, 44, 51] },
  MK: { temp:[ 1, 4, 8,13,18,22,25,25,21,14,  8, 2], rain:[ 30, 28, 31, 38, 46, 45, 31, 26, 32, 38, 44, 39] },
  AL: { temp:[ 6, 8,10,14,19,23,26,26,22,17, 12, 7], rain:[119,100, 93, 73, 60, 28,  9,  8, 49,107,152,140] },
  BA: { temp:[ 1, 3, 7,12,17,21,23,23,19,13,  7, 2], rain:[ 76, 65, 67, 74, 71, 79, 52, 60, 73, 87, 97, 87] },
  ME: { temp:[ 5, 6, 9,13,18,22,25,25,21,15, 10, 6], rain:[204,157,138,131,116, 92, 45, 53,136,185,222,234] },
  XK: { temp:[-1, 1, 5,10,15,19,22,22,18,11,  5, 0], rain:[ 35, 36, 38, 49, 57, 65, 43, 40, 43, 52, 51, 43] },
  BY: { temp:[-6,-6,-2, 6,13,17,19,18,13, 7,  1,-4], rain:[ 36, 30, 31, 39, 45, 63, 84, 79, 58, 47, 48, 43] },
  MD: { temp:[-3,-1, 4,11,17,21,23,23,18,11,  5,-1], rain:[ 33, 28, 28, 39, 51, 74, 65, 53, 36, 28, 37, 39] },
  // Middle East
  SA: { temp:[14,17,22,27,33,36,38,38,35,29, 22,16], rain:[  3,  1,  1,  0,  0,  0,  0,  0,  0,  0,  2,  5] },
  IQ: { temp:[10,12,17,23,31,37,41,40,37,29, 20,13], rain:[ 28, 21, 22, 10,  3,  0,  0,  0,  0,  3, 13, 29] },
  IR: { temp:[ 3, 5, 9,16,22,28,32,31,28,21, 13, 6], rain:[ 37, 28, 40, 29, 11,  2,  0,  1,  1,  5, 26, 43] },
  SY: { temp:[ 7, 8,12,17,22,27,29,29,27,22, 15, 9], rain:[ 43, 33, 27, 11,  5,  0,  0,  0,  0,  2, 19, 43] },
  YE: { temp:[25,26,27,28,28,27,28,30,29,27, 27,26], rain:[  4,  3,  2,  5,  2,  7, 37, 13, 18, 15,  5,  5] },
  PS: { temp:[11,12,15,19,23,25,28,29,27,24, 19,13], rain:[ 91, 70, 41, 13,  2,  0,  0,  0,  0,  5, 23, 75] },
  // Central Asia
  AF: { temp:[-1, 2, 9,14,19,24,25,23,19,13,  5, 0], rain:[ 25, 30, 55, 37, 13,  1,  1,  1,  1,  1,  9, 26] },
  KZ: { temp:[-14,-12,-6, 7,15,21,24,22,15, 6, -3,-10], rain:[ 18, 17, 22, 25, 36, 30, 22, 18, 23, 31, 28, 22] },
  UZ: { temp:[ 0, 3, 9,16,22,28,31,29,24,15,  7, 1], rain:[ 48, 43, 56, 39, 19,  5,  2,  2,  4, 19, 37, 49] },
  TM: { temp:[ 3, 5,11,18,24,30,32,30,24,16,  9, 4], rain:[ 13, 12, 18, 10,  5,  1,  0,  0,  1,  6, 11, 16] },
  TJ: { temp:[-1, 2, 8,14,19,24,27,25,20,13,  6, 1], rain:[ 47, 53, 75, 62, 42, 14,  5,  4,  5, 23, 41, 44] },
  KG: { temp:[-6,-4, 3,11,17,22,25,23,18,10,  2,-4], rain:[ 17, 16, 21, 29, 37, 27, 15, 11, 10, 15, 15, 17] },
  // South / East Asia
  BD: { temp:[18,21,26,29,30,30,29,29,29,27, 22,18], rain:[ 14, 26, 60,135,312,378,430,345,253,148, 38, 12] },
  MN: { temp:[-22,-17,-10, 0, 9,15,18,16, 9,-1,-13,-20], rain:[  2,  2,  3,  5, 11, 29, 59, 66, 24,  6,  4,  2] },
  TW: { temp:[16,16,18,22,26,29,31,31,29,26, 22,18], rain:[ 71, 87,112,131,211,320,207,302,395,121, 66, 59] },
  HK: { temp:[16,16,19,23,27,29,29,29,28,25, 21,17], rain:[ 30, 44, 72,135,304,371,367,457,253,100, 35, 28] },
  KP: { temp:[-8,-5, 1, 9,15,20,24,25,20,12,  2,-6], rain:[  9, 12, 21, 44, 64, 96,271,195, 80, 37, 21, 12] },
  TL: { temp:[26,27,27,27,27,25,24,24,25,26, 27,27], rain:[123, 95, 87,105,131,123, 95, 68, 59, 78,126,147] },
  BT: { temp:[ 4, 6, 9,13,16,19,20,20,19,15, 10, 5], rain:[ 15, 20, 46, 92,208,308,356,320,229, 89, 18,  9] },
  MV: { temp:[27,28,29,30,30,29,28,28,28,28, 28,27], rain:[111, 60, 73,119,235,188,175,192,212,200,231,195] },
  BN: { temp:[27,27,28,28,29,29,29,29,28,28, 27,27], rain:[149, 96,112,126,204,288,261,213,204,230,301,277] },
  // North Africa
  DZ: { temp:[ 9,11,14,17,22,26,30,29,25,20, 14,10], rain:[ 26, 17, 18,  9,  5,  1,  0,  0,  4, 12, 24, 28] },
  LY: { temp:[12,14,17,21,25,28,28,28,26,22, 17,13], rain:[ 22,  9,  7,  2,  1,  0,  0,  0,  0,  2, 10, 24] },
  // Sub-Saharan Africa: East
  SD: { temp:[22,24,28,33,38,40,38,38,37,35, 28,23], rain:[  0,  0,  0,  0,  0,  1, 17, 30, 11,  1,  0,  0] },
  SS: { temp:[27,28,31,33,32,30,28,28,28,29, 28,27], rain:[  2,  3, 19, 62,130,122,127,127,100, 66, 18,  4] },
  ER: { temp:[17,18,21,25,28,32,33,32,30,26, 22,18], rain:[  2,  4,  4,  3,  5, 11, 37, 62, 31, 11,  4,  2] },
  DJ: { temp:[25,26,28,30,32,36,41,42,38,33, 29,26], rain:[ 25, 19,  4,  9,  4,  0,  6,  5,  5, 17, 28, 31] },
  SO: { temp:[28,28,28,28,27,27,26,25,25,26, 27,27], rain:[ 10,  5,  4, 66, 94, 51, 21, 25, 50, 47, 54, 15] },
  UG: { temp:[24,25,25,24,23,21,20,21,22,22, 23,23], rain:[ 52, 63, 97,157,119, 67, 44, 51, 88,117, 93, 60] },
  RW: { temp:[20,20,20,19,19,18,18,19,20,20, 19,19], rain:[ 68, 92,132,146, 75, 18,  9, 20, 76,106, 96, 63] },
  BI: { temp:[21,21,20,19,19,18,18,19,20,21, 20,20], rain:[ 84, 90,143,130, 73, 15,  9, 12, 57,105,108, 77] },
  // Sub-Saharan Africa: Southern
  MZ: { temp:[28,28,27,25,22,20,19,20,22,24, 26,28], rain:[154,148,101, 53, 23, 18, 13, 11, 17, 37, 74,132] },
  ZM: { temp:[22,22,22,22,22,19,18,20,23,25, 25,23], rain:[195,191,134, 44,  4,  0,  0,  0,  0,  8, 75,170] },
  ZW: { temp:[23,22,22,21,18,15,14,16,19,23, 23,22], rain:[166,149, 90, 35,  8,  3,  2,  2,  5, 26, 94,152] },
  BW: { temp:[28,26,24,21,17,13,12,15,21,25, 27,28], rain:[ 96, 88, 56, 23,  4,  0,  1,  1,  2, 19, 56, 89] },
  NA: { temp:[23,23,21,19,15,12,11,14,18,22, 24,24], rain:[ 65, 77, 78, 35, 13,  2,  1,  1,  4, 14, 29, 47] },
  AO: { temp:[28,28,27,26,23,20,19,20,23,26, 28,29], rain:[125, 93, 96, 69,  9,  0,  0,  1,  7, 27, 85,124] },
  SZ: { temp:[23,22,20,17,14,11,11,13,16,19, 21,22], rain:[116,102, 78, 39, 23, 12, 11, 16, 29, 63, 84,110] },
  LS: { temp:[22,22,20,16,11, 7, 7, 9,14,18, 20,21], rain:[114, 89, 90, 55, 19,  9,  8, 10, 27, 65, 78,110] },
  MW: { temp:[26,26,25,24,22,19,18,19,22,25, 27,27], rain:[168,155,104, 34,  7,  1,  1,  1,  3, 10, 65,157] },
  MG: { temp:[27,27,26,26,24,21,20,21,23,25, 26,27], rain:[339,280,175, 61, 21,  8,  8,  7, 16, 48,115,232] },
  MU: { temp:[27,28,27,26,23,22,21,21,22,23, 24,26], rain:[157,172,133, 87, 76, 59, 64, 63, 45, 47, 53, 95] },
  SC: { temp:[28,29,29,29,28,27,26,26,27,27, 27,27], rain:[385,268,147, 77, 63, 55, 52, 75, 92,150,262,374] },
  KM: { temp:[28,29,29,28,27,25,24,24,25,26, 27,28], rain:[293,224,191,138, 79, 33, 15, 15, 28, 71,147,247] },
  // Sub-Saharan Africa: Central
  CD: { temp:[26,26,26,27,26,24,23,24,25,26, 26,26], rain:[125,111,155,183,139, 38, 14, 28, 81,151,195,139] },
  CG: { temp:[26,27,27,27,25,23,22,23,25,26, 26,26], rain:[105,127,150,169, 80, 11,  4, 12, 58,134,184,132] },
  CF: { temp:[24,25,27,27,27,26,25,25,26,26, 25,24], rain:[  8, 18, 63,114,139,113, 93,116,155,118, 45, 12] },
  CM: { temp:[25,26,27,26,26,24,23,24,24,25, 25,25], rain:[ 17, 33,104,154,216,182,212,281,312,222,100, 32] },
  GA: { temp:[26,27,27,27,27,24,23,24,25,25, 26,26], rain:[247,221,285,276,210, 43, 15, 47,198,320,333,235] },
  GQ: { temp:[26,26,26,26,27,25,24,24,25,26, 26,26], rain:[ 84, 89,166,198,194, 89, 47, 61,201,279,216,118] },
  ST: { temp:[27,27,28,28,27,25,23,23,24,25, 27,27], rain:[ 99, 72, 73,131,210,251,135, 53, 73,214,266,180] },
  // Sub-Saharan Africa: West
  TD: { temp:[17,21,26,33,37,35,31,30,32,33, 24,18], rain:[  0,  0,  2, 12, 31, 52, 82,107, 52, 11,  1,  0] },
  NE: { temp:[22,25,30,35,38,36,32,30,33,36, 28,22], rain:[  0,  0,  1,  4, 28, 65, 98, 91, 48, 11,  1,  0] },
  ML: { temp:[23,26,30,34,38,35,32,31,33,35, 28,23], rain:[  0,  0,  1,  3, 25, 58,117,107, 77, 18,  2,  0] },
  BF: { temp:[25,27,31,34,35,31,28,27,29,32, 29,25], rain:[  2,  2,  5, 14, 67,112,176,196,122, 44,  9,  3] },
  GN: { temp:[26,28,29,29,28,26,25,25,26,27, 27,26], rain:[  6,  8, 15, 70,179,352,520,456,418,213, 52,  8] },
  SN: { temp:[22,23,24,25,27,28,29,28,28,28, 24,22], rain:[  0,  2,  0,  0, 10, 39,190,258,197, 52,  6,  1] },
  GM: { temp:[22,24,26,27,28,29,28,27,28,28, 24,22], rain:[  0,  0,  0,  0,  5, 66,256,311,199, 53,  4,  0] },
  GW: { temp:[24,26,28,29,29,28,27,26,27,28, 26,24], rain:[  1,  2,  4, 11, 60,253,474,427,315,111, 24,  3] },
  SL: { temp:[27,27,28,28,28,26,25,25,26,26, 27,27], rain:[  9, 11, 35,118,245,476,658,617,484,240, 71, 17] },
  LR: { temp:[27,27,28,28,27,26,24,24,25,26, 27,27], rain:[ 28, 43, 95,181,353,583,509,347,381,375,185, 72] },
  CI: { temp:[27,28,29,28,28,25,24,24,25,26, 27,27], rain:[ 28, 49, 90,127,262,458,194, 95,121,173, 85, 35] },
  TG: { temp:[27,28,30,30,29,27,26,26,27,28, 28,27], rain:[ 36, 55, 90,109,131,145, 72, 45, 86,100, 60, 40] },
  BJ: { temp:[27,28,30,31,30,28,27,26,27,28, 28,27], rain:[ 18, 36, 75,112,125,181,119, 71,113,126, 29, 14] },
  // Sub-Saharan Africa: Indian Ocean islands
  CV: { temp:[22,22,22,23,24,26,27,28,28,27, 25,23], rain:[  2,  1,  0,  0,  0,  2, 13, 28, 46, 30,  6,  1] },
  // South America
  VE: { temp:[26,27,28,29,28,27,27,27,27,27, 26,26], rain:[ 23, 12, 15, 33, 85,124,124,119,108, 94, 62, 36] },
  GY: { temp:[26,27,28,28,28,27,27,27,27,27, 27,26], rain:[198,101, 82,105,240,250,256,166,116,135,166,202] },
  SR: { temp:[27,27,28,29,28,27,27,27,27,27, 28,27], rain:[176,136,140,181,275,256,218,112,106,129,166,171] },
  // Caribbean
  JM: { temp:[25,25,26,27,28,29,29,29,29,27, 26,25], rain:[ 28, 24, 24, 39,109,114,107, 99,108, 96, 71, 39] },
  HT: { temp:[24,24,25,26,27,27,27,27,27,26, 25,24], rain:[ 71, 41, 68, 99,186,177, 83,171,244,241,183,103] },
  DO: { temp:[24,24,25,26,27,28,28,28,27,27, 26,24], rain:[ 74, 67, 57, 81,181,161, 97,168,190,189,165,111] },
  TT: { temp:[26,26,26,27,27,27,26,27,27,27, 27,26], rain:[ 64, 32, 36, 46, 74,178,203,215,183,134, 87, 91] },
  BB: { temp:[26,26,26,27,28,28,28,28,28,27, 27,26], rain:[ 66, 38, 43, 37, 69,113,113,128,144,157,136,101] },
  // Central America
  GT: { temp:[17,18,20,21,20,19,19,19,19,18, 17,17], rain:[  8, 10, 10, 28,100,222,182,179,225,166, 38, 11] },
  BZ: { temp:[23,24,26,28,29,29,28,28,28,27, 25,24], rain:[124, 79, 48, 56,100,161,120,177,240,243,195,162] },
  HN: { temp:[22,22,23,24,24,23,22,22,22,22, 22,22], rain:[ 10, 12, 13, 30, 75,125,110,148,191,104, 52, 15] },
  SV: { temp:[24,25,26,27,27,26,26,26,26,25, 24,23], rain:[  5,  5,  8, 31,157,274,278,257,313,215, 57,  8] },
  NI: { temp:[26,27,29,30,30,29,28,28,28,28, 27,26], rain:[  5,  3,  5, 22,143,210,143,177,192,213, 75, 17] },
  CR: { temp:[22,22,23,23,23,22,21,22,22,22, 22,22], rain:[ 13, 10, 14, 40,222,286,239,302,333,282,121, 31] },
  PA: { temp:[26,26,27,27,27,27,27,27,27,26, 26,26], rain:[ 46, 25, 20, 61,152,143,128,138,146,189,229,145] },
  // Pacific: Oceania
  PG: { temp:[28,28,28,27,27,26,26,26,26,27, 28,28], rain:[148,149,162,172,180,187,144,109,111,130,157,162] },
  SB: { temp:[28,28,28,27,27,26,26,26,26,27, 28,28], rain:[267,218,230,264,260,203,163,135,144,161,184,219] },
  VU: { temp:[29,29,28,27,25,23,22,22,23,25, 27,28], rain:[355,303,358,300,193, 92, 69, 78,118,149,147,198] },
  WS: { temp:[28,29,29,28,27,26,26,26,26,27, 27,28], rain:[450,425,396,249,142, 95, 81, 73, 82,151,225,363] },
  TO: { temp:[29,29,29,28,26,24,23,24,25,26, 27,28], rain:[195,174,197,148, 90, 73, 62, 57, 60, 75,119,179] },
  FJ: { temp:[26,26,26,25,23,22,21,21,22,23, 24,25], rain:[318,309,312,179,132, 93, 85, 75, 83, 96,118,222] },
  // ── 43 gap-fill entries ────────────────────────────────────────────────────
  // Europe
  AD: { temp:[ 2, 3, 6,10,14,19,22,22,18,12, 6, 3], rain:[ 55, 50, 50, 70, 75, 55, 40, 50, 65, 75, 80, 60] },
  AM: { temp:[-3,-2, 3, 9,14,19,22,22,18,12, 5, 0], rain:[ 34, 28, 42, 58, 62, 35, 17, 17, 23, 38, 42, 35] },
  AT: { temp:[-1, 1, 5,10,15,19,21,21,17,11, 5, 1], rain:[ 40, 40, 48, 55, 70, 75, 80, 75, 55, 55, 55, 45] },
  AZ: { temp:[ 3, 4, 8,14,19,24,27,26,22,15, 9, 5], rain:[ 25, 24, 30, 30, 30, 20, 10, 10, 25, 35, 35, 30] },
  BE: { temp:[ 3, 4, 7,10,14,17,19,19,16,12, 7, 4], rain:[ 75, 65, 70, 55, 65, 75, 85, 80, 70, 80, 90, 85] },
  CH: { temp:[ 1, 2, 6,10,15,18,21,21,17,11, 5, 2], rain:[ 65, 60, 65, 70, 85, 95, 90, 90, 80, 70, 70, 60] },
  DK: { temp:[ 2, 2, 4, 8,13,16,18,18,15,10, 6, 3], rain:[ 55, 38, 40, 38, 44, 53, 66, 72, 65, 75, 65, 58] },
  EE: { temp:[-5,-5,-2, 4,10,15,17,16,12, 7, 2,-2], rain:[ 43, 35, 35, 35, 40, 55, 75, 75, 70, 70, 68, 55] },
  FI: { temp:[-7,-8,-4, 2, 9,14,17,15,11, 5,-1,-5], rain:[ 40, 30, 30, 35, 40, 50, 60, 65, 60, 65, 65, 50] },
  GE: { temp:[ 2, 3, 7,13,17,22,25,25,21,15, 9, 4], rain:[ 37, 39, 45, 58, 80, 85, 62, 47, 44, 46, 51, 44] },
  HR: { temp:[ 5, 6,10,14,19,23,26,26,22,16,11, 6], rain:[ 65, 55, 55, 55, 68, 65, 55, 55, 65, 90, 95, 75] },
  IE: { temp:[ 5, 5, 7, 9,12,15,17,17,14,11, 8, 6], rain:[85,67,70,55,60,70,70,79,90,95,90,85] },
  LI: { temp:[ 0, 1, 5,10,15,18,21,20,16,11, 5, 1], rain:[ 45, 42, 48, 56, 72, 90, 80, 80, 60, 65, 60, 52] },
  LT: { temp:[-5,-5,-1, 5,11,15,17,16,12, 7, 2,-3], rain:[ 45, 35, 38, 38, 44, 65, 75, 75, 70, 65, 60, 52] },
  LV: { temp:[-5,-5,-2, 4,10,15,17,16,12, 7, 2,-3], rain:[ 42, 35, 36, 35, 43, 62, 75, 72, 65, 67, 62, 48] },
  MC: { temp:[ 9,10,12,15,18,22,25,25,22,18,13,10], rain:[ 75, 55, 50, 55, 42, 28, 10, 18, 50, 90, 90, 75] },
  ME: { temp:[ 5, 6,10,14,19,24,27,27,22,16,11, 7], rain:[ 87, 75, 70, 68, 65, 42, 22, 25, 55, 95,135,125] },
  MK: { temp:[ 1, 3, 8,13,18,22,26,26,21,14, 8, 2], rain:[ 42, 37, 40, 42, 52, 42, 27, 25, 35, 50, 60, 52] },
  NL: { temp:[ 3, 4, 7,10,14,17,19,19,16,12, 7, 4], rain:[ 76, 57, 63, 48, 58, 70, 75, 80, 76, 80, 82, 80] },
  RS: { temp:[ 1, 3, 8,13,18,22,25,25,20,14, 7, 2], rain:[ 45, 42, 42, 52, 65, 75, 52, 45, 45, 48, 52, 52] },
  SE: { temp:[-3,-3, 0, 5,12,16,18,17,13, 7, 2,-2], rain:[ 45, 33, 32, 35, 38, 50, 62, 72, 65, 62, 60, 52] },
  SI: { temp:[ 0, 2, 6,11,16,19,22,22,17,11, 5, 1], rain:[ 79, 75, 82, 96,103, 97, 88, 99,108,118, 97, 92] },
  SK: { temp:[-3,-1, 4,10,15,18,21,21,16,10, 4,-1], rain:[ 37, 37, 40, 42, 55, 70, 72, 65, 45, 42, 45, 42] },
  SM: { temp:[ 4, 5, 9,13,18,22,26,26,21,15, 9, 5], rain:[ 68, 55, 55, 60, 58, 42, 28, 35, 62, 75, 82, 72] },
  UA: { temp:[-3,-2, 3, 9,16,19,22,22,17,10, 4,-1], rain:[ 35, 32, 35, 40, 50, 60, 68, 60, 45, 35, 42, 40] },
  VA: { temp:[ 8,10,13,16,20,25,28,28,24,18,13, 9], rain:[ 73, 62, 57, 57, 45, 22,  8, 21, 58, 92,100, 80] },
  XK: { temp:[-1, 1, 6,11,16,19,23,23,18,12, 6, 1], rain:[ 42, 40, 45, 52, 65, 62, 38, 38, 42, 52, 62, 52] },
  // Caribbean / Atlantic
  AG: { temp:[26,26,27,28,29,30,30,30,30,29,28,27], rain:[ 55, 40, 38, 55, 85,70,  90, 90,130,155,100, 65] },
  BB: { temp:[25,25,26,27,28,28,28,29,29,28,27,26], rain:[ 70, 50, 48, 45, 58, 85, 105,125,160,160,100, 80] },
  BS: { temp:[21,22,24,25,27,28,29,29,28,26,24,22], rain:[ 35, 35, 38, 58,115,160,155,155,175,165, 70, 35] },
  DM: { temp:[25,25,26,27,28,28,28,29,29,28,27,26], rain:[ 80, 70, 65, 80,135,175,215,225,250,215,150, 95] },
  GD: { temp:[25,25,26,27,28,28,28,29,28,27,27,26], rain:[ 65, 45, 52, 65,110,175,200,210,200,185,130, 80] },
  KN: { temp:[24,24,25,26,27,28,28,28,28,27,26,24], rain:[ 55, 45, 48, 55, 75, 80, 85, 90,120,140, 95, 65] },
  LC: { temp:[25,25,26,27,28,28,28,29,28,27,27,26], rain:[ 85, 68, 65, 75,120,175,195,195,195,180,125, 90] },
  VC: { temp:[25,25,26,27,28,28,29,29,28,27,27,26], rain:[ 90, 70, 65, 85,135,185,200,215,200,185,135,100] },
  // South America
  BO: { temp:[21,21,20,19,16,13,13,14,16,18,19,20], rain:[135,107,65,38,10,  4,  3,  5,16,38,68,112] },
  PY: { temp:[27,27,25,21,18,15,15,17,19,22,24,26], rain:[120,120,97,68,70,50, 45, 45,60,78,98,102] },
  UY: { temp:[22,22,20,17,13,10,10,11,13,16,19,21], rain:[ 85, 80, 90, 80, 80, 72, 72, 65,70,80, 82, 80] },
  // Pacific Islands (micro-states)
  FM: { temp:[27,27,27,27,27,27,27,27,27,27,27,27], rain:[280,240,245,305,320,310,295,280,270,295,295,295] },
  KI: { temp:[28,28,28,28,28,28,28,28,28,28,28,28], rain:[280,210,175,115,105,105,105,105,155,175,200,245] },
  MH: { temp:[27,27,28,28,28,28,28,28,28,28,27,27], rain:[105, 95, 95,140,235,290,310,320,305,280,215,140] },
  NR: { temp:[28,28,28,29,29,28,28,28,28,28,28,28], rain:[280,210,135,100, 80, 60, 65, 80,100,140,195,230] },
  PW: { temp:[28,28,28,28,28,28,28,28,28,28,28,28], rain:[285,240,275,305,340,330,315,320,325,345,350,315] },
  TV: { temp:[28,28,28,29,29,29,29,29,28,28,28,28], rain:[310,255,190,165,145,155,145,145,175,215,250,290] },
  ET: { temp:[16,17,19,21,21,20,18,18,18,18,16,15], rain:[ 15, 22, 48, 65, 83,135,270,285,180, 35,  8, 10] },
  MR: { temp:[21,22,26,30,34,36,36,35,34,30,25,21], rain:[  3,  1,  1,  0,  3,  6, 33, 61, 57, 10,  2,  3] },
  TN: { temp:[11,12,14,17,21,26,29,29,25,20,15,12], rain:[ 52, 44, 44, 37, 26, 14,  4,  7, 32, 52, 66, 58] },
};

if(typeof CD_CLIMATE!=="undefined"&&typeof CD_CLIMATE_ADDITIONS!=="undefined")Object.assign(CD_CLIMATE,CD_CLIMATE_ADDITIONS);// Nomadic Almanac: Health Data
// ALTITUDE_DATA (VACCINE_DATA lives in data-detail.js)
// Generated 2026-06-04


const ALTITUDE_DATA = {
  // ── Latin America ─────────────────────────────────────────────────────────
  BO: 3640,   // La Paz (seat of government); Sucre 2810m; Uyuni 3660m
  PE: 3399,   // Cusco (primary tourist destination); Lima is at sea level
  CO: 2625,   // Bogota
  EC: 2850,   // Quito
  MX: 2240,   // Mexico City
  GT: 1500,   // Guatemala City
  CR: 1161,   // San Jose
  HN: 1000,   // Tegucigalpa
  SV: 658,    // San Salvador
  VE: 900,    // Caracas
  AR: 1782,   // Mendoza (primary Andes tourist region); Buenos Aires sea level
  // ── Africa: East & Horn ──────────────────────────────────────────────────
  ET: 2355,   // Addis Ababa
  ER: 2325,   // Asmara
  RW: 1567,   // Kigali
  KE: 1661,   // Nairobi
  UG: 1190,   // Kampala
  BI: 776,    // Bujumbura
  MG: 1276,   // Antananarivo
  LS: 1600,   // Maseru
  ZM: 1280,   // Lusaka
  ZW: 1490,   // Harare
  MW: 1030,   // Lilongwe
  // ── Africa: West & Central ───────────────────────────────────────────────
  CM: 760,    // Yaounde
  // ── Africa: North ────────────────────────────────────────────────────────
  MA: 1750,   // Marrakech (Atlas gateway); Rabat is at sea level
  DZ: 728,    // Algiers (Tell Atlas; Tamanrasset 1400m)
  // ── Middle East ───────────────────────────────────────────────────────────
  YE: 2250,   // Sana'a
  SA: 950,    // Riyadh; Abha (Asir) ~2200m primary tourist altitude
  JO: 775,    // Amman
  // ── Asia: Caucasus ───────────────────────────────────────────────────────
  AM: 990,    // Yerevan
  GE: 490,    // Tbilisi (just under threshold; Kazbegi 1700m is primary tourist destination)
  // ── Asia: Central ────────────────────────────────────────────────────────
  KG: 760,    // Bishkek (Tian Shan peaks 3000-7000m)
  TJ: 800,    // Dushanbe (Pamir Highway primary route > 4000m)
  AF: 1791,   // Kabul
  KZ: 1050,   // Nur-Sultan (Astana)
  // ── Asia: South ─────────────────────────────────────────────────────────
  NP: 1300,   // Kathmandu; trekking areas up to 5000m+
  BT: 2334,   // Thimphu
  // ── Asia: East ──────────────────────────────────────────────────────────
  CN: 3490,   // Lhasa (Tibet; primary high-altitude tourist destination)
  MN: 1350,   // Ulaanbaatar
  // ── Europe ────────────────────────────────────────────────────────────────
  AD: 1023,   // Andorra la Vella
  ES: 650,    // Madrid
  CH: 549,    // Bern (Swiss Alps tourist areas much higher)
  AT: 542,    // Vienna (Alps tourist areas much higher)
  // ── Oceania ───────────────────────────────────────────────────────────────
  PG: 1500,   // Papua New Guinea highlands (primary inland tourist destination)
};

// ─── CD_CANNABIS gap-fill: 63 remaining UN member states ────────────────────
// Sources: HRI Global Drug Policy Index 2024, EMCDDA, individual country legislation
// Traveller perspective: reflects realistic risk to a foreign visitor.
if (typeof CD_CANNABIS !== 'undefined') Object.assign(CD_CANNABIS, {
  // ── Tier 1: Medical/Decrim: personal possession formally or effectively tolerated ──
  AG:1,   // Antigua & Barbuda: decriminalised personal possession 2018
  DM:1,   // Dominica: Drugs (Prevention of Misuse) (Amendment) Act 2023: up to 28g decrim
  GD:1,   // Grenada: Cannabis (Amendment) Act 2019: up to 14g decriminalised
  KN:1,   // St Kitts & Nevis: decriminalised 2023 (up to 14g)
  LC:1,   // Saint Lucia: Misuse of Drugs (Amendment) Act 2022: personal amounts decrim
  LS:1,   // Lesotho: first African country to license medicinal cultivation (2017); personal rarely prosecuted
  MW:1,   // Malawi: Cannabis Regulation Act 2020: licensed production; personal use decriminalised
  VC:1,   // St Vincent & the Grenadines: decriminalised 2018; medical scheme active
  VE:1,   // Venezuela: Supreme Court (TSJ) ruled personal consumption not punishable

  // ── Tier 2: Minor penalties: technically illegal; small amounts = fine / caution ──
  AD:2,   // Andorra: follows broadly European norms; possession = administrative fine
  AO:2,   // Angola: illegal; police rarely enforce for personal amounts
  BI:2,   // Burundi: illegal; enforcement minimal outside Bujumbura
  BJ:2,   // Benin: illegal; minor fine in practice
  BS:2,   // Bahamas: illegal; tourists typically receive fine for minor possession
  BW:2,   // Botswana: Drugs and Related Substances Act: fine or short sentence, rarely applied
  CD:2,   // DR Congo: illegal; enforcement highly irregular
  CF:2,   // Central African Republic: illegal; state capacity limits enforcement
  CG:2,   // Republic of Congo: illegal; minor penalties in practice
  CI:2,   // Côte d'Ivoire: illegal; minor fine common
  CM:2,   // Cameroon: illegal; minor possession = fine; widespread use in rural north
  CV:2,   // Cape Verde: illegal; minor penalty; significant transit country
  FJ:2,   // Fiji: Illicit Drugs Control Act: possession = fine; enforcement inconsistent
  FM:2,   // Micronesia: illegal; enforcement extremely limited
  GA:2,   // Gabon: illegal; minor penalties; traditional use tolerated outside Libreville
  GN:2,   // Guinea: illegal; enforcement minimal; widespread rural cultivation
  GQ:2,   // Equatorial Guinea: illegal; minor enforcement
  GW:2,   // Guinea-Bissau: major transit country; personal possession rarely prosecuted
  IS:2,   // Iceland: illegal; possession = fine (no criminal record for small amounts)
  KG:2,   // Kyrgyzstan: illegal; traditionally grown; enforcement inconsistent
  KI:2,   // Kiribati: illegal; minimal enforcement capacity
  LI:2,   // Liechtenstein: aligned with Swiss law; possession ≤10g = fine; no criminal record
  LR:2,   // Liberia: illegal; enforcement minimal
  MC:2,   // Monaco: French law applies; possession = fine
  MG:2,   // Madagascar: illegal; widely cultivated; enforcement inconsistent
  MH:2,   // Marshall Islands: illegal; minimal enforcement
  NA:2,   // Namibia: illegal; personal amounts = fine; rarely prosecuted
  NR:2,   // Nauru: illegal; minimal enforcement capacity
  PG:2,   // Papua New Guinea: illegal; traditional betel use dominant; cannabis enforcement minimal
  PW:2,   // Palau: illegal; minor enforcement
  SB:2,   // Solomon Islands: illegal; minimal enforcement
  SL:2,   // Sierra Leone: illegal; enforcement minimal
  SM:2,   // San Marino: Italian-aligned; minor administrative fine
  ST:2,   // São Tomé and Príncipe: illegal; minimal enforcement
  SZ:2,   // Eswatini: significant cannabis producer; possession illegal but rarely enforced
  TG:2,   // Togo: illegal; minor fine
  TL:2,   // Timor-Leste: illegal; enforcement very limited
  TO:2,   // Tonga: illegal; enforcement minimal
  TV:2,   // Tuvalu: illegal; minimal enforcement capacity
  VU:2,   // Vanuatu: illegal; traditional kava culture dominant; cannabis minor penalties
  WS:2,   // Samoa: illegal; minor penalties
  XK:2,   // Kosovo: aligned broadly with Balkans; minor fine
  ZM:2,   // Zambia: Cannabis Licensing Act 2021 allows export; personal possession still illegal but rarely enforced
  ZW:2,   // Zimbabwe: licensed cultivation for export (2018); possession still illegal

  // ── Tier 3: Severe penalties: significant prison time; foreigners regularly prosecuted ──
  DJ:3,   // Djibouti: up to 10 years for possession; strictly enforced
  GM:3,   // Gambia: Islamic penal influences; up to 5 years; foreigners prosecuted
  KM:3,   // Comoros: Islamic law; strict prosecution; significant sentences
  MU:3,   // Mauritius: Dangerous Drugs Act: up to 5 years for possession; strictly enforced; foreigners targeted
  PS:3,   // Palestine: illegal in both PA and Hamas-controlled areas; strict Hamas enforcement in Gaza
  SC:3,   // Seychelles: Misuse of Drugs Act: up to 10 years; regularly enforced against tourists
  SN:3,   // Senegal: mandatory 2+ years for first offence; widespread arrests; tourists prosecuted
  TJ:3,   // Tajikistan: Criminal Code: 5-12 years for possession; strict enforcement
  TM:3,   // Turkmenistan: among world's strictest drug laws; long sentences for any amount
  TW:3,   // Taiwan: Narcotics Hazard Prevention Act: 3-7 years possession; zero tolerance enforcement
});

// AUTO-GENERATED city additions: review before integrating

// ── Country capitals (ISO-2 → capital city name) ───────────────────────────
// Drives the zoom-tiered city reveal: at the first zoom step only the city whose
// name matches its country's capital here is shown. Names match the CITIES data
// (de-facto/most-recognised seat of government where it differs from the city set).
const COUNTRY_CAPITALS = {
  AF:'Kabul', AL:'Tirana', DZ:'Algiers', AO:'Luanda', AR:'Buenos Aires', AM:'Yerevan',
  AU:'Canberra', AT:'Vienna', AZ:'Baku', BS:'Nassau', BH:'Manama', BD:'Dhaka',
  BY:'Minsk', BE:'Brussels', BZ:'Belmopan', BJ:'Porto-Novo', BT:'Thimphu', BO:'La Paz',
  BA:'Sarajevo', BW:'Gaborone', BR:'Brasilia', BN:'Bandar Seri Begawan', BG:'Sofia',
  BF:'Ouagadougou', BI:'Gitega', KH:'Phnom Penh', CM:'Yaounde', CA:'Ottawa', CV:'Praia',
  TD:"N'Djamena", CL:'Santiago', CN:'Beijing', CO:'Bogota', CG:'Brazzaville',
  CD:'Kinshasa', CR:'San Jose', CI:'Yamoussoukro', HR:'Zagreb', CU:'Havana', CY:'Nicosia',
  CZ:'Prague', DK:'Copenhagen', DJ:'Djibouti', DO:'Santo Domingo', EC:'Quito', EG:'Cairo',
  SV:'San Salvador', GQ:'Malabo', ER:'Asmara', EE:'Tallinn', SZ:'Mbabane', ET:'Addis Ababa',
  FJ:'Suva', FI:'Helsinki', FR:'Paris', GA:'Libreville', GM:'Banjul', GE:'Tbilisi',
  DE:'Berlin', GH:'Accra', GR:'Athens', GT:'Guatemala City', GN:'Conakry', GW:'Bissau',
  GY:'Georgetown', HT:'Port-au-Prince', HN:'Tegucigalpa', HU:'Budapest', IS:'Reykjavik',
  IN:'New Delhi', ID:'Jakarta', IR:'Tehran', IQ:'Baghdad', IE:'Dublin', IL:'Jerusalem',
  IT:'Rome', JM:'Kingston', JP:'Tokyo', JO:'Amman', KZ:'Astana', KE:'Nairobi',
  KP:'Pyongyang', KR:'Seoul', KW:'Kuwait City', KG:'Bishkek', LA:'Vientiane', LV:'Riga',
  LB:'Beirut', LS:'Maseru', LR:'Monrovia', LY:'Tripoli', LT:'Vilnius', LU:'Luxembourg City',
  MG:'Antananarivo', MW:'Lilongwe', MY:'Kuala Lumpur', MV:'Male', ML:'Bamako', MT:'Valletta',
  MR:'Nouakchott', MU:'Port Louis', MX:'Mexico City', MD:'Chisinau', MC:'Monaco',
  MN:'Ulaanbaatar', ME:'Podgorica', MA:'Rabat', MZ:'Maputo', MM:'Naypyidaw', NA:'Windhoek',
  NP:'Kathmandu', NL:'Amsterdam', NZ:'Wellington', NI:'Managua', NE:'Niamey', NG:'Abuja',
  MK:'Skopje', NO:'Oslo', OM:'Muscat', PK:'Islamabad', PA:'Panama City', PG:'Port Moresby',
  PY:'Asuncion', PE:'Lima', PH:'Manila', PL:'Warsaw', PT:'Lisbon', QA:'Doha',
  RO:'Bucharest', RU:'Moscow', RW:'Kigali', SA:'Riyadh', SN:'Dakar', RS:'Belgrade',
  SC:'Victoria', SL:'Freetown', SG:'Singapore', SK:'Bratislava', SI:'Ljubljana',
  SO:'Mogadishu', ZA:'Pretoria', SS:'Juba', ES:'Madrid', LK:'Colombo', SD:'Khartoum',
  SR:'Paramaribo', SE:'Stockholm', CH:'Bern', SY:'Damascus', TW:'Taipei', TJ:'Dushanbe',
  TZ:'Dodoma', TH:'Bangkok', TL:'Dili', TG:'Lome', TT:'Port of Spain', TN:'Tunis',
  TR:'Ankara', TM:'Ashgabat', UG:'Kampala', UA:'Kyiv', AE:'Abu Dhabi', GB:'London',
  US:'Washington', UY:'Montevideo', UZ:'Tashkent', VE:'Caracas', VN:'Hanoi', YE:'Sanaa',
  ZM:'Lusaka', ZW:'Harare',
};





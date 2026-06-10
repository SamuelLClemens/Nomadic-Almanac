// Nomadic Almanac — data-detail.js
// Heavy prose tables split out of data.js so the first paint does not pay for
// them (VACCINE_DATA, TIPPING_DETAIL_DATA, COUNTRY_FACTS, PHRASES_BY_LANG,
// COUNTRY_INTEL, COUNTRY_EXTRA). Loaded with `defer` from index.html (pure
// literals — no data.js helper calls — but defer keeps the execution order
// deterministic); every consumer in app.js typeof-guards these tables, so the
// app boots and the map is fully interactive before this file executes.

const VACCINE_DATA = {
  // Countries where Yellow Fever vaccination is required for entry (or endemic)
  YF_ENDEMIC: ['AO','BJ','BF','BI','CM','CF','TD','CG','CD','CI','GQ','ET','GA','GH','GN','GW','KE','LR','ML','MR','MZ','NE','NG','RW','SN','SL','SS','SD','TZ','TG','UG','ZM'],

  BY_COUNTRY: {
    // ── Africa ───────────────────────────────────────────────────────────────
    AO: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Meningitis ACWY'],
      malaria: 'high',
      notes: 'Yellow Fever certificate required for all travellers.'
    },
    BJ: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Meningitis ACWY'],
      malaria: 'high',
      notes: null
    },
    BF: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Meningitis ACWY'],
      malaria: 'high',
      notes: null
    },
    BI: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: null
    },
    CM: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Meningitis ACWY'],
      malaria: 'high',
      notes: null
    },
    CF: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Meningitis ACWY'],
      malaria: 'high',
      notes: null
    },
    TD: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Meningitis ACWY'],
      malaria: 'high',
      notes: null
    },
    CG: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: null
    },
    CD: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Meningitis ACWY'],
      malaria: 'high',
      notes: 'DRC has one of the highest malaria burdens globally.'
    },
    CI: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: null
    },
    GQ: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: null
    },
    ET: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Meningitis ACWY'],
      malaria: 'moderate',
      notes: 'Malaria risk low at altitude (Addis Ababa > 2000m). Yellow Fever certificate required if arriving from endemic country.'
    },
    GA: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'high',
      notes: null
    },
    GH: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: null
    },
    GN: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Meningitis ACWY'],
      malaria: 'high',
      notes: null
    },
    GW: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: null
    },
    KE: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Meningitis ACWY'],
      malaria: 'moderate',
      notes: 'Yellow Fever certificate required if arriving from endemic country. Malaria risk lower in Nairobi highlands.'
    },
    LR: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: null
    },
    ML: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Meningitis ACWY','Rabies'],
      malaria: 'high',
      notes: null
    },
    MR: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Meningitis ACWY','Rabies'],
      malaria: 'moderate',
      notes: null
    },
    MZ: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: 'Yellow Fever certificate required if arriving from endemic country.'
    },
    NE: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Meningitis ACWY','Rabies'],
      malaria: 'high',
      notes: null
    },
    NG: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Meningitis ACWY','Rabies'],
      malaria: 'high',
      notes: null
    },
    RW: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'moderate',
      notes: null
    },
    SN: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Meningitis ACWY','Rabies'],
      malaria: 'high',
      notes: 'Yellow Fever certificate required if arriving from endemic country.'
    },
    SL: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: null
    },
    SS: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Meningitis ACWY','Rabies'],
      malaria: 'high',
      notes: null
    },
    SD: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Meningitis ACWY','Rabies'],
      malaria: 'high',
      notes: 'Yellow Fever certificate required if arriving from endemic country.'
    },
    TZ: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'high',
      notes: 'Yellow Fever certificate required if arriving from endemic country. Kilimanjaro altitude sickness risk.'
    },
    TG: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Meningitis ACWY'],
      malaria: 'high',
      notes: null
    },
    UG: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Meningitis ACWY'],
      malaria: 'high',
      notes: null
    },
    ZM: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: 'Yellow Fever certificate required if arriving from endemic country.'
    },
    DZ: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: null
    },
    EG: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'low',
      notes: 'Malaria risk confined to El Faiyum area.'
    },
    LY: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    MA: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: null
    },
    TN: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    ZA: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'low',
      notes: 'Malaria risk in Limpopo, Mpumalanga, and KwaZulu-Natal border areas.'
    },
    BW: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'moderate',
      notes: 'Malaria risk in northern regions (Okavango, Chobe).'
    },
    NA: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'moderate',
      notes: 'Malaria risk in northern Namibia (Caprivi Strip, Kavango).'
    },
    ZW: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'moderate',
      notes: 'Yellow Fever certificate required if arriving from endemic country.'
    },
    MW: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: null
    },
    MG: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: null
    },
    SZ: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'low',
      notes: null
    },
    LS: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    SO: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Meningitis ACWY'],
      malaria: 'high',
      notes: null
    },
    DJ: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'moderate',
      notes: null
    },
    ER: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Meningitis ACWY'],
      malaria: 'moderate',
      notes: null
    },
    SC: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    MU: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    CV: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'low',
      notes: 'Dengue (Dengvaxia) not indicated; risk present for individual travellers.'
    },
    ST: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'moderate',
      notes: null
    },
    KM: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'moderate',
      notes: null
    },
    // ── Asia — Southeast ─────────────────────────────────────────────────────
    TH: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Japanese Encephalitis'],
      malaria: 'low',
      notes: 'Malaria mainly in forested border regions. Dengue prevalent nationwide.'
    },
    VN: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Japanese Encephalitis'],
      malaria: 'low',
      notes: 'Malaria risk in remote highland areas. Dengue prevalent.'
    },
    KH: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Japanese Encephalitis'],
      malaria: 'moderate',
      notes: 'Malaria mainly in forested western and northern provinces.'
    },
    LA: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Japanese Encephalitis'],
      malaria: 'moderate',
      notes: null
    },
    MM: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Japanese Encephalitis'],
      malaria: 'moderate',
      notes: 'Malaria risk in rural and forested areas.'
    },
    MY: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Japanese Encephalitis'],
      malaria: 'low',
      notes: 'Malaria risk in forested areas of Borneo (Sabah, Sarawak). Dengue prevalent.'
    },
    SG: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: 'Periodic dengue outbreaks.'
    },
    ID: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Japanese Encephalitis'],
      malaria: 'moderate',
      notes: 'Malaria risk outside Java and Bali. Dengue prevalent. No malaria risk in major tourist destinations on Java and Bali.'
    },
    PH: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Japanese Encephalitis'],
      malaria: 'low',
      notes: 'Malaria risk in Palawan and parts of Mindanao. Dengue prevalent.'
    },
    TL: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'moderate',
      notes: null
    },
    BN: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    // ── Asia — South ─────────────────────────────────────────────────────────
    IN: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Japanese Encephalitis'],
      malaria: 'moderate',
      notes: 'Japanese Encephalitis risk in rural areas. Dengue prevalent. Malaria varies significantly by region.'
    },
    NP: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Japanese Encephalitis'],
      malaria: 'low',
      notes: 'Malaria in Terai lowlands. Altitude sickness is a major risk for trekkers above 2500m.'
    },
    LK: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Japanese Encephalitis'],
      malaria: 'low',
      notes: 'Dengue prevalent. Malaria risk in northern and eastern rural areas.'
    },
    BD: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Japanese Encephalitis'],
      malaria: 'moderate',
      notes: 'Malaria risk in Chittagong Hill Tracts. Dengue prevalent.'
    },
    PK: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Polio booster'],
      malaria: 'moderate',
      notes: 'Polio-endemic country — booster required for long-stay travellers per WHO guidance.'
    },
    AF: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Meningitis ACWY','Polio booster'],
      malaria: 'moderate',
      notes: 'Polio-endemic country.'
    },
    MV: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: 'Dengue risk present.'
    },
    BT: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Japanese Encephalitis'],
      malaria: 'low',
      notes: 'Malaria risk in southern lowland areas.'
    },
    // ── Asia — East ──────────────────────────────────────────────────────────
    CN: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies','Japanese Encephalitis'],
      malaria: 'low',
      notes: 'Malaria risk in Yunnan and Hainan. Japanese Encephalitis risk in rural areas. Altitude sickness risk on Tibetan Plateau.'
    },
    JP: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Japanese Encephalitis'],
      malaria: 'none',
      notes: 'Japanese Encephalitis risk mainly in rural areas during summer months.'
    },
    KR: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Japanese Encephalitis'],
      malaria: 'low',
      notes: 'Malaria risk in northern border regions.'
    },
    KP: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'low',
      notes: null
    },
    MN: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: null
    },
    TW: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Japanese Encephalitis'],
      malaria: 'none',
      notes: 'Dengue risk in southern Taiwan.'
    },
    // ── Asia — Central ───────────────────────────────────────────────────────
    KZ: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: null
    },
    UZ: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'low',
      notes: null
    },
    TM: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: null
    },
    KG: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'low',
      notes: null
    },
    TJ: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'moderate',
      notes: null
    },
    // ── Middle East ──────────────────────────────────────────────────────────
    SA: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Meningitis ACWY'],
      malaria: 'low',
      notes: 'Meningitis ACWY required for Hajj and Umrah pilgrims. Malaria risk in south-western Asir province.'
    },
    AE: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    JO: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    IL: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    IQ: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'low',
      notes: null
    },
    IR: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'low',
      notes: 'Malaria risk in south-eastern provinces (Sistan va Baluchestan, Hormozgan).'
    },
    YE: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'high',
      notes: 'Active cholera outbreak ongoing. Malaria prevalent nationwide.'
    },
    OM: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'low',
      notes: 'Malaria risk in Musandam and parts of southern provinces.'
    },
    QA: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    KW: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B'],
      malaria: 'none',
      notes: null
    },
    BH: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B'],
      malaria: 'none',
      notes: null
    },
    SY: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: null
    },
    LB: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    // ── Europe / Caucasus ────────────────────────────────────────────────────
    TR: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: 'Malaria historically present in southern plains; currently negligible.'
    },
    GE: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: null
    },
    AM: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: null
    },
    AZ: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'low',
      notes: 'Malaria risk in rural lowland areas near the Azerbaijani-Armenian border.'
    },
    UA: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: null
    },
    BY: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Rabies'],
      malaria: 'none',
      notes: null
    },
    MD: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: null
    },
    RS: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Rabies'],
      malaria: 'none',
      notes: null
    },
    BA: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Rabies'],
      malaria: 'none',
      notes: null
    },
    AL: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: null
    },
    MK: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Rabies'],
      malaria: 'none',
      notes: null
    },
    ME: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Rabies'],
      malaria: 'none',
      notes: null
    },
    XK: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Rabies'],
      malaria: 'none',
      notes: null
    },
    RU: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'none',
      notes: 'Tick-borne encephalitis risk in forested areas of Siberia and the Urals; consider vaccination.'
    },
    // ── Americas — Latin America ──────────────────────────────────────────────
    MX: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'low',
      notes: 'Malaria risk in rural Chiapas, Oaxaca, Guerrero, Sinaloa. Dengue prevalent in coastal areas.'
    },
    GT: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'moderate',
      notes: 'Dengue prevalent. Malaria mainly in rural lowlands.'
    },
    BZ: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'low',
      notes: null
    },
    HN: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'moderate',
      notes: 'Dengue prevalent.'
    },
    SV: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'low',
      notes: 'Dengue prevalent.'
    },
    NI: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'moderate',
      notes: null
    },
    CR: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'low',
      notes: 'Dengue risk. Malaria in Caribbean lowlands.'
    },
    PA: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'moderate',
      notes: 'Malaria risk in Darien, San Blas, Bocas del Toro. Dengue prevalent.'
    },
    CO: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'moderate',
      notes: 'Yellow Fever recommended for jungle areas east of the Andes. Dengue prevalent. Malaria in Pacific and Amazon lowlands.'
    },
    VE: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'moderate',
      notes: 'Malaria risk in Bolivar and Amazonas states. Dengue prevalent.'
    },
    GY: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'high',
      notes: null
    },
    SR: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'high',
      notes: null
    },
    GF: {
      required: ['Yellow Fever'],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'high',
      notes: 'French Guiana — Yellow Fever required for entry.'
    },
    BR: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'moderate',
      notes: 'Yellow Fever recommended for Amazon Basin and centre-west states. Malaria in Amazon region. Dengue prevalent nationwide.'
    },
    EC: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'low',
      notes: 'Yellow Fever recommended for jungle areas. Malaria in coastal and Amazon lowlands. Altitude risk in Quito and Andes.'
    },
    PE: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'moderate',
      notes: 'Yellow Fever recommended for Amazon jungle areas. Malaria in Loreto region. Altitude sickness significant in Cusco and Machu Picchu.'
    },
    BO: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'moderate',
      notes: 'Malaria in lowland Amazon and Beni areas. Altitude sickness critical — La Paz 3640m, Uyuni salt flats ~3656m.'
    },
    PY: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'low',
      notes: 'Dengue prevalent.'
    },
    UY: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    AR: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'low',
      notes: 'Malaria risk in northern border provinces (Salta, Jujuy). Dengue in north-eastern provinces.'
    },
    CL: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    CU: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: 'Dengue risk present.'
    },
    DO: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'moderate',
      notes: 'Malaria (Plasmodium falciparum) present on Hispaniola. Dengue prevalent.'
    },
    HT: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies'],
      malaria: 'moderate',
      notes: null
    },
    JM: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: 'Dengue risk.'
    },
    TT: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: 'Dengue risk.'
    },
    BB: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    // ── Oceania ───────────────────────────────────────────────────────────────
    PG: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Cholera','Rabies','Japanese Encephalitis'],
      malaria: 'high',
      notes: 'One of the highest malaria burdens in Oceania. Yellow Fever certificate required if arriving from endemic country.'
    },
    FJ: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: 'Dengue risk. Typhoid risk in rural areas.'
    },
    SB: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'],
      malaria: 'high',
      notes: null
    },
    VU: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'moderate',
      notes: null
    },
    WS: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    TO: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    PW: {
      required: [],
      recommended: ['Hepatitis A','Hepatitis B','Typhoid'],
      malaria: 'none',
      notes: null
    },
    // ── Gap-fill: 25 European + island nations ─────────────────────────────
    AG: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: null },
    BG: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid','Rabies'], malaria: 'none', notes: null },
    BS: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: null },
    CY: { required: [], recommended: ['Hepatitis A','Hepatitis B'], malaria: 'none', notes: null },
    DM: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: null },
    EE: { required: [], recommended: ['Hepatitis A','Hepatitis B','Tick-borne Encephalitis'], malaria: 'none', notes: null },
    FM: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: null },
    GD: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: null },
    GM: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid','Meningococcal'], malaria: 'regional', notes: 'Yellow fever certificate required if arriving from endemic country' },
    HR: { required: [], recommended: ['Hepatitis A','Hepatitis B','Tick-borne Encephalitis'], malaria: 'none', notes: null },
    IS: { required: [], recommended: ['Hepatitis A','Hepatitis B'], malaria: 'none', notes: null },
    KI: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: null },
    KN: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: null },
    LC: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: null },
    LI: { required: [], recommended: ['Hepatitis A','Hepatitis B'], malaria: 'none', notes: null },
    LT: { required: [], recommended: ['Hepatitis A','Hepatitis B','Tick-borne Encephalitis'], malaria: 'none', notes: null },
    LU: { required: [], recommended: ['Hepatitis A','Hepatitis B'], malaria: 'none', notes: null },
    LV: { required: [], recommended: ['Hepatitis A','Hepatitis B','Tick-borne Encephalitis'], malaria: 'none', notes: null },
    MC: { required: [], recommended: ['Hepatitis A','Hepatitis B'], malaria: 'none', notes: null },
    MH: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: null },
    MT: { required: [], recommended: ['Hepatitis A','Hepatitis B'], malaria: 'none', notes: null },
    NR: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: null },
    PS: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: 'Entry conditions depend on crossing point; confirm current requirements' },
    SI: { required: [], recommended: ['Hepatitis A','Hepatitis B','Tick-borne Encephalitis'], malaria: 'none', notes: null },
    SK: { required: [], recommended: ['Hepatitis A','Hepatitis B','Tick-borne Encephalitis'], malaria: 'none', notes: null },
    SM: { required: [], recommended: ['Hepatitis A','Hepatitis B'], malaria: 'none', notes: null },
    TV: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: null },
    VA: { required: [], recommended: ['Hepatitis A','Hepatitis B'], malaria: 'none', notes: null },
    VC: { required: [], recommended: ['Hepatitis A','Hepatitis B','Typhoid'], malaria: 'none', notes: null },
  }
};

const TIPPING_DETAIL_DATA = {
  US: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '18-20%', cash: false, note: 'Expected at sit-down restaurants; 15% minimum considered poor' },
      cafe:         { tip: '10-15%', cash: false, note: 'Tip jars common at counters; optional but appreciated' },
      bar:          { tip: '$1-2/drink', cash: false, note: 'Per drink or 15-20% on tab; bartenders rely on tips' },
      taxi:         { tip: '15-20%', cash: true, note: 'Also applies to rideshare; prompts on screen are common' },
      hotel_porter: { tip: '$2-3/bag', cash: true, note: 'Hand directly; $5 minimum for short stays' },
      housekeeping: { tip: '$3-5/night', cash: true, note: 'Leave daily with note; staff often changes day to day' },
      spa:          { tip: '15-20%', cash: false, note: 'Standard for all spa and salon services' },
      haircut:      { tip: '15-20%', cash: false, note: 'Tip stylist directly; separate tip for shampoo staff' },
      tour_guide:   { tip: '$10-20/day', cash: true, note: 'Per person per day; more for exceptional service' },
      delivery:     { tip: '15-20%', cash: false, note: 'App prompts standard; delivery workers depend on tips' },
    },
    quickTip: 'Tipping is mandatory in culture; 20% at restaurants is the baseline expectation.'
  },
  CA: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '15-20%', cash: false, note: 'Pre-tax or post-tax; POS terminals default to 18-20%' },
      cafe:         { tip: '10-15%', cash: false, note: 'Counter service tips increasingly expected' },
      bar:          { tip: '15%', cash: false, note: 'Per round or on tab; similar to restaurant norms' },
      taxi:         { tip: '10-15%', cash: true, note: 'Rideshare tips also expected; less pressure than US' },
      hotel_porter: { tip: '$2/bag', cash: true, note: 'Standard; slightly lower expectation than US' },
      housekeeping: { tip: '$2-3/night', cash: true, note: 'Less common than US but appreciated' },
      spa:          { tip: '15%', cash: false, note: 'Standard across provinces' },
      haircut:      { tip: '15%', cash: false, note: 'Consistent with restaurant norms' },
      tour_guide:   { tip: '$10-15/day', cash: true, note: 'Per person; common in tourism-heavy areas' },
      delivery:     { tip: '10-15%', cash: false, note: 'App-based tipping standard' },
    },
    quickTip: 'Tipping culture mirrors the US; 15-18% at restaurants is the accepted baseline.'
  },
  GB: {
    serviceCharge: true,
    scNote: 'Optional 12.5% service charge often added; legally you may remove it',
    industries: {
      restaurant:   { tip: '10-12.5%', cash: false, note: 'Service charge often included; check bill before tipping extra' },
      cafe:         { tip: 'none', cash: false, note: 'Tipping at cafes is rare and never expected' },
      bar:          { tip: 'none', cash: true, note: 'Buying bartender a drink is traditional over cash tip' },
      taxi:         { tip: 'round up', cash: true, note: 'Round to nearest pound; 10% for helpful drivers' },
      hotel_porter: { tip: '£1-2/bag', cash: true, note: 'Modest tip expected at upscale hotels' },
      housekeeping: { tip: '£1-2/night', cash: true, note: 'Less common than in North America' },
      spa:          { tip: '10%', cash: false, note: 'Appreciated but not mandatory' },
      haircut:      { tip: '10%', cash: false, note: 'Common but not obligatory' },
      tour_guide:   { tip: '£5-10/day', cash: true, note: 'Per person for guided tours' },
      delivery:     { tip: 'none', cash: false, note: 'Not culturally embedded; app prompts exist but rarely used' },
    },
    quickTip: 'Check if service charge is already on the bill before adding any extra tip.'
  },
  IE: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10-15%', cash: false, note: 'Appreciated but less pressured than North America' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected at cafes or coffee shops' },
      bar:          { tip: 'none', cash: true, note: 'Offering to buy a round is the local custom' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up or add €1-2; not mandatory' },
      hotel_porter: { tip: '€1-2/bag', cash: true, note: 'Appreciated at upscale properties' },
      housekeeping: { tip: '€1-2/night', cash: true, note: 'Optional; less expected than in US' },
      spa:          { tip: '10%', cash: false, note: 'Appreciated for good service' },
      haircut:      { tip: '10%', cash: false, note: 'Common at upscale salons' },
      tour_guide:   { tip: '€5-10/day', cash: true, note: 'Standard for guided experiences' },
      delivery:     { tip: 'none', cash: false, note: 'Not widely practiced' },
    },
    quickTip: 'Tipping is appreciated but relaxed; 10-15% at restaurants is generous and sufficient.'
  },
  AU: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: false, note: 'Not expected; staff earn minimum wage. Tip for standout service only' },
      cafe:         { tip: 'none', cash: false, note: 'Virtually never expected; tap-and-go screens may prompt' },
      bar:          { tip: 'none', cash: false, note: 'Tipping at bars is rare; not part of culture' },
      taxi:         { tip: 'round up', cash: true, note: 'Rounding up is polite; not obligatory' },
      hotel_porter: { tip: 'none', cash: true, note: 'Not expected; small tip for exceptional service OK' },
      housekeeping: { tip: 'none', cash: true, note: 'Not customary; workers paid award wages' },
      spa:          { tip: 'none', cash: false, note: 'Not expected; leave a positive review instead' },
      haircut:      { tip: 'none', cash: false, note: 'Not customary in Australia' },
      tour_guide:   { tip: 'none', cash: true, note: 'Not expected; appreciated for exceptional guides' },
      delivery:     { tip: 'none', cash: false, note: 'Not customary; platforms may prompt but rarely used' },
    },
    quickTip: 'Tipping is not expected in Australia; workers receive regulated minimum wages.'
  },
  NZ: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: 'none', cash: false, note: 'Not expected; staff paid living wage. Tip if truly impressed' },
      cafe:         { tip: 'none', cash: false, note: 'Counter tip jars exist but deposit is entirely optional' },
      bar:          { tip: 'none', cash: false, note: 'Not part of New Zealand bar culture' },
      taxi:         { tip: 'round up', cash: true, note: 'Optional; rounding up is a polite gesture' },
      hotel_porter: { tip: 'none', cash: true, note: 'Not expected; appreciated at luxury properties' },
      housekeeping: { tip: 'none', cash: true, note: 'Not customary' },
      spa:          { tip: 'none', cash: false, note: 'Not expected' },
      haircut:      { tip: 'none', cash: false, note: 'Not customary' },
      tour_guide:   { tip: 'none', cash: true, note: 'Appreciated for excellent experience but not obligatory' },
      delivery:     { tip: 'none', cash: false, note: 'Not culturally practiced' },
    },
    quickTip: 'Tipping is not expected; New Zealand has strong wage protections for service workers.'
  },
  DE: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '5-10%', cash: true, note: 'Round up or say desired amount when paying; never leave on table' },
      cafe:         { tip: 'round up', cash: true, note: 'Round to nearest euro; not mandatory' },
      bar:          { tip: 'round up', cash: true, note: 'Leave small change or round up; tipping not heavy' },
      taxi:         { tip: 'round up', cash: true, note: 'Round to nearest euro; 5-10% for longer rides' },
      hotel_porter: { tip: '€1-2/bag', cash: true, note: 'Standard at mid-range and luxury hotels' },
      housekeeping: { tip: '€1-2/night', cash: true, note: 'Leave daily with note' },
      spa:          { tip: '5-10%', cash: true, note: 'Cash preferred; tip handed directly to therapist' },
      haircut:      { tip: '5-10%', cash: true, note: 'Round up or add a few euros; give directly' },
      tour_guide:   { tip: '€5-10/day', cash: true, note: 'Per person for guided tours' },
      delivery:     { tip: '€1-2', cash: false, note: 'Small tip appreciated; app-based tipping common' },
    },
    quickTip: 'Tell the server the total you want to pay (including tip) rather than leaving change on the table.'
  },
  FR: {
    serviceCharge: true,
    scNote: 'Service compris (15%) is legally included in all restaurant prices',
    industries: {
      restaurant:   { tip: 'none', cash: true, note: 'Service is included by law; extra tip optional for good service' },
      cafe:         { tip: 'none', cash: true, note: 'Leave small coins if you wish; never expected' },
      bar:          { tip: 'none', cash: true, note: 'Not customary; leave coins at most' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up to nearest euro; 5-10% for helpful drivers' },
      hotel_porter: { tip: '€1-2/bag', cash: true, note: 'Standard at hotels; give directly' },
      housekeeping: { tip: '€1-2/night', cash: true, note: 'Leave at end of stay with note' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated at upscale spas' },
      haircut:      { tip: '5-10%', cash: true, note: 'Common at salons; given directly to stylist' },
      tour_guide:   { tip: '€5-10/day', cash: true, note: 'Per person; appreciated for quality guides' },
      delivery:     { tip: 'none', cash: false, note: 'Not widely expected' },
    },
    quickTip: 'Service is legally included in prices; any extra tip is a genuine bonus, not an obligation.'
  },
  IT: {
    serviceCharge: true,
    scNote: 'Coperto (cover charge) of €1-3 per person is standard; separate from service tip',
    industries: {
      restaurant:   { tip: 'none', cash: true, note: 'Coperto covers service; extra tip optional and appreciated' },
      cafe:         { tip: 'none', cash: true, note: 'Leave small coins on counter; espresso bars rarely tipped' },
      bar:          { tip: 'none', cash: true, note: 'Not customary; leave coins if you like' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up to nearest euro; not obligatory' },
      hotel_porter: { tip: '€1-2/bag', cash: true, note: 'Standard at three-star and above' },
      housekeeping: { tip: '€1-2/night', cash: true, note: 'Leave at end of stay' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated at resort and hotel spas' },
      haircut:      { tip: '5-10%', cash: true, note: 'Small tip appreciated; not mandatory' },
      tour_guide:   { tip: '€5-10/day', cash: true, note: 'Per person; very common for licensed guides' },
      delivery:     { tip: 'none', cash: false, note: 'Not customary' },
    },
    quickTip: 'The coperto cover charge is mandatory; an additional tip is a genuine sign of appreciation.'
  },
  ES: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '5-10%', cash: true, note: 'Not obligatory; leaving coins is fine. No guilt for not tipping' },
      cafe:         { tip: 'none', cash: true, note: 'Leave small change if you wish; not expected' },
      bar:          { tip: 'none', cash: true, note: 'Leave coins; tapas culture means small tabs anyway' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; 5-10% for longer journeys' },
      hotel_porter: { tip: '€1-2/bag', cash: true, note: 'Appreciated at hotels' },
      housekeeping: { tip: '€1-2/night', cash: true, note: 'Leave daily or at end of stay' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated at upscale spas' },
      haircut:      { tip: '5%', cash: true, note: 'Small tip appreciated; not mandatory' },
      tour_guide:   { tip: '€5-10/day', cash: true, note: 'Per person; tourism is major industry' },
      delivery:     { tip: 'none', cash: false, note: 'Not widely practiced' },
    },
    quickTip: 'Tipping is optional and modest; locals leave small change rather than percentage-based amounts.'
  },
  PT: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '5-10%', cash: true, note: 'Not obligatory; appreciated for good service' },
      cafe:         { tip: 'none', cash: true, note: 'Leave small coins; pastelaria tips minimal' },
      bar:          { tip: 'none', cash: true, note: 'Not customary; leave coins if you like' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; 5-10% acceptable' },
      hotel_porter: { tip: '€1-2/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: '€1-2/night', cash: true, note: 'Appreciated; leave with note' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated at resort spas' },
      haircut:      { tip: '5%', cash: true, note: 'Small tip for good service' },
      tour_guide:   { tip: '€5-10/day', cash: true, note: 'Per person; guides appreciate it' },
      delivery:     { tip: 'none', cash: false, note: 'Not widely expected' },
    },
    quickTip: 'Tipping is appreciated but modest; 5-10% cash at restaurants is more than sufficient.'
  },
  NL: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '5-10%', cash: false, note: 'Rounding up is common; percentage tipping less prevalent' },
      cafe:         { tip: 'round up', cash: false, note: 'Leave small change; not required' },
      bar:          { tip: 'round up', cash: false, note: 'Rounding up is the norm; heavy tipping uncommon' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up to nearest euro; not obligatory' },
      hotel_porter: { tip: '€1-2/bag', cash: true, note: 'Standard at full-service hotels' },
      housekeeping: { tip: '€1-2/night', cash: true, note: 'Not commonly practiced but appreciated' },
      spa:          { tip: '10%', cash: false, note: 'Appreciated at upscale establishments' },
      haircut:      { tip: '5-10%', cash: false, note: 'Common at salons' },
      tour_guide:   { tip: '€5-10/day', cash: true, note: 'Per person for guided tours' },
      delivery:     { tip: 'none', cash: false, note: 'Not widely expected' },
    },
    quickTip: 'Tipping is appreciated but modest; rounding up the bill is the typical Dutch approach.'
  },
  BE: {
    serviceCharge: true,
    scNote: 'Service charge (16%) is legally included in restaurant bills',
    industries: {
      restaurant:   { tip: 'none', cash: true, note: 'Service included by law; round up for extra appreciation' },
      cafe:         { tip: 'none', cash: true, note: 'Leave small coins if you wish' },
      bar:          { tip: 'none', cash: true, note: 'Not customary' },
      taxi:         { tip: 'round up', cash: true, note: 'Round to nearest euro' },
      hotel_porter: { tip: '€1-2/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: '€1-2/night', cash: true, note: 'Appreciated; not obligatory' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated at upscale spas' },
      haircut:      { tip: '5-10%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: '€5-10/day', cash: true, note: 'Per person for quality guides' },
      delivery:     { tip: 'none', cash: false, note: 'Not widely expected' },
    },
    quickTip: 'Service is legally included in restaurant bills; any extra amount is purely optional goodwill.'
  },
  CH: {
    serviceCharge: true,
    scNote: 'Service charge is included in prices by law; additional tipping is discretionary',
    industries: {
      restaurant:   { tip: 'none', cash: true, note: 'Service included; round up or leave CHF 1-5 for good service' },
      cafe:         { tip: 'none', cash: true, note: 'Leave small coins; not expected' },
      bar:          { tip: 'round up', cash: true, note: 'Round to nearest franc' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; 5-10% for helpful drivers' },
      hotel_porter: { tip: 'CHF 2-3/bag', cash: true, note: 'Switzerland is expensive; tips reflect that' },
      housekeeping: { tip: 'CHF 2-3/night', cash: true, note: 'Leave daily with note' },
      spa:          { tip: 'CHF 10-20', cash: true, note: 'Appreciated at upscale Alpine spas' },
      haircut:      { tip: '5-10%', cash: true, note: 'Give directly to stylist' },
      tour_guide:   { tip: 'CHF 10-20/day', cash: true, note: 'Per person; Switzerland has high cost of living' },
      delivery:     { tip: 'none', cash: false, note: 'Not widely expected' },
    },
    quickTip: 'Service is included by law; round up generously given Switzerland\'s high cost of living.'
  },
  AT: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '5-10%', cash: true, note: 'Tell waiter desired total when paying; do not leave on table' },
      cafe:         { tip: 'round up', cash: true, note: 'Vienna coffee house culture: leave small coins' },
      bar:          { tip: 'round up', cash: true, note: 'Round up to nearest euro' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; 5-10% for good service' },
      hotel_porter: { tip: '€1-2/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: '€1-2/night', cash: true, note: 'Appreciated; leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated at Alpine wellness resorts' },
      haircut:      { tip: '5-10%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: '€5-10/day', cash: true, note: 'Per person for guided tours' },
      delivery:     { tip: '€1-2', cash: false, note: 'Small tip via app appreciated' },
    },
    quickTip: 'Tell the server the exact total you want to pay including tip when they come to collect.'
  },
  SE: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '5-10%', cash: false, note: 'Not obligatory; Swedes rarely tip but tourists may' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected; tip prompts on card terminals exist' },
      bar:          { tip: 'none', cash: false, note: 'Not customary in Sweden' },
      taxi:         { tip: 'round up', cash: false, note: 'Round up; tipping apps now prompt for tips' },
      hotel_porter: { tip: 'SEK 20-50/bag', cash: true, note: 'Not common; appreciated at luxury hotels' },
      housekeeping: { tip: 'SEK 20-50/night', cash: true, note: 'Not widely practiced' },
      spa:          { tip: '10%', cash: false, note: 'Appreciated but not expected' },
      haircut:      { tip: '5-10%', cash: false, note: 'Increasingly common with card terminals' },
      tour_guide:   { tip: 'SEK 50-100/day', cash: true, note: 'Per person; appreciated' },
      delivery:     { tip: 'none', cash: false, note: 'Not culturally established' },
    },
    quickTip: 'Tipping is not expected in Sweden; workers earn living wages and tips are always optional.'
  },
  NO: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '5-10%', cash: false, note: 'Not obligatory; staff earn high wages. Tip for great service' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected' },
      bar:          { tip: 'none', cash: false, note: 'Not customary' },
      taxi:         { tip: 'round up', cash: false, note: 'Round up; not obligatory' },
      hotel_porter: { tip: 'NOK 20-50/bag', cash: true, note: 'Appreciated at upscale hotels' },
      housekeeping: { tip: 'NOK 20-50/night', cash: true, note: 'Not widely practiced' },
      spa:          { tip: '10%', cash: false, note: 'Appreciated but not expected' },
      haircut:      { tip: '5-10%', cash: false, note: 'Becoming more common' },
      tour_guide:   { tip: 'NOK 50-100/day', cash: true, note: 'Per person; appreciated' },
      delivery:     { tip: 'none', cash: false, note: 'Not customary' },
    },
    quickTip: 'Norway has strong wages; tipping is never obligatory but welcomed for exceptional service.'
  },
  DK: {
    serviceCharge: true,
    scNote: 'Service charge typically included in restaurant bills',
    industries: {
      restaurant:   { tip: 'none', cash: false, note: 'Service included; round up if service was exceptional' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected' },
      bar:          { tip: 'none', cash: false, note: 'Not customary' },
      taxi:         { tip: 'round up', cash: false, note: 'Round to nearest krone; not obligatory' },
      hotel_porter: { tip: 'DKK 20-40/bag', cash: true, note: 'Appreciated at upscale hotels' },
      housekeeping: { tip: 'DKK 20-40/night', cash: true, note: 'Not widely expected' },
      spa:          { tip: '10%', cash: false, note: 'Appreciated' },
      haircut:      { tip: '5-10%', cash: false, note: 'Becoming more common' },
      tour_guide:   { tip: 'DKK 50-100/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'none', cash: false, note: 'Not culturally established' },
    },
    quickTip: 'Service is typically included; tipping is optional and any extra is a genuine gift.'
  },
  FI: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: 'none', cash: false, note: 'Not expected; Finns rarely tip. Round up to be polite' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected' },
      bar:          { tip: 'none', cash: false, note: 'Not customary' },
      taxi:         { tip: 'none', cash: false, note: 'Not expected; round up occasionally' },
      hotel_porter: { tip: 'none', cash: true, note: 'Not expected; small tip at luxury hotels' },
      housekeeping: { tip: 'none', cash: true, note: 'Not customary' },
      spa:          { tip: 'none', cash: false, note: 'Not expected' },
      haircut:      { tip: 'none', cash: false, note: 'Not customary in Finland' },
      tour_guide:   { tip: '€5/day', cash: true, note: 'Per person; increasingly accepted' },
      delivery:     { tip: 'none', cash: false, note: 'Not expected' },
    },
    quickTip: 'Finland has minimal tipping culture; workers earn regulated wages and tips are never expected.'
  },
  PL: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Say kwota when paying to indicate tip; do not leave on table' },
      cafe:         { tip: 'round up', cash: true, note: 'Leave small change; appreciated' },
      bar:          { tip: 'round up', cash: true, note: 'Round to nearest zloty' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; 5-10% for longer rides' },
      hotel_porter: { tip: 'PLN 5-10/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: 'PLN 5-10/night', cash: true, note: 'Leave with note' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated at spas' },
      haircut:      { tip: '10%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: 'PLN 20-50/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'PLN 3-5', cash: false, note: 'App tipping becoming common' },
    },
    quickTip: 'Tell the server the total you want to pay including tip; do not leave coins on the table.'
  },
  CZ: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Tell the server the total when paying; don\'t leave on table' },
      cafe:         { tip: 'round up', cash: true, note: 'Leave small coins; appreciated' },
      bar:          { tip: 'round up', cash: true, note: 'Round up; common in Prague tourist areas' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; 10% for tourist areas' },
      hotel_porter: { tip: 'CZK 20-50/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: 'CZK 20-50/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated at spa resorts' },
      haircut:      { tip: '10%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: 'CZK 100-200/day', cash: true, note: 'Per person; important in tourist industry' },
      delivery:     { tip: 'CZK 20-30', cash: false, note: 'Appreciated' },
    },
    quickTip: 'State the total amount you wish to pay when handing over cash; the change is the tip.'
  },
  HU: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10-15%', cash: true, note: 'State total when paying; never leave on table after waiter collects' },
      cafe:         { tip: 'round up', cash: true, note: 'Leave small change' },
      bar:          { tip: 'round up', cash: true, note: 'Round up to nearest hundred forint' },
      taxi:         { tip: '10%', cash: true, note: '10% expected; Budapest taxis commonly expect tips' },
      hotel_porter: { tip: 'HUF 500-1000/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: 'HUF 500-1000/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10-15%', cash: true, note: 'Hungary famous for thermal spas; tip therapists' },
      haircut:      { tip: '10%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: 'HUF 1000-2000/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'HUF 200-500', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Always state the full amount including tip when paying; do not leave money on the table.'
  },
  RO: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Tell server the amount when paying; tipping norms growing' },
      cafe:         { tip: 'round up', cash: true, note: 'Leave small change' },
      bar:          { tip: 'round up', cash: true, note: 'Round up; appreciated' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; not obligatory' },
      hotel_porter: { tip: 'RON 5-10/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: 'RON 5-10/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated' },
      haircut:      { tip: '10%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: 'RON 20-40/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'RON 5-10', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Tipping norms are growing; 10% cash at restaurants is a respectful and appreciated amount.'
  },
  GR: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Leave cash on table; appreciated but not obligatory' },
      cafe:         { tip: 'round up', cash: true, note: 'Leave small coins; Greek cafe culture is relaxed' },
      bar:          { tip: 'round up', cash: true, note: 'Leave coins; not mandatory' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for luggage help' },
      hotel_porter: { tip: '€1-2/bag', cash: true, note: 'Standard especially in tourist areas' },
      housekeeping: { tip: '€1-2/night', cash: true, note: 'Leave with note daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated at resort spas' },
      haircut:      { tip: '5-10%', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: '€5-10/day', cash: true, note: 'Per person; important in Greek tourism economy' },
      delivery:     { tip: '€1-2', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Leave cash on the table at restaurants; tipping is appreciated but the amount is your choice.'
  },
  TR: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10-15%', cash: true, note: 'Leave cash; card tips may not reach staff' },
      cafe:         { tip: 'round up', cash: true, note: 'Leave small coins; appreciated' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated; leave cash on table' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for luggage help' },
      hotel_porter: { tip: 'TRY 20-50/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: 'TRY 20-50/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10-15%', cash: true, note: 'Hamam attendants expect tips; give cash directly' },
      haircut:      { tip: '10%', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: 'TRY 50-100/day', cash: true, note: 'Per person; guides depend on tips' },
      delivery:     { tip: 'TRY 10-20', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Always tip in cash; at Turkish baths (hamam) tip the attendant directly after the service.'
  },
  RU: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Leave cash; tipping culture established in cities' },
      cafe:         { tip: 'round up', cash: true, note: 'Leave small change; appreciated' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated in Moscow and St. Petersburg bars' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; app-based services less tip-reliant' },
      hotel_porter: { tip: 'RUB 100-200/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: 'RUB 100-200/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated' },
      haircut:      { tip: '10%', cash: true, note: 'Common in cities' },
      tour_guide:   { tip: 'RUB 300-500/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'RUB 50-100', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Tipping is established in major Russian cities; 10% cash is a respectful gesture.'
  },
  JP: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: 'none', cash: false, note: 'Tipping is considered rude; staff may chase you to return money' },
      cafe:         { tip: 'none', cash: false, note: 'Never tip; exceptional service is a cultural standard' },
      bar:          { tip: 'none', cash: false, note: 'Do not tip; bottle service at clubs has separate pricing' },
      taxi:         { tip: 'none', cash: false, note: 'Never tip; drivers may be offended by the offer' },
      hotel_porter: { tip: 'none', cash: false, note: 'Do not tip individual staff; tip via envelope at checkout if staying long' },
      housekeeping: { tip: 'none', cash: false, note: 'Do not leave loose change; it may be mistaken for forgotten money' },
      spa:          { tip: 'none', cash: false, note: 'Never tip at onsen or massage establishments' },
      haircut:      { tip: 'none', cash: false, note: 'Do not tip; it is offensive in Japan' },
      tour_guide:   { tip: 'none', cash: false, note: 'Do not tip; group tip envelopes for multi-day tours are exception' },
      delivery:     { tip: 'none', cash: false, note: 'Never tip delivery workers in Japan' },
    },
    quickTip: 'Tipping is considered rude in Japan; great service is the cultural baseline, not a bonus.'
  },
  KR: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: 'none', cash: false, note: 'Tipping is not practiced and can cause awkwardness' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected or practiced' },
      bar:          { tip: 'none', cash: false, note: 'Do not tip; table service is included in pricing' },
      taxi:         { tip: 'none', cash: false, note: 'Not expected; meters are strictly followed' },
      hotel_porter: { tip: 'none', cash: false, note: 'Not customary; luxury international hotels may accept' },
      housekeeping: { tip: 'none', cash: false, note: 'Not practiced' },
      spa:          { tip: 'none', cash: false, note: 'Not expected' },
      haircut:      { tip: 'none', cash: false, note: 'Not customary' },
      tour_guide:   { tip: 'none', cash: false, note: 'Not traditional; some tourist-oriented guides accept' },
      delivery:     { tip: 'none', cash: false, note: 'Not practiced' },
    },
    quickTip: 'Tipping is not part of Korean culture; attempting to tip can create awkwardness for staff.'
  },
  CN: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: 'none', cash: false, note: 'Not customary and sometimes refused; high-end hotels differ' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected' },
      bar:          { tip: 'none', cash: false, note: 'Not customary except in Western-style bars in Shanghai/Beijing' },
      taxi:         { tip: 'none', cash: false, note: 'Not expected; DiDi app rides do not prompt for tips' },
      hotel_porter: { tip: 'none', cash: false, note: 'Not expected; international luxury hotels may accept' },
      housekeeping: { tip: 'none', cash: false, note: 'Not customary' },
      spa:          { tip: 'none', cash: false, note: 'Not expected in local spas' },
      haircut:      { tip: 'none', cash: false, note: 'Not customary' },
      tour_guide:   { tip: 'none', cash: false, note: 'May be expected on international tourist packages' },
      delivery:     { tip: 'none', cash: false, note: 'Not practiced' },
    },
    quickTip: 'Tipping is not practiced in China and can be refused; international hotels are the main exception.'
  },
  TH: {
    serviceCharge: true,
    scNote: '10% service charge added at tourist-area restaurants and hotels',
    industries: {
      restaurant:   { tip: 'THB 20-50', cash: true, note: 'Leave coins from change; percentage less common' },
      cafe:         { tip: 'none', cash: true, note: 'Not expected; leave coins if you wish' },
      bar:          { tip: 'THB 20-50', cash: true, note: 'Leave cash on bar; appreciated' },
      taxi:         { tip: 'round up', cash: true, note: 'Round to nearest 10-20 baht; for metered taxis' },
      hotel_porter: { tip: 'THB 20-50/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: 'THB 20-50/night', cash: true, note: 'Leave daily on pillow' },
      spa:          { tip: 'THB 50-100', cash: true, note: 'Give directly to therapist; Thai massage workers rely on tips' },
      haircut:      { tip: 'THB 50-100', cash: true, note: 'Appreciated; give directly' },
      tour_guide:   { tip: 'THB 100-200/day', cash: true, note: 'Per person; guides depend on tips' },
      delivery:     { tip: 'THB 10-20', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Always tip Thai massage therapists in cash directly; it forms a significant part of their income.'
  },
  VN: {
    serviceCharge: true,
    scNote: '5-10% service charge at tourist restaurants and hotels',
    industries: {
      restaurant:   { tip: 'VND 10000-50000', cash: true, note: 'Not expected at local pho shops; appreciated at tourist venues' },
      cafe:         { tip: 'none', cash: true, note: 'Not expected' },
      bar:          { tip: 'VND 20000-50000', cash: true, note: 'Leave cash; appreciated in tourist bars' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for honest metered service' },
      hotel_porter: { tip: 'VND 20000-50000/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: 'VND 20000-50000/night', cash: true, note: 'Leave daily' },
      spa:          { tip: 'VND 50000-100000', cash: true, note: 'Give directly to therapist; important for income' },
      haircut:      { tip: 'VND 20000-50000', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: 'VND 100000-200000/day', cash: true, note: 'Per person; USD also accepted' },
      delivery:     { tip: 'VND 10000-20000', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Tip spa and massage therapists directly in cash; USD is widely accepted for tips.'
  },
  ID: {
    serviceCharge: true,
    scNote: '10% service charge plus 10% VAT common at restaurants and hotels',
    industries: {
      restaurant:   { tip: '5-10%', cash: true, note: 'Leave cash if service charge not already included' },
      cafe:         { tip: 'none', cash: true, note: 'Not expected' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated in tourist bars in Bali and Jakarta' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for Blue Bird metered taxis' },
      hotel_porter: { tip: 'IDR 10000-20000/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'IDR 10000-20000/night', cash: true, note: 'Leave daily' },
      spa:          { tip: 'IDR 20000-50000', cash: true, note: 'Give directly; important in Bali spa culture' },
      haircut:      { tip: 'IDR 10000-20000', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: 'IDR 50000-100000/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'IDR 5000-10000', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Check if service charge is already added before tipping; in Bali tip spa staff directly in cash.'
  },
  MY: {
    serviceCharge: true,
    scNote: '10% service charge standard at restaurants; 6% SST also applies',
    industries: {
      restaurant:   { tip: 'none', cash: false, note: 'Service charge included; extra tip optional at upscale venues' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated; leave cash' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; Grab app less tip-reliant' },
      hotel_porter: { tip: 'MYR 2-5/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'MYR 2-5/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'If not included in bill; give directly' },
      haircut:      { tip: 'MYR 3-5', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: 'MYR 10-20/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'MYR 1-2', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Service charge is usually included in Malaysia; check your bill before adding anything extra.'
  },
  SG: {
    serviceCharge: true,
    scNote: '10% service charge plus 9% GST applied at most restaurants and hotels',
    industries: {
      restaurant:   { tip: 'none', cash: false, note: 'Service charge legally mandated; additional tipping not expected' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected' },
      bar:          { tip: 'none', cash: false, note: 'Service charge covers it; leave cash if impressed' },
      taxi:         { tip: 'none', cash: false, note: 'Not expected; metered fares are transparent' },
      hotel_porter: { tip: 'none', cash: false, note: 'Not expected; service charge applies' },
      housekeeping: { tip: 'none', cash: false, note: 'Not expected' },
      spa:          { tip: 'none', cash: false, note: 'Service charge covers gratuity' },
      haircut:      { tip: 'none', cash: false, note: 'Not customary' },
      tour_guide:   { tip: 'SGD 5-10/day', cash: true, note: 'Per person; appreciated for excellent guides' },
      delivery:     { tip: 'none', cash: false, note: 'Not practiced' },
    },
    quickTip: 'Singapore\'s mandatory 10% service charge means additional tipping is never expected.'
  },
  PH: {
    serviceCharge: true,
    scNote: '10% service charge common at restaurants and hotels in cities',
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'If no service charge; leave cash for staff directly' },
      cafe:         { tip: 'none', cash: true, note: 'Not expected' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated; leave cash' },
      taxi:         { tip: 'PHP 20-50', cash: true, note: 'Round up; Grab is less tip-reliant but appreciated' },
      hotel_porter: { tip: 'PHP 50-100/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'PHP 50-100/night', cash: true, note: 'Leave daily' },
      spa:          { tip: 'PHP 100-200', cash: true, note: 'Give directly; Filipino masseurs rely on tips' },
      haircut:      { tip: 'PHP 50-100', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: 'PHP 200-500/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'PHP 20-50', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Tip in cash directly to service staff; gratuity is an important supplement to low base wages.'
  },
  IN: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Leave cash; card tips often do not reach staff' },
      cafe:         { tip: 'none', cash: true, note: 'Not expected at chain cafes; leave change if you wish' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated; leave cash on table' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; Ola/Uber users can tip in app' },
      hotel_porter: { tip: 'INR 50-100/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: 'INR 50-100/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10-15%', cash: true, note: 'Give directly to therapist; important to their income' },
      haircut:      { tip: 'INR 20-50', cash: true, note: 'Appreciated; give directly' },
      tour_guide:   { tip: 'INR 200-500/day', cash: true, note: 'Per person; USD also accepted' },
      delivery:     { tip: 'INR 20-50', cash: false, note: 'In-app tipping appreciated' },
    },
    quickTip: 'Always tip in cash directly to the individual; card or desk tips often do not reach the staff.'
  },
  LK: {
    serviceCharge: true,
    scNote: '10% service charge common at tourist restaurants and hotels',
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'If not included; leave cash for staff' },
      cafe:         { tip: 'none', cash: true, note: 'Not expected' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for helpful drivers' },
      hotel_porter: { tip: 'LKR 200-500/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'LKR 200-500/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Give directly to therapist' },
      haircut:      { tip: 'LKR 100-200', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: 'LKR 500-1000/day', cash: true, note: 'Per person; USD welcomed' },
      delivery:     { tip: 'LKR 100-200', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Check your bill for service charge; cash tips given directly to staff are most appreciated.'
  },
  NP: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Standard at tourist restaurants in Kathmandu and Pokhara' },
      cafe:         { tip: 'none', cash: true, note: 'Not expected; leave change if you wish' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated in tourist areas' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for helping with luggage' },
      hotel_porter: { tip: 'NPR 200-500/bag', cash: true, note: 'Standard; trekking porters have higher expectations' },
      housekeeping: { tip: 'NPR 200-300/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Give directly' },
      haircut:      { tip: 'NPR 100-200', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: '$5-10/day', cash: true, note: 'Per person; USD preferred. Trekking guides expect more' },
      delivery:     { tip: 'NPR 50-100', cash: false, note: 'Appreciated' },
    },
    quickTip: 'For trekking guides and porters, USD tips are preferred and culturally expected as part of their income.'
  },
  AE: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10-15%', cash: false, note: 'Expected at sit-down restaurants; most staff are migrant workers' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected at chain cafes; leave change for small venues' },
      bar:          { tip: '10-15%', cash: false, note: 'Appreciated at licensed venues in Dubai and Abu Dhabi' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for helpful service' },
      hotel_porter: { tip: 'AED 5-10/bag', cash: true, note: 'Standard at luxury Dubai hotels' },
      housekeeping: { tip: 'AED 10-20/night', cash: true, note: 'Leave daily; important for low-wage migrant workers' },
      spa:          { tip: '15%', cash: false, note: 'Expected at hotel spas' },
      haircut:      { tip: '10-15%', cash: false, note: 'Appreciated at salons' },
      tour_guide:   { tip: 'AED 30-50/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'AED 5-10', cash: false, note: 'Appreciated; delivery workers earn very low wages' },
    },
    quickTip: 'Tipping is culturally embedded in UAE; service staff are predominantly low-wage migrant workers.'
  },
  SA: {
    serviceCharge: true,
    scNote: '15% service charge applies at restaurants under Saudi VAT rules',
    industries: {
      restaurant:   { tip: 'none', cash: true, note: 'Service charge included; extra tip appreciated but not expected' },
      cafe:         { tip: 'none', cash: true, note: 'Not expected' },
      bar:          { tip: 'none', cash: false, note: 'Alcohol is banned; concept does not apply' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for helpful drivers' },
      hotel_porter: { tip: 'SAR 5-10/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: 'SAR 10-20/night', cash: true, note: 'Appreciated; leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated at hotel spas' },
      haircut:      { tip: '10%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: 'SAR 30-50/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'SAR 5-10', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Service charges are applied at restaurants; additional tipping is a gesture of appreciation, not required.'
  },
  IL: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10-15%', cash: true, note: 'Important to restaurant staff; Israelis tip routinely' },
      cafe:         { tip: '10%', cash: true, note: 'Appreciated; leave cash' },
      bar:          { tip: '10-15%', cash: true, note: 'Expected in Tel Aviv bar culture' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; 10% for helpful service' },
      hotel_porter: { tip: 'ILS 5-10/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'ILS 10-20/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10-15%', cash: true, note: 'Expected' },
      haircut:      { tip: '10-15%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: 'ILS 30-50/day', cash: true, note: 'Per person; Israeli guides are very professional' },
      delivery:     { tip: 'ILS 5-10', cash: false, note: 'App tipping appreciated' },
    },
    quickTip: 'Tipping is an established Israeli norm; 10-15% at restaurants is expected by staff.'
  },
  EG: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Baksheesh culture; cash essential. Staff wages are very low' },
      cafe:         { tip: 'EGP 5-10', cash: true, note: 'Leave small change; appreciated' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated; leave cash' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for AC and helpful service' },
      hotel_porter: { tip: 'EGP 20-50/bag', cash: true, note: 'Standard; USD also accepted' },
      housekeeping: { tip: 'EGP 20-50/night', cash: true, note: 'Leave daily; important for low-wage staff' },
      spa:          { tip: '10-15%', cash: true, note: 'Give directly to therapist' },
      haircut:      { tip: '10%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: '$5-10/day', cash: true, note: 'Per person; USD preferred. Essential for guides\' income' },
      delivery:     { tip: 'EGP 10-20', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Baksheesh (small tips) are deeply embedded in Egyptian culture; carry small bills for all services.'
  },
  MA: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Leave cash; restaurant staff earn low wages' },
      cafe:         { tip: 'MAD 5-10', cash: true, note: 'Leave coins; appreciated' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated in tourist-area establishments' },
      taxi:         { tip: 'round up', cash: true, note: 'Petit taxi: round up. Tour drivers tip more generously' },
      hotel_porter: { tip: 'MAD 10-20/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'MAD 10-20/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10-15%', cash: true, note: 'Hammam attendants expect tips; give directly' },
      haircut:      { tip: 'MAD 10-20', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: 'MAD 50-100/day', cash: true, note: 'Per person; important in tourism-dependent economy' },
      delivery:     { tip: 'MAD 5-10', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Tip hammam attendants directly in cash; carry small dirhams for all service encounters.'
  },
  TN: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Appreciated; leave cash on table or hand directly' },
      cafe:         { tip: 'TND 0.5-1', cash: true, note: 'Leave coins; very common in Tunisian cafe culture' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; common practice' },
      hotel_porter: { tip: 'TND 1-2/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'TND 1-2/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated; hammam tipping similar to Morocco' },
      haircut:      { tip: 'TND 1-3', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: 'TND 5-10/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'TND 0.5-1', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Tipping is part of daily life in Tunisia; keep small dinar notes and coins on hand at all times.'
  },
  KE: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Leave cash; important supplement to low wages' },
      cafe:         { tip: 'none', cash: true, note: 'Not expected; leave small change if you wish' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated; leave cash' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for Uber drivers via app' },
      hotel_porter: { tip: 'KES 100-200/bag', cash: true, note: 'Standard at hotels and lodges' },
      housekeeping: { tip: 'KES 100-200/night', cash: true, note: 'Leave daily; important for safari lodge staff' },
      spa:          { tip: '10%', cash: true, note: 'Give directly to therapist' },
      haircut:      { tip: 'KES 50-100', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: '$10-20/day', cash: true, note: 'Per person; USD standard in safari industry' },
      delivery:     { tip: 'KES 50-100', cash: false, note: 'Appreciated' },
    },
    quickTip: 'On safari, tip guides and camp staff in USD; it is a critical part of their compensation.'
  },
  ZA: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10-15%', cash: false, note: 'Expected; South Africans tip routinely. Never leave nothing' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected at coffee shops' },
      bar:          { tip: '10%', cash: false, note: 'Appreciated; leave tip when paying tab' },
      taxi:         { tip: 'none', cash: true, note: 'Uber standard; tip car guards in parking lots (ZAR 5-10)' },
      hotel_porter: { tip: 'ZAR 10-20/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'ZAR 10-20/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10-15%', cash: false, note: 'Expected' },
      haircut:      { tip: '10-15%', cash: false, note: 'Common practice' },
      tour_guide:   { tip: 'ZAR 100-200/day', cash: true, note: 'Per person; important in tourism economy' },
      delivery:     { tip: 'ZAR 10-20', cash: false, note: 'App tipping common' },
    },
    quickTip: 'Tip 10-15% at restaurants; also tip parking lot car guards (ZAR 5-10) — it is culturally expected.'
  },
  NG: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Appreciated at sit-down restaurants in Lagos and Abuja' },
      cafe:         { tip: 'none', cash: true, note: 'Not expected' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated; leave cash' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for Bolt/Uber via app' },
      hotel_porter: { tip: 'NGN 500-1000/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: 'NGN 500-1000/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated' },
      haircut:      { tip: 'NGN 200-500', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: 'NGN 2000-5000/day', cash: true, note: 'Per person; USD also accepted' },
      delivery:     { tip: 'NGN 200-500', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Tipping is appreciated in urban Nigeria; cash is king and giving directly to staff is the norm.'
  },
  ET: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Appreciated at tourist restaurants in Addis Ababa' },
      cafe:         { tip: 'none', cash: true, note: 'Coffee ceremony is cultural ritual; tip optional' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; negotiate fares beforehand' },
      hotel_porter: { tip: 'ETB 50-100/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'ETB 50-100/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated' },
      haircut:      { tip: 'ETB 20-50', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: '$5-10/day', cash: true, note: 'Per person; USD preferred in tourism sector' },
      delivery:     { tip: 'ETB 20-50', cash: false, note: 'Appreciated' },
    },
    quickTip: 'USD tips are preferred by tour guides; carry small birr notes for everyday service encounters.'
  },
  MX: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10-15%', cash: false, note: 'Expected; Mexican dining culture embraces tipping' },
      cafe:         { tip: '10%', cash: false, note: 'Tip jars common; tip at sit-down cafe service' },
      bar:          { tip: '10-15%', cash: false, note: 'Appreciated; tab tipping common' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for luggage help. Uber less expected' },
      hotel_porter: { tip: 'MXN 20-50/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'MXN 20-50/night', cash: true, note: 'Leave daily; important for resort staff' },
      spa:          { tip: '15%', cash: false, note: 'Expected at resort and hotel spas' },
      haircut:      { tip: '10-15%', cash: false, note: 'Common practice' },
      tour_guide:   { tip: 'MXN 100-200/day', cash: true, note: 'Per person; USD also accepted' },
      delivery:     { tip: 'MXN 20-30', cash: false, note: 'App tipping common' },
    },
    quickTip: 'Tipping is culturally ingrained in Mexico; 15% at restaurants is the respectful baseline.'
  },
  BR: {
    serviceCharge: true,
    scNote: '10% service charge (taxa de servico) is common but voluntary; you may decline it',
    industries: {
      restaurant:   { tip: 'none', cash: false, note: 'Taxa de servico covers it; declining is common and acceptable' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected' },
      bar:          { tip: '10%', cash: true, note: 'If no service charge; leave cash' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; not obligatory' },
      hotel_porter: { tip: 'BRL 5-10/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'BRL 5-10/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated; give directly' },
      haircut:      { tip: '10%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: 'BRL 30-50/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'BRL 5-10', cash: false, note: 'App tipping appreciated' },
    },
    quickTip: 'The 10% service charge is optional and listed on the bill; you are legally entitled to decline it.'
  },
  AR: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Leave cash due to inflation; card tips may lose value' },
      cafe:         { tip: 'round up', cash: true, note: 'Leave coins; appreciated' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated; leave cash' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; tip for helpful service' },
      hotel_porter: { tip: 'ARS 200-500/bag', cash: true, note: 'Standard; USD also appreciated' },
      housekeeping: { tip: 'ARS 200-500/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated' },
      haircut:      { tip: '10%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: 'ARS 500-1000/day', cash: true, note: 'Per person; USD strongly preferred due to inflation' },
      delivery:     { tip: 'ARS 100-300', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Due to inflation, USD tips are highly valued; always tip in cash rather than on a card.'
  },
  CO: {
    serviceCharge: true,
    scNote: '10% propina (tip) is added to bills but legally optional — you may ask to remove it',
    industries: {
      restaurant:   { tip: 'none', cash: false, note: 'Propina is included; you may legally decline it' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated; leave cash' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; Uber tip via app' },
      hotel_porter: { tip: 'COP 5000-10000/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'COP 5000-10000/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated' },
      haircut:      { tip: '10%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: 'COP 20000-50000/day', cash: true, note: 'Per person; USD also accepted' },
      delivery:     { tip: 'COP 2000-5000', cash: false, note: 'Appreciated' },
    },
    quickTip: 'The 10% propina on restaurant bills is optional by law; you may politely ask to remove it.'
  },
  PE: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'Not obligatory but common; leave cash for staff' },
      cafe:         { tip: 'none', cash: true, note: 'Not expected' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; negotiate price beforehand in Lima' },
      hotel_porter: { tip: 'PEN 5-10/bag', cash: true, note: 'Standard at hotels' },
      housekeeping: { tip: 'PEN 5-10/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: true, note: 'Appreciated' },
      haircut:      { tip: 'PEN 3-5', cash: true, note: 'Appreciated' },
      tour_guide:   { tip: 'PEN 30-50/day', cash: true, note: 'Per person; USD also accepted' },
      delivery:     { tip: 'PEN 3-5', cash: false, note: 'Appreciated' },
    },
    quickTip: 'Tipping is appreciated but not obligatory in Peru; 10% cash is a respectful and sufficient gesture.'
  },
  CL: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10%', cash: false, note: 'Common practice; expected at sit-down restaurants in Santiago' },
      cafe:         { tip: 'none', cash: false, note: 'Not expected' },
      bar:          { tip: '10%', cash: false, note: 'Appreciated' },
      taxi:         { tip: 'round up', cash: true, note: 'Round up; Uber tip via app' },
      hotel_porter: { tip: 'CLP 1000-2000/bag', cash: true, note: 'Standard' },
      housekeeping: { tip: 'CLP 1000-2000/night', cash: true, note: 'Leave daily' },
      spa:          { tip: '10%', cash: false, note: 'Appreciated' },
      haircut:      { tip: '10%', cash: false, note: 'Common practice' },
      tour_guide:   { tip: 'CLP 5000-10000/day', cash: true, note: 'Per person' },
      delivery:     { tip: 'CLP 500-1000', cash: false, note: 'Appreciated' },
    },
    quickTip: 'A 10% tip at sit-down restaurants is the standard expectation across Chile.'
  },
  CU: {
    serviceCharge: false,
    scNote: null,
    industries: {
      restaurant:   { tip: '10-15%', cash: true, note: 'CUC or USD essential; tips are a primary income source' },
      cafe:         { tip: 'none', cash: true, note: 'Leave small change; appreciated' },
      bar:          { tip: '1 CUC/drink', cash: true, note: 'Cash tip per drink; bartenders rely heavily on tips' },
      taxi:         { tip: '1-2 CUC', cash: true, note: 'Tip for classic car taxis; standard in Havana' },
      hotel_porter: { tip: '1-2 CUC/bag', cash: true, note: 'Essential; CUC or USD' },
      housekeeping: { tip: '1-2 CUC/night', cash: true, note: 'Leave daily; very important to staff income' },
      spa:          { tip: '10-15%', cash: true, note: 'CUC or USD' },
      haircut:      { tip: '1-2 CUC', cash: true, note: 'Appreciated; hard currency preferred' },
      tour_guide:   { tip: '5-10 CUC/day', cash: true, note: 'Per person; USD or EUR welcome' },
      delivery:     { tip: 'none', cash: false, note: 'Delivery infrastructure limited' },
    },
    quickTip: 'In Cuba, USD and CUC tips are a critical supplement to state wages; always tip in hard currency.'
  },
  JM: {
    serviceCharge: true,
    scNote: '10% service charge typically added at tourist hotels and restaurants',
    industries: {
      restaurant:   { tip: '10%', cash: true, note: 'If no service charge; leave additional cash for staff' },
      cafe:         { tip: 'none', cash: true, note: 'Not expected' },
      bar:          { tip: '10%', cash: true, note: 'Appreciated; leave cash on the bar' },
      taxi:         { tip: '10-15%', cash: true, note: 'Expected for taxi and shuttle drivers' },
      hotel_porter: { tip: '$1-2/bag', cash: true, note: 'USD standard at all-inclusive resorts' },
      housekeeping: { tip: '$2-3/night', cash: true, note: 'Leave daily; USD standard at resorts' },
      spa:          { tip: '15%', cash: true, note: 'Expected at resort spas' },
      haircut:      { tip: '10-15%', cash: true, note: 'Common practice' },
      tour_guide:   { tip: '$5-10/day', cash: true, note: 'Per person; USD standard' },
      delivery:     { tip: 'none', cash: false, note: 'Not widely practiced' },
    },
    quickTip: 'At all-inclusive resorts USD tips are expected and deeply appreciated by resort workers.'
  }
};

// ─── COUNTRY_FACTS — enriched per-country reference (population, languages, currency,
// calling code, driving side, electrical plugs/voltage, emergency numbers, brief history).
// Safety-critical fields web-verified (Wikipedia emergency numbers; worldstandards.eu plugs;
// Wikipedia calling codes + driving side). 195 countries.
const COUNTRY_FACTS = {
 "AL": {
  "name": "Albania",
  "pop": 2745000,
  "popYear": 2024,
  "langs": [
   "Albanian"
  ],
  "cur": {
   "code": "ALL",
   "sym": "L",
   "name": "Albanian Lek"
  },
  "region": "Southeast Europe (Balkans)",
  "hist": "Albania traces its roots to the ancient Illyrians and later fell under Roman, Byzantine, and Ottoman rule, the latter lasting nearly five centuries and shaping much of the country's architecture and religious mix. It declared independence from the Ottoman Empire in 1912. After World War II it became a strict communist state under Enver Hoxha that remained isolated for decades, transitioning to a democratic republic in the early 1990s.",
  "call": "+355",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "129",
   "amb": "127",
   "fire": "128"
  }
 },
 "AD": {
  "name": "Andorra",
  "pop": 81000,
  "popYear": 2024,
  "langs": [
   "Catalan",
   "Spanish",
   "French",
   "Portuguese"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Southwest Europe (Pyrenees)",
  "hist": "Andorra is a small mountain principality in the Pyrenees whose distinctive status dates to a medieval arrangement, traditionally linked to Charlemagne and formalized in the late 13th century, under which it is jointly governed by two co-princes: the President of France and the Bishop of Urgell in Spain. It adopted its first written constitution in 1993, becoming a parliamentary democracy while retaining the co-principality. Today it is known for duty-free shopping, skiing, and mountain tourism.",
  "call": "+376",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "110",
   "amb": "116",
   "fire": "118"
  }
 },
 "AT": {
  "name": "Austria",
  "pop": 9160000,
  "popYear": 2024,
  "langs": [
   "German"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Central Europe",
  "hist": "Austria was the heartland of the Habsburg dynasty, which ruled a vast multi-ethnic empire centered on Vienna for centuries and made the city a leading hub of European music, art, and imperial architecture. Following the collapse of the Austro-Hungarian Empire after World War I and annexation by Nazi Germany, Austria re-established itself as an independent republic in 1955 and adopted a policy of neutrality. It joined the European Union in 1995.",
  "call": "+43",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "133",
   "amb": "144",
   "fire": "122"
  }
 },
 "BY": {
  "name": "Belarus",
  "pop": 9100000,
  "popYear": 2024,
  "langs": [
   "Belarusian",
   "Russian"
  ],
  "cur": {
   "code": "BYN",
   "sym": "Br",
   "name": "Belarusian Ruble"
  },
  "region": "Eastern Europe",
  "hist": "Belarus occupies lands long contested among the Grand Duchy of Lithuania, the Polish-Lithuanian Commonwealth, and the Russian Empire, which shaped its layered cultural heritage. It became a founding republic of the Soviet Union and suffered severe destruction during World War II. Belarus declared independence in 1991 following the dissolution of the USSR and retains strong cultural and economic ties to Russia.",
  "call": "+375",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "102",
   "amb": "103",
   "fire": "101"
  }
 },
 "BE": {
  "name": "Belgium",
  "pop": 11800000,
  "popYear": 2024,
  "langs": [
   "Dutch",
   "French",
   "German"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Western Europe",
  "hist": "Belgium gained independence in 1830 after separating from the Netherlands, establishing a constitutional monarchy. Its position at the crossroads of Germanic and Latin Europe produced a federal state divided between Dutch-speaking Flanders and French-speaking Wallonia, with a bilingual capital in Brussels. Brussels today hosts the headquarters of the European Union and NATO, reinforcing the country's role as a center of European governance.",
  "call": "+32",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "101",
   "amb": "112",
   "fire": "112"
  }
 },
 "BA": {
  "name": "Bosnia and Herzegovina",
  "pop": 3160000,
  "popYear": 2024,
  "langs": [
   "Bosnian",
   "Serbian",
   "Croatian"
  ],
  "cur": {
   "code": "BAM",
   "sym": "KM",
   "name": "Convertible Mark"
  },
  "region": "Southeast Europe (Balkans)",
  "hist": "Bosnia and Herzegovina sits at a cultural crossroads shaped by centuries of Ottoman and then Austro-Hungarian rule, evident in the blend of mosques, churches, and Ottoman-era bridges in cities such as Mostar and Sarajevo. It was a constituent republic of Yugoslavia and declared independence in 1992, after which it experienced a war that ended with the 1995 Dayton Agreement. That accord established the country's present complex federal structure of two entities.",
  "call": "+387",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "122",
   "amb": "124",
   "fire": "123"
  }
 },
 "BG": {
  "name": "Bulgaria",
  "pop": 6450000,
  "popYear": 2024,
  "langs": [
   "Bulgarian"
  ],
  "cur": {
   "code": "BGN",
   "sym": "лв",
   "name": "Bulgarian Lev"
  },
  "region": "Southeast Europe (Balkans)",
  "hist": "Bulgaria traces its statehood to the First Bulgarian Empire founded in 681, an early medieval power that played a central role in the spread of Slavic culture and the Cyrillic script. After nearly five centuries under Ottoman rule, it regained independence in stages in the late 19th and early 20th centuries. Following a communist era within the Eastern Bloc, Bulgaria transitioned to democracy after 1989 and joined the European Union in 2007.",
  "call": "+359",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "166",
   "amb": "150",
   "fire": "160"
  }
 },
 "HR": {
  "name": "Croatia",
  "pop": 3850000,
  "popYear": 2024,
  "langs": [
   "Croatian"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Southeast Europe (Balkans)",
  "hist": "Croatia's long Adriatic coastline reflects centuries of Roman, Venetian, and Habsburg influence, visible in walled cities such as Dubrovnik and the Roman palace at Split. It was a constituent republic of Yugoslavia and declared independence in 1991, followed by a war in the early 1990s. Croatia joined the European Union in 2013 and adopted the euro in 2023, and is today a major Mediterranean tourism destination.",
  "call": "+385",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "192",
   "amb": "194",
   "fire": "193"
  }
 },
 "CY": {
  "name": "Cyprus",
  "pop": 1340000,
  "popYear": 2024,
  "langs": [
   "Greek",
   "Turkish",
   "English"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Eastern Mediterranean",
  "hist": "Cyprus, an island at the crossroads of Europe, Asia, and Africa, has been settled and ruled by many powers, including the Greeks, Romans, Byzantines, Venetians, Ottomans, and British. It gained independence from Britain in 1960. Since 1974 the island has been divided, with the internationally recognized Republic of Cyprus governing the south and a Turkish Cypriot administration in the north; the Republic joined the European Union in 2004.",
  "call": "+357",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "199",
   "amb": "199",
   "fire": "199"
  }
 },
 "CZ": {
  "name": "Czechia",
  "pop": 10900000,
  "popYear": 2024,
  "langs": [
   "Czech"
  ],
  "cur": {
   "code": "CZK",
   "sym": "Kč",
   "name": "Czech Koruna"
  },
  "region": "Central Europe",
  "hist": "Czechia, historically the lands of Bohemia and Moravia, was a center of the medieval Kingdom of Bohemia and later part of the Austro-Hungarian Empire, leaving Prague rich in Gothic, Renaissance, and Baroque architecture. It formed Czechoslovakia in 1918, endured Nazi occupation and a communist era, and saw the peaceful 1989 Velvet Revolution. The country split amicably from Slovakia in 1993 and joined the European Union in 2004.",
  "call": "+420",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "158",
   "amb": "155",
   "fire": "150"
  }
 },
 "DK": {
  "name": "Denmark",
  "pop": 5970000,
  "popYear": 2024,
  "langs": [
   "Danish"
  ],
  "cur": {
   "code": "DKK",
   "sym": "kr",
   "name": "Danish Krone"
  },
  "region": "Northern Europe (Scandinavia)",
  "hist": "Denmark is one of the oldest monarchies in Europe, with roots in the Viking Age when Danish seafarers ranged across the North Atlantic and into the British Isles. Once the center of a regional empire that included parts of Scandinavia, it gradually evolved into a modern constitutional monarchy following reforms in the mid-19th century. A founding member of NATO, Denmark joined the European Union in 1973 while retaining its own currency.",
  "call": "+45",
  "drive": "right",
  "plugs": [
   "C",
   "E",
   "F",
   "K"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "EE": {
  "name": "Estonia",
  "pop": 1370000,
  "popYear": 2024,
  "langs": [
   "Estonian"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Northern Europe (Baltic)",
  "hist": "Estonia, the northernmost Baltic state, was shaped over centuries by Danish, German, Swedish, and Russian rule, with a medieval Hanseatic heritage preserved in Tallinn's old town. It first achieved independence in 1918 but was annexed by the Soviet Union during World War II. Estonia restored its independence in 1991, joined the European Union and NATO in 2004, and has become known as a highly digital society.",
  "call": "+372",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "FI": {
  "name": "Finland",
  "pop": 5610000,
  "popYear": 2024,
  "langs": [
   "Finnish",
   "Swedish"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Northern Europe (Nordic)",
  "hist": "Finland spent centuries under Swedish rule before becoming an autonomous grand duchy within the Russian Empire in 1809, influences still reflected in its bilingual heritage. It declared independence in 1917 amid the Russian Revolution and defended its sovereignty during World War II. Finland joined the European Union in 1995, adopted the euro, and joined NATO in 2023; it is known for its lakes, forests, and northern landscapes.",
  "call": "+358",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "FR": {
  "name": "France",
  "pop": 68400000,
  "popYear": 2024,
  "langs": [
   "French"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Western Europe",
  "hist": "France emerged from the kingdom of the Franks and became one of Europe's dominant powers under its monarchy, before the 1789 French Revolution reshaped its politics and influenced movements worldwide. The Napoleonic era, two world wars, and the loss of a colonial empire defined its modern transformation into the present Fifth Republic, established in 1958. A founding member of the European Union, France remains a global center of art, cuisine, and culture.",
  "call": "+33",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "17",
   "amb": "15",
   "fire": "18"
  }
 },
 "DE": {
  "name": "Germany",
  "pop": 83500000,
  "popYear": 2024,
  "langs": [
   "German"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Central Europe",
  "hist": "Germany was long a patchwork of states within the Holy Roman Empire before unification into a single nation in 1871. Defeat in two world wars in the 20th century led to division into West and East Germany during the Cold War, symbolized by the Berlin Wall. The country was peacefully reunified in 1990 and is today the European Union's most populous member and a leading economic power.",
  "call": "+49",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "110",
   "amb": "112",
   "fire": "112"
  }
 },
 "GR": {
  "name": "Greece",
  "pop": 10400000,
  "popYear": 2024,
  "langs": [
   "Greek"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Southeast Europe (Mediterranean)",
  "hist": "Greece is widely regarded as a cradle of Western civilization, home to ancient city-states such as Athens and Sparta and the origins of democracy, philosophy, and classical architecture. After centuries within the Byzantine and then Ottoman empires, it won independence in the 1820s and 1830s. A republic since the mid-1970s, Greece joined the European Union in 1981 and draws visitors to its antiquities and Aegean islands.",
  "call": "+30",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "100",
   "amb": "166",
   "fire": "199"
  }
 },
 "HU": {
  "name": "Hungary",
  "pop": 9580000,
  "popYear": 2024,
  "langs": [
   "Hungarian"
  ],
  "cur": {
   "code": "HUF",
   "sym": "Ft",
   "name": "Hungarian Forint"
  },
  "region": "Central Europe",
  "hist": "Hungary was founded as a Christian kingdom around the year 1000 under King Stephen I, with the Magyar people giving the country its distinctive language unrelated to most of its neighbors. It later formed half of the Austro-Hungarian Empire, leaving Budapest with grand imperial-era architecture. After a communist period within the Eastern Bloc, Hungary transitioned to democracy in 1989 and joined the European Union in 2004.",
  "call": "+36",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "107",
   "amb": "104",
   "fire": "105"
  }
 },
 "IS": {
  "name": "Iceland",
  "pop": 390000,
  "popYear": 2024,
  "langs": [
   "Icelandic"
  ],
  "cur": {
   "code": "ISK",
   "sym": "kr",
   "name": "Icelandic Króna"
  },
  "region": "Northern Europe (North Atlantic)",
  "hist": "Iceland was settled largely by Norse and Celtic peoples in the late 9th and 10th centuries and established the Althing, one of the world's oldest parliaments, around 930. It remained under Norwegian and later Danish rule for centuries before gaining full independence as a republic in 1944. Known for volcanoes, glaciers, and geothermal activity, it is a major destination for nature-based tourism.",
  "call": "+354",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "IE": {
  "name": "Ireland",
  "pop": 5300000,
  "popYear": 2024,
  "langs": [
   "English",
   "Irish"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Northern Europe (British Isles)",
  "hist": "Ireland has a rich Celtic and early Christian heritage, with monastic sites and a Gaelic language tradition that endured centuries of English and later British rule. After a long independence struggle, most of the island became the Irish Free State in 1922 and a fully sovereign republic by 1949, while Northern Ireland remained part of the United Kingdom. Ireland joined the European Economic Community in 1973 and is known for its literature, music, and green landscapes.",
  "call": "+353",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "999",
   "amb": "999",
   "fire": "999"
  }
 },
 "IT": {
  "name": "Italy",
  "pop": 58900000,
  "popYear": 2024,
  "langs": [
   "Italian"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Southern Europe (Mediterranean)",
  "hist": "Italy was the heart of the Roman Empire and later the birthplace of the Renaissance, leaving an extraordinary legacy of art, architecture, and ruins across cities such as Rome, Florence, and Venice. Long divided into independent states, the peninsula was unified into a single kingdom in 1861 and became a republic in 1946 after World War II. A founding member of the European Union, Italy is among the world's most visited countries.",
  "call": "+39",
  "drive": "right",
  "plugs": [
   "C",
   "F",
   "L"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "113",
   "amb": "118",
   "fire": "115"
  }
 },
 "XK": {
  "name": "Kosovo",
  "pop": 1660000,
  "popYear": 2024,
  "langs": [
   "Albanian",
   "Serbian"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Southeast Europe (Balkans)",
  "hist": "Kosovo was long part of the Ottoman Empire and later Yugoslavia, holding deep historical significance for both Albanian and Serbian communities. Following conflict in the late 1990s, it was placed under United Nations administration. Kosovo declared independence in 2008, a status recognized by many but not all states. Today the capital Pristina blends Ottoman-era sites with a young, lively population.",
  "call": null,
  "drive": null,
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "192",
   "amb": "194",
   "fire": "193"
  }
 },
 "LV": {
  "name": "Latvia",
  "pop": 1871000,
  "popYear": 2024,
  "langs": [
   "Latvian",
   "Russian"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Baltic States",
  "hist": "Latvia's lands were shaped by centuries of Baltic German, Polish, Swedish, and Russian influence before it first gained independence in 1918. It was incorporated into the Soviet Union during World War II and regained independence in 1991. Latvia joined the European Union and NATO in 2004 and adopted the euro in 2014. The capital Riga is renowned for one of Europe's largest collections of Art Nouveau architecture.",
  "call": "+371",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "110",
   "amb": "113"
  }
 },
 "LI": {
  "name": "Liechtenstein",
  "pop": 40000,
  "popYear": 2024,
  "langs": [
   "German"
  ],
  "cur": {
   "code": "CHF",
   "sym": "CHF",
   "name": "Swiss Franc"
  },
  "region": "Western Europe (Alpine)",
  "hist": "Liechtenstein became a sovereign principality within the Holy Roman Empire in 1719 and gained full independence in 1806. A microstate nestled between Switzerland and Austria, it has maintained a close customs and monetary union with Switzerland since the 1920s. Ruled by the Princely House of Liechtenstein, it is known for Vaduz Castle, alpine scenery, and a strong financial sector.",
  "call": "+423",
  "drive": "right",
  "plugs": [
   "C",
   "J"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "117",
   "amb": "144",
   "fire": "118"
  }
 },
 "LT": {
  "name": "Lithuania",
  "pop": 2886000,
  "popYear": 2024,
  "langs": [
   "Lithuanian",
   "Russian",
   "Polish"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Baltic States",
  "hist": "Medieval Lithuania grew into one of Europe's largest states through union with Poland, forming the Polish-Lithuanian Commonwealth. After periods under the Russian Empire, it declared independence in 1918, was absorbed into the Soviet Union during World War II, and restored independence in 1990-1991. It joined the EU and NATO in 2004. The capital Vilnius is celebrated for its UNESCO-listed Baroque old town.",
  "call": "+370",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "LU": {
  "name": "Luxembourg",
  "pop": 672000,
  "popYear": 2024,
  "langs": [
   "Luxembourgish",
   "French",
   "German"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Western Europe",
  "hist": "Founded around a 10th-century castle, Luxembourg became a Grand Duchy in 1815 and achieved full independence over the following decades. A founding member of the European Union and host to several EU institutions, it is one of the world's wealthiest nations per capita. The capital's fortified old quarter is a UNESCO World Heritage Site, and the country is notably multilingual.",
  "call": "+352",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "113",
   "amb": "112",
   "fire": "112"
  }
 },
 "MT": {
  "name": "Malta",
  "pop": 563000,
  "popYear": 2024,
  "langs": [
   "Maltese",
   "English"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Southern Europe (Mediterranean)",
  "hist": "Malta's strategic Mediterranean position drew Phoenicians, Romans, Arabs, the Knights of St. John, and the British over the centuries. The Knights built the fortified capital Valletta in the 16th century, while British rule lasted until independence in 1964. Malta joined the European Union in 2004 and adopted the euro in 2008. Its megalithic temples are among the oldest free-standing structures on Earth.",
  "call": "+356",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "MD": {
  "name": "Moldova",
  "pop": 2425000,
  "popYear": 2024,
  "langs": [
   "Romanian",
   "Russian"
  ],
  "cur": {
   "code": "MDL",
   "sym": "L",
   "name": "Moldovan Leu"
  },
  "region": "Eastern Europe",
  "hist": "The region of Moldova was historically part of the principality of Moldavia and later the Russian Empire and Romania. It became a Soviet republic and declared independence in 1991. The breakaway Transnistria region remains outside central government control. The capital Chisinau and the surrounding countryside are known for extensive vineyards and a long winemaking tradition.",
  "call": "+373",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "MC": {
  "name": "Monaco",
  "pop": 38000,
  "popYear": 2024,
  "langs": [
   "French",
   "Monégasque",
   "Italian"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Western Europe (Mediterranean)",
  "hist": "Monaco has been governed by the Grimaldi family since the late 13th century, making it one of the world's oldest ruling dynasties. This tiny Mediterranean principality formalized its sovereignty in treaties with France over the 19th and 20th centuries. It is famous for the Monte Carlo casino, the annual Formula 1 Grand Prix, and its harbor lined with yachts. Despite its small size, it is among the most densely populated states in the world.",
  "call": "+377",
  "drive": "right",
  "plugs": [
   "C",
   "D",
   "E",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "17",
   "amb": "18",
   "fire": "18"
  }
 },
 "ME": {
  "name": "Montenegro",
  "pop": 617000,
  "popYear": 2024,
  "langs": [
   "Montenegrin",
   "Serbian",
   "Bosnian",
   "Albanian"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Southeast Europe (Balkans)",
  "hist": "Montenegro has a long history as a distinct principality and kingdom in the Balkans before joining Yugoslavia in the 20th century. It remained in a union with Serbia after Yugoslavia's breakup, then became fully independent following a 2006 referendum. It joined NATO in 2017 and is an EU candidate. The country is known for its dramatic Adriatic coastline, the Bay of Kotor, and rugged mountain interior.",
  "call": "+382",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "122",
   "amb": "124",
   "fire": "123"
  }
 },
 "NL": {
  "name": "Netherlands",
  "pop": 17900000,
  "popYear": 2024,
  "langs": [
   "Dutch",
   "English",
   "Frisian"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Western Europe",
  "hist": "The Dutch provinces gained independence from Spain in the 17th century, an era of global trade, exploration, and art known as the Golden Age. The modern Kingdom of the Netherlands was established in 1815. A founding member of the European Union, the country is famed for its canals, windmills, cycling culture, and extensive land reclaimed from the sea. Amsterdam's historic canal ring is a UNESCO World Heritage Site.",
  "call": "+31",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "MK": {
  "name": "North Macedonia",
  "pop": 1830000,
  "popYear": 2024,
  "langs": [
   "Macedonian",
   "Albanian"
  ],
  "cur": {
   "code": "MKD",
   "sym": "ден",
   "name": "Macedonian Denar"
  },
  "region": "Southeast Europe (Balkans)",
  "hist": "The region holds ancient roots tied to the historic kingdom of Macedon and was later part of the Ottoman Empire and Yugoslavia. It declared independence in 1991 and adopted the name North Macedonia in 2019 following a naming agreement with Greece. It joined NATO in 2020 and is an EU candidate. The capital Skopje and the lakeside town of Ohrid, a UNESCO site, are popular destinations.",
  "call": "+389",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "192",
   "amb": "194",
   "fire": "193"
  }
 },
 "NO": {
  "name": "Norway",
  "pop": 5550000,
  "popYear": 2024,
  "langs": [
   "Norwegian",
   "Sami"
  ],
  "cur": {
   "code": "NOK",
   "sym": "kr",
   "name": "Norwegian Krone"
  },
  "region": "Northern Europe (Scandinavia)",
  "hist": "Norway was a center of Viking seafaring before entering unions with Denmark and later Sweden, gaining full independence in 1905. The discovery of offshore oil in the late 20th century transformed it into one of the world's wealthiest nations. A constitutional monarchy, it remains outside the EU. Visitors are drawn to its dramatic fjords, northern lights, and midnight sun.",
  "call": "+47",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "112",
   "amb": "113",
   "fire": "110"
  }
 },
 "PL": {
  "name": "Poland",
  "pop": 36700000,
  "popYear": 2024,
  "langs": [
   "Polish"
  ],
  "cur": {
   "code": "PLN",
   "sym": "zł",
   "name": "Polish Zloty"
  },
  "region": "Central Europe",
  "hist": "Poland emerged as a kingdom over a thousand years ago and once formed the vast Polish-Lithuanian Commonwealth. Partitioned out of existence in the late 18th century, it regained independence in 1918, endured occupation in World War II, and lived under communist rule until 1989. It joined the EU in 2004. Cities such as Krakow and Warsaw showcase carefully restored historic centers and a rich cultural heritage.",
  "call": "+48",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "997",
   "amb": "999",
   "fire": "998"
  }
 },
 "PT": {
  "name": "Portugal",
  "pop": 10640000,
  "popYear": 2024,
  "langs": [
   "Portuguese"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Southern Europe (Iberia)",
  "hist": "Portugal is one of Europe's oldest nation-states, with borders largely set in the 13th century. During the Age of Discovery it built a far-reaching maritime empire that spread the Portuguese language worldwide. A 1974 revolution ended decades of authoritarian rule and ushered in democracy, and the country joined the European Community in 1986. Lisbon, Porto, and the Algarve coast are leading tourist draws.",
  "call": "+351",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "fire": "117"
  }
 },
 "RO": {
  "name": "Romania",
  "pop": 19000000,
  "popYear": 2024,
  "langs": [
   "Romanian",
   "Hungarian"
  ],
  "cur": {
   "code": "RON",
   "sym": "lei",
   "name": "Romanian Leu"
  },
  "region": "Southeast Europe",
  "hist": "Romania formed in the 19th century through the union of the principalities of Wallachia and Moldavia and gained full independence from the Ottoman Empire in 1878. It became a communist state after World War II until a 1989 revolution restored democracy. It joined the EU in 2007. The country is known for the medieval towns and castles of Transylvania, the Carpathian Mountains, and the Danube Delta.",
  "call": "+40",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "RU": {
  "name": "Russia",
  "pop": 146000000,
  "popYear": 2024,
  "langs": [
   "Russian"
  ],
  "cur": {
   "code": "RUB",
   "sym": "₽",
   "name": "Russian Ruble"
  },
  "region": "Eastern Europe / Northern Asia",
  "hist": "Russia grew from the medieval state of Kievan Rus and the Grand Duchy of Moscow into a vast empire spanning Europe and Asia. The 1917 revolution established the Soviet Union, which dissolved in 1991 to form the modern Russian Federation. It is the largest country in the world by land area, spanning eleven time zones. Moscow's Red Square and Kremlin and St. Petersburg's imperial palaces are its best-known landmarks.",
  "call": "+7",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "102",
   "amb": "103",
   "fire": "101"
  }
 },
 "SM": {
  "name": "San Marino",
  "pop": 34000,
  "popYear": 2024,
  "langs": [
   "Italian"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Southern Europe",
  "hist": "San Marino claims to be the world's oldest surviving republic, traditionally founded in the year 301. This small landlocked microstate is entirely surrounded by Italy and perched around Monte Titano. It has maintained its independence and republican institutions for centuries. The historic center and Mount Titano are a UNESCO World Heritage Site offering sweeping views over the surrounding countryside.",
  "call": "+378",
  "drive": "right",
  "plugs": [
   "C",
   "F",
   "L"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "113",
   "police": "113",
   "amb": "118",
   "fire": "115"
  }
 },
 "RS": {
  "name": "Serbia",
  "pop": 6620000,
  "popYear": 2024,
  "langs": [
   "Serbian",
   "Hungarian"
  ],
  "cur": {
   "code": "RSD",
   "sym": "дин.",
   "name": "Serbian Dinar"
  },
  "region": "Southeast Europe (Balkans)",
  "hist": "Serbia traces its roots to a medieval kingdom before centuries under Ottoman rule, regaining independence in the 19th century. It was a core part of Yugoslavia throughout the 20th century until that federation broke apart in a series of conflicts. Serbia is an EU candidate today. The capital Belgrade, set where the Sava and Danube rivers meet, is known for its historic fortress and energetic nightlife.",
  "call": "+381",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "192",
   "amb": "194",
   "fire": "193"
  }
 },
 "SK": {
  "name": "Slovakia",
  "pop": 5430000,
  "popYear": 2024,
  "langs": [
   "Slovak",
   "Hungarian"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Central Europe",
  "hist": "Slovak lands were long part of the Kingdom of Hungary and later the Austro-Hungarian Empire before joining Czechoslovakia in 1918. After the fall of communism, Slovakia became an independent state in 1993 through the peaceful 'Velvet Divorce' from the Czech Republic. It joined the EU in 2004 and adopted the euro in 2009. The capital Bratislava sits on the Danube near the Austrian border, beneath its hilltop castle.",
  "call": "+421",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "158",
   "amb": "155",
   "fire": "150"
  }
 },
 "SI": {
  "name": "Slovenia",
  "pop": 2120000,
  "popYear": 2024,
  "langs": [
   "Slovenian"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Central Europe",
  "hist": "Slovenian lands spent centuries under Habsburg rule before joining Yugoslavia after World War I. Slovenia became independent in 1991 following a brief conflict, and was the first former Yugoslav republic to join the EU, in 2004, adopting the euro in 2007. Compact and largely Alpine, it is known for Lake Bled, the capital Ljubljana, and extensive cave systems such as Postojna.",
  "call": "+386",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "113",
   "amb": "112",
   "fire": "112"
  }
 },
 "ES": {
  "name": "Spain",
  "pop": 48797875,
  "popYear": 2024,
  "langs": [
   "Spanish",
   "Catalan",
   "Galician",
   "Basque"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Southern Europe",
  "hist": "The Iberian Peninsula was settled successively by Celtiberian peoples, Romans, and Visigoths, then largely incorporated into Muslim Al-Andalus from the eighth century, leaving lasting marks on architecture and language. The Christian Reconquista culminated in 1492 with the union of Castile and Aragon and the start of overseas empire. Modern Spain transitioned to democracy and a parliamentary monarchy after 1975 and joined the European Community in 1986. Its strong regional identities, reflected in distinct languages and traditions, shape much of its cultural life today.",
  "call": "+34",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "091",
   "amb": "061",
   "fire": "080"
  }
 },
 "SE": {
  "name": "Sweden",
  "pop": 10587700,
  "popYear": 2024,
  "langs": [
   "Swedish",
   "English"
  ],
  "cur": {
   "code": "SEK",
   "sym": "kr",
   "name": "Swedish krona"
  },
  "region": "Northern Europe",
  "hist": "Sweden consolidated as a kingdom during the medieval period and became a major European power in the seventeenth century before its territorial reach receded. It has remained outside major armed conflicts since the early nineteenth century, maintaining a policy of non-alignment for much of the modern era. During the twentieth century it developed an extensive welfare state and joined the European Union in 1995. English is very widely spoken, making travel accessible for international visitors.",
  "call": "+46",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "CH": {
  "name": "Switzerland",
  "pop": 9051029,
  "popYear": 2024,
  "langs": [
   "German",
   "French",
   "Italian",
   "Romansh"
  ],
  "cur": {
   "code": "CHF",
   "sym": "CHF",
   "name": "Swiss franc"
  },
  "region": "Western Europe",
  "hist": "The Swiss Confederation traces its origins to an alliance of cantons formed in the late thirteenth century, gradually expanding into the federal state established in 1848. Long associated with a policy of armed neutrality, it remained outside both World Wars and is not a member of the European Union. Its four national language regions reflect a decentralized political culture built on cantonal autonomy and direct democracy. Geneva and other cities host numerous international organizations, including United Nations agencies and the Red Cross.",
  "call": "+41",
  "drive": "right",
  "plugs": [
   "C",
   "J"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "117",
   "amb": "144",
   "fire": "118"
  }
 },
 "UA": {
  "name": "Ukraine",
  "pop": 37937821,
  "popYear": 2024,
  "langs": [
   "Ukrainian",
   "Russian"
  ],
  "cur": {
   "code": "UAH",
   "sym": "₴",
   "name": "Ukrainian hryvnia"
  },
  "region": "Eastern Europe",
  "hist": "The medieval state of Kyivan Rus, centered on Kyiv, is a foundational reference point for the region's culture and Orthodox Christian heritage. Ukrainian lands were later divided among neighboring powers and incorporated into the Russian Empire and subsequently the Soviet Union. Ukraine declared independence in 1991 following the dissolution of the USSR. Its capital, Kyiv, and cities such as Lviv preserve extensive architectural and cultural landmarks; travelers should consult current advisories before planning a visit.",
  "call": "+380",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "102",
   "amb": "103",
   "fire": "101"
  }
 },
 "GB": {
  "name": "United Kingdom",
  "pop": 69281400,
  "popYear": 2024,
  "langs": [
   "English",
   "Welsh",
   "Scottish Gaelic"
  ],
  "cur": {
   "code": "GBP",
   "sym": "£",
   "name": "Pound sterling"
  },
  "region": "Northern Europe",
  "hist": "The United Kingdom emerged through the political union of England, Scotland, Wales, and Ireland, formalized over the seventeenth to nineteenth centuries, with Northern Ireland remaining after the partition of Ireland. As the center of a global empire and the birthplace of the Industrial Revolution, it shaped worldwide trade, language, and institutions. It is a parliamentary democracy and constitutional monarchy and left the European Union in 2020. London, Edinburgh, and many historic towns offer extensive cultural and architectural sites for visitors.",
  "call": "+44",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "999",
   "police": "112",
   "amb": "112",
   "fire": "112"
  }
 },
 "VA": {
  "name": "Vatican City",
  "pop": 496,
  "popYear": 2024,
  "langs": [
   "Italian",
   "Latin"
  ],
  "cur": {
   "code": "EUR",
   "sym": "€",
   "name": "Euro"
  },
  "region": "Southern Europe",
  "hist": "Vatican City was established as an independent sovereign state in 1929 under the Lateran Treaty, settling the status of the papacy within Rome. It is the smallest internationally recognized independent state and serves as the spiritual and administrative seat of the Roman Catholic Church, governed by the Holy See. Within its walls are St. Peter's Basilica, the Vatican Museums, and the Sistine Chapel, which draw large numbers of visitors. It uses the euro under a formal agreement, though it is not a European Union member.",
  "call": "+379",
  "drive": "right",
  "plugs": [
   "C",
   "F",
   "L"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "113",
   "amb": "118",
   "fire": "115"
  }
 },
 "AG": {
  "name": "Antigua and Barbuda",
  "pop": 94298,
  "popYear": 2023,
  "langs": [
   "English",
   "Antiguan Creole"
  ],
  "cur": {
   "code": "XCD",
   "sym": "$",
   "name": "East Caribbean Dollar"
  },
  "region": "Caribbean",
  "hist": "The islands were inhabited by Arawak and Carib peoples before European contact, with Christopher Columbus sighting Antigua in 1493. Britain colonized Antigua in the early 17th century, developing a sugar plantation economy reliant on enslaved African labor. Antigua and Barbuda gained full independence from the United Kingdom in 1981 and remains a member of the Commonwealth, with tourism centered on its beaches now driving the economy.",
  "call": "+1",
  "drive": "left",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "230V",
  "freq": "60Hz",
  "emerg": {
   "all": "911",
   "police": "999",
   "amb": "999",
   "fire": "999"
  }
 },
 "AR": {
  "name": "Argentina",
  "pop": 46654581,
  "popYear": 2024,
  "langs": [
   "Spanish",
   "Italian",
   "English"
  ],
  "cur": {
   "code": "ARS",
   "sym": "$",
   "name": "Argentine Peso"
  },
  "region": "Southern South America",
  "hist": "Indigenous peoples inhabited the region before Spanish colonization began in the 16th century, with Buenos Aires founded permanently in 1580. Argentina declared independence from Spain in 1816 following the May Revolution of 1810. Large-scale European immigration in the late 19th and early 20th centuries, particularly from Italy and Spain, profoundly shaped the nation's culture, cuisine, and the distinctive character of cities like Buenos Aires.",
  "call": "+54",
  "drive": "right",
  "plugs": [
   "I"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "911",
   "police": "101",
   "amb": "107",
   "fire": "100"
  }
 },
 "BS": {
  "name": "Bahamas",
  "pop": 412623,
  "popYear": 2023,
  "langs": [
   "English",
   "Bahamian Creole"
  ],
  "cur": {
   "code": "BSD",
   "sym": "$",
   "name": "Bahamian Dollar"
  },
  "region": "Caribbean",
  "hist": "The Lucayan people inhabited the archipelago when Columbus made his first New World landfall here in 1492. The islands became a British colony and were known as a base for piracy in the early 18th century before plantation settlement. The Bahamas achieved independence from the United Kingdom in 1973 and developed into a major tourism and offshore finance center, with proximity to the United States shaping its economy.",
  "call": "+1",
  "drive": "left",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911",
   "police": "919",
   "amb": "919",
   "fire": "919"
  }
 },
 "BB": {
  "name": "Barbados",
  "pop": 281635,
  "popYear": 2023,
  "langs": [
   "English",
   "Bajan Creole"
  ],
  "cur": {
   "code": "BBD",
   "sym": "$",
   "name": "Barbadian Dollar"
  },
  "region": "Caribbean",
  "hist": "Settled by Indigenous peoples and later largely depopulated before English colonization began in 1627, Barbados became a wealthy sugar colony built on enslaved African labor. Its long, uninterrupted period under British rule earned it the nickname 'Little England.' The island gained independence in 1966 and transitioned from a constitutional monarchy to a parliamentary republic in 2021, removing the British monarch as head of state.",
  "call": "+1",
  "drive": "left",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "115V",
  "freq": "50Hz",
  "emerg": {
   "police": "211",
   "amb": "511",
   "fire": "311"
  }
 },
 "BZ": {
  "name": "Belize",
  "pop": 410825,
  "popYear": 2023,
  "langs": [
   "English",
   "Spanish",
   "Belizean Creole",
   "Mayan languages",
   "Garifuna"
  ],
  "cur": {
   "code": "BZD",
   "sym": "$",
   "name": "Belize Dollar"
  },
  "region": "Central America",
  "hist": "The region was a heartland of ancient Maya civilization, whose ruins remain a major draw for visitors. Britain established settlements based on logwood and mahogany extraction, and the territory became the colony of British Honduras. It was renamed Belize in 1973 and gained independence in 1981, retaining English as its official language and forming a cultural bridge between the Caribbean and Central America.",
  "call": "+501",
  "drive": "right",
  "plugs": [
   "A",
   "B",
   "G"
  ],
  "volt": "110V",
  "freq": "60Hz",
  "emerg": {
   "all": "911"
  }
 },
 "BO": {
  "name": "Bolivia",
  "pop": 12388571,
  "popYear": 2024,
  "langs": [
   "Spanish",
   "Quechua",
   "Aymara",
   "Guarani"
  ],
  "cur": {
   "code": "BOB",
   "sym": "Bs.",
   "name": "Boliviano"
  },
  "region": "Western South America",
  "hist": "The Andean highlands were home to the Tiwanaku culture and later part of the Inca Empire before Spanish conquest in the 16th century, when the silver mines of Potosi made the region immensely valuable to the Spanish crown. Bolivia declared independence in 1825, naming itself after the liberator Simon Bolivar. It has the largest proportion of Indigenous people in the Americas, and Andean languages and traditions remain central to its identity, with administrative functions split between La Paz and constitutional capital Sucre.",
  "call": "+591",
  "drive": "right",
  "plugs": [
   "A",
   "B",
   "C"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "911",
   "police": "110",
   "amb": "118",
   "fire": "119"
  }
 },
 "BR": {
  "name": "Brazil",
  "pop": 203080756,
  "popYear": 2022,
  "langs": [
   "Portuguese"
  ],
  "cur": {
   "code": "BRL",
   "sym": "R$",
   "name": "Brazilian Real"
  },
  "region": "South America",
  "hist": "Home to numerous Indigenous peoples, Brazil was claimed by Portugal in 1500 and became its largest colony, with an economy long shaped by sugar, gold, and the labor of millions of enslaved Africans. It became the seat of the Portuguese court during the Napoleonic era and declared independence as an empire in 1822, becoming a republic in 1889. The blend of Indigenous, Portuguese, and African heritage defines its language, music, and cuisine, with major centers in Rio de Janeiro, Sao Paulo, and the capital Brasilia.",
  "call": "+55",
  "drive": "right",
  "plugs": [
   "C",
   "N"
  ],
  "volt": "127V",
  "freq": "60Hz",
  "emerg": {
   "police": "190",
   "amb": "192",
   "fire": "193"
  }
 },
 "CA": {
  "name": "Canada",
  "pop": 40097761,
  "popYear": 2023,
  "langs": [
   "English",
   "French"
  ],
  "cur": {
   "code": "CAD",
   "sym": "$",
   "name": "Canadian Dollar"
  },
  "region": "Northern America",
  "hist": "Inhabited for millennia by diverse First Nations, Inuit, and later Metis peoples, the land saw French and British colonization beginning in the 16th and 17th centuries, leaving a lasting bilingual legacy. The Confederation of 1867 united several British colonies into a self-governing dominion, with full legislative independence achieved gradually through the 20th century. Today Canada is officially bilingual, with French concentrated in Quebec, and is shaped by extensive immigration and a federal parliamentary system.",
  "call": "+1",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911"
  }
 },
 "CL": {
  "name": "Chile",
  "pop": 19629590,
  "popYear": 2023,
  "langs": [
   "Spanish",
   "Mapudungun"
  ],
  "cur": {
   "code": "CLP",
   "sym": "$",
   "name": "Chilean Peso"
  },
  "region": "Southern South America",
  "hist": "The Mapuche and other Indigenous peoples inhabited this long, narrow land before Spanish colonization in the 16th century. Chile declared independence from Spain in 1818 after a prolonged struggle. Spanning deserts in the north to glaciers in the south, the country developed a strong national identity, and after a period of military rule in the late 20th century it returned to democratic governance, with Santiago as its principal city.",
  "call": "+56",
  "drive": "right",
  "plugs": [
   "C",
   "L"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "133",
   "amb": "131",
   "fire": "132"
  }
 },
 "CO": {
  "name": "Colombia",
  "pop": 52215503,
  "popYear": 2023,
  "langs": [
   "Spanish"
  ],
  "cur": {
   "code": "COP",
   "sym": "$",
   "name": "Colombian Peso"
  },
  "region": "Northern South America",
  "hist": "Indigenous cultures including the Muisca thrived before Spanish colonization began in the early 16th century, with Cartagena becoming a key colonial port. The territory gained independence from Spain in the 1810s-1820s as part of Simon Bolivar's Gran Colombia, which later dissolved into separate nations. Colombia's culture blends Indigenous, Spanish, and African influences, and after decades of internal conflict the country has seen growing tourism to cities such as Bogota, Medellin, and the Caribbean coast.",
  "call": "+57",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "110V",
  "freq": "60Hz",
  "emerg": {
   "all": "123",
   "police": "112",
   "amb": "125",
   "fire": "119"
  }
 },
 "CR": {
  "name": "Costa Rica",
  "pop": 5212173,
  "popYear": 2023,
  "langs": [
   "Spanish"
  ],
  "cur": {
   "code": "CRC",
   "sym": "₡",
   "name": "Costa Rican Colon"
  },
  "region": "Central America",
  "hist": "Inhabited by Indigenous peoples at the crossroads of Mesoamerican and Andean cultures, the region was colonized by Spain but remained a relatively poor, sparsely settled backwater. Costa Rica gained independence from Spain in 1821 as part of Central America and became fully sovereign soon after. Notably, it abolished its standing army in 1948, and today it is known for political stability and extensive national parks that make it a leading ecotourism destination.",
  "call": "+506",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911"
  }
 },
 "CU": {
  "name": "Cuba",
  "pop": 10985974,
  "popYear": 2023,
  "langs": [
   "Spanish"
  ],
  "cur": {
   "code": "CUP",
   "sym": "$",
   "name": "Cuban Peso"
  },
  "region": "Caribbean",
  "hist": "Inhabited by the Taino before Columbus arrived in 1492, Cuba became a strategic Spanish colony and a center of sugar and tobacco production worked by enslaved Africans. It gained independence following the Spanish-American War of 1898 and a subsequent period of U.S. influence. The 1959 revolution led by Fidel Castro established a one-party socialist state, and Havana's colonial architecture, music, and vintage cars are emblematic of the island's culture.",
  "call": "+53",
  "drive": "right",
  "plugs": [
   "A",
   "B",
   "C",
   "L"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "police": "106",
   "amb": "104",
   "fire": "105"
  }
 },
 "DM": {
  "name": "Dominica",
  "pop": 73040,
  "popYear": 2023,
  "langs": [
   "English",
   "Dominican Creole French"
  ],
  "cur": {
   "code": "XCD",
   "sym": "$",
   "name": "East Caribbean Dollar"
  },
  "region": "Caribbean",
  "hist": "Dominica retains one of the Caribbean's last surviving Indigenous Kalinago communities, who resisted European settlement for generations. Contested between France and Britain, the island ultimately came under British control, leaving a legacy of both English and a French-based Creole. It gained independence in 1978 and is known as the 'Nature Isle' for its rainforests, hot springs, and rugged volcanic terrain that draw eco-travelers.",
  "call": "+1",
  "drive": "left",
  "plugs": [
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "999"
  }
 },
 "DO": {
  "name": "Dominican Republic",
  "pop": 11332972,
  "popYear": 2023,
  "langs": [
   "Spanish"
  ],
  "cur": {
   "code": "DOP",
   "sym": "RD$",
   "name": "Dominican Peso"
  },
  "region": "Caribbean",
  "hist": "Sharing the island of Hispaniola with Haiti, the territory was the site of Santo Domingo, the oldest continuously inhabited European-founded city in the Americas, established around 1496. After periods of Spanish, French, and Haitian rule, the Dominican Republic declared independence from Haiti in 1844. Its culture blends Spanish, African, and Taino influences, and its beaches and colonial Santo Domingo make it the most-visited Caribbean destination.",
  "call": "+1",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911"
  }
 },
 "EC": {
  "name": "Ecuador",
  "pop": 17483000,
  "popYear": 2023,
  "langs": [
   "Spanish",
   "Quechua"
  ],
  "cur": {
   "code": "USD",
   "sym": "$",
   "name": "United States Dollar"
  },
  "region": "Western South America",
  "hist": "Part of the Inca Empire before Spanish conquest in the 16th century, the region centered on Quito, whose well-preserved colonial center is a UNESCO site. Ecuador gained independence from Spain in the 1820s and separated from Gran Colombia in 1830. Named for the equator that crosses it, the country adopted the U.S. dollar as its currency in 2000 and is famed for the Galapagos Islands and Andean Indigenous cultures.",
  "call": "+593",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911",
   "police": "101",
   "amb": "131",
   "fire": "102"
  }
 },
 "SV": {
  "name": "El Salvador",
  "pop": 6314167,
  "popYear": 2023,
  "langs": [
   "Spanish"
  ],
  "cur": {
   "code": "USD",
   "sym": "$",
   "name": "United States Dollar"
  },
  "region": "Central America",
  "hist": "Inhabited by the Pipil and other Indigenous peoples, the region was colonized by Spain in the 16th century. El Salvador gained independence in 1821 and briefly belonged to the Central American Federation. The smallest and most densely populated Central American nation, it endured a civil war in the 1980s, adopted the U.S. dollar in 2001, and more recently made bitcoin legal tender, reflecting an evolving economic identity.",
  "call": "+503",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911",
   "amb": "132",
   "fire": "913"
  }
 },
 "GD": {
  "name": "Grenada",
  "pop": 117207,
  "popYear": 2023,
  "langs": [
   "English",
   "Grenadian Creole"
  ],
  "cur": {
   "code": "XCD",
   "sym": "$",
   "name": "East Caribbean Dollar"
  },
  "region": "Caribbean",
  "hist": "Originally inhabited by Indigenous Caribs, Grenada was colonized first by France and later by Britain, which shaped its plantation economy and place names. Known as the 'Spice Isle' for its nutmeg and mace production, it gained independence in 1974. A period of political turmoil in the early 1980s ended after a brief U.S.-led intervention in 1983, and the island has since become a stable tourism and spice-export economy.",
  "call": "+1",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "911"
  }
 },
 "GT": {
  "name": "Guatemala",
  "pop": 17602431,
  "popYear": 2023,
  "langs": [
   "Spanish",
   "Mayan languages"
  ],
  "cur": {
   "code": "GTQ",
   "sym": "Q",
   "name": "Guatemalan Quetzal"
  },
  "region": "Central America",
  "hist": "Guatemala was a core region of the ancient Maya civilization, whose monumental sites such as Tikal remain major attractions. Spanish conquest in the 16th century established colonial cities including Antigua Guatemala, and the country gained independence in 1821. Home to one of the largest Indigenous populations in the Americas, Guatemala retains strong Maya cultural traditions, languages, and textiles alongside its Spanish colonial heritage.",
  "call": "+502",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "police": "110",
   "amb": "123",
   "fire": "123"
  }
 },
 "GY": {
  "name": "Guyana",
  "pop": 813834,
  "popYear": 2023,
  "langs": [
   "English",
   "Guyanese Creole",
   "Hindi",
   "Indigenous languages"
  ],
  "cur": {
   "code": "GYD",
   "sym": "$",
   "name": "Guyanese Dollar"
  },
  "region": "South America",
  "hist": "Inhabited by Indigenous peoples, the territory was colonized successively by the Dutch and then the British, who developed sugar plantations using enslaved Africans and later indentured laborers from India. This history makes Guyana the only English-speaking country in South America and gives it a diverse Indo- and Afro-Guyanese population. It gained independence from Britain in 1966, and recent offshore oil discoveries have rapidly transformed its economy, while its interior remains dominated by Amazonian rainforest.",
  "call": "+592",
  "drive": "left",
  "plugs": [
   "A",
   "B",
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "60Hz",
  "emerg": {
   "all": "911",
   "amb": "913",
   "fire": "912"
  }
 },
 "HT": {
  "name": "Haiti",
  "pop": 11772557,
  "popYear": 2024,
  "langs": [
   "French",
   "Haitian Creole"
  ],
  "cur": {
   "code": "HTG",
   "sym": "G",
   "name": "Gourde"
  },
  "region": "Caribbean",
  "hist": "Haiti occupies the western third of the island of Hispaniola, which it shares with the Dominican Republic. A French colony built on plantation agriculture, it became the first independent nation in Latin America and the first to be founded after a successful revolution of enslaved people, achieving independence in 1804. Its French and African heritage shaped a distinctive Creole language, Vodou traditions, and a rich artistic and musical culture that travelers encounter today.",
  "call": "+509",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "110V",
  "freq": "60Hz",
  "emerg": {
   "police": "114",
   "amb": "116",
   "fire": "115"
  }
 },
 "HN": {
  "name": "Honduras",
  "pop": 10825703,
  "popYear": 2024,
  "langs": [
   "Spanish"
  ],
  "cur": {
   "code": "HNL",
   "sym": "L",
   "name": "Lempira"
  },
  "region": "Central America",
  "hist": "Honduras was home to the Maya, whose ancient city of Copan in the west remains a major archaeological site. The territory was colonized by Spain in the sixteenth century and gained independence in 1821, briefly joining the United Provinces of Central America before becoming a separate republic. Its Caribbean coast, Bay Islands, and highland colonial towns reflect a blend of Indigenous, Spanish, and Afro-Caribbean (Garifuna) influences.",
  "call": "+504",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911",
   "amb": "195",
   "fire": "198"
  }
 },
 "JM": {
  "name": "Jamaica",
  "pop": 2839000,
  "popYear": 2024,
  "langs": [
   "English",
   "Jamaican Patois"
  ],
  "cur": {
   "code": "JMD",
   "sym": "J$",
   "name": "Jamaican Dollar"
  },
  "region": "Caribbean",
  "hist": "Jamaica was inhabited by the Indigenous Taino before Spanish colonization and a later English takeover in 1655, which established a plantation economy reliant on enslaved African labor. The island gained full independence from the United Kingdom in 1962 and remains a member of the Commonwealth. Its culture is globally recognized through reggae music, the Rastafari movement, and a vibrant Creole heritage.",
  "call": "+1",
  "drive": "left",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "110V",
  "freq": "50Hz",
  "emerg": {
   "police": "119",
   "amb": "110",
   "fire": "110"
  }
 },
 "MX": {
  "name": "Mexico",
  "pop": 130861007,
  "popYear": 2024,
  "langs": [
   "Spanish"
  ],
  "cur": {
   "code": "MXN",
   "sym": "$",
   "name": "Mexican Peso"
  },
  "region": "North America",
  "hist": "Mexico was the heartland of major civilizations including the Maya and the Aztec, whose capital Tenochtitlan underlies modern Mexico City. Spanish conquest in the early sixteenth century established the colony of New Spain, and Mexico won independence in 1821 after a prolonged struggle. The fusion of Indigenous and Spanish cultures produced its language, cuisine, and traditions, and the country preserves extensive pre-Columbian ruins and colonial-era cities.",
  "call": "+52",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "127V",
  "freq": "60Hz",
  "emerg": {
   "all": "911"
  }
 },
 "NI": {
  "name": "Nicaragua",
  "pop": 6916140,
  "popYear": 2024,
  "langs": [
   "Spanish"
  ],
  "cur": {
   "code": "NIO",
   "sym": "C$",
   "name": "Cordoba"
  },
  "region": "Central America",
  "hist": "Nicaragua, the largest country in Central America by area, was inhabited by Indigenous peoples before Spanish colonization in the sixteenth century. It gained independence from Spain in 1821 and later separated from the Central American Federation. Colonial cities such as Granada and Leon, alongside volcanoes and large lakes, reflect its layered Indigenous and Spanish heritage, while the Caribbean coast carries distinct Afro-Caribbean and Indigenous Miskito influences.",
  "call": "+505",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "police": "118",
   "amb": "128",
   "fire": "115"
  }
 },
 "PA": {
  "name": "Panama",
  "pop": 4515577,
  "popYear": 2024,
  "langs": [
   "Spanish"
  ],
  "cur": {
   "code": "PAB",
   "sym": "B/.",
   "name": "Balboa"
  },
  "region": "Central America",
  "hist": "Panama sits on the narrow isthmus linking North and South America and was a key Spanish transit point for colonial trade. It was part of Colombia until separating in 1903, after which the Panama Canal was built and opened in 1914, transferring fully to Panamanian control in 1999. The canal, the colonial Casco Viejo district, and a mix of Indigenous, Spanish, and Afro-Caribbean cultures define the country travelers see today.",
  "call": "+507",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911",
   "police": "104",
   "fire": "103"
  }
 },
 "PY": {
  "name": "Paraguay",
  "pop": 6929153,
  "popYear": 2024,
  "langs": [
   "Spanish",
   "Guarani"
  ],
  "cur": {
   "code": "PYG",
   "sym": "₲",
   "name": "Guarani"
  },
  "region": "South America",
  "hist": "Paraguay is a landlocked South American country where the Indigenous Guarani language remains widely spoken alongside Spanish, both holding official status. Colonized by Spain and shaped by Jesuit missions in the seventeenth and eighteenth centuries, it gained independence in 1811. Its bilingual culture, surviving Jesuit mission ruins, and traditions such as the harp and terere mate are notable to visitors.",
  "call": "+595",
  "drive": "right",
  "plugs": [
   "C"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "all": "911",
   "police": "912",
   "amb": "141",
   "fire": "132"
  }
 },
 "PE": {
  "name": "Peru",
  "pop": 34600000,
  "popYear": 2024,
  "langs": [
   "Spanish",
   "Quechua",
   "Aymara"
  ],
  "cur": {
   "code": "PEN",
   "sym": "S/",
   "name": "Sol"
  },
  "region": "South America",
  "hist": "Peru was the center of the Inca Empire, whose capital was Cusco and whose mountaintop site of Machu Picchu is a world-famous destination. Spanish conquest in the 1530s made Lima the seat of a powerful viceroyalty, and Peru declared independence in 1821. The blend of Andean Indigenous cultures, Spanish colonial architecture, and diverse cuisine shapes its identity, with Quechua and Aymara still spoken in the highlands.",
  "call": "+51",
  "drive": "right",
  "plugs": [
   "A",
   "B",
   "C"
  ],
  "volt": "220V",
  "freq": "60Hz",
  "emerg": {
   "all": "911",
   "police": "105",
   "amb": "106",
   "fire": "116"
  }
 },
 "KN": {
  "name": "Saint Kitts and Nevis",
  "pop": 46843,
  "popYear": 2024,
  "langs": [
   "English"
  ],
  "cur": {
   "code": "XCD",
   "sym": "$",
   "name": "East Caribbean Dollar"
  },
  "region": "Caribbean",
  "hist": "Saint Kitts and Nevis is a two-island federation in the Lesser Antilles and the smallest sovereign state in the Americas by area and population. Colonized by the English and French and shaped by sugar plantations worked by enslaved Africans, it became independent from the United Kingdom in 1983. Historic sites such as the Brimstone Hill Fortress and former plantation estates reflect its colonial past.",
  "call": "+1",
  "drive": "left",
  "plugs": [
   "A",
   "B",
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "60Hz",
  "emerg": {
   "all": "911"
  }
 },
 "LC": {
  "name": "Saint Lucia",
  "pop": 179744,
  "popYear": 2024,
  "langs": [
   "English",
   "Saint Lucian Creole"
  ],
  "cur": {
   "code": "XCD",
   "sym": "$",
   "name": "East Caribbean Dollar"
  },
  "region": "Caribbean",
  "hist": "Saint Lucia is a mountainous island in the eastern Caribbean known for the twin volcanic peaks of the Pitons. Control of the island changed repeatedly between France and Britain during the colonial era, leaving a French-influenced Creole language alongside official English. It gained independence from the United Kingdom in 1979 and retains a culture blending African, French, and British heritage.",
  "call": "+1",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "911",
   "police": "999",
   "amb": "999",
   "fire": "999"
  }
 },
 "VC": {
  "name": "Saint Vincent and the Grenadines",
  "pop": 100616,
  "popYear": 2024,
  "langs": [
   "English",
   "Vincentian Creole"
  ],
  "cur": {
   "code": "XCD",
   "sym": "$",
   "name": "East Caribbean Dollar"
  },
  "region": "Caribbean",
  "hist": "Saint Vincent and the Grenadines is a multi-island nation in the Lesser Antilles comprising the main island of Saint Vincent and a chain of smaller islands. Contested between European powers and home to the Indigenous Garifuna before British control, it became independent from the United Kingdom in 1979. Its volcanic landscapes, sailing waters, and Creole culture draw visitors today.",
  "call": "+1",
  "drive": "left",
  "plugs": [
   "A",
   "B",
   "C",
   "E",
   "G",
   "I",
   "K"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "911",
   "police": "999",
   "amb": "999",
   "fire": "999"
  }
 },
 "SR": {
  "name": "Suriname",
  "pop": 633000,
  "popYear": 2024,
  "langs": [
   "Dutch",
   "Sranan Tongo"
  ],
  "cur": {
   "code": "SRD",
   "sym": "$",
   "name": "Surinamese Dollar"
  },
  "region": "South America",
  "hist": "Suriname, on the northeastern coast of South America, was a Dutch plantation colony and is the only sovereign nation outside Europe where Dutch is the official language. Independence from the Netherlands came in 1975. Waves of migration, including enslaved Africans and indentured laborers from India, Indonesia, and China, created one of the most ethnically and religiously diverse societies in the Americas, visible in its capital Paramaribo.",
  "call": "+597",
  "drive": "left",
  "plugs": [
   "A",
   "B",
   "C",
   "F"
  ],
  "volt": "127V",
  "freq": "60Hz",
  "emerg": {
   "all": "115",
   "police": "115",
   "amb": "113",
   "fire": "110"
  }
 },
 "TT": {
  "name": "Trinidad and Tobago",
  "pop": 1507781,
  "popYear": 2024,
  "langs": [
   "English",
   "Trinidadian Creole"
  ],
  "cur": {
   "code": "TTD",
   "sym": "TT$",
   "name": "Trinidad and Tobago Dollar"
  },
  "region": "Caribbean",
  "hist": "Trinidad and Tobago is a twin-island republic off the coast of Venezuela, colonized first by Spain and later by Britain, with enslaved Africans and later indentured laborers from India shaping its population. It became independent from the United Kingdom in 1962 and a republic in 1976. The islands are the birthplace of calypso, soca, and the steelpan, and host one of the world's most famous Carnival celebrations.",
  "call": "+1",
  "drive": "left",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "115V",
  "freq": "60Hz",
  "emerg": {
   "all": "911",
   "police": "999",
   "amb": "811",
   "fire": "990"
  }
 },
 "US": {
  "name": "United States",
  "pop": 341784857,
  "popYear": 2025,
  "langs": [
   "English",
   "Spanish"
  ],
  "cur": {
   "code": "USD",
   "sym": "$",
   "name": "United States Dollar"
  },
  "region": "North America",
  "hist": "The United States was formed by thirteen British colonies that declared independence in 1776 and won it through the Revolutionary War. It expanded westward across the continent through the nineteenth century and grew into a global power in the twentieth. Shaped by Indigenous peoples and successive waves of immigration, it offers travelers vast geographic diversity, from major cities to extensive national parks.",
  "call": "+1",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911"
  }
 },
 "UY": {
  "name": "Uruguay",
  "pop": 3400000,
  "popYear": 2025,
  "langs": [
   "Spanish"
  ],
  "cur": {
   "code": "UYU",
   "sym": "$U",
   "name": "Uruguayan Peso"
  },
  "region": "South America",
  "hist": "Uruguay is a small South American nation between Argentina and Brazil, settled by Spain and contested with Portugal before gaining independence in 1828. The historic quarter of Colonia del Sacramento and the capital Montevideo reflect this colonial rivalry. Strong European immigration shaped its culture, known for the tango heritage shared with Argentina, gaucho traditions, mate drinking, and a long stretch of Atlantic beaches.",
  "call": "+598",
  "drive": "right",
  "plugs": [
   "C",
   "F",
   "L"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "911",
   "police": "109",
   "amb": "105",
   "fire": "104"
  }
 },
 "VE": {
  "name": "Venezuela",
  "pop": 28500000,
  "popYear": 2025,
  "langs": [
   "Spanish"
  ],
  "cur": {
   "code": "VES",
   "sym": "Bs.",
   "name": "Bolivar"
  },
  "region": "South America",
  "hist": "Venezuela, on South America's Caribbean coast, was a Spanish colony and the birthplace of Simon Bolivar, who led independence movements across the region in the early nineteenth century; full independence came in 1821. Its landscapes range from Caribbean beaches and the Andes to the Orinoco basin and Angel Falls, the world's tallest waterfall. Spanish colonial heritage and Indigenous influences shape its culture.",
  "call": "+58",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911",
   "police": "171",
   "amb": "171",
   "fire": "171"
  }
 },
 "DZ": {
  "name": "Algeria",
  "pop": 46278000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "Berber (Tamazight)",
   "French"
  ],
  "cur": {
   "code": "DZD",
   "sym": "دج",
   "name": "Algerian Dinar"
  },
  "region": "North Africa (Maghreb)",
  "hist": "Algeria's coast was settled by Phoenicians and later became part of Rome's North African provinces before centuries of Ottoman rule. France colonized the territory beginning in 1830, and after a protracted war Algeria gained independence in 1962. The blend of Arab, Berber, Ottoman, and French legacies shapes the country's language, cuisine, and architecture today.",
  "call": "+213",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "1548",
   "amb": "14",
   "fire": "14"
  }
 },
 "BH": {
  "name": "Bahrain",
  "pop": 1577000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "English"
  ],
  "cur": {
   "code": "BHD",
   "sym": ".د.ب",
   "name": "Bahraini Dinar"
  },
  "region": "Arabian Peninsula (Persian Gulf)",
  "hist": "This archipelago was the heart of the ancient Dilmun civilization, a key trading hub thousands of years ago, and was long renowned for pearl diving. It came under various powers including Portugal and Persia before the Al Khalifa family established rule in the late 18th century. Bahrain gained full independence from Britain in 1971 and has since developed as a regional financial and cultural center.",
  "call": "+973",
  "drive": "right",
  "plugs": [
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "999"
  }
 },
 "EG": {
  "name": "Egypt",
  "pop": 114536000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "English"
  ],
  "cur": {
   "code": "EGP",
   "sym": "£",
   "name": "Egyptian Pound"
  },
  "region": "North Africa / Nile Valley",
  "hist": "Egypt is home to one of the world's oldest civilizations, unified around 3100 BCE and famed for its pharaohs, pyramids, and the Nile. Successive eras of Greek, Roman, Christian, and Islamic rule layered onto this ancient foundation. After periods of Ottoman and British influence, Egypt became fully independent in the mid-20th century, and Cairo remains a major cultural and political center of the Arab world.",
  "call": "+20",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "122",
   "amb": "123",
   "fire": "180"
  }
 },
 "IR": {
  "name": "Iran",
  "pop": 89172000,
  "popYear": 2024,
  "langs": [
   "Persian (Farsi)",
   "Azerbaijani",
   "Kurdish"
  ],
  "cur": {
   "code": "IRR",
   "sym": "﷼",
   "name": "Iranian Rial"
  },
  "region": "Western Asia / Persian Plateau",
  "hist": "Iran, historically known as Persia, was the seat of ancient empires including the Achaemenids and Sasanians, leaving monuments such as Persepolis. Islam arrived in the 7th century, and later Safavid, Qajar, and Pahlavi dynasties shaped the modern state. The 1979 revolution established the present Islamic Republic, and Persian art, poetry, and architecture remain central to the country's identity.",
  "call": "+98",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "110",
   "amb": "115",
   "fire": "125"
  }
 },
 "IQ": {
  "name": "Iraq",
  "pop": 45504000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "Kurdish"
  ],
  "cur": {
   "code": "IQD",
   "sym": "ع.د",
   "name": "Iraqi Dinar"
  },
  "region": "Western Asia / Mesopotamia",
  "hist": "The land between the Tigris and Euphrates, Mesopotamia, is often called the cradle of civilization and home to Sumer, Babylon, and Assyria. Baghdad became a center of learning during the Islamic Golden Age under the Abbasid Caliphate. After Ottoman rule and a British mandate, Iraq became independent in 1932, and its ancient sites and diverse Arab and Kurdish cultures define it today.",
  "call": "+964",
  "drive": "right",
  "plugs": [
   "C",
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "911",
   "police": "104",
   "amb": "122",
   "fire": "115"
  }
 },
 "IL": {
  "name": "Israel",
  "pop": 9842000,
  "popYear": 2024,
  "langs": [
   "Hebrew",
   "Arabic",
   "English"
  ],
  "cur": {
   "code": "ILS",
   "sym": "₪",
   "name": "Israeli New Shekel"
  },
  "region": "Western Asia / Levant",
  "hist": "The region holds deep significance for Judaism, Christianity, and Islam, with Jerusalem at its spiritual center for millennia. The modern State of Israel was established in 1948 following the end of the British Mandate for Palestine. The country blends ancient heritage sites with a contemporary, technologically advanced society, and remains a focal point of the wider Israeli-Palestinian situation.",
  "call": "+972",
  "drive": "right",
  "plugs": [
   "C",
   "H",
   "M"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "100",
   "amb": "101",
   "fire": "102"
  }
 },
 "JO": {
  "name": "Jordan",
  "pop": 11437000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "English"
  ],
  "cur": {
   "code": "JOD",
   "sym": "د.ا",
   "name": "Jordanian Dinar"
  },
  "region": "Western Asia / Levant",
  "hist": "Jordan's territory was home to the Nabataeans, who carved the rock city of Petra, and later passed through Roman, Byzantine, and Islamic rule. The Emirate of Transjordan formed under British oversight after World War I, achieving full independence in 1946. Today the kingdom is known for its hospitality, desert landscapes, and archaeological treasures such as Petra and Jerash.",
  "call": "+962",
  "drive": "right",
  "plugs": [
   "B",
   "C",
   "D",
   "F",
   "G",
   "J"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "911"
  }
 },
 "KW": {
  "name": "Kuwait",
  "pop": 4935000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "English"
  ],
  "cur": {
   "code": "KWD",
   "sym": "د.ك",
   "name": "Kuwaiti Dinar"
  },
  "region": "Arabian Peninsula (Persian Gulf)",
  "hist": "Kuwait grew from an 18th-century trading and pearling settlement at the head of the Persian Gulf, governed by the Al Sabah family. It became a British protectorate and gained independence in 1961. The discovery of oil transformed it into a wealthy modern state, and Kuwait City today combines maritime heritage with contemporary architecture.",
  "call": "+965",
  "drive": "right",
  "plugs": [
   "C",
   "G"
  ],
  "volt": "240V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "LB": {
  "name": "Lebanon",
  "pop": 5805000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "French",
   "English"
  ],
  "cur": {
   "code": "LBP",
   "sym": "ل.ل",
   "name": "Lebanese Pound"
  },
  "region": "Western Asia / Levant",
  "hist": "Lebanon's coast was the homeland of the seafaring Phoenicians, with ancient cities such as Byblos, Tyre, and Sidon. After Ottoman rule and a French mandate, Lebanon gained independence in 1943. Its diverse religious communities, Mediterranean culture, and cities like Beirut have long given it a reputation as a cultural crossroads.",
  "call": "+961",
  "drive": "right",
  "plugs": [
   "A",
   "B",
   "C",
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "160",
   "amb": "140",
   "fire": "175"
  }
 },
 "LY": {
  "name": "Libya",
  "pop": 7361000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "Berber (Tamazight)",
   "Italian"
  ],
  "cur": {
   "code": "LYD",
   "sym": "ل.د",
   "name": "Libyan Dinar"
  },
  "region": "North Africa (Maghreb)",
  "hist": "Libya contains remarkable Greek and Roman ruins such as Cyrene and Leptis Magna along its Mediterranean coast. The region experienced Ottoman and then Italian colonial rule before independence in 1951. After decades under a single leader and subsequent conflict, Libya's ancient sites and Saharan landscapes remain central to its heritage.",
  "call": "+218",
  "drive": "right",
  "plugs": [
   "C",
   "D",
   "F",
   "L"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "1515",
   "amb": "193"
  }
 },
 "MA": {
  "name": "Morocco",
  "pop": 37840000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "Berber (Tamazight)",
   "French"
  ],
  "cur": {
   "code": "MAD",
   "sym": "د.م.",
   "name": "Moroccan Dirham"
  },
  "region": "North Africa (Maghreb)",
  "hist": "Morocco has been ruled by a succession of dynasties since the founding of the Idrisid state in the 8th century, with imperial cities such as Fez, Marrakech, and Meknes. A French and Spanish protectorate in the early 20th century gave way to independence in 1956 under the long-standing monarchy. Berber, Arab, Andalusian, and European influences shape its vibrant medinas, cuisine, and crafts.",
  "call": "+212",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "police": "19",
   "amb": "15",
   "fire": "15"
  }
 },
 "OM": {
  "name": "Oman",
  "pop": 5281000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "English"
  ],
  "cur": {
   "code": "OMR",
   "sym": "ر.ع.",
   "name": "Omani Rial"
  },
  "region": "Arabian Peninsula",
  "hist": "Oman was a major maritime power whose influence once extended to East Africa, including Zanzibar, built on frankincense and seafaring trade. The Al Said dynasty has ruled since the mid-18th century. After a period of relative isolation, the country modernized rapidly from 1970, and its forts, souks, and dramatic landscapes draw travelers today.",
  "call": "+968",
  "drive": "right",
  "plugs": [
   "G"
  ],
  "volt": "240V",
  "freq": "50Hz",
  "emerg": {
   "all": "9999"
  }
 },
 "PS": {
  "name": "Palestine",
  "pop": 5495000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "English"
  ],
  "cur": {
   "code": "ILS",
   "sym": "₪",
   "name": "Israeli New Shekel"
  },
  "region": "Western Asia / Levant",
  "hist": "The Palestinian territories of the West Bank and Gaza Strip contain sites of profound religious and historical importance, including Bethlehem and Hebron. The region was part of the Ottoman Empire and then the British Mandate before the events of 1948 and 1967 reshaped its boundaries. The State of Palestine is recognized by many countries, and its status remains central to the wider Israeli-Palestinian situation.",
  "call": null,
  "drive": null,
  "plugs": [
   "C",
   "H",
   "M"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "100",
   "amb": "101",
   "fire": "102"
  }
 },
 "QA": {
  "name": "Qatar",
  "pop": 3048000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "English"
  ],
  "cur": {
   "code": "QAR",
   "sym": "ر.ق",
   "name": "Qatari Riyal"
  },
  "region": "Arabian Peninsula (Persian Gulf)",
  "hist": "Qatar was historically a pearling and fishing society on a small Gulf peninsula, governed by the Al Thani family. It became a British protectorate and gained independence in 1971. Oil and natural gas wealth has driven rapid modernization, and Doha now features striking contemporary architecture alongside the restored Souq Waqif; the country hosted the 2022 FIFA World Cup.",
  "call": "+974",
  "drive": "right",
  "plugs": [
   "D",
   "G"
  ],
  "volt": "240V",
  "freq": "50Hz",
  "emerg": {
   "all": "999"
  }
 },
 "SA": {
  "name": "Saudi Arabia",
  "pop": 35300000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "English"
  ],
  "cur": {
   "code": "SAR",
   "sym": "ر.س",
   "name": "Saudi Riyal"
  },
  "region": "Arabian Peninsula",
  "hist": "The Arabian Peninsula is the birthplace of Islam, with Mecca and Medina as its holiest cities and destinations for millions of pilgrims. The modern Kingdom of Saudi Arabia was unified under the Al Saud family in 1932. Vast oil reserves transformed the economy, and recent years have seen the country open more widely to tourism alongside its desert and Nabataean heritage at sites like AlUla.",
  "call": "+966",
  "drive": "right",
  "plugs": [
   "G"
  ],
  "volt": "230V",
  "freq": "60Hz",
  "emerg": {
   "all": "911",
   "police": "999",
   "amb": "997",
   "fire": "998"
  }
 },
 "SY": {
  "name": "Syria",
  "pop": 23227000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "Kurdish",
   "Armenian"
  ],
  "cur": {
   "code": "SYP",
   "sym": "ل.س",
   "name": "Syrian Pound"
  },
  "region": "Western Asia / Levant",
  "hist": "Syria is one of the oldest continuously inhabited regions, with Damascus and Aleppo among the world's most ancient cities. It passed through Roman, Byzantine, Islamic Caliphate, and Ottoman rule before a French mandate and independence in 1946. Despite years of recent conflict, its layered history is reflected in monumental sites such as Palmyra and the old city of Damascus.",
  "call": "+963",
  "drive": "right",
  "plugs": [
   "C",
   "E",
   "L"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "amb": "110",
   "fire": "113"
  }
 },
 "TN": {
  "name": "Tunisia",
  "pop": 12277000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "French"
  ],
  "cur": {
   "code": "TND",
   "sym": "د.ت",
   "name": "Tunisian Dinar"
  },
  "region": "North Africa (Maghreb)",
  "hist": "Tunisia was the site of ancient Carthage, a Phoenician power that rivaled Rome before its destruction and rebuilding under Roman rule. Arab conquest, Ottoman governance, and a French protectorate followed, with independence achieved in 1956. The country is known for its Mediterranean beaches, Roman ruins, and historic medinas such as that of Tunis.",
  "call": "+216",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "197",
   "amb": "190",
   "fire": "198"
  }
 },
 "TR": {
  "name": "Turkey",
  "pop": 85326000,
  "popYear": 2024,
  "langs": [
   "Turkish",
   "Kurdish"
  ],
  "cur": {
   "code": "TRY",
   "sym": "₺",
   "name": "Turkish Lira"
  },
  "region": "Western Asia / Anatolia & Southeast Europe",
  "hist": "Spanning Europe and Asia, Anatolia hosted civilizations from the Hittites to the Greeks and Romans, and Istanbul served as capital of the Byzantine and then Ottoman empires. The modern Republic of Turkey was founded in 1923 under Mustafa Kemal Atatürk. Its position as a bridge between continents is reflected in landmarks such as Hagia Sophia, Cappadocia, and the bazaars of Istanbul.",
  "call": "+90",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "155",
   "amb": "112",
   "fire": "110"
  }
 },
 "AE": {
  "name": "United Arab Emirates",
  "pop": 11027000,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "English"
  ],
  "cur": {
   "code": "AED",
   "sym": "د.إ",
   "name": "UAE Dirham"
  },
  "region": "Arabian Peninsula (Persian Gulf)",
  "hist": "The seven emirates were historically pearling and trading sheikhdoms along the Gulf coast known as the Trucial States under British protection. They united to form the United Arab Emirates in 1971. Oil wealth fueled extraordinary growth, and cities like Dubai and Abu Dhabi now combine ultramodern skylines with heritage districts and desert experiences.",
  "call": "+971",
  "drive": "right",
  "plugs": [
   "C",
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "999",
   "amb": "998",
   "fire": "997"
  }
 },
 "YE": {
  "name": "Yemen",
  "pop": 34449000,
  "popYear": 2024,
  "langs": [
   "Arabic"
  ],
  "cur": {
   "code": "YER",
   "sym": "﷼",
   "name": "Yemeni Rial"
  },
  "region": "Arabian Peninsula",
  "hist": "Yemen was home to ancient kingdoms such as Saba (Sheba), enriched by the incense trade, and is famed for the mud-brick towers of cities like Sana'a and Shibam. It later came under Islamic, Ottoman, and British influence, with north and south unifying into a single republic in 1990. Its old cities and highland landscapes reflect a long and distinctive cultural heritage.",
  "call": "+967",
  "drive": "right",
  "plugs": [
   "A",
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "194",
   "amb": "191",
   "fire": "191"
  }
 },
 "AO": {
  "name": "Angola",
  "pop": 36684202,
  "popYear": 2024,
  "langs": [
   "Portuguese",
   "Umbundu",
   "Kimbundu",
   "Kikongo"
  ],
  "cur": {
   "code": "AOA",
   "sym": "Kz",
   "name": "Angolan Kwanza"
  },
  "region": "Central Africa",
  "hist": "Angola was a Portuguese colony for roughly four centuries before gaining independence in 1975. Independence was followed by a prolonged civil war that lasted until 2002, after which the country entered a period of reconstruction funded largely by oil and diamond wealth. Portuguese remains the official language and is widely spoken in cities such as the capital, Luanda, alongside several Bantu languages.",
  "call": "+244",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "113",
   "amb": "112",
   "fire": "115"
  }
 },
 "BJ": {
  "name": "Benin",
  "pop": 14111034,
  "popYear": 2024,
  "langs": [
   "French",
   "Fon",
   "Yoruba"
  ],
  "cur": {
   "code": "XOF",
   "sym": "CFA",
   "name": "West African CFA Franc"
  },
  "region": "West Africa",
  "hist": "The region was home to the powerful Kingdom of Dahomey before becoming a French colony in the late 19th century. It gained independence in 1960 as Dahomey and was renamed Benin in 1975. The historic city of Ouidah was a major Atlantic trade port and is today a center of Vodun (Voodoo) culture and heritage.",
  "call": "+229",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "117",
   "amb": "112",
   "fire": "118"
  }
 },
 "BW": {
  "name": "Botswana",
  "pop": 2675352,
  "popYear": 2024,
  "langs": [
   "English",
   "Setswana"
  ],
  "cur": {
   "code": "BWP",
   "sym": "P",
   "name": "Botswana Pula"
  },
  "region": "Southern Africa",
  "hist": "Formerly the British protectorate of Bechuanaland, Botswana became independent in 1966. The subsequent discovery of diamonds underpinned decades of economic growth and political stability. The country is widely known for wildlife destinations such as the Okavango Delta and the Kalahari, which anchor its tourism economy.",
  "call": "+267",
  "drive": "left",
  "plugs": [
   "D",
   "G",
   "M"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "999",
   "amb": "997",
   "fire": "998"
  }
 },
 "BF": {
  "name": "Burkina Faso",
  "pop": 23548781,
  "popYear": 2024,
  "langs": [
   "French",
   "Mooré",
   "Dyula"
  ],
  "cur": {
   "code": "XOF",
   "sym": "CFA",
   "name": "West African CFA Franc"
  },
  "region": "West Africa",
  "hist": "Once the center of the Mossi kingdoms, the territory became part of French West Africa and gained independence in 1960 as Upper Volta. It was renamed Burkina Faso, meaning 'land of upright people,' in 1984. The capital, Ouagadougou, hosts FESPACO, one of Africa's largest film festivals.",
  "call": "+226",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "17",
   "amb": "112",
   "fire": "18"
  }
 },
 "BI": {
  "name": "Burundi",
  "pop": 13238559,
  "popYear": 2024,
  "langs": [
   "Kirundi",
   "French",
   "English",
   "Swahili"
  ],
  "cur": {
   "code": "BIF",
   "sym": "FBu",
   "name": "Burundian Franc"
  },
  "region": "East Africa",
  "hist": "Burundi was a kingdom for centuries before falling under German and then Belgian colonial administration as part of Ruanda-Urundi. It gained independence in 1962. The country experienced periods of civil conflict in the later 20th century, and today its small, hilly territory borders Lake Tanganyika.",
  "call": "+257",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "117",
   "amb": "112",
   "fire": "118"
  }
 },
 "CV": {
  "name": "Cabo Verde",
  "pop": 524877,
  "popYear": 2024,
  "langs": [
   "Portuguese",
   "Cape Verdean Creole"
  ],
  "cur": {
   "code": "CVE",
   "sym": "$",
   "name": "Cape Verdean Escudo"
  },
  "region": "West Africa",
  "hist": "This Atlantic archipelago was uninhabited until Portuguese settlement in the 15th century, when it became an important hub in transatlantic trade. It gained independence from Portugal in 1975. The islands are known for a stable democracy and for morna music, popularized internationally by singer Cesária Évora.",
  "call": "+238",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "132",
   "amb": "130",
   "fire": "131"
  }
 },
 "CM": {
  "name": "Cameroon",
  "pop": 28647293,
  "popYear": 2024,
  "langs": [
   "French",
   "English"
  ],
  "cur": {
   "code": "XAF",
   "sym": "FCFA",
   "name": "Central African CFA Franc"
  },
  "region": "Central Africa",
  "hist": "Cameroon was colonized by Germany, then partitioned between France and Britain after World War I. The French and British administered regions were reunited around independence in the early 1960s, producing a bilingual French- and English-speaking state. Its varied geography, from coastal forests to the volcanic Mount Cameroon, gives it the nickname 'Africa in miniature.'",
  "call": "+237",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "117",
   "amb": "119",
   "fire": "118"
  }
 },
 "CF": {
  "name": "Central African Republic",
  "pop": 5330690,
  "popYear": 2024,
  "langs": [
   "Sango",
   "French"
  ],
  "cur": {
   "code": "XAF",
   "sym": "FCFA",
   "name": "Central African CFA Franc"
  },
  "region": "Central Africa",
  "hist": "The territory was administered by France as Ubangi-Shari and became independent in 1960. Its post-independence history has included periods of political instability and conflict. The landlocked country is rich in natural resources and home to rainforest reserves such as Dzanga-Sangha, known for lowland gorillas and forest elephants.",
  "call": "+236",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "117",
   "amb": "1220",
   "fire": "118"
  }
 },
 "TD": {
  "name": "Chad",
  "pop": 18278568,
  "popYear": 2024,
  "langs": [
   "French",
   "Arabic"
  ],
  "cur": {
   "code": "XAF",
   "sym": "FCFA",
   "name": "Central African CFA Franc"
  },
  "region": "Central Africa",
  "hist": "Chad lay along ancient trans-Saharan trade routes before becoming part of French Equatorial Africa, gaining independence in 1960. The country spans a sharp divide between the Saharan north and the more populated Sahelian south. Lake Chad in the southwest, though much reduced in size, remains a vital regional water source.",
  "call": "+235",
  "drive": "right",
  "plugs": [
   "C",
   "D",
   "E",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "17",
   "amb": "2251-1237",
   "fire": "18"
  }
 },
 "KM": {
  "name": "Comoros",
  "pop": 866628,
  "popYear": 2024,
  "langs": [
   "Comorian",
   "Arabic",
   "French"
  ],
  "cur": {
   "code": "KMF",
   "sym": "CF",
   "name": "Comorian Franc"
  },
  "region": "East Africa",
  "hist": "This Indian Ocean archipelago developed as a crossroads of Arab, African, and Malagasy cultures and trade. Three of the islands gained independence from France in 1975, while Mayotte remained French. The islands are known for fragrant spice and perfume crops such as ylang-ylang, vanilla, and cloves.",
  "call": "+269",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "17",
   "amb": "772-03-73",
   "fire": "18"
  }
 },
 "CG": {
  "name": "Republic of the Congo",
  "pop": 6142180,
  "popYear": 2024,
  "langs": [
   "French",
   "Lingala",
   "Kituba"
  ],
  "cur": {
   "code": "XAF",
   "sym": "FCFA",
   "name": "Central African CFA Franc"
  },
  "region": "Central Africa",
  "hist": "Often called Congo-Brazzaville after its capital, the country was part of French Equatorial Africa and gained independence in 1960. Its economy is heavily based on oil. Much of the national territory is covered by Congo Basin rainforest, including protected areas such as Nouabalé-Ndoki National Park.",
  "call": "+242",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "117",
   "fire": "118"
  }
 },
 "CD": {
  "name": "Democratic Republic of the Congo",
  "pop": 105799288,
  "popYear": 2024,
  "langs": [
   "French",
   "Lingala",
   "Swahili",
   "Kikongo",
   "Tshiluba"
  ],
  "cur": {
   "code": "CDF",
   "sym": "FC",
   "name": "Congolese Franc"
  },
  "region": "Central Africa",
  "hist": "Known as the Belgian Congo under colonial rule, the country gained independence in 1960 and was later called Zaire before reverting to its current name in 1997. It is the second-largest country in Africa by area and holds vast mineral wealth. The eastern highlands are renowned for mountain gorillas and the volcanoes of Virunga National Park.",
  "call": "+243",
  "drive": "right",
  "plugs": [
   "C",
   "D",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "112",
   "fire": "118"
  }
 },
 "CI": {
  "name": "Côte d'Ivoire",
  "pop": 31165653,
  "popYear": 2024,
  "langs": [
   "French",
   "Dyula",
   "Baoulé"
  ],
  "cur": {
   "code": "XOF",
   "sym": "CFA",
   "name": "West African CFA Franc"
  },
  "region": "West Africa",
  "hist": "A French colony from the late 19th century, Côte d'Ivoire (Ivory Coast) gained independence in 1960 and became one of West Africa's largest economies, driven largely by cocoa production. The political capital is Yamoussoukro, though Abidjan remains the largest city and economic hub. The country is internationally known by its French name.",
  "call": "+225",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "110",
   "amb": "185",
   "fire": "180"
  }
 },
 "DJ": {
  "name": "Djibouti",
  "pop": 1136455,
  "popYear": 2024,
  "langs": [
   "French",
   "Arabic",
   "Somali",
   "Afar"
  ],
  "cur": {
   "code": "DJF",
   "sym": "Fdj",
   "name": "Djiboutian Franc"
  },
  "region": "East Africa",
  "hist": "Strategically located at the entrance to the Red Sea, the territory was administered by France as French Somaliland and later the French Territory of the Afars and Issas before independence in 1977. Its location has made it a major shipping and military logistics hub. Landscapes such as the salt expanse of Lake Assal draw adventurous travelers.",
  "call": "+253",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "17",
   "amb": "19",
   "fire": "18"
  }
 },
 "GQ": {
  "name": "Equatorial Guinea",
  "pop": 1847022,
  "popYear": 2024,
  "langs": [
   "Spanish",
   "French",
   "Portuguese"
  ],
  "cur": {
   "code": "XAF",
   "sym": "FCFA",
   "name": "Central African CFA Franc"
  },
  "region": "Central Africa",
  "hist": "A former Spanish colony, Equatorial Guinea gained independence in 1968, making it one of the few Spanish-speaking countries in Africa. Its territory includes the mainland region of Río Muni and several islands, with the capital, Malabo, located on the island of Bioko. The discovery of offshore oil in the 1990s transformed its economy.",
  "call": "+240",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "114",
   "amb": "115",
   "fire": "112"
  }
 },
 "ER": {
  "name": "Eritrea",
  "pop": 3535603,
  "popYear": 2024,
  "langs": [
   "Tigrinya",
   "Arabic",
   "English"
  ],
  "cur": {
   "code": "ERN",
   "sym": "Nfk",
   "name": "Eritrean Nakfa"
  },
  "region": "East Africa",
  "hist": "An Italian colony in the late 19th and early 20th centuries, Eritrea was later federated with and then annexed by Ethiopia, leading to a long independence struggle that ended in 1993. The capital, Asmara, is a UNESCO World Heritage Site celebrated for its early 20th-century modernist Italian architecture. The country sits along the Red Sea coast.",
  "call": "+291",
  "drive": "right",
  "plugs": [
   "C",
   "E",
   "L"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "113",
   "amb": "114",
   "fire": "116"
  }
 },
 "SZ": {
  "name": "Eswatini",
  "pop": 1242822,
  "popYear": 2024,
  "langs": [
   "Swazi",
   "English"
  ],
  "cur": {
   "code": "SZL",
   "sym": "L",
   "name": "Swazi Lilangeni"
  },
  "region": "Southern Africa",
  "hist": "Formerly known as Swaziland, this small landlocked kingdom is one of the world's few remaining absolute monarchies. It became a British protectorate and regained full independence in 1968, then officially adopted the name Eswatini in 2018. Traditional ceremonies such as the Umhlanga (Reed Dance) and Incwala are central to its cultural calendar.",
  "call": "+268",
  "drive": "left",
  "plugs": [
   "C",
   "M",
   "N"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "999",
   "amb": "977",
   "fire": "933"
  }
 },
 "ET": {
  "name": "Ethiopia",
  "pop": 129719719,
  "popYear": 2024,
  "langs": [
   "Amharic",
   "Oromo",
   "Somali",
   "Tigrinya",
   "English"
  ],
  "cur": {
   "code": "ETB",
   "sym": "Br",
   "name": "Ethiopian Birr"
  },
  "region": "East Africa",
  "hist": "Ethiopia is one of the world's oldest continuous states and, apart from a brief Italian occupation in the late 1930s, was never formally colonized. It has a deep heritage tied to early Christianity, seen in sites such as the rock-hewn churches of Lalibela. The country follows its own calendar and is widely regarded as the birthplace of coffee.",
  "call": "+251",
  "drive": "right",
  "plugs": [
   "C",
   "E",
   "F",
   "G",
   "L"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "911",
   "police": "991",
   "amb": "907",
   "fire": "939"
  }
 },
 "GA": {
  "name": "Gabon",
  "pop": 2538952,
  "popYear": 2024,
  "langs": [
   "French",
   "Fang"
  ],
  "cur": {
   "code": "XAF",
   "sym": "FCFA",
   "name": "Central African CFA Franc"
  },
  "region": "Central Africa",
  "hist": "A former part of French Equatorial Africa, Gabon gained independence in 1960 and developed a relatively prosperous economy based on oil and timber. Roughly four-fifths of the country is forested, and it has set aside a large network of national parks. Loango National Park is noted for wildlife, including forest elephants and gorillas seen near the coast.",
  "call": "+241",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "1730",
   "amb": "1300",
   "fire": "18"
  }
 },
 "GM": {
  "name": "Gambia",
  "pop": 2773168,
  "popYear": 2024,
  "langs": [
   "English",
   "Mandinka",
   "Wolof",
   "Fula"
  ],
  "cur": {
   "code": "GMD",
   "sym": "D",
   "name": "Gambian Dalasi"
  },
  "region": "West Africa",
  "hist": "The Gambia is the smallest country on mainland Africa, forming a narrow strip along the Gambia River and almost entirely surrounded by Senegal. A former British colony, it gained independence in 1965. The river and sites associated with the transatlantic slave trade, such as Kunta Kinteh Island, are significant to its heritage tourism.",
  "call": "+220",
  "drive": "right",
  "plugs": [
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "117",
   "amb": "116",
   "fire": "118"
  }
 },
 "GH": {
  "name": "Ghana",
  "pop": 34121985,
  "popYear": 2024,
  "langs": [
   "English",
   "Akan",
   "Ewe",
   "Ga",
   "Dagbani"
  ],
  "cur": {
   "code": "GHS",
   "sym": "GH₵",
   "name": "Ghanaian Cedi"
  },
  "region": "West Africa",
  "hist": "The territory was home to powerful states including the Ashanti Empire before becoming the British colony known as the Gold Coast. In 1957 it became the first sub-Saharan African colony to gain independence, under Kwame Nkrumah, and took the name Ghana after the medieval Ghana Empire. Coastal forts such as Cape Coast and Elmina, built during the era of European trade and the transatlantic slave trade, are now major heritage sites. Today Ghana is regarded as one of West Africa's more stable democracies, with a rich tradition of Akan culture, kente cloth, and highlife music.",
  "call": "+233",
  "drive": "right",
  "plugs": [
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "191",
   "amb": "193",
   "fire": "192"
  }
 },
 "GN": {
  "name": "Guinea",
  "pop": 14190612,
  "popYear": 2024,
  "langs": [
   "French",
   "Fula",
   "Maninka",
   "Susu"
  ],
  "cur": {
   "code": "GNF",
   "sym": "FG",
   "name": "Guinean Franc"
  },
  "region": "West Africa",
  "hist": "The region was part of historic empires including Mali and the Fula-led Imamate of Futa Jallon before French colonization. Guinea gained independence in 1958, becoming the only French colony to immediately reject continued association with France under Ahmed Sékou Touré. Decades of single-party and later military rule followed, with the country holding significant bauxite reserves. Its varied landscapes range from the Fouta Djallon highlands to coastal lowlands, shaping a culturally diverse, predominantly Muslim society.",
  "call": "+224",
  "drive": "right",
  "plugs": [
   "C",
   "F",
   "K"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "117",
   "amb": "18",
   "fire": "442-020"
  }
 },
 "GW": {
  "name": "Guinea-Bissau",
  "pop": 2150842,
  "popYear": 2024,
  "langs": [
   "Portuguese",
   "Guinea-Bissau Creole",
   "Fula",
   "Balanta"
  ],
  "cur": {
   "code": "XOF",
   "sym": "CFA",
   "name": "West African CFA Franc"
  },
  "region": "West Africa",
  "hist": "Once linked to the Mali Empire and later a center of Portuguese trade along the Upper Guinea coast, the territory was a Portuguese colony for centuries. It declared independence in 1973 and gained international recognition in 1974 after a prolonged liberation struggle led by the PAIGC. The post-independence era has been marked by political instability and frequent changes of government. The offshore Bijagós Archipelago, a UNESCO biosphere reserve, is a notable draw, and Crioulo serves as a widely spoken lingua franca.",
  "call": "+245",
  "drive": "right",
  "plugs": [
   "C"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "117",
   "amb": "119",
   "fire": "118"
  }
 },
 "KE": {
  "name": "Kenya",
  "pop": 56432944,
  "popYear": 2024,
  "langs": [
   "Swahili",
   "English",
   "Kikuyu",
   "Luo",
   "Kalenjin"
  ],
  "cur": {
   "code": "KES",
   "sym": "KSh",
   "name": "Kenyan Shilling"
  },
  "region": "East Africa",
  "hist": "The Swahili coast around Mombasa and Lamu was a hub of Indian Ocean trade for over a millennium, linking African, Arab, and Asian cultures. The interior and coast came under British control, and Kenya gained independence in 1963 after the Mau Mau uprising, with Jomo Kenyatta as its first leader. Nairobi grew into a major regional commercial and diplomatic center. Today Kenya is renowned for its savanna wildlife reserves such as the Maasai Mara, the Great Rift Valley, and a strong tradition in long-distance running.",
  "call": "+254",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "240V",
  "freq": "50Hz",
  "emerg": {
   "all": "999"
  }
 },
 "LS": {
  "name": "Lesotho",
  "pop": 2337423,
  "popYear": 2024,
  "langs": [
   "Sesotho",
   "English"
  ],
  "cur": {
   "code": "LSL",
   "sym": "L",
   "name": "Lesotho Loti"
  },
  "region": "Southern Africa",
  "hist": "The Basotho nation was forged in the early 19th century under King Moshoeshoe I, who united refugee groups in the mountainous highlands during a period of regional upheaval. To resist encroachment, the kingdom became the British protectorate of Basutoland, gaining independence as Lesotho in 1966 while retaining its monarchy. Entirely surrounded by South Africa, it is one of only a few countries lying wholly above 1,000 meters in elevation. Its dramatic mountain scenery, snow in winter, and traditions such as the Basotho blanket and pony trekking define its identity.",
  "call": "+266",
  "drive": "left",
  "plugs": [
   "M"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "police": "123",
   "amb": "121",
   "fire": "122"
  }
 },
 "LR": {
  "name": "Liberia",
  "pop": 5612817,
  "popYear": 2024,
  "langs": [
   "English",
   "Kpelle",
   "Bassa",
   "Kru"
  ],
  "cur": {
   "code": "LRD",
   "sym": "L$",
   "name": "Liberian Dollar"
  },
  "region": "West Africa",
  "hist": "Liberia was founded in the early 19th century as a settlement for freed African Americans organized by the American Colonization Society, and it declared independence in 1847, becoming Africa's first modern republic. Its capital, Monrovia, was named after U.S. President James Monroe, and the country's flag and institutions reflect American influence alongside numerous indigenous cultures. Two civil wars between 1989 and 2003 caused great disruption before a return to stability and democratic governance. Today its culture blends Americo-Liberian and indigenous traditions, and English serves as the official language.",
  "call": "+231",
  "drive": "right",
  "plugs": [
   "A",
   "B",
   "C",
   "D",
   "E",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "911"
  }
 },
 "MG": {
  "name": "Madagascar",
  "pop": 31964956,
  "popYear": 2024,
  "langs": [
   "Malagasy",
   "French"
  ],
  "cur": {
   "code": "MGA",
   "sym": "Ar",
   "name": "Malagasy Ariary"
  },
  "region": "East Africa",
  "hist": "The world's fourth-largest island was settled by Austronesian seafarers from Southeast Asia, later joined by Bantu, Arab, and other peoples, producing a distinctive culture and the Malagasy language. The Merina Kingdom unified much of the island in the 19th century before it became a French colony, gaining independence in 1960. Its long isolation produced extraordinary endemic wildlife, including lemurs and baobabs found nowhere else. Travelers are drawn to its rainforests, national parks, and the iconic Avenue of the Baobabs.",
  "call": "+261",
  "drive": "right",
  "plugs": [
   "C",
   "D",
   "E",
   "J",
   "K"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "117",
   "amb": "124",
   "fire": "118"
  }
 },
 "MW": {
  "name": "Malawi",
  "pop": 21655286,
  "popYear": 2024,
  "langs": [
   "Chichewa",
   "English"
  ],
  "cur": {
   "code": "MWK",
   "sym": "MK",
   "name": "Malawian Kwacha"
  },
  "region": "Southern Africa",
  "hist": "The region around Lake Malawi was home to the Maravi kingdom, from which the country's name derives, and was explored by David Livingstone in the 19th century before becoming the British protectorate of Nyasaland. It gained independence in 1964 under Hastings Banda, who led a long one-party era before multiparty democracy returned in the 1990s. The vast freshwater Lake Malawi, with its clear waters and endemic cichlid fish, dominates the landscape and tourism. Often called the 'Warm Heart of Africa,' the country is known for friendly hospitality and Chewa cultural traditions.",
  "call": "+265",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "997",
   "amb": "998",
   "fire": "999"
  }
 },
 "ML": {
  "name": "Mali",
  "pop": 23100859,
  "popYear": 2024,
  "langs": [
   "French",
   "Bambara",
   "Fula",
   "Songhai"
  ],
  "cur": {
   "code": "XOF",
   "sym": "CFA",
   "name": "West African CFA Franc"
  },
  "region": "West Africa",
  "hist": "Mali was the heart of great medieval empires—Ghana, Mali, and Songhai—whose wealth in gold and salt made Timbuktu and Djenné renowned centers of trade and Islamic scholarship. The famous pilgrimage of Mansa Musa in the 14th century symbolized the empire's prosperity. After French colonial rule, the country gained independence in 1960. Its Saharan and Sahelian heritage, the mud-brick Great Mosque of Djenné, and a celebrated musical tradition continue to shape its cultural identity.",
  "call": "+223",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "police": "17",
   "amb": "15",
   "fire": "18"
  }
 },
 "MR": {
  "name": "Mauritania",
  "pop": 4862989,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "Pulaar",
   "Soninke",
   "Wolof",
   "French"
  ],
  "cur": {
   "code": "MRU",
   "sym": "UM",
   "name": "Mauritanian Ouguiya"
  },
  "region": "West Africa",
  "hist": "Straddling the Sahara and the Sahel, Mauritania was a crossroads of trans-Saharan caravan routes, with ancient trading towns such as Chinguetti and Ouadane serving as centers of Islamic learning. The region blends Arab-Berber (Moorish) and Sub-Saharan African populations. It became a French colony and gained independence in 1960. Today it is a vast, sparsely populated desert nation where camel caravans, oasis towns, and the iron-ore railway across the Sahara are notable features.",
  "call": "+222",
  "drive": "right",
  "plugs": [
   "C"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "police": "117",
   "amb": "101",
   "fire": "118"
  }
 },
 "MU": {
  "name": "Mauritius",
  "pop": 1271768,
  "popYear": 2024,
  "langs": [
   "English",
   "French",
   "Mauritian Creole",
   "Hindi"
  ],
  "cur": {
   "code": "MUR",
   "sym": "₨",
   "name": "Mauritian Rupee"
  },
  "region": "East Africa",
  "hist": "Uninhabited until modern times, the island was visited by Arab and Portuguese sailors, then settled successively by the Dutch (who named it after Prince Maurice), the French, and the British. Sugar plantations brought enslaved Africans and, later, indentured laborers from India, creating today's multicultural society. Mauritius gained independence in 1968 and became a republic in 1992. Famous as the former home of the extinct dodo, it is now a prosperous Indian Ocean destination known for beaches, coral reefs, and a blend of Indian, African, Chinese, and European cultures.",
  "call": "+230",
  "drive": "left",
  "plugs": [
   "C",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "999",
   "amb": "114",
   "fire": "995"
  }
 },
 "MZ": {
  "name": "Mozambique",
  "pop": 34631766,
  "popYear": 2024,
  "langs": [
   "Portuguese",
   "Makhuwa",
   "Tsonga",
   "Sena"
  ],
  "cur": {
   "code": "MZN",
   "sym": "MT",
   "name": "Mozambican Metical"
  },
  "region": "Southern Africa",
  "hist": "The Swahili coast trading towns, such as the historic Island of Mozambique, linked the region to Indian Ocean commerce long before Portuguese arrival around 1500. Portugal ruled the territory for centuries, and Mozambique gained independence in 1975 after a liberation war led by FRELIMO. A prolonged civil war followed until a peace accord in 1992, after which the country stabilized and reopened to tourism. Its long Indian Ocean coastline, archipelagos like the Bazaruto and Quirimbas, and Afro-Portuguese culture are key attractions.",
  "call": "+258",
  "drive": "left",
  "plugs": [
   "C",
   "F",
   "M"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "police": "119",
   "amb": "117",
   "fire": "198"
  }
 },
 "NA": {
  "name": "Namibia",
  "pop": 3030131,
  "popYear": 2024,
  "langs": [
   "English",
   "Afrikaans",
   "Oshiwambo",
   "German",
   "Otjiherero"
  ],
  "cur": {
   "code": "NAD",
   "sym": "N$",
   "name": "Namibian Dollar"
  },
  "region": "Southern Africa",
  "hist": "Home to the San, Himba, Herero, Ovambo, and other peoples, the territory became the colony of German South West Africa in the late 19th century before being administered by South Africa for much of the 20th century. After a long independence struggle led by SWAPO, Namibia became independent in 1990, one of Africa's last colonies to do so. The German colonial legacy is visible in towns such as Swakopmund. Travelers are drawn to the towering dunes of Sossusvlei, the Namib Desert, the Skeleton Coast, and the wildlife of Etosha National Park.",
  "call": "+264",
  "drive": "left",
  "plugs": [
   "D",
   "M"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "10111"
  }
 },
 "NE": {
  "name": "Niger",
  "pop": 26207977,
  "popYear": 2024,
  "langs": [
   "French",
   "Hausa",
   "Zarma",
   "Fula",
   "Tuareg"
  ],
  "cur": {
   "code": "XOF",
   "sym": "CFA",
   "name": "West African CFA Franc"
  },
  "region": "West Africa",
  "hist": "Largely covered by the Sahara, Niger lay along trans-Saharan trade routes and within the orbit of empires including Songhai and the Hausa and Kanem-Bornu states. It became part of French West Africa and gained independence in 1960. The country is named for the Niger River, which sustains its southwestern population. Known for the Aïr Mountains, the Ténéré desert, Tuareg and Wodaabe cultures, and the dinosaur fossils of the Sahara, it is among the world's youngest populations by median age.",
  "call": "+227",
  "drive": "right",
  "plugs": [
   "A",
   "B",
   "C",
   "D",
   "E",
   "F"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "police": "17",
   "amb": "15",
   "fire": "18"
  }
 },
 "NG": {
  "name": "Nigeria",
  "pop": 232679478,
  "popYear": 2024,
  "langs": [
   "English",
   "Hausa",
   "Yoruba",
   "Igbo"
  ],
  "cur": {
   "code": "NGN",
   "sym": "₦",
   "name": "Nigerian Naira"
  },
  "region": "West Africa",
  "hist": "The region hosted sophisticated civilizations including the Nok, the kingdoms of Ife and Benin, the Hausa city-states, and the Sokoto Caliphate. British colonial rule unified the northern and southern protectorates in 1914, and Nigeria gained independence in 1960. Africa's most populous nation, it is a federation of great ethnic and religious diversity. Lagos is a sprawling commercial megacity, and Nigeria's Nollywood film industry and Afrobeats music have global cultural reach.",
  "call": "+234",
  "drive": "right",
  "plugs": [
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "RW": {
  "name": "Rwanda",
  "pop": 14256567,
  "popYear": 2024,
  "langs": [
   "Kinyarwanda",
   "English",
   "French",
   "Swahili"
  ],
  "cur": {
   "code": "RWF",
   "sym": "FRw",
   "name": "Rwandan Franc"
  },
  "region": "East Africa",
  "hist": "The Kingdom of Rwanda was a centralized state long before European contact, later coming under German and then Belgian colonial administration. Rwanda gained independence in 1962. The 1994 genocide against the Tutsi was a defining tragedy, after which the country undertook extensive reconstruction and reconciliation. Today Rwanda is known for stability, cleanliness, and its hilly 'Land of a Thousand Hills' landscape, with mountain gorilla trekking in Volcanoes National Park a premier draw.",
  "call": "+250",
  "drive": "right",
  "plugs": [
   "C",
   "J"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "112",
   "amb": "912",
   "fire": "112"
  }
 },
 "ST": {
  "name": "São Tomé and Príncipe",
  "pop": 235536,
  "popYear": 2024,
  "langs": [
   "Portuguese",
   "Forro Creole"
  ],
  "cur": {
   "code": "STN",
   "sym": "Db",
   "name": "São Tomé and Príncipe Dobra"
  },
  "region": "Central Africa",
  "hist": "These uninhabited equatorial islands in the Gulf of Guinea were settled by the Portuguese from the late 15th century, becoming early centers of sugar and later cocoa plantations worked by enslaved and contract laborers. The country gained independence from Portugal in 1975. Its small population descends largely from these plantation communities, and Portuguese-based creoles are widely spoken. The volcanic islands, with rainforests, beaches, and former plantation estates known as roças, offer a tranquil tropical destination.",
  "call": "+239",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "SN": {
  "name": "Senegal",
  "pop": 18501984,
  "popYear": 2024,
  "langs": [
   "French",
   "Wolof",
   "Pulaar",
   "Serer"
  ],
  "cur": {
   "code": "XOF",
   "sym": "CFA",
   "name": "West African CFA Franc"
  },
  "region": "West Africa",
  "hist": "The region was part of the Jolof and other states and a significant point of contact for trans-Saharan and Atlantic trade, including the historic slave-trading post on Gorée Island near Dakar. As the administrative heart of French West Africa, Senegal gained independence in 1960 under the poet-president Léopold Sédar Senghor. It is noted for a long tradition of stable, peaceful transfers of power. Dakar's vibrant arts scene, Wolof culture, mbalax music, and the pink waters of Lake Retba are well-known features.",
  "call": "+221",
  "drive": "right",
  "plugs": [
   "C",
   "D",
   "E",
   "K"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "17",
   "amb": "18",
   "fire": "1515"
  }
 },
 "SC": {
  "name": "Seychelles",
  "pop": 130418,
  "popYear": 2024,
  "langs": [
   "Seychellois Creole",
   "English",
   "French"
  ],
  "cur": {
   "code": "SCR",
   "sym": "₨",
   "name": "Seychellois Rupee"
  },
  "region": "East Africa",
  "hist": "This Indian Ocean archipelago was uninhabited until the 18th century, when the French established settlements, bringing enslaved Africans; Britain later took control. Seychelles gained independence in 1976. Its population is a creole blend of African, European, Indian, and Chinese heritage, reflected in Seychellois Creole. Famous for granite-boulder beaches such as Anse Source d'Argent, the rare coco de mer palm, and the Aldabra giant tortoise, it is one of the world's premier luxury island destinations.",
  "call": "+248",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "240V",
  "freq": "50Hz",
  "emerg": {
   "all": "999",
   "police": "133",
   "amb": "151"
  }
 },
 "SL": {
  "name": "Sierra Leone",
  "pop": 8642022,
  "popYear": 2024,
  "langs": [
   "English",
   "Krio",
   "Mende",
   "Temne"
  ],
  "cur": {
   "code": "SLE",
   "sym": "Le",
   "name": "Sierra Leonean Leone"
  },
  "region": "West Africa",
  "hist": "The capital, Freetown, was founded in the late 18th century as a settlement for freed and formerly enslaved Africans, giving rise to the Krio people and the widely spoken Krio language. The territory became a British colony and protectorate before gaining independence in 1961. A civil war during the 1990s and early 2000s ended in 2002, followed by recovery and democratic governance. The country is known for its Atlantic beaches near Freetown, the Tacugama chimpanzee sanctuary, and a culturally diverse society.",
  "call": "+232",
  "drive": "right",
  "plugs": [
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "019",
   "amb": "999",
   "fire": "999"
  }
 },
 "SO": {
  "name": "Somalia",
  "pop": 18143378,
  "popYear": 2024,
  "langs": [
   "Somali",
   "Arabic",
   "English",
   "Italian"
  ],
  "cur": {
   "code": "SOS",
   "sym": "Sh",
   "name": "Somali Shilling"
  },
  "region": "Horn of Africa",
  "hist": "Located on the Horn of Africa, Somalia has long been a hub of trade linking the Indian Ocean world with the Arabian Peninsula. The territory was divided into British Somaliland and Italian Somaliland during the colonial era, and the two merged to form an independent Somali Republic in 1960. After the collapse of the central government in 1991, prolonged instability followed, though a federal government has since been re-established and the country retains a strong oral poetic and pastoral cultural heritage.",
  "call": "+252",
  "drive": "right",
  "plugs": [
   "C"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "police": "888",
   "amb": "999",
   "fire": "555"
  }
 },
 "ZA": {
  "name": "South Africa",
  "pop": 63015904,
  "popYear": 2024,
  "langs": [
   "Zulu",
   "Xhosa",
   "Afrikaans",
   "English",
   "Sotho",
   "Tswana"
  ],
  "cur": {
   "code": "ZAR",
   "sym": "R",
   "name": "South African Rand"
  },
  "region": "Southern Africa",
  "hist": "South Africa was home to long-established Khoisan, Bantu-speaking, and later European settler communities before becoming a British dominion in 1910. From 1948 the state enforced apartheid, a system of racial segregation that ended with the first fully democratic elections in 1994 and the presidency of Nelson Mandela. Today the country is often called the 'Rainbow Nation' for its cultural diversity, with eleven official languages and major travel draws including Cape Town, the Garden Route, and Kruger National Park.",
  "call": "+27",
  "drive": "left",
  "plugs": [
   "C",
   "D",
   "M",
   "N"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "10111",
   "amb": "10177",
   "fire": "10177"
  }
 },
 "SS": {
  "name": "South Sudan",
  "pop": 11483828,
  "popYear": 2024,
  "langs": [
   "English",
   "Arabic",
   "Dinka",
   "Nuer"
  ],
  "cur": {
   "code": "SSP",
   "sym": "£",
   "name": "South Sudanese Pound"
  },
  "region": "East-Central Africa",
  "hist": "South Sudan is the world's youngest internationally recognized nation, gaining independence from Sudan in 2011 after decades of civil conflict. The region is home to diverse ethnic communities, notably the Dinka and Nuer, with cultures centered on cattle herding and the seasonal rhythms of the White Nile and the vast Sudd wetland. The country experienced renewed internal conflict after independence, and travel infrastructure remains limited.",
  "call": "+211",
  "drive": "right",
  "plugs": [
   "C",
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "999"
  }
 },
 "SD": {
  "name": "Sudan",
  "pop": 50042791,
  "popYear": 2024,
  "langs": [
   "Arabic",
   "English"
  ],
  "cur": {
   "code": "SDG",
   "sym": "£",
   "name": "Sudanese Pound"
  },
  "region": "Northeast Africa",
  "hist": "Sudan sits along the Nile at the crossroads of Arab and Sub-Saharan Africa, and its northern reaches were home to the ancient Kingdom of Kush, whose pyramids at Meroe still stand. Long administered jointly by Britain and Egypt, Sudan became independent in 1956, and South Sudan later separated in 2011. The country has experienced repeated political upheaval, and its cultural heritage blends Nubian, Arab, and African traditions.",
  "call": "+249",
  "drive": "right",
  "plugs": [
   "C",
   "D"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "999"
  }
 },
 "TZ": {
  "name": "Tanzania",
  "pop": 67438106,
  "popYear": 2024,
  "langs": [
   "Swahili",
   "English"
  ],
  "cur": {
   "code": "TZS",
   "sym": "TSh",
   "name": "Tanzanian Shilling"
  },
  "region": "East Africa",
  "hist": "Tanzania was formed in 1964 through the union of mainland Tanganyika, which gained independence from Britain in 1961, and the islands of Zanzibar. The Swahili coast had centuries of trade ties across the Indian Ocean, blending African, Arab, and Indian influences that shaped the widely spoken Swahili language. The country is a premier travel destination, home to Mount Kilimanjaro, the Serengeti, Ngorongoro Crater, and the beaches of Zanzibar.",
  "call": "+255",
  "drive": "left",
  "plugs": [
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "999",
   "amb": "114",
   "fire": "115"
  }
 },
 "TG": {
  "name": "Togo",
  "pop": 9515236,
  "popYear": 2024,
  "langs": [
   "French",
   "Ewe",
   "Kabiye"
  ],
  "cur": {
   "code": "XOF",
   "sym": "Fr",
   "name": "West African CFA Franc"
  },
  "region": "West Africa",
  "hist": "A narrow strip of land along the Gulf of Guinea, Togo was a German protectorate from the late nineteenth century before being divided between Britain and France after World War I. The French-administered portion became independent Togo in 1960. The capital, Lomé, is a coastal port city, and the country's culture reflects a mix of Ewe, Kabiye, and other ethnic traditions, including Vodun practices.",
  "call": "+228",
  "drive": "right",
  "plugs": [
   "C"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "police": "117",
   "amb": "8200",
   "fire": "118"
  }
 },
 "UG": {
  "name": "Uganda",
  "pop": 48582334,
  "popYear": 2024,
  "langs": [
   "English",
   "Swahili",
   "Luganda"
  ],
  "cur": {
   "code": "UGX",
   "sym": "USh",
   "name": "Ugandan Shilling"
  },
  "region": "East Africa",
  "hist": "Often called the 'Pearl of Africa,' Uganda lies in the African Great Lakes region and incorporated several historic kingdoms, most notably Buganda, into its borders. It gained independence from Britain in 1962 and later endured a turbulent period under Idi Amin in the 1970s before achieving greater stability. Today it is known for mountain gorilla trekking in Bwindi, the source of the Nile at Jinja, and savanna wildlife in its national parks.",
  "call": "+256",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "240V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "999",
   "amb": "911",
   "fire": "999"
  }
 },
 "ZM": {
  "name": "Zambia",
  "pop": 20723965,
  "popYear": 2024,
  "langs": [
   "English",
   "Bemba",
   "Nyanja",
   "Tonga"
  ],
  "cur": {
   "code": "ZMW",
   "sym": "ZK",
   "name": "Zambian Kwacha"
  },
  "region": "Southern Africa",
  "hist": "Formerly the British protectorate of Northern Rhodesia, Zambia gained independence in 1964 under Kenneth Kaunda, taking its name from the Zambezi River. The economy was long shaped by copper mining in the Copperbelt region. The country is best known to travelers for sharing Victoria Falls with Zimbabwe and for extensive wildlife reserves such as South Luangwa National Park.",
  "call": "+260",
  "drive": "left",
  "plugs": [
   "C",
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "999",
   "amb": "992",
   "fire": "993"
  }
 },
 "ZW": {
  "name": "Zimbabwe",
  "pop": 16634373,
  "popYear": 2024,
  "langs": [
   "Shona",
   "Ndebele",
   "English"
  ],
  "cur": {
   "code": "USD",
   "sym": "$",
   "name": "United States Dollar"
  },
  "region": "Southern Africa",
  "hist": "Zimbabwe takes its name from Great Zimbabwe, the impressive medieval stone city built by a Shona-speaking civilization between roughly the 11th and 15th centuries. Formerly the British colony of Southern Rhodesia, it achieved internationally recognized independence in 1980. The country has used several currencies amid economic instability and now relies heavily on the US dollar; major attractions include Victoria Falls, Hwange National Park, and the Great Zimbabwe ruins.",
  "call": "+263",
  "drive": "left",
  "plugs": [
   "D",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "995",
   "amb": "994",
   "fire": "993"
  }
 },
 "AF": {
  "name": "Afghanistan",
  "pop": 43844000,
  "popYear": 2025,
  "langs": [
   "Dari",
   "Pashto",
   "Uzbek",
   "Turkmen"
  ],
  "cur": {
   "code": "AFN",
   "sym": "؋",
   "name": "Afghan afghani"
  },
  "region": "Central Asia",
  "hist": "Situated on historic Silk Road trade routes, Afghanistan has long been a crossroads of empires, leaving a rich legacy of Buddhist, Persian, and Islamic heritage seen at sites such as Herat, Balkh, and the Bamyan valley. The modern state emerged in the 18th century, gained full independence from British influence over its foreign affairs in 1919, and has experienced extended periods of conflict from the late 20th century onward. Kabul has served as the capital for much of the country's modern history.",
  "call": "+93",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "119",
   "amb": "112",
   "fire": "119"
  }
 },
 "BD": {
  "name": "Bangladesh",
  "pop": 169828911,
  "popYear": 2022,
  "langs": [
   "Bengali",
   "English"
  ],
  "cur": {
   "code": "BDT",
   "sym": "৳",
   "name": "Bangladeshi taka"
  },
  "region": "South Asia",
  "hist": "The region of Bengal has a deep cultural history tied to rivers, trade, and the arts, and was part of successive Indian empires and later British India. Following the 1947 partition it became East Pakistan, and after a war in 1971 it emerged as the independent nation of Bangladesh, with Dhaka as its capital. Bengali language and culture remain central to national identity, celebrated in festivals, literature, and cuisine.",
  "call": "+880",
  "drive": "left",
  "plugs": [
   "A",
   "C",
   "D",
   "G",
   "K"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "999"
  }
 },
 "BT": {
  "name": "Bhutan",
  "pop": 784043,
  "popYear": 2025,
  "langs": [
   "Dzongkha",
   "English"
  ],
  "cur": {
   "code": "BTN",
   "sym": "Nu.",
   "name": "Bhutanese ngultrum"
  },
  "region": "South Asia",
  "hist": "A small Himalayan kingdom, Bhutan was unified in the 17th century under a Buddhist administrative and religious system whose monastic fortresses, or dzongs, still define its towns. It remained largely isolated for centuries and became a hereditary monarchy in 1907; the country transitioned to a constitutional monarchy with parliamentary elections in 2008. Tibetan Buddhism profoundly shapes its architecture, festivals, and the policy emphasis on conserving culture and environment.",
  "call": "+975",
  "drive": "left",
  "plugs": [
   "C",
   "D",
   "M"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "113",
   "amb": "112",
   "fire": "110"
  }
 },
 "IN": {
  "name": "India",
  "pop": 1417492000,
  "popYear": 2025,
  "langs": [
   "Hindi",
   "English"
  ],
  "cur": {
   "code": "INR",
   "sym": "₹",
   "name": "Indian rupee"
  },
  "region": "South Asia",
  "hist": "Home to some of the world's oldest urban civilizations and the birthplace of Hinduism, Buddhism, Jainism, and Sikhism, the Indian subcontinent saw a succession of kingdoms and empires, including the Mauryan, Gupta, and Mughal periods, the last leaving landmarks such as the Taj Mahal. After a long period under British rule, India gained independence in 1947 and became a republic in 1950. Its enormous linguistic, religious, and regional diversity underpins a vibrant contemporary culture and is officially recognized through numerous scheduled languages.",
  "call": "+91",
  "drive": "left",
  "plugs": [
   "C",
   "D",
   "M"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "100",
   "amb": "108",
   "fire": "101"
  }
 },
 "KZ": {
  "name": "Kazakhstan",
  "pop": 20547909,
  "popYear": 2026,
  "langs": [
   "Kazakh",
   "Russian"
  ],
  "cur": {
   "code": "KZT",
   "sym": "₸",
   "name": "Kazakhstani tenge"
  },
  "region": "Central Asia",
  "hist": "The vast steppes of Kazakhstan were home to nomadic Turkic and Mongol peoples and crossed by Silk Road caravans for centuries. The territory was incorporated into the Russian Empire and later became a Soviet republic before gaining independence in 1991, after which the capital was eventually moved to the purpose-built city now called Astana. Traditions of horsemanship and nomadic heritage remain a strong cultural thread alongside a modern, multiethnic society.",
  "call": "+7",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "102",
   "amb": "103",
   "fire": "101"
  }
 },
 "KG": {
  "name": "Kyrgyzstan",
  "pop": 7404300,
  "popYear": 2026,
  "langs": [
   "Kyrgyz",
   "Russian"
  ],
  "cur": {
   "code": "KGS",
   "sym": "с",
   "name": "Kyrgyzstani som"
  },
  "region": "Central Asia",
  "hist": "A mountainous Central Asian country defined by the Tian Shan ranges, Kyrgyzstan has a nomadic heritage reflected in its epic oral traditions and yurt culture. The region passed under Russian imperial control in the 19th century and became a Soviet republic before declaring independence in 1991. Bishkek serves as the capital, and high-altitude landscapes such as Lake Issyk-Kul draw visitors today.",
  "call": "+996",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "102",
   "amb": "103",
   "fire": "101"
  }
 },
 "MV": {
  "name": "Maldives",
  "pop": 515132,
  "popYear": 2022,
  "langs": [
   "Dhivehi",
   "English"
  ],
  "cur": {
   "code": "MVR",
   "sym": ".ރ",
   "name": "Maldivian rufiyaa"
  },
  "region": "South Asia",
  "hist": "An archipelago of low-lying coral atolls in the Indian Ocean, the Maldives was historically a stop on maritime trade routes and converted to Islam in the 12th century, which remains central to its culture. Long a sultanate and later a British protectorate, it gained full independence in 1965 and became a republic in 1968, with Malé as its capital. Tourism centered on island resorts and marine environments is a defining feature of the modern economy.",
  "call": "+960",
  "drive": "left",
  "plugs": [
   "A",
   "C",
   "D",
   "G",
   "J",
   "K",
   "L"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "911",
   "police": "119",
   "amb": "100",
   "fire": "118"
  }
 },
 "NP": {
  "name": "Nepal",
  "pop": 29911840,
  "popYear": 2025,
  "langs": [
   "Nepali"
  ],
  "cur": {
   "code": "NPR",
   "sym": "रू",
   "name": "Nepalese rupee"
  },
  "region": "South Asia",
  "hist": "Lying along the southern Himalaya and containing Mount Everest, Nepal was unified into a single kingdom in the 18th century under the Shah dynasty. It is the birthplace of the Buddha at Lumbini and is known for both Hindu and Buddhist heritage, reflected in the temples and squares of the Kathmandu Valley. The monarchy was abolished in 2008, when Nepal became a federal democratic republic.",
  "call": "+977",
  "drive": "left",
  "plugs": [
   "C",
   "D",
   "M"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "100",
   "amb": "102",
   "fire": "101"
  }
 },
 "PK": {
  "name": "Pakistan",
  "pop": 241499431,
  "popYear": 2023,
  "langs": [
   "Urdu",
   "English",
   "Punjabi"
  ],
  "cur": {
   "code": "PKR",
   "sym": "₨",
   "name": "Pakistani rupee"
  },
  "region": "South Asia",
  "hist": "The Indus Valley, within present-day Pakistan, hosted one of the world's earliest urban civilizations at sites such as Mohenjo-daro and Harappa, and the region later saw Gandharan Buddhist, Persian, and Mughal influences. Pakistan was established in 1947 from the partition of British India and became an Islamic republic; its current capital is Islamabad, while Lahore and Karachi are major historic and commercial centers. Diverse provincial cultures and languages contribute to a varied national heritage.",
  "call": "+92",
  "drive": "left",
  "plugs": [
   "C",
   "D"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "15",
   "amb": "1122",
   "fire": "16"
  }
 },
 "LK": {
  "name": "Sri Lanka",
  "pop": 21781800,
  "popYear": 2024,
  "langs": [
   "Sinhala",
   "Tamil",
   "English"
  ],
  "cur": {
   "code": "LKR",
   "sym": "₨",
   "name": "Sri Lankan rupee"
  },
  "region": "South Asia",
  "hist": "An island nation off the southern tip of India, Sri Lanka has a long recorded history with ancient capitals such as Anuradhapura and Polonnaruwa and a strong Theravada Buddhist tradition alongside Hindu, Muslim, and Christian communities. Coastal areas were controlled successively by Portuguese, Dutch, and British powers, and the country gained independence in 1948, adopting the name Sri Lanka in 1972. Its cultural sites, tea-growing highlands, and beaches are notable for travelers.",
  "call": "+94",
  "drive": "left",
  "plugs": [
   "D",
   "G",
   "M"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "119",
   "amb": "110",
   "fire": "110"
  }
 },
 "TJ": {
  "name": "Tajikistan",
  "pop": 10721000,
  "popYear": 2026,
  "langs": [
   "Tajik",
   "Russian"
  ],
  "cur": {
   "code": "TJS",
   "sym": "ЅМ",
   "name": "Tajikistani somoni"
  },
  "region": "Central Asia",
  "hist": "A predominantly mountainous country dominated by the Pamir ranges, Tajikistan shares deep cultural and linguistic ties with the Persian world, and historic cities of the region were centers of learning along the Silk Road. The territory became a Soviet republic and gained independence in 1991, with Dushanbe as its capital. Persian-influenced language, poetry, and cuisine remain central to national identity.",
  "call": "+992",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "102",
   "amb": "103",
   "fire": "101"
  }
 },
 "TM": {
  "name": "Turkmenistan",
  "pop": 7057841,
  "popYear": 2022,
  "langs": [
   "Turkmen",
   "Russian"
  ],
  "cur": {
   "code": "TMT",
   "sym": "m",
   "name": "Turkmenistani manat"
  },
  "region": "Central Asia",
  "hist": "Largely covered by the Karakum Desert, Turkmenistan lies along ancient Silk Road routes, and the ruins of Merv were once among the great cities of the medieval Islamic world. Home historically to Turkmen nomadic tribes known for carpet weaving and horse breeding, the territory became a Soviet republic and gained independence in 1991. Ashgabat, the capital, is known for its distinctive white-marble architecture.",
  "call": "+993",
  "drive": "right",
  "plugs": [
   "B",
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "02",
   "amb": "03",
   "fire": "01"
  }
 },
 "UZ": {
  "name": "Uzbekistan",
  "pop": 38382685,
  "popYear": 2026,
  "langs": [
   "Uzbek",
   "Russian"
  ],
  "cur": {
   "code": "UZS",
   "sym": "soʻm",
   "name": "Uzbekistani so'm"
  },
  "region": "Central Asia",
  "hist": "Uzbekistan sits at the heart of historic Central Asia and contains the celebrated Silk Road cities of Samarkand, Bukhara, and Khiva, renowned for their mosques, madrasas, and tilework. The region was a center of trade, science, and Islamic scholarship under empires including the Timurid dynasty, then came under Russian and later Soviet rule before independence in 1991. Tashkent is the capital and largest city, and the country's monumental architecture is a principal draw for travelers.",
  "call": "+998",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "102",
   "amb": "103",
   "fire": "101"
  }
 },
 "BN": {
  "name": "Brunei",
  "pop": 450500,
  "popYear": 2023,
  "langs": [
   "Malay",
   "English",
   "Chinese"
  ],
  "cur": {
   "code": "BND",
   "sym": "$",
   "name": "Brunei Dollar"
  },
  "region": "Maritime Southeast Asia",
  "hist": "Brunei was a powerful maritime sultanate from the 15th century, at its height controlling much of Borneo and the southern Philippines. It became a British protectorate in 1888 and gained full independence in 1984. Oil and gas wealth, discovered in the 1920s, transformed the small nation and shaped its present prosperity under a long-ruling sultanate.",
  "call": "+673",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "240V",
  "freq": "50Hz",
  "emerg": {
   "police": "993",
   "amb": "991",
   "fire": "995"
  }
 },
 "KH": {
  "name": "Cambodia",
  "pop": 16700000,
  "popYear": 2023,
  "langs": [
   "Khmer",
   "English",
   "French"
  ],
  "cur": {
   "code": "KHR",
   "sym": "៛",
   "name": "Cambodian Riel"
  },
  "region": "Mainland Southeast Asia",
  "hist": "Cambodia was the heart of the Khmer Empire (9th-15th centuries), whose capital Angkor produced the temple complex of Angkor Wat, today the country's defining cultural symbol. After periods of regional decline and French colonial rule, it gained independence in 1953. The 1970s brought conflict and the Khmer Rouge era, after which the country gradually rebuilt and reopened to tourism.",
  "call": "+855",
  "drive": "right",
  "plugs": [
   "A",
   "C",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "117",
   "amb": "119",
   "fire": "118"
  }
 },
 "CN": {
  "name": "China",
  "pop": 1409670000,
  "popYear": 2023,
  "langs": [
   "Mandarin Chinese",
   "Cantonese",
   "English"
  ],
  "cur": {
   "code": "CNY",
   "sym": "¥",
   "name": "Renminbi (Yuan)"
  },
  "region": "East Asia",
  "hist": "China is home to one of the world's oldest continuous civilizations, with a succession of dynasties spanning several millennia that left landmarks such as the Great Wall and the Forbidden City. Imperial rule ended in 1912, and the People's Republic of China was founded in 1949. Rapid economic reform from the late 1970s onward transformed it into a major global economy and a leading travel destination.",
  "call": "+86",
  "drive": "right",
  "plugs": [
   "A",
   "C",
   "I"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "110",
   "amb": "120",
   "fire": "119"
  }
 },
 "TL": {
  "name": "Timor-Leste",
  "pop": 1360000,
  "popYear": 2023,
  "langs": [
   "Tetum",
   "Portuguese",
   "Indonesian",
   "English"
  ],
  "cur": {
   "code": "USD",
   "sym": "$",
   "name": "United States Dollar"
  },
  "region": "Maritime Southeast Asia",
  "hist": "Timor-Leste (East Timor) was a Portuguese colony for several centuries, leaving a lasting Catholic and Lusophone influence on its culture. After Portuguese withdrawal in 1975 it was annexed by Indonesia, then voted for independence in a 1999 referendum. It became fully independent in 2002 as one of Asia's youngest nations, drawing visitors to its mountainous landscapes and coral reefs.",
  "call": "+670",
  "drive": "left",
  "plugs": [
   "C",
   "E",
   "F",
   "I"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112"
  }
 },
 "ID": {
  "name": "Indonesia",
  "pop": 281190000,
  "popYear": 2024,
  "langs": [
   "Indonesian",
   "Javanese",
   "Sundanese",
   "English"
  ],
  "cur": {
   "code": "IDR",
   "sym": "Rp",
   "name": "Indonesian Rupiah"
  },
  "region": "Maritime Southeast Asia",
  "hist": "Indonesia is an archipelago of thousands of islands long shaped by maritime trade, Hindu-Buddhist kingdoms such as Majapahit, and the later spread of Islam. Centuries of Dutch colonial rule ended when independence was proclaimed in 1945 and recognized in 1949. Today it is the world's most populous Muslim-majority nation and a vast cultural mosaic, with Bali, Java, and Sumatra among its best-known destinations.",
  "call": "+62",
  "drive": "left",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "112",
   "police": "110",
   "amb": "118",
   "fire": "113"
  }
 },
 "JP": {
  "name": "Japan",
  "pop": 124000000,
  "popYear": 2024,
  "langs": [
   "Japanese"
  ],
  "cur": {
   "code": "JPY",
   "sym": "¥",
   "name": "Japanese Yen"
  },
  "region": "East Asia",
  "hist": "Japan developed a distinctive culture over centuries, including the long Edo period of relative isolation under the shogunate. The Meiji Restoration of 1868 launched rapid modernization, and after the Second World War the country rebuilt into a leading industrial and technological power. Its blend of preserved traditions, temples, and modern cities makes it a major global travel destination.",
  "call": "+81",
  "drive": "left",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "100V",
  "freq": "50Hz",
  "emerg": {
   "police": "110",
   "amb": "119",
   "fire": "119"
  }
 },
 "LA": {
  "name": "Laos",
  "pop": 7630000,
  "popYear": 2023,
  "langs": [
   "Lao",
   "French",
   "English"
  ],
  "cur": {
   "code": "LAK",
   "sym": "₭",
   "name": "Lao Kip"
  },
  "region": "Mainland Southeast Asia",
  "hist": "Laos traces its identity to the kingdom of Lan Xang, founded in the 14th century, whose Buddhist heritage endures in cities like Luang Prabang. It became part of French Indochina before gaining independence in the mid-20th century and later established a one-party socialist state. The landlocked country is known today for the Mekong River, mountainous terrain, and well-preserved temple towns.",
  "call": "+856",
  "drive": "right",
  "plugs": [
   "A",
   "B",
   "C",
   "E",
   "F"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "191",
   "amb": "195",
   "fire": "190"
  }
 },
 "MY": {
  "name": "Malaysia",
  "pop": 34060000,
  "popYear": 2024,
  "langs": [
   "Malay",
   "English",
   "Chinese",
   "Tamil"
  ],
  "cur": {
   "code": "MYR",
   "sym": "RM",
   "name": "Malaysian Ringgit"
  },
  "region": "Maritime Southeast Asia",
  "hist": "Malaysia emerged from a string of Malay sultanates and the historic trading port of Malacca, a hub influenced by Malay, Chinese, Indian, and European contact. After British colonial rule, the Federation of Malaya gained independence in 1957, and modern Malaysia formed in 1963. Its multicultural society spans the peninsula and the Borneo states of Sabah and Sarawak.",
  "call": "+60",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "999"
  }
 },
 "MM": {
  "name": "Myanmar",
  "pop": 54500000,
  "popYear": 2023,
  "langs": [
   "Burmese",
   "English"
  ],
  "cur": {
   "code": "MMK",
   "sym": "K",
   "name": "Myanmar Kyat"
  },
  "region": "Mainland Southeast Asia",
  "hist": "Myanmar (Burma) was home to powerful Buddhist kingdoms, including Bagan, whose plain of temples remains a major cultural landmark. It came under British rule in the 19th century and gained independence in 1948. The country has experienced long periods of military governance, and its heritage sites, pagodas, and diverse ethnic regions define its cultural landscape.",
  "call": "+95",
  "drive": "right",
  "plugs": [
   "C",
   "D",
   "F",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "999",
   "police": "199",
   "amb": "192",
   "fire": "191"
  }
 },
 "MN": {
  "name": "Mongolia",
  "pop": 3470000,
  "popYear": 2023,
  "langs": [
   "Mongolian",
   "Russian",
   "English"
  ],
  "cur": {
   "code": "MNT",
   "sym": "₮",
   "name": "Mongolian Tugrik"
  },
  "region": "East Asia",
  "hist": "Mongolia is the homeland of the nomadic empire founded by Genghis Khan in the 13th century, once the largest contiguous land empire in history. It later came under Qing influence before establishing independence in the early 20th century and a long socialist period aligned with the Soviet Union. Since the 1990s it has been a democracy, known for vast steppe landscapes and enduring nomadic traditions.",
  "call": "+976",
  "drive": "right",
  "plugs": [
   "C",
   "E"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "105",
   "police": "102",
   "amb": "103",
   "fire": "101"
  }
 },
 "KP": {
  "name": "North Korea",
  "pop": 26160000,
  "popYear": 2023,
  "langs": [
   "Korean"
  ],
  "cur": {
   "code": "KPW",
   "sym": "₩",
   "name": "North Korean Won"
  },
  "region": "East Asia",
  "hist": "North Korea (the Democratic People's Republic of Korea) was established in 1948 following the division of the Korean Peninsula at the end of Japanese colonial rule. The Korean War (1950-1953) ended in an armistice that left the peninsula divided along the Demilitarized Zone. It remains one of the world's most isolated states, with tightly controlled and limited access for visitors.",
  "call": "+850",
  "drive": "right",
  "plugs": [
   "A",
   "C",
   "F"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "fire": "110"
  }
 },
 "KR": {
  "name": "South Korea",
  "pop": 51750000,
  "popYear": 2024,
  "langs": [
   "Korean",
   "English"
  ],
  "cur": {
   "code": "KRW",
   "sym": "₩",
   "name": "South Korean Won"
  },
  "region": "East Asia",
  "hist": "South Korea shares a long peninsular history shaped by dynasties such as Joseon, whose palaces and traditions remain visible in Seoul. After Japanese colonial rule ended in 1945 and the peninsula was divided, the Republic of Korea was founded in 1948. Rapid post-war development transformed it into a high-tech economy and a global cultural exporter through film, music, and cuisine.",
  "call": "+82",
  "drive": "right",
  "plugs": [
   "C",
   "F"
  ],
  "volt": "220V",
  "freq": "60Hz",
  "emerg": {
   "police": "112",
   "amb": "119",
   "fire": "119"
  }
 },
 "PH": {
  "name": "Philippines",
  "pop": 114200000,
  "popYear": 2024,
  "langs": [
   "Filipino",
   "English",
   "Cebuano",
   "Tagalog"
  ],
  "cur": {
   "code": "PHP",
   "sym": "₱",
   "name": "Philippine Peso"
  },
  "region": "Maritime Southeast Asia",
  "hist": "The Philippines is an archipelago of over seven thousand islands settled by diverse Austronesian peoples and later shaped by more than three centuries of Spanish rule, which spread Catholicism and Hispanic influence. It passed to American administration around 1898 before gaining independence in 1946. Its culture blends indigenous, Spanish, and American elements, and its beaches and reefs are major draws.",
  "call": "+63",
  "drive": "right",
  "plugs": [
   "A",
   "B",
   "C"
  ],
  "volt": "220V",
  "freq": "60Hz",
  "emerg": {
   "all": "911"
  }
 },
 "SG": {
  "name": "Singapore",
  "pop": 5920000,
  "popYear": 2024,
  "langs": [
   "English",
   "Malay",
   "Mandarin Chinese",
   "Tamil"
  ],
  "cur": {
   "code": "SGD",
   "sym": "$",
   "name": "Singapore Dollar"
  },
  "region": "Maritime Southeast Asia",
  "hist": "Singapore grew from a regional trading post into a major British colonial port after its founding as a trading settlement in 1819. It was part of Malaysia briefly before becoming fully independent in 1965. Through rapid development it became a global financial and shipping hub, known today for its multicultural population, cuisine, and modern skyline.",
  "call": "+65",
  "drive": "left",
  "plugs": [
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "999",
   "police": "999",
   "amb": "995",
   "fire": "995"
  }
 },
 "TH": {
  "name": "Thailand",
  "pop": 71700000,
  "popYear": 2023,
  "langs": [
   "Thai",
   "English"
  ],
  "cur": {
   "code": "THB",
   "sym": "฿",
   "name": "Thai Baht"
  },
  "region": "Mainland Southeast Asia",
  "hist": "Thailand traces its statehood to kingdoms such as Sukhothai and Ayutthaya, and it is notable as the only Southeast Asian nation never formally colonized by a European power. The kingdom modernized under a series of monarchs and transitioned to a constitutional monarchy in 1932. Its Buddhist temples, monarchy, cuisine, and beaches make it one of Asia's most visited countries.",
  "call": "+66",
  "drive": "left",
  "plugs": [
   "A",
   "B",
   "C",
   "O"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "191",
   "police": "191",
   "amb": "1669",
   "fire": "199"
  }
 },
 "VN": {
  "name": "Vietnam",
  "pop": 100300000,
  "popYear": 2023,
  "langs": [
   "Vietnamese",
   "English"
  ],
  "cur": {
   "code": "VND",
   "sym": "₫",
   "name": "Vietnamese Dong"
  },
  "region": "Mainland Southeast Asia",
  "hist": "Vietnam has a long history marked by periods of Chinese influence and independent dynasties that shaped its language, cuisine, and architecture. It became part of French Indochina in the 19th century, and following mid-20th-century conflict and division, the country was reunified in 1975. Today it is known for cities such as Hanoi and Ho Chi Minh City, its coastline, and sites like Ha Long Bay.",
  "call": "+84",
  "drive": "right",
  "plugs": [
   "A",
   "B",
   "C",
   "F"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "police": "113",
   "amb": "115",
   "fire": "114"
  }
 },
 "TW": {
  "name": "Taiwan",
  "pop": 23420000,
  "popYear": 2023,
  "langs": [
   "Mandarin Chinese",
   "Taiwanese Hokkien",
   "Hakka",
   "English"
  ],
  "cur": {
   "code": "TWD",
   "sym": "NT$",
   "name": "New Taiwan Dollar"
  },
  "region": "East Asia",
  "hist": "Taiwan was settled by indigenous Austronesian peoples and later saw Dutch, Spanish, and Chinese settlement before a period of Japanese rule from 1895 to 1945. The Republic of China government relocated to the island in 1949, and it subsequently developed into a prosperous, democratic, high-technology society. Visitors are drawn to its night markets, mountains, and blend of Chinese, Japanese, and indigenous heritage.",
  "call": "+886",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "110V",
  "freq": "60Hz",
  "emerg": {
   "all": "112",
   "police": "110",
   "amb": "119",
   "fire": "119"
  }
 },
 "HK": {
  "name": "Hong Kong",
  "pop": 7500000,
  "popYear": 2023,
  "langs": [
   "Cantonese",
   "English",
   "Mandarin Chinese"
  ],
  "cur": {
   "code": "HKD",
   "sym": "HK$",
   "name": "Hong Kong Dollar"
  },
  "region": "East Asia",
  "hist": "Hong Kong became a British colony in stages during the 19th century and grew into a major international trading and financial port. Sovereignty was transferred to China in 1997, after which it has been governed as a Special Administrative Region with its own currency and legal system. Its dense skyline, harbor, and fusion of Cantonese and international culture make it a prominent travel hub.",
  "call": null,
  "drive": null,
  "plugs": [
   "G"
  ],
  "volt": "220V",
  "freq": "50Hz",
  "emerg": {
   "all": "999",
   "police": "999",
   "amb": "999",
   "fire": "999"
  }
 },
 "AU": {
  "name": "Australia",
  "pop": 26900000,
  "popYear": 2024,
  "langs": [
   "English"
  ],
  "cur": {
   "code": "AUD",
   "sym": "$",
   "name": "Australian Dollar"
  },
  "region": "Australasia",
  "hist": "Australia has been inhabited by Aboriginal and Torres Strait Islander peoples for tens of thousands of years, representing some of the world's oldest continuous cultures. British colonisation began in 1788 with a penal settlement at Sydney Cove, and six separate colonies were established over the following century. These federated into the Commonwealth of Australia in 1901. Subsequent waves of migration from Europe, Asia, and beyond have shaped its contemporary multicultural society.",
  "call": "+61",
  "drive": "left",
  "plugs": [
   "I"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "000"
  }
 },
 "FJ": {
  "name": "Fiji",
  "pop": 925000,
  "popYear": 2024,
  "langs": [
   "Fijian",
   "English",
   "Fiji Hindi"
  ],
  "cur": {
   "code": "FJD",
   "sym": "$",
   "name": "Fijian Dollar"
  },
  "region": "Melanesia",
  "hist": "Fiji was settled by Austronesian and later Melanesian peoples over several millennia, developing distinct chiefly societies. It became a British colony in 1874, during which indentured labourers were brought from India to work on sugar plantations, creating the large Indo-Fijian community that remains central to the country's culture. Fiji gained independence in 1970 and has since experienced periods of political change, including several coups. Today it is a regional hub for travel and commerce in the South Pacific.",
  "call": "+679",
  "drive": "left",
  "plugs": [
   "I"
  ],
  "volt": "240V",
  "freq": "50Hz",
  "emerg": {
   "all": "911",
   "police": "917",
   "fire": "910"
  }
 },
 "KI": {
  "name": "Kiribati",
  "pop": 133000,
  "popYear": 2024,
  "langs": [
   "Gilbertese",
   "English"
  ],
  "cur": {
   "code": "AUD",
   "sym": "$",
   "name": "Australian Dollar"
  },
  "region": "Micronesia",
  "hist": "Kiribati comprises 33 widely scattered atolls and reef islands straddling the equator and the International Date Line. Settled by Micronesian peoples thousands of years ago, the islands became the British Gilbert and Ellice Islands colony in the late 19th century. Some atolls saw significant fighting during the Second World War, notably the Battle of Tarawa. Kiribati became independent in 1979 and is widely noted today for its vulnerability to rising sea levels.",
  "call": "+686",
  "drive": "left",
  "plugs": [
   "I"
  ],
  "volt": "240V",
  "freq": "50Hz",
  "emerg": {
   "all": "999",
   "police": "192",
   "amb": "194",
   "fire": "193"
  }
 },
 "MH": {
  "name": "Marshall Islands",
  "pop": 41000,
  "popYear": 2024,
  "langs": [
   "Marshallese",
   "English"
  ],
  "cur": {
   "code": "USD",
   "sym": "$",
   "name": "United States Dollar"
  },
  "region": "Micronesia",
  "hist": "The Marshall Islands consist of two chains of coral atolls settled by Micronesian navigators known for traditional stick-chart wayfinding. The islands passed through Spanish, German, and Japanese administration before becoming part of a United States-administered trust territory after the Second World War. Bikini and Enewetak atolls were sites of extensive US nuclear testing in the 1940s and 1950s. The country gained sovereignty in 1986 under a Compact of Free Association with the United States.",
  "call": "+692",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911"
  }
 },
 "FM": {
  "name": "Micronesia",
  "pop": 114000,
  "popYear": 2024,
  "langs": [
   "English",
   "Chuukese",
   "Pohnpeian",
   "Yapese",
   "Kosraean"
  ],
  "cur": {
   "code": "USD",
   "sym": "$",
   "name": "United States Dollar"
  },
  "region": "Micronesia",
  "hist": "The Federated States of Micronesia spans four states — Yap, Chuuk, Pohnpei, and Kosrae — across the western Pacific. The region holds ancient sites such as the stone city of Nan Madol on Pohnpei, and its islands passed through Spanish, German, and Japanese control before falling under US trusteeship after the Second World War. The federation adopted its constitution in 1979 and entered into a Compact of Free Association with the United States in 1986. Distinct languages and traditions persist across each of the four states.",
  "call": "+691",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911"
  }
 },
 "NR": {
  "name": "Nauru",
  "pop": 12000,
  "popYear": 2024,
  "langs": [
   "Nauruan",
   "English"
  ],
  "cur": {
   "code": "AUD",
   "sym": "$",
   "name": "Australian Dollar"
  },
  "region": "Micronesia",
  "hist": "Nauru, one of the world's smallest nations, was settled by Micronesian and Polynesian peoples organised into traditional clans. Annexed by Germany in the late 19th century and later administered under Australian-led mandates, the island's economy was transformed by extensive phosphate mining through much of the 20th century. Nauru became independent in 1968. The legacy of mining reshaped much of the island's interior landscape.",
  "call": "+674",
  "drive": "left",
  "plugs": [
   "I"
  ],
  "volt": "240V",
  "freq": "50Hz",
  "emerg": {
   "police": "110",
   "amb": "111",
   "fire": "112"
  }
 },
 "NZ": {
  "name": "New Zealand",
  "pop": 5230000,
  "popYear": 2024,
  "langs": [
   "English",
   "Maori",
   "New Zealand Sign Language"
  ],
  "cur": {
   "code": "NZD",
   "sym": "$",
   "name": "New Zealand Dollar"
  },
  "region": "Australasia",
  "hist": "New Zealand was first settled by Polynesian voyagers, ancestors of the Maori, around the 13th century. European contact intensified after James Cook's voyages in the 1770s, and in 1840 the Treaty of Waitangi was signed between the British Crown and Maori chiefs, a founding document still central to national life. The country became a self-governing dominion and later a fully independent nation within the Commonwealth. Maori culture and the bicultural relationship it anchors remain defining features of contemporary New Zealand.",
  "call": "+64",
  "drive": "left",
  "plugs": [
   "I"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "111"
  }
 },
 "PW": {
  "name": "Palau",
  "pop": 18000,
  "popYear": 2024,
  "langs": [
   "Palauan",
   "English"
  ],
  "cur": {
   "code": "USD",
   "sym": "$",
   "name": "United States Dollar"
  },
  "region": "Micronesia",
  "hist": "Palau, an archipelago in the western Pacific, was settled by migrants from maritime Southeast Asia thousands of years ago. It passed through Spanish, German, and Japanese administration before becoming part of a US-administered trust territory after the Second World War, during which Peleliu was the scene of heavy fighting. Palau became independent in 1994 under a Compact of Free Association with the United States. It is internationally known for marine conservation, including its Rock Islands and Jellyfish Lake.",
  "call": "+680",
  "drive": "right",
  "plugs": [
   "A",
   "B"
  ],
  "volt": "120V",
  "freq": "60Hz",
  "emerg": {
   "all": "911"
  }
 },
 "PG": {
  "name": "Papua New Guinea",
  "pop": 10300000,
  "popYear": 2024,
  "langs": [
   "Tok Pisin",
   "English",
   "Hiri Motu"
  ],
  "cur": {
   "code": "PGK",
   "sym": "K",
   "name": "Papua New Guinean Kina"
  },
  "region": "Melanesia",
  "hist": "Papua New Guinea has been inhabited for tens of thousands of years and is one of the most linguistically diverse countries on Earth, with over 800 languages. Its eastern New Guinea territories were administered separately by Germany and Britain, later passing under Australian control through much of the 20th century. The country gained independence from Australia in 1975. Highland and coastal communities maintain rich and varied traditional cultures.",
  "call": "+675",
  "drive": "left",
  "plugs": [
   "I"
  ],
  "volt": "240V",
  "freq": "50Hz",
  "emerg": {
   "police": "112",
   "amb": "111",
   "fire": "110"
  }
 },
 "WS": {
  "name": "Samoa",
  "pop": 222000,
  "popYear": 2024,
  "langs": [
   "Samoan",
   "English"
  ],
  "cur": {
   "code": "WST",
   "sym": "$",
   "name": "Samoan Tala"
  },
  "region": "Polynesia",
  "hist": "Samoa was settled by Polynesian peoples around three thousand years ago and is often considered a cradle of Polynesian culture, expressed through the enduring social system known as fa'a Samoa. The islands came under German and then New Zealand administration in the early 20th century. Samoa became the first Pacific island nation to gain independence, in 1962. Traditional village governance and customary land tenure remain central to daily life.",
  "call": "+685",
  "drive": "left",
  "plugs": [
   "I"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "999",
   "police": "995",
   "amb": "996",
   "fire": "994"
  }
 },
 "SB": {
  "name": "Solomon Islands",
  "pop": 740000,
  "popYear": 2024,
  "langs": [
   "English",
   "Solomon Islands Pijin"
  ],
  "cur": {
   "code": "SBD",
   "sym": "$",
   "name": "Solomon Islands Dollar"
  },
  "region": "Melanesia",
  "hist": "The Solomon Islands, a large Melanesian archipelago, were settled by Austronesian-speaking peoples thousands of years ago and are home to many distinct languages and customs. The islands became a British protectorate in the late 19th century and were the site of major Second World War campaigns, including the Battle of Guadalcanal. The country gained independence in 1978. Customary land ownership and village-based life remain prominent throughout the islands.",
  "call": "+677",
  "drive": "left",
  "plugs": [
   "I",
   "G"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "999",
   "police": "999",
   "amb": "111",
   "fire": "988"
  }
 },
 "TO": {
  "name": "Tonga",
  "pop": 105000,
  "popYear": 2024,
  "langs": [
   "Tongan",
   "English"
  ],
  "cur": {
   "code": "TOP",
   "sym": "T$",
   "name": "Tongan Pa'anga"
  },
  "region": "Polynesia",
  "hist": "Tonga was settled by Polynesians around three thousand years ago and developed a powerful maritime chiefdom centred on the Tu'i Tonga line. Unified as a kingdom under King George Tupou I in the 19th century, it adopted a constitution in 1875. Tonga is distinctive as the only Pacific nation never formally colonised, having retained its monarchy throughout, though it was a British-protected state for part of the 20th century. The monarchy and traditional rank remain central to Tongan identity.",
  "call": "+676",
  "drive": "left",
  "plugs": [
   "I"
  ],
  "volt": "240V",
  "freq": "50Hz",
  "emerg": {
   "all": "911",
   "police": "922",
   "amb": "933",
   "fire": "999"
  }
 },
 "TV": {
  "name": "Tuvalu",
  "pop": 11000,
  "popYear": 2024,
  "langs": [
   "Tuvaluan",
   "English"
  ],
  "cur": {
   "code": "AUD",
   "sym": "$",
   "name": "Australian Dollar"
  },
  "region": "Polynesia",
  "hist": "Tuvalu is a chain of nine low-lying atolls and reef islands settled by Polynesian voyagers. Administered with the Gilbert Islands as the British Gilbert and Ellice Islands colony, the Ellice Islands voted to separate in the 1970s and became independent Tuvalu in 1978. With a very small population and minimal land elevation, the nation is among the most exposed in the world to rising sea levels. Traditional island communities and customs remain strong.",
  "call": "+688",
  "drive": "left",
  "plugs": [
   "I"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "all": "911",
   "police": "911",
   "amb": "999",
   "fire": "000"
  }
 },
 "VU": {
  "name": "Vanuatu",
  "pop": 335000,
  "popYear": 2024,
  "langs": [
   "Bislama",
   "English",
   "French"
  ],
  "cur": {
   "code": "VUV",
   "sym": "VT",
   "name": "Vanuatu Vatu"
  },
  "region": "Melanesia",
  "hist": "Vanuatu, a Melanesian archipelago, was settled by Austronesian peoples roughly three thousand years ago and retains exceptional cultural and linguistic diversity. The islands were jointly governed by Britain and France as the New Hebrides condominium for much of the 20th century, a dual administration that left a lasting bilingual legacy. The country gained independence as Vanuatu in 1980. Customary practices, known locally as kastom, continue to shape community life.",
  "call": "+678",
  "drive": "right",
  "plugs": [
   "C",
   "G",
   "I"
  ],
  "volt": "230V",
  "freq": "50Hz",
  "emerg": {
   "police": "111",
   "amb": "112",
   "fire": "113"
  }
 }
};

// ─── PHRASES_BY_LANG — traveler phrasebook keyed by language (28 phrases + numbers
// 1-10, native script + pronunciation). Generated then verified by a fluent-speaker
// reviewer per language. Consumed by buildPhrasebookSection() via the country's
// primary language (COUNTRY_FACTS[iso2].langs).
const PHRASES_BY_LANG = {
 "English": {
  "native": "English",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Hello",
    "pron": "huh-LOH"
   },
   {
    "en": "Goodbye",
    "loc": "Goodbye",
    "pron": "good-BYE"
   },
   {
    "en": "Please",
    "loc": "Please",
    "pron": "pleez"
   },
   {
    "en": "Thank you",
    "loc": "Thank you",
    "pron": "THANK yoo"
   },
   {
    "en": "You're welcome",
    "loc": "You're welcome",
    "pron": "yor WEL-kum"
   },
   {
    "en": "Yes",
    "loc": "Yes",
    "pron": "yes"
   },
   {
    "en": "No",
    "loc": "No",
    "pron": "noh"
   },
   {
    "en": "Excuse me",
    "loc": "Excuse me",
    "pron": "ik-SKYOOZ mee"
   },
   {
    "en": "Sorry",
    "loc": "Sorry",
    "pron": "SOR-ee"
   },
   {
    "en": "Do you speak English?",
    "loc": "Do you speak English?",
    "pron": "doo yoo speek ING-glish"
   },
   {
    "en": "I don't understand",
    "loc": "I don't understand",
    "pron": "eye dohnt un-der-STAND"
   },
   {
    "en": "Help!",
    "loc": "Help!",
    "pron": "help"
   },
   {
    "en": "How much is this?",
    "loc": "How much is this?",
    "pron": "how much iz this"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Where is the toilet?",
    "pron": "wair iz thuh TOY-let"
   },
   {
    "en": "I would like this",
    "loc": "I would like this",
    "pron": "eye wood lyke this"
   },
   {
    "en": "The bill, please",
    "loc": "The bill, please",
    "pron": "thuh bil, pleez"
   },
   {
    "en": "Water",
    "loc": "Water",
    "pron": "WAH-ter"
   },
   {
    "en": "Good morning",
    "loc": "Good morning",
    "pron": "good MOR-ning"
   },
   {
    "en": "Good evening",
    "loc": "Good evening",
    "pron": "good EEV-ning"
   },
   {
    "en": "My name is …",
    "loc": "My name is …",
    "pron": "my naym iz …"
   },
   {
    "en": "How are you?",
    "loc": "How are you?",
    "pron": "how ar yoo"
   },
   {
    "en": "I need a doctor",
    "loc": "I need a doctor",
    "pron": "eye need uh DOK-ter"
   },
   {
    "en": "Call the police",
    "loc": "Call the police",
    "pron": "kawl thuh puh-LEES"
   },
   {
    "en": "Left",
    "loc": "Left",
    "pron": "left"
   },
   {
    "en": "Right",
    "loc": "Right",
    "pron": "rite"
   },
   {
    "en": "Where is the train station?",
    "loc": "Where is the train station?",
    "pron": "wair iz thuh trayn STAY-shun"
   },
   {
    "en": "How do I get to …?",
    "loc": "How do I get to …?",
    "pron": "how doo eye get too …"
   },
   {
    "en": "Delicious!",
    "loc": "Delicious!",
    "pron": "dih-LISH-us"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "one",
    "pron": "wun"
   },
   {
    "n": 2,
    "loc": "two",
    "pron": "too"
   },
   {
    "n": 3,
    "loc": "three",
    "pron": "three"
   },
   {
    "n": 4,
    "loc": "four",
    "pron": "for"
   },
   {
    "n": 5,
    "loc": "five",
    "pron": "fyve"
   },
   {
    "n": 6,
    "loc": "six",
    "pron": "siks"
   },
   {
    "n": 7,
    "loc": "seven",
    "pron": "SEV-en"
   },
   {
    "n": 8,
    "loc": "eight",
    "pron": "ayt"
   },
   {
    "n": 9,
    "loc": "nine",
    "pron": "nyne"
   },
   {
    "n": 10,
    "loc": "ten",
    "pron": "ten"
   }
  ]
 },
 "Spanish": {
  "native": "español",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Hola",
    "pron": "OH-lah"
   },
   {
    "en": "Goodbye",
    "loc": "Adiós",
    "pron": "ah-DYOHS"
   },
   {
    "en": "Please",
    "loc": "Por favor",
    "pron": "por fah-VOR"
   },
   {
    "en": "Thank you",
    "loc": "Gracias",
    "pron": "GRAH-syahs"
   },
   {
    "en": "You're welcome",
    "loc": "De nada",
    "pron": "deh NAH-dah"
   },
   {
    "en": "Yes",
    "loc": "Sí",
    "pron": "see"
   },
   {
    "en": "No",
    "loc": "No",
    "pron": "noh"
   },
   {
    "en": "Excuse me",
    "loc": "Disculpe",
    "pron": "dees-KOOL-peh"
   },
   {
    "en": "Sorry",
    "loc": "Perdón",
    "pron": "pehr-DOHN"
   },
   {
    "en": "Do you speak English?",
    "loc": "¿Habla inglés?",
    "pron": "AH-blah een-GLEHS"
   },
   {
    "en": "I don't understand",
    "loc": "No entiendo",
    "pron": "noh ehn-TYEHN-doh"
   },
   {
    "en": "Help!",
    "loc": "¡Socorro!",
    "pron": "soh-KOH-rroh"
   },
   {
    "en": "How much is this?",
    "loc": "¿Cuánto cuesta esto?",
    "pron": "KWAHN-toh KWEHS-tah EHS-toh"
   },
   {
    "en": "Where is the toilet?",
    "loc": "¿Dónde está el baño?",
    "pron": "DOHN-deh ehs-TAH ehl BAH-nyoh"
   },
   {
    "en": "I would like this",
    "loc": "Quisiera esto",
    "pron": "kee-SYEH-rah EHS-toh"
   },
   {
    "en": "The bill, please",
    "loc": "La cuenta, por favor",
    "pron": "lah KWEHN-tah, por fah-VOR"
   },
   {
    "en": "Water",
    "loc": "Agua",
    "pron": "AH-gwah"
   },
   {
    "en": "Good morning",
    "loc": "Buenos días",
    "pron": "BWEH-nohs DEE-ahs"
   },
   {
    "en": "Good evening",
    "loc": "Buenas tardes",
    "pron": "BWEH-nahs TAR-dehs"
   },
   {
    "en": "My name is …",
    "loc": "Me llamo …",
    "pron": "meh YAH-moh …"
   },
   {
    "en": "How are you?",
    "loc": "¿Cómo está?",
    "pron": "KOH-moh ehs-TAH"
   },
   {
    "en": "I need a doctor",
    "loc": "Necesito un médico",
    "pron": "neh-seh-SEE-toh oon MEH-dee-koh"
   },
   {
    "en": "Call the police",
    "loc": "Llame a la policía",
    "pron": "YAH-meh ah lah poh-lee-SEE-ah"
   },
   {
    "en": "Left",
    "loc": "Izquierda",
    "pron": "ees-KYEHR-dah"
   },
   {
    "en": "Right",
    "loc": "Derecha",
    "pron": "deh-REH-chah"
   },
   {
    "en": "Where is the train station?",
    "loc": "¿Dónde está la estación de tren?",
    "pron": "DOHN-deh ehs-TAH lah ehs-tah-SYOHN deh trehn"
   },
   {
    "en": "How do I get to …?",
    "loc": "¿Cómo llego a …?",
    "pron": "KOH-moh YEH-goh ah …"
   },
   {
    "en": "Delicious!",
    "loc": "¡Delicioso!",
    "pron": "deh-lee-SYOH-soh"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "uno",
    "pron": "OO-noh"
   },
   {
    "n": 2,
    "loc": "dos",
    "pron": "dohs"
   },
   {
    "n": 3,
    "loc": "tres",
    "pron": "trehs"
   },
   {
    "n": 4,
    "loc": "cuatro",
    "pron": "KWAH-troh"
   },
   {
    "n": 5,
    "loc": "cinco",
    "pron": "SEEN-koh"
   },
   {
    "n": 6,
    "loc": "seis",
    "pron": "SEH-ees"
   },
   {
    "n": 7,
    "loc": "siete",
    "pron": "SYEH-teh"
   },
   {
    "n": 8,
    "loc": "ocho",
    "pron": "OH-choh"
   },
   {
    "n": 9,
    "loc": "nueve",
    "pron": "NWEH-veh"
   },
   {
    "n": 10,
    "loc": "diez",
    "pron": "DYEHS"
   }
  ]
 },
 "French": {
  "native": "Français",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Bonjour",
    "pron": "bohn-ZHOOR"
   },
   {
    "en": "Goodbye",
    "loc": "Au revoir",
    "pron": "oh ruh-VWAR"
   },
   {
    "en": "Please",
    "loc": "S'il vous plaît",
    "pron": "seel voo PLEH"
   },
   {
    "en": "Thank you",
    "loc": "Merci",
    "pron": "mehr-SEE"
   },
   {
    "en": "You're welcome",
    "loc": "Je vous en prie",
    "pron": "zhuh voo zahn PREE"
   },
   {
    "en": "Yes",
    "loc": "Oui",
    "pron": "WEE"
   },
   {
    "en": "No",
    "loc": "Non",
    "pron": "NOHN"
   },
   {
    "en": "Excuse me",
    "loc": "Excusez-moi",
    "pron": "eks-kew-zay MWAH"
   },
   {
    "en": "Sorry",
    "loc": "Pardon",
    "pron": "par-DOHN"
   },
   {
    "en": "Do you speak English?",
    "loc": "Parlez-vous anglais ?",
    "pron": "par-lay VOO ahn-GLEH"
   },
   {
    "en": "I don't understand",
    "loc": "Je ne comprends pas",
    "pron": "zhuh nuh kohm-PRAHN pah"
   },
   {
    "en": "Help!",
    "loc": "Au secours !",
    "pron": "oh suh-KOOR"
   },
   {
    "en": "How much is this?",
    "loc": "Combien ça coûte ?",
    "pron": "kohm-bee-AHN sah KOOT"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Où sont les toilettes ?",
    "pron": "oo sohn lay twah-LET"
   },
   {
    "en": "I would like this",
    "loc": "Je voudrais ceci",
    "pron": "zhuh voo-DREH suh-SEE"
   },
   {
    "en": "The bill, please",
    "loc": "L'addition, s'il vous plaît",
    "pron": "lah-dee-see-OHN, seel voo PLEH"
   },
   {
    "en": "Water",
    "loc": "Eau",
    "pron": "OH"
   },
   {
    "en": "Good morning",
    "loc": "Bonjour",
    "pron": "bohn-ZHOOR"
   },
   {
    "en": "Good evening",
    "loc": "Bonsoir",
    "pron": "bohn-SWAR"
   },
   {
    "en": "My name is …",
    "loc": "Je m'appelle …",
    "pron": "zhuh mah-PELL …"
   },
   {
    "en": "How are you?",
    "loc": "Comment allez-vous ?",
    "pron": "koh-mahn tah-lay VOO"
   },
   {
    "en": "I need a doctor",
    "loc": "J'ai besoin d'un médecin",
    "pron": "zhay buh-ZWAHN duhn mayd-SAN"
   },
   {
    "en": "Call the police",
    "loc": "Appelez la police",
    "pron": "ah-play lah poh-LEES"
   },
   {
    "en": "Left",
    "loc": "Gauche",
    "pron": "GOHSH"
   },
   {
    "en": "Right",
    "loc": "Droite",
    "pron": "DRWAHT"
   },
   {
    "en": "Where is the train station?",
    "loc": "Où est la gare ?",
    "pron": "oo eh lah GAR"
   },
   {
    "en": "How do I get to …?",
    "loc": "Comment puis-je aller à … ?",
    "pron": "koh-mahn pwee-zhuh ah-LAY ah …"
   },
   {
    "en": "Cheers!",
    "loc": "Santé !",
    "pron": "sahn-TAY"
   },
   {
    "en": "Delicious!",
    "loc": "Délicieux !",
    "pron": "day-lee-see-UH"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "un",
    "pron": "UHN"
   },
   {
    "n": 2,
    "loc": "deux",
    "pron": "DUH"
   },
   {
    "n": 3,
    "loc": "trois",
    "pron": "TRWAH"
   },
   {
    "n": 4,
    "loc": "quatre",
    "pron": "KAT-ruh"
   },
   {
    "n": 5,
    "loc": "cinq",
    "pron": "SANK"
   },
   {
    "n": 6,
    "loc": "six",
    "pron": "SEES"
   },
   {
    "n": 7,
    "loc": "sept",
    "pron": "SET"
   },
   {
    "n": 8,
    "loc": "huit",
    "pron": "WEET"
   },
   {
    "n": 9,
    "loc": "neuf",
    "pron": "NUHF"
   },
   {
    "n": 10,
    "loc": "dix",
    "pron": "DEES"
   }
  ]
 },
 "Arabic": {
  "native": "العربية",
  "phrases": [
   {
    "en": "Hello",
    "loc": "مرحبا",
    "pron": "MAR-ha-ban"
   },
   {
    "en": "Goodbye",
    "loc": "مع السلامة",
    "pron": "maa-as-sa-LAA-ma"
   },
   {
    "en": "Please",
    "loc": "من فضلك",
    "pron": "min FAD-lik"
   },
   {
    "en": "Thank you",
    "loc": "شكرا",
    "pron": "SHUK-ran"
   },
   {
    "en": "You're welcome",
    "loc": "عفوا",
    "pron": "AF-wan"
   },
   {
    "en": "Yes",
    "loc": "نعم",
    "pron": "NA-am"
   },
   {
    "en": "No",
    "loc": "لا",
    "pron": "laa"
   },
   {
    "en": "Excuse me",
    "loc": "عن إذنك",
    "pron": "an IZ-nak"
   },
   {
    "en": "Sorry",
    "loc": "آسف",
    "pron": "AA-sif"
   },
   {
    "en": "Do you speak English?",
    "loc": "هل تتحدث الإنجليزية؟",
    "pron": "hal ta-ta-HAD-dath al-in-jee-LEE-zee-ya"
   },
   {
    "en": "I don't understand",
    "loc": "لا أفهم",
    "pron": "laa AF-ham"
   },
   {
    "en": "Help!",
    "loc": "النجدة!",
    "pron": "an-NAJ-da"
   },
   {
    "en": "How much is this?",
    "loc": "كم سعر هذا؟",
    "pron": "kam SI-ar HAA-za"
   },
   {
    "en": "Where is the toilet?",
    "loc": "أين الحمام؟",
    "pron": "AY-na al-ham-MAAM"
   },
   {
    "en": "I would like this",
    "loc": "أريد هذا",
    "pron": "u-REED HAA-za"
   },
   {
    "en": "The bill, please",
    "loc": "الحساب من فضلك",
    "pron": "al-hi-SAAB min FAD-lik"
   },
   {
    "en": "Water",
    "loc": "ماء",
    "pron": "maa"
   },
   {
    "en": "Good morning",
    "loc": "صباح الخير",
    "pron": "sa-BAAH al-KHAYR"
   },
   {
    "en": "Good evening",
    "loc": "مساء الخير",
    "pron": "ma-SAA al-KHAYR"
   },
   {
    "en": "My name is …",
    "loc": "اسمي …",
    "pron": "IS-mee …"
   },
   {
    "en": "How are you?",
    "loc": "كيف حالك؟",
    "pron": "KAY-fa HAA-lak"
   },
   {
    "en": "I need a doctor",
    "loc": "أحتاج إلى طبيب",
    "pron": "ah-TAAJ i-laa ta-BEEB"
   },
   {
    "en": "Call the police",
    "loc": "اتصل بالشرطة",
    "pron": "it-TA-sil bish-SHUR-ta"
   },
   {
    "en": "Left",
    "loc": "يسار",
    "pron": "ya-SAAR"
   },
   {
    "en": "Right",
    "loc": "يمين",
    "pron": "ya-MEEN"
   },
   {
    "en": "Where is the train station?",
    "loc": "أين محطة القطار؟",
    "pron": "AY-na ma-HAT-tat al-qi-TAAR"
   },
   {
    "en": "How do I get to …?",
    "loc": "كيف أصل إلى …؟",
    "pron": "KAY-fa A-sil i-laa …"
   },
   {
    "en": "Delicious!",
    "loc": "لذيذ!",
    "pron": "la-ZEEZ"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "واحد",
    "pron": "WAA-hid"
   },
   {
    "n": 2,
    "loc": "اثنان",
    "pron": "ith-NAAN"
   },
   {
    "n": 3,
    "loc": "ثلاثة",
    "pron": "tha-LAA-tha"
   },
   {
    "n": 4,
    "loc": "أربعة",
    "pron": "AR-ba-a"
   },
   {
    "n": 5,
    "loc": "خمسة",
    "pron": "KHAM-sa"
   },
   {
    "n": 6,
    "loc": "ستة",
    "pron": "SIT-ta"
   },
   {
    "n": 7,
    "loc": "سبعة",
    "pron": "SAB-a"
   },
   {
    "n": 8,
    "loc": "ثمانية",
    "pron": "tha-MAA-ni-ya"
   },
   {
    "n": 9,
    "loc": "تسعة",
    "pron": "TIS-a"
   },
   {
    "n": 10,
    "loc": "عشرة",
    "pron": "A-sha-ra"
   }
  ]
 },
 "Portuguese": {
  "native": "Português",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Olá",
    "pron": "oh-LAH"
   },
   {
    "en": "Goodbye",
    "loc": "Adeus",
    "pron": "ah-DEH-oosh"
   },
   {
    "en": "Please",
    "loc": "Por favor",
    "pron": "poor fah-VOR"
   },
   {
    "en": "Thank you",
    "loc": "Obrigado (m.) / Obrigada (f.)",
    "pron": "oh-bree-GAH-doo / oh-bree-GAH-dah"
   },
   {
    "en": "You're welcome",
    "loc": "De nada",
    "pron": "duh NAH-dah"
   },
   {
    "en": "Yes",
    "loc": "Sim",
    "pron": "seeng"
   },
   {
    "en": "No",
    "loc": "Não",
    "pron": "nowng"
   },
   {
    "en": "Excuse me",
    "loc": "Com licença",
    "pron": "kong lee-SEN-sah"
   },
   {
    "en": "Sorry",
    "loc": "Desculpe",
    "pron": "dish-KOOL-puh"
   },
   {
    "en": "Do you speak English?",
    "loc": "Fala inglês?",
    "pron": "FAH-lah eeng-GLESH"
   },
   {
    "en": "I don't understand",
    "loc": "Não percebo",
    "pron": "nowng per-SEH-boo"
   },
   {
    "en": "Help!",
    "loc": "Socorro!",
    "pron": "soo-KOH-rroo"
   },
   {
    "en": "How much is this?",
    "loc": "Quanto custa isto?",
    "pron": "KWAN-too KOOSH-tah EESH-too"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Onde é a casa de banho?",
    "pron": "ON-duh eh ah KAH-zah duh BAH-nyoo"
   },
   {
    "en": "I would like this",
    "loc": "Eu queria isto",
    "pron": "EH-oo keh-REE-ah EESH-too"
   },
   {
    "en": "The bill, please",
    "loc": "A conta, por favor",
    "pron": "ah KON-tah, poor fah-VOR"
   },
   {
    "en": "Water",
    "loc": "Água",
    "pron": "AH-gwah"
   },
   {
    "en": "Good morning",
    "loc": "Bom dia",
    "pron": "bong DEE-ah"
   },
   {
    "en": "Good evening",
    "loc": "Boa noite",
    "pron": "BOH-ah NOY-tuh"
   },
   {
    "en": "My name is …",
    "loc": "O meu nome é …",
    "pron": "oo MEH-oo NOH-muh eh …"
   },
   {
    "en": "How are you?",
    "loc": "Como está?",
    "pron": "KOH-moo shtah"
   },
   {
    "en": "I need a doctor",
    "loc": "Preciso de um médico",
    "pron": "preh-SEE-zoo duh oong MEH-dee-koo"
   },
   {
    "en": "Call the police",
    "loc": "Chame a polícia",
    "pron": "SHAH-muh ah poo-LEE-see-ah"
   },
   {
    "en": "Left",
    "loc": "Esquerda",
    "pron": "ish-KEHR-dah"
   },
   {
    "en": "Right",
    "loc": "Direita",
    "pron": "dee-RAY-tah"
   },
   {
    "en": "Where is the train station?",
    "loc": "Onde é a estação de comboios?",
    "pron": "ON-duh eh ah ish-tah-SOWNG duh kong-BOY-oosh"
   },
   {
    "en": "How do I get to …?",
    "loc": "Como chego a …?",
    "pron": "KOH-moo SHEH-goo ah …"
   },
   {
    "en": "Delicious!",
    "loc": "Delicioso!",
    "pron": "deh-lee-see-OH-zoo"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "um",
    "pron": "oong"
   },
   {
    "n": 2,
    "loc": "dois",
    "pron": "doysh"
   },
   {
    "n": 3,
    "loc": "três",
    "pron": "tresh"
   },
   {
    "n": 4,
    "loc": "quatro",
    "pron": "KWAH-troo"
   },
   {
    "n": 5,
    "loc": "cinco",
    "pron": "SEEN-koo"
   },
   {
    "n": 6,
    "loc": "seis",
    "pron": "saysh"
   },
   {
    "n": 7,
    "loc": "sete",
    "pron": "SEH-tuh"
   },
   {
    "n": 8,
    "loc": "oito",
    "pron": "OY-too"
   },
   {
    "n": 9,
    "loc": "nove",
    "pron": "NOH-vuh"
   },
   {
    "n": 10,
    "loc": "dez",
    "pron": "desh"
   }
  ]
 },
 "Russian": {
  "native": "Русский",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Здравствуйте",
    "pron": "ZDRAST-vooy-tyeh"
   },
   {
    "en": "Goodbye",
    "loc": "До свидания",
    "pron": "duh svee-DAH-nee-yah"
   },
   {
    "en": "Please",
    "loc": "Пожалуйста",
    "pron": "pah-ZHAH-loo-stah"
   },
   {
    "en": "Thank you",
    "loc": "Спасибо",
    "pron": "spah-SEE-bah"
   },
   {
    "en": "You're welcome",
    "loc": "Пожалуйста",
    "pron": "pah-ZHAH-loo-stah"
   },
   {
    "en": "Yes",
    "loc": "Да",
    "pron": "dah"
   },
   {
    "en": "No",
    "loc": "Нет",
    "pron": "nyet"
   },
   {
    "en": "Excuse me",
    "loc": "Извините",
    "pron": "eez-vee-NEE-tyeh"
   },
   {
    "en": "Sorry",
    "loc": "Простите",
    "pron": "prah-STEE-tyeh"
   },
   {
    "en": "Do you speak English?",
    "loc": "Вы говорите по-английски?",
    "pron": "vy gah-vah-REE-tyeh pah ahn-GLEE-skee?"
   },
   {
    "en": "I don't understand",
    "loc": "Я не понимаю",
    "pron": "yah nee pah-nee-MAH-yoo"
   },
   {
    "en": "Help!",
    "loc": "Помогите!",
    "pron": "pah-mah-GEE-tyeh!"
   },
   {
    "en": "How much is this?",
    "loc": "Сколько это стоит?",
    "pron": "SKOL-kah EH-tah STOH-eet?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Где туалет?",
    "pron": "gdyeh too-ah-LYET?"
   },
   {
    "en": "I would like this",
    "loc": "Я хотел бы это",
    "pron": "yah khah-TYEL by EH-tah"
   },
   {
    "en": "The bill, please",
    "loc": "Счёт, пожалуйста",
    "pron": "shchot, pah-ZHAH-loo-stah"
   },
   {
    "en": "Water",
    "loc": "Вода",
    "pron": "vah-DAH"
   },
   {
    "en": "Good morning",
    "loc": "Доброе утро",
    "pron": "DOH-brah-yeh OO-trah"
   },
   {
    "en": "Good evening",
    "loc": "Добрый вечер",
    "pron": "DOH-bry VYEH-chuhr"
   },
   {
    "en": "My name is …",
    "loc": "Меня зовут …",
    "pron": "mee-NYAH zah-VOOT …"
   },
   {
    "en": "How are you?",
    "loc": "Как дела?",
    "pron": "kahk dee-LAH?"
   },
   {
    "en": "I need a doctor",
    "loc": "Мне нужен врач",
    "pron": "mnyeh NOO-zhen vrahch"
   },
   {
    "en": "Call the police",
    "loc": "Вызовите полицию",
    "pron": "VY-zah-vee-tyeh pah-LEE-tsee-yoo"
   },
   {
    "en": "Left",
    "loc": "Налево",
    "pron": "nah-LYEH-vah"
   },
   {
    "en": "Right",
    "loc": "Направо",
    "pron": "nah-PRAH-vah"
   },
   {
    "en": "Where is the train station?",
    "loc": "Где вокзал?",
    "pron": "gdyeh vahk-ZAHL?"
   },
   {
    "en": "How do I get to …?",
    "loc": "Как добраться до …?",
    "pron": "kahk dah-BRAH-tsah dah …?"
   },
   {
    "en": "Delicious!",
    "loc": "Вкусно!",
    "pron": "VKOOS-nah!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "один",
    "pron": "ah-DEEN"
   },
   {
    "n": 2,
    "loc": "два",
    "pron": "dvah"
   },
   {
    "n": 3,
    "loc": "три",
    "pron": "tree"
   },
   {
    "n": 4,
    "loc": "четыре",
    "pron": "chee-TY-ree"
   },
   {
    "n": 5,
    "loc": "пять",
    "pron": "pyaht"
   },
   {
    "n": 6,
    "loc": "шесть",
    "pron": "shest"
   },
   {
    "n": 7,
    "loc": "семь",
    "pron": "syem"
   },
   {
    "n": 8,
    "loc": "восемь",
    "pron": "VOH-syem"
   },
   {
    "n": 9,
    "loc": "девять",
    "pron": "DYEH-vyaht"
   },
   {
    "n": 10,
    "loc": "десять",
    "pron": "DYEH-syaht"
   }
  ]
 },
 "German": {
  "native": "Deutsch",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Hallo",
    "pron": "HAH-loh"
   },
   {
    "en": "Goodbye",
    "loc": "Auf Wiedersehen",
    "pron": "owf VEE-der-zayn"
   },
   {
    "en": "Please",
    "loc": "Bitte",
    "pron": "BIT-tuh"
   },
   {
    "en": "Thank you",
    "loc": "Danke",
    "pron": "DAHN-kuh"
   },
   {
    "en": "You're welcome",
    "loc": "Bitte schön",
    "pron": "BIT-tuh shurn"
   },
   {
    "en": "Yes",
    "loc": "Ja",
    "pron": "yah"
   },
   {
    "en": "No",
    "loc": "Nein",
    "pron": "nine"
   },
   {
    "en": "Excuse me",
    "loc": "Entschuldigung",
    "pron": "ent-SHOOL-di-goong"
   },
   {
    "en": "Sorry",
    "loc": "Es tut mir leid",
    "pron": "es toot meer lite"
   },
   {
    "en": "Do you speak English?",
    "loc": "Sprechen Sie Englisch?",
    "pron": "SHPREKH-en zee ENG-lish"
   },
   {
    "en": "I don't understand",
    "loc": "Ich verstehe nicht",
    "pron": "ikh fer-SHTAY-uh nikht"
   },
   {
    "en": "Help!",
    "loc": "Hilfe!",
    "pron": "HIL-fuh"
   },
   {
    "en": "How much is this?",
    "loc": "Wie viel kostet das?",
    "pron": "vee feel KOS-tet dahs"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Wo ist die Toilette?",
    "pron": "voh ist dee twah-LET-tuh"
   },
   {
    "en": "I would like this",
    "loc": "Ich hätte gern das",
    "pron": "ikh HET-tuh gairn dahs"
   },
   {
    "en": "The bill, please",
    "loc": "Die Rechnung, bitte",
    "pron": "dee REKH-noong, BIT-tuh"
   },
   {
    "en": "Water",
    "loc": "Wasser",
    "pron": "VAH-ser"
   },
   {
    "en": "Good morning",
    "loc": "Guten Morgen",
    "pron": "GOO-ten MOR-gen"
   },
   {
    "en": "Good evening",
    "loc": "Guten Abend",
    "pron": "GOO-ten AH-bent"
   },
   {
    "en": "My name is …",
    "loc": "Ich heiße …",
    "pron": "ikh HY-suh …"
   },
   {
    "en": "How are you?",
    "loc": "Wie geht es Ihnen?",
    "pron": "vee gayt es EE-nen"
   },
   {
    "en": "I need a doctor",
    "loc": "Ich brauche einen Arzt",
    "pron": "ikh BROW-khuh INE-en artst"
   },
   {
    "en": "Call the police",
    "loc": "Rufen Sie die Polizei",
    "pron": "ROO-fen zee dee po-li-TSY"
   },
   {
    "en": "Left",
    "loc": "Links",
    "pron": "links"
   },
   {
    "en": "Right",
    "loc": "Rechts",
    "pron": "rekhts"
   },
   {
    "en": "Where is the train station?",
    "loc": "Wo ist der Bahnhof?",
    "pron": "voh ist dair BAHN-hohf"
   },
   {
    "en": "How do I get to …?",
    "loc": "Wie komme ich nach …?",
    "pron": "vee KOM-muh ikh nakh …"
   },
   {
    "en": "Cheers!",
    "loc": "Prost!",
    "pron": "prohst"
   },
   {
    "en": "Delicious!",
    "loc": "Lecker!",
    "pron": "LEK-er"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "eins",
    "pron": "eyenss"
   },
   {
    "n": 2,
    "loc": "zwei",
    "pron": "tsvy"
   },
   {
    "n": 3,
    "loc": "drei",
    "pron": "dry"
   },
   {
    "n": 4,
    "loc": "vier",
    "pron": "feer"
   },
   {
    "n": 5,
    "loc": "fünf",
    "pron": "fuunf (ü as in French 'u')"
   },
   {
    "n": 6,
    "loc": "sechs",
    "pron": "zeks"
   },
   {
    "n": 7,
    "loc": "sieben",
    "pron": "ZEE-ben"
   },
   {
    "n": 8,
    "loc": "acht",
    "pron": "akht"
   },
   {
    "n": 9,
    "loc": "neun",
    "pron": "noyn"
   },
   {
    "n": 10,
    "loc": "zehn",
    "pron": "tsayn"
   }
  ]
 },
 "Italian": {
  "native": "Italiano",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Salve",
    "pron": "SAHL-veh"
   },
   {
    "en": "Goodbye",
    "loc": "Arrivederci",
    "pron": "ah-ree-veh-DEHR-chee"
   },
   {
    "en": "Please",
    "loc": "Per favore",
    "pron": "pehr fah-VOH-reh"
   },
   {
    "en": "Thank you",
    "loc": "Grazie",
    "pron": "GRAH-tsyeh"
   },
   {
    "en": "You're welcome",
    "loc": "Prego",
    "pron": "PREH-goh"
   },
   {
    "en": "Yes",
    "loc": "Sì",
    "pron": "see"
   },
   {
    "en": "No",
    "loc": "No",
    "pron": "noh"
   },
   {
    "en": "Excuse me",
    "loc": "Mi scusi",
    "pron": "mee SKOO-zee"
   },
   {
    "en": "Sorry",
    "loc": "Mi dispiace",
    "pron": "mee dees-PYAH-cheh"
   },
   {
    "en": "Do you speak English?",
    "loc": "Parla inglese?",
    "pron": "PAR-lah een-GLEH-zeh"
   },
   {
    "en": "I don't understand",
    "loc": "Non capisco",
    "pron": "nohn kah-PEES-koh"
   },
   {
    "en": "Help!",
    "loc": "Aiuto!",
    "pron": "ah-YOO-toh"
   },
   {
    "en": "How much is this?",
    "loc": "Quanto costa questo?",
    "pron": "KWAN-toh KOH-stah KWEH-stoh"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Dov'è il bagno?",
    "pron": "doh-VEH eel BAH-nyoh"
   },
   {
    "en": "I would like this",
    "loc": "Vorrei questo",
    "pron": "vor-RAY KWEH-stoh"
   },
   {
    "en": "The bill, please",
    "loc": "Il conto, per favore",
    "pron": "eel KOHN-toh, pehr fah-VOH-reh"
   },
   {
    "en": "Water",
    "loc": "Acqua",
    "pron": "AH-kwah"
   },
   {
    "en": "Good morning",
    "loc": "Buongiorno",
    "pron": "bwohn-JOR-noh"
   },
   {
    "en": "Good evening",
    "loc": "Buonasera",
    "pron": "bwoh-nah-SEH-rah"
   },
   {
    "en": "My name is …",
    "loc": "Mi chiamo …",
    "pron": "mee KYAH-moh …"
   },
   {
    "en": "How are you?",
    "loc": "Come sta?",
    "pron": "KOH-meh stah"
   },
   {
    "en": "I need a doctor",
    "loc": "Ho bisogno di un medico",
    "pron": "oh bee-ZOH-nyoh dee oon MEH-dee-koh"
   },
   {
    "en": "Call the police",
    "loc": "Chiami la polizia",
    "pron": "KYAH-mee lah poh-lee-TSEE-ah"
   },
   {
    "en": "Left",
    "loc": "Sinistra",
    "pron": "see-NEE-strah"
   },
   {
    "en": "Right",
    "loc": "Destra",
    "pron": "DEH-strah"
   },
   {
    "en": "Where is the train station?",
    "loc": "Dov'è la stazione dei treni?",
    "pron": "doh-VEH lah stah-TSYOH-neh day TREH-nee"
   },
   {
    "en": "How do I get to …?",
    "loc": "Come arrivo a …?",
    "pron": "KOH-meh ar-REE-voh ah …"
   },
   {
    "en": "Delicious!",
    "loc": "Delizioso!",
    "pron": "deh-lee-TSYOH-zoh"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "uno",
    "pron": "OO-noh"
   },
   {
    "n": 2,
    "loc": "due",
    "pron": "DOO-eh"
   },
   {
    "n": 3,
    "loc": "tre",
    "pron": "treh"
   },
   {
    "n": 4,
    "loc": "quattro",
    "pron": "KWAH-troh"
   },
   {
    "n": 5,
    "loc": "cinque",
    "pron": "CHEEN-kweh"
   },
   {
    "n": 6,
    "loc": "sei",
    "pron": "say"
   },
   {
    "n": 7,
    "loc": "sette",
    "pron": "SEH-teh"
   },
   {
    "n": 8,
    "loc": "otto",
    "pron": "OH-toh"
   },
   {
    "n": 9,
    "loc": "nove",
    "pron": "NOH-veh"
   },
   {
    "n": 10,
    "loc": "dieci",
    "pron": "DYEH-chee"
   }
  ]
 },
 "Mandarin Chinese": {
  "native": "普通话",
  "phrases": [
   {
    "en": "Hello",
    "loc": "你好",
    "pron": "nǐ hǎo (nee how)"
   },
   {
    "en": "Goodbye",
    "loc": "再见",
    "pron": "zài jiàn (dzye jyen)"
   },
   {
    "en": "Please",
    "loc": "请",
    "pron": "qǐng (ching)"
   },
   {
    "en": "Thank you",
    "loc": "谢谢",
    "pron": "xiè xie (shyeh shyeh)"
   },
   {
    "en": "You're welcome",
    "loc": "不客气",
    "pron": "bú kè qi (boo kuh chee)"
   },
   {
    "en": "Yes",
    "loc": "是",
    "pron": "shì (shrr)"
   },
   {
    "en": "No",
    "loc": "不是",
    "pron": "bú shì (boo shrr)"
   },
   {
    "en": "Excuse me",
    "loc": "请问",
    "pron": "qǐng wèn (ching wun)"
   },
   {
    "en": "Sorry",
    "loc": "对不起",
    "pron": "duì bu qǐ (dway boo chee)"
   },
   {
    "en": "Do you speak English?",
    "loc": "你会说英语吗？",
    "pron": "nǐ huì shuō yīng yǔ ma? (nee hway shwor ying yoo ma)"
   },
   {
    "en": "I don't understand",
    "loc": "我不明白",
    "pron": "wǒ bù míng bai (wor boo ming bye)"
   },
   {
    "en": "Help!",
    "loc": "救命！",
    "pron": "jiù mìng! (jyoh ming)"
   },
   {
    "en": "How much is this?",
    "loc": "这个多少钱？",
    "pron": "zhè ge duō shao qián? (juh guh dwor shao chyen)"
   },
   {
    "en": "Where is the toilet?",
    "loc": "洗手间在哪里？",
    "pron": "xǐ shǒu jiān zài nǎ lǐ? (shee show jyen dzye nah lee)"
   },
   {
    "en": "I would like this",
    "loc": "我想要这个",
    "pron": "wǒ xiǎng yào zhè ge (wor shyang yao juh guh)"
   },
   {
    "en": "The bill, please",
    "loc": "请买单",
    "pron": "qǐng mǎi dān (ching my dan)"
   },
   {
    "en": "Water",
    "loc": "水",
    "pron": "shuǐ (shway)"
   },
   {
    "en": "Good morning",
    "loc": "早上好",
    "pron": "zǎo shang hǎo (dzao shang how)"
   },
   {
    "en": "Good evening",
    "loc": "晚上好",
    "pron": "wǎn shang hǎo (wan shang how)"
   },
   {
    "en": "My name is …",
    "loc": "我叫……",
    "pron": "wǒ jiào … (wor jyao …)"
   },
   {
    "en": "How are you?",
    "loc": "你好吗？",
    "pron": "nǐ hǎo ma? (nee how ma)"
   },
   {
    "en": "I need a doctor",
    "loc": "我需要看医生",
    "pron": "wǒ xū yào kàn yī shēng (wor shoo yao kan ee shung)"
   },
   {
    "en": "Call the police",
    "loc": "请报警",
    "pron": "qǐng bào jǐng (ching bao jing)"
   },
   {
    "en": "Left",
    "loc": "左",
    "pron": "zuǒ (dzwor)"
   },
   {
    "en": "Right",
    "loc": "右",
    "pron": "yòu (yoh)"
   },
   {
    "en": "Straight ahead",
    "loc": "一直走",
    "pron": "yì zhí zǒu (ee jrr dzoh)"
   },
   {
    "en": "Where is the train station?",
    "loc": "火车站在哪里？",
    "pron": "huǒ chē zhàn zài nǎ lǐ? (hwor chuh jan dzye nah lee)"
   },
   {
    "en": "How do I get to …?",
    "loc": "怎么去……？",
    "pron": "zěn me qù …? (dzun muh chyoo …)"
   },
   {
    "en": "Delicious!",
    "loc": "好吃！",
    "pron": "hǎo chī! (how chrr)"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "一",
    "pron": "yī (ee)"
   },
   {
    "n": 2,
    "loc": "二",
    "pron": "èr (arr)"
   },
   {
    "n": 3,
    "loc": "三",
    "pron": "sān (san)"
   },
   {
    "n": 4,
    "loc": "四",
    "pron": "sì (srr)"
   },
   {
    "n": 5,
    "loc": "五",
    "pron": "wǔ (woo)"
   },
   {
    "n": 6,
    "loc": "六",
    "pron": "liù (lyoh)"
   },
   {
    "n": 7,
    "loc": "七",
    "pron": "qī (chee)"
   },
   {
    "n": 8,
    "loc": "八",
    "pron": "bā (bah)"
   },
   {
    "n": 9,
    "loc": "九",
    "pron": "jiǔ (jyoh)"
   },
   {
    "n": 10,
    "loc": "十",
    "pron": "shí (shrr)"
   }
  ]
 },
 "Japanese": {
  "native": "日本語",
  "phrases": [
   {
    "en": "Hello",
    "loc": "こんにちは",
    "pron": "kon-nee-chee-wah"
   },
   {
    "en": "Goodbye",
    "loc": "さようなら",
    "pron": "sah-yoh-nah-rah"
   },
   {
    "en": "Please",
    "loc": "お願いします",
    "pron": "oh-neh-gai-shee-mahss"
   },
   {
    "en": "Thank you",
    "loc": "ありがとうございます",
    "pron": "ah-ree-gah-toh goh-zai-mahss"
   },
   {
    "en": "You're welcome",
    "loc": "どういたしまして",
    "pron": "doh-ee-tah-shee-mah-shteh"
   },
   {
    "en": "Yes",
    "loc": "はい",
    "pron": "hai"
   },
   {
    "en": "No",
    "loc": "いいえ",
    "pron": "ee-eh"
   },
   {
    "en": "Excuse me",
    "loc": "すみません",
    "pron": "soo-mee-mah-sen"
   },
   {
    "en": "Sorry",
    "loc": "ごめんなさい",
    "pron": "goh-men-nah-sai"
   },
   {
    "en": "Do you speak English?",
    "loc": "英語を話せますか？",
    "pron": "ay-go oh hah-nah-seh-mahss kah?"
   },
   {
    "en": "I don't understand",
    "loc": "わかりません",
    "pron": "wah-kah-ree-mah-sen"
   },
   {
    "en": "Help!",
    "loc": "助けて！",
    "pron": "tah-soo-keh-teh!"
   },
   {
    "en": "How much is this?",
    "loc": "これはいくらですか？",
    "pron": "koh-reh wah ee-koo-rah dess kah?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "トイレはどこですか？",
    "pron": "toy-reh wah doh-koh dess kah?"
   },
   {
    "en": "I would like this",
    "loc": "これをください",
    "pron": "koh-reh oh koo-dah-sai"
   },
   {
    "en": "The bill, please",
    "loc": "お会計をお願いします",
    "pron": "oh-kai-kay oh oh-neh-gai-shee-mahss"
   },
   {
    "en": "Water",
    "loc": "水",
    "pron": "mee-zoo"
   },
   {
    "en": "Good morning",
    "loc": "おはようございます",
    "pron": "oh-hah-yoh goh-zai-mahss"
   },
   {
    "en": "Good evening",
    "loc": "こんばんは",
    "pron": "kon-bahn-wah"
   },
   {
    "en": "My name is …",
    "loc": "私の名前は…です",
    "pron": "wah-tah-shee no nah-mah-eh wah … dess"
   },
   {
    "en": "How are you?",
    "loc": "お元気ですか？",
    "pron": "oh-gen-kee dess kah?"
   },
   {
    "en": "I need a doctor",
    "loc": "医者が必要です",
    "pron": "ee-shah gah hee-tsoo-yoh dess"
   },
   {
    "en": "Call the police",
    "loc": "警察を呼んでください",
    "pron": "kay-sah-tsoo oh yon-deh koo-dah-sai"
   },
   {
    "en": "Left",
    "loc": "左",
    "pron": "hee-dah-ree"
   },
   {
    "en": "Right",
    "loc": "右",
    "pron": "mee-gee"
   },
   {
    "en": "Where is the train station?",
    "loc": "駅はどこですか？",
    "pron": "eh-kee wah doh-koh dess kah?"
   },
   {
    "en": "How do I get to …?",
    "loc": "…へはどうやって行きますか？",
    "pron": "… eh wah doh-yah-tteh ee-kee-mahss kah?"
   },
   {
    "en": "Cheers!",
    "loc": "乾杯！",
    "pron": "kahm-pai!"
   },
   {
    "en": "Delicious!",
    "loc": "おいしい！",
    "pron": "oy-shee!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "一",
    "pron": "ee-chee"
   },
   {
    "n": 2,
    "loc": "二",
    "pron": "nee"
   },
   {
    "n": 3,
    "loc": "三",
    "pron": "sahn"
   },
   {
    "n": 4,
    "loc": "四",
    "pron": "shee / yon"
   },
   {
    "n": 5,
    "loc": "五",
    "pron": "goh"
   },
   {
    "n": 6,
    "loc": "六",
    "pron": "roh-koo"
   },
   {
    "n": 7,
    "loc": "七",
    "pron": "shee-chee / nah-nah"
   },
   {
    "n": 8,
    "loc": "八",
    "pron": "hah-chee"
   },
   {
    "n": 9,
    "loc": "九",
    "pron": "kyoo / koo"
   },
   {
    "n": 10,
    "loc": "十",
    "pron": "joo"
   }
  ]
 },
 "Korean": {
  "native": "한국어",
  "phrases": [
   {
    "en": "Hello",
    "loc": "안녕하세요",
    "pron": "an-nyeong-ha-se-yo"
   },
   {
    "en": "Goodbye",
    "loc": "안녕히 가세요",
    "pron": "an-nyeong-hi ga-se-yo (to someone leaving); an-nyeong-hi gye-se-yo (안녕히 계세요, to someone staying)"
   },
   {
    "en": "Please",
    "loc": "부탁합니다",
    "pron": "bu-tak-ham-ni-da"
   },
   {
    "en": "Thank you",
    "loc": "감사합니다",
    "pron": "gam-sa-ham-ni-da"
   },
   {
    "en": "You're welcome",
    "loc": "천만에요",
    "pron": "cheon-ma-ne-yo"
   },
   {
    "en": "Yes",
    "loc": "네",
    "pron": "ne"
   },
   {
    "en": "No",
    "loc": "아니요",
    "pron": "a-ni-yo"
   },
   {
    "en": "Excuse me",
    "loc": "실례합니다",
    "pron": "sil-lye-ham-ni-da"
   },
   {
    "en": "Sorry",
    "loc": "죄송합니다",
    "pron": "joe-song-ham-ni-da"
   },
   {
    "en": "Do you speak English?",
    "loc": "영어 할 줄 아세요?",
    "pron": "yeong-eo hal jul a-se-yo?"
   },
   {
    "en": "I don't understand",
    "loc": "이해 못 하겠어요",
    "pron": "i-hae mot ha-ge-sseo-yo"
   },
   {
    "en": "Help!",
    "loc": "도와주세요!",
    "pron": "do-wa-ju-se-yo!"
   },
   {
    "en": "How much is this?",
    "loc": "이거 얼마예요?",
    "pron": "i-geo eol-ma-ye-yo?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "화장실이 어디예요?",
    "pron": "hwa-jang-si-ri eo-di-ye-yo?"
   },
   {
    "en": "I would like this",
    "loc": "이거 주세요",
    "pron": "i-geo ju-se-yo"
   },
   {
    "en": "The bill, please",
    "loc": "계산서 주세요",
    "pron": "gye-san-seo ju-se-yo"
   },
   {
    "en": "Water",
    "loc": "물",
    "pron": "mul"
   },
   {
    "en": "Good morning",
    "loc": "안녕하세요",
    "pron": "an-nyeong-ha-se-yo (general greeting used in the morning); jo-eun a-chim-i-e-yo (좋은 아침이에요, literally 'good morning')"
   },
   {
    "en": "Good evening",
    "loc": "안녕하세요",
    "pron": "an-nyeong-ha-se-yo (the standard polite greeting, used in the evening as well)"
   },
   {
    "en": "My name is …",
    "loc": "제 이름은 …이에요",
    "pron": "je i-reu-meun … i-e-yo (use 예요 / ye-yo after a vowel-final name, 이에요 / i-e-yo after a consonant-final name)"
   },
   {
    "en": "How are you?",
    "loc": "어떻게 지내세요?",
    "pron": "eo-tteo-ke ji-nae-se-yo?"
   },
   {
    "en": "I need a doctor",
    "loc": "의사가 필요해요",
    "pron": "ui-sa-ga pi-ryo-hae-yo"
   },
   {
    "en": "Call the police",
    "loc": "경찰을 불러 주세요",
    "pron": "gyeong-cha-reul bul-leo ju-se-yo"
   },
   {
    "en": "Left",
    "loc": "왼쪽",
    "pron": "oen-jjok"
   },
   {
    "en": "Right",
    "loc": "오른쪽",
    "pron": "o-reun-jjok"
   },
   {
    "en": "Where is the train station?",
    "loc": "기차역이 어디예요?",
    "pron": "gi-cha-yeo-gi eo-di-ye-yo?"
   },
   {
    "en": "How do I get to …?",
    "loc": "…에 어떻게 가요?",
    "pron": "… e eo-tteo-ke ga-yo?"
   },
   {
    "en": "Delicious!",
    "loc": "맛있어요!",
    "pron": "ma-si-sseo-yo!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "하나",
    "pron": "ha-na (native Korean); il (일, Sino-Korean)"
   },
   {
    "n": 2,
    "loc": "둘",
    "pron": "dul (native); i (이, Sino-Korean)"
   },
   {
    "n": 3,
    "loc": "셋",
    "pron": "set (native); sam (삼, Sino-Korean)"
   },
   {
    "n": 4,
    "loc": "넷",
    "pron": "net (native); sa (사, Sino-Korean)"
   },
   {
    "n": 5,
    "loc": "다섯",
    "pron": "da-seot (native); o (오, Sino-Korean)"
   },
   {
    "n": 6,
    "loc": "여섯",
    "pron": "yeo-seot (native); yuk (육, Sino-Korean)"
   },
   {
    "n": 7,
    "loc": "일곱",
    "pron": "il-gop (native); chil (칠, Sino-Korean)"
   },
   {
    "n": 8,
    "loc": "여덟",
    "pron": "yeo-deol (native); pal (팔, Sino-Korean)"
   },
   {
    "n": 9,
    "loc": "아홉",
    "pron": "a-hop (native); gu (구, Sino-Korean)"
   },
   {
    "n": 10,
    "loc": "열",
    "pron": "yeol (native); sip (십, Sino-Korean)"
   }
  ]
 },
 "Hindi": {
  "native": "हिन्दी",
  "phrases": [
   {
    "en": "Hello",
    "loc": "नमस्ते",
    "pron": "nuh-muh-STAY"
   },
   {
    "en": "Goodbye",
    "loc": "नमस्ते / अलविदा",
    "pron": "nuh-muh-STAY / al-vi-DAA"
   },
   {
    "en": "Please",
    "loc": "कृपया",
    "pron": "KRIP-yaa"
   },
   {
    "en": "Thank you",
    "loc": "धन्यवाद",
    "pron": "DHUN-yuh-vaad"
   },
   {
    "en": "You're welcome",
    "loc": "कोई बात नहीं",
    "pron": "koh-EE baat nuh-HEEN"
   },
   {
    "en": "Yes",
    "loc": "जी हाँ",
    "pron": "jee HAAN"
   },
   {
    "en": "No",
    "loc": "जी नहीं",
    "pron": "jee nuh-HEEN"
   },
   {
    "en": "Excuse me",
    "loc": "सुनिए",
    "pron": "SOO-ni-yay"
   },
   {
    "en": "Sorry",
    "loc": "माफ़ कीजिए",
    "pron": "maaf KEE-ji-yay"
   },
   {
    "en": "Do you speak English?",
    "loc": "क्या आप अंग्रेज़ी बोलते हैं?",
    "pron": "kyaa aap an-GRAY-zee BOL-tay hain?"
   },
   {
    "en": "I don't understand",
    "loc": "मुझे समझ नहीं आया",
    "pron": "MUJH-ay sa-MAJH nuh-HEEN AA-yaa"
   },
   {
    "en": "Help!",
    "loc": "बचाओ!",
    "pron": "buh-CHAA-oh!"
   },
   {
    "en": "How much is this?",
    "loc": "यह कितने का है?",
    "pron": "yeh KIT-nay kaa hai?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "शौचालय कहाँ है?",
    "pron": "shau-CHAA-luh-yuh ka-HAAN hai?"
   },
   {
    "en": "I would like this",
    "loc": "मुझे यह चाहिए",
    "pron": "MUJH-ay yeh CHAA-hi-yay"
   },
   {
    "en": "The bill, please",
    "loc": "बिल लाइए",
    "pron": "bill LAA-i-yay"
   },
   {
    "en": "Water",
    "loc": "पानी",
    "pron": "PAA-nee"
   },
   {
    "en": "Good morning",
    "loc": "सुप्रभात",
    "pron": "su-pruh-BHAAT"
   },
   {
    "en": "Good evening",
    "loc": "शुभ संध्या",
    "pron": "shubh SUN-dhyaa"
   },
   {
    "en": "Good night",
    "loc": "शुभ रात्रि",
    "pron": "shubh RAA-tri"
   },
   {
    "en": "My name is …",
    "loc": "मेरा नाम … है",
    "pron": "MAY-raa naam … hai"
   },
   {
    "en": "How are you?",
    "loc": "आप कैसे हैं?",
    "pron": "aap KAI-say hain?"
   },
   {
    "en": "I need a doctor",
    "loc": "मुझे डॉक्टर की ज़रूरत है",
    "pron": "MUJH-ay DOCK-tar kee zuh-ROO-rat hai"
   },
   {
    "en": "Call the police",
    "loc": "पुलिस को बुलाइए",
    "pron": "po-LEES koh boo-LAA-i-yay"
   },
   {
    "en": "Left",
    "loc": "बायाँ",
    "pron": "BAA-yaan"
   },
   {
    "en": "Right",
    "loc": "दायाँ",
    "pron": "DAA-yaan"
   },
   {
    "en": "Where is the train station?",
    "loc": "रेलवे स्टेशन कहाँ है?",
    "pron": "RAIL-way STAY-shun ka-HAAN hai?"
   },
   {
    "en": "How do I get to …?",
    "loc": "मैं … कैसे पहुँचूँ?",
    "pron": "main … KAI-say puh-HUN-choon?"
   },
   {
    "en": "Delicious!",
    "loc": "बहुत स्वादिष्ट!",
    "pron": "buh-HOOT swaa-DISHT!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "एक",
    "pron": "ek"
   },
   {
    "n": 2,
    "loc": "दो",
    "pron": "doh"
   },
   {
    "n": 3,
    "loc": "तीन",
    "pron": "teen"
   },
   {
    "n": 4,
    "loc": "चार",
    "pron": "chaar"
   },
   {
    "n": 5,
    "loc": "पाँच",
    "pron": "paanch"
   },
   {
    "n": 6,
    "loc": "छह",
    "pron": "chheh"
   },
   {
    "n": 7,
    "loc": "सात",
    "pron": "saat"
   },
   {
    "n": 8,
    "loc": "आठ",
    "pron": "aath"
   },
   {
    "n": 9,
    "loc": "नौ",
    "pron": "nau"
   },
   {
    "n": 10,
    "loc": "दस",
    "pron": "dus"
   }
  ]
 },
 "Bengali": {
  "native": "বাংলা",
  "phrases": [
   {
    "en": "Hello",
    "loc": "নমস্কার",
    "pron": "no-mosh-KAR (Hindu/secular); as-sa-laamu a-laai-kum for Muslims"
   },
   {
    "en": "Goodbye",
    "loc": "বিদায়",
    "pron": "bee-DAI (or 'aabar dekha hobe' = see you again)"
   },
   {
    "en": "Please",
    "loc": "দয়া করে",
    "pron": "DOY-aa KO-re"
   },
   {
    "en": "Thank you",
    "loc": "ধন্যবাদ",
    "pron": "DHON-no-baad"
   },
   {
    "en": "You're welcome",
    "loc": "স্বাগতম",
    "pron": "SHAA-go-tom"
   },
   {
    "en": "Yes",
    "loc": "হ্যাঁ",
    "pron": "hæ̃ (nasal 'haa')"
   },
   {
    "en": "No",
    "loc": "না",
    "pron": "naa"
   },
   {
    "en": "Excuse me",
    "loc": "শুনুন",
    "pron": "SHOO-noon (lit. 'listen', to get attention)"
   },
   {
    "en": "Sorry",
    "loc": "দুঃখিত",
    "pron": "DOOK-khito"
   },
   {
    "en": "Do you speak English?",
    "loc": "আপনি কি ইংরেজি বলতে পারেন?",
    "pron": "AAP-ni ki ING-reji BOL-te PAA-ren?"
   },
   {
    "en": "I don't understand",
    "loc": "আমি বুঝতে পারছি না",
    "pron": "AA-mi BOOJH-te PAAR-chi naa"
   },
   {
    "en": "Help!",
    "loc": "সাহায্য করুন!",
    "pron": "SHA-haaj-jo KOH-roon!"
   },
   {
    "en": "How much is this?",
    "loc": "এটার দাম কত?",
    "pron": "EH-taar daam KOH-to?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "টয়লেট কোথায়?",
    "pron": "TOY-let KO-thai?"
   },
   {
    "en": "I would like this",
    "loc": "আমি এটা চাই",
    "pron": "AA-mi EH-taa chai"
   },
   {
    "en": "The bill, please",
    "loc": "দয়া করে বিলটা দিন",
    "pron": "DOY-aa KO-re BIL-taa deen"
   },
   {
    "en": "Water",
    "loc": "জল / পানি",
    "pron": "jol (West Bengal) / PAA-ni (Bangladesh)"
   },
   {
    "en": "Good morning",
    "loc": "সুপ্রভাত",
    "pron": "shu-pro-BHAAT"
   },
   {
    "en": "Good evening",
    "loc": "শুভ সন্ধ্যা",
    "pron": "SHU-bho SHON-dhaa"
   },
   {
    "en": "My name is …",
    "loc": "আমার নাম …",
    "pron": "AA-maar naam …"
   },
   {
    "en": "How are you?",
    "loc": "আপনি কেমন আছেন?",
    "pron": "AAP-ni KEH-mon AA-chen?"
   },
   {
    "en": "I need a doctor",
    "loc": "আমার একজন ডাক্তার দরকার",
    "pron": "AA-maar EK-jon DAAK-taar DOR-kaar"
   },
   {
    "en": "Call the police",
    "loc": "পুলিশ ডাকুন",
    "pron": "POO-lish DAA-koon"
   },
   {
    "en": "Left",
    "loc": "বাম",
    "pron": "baam"
   },
   {
    "en": "Right",
    "loc": "ডান",
    "pron": "daan"
   },
   {
    "en": "Where is the train station?",
    "loc": "ট্রেন স্টেশন কোথায়?",
    "pron": "TREN STE-shon KO-thai?"
   },
   {
    "en": "How do I get to …?",
    "loc": "আমি … কীভাবে যাব?",
    "pron": "AA-mi … KEE-bhaa-be JAA-bo?"
   },
   {
    "en": "Delicious!",
    "loc": "সুস্বাদু!",
    "pron": "shu-SHAA-doo!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "এক",
    "pron": "ek"
   },
   {
    "n": 2,
    "loc": "দুই",
    "pron": "dui"
   },
   {
    "n": 3,
    "loc": "তিন",
    "pron": "teen"
   },
   {
    "n": 4,
    "loc": "চার",
    "pron": "chaar"
   },
   {
    "n": 5,
    "loc": "পাঁচ",
    "pron": "paanch (nasal)"
   },
   {
    "n": 6,
    "loc": "ছয়",
    "pron": "chhoy"
   },
   {
    "n": 7,
    "loc": "সাত",
    "pron": "shaat"
   },
   {
    "n": 8,
    "loc": "আট",
    "pron": "aat"
   },
   {
    "n": 9,
    "loc": "নয়",
    "pron": "noy"
   },
   {
    "n": 10,
    "loc": "দশ",
    "pron": "dosh"
   }
  ]
 },
 "Urdu": {
  "native": "اردو",
  "phrases": [
   {
    "en": "Hello",
    "loc": "السلام علیکم",
    "pron": "as-salaam-u alai-kum"
   },
   {
    "en": "Goodbye",
    "loc": "اللہ حافظ",
    "pron": "al-laah haa-fiz"
   },
   {
    "en": "Please",
    "loc": "براہِ کرم",
    "pron": "ba-raa-e ka-ram"
   },
   {
    "en": "Thank you",
    "loc": "شکریہ",
    "pron": "shuk-ri-yaa"
   },
   {
    "en": "You're welcome",
    "loc": "کوئی بات نہیں",
    "pron": "ko-ee baat na-heen"
   },
   {
    "en": "Yes",
    "loc": "جی ہاں",
    "pron": "jee haan"
   },
   {
    "en": "No",
    "loc": "جی نہیں",
    "pron": "jee na-heen"
   },
   {
    "en": "Excuse me",
    "loc": "معاف کیجیے",
    "pron": "maaf kee-ji-ye"
   },
   {
    "en": "Sorry",
    "loc": "معذرت",
    "pron": "maa-zi-rat"
   },
   {
    "en": "Do you speak English?",
    "loc": "کیا آپ انگریزی بولتے ہیں؟",
    "pron": "kyaa aap an-gre-zee bol-te hain?"
   },
   {
    "en": "I don't understand",
    "loc": "میں نہیں سمجھا",
    "pron": "main na-heen sam-jhaa"
   },
   {
    "en": "Help!",
    "loc": "مدد!",
    "pron": "ma-dad!"
   },
   {
    "en": "How much is this?",
    "loc": "یہ کتنے کا ہے؟",
    "pron": "yeh kit-ne kaa hai?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "بیت الخلا کہاں ہے؟",
    "pron": "bait-ul-kha-laa ka-haan hai?"
   },
   {
    "en": "I would like this",
    "loc": "مجھے یہ چاہیے",
    "pron": "mu-jhe yeh chaa-hi-ye"
   },
   {
    "en": "The bill, please",
    "loc": "بل دیجیے، براہِ کرم",
    "pron": "bill dee-ji-ye, ba-raa-e ka-ram"
   },
   {
    "en": "Water",
    "loc": "پانی",
    "pron": "paa-nee"
   },
   {
    "en": "Good morning",
    "loc": "صبح بخیر",
    "pron": "su-bah ba-khair"
   },
   {
    "en": "Good evening",
    "loc": "شام بخیر",
    "pron": "shaam ba-khair"
   },
   {
    "en": "My name is …",
    "loc": "میرا نام … ہے",
    "pron": "me-raa naam … hai"
   },
   {
    "en": "How are you?",
    "loc": "آپ کیسے ہیں؟",
    "pron": "aap kai-se hain?"
   },
   {
    "en": "I need a doctor",
    "loc": "مجھے ڈاکٹر کی ضرورت ہے",
    "pron": "mu-jhe daak-tar kee za-roo-rat hai"
   },
   {
    "en": "Call the police",
    "loc": "پولیس کو بلائیں",
    "pron": "po-lees ko bu-laa-en"
   },
   {
    "en": "Left",
    "loc": "بائیں",
    "pron": "baa-en"
   },
   {
    "en": "Right",
    "loc": "دائیں",
    "pron": "daa-en"
   },
   {
    "en": "Where is the train station?",
    "loc": "ریلوے اسٹیشن کہاں ہے؟",
    "pron": "rail-we ish-tay-shan ka-haan hai?"
   },
   {
    "en": "How do I get to …?",
    "loc": "میں … کیسے پہنچوں؟",
    "pron": "main … kai-se pa-hun-choon?"
   },
   {
    "en": "Delicious!",
    "loc": "بہت مزیدار!",
    "pron": "ba-hut ma-ze-daar!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "ایک",
    "pron": "ek"
   },
   {
    "n": 2,
    "loc": "دو",
    "pron": "do"
   },
   {
    "n": 3,
    "loc": "تین",
    "pron": "teen"
   },
   {
    "n": 4,
    "loc": "چار",
    "pron": "chaar"
   },
   {
    "n": 5,
    "loc": "پانچ",
    "pron": "paanch"
   },
   {
    "n": 6,
    "loc": "چھ",
    "pron": "chhe"
   },
   {
    "n": 7,
    "loc": "سات",
    "pron": "saat"
   },
   {
    "n": 8,
    "loc": "آٹھ",
    "pron": "aath"
   },
   {
    "n": 9,
    "loc": "نو",
    "pron": "nau"
   },
   {
    "n": 10,
    "loc": "دس",
    "pron": "das"
   }
  ]
 },
 "Indonesian": {
  "native": "Bahasa Indonesia",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Halo",
    "pron": "HAH-loh"
   },
   {
    "en": "Goodbye",
    "loc": "Selamat tinggal",
    "pron": "suh-LAH-mat TING-gal (said to the one staying; the one leaving says: Selamat jalan, suh-LAH-mat JAH-lan)"
   },
   {
    "en": "Please",
    "loc": "Tolong",
    "pron": "TOH-long (for requests; use 'silakan' / see-LAH-kan when offering or inviting)"
   },
   {
    "en": "Thank you",
    "loc": "Terima kasih",
    "pron": "tuh-REE-mah KAH-see"
   },
   {
    "en": "You're welcome",
    "loc": "Sama-sama",
    "pron": "SAH-mah SAH-mah"
   },
   {
    "en": "Yes",
    "loc": "Ya",
    "pron": "yah"
   },
   {
    "en": "No",
    "loc": "Tidak",
    "pron": "TEE-dak"
   },
   {
    "en": "Excuse me",
    "loc": "Permisi",
    "pron": "per-MEE-see"
   },
   {
    "en": "Sorry",
    "loc": "Maaf",
    "pron": "mah-AHF"
   },
   {
    "en": "Do you speak English?",
    "loc": "Apakah Anda bisa berbahasa Inggris?",
    "pron": "AH-pah-kah AHN-dah BEE-sah ber-bah-SAH ING-gris"
   },
   {
    "en": "I don't understand",
    "loc": "Saya tidak mengerti",
    "pron": "SAH-yah TEE-dak muh-NGUHR-tee"
   },
   {
    "en": "Help!",
    "loc": "Tolong!",
    "pron": "TOH-long"
   },
   {
    "en": "How much is this?",
    "loc": "Ini berapa harganya?",
    "pron": "EE-nee buh-RAH-pah HAR-gah-nyah"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Di mana toilet?",
    "pron": "dee MAH-nah TOY-let"
   },
   {
    "en": "I would like this",
    "loc": "Saya mau ini",
    "pron": "SAH-yah MAH-oo EE-nee"
   },
   {
    "en": "The bill, please",
    "loc": "Minta bonnya",
    "pron": "MIN-tah BON-nyah"
   },
   {
    "en": "Water",
    "loc": "Air",
    "pron": "AH-eer"
   },
   {
    "en": "Good morning",
    "loc": "Selamat pagi",
    "pron": "suh-LAH-mat PAH-gee"
   },
   {
    "en": "Good evening",
    "loc": "Selamat malam",
    "pron": "suh-LAH-mat MAH-lam"
   },
   {
    "en": "My name is …",
    "loc": "Nama saya …",
    "pron": "NAH-mah SAH-yah …"
   },
   {
    "en": "How are you?",
    "loc": "Apa kabar?",
    "pron": "AH-pah KAH-bar"
   },
   {
    "en": "I need a doctor",
    "loc": "Saya butuh dokter",
    "pron": "SAH-yah BOO-too DOK-ter"
   },
   {
    "en": "Call the police",
    "loc": "Panggil polisi",
    "pron": "PANG-gil poh-LEE-see"
   },
   {
    "en": "Left",
    "loc": "Kiri",
    "pron": "KEE-ree"
   },
   {
    "en": "Right",
    "loc": "Kanan",
    "pron": "KAH-nan"
   },
   {
    "en": "Where is the train station?",
    "loc": "Di mana stasiun kereta?",
    "pron": "dee MAH-nah stah-see-OON kuh-REH-tah"
   },
   {
    "en": "How do I get to …?",
    "loc": "Bagaimana cara ke …?",
    "pron": "bah-gai-MAH-nah CHAH-rah kuh …"
   },
   {
    "en": "Delicious!",
    "loc": "Enak!",
    "pron": "EH-nak"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "satu",
    "pron": "SAH-too"
   },
   {
    "n": 2,
    "loc": "dua",
    "pron": "DOO-ah"
   },
   {
    "n": 3,
    "loc": "tiga",
    "pron": "TEE-gah"
   },
   {
    "n": 4,
    "loc": "empat",
    "pron": "UM-pat"
   },
   {
    "n": 5,
    "loc": "lima",
    "pron": "LEE-mah"
   },
   {
    "n": 6,
    "loc": "enam",
    "pron": "UH-nam"
   },
   {
    "n": 7,
    "loc": "tujuh",
    "pron": "TOO-joo"
   },
   {
    "n": 8,
    "loc": "delapan",
    "pron": "duh-LAH-pan"
   },
   {
    "n": 9,
    "loc": "sembilan",
    "pron": "sem-BEE-lan"
   },
   {
    "n": 10,
    "loc": "sepuluh",
    "pron": "suh-POO-loo"
   }
  ]
 },
 "Malay": {
  "native": "Bahasa Melayu",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Helo",
    "pron": "HEH-loh"
   },
   {
    "en": "Goodbye",
    "loc": "Selamat tinggal",
    "pron": "suh-LAH-mat TING-gal"
   },
   {
    "en": "Please",
    "loc": "Tolong",
    "pron": "TOH-long"
   },
   {
    "en": "Thank you",
    "loc": "Terima kasih",
    "pron": "tuh-REE-mah KAH-seh"
   },
   {
    "en": "You're welcome",
    "loc": "Sama-sama",
    "pron": "SAH-mah SAH-mah"
   },
   {
    "en": "Yes",
    "loc": "Ya",
    "pron": "yah"
   },
   {
    "en": "No",
    "loc": "Tidak",
    "pron": "TEE-dah"
   },
   {
    "en": "Excuse me",
    "loc": "Maafkan saya",
    "pron": "mah-AHF-kan SAH-yah"
   },
   {
    "en": "Sorry",
    "loc": "Maaf",
    "pron": "mah-AHF"
   },
   {
    "en": "Do you speak English?",
    "loc": "Adakah anda bercakap bahasa Inggeris?",
    "pron": "AH-dah-kah AHN-dah ber-CHAH-kap bah-HAH-sah ING-guh-ris"
   },
   {
    "en": "I don't understand",
    "loc": "Saya tidak faham",
    "pron": "SAH-yah TEE-dah FAH-ham"
   },
   {
    "en": "Help!",
    "loc": "Tolong!",
    "pron": "TOH-long"
   },
   {
    "en": "How much is this?",
    "loc": "Berapa harga ini?",
    "pron": "buh-RAH-pah HAR-gah EE-nee"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Di mana tandas?",
    "pron": "dee MAH-nah TAN-das"
   },
   {
    "en": "I would like this",
    "loc": "Saya mahu yang ini",
    "pron": "SAH-yah MAH-hoo yang EE-nee"
   },
   {
    "en": "The bill, please",
    "loc": "Tolong berikan bil",
    "pron": "TOH-long buh-REE-kan bil"
   },
   {
    "en": "Water",
    "loc": "Air",
    "pron": "AH-yer"
   },
   {
    "en": "Good morning",
    "loc": "Selamat pagi",
    "pron": "suh-LAH-mat PAH-gee"
   },
   {
    "en": "Good evening",
    "loc": "Selamat petang",
    "pron": "suh-LAH-mat puh-TANG"
   },
   {
    "en": "My name is …",
    "loc": "Nama saya …",
    "pron": "NAH-mah SAH-yah …"
   },
   {
    "en": "How are you?",
    "loc": "Apa khabar?",
    "pron": "AH-pah KAH-bar"
   },
   {
    "en": "I need a doctor",
    "loc": "Saya perlukan doktor",
    "pron": "SAH-yah per-LOO-kan DOK-tor"
   },
   {
    "en": "Call the police",
    "loc": "Panggil polis",
    "pron": "PANG-gil poh-LEES"
   },
   {
    "en": "Left",
    "loc": "Kiri",
    "pron": "KEE-ree"
   },
   {
    "en": "Right",
    "loc": "Kanan",
    "pron": "KAH-nan"
   },
   {
    "en": "Where is the train station?",
    "loc": "Di mana stesen kereta api?",
    "pron": "dee MAH-nah STEH-sen kuh-REH-tah AH-pee"
   },
   {
    "en": "How do I get to …?",
    "loc": "Bagaimana saya hendak ke …?",
    "pron": "bah-GUY-mah-nah SAH-yah HEN-dak kuh …"
   },
   {
    "en": "Delicious!",
    "loc": "Sedap!",
    "pron": "suh-DAP"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "satu",
    "pron": "SAH-too"
   },
   {
    "n": 2,
    "loc": "dua",
    "pron": "DOO-ah"
   },
   {
    "n": 3,
    "loc": "tiga",
    "pron": "TEE-gah"
   },
   {
    "n": 4,
    "loc": "empat",
    "pron": "uhm-PAT"
   },
   {
    "n": 5,
    "loc": "lima",
    "pron": "LEE-mah"
   },
   {
    "n": 6,
    "loc": "enam",
    "pron": "uh-NAM"
   },
   {
    "n": 7,
    "loc": "tujuh",
    "pron": "TOO-joh"
   },
   {
    "n": 8,
    "loc": "lapan",
    "pron": "LAH-pan"
   },
   {
    "n": 9,
    "loc": "sembilan",
    "pron": "sem-BEE-lan"
   },
   {
    "n": 10,
    "loc": "sepuluh",
    "pron": "suh-POO-loh"
   }
  ]
 },
 "Thai": {
  "native": "ภาษาไทย",
  "phrases": [
   {
    "en": "Hello",
    "loc": "สวัสดีครับ / สวัสดีค่ะ",
    "pron": "sa-wàt-dee khráp (m) / sa-wàt-dee khâ (f)"
   },
   {
    "en": "Goodbye",
    "loc": "ลาก่อนครับ / ลาก่อนค่ะ",
    "pron": "laa-gòn khráp / khâ"
   },
   {
    "en": "Please",
    "loc": "กรุณา",
    "pron": "ga-rú-naa"
   },
   {
    "en": "Thank you",
    "loc": "ขอบคุณครับ / ขอบคุณค่ะ",
    "pron": "khàwp-khun khráp / khâ"
   },
   {
    "en": "You're welcome",
    "loc": "ไม่เป็นไรครับ / ไม่เป็นไรค่ะ",
    "pron": "mâi pen rai khráp / khâ"
   },
   {
    "en": "Yes",
    "loc": "ใช่ครับ / ใช่ค่ะ",
    "pron": "châi khráp / khâ"
   },
   {
    "en": "No",
    "loc": "ไม่ใช่ครับ / ไม่ใช่ค่ะ",
    "pron": "mâi châi khráp / khâ"
   },
   {
    "en": "Excuse me",
    "loc": "ขอโทษครับ / ขอโทษค่ะ",
    "pron": "khǎw-thôht khráp / khâ"
   },
   {
    "en": "Sorry",
    "loc": "ขอโทษครับ / ขอโทษค่ะ",
    "pron": "khǎw-thôht khráp / khâ"
   },
   {
    "en": "Do you speak English?",
    "loc": "คุณพูดภาษาอังกฤษได้ไหมครับ / คะ",
    "pron": "khun phûut phaa-sǎa ang-grìt dâi mǎi khráp / khá"
   },
   {
    "en": "I don't understand",
    "loc": "ผมไม่เข้าใจ / ดิฉันไม่เข้าใจ",
    "pron": "phǒm mâi khâo-jai (m) / di-chǎn mâi khâo-jai (f)"
   },
   {
    "en": "Help!",
    "loc": "ช่วยด้วย!",
    "pron": "chûay dûay!"
   },
   {
    "en": "How much is this?",
    "loc": "อันนี้เท่าไหร่ครับ / คะ",
    "pron": "an-níi thâo-rài khráp / khá"
   },
   {
    "en": "Where is the toilet?",
    "loc": "ห้องน้ำอยู่ที่ไหนครับ / คะ",
    "pron": "hâwng-náam yùu thîi-nǎi khráp / khá"
   },
   {
    "en": "I would like this",
    "loc": "ขออันนี้ครับ / ค่ะ",
    "pron": "khǎw an-níi khráp / khâ"
   },
   {
    "en": "The bill, please",
    "loc": "เก็บเงินด้วยครับ / ค่ะ",
    "pron": "gèp ngern dûay khráp / khâ"
   },
   {
    "en": "Water",
    "loc": "น้ำ",
    "pron": "náam"
   },
   {
    "en": "Good morning",
    "loc": "สวัสดีตอนเช้าครับ / ค่ะ",
    "pron": "sa-wàt-dee dtawn-cháo khráp / khâ"
   },
   {
    "en": "Good evening",
    "loc": "สวัสดีตอนเย็นครับ / ค่ะ",
    "pron": "sa-wàt-dee dtawn-yen khráp / khâ"
   },
   {
    "en": "My name is …",
    "loc": "ผมชื่อ … / ดิฉันชื่อ …",
    "pron": "phǒm chûe … (m) / di-chǎn chûe … (f)"
   },
   {
    "en": "How are you?",
    "loc": "สบายดีไหมครับ / คะ",
    "pron": "sa-baai-dee mǎi khráp / khá"
   },
   {
    "en": "I need a doctor",
    "loc": "ผมต้องการหมอ / ดิฉันต้องการหมอ",
    "pron": "phǒm / di-chǎn dtâwng-gaan mǎw"
   },
   {
    "en": "Call the police",
    "loc": "เรียกตำรวจหน่อยครับ / ค่ะ",
    "pron": "rîak dtam-rùat nàwy khráp / khâ"
   },
   {
    "en": "Left",
    "loc": "ซ้าย",
    "pron": "sáai"
   },
   {
    "en": "Right",
    "loc": "ขวา",
    "pron": "khwǎa"
   },
   {
    "en": "Where is the train station?",
    "loc": "สถานีรถไฟอยู่ที่ไหนครับ / คะ",
    "pron": "sa-thǎa-nee rót-fai yùu thîi-nǎi khráp / khá"
   },
   {
    "en": "How do I get to …?",
    "loc": "ไป … ยังไงครับ / คะ",
    "pron": "bpai … yang-ngai khráp / khá"
   },
   {
    "en": "Delicious!",
    "loc": "อร่อย!",
    "pron": "a-ràwy!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "หนึ่ง",
    "pron": "nèung"
   },
   {
    "n": 2,
    "loc": "สอง",
    "pron": "sǎwng"
   },
   {
    "n": 3,
    "loc": "สาม",
    "pron": "sǎam"
   },
   {
    "n": 4,
    "loc": "สี่",
    "pron": "sìi"
   },
   {
    "n": 5,
    "loc": "ห้า",
    "pron": "hâa"
   },
   {
    "n": 6,
    "loc": "หก",
    "pron": "hòk"
   },
   {
    "n": 7,
    "loc": "เจ็ด",
    "pron": "jèt"
   },
   {
    "n": 8,
    "loc": "แปด",
    "pron": "bpàet"
   },
   {
    "n": 9,
    "loc": "เก้า",
    "pron": "gâo"
   },
   {
    "n": 10,
    "loc": "สิบ",
    "pron": "sìp"
   }
  ]
 },
 "Vietnamese": {
  "native": "Tiếng Việt",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Xin chào",
    "pron": "sin chow (chow with falling-rising tone)"
   },
   {
    "en": "Goodbye",
    "loc": "Tạm biệt",
    "pron": "tahm bee-uht (tahm low/heavy, bee-uht low/heavy)"
   },
   {
    "en": "Please",
    "loc": "Làm ơn",
    "pron": "lahm un (lahm falling, un mid)"
   },
   {
    "en": "Thank you",
    "loc": "Cảm ơn",
    "pron": "gahm un (gahm falling-rising, un mid)"
   },
   {
    "en": "You're welcome",
    "loc": "Không có gì",
    "pron": "khohng gaw zee (north) / khohng gaw yee (south); khohng mid, gaw rising, zee/yee falling"
   },
   {
    "en": "Yes",
    "loc": "Vâng",
    "pron": "vung (mid level; southern: dạ = 'yah' heavy)"
   },
   {
    "en": "No",
    "loc": "Không",
    "pron": "khohng (mid level tone)"
   },
   {
    "en": "Excuse me",
    "loc": "Xin lỗi",
    "pron": "sin loy (loy with broken/glottal rising tone)"
   },
   {
    "en": "Sorry",
    "loc": "Xin lỗi",
    "pron": "sin loy (loy with broken/glottal rising tone)"
   },
   {
    "en": "Do you speak English?",
    "loc": "Bạn có nói tiếng Anh không?",
    "pron": "bahn gaw noy tee-uhng ahng khohng (bahn heavy, gaw rising, noy rising, tee-uhng rising)"
   },
   {
    "en": "I don't understand",
    "loc": "Tôi không hiểu",
    "pron": "toy khohng hee-oo (toy mid, khohng mid, hee-oo falling-rising)"
   },
   {
    "en": "Help!",
    "loc": "Cứu với!",
    "pron": "guh-oo voy (guh-oo rising, voy falling-rising)"
   },
   {
    "en": "How much is this?",
    "loc": "Cái này bao nhiêu tiền?",
    "pron": "gai nai bow nyee-oo tee-uhn (gai falling, nai falling, bow mid, nyee-oo mid, tee-uhn falling)"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Nhà vệ sinh ở đâu?",
    "pron": "nyah veh sing uh dow (nyah falling, veh heavy, sing mid, uh falling-rising, dow mid)"
   },
   {
    "en": "I would like this",
    "loc": "Tôi muốn cái này",
    "pron": "toy moo-uhn gai nai (toy mid, moo-uhn rising, gai falling, nai falling)"
   },
   {
    "en": "The bill, please",
    "loc": "Cho tôi tính tiền",
    "pron": "chaw toy ting tee-uhn (chaw mid, toy mid, ting rising, tee-uhn falling)"
   },
   {
    "en": "Water",
    "loc": "Nước",
    "pron": "nuh-uhk (rising/sharp tone)"
   },
   {
    "en": "Good morning",
    "loc": "Chào buổi sáng",
    "pron": "chow boo-oy sahng (chow falling-rising, boo-oy falling-rising, sahng rising)"
   },
   {
    "en": "Good evening",
    "loc": "Chào buổi tối",
    "pron": "chow boo-oy toy (chow falling-rising, boo-oy falling-rising, toy rising)"
   },
   {
    "en": "My name is …",
    "loc": "Tôi tên là …",
    "pron": "toy tehn lah … (toy mid, tehn mid, lah falling)"
   },
   {
    "en": "How are you?",
    "loc": "Bạn có khỏe không?",
    "pron": "bahn gaw khwe khohng (bahn heavy, gaw rising, khwe falling-rising, khohng mid)"
   },
   {
    "en": "I need a doctor",
    "loc": "Tôi cần bác sĩ",
    "pron": "toy gun bahk see (toy mid, gun falling, bahk rising, see falling-rising)"
   },
   {
    "en": "Call the police",
    "loc": "Gọi cảnh sát",
    "pron": "goy gahng saht (goy heavy, gahng falling-rising, saht rising)"
   },
   {
    "en": "Left",
    "loc": "Bên trái",
    "pron": "behn chai (behn mid, chai rising)"
   },
   {
    "en": "Right",
    "loc": "Bên phải",
    "pron": "behn fai (behn mid, fai falling-rising)"
   },
   {
    "en": "Where is the train station?",
    "loc": "Ga tàu ở đâu?",
    "pron": "gah tow uh dow (gah mid, tow falling, uh falling-rising, dow mid)"
   },
   {
    "en": "How do I get to …?",
    "loc": "Làm sao để đến …?",
    "pron": "lahm sow deh dehn … (lahm falling, sow mid, deh falling-rising, dehn rising)"
   },
   {
    "en": "Delicious!",
    "loc": "Ngon quá!",
    "pron": "ngawn gwah (ngawn mid, gwah rising)"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "một",
    "pron": "moht (heavy/low-glottal tone)"
   },
   {
    "n": 2,
    "loc": "hai",
    "pron": "high (mid level tone)"
   },
   {
    "n": 3,
    "loc": "ba",
    "pron": "bah (mid level tone)"
   },
   {
    "n": 4,
    "loc": "bốn",
    "pron": "bohn (rising tone)"
   },
   {
    "n": 5,
    "loc": "năm",
    "pron": "nahm (mid level tone)"
   },
   {
    "n": 6,
    "loc": "sáu",
    "pron": "sow (rising tone)"
   },
   {
    "n": 7,
    "loc": "bảy",
    "pron": "bye (falling-rising tone)"
   },
   {
    "n": 8,
    "loc": "tám",
    "pron": "tahm (rising tone)"
   },
   {
    "n": 9,
    "loc": "chín",
    "pron": "cheen (rising tone)"
   },
   {
    "n": 10,
    "loc": "mười",
    "pron": "muh-uhy (falling tone)"
   }
  ]
 },
 "Khmer": {
  "native": "ភាសាខ្មែរ",
  "phrases": [
   {
    "en": "Hello",
    "loc": "សួស្តី",
    "pron": "sua-sdei"
   },
   {
    "en": "Goodbye",
    "loc": "លាហើយ",
    "pron": "lia haeuy"
   },
   {
    "en": "Please",
    "loc": "សូម",
    "pron": "som"
   },
   {
    "en": "Thank you",
    "loc": "អរគុណ",
    "pron": "or-kun (very much: or-kun ch'raeun)"
   },
   {
    "en": "You're welcome",
    "loc": "មិនអីទេ",
    "pron": "min ei te"
   },
   {
    "en": "Yes",
    "loc": "បាទ / ចាស",
    "pron": "baat (male) / chaa (female)"
   },
   {
    "en": "No",
    "loc": "ទេ",
    "pron": "te"
   },
   {
    "en": "Excuse me",
    "loc": "សុំទោស",
    "pron": "som toh"
   },
   {
    "en": "Sorry",
    "loc": "សុំទោស",
    "pron": "som toh"
   },
   {
    "en": "Do you speak English?",
    "loc": "តើអ្នកនិយាយភាសាអង់គ្លេសទេ?",
    "pron": "tae neak ni-yeay phiesa ong-kleh te?"
   },
   {
    "en": "I don't understand",
    "loc": "ខ្ញុំមិនយល់ទេ",
    "pron": "khnyom min yul te"
   },
   {
    "en": "Help!",
    "loc": "ជួយផង!",
    "pron": "chuoy phong!"
   },
   {
    "en": "How much is this?",
    "loc": "តើនេះថ្លៃប៉ុន្មាន?",
    "pron": "tae nih thlai pon-maan?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "តើបង្គន់នៅឯណា?",
    "pron": "tae bong-kun nov ae naa?"
   },
   {
    "en": "I would like this",
    "loc": "ខ្ញុំចង់បានមួយនេះ",
    "pron": "khnyom chong baan muoy nih"
   },
   {
    "en": "The bill, please",
    "loc": "សូមគិតលុយ",
    "pron": "som kit luy"
   },
   {
    "en": "Water",
    "loc": "ទឹក",
    "pron": "tuk"
   },
   {
    "en": "Good morning",
    "loc": "អរុណសួស្តី",
    "pron": "a-run sua-sdei"
   },
   {
    "en": "Good evening",
    "loc": "សាយ័ណ្ហសួស្តី",
    "pron": "sayoanh sua-sdei"
   },
   {
    "en": "Good night",
    "loc": "រាត្រីសួស្តី",
    "pron": "reaktrei sua-sdei"
   },
   {
    "en": "My name is …",
    "loc": "ខ្ញុំឈ្មោះ …",
    "pron": "khnyom chmuoh …"
   },
   {
    "en": "How are you?",
    "loc": "តើអ្នកសុខសប្បាយជាទេ?",
    "pron": "tae neak sok sa-baay chie te?"
   },
   {
    "en": "I need a doctor",
    "loc": "ខ្ញុំត្រូវការគ្រូពេទ្យ",
    "pron": "khnyom trov kaa kru-pet"
   },
   {
    "en": "Call the police",
    "loc": "សូមហៅប៉ូលីស",
    "pron": "som hav po-lih"
   },
   {
    "en": "Left",
    "loc": "ឆ្វេង",
    "pron": "chveng"
   },
   {
    "en": "Right",
    "loc": "ស្ដាំ",
    "pron": "sdam"
   },
   {
    "en": "Where is the train station?",
    "loc": "តើស្ថានីយ៍រថភ្លើងនៅឯណា?",
    "pron": "tae sthaanii roteh-phloeung nov ae naa?"
   },
   {
    "en": "How do I get to …?",
    "loc": "តើខ្ញុំទៅ … ដោយរបៀបណា?",
    "pron": "tae khnyom tov … daoy ro-biep naa?"
   },
   {
    "en": "Delicious!",
    "loc": "ឆ្ងាញ់ណាស់!",
    "pron": "chnganh nah!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "មួយ",
    "pron": "muoy"
   },
   {
    "n": 2,
    "loc": "ពីរ",
    "pron": "pii"
   },
   {
    "n": 3,
    "loc": "បី",
    "pron": "bei"
   },
   {
    "n": 4,
    "loc": "បួន",
    "pron": "buon"
   },
   {
    "n": 5,
    "loc": "ប្រាំ",
    "pron": "pram"
   },
   {
    "n": 6,
    "loc": "ប្រាំមួយ",
    "pron": "pram-muoy"
   },
   {
    "n": 7,
    "loc": "ប្រាំពីរ",
    "pron": "pram-pii"
   },
   {
    "n": 8,
    "loc": "ប្រាំបី",
    "pron": "pram-bei"
   },
   {
    "n": 9,
    "loc": "ប្រាំបួន",
    "pron": "pram-buon"
   },
   {
    "n": 10,
    "loc": "ដប់",
    "pron": "dop"
   }
  ]
 },
 "Lao": {
  "native": "ພາສາລາວ",
  "phrases": [
   {
    "en": "Hello",
    "loc": "ສະບາຍດີ",
    "pron": "sa-bai-dii"
   },
   {
    "en": "Goodbye",
    "loc": "ລາກ່ອນ",
    "pron": "laa-kòn (low tone on second syllable)"
   },
   {
    "en": "Please",
    "loc": "ກະລຸນາ",
    "pron": "ga-lu-naa"
   },
   {
    "en": "Thank you",
    "loc": "ຂອບໃຈ",
    "pron": "khàwp-jai (low then mid)"
   },
   {
    "en": "You're welcome",
    "loc": "ບໍ່ເປັນຫຍັງ",
    "pron": "baw-pen-nyang (low-mid-mid)"
   },
   {
    "en": "Yes",
    "loc": "ແມ່ນ",
    "pron": "mâen (high-falling); the fuller ແມ່ນແລ້ວ mâen-láew = 'that's right'"
   },
   {
    "en": "No",
    "loc": "ບໍ່",
    "pron": "baw (low tone)"
   },
   {
    "en": "Excuse me",
    "loc": "ຂໍໂທດ",
    "pron": "khǎw-thôot (rising then falling)"
   },
   {
    "en": "Sorry",
    "loc": "ຂໍໂທດ",
    "pron": "khǎw-thôot (rising then falling)"
   },
   {
    "en": "Do you speak English?",
    "loc": "ເຈົ້າເວົ້າພາສາອັງກິດໄດ້ບໍ່?",
    "pron": "jâo wâo phaa-sǎa ang-kit dâi baw? (sentence-final baw marks the question)"
   },
   {
    "en": "I don't understand",
    "loc": "ຂ້ອຍບໍ່ເຂົ້າໃຈ",
    "pron": "khàwy baw khào-jai"
   },
   {
    "en": "Help!",
    "loc": "ຊ່ວຍດ້ວຍ!",
    "pron": "suay-dûay!"
   },
   {
    "en": "How much is this?",
    "loc": "ອັນນີ້ລາຄາເທົ່າໃດ?",
    "pron": "an-níi laa-khaa thao-dai?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "ຫ້ອງນ້ຳຢູ່ໃສ?",
    "pron": "hâwng-nâm yuu sǎi? (rising on sǎi)"
   },
   {
    "en": "I would like this",
    "loc": "ຂ້ອຍຢາກໄດ້ອັນນີ້",
    "pron": "khàwy yàak dâi an-níi"
   },
   {
    "en": "The bill, please",
    "loc": "ຂໍເກັບເງິນແດ່",
    "pron": "khǎw kep ngern dae (rising on khǎw)"
   },
   {
    "en": "Water",
    "loc": "ນ້ຳ",
    "pron": "nâm (high-falling)"
   },
   {
    "en": "Good morning",
    "loc": "ສະບາຍດີຕອນເຊົ້າ",
    "pron": "sa-bai-dii tawn-sâo"
   },
   {
    "en": "Good evening",
    "loc": "ສະບາຍດີຕອນແລງ",
    "pron": "sa-bai-dii tawn-laeng"
   },
   {
    "en": "My name is …",
    "loc": "ຂ້ອຍຊື່ …",
    "pron": "khàwy seu … (falling khàwy, mid seu)"
   },
   {
    "en": "How are you?",
    "loc": "ສະບາຍດີບໍ່?",
    "pron": "sa-bai-dii baw? (final baw marks the question)"
   },
   {
    "en": "I need a doctor",
    "loc": "ຂ້ອຍຕ້ອງການໝໍ",
    "pron": "khàwy tâwng-kaan mǎw (rising on mǎw)"
   },
   {
    "en": "Call the police",
    "loc": "ໂທຫາຕຳຫຼວດ",
    "pron": "thoo-hǎa tam-luat"
   },
   {
    "en": "Left",
    "loc": "ຊ້າຍ",
    "pron": "sâai (high-falling)"
   },
   {
    "en": "Right",
    "loc": "ຂວາ",
    "pron": "khwǎa (rising)"
   },
   {
    "en": "Where is the train station?",
    "loc": "ສະຖານີລົດໄຟຢູ່ໃສ?",
    "pron": "sa-thǎa-nii lot-fai yuu sǎi?"
   },
   {
    "en": "How do I get to …?",
    "loc": "ໄປ … ໄປທາງໃດ?",
    "pron": "pai … pai thaang-dai?"
   },
   {
    "en": "Delicious!",
    "loc": "ແຊບ!",
    "pron": "saep! (high tone)"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "ໜຶ່ງ",
    "pron": "neung (low tone)"
   },
   {
    "n": 2,
    "loc": "ສອງ",
    "pron": "sǎwng (rising)"
   },
   {
    "n": 3,
    "loc": "ສາມ",
    "pron": "sǎam (rising)"
   },
   {
    "n": 4,
    "loc": "ສີ່",
    "pron": "sii (low tone)"
   },
   {
    "n": 5,
    "loc": "ຫ້າ",
    "pron": "hâa (high-falling)"
   },
   {
    "n": 6,
    "loc": "ຫົກ",
    "pron": "hok (low tone)"
   },
   {
    "n": 7,
    "loc": "ເຈັດ",
    "pron": "jet (low tone)"
   },
   {
    "n": 8,
    "loc": "ແປດ",
    "pron": "paet (low tone)"
   },
   {
    "n": 9,
    "loc": "ເກົ້າ",
    "pron": "kâo (high-falling)"
   },
   {
    "n": 10,
    "loc": "ສິບ",
    "pron": "sip (low tone)"
   }
  ]
 },
 "Burmese": {
  "native": "မြန်မာဘာသာ",
  "phrases": [
   {
    "en": "Hello",
    "loc": "မင်္ဂလာပါ",
    "pron": "ming-ga-la-ba"
   },
   {
    "en": "Goodbye",
    "loc": "သွားတော့မယ်",
    "pron": "thwa-daw-meh"
   },
   {
    "en": "Please",
    "loc": "ကျေးဇူးပြု၍",
    "pron": "kyay-zu-pyu-ywei"
   },
   {
    "en": "Thank you",
    "loc": "ကျေးဇူးတင်ပါတယ်",
    "pron": "kyay-zu-tin-ba-deh"
   },
   {
    "en": "You're welcome",
    "loc": "ရပါတယ်",
    "pron": "ya-ba-deh"
   },
   {
    "en": "Yes",
    "loc": "ဟုတ်ကဲ့",
    "pron": "hoke-keh"
   },
   {
    "en": "No",
    "loc": "မဟုတ်ပါဘူး",
    "pron": "ma-hoke-pa-bu"
   },
   {
    "en": "Excuse me",
    "loc": "တစ်ဆိတ်လောက်",
    "pron": "ta-seik-lauk"
   },
   {
    "en": "Sorry",
    "loc": "တောင်းပန်ပါတယ်",
    "pron": "taung-pan-ba-deh"
   },
   {
    "en": "Do you speak English?",
    "loc": "အင်္ဂလိပ်စကား ပြောတတ်လား",
    "pron": "in-ga-leik sa-ga pyaw-tat-la"
   },
   {
    "en": "I don't understand",
    "loc": "နားမလည်ပါဘူး",
    "pron": "na-ma-leh-ba-bu"
   },
   {
    "en": "Help!",
    "loc": "ကူညီပါ",
    "pron": "ku-nyi-ba"
   },
   {
    "en": "How much is this?",
    "loc": "ဒါ ဘယ်လောက်လဲ",
    "pron": "da beh-lauk-leh"
   },
   {
    "en": "Where is the toilet?",
    "loc": "အိမ်သာ ဘယ်မှာလဲ",
    "pron": "ein-tha beh-hma-leh"
   },
   {
    "en": "I would like this",
    "loc": "ဒါ လိုချင်ပါတယ်",
    "pron": "da lo-chin-ba-deh"
   },
   {
    "en": "The bill, please",
    "loc": "ငွေရှင်းမယ်",
    "pron": "ngway-shin-meh"
   },
   {
    "en": "Water",
    "loc": "ရေ",
    "pron": "yay"
   },
   {
    "en": "Good morning",
    "loc": "မင်္ဂလာနံနက်ခင်းပါ",
    "pron": "ming-ga-la nan-net-khin-ba"
   },
   {
    "en": "Good evening",
    "loc": "မင်္ဂလာညနေခင်းပါ",
    "pron": "ming-ga-la nya-nay-khin-ba"
   },
   {
    "en": "My name is …",
    "loc": "ကျွန်တော့်နာမည်က …",
    "pron": "kya-naw na-meh-ga … (male) / kya-ma na-meh-ga … (female)"
   },
   {
    "en": "How are you?",
    "loc": "နေကောင်းလား",
    "pron": "nay-kaung-la"
   },
   {
    "en": "I need a doctor",
    "loc": "ဆရာဝန် လိုအပ်ပါတယ်",
    "pron": "sa-ya-wun lo-ap-pa-deh"
   },
   {
    "en": "Call the police",
    "loc": "ရဲ ခေါ်ပေးပါ",
    "pron": "yeh khaw-pay-ba"
   },
   {
    "en": "Left",
    "loc": "ဘယ်ဘက်",
    "pron": "beh-bet"
   },
   {
    "en": "Right",
    "loc": "ညာဘက်",
    "pron": "nya-bet"
   },
   {
    "en": "Where is the train station?",
    "loc": "ဘူတာရုံ ဘယ်မှာလဲ",
    "pron": "bu-da-yon beh-hma-leh"
   },
   {
    "en": "How do I get to …?",
    "loc": "… ကို ဘယ်လိုသွားရမလဲ",
    "pron": "… ko beh-lo thwa-ya-ma-leh"
   },
   {
    "en": "Delicious!",
    "loc": "စားလို့ကောင်းတယ်",
    "pron": "sa-lo-kaung-deh"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "တစ်",
    "pron": "tit"
   },
   {
    "n": 2,
    "loc": "နှစ်",
    "pron": "hnit"
   },
   {
    "n": 3,
    "loc": "သုံး",
    "pron": "thoun"
   },
   {
    "n": 4,
    "loc": "လေး",
    "pron": "lay"
   },
   {
    "n": 5,
    "loc": "ငါး",
    "pron": "nga"
   },
   {
    "n": 6,
    "loc": "ခြောက်",
    "pron": "chauk"
   },
   {
    "n": 7,
    "loc": "ခုနစ်",
    "pron": "khun-nit"
   },
   {
    "n": 8,
    "loc": "ရှစ်",
    "pron": "shit"
   },
   {
    "n": 9,
    "loc": "ကိုး",
    "pron": "ko"
   },
   {
    "n": 10,
    "loc": "ဆယ်",
    "pron": "seh"
   }
  ]
 },
 "Filipino (Tagalog)": {
  "native": "Filipino / Tagalog",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Kumusta",
    "pron": "koo-moos-TAH"
   },
   {
    "en": "Goodbye",
    "loc": "Paalam",
    "pron": "pah-AH-lahm"
   },
   {
    "en": "Please",
    "loc": "Pakiusap",
    "pron": "pah-kee-OO-sahp"
   },
   {
    "en": "Thank you",
    "loc": "Salamat po",
    "pron": "sah-LAH-maht poh"
   },
   {
    "en": "You're welcome",
    "loc": "Walang anuman",
    "pron": "WAH-lang ah-noo-MAHN"
   },
   {
    "en": "Yes",
    "loc": "Oo",
    "pron": "OH-oh"
   },
   {
    "en": "No",
    "loc": "Hindi",
    "pron": "hin-DEE"
   },
   {
    "en": "Excuse me",
    "loc": "Paumanhin po",
    "pron": "pah-oo-MAHN-hin poh"
   },
   {
    "en": "Sorry",
    "loc": "Pasensya na po",
    "pron": "pah-SEN-syah nah poh"
   },
   {
    "en": "Do you speak English?",
    "loc": "Marunong po ba kayong mag-Ingles?",
    "pron": "mah-ROO-nong poh bah KAH-yong mahg-ing-GLESS"
   },
   {
    "en": "I don't understand",
    "loc": "Hindi ko po naiintindihan",
    "pron": "hin-DEE koh poh nah-ee-in-tin-dee-HAHN"
   },
   {
    "en": "Help!",
    "loc": "Saklolo!",
    "pron": "sahk-loh-LOH"
   },
   {
    "en": "How much is this?",
    "loc": "Magkano po ito?",
    "pron": "mahg-KAH-noh poh ee-TOH"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Nasaan po ang banyo?",
    "pron": "nah-sah-AHN poh ahng BAHN-yoh"
   },
   {
    "en": "I would like this",
    "loc": "Gusto ko po ito",
    "pron": "goos-TOH koh poh ee-TOH"
   },
   {
    "en": "The bill, please",
    "loc": "Pakibigay po ang bill",
    "pron": "pah-kee-bee-GAHY poh ahng bill"
   },
   {
    "en": "Water",
    "loc": "Tubig",
    "pron": "TOO-big"
   },
   {
    "en": "Good morning",
    "loc": "Magandang umaga po",
    "pron": "mah-gahn-DAHNG oo-MAH-gah poh"
   },
   {
    "en": "Good evening",
    "loc": "Magandang gabi po",
    "pron": "mah-gahn-DAHNG gah-BEE poh"
   },
   {
    "en": "My name is …",
    "loc": "Ang pangalan ko ay …",
    "pron": "ahng pah-NGAH-lahn koh eye …"
   },
   {
    "en": "How are you?",
    "loc": "Kumusta po kayo?",
    "pron": "koo-moos-TAH poh kah-YOH"
   },
   {
    "en": "I need a doctor",
    "loc": "Kailangan ko po ng doktor",
    "pron": "kah-ee-LAH-ngahn koh poh nahng DOK-tor"
   },
   {
    "en": "Call the police",
    "loc": "Tawagin po ninyo ang pulis",
    "pron": "tah-WAH-gin poh nin-YOH ahng poo-LEES"
   },
   {
    "en": "Left",
    "loc": "Kaliwa",
    "pron": "kah-lee-WAH"
   },
   {
    "en": "Right",
    "loc": "Kanan",
    "pron": "KAH-nahn"
   },
   {
    "en": "Where is the train station?",
    "loc": "Nasaan po ang istasyon ng tren?",
    "pron": "nah-sah-AHN poh ahng ees-tah-SYOHN nahng tren"
   },
   {
    "en": "How do I get to …?",
    "loc": "Paano po ako makakarating sa …?",
    "pron": "pah-AH-noh poh ah-KOH mah-kah-kah-RAH-ting sah …"
   },
   {
    "en": "Delicious!",
    "loc": "Masarap!",
    "pron": "mah-sah-RAHP"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "isa",
    "pron": "ee-SAH"
   },
   {
    "n": 2,
    "loc": "dalawa",
    "pron": "dah-lah-WAH"
   },
   {
    "n": 3,
    "loc": "tatlo",
    "pron": "taht-LOH"
   },
   {
    "n": 4,
    "loc": "apat",
    "pron": "AH-paht"
   },
   {
    "n": 5,
    "loc": "lima",
    "pron": "lee-MAH"
   },
   {
    "n": 6,
    "loc": "anim",
    "pron": "AH-nim"
   },
   {
    "n": 7,
    "loc": "pito",
    "pron": "pee-TOH"
   },
   {
    "n": 8,
    "loc": "walo",
    "pron": "wah-LOH"
   },
   {
    "n": 9,
    "loc": "siyam",
    "pron": "see-YAHM"
   },
   {
    "n": 10,
    "loc": "sampu",
    "pron": "sahm-POO"
   }
  ]
 },
 "Turkish": {
  "native": "Türkçe",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Merhaba",
    "pron": "MEHR-hah-bah"
   },
   {
    "en": "Goodbye",
    "loc": "Hoşça kalın",
    "pron": "HOSH-cha kah-LUHN (said by the one leaving); the one staying says 'Güle güle' — gew-LEH gew-LEH"
   },
   {
    "en": "Please",
    "loc": "Lütfen",
    "pron": "LEWT-fen"
   },
   {
    "en": "Thank you",
    "loc": "Teşekkür ederim",
    "pron": "teh-shek-KEWR eh-deh-RIM"
   },
   {
    "en": "You're welcome",
    "loc": "Rica ederim",
    "pron": "ree-JAH eh-deh-RIM"
   },
   {
    "en": "Yes",
    "loc": "Evet",
    "pron": "EH-vet"
   },
   {
    "en": "No",
    "loc": "Hayır",
    "pron": "HAH-yuhr"
   },
   {
    "en": "Excuse me",
    "loc": "Affedersiniz",
    "pron": "ahf-feh-DEHR-see-niz"
   },
   {
    "en": "Sorry",
    "loc": "Özür dilerim",
    "pron": "er-ZEWR dee-leh-RIM"
   },
   {
    "en": "Do you speak English?",
    "loc": "İngilizce biliyor musunuz?",
    "pron": "een-gee-LEEZ-jeh bee-lee-YOR moo-soo-nooz"
   },
   {
    "en": "I don't understand",
    "loc": "Anlamıyorum",
    "pron": "ahn-lah-MUH-yoh-room"
   },
   {
    "en": "Help!",
    "loc": "İmdat!",
    "pron": "eem-DAHT"
   },
   {
    "en": "How much is this?",
    "loc": "Bu ne kadar?",
    "pron": "boo neh kah-DAHR"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Tuvalet nerede?",
    "pron": "too-vah-LET NEH-reh-deh"
   },
   {
    "en": "I would like this",
    "loc": "Bunu istiyorum",
    "pron": "boo-NOO ees-tee-YOH-room"
   },
   {
    "en": "The bill, please",
    "loc": "Hesap, lütfen",
    "pron": "heh-SAHP, LEWT-fen"
   },
   {
    "en": "Water",
    "loc": "Su",
    "pron": "soo"
   },
   {
    "en": "Good morning",
    "loc": "Günaydın",
    "pron": "gew-nahy-DUHN"
   },
   {
    "en": "Good evening",
    "loc": "İyi akşamlar",
    "pron": "ee-YEE ahk-shahm-LAHR"
   },
   {
    "en": "My name is …",
    "loc": "Adım …",
    "pron": "ah-DUHM … (or 'Benim adım …' — beh-NEEM ah-DUHM)"
   },
   {
    "en": "How are you?",
    "loc": "Nasılsınız?",
    "pron": "NAH-suhl-suh-nuhz"
   },
   {
    "en": "I need a doctor",
    "loc": "Bir doktora ihtiyacım var",
    "pron": "beer dok-toh-RAH eeh-tee-yah-JUHM vahr"
   },
   {
    "en": "Call the police",
    "loc": "Polisi arayın",
    "pron": "poh-lee-SEE ah-RAH-yuhn"
   },
   {
    "en": "Left",
    "loc": "Sol",
    "pron": "sol"
   },
   {
    "en": "Right",
    "loc": "Sağ",
    "pron": "sah (the 'ğ' is silent, lengthening the vowel)"
   },
   {
    "en": "Where is the train station?",
    "loc": "Tren istasyonu nerede?",
    "pron": "tren ees-tahs-yoh-NOO NEH-reh-deh"
   },
   {
    "en": "How do I get to …?",
    "loc": "… nasıl gidebilirim?",
    "pron": "… NAH-suhl gee-deh-bee-lee-RIM (e.g. '…-e nasıl gidebilirim?')"
   },
   {
    "en": "Delicious!",
    "loc": "Çok lezzetli!",
    "pron": "chok lez-zet-LEE"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "bir",
    "pron": "beer"
   },
   {
    "n": 2,
    "loc": "iki",
    "pron": "ee-KEE"
   },
   {
    "n": 3,
    "loc": "üç",
    "pron": "ewch"
   },
   {
    "n": 4,
    "loc": "dört",
    "pron": "dert"
   },
   {
    "n": 5,
    "loc": "beş",
    "pron": "besh"
   },
   {
    "n": 6,
    "loc": "altı",
    "pron": "ahl-TUH"
   },
   {
    "n": 7,
    "loc": "yedi",
    "pron": "yeh-DEE"
   },
   {
    "n": 8,
    "loc": "sekiz",
    "pron": "seh-KEEZ"
   },
   {
    "n": 9,
    "loc": "dokuz",
    "pron": "doh-KOOZ"
   },
   {
    "n": 10,
    "loc": "on",
    "pron": "on"
   }
  ]
 },
 "Persian (Farsi)": {
  "native": "فارسی",
  "phrases": [
   {
    "en": "Hello",
    "loc": "سلام",
    "pron": "sa-LÂM"
   },
   {
    "en": "Goodbye",
    "loc": "خداحافظ",
    "pron": "kho-dâ-HÂ-fez"
   },
   {
    "en": "Please",
    "loc": "لطفاً",
    "pron": "lot-FAN"
   },
   {
    "en": "Thank you",
    "loc": "متشکرم",
    "pron": "mo-ta-SHAK-ke-ram"
   },
   {
    "en": "You're welcome",
    "loc": "خواهش می‌کنم",
    "pron": "KHÂH-esh mee-ko-nam"
   },
   {
    "en": "Yes",
    "loc": "بله",
    "pron": "BA-le"
   },
   {
    "en": "No",
    "loc": "نه",
    "pron": "na"
   },
   {
    "en": "Excuse me",
    "loc": "ببخشید",
    "pron": "be-bakh-SHEED"
   },
   {
    "en": "Sorry",
    "loc": "متأسفم",
    "pron": "mo-ta-AS-se-fam"
   },
   {
    "en": "Do you speak English?",
    "loc": "آیا انگلیسی صحبت می‌کنید؟",
    "pron": "ÂY-â en-ge-lee-SEE soh-BAT mee-ko-need?"
   },
   {
    "en": "I don't understand",
    "loc": "متوجه نمی‌شوم",
    "pron": "mo-ta-VAJ-jeh ne-mee-sha-vam"
   },
   {
    "en": "Help!",
    "loc": "کمک!",
    "pron": "ko-MAK!"
   },
   {
    "en": "How much is this?",
    "loc": "این چند است؟",
    "pron": "een CHAND ast?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "دستشویی کجاست؟",
    "pron": "dast-shu-YEE ko-JÂST?"
   },
   {
    "en": "I would like this",
    "loc": "این را می‌خواهم",
    "pron": "EEN râ mee-KHÂH-am"
   },
   {
    "en": "The bill, please",
    "loc": "لطفاً صورتحساب",
    "pron": "lot-FAN su-RAT-he-sâb"
   },
   {
    "en": "Water",
    "loc": "آب",
    "pron": "âb"
   },
   {
    "en": "Good morning",
    "loc": "صبح بخیر",
    "pron": "sobh be-KHEYR"
   },
   {
    "en": "Good evening",
    "loc": "عصر بخیر",
    "pron": "asr be-KHEYR"
   },
   {
    "en": "My name is …",
    "loc": "اسم من … است",
    "pron": "ESM-e man … ast"
   },
   {
    "en": "How are you?",
    "loc": "حال شما چطور است؟",
    "pron": "HÂL-e sho-MÂ che-TOWR ast?"
   },
   {
    "en": "I need a doctor",
    "loc": "من به دکتر نیاز دارم",
    "pron": "man be DOK-tor nee-ÂZ dâ-ram"
   },
   {
    "en": "Call the police",
    "loc": "به پلیس زنگ بزنید",
    "pron": "be po-LEES zang be-za-need"
   },
   {
    "en": "Left",
    "loc": "چپ",
    "pron": "chap"
   },
   {
    "en": "Right",
    "loc": "راست",
    "pron": "râst"
   },
   {
    "en": "Where is the train station?",
    "loc": "ایستگاه قطار کجاست؟",
    "pron": "eest-GÂH-e gha-TÂR ko-JÂST?"
   },
   {
    "en": "How do I get to …?",
    "loc": "چطور به … بروم؟",
    "pron": "che-TOWR be … be-ra-vam?"
   },
   {
    "en": "Delicious!",
    "loc": "خوشمزه است!",
    "pron": "khosh-MA-ze ast!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "یک",
    "pron": "yek"
   },
   {
    "n": 2,
    "loc": "دو",
    "pron": "do"
   },
   {
    "n": 3,
    "loc": "سه",
    "pron": "se"
   },
   {
    "n": 4,
    "loc": "چهار",
    "pron": "cha-HÂR"
   },
   {
    "n": 5,
    "loc": "پنج",
    "pron": "panj"
   },
   {
    "n": 6,
    "loc": "شش",
    "pron": "shesh"
   },
   {
    "n": 7,
    "loc": "هفت",
    "pron": "haft"
   },
   {
    "n": 8,
    "loc": "هشت",
    "pron": "hasht"
   },
   {
    "n": 9,
    "loc": "نه",
    "pron": "noh"
   },
   {
    "n": 10,
    "loc": "ده",
    "pron": "dah"
   }
  ]
 },
 "Hebrew": {
  "native": "עברית",
  "phrases": [
   {
    "en": "Hello",
    "loc": "שלום",
    "pron": "sha-LOM"
   },
   {
    "en": "Goodbye",
    "loc": "להתראות",
    "pron": "le-hit-ra-OT"
   },
   {
    "en": "Please",
    "loc": "בבקשה",
    "pron": "be-va-ka-SHA"
   },
   {
    "en": "Thank you",
    "loc": "תודה",
    "pron": "to-DA"
   },
   {
    "en": "You're welcome",
    "loc": "על לא דבר",
    "pron": "al lo da-VAR"
   },
   {
    "en": "Yes",
    "loc": "כן",
    "pron": "ken"
   },
   {
    "en": "No",
    "loc": "לא",
    "pron": "lo"
   },
   {
    "en": "Excuse me",
    "loc": "סליחה",
    "pron": "sli-KHA"
   },
   {
    "en": "Sorry",
    "loc": "אני מצטער",
    "pron": "a-NEE mitz-ta-ER (m.) / a-NEE mitz-ta-E-ret (f.)"
   },
   {
    "en": "Do you speak English?",
    "loc": "אתה מדבר אנגלית?",
    "pron": "a-TA me-da-BER ang-LEET? (to a man) / at me-da-BE-ret ang-LEET? (to a woman)"
   },
   {
    "en": "I don't understand",
    "loc": "אני לא מבין",
    "pron": "a-NEE lo me-VEEN (m.) / a-NEE lo me-vi-NA (f.)"
   },
   {
    "en": "Help!",
    "loc": "הצילו!",
    "pron": "ha-TSEE-loo!"
   },
   {
    "en": "How much is this?",
    "loc": "כמה זה עולה?",
    "pron": "KA-ma ze o-LE?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "איפה השירותים?",
    "pron": "EY-fo ha-shey-roo-TEEM?"
   },
   {
    "en": "I would like this",
    "loc": "אני רוצה את זה",
    "pron": "a-NEE ro-TSE et ze (m.) / a-NEE ro-TSA et ze (f.)"
   },
   {
    "en": "The bill, please",
    "loc": "החשבון, בבקשה",
    "pron": "ha-khesh-BON, be-va-ka-SHA"
   },
   {
    "en": "Water",
    "loc": "מים",
    "pron": "MA-yim"
   },
   {
    "en": "Good morning",
    "loc": "בוקר טוב",
    "pron": "BO-ker tov"
   },
   {
    "en": "Good evening",
    "loc": "ערב טוב",
    "pron": "E-rev tov"
   },
   {
    "en": "My name is …",
    "loc": "קוראים לי …",
    "pron": "kor-EEM lee …"
   },
   {
    "en": "How are you?",
    "loc": "מה שלומך?",
    "pron": "ma shlom-KHA? (to a man) / ma shlo-MEKH? (to a woman)"
   },
   {
    "en": "I need a doctor",
    "loc": "אני צריך רופא",
    "pron": "a-NEE tsa-REEKH ro-FE (m.) / a-NEE tsri-KHA ro-FE (f.)"
   },
   {
    "en": "Call the police",
    "loc": "תתקשרו למשטרה",
    "pron": "tit-kash-ROO la-mish-ta-RA"
   },
   {
    "en": "Left",
    "loc": "שמאל",
    "pron": "smol"
   },
   {
    "en": "Right",
    "loc": "ימין",
    "pron": "ya-MEEN"
   },
   {
    "en": "Where is the train station?",
    "loc": "איפה תחנת הרכבת?",
    "pron": "EY-fo ta-kha-NAT ha-ra-KE-vet?"
   },
   {
    "en": "How do I get to …?",
    "loc": "איך מגיעים ל…?",
    "pron": "eykh ma-gee-EEM le…?"
   },
   {
    "en": "Delicious!",
    "loc": "טעים!",
    "pron": "ta-EEM!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "אחת",
    "pron": "a-KHAT"
   },
   {
    "n": 2,
    "loc": "שתיים",
    "pron": "SHTA-yim"
   },
   {
    "n": 3,
    "loc": "שלוש",
    "pron": "sha-LOSH"
   },
   {
    "n": 4,
    "loc": "ארבע",
    "pron": "AR-ba"
   },
   {
    "n": 5,
    "loc": "חמש",
    "pron": "kha-MESH"
   },
   {
    "n": 6,
    "loc": "שש",
    "pron": "shesh"
   },
   {
    "n": 7,
    "loc": "שבע",
    "pron": "SHE-va"
   },
   {
    "n": 8,
    "loc": "שמונה",
    "pron": "shmo-NE"
   },
   {
    "n": 9,
    "loc": "תשע",
    "pron": "TE-sha"
   },
   {
    "n": 10,
    "loc": "עשר",
    "pron": "E-ser"
   }
  ]
 },
 "Greek": {
  "native": "Ελληνικά",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Γεια σας",
    "pron": "YAH sas"
   },
   {
    "en": "Goodbye",
    "loc": "Αντίο",
    "pron": "ah-DEE-oh"
   },
   {
    "en": "Please",
    "loc": "Παρακαλώ",
    "pron": "pah-rah-kah-LOH"
   },
   {
    "en": "Thank you",
    "loc": "Ευχαριστώ",
    "pron": "ef-khah-ree-STOH"
   },
   {
    "en": "You're welcome",
    "loc": "Παρακαλώ",
    "pron": "pah-rah-kah-LOH"
   },
   {
    "en": "Yes",
    "loc": "Ναι",
    "pron": "neh"
   },
   {
    "en": "No",
    "loc": "Όχι",
    "pron": "OH-khee"
   },
   {
    "en": "Excuse me",
    "loc": "Με συγχωρείτε",
    "pron": "meh seeng-khoh-REE-teh"
   },
   {
    "en": "Sorry",
    "loc": "Συγγνώμη",
    "pron": "see-GHNOH-mee"
   },
   {
    "en": "Do you speak English?",
    "loc": "Μιλάτε αγγλικά;",
    "pron": "mee-LAH-teh ahng-glee-KAH"
   },
   {
    "en": "I don't understand",
    "loc": "Δεν καταλαβαίνω",
    "pron": "then kah-tah-lah-VEH-noh"
   },
   {
    "en": "Help!",
    "loc": "Βοήθεια!",
    "pron": "vo-EE-thee-ah"
   },
   {
    "en": "How much is this?",
    "loc": "Πόσο κάνει αυτό;",
    "pron": "POH-soh KAH-nee af-TOH"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Πού είναι η τουαλέτα;",
    "pron": "poo EE-neh ee too-ah-LEH-tah"
   },
   {
    "en": "I would like this",
    "loc": "Θα ήθελα αυτό",
    "pron": "thah EE-theh-lah af-TOH"
   },
   {
    "en": "The bill, please",
    "loc": "Τον λογαριασμό, παρακαλώ",
    "pron": "ton lo-gha-ryah-SMOH, pah-rah-kah-LOH"
   },
   {
    "en": "Water",
    "loc": "Νερό",
    "pron": "neh-ROH"
   },
   {
    "en": "Good morning",
    "loc": "Καλημέρα",
    "pron": "kah-lee-MEH-rah"
   },
   {
    "en": "Good evening",
    "loc": "Καλησπέρα",
    "pron": "kah-lee-SPEH-rah"
   },
   {
    "en": "My name is …",
    "loc": "Με λένε …",
    "pron": "meh LEH-neh …"
   },
   {
    "en": "How are you?",
    "loc": "Τι κάνετε;",
    "pron": "tee KAH-neh-teh"
   },
   {
    "en": "I need a doctor",
    "loc": "Χρειάζομαι γιατρό",
    "pron": "khree-AH-zoh-meh yah-TROH"
   },
   {
    "en": "Call the police",
    "loc": "Καλέστε την αστυνομία",
    "pron": "kah-LEH-steh teen ah-stee-noh-MEE-ah"
   },
   {
    "en": "Left",
    "loc": "Αριστερά",
    "pron": "ah-ree-steh-RAH"
   },
   {
    "en": "Right",
    "loc": "Δεξιά",
    "pron": "thek-see-AH"
   },
   {
    "en": "Where is the train station?",
    "loc": "Πού είναι ο σιδηροδρομικός σταθμός;",
    "pron": "poo EE-neh oh see-thee-roh-throh-mee-KOS stath-MOS"
   },
   {
    "en": "How do I get to …?",
    "loc": "Πώς πάω στο …;",
    "pron": "pos PAH-oh stoh …"
   },
   {
    "en": "Delicious!",
    "loc": "Νόστιμο!",
    "pron": "NOH-stee-moh"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "ένα",
    "pron": "EH-nah"
   },
   {
    "n": 2,
    "loc": "δύο",
    "pron": "THEE-oh"
   },
   {
    "n": 3,
    "loc": "τρία",
    "pron": "TREE-ah"
   },
   {
    "n": 4,
    "loc": "τέσσερα",
    "pron": "TEH-seh-rah"
   },
   {
    "n": 5,
    "loc": "πέντε",
    "pron": "PEN-deh"
   },
   {
    "n": 6,
    "loc": "έξι",
    "pron": "EK-see"
   },
   {
    "n": 7,
    "loc": "επτά",
    "pron": "ep-TAH"
   },
   {
    "n": 8,
    "loc": "οκτώ",
    "pron": "ok-TOH"
   },
   {
    "n": 9,
    "loc": "εννέα",
    "pron": "eh-NEH-ah"
   },
   {
    "n": 10,
    "loc": "δέκα",
    "pron": "THEH-kah"
   }
  ]
 },
 "Dutch": {
  "native": "Nederlands",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Hallo",
    "pron": "HAH-loh"
   },
   {
    "en": "Goodbye",
    "loc": "Tot ziens",
    "pron": "tot zeens"
   },
   {
    "en": "Please",
    "loc": "Alstublieft",
    "pron": "AHL-stew-bleeft"
   },
   {
    "en": "Thank you",
    "loc": "Dank u wel",
    "pron": "dahnk ew vel"
   },
   {
    "en": "You're welcome",
    "loc": "Graag gedaan",
    "pron": "khraakh khuh-DAAN"
   },
   {
    "en": "Yes",
    "loc": "Ja",
    "pron": "yah"
   },
   {
    "en": "No",
    "loc": "Nee",
    "pron": "nay"
   },
   {
    "en": "Excuse me",
    "loc": "Pardon",
    "pron": "par-DON"
   },
   {
    "en": "Sorry",
    "loc": "Sorry",
    "pron": "SOR-ree"
   },
   {
    "en": "Do you speak English?",
    "loc": "Spreekt u Engels?",
    "pron": "spraykt ew ENG-uls"
   },
   {
    "en": "I don't understand",
    "loc": "Ik begrijp het niet",
    "pron": "ik buh-KHRAYP ut neet"
   },
   {
    "en": "Help!",
    "loc": "Help!",
    "pron": "help"
   },
   {
    "en": "How much is this?",
    "loc": "Hoeveel kost dit?",
    "pron": "HOO-vayl kost dit"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Waar is het toilet?",
    "pron": "vaar is ut twah-LET"
   },
   {
    "en": "I would like this",
    "loc": "Ik wil dit graag",
    "pron": "ik vil dit khraakh"
   },
   {
    "en": "The bill, please",
    "loc": "De rekening, alstublieft",
    "pron": "duh RAY-kuh-ning, AHL-stew-bleeft"
   },
   {
    "en": "Water",
    "loc": "Water",
    "pron": "VAH-ter"
   },
   {
    "en": "Good morning",
    "loc": "Goedemorgen",
    "pron": "khoo-duh-MOR-khun"
   },
   {
    "en": "Good evening",
    "loc": "Goedenavond",
    "pron": "khoo-duh-NAH-vont"
   },
   {
    "en": "My name is …",
    "loc": "Mijn naam is …",
    "pron": "mayn naam is …"
   },
   {
    "en": "How are you?",
    "loc": "Hoe gaat het met u?",
    "pron": "hoo khaat ut met ew"
   },
   {
    "en": "I need a doctor",
    "loc": "Ik heb een dokter nodig",
    "pron": "ik hep un DOK-ter NOH-dukh"
   },
   {
    "en": "Call the police",
    "loc": "Bel de politie",
    "pron": "bel duh poh-LEET-see"
   },
   {
    "en": "Left",
    "loc": "Links",
    "pron": "links"
   },
   {
    "en": "Right",
    "loc": "Rechts",
    "pron": "rekhts"
   },
   {
    "en": "Where is the train station?",
    "loc": "Waar is het treinstation?",
    "pron": "vaar is ut TRAYN-stah-shon"
   },
   {
    "en": "How do I get to …?",
    "loc": "Hoe kom ik bij …?",
    "pron": "hoo kom ik bay …"
   },
   {
    "en": "Delicious!",
    "loc": "Heerlijk!",
    "pron": "HAYR-luk"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "één",
    "pron": "ayn"
   },
   {
    "n": 2,
    "loc": "twee",
    "pron": "tvay"
   },
   {
    "n": 3,
    "loc": "drie",
    "pron": "dree"
   },
   {
    "n": 4,
    "loc": "vier",
    "pron": "veer"
   },
   {
    "n": 5,
    "loc": "vijf",
    "pron": "vayf"
   },
   {
    "n": 6,
    "loc": "zes",
    "pron": "zes"
   },
   {
    "n": 7,
    "loc": "zeven",
    "pron": "ZAY-vun"
   },
   {
    "n": 8,
    "loc": "acht",
    "pron": "akht"
   },
   {
    "n": 9,
    "loc": "negen",
    "pron": "NAY-khun"
   },
   {
    "n": 10,
    "loc": "tien",
    "pron": "teen"
   }
  ]
 },
 "Swedish": {
  "native": "Svenska",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Hej",
    "pron": "hey"
   },
   {
    "en": "Goodbye",
    "loc": "Hej då",
    "pron": "hey daw"
   },
   {
    "en": "Please",
    "loc": "Snälla",
    "pron": "SNEL-lah"
   },
   {
    "en": "Thank you",
    "loc": "Tack",
    "pron": "tahk"
   },
   {
    "en": "You're welcome",
    "loc": "Varsågod",
    "pron": "VAR-shaw-good"
   },
   {
    "en": "Yes",
    "loc": "Ja",
    "pron": "yah"
   },
   {
    "en": "No",
    "loc": "Nej",
    "pron": "ney"
   },
   {
    "en": "Excuse me",
    "loc": "Ursäkta",
    "pron": "OOR-shek-tah"
   },
   {
    "en": "Sorry",
    "loc": "Förlåt",
    "pron": "fur-LAWT"
   },
   {
    "en": "Do you speak English?",
    "loc": "Talar du engelska?",
    "pron": "TAH-lar doo ENG-el-skah"
   },
   {
    "en": "I don't understand",
    "loc": "Jag förstår inte",
    "pron": "yah fur-STAWR IN-teh"
   },
   {
    "en": "Help!",
    "loc": "Hjälp!",
    "pron": "yelp"
   },
   {
    "en": "How much is this?",
    "loc": "Hur mycket kostar det här?",
    "pron": "hoor MEW-keh KOSS-tar deh hair"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Var är toaletten?",
    "pron": "var air too-ah-LEH-ten"
   },
   {
    "en": "I would like this",
    "loc": "Jag skulle vilja ha det här",
    "pron": "yah SKOO-leh VIL-yah hah deh hair"
   },
   {
    "en": "The bill, please",
    "loc": "Notan, tack",
    "pron": "NOO-tan, tahk"
   },
   {
    "en": "Water",
    "loc": "Vatten",
    "pron": "VAH-ten"
   },
   {
    "en": "Good morning",
    "loc": "God morgon",
    "pron": "goo MOR-ron"
   },
   {
    "en": "Good evening",
    "loc": "God kväll",
    "pron": "goo KVELL"
   },
   {
    "en": "My name is …",
    "loc": "Jag heter …",
    "pron": "yah HEH-ter …"
   },
   {
    "en": "How are you?",
    "loc": "Hur mår du?",
    "pron": "hoor mawr doo"
   },
   {
    "en": "I need a doctor",
    "loc": "Jag behöver en läkare",
    "pron": "yah beh-HUR-ver en LAY-kah-reh"
   },
   {
    "en": "Call the police",
    "loc": "Ring polisen",
    "pron": "ring poo-LEE-sen"
   },
   {
    "en": "Left",
    "loc": "Vänster",
    "pron": "VEN-ster"
   },
   {
    "en": "Right",
    "loc": "Höger",
    "pron": "HUR-ger"
   },
   {
    "en": "Where is the train station?",
    "loc": "Var ligger tågstationen?",
    "pron": "var LIG-er TAWG-stah-shoo-nen"
   },
   {
    "en": "How do I get to …?",
    "loc": "Hur kommer jag till …?",
    "pron": "hoor KOM-er yah till …"
   },
   {
    "en": "Delicious!",
    "loc": "Utsökt!",
    "pron": "OOT-surkt"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "ett",
    "pron": "ett"
   },
   {
    "n": 2,
    "loc": "två",
    "pron": "tvaw"
   },
   {
    "n": 3,
    "loc": "tre",
    "pron": "treh"
   },
   {
    "n": 4,
    "loc": "fyra",
    "pron": "FEW-rah"
   },
   {
    "n": 5,
    "loc": "fem",
    "pron": "fem"
   },
   {
    "n": 6,
    "loc": "sex",
    "pron": "seks"
   },
   {
    "n": 7,
    "loc": "sju",
    "pron": "hwoo"
   },
   {
    "n": 8,
    "loc": "åtta",
    "pron": "OT-tah"
   },
   {
    "n": 9,
    "loc": "nio",
    "pron": "NEE-oo"
   },
   {
    "n": 10,
    "loc": "tio",
    "pron": "TEE-oo"
   }
  ]
 },
 "Norwegian": {
  "native": "Norsk",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Hallo",
    "pron": "HAH-loh"
   },
   {
    "en": "Goodbye",
    "loc": "Ha det",
    "pron": "HAH deh"
   },
   {
    "en": "Please",
    "loc": "Vær så snill",
    "pron": "vair soh SNILL"
   },
   {
    "en": "Thank you",
    "loc": "Takk",
    "pron": "tahk"
   },
   {
    "en": "You're welcome",
    "loc": "Vær så god",
    "pron": "vair soh GOO"
   },
   {
    "en": "Yes",
    "loc": "Ja",
    "pron": "yah"
   },
   {
    "en": "No",
    "loc": "Nei",
    "pron": "nay"
   },
   {
    "en": "Excuse me",
    "loc": "Unnskyld meg",
    "pron": "OON-shewl migh"
   },
   {
    "en": "Sorry",
    "loc": "Beklager",
    "pron": "beh-KLAH-gehr"
   },
   {
    "en": "Do you speak English?",
    "loc": "Snakker du engelsk?",
    "pron": "SNAH-kehr dew EHNG-elsk"
   },
   {
    "en": "I don't understand",
    "loc": "Jeg forstår ikke",
    "pron": "yigh fawr-STAWR IH-keh"
   },
   {
    "en": "Help!",
    "loc": "Hjelp!",
    "pron": "yelp"
   },
   {
    "en": "How much is this?",
    "loc": "Hvor mye koster dette?",
    "pron": "voor MEW-eh KOSS-tehr DEH-teh"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Hvor er toalettet?",
    "pron": "voor air too-ah-LEH-teh"
   },
   {
    "en": "I would like this",
    "loc": "Jeg vil gjerne ha denne",
    "pron": "yigh vil YAIR-neh hah DEH-neh"
   },
   {
    "en": "The bill, please",
    "loc": "Regningen, takk",
    "pron": "RYE-ning-en tahk"
   },
   {
    "en": "Water",
    "loc": "Vann",
    "pron": "vahn"
   },
   {
    "en": "Good morning",
    "loc": "God morgen",
    "pron": "goo MOR-ern"
   },
   {
    "en": "Good evening",
    "loc": "God kveld",
    "pron": "goo kvel"
   },
   {
    "en": "My name is …",
    "loc": "Jeg heter …",
    "pron": "yigh HEH-tehr …"
   },
   {
    "en": "How are you?",
    "loc": "Hvordan har du det?",
    "pron": "VOOR-dahn hahr dew deh"
   },
   {
    "en": "I need a doctor",
    "loc": "Jeg trenger en lege",
    "pron": "yigh TREHNG-ehr ehn LEH-geh"
   },
   {
    "en": "Call the police",
    "loc": "Ring politiet",
    "pron": "ring poo-lee-TEE-eh"
   },
   {
    "en": "Left",
    "loc": "Venstre",
    "pron": "VEHN-streh"
   },
   {
    "en": "Right",
    "loc": "Høyre",
    "pron": "HOY-reh"
   },
   {
    "en": "Where is the train station?",
    "loc": "Hvor er togstasjonen?",
    "pron": "voor air TOHG-stah-shoo-nen"
   },
   {
    "en": "How do I get to …?",
    "loc": "Hvordan kommer jeg til …?",
    "pron": "VOOR-dahn KAW-mehr yigh til …"
   },
   {
    "en": "Delicious!",
    "loc": "Nydelig!",
    "pron": "NEW-deh-lee"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "en",
    "pron": "ehn"
   },
   {
    "n": 2,
    "loc": "to",
    "pron": "too"
   },
   {
    "n": 3,
    "loc": "tre",
    "pron": "treh"
   },
   {
    "n": 4,
    "loc": "fire",
    "pron": "FEE-reh"
   },
   {
    "n": 5,
    "loc": "fem",
    "pron": "fehm"
   },
   {
    "n": 6,
    "loc": "seks",
    "pron": "sehks"
   },
   {
    "n": 7,
    "loc": "sju",
    "pron": "shew"
   },
   {
    "n": 8,
    "loc": "åtte",
    "pron": "AW-teh"
   },
   {
    "n": 9,
    "loc": "ni",
    "pron": "nee"
   },
   {
    "n": 10,
    "loc": "ti",
    "pron": "tee"
   }
  ]
 },
 "Danish": {
  "native": "dansk",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Hej",
    "pron": "hye"
   },
   {
    "en": "Goodbye",
    "loc": "Farvel",
    "pron": "fah-VEL"
   },
   {
    "en": "Please",
    "loc": "Vær så venlig",
    "pron": "vehr saw VEN-lee"
   },
   {
    "en": "Thank you",
    "loc": "Tak",
    "pron": "tahk"
   },
   {
    "en": "You're welcome",
    "loc": "Selv tak",
    "pron": "sel tahk"
   },
   {
    "en": "Yes",
    "loc": "Ja",
    "pron": "ya"
   },
   {
    "en": "No",
    "loc": "Nej",
    "pron": "nye"
   },
   {
    "en": "Excuse me",
    "loc": "Undskyld",
    "pron": "OON-skewl"
   },
   {
    "en": "Sorry",
    "loc": "Undskyld",
    "pron": "OON-skewl"
   },
   {
    "en": "Do you speak English?",
    "loc": "Taler du engelsk?",
    "pron": "TAH-lah doo ENG-elsk"
   },
   {
    "en": "I don't understand",
    "loc": "Jeg forstår ikke",
    "pron": "yai for-STOR IK-keh"
   },
   {
    "en": "Help!",
    "loc": "Hjælp!",
    "pron": "yelp"
   },
   {
    "en": "How much is this?",
    "loc": "Hvor meget koster det?",
    "pron": "vor MY-eth KOS-tah deh"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Hvor er toilettet?",
    "pron": "vor air toy-LET-eth"
   },
   {
    "en": "I would like this",
    "loc": "Jeg vil gerne have det her",
    "pron": "yai vil GEHR-neh ha deh hair"
   },
   {
    "en": "The bill, please",
    "loc": "Regningen, tak",
    "pron": "RYE-ning-en tahk"
   },
   {
    "en": "Water",
    "loc": "Vand",
    "pron": "van"
   },
   {
    "en": "Good morning",
    "loc": "Godmorgen",
    "pron": "goh-MORN"
   },
   {
    "en": "Good evening",
    "loc": "Godaften",
    "pron": "goh-AF-ten"
   },
   {
    "en": "My name is …",
    "loc": "Jeg hedder …",
    "pron": "yai HEH-thah …"
   },
   {
    "en": "How are you?",
    "loc": "Hvordan har du det?",
    "pron": "vor-DAN hah doo deh"
   },
   {
    "en": "I need a doctor",
    "loc": "Jeg har brug for en læge",
    "pron": "yai hah broo for en LAI-eh"
   },
   {
    "en": "Call the police",
    "loc": "Ring til politiet",
    "pron": "ring til poh-lee-TEE-eth"
   },
   {
    "en": "Left",
    "loc": "Venstre",
    "pron": "VEN-stra"
   },
   {
    "en": "Right",
    "loc": "Højre",
    "pron": "HOY-ra"
   },
   {
    "en": "Where is the train station?",
    "loc": "Hvor er togstationen?",
    "pron": "vor air TOH-stah-shoh-nen"
   },
   {
    "en": "How do I get to …?",
    "loc": "Hvordan kommer jeg til …?",
    "pron": "vor-DAN KOM-ah yai til …"
   },
   {
    "en": "Delicious!",
    "loc": "Lækkert!",
    "pron": "LEK-ket"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "en",
    "pron": "ehn"
   },
   {
    "n": 2,
    "loc": "to",
    "pron": "toh"
   },
   {
    "n": 3,
    "loc": "tre",
    "pron": "treh"
   },
   {
    "n": 4,
    "loc": "fire",
    "pron": "FEE-ah"
   },
   {
    "n": 5,
    "loc": "fem",
    "pron": "fem"
   },
   {
    "n": 6,
    "loc": "seks",
    "pron": "seks"
   },
   {
    "n": 7,
    "loc": "syv",
    "pron": "syoo"
   },
   {
    "n": 8,
    "loc": "otte",
    "pron": "OH-deh"
   },
   {
    "n": 9,
    "loc": "ni",
    "pron": "nee"
   },
   {
    "n": 10,
    "loc": "ti",
    "pron": "tee"
   }
  ]
 },
 "Finnish": {
  "native": "suomi",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Hei",
    "pron": "hay"
   },
   {
    "en": "Goodbye",
    "loc": "Näkemiin",
    "pron": "NAK-eh-meen"
   },
   {
    "en": "Please",
    "loc": "Ole hyvä",
    "pron": "OH-leh HUU-va"
   },
   {
    "en": "Thank you",
    "loc": "Kiitos",
    "pron": "KEE-toss"
   },
   {
    "en": "You're welcome",
    "loc": "Ole hyvä",
    "pron": "OH-leh HUU-va"
   },
   {
    "en": "Yes",
    "loc": "Kyllä",
    "pron": "KUUL-la"
   },
   {
    "en": "No",
    "loc": "Ei",
    "pron": "ay"
   },
   {
    "en": "Excuse me",
    "loc": "Anteeksi",
    "pron": "AHN-tayk-see"
   },
   {
    "en": "Sorry",
    "loc": "Anteeksi",
    "pron": "AHN-tayk-see"
   },
   {
    "en": "Do you speak English?",
    "loc": "Puhutteko englantia?",
    "pron": "POO-hoot-teh-koh ENG-lahn-tee-ah"
   },
   {
    "en": "I don't understand",
    "loc": "En ymmärrä",
    "pron": "en UUM-mar-ra"
   },
   {
    "en": "Help!",
    "loc": "Apua!",
    "pron": "AH-poo-ah"
   },
   {
    "en": "How much is this?",
    "loc": "Paljonko tämä maksaa?",
    "pron": "PAHL-yon-koh TA-ma MAHK-saa"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Missä on vessa?",
    "pron": "MIS-sa on VES-sah"
   },
   {
    "en": "I would like this",
    "loc": "Haluaisin tämän",
    "pron": "HAH-loo-eye-sin TA-man"
   },
   {
    "en": "The bill, please",
    "loc": "Lasku, kiitos",
    "pron": "LAHS-koo, KEE-toss"
   },
   {
    "en": "Water",
    "loc": "Vesi",
    "pron": "VEH-see"
   },
   {
    "en": "Good morning",
    "loc": "Hyvää huomenta",
    "pron": "HUU-vaa HOO-oh-men-tah"
   },
   {
    "en": "Good evening",
    "loc": "Hyvää iltaa",
    "pron": "HUU-vaa IL-taa"
   },
   {
    "en": "My name is …",
    "loc": "Nimeni on …",
    "pron": "NEE-meh-nee on …"
   },
   {
    "en": "How are you?",
    "loc": "Mitä kuuluu?",
    "pron": "MEE-ta KOO-loo"
   },
   {
    "en": "I need a doctor",
    "loc": "Tarvitsen lääkärin",
    "pron": "TAHR-vit-sen LAA-ka-rin"
   },
   {
    "en": "Call the police",
    "loc": "Soittakaa poliisille",
    "pron": "SOIT-tah-kaa POH-lee-sil-leh"
   },
   {
    "en": "Left",
    "loc": "Vasen",
    "pron": "VAH-sen"
   },
   {
    "en": "Right",
    "loc": "Oikea",
    "pron": "OY-keh-ah"
   },
   {
    "en": "Where is the train station?",
    "loc": "Missä on rautatieasema?",
    "pron": "MIS-sa on ROW-tah-tee-eh-ah-seh-mah"
   },
   {
    "en": "How do I get to …?",
    "loc": "Miten pääsen …?",
    "pron": "MEE-ten PAA-sen …"
   },
   {
    "en": "Delicious!",
    "loc": "Herkullista!",
    "pron": "HER-kool-lis-tah"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "yksi",
    "pron": "UUK-see"
   },
   {
    "n": 2,
    "loc": "kaksi",
    "pron": "KAHK-see"
   },
   {
    "n": 3,
    "loc": "kolme",
    "pron": "KOL-meh"
   },
   {
    "n": 4,
    "loc": "neljä",
    "pron": "NEL-ya"
   },
   {
    "n": 5,
    "loc": "viisi",
    "pron": "VEE-see"
   },
   {
    "n": 6,
    "loc": "kuusi",
    "pron": "KOO-see"
   },
   {
    "n": 7,
    "loc": "seitsemän",
    "pron": "SAYT-seh-man"
   },
   {
    "n": 8,
    "loc": "kahdeksan",
    "pron": "KAH-dek-sahn"
   },
   {
    "n": 9,
    "loc": "yhdeksän",
    "pron": "UUH-dek-san"
   },
   {
    "n": 10,
    "loc": "kymmenen",
    "pron": "KUUM-meh-nen"
   }
  ]
 },
 "Polish": {
  "native": "polski",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Dzień dobry",
    "pron": "jen DOH-bri"
   },
   {
    "en": "Goodbye",
    "loc": "Do widzenia",
    "pron": "doh vee-DZEN-yah"
   },
   {
    "en": "Please",
    "loc": "Proszę",
    "pron": "PROH-sheh"
   },
   {
    "en": "Thank you",
    "loc": "Dziękuję",
    "pron": "jen-KOO-yeh"
   },
   {
    "en": "You're welcome",
    "loc": "Proszę bardzo",
    "pron": "PROH-sheh BAR-dzo"
   },
   {
    "en": "Yes",
    "loc": "Tak",
    "pron": "tahk"
   },
   {
    "en": "No",
    "loc": "Nie",
    "pron": "nyeh"
   },
   {
    "en": "Excuse me",
    "loc": "Przepraszam",
    "pron": "psheh-PRAH-shahm"
   },
   {
    "en": "Sorry",
    "loc": "Przepraszam",
    "pron": "psheh-PRAH-shahm"
   },
   {
    "en": "Do you speak English?",
    "loc": "Czy mówi pan/pani po angielsku?",
    "pron": "chih MOO-vee pahn/PAH-nee poh ahn-GYEL-skoo"
   },
   {
    "en": "I don't understand",
    "loc": "Nie rozumiem",
    "pron": "nyeh roh-ZOO-myem"
   },
   {
    "en": "Help!",
    "loc": "Pomocy!",
    "pron": "poh-MOH-tsih"
   },
   {
    "en": "How much is this?",
    "loc": "Ile to kosztuje?",
    "pron": "EE-leh toh kosh-TOO-yeh"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Gdzie jest toaleta?",
    "pron": "g-jeh yest toh-ah-LEH-tah"
   },
   {
    "en": "I would like this",
    "loc": "Poproszę to",
    "pron": "poh-PROH-sheh toh"
   },
   {
    "en": "The bill, please",
    "loc": "Poproszę rachunek",
    "pron": "poh-PROH-sheh rah-HOO-nek"
   },
   {
    "en": "Water",
    "loc": "Woda",
    "pron": "VOH-dah"
   },
   {
    "en": "Good morning",
    "loc": "Dzień dobry",
    "pron": "jen DOH-bri"
   },
   {
    "en": "Good evening",
    "loc": "Dobry wieczór",
    "pron": "DOH-bri VYEH-choor"
   },
   {
    "en": "My name is …",
    "loc": "Nazywam się …",
    "pron": "nah-ZIH-vahm sheh …"
   },
   {
    "en": "How are you?",
    "loc": "Jak się pan/pani ma?",
    "pron": "yahk sheh pahn/PAH-nee mah"
   },
   {
    "en": "I need a doctor",
    "loc": "Potrzebuję lekarza",
    "pron": "poh-tsheh-BOO-yeh leh-KAH-zhah"
   },
   {
    "en": "Call the police",
    "loc": "Proszę zadzwonić na policję",
    "pron": "PROH-sheh zah-DZVOH-neech nah poh-LEE-tsyeh"
   },
   {
    "en": "Left",
    "loc": "Lewo",
    "pron": "LEH-voh"
   },
   {
    "en": "Right",
    "loc": "Prawo",
    "pron": "PRAH-voh"
   },
   {
    "en": "Where is the train station?",
    "loc": "Gdzie jest dworzec kolejowy?",
    "pron": "g-jeh yest DVOH-zhets koh-leh-YOH-vih"
   },
   {
    "en": "How do I get to …?",
    "loc": "Jak dojść do …?",
    "pron": "yahk doysh doh …"
   },
   {
    "en": "Delicious!",
    "loc": "Pyszne!",
    "pron": "PISH-neh"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "jeden",
    "pron": "YEH-den"
   },
   {
    "n": 2,
    "loc": "dwa",
    "pron": "dvah"
   },
   {
    "n": 3,
    "loc": "trzy",
    "pron": "tshih"
   },
   {
    "n": 4,
    "loc": "cztery",
    "pron": "CHTEH-rih"
   },
   {
    "n": 5,
    "loc": "pięć",
    "pron": "pyench"
   },
   {
    "n": 6,
    "loc": "sześć",
    "pron": "sheshch"
   },
   {
    "n": 7,
    "loc": "siedem",
    "pron": "SHYEH-dem"
   },
   {
    "n": 8,
    "loc": "osiem",
    "pron": "OH-shem"
   },
   {
    "n": 9,
    "loc": "dziewięć",
    "pron": "JEH-vyench"
   },
   {
    "n": 10,
    "loc": "dziesięć",
    "pron": "JEH-shench"
   }
  ]
 },
 "Czech": {
  "native": "čeština",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Dobrý den",
    "pron": "DOH-bree den"
   },
   {
    "en": "Goodbye",
    "loc": "Na shledanou",
    "pron": "NA-skhle-da-noh"
   },
   {
    "en": "Please",
    "loc": "Prosím",
    "pron": "PRO-seem"
   },
   {
    "en": "Thank you",
    "loc": "Děkuji",
    "pron": "DYE-koo-yih"
   },
   {
    "en": "You're welcome",
    "loc": "Není zač",
    "pron": "NEH-nyee zahch"
   },
   {
    "en": "Yes",
    "loc": "Ano",
    "pron": "AH-no"
   },
   {
    "en": "No",
    "loc": "Ne",
    "pron": "neh"
   },
   {
    "en": "Excuse me",
    "loc": "Promiňte",
    "pron": "PRO-min-yteh"
   },
   {
    "en": "Sorry",
    "loc": "Promiňte",
    "pron": "PRO-min-yteh"
   },
   {
    "en": "Do you speak English?",
    "loc": "Mluvíte anglicky?",
    "pron": "MLOO-vee-teh AHN-glits-kih"
   },
   {
    "en": "I don't understand",
    "loc": "Nerozumím",
    "pron": "NEH-ro-zoo-meem"
   },
   {
    "en": "Help!",
    "loc": "Pomoc!",
    "pron": "PO-mots"
   },
   {
    "en": "How much is this?",
    "loc": "Kolik to stojí?",
    "pron": "KO-lik to STO-yee"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Kde je záchod?",
    "pron": "k-deh yeh ZAA-khot"
   },
   {
    "en": "I would like this",
    "loc": "Chtěl bych tohle",
    "pron": "KHtyel bikh TO-hleh"
   },
   {
    "en": "The bill, please",
    "loc": "Účet, prosím",
    "pron": "OO-chet PRO-seem"
   },
   {
    "en": "Water",
    "loc": "Voda",
    "pron": "VO-da"
   },
   {
    "en": "Good morning",
    "loc": "Dobré ráno",
    "pron": "DOH-breh RAA-no"
   },
   {
    "en": "Good evening",
    "loc": "Dobrý večer",
    "pron": "DOH-bree VEH-cher"
   },
   {
    "en": "My name is …",
    "loc": "Jmenuji se …",
    "pron": "YMEH-noo-yih seh …"
   },
   {
    "en": "How are you?",
    "loc": "Jak se máte?",
    "pron": "yak seh MAA-teh"
   },
   {
    "en": "I need a doctor",
    "loc": "Potřebuji lékaře",
    "pron": "PO-trzhe-boo-yih LEH-ka-rzheh"
   },
   {
    "en": "Call the police",
    "loc": "Zavolejte policii",
    "pron": "ZA-vo-ley-teh PO-li-tsee-ih"
   },
   {
    "en": "Left",
    "loc": "Vlevo",
    "pron": "VLEH-vo"
   },
   {
    "en": "Right",
    "loc": "Vpravo",
    "pron": "VPRA-vo"
   },
   {
    "en": "Where is the train station?",
    "loc": "Kde je nádraží?",
    "pron": "k-deh yeh NAA-dra-zhee"
   },
   {
    "en": "How do I get to …?",
    "loc": "Jak se dostanu do …?",
    "pron": "yak seh DOS-ta-noo do …"
   },
   {
    "en": "Delicious!",
    "loc": "Výborné!",
    "pron": "VEE-bor-neh"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "jedna",
    "pron": "YED-na"
   },
   {
    "n": 2,
    "loc": "dva",
    "pron": "dva"
   },
   {
    "n": 3,
    "loc": "tři",
    "pron": "trzhee"
   },
   {
    "n": 4,
    "loc": "čtyři",
    "pron": "CHTI-rzhih"
   },
   {
    "n": 5,
    "loc": "pět",
    "pron": "pyet"
   },
   {
    "n": 6,
    "loc": "šest",
    "pron": "shest"
   },
   {
    "n": 7,
    "loc": "sedm",
    "pron": "SE-doom"
   },
   {
    "n": 8,
    "loc": "osm",
    "pron": "O-soom"
   },
   {
    "n": 9,
    "loc": "devět",
    "pron": "DEH-vyet"
   },
   {
    "n": 10,
    "loc": "deset",
    "pron": "DEH-set"
   }
  ]
 },
 "Hungarian": {
  "native": "magyar",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Jó napot kívánok",
    "pron": "YOH naa-pot KEE-vaa-nok"
   },
   {
    "en": "Goodbye",
    "loc": "Viszontlátásra",
    "pron": "VEE-sont-laa-taash-ro"
   },
   {
    "en": "Please",
    "loc": "Kérem",
    "pron": "KAY-rem"
   },
   {
    "en": "Thank you",
    "loc": "Köszönöm",
    "pron": "KUH-suh-nuhm"
   },
   {
    "en": "You're welcome",
    "loc": "Szívesen",
    "pron": "SEE-veh-shen"
   },
   {
    "en": "Yes",
    "loc": "Igen",
    "pron": "EE-gen"
   },
   {
    "en": "No",
    "loc": "Nem",
    "pron": "nem"
   },
   {
    "en": "Excuse me",
    "loc": "Elnézést",
    "pron": "EL-nay-zaysht"
   },
   {
    "en": "Sorry",
    "loc": "Bocsánat",
    "pron": "BO-chaa-not"
   },
   {
    "en": "Do you speak English?",
    "loc": "Beszél angolul?",
    "pron": "BES-sayl ON-go-lool"
   },
   {
    "en": "I don't understand",
    "loc": "Nem értem",
    "pron": "nem AYR-tem"
   },
   {
    "en": "Help!",
    "loc": "Segítség!",
    "pron": "SHEH-geet-shayg"
   },
   {
    "en": "How much is this?",
    "loc": "Mennyibe kerül ez?",
    "pron": "MEN-nyee-beh KEH-rewl ez"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Hol van a mosdó?",
    "pron": "hol von o MOSH-doh"
   },
   {
    "en": "I would like this",
    "loc": "Ezt szeretném",
    "pron": "ezt SEH-ret-naym"
   },
   {
    "en": "The bill, please",
    "loc": "A számlát, kérem",
    "pron": "o SAAM-laat, KAY-rem"
   },
   {
    "en": "Water",
    "loc": "Víz",
    "pron": "veez"
   },
   {
    "en": "Good morning",
    "loc": "Jó reggelt kívánok",
    "pron": "YOH REG-gelt KEE-vaa-nok"
   },
   {
    "en": "Good evening",
    "loc": "Jó estét kívánok",
    "pron": "YOH ESH-tayt KEE-vaa-nok"
   },
   {
    "en": "My name is …",
    "loc": "A nevem …",
    "pron": "o NEH-vem …"
   },
   {
    "en": "How are you?",
    "loc": "Hogy van?",
    "pron": "hodj von"
   },
   {
    "en": "I need a doctor",
    "loc": "Orvosra van szükségem",
    "pron": "OR-vosh-ro von SEWK-shay-gem"
   },
   {
    "en": "Call the police",
    "loc": "Hívja a rendőrséget",
    "pron": "HEEV-yo o REN-dur-shay-get"
   },
   {
    "en": "Left",
    "loc": "Bal",
    "pron": "bol"
   },
   {
    "en": "Right",
    "loc": "Jobb",
    "pron": "yob"
   },
   {
    "en": "Where is the train station?",
    "loc": "Hol van a vasútállomás?",
    "pron": "hol von o VOSH-oot-aal-lo-maash"
   },
   {
    "en": "How do I get to …?",
    "loc": "Hogyan jutok el …?",
    "pron": "HO-dyon YOO-tok el …"
   },
   {
    "en": "Delicious!",
    "loc": "Finom!",
    "pron": "FEE-nom"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "egy",
    "pron": "edj"
   },
   {
    "n": 2,
    "loc": "kettő",
    "pron": "KET-tur"
   },
   {
    "n": 3,
    "loc": "három",
    "pron": "HAA-rom"
   },
   {
    "n": 4,
    "loc": "négy",
    "pron": "naydj"
   },
   {
    "n": 5,
    "loc": "öt",
    "pron": "uht"
   },
   {
    "n": 6,
    "loc": "hat",
    "pron": "hot"
   },
   {
    "n": 7,
    "loc": "hét",
    "pron": "hayt"
   },
   {
    "n": 8,
    "loc": "nyolc",
    "pron": "nyolts"
   },
   {
    "n": 9,
    "loc": "kilenc",
    "pron": "KEE-lents"
   },
   {
    "n": 10,
    "loc": "tíz",
    "pron": "teez"
   }
  ]
 },
 "Romanian": {
  "native": "română",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Bună ziua",
    "pron": "BOO-nuh ZEE-wah"
   },
   {
    "en": "Goodbye",
    "loc": "La revedere",
    "pron": "lah reh-veh-DEH-reh"
   },
   {
    "en": "Please",
    "loc": "Vă rog",
    "pron": "vuh ROHG"
   },
   {
    "en": "Thank you",
    "loc": "Mulțumesc",
    "pron": "mool-tsoo-MESK"
   },
   {
    "en": "You're welcome",
    "loc": "Cu plăcere",
    "pron": "koo pluh-CHEH-reh"
   },
   {
    "en": "Yes",
    "loc": "Da",
    "pron": "dah"
   },
   {
    "en": "No",
    "loc": "Nu",
    "pron": "noo"
   },
   {
    "en": "Excuse me",
    "loc": "Scuzați-mă",
    "pron": "skoo-ZAH-tsee-muh"
   },
   {
    "en": "Sorry",
    "loc": "Îmi pare rău",
    "pron": "uhm PAH-reh RUH-oo"
   },
   {
    "en": "Do you speak English?",
    "loc": "Vorbiți engleză?",
    "pron": "vor-BEE-tsee en-GLEH-zuh"
   },
   {
    "en": "I don't understand",
    "loc": "Nu înțeleg",
    "pron": "noo uhn-tseh-LEG"
   },
   {
    "en": "Help!",
    "loc": "Ajutor!",
    "pron": "ah-zhoo-TOR"
   },
   {
    "en": "How much is this?",
    "loc": "Cât costă?",
    "pron": "kuht KOS-tuh"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Unde este toaleta?",
    "pron": "OON-deh YES-teh twah-LEH-tah"
   },
   {
    "en": "I would like this",
    "loc": "Aș dori asta",
    "pron": "ash do-REE AHS-tah"
   },
   {
    "en": "The bill, please",
    "loc": "Nota, vă rog",
    "pron": "NOH-tah, vuh ROHG"
   },
   {
    "en": "Water",
    "loc": "Apă",
    "pron": "AH-puh"
   },
   {
    "en": "Good morning",
    "loc": "Bună dimineața",
    "pron": "BOO-nuh dee-mee-NYAH-tsah"
   },
   {
    "en": "Good evening",
    "loc": "Bună seara",
    "pron": "BOO-nuh SYAH-rah"
   },
   {
    "en": "My name is …",
    "loc": "Mă numesc …",
    "pron": "muh noo-MESK …"
   },
   {
    "en": "How are you?",
    "loc": "Ce mai faceți?",
    "pron": "cheh my FAH-chets"
   },
   {
    "en": "I need a doctor",
    "loc": "Am nevoie de un medic",
    "pron": "ahm neh-VOH-yeh deh oon MEH-deek"
   },
   {
    "en": "Call the police",
    "loc": "Chemați poliția",
    "pron": "keh-MAHTS po-LEE-tsee-ah"
   },
   {
    "en": "Left",
    "loc": "Stânga",
    "pron": "STUHN-gah"
   },
   {
    "en": "Right",
    "loc": "Dreapta",
    "pron": "DRYAHP-tah"
   },
   {
    "en": "Where is the train station?",
    "loc": "Unde este gara?",
    "pron": "OON-deh YES-teh GAH-rah"
   },
   {
    "en": "How do I get to …?",
    "loc": "Cum ajung la …?",
    "pron": "koom ah-ZHOONG lah …"
   },
   {
    "en": "Delicious!",
    "loc": "Delicios!",
    "pron": "deh-lee-CHOSS"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "unu",
    "pron": "OO-noo"
   },
   {
    "n": 2,
    "loc": "doi",
    "pron": "doy"
   },
   {
    "n": 3,
    "loc": "trei",
    "pron": "tray"
   },
   {
    "n": 4,
    "loc": "patru",
    "pron": "PAH-troo"
   },
   {
    "n": 5,
    "loc": "cinci",
    "pron": "cheench"
   },
   {
    "n": 6,
    "loc": "șase",
    "pron": "SHAH-seh"
   },
   {
    "n": 7,
    "loc": "șapte",
    "pron": "SHAHP-teh"
   },
   {
    "n": 8,
    "loc": "opt",
    "pron": "opt"
   },
   {
    "n": 9,
    "loc": "nouă",
    "pron": "NOH-wuh"
   },
   {
    "n": 10,
    "loc": "zece",
    "pron": "ZEH-cheh"
   }
  ]
 },
 "Bulgarian": {
  "native": "български",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Здравейте",
    "pron": "zdra-VEY-teh"
   },
   {
    "en": "Goodbye",
    "loc": "Довиждане",
    "pron": "do-VEEZH-da-neh"
   },
   {
    "en": "Please",
    "loc": "Моля",
    "pron": "MOH-lya"
   },
   {
    "en": "Thank you",
    "loc": "Благодаря",
    "pron": "bla-go-da-RYA"
   },
   {
    "en": "You're welcome",
    "loc": "Няма защо",
    "pron": "NYA-ma za-SHTO"
   },
   {
    "en": "Yes",
    "loc": "Да",
    "pron": "da"
   },
   {
    "en": "No",
    "loc": "Не",
    "pron": "neh"
   },
   {
    "en": "Excuse me",
    "loc": "Извинете",
    "pron": "iz-vi-NEH-teh"
   },
   {
    "en": "Sorry",
    "loc": "Съжалявам",
    "pron": "suh-zha-LYA-vam"
   },
   {
    "en": "Do you speak English?",
    "loc": "Говорите ли английски?",
    "pron": "go-VO-ri-teh lee an-GLEE-skee"
   },
   {
    "en": "I don't understand",
    "loc": "Не разбирам",
    "pron": "neh raz-BEE-ram"
   },
   {
    "en": "Help!",
    "loc": "Помощ!",
    "pron": "PO-mosht"
   },
   {
    "en": "How much is this?",
    "loc": "Колко струва това?",
    "pron": "KOL-ko STROO-va to-VAH"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Къде е тоалетната?",
    "pron": "kuh-DEH eh to-a-LET-na-ta"
   },
   {
    "en": "I would like this",
    "loc": "Бих искал това",
    "pron": "bih EES-kal to-VAH"
   },
   {
    "en": "The bill, please",
    "loc": "Сметката, моля",
    "pron": "SMET-ka-ta, MOH-lya"
   },
   {
    "en": "Water",
    "loc": "Вода",
    "pron": "vo-DAH"
   },
   {
    "en": "Good morning",
    "loc": "Добро утро",
    "pron": "do-BRO OO-tro"
   },
   {
    "en": "Good evening",
    "loc": "Добър вечер",
    "pron": "do-BUHR VEH-cher"
   },
   {
    "en": "My name is …",
    "loc": "Казвам се …",
    "pron": "KAZ-vam seh …"
   },
   {
    "en": "How are you?",
    "loc": "Как сте?",
    "pron": "kak steh"
   },
   {
    "en": "I need a doctor",
    "loc": "Трябва ми лекар",
    "pron": "TRYAB-va mee LEH-kar"
   },
   {
    "en": "Call the police",
    "loc": "Извикайте полиция",
    "pron": "iz-VEE-kai-teh po-LEE-tsi-ya"
   },
   {
    "en": "Left",
    "loc": "Ляво",
    "pron": "LYA-vo"
   },
   {
    "en": "Right",
    "loc": "Дясно",
    "pron": "DYAS-no"
   },
   {
    "en": "Where is the train station?",
    "loc": "Къде е гарата?",
    "pron": "kuh-DEH eh GA-ra-ta"
   },
   {
    "en": "How do I get to …?",
    "loc": "Как да стигна до …?",
    "pron": "kak da STEEG-na do …"
   },
   {
    "en": "Delicious!",
    "loc": "Вкусно!",
    "pron": "VKOOS-no"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "едно",
    "pron": "ed-NOH"
   },
   {
    "n": 2,
    "loc": "две",
    "pron": "dveh"
   },
   {
    "n": 3,
    "loc": "три",
    "pron": "tree"
   },
   {
    "n": 4,
    "loc": "четири",
    "pron": "CHE-ti-ri"
   },
   {
    "n": 5,
    "loc": "пет",
    "pron": "pet"
   },
   {
    "n": 6,
    "loc": "шест",
    "pron": "shest"
   },
   {
    "n": 7,
    "loc": "седем",
    "pron": "SE-dem"
   },
   {
    "n": 8,
    "loc": "осем",
    "pron": "O-sem"
   },
   {
    "n": 9,
    "loc": "девет",
    "pron": "DE-vet"
   },
   {
    "n": 10,
    "loc": "десет",
    "pron": "DE-set"
   }
  ]
 },
 "Serbian/Croatian": {
  "native": "srpskohrvatski / hrvatskosrpski (српскохрватски)",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Dobar dan",
    "pron": "DOH-bar dahn"
   },
   {
    "en": "Goodbye",
    "loc": "Doviđenja",
    "pron": "doh-vee-JEH-nyah"
   },
   {
    "en": "Please",
    "loc": "Molim",
    "pron": "MOH-leem"
   },
   {
    "en": "Thank you",
    "loc": "Hvala",
    "pron": "HVAH-lah"
   },
   {
    "en": "You're welcome",
    "loc": "Nema na čemu",
    "pron": "NEH-mah nah CHEH-moo"
   },
   {
    "en": "Yes",
    "loc": "Da",
    "pron": "dah"
   },
   {
    "en": "No",
    "loc": "Ne",
    "pron": "neh"
   },
   {
    "en": "Excuse me",
    "loc": "Oprostite",
    "pron": "oh-PROH-stee-teh"
   },
   {
    "en": "Sorry",
    "loc": "Žao mi je",
    "pron": "ZHAH-oh mee yeh"
   },
   {
    "en": "Do you speak English?",
    "loc": "Govorite li engleski?",
    "pron": "goh-VOH-ree-teh lee EN-gleh-skee"
   },
   {
    "en": "I don't understand",
    "loc": "Ne razumem",
    "pron": "neh rah-ZOO-mehm"
   },
   {
    "en": "Help!",
    "loc": "Upomoć!",
    "pron": "OO-poh-moch"
   },
   {
    "en": "How much is this?",
    "loc": "Koliko ovo košta?",
    "pron": "KOH-lee-koh OH-voh KOH-shtah"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Gde je toalet?",
    "pron": "gdeh yeh toh-ah-LEHT"
   },
   {
    "en": "I would like this",
    "loc": "Želeo bih ovo",
    "pron": "ZHEH-leh-oh beeh OH-voh"
   },
   {
    "en": "The bill, please",
    "loc": "Račun, molim",
    "pron": "RAH-choon, MOH-leem"
   },
   {
    "en": "Water",
    "loc": "Voda",
    "pron": "VOH-dah"
   },
   {
    "en": "Good morning",
    "loc": "Dobro jutro",
    "pron": "DOH-broh YOO-troh"
   },
   {
    "en": "Good evening",
    "loc": "Dobro veče",
    "pron": "DOH-broh VEH-cheh"
   },
   {
    "en": "My name is …",
    "loc": "Zovem se …",
    "pron": "ZOH-vehm seh …"
   },
   {
    "en": "How are you?",
    "loc": "Kako ste?",
    "pron": "KAH-koh steh"
   },
   {
    "en": "I need a doctor",
    "loc": "Treba mi lekar",
    "pron": "TREH-bah mee LEH-kar"
   },
   {
    "en": "Call the police",
    "loc": "Pozovite policiju",
    "pron": "poh-ZOH-vee-teh poh-LEE-tsee-yoo"
   },
   {
    "en": "Left",
    "loc": "Levo",
    "pron": "LEH-voh"
   },
   {
    "en": "Right",
    "loc": "Desno",
    "pron": "DEH-snoh"
   },
   {
    "en": "Where is the train station?",
    "loc": "Gde je železnička stanica?",
    "pron": "gdeh yeh zheh-LEHZ-neech-kah STAH-nee-tsah"
   },
   {
    "en": "How do I get to …?",
    "loc": "Kako da dođem do …?",
    "pron": "KAH-koh dah DOH-jehm doh …"
   },
   {
    "en": "Delicious!",
    "loc": "Ukusno!",
    "pron": "OO-koos-noh"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "jedan",
    "pron": "YEH-dahn"
   },
   {
    "n": 2,
    "loc": "dva",
    "pron": "dvah"
   },
   {
    "n": 3,
    "loc": "tri",
    "pron": "tree"
   },
   {
    "n": 4,
    "loc": "četiri",
    "pron": "CHEH-tee-ree"
   },
   {
    "n": 5,
    "loc": "pet",
    "pron": "peht"
   },
   {
    "n": 6,
    "loc": "šest",
    "pron": "shehst"
   },
   {
    "n": 7,
    "loc": "sedam",
    "pron": "SEH-dahm"
   },
   {
    "n": 8,
    "loc": "osam",
    "pron": "OH-sahm"
   },
   {
    "n": 9,
    "loc": "devet",
    "pron": "DEH-veht"
   },
   {
    "n": 10,
    "loc": "deset",
    "pron": "DEH-seht"
   }
  ]
 },
 "Ukrainian": {
  "native": "Українська мова",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Доброго дня",
    "pron": "DOH-broh-ho DNYA"
   },
   {
    "en": "Goodbye",
    "loc": "До побачення",
    "pron": "doh poh-BAH-chen-nya"
   },
   {
    "en": "Please",
    "loc": "Будь ласка",
    "pron": "bood LAS-ka"
   },
   {
    "en": "Thank you",
    "loc": "Дякую",
    "pron": "DYAH-koo-yoo"
   },
   {
    "en": "You're welcome",
    "loc": "Будь ласка",
    "pron": "bood LAS-ka"
   },
   {
    "en": "Yes",
    "loc": "Так",
    "pron": "tahk"
   },
   {
    "en": "No",
    "loc": "Ні",
    "pron": "nee"
   },
   {
    "en": "Excuse me",
    "loc": "Перепрошую",
    "pron": "peh-reh-PROH-shoo-yoo"
   },
   {
    "en": "Sorry",
    "loc": "Вибачте",
    "pron": "VIH-bach-teh"
   },
   {
    "en": "Do you speak English?",
    "loc": "Ви розмовляєте англійською?",
    "pron": "vih roz-mov-LYAH-yeh-teh an-HLEE-skoh-yoo"
   },
   {
    "en": "I don't understand",
    "loc": "Я не розумію",
    "pron": "ya neh roh-zoo-MEE-yoo"
   },
   {
    "en": "Help!",
    "loc": "Допоможіть!",
    "pron": "doh-poh-moh-ZHEET"
   },
   {
    "en": "How much is this?",
    "loc": "Скільки це коштує?",
    "pron": "SKEEL-kih tseh KOSH-too-yeh"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Де туалет?",
    "pron": "deh too-ah-LET"
   },
   {
    "en": "I would like this",
    "loc": "Я хотів би це",
    "pron": "ya khoh-TEEV bih tseh"
   },
   {
    "en": "The bill, please",
    "loc": "Рахунок, будь ласка",
    "pron": "rah-KHOO-nok, bood LAS-ka"
   },
   {
    "en": "Water",
    "loc": "Вода",
    "pron": "voh-DAH"
   },
   {
    "en": "Good morning",
    "loc": "Доброго ранку",
    "pron": "DOH-broh-ho RAHN-koo"
   },
   {
    "en": "Good evening",
    "loc": "Добрий вечір",
    "pron": "DOH-briy VEH-cheer"
   },
   {
    "en": "My name is …",
    "loc": "Мене звати …",
    "pron": "MEH-neh ZVAH-tih …"
   },
   {
    "en": "How are you?",
    "loc": "Як справи?",
    "pron": "yak SPRAH-vih"
   },
   {
    "en": "I need a doctor",
    "loc": "Мені потрібен лікар",
    "pron": "meh-NEE poh-TREE-ben LEE-kar"
   },
   {
    "en": "Call the police",
    "loc": "Викличте поліцію",
    "pron": "VIH-klich-teh poh-LEE-tsee-yoo"
   },
   {
    "en": "Left",
    "loc": "Ліворуч",
    "pron": "lee-VOH-rooch"
   },
   {
    "en": "Right",
    "loc": "Праворуч",
    "pron": "prah-VOH-rooch"
   },
   {
    "en": "Where is the train station?",
    "loc": "Де залізничний вокзал?",
    "pron": "deh zah-leez-NICH-niy vok-ZAL"
   },
   {
    "en": "How do I get to …?",
    "loc": "Як дістатися до …?",
    "pron": "yak dee-STAH-tih-sya doh …"
   },
   {
    "en": "Delicious!",
    "loc": "Смачно!",
    "pron": "SMACH-no"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "один",
    "pron": "oh-DYN"
   },
   {
    "n": 2,
    "loc": "два",
    "pron": "dvah"
   },
   {
    "n": 3,
    "loc": "три",
    "pron": "trih"
   },
   {
    "n": 4,
    "loc": "чотири",
    "pron": "choh-TIH-rih"
   },
   {
    "n": 5,
    "loc": "п'ять",
    "pron": "pyat"
   },
   {
    "n": 6,
    "loc": "шість",
    "pron": "sheest"
   },
   {
    "n": 7,
    "loc": "сім",
    "pron": "seem"
   },
   {
    "n": 8,
    "loc": "вісім",
    "pron": "VEE-seem"
   },
   {
    "n": 9,
    "loc": "дев'ять",
    "pron": "DEH-vyat"
   },
   {
    "n": 10,
    "loc": "десять",
    "pron": "DEH-syat"
   }
  ]
 },
 "Swahili": {
  "native": "Kiswahili",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Habari",
    "pron": "ha-BA-ree"
   },
   {
    "en": "Goodbye",
    "loc": "Kwaheri",
    "pron": "kwa-HE-ree"
   },
   {
    "en": "Please",
    "loc": "Tafadhali",
    "pron": "ta-fa-DHA-lee"
   },
   {
    "en": "Thank you",
    "loc": "Asante",
    "pron": "ah-SAN-teh"
   },
   {
    "en": "You're welcome",
    "loc": "Karibu",
    "pron": "ka-REE-boo"
   },
   {
    "en": "Yes",
    "loc": "Ndiyo",
    "pron": "n-DEE-yo"
   },
   {
    "en": "No",
    "loc": "Hapana",
    "pron": "ha-PA-na"
   },
   {
    "en": "Excuse me",
    "loc": "Samahani",
    "pron": "sa-ma-HA-nee"
   },
   {
    "en": "Sorry",
    "loc": "Pole",
    "pron": "PO-leh"
   },
   {
    "en": "Do you speak English?",
    "loc": "Unazungumza Kiingereza?",
    "pron": "oo-na-zoon-GOOM-za kee-een-geh-RE-za"
   },
   {
    "en": "I don't understand",
    "loc": "Sielewi",
    "pron": "see-eh-LE-wee"
   },
   {
    "en": "Help!",
    "loc": "Saidia!",
    "pron": "sah-ee-DEE-ah"
   },
   {
    "en": "How much is this?",
    "loc": "Hii ni bei gani?",
    "pron": "HEE nee bay GA-nee"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Choo kiko wapi?",
    "pron": "CHO kee-ko WA-pee"
   },
   {
    "en": "I would like this",
    "loc": "Ningependa hii",
    "pron": "neen-geh-PEN-da HEE"
   },
   {
    "en": "The bill, please",
    "loc": "Bili, tafadhali",
    "pron": "BEE-lee, ta-fa-DHA-lee"
   },
   {
    "en": "Water",
    "loc": "Maji",
    "pron": "MA-jee"
   },
   {
    "en": "Good morning",
    "loc": "Habari za asubuhi",
    "pron": "ha-BA-ree za a-soo-BOO-hee"
   },
   {
    "en": "Good evening",
    "loc": "Habari za jioni",
    "pron": "ha-BA-ree za jee-O-nee"
   },
   {
    "en": "My name is …",
    "loc": "Jina langu ni …",
    "pron": "JEE-na LAN-goo nee …"
   },
   {
    "en": "How are you?",
    "loc": "Habari yako?",
    "pron": "ha-BA-ree YA-ko"
   },
   {
    "en": "I need a doctor",
    "loc": "Nahitaji daktari",
    "pron": "na-hee-TA-jee dak-TA-ree"
   },
   {
    "en": "Call the police",
    "loc": "Piga simu polisi",
    "pron": "PEE-ga SEE-moo po-LEE-see"
   },
   {
    "en": "Left",
    "loc": "Kushoto",
    "pron": "koo-SHO-to"
   },
   {
    "en": "Right",
    "loc": "Kulia",
    "pron": "koo-LEE-ah"
   },
   {
    "en": "Where is the train station?",
    "loc": "Stesheni ya treni iko wapi?",
    "pron": "steh-SHE-nee ya TRE-nee ee-ko WA-pee"
   },
   {
    "en": "How do I get to …?",
    "loc": "Nawezaje kufika …?",
    "pron": "na-we-ZA-jeh koo-FEE-ka …"
   },
   {
    "en": "Delicious!",
    "loc": "Tamu sana!",
    "pron": "TA-moo SA-na"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "moja",
    "pron": "MO-ja"
   },
   {
    "n": 2,
    "loc": "mbili",
    "pron": "m-BEE-lee"
   },
   {
    "n": 3,
    "loc": "tatu",
    "pron": "TA-too"
   },
   {
    "n": 4,
    "loc": "nne",
    "pron": "n-NEH"
   },
   {
    "n": 5,
    "loc": "tano",
    "pron": "TA-no"
   },
   {
    "n": 6,
    "loc": "sita",
    "pron": "SEE-ta"
   },
   {
    "n": 7,
    "loc": "saba",
    "pron": "SA-ba"
   },
   {
    "n": 8,
    "loc": "nane",
    "pron": "NA-neh"
   },
   {
    "n": 9,
    "loc": "tisa",
    "pron": "TEE-sa"
   },
   {
    "n": 10,
    "loc": "kumi",
    "pron": "KOO-mee"
   }
  ]
 },
 "Amharic": {
  "native": "አማርኛ",
  "phrases": [
   {
    "en": "Hello",
    "loc": "ሰላም",
    "pron": "se-LAM"
   },
   {
    "en": "Goodbye",
    "loc": "ደህና ሁን",
    "pron": "deh-NA hun (to a man) / deh-NA hugn (to a woman)"
   },
   {
    "en": "Please",
    "loc": "እባክህ",
    "pron": "e-BAK-ih (to a man) / e-BAK-ish (to a woman)"
   },
   {
    "en": "Thank you",
    "loc": "አመሰግናለሁ",
    "pron": "a-me-seg-NA-le-hu"
   },
   {
    "en": "You're welcome",
    "loc": "ምንም አይደለም",
    "pron": "MIN-im ai-de-LEM"
   },
   {
    "en": "Yes",
    "loc": "አዎ",
    "pron": "a-WO"
   },
   {
    "en": "No",
    "loc": "አይ",
    "pron": "AY"
   },
   {
    "en": "Excuse me",
    "loc": "ይቅርታ",
    "pron": "yi-KIR-ta"
   },
   {
    "en": "Sorry",
    "loc": "አዝናለሁ",
    "pron": "az-NA-le-hu"
   },
   {
    "en": "Do you speak English?",
    "loc": "እንግሊዝኛ ይችላሉ?",
    "pron": "in-gli-ZIGN-ya yich-LAL-u?"
   },
   {
    "en": "I don't understand",
    "loc": "አልገባኝም",
    "pron": "al-ge-BAGN-im"
   },
   {
    "en": "Help!",
    "loc": "እርዱኝ!",
    "pron": "ir-DUGN!"
   },
   {
    "en": "How much is this?",
    "loc": "ይህ ስንት ነው?",
    "pron": "yih sint new?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "መጸዳጃ ቤት የት ነው?",
    "pron": "me-tse-DA-ja bet yet new?"
   },
   {
    "en": "I would like this",
    "loc": "ይህን እፈልጋለሁ",
    "pron": "YI-hin e-fel-GA-le-hu"
   },
   {
    "en": "The bill, please",
    "loc": "ሂሳቡን እባክዎ",
    "pron": "hi-SA-bun e-BAK-wo"
   },
   {
    "en": "Water",
    "loc": "ውሃ",
    "pron": "WU-ha"
   },
   {
    "en": "Good morning",
    "loc": "እንደምን አደሩ",
    "pron": "in-de-MIN a-DE-ru"
   },
   {
    "en": "Good evening",
    "loc": "እንደምን አመሹ",
    "pron": "in-de-MIN a-ME-shu"
   },
   {
    "en": "My name is …",
    "loc": "ስሜ … ነው",
    "pron": "si-ME … new"
   },
   {
    "en": "How are you?",
    "loc": "እንደምን ነዎት?",
    "pron": "in-de-MIN ne-WOT?"
   },
   {
    "en": "I need a doctor",
    "loc": "ዶክተር እፈልጋለሁ",
    "pron": "DOK-ter e-fel-GA-le-hu"
   },
   {
    "en": "Call the police",
    "loc": "ፖሊስ ይጥሩ",
    "pron": "po-LIS yi-TI-ru"
   },
   {
    "en": "Left",
    "loc": "ግራ",
    "pron": "gi-RA"
   },
   {
    "en": "Right",
    "loc": "ቀኝ",
    "pron": "keGN"
   },
   {
    "en": "Where is the train station?",
    "loc": "የባቡር ጣቢያ የት ነው?",
    "pron": "ye-ba-BUR ta-BI-ya yet new?"
   },
   {
    "en": "How do I get to …?",
    "loc": "ወደ … እንዴት እደርሳለሁ?",
    "pron": "we-de … in-DET e-der-SA-le-hu?"
   },
   {
    "en": "Delicious!",
    "loc": "ጣፋጭ ነው!",
    "pron": "ta-FACH new!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "አንድ",
    "pron": "and"
   },
   {
    "n": 2,
    "loc": "ሁለት",
    "pron": "hu-LET"
   },
   {
    "n": 3,
    "loc": "ሶስት",
    "pron": "SOST"
   },
   {
    "n": 4,
    "loc": "አራት",
    "pron": "a-RAT"
   },
   {
    "n": 5,
    "loc": "አምስት",
    "pron": "AM-mist"
   },
   {
    "n": 6,
    "loc": "ስድስት",
    "pron": "SI-dist"
   },
   {
    "n": 7,
    "loc": "ሰባት",
    "pron": "se-BAT"
   },
   {
    "n": 8,
    "loc": "ስምንት",
    "pron": "si-MINT"
   },
   {
    "n": 9,
    "loc": "ዘጠኝ",
    "pron": "ze-TEGN"
   },
   {
    "n": 10,
    "loc": "አስር",
    "pron": "AS-ir"
   }
  ]
 },
 "Yoruba": {
  "native": "Èdè Yorùbá",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Báwo ni",
    "pron": "BAH-waw nee"
   },
   {
    "en": "Goodbye",
    "loc": "Ó dàbọ̀",
    "pron": "oh DAH-baw"
   },
   {
    "en": "Please",
    "loc": "Jọ̀wọ́",
    "pron": "JAW-waw"
   },
   {
    "en": "Thank you",
    "loc": "Ẹ ṣé",
    "pron": "eh SHEH"
   },
   {
    "en": "You're welcome",
    "loc": "Kò sí nǹkan",
    "pron": "koh SEE n-KAHN"
   },
   {
    "en": "Yes",
    "loc": "Bẹ́ẹ̀ ni",
    "pron": "BEH-eh nee"
   },
   {
    "en": "No",
    "loc": "Bẹ́ẹ̀ kọ́",
    "pron": "BEH-eh kaw"
   },
   {
    "en": "Excuse me",
    "loc": "Ẹ jọ̀wọ́",
    "pron": "eh JAW-waw"
   },
   {
    "en": "Sorry",
    "loc": "Ẹ má bínú",
    "pron": "eh mah BEE-noo"
   },
   {
    "en": "Do you speak English?",
    "loc": "Ṣé o ń sọ èdè Gẹ̀ẹ́sì?",
    "pron": "sheh oh n saw EH-deh GEH-eh-see"
   },
   {
    "en": "I don't understand",
    "loc": "Mi ò yé mi",
    "pron": "mee oh YEH mee"
   },
   {
    "en": "Help!",
    "loc": "Ẹ gbà mí!",
    "pron": "eh GBAH mee"
   },
   {
    "en": "How much is this?",
    "loc": "Èló ni èyí?",
    "pron": "EH-loh nee EH-yee"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Níbo ni ilé ìgbọ̀nsẹ̀ wà?",
    "pron": "NEE-boh nee ee-LEH ee-GBAWN-seh wah"
   },
   {
    "en": "I would like this",
    "loc": "Mo fẹ́ èyí",
    "pron": "moh FEH EH-yee"
   },
   {
    "en": "The bill, please",
    "loc": "Ẹ jọ̀wọ́, ẹ mú ìwé owó wá",
    "pron": "eh JAW-waw, eh moo EE-weh oh-WOH wah"
   },
   {
    "en": "Water",
    "loc": "Omi",
    "pron": "OH-mee"
   },
   {
    "en": "Good morning",
    "loc": "Ẹ kàárọ̀",
    "pron": "eh KAH-ah-raw"
   },
   {
    "en": "Good evening",
    "loc": "Ẹ kú ìrọ̀lẹ́",
    "pron": "eh koo ee-RAW-leh"
   },
   {
    "en": "My name is …",
    "loc": "Orúkọ mi ni …",
    "pron": "oh-ROO-kaw mee nee …"
   },
   {
    "en": "How are you?",
    "loc": "Báwo ni o ṣe wà?",
    "pron": "BAH-waw nee oh sheh wah"
   },
   {
    "en": "I need a doctor",
    "loc": "Mo nílò dókítà",
    "pron": "moh NEE-loh DOH-kee-tah"
   },
   {
    "en": "Call the police",
    "loc": "Ẹ pe ọlọ́pàá",
    "pron": "eh peh aw-LAW-pah-AH"
   },
   {
    "en": "Left",
    "loc": "Òsì",
    "pron": "OH-see"
   },
   {
    "en": "Right",
    "loc": "Ọ̀tún",
    "pron": "AW-toon"
   },
   {
    "en": "Where is the train station?",
    "loc": "Níbo ni ibùdó ọkọ̀ ojú irin wà?",
    "pron": "NEE-boh nee ee-BOO-doh aw-KAW oh-JOO ee-reen wah"
   },
   {
    "en": "How do I get to …?",
    "loc": "Báwo ni mo ṣe lè dé …?",
    "pron": "BAH-waw nee moh sheh leh DEH …"
   },
   {
    "en": "Delicious!",
    "loc": "Ó dùn!",
    "pron": "oh DOON"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "ọ̀kan",
    "pron": "AW-kahn"
   },
   {
    "n": 2,
    "loc": "èjì",
    "pron": "EH-jee"
   },
   {
    "n": 3,
    "loc": "ẹ̀ta",
    "pron": "EH-tah"
   },
   {
    "n": 4,
    "loc": "ẹ̀rin",
    "pron": "EH-reen"
   },
   {
    "n": 5,
    "loc": "àrún",
    "pron": "AH-roon"
   },
   {
    "n": 6,
    "loc": "ẹ̀fà",
    "pron": "EH-fah"
   },
   {
    "n": 7,
    "loc": "èje",
    "pron": "EH-jeh"
   },
   {
    "n": 8,
    "loc": "ẹ̀jọ̀",
    "pron": "EH-jaw"
   },
   {
    "n": 9,
    "loc": "ẹ̀sàn",
    "pron": "EH-sahn"
   },
   {
    "n": 10,
    "loc": "ẹ̀wá",
    "pron": "EH-wah"
   }
  ]
 },
 "Hausa": {
  "native": "Harshen Hausa",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Sannu",
    "pron": "SAN-noo"
   },
   {
    "en": "Goodbye",
    "loc": "Sai an jima",
    "pron": "sigh an JEE-ma"
   },
   {
    "en": "Please",
    "loc": "Don Allah",
    "pron": "don AL-lah"
   },
   {
    "en": "Thank you",
    "loc": "Na gode",
    "pron": "na GOH-deh"
   },
   {
    "en": "You're welcome",
    "loc": "Babu komai",
    "pron": "BAH-boo KOH-my"
   },
   {
    "en": "Yes",
    "loc": "Eh",
    "pron": "eh"
   },
   {
    "en": "No",
    "loc": "A'a",
    "pron": "AH-ah"
   },
   {
    "en": "Excuse me",
    "loc": "Yi hakuri",
    "pron": "yee ha-KOO-ree"
   },
   {
    "en": "Sorry",
    "loc": "Yi hakuri",
    "pron": "yee ha-KOO-ree"
   },
   {
    "en": "Do you speak English?",
    "loc": "Kana jin Turanci?",
    "pron": "KA-na jin too-RAN-chee"
   },
   {
    "en": "I don't understand",
    "loc": "Ban gane ba",
    "pron": "ban GA-neh ba"
   },
   {
    "en": "Help!",
    "loc": "Taimako!",
    "pron": "tie-MA-koh"
   },
   {
    "en": "How much is this?",
    "loc": "Nawa ne wannan?",
    "pron": "NA-wa neh WAN-nan"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Ina bayan gida?",
    "pron": "EE-na BA-yan GEE-da"
   },
   {
    "en": "I would like this",
    "loc": "Ina son wannan",
    "pron": "EE-na son WAN-nan"
   },
   {
    "en": "The bill, please",
    "loc": "Lissafi, don Allah",
    "pron": "lis-SA-fee, don AL-lah"
   },
   {
    "en": "Water",
    "loc": "Ruwa",
    "pron": "ROO-wa"
   },
   {
    "en": "Good morning",
    "loc": "Ina kwana",
    "pron": "EE-na KWA-na"
   },
   {
    "en": "Good evening",
    "loc": "Barka da yamma",
    "pron": "BAR-ka da YAM-ma"
   },
   {
    "en": "My name is …",
    "loc": "Sunana …",
    "pron": "soo-NA-na …"
   },
   {
    "en": "How are you?",
    "loc": "Yaya kake?",
    "pron": "YA-ya KA-keh"
   },
   {
    "en": "I need a doctor",
    "loc": "Ina bukatar likita",
    "pron": "EE-na boo-KA-tar lee-KEE-ta"
   },
   {
    "en": "Call the police",
    "loc": "Kira 'yan sanda",
    "pron": "KEE-ra yan SAN-da"
   },
   {
    "en": "Left",
    "loc": "Hagu",
    "pron": "HA-goo"
   },
   {
    "en": "Right",
    "loc": "Dama",
    "pron": "DA-ma"
   },
   {
    "en": "Where is the train station?",
    "loc": "Ina tashar jirgin ƙasa?",
    "pron": "EE-na TA-shar JEER-gin KA-sa"
   },
   {
    "en": "How do I get to …?",
    "loc": "Yaya zan je …?",
    "pron": "YA-ya zan jeh …"
   },
   {
    "en": "Delicious!",
    "loc": "Mai daɗi!",
    "pron": "my DA-dee"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "ɗaya",
    "pron": "DA-ya"
   },
   {
    "n": 2,
    "loc": "biyu",
    "pron": "BEE-yoo"
   },
   {
    "n": 3,
    "loc": "uku",
    "pron": "OO-koo"
   },
   {
    "n": 4,
    "loc": "huɗu",
    "pron": "HOO-doo"
   },
   {
    "n": 5,
    "loc": "biyar",
    "pron": "BEE-yar"
   },
   {
    "n": 6,
    "loc": "shida",
    "pron": "SHEE-da"
   },
   {
    "n": 7,
    "loc": "bakwai",
    "pron": "BAK-why"
   },
   {
    "n": 8,
    "loc": "takwas",
    "pron": "TAK-was"
   },
   {
    "n": 9,
    "loc": "tara",
    "pron": "TA-ra"
   },
   {
    "n": 10,
    "loc": "goma",
    "pron": "GOH-ma"
   }
  ]
 },
 "Zulu": {
  "native": "isiZulu",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Sawubona",
    "pron": "sah-woo-BOH-nah (to one person; to several say 'Sanibonani' sah-nee-boh-NAH-nee)"
   },
   {
    "en": "Goodbye",
    "loc": "Sala kahle",
    "pron": "SAH-lah KAH-hleh (said to one staying; 'hl' is a breathy lateral, not 'sh'); the one leaving says 'Hamba kahle' HAHM-bah KAH-hleh"
   },
   {
    "en": "Please",
    "loc": "Ngicela",
    "pron": "ngee-CEH-lah ('c' is a dental click — tongue tip on the teeth)"
   },
   {
    "en": "Thank you",
    "loc": "Ngiyabonga",
    "pron": "ngee-yah-BOH-ngah"
   },
   {
    "en": "You're welcome",
    "loc": "Wamukelekile",
    "pron": "wah-moo-keh-leh-KEE-leh"
   },
   {
    "en": "Yes",
    "loc": "Yebo",
    "pron": "YEH-boh"
   },
   {
    "en": "No",
    "loc": "Cha",
    "pron": "!ah ('c' is a dental click, not 'tsh' — click the tongue off the teeth, then 'ah')"
   },
   {
    "en": "Excuse me",
    "loc": "Uxolo",
    "pron": "oo-XOH-loh ('x' is a lateral click — like the sound used to urge on a horse)"
   },
   {
    "en": "Sorry",
    "loc": "Ngiyaxolisa",
    "pron": "ngee-yah-XOH-lee-sah ('x' is a lateral click)"
   },
   {
    "en": "Do you speak English?",
    "loc": "Ingabe uyakhuluma isiNgisi?",
    "pron": "ee-NGAH-beh oo-yah-koo-LOO-mah ee-see-NGEE-see"
   },
   {
    "en": "I don't understand",
    "loc": "Angiqondi",
    "pron": "ah-ngee-QOHN-dee ('q' is a palatal click — tongue pulled sharply off the roof of the mouth)"
   },
   {
    "en": "Help!",
    "loc": "Ngisizeni!",
    "pron": "ngee-see-ZEH-nee (to a group/for urgency); to one person 'Ngisize' ngee-SEE-zeh"
   },
   {
    "en": "How much is this?",
    "loc": "Kubiza malini lokhu?",
    "pron": "koo-BEE-zah mah-LEE-nee LOH-koo"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Liphi ithoyilethe?",
    "pron": "LEE-pee ee-toh-yee-LEH-teh"
   },
   {
    "en": "I would like this",
    "loc": "Ngingathanda lokhu",
    "pron": "ngee-ngah-TAHN-dah LOH-koo"
   },
   {
    "en": "The bill, please",
    "loc": "Ngicela ibhili",
    "pron": "ngee-CEH-lah ee-BEE-lee ('c' is a dental click)"
   },
   {
    "en": "Water",
    "loc": "Amanzi",
    "pron": "ah-MAHN-zee"
   },
   {
    "en": "Good morning",
    "loc": "Sawubona ekuseni",
    "pron": "sah-woo-BOH-nah eh-koo-SEH-nee"
   },
   {
    "en": "Good evening",
    "loc": "Sawubona kusihlwa",
    "pron": "sah-woo-BOH-nah koo-SEE-hlwah ('hl' is a breathy lateral)"
   },
   {
    "en": "My name is …",
    "loc": "Igama lami ngu …",
    "pron": "ee-GAH-mah LAH-mee ngoo …"
   },
   {
    "en": "How are you?",
    "loc": "Unjani?",
    "pron": "oon-JAH-nee (to one person; to several 'Ninjani?' neen-JAH-nee)"
   },
   {
    "en": "I need a doctor",
    "loc": "Ngidinga udokotela",
    "pron": "ngee-DEE-ngah oo-doh-koh-TEH-lah"
   },
   {
    "en": "Call the police",
    "loc": "Biza amaphoyisa",
    "pron": "BEE-zah ah-mah-poh-YEE-sah"
   },
   {
    "en": "Left",
    "loc": "Kwesokunxele",
    "pron": "kweh-soh-koo-NXEH-leh ('nx' is a nasalised lateral click)"
   },
   {
    "en": "Right",
    "loc": "Kwesokudla",
    "pron": "kweh-soh-KOOD-lah"
   },
   {
    "en": "Where is the train station?",
    "loc": "Sikuphi isiteshi sesitimela?",
    "pron": "see-KOO-pee ee-see-TEH-shee seh-see-tee-MEH-lah"
   },
   {
    "en": "How do I get to …?",
    "loc": "Ngifika kanjani e…?",
    "pron": "ngee-FEE-kah kahn-JAH-nee eh-…"
   },
   {
    "en": "Delicious!",
    "loc": "Kumnandi!",
    "pron": "koom-NAHN-dee"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "kunye",
    "pron": "KOON-yeh"
   },
   {
    "n": 2,
    "loc": "kubili",
    "pron": "koo-BEE-lee"
   },
   {
    "n": 3,
    "loc": "kuthathu",
    "pron": "koo-TAH-too"
   },
   {
    "n": 4,
    "loc": "kune",
    "pron": "KOO-neh"
   },
   {
    "n": 5,
    "loc": "kuhlanu",
    "pron": "koo-HLAH-noo ('hl' is a breathy lateral, not 'shl')"
   },
   {
    "n": 6,
    "loc": "isithupha",
    "pron": "ee-see-TOO-pah"
   },
   {
    "n": 7,
    "loc": "isikhombisa",
    "pron": "ee-see-kohm-BEE-sah"
   },
   {
    "n": 8,
    "loc": "isishiyagalombili",
    "pron": "ee-see-shee-yah-gah-lohm-BEE-lee"
   },
   {
    "n": 9,
    "loc": "isishiyagalolunye",
    "pron": "ee-see-shee-yah-gah-loh-LOON-yeh"
   },
   {
    "n": 10,
    "loc": "ishumi",
    "pron": "ee-SHOO-mee"
   }
  ]
 },
 "Afrikaans": {
  "native": "Afrikaans",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Hallo",
    "pron": "HAH-loh"
   },
   {
    "en": "Goodbye",
    "loc": "Totsiens",
    "pron": "TOT-seens"
   },
   {
    "en": "Please",
    "loc": "Asseblief",
    "pron": "AH-suh-bleef"
   },
   {
    "en": "Thank you",
    "loc": "Dankie",
    "pron": "DUNK-ee"
   },
   {
    "en": "You're welcome",
    "loc": "Dis 'n plesier",
    "pron": "dis uh pluh-SEER"
   },
   {
    "en": "Yes",
    "loc": "Ja",
    "pron": "yah"
   },
   {
    "en": "No",
    "loc": "Nee",
    "pron": "neh-uh (ee like 'ay' in 'day')"
   },
   {
    "en": "Excuse me",
    "loc": "Verskoon my",
    "pron": "fer-SKOON may"
   },
   {
    "en": "Sorry",
    "loc": "Jammer",
    "pron": "YUH-mer"
   },
   {
    "en": "Do you speak English?",
    "loc": "Praat u Engels?",
    "pron": "praht oo ENG-uls?"
   },
   {
    "en": "I don't understand",
    "loc": "Ek verstaan nie",
    "pron": "ek fer-STAHN nee"
   },
   {
    "en": "Help!",
    "loc": "Help!",
    "pron": "help!"
   },
   {
    "en": "How much is this?",
    "loc": "Hoeveel kos dit?",
    "pron": "HOO-fel kos dit?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Waar is die toilet?",
    "pron": "vahr is dee toy-LET?"
   },
   {
    "en": "I would like this",
    "loc": "Ek wil hierdie hê",
    "pron": "ek vil HEER-dee heh"
   },
   {
    "en": "The bill, please",
    "loc": "Die rekening, asseblief",
    "pron": "dee RAY-kuh-ning, AH-suh-bleef"
   },
   {
    "en": "Water",
    "loc": "Water",
    "pron": "VAH-ter"
   },
   {
    "en": "Good morning",
    "loc": "Goeiemôre",
    "pron": "GHOY-uh-maw-ruh"
   },
   {
    "en": "Good evening",
    "loc": "Goeienaand",
    "pron": "GHOY-uh-nahnt"
   },
   {
    "en": "My name is …",
    "loc": "My naam is …",
    "pron": "may nahm is …"
   },
   {
    "en": "How are you?",
    "loc": "Hoe gaan dit met u?",
    "pron": "hoo ghahn dit met oo?"
   },
   {
    "en": "I need a doctor",
    "loc": "Ek het 'n dokter nodig",
    "pron": "ek het uh DOK-ter NOH-dikh"
   },
   {
    "en": "Call the police",
    "loc": "Bel die polisie",
    "pron": "bel dee poo-LEE-see"
   },
   {
    "en": "Left",
    "loc": "Links",
    "pron": "links"
   },
   {
    "en": "Right",
    "loc": "Regs",
    "pron": "rekhs"
   },
   {
    "en": "Where is the train station?",
    "loc": "Waar is die treinstasie?",
    "pron": "vahr is dee TRAYN-stah-see?"
   },
   {
    "en": "How do I get to …?",
    "loc": "Hoe kom ek by … uit?",
    "pron": "hoo kom ek bay … oyt?"
   },
   {
    "en": "Delicious!",
    "loc": "Heerlik!",
    "pron": "HEER-lik!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "een",
    "pron": "ee-uhn (ee like 'ay' in 'day')"
   },
   {
    "n": 2,
    "loc": "twee",
    "pron": "tvee"
   },
   {
    "n": 3,
    "loc": "drie",
    "pron": "dree"
   },
   {
    "n": 4,
    "loc": "vier",
    "pron": "feer"
   },
   {
    "n": 5,
    "loc": "vyf",
    "pron": "fayf"
   },
   {
    "n": 6,
    "loc": "ses",
    "pron": "ses"
   },
   {
    "n": 7,
    "loc": "sewe",
    "pron": "SEH-vuh"
   },
   {
    "n": 8,
    "loc": "agt",
    "pron": "akht"
   },
   {
    "n": 9,
    "loc": "nege",
    "pron": "NEH-ghuh"
   },
   {
    "n": 10,
    "loc": "tien",
    "pron": "teen"
   }
  ]
 },
 "Somali": {
  "native": "Af-Soomaali",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Salaan / Iska warran",
    "pron": "sa-LAAN / is-ka WA-rran"
   },
   {
    "en": "Goodbye",
    "loc": "Nabadgelyo",
    "pron": "na-bad-GEL-yo"
   },
   {
    "en": "Please",
    "loc": "Fadlan",
    "pron": "FAD-lan"
   },
   {
    "en": "Thank you",
    "loc": "Mahadsanid",
    "pron": "ma-had-SA-nid"
   },
   {
    "en": "You're welcome",
    "loc": "Adaa mudan",
    "pron": "a-DAA MU-dan"
   },
   {
    "en": "Yes",
    "loc": "Haa",
    "pron": "HAA"
   },
   {
    "en": "No",
    "loc": "Maya",
    "pron": "MA-ya"
   },
   {
    "en": "Excuse me",
    "loc": "Iga raali ahow",
    "pron": "i-ga RAA-li A-how"
   },
   {
    "en": "Sorry",
    "loc": "Waan ka xumahay",
    "pron": "waan ka HU-ma-hay (h = throaty)"
   },
   {
    "en": "Do you speak English?",
    "loc": "Ma ku hadashaa Ingiriisi?",
    "pron": "ma ku ha-da-SHAA in-gi-REE-si"
   },
   {
    "en": "I don't understand",
    "loc": "Ma fahmin",
    "pron": "ma FAH-min"
   },
   {
    "en": "Help!",
    "loc": "Caawi!",
    "pron": "AA-wi (deep throat onset)"
   },
   {
    "en": "How much is this?",
    "loc": "Waa intee qiimihiisu?",
    "pron": "waa in-TEE qee-mi-HEE-su"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Musqushu xaggee bay tahay?",
    "pron": "mus-QU-shu hag-GEE bay TA-hay (h = throaty)"
   },
   {
    "en": "I would like this",
    "loc": "Waxaan jeclaan lahaa kan",
    "pron": "wa-HAAN jec-LAAN la-HAA kan (h = throaty)"
   },
   {
    "en": "The bill, please",
    "loc": "Biilka, fadlan",
    "pron": "BEEL-ka, FAD-lan"
   },
   {
    "en": "Water",
    "loc": "Biyo",
    "pron": "BI-yo"
   },
   {
    "en": "Good morning",
    "loc": "Subax wanaagsan",
    "pron": "SU-bah wa-NAAG-san (h = throaty)"
   },
   {
    "en": "Good evening",
    "loc": "Fiid wanaagsan",
    "pron": "FEED wa-NAAG-san"
   },
   {
    "en": "My name is …",
    "loc": "Magacaygu waa …",
    "pron": "ma-ga-CAY-gu waa …"
   },
   {
    "en": "How are you?",
    "loc": "Sidee tahay?",
    "pron": "si-DEE TA-hay"
   },
   {
    "en": "I need a doctor",
    "loc": "Waxaan u baahanahay dhakhtar",
    "pron": "wa-HAAN u baa-ha-na-HAY DHAKH-tar (h = throaty)"
   },
   {
    "en": "Call the police",
    "loc": "U yeer booliska",
    "pron": "u YEER BOO-lis-ka"
   },
   {
    "en": "Left",
    "loc": "Bidix",
    "pron": "BI-dih (h = throaty)"
   },
   {
    "en": "Right",
    "loc": "Midig",
    "pron": "MI-dig"
   },
   {
    "en": "Where is the train station?",
    "loc": "Saldhigga tareenku xaggee buu ku yaallaa?",
    "pron": "sal-DHIG-ga ta-REEN-ku hag-GEE buu ku yaal-LAA (h = throaty)"
   },
   {
    "en": "How do I get to …?",
    "loc": "Sideen u tagaa …?",
    "pron": "si-DEEN u ta-GAA …"
   },
   {
    "en": "Delicious!",
    "loc": "Aad u macaan!",
    "pron": "AAD u ma-CAAN (c = deep throat onset)"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "kow",
    "pron": "KOW"
   },
   {
    "n": 2,
    "loc": "laba",
    "pron": "LA-ba"
   },
   {
    "n": 3,
    "loc": "saddex",
    "pron": "SAD-deh (h = throaty)"
   },
   {
    "n": 4,
    "loc": "afar",
    "pron": "A-far"
   },
   {
    "n": 5,
    "loc": "shan",
    "pron": "SHAN"
   },
   {
    "n": 6,
    "loc": "lix",
    "pron": "LIH (h = throaty)"
   },
   {
    "n": 7,
    "loc": "toddoba",
    "pron": "TOD-do-ba"
   },
   {
    "n": 8,
    "loc": "siddeed",
    "pron": "sid-DEED"
   },
   {
    "n": 9,
    "loc": "sagaal",
    "pron": "sa-GAAL"
   },
   {
    "n": 10,
    "loc": "toban",
    "pron": "TO-ban"
   }
  ]
 },
 "Nepali": {
  "native": "नेपाली",
  "phrases": [
   {
    "en": "Hello",
    "loc": "नमस्ते",
    "pron": "na-mas-TE"
   },
   {
    "en": "Goodbye",
    "loc": "नमस्ते / फेरि भेटौंला",
    "pron": "na-mas-TE / PHE-ri bhe-TAUN-laa"
   },
   {
    "en": "Please",
    "loc": "कृपया",
    "pron": "KRI-pa-yaa"
   },
   {
    "en": "Thank you",
    "loc": "धन्यवाद",
    "pron": "DHAN-ya-baad"
   },
   {
    "en": "You're welcome",
    "loc": "स्वागत छ",
    "pron": "SWAA-gat cha"
   },
   {
    "en": "Yes",
    "loc": "हो",
    "pron": "ho"
   },
   {
    "en": "No",
    "loc": "होइन",
    "pron": "HO-ina"
   },
   {
    "en": "Excuse me",
    "loc": "माफ गर्नुहोस्",
    "pron": "MAAPH gar-nu-hos"
   },
   {
    "en": "Sorry",
    "loc": "माफ गर्नुहोस्",
    "pron": "MAAPH gar-nu-hos"
   },
   {
    "en": "Do you speak English?",
    "loc": "तपाईं अङ्ग्रेजी बोल्नुहुन्छ?",
    "pron": "ta-PAA-i ang-GRE-jee BOL-nu-hun-cha"
   },
   {
    "en": "I don't understand",
    "loc": "मैले बुझिनँ",
    "pron": "MAI-le BU-jhi-na"
   },
   {
    "en": "Help!",
    "loc": "मद्दत गर्नुहोस्!",
    "pron": "MAD-dat gar-nu-hos"
   },
   {
    "en": "How much is this?",
    "loc": "यो कति हो?",
    "pron": "yo KA-ti ho"
   },
   {
    "en": "Where is the toilet?",
    "loc": "शौचालय कहाँ छ?",
    "pron": "SHAU-cha-laya ka-HAAN cha"
   },
   {
    "en": "I would like this",
    "loc": "मलाई यो चाहियो",
    "pron": "ma-LAA-i yo chaa-hi-yo"
   },
   {
    "en": "The bill, please",
    "loc": "बिल दिनुहोस्",
    "pron": "bil DI-nu-hos"
   },
   {
    "en": "Water",
    "loc": "पानी",
    "pron": "PAA-nee"
   },
   {
    "en": "Good morning",
    "loc": "शुभ प्रभात",
    "pron": "SHU-bha pra-BHAAT"
   },
   {
    "en": "Good evening",
    "loc": "शुभ सन्ध्या",
    "pron": "SHU-bha SAN-dhyaa"
   },
   {
    "en": "My name is …",
    "loc": "मेरो नाम … हो",
    "pron": "ME-ro naam … ho"
   },
   {
    "en": "How are you?",
    "loc": "तपाईंलाई कस्तो छ?",
    "pron": "ta-PAA-i-laa-i KAS-to cha"
   },
   {
    "en": "I need a doctor",
    "loc": "मलाई डाक्टर चाहियो",
    "pron": "ma-LAA-i DAAK-tar chaa-hi-yo"
   },
   {
    "en": "Call the police",
    "loc": "प्रहरीलाई बोलाउनुहोस्",
    "pron": "pra-ha-REE-laa-i bo-LAAU-nu-hos"
   },
   {
    "en": "Left",
    "loc": "बायाँ",
    "pron": "BAA-yaan"
   },
   {
    "en": "Right",
    "loc": "दायाँ",
    "pron": "DAA-yaan"
   },
   {
    "en": "Where is the train station?",
    "loc": "रेल स्टेशन कहाँ छ?",
    "pron": "rel STE-shan ka-HAAN cha"
   },
   {
    "en": "How do I get to …?",
    "loc": "… कसरी पुग्ने?",
    "pron": "… KA-sa-ree PUG-ne"
   },
   {
    "en": "Delicious!",
    "loc": "मिठो छ!",
    "pron": "MI-tho cha"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "एक",
    "pron": "ek"
   },
   {
    "n": 2,
    "loc": "दुई",
    "pron": "DU-ee"
   },
   {
    "n": 3,
    "loc": "तीन",
    "pron": "teen"
   },
   {
    "n": 4,
    "loc": "चार",
    "pron": "chaar"
   },
   {
    "n": 5,
    "loc": "पाँच",
    "pron": "paanch"
   },
   {
    "n": 6,
    "loc": "छ",
    "pron": "chha"
   },
   {
    "n": 7,
    "loc": "सात",
    "pron": "saat"
   },
   {
    "n": 8,
    "loc": "आठ",
    "pron": "aath"
   },
   {
    "n": 9,
    "loc": "नौ",
    "pron": "nau"
   },
   {
    "n": 10,
    "loc": "दस",
    "pron": "das"
   }
  ]
 },
 "Sinhala": {
  "native": "සිංහල",
  "phrases": [
   {
    "en": "Hello",
    "loc": "ආයුබෝවන්",
    "pron": "AH-yu-BOH-wan"
   },
   {
    "en": "Goodbye",
    "loc": "ආයුබෝවන්",
    "pron": "AH-yu-BOH-wan (also: gihin ennam – 'I will go and come back')"
   },
   {
    "en": "Please",
    "loc": "කරුණාකර",
    "pron": "kah-roo-NAA-kah-rah"
   },
   {
    "en": "Thank you",
    "loc": "ස්තූතියි",
    "pron": "sthoo-TEE-yi"
   },
   {
    "en": "You're welcome",
    "loc": "කමක් නැහැ",
    "pron": "KAH-mak NAA-hae"
   },
   {
    "en": "Yes",
    "loc": "ඔව්",
    "pron": "OH-wu"
   },
   {
    "en": "No",
    "loc": "නැහැ",
    "pron": "NAA-hae"
   },
   {
    "en": "Excuse me",
    "loc": "සමාවෙන්න",
    "pron": "sah-MAA-wen-nah"
   },
   {
    "en": "Sorry",
    "loc": "සමාවෙන්න",
    "pron": "sah-MAA-wen-nah"
   },
   {
    "en": "Do you speak English?",
    "loc": "ඔයා ඉංග්‍රීසි කතා කරනවාද?",
    "pron": "OH-yaa ING-gree-see kah-TAA kah-rah-nah-WAA-dah?"
   },
   {
    "en": "I don't understand",
    "loc": "මට තේරෙන්නේ නැහැ",
    "pron": "MAH-tah teh-REN-nay NAA-hae"
   },
   {
    "en": "Help!",
    "loc": "උදව් කරන්න!",
    "pron": "OO-dow kah-RAN-nah!"
   },
   {
    "en": "How much is this?",
    "loc": "මේක කීයද?",
    "pron": "MEH-kah KEE-yah-dah?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "වැසිකිළිය කොහෙද?",
    "pron": "WAE-see-kih-lee-yah KOH-heh-dah?"
   },
   {
    "en": "I would like this",
    "loc": "මට මේක ඕනේ",
    "pron": "MAH-tah MEH-kah OH-nay"
   },
   {
    "en": "The bill, please",
    "loc": "කරුණාකර බිල ගේන්න",
    "pron": "kah-roo-NAA-kah-rah BIH-lah GEN-nah"
   },
   {
    "en": "Water",
    "loc": "වතුර",
    "pron": "WAH-too-rah"
   },
   {
    "en": "Good morning",
    "loc": "සුබ උදෑසනක්",
    "pron": "SOO-bah oo-DAE-sah-nak"
   },
   {
    "en": "Good evening",
    "loc": "සුබ සැන්දෑවක්",
    "pron": "SOO-bah SAEN-dae-wak"
   },
   {
    "en": "My name is …",
    "loc": "මගේ නම …",
    "pron": "mah-GAY NAH-mah …"
   },
   {
    "en": "How are you?",
    "loc": "කොහොමද?",
    "pron": "KOH-hoh-mah-dah?"
   },
   {
    "en": "I need a doctor",
    "loc": "මට දොස්තර කෙනෙක් ඕනේ",
    "pron": "MAH-tah DOS-tah-rah KEH-nek OH-nay"
   },
   {
    "en": "Call the police",
    "loc": "පොලීසියට කතා කරන්න",
    "pron": "poh-LEE-see-yah-tah kah-TAA kah-RAN-nah"
   },
   {
    "en": "Left",
    "loc": "වම",
    "pron": "WAH-mah"
   },
   {
    "en": "Right",
    "loc": "දකුණ",
    "pron": "DAH-koo-nah"
   },
   {
    "en": "Where is the train station?",
    "loc": "දුම්රිය ස්ථානය කොහෙද?",
    "pron": "DOOM-ree-yah STHAA-nah-yah KOH-heh-dah?"
   },
   {
    "en": "How do I get to …?",
    "loc": "… යන්නේ කොහොමද?",
    "pron": "… YAN-nay KOH-hoh-mah-dah?"
   },
   {
    "en": "Delicious!",
    "loc": "රසයි!",
    "pron": "RAH-sah-yi!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "එක",
    "pron": "EH-kah"
   },
   {
    "n": 2,
    "loc": "දෙක",
    "pron": "DEH-kah"
   },
   {
    "n": 3,
    "loc": "තුන",
    "pron": "TOO-nah"
   },
   {
    "n": 4,
    "loc": "හතර",
    "pron": "HAH-tah-rah"
   },
   {
    "n": 5,
    "loc": "පහ",
    "pron": "PAH-hah"
   },
   {
    "n": 6,
    "loc": "හය",
    "pron": "HAH-yah"
   },
   {
    "n": 7,
    "loc": "හත",
    "pron": "HAH-tah"
   },
   {
    "n": 8,
    "loc": "අට",
    "pron": "AH-tah"
   },
   {
    "n": 9,
    "loc": "නවය",
    "pron": "NAH-wah-yah"
   },
   {
    "n": 10,
    "loc": "දහය",
    "pron": "DAH-hah-yah"
   }
  ]
 },
 "Tamil": {
  "native": "தமிழ்",
  "phrases": [
   {
    "en": "Hello",
    "loc": "வணக்கம்",
    "pron": "vuh-NUK-kum"
   },
   {
    "en": "Goodbye",
    "loc": "போய் வருகிறேன்",
    "pron": "poy va-ru-ki-REN"
   },
   {
    "en": "Please",
    "loc": "தயவு செய்து",
    "pron": "tha-ya-vu SEY-thu"
   },
   {
    "en": "Thank you",
    "loc": "நன்றி",
    "pron": "NUN-dri"
   },
   {
    "en": "You're welcome",
    "loc": "பரவாயில்லை",
    "pron": "pa-ra-VAA-yil-lai"
   },
   {
    "en": "Yes",
    "loc": "ஆம்",
    "pron": "aam"
   },
   {
    "en": "No",
    "loc": "இல்லை",
    "pron": "IL-lai"
   },
   {
    "en": "Excuse me",
    "loc": "மன்னிக்கவும்",
    "pron": "man-NIK-ka-vum"
   },
   {
    "en": "Sorry",
    "loc": "மன்னிக்கவும்",
    "pron": "man-NIK-ka-vum"
   },
   {
    "en": "Do you speak English?",
    "loc": "நீங்கள் ஆங்கிலம் பேசுவீர்களா?",
    "pron": "NEENG-gal AANG-gi-lam PAY-su-veer-ga-laa?"
   },
   {
    "en": "I don't understand",
    "loc": "எனக்கு புரியவில்லை",
    "pron": "e-NAK-ku pu-ri-ya-VIL-lai"
   },
   {
    "en": "Help!",
    "loc": "உதவி!",
    "pron": "u-DA-vi!"
   },
   {
    "en": "How much is this?",
    "loc": "இது எவ்வளவு?",
    "pron": "i-DHU ev-VA-la-vu?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "கழிப்பறை எங்கே இருக்கிறது?",
    "pron": "ka-ZHIP-pa-rai ENG-gay i-ruk-ki-ra-dhu?"
   },
   {
    "en": "I would like this",
    "loc": "எனக்கு இது வேண்டும்",
    "pron": "e-NAK-ku i-DHU VEN-dum"
   },
   {
    "en": "The bill, please",
    "loc": "பில் கொடுங்கள்",
    "pron": "bil ko-DUNG-gal"
   },
   {
    "en": "Water",
    "loc": "தண்ணீர்",
    "pron": "THUN-neer"
   },
   {
    "en": "Good morning",
    "loc": "காலை வணக்கம்",
    "pron": "KAA-lai vuh-NUK-kum"
   },
   {
    "en": "Good evening",
    "loc": "மாலை வணக்கம்",
    "pron": "MAA-lai vuh-NUK-kum"
   },
   {
    "en": "My name is …",
    "loc": "என் பெயர் …",
    "pron": "en PE-yar …"
   },
   {
    "en": "How are you?",
    "loc": "நீங்கள் எப்படி இருக்கிறீர்கள்?",
    "pron": "NEENG-gal ep-pa-di i-ruk-ki-REER-gal?"
   },
   {
    "en": "I need a doctor",
    "loc": "எனக்கு ஒரு மருத்துவர் வேண்டும்",
    "pron": "e-NAK-ku o-ru ma-RUTH-thu-var VEN-dum"
   },
   {
    "en": "Call the police",
    "loc": "காவல்துறையை அழைக்கவும்",
    "pron": "KAA-val-thu-rai-yai a-ZHAIK-ka-vum"
   },
   {
    "en": "Left",
    "loc": "இடது",
    "pron": "i-DA-dhu"
   },
   {
    "en": "Right",
    "loc": "வலது",
    "pron": "va-LA-dhu"
   },
   {
    "en": "Where is the train station?",
    "loc": "ரயில் நிலையம் எங்கே இருக்கிறது?",
    "pron": "ra-YIL ni-LAI-yam ENG-gay i-ruk-ki-ra-dhu?"
   },
   {
    "en": "How do I get to …?",
    "loc": "… க்கு எப்படி போவது?",
    "pron": "… -kku ep-pa-di POH-va-dhu?"
   },
   {
    "en": "Delicious!",
    "loc": "மிகவும் ருசியாக இருக்கிறது!",
    "pron": "MI-ga-vum ru-si-YAA-ga i-ruk-ki-ra-dhu!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "ஒன்று",
    "pron": "ON-dru"
   },
   {
    "n": 2,
    "loc": "இரண்டு",
    "pron": "i-RAN-du"
   },
   {
    "n": 3,
    "loc": "மூன்று",
    "pron": "MOON-dru"
   },
   {
    "n": 4,
    "loc": "நான்கு",
    "pron": "NAAN-gu"
   },
   {
    "n": 5,
    "loc": "ஐந்து",
    "pron": "AIN-dhu"
   },
   {
    "n": 6,
    "loc": "ஆறு",
    "pron": "AA-ru"
   },
   {
    "n": 7,
    "loc": "ஏழு",
    "pron": "AY-zhu"
   },
   {
    "n": 8,
    "loc": "எட்டு",
    "pron": "ET-tu"
   },
   {
    "n": 9,
    "loc": "ஒன்பது",
    "pron": "om-BA-dhu"
   },
   {
    "n": 10,
    "loc": "பத்து",
    "pron": "PUT-thu"
   }
  ]
 },
 "Mongolian": {
  "native": "Монгол хэл",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Сайн байна уу?",
    "pron": "SAIN bai-NOO"
   },
   {
    "en": "Goodbye",
    "loc": "Баяртai",
    "pron": "ba-YAR-tai"
   },
   {
    "en": "Please",
    "loc": "Гуйя",
    "pron": "GUI-ya"
   },
   {
    "en": "Thank you",
    "loc": "Баярлалаа",
    "pron": "ba-YAR-la-LAA"
   },
   {
    "en": "You're welcome",
    "loc": "Зүгээр зүгээр",
    "pron": "ZUU-geer ZUU-geer"
   },
   {
    "en": "Yes",
    "loc": "Тийм",
    "pron": "TEEM"
   },
   {
    "en": "No",
    "loc": "Үгүй",
    "pron": "OO-gui"
   },
   {
    "en": "Excuse me",
    "loc": "Уучлаарай",
    "pron": "OOCH-laa-rai"
   },
   {
    "en": "Sorry",
    "loc": "Уучлаарай",
    "pron": "OOCH-laa-rai"
   },
   {
    "en": "Do you speak English?",
    "loc": "Та англиар ярьдаг уу?",
    "pron": "TA ANG-li-ar YARI-dag oo"
   },
   {
    "en": "I don't understand",
    "loc": "Би ойлгохгүй байна",
    "pron": "BEE OIL-goh-gui bai-na"
   },
   {
    "en": "Help!",
    "loc": "Туслаарай!",
    "pron": "TOOS-laa-rai"
   },
   {
    "en": "How much is this?",
    "loc": "Энэ хэдэн төгрөг вэ?",
    "pron": "EN heh-DEN TUG-rug ve"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Жорлон хаана байдаг вэ?",
    "pron": "JOR-lon HAA-na bai-dag ve"
   },
   {
    "en": "I would like this",
    "loc": "Би үүнийг авмаар байна",
    "pron": "BEE OO-niig AV-maar bai-na"
   },
   {
    "en": "The bill, please",
    "loc": "Тооцоогоо хийе",
    "pron": "TOH-tsoo-goh HEE-ye"
   },
   {
    "en": "Water",
    "loc": "Ус",
    "pron": "OOS"
   },
   {
    "en": "Good morning",
    "loc": "Өглөөний мэнд",
    "pron": "UG-luu-nii MEND"
   },
   {
    "en": "Good evening",
    "loc": "Оройн мэнд",
    "pron": "O-roin MEND"
   },
   {
    "en": "My name is …",
    "loc": "Намайг … гэдэг",
    "pron": "NA-maig … GE-deg"
   },
   {
    "en": "How are you?",
    "loc": "Та сайн байна уу?",
    "pron": "TA SAIN bai-NOO"
   },
   {
    "en": "I need a doctor",
    "loc": "Надад эмч хэрэгтэй байна",
    "pron": "NA-dad EMCH heh-REG-tei bai-na"
   },
   {
    "en": "Call the police",
    "loc": "Цагдаа дуудаарай",
    "pron": "TSAG-daa DOO-daa-rai"
   },
   {
    "en": "Left",
    "loc": "Зүүн",
    "pron": "ZUUN"
   },
   {
    "en": "Right",
    "loc": "Баруун",
    "pron": "ba-ROON"
   },
   {
    "en": "Where is the train station?",
    "loc": "Галт тэрэгний буудал хаана байдаг вэ?",
    "pron": "GALT te-REG-nii BOO-dal HAA-na bai-dag ve"
   },
   {
    "en": "How do I get to …?",
    "loc": "… руу яаж очих вэ?",
    "pron": "… ROO YAAJ O-chih ve"
   },
   {
    "en": "Delicious!",
    "loc": "Амттай байна!",
    "pron": "AMT-tai bai-na"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "нэг",
    "pron": "neg"
   },
   {
    "n": 2,
    "loc": "хоёр",
    "pron": "ho-YOR"
   },
   {
    "n": 3,
    "loc": "гурав",
    "pron": "GOO-rav"
   },
   {
    "n": 4,
    "loc": "дөрөв",
    "pron": "DUR-uv"
   },
   {
    "n": 5,
    "loc": "тав",
    "pron": "TAV"
   },
   {
    "n": 6,
    "loc": "зургаа",
    "pron": "ZOOR-gaa"
   },
   {
    "n": 7,
    "loc": "долоо",
    "pron": "DO-loo"
   },
   {
    "n": 8,
    "loc": "найм",
    "pron": "NAIM"
   },
   {
    "n": 9,
    "loc": "ес",
    "pron": "YUS"
   },
   {
    "n": 10,
    "loc": "арав",
    "pron": "A-rav"
   }
  ]
 },
 "Georgian": {
  "native": "ქართული",
  "phrases": [
   {
    "en": "Hello",
    "loc": "გამარჯობა",
    "pron": "gah-mar-JO-bah"
   },
   {
    "en": "Goodbye",
    "loc": "ნახვამდის",
    "pron": "nakh-VAM-dis"
   },
   {
    "en": "Please",
    "loc": "გთხოვთ",
    "pron": "g-TKHOVT"
   },
   {
    "en": "Thank you",
    "loc": "გმადლობთ",
    "pron": "g-MAD-lobt"
   },
   {
    "en": "You're welcome",
    "loc": "არაფრის",
    "pron": "a-RAF-ris"
   },
   {
    "en": "Yes",
    "loc": "კი",
    "pron": "kee (also 'diakh' — დიახ, more formal)"
   },
   {
    "en": "No",
    "loc": "არა",
    "pron": "AH-rah"
   },
   {
    "en": "Excuse me",
    "loc": "უკაცრავად",
    "pron": "oo-KATS-ra-vad"
   },
   {
    "en": "Sorry",
    "loc": "ბოდიში",
    "pron": "BO-dee-shee"
   },
   {
    "en": "Do you speak English?",
    "loc": "ინგლისურად ლაპარაკობთ?",
    "pron": "ing-lee-SOO-rad la-pa-ra-KOBT?"
   },
   {
    "en": "I don't understand",
    "loc": "არ მესმის",
    "pron": "ar MES-mis"
   },
   {
    "en": "Help!",
    "loc": "მიშველეთ!",
    "pron": "mee-SHVE-let!"
   },
   {
    "en": "How much is this?",
    "loc": "ეს რა ღირს?",
    "pron": "es ra GHEERS?"
   },
   {
    "en": "Where is the toilet?",
    "loc": "სად არის ტუალეტი?",
    "pron": "sad AH-ris too-a-LE-tee?"
   },
   {
    "en": "I would like this",
    "loc": "ეს მინდა",
    "pron": "es MEEN-da"
   },
   {
    "en": "The bill, please",
    "loc": "ანგარიში, თუ შეიძლება",
    "pron": "an-ga-REE-shee, too SHE-eed-le-ba"
   },
   {
    "en": "Water",
    "loc": "წყალი",
    "pron": "TS'KA-lee"
   },
   {
    "en": "Good morning",
    "loc": "დილა მშვიდობისა",
    "pron": "DEE-la mshvee-DO-bee-sa"
   },
   {
    "en": "Good evening",
    "loc": "საღამო მშვიდობისა",
    "pron": "SA-gha-mo mshvee-DO-bee-sa"
   },
   {
    "en": "My name is …",
    "loc": "მე მქვია …",
    "pron": "me MKVEE-a …"
   },
   {
    "en": "How are you?",
    "loc": "როგორ ხართ?",
    "pron": "RO-gor KHART?"
   },
   {
    "en": "I need a doctor",
    "loc": "ექიმი მჭირდება",
    "pron": "E-kee-mee m-CHEER-de-ba"
   },
   {
    "en": "Call the police",
    "loc": "გამოიძახეთ პოლიცია",
    "pron": "ga-mo-ee-DZA-khet po-LEE-tsee-a"
   },
   {
    "en": "Left",
    "loc": "მარცხნივ",
    "pron": "mar-TSKHNEEV"
   },
   {
    "en": "Right",
    "loc": "მარჯვნივ",
    "pron": "mar-JVNEEV"
   },
   {
    "en": "Where is the train station?",
    "loc": "სად არის რკინიგზის სადგური?",
    "pron": "sad AH-ris r-kee-NEEG-zis SAD-goo-ree?"
   },
   {
    "en": "How do I get to …?",
    "loc": "როგორ მივიდე …?",
    "pron": "RO-gor mee-VEE-de …?"
   },
   {
    "en": "Delicious!",
    "loc": "გემრიელია!",
    "pron": "gem-ree-E-lee-a!"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "ერთი",
    "pron": "ER-tee"
   },
   {
    "n": 2,
    "loc": "ორი",
    "pron": "O-ree"
   },
   {
    "n": 3,
    "loc": "სამი",
    "pron": "SA-mee"
   },
   {
    "n": 4,
    "loc": "ოთხი",
    "pron": "OT-khee"
   },
   {
    "n": 5,
    "loc": "ხუთი",
    "pron": "KHOO-tee"
   },
   {
    "n": 6,
    "loc": "ექვსი",
    "pron": "EK-vsee"
   },
   {
    "n": 7,
    "loc": "შვიდი",
    "pron": "SHVEE-dee"
   },
   {
    "n": 8,
    "loc": "რვა",
    "pron": "r-VA"
   },
   {
    "n": 9,
    "loc": "ცხრა",
    "pron": "ts-KHRA"
   },
   {
    "n": 10,
    "loc": "ათი",
    "pron": "AH-tee"
   }
  ]
 },
 "Armenian": {
  "native": "Հայերեն",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Բարև Ձեզ",
    "pron": "bah-REV dzez"
   },
   {
    "en": "Goodbye",
    "loc": "Ցտեսություն",
    "pron": "tsuh-teh-soo-TYOON"
   },
   {
    "en": "Please",
    "loc": "Խնդրում եմ",
    "pron": "khun-DROOM em"
   },
   {
    "en": "Thank you",
    "loc": "Շնորհակալություն",
    "pron": "shnor-ha-ka-loo-TYOON"
   },
   {
    "en": "You're welcome",
    "loc": "Խնդրեմ",
    "pron": "khun-DREM"
   },
   {
    "en": "Yes",
    "loc": "Այո",
    "pron": "ah-YO"
   },
   {
    "en": "No",
    "loc": "Ոչ",
    "pron": "voch"
   },
   {
    "en": "Excuse me",
    "loc": "Ներեցեք",
    "pron": "neh-reh-TSEK"
   },
   {
    "en": "Sorry",
    "loc": "Կներեք",
    "pron": "kuh-neh-REK"
   },
   {
    "en": "Do you speak English?",
    "loc": "Դուք խոսո՞ւմ եք անգլերեն",
    "pron": "dook kho-SOOM ek ang-leh-REN"
   },
   {
    "en": "I don't understand",
    "loc": "Ես չեմ հասկանում",
    "pron": "yes chem has-ka-NOOM"
   },
   {
    "en": "Help!",
    "loc": "Օգնությո՛ւն",
    "pron": "og-noo-TYOON"
   },
   {
    "en": "How much is this?",
    "loc": "Սա ի՞նչ արժե",
    "pron": "sah inch ar-ZHEH"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Որտե՞ղ է զուգարանը",
    "pron": "vor-TEGH eh zoo-ga-RA-nuh"
   },
   {
    "en": "I would like this",
    "loc": "Ես սա կուզենայի",
    "pron": "yes sah koo-zeh-NA-yee"
   },
   {
    "en": "The bill, please",
    "loc": "Հաշիվը, խնդրում եմ",
    "pron": "ha-SHI-vuh, khun-DROOM em"
   },
   {
    "en": "Water",
    "loc": "Ջուր",
    "pron": "joor"
   },
   {
    "en": "Good morning",
    "loc": "Բարի լույս",
    "pron": "BA-ree LOOYS"
   },
   {
    "en": "Good evening",
    "loc": "Բարի երեկո",
    "pron": "BA-ree yeh-reh-KO"
   },
   {
    "en": "My name is …",
    "loc": "Իմ անունը … է",
    "pron": "eem ah-NOO-nuh … eh"
   },
   {
    "en": "How are you?",
    "loc": "Ինչպե՞ս եք",
    "pron": "inch-PES ek"
   },
   {
    "en": "I need a doctor",
    "loc": "Ինձ բժիշկ է պետք",
    "pron": "eendz buh-ZHISHK eh petk"
   },
   {
    "en": "Call the police",
    "loc": "Ոստիկանություն կանչեք",
    "pron": "vos-ti-ka-noo-TYOON kan-CHEK"
   },
   {
    "en": "Left",
    "loc": "Ձախ",
    "pron": "dzakh"
   },
   {
    "en": "Right",
    "loc": "Աջ",
    "pron": "aj"
   },
   {
    "en": "Where is the train station?",
    "loc": "Որտե՞ղ է երկաթուղային կայարանը",
    "pron": "vor-TEGH eh yer-ka-too-gha-YIN ka-ya-RA-nuh"
   },
   {
    "en": "How do I get to …?",
    "loc": "Ինչպե՞ս հասնեմ …",
    "pron": "inch-PES has-NEM …"
   },
   {
    "en": "Delicious!",
    "loc": "Համե՛ղ է",
    "pron": "ha-MEGH eh"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "մեկ",
    "pron": "mek"
   },
   {
    "n": 2,
    "loc": "երկու",
    "pron": "yer-KOO"
   },
   {
    "n": 3,
    "loc": "երեք",
    "pron": "yeh-REK"
   },
   {
    "n": 4,
    "loc": "չորս",
    "pron": "chors"
   },
   {
    "n": 5,
    "loc": "հինգ",
    "pron": "hing"
   },
   {
    "n": 6,
    "loc": "վեց",
    "pron": "vets"
   },
   {
    "n": 7,
    "loc": "յոթ",
    "pron": "yot"
   },
   {
    "n": 8,
    "loc": "ութ",
    "pron": "oot"
   },
   {
    "n": 9,
    "loc": "ինը",
    "pron": "EE-nuh"
   },
   {
    "n": 10,
    "loc": "տասը",
    "pron": "TA-suh"
   }
  ]
 },
 "Azerbaijani": {
  "native": "Azərbaycan dili",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Salam",
    "pron": "sah-LAHM"
   },
   {
    "en": "Goodbye",
    "loc": "Sağ olun",
    "pron": "sah oh-LOON"
   },
   {
    "en": "Please",
    "loc": "Zəhmət olmasa",
    "pron": "zeh-MET ol-mah-SAH"
   },
   {
    "en": "Thank you",
    "loc": "Təşəkkür edirəm",
    "pron": "teh-shek-KYUR eh-dee-REM"
   },
   {
    "en": "You're welcome",
    "loc": "Dəyməz",
    "pron": "dey-MEZ"
   },
   {
    "en": "Yes",
    "loc": "Bəli",
    "pron": "BEH-lee"
   },
   {
    "en": "No",
    "loc": "Xeyr",
    "pron": "KHEYR"
   },
   {
    "en": "Excuse me",
    "loc": "Bağışlayın",
    "pron": "bah-guhsh-lah-YUHN"
   },
   {
    "en": "Sorry",
    "loc": "Üzr istəyirəm",
    "pron": "UYZR is-teh-yee-REM"
   },
   {
    "en": "Do you speak English?",
    "loc": "İngiliscə danışırsınız?",
    "pron": "in-gee-LEES-jeh dah-nuh-shuhr-suh-NUHZ"
   },
   {
    "en": "I don't understand",
    "loc": "Başa düşmürəm",
    "pron": "bah-SHAH dyush-myu-REM"
   },
   {
    "en": "Help!",
    "loc": "Kömək edin!",
    "pron": "kuh-MEK eh-DEEN"
   },
   {
    "en": "How much is this?",
    "loc": "Bu neçəyədir?",
    "pron": "boo neh-cheh-yeh-DEER"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Tualet haradadır?",
    "pron": "too-ah-LET hah-rah-dah-DUHR"
   },
   {
    "en": "I would like this",
    "loc": "Mən bunu istəyirəm",
    "pron": "men boo-NOO is-teh-yee-REM"
   },
   {
    "en": "The bill, please",
    "loc": "Hesab, zəhmət olmasa",
    "pron": "heh-SAHB, zeh-MET ol-mah-SAH"
   },
   {
    "en": "Water",
    "loc": "Su",
    "pron": "SOO"
   },
   {
    "en": "Good morning",
    "loc": "Sabahınız xeyir",
    "pron": "sah-bah-huh-NUHZ KHEY-eer"
   },
   {
    "en": "Good evening",
    "loc": "Axşamınız xeyir",
    "pron": "akh-shah-muh-NUHZ KHEY-eer"
   },
   {
    "en": "My name is …",
    "loc": "Mənim adım …",
    "pron": "meh-NEEM ah-DUHM …"
   },
   {
    "en": "How are you?",
    "loc": "Necəsiniz?",
    "pron": "neh-jeh-see-NEEZ"
   },
   {
    "en": "I need a doctor",
    "loc": "Mənə həkim lazımdır",
    "pron": "meh-NEH heh-KEEM lah-zuhm-DUHR"
   },
   {
    "en": "Call the police",
    "loc": "Polisi çağırın",
    "pron": "po-lee-SEE chah-guh-RUHN"
   },
   {
    "en": "Left",
    "loc": "Sol",
    "pron": "SOL"
   },
   {
    "en": "Right",
    "loc": "Sağ",
    "pron": "SAH"
   },
   {
    "en": "Where is the train station?",
    "loc": "Qatar stansiyası haradadır?",
    "pron": "kah-TAHR stahn-see-yah-SUH hah-rah-dah-DUHR"
   },
   {
    "en": "How do I get to …?",
    "loc": "… necə gedə bilərəm?",
    "pron": "… neh-JEH geh-DEH bee-leh-REM"
   },
   {
    "en": "Delicious!",
    "loc": "Dadlıdır!",
    "pron": "dahd-luh-DUHR"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "bir",
    "pron": "BEER"
   },
   {
    "n": 2,
    "loc": "iki",
    "pron": "ee-KEE"
   },
   {
    "n": 3,
    "loc": "üç",
    "pron": "UYCH"
   },
   {
    "n": 4,
    "loc": "dörd",
    "pron": "DURD"
   },
   {
    "n": 5,
    "loc": "beş",
    "pron": "BESH"
   },
   {
    "n": 6,
    "loc": "altı",
    "pron": "ahl-TUH"
   },
   {
    "n": 7,
    "loc": "yeddi",
    "pron": "yed-DEE"
   },
   {
    "n": 8,
    "loc": "səkkiz",
    "pron": "sek-KEEZ"
   },
   {
    "n": 9,
    "loc": "doqquz",
    "pron": "dok-KOOZ"
   },
   {
    "n": 10,
    "loc": "on",
    "pron": "ON"
   }
  ]
 },
 "Kazakh": {
  "native": "Қазақ тілі",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Сәлеметсіз бе",
    "pron": "sa-le-met-SIZ be"
   },
   {
    "en": "Goodbye",
    "loc": "Сау болыңыз",
    "pron": "saw bo-luh-NUHZ"
   },
   {
    "en": "Please",
    "loc": "Өтінемін",
    "pron": "uh-ti-ne-MIN"
   },
   {
    "en": "Thank you",
    "loc": "Рахмет",
    "pron": "rakh-MET"
   },
   {
    "en": "You're welcome",
    "loc": "Оқасы жоқ",
    "pron": "o-ka-suh ZHOK"
   },
   {
    "en": "Yes",
    "loc": "Иә",
    "pron": "ee-YA"
   },
   {
    "en": "No",
    "loc": "Жоқ",
    "pron": "ZHOK"
   },
   {
    "en": "Excuse me",
    "loc": "Кешіріңіз",
    "pron": "ke-shi-ri-NIZ"
   },
   {
    "en": "Sorry",
    "loc": "Кешірім сұраймын",
    "pron": "ke-shi-RIM suh-RAI-muhn"
   },
   {
    "en": "Do you speak English?",
    "loc": "Сіз ағылшынша сөйлейсіз бе?",
    "pron": "siz a-guhl-shuhn-SHA suoy-LAY-siz be"
   },
   {
    "en": "I don't understand",
    "loc": "Мен түсінбеймін",
    "pron": "men tu-sin-BAY-min"
   },
   {
    "en": "Help!",
    "loc": "Көмектесіңіз!",
    "pron": "kuh-mek-te-si-NIZ"
   },
   {
    "en": "How much is this?",
    "loc": "Бұл қанша тұрады?",
    "pron": "buhl kan-SHA tuh-ra-DUH"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Дәретхана қайда?",
    "pron": "da-ret-kha-NA KAI-da"
   },
   {
    "en": "I would like this",
    "loc": "Маған осы керек",
    "pron": "ma-GAN o-SUH ke-REK"
   },
   {
    "en": "The bill, please",
    "loc": "Шотты әкеліңізші",
    "pron": "SHOT-tuh a-ke-li-niz-SHEE"
   },
   {
    "en": "Water",
    "loc": "Су",
    "pron": "soo"
   },
   {
    "en": "Good morning",
    "loc": "Қайырлы таң",
    "pron": "kai-uhr-LUH TANG"
   },
   {
    "en": "Good evening",
    "loc": "Қайырлы кеш",
    "pron": "kai-uhr-LUH KESH"
   },
   {
    "en": "My name is …",
    "loc": "Менің атым …",
    "pron": "me-NIN a-TUHM …"
   },
   {
    "en": "How are you?",
    "loc": "Қалыңыз қалай?",
    "pron": "ka-luh-NUHZ ka-LAI"
   },
   {
    "en": "I need a doctor",
    "loc": "Маған дәрігер керек",
    "pron": "ma-GAN da-ri-GER ke-REK"
   },
   {
    "en": "Call the police",
    "loc": "Полицияны шақырыңыз",
    "pron": "po-LI-tsi-ya-nuh sha-kuh-ruh-NUHZ"
   },
   {
    "en": "Left",
    "loc": "Сол",
    "pron": "sol"
   },
   {
    "en": "Right",
    "loc": "Оң",
    "pron": "ong"
   },
   {
    "en": "Where is the train station?",
    "loc": "Теміржол вокзалы қайда?",
    "pron": "te-mir-ZHOL vok-za-LUH KAI-da"
   },
   {
    "en": "How do I get to …?",
    "loc": "… қалай баруға болады?",
    "pron": "… ka-LAI ba-ru-GA bo-la-DUH"
   },
   {
    "en": "Delicious!",
    "loc": "Дәмді!",
    "pron": "dam-DI"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "бір",
    "pron": "bir"
   },
   {
    "n": 2,
    "loc": "екі",
    "pron": "ye-KI"
   },
   {
    "n": 3,
    "loc": "үш",
    "pron": "ush"
   },
   {
    "n": 4,
    "loc": "төрт",
    "pron": "turt"
   },
   {
    "n": 5,
    "loc": "бес",
    "pron": "bes"
   },
   {
    "n": 6,
    "loc": "алты",
    "pron": "al-TUH"
   },
   {
    "n": 7,
    "loc": "жеті",
    "pron": "zhe-TI"
   },
   {
    "n": 8,
    "loc": "сегіз",
    "pron": "se-GIZ"
   },
   {
    "n": 9,
    "loc": "тоғыз",
    "pron": "to-GUHZ"
   },
   {
    "n": 10,
    "loc": "он",
    "pron": "on"
   }
  ]
 },
 "Albanian": {
  "native": "Shqip",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Përshëndetje",
    "pron": "per-shen-DET-yeh"
   },
   {
    "en": "Goodbye",
    "loc": "Mirupafshim",
    "pron": "mee-roo-PAHF-sheem"
   },
   {
    "en": "Please",
    "loc": "Ju lutem",
    "pron": "yoo LOO-tem"
   },
   {
    "en": "Thank you",
    "loc": "Faleminderit",
    "pron": "fah-leh-min-DEH-reet"
   },
   {
    "en": "You're welcome",
    "loc": "S'ka përse",
    "pron": "skah per-SEH"
   },
   {
    "en": "Yes",
    "loc": "Po",
    "pron": "poh"
   },
   {
    "en": "No",
    "loc": "Jo",
    "pron": "yoh"
   },
   {
    "en": "Excuse me",
    "loc": "Më falni",
    "pron": "muh FAHL-nee"
   },
   {
    "en": "Sorry",
    "loc": "Më vjen keq",
    "pron": "muh vyen kech"
   },
   {
    "en": "Do you speak English?",
    "loc": "A flisni anglisht?",
    "pron": "ah FLEES-nee ahn-GLEESHT"
   },
   {
    "en": "I don't understand",
    "loc": "Nuk kuptoj",
    "pron": "nook koop-TOY"
   },
   {
    "en": "Help!",
    "loc": "Ndihmë!",
    "pron": "n-DEE-muh"
   },
   {
    "en": "How much is this?",
    "loc": "Sa kushton kjo?",
    "pron": "sah koosh-TOHN kyoh"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Ku është tualeti?",
    "pron": "koo uhsht too-ah-LEH-tee"
   },
   {
    "en": "I would like this",
    "loc": "Do të doja këtë",
    "pron": "doh tuh DOH-yah kuh-TUH"
   },
   {
    "en": "The bill, please",
    "loc": "Faturën, ju lutem",
    "pron": "fah-TOO-ruhn, yoo LOO-tem"
   },
   {
    "en": "Water",
    "loc": "Ujë",
    "pron": "OO-yuh"
   },
   {
    "en": "Good morning",
    "loc": "Mirëmëngjes",
    "pron": "mee-ruh-muhn-JEHS"
   },
   {
    "en": "Good evening",
    "loc": "Mirëmbrëma",
    "pron": "mee-ruhm-BRUH-mah"
   },
   {
    "en": "My name is …",
    "loc": "Unë quhem …",
    "pron": "OO-nuh CHOO-hem …"
   },
   {
    "en": "How are you?",
    "loc": "Si jeni?",
    "pron": "see YEH-nee"
   },
   {
    "en": "I need a doctor",
    "loc": "Më duhet një mjek",
    "pron": "muh DOO-het nyuh myek"
   },
   {
    "en": "Call the police",
    "loc": "Thirrni policinë",
    "pron": "THEER-nee poh-lee-TSEE-nuh"
   },
   {
    "en": "Left",
    "loc": "Majtas",
    "pron": "MY-tahs"
   },
   {
    "en": "Right",
    "loc": "Djathtas",
    "pron": "DYAHTH-tahs"
   },
   {
    "en": "Where is the train station?",
    "loc": "Ku është stacioni i trenit?",
    "pron": "koo uhsht stah-tsee-OH-nee ee TREH-neet"
   },
   {
    "en": "How do I get to …?",
    "loc": "Si shkohet te …?",
    "pron": "see SHKOH-het teh …"
   },
   {
    "en": "Delicious!",
    "loc": "Shijshëm!",
    "pron": "SHEE-shuhm"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "një",
    "pron": "nyuh"
   },
   {
    "n": 2,
    "loc": "dy",
    "pron": "dee"
   },
   {
    "n": 3,
    "loc": "tre",
    "pron": "treh"
   },
   {
    "n": 4,
    "loc": "katër",
    "pron": "KAH-tuhr"
   },
   {
    "n": 5,
    "loc": "pesë",
    "pron": "PEH-suh"
   },
   {
    "n": 6,
    "loc": "gjashtë",
    "pron": "GYASH-tuh"
   },
   {
    "n": 7,
    "loc": "shtatë",
    "pron": "SHTAH-tuh"
   },
   {
    "n": 8,
    "loc": "tetë",
    "pron": "TEH-tuh"
   },
   {
    "n": 9,
    "loc": "nëntë",
    "pron": "NUHN-tuh"
   },
   {
    "n": 10,
    "loc": "dhjetë",
    "pron": "DHYEH-tuh"
   }
  ]
 },
 "Icelandic": {
  "native": "íslenska",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Halló",
    "pron": "HAH-loh"
   },
   {
    "en": "Goodbye",
    "loc": "Bless",
    "pron": "bless"
   },
   {
    "en": "Please",
    "loc": "Vinsamlegast",
    "pron": "VIN-sahm-leh-gahst"
   },
   {
    "en": "Thank you",
    "loc": "Takk fyrir",
    "pron": "tahk FIH-rir"
   },
   {
    "en": "You're welcome",
    "loc": "Ekkert að þakka",
    "pron": "EH-kert ath THAH-ka"
   },
   {
    "en": "Yes",
    "loc": "Já",
    "pron": "yow"
   },
   {
    "en": "No",
    "loc": "Nei",
    "pron": "nay"
   },
   {
    "en": "Excuse me",
    "loc": "Afsakið",
    "pron": "AHF-sah-kith"
   },
   {
    "en": "Sorry",
    "loc": "Fyrirgefðu",
    "pron": "FIH-rir-gyev-thu"
   },
   {
    "en": "Do you speak English?",
    "loc": "Talar þú ensku?",
    "pron": "TAH-lar thoo EN-sku"
   },
   {
    "en": "I don't understand",
    "loc": "Ég skil ekki",
    "pron": "yehg skil EH-ki"
   },
   {
    "en": "Help!",
    "loc": "Hjálp!",
    "pron": "hyowlp"
   },
   {
    "en": "How much is this?",
    "loc": "Hvað kostar þetta?",
    "pron": "kvath KOS-tar THEH-ta"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Hvar er klósettið?",
    "pron": "kvar er KLOH-seh-tith"
   },
   {
    "en": "I would like this",
    "loc": "Ég ætla að fá þetta",
    "pron": "yehg AYT-la ath fow THEH-ta"
   },
   {
    "en": "The bill, please",
    "loc": "Reikninginn, takk",
    "pron": "RAYK-ning-in tahk"
   },
   {
    "en": "Water",
    "loc": "Vatn",
    "pron": "vahtn"
   },
   {
    "en": "Good morning",
    "loc": "Góðan daginn",
    "pron": "GOH-than DY-in"
   },
   {
    "en": "Good evening",
    "loc": "Gott kvöld",
    "pron": "got kvurld"
   },
   {
    "en": "My name is …",
    "loc": "Ég heiti …",
    "pron": "yehg HAY-ti …"
   },
   {
    "en": "How are you?",
    "loc": "Hvernig hefur þú það?",
    "pron": "KVER-nig HEH-vur thoo thath"
   },
   {
    "en": "I need a doctor",
    "loc": "Ég þarf lækni",
    "pron": "yehg tharf LYE-kni"
   },
   {
    "en": "Call the police",
    "loc": "Hringdu á lögregluna",
    "pron": "HRING-du ow LURG-rehg-lu-na"
   },
   {
    "en": "Left",
    "loc": "Vinstri",
    "pron": "VIN-stri"
   },
   {
    "en": "Right",
    "loc": "Hægri",
    "pron": "HY-gri"
   },
   {
    "en": "Where is the train station?",
    "loc": "Hvar er lestarstöðin?",
    "pron": "kvar er LES-tar-stur-thin"
   },
   {
    "en": "How do I get to …?",
    "loc": "Hvernig kemst ég til …?",
    "pron": "KVER-nig kemst yehg til …"
   },
   {
    "en": "Cheers!",
    "loc": "Skál!",
    "pron": "skowl"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "einn",
    "pron": "aydn"
   },
   {
    "n": 2,
    "loc": "tveir",
    "pron": "tvayr"
   },
   {
    "n": 3,
    "loc": "þrír",
    "pron": "threer"
   },
   {
    "n": 4,
    "loc": "fjórir",
    "pron": "FYOH-rir"
   },
   {
    "n": 5,
    "loc": "fimm",
    "pron": "fim"
   },
   {
    "n": 6,
    "loc": "sex",
    "pron": "seks"
   },
   {
    "n": 7,
    "loc": "sjö",
    "pron": "syur"
   },
   {
    "n": 8,
    "loc": "átta",
    "pron": "OW-ta"
   },
   {
    "n": 9,
    "loc": "níu",
    "pron": "NEE-u"
   },
   {
    "n": 10,
    "loc": "tíu",
    "pron": "TEE-u"
   }
  ]
 },
 "Malagasy": {
  "native": "Malagasy",
  "phrases": [
   {
    "en": "Hello",
    "loc": "Manao ahoana",
    "pron": "mah-NOW ah-OO-nah"
   },
   {
    "en": "Goodbye",
    "loc": "Veloma",
    "pron": "veh-LOO-mah"
   },
   {
    "en": "Please",
    "loc": "Azafady",
    "pron": "ah-zah-FAH-dee"
   },
   {
    "en": "Thank you",
    "loc": "Misaotra",
    "pron": "mee-SOW-trah"
   },
   {
    "en": "You're welcome",
    "loc": "Tsy misy fisaorana",
    "pron": "tsee MEE-see fee-sow-RAH-nah"
   },
   {
    "en": "Yes",
    "loc": "Eny",
    "pron": "EH-nee"
   },
   {
    "en": "No",
    "loc": "Tsia",
    "pron": "TSEE-ah"
   },
   {
    "en": "Excuse me",
    "loc": "Azafady",
    "pron": "ah-zah-FAH-dee"
   },
   {
    "en": "Sorry",
    "loc": "Miala tsiny",
    "pron": "mee-AH-lah TSEE-nee"
   },
   {
    "en": "Do you speak English?",
    "loc": "Miteny anglisy ve ianao?",
    "pron": "mee-TEHN ahn-GLEE-see veh ya-NOW"
   },
   {
    "en": "I don't understand",
    "loc": "Tsy azoko",
    "pron": "tsee AH-zoo-koo"
   },
   {
    "en": "Help!",
    "loc": "Vonjeo!",
    "pron": "voon-JEH-oo"
   },
   {
    "en": "How much is this?",
    "loc": "Ohatrinona ity?",
    "pron": "oo-ah-TREE-noo-nah EE-tee"
   },
   {
    "en": "Where is the toilet?",
    "loc": "Aiza ny trano fidiovana?",
    "pron": "AH-ee-zah nee TRAH-noo fee-dee-OO-vah-nah"
   },
   {
    "en": "I would like this",
    "loc": "Tiako ity",
    "pron": "TEE-ah-koo EE-tee"
   },
   {
    "en": "The bill, please",
    "loc": "Ny kaonty azafady",
    "pron": "nee KOWN-tee ah-zah-FAH-dee"
   },
   {
    "en": "Water",
    "loc": "Rano",
    "pron": "RAH-noo"
   },
   {
    "en": "Good morning",
    "loc": "Manao ahoana ny maraina",
    "pron": "mah-NOW ah-OO-nah nee mah-RAH-ee-nah"
   },
   {
    "en": "Good evening",
    "loc": "Manao ahoana ny hariva",
    "pron": "mah-NOW ah-OO-nah nee hah-REE-vah"
   },
   {
    "en": "My name is …",
    "loc": "Ny anarako dia …",
    "pron": "nee ah-NAH-rah-koo dee-ah …"
   },
   {
    "en": "How are you?",
    "loc": "Manao ahoana ianao?",
    "pron": "mah-NOW ah-OO-nah ya-NOW"
   },
   {
    "en": "I need a doctor",
    "loc": "Mila dokotera aho",
    "pron": "MEE-lah doo-koo-TEH-rah ah-oo"
   },
   {
    "en": "Call the police",
    "loc": "Antsoy ny polisy",
    "pron": "ahn-TSOO-ee nee poo-LEE-see"
   },
   {
    "en": "Left",
    "loc": "Havia",
    "pron": "hah-VEE-ah"
   },
   {
    "en": "Right",
    "loc": "Havanana",
    "pron": "hah-vah-NAH-nah"
   },
   {
    "en": "Where is the train station?",
    "loc": "Aiza ny gara?",
    "pron": "AH-ee-zah nee GAH-rah"
   },
   {
    "en": "How do I get to …?",
    "loc": "Ahoana no andehanana ho any …?",
    "pron": "ah-OO-nah noo ahn-deh-HAH-nah-nah hoo AH-nee …"
   },
   {
    "en": "Delicious!",
    "loc": "Matsiro!",
    "pron": "mah-TSEE-roo"
   }
  ],
  "numbers": [
   {
    "n": 1,
    "loc": "iray",
    "pron": "ee-RAH-ee"
   },
   {
    "n": 2,
    "loc": "roa",
    "pron": "ROO-ah"
   },
   {
    "n": 3,
    "loc": "telo",
    "pron": "TEH-loo"
   },
   {
    "n": 4,
    "loc": "efatra",
    "pron": "EH-fah-trah"
   },
   {
    "n": 5,
    "loc": "dimy",
    "pron": "DEE-mee"
   },
   {
    "n": 6,
    "loc": "enina",
    "pron": "EH-nee-nah"
   },
   {
    "n": 7,
    "loc": "fito",
    "pron": "FEE-too"
   },
   {
    "n": 8,
    "loc": "valo",
    "pron": "VAH-loo"
   },
   {
    "n": 9,
    "loc": "sivy",
    "pron": "SEE-vee"
   },
   {
    "n": 10,
    "loc": "folo",
    "pron": "FOO-loo"
   }
  ]
 }
};

// ─── Country Intelligence — static briefs for all ~195 countries (generated, neutrality-reviewed) ───
const COUNTRY_INTEL = {
 "AL": {
  "iso2": "AL",
  "origin": "Albania declared independence from the Ottoman Empire in 1912 after roughly four centuries of Ottoman rule, then endured Italian and German occupation before becoming one of the most isolated Communist states in Europe under Enver Hoxha from 1944 to 1991. The post-Communist transition, mass emigration, and rapid recent opening to tourism shape the country today.",
  "character": "Albanians are known for fierce hospitality codified in the traditional Kanun, and for a striking religious harmony among Muslim, Orthodox, and Catholic communities. Visitors are often surprised by the Riviera's turquoise coastline, the warmth toward strangers, and the thousands of concrete bunkers still dotting the landscape from the Hoxha era.",
  "complexity": "The legacy of decades of extreme isolation and the more recent waves of emigration mean visitors will encounter both rapid modernization and deep generational differences in outlook within the same family or town.",
  "bestFor": [
   "Untouched Riviera coastline",
   "Ottoman-era towns like Berat and Gjirokaster",
   "Genuine, warm hospitality"
  ],
  "notKnown": "Albanians take pride in their ancient Illyrian heritage and a language, Albanian, that forms its own distinct branch of the Indo-European family with no close living relatives."
 },
 "AD": {
  "iso2": "AD",
  "origin": "Andorra traces its statehood to a 1278 feudal charter that established a co-principality jointly overseen by a Spanish bishop and a French count, an arrangement that survives today with the President of France and the Bishop of Urgell as co-princes. The microstate modernized rapidly in the twentieth century around tourism and commerce, adopting its first written constitution only in 1993.",
  "character": "Andorrans maintain a quiet Pyrenean identity rooted in mountain village life, Catalan language, and a tradition of neutrality and self-reliance. Visitors are often surprised that this tiny tax-light enclave blends serious alpine skiing and duty-free shopping with genuinely remote high-valley hiking.",
  "complexity": "Andorra's prosperity rests heavily on cross-border shopping and tourism, leaving thoughtful visitors to notice the tension between commercial development in the valleys and the preservation of fragile mountain ecology and traditional culture.",
  "bestFor": [
   "Pyrenean skiing and snowboarding",
   "Duty-free shopping",
   "High-altitude hiking and thermal spas"
  ],
  "notKnown": "Andorra has no airport, no national currency of its own, and for centuries paid a symbolic feudal tribute to its co-princes, a custom that endured into the modern era."
 },
 "AT": {
  "iso2": "AT",
  "origin": "Modern Austria emerged from the collapse of the Austro-Hungarian Empire in 1918, was annexed by Nazi Germany in 1938, and re-established its sovereignty in 1955 under a State Treaty that committed it to permanent neutrality. Its imperial Habsburg past and Cold War position between blocs continue to shape its diplomacy and self-image.",
  "character": "Austrians cultivate a refined identity built around music, coffee-house culture, and a deep relationship with their alpine landscape. Visitors are often surprised that beyond Vienna's imperial grandeur lies an outdoor culture of hiking, lakes, and skiing that locals prize at least as highly.",
  "complexity": "Austria continues to work through the nuances of its twentieth-century history, including the long-debated question of its role during the Nazi annexation, which thoughtful visitors will find addressed with increasing candor in its museums and public discourse.",
  "bestFor": [
   "Classical music heritage",
   "Alpine skiing and lakes",
   "Viennese coffee-house and cafe culture"
  ],
  "notKnown": "Austrians take quiet pride in a vast network of mountain huts and a near-universal habit of hiking, with even city dwellers often holding lifelong memberships in alpine clubs."
 },
 "BY": {
  "iso2": "BY",
  "origin": "Belarus declared independence in 1991 following the dissolution of the Soviet Union, having previously been a constituent Soviet republic that bore catastrophic losses in the Second World War. A strong continuity with Soviet-era institutions and close ties with Russia shape its governance and economy today.",
  "character": "Belarusians often describe themselves as measured, resilient, and quietly proud, with a culture of orderly cities, well-kept public spaces, and deep forests and wetlands. Visitors are frequently surprised by the cleanliness and calm of Minsk and the extent of preserved primeval woodland in the countryside.",
  "complexity": "Belarus has experienced significant political contestation, and visitors should understand that public discussion of governance and recent elections remains sensitive, with differing accounts inside and outside the country.",
  "bestFor": [
   "Primeval forest in Belavezhskaya Pushcha",
   "Soviet-era architecture and history",
   "Orderly, walkable Minsk"
  ],
  "notKnown": "Belarus is home to one of Europe's last and largest remnants of primeval lowland forest, sheltering the continent's heaviest land mammal, the European bison."
 },
 "BE": {
  "iso2": "BE",
  "origin": "Belgium gained independence from the Netherlands in 1830 and was constructed as a constitutional monarchy bridging Dutch-speaking and French-speaking populations. Successive state reforms have transformed it into a complex federal system, which together with its hosting of major European Union institutions shapes its identity today.",
  "character": "Belgians tend toward understatement, pragmatism, and a wry sense of humor, taking deep pride in beer, chocolate, and a remarkable density of medieval and Art Nouveau architecture. Visitors are often surprised that a small country contains such distinct linguistic regions, each with its own media, parties, and cultural life.",
  "complexity": "The relationship between Dutch-speaking Flanders, French-speaking Wallonia, and bilingual Brussels involves long-standing debates over autonomy and identity that thoughtful visitors will find shape much of national politics.",
  "bestFor": [
   "World-class beer culture",
   "Medieval city centers like Bruges and Ghent",
   "Chocolate and fine cuisine"
  ],
  "notKnown": "Belgians take pride in a culinary heritage that includes inventing the modern fried potato and a UNESCO-recognized beer culture spanning hundreds of distinct traditional styles."
 },
 "BA": {
  "iso2": "BA",
  "origin": "Bosnia and Herzegovina emerged as an independent state from the breakup of Yugoslavia in 1992 and endured a devastating war until the 1995 Dayton Agreement, which established its current structure of two entities and a tripartite presidency. That post-war constitutional framework and a layered Ottoman and Austro-Hungarian heritage shape the country today.",
  "character": "Bosnians are known for warm sociability, strong coffee rituals, and a blended cultural landscape where mosques, churches, and synagogues stand within sight of one another. Visitors are often surprised by Sarajevo's atmospheric mix of Ottoman bazaar and Habsburg boulevards, and by the dramatic green river canyons of the interior.",
  "complexity": "The country's complex post-war political structure reflects unresolved questions among its constituent peoples, and visitors will encounter differing memories and narratives of the 1990s conflict that deserve to be heard with care.",
  "bestFor": [
   "Ottoman heritage in Sarajevo and Mostar",
   "Dramatic river canyons and rafting",
   "Rich coffee and cafe culture"
  ],
  "notKnown": "Locals take pride in Sarajevo's long history of religious coexistence, symbolized by an Ottoman mosque, Orthodox and Catholic churches, and a synagogue all within a few minutes' walk."
 },
 "BG": {
  "iso2": "BG",
  "origin": "Bulgaria traces its statehood to the founding of the First Bulgarian Empire in 681, endured nearly five centuries of Ottoman rule, and re-emerged as a modern state in the late nineteenth century before a Communist period that ended in 1989. Its deep Thracian, Byzantine, and Ottoman layers, along with EU membership since 2007, shape the country today.",
  "character": "Bulgarians blend a strong Orthodox cultural heritage with a relaxed, hospitable temperament and a renowned culinary and folk-music tradition. Visitors are often surprised by the diversity of landscapes, from Black Sea beaches to high Balkan and Rila mountain ranges, and by the head-shake that conventionally signals yes.",
  "complexity": "Bulgaria carries both pride in its medieval golden ages and a candid reckoning with its Ottoman and Communist periods, leaving visitors to navigate layered and sometimes competing historical memories.",
  "bestFor": [
   "Rila and Pirin mountain monasteries",
   "Black Sea coastline",
   "Thracian and Roman archaeology"
  ],
  "notKnown": "Bulgarians take pride in giving the world the Cyrillic alphabet, developed by the disciples of Saints Cyril and Methodius in the medieval Bulgarian state."
 },
 "HR": {
  "iso2": "HR",
  "origin": "Croatia declared independence from Yugoslavia in 1991 and secured it after a war that lasted until 1995, having earlier histories within the Habsburg Empire and a medieval kingdom. EU membership since 2013, adoption of the euro, and a tourism-driven economy shape the country today.",
  "character": "Croatians take pride in a long Adriatic seafaring tradition, Mediterranean cuisine, and a cultural identity that bridges Central Europe and the Balkans. Visitors are often surprised by the sheer number of islands, the clarity of the sea, and the contrast between coastal Venetian-influenced towns and a green, castle-dotted interior.",
  "complexity": "The 1990s war remains within living memory, and visitors will find that its legacy and differing regional narratives are addressed openly in some places and more quietly in others.",
  "bestFor": [
   "Adriatic islands and sailing",
   "Walled cities like Dubrovnik and Split",
   "Plitvice and Krka waterfalls"
  ],
  "notKnown": "Croatians take pride in the necktie, derived from the scarves worn by seventeenth-century Croatian soldiers, which gave the cravat its name across Europe."
 },
 "CY": {
  "iso2": "CY",
  "origin": "Cyprus gained independence from Britain in 1960, and since 1974 the island has been effectively divided, with the Republic of Cyprus in the south, internationally recognized, and a Turkish-administered north recognized only by Turkey. This division, alongside Greek and Turkish Cypriot heritage and EU membership since 2004, shapes the island today.",
  "character": "Cypriots are known for relaxed Mediterranean hospitality, a strong cafe and meze food culture, and pride in an island layered with Greek, Roman, Byzantine, Venetian, and Ottoman history. Visitors are often surprised by year-round warmth, mountain villages within easy reach of beaches, and ancient sites woven into everyday life.",
  "complexity": "The island remains divided by a UN-monitored buffer zone, and visitors should understand the situation as an unresolved international dispute, describing it factually rather than endorsing the position of any party.",
  "bestFor": [
   "Ancient archaeology and mosaics",
   "Mediterranean beaches and meze dining",
   "Troodos mountain villages and frescoed churches"
  ],
  "notKnown": "Cypriots take pride in Commandaria, regarded as one of the world's oldest named wines still in production, with origins traced back millennia."
 },
 "CZ": {
  "iso2": "CZ",
  "origin": "The Czech Republic emerged from the peaceful 1993 dissolution of Czechoslovakia, itself created in 1918 from lands of the former Austro-Hungarian Empire with a deep Bohemian and Moravian heritage. The legacy of the 1989 Velvet Revolution that ended Communist rule, and EU membership since 2004, shape the country today.",
  "character": "Czechs are often characterized by dry wit, a love of beer and the pub as a social institution, and pride in a rich tradition of literature, music, and craftsmanship. Visitors are frequently surprised by the architectural depth beyond Prague, the world-leading per-capita beer consumption, and the country's strong design and puppetry traditions.",
  "complexity": "The Czech Republic balances pride in its democratic revival with a candid reckoning over its twentieth-century upheavals, including the wartime expulsions and the Communist era, which thoughtful visitors will find present in its museums and memorials.",
  "bestFor": [
   "Pilsner and pub culture",
   "Prague and Bohemian architecture",
   "Spa towns and classical music"
  ],
  "notKnown": "Czechs invented modern lager in Pilsen in 1842, and the word robot entered global vocabulary from a 1920 Czech play by Karel Capek."
 },
 "DK": {
  "iso2": "DK",
  "origin": "Denmark is one of Europe's oldest continuous monarchies, with roots in the Viking Age and a unified kingdom dating back over a thousand years, later contracting to its present borders through nineteenth and twentieth-century conflicts. A strong welfare-state model and consensus-oriented politics shape the country today.",
  "character": "Danes prize egalitarianism, design, cycling, and the cozy social warmth they call hygge, while maintaining a famously direct and informal manner. Visitors are often surprised by how thoroughly cycling, good design, and trust permeate daily life, and by the understated rather than showy nature of Danish affluence.",
  "complexity": "Denmark's relationship with its autonomous territories, Greenland and the Faroe Islands, involves ongoing and respectful debates about self-governance that a thoughtful visitor may wish to understand.",
  "bestFor": [
   "Design and architecture",
   "Cycling-friendly cities",
   "New Nordic cuisine"
  ],
  "notKnown": "Danes take pride in the Faroe Islands and Greenland as self-governing parts of the Kingdom, and in a flag, the Dannebrog, often cited as the oldest continuously used national flag."
 },
 "EE": {
  "iso2": "EE",
  "origin": "Estonia first gained independence in 1918, was annexed by the Soviet Union in 1940, and restored its sovereignty in 1991 through the peaceful Singing Revolution. A Finnic linguistic identity, Baltic and Hanseatic heritage, and a celebrated leap into digital governance shape the country today.",
  "character": "Estonians are known for reserve, a deep bond with nature and song, and a pragmatic embrace of technology that earned the nickname e-Estonia. Visitors are often surprised by the contrast between Tallinn's medieval Old Town and one of the world's most advanced digital societies, and by the vast, quiet forests and bogs beyond the cities.",
  "complexity": "Estonia is home to a significant Russian-speaking minority, and questions of language, integration, and competing historical memory are nuances that a thoughtful visitor should approach with sensitivity.",
  "bestFor": [
   "Medieval Tallinn Old Town",
   "Digital and e-governance innovation",
   "Forests, bogs, and island nature"
  ],
  "notKnown": "Estonians take pride in a song festival tradition so central to identity that mass choral singing helped drive their non-violent path to independence."
 },
 "FI": {
  "iso2": "FI",
  "origin": "Finland declared independence from Russia in 1917 after centuries under Swedish and then Russian rule, and defended its sovereignty during the Second World War before charting a careful neutral course through the Cold War. A distinctive Finnic language, social trust, and a recent shift in security alignment shape the country today.",
  "character": "Finns are known for quiet self-reliance, honesty, a deep relationship with forests and lakes, and the near-sacred ritual of the sauna. Visitors are often surprised by the comfort Finns take in silence, the prevalence of saunas, and the seasonal extremes from the midnight sun to the polar night.",
  "complexity": "Finland balances pride in its independence with awareness of its long border and complex history with Russia, a context a thoughtful visitor will find informs much of national life.",
  "bestFor": [
   "Sauna culture",
   "Lakeland and forest wilderness",
   "Lapland, northern lights, and design"
  ],
  "notKnown": "Finns take pride in a sauna culture so central to life that the country has roughly as many saunas as it does people, and the tradition is UNESCO-recognized."
 },
 "FR": {
  "iso2": "FR",
  "origin": "France's identity coalesced over centuries from a medieval kingdom into a centralized state, decisively reshaped by the 1789 Revolution and the republican ideals of liberty, equality, and fraternity. Five successive republics, a colonial past, and a leading role in the European Union shape the country today.",
  "character": "The French take deep pride in language, cuisine, intellectual life, and a tradition of public debate and protest as civic expression. Visitors are often surprised by the country's regional diversity, from Breton coasts to Alpine peaks, and by how strongly food, conversation, and the rhythm of daily life are valued over haste.",
  "complexity": "France's commitment to a secular, unitary republican model coexists with ongoing public debate about how to integrate a diverse population and reckon with its colonial history, nuances a thoughtful visitor will find woven into contemporary discourse.",
  "bestFor": [
   "Cuisine and wine",
   "Art, museums, and architecture",
   "Diverse landscapes from Alps to Riviera"
  ],
  "notKnown": "The French take pride in a vast network of long-distance hiking trails, the Grandes Randonnees, spanning tens of thousands of kilometers across every region of the country."
 },
 "DE": {
  "iso2": "DE",
  "origin": "Germany unified as a nation-state in 1871, endured division into West and East after the Second World War, and reunified in 1990 following the fall of the Berlin Wall. A federal structure, a strong manufacturing economy, and a culture of candid remembrance of its twentieth-century history shape the country today.",
  "character": "Germans are often characterized by reliability, environmental consciousness, regional pride, and a strong tradition of engineering and craftsmanship. Visitors are frequently surprised by the country's federal diversity, the seriousness with which it confronts its own history, and the contrast between orderly cities and vast forests, vineyards, and castles.",
  "complexity": "Germany's culture of remembrance regarding the Nazi era is central to its public identity, and thoughtful visitors will find this reckoning treated with a seriousness and openness that reward respectful engagement.",
  "bestFor": [
   "Christmas markets and festivals",
   "Castles, forests, and river valleys",
   "Engineering, design, and museums"
  ],
  "notKnown": "Germans take pride in a beer purity law, the Reinheitsgebot of 1516, often cited as one of the world's oldest food-quality regulations still influencing brewing today."
 },
 "GR": {
  "iso2": "GR",
  "origin": "Modern Greece emerged from the 1821 War of Independence against Ottoman rule, with full sovereignty recognised in 1830, though its borders expanded through the early twentieth century to incorporate Macedonia, Crete and the islands. The legacy of classical antiquity, Byzantine Orthodoxy and a more recent twentieth-century history of war, dictatorship and rapid modernisation continue to shape national life.",
  "character": "Greek identity blends fierce regional pride with a deep sense of philotimo, an untranslatable ethic of honour and hospitality toward guests. Visitors expecting only ancient ruins are often surprised by how contemporary, urban and intensely social daily life is, with dinners beginning near midnight and conversation treated as a national art.",
  "complexity": "The naming dispute with neighbouring North Macedonia, formally settled by the 2018 Prespa Agreement, remains emotionally sensitive for many Greeks, especially in the northern region.",
  "bestFor": [
   "Island-hopping archipelago travel",
   "Layered classical and Byzantine heritage",
   "Late-night Mediterranean dining culture"
  ],
  "notKnown": "Greeks take quiet pride in their merchant shipping fleet, one of the largest in the world by tonnage, a maritime tradition far older than the modern state."
 },
 "HU": {
  "iso2": "HU",
  "origin": "The Hungarian state traces to the Magyar tribes who settled the Carpathian Basin around 895 and the crowning of King Stephen I in 1000, anchoring the kingdom in Western Christianity. The 1920 Treaty of Trianon, which reduced the kingdom's territory by roughly two-thirds, remains a defining reference point in the national consciousness.",
  "character": "Hungarians possess a distinctive Finno-Ugric language unrelated to its Slavic and Germanic neighbours, fostering a strong sense of cultural singularity. Visitors are often surprised by the depth of the café, thermal-bath and classical-music traditions, and by a national temperament that pairs warmth with a famously melancholic streak.",
  "complexity": "Memory of lost territories under the Trianon settlement still informs debates about national identity and relations with neighbouring states where Hungarian-speaking minorities live.",
  "bestFor": [
   "Historic thermal spa bathing",
   "Central European café and ruin-bar culture",
   "Tokaji and Eger wine regions"
  ],
  "notKnown": "Hungarians point with pride to an outsized record of scientific and mathematical achievement, including a remarkable concentration of Nobel laureates relative to population."
 },
 "IS": {
  "iso2": "IS",
  "origin": "Iceland was settled by Norse and Celtic peoples from the late ninth century and founded the Althing, often cited among the world's oldest parliaments, in 930. It remained under Norwegian then Danish rule for centuries before achieving full independence as a republic in 1944.",
  "character": "Icelandic identity is bound to a small, tightly connected population, a preserved Old Norse language and a literary heritage rooted in the medieval sagas. Visitors are frequently surprised by how cosmopolitan and design-conscious Reykjavik feels against a backdrop of raw volcanic wilderness.",
  "complexity": "The tension between record tourism numbers and the protection of fragile geothermal and glacial landscapes is an ongoing, openly debated balancing act.",
  "bestFor": [
   "Volcanic and glacial landscapes",
   "Northern Lights and midnight-sun seasons",
   "Geothermal energy and bathing"
  ],
  "notKnown": "Icelanders maintain a patronymic naming system rather than fixed family surnames, and a genealogical record so complete that many can trace ancestry back many centuries."
 },
 "IE": {
  "iso2": "IE",
  "origin": "Ireland's modern state arose from the 1916 Easter Rising and War of Independence, gaining self-government in 1922 and full republican status in 1949, with six northern counties remaining part of the United Kingdom. Centuries of British rule, the Great Famine and large-scale emigration profoundly shaped its society and global diaspora.",
  "character": "Irish identity prizes storytelling, music and a conversational wit, alongside a literary tradition disproportionate to the island's size. Visitors are often surprised by how rapidly Ireland transformed into a wealthy, globalised technology hub while retaining a strong sense of place and community.",
  "complexity": "The legacy of the Northern Ireland conflict and the open border that the Good Friday Agreement enabled remain sensitive matters that thoughtful visitors should approach with care.",
  "bestFor": [
   "Traditional music and pub culture",
   "Dramatic Atlantic coastal scenery",
   "Literary heritage and storytelling"
  ],
  "notKnown": "The Irish language, though spoken daily by a minority, holds the status of first official language and sustains living Gaeltacht communities along the western seaboard."
 },
 "IT": {
  "iso2": "IT",
  "origin": "Italy was unified as a single kingdom in 1861, completing the process with Rome in 1870, before becoming a republic by referendum in 1946 after the fall of fascism. Its identity remains powerfully regional, shaped by the legacy of independent city-states, the Roman Empire and the Renaissance.",
  "character": "Italian life elevates everyday rituals of food, family and the evening passeggiata into cornerstones of identity, with intense loyalty to one's home city or region. Visitors are often surprised by how sharply the country divides culturally and economically between north and south, and by how local cuisine varies village to village.",
  "complexity": "Persistent economic and developmental disparities between the wealthier north and the south remain a candid subject of national discussion.",
  "bestFor": [
   "Regional culinary traditions",
   "Renaissance and classical art",
   "Diverse landscapes from Alps to coast"
  ],
  "notKnown": "Italy holds one of the world's highest counts of UNESCO World Heritage sites, many in small towns far from the famous tourist circuits."
 },
 "XK": {
  "iso2": "XK",
  "origin": "Kosovo declared independence from Serbia in 2008 following the 1998 to 1999 conflict and a subsequent period of United Nations administration. Its status remains contested: it is recognised by many states but not by Serbia and several others, and it has a young society with one of Europe's youngest populations.",
  "character": "Kosovo's identity centres on a predominantly Albanian-speaking population alongside Serb and other communities, with strong traditions of hospitality and family. Visitors are often surprised by the energy of Pristina's youthful café scene and by Ottoman-era and Orthodox monastic heritage standing side by side.",
  "complexity": "Kosovo's sovereignty is recognised by some states and not by others, and relations between Belgrade and Pristina, including the status of Serb-majority communities, remain unresolved and are best described neutrally.",
  "bestFor": [
   "Youthful urban café culture",
   "Ottoman and Orthodox heritage",
   "Affordable mountain hiking in the Accursed Mountains"
  ],
  "notKnown": "Kosovo's medieval Serbian Orthodox monasteries and Ottoman-era mosques represent layered religious heritage that predates the modern political dispute by centuries."
 },
 "LV": {
  "iso2": "LV",
  "origin": "Latvia first declared independence in 1918, was occupied and annexed by the Soviet Union and Nazi Germany during the twentieth century, and restored its independence in 1991. It has since integrated firmly into the European Union and NATO while rebuilding its national institutions.",
  "character": "Latvian identity is anchored in a Baltic language, a deep folk-song tradition and a close relationship with forests and the sea. Visitors are often surprised by Riga's wealth of Art Nouveau architecture and by the quiet, reserved warmth of a culture that expresses itself powerfully through choral singing.",
  "complexity": "The status and integration of the sizeable Russian-speaking minority, including questions of language and citizenship, is a real and openly discussed dimension of national life.",
  "bestFor": [
   "Art Nouveau architecture in Riga",
   "Baltic coastline and pine forests",
   "Choral and folk-song traditions"
  ],
  "notKnown": "Latvians take great pride in the Song and Dance Celebration, a mass choral gathering of tens of thousands of singers recognised by UNESCO."
 },
 "LI": {
  "iso2": "LI",
  "origin": "Liechtenstein was created in 1719 within the Holy Roman Empire and became fully sovereign in 1806, remaining a constitutional monarchy under a single princely house. A customs and currency union with Switzerland since the early twentieth century continues to shape its economy today.",
  "character": "This tiny Alpine principality combines a hereditary monarchy with one of the world's highest standards of living, built on finance and precision manufacturing. Visitors are often surprised that the reigning prince retains substantial constitutional powers, unusual among modern European monarchies.",
  "complexity": "Its historical reputation as a low-tax financial centre has prompted reforms toward greater transparency that the country continues to navigate.",
  "bestFor": [
   "Alpine hiking and mountain villages",
   "A unique living principality",
   "Precision industry and philately heritage"
  ],
  "notKnown": "The princely family owns one of the most significant private art collections in the world, parts of which are displayed publicly in Vienna and Vaduz."
 },
 "LT": {
  "iso2": "LT",
  "origin": "Lithuania was a powerful medieval grand duchy that later joined Poland in a centuries-long commonwealth, declared modern independence in 1918, and restored it in 1990 as the first Soviet republic to do so. Its history as a once-vast European power and its later occupations strongly inform national memory.",
  "character": "Lithuanian identity rests on one of Europe's most archaic surviving Indo-European languages and a strong Catholic tradition shaped by resistance to occupation. Visitors are often surprised by Vilnius's expansive Baroque old town and by the country's blend of solemn historical memory with a creative, contemporary spirit.",
  "complexity": "The wartime history of Lithuania, including the near-total destruction of its once-large Jewish community, is a difficult past that the country continues to study and commemorate.",
  "bestFor": [
   "Baroque old town of Vilnius",
   "Curonian Spit dunes and Baltic coast",
   "Amber and folk craft traditions"
  ],
  "notKnown": "Lithuanians proudly note that their language is among the most conservative living Indo-European tongues, retaining features linguists compare to ancient Sanskrit."
 },
 "LU": {
  "iso2": "LU",
  "origin": "Luxembourg evolved from a tenth-century fortified county into a grand duchy confirmed by the Congress of Vienna in 1815, achieving full independence by treaty in 1867. A founding member of the European institutions, it has become a major financial and administrative centre of the Union.",
  "character": "Luxembourg is genuinely trilingual in Luxembourgish, French and German, with a population in which foreign residents form a very large share. Visitors are often surprised by the dramatic ravines and fortifications of the capital and by how a small state functions as a heavyweight in European finance and governance.",
  "complexity": "The country's prominence as a corporate and financial hub has drawn scrutiny over tax arrangements, prompting ongoing reform and adaptation.",
  "bestFor": [
   "Dramatic fortified capital city",
   "Multilingual European crossroads",
   "Ardennes castles and wine valleys"
  ],
  "notKnown": "Luxembourgish, long treated as a dialect, is a distinct national language with its own literature and standardised spelling that residents hold dear."
 },
 "MT": {
  "iso2": "MT",
  "origin": "Malta's strategic position made it a possession of successive powers, from the Knights of St John to Britain, before gaining independence in 1964 and becoming a republic in 1974. Its identity is shaped by this layered history and by Catholicism's central role in public life.",
  "character": "Maltese identity rests on a unique Semitic language written in Latin script, a fusion reflecting Arab, Italian and British influences. Visitors are often surprised by the density of prehistoric megalithic temples, some older than the Egyptian pyramids, on such a small archipelago.",
  "complexity": "Rapid growth in tourism, construction and financial services has raised candid debate about overdevelopment and environmental pressure on a small territory.",
  "bestFor": [
   "Prehistoric megalithic temples",
   "Fortified harbour cities",
   "Mediterranean diving and sea caves"
  ],
  "notKnown": "The Maltese language is the only Semitic language that is an official language of the European Union and the only one customarily written in the Latin alphabet."
 },
 "MD": {
  "iso2": "MD",
  "origin": "Moldova, historically part of the principality of Moldavia and later the Russian and Soviet empires, declared independence in 1991 amid the Soviet collapse. Its development is shaped by a strong Romanian linguistic and cultural heritage alongside Soviet-era legacies.",
  "character": "Moldovan life centres on rural traditions, a deep winemaking culture and close-knit village hospitality. Visitors are often surprised by the scale of the country's wine cellars and by the warmth extended in one of Europe's least-visited nations.",
  "complexity": "The breakaway region of Transnistria operates outside central government control and remains an unresolved situation that visitors should understand is governed differently and described without taking sides.",
  "bestFor": [
   "World-class underground wine cellars",
   "Authentic rural village life",
   "Off-the-beaten-path travel"
  ],
  "notKnown": "Moldova is home to some of the largest wine cellars in the world, with underground galleries stretching for many kilometres beneath the countryside."
 },
 "MC": {
  "iso2": "MC",
  "origin": "The Principality of Monaco has been ruled by the Grimaldi family since 1297 and secured its modern sovereignty through treaties with France in the nineteenth and twentieth centuries. The development of its casino and later its status as a tax haven transformed it into a centre of wealth and glamour.",
  "character": "Monaco packs extraordinary density and affluence into barely two square kilometres, with a constitutional monarchy and a population in which actual Monégasque citizens are a minority. Visitors are often surprised by how compact and vertical the principality is, and by the survival of an old town and Monégasque dialect amid the high-rises.",
  "complexity": "Monaco's role as a low-tax residence for the very wealthy generates ongoing international discussion about financial transparency.",
  "bestFor": [
   "Grand Prix motor racing",
   "Mediterranean luxury and yachting",
   "Belle Epoque casino architecture"
  ],
  "notKnown": "Native Monégasques, a minority in their own state, preserve a distinct Ligurian-rooted language taught in local schools."
 },
 "ME": {
  "iso2": "ME",
  "origin": "Montenegro maintained long periods of autonomy under Ottoman pressure and was an independent kingdom before joining Yugoslavia, then a union with Serbia, finally restoring independence by referendum in 2006. Its rugged mountains and Adriatic coast have long shaped a culture of clan loyalty and resilience.",
  "character": "Montenegrin identity blends Orthodox, Catholic and Muslim influences with a fierce highland tradition of honour and hospitality. Visitors are often surprised by the dramatic contrast between fjord-like coastal bays and the stark interior massifs within such a small country.",
  "complexity": "Questions of national and religious identity, including the relationship between Montenegrin and Serbian self-identification, remain sensitive and are best described neutrally.",
  "bestFor": [
   "The Bay of Kotor",
   "Rugged mountain national parks",
   "Compact coast-to-peaks travel"
  ],
  "notKnown": "Montenegrins take pride in the historic Cetinje, their old royal capital, and in a national tradition that long resisted full Ottoman conquest."
 },
 "NL": {
  "iso2": "NL",
  "origin": "The Netherlands emerged as an independent republic after the Dutch Revolt against Spanish rule in the late sixteenth century, formalised in 1648, and became a constitutional monarchy in the nineteenth century. Its golden age of trade, finance and seafaring, alongside a continuous struggle to reclaim land from the sea, profoundly shapes the nation.",
  "character": "Dutch identity prizes pragmatism, directness, tolerance and consensus-driven decision-making, captured in the polder tradition of negotiation. Visitors are often surprised by how thoroughly the landscape is engineered, with much of the country lying below sea level behind an intricate system of dikes.",
  "complexity": "The country's history as a global trading and colonial power, including its role in the transatlantic slave trade, is the subject of ongoing public reckoning.",
  "bestFor": [
   "Cycling-first urban design",
   "Water management and engineering",
   "Golden Age art and canal cities"
  ],
  "notKnown": "The Dutch continuously expand and defend their land through reclamation projects, with provinces such as Flevoland created entirely from former seabed."
 },
 "MK": {
  "iso2": "MK",
  "origin": "North Macedonia emerged as an independent state in 1991 from the dissolution of Yugoslavia, building on a distinct Slavic-speaking identity that crystallised in the 20th century. A 2018 agreement with Greece resolved a long-running name dispute, after which the country adopted its current name and advanced its Euro-Atlantic integration, joining NATO in 2020.",
  "character": "Macedonians blend Balkan, Mediterranean and Ottoman-era influences into a warm, hospitable culture where coffee, conversation and shared meals set the daily rhythm. Visitors are often surprised by the depth of antiquity layered with vibrant frescoed monasteries and a relaxed, unhurried pace far from mass tourism.",
  "complexity": "The country's name, history and symbols have been the subject of sensitive disputes with neighbouring states, and visitors will find that questions of identity and heritage are deeply felt and best approached with curiosity rather than assumptions.",
  "bestFor": [
   "Lake Ohrid heritage",
   "Byzantine monasteries",
   "Affordable wine country"
  ],
  "notKnown": "Lake Ohrid is among the oldest and deepest lakes in Europe, harbouring endemic species found nowhere else on Earth, a fact locals regard with quiet pride."
 },
 "NO": {
  "iso2": "NO",
  "origin": "Norway's modern statehood developed through centuries of union with Denmark and later Sweden, achieving full independence in 1905 under a constitutional monarchy. North Sea oil discovered in the late 1960s transformed it into one of the world's wealthiest nations, with a sovereign wealth fund that shapes its economic security today.",
  "character": "Norwegians prize egalitarianism, outdoor life and the cultural concept of friluftsliv, an embrace of the open air in all seasons. Visitors are often surprised by how unpretentious affluence appears here, alongside genuinely dark winters and luminous midnight-sun summers.",
  "complexity": "Norway balances enormous wealth derived from fossil-fuel exports with a strong national self-image as an environmental leader, a tension that thoughtful visitors will notice in public debate.",
  "bestFor": [
   "Fjord landscapes",
   "Northern lights viewing",
   "Outdoor wilderness travel"
  ],
  "notKnown": "The indigenous Sami people maintain a living reindeer-herding culture and their own parliament in the north, a heritage many Norwegians cherish but outsiders rarely encounter."
 },
 "PL": {
  "iso2": "PL",
  "origin": "Poland traces its statehood to the 10th-century baptism of its first ruler and reached great power as the Polish-Lithuanian Commonwealth before being partitioned out of existence in the late 18th century. It regained independence in 1918, endured devastating occupation in the Second World War, and emerged from communist rule in 1989 to become a fast-growing member of the European Union.",
  "character": "Poles combine deep Catholic tradition, fierce patriotism and a resilient, dryly humorous outlook forged by a turbulent history. Visitors are frequently surprised by the dynamism and modernity of cities like Warsaw and Krakow, painstakingly rebuilt from wartime ruins.",
  "complexity": "Poland's memory of foreign occupation and partition profoundly shapes its politics and its sensitivities around sovereignty, history and its place within Europe.",
  "bestFor": [
   "Medieval old towns",
   "Sobering WWII history",
   "Hearty cuisine"
  ],
  "notKnown": "Poland produced towering contributions to science and culture, from Copernicus to Chopin to Marie Sklodowska-Curie, a heritage of intellectual achievement locals hold dear."
 },
 "PT": {
  "iso2": "PT",
  "origin": "Portugal is among Europe's oldest nation-states, with borders largely settled in the 13th century, and it launched the European Age of Discovery with maritime voyages across Africa, Asia and the Americas. A peaceful 1974 revolution ended decades of dictatorship and ushered in democracy and later European Union membership.",
  "character": "The Portuguese carry a reflective, melancholic sensibility captured in fado music and the untranslatable feeling of saudade, paired with genuine warmth toward visitors. Travellers are often surprised by how affordable, safe and unhurried the country feels relative to its Western European neighbours.",
  "complexity": "Portugal's seafaring golden age is a source of immense pride, yet it is increasingly examined alongside the legacy of colonialism and the transatlantic slave trade in honest public conversation.",
  "bestFor": [
   "Atlantic coastline",
   "Port and wine",
   "Historic seafaring cities"
  ],
  "notKnown": "Portugal is the source of the cork that seals most of the world's wine bottles, harvested sustainably from oak forests that locals tend across generations."
 },
 "RO": {
  "iso2": "RO",
  "origin": "Romania formed in the 19th century through the union of the principalities of Wallachia and Moldavia, gaining full independence from Ottoman suzerainty in 1878. After a harsh communist era that ended with the violent 1989 revolution, it transitioned to democracy and joined the European Union in 2007.",
  "character": "Romanians take pride in their Latin linguistic heritage amid Slavic neighbours, blending Orthodox tradition with a warm, expressive hospitality. Visitors are often surprised by the dramatic Carpathian wilderness and the survival of some of Europe's last truly traditional rural communities.",
  "complexity": "Romania has made significant strides against corruption and toward European integration, yet visitors will notice ongoing tension between rapid modernisation and persistent governance challenges.",
  "bestFor": [
   "Carpathian mountains",
   "Painted monasteries",
   "Medieval Transylvania"
  ],
  "notKnown": "The forests of the Carpathians shelter the largest population of brown bears in Europe outside Russia, a wild heritage Romanians increasingly work to protect."
 },
 "RU": {
  "iso2": "RU",
  "origin": "Russia grew from the medieval state of Kievan Rus and the principality of Moscow into a vast empire, then the Soviet Union, before the Russian Federation emerged with the USSR's dissolution in 1991. Its immense geography spanning eleven time zones and both Europe and Asia continues to shape its self-understanding as a distinct civilisation.",
  "character": "Russians often pair an outward reserve with profound warmth and generosity once trust is established, alongside deep reverence for literature, music and endurance. Visitors are frequently surprised by the imperial grandeur of the cities and the sheer scale of the land.",
  "complexity": "Russia's relations with many Western states are currently strained amid the war in Ukraine, and visitors should be aware of significant travel advisories, practical restrictions and sensitivities surrounding political topics.",
  "bestFor": [
   "Imperial architecture",
   "Literary heritage",
   "Trans-Siberian rail travel"
  ],
  "notKnown": "Lake Baikal in Siberia holds roughly a fifth of the planet's unfrozen fresh water and is the world's deepest lake, a natural wonder many Russians regard as sacred."
 },
 "SM": {
  "iso2": "SM",
  "origin": "San Marino claims to be the world's oldest surviving republic, traditionally founded in the early 4th century by a stonemason fleeing persecution. This tiny landlocked microstate, entirely surrounded by Italy, has preserved its independence and republican institutions across more than seventeen centuries.",
  "character": "Sammarinese share Italian language and cuisine while maintaining a fierce sense of their distinct sovereignty and ancient self-governing tradition. Visitors are often surprised that this medieval hilltop fortress is a fully independent country with its own head-of-state system rotating twice yearly.",
  "complexity": "San Marino's economy and daily life are deeply intertwined with surrounding Italy, raising quiet questions about how a microstate sustains genuine autonomy in a modern integrated Europe.",
  "bestFor": [
   "Medieval hilltop fortresses",
   "Panoramic Apennine views",
   "Microstate curiosities"
  ],
  "notKnown": "San Marino elects two heads of state, the Captains Regent, who serve jointly for only six months, a system of shared power unchanged since the medieval era."
 },
 "RS": {
  "iso2": "RS",
  "origin": "Serbia traces a proud medieval kingdom and Orthodox church before centuries of Ottoman rule, re-emerging as an independent state in the 19th century and a core of the former Yugoslavia. Following the breakup of Yugoslavia and the separation of Montenegro in 2006, Serbia became an independent republic now pursuing European Union membership.",
  "character": "Serbs are known for exuberant hospitality, a passionate musical and cafe culture, and a resilient, self-deprecating humour. Visitors are often surprised by Belgrade's vibrant nightlife and the country's lush, underexplored countryside.",
  "complexity": "The status of Kosovo, which declared independence in 2008 and is recognised by many but not all states including Serbia, remains a deeply sensitive matter that visitors should treat with neutrality and care.",
  "bestFor": [
   "Belgrade nightlife",
   "Riverside fortresses",
   "Folk and brass music"
  ],
  "notKnown": "Serbia is the birthplace of the inventor Nikola Tesla, whose legacy and archive in Belgrade are a profound source of national pride."
 },
 "SK": {
  "iso2": "SK",
  "origin": "Slovakia spent most of the past millennium within the Kingdom of Hungary and later Czechoslovakia, becoming a fully independent state in 1993 through the peaceful Velvet Divorce. It adopted the euro and integrated into the European Union, developing one of the region's stronger manufacturing economies.",
  "character": "Slovaks blend Central European reserve with warm rural traditions, folk music and a strong attachment to their mountainous homeland. Visitors are often surprised by the compact charm of the capital Bratislava and the rugged beauty of the High Tatras.",
  "complexity": "Slovakia's relatively recent independence and its evolving sense of national identity, distinct from both Czech and Hungarian history, are nuances a thoughtful visitor will come to appreciate.",
  "bestFor": [
   "High Tatras hiking",
   "Castle ruins",
   "Thermal spa towns"
  ],
  "notKnown": "Slovakia has one of the highest densities of castles and chateaux in the world relative to its size, a heritage Slovaks treasure across their small country."
 },
 "SI": {
  "iso2": "SI",
  "origin": "Slovenia was long part of the Habsburg lands before joining Yugoslavia, then declared independence in 1991 after a brief ten-day conflict. It moved swiftly toward Western integration, joining the European Union and adopting the euro, and is now among the most prosperous of the former Yugoslav republics.",
  "character": "Slovenes combine Alpine, Mediterranean and Slavic influences with a strong environmental ethic and quiet pride in their green landscapes. Visitors are often surprised by how much diversity, from mountains to coast to caves, fits within such a small and walkable country.",
  "complexity": "Slovenia carefully distinguishes its identity from the broader Yugoslav narrative, and visitors will find it values being understood as a distinct Alpine-Central European nation rather than a Balkan one.",
  "bestFor": [
   "Alpine lakes",
   "Karst cave systems",
   "Sustainable green travel"
  ],
  "notKnown": "More than half of Slovenia is covered in forest, making it one of Europe's greenest countries, a fact locals regard as central to their national character."
 },
 "ES": {
  "iso2": "ES",
  "origin": "Spain unified in the late 15th century through the marriage of the Catholic Monarchs and the completion of the Reconquista, then built a global empire. After the long Franco dictatorship ended in 1975, the country transitioned to a democratic constitutional monarchy and joined the European community.",
  "character": "Spaniards embrace a sociable, late-running rhythm of life centred on shared food, festivals and family, with strong regional identities across its diverse territories. Visitors are often surprised by how distinct each region feels, from Basque to Andalusian to Catalan, within one nation.",
  "complexity": "Spain encompasses strong regional identities and movements, particularly in Catalonia and the Basque Country, where questions of autonomy and self-government remain live and should be discussed with sensitivity.",
  "bestFor": [
   "Regional cuisine and tapas",
   "Moorish and Gothic architecture",
   "Vibrant festivals"
  ],
  "notKnown": "Spain has more UNESCO-recognised intangible cultural heritage and a deeper Islamic architectural legacy than many visitors expect, treasured especially across Andalusia."
 },
 "SE": {
  "iso2": "SE",
  "origin": "Sweden coalesced as a kingdom in the medieval period and was once a dominant Baltic power before adopting a long-standing policy of military non-alignment. Modern Sweden built a renowned social-welfare model, and after the war in Ukraine it joined NATO in 2024, marking a historic strategic shift.",
  "character": "Swedes value consensus, modesty and work-life balance, captured in the concept of lagom, meaning just the right amount. Visitors are often surprised by the blend of polished design and accessible wilderness, where the right of public access opens nature to all.",
  "complexity": "Sweden's long tradition of openness and generous immigration policy has become a subject of active national debate around integration, a nuance visitors may encounter in public discourse.",
  "bestFor": [
   "Scandinavian design",
   "Archipelago and lakes",
   "Progressive city life"
  ],
  "notKnown": "Sweden's allemansratten, or right of public access, legally permits anyone to roam, camp and forage across most private land, a freedom Swedes deeply cherish."
 },
 "CH": {
  "iso2": "CH",
  "origin": "Switzerland's confederation traces to a 1291 alliance of cantons and grew into a federal state in 1848, built on direct democracy and armed neutrality. Its longstanding political neutrality and decentralised governance continue to define its stability and prosperity today.",
  "character": "The Swiss prize precision, privacy, multilingualism and local autonomy, with four national languages and strong cantonal identities. Visitors are often surprised by how seamlessly efficiency coexists with spectacular, accessible Alpine landscapes.",
  "complexity": "Switzerland's tradition of banking secrecy and neutrality has drawn scrutiny over the years, prompting reforms that visitors may find reflect ongoing tension between privacy and transparency.",
  "bestFor": [
   "Alpine scenery",
   "Precision rail travel",
   "Lakeside cities"
  ],
  "notKnown": "Switzerland is a hub of direct democracy where citizens vote on policy referendums several times a year, a civic tradition the Swiss hold as fundamental."
 },
 "UA": {
  "iso2": "UA",
  "origin": "Ukraine's roots reach to medieval Kievan Rus, and after centuries within neighbouring empires and the Soviet Union it gained independence in 1991. Since 2014, and especially after the full-scale invasion in 2022, the country has been engaged in a major war that profoundly shapes its present.",
  "character": "Ukrainians display a deep attachment to their language, land and hard-won independence, expressed through rich folk traditions, literature and resilience. Visitors who knew the country before the war recall the grandeur of Kyiv, the café culture of Lviv and the warmth of its people.",
  "complexity": "Ukraine is the site of an ongoing war, and most of the country is subject to serious travel advisories, so understanding the current security situation is essential for any consideration of travel.",
  "bestFor": [
   "Historic Lviv and Kyiv",
   "Orthodox and Baroque architecture",
   "Black Sea heritage"
  ],
  "notKnown": "Ukraine's exceptionally fertile black-soil chornozem made it a breadbasket of Europe, an agricultural heritage central to national identity."
 },
 "GB": {
  "iso2": "GB",
  "origin": "The United Kingdom formed through the gradual union of England, Wales, Scotland and Ireland, with the present configuration including Northern Ireland dating to the early 20th century. Once the centre of a global empire, it remains a constitutional monarchy and parliamentary democracy that left the European Union in 2020.",
  "character": "British identity blends understatement, irony, deep regard for tradition and a famously layered class and regional consciousness across its four nations. Visitors are often surprised by the genuine cultural distinctness of England, Scotland, Wales and Northern Ireland within one state.",
  "complexity": "The United Kingdom continues to navigate the consequences of leaving the European Union alongside questions of Scottish self-government and the delicate constitutional arrangements in Northern Ireland.",
  "bestFor": [
   "Historic London",
   "Highland and rural landscapes",
   "Literary and musical heritage"
  ],
  "notKnown": "The United Kingdom contains four distinct nations with their own languages, legal traditions and parliaments or assemblies, a plurality outsiders often overlook."
 },
 "VA": {
  "iso2": "VA",
  "origin": "Vatican City became a sovereign state in 1929 through the Lateran Treaty, which resolved decades of tension between the papacy and the Italian state after Italy absorbed the former Papal States in 1870. It functions today as an absolute elective monarchy under the pope, serving as the spiritual and administrative center of the Roman Catholic Church.",
  "character": "Though it is the world's smallest sovereign state, the Vatican projects an outsized cultural and diplomatic presence, blending the gravity of religious authority with one of humanity's greatest art collections. Visitors are often surprised by how compact it is, and by the contrast between the meditative basilica and the crowded, fast-moving museum corridors.",
  "complexity": "The Vatican is simultaneously a religious institution and a temporal state, so visitors should recognize that its art, governance, and finances are intertwined with the global Catholic Church and the lives of well over a billion believers.",
  "bestFor": [
   "Renaissance art",
   "Catholic pilgrimage",
   "Papal ceremony"
  ],
  "notKnown": "It operates its own postal service, railway, and astronomical observatory, the last reflecting a centuries-long tradition of Church-sponsored scientific study."
 },
 "AG": {
  "iso2": "AG",
  "origin": "Antigua and Barbuda was settled by Indigenous Arawak and Carib peoples before British colonization beginning in 1632, with sugar plantations worked by enslaved Africans shaping its society. It gained full independence within the Commonwealth in 1981 and remains a parliamentary democracy with the British monarch as head of state.",
  "character": "The twin-island nation projects an easygoing maritime confidence, famously claiming a beach for every day of the year. Visitors are often surprised by the depth of its sailing heritage and the well-preserved Georgian naval architecture at English Harbour.",
  "complexity": "Tourism dominates the economy, which brings prosperity but also leaves the islands sensitive to external shocks and to debates over offshore finance and economic citizenship programs.",
  "bestFor": [
   "Yacht sailing",
   "Beach variety",
   "Colonial naval heritage"
  ],
  "notKnown": "Barbuda's frigate bird sanctuary is one of the largest in the world, hosting thousands of nesting pairs in a quiet lagoon."
 },
 "AR": {
  "iso2": "AR",
  "origin": "Argentina emerged from the Spanish Viceroyalty of the Rio de la Plata, declaring independence in 1816 after the May Revolution of 1810. Waves of European immigration, particularly Italian and Spanish, profoundly shaped its modern population, language, and culture.",
  "character": "Argentina carries a distinctive European-tinged Latin identity, expressed through tango, a deep cafe culture, and intense devotion to football. Visitors are frequently surprised by the vastness and ecological range of the country, from subtropical wetlands to Patagonian glaciers.",
  "complexity": "Recurring cycles of economic instability and inflation have shaped daily life and national outlook, and visitors will encounter the practical effects in currency and pricing.",
  "bestFor": [
   "Patagonian wilderness",
   "Malbec wine",
   "Tango culture"
  ],
  "notKnown": "Argentines consume yerba mate communally with elaborate etiquette, and the shared gourd is a genuine social ritual rather than a tourist novelty."
 },
 "BS": {
  "iso2": "BS",
  "origin": "The Bahamas, an archipelago of hundreds of islands and cays, was the site of Columbus's first 1492 landfall in the Americas and was later settled by British colonists and Loyalists after the American Revolution. It became independent within the Commonwealth in 1973 and retains the British monarch as head of state.",
  "character": "The nation blends a relaxed island rhythm with a cosmopolitan financial and tourism sector centered on Nassau and the cruise trade. Visitors are often surprised that beyond the resort islands lie sparsely populated Out Islands with a quieter, more traditional Bahamian life.",
  "complexity": "The economy leans heavily on tourism and offshore financial services, leaving it exposed to hurricanes and to international scrutiny of its banking sector.",
  "bestFor": [
   "Shallow-water diving",
   "Out Island seclusion",
   "Junkanoo festival"
  ],
  "notKnown": "Andros Island holds the third-largest barrier reef on Earth and a vast network of inland blue holes prized by cave divers."
 },
 "BB": {
  "iso2": "BB",
  "origin": "Barbados was an uninhabited island when English settlers arrived in 1627 and built a sugar economy reliant on enslaved African labor. It gained independence in 1966 and, in 2021, became a parliamentary republic, replacing the British monarch with a Barbadian head of state.",
  "character": "Often called Little England for its enduring British institutional legacy, Barbados pairs that heritage with a confident Afro-Caribbean culture expressed in cricket, music, and cuisine. Visitors are often surprised by the island's strong literacy, civic stability, and the warmth of its rural parishes away from the coast.",
  "complexity": "The island is navigating a deliberate redefinition of national identity following its transition to a republic, a process that reflects on its colonial past while charting an independent course.",
  "bestFor": [
   "Cricket culture",
   "Rum heritage",
   "Coral-reef beaches"
  ],
  "notKnown": "Barbados is widely regarded as the birthplace of rum, with distilling traditions on the island dating back to the early 17th century."
 },
 "BZ": {
  "iso2": "BZ",
  "origin": "Belize was settled by the Maya for millennia before British logging interests established the colony of British Honduras in the 18th and 19th centuries. It became fully independent in 1981 and remains the only officially English-speaking country in Central America, with a parliamentary system under the British monarch.",
  "character": "Belize is strikingly multicultural, blending Creole, Maya, Garifuna, Mestizo, and Mennonite communities within a small population. Visitors are often surprised by its Caribbean orientation, which sets it apart culturally from its Spanish-speaking Central American neighbors.",
  "complexity": "A long-standing territorial dispute with Guatemala over Belizean land remains formally unresolved and is the subject of ongoing international legal proceedings, a matter best discussed neutrally.",
  "bestFor": [
   "Barrier-reef diving",
   "Maya archaeology",
   "Jungle ecotourism"
  ],
  "notKnown": "The Garifuna people, descended from West Africans and Indigenous Caribbeans, maintain a distinct language and drumming tradition recognized by UNESCO."
 },
 "BO": {
  "iso2": "BO",
  "origin": "Bolivia was the heart of the Spanish silver empire centered on Potosi before achieving independence in 1825, named for the liberator Simon Bolivar. It is today a plurinational state in which Indigenous Aymara and Quechua identities are constitutionally central.",
  "character": "Bolivia retains one of the strongest Indigenous cultural presences in the Americas, visible in language, dress, festivals, and governance. Visitors are often surprised by its extreme altitudes and the surreal landscapes of the high Andean altiplano.",
  "complexity": "The country has navigated significant political and regional tensions, including debates over resource control and the balance of power between the highlands and lowlands.",
  "bestFor": [
   "Salt flat landscapes",
   "Indigenous Andean culture",
   "High-altitude trekking"
  ],
  "notKnown": "Bolivia retains a navy despite being landlocked, maintained as an expression of its enduring claim to a Pacific coastline lost in the 19th-century War of the Pacific."
 },
 "BR": {
  "iso2": "BR",
  "origin": "Brazil was colonized by Portugal beginning in 1500 and uniquely became the seat of the Portuguese empire before declaring independence in 1822 as a monarchy, later transitioning to a republic in 1889. Its modern identity is shaped by Indigenous, African, and European heritage across a continental-scale territory.",
  "character": "Brazil projects a vibrant, music-driven national identity centered on Portuguese language, football, and a famously sociable culture. Visitors are often surprised by its sheer scale and regional diversity, from the Amazon to the southern pampas to the northeastern coast.",
  "complexity": "Brazil contends with pronounced social and economic inequality alongside the global responsibility and domestic debate surrounding stewardship of the Amazon rainforest.",
  "bestFor": [
   "Amazon biodiversity",
   "Carnival and music",
   "Coastal city life"
  ],
  "notKnown": "Brazil is one of the world's most ethnically diverse nations and home to the largest population of Japanese descent outside Japan, centered in Sao Paulo."
 },
 "CA": {
  "iso2": "CA",
  "origin": "Canada was formed through Confederation in 1867, uniting British colonies, and gradually gained full sovereignty over the following century, with the patriation of its constitution completed in 1982. It is a bilingual federal parliamentary democracy shaped by Indigenous peoples, French and British settlement, and large-scale immigration.",
  "character": "Canada cultivates an identity built on multiculturalism, civility, and a deep relationship with its vast northern wilderness. Visitors are often surprised by the distinctiveness of Quebec's French-speaking culture and by how concentrated the population is along the southern border.",
  "complexity": "Canada is engaged in an ongoing process of reconciliation with First Nations, Metis, and Inuit peoples, addressing the legacy of residential schools and treaty obligations.",
  "bestFor": [
   "Wilderness and national parks",
   "Multicultural cities",
   "Winter sports"
  ],
  "notKnown": "Canada has the longest coastline of any country on Earth, much of it along remote Arctic islands rarely seen by visitors."
 },
 "CL": {
  "iso2": "CL",
  "origin": "Chile gained independence from Spain in 1818 and developed within a remarkably long, narrow geography stretching along the Pacific coast of South America. Its modern identity is shaped by mining wealth, strong institutions, and a recovery of democratic governance after the late-20th-century military period.",
  "character": "Chile combines a reputation for stability and orderliness with a fierce attachment to its dramatic geography and poetic tradition, having produced two Nobel laureates in literature. Visitors are often surprised by the country's environmental extremes, from the world's driest desert to Patagonian fjords and glaciers.",
  "complexity": "Chile continues to debate the legacy of its dictatorship era and to revisit its constitutional framework, reflecting unresolved questions about social equity and national direction.",
  "bestFor": [
   "Atacama desert astronomy",
   "Patagonian fjords",
   "Premium wine valleys"
  ],
  "notKnown": "The Atacama Desert hosts the world's most powerful ground-based observatories, and locals take pride in Chile's role as a global capital of astronomy."
 },
 "CO": {
  "iso2": "CO",
  "origin": "Colombia emerged from the Spanish colonial territory of New Granada, achieving independence in the 1810s under leaders including Simon Bolivar. Its modern character is shaped by remarkable biodiversity, regional diversity, and a long path toward internal peace.",
  "character": "Colombia is known for its warmth, music, and strong regional identities spanning Caribbean, Andean, Pacific, and Amazonian zones. Visitors are often surprised by the country's transformation in recent decades and the cosmopolitan vibrancy of cities such as Medellin and Bogota.",
  "complexity": "Colombia has worked to consolidate peace after a prolonged internal armed conflict, and the process of reintegration and rural development remains ongoing in some regions.",
  "bestFor": [
   "Coffee-region landscapes",
   "Caribbean colonial cities",
   "Biodiversity and birdwatching"
  ],
  "notKnown": "Colombia is one of the most biodiverse nations on Earth and the global leader in recorded bird species, a source of deep national pride."
 },
 "CR": {
  "iso2": "CR",
  "origin": "Costa Rica gained independence from Spain in 1821 and developed a comparatively egalitarian society without the large plantation aristocracy of some neighbors. It famously abolished its standing army in 1948 and has since invested heavily in education, health, and environmental conservation.",
  "character": "Costa Rica embodies the ethos of pura vida, a relaxed and optimistic outlook paired with a pioneering commitment to conservation. Visitors are often surprised by the concentration of biodiversity protected across an extensive network of national parks.",
  "complexity": "The success of nature-based tourism creates ongoing tension between economic development and the preservation of the very ecosystems that draw visitors.",
  "bestFor": [
   "Rainforest wildlife",
   "Eco-tourism",
   "Volcano landscapes"
  ],
  "notKnown": "Costa Rica generates the vast majority of its electricity from renewable sources and has reversed much of its earlier deforestation."
 },
 "CU": {
  "iso2": "CU",
  "origin": "Cuba won independence from Spain following the 1898 conflict and a subsequent period of US influence, then underwent a revolution in 1959 that established a one-party socialist state. Its identity today is shaped by that revolutionary history, a rich Afro-Cuban heritage, and a distinctive cultural confidence.",
  "character": "Cuba is celebrated for its music, dance, and architectural grandeur, with Havana's faded colonial and mid-century streetscapes leaving a strong impression. Visitors are often surprised by the warmth and resourcefulness of Cubans amid material constraints.",
  "complexity": "Cuba's economy operates under longstanding external sanctions and a centralised system, and visitors should approach political topics with sensitivity and neutrality.",
  "bestFor": [
   "Live music and dance",
   "Vintage Havana",
   "Cigar and rum heritage"
  ],
  "notKnown": "Cuba sustains an internationally respected medical system and regularly sends large numbers of doctors abroad on health missions."
 },
 "DM": {
  "iso2": "DM",
  "origin": "Dominica was home to the Indigenous Kalinago people, who resisted European settlement longer than on most Caribbean islands, before British control was consolidated in the late 18th century. It became an independent republic within the Commonwealth in 1978.",
  "character": "Known as the Nature Island, Dominica offers a rugged, mountainous interior rather than the beach tourism of its neighbors. Visitors are often surprised by its volcanic peaks, rainforests, rivers, and the second-largest hot spring lake in the world.",
  "complexity": "The island's economy and infrastructure are highly vulnerable to hurricanes, and it has pursued resilience and citizenship-by-investment programs to fund recovery and development.",
  "bestFor": [
   "Rainforest hiking",
   "Whale watching",
   "Geothermal springs"
  ],
  "notKnown": "Dominica is home to the only surviving pre-Columbian Kalinago community in the Caribbean, who maintain a designated territory and living traditions."
 },
 "DO": {
  "iso2": "DO",
  "origin": "The Dominican Republic occupies the eastern two-thirds of Hispaniola, the island where Spain established the first permanent European settlement in the Americas in 1496. It gained independence in 1844, notably from neighboring Haiti rather than directly from a European power, an unusual origin that shapes its national narrative.",
  "character": "The country blends Spanish colonial heritage with a vibrant Afro-Caribbean culture expressed through merengue and bachata music. Visitors are often surprised that beyond the all-inclusive resorts lie historic Santo Domingo, mountain ranges, and the highest peak in the Caribbean.",
  "complexity": "Relations and migration dynamics with neighboring Haiti are a sensitive matter with deep historical roots that visitors should approach with care and neutrality.",
  "bestFor": [
   "Caribbean beach resorts",
   "Merengue and bachata",
   "Colonial Santo Domingo"
  ],
  "notKnown": "Santo Domingo's colonial district holds the oldest cathedral, university, and paved street in the Americas, a heritage locals hold in deep esteem."
 },
 "EC": {
  "iso2": "EC",
  "origin": "Ecuador emerged from the dissolution of Gran Colombia in 1830, taking its name from the equator that bisects the country. Its identity today is shaped by a striking geographic compression of Andean highlands, Amazon basin, Pacific coast, and the Galapagos into one small nation, alongside a large Indigenous population whose movements reshaped modern politics.",
  "character": "Ecuadorians often describe a quiet regionalism between the coastal Guayaquil mentality and the Andean Quito sensibility, yet share a warm, family-centred and unhurried social rhythm. Visitors are frequently surprised by how compact the country is — one can move from snow-capped volcanoes to cloud forest to beach within a single day.",
  "complexity": "The expansion of oil and mining into Amazonian territories remains a genuine point of tension between economic development and the rights and lands of Indigenous communities, and visitors will encounter strongly held views on both sides.",
  "bestFor": [
   "Galapagos wildlife encounters",
   "Compact Andes-to-Amazon travel",
   "Equatorial volcano trekking"
  ],
  "notKnown": "Ecuador was one of the first countries in the world to grant constitutional rights to nature itself, a point of considerable national pride."
 },
 "SV": {
  "iso2": "SV",
  "origin": "El Salvador gained independence from Spain in 1821 and, after a period within the Central American Federation, became fully sovereign in 1841. The country today is profoundly shaped by the legacy of its 1980-1992 civil war and by a vast diaspora whose remittances anchor the economy.",
  "character": "Salvadorans are known for resilience, hard work, and a notably welcoming disposition toward the few travellers who arrive. Visitors are often surprised by the country's compact beauty — volcanic lakes, surf-class Pacific breaks, and colonial towns — set against a reputation that has shifted dramatically in recent years.",
  "complexity": "The sweeping security measures that sharply reduced gang violence have drawn both strong domestic approval and international concern over civil liberties and due process, a nuance worth understanding before forming conclusions.",
  "bestFor": [
   "World-class Pacific surf",
   "Ruta de las Flores towns",
   "Volcanic lake landscapes"
  ],
  "notKnown": "El Salvador is home to Joya de Ceren, a remarkably preserved Maya farming village often called the Pompeii of the Americas."
 },
 "GD": {
  "iso2": "GD",
  "origin": "Grenada, colonised in turn by France and Britain, gained full independence from the United Kingdom in 1974. Its modern identity was marked by a 1979 revolution and a 1983 intervention, after which the island returned to a stable parliamentary path that defines its politics today.",
  "character": "Grenadians carry a relaxed, deeply community-oriented culture infused with the aroma of the spices that grow across the island. Visitors are often surprised that this small nation produces a significant share of the world's nutmeg, with the scent woven into food, drink, and daily life.",
  "complexity": "The events surrounding the 1983 revolution and external intervention remain a sensitive chapter, and locals hold varied and deeply personal perspectives that merit a respectful, listening approach.",
  "bestFor": [
   "Spice-scented cuisine",
   "Uncrowded beaches",
   "Underwater sculpture diving"
  ],
  "notKnown": "Grenada hosts the world's first underwater sculpture park, created to relieve pressure on natural reefs while drawing divers."
 },
 "GT": {
  "iso2": "GT",
  "origin": "Guatemala became independent from Spain in 1821 and emerged as a separate republic after the Central American Federation dissolved in the 1840s. The nation is profoundly shaped by its Maya heritage, with a larger Indigenous population share than almost any other country in the Americas, and by the long aftermath of a 1960-1996 civil war.",
  "character": "Guatemalans sustain one of the most vibrant living Indigenous cultures in the hemisphere, expressed in dozens of Maya languages, textiles, and markets. Visitors are often surprised by the depth of this continuity, where ancient traditions are not museum pieces but part of everyday life.",
  "complexity": "The long civil war left unresolved questions of justice and reconciliation, and disparities between Indigenous communities and the wider economy remain a real social undercurrent visitors should approach with sensitivity.",
  "bestFor": [
   "Living Maya culture",
   "Highland volcano hikes",
   "Antigua colonial architecture"
  ],
  "notKnown": "More than twenty distinct Maya languages remain in daily use, a linguistic richness that locals safeguard with pride."
 },
 "GY": {
  "iso2": "GY",
  "origin": "Guyana, the only English-speaking nation in South America, gained independence from Britain in 1966. Its identity is shaped by a uniquely diverse population descended from Indigenous peoples, enslaved Africans, and indentured South Asian labourers, and most recently by a transformative offshore oil discovery.",
  "character": "Guyanese culture looks more toward the Caribbean than the South American mainland, blending cricket, calypso, and curry into a singular identity. Visitors are often surprised that the vast majority of the country is pristine rainforest, with one of the highest proportions of intact forest cover on Earth.",
  "complexity": "The rapid wealth from newly developed offshore oil has raised genuine questions about how to balance environmental stewardship with equitable distribution of the gains, a debate very much alive in public life.",
  "bestFor": [
   "Pristine rainforest expeditions",
   "Kaieteur Falls",
   "Multicultural Caribbean cuisine"
  ],
  "notKnown": "Kaieteur Falls is among the world's most powerful single-drop waterfalls, far taller than Niagara yet visited by only a trickle of travellers."
 },
 "HT": {
  "iso2": "HT",
  "origin": "Haiti became the world's first independent Black republic in 1804 after a successful revolution by enslaved people against French colonial rule. That founding remains the cornerstone of national identity, even as the country contends with the long economic consequences of its early isolation and recurring political and natural crises.",
  "character": "Haitians sustain an extraordinarily rich artistic and spiritual culture, with a globally influential painting tradition, music, and the practice of Vodou as a genuine faith rather than the caricature outsiders imagine. Visitors are often surprised by the strength of pride Haitians take in their revolutionary history.",
  "complexity": "Periods of political instability and insecurity have made parts of the country difficult to travel, and visitors should seek current, reliable guidance while recognising the dignity and resilience of the people they meet.",
  "bestFor": [
   "Revolutionary history",
   "Vibrant naive-art tradition",
   "Citadelle Laferriere fortress"
  ],
  "notKnown": "Haiti's Citadelle Laferriere is one of the largest fortresses in the Americas, built to defend hard-won independence and a source of immense national pride."
 },
 "HN": {
  "iso2": "HN",
  "origin": "Honduras gained independence from Spain in 1821 and became a fully separate republic after the Central American Federation broke apart in 1838. Its identity is shaped by a long history as an agricultural exporter and by deep Maya and Lenca roots in its interior highlands.",
  "character": "Hondurans are known for a easygoing warmth and strong regional pride, particularly along the distinct Caribbean coast with its Garifuna communities. Visitors are often surprised by the Bay Islands, where some of the most affordable world-class diving sits just offshore from a largely rural mainland.",
  "complexity": "Economic inequality and migration pressures shape much of daily life, and travellers benefit from current local guidance on which regions are well-suited to visit.",
  "bestFor": [
   "Affordable Caribbean diving",
   "Copan Maya ruins",
   "Garifuna coastal culture"
  ],
  "notKnown": "The Maya site of Copan is celebrated for having the finest sculptural and hieroglyphic carving of any ancient Maya city, a distinction Hondurans hold dear."
 },
 "JM": {
  "iso2": "JM",
  "origin": "Jamaica gained independence from Britain in 1962 after centuries as a sugar colony built on enslaved African labour. Its identity is shaped by that African heritage and by an outsized global cultural influence, particularly through music, that far exceeds the island's size.",
  "character": "Jamaicans project a confident, expressive identity captured in the national motto 'Out of Many, One People' and in a creativity that birthed reggae, ska, and dancehall. Visitors are often surprised by the rugged interior of the Blue Mountains and Cockpit Country, a world away from the resort coastline.",
  "complexity": "The tourist enclaves and everyday Jamaican life can feel like separate worlds, and travellers gain far more by engaging respectfully beyond the resort gates.",
  "bestFor": [
   "Reggae music heritage",
   "Blue Mountain coffee",
   "Dramatic interior hiking"
  ],
  "notKnown": "Jamaica's Cockpit Country sheltered the Maroons, communities of formerly enslaved people who won their freedom by treaty centuries before abolition."
 },
 "MX": {
  "iso2": "MX",
  "origin": "Mexico won independence from Spain in 1821 and forged its modern identity through the transformative Revolution of 1910. The nation is shaped by a profound fusion of Indigenous civilisations and Spanish colonial heritage, expressed in everything from language to cuisine to its constitutional order.",
  "character": "Mexicans hold a deep, layered relationship with history, family, and ritual, perhaps most visible in the genuine reverence of Dia de los Muertos. Visitors are often surprised by the country's sheer scale and diversity, with dozens of distinct regional cuisines, ecosystems, and Indigenous languages.",
  "complexity": "Security conditions vary enormously by region, and thoughtful travellers distinguish between specific localised concerns and the warmth and safety of the vast areas where life proceeds normally.",
  "bestFor": [
   "UNESCO-recognised cuisine",
   "Mesoamerican archaeology",
   "Extraordinary regional diversity"
  ],
  "notKnown": "Mexico is one of the world's most biodiverse countries, ranking among the top nations on Earth for its number of reptile and mammal species."
 },
 "NI": {
  "iso2": "NI",
  "origin": "Nicaragua became independent from Spain in 1821 and a separate republic after the Central American Federation dissolved in 1838. Its modern identity is marked by the Sandinista revolution of 1979 and the subsequent conflict, the reverberations of which still shape its politics.",
  "character": "Nicaraguans are known for poetic tradition, gentle hospitality, and pride in being the land of lakes and volcanoes. Visitors are often surprised by the colonial elegance of Granada and Leon and by Ometepe, an island formed by two volcanoes rising from a vast freshwater lake.",
  "complexity": "The political environment has been a source of both domestic and international contention in recent years, and visitors do well to stay informed through current sources while respecting that locals hold a wide range of views.",
  "bestFor": [
   "Volcano boarding and hiking",
   "Colonial Granada and Leon",
   "Lake Nicaragua and Ometepe"
  ],
  "notKnown": "Nicaragua reveres its poet Ruben Dario as the father of modern Spanish-language literature, a literary pride felt across society."
 },
 "PA": {
  "iso2": "PA",
  "origin": "Panama was part of Colombia until it separated in 1903, an event closely tied to the construction of the interoceanic canal. The country's identity remains profoundly shaped by its role as a global crossroads of trade, shipping, and finance.",
  "character": "Panamanians embrace a cosmopolitan, service-oriented outlook befitting a nation built around a global waterway, while sustaining vibrant Indigenous cultures in regions like Guna Yala. Visitors are often surprised by the contrast between Panama City's modern skyline and the untouched rainforest and islands a short distance away.",
  "complexity": "Panama's prominence as an international financial centre has at times drawn external scrutiny over transparency, a matter the country continues to navigate in its global relationships.",
  "bestFor": [
   "The interoceanic canal",
   "Guna Yala island culture",
   "Rainforest near a global city"
  ],
  "notKnown": "Panama's narrow isthmus is so biodiverse that its rainforests host more bird species than the United States and Canada combined."
 },
 "PY": {
  "iso2": "PY",
  "origin": "Paraguay gained independence from Spain in 1811 and was reshaped by the devastating War of the Triple Alliance in the 1860s. Its identity is distinguished by the widespread everyday use of Guarani alongside Spanish, making it one of the most genuinely bilingual nations in the Americas.",
  "character": "Paraguayans take quiet pride in a strong, unpretentious cultural independence, expressed through harp music, the shared ritual of terere, and a deeply rooted rural tradition. Visitors are often surprised that an Indigenous language is spoken fluently by the majority of the population, including in cities and government.",
  "complexity": "Paraguay remains one of South America's lesser-visited and less internationally understood countries, and travellers benefit from setting aside preconceptions and approaching it on its own terms.",
  "bestFor": [
   "Living Guarani language",
   "Jesuit mission ruins",
   "Authentic off-the-trail travel"
  ],
  "notKnown": "Paraguay is home to the world's largest operating fleet of vintage steam infrastructure heritage and is a global leader in renewable hydroelectric power, exporting vast clean energy from the Itaipu dam."
 },
 "PE": {
  "iso2": "PE",
  "origin": "Peru declared independence from Spain in 1821 and consolidated it by 1824, building on the heartland of the former Inca Empire. The nation's identity is anchored in a continuous thread from ancient Andean civilisations through the colonial era to a celebrated modern culinary renaissance.",
  "character": "Peruvians hold deep pride in both their Inca ancestry and a gastronomy now ranked among the world's finest. Visitors are often surprised by the country's geographic range, encompassing coastal desert, high Andes, and Amazon rainforest within a single nation.",
  "complexity": "Recent years have seen recurring political turbulence and protests, particularly affecting the Andean south, and travellers benefit from checking current conditions while engaging respectfully with regional grievances.",
  "bestFor": [
   "Machu Picchu and Inca trails",
   "World-ranked cuisine",
   "Andes-to-Amazon diversity"
  ],
  "notKnown": "Peru cultivates several thousand varieties of potato, a staggering agricultural heritage that locals regard as a national treasure."
 },
 "KN": {
  "iso2": "KN",
  "origin": "Saint Kitts and Nevis, a two-island federation, became fully independent from Britain in 1983, making it one of the youngest sovereign states in the Americas. Its identity is shaped by a sugar-plantation past and the smallness that fosters a tightly knit national community.",
  "character": "Citizens of this federation carry an easy, unhurried Caribbean warmth alongside a strong sense of place tied to their two distinct islands. Visitors are often surprised by the scenic railway that once served the sugar estates and by the unspoiled, low-key character compared with busier neighbours.",
  "complexity": "Nevis retains its own assembly and a long-discussed right to consider greater autonomy, a constitutional nuance reflecting the distinct identities of the two islands.",
  "bestFor": [
   "Brimstone Hill fortress",
   "Twin-island scenery",
   "Tranquil, low-key beaches"
  ],
  "notKnown": "The Brimstone Hill Fortress, a UNESCO World Heritage Site, was so formidable it earned the nickname 'Gibraltar of the Caribbean,' a point of local pride."
 },
 "LC": {
  "iso2": "LC",
  "origin": "Saint Lucia, which changed hands repeatedly between France and Britain before becoming British, gained full independence in 1979. That dual colonial heritage shapes a culture blending English institutions with a French-based Creole language and Catholic traditions.",
  "character": "Saint Lucians take pride in a lush, dramatically beautiful island and a creative spirit that has produced two Nobel laureates from a tiny population. Visitors are often surprised by the iconic twin Pitons rising sheer from the sea, an image that defines the island's volcanic landscape.",
  "complexity": "Like much of the eastern Caribbean, Saint Lucia balances the economic importance of tourism with the preservation of its Creole identity and natural environment, a tension residents navigate thoughtfully.",
  "bestFor": [
   "The iconic Pitons",
   "Creole culture and cuisine",
   "Volcanic hot springs"
  ],
  "notKnown": "Saint Lucia has produced two Nobel laureates, including poet Derek Walcott, giving this small island one of the highest per-capita Nobel rates in the world."
 },
 "VC": {
  "iso2": "VC",
  "origin": "Saint Vincent and the Grenadines, a Caribbean archipelago contested between Britain and France through the 18th century and shaped by the long resistance of the indigenous Garifuna, became fully independent from the United Kingdom in 1979. The young multi-island state today balances agriculture, fishing, and a growing high-end yachting economy.",
  "character": "National identity is rooted in Vincentian Creole culture, a strong attachment to the land, and pride in the unconquered Garifuna legacy. Visitors expecting a single resort island are surprised to find a chain of small, intimate cays and a volcanic main island with little mass tourism.",
  "complexity": "The 2021 eruption of La Soufriere displaced thousands and remains a live reality, so volcanic risk and recovery are part of everyday planning rather than abstract history.",
  "bestFor": [
   "Sailing the Grenadine cays",
   "Unspoiled volcanic hiking",
   "Low-key authentic Caribbean"
  ],
  "notKnown": "Locals take quiet pride that the islands are home to the world's first botanical garden in the Western Hemisphere, founded at Kingstown in 1765."
 },
 "SR": {
  "iso2": "SR",
  "origin": "Suriname grew from a Dutch plantation colony built on enslaved African and later indentured Asian labour, gaining independence from the Netherlands in 1975. Its modern character is defined by one of the most ethnically and religiously plural societies in the Americas and by vast, sparsely populated rainforest.",
  "character": "National identity is consciously multicultural, with Hindustani, Javanese, Creole, Maroon, indigenous, and Chinese communities sharing public life, and Dutch as the unifying language. Visitors are surprised to find a South American country that feels culturally Caribbean and Asian at once, with mosques and synagogues standing side by side.",
  "complexity": "Resource extraction and gold mining in the interior generate national income while raising real questions about the rights and lands of Maroon and indigenous communities.",
  "bestFor": [
   "Pristine Amazon rainforest",
   "Lived multicultural harmony",
   "Dutch-Caribbean fusion cuisine"
  ],
  "notKnown": "Locals are proud that more than ninety percent of the country remains forested, making it one of the most densely forested nations on Earth."
 },
 "TT": {
  "iso2": "TT",
  "origin": "Trinidad and Tobago, two islands with distinct colonial paths under Spanish, French, and British influence, federated and became independent in 1962 and a republic in 1976. An energy-rich economy and a famously diverse population of African and Indian descent shape the nation today.",
  "character": "National identity centres on Carnival, calypso, soca, and the steelpan, alongside an easygoing cosmopolitan confidence. Visitors are often surprised by how industrial and business-minded Trinidad is, in contrast to the quieter, beach-focused rhythm of Tobago.",
  "complexity": "The roughly even balance between Afro-Trinidadian and Indo-Trinidadian communities enriches the culture but also shapes electoral politics in ways a visitor should understand without taking sides.",
  "bestFor": [
   "The original Carnival",
   "Birth of the steelpan",
   "World-class birdwatching"
  ],
  "notKnown": "Locals take pride that the steelpan is widely recognised as one of the only acoustic musical instruments invented in the 20th century."
 },
 "US": {
  "iso2": "US",
  "origin": "The United States declared independence from Britain in 1776 and forged a federal constitutional republic that expanded across the continent through purchase, war, treaty, and settlement. It is shaped today by its scale, its founding ideals of liberty and self-government, and a continuous history of immigration.",
  "character": "National identity rests on individualism, regional pride, and an optimistic belief in reinvention, expressed very differently from New England to the Deep South to the Pacific coast. Visitors are often surprised by how vast the distances are and how sharply culture, climate, and law change from one state to the next.",
  "complexity": "Deep regional and political divisions coexist with shared national symbols, and a thoughtful visitor will encounter strongly held, opposing views best met with curiosity rather than judgment.",
  "bestFor": [
   "Epic national parks",
   "Cultural and culinary range",
   "Defining global pop culture"
  ],
  "notKnown": "Many visitors do not realise the country spans six time zones and contains ecosystems from Arctic tundra to subtropical reef to true desert."
 },
 "UY": {
  "iso2": "UY",
  "origin": "Uruguay emerged as a buffer state between Argentina and Brazil, winning recognition of its independence in 1828 after years of regional struggle. A strong tradition of secular democracy, social welfare, and progressive legislation defines it today.",
  "character": "National identity blends gaucho heritage, European immigration, and a reserved, egalitarian temperament that prizes stability over spectacle. Visitors are surprised by how calm, safe, and socially liberal the country feels relative to its neighbours, and by the near-universal devotion to mate and football.",
  "complexity": "Uruguay's pioneering social reforms, including early legalisation of cannabis, are points of national debate as well as pride, and views among Uruguayans themselves vary.",
  "bestFor": [
   "Relaxed safe travel",
   "Grass-fed beef and asado",
   "Atlantic beach towns"
  ],
  "notKnown": "Locals are proud that the country generates the overwhelming majority of its electricity from renewable sources, chiefly wind and hydro."
 },
 "VE": {
  "iso2": "VE",
  "origin": "Venezuela won independence from Spain in the early 19th century in a movement associated with Simon Bolivar and later became a major oil exporter that reshaped its economy and politics. Today it is defined by extraordinary natural wealth alongside a prolonged economic and political crisis.",
  "character": "National identity is warm, expressive, and intensely proud, woven from Caribbean, Andean, and llanero traditions and a deep love of music and baseball. Visitors are struck by the contrast between breathtaking landscapes and the hardships of daily life that have driven large-scale emigration.",
  "complexity": "The country's governance and economic situation are deeply contested both internationally and among Venezuelans, and a visitor should approach the subject with care and neutrality.",
  "bestFor": [
   "Angel Falls and the tepuis",
   "Caribbean and Andes in one country",
   "Vibrant music and baseball culture"
  ],
  "notKnown": "Locals take pride that Angel Falls, plunging from the Auyantepui, is the highest uninterrupted waterfall on Earth."
 },
 "DZ": {
  "iso2": "DZ",
  "origin": "Algeria, after more than a century of French colonial rule, won independence in 1962 following a long and costly war that remains central to national memory. A vast country shaped by the Sahara, hydrocarbon wealth, and an Amazigh and Arab heritage defines it today.",
  "character": "National identity fuses Arab, Amazigh, Mediterranean, and Islamic strands with a strong sense of hard-won sovereignty. Visitors are surprised by the scale and beauty of the Saharan interior and by how little mass tourism reaches a country of Roman ruins and dramatic desert.",
  "complexity": "The relationship between Arab and Amazigh identity, including language and cultural recognition, is an evolving internal matter best observed respectfully.",
  "bestFor": [
   "The deep Sahara and Tassili rock art",
   "Exceptional Roman ruins",
   "Mediterranean Maghreb culture"
  ],
  "notKnown": "Locals are proud that Algeria is the largest country in Africa by land area, the great majority of it Saharan."
 },
 "BH": {
  "iso2": "BH",
  "origin": "Bahrain, an archipelago in the Gulf ruled by the Al Khalifa family since the late 18th century, was a British protectorate before gaining full independence in 1971. An early oil producer that has diversified into finance, it is one of the region's most established commercial hubs.",
  "character": "National identity blends a long maritime and pearling heritage with cosmopolitan Gulf modernity and a relatively open social atmosphere. Visitors are surprised by the depth of history layered on a small island, from the ancient Dilmun civilisation to Portuguese-era forts.",
  "complexity": "Bahraini society includes both Sunni and Shia communities, and questions of representation are a sensitive domestic matter that a visitor should treat with discretion.",
  "bestFor": [
   "Ancient Dilmun heritage",
   "Pearling history",
   "Gulf finance and dining"
  ],
  "notKnown": "Locals take pride that Bahrain's Tree of Life has survived for centuries in the desert with no obvious water source."
 },
 "EG": {
  "iso2": "EG",
  "origin": "Egypt's identity rests on millennia of continuous civilisation along the Nile, layered with Greco-Roman, Coptic Christian, and Islamic eras, culminating in the 1952 revolution and full independence from British influence. A young, populous, and predominantly urban society shapes the modern republic.",
  "character": "National identity combines immense pride in pharaonic heritage with a vibrant, humour-rich Arab and Islamic culture centred on Cairo. Visitors are often surprised by how alive and chaotic the modern country is, far beyond the antiquities they came to see.",
  "complexity": "Egypt balances a Muslim majority with an ancient Coptic Christian minority, a coexistence that is mostly harmonious but carries sensitivities worth understanding.",
  "bestFor": [
   "Pharaonic monuments",
   "Nile cruising",
   "Red Sea diving"
  ],
  "notKnown": "Locals are proud that Cairo's Al-Azhar is among the oldest continuously operating universities in the world."
 },
 "IR": {
  "iso2": "IR",
  "origin": "Iran is heir to one of the world's oldest continuous civilisations, with imperial Persian roots reaching back over two and a half millennia, transformed by the 1979 revolution into an Islamic republic. Ancient cultural depth and a relatively young population shape it today.",
  "character": "National identity centres on Persian language, poetry, and refined hospitality that often astonishes guests, distinct from the wider Arab world. Visitors are repeatedly surprised by the warmth of ordinary Iranians, which contrasts with the country's external political image.",
  "complexity": "Iran's social norms, including dress codes and the gap between public rules and private life, are a live internal reality that travellers should respect without judgment.",
  "bestFor": [
   "Persian architecture and gardens",
   "Legendary hospitality",
   "Bazaars and Persian cuisine"
  ],
  "notKnown": "Locals take pride that classical poets such as Hafez and Ferdowsi remain woven into everyday speech and family life."
 },
 "IQ": {
  "iso2": "IQ",
  "origin": "Iraq encompasses ancient Mesopotamia, the land of Sumer, Babylon, and Assyria, and was assembled as a modern state under British mandate before gaining independence in 1932. Decades of conflict and a rich ethnic and religious mosaic shape the country today.",
  "character": "National identity draws on profound historical heritage, Arab and Kurdish traditions, and renowned generosity toward guests. Visitors are surprised by the resilience and warmth of people in a land often known abroad only through news of conflict.",
  "complexity": "Iraq is home to Arabs and Kurds and to Sunni, Shia, Christian, and other communities, and the autonomy of the Kurdistan Region is a defining feature best described neutrally.",
  "bestFor": [
   "Cradle-of-civilisation sites",
   "Mesopotamian marshlands",
   "Kurdistan's mountains"
  ],
  "notKnown": "Locals are proud that the southern marshes are widely cited as a possible inspiration for the biblical Garden of Eden."
 },
 "IL": {
  "iso2": "IL",
  "origin": "The State of Israel was established in 1948, drawing on Jewish historical and religious ties to the land and the movement for a Jewish homeland, amid conflict that continues to shape the region. A society of immigrants from many countries defines its modern character.",
  "character": "National identity blends ancient religious heritage with a fast-paced, innovative, and direct contemporary culture. Visitors are surprised by the density of history and the diversity of communities within a very small geographic area.",
  "complexity": "The Israeli-Palestinian conflict is unresolved and deeply felt by all parties, and a thoughtful visitor should listen to multiple perspectives without assuming any single narrative.",
  "bestFor": [
   "Layered religious heritage",
   "Innovation and tech culture",
   "Mediterranean and desert diversity"
  ],
  "notKnown": "Locals take pride in the world's largest known concentration of Bauhaus architecture, the White City of Tel Aviv."
 },
 "JO": {
  "iso2": "JO",
  "origin": "Jordan emerged from the post-Ottoman settlement as the Emirate of Transjordan under British mandate and became a fully independent kingdom in 1946. Hashemite rule and a role as a stable haven amid regional turbulence shape it today.",
  "character": "National identity combines Bedouin heritage, Arab hospitality, and a reputation for moderation and stability. Visitors are surprised by how much lies beyond Petra, from desert canyons to Roman cities to the lowest point on Earth.",
  "complexity": "Jordan has absorbed large refugee populations over generations, a humanitarian commitment that also places real strain on water and public services.",
  "bestFor": [
   "Petra and Wadi Rum",
   "Dead Sea floating",
   "Renowned hospitality"
  ],
  "notKnown": "Locals are proud that the desert of Wadi Rum has stood in for other worlds in numerous acclaimed films."
 },
 "KW": {
  "iso2": "KW",
  "origin": "Kuwait, long a trading and pearling port at the head of the Gulf, was a British protectorate before gaining independence in 1961 and rebuilding after the 1990 to 1991 invasion and liberation. Vast oil reserves and a strong merchant tradition shape it today.",
  "character": "National identity rests on seafaring and trading heritage, a comparatively vocal elected parliament, and close-knit family and diwaniya culture. Visitors are surprised by the active political debate and the strong sense of civic memory surrounding the Gulf War.",
  "complexity": "A large expatriate workforce outnumbers Kuwaiti citizens, raising questions of demographics and labour that shape national conversation.",
  "bestFor": [
   "Gulf merchant heritage",
   "Distinctive modern architecture",
   "Diwaniya social culture"
  ],
  "notKnown": "Locals take pride in the diwaniya tradition, regular open gatherings that remain a genuine forum for political and social discussion."
 },
 "LB": {
  "iso2": "LB",
  "origin": "Lebanon, carved from Ottoman lands under French mandate, became independent in 1943 under a power-sharing system designed to balance its many religious communities. A legacy of civil war, regional pressures, and a vast global diaspora shape it today.",
  "character": "National identity celebrates cosmopolitan flair, legendary cuisine, and a resilient, entrepreneurial spirit spanning mountain, coast, and city. Visitors are surprised that one can ski in the morning and swim in the Mediterranean the same afternoon.",
  "complexity": "Lebanon's confessional power-sharing system underpins its diversity while also complicating governance, a balance best understood without taking any sectarian side.",
  "bestFor": [
   "Eastern Mediterranean cuisine",
   "Ancient sites like Baalbek",
   "Mountain-to-sea diversity"
  ],
  "notKnown": "Locals are proud that Byblos is among the oldest continuously inhabited cities in the world."
 },
 "LY": {
  "iso2": "LY",
  "origin": "Modern Libya emerged from three historically distinct Ottoman and later Italian-administered regions—Tripolitania, Cyrenaica, and Fezzan—unified under independence in 1951. Decades under Muammar Gaddafi ended with the 2011 uprising, and the country's politics have since been shaped by competing administrations and a gradual, uneven push toward national reconciliation.",
  "character": "Libyan identity blends Arab, Amazigh (Berber), and Mediterranean influences with strong tribal and regional loyalties. Visitors are often surprised by the scale and preservation of Roman cities such as Leptis Magna and Sabratha, which rank among the finest classical sites anywhere.",
  "complexity": "Governance has been divided between rival authorities based in the west and east, and any travel requires careful attention to which institutions hold practical control in a given area.",
  "bestFor": [
   "Roman archaeological sites",
   "Saharan desert landscapes",
   "Mediterranean coastline"
  ],
  "notKnown": "Libyans take pride in the Amazigh heritage of towns like Ghadames, a UNESCO-listed oasis settlement whose mud-brick architecture predates the Arab conquest."
 },
 "MA": {
  "iso2": "MA",
  "origin": "Morocco traces a continuous statehood through successive dynasties since the eighth century, making its monarchy among the world's oldest, and it secured independence from French and Spanish protectorates in 1956. Its identity is shaped by Amazigh, Arab, Andalusian, and Saharan threads woven over more than a millennium.",
  "character": "Moroccans pair deep hospitality with a pragmatic, entrepreneurial culture spanning ancient medinas and fast-modernizing cities. Visitors are frequently surprised by the country's geographic range, from Atlantic surf and the Rif and Atlas mountains to the dunes of the Sahara, often within a single trip.",
  "complexity": "The status of Western Sahara remains internationally contested, with Morocco administering most of the territory while a UN-recognized dispute over self-determination continues.",
  "bestFor": [
   "Medina and souk culture",
   "Atlas and Sahara trekking",
   "Craft and culinary traditions"
  ],
  "notKnown": "Amazigh (Berber) is an official national language alongside Arabic, and its Tifinagh script appears on public signage across the country."
 },
 "OM": {
  "iso2": "OM",
  "origin": "Oman's identity is rooted in a centuries-old maritime and trading empire that once extended to East Africa and the Indian Ocean, and the modern state was reshaped after 1970 under a wide-ranging modernization program. The Ibadi school of Islam, distinct from both Sunni and Shia traditions, has long shaped its measured, consensus-oriented public life.",
  "character": "Omanis are known for understated courtesy and a strong sense of heritage that coexists with modern infrastructure. Visitors are often surprised by the dramatic landscape variety—fjord-like coastlines, desert sands, and the monsoon-green hills of Dhofar.",
  "complexity": "Oman has historically positioned itself as a discreet regional mediator, and visitors should appreciate its preference for quiet diplomacy over public alignment in a tense neighborhood.",
  "bestFor": [
   "Wadi and mountain exploration",
   "Traditional dhow and coastal heritage",
   "Desert and frankincense routes"
  ],
  "notKnown": "Oman's Dhofar region experiences a seasonal monsoon, the khareef, that transforms the desert south into mist-covered green hills each summer."
 },
 "PS": {
  "iso2": "PS",
  "origin": "The Palestinian Territories comprise the West Bank and the Gaza Strip, areas whose status traces to the aftermath of the 1948 and 1967 conflicts and remains the subject of an unresolved international dispute. The Palestinian Authority administers parts of the West Bank under arrangements established in the 1990s Oslo framework.",
  "character": "Palestinian identity is anchored in deep attachment to land, family, and a celebrated tradition of hospitality, poetry, and cuisine. Visitors are often struck by the layered religious heritage of cities such as Bethlehem and the warmth extended despite difficult circumstances.",
  "complexity": "The territories sit at the centre of one of the world's most sensitive disputes over borders, governance, and movement, and a thoughtful visitor should approach the situation with care and without presuming any single narrative.",
  "bestFor": [
   "Religious and pilgrimage sites",
   "Levantine cuisine and crafts",
   "Layered historic cities"
  ],
  "notKnown": "Palestinian embroidery, or tatreez, encodes regional village identities in its patterns and is recognised on UNESCO's intangible cultural heritage list."
 },
 "QA": {
  "iso2": "QA",
  "origin": "Qatar grew from a pearling and fishing society into an independent state in 1971, with its trajectory transformed by the discovery of vast natural gas reserves. The ruling Al Thani family has guided a rapid shift from a modest peninsula economy into one of the world's wealthiest and most globally connected nations.",
  "character": "Qatari society balances conservative Gulf traditions with an outward-facing role in media, aviation, and global events. Visitors are often surprised by the cultural ambition on display, from the Museum of Islamic Art to a thriving arts and education sector.",
  "complexity": "Qatar's population is overwhelmingly composed of expatriate workers, and visitors benefit from understanding the labor-migration dynamics that underpin daily life and ongoing reform efforts.",
  "bestFor": [
   "World-class museums",
   "Desert and inland sea excursions",
   "Global aviation hub access"
  ],
  "notKnown": "Qatar's pre-oil prosperity rested on pearl diving, and the trade's history is honored in the restored heritage of the old port and dhow harbors."
 },
 "SA": {
  "iso2": "SA",
  "origin": "The Kingdom of Saudi Arabia was unified in 1932 under Abdulaziz Al Saud, consolidating the central Najd and Hejaz regions into a single state. As custodian of Islam's two holiest cities, Mecca and Medina, the kingdom occupies a singular place in the Muslim world while undergoing sweeping economic and social change under its Vision 2030 program.",
  "character": "Saudi identity combines deep Islamic devotion, Bedouin heritage, and a recently energetic openness to tourism and entertainment. Visitors are often surprised by the country's archaeological depth, including the Nabataean tombs of AlUla, and by the pace of contemporary transformation.",
  "complexity": "The kingdom is undergoing rapid social reform from a conservative baseline, and visitors should remain attentive to evolving local norms that can vary by region and setting.",
  "bestFor": [
   "Nabataean heritage at AlUla",
   "Red Sea diving",
   "Desert and oasis culture"
  ],
  "notKnown": "Saudi Arabia holds the Nabataean city of Hegra (Mada'in Salih), a sister site to Petra and the kingdom's first UNESCO World Heritage listing."
 },
 "SY": {
  "iso2": "SY",
  "origin": "Syria sits at the heart of one of the world's oldest continuously inhabited regions, with cities such as Damascus and Aleppo among the most ancient on earth, and it gained independence from French mandate in 1946. The country has experienced profound upheaval since the conflict that began in 2011, and its political landscape continues to evolve.",
  "character": "Syrian culture is renowned for hospitality, cuisine, and a layered heritage spanning Roman, Byzantine, Umayyad, and Ottoman eras. Visitors who knew the country before the war recall the extraordinary depth of its souks, monuments, and Levantine craft traditions.",
  "complexity": "Syria has experienced more than a decade of conflict with significant humanitarian and security consequences, and conditions on the ground remain fluid and vary considerably by area.",
  "bestFor": [
   "Ancient cities and ruins",
   "Levantine cuisine",
   "Umayyad and crusader heritage"
  ],
  "notKnown": "The ancient city of Ebla yielded clay tablet archives that rank among the most important early written records ever discovered."
 },
 "TN": {
  "iso2": "TN",
  "origin": "Tunisia occupies the site of ancient Carthage and was successively shaped by Phoenician, Roman, Arab, and Ottoman rule before independence from France in 1956. It became the birthplace of the 2011 regional uprisings and has since navigated a closely watched path of political transition.",
  "character": "Tunisians are known for a cosmopolitan Mediterranean outlook, a strong educational tradition, and pride in social progressiveness within the region. Visitors are often surprised by how compactly the country packs Roman ruins, Saharan gateways, and beach resorts together.",
  "complexity": "Tunisia continues to work through political and economic transition since 2011, and visitors will encounter a society engaged in ongoing debate about its future direction.",
  "bestFor": [
   "Roman sites like Dougga and El Djem",
   "Mediterranean beaches",
   "Sahara desert gateways"
  ],
  "notKnown": "The amphitheatre of El Djem is one of the largest and best-preserved in the Roman world, rivaling the Colosseum in scale."
 },
 "TR": {
  "iso2": "TR",
  "origin": "The Republic of Turkey was founded in 1923 by Mustafa Kemal Ataturk from the core of the former Ottoman Empire, establishing a secular state on lands bridging Europe and Asia. Its identity today is shaped by this transcontinental position and a long lineage of Anatolian, Byzantine, and Ottoman civilizations.",
  "character": "Turkish culture fuses European and Middle Eastern influences with intense regional diversity and a celebrated tradition of hospitality and cuisine. Visitors are frequently surprised by the sheer historical density, from Hittite and Greek sites to Cappadocia's rock landscapes and Istanbul's living layers.",
  "complexity": "Turkey balances secular and religious currents and complex relations with neighbors, and visitors will find a society engaged in vigorous debate over its identity and direction.",
  "bestFor": [
   "Istanbul's cross-continental heritage",
   "Cappadocia landscapes",
   "Aegean and Mediterranean coast"
  ],
  "notKnown": "Gobekli Tepe in southeastern Turkey is the world's oldest known monumental temple complex, predating Stonehenge by roughly six thousand years."
 },
 "AE": {
  "iso2": "AE",
  "origin": "The United Arab Emirates was formed in 1971 as a federation of seven emirates, each retaining considerable autonomy under a shared union led by Abu Dhabi and Dubai. Within a single generation it transformed from a pearling and trading society into a global hub for finance, logistics, and tourism.",
  "character": "Emirati society pairs Gulf Arab heritage with one of the world's most internationalized populations and a taste for architectural ambition. Visitors are often surprised that beyond the skylines lie traditional souks, desert culture, and the quieter heritage of the northern emirates.",
  "complexity": "The UAE's residents are predominantly expatriates from many nations, and visitors benefit from understanding the labor and demographic dynamics that shape its cosmopolitan daily life.",
  "bestFor": [
   "Modern architecture and luxury",
   "Desert experiences",
   "Global transit and shopping"
  ],
  "notKnown": "Abu Dhabi's Liwa Oasis sits at the edge of the Empty Quarter, the largest contiguous sand desert on earth, and remains central to Emirati ancestral identity."
 },
 "YE": {
  "iso2": "YE",
  "origin": "Yemen's history reaches back to ancient incense-trading kingdoms such as Saba, and the modern state was formed in 1990 through the unification of North and South Yemen. The country has since endured periods of instability and an ongoing conflict with serious humanitarian consequences.",
  "character": "Yemeni culture is distinguished by extraordinary architectural traditions, strong tribal identity, and a deep heritage of poetry and trade. Visitors familiar with the country recall the otherworldly tower-houses of Sana'a and the unique biodiversity of Socotra island.",
  "complexity": "Yemen has experienced prolonged conflict with severe humanitarian impact, and conditions vary sharply between regions under different forms of control.",
  "bestFor": [
   "Socotra's endemic flora",
   "Historic tower-house architecture",
   "Ancient incense-route heritage"
  ],
  "notKnown": "The walled old city of Shibam is often called the oldest skyscraper city, with mud-brick towers rising several stories that date back centuries."
 },
 "AO": {
  "iso2": "AO",
  "origin": "Angola was a Portuguese colony for nearly five centuries before gaining independence in 1975, after which it endured a prolonged civil war that ended in 2002. Reconstruction and an oil-driven economy have since shaped a nation working to diversify and rebuild.",
  "character": "Angolan identity blends Portuguese-influenced urban culture with rich Bantu traditions and a vibrant music scene that gave the world kizomba and semba. Visitors are often surprised by the dramatic coastline, the scale of the capital Luanda, and the country's relative obscurity given its size.",
  "complexity": "Angola is recovering from decades of civil conflict, and visitors will notice the contrast between oil wealth and the uneven pace of development across the country.",
  "bestFor": [
   "Music and dance heritage",
   "Atlantic coastline",
   "Emerging wildlife and waterfalls"
  ],
  "notKnown": "The Kalandula Falls rank among the largest waterfalls in Africa by volume yet remain almost entirely off the international tourist map."
 },
 "BJ": {
  "iso2": "BJ",
  "origin": "Benin was home to the powerful Kingdom of Dahomey before French colonization, and it gained independence in 1960, later adopting its current name in 1975. It is widely regarded as the birthplace of Vodun (Voodoo), which remains an officially recognized and openly practiced religion.",
  "character": "Beninese culture is defined by the living legacy of Dahomey, deep spiritual traditions, and a reputation for stable, peaceful civic life. Visitors are often surprised by the lake village of Ganvie, built on stilts, and the openness with which Vodun heritage is celebrated.",
  "complexity": "Benin is confronting the difficult legacy of its central historical role in the transatlantic slave trade, a subject it now engages through memorial and heritage work.",
  "bestFor": [
   "Vodun cultural heritage",
   "Dahomey royal history",
   "Stilt village of Ganvie"
  ],
  "notKnown": "Benin has launched a major effort to recover royal Dahomey artifacts from foreign museums, becoming a leading voice in Africa's cultural-restitution movement."
 },
 "BW": {
  "iso2": "BW",
  "origin": "Botswana gained independence from Britain in 1966 and transformed from one of the poorest countries in the world into a stable, diamond-driven economy with a strong governance record. Its trajectory has been shaped by prudent resource management and enduring democratic institutions.",
  "character": "Botswana is known for political stability, a culture of consensus rooted in the kgotla assembly tradition, and a strong conservation ethic. Visitors are often surprised by the country's commitment to low-volume, high-value tourism that keeps its wildernesses pristine.",
  "complexity": "Botswana balances lucrative wildlife tourism with the land rights and livelihoods of communities such as the San, an ongoing conversation about heritage and development.",
  "bestFor": [
   "Okavango Delta safaris",
   "Kalahari wilderness",
   "Elephant populations of Chobe"
  ],
  "notKnown": "Botswana hosts the largest elephant population on earth, and the Okavango is one of the few major inland deltas that never reaches the sea."
 },
 "BF": {
  "iso2": "BF",
  "origin": "Burkina Faso, formerly Upper Volta, gained independence from France in 1960 and was renamed in 1984 to mean 'land of the upright people.' Its identity draws on the historic Mossi kingdoms and a mosaic of more than sixty ethnic groups.",
  "character": "Burkinabe culture is celebrated for its arts, cinema, and a strong tradition of social integrity and craftsmanship. Visitors are often surprised by the country's outsized cultural footprint, including FESPACO, the continent's largest pan-African film festival.",
  "complexity": "Parts of Burkina Faso face significant security challenges linked to wider Sahel instability, and conditions differ markedly between regions.",
  "bestFor": [
   "Pan-African cinema and arts",
   "Mossi cultural heritage",
   "Traditional crafts and bronze work"
  ],
  "notKnown": "Ouagadougou hosts FESPACO, the largest African film festival, which has anchored Burkina Faso's reputation as a continental cultural capital for decades."
 },
 "BI": {
  "iso2": "BI",
  "origin": "Burundi emerged from the centuries-old Kingdom of Burundi, ruled by a mwami (king) over Hutu, Tutsi and Twa communities, before German and then Belgian colonial administration tied it to neighbouring Rwanda. It gained independence in 1962 as a monarchy, became a republic in 1966, and remains shaped by the legacy of cyclical conflict, agrarian poverty and a strong attachment to land in one of Africa's most densely populated states.",
  "character": "Burundians are known for understated dignity, a deep oral and musical tradition, and a society organised around hills, family and community rather than cities. Visitors are often surprised by the lush highland scenery, the calm warmth of daily encounters, and the cultural centrality of cattle as symbols of wealth and respect.",
  "complexity": "The relationship between Hutu and Tutsi identities, hardened by colonial classification and later violence, remains a sensitive subject that thoughtful visitors should approach with care rather than casual curiosity.",
  "bestFor": [
   "Lake Tanganyika shoreline",
   "Royal drumming heritage",
   "Highland coffee country"
  ],
  "notKnown": "The ritual drummers of Gishora, whose thunderous performances are inscribed on UNESCO's intangible heritage list, are regarded by many Burundians as the living heartbeat of the nation."
 },
 "CV": {
  "iso2": "CV",
  "origin": "Cabo Verde was uninhabited until Portuguese navigators settled the Atlantic archipelago in the 15th century, making it an early hub of the transatlantic slave trade and a meeting point of European and West African peoples. Independent since 1975, it has developed into one of Africa's more stable democracies, its identity rooted in a Creole culture forged from that mingling and from generations of emigration.",
  "character": "Cabo Verdeans embody a famously easygoing spirit captured in the word morabeza, a blend of hospitality and warmth, and in morna music made globally beloved by Cesaria Evora. Visitors are often surprised by the islands' dramatic volcanic and desert landscapes, which contrast sharply with the soulful, melancholic sweetness of the local sound.",
  "complexity": "Heavy reliance on tourism, remittances and imported goods leaves this resource-scarce archipelago economically vulnerable, a quiet fragility behind its relaxed beach-resort image.",
  "bestFor": [
   "Morna and Creole music",
   "Volcanic island hiking",
   "Atlantic beach escapes"
  ],
  "notKnown": "Cabo Verdeans take pride in their diaspora, which is larger than the resident population, so that family ties stretch across continents as naturally as across islands."
 },
 "CM": {
  "iso2": "CM",
  "origin": "Cameroon was formed from German Kamerun, later partitioned into British and French mandates after the First World War, and reunified at independence in the early 1960s. Today it is shaped by that dual colonial legacy, with both French and English as official languages and a remarkable mosaic of more than two hundred ethnic groups.",
  "character": "Often called 'Africa in miniature', Cameroon spans rainforest, savanna, mountains and coastline, and its people balance strong regional identities with a shared passion for football and music. Visitors are frequently surprised by the sheer ecological and cultural range packed into a single country, from the volcanic slopes of Mount Cameroon to the Sahelian north.",
  "complexity": "Tensions between the French-speaking majority and English-speaking minority regions have led to ongoing unrest in the Northwest and Southwest, an issue visitors should understand as a serious and unresolved matter rather than a curiosity.",
  "bestFor": [
   "Ecological diversity",
   "Highland Grassfields culture",
   "Mount Cameroon trekking"
  ],
  "notKnown": "The kingdoms of the western Grassfields sustain living royal courts whose elaborate beaded regalia, masks and palaces represent some of Africa's most refined court art."
 },
 "CF": {
  "iso2": "CF",
  "origin": "The Central African Republic took shape from the French colonial territory of Ubangi-Shari, becoming independent in 1960 at the heart of the continent. Landlocked and sparsely populated, it has been shaped by recurring instability, immense natural wealth in diamonds and timber, and the resilience of its rural communities.",
  "character": "Despite hardship, Central Africans maintain rich traditions of music, dance and forest knowledge, with the Sangha basin home to some of Africa's most extraordinary wildlife. Visitors who reach its remote reserves are surprised by pristine rainforest, lowland gorillas and elephants gathering at forest clearings far from any crowd.",
  "complexity": "Long-running armed conflict and the presence of various external actors mean security across much of the country remains genuinely precarious, requiring sober, well-informed planning rather than spontaneity.",
  "bestFor": [
   "Dzanga-Sangha rainforest",
   "Forest elephant clearings",
   "Lowland gorilla tracking"
  ],
  "notKnown": "The BaAka and other forest communities possess polyphonic singing traditions of astonishing complexity, regarded by musicologists as among the most sophisticated vocal music on earth."
 },
 "TD": {
  "iso2": "TD",
  "origin": "Chad became independent from France in 1960, inheriting borders that span the Sahara in the north and fertile Sahelian and Sudanian zones in the south. Its modern character is shaped by this geographic and cultural divide, by competition over the shrinking waters of Lake Chad, and by a long history of trans-Saharan trade.",
  "character": "Chadians draw on deep traditions of nomadic and oasis cultures in the north and settled agricultural societies in the south, bound by remarkable endurance in a demanding environment. Visitors are often surprised by the otherworldly beauty of the Ennedi Plateau and the Zakouma wildlife that has recovered dramatically through dedicated conservation.",
  "complexity": "Differences between the predominantly Muslim north and the more Christian and animist south have historically influenced national politics, a dynamic best understood with nuance rather than reduced to simple division.",
  "bestFor": [
   "Ennedi rock formations",
   "Zakouma wildlife revival",
   "Saharan oasis lakes"
  ],
  "notKnown": "The Lakes of Ounianga, a cluster of vividly coloured Saharan lakes that persist in one of the planet's driest places, are a UNESCO site that even seasoned desert travellers rarely know."
 },
 "KM": {
  "iso2": "KM",
  "origin": "The Comoros archipelago, settled over centuries by Bantu, Arab, Persian and Malagasy peoples, became a French colony before three of its four main islands voted for independence in 1975. The fourth island, Mayotte, chose to remain under French administration, a status that the Comoros disputes and that international bodies have addressed in differing ways.",
  "character": "Comorian culture is a fragrant blend of Swahili, Arab and African influences, reflected in its Islamic faith, elaborate wedding traditions and the spice-laden air of its islands. Visitors are surprised by the intimacy of the place, its volcanic Mount Karthala, and the ylang-ylang plantations that perfume the breeze.",
  "complexity": "The status of Mayotte remains contested between France and the Comoros, a sensitive sovereignty question that visitors should describe factually and without endorsing either side.",
  "bestFor": [
   "Ylang-ylang perfume country",
   "Mount Karthala volcano",
   "Swahili-Arab island culture"
  ],
  "notKnown": "Comorians take great pride in the grand marriage, a costly and elaborate ceremony that confers lifelong social status and remains central to island society."
 },
 "CG": {
  "iso2": "CG",
  "origin": "The Republic of the Congo emerged from French Equatorial Africa, gaining independence in 1960 with its capital at Brazzaville on the river facing Kinshasa. Its identity is shaped by the great Congo River, extensive rainforests, oil wealth concentrated around the coast, and a strongly urbanised population.",
  "character": "Congolese culture is known for vibrant rumba and the flamboyant style of the sapeurs, elegant dressers who turn fashion into an art of dignity. Visitors are often surprised by the country's vast untouched forests in the north, where lowland gorillas and forest elephants thrive in places like Odzala.",
  "complexity": "The economy's heavy dependence on oil revenue creates pronounced disparities between the developed coastal and capital corridor and the sparsely served forested interior, a contrast worth understanding.",
  "bestFor": [
   "Odzala rainforest",
   "Congolese rumba",
   "Sapeur fashion culture"
  ],
  "notKnown": "Brazzaville is the birthplace of the sapeurs, whose Society of Ambianceurs and Elegant People treats impeccable dress as a philosophy of self-respect and joy."
 },
 "CD": {
  "iso2": "CD",
  "origin": "The Democratic Republic of the Congo grew from the brutally exploited Congo Free State and later Belgian Congo, achieving independence in 1960 amid immediate political turmoil. Vast and immensely rich in minerals, it is shaped by the Congo River, extraordinary biodiversity, and a history of conflict over its resources.",
  "character": "Congolese society pulses with creativity, from globally influential rumba and soukous music to a deep entrepreneurial energy in cities like Kinshasa, one of Africa's largest. Visitors are surprised by the scale of everything here, from the second-largest rainforest on earth to volcanoes, vast rivers and unique wildlife such as the bonobo and okapi.",
  "complexity": "The mineral-rich eastern provinces have endured prolonged and complex armed conflict involving many actors, a grave situation that should be acknowledged seriously rather than overlooked.",
  "bestFor": [
   "Virunga's volcanoes",
   "Congolese rumba",
   "Bonobo and gorilla habitats"
  ],
  "notKnown": "The okapi, a forest relative of the giraffe found nowhere else on earth, is a national emblem and a source of quiet pride as a creature unique to Congo's forests."
 },
 "CI": {
  "iso2": "CI",
  "origin": "Cote d'Ivoire became independent from France in 1960 and grew, under its first president, into one of West Africa's most prosperous economies built on cocoa and coffee. Its modern identity reflects this agricultural wealth, rapid urbanisation around Abidjan, and a diverse population drawn from many ethnic groups and decades of regional migration.",
  "character": "Ivorians are known for a cosmopolitan, fashion-conscious culture and for coupe-decale, a music and dance phenomenon that has swept across the continent. Visitors are often surprised by Abidjan's modern skyline and lagoon setting, alongside the monumental basilica at Yamoussoukro, one of the largest churches in the world.",
  "complexity": "Questions of national belonging and citizenship, which fuelled past political division, remain a delicate topic that rewards sensitivity and avoidance of simplistic framing.",
  "bestFor": [
   "Abidjan urban culture",
   "Coupe-decale music",
   "World-leading cocoa heritage"
  ],
  "notKnown": "Cote d'Ivoire is the world's largest cocoa producer, and many Ivorians take pride in the masked dance traditions of the west, including acrobatic stilt dancers of remarkable skill."
 },
 "DJ": {
  "iso2": "DJ",
  "origin": "Djibouti, long a crossroads of trade at the mouth of the Red Sea, became independent from France in 1977 at a strategically vital location beside the Bab-el-Mandeb strait. Its identity is shaped by this maritime gateway position, its Afar and Somali communities, and its role as a major regional port and logistics hub.",
  "character": "Djiboutian life blends Afar, Somali, Arab and French influences in a small, intensely strategic nation where the harsh volcanic landscape borders some of the world's saltiest waters. Visitors are surprised by the surreal scenery of Lake Assal and Lake Abbe and by the seasonal gathering of whale sharks in the Gulf of Tadjoura.",
  "complexity": "The country hosts several foreign military bases owing to its strategic position, a reality of great-power presence that visitors will notice and should regard neutrally.",
  "bestFor": [
   "Whale shark encounters",
   "Lake Assal salt flats",
   "Lake Abbe chimneys"
  ],
  "notKnown": "Djiboutians are proud of Lake Assal, the lowest point in Africa and one of the saltiest bodies of water on the planet, ringed by dazzling salt formations."
 },
 "GQ": {
  "iso2": "GQ",
  "origin": "Equatorial Guinea, comprising a mainland region and several islands including Bioko, was a Spanish colony until independence in 1968, making it the only sovereign African state with Spanish as an official language. Its modern trajectory has been transformed by the discovery of offshore oil, which reshaped its economy while much of the population remained outside the resulting wealth.",
  "character": "The country carries a distinctive Hispanic-African heritage, audible in language and visible in the colonial architecture of Malabo on volcanic Bioko Island. Visitors are surprised by the lush rainforests, nesting sea turtles, and primate-rich reserves of a place that sees very few travellers.",
  "complexity": "Despite substantial oil revenues, the gap between national wealth and everyday living conditions is pronounced, a disparity thoughtful visitors should note with discretion.",
  "bestFor": [
   "Bioko Island rainforest",
   "Hispanic-African heritage",
   "Sea turtle nesting beaches"
  ],
  "notKnown": "Equatorial Guinea's southern beaches host globally important nesting sites for leatherback and other sea turtles, a natural treasure of which conservationists are deeply proud."
 },
 "ER": {
  "iso2": "ER",
  "origin": "Eritrea won independence in 1993 after a thirty-year struggle, having been an Italian colony, a British administration and then federated and annexed by Ethiopia. That long fight for self-determination, along with Italian and Ottoman-era influences along the Red Sea, profoundly shapes its national identity and self-reliant ethos.",
  "character": "Eritreans take pride in a culture of resilience, discipline and hospitality, expressed in the relaxed cafe life and Art Deco streetscapes of the capital, Asmara. Visitors are often surprised by Asmara's astonishingly intact modernist architecture and by the country's blend of highland Christian and coastal Muslim traditions.",
  "complexity": "National service obligations and restricted movement affect daily life and travel, realities best understood factually and with respect for residents' circumstances.",
  "bestFor": [
   "Asmara Art Deco architecture",
   "Red Sea Dahlak islands",
   "Highland coffee culture"
  ],
  "notKnown": "Asmara is a UNESCO World Heritage city celebrated for one of the world's best-preserved collections of early-20th-century modernist architecture, a source of immense local pride."
 },
 "SZ": {
  "iso2": "SZ",
  "origin": "Eswatini, known until 2018 as Swaziland, traces its modern state to the consolidation of the Swazi nation in the 19th century under its royal Dlamini dynasty, becoming a British protectorate before independence in 1968. It remains one of the world's few absolute monarchies, with kingship and tradition central to its national life.",
  "character": "Swazi identity is strongly tied to enduring ceremonies, deference to the monarchy, and a warm, close-knit rural society set amid scenic mountains and valleys. Visitors are surprised by the accessibility of its wildlife reserves and by the colour and scale of cultural festivals like the Umhlanga reed dance and the Incwala kingship ceremony.",
  "complexity": "The role of the absolute monarchy is a subject of internal debate and occasional protest, a contested matter best presented even-handedly without taking sides.",
  "bestFor": [
   "Living royal ceremonies",
   "Compact wildlife reserves",
   "Swazi craft traditions"
  ],
  "notKnown": "Eswatini sustains some of Africa's most vibrant living cultural festivals, and locals take pride in handicraft cooperatives, particularly candle and glass workshops, that have earned international recognition."
 },
 "ET": {
  "iso2": "ET",
  "origin": "Ethiopia is among the world's oldest continuous nations, with ancient roots in the Kingdom of Aksum and a rare distinction as an African state that was never formally colonised. This long independent history, its own calendar and script, and its early adoption of Christianity and Islam deeply shape its proud and distinctive identity.",
  "character": "Ethiopians embrace a culture of profound antiquity, from the coffee ceremony they regard as their gift to the world to a cuisine and music unlike any other on the continent. Visitors are surprised by the rock-hewn churches of Lalibela, the highland scenery of the Simien Mountains, and the sheer diversity of peoples and languages.",
  "complexity": "Ethiopia's federation of many ethnic groups involves real internal tensions over regional autonomy and representation, a complexity visitors should appreciate without oversimplifying.",
  "bestFor": [
   "Lalibela rock churches",
   "Origins of coffee",
   "Simien Mountains trekking"
  ],
  "notKnown": "Ethiopia follows its own calendar of thirteen months and counts the years differently, so that locals proudly note they live, in effect, several years behind the Gregorian date."
 },
 "GA": {
  "iso2": "GA",
  "origin": "Gabon emerged from French Equatorial Africa to independence in 1960, its development funded substantially by offshore oil and one of the lower population densities in Africa. Its identity is shaped by vast equatorial rainforest covering most of the country and a strong recent commitment to conservation.",
  "character": "Gabonese culture combines Francophone influences with deep-rooted traditions such as the Bwiti spiritual practice and intricate mask-making of peoples like the Fang and Punu. Visitors are surprised that nearly half the nation falls within protected areas, where forest elephants and even surfing hippos appear on Atlantic beaches at Loango.",
  "complexity": "Long dependence on oil revenue and concentrated wealth amid extensive untouched wilderness create economic contrasts that reward thoughtful observation.",
  "bestFor": [
   "Loango coastal wildlife",
   "Equatorial rainforest parks",
   "Fang and Punu mask art"
  ],
  "notKnown": "Gabon pioneered a network of thirteen national parks covering a remarkable share of its territory, a conservation commitment of which Gabonese take justified pride."
 },
 "GM": {
  "iso2": "GM",
  "origin": "The Gambia was shaped by British control of the Gambia River trading corridor, gaining independence in 1965 and forming a narrow state that follows the river deep inside Senegal. Its borders, drawn around navigable water, give it one of the most distinctive shapes of any nation and a population still tied closely to the river economy and to Senegalese kin across the frontier.",
  "character": "Gambians cultivate a reputation for warmth that gives the country its informal billing as a friendly meeting point, and Wolof, Mandinka, and Fula identities coexist with notable ease. Visitors are often surprised by how compact and walkable the riverine heartland is, and by the depth of birdlife packed into so small a territory.",
  "complexity": "The country emerged from more than two decades of authoritarian rule in 2017 and is still consolidating democratic institutions and accountability, a transition that informs much local political conversation.",
  "bestFor": [
   "River and mangrove birding",
   "Roots and diaspora heritage",
   "Compact beach escapes"
  ],
  "notKnown": "Many Gambians take quiet pride in Kunta Kinteh Island and the river's documented role in Atlantic history, treating it as a site of remembrance rather than spectacle."
 },
 "GH": {
  "iso2": "GH",
  "origin": "Ghana grew from the powerful Akan states and the coastal forts of the Atlantic trade, and in 1957 it became the first sub-Saharan colony to gain independence, under Kwame Nkrumah. That pioneering role anchors a strong national self-image and a long, if uneven, experience of constitutional politics that shapes the country today.",
  "character": "Ghanaians blend formality and exuberance, expressed in highlife and gospel music, vivid kente cloth, and a deep culture of hospitality summed up in the word akwaaba. Visitors are frequently surprised by the stability of civic life and the seriousness with which chieftaincy and traditional authority still operate alongside the modern state.",
  "complexity": "Ghana's coastal slave-trade forts draw emotional diaspora pilgrimage, and conversations about heritage, return, and historical memory are handled with care rather than as mere tourism.",
  "bestFor": [
   "Atlantic heritage and history",
   "Highlife and festival culture",
   "Accessible first-time West Africa"
  ],
  "notKnown": "Locals are proud that elaborate, custom-built fantasy coffins from the Greater Accra region are recognized internationally as a distinctive Ghanaian art form."
 },
 "GN": {
  "iso2": "GN",
  "origin": "Guinea, a French colony, made a dramatic break in 1958 as the only territory to reject continued association and choose immediate independence under Sekou Toure. Decades of single-party and then military rule followed, and the country's enormous mineral wealth, especially bauxite, continues to shape its economy and politics.",
  "character": "Guinea is a cultural heartland of Mande music and dance, home to renowned djembe and ballet traditions that have influenced performers worldwide. Visitors are often surprised by the dramatic highland scenery of the Fouta Djallon, the source region for several of West Africa's great rivers.",
  "complexity": "The country has experienced repeated unconstitutional changes of government, and political transitions remain a sensitive and closely watched matter best discussed without partisanship.",
  "bestFor": [
   "Fouta Djallon highland trekking",
   "Mande percussion heritage",
   "River-source landscapes"
  ],
  "notKnown": "Guineans note with pride that their plateaus feed the headwaters of the Niger, Senegal, and Gambia rivers, earning the region the nickname the water tower of West Africa."
 },
 "GW": {
  "iso2": "GW",
  "origin": "Guinea-Bissau won independence from Portugal in 1974 after a long liberation war led by the PAIGC and the figure of Amilcar Cabral, whose intellectual legacy still resonates. The young state's identity is bound up with that struggle, with Crioulo as a unifying language, and with strong cultural ties to Cabo Verde.",
  "character": "The nation has a relaxed, syncretic Atlantic culture in which Crioulo language, gumbe music, and a mix of faiths blend across the mainland and the islands. Visitors are surprised by the Bijagos Archipelago, a remote cluster of islands with matrilineal Bijago communities and exceptional marine life.",
  "complexity": "Guinea-Bissau has faced chronic political instability and external pressures linked to its position on trafficking routes, realities locals navigate pragmatically and that visitors should understand without sensationalizing.",
  "bestFor": [
   "Bijagos island ecology",
   "Sea-turtle and manatee habitats",
   "Lusophone Atlantic culture"
  ],
  "notKnown": "Bissau-Guineans hold the Bijagos' matrilineal traditions and sacred-island customs in high regard, recognized by UNESCO as a biosphere reserve."
 },
 "KE": {
  "iso2": "KE",
  "origin": "Kenya took shape under British rule around the Mombasa-to-Uganda railway and gained independence in 1963 after the Mau Mau uprising and a negotiated transition led by Jomo Kenyatta. A diverse federation of communities anchored by Nairobi, it has become one of East Africa's principal economic and technological hubs.",
  "character": "Kenyan identity spans Swahili coastal culture, highland farming communities, and pastoralist peoples, unified by Swahili and a confident entrepreneurial spirit. Visitors are often surprised that Nairobi is a fast-moving tech and finance center as much as a safari gateway, and that wildlife and dense urban life sit so close together.",
  "complexity": "Politics and land are sometimes organized along ethnic and regional lines, a dynamic that surfaces especially around elections and is best understood with sensitivity.",
  "bestFor": [
   "Great Rift wildlife safari",
   "Swahili coast and dhow culture",
   "Mobile-money and tech innovation"
  ],
  "notKnown": "Kenyans take pride in pioneering mobile-money through M-Pesa, which made the country a global reference point for digital financial inclusion."
 },
 "LS": {
  "iso2": "LS",
  "origin": "Lesotho originated in the early nineteenth century when King Moshoeshoe I united Basotho communities in the mountains for protection during regional upheavals, later becoming the British protectorate of Basutoland and gaining independence in 1966. It remains a sovereign kingdom entirely surrounded by South Africa, with its mountain geography central to its identity.",
  "character": "The Basotho project a strong, cohesive national identity symbolized by the conical mokorotlo hat, the Basotho blanket, and a tradition of sure-footed mountain horsemanship. Visitors are surprised by the alpine character of the country, including snow, ski slopes, and the highest lowland point of any nation.",
  "complexity": "Lesotho's economy is closely interlinked with South Africa through labor migration, trade, and water exports, a dependence that shapes everyday life and national planning.",
  "bestFor": [
   "High-altitude mountain trekking",
   "Pony trekking",
   "Southern Africa's only ski terrain"
  ],
  "notKnown": "Basotho take pride that their highlands supply water to South Africa's industrial heartland through the Lesotho Highlands Water Project, a major engineering undertaking."
 },
 "LR": {
  "iso2": "LR",
  "origin": "Liberia was founded in the early nineteenth century as a settlement for freed African Americans and declared itself a republic in 1847, making it Africa's first modern republic and one never formally colonized. Its history fuses Americo-Liberian settler heritage with the many indigenous peoples of the interior, a duality that still informs national life.",
  "character": "Liberia has a distinctive Atlantic-meets-American character visible in its flag, place names, and English creole, layered over rich indigenous cultures and secret-society traditions. Visitors are often surprised by the lush coastal rainforest and surf breaks, and by the resilience of a society that rebuilt after civil conflict.",
  "complexity": "The country is recovering from devastating civil wars that ended in 2003 and from the 2014 Ebola epidemic, and reconciliation and reconstruction remain live and sensitive themes.",
  "bestFor": [
   "Atlantic surf and beaches",
   "Upper Guinean rainforest",
   "Post-conflict heritage and resilience"
  ],
  "notKnown": "Liberians point with pride to electing Africa's first elected female head of state, Ellen Johnson Sirleaf, a Nobel Peace Prize laureate."
 },
 "MG": {
  "iso2": "MG",
  "origin": "Madagascar was settled by seafarers of Austronesian and African origin and unified under the Merina monarchy before French colonization, regaining independence in 1960. This deep blend of Asian and African roots, expressed in the Malagasy language and culture, sets the island apart from the mainland.",
  "character": "Malagasy identity is unusually cohesive for so large an island, bound by a shared language and by ancestral reverence expressed in customs surrounding family tombs. Visitors are continually surprised by the island's biological singularity, where the overwhelming majority of species, including lemurs and baobabs, exist nowhere else on Earth.",
  "complexity": "Tension between conservation imperatives and the livelihood pressures driving deforestation is a real and difficult balance the country continues to negotiate.",
  "bestFor": [
   "Endemic wildlife and lemurs",
   "Baobab and dry-forest landscapes",
   "Austronesian-African culture"
  ],
  "notKnown": "Malagasy take pride in the famadihana, the respectful turning of the ancestors, as a joyful affirmation of family continuity rather than a mournful rite."
 },
 "MW": {
  "iso2": "MW",
  "origin": "Malawi emerged from the British protectorate of Nyasaland, gaining independence in 1964 under Hastings Banda, with its long, narrow form defined by the great lake along its eastern edge. The lake and the surrounding highlands shape both the economy and the national imagination.",
  "character": "Malawi's enduring nickname, the warm heart of Africa, reflects a reputation for gentle hospitality and a largely rural, agrarian way of life. Visitors are surprised by the scale and clarity of Lake Malawi, which feels more like an inland sea and harbors hundreds of endemic fish species.",
  "complexity": "Malawi is one of the world's more economically constrained countries and depends heavily on rain-fed agriculture, leaving it sensitive to climate shocks that visitors should appreciate with respect.",
  "bestFor": [
   "Lake Malawi freshwater diving",
   "Cichlid biodiversity",
   "Relaxed lakeside travel"
  ],
  "notKnown": "Malawians are proud that Lake Malawi hosts more fish species than any other lake on Earth, most of them found nowhere else."
 },
 "ML": {
  "iso2": "ML",
  "origin": "Mali inherits the legacy of the great medieval Sahelian empires of Ghana, Mali, and Songhai, whose wealth flowed through Timbuktu and Djenne, and it gained independence from France in 1960. That imperial and scholarly heritage remains central to how the nation understands itself.",
  "character": "Mali is a cultural powerhouse, the source of globally celebrated music traditions and of the mud-brick architecture epitomized by the Great Mosque of Djenne. Visitors are struck by the depth of Islamic scholarship preserved in historic manuscripts and by the artistry of the Niger River's trading towns.",
  "complexity": "Insecurity across parts of the north and center has restricted travel and displaced communities in recent years, a serious situation that should be acknowledged factually and without oversimplification.",
  "bestFor": [
   "Sahelian empire heritage",
   "West African music traditions",
   "Mud-brick architecture"
  ],
  "notKnown": "Malians take pride that families and librarians in Timbuktu safeguarded hundreds of thousands of ancient manuscripts, evidence of a long scholarly civilization."
 },
 "MR": {
  "iso2": "MR",
  "origin": "Mauritania sits at the meeting point of the Arab-Berber Maghreb and Sub-Saharan Africa, and it gained independence from France in 1960, joining the Arab League while remaining culturally bridged between the two worlds. Vast Saharan space and a nomadic heritage define its character and settlement patterns.",
  "character": "Mauritanian identity blends Moorish, Haratin, and West African Sahelian peoples, with a strong tradition of desert nomadism, tea ritual, and oral poetry. Visitors are surprised by the ancient Saharan caravan towns and by the iron-ore train, one of the longest and heaviest trains in the world.",
  "complexity": "Mauritania confronts an enduring legacy of hereditary servitude and social stratification that the state has formally outlawed but that civil-society groups continue to address, a matter best discussed with care.",
  "bestFor": [
   "Saharan caravan towns",
   "Banc d'Arguin birdlife",
   "Desert and dune expeditions"
  ],
  "notKnown": "Mauritanians are proud of the ancient libraries of Chinguetti and Ouadane, ksour that were once stops on pilgrimage and trade routes and are UNESCO-listed."
 },
 "MU": {
  "iso2": "MU",
  "origin": "Mauritius had no indigenous population and was settled successively by the Dutch, French, and British, becoming independent in 1968 and a republic in 1992. Its society was formed by sugar-plantation labor migration, producing a multi-origin population whose harmony is a point of national identity.",
  "character": "Mauritian identity is genuinely plural, weaving Indian, African, Chinese, and European heritage into a Creole-speaking culture with a remarkable mix of temples, mosques, and churches. Visitors are surprised that beyond the resort coastline lies a mountainous, culturally layered interior with a sophisticated, diversified economy.",
  "complexity": "The Chagos Archipelago, administered separately as the British Indian Ocean Territory, is the subject of a long-running sovereignty question that Mauritius pursues through international forums and that is best stated neutrally.",
  "bestFor": [
   "Multicultural Creole cuisine",
   "Lagoon and reef beaches",
   "Indian Ocean island diversity"
  ],
  "notKnown": "Mauritians are proud that the dodo, though long extinct, remains a beloved national emblem and a global symbol of endemic island life."
 },
 "MZ": {
  "iso2": "MZ",
  "origin": "Mozambique was shaped by centuries of Swahili coast trade and Portuguese presence, gaining independence in 1975 after a liberation war led by FRELIMO and then enduring a long civil conflict that ended in 1992. Its long Indian Ocean coastline and Lusophone heritage define its outlook today.",
  "character": "Mozambican culture fuses Bantu, Swahili, Arab, and Portuguese influences, audible in marrabenta music and visible in the coral-stone architecture of Ilha de Mozambique. Visitors are surprised by the extraordinary length of pristine coastline, coral reefs, and archipelagos along the Indian Ocean.",
  "complexity": "Parts of the northern Cabo Delgado province have experienced an armed insurgency in recent years, a security situation that should be understood factually when considering regional travel.",
  "bestFor": [
   "Indian Ocean diving and reefs",
   "Swahili-Portuguese island heritage",
   "Marrabenta music and seafood"
  ],
  "notKnown": "Mozambicans take pride that Ilha de Mozambique, the former colonial capital, is a UNESCO World Heritage site layering Swahili and Portuguese histories."
 },
 "NA": {
  "iso2": "NA",
  "origin": "Namibia was a German colony and then administered by South Africa, achieving independence only in 1990 after a prolonged liberation struggle, making it one of Africa's youngest nations. Its tiny population spread across vast desert terrain shapes both its environment and its national psyche.",
  "character": "Namibia combines a striking diversity of peoples, including Himba, Herero, Nama, San, and German-speaking communities, with a reputation for orderly governance and conservation. Visitors are surprised by the surreal desert scenery, from the towering dunes of Sossusvlei to the wildlife-rich Etosha pan and the Skeleton Coast.",
  "complexity": "The early-twentieth-century colonial-era atrocities against the Herero and Nama are increasingly acknowledged, and the dialogue over recognition and redress is a sensitive matter to approach respectfully.",
  "bestFor": [
   "Desert and dune landscapes",
   "Community conservancy wildlife",
   "Stargazing and dark skies"
  ],
  "notKnown": "Namibians are proud of being among the first nations to write environmental protection into their constitution and to pioneer community conservancies."
 },
 "NE": {
  "iso2": "NE",
  "origin": "Niger, a landlocked Sahelian state, gained independence from France in 1960 and takes its name from the great river that arcs through its southwest. Much of its territory lies within the Sahara, and the Niger River valley together with the southern Sahel concentrates most of its population.",
  "character": "Niger is home to diverse peoples including the Hausa, Zarma, and the desert Tuareg and Fulani, whose festivals and craftsmanship are renowned across the Sahel. Visitors are surprised by the Air Mountains and Tenere desert, and by the dinosaur and prehistoric record preserved in the sands.",
  "complexity": "Niger has faced regional insecurity and a recent change of government, and its political and security situation is a serious matter best stated neutrally and kept current.",
  "bestFor": [
   "Saharan desert expeditions",
   "Tuareg and Fulani culture",
   "Sahel river and wildlife"
  ],
  "notKnown": "Nigeriens take pride in the Cure Salee gathering and the Fulani Gerewol courtship festival, vivid expressions of pastoralist heritage rarely seen by outsiders."
 },
 "NG": {
  "iso2": "NG",
  "origin": "Nigeria was assembled from hundreds of distinct kingdoms and societies under British colonial administration, achieving independence in 1960 and weathering a civil war later that decade. Today it is shaped by its scale as Africa's most populous nation and its dynamism as an economic and cultural powerhouse spanning more than 250 ethnic groups.",
  "character": "Nigerians are famously enterprising, expressive, and unsentimental about ambition, with an outsized influence on global music, film, and literature. Visitors are often surprised by the sheer creative velocity of cities like Lagos, where commerce, art, and faith coexist at full volume.",
  "complexity": "Regional, religious, and ethnic identities run deep, and the distribution of oil revenue and political power among them remains a sensitive and long-running national conversation.",
  "bestFor": [
   "Afrobeats and live music",
   "Nollywood and contemporary art",
   "entrepreneurial urban energy"
  ],
  "notKnown": "Nigeria's film industry, Nollywood, is among the largest in the world by output, exporting stories across the continent and the diaspora."
 },
 "RW": {
  "iso2": "RW",
  "origin": "Rwanda is a small, densely populated highland nation whose modern identity was forged in the aftermath of the 1994 genocide against the Tutsi, which killed hundreds of thousands within weeks. The decades since have been defined by a state-led project of reconstruction, reconciliation, and rapid development.",
  "character": "Rwandans project a notable sense of order, cleanliness, and forward focus, with Kigali frequently cited as one of Africa's tidiest capitals. Visitors are surprised by the calm, the hills, and the deliberate national emphasis on unity over division.",
  "complexity": "The stability and progress are real, yet the balance between this disciplined governance and space for open political dissent is a nuance thoughtful visitors should understand.",
  "bestFor": [
   "mountain gorilla trekking",
   "clean and safe cities",
   "memory and reconciliation tourism"
  ],
  "notKnown": "Rwanda holds monthly community service mornings called Umuganda, when much of the country, including officials, joins in collective public work."
 },
 "ST": {
  "iso2": "ST",
  "origin": "Sao Tome and Principe is an equatorial two-island nation in the Gulf of Guinea, uninhabited until Portuguese settlement in the late fifteenth century established a plantation economy. It gained independence in 1975 and today remains one of Africa's smallest and least-visited states.",
  "character": "Life moves at an unhurried, intimate pace shaped by Creole-Portuguese culture and a deep cocoa heritage. Visitors are surprised by the lush volcanic interior, near-empty beaches, and the easy warmth of an island society where almost everyone is connected.",
  "complexity": "The economy is small and heavily reliant on aid and a narrow set of exports, leaving the islands sensitive to external shocks despite their tranquility.",
  "bestFor": [
   "bean-to-bar cocoa",
   "untouched rainforest and beaches",
   "off-the-grid island calm"
  ],
  "notKnown": "The islands' cacao once made them the world's leading cocoa exporter, and a revived artisanal chocolate scene now draws connoisseurs."
 },
 "SN": {
  "iso2": "SN",
  "origin": "Senegal lies at Africa's westernmost point and was a hub of French colonial West Africa before independence in 1960. It is shaped today by a reputation for political stability, a strong Sufi Muslim tradition, and a vibrant cultural life centered on Dakar.",
  "character": "Senegalese culture prizes teranga, a deeply held ethic of hospitality, alongside a rich musical and intellectual heritage. Visitors are surprised by the sophistication of Dakar's arts scene and the seamless blend of Islamic devotion with cosmopolitan openness.",
  "complexity": "Senegal is widely regarded as one of West Africa's most stable democracies, though recent contests over political participation and term limits have tested that reputation.",
  "bestFor": [
   "mbalax music and dance",
   "Dakar art and fashion",
   "warm hospitality"
  ],
  "notKnown": "Senegal's Sufi brotherhoods, especially the Mouride order, wield enormous social influence and built the holy city of Touba largely through community effort."
 },
 "SC": {
  "iso2": "SC",
  "origin": "The Seychelles is an archipelago of more than a hundred granite and coral islands in the western Indian Ocean, settled by the French in the eighteenth century and later held by Britain before independence in 1976. Its Creole society and economy are built on tourism, fishing, and the protection of an extraordinary marine environment.",
  "character": "Seychellois life blends African, French, and Asian influences into a relaxed Creole identity centered on the sea. Visitors are surprised that beyond the luxury beaches lies a serious conservation ethos, with vast areas of land and ocean formally protected.",
  "complexity": "An economy concentrated in high-end tourism brings prosperity but also exposure, making the nation acutely attentive to climate change and ocean health.",
  "bestFor": [
   "pristine beaches",
   "marine conservation and diving",
   "Creole island culture"
  ],
  "notKnown": "Seychelles is home to the coco de mer, a giant palm seed found nowhere else and protected as a national treasure."
 },
 "SL": {
  "iso2": "SL",
  "origin": "Sierra Leone was founded in part as a settlement for freed and formerly enslaved Africans, giving Freetown its name and distinctive Krio heritage, and gained independence from Britain in 1961. It rebuilt steadily after a devastating civil war ended in 2002, weathering the 2014 Ebola epidemic along the way.",
  "character": "Sierra Leoneans are known for resilience, humor, and a strong communal spirit despite hard recent history. Visitors are often surprised by the beauty of the Freetown peninsula's beaches and the genuine friendliness they encounter.",
  "complexity": "The country has made real progress in stability, yet poverty and the legacy of its conflict and resource economy remain part of daily life.",
  "bestFor": [
   "uncrowded peninsula beaches",
   "Krio culture and history",
   "warm, resilient communities"
  ],
  "notKnown": "The Krio language, descended from the speech of returned freed slaves, serves as a unifying lingua franca across the country's many ethnic groups."
 },
 "SO": {
  "iso2": "SO",
  "origin": "Somalia occupies the Horn of Africa and unites a population that is unusually homogeneous in language and religion, formed from former British and Italian territories that joined at independence in 1960. The collapse of central government in 1991 reshaped the nation, and it has been rebuilding federal institutions since.",
  "character": "Somali culture is rooted in a renowned oral poetic tradition, strong clan kinship, and a far-flung, tightly networked diaspora. Visitors are surprised by the depth of this poetic heritage and the entrepreneurial vitality that persists despite decades of instability.",
  "complexity": "Security conditions vary sharply by region and remain serious in parts of the country, and the status of self-declared Somaliland is a matter that should be described neutrally.",
  "bestFor": [
   "oral poetry heritage",
   "long Indian Ocean coastline",
   "diaspora-driven enterprise"
  ],
  "notKnown": "Somalis have been called a nation of poets, and skilled poets have historically held a prestige comparable to that of public leaders."
 },
 "ZA": {
  "iso2": "ZA",
  "origin": "South Africa's modern state emerged from Dutch and British colonization, the consolidation of 1910, and the system of apartheid that ended with the first fully democratic elections in 1994. The negotiated transition and the legacy of that era continue to shape the country profoundly.",
  "character": "Often called the Rainbow Nation, South Africa contains striking diversity in its eleven official languages, landscapes, and cultures. Visitors are surprised by the sophistication of its cities and wine country alongside world-class wildlife, all within a single country.",
  "complexity": "Democracy is robust and the constitution celebrated, yet deep economic inequality rooted in the apartheid era remains the country's central unresolved challenge.",
  "bestFor": [
   "safari and wildlife",
   "Cape winelands",
   "dramatic and varied landscapes"
  ],
  "notKnown": "South Africa is one of the world's most biodiverse countries and contains an entire floral kingdom, the fynbos-rich Cape, found nowhere else on Earth."
 },
 "SS": {
  "iso2": "SS",
  "origin": "South Sudan is the world's youngest widely recognised nation, achieving independence from Sudan in 2011 after decades of civil war between the south and the north. Its early years were marked by internal conflict, and nation-building remains an ongoing and fragile process.",
  "character": "South Sudanese identity draws on rich pastoralist and riverine cultures, including the Dinka and Nuer, with cattle holding deep social meaning. Visitors with access encounter striking cultural traditions and the vast wetlands of the Sudd.",
  "complexity": "The country remains affected by intercommunal conflict and humanitarian strain, and travel there requires careful, current security awareness.",
  "bestFor": [
   "the Sudd wetlands",
   "pastoralist cultural heritage",
   "one of Africa's great wildlife migrations"
  ],
  "notKnown": "The Boma-Jonglei landscape hosts a white-eared kob migration rivaling the Serengeti's in scale, though it is little known internationally."
 },
 "SD": {
  "iso2": "SD",
  "origin": "Sudan, once Africa's largest country by area before South Sudan's 2011 secession, sits at the meeting point of the Arab and African worlds along the Nile. Its identity is shaped by ancient Nubian and Kushite civilisations and by recurring cycles of political upheaval.",
  "character": "Sudanese are widely noted for exceptional hospitality and a strong tradition of generosity toward travellers. Visitors are surprised to learn the country holds more ancient pyramids than Egypt, set in quiet desert with few crowds.",
  "complexity": "Ongoing armed conflict and humanitarian crisis affect much of the country, and any discussion of the situation should remain factual and non-partisan.",
  "bestFor": [
   "Nubian pyramids of Meroe",
   "Nile and desert landscapes",
   "renowned hospitality"
  ],
  "notKnown": "The pyramids at Meroe number in the hundreds, built by the Kingdom of Kush, and far outnumber those of neighbouring Egypt."
 },
 "TZ": {
  "iso2": "TZ",
  "origin": "Tanzania was formed in 1964 by the union of mainland Tanganyika and the Indian Ocean archipelago of Zanzibar, both former colonial territories. A founding policy of national unity over ethnic identity has given the country a reputation for unusual social cohesion among its many groups.",
  "character": "Tanzanians are known for a calm, courteous sensibility and the unifying role of Swahili across more than a hundred ethnic communities. Visitors are surprised by the cultural depth of the Swahili coast and Zanzibar alongside the famous savanna parks.",
  "complexity": "Mainland and Zanzibari political relations within the union are a long-standing and sensitive feature of national life that thoughtful visitors should appreciate.",
  "bestFor": [
   "Serengeti and Ngorongoro safari",
   "Mount Kilimanjaro",
   "Zanzibar and the Swahili coast"
  ],
  "notKnown": "Swahili, Tanzania's unifying national language, was deliberately promoted to bind the nation together and is now spoken by millions across East Africa."
 },
 "TG": {
  "iso2": "TG",
  "origin": "Togo is a slender West African nation stretching from a short Atlantic coast to the northern savanna, formerly a German and then French-administered territory before independence in 1960. Its compact geography packs in remarkable ethnic and ecological diversity.",
  "character": "Togolese culture blends coastal cosmopolitanism in Lome with strong traditional and Vodun spiritual practices inland. Visitors are surprised by the country's lush hill regions and the vibrancy of its markets and festivals.",
  "complexity": "Political life has long been dominated by a single ruling family, and questions of governance and succession form part of the national backdrop.",
  "bestFor": [
   "Vodun spiritual heritage",
   "Lome's markets and coast",
   "diverse landscapes in a small country"
  ],
  "notKnown": "Togo is one of the historic heartlands of Vodun, where the tradition is practiced openly as a living religion rather than a curiosity."
 },
 "UG": {
  "iso2": "UG",
  "origin": "Uganda lies at the source of the Nile and the heart of Africa's Great Lakes region, formed from several powerful kingdoms brought under British protection before independence in 1962. It recovered from severe upheaval in the 1970s and 1980s to become a comparatively stable regional anchor.",
  "character": "Ugandans are often described among the friendliest people in Africa, with a youthful, music-loving energy and enduring traditional kingdoms. Visitors are surprised by the greenness of the landscape and the extraordinary biodiversity packed into a relatively small area.",
  "complexity": "Long political continuity under one leadership and ongoing debates over civil liberties are aspects a thoughtful visitor should understand neutrally.",
  "bestFor": [
   "mountain gorilla and chimp trekking",
   "Nile source and rafting",
   "exceptional birdlife"
  ],
  "notKnown": "Uganda's traditional kingdoms, such as Buganda, retain cultural authority and ceremonial monarchs alongside the modern republic."
 },
 "ZM": {
  "iso2": "ZM",
  "origin": "Zambia, landlocked in south-central Africa, gained independence from Britain in 1964 and was shaped by its copper wealth and the unifying leadership of its founding era. A tradition of relatively peaceful political transitions has given it a reputation as one of the region's more stable democracies.",
  "character": "Zambians are known for a gentle, welcoming manner and a strong national identity that transcends more than seventy ethnic groups. Visitors are surprised by the country's vast, uncrowded wilderness and the thunder of Victoria Falls on its southern border.",
  "complexity": "The economy's heavy dependence on copper exposes Zambia to commodity price swings that ripple through public finances and daily life.",
  "bestFor": [
   "Victoria Falls",
   "walking safaris in South Luangwa",
   "uncrowded wilderness"
  ],
  "notKnown": "Zambia pioneered the walking safari, offering a slower, on-foot way to experience the bush that has since spread across the continent."
 },
 "ZW": {
  "iso2": "ZW",
  "origin": "Zimbabwe takes its name from the medieval stone city of Great Zimbabwe and gained independence from white-minority rule in 1980. Its modern path has been shaped by a turbulent land-reform era and the economic volatility that followed.",
  "character": "Zimbabweans are widely noted for high literacy, articulate humor, and remarkable resilience through hard times. Visitors are surprised by the warmth of the welcome and the grandeur of sites from Victoria Falls to the ancient ruins themselves.",
  "complexity": "Years of economic instability and currency disruption have profoundly affected ordinary life, a reality best understood with empathy rather than judgment.",
  "bestFor": [
   "Victoria Falls",
   "Great Zimbabwe ruins",
   "Hwange wildlife and safaris"
  ],
  "notKnown": "Great Zimbabwe is a vast precolonial stone city built without mortar, evidence of a sophisticated African civilization that long predated European arrival."
 },
 "AF": {
  "iso2": "AF",
  "origin": "Afghanistan emerged as a distinct polity in 1747 under Ahmad Shah Durrani, consolidating Pashtun, Tajik, Hazara, Uzbek and other peoples across a strategic crossroads of Central, South and West Asia. Decades of conflict since 1979 — Soviet intervention, civil war, and the post-2001 and post-2021 transitions — continue to shape governance, displacement and daily life.",
  "character": "Afghan identity rests on deep traditions of hospitality, family honour, poetry and resilience that have endured through generations of upheaval. Visitors are often struck by the warmth extended to guests and by landscapes ranging from the high Hindu Kush to fertile river valleys.",
  "complexity": "Governance, the status of women and girls, and access to education and work remain matters of intense international and domestic concern, and conditions vary significantly by region and over time.",
  "bestFor": [
   "High-altitude mountain landscapes",
   "Silk Road heritage sites",
   "Renowned guest hospitality"
  ],
  "notKnown": "Afghanistan is the historic home of Persian-language poets such as Rumi and Jami, and classical Dari verse remains a living source of national pride."
 },
 "BD": {
  "iso2": "BD",
  "origin": "Bangladesh became independent in 1971 after a war of liberation separated it from Pakistan, building on a strong Bengali linguistic and cultural identity rooted in the 1952 Language Movement. Today it is one of the world's most densely populated nations, shaped by the great delta of the Ganges and Brahmaputra and by rapid economic growth.",
  "character": "Bengali identity centres on language, literature, music and a celebrated tradition of intellectual and artistic life. Visitors are frequently surprised by the country's lush green landscapes, the energy of Dhaka, and the depth of pride in poets such as Rabindranath Tagore and Kazi Nazrul Islam.",
  "complexity": "As a low-lying delta nation, Bangladesh is acutely exposed to flooding and climate change, a reality that informs much of its planning and public conversation.",
  "bestFor": [
   "World's largest mangrove forest",
   "Living riverine delta culture",
   "Bengali literature and music"
  ],
  "notKnown": "Bangladesh celebrates International Mother Language Day, observed worldwide on 21 February, which originated from its own struggle to protect the Bengali language."
 },
 "BT": {
  "iso2": "BT",
  "origin": "Bhutan unified as a Buddhist kingdom in the 17th century under Zhabdrung Ngawang Namgyal and was consolidated under the Wangchuck monarchy from 1907. It transitioned to constitutional monarchy and parliamentary democracy in 2008 while retaining strong cultural and religious traditions.",
  "character": "Bhutanese identity is closely tied to Vajrayana Buddhism, dzong architecture, and a national philosophy that weighs Gross National Happiness alongside economic growth. Visitors are often surprised by the scale of pristine forests, the prevalence of traditional dress, and the deliberate, measured pace of tourism.",
  "complexity": "Bhutan balances careful cultural preservation and a high-value tourism policy with the aspirations of a young, increasingly connected generation.",
  "bestFor": [
   "Himalayan Buddhist monasteries",
   "Carbon-negative environment",
   "Low-impact high-value travel"
  ],
  "notKnown": "Bhutan is recognised as carbon negative, absorbing more carbon dioxide than it emits, a status its constitution protects by mandating extensive forest cover."
 },
 "IN": {
  "iso2": "IN",
  "origin": "India's civilisational roots stretch back millennia, and the modern republic was founded upon independence in 1947 and the adoption of its constitution in 1950. It is the world's most populous nation and a federal, multilingual democracy whose diversity shapes its politics, economy and culture.",
  "character": "Indian identity is a tapestry of languages, religions, regional cuisines and artistic traditions held together by a shared sense of plurality. Visitors are often surprised by the sheer range of experiences across regions, from Himalayan north to coastal south, and by the coexistence of ancient ritual and cutting-edge technology.",
  "complexity": "India's vast diversity of languages, faiths and regional identities is a source of strength and also of periodic tension, and visitors benefit from approaching regional differences with sensitivity.",
  "bestFor": [
   "Extraordinary regional diversity",
   "Architectural and spiritual heritage",
   "World-renowned cuisines"
  ],
  "notKnown": "India is home to thousands of distinct languages and hundreds with official or scheduled status, making everyday multilingualism a routine point of local pride."
 },
 "KZ": {
  "iso2": "KZ",
  "origin": "Kazakhstan, the world's largest landlocked country, became independent in 1991 with the dissolution of the Soviet Union, drawing on a heritage of nomadic Turkic peoples of the great steppe. It has since built a resource-driven economy and a distinct national identity blending Kazakh traditions with a multi-ethnic society.",
  "character": "Kazakh identity honours its nomadic past through music, horsemanship, the dombra and a strong tradition of hospitality, alongside a modern, urban outlook. Visitors are often surprised by the vastness of the steppe, the futuristic architecture of Astana, and the country's ethnic and religious plurality.",
  "complexity": "Kazakhstan balances its Soviet legacy, a multi-ethnic population, and an evolving national identity as it navigates relations with larger neighbours.",
  "bestFor": [
   "Vast open steppe",
   "Nomadic equestrian heritage",
   "Modern capital architecture"
  ],
  "notKnown": "Kazakhstan hosts the Baikonur Cosmodrome, the world's oldest and one of its busiest spaceports, from which the first human spaceflight launched."
 },
 "KG": {
  "iso2": "KG",
  "origin": "Kyrgyzstan gained independence in 1991 after the breakup of the Soviet Union, rooted in a heritage of Kyrgyz nomadic clans of the Tian Shan mountains. Its mountainous geography and tradition of community decision-making continue to shape its society and politics.",
  "character": "Kyrgyz identity is bound to the mountains, to nomadic customs such as yurt-dwelling and eagle hunting, and to the epic poem of Manas. Visitors are often surprised by the accessibility of alpine wilderness, the warmth of homestay hospitality, and the living practice of summer pasture migration.",
  "complexity": "Kyrgyzstan has experienced periodic political transitions, and inter-ethnic and border questions in the densely settled Fergana Valley call for sensitivity.",
  "bestFor": [
   "High alpine lakes and pastures",
   "Living nomadic traditions",
   "Community-based homestays"
  ],
  "notKnown": "The Manas epic, among the longest oral poems in the world, is recited by trained bards and is a cornerstone of Kyrgyz cultural pride."
 },
 "MV": {
  "iso2": "MV",
  "origin": "The Maldives, an archipelago of roughly 1,200 coral islands, developed as a seafaring sultanate along Indian Ocean trade routes and converted to Islam in the 12th century. It became fully independent in 1965 and a republic in 1968, with an economy now anchored in tourism and fishing.",
  "character": "Maldivian identity reflects centuries of maritime exchange, expressed in the Dhivehi language, boat-building and a distinctive island culture. Visitors are often surprised that beyond the resort islands lies a long-inhabited nation with its own capital, Malé, among the most densely populated cities in the world.",
  "complexity": "As the world's lowest-lying nation, the Maldives faces existential exposure to sea-level rise, a concern central to its national and international advocacy.",
  "bestFor": [
   "Coral-reef diving and snorkelling",
   "Overwater island resorts",
   "Indian Ocean marine life"
  ],
  "notKnown": "Beyond the resorts, the Maldives has a deep seafaring heritage and a unique script, Thaana, written from right to left and developed locally."
 },
 "NP": {
  "iso2": "NP",
  "origin": "Nepal was unified in the 18th century under King Prithvi Narayan Shah and remained an independent kingdom, never formally colonised. It abolished its monarchy and became a federal democratic republic in 2008 after a decade-long internal conflict and major political transition.",
  "character": "Nepali identity weaves together Hindu and Buddhist traditions, dozens of ethnic communities, and a profound relationship with the Himalaya. Visitors are often surprised by the cultural richness of the Kathmandu Valley and the diversity of peoples encountered between the lowland Terai and the high mountains.",
  "complexity": "Nepal's transition to a federal republic continues to work through questions of regional and ethnic representation across a highly varied geography.",
  "bestFor": [
   "Himalayan trekking and peaks",
   "Kathmandu Valley heritage",
   "Birthplace of the Buddha"
  ],
  "notKnown": "Lumbini, in Nepal's southern plains, is revered as the birthplace of the Buddha, a fact of deep pride that surprises visitors who associate the country mainly with mountaineering."
 },
 "PK": {
  "iso2": "PK",
  "origin": "Pakistan was established in 1947 upon the partition of British India as a homeland for the subcontinent's Muslims, with its present form dating from the separation of Bangladesh in 1971. Its territory spans the Indus Valley, one of the world's earliest urban civilisations, shaping a deep historical identity.",
  "character": "Pakistani identity blends Islamic culture with strong regional traditions across Punjab, Sindh, Khyber Pakhtunkhwa and Balochistan, expressed in music, cuisine and renowned hospitality. Visitors are often surprised by the dramatic mountain scenery of the north, where several of the world's highest peaks rise.",
  "complexity": "Pakistan encompasses considerable regional and linguistic diversity, and the status of Kashmir remains a long-standing matter of dispute that visitors should treat neutrally.",
  "bestFor": [
   "Karakoram and Himalayan peaks",
   "Indus Valley archaeology",
   "Diverse regional cuisines"
  ],
  "notKnown": "Pakistan contains five peaks above 8,000 metres, including K2, and the convergence of three great mountain ranges near Gilgit is a point of considerable national pride."
 },
 "LK": {
  "iso2": "LK",
  "origin": "Sri Lanka, an island with more than two millennia of recorded history, was shaped by Sinhalese and Tamil kingdoms and successive Portuguese, Dutch and British colonial periods before gaining independence in 1948. Its strategic Indian Ocean location has long made it a centre of trade and cultural exchange.",
  "character": "Sri Lankan identity spans Buddhist, Hindu, Muslim and Christian communities and a celebrated tradition of tea, cuisine and ancient cities. Visitors are often surprised by the island's compact diversity, from highland tea estates to coastal reefs and well-preserved royal capitals.",
  "complexity": "Sri Lanka experienced a prolonged internal conflict that ended in 2009, and reconciliation among its communities remains an ongoing and sensitive process.",
  "bestFor": [
   "Ancient royal cities",
   "Highland tea country",
   "Coastal and wildlife safaris"
  ],
  "notKnown": "Sri Lanka's irrigation engineering, including vast ancient reservoirs built over two thousand years ago, is a sophisticated heritage in which locals take great pride."
 },
 "TJ": {
  "iso2": "TJ",
  "origin": "Tajikistan became independent in 1991 with the collapse of the Soviet Union and is the only Persian-speaking state in Central Asia, drawing on a heritage shared with the wider Persianate world. A civil war in the 1990s gave way to reconstruction, with the mountainous Pamir region defining much of the country.",
  "character": "Tajik identity is grounded in the Persian language, classical poetry, and traditions of music and craft, alongside the cultures of the high Pamir. Visitors are often surprised by the scale of the Pamir Mountains, known as the Roof of the World, and by the warmth of remote mountain communities.",
  "complexity": "Tajikistan's rugged terrain and post-Soviet development path shape regional disparities, and parts of the Pamir and border areas call for awareness of local conditions.",
  "bestFor": [
   "Pamir Highway road journeys",
   "High-mountain wilderness",
   "Persian cultural heritage"
  ],
  "notKnown": "Tajikistan is overwhelmingly mountainous, with roughly half its territory above 3,000 metres, and Tajiks take pride in being heirs to the classical Persian Samanid civilisation."
 },
 "TM": {
  "iso2": "TM",
  "origin": "Turkmenistan declared independence in 1991 following the dissolution of the Soviet Union, building a national identity on the heritage of Turkmen tribes, horse-breeding and the Karakum Desert. Its economy is dominated by vast natural gas reserves.",
  "character": "Turkmen identity is expressed through renowned carpet-weaving, the prized Akhal-Teke horse, and traditions of the desert and oasis. Visitors are often surprised by the marble-clad capital Ashgabat and by ancient Silk Road sites such as Merv.",
  "complexity": "Turkmenistan is among the world's more closed countries, and independent travel generally requires advance arrangements and official guidance.",
  "bestFor": [
   "Silk Road desert ruins",
   "Akhal-Teke horse heritage",
   "Distinctive carpet weaving"
  ],
  "notKnown": "The Akhal-Teke horse, famed for its metallic-sheened coat and endurance, is a national emblem in which Turkmen take deep pride and which appears on the state seal."
 },
 "UZ": {
  "iso2": "UZ",
  "origin": "Uzbekistan became independent in 1991 after Soviet rule, but its territory contains some of the most storied cities of the Silk Road, including Samarkand, Bukhara and Khiva. Centuries of Timurid and earlier civilisations underpin a rich architectural and intellectual heritage.",
  "character": "Uzbek identity centres on a legacy of trade, scholarship, Islamic architecture and a vibrant tradition of crafts, cuisine and hospitality. Visitors are often surprised by the breathtaking scale and tilework of the Registan in Samarkand and the living old town of Bukhara.",
  "complexity": "Uzbekistan has been gradually opening to the wider world in recent years, and visitors will encounter both rapid change and enduring traditions.",
  "bestFor": [
   "Silk Road monumental cities",
   "Islamic tilework and architecture",
   "Central Asian cuisine and crafts"
  ],
  "notKnown": "Samarkand was a centre of medieval astronomy under Ulugh Beg, whose 15th-century observatory produced remarkably accurate star catalogues, a scientific legacy locals proudly preserve."
 },
 "BN": {
  "iso2": "BN",
  "origin": "Brunei is a Malay Islamic sultanate on the island of Borneo whose monarchy traces its lineage back centuries, with the country reaching the height of its regional power in the 15th and 16th centuries. It became a British protectorate and gained full independence in 1984, retaining one of the world's oldest continuous monarchies.",
  "character": "Bruneian identity is defined by the national philosophy of Malay Islamic Monarchy, expressed in grand mosques, royal ceremony and a strong sense of order. Visitors are often surprised by the country's wealth, its extensive rainforest reserves, and the water village of Kampong Ayer built over the river.",
  "complexity": "Brunei applies Islamic law as part of its legal system, and visitors should familiarise themselves with local norms and expectations regarding conduct.",
  "bestFor": [
   "Pristine Bornean rainforest",
   "Grand Islamic architecture",
   "Historic stilt water village"
  ],
  "notKnown": "Kampong Ayer, often called the Venice of the East, is a centuries-old settlement built entirely over water and remains a point of enduring local pride."
 },
 "KH": {
  "iso2": "KH",
  "origin": "Cambodia is heir to the Khmer Empire, which dominated mainland Southeast Asia from the 9th to the 15th centuries and built Angkor. After French colonial rule, independence in 1953, and the devastating Khmer Rouge period of the 1970s, the country has rebuilt over recent decades.",
  "character": "Cambodian identity is rooted in Theravada Buddhism, the Khmer language, and immense pride in the artistic achievements of the Angkorian era. Visitors are often surprised by the gentleness and resilience of everyday life given the country's traumatic recent history, and by the scale of the Angkor temple complex.",
  "complexity": "The legacy of the Khmer Rouge era remains deeply felt, and visitors should engage memorial sites and survivor histories with care and respect.",
  "bestFor": [
   "Angkor temple complex",
   "Khmer Buddhist culture",
   "Mekong and Tonle Sap life"
  ],
  "notKnown": "Angkor was once among the largest pre-industrial urban complexes in the world, and Cambodians take pride in Angkor Wat appearing on their national flag, a rare honour for a monument."
 },
 "CN": {
  "iso2": "CN",
  "origin": "China traces a continuous statehood across dynastic cycles spanning more than two millennia, unified first under the Qin in 221 BCE and reconstituted as the People's Republic in 1949 after civil war. Rapid reform since the late 1970s transformed it into the world's manufacturing core and second-largest economy, a trajectory that still anchors its national priorities.",
  "character": "Identity blends deep Confucian and regional traditions with a future-facing pragmatism that prizes scale, education and family advancement. Visitors are often surprised by how cashless and digitally seamless daily life is, and by the sheer regional diversity behind the singular label of 'China'.",
  "complexity": "China governs a vast, ethnically and linguistically varied territory under a single-party system, and topics such as Taiwan, Tibet, Xinjiang and Hong Kong are sensitive and contested, best approached with listening rather than assertion.",
  "bestFor": [
   "ancient-to-hypermodern contrasts",
   "extraordinary regional cuisines",
   "high-speed rail travel"
  ],
  "notKnown": "Many travellers do not realise how varied and locally specific Chinese cuisine is, with each province defending distinct flavour profiles that bear little resemblance to overseas 'Chinese food'."
 },
 "TL": {
  "iso2": "TL",
  "origin": "Timor-Leste was a Portuguese colony for over four centuries before a brief 1975 independence declaration was followed by occupation, and it became fully sovereign in 2002 after a UN-administered transition. That hard-won independence, confirmed by a 1999 referendum, remains the defining reference point of national life.",
  "character": "The country fuses Southeast Asian, Melanesian and Lusophone influences, with Catholicism and the Tetum and Portuguese languages woven through daily life. Visitors are often surprised by the warmth of welcome, the pristine coral reefs, and how young and resilient the nation feels.",
  "complexity": "As one of Asia's youngest and least-developed states, Timor-Leste balances oil-revenue dependence against the urgent need to diversify, and the legacy of past conflict is still present in living memory.",
  "bestFor": [
   "world-class scuba diving",
   "off-the-beaten-path travel",
   "Portuguese-Asian cultural fusion"
  ],
  "notKnown": "Outsiders rarely know that the waters off Atauro Island record among the highest reef-fish biodiversity on Earth, a source of immense local pride."
 },
 "ID": {
  "iso2": "ID",
  "origin": "Indonesia emerged as a unified republic after declaring independence from Dutch colonial rule in 1945, binding together a sprawling archipelago of over 17,000 islands. The national motto 'Bhinneka Tunggal Ika' (Unity in Diversity) reflects the founding project of forging one nation from hundreds of ethnic groups and languages.",
  "character": "Identity rests on tolerant pluralism, communal cooperation (gotong royong) and the world's largest Muslim population coexisting with vibrant Hindu, Christian and animist traditions. Visitors are often surprised that Bali, however iconic, represents only a sliver of a country whose cultures shift dramatically island to island.",
  "complexity": "Holding together such vast geographic and cultural diversity involves ongoing negotiation over regional autonomy and resources, including in provinces such as Papua where the situation is sensitive and viewed differently by different parties.",
  "bestFor": [
   "volcanic and marine landscapes",
   "extraordinary cultural diversity",
   "world-leading biodiversity"
  ],
  "notKnown": "Few visitors realise Indonesia is one of the planet's most linguistically rich nations, with more than 700 living languages spoken across its islands."
 },
 "JP": {
  "iso2": "JP",
  "origin": "Japan unified as a centralised state across successive feudal eras, opened to the world after 1868's Meiji Restoration, and rebuilt into a global economic power following the Second World War. A long history of selective adaptation, absorbing outside influences while refining them, continues to shape the nation today.",
  "character": "Japanese identity values craftsmanship, social harmony, attention to detail and a refined sense of seasonality. Visitors are often surprised by how effortlessly ultramodern technology coexists with deeply preserved ritual, and by the quiet emphasis on consideration for others in public life.",
  "complexity": "Japan navigates the tension between a rapidly ageing, shrinking population and a strong cultural preference for social cohesion, which shapes debates over immigration and the future workforce.",
  "bestFor": [
   "seamless rail and service culture",
   "seasonal nature and cuisine",
   "tradition-meets-technology cities"
  ],
  "notKnown": "Many do not know that Japan maintains thousands of regional festivals and centuries-old family businesses, including some of the world's oldest continuously operating companies."
 },
 "LA": {
  "iso2": "LA",
  "origin": "Laos descends from the 14th-century kingdom of Lan Xang, became a French protectorate, and gained full independence in 1953 before a communist government took power in 1975. As Southeast Asia's only landlocked nation, its mountainous geography and Mekong lifeline strongly shape its development today.",
  "character": "Identity is rooted in Theravada Buddhism, an unhurried rhythm of life, and a strong attachment to community and ritual. Visitors are often surprised by the gentle pace, the enduring French-Lao culinary legacy, and the country's quiet, understated charm.",
  "complexity": "Laos carries the unexploded-ordnance legacy of intense wartime bombing decades ago, and clearance work remains an ongoing humanitarian and developmental concern.",
  "bestFor": [
   "Mekong river journeys",
   "tranquil Buddhist heritage towns",
   "unhurried slow travel"
  ],
  "notKnown": "Outsiders rarely know that Laos is among the most heavily bombed countries per capita in history, and that local communities take pride in turning recovered ordnance into tools and craft."
 },
 "MY": {
  "iso2": "MY",
  "origin": "Malaysia formed in 1963 by uniting Malaya, which gained independence in 1957, with territories on Borneo, creating a federation spanning the peninsula and East Malaysia. Its position astride historic maritime trade routes shaped a multi-ethnic society of Malay, Chinese, Indian and indigenous peoples.",
  "character": "National life is defined by a genuinely multicultural and multireligious fabric, expressed nowhere more vividly than in its celebrated food culture. Visitors are often surprised by how seamlessly mosques, temples and churches share streetscapes, and by the contrast between cosmopolitan Kuala Lumpur and Borneo's rainforests.",
  "complexity": "Malaysia balances policies that address historical economic disparities among ethnic communities, a long-debated framework that thoughtful visitors should understand is viewed in varied ways by Malaysians themselves.",
  "bestFor": [
   "multicultural street food",
   "Borneo rainforest and wildlife",
   "diverse island beaches"
  ],
  "notKnown": "Few realise that Malaysian Borneo hosts some of the oldest rainforests on Earth, predating the Amazon and Congo basins."
 },
 "MM": {
  "iso2": "MM",
  "origin": "Myanmar unified under successive Burmese kingdoms before British colonisation, gaining independence in 1948 and experiencing long stretches of military-led governance since. Its strategic position between South and Southeast Asia, and a mosaic of more than one hundred ethnic groups, continue to shape the nation.",
  "character": "Identity is anchored in Theravada Buddhism, expressed through gilded pagodas and a deep tradition of merit-making and hospitality. Visitors have long been struck by the warmth of its people and the extraordinary plain of Bagan, though access has varied with circumstances.",
  "complexity": "Myanmar's political situation is unsettled and relations among the central state and various ethnic communities are contested, so travellers should monitor current conditions and reputable guidance carefully.",
  "bestFor": [
   "the temple plain of Bagan",
   "Buddhist art and architecture",
   "Inle Lake landscapes"
  ],
  "notKnown": "Many do not know that Myanmar is the historic heart of the global jade and ruby trade, and that the thanaka paste worn on faces is both cosmetic and a centuries-old skincare tradition."
 },
 "MN": {
  "iso2": "MN",
  "origin": "Mongolia is heir to the 13th-century empire of Genghis Khan, the largest contiguous land empire in history, and re-emerged as a democratic state in 1990 after decades as a socialist republic. Its vast steppe geography and nomadic heritage remain central to how the nation sees itself.",
  "character": "Identity celebrates horsemanship, hospitality to travellers, and an enduring pastoral way of life alongside a fast-modernising capital. Visitors are often surprised that roughly a quarter of the population still herds livestock, and by the immense emptiness of its open landscapes.",
  "complexity": "Mongolia manages its development and foreign relations carefully between two large neighbours while balancing mining-driven growth against the preservation of fragile grasslands and nomadic livelihoods.",
  "bestFor": [
   "nomadic steppe immersion",
   "horseback and Gobi expeditions",
   "wide-open wilderness"
  ],
  "notKnown": "Outsiders rarely know that Mongolia is among the world's most sparsely populated nations, and that the annual Naadam festival preserves the 'three manly games' of wrestling, archery and horse racing."
 },
 "KP": {
  "iso2": "KP",
  "origin": "The Democratic People's Republic of Korea was established in 1948 following the post-war division of the Korean Peninsula, and has been governed continuously by the Kim family lineage. The unresolved end of the Korean War, halted by a 1953 armistice rather than a peace treaty, profoundly shapes the state to this day.",
  "character": "National life centres on a highly centralised system, the guiding ideology of Juche (self-reliance), and tightly choreographed public expression. The few permitted visitors are typically surprised by the scale and precision of mass spectacles and by tightly managed itineraries.",
  "complexity": "North Korea is among the world's most closed states with strictly controlled access and information, and conditions including travel feasibility change with the broader security situation on the peninsula.",
  "bestFor": [
   "rare guided heritage access",
   "Pyongyang's planned architecture",
   "DMZ historical context"
  ],
  "notKnown": "Few outsiders realise that Korean culinary traditions such as Pyongyang-style cold naengmyeon noodles originate from the north and are a point of regional pride."
 },
 "KR": {
  "iso2": "KR",
  "origin": "South Korea was founded in 1948 after the peninsula's division and rebuilt from the devastation of the Korean War into a high-income democracy and technology leader within a single generation. This 'Miracle on the Han River', alongside democratisation in the late 1980s, defines its modern self-image.",
  "character": "Identity blends Confucian respect for education and family with a globally influential pop culture and a restless drive for excellence. Visitors are often surprised by how seamlessly serene palaces and mountain temples coexist with one of the world's most wired, fast-moving urban cultures.",
  "complexity": "South Korea lives with the unresolved division of the peninsula and an armistice rather than a formal peace, a reality that quietly informs national life without dominating daily routine.",
  "bestFor": [
   "dynamic food and cafe culture",
   "K-culture and design",
   "mountain temples and hiking"
  ],
  "notKnown": "Many do not know that Korea developed the world's first metal movable-type printing and the scientifically designed Hangul alphabet, both deep sources of pride."
 },
 "PH": {
  "iso2": "PH",
  "origin": "The Philippines was shaped by more than three centuries of Spanish rule followed by an American period, gaining full independence in 1946. This layered colonial history, atop a maritime archipelago of over 7,000 islands, produced a uniquely cross-cultural Asian nation.",
  "character": "Identity is warm, family-centred, predominantly Catholic and famously hospitable, with English widely spoken alongside Filipino and dozens of regional languages. Visitors are often surprised by the depth of musical talent, the festive spirit, and how distinct island cultures feel from one another.",
  "complexity": "Spread across thousands of islands, the country contends with regional disparities and a sensitive disposition over maritime claims in the surrounding seas that involves several parties.",
  "bestFor": [
   "island and beach diversity",
   "world-class diving and reefs",
   "exceptional hospitality"
  ],
  "notKnown": "Outsiders rarely know that the Banaue and Ifugao rice terraces, carved into the Cordillera mountains, are roughly two thousand years old and a profound source of indigenous pride."
 },
 "SG": {
  "iso2": "SG",
  "origin": "Singapore became independent in 1965 after separating from Malaysia, transforming from a trading port into one of the world's wealthiest financial and logistics hubs within decades. Its founding constraint, a small island with no natural resources, drove a pragmatic, planning-intensive model of statehood.",
  "character": "Identity rests on multiracial harmony among Chinese, Malay, Indian and other communities, meritocracy and a famously clean, orderly civic life. Visitors are often surprised by the lush 'city in a garden' greenery and by the extraordinary diversity of its hawker-centre cuisine.",
  "complexity": "Singapore's celebrated efficiency and order rest on a distinctive governance model and strict laws that visitors should respect, and which observers describe in differing terms.",
  "bestFor": [
   "hawker-centre food culture",
   "urban green architecture",
   "a seamless travel hub"
  ],
  "notKnown": "Few realise that Singapore is one of the few city-states to achieve near-total water security, recycling wastewater into high-grade 'NEWater' as a point of national pride."
 },
 "TH": {
  "iso2": "TH",
  "origin": "Thailand, historically Siam, is notable as the only Southeast Asian nation never colonised by a European power, preserving continuity through its monarchy and skilled diplomacy. The modern constitutional monarchy and Theravada Buddhism remain central pillars of national life.",
  "character": "Identity blends warm hospitality, reverence for monarchy and Buddhism, and the cultural ideal of 'sanuk', finding joy and ease in daily life. Visitors are often surprised by the depth of regional cuisine and the contrast between Bangkok's intensity and the calm of the north and islands.",
  "complexity": "Thailand holds the monarchy in deep reverence, protected by law, so visitors should understand that public discussion of the institution is a sensitive matter handled with care.",
  "bestFor": [
   "celebrated street cuisine",
   "tropical islands and beaches",
   "temples and wellness culture"
  ],
  "notKnown": "Many do not know that Thailand is the world's leading producer of cultivated orchids, and that its elaborate fruit-and-vegetable carving is a refined royal art form."
 },
 "VN": {
  "iso2": "VN",
  "origin": "Vietnam reunified in 1976 after decades of conflict and the end of war the previous year, building on a long history of resilience against larger powers. Market reforms launched in 1986 (Doi Moi) propelled it into one of Asia's fastest-growing economies, which shapes its outlook today.",
  "character": "Identity combines entrepreneurial energy, strong family bonds and pride in a long history of perseverance. Visitors are often surprised by the dynamism of street life, the sophistication of regional cuisines, and the forward-looking optimism of a young population.",
  "complexity": "Vietnam's modern history includes a war remembered very differently inside and outside the country, and thoughtful visitors benefit from engaging with local perspectives respectfully.",
  "bestFor": [
   "regional Vietnamese cuisine",
   "dramatic karst landscapes",
   "vibrant urban street life"
  ],
  "notKnown": "Outsiders rarely know that Vietnam is among the world's largest coffee producers, with a distinctive robusta-based coffee culture that locals take great pride in."
 },
 "TW": {
  "iso2": "TW",
  "origin": "Taiwan's modern political order took shape after 1949, when the Republic of China government relocated to the island following the Chinese civil war, and it later democratised in the 1980s and 1990s. Today it has a vibrant democratic system and is a critical node in the global technology supply chain.",
  "character": "Identity blends Chinese cultural heritage, indigenous Austronesian roots, Japanese-era influences and a thriving open civil society. Visitors are often surprised by the exceptional friendliness, the celebrated night-market food scene, and how mountainous and green the island is beyond its cities.",
  "complexity": "Taiwan's political status is contested and described differently by different parties, and visitors should recognise that questions of identity and cross-strait relations are deeply felt and best approached with sensitivity.",
  "bestFor": [
   "night-market street food",
   "mountain and hot-spring nature",
   "tea culture and hospitality"
  ],
  "notKnown": "Few realise that Taiwan is home to numerous indigenous Austronesian peoples whose languages are studied as a possible origin point of the wider Austronesian world."
 },
 "HK": {
  "iso2": "HK",
  "origin": "Hong Kong grew from a cluster of fishing and trading communities into a major port after Britain acquired Hong Kong Island in 1842 and later the New Territories on a 99-year lease; sovereignty transferred to the People's Republic of China in 1997. It is today administered as a Special Administrative Region under a 'one country, two systems' framework that provides for a distinct legal and economic structure.",
  "character": "Hong Kong fuses dense, vertical urbanism with a Cantonese cultural core, world-class finance, and a deep tradition of street food, temples, and family-run businesses. Visitors are often surprised that within minutes of the skyline they can reach forested hiking trails, quiet outlying islands, and protected country parks covering much of the territory.",
  "complexity": "The scope and future of Hong Kong's autonomy, civil liberties, and electoral arrangements under 'one country, two systems' are a subject of ongoing debate among residents, officials, and outside observers, and visitors will encounter a range of views.",
  "bestFor": [
   "High-density urban dining",
   "Finance and connectivity",
   "City-edge hiking trails"
  ],
  "notKnown": "Roughly three-quarters of Hong Kong's land remains undeveloped countryside, and locals prize their extensive network of hiking trails and protected parks."
 },
 "AU": {
  "iso2": "AU",
  "origin": "Australia's First Peoples have inhabited the continent for tens of thousands of years, sustaining some of the world's oldest continuous cultures, before British colonisation began in 1788; the six self-governing colonies federated into the Commonwealth of Australia in 1901. It remains a constitutional monarchy and parliamentary democracy with a diverse, largely urban, immigrant-shaped society.",
  "character": "Australians cultivate an egalitarian, informal, outdoor-oriented identity with a dry sense of humour and a strong sporting culture. Visitors are often surprised by the sheer scale and emptiness of the interior, and by how concentrated the population is along the coastal fringe.",
  "complexity": "The relationship between the Australian state and Aboriginal and Torres Strait Islander peoples, including questions of land, recognition, and historical injustice, remains an active and openly discussed national conversation.",
  "bestFor": [
   "Reef and marine life",
   "Vast outback landscapes",
   "Cosmopolitan coastal cities"
  ],
  "notKnown": "Aboriginal Australians maintain living knowledge systems and art traditions stretching back more than 60,000 years, a source of deep national and cultural pride."
 },
 "FJ": {
  "iso2": "FJ",
  "origin": "Settled by Austronesian and later Melanesian peoples over three millennia ago, Fiji became a British colony in 1874 and gained independence in 1970. Its modern society is shaped by the interaction of Indigenous iTaukei Fijians and a substantial Indo-Fijian population descended from indentured labourers brought during the colonial era.",
  "character": "Fijians are known for warm communal hospitality, expressed through ceremonies such as the sharing of kava, and a strong village-based social structure. Visitors are often surprised that beyond the resort islands lies a culturally layered nation with a rich blend of Pacific and South Asian traditions.",
  "complexity": "Questions of land ownership, electoral representation, and the political balance between the iTaukei and Indo-Fijian communities have shaped Fiji's history and are best understood with sensitivity and neutrality.",
  "bestFor": [
   "Island and reef diving",
   "Village hospitality culture",
   "Multicultural Pacific cuisine"
  ],
  "notKnown": "Fiji's traditional firewalking ceremonies, performed on heated stones, are a closely held cultural practice that predates tourism."
 },
 "KI": {
  "iso2": "KI",
  "origin": "The islands of Kiribati were settled by Micronesian peoples and later joined with the Ellice Islands under British administration as the Gilbert and Ellice Islands; Kiribati gained independence in 1979. Spread across a vast expanse of the central Pacific, it is one of the most geographically dispersed nations on Earth, straddling both the equator and the International Date Line.",
  "character": "I-Kiribati society is rooted in extended-family obligation, oral tradition, and the rhythms of atoll and ocean life. Visitors are often struck by the remoteness, the limited footprint of tourism, and the resilience of communities living on narrow, low-lying coral atolls.",
  "complexity": "As a low-lying atoll nation, Kiribati faces acute exposure to sea-level rise and freshwater scarcity, and discussions of long-term habitability and migration are a serious part of national life.",
  "bestFor": [
   "Remote atoll travel",
   "World-class bonefishing",
   "Living Micronesian culture"
  ],
  "notKnown": "Kiribati administers the Phoenix Islands Protected Area, one of the largest marine protected areas in the world."
 },
 "MH": {
  "iso2": "MH",
  "origin": "The Marshall Islands were settled by Micronesian navigators around two thousand years ago and passed through Spanish, German, and Japanese control before becoming part of a United Nations trust territory administered by the United States; the nation became fully self-governing in free association with the United States by 1986. Its identity is shaped by exceptional traditional navigation skills and a complex modern relationship with the United States.",
  "character": "Marshallese culture centres on clan ties, matrilineal land inheritance, and an extraordinary heritage of open-ocean wayfinding. Visitors are often surprised by the scale of the lagoons, among the largest in the world, and the warmth of small-island community life.",
  "complexity": "The legacy of mid-twentieth-century nuclear testing on certain atolls continues to affect health, land use, and relations with the United States, and remains a sensitive subject for many Marshallese.",
  "bestFor": [
   "Lagoon and wreck diving",
   "Traditional navigation heritage",
   "Remote Pacific solitude"
  ],
  "notKnown": "Marshallese navigators developed intricate stick charts mapping ocean swell patterns, a sophisticated wayfinding science admired worldwide."
 },
 "FM": {
  "iso2": "FM",
  "origin": "The Federated States of Micronesia comprises the island groups of Yap, Chuuk, Pohnpei, and Kosrae, settled by Micronesian and related peoples over millennia and later administered successively by Spain, Germany, Japan, and the United States. It became an independent nation in free association with the United States in 1986, retaining considerable cultural and linguistic diversity across its four states.",
  "character": "Each of the four states maintains distinct languages, customs, and identities, united by deep respect for tradition, kinship, and the sea. Visitors are often surprised by the diversity within such a small federation, from Yap's stone-money culture to Pohnpei's rainforest-clad ruins.",
  "complexity": "Balancing the autonomy of four culturally distinct states with national cohesion, and managing the terms of the Compact with the United States, are ongoing matters of governance.",
  "bestFor": [
   "Pristine wreck diving",
   "Ancient stone ruins",
   "Distinct island cultures"
  ],
  "notKnown": "The ruined city of Nan Madol off Pohnpei, built on basalt islets over a coral lagoon, is one of the Pacific's most remarkable ancient engineering achievements."
 },
 "NR": {
  "iso2": "NR",
  "origin": "Nauru was settled by Micronesian and Polynesian peoples organised into traditional clans, then administered under German, Australian, and United Nations mandates before gaining independence in 1968. Once among the wealthiest nations per capita due to extensive phosphate mining, it has since navigated the economic and environmental consequences of that legacy.",
  "character": "Nauruan society retains a strong sense of clan identity and community on one of the world's smallest island nations. Visitors are often surprised by the contrast between the narrow coastal ring of life and the mined interior plateau, and by the island's quiet, untouristed atmosphere.",
  "complexity": "Decades of phosphate extraction reshaped much of the island's interior, and economic diversification and land rehabilitation remain significant challenges that are openly acknowledged.",
  "bestFor": [
   "Off-the-map travel",
   "Phosphate-era history",
   "Quiet coastal fishing"
  ],
  "notKnown": "Nauru is one of the smallest sovereign nations in the world, yet maintains its own distinct language and a full seat at the United Nations."
 },
 "NZ": {
  "iso2": "NZ",
  "origin": "Aotearoa New Zealand was settled by Polynesian Maori from around the thirteenth century, followed by European, principally British, settlement; the Treaty of Waitangi, signed in 1840, remains the country's foundational document. It is today a parliamentary democracy with a bicultural foundation and an increasingly multicultural society.",
  "character": "New Zealanders balance an outdoorsy, understated practicality with a growing pride in Maori language and culture woven into national life. Visitors are often surprised by the compactness and variety of the landscape, where glaciers, rainforest, volcanoes, and coastline lie within short distances.",
  "complexity": "Interpretation of the Treaty of Waitangi and the place of Maori rights and partnership within the modern state are matters of genuine, ongoing national discussion.",
  "bestFor": [
   "Adventure and the outdoors",
   "Dramatic varied scenery",
   "Maori cultural heritage"
  ],
  "notKnown": "The Maori language, te reo Maori, has undergone a major revitalisation and is an official language that New Zealanders increasingly take pride in using."
 },
 "PW": {
  "iso2": "PW",
  "origin": "Palau was settled by Austronesian peoples thousands of years ago and passed through Spanish, German, Japanese, and United States administration before becoming independent in free association with the United States in 1994. Its identity blends ancient matrilineal traditions with a modern reputation as a global leader in marine conservation.",
  "character": "Palauan culture is organised around matrilineal clans, customary chiefs, and elaborate communal traditions centred on the bai meeting house. Visitors are often surprised by the country's pioneering environmental ethic, including a pledge stamped into every passport committing travellers to protect the islands.",
  "complexity": "Palau balances the economic importance of tourism against strong commitments to environmental protection, a tension it navigates more openly than most destinations.",
  "bestFor": [
   "Iconic Rock Islands",
   "Marine conservation diving",
   "Matrilineal cultural depth"
  ],
  "notKnown": "Palau established the world's first shark sanctuary and protects most of its waters from commercial fishing, a point of considerable national pride."
 },
 "PG": {
  "iso2": "PG",
  "origin": "Papua New Guinea has been inhabited for tens of thousands of years and is among the most linguistically and culturally diverse places on Earth, with over 800 languages; it was administered by Germany, Britain, and Australia before gaining independence in 1975. Its modern state unites highland, coastal, and island societies that retain strong local identities.",
  "character": "Papua New Guineans maintain vibrant clan-based cultures expressed through elaborate sing-sings, distinctive art, and deep ties to land and ancestry. Visitors are often surprised by the extraordinary cultural variety and by how much of the interior remains rugged, remote, and traditionally governed.",
  "complexity": "Reconciling hundreds of distinct cultural and linguistic groups, customary land tenure, and a modern national framework is a continual and openly recognised undertaking.",
  "bestFor": [
   "Highland cultural festivals",
   "Remote trekking and birding",
   "World-class reef diving"
  ],
  "notKnown": "Papua New Guinea is home to more than 800 living languages, the highest linguistic diversity of any country in the world."
 },
 "WS": {
  "iso2": "WS",
  "origin": "Samoa was settled by Polynesians some three thousand years ago and is considered a cultural heartland of Polynesia; after a period of German and then New Zealand administration, it became the first Pacific island nation to gain independence in 1962. Traditional governance through the fa'a Samoa, or Samoan way, continues to structure daily life.",
  "character": "Samoan identity rests on the fa'a Samoa, an enduring system of extended family, chiefly titles, and communal obligation. Visitors are often surprised by how strongly customary life governs villages, from communal land to the central role of the church and the matai chief system.",
  "complexity": "Samoa balances deeply rooted customary authority and Christian observance with the expectations of modern individual rights, a nuance visitors should approach respectfully.",
  "bestFor": [
   "Authentic Polynesian culture",
   "Lava-formed swimming holes",
   "Village homestay immersion"
  ],
  "notKnown": "Samoans take pride in the fa'amatai chiefly system, a sophisticated traditional governance structure that continues to underpin national political life."
 },
 "SB": {
  "iso2": "SB",
  "origin": "The Solomon Islands were settled by Melanesian and later Polynesian peoples thousands of years ago, became a British protectorate in the late nineteenth century, and gained independence in 1978. The nation spans hundreds of islands with great linguistic diversity and a history marked by significant World War II campaigns.",
  "character": "Solomon Islanders maintain strong wantok kinship networks, custom (kastom) traditions, and a largely rural, subsistence-based way of life. Visitors are often surprised by the abundant World War II history, the pristine reefs, and the warmth of communities far from any tourist circuit.",
  "complexity": "Relations among the country's many island and language groups have at times been strained, and visitors benefit from understanding this diversity with care and neutrality.",
  "bestFor": [
   "WWII history and wrecks",
   "Untouched reef diving",
   "Authentic kastom culture"
  ],
  "notKnown": "The Solomon Islands has more than 70 distinct languages, and the lagoon of Marovo is one of the largest saltwater lagoons in the world."
 },
 "TO": {
  "iso2": "TO",
  "origin": "Tonga was settled by Polynesians around three thousand years ago and developed a powerful maritime chiefdom; it is the only Pacific nation never formally colonised, retaining its monarchy through a period as a British-protected state until full sovereignty was reaffirmed in 1970. The Tongan monarchy and noble system remain central to national identity today.",
  "character": "Tongans take deep pride in their unbroken monarchy, strong Christian faith, and rich traditions of dance, tapa cloth, and communal feasting. Visitors are often surprised by the formality and reverence surrounding the royal family and church, and by the seasonal opportunity to swim with migrating humpback whales.",
  "complexity": "Tonga has been gradually evolving from an absolute toward a more representative monarchy, and discussions of constitutional reform are part of contemporary national life.",
  "bestFor": [
   "Swimming with whales",
   "Living Polynesian monarchy",
   "Traditional feasting culture"
  ],
  "notKnown": "Tonga is the only Pacific island nation never to have been formally colonised, a fact in which Tongans take great pride."
 },
 "TV": {
  "iso2": "TV",
  "origin": "Tuvalu was settled by Polynesian peoples and administered as part of the British Gilbert and Ellice Islands before separating and gaining independence in 1978. One of the world's smallest and most remote nations, it consists of nine low-lying atolls and reef islands in the central Pacific.",
  "character": "Tuvaluan society is built on close-knit island communities, communal land, and a strong Christian and traditional cultural life. Visitors are often surprised by the extreme remoteness, the rarity of tourism, and the gentle pace of life on islands only a few metres above sea level.",
  "complexity": "As one of the lowest-lying nations on Earth, Tuvalu faces serious exposure to sea-level rise, and questions of long-term habitability and statehood are central to its diplomacy.",
  "bestFor": [
   "Truly remote travel",
   "Atoll community life",
   "Quiet lagoon waters"
  ],
  "notKnown": "Tuvalu earns significant national revenue from licensing its '.tv' internet domain, a point of pragmatic pride for such a small nation."
 },
 "VU": {
  "iso2": "VU",
  "origin": "Vanuatu was settled by Melanesian peoples some three thousand years ago and was jointly administered by Britain and France as the New Hebrides Condominium before gaining independence in 1980. Its modern identity reflects this dual colonial heritage layered over exceptional Indigenous cultural and linguistic diversity.",
  "character": "Ni-Vanuatu maintain vibrant kastom traditions, including distinctive ceremonies, dances, and the famous land-diving ritual of Pentecost Island. Visitors are often surprised by the country's accessible active volcanoes and by its consistent ranking among the world's happiest and most community-oriented societies.",
  "complexity": "Vanuatu's dual British and French colonial legacy left lasting effects on language and institutions, and balancing this with strong customary authority is part of the national fabric.",
  "bestFor": [
   "Accessible active volcanoes",
   "Living kastom traditions",
   "Reef and wreck diving"
  ],
  "notKnown": "Vanuatu has one of the highest concentrations of languages per capita on Earth, with more than 100 Indigenous languages spoken among a small population."
 }
};

// ─── Additional traveler dossier content for all ~195 countries (generated) ───
const COUNTRY_EXTRA = {
 "AL": {
  "iso2": "AL",
  "tapWater": {
   "status": "caution",
   "note": "Locals use it for cooking and brushing teeth, but visitors should stick to bottled water to avoid stomach upset, especially outside Tirana."
  },
  "etiquette": [
   "Accept offered coffee or raki when visiting someone's home; refusing outright can seem cold.",
   "Note that a nod can mean 'no' and a head shake can mean 'yes' in some interactions, so confirm verbally.",
   "Dress modestly when entering mosques or Orthodox churches and remove shoes where indicated.",
   "Avoid loud political talk about the communist era or the Kosovo question unless locals raise it first."
  ],
  "transport": "From Tirana International Airport (Rinas) the Rinas Express bus runs to the city center for a few euros, while taxis are metered but often negotiated; in town shared furgon minibuses and city buses dominate. Bolt operates inconsistently in Tirana, so a reliable local taxi number is useful.",
  "connectivity": "Prepaid SIMs from Vodafone, One or Telekom are cheap and sold with passport at airport and city shops; 4G is solid in cities and along main roads, with eSIM available on the major carriers.",
  "payments": "Cash in Albanian lek is needed for furgons, markets and rural areas, though cards work in hotels and city restaurants and many businesses also accept euros informally."
 },
 "AD": {
  "iso2": "AD",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is clean and safe throughout the principality, sourced from mountain supplies."
  },
  "etiquette": [
   "Greet shopkeepers with 'bon dia' (Catalan) rather than defaulting to Spanish or French.",
   "Drive carefully and carry winter tyres or chains in season, as mountain roads are the only way around.",
   "Respect quiet, family-oriented mealtimes; lunch is the main meal and runs early afternoon.",
   "Do not assume duty-free shopping means no limits; declare goods when crossing into France or Spain."
  ],
  "transport": "There is no airport or train; most visitors arrive by car or bus from Barcelona, Toulouse or Girona airports (roughly three hours), and a comprehensive public bus network links the parishes. There is no Uber or Bolt; use local taxis or the buses.",
  "connectivity": "The sole operator is Andorra Telecom (Mobiland); travelers usually roam on Spanish or French SIMs, and prepaid tourist SIMs exist but are pricier, with strong 4G/5G in the valleys.",
  "payments": "Cards and contactless are widely accepted in shops and restaurants, though euros in cash are handy for small purchases and parking."
 },
 "AT": {
  "iso2": "AT",
  "tapWater": {
   "status": "safe",
   "note": "Excellent quality nationwide, much of Vienna's supply piped directly from Alpine springs."
  },
  "etiquette": [
   "Use formal titles and 'Gruss Gott' as a greeting; address professionals by surname until invited otherwise.",
   "Be punctual for appointments, tours and dinner reservations, as lateness is considered rude.",
   "Keep quiet and orderly in public transport and queues; loud phone calls draw disapproval.",
   "Sort your rubbish into the correct recycling bins, which is taken seriously."
  ],
  "transport": "Vienna Airport connects to the city via the CAT and cheaper S-Bahn (S7) trains in about 16-25 minutes; cities run excellent integrated U-Bahn, tram and bus networks. Uber and Bolt operate in Vienna alongside the FreeNow taxi app.",
  "connectivity": "Prepaid SIMs from A1, Magenta or Drei are inexpensive and registration is straightforward; coverage and 5G are excellent, and eSIMs are widely supported.",
  "payments": "Cards and contactless are accepted almost everywhere, though carrying some euro cash is wise for small bakeries, markets and rural inns that remain cash-preferring."
 },
 "BY": {
  "iso2": "BY",
  "tapWater": {
   "status": "caution",
   "note": "Generally chlorinated and safe in Minsk, but bottled water is advisable elsewhere and for sensitive stomachs."
  },
  "etiquette": [
   "Carry your passport and registration documents, as identity checks can occur and overstaying visa-free terms is penalised.",
   "Avoid photographing government buildings, military sites, metro infrastructure and police.",
   "Refrain from public political discussion or protest, which carries real legal risk.",
   "Bring a small gift and remove your shoes when invited into a home."
  ],
  "transport": "From Minsk National Airport the official airport buses and shared minibuses reach the city in about an hour, with metered taxis available; Minsk has a clean metro plus trams and trolleybuses. The Yandex Go app is the dominant ride-hailing option rather than Uber or Bolt.",
  "connectivity": "Local SIMs (A1, MTS, life:)) require passport registration; 4G is good in cities, though some foreign websites and messaging services may be restricted or filtered.",
  "payments": "Cards work in Minsk hotels, malls and restaurants, but carry Belarusian rubles in cash for transport, markets and smaller towns; international card networks can be unreliable due to sanctions."
 },
 "BE": {
  "iso2": "BE",
  "tapWater": {
   "status": "safe",
   "note": "Safe to drink everywhere, though restaurants may push bottled water by default."
  },
  "etiquette": [
   "Be sensitive to the language divide: use French in Brussels and Wallonia, Dutch in Flanders, and default to English if unsure.",
   "Greet with a single cheek kiss among acquaintances, or a handshake in formal settings.",
   "Do not jaywalk in front of police and respect cycle lanes, especially in Flemish cities.",
   "Order beer thoughtfully; each style has its own glass and locals take it seriously."
  ],
  "transport": "Brussels Airport links to the center by frequent trains (about 20 minutes) and the Airport Line bus; cities run dense tram, metro and bus networks plus excellent intercity rail. Uber and Bolt operate in Brussels alongside the FreeNow app.",
  "connectivity": "Prepaid SIMs from Proximus, Orange or Base are easy to buy and inexpensive; 4G/5G coverage is strong nationwide and eSIMs are well supported.",
  "payments": "Cards and contactless are accepted almost everywhere and Bancontact is the local card standard, though small cash sums help at markets and some bars."
 },
 "BA": {
  "iso2": "BA",
  "tapWater": {
   "status": "safe",
   "note": "Safe in cities like Sarajevo and Mostar; consider bottled water in rural or older-building areas."
  },
  "etiquette": [
   "Dress modestly at mosques, cover your head as a woman, and remove shoes before entering prayer halls.",
   "Be mindful when discussing the 1990s war; let locals lead such conversations.",
   "Accept the offer of Bosnian coffee and sip it slowly, as it is a social ritual.",
   "Avoid stepping on or photographing 'Sarajevo Roses' (shell-scar memorials) disrespectfully."
  ],
  "transport": "From Sarajevo International Airport a taxi or the Centrotrans shuttle reaches the center in 15-25 minutes; intercity buses are the backbone of travel, while Sarajevo has trams and trolleybuses. Bolt operates in Sarajevo and a few other cities, but coverage is limited so keep a local taxi number handy.",
  "connectivity": "Prepaid SIMs from BH Telecom, m:tel or HT Eronet are cheap and need passport registration; 4G is reliable in towns and along main routes, with eSIM available on some carriers.",
  "payments": "Cash in convertible marka (KM) is essential for buses, markets and small towns, though cards are accepted in city hotels, supermarkets and larger restaurants."
 },
 "BG": {
  "iso2": "BG",
  "tapWater": {
   "status": "safe",
   "note": "Safe in Sofia and major cities; some travelers prefer bottled water in remote rural areas."
  },
  "etiquette": [
   "Remember that nodding the head means 'no' and shaking it means 'yes', so confirm verbally to avoid confusion.",
   "Dress modestly and cover shoulders in Orthodox churches and monasteries.",
   "Validate your ticket on city buses, trams and the metro to avoid fines.",
   "Carry your passport, as random ID checks can occur."
  ],
  "transport": "Sofia Airport connects to the center via Metro Line 1 in about 20 minutes for a single low-cost ticket; cities run metro, trams, trolleybuses and marshrutka minibuses. Both Uber-style apps are absent, but Bolt and the local TaxiMe app are widely used.",
  "connectivity": "Prepaid SIMs from A1, Yettel or Vivacom are inexpensive with passport registration; 4G/5G coverage is good in populated areas and eSIM is supported.",
  "payments": "Cards and contactless are common in cities, but keep Bulgarian lev in cash for markets, minibuses and small towns; the country plans euro adoption but the lev remains in daily use."
 },
 "HR": {
  "iso2": "HR",
  "tapWater": {
   "status": "safe",
   "note": "Safe to drink throughout the country, including on the coast and islands."
  },
  "etiquette": [
   "Cover shoulders and knees when entering churches, particularly in Dubrovnik and coastal towns.",
   "Avoid wearing swimwear away from the beach; many coastal towns fine for walking through streets undressed.",
   "Be patient with the relaxed coastal pace ('pomalo') in service and dining.",
   "Do not climb on or damage old city walls and historic stonework."
  ],
  "transport": "From Zagreb, Split or Dubrovnik airports, shuttle buses and taxis reach the centers in 20-40 minutes; intercity buses and coastal ferries (Jadrolinija) are the main long-distance modes. Uber and Bolt both operate in Zagreb, Split and other larger cities.",
  "connectivity": "Prepaid tourist SIMs from Hrvatski Telekom (Hrvatski/A1) are cheap and easy; 4G/5G coverage is strong even on islands and the coast, with eSIM widely available.",
  "payments": "Croatia uses the euro and cards and contactless are accepted almost everywhere, though small cash sums are useful on ferries, in markets and at island konobas."
 },
 "CY": {
  "iso2": "CY",
  "tapWater": {
   "status": "safe",
   "note": "Safe to drink, though desalinated supply can taste salty so many prefer bottled water."
  },
  "etiquette": [
   "Remember traffic drives on the left, a legacy of British rule, when crossing roads or renting a car.",
   "Dress modestly and cover shoulders when visiting churches and monasteries.",
   "Carry your passport if crossing the Green Line between the Republic and the north.",
   "Avoid photographing military zones and buffer-zone checkpoints."
  ],
  "transport": "Larnaca and Paphos airports connect to towns by airport shuttle buses and taxis, as there are no trains; intercity and urban buses are the only public transport, so renting a car is common. Bolt operates but Cyprus restricts ride-hailing largely to licensed taxi drivers, so expect taxi-style pricing.",
  "connectivity": "Prepaid SIMs from Cyta, Epic or PrimeTel are easy to buy; 4G/5G coverage is excellent across the south, and eSIMs are widely supported.",
  "payments": "Cyprus uses the euro and cards and contactless are accepted nearly everywhere, with cash useful mainly for small tavernas, kiosks and rural villages."
 },
 "CZ": {
  "iso2": "CZ",
  "tapWater": {
   "status": "safe",
   "note": "Safe and good quality throughout, including Prague."
  },
  "etiquette": [
   "Say 'dobry den' on entering shops and 'na shledanou' when leaving; politeness formulas matter.",
   "Keep your voice down on trams, the metro and in restaurants.",
   "Do not be loud or rowdy in residential areas at night, especially in central Prague.",
   "Remove shoes when entering a Czech home."
  ],
  "transport": "From Prague's Vaclav Havel Airport the Airport Express bus and city bus 119 (to the metro) reach the center cheaply; Prague runs an excellent metro, tram and bus system. Both Uber and Bolt operate widely in Prague and other cities.",
  "connectivity": "Prepaid SIMs from O2, T-Mobile or Vodafone are inexpensive and easy; 4G/5G coverage is excellent and eSIM is well supported.",
  "payments": "Cards and contactless are accepted almost everywhere, but keep Czech koruna in cash for some pubs, kiosks and public-transport ticket machines; the koruna remains the currency rather than the euro."
 },
 "DK": {
  "iso2": "DK",
  "tapWater": {
   "status": "safe",
   "note": "Excellent quality nationwide, drawn largely from groundwater."
  },
  "etiquette": [
   "Always watch for and stay out of cycle lanes, which are heavily used and have right of way.",
   "Respect personal space and quiet; small talk with strangers is uncommon.",
   "Be punctual, as Danes value timeliness for both social and business meetings.",
   "Embrace 'hygge' by removing shoes in homes and joining relaxed, candle-lit gatherings."
  ],
  "transport": "Copenhagen Airport links to the center in about 15 minutes by Metro (M2) and regional train; cities have superb metro, train, bus and cycling infrastructure. Uber does not operate; use the local taxi apps such as Viggo or Dantaxi, or simply hail licensed taxis.",
  "connectivity": "Prepaid SIMs from TDC/Telmore, Telia or 3 are easy to buy; 4G/5G coverage is excellent nationwide and eSIM is widely supported.",
  "payments": "Denmark is heavily cashless; cards and the MobilePay app are used almost universally, and many places no longer accept cash, though the currency is the krone, not the euro."
 },
 "EE": {
  "iso2": "EE",
  "tapWater": {
   "status": "safe",
   "note": "Safe to drink throughout, including Tallinn."
  },
  "etiquette": [
   "Value calm and reserve; avoid overly loud behavior and respect personal space.",
   "Be punctual and direct in communication, which Estonians appreciate.",
   "Remove your shoes when entering a private home.",
   "Do not assume Estonia is 'Russian'; acknowledge its distinct language and identity."
  ],
  "transport": "From Tallinn Airport tram line 4 reaches the city center in about 15 minutes, and taxis are quick; Tallinn offers free public transport to registered residents but cheap tickets for visitors on trams, buses and trolleybuses. Both Bolt (Estonian-founded) and Uber operate extensively.",
  "connectivity": "Prepaid SIMs from Telia, Elisa or Tele2 are very cheap with strong data allowances; Estonia is highly digital with excellent 4G/5G and broad eSIM support.",
  "payments": "Estonia uses the euro and is largely cashless, with cards, contactless and mobile payments accepted virtually everywhere; cash is rarely needed."
 },
 "FI": {
  "iso2": "FI",
  "tapWater": {
   "status": "safe",
   "note": "Among the cleanest tap water in the world; safe everywhere."
  },
  "etiquette": [
   "Respect silence and personal space; comfortable pauses in conversation are normal, not awkward.",
   "Follow sauna etiquette: shower first, usually go nude, and keep the experience calm.",
   "Remove shoes when entering homes and many other indoor settings.",
   "Be punctual and let people keep their distance in queues and on transport."
  ],
  "transport": "Helsinki Airport connects to the center in about 30 minutes via the I and P commuter trains; Helsinki runs an integrated metro, tram, bus and ferry network under HSL. Both Uber and Bolt operate in Helsinki and larger cities.",
  "connectivity": "Prepaid SIMs from DNA, Elisa or Telia are cheap with generous data; 4G/5G coverage is excellent even in remote areas, and eSIM is widely supported.",
  "payments": "Finland is highly cashless; cards and contactless are accepted everywhere and MobilePay is common, so cash in euros is rarely required."
 },
 "FR": {
  "iso2": "FR",
  "tapWater": {
   "status": "safe",
   "note": "Safe to drink nationwide; ask for 'une carafe d'eau' for free tap water in restaurants."
  },
  "etiquette": [
   "Always greet with 'bonjour' before asking anything in shops, or you may be seen as rude.",
   "Attempt a few words of French; switching to English without trying can be poorly received.",
   "Keep your voice moderate in restaurants and on public transport.",
   "Dress neatly and cover shoulders and knees when visiting churches and cathedrals."
  ],
  "transport": "Paris airports link to the center via the RER B (CDG) or Orlyval/tram (Orly), with the new line 14 metro also serving Orly; cities run extensive metro, tram, bus and rail networks. Uber and Bolt both operate in Paris and major cities alongside the G7 taxi app.",
  "connectivity": "Prepaid SIMs from Orange, SFR, Bouygues or Free are inexpensive; 4G/5G coverage is excellent in cities and good in rural areas, with eSIM widely supported.",
  "payments": "Cards and contactless are accepted almost everywhere and France uses the euro, though small cash sums are useful for bakeries, markets and some rural cafes."
 },
 "DE": {
  "iso2": "DE",
  "tapWater": {
   "status": "safe",
   "note": "High quality and safe nationwide, though restaurants often serve bottled water by default."
  },
  "etiquette": [
   "Be punctual for everything; lateness is considered disrespectful.",
   "Wait for the green pedestrian signal and avoid jaywalking, which draws strong disapproval.",
   "Bring cash for many smaller venues, and sort recycling carefully where bins are provided.",
   "Keep quiet hours (Ruhezeit) in mind, particularly on Sundays and at night."
  ],
  "transport": "Major airports like Frankfurt, Munich and Berlin connect to city centers via S-Bahn trains in 15-45 minutes; cities run integrated U-Bahn, S-Bahn, tram and bus networks. Uber operates (dispatching licensed taxis), as do Bolt and the FreeNow app in larger cities.",
  "connectivity": "Prepaid SIMs from Telekom, Vodafone or O2 require passport registration; 4G/5G is strong in cities though rural coverage can dip, and eSIM is widely supported.",
  "payments": "Germany remains relatively cash-friendly, so carry euro cash for bakeries, bars and small shops, even though cards and contactless are increasingly accepted in cities."
 },
 "GR": {
  "iso2": "GR",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe in Athens, Thessaloniki and the mainland, but on many islands it is brackish or desalinated, so locals drink bottled."
  },
  "etiquette": [
   "Greet shopkeepers and taverna staff with a spoken kalimera or kalispera rather than walking in silently.",
   "Dress with covered shoulders and knees when entering churches and monasteries.",
   "Avoid rushing meals; lingering at the table is expected and asking for the bill early can read as abrupt.",
   "Do not photograph military installations or personnel, which is prohibited."
  ],
  "transport": "Athens airport connects to the centre by metro Line 3, the X95 express bus and a fixed-fare taxi; cities rely on metro, buses and trams, and islands on ferries. Uber routes only to licensed taxis, while the Beat and FREENOW apps are the standard ride-hailing tools.",
  "connectivity": "Prepaid SIMs from Cosmote, Vodafone and Nova are sold widely and eSIMs are supported; 4G and 5G coverage is strong in cities and reliable on most inhabited islands.",
  "payments": "Cards and contactless are accepted in most establishments, though small tavernas, kiosks and island vendors often prefer cash, so carry euros."
 },
 "HU": {
  "iso2": "HU",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is potable throughout the country and Budapest's supply is of high quality."
  },
  "etiquette": [
   "Clinking beer glasses is traditionally avoided by some Hungarians for historical reasons, so follow local cues.",
   "Use formal address and a handshake when meeting someone for the first time.",
   "Validate transit tickets in the on-platform or on-board machines, as inspectors fine unvalidated tickets.",
   "Remove your shoes when entering a private Hungarian home."
  ],
  "transport": "Budapest Airport links to the city via the fixed-fare official taxi partner and the 100E direct bus to Deak Ferenc ter; the capital has an extensive metro, tram and bus network. Bolt operates for ride-hailing, while Uber does not run in Hungary.",
  "connectivity": "Prepaid SIMs from Yettel, Magyar Telekom and Vodafone are easy to obtain and eSIMs are supported; 4G and 5G coverage is excellent in Budapest and good nationwide.",
  "payments": "Cards and contactless are very widely accepted, including on transit, though carrying some forint is useful for markets and small rural vendors."
 },
 "IS": {
  "iso2": "IS",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is among the cleanest in the world and bottled water is unnecessary; cold tap water is the best to drink as hot water carries a sulphur smell."
  },
  "etiquette": [
   "Shower thoroughly without a swimsuit before entering public pools and the thermal baths.",
   "Stay on marked paths and never drive off-road, which is illegal and damages fragile terrain.",
   "Do not stop on the road shoulder for photos; use designated pull-offs.",
   "Respect private land and closed gates around farms and natural sites."
  ],
  "transport": "Keflavik Airport connects to Reykjavik mainly by the Flybus and Airport Direct coaches rather than rail, as Iceland has no trains. A rental car is the dominant way to explore; ride-hailing apps such as Uber and Bolt do not operate, so use the Hreyfill taxi service.",
  "connectivity": "Prepaid SIMs from Siminn, Vodafone and Nova are sold at the airport and shops and eSIMs are supported; 4G coverage is strong around populated areas though it thins in the highlands.",
  "payments": "Iceland is almost entirely cashless, with cards and contactless accepted everywhere including remote fuel pumps, so a card is essential."
 },
 "IE": {
  "iso2": "IE",
  "tapWater": {
   "status": "safe",
   "note": "Public tap water is safe to drink, though occasional local boil notices are issued and rural private wells vary."
  },
  "etiquette": [
   "Buy your round when drinking in a group at the pub, as taking turns is a strong social norm.",
   "Queue patiently and avoid pushing in, which is poorly received.",
   "Look right first when crossing roads, as traffic drives on the left.",
   "Avoid loud or political commentary about Northern Ireland with strangers."
  ],
  "transport": "Dublin Airport connects to the city by the Airlink and Aircoach buses and licensed taxis; there is no rail link from the airport. Dublin uses buses, the Luas tram and DART rail, and the FREENOW app is the dominant taxi-hailing tool while Uber dispatches only licensed taxis.",
  "connectivity": "Prepaid SIMs from Three, Vodafone, Eir and GoMo are widely available and eSIMs are supported; 4G and 5G coverage is good in cities but patchy in rural west-coast areas.",
  "payments": "Cards and contactless are accepted almost everywhere including buses and small shops, though carrying some euro is useful for rural pubs and markets."
 },
 "IT": {
  "iso2": "IT",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe nationwide and public fountains in cities like Rome provide free drinking water."
  },
  "etiquette": [
   "Cover shoulders and knees to enter churches such as St Peter's and the Duomo.",
   "Validate regional train tickets at the platform machines before boarding to avoid fines.",
   "Order coffee standing at the bar for the local rate; table service costs more and a cappuccino after morning is unusual.",
   "Avoid sitting on monument steps or eating beside major landmarks where local ordinances prohibit it."
  ],
  "transport": "Major airports such as Rome Fiumicino and Milan Malpensa link to the centre by dedicated express trains and buses; cities use metros, trams and buses, and intercity travel relies on the fast Frecce and Italo trains. Uber operates only as the premium Uber Black in a few cities, so use the FREENOW or itTaxi apps.",
  "connectivity": "Prepaid SIMs from TIM, Vodafone, WindTre and Iliad are sold widely and eSIMs are supported; 4G and 5G coverage is strong in cities and good along travel corridors.",
  "payments": "Cards and contactless are accepted in most venues and merchants are legally required to accept them, though small trattorias, markets and rural shops still favour cash."
 },
 "XK": {
  "iso2": "XK",
  "tapWater": {
   "status": "caution",
   "note": "Tap water quality is inconsistent across the country and many residents and travelers drink bottled water."
  },
  "etiquette": [
   "Remove your shoes when entering homes and cover up when visiting mosques.",
   "Accept offered coffee or tea when visiting, as hospitality is central and refusing can seem rude.",
   "Carry your passport, as Kosovo entry can complicate later travel through Serbia if you entered via Serbia first.",
   "Be measured when discussing ethnic and political topics around Serbia and independence."
  ],
  "transport": "Pristina Airport connects to the city by taxi or the airport shuttle bus, as there is no rail link; intercity travel runs on buses and furgon minibuses. Ride-hailing is limited, so use local taxi companies or apps such as Paki Taxi rather than Uber or Bolt.",
  "connectivity": "Prepaid SIMs from Vala and IPKO are inexpensive and easy to buy; 4G coverage is solid in Pristina and main towns, and eSIM availability is improving but limited.",
  "payments": "Kosovo uses the euro and cash remains common, especially outside Pristina, though cards are increasingly accepted in city hotels, restaurants and supermarkets."
 },
 "LV": {
  "iso2": "LV",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe to drink, though it can taste slightly chlorinated in Riga."
  },
  "etiquette": [
   "Remove your shoes when entering someone's home.",
   "Keep your voice low and reserved in public; loud behaviour stands out.",
   "Validate or tap your e-ticket on Riga public transport to avoid fines.",
   "Treat the Freedom Monument in Riga with respect and avoid disruptive behaviour around it."
  ],
  "transport": "Riga Airport connects to the centre by the number 22 city bus and inexpensive taxis, with a tram extension also serving the route; the capital uses trams, trolleybuses and buses. Bolt is the dominant ride-hailing and taxi app, and Uber also operates.",
  "connectivity": "Prepaid SIMs from LMT, Tele2 and Bite are cheap and widely sold and eSIMs are supported; 4G and 5G coverage is excellent in cities and good nationally.",
  "payments": "Cards and contactless are accepted almost everywhere, including on transit, though carrying a little euro cash helps at markets and small kiosks."
 },
 "LI": {
  "iso2": "LI",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is of excellent quality and safe to drink throughout the principality."
  },
  "etiquette": [
   "Greet people with a polite Gruezi and use formal address with those you do not know.",
   "Respect strict quiet hours, particularly on Sundays and in the evening.",
   "Sort and dispose of rubbish correctly, as recycling rules are taken seriously.",
   "Avoid jaywalking and wait for pedestrian signals."
  ],
  "transport": "Liechtenstein has no airport; most travelers arrive via Zurich Airport and then train to Sargans or Buchs in Switzerland, continuing by the LIEmobil bus network that covers the whole country. Ride-hailing apps such as Uber and Bolt do not operate, so use local taxis.",
  "connectivity": "Local SIMs are available from Telecom Liechtenstein (FL1) and eSIMs are supported, and roaming with Swiss networks is common; 4G and 5G coverage is excellent across the small territory.",
  "payments": "Liechtenstein uses the Swiss franc and cards and contactless are widely accepted, though carrying some francs is useful for buses and small purchases."
 },
 "LT": {
  "iso2": "LT",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe to drink across the country, including in Vilnius."
  },
  "etiquette": [
   "Remove your shoes when entering a private home.",
   "Behave respectfully and quietly inside the many Catholic churches.",
   "Use a firm handshake and direct address when meeting; over-familiarity early on is uncommon.",
   "Treat sites such as the Hill of Crosses and KGB-history museums with solemnity."
  ],
  "transport": "Vilnius Airport sits close to the centre and connects by a short train ride, public buses and taxis; cities are served by buses and trolleybuses. Bolt is the dominant ride-hailing app and Uber also operates.",
  "connectivity": "Prepaid SIMs from Telia, Bite and Tele2 are inexpensive and widely available and eSIMs are supported; 4G and 5G coverage is very good in cities and along main routes.",
  "payments": "Cards and contactless are accepted almost everywhere, including transit and small shops, though a little euro cash is handy at markets."
 },
 "LU": {
  "iso2": "LU",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe and of high quality throughout the country."
  },
  "etiquette": [
   "Greet with a polite Moien and use formal address with strangers.",
   "Take advantage of and respect the free nationwide public transport rather than driving where possible.",
   "Be punctual for appointments and reservations.",
   "Keep noise down in residential areas, especially on Sundays."
  ],
  "transport": "Luxembourg Airport connects to the city by frequent buses and the number 16 line, with onward tram service; notably, all public transport nationwide (tram, train and bus) is free. Uber does not operate, so use the Webtaxi app or local taxi firms.",
  "connectivity": "Prepaid SIMs from POST, Orange and Tango are easy to buy and eSIMs are supported; 4G and 5G coverage is excellent across the small country.",
  "payments": "Cards and contactless are widely accepted, though some smaller cafes and bakeries still prefer cash, so carry a little euro."
 },
 "MT": {
  "iso2": "MT",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is technically safe as much of it is desalinated, but the taste is hard and most residents and visitors drink bottled or filtered water."
  },
  "etiquette": [
   "Cover shoulders and knees when entering churches, of which there are many.",
   "Look right first when crossing, as Malta drives on the left.",
   "Avoid swimwear away from the beach and pool areas in towns.",
   "Be patient with relaxed local pacing and limited Sunday opening hours."
  ],
  "transport": "Malta International Airport connects to towns by the X-route express buses and taxis, with no rail on the islands; the public bus network is the main way to get around and ferries link to Gozo. The eCabs app is the dominant ride-hailing service, alongside Bolt, while Uber is not a standalone option.",
  "connectivity": "Prepaid SIMs from GO, Epic and Melita are readily available and eSIMs are supported; 4G and 5G coverage is strong across the compact islands.",
  "payments": "Cards and contactless are widely accepted in shops, restaurants and hotels, though buses and small kiosks may still need euro cash."
 },
 "MD": {
  "iso2": "MD",
  "tapWater": {
   "status": "caution",
   "note": "Tap water quality is inconsistent, particularly outside Chisinau, so bottled water is recommended."
  },
  "etiquette": [
   "Bring a small gift such as flowers or wine when invited to a home, giving an odd number of flowers.",
   "Accept offered food and drink, as hospitality and homemade wine are points of pride.",
   "Dress modestly and cover up when visiting Orthodox monasteries and churches.",
   "Be cautious and avoid political debate regarding the breakaway Transnistria region."
  ],
  "transport": "Chisinau Airport connects to the city by the number 30 bus and taxis; intercity travel relies on buses and marshrutka minibuses. Yandex Go and Bolt operate for ride-hailing and are widely used, while Uber does not.",
  "connectivity": "Prepaid SIMs from Orange, Moldcell and Moldtelecom are cheap and easy to buy; 4G coverage is good in cities and main routes, and eSIM availability is growing.",
  "payments": "Cash in Moldovan lei is still common, especially in markets and rural areas, though cards and contactless are increasingly accepted in Chisinau hotels and supermarkets."
 },
 "MC": {
  "iso2": "MC",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe to drink throughout the principality."
  },
  "etiquette": [
   "Dress smartly, particularly around the Casino de Monte-Carlo, which enforces a dress code and a minimum age.",
   "Do not photograph casino interiors, where it is prohibited.",
   "Cover up away from the beach; beachwear is not appropriate in town.",
   "Park only in designated areas, as parking and traffic rules are strictly enforced."
  ],
  "transport": "Monaco has no airport; most arrive via Nice Airport and reach the principality by helicopter, the express bus or train along the coast. Within the tiny state, walk and use the public lifts and escalators; ride-hailing apps such as Uber and Bolt do not meaningfully operate, so use local taxis.",
  "connectivity": "Local service is provided by Monaco Telecom and eSIMs are supported, with French networks reachable nearby; 4G and 5G coverage is excellent across the dense territory.",
  "payments": "Cards and contactless are accepted virtually everywhere and the euro is used, so cash is rarely necessary."
 },
 "ME": {
  "iso2": "ME",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is generally safe to drink in main towns and along the coast, though some travelers prefer bottled water in remote areas."
  },
  "etiquette": [
   "Cover shoulders and knees when visiting Orthodox monasteries such as Ostrog.",
   "Accept an offered rakija or coffee, as refusing hospitality can seem impolite.",
   "Be patient with the relaxed pace captured by the local concept of polako, meaning slowly.",
   "Be measured when discussing regional politics and relations with Serbia."
  ],
  "transport": "Podgorica and Tivat airports connect to towns mainly by taxi and limited shuttle buses rather than rail at the terminal; intercity travel relies on buses, with a scenic but slow rail line. Ride-hailing is limited, so use local taxi firms or apps such as the local Tap Taxi rather than Uber or Bolt.",
  "connectivity": "Prepaid SIMs from Crnogorski Telekom, One and Mtel are inexpensive and easy to buy; 4G coverage is good along the coast and main towns, with eSIM support more limited.",
  "payments": "Montenegro uses the euro and cash is common, especially in smaller towns and markets, though cards are accepted in coastal hotels, restaurants and supermarkets."
 },
 "NL": {
  "iso2": "NL",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is excellent and safe to drink throughout the country."
  },
  "etiquette": [
   "Never walk or stand in the red-painted bike lanes, as cyclists have priority and move fast.",
   "Be direct and punctual; Dutch communication is frank and appointments are expected.",
   "Split the bill rather than expecting one person to pay, which is a common norm.",
   "Do not photograph people in the red-light district of Amsterdam."
  ],
  "transport": "Schiphol Airport connects directly to Amsterdam and other cities by frequent trains from the station beneath the terminal; cities rely on trams, metro, buses and above all cycling. Uber operates in Amsterdam and other large cities, alongside the Bolt app.",
  "connectivity": "Prepaid SIMs from KPN, Vodafone and Odido are widely sold and eSIMs are supported; 4G and 5G coverage is excellent nationwide.",
  "payments": "Cards and contactless are dominant and many places are card-only, with the local PIN debit system widespread, so a contactless card or phone is essential."
 },
 "MK": {
  "iso2": "MK",
  "tapWater": {
   "status": "safe",
   "note": "Tap water in Skopje and most towns is safe to drink, though some travelers prefer bottled for taste."
  },
  "etiquette": [
   "Accept offered coffee or rakija when visiting homes; refusing outright can seem cold.",
   "Avoid debating the country's name dispute with Greece or sensitive Albanian-Macedonian ethnic politics.",
   "Dress modestly when entering Orthodox monasteries and mosques, covering shoulders and knees.",
   "Greet older people and shopkeepers with a polite 'Dobar den' before launching into requests."
  ],
  "transport": "Skopje airport sits about 20 km from the center, reached by the official airport shuttle bus or fixed-rate taxis; in towns walking and inexpensive buses dominate. Ride-hailing apps are limited, but local taxi-booking apps and metered cabs are cheap and reliable.",
  "connectivity": "Cheap prepaid SIMs from A1, Telekom, and Lyca are sold at the airport and shops with good 4G urban coverage; eSIM support is growing but less universal.",
  "payments": "Cards are accepted in cities and supermarkets, but carry Macedonian denar cash for markets, rural areas, and small cafes; mobile payments are not yet widespread."
 },
 "NO": {
  "iso2": "NO",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is among the cleanest in the world and is safe everywhere, including from mountain taps."
  },
  "etiquette": [
   "Respect personal space and quiet; loud conversation on public transport is frowned upon.",
   "Follow 'allemansretten' rules when hiking: leave no trace and keep distance from cabins and farmland.",
   "Remove shoes when entering someone's home unless told otherwise.",
   "Be punctual for tours, dinners, and appointments, as lateness is considered rude."
  ],
  "transport": "Oslo airport connects to the city by the Flytoget express train or cheaper regular NSB trains in about 20-25 minutes; cities rely on efficient trams, buses, and metro. Uber operates in Oslo alongside Bolt, and local taxis are reliable but expensive.",
  "connectivity": "Prepaid SIMs from Telenor, Telia, and Ice are easy to buy and eSIM is widely supported; mobile and wifi coverage is excellent nationwide.",
  "payments": "Norway is nearly cashless: cards and contactless are accepted virtually everywhere, and the Vipps mobile-payment app is ubiquitous among locals."
 },
 "PL": {
  "iso2": "PL",
  "tapWater": {
   "status": "safe",
   "note": "Tap water meets EU standards and is safe to drink, though older buildings may affect taste."
  },
  "etiquette": [
   "Remove shoes when entering a Polish home, as it is standard practice.",
   "Dress respectfully and stay quiet at memorial sites such as Auschwitz-Birkenau.",
   "Cover shoulders and knees inside churches, which remain actively used places of worship.",
   "Avoid sweeping jokes about Polish history or comparisons with Russia."
  ],
  "transport": "Warsaw and Krakow airports link to the center by train and city buses, with Warsaw also served by the SKM rail line; cities have extensive trams, buses, and metro (Warsaw). Uber, Bolt, and FreeNow all operate widely and are inexpensive.",
  "connectivity": "Cheap prepaid SIMs from Play, Orange, Plus, and T-Mobile are sold at kiosks and the airport, with strong 4G/5G; eSIM is well supported.",
  "payments": "Cards and contactless are accepted almost everywhere, including small shops and transit, while BLIK mobile payments are extremely popular among locals."
 },
 "PT": {
  "iso2": "PT",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe to drink across the mainland and islands, though taste varies by region."
  },
  "etiquette": [
   "Greet with 'bom dia' or 'boa tarde' and avoid assuming Spanish is interchangeable with Portuguese.",
   "Be patient and unhurried at meals; lingering over food and coffee is the norm.",
   "Dress modestly when visiting churches and avoid loud behavior inside them.",
   "Avoid comparing Portugal to Spain, which locals find tiresome."
  ],
  "transport": "Lisbon and Porto airports connect to the center by metro, making transfers cheap and fast; cities use trams, metro, and buses, with intercity trains reliable. Uber and Bolt operate widely and are competitively priced.",
  "connectivity": "Prepaid SIMs from MEO, NOS, and Vodafone are easy to obtain and eSIM is supported; mobile coverage is strong in cities and most tourist areas.",
  "payments": "Cards and contactless are widely accepted, though carry some euro cash for small cafes and markets; the MB WAY app is the dominant local mobile-payment method."
 },
 "RO": {
  "iso2": "RO",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is generally safe in major cities like Bucharest but bottled water is advisable in rural areas and older buildings."
  },
  "etiquette": [
   "Greet with a firm handshake and use titles like 'domnul' or 'doamna' until invited to be informal.",
   "Cover shoulders and knees and stay quiet inside Orthodox churches and painted monasteries.",
   "Avoid reductive jokes about Dracula, vampires, or Roma communities.",
   "Bring a small gift such as flowers (in odd numbers) or wine when invited to a home."
  ],
  "transport": "Bucharest's Otopeni airport connects to the center via the dedicated express bus or the metro link, while taxis should use the airport's app dispatch kiosks; cities rely on metro (Bucharest), trams, and buses. Uber and Bolt both operate and are very cheap.",
  "connectivity": "Cheap prepaid SIMs from Orange, Vodafone, and Digi are easy to buy with excellent, fast 4G/5G coverage; eSIM is supported by the major carriers.",
  "payments": "Cards and contactless are widely accepted in cities, but carry Romanian leu cash for rural areas, markets, and small vendors; mobile wallets are increasingly common."
 },
 "RU": {
  "iso2": "RU",
  "tapWater": {
   "status": "caution",
   "note": "Tap water quality varies and bottled or filtered water is recommended, especially in St. Petersburg due to giardia risk."
  },
  "etiquette": [
   "Carry your passport and registration at all times, as document checks occur.",
   "Avoid discussing politics, the war in Ukraine, or government openly with strangers.",
   "Remove shoes when entering homes and bring a small gift for hosts.",
   "Dress modestly in Orthodox churches; women may need a headscarf and men should remove hats."
  ],
  "transport": "Moscow's airports connect reliably to the center via the Aeroexpress train, and both Moscow and St. Petersburg have extensive, cheap metro systems. Yandex Go is the dominant ride-hailing app; Uber merged into it and Western apps are largely unavailable.",
  "connectivity": "Local SIMs from MTS, MegaFon, or Beeline require a passport to register; foreign cards and roaming may be restricted, so confirm connectivity options before arrival.",
  "payments": "Western Visa and Mastercard issued abroad do not work due to sanctions, so bring sufficient cash in rubles; domestic Mir cards and local apps dominate."
 },
 "SM": {
  "iso2": "SM",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe to drink throughout the republic."
  },
  "etiquette": [
   "Dress modestly when visiting the basilica and government buildings on Monte Titano.",
   "Wear sturdy shoes, as the historic center is steep and cobblestoned.",
   "Greet shopkeepers politely in Italian, which is the everyday language.",
   "Have your passport stamped at the tourist office if you want a souvenir, since there is no border control."
  ],
  "transport": "There is no airport; most visitors arrive via Italy's Rimini airport then take a direct bus or drive about 30-40 minutes up to San Marino. Within the microstate, walking and a funicular between levels are the main options, and taxis are limited.",
  "connectivity": "There is a local operator (TIM San Marino), but most visitors rely on Italian SIMs or EU roaming, which works seamlessly; coverage is good across the small territory.",
  "payments": "The euro is used and cards are widely accepted in shops and restaurants, though carrying some cash is useful for smaller vendors."
 },
 "RS": {
  "iso2": "RS",
  "tapWater": {
   "status": "safe",
   "note": "Tap water in Belgrade and most cities is safe to drink, though some prefer bottled in smaller towns."
  },
  "etiquette": [
   "Accept offered rakija or coffee graciously when visiting homes or businesses.",
   "Avoid discussing the 1990s wars, Kosovo, or NATO unless locals raise it first.",
   "Cover shoulders and knees in Orthodox churches and monasteries.",
   "Do not confuse Serbia with neighboring countries or assume regional stereotypes."
  ],
  "transport": "Belgrade's Nikola Tesla airport links to the center via the A1 minibus or city bus 72, plus fixed-price taxi vouchers from the airport desk; cities rely on trams, buses, and trolleybuses. CarGo is the main local ride-hailing app, as Uber and Bolt have limited presence.",
  "connectivity": "Cheap prepaid SIMs from Telekom Srbija (mts), Yettel, and A1 are easy to buy with good 4G coverage; eSIM availability is improving.",
  "payments": "Cards are accepted in cities and supermarkets, but carry Serbian dinar cash for markets, taxis, and rural areas; mobile payments are still emerging."
 },
 "SK": {
  "iso2": "SK",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe and of high quality throughout the country."
  },
  "etiquette": [
   "Remove shoes when entering a Slovak home, as it is expected.",
   "Greet with 'dobry den' and a handshake in formal settings.",
   "Avoid treating Slovakia as interchangeable with the Czech Republic or calling it 'Czechoslovakia'.",
   "Cover shoulders and knees in churches and respect quiet inside them."
  ],
  "transport": "Bratislava airport connects to the center by city bus 61 to the main train station, and Vienna airport is also a common gateway by bus; cities have trams, trolleybuses, and buses. Bolt operates in Bratislava, while Uber's presence is limited.",
  "connectivity": "Prepaid SIMs from Orange, Telekom, and O2 are cheap and widely sold, with strong 4G/5G; eSIM is supported by major carriers.",
  "payments": "Cards and contactless are accepted nearly everywhere, including transit, though carry some euro cash for small mountain villages and markets."
 },
 "SI": {
  "iso2": "SI",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is excellent and safe to drink everywhere, including public fountains in Ljubljana."
  },
  "etiquette": [
   "Remove shoes when entering homes and greet with 'dober dan'.",
   "Avoid lumping Slovenia in with the former Yugoslavia or confusing it with Slovakia.",
   "Respect nature rules in Triglav National Park and stay on marked trails.",
   "Be punctual and reserved in initial interactions; warmth grows with familiarity."
  ],
  "transport": "Ljubljana airport sits about 25 km out and connects by airport shuttle bus or shared minivan transfers; the compact capital is best explored on foot or by cheap city buses with a stored-value Urbana card. Uber is not present, but local taxi apps operate.",
  "connectivity": "Prepaid SIMs from Telekom Slovenije, A1, and Telemach are easy to buy and eSIM is supported; mobile and wifi coverage is strong nationwide.",
  "payments": "Cards and contactless are accepted almost everywhere, though carry some euro cash for small bakeries, markets, and rural spots."
 },
 "ES": {
  "iso2": "ES",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe to drink in mainland cities, though taste is poor in some coastal and island areas where locals favor bottled."
  },
  "etiquette": [
   "Adjust to late schedules: lunch around 2 pm and dinner after 9 pm are normal.",
   "Greet acquaintances with two cheek kisses (women) or a handshake among men.",
   "Avoid loud comparisons or jokes about Catalan or Basque independence movements.",
   "Cover shoulders and knees when entering cathedrals and active churches."
  ],
  "transport": "Madrid and Barcelona airports connect to the center by metro, Cercanias trains, and Aerobus, all cheap and fast; cities have excellent metro, bus, and tram networks plus the high-speed AVE between cities. Uber, Bolt, Cabify, and FreeNow operate, though availability varies by city.",
  "connectivity": "Prepaid SIMs from Movistar, Vodafone, Orange, and Yoigo are easy to buy and eSIM is widely supported; mobile coverage is strong across cities and tourist regions.",
  "payments": "Cards and contactless are accepted nearly everywhere, though carry some euro cash for small bars and markets; Bizum is the dominant local peer-to-peer payment app."
 },
 "SE": {
  "iso2": "SE",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is clean, high quality, and safe to drink everywhere."
  },
  "etiquette": [
   "Remove shoes when entering Swedish homes without exception.",
   "Respect 'lagom' moderation and avoid boasting or loud, attention-seeking behavior.",
   "Queue patiently and take a numbered ticket where dispensers are provided.",
   "Embrace 'fika', the social coffee-and-pastry break, when invited."
  ],
  "transport": "Stockholm's Arlanda airport connects to the center via the fast Arlanda Express train or cheaper Flygbussarna coaches; cities have excellent metro (Stockholm), trams, and buses. Uber and Bolt both operate alongside local taxi firms.",
  "connectivity": "Prepaid SIMs from Telia, Telenor, Tre, and Comviq are easy to buy and eSIM is widely supported; mobile and wifi coverage is excellent.",
  "payments": "Sweden is largely cashless: cards and contactless work everywhere and the Swish mobile-payment app is used by nearly everyone, so many places no longer accept cash."
 },
 "CH": {
  "iso2": "CH",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is pristine and safe to drink, including from the many public fountains unless marked otherwise."
  },
  "etiquette": [
   "Be punctual to the minute for trains, meetings, and social plans.",
   "Greet shopkeepers when entering and leaving, and keep noise down on public transport.",
   "Respect recycling and littering rules strictly, as fines are enforced.",
   "Learn whether your region speaks German, French, or Italian and greet accordingly."
  ],
  "transport": "Zurich and Geneva airports have train stations directly beneath the terminals connecting to city centers in minutes; the nationwide SBB rail, tram, and PostBus network is famously punctual. Uber operates in major cities, though trains and trams are usually more convenient.",
  "connectivity": "Prepaid SIMs from Swisscom, Sunrise, and Salt are available (passport required) and eSIM is well supported; coverage is excellent even in mountain areas.",
  "payments": "Cards and contactless are accepted nearly everywhere, though carry some Swiss francs for small kiosks and mountain huts; Twint is the dominant local mobile-payment app."
 },
 "UA": {
  "iso2": "UA",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not recommended for drinking; rely on bottled or filtered water, and note wartime infrastructure damage can affect supply."
  },
  "etiquette": [
   "Check current travel advisories and air-raid alert apps, as martial law and curfews are in effect.",
   "Take air-raid sirens seriously and follow locals to shelters immediately.",
   "Use 'Ukraine' not 'the Ukraine', and speak Ukrainian greetings where possible.",
   "Be sensitive discussing the war and avoid photographing military sites or checkpoints."
  ],
  "transport": "Civilian airports remain closed due to the war, so entry is overland by train or bus from Poland or other neighbors; Ukrainian Railways are the backbone of intercity travel, and cities use cheap metro (Kyiv), trams, and buses. Bolt and Uklon operate as ride-hailing apps where service runs.",
  "connectivity": "Prepaid SIMs from Kyivstar, Vodafone Ukraine, and lifecell are cheap with good 4G, though power outages can disrupt service; eSIM is available and Starlink backs up some connectivity.",
  "payments": "Card and contactless payment is very widespread and modern, but carry hryvnia cash as a backup since power cuts can take card terminals offline."
 },
 "GB": {
  "iso2": "GB",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe to drink throughout the United Kingdom."
  },
  "etiquette": [
   "Queue properly and never push in, as orderly lines are taken seriously.",
   "Stand on the right of escalators, especially on the London Underground, to let others pass.",
   "Say 'please', 'thank you', and 'sorry' liberally, as politeness is expected.",
   "Avoid loud phone calls and conversation on quiet train carriages."
  ],
  "transport": "London's Heathrow and Gatwick connect to the center by Underground, the Elizabeth Line, and express trains (Heathrow Express, Gatwick Express); cities have extensive buses, and London adds the Tube and Overground. Uber, Bolt, and FreeNow operate widely alongside licensed black cabs.",
  "connectivity": "Prepaid SIMs from EE, O2, Vodafone, and Three are cheap and easy to buy, and eSIM is widely supported; mobile and wifi coverage is strong in cities.",
  "payments": "The UK is largely cashless: contactless cards and phones are accepted virtually everywhere, including all public transport, so cash is rarely needed."
 },
 "VA": {
  "iso2": "VA",
  "tapWater": {
   "status": "safe",
   "note": "Tap water throughout Vatican City and adjacent Rome is potable, including from the public nasoni fountains."
  },
  "etiquette": [
   "Observe the strict dress code at St. Peter's Basilica and the Vatican Museums: cover shoulders and knees, or you will be refused entry.",
   "Maintain silence and switch off camera flash inside the Sistine Chapel; photography is prohibited there.",
   "Do not bring large backpacks or luggage, as they must be checked and slow your entry.",
   "Pre-book Vatican Museums tickets online to avoid queues that can exceed two hours."
  ],
  "transport": "There is no airport in Vatican City; arrive via Rome's Fiumicino or Ciampino airports, using the Leonardo Express train to Termini followed by Metro Line A to Ottaviano. Everything within the Vatican is walkable, and Uber Black and FreeNow operate in surrounding Rome.",
  "connectivity": "Italian SIMs and eSIMs (TIM, Vodafone, WindTre) cover the area with strong 4G/5G, and most travelers simply use a Rome-based Italian or EU roaming plan.",
  "payments": "Cards and contactless are widely accepted at the museums, shops, and post office, though small cash amounts in euros remain useful for kiosks and the basilica's donation boxes."
 },
 "AG": {
  "iso2": "AG",
  "tapWater": {
   "status": "caution",
   "note": "Resort tap water is often treated, but bottled or filtered water is recommended elsewhere as supply relies heavily on desalination and rainwater catchment."
  },
  "etiquette": [
   "Dress modestly away from the beach; wearing swimwear in towns or shops is frowned upon.",
   "Greet people with a friendly hello before asking questions, as politeness is valued.",
   "Avoid wearing camouflage clothing, which is illegal for civilians.",
   "Ask permission before photographing local residents."
  ],
  "transport": "Taxis are the dominant way to get from V.C. Bird International Airport to St. John's and the resorts, with fixed government rates rather than meters; there is no Uber or Bolt. Rental cars and minibuses serve the island, and driving is on the left.",
  "connectivity": "Local SIMs from Digicel and Flow are inexpensive and give decent 4G coverage; eSIM options exist, and hotel wifi is generally reliable.",
  "payments": "Cards are accepted at hotels and larger establishments, but cash in East Caribbean dollars (and often US dollars) is needed for taxis, markets, and smaller vendors; mobile payments are uncommon."
 },
 "AR": {
  "iso2": "AR",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe to drink in Buenos Aires and most major cities, though some travelers prefer bottled water in rural northern areas."
  },
  "etiquette": [
   "Greet with a single kiss on the right cheek, common even in business settings.",
   "Do not eat dinner early; Argentines typically dine after 9 p.m. and many restaurants open late.",
   "Avoid discussing the Falklands/Malvinas conflict casually, as it remains sensitive.",
   "Carrying and sharing mate is welcomed; do not stir the bombilla straw."
  ],
  "transport": "From Ezeiza International Airport, official remís cars and the Tienda León shuttle bus are reliable into Buenos Aires; the SUBE card covers the subway (Subte), buses, and trains. Uber, Cabify, and DiDi operate, though Uber's legal status occasionally causes friction with taxi drivers.",
  "connectivity": "Local SIMs (Claro, Movistar, Personal) require ID registration and are cheap; eSIMs are popular with visitors, and urban 4G is solid.",
  "payments": "Cards are widely accepted but carrying cash in pesos is essential given inflation; many travelers use US dollars via the favorable 'blue' exchange rate, and MercadoPago dominates mobile payments."
 },
 "BS": {
  "iso2": "BS",
  "tapWater": {
   "status": "caution",
   "note": "Tap water in Nassau and Freeport is generally treated and chlorinated, but bottled water is widely used on the Out Islands where supply is desalinated or from cisterns."
  },
  "etiquette": [
   "Dress modestly off the beach; cover swimwear when entering shops or restaurants.",
   "Greet with a polite 'good morning' or 'good afternoon' before transacting.",
   "Avoid wearing camouflage clothing, which is prohibited.",
   "Respect Sunday observance, as many businesses close and church attendance is significant."
  ],
  "transport": "Taxis are the standard transfer from Lynden Pindling International Airport into Nassau, with fixed zone rates and no Uber or ride-hailing apps. Jitneys (local buses) serve New Providence cheaply, while smaller islands rely on golf carts, rental scooters, and ferries.",
  "connectivity": "BTC and Aliv sell local SIMs with reasonable 4G in populated areas; eSIMs work, but coverage thins on remote Out Islands where you may rely on hotel wifi.",
  "payments": "Cards are accepted at hotels, resorts, and larger stores, with the Bahamian dollar pegged 1:1 to the US dollar (both circulate freely); cash is useful for taxis and smaller vendors."
 },
 "BB": {
  "iso2": "BB",
  "tapWater": {
   "status": "safe",
   "note": "Barbados has high-quality naturally filtered tap water drawn from limestone aquifers and is safe to drink."
  },
  "etiquette": [
   "Dress neatly in towns; beach attire is for the beach only, and swimwear in shops can incur penalties.",
   "Avoid camouflage clothing, which is illegal for civilians.",
   "Greet shopkeepers and drivers courteously before business, as manners matter greatly.",
   "Ask before photographing people and respect Sunday as a quiet, church-focused day."
  ],
  "transport": "Taxis (unmetered, agree the fare first) handle transfers from Grantley Adams International Airport; there is no Uber, though local app-based options are limited. Government buses, yellow minibuses, and 'ZR' vans provide cheap island-wide transport, and driving is on the left.",
  "connectivity": "Flow and Digicel offer affordable local SIMs and decent 4G/5G across the island; eSIMs are available and hotel wifi is generally good.",
  "payments": "Cards are accepted at most hotels, restaurants, and shops; the Barbadian dollar is pegged 2:1 to the US dollar and both are often accepted, with cash preferred for buses and small vendors."
 },
 "BZ": {
  "iso2": "BZ",
  "tapWater": {
   "status": "caution",
   "note": "Tap water in Belize City and on the popular cayes is often treated, but bottled or purified water is widely recommended, especially in rural and southern areas."
  },
  "etiquette": [
   "Use a few words of Kriol or Spanish greetings; English is official but a friendly hello is appreciated.",
   "Dress modestly when visiting villages and Maya sites, and ask before photographing residents.",
   "Avoid touching or removing artifacts at Maya ruins, which is strictly prohibited.",
   "Respect 'Belize time' and remain patient, as schedules are relaxed."
  ],
  "transport": "From Philip S.W. Goldson International Airport near Belize City, taxis (fixed rates, identified by green license plates) are standard, as there is no Uber. Within the country, local buses, domestic flights (Tropic Air, Maya Island Air), and water taxis to the cayes dominate; golf carts rule on Caye Caulker and San Pedro.",
  "connectivity": "Local SIMs from Digi and Smart provide moderate 4G in towns and on the cayes; eSIM support is limited, and connectivity weakens in jungle and remote regions.",
  "payments": "US dollars are accepted everywhere alongside the Belize dollar (fixed 2:1), and cards work at hotels and tour operators; carry cash for buses, markets, and small businesses."
 },
 "BO": {
  "iso2": "BO",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not safe to drink; use bottled or boiled water, and note that high-altitude boiling requires longer times."
  },
  "etiquette": [
   "Acclimatize slowly to altitude in La Paz and Potosí, and chew coca leaves or drink coca tea as locals do to ease symptoms.",
   "Ask permission before photographing Indigenous people, especially Cholitas in traditional dress, and expect to offer a small tip or purchase.",
   "Dress conservatively and respect Pachamama (Mother Earth) customs at ceremonies and mines.",
   "Avoid public displays of frustration; patience is valued during frequent delays and roadblocks."
  ],
  "transport": "From El Alto International Airport, official radio taxis are the safest descent into La Paz; the Mi Teleférico cable-car network is a cheap, scenic way to move around the city. Uber operates only in Santa Cruz and is limited; elsewhere rely on radio taxis, trufis (shared vans), and long-distance buses.",
  "connectivity": "Entel, Tigo, and Viva sell cheap local SIMs (ID required) with reasonable urban 4G; eSIMs are available but coverage drops sharply in rural and mountainous areas.",
  "payments": "Bolivia is heavily cash-based with the boliviano king; cards work only at upscale hotels and restaurants in cities, and the QR-based mobile payment system is growing but aimed at residents."
 },
 "BR": {
  "iso2": "BR",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is treated and considered potable in many cities but quality varies widely; most residents and visitors drink filtered or bottled water."
  },
  "etiquette": [
   "Greet with cheek kisses (one or two depending on region) and warm physical closeness; Brazilians stand close in conversation.",
   "Avoid making the 'OK' hand sign, which is considered offensive.",
   "Dress for the setting and avoid flaunting valuables or phones in crowded urban areas for safety.",
   "Be punctual for business but flexible socially, where lateness is normal."
  ],
  "transport": "Major airports like Guarulhos (São Paulo) and Galeão (Rio) connect to city centers via official airport taxis, executive buses, and in São Paulo the metro/CPTM rail. Uber, 99, and Cabify operate widely and are often safer and cheaper than street taxis; metros in São Paulo and Rio are efficient.",
  "connectivity": "Local SIMs (Vivo, Claro, TIM) need a CPF number to register, so many visitors use eSIMs; urban 4G/5G is strong, with weaker coverage in the interior and Amazon.",
  "payments": "Cards and contactless are accepted almost everywhere, and the instant Pix system dominates mobile payments; carry some cash in reais for small vendors and rural areas."
 },
 "CA": {
  "iso2": "CA",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe and high quality nationwide, though some remote First Nations communities have advisories."
  },
  "etiquette": [
   "Say please, thank you, and sorry frequently; politeness and queuing are strongly expected.",
   "Respect bilingual norms in Quebec, where greeting in French ('Bonjour') is appreciated.",
   "Avoid loud or disruptive behavior in public and give people personal space.",
   "Do not joke that Canada is just like the United States, as national distinctiveness is valued."
  ],
  "transport": "Airports in Toronto (UP Express train), Vancouver (Canada Line SkyTrain), and Montreal (REM) connect to downtown by rail; major cities have solid public transit. Uber and Lyft operate in most cities, alongside local apps, though some smaller cities restrict ride-hailing.",
  "connectivity": "Local SIMs (Rogers, Bell, Telus and budget brands) and eSIMs are easy to obtain; mobile data is among the world's more expensive, but 4G/5G and wifi are excellent in populated areas.",
  "payments": "Cards and contactless, including Apple Pay and Google Pay, are accepted virtually everywhere, and cash in Canadian dollars is rarely necessary except in remote areas."
 },
 "CL": {
  "iso2": "CL",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe to drink in Santiago and most cities, though its high mineral content may upset sensitive stomachs, prompting some to choose bottled water."
  },
  "etiquette": [
   "Greet with a single cheek kiss among acquaintances and a handshake in formal settings.",
   "Use formal titles and 'usted' with elders and in business until invited to be casual.",
   "Avoid arriving exactly on time to social gatherings, where being slightly late is normal.",
   "Do not eat with your hands; even fries and pizza are typically eaten with utensils."
  ],
  "transport": "Santiago's Arturo Merino Benítez Airport connects downtown via official taxis, the Turbus/Centropuerto buses, and the new Línea 2 metro extension; the Santiago Metro is clean and efficient with the Bip! card. Uber, Cabify, and DiDi operate widely though Uber occupies a legal gray area.",
  "connectivity": "Local SIMs (Entel, Movistar, WOM) are cheap and require registration; eSIMs are common, and Chile has some of Latin America's fastest, most reliable 4G/5G and fiber.",
  "payments": "Cards and contactless are widely accepted, and the local Mach and Mercado Pago apps plus bank transfers are popular; carry some pesos in cash for markets, small fares, and rural areas."
 },
 "CO": {
  "iso2": "CO",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is safe to drink in Bogotá and Medellín, but quality is unreliable on the Caribbean coast and in rural areas, where bottled water is advised."
  },
  "etiquette": [
   "Greet warmly and use titles like Señor/Señora; Colombians are courteous and formal with strangers.",
   "Avoid references to drugs, cartels, or Pablo Escobar, which many find offensive.",
   "Keep valuables discreet ('no dar papaya' — do not give opportunity) to avoid petty theft.",
   "Dress smartly in cities, as appearance is taken seriously."
  ],
  "transport": "From Bogotá's El Dorado Airport, use official white airport taxis or the cheaper authorized buses; the city relies on the TransMilenio bus rapid transit, while Medellín has a clean metro and cable cars. Uber, DiDi, Cabify, and Beat operate, though Uber works in a legal gray zone and drivers may ask you to sit up front.",
  "connectivity": "Local SIMs (Claro, Movistar, Tigo) are inexpensive and require passport registration; eSIMs are widely used, and urban 4G is good with patchier rural coverage.",
  "payments": "Cards are accepted in cities, but Colombia remains cash-oriented with the peso, and the Nequi and Daviplata mobile wallets are extremely popular for everyday payments."
 },
 "CR": {
  "iso2": "CR",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe to drink in most of the country including San José, though bottled water is advisable in some remote rural and coastal zones."
  },
  "etiquette": [
   "Use the friendly greeting 'Pura Vida,' which doubles as hello, goodbye, and an expression of wellbeing.",
   "Respect nature rules strictly: do not feed or touch wildlife and stay on marked trails.",
   "Be patient with 'tico time,' as punctuality is relaxed socially.",
   "Greet with a light handshake or cheek kiss and use polite titles with elders."
  ],
  "transport": "From Juan Santamaría International Airport near San José, official orange airport taxis and pre-booked shuttles are recommended; red taxis with meters (marías) serve the city. Uber and DiDi operate in a legal gray area but are widely used; intercity travel relies on buses and domestic flights or shuttles to beaches.",
  "connectivity": "Local SIMs (Kölbi, Claro, Movistar) are cheap and easy to buy with a passport; eSIMs are available, and 4G is good in populated areas but weak in remote jungle and mountain regions.",
  "payments": "Cards and contactless are widely accepted and US dollars circulate alongside the colón; carry some cash in colones for small vendors, buses, and rural areas, while SINPE Móvil mobile transfers dominate among locals."
 },
 "CU": {
  "iso2": "CU",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not safe to drink; use bottled or boiled water, which can be scarce, so bring a purification method."
  },
  "etiquette": [
   "Carry cash and exchange money carefully, as US cards generally do not work and the dual-currency landscape is confusing.",
   "Avoid public criticism of the government, which can cause discomfort or trouble for locals.",
   "Ask before photographing people and expect to tip performers and posed subjects.",
   "Be patient with shortages and slow service, and bring small gifts which are warmly received."
  ],
  "transport": "From Havana's José Martí International Airport, official yellow taxis and pre-arranged transfers are the main options, as there is no Uber. Classic-car collective taxis (almendrones), the Viazul bus network for intercity travel, and bici-taxis are common ways to get around.",
  "connectivity": "ETECSA is the sole provider; buy a Cubacel tourist SIM or eSIM, but expect slow, expensive, and unreliable data with limited public wifi hotspots.",
  "payments": "Cuba is overwhelmingly cash-based and US-issued cards do not work; bring euros or other non-US currency to exchange, as card and digital payment access for visitors is severely limited."
 },
 "DM": {
  "iso2": "DM",
  "tapWater": {
   "status": "safe",
   "note": "Dominica's tap water comes from abundant mountain rivers and springs and is generally safe to drink."
  },
  "etiquette": [
   "Greet people with a warm 'good morning' or 'good afternoon' before any request, as courtesy is expected.",
   "Avoid wearing camouflage clothing, which is prohibited.",
   "Respect the natural environment and Kalinago Territory customs; ask before photographing residents.",
   "Dress modestly in towns and reserve swimwear for the beach and rivers."
  ],
  "transport": "Most visitors arrive at Douglas–Charles Airport, a roughly hour-long drive from Roseau handled by taxis (fixed government rates) or pre-arranged transfers, as there is no Uber. Shared minibuses serve as cheap local transport, and a rental car helps for exploring the mountainous interior; driving is on the left.",
  "connectivity": "Digicel and Flow offer local SIMs with moderate 4G in populated areas; eSIM availability is limited and signal weakens in the rugged interior, so rely on accommodation wifi.",
  "payments": "Cards are accepted at hotels and larger establishments, but East Caribbean dollars in cash are essential for taxis, markets, and small vendors; mobile payment use is minimal."
 },
 "DO": {
  "iso2": "DO",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not reliably safe to drink; use bottled water, which is inexpensive and widely available."
  },
  "etiquette": [
   "Greet with a cheek kiss or handshake and use polite titles; Dominicans are warm and sociable.",
   "Dress neatly in cities and cover swimwear away from the beach and resorts.",
   "Learn a few Spanish phrases, as English is limited outside tourist zones.",
   "Be cautious and assertive with persistent street vendors and unofficial 'helpers' at attractions."
  ],
  "transport": "From Punta Cana and Las Américas (Santo Domingo) airports, use official airport taxis or pre-booked resort transfers, as rates are fixed and meters are uncommon. Uber and InDrive operate in Santo Domingo and Santiago but are restricted at airports; elsewhere rely on taxis, guaguas (minibuses), and motoconcho motorbike taxis.",
  "connectivity": "Local SIMs (Claro, Altice, Viva) are cheap with a passport and offer good urban 4G; eSIMs are available, and resort wifi is generally adequate.",
  "payments": "Cards are accepted at resorts, hotels, and larger stores, but cash in Dominican pesos (and often US dollars at resorts) is needed for taxis, motoconchos, and small vendors; mobile payments are not yet widespread."
 },
 "EC": {
  "iso2": "EC",
  "tapWater": {
   "status": "unsafe",
   "note": "Stick to bottled or boiled water; tap water is not reliably potable, even in Quito."
  },
  "etiquette": [
   "Greet with a handshake or, among acquaintances, a single cheek kiss; address strangers as senor or senora.",
   "Dress in layers and warmer clothing for the Andean highlands such as Quito and Cuenca, where evenings are cold.",
   "Ask permission before photographing Indigenous people, particularly at markets like Otavalo.",
   "Avoid discussing politics dismissively and respect that Spanish is spoken alongside Kichwa in highland communities."
  ],
  "transport": "From Quito's Mariscal Sucre airport, official airport taxis and the Aeroservicios shuttle bus reach the city; intercity travel relies on an extensive long-distance bus network, while Uber and inDrive operate in major cities.",
  "connectivity": "Prepaid SIM cards from Claro and Movistar are inexpensive and widely sold with passport registration; 4G coverage is solid in cities and tourist zones but weak in remote Amazon and highland areas.",
  "payments": "Ecuador uses the US dollar; cash is essential outside cities, cards are accepted in mid-range and upscale venues, and small change is frequently scarce."
 },
 "SV": {
  "iso2": "SV",
  "tapWater": {
   "status": "unsafe",
   "note": "Drink bottled water; municipal tap water is not considered safe to consume untreated."
  },
  "etiquette": [
   "Greet with a handshake and maintain courteous, indirect communication; avoid blunt confrontation.",
   "Dress modestly when visiting churches and rural towns.",
   "Avoid discussing gang violence or comparing the country to its neighbors, as security is a sensitive topic.",
   "Use formal titles and the usted form with elders and officials."
  ],
  "transport": "From San Salvador's Monsenor Romero airport, prearranged shuttles and airport taxis serve the capital roughly 40 minutes away; local transport is dominated by buses, while Uber and inDrive operate reliably in San Salvador.",
  "connectivity": "Prepaid SIMs from Tigo and Claro are easy to buy; 4G coverage is good in San Salvador and main towns but patchy in rural areas.",
  "payments": "The US dollar is legal tender alongside Bitcoin; cash remains dominant for small purchases, cards are accepted in urban establishments, and mobile wallets like Tigo Money are common."
 },
 "GD": {
  "iso2": "GD",
  "tapWater": {
   "status": "caution",
   "note": "Treated piped water in St. George's is generally safe, but visitors often prefer bottled or filtered water elsewhere."
  },
  "etiquette": [
   "Greet people before launching into requests; a friendly good morning or good afternoon is expected.",
   "Avoid wearing beachwear or swimsuits in town centers and shops.",
   "Dress modestly and remove hats when entering churches.",
   "Ask before photographing locals and respect the relaxed island pace."
  ],
  "transport": "From Maurice Bishop airport, taxis with fixed fares are the standard way into St. George's; shared minibuses are the dominant and cheap local transport, and there is no Uber, so taxis must be arranged directly.",
  "connectivity": "Prepaid SIMs from Flow and Digicel are available at the airport and shops; 4G coverage is reliable across the populated areas of the island.",
  "payments": "The East Caribbean dollar is used; cash is needed for buses, markets, and small vendors, while hotels and larger restaurants accept cards."
 },
 "GT": {
  "iso2": "GT",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water entirely; drink bottled or purified water, which is sold everywhere."
  },
  "etiquette": [
   "Greet with a handshake and use buenos dias before asking for anything.",
   "Always ask permission before photographing Indigenous Maya people and their children.",
   "Dress modestly in highland towns and when visiting churches or markets like Chichicastenango.",
   "Be respectful and discreet around religious processions and ceremonies."
  ],
  "transport": "From Guatemala City's La Aurora airport, use authorized taxis or hotel shuttles; tourist shuttles connect Antigua and Lake Atitlan, colorful chicken buses serve locals cheaply, and Uber and inDrive operate in the capital and Antigua.",
  "connectivity": "Prepaid SIMs from Tigo and Claro are cheap and sold widely; 4G works well in cities and tourist hubs but degrades in remote highlands and Peten.",
  "payments": "The quetzal is the currency; cash is essential outside cities and tourist areas, cards are accepted in hotels and larger restaurants, and ATMs are common in towns."
 },
 "GY": {
  "iso2": "GY",
  "tapWater": {
   "status": "unsafe",
   "note": "Drink bottled water; tap water is not reliably treated and may cause illness."
  },
  "etiquette": [
   "Greet warmly and use polite small talk; Guyanese culture is friendly and relationship-oriented.",
   "Dress modestly and respect the mix of Hindu, Muslim, and Christian customs across communities.",
   "Avoid walking alone after dark in Georgetown and keep valuables discreet.",
   "Remove shoes before entering temples, mosques, and many private homes."
  ],
  "transport": "From Cheddi Jagan airport near Timehri, hire a registered taxi for the roughly one-hour trip to Georgetown; minibuses and shared taxis dominate local travel, and ride-hailing apps are not well established.",
  "connectivity": "Prepaid SIMs from Digicel and ENet are available; mobile coverage is decent in Georgetown and the coast but limited in the forested interior.",
  "payments": "The Guyanese dollar is used; cash is dominant for most transactions, card acceptance is limited mainly to hotels and larger businesses, and US dollars are sometimes accepted."
 },
 "HT": {
  "iso2": "HT",
  "tapWater": {
   "status": "unsafe",
   "note": "Never drink tap water; rely on sealed bottled or treated water due to cholera risk."
  },
  "etiquette": [
   "Greet with a handshake and learn a few words of Haitian Creole, which is appreciated.",
   "Dress modestly and conservatively, especially in churches and rural areas.",
   "Ask permission before taking photographs of people.",
   "Be discreet about displaying money or valuables and stay aware of ongoing security concerns."
  ],
  "transport": "From Toussaint Louverture airport in Port-au-Prince, arrange transport only through your hotel or a trusted contact due to security; tap-tap shared taxis serve locals, and ride-hailing apps do not operate reliably.",
  "connectivity": "Prepaid SIMs from Digicel and Natcom are available; mobile coverage exists in cities but service and electricity can be unreliable.",
  "payments": "The gourde is the currency, though US dollars circulate widely; cash is essential everywhere, and card acceptance is minimal outside major hotels."
 },
 "HN": {
  "iso2": "HN",
  "tapWater": {
   "status": "unsafe",
   "note": "Drink bottled or purified water; tap water is not safe to consume."
  },
  "etiquette": [
   "Greet with a handshake and exchange pleasantries before getting to business.",
   "Dress modestly in towns and remove hats inside churches.",
   "Avoid displaying expensive items and walking alone after dark in cities.",
   "Use formal titles and show respect to elders and authority figures."
  ],
  "transport": "From San Pedro Sula or Tegucigalpa airports, use authorized airport taxis or hotel shuttles; intercity travel relies on buses ranging from basic to luxury lines, and Uber operates in the main cities.",
  "connectivity": "Prepaid SIMs from Tigo and Claro are inexpensive; 4G coverage is reliable in cities and the Bay Islands but weaker in rural regions.",
  "payments": "The lempira is the currency; cash dominates everyday spending, cards are accepted in hotels and supermarkets in cities, and US dollars are useful on the Bay Islands."
 },
 "JM": {
  "iso2": "JM",
  "tapWater": {
   "status": "safe",
   "note": "Tap water in Kingston, Montego Bay, and resort areas is treated and generally safe to drink."
  },
  "etiquette": [
   "Greet with a friendly good morning or respect before conversation; Jamaicans value courtesy.",
   "Avoid wearing beachwear away from the beach and in towns.",
   "Ask before photographing people and avoid assuming everyone uses cannabis despite its decriminalization.",
   "Dress modestly when entering churches and respect local Rastafarian customs."
  ],
  "transport": "From Sangster airport in Montego Bay or Norman Manley in Kingston, use licensed JUTA taxis or hotel transfers; route taxis and minibuses serve locals, and Uber is not established, though local apps exist.",
  "connectivity": "Prepaid SIMs from Digicel and Flow are sold at airports and shops; 4G coverage is good across tourist areas and cities.",
  "payments": "The Jamaican dollar is used, with US dollars widely accepted in tourist zones; cards work in hotels and larger businesses, while cash is needed for taxis and small vendors."
 },
 "MX": {
  "iso2": "MX",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water; drink bottled or purified water, which is standard practice even among locals."
  },
  "etiquette": [
   "Greet with a handshake or a cheek kiss among acquaintances and use buenos dias politely.",
   "Avoid loud or impatient behavior; Mexican social interactions value warmth and courtesy.",
   "Respect sacred and archaeological sites and follow rules about climbing ruins.",
   "Be cautious discussing cartel violence and avoid generalizing about safety."
  ],
  "transport": "From major airports use authorized prepaid taxis or official ride-hailing pickup zones; cities have metro, buses, and extensive intercity bus networks, and Uber, DiDi, and Cabify operate widely.",
  "connectivity": "Prepaid SIMs from Telcel offer the best coverage and eSIMs are widely supported; 4G and 5G are strong in cities and tourist areas.",
  "payments": "The peso is the currency; cards and mobile payments are common in cities, but cash is essential for markets, taxis, and small towns."
 },
 "NI": {
  "iso2": "NI",
  "tapWater": {
   "status": "caution",
   "note": "Tap water in Managua is chlorinated but most travelers drink bottled water to avoid stomach upset."
  },
  "etiquette": [
   "Greet with a handshake and friendly small talk before requests.",
   "Dress modestly in towns and conservatively in churches.",
   "Avoid openly discussing politics, which is a sensitive subject.",
   "Show respect to elders and use formal address with strangers."
  ],
  "transport": "From Managua's Augusto Sandino airport, use authorized taxis or hotel shuttles; converted school buses serve locals cheaply, tourist shuttles link Granada and Leon, and ride-hailing apps like inDrive have limited presence.",
  "connectivity": "Prepaid SIMs from Claro and Tigo are cheap and widely available; 4G works in cities and tourist towns but weakens in rural areas.",
  "payments": "The cordoba is the currency, with US dollars widely accepted; cash is dominant, and card acceptance is limited to hotels and larger establishments."
 },
 "PA": {
  "iso2": "PA",
  "tapWater": {
   "status": "safe",
   "note": "Tap water in Panama City and most urban areas is safe to drink, though bottled water is advised in remote Bocas del Toro and Guna Yala."
  },
  "etiquette": [
   "Greet with a handshake and exchange pleasantries before business.",
   "Dress smartly in Panama City, where appearance matters in social and professional settings.",
   "Ask permission before photographing Guna and other Indigenous people.",
   "Respect that Panama City is cosmopolitan while rural and island areas are more traditional."
  ],
  "transport": "From Tocumen airport, use authorized taxis or hotel transfers into Panama City; the city has a modern Metro and Metrobus system, and Uber and inDrive operate widely and are often preferred over street taxis.",
  "connectivity": "Prepaid SIMs from Mas Movil, Tigo, and Claro are easy to buy; 4G coverage is strong in the city and along main routes.",
  "payments": "Panama uses the US dollar, locally called the balboa for coins; cards are widely accepted in the city, while cash is needed for taxis, small shops, and remote areas."
 },
 "PY": {
  "iso2": "PY",
  "tapWater": {
   "status": "caution",
   "note": "Tap water in Asuncion is generally treated, but bottled water is recommended elsewhere and for sensitive stomachs."
  },
  "etiquette": [
   "Greet with a handshake or cheek kiss and engage in unhurried small talk.",
   "Accept and reciprocate terere, the cold yerba mate drink, as a social gesture.",
   "Learn a few words of Guarani, which is widely spoken alongside Spanish.",
   "Dress modestly in rural areas and respect the relaxed pace of life."
  ],
  "transport": "From Asuncion's Silvio Pettirossi airport, use authorized taxis or hotel transfers; local buses are the dominant transport, and Uber, Bolt, and MUV ride-hailing apps operate in the capital.",
  "connectivity": "Prepaid SIMs from Tigo, Personal, and Claro are inexpensive; 4G coverage is good in Asuncion and cities but limited in the rural Chaco.",
  "payments": "The guarani is the currency; cash is dominant for daily purchases, cards are accepted in city establishments, and ATMs are common in urban centers."
 },
 "PE": {
  "iso2": "PE",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water; drink bottled or boiled water, especially given high-altitude travel."
  },
  "etiquette": [
   "Greet with a handshake or cheek kiss and use senor or senora with strangers.",
   "Always ask permission before photographing Andean people in traditional dress, who may expect a small payment.",
   "Acclimatize slowly and drink coca tea to manage altitude in Cusco and the highlands.",
   "Respect Inca and archaeological sites by following posted rules at Machu Picchu and similar places."
  ],
  "transport": "From Lima's Jorge Chavez airport, use the official Airport Express bus or authorized taxis; cities rely on buses and combis, while Uber, DiDi, Cabify, and inDrive all operate in Lima and major cities.",
  "connectivity": "Prepaid SIMs from Claro, Movistar, Entel, and Bitel are cheap and widely sold; 4G is reliable in cities and tourist routes but limited in remote Andes and Amazon.",
  "payments": "The sol is the currency; cash is essential for markets, taxis, and small towns, cards are accepted in city hotels and restaurants, and US dollars are accepted in some tourist venues."
 },
 "KN": {
  "iso2": "KN",
  "tapWater": {
   "status": "safe",
   "note": "Tap water on St. Kitts and Nevis comes largely from protected sources and is generally safe to drink."
  },
  "etiquette": [
   "Greet with a polite good morning or good afternoon before conversation.",
   "Avoid wearing swimwear or going shirtless away from beaches and pools.",
   "Dress modestly when visiting churches and government buildings.",
   "Ask before photographing residents and respect the unhurried island pace."
  ],
  "transport": "From Robert L. Bradshaw airport on St. Kitts, taxis with government-set fares are the main option, and a ferry links to Nevis; shared minibuses serve locals, and there is no Uber, so taxis are arranged directly.",
  "connectivity": "Prepaid SIMs from Flow and Digicel are available; 4G coverage is reliable across both islands' populated areas.",
  "payments": "The East Caribbean dollar is used, with US dollars often accepted; cards work in hotels and larger restaurants, while cash is needed for taxis, buses, and small vendors."
 },
 "LC": {
  "iso2": "LC",
  "tapWater": {
   "status": "safe",
   "note": "Tap water in main towns and resort areas of St. Lucia is treated and generally safe, though bottled water is common in rural areas."
  },
  "etiquette": [
   "Greet with a friendly good morning or good afternoon before any request.",
   "Avoid wearing beachwear in towns, shops, and restaurants.",
   "Dress modestly for churches and ask before photographing locals.",
   "A few words of the French-based Kweyol creole are appreciated."
  ],
  "transport": "From Hewanorra airport in the south, prearranged taxis or hotel transfers cover the long drive to northern resorts; minibuses serve locals cheaply, and there is no Uber, so taxis must be booked directly.",
  "connectivity": "Prepaid SIMs from Flow and Digicel are sold at the airport and shops; 4G coverage is good across the island's populated areas.",
  "payments": "The East Caribbean dollar is used, with US dollars widely accepted in tourist areas; cards work in hotels and larger establishments, while cash is needed for buses and small vendors."
 },
 "VC": {
  "iso2": "VC",
  "tapWater": {
   "status": "caution",
   "note": "Mains water on St. Vincent is generally treated, but on smaller Grenadine islands rely on bottled or filtered water."
  },
  "etiquette": [
   "Greet people before launching into a request; a simple good morning or good afternoon is expected in shops and offices.",
   "Dress modestly away from the beach, and avoid wearing camouflage clothing, which is restricted.",
   "Ask permission before photographing residents, especially in fishing villages.",
   "Avoid loud, impatient behaviour as island pace is unhurried and brusqueness reads as rude."
  ],
  "transport": "From Argyle International Airport, pre-arranged hotel transfers or fixed-rate taxis serve the main island, with ferries linking the Grenadines. Local minibuses are the cheapest way around; there is no Uber or Bolt service.",
  "connectivity": "Local SIMs from Flow and Digicel are sold at the airport and in Kingstown, with reasonable 4G on the main island but patchy coverage on outer cays.",
  "payments": "Cash in Eastern Caribbean dollars dominates outside resorts and larger hotels; cards are accepted at upscale venues but carry small notes for minibuses and markets."
 },
 "SR": {
  "iso2": "SR",
  "tapWater": {
   "status": "caution",
   "note": "Paramaribo tap water is treated and generally drinkable, but use bottled water in the interior and rural districts."
  },
  "etiquette": [
   "Respect the multi-ethnic, multi-religious makeup; remove shoes when entering homes, mosques and temples.",
   "Use your right hand for giving and receiving in communities of Javanese and Hindustani heritage.",
   "Ask before photographing people and ceremonies, particularly Maroon and Indigenous villages in the interior.",
   "Dress modestly in town and cover shoulders and knees when visiting religious sites."
  ],
  "transport": "From Johan Adolf Pengel International Airport (about 45 km from Paramaribo) use the official airport taxi desk or a pre-booked transfer. In the city, shared minibuses and metered or negotiated taxis dominate; there are no international ride-hailing apps.",
  "connectivity": "Telesur and Digicel SIM cards are easy to buy with ID; 4G is solid in Paramaribo but weak to absent in the rainforest interior.",
  "payments": "Cash in Surinamese dollars is essential outside the capital, where some hotels and larger shops take cards; US dollars and euros are widely accepted and mobile money is limited."
 },
 "TT": {
  "iso2": "TT",
  "tapWater": {
   "status": "caution",
   "note": "Treated municipal water is broadly safe in main areas, but supply interruptions are common so many residents and visitors prefer bottled water."
  },
  "etiquette": [
   "Greet with a friendly hello before asking questions; abruptness is considered impolite.",
   "Avoid wearing camouflage-pattern clothing, which is prohibited for civilians.",
   "During Carnival respect that some events and bands have dress codes and paid access; do not assume free entry.",
   "Keep political and crime-related comments low-key in casual conversation."
  ],
  "transport": "From Piarco International Airport use official airport taxis with fixed zone fares or a pre-arranged transfer. Maxi taxis (shared minibuses) and route taxis are the dominant local transport; the local app TT RideShare operates, while Uber does not.",
  "connectivity": "bmobile and Digicel SIMs are available with ID at the airport and malls; 4G LTE is widely available across Trinidad and main Tobago areas.",
  "payments": "Cards are accepted at malls, hotels and supermarkets, but carry Trinidad and Tobago dollars in cash for maxi taxis, street food and smaller vendors; contactless is growing in urban centres."
 },
 "US": {
  "iso2": "US",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is potable nationwide, though taste varies and a few localities issue periodic boil notices."
  },
  "etiquette": [
   "Respect personal space and queue in an orderly line; cutting ahead is poorly received.",
   "Greetings and small talk with service staff are normal, but avoid intrusive questions about income or politics with strangers.",
   "Follow posted rules strictly, including no-smoking zones and alcohol-in-public bans that vary by state.",
   "Be aware that many prices shown exclude sales tax, which is added at the register."
  ],
  "transport": "Most major airports connect to city centres via rail, light rail or shuttle, and Uber and Lyft operate nearly everywhere. Outside dense cities like New York, owning or renting a car is often the practical way to get around.",
  "connectivity": "Prepaid SIMs and eSIMs from carriers such as T-Mobile, AT&T and Verizon are easy to activate; 4G/5G and public wifi are widely available.",
  "payments": "Cards and contactless dominate and many venues are effectively cashless; Apple Pay and Google Pay are widely accepted, though carrying some cash remains useful in rural areas."
 },
 "UY": {
  "iso2": "UY",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is treated and safe to drink in Montevideo and across most of the country."
  },
  "etiquette": [
   "Greet with a single cheek kiss among acquaintances, even between men in social settings.",
   "Do not be surprised by sharing mate from a communal gourd; declining politely is fine but never wipe the straw.",
   "Adopt a relaxed sense of time, as punctuality is loose for social events.",
   "Keep comparisons to neighbouring Argentina light-hearted and avoid assuming the two are interchangeable."
  ],
  "transport": "From Carrasco International Airport, official taxis, the COT/Copsa bus and ride-hailing serve Montevideo. Uber operates and is popular alongside the local Cabify; city buses are the backbone of urban transport.",
  "connectivity": "Antel, Movistar and Claro SIMs are sold with a passport; 4G coverage is strong in cities and along the coast, and free public wifi is common.",
  "payments": "Cards and contactless are widely accepted and electronic payment is encouraged, though carry Uruguayan pesos for small purchases and beach-town vendors."
 },
 "VE": {
  "iso2": "VE",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is unreliable and often contaminated; drink only bottled or properly purified water."
  },
  "etiquette": [
   "Keep displays of cash, phones and jewellery discreet, as economic conditions have raised petty crime.",
   "Greet warmly and use formal titles with older people and in business settings.",
   "Avoid photographing government buildings, military sites and security personnel.",
   "Be cautious and neutral when discussing politics, which is a sensitive and polarising topic."
  ],
  "transport": "Arrange transport from Maiquetia (Caracas) airport in advance through your hotel or a trusted driver rather than hailing on the street. Local transport is informal and unreliable; international ride-hailing apps do not function normally, though some use Yummy or local services.",
  "connectivity": "Movistar, Digitel and Movilnet SIMs require local registration; mobile data and wifi are slow and subject to frequent power and network outages.",
  "payments": "Severe currency instability means US dollars in cash are widely used alongside the bolivar; card and mobile-payment acceptance is inconsistent, so carry small US notes."
 },
 "DZ": {
  "iso2": "DZ",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is chlorinated in cities but quality is inconsistent; bottled water is the safer choice."
  },
  "etiquette": [
   "Dress conservatively, with women covering shoulders and knees, especially outside Algiers and during Ramadan.",
   "Ask permission before photographing people, and avoid security, military and oil-installation sites entirely.",
   "Accept offered tea or coffee as a gesture of hospitality; refusing outright can seem cold.",
   "Use your right hand for eating and passing items, and keep public behaviour reserved."
  ],
  "transport": "From Houari Boumediene Airport in Algiers, use the official airport taxis or the airport bus to the centre. City taxis (often shared) and an expanding Algiers metro and tram dominate; international ride-hailing apps such as Uber do not operate, but local apps like Yassir are used.",
  "connectivity": "Djezzy, Mobilis and Ooredoo SIMs are available with a passport; 4G is decent in cities but coverage and speeds drop in the south and Sahara.",
  "payments": "Algeria is overwhelmingly a cash economy in dinars; card acceptance is limited mostly to large hotels, and tourists cannot easily use foreign mobile-payment apps."
 },
 "BH": {
  "iso2": "BH",
  "tapWater": {
   "status": "caution",
   "note": "Desalinated tap water meets standards but old building plumbing and storage tanks lead many to drink bottled water."
  },
  "etiquette": [
   "Dress modestly in public and cover shoulders and knees away from hotel pools and beaches.",
   "Avoid eating, drinking or smoking in public during daylight in Ramadan.",
   "Use the right hand for greetings and eating, and accept Arabic coffee when offered.",
   "Refrain from public displays of affection and keep alcohol consumption to licensed venues."
  ],
  "transport": "From Bahrain International Airport, metered taxis and pre-booked transfers reach Manama quickly. Cars and taxis dominate; Uber and the regional app Careem both operate, and a public bus network covers main routes.",
  "connectivity": "Batelco, stc and Zain SIMs and eSIMs are easy to obtain with a passport; 4G/5G and wifi are fast and widely available.",
  "payments": "Cards and contactless are accepted almost everywhere alongside mobile wallets like Apple Pay and benefit; carry Bahraini dinars in cash mainly for souqs and small eateries."
 },
 "EG": {
  "iso2": "EG",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is heavily chlorinated and not recommended for drinking; stick to sealed bottled water."
  },
  "etiquette": [
   "Dress modestly, covering shoulders and knees, and bring a scarf for mosque visits.",
   "Agree taxi and service prices in advance, as overcharging of tourists is common.",
   "Use your right hand for eating and giving money, and ask before photographing people.",
   "Be patient with persistent vendors and touts at major sites; a firm, polite no thank you works best."
  ],
  "transport": "From Cairo International Airport use the official white airport taxis with a meter, a pre-booked transfer, or ride-hailing. Uber and the regional Careem operate widely in Cairo and Alexandria and are the most reliable, transparent option for visitors.",
  "connectivity": "Vodafone, Orange, Etisalat and WE SIMs are sold with a passport at the airport; 4G is widely available in cities and tourist areas.",
  "payments": "Egypt remains largely cash-based in Egyptian pounds for taxis, markets and tips; cards work in hotels, malls and larger restaurants, and mobile wallets are growing but not universal."
 },
 "IR": {
  "iso2": "IR",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is treated and drinkable in most cities like Tehran and Isfahan, but bottled water is advised in rural and desert areas."
  },
  "etiquette": [
   "Women must wear a headscarf and loose clothing in public, and all visitors should dress conservatively.",
   "Expect taarof, a ritual of polite refusal; offers may be declined two or three times before being accepted.",
   "Use the right hand, remove shoes when entering homes, and avoid public displays of affection.",
   "Do not photograph military, government or sensitive infrastructure, and ask before photographing people."
  ],
  "transport": "From Imam Khomeini International Airport, use official airport taxis or pre-booked transfers into Tehran. The domestic ride-hailing app Snapp is dominant and cheap; international apps like Uber do not operate, and major cities have extensive metro networks.",
  "connectivity": "Irancell and Hamrah-e-Aval SIMs are available with a passport, but foreign cards may not roam and many international sites require a VPN due to filtering.",
  "payments": "International cards do not work due to sanctions, so bring sufficient cash in euros or US dollars to exchange; locals use the domestic banking and mobile-payment system that tourists cannot access, though prepaid tourist cards exist."
 },
 "IQ": {
  "iso2": "IQ",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water quality is poor and unreliable; drink only bottled water."
  },
  "etiquette": [
   "Dress conservatively, with women covering hair in religious sites and shrines, especially in cities like Najaf and Karbala.",
   "Seek permission before photographing people, checkpoints, military and government buildings.",
   "Accept tea or coffee when offered, and use the right hand for eating and greetings.",
   "Discuss religion, sect and politics with great care, and respect local customs that differ between the south and Kurdistan."
  ],
  "transport": "From Baghdad or Erbil airports, use vetted hotel transfers or trusted private drivers rather than informal taxis. Travel is overwhelmingly by private car and taxi; international ride-hailing apps are largely absent, though local apps like Careem operate in some areas.",
  "connectivity": "Asiacell, Zain and Korek SIMs are available with a passport; 4G is functional in cities but coverage and stability vary, and outages occur.",
  "payments": "Iraq is a strongly cash-based economy using Iraqi dinars, with US dollars accepted for larger transactions; card acceptance is limited mostly to higher-end hotels in Erbil and Baghdad."
 },
 "IL": {
  "iso2": "IL",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is treated and safe to drink throughout the country, including from desalination plants."
  },
  "etiquette": [
   "Respect Shabbat from Friday evening to Saturday evening, when many businesses and public transport pause in Jewish areas.",
   "Dress modestly at religious sites; cover shoulders and knees, and men cover their heads at the Western Wall.",
   "Be aware of differing customs between secular, religious Jewish, Muslim and Christian areas and dress accordingly.",
   "Expect direct, informal communication that visitors may find blunt but is not intended as rude."
  ],
  "transport": "From Ben Gurion Airport, the train and shared sherut vans reach Tel Aviv and Jerusalem, alongside taxis. The local app Gett dominates ride-hailing while Uber is limited; trains and buses are extensive but largely suspended on Shabbat.",
  "connectivity": "Local SIMs and eSIMs from carriers like Pelephone, Cellcom and Partner are easy to obtain; 4G/5G and public wifi are fast and widespread.",
  "payments": "Cards and contactless are accepted almost everywhere and mobile wallets are common; carry shekels in cash mainly for markets and small kiosks."
 },
 "JO": {
  "iso2": "JO",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is chlorinated and generally treated but many visitors prefer bottled water, especially given the very limited water supply."
  },
  "etiquette": [
   "Dress modestly, covering shoulders and knees, and women should carry a scarf for mosque visits.",
   "Accept offered tea or coffee as a sign of hospitality, and use the right hand for eating and greetings.",
   "Ask before photographing people, particularly women and at Bedouin camps.",
   "Bargain politely in souqs but avoid aggressive haggling, and dress more conservatively outside Amman."
  ],
  "transport": "From Queen Alia International Airport, the Airport Express Bus to Amman is reliable and cheap, with fixed-fare airport taxis as an alternative. The local app Careem and Uber both operate in Amman; intercity travel relies on buses and JETT coaches.",
  "connectivity": "Zain, Orange and Umniah SIMs are sold at the airport with a passport; 4G coverage is good in Amman and tourist areas like Petra and Aqaba.",
  "payments": "Cash in Jordanian dinars is needed for taxis, markets and small shops, while cards are accepted in hotels, malls and larger restaurants; mobile wallets like eFAWATEERcom exist but are mostly used by residents."
 },
 "KW": {
  "iso2": "KW",
  "tapWater": {
   "status": "caution",
   "note": "Desalinated tap water is technically safe but storage tanks and taste lead most people to drink bottled water."
  },
  "etiquette": [
   "Dress modestly in public, covering shoulders and knees, and observe stricter norms during Ramadan.",
   "Do not eat, drink or smoke in public during daylight hours in Ramadan.",
   "Kuwait is dry; do not bring or consume alcohol, which is strictly prohibited.",
   "Use the right hand for greetings and eating, and avoid public displays of affection."
  ],
  "transport": "From Kuwait International Airport, metered taxis and pre-booked transfers reach the city. Private cars and taxis dominate as public transport is limited; Careem operates and Uber is available, making ride-hailing a convenient option.",
  "connectivity": "Zain, stc and Ooredoo SIMs and eSIMs are easy to buy with a passport; 4G/5G and wifi are fast and widely available.",
  "payments": "Cards and contactless are accepted nearly everywhere alongside mobile wallets like Apple Pay and the local KNET network; carry Kuwaiti dinars mainly for souqs and small vendors."
 },
 "LB": {
  "iso2": "LB",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not reliably potable due to contamination and infrastructure issues; drink bottled water."
  },
  "etiquette": [
   "Respect the mix of religious communities; dress modestly at mosques and churches and cover shoulders and knees.",
   "Beirut is relatively liberal, but dress more conservatively in southern and rural areas.",
   "Ask before photographing people, and avoid photographing military, checkpoints and political party offices and flags.",
   "Accept offered coffee or food graciously, and keep political and sectarian conversation neutral."
  ],
  "transport": "From Beirut-Rafic Hariri International Airport, use a pre-booked transfer or an official airport taxi with the fare agreed in advance. Shared service taxis and private cars dominate; the local app Bolt operates in Beirut while Uber presence is limited.",
  "connectivity": "Alfa and touch SIMs are available with a passport but data is relatively expensive; mobile and wifi service is affected by recurring power outages.",
  "payments": "Severe economic and currency crisis means US dollars in cash are widely used alongside the Lebanese pound; card acceptance is inconsistent, so carry small US notes for most transactions."
 },
 "LY": {
  "iso2": "LY",
  "tapWater": {
   "status": "unsafe",
   "note": "Drink only sealed bottled water; tap supply is unreliable and frequently contaminated."
  },
  "etiquette": [
   "Dress conservatively; women should cover shoulders and knees, and modest dress is expected for men too.",
   "Avoid alcohol entirely, as it is illegal throughout the country.",
   "Do not photograph government buildings, checkpoints, or armed personnel.",
   "Always ask permission before photographing local people, especially women."
  ],
  "transport": "There are no formal airport transfer services; arrange transport in advance through your accommodation or a trusted contact, as security conditions make unplanned movement risky. Shared taxis and private cars dominate; ride-hailing apps do not operate.",
  "connectivity": "Local SIMs from Libyana and Almadar are available with passport registration, but coverage is patchy outside cities and internet can be slow or intermittent.",
  "payments": "Libya is overwhelmingly cash-based and the dinar has a large parallel-market gap; cards are rarely accepted and ATMs are unreliable, so carry sufficient hard currency."
 },
 "MA": {
  "iso2": "MA",
  "tapWater": {
   "status": "caution",
   "note": "Locals drink it in major cities, but visitors should prefer bottled water to avoid stomach upset."
  },
  "etiquette": [
   "Bargaining is expected in souks; start well below the asking price and remain good-humoured.",
   "Dress modestly, particularly in rural areas and when visiting religious sites.",
   "Ask before photographing people, and expect that some will request a small payment.",
   "Use your right hand for eating and passing items, especially shared dishes."
  ],
  "transport": "Trains (ONCF) connect the airports of Casablanca and other cities to centres efficiently; petit taxis handle in-city trips and grand taxis cover intercity routes. Careem operates in some cities, but most rely on metered or negotiated taxis.",
  "connectivity": "Prepaid SIMs from Maroc Telecom, Orange, and Inwi are cheap and widely sold; eSIM support exists and 4G coverage is good in populated areas.",
  "payments": "Cash in dirhams is essential for souks, taxis, and small vendors; cards work in hotels and larger establishments, and mobile payments are limited."
 },
 "OM": {
  "iso2": "OM",
  "tapWater": {
   "status": "caution",
   "note": "Desalinated tap water is generally treated, but most residents and visitors drink bottled water."
  },
  "etiquette": [
   "Dress modestly in public; cover shoulders and knees, and women should carry a scarf for mosque visits.",
   "Accept offered coffee or dates as a gesture of hospitality, and use your right hand.",
   "Avoid public displays of affection and remain discreet about alcohol consumption.",
   "Ask permission before photographing residents, particularly women."
  ],
  "transport": "Airport taxis are metered or fixed-fare and reliable; renting a car is the practical way to explore, as public transport is limited. Careem and a local app operate in Muscat for ride-hailing.",
  "connectivity": "Tourist SIMs from Omantel and Ooredoo are sold at the airport with passport registration; eSIMs are supported and 4G/5G coverage is strong in inhabited areas.",
  "payments": "Cards are widely accepted in Muscat hotels, malls, and restaurants, but carry rial cash for souks, rural areas, and small shops."
 },
 "PS": {
  "iso2": "PS",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is often saline or contaminated; rely on bottled or filtered water."
  },
  "etiquette": [
   "Dress conservatively, covering shoulders and knees, especially in Hebron and near religious sites.",
   "Be sensitive when discussing politics and avoid taking sides in conversations.",
   "Ask before photographing people, checkpoints, or military personnel.",
   "Accept hospitality such as tea or coffee graciously when offered."
  ],
  "transport": "Most visitors arrive overland from Israel or Jordan; shared service taxis (servees) and buses connect towns in the West Bank, while movement is governed by checkpoints. Ride-hailing apps are not generally used.",
  "connectivity": "Palestinian operators Jawwal and Ooredoo offer prepaid SIMs but are limited to slower data; many travellers use Israeli SIMs for faster 4G coverage.",
  "payments": "Cash is dominant, with the Israeli shekel used alongside the Jordanian dinar in some areas; cards are accepted in larger hotels and shops in cities."
 },
 "QA": {
  "iso2": "QA",
  "tapWater": {
   "status": "safe",
   "note": "Desalinated tap water meets safety standards, though many prefer bottled for taste."
  },
  "etiquette": [
   "Dress modestly in public spaces; shoulders and knees should be covered, especially in malls and government buildings.",
   "Avoid public displays of affection and refrain from drinking alcohol outside licensed venues.",
   "Use your right hand for greetings and eating, and ask before photographing locals.",
   "Be respectful during Ramadan by not eating or drinking in public during daylight."
  ],
  "transport": "The Doha Metro connects Hamad International Airport to the city cheaply and efficiently; Karwa taxis are metered. Uber and Careem both operate widely.",
  "connectivity": "Tourist SIMs from Ooredoo and Vodafone are sold at the airport; eSIMs are supported and 4G/5G coverage is excellent nationwide.",
  "payments": "Cards and contactless payments are accepted almost everywhere, and Apple Pay and Google Pay are common; keep some riyal cash for small vendors."
 },
 "SA": {
  "iso2": "SA",
  "tapWater": {
   "status": "caution",
   "note": "Urban desalinated water is treated, but bottled water is standard and widely available."
  },
  "etiquette": [
   "Dress modestly; women no longer need an abaya but should cover shoulders and knees, and men should avoid shorts in public.",
   "Avoid alcohol entirely, as it is strictly prohibited.",
   "Be mindful of prayer times, when many shops briefly close.",
   "Do not photograph people, especially women, without clear consent."
  ],
  "transport": "Airports in Riyadh and Jeddah connect to cities via taxi and ride-hailing; the Haramain high-speed rail links Jeddah, Mecca, and Medina. Uber and Careem operate extensively and are the preferred way to get around.",
  "connectivity": "Tourist SIMs from STC, Mobily, and Zain are available at airports with passport registration; eSIMs are supported and 5G coverage is strong in cities.",
  "payments": "Cards and contactless mobile payments (Mada, Apple Pay) are accepted almost everywhere, though small cash amounts in riyals remain useful for markets."
 },
 "SY": {
  "iso2": "SY",
  "tapWater": {
   "status": "unsafe",
   "note": "Infrastructure damage makes tap water unreliable; drink bottled or boiled water only."
  },
  "etiquette": [
   "Dress conservatively and modestly, covering shoulders and knees in all public areas.",
   "Avoid all discussion of politics and the conflict with strangers.",
   "Do not photograph checkpoints, military sites, or personnel under any circumstances.",
   "Ask permission before photographing residents, particularly women."
  ],
  "transport": "There are no organised transfer services; arrange ground transport through trusted local contacts, as checkpoints and security conditions complicate movement. Shared taxis and microbuses are the norm; ride-hailing apps do not operate.",
  "connectivity": "SIMs from Syriatel and MTN require registration, but electricity shortages and damaged infrastructure cause frequent outages and slow data.",
  "payments": "The economy is almost entirely cash-based with a volatile currency; cards and ATMs are largely unusable due to sanctions, so carry cash."
 },
 "TN": {
  "iso2": "TN",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is chlorinated in cities but bottled water is recommended to avoid mineral-related upset."
  },
  "etiquette": [
   "Dress modestly away from beach resorts, covering shoulders and knees at religious sites.",
   "Bargaining is normal in souks; negotiate politely and with patience.",
   "Use your right hand for eating and greetings.",
   "Ask before photographing people, and be discreet near government buildings."
  ],
  "transport": "Taxis from Tunis-Carthage Airport are metered and inexpensive; louages (shared minibuses) link towns intercity, and the TGM light rail serves the capital's suburbs. Bolt operates in Tunis, but most use metered taxis.",
  "connectivity": "Prepaid SIMs from Ooredoo, Orange, and Tunisie Telecom are cheap and easy to buy; eSIM availability is growing and 4G coverage is solid in populated areas.",
  "payments": "Cash in dinars is needed for taxis, markets, and small shops; cards are accepted in hotels and larger stores, and the dinar cannot be taken out of the country."
 },
 "TR": {
  "iso2": "TR",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is chlorinated but heavily mineralised; most residents and visitors drink bottled water."
  },
  "etiquette": [
   "Remove shoes and dress modestly when entering mosques; women should cover their hair.",
   "Accept offered tea as a gesture of hospitality, as refusing can seem rude.",
   "Bargaining is expected in bazaars but not in fixed-price shops.",
   "Avoid sensitive political topics, particularly regarding the state and its leaders."
  ],
  "transport": "Istanbul Airport connects to the city via the M11 metro, the HAVAIST bus, or taxi; cities have extensive metro, tram, and ferry networks using the Istanbulkart. Uber operates in Istanbul (dispatching licensed taxis), alongside the local BiTaksi app.",
  "connectivity": "Tourist SIMs from Turkcell, Vodafone, and Türk Telekom are available with passport registration; eSIMs are supported and 4G/5G coverage is strong, though unregistered foreign phones are blocked after about 120 days.",
  "payments": "Contactless cards are accepted very widely, including on public transport and in taxis; carry some lira cash for markets and small vendors."
 },
 "AE": {
  "iso2": "AE",
  "tapWater": {
   "status": "safe",
   "note": "Desalinated tap water is safe at the source, though many prefer bottled for taste."
  },
  "etiquette": [
   "Dress modestly in public and cover shoulders and knees in malls and government offices.",
   "Avoid public displays of affection, which can lead to legal trouble.",
   "Drink alcohol only in licensed venues such as hotels and bars.",
   "Be discreet and respectful during Ramadan, avoiding eating or drinking in public during daylight."
  ],
  "transport": "Dubai's airport connects to the city via the driverless Metro and metered taxis; Abu Dhabi relies on taxis and buses. Uber and Careem operate extensively across the Emirates.",
  "connectivity": "Tourist SIMs from Etisalat (e&) and du are sold at airports; eSIMs are supported and 5G coverage is excellent, though some VoIP calling apps are restricted.",
  "payments": "Cards and contactless mobile payments (Apple Pay, Google Pay) are accepted almost everywhere; cash in dirhams is rarely needed beyond small souks."
 },
 "YE": {
  "iso2": "YE",
  "tapWater": {
   "status": "unsafe",
   "note": "Water infrastructure has collapsed in much of the country; drink only bottled or treated water."
  },
  "etiquette": [
   "Dress very conservatively; women should cover fully and men should avoid shorts.",
   "Avoid all political discussion and never photograph checkpoints or armed personnel.",
   "Chewing qat in the afternoon is a widespread social custom you may be invited to share.",
   "Always seek permission before photographing people, particularly women."
  ],
  "transport": "There are no organised transfer services and movement requires local arrangement amid active conflict and checkpoints. Shared taxis and minibuses are the local norm; ride-hailing apps do not operate.",
  "connectivity": "SIMs from YemenMobile, Sabafon, and MTN require registration, but ongoing conflict and power shortages make connectivity slow and unreliable.",
  "payments": "The economy is cash-only with a fragmented and unstable currency that differs between regions; cards and ATMs are not usable, so carry cash."
 },
 "AO": {
  "iso2": "AO",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not potable; drink bottled or thoroughly boiled water."
  },
  "etiquette": [
   "Carry your passport or a certified copy, as police checks are common.",
   "Avoid photographing government buildings, military sites, and police.",
   "Greet people before launching into requests, as courtesy is valued.",
   "Dress smartly in cities, where appearance carries social weight."
  ],
  "transport": "Taxis from Luanda's airport should be pre-arranged or fixed-fare, as metered service is rare; blue-and-white candongueiro minibuses are the local norm but chaotic. Heetch and a few local apps offer some ride-hailing in Luanda.",
  "connectivity": "SIMs from Unitel and Movicel require passport registration; coverage is reasonable in cities but weak rurally, and data can be expensive.",
  "payments": "Cash in kwanza is essential as cards are accepted only in upscale hotels and a few outlets; Multicaixa is the local card and transfer network, and Western cards often fail at ATMs."
 },
 "BJ": {
  "iso2": "BJ",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water; drink sealed bottled or filtered water, including for brushing teeth."
  },
  "etiquette": [
   "Greet people warmly before any transaction, as greetings are socially important.",
   "Dress modestly, particularly in the Muslim north and rural areas.",
   "Ask permission before photographing people or Vodun (voodoo) ceremonies and shrines.",
   "Use your right hand for greetings, eating, and exchanging money."
  ],
  "transport": "Taxis from Cotonou airport should be agreed on a fixed fare beforehand; the dominant local transport is the zemidjan motorcycle taxi, recognisable by yellow shirts. Major ride-hailing apps such as Uber and Bolt do not operate.",
  "connectivity": "SIMs from MTN and Moov are inexpensive and require registration; 4G coverage is decent in Cotonou but limited and slower elsewhere.",
  "payments": "Cash in CFA francs dominates; cards work only in a few upscale hotels in Cotonou, and mobile money (MTN MoMo, Moov) is widely used for everyday payments."
 },
 "BW": {
  "iso2": "BW",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is safe in major towns like Gaborone, but use bottled water in rural and remote areas."
  },
  "etiquette": [
   "Greet with a handshake and a few words of small talk before business, as courtesy is valued.",
   "Dress modestly and neatly; revealing clothing is frowned upon outside lodges.",
   "Ask permission before photographing people.",
   "Respect wildlife rules strictly on safari and never approach animals on foot."
  ],
  "transport": "Airport transfers in Gaborone and Maun are usually arranged through hotels or lodges, as taxis are informal; self-drive and combis (shared minibuses) serve local travel. Ride-hailing apps are minimal, though local options exist in Gaborone.",
  "connectivity": "SIMs from Mascom, Orange, and BTC are sold with registration; 4G coverage is good in towns but sparse across the Kalahari and Okavango regions.",
  "payments": "Cards are widely accepted in towns, lodges, and supermarkets; carry pula cash for rural areas, markets, and tipping vendors, and mobile money is available."
 },
 "BF": {
  "iso2": "BF",
  "tapWater": {
   "status": "unsafe",
   "note": "Do not drink tap water; rely on sealed bottled or filtered water at all times."
  },
  "etiquette": [
   "Greet people thoroughly before any request, as greetings carry strong social weight.",
   "Dress modestly, especially in the predominantly Muslim regions.",
   "Always ask permission before photographing people, and avoid official buildings.",
   "Use your right hand for greetings, eating, and handling money."
  ],
  "transport": "Fix the fare before taking a taxi from Ouagadougou airport; green shared taxis and motorcycles are the dominant local transport. Major international ride-hailing apps do not operate, and security concerns restrict travel outside the capital.",
  "connectivity": "SIMs from Orange, Moov, and Telecel require registration; coverage is reasonable in Ouagadougou and Bobo-Dioulasso but weak rurally.",
  "payments": "Cash in CFA francs is essential as card acceptance is rare outside top hotels; mobile money (Orange Money, Moov Money) is widely used for everyday transactions."
 },
 "BI": {
  "iso2": "BI",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not reliably treated; drink bottled, filtered, or boiled water, including in Bujumbura."
  },
  "etiquette": [
   "Greet people before any request; a handshake and brief inquiry about health and family is expected before business.",
   "Always ask permission before photographing people, and avoid photographing government buildings, the airport, military, or police.",
   "Dress modestly; cover shoulders and knees, especially outside Bujumbura and when visiting churches.",
   "Use the right hand or both hands when giving or receiving items."
  ],
  "transport": "Bujumbura International Airport has no formal transit link, so arrange a hotel pickup or negotiate a taxi fare in advance, as meters are not used. Shared minibuses and motorcycle taxis dominate local transport; no international ride-hailing apps operate.",
  "connectivity": "Buy a local Econet or Lumitel SIM with a passport at an in-town shop for usable 3G/4G in cities, though coverage and speeds drop sharply in rural areas and eSIM support is minimal.",
  "payments": "Burundi runs almost entirely on cash in Burundian francs; cards are accepted only at a few upscale Bujumbura hotels, and Lumitel and Ecocash mobile money are widely used by locals."
 },
 "CV": {
  "iso2": "CV",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is largely desalinated and treated but brackish; most travelers prefer bottled water, which is cheap and ubiquitous."
  },
  "etiquette": [
   "Greet with a relaxed 'bon dia' or 'boa tarde'; Cabo Verdeans value unhurried, friendly exchanges, captured by the local concept of 'morabeza' (warm hospitality).",
   "Embrace island time; schedules are loose, so do not show visible impatience over delays.",
   "Dress casually but avoid beachwear away from the beach when in towns or churches.",
   "Tipping aside, learning a few words of Portuguese or Kriolu is warmly received."
  ],
  "transport": "From the main airports (Sal, Boa Vista, Praia, São Vicente) use the fixed-rate airport taxis or pre-booked hotel transfers. Shared minibuses called 'aluguers' are the cheapest inter-town option; no Uber or Bolt operate, so taxis are hailed or phoned.",
  "connectivity": "CVMovel and Unitel T+ sell tourist SIMs at airports, and eSIMs work well on both networks; 4G is solid on the main tourist islands but patchier on quieter ones.",
  "payments": "Carry euros-convertible escudos in cash for aluguers, markets, and small restaurants; cards work at hotels and larger establishments, and ATMs are common on the developed islands."
 },
 "CM": {
  "iso2": "CM",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water nationwide; use bottled or treated water, even in Yaoundé and Douala."
  },
  "etiquette": [
   "Greet elders and officials first and use titles; formal courtesy carries weight in both Francophone and Anglophone regions.",
   "Do not photograph airports, bridges, government or military sites, and always ask before photographing people.",
   "Avoid all travel to the Anglophone Northwest and Southwest regions and the Far North due to ongoing insecurity.",
   "Dress modestly, particularly in the predominantly Muslim north."
  ],
  "transport": "Douala and Yaoundé airports have official airport taxis; agree the fare before departing as meters are absent. Yango ride-hailing operates in the major cities and is the most reliable option; shared yellow taxis and motorcycle taxis (bendskins) cover local trips.",
  "connectivity": "Orange and MTN dominate; buy a SIM with your passport for decent 4G in cities, while rural coverage is uneven and eSIM availability is limited to MTN on select plans.",
  "payments": "Cash in Central African francs is essential outside major hotels; Orange Money and MTN Mobile Money are heavily used, and card acceptance is confined to upscale urban venues."
 },
 "CF": {
  "iso2": "CF",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is unsafe throughout; rely strictly on bottled, boiled, or filtered water."
  },
  "etiquette": [
   "Reconsider all travel: most governments advise against visiting due to armed conflict and crime; this guidance assumes essential travel only.",
   "Never photograph officials, military, police, or government buildings, and ask before photographing anyone.",
   "Greet formally in French and show deference to authority at the frequent checkpoints; carry ID copies at all times.",
   "Dress conservatively and keep a low profile, avoiding crowds and any political gatherings."
  ],
  "transport": "Bangui M'Poko airport transfers should be pre-arranged through your hotel or organization; do not take random street taxis. There is no ride-hailing; movement around Bangui is by negotiated private car, and overland travel is hazardous and often impassable.",
  "connectivity": "Orange and Telecel SIMs give limited 2G/3G mainly in Bangui; coverage is poor to nonexistent elsewhere and eSIM is not a practical option, so satellite communication is advisable for remote work.",
  "payments": "This is a near-total cash economy using Central African francs; cards and ATMs are unreliable even in Bangui, so carry sufficient cash and some hard currency."
 },
 "TD": {
  "iso2": "TD",
  "tapWater": {
   "status": "unsafe",
   "note": "Do not drink tap water; use bottled or treated water everywhere, including N'Djamena."
  },
  "etiquette": [
   "Dress conservatively, especially women and in the Muslim north; cover shoulders and knees and avoid alcohol consumption in public.",
   "Strictly avoid photographing military, government buildings, the airport, and officials, and ask before photographing people.",
   "Greet in French or Arabic and expect document checks at frequent security checkpoints; carry ID and permits.",
   "Avoid the Lake Chad basin, border regions, and the east due to insecurity."
  ],
  "transport": "Arrange airport pickup from N'Djamena International in advance, as informal taxis are best avoided and fares are negotiated. No ride-hailing apps operate; locals use shared taxis and motorcycle taxis (clandos), and intercity travel requires 4x4 vehicles and permits.",
  "connectivity": "Airtel and Moov SIMs offer basic 3G/4G in N'Djamena but weak and intermittent service elsewhere; eSIM is not realistically available, so manage expectations on connectivity.",
  "payments": "Chad operates overwhelmingly on cash in Central African francs; card use is rare outside a couple of N'Djamena hotels, and Airtel Money is the common mobile payment method."
 },
 "KM": {
  "iso2": "KM",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is untreated and unsafe; drink bottled or boiled water across all islands."
  },
  "etiquette": [
   "These are conservative Muslim islands; dress modestly, with women covering shoulders, knees, and ideally hair when away from beach resorts.",
   "Ask permission before photographing people, particularly women, and avoid photographing official sites.",
   "Use the right hand for eating, greeting, and handling money; the left is considered unclean.",
   "Respect prayer times and Ramadan, when many businesses close and public eating and drinking should be avoided."
  ],
  "transport": "From Moroni's Prince Said Ibrahim airport, arrange a hotel transfer or negotiate a taxi fare in advance. There are no ride-hailing apps; getting around relies on shared taxis (taxi-brousse) and negotiated private hires, with inter-island travel by small plane or ferry.",
  "connectivity": "Comores Telecom and Telma sell local SIMs; 3G/4G works in Moroni and main towns but is slow and patchy elsewhere, and eSIM is not generally supported.",
  "payments": "Carry cash in Comorian francs, as cards are accepted almost nowhere and ATMs are scarce and unreliable; bring euros to exchange and budget for a cash-only trip."
 },
 "CG": {
  "iso2": "CG",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water in the Republic of the Congo; use bottled or treated water, including in Brazzaville."
  },
  "etiquette": [
   "Greet in French with a handshake before any conversation, and show respect to elders and officials.",
   "Do not photograph the airport, government buildings, military, police, or the river ports, and ask before photographing people.",
   "Carry ID copies for frequent checkpoints, especially in Brazzaville and Pointe-Noire.",
   "Dress neatly; Congolese place high value on personal presentation and tidy clothing."
  ],
  "transport": "Use official or hotel-arranged taxis from Brazzaville's Maya-Maya and Pointe-Noire airports, negotiating fares in advance. No international ride-hailing apps operate reliably; green-and-white shared taxis and minibuses serve the cities, and a rail line links Brazzaville and Pointe-Noire.",
  "connectivity": "MTN and Airtel SIMs provide functional 4G in Brazzaville and Pointe-Noire but limited rural coverage; buy with a passport, as eSIM support is minimal.",
  "payments": "Cash in Central African francs dominates; Airtel Money and MTN Mobile Money are widely used, while card acceptance is restricted to major hotels and a few city outlets."
 },
 "CD": {
  "iso2": "CD",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is unsafe across DR Congo; rely on bottled, boiled, or filtered water everywhere."
  },
  "etiquette": [
   "Carry your passport and a yellow-fever certificate at all times; checkpoints are frequent and officials may demand documents.",
   "Never photograph government buildings, the airport, military, police, or mining sites, and always ask before photographing people.",
   "Avoid the conflict-affected eastern provinces (North and South Kivu, Ituri) entirely.",
   "Greet in French with formality and patience; calm, polite negotiation works best at official interactions."
  ],
  "transport": "Pre-arrange airport transfers from Kinshasa's N'djili (and other airports) through your hotel; do not use unsolicited taxis. Yango operates in Kinshasa and is the most reliable city option; otherwise shared taxis and minibuses prevail, and intercity travel often means flying due to poor roads.",
  "connectivity": "Vodacom, Airtel, and Orange sell SIMs requiring passport registration; 4G is decent in Kinshasa and Lubumbashi but weak elsewhere, and eSIM is offered on limited plans.",
  "payments": "Carry cash in both Congolese francs and clean, newer US dollars, which are widely accepted; Airtel Money, M-Pesa, and Orange Money are common, while card use is confined to top hotels."
 },
 "CI": {
  "iso2": "CI",
  "tapWater": {
   "status": "caution",
   "note": "Abidjan tap water is treated and generally drinkable for some, but most travelers choose bottled water, which is essential elsewhere."
  },
  "etiquette": [
   "Greet in French with a handshake; taking time for polite greetings before business is expected.",
   "Avoid photographing military, police, government buildings, and the airport, and ask before photographing people.",
   "Dress smartly in Abidjan, where appearance matters, and more modestly in the Muslim-majority north.",
   "Carry ID for occasional checkpoints and stay alert to your surroundings in Abidjan after dark."
  ],
  "transport": "Abidjan's Félix-Houphouët-Boigny airport has metered official red taxis and pre-booked transfers. Yango is widely used and the most convenient app for getting around the city; orange Abidjan taxis and woro-woro shared taxis cover local routes.",
  "connectivity": "Orange, MTN, and Moov sell tourist SIMs with passport registration and good 4G across Abidjan and major towns; eSIM is available on select Orange plans.",
  "payments": "Cash in West African francs is needed for taxis and markets; Orange Money, MTN, Moov, and Wave mobile money are extremely popular, and cards work at hotels, malls, and larger restaurants in Abidjan."
 },
 "DJ": {
  "iso2": "DJ",
  "tapWater": {
   "status": "caution",
   "note": "Djibouti City tap water is desalinated and chlorinated but often unpalatable and salty; bottled water is strongly recommended, and essential outside the capital."
  },
  "etiquette": [
   "Dress modestly in this conservative Muslim country; women should cover shoulders and knees, and beachwear belongs only at resorts.",
   "Respect Ramadan and prayer times, avoiding public eating and drinking during fasting hours.",
   "Ask before photographing people and avoid military and port installations, including the French and other foreign bases.",
   "Note that chewing khat is a widespread afternoon custom; do not photograph it without consent."
  ],
  "transport": "Djibouti-Ambouli airport is close to the city; use official taxis and agree the fare beforehand, as meters are not used. No ride-hailing apps operate; transport is by negotiated taxi or shared minibus, and the Addis Ababa railway links Djibouti to Ethiopia.",
  "connectivity": "Djibouti Telecom holds a monopoly and sells SIMs; 4G works in the capital but data is comparatively expensive and slow, and eSIM is not generally available.",
  "payments": "Cash in Djiboutian francs is standard, with US dollars and euros accepted in some places; cards work at major hotels and a few outlets, but mobile payments are not widespread."
 },
 "GQ": {
  "iso2": "GQ",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is unsafe in Equatorial Guinea; use bottled or treated water in Malabo, Bata, and elsewhere."
  },
  "etiquette": [
   "Photography is highly sensitive; never photograph government buildings, the airport, military, police, the presidential palace, or oil installations, and ask before photographing people.",
   "Carry your passport and visa at all times, as checkpoints and document checks are common.",
   "Greet officials formally in Spanish or French; courtesy and patience smooth bureaucratic encounters.",
   "Dress neatly and conservatively, and keep a low profile around official and security personnel."
  ],
  "transport": "Arrange transfers through your hotel from Malabo and Bata airports, and negotiate any taxi fare in advance. There are no ride-hailing apps; shared and private taxis serve the cities, and a flight is usually needed between Malabo (island) and the mainland.",
  "connectivity": "Orange (Muni) and GETESA sell SIMs that give basic 3G/4G in Malabo and Bata but limited coverage elsewhere; eSIM is not practically available and data can be costly.",
  "payments": "This is largely a cash economy in Central African francs; cards are accepted only at some international hotels, ATMs are unreliable, and mobile money is not widely used."
 },
 "ER": {
  "iso2": "ER",
  "tapWater": {
   "status": "unsafe",
   "note": "Do not drink tap water in Eritrea; use bottled or boiled water, including in Asmara."
  },
  "etiquette": [
   "Carry your passport and obtain a travel permit before leaving Asmara; permits are mandatory and checked at numerous roadblocks.",
   "Strictly avoid photographing military, government buildings, the airport, bridges, ports, and infrastructure; penalties are serious.",
   "Greet warmly and unhurriedly; sharing coffee is an important social ritual, and refusing hospitality can offend.",
   "Dress modestly and respect both Orthodox Christian and Muslim customs depending on the area."
  ],
  "transport": "Use a hotel-arranged transfer or a recommended taxi from Asmara International airport. There are no ride-hailing apps; Asmara is compact and walkable, with shared taxis and buses for longer trips, while intercity travel requires permits and is slow.",
  "connectivity": "EriTel is the sole, state-controlled provider; mobile data is extremely limited and slow, internet access is heavily restricted, and eSIM is unavailable, so plan to be largely offline.",
  "payments": "Eritrea is strictly cash-only in nakfa, with tight currency controls; cards and ATMs do not function for visitors, so declare and bring sufficient foreign cash to exchange officially."
 },
 "SZ": {
  "iso2": "SZ",
  "tapWater": {
   "status": "caution",
   "note": "Urban tap water in Mbabane and Manzini is generally treated and considered drinkable, but bottled water is wiser in rural areas."
  },
  "etiquette": [
   "Show respect for the monarchy and traditional culture; do not criticize the king and behave deferentially at cultural events like the Reed Dance.",
   "Dress modestly, especially when visiting rural homesteads or attending ceremonies.",
   "Greet politely and use both hands or the right hand when giving or receiving items.",
   "Ask permission before photographing people, ceremonies, or royal sites."
  ],
  "transport": "King Mswati III (Sikhuphe/KMIII) airport is far from cities, so pre-book a transfer or rental car; the smaller route via road from South Africa is common. No ride-hailing apps operate; minibus taxis (kombis) and negotiated metered taxis handle local transport, and a car is most practical.",
  "connectivity": "MTN Eswatini and Eswatini Mobile sell SIMs with good 4G in towns and tourist areas; eSIM is available via MTN, and coverage reaches most populated and game-park areas.",
  "payments": "The lilangeni is at par with and interchangeable with the South African rand, both accepted; cards work widely in towns and lodges, and MTN MoMo mobile money is common, though cash helps in rural areas."
 },
 "ET": {
  "iso2": "ET",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water in Ethiopia; use bottled or boiled water, including in Addis Ababa."
  },
  "etiquette": [
   "Eat with the right hand from shared injera platters; using the left hand is impolite, and being fed by hand (gursha) is a gesture of friendship.",
   "Dress modestly and remove shoes when entering churches and mosques; women should cover their hair at religious sites.",
   "Ask before photographing people, especially in the Omo Valley, where photos are often expected to be paid for.",
   "Avoid the Tigray, Amhara, and other conflict-affected regions and check current travel advisories."
  ],
  "transport": "Addis Ababa Bole airport is near the city; use the official airport taxis or a hotel transfer. Ride-hailing apps Ride, Feres, and Yango operate in Addis and are reliable; blue-and-white minibuses and the light-rail network also serve the capital.",
  "connectivity": "Buy an Ethio Telecom or Safaricom SIM on arrival at Bole airport for the best coverage; international eSIMs on the Ethio Telecom network work well, though service and occasional shutdowns can affect reliability.",
  "payments": "Cash in birr is needed for most everyday transactions; cards work at major hotels and some Addis venues, ATMs are common in cities, and Telebirr mobile money is widely used by locals."
 },
 "GA": {
  "iso2": "GA",
  "tapWater": {
   "status": "caution",
   "note": "Libreville tap water is treated and drinkable for many, but most travelers prefer bottled water, which is essential outside the capital."
  },
  "etiquette": [
   "Greet in French with a handshake before conversation; politeness and formality are valued.",
   "Do not photograph the airport, government and military sites, or the presidential palace, and ask before photographing people.",
   "Carry your passport or a copy for checkpoints, which are common in and around Libreville.",
   "Dress neatly in the city and modestly when visiting villages or religious sites."
  ],
  "transport": "From Libreville's Léon-Mba airport, use official taxis and negotiate the fare in advance, or arrange a hotel transfer. No major ride-hailing app operates reliably; shared and chartered taxis serve the city, and domestic flights connect to other towns given limited roads.",
  "connectivity": "Airtel and Moov sell SIMs with passport registration and reasonable 4G in Libreville and Port-Gentil; coverage thins inland, and eSIM support is limited.",
  "payments": "Cash in Central African francs is needed for taxis and markets; Airtel Money and Moov Money are common, and cards are accepted at major hotels, supermarkets, and some Libreville restaurants."
 },
 "GM": {
  "iso2": "GM",
  "tapWater": {
   "status": "unsafe",
   "note": "Stick to bottled or filtered water; tap supply is unreliable and untreated outside major hotels."
  },
  "etiquette": [
   "Greet with a handshake and a few words of inquiry about family or health before getting to business; abruptness reads as rude.",
   "Use the right hand for eating, giving, and receiving, as the left is considered unclean.",
   "Ask permission before photographing people, government buildings, or the airport.",
   "Dress modestly in this predominantly Muslim country, especially in rural areas and during Ramadan."
  ],
  "transport": "Banjul International Airport sits roughly 24 km from the coastal resort strip; arrange a hotel transfer or negotiate a green tourist taxi fare in advance. Shared yellow taxis, minibuses, and gelly-gelly vans dominate local travel; no Uber or Bolt operate.",
  "connectivity": "Local SIMs from Africell, Comium, or Gamcel are cheap and sold with passport registration; coverage and mobile data are decent in greater Banjul but patchy upcountry, and eSIM support is limited.",
  "payments": "The Gambia is overwhelmingly cash-based in dalasi; cards work at a handful of upscale hotels only, and mobile money is emerging but not widespread."
 },
 "GH": {
  "iso2": "GH",
  "tapWater": {
   "status": "unsafe",
   "note": "Drink sachet or bottled water; treated supply varies and tap water commonly causes stomach upset for visitors."
  },
  "etiquette": [
   "Always use the right hand to greet, eat, give, and receive; the left hand is taboo for these.",
   "Greet people individually when entering a room or shop rather than addressing the group collectively.",
   "Ask before photographing individuals, markets, or military and government sites.",
   "Dress neatly and modestly, particularly when visiting chiefs, churches, or northern Muslim communities."
  ],
  "transport": "Kotoka International Airport in Accra is about 10 km from the centre; use the regulated airport taxi desk or ride-hailing. Bolt and Uber both operate in Accra and Kumasi, while shared tro-tro minibuses and taxis cover most local routes.",
  "connectivity": "MTN, Telecel, and AirtelTigo SIMs require passport registration and offer affordable data with good 4G in cities; eSIM is available on MTN, and wifi is common in hotels and cafes.",
  "payments": "Cash in cedis prevails for everyday purchases, but mobile money (notably MTN MoMo) is ubiquitous, and cards are accepted at larger hotels, malls, and supermarkets."
 },
 "GN": {
  "iso2": "GN",
  "tapWater": {
   "status": "unsafe",
   "note": "Use bottled or treated water only; municipal supply is intermittent and not safe to drink."
  },
  "etiquette": [
   "Offer a handshake and brief greetings in French before any request; rushing is poorly received.",
   "Eat and pass items with the right hand, especially when sharing from a communal dish.",
   "Avoid photographing bridges, airports, military, and government buildings, which can prompt detention.",
   "Dress conservatively in this majority-Muslim country and be discreet during Ramadan daylight hours."
  ],
  "transport": "Conakry's Ahmed Sekou Toure Airport is near the city, but traffic on the narrow peninsula can make the short distance slow; arrange a trusted driver or hotel pickup rather than hailing on the street. Shared taxis and minibuses are the norm; no ride-hailing apps function.",
  "connectivity": "Orange and MTN SIMs are inexpensive with passport registration; 4G works in Conakry but is unreliable elsewhere, eSIM is largely unavailable, and power cuts affect connectivity.",
  "payments": "Guinea runs almost entirely on cash in Guinean francs; cards are rarely accepted outside top hotels, while Orange Money and MTN mobile money are increasingly used."
 },
 "GW": {
  "iso2": "GW",
  "tapWater": {
   "status": "unsafe",
   "note": "Drink only bottled or properly treated water, as tap supply is unsafe throughout the country."
  },
  "etiquette": [
   "Greet in Portuguese or Crioulo and exchange pleasantries before business; patience is expected.",
   "Use the right hand for eating and exchanging money or items.",
   "Ask permission before photographing people and avoid military, port, and government sites.",
   "Dress modestly and respect local customs, which blend Muslim, Christian, and animist traditions."
  ],
  "transport": "Osvaldo Vieira International Airport is about 8 km from Bissau; pre-arrange a hotel transfer or agree a taxi fare beforehand. Shared toca-toca minibuses and taxis serve the capital; there are no ride-hailing apps.",
  "connectivity": "MTN and Orange SIMs are available cheaply with registration, but data is slow and coverage thin outside Bissau; eSIM is not supported and outages are frequent.",
  "payments": "This is a cash economy using the West African CFA franc; card acceptance is almost nonexistent, so carry sufficient cash and exchange before arrival."
 },
 "KE": {
  "iso2": "KE",
  "tapWater": {
   "status": "unsafe",
   "note": "Use bottled or filtered water; tap water is not reliably potable even in Nairobi."
  },
  "etiquette": [
   "Greet with a handshake and ask after wellbeing before getting to the point; Swahili greetings like 'Jambo' or 'Habari' are appreciated.",
   "Use the right hand or both hands when giving or receiving, particularly with elders.",
   "Ask before photographing people, and avoid shooting government buildings, airports, and the president's residence.",
   "Dress modestly on the coast and in rural areas, covering shoulders and knees, especially in Muslim Lamu and Mombasa."
  ],
  "transport": "Jomo Kenyatta International Airport is roughly 15 km from central Nairobi; the SGR train, airport taxis, and ride-hailing serve it. Uber and Bolt operate widely in Nairobi and Mombasa, alongside matatu minibuses and boda-boda motorbikes for local trips.",
  "connectivity": "Safaricom, Airtel, and Telkom SIMs need passport registration and deliver strong 4G/5G in cities; Safaricom supports eSIM, and wifi is common in lodges, hotels, and cafes.",
  "payments": "Mobile money via M-Pesa is dominant and accepted almost everywhere, cards work in hotels, malls, and restaurants, and cash in shillings remains useful for markets and matatus."
 },
 "LS": {
  "iso2": "LS",
  "tapWater": {
   "status": "caution",
   "note": "Tap water in Maseru is generally treated but variable; bottled or boiled water is safer in rural highlands."
  },
  "etiquette": [
   "Greet with 'Lumela' and a handshake; taking time over greetings shows respect.",
   "Show deference to elders and village chiefs, and ask permission before entering a village or photographing residents.",
   "Wear a Basotho blanket appropriately and respectfully if offered, and dress warmly as highland temperatures drop sharply.",
   "Ask before photographing people, herders, or their livestock."
  ],
  "transport": "Moshoeshoe I International Airport lies about 18 km from Maseru with limited flights, so most travelers arrive overland from South Africa via the Maseru Bridge border. Shared taxis (kombis) and four-plus-one sedans handle local transport; no ride-hailing apps operate.",
  "connectivity": "Vodacom and Econet SIMs are available with registration and give reasonable 4G around Maseru, but mountain coverage is patchy; eSIM support is minimal.",
  "payments": "Cash in loti (South African rand is also accepted at par) is standard, cards work in Maseru supermarkets and hotels, and M-Pesa and EcoCash mobile money are widely used."
 },
 "LR": {
  "iso2": "LR",
  "tapWater": {
   "status": "unsafe",
   "note": "Drink bottled or treated water only; piped supply is limited and unsafe."
  },
  "etiquette": [
   "Greet warmly and learn the Liberian finger-snap handshake, which locals enjoy sharing with visitors.",
   "Use the right hand for giving and receiving, and accept hospitality graciously.",
   "Ask permission before photographing people, and avoid government, port, and security installations.",
   "Dress modestly and avoid flaunting valuables given economic disparities."
  ],
  "transport": "Roberts International Airport is far from Monrovia, about 50 km, so pre-arrange a hotel transfer or trusted driver for the hour-plus drive. Shared taxis, minibuses, and pen-pen motorbike taxis dominate the city; no ride-hailing apps operate.",
  "connectivity": "Orange and Lonestar Cell MTN SIMs are cheap with registration and provide 4G in Monrovia, though coverage and power are inconsistent elsewhere; eSIM is generally unavailable.",
  "payments": "Liberia uses both Liberian and US dollars in cash; cards are accepted only at a few upscale hotels, while Orange Money and MTN mobile money are growing fast."
 },
 "MG": {
  "iso2": "MG",
  "tapWater": {
   "status": "unsafe",
   "note": "Use bottled or treated water; tap water carries a high risk of waterborne illness."
  },
  "etiquette": [
   "Learn local fady (taboos), which vary by region and can govern food, days, and sacred sites; ask a guide before acting.",
   "Greet politely and use the right hand for giving and receiving.",
   "Ask permission before photographing people, tombs, and ancestral sites, which are highly sensitive.",
   "Bargain calmly and good-naturedly in markets, and dress modestly outside beach resorts."
  ],
  "transport": "Ivato International Airport is about 15 km from Antananarivo; use the official airport taxi desk or a hotel transfer, as metered fares do not exist. Local transport relies on taxis, pousse-pousse rickshaws, and long-distance taxi-brousse minibuses; no Uber or Bolt operate.",
  "connectivity": "Telma, Orange, and Airtel SIMs are inexpensive with registration and offer 4G in cities, but rural coverage is sparse; Telma and Orange support eSIM, and wifi is limited outside hotels.",
  "payments": "Madagascar is largely cash-based in ariary; cards work only in upscale Antananarivo establishments, while Mvola, Orange Money, and Airtel Money mobile wallets are widely used."
 },
 "MW": {
  "iso2": "MW",
  "tapWater": {
   "status": "caution",
   "note": "Urban tap water is often chlorinated but quality is inconsistent; bottled or boiled water is recommended."
  },
  "etiquette": [
   "Greet with a handshake and unhurried small talk; Malawi's 'warm heart' reputation rests on politeness.",
   "Use the right hand or both hands when giving and receiving, especially with elders.",
   "Dress modestly, particularly women in rural and Muslim lakeshore areas, covering knees and shoulders.",
   "Ask before photographing people and avoid government and military buildings."
  ],
  "transport": "Kamuzu International Airport is roughly 20 km from Lilongwe; pre-book a hotel transfer or use an airport taxi as there is no public link. Minibuses, shared taxis, and bicycle taxis serve towns; no ride-hailing apps operate.",
  "connectivity": "TNM and Airtel SIMs are cheap with registration and provide 4G in cities, though rural data is weak; eSIM is largely unavailable and power cuts affect connectivity.",
  "payments": "Cash in kwacha is standard, cards work at some Lilongwe and Blantyre hotels and supermarkets, and Airtel Money and TNM Mpamba mobile money are widely used."
 },
 "ML": {
  "iso2": "ML",
  "tapWater": {
   "status": "unsafe",
   "note": "Drink bottled or treated water only; tap supply is unsafe and intermittent."
  },
  "etiquette": [
   "Exchange extended greetings in French or Bambara before any request; brevity is considered cold.",
   "Use the right hand exclusively for eating, giving, and receiving.",
   "Avoid photographing military, government, and infrastructure sites, and ask permission before photographing people.",
   "Dress conservatively in this majority-Muslim country and be discreet during Ramadan."
  ],
  "transport": "Bamako-Senou International Airport is about 15 km from the city; arrange a hotel transfer or trusted driver, and note that much of the north remains under serious security advisories. Green shared taxis, sotrama minibuses, and motorbikes serve Bamako; no ride-hailing apps operate.",
  "connectivity": "Orange and Malitel SIMs are inexpensive with registration and give 4G in Bamako, but coverage thins quickly elsewhere; eSIM is generally unavailable.",
  "payments": "Mali is a cash economy using the West African CFA franc; cards are accepted only at top Bamako hotels, while Orange Money mobile payments are common."
 },
 "MR": {
  "iso2": "MR",
  "tapWater": {
   "status": "unsafe",
   "note": "Use bottled or treated water; tap water is unsafe and scarce in this desert nation."
  },
  "etiquette": [
   "Greet at length and accept the customary three rounds of mint tea when offered; declining outright is rude.",
   "Use the right hand for eating, giving, and receiving.",
   "Dress very conservatively in this strict Islamic republic; women should cover arms and legs, and alcohol is prohibited.",
   "Avoid photographing people without permission and never photograph military or government sites."
  ],
  "transport": "Nouakchott-Oumtounsy International Airport is about 25 km from the city; pre-arrange a hotel transfer or negotiate a taxi fare. Shared taxis and minibuses cover the capital; no ride-hailing apps operate.",
  "connectivity": "Mauritel, Chinguitel, and Mattel SIMs are available with registration and offer 4G in Nouakchott, but desert coverage is sparse; eSIM is generally unavailable.",
  "payments": "Mauritania is almost entirely cash-based in ouguiya; cards work only at a few upmarket hotels, and Bankily and other mobile-money apps are increasingly used."
 },
 "MU": {
  "iso2": "MU",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is treated and considered safe to drink, though some visitors prefer bottled for taste."
  },
  "etiquette": [
   "Greet politely; a handshake suits most settings, and English or French is widely understood.",
   "Dress modestly when visiting Hindu temples and mosques, removing shoes and covering shoulders and legs.",
   "Ask before photographing people, particularly during religious ceremonies.",
   "Respect beach and reef rules, and avoid removing coral or shells from protected lagoons."
  ],
  "transport": "Sir Seewoosagur Ramgoolam International Airport is about 48 km from Port Louis in the southeast; use the metered airport taxis, hotel transfers, or the express bus. Buses and metered taxis serve the island, the Metro Express tram links Port Louis to Curepipe, and there are no Uber or Bolt, though local app Yugo operates.",
  "connectivity": "Emtel, my.t, and MTML SIMs are easy to buy with registration and deliver strong 4G/5G islandwide; eSIM is supported and hotel and public wifi are widespread.",
  "payments": "Cards are widely accepted at hotels, restaurants, and shops, contactless and the MauCAS-based juice/MyT Money apps are popular, and cash in rupees is handy for markets and buses."
 },
 "MZ": {
  "iso2": "MZ",
  "tapWater": {
   "status": "unsafe",
   "note": "Drink bottled or treated water; tap water is not reliably safe even in Maputo."
  },
  "etiquette": [
   "Greet in Portuguese with handshakes and brief inquiries about wellbeing before business.",
   "Use the right hand for giving and receiving, and show deference to elders.",
   "Dress modestly on northern Muslim-majority coasts and ask before photographing people.",
   "Avoid photographing bridges, ports, airports, and government or military buildings."
  ],
  "transport": "Maputo International Airport is about 6 km from the centre; use the official airport taxi rank or a hotel transfer. Chapa minibuses and taxis dominate local transport; Bolt operates in Maputo while Uber does not.",
  "connectivity": "Vodacom, Tmcel, and Movitel SIMs are cheap with registration and provide 4G in cities, though coverage thins along the coast; eSIM is limited and wifi is common in hotels.",
  "payments": "Cash in metical is standard, cards work in Maputo hotels and supermarkets, and M-Pesa (Vodacom) and e-Mola mobile money are widely used."
 },
 "NA": {
  "iso2": "NA",
  "tapWater": {
   "status": "safe",
   "note": "Tap water in Windhoek and main towns is treated and safe; carry bottled water for remote desert travel."
  },
  "etiquette": [
   "Greet with a handshake and a little conversation; English is the official language and widely spoken.",
   "Ask permission before photographing Himba, San, or other people, and expect a small fee in some communities.",
   "Respect private game farms and conservancy boundaries, and do not approach wildlife on foot.",
   "Dress practically and modestly in rural areas, and do not litter in the fragile desert environment."
  ],
  "transport": "Hosea Kutako International Airport is about 45 km east of Windhoek; pre-book a shuttle or airport taxi as there is no public transport link. Self-drive is the dominant way to explore the country; combis and taxis serve towns, and no Uber or Bolt operate.",
  "connectivity": "MTC and TN Mobile SIMs are available with registration and give good 4G in towns and along main roads, with gaps in remote desert; eSIM support is limited and lodge wifi can be slow.",
  "payments": "Cards are widely accepted at lodges, fuel stations, and shops, contactless is common, and cash in Namibian dollars (South African rand also accepted) is useful in rural areas."
 },
 "NE": {
  "iso2": "NE",
  "tapWater": {
   "status": "unsafe",
   "note": "Use bottled or treated water; tap supply is unsafe and scarce across this arid country."
  },
  "etiquette": [
   "Exchange unhurried greetings in French or Hausa before any request; haste is impolite.",
   "Use the right hand exclusively for eating, giving, and receiving.",
   "Dress conservatively in this majority-Muslim country and be discreet during Ramadan daylight hours.",
   "Avoid photographing military, government, and infrastructure sites, and ask before photographing people."
  ],
  "transport": "Diori Hamani International Airport is about 12 km from Niamey; arrange a hotel transfer or negotiate a taxi fare, and heed serious security advisories beyond the capital. Shared taxis and motorbikes serve Niamey; no ride-hailing apps operate.",
  "connectivity": "Airtel, Moov, and Zamani SIMs are inexpensive with registration and offer 4G in Niamey, but coverage is sparse elsewhere; eSIM is generally unavailable.",
  "payments": "Niger is a cash economy using the West African CFA franc; cards are accepted only at a few top hotels, while Airtel Money and other mobile-money services are growing."
 },
 "NG": {
  "iso2": "NG",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not potable; drink sealed bottled water and avoid ice from unknown sources."
  },
  "etiquette": [
   "Greet elders and senior people first, and use the right hand for giving, receiving, and eating.",
   "Ask permission before photographing people, government buildings, airports, or military sites.",
   "Dress modestly, especially in the predominantly Muslim northern states where conservative norms apply.",
   "Avoid public displays of affection and discussing volatile political or religious topics with strangers."
  ],
  "transport": "Lagos and Abuja airports connect to the city by prearranged hotel cars or app-based rides; Bolt and Uber operate in Lagos, Abuja, and Port Harcourt, while shared danfo minibuses and motorcycle/tricycle (keke) taxis dominate local travel.",
  "connectivity": "Local SIMs from MTN, Airtel, or Glo are inexpensive but require NIN registration and passport; 4G is solid in cities and eSIM is supported on major carriers.",
  "payments": "Cards work in hotels and larger urban outlets but cash (naira) is essential elsewhere, and bank transfers plus apps like Opay and Paystack are widely used."
 },
 "RW": {
  "iso2": "RW",
  "tapWater": {
   "status": "caution",
   "note": "Treated municipal water in Kigali is generally cleaner than the region but bottled or filtered water is the safer choice."
  },
  "etiquette": [
   "Respect the monthly Umuganda community cleanup (last Saturday morning), when many businesses close and traffic is restricted.",
   "Do not bring plastic bags into the country, as single-use plastics are banned and confiscated at entry.",
   "Avoid discussing ethnicity or framing people as Hutu or Tutsi; the genocide is a sensitive subject best approached with care.",
   "Dress neatly and ask before photographing people, memorials, or officials."
  ],
  "transport": "Kigali International Airport is about 10 minutes from the center by taxi or app; Yego Cabs and Move operate ride-hailing, and clean moto-taxis (with helmets) plus coordinated buses handle most local trips.",
  "connectivity": "MTN and Airtel SIMs are cheap with passport registration, 4G coverage is strong in Kigali and good on main routes, and eSIM options exist.",
  "payments": "Cards are accepted in Kigali hotels and upscale venues, but cash (Rwandan franc) and the widely used MTN MoMo mobile money cover everyday transactions."
 },
 "ST": {
  "iso2": "ST",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water and untreated sources; rely on bottled or boiled water across both islands."
  },
  "etiquette": [
   "Greet people before starting any request or conversation, as courtesy is highly valued.",
   "Adopt the relaxed local pace (leve-leve) and avoid showing impatience over delays.",
   "Ask permission before photographing residents, particularly in fishing villages and rural areas.",
   "Dress modestly away from beaches and resorts, and cover up when visiting town centers or churches."
  ],
  "transport": "Sao Tome airport is a short taxi ride from the capital; there are no ride-hailing apps, so agree fares in advance with taxis, and shared minibuses (and hired drivers) are the practical way to explore the islands.",
  "connectivity": "CST and Unitel SIM cards are available with a passport; mobile data is functional in Sao Tome city but coverage and speeds drop sharply in rural areas, and eSIM is largely unavailable.",
  "payments": "This is a predominantly cash economy using the dobra; cards are accepted at only a handful of hotels, so carry sufficient cash and exchange on arrival."
 },
 "SN": {
  "iso2": "SN",
  "tapWater": {
   "status": "caution",
   "note": "Dakar tap water is chlorinated and often acceptable, but bottled water is advised outside the capital and for sensitive stomachs."
  },
  "etiquette": [
   "Greet at length and use the right hand for eating, giving, and receiving.",
   "Dress modestly, especially in this majority-Muslim country and when visiting mosques or rural areas.",
   "Ask before photographing people, and accept tea (ataya) if offered as a gesture of hospitality.",
   "Avoid eating or drinking publicly during daylight in Ramadan out of respect."
  ],
  "transport": "Diass (Blaise Diagne) airport is about an hour from Dakar via taxi or the toll road; Yango and Heetch operate ride-hailing in Dakar, while shared taxis, buses, and the new BRT/TER lines serve the capital.",
  "connectivity": "Orange, Free, and Expresso SIMs are cheap with passport registration; 4G is reliable in Dakar and main towns, and Orange supports eSIM.",
  "payments": "Cash (West African CFA franc) dominates; cards work in Dakar hotels and supermarkets, and Orange Money and Wave mobile wallets are extremely common."
 },
 "SC": {
  "iso2": "SC",
  "tapWater": {
   "status": "caution",
   "note": "Mahe tap water is generally treated and drinkable, but many travelers prefer bottled water, especially on smaller islands."
  },
  "etiquette": [
   "Respect strict environmental rules in marine parks and nature reserves; do not touch coral or remove shells, plants, or eggs.",
   "Cover up away from the beach when in shops, restaurants, or villages.",
   "Ask before photographing locals and greet people in French or Creole when possible.",
   "Avoid loud or disruptive behavior in the relaxed residential areas and on quiet islands."
  ],
  "transport": "Seychelles International Airport on Mahe is roughly 15 minutes from Victoria by taxi; there are no ride-hailing apps, so use metered taxis, the reliable bus network on Mahe and Praslin, or rent a car, with inter-island ferries and flights connecting the islands.",
  "connectivity": "Airtel and Cable & Wireless (Sure) SIMs are sold with a passport; 4G coverage is good on the main islands and most resorts offer wifi, though eSIM availability is limited.",
  "payments": "Cards are widely accepted at hotels, restaurants, and shops, but carry Seychellois rupees in cash for buses, markets, and small island vendors."
 },
 "SL": {
  "iso2": "SL",
  "tapWater": {
   "status": "unsafe",
   "note": "Do not drink tap water; use sealed bottled or boiled water and avoid ice and raw produce washed in tap water."
  },
  "etiquette": [
   "Greet warmly and use the right hand for eating, giving, and receiving.",
   "Always ask before photographing people, and never photograph government buildings, the airport, or military sites.",
   "Dress modestly, with extra care in Muslim communities and rural villages.",
   "Show respect to elders and community chiefs, and be patient with the slower pace of services."
  ],
  "transport": "Freetown's Lungi airport sits across an estuary, so arrival typically involves a Sea Coach or water-taxi transfer (plus road) into the city; no major ride-hailing apps operate, and shared taxis (poda-poda) and motorcycle okadas dominate local movement.",
  "connectivity": "Orange and Africell SIMs are cheap with passport registration; 4G works in Freetown and larger towns but is patchy elsewhere, and eSIM support is minimal.",
  "payments": "Sierra Leone runs largely on cash (leone); cards are accepted at only a few Freetown hotels, while Orange Money and Africa Money mobile wallets are widely used."
 },
 "SO": {
  "iso2": "SO",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is unsafe; rely strictly on sealed bottled water and avoid ice and uncooked foods."
  },
  "etiquette": [
   "Dress very conservatively; women should cover hair, arms, and legs, and men should avoid shorts in public.",
   "Use only the right hand for eating and greetings, and avoid public physical contact between unrelated men and women.",
   "Never photograph people, checkpoints, ports, airports, or security forces without explicit permission.",
   "Respect Islamic norms and Ramadan fasting, and avoid alcohol, which is prohibited."
  ],
  "transport": "Movement is heavily security-dependent; in Mogadishu, prearranged armored or trusted private transfers from Aden Adde airport are standard, there are no ride-hailing apps, and most independent road travel carries significant risk.",
  "connectivity": "Hormuud and Somtel SIMs are cheap and widely sold; mobile data and 4G are surprisingly good in cities, though eSIM availability is limited.",
  "payments": "Mobile money (notably Hormuud's EVC Plus) is dominant and often preferred over cash, US dollars are widely accepted, and card acceptance is very limited."
 },
 "ZA": {
  "iso2": "ZA",
  "tapWater": {
   "status": "caution",
   "note": "Tap water in major cities like Cape Town and Johannesburg is generally safe, but quality varies in some rural and smaller-town supplies."
  },
  "etiquette": [
   "Be aware of personal safety; avoid displaying valuables and do not walk alone in unfamiliar areas after dark.",
   "Greet people courteously and respect the country's many languages and cultures.",
   "Ask before photographing people, particularly in townships and informal settlements.",
   "Do not discuss race or apartheid dismissively; approach the topic with sensitivity."
  ],
  "transport": "Major airports link to cities via the Gautrain (Johannesburg/Pretoria), MyCiTi buses (Cape Town), and metered taxis; Uber and Bolt operate widely in cities, while intercity travel relies on buses, domestic flights, and rental cars.",
  "connectivity": "Vodacom, MTN, and Cell C SIMs require passport and proof of address (RICA); 4G/5G is strong in urban areas and eSIM is supported by major carriers.",
  "payments": "Cards (including contactless and tap-to-pay) are accepted almost everywhere; carry some rand cash for markets and informal vendors, and SnapScan/Zapper QR payments are common."
 },
 "SS": {
  "iso2": "SS",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is unsafe; use sealed bottled or properly treated water and avoid ice."
  },
  "etiquette": [
   "Never photograph bridges, government buildings, the airport, military, or police; a photography permit is often required.",
   "Dress modestly and behave conservatively, respecting local customs and authority.",
   "Carry identification and copies of permits, and be prepared for frequent checkpoints.",
   "Greet people respectfully and avoid discussing politics, ethnicity, or the conflict."
  ],
  "transport": "In Juba, arrange transfers from the airport through your hotel or a trusted driver; there are no ride-hailing apps, public transport is minimal and informal, and most travel for visitors is by private vehicle.",
  "connectivity": "MTN and Zain SIMs are available with passport registration; mobile data and 4G work in Juba but coverage is limited elsewhere, and eSIM is generally unavailable.",
  "payments": "This is overwhelmingly a cash economy using the South Sudanese pound, with US dollars useful for larger payments; card acceptance is almost nonexistent."
 },
 "SD": {
  "iso2": "SD",
  "tapWater": {
   "status": "unsafe",
   "note": "Do not drink tap water; rely on sealed bottled or boiled water and avoid ice."
  },
  "etiquette": [
   "Dress conservatively in this majority-Muslim country, and avoid alcohol, which is prohibited.",
   "Use the right hand for eating and greetings, and avoid public contact between unrelated men and women.",
   "Never photograph military, government, bridges, or sensitive sites; a photo permit may be needed.",
   "Respect Ramadan by not eating or drinking in public during daylight."
  ],
  "transport": "Travel conditions are heavily affected by ongoing conflict; where movement is possible, prearranged private drivers handle airport transfers, there are no ride-hailing apps, and shared minibuses and taxis serve local routes.",
  "connectivity": "Zain, MTN, and Sudani SIMs exist but network reliability has been severely disrupted by conflict; coverage is unpredictable and eSIM is not a practical option.",
  "payments": "Sudan operates on cash (Sudanese pound) with international cards effectively unusable due to sanctions and banking disruption; bring sufficient cash and expect mobile-money apps where networks allow."
 },
 "TZ": {
  "iso2": "TZ",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water; use sealed bottled water and skip ice from uncertain sources."
  },
  "etiquette": [
   "Dress modestly, especially in Zanzibar and other Muslim areas, where covering shoulders and knees is expected away from beaches.",
   "Greet with a friendly 'Jambo' or 'Habari' and use the right hand for giving and receiving.",
   "Ask permission before photographing people, particularly Maasai communities, who may expect a fee.",
   "Respect Ramadan in Zanzibar by being discreet with eating, drinking, and dress during daylight."
  ],
  "transport": "Dar es Salaam, Kilimanjaro, and Zanzibar airports connect to towns via taxis and hotel transfers; Bolt and Uber operate in Dar es Salaam, while dala-dala minibuses, bajaji tuk-tuks, and the Dar BRT handle local travel.",
  "connectivity": "Vodacom, Airtel, and Halotel SIMs are cheap with passport registration; 4G is good in cities and tourist hubs, and eSIM is supported by some carriers.",
  "payments": "Cash (Tanzanian shilling, with US dollars accepted for parks and lodges) is widely needed; cards work in upscale venues, and M-Pesa, Airtel Money, and Tigo Pesa mobile wallets are ubiquitous."
 },
 "TG": {
  "iso2": "TG",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not safe to drink; use sealed bottled or treated water and avoid ice."
  },
  "etiquette": [
   "Greet people before any interaction and use the right hand for eating, giving, and receiving.",
   "Ask permission before photographing people, markets, military, or official buildings.",
   "Dress modestly, particularly in the more Muslim north and when visiting villages.",
   "Show respect to elders and traditional chiefs, and be patient with the unhurried pace."
  ],
  "transport": "Lome airport is a short taxi ride from the center; there are no major ride-hailing apps, so shared taxis and the ubiquitous zemidjan motorcycle taxis are the dominant way to get around.",
  "connectivity": "Togocom (Yas) and Moov SIMs are inexpensive with passport registration; 4G works in Lome and larger towns but weakens in rural areas, and eSIM support is limited.",
  "payments": "Cash (West African CFA franc) is essential almost everywhere; cards are accepted only at a few Lome hotels, while T-Money and Flooz mobile money are widely used."
 },
 "UG": {
  "iso2": "UG",
  "tapWater": {
   "status": "unsafe",
   "note": "Do not drink tap water; rely on sealed bottled or boiled water and avoid ice from unknown sources."
  },
  "etiquette": [
   "Greet people warmly and take time for pleasantries before getting to business.",
   "Dress modestly outside Kampala, and cover shoulders and knees when visiting villages or places of worship.",
   "Ask before photographing people, and avoid photographing military, police, or government installations.",
   "Be discreet about LGBTQ matters, as same-sex relationships are criminalized and the topic is highly sensitive."
  ],
  "transport": "Entebbe airport is about 40 km from Kampala via taxi or shuttle; Uber and Bolt operate in Kampala (including the SafeBoda motorcycle app), while shared matatu minibuses and boda-boda motorcycles dominate local travel.",
  "connectivity": "MTN and Airtel SIMs are cheap but require NIN or passport registration; 4G is good in Kampala and main towns, and eSIM is available on major carriers.",
  "payments": "Cash (Ugandan shilling) is needed for most everyday purchases; cards work in Kampala hotels and supermarkets, and MTN MoMo and Airtel Money mobile wallets are very widely used."
 },
 "ZM": {
  "iso2": "ZM",
  "tapWater": {
   "status": "caution",
   "note": "Lusaka tap water is treated and often acceptable, but bottled or filtered water is safer, especially outside major cities."
  },
  "etiquette": [
   "Greet with a handshake and take time for polite small talk before business.",
   "Use the right hand or both hands when giving and receiving items.",
   "Ask before photographing people, and avoid photographing military, the airport, or government buildings.",
   "Dress neatly and modestly in towns and villages, and show respect to elders and chiefs."
  ],
  "transport": "Lusaka's Kenneth Kaunda airport is about 25 km from the city via taxi or hotel transfer; Yango ride-hailing operates in Lusaka, while shared minibuses and taxis handle local travel and long-distance coaches link major towns.",
  "connectivity": "MTN, Airtel, and Zamtel SIMs are cheap with passport registration; 4G is reliable in cities and along main routes, and eSIM availability is limited.",
  "payments": "Cash (Zambian kwacha) is widely used; cards work in Lusaka and Livingstone hotels and supermarkets, and Airtel Money and MTN MoMo mobile wallets are very common."
 },
 "ZW": {
  "iso2": "ZW",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water due to aging infrastructure and contamination risk; use sealed bottled or boiled water."
  },
  "etiquette": [
   "Greet with a handshake and exchange pleasantries before getting down to business.",
   "Never photograph government buildings, the president's residence, military, police, or checkpoints.",
   "Use both hands or the right hand when giving and receiving, and show respect to elders.",
   "Avoid criticizing the government or discussing politics openly with strangers."
  ],
  "transport": "Harare and Victoria Falls airports connect to towns via taxis and hotel transfers; there are no major ride-hailing apps operating reliably, so use trusted taxis, while shared kombi minibuses serve local routes.",
  "connectivity": "Econet, NetOne, and Telecel SIMs are available with passport registration; Econet's 4G is the most reliable in cities, coverage thins in rural areas, and eSIM support is limited.",
  "payments": "Payments are complex: US dollars in cash are widely used alongside the local ZiG currency, card acceptance is inconsistent, and EcoCash mobile money is essential for many transactions."
 },
 "AF": {
  "iso2": "AF",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is unsafe; rely on sealed bottled water and avoid ice from unknown sources."
  },
  "etiquette": [
   "Dress very conservatively; women should cover hair, arms and legs, and men should avoid shorts in public.",
   "Always ask permission before photographing people, especially women, and avoid photographing officials or checkpoints.",
   "Use only the right hand for eating, giving and receiving items.",
   "Avoid public displays of affection and respect prayer times when shops and offices may close."
  ],
  "transport": "Kabul airport transfers are typically by pre-arranged car or taxi rather than apps; intercity travel is by shared taxi or bus, and no ride-hailing apps such as Uber operate.",
  "connectivity": "Local SIM cards (Roshan, Etisalat, MTN/AWCC) are available but coverage and speeds are inconsistent outside major cities, and eSIM support is minimal.",
  "payments": "Afghanistan is almost entirely cash-based in afghanis; cards are rarely accepted and ATMs are scarce and unreliable."
 },
 "BD": {
  "iso2": "BD",
  "tapWater": {
   "status": "unsafe",
   "note": "Do not drink tap water; use bottled or properly boiled and filtered water."
  },
  "etiquette": [
   "Dress modestly, covering shoulders and knees, particularly at mosques and rural areas.",
   "Eat and pass items with the right hand, as the left is considered unclean.",
   "Remove shoes before entering homes and places of worship.",
   "Ask before photographing people and avoid photographing military or government buildings."
  ],
  "transport": "From Dhaka's Hazrat Shahjalal airport use prepaid taxis or ride-hailing; within cities CNG auto-rickshaws, rickshaws and buses dominate, and Uber and Pathao (including bike rides) operate in Dhaka and Chittagong.",
  "connectivity": "Cheap local SIMs (Grameenphone, Robi, Banglalink) require passport registration; 4G is widespread in cities though speeds vary, and eSIM availability is limited.",
  "payments": "Cash in taka is essential for most transactions; cards work in upscale hotels and malls, and mobile wallets such as bKash and Nagad are very widely used."
 },
 "BT": {
  "iso2": "BT",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is often untreated; stick to bottled or boiled water to be safe."
  },
  "etiquette": [
   "Wear long trousers and covered shoulders when visiting dzongs and temples, and remove hats and shoes inside.",
   "Walk clockwise around stupas, prayer wheels and chortens.",
   "Do not point at or touch religious objects, statues or monks, and never sit with feet pointing at altars.",
   "Smoking in public is heavily restricted, and tobacco import is tightly regulated."
  ],
  "transport": "Most visitors arrive via Paro airport and travel with a licensed guide and private vehicle as part of the tariff system; public buses and shared taxis exist but no ride-hailing apps operate.",
  "connectivity": "Local SIMs (B-Mobile, TashiCell) are easy to buy with a passport; 4G covers towns and main routes but mountainous areas have gaps, and wifi is generally slow.",
  "payments": "Carry cash in ngultrum (Indian rupees are widely accepted except 2000-rupee notes); card acceptance is limited mainly to hotels in Thimphu and Paro."
 },
 "IN": {
  "iso2": "IN",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water; choose sealed bottled water and skip ice in informal eateries."
  },
  "etiquette": [
   "Remove shoes before entering temples, homes and many shops, and cover your head where required.",
   "Use your right hand for eating and exchanging money or gifts.",
   "Dress modestly at religious sites, covering shoulders and knees.",
   "Ask before photographing people and avoid photographing military sites and some temple interiors."
  ],
  "transport": "Major airports have prepaid taxi counters and metered options; Uber and Ola operate widely in cities alongside auto-rickshaws, metros and trains, with intercity travel often by rail.",
  "connectivity": "Local SIMs (Jio, Airtel) are inexpensive with strong, cheap 4G/5G coverage in cities but require passport and photo; eSIMs are available from major carriers.",
  "payments": "Cards are accepted in cities and the UPI mobile-payment system (Google Pay, PhonePe, Paytm) is ubiquitous, but carry cash in rupees for small vendors and rural areas."
 },
 "KZ": {
  "iso2": "KZ",
  "tapWater": {
   "status": "caution",
   "note": "Tap water quality varies by region; many travelers prefer bottled or filtered water."
  },
  "etiquette": [
   "Remove shoes when entering homes and accept tea hospitality graciously.",
   "Dress respectfully at mosques, with women covering their hair.",
   "Use both hands or the right hand when giving or receiving items as a sign of respect.",
   "Greet elders first and avoid loud or aggressive behavior in public."
  ],
  "transport": "Almaty and Astana airports connect to the city by official taxi, app or bus; Yandex Go is the dominant ride-hailing app, and cities have buses, metro (Almaty) and marshrutka minibuses.",
  "connectivity": "Local SIMs (Beeline, Kcell, Tele2) are cheap and easy with a passport; 4G is solid in cities, and eSIM options are growing.",
  "payments": "Card payments and Kaspi (the dominant mobile-payment and QR app) are accepted almost everywhere in cities; carry tenge cash for rural areas and markets."
 },
 "KG": {
  "iso2": "KG",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is risky outside major cities; bottled or boiled water is recommended."
  },
  "etiquette": [
   "Remove shoes before entering homes and yurts.",
   "Dress modestly at mosques and in conservative rural regions.",
   "Accept offered food and tea, and use the right hand when giving or receiving.",
   "Ask before photographing people, especially in traditional communities."
  ],
  "transport": "Manas airport in Bishkek connects to the city by taxi or app; Yandex Go and inDrive operate in cities, while shared taxis and marshrutka minibuses dominate intercity travel.",
  "connectivity": "Local SIMs (Beeline, O!, MegaCom) are very cheap with a passport; 4G is good in cities but patchy in mountain areas, and eSIM support is limited.",
  "payments": "Cash in som is needed for most transactions and rural areas; cards and the Elcart/MBank apps work in Bishkek hotels, supermarkets and restaurants."
 },
 "MV": {
  "iso2": "MV",
  "tapWater": {
   "status": "caution",
   "note": "Resort water is usually desalinated and safe, but bottled water is advised on local islands."
  },
  "etiquette": [
   "On inhabited local islands dress modestly, covering shoulders and knees, as this is a Muslim country.",
   "Alcohol is permitted only on resort islands and liveaboards, not on local islands.",
   "Bikinis are fine on resort beaches but use designated bikini beaches on local islands.",
   "Do not touch or remove coral, and respect marine-protected areas."
  ],
  "transport": "From Velana International Airport, transfers are by speedboat, ferry or seaplane to resorts and islands; there are no ride-hailing apps, and Male itself is compact and walkable.",
  "connectivity": "Local SIMs (Dhiraagu, Ooredoo) and tourist data packs are sold at the airport; 4G coverage is good across inhabited atolls, and eSIMs are available.",
  "payments": "US dollars and cards are widely accepted at resorts; carry rufiyaa cash for local islands, small shops and ferries."
 },
 "NP": {
  "iso2": "NP",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is unsafe; drink bottled, boiled or filtered water and avoid ice."
  },
  "etiquette": [
   "Walk clockwise around stupas and prayer wheels, and remove shoes before entering temples.",
   "Ask before photographing people and never touch anyone, including children, on the head.",
   "Dress modestly at religious sites, covering shoulders and legs.",
   "Use the right hand for eating and giving, and avoid stepping over people or food."
  ],
  "transport": "Kathmandu's Tribhuvan airport connects to the city by prepaid taxi or hotel pickup; Pathao and InDrive (including bikes) operate in Kathmandu, while taxis, local buses and tourist coaches handle the rest.",
  "connectivity": "Local SIMs (Ncell, Nepal Telecom) are cheap with a passport and photo; 4G works in cities and many trekking regions, though mountain coverage and wifi can be slow.",
  "payments": "Cash in rupees dominates outside cities; cards work in tourist hotels and shops, and mobile wallets such as eSewa and Khalti are widely used by locals."
 },
 "PK": {
  "iso2": "PK",
  "tapWater": {
   "status": "unsafe",
   "note": "Do not drink tap water; use sealed bottled or boiled water."
  },
  "etiquette": [
   "Dress conservatively; women should cover shoulders, arms and legs, and many carry a scarf for mosques.",
   "Use the right hand for eating and giving or receiving items.",
   "Ask before photographing people, especially women, and avoid military and sensitive sites.",
   "Respect prayer times and avoid eating or drinking publicly during daylight in Ramadan."
  ],
  "transport": "Major airports (Karachi, Lahore, Islamabad) have official taxis and app options; Careem, Bykea (bikes) and inDrive operate in cities, alongside rickshaws and intercity buses such as Daewoo.",
  "connectivity": "Local SIMs (Jazz, Zong, Telenor) are cheap with passport and biometric registration; 4G is good in cities, and eSIM availability is limited.",
  "payments": "Pakistan is largely cash-based in rupees; cards work in upscale urban venues, and mobile wallets like Easypaisa and JazzCash are widely used."
 },
 "LK": {
  "iso2": "LK",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is unreliable for visitors; bottled or boiled water is recommended."
  },
  "etiquette": [
   "Dress modestly at temples, covering shoulders and knees, and remove shoes and hats before entering.",
   "Never pose for photos with your back to a Buddha statue, and avoid Buddha tattoos which can cause legal trouble.",
   "Use the right hand for eating and giving or receiving.",
   "Ask before photographing people and monks."
  ],
  "transport": "From Bandaranaike (Colombo) airport use metered taxis or apps; PickMe (local) and Uber operate in Colombo and major towns, while tuk-tuks, buses and scenic trains dominate elsewhere.",
  "connectivity": "Local SIMs (Dialog, Mobitel) with tourist data packs are sold at the airport; 4G coverage is good across the island, and eSIMs are available.",
  "payments": "Cash in rupees is needed for tuk-tuks, markets and small shops; cards are accepted in hotels and city restaurants, and mobile payments are growing."
 },
 "TJ": {
  "iso2": "TJ",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is unsafe; drink bottled or boiled water, especially outside Dushanbe."
  },
  "etiquette": [
   "Dress modestly, particularly women at mosques and in rural areas.",
   "Remove shoes before entering homes and accept tea and bread hospitality.",
   "Use the right hand for giving and receiving, and treat bread (non) with respect.",
   "Ask before photographing people and avoid photographing border zones and military sites."
  ],
  "transport": "Dushanbe airport connects to the city by taxi; inDrive and Yandex Go operate in Dushanbe, while shared taxis and marshrutka minibuses dominate intercity and mountain travel.",
  "connectivity": "Local SIMs (Tcell, Megafon Tajikistan, Babilon) are cheap with a passport; 4G is decent in cities but weak in the Pamirs, and eSIM support is minimal.",
  "payments": "Tajikistan is heavily cash-based in somoni; cards work at some Dushanbe hotels and supermarkets, but ATMs can be unreliable, so carry cash."
 },
 "TM": {
  "iso2": "TM",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water; rely on sealed bottled water."
  },
  "etiquette": [
   "Dress modestly and behave conservatively, especially around government buildings.",
   "Do not photograph the presidential palace, military, police or government sites, which is strictly enforced.",
   "Remove shoes before entering homes and accept hospitality graciously.",
   "Use the right hand for giving and receiving, and respect local customs around elders."
  ],
  "transport": "Ashgabat airport connects to the city by official taxi (negotiate or use the standard rate); there are no international ride-hailing apps, and most travel is by arranged car, taxi or marshrutka.",
  "connectivity": "Local SIMs (Altyn Asyr/TM Cell) are available but heavily controlled, internet is among the most restricted and slow worldwide, and many sites and VPNs are blocked.",
  "payments": "Turkmenistan is overwhelmingly cash-based in manat; cards rarely work for foreigners, ATMs are limited, and a parallel exchange rate exists, so bring sufficient US dollars cash."
 },
 "UZ": {
  "iso2": "UZ",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not recommended for drinking; use bottled or boiled water."
  },
  "etiquette": [
   "Dress modestly at mosques and mausoleums, with women covering hair where requested.",
   "Remove shoes before entering homes and many shrines.",
   "Accept tea and bread hospitality, and treat bread (non) respectfully by never placing it upside down.",
   "Ask before photographing people and avoid photographing metro security and military sites."
  ],
  "transport": "Tashkent airport connects to the city by taxi or app; Yandex Go is the dominant ride-hailing app, and cities have a metro (Tashkent), buses and shared taxis, with fast trains (Afrosiyob) between major cities.",
  "connectivity": "Local SIMs (Beeline, Ucell, Uzmobile) are cheap with passport registration; 4G is good in cities, and eSIM availability is growing.",
  "payments": "Cards (especially local UzCard/Humo) and cash in som are both common; foreign Visa/Mastercard work in cities but carry cash for bazaars and rural areas."
 },
 "BN": {
  "iso2": "BN",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is generally treated but many visitors prefer bottled water to be safe."
  },
  "etiquette": [
   "Dress modestly, covering shoulders and knees, as this is a conservative Muslim sultanate.",
   "Do not eat, drink or smoke in public during daylight hours in Ramadan; alcohol sale is banned.",
   "Use the right hand for eating and giving, and use the thumb rather than a pointing finger to indicate things.",
   "Remove shoes before entering homes and mosques, and dress code is enforced at mosques."
  ],
  "transport": "Brunei airport connects to Bandar Seri Begawan by taxi or arranged car; there is no widespread ride-hailing (the local Dart app has limited use), public transport is sparse, and renting a car is common.",
  "connectivity": "Local SIMs (DST, imagine, Progresif) are easy to buy with a passport; 4G coverage is strong nationwide, and eSIM options exist.",
  "payments": "Cards are widely accepted in Bandar Seri Begawan and Singapore dollars are interchangeable with Brunei dollars; carry cash for water taxis and small vendors."
 },
 "KH": {
  "iso2": "KH",
  "tapWater": {
   "status": "unsafe",
   "note": "Do not drink tap water; use bottled or boiled water and avoid unfiltered ice."
  },
  "etiquette": [
   "Dress modestly at temples such as Angkor, covering shoulders and knees, and remove shoes and hats inside.",
   "Greet with the sampeah (palms together) and avoid touching anyone's head.",
   "Do not point feet at people or Buddha images, and never touch monks if you are a woman.",
   "Ask before photographing people and respect signs banning photos in temples."
  ],
  "transport": "Airports at Phnom Penh and Siem Reap connect to the city by taxi, tuk-tuk or app; Grab and PassApp operate widely, and tuk-tuks remain the dominant short-distance transport.",
  "connectivity": "Local SIMs (Cellcard, Smart, Metfone) are very cheap with a passport; 4G is widespread and fast in cities and tourist areas, and eSIMs are available.",
  "payments": "US dollars are used alongside riel for everyday transactions; cards work in hotels and city venues, and mobile payments (ABA, Wing) are increasingly common."
 },
 "CN": {
  "iso2": "CN",
  "tapWater": {
   "status": "unsafe",
   "note": "Do not drink from the tap; boiled water is standard everywhere and bottled water is cheap and ubiquitous."
  },
  "etiquette": [
   "Present and receive business cards or gifts with both hands.",
   "Avoid public discussion of Taiwan, Tibet, Hong Kong politics, or Tiananmen.",
   "Do not stick chopsticks upright in rice, as it evokes funeral rites.",
   "Carry your passport, as it is required for trains, hotels, and SIM purchases."
  ],
  "transport": "Major airports connect to city centers via metro, airport express trains, and licensed taxis; within cities, extensive metro systems and the DiDi ride-hailing app (which has an English-capable international version) dominate. Uber does not operate independently here.",
  "connectivity": "Local SIMs require passport registration; many foreign eSIMs and roaming plans route around the Great Firewall, so a VPN is essential for Google, WhatsApp, and Instagram.",
  "payments": "Mobile payment via Alipay and WeChat Pay is near-universal, and both now link to foreign cards; carry some cash as a backup since physical card acceptance is limited."
 },
 "TL": {
  "iso2": "TL",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not potable; rely on bottled or boiled-and-filtered water throughout the country."
  },
  "etiquette": [
   "Dress modestly, particularly when visiting churches in this predominantly Catholic nation.",
   "Use your right hand for eating, giving, and receiving.",
   "Ask permission before photographing people or sacred uma lulik (sacred houses).",
   "Learn a few words of Tetum, which is warmly received."
  ],
  "transport": "Dili airport sits close to the city, served by hotel transfers and taxis with negotiated fares; intercity travel relies on shared mikrolet minibuses and bemos, while rented vehicles or drivers are common for reaching remote areas. No major ride-hailing apps operate.",
  "connectivity": "Local SIMs from Telkomcel or Telemor are inexpensive at the airport or in Dili; coverage is reliable in towns but weak to absent in rural and mountainous regions.",
  "payments": "Cash in US dollars is essential as the economy is overwhelmingly cash-based; card acceptance is limited to a few Dili hotels and ATMs are scarce outside the capital."
 },
 "ID": {
  "iso2": "ID",
  "tapWater": {
   "status": "unsafe",
   "note": "Avoid tap water; drink sealed bottled water, which is widely available and inexpensive."
  },
  "etiquette": [
   "Use your right hand for eating and passing items, as the left is considered unclean.",
   "Dress modestly at temples and mosques, covering shoulders and knees; sarongs are often provided.",
   "Avoid touching anyone's head, including children.",
   "Remove shoes before entering homes and places of worship."
  ],
  "transport": "Airports such as Jakarta and Bali connect to cities via airport trains, DAMRI buses, and taxis; the Grab and Gojek super-apps dominate ride-hailing for both cars and motorbikes and are the easiest way to get around. Bluebird is the trusted metered taxi brand.",
  "connectivity": "Telkomsel offers the broadest coverage; local SIMs and eSIMs are easy to obtain and 4G is strong in cities and tourist areas, though patchy on remote islands.",
  "payments": "Cash remains important for markets, warungs, and rural areas, while cards and QRIS-based mobile payments such as GoPay and OVO are widely accepted in cities and tourist zones."
 },
 "JP": {
  "iso2": "JP",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is safe and high quality throughout the country."
  },
  "etiquette": [
   "Do not eat or drink while walking, and keep phone conversations off public transit.",
   "Remove your shoes when entering homes, ryokan, and some restaurants and temples.",
   "Queue in marked lines and avoid speaking loudly in trains and public spaces.",
   "Do not tip; it can cause confusion or offense."
  ],
  "transport": "Airports like Narita, Haneda, and Kansai link to city centers via efficient trains and limousine buses; within cities the rail and metro networks are dominant and exceptionally punctual. Uber exists mainly as a taxi-dispatch service and is not widespread; GO is the leading domestic taxi app.",
  "connectivity": "Tourist eSIMs and prepaid data SIMs are excellent and easy to buy at airports and convenience stores; mobile coverage and pocket-wifi rental are both reliable nationwide.",
  "payments": "Cards and IC transit cards such as Suica are widely accepted, and mobile payment is growing, but cash remains essential for small restaurants, shrines, and rural areas."
 },
 "LA": {
  "iso2": "LA",
  "tapWater": {
   "status": "unsafe",
   "note": "Do not drink tap water; bottled and filtered water is standard and widely sold."
  },
  "etiquette": [
   "Return the nop (palms-together bow) greeting rather than shaking hands.",
   "Dress modestly at temples, covering shoulders and knees, and remove shoes before entering.",
   "Do not touch anyone's head or point your feet at people or Buddha images.",
   "Avoid public displays of anger, as composure is highly valued."
  ],
  "transport": "Airports in Vientiane and Luang Prabang are close to town and served by taxis and tuk-tuks with negotiated fares; songthaews, tuk-tuks, and the new China-Laos high-speed railway are the main ways to travel. The Loca app offers limited local ride-hailing in Vientiane.",
  "connectivity": "Local SIMs from Unitel or Lao Telecom are cheap and available at the airport; 4G is decent in cities but slow and intermittent in mountainous rural areas.",
  "payments": "Cash, in both kip and US dollars or Thai baht in border areas, is essential; card acceptance is limited to larger hotels, and ATMs have low withdrawal limits."
 },
 "MY": {
  "iso2": "MY",
  "tapWater": {
   "status": "caution",
   "note": "Water is treated but boil it or drink bottled water, which most locals do as well."
  },
  "etiquette": [
   "Use your right hand for eating and handing over items.",
   "Dress modestly and remove shoes before entering mosques and homes; women may need a headscarf at mosques.",
   "Avoid offering pork or alcohol to Muslim hosts and refrain from eating publicly during Ramadan daylight.",
   "Do not point with your index finger; use your thumb instead."
  ],
  "transport": "Kuala Lumpur International connects to the city via the fast KLIA Ekspres train and buses; cities have light rail, monorail, and the dominant Grab ride-hailing app, which replaced Uber in 2018. Metered taxis exist but Grab is preferred.",
  "connectivity": "Local SIMs from Maxis, Celcom, or Digi and tourist eSIMs are cheap and easy to buy at the airport; 4G and 5G coverage is strong in urban areas.",
  "payments": "Cards are widely accepted in cities and e-wallets such as Touch 'n Go and GrabPay are popular, though cash remains useful for hawker stalls and smaller towns."
 },
 "MM": {
  "iso2": "MM",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is unsafe; drink only sealed bottled or boiled water."
  },
  "etiquette": [
   "Dress modestly and remove shoes and socks before entering pagodas and temple grounds.",
   "Do not touch anyone's head or point your feet toward people or Buddha images.",
   "Avoid political discussion, and be aware that the situation remains volatile and travel advisories are in force.",
   "Hand items with your right hand, supporting it with the left."
  ],
  "transport": "Yangon and Mandalay airports connect to the cities by taxi with fixed or negotiated fares; within cities taxis and the Grab app are the main options, while intercity travel uses long-distance buses. Note that infrastructure and routes are affected by ongoing instability.",
  "connectivity": "Local SIMs from MPT, Ooredoo, or Telenor are cheap, but connectivity is unreliable due to recurring government-imposed internet shutdowns and restrictions in many regions.",
  "payments": "Cash in kyat is essential and pristine US dollar notes are useful; card and ATM infrastructure is limited and unreliable, and international banking access is restricted."
 },
 "MN": {
  "iso2": "MN",
  "tapWater": {
   "status": "caution",
   "note": "Ulaanbaatar tap water is treated but most travelers drink bottled water, and rural sources should be avoided."
  },
  "etiquette": [
   "Accept offered food or drink with your right hand, supported by the left.",
   "Do not step on a ger's threshold or point your feet at the stove or altar inside.",
   "If you bump someone's foot, immediately shake their hand as an apology.",
   "Receive and hold cups or items with an open palm facing up."
  ],
  "transport": "Chinggis Khaan International Airport is roughly an hour from Ulaanbaatar, reached by taxi or hotel transfer; within the capital, buses and informal taxis operate, while reaching the countryside typically requires hired 4x4 vehicles with drivers. The UBCab app offers local ride-hailing.",
  "connectivity": "Local SIMs from Mobicom or Unitel are inexpensive; 4G is good in Ulaanbaatar but coverage thins dramatically across the steppe and Gobi.",
  "payments": "Cards are widely accepted in Ulaanbaatar and contactless payment is common, but carry cash in tögrög for the countryside where electronic payment is unavailable."
 },
 "KP": {
  "iso2": "KP",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is unsafe; bottled water supplied by your tour is the only advisable option."
  },
  "etiquette": [
   "Independent travel is prohibited; you must travel on a state-approved guided tour at all times.",
   "Always bow at and never crop, fold, or deface images of the leaders or their statues.",
   "Photograph only what guides permit and never military, construction, or unposed civilians.",
   "Do not bring religious or political materials, and follow guides' instructions precisely."
  ],
  "transport": "Foreign visitors arrive via Pyongyang airport or the train from China and are transported exclusively by assigned tour vehicles with guides; independent use of local transport is not permitted. No ride-hailing or self-directed travel exists.",
  "connectivity": "Foreign mobile SIMs and internet access are heavily restricted and segregated from locals; assume no usable independent connectivity and no access to the global internet.",
  "payments": "Tourists pay in foreign cash, typically euros, US dollars, or Chinese yuan; cards do not work and the local won is not available to visitors."
 },
 "KR": {
  "iso2": "KR",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is officially safe to drink, though many locals prefer filtered or bottled water by habit."
  },
  "etiquette": [
   "Pour drinks for others rather than yourself, and use both hands when serving or receiving from elders.",
   "Remove shoes before entering homes and many traditional restaurants.",
   "Do not stick chopsticks upright in rice, and wait for elders to begin eating.",
   "Avoid writing names in red ink, which is associated with death."
  ],
  "transport": "Incheon and Gimpo airports link to Seoul via the AREX train, limousine buses, and taxis; cities have excellent subway networks, and Kakao T is the dominant taxi-hailing app. Uber operates only in a limited taxi-partnership form.",
  "connectivity": "Tourist SIMs and eSIMs are easy to buy at airports, and mobile coverage and public wifi are among the fastest and most pervasive in the world.",
  "payments": "Cards and contactless are accepted virtually everywhere, and mobile payment via Naver Pay, Kakao Pay, and Samsung Pay is widespread, with cash rarely needed."
 },
 "PH": {
  "iso2": "PH",
  "tapWater": {
   "status": "caution",
   "note": "Manila tap water is generally treated but most travelers drink bottled water, which is essential in provinces and islands."
  },
  "etiquette": [
   "Use 'po' and 'opo' or a respectful tone with elders, and greet with a friendly smile.",
   "Accept food or drink when offered, as hospitality is taken seriously.",
   "Dress modestly when visiting churches in this largely Catholic country.",
   "Avoid loud confrontation; preserving social harmony and saving face is valued."
  ],
  "transport": "Manila's NAIA connects to the city by taxi and the Grab app, though traffic is severe; jeepneys, tricycles, and the Grab app dominate local transport, while inter-island travel relies on flights and ferries. Uber exited in favor of Grab.",
  "connectivity": "Local SIMs from Globe or Smart and tourist eSIMs are cheap and easy to buy; 4G is widespread in cities but slower and patchy on remote islands.",
  "payments": "Cash in pesos is essential, especially outside cities, while cards and the GCash and Maya mobile wallets are increasingly accepted in urban and tourist areas."
 },
 "SG": {
  "iso2": "SG",
  "tapWater": {
   "status": "safe",
   "note": "Tap water meets WHO standards and is safe to drink directly."
  },
  "etiquette": [
   "Do not eat, drink, or chew gum on the MRT; fines are strictly enforced.",
   "Reserving a hawker-center seat by placing a packet of tissues, known as 'choping,' is the local custom.",
   "Dispose of litter properly and do not jaywalk, as both carry fines.",
   "Remove shoes before entering homes and temples."
  ],
  "transport": "Changi Airport links to the city via the efficient MRT and taxis; the MRT and buses are the dominant, highly reliable local transport, and Grab plus the local Gojek and TADA apps handle ride-hailing. Uber exited the market in 2018.",
  "connectivity": "Tourist SIMs and eSIMs are excellent and easy to buy at Changi; mobile coverage and public wifi are fast and pervasive citywide.",
  "payments": "Cards and contactless are accepted almost everywhere, and mobile payment via PayNow and GrabPay is common, though small hawker stalls may still prefer cash."
 },
 "TH": {
  "iso2": "TH",
  "tapWater": {
   "status": "unsafe",
   "note": "Do not drink tap water; bottled and filtered water is cheap and available everywhere."
  },
  "etiquette": [
   "Never disrespect the monarchy or Buddha images, as it is illegal and deeply offensive.",
   "Return the wai greeting, dress modestly at temples, and remove shoes before entering.",
   "Do not touch anyone's head or point your feet at people or sacred objects.",
   "Women should never touch monks or hand items directly to them."
  ],
  "transport": "Bangkok's Suvarnabhumi connects to the city via the Airport Rail Link and metered taxis; the BTS Skytrain, MRT, tuk-tuks, and the Grab and Bolt apps dominate local transport. Uber merged into Grab in the region.",
  "connectivity": "Local SIMs from AIS, TrueMove, or dtac and tourist eSIMs are inexpensive at the airport; 4G and 5G coverage is strong in cities and tourist areas.",
  "payments": "Cash in baht is widely used, especially at markets and street stalls, while cards and the PromptPay QR system are increasingly accepted in shops and restaurants."
 },
 "VN": {
  "iso2": "VN",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not potable; drink bottled or boiled water, which is standard everywhere."
  },
  "etiquette": [
   "Use both hands when passing items to or receiving from elders.",
   "Dress modestly at temples and pagodas and remove shoes where indicated.",
   "Avoid public displays of anger; remaining calm preserves face for both parties.",
   "Ask before photographing people, especially in ethnic-minority areas."
  ],
  "transport": "Hanoi's Noi Bai and Ho Chi Minh City's Tan Son Nhat connect to centers by taxi and the Grab app; Grab cars and motorbike taxis dominate local transport, alongside the new metro lines in both cities. Be cautious with unmetered street taxis.",
  "connectivity": "Local SIMs from Viettel, Mobifone, or Vinaphone are very cheap and easy to buy; 4G coverage is fast and extensive even in many rural areas.",
  "payments": "Cash in dong remains dominant, especially for street food and markets, while cards and the MoMo and ZaloPay mobile wallets are growing in cities and among younger vendors."
 },
 "TW": {
  "iso2": "TW",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is treated but locals universally boil or filter it before drinking; bottled water is widely available."
  },
  "etiquette": [
   "Use the EasyCard for transit and convenience stores, and queue orderly for the MRT.",
   "Do not eat or drink on the Taipei MRT, where it is prohibited and fined.",
   "Do not stick chopsticks upright in rice, as it resembles funeral incense.",
   "Hand over and receive items, including cards and money, with both hands."
  ],
  "transport": "Taoyuan Airport connects to Taipei via the Airport MRT and buses; the MRT, extensive bus networks, and the high-speed rail dominate travel, and Uber operates legally alongside local taxis. Scooters are ubiquitous for locals.",
  "connectivity": "Tourist SIMs and eSIMs are excellent and cheap at the airport; mobile coverage and free public wifi are fast and widespread.",
  "payments": "Cards and the EasyCard contactless card are widely accepted, and mobile payment such as LINE Pay is common, though cash is still preferred at night markets and small eateries."
 },
 "HK": {
  "iso2": "HK",
  "tapWater": {
   "status": "safe",
   "note": "Government-supplied tap water meets WHO standards and is safe to drink, though some prefer to boil it due to old building plumbing."
  },
  "etiquette": [
   "Stand on the right side of escalators and let others pass on the left, especially in MTR stations.",
   "Avoid eating or drinking on MTR trains, as it is prohibited and fines apply.",
   "Use both hands when presenting or receiving a business card or a gift.",
   "Avoid loud phone conversations on public transport, which locals consider inconsiderate."
  ],
  "transport": "The Airport Express links HKIA to Central in about 24 minutes, with frequent buses and taxis as alternatives; the MTR, trams, ferries, and buses cover the city efficiently. Uber operates in a legal grey area; local taxis and the HKTaxi/Fly Taxi apps are more reliable.",
  "connectivity": "Prepaid local SIMs and eSIMs from carriers such as 3, CSL, and SmarTone are widely sold, and mobile and public wifi coverage is excellent across the territory.",
  "payments": "The Octopus card dominates for transit and small purchases, contactless cards are widely accepted, and Alipay and WeChat Pay are common, though small vendors and markets still prefer cash."
 },
 "AU": {
  "iso2": "AU",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is treated to high standards and safe to drink throughout cities and most regional areas."
  },
  "etiquette": [
   "Sit in the front passenger seat of a taxi or rideshare, as riding in the back can be read as treating the driver as a servant.",
   "Respect strict alcohol rules and signage in many Aboriginal communities and remote regions.",
   "Apply and reapply high-SPF sunscreen, since UV levels are extreme even on cloudy days.",
   "Avoid touching or feeding wildlife and keep a safe distance from kangaroos, snakes, and marine creatures."
  ],
  "transport": "Major airports connect to city centres via train (Sydney, Brisbane, Perth) or SkyBus and taxis (Melbourne), and cities rely on integrated bus, train, tram, and ferry networks. Uber, DiDi, and Bolt operate in major cities alongside licensed taxis.",
  "connectivity": "Prepaid SIMs and eSIMs from Telstra, Optus, and Vodafone are sold at airports and convenience stores; coverage is strong in cities but patchy across the vast outback.",
  "payments": "Australia is heavily cashless, with contactless cards and mobile wallets such as Apple Pay and Google Pay accepted almost everywhere, and many small venues no longer take cash."
 },
 "FJ": {
  "iso2": "FJ",
  "tapWater": {
   "status": "caution",
   "note": "Tap water is generally treated and drinkable in Suva and Nadi, but use bottled or boiled water in rural areas and outer islands."
  },
  "etiquette": [
   "Remove your shoes before entering a home or a bure, and stoop slightly when passing seated elders.",
   "Dress modestly in villages, covering shoulders and knees, and remove hats as wearing one can offend.",
   "Present a sevusevu gift of kava to the village chief when visiting a traditional village.",
   "Avoid touching anyone's head, which is considered sacred in Fijian culture."
  ],
  "transport": "Nadi International Airport is the main gateway, with hotel transfers, taxis, and the Lomolomo bus serving Nadi and Denarau; inter-island travel uses ferries and small planes. Ride-hailing is limited, though the local inDrive and Where apps operate in urban areas alongside metered taxis.",
  "connectivity": "Prepaid SIMs from Vodafone Fiji and Digicel are cheap and sold at the airport; mobile coverage is reliable on the main islands but thin on remote outer islands.",
  "payments": "Cash in Fijian dollars is essential outside resorts and towns, while hotels, larger restaurants, and supermarkets accept cards; mobile money via M-PAiSA and MyCash is used domestically."
 },
 "KI": {
  "iso2": "KI",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap and well water is frequently contaminated, so drink only bottled, boiled, or treated water and avoid ice."
  },
  "etiquette": [
   "Dress conservatively, keeping shoulders and thighs covered, especially away from resorts and on Sundays.",
   "Ask permission before photographing people, villages, or the maneaba (meeting house).",
   "Respect Sunday as a strict day of rest, when most activity and businesses stop for church.",
   "Remove your shoes before entering homes and behave quietly and respectfully inside the maneaba."
  ],
  "transport": "Bonriki International Airport on Tarawa is served by infrequent flights, with minibuses and shared taxis running along South Tarawa's single main road. There are no ride-hailing apps; transport is by local bus, hired vehicle, or boat between islets and atolls.",
  "connectivity": "Prepaid SIMs are available from ATHKL (Ocean Link/Vodafone), and mobile data has improved with submarine cable access, though speeds remain slow and coverage is concentrated on Tarawa.",
  "payments": "Kiribati is an almost entirely cash economy using Australian dollars; card acceptance is rare, so bring sufficient cash as ATMs are few and unreliable."
 },
 "MH": {
  "iso2": "MH",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not reliably potable; drink bottled or boiled water and avoid untreated rainwater catchments."
  },
  "etiquette": [
   "Dress modestly, with women avoiding revealing clothing and bikinis outside resort areas.",
   "Ask permission before taking photos of people, and respect that many outer islands require landowner consent to visit.",
   "Observe Sunday as a quiet day reserved for church and family in this strongly Christian nation.",
   "Accept food or drink when offered, as refusing hospitality can cause offence."
  ],
  "transport": "Amata Kabua International Airport on Majuro has taxis and shared share-taxis that travel the atoll's single road for a flat low fare; inter-atoll travel relies on Air Marshall Islands and supply ships. No ride-hailing apps operate; flag down shared taxis along the road.",
  "connectivity": "Prepaid SIMs are sold by the National Telecommunications Authority (NTA), but mobile data is slow and expensive, and reliable internet is largely limited to Majuro and Ebeye.",
  "payments": "The US dollar is used and cash dominates; card acceptance is limited to some hotels and larger stores in Majuro, so carry cash for most transactions."
 },
 "FM": {
  "iso2": "FM",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water quality is unreliable across the four states; drink bottled or boiled water and avoid ice outside hotels."
  },
  "etiquette": [
   "Dress modestly; on islands like Yap, local custom and thigh-covering norms are taken seriously.",
   "Always ask permission before photographing people, ceremonies, or stone-money sites in Yap.",
   "Respect that land, reefs, and beaches are privately owned, and seek permission before entering or swimming.",
   "Behave respectfully toward chiefs and elders, and observe Sunday as a day of rest and church."
  ],
  "transport": "Each state has its own airport (Pohnpei, Chuuk, Yap, Kosrae) served by United Airlines' island hopper; taxis are shared and cheap, and there is little formal public transit. No ride-hailing apps operate; arrange taxis, hotel pickups, or rental cars.",
  "connectivity": "Prepaid SIMs are available from FSM Telecom, and submarine cables have improved Pohnpei and Chuuk, but data remains slow and patchy, especially on Yap and Kosrae.",
  "payments": "The US dollar is the currency and cash is essential; cards are accepted at a few hotels and dive operators, but most businesses are cash-only."
 },
 "NR": {
  "iso2": "NR",
  "tapWater": {
   "status": "unsafe",
   "note": "Most tap water comes from desalination or rain catchments of variable quality; bottled or boiled water is recommended."
  },
  "etiquette": [
   "Dress modestly away from the beach, keeping swimwear to swimming areas only.",
   "Ask permission before photographing people, homes, or the phosphate works.",
   "Respect Sunday observance, when shops close and the island is very quiet.",
   "Drive slowly and watch for pedestrians on the single ring road that circles the island."
  ],
  "transport": "Nauru International Airport is the only entry point, served by Nauru Airlines; there is no public transport, so most visitors walk, use hotel vehicles, or rent a car to circle the 19-kilometre ring road. No ride-hailing apps operate.",
  "connectivity": "Prepaid SIMs are available from Digicel, and a submarine cable has improved connectivity, though data speeds remain modest and coverage centres on populated coastal areas.",
  "payments": "Nauru uses the Australian dollar and is largely cash-based; card acceptance is very limited and ATMs are scarce, so arrive with sufficient cash."
 },
 "NZ": {
  "iso2": "NZ",
  "tapWater": {
   "status": "safe",
   "note": "Tap water is treated to high standards and safe to drink throughout the country."
  },
  "etiquette": [
   "Respect Maori protocol at a marae, removing shoes and following your host's lead during a powhiri welcome.",
   "Do not sit on tables or surfaces where food is prepared or served, which Maori custom considers offensive.",
   "Clean hiking boots and gear between tracks to prevent spreading kauri dieback and other biosecurity threats.",
   "Declare all food, plant, and outdoor items at the border, as biosecurity fines are steep."
  ],
  "transport": "Auckland Airport connects to the city via the AirportLink bus and SkyDrive, while Wellington and Christchurch use airport buses and taxis; cities rely on buses, with trains in Auckland and Wellington. Uber and Ola operate in main cities alongside taxis.",
  "connectivity": "Prepaid SIMs and eSIMs from Spark, One NZ, and 2degrees are easy to buy; coverage is good in towns and along main routes but drops in remote backcountry.",
  "payments": "New Zealand is highly cashless, with contactless cards and mobile wallets accepted nearly everywhere, though a small surcharge for card or PayWave is common."
 },
 "PW": {
  "iso2": "PW",
  "tapWater": {
   "status": "caution",
   "note": "Tap water in Koror is generally treated but quality varies; many visitors prefer bottled water, particularly outside the main town."
  },
  "etiquette": [
   "Use only reef-safe sunscreen, as Palau bans many chemical sunscreens to protect its reefs.",
   "Honour the Palau Pledge stamped in your passport by treating the environment and culture with care.",
   "Do not touch, stand on, or take coral, shells, or marine life from the protected waters.",
   "Dress modestly in villages and ask before photographing people or cultural sites."
  ],
  "transport": "Roman Tmetuchl International Airport near Koror is served by hotel shuttles and taxis, as there is no real public transport; getting around relies on taxis, rental cars, and dive-operator boats. No ride-hailing apps operate.",
  "connectivity": "Prepaid SIMs are sold by Palau National Communications (PNCC) and PalauTel; mobile data is available around Koror but slow and relatively expensive, with limited reach to outlying areas.",
  "payments": "Palau uses the US dollar; hotels, dive shops, and larger restaurants take cards, but cash is needed for taxis, markets, and small vendors."
 },
 "PG": {
  "iso2": "PG",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not reliably safe; drink bottled or boiled water and avoid ice outside reputable hotels."
  },
  "etiquette": [
   "Avoid walking around after dark and heed local security advice, as urban crime is a genuine concern.",
   "Always ask permission before photographing people, villages, or ceremonies, as customs are strong.",
   "Respect that land and many sites are clan-owned; seek permission and a local guide before entering.",
   "Dress modestly and behave reservedly, particularly in the Highlands and rural communities."
  ],
  "transport": "Jacksons International Airport in Port Moresby is best reached by pre-arranged hotel transfers for safety; public minibuses (PMVs) exist but are not advised for visitors. Domestic flights are essential between regions; ride-hailing apps do not operate reliably.",
  "connectivity": "Prepaid SIMs from Digicel and Telikom are widely sold; mobile coverage is decent in towns but limited in remote areas, and data can be slow.",
  "payments": "Cash in kina is essential, especially outside Port Moresby and Lae; cards are accepted at major hotels and some city stores, but ATM use carries security risks."
 },
 "WS": {
  "iso2": "WS",
  "tapWater": {
   "status": "caution",
   "note": "Treated tap water in Apia is generally drinkable, but use bottled or boiled water in villages and rural areas."
  },
  "etiquette": [
   "Dress modestly and wear a lavalava or cover up away from the beach, especially in villages and churches.",
   "Observe the evening sa prayer curfew in villages, stopping and remaining quiet when the bell rings.",
   "Ask permission before entering a village, swimming at its beach, or taking photographs.",
   "Do not stand or walk while others are seated in a fale during a kava ceremony or meeting."
  ],
  "transport": "Faleolo International Airport is about 35 km from Apia, reached by shuttle, taxi, or hotel transfer; colourful wooden buses and taxis serve Upolu, with a ferry to Savai'i. No ride-hailing apps operate; agree taxi fares before departure.",
  "connectivity": "Prepaid SIMs from Digicel and Vodafone Samoa are inexpensive and easy to buy; mobile coverage is good around Apia and decent across Upolu and Savai'i.",
  "payments": "Cash in tala is the norm, especially in villages and markets, while hotels, larger restaurants, and tour operators accept cards; ATMs are available in Apia."
 },
 "SB": {
  "iso2": "SB",
  "tapWater": {
   "status": "unsafe",
   "note": "Tap water is not reliably potable; drink bottled or boiled water and avoid ice outside quality resorts."
  },
  "etiquette": [
   "Always ask permission and pay any custom fee before visiting villages, beaches, or dive and surf sites on customary land.",
   "Dress modestly, with women avoiding shorts and revealing clothing outside resorts.",
   "Ask before photographing people, and respect strong Christian observance on Sundays.",
   "Be sensitive about discussing the WWII period and ethnic tensions, and follow local guidance."
  ],
  "transport": "Honiara International Airport connects to the city by taxi or hotel transfer; crowded local buses and taxis serve Honiara, while inter-island travel uses small planes and ferries. No ride-hailing apps operate; agree taxi fares in advance.",
  "connectivity": "Prepaid SIMs from Our Telekom and bmobile are available, and a submarine cable has improved Honiara's connectivity, though data remains slow and patchy on outer islands.",
  "payments": "Cash in Solomon Islands dollars is essential, particularly for custom fees and rural areas; cards are accepted only at some Honiara hotels and larger businesses."
 },
 "TO": {
  "iso2": "TO",
  "tapWater": {
   "status": "caution",
   "note": "Tap water in Nuku'alofa is generally treated but quality varies; bottled or boiled water is safer, especially on outer islands."
  },
  "etiquette": [
   "Respect strict Sunday observance, when nearly all businesses, transport, and activities close by law.",
   "Dress modestly, covering shoulders and knees, and wear a ta'ovala or cover-up in town and church.",
   "Avoid public displays of affection and sunbathing in swimwear away from resort beaches.",
   "Ask permission before photographing people and remove your shoes when entering a home."
  ],
  "transport": "Fua'amotu International Airport is about 35 km from Nuku'alofa, served by shuttles and taxis; minibuses and taxis serve Tongatapu, with domestic flights and ferries to outer island groups. No ride-hailing apps operate; confirm taxi fares beforehand.",
  "connectivity": "Prepaid SIMs from Digicel and TCC are easy to buy; mobile coverage is reliable on Tongatapu but slower and patchier on outer islands, and outages can follow cable faults.",
  "payments": "Cash in pa'anga is the norm, especially outside the capital; some hotels and larger shops in Nuku'alofa accept cards, but ATMs are limited beyond the main island."
 },
 "TV": {
  "iso2": "TV",
  "tapWater": {
   "status": "unsafe",
   "note": "Drinking water comes almost entirely from rain catchments of variable quality; drink bottled or boiled water."
  },
  "etiquette": [
   "Dress very modestly, keeping shoulders and thighs covered away from the beach, as Tuvalu is conservative and Christian.",
   "Observe Sunday strictly as a day of rest, when activity and businesses stop for church.",
   "Ask permission before photographing people, homes, or the maneaba meeting house.",
   "Behave quietly and respectfully in the maneaba and follow community leaders' guidance."
  ],
  "transport": "Funafuti International Airport sits in the centre of the atoll, and the airstrip doubles as a community gathering space between the few weekly flights; most people walk or ride motorbikes along the single road. No taxis or ride-hailing apps operate.",
  "connectivity": "Prepaid SIMs are available from the Tuvalu Telecommunications Corporation, but mobile data is slow and limited, with connectivity concentrated on Funafuti.",
  "payments": "Tuvalu uses the Australian dollar and is an almost entirely cash economy; there are no public ATMs and card acceptance is virtually nonexistent, so bring sufficient cash."
 },
 "VU": {
  "iso2": "VU",
  "tapWater": {
   "status": "caution",
   "note": "Tap water in Port Vila is generally treated and drinkable, but use bottled or boiled water on outer islands and after heavy rain."
  },
  "etiquette": [
   "Ask permission and pay any custom fee before entering villages or visiting beaches, waterfalls, and kastom sites.",
   "Dress modestly away from resorts, with women avoiding shorts and revealing clothing in villages.",
   "Ask before photographing people and ceremonies, and respect kastom traditions and chiefly authority.",
   "Behave respectfully when drinking kava in a nakamal, keeping voices low and following local custom."
  ],
  "transport": "Bauerfield International Airport is a short ride from Port Vila by taxi or hotel transfer; minibuses with a B plate and taxis serve Port Vila and Luganville, while small planes link the islands. No ride-hailing apps operate; agree minibus and taxi fares before riding.",
  "connectivity": "Prepaid SIMs from Digicel and Vodafone (TVL) are easy to buy; mobile coverage is good around Port Vila and decent on main islands but limited in remote areas.",
  "payments": "Cash in vatu is widely used, especially in markets and rural areas, while Port Vila hotels, restaurants, and tour operators accept cards; ATMs are available in the main towns."
 }
};


// Late-arrival hook: if a country guide is already open when this file lands,
// repaint it so the facts/phrasebook/intel sections appear without a re-open.
try { if (typeof _rerenderActiveDossier === 'function') _rerenderActiveDossier(); } catch (e) {}

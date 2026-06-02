'use strict';

// ─── State ────────────────────────────────────────────────────────────────────
let activeMonth    = new Date().getMonth();
let selectedMonths = new Set([new Date().getMonth()]);
let yearMode       = false;
let activeLayers   = new Set();   // default: clean map — user activates layers themselves
let showBorders    = false;
let showPolitical  = true;   // country borders + territory overlays on by default
let map            = null;
let cityMarkers    = [];
let borderMarkers    = [];
let _borderPoiMarkers  = [];   // live Overpass border crossing markers
let _borderPoiCache    = {};   // bboxKey → OSM elements
let _borderDebounce    = null;
let beachMarkers     = [];
let _beachPoiMarkers = [];    // live Overpass beach circleMarkers (zoom ≥ 7)
let _beachPoiCache   = {};    // bboxKey → OSM elements array (avoids re-querying)
let _beachDebounce   = null;

// Rail stop markers (rendered when rail layer is active at zoom ≥ 7)
let _railStopMarkers  = [];
let _railStopCache    = {};
let _railStopDebounce = null;

// Park border polylines (vector rendering replacing the NatGeo tile for natparks)
let _parkBorderLines    = [];
let _parkBorderCache    = {};
let _parkBorderDebounce = null;

// Road vector polylines (Overpass-fetched, replaces HOT tile overlay)
let _roadLines    = [];
let _roadCache    = {};
let _roadDebounce = null;

// Holiday markers (rendered from static COUNTRY_HOLIDAYS data)
let _holidayMarkers = [];

// Click-toggle tooltip: tracks which feature's popup is currently open.
// Clicking the same feature again closes the tooltip (toggle behavior).
let _activeTooltipKey = null;
let _tempUnit         = 'C';   // 'C' or 'F' — toggled by the weather info window button
var _distUnit = localStorage.getItem('na_dist') || 'km';
let climateZoneLayer  = null;
let _elevationTileLayer = null;
let _climateRenderer  = null;
let geojsonLayer     = null;
let borderLinesLayer     = null;
let territoryLayerGroup  = null;
let _geoData       = null;   // cached choropleth GeoJSON for border-lines reuse
let countryNames   = {};
let tooltipVisible   = false;
let _featureClicked    = false;   // prevents map-click from dismissing tooltip when a feature was just clicked
let _admin1Visible     = false;   // tracks whether admin-1 layer is currently on the map (zoom ≥ 5)
let selectedNationality = null;   // ISO-2 passport code chosen in the nationality selector

// Admin-1 sub-national choropleth
let _admin1GeoData    = null;
let admin1ChoroLayer  = null;
let _coveredByAdmin1  = new Set();   // ISO-2 codes present in admin-1 data
let _admin1NameCache  = {};          // admin-1 code → display name (for admin-2 tooltips)

// Admin-2 county/municipality choropleth (zoom ≥ 6, on-demand per country)
// GeoJSON files self-hosted in data/admin2/ (geoBoundaries CC-BY 4.0)
let _admin2Layers    = {};   // iso2 → L.GeoJSON layer instance
let _admin2Cache     = {};   // iso2 → FeatureCollection | null (null = in-flight fetch)
let _coveredByAdmin2 = new Set();  // iso2 codes with admin-2 layer currently on map

// Transport tile layers — config + runtime state bundled per layer
const TRANSPORT_LAYERS = {
  roads: {
    label: '🛣 Roads',
    // Vector overlay: road geometries fetched from Overpass, rendered as colored
    // L.polylines on transportPane.  No tile download — fully transparent, every
    // segment is individually clickable.  Requires zoom ≥ 9.
    vector: true,
    url: null, opts: {},
    layer: null, active: false,
  },
  rail: {
    label: '🚆 Rail & Transit',
    url: 'https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
    opts: { subdomains: 'abc', maxZoom: 19, opacity: 0.88,
            attribution: '&copy; <a href="https://openrailwaymap.org">OpenRailwayMap</a> &copy; <a href="https://osm.org/copyright">OSM</a>' },
    layer: null, active: false,
  },
  trails: {
    label: '🥾 Hiking Trails',
    url: 'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png',
    opts: { maxZoom: 19, opacity: 0.85,
            attribution: '&copy; <a href="https://hiking.waymarkedtrails.org">Waymarked Trails</a> &copy; <a href="https://osm.org/copyright">OSM</a>' },
    layer: null, active: false,
  },
  maritime: {
    label: '⚓ Maritime',
    url: 'https://t{s}.openseamap.org/seamark/{z}/{x}/{y}.png',
    opts: { subdomains: '123', maxZoom: 18, opacity: 0.85,
            attribution: '&copy; <a href="https://openseamap.org">OpenSeaMap</a>' },
    layer: null, active: false,
  },
  wildfires: {
    label: '🔥 Wildfires',
    // NASA GIBS WMTS — public endpoint, no API key required.
    // Layer: VIIRS_SNPP_Thermal_Anomalies_375m_All (Suomi NPP satellite thermal anomalies).
    // TileMatrixSet: GoogleMapsCompatible_Level8 (max zoom 8).
    // 404 on a tile = no hotspot detected there — Leaflet skips silently.
    // URL is computed at activation using yesterday's date for full tile coverage.
    url: null,   // computed at activation in buildTransportButtons()
    wms: false,
    opts: { maxZoom: 18, maxNativeZoom: 8, opacity: 0.9,
            attribution: 'NASA GIBS · VIIRS SNPP Thermal Anomalies 375m' },
    layer: null, active: false,
  },
  natparks: {
    label: '🌲 Parks',
    // Vector rendering: green polygon borders fetched from Overpass (boundary=national_park
    // + leisure=nature_reserve). The NatGeo tile overlay has been replaced so the basemap
    // satellite imagery remains visible — only the park boundaries are drawn on top.
    vector: true,   // signals _fetchAndRenderParkBorders() instead of L.tileLayer()
    url: null, opts: {},
    layer: null, active: false,
  },
};

// POI layers — Overpass-queried point markers; separate from TRANSPORT_LAYERS
// (which are tile-based) because POI layers re-query on every map moveend.
const POI_LAYERS = {
  camping: {
    label: '⛺ Camping',
    active: false, minZoom: 7, markers: [], bboxCache: {}, debounce: null,
  },
  parks: {
    label: '🏞 Parks & Forests',
    active: false, minZoom: 6, markers: [], bboxCache: {}, debounce: null,
  },
  holidays: {
    label: '🎉 Holidays',
    active: false, minZoom: 2,
    markers: [], bboxCache: {}, debounce: null,
  },
  viewpoints: {
    label: '📷 Viewpoints',
    active: false, minZoom: 7, markers: [], bboxCache: {}, debounce: null,
  },
  climbing: {
    label: '🧗 Rock Climbing',
    active: false, minZoom: 7, markers: [], bboxCache: {}, debounce: null,
  },
  hotsprings: {
    label: '♨ Hot Springs',
    active: false, minZoom: 6, markers: [], bboxCache: {}, debounce: null,
  },
  airports: {
    label: '✈ Airports',
    active: false, minZoom: 4, markers: [], bboxCache: {}, debounce: null,
  },
  birdwatching: { label: '🐦 Bird Watching', active: false, minZoom: 7, markers: [], bboxCache: {}, debounce: null },
  surfing:      { label: '🏄 Surf Spots',    active: false, minZoom: 6, markers: [], bboxCache: {}, debounce: null },
  diving:       { label: '🤿 Dive & Snorkel', active: false, minZoom: 6, markers: [], bboxCache: {}, debounce: null },
  attractions:  { label: '⭐ Attractions',   active: false, minZoom: 5, markers: [], bboxCache: {}, debounce: null },
  hospitals:    { label: "🏥 Hospitals",         active: false, minZoom: 8,  markers: [], bboxCache: {}, debounce: null },
  toilets:      { label: "🚻 Toilets & Showers", active: false, minZoom: 14, markers: [], bboxCache: {}, debounce: null },
  drinkwater:   { label: "🚰 Drinking Water",    active: false, minZoom: 13, markers: [], bboxCache: {}, debounce: null },
  wildlife:     { label: "🌿 Wildlife & Nature", active: false, minZoom: 7,  markers: [], bboxCache: {}, debounce: null },
  gasstations:  { label: "⛽ Gas Stations",       active: false, minZoom: 10, markers: [], bboxCache: {}, debounce: null },
};

const GEOGRAPHIC_LAYERS = new Set(['weather','beaches','health','disaster','crowds','cost','safety','internet','visa','strength','kids','cannabis','nomad','english','healthcare','tapwater','airquality','femalesafety','nightlife','scam','malaria','tipping']);
const BEACH_STATUS_COL  = { open:'#06b6d4', seasonal:'#f59e0b', restricted:'#8b5cf6', closed:'#ef4444' };

// Works with Natural Earth (ISO_A2), lowercase (iso_a2), or geo-countries (ISO3166-1-Alpha-2)
const getIso2 = p => (p && (p.ISO_A2 || p.iso_a2 || p['ISO3166-1-Alpha-2'])) || '';

// Rounds map bounds to 2 dp (~1 km precision) and returns a cache key string.
// Used by POI layers to avoid re-querying Overpass on tiny pans.
function _bboxKey(b) {
  return [b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]
    .map(v => Math.round(v * 100) / 100).join(',');
}

// Returns parent-country ISO-2 for a Natural Earth admin-1 feature.
// iso_a2 is the direct field; iso_3166_2 split is the fallback.
const getAdmin1Iso2 = p => {
  if (!p) return '';
  const a = p.iso_a2 || '';
  if (a && a !== '-99' && a !== '-1') return a;
  const s = p.iso_3166_2 || '';
  if (s && s !== '-99') {
    const c = s.split('-')[0];
    if (c && c.length === 2) return c;
  }
  return '';
};

// Returns the full ISO 3166-2 subdivision code (e.g. 'CN-11', 'US-AK') for
// sub-national data lookup in CD_A1.
const getAdmin1Code = p => {
  if (!p) return '';
  const s = p.iso_3166_2 || '';
  return (s && s !== '-99' && s !== '-1') ? s : '';
};

let _visitedSet = new Set(JSON.parse((() => { try { return localStorage.getItem('na_visited') || '[]'; } catch (_) { return '[]'; } })()));

function markVisited(iso2) {
  if (!iso2 || iso2 === '-99') return;
  _visitedSet.add(iso2);
  try {
    localStorage.setItem('na_visited', JSON.stringify([..._visitedSet]));
  } catch (_) { /* quota or private mode — silently ignore */ }
  updateLegend();
}

function isVisited(iso2) {
  return _visitedSet.has(iso2);
}

// ─── Wishlist / Bucket List ───────────────────────────────────────────────────
// Stores ISO2 codes the user has heart-listed, persisted to localStorage.
var _wishlist = new Set();

function _loadWishlist() {
  try { var d = JSON.parse(localStorage.getItem('na_wishlist')||'[]'); if (Array.isArray(d)) _wishlist = new Set(d); } catch(e){}
}

function _saveWishlist() {
  try { localStorage.setItem('na_wishlist', JSON.stringify(Array.from(_wishlist))); } catch(e){}
}

function _toggleWishlist(iso2) {
  if (!iso2) return;
  if (_wishlist.has(iso2)) { _wishlist.delete(iso2); } else { _wishlist.add(iso2); }
  _saveWishlist();
  _updateWishlistUI(iso2);
  if (typeof showToast === 'function') showToast(_wishlist.has(iso2) ? '♥ Added to wishlist' : 'Removed from wishlist');
}

function _updateWishlistUI(iso2) {
  var btn = document.getElementById('btn-wishlist-' + iso2);
  if (btn) btn.textContent = _wishlist.has(iso2) ? '♥' : '♡';
  var counter = document.getElementById('wishlist-count');
  if (counter) counter.textContent = _wishlist.size > 0 ? _wishlist.size : '';
}

// ─── Trip Share Card ──────────────────────────────────────────────────────────
function _shareTrip() {
  if (!_tripPins || _tripPins.length === 0) { showToast('Add some trip pins first!'); return; }
  var lines = ['🗺 My Nomadic Almanac Trip Plan', ''];
  _tripPins.forEach(function(pin, i) {
    var flag = typeof _countryFlag === 'function' ? _countryFlag(pin.iso2 || '') : '';
    var name = pin.name || pin.iso2 || ('Pin ' + (i+1));
    var cd = (typeof COST_DETAILS !== 'undefined' && pin.iso2) ? COST_DETAILS[pin.iso2] : null;
    var budget = cd ? ('~$' + Math.round((cd.hostel||25)+(cd.meal||8)*3+(cd.transport||5)) + '/day') : '';
    lines.push((i+1) + '. ' + flag + ' ' + name + (budget ? ' (' + budget + ')' : ''));
  });
  lines.push('');
  var totalKm = 0;
  for (var i=1;i<_tripPins.length;i++) {
    if (typeof _haversineKm === 'function') totalKm += _haversineKm(_tripPins[i-1].lat,_tripPins[i-1].lng,_tripPins[i].lat,_tripPins[i].lng);
  }
  if (totalKm > 0) lines.push('Total route distance: ' + _dist(totalKm));
  lines.push('Planned with Nomadic Almanac — https://samuellclemens.github.io/Nomadic-Almanac/');
  var text = lines.join('\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function(){showToast('📋 Trip copied to clipboard!');}).catch(function(){_fallbackShare(text);});
  } else { _fallbackShare(text); }
}

function _fallbackShare(text) {
  var el = document.createElement('textarea');
  el.value = text;
  el.style.cssText = 'position:fixed;left:-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  showToast('📋 Trip copied to clipboard!');
}

// ─── Trip Planning Pins ───────────────────────────────────────────────────────
// User-placed named pins stored in localStorage. Each pin: {id, lat, lng, name}.
let _tripPins  = [];
let _tripPinMarkers = {};   // id → Leaflet marker
let _placingPin = false;    // true while the user is clicking to place a new pin

// Returns the flag emoji for a 2-letter ISO country code (Unicode regional indicators)
function _countryFlag(iso2) {
  if (!iso2 || iso2.length !== 2) return '';
  var o = 127397;
  return String.fromCodePoint(iso2.toUpperCase().charCodeAt(0)+o, iso2.toUpperCase().charCodeAt(1)+o);
}

// ─── Currency / distance / language globals ───────────────────────────────────
var _currCode = localStorage.getItem('na_curr') || 'USD';
var _RATES = {
  USD:{rate:1,    sym:'$',   name:'US Dollar'},
  EUR:{rate:0.92, sym:'€',   name:'Euro'},
  GBP:{rate:0.79, sym:'£',   name:'Pound Sterling'},
  AUD:{rate:1.54, sym:'A$',  name:'Aus Dollar'},
  CAD:{rate:1.37, sym:'C$',  name:'Canadian Dollar'},
  JPY:{rate:149,  sym:'¥',   name:'Japanese Yen'},
  THB:{rate:35,   sym:'฿',   name:'Thai Baht'},
  MXN:{rate:17.5, sym:'MX$', name:'Mexican Peso'},
  SGD:{rate:1.35, sym:'S$',  name:'Singapore Dollar'},
  CHF:{rate:0.90, sym:'CHF', name:'Swiss Franc'},
};
var _CURR_KEYS = ['USD','EUR','GBP','AUD','CAD','JPY','THB','MXN','SGD','CHF'];

function _money(usdAmount) {
  if (usdAmount == null || isNaN(usdAmount)) return '';
  var c = _RATES[_currCode] || _RATES.USD;
  var v = Math.round(usdAmount * c.rate);
  return c.sym + v.toLocaleString();
}

function _cycleCurrency() {
  var idx = _CURR_KEYS.indexOf(_currCode);
  _currCode = _CURR_KEYS[(idx + 1) % _CURR_KEYS.length];
  localStorage.setItem('na_curr', _currCode);
  var btn = document.getElementById('btn-currency');
  if (btn) btn.textContent = _currCode;
  if (document.getElementById('tt') && document.getElementById('tt').style.display !== 'none') {
    if (typeof _activeTooltipKey !== 'undefined' && _activeTooltipKey) {
      if (typeof buildTooltip === 'function') buildTooltip(_activeTooltipKey);
    }
  }
}

var _lang = localStorage.getItem('na_lang') || 'en';
var _STRINGS = {
  en: { weather:'Weather', safety:'Safety', cost:'Cost', internet:'Internet', visa:'Visa Access', english:'English Proficiency', healthcare:'Healthcare', tapwater:'Tap Water', nightlife:'Nightlife', scam:'Scam Risk', malaria:'Malaria Risk', compare:'Compare', journal:'Journal', packing:'Packing List', wishlist:'Wishlist', share:'Share Trip', tipping:'Tipping', noTipping:'No Tipping', tipOptional:'Tip Optional', tipAppreciated:'Tip Appreciated', tipExpected:'Tipping Expected', countryIntel:'Country Intelligence', origin:'Origin', character:'Character', complexity:'Honest Complexity', bestFor:'Best For', notKnown:'What Locals Know', loading:'Loading', noData:'No Data', layers:'Layers', filters:'Filters', compare2:'Compare', share2:'Share', save:'Save', close:'Close', search:'Search', language:'Language', currency:'Currency', units:'Units', darkMode:'Dark Mode', about:'About' },
  es: { weather:'Clima', safety:'Seguridad', cost:'Costo', internet:'Internet', visa:'Visa', english:'Inglés', healthcare:'Salud', tapwater:'Agua Potable', nightlife:'Vida Nocturna', scam:'Riesgo de Estafa', malaria:'Riesgo de Malaria', compare:'Comparar', journal:'Diario', packing:'Lista de Equipaje', wishlist:'Lista de Deseos', share:'Compartir', tipping:'Propinas', noTipping:'Sin propinas', tipOptional:'Propina opcional', tipAppreciated:'Propina apreciada', tipExpected:'Propina esperada', countryIntel:'Inteligencia del pais', origin:'Origen', character:'Caracter', complexity:'Complejidad honesta', bestFor:'Mejor para', notKnown:'Lo que saben los locales', loading:'Cargando', noData:'Sin datos', layers:'Capas', filters:'Filtros', compare2:'Comparar', share2:'Compartir', save:'Guardar', close:'Cerrar', search:'Buscar', language:'Idioma', currency:'Moneda', units:'Unidades', darkMode:'Modo oscuro', about:'Acerca de' },
  fr: { weather:'Météo', safety:'Sécurité', cost:'Coût', internet:'Internet', visa:'Visa', english:'Anglais', healthcare:'Santé', tapwater:'Eau Potable', nightlife:'Vie Nocturne', scam:"Risque d'arnaque", malaria:'Risque de Malaria', compare:'Comparer', journal:'Journal', packing:'Liste de Bagages', wishlist:'Souhaitlist', share:'Partager', tipping:'Pourboire', noTipping:'Sans pourboire', tipOptional:'Pourboire optionnel', tipAppreciated:'Pourboire apprecie', tipExpected:'Pourboire attendu', countryIntel:'Intelligence pays', origin:'Origine', character:'Caractere', complexity:'Complexite honnete', bestFor:'Ideal pour', notKnown:'Ce que savent les locaux', loading:'Chargement', noData:'Pas de donnees', layers:'Couches', filters:'Filtres', compare2:'Comparer', share2:'Partager', save:'Enregistrer', close:'Fermer', search:'Rechercher', language:'Langue', currency:'Devise', units:'Unites', darkMode:'Mode sombre', about:'A propos' },
  de: { weather:'Wetter', safety:'Sicherheit', cost:'Kosten', internet:'Internet', visa:'Visum', english:'Englischkenntnisse', healthcare:'Gesundheit', tapwater:'Trinkwasser', nightlife:'Nachtleben', scam:'Betrugsrisiko', malaria:'Malariarisiko', compare:'Vergleichen', journal:'Tagebuch', packing:'Packliste', wishlist:'Wunschliste', share:'Teilen', tipping:'Trinkgeld', noTipping:'Kein Trinkgeld', tipOptional:'Trinkgeld optional', tipAppreciated:'Trinkgeld willkommen', tipExpected:'Trinkgeld erwartet', countryIntel:'Laenderintelligenz', origin:'Herkunft', character:'Charakter', complexity:'Ehrliche Komplexitaet', bestFor:'Am besten fuer', notKnown:'Was Einheimische wissen', loading:'Laden', noData:'Keine Daten', layers:'Ebenen', filters:'Filter', compare2:'Vergleichen', share2:'Teilen', save:'Speichern', close:'Schliessen', search:'Suchen', language:'Sprache', currency:'Waehrung', units:'Einheiten', darkMode:'Dunkler Modus', about:'Ueber' },
};
var _LANG_KEYS = ['en','es','fr','de'];

function _t(key) {
  var strings = _STRINGS[_lang] || _STRINGS.en;
  return strings[key] || (_STRINGS.en[key]) || key;
}

function _cycleLang() {
  var idx = _LANG_KEYS.indexOf(_lang);
  _lang = _LANG_KEYS[(idx + 1) % _LANG_KEYS.length];
  localStorage.setItem('na_lang', _lang);
  var btn = document.getElementById('btn-lang');
  if (btn) btn.textContent = {en:'🌐 EN', es:'🌐 ES', fr:'🌐 FR', de:'🌐 DE'}[_lang] || '🌐';
}

// Distance helper
function _dist(km) {
  if (!km && km !== 0) return '';
  if (_distUnit === 'mi') return Math.round(km * 0.621371).toLocaleString() + ' mi';
  return Math.round(km).toLocaleString() + ' km';
}

function _toggleDistUnit() {
  _distUnit = _distUnit === 'km' ? 'mi' : 'km';
  localStorage.setItem('na_dist', _distUnit);
  var btn = document.getElementById('btn-dist-unit');
  if (btn) btn.textContent = _distUnit === 'km' ? 'km' : 'mi';
  _buildRoutePanel && _buildRoutePanel();
  if (typeof _updateTripPlannerPanel === 'function') _updateTripPlannerPanel();
}

// HTML escape helper — applied to ALL user-supplied or external-data strings
// before they are interpolated into innerHTML. Prevents stored XSS from pin
// names, OSM tag values, and any other untrusted text.
function _esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Validate and sanitise a pin object loaded from localStorage.
// Returns the pin if it looks legitimate; returns null if it is malformed.
function _validatePin(p) {
  if (!p || typeof p !== 'object') return null;
  if (typeof p.id !== 'string' || !/^tp_\d+$/.test(p.id)) return null;
  if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return null;
  if (typeof p.name !== 'string') return null;
  // Sanitise name length — truncate anything implausibly long
  return { id: p.id, lat: p.lat, lng: p.lng, name: p.name.slice(0, 120) };
}

function _loadTripPins() {
  try {
    const raw = localStorage.getItem('na_trip_pins');
    const parsed = raw ? JSON.parse(raw) : [];
    _tripPins = Array.isArray(parsed)
      ? parsed.map(_validatePin).filter(Boolean)
      : [];
  } catch (_) { _tripPins = []; }
}

function _saveTripPins() {
  try {
    localStorage.setItem('na_trip_pins', JSON.stringify(_tripPins));
  } catch (_) { /* quota or private mode */ }
}

const _JOURNAL_KEY = 'na_journal';
function _getJournal() {
  try { return JSON.parse(localStorage.getItem(_JOURNAL_KEY) || '{}'); } catch(_) { return {}; }
}
function _saveJournal(j) {
  try { localStorage.setItem(_JOURNAL_KEY, JSON.stringify(j)); } catch(_) {}
}
function _getNote(iso2) { return _getJournal()[iso2] || ''; }
function _saveNote(iso2, text) {
  const j = _getJournal();
  const t = text.trim().slice(0, 2000);
  if (t) j[iso2] = t; else delete j[iso2];
  _saveJournal(j);
}

function _haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dL = (lat2 - lat1) * Math.PI / 180;
  const dG = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dL/2) * Math.sin(dL/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dG/2) * Math.sin(dG/2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function _buildBudgetEstimate() {
  if (!_tripPins || _tripPins.length === 0) return '';
  var html = '<div style="margin-top:10px;padding:8px;background:rgba(201,168,76,0.08);border-radius:6px;border:1px solid rgba(201,168,76,0.2)">' +
    '<div style="font-size:8px;letter-spacing:1.5px;color:rgba(201,168,76,0.6);text-transform:uppercase;margin-bottom:6px">Budget Estimator</div>' +
    '<div style="font-size:8px;color:rgba(255,255,255,0.5);margin-bottom:6px">Enter days per destination:</div>';
  var totalBudget = 0, totalComfort = 0;
  _tripPins.forEach(function(pin, i) {
    var cd = (typeof COST_DETAILS !== 'undefined' && pin.iso2) ? COST_DETAILS[pin.iso2] : null;
    var budgetDay = cd ? ((cd.hostel||25) + (cd.meal||8)*3 + (cd.transport||5)) : 60;
    var comfortDay = cd ? (budgetDay * 2.2) : 130;
    var days = 7;
    totalBudget += budgetDay * days;
    totalComfort += comfortDay * days;
    var flag = typeof _countryFlag === 'function' ? _countryFlag(pin.iso2 || '') : '';
    var name = _esc(pin.name || pin.iso2 || ('Pin ' + (i+1)));
    html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
      '<span style="font-size:10px">' + flag + '</span>' +
      '<span style="font-size:8px;color:var(--sand);flex:1">' + name + '</span>' +
      '<span style="font-size:8px;color:var(--dim)">~$' + Math.round(budgetDay) + '/day</span>' +
      '</div>';
  });
  html += '<div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(201,168,76,0.15)">' +
    '<div style="font-size:8px;color:var(--dim)">Est. 7 days each:</div>' +
    '<div style="font-size:10px;color:#4ade80;font-weight:700;margin-top:2px">Budget: ~$' + Math.round(totalBudget) + '</div>' +
    '<div style="font-size:10px;color:#fbbf24;font-weight:700">Comfort: ~$' + Math.round(totalComfort) + '</div>' +
    '</div></div>';
  return html;
}

function _buildPackingList() {
  if (!_tripPins || _tripPins.length === 0) return '';
  var items = {
    essentials: ['Passport','Visa documents','Travel insurance card','Emergency contacts','Phone + charger','Power bank','Local SIM or eSIM plan','Headphones','Reusable water bottle'],
    health: ['Prescription meds (2x supply)','First aid kit','Diarrhea tabs','Antihistamines','Sunscreen SPF 50+','Insect repellent','Hand sanitiser'],
    clothing: ['Comfortable walking shoes','Flip-flops','5x underwear','4x T-shirts','2x trousers/pants','Rain jacket or poncho','Versatile layer'],
    warm: ['Thermal base layers','Warm hat and gloves','Insulated jacket','Wool socks'],
    beach: ['Swimwear (x2)','Quick-dry towel','Reef-safe sunscreen','UV rash guard'],
    unsafe_water: ['Water purification tablets','Portable water filter (Sawyer etc.)','Extra bottled water budget'],
    poor_health: ['Vaccination certificates','Comprehensive medical kit','Travel doctor consultation pre-trip','Medical evacuation insurance'],
    active: ['Hiking boots','Trekking poles','Lightweight daypack','Microfibre towel'],
  };
  var pack = new Set(items.essentials);
  items.health.forEach(function(i){pack.add(i);});
  items.clothing.forEach(function(i){pack.add(i);});
  var hasWarm=false, hasBeach=false, hasUnsafeWater=false, hasPoorHealth=false, hasActive=false;
  _tripPins.forEach(function(pin) {
    var iso2 = pin.iso2 || '';
    if (typeof CD_TAPWATER !== 'undefined' && CD_TAPWATER[iso2] >= 2) hasUnsafeWater = true;
    if (typeof CD_HEALTHCARE !== 'undefined' && CD_HEALTHCARE[iso2] >= 3) hasPoorHealth = true;
    if (typeof CD_CLIMATE !== 'undefined' && CD_CLIMATE[iso2]) {
      var temp = CD_CLIMATE[iso2].temp[activeMonth];
      if (temp != null && temp < 10) hasWarm = true;
      if (temp != null && temp > 20) hasBeach = true;
    }
  });
  var activePoi = typeof POI_LAYERS !== 'undefined' ? Object.keys(POI_LAYERS).filter(function(k){return POI_LAYERS[k].active;}) : [];
  if (activePoi.some(function(k){return ['climbing','hiking','parks'].includes(k);})) hasActive = true;
  if (hasWarm) items.warm.forEach(function(i){pack.add(i);});
  if (hasBeach) items.beach.forEach(function(i){pack.add(i);});
  if (hasUnsafeWater) items.unsafe_water.forEach(function(i){pack.add(i);});
  if (hasPoorHealth) items.poor_health.forEach(function(i){pack.add(i);});
  if (hasActive) items.active.forEach(function(i){pack.add(i);});
  var arr = Array.from(pack);
  return '<div style="margin-top:10px;padding:8px;background:rgba(255,255,255,0.04);border-radius:6px;border:1px solid rgba(255,255,255,0.08)">' +
    '<div style="font-size:8px;letter-spacing:1.5px;color:rgba(201,168,76,0.6);text-transform:uppercase;margin-bottom:6px">Smart Packing List (' + arr.length + ' items)</div>' +
    '<div style="columns:2;column-gap:10px">' +
    arr.map(function(item){return '<div style="font-size:7.5px;color:var(--sand);margin-bottom:2px;break-inside:avoid">✓ ' + _esc(item) + '</div>';}).join('') +
    '</div></div>';
}

function _togglePackingPanel() {
  var el = document.getElementById('packing-panel');
  if (!el) {
    el = document.createElement('div');
    el.id = 'packing-panel';
    el.style.cssText = 'position:fixed;right:12px;bottom:120px;width:280px;max-height:60vh;overflow-y:auto;background:rgba(14,11,6,0.97);border:1px solid rgba(201,168,76,0.3);border-radius:10px;padding:10px;z-index:1200;display:none';
    document.body.appendChild(el);
  }
  if (el.style.display === 'none' || el.style.display === '') {
    el.innerHTML = _buildPackingList();
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

function _buildRoutePanel() {
  const el = document.getElementById('trip-route-panel');
  if (!el) return;
  if (_tripPins.length < 2) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  let totalKm = 0;
  let html = '<div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.4px;text-transform:uppercase;margin-bottom:5px">ROUTE DISTANCES</div>';
  for (let i = 1; i < _tripPins.length; i++) {
    const prev = _tripPins[i - 1];
    const cur = _tripPins[i];
    const km = _haversineKm(prev.lat, prev.lng, cur.lat, cur.lng);
    totalKm += km;
    html += '<div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid rgba(201,168,76,0.06);font-size:8px">' +
      '<span style="color:var(--crimson);font-weight:700;flex-shrink:0">' + i + '→' + (i+1) + '</span>' +
      '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dim)">' + _esc(prev.name) + ' → ' + _esc(cur.name) + '</span>' +
      '<span style="color:var(--gold);font-weight:600;white-space:nowrap">' + _dist(km) + '</span>' +
      '</div>';
  }
  html += '<div style="margin-top:5px;text-align:right;font-size:9px;font-weight:700;color:var(--gold)">Total: ' + _dist(totalKm) + '</div>';
  html += _buildBudgetEstimate();
  html += _buildPackingList();
  el.innerHTML = html;
}

function _renderTripPinMarker(pin, index) {
  if (_tripPinMarkers[pin.id]) _tripPinMarkers[pin.id].remove();
  const icon = L.divIcon({
    className: 'trip-pin-icon',
    html: `<div class="trip-pin-marker">
      <div class="trip-pin-bubble"><span class="trip-pin-num">${index + 1}</span></div>
      <div class="trip-pin-stem"></div>
      <div class="trip-pin-shadow"></div>
    </div>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
  });
  const m = L.marker([pin.lat, pin.lng], { icon, pane: 'markersPane', draggable: true });
  m.on('click', ev => {
    // While placing a new pin, clicks on existing pin markers are ignored so the
    // user can position the new pin precisely without accidentally triggering tooltips.
    if (_placingPin) return;
    ev.originalEvent.stopPropagation();
    _featureClicked = true;
    setTimeout(() => { _featureClicked = false; }, 10);

    const idx = _tripPins.findIndex(p => p.id === pin.id);
    // Build tooltip HTML — pin.name is escaped to prevent XSS
    const html = `<div class="tth">
      <h3 id="tt-name">📍 ${_esc(pin.name)}</h3>
      <div class="ts" id="tt-sub">Trip Pin #${idx + 1}</div>
      <div class="tm" id="tt-period">${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}</div>
    </div>
    <div class="ttb" id="tt-body">
      <div id="trip-pin-tooltip-btns" style="display:flex;gap:6px;margin-top:4px">
        <button id="tp-rename-btn" style="flex:1;padding:5px;font-family:var(--fm);font-size:8px;background:rgba(201,168,76,0.08);border:1px solid var(--b1);border-radius:4px;color:var(--gold);cursor:pointer">Rename</button>
        <button id="tp-delete-btn" style="flex:1;padding:5px;font-family:var(--fm);font-size:8px;background:rgba(155,28,46,0.08);border:1px solid rgba(155,28,46,0.3);border-radius:4px;color:#e88888;cursor:pointer">Remove</button>
      </div>
    </div>`;
    toggleTooltip('trip-pin:' + pin.id, html, ev.originalEvent.clientX, ev.originalEvent.clientY);
    // Attach listeners programmatically — never use inline onclick with data from storage
    const ttEl = document.getElementById('tt');
    if (ttEl) {
      const rBtn = ttEl.querySelector('#tp-rename-btn');
      const dBtn = ttEl.querySelector('#tp-delete-btn');
      if (rBtn) rBtn.addEventListener('click', () => _renameTripPin(pin.id));
      if (dBtn) dBtn.addEventListener('click', () => _deleteTripPin(pin.id));
    }
  });
  m.on('dragend', () => {
    const ll = m.getLatLng();
    const p = _tripPins.find(p => p.id === pin.id);
    if (p) { p.lat = ll.lat; p.lng = ll.lng; _saveTripPins(); _updateTripPlannerPanel(); }
  });
  m.addTo(map);
  _tripPinMarkers[pin.id] = m;
}

function _renderAllTripPins() {
  _tripPins.forEach((pin, i) => _renderTripPinMarker(pin, i));
}

function _deleteTripPin(id) {
  _tripPins = _tripPins.filter(p => p.id !== id);
  if (_tripPinMarkers[id]) { _tripPinMarkers[id].remove(); delete _tripPinMarkers[id]; }
  _saveTripPins();
  _updateTripPlannerPanel();
  _reRenderAllPinNumbers();
  const tt = document.getElementById('tt');
  if (tt) tt.style.display = 'none';
}

function _renameTripPin(id) {
  const pin = _tripPins.find(p => p.id === id);
  if (!pin) return;
  // Replace the rename button area with an inline input (non-blocking, mobile-safe)
  const btnArea = document.getElementById('trip-pin-tooltip-btns');
  if (!btnArea) return;
  btnArea.innerHTML = '';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = pin.name;
  input.maxLength = 120;
  input.style.cssText = 'flex:1;background:rgba(14,11,6,0.9);border:1px solid var(--b2);border-radius:4px;color:var(--sand);font-family:var(--fm);font-size:9px;padding:4px 7px;outline:none;min-width:0';
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.style.cssText = 'padding:4px 9px;font-family:var(--fm);font-size:8px;background:rgba(201,168,76,0.12);border:1px solid var(--b2);border-radius:4px;color:var(--gold);cursor:pointer;white-space:nowrap';
  const doSave = () => {
    const v = input.value.trim();
    if (v) {
      pin.name = v.slice(0, 120);
      _saveTripPins();
      _reRenderAllPinNumbers();
      _updateTripPlannerPanel();
    }
    const tt = document.getElementById('tt');
    if (tt) tt.style.display = 'none';
  };
  saveBtn.addEventListener('click', doSave);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSave(); if (e.key === 'Escape') { const tt = document.getElementById('tt'); if (tt) tt.style.display = 'none'; } });
  btnArea.style.display = 'flex';
  btnArea.appendChild(input);
  btnArea.appendChild(saveBtn);
  setTimeout(() => input.focus(), 50);
}

function _reRenderAllPinNumbers() {
  Object.values(_tripPinMarkers).forEach(m => m.remove());
  _tripPinMarkers = {};
  _renderAllTripPins();
}

function _updateTripPlannerPanel() {
  const list = document.getElementById('trip-pin-list');
  if (!list) return;
  list.innerHTML = '';
  if (_tripPins.length === 0) {
    list.innerHTML = '<li style="font-size:8px;color:rgba(201,168,76,0.35);text-align:center;padding:8px 0">No pins placed yet.</li>';
    return;
  }
  _tripPins.forEach((pin, i) => {
    // Build list item using DOM methods — never innerHTML with pin.name (XSS risk)
    const li = document.createElement('li');
    li.className = 'trip-pin-item';

    const numSpan = document.createElement('span');
    numSpan.className = 'trip-pin-item-num';
    numSpan.textContent = i + 1;

    const nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
    nameSpan.textContent = pin.name;   // textContent — safe, no HTML parsing
    nameSpan.addEventListener('click', () => {
      if (map) map.flyTo([pin.lat, pin.lng], Math.max(map.getZoom(), 8), { duration: 0.8 });
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'trip-pin-item-del';
    delBtn.title = 'Remove pin';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => _deleteTripPin(pin.id));

    li.appendChild(numSpan);
    li.appendChild(nameSpan);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
  _buildRoutePanel();
}

function initTripPlanner() {
  _loadTripPins();

  // Add the floating trip planner button
  const floatBtn = document.createElement('button');
  floatBtn.id = 'btn-trip-planner';
  floatBtn.innerHTML = '📍 Trip Planner';
  floatBtn.title = 'Plan your trip with pins';
  document.body.appendChild(floatBtn);

  // Create the trip panel
  const panel = document.createElement('div');
  panel.id = 'trip-panel';
  panel.innerHTML = `
    <div id="trip-panel-title">📍 Trip Planner</div>
    <ol id="trip-pin-list"></ol>
    <div id="trip-panel-actions">
      <button id="btn-add-pin" class="trip-action-btn">+ Add Pin</button>
      <button id="btn-clear-pins" class="trip-action-btn">Clear All</button>
    </div>
    <div id="trip-hint">Click the map while "Add Pin" is active to place a waypoint. Drag pins to reposition.</div>
  `;
  panel.insertAdjacentHTML('beforeend', '<div id="trip-route-panel" style="display:none;margin-top:8px;padding:6px 8px;background:rgba(201,168,76,0.04);border:1px solid rgba(201,168,76,0.10);border-radius:6px"></div>');
  document.body.appendChild(panel);

  // Render existing pins
  _renderAllTripPins();
  _updateTripPlannerPanel();

  // Float button toggles the panel
  floatBtn.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  // Add Pin button
  document.getElementById('btn-add-pin').addEventListener('click', () => {
    _placingPin = !_placingPin;
    document.getElementById('btn-add-pin').classList.toggle('placing', _placingPin);
    document.getElementById('btn-add-pin').textContent = _placingPin ? '🎯 Click Map…' : '+ Add Pin';
    document.getElementById('trip-hint').textContent = _placingPin
      ? 'Click anywhere on the map to place a pin.'
      : 'Click "Add Pin" to start placing waypoints.';
    if (map) map.getContainer().style.cursor = _placingPin ? 'crosshair' : '';
  });

  // Clear All button — two-click confirmation (no blocking window.confirm)
  let _clearPending = false;
  document.getElementById('btn-clear-pins').addEventListener('click', () => {
    if (_tripPins.length === 0) return;
    if (!_clearPending) {
      _clearPending = true;
      const btn = document.getElementById('btn-clear-pins');
      btn.textContent = 'Tap again to confirm';
      btn.style.color = '#e88888';
      setTimeout(() => {
        _clearPending = false;
        if (btn) { btn.textContent = 'Clear All'; btn.style.color = ''; }
      }, 2500);
      return;
    }
    _clearPending = false;
    _tripPins.forEach(p => { if (_tripPinMarkers[p.id]) _tripPinMarkers[p.id].remove(); });
    _tripPins = [];
    _tripPinMarkers = {};
    _saveTripPins();
    _updateTripPlannerPanel();
    const btn = document.getElementById('btn-clear-pins');
    if (btn) { btn.textContent = 'Clear All'; btn.style.color = ''; }
  });

  // Share button — copies current URL (with encoded pins) to clipboard
  const shareBtn = document.createElement('button');
  shareBtn.id = 'btn-share-trip';
  shareBtn.className = 'trip-action-btn';
  shareBtn.textContent = '📤 Share';
  shareBtn.style.cssText = 'background:rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.25);color:#38bdf8;';
  shareBtn.addEventListener('click', function() {
    if (_tripPins.length === 0) { shareBtn.textContent = 'No pins!'; setTimeout(function(){shareBtn.textContent='📤 Share';},1500); return; }
    updateURLState();
    try {
      navigator.clipboard.writeText(window.location.href).then(function() {
        shareBtn.textContent = '✓ Copied!';
        setTimeout(function(){ shareBtn.textContent = '📤 Share'; }, 2000);
      });
    } catch(_e) { shareBtn.textContent = '📤 Share'; }
  });
  document.getElementById('trip-panel-actions').appendChild(shareBtn);

  // Packing List button — toggles the floating packing panel
  const packingBtn = document.createElement('button');
  packingBtn.id = 'btn-packing-list';
  packingBtn.className = 'trip-action-btn';
  packingBtn.textContent = 'Packing List';
  packingBtn.style.cssText = 'background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.25);color:var(--gold);';
  packingBtn.addEventListener('click', function() { _togglePackingPanel(); });
  document.getElementById('trip-panel-actions').appendChild(packingBtn);

  // Share Trip card button — copies a human-readable trip card to clipboard
  const shareTripCardBtn = document.createElement('button');
  shareTripCardBtn.id = 'btn-share-trip-card';
  shareTripCardBtn.className = 'trip-action-btn';
  shareTripCardBtn.textContent = '📤 Share Trip';
  shareTripCardBtn.style.cssText = 'background:rgba(236,72,153,0.08);border:1px solid rgba(236,72,153,0.25);color:#f472b6;';
  shareTripCardBtn.addEventListener('click', function() { _shareTrip(); });
  document.getElementById('trip-panel-actions').appendChild(shareTripCardBtn);

  // Map click handler — place pin when _placingPin is active.
  // Guard: if a Leaflet feature (country polygon, POI marker) was clicked, that
  // handler sets _featureClicked=true for 10 ms. We skip placement in that window
  // to prevent placing a pin AND opening a country tooltip simultaneously.
  if (map) {
    map.on('click', e => {
      if (!_placingPin || _featureClicked) return;
      const name = `Pin ${_tripPins.length + 1}`;
      const pin = { id: 'tp_' + Date.now(), lat: e.latlng.lat, lng: e.latlng.lng, name };
      _tripPins.push(pin);
      _saveTripPins();
      _renderTripPinMarker(pin, _tripPins.length - 1);
      _updateTripPlannerPanel();
      _placingPin = false;
      const addBtn = document.getElementById('btn-add-pin');
      if (addBtn) { addBtn.classList.remove('placing'); addBtn.textContent = '+ Add Pin'; }
      const hint = document.getElementById('trip-hint');
      if (hint) hint.textContent = 'Click "Add Pin" to place more waypoints. Drag pins to reposition.';
      if (map) map.getContainer().style.cursor = '';
    });
  }
}

let _ttX = 0, _ttY = 0;

// ─── Comparison panel state ───────────────────────────────────────────────────
let pinnedCountries = [];   // ordered list of ISO-2 codes pinned to comparison

// ─── Map Init ────────────────────────────────────────────────────────────────
function initMap() {
  // #map is a flex child of <body> — it fills exactly the space below #topbar.
  // No JS height calculation needed; CSS flexbox handles it automatically.
  map = L.map('map', {
    center: [22, 14],
    zoom: 3,
    minZoom: 2,
    maxZoom: 18,
    worldCopyJump: true,        // snap back to primary copy when panning past ±180°
    maxBoundsViscosity: 0.85,   // resist panning into blank polar/edge areas
    preferCanvas: false,
  });
  window.naMap = map;   // expose Leaflet instance (window.map is the #map div) for URL view-state + tests

  // Prevent zooming out past the point where the full world is visible.
  // Recalculates on every resize so it works correctly across screen sizes.
  // Deferred via map.whenReady() so Leaflet has performed a layout pass and
  // map.getSize() returns real pixel dimensions (not {x:0,y:0}).
  function lockWorldMinZoom() {
    const worldBounds = L.latLngBounds([-75, -180], [83, 180]);
    const z = map.getBoundsZoom(worldBounds);
    if (z > 0) map.setMinZoom(z);   // guard: ignore degenerate zero-size result
  }
  map.whenReady(lockWorldMinZoom);
  map.on('resize', lockWorldMinZoom);

  // climatePane sits BELOW all choropleth panes — climate-zone polygons are
  // a background texture; country/province/county fills render above them.
  map.createPane('climatePane');
  map.getPane('climatePane').style.zIndex = '290';
  map.getPane('climatePane').style.pointerEvents = 'auto';

  // admin2Pane: county/municipality fills sit above climate zones but below
  // province/country fills so province borders remain visually dominant.
  map.createPane('admin2Pane');
  map.getPane('admin2Pane').style.zIndex = '295';
  map.getPane('admin2Pane').style.pointerEvents = 'auto';

  map.createPane('choroplethPane');
  map.getPane('choroplethPane').style.zIndex = '300';
  map.getPane('choroplethPane').style.pointerEvents = 'auto';

  map.createPane('politicalPane');
  map.getPane('politicalPane').style.zIndex = '350';
  map.getPane('politicalPane').style.pointerEvents = 'auto';

  map.createPane('markersPane');
  map.getPane('markersPane').style.zIndex = '400';

  map.createPane('transportPane');
  map.getPane('transportPane').style.zIndex = '310';
  map.getPane('transportPane').style.pointerEvents = 'none';

  // parkPane: green vector park borders sit above the transport tile overlay but
  // below markers so they are interactive without blocking city / border markers.
  map.createPane('parkPane');
  map.getPane('parkPane').style.zIndex = '320';
  map.getPane('parkPane').style.pointerEvents = 'auto';

  map.createPane('labelPane');
  map.getPane('labelPane').style.zIndex = '450';
  map.getPane('labelPane').style.pointerEvents = 'none';

  // Invalidate Leaflet's tile cache when the window is resized (orientation
  // change, panel resize) so tiles fill the new dimensions cleanly.
  window.addEventListener('resize', () => { if (map) map.invalidateSize(); }, { passive: true });

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri | Admin-2 boundaries: <a href="https://www.geoboundaries.org">geoBoundaries</a> (CC-BY 4.0)',
    maxZoom: 19,
    // Fallback: if Esri tiles fail to load, error events are silent (best effort)
    errorTileUrl: '',
  }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 20,
    opacity: 0.7,
    pane: 'labelPane',
  }).addTo(map);
}

// ─── Month Selector ───────────────────────────────────────────────────────────
function buildMonthSelector() {
  const container = document.getElementById('months');
  let dragging = false;
  let dragStart = null;

  MONTHS.forEach((m, i) => {
    const btn = document.createElement('button');
    btn.className = 'mb';
    btn.textContent = m;
    btn.dataset.idx = i;

    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      dragging = true;
      dragStart = i;
      setMonth(i);
    });

    btn.addEventListener('mouseover', () => {
      if (!dragging) return;
      const a = Math.min(dragStart, i);
      const b = Math.max(dragStart, i);
      selectedMonths = new Set();
      for (let j = a; j <= b; j++) selectedMonths.add(j);
      yearMode = false;
      activeMonth = dragStart;
      syncMonthButtons();
      refresh();
    });

    container.appendChild(btn);
  });

  const yearBtn = document.createElement('button');
  yearBtn.id = 'btn-year';
  yearBtn.textContent = 'ALL YEAR';
  yearBtn.addEventListener('click', () => {
    yearMode = !yearMode;
    if (yearMode) {
      selectedMonths = new Set([0,1,2,3,4,5,6,7,8,9,10,11]);
    } else {
      selectedMonths = new Set([activeMonth]);
    }
    syncMonthButtons();
    refresh();
  });
  container.appendChild(yearBtn);

  document.addEventListener('mouseup', () => { dragging = false; dragStart = null; });

  syncMonthButtons();
}

function setMonth(i) {
  activeMonth = i;
  yearMode = false;
  selectedMonths = new Set([i]);
  syncMonthButtons();
  refresh();
  if (POI_LAYERS.holidays && POI_LAYERS.holidays.active) _renderHolidayMarkers();
  updateURLState();
  saveState();
}

function syncMonthButtons() {
  const btns = document.querySelectorAll('.mb');
  btns.forEach(btn => {
    const i = parseInt(btn.dataset.idx);
    btn.classList.remove('on', 'range');
    if (yearMode) {
      btn.classList.add('range');
    } else if (selectedMonths.size === 1 && selectedMonths.has(i)) {
      btn.classList.add('on');
    } else if (selectedMonths.size > 1 && selectedMonths.has(i)) {
      const arr = [...selectedMonths].sort((a,b) => a-b);
      if (i === arr[0] || i === arr[arr.length-1]) btn.classList.add('on');
      else btn.classList.add('range');
    }
  });
  const yearBtn = document.getElementById('btn-year');
  if (yearBtn) yearBtn.classList.toggle('on', yearMode);
}

// ─── Layer Buttons ────────────────────────────────────────────────────────────
// Primary layers always visible in the topbar row.
const PRIMARY_LAYER_KEYS = ['weather','safety','cost','internet','visa'];
// All secondary layer keys (kept for reference / legacy functions).
const SECONDARY_LAYER_KEYS = ['health','beaches','family','solo','remote','crowds','corrupt','disaster','lgbtq','vaccines','road'];

// Category groups — each becomes a dropdown button in the topbar row.
const CAT_GROUPS = [
  { id:'health-safety', label:'Health & Safety', emoji:'💊', keys:['health','vaccines','road','corrupt','disaster','healthcare','femalesafety','malaria'] },
  { id:'lifestyle',     label:'Lifestyle',       emoji:'👤', keys:['solo','lgbtq','family','remote','kids','cannabis','nomad','nightlife'] },
  { id:'local-info',    label:'Local Info',      emoji:'ℹ',  keys:['english','tapwater','airquality','scam','tipping'] },
  // 'parks' removed from keys: choropleth data (CD_PARKS) does not yet exist.
  // The 🌲 Parks tile overlay in the Transport dropdown covers the visual use case.
  { id:'environment',   label:'Environment',     emoji:'🌿', keys:['beaches','crowds'] },
];

function makeLbButton(key, layer) {
  const btn = document.createElement('button');
  btn.className = 'lb' + (activeLayers.has(key) ? ' on' : '');
  btn.dataset.key = key;
  if (layer.color) btn.style.setProperty('--lb-color', layer.color);
  const emoji = document.createElement('span');
  emoji.className = 'lb-emoji';
  emoji.textContent = layer.emoji;
  const name  = document.createElement('span');
  name.className = 'lb-name';
  name.textContent = layer.name;
  btn.appendChild(emoji);
  btn.appendChild(name);
  btn.addEventListener('click', () => {
    if (activeLayers.has(key)) activeLayers.delete(key);
    else activeLayers.add(key);
    btn.classList.toggle('on', activeLayers.has(key));
    syncMoreButtonState();
    refresh();
    _renderNYCCrime();
    updateURLState();
    saveState();
  });
  return btn;
}

function syncMoreButtonState() {
  // Legacy stub — kept so any saved references don't throw.
  // Category buttons now handle their own active state.
}
function syncCatButtons() {
  CAT_GROUPS.forEach(group => {
    const btn = document.getElementById('cat-btn-' + group.id);
    if (!btn) return;
    const anyOn = group.keys.some(k => activeLayers.has(k));
    btn.classList.toggle('has-active', anyOn);
  });
}

function initVisaPassportGroup() {
  // Move the Visa Access layer button out of the primary layers row
  // and into the dedicated Visa & Passport group for visual clarity.
  const wrap = document.getElementById('visa-btn-wrap');
  if (!wrap) return;
  const visaBtn = document.querySelector('.lb[data-key="visa"]');
  if (visaBtn) wrap.appendChild(visaBtn);
}

function buildLayerButtons() {
  const container = document.getElementById('layers');

  // ── Primary layer buttons ──────────────────────────────────────────────────
  PRIMARY_LAYER_KEYS.forEach(key => {
    const layer = LAYERS[key];
    if (!layer) return;
    container.appendChild(makeLbButton(key, layer));
  });

  // ── Category dropdown buttons (one per group) ──────────────────────────────
  CAT_GROUPS.forEach(group => {
    const catBtn = document.createElement('button');
    catBtn.id = 'cat-btn-' + group.id;
    catBtn.className = 'cat-btn';
    catBtn.innerHTML = `<span>${group.emoji}</span><span>${group.label}</span><span style="font-size:7px;opacity:0.6">▾</span>`;
    const anyOn = group.keys.some(k => activeLayers.has(k));
    catBtn.classList.toggle('has-active', anyOn);

    const catDd = document.createElement('div');
    catDd.id = 'cat-dd-' + group.id;
    catDd.className = 'cat-dropdown';
    catDd.style.cssText = 'position:fixed;z-index:1600;background:var(--panel);border:1px solid var(--b2);border-radius:10px;padding:10px;display:none;flex-direction:column;gap:4px;min-width:185px;max-width:250px;box-shadow:0 10px 36px rgba(0,0,0,.88);backdrop-filter:blur(20px);max-height:80vh;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(201,168,76,0.3) transparent';
    document.body.appendChild(catDd);

    // Group header label
    const lbl = document.createElement('div');
    lbl.className = 'more-dropdown-label';
    lbl.textContent = group.label;
    catDd.appendChild(lbl);

    // Layer buttons for this group
    group.keys.forEach(key => {
      const layer = LAYERS[key];
      if (!layer) return;
      const lb = makeLbButton(key, layer);
      lb.addEventListener('click', () => syncCatButtons());
      catDd.appendChild(lb);
    });

    catBtn.addEventListener('click', e => {
      e.stopPropagation();
      _openDropdown(catDd, catBtn);
    });

    container.appendChild(catBtn);
  });

  // ── 🛂 Borders (standalone — was inside Overlays dropdown) ────────────────
  const borderBtn = document.createElement('button');
  borderBtn.id = 'btn-borders';
  borderBtn.className = 'lb';
  borderBtn.innerHTML = '<span class="lb-emoji">🛂</span><span class="lb-name">Borders</span>';
  borderBtn.classList.toggle('on', showBorders);
  borderBtn.addEventListener('click', () => {
    showBorders = !showBorders;
    borderBtn.classList.toggle('on', showBorders);
    renderBorderMarkers();
    updateLegend();
    syncCatButtons();
  });
  container.appendChild(borderBtn);

  // ── 🗺 Political (last — most users leave this on and never touch it) ──────
  const politicalBtn = document.createElement('button');
  politicalBtn.id = 'btn-political';
  politicalBtn.className = 'lb';
  politicalBtn.innerHTML = '<span class="lb-emoji">🗺</span><span class="lb-name">Political</span>';
  politicalBtn.classList.toggle('on', showPolitical);
  politicalBtn.addEventListener('click', () => {
    showPolitical = !showPolitical;
    politicalBtn.classList.toggle('on', showPolitical);
    renderPoliticalLayers();
    updateLegend();
  });
  container.appendChild(politicalBtn);

  // Close all category dropdowns when clicking outside any of them
  if (!buildLayerButtons._catCloseAdded) {
    buildLayerButtons._catCloseAdded = true;
    document.addEventListener('click', e => {
      if (!e.target.closest('.cat-dropdown') && !e.target.closest('.cat-btn')) {
        document.querySelectorAll('.cat-dropdown').forEach(dd => { dd.style.display = 'none'; });
      }
    });
  }
}

// ─── Unit / Currency / Language Topbar Buttons ───────────────────────────────
function buildUnitButtons() {
  var row2 = document.getElementById('tb-row2');
  if (!row2) return;

  var wrap = document.createElement('div');
  wrap.id = 'unit-btn-wrap';
  wrap.style.cssText = 'display:flex;align-items:center;gap:4px;margin-left:4px;flex-shrink:0';

  var btnStyle = 'font-size:8px;color:var(--gold);background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.22);border-radius:4px;padding:3px 7px;cursor:pointer;font-family:var(--fm);letter-spacing:0.5px;line-height:1.4;transition:border-color 0.15s,background 0.15s;white-space:nowrap';
  var hoverIn  = function(e){ e.currentTarget.style.background='rgba(201,168,76,0.18)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.6)'; };
  var hoverOut = function(e){ e.currentTarget.style.background='rgba(201,168,76,0.08)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.22)'; };

  var distBtn = document.createElement('button');
  distBtn.id = 'btn-dist-unit';
  distBtn.setAttribute('style', btnStyle);
  distBtn.setAttribute('title', 'Toggle distance unit (km / mi)');
  distBtn.textContent = _distUnit === 'km' ? 'km' : 'mi';
  distBtn.addEventListener('click', _toggleDistUnit);
  distBtn.addEventListener('mouseenter', hoverIn);
  distBtn.addEventListener('mouseleave', hoverOut);

  var currBtn = document.createElement('button');
  currBtn.id = 'btn-currency';
  currBtn.setAttribute('style', btnStyle);
  currBtn.setAttribute('title', 'Cycle currency');
  currBtn.textContent = _currCode;
  currBtn.addEventListener('click', _cycleCurrency);
  currBtn.addEventListener('mouseenter', hoverIn);
  currBtn.addEventListener('mouseleave', hoverOut);

  var langBtn = document.createElement('button');
  langBtn.id = 'btn-lang';
  langBtn.setAttribute('style', btnStyle);
  langBtn.setAttribute('title', 'Cycle interface language');
  langBtn.textContent = ({en:'🌐 EN', es:'🌐 ES', fr:'🌐 FR', de:'🌐 DE'}[_lang] || '🌐');
  langBtn.addEventListener('click', _cycleLang);
  langBtn.addEventListener('mouseenter', hoverIn);
  langBtn.addEventListener('mouseleave', hoverOut);

  wrap.appendChild(distBtn);
  wrap.appendChild(currBtn);
  wrap.appendChild(langBtn);
  row2.appendChild(wrap);
}

// ─── Transport Layer Buttons (single dropdown) ────────────────────────────────
let timezoneLayer     = null;   // UTC meridian line labels overlay
let timezoneChoroLayer = null;  // country choropleth colored by UTC offset
let _tzActive          = false; // module-scope flag; read by updateLegend / syncTransportBtn

// Maps UTC offset [-12, +14] to a distinct HSL hue.
// 9 highly saturated, perceptually distinct base colors.
// Adjacent UTC offsets (±1h) always fall in different palette slots because
// (offset+12) % 9 steps by 1 each hour — the cycle length (9) is > 1.
// This guarantees no two neighboring zones share the same hue.
const TZ_PALETTE = [
  '#ef4444', // 0  vivid red
  '#f97316', // 1  orange
  '#eab308', // 2  amber
  '#22c55e', // 3  green
  '#06b6d4', // 4  cyan
  '#3b82f6', // 5  blue
  '#a855f7', // 6  purple
  '#ec4899', // 7  pink/magenta
  '#84cc16', // 8  lime
];
function tzOffsetColor(offset) {
  if (offset === null || offset === undefined) return '#1e1b14';
  const idx = ((Math.round(offset) + 12) % 9 + 9) % 9;
  return TZ_PALETTE[idx];
}

function toggleTimezoneLayer(active) {
  _tzActive = active;

  // ── Country choropleth: color each country by its UTC offset ──────────────
  if (timezoneChoroLayer) { timezoneChoroLayer.remove(); timezoneChoroLayer = null; }
  if (active && _geoData) {
    timezoneChoroLayer = L.geoJSON(_geoData, {
      pane: 'choroplethPane',
      interactive: false,   // clicks pass through to geojsonLayer below
      style: feature => {
        const iso2   = getIso2(feature.properties);
        const offset = (typeof CD_TIMEZONE !== 'undefined' && CD_TIMEZONE[iso2] !== undefined)
                       ? CD_TIMEZONE[iso2] : null;
        return {
          fillColor:   tzOffsetColor(offset),
          fillOpacity: 0.75,
          color:       'rgba(255,255,255,0.15)',
          weight:      0.4,
        };
      },
    }).addTo(map);
  }

  // ── UTC meridian lines + labels (subtle, on labelPane) ───────────────────
  if (timezoneLayer) { timezoneLayer.remove(); timezoneLayer = null; }
  if (!active || !map) { updateLegend(); return; }
  const g = L.layerGroup();
  for (let lng = -165; lng <= 180; lng += 15) {
    const h   = Math.round(lng / 15);
    const lbl = h === 0 ? 'UTC' : `UTC${h > 0 ? '+' : ''}${h}`;
    L.polyline([[-80, lng], [83, lng]], {
      color: 'rgba(201,168,76,0.18)', weight: 1,
      dashArray: '4,8', interactive: false, pane: 'labelPane',
    }).addTo(g);
    L.marker([76, lng - 7.5], {
      icon: L.divIcon({
        html: `<div style="color:rgba(201,168,76,0.55);font-size:7.5px;font-family:'IBM Plex Mono',monospace;white-space:nowrap;transform:translateX(-50%);text-shadow:0 1px 3px rgba(0,0,0,.9);pointer-events:none">${lbl}</div>`,
        className: '', iconAnchor: [0, 0],
      }),
      interactive: false, pane: 'labelPane',
    }).addTo(g);
  }
  g.addTo(map);
  timezoneLayer = g;
  updateLegend();
}

function toggleElevationLayer(active) {
  if (active) {
    if (!_elevationTileLayer && map) {
      _elevationTileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '© OpenTopoMap (CC-BY-SA)',
        opacity: 0.65,
        pane: 'choroplethPane',
      }).addTo(map);
    }
  } else {
    if (_elevationTileLayer) {
      _elevationTileLayer.remove();
      _elevationTileLayer = null;
    }
  }
}

function syncTransportBtn() {
  const btn = document.getElementById('btn-transport-menu');
  if (btn) {
    const anyTransportOn = Object.values(TRANSPORT_LAYERS).some(d => d.active) || _tzActive;
    btn.classList.toggle('has-active', anyTransportOn);
  }
  const exploreBtn = document.getElementById('btn-explore-menu');
  if (exploreBtn) {
    const anyPOIOn = Object.values(POI_LAYERS).some(d => d.active);
    exploreBtn.classList.toggle('has-active', anyPOIOn);
  }
}

// Helper: create a scrollable dropdown panel attached to document.body
function _makeDropdown(id) {
  const dd = document.createElement('div');
  dd.id = id;
  dd.className = 'cat-dropdown';
  dd.style.cssText = [
    'position:fixed;z-index:1600;background:var(--panel);border:1px solid var(--b2)',
    'border-radius:10px;padding:10px;display:none;flex-direction:column;gap:4px',
    'min-width:210px;max-width:260px;box-shadow:0 10px 36px rgba(0,0,0,.88)',
    'backdrop-filter:blur(20px);max-height:80vh;overflow-y:auto',
    'scrollbar-width:thin;scrollbar-color:rgba(201,168,76,0.3) transparent',
  ].join(';');
  document.body.appendChild(dd);
  return dd;
}

function _openDropdown(dd, btn) {
  const isOpen = dd.style.display === 'flex';
  document.querySelectorAll('.cat-dropdown').forEach(d => { d.style.display = 'none'; });
  if (!isOpen) {
    dd.style.display = 'flex';
    const r = btn.getBoundingClientRect();
    const availH = window.innerHeight - r.bottom - 10;
    dd.style.maxHeight = Math.min(availH, window.innerHeight * 0.8) + 'px';
    dd.style.top  = (r.bottom + 5) + 'px';
    dd.style.left = Math.min(r.left, window.innerWidth - 220) + 'px';
  }
}

function buildTransportButtons() {
  const container = document.getElementById('transport');

  // ── Transport dropdown ─────────────────────────────────────────────────────
  const transpBtn = document.createElement('button');
  transpBtn.id = 'btn-transport-menu';
  transpBtn.className = 'cat-btn';
  transpBtn.innerHTML = '<span>🚗</span><span>Transport</span><span style="font-size:7px;opacity:0.6">▾</span>';

  const transpDd = _makeDropdown('transport-dropdown');

  const transpLabel = document.createElement('div');
  transpLabel.className = 'more-dropdown-label';
  transpLabel.textContent = 'Transport Layers';
  transpDd.appendChild(transpLabel);

  // Transport tile layers
  Object.entries(TRANSPORT_LAYERS).forEach(([key, def]) => {
    const btn = document.createElement('button');
    btn.id = `btn-t-${key}`;
    btn.className = 'lb';
    btn.innerHTML = `<span class="lb-emoji">${def.label.match(/^./u)[0]}</span><span class="lb-name">${def.label.replace(/^.\s*/u,'')}</span>`;
    btn.classList.toggle('on', def.active);
    btn.addEventListener('click', () => {
      def.active = !def.active;
      btn.classList.toggle('on', def.active);
      if (def.active) {
        if (key === 'roads') {
          _fetchAndRenderRoads();
          const st = document.getElementById('map-status');
          if (st && map && map.getZoom() < 9) { st.textContent = '🛣 Roads: zoom to level 9+ to render colored road vectors. Click any road for name and type.'; st.style.display='block'; setTimeout(()=>{st.style.display='none';},7000); }
        } else if (def.vector) {
          _fetchAndRenderParkBorders();
        } else {
          if (!def.layer) {
            if (key === 'wildfires') {
              // NASA GIBS WMTS — VIIRS Suomi-NPP thermal anomaly detections.
              // Layer name changed from retired VIIRS_SNPP_Fires_375m to current
              // VIIRS_SNPP_Thermal_Anomalies_375m_All (verified 2026-06-02 via GetCapabilities).
              // TileMatrixSet for this layer is GoogleMapsCompatible_Level8 (max zoom 8).
              // 404 responses are expected for tiles with no fire detections — Leaflet
              // silently skips missing tiles, so the overlay remains transparent over
              // calm areas and only lights up red where hotspots are detected.
              const d  = new Date(); d.setUTCDate(d.getUTCDate() - 1);
              const ds = d.toISOString().slice(0, 10);
              def.url  = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_Thermal_Anomalies_375m_All/default/${ds}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png`;
            }
            def.layer = L.tileLayer(def.url, { pane: 'transportPane', ...def.opts });
          }
          def.layer.addTo(map);
        }
        if (key === 'maritime') {
          const st = document.getElementById('map-status');
          if (st) { st.textContent = '⚓ Maritime: zoom into coastlines and port areas to see navigation buoys, lights, shipping lanes and harbour marks.'; st.style.display='block'; setTimeout(()=>{st.style.display='none';},8000); }
        }
        if (key === 'wildfires') {
          const st = document.getElementById('map-status');
          if (st) { st.textContent = '🔥 Wildfires: showing NASA VIIRS thermal anomaly detections from yesterday. Tiles only appear where active hotspots were detected.'; st.style.display='block'; setTimeout(()=>{st.style.display='none';},8000); }
        }
        if (key === 'natparks') {
          const st = document.getElementById('map-status');
          if (st) { st.textContent = '🌲 Parks: zoom in to zoom level 5+ to see national park and nature reserve boundaries.'; st.style.display='block'; setTimeout(()=>{st.style.display='none';},6000); }
        }
        if (key === 'rail') _fetchAndRenderRailStops();
        if (key === 'trails') _refreshLinkedCamping();
      } else {
        if (key === 'roads') {
          _clearRoads();
        } else if (def.vector) {
          _clearParkBorders();
        } else if (def.layer) {
          def.layer.remove();
        }
        if (key === 'rail') { _clearRailStops(); _railStopCache = {}; }
        if (key === 'trails') _refreshLinkedCamping();
      }
      syncTransportBtn();
      updateLegend();
    });
    transpDd.appendChild(btn);
  });

  // Timezone overlay toggle
  const tzSep = document.createElement('div');
  tzSep.className = 'more-dropdown-label';
  tzSep.style.marginTop = '6px';
  tzSep.textContent = 'Map Overlays';
  transpDd.appendChild(tzSep);

  const tzBtn = document.createElement('button');
  tzBtn.id = 'btn-timezone-overlay';
  tzBtn.className = 'lb';
  tzBtn.innerHTML = '<span class="lb-emoji">🕐</span><span class="lb-name">Timezones</span>';
  tzBtn.addEventListener('click', () => {
    toggleTimezoneLayer(!_tzActive);
    tzBtn.classList.toggle('on', _tzActive);
    syncTransportBtn();
  });
  transpDd.appendChild(tzBtn);

  transpBtn.addEventListener('click', e => {
    e.stopPropagation();
    _openDropdown(transpDd, transpBtn);
  });
  container.appendChild(transpBtn);

  // ── Explore dropdown (separate from transport) ─────────────────────────────
  const exploreBtn = document.createElement('button');
  exploreBtn.id = 'btn-explore-menu';
  exploreBtn.className = 'cat-btn';
  exploreBtn.innerHTML = '<span>🔍</span><span>Explore</span><span style="font-size:7px;opacity:0.6">▾</span>';

  const exploreDd = _makeDropdown('explore-dropdown');

  // Group POI layers by theme
  const POI_GROUPS = [
    { label: 'Nature',      keys: ['parks','camping','viewpoints','hotsprings','birdwatching','toilets','drinkwater','wildlife'] },
    { label: 'Adventure',   keys: ['climbing','surfing','diving'] },
    { label: 'Travel Info', keys: ['holidays','airports','attractions','hospitals','gasstations'] },
  ];

  POI_GROUPS.forEach(group => {
    const sep = document.createElement('div');
    sep.className = 'more-dropdown-label';
    sep.textContent = group.label;
    exploreDd.appendChild(sep);

    group.keys.forEach(key => {
      const def = POI_LAYERS[key];
      if (!def) return;
      const pbtn = document.createElement('button');
      pbtn.id = `btn-poi-${key}`;
      pbtn.className = 'lb';
      pbtn.innerHTML = `<span class="lb-emoji">${[...def.label][0]}</span><span class="lb-name">${def.label.replace(/^\S+\s*/u, '')}</span>`;
      pbtn.classList.toggle('on', def.active);
      pbtn.addEventListener('click', () => {
        def.active = !def.active;
        pbtn.classList.toggle('on', def.active);
        if (key === 'holidays') {
          if (def.active) _renderHolidayMarkers();
          else _clearHolidayMarkers();
          syncTransportBtn();
          updateLegend();
          return;
        }
        if (def.active) {
          _fetchAndRenderPOI(key);
          if (key === 'parks') _refreshLinkedCamping();
        } else {
          _clearPOIMarkers(key);
          if (key === 'parks') _refreshLinkedCamping();
        }
        syncTransportBtn();
        updateLegend();
      });
      exploreDd.appendChild(pbtn);
    });
  });

  exploreBtn.addEventListener('click', e => {
    e.stopPropagation();
    _openDropdown(exploreDd, exploreBtn);
  });
  container.appendChild(exploreBtn);
}

// ─── Rating Helpers ───────────────────────────────────────────────────────────
function getRating(arr) {
  if (!arr) return null;
  if (yearMode) return Math.round(arr.reduce((a, b) => a + b, 0) / 12);
  if (selectedMonths.size === 1) return arr[activeMonth];
  let sum = 0;
  selectedMonths.forEach(m => sum += arr[m]);
  return Math.round(sum / selectedMonths.size);
}

function getCountryRating(iso2) {
  const d = CD[iso2];
  if (!d) return null;
  const layers = [...activeLayers];
  if (layers.length === 0) return null;
  const ratings = layers.map(lk => {
    // Scalar tables are the primary source; fall back to 12-month CD arrays so
    // countries with array data but no scalar entry still get a choropleth color.
    if (lk === 'cost') {
      if (typeof CD_COST !== 'undefined' && CD_COST[iso2] != null) return CD_COST[iso2];
      return d && d.cost != null ? getRating(d.cost) : null;
    }
    if (lk === 'safety') {
      if (typeof CD_SAFETY !== 'undefined' && CD_SAFETY[iso2] != null) return CD_SAFETY[iso2];
      return d && d.safety != null ? getRating(d.safety) : null;
    }
    if (lk === 'internet') {
      if (typeof CD_INTERNET !== 'undefined' && CD_INTERNET[iso2] != null) return CD_INTERNET[iso2];
      return d && d.remote != null ? getRating(d.remote) : null;  // remote work quality as proxy
    }
    if (lk === 'kids') {
      if (typeof CD_KIDS !== 'undefined' && CD_KIDS[iso2] != null) return CD_KIDS[iso2];
      return d && d.family != null ? getRating(d.family) : null;  // family rating as proxy
    }
    if (lk === 'cannabis') {
      if (typeof CD_CANNABIS !== 'undefined' && CD_CANNABIS[iso2] != null) return CD_CANNABIS[iso2];
      return null;
    }
    if (lk === 'nomad') {
      if (typeof CD_NOMAD !== 'undefined' && CD_NOMAD[iso2] != null) return CD_NOMAD[iso2];
      return null;
    }
    if (lk === 'english') { if (typeof CD_ENGLISH !== 'undefined' && CD_ENGLISH[iso2] != null) return CD_ENGLISH[iso2]; return null; }
    if (lk === 'healthcare') { if (typeof CD_HEALTHCARE !== 'undefined' && CD_HEALTHCARE[iso2] != null) return CD_HEALTHCARE[iso2]; return null; }
    if (lk === 'tapwater') { if (typeof CD_TAPWATER !== 'undefined' && CD_TAPWATER[iso2] != null) return CD_TAPWATER[iso2]; return null; }
    if (lk === 'airquality') { if (typeof CD_AIRQUALITY !== 'undefined' && CD_AIRQUALITY[iso2] != null) return CD_AIRQUALITY[iso2]; return null; }
    if (lk === 'femalesafety') { if (typeof CD_FEMALE_SAFETY !== 'undefined' && CD_FEMALE_SAFETY[iso2] != null) return CD_FEMALE_SAFETY[iso2]; return null; }
    if (lk === 'nightlife') { if (typeof CD_NIGHTLIFE !== 'undefined' && CD_NIGHTLIFE[iso2] != null) return CD_NIGHTLIFE[iso2]; return null; }
    if (lk === 'scam') { if (typeof CD_SCAM !== 'undefined' && CD_SCAM[iso2] != null) return CD_SCAM[iso2]; return null; }
    if (lk === 'malaria') { if (typeof CD_MALARIA !== 'undefined' && CD_MALARIA[iso2] != null) return CD_MALARIA[iso2]; return null; }
    if (lk === 'tipping') {
      if (typeof CD_TIPPING !== 'undefined' && CD_TIPPING[iso2] != null) return CD_TIPPING[iso2];
      return null;
    }
    if (lk === 'visa')     return selectedNationality ? getVisaRating(iso2, selectedNationality) : null;
    if (lk === 'strength') return selectedNationality ? getStrengthRating(iso2) : null;
    const arr = d ? d[lk] : null;
    return arr != null ? getRating(arr) : null;
  }).filter(v => v !== null);
  if (ratings.length === 0) return null;
  // Worst-case aggregation: show the most severe rating across all active layers.
  return Math.max(...ratings);
}

// Like getCountryRating but checks CD_A1[subCode] first for province-specific
// data, then falls back to CD[parentIso2] for any layer not overridden.
// Uses worst-case aggregation (Math.max) — same rationale as getCountryRating.
function getAdmin1Rating(subCode, parentIso2) {
  const d1 = subCode ? CD_A1[subCode] : null;
  const d2 = CD[parentIso2];
  if (!d1 && !d2) return null;
  const layers = [...activeLayers];
  if (layers.length === 0) return null;
  const ratings = layers.map(lk => {
    if (lk === 'cost') {
      if (typeof CD_COST !== 'undefined' && CD_COST[parentIso2] != null) return CD_COST[parentIso2];
      return d2 && d2.cost != null ? getRating(d2.cost) : null;
    }
    if (lk === 'safety') {
      if (typeof CD_SAFETY !== 'undefined' && CD_SAFETY[parentIso2] != null) return CD_SAFETY[parentIso2];
      return d2 && d2.safety != null ? getRating(d2.safety) : null;
    }
    if (lk === 'internet') {
      if (typeof CD_INTERNET !== 'undefined' && CD_INTERNET[parentIso2] != null) return CD_INTERNET[parentIso2];
      return d2 && d2.remote != null ? getRating(d2.remote) : null;
    }
    if (lk === 'kids') {
      if (typeof CD_KIDS !== 'undefined' && CD_KIDS[parentIso2] != null) return CD_KIDS[parentIso2];
      return d2 && d2.family != null ? getRating(d2.family) : null;
    }
    if (lk === 'cannabis') {
      if (d1 && d1.cannabis != null) return d1.cannabis;          // state-level override (e.g. US state laws)
      if (typeof CD_CANNABIS !== 'undefined' && CD_CANNABIS[parentIso2] != null) return CD_CANNABIS[parentIso2];
      return null;
    }
    if (lk === 'nomad') {
      if (typeof CD_NOMAD !== 'undefined' && CD_NOMAD[parentIso2] != null) return CD_NOMAD[parentIso2];
      return null;
    }
    if (lk === 'english') { if (typeof CD_ENGLISH !== 'undefined' && CD_ENGLISH[parentIso2] != null) return CD_ENGLISH[parentIso2]; return null; }
    if (lk === 'healthcare') { if (typeof CD_HEALTHCARE !== 'undefined' && CD_HEALTHCARE[parentIso2] != null) return CD_HEALTHCARE[parentIso2]; return null; }
    if (lk === 'tapwater') { if (typeof CD_TAPWATER !== 'undefined' && CD_TAPWATER[parentIso2] != null) return CD_TAPWATER[parentIso2]; return null; }
    if (lk === 'airquality') { if (typeof CD_AIRQUALITY !== 'undefined' && CD_AIRQUALITY[parentIso2] != null) return CD_AIRQUALITY[parentIso2]; return null; }
    if (lk === 'femalesafety') { if (typeof CD_FEMALE_SAFETY !== 'undefined' && CD_FEMALE_SAFETY[parentIso2] != null) return CD_FEMALE_SAFETY[parentIso2]; return null; }
    if (lk === 'nightlife') { if (typeof CD_NIGHTLIFE !== 'undefined' && CD_NIGHTLIFE[parentIso2] != null) return CD_NIGHTLIFE[parentIso2]; return null; }
    if (lk === 'scam') { if (typeof CD_SCAM !== 'undefined' && CD_SCAM[parentIso2] != null) return CD_SCAM[parentIso2]; return null; }
    if (lk === 'malaria') { if (typeof CD_MALARIA !== 'undefined' && CD_MALARIA[parentIso2] != null) return CD_MALARIA[parentIso2]; return null; }
    if (lk === 'tipping') {
      if (d1 && d1.tipping != null) return d1.tipping;
      if (typeof CD_TIPPING !== 'undefined' && CD_TIPPING[parentIso2] != null) return CD_TIPPING[parentIso2];
      return null;
    }
    if (lk === 'visa')     return selectedNationality ? getVisaRating(parentIso2, selectedNationality) : null;
    if (lk === 'strength') return selectedNationality ? getStrengthRating(parentIso2) : null;
    const arr = (d1 && d1[lk]) || (d2 && d2[lk]);
    return arr != null ? getRating(arr) : null;
  }).filter(v => v !== null);
  if (ratings.length === 0) return null;
  return Math.max(...ratings);
}

// ─── Style ────────────────────────────────────────────────────────────────────
// Returns true when the selected passport nationality is explicitly banned from
// entering iso2 (VISA_DATA entry type === 'banned').  Used by getCountryStyle
// to render entry-denied countries with a distinct black + red-border visual so
// they are unmistakable at world zoom — not just dark red like "visa required."
function isBannedEntry(iso2) {
  if (!selectedNationality) return false;
  if (!(activeLayers.has('visa') || activeLayers.has('strength'))) return false;
  if (iso2 === selectedNationality) return false;
  const dest = typeof VISA_DATA !== 'undefined' ? VISA_DATA[iso2] : null;
  if (!dest) return false;
  const entry = dest[selectedNationality];
  return entry && entry.t === 'banned';
}

function getCountryStyle(iso2, hover) {
  // Hide countries represented in the admin-1 layer ONLY when admin-1 is visible
  if (_admin1Visible && _coveredByAdmin1.has(iso2)) {
    return { fillColor: 'transparent', fillOpacity: 0, color: 'transparent', weight: 0 };
  }
  if (activeLayers.size === 0) {
    return { fillColor: '#000', fillOpacity: 0, color: 'rgba(201,168,76,0.04)', weight: 0.3 };
  }

  // Banned entry: near-black fill + red dashed border — visually unmistakable
  if (isBannedEntry(iso2)) {
    return {
      fillColor:   '#1a0000',
      fillOpacity: hover ? 0.97 : 0.92,
      color:       hover ? '#ff4444' : '#cc2222',
      weight:      hover ? 2.5 : 1.8,
      dashArray:   '5,3',
    };
  }

  // Visa layer (sole active layer): colour by actual entry TYPE so VOA / e-Visa / ETA /
  // embassy read as distinct hues. Gated to size===1 so Combined View is unaffected.
  if (activeLayers.has('visa') && activeLayers.size === 1 && selectedNationality) {
    const vc = visaTypeColor(iso2, selectedNationality);
    if (vc) {
      return { fillColor: vc, fillOpacity: hover ? 0.9 : 0.74,
               color: hover ? 'rgba(232,213,163,0.65)' : 'rgba(255,255,255,0.30)', weight: hover ? 2.5 : 0.65 };
    }
    if (iso2 !== selectedNationality) {
      // No visa data for this destination → terra incognita (faint, hatched border).
      return { fillColor: RC_NODATA, fillOpacity: hover ? 0.4 : 0.16,
               color: 'rgba(201,168,76,0.18)', weight: 0.4, dashArray: '2,3' };
    }
  }

  const r = getCountryRating(iso2);
  const fc = r !== null ? RC[Math.min(3, Math.max(0, r))] : RC_NODATA;
  const fo = r !== null ? (hover ? 0.88 : 0.72) : (activeLayers.size > 0 ? 0.25 : 0);
  return {
    fillColor: fc,
    fillOpacity: fo,
    color: hover ? 'rgba(232,213,163,0.65)' : 'rgba(255,255,255,0.30)',
    weight: hover ? 2.5 : 0.65,
  };
}

// Style for admin-1 (province/state) choropleth features.
// Uses province-specific data from CD_A1[subCode] when available,
// falling back to parent country CD[iso2] for any missing layers.
function getAdmin1Style(iso2, subCode, hover) {
  if (activeLayers.size === 0) {
    return { fillColor: '#000', fillOpacity: 0, color: 'rgba(255,255,255,0.07)', weight: 0.2 };
  }
  if (isBannedEntry(iso2)) {
    return {
      fillColor:   '#1a0000',
      fillOpacity: hover ? 0.97 : 0.90,
      color:       hover ? '#ff4444' : '#cc2222',
      weight:      hover ? 2.0 : 1.5,
      dashArray:   '5,3',
    };
  }
  const r = getAdmin1Rating(subCode, iso2);
  const fc = r !== null ? RC[Math.min(3, Math.max(0, r))] : RC_NODATA;
  const fo = r !== null ? (hover ? 0.88 : 0.72) : (activeLayers.size > 0 ? 0.20 : 0);
  return {
    fillColor: fc,
    fillOpacity: fo,
    color: hover ? 'rgba(232,213,163,0.40)' : 'rgba(255,255,255,0.20)',
    weight: hover ? 2.5 : 0.35,
  };
}

// ─── Admin-2 (county/municipality) rating and style ──────────────────────────
// Three-level fallback: CD_A2[shapeID] → CD_A1[admin1Code] → CD[iso2].
// Uses the same worst-case (Math.max) aggregation as admin-1.
function getAdmin2Rating(shapeID, parentAdmin1Code, parentIso2) {
  const d2 = shapeID ? CD_A2[shapeID] : null;
  const d1 = parentAdmin1Code ? CD_A1[parentAdmin1Code] : null;
  const d0 = CD[parentIso2];
  if (!d2 && !d1 && !d0) return null;
  const layers = [...activeLayers];
  if (layers.length === 0) return null;
  const ratings = layers.map(lk => {
    // Scalar tables first; fall back to CD arrays for broad coverage
    if (lk === 'cost') {
      if (typeof CD_COST !== 'undefined' && CD_COST[parentIso2] != null) return CD_COST[parentIso2];
      return d0 && d0.cost != null ? getRating(d0.cost) : null;
    }
    if (lk === 'safety') {
      if (typeof CD_SAFETY !== 'undefined' && CD_SAFETY[parentIso2] != null) return CD_SAFETY[parentIso2];
      return d0 && d0.safety != null ? getRating(d0.safety) : null;
    }
    if (lk === 'internet') {
      if (typeof CD_INTERNET !== 'undefined' && CD_INTERNET[parentIso2] != null) return CD_INTERNET[parentIso2];
      return d0 && d0.remote != null ? getRating(d0.remote) : null;
    }
    if (lk === 'kids') {
      if (typeof CD_KIDS !== 'undefined' && CD_KIDS[parentIso2] != null) return CD_KIDS[parentIso2];
      return d0 && d0.family != null ? getRating(d0.family) : null;
    }
    if (lk === 'visa')     return selectedNationality ? getVisaRating(parentIso2, selectedNationality) : null;
    if (lk === 'strength') return selectedNationality ? getStrengthRating(parentIso2) : null;
    const arr = (d2 && d2[lk]) || (d1 && d1[lk]) || (d0 && d0[lk]);
    return arr != null ? getRating(arr) : null;
  }).filter(v => v !== null);
  if (ratings.length === 0) return null;
  return Math.max(...ratings);
}

function getAdmin2Style(shapeID, parentAdmin1Code, iso2, hover) {
  if (activeLayers.size === 0) {
    return { fillColor: '#000', fillOpacity: 0, color: 'rgba(255,255,255,0.05)', weight: 0.15 };
  }
  const r = getAdmin2Rating(shapeID, parentAdmin1Code, iso2);
  const fc = r !== null ? RC[Math.min(3, Math.max(0, r))] : RC_NODATA;
  const fo = r !== null ? (hover ? 0.88 : 0.72) : (activeLayers.size > 0 ? 0.16 : 0);
  return {
    fillColor: fc,
    fillOpacity: fo,
    // County borders are lighter/thinner than province borders (0.35/0.9) so
    // province lines remain visually dominant at intermediate zoom levels.
    color: hover ? 'rgba(232,213,163,0.30)' : 'rgba(255,255,255,0.12)',
    weight: hover ? 2.5 : 0.22,
  };
}

// ─── Canvas Markers ───────────────────────────────────────────────────────────
function makeMarkerIcon(city, zoom) {
  const la = [...activeLayers];
  const n = la.length;
  if (n === 0) return null;

  // Dots shrink as the user zooms in — a city fills a screen at zoom 12+ so
  // a large dot would obscure it.  At world zoom dots are larger so they are
  // easy to find and click.  Minimum radius 4 to remain clickable at all times.
  const SZ = zoom >= 12 ? 4 : zoom >= 10 ? 5 : zoom >= 8 ? 6 : zoom >= 6 ? 7 : 8;
  const D = SZ * 2;
  const lw = SZ <= 4 ? 1 : 1.5;  // thinner stroke on small markers

  const cv = document.createElement('canvas');
  cv.width = D; cv.height = D;
  const ctx = cv.getContext('2d');
  const cx = SZ, cy = SZ, r = SZ - lw;

  if (n === 1) {
    const v = getRating(city.data[la[0]]) ?? 0;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = RC[Math.min(3, v)]; ctx.fill();
    ctx.strokeStyle = 'rgba(201,168,76,0.75)'; ctx.lineWidth = lw; ctx.stroke();
  } else {
    const slice = (Math.PI * 2) / n;
    la.forEach((lk, i) => {
      const v = getRating(city.data[lk]) ?? 0;
      const s = slice * i - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, s, s + slice); ctx.closePath();
      ctx.fillStyle = RC[Math.min(3, v)]; ctx.fill();
      ctx.strokeStyle = 'rgba(14,11,6,0.4)'; ctx.lineWidth = 0.5; ctx.stroke();
    });
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,168,76,0.70)'; ctx.lineWidth = lw; ctx.stroke();
  }

  // canvas.outerHTML only serialises the element tag — pixel data is lost.
  // toDataURL() encodes the drawn pixels as a PNG data URI used in an <img>.
  return L.divIcon({ html: `<img src="${cv.toDataURL()}" width="${D}" height="${D}" style="display:block">`, className: '', iconSize: [D, D], iconAnchor: [SZ, SZ] });
}

function makeBorderIcon(bc, zoom) {
  const col = { open: '#22d3ee', restricted: '#f59e0b', closed: '#ef4444' }[bc.status];
  const sz = zoom >= 9 ? 9 : zoom >= 7 ? 7 : zoom >= 5 ? 6 : 5;
  const D = sz * 2;
  const cv = document.createElement('canvas');
  cv.width = D; cv.height = D;
  const ctx = cv.getContext('2d');
  const c = sz;
  ctx.beginPath();
  ctx.moveTo(c, 1); ctx.lineTo(D - 1, c); ctx.lineTo(c, D - 1); ctx.lineTo(1, c);
  ctx.closePath();
  ctx.fillStyle = col; ctx.globalAlpha = 0.88; ctx.fill();
  ctx.strokeStyle = 'rgba(232,213,163,0.85)'; ctx.lineWidth = 1.2;
  ctx.globalAlpha = 1; ctx.stroke();
  if (bc.status === 'closed') {
    const x = Math.max(3, sz - 3);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(c - x, c - x); ctx.lineTo(c + x, c + x);
    ctx.moveTo(c + x, c - x); ctx.lineTo(c - x, c + x); ctx.stroke();
  }
  return L.divIcon({ html: `<img src="${cv.toDataURL()}" width="${D}" height="${D}" style="display:block">`, className: '', iconSize: [D, D], iconAnchor: [sz, sz] });
}

// ─── Political Borders & Territory Overlays ───────────────────────────────────
function getTerritoryStyle(props, hover) {
  if (props.type === 'territory') {
    const r = getCountryRating(props.id);
    const fc = r !== null ? RC[Math.min(3, r)] : '#5a4a20';
    return {
      fillColor: fc,
      fillOpacity: r !== null ? (hover ? 0.88 : 0.72) : 0.18,
      color: hover ? 'rgba(232,213,163,0.7)' : 'rgba(232,213,163,0.55)',
      weight: hover ? 1.5 : 1.0,
    };
  }
  if (props.type === 'contested') {
    // Show full data-driven fill; dotted border is the only visual distinction from sovereign states
    const r = getCountryRating(props.id);
    const fc = r !== null ? RC[Math.min(3, r)] : '#5a4a20';
    return {
      fillColor: fc,
      fillOpacity: r !== null ? (hover ? 0.88 : 0.72) : 0.15,
      color: hover ? 'rgba(232,213,163,0.70)' : 'rgba(232,213,163,0.55)',
      weight: hover ? 1.6 : 1.2,
      dashArray: '5,4',
    };
  }
  if (props.type === 'admin') {
    const r = getCountryRating(props.adminIso);
    const fc = r !== null ? RC[Math.min(3, r)] : 'transparent';
    return {
      fillColor: fc,
      fillOpacity: r !== null ? (hover ? 0.88 : 0.72) : 0,
      color: hover ? 'rgba(232,213,163,0.6)' : 'rgba(232,213,163,0.35)',
      weight: hover ? 1.2 : 0.8,
      dashArray: '3,3',
    };
  }
  return { fillOpacity: 0, weight: 0 };
}

function buildTerritoryTooltip(id, name, type, adminIso) {
  const sub = { territory: 'TERRITORY', contested: 'DISPUTED TERRITORY', admin: 'ADMINISTERED TERRITORY' }[type] || 'TERRITORY';
  const note = type === 'contested' ? '<div style="font-size:6.5px;color:#5a4a20;margin-top:3px;letter-spacing:.5px">Data reflects general regional conditions</div>' : '';
  const dataId = CD[id] ? id : (adminIso && CD[adminIso] ? adminIso : null);
  const rows = dataId
    ? buildLayerRows(CD[dataId], {iso2: dataId})
    : '<div style="color:#5a4a20;font-size:8px;padding:4px 0">Contested — no unified travel data available.</div>';
  return `<div class="tth">
    <h3 id="tt-name">${name}</h3>
    <div class="ts" id="tt-sub">${sub}</div>
    <div class="tm" id="tt-period">${periodLabel()}</div>
    ${note}
  </div><div class="ttb" id="tt-body">${rows}</div>`;
}

function initPoliticalLayers() {
  if (!_geoData) return;

  // Country border lines — lines only, not interactive
  borderLinesLayer = L.geoJSON(_geoData, {
    pane: 'politicalPane',
    interactive: false,
    style: () => ({ fill: false, color: 'rgba(255,255,255,0.35)', weight: 0.90 }),
  });

  // Territory polygons — Gaza, West Bank, Golan Heights
  const features = TERRITORIES.map(t => ({
    type: 'Feature',
    properties: { id: t.id, name: t.name, type: t.type, adminIso: t.adminIso || null },
    geometry: t.geometry,
  }));

  territoryLayerGroup = L.geoJSON({ type: 'FeatureCollection', features }, {
    pane: 'politicalPane',
    style: feature => getTerritoryStyle(feature.properties, false),
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      layer.on('mouseover', () => {
        layer.setStyle(getTerritoryStyle(p, true));
      });
      layer.on('mouseout', () => {
        layer.setStyle(getTerritoryStyle(p, false));
      });
      layer.on('click', e => {
        _featureClicked = true;
        toggleTooltip('territory:' + p.id, buildTerritoryTooltip(p.id, p.name, p.type, p.adminIso), e.originalEvent.clientX, e.originalEvent.clientY);
        setTimeout(() => { _featureClicked = false; }, 10);
      });
    },
  });

  if (showPolitical) {
    borderLinesLayer.addTo(map);
    territoryLayerGroup.addTo(map);
  }
}

function renderPoliticalLayers() {
  if (!borderLinesLayer || !territoryLayerGroup) return;
  if (showPolitical) {
    if (!map.hasLayer(borderLinesLayer)) borderLinesLayer.addTo(map);
    if (!map.hasLayer(territoryLayerGroup)) territoryLayerGroup.addTo(map);
    // Re-style territories when active layers change
    territoryLayerGroup.eachLayer(layer => {
      if (layer.feature) layer.setStyle(getTerritoryStyle(layer.feature.properties, false));
    });
  } else {
    if (map.hasLayer(borderLinesLayer)) borderLinesLayer.remove();
    if (map.hasLayer(territoryLayerGroup)) territoryLayerGroup.remove();
  }
}

// ─── Choropleth ───────────────────────────────────────────────────────────────
async function initChoropleth() {
  let data;
  try {
    // Abort after 15 s so a stalled CDN response never blocks the rest of boot.
    const ctrl    = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(
      'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
      { signal: ctrl.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    data = await res.json();
  } catch (e) {
    console.warn('Country GeoJSON unavailable — map will render without choropleth:', e.message);
    const st = document.getElementById('map-status');
    if (st) { st.textContent = '⚠ Country data unavailable — check your connection and reload.'; st.style.display = 'block'; }
    return;
  }
  _geoData = data;  // cache for border-lines layer

  data.features.forEach(f => {
    const iso2 = getIso2(f.properties);
    const name = f.properties.ADMIN || f.properties.name || '';
    if (iso2 && iso2 !== '-99') countryNames[iso2] = name;
  });

  geojsonLayer = L.geoJSON(data, {
    pane: 'choroplethPane',
    style: feature => {
      const iso2 = getIso2(feature.properties);
      return getCountryStyle(iso2, false);
    },
    onEachFeature: (feature, layer) => {
      const iso2 = getIso2(feature.properties);
      if (!iso2 || iso2 === '-99') return;

      layer.on('mouseover', () => {
        layer.setStyle(getCountryStyle(iso2, true));
      });
      layer.on('mouseout', () => {
        layer.setStyle(getCountryStyle(iso2, false));
      });
      layer.on('click', e => {
        _featureClicked = true;
        const html = buildCountryTooltip(iso2);
        if (html) {
          toggleTooltip('country:' + iso2, html, e.originalEvent.clientX, e.originalEvent.clientY);
          var center = (typeof COUNTRY_CENTERS !== 'undefined' && COUNTRY_CENTERS[iso2]);
          if (center) _injectWeatherRow(iso2, center[0], center[1]);
          var _ic = document.getElementById("intel-" + iso2);
          if (_ic) _renderCountryIntel(iso2, countryNames[iso2] || iso2, _ic);
        }
        setTimeout(() => { _featureClicked = false; }, 10);
      });
    },
  }).addTo(map);
}

function renderChoropleth() {
  if (!geojsonLayer) return;
  geojsonLayer.eachLayer(layer => {
    const iso2 = layer.feature && getIso2(layer.feature.properties);
    if (iso2 && iso2 !== '-99') layer.setStyle(getCountryStyle(iso2, false));
  });
}

// Re-apply admin-1 styles when active layers or month selection changes
function renderAdmin1Styles() {
  if (!admin1ChoroLayer) return;
  admin1ChoroLayer.eachLayer(layer => {
    if (!layer.feature) return;
    const p = layer.feature.properties;
    const iso2 = getAdmin1Iso2(p);
    const subCode = getAdmin1Code(p);
    if (iso2) layer.setStyle(getAdmin1Style(iso2, subCode, false));
  });
}

function renderAdmin2Styles() {
  Object.entries(_admin2Layers).forEach(([iso2, layer]) => {
    if (!layer) return;
    layer.eachLayer(sublayer => {
      if (!sublayer.feature) return;
      const shapeID  = sublayer.feature.properties.shapeID;
      const parentA1 = CD_A2_PARENT[shapeID] || null;
      sublayer.setStyle(getAdmin2Style(shapeID, parentA1, iso2, false));
    });
  });
}

// Loads Natural Earth 10 m admin-1 GeoJSON and creates the sub-national choropleth.
// Runs after initChoropleth so _geoData / geojsonLayer already exist.
async function initAdmin1Choropleth() {
  // Two CDNs tried in order.  raw.githubusercontent.com is fastest when available;
  // jsDelivr mirrors the same repo and is more reliably globally cached.
  const ADMIN1_URLS = [
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson',
    'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_10m_admin_1_states_provinces.geojson',
  ];
  try {
    let res, lastErr;
    for (const url of ADMIN1_URLS) {
      try {
        res = await fetch(url);
        if (res.ok) break;
        lastErr = new Error('HTTP ' + res.status + ' from ' + url);
      } catch (e) { lastErr = e; }
    }
    if (!res || !res.ok) throw lastErr || new Error('All admin-1 CDN sources failed');
    _admin1GeoData = await res.json();

    // IMPORTANT: only suppress the country-level choropleth polygon for countries
    // that have *explicit* province/state entries in CD_A1.  The Natural Earth
    // admin-1 file covers ~230 countries — if we add all of them to
    // _coveredByAdmin1 the country layer becomes entirely transparent and the map
    // renders as large flat colour blobs (province borders at 0.22 px are
    // invisible at low zoom).  We want province-level detail only where we have
    // actual sub-national data (CN, IN, US, AU, RU, BR, CA, …).
    const cd_a1_countries = new Set(Object.keys(CD_A1).map(k => k.split('-')[0]));
    _admin1GeoData.features.forEach(f => {
      const iso2    = getAdmin1Iso2(f.properties);
      const subCode = getAdmin1Code(f.properties);
      if (iso2 && cd_a1_countries.has(iso2)) _coveredByAdmin1.add(iso2);
      // Build name lookup used by admin-2 tooltips to show "California" not "US-CA"
      if (subCode && f.properties.name) _admin1NameCache[subCode] = f.properties.name;
    });

    // Filter to only the provinces of countries with CD_A1 data.  This reduces
    // the feature set from ~4 600 to ~150, dramatically improving render performance
    // and ensuring the admin-1 layer does not intercept mouse events for countries
    // that still rely on the country-level choropleth.
    const filteredFeatures = _admin1GeoData.features.filter(f => {
      const iso2 = getAdmin1Iso2(f.properties);
      return iso2 && _coveredByAdmin1.has(iso2);
    });

    admin1ChoroLayer = L.geoJSON({ type: 'FeatureCollection', features: filteredFeatures }, {
      pane: 'choroplethPane',
      style: feature => {
        const p = feature.properties;
        return getAdmin1Style(getAdmin1Iso2(p), getAdmin1Code(p), false);
      },
      onEachFeature: (feature, layer) => {
        const p         = feature.properties;
        const iso2      = getAdmin1Iso2(p);
        const subCode   = getAdmin1Code(p);
        if (!iso2) return;
        const stateName   = p.name  || '';
        const countryName = p.admin || countryNames[iso2] || iso2;

        layer.on('mouseover', () => {
          layer.setStyle(getAdmin1Style(iso2, subCode, true));
        });
        layer.on('mouseout', () => {
          layer.setStyle(getAdmin1Style(iso2, subCode, false));
        });
        layer.on('click', e => {
          _featureClicked = true;
          const html = buildAdmin1Tooltip(iso2, subCode, stateName, countryName);
          if (html) toggleTooltip('admin1:' + subCode, html, e.originalEvent.clientX, e.originalEvent.clientY);
          setTimeout(() => { _featureClicked = false; }, 10);
        });
      },
    }).addTo(map);

    // Apply zoom-based visibility for admin-1 before first render.
    // If we are already at zoom ≥ 5 the layer will show immediately;
    // otherwise it stays hidden and onZoomAdmin1() enables it on first zoom.
    onZoomAdmin1();

  } catch (e) {
    console.warn('Admin-1 choropleth unavailable — falling back to country level:', e.message);
  }
}

// ─── Admin-2 Choropleth (county/municipality level) ───────────────────────────
// Self-hosted GeoJSON files live in data/admin2/{ISO3}_ADM2_simplified.geojson.
// Files are fetched per-country on demand when the user zooms to level 6+.
// geoBoundaries CC-BY 4.0 — see data/admin2/README.md for attribution and
// instructions on downloading/refreshing the source files.

async function loadAdmin2Country(iso2) {
  if (iso2 in _admin2Cache) return;   // already loaded, loading, or failed
  _admin2Cache[iso2] = null;          // sentinel: fetch in-flight

  const iso3 = ISO2_TO_ISO3[iso2];
  if (!iso3) return;

  const statusEl = document.getElementById('map-status');
  if (statusEl) { statusEl.textContent = 'Loading county data…'; statusEl.style.display = 'block'; }

  try {
    const res = await fetch(`data/admin2/${iso3}_ADM2_simplified.geojson`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const geojson = await res.json();
    _admin2Cache[iso2] = geojson;
    if (statusEl) statusEl.style.display = 'none';

    _admin2Layers[iso2] = L.geoJSON(geojson, {
      pane: 'admin2Pane',
      style: feature => {
        const shapeID  = feature.properties.shapeID;
        const parentA1 = CD_A2_PARENT[shapeID] || null;
        return getAdmin2Style(shapeID, parentA1, iso2, false);
      },
      onEachFeature: (feature, layer) => {
        const shapeID  = feature.properties.shapeID;
        const parentA1 = CD_A2_PARENT[shapeID] || null;
        const distName = feature.properties.shapeName || '';

        layer.on('mouseover', () => {
          layer.setStyle(getAdmin2Style(shapeID, parentA1, iso2, true));
        });
        layer.on('mouseout', () => {
          layer.setStyle(getAdmin2Style(shapeID, parentA1, iso2, false));
        });
        layer.on('click', e => {
          _featureClicked = true;
          const stateName   = (parentA1 && _admin1NameCache[parentA1]) || parentA1 || '';
          const countryName = countryNames[iso2] || iso2;
          const html = buildAdmin2Tooltip(shapeID, parentA1, iso2, distName, stateName, countryName);
          if (html) toggleTooltip('admin2:' + shapeID, html, e.originalEvent.clientX, e.originalEvent.clientY);
          setTimeout(() => { _featureClicked = false; }, 10);
        });
      },
    });

    // Only add to map if the user is still at the triggering zoom level
    if (map.getZoom() >= 6) {
      _admin2Layers[iso2].addTo(map);
      _coveredByAdmin2.add(iso2);
    }
  } catch (e) {
    console.warn(`Admin-2 load failed for ${iso2} (${iso3}):`, e.message);
    delete _admin2Cache[iso2];  // allow retry on next zoom event
    if (statusEl) statusEl.style.display = 'none';
  }
}

// Returns a Set of ISO-2 codes for admin-1 countries whose province polygons
// intersect the current map bounds. Used to decide which admin-2 files to load.
function getVisibleAdmin1Countries(bounds) {
  const visible = new Set();
  if (!admin1ChoroLayer) return visible;
  admin1ChoroLayer.eachLayer(sublayer => {
    if (!sublayer.feature) return;
    const iso2 = getAdmin1Iso2(sublayer.feature.properties);
    if (!iso2 || !ISO2_TO_ISO3[iso2]) return;
    try {
      if (bounds.intersects(sublayer.getBounds())) visible.add(iso2);
    } catch (_) { /* feature may not have bounds yet */ }
  });
  return visible;
}

function onZoomAdmin2() {
  const zoom = map.getZoom();

  if (zoom < 6) {
    // Remove all admin-2 layers from map; keep cached GeoJSON for fast restore
    Object.entries(_admin2Layers).forEach(([iso2, layer]) => {
      if (layer && map.hasLayer(layer)) layer.remove();
    });
    _coveredByAdmin2.clear();
    return;
  }

  const bounds  = map.getBounds();
  const visible = getVisibleAdmin1Countries(bounds);

  visible.forEach(iso2 => {
    if (!(iso2 in _admin2Cache)) {
      loadAdmin2Country(iso2);   // async — adds to map when fetch completes
    } else if (_admin2Cache[iso2] && _admin2Layers[iso2] && !map.hasLayer(_admin2Layers[iso2])) {
      _admin2Layers[iso2].addTo(map);
      _coveredByAdmin2.add(iso2);
    }
  });

  // Remove layers for countries panned out of view (bounds memory)
  Object.keys(_admin2Layers).forEach(iso2 => {
    if (!visible.has(iso2) && _admin2Layers[iso2] && map.hasLayer(_admin2Layers[iso2])) {
      _admin2Layers[iso2].remove();
      _coveredByAdmin2.delete(iso2);
    }
  });
}

// ─── City Markers ─────────────────────────────────────────────────────────────
function renderCityMarkers() {
  cityMarkers.forEach(m => m.remove());
  cityMarkers = [];
  if (activeLayers.size === 0) return;

  const zoom = map.getZoom();
  // Don't clutter world-view (zoom < 4) with dots — they add noise at that scale.
  // Show a reduced set at zoom 4, all cities at zoom 5+.
  if (zoom < 4) return;
  if (zoom < 5) {
    // Major cities only — every third entry keeps the list representative without overcrowding.
    _placeCities(CITIES.filter((_, i) => i % 3 === 0));
  } else {
    _placeCities(CITIES);
  }
}

function _placeCities(list) {
  const zoom = map.getZoom();
  list.forEach(city => {
    const icon = makeMarkerIcon(city, zoom);
    if (!icon) return;
    const marker = L.marker([city.lat, city.lng], { icon, pane: 'markersPane' });

    marker.on('click', e => {
      _featureClicked = true;
      toggleTooltip('city:' + city.name + ':' + city.lat, buildCityTooltip(city), e.originalEvent.clientX, e.originalEvent.clientY);
      setTimeout(() => { _featureClicked = false; }, 10);
    });

    marker.addTo(map);
    cityMarkers.push(marker);
  });
}

// ─── Border Markers ───────────────────────────────────────────────────────────
// At zoom < 3: show nothing (too cluttered at world view).
// At zoom 3–6: show static BORDERS curated list (206 major crossings worldwide).
// At zoom ≥ 7: fetch all OSM barrier=border_control nodes via Overpass (live, bbox-cached).
function renderBorderMarkers() {
  borderMarkers.forEach(m => m.remove());
  borderMarkers = [];
  _borderPoiMarkers.forEach(m => m.remove());
  _borderPoiMarkers = [];
  if (!showBorders) return;

  const zoom = map.getZoom();
  if (zoom < 3) return;

  if (zoom >= 7) {
    _fetchAndRenderBorders();
    return;
  }

  // Zoom 3–6: render curated static list
  BORDERS.forEach(bc => {
    const icon = makeBorderIcon(bc, zoom);
    const marker = L.marker([bc.lat, bc.lng], { icon, pane: 'markersPane' });
    marker.on('click', e => {
      _featureClicked = true;
      toggleTooltip('border:' + (bc.id || (bc.lat + ':' + bc.lng)), buildBorderTooltip(bc), e.originalEvent.clientX, e.originalEvent.clientY);
      setTimeout(() => { _featureClicked = false; }, 10);
    });
    marker.addTo(map);
    borderMarkers.push(marker);
  });
}

// Fetch all international border control nodes in the current viewport via Overpass.
// Results are cached by bbox key so panning re-uses previously fetched data.
function _fetchAndRenderBorders() {
  if (_borderDebounce) clearTimeout(_borderDebounce);
  _borderDebounce = setTimeout(async () => {
    if (!showBorders || !map) return;
    const b   = map.getBounds();
    const pad = 0.05;
    const s   = (b.getSouth() - pad).toFixed(4);
    const w   = (b.getWest()  - pad).toFixed(4);
    const n   = (b.getNorth() + pad).toFixed(4);
    const e   = (b.getEast()  + pad).toFixed(4);
    const key = `${s},${w},${n},${e}`;
    if (_borderPoiCache[key]) { _placeBorderPois(_borderPoiCache[key]); return; }
    const query = `[out:json][timeout:20];
(
  node["barrier"="border_control"](${s},${w},${n},${e});
  node["border_control"="yes"](${s},${w},${n},${e});
  node["crossing:barrier"="border_control"](${s},${w},${n},${e});
);
out body;`;
    try {
      const res  = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        signal: AbortSignal.timeout(22000),
      });
      if (!res.ok) return;
      const json = await res.json();
      const elements = (json.elements || []).filter(el => el.lat && el.lon);
      _borderPoiCache[key] = elements;
      if (showBorders) _placeBorderPois(elements);
    } catch(_) { /* network error — silently skip, user can pan to retry */ }
  }, 400);
}

function _placeBorderPois(elements) {
  _borderPoiMarkers.forEach(m => m.remove());
  _borderPoiMarkers = [];
  if (!showBorders || !map) return;
  const zoom = map.getZoom();
  elements.forEach(el => {
    const tags = el.tags || {};
    const name = tags.name || tags['name:en'] || tags['int_name'] || 'Border Crossing';
    // Infer status from OSM tags
    let status = 'open';
    if (tags.access === 'no' || tags.operational_status === 'closed') status = 'closed';
    else if (tags.access === 'restricted' || tags.access === 'private') status = 'restricted';
    const fromNote = tags['from:country'] || tags['addr:country'] || '';
    const toNote   = tags['to:country']   || '';
    const hours    = tags.opening_hours   || '';
    const bc = { id: 'osm:' + el.id, name, from: fromNote || '–', to: toNote || '–',
                 lat: el.lat, lng: el.lon, status, hours, note: tags.note || tags.description || '' };
    const icon = makeBorderIcon(bc, zoom);
    const marker = L.marker([el.lat, el.lon], { icon, pane: 'markersPane' });
    marker.on('click', e => {
      _featureClicked = true;
      toggleTooltip('border:' + el.id, buildBorderTooltip(bc), e.originalEvent.clientX, e.originalEvent.clientY);
      setTimeout(() => { _featureClicked = false; }, 10);
    });
    marker.addTo(map);
    _borderPoiMarkers.push(marker);
  });
}

// ─── Beach Markers ────────────────────────────────────────────────────────────
function makeBeachIcon(beach, zoom) {
  const col = BEACH_STATUS_COL[beach.status] || '#06b6d4';
  const r = zoom >= 9 ? 8 : zoom >= 7 ? 6 : zoom >= 5 ? 5 : 4;
  const D = r * 2 + 4;
  const cv = document.createElement('canvas');
  cv.width = D; cv.height = D;
  const ctx = cv.getContext('2d');
  const cx = D / 2, cy = D / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = col;
  ctx.globalAlpha = 0.90;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.90)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  if (r >= 5) {
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(cx - 1, cy + 1, r * 0.38, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 1, cy - 1, r * 0.28, Math.PI, 0);
    ctx.stroke();
  }
  return L.divIcon({
    html: `<img src="${cv.toDataURL()}" width="${D}" height="${D}" style="display:block">`,
    className: '',
    iconSize: [D, D],
    iconAnchor: [D / 2, D / 2],
  });
}

function renderBeachMarkers() {
  // Always clear live POI markers; they will be re-fetched below if needed.
  _beachPoiMarkers.forEach(m => m.remove());
  _beachPoiMarkers = [];
  // Clear static curated markers.
  beachMarkers.forEach(m => m.remove());
  beachMarkers = [];

  if (!activeLayers.has('beaches') || !map) return;

  const zoom = map.getZoom();

  if (zoom >= 7) {
    // Zoom ≥ 7: query Overpass for real beach locations in the visible viewport.
    _fetchAndRenderBeaches();
    return;
  }

  // Zoom < 7: show hand-curated static beach icons for world-zoom overview.
  if (zoom < 3) return;
  BEACHES.forEach(beach => {
    const icon = makeBeachIcon(beach, zoom);
    const marker = L.marker([beach.lat, beach.lng], { icon, pane: 'markersPane' });
    marker.on('click', e => {
      _featureClicked = true;
      toggleTooltip('beach:' + (beach.name || beach.lat + ':' + beach.lng), buildBeachTooltip(beach), e.originalEvent.clientX, e.originalEvent.clientY);
      setTimeout(() => { _featureClicked = false; }, 10);
    });
    marker.addTo(map);
    beachMarkers.push(marker);
  });
}

// ─── Seasonal Event Markers ───────────────────────────────────────────────────
let eventMarkers = [];
function renderEventMarkers() {
  eventMarkers.forEach(m => m.remove());
  eventMarkers = [];
  if (typeof SEASONAL_EVENTS === 'undefined') return;
  const zoom = map ? map.getZoom() : 0;
  if (zoom < 2) return;
  SEASONAL_EVENTS.forEach(ev => {
    if (!selectedMonths.has(ev.month) && !yearMode) return;
    const center = COUNTRY_CENTERS[ev.country];
    if (!center) return;
    // Offset slightly so multiple events in same country don't overlap
    const offset = eventMarkers.filter(m => m._eventCountry === ev.country).length * 0.8;
    const icon = L.divIcon({
      html: `<div style="font-size:${zoom >= 5 ? 18 : 14}px;cursor:pointer;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))">${ev.emoji}</div>`,
      className: '', iconSize: [24, 24], iconAnchor: [12, 12]
    });
    const marker = L.marker([center[0] + offset, center[1]], { icon, pane: 'markersPane', zIndexOffset: 100 });
    marker._eventCountry = ev.country;
    marker.on('click', e => {
      _featureClicked = true;
      toggleTooltip('event:' + ev.country + ':' + ev.month + ':' + ev.name,
        `<div class="tth"><h3>${ev.emoji} ${ev.name}</h3><div class="ts">SEASONAL EVENT</div><div class="tm">${MONTHS_F[ev.month]}</div></div><div class="ttb"><div class="ttdesc" style="font-size:10px;line-height:1.7;color:#333">${ev.desc}</div></div>`,
        e.originalEvent.clientX, e.originalEvent.clientY);
      setTimeout(() => { _featureClicked = false; }, 10);
    });
    marker.addTo(map);
    eventMarkers.push(marker);
  });
}

function buildBeachTooltip(beach) {
  const cname = countryNames[beach.country] || beach.country;
  const scol = BEACH_STATUS_COL[beach.status] || '#06b6d4';
  const wqCol = { excellent:'#4ade80', good:'#facc15', fair:'#fb923c', poor:'#f87171' }[beach.water] || '#facc15';
  const dcMap = {
    'standard': 'Standard swimwear',
    'topless-ok': 'Topless accepted',
    'naturist': 'Naturist / Fully nude',
    'clothing-required': 'Covered clothing required',
  };
  const dc = dcMap[beach.dresscode] || beach.dresscode || '—';
  const fac = beach.facilities || '—';
  const note = beach.note ? `<div class="ttdesc" style="margin-top:4px">${beach.note}</div>` : '';
  return `<div class="tth">
    <h3 id="tt-name">${beach.name}</h3>
    <div class="ts" id="tt-sub">${cname}</div>
    <div class="tm" id="tt-period">PUBLIC BEACH</div>
  </div>
  <div class="ttb" id="tt-body">
    <div class="ttr">
      <div class="ttstrip" style="background:${scol}"></div>
      <div class="tti">
        <div class="ttln">Status</div>
        <div class="ttrat" style="color:${scol}">${(beach.status || 'open').toUpperCase()}</div>
        <div class="ttdesc">Best season: ${beach.season || '—'}</div>
      </div>
    </div>
    <div class="ttr">
      <div class="ttstrip" style="background:${wqCol}"></div>
      <div class="tti">
        <div class="ttln">Water Quality</div>
        <div class="ttrat" style="color:${wqCol}">${(beach.water || 'good').charAt(0).toUpperCase() + (beach.water || 'good').slice(1)}</div>
        <div class="ttdesc">Facilities: ${fac}</div>
      </div>
    </div>
    <div class="ttr">
      <div class="ttstrip" style="background:#8878c8"></div>
      <div class="tti">
        <div class="ttln">Dress Code</div>
        <div class="ttrat" style="color:#b8a8f8">${dc}</div>
        ${note}
      </div>
    </div>
  </div>`;
}

// ─── Live Overpass Beach Markers ─────────────────────────────────────────────
async function _fetchAndRenderBeaches() {
  if (!map || !activeLayers.has('beaches')) return;
  const zoom = map.getZoom();
  if (zoom < 7) return;

  const bounds = map.getBounds();
  const key    = _bboxKey(bounds);

  if (_beachPoiCache[key]) { _renderBeachCircles(_beachPoiCache[key]); return; }

  const st = document.getElementById('map-status');
  if (st) { st.textContent = '🏖 Loading beach data…'; st.style.display = 'block'; }

  const s = bounds.getSouth().toFixed(4), w = bounds.getWest().toFixed(4);
  const n = bounds.getNorth().toFixed(4), e = bounds.getEast().toFixed(4);
  const bbox  = `${s},${w},${n},${e}`;
  const query = `[out:json][timeout:20];(node["natural"="beach"]["access"!="private"](${bbox});node["leisure"="beach_resort"]["access"!="private"](${bbox});way["natural"="beach"]["access"!="private"](${bbox}););out center 300;`;

  try {
    const res      = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query));
    if (res.status === 429) throw new Error('Rate limit');
    const data     = await res.json();
    const elements = (data.elements || []).filter(el =>
      (el.lat && el.lon) || (el.center && el.center.lat)
    ).slice(0, 300);
    _beachPoiCache[key] = elements;
    if (activeLayers.has('beaches') && map.getZoom() >= 7) _renderBeachCircles(elements);
    if (st) st.style.display = 'none';
  } catch(err) {
    const msg = err.message === 'Rate limit' ? '⚠ Rate limit — wait a moment and pan to retry' : '⚠ Beach data unavailable';
    if (st) { st.textContent = msg; st.style.display = 'block'; setTimeout(() => { st.style.display = 'none'; }, 4000); }
  }
}

function _renderBeachCircles(elements) {
  _beachPoiMarkers.forEach(m => m.remove());
  _beachPoiMarkers = [];
  const SURF_COL = { sand:'#F4D03F', pebble:'#A9A9A9', gravel:'#A9A9A9', rock:'#808080', shingle:'#A9A9A9' };
  elements.forEach(el => {
    const lat = el.lat || (el.center && el.center.lat);
    const lon = el.lon  || (el.center && el.center.lon);
    if (!lat || !lon) return;
    const t   = el.tags || {};
    const col = SURF_COL[t.surface] || '#2EC4B6';
    const m   = L.circleMarker([lat, lon], {
      pane: 'markersPane', radius: 5, color: '#fff', weight: 0.8,
      fillColor: col, fillOpacity: 0.88,
    });
    m.on('click', ev => {
      _featureClicked = true;
      toggleTooltip('osmbeach:' + (el.id || (lat + ':' + lon)), _buildOsmBeachTooltip(t), ev.originalEvent.clientX, ev.originalEvent.clientY);
      setTimeout(() => { _featureClicked = false; }, 10);
    });
    m.addTo(map);
    _beachPoiMarkers.push(m);
  });
}

function _buildOsmBeachTooltip(t) {
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${_esc(val)}</div></div></div>` : '';
  const link = url => url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#2EC4B6">Open</a>` : '';
  const fields = [
    row('Surface',        t.surface       || ''),
    row('Lifeguard',      t.lifeguard     || ''),
    row('Lifeguard Hours',t['lifeguard:hours'] || ''),
    row('Opening Hours',  t.opening_hours || ''),
    row('Shower',         t.shower        || ''),
    row('Toilets',        t.toilets       || ''),
    row('Fee',            t.fee           || ''),
    row('Charge',         t.charge        || ''),
    row('Access',         t.access        || ''),
    row('Swimming',       t.swimming      || ''),
    row('Website',        link(t.website || t['contact:website'])),
  ].join('');
  return `<div class="tth">
    <h3 id="tt-name">${_esc(t.name || 'Beach')}</h3>
    <div class="ts" id="tt-sub">${t['addr:country'] || ''}</div>
    <div class="tm" id="tt-period">PUBLIC BEACH — OSM</div>
  </div><div class="ttb" id="tt-body">${fields || '<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional OSM data for this beach.</div>'}</div>`;
}

// ─── Generic Overpass POI Layer (Camping + Parks) ─────────────────────────────
function _clearPOIMarkers(key) {
  const def = POI_LAYERS[key];
  if (!def) return;
  def.markers.forEach(m => m.remove());
  def.markers = [];
}

// Called when trails tile or parks POI changes state. Shows camping markers
// automatically when trails or parks are active; clears them when neither is
// active and the camping button is not independently on.
function _refreshLinkedCamping() {
  const linked = TRANSPORT_LAYERS.trails.active || POI_LAYERS.parks.active;
  if (linked) {
    // Fetch camping data without requiring the camping button to be toggled on.
    _fetchAndRenderPOI('camping', true);
  } else if (!POI_LAYERS.camping.active) {
    // Neither linked source is on and user has not turned camping on explicitly.
    _clearPOIMarkers('camping');
  }
}

async function _fetchAndRenderPOI(key, forceRender) {
  const def = POI_LAYERS[key];
  // forceRender bypasses the active check — used when a linked layer (trails/parks)
  // auto-activates camping without the camping button being toggled on.
  if (!def || (!def.active && !forceRender) || !map) return;
  const zoom = map.getZoom();
  if (zoom < def.minZoom) { _clearPOIMarkers(key); return; }

  const bounds   = map.getBounds();
  const bboxKey  = _bboxKey(bounds);
  if (def.bboxCache[bboxKey]) { _renderPOICircles(key, def.bboxCache[bboxKey]); return; }

  const st = document.getElementById('map-status');
  if (st) { st.textContent = `${[...def.label][0]} Loading…`; st.style.display = 'block'; }

  const s = bounds.getSouth().toFixed(4), w = bounds.getWest().toFixed(4);
  const n = bounds.getNorth().toFixed(4), e = bounds.getEast().toFixed(4);
  const bbox = `${s},${w},${n},${e}`;

  const query = key === 'camping'
    ? `[out:json][timeout:20];(node["tourism"="camp_site"](${bbox});way["tourism"="camp_site"](${bbox}););out center 200;`
    : key === 'viewpoints'
    ? `[out:json][timeout:20];node["tourism"="viewpoint"](${bbox});out body 300;`
    : key === 'climbing'
    ? `[out:json][timeout:25];(node["sport"="climbing"](${bbox});way["sport"="climbing"](${bbox});node["leisure"="climbing"](${bbox});way["leisure"="climbing"](${bbox}););out center 200;`
    : key === 'hotsprings'
    ? `[out:json][timeout:25];(node["natural"="hot_spring"](${bbox});way["natural"="hot_spring"](${bbox});node["amenity"="spa"]["natural"="hot_spring"](${bbox});node["leisure"="bathing_place"]["natural"="hot_spring"](${bbox}););out center 150;`
    : key === 'airports'
    ? `[out:json][timeout:30];(node["aeroway"="aerodrome"](${bbox});way["aeroway"="aerodrome"](${bbox});relation["aeroway"="aerodrome"](${bbox}););out center 200;`
    : key === 'birdwatching'
    ? `[out:json][timeout:25];(node["leisure"="bird_hide"](${bbox});node["natural"="bird_sanctuary"](${bbox});node["amenity"="wildlife_park"](${bbox}););out center 200;`
    : key === 'surfing'
    ? `[out:json][timeout:25];(node["leisure"="surfing"](${bbox});node["sport"="surfing"](${bbox});way["sport"="surfing"](${bbox}););out center 150;`
    : key === 'diving'
    ? `[out:json][timeout:25];(node["sport"="scuba_diving"](${bbox});node["leisure"="diving"](${bbox});node["sport"="snorkeling"](${bbox}););out center 150;`
    : key === 'attractions'
    ? `[out:json][timeout:30];(node["tourism"="attraction"](${bbox});node["tourism"="museum"](${bbox});node["tourism"="monument"](${bbox});node["tourism"="gallery"](${bbox});node["historic"="monument"](${bbox}););out center 250;`
    : key === 'hospitals'
    ? `[out:json][timeout:25];(node["amenity"="hospital"](${bbox});way["amenity"="hospital"](${bbox}););out center 200;`
    : key === 'toilets'
    ? `[out:json][timeout:25];(node["amenity"="toilets"](${bbox});node["amenity"="shower"](${bbox}););out center 300;`
    : key === 'drinkwater'
    ? `[out:json][timeout:25];(node["amenity"="drinking_water"](${bbox});node["amenity"="water_point"](${bbox}););out center 300;`
    : key === 'wildlife'
    ? `[out:json][timeout:25];(node["natural"="wildlife_crossing"](${bbox});node["leisure"="nature_reserve"](${bbox});node["tourism"="zoo"](${bbox});way["leisure"="nature_reserve"](${bbox}););out center 100;`
    : key === "gasstations"
    ? `[out:json][timeout:25];(node["amenity"="fuel"](${bbox});way["amenity"="fuel"](${bbox}););out center 200;`
    : `[out:json][timeout:25];(node["boundary"="national_park"](${bbox});way["boundary"="national_park"](${bbox});relation["boundary"="national_park"](${bbox});node["leisure"="nature_reserve"](${bbox});way["leisure"="nature_reserve"](${bbox});relation["leisure"="nature_reserve"](${bbox});node["landuse"="forest"]["name"](${bbox});way["landuse"="forest"]["name"](${bbox}););out center 250;`;

  try {
    const res  = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query));
    if (res.status === 429) throw new Error('Rate limit');
    const data = await res.json();
    const elements = (data.elements || []).filter(el =>
      (el.lat && el.lon) || (el.center && el.center.lat)
    );
    def.bboxCache[bboxKey] = elements;
    if (def.active && map.getZoom() >= def.minZoom) _renderPOICircles(key, elements);
    if (st) st.style.display = 'none';
  } catch(err) {
    const msg = err.message === 'Rate limit' ? `⚠ Rate limit — wait and pan to retry` : `⚠ ${def.label} data unavailable`;
    if (st) { st.textContent = msg; st.style.display = 'block'; setTimeout(() => { st.style.display = 'none'; }, 4000); }
  }
}

function _renderPOICircles(key, elements) {
  _clearPOIMarkers(key);
  const def = POI_LAYERS[key];
  const POI_STYLE = {
    camping:    { color: '#fff',     fillColor: '#22c55e', weight: 0.8,  radius: 6,  fillOpacity: 0.88 },
    viewpoints: { color: '#c4b5fd', fillColor: '#a855f7', weight: 1.5,  radius: 5,  fillOpacity: 0.85 },
    parks:      { color: '#fff',     fillColor: '#15803d', weight: 0.8,  radius: 6,  fillOpacity: 0.88 },
    climbing:   { color: '#fff',     fillColor: '#f97316', weight: 1.0,  radius: 6,  fillOpacity: 0.90 },
    hotsprings: { color: '#fff',     fillColor: '#e11d48', weight: 1.0,  radius: 6,  fillOpacity: 0.90 },
    airports:     { color: '#fff',     fillColor: '#0ea5e9', weight: 1.2,  radius: 7,  fillOpacity: 0.92 },
    birdwatching: { color:'#fff', fillColor:'#14b8a6', weight:1.0, radius:5, fillOpacity:0.90 },
    surfing:      { color:'#fff', fillColor:'#0284c7', weight:1.0, radius:6, fillOpacity:0.90 },
    diving:       { color:'#fff', fillColor:'#0891b2', weight:1.0, radius:6, fillOpacity:0.90 },
    attractions:  { color:'#fff', fillColor:'#f59e0b', weight:1.2, radius:7, fillOpacity:0.92 },
    hospitals:  { color:"#fff", fillColor:"#ef4444", weight:1.5, radius:7,  fillOpacity:0.95 },
    toilets:    { color:"#fff", fillColor:"#6366f1", weight:1.0, radius:5,  fillOpacity:0.90 },
    drinkwater: { color:"#fff", fillColor:"#22d3ee", weight:1.0, radius:5,  fillOpacity:0.90 },
    wildlife:   { color:"#fff", fillColor:"#22c55e", weight:1.0, radius:6,  fillOpacity:0.90 },
    gasstations: { color:"#fff", fillColor:"#f97316", weight:1.0, radius:5, fillOpacity:0.90 },
  };
  const s = POI_STYLE[key] || POI_STYLE.parks;
  elements.forEach(el => {
    const lat = el.lat || (el.center && el.center.lat);
    const lon = el.lon  || (el.center && el.center.lon);
    if (!lat || !lon) return;
    const t = el.tags || {};
    // Airports: skip very small private airstrips with no name
    if (key === 'airports' && !t.name && !t.iata) return;
    const m = L.circleMarker([lat, lon], {
      pane: 'markersPane',
      radius: s.radius, fillOpacity: s.fillOpacity,
      color: s.color, fillColor: s.fillColor, weight: s.weight,
    });
    m.on('click', ev => {
      _featureClicked = true;
      const ttKey = key + ':' + (el.id || (lat + ':' + lon));
      const html = key === 'camping'    ? _buildCampingTooltip(t)
                 : key === 'viewpoints' ? _buildViewpointTooltip(t)
                 : key === 'climbing'   ? _buildClimbingTooltip(t)
                 : key === 'hotsprings' ? _buildHotspringTooltip(t)
                 : key === 'airports'      ? _buildAirportTooltip(t)
                 : key === 'birdwatching' ? _buildBirdwatchingTooltip(t)
                 : key === 'surfing'      ? _buildSurfingTooltip(t)
                 : key === 'diving'       ? _buildDivingTooltip(t)
                 : key === 'attractions'  ? _buildAttractionsTooltip(t)
                 : key === 'hospitals'   ? _buildHospitalsTooltip(t)
                 : key === 'toilets'     ? _buildToiletsTooltip(t)
                 : key === 'drinkwater'  ? _buildDrinkwaterTooltip(t)
                 : key === 'wildlife'    ? _buildWildlifeTooltip(t)
                 : key === "gasstations" ? _buildGasstationsTooltip(t)
                 : _buildParkTooltip(t);
      toggleTooltip(ttKey, html, ev.originalEvent.clientX, ev.originalEvent.clientY);
      setTimeout(() => { _featureClicked = false; }, 10);
    });
    m.addTo(map);
    def.markers.push(m);
  });
}

function _buildCampingTooltip(t) {
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${_esc(val)}</div></div></div>` : '';
  const link = url => url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#22c55e">Open</a>` : '';
  const fields = [
    row('Fee',           t.fee            || ''),
    row('Charge',        t.charge         || ''),
    row('Opening Hours', t.opening_hours  || ''),
    row('Capacity',      t.capacity       || ''),
    row('Tents',         t.tents          || ''),
    row('Caravans',      t.caravans       || ''),
    row('Cabins',        t.cabins         || ''),
    row('Electricity',   t.electricity    || ''),
    row('Shower',        t.shower         || ''),
    row('Toilets',       t.toilets        || ''),
    row('Dogs',          t.dog || t.dogs  || ''),
    row('Website',       link(t.website || t['contact:website'])),
  ].join('');
  return `<div class="tth">
    <h3 id="tt-name">${_esc(t.name || 'Camp Site')}</h3>
    <div class="ts" id="tt-sub">${t.operator || ''}</div>
    <div class="tm" id="tt-period">CAMPING — OSM</div>
  </div><div class="ttb" id="tt-body">${fields || '<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional OSM data for this campsite.</div>'}</div>`;
}

function _buildParkTooltip(t) {
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${_esc(val)}</div></div></div>` : '';
  const link = url => url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#15803d">Open</a>` : '';
  const kind = t['boundary'] === 'national_park' ? 'National Park'
             : t['leisure']  === 'nature_reserve' ? 'Nature Reserve' : 'Forest / Protected Area';
  const fields = [
    row('Type',             t.protection_title || kind),
    row('Protect Class',    t.protect_class     || ''),
    row('Operator',         t.operator          || ''),
    row('IUCN Category',    t['iucn_level']     || ''),
    row('Website',          link(t.website || t['contact:website'])),
  ].join('');
  return `<div class="tth">
    <h3 id="tt-name">${_esc(t.name || 'Protected Area')}</h3>
    <div class="ts" id="tt-sub">${t.operator || ''}</div>
    <div class="tm" id="tt-period">${kind.toUpperCase()} — OSM</div>
  </div><div class="ttb" id="tt-body">${fields || '<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional OSM data for this area.</div>'}</div>`;
}

function _buildViewpointTooltip(t) {
  const row = (lbl, val) =>
    val
      ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${val}</div></div></div>`
      : '';
  const link = url =>
    url
      ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#a855f7">Open</a>`
      : '';

  const elevLabel = t.ele ? `${parseFloat(t.ele).toLocaleString()} m` : '';

  let dirLabel = '';
  if (t.direction) {
    const deg = parseFloat(t.direction);
    if (!isNaN(deg)) {
      const dirs = ['N','NE','E','SE','S','SW','W','NW'];
      dirLabel = dirs[Math.round(deg / 45) % 8] + ` (${Math.round(deg)}°)`;
    } else {
      dirLabel = t.direction;
    }
  }

  const fields = [
    row('Description', t.description        || t['description:en'] || ''),
    row('Elevation',   elevLabel),
    row('Direction',   dirLabel),
    row('Surface',     t.surface            || ''),
    row('Access',      t.access             || ''),
    row('Operator',    t.operator           || ''),
    row('Website',     link(t.website || t['contact:website'])),
  ].join('');

  return `<div class="tth">
    <h3 id="tt-name">${_esc(t.name || 'Viewpoint')}</h3>
    <div class="ts" id="tt-sub">${t['addr:city'] || t.loc_name || ''}</div>
    <div class="tm" id="tt-period">VIEWPOINT — OSM</div>
  </div>
  <div class="ttb" id="tt-body">
    ${fields || '<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional OSM data for this viewpoint.</div>'}
  </div>`;
}

function _buildClimbingTooltip(t) {
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${_esc(val)}</div></div></div>` : '';
  const link = url => url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#f97316">Open</a>` : '';
  const fields = [
    row('Type',         t['climbing:type']   || t['sport:climbing'] || ''),
    row('Rock Type',    t['climbing:rock']   || ''),
    row('Grade',        t['climbing:grade:french'] || t['climbing:difficulty'] || ''),
    row('Routes',       t['climbing:routes'] || ''),
    row('Height',       t['climbing:length'] ? t['climbing:length'] + ' m' : ''),
    row('Bolted',       t['climbing:bolted'] || ''),
    row('Rappel',       t['climbing:rappel'] || ''),
    row('Access',       t.access             || ''),
    row('Fee',          t.fee                || ''),
    row('Website',      link(t.website || t['contact:website'])),
  ].join('');
  return `<div class="tth">
    <h3 id="tt-name">${_esc(t.name || 'Climbing Area')}</h3>
    <div class="ts" id="tt-sub">${t.operator || t['addr:city'] || ''}</div>
    <div class="tm" id="tt-period">🧗 ROCK CLIMBING — OSM</div>
  </div><div class="ttb" id="tt-body">${fields || '<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional OSM data for this site.</div>'}</div>`;
}

function _buildHotspringTooltip(t) {
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${_esc(val)}</div></div></div>` : '';
  const link = url => url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#e11d48">Open</a>` : '';
  const fields = [
    row('Temperature',  t.temperature ? t.temperature + '°C' : ''),
    row('pH',           t['hot_spring:ph'] || ''),
    row('Opening Hours',t.opening_hours    || ''),
    row('Fee',          t.fee              || ''),
    row('Facilities',   t['leisure']       || ''),
    row('Swimming',     t['bathing']       || ''),
    row('Access',       t.access          || ''),
    row('Website',      link(t.website || t['contact:website'])),
  ].join('');
  return `<div class="tth">
    <h3 id="tt-name">${_esc(t.name || 'Hot Spring')}</h3>
    <div class="ts" id="tt-sub">${t.operator || t['addr:city'] || ''}</div>
    <div class="tm" id="tt-period">♨ HOT SPRING — OSM</div>
  </div><div class="ttb" id="tt-body">${fields || '<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional OSM data for this spring.</div>'}</div>`;
}

function _buildAirportTooltip(t) {
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${_esc(val)}</div></div></div>` : '';
  const link = url => url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0ea5e9">Open</a>` : '';
  const type = t['aeroway:type'] || t.aerodrome || 'aerodrome';
  const typeLabel = type === 'international' ? 'International' : type === 'regional' ? 'Regional' : type === 'military' ? 'Military' : type.charAt(0).toUpperCase() + type.slice(1);
  const fields = [
    row('IATA Code',    t.iata             || ''),
    row('ICAO Code',    t.icao             || ''),
    row('Type',         typeLabel          || ''),
    row('Operator',     t.operator         || ''),
    row('Runways',      t['aeroway:runways']|| ''),
    row('Elevation',    t.ele ? t.ele + ' m' : ''),
    row('Website',      link(t.website || t['contact:website'])),
  ].join('');
  return `<div class="tth">
    <h3 id="tt-name">${_esc(t.name || 'Airport')}</h3>
    <div class="ts" id="tt-sub">${t.iata ? '✈ ' + t.iata : ''} ${t['addr:city'] || ''}</div>
    <div class="tm" id="tt-period">AIRPORT — OSM</div>
  </div><div class="ttb" id="tt-body">${fields || '<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional OSM data for this airport.</div>'}</div>`;
}

function _buildBirdwatchingTooltip(t) {
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${_esc(val)}</div></div></div>` : '';
  const fields = [row('Species',t['species']||t['bird_species']||''),row('Habitat',t['habitat']||t['natural']||''),row('Access',t.access||''),row('Fee',t.fee||''),row('Hours',t['opening_hours']||'')].join('');
  return `<div class="tth"><h3 id="tt-name">${_esc(t.name||'Bird Watching Site')}</h3><div class="ts" id="tt-sub">${_esc(t.operator||t['addr:city']||'')}</div><div class="tm" id="tt-period">🐦 BIRD WATCHING — OSM</div></div><div class="ttb" id="tt-body">${fields||'<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional data for this site.</div>'}</div>`;
}
function _buildSurfingTooltip(t) {
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${_esc(val)}</div></div></div>` : '';
  const fields = [row('Break Type',t['surfing:break_type']||t['wave_type']||''),row('Difficulty',t['surfing:difficulty']||t['difficulty']||''),row('Best Season',t['surfing:season']||t['opening_hours']||''),row('Access',t.access||''),row('Fee',t.fee||'')].join('');
  return `<div class="tth"><h3 id="tt-name">${_esc(t.name||'Surf Spot')}</h3><div class="ts" id="tt-sub">${_esc(t.operator||t['addr:city']||'')}</div><div class="tm" id="tt-period">🏄 SURF SPOT — OSM</div></div><div class="ttb" id="tt-body">${fields||'<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional data.</div>'}</div>`;
}
function _buildDivingTooltip(t) {
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${_esc(val)}</div></div></div>` : '';
  const fields = [row('Sport',t.sport||t.leisure||''),row('Depth',t['diving:depth']||t['max_depth']||''),row('Visibility',t['diving:visibility']||''),row('Cert.',t['diving:certification']||''),row('Access',t.access||''),row('Fee',t.fee||'')].join('');
  return `<div class="tth"><h3 id="tt-name">${_esc(t.name||'Dive Site')}</h3><div class="ts" id="tt-sub">${_esc(t.operator||t['addr:city']||'')}</div><div class="tm" id="tt-period">🤿 DIVE / SNORKEL — OSM</div></div><div class="ttb" id="tt-body">${fields||'<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional data.</div>'}</div>`;
}
function _buildAttractionsTooltip(t) {
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${_esc(val)}</div></div></div>` : '';
  const link = url => url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#f59e0b">Open</a>` : '';
  const fields = [row('Type',t.tourism||t.historic||''),row('Hours',t.opening_hours||''),row('Fee',t.fee||''),row('Website',link(t.website||t['contact:website']))].join('');
  return `<div class="tth"><h3 id="tt-name">${_esc(t.name||'Attraction')}</h3><div class="ts" id="tt-sub">${_esc(t.operator||t['addr:city']||'')}</div><div class="tm" id="tt-period">⭐ ATTRACTION — OSM</div></div><div class="ttb" id="tt-body">${fields||'<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional data.</div>'}</div>`;
}

function _buildHospitalsTooltip(t) {
  var r = function(l,v){return v?'<div style="font-size:8px;color:var(--dim);margin-top:2px"><span style="color:rgba(255,255,255,0.5)">'+_esc(l)+': </span>'+_esc(v)+'</div>':'';}
  return '<div style="padding:4px 0">'+r('Type',t.emergency||t.health_facility_type||'Hospital')+r('Beds',t.beds)+r('Phone',t['contact:phone']||t.phone)+r('Emergency',t.emergency)+'</div>';
}
function _buildToiletsTooltip(t) {
  var r = function(l,v){return v?'<div style="font-size:8px;color:var(--dim);margin-top:2px"><span style="color:rgba(255,255,255,0.5)">'+_esc(l)+': </span>'+_esc(v)+'</div>':'';}
  return '<div style="padding:4px 0">'+r('Access',t.access)+r('Fee',t.fee)+r('Unisex',t.unisex)+r('Wheelchair',t.wheelchair)+r('Showers',t.shower)+'</div>';
}
function _buildDrinkwaterTooltip(t) {
  var r = function(l,v){return v?'<div style="font-size:8px;color:var(--dim);margin-top:2px"><span style="color:rgba(255,255,255,0.5)">'+_esc(l)+': </span>'+_esc(v)+'</div>':'';}
  return '<div style="padding:4px 0">'+r('Access',t.access)+r('Seasonal',t.seasonal)+r('Fee',t.fee)+'<div style="font-size:8px;color:#22d3ee;margin-top:3px">💧 Safe drinking water</div></div>';
}
function _buildWildlifeTooltip(t) {
  var r = function(l,v){return v?'<div style="font-size:8px;color:var(--dim);margin-top:2px"><span style="color:rgba(255,255,255,0.5)">'+_esc(l)+': </span>'+_esc(v)+'</div>':'';}
  return '<div style="padding:4px 0">'+r('Species',t.species||t.animal)+r('Type',t.leisure||t.natural)+r('Access',t.access)+r('Website',t.website)+'</div>';
}
function _buildGasstationsTooltip(t) {
  var r = function(l,v){return v?'<div style="font-size:8px;color:var(--dim);margin-top:2px"><span style="color:rgba(255,255,255,0.5)">'+_esc(l)+': </span>'+_esc(v)+'</div>':'';}
  return '<div style="padding:4px 0">'+r('Brand',t.brand||t.operator)+r('Fuel',t.fuel||t['fuel:diesel']||'')+r('24h',t.opening_hours)+r('Shop',t.shop)+'</div>';
}

function _buildTippingTooltip(iso2) {
  if (typeof CD_TIPPING === "undefined" || CD_TIPPING[iso2] == null) return "";
  var v = CD_TIPPING[iso2];
  var labels = ["No tipping expected","Tipping optional","Tipping appreciated (10-15%)","Tipping expected (15-20%+)"];
  var notes = [
    "Tipping is not customary here. Simply paying the bill is correct etiquette. Do not tip.",
    "Rounding up or leaving small change is appreciated but never required.",
    "A 10-15% tip is appreciated in restaurants and for personal services.",
    "Server wages depend on tips. 18-20% is standard; 15% is the minimum considered polite."
  ];
  // Dot indicator: filled dots up to tier level
  var dots = "";
  for (var d = 0; d < 4; d++) { dots += d <= v ? "●" : "○"; }
  // Compact header (always shown when tipping layer is active)
  var header = '<div style="margin:6px 0 2px 0;padding:4px 6px;border-top:1px solid rgba(201,168,76,0.25);border-bottom:1px solid rgba(201,168,76,0.10);">'
    + '<span style="font-size:8px;font-weight:700;color:var(--gold);letter-spacing:0.04em;">' + _esc(labels[v]) + '</span>'
    + '<span style="font-size:8px;color:var(--gold);opacity:0.7;margin-left:6px;letter-spacing:0.12em;">' + _esc(dots) + '</span>'
    + '</div>';
  // Industry rows: [icon, label, amounts per tier 0-3]
  var industries = [
    ["🍽", "Restaurants",   ["Not expected","Round up","10-15%","18-20%"]],
    ["🚕", "Taxis / Rides", ["Not expected","Round up","10%","15-20%"]],
    ["🏨", "Hotels",        ["Not expected","€1-2/bag optional","$1-2/bag","$2-5/bag"]],
    ["💆", "Spas / Haircuts",["Not expected","5-10% optional","15%","20%"]],
    ["🗺", "Tour Guides",   ["Not expected","€5-10 optional","$5-10/day","$10-20/day"]]
  ];
  var gridRows = "";
  for (var i = 0; i < industries.length; i++) {
    var row = industries[i];
    gridRows += '<div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">'
      + '<span style="font-size:7.5px;color:rgba(255,255,255,0.65);">' + _esc(row[0]) + " " + _esc(row[1]) + '</span>'
      + '<span style="font-size:7.5px;font-weight:600;color:var(--sand);text-align:right;">' + _esc(row[2][v]) + '</span>'
      + '</div>';
  }
  var grid = "";
  if (typeof activeLayers !== "undefined" && activeLayers.has("tipping")) {
    grid = '<div style="margin:4px 0;padding:5px 7px;background:rgba(201,168,76,0.04);border:1px solid rgba(201,168,76,0.10);border-radius:4px;">'
      + gridRows
      + '</div>';
  }
  var note = '<p class="tt-note">' + _esc(notes[v]) + '</p>';
  return '<div class="tt-section">' + header + grid + note + '</div>';
}

// ─── Country Intelligence (AI) ───────────────────────────────────────────────

var _intelCache = {};

async function _getCountryIntelligence(iso2, countryName) {
  if (_intelCache[iso2]) return _intelCache[iso2];
  var cached = sessionStorage.getItem("na_intel_" + iso2);
  if (cached) { try { var r = JSON.parse(cached); _intelCache[iso2]=r; return r; } catch(e){} }
  var apiKey = sessionStorage.getItem("na_api_key");
  if (!apiKey) return null;
  try {
    var resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 600,
        system: "You are a travel intelligence analyst. Respond ONLY with a JSON object, no markdown fences.",
        messages: [{ role: "user", content: "Travel intelligence brief for " + countryName + " (ISO: " + iso2 + "). Return JSON with keys: origin (2 sentences on how/when the nation formed and what shapes it today), character (2 sentences on national identity and what surprises visitors), complexity (1 honest sentence about a tension a visitor should know), bestFor (array of 3 strings: what this country is uniquely best for), notKnown (1 sentence on what locals are proud of that outsiders rarely know)." }]
      })
    });
    if (!resp.ok) return null;
    var data = await resp.json();
    var text = data.content && data.content[0] && data.content[0].text;
    if (!text) return null;
    var json = JSON.parse(text.replace(/^```json\n?/,"").replace(/\n?```$/,""));
    _intelCache[iso2] = json;
    sessionStorage.setItem("na_intel_" + iso2, JSON.stringify(json));
    return json;
  } catch(e) { return null; }
}

function _renderCountryIntel(iso2, countryName, containerEl) {
  if (!containerEl) return;
  var apiKey = sessionStorage.getItem("na_api_key");
  if (!apiKey) {
    containerEl.innerHTML = "<div class=\"intel-prompt\">Add your API key above to enable AI country intelligence.</div>";
    return;
  }
  containerEl.innerHTML = "<div class=\"intel-loading\">Consulting the almanac…</div>";
  _getCountryIntelligence(iso2, countryName).then(function(intel) {
    if (!intel) { containerEl.innerHTML = "<div class=\"intel-error\">Brief unavailable.</div>"; return; }
    var h = "<div class=\"intel-panel\">";
    if (intel.origin)    h += "<div class=\"intel-sect\"><div class=\"intel-lbl\">ORIGIN</div><p>" + _esc(intel.origin) + "</p></div>";
    if (intel.character) h += "<div class=\"intel-sect\"><div class=\"intel-lbl\">CHARACTER</div><p>" + _esc(intel.character) + "</p></div>";
    if (intel.bestFor && intel.bestFor.length) {
      h += "<div class=\"intel-sect\"><div class=\"intel-lbl\">BEST FOR</div><ul>";
      intel.bestFor.forEach(function(b){ h += "<li>" + _esc(b) + "</li>"; });
      h += "</ul></div>";
    }
    if (intel.notKnown)   h += "<div class=\"intel-sect\"><div class=\"intel-lbl\">WHAT LOCALS KNOW</div><p>" + _esc(intel.notKnown) + "</p></div>";
    if (intel.complexity) h += "<div class=\"intel-sect intel-cx\"><div class=\"intel-lbl\">HONEST COMPLEXITY</div><p>" + _esc(intel.complexity) + "</p></div>";
    h += "</div>";
    containerEl.innerHTML = h;
  });
}

// ─── Rail Stop Markers ────────────────────────────────────────────────────────
// Renders individual station/halt/stop dots when the Rail layer is active.
// Visible at zoom ≥ 7; cleared when rail is deactivated or zoom drops below 7.

function _clearRailStops() {
  _railStopMarkers.forEach(m => m.remove());
  _railStopMarkers = [];
}

async function _fetchAndRenderRailStops() {
  if (!TRANSPORT_LAYERS.rail.active || !map) return;
  const zoom = map.getZoom();
  if (zoom < 7) { _clearRailStops(); return; }

  const bounds  = map.getBounds();
  const bboxKey = _bboxKey(bounds);
  if (_railStopCache[bboxKey]) { _renderRailStopDots(_railStopCache[bboxKey]); return; }

  const s = bounds.getSouth().toFixed(4), w = bounds.getWest().toFixed(4);
  const n = bounds.getNorth().toFixed(4), e = bounds.getEast().toFixed(4);
  const query = `[out:json][timeout:15];node["railway"~"station|halt|stop"]["name"](${s},${w},${n},${e});out body 250;`;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const els = data.elements || [];
    _railStopCache[bboxKey] = els;
    if (TRANSPORT_LAYERS.rail.active && map.getZoom() >= 7) _renderRailStopDots(els);
  } catch (err) {
    console.warn('Rail stop fetch error:', err.message);
  }
}

function _renderRailStopDots(elements) {
  _clearRailStops();
  elements.forEach(el => {
    if (!el.lat || !el.lon) return;
    const t   = el.tags || {};
    const rw  = t.railway || 'stop';
    const r   = rw === 'station' ? 7 : rw === 'halt' ? 5 : 4;
    const col = rw === 'station' ? '#3b82f6' : rw === 'halt' ? '#60a5fa' : '#93c5fd';
    const m   = L.circleMarker([el.lat, el.lon], {
      pane: 'markersPane', radius: r,
      color: '#fff', weight: 1.5,
      fillColor: col, fillOpacity: 0.92,
    });
    m.on('click', ev => {
      _featureClicked = true;
      _ttX = ev.originalEvent.clientX; _ttY = ev.originalEvent.clientY;
      toggleTooltip('railstop:' + el.id, _buildRailStopTooltip(t), _ttX, _ttY);
      setTimeout(() => { _featureClicked = false; }, 10);
    });
    m.addTo(map);
    _railStopMarkers.push(m);
  });
}

function _buildRailStopTooltip(t) {
  const row  = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${val}</div></div></div>` : '';
  const type = (t.railway || 'stop').replace(/_/g, ' ');
  const fields = [
    row('Type',       type),
    row('Operator',   t.operator   || ''),
    row('Lines',      t.line       || ''),
    row('Network',    t.network    || ''),
    row('Platforms',  t.platforms  || ''),
    row('Wheelchair', t.wheelchair || ''),
    row('Ref',        t.ref        || ''),
    row('Note',       t.note       || ''),
  ].join('');
  return `<div class="tth">
    <h3>🚉 ${t.name || t['name:en'] || 'Station'}</h3>
    <div class="ts">${type.toUpperCase()}</div>
    <div class="tm">RAIL STOP — OSM</div>
  </div><div class="ttb">${fields || '<div style="color:#888;font-size:9px;padding:4px 0">No additional data for this stop.</div>'}</div>`;
}

// ─── Park Border Vectors ──────────────────────────────────────────────────────
// Fetches national park and nature reserve boundaries from Overpass and renders
// them as green polylines on the satellite basemap. Replaces the NatGeo tile.

function _clearParkBorders() {
  _parkBorderLines.forEach(l => l.remove());
  _parkBorderLines = [];
}

async function _fetchAndRenderParkBorders() {
  if (!TRANSPORT_LAYERS.natparks.active || !map) return;
  const zoom = map.getZoom();
  if (zoom < 5) { _clearParkBorders(); return; }

  const bounds  = map.getBounds();
  const bboxKey = _bboxKey(bounds);
  if (_parkBorderCache[bboxKey]) { _renderParkBorderVectors(_parkBorderCache[bboxKey]); return; }

  const st = document.getElementById('map-status');
  if (st) { st.textContent = '🌲 Loading park boundaries…'; st.style.display = 'block'; }

  const s = bounds.getSouth().toFixed(4), w = bounds.getWest().toFixed(4);
  const n = bounds.getNorth().toFixed(4), e = bounds.getEast().toFixed(4);
  // National parks in OSM are primarily relations (multipolygon boundary).
  // "(._;>;)" recursively expands relations → member ways → nodes so Overpass
  // returns full geometry.  We then filter to way elements which carry coordinates.
  const query = `[out:json][timeout:35];(relation["boundary"="national_park"](${s},${w},${n},${e});relation["leisure"="nature_reserve"](${s},${w},${n},${e});way["boundary"="national_park"](${s},${w},${n},${e});way["leisure"="nature_reserve"](${s},${w},${n},${e}););(._;>;);out geom qt 300;`;

  try {
    const res  = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query));
    if (res.status === 429) throw new Error('Rate limit');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const els  = (data.elements || []).filter(el => el.geometry && el.geometry.length > 1);
    _parkBorderCache[bboxKey] = els;
    if (TRANSPORT_LAYERS.natparks.active) _renderParkBorderVectors(els);
    if (st) st.style.display = 'none';
  } catch (err) {
    const msg = err.message === 'Rate limit' ? '⚠ Rate limit — wait and pan to retry' : '⚠ Park boundary data unavailable';
    if (st) { st.textContent = msg; st.style.display = 'block'; setTimeout(() => { st.style.display = 'none'; }, 4000); }
  }
}

function _renderParkBorderVectors(elements) {
  _clearParkBorders();
  elements.forEach(el => {
    if (!el.geometry || el.geometry.length < 2) return;
    const coords = el.geometry.map(pt => [pt.lat, pt.lon]);
    const t      = el.tags || {};
    const kind   = t['boundary'] === 'national_park' ? 'National Park'
                 : t['leisure']  === 'nature_reserve' ? 'Nature Reserve' : 'Protected Area';
    const l = L.polyline(coords, {
      pane:      'parkPane',
      color:     '#22c55e',
      weight:    2.2,
      opacity:   0.85,
      dashArray: null,
    });
    l.on('click', ev => {
      _featureClicked = true;
      _ttX = ev.originalEvent.clientX; _ttY = ev.originalEvent.clientY;
      toggleTooltip('parkborder:' + el.id, _buildParkTooltip(t), _ttX, _ttY);
      setTimeout(() => { _featureClicked = false; }, 10);
    });
    l.addTo(map);
    _parkBorderLines.push(l);
  });
}

// ─── Vector Road Overlay ──────────────────────────────────────────────────────
// Roads are fetched from Overpass and rendered as colored polylines.
// Highway type determines color; every segment is clickable.

const HW_COLOR = {
  motorway:'#ef4444', trunk:'#f97316', primary:'#eab308',
  secondary:'#84cc16', tertiary:'#22c55e',
  residential:'#94a3b8', service:'#64748b', unclassified:'#94a3b8',
  living_street:'#64748b', cycleway:'#38bdf8', pedestrian:'#c084fc',
};

function _clearRoads() {
  _roadLines.forEach(l => l.remove());
  _roadLines = [];
}

async function _fetchAndRenderRoads() {
  if (!TRANSPORT_LAYERS.roads.active || !map) return;
  const zoom = map.getZoom();
  if (zoom < 9) {
    _clearRoads();
    const st = document.getElementById('map-status');
    if (st) {
      st.textContent = '🛣 Zoom in further (level 9+) to render road vectors';
      st.style.display = 'block';
      setTimeout(() => { st.style.display = 'none'; }, 5000);
    }
    return;
  }

  if (_roadDebounce) clearTimeout(_roadDebounce);
  _roadDebounce = setTimeout(async () => {
    if (!TRANSPORT_LAYERS.roads.active || !map) return;
    const bounds  = map.getBounds();
    const bboxKey = _bboxKey(bounds);
    if (_roadCache[bboxKey]) { _renderRoadVectors(_roadCache[bboxKey]); return; }

    const st = document.getElementById('map-status');
    if (st) { st.textContent = '🛣 Loading roads…'; st.style.display = 'block'; }

    const s = bounds.getSouth().toFixed(4), w = bounds.getWest().toFixed(4);
    const n = bounds.getNorth().toFixed(4), e = bounds.getEast().toFixed(4);
    // At lower zoom show only major roads; at higher zoom add residential/service.
    const hwFilter = zoom >= 13
      ? '"highway"~"motorway|trunk|primary|secondary|tertiary|residential|living_street|pedestrian|cycleway"'
      : '"highway"~"motorway|trunk|primary|secondary|tertiary"';
    const query = `[out:json][timeout:30];way[${hwFilter}](${s},${w},${n},${e});out geom qt 500;`;
    try {
      const res  = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query));
      if (res.status === 429) throw new Error('Rate limit');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const ways = (data.elements || []).filter(el => el.geometry && el.geometry.length > 1);
      _roadCache[bboxKey] = ways;
      if (TRANSPORT_LAYERS.roads.active) _renderRoadVectors(ways);
      if (st) st.style.display = 'none';
    } catch (err) {
      const msg = err.message === 'Rate limit' ? '⚠ Rate limit — wait a moment and pan' : '⚠ Roads data unavailable';
      if (st) { st.textContent = msg; st.style.display = 'block'; setTimeout(() => { st.style.display = 'none'; }, 4000); }
    }
  }, 350);
}

function _renderRoadVectors(ways) {
  _clearRoads();
  if (!TRANSPORT_LAYERS.roads.active || !map) return;
  ways.forEach(el => {
    if (!el.geometry || el.geometry.length < 2) return;
    const t     = el.tags || {};
    const hw    = t.highway || 'unclassified';
    const color = HW_COLOR[hw] || '#94a3b8';
    const weight = hw === 'motorway' ? 4 : hw === 'trunk' ? 3.5 : hw === 'primary' ? 3
                 : hw === 'secondary' ? 2.5 : hw === 'tertiary' ? 2 : 1.5;
    const coords = el.geometry.map(pt => [pt.lat, pt.lon]);
    const l = L.polyline(coords, {
      pane:    'transportPane',
      color,
      weight,
      opacity: 0.85,
      smoothFactor: 1.2,
    });
    l.on('click', ev => {
      _featureClicked = true;
      const name  = t.name || t['name:en'] || t.ref || hw.replace(/_/g, ' ');
      const ref   = t.ref   ? ` · Ref: ${t.ref}` : '';
      const spd   = t.maxspeed ? ` · Max ${t.maxspeed}` : '';
      const surf  = t.surface ? ` · ${t.surface}` : '';
      const lanes = t.lanes  ? ` · ${t.lanes} lanes` : '';
      const from  = t.from || (coords[0] ? `${coords[0][0].toFixed(4)}, ${coords[0][1].toFixed(4)}` : '');
      const to    = t.to   || (coords[coords.length-1] ? `${coords[coords.length-1][0].toFixed(4)}, ${coords[coords.length-1][1].toFixed(4)}` : '');
      const html  = `<div class="tth">
        <h3 id="tt-name">${name}</h3>
        <div class="ts" id="tt-sub">${hw.replace(/_/g,' ').toUpperCase()}${ref}</div>
        <div class="tm" id="tt-period">ROAD — OSM</div>
      </div><div class="ttb" id="tt-body">
        <div class="ttr"><div class="ttstrip" style="background:${color}"></div><div class="tti">
          <div class="ttln">ROUTE</div>
          <div class="ttrat" style="color:${color}">${name}</div>
          <div class="ttdesc">${from ? 'From: ' + from : ''}${to ? ' → To: ' + to : ''}${spd}${surf}${lanes}</div>
        </div></div>
      </div>`;
      toggleTooltip('road:' + el.id, html, ev.originalEvent.clientX, ev.originalEvent.clientY);
      setTimeout(() => { _featureClicked = false; }, 10);
    });
    l.addTo(map);
    _roadLines.push(l);
  });
}

// ─── Road Click Info (legacy — kept for map-click fallback on road tiles) ────
// Queries Overpass for named roads and highway refs near the click point.

async function fetchRoadInfo(lat, lng) {
  try {
    const query = `[out:json][timeout:10];(way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|service|unclassified"]["name"](around:250,${lat},${lng});way["highway"~"motorway|trunk|primary|secondary"]["ref"](around:600,${lat},${lng}););out body 20;`;
    const res  = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const ways = (data.elements || []);

    if (ways.length === 0) {
      return `<div class="tth"><h3>🛣 No Road Found</h3><div class="ts">ROADS — OSM</div><div class="tm">Try clicking on a highlighted road</div></div>
        <div class="ttb"><div style="color:#888;font-size:9px">No named road within 250 m. The overlay shows all road classes — click directly on a coloured road line for data.</div></div>`;
    }

    const HW_COLOR = {
      motorway:'#e11d48', trunk:'#dc2626', primary:'#ea580c',
      secondary:'#d97706', tertiary:'#ca8a04', residential:'#6b7280',
      service:'#9ca3af', unclassified:'#9ca3af',
    };
    const rows = ways.slice(0, 5).map(w => {
      const t    = w.tags || {};
      const hw   = t.highway || '';
      const name = t.name || t['name:en'] || t.ref || `(${hw.replace(/_/g, ' ')})`;
      const ref  = t.ref  ? ` · ${t.ref}` : '';
      const spd  = t.maxspeed ? ` · ${t.maxspeed}` : '';
      const surf = t.surface ? ` · ${t.surface}` : '';
      const col  = HW_COLOR[hw] || '#9ca3af';
      return `<div class="ttr">
        <div class="ttstrip" style="background:${col}"></div>
        <div class="tti">
          <div class="ttln">${hw.replace(/_/g, ' ').toUpperCase()}</div>
          <div class="ttrat" style="color:#1a1a1a">${name}</div>
          <div class="ttdesc">${ref}${spd}${surf}</div>
        </div></div>`;
    }).join('');

    return `<div class="tth">
      <h3>🛣 Roads</h3>
      <div class="ts">ROADS — OSM</div>
      <div class="tm">Within 250 m of click point</div>
    </div><div class="ttb">${rows}</div>`;

  } catch (e) {
    return `<div class="tth"><h3>🛣 Roads</h3><div class="ts">CONNECTION ERROR</div></div>
      <div class="ttb"><div style="color:#888;font-size:9px">Could not load road data. Check your connection.</div></div>`;
  }
}

// ─── Climate Zones ────────────────────────────────────────────────────────────
function initClimateZones() {
  if (typeof CLIMATE_ZONES === 'undefined' || !CLIMATE_ZONES.length) return;
  // Dedicated SVG renderer in climatePane (z-index 290) so climate zones render
  // below the country / admin-1 choropleth (choroplethPane, z-index 300).
  // CSS blur is applied to the climatePane container only — country borders stay crisp.
  _climateRenderer = L.svg({ pane: 'climatePane' });
  climateZoneLayer = L.geoJSON(
    {
      type: 'FeatureCollection',
      features: CLIMATE_ZONES.map(z => ({
        type: 'Feature',
        properties: { id: z.id, name: z.name, parent: z.parent, layers: z.layers },
        geometry: z.geometry,
      })),
    },
    {
      pane: 'climatePane',
      renderer: _climateRenderer,
      style: f => styleClimateZone(f.properties),
      onEachFeature: (f, layer) => {
        layer.on('click', e => {
          _featureClicked = true;
          toggleTooltip('climate:' + f.properties.id, buildClimateZoneTooltip(f.properties), e.originalEvent.clientX, e.originalEvent.clientY);
          setTimeout(() => { _featureClicked = false; }, 10);
        });
      },
    }
  );
}

function styleClimateZone(props) {
  const activeGeoLayer = [...activeLayers].find(lk => GEOGRAPHIC_LAYERS.has(lk) && props.layers[lk]);
  if (!activeGeoLayer) return { fillOpacity: 0, opacity: 0, weight: 0 };
  const v = getRating(props.layers[activeGeoLayer]);
  if (v === null) return { fillOpacity: 0, opacity: 0, weight: 0 };
  return {
    fillColor: RC[Math.min(3, Math.max(0, v))],
    // Lower opacity — climate zones are background texture below choropleth fill
    fillOpacity: 0.28,
    color: 'rgba(0,0,0,0)',
    opacity: 0,
    weight: 0,
  };
}

function buildClimateZoneTooltip(props) {
  const geoRows = buildLayerRows(props.layers);
  const parentData = CD[props.parent];
  let politicalRows = '';
  if (parentData) {
    const politicalKeys = [...activeLayers].filter(lk => !GEOGRAPHIC_LAYERS.has(lk));
    if (politicalKeys.length) {
      const filtered = {};
      politicalKeys.forEach(lk => { if (parentData[lk]) filtered[lk] = parentData[lk]; });
      if (Object.keys(filtered).length) {
        politicalRows = `<div style="padding:4px 8px 2px;font-size:7.5px;color:#8a7a50;letter-spacing:0.06em;text-transform:uppercase;border-top:1px solid rgba(201,168,76,0.12);margin-top:4px">Political data — ${countryNames[props.parent] || props.parent}</div>` +
          buildLayerRows(filtered, { iso2: props.parent });
      }
    }
  }
  return `<div class="tth">
    <h3 id="tt-name">${props.name}</h3>
    <div class="ts" id="tt-sub">CLIMATE ZONE</div>
    <div class="tm" id="tt-period">${periodLabel()}</div>
  </div>
  <div class="ttb" id="tt-body">${geoRows}${politicalRows}</div>`;
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function positionTooltip(cx, cy) {
  const tt  = document.getElementById('tt');
  const tb  = document.getElementById('topbar');
  const tbH = tb ? tb.offsetHeight + 6 : 90;
  const W   = tt.offsetWidth  || 260;
  const H   = tt.offsetHeight || 200;
  let left  = cx + 18;
  let top   = cy - 20;
  if (left + W > window.innerWidth  - 10) left = cx - W - 18;
  top = Math.max(tbH, top);
  top = Math.min(window.innerHeight - H - 10, top);
  tt.style.left = left + 'px';
  tt.style.top  = top  + 'px';
  _ttX = cx; _ttY = cy;
}

function showTooltip(html) {
  const tt = document.getElementById('tt');
  // Close button injected at the top so users can dismiss and copy text freely
  const closeBtn = '<button id="tt-close" title="Close" aria-label="Close tooltip" onclick="hideTooltip()">&#x2715;</button>';
  tt.scrollTop = 0;
  tt.innerHTML = closeBtn + html;
  tt.style.display = 'block';
  tooltipVisible = true;
  positionTooltip(_ttX, _ttY);
  // Attach wishlist toggle listener if a wishlist button was rendered in this tooltip
  var wishlistBtns = tt.querySelectorAll('[id^="btn-wishlist-"]');
  wishlistBtns.forEach(function(btn) {
    var iso2 = btn.id.replace('btn-wishlist-', '');
    btn.addEventListener('click', function() { _toggleWishlist(iso2); });
  });
}

function hideTooltip() {
  document.getElementById('tt').style.display = 'none';
  tooltipVisible = false;
  _activeTooltipKey = null;
}

// ─── Holiday Markers ──────────────────────────────────────────────────────────
function _clearHolidayMarkers() {
  _holidayMarkers.forEach(m => m.remove());
  _holidayMarkers = [];
}

function _buildHolidayTooltip(iso2, month, holidays) {
  const mName = ['January','February','March','April','May','June','July','August','September','October','November','December'][month];
  const cName = (typeof countryNames !== 'undefined' && countryNames[iso2]) || iso2;
  const holHtml = holidays.map(h =>
    `<div style="font-size:9px;color:#1a1a1a;padding:3px 0;border-bottom:1px solid rgba(0,0,0,0.06)">${h}</div>`
  ).join('');
  return `<div class="tth"><h3 id="tt-name">${cName}</h3>
    <div class="ts" id="tt-sub">🗓 PUBLIC HOLIDAYS</div>
    <div class="tm" id="tt-period">${mName.toUpperCase()}</div></div>
    <div class="ttb" id="tt-body">
      <div class="ttln">HOLIDAYS THIS MONTH</div>
      ${holHtml}
    </div>`;
}

function _renderHolidayMarkers() {
  _clearHolidayMarkers();
  if (!POI_LAYERS.holidays || !POI_LAYERS.holidays.active) return;
  if (typeof COUNTRY_HOLIDAYS === 'undefined') return;
  if (!map) return;
  const months = yearMode
    ? [0,1,2,3,4,5,6,7,8,9,10,11]
    : [...selectedMonths].length ? [...selectedMonths] : [activeMonth];

  // Build a centroid lookup: COUNTRY_CENTERS (always available) plus _geoData bounds
  // for any country not in COUNTRY_CENTERS.
  const centroids = {};
  if (typeof COUNTRY_CENTERS !== 'undefined') {
    Object.entries(COUNTRY_CENTERS).forEach(([iso2, c]) => {
      centroids[iso2] = { lat: c[0], lng: c[1] };
    });
  }
  if (_geoData && _geoData.features) {
    _geoData.features.forEach(f => {
      const iso2 = getIso2(f.properties);
      if (!iso2 || centroids[iso2]) return;   // already have it
      try {
        const b = L.geoJSON(f).getBounds();
        const lat = (b.getSouth() + b.getNorth()) / 2;
        const lng = (b.getWest()  + b.getEast())  / 2;
        if (isFinite(lat) && isFinite(lng)) centroids[iso2] = { lat, lng };
      } catch(_) {}
    });
  }

  Object.keys(COUNTRY_HOLIDAYS).forEach(iso2 => {
    const hols = [];
    months.forEach(m => {
      const list = COUNTRY_HOLIDAYS[iso2][m];
      if (list && list.length) hols.push(...list);
    });
    if (!hols.length) return;
    const c = centroids[iso2];
    if (!c) return;
    const marker = L.circleMarker([c.lat, c.lng], {
      pane: 'markersPane', radius: 7,
      color: '#ffffff', weight: 1.5,
      fillColor: '#f59e0b', fillOpacity: 0.88,
    });
    marker.on('click', ev => {
      _featureClicked = true;
      const activeM = months[0] !== undefined ? months[0] : activeMonth;
      toggleTooltip(
        'holiday:' + iso2 + ':' + activeM,
        _buildHolidayTooltip(iso2, activeM, hols),
        ev.originalEvent.clientX, ev.originalEvent.clientY
      );
      setTimeout(() => { _featureClicked = false; }, 10);
    });
    marker.addTo(map);
    _holidayMarkers.push(marker);
  });
}

// Clicking the same map feature twice toggles the tooltip off (dismiss).
// key: unique string identifying the feature (e.g. 'country:FR', 'city:Paris').
// If the feature's tooltip is already open, the tooltip is hidden.
// If a different feature is clicked, the tooltip is replaced.
function toggleTooltip(key, html, cx, cy) {
  if (_activeTooltipKey === key && tooltipVisible) {
    hideTooltip();
    return;
  }
  _activeTooltipKey = key;
  _ttX = cx; _ttY = cy;
  showTooltip(html);
}

// Track mouse position so positionTooltip() has a fallback coordinate.
// Tooltip is click-anchored and no longer repositions on mousemove.
document.addEventListener('mousemove', e => { _ttX = e.clientX; _ttY = e.clientY; });
// Allow keyboard users to dismiss an open tooltip with the Escape key.
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideTooltip(); });

// ─── Persistence helpers ──────────────────────────────────────────────────────
// Silently no-ops if localStorage is unavailable (private browsing, quota full).
function saveState() {
  try {
    localStorage.setItem('na_month',       String(activeMonth));
    localStorage.setItem('na_layers',      JSON.stringify([...activeLayers]));
    localStorage.setItem('na_nationality', selectedNationality || '');
  } catch (_) {}
}
function loadState() {
  try {
    const m = localStorage.getItem('na_month');
    if (m !== null) { const n = parseInt(m); if (!isNaN(n) && n >= 0 && n <= 11) activeMonth = n; }
    const l = localStorage.getItem('na_layers');
    if (l) {
      const arr = JSON.parse(l);
      // Discard any stale keys that no longer exist in LAYERS (e.g. after a rename/removal).
      const valid = Array.isArray(arr) ? arr.filter(k => typeof LAYERS !== 'undefined' && k in LAYERS) : [];
      if (valid.length) activeLayers = new Set(valid);
    }
    const nat = localStorage.getItem('na_nationality');
    if (nat) selectedNationality = nat;
  } catch (_) {}
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
const BAR_H = [15, 10, 6, 2];

function buildSparkline(arr) {
  const bars = arr.map((v, i) => {
    const h = BAR_H[Math.min(3, Math.max(0, v))];
    const active = selectedMonths.has(i) || yearMode;
    const op = active ? 1 : 0.3;
    return `<div class="spark-bar" style="height:${h}px;background:${RC[v]};opacity:${op}"></div>`;
  }).join('');
  return `<div class="spark">${bars}</div>
    <div class="spark-labels">
      <span class="spark-label">JAN</span>
      <span class="spark-label">JUN</span>
      <span class="spark-label">DEC</span>
    </div>`;
}

// ─── Tooltip Content ──────────────────────────────────────────────────────────

// Returns a two-character flag emoji for the given ISO-2 code.
// Uses Unicode Regional Indicator symbols (U+1F1E6–U+1F1FF).
function getFlag(iso2) {
  if (!iso2 || iso2.length !== 2) return '';
  try {
    return iso2.toUpperCase().split('').map(c =>
      String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
    ).join('');
  } catch(_) { return ''; }
}

// Renders a 4-segment horizontal bar where filled segments reflect quality.
// rating 0 (best) → 4 filled bars; rating 3 (worst) → 1 filled bar.
function buildRatingBar(rating, color) {
  const count = 4 - Math.round(Math.min(3, Math.max(0, rating)));
  const seg = (on) => `<span style="display:inline-block;width:9px;height:6px;border-radius:2px;margin-right:3px;background:${on ? color : 'rgba(255,255,255,0.10)'}"></span>`;
  return `<div style="margin-top:5px;line-height:1">${[0,1,2,3].map(i => seg(i < count)).join('')}</div>`;
}

// Builds a composite travel-score chip (0–100, higher = better) from all
// currently active layers.  Returns an empty string when nothing is active.
function buildCompositeScore(dataObj, iso2) {
  if (!dataObj || activeLayers.size === 0) return '';
  const ratings = [];
  activeLayers.forEach(key => {
    let r = null;
    if (key === 'cost'     && typeof CD_COST     !== 'undefined') r = CD_COST[iso2]     ?? null;
    else if (key === 'safety'   && typeof CD_SAFETY   !== 'undefined') r = CD_SAFETY[iso2]   ?? null;
    else if (key === 'internet' && typeof CD_INTERNET !== 'undefined') r = CD_INTERNET[iso2] ?? null;
    else if (key === 'visa') r = selectedNationality ? getVisaRating(iso2, selectedNationality) : null;
    else if (dataObj[key] != null) r = getRating(dataObj[key]);
    if (r !== null) ratings.push(r);
  });
  if (!ratings.length) return '';
  const avg   = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const score = Math.round(100 - (avg / 3) * 100);
  const col   = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const lbl   = score >= 75 ? 'Great time to visit' : score >= 50 ? 'Decent conditions' : 'Check advisories';
  return `<div style="display:inline-flex;align-items:center;gap:7px;margin-top:7px;padding:4px 10px 4px 6px;background:rgba(${score>=75?'34,197,94':score>=50?'245,158,11':'239,68,68'},0.10);border:1px solid rgba(${score>=75?'34,197,94':score>=50?'245,158,11':'239,68,68'},0.30);border-radius:20px">
    <span style="width:22px;height:22px;border-radius:50%;background:${col};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0">${score}</span>
    <span style="font-size:8px;color:rgba(232,213,163,0.8);letter-spacing:1px;text-transform:uppercase;font-weight:600">${lbl}</span>
  </div>`;
}

// Toggles the temperature unit (°C ↔ °F) in the currently visible tooltip.
// Works by updating data-celsius spans in-place — no full re-render needed.
function toggleTempUnit() {
  _tempUnit = _tempUnit === 'C' ? 'F' : 'C';
  document.querySelectorAll('.tt-temp-val').forEach(el => {
    const c = parseFloat(el.dataset.celsius);
    if (!isNaN(c)) {
      el.textContent = _tempUnit === 'F' ? (Math.round(c * 9 / 5 + 32) + '°F') : (c + '°C');
    }
  });
  document.querySelectorAll('.tt-unit-btn').forEach(el => {
    el.textContent = _tempUnit === 'C' ? '→°F' : '→°C';
    el.title = _tempUnit === 'C' ? 'Switch to Fahrenheit' : 'Switch to Celsius';
  });
}

// Builds a detailed climate card for the weather info section.
// Shows average temperature (with live F/C toggle) and average rainfall
// for the currently selected month(s), plus any seasonal event alerts.
// ─── Solar Calculator ─────────────────────────────────────────────────────────
// Pure-JS sunrise/sunset estimation using solar declination + hour angle formula.
// Accuracy: ±5 minutes (ignores equation of time). No API, no network call.
// lat/lng in decimal degrees; utcOffset in integer hours; month 0–11.
// Returns { rise:'HH:MM', set:'HH:MM', daylight:'Xh Ym', polar:'night'|'day'|null }
function calcSunriseSunset(lat, lng, utcOffset, month) {
  // Representative day-of-year for the 15th of each month
  const DOY = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349];
  const d = DOY[month];
  const toRad = x => x * Math.PI / 180;

  // Solar declination (Spencer formula)
  const decl = -23.45 * Math.cos(toRad((360 / 365) * (d + 10)));

  // Hour angle at sunrise/sunset (cos(H) = -tan(lat)·tan(decl))
  const cosH = -Math.tan(toRad(lat)) * Math.tan(toRad(decl));
  if (cosH >  1) return { rise: null, set: null, daylight: null, polar: 'night' };
  if (cosH < -1) return { rise: null, set: null, daylight: null, polar: 'day'   };

  const H = Math.acos(cosH) * 180 / Math.PI;          // degrees

  // Solar noon in UTC (longitude offset, ignores equation of time)
  const noonUTC = 12 - (lng / 15);
  const riseUTC = noonUTC - H / 15;
  const setUTC  = noonUTC + H / 15;

  // Shift to local clock using UTC offset, wrap to 0–24
  const wrap = v => ((v % 24) + 24) % 24;
  const riseL = wrap(riseUTC + utcOffset);
  const setL  = wrap(setUTC  + utcOffset);

  const fmt = h => {
    let hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    if (mm === 60) { mm = 0; hh++; }
    return `${String(hh % 24).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  };

  const daylightH = Math.floor(H * 2 / 15);
  const daylightM = Math.round(((H * 2 / 15) - daylightH) * 60);
  const daylight  = `${daylightH}h ${daylightM}m`;

  return { rise: fmt(riseL), set: fmt(setL), daylight, polar: null };
}

// ─── Live Weather (Open-Meteo) ────────────────────────────────────────────────
var _weatherCache = {};

var _WMO_DESC = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Foggy',48:'Icy fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',73:'Snow',75:'Heavy snow',80:'Showers',81:'Rain showers',82:'Heavy showers',85:'Snow showers',95:'Thunderstorm',96:'Thunderstorm + hail',99:'Heavy thunderstorm'};
var _WMO_EMOJI = {0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',48:'🌫',51:'🌦',53:'🌦',55:'🌧',61:'🌦',63:'🌧',65:'🌧',71:'🌨',73:'❄️',75:'❄️',80:'🌦',81:'🌧',82:'⛈',85:'🌨',95:'⛈',96:'⛈',99:'⛈'};

function _fetchCurrentWeather(lat, lng, iso2, callback) {
  var key = iso2 || (Math.round(lat*2)/2 + ',' + Math.round(lng*2)/2);
  if (_weatherCache[key]) { callback(_weatherCache[key]); return; }
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat.toFixed(3) + '&longitude=' + lng.toFixed(3) + '&current_weather=true&wind_speed_unit=kmh';
  fetch(url, {signal: AbortSignal.timeout(5000)})
    .then(function(r){return r.json();})
    .then(function(d){
      if (d && d.current_weather) {
        _weatherCache[key] = d.current_weather;
        callback(d.current_weather);
      }
    })
    .catch(function(){});
}

function _injectWeatherRow(iso2, lat, lng) {
  var el = document.getElementById('weather-live-' + iso2);
  if (!el) return;
  _fetchCurrentWeather(lat, lng, iso2, function(w) {
    var code = w.weathercode || 0;
    var emoji = _WMO_EMOJI[code] || '🌡';
    var desc = _WMO_DESC[code] || ('Code ' + code);
    var temp = (typeof _tempUnit !== 'undefined' && _tempUnit === 'F')
      ? Math.round(w.temperature * 9/5 + 32) + '°F'
      : Math.round(w.temperature) + '°C';
    el.innerHTML = '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-top:1px solid rgba(255,255,255,0.06);margin-top:4px">' +
      '<span style="font-size:16px">' + emoji + '</span>' +
      '<span style="font-size:9px;color:var(--sand)">' + temp + ' — ' + _esc(desc) + '</span>' +
      '<span style="font-size:8px;color:var(--dim);margin-left:auto">💨' + Math.round(w.windspeed) + 'km/h</span>' +
      '</div>';
  });
}

function _buildSeasonCalendar(iso2) {
  if (typeof CD_CLIMATE === 'undefined' || !CD_CLIMATE[iso2]) return '';
  var temps = CD_CLIMATE[iso2].temp;
  if (!temps) return '';
  var valid = temps.filter(function(t){return t!=null;});
  if (valid.length < 4) return '';
  var maxT = Math.max.apply(null, valid);
  var minT = Math.min.apply(null, valid);
  var rng = maxT - minT || 1;
  var mn = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  var bars = temps.map(function(t,i) {
    if (t == null) return '<div style="flex:1"></div>';
    var pct = Math.round(((t-minT)/rng)*100);
    var col = t > 25 ? '#ef4444' : t > 15 ? '#fbbf24' : t > 5 ? '#22d3ee' : '#818cf8';
    var h = Math.max(4, Math.round(pct * 0.36));
    var active = (i === activeMonth) ? 'box-shadow:0 0 4px ' + col + ';outline:1px solid ' + col + ';outline-offset:1px;' : '';
    return '<div style="display:flex;flex-direction:column;align-items:center;flex:1;cursor:default" title="' + mn[i] + ': ' + t + (typeof _tempUnit!=='undefined'&&_tempUnit==='F'?'°F':'°C') + '">' +
      '<div style="font-size:6.5px;color:var(--dim);margin-bottom:1px">' + t + '°</div>' +
      '<div style="width:8px;height:' + h + 'px;background:' + col + ';border-radius:2px 2px 0 0;' + active + '"></div>' +
      '<div style="font-size:5.5px;color:var(--dim);margin-top:2px">' + mn[i] + '</div>' +
      '</div>';
  }).join('');
  return '<div style="margin-top:8px;padding:6px;background:rgba(255,255,255,0.03);border-radius:6px;border:1px solid rgba(255,255,255,0.06)">' +
    '<div style="font-size:7.5px;color:var(--dim);margin-bottom:6px">📅 Temperature year-round (click month bar to filter)</div>' +
    '<div style="display:flex;align-items:flex-end;height:52px;gap:1px">' + bars + '</div>' +
    '<div style="display:flex;justify-content:space-between;margin-top:4px">' +
    '<span style="font-size:7px;color:var(--dim)">❄️ ' + minT + (typeof _tempUnit!=='undefined'&&_tempUnit==='F'?'°F':'°C') + '</span>' +
    '<span style="font-size:7px;color:var(--dim)">☀️ ' + maxT + (typeof _tempUnit!=='undefined'&&_tempUnit==='F'?'°F':'°C') + '</span></div>' +
    '</div>';
}

function buildWeatherDetails(iso2) {
  if (typeof CD_CLIMATE === 'undefined' || !CD_CLIMATE[iso2]) return '';
  const cl = CD_CLIMATE[iso2];
  const months = yearMode ? [0,1,2,3,4,5,6,7,8,9,10,11] : [...selectedMonths];
  const temps = months.map(m => cl.temp[m]).filter(v => v != null && !isNaN(v));
  const rains = months.map(m => cl.rain[m]).filter(v => v != null && !isNaN(v));
  if (!temps.length) return '';

  const avgTempC = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
  const avgRain  = Math.round(rains.reduce((a, b) => a + b, 0) / rains.length);

  const dispTemp = _tempUnit === 'F'
    ? (Math.round(avgTempC * 9 / 5 + 32) + '°F')
    : (avgTempC + '°C');
  const unitLabel = _tempUnit === 'C' ? '→°F' : '→°C';
  const unitTitle = _tempUnit === 'C' ? 'Switch to Fahrenheit' : 'Switch to Celsius';

  // Determine rainfall emoji
  const rainEmoji = avgRain < 20 ? '☀️' : avgRain < 80 ? '🌤' : avgRain < 180 ? '🌧' : '⛈';

  // Seasonal events for this country + month(s)
  const events = (typeof SEASONAL_EVENTS !== 'undefined' ? SEASONAL_EVENTS : [])
    .filter(e => e.country === iso2 && months.includes(e.month));
  const eventHtml = events.map(e =>
    `<div style="margin-top:6px;padding:5px 8px;background:rgba(201,168,76,0.06);border-left:2px solid rgba(201,168,76,0.35);border-radius:0 4px 4px 0">
       <div style="font-size:8px;font-weight:700;color:var(--gold);letter-spacing:1.2px;text-transform:uppercase">${e.emoji} ${e.name}</div>
       <div class="ttdesc" style="margin-top:2px">${e.desc}</div>
     </div>`
  ).join('');

  // Sunrise / sunset — computed for the representative month using solar declination
  let solarHtml = '';
  const center = (typeof COUNTRY_CENTERS !== 'undefined') ? COUNTRY_CENTERS[iso2] : null;
  const utcOff = (typeof CD_TIMEZONE !== 'undefined' && CD_TIMEZONE[iso2] != null) ? CD_TIMEZONE[iso2] : 0;
  if (center) {
    const repMonth = yearMode ? 5 : [...selectedMonths].sort((a, b) => a - b)[0]; // June for year mode
    const solar = calcSunriseSunset(center[0], center[1], utcOff, repMonth);
    if (solar.polar === 'night') {
      solarHtml = `<div style="margin-top:6px;padding:5px 8px;background:rgba(30,20,60,0.35);border:1px solid rgba(100,80,200,0.2);border-radius:6px;font-size:8px;color:#a78bfa;text-align:center">🌑 Polar Night — sun does not rise this month</div>`;
    } else if (solar.polar === 'day') {
      solarHtml = `<div style="margin-top:6px;padding:5px 8px;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:6px;font-size:8px;color:#fbbf24;text-align:center">☀️ Midnight Sun — sun does not set this month</div>`;
    } else {
      solarHtml = `<div style="margin-top:6px;display:flex;align-items:center;justify-content:space-around;padding:5px 8px;background:rgba(251,191,36,0.04);border:1px solid rgba(251,191,36,0.12);border-radius:6px">
        <div style="text-align:center">
          <div style="font-size:7px;color:rgba(251,191,36,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">SUNRISE</div>
          <div style="font-size:13px;font-weight:700;color:#fde68a">🌅 ${solar.rise}</div>
        </div>
        <div style="width:1px;height:28px;background:rgba(251,191,36,0.12)"></div>
        <div style="text-align:center">
          <div style="font-size:7px;color:rgba(251,191,36,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">SUNSET</div>
          <div style="font-size:13px;font-weight:700;color:#fde68a">🌇 ${solar.set}</div>
        </div>
        <div style="width:1px;height:28px;background:rgba(251,191,36,0.12)"></div>
        <div style="text-align:center">
          <div style="font-size:7px;color:rgba(251,191,36,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">DAYLIGHT</div>
          <div style="font-size:11px;font-weight:700;color:#fde68a">⏱ ${solar.daylight}</div>
        </div>
      </div>`;
    }
  }

  return `<div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(201,168,76,0.12)">
    <div id="weather-live-${iso2}" style="min-height:10px"></div>
    <div class="ttln">MONTHLY CLIMATE — ${periodLabel()}</div>
    <div style="display:flex;gap:10px;margin-top:8px;align-items:flex-start">
      <div style="flex:1;background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.12);border-radius:6px;padding:7px 9px;text-align:center">
        <div style="font-size:7.5px;color:rgba(201,168,76,0.55);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:4px">AVG TEMP</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:5px">
          <span class="tt-temp-val" data-celsius="${avgTempC}" style="font-size:19px;font-weight:700;color:var(--sand)">${dispTemp}</span>
        </div>
        <button class="tt-unit-btn" onclick="toggleTempUnit()" title="${unitTitle}" style="margin-top:5px;font-size:7px;color:var(--gold);background:rgba(201,168,76,0.10);border:1px solid rgba(201,168,76,0.25);border-radius:3px;padding:2px 6px;cursor:pointer;font-family:var(--fm);letter-spacing:0.5px;line-height:1.4">${unitLabel}</button>
      </div>
      <div style="flex:1;background:rgba(96,165,250,0.05);border:1px solid rgba(96,165,250,0.15);border-radius:6px;padding:7px 9px;text-align:center">
        <div style="font-size:7.5px;color:rgba(96,165,250,0.65);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:4px">AVG RAINFALL</div>
        <div style="font-size:19px;font-weight:700;color:#93c5fd">${rainEmoji} ${avgRain}<span style="font-size:10px;font-weight:400;opacity:0.7">mm</span></div>
      </div>
    </div>
    ${solarHtml}
    ${eventHtml}
    ${ _buildSeasonCalendar(iso2) }
  </div>`;
}

// Returns a string key representing the primary active context for tooltip
// content decisions.  Transport layers take priority over geographic choropleth
// layers; within each group the priority order matches the order of the keys.
function getActiveContext() {
  // Transport layers take priority when active
  if (TRANSPORT_LAYERS.roads.active)    return 'roads';
  if (TRANSPORT_LAYERS.rail.active)     return 'rail';
  if (TRANSPORT_LAYERS.trails.active)   return 'trails';
  if (TRANSPORT_LAYERS.maritime.active) return 'maritime';
  if (TRANSPORT_LAYERS.natparks.active) return 'natparks';
  // Geographic choropleth layers
  if (activeLayers.has('weather'))  return 'weather';
  if (activeLayers.has('cost'))     return 'cost';
  if (activeLayers.has('safety'))   return 'safety';
  if (activeLayers.has('visa'))     return 'visa';
  if (activeLayers.has('internet')) return 'internet';
  // Any other active layer
  for (const k of activeLayers) return k;
  return 'default';
}

function periodLabel() {
  if (yearMode) return 'ANNUAL AVERAGE';
  if (selectedMonths.size === 1) return MONTHS_F[activeMonth].toUpperCase();
  const arr = [...selectedMonths].sort((a, b) => a - b);
  return `${MONTHS[arr[0]]}–${MONTHS[arr[arr.length - 1]]} AVG`;
}

// context is optional: { iso2 } — used to append country-specific safety notes.
function buildLayerRows(dataObj, context) {
  const layerCtx = getActiveContext();
  const _monthLabel = (typeof MONTHS_F !== 'undefined' && MONTHS_F[activeMonth])
    ? MONTHS_F[activeMonth].toUpperCase() : '';
  const layerHeader = {
    weather:  `<div class="ttln">WEATHER CONDITIONS — ${_monthLabel}</div>`,
    cost:     `<div class="ttln">COST OF LIVING</div>`,
    safety:   `<div class="ttln">SAFETY INDEX</div>`,
    visa:     `<div class="ttln">VISA REQUIREMENTS</div>`,
    internet: `<div class="ttln">CONNECTIVITY INDEX</div>`,
  };
  let html = layerHeader[layerCtx] || '';
  activeLayers.forEach(key => {
    const layer = LAYERS[key];
    let arr = dataObj[key];
    // Scalar layers: look up CD_COST / CD_SAFETY / CD_INTERNET using iso2 from context
    let scalarVal = null;
    if (!arr && context && context.iso2) {
      if (key === 'cost') {
        scalarVal = (typeof CD_COST !== 'undefined' && CD_COST[context.iso2] != null)
          ? CD_COST[context.iso2]
          : (dataObj.cost != null ? getRating(dataObj.cost) : null);
      } else if (key === 'safety') {
        scalarVal = (typeof CD_SAFETY !== 'undefined' && CD_SAFETY[context.iso2] != null)
          ? CD_SAFETY[context.iso2]
          : (dataObj.safety != null ? getRating(dataObj.safety) : null);
      } else if (key === 'internet') {
        scalarVal = (typeof CD_INTERNET !== 'undefined' && CD_INTERNET[context.iso2] != null)
          ? CD_INTERNET[context.iso2]
          : (dataObj.remote != null ? getRating(dataObj.remote) : null);
      } else if (key === 'kids') {
        scalarVal = (typeof CD_KIDS !== 'undefined' && CD_KIDS[context.iso2] != null)
          ? CD_KIDS[context.iso2]
          : (dataObj.family != null ? getRating(dataObj.family) : null);
      }
    }
    if (!arr && scalarVal === null) return;
    const v = arr ? getRating(arr) : scalarVal;
    if (v === null) return;
    const vc = Math.min(3, Math.max(0, v));
    const color = RC[vc];
    // Prefer LAYER_LABELS (from data.js) for display text; fall back to layer.levels
    const lyrLabels = (typeof LAYER_LABELS !== 'undefined' && LAYER_LABELS[key]) || (layer && layer.levels) || ['Excellent','Acceptable','Challenging','Harsh'];
    const label = lyrLabels[vc] || (layer && layer.levels && layer.levels[vc]) || vc;
    const desc = DESCS[key] ? DESCS[key][vc] : '';
    // Append country-specific crime context when the Safety layer is active.
    const crimeNote = (key === 'safety' && context && context.iso2 && SAFETY_NOTES && SAFETY_NOTES[context.iso2])
      ? `<div class="ttdesc" style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(201,168,76,0.08);color:#6a5a30">${SAFETY_NOTES[context.iso2]}</div>`
      : '';
    html += `<div class="ttr">
      <div class="ttstrip" style="background:${color}"></div>
      <div class="tti">
        <div class="ttln">${layer.name}</div>
        <div class="ttrat" style="color:${color}">${label}</div>
        ${buildRatingBar(vc, color)}
        <div class="ttdesc">${desc}</div>
        ${crimeNote}
        ${arr ? buildSparkline(arr) : ''}
      </div>
    </div>`;
    // Append detailed climate card directly under the Weather row
    if (key === 'weather' && context && context.iso2) {
      html += buildWeatherDetails(context.iso2);
    }
  });
  return html;
}

function buildCountryTooltip(iso2) {
  if (activeLayers.size === 0) return null;
  const name = countryNames[iso2] || iso2;
  const curr = (typeof CURRENCY !== 'undefined' && CURRENCY[iso2]) ? ` <span style="font-size:9px;color:var(--gold);font-weight:400;letter-spacing:1px">${CURRENCY[iso2]}</span>` : '';
  const rows = CD[iso2] ? buildLayerRows(CD[iso2], {iso2}) : '<div style="color:#5a4a20;font-size:8px;padding:4px 0">No data available for this territory.</div>';
  const costSection    = buildCostDetailsSection(iso2);
  const healthSection  = buildHealthSection(iso2);
  const climateSection = buildClimateWheelSection(iso2);
  const safetySection  = buildSafetySection(iso2);
  const visaSection    = buildVisaSection(iso2);
  const tippingSection  = activeLayers.has('tipping') ? _buildTippingTooltip(iso2) : '';
  const languageSection = buildLanguageSection(iso2);
  const tzSection      = buildTimezoneSection(iso2);
  const holSection     = buildHolidaysSection(iso2);
  const journalSection = buildJournalSection(iso2);
  const isPinned    = pinnedCountries.includes(iso2);
  const pinLabel    = isPinned ? '&#x2665; Pinned' : '&#x2661; Compare';
  const pinSection  = `<div style="padding:6px 14px 10px;display:flex;align-items:center;gap:6px">
    <button class="tt-pin-btn${isPinned ? ' pinned' : ''}" data-iso2="${iso2}" onclick="togglePinCountry('${iso2}')">${pinLabel}</button>
    <button id="btn-wishlist-${iso2}" title="Add to wishlist" style="background:none;border:none;cursor:pointer;font-size:16px;color:#ec4899;padding:4px 8px">${_wishlist.has(iso2) ? '♥' : '♡'}</button>
  </div>`;
  const bestTimeLine = (typeof BEST_TRAVEL_RANGE !== 'undefined' && BEST_TRAVEL_RANGE[iso2])
    ? `<div class="tm" style="color:#43A047;margin-top:2px">&#x2708; Best time: ${BEST_TRAVEL_RANGE[iso2]}</div>`
    : '';
  const ctx = getActiveContext();
  const ctxLabels = {
    roads:    '🛣 Roads Active — click roads for details',
    rail:     '🚆 Rail Active — click stations for details',
    trails:   '🥾 Trails Active — click trail for info',
    natparks: '🌲 Parks Active — click border for info',
    weather:  '🌤 Weather data shown below',
    cost:     '💰 Cost of living data below',
    safety:   '🛡 Safety index below',
    visa:     '🛂 Visa requirements below',
    internet:    '📶 Connectivity data below',
    english:     '🗣 Language & connectivity data below',
    nomad:       '💻 Digital nomad score below',
    healthcare:  '🏥 Healthcare & health data below',
    tapwater:    '💧 Water safety data below',
    airquality:  '🌬 Air quality data below',
    malaria:     '🦟 Disease risk data below',
  };
  const ctxBand = ctxLabels[ctx]
    ? `<div style="background:rgba(201,168,76,0.08);border-bottom:1px solid rgba(201,168,76,0.12);padding:4px 14px;font-size:7.5px;color:rgba(201,168,76,0.7);letter-spacing:1px">${ctxLabels[ctx]}</div>`
    : '';
  const visitedBtn = isVisited(iso2)
    ? `<div style="font-size:8px;color:#22c55e;padding:6px 0;text-align:center;opacity:0.8">&#x2713; VISITED</div>`
    : `<button onclick="markVisited('${iso2}');this.outerHTML='<div style=\\'font-size:8px;color:#22c55e;padding:6px 0;text-align:center\\'>&#x2713; MARKED AS VISITED</div>';" style="width:100%;margin-top:8px;padding:5px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:5px;color:#4ade80;font-size:8px;cursor:pointer;font-family:var(--fm);letter-spacing:1px">+ MARK AS VISITED</button>`;
  const flag = getFlag(iso2);
  const scoreChip = buildCompositeScore(CD[iso2] || {}, iso2);
  // Similar countries row
  var similarSection = '';
  try {
    var simResults = _findSimilarCountries(iso2);
    if (simResults && simResults.length) {
      var simItems = simResults.map(function(s) {
        var sf = typeof _countryFlag === 'function' ? _countryFlag(s.iso2) : '';
        var sn = (typeof countryNames !== 'undefined' && countryNames[s.iso2]) || s.iso2;
        return '<span onclick="(function(){var c=COUNTRY_CENTERS&&COUNTRY_CENTERS[\'' + s.iso2 + '\'];if(c&&map)map.flyTo(c,5,{duration:1.2});})()" title="' + _esc(sn) + '" style="cursor:pointer;margin-right:6px;white-space:nowrap">' + sf + ' ' + _esc(s.iso2) + '</span>';
      }).join('');
      similarSection = '<div style="padding:4px 14px 8px;font-size:8.5px;color:rgba(232,213,163,0.65);border-top:1px solid rgba(201,168,76,0.1);margin-top:4px"><span style="color:rgba(201,168,76,0.5);letter-spacing:1px;font-size:7.5px;display:block;margin-bottom:3px">SIMILAR</span>' + simItems + '</div>';
    }
  } catch(_e) {}
  return `<div class="tth">
    <h3 id="tt-name">${_countryFlag(iso2) ? _countryFlag(iso2) + ' ' : ''}${_esc(name)}${curr}</h3>
    <div class="ts" id="tt-sub">${iso2}</div>
    <div class="tm" id="tt-period">${periodLabel()}</div>
    ${scoreChip}
    ${bestTimeLine}
  </div>${ctxBand}
  <div class="ttb" id="tt-body">${rows}${costSection}${healthSection}${languageSection}${climateSection}${safetySection}${tippingSection}${visaSection}${tzSection}${holSection}${journalSection}${visitedBtn}
  <div class="intel-wrap"><div class="intel-hdr">Country Intelligence <span class="intel-badge">AI</span></div><div id="intel-${_esc(iso2)}" class="intel-container"></div></div>
  </div>${pinSection}${similarSection}`;
}

function buildCityTooltip(city) {
  const cname = countryNames[city.country] || city.country;
  const rows = buildLayerRows(city.data, {iso2: city.country});
  return `<div class="tth">
    <h3 id="tt-name">${city.name}</h3>
    <div class="ts" id="tt-sub">${cname}</div>
    <div class="tm" id="tt-period">${periodLabel()}</div>
  </div>
  <div class="ttb" id="tt-body">${rows}</div>`;
}

function buildBorderTooltip(bc) {
  const fromName = countryNames[bc.from] || bc.from;
  const toName   = countryNames[bc.to]   || bc.to;
  const scls = `tt-status-${bc.status}`;
  const hrs = bc.hours ? `<div class="ttdesc" style="margin-top:4px">Hours: ${bc.hours}</div>` : '';
  const note = bc.note ? `<div class="ttdesc" style="margin-top:4px">${bc.note}</div>` : '';
  return `<div class="tth">
    <h3 id="tt-name">${bc.name}</h3>
    <div class="ts" id="tt-sub">${fromName} / ${toName}</div>
    <div class="tm" id="tt-period">BORDER CROSSING</div>
  </div>
  <div class="ttb" id="tt-body">
    <div class="ttr">
      <div class="ttstrip" style="background:${{open:'#22d3ee',restricted:'#f59e0b',closed:'#ef4444'}[bc.status]}"></div>
      <div class="tti">
        <div class="ttln">Status</div>
        <div class="ttrat ${scls}">${bc.status.toUpperCase()}</div>
        ${hrs}${note}
      </div>
    </div>
  </div>`;
}

function buildAdmin1Tooltip(iso2, subCode, stateName, countryName) {
  if (activeLayers.size === 0) return null;
  const d1 = subCode ? CD_A1[subCode] : null;
  const d2 = CD[iso2];
  const merged = d1 ? Object.assign({}, d2, d1) : d2;
  const rows = merged
    ? buildLayerRows(merged, {iso2})
    : '<div style="color:#5a4a20;font-size:8px;padding:4px 0">No travel data available for this region.</div>';
  const _a1Flag = getFlag(iso2);
  return `<div class="tth">
    <h3 id="tt-name">${_a1Flag ? _a1Flag + ' ' : ''}${stateName || countryName}</h3>
    <div class="ts" id="tt-sub">${stateName ? countryName : iso2}</div>
    <div class="tm" id="tt-period">${periodLabel()}</div>
  </div>
  <div class="ttb" id="tt-body">${rows}</div>`;
}

function buildAdmin2Tooltip(shapeID, parentAdmin1Code, iso2, districtName, stateName, countryName) {
  if (activeLayers.size === 0) return null;
  const d2 = shapeID ? CD_A2[shapeID] : null;
  const d1 = parentAdmin1Code ? CD_A1[parentAdmin1Code] : null;
  const d0 = CD[iso2];
  // Merge with lowest-granularity data first so admin-2 overrides admin-1 overrides country
  const merged = Object.assign({}, d0 || {}, d1 || {}, d2 || {});
  const rows = Object.keys(merged).some(k => Array.isArray(merged[k]))
    ? buildLayerRows(merged, { iso2 })
    : '<div style="color:#5a4a20;font-size:8px;padding:4px 0">No travel data available for this district.</div>';
  const sub = [districtName ? (stateName || null) : null, countryName].filter(Boolean).join(' · ');
  const _a2Flag = getFlag(iso2);
  return `<div class="tth">
    <h3 id="tt-name">${_a2Flag ? _a2Flag + ' ' : ''}${districtName || stateName || countryName}</h3>
    <div class="ts" id="tt-sub">${sub}</div>
    <div class="tm" id="tt-period">${periodLabel()}</div>
  </div>
  <div class="ttb" id="tt-body">${rows}</div>`;
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function updateLegend() {
  const legend = document.getElementById('legend');
  const body   = document.getElementById('legend-body');
  const active = [...activeLayers];
  const anyTransport = Object.values(TRANSPORT_LAYERS).some(d => d.active);

  const anyPOI = Object.values(POI_LAYERS).some(d => d.active);
  if (active.length === 0 && !showBorders && !anyTransport && !_tzActive && !anyPOI) {
    legend.style.display = 'none';
    return;
  }
  legend.style.display = 'block';

  // Update legend title + sync layer picker + sync category buttons
  const geoLayers = active.filter(k => LAYERS[k] && GEOGRAPHIC_LAYERS.has(k));
  const layerBtn  = document.getElementById('legend-layer-btn');
  const h4        = document.getElementById('legend-title');
  const titleText = geoLayers.length === 1
    ? LAYERS[geoLayers[0]].emoji + '  ' + LAYERS[geoLayers[0]].name.toUpperCase()
    : geoLayers.length > 1 ? '⊕  COMBINED VIEW' : 'FIELD GUIDE';

  if (layerBtn) {
    layerBtn.textContent = titleText;
  } else if (h4) {
    const firstText = [...h4.childNodes].find(n => n.nodeType === 3);
    if (firstText) firstText.textContent = titleText;
    else h4.insertBefore(document.createTextNode(titleText), h4.firstChild);
  }
  document.querySelectorAll('.llp-item').forEach(item => {
    item.classList.toggle('active', activeLayers.has(item.dataset.key));
  });
  syncCatButtons();

  let html = '';
  active.forEach(key => {
    const layer = LAYERS[key];
    // Visa (sole geo layer, passport chosen): show the 5-tier entry-type legend
    // that matches the choropleth, instead of the collapsed 4-bucket ramp.
    if (key === 'visa' && geoLayers.length === 1 && selectedNationality) {
      html += `<div class="ll">`;
      VISA_LEGEND_ROWS.forEach(row => {
        html += `<div class="lr"><div class="lsw" style="background:${VISA_TYPE_COLORS[row.t]}"></div><span class="llabel">${row.label}</span></div>`;
      });
      html += `<div class="lr"><div class="lsw" style="background:${RC_NODATA};opacity:0.6"></div><span class="llabel" style="color:#8a8a8a">No data</span></div>`;
      html += `</div>`;
      return;
    }
    // Use LAYER_LABELS for display text where available
    const lyrLabels = (typeof LAYER_LABELS !== 'undefined' && LAYER_LABELS[key]) || layer.levels;
    html += `<div class="ll">`;
    lyrLabels.forEach((lbl, i) => {
      html += `<div class="lr">
        <div class="lsw" style="background:${RC2[i]}"></div>
        <span class="llabel">${lbl}</span>
      </div>`;
    });
    html += `<div class="lr">
        <div class="lsw" style="background:${RC_NODATA};opacity:0.7"></div>
        <span class="llabel" style="color:#8a8a8a">No data</span>
      </div>`;
    html += `</div>`;
  });

  if (activeLayers.has('visa') || activeLayers.has('strength')) {
    const nat = selectedNationality || '';
    const opts = (typeof PASSPORT_NATIONALITIES !== 'undefined')
      ? Object.entries(PASSPORT_NATIONALITIES).map(([c, l]) =>
          '<option value="' + c + '"' + (c === nat ? ' selected' : '') + '>' + l + '</option>')
        .join('')
      : '';
    html += '<div class="ll" id="legend-nat-wrap">'
      + '<div class="ll-name">YOUR PASSPORT</div>'
      + '<select id="legend-passport-sel" style="width:100%;margin-top:4px;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.22);border-radius:5px;color:var(--gold);font-family:var(--fm);font-size:9px;padding:4px 6px;cursor:pointer;outline:none">'
      + '<option value="">Select nationality…</option>'
      + opts
      + '</select>';
    // Banned-entry swatch — only shown when a nationality with banned countries is selected
    const hasBanned = selectedNationality && typeof VISA_DATA !== 'undefined' &&
      Object.values(VISA_DATA).some(d => d[selectedNationality] && d[selectedNationality].t === 'banned');
    if (hasBanned) {
      html += `<div class="lr" style="margin-top:6px;padding-top:5px;border-top:1px solid rgba(201,168,76,0.08)">
        <div class="lsw" style="background:#1a0000;border:1.5px dashed #cc2222;border-radius:2px"></div>
        <span class="llabel" style="color:#e57373">Entry Denied — passport not accepted</span>
      </div>`;
    }
    html += '</div>';
  }

  if (activeLayers.has('beaches')) {
    const beachZoom = map ? map.getZoom() : 0;
    if (beachZoom >= 7) {
      // Live Overpass beach markers — colored by sand/pebble/rock surface
      html += `<div class="ll">
        <div class="ll-name">Beach Locations (Live OSM)</div>
        <div class="lr"><div class="lsw" style="background:#F4D03F;border-radius:50%"></div><span class="llabel">Sandy beach</span></div>
        <div class="lr"><div class="lsw" style="background:#A9A9A9;border-radius:50%"></div><span class="llabel">Pebble / Gravel / Shingle</span></div>
        <div class="lr"><div class="lsw" style="background:#808080;border-radius:50%"></div><span class="llabel">Rock</span></div>
        <div class="lr"><div class="lsw" style="background:#2EC4B6;border-radius:50%"></div><span class="llabel">Other / Unknown surface</span></div>
      </div>`;
    } else if (typeof BEACHES !== 'undefined' && BEACHES.length) {
      // Static curated beach icons for world-zoom overview
      html += `<div class="ll">
        <div class="ll-name">Beach Markers</div>
        <div class="lr"><div class="lsw" style="background:#06b6d4;border-radius:50%"></div><span class="llabel">Open / Year-round</span></div>
        <div class="lr"><div class="lsw" style="background:#f59e0b;border-radius:50%"></div><span class="llabel">Seasonal</span></div>
        <div class="lr"><div class="lsw" style="background:#8b5cf6;border-radius:50%"></div><span class="llabel">Restricted</span></div>
        <div class="lr"><div class="lsw" style="background:#ef4444;border-radius:50%"></div><span class="llabel">Closed</span></div>
        <div style="font-size:7px;color:var(--dim);margin-top:4px">Zoom in for live worldwide beach data</div>
      </div>`;
    }
  }

  if (showBorders) {
    html += `<div class="ll">
      <div class="ll-name">Border Crossings</div>
      <div class="lr"><div class="lsw-diamond" style="background:#22d3ee"></div><span class="llabel">Open</span></div>
      <div class="lr"><div class="lsw-diamond" style="background:#f59e0b"></div><span class="llabel">Restricted</span></div>
      <div class="lr"><div class="lsw-diamond" style="background:#ef4444"></div><span class="llabel">Closed</span></div>
    </div>`;
  }

  if (anyTransport) {
    const TSWATCH = {
      roads:    { color: '#aaaaaa', label: 'Roads & Paths',    note: 'all classes' },
      rail:     { color: '#4466cc', label: 'Rail & Transit',   note: 'train · metro · tram · cable car' },
      trails:   { color: '#44aa66', label: 'Hiking Trails',    note: 'marked routes' },
      maritime: { color: '#22aabb', label: 'Maritime',         note: 'ferries · sea routes' },
      wildfires:{ color: '#ef4444', label: 'Active Wildfires', note: 'NASA VIIRS thermal anomalies · yesterday' },
      natparks: { color: '#22c55e', label: 'National Parks / Reserves', note: 'green border polygons · OSM' },
    };
    html += `<div class="ll"><div class="ll-name">Transport Layers</div>`;
    Object.entries(TRANSPORT_LAYERS).forEach(([key, def]) => {
      if (!def.active) return;
      const s = TSWATCH[key];
      if (!s) return;
      if (def.vector) {
        // natparks: show a line swatch (polygon border)
        html += `<div class="lr">
          <div class="lsw-line" style="background:${s.color}"></div>
          <div><span class="llabel">${s.label}</span><span class="llabel-note">${s.note}</span></div>
        </div>`;
      } else {
        html += `<div class="lr">
          <div class="lsw-line" style="background:${s.color}"></div>
          <div><span class="llabel">${s.label}</span><span class="llabel-note">${s.note}</span></div>
        </div>`;
      }
      // Rail: show stop dot legend entry when zoom ≥ 7
      if (key === 'rail' && map && map.getZoom() >= 7) {
        html += `<div class="lr">
          <div class="lsw" style="background:#3b82f6;border-radius:50%"></div>
          <span class="llabel">Station / stop dots</span>
        </div>`;
      }
    });
    html += `</div>`;
  }

  // ── Timezone choropleth legend ─────────────────────────────────────────────
  // The timezone layer uses 9 categorical colors cycling every 9 UTC hours so
  // adjacent zones always differ. Each swatch shows the UTC offsets it covers.
  if (_tzActive) {
    const TZ_GROUPS = [
      { color: TZ_PALETTE[0], offsets: '−12 · −3 · +6'  },
      { color: TZ_PALETTE[1], offsets: '−11 · −2 · +7'  },
      { color: TZ_PALETTE[2], offsets: '−10 · −1 · +8'  },
      { color: TZ_PALETTE[3], offsets:  '−9 ·  0 · +9'  },
      { color: TZ_PALETTE[4], offsets:  '−8 · +1 · +10' },
      { color: TZ_PALETTE[5], offsets:  '−7 · +2 · +11' },
      { color: TZ_PALETTE[6], offsets:  '−6 · +3 · +12' },
      { color: TZ_PALETTE[7], offsets:  '−5 · +4 · +13' },
      { color: TZ_PALETTE[8], offsets:  '−4 · +5 · +14' },
    ];
    const swatchItems = TZ_GROUPS.map(g =>
      `<div style="display:flex;align-items:center;gap:4px;min-width:0">
        <div style="width:11px;height:11px;border-radius:2px;flex-shrink:0;background:${g.color};box-shadow:0 0 0 1px rgba(255,255,255,0.15)"></div>
        <span style="font-size:6.5px;color:var(--dim);white-space:nowrap;letter-spacing:0.3px">UTC ${g.offsets}</span>
      </div>`
    ).join('');
    html += `<div class="ll">
      <div class="ll-name">Timezones <span style="font-weight:400;opacity:0.55">(9-color cycle · UTC offset)</span></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px 6px;margin-top:5px">
        ${swatchItems}
      </div>
    </div>`;
  }

  // ── POI layer legend entries ────────────────────────────────────────────────
  const POI_META = {
    camping:    { color:'#22c55e', label:'Camp Sites',               note:'OSM tourism=camp_site' },
    parks:      { color:'#15803d', label:'Parks & Forests',          note:'OSM national_park · nature_reserve · forest' },
    viewpoints: { color:'#a855f7', label:'Viewpoints / Photo Spots', note:'OSM tourism=viewpoint' },
    climbing:   { color:'#f97316', label:'Rock Climbing',            note:'OSM sport=climbing' },
    hotsprings: { color:'#e11d48', label:'Hot Springs',              note:'OSM natural=hot_spring' },
    airports:     { color:'#0ea5e9', label:'Airports',                 note:'OSM aeroway=aerodrome' },
    birdwatching: { color:'#14b8a6', label:'Bird Watching',  note:'OSM leisure=bird_hide' },
    surfing:      { color:'#0284c7', label:'Surf Spots',      note:'OSM sport=surfing' },
    diving:       { color:'#0891b2', label:'Dive & Snorkel',  note:'OSM sport=scuba_diving' },
    attractions:  { color:'#f59e0b', label:'Attractions',     note:'OSM tourism=attraction · museum · monument' },
  };
  Object.entries(POI_LAYERS).forEach(([key, def]) => {
    if (!def.active) return;
    const m = POI_META[key]; if (!m) return;
    html += `<div class="ll">
      <div class="ll-name">${m.label}</div>
      <div class="lr">
        <div class="lsw" style="background:${m.color};border-radius:50%"></div>
        <div><span class="llabel">${m.label}</span><span class="llabel-note">${m.note}</span></div>
      </div>
    </div>`;
  });
  if (POI_LAYERS.holidays && POI_LAYERS.holidays.active) {
    html += `<div class="ll">
      <div class="ll-name">Holidays</div>
      <div class="lr"><div class="lsw" style="background:#f59e0b;border-radius:50%"></div><span class="llabel">Holiday markers (active month)</span></div>
    </div>`;
  }

  if (_visitedSet.size > 0) {
    const vc = _visitedSet.size;
    html += `<div class="ll" style="text-align:center;padding-top:4px;border-top:1px solid rgba(34,197,94,0.15)">
      <span style="font-size:7px;color:#4ade80;letter-spacing:1px">&#x2713; ${vc} COUNTR${vc === 1 ? 'Y' : 'IES'} VISITED</span>
    </div>`;
  }

  body.innerHTML = html;

  const legendSel = document.getElementById('legend-passport-sel');
  if (legendSel) {
    legendSel.addEventListener('change', () => {
      selectedNationality = legendSel.value || null;
      if (selectedNationality && !activeLayers.has('visa')) {
        activeLayers.add('visa');
        document.querySelectorAll('.lb[data-key="visa"]').forEach(b => b.classList.add('on'));
      }
      const topSel = document.getElementById('passport-select');
      if (topSel) topSel.value = selectedNationality || '';
      refresh(); updateURLState(); saveState();
    });
  }
}

function updateBadge() {
  syncMonthButtons();
}

// ─── Refresh ──────────────────────────────────────────────────────────────────
function refresh() {
  // Guard: called from setMonth() which runs before initMap() in the boot
  // sequence. All rendering functions below require a live Leaflet map instance.
  if (!map) return;
  updateLegend();
  updateBadge();
  if (pinnedCountries.length > 0) renderComparePanel();
  renderChoropleth();
  renderAdmin1Styles();
  renderAdmin2Styles();
  if (climateZoneLayer) {
    const hasGeoLayer = [...activeLayers].some(lk => GEOGRAPHIC_LAYERS.has(lk));
    if (hasGeoLayer) {
      climateZoneLayer.setStyle(f => styleClimateZone(f.properties));
      if (!map.hasLayer(climateZoneLayer)) climateZoneLayer.addTo(map);
      // Soft-focus blur on climatePane only — choroplethPane country borders stay crisp
      const cp = map.getPane('climatePane');
      if (cp) cp.style.filter = 'blur(4px)';
    } else {
      if (map.hasLayer(climateZoneLayer)) climateZoneLayer.remove();
    }
  }
  toggleElevationLayer(activeLayers.has('elevation'));
  renderCityMarkers();
  renderBorderMarkers();
  renderBeachMarkers();
  renderPoliticalLayers();
  updateBestPanel();
  renderEventMarkers();
}

// Update the legend zoom annotation note based on the current zoom level and
// which sub-national layers are active.
function updateZoomAnnotation() {
  const note = document.getElementById('legend-zoom-note');
  if (!note) return;
  const z = map ? map.getZoom() : 0;
  if (z >= 6 && _coveredByAdmin2.size > 0) {
    note.textContent = 'Showing county-level data';
    note.style.display = 'block';
  } else if (z >= 5 && admin1ChoroLayer && _admin1Visible) {
    note.textContent = 'Showing province-level data';
    note.style.display = 'block';
  } else {
    note.style.display = 'none';
  }
}

// Re-render markers and update layer visibility on every zoom change.
let _zoomTimer = null;
function onZoom() {
  clearTimeout(_zoomTimer);
  _zoomTimer = setTimeout(() => {
    renderCityMarkers();
    renderBorderMarkers();
    renderBeachMarkers();
    renderEventMarkers();
    onZoomAdmin1();
    onZoomAdmin2();
    updateZoomAnnotation();
    // Re-evaluate POI layer visibility thresholds on zoom change.
    Object.keys(POI_LAYERS).forEach(key => {
      const def = POI_LAYERS[key];
      const linkedActive = key === 'camping' && (TRANSPORT_LAYERS.trails.active || POI_LAYERS.parks.active);
      if (!def.active && !linkedActive) return;
      // Holidays use static data, not Overpass — route to its own renderer.
      if (key === 'holidays') { _renderHolidayMarkers(); return; }
      if (map.getZoom() >= def.minZoom) _fetchAndRenderPOI(key, linkedActive);
      else _clearPOIMarkers(key);
    });
    // Rail stop dots: re-evaluate on zoom change.
    if (TRANSPORT_LAYERS.rail.active) {
      if (map.getZoom() >= 7) _fetchAndRenderRailStops();
      else _clearRailStops();
    }
    // Road vectors: re-evaluate on zoom change.
    if (TRANSPORT_LAYERS.roads.active) _fetchAndRenderRoads();
    // Park border vectors: re-evaluate on zoom change.
    if (TRANSPORT_LAYERS.natparks.active) {
      if (map.getZoom() >= 5) _fetchAndRenderParkBorders();
      else _clearParkBorders();
    }
    // Update beach legend when crossing the zoom-7 threshold.
    if (activeLayers.has('beaches')) updateLegend();
    // NYC precinct crime sublayer: re-evaluate on zoom change.
    _renderNYCCrime();
  }, 150);
}

// ─── Transport Layer Feature Click ───────────────────────────────────────────
// When a transport tile layer is active, clicking the map queries OSM/Overpass
// for features near the click point and displays a rich tooltip.

function buildTransportWaitTooltip(name, emoji) {
  return `<div class="tth">
    <h3>${emoji} ${name}</h3>
    <div class="ts">QUERYING NEARBY FEATURES</div>
    <div class="tm">Fetching OpenStreetMap data…</div>
  </div><div class="ttb"><div style="color:var(--dim);font-size:8px;padding:4px 0">Please wait — this may take a few seconds.</div></div>`;
}

async function fetchTrailInfo(lat, lng) {
  try {
    const d = 0.045; // ~5 km radius
    const bbox = `${lat - d},${lng - d},${lat + d},${lng + d}`;
    const query = `[out:json][timeout:12];(relation["route"~"hiking|foot|mtb"](${bbox});way["highway"~"path|footway|track"]["name"](around:400,${lat},${lng}););out body;`;
    const res = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query));
    const data = await res.json();

    const routes = (data.elements || []).filter(e => e.type === 'relation');
    const paths  = (data.elements || []).filter(e => e.type === 'way');

    if (routes.length === 0 && paths.length === 0) {
      return `<div class="tth"><h3>🥾 No Named Trails Found</h3><div class="ts">HIKING</div>
        <div class="tm">Try clicking directly on a highlighted trail</div></div>
        <div class="ttb"><div style="color:var(--dim);font-size:8px">No named hiking routes within 5 km. The tile overlay shows all mapped paths; only named OSM routes return data here.</div></div>`;
    }

    const routeRows = routes.slice(0, 4).map(r => {
      const t    = r.tags || {};
      const name = t.name || t.ref || 'Unnamed Route';
      // Distance: OSM stores in km; convert + compute walking time at avg 4 km/h
      const rawKm  = parseFloat(t.distance || t.length || 0);
      const distKm = rawKm > 0 ? rawKm : null;
      const distMi = distKm ? (distKm * 0.621371).toFixed(1) : null;
      const walkMin = distKm ? Math.round((distKm / 4) * 60) : null;  // 4 km/h average
      const walkHr  = walkMin ? (walkMin >= 60 ? `${Math.floor(walkMin/60)}h ${walkMin%60}m` : `${walkMin} min`) : null;
      const distStr = distKm ? `${distKm.toFixed(1)} km (${distMi} mi) · ~${walkHr} walking` : '';
      const diff  = t['sac_scale'] ? t['sac_scale'].replace(/_/g, ' ') : '';
      const net   = t.network ? t.network.toUpperCase() : '';
      const elev  = t['ascent'] ? `↑${t.ascent}m` : (t.ele ? `${t.ele}m` : '');
      const grade = t['trail_visibility'] ? t['trail_visibility'].replace(/_/g, ' ') : '';
      const parts = [distStr, diff, grade, elev, net].filter(Boolean).join(' · ');
      return `<div class="ttr">
        <div class="ttstrip" style="background:#44aa66"></div>
        <div class="tti">
          <div class="ttln">HIKING ROUTE</div>
          <div class="ttrat" style="color:#4ade80">${name}</div>
          <div class="ttdesc">${parts || 'Named OSM route — zoom in and click directly on the trail for full details.'}</div>
        </div></div>`;
    }).join('');

    const pathRows = paths.slice(0, 3).map(p => {
      const t = p.tags || {};
      const name = t.name;
      if (!name) return '';
      const hw   = (t.highway || '').replace(/_/g, ' ');
      const surf = t.surface ? ` · ${t.surface}` : '';
      return `<div class="ttr">
        <div class="ttstrip" style="background:#2d7a4f"></div>
        <div class="tti">
          <div class="ttln">PATH / TRACK</div>
          <div class="ttrat" style="color:#4ade80">${name}</div>
          <div class="ttdesc">${hw}${surf}</div>
        </div></div>`;
    }).filter(Boolean).join('');

    return `<div class="tth">
      <h3>🥾 Hiking Trails</h3>
      <div class="ts">NEARBY ROUTES — OSM DATA</div>
      <div class="tm">Within 5 km of click point</div>
    </div><div class="ttb">${routeRows}${pathRows}</div>`;

  } catch (e) {
    return `<div class="tth"><h3>🥾 Hiking Trails</h3><div class="ts">CONNECTION ERROR</div></div>
      <div class="ttb"><div style="color:var(--dim);font-size:8px">Could not load trail data. Check your connection.</div></div>`;
  }
}

async function fetchRailInfo(lat, lng) {
  try {
    const query = `[out:json][timeout:12];(node["railway"~"station|halt|stop"]["name"](around:2500,${lat},${lng});relation["route"~"train|railway|subway|tram|light_rail"]["name"](around:2000,${lat},${lng}););out body;`;
    const res = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query));
    const data = await res.json();

    const stations = (data.elements || []).filter(e => e.type === 'node');
    const lines    = (data.elements || []).filter(e => e.type === 'relation');

    if (stations.length === 0 && lines.length === 0) {
      return `<div class="tth"><h3>🚆 No Rail Features Found</h3><div class="ts">RAIL & TRANSIT</div>
        <div class="tm">Try clicking near a station marker or line</div></div>
        <div class="ttb"><div style="color:var(--dim);font-size:8px">No rail stations or named lines within 2.5 km.</div></div>`;
    }

    const stationRows = stations.slice(0, 3).map(s => {
      const t   = s.tags || {};
      const name = t.name || t['name:en'] || 'Station';
      const rw   = (t.railway || 'station').replace(/_/g, ' ');
      const op   = t.operator ? ` · ${t.operator}` : '';
      return `<div class="ttr">
        <div class="ttstrip" style="background:#3b82f6"></div>
        <div class="tti">
          <div class="ttln">${rw.toUpperCase()}</div>
          <div class="ttrat">${name}</div>
          <div class="ttdesc">${op}</div>
        </div></div>`;
    }).join('');

    const lineRows = lines.slice(0, 3).map(l => {
      const t    = l.tags || {};
      const name  = t.name || t.ref || 'Rail Line';
      const route = (t.route || '').toUpperCase();
      const from  = t.from || '';
      const to    = t.to   || '';
      const via   = (from && to) ? `${from} → ${to}` : '';
      const op    = t.operator ? ` · ${t.operator}` : '';
      return `<div class="ttr">
        <div class="ttstrip" style="background:#2563eb"></div>
        <div class="tti">
          <div class="ttln">${route} ROUTE</div>
          <div class="ttrat">${name}</div>
          <div class="ttdesc">${via}${op}</div>
        </div></div>`;
    }).join('');

    return `<div class="tth">
      <h3>🚆 Rail & Transit</h3>
      <div class="ts">NEARBY STATIONS & LINES — OSM</div>
      <div class="tm">Within 2.5 km of click point</div>
    </div><div class="ttb">${stationRows}${lineRows}</div>`;

  } catch (e) {
    return `<div class="tth"><h3>🚆 Rail & Transit</h3><div class="ts">CONNECTION ERROR</div></div>
      <div class="ttb"><div style="color:var(--dim);font-size:8px">Could not load rail data.</div></div>`;
  }
}

async function fetchMaritimeInfo(lat, lng) {
  try {
    const query = `[out:json][timeout:12];(node["seamark:type"~"harbour|ferry_terminal|port"]["name"](around:4000,${lat},${lng});relation["route"="ferry"]["name"](around:6000,${lat},${lng}););out body;`;
    const res = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query));
    const data = await res.json();

    const ports   = (data.elements || []).filter(e => e.type === 'node');
    const ferries = (data.elements || []).filter(e => e.type === 'relation');

    if (ports.length === 0 && ferries.length === 0) {
      return `<div class="tth"><h3>⚓ No Maritime Features Found</h3><div class="ts">MARITIME</div>
        <div class="tm">Try clicking near a port or ferry route</div></div>
        <div class="ttb"><div style="color:var(--dim);font-size:8px">No ports or ferry routes within 6 km.</div></div>`;
    }

    const portRows = ports.slice(0, 3).map(p => {
      const t    = p.tags || {};
      const name = t.name || t['seamark:name'] || 'Port';
      const type = (t['seamark:type'] || 'harbour').replace(/_/g, ' ');
      const cat  = t['seamark:harbour:category'] || t.description || '';
      return `<div class="ttr">
        <div class="ttstrip" style="background:#0e7490"></div>
        <div class="tti">
          <div class="ttln">${type.toUpperCase()}</div>
          <div class="ttrat">${name}</div>
          <div class="ttdesc">${cat}</div>
        </div></div>`;
    }).join('');

    const ferryRows = ferries.slice(0, 3).map(f => {
      const t    = f.tags || {};
      const name = t.name || 'Ferry Route';
      const from = t.from || '';
      const to   = t.to   || '';
      const via  = (from && to) ? `${from} → ${to}` : '';
      const op   = t.operator ? ` · ${t.operator}` : '';
      return `<div class="ttr">
        <div class="ttstrip" style="background:#009ab0"></div>
        <div class="tti">
          <div class="ttln">FERRY ROUTE</div>
          <div class="ttrat">${name}</div>
          <div class="ttdesc">${via}${op}</div>
        </div></div>`;
    }).join('');

    return `<div class="tth">
      <h3>⚓ Maritime</h3>
      <div class="ts">PORTS & FERRY ROUTES — OSM</div>
      <div class="tm">Within 6 km of click point</div>
    </div><div class="ttb">${portRows}${ferryRows}</div>`;

  } catch (e) {
    return `<div class="tth"><h3>⚓ Maritime</h3><div class="ts">CONNECTION ERROR</div></div>
      <div class="ttb"><div style="color:var(--dim);font-size:8px">Could not load maritime data.</div></div>`;
  }
}

function initTransportClickHandlers() {
  map.on('click', async e => {
    // Background click (non-feature): always dismiss tooltip.
    // _featureClicked is true for the ~10 ms after a feature's own click handler
    // fires, preventing double-dismiss when Leaflet bubbles the event to the map.
    if (!_featureClicked && !document.getElementById('tt')?.contains(e.originalEvent.target)) {
      hideTooltip();
    }

    const activeKeys = Object.entries(TRANSPORT_LAYERS)
      .filter(([, d]) => d.active && !d.vector)   // vector (natparks) has its own click handlers
      .map(([k]) => k);
    if (activeKeys.length === 0) return;

    if (_featureClicked) return;   // a non-transport feature already handled this click

    const { lat, lng } = e.latlng;
    const cx = e.originalEvent.clientX;
    const cy = e.originalEvent.clientY;
    _ttX = cx; _ttY = cy;

    // Priority: trails > rail > maritime > roads
    if (activeKeys.includes('trails')) {
      showTooltip(buildTransportWaitTooltip('Hiking Trails', '🥾'));
      const html = await fetchTrailInfo(lat, lng);
      if (tooltipVisible) { showTooltip(html); positionTooltip(cx, cy); }
      return;
    }
    if (activeKeys.includes('rail')) {
      showTooltip(buildTransportWaitTooltip('Rail & Transit', '🚆'));
      const html = await fetchRailInfo(lat, lng);
      if (tooltipVisible) { showTooltip(html); positionTooltip(cx, cy); }
      return;
    }
    if (activeKeys.includes('maritime')) {
      showTooltip(buildTransportWaitTooltip('Maritime', '⚓'));
      const html = await fetchMaritimeInfo(lat, lng);
      if (tooltipVisible) { showTooltip(html); positionTooltip(cx, cy); }
      return;
    }
    // Roads: query Overpass for road name/type near click point
    if (activeKeys.includes('roads')) {
      showTooltip(buildTransportWaitTooltip('Roads', '🛣'));
      const html = await fetchRoadInfo(lat, lng);
      if (tooltipVisible) { showTooltip(html); positionTooltip(cx, cy); }
    }
  });

}
// Tooltip is click-anchored — mouseout no longer dismisses it.

// ─── Country Highlight (from UI hover) ───────────────────────────────────────
// Called when the cursor enters/leaves a country name in the best-panel or
// search results — highlights / restores the corresponding map polygon.
function highlightCountry(iso2) {
  if (geojsonLayer) {
    geojsonLayer.eachLayer(l => {
      if (l.feature && getIso2(l.feature.properties) === iso2)
        l.setStyle(getCountryStyle(iso2, true));
    });
  }
  if (admin1ChoroLayer && _admin1Visible) {
    admin1ChoroLayer.eachLayer(l => {
      if (!l.feature) return;
      const p = l.feature.properties;
      if (getAdmin1Iso2(p) === iso2)
        l.setStyle(getAdmin1Style(iso2, getAdmin1Code(p), true));
    });
  }
}
function unhighlightCountry(iso2) {
  if (geojsonLayer) {
    geojsonLayer.eachLayer(l => {
      if (l.feature && getIso2(l.feature.properties) === iso2)
        l.setStyle(getCountryStyle(iso2, false));
    });
  }
  if (admin1ChoroLayer && _admin1Visible) {
    admin1ChoroLayer.eachLayer(l => {
      if (!l.feature) return;
      const p = l.feature.properties;
      if (getAdmin1Iso2(p) === iso2)
        l.setStyle(getAdmin1Style(iso2, getAdmin1Code(p), false));
    });
  }
}

// ─── Admin-1 Zoom Visibility ──────────────────────────────────────────────────
// Province / state layer is only shown at zoom ≥ 5.  At lower zoom the
// country-level choropleth provides all the context needed and province
// boundaries add visual clutter.
function onZoomAdmin1() {
  if (!admin1ChoroLayer) return;
  const zoom       = map.getZoom();
  const shouldShow = zoom >= 5;
  if (shouldShow === _admin1Visible) return;   // no change needed
  _admin1Visible = shouldShow;
  if (shouldShow) {
    if (!map.hasLayer(admin1ChoroLayer)) admin1ChoroLayer.addTo(map);
  } else {
    if (map.hasLayer(admin1ChoroLayer)) admin1ChoroLayer.remove();
  }
  // Re-render country fills — when admin-1 is hidden, country polygons that
  // were suppressed by _coveredByAdmin1 must become visible again.
  renderChoropleth();
  updateZoomAnnotation();
}

// ─── Visa Rating & Tooltip ───────────────────────────────────────────────────
// Returns 0–3 for the given destination × passport pair, or null if unknown.
// 0=visa-free  1=ETA/eVisa/VoA  2=required (obtainable)  3=restricted/closed
// 5-tier visa entry-type palette for the visa choropleth + legend (Gate 2).
// Categorical, not a gradient: each entry type reads as a distinct, colour-blind-aware
// hue, deliberately set apart from RC (green→red). Banned uses the dedicated near-black
// style in getCountryStyle, so it is intentionally absent here.
const VISA_TYPE_COLORS = {
  free:  '#3E8E5A',  // visa-free — open
  eta:   '#4FA3B8',  // ETA / pre-registration
  evisa: '#5B7FC9',  // e-visa (dusty blue)
  voa:   '#D4953B',  // visa on arrival (amber)
  req:   '#C56A3A',  // embassy visa required (terracotta)
};
const VISA_LEGEND_ROWS = [
  { t:'free',  label:'Visa-free' },
  { t:'eta',   label:'ETA / Pre-reg.' },
  { t:'evisa', label:'E-Visa' },
  { t:'voa',   label:'Visa on Arrival' },
  { t:'req',   label:'Embassy Visa Req.' },
];
const _SCHENGEN = ['DE','ES','FR','IT','GR','PT','AT','BE','NL','LU','DK','FI','SE','IE','PL','CZ','SK','HU','SI','HR','EE','LV','LT','MT','CY'];

// Resolve a destination's entry-type fill colour for the active passport.
// Returns null when no data exists (caller renders "terra incognita") or for banned.
function visaTypeColor(destIso2, passport) {
  if (!passport || !destIso2 || destIso2 === passport) return null;
  if (passport === 'DE' && _SCHENGEN.includes(destIso2)) return VISA_TYPE_COLORS.free;
  const dest = typeof VISA_DATA !== 'undefined' ? VISA_DATA[destIso2] : null;
  const entry = dest && dest[passport];
  if (!entry || entry.t === 'banned') return null;
  return VISA_TYPE_COLORS[entry.t] || VISA_TYPE_COLORS.req;
}

// Passport coverage across the destinations present in this almanac's VISA_DATA.
// Honestly scoped to the dataset — NOT a claim about all ~200 world states.
function visaCoverage(passport) {
  const out = { free:0, easy:0, req:0, banned:0, total:0 };
  if (!passport || typeof VISA_DATA === 'undefined') return out;
  Object.keys(VISA_DATA).forEach(dest => {
    if (dest === passport) return;
    const e = VISA_DATA[dest][passport];
    if (!e) return;
    out.total++;
    if (e.t === 'free') out.free++;
    else if (e.t === 'banned') out.banned++;
    else if (e.t === 'req') out.req++;
    else out.easy++;   // eta / evisa / voa
  });
  return out;
}

function getVisaRating(destIso2, passport) {
  if (!passport || !destIso2) return null;
  // Visiting your own country
  if (destIso2 === passport) return null;
  // DE represents all EU/Schengen; treat other Schengen destinations as free for DE holders
  if (passport === 'DE' && ['DE','ES','FR','IT','GR','PT','AT','BE','NL','LU','DK','FI','SE','IE','PL','CZ','SK','HU','SI','HR','EE','LV','LT','MT','CY'].includes(destIso2)) return null;
  const dest = typeof VISA_DATA !== 'undefined' ? VISA_DATA[destIso2] : null;
  if (!dest) return 2;   // unknown — assume requires a visa
  const entry = dest[passport];
  if (!entry) return 2;  // no data for this passport — default to required
  const t = entry.t;
  if (t === 'banned') return 3;  // entry refused — passport nationality banned
  if (t === 'free') return 0;
  if (t === 'eta' || t === 'evisa' || t === 'voa') return 1;
  return 2;              // 'req'
}

// Combines visa access and current-month weather into a single 0–3 score.
// 0 = Open & Sunny (visa-free + excellent/good weather)
// 1 = Visa-Free (visa-free but weather not ideal)
// 2 = Accessible (ETA / eVisa / VoA)
// 3 = Restricted (embassy visa required or entry closed)
function getStrengthRating(iso2) {
  if (!selectedNationality) return null;
  // Own country — no rating applicable
  if (iso2 === selectedNationality) return null;

  const visaR = getVisaRating(iso2, selectedNationality);
  if (visaR === null) return null;

  // Get the weather rating for the currently selected month
  const cdEntry = CD[iso2];
  const wxArr   = cdEntry && cdEntry.weather;
  const weather = wxArr ? getRating(wxArr) : null;

  if (visaR === 0 && weather !== null && weather <= 1) return 0; // Open & Sunny
  if (visaR === 0) return 1;          // Visa-free but weather not ideal
  if (visaR === 1) return 2;          // Easy access (ETA/eVisa)
  return 3;                           // Visa required
}

// Builds the visa detail section appended to the country tooltip.
function buildVisaSection(iso2) {
  const needsPassport = activeLayers.has('visa') || activeLayers.has('strength');
  if (!needsPassport && !selectedNationality) return '';
  const sel = document.getElementById('passport-select');
  const natName = sel && sel.value
    ? (sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : sel.value)
    : null;

  if (!selectedNationality) {
    // Visa or strength layer active but no passport chosen — prompt
    return needsPassport
      ? `<div style="margin-top:6px;padding-top:7px;border-top:1px solid rgba(201,168,76,0.10);font-size:7.5px;color:rgba(201,168,76,0.6)">
           ✈ Select your passport in the menu to see passport strength &amp; visa requirements.
         </div>`
      : '';
  }

  const dest = typeof VISA_DATA !== 'undefined' ? VISA_DATA[iso2] : null;
  if (!dest) return '';

  const entry = dest[selectedNationality];
  const isSelf = iso2 === selectedNationality ||
    (selectedNationality === 'DE' && ['DE','ES','FR','IT','GR','PT','AT','BE','NL','LU','DK','FI','SE','IE','PL','CZ','SK','HU','SI','HR','EE','LV','LT','MT','CY'].includes(iso2));

  const TYPE_META = {
    free:   { col:'#43A047', icon:'✅', label:'Visa-free',       desc:'No visa required. Present your passport on arrival.' },
    eta:    { col:'#8BC34A', icon:'📱', label:'ETA / Pre-reg.',  desc:'Quick online registration required before travel. Usually approved in minutes.' },
    evisa:  { col:'#FDD835', icon:'💻', label:'E-Visa',          desc:'Online visa application. Processing typically 3–10 business days.' },
    voa:    { col:'#FDD835', icon:'🏛', label:'Visa on Arrival', desc:'Obtain a visa stamp at the airport on arrival. Have cash and photos ready.' },
    req:    { col:'#EF6C00', icon:'📋', label:'Visa Required',   desc:'Apply at the embassy or consulate before departure. Allow 2–6 weeks.' },
    banned: { col:'#C62828', icon:'🚫', label:'Entry Denied',    desc:'This country does not permit entry to holders of this passport. Do not attempt to travel.' },
  };

  if (isSelf) {
    return `<div style="margin-top:6px;padding-top:7px;border-top:1px solid rgba(201,168,76,0.10)">
      <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;margin-bottom:5px">VISA &middot; ${natName}</div>
      <div style="font-size:9px;color:#90c070">🏠 You are a citizen or resident of this country.</div>
    </div>`;
  }

  if (!entry) {
    return `<div style="margin-top:6px;padding-top:7px;border-top:1px solid rgba(201,168,76,0.10)">
      <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;margin-bottom:5px">VISA &middot; ${natName}</div>
      <div style="font-size:9px;color:#c89060">📋 Visa likely required — check your country's embassy for current requirements.</div>
    </div>`;
  }

  const m = TYPE_META[entry.t] || TYPE_META.req;
  const cost = entry.c > 0 ? `&nbsp;&middot;&nbsp;<span style="color:#c9a84c">~$${entry.c} USD</span>` : `&nbsp;&middot;&nbsp;<span style="color:#43A047">Free</span>`;
  const days = entry.d > 0 ? `&nbsp;&middot;&nbsp;Up to <strong>${entry.d} days</strong>` : '';
  // Passport coverage bar — honestly scoped to the destinations in this almanac.
  const cov = visaCoverage(selectedNationality);
  const covPct = cov.total ? Math.round((cov.free / cov.total) * 100) : 0;
  const coverageHtml = cov.total ? `
    <div style="margin-top:7px;padding-top:6px;border-top:1px solid rgba(201,168,76,0.10)">
      <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.6px;text-transform:uppercase;margin-bottom:4px">PASSPORT COVERAGE &middot; ${natName}</div>
      <div style="display:flex;height:7px;border-radius:3px;overflow:hidden;border:1px solid rgba(201,168,76,0.18)">
        <div style="flex:${cov.free};background:${VISA_TYPE_COLORS.free}"></div>
        <div style="flex:${cov.easy};background:${VISA_TYPE_COLORS.voa}"></div>
        <div style="flex:${cov.req};background:${VISA_TYPE_COLORS.req}"></div>
        ${cov.banned ? `<div style="flex:${cov.banned};background:#1a0000"></div>` : ''}
      </div>
      <div style="font-size:8px;color:#7a8a5a;margin-top:4px">Visa-free to <strong style="color:#43A047">${cov.free}</strong> of ${cov.total} almanac destinations (${covPct}%).</div>
    </div>` : '';
  return `<div style="margin-top:6px;padding-top:7px;border-top:1px solid rgba(201,168,76,0.10)">
    <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;margin-bottom:6px">VISA &middot; ${natName}</div>
    <div class="ttr" style="margin-bottom:0">
      <div class="ttstrip" style="background:${m.col}"></div>
      <div class="tti">
        <div class="ttln">ENTRY REQUIREMENT</div>
        <div class="ttrat" style="color:${m.col}">${m.icon} ${m.label}</div>
        <div class="ttdesc">${m.desc}</div>
        <div class="ttdesc" style="margin-top:3px;color:#7a8a5a">${days ? days.trim() : ''}${cost}</div>
        <div class="ttdesc" style="margin-top:4px;color:#4a3a18">Always verify with your country's official government travel site before booking.</div>
      </div>
    </div>${coverageHtml}
  </div>`;
}

// ─── Nationality Selector ─────────────────────────────────────────────────────
function initNationalitySelector() {
  const sel = document.getElementById('passport-select');
  if (!sel) return;
  if (typeof PASSPORT_NATIONALITIES === 'undefined') return;

  Object.entries(PASSPORT_NATIONALITIES).forEach(([code, label]) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = label;
    sel.appendChild(opt);
  });

  sel.addEventListener('change', () => {
    selectedNationality = sel.value || null;

    // Auto-enable visa layer when a nationality is chosen
    if (selectedNationality && !activeLayers.has('visa')) {
      activeLayers.add('visa');
      document.querySelectorAll('.lb[data-key="visa"]').forEach(b => b.classList.add('on'));
    }

    // Remove pulse ring once a selection is made
    sel.classList.remove('needs-passport');

    refresh();
    updateURLState();
    saveState();
  });

  // Restore persisted nationality selection
  if (selectedNationality) {
    sel.value = selectedNationality;
  }

  // Helper: add pulse ring if visa or strength layer is on but no nationality selected
  function syncPassportState() {
    if ((activeLayers.has('visa') || activeLayers.has('strength')) && !selectedNationality) {
      sel.classList.add('needs-passport');
    } else {
      sel.classList.remove('needs-passport');
    }
  }

  // Re-check whenever the visa or strength layer button is toggled.
  // Listen on document because the visa button lives in #visa-btn-wrap (outside #layers)
  // after initVisaPassportGroup() moves it at boot.
  document.addEventListener('click', e => {
    const btn = e.target.closest('.lb');
    if (btn && (btn.dataset.key === 'visa' || btn.dataset.key === 'strength')) setTimeout(syncPassportState, 10);
  });
}

// ─── Holidays Tooltip Section ────────────────────────────────────────────────
function buildHolidaysSection(iso2) {
  if (typeof COUNTRY_HOLIDAYS === 'undefined') return '';
  const countryHols = COUNTRY_HOLIDAYS[iso2];
  if (!countryHols) return '';
  // Show holidays for the active month(s)
  const months = yearMode ? Object.keys(countryHols).map(Number) : [...selectedMonths];
  const hols = [];
  months.forEach(m => {
    const list = countryHols[m];
    if (list && list.length) {
      if (months.length > 1) {
        const mName = MONTHS_F[m];
        list.forEach(h => hols.push(`<span style="color:rgba(201,168,76,0.6);font-size:7px">${mName}</span> ${h}`));
      } else {
        list.forEach(h => hols.push(h));
      }
    }
  });
  if (!hols.length) return '';
  return `<div style="margin-top:6px;padding-top:7px;border-top:1px solid rgba(201,168,76,0.10)">
    <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;margin-bottom:5px">🗓 PUBLIC HOLIDAYS — ${yearMode ? 'THIS YEAR' : MONTHS_F[activeMonth].toUpperCase()}</div>
    ${hols.map(h => `<div style="font-size:8.5px;color:var(--sand);padding:2px 0;border-bottom:1px solid rgba(201,168,76,0.05)">${h}</div>`).join('')}
  </div>`;
}

// ─── Timezone Tooltip Section ────────────────────────────────────────────────
function buildTimezoneSection(iso2) {
  if (typeof COUNTRY_TIMEZONES === 'undefined' || !COUNTRY_TIMEZONES[iso2]) return '';
  const zones   = COUNTRY_TIMEZONES[iso2];
  const primary = zones[0];
  const others  = zones.slice(1);
  return `<div style="margin-top:6px;padding-top:7px;border-top:1px solid rgba(201,168,76,0.10)">
    <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;margin-bottom:4px">🕐 TIMEZONE</div>
    <div style="font-size:9px;color:var(--sand);font-weight:600">${primary}</div>
    ${others.length ? `<div style="font-size:7.5px;color:var(--dim);margin-top:3px;line-height:1.6">${others.join('<br>')}</div>` : ''}
  </div>`;
}

// ─── Cost Details Tooltip Section ────────────────────────────────────────────
// Appended to the country tooltip when the Cost layer is active.
function buildCostDetailsSection(iso2) {
  if (typeof COST_DETAILS === 'undefined' || !COST_DETAILS[iso2]) return '';
  const d    = COST_DETAILS[iso2];
  const curr = (typeof CURRENCY !== 'undefined' && CURRENCY[iso2]) ? CURRENCY[iso2] : '';

  // Daily budget estimate: hostel + 3 meals + transport (budget traveller)
  const budgetDay  = (d.hostel || 0) + (d.meal || 0) * 3 + (d.transport || 0);
  // Comfort daily: add coffee + beer to the budget estimate
  const comfortDay = budgetDay + (d.coffee || 0) + (d.beer || 0);

  // Compact always-visible summary card
  const compactCard = `<div style="margin-top:8px;padding:8px 10px;background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.14);border-radius:7px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <div style="font-size:6.5px;color:rgba(201,168,76,0.5);letter-spacing:1.6px;text-transform:uppercase">💰 DAILY BUDGET</div>
      ${curr ? `<div style="font-size:7px;font-weight:700;color:var(--gold);background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.25);border-radius:3px;padding:1px 6px;letter-spacing:0.8px">${_esc(curr)}</div>` : ''}
    </div>
    <div style="display:flex;gap:8px;margin-bottom:6px">
      <div style="flex:1;text-align:center;padding:4px 0;background:rgba(34,197,94,0.07);border-radius:5px;border:1px solid rgba(34,197,94,0.15)">
        <div style="font-size:7px;color:rgba(34,197,94,0.6);letter-spacing:0.8px;text-transform:uppercase">Budget</div>
        <div style="font-size:13px;font-weight:700;color:#4ade80">~${_money(budgetDay)}</div>
        <div style="font-size:6.5px;color:rgba(34,197,94,0.45)">per day</div>
      </div>
      <div style="flex:1;text-align:center;padding:4px 0;background:rgba(251,191,36,0.06);border-radius:5px;border:1px solid rgba(251,191,36,0.12)">
        <div style="font-size:7px;color:rgba(251,191,36,0.6);letter-spacing:0.8px;text-transform:uppercase">Comfort</div>
        <div style="font-size:13px;font-weight:700;color:#fbbf24">~${_money(comfortDay)}</div>
        <div style="font-size:6.5px;color:rgba(251,191,36,0.45)">per day</div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--dim)">
      <span title="Hostel/guesthouse per night">🛏 ${_money(d.hostel)}</span>
      <span title="Street meal">🍜 ${_money(d.meal)}</span>
      <span title="Local transport per day">🚇 ${_money(d.transport)}</span>
      <span title="Coffee">☕ ${_money(d.coffee)}</span>
      <span title="Local beer">${d.beer > 0 ? '🍺' : '🥤'} ${_money(d.beer)}</span>
    </div>
    ${d.note ? `<div style="margin-top:6px;font-size:7.5px;color:rgba(201,168,76,0.5);line-height:1.4;padding-top:5px;border-top:1px solid rgba(201,168,76,0.08)">${_esc(d.note)}</div>` : ''}
  </div>`;

  // Detailed breakdown only when cost layer is active
  if (!activeLayers.has('cost')) return `<div style="padding-top:6px;border-top:1px solid rgba(201,168,76,0.10);margin-top:8px">${compactCard}</div>`;

  const detailed = `
    <div class="ttr"><div class="ttstrip" style="background:#6a8a5a"></div>
      <div class="tti"><div class="ttln">ACCOMMODATION</div>
        <div class="ttrat" style="color:#90c070">Hostel / budget guesthouse</div>
        <div class="ttdesc">${_money(d.hostel)} per night</div></div></div>
    <div class="ttr"><div class="ttstrip" style="background:#8a7a3a"></div>
      <div class="tti"><div class="ttln">MEALS</div>
        <div class="ttrat" style="color:#c8a860">Street food / local restaurant</div>
        <div class="ttdesc">${_money(d.meal)} per meal</div></div></div>
    <div class="ttr"><div class="ttstrip" style="background:#4a6a8a"></div>
      <div class="tti"><div class="ttln">LOCAL TRANSPORT</div>
        <div class="ttrat" style="color:#80a8c8">Bus / metro / tuk-tuk</div>
        <div class="ttdesc">${_money(d.transport)} per day</div></div></div>
    <div class="ttr"><div class="ttstrip" style="background:#6a5a8a"></div>
      <div class="tti"><div class="ttln">DRINKS</div>
        <div class="ttrat" style="color:#a090c8">Coffee ${_money(d.coffee)} &middot; ${d.beer > 0 ? 'Beer ' + _money(d.beer) : 'Alcohol limited'}</div>
      </div></div>`;

  return `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(201,168,76,0.10)">
    <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;margin-bottom:6px">COST OF LIVING${curr ? ' &middot; ' + _esc(curr) : ''}</div>
    ${compactCard}${detailed}</div>`;
}

// ─── Health & Safety Section ─────────────────────────────────────────────────
function buildHealthSection(iso2) {
  if (!activeLayers.has('health') && !activeLayers.has('healthcare') &&
      !activeLayers.has('tapwater') && !activeLayers.has('airquality') &&
      !activeLayers.has('malaria')) return '';

  const HC_COLORS = ['#43A047', '#7CB342', '#EF6C00', '#C62828'];
  const MAL_COLORS = ['#43A047', '#FDD835', '#EF6C00', '#C62828'];

  const hcRaw  = (typeof CD_HEALTHCARE !== 'undefined' && CD_HEALTHCARE[iso2] != null) ? CD_HEALTHCARE[iso2] : null;
  const twRaw  = (typeof CD_TAPWATER   !== 'undefined' && CD_TAPWATER[iso2]   != null) ? CD_TAPWATER[iso2]   : null;
  const aqRaw  = (typeof CD_AIRQUALITY !== 'undefined' && CD_AIRQUALITY[iso2]  != null) ? CD_AIRQUALITY[iso2]  : null;
  const malRaw = (typeof CD_MALARIA    !== 'undefined' && CD_MALARIA[iso2]     != null) ? CD_MALARIA[iso2]     : null;

  const hcLabels  = ['World-class', 'Good quality', 'Basic/variable', 'Limited'];
  const twLabels  = ['Drinkable', 'Generally safe', 'Treat or buy bottled', 'Unsafe — bottled only'];
  const aqLabels  = ['Good', 'Moderate', 'Unhealthy for sensitive', 'Very unhealthy'];
  const malLabels = ['None', 'Low risk zone', 'Moderate risk', 'High risk'];

  function metricRow(label, val, labels, colors) {
    if (val === null) return '';
    const idx = Math.min(3, Math.max(0, val));
    const color = colors[idx];
    const text = labels[idx];
    return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
      <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></div>
      <div style="font-size:7.5px;color:rgba(232,213,163,0.7);flex:1">${label}</div>
      <div style="font-size:7.5px;font-weight:600;color:${color}">${_esc(text)}</div>
    </div>`;
  }

  const rows = metricRow('Healthcare', hcRaw, hcLabels, HC_COLORS) +
               metricRow('Tap Water',  twRaw, twLabels,  HC_COLORS) +
               metricRow('Air Quality', aqRaw, aqLabels, HC_COLORS) +
               metricRow('Malaria Risk', malRaw, malLabels, MAL_COLORS);

  const malariaWarn = (malRaw != null && malRaw >= 2)
    ? `<div style="margin-top:5px;padding:4px 6px;background:rgba(239,108,0,0.10);border:1px solid rgba(239,108,0,0.25);border-radius:4px;font-size:7px;color:#EF6C00;line-height:1.5">⚠ Antimalarial prophylaxis recommended — consult a doctor.</div>`
    : '';

  const waterWarn = (twRaw != null && twRaw >= 2)
    ? `<div style="margin-top:5px;padding:4px 6px;background:rgba(56,189,248,0.07);border:1px solid rgba(56,189,248,0.20);border-radius:4px;font-size:7px;color:rgba(56,189,248,0.85);line-height:1.5">💧 Drink bottled or purified water only.</div>`
    : '';

  const advisory = `<div style="margin-top:6px;padding:4px 6px;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);border-radius:4px;font-size:7px;color:rgba(201,168,76,0.6);line-height:1.5">Always consult a travel health clinic 4–6 weeks before departure for current vaccination requirements.</div>`;

  return `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(201,168,76,0.10)">
    <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;margin-bottom:6px">🏥 HEALTH &amp; SAFETY ESSENTIALS</div>
    ${rows}${malariaWarn}${waterWarn}${advisory}
  </div>`;
}

// ─── Language & Connectivity Section ─────────────────────────────────────────
function buildLanguageSection(iso2) {
  if (!activeLayers.has('english') && !activeLayers.has('nomad') && !activeLayers.has('internet')) return '';

  const RC4 = ['#43A047', '#7CB342', '#EF6C00', '#C62828'];

  // Retrieve raw rating values, clamped to 0-3
  const engRaw   = (typeof CD_ENGLISH !== 'undefined' && CD_ENGLISH[iso2] != null)  ? Math.min(3, Math.max(0, CD_ENGLISH[iso2]))  : null;
  const netRaw   = (typeof CD_INTERNET !== 'undefined' && CD_INTERNET[iso2] != null) ? Math.min(3, Math.max(0, CD_INTERNET[iso2])) : null;
  const nomadRaw = (typeof CD_NOMAD !== 'undefined' && CD_NOMAD[iso2] != null)       ? Math.min(3, Math.max(0, CD_NOMAD[iso2]))    : null;

  const engLabels   = ['Very High', 'High', 'Moderate', 'Low'];
  const netLabels   = ['Excellent', 'Good', 'Fair', 'Poor'];
  const nomadLabels = ['Excellent', 'Good', 'Fair', 'Challenging'];

  function metricRow(label, val, labels) {
    if (val === null) return '';
    const color = RC4[val];
    const text  = labels[val];
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(201,168,76,0.06)">
      <span style="font-size:6.5px;color:rgba(232,213,163,0.5);letter-spacing:0.8px;text-transform:uppercase">${_esc(label)}</span>
      <span style="display:flex;align-items:center;gap:4px">
        <span style="width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0"></span>
        <span style="font-size:8px;color:${color};font-weight:600">${_esc(text)}</span>
      </span>
    </div>`;
  }

  const rows = metricRow('English Proficiency', engRaw, engLabels)
             + metricRow('Internet Quality', netRaw, netLabels)
             + metricRow('Nomad Score', nomadRaw, nomadLabels);

  // Practical notes
  const notes = [];
  if (engRaw === 0 || engRaw === 1) {
    notes.push('English widely spoken');
  } else if (engRaw === 3) {
    notes.push('Limited English — carry a phrasebook or translation app');
  }
  if (nomadRaw === 0) {
    notes.push('Top-rated digital nomad destination');
  }
  const currCode = (typeof CURRENCY !== 'undefined' && CURRENCY[iso2]) ? CURRENCY[iso2] : null;
  if (currCode) {
    notes.push('Local currency: ' + currCode);
  }

  const notesHtml = notes.length
    ? `<div style="margin-top:5px;padding-top:5px;border-top:1px solid rgba(201,168,76,0.08)">${
        notes.map(function(n) {
          return `<div style="font-size:7.5px;color:rgba(232,213,163,0.55);line-height:1.5;padding:1px 0">• ${_esc(n)}</div>`;
        }).join('')
      }</div>`
    : '';

  return `<div style="margin-top:8px;padding:8px 10px;background:rgba(201,168,76,0.04);border:1px solid rgba(201,168,76,0.10);border-radius:7px">
    <div style="font-size:6.5px;color:rgba(201,168,76,0.6);letter-spacing:1.8px;text-transform:uppercase;margin-bottom:6px;font-weight:700">&#x1F5E3; LANGUAGE &amp; CONNECTIVITY</div>
    <div>${rows}</div>
    ${notesHtml}
  </div>`;
}

// ─── Climate Wheel Section ────────────────────────────────────────────────────
function buildClimateWheelSection(iso2) {
  if (typeof CD_CLIMATE === 'undefined' || !CD_CLIMATE[iso2]) return '';
  const d = CD_CLIMATE[iso2];
  const temps = d.temp;
  const rains = d.rain;
  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const now = new Date();
  const curMon = now.getMonth(); // 0-11

  // Scale rain bars: max bar = 32px
  const maxRain = Math.max(...rains, 1);
  const BAR_MAX = 32;

  // Determine best travel months: rain in lowest third AND temp 20-28°C
  const rainThresh = maxRain * 0.35;
  const bestMonths = MONTHS.filter((_, i) => rains[i] <= rainThresh && temps[i] >= 20 && temps[i] <= 28);

  // Build 12-column bar chart
  let bars = '';
  for (let i = 0; i < 12; i++) {
    const h = Math.max(2, Math.round((rains[i] / maxRain) * BAR_MAX));
    const isActive = i === curMon;
    const border = isActive ? 'border:1px solid rgba(201,168,76,0.9);' : 'border:1px solid transparent;';
    const tempLabel = isActive
      ? `<div style="font-size:6px;color:rgba(251,191,36,0.9);text-align:center;margin-bottom:1px">${temps[i]}&deg;</div>`
      : `<div style="font-size:6px;color:rgba(232,213,163,0.35);text-align:center;margin-bottom:1px">${temps[i]}&deg;</div>`;
    bars += `<div style="display:flex;flex-direction:column;align-items:center;width:14px">
      ${tempLabel}
      <div style="width:10px;height:${BAR_MAX}px;display:flex;align-items:flex-end;${border}border-radius:2px;box-sizing:border-box">
        <div style="width:100%;height:${h}px;background:rgba(56,189,248,0.6);border-radius:1px"></div>
      </div>
      <div style="font-size:5.5px;color:rgba(232,213,163,${isActive ? '0.9' : '0.4'});text-align:center;margin-top:2px;letter-spacing:0.3px">${MONTHS[i]}</div>
    </div>`;
  }

  const bestLine = bestMonths.length
    ? `<div style="margin-top:5px;font-size:7px;color:rgba(232,213,163,0.55)">Best: <span style="color:#43A047;font-weight:700">${bestMonths.join(' ')}</span></div>`
    : '';

  return `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(201,168,76,0.10)">
    <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;margin-bottom:6px">CLIMATE &middot; RAINFALL mm</div>
    <div style="display:flex;gap:1px;align-items:flex-end">${bars}</div>
    ${bestLine}
  </div>`;
}

// ─── Safety Section ──────────────────────────────────────────────────────────
function buildSafetySection(iso2) {
  if (!activeLayers.has('safety')) return '';
  const safetyVal   = (typeof CD_SAFETY !== 'undefined' && CD_SAFETY[iso2] != null)   ? CD_SAFETY[iso2]   : null;
  const femaleVal   = (typeof CD_FEMALE_SAFETY !== 'undefined' && CD_FEMALE_SAFETY[iso2] != null) ? CD_FEMALE_SAFETY[iso2] : null;
  const scamVal     = (typeof CD_SCAM !== 'undefined' && CD_SCAM[iso2] != null)        ? CD_SCAM[iso2]     : null;
  if (safetyVal === null && femaleVal === null && scamVal === null) return '';

  const safetyColors  = ['#43A047','#7CB342','#EF6C00','#C62828'];
  const safetyLabels  = ['Very Safe','Generally Safe','Exercise Caution','High Risk'];
  const femaleLabels  = ['Very Safe for Solo Women','Safe for Solo Women','Exercise Caution','High Caution Advised'];
  const scamLabels    = ['Minimal Scam Risk','Low Scam Risk','Moderate Scam Risk','High Scam Risk'];

  function _safeColor(v) { return safetyColors[Math.min(3, Math.max(0, v))]; }
  function _safeLabel(arr, v) { return arr[Math.min(3, Math.max(0, v))] || ''; }

  function _metricRow(label, v, labelArr) {
    if (v === null) return '';
    const c = _safeColor(v);
    const lbl = _safeLabel(labelArr, v);
    const pct = Math.round(((v + 1) / 4) * 100);
    return `<div style="margin-bottom:5px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
        <span style="font-size:7px;color:rgba(232,213,163,0.55);letter-spacing:0.8px;text-transform:uppercase">${_esc(label)}</span>
        <span style="font-size:7.5px;color:${c};font-weight:700">${_esc(lbl)}</span>
      </div>
      <div style="height:3px;background:rgba(201,168,76,0.1);border-radius:2px">
        <div style="height:3px;width:${pct}%;background:${c};border-radius:2px"></div>
      </div>
    </div>`;
  }

  const sv = safetyVal !== null ? Math.min(3, Math.max(0, safetyVal)) : null;
  const chipColor = sv !== null ? _safeColor(sv) : '#7CB342';
  const chipLabel = sv !== null ? _safeLabel(safetyLabels, sv) : 'Data Limited';

  const noteHtml = (typeof SAFETY_NOTES !== 'undefined' && SAFETY_NOTES[iso2])
    ? `<div style="margin-top:6px;padding-top:5px;border-top:1px solid rgba(201,168,76,0.08);font-size:7.5px;color:rgba(232,213,163,0.6);line-height:1.45;font-style:italic"><span style="color:rgba(201,168,76,0.5);font-style:normal">Local context: </span>${_esc(SAFETY_NOTES[iso2])}</div>`
    : '';

  return `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(201,168,76,0.10)">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase">SAFETY INDEX</div>
      <div style="font-size:7.5px;font-weight:700;color:${chipColor};background:rgba(0,0,0,0.25);border:1px solid ${chipColor}44;border-radius:3px;padding:2px 6px">${_esc(chipLabel)}</div>
    </div>
    <div style="font-size:7px;color:rgba(232,213,163,0.38);line-height:1.4;margin-bottom:7px;font-style:italic">Index-based estimate only. Conditions change rapidly — check your government's current travel advisory before departure.</div>
    ${_metricRow('Overall Safety', safetyVal, safetyLabels)}
    ${_metricRow('Female Solo Safety', femaleVal, femaleLabels)}
    ${_metricRow('Scam Risk', scamVal, scamLabels)}
    ${noteHtml}
  </div>`;
}

// ─── Travel Journal Section ───────────────────────────────────────────────────
function buildJournalSection(iso2) {
  const note = _getNote(iso2);
  const noteHtml = note
    ? '<div style="font-size:8.5px;color:var(--sand);line-height:1.5;white-space:pre-wrap;padding:5px 7px;background:rgba(201,168,76,0.04);border-radius:4px;border:1px solid rgba(201,168,76,0.10)">' + _esc(note) + '</div>'
    : '<div style="font-size:7.5px;color:rgba(201,168,76,0.3);font-style:italic">No notes yet.</div>';
  const btnLabel = note ? 'Edit' : '+ Add Note';
  return '<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(201,168,76,0.10)">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">' +
    '<div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase">&#x270F; MY JOURNAL</div>' +
    '<button id="jbtn-' + iso2 + '" onclick="_openJournalEditor(\'' + iso2 + '\')" style="font-size:7px;color:var(--gold);background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:3px;padding:2px 7px;cursor:pointer;font-family:var(--fm)">' + btnLabel + '</button>' +
    '</div>' +
    '<div id="jnote-' + iso2 + '">' + noteHtml + '</div>' +
    '<div id="jed-' + iso2 + '" style="display:none;margin-top:5px">' +
    '<textarea id="jta-' + iso2 + '" maxlength="2000" placeholder="Your thoughts, tips, memories..." style="width:100%;min-height:70px;background:rgba(14,11,6,0.85);border:1px solid rgba(201,168,76,0.25);border-radius:5px;color:var(--sand);font-family:var(--fm);font-size:8.5px;padding:6px 8px;resize:vertical;outline:none;box-sizing:border-box">' + _esc(note) + '</textarea>' +
    '<div style="display:flex;gap:5px;margin-top:4px">' +
    '<button onclick="_saveJournalEntry(\'' + iso2 + '\')" style="flex:1;padding:4px;font-family:var(--fm);font-size:8px;background:rgba(201,168,76,0.12);border:1px solid var(--b2);border-radius:4px;color:var(--gold);cursor:pointer">Save</button>' +
    '<button onclick="_closeJournalEditor(\'' + iso2 + '\')" style="padding:4px 8px;font-family:var(--fm);font-size:8px;background:none;border:1px solid rgba(201,168,76,0.15);border-radius:4px;color:var(--dim);cursor:pointer">Cancel</button>' +
    '</div></div></div>';
}
function _openJournalEditor(iso2) {
  const ed = document.getElementById('jed-' + iso2);
  const btn = document.getElementById('jbtn-' + iso2);
  if (ed) { ed.style.display = 'block'; var ta = document.getElementById('jta-' + iso2); if (ta) { ta.focus(); ta.selectionStart = ta.value.length; } }
  if (btn) btn.style.display = 'none';
}
function _closeJournalEditor(iso2) {
  var ed = document.getElementById('jed-' + iso2);
  var btn = document.getElementById('jbtn-' + iso2);
  if (ed) ed.style.display = 'none';
  if (btn) btn.style.display = '';
}
function _saveJournalEntry(iso2) {
  var ta = document.getElementById('jta-' + iso2);
  if (!ta) return;
  _saveNote(iso2, ta.value);
  _closeJournalEditor(iso2);
  var note = _getNote(iso2);
  var noteEl = document.getElementById('jnote-' + iso2);
  if (noteEl) noteEl.innerHTML = note
    ? '<div style="font-size:8.5px;color:var(--sand);line-height:1.5;white-space:pre-wrap;padding:5px 7px;background:rgba(201,168,76,0.04);border-radius:4px;border:1px solid rgba(201,168,76,0.10)">' + _esc(note) + '</div>'
    : '<div style="font-size:7.5px;color:rgba(201,168,76,0.3);font-style:italic">No notes yet.</div>';
  var btn = document.getElementById('jbtn-' + iso2);
  if (btn) btn.textContent = note ? 'Edit' : '+ Add Note';
}


// ─── URL Deep Linking ─────────────────────────────────────────────────────────
let _applyingHash = false;   // re-entrancy guard: suppresses updateURLState while restoring
let _pendingView  = null;    // {zoom, center:[lat,lng]} stashed when map is not yet ready

function initURLState() {
  // Read initial state from URL hash e.g. #month=6&layer=weather,cost&nat=US&zoom=4&center=48.8,2.3
  // Suppress updateURLState() side-effects (setMonth calls it) while restoring, so the
  // incoming hash is not clobbered before every param is read. Save/restore the prior
  // guard value so the hashchange path (which sets it true) is not cleared early.
  const _prevGuard = _applyingHash;
  _applyingHash = true;
  try {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const m = parseInt(params.get('month'));
    if (!isNaN(m) && m >= 0 && m <= 11) setMonth(m);
    // Multi-layer: comma-separated; a single bare slug stays backward compatible.
    const lyr = params.get('layer');
    if (lyr && typeof LAYERS !== 'undefined') {
      const wanted = lyr.split(',').filter(k => k in LAYERS);
      if (wanted.length) { activeLayers.clear(); wanted.forEach(k => activeLayers.add(k)); }
    }
    // Map view: apply now if the map exists (hashchange path), else stash for boot.
    const z = parseFloat(params.get('zoom'));
    const c = (params.get('center') || '').split(',').map(Number);
    if (!isNaN(z) && c.length === 2 && c.every(n => !isNaN(n))) {
      if (map) map.setView([c[0], c[1]], z); else _pendingView = { zoom: z, center: [c[0], c[1]] };
    }
    const nat = params.get('nat');
    if (nat) {
      selectedNationality = nat;
      // The select element is populated later by initNationalitySelector();
      // it reads selectedNationality on init and sets sel.value accordingly.
    }
    const pinsParam = params.get('pins');
    if (pinsParam) {
      try {
        const pinsRaw = JSON.parse(decodeURIComponent(pinsParam));
        if (Array.isArray(pinsRaw)) {
          pinsRaw.forEach(function(p, i) {
            if (Array.isArray(p) && typeof p[0] === 'number' && typeof p[1] === 'number') {
              _tripPins.push({ id: 'tp_url' + i, lat: p[0], lng: p[1], name: (typeof p[2] === 'string' ? p[2] : 'Pin ' + (i+1)).slice(0,120) });
            }
          });
        }
      } catch(_e) {}
    }
    const compareParam = params.get('compare');
    if (compareParam) {
      const codes = compareParam.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length === 2);
      if (codes.length >= 2) {
        pinnedCountries = codes.slice(0, 4);
        // renderComparePanel() will be called after refresh()
      }
    }
  } finally {
    _applyingHash = _prevGuard;
  }
}

function updateURLState() {
  if (_applyingHash) return;   // do not rewrite the hash while restoring from it
  const layers = [...activeLayers];
  let hash = 'month=' + activeMonth;
  if (layers.length) hash += '&layer=' + layers.join(',');   // all active layers, not just the first
  if (selectedNationality) hash += '&nat=' + selectedNationality;
  if (map) {
    const ctr = map.getCenter();
    hash += '&zoom=' + map.getZoom();
    hash += '&center=' + ctr.lat.toFixed(3) + ',' + ctr.lng.toFixed(3);
  }
  if (typeof _tripPins !== 'undefined' && _tripPins.length > 0) {
    const encoded = _tripPins.map(function(p) { return [Math.round(p.lat*1000)/1000, Math.round(p.lng*1000)/1000, p.name.slice(0,40)]; });
    hash += '&pins=' + encodeURIComponent(JSON.stringify(encoded));
  }
  if (typeof pinnedCountries !== 'undefined' && pinnedCountries.length >= 2) {
    hash += '&compare=' + pinnedCountries.join(',');
  }
  history.replaceState(null, '', '#' + hash);
}

// Restore state on browser back/forward or manual hash edits. replaceState does
// not fire this event, so updateURLState() cannot trigger a loop; the guard is belt-and-braces.
window.addEventListener('hashchange', function() {
  _applyingHash = true;
  try { initURLState(); if (typeof refresh === 'function') refresh(); }
  finally { _applyingHash = false; }
});

// ─── Country Search ───────────────────────────────────────────────────────────
// Country name → ISO-2 lookup for search
const COUNTRY_NAMES = {
  AE:'UAE / Dubai', AR:'Argentina', AU:'Australia', BR:'Brazil',
  CA:'Canada', CN:'China', CO:'Colombia',
  DE:'Germany', EG:'Egypt', ES:'Spain', FR:'France', GB:'United Kingdom',
  GR:'Greece', ID:'Indonesia', IN:'India', IT:'Italy', JP:'Japan', KR:'South Korea',
  MA:'Morocco', MX:'Mexico', NG:'Nigeria', NZ:'New Zealand', PE:'Peru', PH:'Philippines',
  PK:'Pakistan', PT:'Portugal', RU:'Russia', SG:'Singapore', TH:'Thailand', TR:'Turkey',
  US:'United States', VN:'Vietnam', ZA:'South Africa',
  MY:'Malaysia', KH:'Cambodia', LA:'Laos', MM:'Myanmar', LK:'Sri Lanka',
  NP:'Nepal', KE:'Kenya', TZ:'Tanzania', GH:'Ghana', CL:'Chile',
  EC:'Ecuador', CU:'Cuba', CZ:'Czech Republic', PL:'Poland', HU:'Hungary',
};
// Approximate centres for fly-to
const COUNTRY_CENTERS = {
  AE:[24,54], AR:[-38,-65], AU:[-25,134], BR:[-10,-53], CA:[60,-96], CN:[35,105], CO:[4,-74],
  DE:[51,10], EG:[27,30], ES:[40,-4], FR:[46,2], GB:[54,-2],
  GR:[39,22], ID:[-5,120], IN:[21,79], IT:[43,12], JP:[37,138], KR:[37,128],
  MA:[32,-5], MX:[24,-102], NG:[9,8], NZ:[-41,174], PE:[-10,-76], PH:[13,122],
  PK:[30,70], PT:[39,-8], RU:[62,99], SG:[1.3,104], TH:[15,101], TR:[39,35],
  US:[38,-97], VN:[16,108], ZA:[-29,25],
  MY:[4,108], KH:[13,105], LA:[18,103], MM:[17,96], LK:[8,81], NP:[28,84],
  KE:[-1,38], TZ:[-6,35], GH:[8,-2], CL:[-35,-71], EC:[-2,-78], CU:[22,-80],
  CZ:[50,16], PL:[52,20], HU:[47,19],
  // Mediterranean
  CY:[35,33], MT:[35.9,14.5],
  // Middle East
  IL:[31.5,35], JO:[31,36], LB:[33.9,35.5], SA:[24,45], KW:[29,48],
  QA:[25.3,51], BH:[26,50.5], OM:[22,57], IR:[32,53], IQ:[33,44], SY:[35,38],
  YE:[15,48],
  // North Africa
  DZ:[28,2], LY:[27,17],
  // More Europe
  NL:[52.4,5.3], BE:[50.5,4.5], AT:[47.5,14], CH:[47,8.3], SE:[60,15],
  NO:[64,14], DK:[56,10], FI:[64,26], IE:[53,-8], IS:[65,-18],
  RO:[46,25], BG:[43,25], HR:[45,16], SI:[46,15], SK:[48.7,19], RS:[44,21],
  AL:[41,20], ME:[42.9,19.5], BA:[44,17.4], MK:[41.6,21.7],
  // East Europe/Caucasus
  EE:[58.6,25], LV:[57,25], LT:[56,24], UA:[49,32], GE:[42,43.5],
  AM:[40,45], AZ:[40.5,47.5],
  // SE Asia
  BN:[4.5,114.7], TW:[23.7,121], HK:[22.4,114], MO:[22.2,113],
};

// ─── Discovery Features ───────────────────────────────────────────────────────

function showToast(msg) {
  var t = document.getElementById('_toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_toast';
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(14,11,6,0.95);color:var(--sand);border:1px solid rgba(201,168,76,0.4);padding:8px 16px;border-radius:20px;font-size:11px;z-index:9999;pointer-events:none;transition:opacity 0.4s';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(function(){t.style.opacity='0';}, 3200);
}

function _surpriseMe() {
  if (!_geoData || !_geoData.features) { alert('Map data not loaded yet.'); return; }
  var geoLayers = Array.from(activeLayers).filter(function(k){ return GEOGRAPHIC_LAYERS.has(k); });
  if (geoLayers.length === 0) geoLayers = ['safety','cost','weather'];
  var prev = new Set(activeLayers);
  var candidates = [];
  _geoData.features.forEach(function(f) {
    var iso2 = f.properties && (f.properties.ISO_A2 || f.properties.iso_a2 || f.properties.ISO2);
    if (!iso2 || iso2 === '-99') return;
    var totalScore = 0;
    geoLayers.forEach(function(lk) {
      activeLayers.clear(); activeLayers.add(lk);
      var r = getCountryRating(iso2);
      if (r != null) totalScore += r;
    });
    activeLayers.clear(); prev.forEach(function(k){activeLayers.add(k);});
    if (totalScore <= geoLayers.length) candidates.push({iso2:iso2, score:totalScore});
  });
  if (candidates.length === 0) { alert('No great matches found — try fewer layers active.'); return; }
  candidates.sort(function(a,b){return a.score-b.score;});
  var top = candidates.slice(0, Math.max(5, Math.floor(candidates.length * 0.2)));
  var pick = top[Math.floor(Math.random() * top.length)];
  var center = (typeof COUNTRY_CENTERS !== 'undefined' && COUNTRY_CENTERS[pick.iso2]);
  if (center) {
    map.flyTo(center, 5, {duration:1.5});
  }
  var name = (typeof countryNames !== 'undefined' && countryNames[pick.iso2]) || pick.iso2;
  var flag = typeof _countryFlag === 'function' ? _countryFlag(pick.iso2) : '';
  setTimeout(function() {
    showToast(flag + ' Surprise: ' + name + '! Score: ' + pick.score + '/' + geoLayers.length);
  }, 800);
}

function _findSimilarCountries(iso2) {
  var keys = ['safety','cost','weather','internet','english','healthcare','tapwater','airquality','scam'];
  var prev = new Set(activeLayers);
  function getProfile(code) {
    return keys.map(function(lk) {
      activeLayers.clear(); activeLayers.add(lk);
      var r = getCountryRating(code);
      activeLayers.clear(); prev.forEach(function(k){activeLayers.add(k);});
      return r != null ? r : 1.5;
    });
  }
  var target = getProfile(iso2);
  var results = [];
  if (!_geoData) return [];
  _geoData.features.forEach(function(f) {
    var code = f.properties && (f.properties.ISO_A2 || f.properties.iso_a2 || f.properties.ISO2);
    if (!code || code === '-99' || code === iso2) return;
    var prof = getProfile(code);
    var dist = Math.sqrt(target.reduce(function(sum,v,i){return sum+Math.pow(v-prof[i],2);},0));
    results.push({iso2:code, dist:dist});
  });
  results.sort(function(a,b){return a.dist-b.dist;});
  return results.slice(0,5);
}

function initSearch() {
  const input  = document.getElementById('country-search');
  const list   = document.getElementById('search-results');
  if (!input || !list) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    list.innerHTML = '';
    if (q.length < 1) { list.style.display = 'none'; return; }
    const matches = Object.entries(COUNTRY_NAMES)
      .filter(([iso, name]) => name.toLowerCase().startsWith(q) || iso.toLowerCase() === q)
      .slice(0, 8);
    if (!matches.length) { _searchNominatim(q, list); return; }
    matches.forEach(([iso, name]) => {
      const item = document.createElement('div');
      item.className = 'sr-item';
      item.textContent = name;
      item.addEventListener('mouseenter', () => highlightCountry(iso));
      item.addEventListener('mouseleave', () => unhighlightCountry(iso));
      item.addEventListener('click', () => {
        unhighlightCountry(iso);
        input.value = '';
        list.style.display = 'none';
        const c = COUNTRY_CENTERS[iso];
        if (c && map) map.flyTo(c, 5, { duration: 1.2 });
      });
      list.appendChild(item);
    });
    list.style.display = 'block';
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.style.display = 'none';
    }
  });

  // ── Surprise Me button ──────────────────────────────────────────────────────
  var wrap = input.closest('#search-wrap') || input.parentNode;
  if (wrap && !document.getElementById('btn-surprise')) {
    var surpriseBtn = document.createElement('button');
    surpriseBtn.id = 'btn-surprise';
    surpriseBtn.title = 'Surprise Me — find a great match!';
    surpriseBtn.textContent = '🎲';
    surpriseBtn.style.cssText = 'background:rgba(14,11,6,0.85);border:1px solid var(--gold);color:var(--gold);border-radius:6px;padding:3px 7px;font-size:13px;cursor:pointer;margin-left:4px;vertical-align:middle;line-height:1;flex-shrink:0';
    surpriseBtn.addEventListener('click', _surpriseMe);
    wrap.appendChild(surpriseBtn);
  }

  // ── Best For X button ───────────────────────────────────────────────────────
  if (wrap && !document.getElementById('btn-best-for-x')) {
    var bfxBtn = document.createElement('button');
    bfxBtn.id = 'btn-best-for-x';
    bfxBtn.title = 'Best Countries For…';
    bfxBtn.textContent = '🎯';
    bfxBtn.style.cssText = 'background:rgba(14,11,6,0.85);border:1px solid var(--gold);color:var(--gold);border-radius:6px;padding:3px 7px;font-size:13px;cursor:pointer;margin-left:4px;vertical-align:middle;line-height:1;flex-shrink:0';
    bfxBtn.addEventListener('click', _toggleBestForXPanel);
    wrap.appendChild(bfxBtn);
  }
}

function _initBestForXPanel() {
  var panel = document.getElementById('best-for-x-panel');
  if (panel) return;
  panel = document.createElement('div');
  panel.id = 'best-for-x-panel';
  panel.style.cssText = 'position:fixed;right:12px;top:96px;width:240px;max-height:70vh;overflow-y:auto;background:rgba(14,11,6,0.97);border:1px solid rgba(201,168,76,0.3);border-radius:10px;padding:12px;z-index:1100;display:none;font-family:var(--fm)';
  var layerKeys = ['weather','safety','cost','internet','english','healthcare','tapwater','airquality','femalesafety','nightlife','scam','malaria','lgbtq','nomad','cannabis','kids','beaches'];
  var html = '<div style="font-size:9px;letter-spacing:1.5px;color:rgba(201,168,76,0.7);text-transform:uppercase;margin-bottom:10px">🎯 Best Countries For...</div>';
  html += '<div style="font-size:8px;color:var(--dim);margin-bottom:8px">Pick up to 3 criteria (best = 0, worst = 3):</div>';
  for (var i = 0; i < 3; i++) {
    html += '<div style="margin-bottom:6px;display:flex;gap:6px;align-items:center">';
    html += '<select id="bfx-layer-' + i + '" style="flex:1;background:rgba(255,255,255,0.06);color:var(--sand);border:1px solid rgba(201,168,76,0.2);border-radius:4px;padding:3px;font-size:8px">';
    html += '<option value="">— Layer ' + (i+1) + ' —</option>';
    layerKeys.forEach(function(k){html += '<option value="' + k + '">' + (typeof LAYERS!=='undefined'&&LAYERS[k]?LAYERS[k].emoji+' '+LAYERS[k].name:k) + '</option>';});
    html += '</select>';
    html += '<select id="bfx-max-' + i + '" style="width:50px;background:rgba(255,255,255,0.06);color:var(--sand);border:1px solid rgba(201,168,76,0.2);border-radius:4px;padding:3px;font-size:8px">';
    html += '<option value="1">Best</option><option value="2">Good</option><option value="3">Any</option>';
    html += '</select></div>';
  }
  html += '<button id="bfx-run" style="width:100%;padding:6px;background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.4);border-radius:6px;color:var(--gold);font-size:9px;cursor:pointer;margin-top:4px">🔍 Find Matching Countries</button>';
  html += '<div id="bfx-results" style="margin-top:8px;max-height:200px;overflow-y:auto"></div>';
  html += '<button onclick="document.getElementById(\'best-for-x-panel\').style.display=\'none\'" style="position:absolute;top:8px;right:10px;background:none;border:none;color:var(--dim);cursor:pointer;font-size:12px">✕</button>';
  panel.innerHTML = html;
  document.body.appendChild(panel);
  var runBtn = document.getElementById('bfx-run');
  if (runBtn) runBtn.addEventListener('click', _runBestForX);
}

function _runBestForX() {
  var criteria = [];
  for (var i = 0; i < 3; i++) {
    var lEl = document.getElementById('bfx-layer-' + i);
    var mEl = document.getElementById('bfx-max-' + i);
    if (lEl && lEl.value && mEl) criteria.push({layer: lEl.value, max: parseInt(mEl.value)});
  }
  if (criteria.length === 0) return;
  var prev = new Set(activeLayers);
  var matches = [];
  if (!_geoData || !_geoData.features) return;
  _geoData.features.forEach(function(f) {
    var iso2 = f.properties && (f.properties.ISO_A2 || f.properties.iso_a2 || f.properties.ISO2);
    if (!iso2 || iso2 === '-99') return;
    var ok = criteria.every(function(c) {
      activeLayers.clear(); activeLayers.add(c.layer);
      var r = getCountryRating(iso2);
      activeLayers.clear(); prev.forEach(function(k){activeLayers.add(k);});
      return r != null && r <= c.max;
    });
    if (ok) {
      activeLayers.clear(); activeLayers.add(criteria[0].layer);
      var score = getCountryRating(iso2) || 0;
      activeLayers.clear(); prev.forEach(function(k){activeLayers.add(k);});
      matches.push({iso2: iso2, score: score});
    }
  });
  matches.sort(function(a,b){return a.score-b.score;});
  var results = document.getElementById('bfx-results');
  if (!results) return;
  if (matches.length === 0) { results.innerHTML = '<div style="font-size:8px;color:var(--dim)">No countries match all criteria.</div>'; return; }
  results.innerHTML = '<div style="font-size:8px;color:var(--dim);margin-bottom:4px">' + matches.length + ' matches:</div>' +
    matches.slice(0, 30).map(function(m) {
      var flag = typeof _countryFlag==='function' ? _countryFlag(m.iso2) : '';
      var name = (typeof countryNames!=='undefined'&&countryNames[m.iso2]) || m.iso2;
      return '<div style="font-size:8.5px;color:var(--sand);padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer" data-iso="' + m.iso2 + '">' + flag + ' ' + _esc(name) + '</div>';
    }).join('');
  results.querySelectorAll('[data-iso]').forEach(function(el) {
    el.addEventListener('click', function() {
      var iso = this.getAttribute('data-iso');
      var ctr = typeof COUNTRY_CENTERS!=='undefined' && COUNTRY_CENTERS[iso];
      if (ctr) map.flyTo(ctr, 5, {duration:1.2});
    });
  });
}

function _toggleBestForXPanel() {
  _initBestForXPanel();
  var p = document.getElementById('best-for-x-panel');
  if (p) p.style.display = p.style.display === 'none' || p.style.display === '' ? 'block' : 'none';
}

var _nominatimDebounce = null;
function _searchNominatim(query, listEl) {
  if (!listEl) return;
  clearTimeout(_nominatimDebounce);
  _nominatimDebounce = setTimeout(function() {
    var url = 'https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&q=' + encodeURIComponent(query);
    fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'NomadicAlmanac/1.0' } })
      .then(function(res) { return res.ok ? res.json() : []; })
      .then(function(results) {
        if (!results.length) { listEl.style.display = 'none'; return; }
        listEl.innerHTML = '';
        results.forEach(function(r) {
          var item = document.createElement('div');
          item.className = 'sr-item';
          var parts = r.display_name.split(',');
          var name = parts.slice(0, 2).join(',').trim();
          item.textContent = '📍 ' + name;
          item.style.cssText = 'color:rgba(232,213,163,0.75);';
          item.addEventListener('click', function() {
            listEl.style.display = 'none';
            var inp = document.getElementById('country-search');
            if (inp) inp.value = '';
            if (map) map.flyTo([parseFloat(r.lat), parseFloat(r.lon)], 10, { duration: 1.2 });
          });
          listEl.appendChild(item);
        });
        listEl.style.display = 'block';
      })
      .catch(function() { listEl.style.display = 'none'; });
  }, 450);
}

// ─── Best Destinations Panel ──────────────────────────────────────────────────
// The widget lives inside #legend.  #best-toggle is always visible when the
// legend is open; clicking it expands/collapses #best-panel-list.
// ─── Legend collapsible + layer picker ───────────────────────────────────────
function initLegendCollapsible() {
  const h4     = document.getElementById('legend-title');
  const body   = document.getElementById('legend-body');
  const btWrap = document.getElementById('best-toggle');
  const btList = document.getElementById('best-panel-list');
  if (!h4 || !body) return;

  // Wrap the color rows and Best This Month in a collapsible div
  const wrap = document.createElement('div');
  wrap.id = 'legend-body-wrap';
  body.parentNode.insertBefore(wrap, body);
  wrap.appendChild(body);
  if (btWrap) wrap.appendChild(btWrap);
  if (btList) wrap.appendChild(btList);

  // Remove the static "FIELD GUIDE" text node from index.html. If left in place it
  // renders alongside the layer name injected by updateLegend() — the "name twice" bug.
  h4.textContent = '';
  h4.style.cssText += ';display:flex;align-items:center;gap:4px;';

  // Left spacer — matches the arrow width so the centered name sits visually balanced.
  const spacer = document.createElement('span');
  spacer.style.cssText = 'width:24px;flex-shrink:0';
  h4.appendChild(spacer);

  // Layer name — centered. Clicking it minimizes / expands the legend window.
  const nameBtn = document.createElement('span');
  nameBtn.id = 'legend-layer-btn';
  nameBtn.title = 'Click to minimize';
  nameBtn.style.cssText = 'cursor:pointer;flex:1;min-width:0;text-align:center;border-radius:4px;padding:3px 5px;transition:background .12s';
  nameBtn.textContent = 'FIELD GUIDE';
  nameBtn.onmouseenter = () => { nameBtn.style.background = 'rgba(201,168,76,0.10)'; };
  nameBtn.onmouseleave = () => { nameBtn.style.background = ''; };
  h4.appendChild(nameBtn);

  // Arrow to the right of the name. Clicking it opens the layer-change dropdown.
  const arrow = document.createElement('span');
  arrow.id    = 'legend-collapse-arrow';
  arrow.title = 'Change layer';
  arrow.style.cssText = 'font-size:11px;color:var(--gold);opacity:0.9;cursor:pointer;padding:2px 6px;border-radius:3px;background:rgba(201,168,76,0.08);flex-shrink:0;width:24px;text-align:center';
  arrow.textContent = '▾';
  h4.appendChild(arrow);

  // Clicking the layer NAME collapses / expands the legend body.
  nameBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isCollapsed = wrap.classList.toggle('collapsed');
    nameBtn.title = isCollapsed ? 'Click to expand' : 'Click to minimize';
  });

  // Dropdown picker — shows all geographic layers
  const picker = document.createElement('div');
  picker.id = 'legend-layer-picker';
  document.body.appendChild(picker);

  const allEntries = Object.entries(LAYERS);
  allEntries.forEach(([key, layer]) => {
    const item = document.createElement('div');
    item.className = 'llp-item';
    item.dataset.key = key;
    item.innerHTML = `<span style="font-size:13px">${layer.emoji}</span><span>${layer.name}</span>`;
    item.addEventListener('click', e => {
      e.stopPropagation();
      allEntries.forEach(([k]) => activeLayers.delete(k));
      activeLayers.add(key);
      document.querySelectorAll('.lb[data-key]').forEach(b => b.classList.toggle('on', activeLayers.has(b.dataset.key)));
      picker.classList.remove('open');
      refresh(); updateURLState(); saveState();
    });
    picker.appendChild(item);
  });

  // Clicking the ARROW opens / closes the layer-change dropdown.
  arrow.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = picker.classList.contains('open');
    picker.classList.toggle('open', !isOpen);
    if (!isOpen) {
      picker.querySelectorAll('.llp-item').forEach(item => {
        item.classList.toggle('active', activeLayers.has(item.dataset.key));
      });
      const r = arrow.getBoundingClientRect();
      picker.style.top  = (r.bottom + 6) + 'px';
      // Right-align the dropdown beneath the arrow, clamped to the viewport edge.
      picker.style.left = Math.max(8, r.right - 175) + 'px';
    }
  });

  document.addEventListener('click', e => {
    if (!picker.contains(e.target) && !arrow.contains(e.target)) {
      picker.classList.remove('open');
    }
  });

  // Sync the title to any layer restored from localStorage/URL at boot, since the
  // earlier updateLegend() ran before this header existed.
  updateLegend();
}

// ─── Share URL button ─────────────────────────────────────────────────────────
function initShareButton() {
  const btn = document.getElementById('share-url-btn');
  if (!btn) return;
  btn.setAttribute('aria-label', 'Copy shareable link');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const url = window.location.origin + window.location.pathname + window.location.search;
    navigator.clipboard.writeText(url).then(() => {
      const orig = btn.textContent;
      btn.textContent = '✓';
      btn.classList.add('copied');
      btn.title = 'Link copied!';
      btn.setAttribute('aria-label', 'Link copied!');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('copied');
        btn.title = 'Copy shareable link';
        btn.setAttribute('aria-label', 'Copy shareable link');
      }, 2000);
    }).catch(() => {
      // Fallback for browsers without clipboard API
      const ta = document.createElement('textarea');
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      btn.textContent = '✓'; btn.classList.add('copied');
      btn.setAttribute('aria-label', 'Link copied!');
      setTimeout(() => {
        btn.textContent = '🔗'; btn.classList.remove('copied');
        btn.setAttribute('aria-label', 'Copy shareable link');
      }, 2000);
    });
  });
}

// ─── Best This Month toggle ───────────────────────────────────────────────────
function initBestPanelToggle() {
  const toggle = document.getElementById('best-toggle');
  const list   = document.getElementById('best-panel-list');
  if (!toggle || !list) return;
  toggle.addEventListener('click', () => {
    const isOpen = list.classList.contains('open');
    list.classList.toggle('open', !isOpen);
    toggle.classList.toggle('open', !isOpen);
  });
}
// Expand Best This Month by default on first data load
let _bestPanelDefaultExpanded = false;
function autoExpandBestPanel() {
  if (_bestPanelDefaultExpanded) return;
  const toggle = document.getElementById('best-toggle');
  const list   = document.getElementById('best-panel-list');
  if (!toggle || !list || toggle.style.display === 'none') return;
  list.classList.add('open');
  toggle.classList.add('open');
  _bestPanelDefaultExpanded = true;
}

function updateBestPanel() {
  const toggle = document.getElementById('best-toggle');
  const ol     = document.getElementById('best-panel-list');
  if (!toggle || !ol) return;

  // Show the toggle only when a geographic layer is active
  const hasGeo = [...activeLayers].some(lk => GEOGRAPHIC_LAYERS.has(lk));
  toggle.style.display = (hasGeo && activeLayers.size > 0) ? 'flex' : 'none';

  if (!hasGeo || activeLayers.size === 0) {
    ol.innerHTML = '';
    ol.classList.remove('open');
    toggle.classList.remove('open');
    return;
  }

  // Rank the 28 countries we have complete data for
  const ranked = Object.keys(COUNTRY_NAMES)
    .map(iso2 => ({ iso2, r: getCountryRating(iso2) }))
    .filter(x => x.r !== null)
    .sort((a, b) => a.r - b.r)
    .slice(0, 7);

  // Update count badge in the toggle label
  const lbl = document.getElementById('best-toggle-label');
  if (lbl) lbl.textContent = `Best This Month (${ranked.length})`;

  ol.innerHTML = '';
  ranked.forEach(({ iso2, r }) => {
    const li = document.createElement('li');
    const swatch = document.createElement('span');
    swatch.className = 'best-swatch';
    swatch.style.background = RC[Math.min(3, Math.max(0, r))];
    const name = document.createTextNode(
      (typeof COUNTRY_NAMES !== 'undefined' && COUNTRY_NAMES[iso2]) || iso2
    );
    li.appendChild(swatch);
    li.appendChild(name);
    li.addEventListener('mouseenter', () => highlightCountry(iso2));
    li.addEventListener('mouseleave', () => unhighlightCountry(iso2));
    li.addEventListener('click', () => {
      const c = typeof COUNTRY_CENTERS !== 'undefined' ? COUNTRY_CENTERS[iso2] : null;
      if (c && map) map.flyTo(c, 5, { duration: 1.2 });
    });
    ol.appendChild(li);
  });

  // Expand automatically on first load so users discover the feature
  autoExpandBestPanel();
}

// ─── Onboarding Hint ─────────────────────────────────────────────────────────
// Displayed once on first visit for 4 seconds, then never again.
function showOnboardingHint() {
  try { if (localStorage.getItem('na_hint_seen')) return; } catch (_) {}
  const el = document.createElement('div');
  el.id = 'onboarding-hint';
  el.innerHTML = `
    <p>Click any country &nbsp;&middot;&nbsp; Switch months &nbsp;&middot;&nbsp; Select a passport for visa data</p>
    <p class="hint-sub">Zoom to level&nbsp;5+ for province&nbsp;detail &nbsp;&middot;&nbsp; Level&nbsp;6+ for county&nbsp;detail</p>`;
  document.body.appendChild(el);
  // Remove element after animation completes (4 s) and mark as seen
  setTimeout(() => {
    if (el.parentNode) el.remove();
    try { localStorage.setItem('na_hint_seen', '1'); } catch (_) {}
  }, 4200);
}

// ─── Comparison Panel ─────────────────────────────────────────────────────────
// Up to 10 countries can be pinned; panel slides in from the right.

const MAX_PINNED = 10;

function togglePinCountry(iso2) {
  const idx = pinnedCountries.indexOf(iso2);
  if (idx === -1) {
    if (pinnedCountries.length >= MAX_PINNED) pinnedCountries.shift();
    pinnedCountries.push(iso2);
  } else {
    pinnedCountries.splice(idx, 1);
  }
  renderComparePanel();
  // Refresh the currently visible tooltip pin button state if it matches
  const ttName = document.getElementById('tt-name');
  if (ttName) {
    const btn = document.querySelector('.tt-pin-btn');
    if (btn && btn.dataset.iso2 === iso2) {
      const pinned = pinnedCountries.includes(iso2);
      btn.classList.toggle('pinned', pinned);
      btn.textContent = pinned ? '♡ Pinned' : '♡ Compare';
    }
  }
}

function _shareCompareURL() {
  updateURLState();
  var url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function() {
      var btn = document.querySelector('[onclick="_shareCompareURL()"]');
      if (btn) { btn.textContent = '✓ Copied!'; setTimeout(function(){ btn.textContent = '⎘ Copy Comparison URL'; }, 1800); }
    });
  }
}

function renderComparePanel() {
  var panel = document.getElementById('compare-panel');
  if (!panel) return;
  if (!pinnedCountries || pinnedCountries.length < 2) {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }
  panel.style.display = 'block';
  var countries = pinnedCountries.slice(0, 4);
  var RCOL = ['#43A047','#FDD835','#EF6C00','#C62828'];

  function ratingChip(iso2, layerKey, labels) {
    var prev = new Set(activeLayers);
    activeLayers.clear();
    activeLayers.add(layerKey);
    var r = getCountryRating(iso2);
    activeLayers.clear();
    prev.forEach(function(k){ activeLayers.add(k); });
    if (r === null || r === undefined) return '<span style="color:rgba(255,255,255,0.2);font-size:8px">—</span>';
    var idx = Math.min(3, Math.max(0, r));
    var lbl = (labels && labels[idx]) ? labels[idx] : String(r);
    return '<span style="background:' + RCOL[idx] + ';color:#fff;font-size:7px;padding:1px 5px;border-radius:3px;font-weight:700">' + _esc(lbl) + '</span>';
  }

  function tempCell(iso2) {
    if (typeof CD_CLIMATE === 'undefined' || !CD_CLIMATE[iso2]) return '—';
    var t = CD_CLIMATE[iso2].temp[activeMonth];
    return t != null ? t + '°C' : '—';
  }

  function budgetCell(iso2) {
    if (typeof COST_DETAILS === 'undefined' || !COST_DETAILS[iso2]) return '—';
    var d = COST_DETAILS[iso2];
    return _money((d.hostel||0) + (d.meal||0)*3 + (d.transport||0)) + '/day';
  }

  var ROWS = [
    { key:'weather',  label:'Weather',     labels: typeof LAYER_LABELS!=='undefined'?LAYER_LABELS.weather:null },
    { key:'safety',   label:'Safety',      labels: typeof LAYER_LABELS!=='undefined'?LAYER_LABELS.safety:null },
    { key:'cost',     label:'Cost',        labels: typeof LAYER_LABELS!=='undefined'?LAYER_LABELS.cost:null },
    { key:'internet', label:'Internet',    labels: typeof LAYER_LABELS!=='undefined'?LAYER_LABELS.internet:null },
    { key:'lgbtq',    label:'LGBTQ+',      labels: null },
    { key:'nomad',    label:'Nomad Score', labels: ['Excellent','Good','Fair','Poor'] },
    { key:'cannabis', label:'Cannabis',    labels: typeof LAYER_LABELS!=='undefined'?LAYER_LABELS.cannabis:null },
    { key:'kids',     label:'Kid Friendly',  labels: typeof LAYER_LABELS!=='undefined'?LAYER_LABELS.kids:null },
    { key:'healthcare',label:'Healthcare',    labels: typeof LAYER_LABELS!=='undefined'?LAYER_LABELS.healthcare:null },
    { key:'english',  label:'English',        labels: typeof LAYER_LABELS!=='undefined'?LAYER_LABELS.english:null },
    { key:'scam',     label:'Scam Risk',      labels: typeof LAYER_LABELS!=='undefined'?LAYER_LABELS.scam:null },
  ];

  var heads = '<th style="padding:5px 8px;font-size:7px;color:var(--dim);text-align:left;border-bottom:1px solid rgba(201,168,76,0.15)">Metric</th>' +
    countries.map(function(iso2){
      var flag = typeof getFlag==='function'?getFlag(iso2):'';
      var name = (typeof countryNames!=='undefined'&&countryNames[iso2])||iso2;
      return '<th style="padding:5px 8px;font-size:8px;font-weight:700;color:var(--sand);text-align:center;border-bottom:1px solid rgba(201,168,76,0.15)">' + (flag||'') + ' ' + _esc(name.length>12?iso2:name) + '<br><button onclick="togglePinCountry(\'' + iso2 + '\')" style="font-size:7px;color:var(--dim);background:none;border:none;cursor:pointer;margin-top:2px">✕ remove</button></th>';
    }).join('');

  var dataRows = ROWS.map(function(row){
    var cells = countries.map(function(iso2){
      return '<td style="padding:4px 8px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.04)">' + ratingChip(iso2, row.key, row.labels) + '</td>';
    }).join('');
    return '<tr><td style="padding:4px 8px;font-size:7.5px;color:var(--dim);border-bottom:1px solid rgba(255,255,255,0.04)">' + row.label + '</td>' + cells + '</tr>';
  }).join('');

  var climateRow = '<tr><td style="padding:4px 8px;font-size:7.5px;color:var(--dim)">Temp (' + ((typeof MONTHS_F!=='undefined'&&MONTHS_F[activeMonth])||'') + ')</td>' +
    countries.map(function(iso2){ return '<td style="padding:4px 8px;text-align:center;font-size:9px;color:var(--sand)">' + tempCell(iso2) + '</td>'; }).join('') + '</tr>';

  var budgetRow = '<tr><td style="padding:4px 8px;font-size:7.5px;color:var(--dim)">Daily Budget</td>' +
    countries.map(function(iso2){ return '<td style="padding:4px 8px;text-align:center;font-size:9px;color:#4ade80">' + budgetCell(iso2) + '</td>'; }).join('') + '</tr>';

  panel.innerHTML = '<div style="padding:6px 10px 4px;font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;border-bottom:1px solid rgba(201,168,76,0.12)">⚖ COUNTRY COMPARISON</div>' +
    '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr>' + heads + '</tr></thead><tbody>' + dataRows + climateRow + budgetRow + '</tbody></table></div>' +
    '<div style="padding:6px 10px 8px;font-size:7.5px;color:var(--dim);border-top:1px solid rgba(201,168,76,0.08);margin-top:4px">💡 Pin countries on the map to compare them. Click a country name to fly there.</div>' +
    '<div style="padding:4px 10px 8px;text-align:right"><button onclick="_shareCompareURL()" style="font-size:7px;background:rgba(201,168,76,0.10);border:1px solid rgba(201,168,76,0.25);border-radius:4px;color:var(--gold);cursor:pointer;padding:3px 8px;font-family:var(--fm)">⎘ Copy Comparison URL</button></div>';
}

function closeComparePanel() {
  const panel = document.getElementById('compare-panel');
  if (panel) panel.classList.remove('open');
}

// ─── Loading overlay helpers ──────────────────────────────────────────────────
function dismissOverlay() {
  clearTimeout(window._loTimer);   // cancel safety timer from index.html
  const lo = document.getElementById('loading-overlay');
  if (lo) { lo.classList.add('fade-out'); setTimeout(() => { if (lo.parentNode) lo.remove(); }, 520); }
}

// ─── POI Layer Init ───────────────────────────────────────────────────────────
// Registers map moveend handlers for live Overpass POI layers.
// Must be called after initMap() creates the Leaflet map instance.
function initPOILayers() {
  // Beach markers: re-query on pan when zoom ≥ 7; revert to static at zoom < 7.
  map.on('moveend', () => {
    clearTimeout(_beachDebounce);
    _beachDebounce = setTimeout(() => {
      if (!activeLayers.has('beaches')) return;
      if (map.getZoom() >= 7) _fetchAndRenderBeaches();
      else renderBeachMarkers();   // reverts to curated static icons
    }, 300);
  });

  // Generic POI layers: re-query on pan when active and zoom ≥ minZoom.
  // Camping is also re-queried when linked (trails or parks POI active).
  // Holidays use static data (COUNTRY_HOLIDAYS + COUNTRY_CENTERS) — never Overpass.
  // Guarding holidays here prevents the national-park Overpass query from running
  // under the holidays key, which would corrupt the holidays bboxCache with park data.
  Object.keys(POI_LAYERS).forEach(key => {
    const def = POI_LAYERS[key];
    map.on('moveend', () => {
      clearTimeout(def.debounce);
      def.debounce = setTimeout(() => {
        const linked = key === 'camping' && (TRANSPORT_LAYERS.trails.active || POI_LAYERS.parks.active);
        if (!def.active && !linked) return;
        if (key === 'holidays') { _renderHolidayMarkers(); return; }   // static — no Overpass
        if (map.getZoom() >= def.minZoom) _fetchAndRenderPOI(key, linked);
        else _clearPOIMarkers(key);
      }, 300);
    });
  });

  // Rail stop dots: re-query on pan when rail layer is active at zoom ≥ 7.
  map.on('moveend', () => {
    clearTimeout(_railStopDebounce);
    _railStopDebounce = setTimeout(() => {
      if (!TRANSPORT_LAYERS.rail.active) return;
      if (map.getZoom() >= 7) _fetchAndRenderRailStops();
      else _clearRailStops();
    }, 300);
  });

  // Park border vectors: re-query on pan when natparks layer is active.
  map.on('moveend', () => {
    clearTimeout(_parkBorderDebounce);
    _parkBorderDebounce = setTimeout(() => {
      if (!TRANSPORT_LAYERS.natparks.active) return;
      if (map.getZoom() >= 5) _fetchAndRenderParkBorders();
      else _clearParkBorders();
    }, 350);
  });

  // Border crossings: re-query via Overpass on pan when zoom ≥ 7 and borders active.
  map.on('moveend', () => {
    if (!showBorders) return;
    if (map.getZoom() >= 7) _fetchAndRenderBorders();
  });

  // Road vectors: re-query on pan when roads layer is active.
  map.on('moveend', () => {
    if (TRANSPORT_LAYERS.roads.active) _fetchAndRenderRoads();
  });

  // NYC precinct crime sublayer: re-evaluate on pan.
  map.on('moveend', () => { _renderNYCCrime(); });
}

// ─── NYC NYPD Precinct Crime Sublayer ────────────────────────────────────────
// Renders color-coded precinct markers when Safety layer is active, zoom >= 10,
// and map center is within NYC bounds. Uses static 2023 NYPD crime index data.
var _nycCrimeMarkers = [];
var _nycCrimeActive = false;

function _renderNYCCrime() {
  if (typeof NYPD_PRECINCTS === 'undefined') return;
  var z = map.getZoom();
  var c = map.getCenter();
  var inNYC = c.lat > 40.4 && c.lat < 41.0 && c.lng > -74.3 && c.lng < -73.7;
  var safetyActive = activeLayers.has('safety');
  if (!safetyActive || !inNYC || z < 10) { _clearNYCCrime(); return; }
  if (_nycCrimeActive) return;
  _nycCrimeActive = true;
  var RC = ['#43A047','#FDD835','#EF6C00','#C62828'];
  _clearNYCCrime();
  (typeof NYPD_PRECINCTS !== 'undefined' ? NYPD_PRECINCTS : []).forEach(function(pr) {
    var col = RC[Math.min(3, Math.max(0, pr.ci))];
    var m = L.circleMarker([pr.lat, pr.lng], {
      radius: 10, color: '#fff', weight: 1, fillColor: col, fillOpacity: 0.75,
      pane: 'markersPane'
    });
    m.bindTooltip('<b>Precinct ' + pr.p + '</b> — ' + _esc(pr.b) + '<br><span style="color:' + col + '">' +
      ['Low Crime','Moderate Crime','High Crime','Very High Crime'][pr.ci] + '</span><br><small>NYPD crime index · static 2023 data</small>',
      {className: 'tt-sm'});
    m.addTo(map);
    _nycCrimeMarkers.push(m);
  });
}

function _clearNYCCrime() {
  _nycCrimeMarkers.forEach(function(m){map.removeLayer(m);});
  _nycCrimeMarkers = [];
  _nycCrimeActive = false;
}

// ─── Topbar hamburger toggle ──────────────────────────────────────────────────
// On narrow screens (< 540 px) the hamburger button collapses or expands the
// month selector, search box, and layer buttons so the map fills the screen.
function initTopbarToggle() {
  const btn    = document.getElementById('topbar-hamburger');
  const topbar = document.getElementById('topbar');
  if (!btn || !topbar) return;

  // On narrow screens start collapsed (CSS sets months/row2 to display:none).
  // On wider screens the button is invisible and state doesn't matter.
  let expanded = false;

  btn.addEventListener('click', () => {
    expanded = !expanded;
    topbar.classList.toggle('tb-expanded', expanded);
    btn.setAttribute('aria-expanded', String(expanded));
    btn.innerHTML = expanded ? '&#x2715;' : '&#9776;';
    // Leaflet needs a size hint after topbar height changes.
    if (map) setTimeout(() => map.invalidateSize(), 50);
  });

  // Collapse on map click so the keyboard / tap user isn't blocked by the topbar.
  document.addEventListener('click', e => {
    if (!expanded) return;
    if (topbar.contains(e.target)) return;
    expanded = false;
    topbar.classList.remove('tb-expanded');
    btn.innerHTML = '&#9776;';
    if (map) setTimeout(() => map.invalidateSize(), 50);
  });
}

// ─── Boot diagnostic overlay ──────────────────────────────────────────────────
// Shows a visible error panel in the centre of the screen whenever the boot
// crashes.  Dismisses itself after 12 s so it never permanently blocks the UI.
function showBootError(msg) {
  dismissOverlay();
  const d = document.createElement('div');
  d.id = 'boot-error';
  d.style.cssText = [
    'position:fixed','top:50%','left:50%','transform:translate(-50%,-50%)',
    'z-index:9990','background:#1a0505','border:2px solid #c62828',
    'border-radius:10px','padding:24px 28px','max-width:420px','width:90vw',
    "font-family:'IBM Plex Mono',monospace",'color:#e8d5a3','text-align:center',
    'box-shadow:0 16px 48px rgba(0,0,0,.9)',
  ].join(';');
  d.innerHTML = `
    <div style="font-size:13px;font-weight:700;color:#ef4444;margin-bottom:10px">⚠ Startup Error</div>
    <div style="font-size:10px;line-height:1.6;color:#c8a0a0;word-break:break-word">${msg}</div>
    <div style="font-size:9px;color:#7a6060;margin-top:12px">Press <strong>Ctrl+Shift+R</strong> (Win/Linux) or <strong>Cmd+Shift+R</strong> (Mac) for a hard refresh</div>`;
  document.body.appendChild(d);
  setTimeout(() => { if (d.parentNode) d.remove(); }, 12000);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
(async () => {
  try {

  // Verify Leaflet loaded — most common silent failure point
  if (typeof L === 'undefined') throw new Error('Leaflet did not load. Check network / ad-blocker.');

  loadState();        // restore month, layers, nationality from localStorage
  _loadTripPins();    // initialise _tripPins before initURLState may append URL pins
  _loadWishlist();    // restore wishlist (bucket list) from localStorage
  initURLState();     // URL hash overrides month + layer if present
  initMap();
  if (_pendingView) {
    // Defer to a macrotask so the restore lands AFTER Leaflet applies its constructor
    // center/zoom on first layout (a synchronous setView here is clobbered by it).
    const _pv = _pendingView; _pendingView = null;
    setTimeout(function() {
      if (map) { map.invalidateSize(); map.setView(_pv.center, _pv.zoom, { animate: false }); }
    }, 0);
  }
  buildMonthSelector();
  buildLayerButtons();
  syncCatButtons();       // highlight category buttons for any layers restored from localStorage
  buildTransportButtons();
  buildUnitButtons();     // distance / currency / language toggle buttons
  updateLegend();
  updateBadge();

  // Dismiss overlay as soon as the map container + controls are ready.
  // Tile basemap appears immediately; choropleth loads in the background below.
  dismissOverlay();

  await initChoropleth();
  // If the timezone choropleth was toggled before _geoData arrived, rebuild it now.
  if (_tzActive) toggleTimezoneLayer(true);
  initPoliticalLayers();
  initClimateZones();
  refresh();
  map.on('zoom', onZoom);
  initTransportClickHandlers();
  initPOILayers();
  initAdmin1Choropleth();
  initSearch();
  initNationalitySelector();
  initVisaPassportGroup();
  initLegendCollapsible();
  initShareButton();
  initBestPanelToggle();
  updateBestPanel();
  showOnboardingHint();
  renderComparePanel();
  updateZoomAnnotation();
  initTopbarToggle();
  initTripPlanner();

  } catch (err) {
    console.error('[Nomadic Almanac] Boot error:', err);
    showBootError(err.message || String(err));
  }
})();

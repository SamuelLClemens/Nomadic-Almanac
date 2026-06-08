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
let _tempUnit         = localStorage.getItem('na_temp') || 'C';   // 'C' or 'F' — persisted
var _distUnit         = localStorage.getItem('na_dist') || 'km';  // 'km' or 'mi' — persisted
var _elevUnit         = localStorage.getItem('na_elev') || 'm';   // 'm' or 'ft' — persisted
// Mirror unit prefs onto window so functions that read window._tempUnit (e.g. the
// climate wheel) stay in sync with the lexically-scoped globals.
if (typeof window !== 'undefined') { window._tempUnit = _tempUnit; window._distUnit = _distUnit; window._elevUnit = _elevUnit; }
var _mapStyle         = localStorage.getItem('na_mapstyle') || 'satellite'; // basemap style
var _dateFormat       = localStorage.getItem('na_datefmt') || 'DMY'; // 'DMY' or 'MDY'
var _clockFormat      = localStorage.getItem('na_clockfmt') || '24h'; // '24h' or '12h'
var _basemapLayer     = null;  // reference to the current basemap tile layer
var _basemapUserPinned = false; // true once the traveller explicitly picks a basemap; then the Day/Night theme stops auto-swapping satellite <-> night-lights
var _naBootstrapping  = true;  // true during initial boot — the theme must NOT auto-swap the satellite basemap on first load (the site opens on satellite + the day/light default). Cleared once boot completes; later theme toggles then sync normally.
var _labelLayer       = null;  // reference to the place-labels overlay tile layer
var _labelsOn         = (localStorage.getItem('na_labels') !== '0'); // place labels visible?
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

// City-derived sub-national climate (and other per-city layer) values, computed by
// point-in-polygon assignment of CITIES to admin features. A county/province with no
// explicit CD_A2/CD_A1 entry for a layer falls back to these BEFORE the coarser
// state/country value, so an area's colour reflects the real climate of the cities
// inside it rather than the blanket national figure.
const _DERIVABLE_FIELDS = ['weather','family','solo','remote','corrupt','health','crowds','disaster','lgbtq','beaches','road','vaccines'];
let _admin1CityData = {};   // admin-1 subCode -> { field:[12] }
let _admin2CityData = {};   // admin-2 shapeID -> { field:[12] }

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
    label: '🎉 Events & Holidays',
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

const GEOGRAPHIC_LAYERS = new Set(['weather','beaches','health','disaster','crowds','cost','safety','internet','visa','strength','kids','cannabis','nomad','english','healthcare','tapwater','airquality','femalesafety','nightlife','scam','malaria','tipping','parks']);
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

// ── City-derived sub-national climate helpers ───────────────────────────────
// Ray-casting point-in-polygon so an admin feature can borrow the real climate
// (and other per-city layer values) of the cities that fall inside it.
function _pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / ((yj - yi) || 1e-12) + xi)) inside = !inside;
  }
  return inside;
}
function _pointInGeometry(lng, lat, geom) {
  if (!geom) return false;
  if (geom.type === 'Polygon') return _pointInRing(lng, lat, geom.coordinates[0]);
  if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) if (_pointInRing(lng, lat, poly[0])) return true;
  }
  return false;
}
function _geomBBox(geom) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const scan = ring => { for (const pt of ring) {
    if (pt[0] < minX) minX = pt[0]; if (pt[0] > maxX) maxX = pt[0];
    if (pt[1] < minY) minY = pt[1]; if (pt[1] > maxY) maxY = pt[1];
  } };
  if (!geom) return null;
  if (geom.type === 'Polygon') geom.coordinates.forEach(scan);
  else if (geom.type === 'MultiPolygon') geom.coordinates.forEach(p => p.forEach(scan));
  return [minX, minY, maxX, maxY];
}
// Assign each city to the admin feature that contains it and average the per-city
// monthly layer arrays into store[code]. A bounding-box pre-reject keeps this fast
// even for thousands of counties. Runs once per admin layer load.
function _deriveCityClimate(features, getCode, isoOf, cities, store) {
  if (!features || !cities || !cities.length) return;
  const byIso = {};
  features.forEach(f => {
    const iso = isoOf(f); if (!iso) return;
    if (!f._naBBox) f._naBBox = _geomBBox(f.geometry);
    (byIso[iso] = byIso[iso] || []).push(f);
  });
  const acc = {};
  cities.forEach(c => {
    if (!c || !c.data) return;
    const feats = byIso[c.country]; if (!feats) return;
    let code = null;
    for (let i = 0; i < feats.length; i++) {
      const b = feats[i]._naBBox;
      if (b && (c.lng < b[0] || c.lng > b[2] || c.lat < b[1] || c.lat > b[3])) continue;
      if (_pointInGeometry(c.lng, c.lat, feats[i].geometry)) { code = getCode(feats[i]); break; }
    }
    if (!code) return;
    let a = acc[code]; if (!a) a = acc[code] = { n: 0 };
    a.n++;
    _DERIVABLE_FIELDS.forEach(fl => {
      const arr = c.data[fl]; if (!arr || arr.length < 12) return;
      if (!a[fl]) a[fl] = [0,0,0,0,0,0,0,0,0,0,0,0];
      for (let m = 0; m < 12; m++) a[fl][m] += (arr[m] || 0);
    });
  });
  Object.keys(acc).forEach(code => {
    const a = acc[code], out = {};
    _DERIVABLE_FIELDS.forEach(fl => { if (a[fl]) out[fl] = a[fl].map(s => Math.round(s / a.n)); });
    if (Object.keys(out).length) store[code] = out;
  });
}

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
  if (btn) { btn.textContent = _wishlist.has(iso2) ? '♥' : '♡'; btn.classList.toggle('on', _wishlist.has(iso2)); btn.setAttribute('aria-pressed', _wishlist.has(iso2) ? 'true' : 'false'); }
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
// Static FX snapshot — units of each currency per 1 USD. Self-hosted (no live
// API / external runtime dependency). Refresh at deploy time and bump the date.
var _RATES_AS_OF = 'June 2026';
var _RATES = {
  USD:{rate:1,     sym:'$',   name:'US Dollar'},
  EUR:{rate:0.92,  sym:'€',   name:'Euro'},
  GBP:{rate:0.79,  sym:'£',   name:'Pound Sterling'},
  JPY:{rate:149,   sym:'¥',   name:'Japanese Yen'},
  CNY:{rate:7.2,   sym:'¥',   name:'Chinese Yuan'},
  INR:{rate:83,    sym:'₹',   name:'Indian Rupee'},
  AUD:{rate:1.54,  sym:'A$',  name:'Australian Dollar'},
  CAD:{rate:1.37,  sym:'C$',  name:'Canadian Dollar'},
  CHF:{rate:0.90,  sym:'CHF', name:'Swiss Franc'},
  SGD:{rate:1.35,  sym:'S$',  name:'Singapore Dollar'},
  HKD:{rate:7.8,   sym:'HK$', name:'Hong Kong Dollar'},
  NZD:{rate:1.65,  sym:'NZ$', name:'New Zealand Dollar'},
  THB:{rate:35,    sym:'฿',   name:'Thai Baht'},
  MXN:{rate:17.5,  sym:'MX$', name:'Mexican Peso'},
  BRL:{rate:5.0,   sym:'R$',  name:'Brazilian Real'},
  ZAR:{rate:18.5,  sym:'R',   name:'South African Rand'},
  RUB:{rate:92,    sym:'₽',   name:'Russian Ruble'},
  KRW:{rate:1330,  sym:'₩',   name:'South Korean Won'},
  AED:{rate:3.67,  sym:'AED', name:'UAE Dirham'},
  SAR:{rate:3.75,  sym:'SAR', name:'Saudi Riyal'},
  TRY:{rate:32,    sym:'₺',   name:'Turkish Lira'},
  IDR:{rate:15800, sym:'Rp',  name:'Indonesian Rupiah'},
  MYR:{rate:4.7,   sym:'RM',  name:'Malaysian Ringgit'},
  PHP:{rate:57,    sym:'₱',   name:'Philippine Peso'},
  VND:{rate:24500, sym:'₫',   name:'Vietnamese Dong'},
  SEK:{rate:10.6,  sym:'kr',  name:'Swedish Krona'},
  NOK:{rate:10.7,  sym:'kr',  name:'Norwegian Krone'},
  DKK:{rate:6.9,   sym:'kr',  name:'Danish Krone'},
  PLN:{rate:4.0,   sym:'zł',  name:'Polish Zloty'},
  CZK:{rate:23,    sym:'Kč',  name:'Czech Koruna'},
  HUF:{rate:360,   sym:'Ft',  name:'Hungarian Forint'},
  ILS:{rate:3.7,   sym:'₪',   name:'Israeli Shekel'},
  EGP:{rate:48,    sym:'E£',  name:'Egyptian Pound'},
  NGN:{rate:1500,  sym:'₦',   name:'Nigerian Naira'},
  KES:{rate:130,   sym:'KSh', name:'Kenyan Shilling'},
  MAD:{rate:10,    sym:'DH',  name:'Moroccan Dirham'},
  ARS:{rate:900,   sym:'AR$', name:'Argentine Peso'},
  CLP:{rate:950,   sym:'CLP$',name:'Chilean Peso'},
  COP:{rate:4000,  sym:'CO$', name:'Colombian Peso'},
  PEN:{rate:3.7,   sym:'S/',  name:'Peruvian Sol'},
  TWD:{rate:32,    sym:'NT$', name:'Taiwan Dollar'},
};
// Short popular list for the legacy cycle button; the full picker uses _RATES.
var _CURR_KEYS = ['USD','EUR','GBP','JPY','CNY','AUD','CAD','CHF','INR','BRL','MXN','SGD'];

// Map of locale region (ISO country) → default currency for first-visit detection.
var _REGION_CURR = {
  US:'USD', GB:'GBP', IE:'EUR', FR:'EUR', DE:'EUR', ES:'EUR', IT:'EUR', PT:'EUR', NL:'EUR', BE:'EUR', AT:'EUR', GR:'EUR', FI:'EUR',
  JP:'JPY', CN:'CNY', IN:'INR', AU:'AUD', CA:'CAD', CH:'CHF', SG:'SGD', HK:'HKD', NZ:'NZD', TH:'THB', MX:'MXN', BR:'BRL',
  ZA:'ZAR', RU:'RUB', KR:'KRW', AE:'AED', SA:'SAR', TR:'TRY', ID:'IDR', MY:'MYR', PH:'PHP', VN:'VND', SE:'SEK', NO:'NOK',
  DK:'DKK', PL:'PLN', CZ:'CZK', HU:'HUF', IL:'ILS', EG:'EGP', NG:'NGN', KE:'KES', MA:'MAD', AR:'ARS', CL:'CLP', CO:'COP', PE:'PEN', TW:'TWD',
};

function na_detectDefaultCurrency() {
  try {
    var loc = navigator.language || 'en-US';
    var region = (String(loc).split('-')[1] || '').toUpperCase();
    if (region && _REGION_CURR[region]) return _REGION_CURR[region];
  } catch (_e) {}
  return 'USD';
}
// First visit (no stored choice): default to the locale's currency.
try { if (!localStorage.getItem('na_curr')) _currCode = na_detectDefaultCurrency(); } catch (_e) {}
if (!_RATES[_currCode]) _currCode = 'USD';

function na_setCurrency(code) {
  if (!_RATES[code]) code = 'USD';
  _currCode = code;
  try { localStorage.setItem('na_curr', code); } catch (_e) {}
  var btn = document.getElementById('btn-currency'); if (btn) btn.textContent = code;
  document.querySelectorAll('.na-curr-opt').forEach(function (b) { b.classList.toggle('active', b.dataset.curr === code); });
  document.querySelectorAll('.na-curr-current').forEach(function (el) { el.textContent = code; });
  if (typeof _rerenderActiveDossier === 'function') { try { _rerenderActiveDossier(); } catch (_e) {} }
}

function na_buildCurrencyPicker() {
  var html = '<div class="na-curr-picker" role="group" aria-label="Choose currency">';
  Object.keys(_RATES).forEach(function (c) {
    var r = _RATES[c];
    html += '<button type="button" class="na-curr-opt' + (c === _currCode ? ' active' : '') + '" data-curr="' + c + '" title="' + r.name + '">' +
            '<span class="na-curr-code">' + c + '</span><span class="na-curr-sym">' + r.sym + '</span></button>';
  });
  return html + '</div>';
}

function na_wireCurrencyPicker(root) {
  (root || document).querySelectorAll('.na-curr-opt').forEach(function (b) {
    if (b._naCurrWired) return; b._naCurrWired = true;
    b.addEventListener('click', function (e) { e.stopPropagation(); na_setCurrency(b.dataset.curr); });
  });
}

function _money(usdAmount) {
  if (usdAmount == null || isNaN(usdAmount)) return '';
  var c = _RATES[_currCode] || _RATES.USD;
  var v = Math.round(usdAmount * c.rate);
  return c.sym + v.toLocaleString();
}

// Compact money for tight UI (e.g. budget tier cards). Large-denomination
// currencies (IDR, VND, KRW…) are abbreviated so they fit a narrow column.
function _moneyCompact(usdAmount) {
  if (usdAmount == null || isNaN(usdAmount)) return '';
  var c = _RATES[_currCode] || _RATES.USD;
  var v = Math.round(usdAmount * c.rate);
  var s;
  if (v >= 1000000) s = (v / 1000000).toFixed(v >= 10000000 ? 0 : 1).replace(/\.0$/, '') + 'M';
  else if (v >= 10000) s = Math.round(v / 1000) + 'k';
  else s = v.toLocaleString();
  return c.sym + s;
}

function _cycleCurrency() {
  var idx = _CURR_KEYS.indexOf(_currCode);
  if (idx < 0) idx = 0;
  na_setCurrency(_CURR_KEYS[(idx + 1) % _CURR_KEYS.length]);
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

// ─── i18n engine (10 curated languages) ──────────────────────────────────────
// The legacy _STRINGS block above is retained but superseded by _I18N below.
// _t(), _cycleLang() and _lang are (re)defined here; function-declaration
// hoisting makes these definitions authoritative throughout the file.
var _LANG_META = {
  en: { flag: '🇬🇧', name: 'English',    dir: 'ltr' },
  es: { flag: '🇪🇸', name: 'Español',    dir: 'ltr' },
  fr: { flag: '🇫🇷', name: 'Français',   dir: 'ltr' },
  de: { flag: '🇩🇪', name: 'Deutsch',    dir: 'ltr' },
  pt: { flag: '🇧🇷', name: 'Português',  dir: 'ltr' },
  ar: { flag: '🇸🇦', name: 'العربية',    dir: 'rtl' },
  zh: { flag: '🇨🇳', name: '中文',        dir: 'ltr' },
  hi: { flag: '🇮🇳', name: 'हिन्दी',      dir: 'ltr' },
  ja: { flag: '🇯🇵', name: '日本語',      dir: 'ltr' },
  ru: { flag: '🇷🇺', name: 'Русский',    dir: 'ltr' },
};
_LANG_KEYS = ['en','es','fr','de','pt','ar','zh','hi','ja','ru'];

// Master English dictionary. Other languages are curated patches (filled by the
// translation workflow); any missing key falls back to English.
var _I18N = {
  en: {
    'nav.worldMap':'World Map','nav.bestMonth':'Best This Month','nav.passport':'Passport & Visa',
    'nav.planner':'Trip Planner','nav.compare':'Compare Countries','nav.preferences':'Preferences',
    'nav.explore':'Explore','nav.journey':'Journey','nav.layers':'Layers','nav.settings':'Settings',
    'group.explore':'Explore','group.journey':'Your Journey','group.intelligence':'Intelligence','group.settings':'Settings',
    'hdr.search':'Search','hdr.theme':'Toggle day/night theme','hdr.share':'Share',
    'welcome.title':'Welcome to the Nomadic Almanac','welcome.body':'Your interactive atlas of where to go and when. Tap any country to open its full travel guide — costs, safety, weather, visas, key phrases and more. Slide through the months to watch the seasons change, and switch on layers to compare the world your way.','welcome.sub':'Tip: zoom in for region and province detail, and pick your passport to colour the map by where you can travel visa-free.','welcome.tour':'Take the guided tour','welcome.explore':'Explore on my own','welcome.language':'Language','welcome.tutorial':'How it works','welcome.faq':'FAQ',
    'prefs.title':'Preferences','prefs.mapView':'Map View','prefs.labels':'Place Labels','prefs.units':'Units','prefs.temp':'Temperature','prefs.dist':'Distance','prefs.elev':'Elevation','prefs.dateFormat':'Date Format','prefs.clock':'Clock','prefs.language':'Language','prefs.currency':'Currency','prefs.theme':'Theme','prefs.tour':'Replay guided tour','prefs.tutorial':'Written tutorial','prefs.faq':'FAQ','prefs.on':'On','prefs.off':'Off','prefs.dark':'Dark','prefs.light':'Light',
    'bm.satellite':'Satellite','bm.streets':'Streets','bm.dark':'Dark','bm.terrain':'Terrain','bm.night':'Night Lights',
    'doss.glance':'At a Glance','doss.emergency':'Emergency','doss.cost':'Cost of Living','doss.health':'Health','doss.climate':'Climate','doss.safety':'Safety','doss.tipping':'Tipping','doss.visa':'Visa Access','doss.timezone':'Time Zone','doss.holidays':'Holidays & Events','doss.history':'History','doss.phrasebook':'Phrasebook','doss.intel':'Country Intelligence','doss.language':'Language','doss.capital':'Capital','doss.population':'Population','doss.currency':'Currency','doss.languages':'Languages','doss.power':'Power','doss.calling':'Calling Code','doss.driving':'Driving','doss.region':'Region','doss.tapwater':'Tap Water','doss.etiquette':'Etiquette & Customs','doss.transport':'Getting Around','doss.connectivity':'Connectivity','doss.payments':'Money & Payments',
    'common.close':'Close','common.loading':'Loading…','common.noData':'No data','common.more':'Show more','common.less':'Show less','common.search':'Search countries, cities, or layers',
    'intel.title':'Country Intelligence','intel.origin':'Origin','intel.character':'Character','intel.complexity':'Honest Complexity','intel.bestFor':'Best For','intel.notKnown':'What Locals Know',
    'cost.budget':'Budget','cost.mid':'Mid-range','cost.lux':'Luxury','cost.perDay':'per day','cost.dailyBudget':'Daily Budget',
    'doss.journal':'Journal','doss.goodToKnow':'Good to Know','doss.layers':'Layer Readings','doss.expand':'Expand all','doss.collapse':'Collapse all',
    'act.compare':'Compare','act.wishlist':'Wishlist','act.addPin':'Add to trip',
  },
  es:{}, fr:{}, de:{}, pt:{}, ar:{}, zh:{}, hi:{}, ja:{}, ru:{},
};

function na_detectDefaultLang() {
  try {
    var navs = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < navs.length; i++) {
      var code = String(navs[i] || '').slice(0, 2).toLowerCase();
      if (_LANG_KEYS.indexOf(code) >= 0) return code;
    }
  } catch (_e) {}
  return 'en';
}

// On first visit (no stored choice) default to the browser locale.
try { if (!localStorage.getItem('na_lang')) _lang = na_detectDefaultLang(); } catch (_e) {}
if (_LANG_KEYS.indexOf(_lang) < 0) _lang = 'en';

function _t(key) {
  var s = _I18N[_lang] || _I18N.en;
  return (s && s[key]) || _I18N.en[key] || key;
}

// Translate every static element carrying a data-i18n* attribute.
function na_applyI18n(root) {
  var r = root || document;
  r.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = _t(el.getAttribute('data-i18n')); });
  r.querySelectorAll('[data-i18n-title]').forEach(function (el) { el.setAttribute('title', _t(el.getAttribute('data-i18n-title'))); });
  r.querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', _t(el.getAttribute('data-i18n-aria'))); });
  r.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.setAttribute('placeholder', _t(el.getAttribute('data-i18n-ph'))); });
}

function na_setLang(code) {
  if (!_I18N[code]) code = 'en';
  _lang = code;
  try { localStorage.setItem('na_lang', code); } catch (_e) {}
  var meta = _LANG_META[code] || _LANG_META.en;
  try {
    document.documentElement.setAttribute('lang', code);
    document.documentElement.setAttribute('dir', meta.dir || 'ltr');
  } catch (_e) {}
  na_applyI18n();
  document.querySelectorAll('.na-lang-current-flag').forEach(function (el) { el.textContent = meta.flag; });
  document.querySelectorAll('.na-lang-opt').forEach(function (b) { b.classList.toggle('active', b.dataset.lang === code); });
  if (typeof _rerenderActiveDossier === 'function') { try { _rerenderActiveDossier(); } catch (_e) {} }
}

// Reusable flag picker markup (used on the welcome card and in Preferences).
function na_buildLangPicker() {
  var html = '<div class="na-lang-picker" role="group" aria-label="' + _t('prefs.language') + '">';
  _LANG_KEYS.forEach(function (c) {
    var m = _LANG_META[c];
    html += '<button type="button" class="na-lang-opt' + (c === _lang ? ' active' : '') + '" data-lang="' + c + '" lang="' + c + '" title="' + m.name + '">' +
            '<span class="na-lang-flag" aria-hidden="true">' + m.flag + '</span>' +
            '<span class="na-lang-name">' + m.name + '</span></button>';
  });
  return html + '</div>';
}

function na_wireLangPicker(root) {
  (root || document).querySelectorAll('.na-lang-opt').forEach(function (b) {
    if (b._naLangWired) return; b._naLangWired = true;
    b.addEventListener('click', function (e) { e.stopPropagation(); na_setLang(b.dataset.lang); });
  });
}

function _cycleLang() {
  var idx = _LANG_KEYS.indexOf(_lang);
  na_setLang(_LANG_KEYS[(idx + 1) % _LANG_KEYS.length]);
}

// Floating language control — a single flag button at the bottom-right of the
// window that opens a dropdown of all languages. The shown flag reflects the
// current language and updates automatically via na_setLang().
function na_initLangFab() {
  if (document.getElementById('na-lang-fab')) return;
  var meta = _LANG_META[_lang] || _LANG_META.en;
  var wrap = document.createElement('div');
  wrap.id = 'na-lang-fab';
  wrap.innerHTML =
    '<div id="na-lang-fab-menu" role="menu" hidden></div>' +
    '<button type="button" id="na-lang-fab-btn" aria-haspopup="true" aria-expanded="false" aria-label="Change language" title="Language">' +
      '<span class="na-lang-current-flag" aria-hidden="true">' + meta.flag + '</span>' +
    '</button>';
  document.body.appendChild(wrap);
  var btn = wrap.querySelector('#na-lang-fab-btn');
  var menu = wrap.querySelector('#na-lang-fab-menu');

  function onDoc(e) { if (!wrap.contains(e.target)) closeMenu(); }
  function onKey(e) { if (e.key === 'Escape') { closeMenu(); btn.focus(); } }
  function closeMenu() {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', onDoc, true);
    document.removeEventListener('keydown', onKey, true);
  }
  function openMenu() {
    menu.innerHTML = _LANG_KEYS.map(function (c) {
      var m = _LANG_META[c];
      return '<button type="button" role="menuitem" class="na-lang-opt' + (c === _lang ? ' active' : '') + '" data-lang="' + c + '" lang="' + c + '">' +
             '<span class="na-lang-flag" aria-hidden="true">' + m.flag + '</span><span class="na-lang-name">' + m.name + '</span></button>';
    }).join('');
    na_wireLangPicker(menu);
    menu.querySelectorAll('.na-lang-opt').forEach(function (b) { b.addEventListener('click', closeMenu); });
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    setTimeout(function () {
      document.addEventListener('pointerdown', onDoc, true);
      document.addEventListener('keydown', onKey, true);
    }, 0);
  }
  btn.addEventListener('click', function (e) { e.stopPropagation(); if (menu.hidden) openMenu(); else closeMenu(); });
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
  m.on('drag', () => {
    // Live-follow: update the dragged pin's coordinates and re-point the route
    // line without rebuilding it, so the journey line tracks the cursor smoothly.
    const ll = m.getLatLng();
    const p = _tripPins.find(p => p.id === pin.id);
    if (!p) return;
    p.lat = ll.lat; p.lng = ll.lng;
    const latlngs = _tripPins.length >= 2 ? _buildRouteLatLngs() : [];
    if (_tripRouteLine) _tripRouteLine.setLatLngs(latlngs);
    if (_tripRouteCasing) _tripRouteCasing.setLatLngs(latlngs);
  });
  m.on('dragend', () => {
    const ll = m.getLatLng();
    const p = _tripPins.find(p => p.id === pin.id);
    if (p) { p.lat = ll.lat; p.lng = ll.lng; _saveTripPins(); _updateTripPlannerPanel(); }
  });
  m.addTo(map);
  _tripPinMarkers[pin.id] = m;
}

// Animated trip route line. Draws the journey as an ordered polyline through the
// trip pins, beneath the numbered markers: a soft gold casing for depth plus a
// flowing dashed line whose dashes "march" from the first pin toward the last,
// giving the route a clear sense of direction and travel. Continuous CSS dash
// animation means pin edits update geometry without a jarring re-draw, and the
// motion is disabled under prefers-reduced-motion (handled in CSS).
var _tripRouteLine = null;
var _tripRouteCasing = null;

function _clearTripRouteLine() {
  if (_tripRouteCasing) { _tripRouteCasing.remove(); _tripRouteCasing = null; }
  if (_tripRouteLine) { _tripRouteLine.remove(); _tripRouteLine = null; }
}

// Interpolate points along the GREAT CIRCLE between two coordinates (spherical
// slerp), so a journey line bows along the true shortest path the way flights
// do, rather than drawing a flat straight segment on the Mercator projection.
function _greatCirclePoints(lat1, lng1, lat2, lng2, n) {
  const toR = Math.PI / 180, toD = 180 / Math.PI;
  const p1 = lat1 * toR, l1 = lng1 * toR, p2 = lat2 * toR, l2 = lng2 * toR;
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
  if (!d) return [[lat1, lng1], [lat2, lng2]];
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
    const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
    const z = A * Math.sin(p1) + B * Math.sin(p2);
    pts.push([Math.atan2(z, Math.sqrt(x * x + y * y)) * toD, Math.atan2(y, x) * toD]);
  }
  return pts;
}

// Build the full route polyline as concatenated great-circle arcs through the
// pins. Longitudes are "unwrapped" (kept continuous across ±180°) so a route
// that crosses the antimeridian draws the short way instead of streaking across
// the whole map.
function _buildRouteLatLngs() {
  let out = [];
  let prevLng = null;
  for (let i = 0; i < _tripPins.length - 1; i++) {
    const a = _tripPins[i], b = _tripPins[i + 1];
    const km = (typeof _haversineKm === 'function') ? _haversineKm(a.lat, a.lng, b.lat, b.lng) : 0;
    const segs = Math.max(8, Math.min(128, Math.round(km / 120)));
    const arc = _greatCirclePoints(a.lat, a.lng, b.lat, b.lng, segs);
    arc.forEach((pt, j) => {
      if (i > 0 && j === 0) return; // skip duplicate junction point
      let lng = pt[1];
      if (prevLng !== null) { while (lng - prevLng > 180) lng -= 360; while (lng - prevLng < -180) lng += 360; }
      prevLng = lng;
      out.push([pt[0], lng]);
    });
  }
  return out;
}

function _renderTripRouteLine() {
  if (!map) return;
  _clearTripRouteLine();
  if (!_tripPins || _tripPins.length < 2) return;
  const latlngs = _buildRouteLatLngs();
  _tripRouteCasing = L.polyline(latlngs, {
    pane: 'routePane', interactive: false, className: 'na-route-casing',
    color: '#c9a84c', weight: 6, opacity: 0.16, lineCap: 'round', lineJoin: 'round',
  }).addTo(map);
  _tripRouteLine = L.polyline(latlngs, {
    pane: 'routePane', interactive: false, className: 'na-route-flow',
    color: '#e8d5a3', weight: 2.4, opacity: 0.92, dashArray: '1 11', lineCap: 'round',
  }).addTo(map);
}

function _renderAllTripPins() {
  _tripPins.forEach((pin, i) => _renderTripPinMarker(pin, i));
  _renderTripRouteLine();
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

  // Add Pin button — toggles continuous placement mode.
  document.getElementById('btn-add-pin').addEventListener('click', () => {
    _setPlacingPin(!_placingPin);
    // Make sure the panel is open so the user can see the pin list grow.
    if (_placingPin) panel.classList.add('open');
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

  // Map click handler — place a pin whenever "Add Pin" mode is active.
  //
  // Pin placement takes priority over every feature tooltip: the country / admin /
  // territory / city click handlers now bail out early while _placingPin is true
  // (see their handlers), so they neither open a tooltip nor set _featureClicked.
  // That means a click anywhere over land drops a pin instead of being swallowed
  // by the full-coverage country polygon underneath the cursor — the bug that
  // made pin placement impossible.
  //
  // Placement is CONTINUOUS: each click adds the next waypoint and we stay in
  // placing mode, so a multi-stop trip is just click-click-click. The user exits
  // by pressing the "Add Pin" toggle again (now labelled "✓ Done") or Escape.
  if (map) {
    map.on('click', e => {
      if (!_placingPin) return;
      _placeTripPinAt(e.latlng.lat, e.latlng.lng);
    });
    // Escape leaves placing mode without dropping a pin.
    document.addEventListener('keydown', ev => {
      if (ev.key === 'Escape' && _placingPin) _setPlacingPin(false);
    });
  }
}

// Drop a waypoint at the given coordinates and refresh the panel + route line,
// keeping placing mode active for the next click.
function _placeTripPinAt(lat, lng, label) {
  const name = (label && String(label).trim()) ? String(label).slice(0, 120) : `Pin ${_tripPins.length + 1}`;
  const pin = { id: 'tp_' + Date.now() + '_' + _tripPins.length, lat, lng, name };
  _tripPins.push(pin);
  _saveTripPins();
  _renderTripPinMarker(pin, _tripPins.length - 1);
  _renderTripRouteLine();
  _updateTripPlannerPanel();
  const hint = document.getElementById('trip-hint');
  if (hint) hint.textContent = `Placed ${_tripPins.length} pin${_tripPins.length === 1 ? '' : 's'}. Keep clicking to add more · drag to reposition · press "✓ Done" or Esc to finish.`;
}

// Single source of truth for entering/leaving pin-placement mode, so the button
// label, cursor, hint, and panel state never drift apart.
function _setPlacingPin(on) {
  _placingPin = !!on;
  const addBtn = document.getElementById('btn-add-pin');
  if (addBtn) {
    addBtn.classList.toggle('placing', _placingPin);
    addBtn.textContent = _placingPin ? '✓ Done' : '+ Add Pin';
  }
  const hint = document.getElementById('trip-hint');
  if (hint) hint.textContent = _placingPin
    ? 'Click anywhere on the map to drop a waypoint. Keep clicking to add more.'
    : (_tripPins.length ? 'Drag pins to reposition · click "Add Pin" to add more.' : 'Click "Add Pin", then tap the map to place your first waypoint.');
  if (map) map.getContainer().style.cursor = _placingPin ? 'crosshair' : '';
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

  // glyphPane: multi-layer "enamel chip" glyphs sit above borders/fills but below
  // city markers, so city discovery dots remain clickable on top of a glyph cluster.
  map.createPane('glyphPane');
  map.getPane('glyphPane').style.zIndex = '360';
  map.getPane('glyphPane').style.pointerEvents = 'auto';

  // routePane: the animated trip route line draws beneath the numbered trip-pin
  // markers (markersPane, z400) but above glyphs/fills, and never intercepts clicks.
  map.createPane('routePane');
  map.getPane('routePane').style.zIndex = '392';
  map.getPane('routePane').style.pointerEvents = 'none';

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

  // Basemap tile configurations — satellite is the default; user can switch in Preferences.
  var BASEMAP_CONFIGS = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri',
      maxZoom: 19,
    },
    streets: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20, subdomains: 'abcd',
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20, subdomains: 'abcd',
    },
    nightlights: {
      // NASA GIBS — VIIRS City Lights / Black Marble. Keyless public WMTS, static
      // composite (no date dimension). Earth from space at night: city lights and lit
      // coastlines. Native to z8; maxNativeZoom upscales deeper zooms instead of 404.
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
      attribution: 'Earth at Night &mdash; NASA Earth Observatory / GIBS (VIIRS City Lights)',
      maxZoom: 19, maxNativeZoom: 8,
    },
    terrain: {
      // OpenTopoMap — keyless topographic relief (Google-Terrain-like). Native to
      // z17; maxNativeZoom lets Leaflet upscale tiles to z19 instead of 404-ing.
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
      maxZoom: 19, maxNativeZoom: 17, subdomains: 'abc',
    },
  };
  window._BASEMAP_CONFIGS = BASEMAP_CONFIGS;  // expose for na_setBasemap

  // The MAP always opens on satellite, even though the UI/menu defaults to dark.
  // A dark/night basemap left in storage from a prior session is reset to
  // satellite at launch (the dark theme must not pull the map into a dark map).
  if (_mapStyle === 'dark' || _mapStyle === 'nightlights') {
    _mapStyle = 'satellite';
    try { localStorage.setItem('na_mapstyle', 'satellite'); } catch (e) {}
  }
  var style = (_mapStyle && BASEMAP_CONFIGS[_mapStyle]) ? _mapStyle : 'satellite';
  var bc    = BASEMAP_CONFIGS[style];
  _basemapLayer = L.tileLayer(bc.url, {
    attribution: bc.attribution,
    maxZoom:     bc.maxZoom     || 19,
    subdomains:  bc.subdomains  || '',
    errorTileUrl: '',
  }).addTo(map);

  // Place-labels overlay — kept in a reference so it can be toggled on/off
  // independently of the basemap (the on-map switcher exposes a Labels control).
  _labelLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 20,
    opacity: 0.7,
    pane: 'labelPane',
  });
  if (_labelsOn) _labelLayer.addTo(map);
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
  { id:'environment',   label:'Environment',     emoji:'🌿', keys:['parks','beaches','crowds'] },
];

// Canonical layer toggle — the single entry point every layer surface routes
// through (topbar pills, sidebar items, mobile sheet, keyboard shortcuts). Handles
// choropleth layers and the elevation tile overlay uniformly: refresh() applies
// toggleElevationLayer(activeLayers.has('elevation')), so no special-casing here.
function toggleLayer(key) {
  if (!key) return;
  if (activeLayers.has(key)) activeLayers.delete(key);
  else activeLayers.add(key);
  const pill = document.querySelector('.lb[data-key="' + key + '"]');
  if (pill) pill.classList.toggle('on', activeLayers.has(key));
  syncMoreButtonState();
  syncCatButtons();
  refresh();
  _renderNYCCrime();
  updateURLState();
  saveState();
}

function makeLbButton(key, layer) {
  const btn = document.createElement('button');
  btn.className = 'lb' + (activeLayers.has(key) ? ' on' : '');
  btn.dataset.key = key;
  // When active the chip shows only the emoji, so keep the name reachable.
  btn.title = layer.name;
  btn.setAttribute('aria-label', layer.name);
  if (layer.color) btn.style.setProperty('--lb-color', layer.color);
  const emoji = document.createElement('span');
  emoji.className = 'lb-emoji';
  emoji.textContent = layer.emoji;
  const name  = document.createElement('span');
  name.className = 'lb-name';
  name.textContent = layer.name;
  btn.appendChild(emoji);
  btn.appendChild(name);
  btn.addEventListener('click', () => { toggleLayer(key); });
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

  // Build a toggle button for a TRANSPORT_LAYERS tile/vector overlay. Reused by the
  // Explore dropdown for the nature/hazard overlays (national-park borders, wildfires)
  // that were previously — incorrectly — filed under "Transport".
  function mkTransportBtn(key) {
    const def = TRANSPORT_LAYERS[key];
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
    return btn;
  }

  // Transport dropdown lists only genuine getting-around layers.
  ['roads','rail','trails','maritime'].forEach(key => transpDd.appendChild(mkTransportBtn(key)));

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

  // Group layers by theme. POI point-layers plus the nature/hazard tile overlays
  // (national-park borders, wildfires) that were wrongly filed under "Transport"
  // now live here, where they belong.
  const EXPLORE_GROUPS = [
    { label: 'Nature',                poi: ['parks','camping','viewpoints','hotsprings','birdwatching','toilets','drinkwater','wildlife'], overlays: ['natparks'] },
    { label: 'Adventure',             poi: ['climbing','surfing','diving'], overlays: [] },
    { label: 'Travel Info',           poi: ['holidays','airports','attractions','hospitals','gasstations'], overlays: [] },
    { label: 'Environment & Hazards', poi: [], overlays: ['wildfires'] },
  ];

  EXPLORE_GROUPS.forEach(group => {
    const sep = document.createElement('div');
    sep.className = 'more-dropdown-label';
    sep.textContent = group.label;
    exploreDd.appendChild(sep);

    group.poi.forEach(key => {
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

    // Nature/hazard tile overlays that belong in this group (not "Transport").
    group.overlays.forEach(key => {
      if (TRANSPORT_LAYERS[key]) exploreDd.appendChild(mkTransportBtn(key));
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

// Per-layer rating for a single country (0=best … 3=worst, null if no data for
// that layer). SINGLE SOURCE OF TRUTH: getCountryRating aggregates these with
// worst-case (Math.max), and the multi-layer glyph overlay renders one chip per
// layer from the very same values — so the choropleth fill and the glyph chips
// can never disagree.
function countryLayerRating(iso2, lk) {
  const d = CD[iso2];
  // Scalar tables are the primary source; fall back to 12-month CD arrays so
  // countries with array data but no scalar entry still get a rating.
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
  if (lk === 'parks')    { if (typeof CD_PARKS !== 'undefined' && CD_PARKS[iso2] != null) return CD_PARKS[iso2]; return null; }
  if (lk === 'visa')     return selectedNationality ? getVisaRating(iso2, selectedNationality) : null;
  if (lk === 'strength') return selectedNationality ? getStrengthRating(iso2) : null;
  const arr = d ? d[lk] : null;
  return arr != null ? getRating(arr) : null;
}

function getCountryRating(iso2) {
  const layers = [...activeLayers];
  if (layers.length === 0) return null;
  // Do NOT pre-bail when CD[iso2] is absent: scalar tables (CD_COST, CD_SAFETY,
  // CD_PARKS, …) cover many countries that have no full CD entry. countryLayerRating
  // null-guards each layer individually, so array-only layers still return null here.
  const ratings = layers.map(lk => countryLayerRating(iso2, lk)).filter(v => v !== null);
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
    if (lk === 'parks')    { if (typeof CD_PARKS !== 'undefined' && CD_PARKS[parentIso2] != null) return CD_PARKS[parentIso2]; return null; }
    if (lk === 'visa')     return selectedNationality ? getVisaRating(parentIso2, selectedNationality) : null;
    if (lk === 'strength') return selectedNationality ? getStrengthRating(parentIso2) : null;
    const derivedA1 = subCode ? _admin1CityData[subCode] : null;
    const arr = (d1 && d1[lk]) || (derivedA1 && derivedA1[lk]) || (d2 && d2[lk]);
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
  // Multi-layer mode: the per-layer glyph chips carry the detail, so the
  // worst-case choropleth fill drops to a faint summary wash beneath them.
  const multi = activeLayers.size >= 2;
  const fo = r !== null
    ? (multi ? (hover ? 0.46 : 0.30) : (hover ? 0.88 : 0.72))
    : (activeLayers.size > 0 ? 0.25 : 0);
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
  const multi = activeLayers.size >= 2;
  const fo = r !== null
    ? (multi ? (hover ? 0.46 : 0.30) : (hover ? 0.88 : 0.72))
    : (activeLayers.size > 0 ? 0.20 : 0);
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
    if (lk === 'parks')    { if (typeof CD_PARKS !== 'undefined' && CD_PARKS[parentIso2] != null) return CD_PARKS[parentIso2]; return null; }
    if (lk === 'visa')     return selectedNationality ? getVisaRating(parentIso2, selectedNationality) : null;
    if (lk === 'strength') return selectedNationality ? getStrengthRating(parentIso2) : null;
    const derivedA2 = shapeID ? _admin2CityData[shapeID] : null;
    const arr = (d2 && d2[lk]) || (derivedA2 && derivedA2[lk]) || (d1 && d1[lk]) || (d0 && d0[lk]);
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
// Marker-icon cache: visual signature -> shared L.divIcon. The expensive part of a
// marker is the per-call canvas draw + synchronous toDataURL() PNG encode; many
// cities share the same layer/rating/size, so caching turns ~290 encodes per
// refresh into a handful — the single biggest win for layer/month/passport speed.
var _markerIconCache = {};

function makeMarkerIcon(city, zoom) {
  const la = [...activeLayers];
  const n = la.length;
  // n === 0 (no active layer) is intentional: draw a neutral "discovery" dot so
  // notable cities are visible on the clean satellite map before a layer is chosen.

  // Dots shrink as the user zooms in — a city fills a screen at zoom 12+ so
  // a large dot would obscure it.  At world zoom dots are larger so they are
  // easy to find and click.  Radii are 25% smaller than the original ramp
  // (8/7/6/5/4 → 6/5/4.5/4/3) for a lighter, less cluttered map.
  const SZ = zoom >= 12 ? 3 : zoom >= 10 ? 4 : zoom >= 8 ? 4.5 : zoom >= 6 ? 5 : 6;
  const D = SZ * 2;
  const lw = SZ <= 4 ? 1 : 1.5;  // thinner stroke on small markers

  // Compute the rating(s) once and build a cache signature. getRating is cheap;
  // the encode is not — so we key on everything that changes the pixels.
  let sig, ratings = null;
  if (n === 0) {
    sig = 'n0:' + SZ;
  } else if (n === 1) {
    ratings = [getRating(city.data[la[0]]) ?? 0];
    sig = 'n1:' + la[0] + ':' + ratings[0] + ':' + SZ;
  } else {
    ratings = la.map(lk => getRating(city.data[lk]) ?? 0);
    sig = 'nN:' + la.join(',') + ':' + ratings.join(',') + ':' + SZ;
  }
  const hit = _markerIconCache[sig];
  if (hit) return hit;

  const cv = document.createElement('canvas');
  cv.width = D; cv.height = D;
  const ctx = cv.getContext('2d');
  const cx = SZ, cy = SZ, r = SZ - lw;

  if (n === 0) {
    // Clean-open discovery marker — a luminous parchment dot with a gold ring
    // and a dark pip, so it reads as a place pin without implying any score.
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(232,213,163,0.82)'; ctx.fill();
    ctx.strokeStyle = 'rgba(201,168,76,0.9)'; ctx.lineWidth = lw; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, r * 0.34), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(14,11,6,0.5)'; ctx.fill();
  } else if (n === 1) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = RC[Math.min(3, ratings[0])]; ctx.fill();
    ctx.strokeStyle = 'rgba(201,168,76,0.75)'; ctx.lineWidth = lw; ctx.stroke();
  } else {
    const slice = (Math.PI * 2) / n;
    ratings.forEach((v, i) => {
      const s = slice * i - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, s, s + slice); ctx.closePath();
      ctx.fillStyle = RC[Math.min(3, v)]; ctx.fill();
      ctx.strokeStyle = 'rgba(14,11,6,0.4)'; ctx.lineWidth = 0.5; ctx.stroke();
    });
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,168,76,0.70)'; ctx.lineWidth = lw; ctx.stroke();
  }

  // toDataURL() encodes the drawn pixels as a PNG data URI used in an <img>.
  const icon = L.divIcon({ html: `<img src="${cv.toDataURL()}" width="${D}" height="${D}" style="display:block">`, className: '', iconSize: [D, D], iconAnchor: [SZ, SZ] });
  // Bound the cache so long sessions across many month/layer combos can't grow it forever.
  if (Object.keys(_markerIconCache).length > 2400) _markerIconCache = {};
  _markerIconCache[sig] = icon;
  return icon;
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
        if (_placingPin) return;   // yield to trip-pin placement
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
    // Self-hosted in data/countries.geojson — eliminates external CDN dependency.
    // Abort after 60 s (generous for slow 3G connections).
    // Show a status message after 5 s so users know why the map has no colours.
    const ctrl    = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 60000);
    const slowTimer = setTimeout(() => {
      const st = document.getElementById('map-status');
      if (st) { st.textContent = '⏳ Loading map data… This may take a moment on slower connections.'; st.style.display = 'block'; }
    }, 5000);
    const res = await fetch('data/countries.geojson', { signal: ctrl.signal });
    clearTimeout(timeout);
    clearTimeout(slowTimer);
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
        if (_placingPin) return;   // yield to trip-pin placement
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
  // Self-hosted first (data/admin1.geojson), CDN fallbacks for resilience.
  // Each attempt aborts after 20 s so a hanging connection cannot block forever.
  const ADMIN1_URLS = [
    'data/admin1.geojson',
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson',
    'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_10m_admin_1_states_provinces.geojson',
  ];
  try {
    let res, lastErr;
    for (const url of ADMIN1_URLS) {
      try {
        const ctrl = new AbortController();
        const tid  = setTimeout(() => ctrl.abort(), 20000);
        res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(tid);
        if (res.ok) break;
        lastErr = new Error('HTTP ' + res.status + ' from ' + url);
      } catch (e) { lastErr = e; }
    }
    if (!res || !res.ok) throw lastErr || new Error('All admin-1 sources failed');
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

    // Borrow real climate from the cities inside each province (used only where
    // CD_A1 has no explicit value for a layer). Computed once, before first paint.
    try {
      const a1cities = (typeof CITIES !== 'undefined')
        ? CITIES.filter(c => c && _coveredByAdmin1.has(c.country)) : [];
      _deriveCityClimate(filteredFeatures, f => getAdmin1Code(f.properties),
        f => getAdmin1Iso2(f.properties), a1cities, _admin1CityData);
    } catch (e) { console.warn('admin1 city-climate derive failed:', e && e.message); }

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
          if (_placingPin) return;   // yield to trip-pin placement
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

    // Derive county-level climate from the cities inside each county, so a county
    // reflects its own microclimate instead of inheriting the state/country value.
    try {
      const ccCities = (typeof CITIES !== 'undefined') ? CITIES.filter(c => c && c.country === iso2) : [];
      _deriveCityClimate(geojson.features, f => f.properties.shapeID, () => iso2, ccCities, _admin2CityData);
    } catch (e) { console.warn('admin2 city-climate derive failed:', e && e.message); }

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
          if (_placingPin) return;   // yield to trip-pin placement
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
// Country capitals only — computed once from COUNTRY_CAPITALS (ISO-2 → capital
// name) by matching against the CITIES list. Used for the first zoom tier.
let _capitalCitiesCache = null;
function _capitalCities() {
  if (_capitalCitiesCache) return _capitalCitiesCache;
  if (typeof COUNTRY_CAPITALS === 'undefined') { _capitalCitiesCache = []; return _capitalCitiesCache; }
  _capitalCitiesCache = CITIES.filter(c => c && COUNTRY_CAPITALS[c.country] === c.name);
  return _capitalCitiesCache;
}

function renderCityMarkers() {
  cityMarkers.forEach(m => m.remove());
  cityMarkers = [];

  const zoom = map.getZoom();
  // Three-tier reveal, calm at world view and progressively richer on zoom-in:
  //   • world view (zoom < 4)      → no city dots at all
  //   • first zoom step (zoom 4)   → country capitals only
  //   • zoomed in (zoom ≥ 5)       → every city dot
  if (zoom < 4) return;
  if (zoom < 5) { _placeCities(_capitalCities()); return; }
  _placeCities(CITIES);
}

function _placeCities(list) {
  const zoom = map.getZoom();
  list.forEach(city => {
    const icon = makeMarkerIcon(city, zoom);
    if (!icon) return;
    const marker = L.marker([city.lat, city.lng], { icon, pane: 'markersPane' });

    marker.on('click', e => {
      if (_placingPin) { _placeTripPinAt(city.lat, city.lng); return; }   // drop a pin on the city
      _featureClicked = true;
      toggleTooltip('city:' + city.name + ':' + city.lat, buildCityTooltip(city), e.originalEvent.clientX, e.originalEvent.clientY);
      setTimeout(() => { _featureClicked = false; }, 10);
    });

    marker.addTo(map);
    cityMarkers.push(marker);
  });
}

// ─── Multi-Layer Glyph Overlay ────────────────────────────────────────────────
// The signature multi-layer visualization. With ONE active layer the area is
// filled with that layer's score colour (handled in getCountryStyle). With TWO
// OR MORE active layers the fill drops to a faint worst-case wash and each layer
// is rendered as its own "enamel chip" — the layer's symbol on an opaque,
// score-coloured rounded chip with a dark-inner / gold-outer double stroke —
// clustered at the country centroid, so several layers read individually in the
// same space. Reveal-by-zoom keeps the world view calm; chips appear on zoom-in.
var layerGlyphMarkers = [];
var _glyphHTMLCache = {};

function clearLayerGlyphs() {
  layerGlyphMarkers.forEach(m => m.remove());
  layerGlyphMarkers = [];
}

// Layers that carry a 0-3 country rating (everything except pure tile/marker
// overlays such as the elevation topo tiles and the seasonal-events markers).
function _glyphRatedLayers() {
  return [...activeLayers].filter(lk => LAYERS[lk] && lk !== 'elevation' && lk !== 'events');
}

// One chip: opaque RC fill + the layer symbol. Grey (RC_NODATA) when this country
// has no datum for the layer. Cached by layerKey:rating since the markup is identical.
function _glyphChipHTML(lk, rating) {
  const key = lk + ':' + (rating == null ? 'x' : rating);
  if (_glyphHTMLCache[key]) return _glyphHTMLCache[key];
  const def = LAYERS[lk] || {};
  const sym = def.emoji || def.icon || '•';
  const col = rating != null ? RC[Math.min(3, Math.max(0, rating))] : RC_NODATA;
  const html = '<span class="na-glyph-chip" style="background:' + col + '">' +
               '<span class="na-glyph-sym">' + sym + '</span></span>';
  _glyphHTMLCache[key] = html;
  return html;
}

// Build the cluster markup + chip count for a country across the active layers.
// Caps the visible chips and shows a "+N" overflow chip so dense selections stay legible.
function _buildGlyphCluster(iso2, layers) {
  // Tighter cap on narrow phones so clusters stay compact on the primary surface.
  const CAP = (typeof window !== 'undefined' && window.innerWidth && window.innerWidth < 480) ? 3 : 4;
  let visible = layers, overflow = 0;
  if (layers.length > CAP) { visible = layers.slice(0, CAP - 1); overflow = layers.length - (CAP - 1); }
  let chips = visible.map(lk => _glyphChipHTML(lk, countryLayerRating(iso2, lk))).join('');
  let count = visible.length;
  if (overflow > 0) {
    chips += '<span class="na-glyph-chip na-glyph-more">+' + overflow + '</span>';
    count += 1;
  }
  return { html: '<div class="na-glyph-cluster">' + chips + '</div>', count };
}

function renderLayerGlyphs() {
  if (!map) return;
  clearLayerGlyphs();
  const layers = _glyphRatedLayers();
  // Glyphs are the language of MULTI-layer mode only. 0 = clean map, 1 = fill.
  if (layers.length < 2) return;
  // Calm at world view; reveal per-country glyphs once the user zooms into a region.
  if (map.getZoom() < 4) return;
  const bounds = map.getBounds().pad(0.2);
  const CW = 22, H = 26;
  // Greedy screen-space de-overlap: skip a cluster whose pixel position falls
  // within MINPX of an already-placed one, so dense regions (e.g. central
  // Europe at low zoom) stay legible. Zooming in spreads centres apart, so the
  // suppression naturally relaxes and full coverage returns.
  const placed = [];
  const MINPX = 44;
  Object.keys(COUNTRY_CENTERS).forEach(iso2 => {
    if (!CD[iso2]) return;                       // same data gate as the choropleth fill
    const c = COUNTRY_CENTERS[iso2];
    if (!c) return;
    const ll = L.latLng(c[0], c[1]);
    if (!bounds.contains(ll)) return;
    // Skip all-grey clusters: require at least one layer with real data here.
    if (!layers.some(lk => countryLayerRating(iso2, lk) != null)) return;
    const pt = map.latLngToContainerPoint(ll);
    let tooClose = false;
    for (let k = 0; k < placed.length; k++) {
      const dx = pt.x - placed[k].x, dy = pt.y - placed[k].y;
      if (dx * dx + dy * dy < MINPX * MINPX) { tooClose = true; break; }
    }
    if (tooClose) return;
    placed.push(pt);
    const cluster = _buildGlyphCluster(iso2, layers);
    const w = cluster.count * CW + 8;
    const icon = L.divIcon({
      html: cluster.html,
      className: 'na-glyph-icon',
      iconSize: [w, H],
      iconAnchor: [w / 2, H / 2],
    });
    const m = L.marker(ll, { icon, pane: 'glyphPane', interactive: true, keyboard: false, riseOnHover: true });
    m.on('click', e => {
      _featureClicked = true;
      if (typeof na_openCountryDossier === 'function') {
        na_openCountryDossier(iso2);
      } else {
        const html = buildCountryTooltip(iso2);
        if (html) toggleTooltip('country:' + iso2, html, e.originalEvent.clientX, e.originalEvent.clientY);
      }
      setTimeout(() => { _featureClicked = false; }, 10);
    });
    m.addTo(map);
    layerGlyphMarkers.push(m);
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
  // On-map seasonal-event emoji icons (e.g. rain over India, a guitar over London)
  // are disabled by design — they cluttered the map. The event details still appear
  // as text inside the country/city dossier. Clear any existing markers and stop.
  eventMarkers.forEach(m => m.remove());
  eventMarkers = [];
  return;
  // --- legacy rendering retained for reference (intentionally unreachable) ---
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
    row('Temperature',  (t.temperature != null && t.temperature !== '') ? ((typeof _tempUnit !== 'undefined' && _tempUnit === 'F') ? (Math.round(Number(t.temperature) * 9 / 5 + 32) + '°F') : (t.temperature + '°C')) : ''),
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

  // Dot indicator
  var dots = "";
  for (var d = 0; d < 4; d++) { dots += d <= v ? "●" : "○"; }

  // Compact header
  var header = '<div class="tt-tip-header">'
    + '<span class="tt-tip-label">' + _esc(labels[v]) + '</span>'
    + '<span class="tt-tip-dots">' + _esc(dots) + '</span>'
    + '</div>';

  // ── Rich panel when TIPPING_DETAIL_DATA is available ───────────────────────
  if (typeof TIPPING_DETAIL_DATA !== "undefined" && TIPPING_DETAIL_DATA[iso2] != null) {
    var detail = TIPPING_DETAIL_DATA[iso2];

    // Industry icon map
    var iconMap = {
      restaurant:   "restaurant",
      cafe:         "cafe",
      bar:          "bar",
      taxi:         "taxi",
      hotel_porter: "hotel",
      housekeeping: "bed",
      spa:          "spa",
      haircut:      "scissors",
      tour_guide:   "backpack",
      delivery:     "package"
    };
    var industryLabels = {
      restaurant:   "Restaurant",
      cafe:         "Cafe",
      bar:          "Bar",
      taxi:         "Taxi / Ride",
      hotel_porter: "Hotel Porter",
      housekeeping: "Housekeeping",
      spa:          "Spa",
      haircut:      "Haircut",
      tour_guide:   "Tour Guide",
      delivery:     "Delivery"
    };
    var industryOrder = ["restaurant","cafe","bar","taxi","hotel_porter","housekeeping","spa","haircut","tour_guide","delivery"];

    // Build 2-col grid rows
    var gridCells = "";
    var industries = (detail && typeof detail.industries === "object" && detail.industries !== null) ? detail.industries : {};
    for (var k = 0; k < industryOrder.length; k++) {
      var key = industryOrder[k];
      var icon = iconMap[key] || key;
      var lbl  = industryLabels[key] || key;
      var tipVal = "";
      if (industries[key] != null) {
        var ind = industries[key];
        if (typeof ind === "object" && ind !== null) {
          if (ind.tip != null)    tipVal = ind.tip;
          else if (ind.amount != null) tipVal = ind.amount;
          else if (ind.pct != null) tipVal = ind.pct;
        } else {
          tipVal = String(ind);
        }
      } else {
        tipVal = "—";
      }
      gridCells += '<div class="tt-tip-industry-cell">'
        + '<span class="tt-tip-ind-icon">' + _esc(icon) + '</span>'
        + '<span class="tt-tip-ind-name">' + _esc(lbl) + '</span>'
        + '<span class="tt-tip-ind-val">' + _esc(String(tipVal)) + '</span>'
        + '</div>';
    }

    var industryGrid = '<div class="tt-tip-industry-grid">' + gridCells + '</div>';

    // Service charge notice
    var scNotice = "";
    if (detail && detail.serviceCharge === true) {
      scNotice = '<div class="tt-tip-sc-notice">'
        + '<span class="tt-tip-sc-icon">!</span>'
        + '<span class="tt-tip-sc-text">Service charge may be included — check before tipping.</span>'
        + '</div>';
    }

    // Quick tip box
    var quickTipBox = "";
    var quickTipText = (detail && typeof detail.quickTip === "string" && detail.quickTip) ? detail.quickTip : "";
    if (quickTipText) {
      quickTipBox = '<div class="tt-tip-quicktip">' + _esc(quickTipText) + '</div>';
    }

    // Tip calculator — uses restaurant tip pct if available
    var calcPct = 0;
    if (industries.restaurant != null && typeof industries.restaurant === "object" && industries.restaurant !== null) {
      var rval = industries.restaurant.tip || industries.restaurant.pct || industries.restaurant.amount || "";
      var match = String(rval).match(/(\d+)/);
      if (match) calcPct = parseInt(match[1], 10);
    }
    if (!calcPct && v === 3) calcPct = 18;
    else if (!calcPct && v === 2) calcPct = 12;
    else if (!calcPct && v === 1) calcPct = 5;

    var calcId = "tc-result-" + iso2.replace(/[^a-zA-Z0-9]/g, "_");
    var calculator = '<div class="tt-tip-calc">'
      + '<span class="tt-tip-calc-label">Tip calc (' + calcPct + '%):</span>'
      + '<input class="tt-tip-calc-input" type="number" min="0" step="0.01" placeholder="Bill amount"'
      + ' oninput="(function(el){'
      +   'var bill=parseFloat(el.value);'
      +   'var res=document.getElementById(\'' + calcId + '\');'
      +   'if(!res)return;'
      +   'if(isNaN(bill)||bill<=0){res.textContent=\'\';return;}'
      +   'res.textContent=\'Tip: \'+(bill*' + calcPct + '/100).toFixed(2);'
      + '})(this)">'
      + '<span class="tt-tip-calc-result" id="' + calcId + '"></span>'
      + '</div>';

    return '<div class="tt-section">'
      + header
      + industryGrid
      + scNotice
      + quickTipBox
      + calculator
      + '</div>';
  }

  // ── Fallback: original minimal display ─────────────────────────────────────
  var industries_fallback = [
    ["🍽", "Restaurants",    ["Not expected","Round up","10-15%","18-20%"]],
    ["🚕", "Taxis / Rides",  ["Not expected","Round up","10%","15-20%"]],
    ["🏨", "Hotels",         ["Not expected","€1-2/bag optional","$1-2/bag","$2-5/bag"]],
    ["💆", "Spas / Haircuts",["Not expected","5-10% optional","15%","20%"]],
    ["🗺", "Tour Guides",    ["Not expected","€5-10 optional","$5-10/day","$10-20/day"]]
  ];
  var gridRows = "";
  for (var i = 0; i < industries_fallback.length; i++) {
    var row = industries_fallback[i];
    gridRows += '<div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">'
      + '<span style="font-size:7.5px;color:rgba(255,255,255,0.65);">' + _esc(row[0]) + " " + _esc(row[1]) + '</span>'
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

// Render a country intelligence brief. Prefers the static, pre-generated
// dataset (COUNTRY_INTEL) so it works for everyone — offline, instantly, with no
// API key. If a personal key is configured, a fresh live brief replaces it.
function _renderIntelHTML(intel, containerEl) {
  if (!intel || !containerEl) return;
  var h = '<div class="intel-panel">';
  if (intel.origin)     h += '<div class="intel-sect"><div class="intel-lbl">' + _esc(_t('intel.origin')) + '</div><p>' + _esc(intel.origin) + '</p></div>';
  if (intel.character)  h += '<div class="intel-sect"><div class="intel-lbl">' + _esc(_t('intel.character')) + '</div><p>' + _esc(intel.character) + '</p></div>';
  if (intel.bestFor && intel.bestFor.length) {
    h += '<div class="intel-sect"><div class="intel-lbl">' + _esc(_t('intel.bestFor')) + '</div><ul>';
    intel.bestFor.forEach(function (b) { h += '<li>' + _esc(b) + '</li>'; });
    h += '</ul></div>';
  }
  if (intel.notKnown)   h += '<div class="intel-sect"><div class="intel-lbl">' + _esc(_t('intel.notKnown')) + '</div><p>' + _esc(intel.notKnown) + '</p></div>';
  if (intel.complexity) h += '<div class="intel-sect intel-cx"><div class="intel-lbl">' + _esc(_t('intel.complexity')) + '</div><p>' + _esc(intel.complexity) + '</p></div>';
  containerEl.innerHTML = h + '</div>';
}

function _renderCountryIntel(iso2, countryName, containerEl) {
  if (!containerEl) return;
  var stat = (typeof COUNTRY_INTEL !== 'undefined' && COUNTRY_INTEL[iso2]) ? COUNTRY_INTEL[iso2] : null;
  if (stat) {
    _renderIntelHTML(stat, containerEl);
  } else {
    containerEl.innerHTML = '<div class="intel-loading">' + _esc(_t('common.loading')) + '</div>';
  }
  // Optional live enhancement when a personal API key is configured in session.
  var apiKey = null;
  try { apiKey = sessionStorage.getItem('na_api_key'); } catch (_e) {}
  if (apiKey) {
    _getCountryIntelligence(iso2, countryName).then(function (live) {
      if (live) _renderIntelHTML(live, containerEl);
      else if (!stat) containerEl.innerHTML = '<div class="intel-error">' + _esc(_t('common.noData')) + '</div>';
    });
  } else if (!stat) {
    containerEl.innerHTML = '<div class="intel-error">' + _esc(_t('common.noData')) + '</div>';
  }
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
  // Clamp within the viewport so the dossier is never cut off (e.g. when
  // anchored near the centre of a narrow screen, or opened from search).
  left = Math.max(10, Math.min(left, window.innerWidth - W - 10));
  top = Math.max(tbH, top);
  top = Math.min(window.innerHeight - H - 10, top);
  top = Math.max(10, top);
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
  // Hide the floating language control while an info window is open so it is
  // never occluded by (or overlapping) the window.
  document.body.classList.add('na-tt-open');
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
  document.body.classList.remove('na-tt-open');
}

// ─── Holiday Markers ──────────────────────────────────────────────────────────
function _clearHolidayMarkers() {
  _holidayMarkers.forEach(m => m.remove());
  _holidayMarkers = [];
}

function _buildHolidayTooltip(iso2, month, holidays, events) {
  const mName = ['January','February','March','April','May','June','July','August','September','October','November','December'][month];
  const cName = (typeof countryNames !== 'undefined' && countryNames[iso2]) || iso2;
  const row = txt =>
    `<div style="font-size:9px;color:#1a1a1a;padding:3px 0;border-bottom:1px solid rgba(0,0,0,0.06)">${txt}</div>`;
  let body = '';
  if (events && events.length)   body += `<div class="ttln">FESTIVALS &amp; EVENTS</div>${events.map(row).join('')}`;
  if (holidays && holidays.length) body += `<div class="ttln">PUBLIC HOLIDAYS</div>${holidays.map(row).join('')}`;
  return `<div class="tth"><h3 id="tt-name">${cName}</h3>
    <div class="ts" id="tt-sub">🎉 EVENTS &amp; HOLIDAYS</div>
    <div class="tm" id="tt-period">${mName.toUpperCase()}</div></div>
    <div class="ttb" id="tt-body">${body}</div>`;
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

  // Union of every country that has a holiday OR a festival/event this month.
  const EV = (typeof COUNTRY_EVENTS !== 'undefined') ? COUNTRY_EVENTS : {};
  const isoCodes = new Set([...Object.keys(COUNTRY_HOLIDAYS), ...Object.keys(EV)]);

  isoCodes.forEach(iso2 => {
    const hols = [], evs = [];
    months.forEach(m => {
      const hl = COUNTRY_HOLIDAYS[iso2] && COUNTRY_HOLIDAYS[iso2][m];
      if (hl && hl.length) hols.push(...hl);
      const el = EV[iso2] && EV[iso2][m];
      if (el && el.length) evs.push(...el);
    });
    const count = hols.length + evs.length;
    if (!count) return;
    const c = centroids[iso2];
    if (!c) return;

    // Emoji glyph marker: festival 🎉 when an event is on, otherwise the holiday
    // calendar 🗓. A red badge shows how many things are happening this month.
    const hasFest = evs.length > 0;
    const html = '<div class="na-event-glyph' + (hasFest ? ' has-fest' : '') + '">'
      + '<span class="na-event-sym">' + (hasFest ? '🎉' : '🗓') + '</span>'
      + (count > 1 ? '<span class="na-event-count">' + count + '</span>' : '')
      + '</div>';
    const icon = L.divIcon({ className: 'na-event-divicon', html, iconSize: [30, 30], iconAnchor: [15, 15] });
    const marker = L.marker([c.lat, c.lng], {
      pane: 'markersPane', icon, keyboard: false,
      title: count + (count === 1 ? ' event' : ' events') + ' this month',
    });
    marker.on('click', ev => {
      _featureClicked = true;
      const activeM = months[0] !== undefined ? months[0] : activeMonth;
      toggleTooltip(
        'holiday:' + iso2 + ':' + activeM,
        _buildHolidayTooltip(iso2, activeM, hols, evs),
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
    // Clean open: activeLayers is intentionally NOT seeded from localStorage, so a
    // bare visit always opens on clean satellite. The choropleth colors only when
    // the user chooses a layer, or when a shared URL hash restores one (see
    // initURLState). Month, nationality, units and basemap still persist.
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
  localStorage.setItem('na_temp', _tempUnit);
  if (typeof window !== 'undefined') window._tempUnit = _tempUnit;
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

// ─── Master unit system (temperature + distance + elevation together) ───────────
// A single control in the dossier flips every measurement between metric and
// imperial, persists each unit, syncs the in-page/preferences toggles, and
// re-renders the open dossier so climate, distances and elevation all update.
function _unitsAreImperial() { return _tempUnit === 'F'; }
function na_setUnitSystem(sys) {
  var imp = (sys === 'imperial');
  _tempUnit = imp ? 'F'  : 'C';
  _distUnit = imp ? 'mi' : 'km';
  _elevUnit = imp ? 'ft' : 'm';
  try {
    localStorage.setItem('na_temp', _tempUnit);
    localStorage.setItem('na_dist', _distUnit);
    localStorage.setItem('na_elev', _elevUnit);
  } catch (_e) {}
  if (typeof window !== 'undefined') { window._tempUnit = _tempUnit; window._distUnit = _distUnit; window._elevUnit = _elevUnit; }
  var distBtn = document.getElementById('btn-dist-unit');
  if (distBtn) distBtn.textContent = _distUnit;
  if (typeof na_syncPrefsUI === 'function') { try { na_syncPrefsUI(); } catch (_e) {} }
  _rerenderActiveDossier();
}
function na_toggleUnitSystem() { na_setUnitSystem(_unitsAreImperial() ? 'metric' : 'imperial'); }

// Convert a metre value to the active elevation unit, formatted with a label.
function fmtElev(m) {
  if (m === null || m === undefined || isNaN(m)) return '';
  return _elevUnit === 'ft' ? (Math.round(m * 3.28084).toLocaleString() + ' ft')
                            : (Math.round(m).toLocaleString() + ' m');
}

// Rebuild the currently-open dossier in place (used after a unit-system change).
function _rerenderActiveDossier() {
  var key = (typeof _activeTooltipKey !== 'undefined') ? _activeTooltipKey : null;
  var tt  = document.getElementById('tt');
  if (!key || !tt || tt.style.display === 'none') return;
  var html = null;
  try {
    if (key.indexOf('country:') === 0 && typeof buildCountryTooltip === 'function') {
      html = buildCountryTooltip(key.slice('country:'.length));
    }
  } catch (_e) { html = null; }
  if (html && typeof showTooltip === 'function') showTooltip(html);
  // Re-inject the live current-conditions weather row (lost on rebuild) so it
  // re-appears in the newly chosen unit.
  if (html && key.indexOf('country:') === 0) {
    var iso = key.slice('country:'.length);
    var c = (typeof COUNTRY_CENTERS !== 'undefined') ? COUNTRY_CENTERS[iso] : null;
    if (c && typeof _injectWeatherRow === 'function') { try { _injectWeatherRow(iso, c[0], c[1]); } catch (_e) {} }
  }
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
  // Convert for display; bar heights/colours stay on the raw Celsius scale.
  var _impSC = (typeof _tempUnit !== 'undefined' && _tempUnit === 'F');
  var _scT = function (c) { return _impSC ? Math.round(c * 9 / 5 + 32) : c; };
  var _scU = _impSC ? '°F' : '°C';
  var mn = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  var bars = temps.map(function(t,i) {
    if (t == null) return '<div style="flex:1"></div>';
    var pct = Math.round(((t-minT)/rng)*100);
    var col = t > 25 ? '#ef4444' : t > 15 ? '#fbbf24' : t > 5 ? '#22d3ee' : '#818cf8';
    var h = Math.max(4, Math.round(pct * 0.36));
    var active = (i === activeMonth) ? 'box-shadow:0 0 4px ' + col + ';outline:1px solid ' + col + ';outline-offset:1px;' : '';
    return '<div style="display:flex;flex-direction:column;align-items:center;flex:1;cursor:default" title="' + mn[i] + ': ' + _scT(t) + _scU + '">' +
      '<div style="font-size:6.5px;color:var(--dim);margin-bottom:1px">' + _scT(t) + '°</div>' +
      '<div style="width:8px;height:' + h + 'px;background:' + col + ';border-radius:2px 2px 0 0;' + active + '"></div>' +
      '<div style="font-size:5.5px;color:var(--dim);margin-top:2px">' + mn[i] + '</div>' +
      '</div>';
  }).join('');
  return '<div style="margin-top:8px;padding:6px;background:rgba(255,255,255,0.03);border-radius:6px;border:1px solid rgba(255,255,255,0.06)">' +
    '<div style="font-size:7.5px;color:var(--dim);margin-bottom:6px">📅 Temperature year-round (click month bar to filter)</div>' +
    '<div style="display:flex;align-items:flex-end;height:52px;gap:1px">' + bars + '</div>' +
    '<div style="display:flex;justify-content:space-between;margin-top:4px">' +
    '<span style="font-size:7px;color:var(--dim)">❄️ ' + _scT(minT) + _scU + '</span>' +
    '<span style="font-size:7px;color:var(--dim)">☀️ ' + _scT(maxT) + _scU + '</span></div>' +
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

// "Plan / Book" deep-links — built entirely from data already held (name + coords +
// active month), opening in a new tab with NO API keys. Turns the atlas into a tool a
// traveller can act on. Providers: Google Flights, Booking, Rome2Rio, Google Maps,
// GetYourGuide. Month is woven into the flights query when available.
function _buildPlanBook(label, lat, lng) {
  if (!label) return '';
  var monthName = (typeof MONTHS_F !== 'undefined' && typeof activeMonth !== 'undefined' && MONTHS_F[activeMonth]) ? (' in ' + MONTHS_F[activeMonth]) : '';
  var q = encodeURIComponent(label);
  var coord = (typeof lat === 'number' && typeof lng === 'number') ? (lat + ',' + lng) : '';
  var links = [
    ['✈', 'Flights', 'https://www.google.com/travel/flights?q=' + encodeURIComponent('Flights to ' + label + monthName)],
    ['🛏', 'Stays', 'https://www.booking.com/searchresults.html?ss=' + q],
    ['🧭', 'Routes', 'https://www.rome2rio.com/map/' + q],
    ['🗺', 'Map', 'https://www.google.com/maps/search/?api=1&query=' + (coord || q)],
    ['🎟', 'Tours', 'https://www.getyourguide.com/s/?q=' + q],
  ];
  var btns = links.map(function (l) {
    return '<a class="pb-link" href="' + l[2] + '" target="_blank" rel="noopener noreferrer" title="' + l[1] + ' — ' + _esc(label) + '"><span class="pb-ic" aria-hidden="true">' + l[0] + '</span>' + l[1] + '</a>';
  }).join('');
  return '<div class="pb-section"><div class="pb-title">Plan / Book</div><div class="pb-links">' + btns + '</div></div>';
}

// ─── Enriched country dossier sections (always rendered, layer-independent) ─────
function _fmtPop(n) {
  if (typeof n !== 'number' || !isFinite(n)) return null;
  if (n >= 1e9) return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return Math.round(n / 1e3) + 'K';
  return String(n);
}

// "At a glance" fact grid: capital, population, currency, languages, power,
// calling code, driving side, region. Renders any subset that has data.
function buildCountryFactsSection(iso2) {
  var F   = (typeof COUNTRY_FACTS   !== 'undefined') ? COUNTRY_FACTS[iso2]   : null;
  var cap = (typeof COUNTRY_CAPITALS !== 'undefined') ? COUNTRY_CAPITALS[iso2] : null;
  if (!F && !cap) return '';
  F = F || {};
  function fact(ico, label, val, title) {
    if (val === null || val === undefined || val === '') return '';
    var t = title ? ' title="' + _esc(title) + '"' : '';
    return '<div class="na-fact"' + t + '><span class="na-fact-ico">' + ico + '</span>' +
      '<span class="na-fact-body"><span class="na-fact-label">' + label + '</span>' +
      '<span class="na-fact-val">' + val + '</span></span></div>';
  }
  var popVal = (typeof F.pop === 'number') ? _fmtPop(F.pop) : null;
  var popTitle = (typeof F.pop === 'number') ? (F.pop.toLocaleString() + (F.popYear ? ' (' + F.popYear + ')' : '')) : '';
  var popStr = popVal ? (popVal + (F.popYear ? ' <span class="na-fact-sub">' + F.popYear + '</span>' : '')) : null;
  var curStr = (F.cur && F.cur.code)
    ? (_esc(F.cur.sym || '') + ' ' + _esc(F.cur.code) + (F.cur.name ? ' <span class="na-fact-sub">' + _esc(F.cur.name) + '</span>' : ''))
    : ((typeof CURRENCY !== 'undefined' && CURRENCY[iso2]) ? _esc(CURRENCY[iso2]) : null);
  var langStr  = (F.langs && F.langs.length) ? _esc(F.langs.join(', ')) : null;
  var plugStr  = (F.plugs && F.plugs.length)
    ? ('Type ' + F.plugs.map(_esc).join(' / ') + (F.volt ? ' <span class="na-fact-sub">' + _esc(F.volt) + (F.freq ? ' ' + _esc(F.freq) : '') + '</span>' : ''))
    : null;
  var driveStr = F.drive ? (F.drive === 'left' ? 'Left-hand' : 'Right-hand') : null;
  var callStr  = F.call ? _esc(F.call) : null;
  var grid = fact('🏛', _esc(_t('doss.capital')), cap ? _esc(cap) : null)
    + fact('👥', _esc(_t('doss.population')), popStr, popTitle)
    + fact('💱', _esc(_t('doss.currency')), curStr)
    + fact('🗣️', _esc(_t('doss.languages')), langStr)
    + fact('🔌', _esc(_t('doss.power')), plugStr)
    + fact('📞', _esc(_t('doss.calling')), callStr)
    + fact('🚗', _esc(_t('doss.driving')), driveStr)
    + fact('🧭', _esc(_t('doss.region')), F.region ? _esc(F.region) : null);
  if (!grid) return '';
  return '<div class="na-facts"><div class="na-facts-grid">' + grid + '</div></div>';
}

// Prominent emergency-numbers band (safety-critical, visually distinct).
function buildEmergencySection(iso2) {
  var F = (typeof COUNTRY_FACTS !== 'undefined') ? COUNTRY_FACTS[iso2] : null;
  if (!F || !F.emerg) return '';
  var e = F.emerg, items = [];
  if (e.all)    items.push(['General', e.all]);
  if (e.police) items.push(['Police', e.police]);
  if (e.amb)    items.push(['Ambulance', e.amb]);
  if (e.fire)   items.push(['Fire', e.fire]);
  if (!items.length) return '';
  var chips = items.map(function (it) {
    return '<span class="na-emg-chip"><span class="na-emg-k">' + _esc(it[0]) + '</span><span class="na-emg-n">' + _esc(it[1]) + '</span></span>';
  }).join('');
  return '<div class="na-emergency"><span class="na-emg-ico">🆘</span><div class="na-emg-body">' +
    '<div class="na-emg-chips">' + chips + '</div></div></div>';
}

// Brief, neutral country history.
function buildHistorySection(iso2) {
  var F = (typeof COUNTRY_FACTS !== 'undefined') ? COUNTRY_FACTS[iso2] : null;
  if (!F || !F.hist) return '';
  return '<div class="na-history"><p class="na-history-p">' + _esc(F.hist) + '</p></div>';
}

// Additional traveler dossier content (tap water, etiquette, getting around,
// connectivity, money & payments). Renders only when COUNTRY_EXTRA is present.
function buildExtraSection(iso2) {
  if (typeof COUNTRY_EXTRA === 'undefined' || !COUNTRY_EXTRA[iso2]) return '';
  var E = COUNTRY_EXTRA[iso2];
  var h = '';
  if (E.tapWater && E.tapWater.status) {
    var st = E.tapWater.status;
    var cls = st === 'safe' ? 'tw-safe' : (st === 'caution' ? 'tw-caution' : 'tw-unsafe');
    var ico = st === 'safe' ? '✓' : (st === 'caution' ? '!' : '✕');
    h += '<div class="na-extra-tap ' + cls + '"><span class="na-extra-ico" aria-hidden="true">🚰</span>' +
         '<div class="na-extra-tc"><div class="na-extra-h">' + _esc(_t('doss.tapwater')) +
         ' <span class="tw-badge">' + ico + ' ' + _esc(st) + '</span></div>' +
         '<div class="na-extra-p">' + _esc(E.tapWater.note || '') + '</div></div></div>';
  }
  function block(key, icon, inner) {
    return '<div class="na-extra-block"><div class="na-extra-h">' + icon + ' ' + _esc(_t(key)) + '</div>' +
           '<div class="na-extra-p">' + inner + '</div></div>';
  }
  var blocks = '';
  if (E.etiquette && E.etiquette.length) {
    blocks += block('doss.etiquette', '🤝', '<ul class="na-extra-ul">' +
      E.etiquette.map(function (x) { return '<li>' + _esc(x) + '</li>'; }).join('') + '</ul>');
  }
  if (E.transport)     blocks += block('doss.transport', '🚕', _esc(E.transport));
  if (E.connectivity)  blocks += block('doss.connectivity', '📶', _esc(E.connectivity));
  if (E.payments)      blocks += block('doss.payments', '💳', _esc(E.payments));
  if (blocks) h += '<div class="na-extra-grid">' + blocks + '</div>';
  return h ? '<div class="na-extra-wrap">' + h + '</div>' : '';
}

// Resolve a country's primary language to a PHRASES_BY_LANG key.
function _phraseLangFor(iso2) {
  var F = (typeof COUNTRY_FACTS !== 'undefined') ? COUNTRY_FACTS[iso2] : null;
  if (!F || !F.langs || !F.langs.length || typeof PHRASES_BY_LANG === 'undefined') return null;
  var SYN = {
    'Mandarin': 'Mandarin Chinese', 'Chinese': 'Mandarin Chinese', 'Cantonese': 'Mandarin Chinese',
    'Farsi': 'Persian (Farsi)', 'Persian': 'Persian (Farsi)', 'Dari': 'Persian (Farsi)',
    'Tagalog': 'Filipino (Tagalog)', 'Filipino': 'Filipino (Tagalog)',
    'Castilian': 'Spanish', 'Serbian': 'Serbian/Croatian', 'Croatian': 'Serbian/Croatian',
    'Bosnian': 'Serbian/Croatian', 'Montenegrin': 'Serbian/Croatian',
  };
  for (var i = 0; i < F.langs.length; i++) {
    var L = F.langs[i];
    if (PHRASES_BY_LANG[L]) return L;
    if (SYN[L] && PHRASES_BY_LANG[SYN[L]]) return SYN[L];
  }
  return null;
}

// Traveler phrasebook for the country's primary language: 5 essential phrases
// up-front, the rest plus numbers in an expandable section.
function buildPhrasebookSection(iso2) {
  var lang = _phraseLangFor(iso2);
  if (!lang) return '';
  var P = PHRASES_BY_LANG[lang];
  if (!P || !P.phrases || !P.phrases.length) return '';
  function row(p) {
    return '<tr><td class="na-ph-en">' + _esc(p.en || '') + '</td><td class="na-ph-loc">' +
      _esc(p.loc || '') + (p.pron ? ' <span class="na-ph-pron">' + _esc(p.pron) + '</span>' : '') + '</td></tr>';
  }
  var preview = P.phrases.slice(0, 5).map(row).join('');
  var rest    = P.phrases.slice(5).map(row).join('');
  var nums = (P.numbers && P.numbers.length)
    ? '<div class="na-ph-nums-h">Numbers</div><div class="na-ph-nums">' + P.numbers.map(function (n) {
        return '<span class="na-ph-num"><b>' + _esc(String(n.n)) + '</b> ' + _esc(n.loc || '') +
          (n.pron ? ' <span class="na-ph-pron">' + _esc(n.pron) + '</span>' : '') + '</span>';
      }).join('') + '</div>'
    : '';
  var nativeName = P.native ? ' <span class="na-ph-native">' + _esc(P.native) + '</span>' : '';
  return '<div class="na-phrasebook"><div class="na-ph-lang">' + _esc(lang) + nativeName + '</div>' +
    '<table class="na-ph-table"><tbody>' + preview + '</tbody></table>' +
    ((rest || nums)
      ? '<details class="na-ph-more"><summary>More phrases &amp; numbers</summary>' +
        (rest ? '<table class="na-ph-table"><tbody>' + rest + '</tbody></table>' : '') + nums + '</details>'
      : '') +
    '</div>';
}

// Wrap a country-info section in a uniform, collapsible <details> shell with a
// translated header and a chevron. Empty sections render nothing. All sections
// default to open; the user can minimise/maximise each one independently.
function _dsec(titleKey, inner, opts) {
  if (!inner) return '';
  opts = opts || {};
  var open = (opts.open === false) ? '' : ' open';
  var cls = 'na-dsec' + (opts.cls ? ' ' + opts.cls : '');
  return '<details class="' + cls + '"' + open + '>' +
    '<summary class="na-dsec-h"><span class="na-dsec-t">' + _esc(_t(titleKey)) + '</span>' +
    '<svg class="na-dsec-x" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6,9 12,15 18,9" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
    '</summary><div class="na-dsec-b">' + inner + '</div></details>';
}

function buildCountryTooltip(iso2) {
  // Enriched dossier renders ALWAYS — country facts, history and phrasebook show
  // even with no active layer; only the per-layer rows/sections gate on activeLayers.
  // Robust name: countryNames is missing a few entries (e.g. FR) — fall back to
  // COUNTRY_NAMES so the title and Plan/Book links read the real country name.
  const name = countryNames[iso2] || (typeof COUNTRY_NAMES !== 'undefined' && COUNTRY_NAMES[iso2]) || iso2;
  const _cc = (typeof COUNTRY_CENTERS !== 'undefined' && COUNTRY_CENTERS[iso2]) || null;
  const curr = (typeof CURRENCY !== 'undefined' && CURRENCY[iso2]) ? ` <span style="font-size:9px;color:var(--gold);font-weight:400;letter-spacing:1px">${CURRENCY[iso2]}</span>` : '';
  // Per-layer rows only when a layer is active; the enriched facts/history/
  // phrasebook below carry the dossier in clean-open (no-layer) mode.
  const rows = (activeLayers.size > 0)
    ? (CD[iso2] ? buildLayerRows(CD[iso2], {iso2}) : '<div style="color:#5a4a20;font-size:8px;padding:4px 0">No data available for this territory.</div>')
    : '';
  const costSection    = buildCostDetailsSection(iso2);
  const healthSection  = buildHealthSection(iso2);
  const climateSection = buildClimateWheelSection(iso2);
  const safetySection  = buildSafetySection(iso2);
  const visaSection    = buildVisaSection(iso2);
  const tippingSection  = activeLayers.has('tipping') ? _buildTippingTooltip(iso2) : '';
  const languageSection = buildLanguageSection(iso2);
  const factsSection     = (typeof buildCountryFactsSection === 'function') ? buildCountryFactsSection(iso2) : '';
  const emergencySection = (typeof buildEmergencySection === 'function') ? buildEmergencySection(iso2) : '';
  const historySection   = (typeof buildHistorySection === 'function') ? buildHistorySection(iso2) : '';
  const extraSection      = (typeof buildExtraSection === 'function') ? buildExtraSection(iso2) : '';
  const phrasebookSection = (typeof buildPhrasebookSection === 'function') ? buildPhrasebookSection(iso2) : '';
  const unitToggle = `<button class="na-unit-master" onclick="na_toggleUnitSystem()" title="Toggle all units — temperature, distance, elevation">${(typeof _unitsAreImperial === 'function' && _unitsAreImperial()) ? '°F · mi' : '°C · km'}</button>`;
  const tzSection      = buildTimezoneSection(iso2);
  const holSection     = buildHolidaysSection(iso2);
  const journalSection = buildJournalSection(iso2);
  const isPinned    = pinnedCountries.includes(iso2);
  const _escName    = String(name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  // Action cluster lives at the bottom-right of the dossier header: Compare,
  // Wishlist, and Add-to-trip (drops a trip-planner pin at the country centre).
  const headerActions = `<div class="tt-head-actions">
    <button class="tt-hact tt-pin-btn${isPinned ? ' pinned' : ''}" data-iso2="${iso2}" title="${_esc(_t('act.compare'))}" aria-label="${_esc(_t('act.compare'))}" aria-pressed="${isPinned ? 'true' : 'false'}" onclick="togglePinCountry('${iso2}')">&#x21C4;</button>
    <button class="tt-hact tt-wish${_wishlist.has(iso2) ? ' on' : ''}" id="btn-wishlist-${iso2}" title="${_esc(_t('act.wishlist'))}" aria-label="${_esc(_t('act.wishlist'))}" aria-pressed="${_wishlist.has(iso2) ? 'true' : 'false'}">${_wishlist.has(iso2) ? '♥' : '♡'}</button>
    <button class="tt-hact" title="${_esc(_t('act.addPin'))}" aria-label="${_esc(_t('act.addPin'))}" onclick="(function(){var c=(typeof COUNTRY_CENTERS!=='undefined')&&COUNTRY_CENTERS['${iso2}'];if(c&&typeof _placeTripPinAt==='function'){_placeTripPinAt(c[0],c[1],'${_escName}');if(typeof showToast==='function')showToast('📍 '+'${_escName}'+' — added to your trip');}})()">📍</button>
  </div>`;
  const pinSection = '';
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
    ${unitToggle}
    <h3 id="tt-name">${_countryFlag(iso2) ? _countryFlag(iso2) + ' ' : ''}${_esc(name)}${curr}</h3>
    <div class="ts" id="tt-sub">${iso2}</div>
    <div class="tm" id="tt-period">${periodLabel()}</div>
    ${scoreChip}
    ${bestTimeLine}
    ${headerActions}
  </div>${ctxBand}
  <div class="ttb" id="tt-body">${_dsec('doss.glance', factsSection)}${_dsec('doss.emergency', emergencySection, {cls:'na-dsec-emg'})}${rows ? _dsec('doss.layers', rows) : ''}${_dsec('doss.cost', costSection)}${_dsec('doss.health', healthSection)}${_dsec('doss.language', languageSection)}${_dsec('doss.climate', climateSection)}${_dsec('doss.safety', safetySection)}${_dsec('doss.tipping', tippingSection)}${_dsec('doss.visa', visaSection)}${_dsec('doss.timezone', tzSection)}${_dsec('doss.holidays', holSection)}${_dsec('doss.history', historySection)}${_dsec('doss.goodToKnow', extraSection)}${_dsec('doss.phrasebook', phrasebookSection)}${_dsec('doss.journal', journalSection)}${visitedBtn}
  ${_dsec('intel.title', '<div id="intel-' + _esc(iso2) + '" class="intel-container"></div>', {cls:'na-dsec-intel'})}
  ${_buildPlanBook(name, _cc && _cc[0], _cc && _cc[1])}
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
  <div class="ttb" id="tt-body">${rows}${_buildPlanBook(city.name, city.lat, city.lng)}</div>`;
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
  // Combined View: explain the on-map enamel chips so the multi-layer glyphs are discoverable.
  if (geoLayers.length > 1) {
    html += `<div class="legend-glyph-hint" style="font-size:8.5px;line-height:1.35;color:var(--na-text-secondary,#a89060);padding:2px 0 6px;letter-spacing:.2px">Each country shows one chip per layer — the chip colour is that layer's score (green → red). Zoom in to reveal them.</div>`;
  }
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
    // Tile-overlay layers (e.g. elevation/terrain) have no 0–3 score ramp, so
    // `levels` is undefined. Show a single descriptive row instead of crashing
    // updateLegend() — which previously aborted the whole refresh() (no markers,
    // no overlay) the moment such a layer became active.
    if (!lyrLabels) {
      const nm = (layer && (layer.name || layer.label)) || key;
      html += `<div class="ll"><div class="lr"><span class="llabel">${nm} — map overlay</span></div></div>`;
      return;
    }
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
  renderLayerGlyphs();
  renderBorderMarkers();
  renderBeachMarkers();
  renderPoliticalLayers();
  updateBestPanel();
  renderEventMarkers();
  // Keep the sidebar/sheet layer-item active states in sync without idle polling.
  if (typeof na_updateLayerActiveStates === 'function') na_updateLayerActiveStates();
  // Re-evaluate the live crime overlay (no-op unless Safety is active and zoomed in).
  if (typeof _renderLiveCrime === 'function') _renderLiveCrime();
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
    renderLayerGlyphs();
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

// EU / EEA / Schengen passports share near-identical visa access: they inherit
// Germany's VISA_DATA column wherever no country-specific column exists, and travel
// visa-free within the Schengen/EU area. South-Korean and Singaporean passports are
// as strong as Japan's and inherit Japan's column. This lets the nationality list
// cover many more passports accurately without duplicating every VISA_DATA cell.
const EU_PASSPORTS = new Set(['DE','FR','IT','ES','NL','PT','GR','IE','PL','CZ','AT','BE','SE','DK','FI','NO','CH','RO','HU','SK','SI','HR','EE','LV','LT','LU','MT','CY','BG','IS','LI']);
const SCHENGEN_AREA = ['DE','ES','FR','IT','GR','PT','AT','BE','NL','LU','DK','FI','SE','IE','PL','CZ','SK','HU','SI','HR','EE','LV','LT','MT','CY','NO','IS','CH','LI','RO','BG'];
const STRONG_ASIA_PASSPORTS = new Set(['JP','KR','SG']);

// Resolve the effective VISA_DATA entry for a destination + passport, applying the
// EU→Germany and KR/SG→Japan inheritance described above. Single source of truth so
// the choropleth rating and the tooltip detail can never disagree.
function _resolveVisaEntry(destIso2, passport) {
  const dest = (typeof VISA_DATA !== 'undefined') ? VISA_DATA[destIso2] : null;
  if (!dest) return null;
  let entry = dest[passport];
  if (!entry && EU_PASSPORTS.has(passport)) entry = dest['DE'];
  if (!entry && STRONG_ASIA_PASSPORTS.has(passport)) entry = dest['JP'];
  return entry || null;
}

function getVisaRating(destIso2, passport) {
  if (!passport || !destIso2) return null;
  // Visiting your own country / your own bloc
  if (destIso2 === passport) return null;
  if (EU_PASSPORTS.has(passport) && SCHENGEN_AREA.indexOf(destIso2) !== -1) return null;
  if (typeof VISA_DATA === 'undefined' || !VISA_DATA[destIso2]) return 2;  // unknown — assume visa required
  const entry = _resolveVisaEntry(destIso2, passport);
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
    return needsPassport
      ? `<div style="margin-top:6px;padding-top:7px;border-top:1px solid rgba(201,168,76,0.10);font-size:7.5px;color:rgba(201,168,76,0.6)">
           ✈ Select your passport in the menu to see passport strength &amp; visa requirements.
         </div>`
      : '';
  }

  const dest = typeof VISA_DATA !== 'undefined' ? VISA_DATA[iso2] : null;
  if (!dest) return '';

  const entry = _resolveVisaEntry(iso2, selectedNationality);
  const isSelf = iso2 === selectedNationality ||
    (EU_PASSPORTS.has(selectedNationality) && SCHENGEN_AREA.indexOf(iso2) !== -1);

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

  // Passport coverage bar
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

  // Passport Rank widget
  let passportRankHtml = '';
  if (
    typeof selectedNationality !== 'undefined' &&
    selectedNationality &&
    typeof VISA_DATA !== 'undefined' &&
    typeof PASSPORT_NATIONALITIES !== 'undefined'
  ) {
    const passportCodes = Object.keys(PASSPORT_NATIONALITIES);
    const allDests = Object.keys(VISA_DATA);
    const M = allDests.length;

    // Count free+eta destinations for a given passport code
    function countFreeEta(passCode) {
      let count = 0;
      allDests.forEach(function(d) {
        const row = VISA_DATA[d];
        if (row && typeof row[passCode] !== 'undefined') {
          const t = row[passCode].t;
          if (t === 'free' || t === 'eta') count++;
        }
      });
      return count;
    }

    const selfCount = countFreeEta(selectedNationality);

    // Compute scores for all 12 passports
    const scores = passportCodes.map(function(code) {
      return { code: code, count: countFreeEta(code) };
    });
    scores.sort(function(a, b) { return b.count - a.count; });

    // Find rank (1-based) of selectedNationality
    let rankPos = -1;
    for (let i = 0; i < scores.length; i++) {
      if (scores[i].code === selectedNationality) { rankPos = i + 1; break; }
    }

    if (rankPos > 0) {
      const totalPassports = passportCodes.length;
      const betterThan = totalPassports - rankPos;
      const weakerThan = rankPos - 1;
      const fillPct = M > 0 ? Math.round((selfCount / M) * 100) : 0;

      passportRankHtml = `
        <div class="tt-passport-rank" style="margin-top:7px;padding:8px;border:1px solid rgba(201,168,76,0.2);border-radius:4px">
          <div style="font-size:6.5px;color:#c9a84c;letter-spacing:1.6px;text-transform:small-caps;font-variant:small-caps;margin-bottom:5px">YOUR PASSPORT — GLOBAL REACH</div>
          <div style="font-size:8px;color:#a0b080;margin-bottom:4px">Visa-free access to <strong style="color:#c9a84c">${selfCount}</strong> of <strong>${M}</strong> destinations tracked</div>
          <div class="tt-passport-rank-bar" style="height:5px;border-radius:2px;background:rgba(255,255,255,0.08);overflow:hidden;margin-bottom:5px">
            <div class="tt-passport-rank-fill" style="height:100%;width:${fillPct}%;background:#c9a84c;border-radius:2px"></div>
          </div>
          <div style="font-size:8px;color:#a0b080;margin-bottom:2px">Rank <strong style="color:#c9a84c">${rankPos}</strong> of ${totalPassports} tracked passports</div>
          <div style="font-size:7.5px;color:#6a7a5a">Better than <strong>${betterThan}</strong> passport${betterThan !== 1 ? 's' : ''} &nbsp;/&nbsp; Weaker than <strong>${weakerThan}</strong> passport${weakerThan !== 1 ? 's' : ''}</div>
        </div>`;
    }
  }

  // Entry denied block
  let entryDeniedHtml = '';
  if (
    typeof VISA_DATA !== 'undefined' &&
    VISA_DATA[iso2] &&
    typeof selectedNationality !== 'undefined' &&
    selectedNationality &&
    VISA_DATA[iso2][selectedNationality] &&
    VISA_DATA[iso2][selectedNationality].t === 'banned'
  ) {
    entryDeniedHtml = `
      <div class="tt-entry-denied" style="margin-top:7px;padding:8px;border-left:3px solid #C62828;background:rgba(198,40,40,0.08)">
        <div class="tt-entry-denied-title" style="font-size:8px;color:#C62828;text-transform:uppercase;font-weight:700;letter-spacing:1.4px;margin-bottom:4px">ENTRY DENIED</div>
        <div style="font-size:8px;color:#c08080;margin-bottom:3px">This destination does not permit entry to holders of this passport.</div>
        <div style="font-size:7.5px;color:#a06060">Do not attempt travel. Detention risk is real.</div>
      </div>`;
  }

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
    </div>${coverageHtml}${entryDeniedHtml}${passportRankHtml}
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

  // Three daily-budget tiers derived from the per-item costs.
  //  • Budget   — hostel + 3 street meals + local transport (backpacker)
  //  • Mid-range — 3-star stay, restaurant meals, some taxis, a coffee and a drink
  //  • Luxury    — 4–5-star stay, fine dining, private transport, drinks
  const budgetDay = (d.hostel || 0) + (d.meal || 0) * 3 + (d.transport || 0);
  const midDay    = Math.round((d.hostel || 0) * 2.6 + (d.meal || 0) * 2 * 3 + (d.transport || 0) * 1.6 + (d.coffee || 0) + (d.beer || 0));
  const luxDay    = Math.round((d.hostel || 0) * 6 + (d.meal || 0) * 4 * 3 + (d.transport || 0) * 3 + (d.coffee || 0) * 2 + (d.beer || 0) * 3);

  const tierCol = (label, val, rgb) =>
    `<div style="flex:1;text-align:center;padding:4px 0;background:rgba(${rgb},0.07);border-radius:5px;border:1px solid rgba(${rgb},0.16)">
        <div style="font-size:6.5px;color:rgba(${rgb},0.7);letter-spacing:0.6px;text-transform:uppercase">${_esc(label)}</div>
        <div style="font-size:clamp(10px,3vw,12.5px);font-weight:700;color:rgb(${rgb});white-space:nowrap" title="~${_money(val)}/day">~${_moneyCompact(val)}</div>
        <div style="font-size:6px;color:rgba(${rgb},0.5)">${_esc(_t('cost.perDay'))}</div>
      </div>`;

  // Compact always-visible summary card
  const compactCard = `<div style="margin-top:8px;padding:8px 10px;background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.14);border-radius:7px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <div style="font-size:6.5px;color:rgba(201,168,76,0.5);letter-spacing:1.6px;text-transform:uppercase">💰 ${_esc(_t('cost.dailyBudget'))}</div>
      ${curr ? `<div style="font-size:7px;font-weight:700;color:var(--gold);background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.25);border-radius:3px;padding:1px 6px;letter-spacing:0.8px">${_esc(curr)}</div>` : ''}
    </div>
    <div style="display:flex;gap:6px;margin-bottom:6px">
      ${tierCol(_t('cost.budget'), budgetDay, '74,222,128')}
      ${tierCol(_t('cost.mid'), midDay, '251,191,36')}
      ${tierCol(_t('cost.lux'), luxDay, '167,139,250')}
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

  // ── Vaccine block ────────────────────────────────────────────────────────────
  let vaccineBlock = '';
  if (typeof VACCINE_DATA !== 'undefined' && VACCINE_DATA.BY_COUNTRY && VACCINE_DATA.BY_COUNTRY[iso2]) {
    const vEntry = VACCINE_DATA.BY_COUNTRY[iso2];

    const requiredList = (Array.isArray(vEntry.required) && vEntry.required.length > 0)
      ? vEntry.required.map(v => `<span class="tt-vaccine-required" style="display:inline-block;padding:1px 5px;margin:1px 2px 1px 0;border-radius:3px;background:rgba(198,40,40,0.18);border:1px solid rgba(198,40,40,0.40);font-size:7px;color:#ef9a9a;font-weight:600">${_esc(v)}</span>`).join(' ')
      : `<span class="tt-vaccine-required" style="display:inline-block;padding:1px 5px;border-radius:3px;background:rgba(67,160,71,0.12);border:1px solid rgba(67,160,71,0.30);font-size:7px;color:#a5d6a7">None required for entry</span>`;

    const recommendedList = (Array.isArray(vEntry.recommended) && vEntry.recommended.length > 0)
      ? `<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:5px;flex-wrap:wrap">
          <div style="font-size:7.5px;color:rgba(232,213,163,0.7);flex-shrink:0;padding-top:2px">Recommended</div>
          <div style="flex:1">${vEntry.recommended.map(v => `<span class="tt-vaccine-recommended" style="display:inline-block;padding:1px 5px;margin:1px 2px 1px 0;border-radius:3px;background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.30);font-size:7px;color:#e8d5a3">${_esc(v)}</span>`).join(' ')}</div>
        </div>`
      : '';

    vaccineBlock = `<div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(201,168,76,0.08)">
      <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;font-variant:small-caps;text-transform:uppercase;margin-bottom:6px">Vaccinations</div>
      <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:5px;flex-wrap:wrap">
        <div style="font-size:7.5px;color:rgba(232,213,163,0.7);flex-shrink:0;padding-top:2px">Required</div>
        <div style="flex:1">${requiredList}</div>
      </div>
      ${recommendedList}
      <div style="margin-top:4px;font-size:7px;color:rgba(201,168,76,0.50);line-height:1.5">Consult a travel health clinic 4-6 weeks before departure.</div>
    </div>`;
  }

  // ── Altitude warning block ───────────────────────────────────────────────────
  let altitudeBlock = '';
  if (typeof ALTITUDE_DATA !== 'undefined' && ALTITUDE_DATA[iso2] != null && ALTITUDE_DATA[iso2] >= 2500) {
    const altM = ALTITUDE_DATA[iso2];
    const diamoxLine = (altM >= 3500)
      ? `<div style="margin-top:3px;font-size:7px;color:#ef9a9a;line-height:1.5">Consult a doctor about acetazolamide (Diamox) before travel.</div>`
      : '';

    altitudeBlock = `<div class="tt-altitude-warning" style="margin-top:7px;padding:5px 7px;background:rgba(198,40,40,0.09);border-left:3px solid #C62828;border-radius:0 4px 4px 0">
      <div style="font-size:7.5px;font-weight:700;color:#ef9a9a;letter-spacing:0.8px;text-transform:uppercase">HIGH ALTITUDE: ${_esc(String(altM))}m above sea level</div>
      <div style="margin-top:3px;font-size:7px;color:rgba(239,154,154,0.85);line-height:1.5">Risk of altitude sickness. Ascend gradually. Acclimatise before exertion.</div>
      ${diamoxLine}
    </div>`;
  }

  const advisory = `<div style="margin-top:6px;padding:4px 6px;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);border-radius:4px;font-size:7px;color:rgba(201,168,76,0.6);line-height:1.5">Always consult a travel health clinic 4–6 weeks before departure for current vaccination requirements.</div>`;

  return `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(201,168,76,0.10)">
    <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;margin-bottom:6px">🏥 HEALTH &amp; SAFETY ESSENTIALS</div>
    ${rows}${malariaWarn}${waterWarn}${advisory}${vaccineBlock}${altitudeBlock}
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

  // (The phrasebook now lives in its own always-on dossier section,
  // buildPhrasebookSection(), powered by PHRASES_BY_LANG — see buildCountryTooltip.)

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
  if (!Array.isArray(d.temp) || !Array.isArray(d.rain) || d.temp.length < 12 || d.rain.length < 12) return '';

  const temps = d.temp;
  const rains = d.rain;
  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // activeMonth is 1-indexed (Jan=1); fall back to current real month
  const activeMonth = (typeof window !== 'undefined' && window.activeMonth != null)
    ? window.activeMonth
    : (new Date().getMonth() + 1);
  const curMon = activeMonth - 1; // convert to 0-indexed

  // Temperature unit
  const useFahrenheit = (typeof window !== 'undefined' && window._tempUnit === 'F');
  function displayTemp(c) {
    if (useFahrenheit) return Math.round(c * 9 / 5 + 32) + '&deg;F';
    return c + '&deg;C';
  }
  function displayTempShort(c) {
    if (useFahrenheit) return Math.round(c * 9 / 5 + 32) + '&deg;';
    return c + '&deg;';
  }

  // Scale rain bars: max bar = 32px
  const maxRain = Math.max(...rains, 1);
  const BAR_MAX = 32;

  // --- ENHANCE 1: Best / Shoulder / Avoid computation ---
  // Percentile helpers
  const sortedRain = rains.slice().sort((a, b) => a - b);
  function percentileVal(arr, p) {
    const idx = (p / 100) * (arr.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return arr[lo];
    return arr[lo] + (arr[hi] - arr[lo]) * (idx - lo);
  }
  const rain35 = percentileVal(sortedRain, 35);
  const rain50 = percentileVal(sortedRain, 50);

  // Classify each month (use Celsius for classification regardless of display unit)
  const classification = rains.map((r, i) => {
    const t = temps[i];
    if (r <= rain35 && t >= 18 && t <= 30) return 'best';
    if (r <= rain50 && t >= 14 && t <= 33) return 'shoulder';
    return 'avoid';
  });

  // --- ENHANCE 3: Dry season summary ---
  const dryMonths = MONTH_SHORT.filter((_, i) => rains[i] < 30);
  const seasonLine = dryMonths.length > 0
    ? `DRY: ${dryMonths.join(' ')}`
    : 'YEAR-ROUND RAIN';

  // --- Build 12-column bar chart ---
  let bars = '';
  for (let i = 0; i < 12; i++) {
    const h = Math.max(2, Math.round((rains[i] / maxRain) * BAR_MAX));
    const isActive = (i === curMon);
    const border = isActive
      ? 'border:1px solid rgba(201,168,76,0.9);'
      : 'border:1px solid transparent;';

    // Temperature label colour
    const tempColor = isActive
      ? 'rgba(251,191,36,0.9)'
      : 'rgba(232,213,163,0.35)';

    // ENHANCE 2: NOW indicator — gold "v" above the active column
    const nowIndicator = isActive
      ? `<div style="font-size:7px;color:#c9a84c;text-align:center;line-height:1;margin-bottom:1px;font-weight:700">v</div>`
      : `<div style="font-size:7px;line-height:1;margin-bottom:1px">&nbsp;</div>`;

    const tempLabel = `<div style="font-size:6px;color:${tempColor};text-align:center;margin-bottom:1px">${displayTempShort(temps[i])}</div>`;

    bars += `<div style="display:flex;flex-direction:column;align-items:center;width:14px">
      ${nowIndicator}
      ${tempLabel}
      <div style="width:10px;height:${BAR_MAX}px;display:flex;align-items:flex-end;${border}border-radius:2px;box-sizing:border-box">
        <div style="width:100%;height:${h}px;background:rgba(56,189,248,0.6);border-radius:1px"></div>
      </div>
      <div style="font-size:5.5px;color:rgba(232,213,163,${isActive ? '0.9' : '0.4'});text-align:center;margin-top:2px;letter-spacing:0.3px">${MONTHS[i]}</div>
    </div>`;
  }

  // --- ENHANCE 1: Coloured month chips ---
  const chipColors = { best: '#c9a84c', shoulder: '#7a8a5a', avoid: 'rgba(232,213,163,0.15)' };
  const chipTextColors = { best: '#1a1710', shoulder: '#d4dcb8', avoid: 'rgba(232,213,163,0.35)' };

  let bestChips = '', shoulderChips = '', avoidChips = '';
  classification.forEach((cls, i) => {
    const chip = `<span style="display:inline-block;background:${chipColors[cls]};color:${chipTextColors[cls]};border-radius:2px;padding:1px 3px;font-size:5.5px;letter-spacing:0.4px;margin:1px 1px">${MONTHS[i]}</span>`;
    if (cls === 'best') bestChips += chip;
    else if (cls === 'shoulder') shoulderChips += chip;
    else avoidChips += chip;
  });

  const hasBest = bestChips.length > 0;
  const hasShoulder = shoulderChips.length > 0;
  const hasAvoid = avoidChips.length > 0;

  const labelStyle = 'font-size:5.5px;color:rgba(201,168,76,0.5);letter-spacing:0.8px;text-transform:uppercase;margin-right:3px;min-width:46px;display:inline-block';

  let chipsSection = `<div style="margin-top:6px;font-size:0;line-height:1.6">`;
  if (hasBest) {
    chipsSection += `<div style="display:flex;align-items:center;margin-bottom:2px"><span style="${labelStyle}">BEST</span>${bestChips}</div>`;
  }
  if (hasShoulder) {
    chipsSection += `<div style="display:flex;align-items:center;margin-bottom:2px"><span style="${labelStyle}">SHOULDER</span>${shoulderChips}</div>`;
  }
  if (hasAvoid) {
    chipsSection += `<div style="display:flex;align-items:center;margin-bottom:2px"><span style="${labelStyle}">AVOID</span>${avoidChips}</div>`;
  }
  chipsSection += `</div>`;

  // --- ENHANCE 3: Season summary line ---
  const seasonSummary = `<div style="margin-top:4px;font-size:6px;color:rgba(232,213,163,0.45);letter-spacing:0.8px">${seasonLine}</div>`;

  return `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(201,168,76,0.10)">
    <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;margin-bottom:6px">CLIMATE &middot; RAINFALL mm / TEMP ${useFahrenheit ? '&deg;F' : '&deg;C'}</div>
    <div style="display:flex;gap:1px;align-items:flex-end">${bars}</div>
    ${chipsSection}
    ${seasonSummary}
  </div>`;
}


// ─── Safety Section ──────────────────────────────────────────────────────────
// ETHICS-SIGN-OFF: Mandatory context tab — framing reviewed. No red-dominant palette.
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

  // Data reliability badge — derived from CD_SAFETY index value
  let reliabilityBadge = '';
  if (typeof CD_SAFETY !== 'undefined' && CD_SAFETY[iso2] != null) {
    const rv = CD_SAFETY[iso2];
    if (rv <= 1) {
      reliabilityBadge = `<span class="tt-safety-reliability high" style="font-size:7px;color:#43A047;background:rgba(67,160,71,0.10);border:1px solid rgba(67,160,71,0.25);border-radius:3px;padding:1px 5px;white-space:nowrap">Data: HIGH reliability</span>`;
    } else if (rv === 2) {
      reliabilityBadge = `<span class="tt-safety-reliability moderate" style="font-size:7px;color:#EF6C00;background:rgba(239,108,0,0.10);border:1px solid rgba(239,108,0,0.25);border-radius:3px;padding:1px 5px;white-space:nowrap">Data: MODERATE reliability</span>`;
    } else {
      reliabilityBadge = `<span class="tt-safety-reliability low" style="font-size:7px;color:rgba(232,213,163,0.65);background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.18);border-radius:3px;padding:1px 5px;white-space:nowrap">Data: LOW — conflict/authoritarian context</span>`;
    }
  }

  // Mandatory traveller advisory ethics context block
  const ethicsHtml = `<div class="tt-safety-ethics" style="margin-top:8px;padding:8px 10px;background:rgba(14,11,6,0.6);border-left:3px solid #c9a84c;border-radius:0 3px 3px 0">
    <div style="font-size:9px;color:rgba(201,168,76,0.75);letter-spacing:0.12em;text-transform:small-caps;font-variant:small-caps;margin-bottom:4px;font-weight:700">TRAVELLER ADVISORY</div>
    <div style="font-size:7.5px;color:rgba(232,213,163,0.65);line-height:1.5;margin-bottom:5px">Index-based estimates only. Always check your government travel advisory before travel.</div>
    <div style="font-size:7px;color:rgba(201,168,76,0.45);line-height:1.6">
      travel.state.gov &nbsp;/&nbsp; gov.uk/foreign-travel-advice &nbsp;/&nbsp; smartraveller.gov.au
    </div>
    ${reliabilityBadge ? `<div style="margin-top:5px">${reliabilityBadge}</div>` : ''}
  </div>`;

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
    ${ethicsHtml}
  </div>`;
}


// ─── Travel Journal Section ───────────────────────────────────────────────────
function buildJournalSection(iso2) {
  const note = _getNote(iso2);
  const noteHtml = note
    ? '<div style="font-size:8.5px;color:var(--sand);line-height:1.5;white-space:pre-wrap;padding:5px 7px;background:rgba(201,168,76,0.04);border-radius:4px;border:1px solid rgba(201,168,76,0.10)">' + _esc(note) + '</div>'
    : '<div style="font-size:7.5px;color:rgba(201,168,76,0.3);font-style:italic">No notes yet.</div>';
  const btnLabel = note ? 'Edit' : '+ Add Note';
  return '<div>' +
    '<div style="display:flex;align-items:center;justify-content:flex-end;margin-bottom:5px">' +
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
// When expanded, the panel auto-minimises after 3 seconds. It stays fully
// toggleable (maximise/minimise) at any time from the legend or the nav item.
var _bestAutoTimer = null;
function _clearBestAutoMinimize() { if (_bestAutoTimer) { clearTimeout(_bestAutoTimer); _bestAutoTimer = null; } }
function _armBestAutoMinimize() {
  _clearBestAutoMinimize();
  _bestAutoTimer = setTimeout(function () {
    var t = document.getElementById('best-toggle'), l = document.getElementById('best-panel-list');
    if (l) l.classList.remove('open');
    if (t) t.classList.remove('open');
    if (typeof _syncNavActive === 'function') _syncNavActive('bestmonth');
  }, 3000);
}
function initBestPanelToggle() {
  const toggle = document.getElementById('best-toggle');
  const list   = document.getElementById('best-panel-list');
  if (!toggle || !list) return;
  toggle.addEventListener('click', () => {
    const isOpen = list.classList.contains('open');
    list.classList.toggle('open', !isOpen);
    toggle.classList.toggle('open', !isOpen);
    if (!isOpen) _armBestAutoMinimize(); else _clearBestAutoMinimize();
    if (typeof _syncNavActive === 'function') _syncNavActive('bestmonth');
  });
}
// Expand Best This Month by default on first data load (then auto-minimise).
let _bestPanelDefaultExpanded = false;
function autoExpandBestPanel() {
  if (_bestPanelDefaultExpanded) return;
  const toggle = document.getElementById('best-toggle');
  const list   = document.getElementById('best-panel-list');
  if (!toggle || !list || toggle.style.display === 'none') return;
  list.classList.add('open');
  toggle.classList.add('open');
  _bestPanelDefaultExpanded = true;
  _armBestAutoMinimize();
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

// ─── Welcome Card ────────────────────────────────────────────────────────────
// Shown once to first-time visitors. Unlike the old "flash" hint, it PERSISTS
// until the traveller interacts with the site — any click, key press, or map
// gesture dismisses it. It also offers a guided walkthrough of the almanac.

// Wire the welcome card's single-flag language picker: one flag at the bottom-
// right that opens a dropdown of every language. Mirrors the floating language
// FAB pattern but is scoped to the card and re-translates it live on selection.
function _naWireHintFlag(card) {
  if (!card) return;
  var pick = card.querySelector('#na-hint-flagpick');
  if (!pick) return;
  var btn = pick.querySelector('.na-hint-flag-btn');
  var menu = pick.querySelector('.na-hint-flag-menu');
  if (!btn || !menu) return;
  var flagSpan = btn.querySelector('.na-lang-current-flag');

  function setFlag() {
    var m = (typeof _LANG_META !== 'undefined' && _LANG_META[_lang]) ? _LANG_META[_lang]
          : (typeof _LANG_META !== 'undefined' ? _LANG_META.en : null);
    if (flagSpan && m) flagSpan.textContent = m.flag;
  }
  function onDoc(e) { if (!pick.contains(e.target)) closeMenu(); }
  function onKey(e) { if (e.key === 'Escape') { closeMenu(); btn.focus(); } }
  function closeMenu() {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', onDoc, true);
    document.removeEventListener('keydown', onKey, true);
  }
  function openMenu() {
    menu.innerHTML = _LANG_KEYS.map(function (c) {
      var m = _LANG_META[c];
      return '<button type="button" role="menuitem" class="na-lang-opt' + (c === _lang ? ' active' : '') + '" data-lang="' + c + '" lang="' + c + '">' +
             '<span class="na-lang-flag" aria-hidden="true">' + m.flag + '</span>' +
             '<span class="na-lang-name">' + m.name + '</span></button>';
    }).join('');
    menu.querySelectorAll('.na-lang-opt').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        na_setLang(b.dataset.lang);
        setFlag();
        if (typeof na_applyI18n === 'function') { try { na_applyI18n(card); } catch (_e) {} }
        closeMenu();
      });
    });
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    setTimeout(function () {
      document.addEventListener('pointerdown', onDoc, true);
      document.addEventListener('keydown', onKey, true);
    }, 0);
  }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (menu.hidden) openMenu(); else closeMenu();
  });
  setFlag();
}

function showOnboardingHint() {
  try { if (localStorage.getItem('na_hint_seen')) return; } catch (_) {}
  if (document.getElementById('onboarding-hint')) return;
  const el = document.createElement('div');
  el.id = 'onboarding-hint';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Welcome to the Nomadic Almanac');
  el.innerHTML = `
    <p class="hint-title" data-i18n="welcome.title">Welcome to the Nomadic Almanac</p>
    <p data-i18n="welcome.body">Your interactive atlas of where to go and when. Tap any country to open its full travel guide — costs, safety, weather, visas, key phrases and more. Slide through the months to watch the seasons change, and switch on layers to compare the world your way.</p>
    <p class="hint-sub" data-i18n="welcome.sub">Tip: zoom in for province and county detail, and choose your passport to colour the map by visa access.</p>
    <div class="hint-actions">
      <button type="button" class="hint-btn primary" id="na-hint-tour" data-i18n="welcome.tour">Take the guided tour</button>
      <button type="button" class="hint-btn" id="na-hint-dismiss" data-i18n="welcome.explore">Explore on my own</button>
    </div>
    <div class="hint-links">
      <button type="button" class="hint-link" id="na-hint-tutorial" data-i18n="welcome.tutorial">How it works</button>
      <span class="hint-link-sep" aria-hidden="true">·</span>
      <button type="button" class="hint-link" id="na-hint-faq" data-i18n="welcome.faq">FAQ</button>
    </div>
    <div class="na-hint-flagpick" id="na-hint-flagpick">
      <div class="na-hint-flag-menu" role="menu" hidden></div>
      <button type="button" class="na-hint-flag-btn" aria-haspopup="true" aria-expanded="false" aria-label="Change language" title="Language"><span class="na-lang-current-flag" aria-hidden="true"></span></button>
    </div>`;
  document.body.appendChild(el);

  // Single-flag language picker (bottom-right): one flag opens a menu of all
  // languages; choosing one re-translates the card live.
  if (typeof _naWireHintFlag === 'function') { try { _naWireHintFlag(el); } catch (_e) {} }
  if (typeof na_applyI18n === 'function') { try { na_applyI18n(el); } catch (_e) {} }

  let dismissed = false;
  function teardownListeners() {
    document.removeEventListener('pointerdown', onInteract, true);
    document.removeEventListener('keydown', onInteract, true);
    if (map && map.off) map.off('movestart zoomstart dragstart', dismiss);
  }
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    teardownListeners();
    try { localStorage.setItem('na_hint_seen', '1'); } catch (_) {}
    el.classList.add('na-hint-out');
    setTimeout(() => { if (el.parentNode) el.remove(); }, 320);
  }
  function onInteract(ev) {
    // Clicks on the card's own buttons are handled by their own listeners.
    if (ev && ev.target && el.contains(ev.target)) return;
    dismiss();
  }

  el.querySelector('#na-hint-dismiss').addEventListener('click', e => { e.stopPropagation(); dismiss(); });
  el.querySelector('#na-hint-tour').addEventListener('click', e => {
    e.stopPropagation();
    dismiss();
    if (typeof startTour === 'function') setTimeout(startTour, 360);
  });
  var _htut = el.querySelector('#na-hint-tutorial');
  if (_htut) _htut.addEventListener('click', e => { e.stopPropagation(); dismiss(); if (typeof na_openTutorial === 'function') setTimeout(na_openTutorial, 360); });
  var _hfaq = el.querySelector('#na-hint-faq');
  if (_hfaq) _hfaq.addEventListener('click', e => { e.stopPropagation(); dismiss(); if (typeof na_openFaq === 'function') setTimeout(na_openFaq, 360); });

  // Any interaction anywhere else on the site dismisses the card. A short delay
  // ensures the page-load settling does not count as an interaction.
  setTimeout(() => {
    if (dismissed) return;
    document.addEventListener('pointerdown', onInteract, true);
    document.addEventListener('keydown', onInteract, true);
    if (map && map.on) map.on('movestart zoomstart dragstart', dismiss);
  }, 450);
}

// ─── Written tutorial + FAQ (help modal) ────────────────────────────────────
// A self-hosted, accessible modal. The interactive guided tour (startTour) is
// the "video" counterpart; this is the written reference and FAQ.
var _NA_TUTORIAL = [
  { title: 'The world map', body: 'The almanac opens on a satellite view in dark mode. Drag to pan and scroll or pinch to zoom. Glowing dots mark notable cities; as you zoom in the map reveals more cities, then provinces, then counties.' },
  { title: 'Open a country guide', body: 'Click any country to open its travel guide — emergency numbers, currency, power sockets, a phrasebook, climate, living costs, safety, visa access, a short history, and a country intelligence brief. Every section can be collapsed or expanded.' },
  { title: 'Units and currency', body: 'Inside a country guide, one toggle switches every measurement at once (°C or °F, km or mi, m or ft). Choose your currency in Preferences and every cost figure converts automatically using a dated exchange-rate snapshot.' },
  { title: 'Intelligence layers', body: 'Open Layers from the bottom menu and switch on weather, safety, cost, visas, events and more. A single layer paints the map by score; stack several and each country shows one coloured chip per layer so you can compare them in place.' },
  { title: 'Travel through the year', body: 'Scrub the months to watch climate, crowds and prices shift. Every colour on the map reflects the month you have selected.' },
  { title: 'Your passport', body: 'Choose your nationality and the map recolours every country by how easy it is for you to enter — from visa-free to visa-required.' },
  { title: 'Plan and compare', body: 'Open the Trip Planner, press Add Pin and click the map to drop waypoints; a route line connects your journey. Compare countries side by side, and search anything with the search icon or the ⌘K / Ctrl+K shortcut.' },
  { title: 'Make it yours', body: 'Preferences holds your language, currency, units, map view, place labels and the guided tour. Pick your language with the flag on the welcome screen or in Preferences at any time.' },
];

var _NA_FAQ = [
  { q: 'Is the Nomadic Almanac free to use?', a: 'Yes. It runs entirely in your browser and no account is required.' },
  { q: 'Does it work offline?', a: 'Largely, yes. Core data is bundled and cached, so the map and country guides keep working without a connection after the first visit. Live overlays such as real-time transit or incident data require a connection.' },
  { q: 'How current is the information?', a: 'Chart data is dated in the sidebar (currently June 2026), and exchange rates are a dated snapshot. Safety-critical facts such as emergency numbers, plug types and voltages are verified against authoritative sources.' },
  { q: 'How accurate is the travel guidance?', a: 'It is carefully compiled and reviewed, but it remains general guidance. Always confirm visas, vaccinations, tap-water safety and emergency numbers with official sources before you travel.' },
  { q: 'Can I change the language?', a: 'Yes. Use the flag picker on the welcome screen or in Preferences. The interface defaults to your browser language and falls back to English where a translation is unavailable.' },
  { q: 'Can I change the currency?', a: 'Yes. Set it in Preferences and all cost figures convert to your chosen currency using a dated exchange-rate snapshot.' },
  { q: 'How do I read several layers at once?', a: 'Switch on multiple layers; each country then displays one small coloured chip per active layer, so you can compare them without losing the map underneath.' },
  { q: 'Is my data private?', a: 'Yes. Your preferences, trip pins and journal entries are stored only in your browser. Nothing is sent to a server, and your default language is read from your browser, not your IP address.' },
  { q: 'How do I reopen this help?', a: 'Open Preferences and choose Written tutorial, FAQ, or Replay guided tour whenever you like.' },
];

function na_openHelp(kind) {
  na_closeHelp();
  var isTut = (kind === 'tutorial');
  var title = isTut ? _t('welcome.tutorial') : _t('welcome.faq');
  var bodyHtml;
  if (isTut) {
    bodyHtml = _NA_TUTORIAL.map(function (s, i) {
      return '<section class="na-help-step"><div class="na-help-step-n">' + (i + 1) + '</div>' +
             '<div class="na-help-step-c"><h3>' + _esc(s.title) + '</h3><p>' + _esc(s.body) + '</p></div></section>';
    }).join('');
    bodyHtml += '<div class="na-help-cta"><button type="button" class="hint-btn primary" id="na-help-tour">' + _esc(_t('welcome.tour')) + '</button></div>';
  } else {
    bodyHtml = _NA_FAQ.map(function (f) {
      return '<details class="na-faq-item"><summary>' + _esc(f.q) + '</summary><p>' + _esc(f.a) + '</p></details>';
    }).join('');
  }
  var overlay = document.createElement('div');
  overlay.id = 'na-help-overlay';
  overlay.innerHTML =
    '<div id="na-help-backdrop"></div>' +
    '<div id="na-help-panel" class="glass-panel" role="dialog" aria-modal="true" aria-label="' + _esc(title) + '">' +
      '<button type="button" id="na-help-close" aria-label="' + _esc(_t('common.close')) + '">&times;</button>' +
      '<h2 class="na-help-title">' + _esc(title) + '</h2><hr class="gold-rule">' +
      '<div class="na-help-body ' + (isTut ? 'na-help-tut' : 'na-help-faq') + '">' + bodyHtml + '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  function close() { na_closeHelp(); }
  overlay.querySelector('#na-help-backdrop').addEventListener('click', close);
  overlay.querySelector('#na-help-close').addEventListener('click', close);
  var tourBtn = overlay.querySelector('#na-help-tour');
  if (tourBtn) tourBtn.addEventListener('click', function () { close(); if (typeof startTour === 'function') setTimeout(startTour, 250); });
  overlay._naKey = function (e) { if (e.key === 'Escape') { e.preventDefault(); close(); } };
  document.addEventListener('keydown', overlay._naKey, true);
  setTimeout(function () { var c = overlay.querySelector('#na-help-close'); if (c) c.focus(); }, 50);
}
function na_closeHelp() {
  var o = document.getElementById('na-help-overlay');
  if (!o) return;
  if (o._naKey) document.removeEventListener('keydown', o._naKey, true);
  if (o.parentNode) o.parentNode.removeChild(o);
  document.body.style.overflow = '';
}
function na_openTutorial() { na_openHelp('tutorial'); }
function na_openFaq() { na_openHelp('faq'); }

// ─── Guided Walkthrough Tour ─────────────────────────────────────────────────
// A lightweight coachmark tour for new (and returning) users. Each step points
// at a real control; steps whose target is not visible in the current layout are
// skipped automatically, so the same tour works on mobile, tablet, and desktop.
var _tourState = null;

function _naTourSteps() {
  return [
    { target: null, center: true, title: 'Welcome to the Almanac',
      body: 'A living atlas of where to go and when. Here is a quick tour of the essentials — it takes about a minute.' },
    { target: ['#map'], center: true, title: 'The world map',
      body: 'Click any country for a full travel guide. The glowing dots are notable cities — zoom in and the map reveals more cities, then provinces, then counties.' },
    { target: ['#na-sidebar-months', '#na-month-strip', '.na-month-row'], title: 'Travel through the year',
      body: 'Scrub the months to watch climate, crowds, and prices shift. Every colour on the map reflects the month you have chosen.' },
    { target: ['.na-accordion-trigger[data-accordion="layers"]', '#na-layers-toggle', '#na-layers-list'], title: 'Intelligence layers',
      body: 'Switch on layers — weather, safety, cost, visas, events, and more. One layer paints the map; stack several and each appears as its own coloured chip.' },
    { target: ['#na-sidebar-passport', '#na-passport-chip'], title: 'Your passport',
      body: 'Choose your nationality and the map recolours every country by how easy it is for you to enter — from visa-free to visa-required.' },
    { target: ['#btn-trip-planner'], title: 'Plan a trip',
      body: 'Open the Trip Planner, press “Add Pin”, then click the map to drop waypoints. A route line links your journey, and you can share or pack for it.' },
    { target: ['#na-theme-btn'], title: 'Day or night',
      body: 'Flip between a daylight chart and a night chart. By night the map can glow with the Earth-from-space city lights.' },
    { target: ['#na-search-btn'], title: 'Search anything',
      body: 'Jump to any country, city, or layer instantly. Press ⌘K (or /) at any time.' },
    { target: null, center: true, title: 'You are ready to roam',
      body: 'That is the tour. You can reopen it anytime from Preferences. Safe travels!' },
  ];
}

function _tourFirstVisible(selList) {
  if (!selList) return null;
  for (const sel of selList) {
    const el = document.querySelector(sel);
    if (!el) continue;
    // offsetParent is null for position:fixed elements (e.g. the floating trip
    // planner button) even when visible, so test computed style + box instead.
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
    const b = el.getBoundingClientRect();
    if (b.width > 0 && b.height > 0) return el;
  }
  return null;
}

function startTour() {
  endTour();
  // Build the runnable step list: a step survives if it is centered (no target)
  // or its target resolves to a visible element in the current layout.
  const steps = _naTourSteps().filter(s => s.center || !s.target || _tourFirstVisible(s.target));
  if (!steps.length) return;

  const overlay = document.createElement('div');
  overlay.id = 'na-tour-overlay';
  overlay.innerHTML = '<div id="na-tour-spotlight"></div><div id="na-tour-pop"></div>';
  document.body.appendChild(overlay);
  // Clicking the dimmed backdrop does nothing destructive; navigation is via buttons.
  overlay.addEventListener('click', e => { if (e.target === overlay) e.stopPropagation(); });

  _tourState = { steps, i: 0, overlay,
    onKey: e => {
      if (e.key === 'Escape') { e.preventDefault(); endTour(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); _tourGo(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); _tourGo(-1); }
    },
    onResize: () => _renderTourStep() };
  document.addEventListener('keydown', _tourState.onKey, true);
  window.addEventListener('resize', _tourState.onResize);
  _renderTourStep();
}

function _tourGo(delta) {
  if (!_tourState) return;
  const ni = _tourState.i + delta;
  if (ni < 0) return;
  if (ni >= _tourState.steps.length) { endTour(); return; }
  _tourState.i = ni;
  _renderTourStep();
}

function _renderTourStep() {
  if (!_tourState) return;
  const { steps, i, overlay } = _tourState;
  const step = steps[i];
  const spot = overlay.querySelector('#na-tour-spotlight');
  const pop  = overlay.querySelector('#na-tour-pop');
  const targetEl = step.center ? null : _tourFirstVisible(step.target);

  let rect = null;
  if (targetEl) {
    rect = targetEl.getBoundingClientRect();
    const pad = 6;
    overlay.classList.remove('no-spot');
    spot.style.top = (rect.top - pad) + 'px';
    spot.style.left = (rect.left - pad) + 'px';
    spot.style.width = (rect.width + pad * 2) + 'px';
    spot.style.height = (rect.height + pad * 2) + 'px';
  } else {
    overlay.classList.add('no-spot');
  }

  const dots = steps.map((_, k) => `<span class="tour-dot${k === i ? ' on' : ''}"></span>`).join('');
  const isLast = i === steps.length - 1;
  pop.innerHTML = `
    <button type="button" class="tour-skip" id="na-tour-skip" aria-label="Skip tour">✕</button>
    <div class="tour-step">Step ${i + 1} of ${steps.length}</div>
    <div class="tour-title">${step.title}</div>
    <p class="tour-body">${step.body}</p>
    <div class="tour-nav">
      <div class="tour-dots">${dots}</div>
      <div class="tour-btns">
        ${i > 0 ? '<button type="button" class="tour-btn" id="na-tour-back">Back</button>' : ''}
        <button type="button" class="tour-btn primary" id="na-tour-next">${isLast ? 'Done' : 'Next'}</button>
      </div>
    </div>`;
  pop.querySelector('#na-tour-skip').addEventListener('click', endTour);
  pop.querySelector('#na-tour-next').addEventListener('click', () => _tourGo(1));
  const backBtn = pop.querySelector('#na-tour-back');
  if (backBtn) backBtn.addEventListener('click', () => _tourGo(-1));

  // Position the pop card: below the target if there is room, else above, else center.
  pop.style.visibility = 'hidden';
  requestAnimationFrame(() => {
    const pr = pop.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight, m = 14;
    let top, left;
    if (rect) {
      const below = rect.bottom + 12;
      const above = rect.top - pr.height - 12;
      if (below + pr.height <= vh - m) top = below;
      else if (above >= m) top = above;
      else top = Math.max(m, (vh - pr.height) / 2);
      left = rect.left + rect.width / 2 - pr.width / 2;
      left = Math.min(Math.max(m, left), vw - pr.width - m);
    } else {
      top = (vh - pr.height) / 2;
      left = (vw - pr.width) / 2;
    }
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
    pop.style.visibility = 'visible';
  });
}

function endTour() {
  if (!_tourState) {
    const stray = document.getElementById('na-tour-overlay');
    if (stray) stray.remove();
    return;
  }
  document.removeEventListener('keydown', _tourState.onKey, true);
  window.removeEventListener('resize', _tourState.onResize);
  if (_tourState.overlay && _tourState.overlay.parentNode) _tourState.overlay.remove();
  _tourState = null;
  try { localStorage.setItem('na_hint_seen', '1'); } catch (_) {}
}

// Expose so Preferences / keyboard shortcuts can relaunch the walkthrough.
window.startTour = startTour;

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
  openComparePanel();
  // Refresh the currently visible tooltip pin button state if it matches
  const ttName = document.getElementById('tt-name');
  if (ttName) {
    const btn = document.querySelector('.tt-pin-btn');
    if (btn && btn.dataset.iso2 === iso2) {
      const pinned = pinnedCountries.includes(iso2);
      btn.classList.toggle('pinned', pinned);
      btn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
      // Icon buttons (header cluster) keep their glyph; only toggle state.
      if (!btn.classList.contains('tt-hact')) btn.textContent = pinned ? '♡ Pinned' : '♡ Compare';
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
  // Content only — open/close is handled by openComparePanel/closeComparePanel, so
  // this may run on boot (to prefill the empty state) without popping the panel open.
  var closeBtn = '<button class="compare-close" aria-label="Close comparison" onclick="closeComparePanel()">✕</button>';
  if (!pinnedCountries || pinnedCountries.length === 0) {
    panel.innerHTML = closeBtn + '<div class="compare-empty-state">' +
      '<svg width="32" height="32" viewBox="0 0 24 24" style="opacity:0.4;margin-bottom:10px"><use href="#icon-compare"/></svg>' +
      '<p style="font-family:var(--font-label);font-size:10px;color:var(--na-text-primary);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Compare Countries</p>' +
      '<p style="font-size:9px;color:var(--na-text-secondary);line-height:1.6;max-width:240px">Click any country on the map, then tap the <strong style="color:var(--na-gold-mid)">⊕ pin</strong> button in its panel to add it here. Add 2–4 countries to compare.</p>' +
      '</div>';
    return;
  }
  if (pinnedCountries.length < 2) {
    panel.innerHTML = closeBtn + '<div class="compare-empty-state">' +
      '<p style="font-family:var(--font-label);font-size:10px;color:var(--na-text-primary);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">One More Country</p>' +
      '<p style="font-size:9px;color:var(--na-text-secondary);line-height:1.6;max-width:240px">You have <strong style="color:var(--na-gold-mid)">1 of 2</strong> countries pinned. Click a second country on the map and tap ⊕ to begin comparing.</p>' +
      '</div>';
    return;
  }
  var countries = pinnedCountries.slice(0, 4);
  var RCOL = ['#43A047','#FDD835','#EF6C00','#C62828'];

  // ── Layer rating helpers ──────────────────────────────────────────────────

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
    if (t == null) return '—';
    return (typeof _tempUnit !== 'undefined' && _tempUnit === 'F') ? (Math.round(t * 9 / 5 + 32) + '°F') : (t + '°C');
  }

  function budgetCell(iso2) {
    if (typeof COST_DETAILS === 'undefined' || !COST_DETAILS[iso2]) return '—';
    var d = COST_DETAILS[iso2];
    return _money((d.hostel||0) + (d.meal||0)*3 + (d.transport||0)) + '/day';
  }

  // ── Verdict computation ───────────────────────────────────────────────────

  // Scorable layer keys and their backing data objects; lower value = better on 0-3 scale
  var SCORABLE = [
    { key: 'cost',       src: function(iso2){ return (typeof CD_COST       !== 'undefined' && CD_COST[iso2]       != null) ? CD_COST[iso2]       : null; }, label: 'Cost' },
    { key: 'safety',     src: function(iso2){ return (typeof CD_SAFETY     !== 'undefined' && CD_SAFETY[iso2]     != null) ? CD_SAFETY[iso2]     : null; }, label: 'Safety' },
    { key: 'internet',   src: function(iso2){ return (typeof CD_INTERNET   !== 'undefined' && CD_INTERNET[iso2]   != null) ? CD_INTERNET[iso2]   : null; }, label: 'Internet' },
    { key: 'healthcare', src: function(iso2){ return (typeof CD_HEALTHCARE !== 'undefined' && CD_HEALTHCARE[iso2] != null) ? CD_HEALTHCARE[iso2] : null; }, label: 'Healthcare' },
    { key: 'scam',       src: function(iso2){ return (typeof CD_SCAM       !== 'undefined' && CD_SCAM[iso2]       != null) ? CD_SCAM[iso2]       : null; }, label: 'Scam Risk' },
    { key: 'malaria',    src: function(iso2){ return (typeof CD_MALARIA    !== 'undefined' && CD_MALARIA[iso2]    != null) ? CD_MALARIA[iso2]    : null; }, label: 'Malaria' },
    // Generic CD-array layers — resolved via activeLayers context
    { key: 'health',    src: null, label: 'Health' },
    { key: 'crowds',    src: null, label: 'Crowds' },
    { key: 'disaster',  src: null, label: 'Disaster' },
    { key: 'road',      src: null, label: 'Road' },
  ];

  // Helper: get score for a single iso2/layer combination without mutating activeLayers
  function getScore(iso2, layer) {
    if (layer.src !== null) {
      return layer.src(iso2);
    }
    // Generic path: temporarily scope activeLayers to the single key
    var prev = new Set(activeLayers);
    activeLayers.clear();
    activeLayers.add(layer.key);
    var r = getCountryRating(iso2);
    activeLayers.clear();
    prev.forEach(function(k){ activeLayers.add(k); });
    return (r !== null && r !== undefined) ? r : null;
  }

  // Find active scorable layers (those present in activeLayers)
  var activeScorable = SCORABLE.filter(function(s){ return activeLayers.has(s.key); });

  // Compute per-country averages over active scorable layers that have data
  var countryAverages = countries.map(function(iso2) {
    var vals = [];
    activeScorable.forEach(function(s) {
      var v = getScore(iso2, s);
      if (v !== null && v !== undefined) vals.push(v);
    });
    return {
      iso2: iso2,
      avg: vals.length > 0 ? vals.reduce(function(a, b){ return a + b; }, 0) / vals.length : null,
      scoredLayers: activeScorable.filter(function(s){
        var v = getScore(iso2, s);
        return v !== null && v !== undefined;
      })
    };
  });

  // Determine whether we have enough data to show a verdict
  var enoughLayers = activeScorable.length >= 2;
  var enoughCountries = countries.length >= 2;
  var allHaveData = countryAverages.filter(function(c){ return c.avg !== null; }).length >= 2;
  var canShowVerdict = enoughLayers && enoughCountries && allHaveData;

  // Build verdict row HTML
  var verdictRow = '';
  var verdictInsightRow = '';

  if (!canShowVerdict) {
    // Single cell spanning all country columns + label column
    var colSpan = countries.length + 1;
    verdictRow = '<tr class="tt-verdict-row" style="background:rgba(201,168,76,0.10);border-top:2px solid #c9a84c">' +
      '<td colspan="' + colSpan + '" style="padding:5px 10px;font-size:7.5px;color:rgba(255,255,255,0.35);font-style:italic;text-align:center">' +
      'Activate 2 or more layers to compare' +
      '</td></tr>';
  } else {
    // Sort to find winner (lowest average = best)
    var ranked = countryAverages.filter(function(c){ return c.avg !== null; }).slice().sort(function(a, b){ return a.avg - b.avg; });
    var winner = ranked[0];

    // Label cell
    var verdictLabel = '<td style="padding:5px 8px;font-size:7.5px;font-variant:small-caps;color:#c9a84c;font-weight:700;border-bottom:1px solid rgba(201,168,76,0.15);white-space:nowrap">Verdict</td>';

    // Per-country cells
    var verdictCells = countries.map(function(iso2) {
      var entry = countryAverages.find(function(c){ return c.iso2 === iso2; });
      if (!entry || entry.avg === null) {
        return '<td style="padding:5px 8px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.15);font-size:7.5px;color:rgba(255,255,255,0.25)">—</td>';
      }
      if (iso2 === winner.iso2) {
        return '<td class="tt-verdict-winner" style="padding:5px 8px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.15)">' +
          '<span style="background:rgba(201,168,76,0.20);border:1px solid #c9a84c;border-radius:4px;color:#c9a84c;font-size:7px;padding:2px 6px;font-weight:700;letter-spacing:0.5px">BEST MATCH</span>' +
          '</td>';
      }
      var diff = entry.avg - winner.avg;
      return '<td class="tt-verdict-behind" style="padding:5px 8px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.15);font-size:8px;color:rgba(255,255,255,0.45)">+' + diff.toFixed(1) + ' pts</td>';
    }).join('');

    verdictRow = '<tr class="tt-verdict-row" style="background:rgba(201,168,76,0.10);border-top:2px solid #c9a84c">' +
      verdictLabel + verdictCells + '</tr>';

    // ── Verdict insight row ─────────────────────────────────────────────────
    // Determine which active scorable layers each country leads on
    var layerLeaders = {};  // layerKey → iso2 of leader (lowest score)
    activeScorable.forEach(function(s) {
      var best = null;
      var bestVal = Infinity;
      var tied = false;
      countries.forEach(function(iso2) {
        var v = getScore(iso2, s);
        if (v === null || v === undefined) return;
        if (v < bestVal) { bestVal = v; best = iso2; tied = false; }
        else if (v === bestVal) { tied = true; }
      });
      if (best !== null && !tied) layerLeaders[s.key] = best;
    });

    // Collect layers each non-winner leads on
    var winnerLeadLayers = [];
    var otherLeads = {};  // iso2 → [label, ...]
    activeScorable.forEach(function(s) {
      var leader = layerLeaders[s.key];
      if (!leader) return;
      if (leader === winner.iso2) {
        winnerLeadLayers.push(s.label);
      } else {
        if (!otherLeads[leader]) otherLeads[leader] = [];
        otherLeads[leader].push(s.label);
      }
    });

    var winnerName = (typeof countryNames !== 'undefined' && countryNames[winner.iso2]) || winner.iso2;
    var natNote = (typeof selectedNationality === 'string' && selectedNationality)
      ? 'For ' + selectedNationality + ' passport holders: '
      : '';

    var insightParts = [];
    if (winnerLeadLayers.length > 0) {
      insightParts.push(_esc(winnerName) + ' leads on ' + winnerLeadLayers.slice(0,3).map(_esc).join(', ') + '.');
    }

    Object.keys(otherLeads).forEach(function(iso2) {
      var cName = (typeof countryNames !== 'undefined' && countryNames[iso2]) || iso2;
      var layerList = otherLeads[iso2].slice(0,2).map(_esc).join(' &amp; ');
      insightParts.push(_esc(cName) + ' scores best on ' + layerList + '.');
    });

    var insightText = natNote + (insightParts.length > 0 ? insightParts.join(' ') : _esc(winnerName) + ' is the strongest overall match.');

    var insightColSpan = countries.length + 1;
    verdictInsightRow = '<tr class="tt-verdict-insight">' +
      '<td colspan="' + insightColSpan + '" style="padding:4px 10px 6px;font-size:7.5px;color:rgba(255,255,255,0.45);font-style:italic;border-bottom:1px solid rgba(201,168,76,0.08)">' +
      insightText +
      '</td></tr>';
  }

  // ── Standard layer rows ───────────────────────────────────────────────────

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

  panel.innerHTML = closeBtn + '<div style="padding:6px 10px 4px;font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;border-bottom:1px solid rgba(201,168,76,0.12)">⚖ COUNTRY COMPARISON</div>' +
    '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr>' + heads + '</tr></thead><tbody>' +
    verdictRow + verdictInsightRow +
    dataRows + climateRow + budgetRow +
    '</tbody></table></div>' +
    '<div style="padding:6px 10px 8px;font-size:7.5px;color:var(--dim);border-top:1px solid rgba(201,168,76,0.08);margin-top:4px">💡 Pin countries on the map to compare them. Click a country name to fly there.</div>' +
    '<div style="padding:4px 10px 8px;text-align:right"><button onclick="_shareCompareURL()" style="font-size:7px;background:rgba(201,168,76,0.10);border:1px solid rgba(201,168,76,0.25);border-radius:4px;color:var(--gold);cursor:pointer;padding:3px 8px;font-family:var(--fm)">⎘ Copy Comparison URL</button></div>';
}


function openComparePanel() {
  var panel = document.getElementById('compare-panel');
  if (!panel) return;
  renderComparePanel();
  panel.style.display = 'flex';
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
}
function closeComparePanel() {
  var panel = document.getElementById('compare-panel');
  if (!panel) return;
  panel.classList.remove('open');
  panel.style.display = 'none';
  panel.setAttribute('aria-hidden', 'true');
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
  map.on('moveend', () => { _renderNYCCrime(); _renderLiveCrime(); });

  // Multi-layer glyph clusters are viewport-gated, so rebuild them on pan
  // (debounced). No-op unless 2+ rated layers are active at zoom ≥ 4.
  map.on('moveend', () => {
    clearTimeout(_glyphDebounce);
    _glyphDebounce = setTimeout(() => { renderLayerGlyphs(); }, 200);
  });
}
var _glyphDebounce = null;

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

// ─── Live crime-incident overlay (FREE, key-less open-data APIs) ─────────────
// When the Safety layer is active and the map is zoomed in (z>=12) over a covered
// city/region, fetch recent incident points from that area's free, key-less open
// data API and plot them. Complements the curated NYC precinct overlay. Every
// source is key-less — no API token is committed. Degrades gracefully: a status
// chip while loading, a toast on error; never a silent blank state (per the
// static-site runtime-dependency rule).
//   type 'soda'        = Socrata SODA, flat numeric lat/lng columns
//   type 'soda-point'  = Socrata SODA, coords nested in a Point column (within_box)
//   type 'ckan'        = CKAN datastore_search (Boston)
//   type 'police'      = data.police.uk (covers all of England/Wales/N. Ireland)
var CRIME_SOURCES = [
  { id:'chicago',     region:'Chicago',              type:'soda',       host:'https://data.cityofchicago.org',   ds:'ijzp-q8t2', f:{lat:'latitude',lng:'longitude',date:'date',cat:'primary_type'},               bbox:[41.62,-87.95,42.05,-87.52] },
  { id:'la',          region:'Los Angeles',          type:'soda',       host:'https://data.lacity.org',          ds:'2nrs-mtv8', f:{lat:'lat',lng:'lon',date:'date_occ',cat:'crm_cd_desc'},                       bbox:[33.70,-118.67,34.34,-118.15] },
  { id:'seattle',     region:'Seattle',              type:'soda',       host:'https://data.seattle.gov',         ds:'tazs-3rd5', f:{lat:'latitude',lng:'longitude',date:'offense_start_datetime',cat:'offense'},  bbox:[47.49,-122.44,47.74,-122.22] },
  { id:'sf',          region:'San Francisco',        type:'soda',       host:'https://data.sfgov.org',           ds:'wg3w-h783', f:{lat:'latitude',lng:'longitude',date:'incident_datetime',cat:'incident_category'}, bbox:[37.70,-122.52,37.84,-122.35] },
  { id:'cincinnati',  region:'Cincinnati',           type:'soda',       host:'https://data.cincinnati-oh.gov',   ds:'k59e-2pvf', f:{lat:'latitude_x',lng:'longitude_x',date:'date_reported',cat:'offense'},        bbox:[39.05,-84.71,39.22,-84.36] },
  { id:'montgomery',  region:'Montgomery County, MD',type:'soda',       host:'https://data.montgomerycountymd.gov',ds:'icn6-v9z3',f:{lat:'latitude',lng:'longitude',date:'date',cat:'crimename2'},               bbox:[38.93,-77.53,39.35,-76.89] },
  { id:'buffalo',     region:'Buffalo',              type:'soda',       host:'https://data.buffalony.gov',       ds:'d6g9-xbgu', f:{lat:'latitude',lng:'longitude',date:'incident_datetime',cat:'incident_type_primary'}, bbox:[42.82,-78.92,42.97,-78.79] },
  { id:'nola',        region:'New Orleans',          type:'soda',       host:'https://data.nola.gov',            ds:'5fn8-vtui', f:{lat:'latitude',lng:'longitude',date:'timedispatch',cat:'typetext'},           bbox:[29.86,-90.14,30.07,-89.94] },
  { id:'gainesville', region:'Gainesville, FL',      type:'soda',       host:'https://data.cityofgainesville.org',ds:'gvua-xt9q',f:{lat:'latitude',lng:'longitude',date:'offense_date',cat:'narrative'},        bbox:[29.58,-82.45,29.72,-82.25] },
  { id:'dallas',      region:'Dallas',               type:'soda-point', host:'https://www.dallasopendata.com',   ds:'qv6i-rri7', pt:'geocoded_column', f:{date:'date1',cat:'nibrs_crime'},                       bbox:[32.62,-96.99,33.02,-96.55] },
  { id:'kcmo',        region:'Kansas City, MO',      type:'soda-point', host:'https://data.kcmo.org',            ds:'f7wj-ckmw', pt:'location', f:{date:'report_date',cat:'offense'},                            bbox:[38.85,-94.78,39.35,-94.40] },
  { id:'boston',      region:'Boston',               type:'ckan',       host:'https://data.boston.gov',          rid:'b973d8cb-eeb2-4e7e-99da-c92938efc9c0', f:{lat:'Lat',lng:'Long',date:'OCCURRED_ON_DATE',cat:'OFFENSE_DESCRIPTION'}, bbox:[42.23,-71.19,42.40,-70.99] },
  // ArcGIS FeatureServer GeoJSON (key-less); coords from a lat/lng attribute or, where null, geometry.coordinates. Dates are epoch-ms.
  { id:'baltimore', region:'Baltimore, MD', type:'arcgis', endpoint:'https://services1.arcgis.com/UWYHeuuJISiGmgXx/arcgis/rest/services/NIBRS_GroupA_Crime_Data/FeatureServer/0/query?where=1=1&outFields=*&f=geojson&resultRecordCount=600', f:{lat:'Latitude',lng:'Longitude',date:'CrimeDateTime',cat:'Description'}, bbox:[39.197,-76.711,39.372,-76.529] },
  { id:'denver',    region:'Denver, CO',    type:'arcgis', endpoint:'https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/arcgis/rest/services/ODC_CRIME_OFFENSES_P/FeatureServer/324/query?where=1=1&outFields=*&f=geojson&resultRecordCount=600', f:{lat:'GEO_LAT',lng:'GEO_LON',date:'FIRST_OCCURRENCE_DATE',cat:'OFFENSE_CATEGORY_ID'}, bbox:[39.614,-105.110,39.914,-104.600] },
  { id:'detroit',   region:'Detroit, MI',   type:'arcgis', endpoint:'https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/RMS_Crime_Incidents/FeatureServer/0/query?where=1=1&outFields=*&f=geojson&resultRecordCount=600', f:{lat:'latitude',lng:'longitude',date:'incident_occurred_at',cat:'offense_category'}, bbox:[42.255,-83.288,42.450,-82.910] },
  { id:'nashville', region:'Nashville, TN', type:'arcgis', endpoint:'https://services2.arcgis.com/HdTo6HJqh92wn4D8/arcgis/rest/services/Metro_Nashville_Police_Department_Incidents_view/FeatureServer/0/query?where=1=1&outFields=*&f=geojson&resultRecordCount=600', f:{lat:'Latitude',lng:'Longitude',date:'Incident_Occurred',cat:'Offense_Description'}, bbox:[35.97,-87.05,36.41,-86.51] },
  { id:'hartford',  region:'Hartford, CT',  type:'arcgis', endpoint:'https://utility.arcgis.com/usrsvcs/servers/4bc28c820ebd45df8a62feae6dc8822d/rest/services/OpenData_PublicSafety/FeatureServer/21/query?where=1=1&outFields=*&f=geojson&resultRecordCount=600', f:{lat:null,lng:null,date:'Date',cat:'OffenseDesc'}, bbox:[41.726,-72.717,41.808,-72.643] },
  { id:'tempe',     region:'Tempe, AZ',     type:'arcgis', endpoint:'https://services.arcgis.com/lQySeXwbBg53XWDi/ArcGIS/rest/services/Calls_For_Service/FeatureServer/0/query?where=1=1&outFields=*&f=geojson&resultRecordCount=600', f:{lat:'Latitude',lng:'Longitude',date:'OccurrenceDatetime',cat:'CallCategory'}, bbox:[33.32,-111.975,33.456,-111.875] },
  { id:'austin',    region:'Austin, TX',    type:'arcgis', endpoint:'https://maps.austintexas.gov/arcgis/rest/services/CrimeViewer_new/APD_Reported_Crimes_new/FeatureServer/9/query?where=1=1&outFields=*&f=geojson&resultRecordCount=600', f:{lat:null,lng:null,date:'OCCURRENCE_DATE',cat:'CRIME_DESCRIPTION'}, bbox:[30.10,-97.94,30.52,-97.56] },
  { id:'raleigh',   region:'Raleigh, NC',   type:'arcgis', endpoint:'https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Police_Incidents/FeatureServer/0/query?where=1=1&outFields=*&f=geojson&resultRecordCount=600', f:{lat:'latitude',lng:'longitude',date:'reported_date',cat:'crime_category'}, bbox:[35.69,-78.78,35.93,-78.50] },
  { id:'philly',    region:'Philadelphia, PA', type:'carto', bbox:[39.867,-75.280,40.138,-74.956] },
  { id:'uk',          region:'United Kingdom',       type:'police',                                                                                                                                            bbox:[49.8,-8.7,60.9,1.9] },
];

var _liveCrimeMarkers = [], _liveCrimeSig = null, _liveCrimeToken = 0, _liveCrimeTimer = null, _ukLatestMonth = null;

function _crimeSourceForCenter(lat, lng) {
  for (var i = 0; i < CRIME_SOURCES.length; i++) {
    var b = CRIME_SOURCES[i].bbox;
    if (lat >= b[0] && lat <= b[2] && lng >= b[1] && lng <= b[3]) return CRIME_SOURCES[i];
  }
  return null;
}

function _clearLiveCrime() {
  for (var i = 0; i < _liveCrimeMarkers.length; i++) map.removeLayer(_liveCrimeMarkers[i]);
  _liveCrimeMarkers = [];
  _liveCrimeSig = null;
}

function _crimeStatus(msg) {
  var el = document.getElementById('na-crime-status');
  if (!el) {
    if (!msg) return;
    el = document.createElement('div');
    el.id = 'na-crime-status';
    (document.getElementById('na-main') || document.body).appendChild(el);
  }
  if (msg) { el.textContent = msg; el.style.display = 'block'; }
  else { el.style.display = 'none'; }
}

function _crimeSeverityColor(cat) {
  var s = (cat || '').toLowerCase();
  if (/(assault|robber|homicide|murder|weapon|violen|shoot|gun|rape|sex|kidnap|battery|arson)/.test(s)) return '#C62828';
  if (/(burglar|theft|larcen|stolen|vehicle|motor|break|damage|vandal|property|burglary)/.test(s)) return '#EF6C00';
  if (/(drug|narcot|fraud|forg|dui|alcohol|disorder|anti-social|trespass|public)/.test(s)) return '#FDD835';
  return '#9aa7b4';
}

// Evaluated on layer/zoom/pan changes; debounced before the actual network call.
function _renderLiveCrime() {
  if (!map) return;
  if (!activeLayers.has('safety') || map.getZoom() < 12) { _clearLiveCrime(); _crimeStatus(null); return; }
  var c = map.getCenter();
  var src = _crimeSourceForCenter(c.lat, c.lng);
  if (!src) { _clearLiveCrime(); _crimeStatus(null); return; }
  clearTimeout(_liveCrimeTimer);
  _liveCrimeTimer = setTimeout(function () { _fetchLiveCrime(src); }, 350);
}

function _fetchLiveCrime(src) {
  if (!map) return;
  var b = map.getBounds(), c = map.getCenter();
  var minLat = b.getSouth(), maxLat = b.getNorth(), minLng = b.getWest(), maxLng = b.getEast();
  var sig = src.id + ':' + [minLat, minLng, maxLat, maxLng].map(function (n) { return n.toFixed(2); }).join(',');
  if (sig === _liveCrimeSig) return;            // already rendered for this view
  var token = ++_liveCrimeToken;
  _crimeStatus('Loading ' + src.region + ' crime data…');
  _crimeFetch(src, minLat, minLng, maxLat, maxLng, c.lat, c.lng).then(function (rows) {
    if (token !== _liveCrimeToken) return;       // a newer request superseded this one
    _clearLiveCrime();
    _liveCrimeSig = sig;
    var capped = rows.slice(0, 600);
    capped.forEach(function (p) {
      var m = L.circleMarker([p.lat, p.lng], {
        radius: 4, color: 'rgba(14,11,6,0.7)', weight: 0.6,
        fillColor: _crimeSeverityColor(p.cat), fillOpacity: 0.82, pane: 'markersPane'
      });
      m.bindTooltip('<b>' + _esc(p.cat || 'Incident') + '</b><br><small>' + _esc(p.date || '') + ' · ' + _esc(src.region) + '</small>', { className: 'tt-sm' });
      m.addTo(map);
      _liveCrimeMarkers.push(m);
    });
    _crimeStatus(capped.length
      ? (capped.length + (rows.length > capped.length ? '+' : '') + ' recent incidents · ' + src.region)
      : ('No mapped incidents in view · ' + src.region));
    setTimeout(function () { if (token === _liveCrimeToken) _crimeStatus(null); }, 2800);
  }).catch(function () {
    if (token !== _liveCrimeToken) return;
    _crimeStatus(null);
    if (typeof na_toast === 'function') na_toast(src.region + ' crime data is unavailable right now.', 3500);
  });
}

function _inBounds(p, minLat, minLng, maxLat, maxLng) {
  return !isNaN(p.lat) && !isNaN(p.lng) && p.lat >= minLat && p.lat <= maxLat && p.lng >= minLng && p.lng <= maxLng;
}

function _crimeFetch(src, minLat, minLng, maxLat, maxLng, cLat, cLng) {
  var jsonOk = function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };

  if (src.type === 'police') {
    var monthP = _ukLatestMonth
      ? Promise.resolve(_ukLatestMonth)
      : fetch('https://data.police.uk/api/crimes-street-dates').then(function (r) { return r.json(); })
          .then(function (d) { _ukLatestMonth = (d && d[0] && d[0].date) || '2026-01'; return _ukLatestMonth; })
          .catch(function () { return '2026-01'; });
    return monthP.then(function (mo) {
      return fetch('https://data.police.uk/api/crimes-street/all-crime?lat=' + cLat + '&lng=' + cLng + '&date=' + mo).then(jsonOk).then(function (j) {
        return (j || []).filter(function (x) { return x.location; }).map(function (x) {
          return { lat: parseFloat(x.location.latitude), lng: parseFloat(x.location.longitude), cat: (x.category || '').replace(/-/g, ' '), date: x.month };
        }).filter(function (p) { return _inBounds(p, minLat, minLng, maxLat, maxLng); });
      });
    });
  }

  if (src.type === 'ckan') {
    var u = src.host + '/api/3/action/datastore_search?resource_id=' + src.rid + '&limit=2000&sort=' + encodeURIComponent(src.f.date + ' desc');
    return fetch(u).then(jsonOk).then(function (d) {
      var recs = (d && d.result && d.result.records) || [];
      return recs.map(function (x) {
        return { lat: parseFloat(x[src.f.lat]), lng: parseFloat(x[src.f.lng]), cat: x[src.f.cat], date: (x[src.f.date] || '').slice(0, 10) };
      }).filter(function (p) { return _inBounds(p, minLat, minLng, maxLat, maxLng); });
    });
  }

  if (src.type === 'soda-point') {
    var w = 'within_box(' + src.pt + ',' + maxLat + ',' + minLng + ',' + minLat + ',' + maxLng + ')';
    var u2 = src.host + '/resource/' + src.ds + '.json?$where=' + encodeURIComponent(w) + '&$order=' + encodeURIComponent(src.f.date + ' DESC') + '&$limit=600';
    return fetch(u2).then(jsonOk).then(function (j) {
      return (j || []).map(function (x) {
        var pt = x[src.pt], co = pt && pt.coordinates;
        var lat = co ? parseFloat(co[1]) : (pt && pt.latitude ? parseFloat(pt.latitude) : NaN);
        var lng = co ? parseFloat(co[0]) : (pt && pt.longitude ? parseFloat(pt.longitude) : NaN);
        return { lat: lat, lng: lng, cat: x[src.f.cat], date: (x[src.f.date] || '').slice(0, 10) };
      }).filter(function (p) { return _inBounds(p, minLat, minLng, maxLat, maxLng); });
    });
  }

  if (src.type === 'arcgis') {
    // Bound the query to the current view and request newest-first GeoJSON.
    var env = minLng + ',' + minLat + ',' + maxLng + ',' + maxLat;
    var ua = src.endpoint + '&geometry=' + encodeURIComponent(env) +
      '&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects';
    if (src.f.date) ua += '&orderByFields=' + encodeURIComponent(src.f.date + ' DESC');
    return fetch(ua).then(jsonOk).then(function (g) {
      return ((g && g.features) || []).map(function (ft) {
        var co = ft.geometry && ft.geometry.coordinates, p = ft.properties || {};
        var lat = (src.f.lat && p[src.f.lat] != null) ? parseFloat(p[src.f.lat]) : (co ? parseFloat(co[1]) : NaN);
        var lng = (src.f.lng && p[src.f.lng] != null) ? parseFloat(p[src.f.lng]) : (co ? parseFloat(co[0]) : NaN);
        var d = p[src.f.date];
        var ds = (typeof d === 'number') ? new Date(d).toISOString().slice(0, 10) : (d ? String(d).slice(0, 10) : '');
        return { lat: lat, lng: lng, cat: p[src.f.cat], date: ds };
      }).filter(function (pt) { return _inBounds(pt, minLat, minLng, maxLat, maxLng); });
    });
  }

  if (src.type === 'carto') {
    // Philadelphia — key-less CARTO SQL API; bound server-side to the view + 120 days.
    var q = "SELECT text_general_code, dispatch_date_time, the_geom FROM incidents_part1_part2 " +
      "WHERE dispatch_date_time > current_date - interval '120 days' AND ST_Intersects(the_geom, " +
      "ST_MakeEnvelope(" + minLng + "," + minLat + "," + maxLng + "," + maxLat + ",4326)) " +
      "ORDER BY dispatch_date_time DESC LIMIT 600";
    var uc = 'https://phl.carto.com/api/v2/sql?format=geojson&q=' + encodeURIComponent(q);
    return fetch(uc).then(jsonOk).then(function (g) {
      return ((g && g.features) || []).map(function (ft) {
        var co = ft.geometry && ft.geometry.coordinates, p = ft.properties || {};
        return { lat: co ? parseFloat(co[1]) : NaN, lng: co ? parseFloat(co[0]) : NaN, cat: p.text_general_code, date: (p.dispatch_date_time || '').slice(0, 10) };
      }).filter(function (pt) { return _inBounds(pt, minLat, minLng, maxLat, maxLng); });
    });
  }

  // default: flat Socrata SODA
  var fl = src.f;
  var where = fl.lat + ' between ' + minLat + ' and ' + maxLat + ' AND ' + fl.lng + ' between ' + minLng + ' and ' + maxLng;
  var u3 = src.host + '/resource/' + src.ds + '.json?$select=' + encodeURIComponent(fl.lat + ',' + fl.lng + ',' + fl.cat + ',' + fl.date) +
    '&$where=' + encodeURIComponent(where) + '&$order=' + encodeURIComponent(fl.date + ' DESC') + '&$limit=600';
  return fetch(u3).then(jsonOk).then(function (j) {
    return (j || []).map(function (x) {
      return { lat: parseFloat(x[fl.lat]), lng: parseFloat(x[fl.lng]), cat: x[fl.cat], date: (x[fl.date] || '').slice(0, 10) };
    }).filter(function (p) { return _inBounds(p, minLat, minLng, maxLat, maxLng); });
  });
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

// ═══════════════════════════════════════════════════════════════════════════
// UI MASTER BUILD v2 — NAVIGATION & PANEL MODULE
// Self-contained. Initialised by navInit() called after the map is ready.
// All functions are prefixed na_ to avoid collisions with existing globals.
// ═══════════════════════════════════════════════════════════════════════════

// ── Toast notification system ─────────────────────────────────────────────
function na_toast(message, durationMs) {
  var dur = durationMs || 2500;
  var container = document.getElementById('na-toast-container');
  if (!container) return;

  // Remove any existing toast immediately
  var existing = container.querySelector('.na-toast');
  if (existing) existing.remove();

  var el = document.createElement('div');
  el.className = 'na-toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  container.appendChild(el);

  var timer = setTimeout(function() {
    el.classList.add('dismissing');
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
  }, dur);

  el.addEventListener('click', function() {
    clearTimeout(timer);
    el.classList.add('dismissing');
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
  });
}

// ── Theme system ──────────────────────────────────────────────────────────
// Day / Night identity. Three modes:
//   'light' — day chart (forced),  'dark' — night chart (forced),
//   'auto'  — the almanac's sun-aware identity: follows the visitor's local
//             clock and flips the chart between day and night at dawn/dusk,
//             even while the app stays open.
var _naThemeMode = 'auto';   // user's chosen mode: 'light' | 'dark' | 'auto'
var _naEffective = 'dark';   // theme currently applied to the document
var _naAutoTimer = null;
var _naThemeFocusBound = false;

// Resolve 'auto' to a concrete theme from the local hour. Day = 06:00–17:59.
// No geolocation needed — the device clock is already local to the traveller.
function _naResolveAuto() {
  var h = new Date().getHours();
  return (h >= 6 && h < 18) ? 'light' : 'dark';
}

// Reflect the current mode + effective state on the document and the header
// button (title/aria announce the next action; data-* hooks let CSS respond).
function _naUpdateThemeBtn() {
  document.documentElement.setAttribute('data-daynight', _naEffective);
  document.documentElement.setAttribute('data-thememode', _naThemeMode);
  var btn = document.getElementById('na-theme-btn');
  if (!btn) return;
  var label = _naThemeMode === 'auto'
    ? 'Theme: Auto — follows your local sun (now ' + (_naEffective === 'light' ? 'day' : 'night') + '). Click for Day.'
    : _naThemeMode === 'light'
      ? 'Theme: Day chart. Click for Night.'
      : 'Theme: Night chart. Click for Auto.';
  btn.setAttribute('title', label);
  btn.setAttribute('aria-label', label);
  // Emoji glyph reflects the current mode: ☀️ day, 🌙 night, 🌗 sun-aware auto.
  var emoji = _naThemeMode === 'light' ? '☀️' : _naThemeMode === 'dark' ? '🌙' : '🌗';
  btn.innerHTML = '<span aria-hidden="true" style="font-size:18px;line-height:1">' + emoji + '</span>';
}

// Apply only the effective theme to the document (shared by setMode + auto-tick).
function _naApplyEffective(effective) {
  _naEffective = effective;
  // removeAttribute for dark (default) keeps [data-theme="light"] clean and
  // leaves the HTML element free of a spurious empty attribute.
  if (effective === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
  _naSyncBasemapToTheme();
}

// Night identity shows the planet from space at night (NASA Black Marble city
// lights); day shows satellite imagery — with the city markers riding on top in
// both. Only ever swaps those two default views, and never once the traveller
// has pinned a basemap explicitly (Street / Terrain / Satellite are respected).
function _naSyncBasemapToTheme() {
  if (_naBootstrapping) return;   // first load opens on satellite even under the dark default
  if (_basemapUserPinned) return;
  if (typeof na_setBasemap !== 'function' || !map || !window._BASEMAP_CONFIGS) return;
  if (_naEffective === 'dark') {
    if (_mapStyle === 'satellite' || _mapStyle === 'dark') na_setBasemap('nightlights');
  } else {
    if (_mapStyle === 'nightlights') na_setBasemap('satellite');
  }
}

function na_applyTheme(mode) {
  if (mode !== 'light' && mode !== 'dark' && mode !== 'auto') mode = 'auto';
  _naThemeMode = mode;
  _naApplyEffective(mode === 'auto' ? _naResolveAuto() : mode);
  try { localStorage.setItem('na_theme', mode); } catch(e) {}
  _naUpdateThemeBtn();
  _naStartAutoWatch();
}

// While in auto mode, re-resolve every 10 minutes so the chart flips at
// dawn/dusk without a reload. Inert (and cleared) in the forced modes.
function _naStartAutoWatch() {
  if (_naAutoTimer) { clearInterval(_naAutoTimer); _naAutoTimer = null; }
  if (_naThemeMode !== 'auto') return;
  _naAutoTimer = setInterval(_naAutoReResolve, 600000);
}
function _naAutoReResolve() {
  if (_naThemeMode !== 'auto') return;
  var want = _naResolveAuto();
  if (want === _naEffective) return;
  _naApplyEffective(want);
  _naUpdateThemeBtn();
}

function na_initTheme() {
  var stored = null;
  try { stored = localStorage.getItem('na_theme'); } catch(e) {}
  // New visitors open in DAY (light) so the almanac never launches in night
  // mode; returning users keep whatever they last chose (light / dark / auto).
  na_applyTheme(stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'light');
  // Re-check when the tab regains focus (e.g., left open past dusk).
  if (!_naThemeFocusBound) {
    _naThemeFocusBound = true;
    document.addEventListener('visibilitychange', function () { if (!document.hidden) _naAutoReResolve(); });
    window.addEventListener('focus', _naAutoReResolve);
  }
}

// Header button + 'T' shortcut cycle the modes: Auto → Day → Night → Auto.
function na_toggleTheme() {
  var next = _naThemeMode === 'auto' ? 'light' : _naThemeMode === 'light' ? 'dark' : 'auto';
  na_applyTheme(next);
  var msg = next === 'auto'
    ? 'Auto — chart follows your local sun (now ' + (_naEffective === 'light' ? 'day' : 'night') + ').'
    : next === 'light' ? 'Day chart.' : 'Night chart.';
  na_toast(msg);
}

// ── Sidebar accordion ─────────────────────────────────────────────────────
function na_initAccordion() {
  var triggers = document.querySelectorAll('.na-accordion-trigger');
  triggers.forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      var id = trigger.getAttribute('aria-controls');
      if (!id) return;
      var body = document.getElementById(id);
      if (!body) return;
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      body.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
      body.classList.toggle('open', !isOpen);
      // Persist in sessionStorage
      try { sessionStorage.setItem('na_accordion_' + id, isOpen ? '0' : '1'); } catch(e) {}
    });

    // Restore state — layers accordion defaults to open; others default to closed
    var id = trigger.getAttribute('aria-controls');
    var saved = null;
    try { saved = sessionStorage.getItem('na_accordion_' + id); } catch(e) {}
    var defaultOpen = (id === 'na-layers-list'); // layers always start open unless user closed it
    var shouldOpen = (saved === '1') || (saved === null && defaultOpen);
    if (shouldOpen) {
      trigger.setAttribute('aria-expanded', 'true');
      var body = document.getElementById(id);
      if (body) { body.setAttribute('aria-hidden', 'false'); body.classList.add('open'); }
    } else if (saved === '0' && defaultOpen) {
      // User explicitly closed the layers accordion — respect that
      trigger.setAttribute('aria-expanded', 'false');
      var body = document.getElementById(id);
      if (body) { body.setAttribute('aria-hidden', 'true'); body.classList.remove('open'); }
    }
  });
}

// ── Layer navigation items (sidebar + bottom sheet) ───────────────────────
// Generate the sidebar accordion AND the mobile layers sheet from the full LAYERS
// set so every intelligence layer is reachable on every breakpoint (previously
// both surfaces hard-coded only 8 of 31, and the topbar pills are hidden on desktop).
// Ordered: primary keys, then category groups, then any remaining layers (incl. the
// elevation tile overlay). Items route through toggleLayer() via na_initLayerItems().
function na_populateLayerSurfaces() {
  if (typeof LAYERS === 'undefined') return;
  var seen = {}, ordered = [];
  function add(k) { if (k && LAYERS[k] && !seen[k]) { seen[k] = 1; ordered.push(k); } }
  (typeof PRIMARY_LAYER_KEYS !== 'undefined' ? PRIMARY_LAYER_KEYS : []).forEach(add);
  (typeof CAT_GROUPS !== 'undefined' ? CAT_GROUPS : []).forEach(function (g) { (g.keys || []).forEach(add); });
  Object.keys(LAYERS).forEach(add);

  function buildItem(k, cls, labelCls) {
    var L = LAYERS[k];
    var b = document.createElement('button');
    b.className = cls;
    b.setAttribute('data-layer', k);
    b.setAttribute('aria-label', L.name || k);
    var em = document.createElement('span');
    em.className = 'na-layer-emoji';
    em.setAttribute('aria-hidden', 'true');
    em.textContent = L.emoji || '•';
    var nm = document.createElement('span');
    if (labelCls) nm.className = labelCls;
    nm.textContent = L.name || k;
    b.appendChild(em);
    b.appendChild(nm);
    return b;
  }

  var grid = document.getElementById('na-sheet-grid');
  if (grid) { grid.textContent = ''; ordered.forEach(function (k) { grid.appendChild(buildItem(k, 'na-sheet-item', null)); }); }

  var list = document.getElementById('na-layers-list');
  if (list) { list.textContent = ''; ordered.forEach(function (k) { list.appendChild(buildItem(k, 'na-nav-item na-layer-item', 'na-nav-item-label')); }); }
  na_buildPersonaRow();
}

// "Who's travelling?" persona presets — one tap activates a curated layer basket,
// giving the clean-open map an on-ramp. Only keys present in LAYERS are applied.
var NA_PERSONAS = [
  { id: 'solo',   label: 'Solo',   emoji: '🎒', layers: ['safety', 'cost', 'solo', 'nightlife', 'english'] },
  { id: 'couple', label: 'Couple', emoji: '💞', layers: ['weather', 'safety', 'beaches', 'cost', 'nightlife'] },
  { id: 'family', label: 'Family', emoji: '👪', layers: ['family', 'safety', 'healthcare', 'malaria', 'weather'] },
  { id: 'nomad',  label: 'Nomad',  emoji: '💻', layers: ['cost', 'internet', 'safety', 'visa', 'english'] },
];
function na_applyPersona(id) {
  var p = NA_PERSONAS.find(function (x) { return x.id === id; });
  if (!p || typeof activeLayers === 'undefined' || typeof LAYERS === 'undefined') return;
  activeLayers.clear();
  var on = [];
  p.layers.forEach(function (k) { if (LAYERS[k]) { activeLayers.add(k); on.push(k); } });
  if (typeof refresh === 'function') refresh();
  if (typeof updateURLState === 'function') updateURLState();
  if (typeof saveState === 'function') saveState();
  if (typeof na_closeLayersSheet === 'function') na_closeLayersSheet();
  if (typeof na_toast === 'function') na_toast(p.emoji + ' ' + p.label + ' view — ' + on.length + ' layers on', 2600);
}
function na_buildPersonaRow() {
  var panel = document.getElementById('na-sheet-panel');
  var grid = document.getElementById('na-sheet-grid');
  if (!panel || !grid || document.getElementById('na-persona-row')) return;
  var row = document.createElement('div');
  row.id = 'na-persona-row';
  var lbl = document.createElement('div');
  lbl.className = 'na-persona-label';
  lbl.textContent = "Who's travelling?";
  row.appendChild(lbl);
  var btns = document.createElement('div');
  btns.className = 'na-persona-btns';
  NA_PERSONAS.forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'na-persona-btn';
    b.setAttribute('data-persona', p.id);
    b.setAttribute('aria-label', p.label + ' traveller preset');
    b.innerHTML = '<span class="na-persona-emoji" aria-hidden="true">' + p.emoji + '</span>' + p.label;
    b.addEventListener('click', function () { na_applyPersona(p.id); });
    btns.appendChild(b);
  });
  row.appendChild(btns);
  panel.insertBefore(row, grid);
}

function na_initLayerItems() {
  var items = document.querySelectorAll('.na-layer-item, .na-sheet-item');
  items.forEach(function(item) {
    var layerKey = item.getAttribute('data-layer');
    if (!layerKey) return;
    item.addEventListener('click', function() {
      // Delegate to existing toggleLayer() function in app.js
      if (typeof toggleLayer === 'function') {
        toggleLayer(layerKey);
      } else {
        // Fallback: click the existing layer button if it exists
        var lb = document.querySelector('.lb[data-key="' + layerKey + '"]');
        if (lb) lb.click();
      }
      na_updateLayerActiveStates();
      // Close bottom sheet if open
      na_closeLayersSheet();
    });
  });
}

// Keep sidebar / sheet layer item visual states in sync with activeLayers
function na_updateLayerActiveStates() {
  var items = document.querySelectorAll('.na-layer-item, .na-sheet-item');
  items.forEach(function(item) {
    var layerKey = item.getAttribute('data-layer');
    if (!layerKey) return;
    var on = (typeof activeLayers !== 'undefined') && activeLayers.has(layerKey);
    item.classList.toggle('active', on);
    item.classList.toggle('layer-active', on);
  });

  // Keep the topbar layer pills + category buttons in sync too, so every layer
  // surface reflects activeLayers no matter how it changed (pill, sidebar, sheet,
  // persona preset, or URL restore) — not just clicks routed through a pill.
  document.querySelectorAll('.lb[data-key]').forEach(function(b) {
    b.classList.toggle('on', (typeof activeLayers !== 'undefined') && activeLayers.has(b.dataset.key));
  });
  if (typeof syncCatButtons === 'function') syncCatButtons();

  // Update active badge on bottom nav layers button
  var badge = document.getElementById('na-active-badge');
  if (badge) {
    var activeList = [];
    if (typeof activeLayers !== 'undefined') {
      activeLayers.forEach(function(k) { activeList.push(k.toUpperCase().slice(0,4)); });
    }
    if (activeList.length > 0) {
      // One layer: show its abbreviation; multiple: show the count.
      badge.textContent = activeList.length === 1 ? activeList[0] : String(activeList.length);
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }
}

// ── Non-layer nav items ───────────────────────────────────────────────────
// Is the panel associated with a nav item currently open/visible?
function _navIsOpen(nav) {
  if (nav === 'bestmonth') { var l = document.getElementById('best-panel-list'); return !!(l && l.classList.contains('open')); }
  if (nav === 'planner' || nav === 'journey') { var p = document.getElementById('trip-panel'); return !!(p && p.classList.contains('open')); }
  if (nav === 'compare') { var c = document.getElementById('compare-panel'); return !!(c && c.classList.contains('open')); }
  if (nav === 'visa') { var a = document.activeElement; return !!(a && (a.id === 'passport-select' || (a.closest && a.closest('#na-sidebar-passport')))); }
  return false;
}
// Reflect a nav's open/closed state on every matching item (sidebar + bottom nav).
function _syncNavActive(nav) {
  var open = _navIsOpen(nav);
  document.querySelectorAll('[data-nav="' + nav + '"]').forEach(function (b) { b.classList.toggle('active', open); });
}

function na_initNavItems() {
  var items = document.querySelectorAll('.na-nav-item:not(.na-layer-item), .na-bottom-item');
  var TOGGLE = ['bestmonth', 'visa', 'planner', 'journey', 'compare'];
  items.forEach(function (item) {
    var nav = item.getAttribute('data-nav');
    if (!nav) return;
    item.addEventListener('click', function () {
      // For toggle navs, a second click on an already-open panel minimises it.
      var wasOpen = (TOGGLE.indexOf(nav) >= 0) ? _navIsOpen(nav) : false;
      switch (nav) {
        case 'worldmap':
          if (typeof map !== 'undefined' && map) map.setView([20, 0], 2);
          break;
        case 'bestmonth':
          var bestToggle = document.getElementById('best-toggle');
          if (bestToggle) bestToggle.click();   // toggles list + arms/clears auto-minimise
          break;
        case 'visa':
          var ps = document.querySelector('#na-sidebar-passport select') || document.getElementById('passport-select');
          if (wasOpen) { if (ps) ps.blur(); }
          else if (ps) { ps.focus(); ps.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
          break;
        case 'planner':
        case 'journey':
          var panel = document.getElementById('trip-panel');
          if (panel) panel.classList.toggle('open', !wasOpen);
          break;
        case 'compare':
          if (wasOpen) closeComparePanel(); else openComparePanel();
          break;
        case 'layers':
          na_openLayersSheet();
          break;
        case 'preferences':
          na_openPrefsSheet();
          break;
        default:
          break;
      }
      // Active state: toggle navs mirror their panel's open state across all
      // matching items; transient navs (worldmap/layers/preferences) just highlight.
      if (TOGGLE.indexOf(nav) >= 0) {
        _syncNavActive(nav);
      } else {
        document.querySelectorAll('.na-bottom-item, .na-nav-item:not(.na-layer-item)').forEach(function (b) {
          if (TOGGLE.indexOf(b.getAttribute('data-nav')) < 0) b.classList.remove('active');
        });
        item.classList.add('active');
      }
    });
  });
}

// ── Mobile layers bottom sheet ────────────────────────────────────────────
function na_openLayersSheet() {
  var sheet = document.getElementById('na-layers-sheet');
  var btn   = document.getElementById('na-layers-toggle');
  if (!sheet) return;
  sheet.hidden = false;
  if (btn) btn.setAttribute('aria-expanded', 'true');
  // Focus trap: first focusable element in sheet
  setTimeout(function() {
    var first = sheet.querySelector('button, [tabindex="0"]');
    if (first) first.focus();
  }, 50);
  document.body.style.overflow = 'hidden';
}

function na_closeLayersSheet() {
  var sheet = document.getElementById('na-layers-sheet');
  var btn   = document.getElementById('na-layers-toggle');
  if (!sheet) return;
  sheet.hidden = true;
  if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
  document.body.style.overflow = '';
}

function na_initLayersSheet() {
  var sheet = document.getElementById('na-layers-sheet');
  if (!sheet) return;
  var overlay = document.getElementById('na-sheet-overlay');
  if (overlay) {
    overlay.addEventListener('click', na_closeLayersSheet);
  }
  // Swipe down to close
  var panel = document.getElementById('na-sheet-panel');
  if (panel) {
    var startY = 0;
    panel.addEventListener('touchstart', function(e) { startY = e.touches[0].clientY; }, {passive:true});
    panel.addEventListener('touchend', function(e) {
      if (e.changedTouches[0].clientY - startY > 60) na_closeLayersSheet();
    }, {passive:true});
  }
}

// ── Preferences Sheet ─────────────────────────────────────────────────────
function na_setBasemap(style) {
  var configs = window._BASEMAP_CONFIGS;
  if (!configs || !configs[style] || !map) return;
  var bc = configs[style];
  // Recreate the tile layer rather than setUrl(): subdomains, maxZoom and
  // maxNativeZoom differ per style, and setUrl() leaves those stale — which
  // breaks {s}-templated styles (street/dark/terrain) when switching away from
  // satellite (no subdomains). Recreating guarantees correct tiles every time.
  if (_basemapLayer) map.removeLayer(_basemapLayer);
  _basemapLayer = L.tileLayer(bc.url, {
    attribution:   bc.attribution,
    maxZoom:       bc.maxZoom       || 19,
    maxNativeZoom: bc.maxNativeZoom || bc.maxZoom || 19,
    subdomains:    bc.subdomains    || 'abc',
    errorTileUrl:  '',
  }).addTo(map);
  // OpenTopoMap (Terrain) is a restricted-use, rate-limited provider. If its tiles
  // start failing, revert to satellite instead of rendering silent blank tiles
  // (STATIC SITE RUNTIME DEPENDENCY RULE — external data must never fail silently).
  if (style === 'terrain') {
    var _terrErrs = 0;
    _basemapLayer.on('tileerror', function () {
      if (_mapStyle !== 'terrain') return;
      if (++_terrErrs === 5) {
        if (typeof na_toast === 'function') na_toast('Terrain tiles are unavailable right now — switched to Satellite.', 4000);
        na_setBasemap('satellite');
      }
    });
  }
  _mapStyle = style;
  localStorage.setItem('na_mapstyle', style);
  na_updateAttribution();
  na_syncPrefsUI();
}

// Compose the attribution from the active basemap + the labels overlay (when on)
// + the persistent geoBoundaries admin-2 credit, so switching basemaps never drops
// a required licence credit (CARTO / OpenTopoMap / geoBoundaries each require it).
function na_updateAttribution() {
  if (!map || !map.attributionControl) return;
  var configs = window._BASEMAP_CONFIGS || {};
  var parts = [];
  if (configs[_mapStyle] && configs[_mapStyle].attribution) parts.push(configs[_mapStyle].attribution);
  if (_labelsOn) parts.push('Labels &copy; <a href="https://carto.com/attributions">CARTO</a>');
  parts.push('Admin-2: <a href="https://www.geoboundaries.org">geoBoundaries</a> (CC-BY 4.0)');
  map.attributionControl.getContainer().innerHTML = parts.join(' &nbsp;|&nbsp; ');
}

// Toggle the place-labels overlay independently of the basemap.
function na_toggleLabels(on) {
  _labelsOn = (typeof on === 'boolean') ? on : !_labelsOn;
  if (_labelLayer && map) {
    if (_labelsOn) { if (!map.hasLayer(_labelLayer)) _labelLayer.addTo(map); }
    else if (map.hasLayer(_labelLayer)) map.removeLayer(_labelLayer);
  }
  localStorage.setItem('na_labels', _labelsOn ? '1' : '0');
  na_updateAttribution();
  na_syncPrefsUI();
}

// Build the visible on-map basemap switcher (Street/Satellite/Terrain/Dark) plus
// a Labels toggle — the Google-Maps-style control the product calls for.
// Standalone preferences launcher — a single gear button at the bottom-right of
// the map, where the basemap options used to live. Clicking it opens the full
// Preferences panel (map view, labels, and units) — the same panel reachable from
// the left sidebar's Preferences item. The old always-expanded basemap/labels
// switcher was folded into Preferences (Map Style + Place Labels rows).
function na_initPrefsLauncher() {
  // The floating gear was a third, redundant route to Preferences. Preferences
  // is now a single icon in the bottom menu (Settings). We no longer create the
  // gear; we only keep the attribution refresh that used to run here. If a stale
  // gear exists in the DOM (e.g. cached markup), remove it.
  var stale = document.getElementById('na-prefs-launcher');
  if (stale && stale.parentNode) stale.parentNode.removeChild(stale);
  na_updateAttribution();
}

function na_openPrefsSheet() {
  var sheet = document.getElementById('na-prefs-sheet');
  if (!sheet) return;
  sheet.hidden = false;
  na_syncPrefsUI();
  document.body.style.overflow = 'hidden';
  setTimeout(function() {
    var first = sheet.querySelector('.pref-opt');
    if (first) first.focus();
  }, 50);
}

function na_closePrefsSheet() {
  var sheet = document.getElementById('na-prefs-sheet');
  if (!sheet) return;
  sheet.hidden = true;
  document.body.style.overflow = '';
}

// Refresh active states on all pref-opt buttons to match current values.
function na_syncPrefsUI() {
  var map_pref = {
    'pref-temp':       _tempUnit,
    'pref-dist':       _distUnit,
    'pref-basemap':    _mapStyle,
    'pref-dateformat': _dateFormat,
    'pref-clock':      _clockFormat,
    'pref-labels':     (_labelsOn ? 'on' : 'off'),
  };
  Object.keys(map_pref).forEach(function(id) {
    var grp = document.getElementById(id);
    if (!grp) return;
    var val = map_pref[id];
    grp.querySelectorAll('.pref-opt').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.val === val);
    });
  });
}

function na_initPrefsSheet() {
  var sheet = document.getElementById('na-prefs-sheet');
  if (!sheet) return;

  // Overlay click to close
  var overlay = document.getElementById('na-prefs-overlay');
  if (overlay) overlay.addEventListener('click', na_closePrefsSheet);

  // Swipe-down to close
  var panel = document.getElementById('na-prefs-panel');
  if (panel) {
    var startY = 0;
    panel.addEventListener('touchstart', function(e) { startY = e.touches[0].clientY; }, {passive:true});
    panel.addEventListener('touchend', function(e) {
      if (e.changedTouches[0].clientY - startY > 60) na_closePrefsSheet();
    }, {passive:true});
  }

  // Wire all pref-opt buttons
  sheet.querySelectorAll('.pref-opt').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var grp = btn.closest('.pref-toggle-group');
      if (!grp) return;
      var id  = grp.id;
      var val = btn.dataset.val;

      if (id === 'pref-temp') {
        if (_tempUnit !== val) toggleTempUnit();
        // sync prefs panel btn to the in-page toggle (in case user flipped it there)
      } else if (id === 'pref-dist') {
        if (_distUnit !== val) {
          _distUnit = val;
          localStorage.setItem('na_dist', _distUnit);
          var distBtn = document.getElementById('btn-dist-unit');
          if (distBtn) distBtn.textContent = _distUnit === 'km' ? 'km' : 'mi';
        }
      } else if (id === 'pref-basemap') {
        _basemapUserPinned = true;   // explicit pick — stop theme-driven basemap swaps
        na_setBasemap(val);
      } else if (id === 'pref-dateformat') {
        _dateFormat = val;
        localStorage.setItem('na_datefmt', _dateFormat);
      } else if (id === 'pref-clock') {
        _clockFormat = val;
        localStorage.setItem('na_clockfmt', _clockFormat);
      } else if (id === 'pref-labels') {
        na_toggleLabels(val === 'on');
      }
      na_syncPrefsUI();
    });
  });

  // Guided tour launcher (not a toggle-group — handled separately).
  var tourBtn = document.getElementById('na-prefs-tour');
  if (tourBtn) tourBtn.addEventListener('click', function () {
    na_closePrefsSheet();
    if (typeof startTour === 'function') setTimeout(startTour, 280);
  });

  var tutBtn = document.getElementById('na-prefs-tutorial');
  if (tutBtn) tutBtn.addEventListener('click', function () {
    na_closePrefsSheet();
    if (typeof na_openTutorial === 'function') setTimeout(na_openTutorial, 200);
  });
  var faqBtn = document.getElementById('na-prefs-faq');
  if (faqBtn) faqBtn.addEventListener('click', function () {
    na_closePrefsSheet();
    if (typeof na_openFaq === 'function') setTimeout(na_openFaq, 200);
  });

  // Build the language + currency pickers and the FX "as of" note.
  var langWrap = document.getElementById('pref-lang-picker');
  if (langWrap) { langWrap.innerHTML = na_buildLangPicker(); na_wireLangPicker(langWrap); }
  var currWrap = document.getElementById('pref-curr-picker');
  if (currWrap) { currWrap.innerHTML = na_buildCurrencyPicker(); na_wireCurrencyPicker(currWrap); }
  var currNote = document.getElementById('pref-curr-note');
  if (currNote) currNote.textContent = 'Rates as of ' + (typeof _RATES_AS_OF !== 'undefined' ? _RATES_AS_OF : '');

  na_syncPrefsUI();
}

// ── Global search overlay ─────────────────────────────────────────────────
// Fly to a country and open its dossier, mirroring a map click but reachable from
// the keyboard (search results). Moves focus into the dossier for accessibility.
function na_openCountryDossier(iso2) {
  if (!iso2 || typeof buildCountryTooltip !== 'function' || typeof toggleTooltip !== 'function') return;
  var center = (typeof COUNTRY_CENTERS !== 'undefined' && COUNTRY_CENTERS[iso2]) || null;
  if (center && map) map.flyTo(center, 5, { duration: 1.0 });
  var html = buildCountryTooltip(iso2);
  if (!html) return;
  // No click coordinates from search — anchor the dossier over the map.
  toggleTooltip('country:' + iso2, html, Math.round(window.innerWidth * 0.5), Math.round(window.innerHeight * 0.4));
  if (center && typeof _injectWeatherRow === 'function') { try { _injectWeatherRow(iso2, center[0], center[1]); } catch (e) {} }
  var ic = document.getElementById('intel-' + iso2);
  if (ic && typeof _renderCountryIntel === 'function') {
    _renderCountryIntel(iso2, (typeof countryNames !== 'undefined' && countryNames[iso2]) || iso2, ic);
  }
  var tt = document.getElementById('tt');
  if (tt) { tt.setAttribute('tabindex', '-1'); setTimeout(function () { try { tt.focus(); } catch (e) {} }, 80); }
}

function na_openSearch() {
  var overlay = document.getElementById('na-search-overlay');
  var input   = document.getElementById('na-search-input');
  if (!overlay) return;
  overlay.hidden = false;
  if (input) input.focus();
  document.body.style.overflow = 'hidden';
}

function na_closeSearch() {
  var overlay = document.getElementById('na-search-overlay');
  if (!overlay) return;
  overlay.hidden = true;
  document.body.style.overflow = '';
}

function na_initSearch() {
  var backdrop = document.getElementById('na-search-backdrop');
  var input    = document.getElementById('na-search-input');
  var results  = document.getElementById('na-search-results');

  if (backdrop) backdrop.addEventListener('click', na_closeSearch);

  if (input) {
    input.addEventListener('input', function() {
      var q = input.value.trim().toLowerCase();
      if (!results) return;
      if (q.length < 2) { results.innerHTML = ''; return; }

      var matches = [];
      // Search country names from existing countryNames object
      if (typeof countryNames === 'object') {
        Object.keys(countryNames).forEach(function(iso2) {
          var name = countryNames[iso2] || '';
          if (name.toLowerCase().indexOf(q) !== -1) {
            matches.push({ type: 'country', label: name, key: iso2 });
          }
        });
      }
      // Search layer names from existing LAYERS object
      if (typeof LAYERS === 'object') {
        Object.keys(LAYERS).forEach(function(k) {
          var lbl = (LAYERS[k].label || k).toLowerCase();
          if (lbl.indexOf(q) !== -1) {
            matches.push({ type: 'layer', label: LAYERS[k].label || k, key: k });
          }
        });
      }

      // Render top 8 matches — use DOM creation, never innerHTML, for any
      // string that might derive from data sources (defense in depth).
      results.innerHTML = '';
      matches.slice(0, 8).forEach(function(m) {
        var el = document.createElement('div');
        el.className = 'na-search-result';
        var typeSpan = document.createElement('span');
        typeSpan.className = 'na-search-result-type';
        typeSpan.textContent = m.type;
        var labelSpan = document.createElement('span');
        labelSpan.textContent = m.label;
        el.appendChild(typeSpan);
        el.appendChild(labelSpan);
        el.addEventListener('click', function() {
          na_closeSearch();
          if (m.type === 'layer') {
            if (typeof toggleLayer === 'function') toggleLayer(m.key);
            na_updateLayerActiveStates();
          } else if (m.type === 'country') {
            // Fly to the country AND open its dossier (keyboard-reachable intelligence).
            na_openCountryDossier(m.key);
          }
        });
        results.appendChild(el);
      });
      if (matches.length === 0) {
        results.innerHTML = '<div class="terra-incognita">Terra Incognita</div>';
      }
    });
  }

  // Header search button
  var btn = document.getElementById('na-search-btn');
  if (btn) btn.addEventListener('click', na_openSearch);

  // Surface the criteria-finder + Surprise Me on mobile: the inline #search-wrap
  // (which hosts those buttons) is hidden < 540px, so add the triggers into the
  // full-screen search overlay, which is the mobile discovery surface.
  var sPanel = document.getElementById('na-search-panel');
  var sResults = document.getElementById('na-search-results');
  if (sPanel && sResults && !document.getElementById('na-search-quick')) {
    var qa = document.createElement('div');
    qa.id = 'na-search-quick';
    var b1 = document.createElement('button');
    b1.type = 'button'; b1.className = 'na-search-quick-btn';
    b1.textContent = '🎯 Best countries for…';
    b1.addEventListener('click', function () { na_closeSearch(); if (typeof _toggleBestForXPanel === 'function') _toggleBestForXPanel(); });
    var b2 = document.createElement('button');
    b2.type = 'button'; b2.className = 'na-search-quick-btn';
    b2.textContent = '🎲 Surprise me';
    b2.addEventListener('click', function () { na_closeSearch(); if (typeof _surpriseMe === 'function') _surpriseMe(); });
    qa.appendChild(b1); qa.appendChild(b2);
    sPanel.insertBefore(qa, sResults);
  }
}

// ── Keyboard navigation ───────────────────────────────────────────────────
// Trap Tab focus within whichever aria-modal sheet is open (search / layers / prefs)
// so keyboard users cannot tab out into the page behind the modal (WCAG 2.4.3).
function na_initFocusTraps() {
  function openModalPanel() {
    var s = document.getElementById('na-search-overlay');
    if (s && !s.hidden) return document.getElementById('na-search-panel') || s;
    var l = document.getElementById('na-layers-sheet');
    if (l && !l.hidden) return document.getElementById('na-sheet-panel') || l;
    var p = document.getElementById('na-prefs-sheet');
    if (p && !p.hidden) return document.getElementById('na-prefs-panel') || p;
    return null;
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var modal = openModalPanel();
    if (!modal) return;
    var sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    var f = [].filter.call(modal.querySelectorAll(sel), function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

function na_initKeyboard() {
  document.addEventListener('keydown', function(e) {
    // Cmd/Ctrl+K — command palette (search), from anywhere including inputs.
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      na_openSearch();
      return;
    }
    // '/' opens search from anywhere
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      var active = document.activeElement;
      var tag = active ? active.tagName : '';
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        na_openSearch();
        return;
      }
    }
    // 'T' toggles theme
    if (e.key === 'T' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      var active = document.activeElement;
      var tag = active ? active.tagName : '';
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        na_toggleTheme();
      }
    }
    // Escape closes any open overlay (search → sheet → compare → tooltip)
    if (e.key === 'Escape') {
      var searchOverlay = document.getElementById('na-search-overlay');
      if (searchOverlay && !searchOverlay.hidden) { na_closeSearch(); return; }
      var sheet = document.getElementById('na-layers-sheet');
      if (sheet && !sheet.hidden) { na_closeLayersSheet(); return; }
      var prefsSheet = document.getElementById('na-prefs-sheet');
      if (prefsSheet && !prefsSheet.hidden) { na_closePrefsSheet(); return; }
      var compare = document.getElementById('compare-panel');
      if (compare && compare.classList.contains('open')) {
        compare.classList.remove('open');
        compare.style.display = 'none';
        return;
      }
    }
    // Digit keys 1-8: quick-activate intelligence layers in order
    var layerOrder = ['safety','cost','weather','health','tipping','english','elevation','nomad'];
    var digit = parseInt(e.key, 10);
    if (!isNaN(digit) && digit >= 1 && digit <= 8 && !e.ctrlKey && !e.metaKey) {
      var active = document.activeElement;
      var tag = active ? active.tagName : '';
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        var lk = layerOrder[digit - 1];
        if (lk && typeof toggleLayer === 'function') {
          toggleLayer(lk);
          na_updateLayerActiveStates();
          na_toast('Layer: ' + lk.charAt(0).toUpperCase() + lk.slice(1));
        }
      }
    }
  });

  // Sidebar keyboard: arrow up/down navigates between nav items
  var sidebar = document.getElementById('na-sidebar');
  if (sidebar) {
    sidebar.addEventListener('keydown', function(e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var items = Array.from(sidebar.querySelectorAll('.na-nav-item:not([disabled])'));
      var idx = items.indexOf(document.activeElement);
      if (idx === -1) return;
      e.preventDefault();
      var next = e.key === 'ArrowDown' ? Math.min(idx + 1, items.length - 1) : Math.max(idx - 1, 0);
      items[next].focus();
    });
  }
}

// ── Header action buttons ─────────────────────────────────────────────────
function na_initHeaderActions() {
  var themeBtn = document.getElementById('na-theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', na_toggleTheme);

  var layersBtn = document.getElementById('na-layers-btn');
  if (layersBtn) layersBtn.addEventListener('click', function () {
    if (typeof na_openLayersSheet === 'function') na_openLayersSheet();
  });

  var shareBtn = document.getElementById('na-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      if (typeof updateURLState === 'function') updateURLState();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href)
          .then(function() { na_toast('Copied to chart.'); })
          .catch(function() { na_toast('Copy failed — try manually.'); });
      } else {
        na_toast('Share: ' + window.location.href);
      }
    });
  }
}

// ── Sidebar sidebar-passport mirror (desktop) ─────────────────────────────
function na_initSidebarMirrors() {
  // Mirror month buttons into the sidebar
  var sidebarMonths = document.getElementById('na-sidebar-months');
  if (sidebarMonths) {
    var MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    MONTH_LABELS.forEach(function(label, idx) {
      var btn = document.createElement('button');
      btn.className = 'smb';
      btn.textContent = label;
      btn.setAttribute('aria-label', label);
      btn.addEventListener('click', function() {
        // Delegate to existing month click handler
        var existing = document.querySelectorAll('.mb');
        if (existing[idx]) existing[idx].click();
        // Update sidebar month active states
        na_syncSidebarMonths();
      });
      sidebarMonths.appendChild(btn);
    });
    na_syncSidebarMonths();
  }

  // Mirror passport selector into sidebar. Build the options straight from the data
  // (NOT cloneNode of #passport-select) so it never depends on whether
  // initNationalitySelector() has already populated the original — that timing gap
  // previously left the sidebar selector with only its placeholder, so choosing a
  // nationality there did nothing.
  var sidebarPassport = document.getElementById('na-sidebar-passport');
  var origSelect = document.getElementById('passport-select');
  if (sidebarPassport && origSelect && !document.getElementById('na-sidebar-passport-select')) {
    var cloneSelect = document.createElement('select');
    cloneSelect.id = 'na-sidebar-passport-select';
    cloneSelect.className = origSelect.className;
    cloneSelect.setAttribute('aria-label', 'Select your nationality for visa requirements');
    var ph = document.createElement('option');
    ph.value = ''; ph.textContent = '🌍 Nationality…';
    cloneSelect.appendChild(ph);
    if (typeof PASSPORT_NATIONALITIES !== 'undefined') {
      Object.keys(PASSPORT_NATIONALITIES).forEach(function(code) {
        var opt = document.createElement('option');
        opt.value = code; opt.textContent = PASSPORT_NATIONALITIES[code];
        cloneSelect.appendChild(opt);
      });
    }
    cloneSelect.value = origSelect.value || (typeof selectedNationality !== 'undefined' && selectedNationality) || '';
    cloneSelect.addEventListener('change', function() {
      origSelect.value = cloneSelect.value;
      origSelect.dispatchEvent(new Event('change', {bubbles:true}));
    });
    sidebarPassport.appendChild(cloneSelect);
    // Keep the sidebar selector in sync when the nationality changes elsewhere.
    origSelect.addEventListener('change', function() {
      cloneSelect.value = origSelect.value;
    });
  }
}

function na_syncSidebarMonths() {
  var sidebarMonths = document.getElementById('na-sidebar-months');
  if (!sidebarMonths) return;
  var origBtns = document.querySelectorAll('.mb');
  var sideBtns = sidebarMonths.querySelectorAll('.smb');
  sideBtns.forEach(function(btn, i) {
    if (origBtns[i]) btn.classList.toggle('on', origBtns[i].classList.contains('on'));
  });
}

// ── Page Visibility API: pause/resume logo animations ─────────────────────
function na_initPageVisibility() {
  var animatedEls = null;

  function getAnimated() {
    if (!animatedEls) {
      animatedEls = document.querySelectorAll(
        '.naml-cring, .naml-needle, .naml-ship, .naml-sail, .naml-wv, .naml-drg, .naml-dtail, .naml-fire, .naml-fglow'
      );
    }
    return animatedEls;
  }

  document.addEventListener('visibilitychange', function() {
    var els = getAnimated();
    var state = document.hidden ? 'paused' : 'running';
    els.forEach(function(el) {
      el.style.animationPlayState = state;
    });
  });
}

// ── will-change cleanup (perf: remove after animations settle) ────────────
function na_cleanWillChange() {
  setTimeout(function() {
    var needle = document.querySelector('.naml-needle');
    if (needle) needle.style.willChange = 'auto';
  }, 3000);
}

// ── URL hash state extension for nav ─────────────────────────────────────
// Reads 'nav=' param from hash on load; writes it on state changes.
// Integrates with existing updateURLState() and initURLState().
function na_patchURLState() {
  // Extend existing updateURLState to also write nav state
  if (typeof updateURLState === 'function') {
    var _origUpdateURLState = updateURLState;
    window.updateURLState = function() {
      _origUpdateURLState.apply(this, arguments);
      // The existing function writes to window.location.hash; we just let it run.
    };
  }

  // Read nav param on load
  try {
    var hash = window.location.hash.replace(/^#/, '');
    var params = new URLSearchParams(hash);
    var navParam = params.get('nav');
    if (navParam === 'layers') {
      // Open the layers accordion if layers nav was active
      var acc = document.getElementById('na-layers-list');
      var trigger = document.querySelector('[aria-controls="na-layers-list"]');
      if (acc && trigger) {
        acc.classList.add('open');
        acc.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
      }
    }
  } catch(e) {}
}

// ── Logo hover: re-trigger needle settle ─────────────────────────────────
function na_initLogoHover() {
  var needle = document.querySelector('.naml-needle');
  var logo   = document.getElementById('na-logo');
  if (!needle || !logo) return;

  logo.addEventListener('mouseenter', function() {
    // Remove the ongoing seek animation, reapply settle from a random offset
    needle.style.animation = 'none';
    // Force reflow
    void needle.offsetHeight;
    needle.style.animation = 'namlSettle 2.4s cubic-bezier(0.34,1.2,0.64,1) forwards, namlSeek 8s ease-in-out 2.4s infinite';
  });
}

// ── Leaflet map resize on sidebar expand/collapse ─────────────────────────
// At the laptop breakpoint (1024–1279px) the sidebar expands on hover,
// changing the width of #na-main and therefore the Leaflet map container.
// Leaflet must be told about the resize after the CSS transition completes
// or tiles along the newly-revealed edge will not render.
function na_initMapResize() {
  var sidebar = document.getElementById('na-sidebar');
  if (!sidebar) return;
  sidebar.addEventListener('transitionend', function(e) {
    if (e.propertyName !== 'width') return;
    if (window.naMap && typeof window.naMap.invalidateSize === 'function') {
      window.naMap.invalidateSize({ animate: false });
    }
  });
}

// ── Click-to-collapse sidebar (desktop) ───────────────────────────────────
// The sidebar logo doubles as a collapse toggle: click (or Enter/Space) shrinks
// the sidebar to an icon rail and the map + legend reclaim the space. State is
// persisted so returning desktop users keep their preferred layout.
function na_initSidebarCollapse() {
  var sidebar = document.getElementById('na-sidebar');
  var logo    = document.getElementById('na-sidebar-logo');
  if (!sidebar || !logo) return;

  function apply(collapsed, persist) {
    sidebar.classList.toggle('collapsed', collapsed);
    logo.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
    logo.setAttribute('title', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
    logo.setAttribute('aria-label', collapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar');
    if (persist) { try { localStorage.setItem('na_sidebar_collapsed', collapsed ? '1' : '0'); } catch (e) {} }
    // Tell Leaflet about the new map width once the width transition settles
    // (na_initMapResize also catches transitionend; this is a belt-and-braces).
    if (map) setTimeout(function () { try { map.invalidateSize({ animate: false }); } catch (e) {} }, 320);
  }

  logo.setAttribute('role', 'button');
  logo.setAttribute('tabindex', '0');
  logo.addEventListener('click', function () { apply(!sidebar.classList.contains('collapsed'), true); });
  logo.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apply(!sidebar.classList.contains('collapsed'), true); }
  });

  // The persistent top-header brand also collapses/expands the left sidebar, so
  // the logo behaves consistently with the mobile-style top + bottom chrome.
  var headerLogo = document.getElementById('na-header-logo');
  if (headerLogo) {
    headerLogo.setAttribute('role', 'button');
    headerLogo.setAttribute('tabindex', '0');
    headerLogo.setAttribute('aria-label', 'Collapse or expand the navigation sidebar');
    headerLogo.style.cursor = 'pointer';
    headerLogo.addEventListener('click', function () { apply(!sidebar.classList.contains('collapsed'), true); });
    headerLogo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apply(!sidebar.classList.contains('collapsed'), true); }
    });
  }

  var saved = null;
  try { saved = localStorage.getItem('na_sidebar_collapsed'); } catch (e) {}
  apply(saved === '1', false);
}

// ── Master init ───────────────────────────────────────────────────────────
function navInit() {
  na_initTheme();
  na_populateLayerSurfaces();   // build all-layer sidebar + sheet before wiring clicks
  na_initAccordion();
  na_initLayerItems();
  na_initNavItems();
  na_initLayersSheet();
  na_initPrefsSheet();
  na_initSearch();
  na_initKeyboard();
  na_initFocusTraps();
  na_initHeaderActions();
  na_initSidebarMirrors();
  na_initPageVisibility();
  na_cleanWillChange();
  na_patchURLState();
  na_initLogoHover();
  na_initMapResize();
  na_initSidebarCollapse();
  na_initPrefsLauncher();
  na_initLangFab();

  // Apply the active language to all static chrome (and set <html lang/dir>).
  try { na_setLang(_lang); } catch (_e) {}

  // Layer-state UI is synced event-driven from refresh() (which runs on every
  // layer / month / passport change) — no idle polling timer. Initial sync now.
  na_updateLayerActiveStates();

  // Boot is complete. Re-enable theme→basemap coupling so a later Day/Night
  // toggle can swap satellite ↔ night-lights. The first load stays on satellite.
  _naBootstrapping = false;
}

// Call navInit after the DOM is ready and the map has initialised.
// Use a short defer to let app.js finish its own DOMContentLoaded handlers.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { setTimeout(navInit, 200); });
} else {
  setTimeout(navInit, 200);
}

// ─── Curated translations (es,fr,de,pt,ar,zh,hi,ja,ru) — generated, entity-decoded ───
Object.assign(_I18N, {
 "es": {
  "nav.worldMap": "Mapamundi",
  "nav.bestMonth": "Mejor este mes",
  "nav.passport": "Pasaporte y visado",
  "nav.planner": "Planificador de viaje",
  "nav.compare": "Comparar países",
  "nav.preferences": "Preferencias",
  "nav.explore": "Explorar",
  "nav.journey": "Viaje",
  "nav.layers": "Capas",
  "nav.settings": "Ajustes",
  "group.explore": "Explorar",
  "group.journey": "Tu viaje",
  "group.intelligence": "Información",
  "group.settings": "Ajustes",
  "hdr.search": "Buscar",
  "hdr.theme": "Cambiar tema día/noche",
  "hdr.share": "Compartir",
  "welcome.title": "Bienvenido a Nomadic Almanac",
  "welcome.body": "Un atlas vivo de adónde ir y cuándo. Pulsa cualquier país para abrir su dosier de viaje, desliza por los meses para ver cambiar las estaciones y activa capas para leer el mundo a tu manera.",
  "welcome.sub": "Consejo: amplía para ver el detalle de provincias y comarcas, y elige tu pasaporte para colorear el mapa según el acceso de visado.",
  "welcome.tour": "Hacer el recorrido guiado",
  "welcome.explore": "Explorar por mi cuenta",
  "welcome.language": "Idioma",
  "welcome.tutorial": "Cómo funciona",
  "welcome.faq": "Preguntas frecuentes",
  "prefs.title": "Preferencias",
  "prefs.mapView": "Vista del mapa",
  "prefs.labels": "Etiquetas de lugar",
  "prefs.units": "Unidades",
  "prefs.temp": "Temperatura",
  "prefs.dist": "Distancia",
  "prefs.elev": "Altitud",
  "prefs.dateFormat": "Formato de fecha",
  "prefs.clock": "Reloj",
  "prefs.language": "Idioma",
  "prefs.currency": "Moneda",
  "prefs.theme": "Tema",
  "prefs.tour": "Repetir recorrido guiado",
  "prefs.tutorial": "Tutorial escrito",
  "prefs.faq": "Preguntas frecuentes",
  "prefs.on": "Activado",
  "prefs.off": "Desactivado",
  "prefs.dark": "Oscuro",
  "prefs.light": "Claro",
  "bm.satellite": "Satélite",
  "bm.streets": "Calles",
  "bm.dark": "Oscuro",
  "bm.terrain": "Relieve",
  "bm.night": "Luces nocturnas",
  "doss.glance": "De un vistazo",
  "doss.emergency": "Emergencias",
  "doss.cost": "Coste de vida",
  "doss.health": "Salud",
  "doss.climate": "Clima",
  "doss.safety": "Seguridad",
  "doss.tipping": "Propinas",
  "doss.visa": "Acceso de visado",
  "doss.timezone": "Zona horaria",
  "doss.holidays": "Festivos y eventos",
  "doss.history": "Historia",
  "doss.phrasebook": "Guía de frases",
  "doss.intel": "Información del país",
  "doss.language": "Idioma",
  "doss.capital": "Capital",
  "doss.population": "Población",
  "doss.currency": "Moneda",
  "doss.languages": "Idiomas",
  "doss.power": "Enchufes",
  "doss.calling": "Prefijo telefónico",
  "doss.driving": "Conducción",
  "doss.region": "Región",
  "doss.tapwater": "Agua del grifo",
  "doss.etiquette": "Etiqueta y costumbres",
  "doss.transport": "Cómo moverse",
  "doss.connectivity": "Conectividad",
  "doss.payments": "Dinero y pagos",
  "common.close": "Cerrar",
  "common.loading": "Cargando…",
  "common.noData": "Sin datos",
  "common.more": "Ver más",
  "common.less": "Ver menos",
  "common.search": "Buscar países, ciudades o capas",
  "intel.title": "Información del país",
  "intel.origin": "Origen",
  "intel.character": "Carácter",
  "intel.complexity": "Complejidad real",
  "intel.bestFor": "Ideal para",
  "intel.notKnown": "Lo que saben los locales"
 },
 "fr": {
  "nav.worldMap": "Carte du monde",
  "nav.bestMonth": "Idéal ce mois-ci",
  "nav.passport": "Passeport et visa",
  "nav.planner": "Planificateur de voyage",
  "nav.compare": "Comparer les pays",
  "nav.preferences": "Préférences",
  "nav.explore": "Explorer",
  "nav.journey": "Voyage",
  "nav.layers": "Calques",
  "nav.settings": "Paramètres",
  "group.explore": "Explorer",
  "group.journey": "Votre voyage",
  "group.intelligence": "Renseignements",
  "group.settings": "Paramètres",
  "hdr.search": "Rechercher",
  "hdr.theme": "Basculer thème jour/nuit",
  "hdr.share": "Partager",
  "welcome.title": "Bienvenue dans le Nomadic Almanac",
  "welcome.body": "Un atlas vivant qui révèle où partir et quand. Cliquez sur un pays pour ouvrir son dossier de voyage, faites défiler les mois pour observer le passage des saisons, et activez des calques pour lire le monde à votre façon.",
  "welcome.sub": "Astuce : zoomez pour voir le détail des provinces et des départements, et choisissez votre passeport pour colorer la carte selon l'accès au visa.",
  "welcome.tour": "Suivre la visite guidée",
  "welcome.explore": "Explorer par moi-même",
  "welcome.language": "Langue",
  "welcome.tutorial": "Comment ça marche",
  "welcome.faq": "FAQ",
  "prefs.title": "Préférences",
  "prefs.mapView": "Affichage de la carte",
  "prefs.labels": "Étiquettes de lieux",
  "prefs.units": "Unités",
  "prefs.temp": "Température",
  "prefs.dist": "Distance",
  "prefs.elev": "Altitude",
  "prefs.dateFormat": "Format de date",
  "prefs.clock": "Horloge",
  "prefs.language": "Langue",
  "prefs.currency": "Devise",
  "prefs.theme": "Thème",
  "prefs.tour": "Revoir la visite guidée",
  "prefs.tutorial": "Tutoriel écrit",
  "prefs.faq": "FAQ",
  "prefs.on": "Activé",
  "prefs.off": "Désactivé",
  "prefs.dark": "Sombre",
  "prefs.light": "Clair",
  "bm.satellite": "Satellite",
  "bm.streets": "Rues",
  "bm.dark": "Sombre",
  "bm.terrain": "Relief",
  "bm.night": "Lumières nocturnes",
  "doss.glance": "En bref",
  "doss.emergency": "Urgences",
  "doss.cost": "Coût de la vie",
  "doss.health": "Santé",
  "doss.climate": "Climat",
  "doss.safety": "Sécurité",
  "doss.tipping": "Pourboires",
  "doss.visa": "Accès au visa",
  "doss.timezone": "Fuseau horaire",
  "doss.holidays": "Fêtes et événements",
  "doss.history": "Histoire",
  "doss.phrasebook": "Guide de conversation",
  "doss.intel": "Renseignements pays",
  "doss.language": "Langue",
  "doss.capital": "Capitale",
  "doss.population": "Population",
  "doss.currency": "Devise",
  "doss.languages": "Langues",
  "doss.power": "Prises électriques",
  "doss.calling": "Indicatif téléphonique",
  "doss.driving": "Conduite",
  "doss.region": "Région",
  "doss.tapwater": "Eau du robinet",
  "doss.etiquette": "Us et coutumes",
  "doss.transport": "Se déplacer",
  "doss.connectivity": "Connectivité",
  "doss.payments": "Argent et paiements",
  "common.close": "Fermer",
  "common.loading": "Chargement…",
  "common.noData": "Aucune donnée",
  "common.more": "Voir plus",
  "common.less": "Voir moins",
  "common.search": "Rechercher pays, villes ou calques",
  "intel.title": "Renseignements pays",
  "intel.origin": "Origine",
  "intel.character": "Caractère",
  "intel.complexity": "Complexité réelle",
  "intel.bestFor": "Idéal pour",
  "intel.notKnown": "Ce que savent les habitants"
 },
 "de": {
  "nav.worldMap": "Weltkarte",
  "nav.bestMonth": "Beste Zeit im Monat",
  "nav.passport": "Pass & Visum",
  "nav.planner": "Reiseplaner",
  "nav.compare": "Länder vergleichen",
  "nav.preferences": "Einstellungen",
  "nav.explore": "Entdecken",
  "nav.journey": "Reise",
  "nav.layers": "Ebenen",
  "nav.settings": "Einstellungen",
  "group.explore": "Entdecken",
  "group.journey": "Deine Reise",
  "group.intelligence": "Wissenswertes",
  "group.settings": "Einstellungen",
  "hdr.search": "Suchen",
  "hdr.theme": "Tag-/Nachtmodus wechseln",
  "hdr.share": "Teilen",
  "welcome.title": "Willkommen beim Nomadic Almanac",
  "welcome.body": "Ein lebendiger Atlas: wohin und wann. Klicke auf ein Land, um sein Reisedossier zu öffnen, ziehe durch die Monate, um die Jahreszeiten zu erleben, und schalte Ebenen ein, um die Welt nach deinen Wünschen zu lesen.",
  "welcome.sub": "Tipp: Zoome hinein für Provinz- und Kreisdetails und wähle deinen Pass, um die Karte nach Visumzugang einzufärben.",
  "welcome.tour": "Geführte Tour starten",
  "welcome.explore": "Selbst erkunden",
  "welcome.language": "Sprache",
  "welcome.tutorial": "So funktioniert es",
  "welcome.faq": "FAQ",
  "prefs.title": "Einstellungen",
  "prefs.mapView": "Kartenansicht",
  "prefs.labels": "Ortsbeschriftungen",
  "prefs.units": "Einheiten",
  "prefs.temp": "Temperatur",
  "prefs.dist": "Entfernung",
  "prefs.elev": "Höhe",
  "prefs.dateFormat": "Datumsformat",
  "prefs.clock": "Uhrzeit",
  "prefs.language": "Sprache",
  "prefs.currency": "Währung",
  "prefs.theme": "Design",
  "prefs.tour": "Geführte Tour wiederholen",
  "prefs.tutorial": "Schriftliche Anleitung",
  "prefs.faq": "FAQ",
  "prefs.on": "Ein",
  "prefs.off": "Aus",
  "prefs.dark": "Dunkel",
  "prefs.light": "Hell",
  "bm.satellite": "Satellit",
  "bm.streets": "Straßen",
  "bm.dark": "Dunkel",
  "bm.terrain": "Gelände",
  "bm.night": "Nachtlichter",
  "doss.glance": "Überblick",
  "doss.emergency": "Notfall",
  "doss.cost": "Lebenshaltungskosten",
  "doss.health": "Gesundheit",
  "doss.climate": "Klima",
  "doss.safety": "Sicherheit",
  "doss.tipping": "Trinkgeld",
  "doss.visa": "Visumzugang",
  "doss.timezone": "Zeitzone",
  "doss.holidays": "Feiertage & Events",
  "doss.history": "Geschichte",
  "doss.phrasebook": "Sprachführer",
  "doss.intel": "Länderwissen",
  "doss.language": "Sprache",
  "doss.capital": "Hauptstadt",
  "doss.population": "Bevölkerung",
  "doss.currency": "Währung",
  "doss.languages": "Sprachen",
  "doss.power": "Strom",
  "doss.calling": "Vorwahl",
  "doss.driving": "Verkehr",
  "doss.region": "Region",
  "doss.tapwater": "Leitungswasser",
  "doss.etiquette": "Sitten & Gebräuche",
  "doss.transport": "Fortbewegung",
  "doss.connectivity": "Konnektivität",
  "doss.payments": "Geld & Zahlung",
  "common.close": "Schließen",
  "common.loading": "Wird geladen…",
  "common.noData": "Keine Daten",
  "common.more": "Mehr anzeigen",
  "common.less": "Weniger anzeigen",
  "common.search": "Länder, Städte oder Ebenen suchen",
  "intel.title": "Länderwissen",
  "intel.origin": "Herkunft",
  "intel.character": "Charakter",
  "intel.complexity": "Ehrliche Komplexität",
  "intel.bestFor": "Ideal für",
  "intel.notKnown": "Was Einheimische wissen"
 },
 "pt": {
  "nav.worldMap": "Mapa-múndi",
  "nav.bestMonth": "Melhor no Mês",
  "nav.passport": "Passaporte e Visto",
  "nav.planner": "Planejar Viagem",
  "nav.compare": "Comparar Países",
  "nav.preferences": "Preferências",
  "nav.explore": "Explorar",
  "nav.journey": "Jornada",
  "nav.layers": "Camadas",
  "nav.settings": "Configurações",
  "group.explore": "Explorar",
  "group.journey": "Sua Jornada",
  "group.intelligence": "Informações",
  "group.settings": "Configurações",
  "hdr.search": "Buscar",
  "hdr.theme": "Alternar tema dia/noite",
  "hdr.share": "Compartilhar",
  "welcome.title": "Bem-vindo ao Nomadic Almanac",
  "welcome.body": "Um atlas vivo de onde ir e quando. Clique em qualquer país para abrir seu dossiê de viagem, percorra os meses para ver as estações mudarem e ative camadas para ler o mundo do seu jeito.",
  "welcome.sub": "Dica: amplie para ver detalhes de províncias e municípios e escolha seu passaporte para colorir o mapa por acesso de visto.",
  "welcome.tour": "Fazer o tour guiado",
  "welcome.explore": "Explorar por conta própria",
  "welcome.language": "Idioma",
  "welcome.tutorial": "Como funciona",
  "welcome.faq": "Perguntas Frequentes",
  "prefs.title": "Preferências",
  "prefs.mapView": "Visualização do Mapa",
  "prefs.labels": "Nomes de Locais",
  "prefs.units": "Unidades",
  "prefs.temp": "Temperatura",
  "prefs.dist": "Distância",
  "prefs.elev": "Altitude",
  "prefs.dateFormat": "Formato de Data",
  "prefs.clock": "Relógio",
  "prefs.language": "Idioma",
  "prefs.currency": "Moeda",
  "prefs.theme": "Tema",
  "prefs.tour": "Repetir tour guiado",
  "prefs.tutorial": "Tutorial escrito",
  "prefs.faq": "Perguntas Frequentes",
  "prefs.on": "Ativado",
  "prefs.off": "Desativado",
  "prefs.dark": "Escuro",
  "prefs.light": "Claro",
  "bm.satellite": "Satélite",
  "bm.streets": "Ruas",
  "bm.dark": "Escuro",
  "bm.terrain": "Relevo",
  "bm.night": "Luzes Noturnas",
  "doss.glance": "Resumo",
  "doss.emergency": "Emergência",
  "doss.cost": "Custo de Vida",
  "doss.health": "Saúde",
  "doss.climate": "Clima",
  "doss.safety": "Segurança",
  "doss.tipping": "Gorjetas",
  "doss.visa": "Acesso de Visto",
  "doss.timezone": "Fuso Horário",
  "doss.holidays": "Feriados e Eventos",
  "doss.history": "História",
  "doss.phrasebook": "Guia de Frases",
  "doss.intel": "Informações do País",
  "doss.language": "Idioma",
  "doss.capital": "Capital",
  "doss.population": "População",
  "doss.currency": "Moeda",
  "doss.languages": "Idiomas",
  "doss.power": "Tomadas",
  "doss.calling": "Código Telefônico",
  "doss.driving": "Direção",
  "doss.region": "Região",
  "doss.tapwater": "Água da Torneira",
  "doss.etiquette": "Etiqueta e Costumes",
  "doss.transport": "Como Circular",
  "doss.connectivity": "Conectividade",
  "doss.payments": "Dinheiro e Pagamentos",
  "common.close": "Fechar",
  "common.loading": "Carregando…",
  "common.noData": "Sem dados",
  "common.more": "Ver mais",
  "common.less": "Ver menos",
  "common.search": "Buscar países, cidades ou camadas",
  "intel.title": "Informações do País",
  "intel.origin": "Origem",
  "intel.character": "Caráter",
  "intel.complexity": "Complexidade Real",
  "intel.bestFor": "Ideal Para",
  "intel.notKnown": "O Que os Locais Sabem"
 },
 "ar": {
  "nav.worldMap": "خريطة العالم",
  "nav.bestMonth": "الأفضل هذا الشهر",
  "nav.passport": "الجواز والتأشيرة",
  "nav.planner": "مخطِّط الرحلة",
  "nav.compare": "مقارنة الدول",
  "nav.preferences": "التفضيلات",
  "nav.explore": "استكشاف",
  "nav.journey": "الرحلة",
  "nav.layers": "الطبقات",
  "nav.settings": "الإعدادات",
  "group.explore": "استكشاف",
  "group.journey": "رحلتك",
  "group.intelligence": "المعلومات",
  "group.settings": "الإعدادات",
  "hdr.search": "بحث",
  "hdr.theme": "تبديل المظهر النهاري/الليلي",
  "hdr.share": "مشاركة",
  "welcome.title": "مرحبًا بك في التقويم الرُّحَّل",
  "welcome.body": "أطلس حي يدلّك إلى الوجهة والوقت المناسبين. انقر أي دولة لفتح ملفها السياحي، وحرّك الأشهر لتشاهد تعاقب الفصول، وفعِّل الطبقات لترى العالم بطريقتك.",
  "welcome.sub": "نصيحة: قرّب لعرض تفاصيل المحافظات والأقاليم، واختر جوازك لتلوين الخريطة حسب صلاحية التأشيرة.",
  "welcome.tour": "ابدأ الجولة الإرشادية",
  "welcome.explore": "الاستكشاف بنفسي",
  "welcome.language": "اللغة",
  "welcome.tutorial": "كيف يعمل",
  "welcome.faq": "الأسئلة الشائعة",
  "prefs.title": "التفضيلات",
  "prefs.mapView": "عرض الخريطة",
  "prefs.labels": "تسميات الأماكن",
  "prefs.units": "الوحدات",
  "prefs.temp": "درجة الحرارة",
  "prefs.dist": "المسافة",
  "prefs.elev": "الارتفاع",
  "prefs.dateFormat": "تنسيق التاريخ",
  "prefs.clock": "الساعة",
  "prefs.language": "اللغة",
  "prefs.currency": "العملة",
  "prefs.theme": "المظهر",
  "prefs.tour": "إعادة الجولة الإرشادية",
  "prefs.tutorial": "شرح مكتوب",
  "prefs.faq": "الأسئلة الشائعة",
  "prefs.on": "تشغيل",
  "prefs.off": "إيقاف",
  "prefs.dark": "داكن",
  "prefs.light": "فاتح",
  "bm.satellite": "قمر صناعي",
  "bm.streets": "شوارع",
  "bm.dark": "داكن",
  "bm.terrain": "تضاريس",
  "bm.night": "أضواء الليل",
  "doss.glance": "لمحة سريعة",
  "doss.emergency": "الطوارئ",
  "doss.cost": "تكلفة المعيشة",
  "doss.health": "الصحة",
  "doss.climate": "المناخ",
  "doss.safety": "الأمان",
  "doss.tipping": "البقشيش",
  "doss.visa": "صلاحية التأشيرة",
  "doss.timezone": "المنطقة الزمنية",
  "doss.holidays": "العطلات والفعاليات",
  "doss.history": "التاريخ",
  "doss.phrasebook": "دليل العبارات",
  "doss.intel": "معلومات الدولة",
  "doss.language": "اللغة",
  "doss.capital": "العاصمة",
  "doss.population": "عدد السكان",
  "doss.currency": "العملة",
  "doss.languages": "اللغات",
  "doss.power": "الكهرباء",
  "doss.calling": "رمز الاتصال",
  "doss.driving": "اتجاه القيادة",
  "doss.region": "المنطقة",
  "doss.tapwater": "ماء الصنبور",
  "doss.etiquette": "الآداب والعادات",
  "doss.transport": "التنقّل",
  "doss.connectivity": "الاتصال",
  "doss.payments": "المال والمدفوعات",
  "common.close": "إغلاق",
  "common.loading": "جارٍ التحميل…",
  "common.noData": "لا توجد بيانات",
  "common.more": "عرض المزيد",
  "common.less": "عرض أقل",
  "common.search": "ابحث عن دول أو مدن أو طبقات",
  "intel.title": "معلومات الدولة",
  "intel.origin": "النشأة",
  "intel.character": "الطابع",
  "intel.complexity": "التعقيد الحقيقي",
  "intel.bestFor": "الأنسب لـ",
  "intel.notKnown": "ما يعرفه السكان المحليون"
 },
 "zh": {
  "nav.worldMap": "世界地图",
  "nav.bestMonth": "本月最佳",
  "nav.passport": "护照与签证",
  "nav.planner": "行程规划",
  "nav.compare": "国家对比",
  "nav.preferences": "偏好设置",
  "nav.explore": "探索",
  "nav.journey": "旅程",
  "nav.layers": "图层",
  "nav.settings": "设置",
  "group.explore": "探索",
  "group.journey": "你的旅程",
  "group.intelligence": "情报",
  "group.settings": "设置",
  "hdr.search": "搜索",
  "hdr.theme": "切换昼夜主题",
  "hdr.share": "分享",
  "welcome.title": "欢迎使用 Nomadic Almanac",
  "welcome.body": "一份记录何处可去、何时启程的活地图集。点击任意国家即可查阅其旅行档案，拖动月份观看季节流转，开启图层以你的方式解读世界。",
  "welcome.sub": "提示：放大可查看省、县级详情，选择你的护照即可按签证准入情况为地图着色。",
  "welcome.tour": "开始引导游览",
  "welcome.explore": "自行探索",
  "welcome.language": "语言",
  "welcome.tutorial": "使用说明",
  "welcome.faq": "常见问题",
  "prefs.title": "偏好设置",
  "prefs.mapView": "地图视图",
  "prefs.labels": "地名标注",
  "prefs.units": "单位",
  "prefs.temp": "温度",
  "prefs.dist": "距离",
  "prefs.elev": "海拔",
  "prefs.dateFormat": "日期格式",
  "prefs.clock": "时间制",
  "prefs.language": "语言",
  "prefs.currency": "货币",
  "prefs.theme": "主题",
  "prefs.tour": "重播引导游览",
  "prefs.tutorial": "图文教程",
  "prefs.faq": "常见问题",
  "prefs.on": "开",
  "prefs.off": "关",
  "prefs.dark": "深色",
  "prefs.light": "浅色",
  "bm.satellite": "卫星",
  "bm.streets": "街道",
  "bm.dark": "深色",
  "bm.terrain": "地形",
  "bm.night": "夜间灯光",
  "doss.glance": "概览",
  "doss.emergency": "紧急求助",
  "doss.cost": "生活成本",
  "doss.health": "健康",
  "doss.climate": "气候",
  "doss.safety": "安全",
  "doss.tipping": "小费",
  "doss.visa": "签证准入",
  "doss.timezone": "时区",
  "doss.holidays": "节假日与活动",
  "doss.history": "历史",
  "doss.phrasebook": "常用短语",
  "doss.intel": "国家情报",
  "doss.language": "语言",
  "doss.capital": "首都",
  "doss.population": "人口",
  "doss.currency": "货币",
  "doss.languages": "语言",
  "doss.power": "电源插座",
  "doss.calling": "国际区号",
  "doss.driving": "驾驶方向",
  "doss.region": "地区",
  "doss.tapwater": "自来水",
  "doss.etiquette": "礼仪与习俗",
  "doss.transport": "交通出行",
  "doss.connectivity": "网络通信",
  "doss.payments": "货币与支付",
  "common.close": "关闭",
  "common.loading": "加载中…",
  "common.noData": "暂无数据",
  "common.more": "展开",
  "common.less": "收起",
  "common.search": "搜索国家、城市或图层",
  "intel.title": "国家情报",
  "intel.origin": "渊源",
  "intel.character": "特色",
  "intel.complexity": "真实复杂度",
  "intel.bestFor": "适合人群",
  "intel.notKnown": "当地人才懂"
 },
 "hi": {
  "nav.worldMap": "विश्व मानचित्र",
  "nav.bestMonth": "इस माह की पसंद",
  "nav.passport": "पासपोर्ट और वीज़ा",
  "nav.planner": "यात्रा योजनाकार",
  "nav.compare": "देशों की तुलना",
  "nav.preferences": "प्राथमिकताएँ",
  "nav.explore": "खोजें",
  "nav.journey": "यात्रा",
  "nav.layers": "परतें",
  "nav.settings": "सेटिंग्स",
  "group.explore": "खोजें",
  "group.journey": "आपकी यात्रा",
  "group.intelligence": "जानकारी",
  "group.settings": "सेटिंग्स",
  "hdr.search": "खोज",
  "hdr.theme": "दिन/रात थीम बदलें",
  "hdr.share": "साझा करें",
  "welcome.title": "Nomadic Almanac में आपका स्वागत है",
  "welcome.body": "कहाँ और कब जाना है, इसका एक जीवंत एटलस। यात्रा विवरण देखने के लिए किसी भी देश पर क्लिक करें, मौसम बदलते देखने के लिए महीनों को खिसकाएँ, और दुनिया को अपने तरीके से देखने के लिए परतें चालू करें।",
  "welcome.sub": "सुझाव: प्रांत और ज़िले के विवरण के लिए ज़ूम करें, और वीज़ा पहुँच के अनुसार मानचित्र रंगने के लिए अपना पासपोर्ट चुनें।",
  "welcome.tour": "निर्देशित दौरा लें",
  "welcome.explore": "स्वयं खोजें",
  "welcome.language": "भाषा",
  "welcome.tutorial": "यह कैसे काम करता है",
  "welcome.faq": "सामान्य प्रश्न",
  "prefs.title": "प्राथमिकताएँ",
  "prefs.mapView": "मानचित्र दृश्य",
  "prefs.labels": "स्थान लेबल",
  "prefs.units": "इकाइयाँ",
  "prefs.temp": "तापमान",
  "prefs.dist": "दूरी",
  "prefs.elev": "ऊँचाई",
  "prefs.dateFormat": "तिथि प्रारूप",
  "prefs.clock": "घड़ी",
  "prefs.language": "भाषा",
  "prefs.currency": "मुद्रा",
  "prefs.theme": "थीम",
  "prefs.tour": "निर्देशित दौरा फिर से देखें",
  "prefs.tutorial": "लिखित ट्यूटोरियल",
  "prefs.faq": "सामान्य प्रश्न",
  "prefs.on": "चालू",
  "prefs.off": "बंद",
  "prefs.dark": "गहरा",
  "prefs.light": "हल्का",
  "bm.satellite": "उपग्रह",
  "bm.streets": "सड़कें",
  "bm.dark": "गहरा",
  "bm.terrain": "भू-भाग",
  "bm.night": "रात्रि रोशनी",
  "doss.glance": "एक नज़र में",
  "doss.emergency": "आपातकाल",
  "doss.cost": "जीवन-यापन लागत",
  "doss.health": "स्वास्थ्य",
  "doss.climate": "जलवायु",
  "doss.safety": "सुरक्षा",
  "doss.tipping": "टिप देना",
  "doss.visa": "वीज़ा पहुँच",
  "doss.timezone": "समय क्षेत्र",
  "doss.holidays": "छुट्टियाँ और आयोजन",
  "doss.history": "इतिहास",
  "doss.phrasebook": "वाक्यांश पुस्तिका",
  "doss.intel": "देश जानकारी",
  "doss.language": "भाषा",
  "doss.capital": "राजधानी",
  "doss.population": "जनसंख्या",
  "doss.currency": "मुद्रा",
  "doss.languages": "भाषाएँ",
  "doss.power": "बिजली",
  "doss.calling": "कॉलिंग कोड",
  "doss.driving": "वाहन चालन",
  "doss.region": "क्षेत्र",
  "doss.tapwater": "नल का पानी",
  "doss.etiquette": "शिष्टाचार और रीति-रिवाज",
  "doss.transport": "आवागमन",
  "doss.connectivity": "कनेक्टिविटी",
  "doss.payments": "पैसा और भुगतान",
  "common.close": "बंद करें",
  "common.loading": "लोड हो रहा है…",
  "common.noData": "कोई डेटा नहीं",
  "common.more": "और दिखाएँ",
  "common.less": "कम दिखाएँ",
  "common.search": "देश, शहर या परतें खोजें",
  "intel.title": "देश जानकारी",
  "intel.origin": "उत्पत्ति",
  "intel.character": "स्वरूप",
  "intel.complexity": "वास्तविक जटिलता",
  "intel.bestFor": "किसके लिए उपयुक्त",
  "intel.notKnown": "स्थानीय लोग क्या जानते हैं"
 },
 "ja": {
  "nav.worldMap": "世界地図",
  "nav.bestMonth": "今月のおすすめ",
  "nav.passport": "パスポートとビザ",
  "nav.planner": "旅行プランナー",
  "nav.compare": "国を比較",
  "nav.preferences": "設定",
  "nav.explore": "探索",
  "nav.journey": "旅",
  "nav.layers": "レイヤー",
  "nav.settings": "設定",
  "group.explore": "探索",
  "group.journey": "あなたの旅",
  "group.intelligence": "国情報",
  "group.settings": "設定",
  "hdr.search": "検索",
  "hdr.theme": "昼夜テーマ切替",
  "hdr.share": "共有",
  "welcome.title": "Nomadic Almanac へようこそ",
  "welcome.body": "いつ、どこへ行くべきかがわかる生きた地図帳。国をクリックすると旅行ドシエが開きます。月をスライドして季節の移り変わりを眺め、レイヤーを切り替えて自分なりの世界の見方を。",
  "welcome.sub": "ヒント：ズームすると州や郡の詳細が表示され、パスポートを選ぶとビザの入国条件で地図を色分けできます。",
  "welcome.tour": "ガイドツアーを始める",
  "welcome.explore": "自由に探索する",
  "welcome.language": "言語",
  "welcome.tutorial": "使い方",
  "welcome.faq": "よくある質問",
  "prefs.title": "設定",
  "prefs.mapView": "地図表示",
  "prefs.labels": "地名ラベル",
  "prefs.units": "単位",
  "prefs.temp": "気温",
  "prefs.dist": "距離",
  "prefs.elev": "標高",
  "prefs.dateFormat": "日付形式",
  "prefs.clock": "時刻表示",
  "prefs.language": "言語",
  "prefs.currency": "通貨",
  "prefs.theme": "テーマ",
  "prefs.tour": "ガイドツアーを再生",
  "prefs.tutorial": "テキスト版チュートリアル",
  "prefs.faq": "よくある質問",
  "prefs.on": "オン",
  "prefs.off": "オフ",
  "prefs.dark": "ダーク",
  "prefs.light": "ライト",
  "bm.satellite": "衛星写真",
  "bm.streets": "地図",
  "bm.dark": "ダーク",
  "bm.terrain": "地形",
  "bm.night": "夜景",
  "doss.glance": "概要",
  "doss.emergency": "緊急連絡先",
  "doss.cost": "生活費",
  "doss.health": "健康・医療",
  "doss.climate": "気候",
  "doss.safety": "治安",
  "doss.tipping": "チップ",
  "doss.visa": "ビザ条件",
  "doss.timezone": "時差",
  "doss.holidays": "祝日・イベント",
  "doss.history": "歴史",
  "doss.phrasebook": "会話集",
  "doss.intel": "国情報",
  "doss.language": "言語",
  "doss.capital": "首都",
  "doss.population": "人口",
  "doss.currency": "通貨",
  "doss.languages": "言語",
  "doss.power": "電源プラグ",
  "doss.calling": "国番号",
  "doss.driving": "通行区分",
  "doss.region": "地域",
  "doss.tapwater": "水道水",
  "doss.etiquette": "マナー・習慣",
  "doss.transport": "交通手段",
  "doss.connectivity": "通信環境",
  "doss.payments": "お金・支払い",
  "common.close": "閉じる",
  "common.loading": "読み込み中…",
  "common.noData": "データなし",
  "common.more": "もっと見る",
  "common.less": "閉じる",
  "common.search": "国・都市・レイヤーを検索",
  "intel.title": "国情報",
  "intel.origin": "成り立ち",
  "intel.character": "国柄",
  "intel.complexity": "ありのままの難しさ",
  "intel.bestFor": "おすすめの目的",
  "intel.notKnown": "地元ならではの知識"
 },
 "ru": {
  "nav.worldMap": "Карта мира",
  "nav.bestMonth": "Лучшее в этом месяце",
  "nav.passport": "Паспорт и виза",
  "nav.planner": "Планировщик поездок",
  "nav.compare": "Сравнить страны",
  "nav.preferences": "Настройки",
  "nav.explore": "Обзор",
  "nav.journey": "Путешествие",
  "nav.layers": "Слои",
  "nav.settings": "Настройки",
  "group.explore": "Обзор",
  "group.journey": "Ваше путешествие",
  "group.intelligence": "Аналитика",
  "group.settings": "Настройки",
  "hdr.search": "Поиск",
  "hdr.theme": "Дневная/ночная тема",
  "hdr.share": "Поделиться",
  "welcome.title": "Добро пожаловать в Nomadic Almanac",
  "welcome.body": "Живой атлас: куда поехать и когда. Нажмите на любую страну, чтобы открыть её туристическое досье, перематывайте месяцы, наблюдая смену сезонов, и включайте слои, чтобы видеть мир по-своему.",
  "welcome.sub": "Совет: увеличьте масштаб для детализации регионов и районов и выберите паспорт, чтобы окрасить карту по визовому доступу.",
  "welcome.tour": "Пройти обзорный тур",
  "welcome.explore": "Исследовать самому",
  "welcome.language": "Язык",
  "welcome.tutorial": "Как это работает",
  "welcome.faq": "Вопросы и ответы",
  "prefs.title": "Настройки",
  "prefs.mapView": "Вид карты",
  "prefs.labels": "Подписи мест",
  "prefs.units": "Единицы",
  "prefs.temp": "Температура",
  "prefs.dist": "Расстояние",
  "prefs.elev": "Высота",
  "prefs.dateFormat": "Формат даты",
  "prefs.clock": "Время",
  "prefs.language": "Язык",
  "prefs.currency": "Валюта",
  "prefs.theme": "Тема",
  "prefs.tour": "Повторить обзорный тур",
  "prefs.tutorial": "Текстовое руководство",
  "prefs.faq": "Вопросы и ответы",
  "prefs.on": "Вкл.",
  "prefs.off": "Выкл.",
  "prefs.dark": "Тёмная",
  "prefs.light": "Светлая",
  "bm.satellite": "Спутник",
  "bm.streets": "Улицы",
  "bm.dark": "Тёмная",
  "bm.terrain": "Рельеф",
  "bm.night": "Ночные огни",
  "doss.glance": "Кратко",
  "doss.emergency": "Экстренные службы",
  "doss.cost": "Стоимость жизни",
  "doss.health": "Здоровье",
  "doss.climate": "Климат",
  "doss.safety": "Безопасность",
  "doss.tipping": "Чаевые",
  "doss.visa": "Визовый доступ",
  "doss.timezone": "Часовой пояс",
  "doss.holidays": "Праздники и события",
  "doss.history": "История",
  "doss.phrasebook": "Разговорник",
  "doss.intel": "О стране",
  "doss.language": "Язык",
  "doss.capital": "Столица",
  "doss.population": "Население",
  "doss.currency": "Валюта",
  "doss.languages": "Языки",
  "doss.power": "Розетки",
  "doss.calling": "Телефонный код",
  "doss.driving": "Движение",
  "doss.region": "Регион",
  "doss.tapwater": "Водопроводная вода",
  "doss.etiquette": "Этикет и обычаи",
  "doss.transport": "Транспорт",
  "doss.connectivity": "Связь",
  "doss.payments": "Деньги и оплата",
  "common.close": "Закрыть",
  "common.loading": "Загрузка…",
  "common.noData": "Нет данных",
  "common.more": "Показать больше",
  "common.less": "Свернуть",
  "common.search": "Поиск стран, городов или слоёв",
  "intel.title": "О стране",
  "intel.origin": "Происхождение",
  "intel.character": "Характер",
  "intel.complexity": "Реальная сложность",
  "intel.bestFor": "Лучше всего для",
  "intel.notKnown": "Что знают местные"
 }
});

// ─── New-key translations (welcome reword, budget tiers, section headers, actions) ───
(function(p){Object.keys(p).forEach(function(l){_I18N[l]=Object.assign(_I18N[l]||{},p[l]);});})({
 "es": {
  "welcome.body": "Tu atlas interactivo de adónde ir y cuándo. Toca cualquier país para abrir su guía de viaje completa — costes, seguridad, clima, visados, frases clave y mucho más. Desliza por los meses para ver cambiar las estaciones y activa capas para comparar el mundo a tu manera.",
  "welcome.sub": "Consejo: amplía para ver el detalle de regiones y provincias, y elige tu pasaporte para colorear el mapa según adónde puedes viajar sin visado.",
  "cost.budget": "Económico",
  "cost.mid": "Intermedio",
  "cost.lux": "Lujo",
  "cost.perDay": "al día",
  "cost.dailyBudget": "Presupuesto diario",
  "doss.journal": "Diario",
  "doss.goodToKnow": "Conviene saber",
  "doss.layers": "Lecturas de capas",
  "doss.expand": "Expandir todo",
  "doss.collapse": "Contraer todo",
  "act.compare": "Comparar",
  "act.wishlist": "Lista de deseos",
  "act.addPin": "Añadir al viaje"
 },
 "fr": {
  "welcome.body": "Votre atlas interactif des destinations et du moment idéal pour partir. Touchez un pays pour ouvrir son guide de voyage complet — coûts, sécurité, météo, visas, expressions clés et plus encore. Faites défiler les mois pour voir les saisons changer, et activez des calques pour comparer le monde à votre façon.",
  "welcome.sub": "Astuce : zoomez pour afficher les régions et provinces en détail, et choisissez votre passeport pour colorer la carte selon vos destinations sans visa.",
  "cost.budget": "Économique",
  "cost.mid": "Intermédiaire",
  "cost.lux": "Luxe",
  "cost.perDay": "par jour",
  "cost.dailyBudget": "Budget quotidien",
  "doss.journal": "Journal",
  "doss.goodToKnow": "Bon à savoir",
  "doss.layers": "Données des calques",
  "doss.expand": "Tout déplier",
  "doss.collapse": "Tout replier",
  "act.compare": "Comparer",
  "act.wishlist": "Favoris",
  "act.addPin": "Ajouter au voyage"
 },
 "de": {
  "welcome.body": "Ihr interaktiver Atlas für das Wohin und Wann. Tippen Sie ein Land an, um den vollständigen Reiseführer zu öffnen — Kosten, Sicherheit, Wetter, Visa, wichtige Redewendungen und mehr. Schieben Sie durch die Monate, um den Wechsel der Jahreszeiten zu verfolgen, und blenden Sie Ebenen ein, um die Welt nach Ihren Wünschen zu vergleichen.",
  "welcome.sub": "Tipp: Zoomen Sie hinein für Regionen- und Provinzdetails, und wählen Sie Ihren Reisepass, um die Karte nach visafreien Reisezielen einzufärben.",
  "cost.budget": "Sparsam",
  "cost.mid": "Mittelklasse",
  "cost.lux": "Luxus",
  "cost.perDay": "pro Tag",
  "cost.dailyBudget": "Tagesbudget",
  "doss.journal": "Tagebuch",
  "doss.goodToKnow": "Gut zu wissen",
  "doss.layers": "Ebenenwerte",
  "doss.expand": "Alle aufklappen",
  "doss.collapse": "Alle zuklappen",
  "act.compare": "Vergleichen",
  "act.wishlist": "Merkliste",
  "act.addPin": "Zur Reise hinzufügen"
 },
 "pt": {
  "welcome.body": "Seu atlas interativo de para onde ir e quando. Toque em qualquer país para abrir seu guia de viagem completo — custos, segurança, clima, vistos, frases úteis e muito mais. Deslize pelos meses para ver as estações mudarem e ative camadas para comparar o mundo do seu jeito.",
  "welcome.sub": "Dica: aproxime para ver detalhes de regiões e províncias e escolha seu passaporte para colorir o mapa pelos destinos sem visto.",
  "cost.budget": "Econômico",
  "cost.mid": "Intermediário",
  "cost.lux": "Luxo",
  "cost.perDay": "por dia",
  "cost.dailyBudget": "Orçamento diário",
  "doss.journal": "Diário",
  "doss.goodToKnow": "Bom saber",
  "doss.layers": "Leituras de camadas",
  "doss.expand": "Expandir tudo",
  "doss.collapse": "Recolher tudo",
  "act.compare": "Comparar",
  "act.wishlist": "Lista de desejos",
  "act.addPin": "Adicionar à viagem"
 },
 "ar": {
  "welcome.body": "أطلسك التفاعلي لاكتشاف أين تذهب ومتى. انقر على أي دولة لفتح دليلها السياحي الكامل — التكاليف والأمان والطقس والتأشيرات والعبارات الأساسية والمزيد. مرّر عبر الأشهر لتشاهد تغيّر الفصول، وفعّل الطبقات لمقارنة العالم على طريقتك.",
  "welcome.sub": "نصيحة: كبّر الخريطة لعرض تفاصيل المناطق والأقاليم، واختر جواز سفرك لتلوين الخريطة حسب الوجهات التي يمكنك السفر إليها دون تأشيرة.",
  "cost.budget": "اقتصادي",
  "cost.mid": "متوسط",
  "cost.lux": "فاخر",
  "cost.perDay": "يومياً",
  "cost.dailyBudget": "الميزانية اليومية",
  "doss.journal": "اليوميات",
  "doss.goodToKnow": "معلومات مفيدة",
  "doss.layers": "قراءات الطبقات",
  "doss.expand": "توسيع الكل",
  "doss.collapse": "طيّ الكل",
  "act.compare": "مقارنة",
  "act.wishlist": "قائمة الأمنيات",
  "act.addPin": "إضافة إلى الرحلة"
 },
 "zh": {
  "welcome.body": "您的互动地图册,帮您决定何时去何地。轻点任意国家即可打开完整旅行指南——花费、安全、天气、签证、常用语等一应俱全。滑动月份查看四季变换,开启图层以您的方式纵览世界。",
  "welcome.sub": "提示:放大可查看地区与省份详情;选择您的护照,按免签可达地点为地图着色。",
  "cost.budget": "经济",
  "cost.mid": "中档",
  "cost.lux": "豪华",
  "cost.perDay": "每天",
  "cost.dailyBudget": "每日预算",
  "doss.journal": "日志",
  "doss.goodToKnow": "实用须知",
  "doss.layers": "图层数据",
  "doss.expand": "全部展开",
  "doss.collapse": "全部收起",
  "act.compare": "比较",
  "act.wishlist": "心愿单",
  "act.addPin": "加入行程"
 },
 "hi": {
  "welcome.body": "कहाँ जाएँ और कब जाएँ, इसका आपका इंटरैक्टिव एटलस। किसी भी देश पर टैप करें और उसकी पूरी यात्रा गाइड खोलें — खर्च, सुरक्षा, मौसम, वीज़ा, ज़रूरी वाक्यांश और बहुत कुछ। महीनों को स्लाइड करके मौसमों को बदलते देखें, और लेयर्स चालू करके दुनिया को अपने तरीके से देखें।",
  "welcome.sub": "सुझाव: क्षेत्र और प्रांत के विवरण के लिए ज़ूम इन करें, और अपना पासपोर्ट चुनें ताकि नक्शा वहाँ के अनुसार रंगे जहाँ आप बिना वीज़ा यात्रा कर सकते हैं।",
  "cost.budget": "किफ़ायती",
  "cost.mid": "मध्यम",
  "cost.lux": "विलासिता",
  "cost.perDay": "प्रति दिन",
  "cost.dailyBudget": "दैनिक बजट",
  "doss.journal": "जर्नल",
  "doss.goodToKnow": "जानना ज़रूरी",
  "doss.layers": "लेयर रीडिंग",
  "doss.expand": "सभी खोलें",
  "doss.collapse": "सभी बंद करें",
  "act.compare": "तुलना करें",
  "act.wishlist": "इच्छा-सूची",
  "act.addPin": "यात्रा में जोड़ें"
 },
 "ja": {
  "welcome.body": "行き先と旅のタイミングがわかるインタラクティブな世界地図。国をタップすると、費用・治安・天候・ビザ・役立つフレーズなど、その国の旅行ガイドをまるごと表示します — 月をスライドさせて季節の移り変わりを見たり、レイヤーを切り替えて自分なりの視点で世界を比べたりできます。",
  "welcome.sub": "ヒント：ズームインすると地方や州の詳細が表示されます。パスポートを選ぶと、ビザなしで行ける国ごとに地図を色分けできます。",
  "cost.budget": "格安",
  "cost.mid": "標準",
  "cost.lux": "高級",
  "cost.perDay": "1日あたり",
  "cost.dailyBudget": "1日の予算",
  "doss.journal": "旅日記",
  "doss.goodToKnow": "知っておきたいこと",
  "doss.layers": "レイヤー指標",
  "doss.expand": "すべて展開",
  "doss.collapse": "すべて折りたたむ",
  "act.compare": "比較",
  "act.wishlist": "行きたいリスト",
  "act.addPin": "旅程に追加"
 },
 "ru": {
  "welcome.body": "Ваш интерактивный атлас: куда поехать и когда. Нажмите на любую страну, чтобы открыть полный путеводитель — цены, безопасность, погода, визы, ключевые фразы и многое другое. Перемещайте ползунок по месяцам, чтобы следить за сменой сезонов, и включайте слои, чтобы сравнивать мир по-своему.",
  "welcome.sub": "Совет: приближайте карту, чтобы увидеть регионы и провинции, и выберите свой паспорт, чтобы раскрасить карту по странам с безвизовым въездом.",
  "cost.budget": "Эконом",
  "cost.mid": "Средний",
  "cost.lux": "Люкс",
  "cost.perDay": "в день",
  "cost.dailyBudget": "Бюджет на день",
  "doss.journal": "Заметки",
  "doss.goodToKnow": "Полезно знать",
  "doss.layers": "Показатели слоёв",
  "doss.expand": "Развернуть всё",
  "doss.collapse": "Свернуть всё",
  "act.compare": "Сравнить",
  "act.wishlist": "Избранное",
  "act.addPin": "В маршрут"
 }
});

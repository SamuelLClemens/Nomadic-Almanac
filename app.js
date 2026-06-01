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

// Holiday markers (rendered from static COUNTRY_HOLIDAYS data)
let _holidayMarkers = [];

// Click-toggle tooltip: tracks which feature's popup is currently open.
// Clicking the same feature again closes the tooltip (toggle behavior).
let _activeTooltipKey = null;
let _tempUnit         = 'C';   // 'C' or 'F' — toggled by the weather info window button
let climateZoneLayer  = null;
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
    // OpenStreetMap Humanitarian (HOT) tiles — OSM data, strong SE Asia coverage.
    // mix-blend-mode: multiply on .transport-roads-layer makes the white background
    // transparent so road lines overlay the satellite basemap cleanly.
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    opts: { subdomains: 'abc', opacity: 0.80, maxZoom: 19,
            className: 'transport-roads-layer',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, HOT style' },
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
    url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
    opts: { maxZoom: 18, opacity: 0.80,
            attribution: '&copy; <a href="https://openseamap.org">OpenSeaMap</a>' },
    layer: null, active: false,
  },
  wildfires: {
    label: '🔥 Wildfires',
    // NASA FIRMS WMS endpoint — must use L.tileLayer.wms(), NOT L.tileLayer().
    // L.tileLayer() does not substitute {bbox-epsg-3857}; it would send a literal
    // placeholder to the server, returning empty tiles. Flag `wms:true` triggers
    // the correct L.tileLayer.wms() branch in buildTransportButtons().
    url: 'https://firms.modaps.eosdis.nasa.gov/mapserver/wms/fires/2e43e6382e5cd7b5e3adfd5e16e1c23a/',
    wms: true,
    opts: { layers: 'fires_viirs_24', format: 'image/png', transparent: true,
            version: '1.3.0', opacity: 0.75, attribution: 'FIRMS/NASA near real-time fire data' },
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
    active: false, minZoom: 8, markers: [], bboxCache: {}, debounce: null,
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
    active: false, minZoom: 9, markers: [], bboxCache: {}, debounce: null,
  },
};

const GEOGRAPHIC_LAYERS = new Set(['weather','beaches','health','disaster','crowds','cost','safety','internet','visa','strength','kids']);
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
  { id:'health-safety', label:'Health & Safety', emoji:'💊', keys:['health','vaccines','road','corrupt','disaster'] },
  { id:'lifestyle',     label:'Lifestyle',       emoji:'👤', keys:['solo','lgbtq','family','remote','kids'] },
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
    catDd.style.cssText = 'position:fixed;z-index:1600;background:var(--panel);border:1px solid var(--b2);border-radius:10px;padding:10px;display:none;flex-direction:column;gap:4px;min-width:185px;box-shadow:0 10px 36px rgba(0,0,0,.88);backdrop-filter:blur(20px)';
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
      const isOpen = catDd.style.display === 'flex';
      document.querySelectorAll('.cat-dropdown').forEach(dd => { dd.style.display = 'none'; });
      if (!isOpen) {
        catDd.style.display = 'flex';
        const r = catBtn.getBoundingClientRect();
        catDd.style.top  = (r.bottom + 5) + 'px';
        catDd.style.left = Math.min(r.left, window.innerWidth - 200) + 'px';
      }
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

// ─── Transport Layer Buttons (single dropdown) ────────────────────────────────
let timezoneLayer     = null;   // UTC meridian line labels overlay
let timezoneChoroLayer = null;  // country choropleth colored by UTC offset
let _tzActive          = false; // module-scope flag; read by updateLegend / syncTransportBtn

// Maps UTC offset [-12, +14] to a distinct HSL hue.
// UTC-12 → hue 0° (warm red), UTC+14 → hue 260° (blue-violet).
function tzOffsetColor(offset) {
  if (offset === null || offset === undefined) return '#1a1a28';
  const t   = (offset + 12) / 26;   // normalise to [0, 1]
  const hue = Math.round(t * 260);  // 0° → 260°
  return `hsl(${hue}, 60%, 38%)`;
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

function syncTransportBtn() {
  const btn = document.getElementById('btn-transport-menu');
  if (!btn) return;
  const anyOn = Object.values(TRANSPORT_LAYERS).some(d => d.active)
             || _tzActive
             || Object.values(POI_LAYERS).some(d => d.active);
  btn.classList.toggle('has-active', anyOn);
}

function buildTransportButtons() {
  const container = document.getElementById('transport');

  // Single dropdown button for ALL transport + overlays
  const transpBtn = document.createElement('button');
  transpBtn.id = 'btn-transport-menu';
  transpBtn.className = 'cat-btn';
  transpBtn.innerHTML = '<span>🚗</span><span>Transport</span><span style="font-size:7px;opacity:0.6">▾</span>';

  const transpDd = document.createElement('div');
  transpDd.id = 'transport-dropdown';
  transpDd.className = 'cat-dropdown';
  transpDd.style.cssText = 'position:fixed;z-index:1600;background:var(--panel);border:1px solid var(--b2);border-radius:10px;padding:10px;display:none;flex-direction:column;gap:4px;min-width:200px;box-shadow:0 10px 36px rgba(0,0,0,.88);backdrop-filter:blur(20px)';
  document.body.appendChild(transpDd);

  const transpLabel = document.createElement('div');
  transpLabel.className = 'more-dropdown-label';
  transpLabel.textContent = 'Transport & Overlays';
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
        if (def.vector) {
          // natparks: vector polygon border rendering via Overpass (not a tile layer)
          _fetchAndRenderParkBorders();
        } else {
          if (!def.layer) {
            // WMS layers need L.tileLayer.wms(); standard tile layers use L.tileLayer().
            def.layer = def.wms
              ? L.tileLayer.wms(def.url, { pane: 'transportPane', ...def.opts })
              : L.tileLayer(def.url,     { pane: 'transportPane', ...def.opts });
          }
          def.layer.addTo(map);
        }
        // Guidance for maritime (only useful when zoomed in to ports)
        if (key === 'maritime') {
          const st = document.getElementById('map-status');
          if (st) { st.textContent = '⚓ Maritime: zoom into port areas to see navigation marks and click for ferry/harbour data.'; st.style.display='block'; setTimeout(()=>{st.style.display='none';},6000); }
        }
        // Rail: render stop marker dots when layer is activated
        if (key === 'rail') _fetchAndRenderRailStops();
        // Trails: auto-show camping when hiking overlay is on
        if (key === 'trails') _refreshLinkedCamping();
      } else {
        if (def.vector) {
          // natparks vector off: remove drawn park borders
          _clearParkBorders();
        } else if (def.layer) {
          def.layer.remove();
        }
        // Rail off: remove stop dots and clear cache
        if (key === 'rail') { _clearRailStops(); _railStopCache = {}; }
        // Trails off: remove linked camping markers if camping button is not independently on
        if (key === 'trails') _refreshLinkedCamping();
      }
      syncTransportBtn();
      updateLegend();
    });
    transpDd.appendChild(btn);
  });

  // Timezone overlay toggle (no tile, client-side)
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
    toggleTimezoneLayer(!_tzActive);   // toggleTimezoneLayer sets _tzActive internally
    tzBtn.classList.toggle('on', _tzActive);
    syncTransportBtn();
  });
  transpDd.appendChild(tzBtn);

  // ── Explore: Overpass POI layers ──────────────────────────────────────────
  const exploreSep = document.createElement('div');
  exploreSep.className = 'more-dropdown-label';
  exploreSep.style.marginTop = '6px';
  exploreSep.textContent = 'Explore';
  transpDd.appendChild(exploreSep);

  Object.entries(POI_LAYERS).forEach(([key, def]) => {
    const pbtn = document.createElement('button');
    pbtn.id = `btn-poi-${key}`;
    pbtn.className = 'lb';
    pbtn.innerHTML = `<span class="lb-emoji">${[...def.label][0]}</span><span class="lb-name">${def.label.replace(/^\S+\s*/u, '')}</span>`;
    pbtn.classList.toggle('on', def.active);
    pbtn.addEventListener('click', () => {
      def.active = !def.active;
      pbtn.classList.toggle('on', def.active);
      // Holidays layer: static data, no Overpass query needed
      if (key === 'holidays') {
        if (def.active) _renderHolidayMarkers();
        else _clearHolidayMarkers();
        syncTransportBtn();
        updateLegend();
        return;
      }
      if (def.active) {
        _fetchAndRenderPOI(key);
        // Parks POI: also show camping sites automatically
        if (key === 'parks') _refreshLinkedCamping();
      } else {
        _clearPOIMarkers(key);
        // Parks POI off: remove linked camping markers if camping is not independently on
        if (key === 'parks') _refreshLinkedCamping();
      }
      syncTransportBtn();
      updateLegend();
    });
    transpDd.appendChild(pbtn);
  });

  // Toggle dropdown on button click
  transpBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = transpDd.style.display === 'flex';
    document.querySelectorAll('.cat-dropdown').forEach(dd => { dd.style.display='none'; });
    if (!isOpen) {
      transpDd.style.display = 'flex';
      const r = transpBtn.getBoundingClientRect();
      transpDd.style.top  = (r.bottom + 5) + 'px';
      transpDd.style.left = Math.min(r.left, window.innerWidth - 220) + 'px';
    }
  });

  container.appendChild(transpBtn);
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
    if (lk === 'visa')     return selectedNationality ? getVisaRating(parentIso2, selectedNationality) : null;
    if (lk === 'strength') return selectedNationality ? getStrengthRating(parentIso2) : null;
    const arr = (d1 && d1[lk]) || (d2 && d2[lk]);
    return arr != null ? getRating(arr) : null;
  }).filter(v => v !== null);
  if (ratings.length === 0) return null;
  return Math.max(...ratings);
}

// ─── Style ────────────────────────────────────────────────────────────────────
function getCountryStyle(iso2, hover) {
  // Hide countries represented in the admin-1 layer ONLY when admin-1 is visible
  if (_admin1Visible && _coveredByAdmin1.has(iso2)) {
    return { fillColor: 'transparent', fillOpacity: 0, color: 'transparent', weight: 0 };
  }
  if (activeLayers.size === 0) {
    return { fillColor: '#000', fillOpacity: 0, color: 'rgba(201,168,76,0.04)', weight: 0.3 };
  }
  // Climate zones now live in the lower climatePane (z-index 290).
  // Country/admin-1 fills render above them at choroplethPane (z-index 300).
  // No suppression needed — both layers are always visible simultaneously.
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
  // Climate zones are in climatePane (z-290), admin-1 fill renders above them.
  // No suppression — admin-1 and climate zone fills show simultaneously.
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
        if (html) toggleTooltip('country:' + iso2, html, e.originalEvent.clientX, e.originalEvent.clientY);
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
// At zoom < 4: show nothing (too cluttered at world view).
// At zoom 4–6: show static BORDERS curated list (major crossings).
// At zoom ≥ 7: fetch all OSM border_control nodes in the viewport via Overpass.
function renderBorderMarkers() {
  borderMarkers.forEach(m => m.remove());
  borderMarkers = [];
  _borderPoiMarkers.forEach(m => m.remove());
  _borderPoiMarkers = [];
  if (!showBorders) return;

  const zoom = map.getZoom();
  if (zoom < 4) return;

  if (zoom >= 7) {
    _fetchAndRenderBorders();
    return;
  }

  // Zoom 4–6: render curated static list
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
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${val}</div></div></div>` : '';
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
    <h3 id="tt-name">${t.name || 'Beach'}</h3>
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
    ? `[out:json][timeout:20];node["tourism"="viewpoint"]["name"](${bbox});out body 200;`
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
  const style = key === 'camping'
    ? { color: '#fff', fillColor: '#22c55e', weight: 0.8 }
    : key === 'viewpoints'
    ? { color: '#c4b5fd', fillColor: '#a855f7', weight: 1.5 }
    : { color: '#fff', fillColor: '#15803d', weight: 0.8 };
  const radius = key === 'viewpoints' ? 5 : 6;
  const fillOpacity = key === 'viewpoints' ? 0.85 : 0.88;
  elements.forEach(el => {
    const lat = el.lat || (el.center && el.center.lat);
    const lon = el.lon  || (el.center && el.center.lon);
    if (!lat || !lon) return;
    const t = el.tags || {};
    const m = L.circleMarker([lat, lon], {
      pane: 'markersPane', radius, fillOpacity, ...style,
    });
    m.on('click', ev => {
      _featureClicked = true;
      const ttKey = key + ':' + (el.id || (lat + ':' + lon));
      const html = key === 'camping'
        ? _buildCampingTooltip(t)
        : key === 'viewpoints'
        ? _buildViewpointTooltip(t)
        : _buildParkTooltip(t);
      toggleTooltip(ttKey, html, ev.originalEvent.clientX, ev.originalEvent.clientY);
      setTimeout(() => { _featureClicked = false; }, 10);
    });
    m.addTo(map);
    def.markers.push(m);
  });
}

function _buildCampingTooltip(t) {
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${val}</div></div></div>` : '';
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
    <h3 id="tt-name">${t.name || 'Camp Site'}</h3>
    <div class="ts" id="tt-sub">${t.operator || ''}</div>
    <div class="tm" id="tt-period">CAMPING — OSM</div>
  </div><div class="ttb" id="tt-body">${fields || '<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional OSM data for this campsite.</div>'}</div>`;
}

function _buildParkTooltip(t) {
  const row = (lbl, val) => val ? `<div class="ttr"><div class="tti"><div class="ttln">${lbl}</div><div class="ttrat">${val}</div></div></div>` : '';
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
    <h3 id="tt-name">${t.name || 'Protected Area'}</h3>
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
    <h3 id="tt-name">${t.name || 'Viewpoint'}</h3>
    <div class="ts" id="tt-sub">${t['addr:city'] || t.loc_name || ''}</div>
    <div class="tm" id="tt-period">VIEWPOINT — OSM</div>
  </div>
  <div class="ttb" id="tt-body">
    ${fields || '<div style="color:var(--dim);font-size:8px;padding:4px 0">No additional OSM data for this viewpoint.</div>'}
  </div>`;
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
  // Query ways only (lighter than relations) — sufficient to draw visible borders.
  const query = `[out:json][timeout:30];(way["boundary"="national_park"](${s},${w},${n},${e});way["leisure"="nature_reserve"](${s},${w},${n},${e});way["protect_class"~"^(1|2|3|4|5|6)"](${s},${w},${n},${e}););out geom qt 80;`;

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

// ─── Road Click Info ──────────────────────────────────────────────────────────
// Queries Overpass for named roads and highway refs near the click point.
// Called when the Roads tile layer is active and the user clicks the map.

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
  const months = [...selectedMonths];
  // For each country with holiday data, find a representative lat/lng from GeoJSON.
  // Use the choropleth GeoJSON layer (_geoData) to get country centroids.
  if (!_geoData || !_geoData.features) return;
  _geoData.features.forEach(f => {
    const iso2 = getIso2(f.properties);
    if (!iso2 || !COUNTRY_HOLIDAYS[iso2]) return;
    const hols = [];
    months.forEach(m => {
      const list = COUNTRY_HOLIDAYS[iso2][m];
      if (list && list.length) hols.push(...list.map(h => h));
    });
    if (!hols.length) return;
    // Get centroid from bounding box
    let lat = 0, lng = 0;
    try {
      const bounds = L.geoJSON(f).getBounds();
      lat = (bounds.getSouth() + bounds.getNorth()) / 2;
      lng = (bounds.getWest() + bounds.getEast()) / 2;
    } catch(e) { return; }
    if (!isFinite(lat) || !isFinite(lng)) return;
    const marker = L.circleMarker([lat, lng], {
      pane: 'markersPane',
      radius: 7,
      color: '#ffffff',
      weight: 1.5,
      fillColor: '#f59e0b',
      fillOpacity: 0.88,
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

  return `<div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(201,168,76,0.12)">
    <div class="ttln">MONTHLY CLIMATE — ${periodLabel()}</div>
    <div style="display:flex;gap:14px;margin-top:8px;align-items:flex-start">
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
    ${eventHtml}
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
  const costSection = buildCostDetailsSection(iso2);
  const visaSection = buildVisaSection(iso2);
  const tzSection   = buildTimezoneSection(iso2);
  const holSection  = buildHolidaysSection(iso2);
  const isPinned    = pinnedCountries.includes(iso2);
  const pinLabel    = isPinned ? '&#x2665; Pinned' : '&#x2661; Compare';
  const pinSection  = `<div style="padding:6px 14px 10px">
    <button class="tt-pin-btn${isPinned ? ' pinned' : ''}" data-iso2="${iso2}" onclick="togglePinCountry('${iso2}')">${pinLabel}</button>
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
    internet: '📶 Connectivity data below',
  };
  const ctxBand = ctxLabels[ctx]
    ? `<div style="background:rgba(201,168,76,0.08);border-bottom:1px solid rgba(201,168,76,0.12);padding:4px 14px;font-size:7.5px;color:rgba(201,168,76,0.7);letter-spacing:1px">${ctxLabels[ctx]}</div>`
    : '';
  const visitedBtn = isVisited(iso2)
    ? `<div style="font-size:8px;color:#22c55e;padding:6px 0;text-align:center;opacity:0.8">&#x2713; VISITED</div>`
    : `<button onclick="markVisited('${iso2}');this.outerHTML='<div style=\\'font-size:8px;color:#22c55e;padding:6px 0;text-align:center\\'>&#x2713; MARKED AS VISITED</div>';" style="width:100%;margin-top:8px;padding:5px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:5px;color:#4ade80;font-size:8px;cursor:pointer;font-family:var(--fm);letter-spacing:1px">+ MARK AS VISITED</button>`;
  const flag = getFlag(iso2);
  const scoreChip = buildCompositeScore(CD[iso2] || {}, iso2);
  return `<div class="tth">
    <h3 id="tt-name">${flag ? flag + ' ' : ''}${name}${curr}</h3>
    <div class="ts" id="tt-sub">${iso2}</div>
    <div class="tm" id="tt-period">${periodLabel()}</div>
    ${scoreChip}
    ${bestTimeLine}
  </div>${ctxBand}
  <div class="ttb" id="tt-body">${rows}${costSection}${visaSection}${tzSection}${holSection}${visitedBtn}</div>${pinSection}`;
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
      + '</select></div>';
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
      wildfires:{ color: '#ef4444', label: 'Active Wildfires', note: 'NASA FIRMS near-real-time' },
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
  if (_tzActive) {
    let stops = '';
    for (let o = -12; o <= 14; o += 2) {
      const pct = Math.round(((o + 12) / 26) * 100);
      stops += `,${tzOffsetColor(o)} ${pct}%`;
    }
    html += `<div class="ll">
      <div class="ll-name">Timezones</div>
      <div style="height:8px;border-radius:3px;margin:4px 0;background:linear-gradient(to right${stops})"></div>
      <div style="display:flex;justify-content:space-between;font-size:7px;color:var(--dim);margin-top:2px">
        <span>UTC−12</span><span>UTC 0</span><span>UTC+14</span>
      </div>
    </div>`;
  }

  // ── POI layer legend entries ────────────────────────────────────────────────
  const POI_META = {
    camping:    { color:'#22c55e', label:'Camp Sites',               note:'OSM tourism=camp_site' },
    parks:      { color:'#15803d', label:'Parks & Forests',          note:'OSM national_park · nature_reserve · forest' },
    viewpoints: { color:'#a855f7', label:'Viewpoints / Photo Spots', note:'OSM tourism=viewpoint' },
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
    // Park border vectors: re-evaluate on zoom change.
    if (TRANSPORT_LAYERS.natparks.active) {
      if (map.getZoom() >= 5) _fetchAndRenderParkBorders();
      else _clearParkBorders();
    }
    // Update beach legend when crossing the zoom-7 threshold.
    if (activeLayers.has('beaches')) updateLegend();
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
    free:  { col:'#43A047', icon:'✅', label:'Visa-free',       desc:'No visa required. Present your passport on arrival.' },
    eta:   { col:'#8BC34A', icon:'📱', label:'ETA / Pre-reg.',  desc:'Quick online registration required before travel. Usually approved in minutes.' },
    evisa: { col:'#FDD835', icon:'💻', label:'E-Visa',          desc:'Online visa application. Processing typically 3–10 business days.' },
    voa:   { col:'#FDD835', icon:'🏛', label:'Visa on Arrival', desc:'Obtain a visa stamp at the airport on arrival. Have cash and photos ready.' },
    req:   { col:'#EF6C00', icon:'📋', label:'Visa Required',   desc:'Apply at the embassy or consulate before departure. Allow 2–6 weeks.' },
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
    </div>
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
  if (!activeLayers.has('cost')) return '';
  if (typeof COST_DETAILS === 'undefined' || !COST_DETAILS[iso2]) return '';
  const d    = COST_DETAILS[iso2];
  const curr = (typeof CURRENCY !== 'undefined' && CURRENCY[iso2]) ? CURRENCY[iso2] : '';
  const $ = n => (n > 0 ? `~$${n}` : 'N/A');
  return `<div style="margin-top:6px;padding-top:8px;border-top:1px solid rgba(201,168,76,0.10)">
    <div style="font-size:6.5px;color:rgba(201,168,76,0.45);letter-spacing:1.8px;text-transform:uppercase;margin-bottom:7px">
      BUDGET COSTS${curr ? ' &middot; ' + curr : ''}
    </div>
    <div class="ttr">
      <div class="ttstrip" style="background:#6a8a5a"></div>
      <div class="tti">
        <div class="ttln">ACCOMMODATION</div>
        <div class="ttrat" style="color:#90c070">Hostel / guesthouse</div>
        <div class="ttdesc">${$(d.hostel)} per night</div>
      </div>
    </div>
    <div class="ttr">
      <div class="ttstrip" style="background:#8a7a3a"></div>
      <div class="tti">
        <div class="ttln">MEALS</div>
        <div class="ttrat" style="color:#c8a860">Budget street meal</div>
        <div class="ttdesc">${$(d.meal)} per meal</div>
      </div>
    </div>
    <div class="ttr">
      <div class="ttstrip" style="background:#4a6a8a"></div>
      <div class="tti">
        <div class="ttln">LOCAL TRANSPORT</div>
        <div class="ttrat" style="color:#80a8c8">Bus / metro</div>
        <div class="ttdesc">${$(d.transport)} per day</div>
      </div>
    </div>
    <div class="ttr">
      <div class="ttstrip" style="background:#6a5a8a"></div>
      <div class="tti">
        <div class="ttln">DRINKS</div>
        <div class="ttrat" style="color:#a090c8">Coffee ${$(d.coffee)} &middot; Beer ${$(d.beer)}</div>
        ${d.note ? `<div class="ttdesc" style="margin-top:3px">${d.note}</div>` : ''}
      </div>
    </div>
  </div>`;
}


// ─── URL Deep Linking ─────────────────────────────────────────────────────────
function initURLState() {
  // Read initial state from URL hash e.g. #month=6&layer=weather&nat=US
  const params = new URLSearchParams(window.location.hash.slice(1));
  const m = parseInt(params.get('month'));
  if (!isNaN(m) && m >= 0 && m <= 11) setMonth(m);
  const lyr = params.get('layer');
  if (lyr && typeof LAYERS !== 'undefined' && lyr in LAYERS) {
    activeLayers.clear(); activeLayers.add(lyr);
  }
  const nat = params.get('nat');
  if (nat) {
    selectedNationality = nat;
    // The select element is populated later by initNationalitySelector();
    // it reads selectedNationality on init and sets sel.value accordingly.
  }
}

function updateURLState() {
  const lyr = [...activeLayers][0] || '';
  let hash = 'month=' + activeMonth;
  if (lyr) hash += '&layer=' + lyr;
  if (selectedNationality) hash += '&nat=' + selectedNationality;
  history.replaceState(null, '', '#' + hash);
}

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
};

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
    if (!matches.length) { list.style.display = 'none'; return; }
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

function renderComparePanel() {
  let panel = document.getElementById('compare-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'compare-panel';
    panel.innerHTML = `
      <div id="compare-header">
        <span id="compare-title">Compare (${pinnedCountries.length})</span>
        <span id="compare-close-btn" onclick="closeComparePanel()" title="Close panel">&#x2715;</span>
      </div>
      <div id="compare-list"></div>`;
    document.body.appendChild(panel);
  }

  const titleEl = panel.querySelector('#compare-title');
  if (titleEl) titleEl.textContent = `Compare (${pinnedCountries.length})`;

  const list = panel.querySelector('#compare-list');
  if (!list) return;

  if (pinnedCountries.length === 0) {
    list.innerHTML = '<div id="compare-empty">Pin countries using the ♡ button in each country tooltip.<br><br>Up to 10 countries can be compared side by side.</div>';
    panel.classList.remove('open');
    return;
  }

  panel.classList.add('open');

  list.innerHTML = '';
  pinnedCountries.forEach(iso2 => {
    const name = (typeof COUNTRY_NAMES !== 'undefined' && COUNTRY_NAMES[iso2]) ||
                  countryNames[iso2] || iso2;
    const item = document.createElement('div');
    item.className = 'cp-item';

    // Build score chips for active geographic layers
    let scoreHtml = '';
    const dataObj = (typeof CD !== 'undefined' && CD[iso2]) || null;
    const geoKeys = [...activeLayers].filter(k => typeof GEOGRAPHIC_LAYERS !== 'undefined' && GEOGRAPHIC_LAYERS.has(k));
    geoKeys.forEach(key => {
      let v = null;
      if (dataObj && dataObj[key]) {
        v = typeof getRating === 'function' ? getRating(dataObj[key]) : null;
      } else if (key === 'cost'     && typeof CD_COST     !== 'undefined') v = CD_COST[iso2]     ?? null;
      else if (key === 'safety'   && typeof CD_SAFETY   !== 'undefined') v = CD_SAFETY[iso2]   ?? null;
      else if (key === 'internet' && typeof CD_INTERNET !== 'undefined') v = CD_INTERNET[iso2] ?? null;
      if (v === null) return;
      const vc  = Math.min(3, Math.max(0, v));
      const col = RC[vc];
      const lbl = (typeof LAYER_LABELS !== 'undefined' && LAYER_LABELS[key]) ||
                  (typeof LAYERS !== 'undefined' && LAYERS[key] && LAYERS[key].levels) ||
                  ['0','1','2','3'];
      scoreHtml += `<span class="cp-score" style="color:${col};border-color:${col}22">${lbl[vc]}</span>`;
    });

    item.innerHTML = `
      <div class="cp-name">
        <span>${name}</span>
        <span class="cp-remove" data-iso2="${iso2}" title="Remove">&#x2715;</span>
      </div>
      <div class="cp-scores">${scoreHtml || '<span class="cp-score">—</span>'}</div>`;

    item.addEventListener('click', e => {
      if (e.target.classList.contains('cp-remove')) {
        togglePinCountry(e.target.dataset.iso2);
        return;
      }
      const c = typeof COUNTRY_CENTERS !== 'undefined' ? COUNTRY_CENTERS[iso2] : null;
      if (c && map) map.flyTo(c, 5, { duration: 1.2 });
    });
    item.addEventListener('mouseenter', () => highlightCountry(iso2));
    item.addEventListener('mouseleave', () => unhighlightCountry(iso2));

    list.appendChild(item);
  });
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
  Object.keys(POI_LAYERS).forEach(key => {
    const def = POI_LAYERS[key];
    map.on('moveend', () => {
      clearTimeout(def.debounce);
      def.debounce = setTimeout(() => {
        const linked = key === 'camping' && (TRANSPORT_LAYERS.trails.active || POI_LAYERS.parks.active);
        if (!def.active && !linked) return;
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
  initURLState();     // URL hash overrides month + layer if present
  initMap();
  buildMonthSelector();
  buildLayerButtons();
  syncCatButtons();       // highlight category buttons for any layers restored from localStorage
  buildTransportButtons();
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

  } catch (err) {
    console.error('[Nomadic Almanac] Boot error:', err);
    showBootError(err.message || String(err));
  }
})();

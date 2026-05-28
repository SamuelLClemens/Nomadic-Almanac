'use strict';

// ─── State ────────────────────────────────────────────────────────────────────
let activeMonth    = new Date().getMonth();
let selectedMonths = new Set([new Date().getMonth()]);
let yearMode       = false;
let activeLayers   = new Set(['weather']);
let showBorders    = false;
let showPolitical  = true;   // country borders + territory overlays on by default
let map            = null;
let cityMarkers    = [];
let borderMarkers    = [];
let beachMarkers     = [];
let climateZoneLayer  = null;
let _climateRenderer  = null;
let geojsonLayer     = null;
let borderLinesLayer     = null;
let territoryLayerGroup  = null;
let _geoData       = null;   // cached choropleth GeoJSON for border-lines reuse
let countryNames   = {};
let tooltipVisible = false;

// Admin-1 sub-national choropleth
let _admin1GeoData   = null;
let admin1ChoroLayer = null;
let _coveredByAdmin1 = new Set();   // ISO-2 codes present in admin-1 data

// Transport tile layers — config + runtime state bundled per layer
const TRANSPORT_LAYERS = {
  roads: {
    label: '🛣 Roads',
    // Stadia/Stamen Toner Lines requires an API key since 2024; replaced with
    // the free Esri World Transportation reference overlay (transparent PNG tiles).
    // Note: ArcGIS REST tile order is {z}/{y}/{x} — different from OSM convention.
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
    opts: { opacity: 0.75, maxZoom: 19, className: 'transport-roads-layer',
            attribution: 'Roads &copy; <a href="https://www.esri.com">Esri</a>, HERE, Garmin' },
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
};

const GEOGRAPHIC_LAYERS = new Set(['weather','beaches','health','disaster','crowds']);
const BEACH_STATUS_COL  = { open:'#06b6d4', seasonal:'#f59e0b', restricted:'#8b5cf6', closed:'#ef4444' };

// Works with Natural Earth (ISO_A2), lowercase (iso_a2), or geo-countries (ISO3166-1-Alpha-2)
const getIso2 = p => (p && (p.ISO_A2 || p.iso_a2 || p['ISO3166-1-Alpha-2'])) || '';

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

let _ttX = 0, _ttY = 0;

// ─── Map Init ────────────────────────────────────────────────────────────────
function initMap() {
  map = L.map('map', {
    center: [22, 14],
    zoom: 3,
    minZoom: 2,
    maxZoom: 18,
    worldCopyJump: true,   // snap view back to primary copy when panning past ±180°
    preferCanvas: false,
  });

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

  map.createPane('labelPane');
  map.getPane('labelPane').style.zIndex = '450';
  map.getPane('labelPane').style.pointerEvents = 'none';

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19,
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
function buildLayerButtons() {
  const container = document.getElementById('layers');

  Object.entries(LAYERS).forEach(([key, layer]) => {
    const btn = document.createElement('button');
    btn.className = 'lb' + (activeLayers.has(key) ? ' on' : '');
    btn.dataset.key = key;

    if (layer.color) btn.style.setProperty('--lb-color', layer.color);

    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'lb-emoji';
    emojiSpan.textContent = layer.emoji;
    btn.appendChild(emojiSpan);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'lb-name';
    nameSpan.textContent = layer.name;
    btn.appendChild(nameSpan);

    btn.addEventListener('click', () => {
      if (activeLayers.has(key)) activeLayers.delete(key);
      else activeLayers.add(key);
      btn.classList.toggle('on', activeLayers.has(key));
      refresh();
    });

    container.appendChild(btn);
  });

  const borderBtn = document.createElement('button');
  borderBtn.id = 'btn-borders';
  borderBtn.innerHTML = '🛂 Borders';
  borderBtn.addEventListener('click', () => {
    showBorders = !showBorders;
    borderBtn.classList.toggle('on', showBorders);
    renderBorderMarkers();
    updateLegend();
  });
  container.appendChild(borderBtn);

  const politicalBtn = document.createElement('button');
  politicalBtn.id = 'btn-political';
  politicalBtn.innerHTML = '🗺 Political';
  politicalBtn.classList.toggle('on', showPolitical);
  politicalBtn.addEventListener('click', () => {
    showPolitical = !showPolitical;
    politicalBtn.classList.toggle('on', showPolitical);
    renderPoliticalLayers();
    updateLegend();
  });
  container.appendChild(politicalBtn);
}

// ─── Transport Layer Buttons ──────────────────────────────────────────────────
function buildTransportButtons() {
  const container = document.getElementById('transport');

  Object.entries(TRANSPORT_LAYERS).forEach(([key, def]) => {
    const btn = document.createElement('button');
    btn.id = `btn-t-${key}`;
    btn.className = 'tb';
    btn.textContent = def.label;

    btn.addEventListener('click', () => {
      def.active = !def.active;
      btn.classList.toggle('on', def.active);

      if (def.active) {
        if (!def.layer) {
          def.layer = L.tileLayer(def.url, { pane: 'transportPane', ...def.opts });
        }
        def.layer.addTo(map);
      } else if (def.layer) {
        def.layer.remove();
      }

      updateLegend();
    });

    container.appendChild(btn);
  });
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
    const arr = d[lk];
    return arr != null ? getRating(arr) : null;
  }).filter(v => v !== null);
  if (ratings.length === 0) return null;
  return Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
}

// Like getCountryRating but checks CD_A1[subCode] first for province-specific
// data, then falls back to CD[parentIso2] for any layer not overridden.
function getAdmin1Rating(subCode, parentIso2) {
  const d1 = subCode ? CD_A1[subCode] : null;
  const d2 = CD[parentIso2];
  if (!d1 && !d2) return null;
  const layers = [...activeLayers];
  if (layers.length === 0) return null;
  const ratings = layers.map(lk => {
    const arr = (d1 && d1[lk]) || (d2 && d2[lk]);
    return arr != null ? getRating(arr) : null;
  }).filter(v => v !== null);
  if (ratings.length === 0) return null;
  return Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
}

// ─── Style ────────────────────────────────────────────────────────────────────
function getCountryStyle(iso2, hover) {
  // Hide countries that are fully represented in the admin-1 layer
  if (_coveredByAdmin1.has(iso2)) {
    return { fillColor: 'transparent', fillOpacity: 0, color: 'transparent', weight: 0 };
  }
  if (activeLayers.size === 0) {
    return { fillColor: '#000', fillOpacity: 0, color: 'rgba(201,168,76,0.04)', weight: 0.3 };
  }
  // When a geographic layer is active, climate zones own the fill — suppress country colour
  // but keep a near-invisible fill so the polygon remains mouse-interactive for tooltips.
  if (climateZoneLayer && [...activeLayers].some(lk => GEOGRAPHIC_LAYERS.has(lk))) {
    return {
      fillColor: 'transparent', fillOpacity: 0.001,
      color: hover ? 'rgba(232,213,163,0.45)' : 'rgba(255,255,255,0.18)',
      weight: hover ? 1.2 : 0.4,
    };
  }
  const r = getCountryRating(iso2);
  const fc = r !== null ? RC[Math.min(3, Math.max(0, r))] : 'transparent';
  const fo = r !== null ? (hover ? 0.86 : 0.52) : 0;
  return {
    fillColor: fc,
    fillOpacity: fo,
    color: hover ? 'rgba(232,213,163,0.65)' : 'rgba(255,255,255,0.30)',
    weight: hover ? 1.5 : 0.65,
  };
}

// Style for admin-1 (province/state) choropleth features.
// Uses province-specific data from CD_A1[subCode] when available,
// falling back to parent country CD[iso2] for any missing layers.
function getAdmin1Style(iso2, subCode, hover) {
  if (activeLayers.size === 0) {
    return { fillColor: '#000', fillOpacity: 0, color: 'rgba(255,255,255,0.07)', weight: 0.2 };
  }
  // Suppress admin-1 fill when climate zones own the geographic layers
  if (climateZoneLayer && [...activeLayers].some(lk => GEOGRAPHIC_LAYERS.has(lk))) {
    return {
      fillColor: 'transparent', fillOpacity: 0.001,
      color: hover ? 'rgba(232,213,163,0.35)' : 'rgba(255,255,255,0.12)',
      weight: hover ? 0.7 : 0.25,
    };
  }
  const r = getAdmin1Rating(subCode, iso2);
  const fc = r !== null ? RC[Math.min(3, Math.max(0, r))] : 'transparent';
  const fo = r !== null ? (hover ? 0.86 : 0.52) : 0;
  return {
    fillColor: fc,
    fillOpacity: fo,
    color: hover ? 'rgba(232,213,163,0.40)' : 'rgba(255,255,255,0.20)',
    weight: hover ? 0.9 : 0.35,
  };
}

// ─── Canvas Markers ───────────────────────────────────────────────────────────
function makeMarkerIcon(city, zoom) {
  const la = [...activeLayers];
  const n = la.length;
  if (n === 0) return null;

  // Radius: tiny dots that grow slightly with zoom.
  // No floor — at low zoom we want the smallest possible mark.
  const baseR = n > 1 ? 5 : 4;
  const zScale = zoom >= 8 ? 1.4 : zoom >= 6 ? 1.0 : 0.70;
  const SZ = Math.max(3, Math.round(baseR * zScale));  // min 3 → 6 px diam
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
        showTooltip(buildTerritoryTooltip(p.id, p.name, p.type, p.adminIso));
      });
      layer.on('mousemove', e => positionTooltip(e.originalEvent.clientX, e.originalEvent.clientY));
      layer.on('mouseout', () => {
        layer.setStyle(getTerritoryStyle(p, false));
        hideTooltip();
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
  const res = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
  const data = await res.json();
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

      layer.on('mouseover', e => {
        layer.setStyle(getCountryStyle(iso2, true));
        const html = buildCountryTooltip(iso2);
        if (html) showTooltip(html);
      });
      layer.on('mousemove', e => {
        positionTooltip(e.originalEvent.clientX, e.originalEvent.clientY);
      });
      layer.on('mouseout', () => {
        layer.setStyle(getCountryStyle(iso2, false));
        hideTooltip();
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

// Loads Natural Earth 10 m admin-1 GeoJSON and creates the sub-national choropleth.
// Runs after initChoropleth so _geoData / geojsonLayer already exist.
async function initAdmin1Choropleth() {
  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson'
    );
    if (!res.ok) throw new Error('HTTP ' + res.status);
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
      const iso2 = getAdmin1Iso2(f.properties);
      if (iso2 && cd_a1_countries.has(iso2)) _coveredByAdmin1.add(iso2);
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
          const html = buildAdmin1Tooltip(iso2, subCode, stateName, countryName);
          if (html) showTooltip(html);
        });
        layer.on('mousemove', e => positionTooltip(e.originalEvent.clientX, e.originalEvent.clientY));
        layer.on('mouseout', () => {
          layer.setStyle(getAdmin1Style(iso2, subCode, false));
          hideTooltip();
        });
      },
    }).addTo(map);

    // Re-render the country layer so that covered countries (CN, IN, US, etc.)
    // become transparent — their admin-1 provinces are now shown instead.
    renderChoropleth();

  } catch (e) {
    console.warn('Admin-1 choropleth unavailable — falling back to country level:', e.message);
  }
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

    marker.on('mouseover', e => {
      const html = buildCityTooltip(city);
      showTooltip(html);
    });
    marker.on('mousemove', e => {
      positionTooltip(e.originalEvent.clientX, e.originalEvent.clientY);
    });
    marker.on('mouseout', () => hideTooltip());

    marker.addTo(map);
    cityMarkers.push(marker);
  });
}

// ─── Border Markers ───────────────────────────────────────────────────────────
function renderBorderMarkers() {
  borderMarkers.forEach(m => m.remove());
  borderMarkers = [];
  if (!showBorders) return;

  const zoom = map.getZoom();
  BORDERS.forEach(bc => {
    const icon = makeBorderIcon(bc, zoom);
    const marker = L.marker([bc.lat, bc.lng], { icon, pane: 'markersPane' });

    marker.on('mouseover', e => showTooltip(buildBorderTooltip(bc)));
    marker.on('mousemove', e => positionTooltip(e.originalEvent.clientX, e.originalEvent.clientY));
    marker.on('mouseout', () => hideTooltip());

    marker.addTo(map);
    borderMarkers.push(marker);
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
  beachMarkers.forEach(m => m.remove());
  beachMarkers = [];
  if (!activeLayers.has('beaches')) return;
  const zoom = map.getZoom();
  if (zoom < 3) return;
  BEACHES.forEach(beach => {
    const icon = makeBeachIcon(beach, zoom);
    const marker = L.marker([beach.lat, beach.lng], { icon, pane: 'markersPane' });
    marker.on('mouseover', () => showTooltip(buildBeachTooltip(beach)));
    marker.on('mousemove', e => positionTooltip(e.originalEvent.clientX, e.originalEvent.clientY));
    marker.on('mouseout', () => hideTooltip());
    marker.addTo(map);
    beachMarkers.push(marker);
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

// ─── Climate Zones ────────────────────────────────────────────────────────────
function initClimateZones() {
  if (typeof CLIMATE_ZONES === 'undefined' || !CLIMATE_ZONES.length) return;
  // Dedicated SVG renderer so we can apply CSS blur to climate zones only,
  // leaving country borders crisp in the shared choroplethPane renderer.
  _climateRenderer = L.svg({ pane: 'choroplethPane' });
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
      pane: 'choroplethPane',
      renderer: _climateRenderer,
      style: f => styleClimateZone(f.properties),
      onEachFeature: (f, layer) => {
        layer.on('mouseover', () => showTooltip(buildClimateZoneTooltip(f.properties)));
        layer.on('mousemove', e => positionTooltip(e.originalEvent.clientX, e.originalEvent.clientY));
        layer.on('mouseout', () => hideTooltip());
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
    fillOpacity: 0.50,
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
  const tt = document.getElementById('tt');
  const W = tt.offsetWidth || 260;
  const H = tt.offsetHeight || 200;
  let left = cx + 18;
  let top  = cy - 20;
  if (left + W > window.innerWidth - 10) left = cx - W - 18;
  top = Math.max(66, top);
  top = Math.min(window.innerHeight - H - 10, top);
  tt.style.left = left + 'px';
  tt.style.top  = top  + 'px';
  _ttX = cx; _ttY = cy;
}

function showTooltip(html) {
  const tt = document.getElementById('tt');
  tt.innerHTML = html;
  tt.style.display = 'block';
  tooltipVisible = true;
  positionTooltip(_ttX, _ttY);
}

function hideTooltip() {
  document.getElementById('tt').style.display = 'none';
  tooltipVisible = false;
}

document.addEventListener('mousemove', e => {
  _ttX = e.clientX; _ttY = e.clientY;
  if (tooltipVisible) positionTooltip(e.clientX, e.clientY);
});

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
function periodLabel() {
  if (yearMode) return 'ANNUAL AVERAGE';
  if (selectedMonths.size === 1) return MONTHS_F[activeMonth].toUpperCase();
  const arr = [...selectedMonths].sort((a, b) => a - b);
  return `${MONTHS[arr[0]]}–${MONTHS[arr[arr.length - 1]]} AVG`;
}

// context is optional: { iso2 } — used to append country-specific safety notes.
function buildLayerRows(dataObj, context) {
  let html = '';
  activeLayers.forEach(key => {
    const layer = LAYERS[key];
    const arr = dataObj[key];
    if (!arr) return;
    const v = getRating(arr);
    if (v === null) return;
    const vc = Math.min(3, Math.max(0, v));
    const color = RC[vc];
    const label = layer.levels[vc];
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
        <div class="ttdesc">${desc}</div>
        ${crimeNote}
        ${buildSparkline(arr)}
      </div>
    </div>`;
  });
  return html;
}

function buildCountryTooltip(iso2) {
  if (activeLayers.size === 0) return null;
  const name = countryNames[iso2] || iso2;
  const rows = CD[iso2] ? buildLayerRows(CD[iso2], {iso2}) : '<div style="color:#5a4a20;font-size:8px;padding:4px 0">No data available for this territory.</div>';
  return `<div class="tth">
    <h3 id="tt-name">${name}</h3>
    <div class="ts" id="tt-sub">${iso2}</div>
    <div class="tm" id="tt-period">${periodLabel()}</div>
  </div>
  <div class="ttb" id="tt-body">${rows}</div>`;
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
  return `<div class="tth">
    <h3 id="tt-name">${stateName || countryName}</h3>
    <div class="ts" id="tt-sub">${stateName ? countryName : iso2}</div>
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

  if (active.length === 0 && !showBorders && !anyTransport) {
    legend.style.display = 'none';
    return;
  }
  legend.style.display = 'block';

  let html = '';
  active.forEach(key => {
    const layer = LAYERS[key];
    html += `<div class="ll">
      <div class="ll-name">${layer.name}</div>`;
    layer.levels.forEach((lbl, i) => {
      html += `<div class="lr">
        <div class="lsw" style="background:${RC2[i]}"></div>
        <span class="llabel">${lbl}</span>
      </div>`;
    });
    html += `</div>`;
  });

  if (activeLayers.has('beaches') && typeof BEACHES !== 'undefined' && BEACHES.length) {
    html += `<div class="ll">
      <div class="ll-name">Beach Markers</div>
      <div class="lr"><div class="lsw" style="background:#06b6d4;border-radius:50%"></div><span class="llabel">Open / Year-round</span></div>
      <div class="lr"><div class="lsw" style="background:#f59e0b;border-radius:50%"></div><span class="llabel">Seasonal</span></div>
      <div class="lr"><div class="lsw" style="background:#8b5cf6;border-radius:50%"></div><span class="llabel">Restricted</span></div>
      <div class="lr"><div class="lsw" style="background:#ef4444;border-radius:50%"></div><span class="llabel">Closed</span></div>
    </div>`;
  }

  if (showBorders) {
    html += `<div class="ll">
      <div class="ll-name">Border Crossings</div>
      <div class="lr"><div class="lsw-diamond" style="background:#22d3ee"></div><span class="llabel">Open</span></div>
      <div class="lr"><div class="lsw-diamond" style="background:#f59e0b"></div><span class="llabel">Restricted</span></div>
      <div class="lr"><div class="lsw-diamond" style="background:#ef4444"></div><span class="llabel">Closed</span></div>
    </div>`;
  }

  if (showPolitical) {
    html += `<div class="ll">
      <div class="ll-name">Political Borders</div>
      <div class="lr"><div class="lsw" style="background:transparent;border:1px solid rgba(255,255,255,0.3)"></div><span class="llabel">Country Borders</span></div>
      <div class="lr"><div class="lsw" style="background:transparent;border:1px solid rgba(255,255,255,0.1)"></div><span class="llabel">Province / State</span></div>
      <div class="lr"><div class="lsw" style="background:rgba(201,168,76,0.12);border:1px dashed #c9a84c"></div><span class="llabel">Disputed Territory</span></div>
      <div class="lr"><div class="lsw" style="background:transparent;border:1px dashed rgba(232,213,163,0.45)"></div><span class="llabel">Administered Territory</span></div>
    </div>`;
  }

  if (anyTransport) {
    const TSWATCH = {
      roads:    { color: '#aaaaaa', label: 'Roads & Paths', note: 'all classes' },
      rail:     { color: '#4466cc', label: 'Rail & Transit', note: 'train · metro · tram · cable car' },
      trails:   { color: '#44aa66', label: 'Hiking Trails', note: 'marked routes' },
      maritime: { color: '#22aabb', label: 'Maritime', note: 'ferries · sea routes' },
    };
    html += `<div class="ll"><div class="ll-name">Transport Layers</div>`;
    Object.entries(TRANSPORT_LAYERS).forEach(([key, def]) => {
      if (!def.active) return;
      const s = TSWATCH[key];
      html += `<div class="lr">
        <div class="lsw-line" style="background:${s.color}"></div>
        <div><span class="llabel">${s.label}</span><span class="llabel-note">${s.note}</span></div>
      </div>`;
    });
    html += `</div>`;
  }

  body.innerHTML = html;
}

function updateBadge() {
  syncMonthButtons();
}

// ─── Refresh ──────────────────────────────────────────────────────────────────
function refresh() {
  updateLegend();
  updateBadge();
  renderChoropleth();
  renderAdmin1Styles();
  if (climateZoneLayer) {
    const hasGeoLayer = [...activeLayers].some(lk => GEOGRAPHIC_LAYERS.has(lk));
    if (hasGeoLayer) {
      climateZoneLayer.setStyle(f => styleClimateZone(f.properties));
      if (!map.hasLayer(climateZoneLayer)) climateZoneLayer.addTo(map);
      // Soft-focus blur on the climate renderer only — country borders stay crisp
      if (_climateRenderer && _climateRenderer._container) {
        _climateRenderer._container.style.filter = 'blur(3px)';
      }
    } else {
      if (map.hasLayer(climateZoneLayer)) climateZoneLayer.remove();
    }
  }
  renderCityMarkers();
  renderBorderMarkers();
  renderBeachMarkers();
  renderPoliticalLayers();
}

// Re-render city and border markers on zoom (size and density changes)
let _zoomTimer = null;
function onZoom() {
  clearTimeout(_zoomTimer);
  _zoomTimer = setTimeout(() => { renderCityMarkers(); renderBorderMarkers(); renderBeachMarkers(); }, 150);
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
      const t = r.tags || {};
      const name  = t.name || t.ref || 'Unnamed Route';
      const dist  = t.distance ? `${parseFloat(t.distance).toFixed(0)} km` : '';
      const diff  = t['sac_scale'] ? t['sac_scale'].replace(/_/g, ' ') : '';
      const net   = t.network ? t.network.toUpperCase() : '';
      const surf  = t.surface || '';
      const parts = [dist && `${dist}`, diff, surf, net].filter(Boolean).join(' · ');
      return `<div class="ttr">
        <div class="ttstrip" style="background:#44aa66"></div>
        <div class="tti">
          <div class="ttln">HIKING ROUTE</div>
          <div class="ttrat" style="color:#4ade80">${name}</div>
          <div class="ttdesc">${parts || 'Named OSM route — click Waymarked Trails for full details.'}</div>
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
        <div class="ttstrip" style="background:#4466cc"></div>
        <div class="tti">
          <div class="ttln">${rw.toUpperCase()}</div>
          <div class="ttrat" style="color:#b0bce8">${name}</div>
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
        <div class="ttstrip" style="background:#2244aa"></div>
        <div class="tti">
          <div class="ttln">${route} ROUTE</div>
          <div class="ttrat" style="color:#b0bce8">${name}</div>
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
        <div class="ttstrip" style="background:#22aabb"></div>
        <div class="tti">
          <div class="ttln">${type.toUpperCase()}</div>
          <div class="ttrat" style="color:#80d8e0">${name}</div>
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
          <div class="ttrat" style="color:#80d8e0">${name}</div>
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
    const activeKeys = Object.entries(TRANSPORT_LAYERS)
      .filter(([, d]) => d.active)
      .map(([k]) => k);
    if (activeKeys.length === 0) return;

    const { lat, lng } = e.latlng;
    const cx = e.originalEvent.clientX;
    const cy = e.originalEvent.clientY;
    _ttX = cx; _ttY = cy;

    // Priority: trails > rail > maritime > roads (roads have no queryable feature API)
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
    // Roads layer: show a brief instructional tooltip
    if (activeKeys.includes('roads')) {
      _ttX = cx; _ttY = cy;
      showTooltip(`<div class="tth"><h3>🛣 Roads</h3><div class="ts">ESRI WORLD TRANSPORTATION</div>
        <div class="tm">Raster tile overlay — no feature data available</div></div>
        <div class="ttb"><div style="color:var(--dim);font-size:8px">Road names and classifications are rendered in the tile image. Switch to the Rail layer for clickable OSM data.</div></div>`);
    }
  });

  // Dismiss transport tooltip on map mouseout
  map.on('mouseout', () => {
    if (tooltipVisible) hideTooltip();
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
(async () => {
  initMap();
  buildMonthSelector();
  buildLayerButtons();
  buildTransportButtons();
  updateLegend();
  updateBadge();
  await initChoropleth();
  initPoliticalLayers();
  initClimateZones();
  refresh();
  map.on('zoom', onZoom);
  initTransportClickHandlers();
  initAdmin1Choropleth();
})();

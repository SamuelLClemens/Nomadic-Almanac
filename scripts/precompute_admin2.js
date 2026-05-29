/**
 * precompute_admin2.js
 *
 * Offline Node.js script that produces the CD_A2_PARENT mapping for data.js.
 *
 * CD_A2_PARENT maps each geoBoundaries ADM2 shapeID to its parent admin-1
 * ISO 3166-2 code (e.g. 'US-CA'). At runtime the map uses this to drive the
 * three-level rating fallback: CD_A2[shapeID] -> CD_A1[admin1Code] -> CD[iso2].
 *
 * Prerequisites
 * ─────────────
 *   node >= 18  (built-in fetch; no extra deps for HTTP)
 *   npm install @turf/boolean-point-in-polygon @turf/helpers
 *
 * The Natural Earth admin-1 GeoJSON is fetched at runtime to get province
 * geometries. Admin-2 GeoJSON files must already exist in data/admin2/.
 * See data/admin2/README.md for download instructions.
 *
 * Usage
 * ─────
 *   node scripts/precompute_admin2.js
 *
 * Output
 * ──────
 * Prints a JavaScript snippet to stdout. Paste the contents of CD_A2_PARENT
 * into data.js, replacing the empty object body.
 *
 * Also prints a "MISSES" section listing any CITIES entries whose coordinates
 * did not fall inside any ADM2 polygon (border towns, offshore locations, etc.).
 * Those entries will silently fall back to admin-1 → country data at runtime,
 * which is acceptable.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
const { point }             = require('@turf/helpers');

// ── Config ────────────────────────────────────────────────────────────────────

const ADMIN2_DIR = path.resolve(__dirname, '../data/admin2');
const CITIES_FILE = path.resolve(__dirname, '../data.js');

// ISO 3166-1 alpha-2 → alpha-3 (must match ISO2_TO_ISO3 in data.js)
const ISO2_TO_ISO3 = {
  AR:'ARG', AU:'AUS', BR:'BRA', CA:'CAN', CN:'CHN', CO:'COL',
  DE:'DEU', EG:'EGY', ES:'ESP', FR:'FRA', GB:'GBR', GR:'GRC',
  ID:'IDN', IN:'IND', IT:'ITA', JP:'JPN', MA:'MAR', MX:'MEX',
  NG:'NGA', NZ:'NZL', PE:'PER', PK:'PAK', PT:'PRT', RU:'RUS',
  TH:'THA', TR:'TUR', US:'USA', VN:'VNM', ZA:'ZAF',
};

// ── Load CITIES and admin-1 code lookup from data.js ─────────────────────────
// We execute data.js in a sandbox to extract the CITIES array and CD_A1 keys.

function loadDataJs() {
  const src = fs.readFileSync(CITIES_FILE, 'utf8');

  // Provide stubs for the helper functions used in data.js
  const rep  = v  => Array(12).fill(v);
  const s12  = (...a) => a;
  const mk   = (name, country, lat, lng, data) => ({ name, country, lat, lng, data });

  // Build a minimal execution context
  const ctx = { rep, s12, mk };

  // Wrap in a function and execute
  try {
    const fn = new Function(...Object.keys(ctx), src + '\nreturn { CITIES, CD_A1, ISO2_TO_ISO3: typeof ISO2_TO_ISO3 !== "undefined" ? ISO2_TO_ISO3 : {} };');
    return fn(...Object.values(ctx));
  } catch (e) {
    // data.js references DOM/Leaflet globals — just parse what we need via regex
    console.warn('Full eval failed, falling back to regex extraction:', e.message);
    return null;
  }
}

// ── Admin-1 code lookup via Natural Earth GeoJSON ─────────────────────────────
async function loadAdmin1Data() {
  console.error('Fetching Natural Earth admin-1 GeoJSON...');
  const res = await fetch(
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson'
  );
  if (!res.ok) throw new Error('Admin-1 fetch failed: HTTP ' + res.status);
  return res.json();
}

// Returns a map of iso3166_2 code → GeoJSON Feature for quick lookup
function buildAdmin1Index(admin1Geojson) {
  const index = {};
  admin1Geojson.features.forEach(f => {
    const code = f.properties.iso_3166_2;
    if (code && code !== '-99' && code !== '-1') {
      index[code] = f;
    }
  });
  return index;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Load city data
  console.error('Loading CITIES from data.js...');
  const dataJs = loadDataJs();

  // Parse CITIES array via a simpler approach if full eval failed
  let cities = [];
  if (dataJs && dataJs.CITIES) {
    cities = dataJs.CITIES;
  } else {
    // Fallback: parse city lat/lng/country from mk() calls via regex
    const src = fs.readFileSync(CITIES_FILE, 'utf8');
    const mkRe = /mk\(\s*'([^']+)'\s*,\s*'([A-Z]{2})'\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)/g;
    let m;
    while ((m = mkRe.exec(src)) !== null) {
      cities.push({ name: m[1], country: m[2], lat: parseFloat(m[3]), lng: parseFloat(m[4]) });
    }
    console.error(`Parsed ${cities.length} cities via regex fallback`);
  }

  if (cities.length === 0) {
    console.error('ERROR: No cities found. Aborting.');
    process.exit(1);
  }
  console.error(`Loaded ${cities.length} cities`);

  // 2. Load admin-1 data for fallback lookups
  const admin1Geojson = await loadAdmin1Data();
  console.error(`Loaded ${admin1Geojson.features.length} admin-1 features`);

  // 3. Process each country that has an admin-2 file
  const result = {};   // shapeID → admin1Code
  const misses = [];   // cities that didn't match any admin-2 polygon

  for (const [iso2, iso3] of Object.entries(ISO2_TO_ISO3)) {
    const filePath = path.join(ADMIN2_DIR, `${iso3}_ADM2_simplified.geojson`);
    if (!fs.existsSync(filePath)) {
      console.error(`  SKIP ${iso2} (${iso3}) — file not found: ${filePath}`);
      continue;
    }

    console.error(`  Processing ${iso2} (${iso3})...`);
    const geojson = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Find cities in this country
    const countryCities = cities.filter(c => c.country === iso2);
    if (countryCities.length === 0) {
      console.error(`    No cities for ${iso2} — skipping PIP`);
      continue;
    }

    // For each ADM2 feature, note which admin-1 code contains its centroid
    // to pre-build the shapeID → admin1Code mapping.
    // This uses each feature's shapeName region to look up the admin-1 parent
    // by testing if any city in that country falls inside the polygon.

    let matched = 0;
    for (const feature of geojson.features) {
      const shapeID = feature.properties.shapeID;
      if (!shapeID) continue;

      // Test each city in this country against this polygon
      for (const city of countryCities) {
        try {
          const pt = point([city.lng, city.lat]);
          if (booleanPointInPolygon(pt, feature)) {
            // Find the admin-1 code for this city's location
            // by testing the city point against admin-1 polygons
            let admin1Code = null;
            for (const a1Feature of admin1Geojson.features) {
              const a1Iso2 = (a1Feature.properties.iso_a2 || '').toUpperCase();
              if (a1Iso2 !== iso2) continue;
              const a1Code = a1Feature.properties.iso_3166_2;
              if (!a1Code || a1Code === '-99') continue;
              try {
                if (booleanPointInPolygon(pt, a1Feature)) {
                  admin1Code = a1Code;
                  break;
                }
              } catch (_) {}
            }
            result[shapeID] = admin1Code;
            matched++;
            break;  // one city match is enough to establish admin-1 parent
          }
        } catch (_) {}
      }
    }

    // Record cities with no admin-2 polygon match
    for (const city of countryCities) {
      const pt = point([city.lng, city.lat]);
      let found = false;
      for (const feature of geojson.features) {
        try {
          if (booleanPointInPolygon(pt, feature)) { found = true; break; }
        } catch (_) {}
      }
      if (!found) misses.push({ name: city.name, country: iso2, lat: city.lat, lng: city.lng });
    }

    console.error(`    Matched ${matched} features to admin-1 codes`);
  }

  // 4. Output CD_A2_PARENT snippet
  console.log('// CD_A2_PARENT — generated by scripts/precompute_admin2.js');
  console.log('// Paste this object body into data.js replacing the empty CD_A2_PARENT = { ... }');
  console.log('const CD_A2_PARENT = {');
  for (const [shapeID, admin1Code] of Object.entries(result)) {
    if (admin1Code) {
      console.log(`  '${shapeID}': '${admin1Code}',`);
    }
  }
  console.log('};');
  console.log('');

  // 5. Report misses
  if (misses.length > 0) {
    console.log(`// MISSES (${misses.length} cities not matched to any ADM2 polygon — will fall back to admin-1/country):`);
    misses.forEach(c => console.log(`//   ${c.name} (${c.country}) lat=${c.lat} lng=${c.lng}`));
  }

  console.error(`Done. ${Object.keys(result).length} shapeID mappings generated. ${misses.length} city misses.`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });

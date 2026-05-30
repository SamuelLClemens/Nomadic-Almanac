#!/usr/bin/env python3
"""
generate_county_weather.py

Computes monthly weather ratings (0=excellent → 3=harsh) for every
ADM2 county/district in data/admin2/ using 30-year ERA5 climate normals
(1991-2020) from the Open-Meteo archive API.

Rating method
─────────────
  • Monthly mean temperature (°C) and total precipitation (mm) are
    fetched from ERA5 reanalysis via archive-api.open-meteo.com.
  • Temperature rating:
      16–26 °C → 0   comfortable
      11–30 °C → 1   acceptable
       3–34 °C → 2   challenging
      otherwise → 3  harsh
  • Precipitation rating:
      < 40 mm → 0    dry
      40–90 mm → 1   moderate
     90–180 mm → 2   wet
      >180 mm → 3    very wet
  • Monthly rating = max(temp_rating, precip_rating)

Performance
───────────
  County centroids are rounded to a 0.5° grid and the API result is
  shared by all counties whose centroid falls on the same grid cell.
  This typically reduces 12,000+ features to 3,000–5,000 unique API
  calls. Results are cached to scripts/weather_cache.json so the
  script can be safely interrupted and resumed.

Usage (from project root)
─────────────────────────
  python3 scripts/generate_county_weather.py

  Estimated run time: 15–25 minutes (first run). Under 1 minute on
  subsequent runs when the cache is warm.

Output
──────
  Patches the CD_A2 = { ... } block in data.js with the generated
  entries. A backup is saved to data.js.bak before any write.
"""

import json, os, sys, time, re, shutil, threading
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from urllib.parse import urlencode
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).parent.resolve()
PROJECT_DIR = SCRIPT_DIR.parent
ADMIN2_DIR  = PROJECT_DIR / 'data' / 'admin2'
CACHE_FILE  = SCRIPT_DIR / 'weather_cache.json'
DATA_JS     = PROJECT_DIR / 'data.js'

# ── Config ─────────────────────────────────────────────────────────────────────
GRID_RES    = 0.5   # degrees — cluster centroids to reduce API calls
MAX_WORKERS = 5     # concurrent API requests
API_DELAY   = 0.15  # seconds between requests per worker

ISO2_TO_ISO3 = {
    'AR':'ARG','AU':'AUS','CA':'CAN','CN':'CHN','CO':'COL',
    'DE':'DEU','EG':'EGY','ES':'ESP','FR':'FRA','GB':'GBR','GR':'GRC',
    'ID':'IDN','IN':'IND','IT':'ITA','JP':'JPN','MA':'MAR','MX':'MEX',
    'NG':'NGA','NZ':'NZL','PE':'PER','PK':'PAK','PT':'PRT','RU':'RUS',
    'TH':'THA','TR':'TUR','US':'USA','VN':'VNM','ZA':'ZAF',
}

# ── Rating functions ───────────────────────────────────────────────────────────

def rate_temp(t):
    if t is None: return 1
    if 16 <= t <= 26: return 0
    if 11 <= t <= 30: return 1
    if  3 <= t <= 34: return 2
    return 3

def rate_precip(p):
    if p is None: return 0
    if p <  40: return 0
    if p <  90: return 1
    if p < 180: return 2
    return 3

def weather_rating(temp, precip):
    return max(rate_temp(temp), rate_precip(precip))

# ── GeoJSON centroid ───────────────────────────────────────────────────────────

def feature_centroid(feature):
    """Return (lat, lon) as the average of exterior ring vertices."""
    geom  = feature.get('geometry') or {}
    gtype = geom.get('type', '')
    coords = geom.get('coordinates', [])

    if gtype == 'Polygon':
        ring = coords[0] if coords else []
    elif gtype == 'MultiPolygon':
        # Use the polygon with the most vertices (usually the largest)
        ring = max(
            (p[0] for p in coords if p and p[0]),
            key=len,
            default=[]
        )
    else:
        return None

    if len(ring) < 3:
        return None

    lons = [pt[0] for pt in ring if len(pt) >= 2]
    lats = [pt[1] for pt in ring if len(pt) >= 2]
    if not lats:
        return None

    return round(sum(lats) / len(lats), 4), round(sum(lons) / len(lons), 4)


def grid_key(lat, lon):
    gl = round(round(lat / GRID_RES) * GRID_RES, 2)
    gn = round(round(lon / GRID_RES) * GRID_RES, 2)
    return f'{gl},{gn}'

# ── Climate API ────────────────────────────────────────────────────────────────

def fetch_normals(lat, lon, retries=3):
    """
    Fetch 1991-2020 monthly climate normals from Open-Meteo ERA5.
    Returns a list of 12 weather ratings [jan..dec], or None on failure.
    """
    params = urlencode({
        'latitude':   round(lat, 2),
        'longitude':  round(lon, 2),
        'start_date': '1991-01-01',
        'end_date':   '2020-12-31',
        'monthly':    'temperature_2m_mean,precipitation_sum',
        'timezone':   'UTC',
    })
    url = f'https://archive-api.open-meteo.com/v1/archive?{params}'

    for attempt in range(retries):
        try:
            req = Request(url, headers={'User-Agent': 'NomadicAlmanac/1.0'})
            with urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read())

            monthly = data.get('monthly', {})
            times   = monthly.get('time', [])
            temps   = monthly.get('temperature_2m_mean', [])
            precips = monthly.get('precipitation_sum', [])

            # Group values by calendar month (1-12) and average over 30 years
            t_by_m = defaultdict(list)
            p_by_m = defaultdict(list)

            for i, ts in enumerate(times):
                m = int(ts.split('-')[1])
                if i < len(temps)   and temps[i]   is not None:
                    t_by_m[m].append(temps[i])
                if i < len(precips) and precips[i] is not None:
                    p_by_m[m].append(precips[i])

            ratings = []
            for m in range(1, 13):
                avg_t = sum(t_by_m[m]) / len(t_by_m[m]) if t_by_m[m] else None
                avg_p = sum(p_by_m[m]) / len(p_by_m[m]) if p_by_m[m] else None
                ratings.append(weather_rating(avg_t, avg_p))

            return ratings

        except (URLError, HTTPError, json.JSONDecodeError, KeyError) as exc:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                print(f'    WARN: API failed ({lat:.2f},{lon:.2f}): {exc}',
                      file=sys.stderr)
                return None

    return None

# ── Cache ──────────────────────────────────────────────────────────────────────

_cache      = {}   # grid_key → [r1..r12] | None
_cache_lock = threading.Lock()

def load_cache():
    global _cache
    if CACHE_FILE.exists():
        with open(CACHE_FILE) as f:
            _cache = json.load(f)
        print(f'Cache loaded: {len(_cache)} grid points', file=sys.stderr)

def save_cache():
    with _cache_lock:
        with open(CACHE_FILE, 'w') as f:
            json.dump(_cache, f)

def get_ratings(lat, lon):
    key = grid_key(lat, lon)
    with _cache_lock:
        if key in _cache:
            return _cache[key]

    time.sleep(API_DELAY)
    ratings = fetch_normals(lat, lon)

    with _cache_lock:
        _cache[key] = ratings

    return ratings

# ── Per-country processor ──────────────────────────────────────────────────────

def process_country(iso2, iso3):
    filepath = ADMIN2_DIR / f'{iso3}_ADM2_simplified.geojson'
    if not filepath.exists():
        print(f'  SKIP {iso3}: file not found', file=sys.stderr)
        return {}

    print(f'  {iso3} — loading GeoJSON...', file=sys.stderr)
    with open(filepath) as f:
        geojson = json.load(f)

    features = geojson.get('features', [])
    print(f'  {iso3} — {len(features)} features, fetching climate data...',
          file=sys.stderr)

    entries = {}
    lock    = threading.Lock()

    def process_one(feature):
        shape_id = (feature.get('properties') or {}).get('shapeID', '')
        if not shape_id:
            return

        centroid = feature_centroid(feature)
        if not centroid:
            return

        lat, lon = centroid
        ratings  = get_ratings(lat, lon)
        if ratings and len(ratings) == 12:
            with lock:
                entries[shape_id] = ratings

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = [pool.submit(process_one, f) for f in features]
        done = 0
        for fut in as_completed(futures):
            fut.result()   # re-raise any exception
            done += 1
            if done % 200 == 0 or done == len(features):
                pct = int(100 * done / len(features))
                print(f'    {done}/{len(features)} ({pct}%) — '
                      f'{len(entries)} entries so far',
                      file=sys.stderr)
                save_cache()

    print(f'  {iso3} done — {len(entries)} entries generated', file=sys.stderr)
    return entries

# ── data.js patcher ────────────────────────────────────────────────────────────

def format_ratings(ratings):
    """Use rep(v) shorthand when all months share the same rating."""
    if len(set(ratings)) == 1:
        return f'rep({ratings[0]})'
    return 's12(' + ','.join(str(r) for r in ratings) + ')'

def patch_data_js(all_entries):
    with open(DATA_JS) as f:
        src = f.read()

    # Build replacement block
    lines = ['const CD_A2 = {',
             '  // Generated by scripts/generate_county_weather.py — do not edit by hand']
    for shape_id in sorted(all_entries):
        r = format_ratings(all_entries[shape_id])
        lines.append(f"  '{shape_id}': {{ weather: {r} }},")
    lines.append('};')
    new_block = '\n'.join(lines)

    # Locate existing CD_A2 block
    start_marker = 'const CD_A2 = {'
    try:
        start = src.index(start_marker)
    except ValueError:
        print('ERROR: Could not find "const CD_A2 = {" in data.js',
              file=sys.stderr)
        sys.exit(1)

    # Find the matching closing "};" — scan line by line from start
    tail = src[start:]
    lines_tail = tail.split('\n')
    end_line = None
    depth = 0
    for i, line in enumerate(lines_tail):
        depth += line.count('{') - line.count('}')
        if i > 0 and depth <= 0:
            end_line = i
            break

    if end_line is None:
        print('ERROR: Could not find closing }; for CD_A2', file=sys.stderr)
        sys.exit(1)

    end = start + len('\n'.join(lines_tail[:end_line + 1]))

    # Backup original
    shutil.copy(DATA_JS, str(DATA_JS) + '.bak')
    print(f'Backup saved to data.js.bak', file=sys.stderr)

    # Write patched file
    with open(DATA_JS, 'w') as f:
        f.write(src[:start] + new_block + src[end:])

    print(f'data.js patched — {len(all_entries)} CD_A2 entries written',
          file=sys.stderr)

# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    print('=== generate_county_weather.py ===', file=sys.stderr)
    print(f'Admin2 dir : {ADMIN2_DIR}', file=sys.stderr)
    print(f'Cache file : {CACHE_FILE}', file=sys.stderr)
    print('', file=sys.stderr)

    load_cache()

    all_entries = {}
    countries   = sorted(ISO2_TO_ISO3.items())

    for idx, (iso2, iso3) in enumerate(countries, 1):
        print(f'[{idx}/{len(countries)}] {iso2} / {iso3}', file=sys.stderr)
        entries = process_country(iso2, iso3)
        all_entries.update(entries)
        save_cache()
        print(f'  Running total: {len(all_entries)} entries\n', file=sys.stderr)

    print(f'=== Complete: {len(all_entries)} total entries ===', file=sys.stderr)
    patch_data_js(all_entries)

if __name__ == '__main__':
    main()

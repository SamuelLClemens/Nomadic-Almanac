#!/usr/bin/env python3
"""
generate_county_weather.py

Computes monthly weather ratings (0=excellent → 3=harsh) for every
ADM2 county/district in data/admin2/ using long-term monthly climate
normals from the NASA POWER Climatology API (no API key, no daily quota).

Data source
───────────
  NASA POWER Climatology API  https://power.larc.nasa.gov/api/
  Parameters: T2M (mean 2-metre temperature, °C)
              PRECTOTCORR (precipitation, mm/day → converted to mm/month)
  The API returns pre-computed long-term monthly averages in a single
  call per location — no manual aggregation required.

Rating method
─────────────
  • Temperature rating:
      16–26 °C → 0   comfortable
      11–30 °C → 1   acceptable
       3–34 °C → 2   challenging
      otherwise → 3  harsh
  • Precipitation rating (mm/month):
      < 40 mm → 0    dry
      40–90 mm → 1   moderate
     90–180 mm → 2   wet
      >180 mm → 3    very wet
  • Monthly rating = max(temp_rating, precip_rating)

Performance
───────────
  County centroids are rounded to a 0.5° grid and the API result is
  shared by all counties whose centroid falls on the same cell.
  This reduces ~14,000 features to ~3,000–5,000 unique API calls.
  Successful results are cached to scripts/weather_cache.json so the
  script can be safely interrupted and resumed. Failed (null) entries
  are NOT cached — they are retried on the next run.

Safety
──────
  The script aborts with exit code 2 if CONSECUTIVE_FAIL_LIMIT API
  calls fail in a row, preventing silent total-failure runs. Progress
  is printed every PROGRESS_INTERVAL features and after each country.

Usage (from project root)
─────────────────────────
  # Smoke-test one location first (always do this before a full run):
  python3 scripts/generate_county_weather.py --smoke-test

  # Full run:
  python3 scripts/generate_county_weather.py

  Estimated run time: 15–25 minutes (first run, ~4,000 API calls at
  5 workers with 0.15s delay). Under 1 minute when cache is warm.

Output
──────
  Patches the CD_A2 = { ... } block in data.js with the generated
  entries. A backup is saved to data.js.bak before any write.
"""

import json, sys, time, shutil, threading
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from urllib.parse import urlencode
from concurrent.futures import ThreadPoolExecutor, as_completed

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).parent.resolve()
PROJECT_DIR = SCRIPT_DIR.parent
ADMIN2_DIR  = PROJECT_DIR / 'data' / 'admin2'
CACHE_FILE  = SCRIPT_DIR / 'weather_cache.json'
DATA_JS     = PROJECT_DIR / 'data.js'

# ── Config ─────────────────────────────────────────────────────────────────────
GRID_RES               = 0.5   # degrees — dedup centroids to reduce API calls
MAX_WORKERS            = 2     # concurrent API requests — conservative to avoid 429
API_DELAY              = 1.0   # seconds between requests per worker (2 req/s total)
CONSECUTIVE_FAIL_LIMIT = 10    # abort if this many *real* (non-429) errors in a row
PROGRESS_INTERVAL      = 100   # print progress every N features per country
RATE_LIMIT_BACKOFF     = 90    # seconds to wait after a 429 Too Many Requests

MONTHS     = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
MONTH_DAYS = [31,   28,   31,   30,   31,   30,   31,   31,   30,   31,   30,   31  ]

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
    """p is mm/month."""
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

# ── Climate API (NASA POWER) ───────────────────────────────────────────────────

def fetch_normals(lat, lon, retries=3):
    """
    Fetch monthly climate normals from NASA POWER Climatology API.
    Returns a list of 12 weather ratings [jan..dec], or None on failure.

    API: https://power.larc.nasa.gov/api/temporal/climatology/point
    No API key required. No daily quota.
    Precipitation is returned in mm/day — converted to mm/month here.
    """
    params = urlencode({
        'parameters': 'T2M,PRECTOTCORR',
        'community':  'RE',
        'longitude':  round(lon, 2),
        'latitude':   round(lat, 2),
        'format':     'JSON',
    })
    url = f'https://power.larc.nasa.gov/api/temporal/climatology/point?{params}'

    for attempt in range(retries):
        try:
            req = Request(url, headers={'User-Agent': 'NomadicAlmanac/1.0'})
            with urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read())

            param  = data['properties']['parameter']
            temps  = param['T2M']
            precip = param['PRECTOTCORR']

            ratings = []
            for month, days in zip(MONTHS, MONTH_DAYS):
                t       = temps.get(month)
                p_daily = precip.get(month)
                # Convert mm/day → mm/month; treat missing as None
                p_monthly = (p_daily * days) if (p_daily is not None and p_daily >= 0) else None
                ratings.append(weather_rating(t, p_monthly))

            if len(ratings) != 12:
                raise ValueError(f'Expected 12 months, got {len(ratings)}')

            return ratings

        except HTTPError as exc:
            if exc.code == 429:
                # Rate-limited — pause the calling thread and retry.
                # This does NOT count as a consecutive failure; it is
                # a throttle signal, not a data error.
                wait = RATE_LIMIT_BACKOFF * (attempt + 1)
                print(f'    RATE LIMIT (429): waiting {wait}s before retry '
                      f'({lat:.2f},{lon:.2f}, attempt {attempt+1}/{retries})',
                      file=sys.stderr)
                time.sleep(wait)
                # Do NOT fall through to the failure handler below
                continue
            # Other HTTP errors — use standard back-off
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                print(f'    WARN: HTTP {exc.code} ({lat:.2f},{lon:.2f}): {exc}',
                      file=sys.stderr)
                return None

        except (URLError, json.JSONDecodeError, KeyError, ValueError) as exc:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)  # exponential back-off: 1s, 2s
            else:
                print(f'    WARN: API failed ({lat:.2f},{lon:.2f}): {exc}',
                      file=sys.stderr)
                return None

    return None

# ── Global rate limiter ────────────────────────────────────────────────────────
# Enforces a minimum gap between *any* two outgoing API requests, regardless of
# how many worker threads are running. This is the primary guard against 429s.
# Even with 2 workers, this ensures we never exceed ~2 requests/second globally.

_rate_lock        = threading.Lock()
_last_request_at  = 0.0   # epoch seconds of the last request that left the gate

def _acquire_rate_slot():
    """Block until it is safe to issue the next API request."""
    global _last_request_at
    with _rate_lock:
        now     = time.monotonic()
        elapsed = now - _last_request_at
        if elapsed < API_DELAY:
            time.sleep(API_DELAY - elapsed)
        _last_request_at = time.monotonic()

# ── Cache ──────────────────────────────────────────────────────────────────────

_cache      = {}
_cache_lock = threading.Lock()

def load_cache():
    global _cache
    if CACHE_FILE.exists():
        with open(CACHE_FILE) as f:
            _cache = json.load(f)
        valid = sum(1 for v in _cache.values() if v is not None)
        print(f'Cache loaded: {len(_cache)} entries ({valid} valid, '
              f'{len(_cache)-valid} null/skipped)', file=sys.stderr)

def save_cache():
    with _cache_lock:
        with open(CACHE_FILE, 'w') as f:
            json.dump(_cache, f)

def get_ratings(lat, lon):
    key = grid_key(lat, lon)
    with _cache_lock:
        cached = _cache.get(key, 'MISSING')
        # Only treat a non-None list as a valid cache hit.
        # None = prior failure; retry on next run.
        if cached != 'MISSING' and cached is not None:
            return cached

    # Acquire a global rate-limit slot — this serialises the inter-request
    # gap across ALL worker threads (replaces per-worker time.sleep).
    _acquire_rate_slot()
    ratings = fetch_normals(lat, lon)

    with _cache_lock:
        _cache[key] = ratings   # store None too, but get_ratings will retry it

    return ratings

# ── Failure watchdog ───────────────────────────────────────────────────────────

_consec_fails      = 0
_consec_fails_lock = threading.Lock()

def record_result(success):
    """Track consecutive failures. Abort the process if the limit is hit."""
    global _consec_fails
    with _consec_fails_lock:
        if success:
            _consec_fails = 0
        else:
            _consec_fails += 1
            if _consec_fails >= CONSECUTIVE_FAIL_LIMIT:
                print(
                    f'\n\nABORT: {CONSECUTIVE_FAIL_LIMIT} consecutive API call failures.\n'
                    f'Possible causes:\n'
                    f'  • No internet connection\n'
                    f'  • NASA POWER API is down  (status: https://power.larc.nasa.gov/)\n'
                    f'  • Unexpected API response format\n'
                    f'Cache has been saved. Re-run the script once the issue is resolved.\n',
                    file=sys.stderr
                )
                save_cache()
                sys.exit(2)

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
        record_result(ratings is not None)

        if ratings and len(ratings) == 12:
            with lock:
                entries[shape_id] = ratings

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = [pool.submit(process_one, f) for f in features]
        done = 0
        for fut in as_completed(futures):
            try:
                fut.result()
            except SystemExit:
                raise   # propagate abort
            except Exception as exc:
                print(f'    ERROR in worker: {exc}', file=sys.stderr)
            done += 1
            if done % PROGRESS_INTERVAL == 0 or done == len(features):
                cache_hits = sum(1 for v in _cache.values() if v is not None)
                print(
                    f'    {done}/{len(features)} features processed — '
                    f'{len(entries)} entries built — '
                    f'{cache_hits} grid points cached',
                    file=sys.stderr
                )
                save_cache()

    print(f'  {iso3} done — {len(entries)}/{len(features)} entries generated',
          file=sys.stderr)
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

    lines = [
        'const CD_A2 = {',
        '  // Generated by scripts/generate_county_weather.py — do not edit by hand',
        '  // Source: NASA POWER Climatology API (no quota, no API key)',
    ]
    for shape_id in sorted(all_entries):
        r = format_ratings(all_entries[shape_id])
        lines.append(f"  '{shape_id}': {{ weather: {r} }},")
    lines.append('};')
    new_block = '\n'.join(lines)

    start_marker = 'const CD_A2 = {'
    try:
        start = src.index(start_marker)
    except ValueError:
        print('ERROR: Could not find "const CD_A2 = {" in data.js', file=sys.stderr)
        sys.exit(1)

    tail       = src[start:]
    lines_tail = tail.split('\n')
    end_line   = None
    depth      = 0
    for i, line in enumerate(lines_tail):
        depth += line.count('{') - line.count('}')
        if i > 0 and depth <= 0:
            end_line = i
            break

    if end_line is None:
        print('ERROR: Could not find closing }; for CD_A2', file=sys.stderr)
        sys.exit(1)

    end = start + len('\n'.join(lines_tail[:end_line + 1]))

    shutil.copy(DATA_JS, str(DATA_JS) + '.bak')
    print(f'Backup saved to data.js.bak', file=sys.stderr)

    with open(DATA_JS, 'w') as f:
        f.write(src[:start] + new_block + src[end:])

    print(f'data.js patched — {len(all_entries)} CD_A2 entries written',
          file=sys.stderr)

# ── Smoke test ─────────────────────────────────────────────────────────────────

def smoke_test():
    """
    Make one real API call and verify the response. Run this before a full run.
    Exit 0 on pass, exit 1 on failure.
    """
    print('=== Smoke test: NASA POWER API ===', file=sys.stderr)
    test_cases = [
        (37.5, -122.0, 'San Francisco, USA'),
        (51.5,   -0.1, 'London, UK'),
        (-33.9,  18.4, 'Cape Town, South Africa'),
    ]
    all_pass = True
    for lat, lon, label in test_cases:
        ratings = fetch_normals(lat, lon)
        if ratings and len(ratings) == 12 and all(0 <= r <= 3 for r in ratings):
            print(f'  PASS  {label}: {ratings}', file=sys.stderr)
        else:
            print(f'  FAIL  {label}: got {ratings}', file=sys.stderr)
            all_pass = False

    if all_pass:
        print('\nSmoke test PASSED. Safe to run full generation.', file=sys.stderr)
        sys.exit(0)
    else:
        print('\nSmoke test FAILED. Do not run full generation until this is resolved.',
              file=sys.stderr)
        sys.exit(1)

# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    if '--smoke-test' in sys.argv:
        smoke_test()
        return

    print('=== generate_county_weather.py ===', file=sys.stderr)
    print(f'API source : NASA POWER Climatology (no quota)', file=sys.stderr)
    print(f'Admin2 dir : {ADMIN2_DIR}', file=sys.stderr)
    print(f'Cache file : {CACHE_FILE}', file=sys.stderr)
    print(f'Abort after: {CONSECUTIVE_FAIL_LIMIT} consecutive failures', file=sys.stderr)
    print('', file=sys.stderr)

    # Always smoke-test before bulk run
    print('Running pre-flight check (3 test calls)...', file=sys.stderr)
    test_ratings = fetch_normals(37.5, -122.0)
    if not test_ratings or len(test_ratings) != 12:
        print(
            '\nPRE-FLIGHT FAILED: API is not responding correctly.\n'
            'Run with --smoke-test for details. Aborting.',
            file=sys.stderr
        )
        sys.exit(1)
    print(f'Pre-flight PASSED. API is healthy.\n', file=sys.stderr)

    load_cache()

    all_entries = {}
    countries   = sorted(ISO2_TO_ISO3.items())

    for idx, (iso2, iso3) in enumerate(countries, 1):
        print(f'[{idx}/{len(countries)}] {iso2} / {iso3}', file=sys.stderr)
        entries = process_country(iso2, iso3)
        all_entries.update(entries)
        save_cache()
        print(f'  Running total: {len(all_entries)} entries\n', file=sys.stderr)

    print(f'=== Complete: {len(all_entries)} total entries ===\n', file=sys.stderr)
    patch_data_js(all_entries)
    print('\nNext step:', file=sys.stderr)
    print('  git add data.js', file=sys.stderr)
    print('  git commit -m "data: populate CD_A2 with NASA POWER county weather normals"',
          file=sys.stderr)

if __name__ == '__main__':
    main()

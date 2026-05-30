#!/usr/bin/env python3
"""
generate_parent_map.py

Builds the CD_A2_PARENT mapping in data.js.

CD_A2_PARENT maps each geoBoundaries ADM2 shapeID to its parent
ISO 3166-2 admin-1 code (e.g. 'US-CA', 'CN-11', 'DE-BY'). The app
uses this for the three-level rating fallback at run time:

  CD_A2[shapeID] → CD_A1[CD_A2_PARENT[shapeID]] → CD[iso2]

Method
──────
For each ADM2 feature:
  1. Compute the polygon centroid (average of exterior ring vertices).
  2. Fetch the Natural Earth admin-1 GeoJSON once (cached locally).
  3. Filter Natural Earth features to the same country.
  4. Find the admin-1 polygon that contains the centroid using ray-casting
     point-in-polygon with bounding-box pre-filtering for speed.
  5. Record shapeID → iso_3166_2 code.

Pure Python — no external packages required.

Usage (from project root)
──────────────────────────
  python3 scripts/generate_parent_map.py [--dry-run]

  --dry-run   Print statistics and show a sample, but do NOT patch data.js

Performance
──────────────────────────
  ~14 000 ADM2 features across 28 countries — typically completes in
  2–5 minutes. Only one HTTP request is made (Natural Earth admin-1 GeoJSON
  from GitHub, ~4 MB). The file is cached at scripts/ne_admin1_cache.json.

Output
──────
  Patches the CD_A2_PARENT = { ... } block in data.js. A backup is saved to
  data.js.bak_parent before any write.
"""

import json
import math
import sys
import shutil
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).parent.resolve()
PROJECT_DIR = SCRIPT_DIR.parent
ADMIN2_DIR  = PROJECT_DIR / 'data' / 'admin2'
DATA_JS     = PROJECT_DIR / 'data.js'
NE_CACHE    = SCRIPT_DIR / 'ne_admin1_cache.json'

# Natural Earth 10m admin-1 provinces/states GeoJSON hosted on GitHub
NE_ADMIN1_URL = (
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/'
    'master/geojson/ne_10m_admin_1_states_provinces.geojson'
)

ISO2_TO_ISO3 = {
    'AR':'ARG','AU':'AUS','CA':'CAN','CN':'CHN','CO':'COL',
    'DE':'DEU','EG':'EGY','ES':'ESP','FR':'FRA','GB':'GBR','GR':'GRC',
    'ID':'IDN','IN':'IND','IT':'ITA','JP':'JPN','MA':'MAR','MX':'MEX',
    'NG':'NGA','NZ':'NZL','PE':'PER','PK':'PAK','PT':'PRT','RU':'RUS',
    'TH':'THA','TR':'TUR','US':'USA','VN':'VNM','ZA':'ZAF',
}

# ── Geometry helpers ───────────────────────────────────────────────────────────

def centroid_of_ring(ring):
    """Simple centroid = mean of exterior ring vertices."""
    if not ring or len(ring) < 3:
        return None
    lons = [p[0] for p in ring if len(p) >= 2]
    lats = [p[1] for p in ring if len(p) >= 2]
    if not lats:
        return None
    return sum(lons) / len(lons), sum(lats) / len(lats)


def feature_centroid(feature):
    """Return (lon, lat) centroid for a GeoJSON Feature."""
    geom  = feature.get('geometry') or {}
    gtype = geom.get('type', '')
    coords = geom.get('coordinates', [])

    if gtype == 'Polygon':
        ring = coords[0] if coords else []
        return centroid_of_ring(ring)

    if gtype == 'MultiPolygon':
        # Use the largest polygon's exterior ring
        best = max(
            (p[0] for p in coords if p and p[0]),
            key=len,
            default=None,
        )
        return centroid_of_ring(best) if best else None

    return None


def bbox(ring):
    """Return (min_lon, min_lat, max_lon, max_lat) for a coordinate ring."""
    lons = [p[0] for p in ring]
    lats = [p[1] for p in ring]
    return min(lons), min(lats), max(lons), max(lats)


def _ray_cast(px, py, ring):
    """
    Ray-casting point-in-polygon test for a single ring.
    ring: list of [lon, lat] pairs.
    Returns True if (px, py) is inside.
    """
    n      = len(ring)
    inside = False
    j      = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if ((yi > py) != (yj > py)) and (px < (xj - xi) * (py - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def point_in_feature(px, py, feature):
    """
    Test whether (px, py) is inside a GeoJSON feature.
    Handles Polygon and MultiPolygon.
    For MultiPolygon: returns True if inside ANY sub-polygon's exterior ring
    and not inside a hole of that sub-polygon.
    """
    geom   = feature.get('geometry') or {}
    gtype  = geom.get('type', '')
    coords = geom.get('coordinates', [])

    if gtype == 'Polygon':
        if not coords:
            return False
        # Exterior ring (index 0) must contain the point.
        if not _ray_cast(px, py, coords[0]):
            return False
        # Holes (index 1+): point must NOT be inside any hole.
        for hole in coords[1:]:
            if _ray_cast(px, py, hole):
                return False
        return True

    if gtype == 'MultiPolygon':
        for poly in coords:
            if not poly:
                continue
            if not _ray_cast(px, py, poly[0]):
                continue
            # Check holes
            in_hole = False
            for hole in poly[1:]:
                if _ray_cast(px, py, hole):
                    in_hole = True
                    break
            if not in_hole:
                return True

    return False


# ── Natural Earth admin-1 loader ───────────────────────────────────────────────

def _build_feature_bbox(feature):
    """Return the bounding box of a GeoJSON feature's first ring(s)."""
    geom   = feature.get('geometry') or {}
    gtype  = geom.get('type', '')
    coords = geom.get('coordinates', [])

    rings = []
    if gtype == 'Polygon' and coords:
        rings = [coords[0]]
    elif gtype == 'MultiPolygon':
        for poly in coords:
            if poly and poly[0]:
                rings.append(poly[0])

    if not rings:
        return None
    all_lons = [p[0] for ring in rings for p in ring]
    all_lats = [p[1] for ring in rings for p in ring]
    if not all_lons:
        return None
    return min(all_lons), min(all_lats), max(all_lons), max(all_lats)


def load_ne_admin1():
    """
    Load the Natural Earth admin-1 GeoJSON.
    Uses a local cache if available; otherwise fetches from GitHub.
    Returns a dict: iso2 → list of features.
    """
    if NE_CACHE.exists():
        print('  Loading Natural Earth admin-1 from cache...', file=sys.stderr)
        with open(NE_CACHE, encoding='utf-8') as f:
            raw = json.load(f)
    else:
        print(f'  Fetching Natural Earth admin-1 from GitHub (~4 MB)...', file=sys.stderr)
        req = Request(NE_ADMIN1_URL, headers={'User-Agent': 'NomadicAlmanac/1.0'})
        try:
            with urlopen(req, timeout=60) as r:
                raw = json.loads(r.read())
        except (URLError, HTTPError) as exc:
            print(f'  ERROR: Could not fetch Natural Earth data: {exc}', file=sys.stderr)
            sys.exit(1)
        print(f'  Caching to {NE_CACHE}...', file=sys.stderr)
        with open(NE_CACHE, 'w', encoding='utf-8') as f:
            json.dump(raw, f)

    # Index features by ISO-2 country code
    index = {}   # iso2 → list of (feature, bbox)
    for feat in raw.get('features', []):
        props   = feat.get('properties') or {}
        a2      = (props.get('iso_a2') or '').upper().strip()
        # Natural Earth uses "-99" for unassigned codes
        if not a2 or a2 == '-99' or a2 == '-1':
            continue
        # iso_3166_2 is the subdivision code we need (e.g. "US-CA")
        a1_code = props.get('iso_3166_2') or ''
        if not a1_code or a1_code in ('-99', '-1'):
            continue
        bb = _build_feature_bbox(feat)
        if bb is None:
            continue
        index.setdefault(a2, []).append((feat, a1_code, bb))

    total = sum(len(v) for v in index.values())
    print(f'  Natural Earth loaded: {total} admin-1 features across '
          f'{len(index)} countries.', file=sys.stderr)
    return index


# ── Per-country processor ──────────────────────────────────────────────────────

def process_country(iso2, iso3, ne_index):
    filepath = ADMIN2_DIR / f'{iso3}_ADM2_simplified.geojson'
    if not filepath.exists():
        print(f'  SKIP {iso3}: file not found', file=sys.stderr)
        return {}

    with open(filepath, encoding='utf-8') as f:
        fc = json.load(f)

    features = fc.get('features', [])
    a1_candidates = ne_index.get(iso2, [])

    result  = {}   # shapeID → admin1Code
    matched = 0
    missed  = 0

    for feat in features:
        props    = feat.get('properties') or {}
        shape_id = props.get('shapeID', '')
        if not shape_id:
            continue

        centroid = feature_centroid(feat)
        if centroid is None:
            missed += 1
            continue

        px, py = centroid   # lon, lat

        # Bounding-box pre-filter: only test admin-1 features whose bbox
        # contains the centroid. This avoids ~95% of polygon tests.
        a1_code = None
        for (a1_feat, code, bb) in a1_candidates:
            min_lon, min_lat, max_lon, max_lat = bb
            if not (min_lon <= px <= max_lon and min_lat <= py <= max_lat):
                continue
            if point_in_feature(px, py, a1_feat):
                a1_code = code
                break

        if a1_code:
            result[shape_id] = a1_code
            matched += 1
        else:
            missed += 1

    print(
        f'  {iso3}: {len(features)} features → {matched} mapped, {missed} unmatched',
        file=sys.stderr,
    )
    return result


# ── data.js patcher ────────────────────────────────────────────────────────────

def patch_data_js(parent_map):
    with open(DATA_JS, encoding='utf-8') as f:
        src = f.read()

    lines = [
        'const CD_A2_PARENT = {',
        '  // Generated by scripts/generate_parent_map.py — do not edit by hand',
    ]
    for shape_id in sorted(parent_map):
        lines.append(f"  '{shape_id}': '{parent_map[shape_id]}',")
    lines.append('};')
    new_block = '\n'.join(lines)

    start_marker = 'const CD_A2_PARENT = {'
    try:
        start = src.index(start_marker)
    except ValueError:
        print('ERROR: Could not find "const CD_A2_PARENT = {" in data.js', file=sys.stderr)
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
        print('ERROR: Could not find closing }; for CD_A2_PARENT', file=sys.stderr)
        sys.exit(1)

    end = start + len('\n'.join(lines_tail[:end_line + 1]))

    backup = str(DATA_JS) + '.bak_parent'
    shutil.copy(DATA_JS, backup)
    print(f'Backup saved to {Path(backup).name}', file=sys.stderr)

    with open(DATA_JS, 'w', encoding='utf-8') as f:
        f.write(src[:start] + new_block + src[end:])

    print(f'data.js patched — {len(parent_map)} CD_A2_PARENT entries written.',
          file=sys.stderr)


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    dry_run = '--dry-run' in sys.argv

    print('=== generate_parent_map.py ===', file=sys.stderr)
    print(f'Mode: {"DRY RUN — data.js will not be changed" if dry_run else "WRITE"}',
          file=sys.stderr)
    print('', file=sys.stderr)

    ne_index = load_ne_admin1()

    all_parent = {}
    countries  = sorted(ISO2_TO_ISO3.items())

    for idx, (iso2, iso3) in enumerate(countries, 1):
        print(f'[{idx}/{len(countries)}] {iso2} / {iso3}', file=sys.stderr)
        entries = process_country(iso2, iso3, ne_index)
        all_parent.update(entries)

    print(f'\n=== Complete: {len(all_parent)} total shapeID mappings ===\n',
          file=sys.stderr)

    if dry_run:
        # Print a sample and coverage stats
        print('Sample mappings (first 10):', file=sys.stderr)
        for k, v in list(all_parent.items())[:10]:
            print(f'  {k!r}: {v!r}', file=sys.stderr)
        print('\n(Run without --dry-run to apply to data.js)', file=sys.stderr)
    else:
        patch_data_js(all_parent)
        print('\nNext steps:', file=sys.stderr)
        print('  git add data.js', file=sys.stderr)
        print('  git commit -m "data: populate CD_A2_PARENT shapeID→admin1 mappings"',
              file=sys.stderr)


if __name__ == '__main__':
    main()

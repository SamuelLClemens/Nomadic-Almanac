#!/usr/bin/env python3
"""
simplify_geojson.py

Reduces the size of GeoJSON files in data/admin2/ using the
Ramer-Douglas-Peucker line-simplification algorithm implemented in pure
Python (no external packages required).

The default tolerance (epsilon = 0.008°, ~890 m at the equator) is
calibrated for Leaflet zoom level 6 display. Features smaller than this
become invisible at county-level zoom and the detail is wasted bytes.
Coordinate precision is reduced to 5 decimal places (~1 m precision),
removing sub-metre noise introduced by the original source files.

Usage (from project root)
──────────────────────────
  # Preview only — prints stats, writes nothing:
  python3 scripts/simplify_geojson.py --preview

  # Apply simplification to all files (OVERWRITES originals):
  python3 scripts/simplify_geojson.py

  # Use a different tolerance (larger = more aggressive):
  python3 scripts/simplify_geojson.py --epsilon 0.015

Performance expectations
─────────────────────────
  28 files totalling ~179 MB typically complete in 8–15 minutes.
  Canada (18 MB) and Russia (26 MB) take the longest.
  Expected result: ~35–50 MB total (~75% reduction).

Safety
───────
  The script writes back to the same filename (in-place). Run --preview
  first to verify the expected reduction before applying.
  Back up data/admin2/ if you want to keep the originals.
"""

import json
import math
import sys
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).parent.resolve()
PROJECT_DIR = SCRIPT_DIR.parent
ADMIN2_DIR  = PROJECT_DIR / 'data' / 'admin2'

# ── Config ─────────────────────────────────────────────────────────────────────
DEFAULT_EPSILON = 0.008   # degrees — ~890 m at equator, ~670 m at 40° latitude
COORD_PRECISION = 5       # decimal places — ~1 m at equator
MIN_RING_POINTS = 4       # minimum valid ring: 3 points + 1 closure = 4

# ── RDP simplification (iterative — no recursion limit issues) ─────────────────

def _perp_distance(px, py, ax, ay, bx, by):
    """Perpendicular distance from point (px,py) to line segment (ax,ay)→(bx,by)."""
    denom = math.hypot(bx - ax, by - ay)
    if denom == 0.0:
        return math.hypot(px - ax, py - ay)
    return abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / denom


def rdp(points, epsilon):
    """
    Ramer-Douglas-Peucker simplification.
    Uses an iterative stack-based approach to avoid Python recursion limits
    on large polygons (Canadian coastline can have 50 000+ vertices).
    Returns a list of (x, y, …) tuples/lists with at least start and end retained.
    """
    n = len(points)
    if n < 3:
        return list(points)

    keep = bytearray(n)   # 0 = discard, 1 = keep  (faster than list[bool])
    keep[0] = 1
    keep[n - 1] = 1

    stack = [(0, n - 1)]
    while stack:
        start, end = stack.pop()
        if end - start < 2:
            continue

        ax, ay = points[start][0], points[start][1]
        bx, by = points[end][0],   points[end][1]

        dmax  = 0.0
        index = start
        for i in range(start + 1, end):
            d = _perp_distance(points[i][0], points[i][1], ax, ay, bx, by)
            if d > dmax:
                dmax  = d
                index = i

        if dmax > epsilon:
            keep[index] = 1
            stack.append((start, index))
            stack.append((index, end))

    return [points[i] for i in range(n) if keep[i]]


# ── Geometry helpers ───────────────────────────────────────────────────────────

def _simplify_ring(ring, epsilon, precision):
    """
    Simplify one coordinate ring (list of [lon, lat] pairs).
    Returns the simplified ring, or None if fewer than MIN_RING_POINTS remain.
    """
    simplified = rdp(ring, epsilon)
    # Round coordinates to the requested precision.
    simplified = [[round(c, precision) for c in pt] for pt in simplified]
    # Ensure the ring is closed (first point == last point).
    if simplified and simplified[0] != simplified[-1]:
        simplified.append(simplified[0])
    if len(simplified) < MIN_RING_POINTS:
        return None
    return simplified


def simplify_geometry(geom, epsilon, precision):
    """
    Simplify a GeoJSON geometry object.
    Returns the simplified geometry, or None if the geometry collapses entirely.
    """
    gtype  = geom.get('type', '')
    coords = geom.get('coordinates', [])

    if gtype == 'Polygon':
        new_rings = []
        for ring in coords:
            r = _simplify_ring(ring, epsilon, precision)
            if r is not None:
                new_rings.append(r)
        if not new_rings:
            return None
        return {'type': 'Polygon', 'coordinates': new_rings}

    if gtype == 'MultiPolygon':
        new_polys = []
        for poly in coords:
            new_rings = []
            for ring in poly:
                r = _simplify_ring(ring, epsilon, precision)
                if r is not None:
                    new_rings.append(r)
            if new_rings:
                new_polys.append(new_rings)
        if not new_polys:
            return None
        return {'type': 'MultiPolygon', 'coordinates': new_polys}

    # Leave other geometry types (Point, LineString, etc.) untouched.
    return geom


# ── Per-file processor ─────────────────────────────────────────────────────────

def process_file(filepath, epsilon, precision, preview):
    """
    Simplify one GeoJSON file.
    Returns (bytes_before, bytes_after, features_removed).
    """
    print(f'  {filepath.name} ...', end=' ', flush=True)

    with open(filepath, encoding='utf-8') as f:
        fc = json.load(f)

    original_size = filepath.stat().st_size
    features      = fc.get('features', [])

    new_features = []
    removed      = 0

    for feat in features:
        geom = feat.get('geometry')
        if not geom:
            removed += 1
            continue
        new_geom = simplify_geometry(geom, epsilon, precision)
        if new_geom is None:
            removed += 1
            continue
        new_features.append({
            'type':       'Feature',
            'properties': feat['properties'],
            'geometry':   new_geom,
        })

    new_fc = {'type': 'FeatureCollection', 'features': new_features}

    # Compact JSON (no extra whitespace) to minimise file size.
    new_json  = json.dumps(new_fc, separators=(',', ':'), ensure_ascii=False)
    new_bytes = new_json.encode('utf-8')
    new_size  = len(new_bytes)

    if not preview:
        with open(filepath, 'wb') as f:
            f.write(new_bytes)

    pct = (1.0 - new_size / original_size) * 100 if original_size else 0
    print(
        f'{original_size / 1e6:.1f} MB → {new_size / 1e6:.1f} MB  '
        f'({pct:.0f}% reduction)  '
        f'{len(new_features)}/{len(features)} features kept'
        + (f'  [{removed} removed]' if removed else '')
    )

    return original_size, new_size, removed


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    epsilon  = DEFAULT_EPSILON
    preview  = False

    args = sys.argv[1:]
    i    = 0
    while i < len(args):
        if args[i] == '--preview':
            preview = True
            i += 1
        elif args[i] == '--epsilon' and i + 1 < len(args):
            try:
                epsilon = float(args[i + 1])
            except ValueError:
                print(f'ERROR: --epsilon must be a number, got "{args[i+1]}"')
                sys.exit(1)
            i += 2
        else:
            print(f'WARNING: Unknown argument "{args[i]}" — ignoring.')
            i += 1

    files = sorted(ADMIN2_DIR.glob('*_ADM2_simplified.geojson'))
    if not files:
        print(f'ERROR: No ADM2 GeoJSON files found in {ADMIN2_DIR}')
        sys.exit(1)

    print('=== simplify_geojson.py ===')
    print(f'Tolerance  : {epsilon}° ({epsilon * 111_000:.0f} m at equator)')
    print(f'Precision  : {COORD_PRECISION} decimal places (~{10 ** (5 - COORD_PRECISION) * 1.11:.0f} m)')
    print(f'Files      : {len(files)}')
    print(f'Mode       : {"PREVIEW — no files will be changed" if preview else "WRITE — originals will be overwritten"}')
    print()

    total_before  = 0
    total_after   = 0
    total_removed = 0

    for fp in files:
        before, after, removed = process_file(fp, epsilon, COORD_PRECISION, preview)
        total_before  += before
        total_after   += after
        total_removed += removed

    print()
    print(
        f'TOTAL: {total_before / 1e6:.1f} MB → {total_after / 1e6:.1f} MB  '
        f'({(1 - total_after / total_before) * 100:.0f}% reduction)'
    )
    if total_removed:
        print(f'  {total_removed} degenerate features removed (geometry collapsed below minimum size)')
    if preview:
        print('\nRun without --preview to apply these changes.')
    else:
        print('\nAll files simplified in-place.')
        print('Next: run python3 scripts/generate_county_weather.py')


if __name__ == '__main__':
    main()

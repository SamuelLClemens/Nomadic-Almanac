#!/usr/bin/env python3
"""
simplify_admin1.py

Shrinks data/admin1.geojson (Natural Earth 10m admin-1 states/provinces) for
runtime delivery. Two independent reductions:

  1. Property stripping — the NE file carries 121 properties per feature;
     app.js reads exactly four: iso_a2, iso_3166_2, name, admin
     (getAdmin1Iso2/getAdmin1Code at app.js ~204-224, the admin-1 tooltip,
     and _admin1NameCache). Everything else is dead transfer weight.
  2. RDP line simplification + coordinate rounding, reusing the implementation
     in scripts/simplify_geojson.py (epsilon 0.008° ≈ 890 m, 4 decimal places
     ≈ 11 m — invisible at the zoom 5-10 range where admin-1 is shown).

ALL features are kept (no country filtering): the runtime filters to CD_A1
countries itself, and pre-filtering here would silently break the next CD_A1
coverage expansion.

Usage (from project root):
  python3 scripts/simplify_admin1.py            # writes in place, backup in /tmp
  python3 scripts/simplify_admin1.py --preview  # stats only
"""

import json
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from simplify_geojson import simplify_geometry

PROJECT_DIR = Path(__file__).parent.parent.resolve()
ADMIN1_PATH = PROJECT_DIR / 'data' / 'admin1.geojson'
BACKUP_PATH = Path('/tmp/admin1.geojson.orig')

EPSILON = 0.008      # degrees (~890 m at equator) — calibrated for zoom-6 display
PRECISION = 4        # decimal places (~11 m)
KEEP_PROPS = ('iso_a2', 'iso_3166_2', 'name', 'admin')


def main():
    preview = '--preview' in sys.argv[1:]
    fc = json.load(open(ADMIN1_PATH, encoding='utf-8'))
    original_size = ADMIN1_PATH.stat().st_size

    new_features = []
    dropped = 0
    for feat in fc.get('features', []):
        geom = feat.get('geometry')
        if not geom:
            dropped += 1
            continue
        new_geom = simplify_geometry(geom, EPSILON, PRECISION)
        if new_geom is None:
            dropped += 1
            continue
        props = feat.get('properties', {})
        new_features.append({
            'type': 'Feature',
            'properties': {k: props.get(k) for k in KEEP_PROPS},
            'geometry': new_geom,
        })

    out = json.dumps({'type': 'FeatureCollection', 'features': new_features},
                     separators=(',', ':'), ensure_ascii=False).encode('utf-8')

    print(f'{ADMIN1_PATH.name}: {original_size/1e6:.1f} MB -> {len(out)/1e6:.1f} MB '
          f'({(1 - len(out)/original_size)*100:.0f}% reduction), '
          f'{len(new_features)}/{len(fc["features"])} features kept'
          + (f', {dropped} degenerate dropped' if dropped else ''))

    if preview:
        print('Preview only — nothing written.')
        return
    if not BACKUP_PATH.exists():
        shutil.copy2(ADMIN1_PATH, BACKUP_PATH)
        print(f'Original backed up to {BACKUP_PATH}')
    ADMIN1_PATH.write_bytes(out)
    print('Written in place. Remember: bump CACHE in sw.js before deploying.')


if __name__ == '__main__':
    main()

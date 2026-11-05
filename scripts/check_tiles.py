#!/usr/bin/env python3
"""Tile canary: detect a map provider that answers 200 with a placeholder image.

Why this exists: in November 2026 CARTO's free raster tiles began answering EVERY request with one
fixed "API KEY REQUIRED" PNG. It came back as HTTP 200, so the browser reported no error, Leaflet's
tileerror never fired and nothing in the app noticed; visitors just saw a watermark across the map.

How it works: fetch the same layer at several different places and zoom levels. Real tiles differ
from place to place; a placeholder is byte-for-byte identical everywhere. Identical bytes, an HTTP
error, a non-image reply, or a tiny file (a blank tile) all fail the check.

Usage:  python3 scripts/check_tiles.py          # exits 1 if any provider fails
        python3 scripts/check_tiles.py --list    # print the layers and URLs checked
Keep LAYERS in step with BASEMAP_CONFIGS in app.js. Standard library only; no keys, no secrets.
"""
import hashlib
import math
import sys
import urllib.request

ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/"
REFERER = "https://nomadicalmanac.com/"
USER_AGENT = "nomadic-almanac-tile-canary/1.0 (+https://nomadicalmanac.com/)"

# name -> (URL template, kind). {z}/{x}/{y} are filled in; {s} is a subdomain letter.
LAYERS = {
    "satellite (Esri World_Imagery)": (ESRI + "World_Imagery/MapServer/tile/{z}/{y}/{x}", "image"),
    "streets (Esri World_Street_Map)": (ESRI + "World_Street_Map/MapServer/tile/{z}/{y}/{x}", "image"),
    "dark base (Esri Dark_Gray_Base)": (ESRI + "Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", "image"),
    "labels (Esri Boundaries_and_Places)": (ESRI + "Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", "overlay"),
    "dark labels (Esri Dark_Gray_Reference)": (ESRI + "Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", "overlay"),
    "terrain (OpenTopoMap)": ("https://a.tile.opentopomap.org/{z}/{x}/{y}.png", "image"),
    "night lights (NASA GIBS)": ("https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg", "image"),
}

# (name, lat, lon, zoom): land with detail, so a real tile is never blank. Zoom stays within every
# layer's native range (night lights ends at 8, the dark canvas at 16).
PLACES = [("Paris", 48.86, 2.35, 7), ("Tokyo", 35.68, 139.69, 7), ("Nairobi", -1.29, 36.82, 7), ("Denver", 39.74, -104.99, 6)]


def tile_xy(lat, lon, z):
    n = 2 ** z
    x = int((lon + 180.0) / 360.0 * n)
    y = int((1.0 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2.0 * n)
    return x, y


def fetch(url):
    req = urllib.request.Request(url, headers={"Referer": REFERER, "User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status, r.headers.get("Content-Type", ""), r.read()
    except Exception as e:  # network error, HTTP error, timeout
        return getattr(e, "code", 0), "", b""


def check(name, template, kind):
    digests, notes = set(), []
    for place, lat, lon, z in PLACES:
        x, y = tile_xy(lat, lon, z)
        status, ctype, body = fetch(template.format(z=z, x=x, y=y, s="a"))
        if status != 200:
            return False, f"{place}: HTTP {status or 'error'}"
        if not ctype.startswith("image/"):
            return False, f"{place}: not an image ({ctype or 'no content-type'})"
        if len(body) < 300:
            return False, f"{place}: only {len(body)} bytes"
        digests.add(hashlib.md5(body).hexdigest())
        notes.append(len(body))
    if len(digests) == 1:
        return False, f"identical bytes at {len(PLACES)} different places ({notes[0]} bytes each): a placeholder, not a map"
    return True, f"{len(digests)} distinct tiles, {min(notes)}-{max(notes)} bytes"


def main():
    if "--list" in sys.argv:
        for name, (template, kind) in LAYERS.items():
            print(f"{name}: {template}")
        return 0
    failed = 0
    for name, (template, kind) in LAYERS.items():
        ok, detail = check(name, template, kind)
        failed += not ok
        print(("ok   " if ok else "FAIL ") + f"{name}: {detail}")
    print(f"\n{len(LAYERS) - failed}/{len(LAYERS)} layers healthy")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

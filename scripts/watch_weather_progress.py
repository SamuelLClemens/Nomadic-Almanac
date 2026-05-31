#!/usr/bin/env python3
"""
watch_weather_progress.py
Monitor the ongoing generate_county_weather.py run and estimate completion.
"""

import json
import math
import subprocess
import sys
import time

# ---------------------------------------------------------------------------
# Country bounding boxes: lat_min, lat_max, lon_min, lon_max
# ---------------------------------------------------------------------------
COUNTRIES = {
    "AR": ("Argentina",      -55, -22,  -73,  -53),
    "AU": ("Australia",      -44, -10,  113,  154),
    "CA": ("Canada",          42,  83, -141,  -52),
    "CN": ("China",           18,  53,   73,  135),
    "CO": ("Colombia",        -4,  13,  -82,  -67),
    "DE": ("Germany",         47,  55,    6,   15),
    "EG": ("Egypt",           22,  32,   25,   37),
    "ES": ("Spain",           36,  44,   -9,    5),
    "FR": ("France",          42,  51,   -5,    8),
    "GB": ("United Kingdom",  50,  61,   -8,    2),
    "GR": ("Greece",          35,  42,   20,   28),
    "ID": ("Indonesia",      -10,   6,   95,  141),
    "IN": ("India",            8,  37,   68,   97),
    "IT": ("Italy",           37,  47,    6,   18),
    "JP": ("Japan",           24,  45,  123,  146),
    "MA": ("Morocco",         28,  36,  -13,   -1),
    "MX": ("Mexico",          15,  32, -118,  -87),
    "NG": ("Nigeria",          4,  14,    3,   15),
    "NZ": ("New Zealand",    -47, -34,  166,  178),
    "PE": ("Peru",           -18,  -1,  -81,  -69),
    "PK": ("Pakistan",        24,  37,   61,   77),
    "PT": ("Portugal",        37,  42,   -9,   -6),
    "RU": ("Russia",          41,  82,   19,  190),
    "TH": ("Thailand",         6,  21,   98,  106),
    "TR": ("Turkey",          36,  42,   26,   44),
    "US": ("United States",   18,  71, -180,  -66),
    "VN": ("Vietnam",          8,  23,  102,  110),
    "ZA": ("South Africa",   -35, -22,   16,   33),
}

# Countries that use the lower LAND_FACTOR
LARGE_COMPLEX = {"CA", "RU", "US", "CN", "ID", "AU"}
LAND_FACTOR_LARGE = 0.55
LAND_FACTOR_OTHER = 0.75

RATE_PER_MIN = 12  # assumed API request rate


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def round_half(value: float) -> float:
    """Round to nearest 0.5."""
    return round(value * 2) / 2


def expected_cells(code: str) -> int:
    _, lat_min, lat_max, lon_min, lon_max = COUNTRIES[code]
    lat_steps = math.ceil((lat_max - lat_min) / 0.5) + 1
    lon_steps = math.ceil((lon_max - lon_min) / 0.5) + 1
    factor = LAND_FACTOR_LARGE if code in LARGE_COMPLEX else LAND_FACTOR_OTHER
    return max(1, round(lat_steps * lon_steps * factor))


def build_expected_grid(code: str) -> set:
    """Return the set of 'lat,lon' keys that fall inside a country's bounding box."""
    _, lat_min, lat_max, lon_min, lon_max = COUNTRIES[code]
    cells = set()
    lat = lat_min
    while lat <= lat_max + 1e-9:
        lon = lon_min
        while lon <= lon_max + 1e-9:
            cells.add(f"{round_half(lat)},{round_half(lon)}")
            lon = round(lon + 0.5, 6)
        lat = round(lat + 0.5, 6)
    return cells


def check_process():
    """Return (is_running: bool, pid: str or None)."""
    try:
        result = subprocess.run(
            "ps aux | grep generate_county_weather | grep -v grep",
            shell=True,
            capture_output=True,
            text=True,
        )
        lines = [l for l in result.stdout.strip().splitlines() if l]
        if lines:
            # PID is the second field in ps aux output
            pid = lines[0].split()[1]
            return True, pid
        return False, None
    except Exception:
        return False, None


def load_cache(path: str) -> dict:
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}


def analyse_cache(cache: dict):
    """Return (valid_keys: set, null_count: int)."""
    valid_keys = set()
    null_count = 0
    for key, value in cache.items():
        if isinstance(value, list):
            valid_keys.add(key)
        else:
            null_count += 1
    return valid_keys, null_count


def country_coverage(code: str, valid_keys: set):
    """Return (cached_count, expected_count, pct)."""
    exp = expected_cells(code)
    grid = build_expected_grid(code)
    cached = len(grid & valid_keys)
    pct = (cached / exp * 100) if exp else 0.0
    return cached, exp, pct


def status_label(pct: float) -> str:
    if pct >= 85.0:
        return "done"
    if pct > 0.0:
        return "in-progress"
    return "pending"


def render_table(valid_keys: set, null_count: int, is_running: bool, pid, rate_per_min=None):
    total_valid = len(valid_keys)

    print()
    print("=== Nomadic Almanac — Weather Generation Progress ===")

    if is_running:
        print(f"Process:  RUNNING  (PID {pid})")
    else:
        print("Process:  NOT RUNNING")

    print(f"Cache:    {total_valid:,} valid entries  |  {null_count} null")
    print()

    header = f"{'Code':<6}  {'Name':<22}  {'Cached':>7}  {'Expected':>8}  {'Coverage':>9}  Status"
    bar     = "─" * len(header)
    print(header)
    print(bar)

    total_expected = 0
    rows = []
    for code in sorted(COUNTRIES.keys()):
        name = COUNTRIES[code][0]
        cached_c, exp_c, pct = country_coverage(code, valid_keys)
        total_expected += exp_c
        label = status_label(pct)
        marker = " ◀" if label == "in-progress" else ""
        rows.append((code, name, cached_c, exp_c, pct, label, marker))

    for code, name, cached_c, exp_c, pct, label, marker in rows:
        print(
            f"{code:<6}  {name:<22}  {cached_c:>7,}  {exp_c:>8,}  {pct:>8.1f}%  {label}{marker}"
        )

    print()
    remaining = max(0, total_expected - total_valid)
    if rate_per_min is not None and rate_per_min > 0:
        effective_rate = rate_per_min
    else:
        effective_rate = RATE_PER_MIN

    eta_min = remaining / effective_rate
    eta_hr  = eta_min / 60.0

    print(f"Total expected unique cells : ~{total_expected:,}")
    print(f"Remaining API calls         : ~{remaining:,}")
    if rate_per_min is not None:
        print(f"Measured rate               : ~{rate_per_min:.1f} req/min")
    print(f"At {effective_rate:.0f} req/min               : ~{eta_min:.0f} min  (~{eta_hr:.1f} hours)")
    print()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    watch_mode = "--watch" in sys.argv
    cache_path = "/Users/zim/Desktop/Claude Code/scripts/weather_cache.json"

    if not watch_mode:
        is_running, pid = check_process()
        cache = load_cache(cache_path)
        valid_keys, null_count = analyse_cache(cache)
        render_table(valid_keys, null_count, is_running, pid)
        return

    # --watch loop
    print("Watch mode active. Press Ctrl-C to stop.")
    print()

    first_valid_count = None
    first_ts = None

    while True:
        is_running, pid = check_process()
        cache = load_cache(cache_path)
        valid_keys, null_count = analyse_cache(cache)
        current_count = len(valid_keys)
        now = time.time()

        rate_per_min = None
        if first_valid_count is not None:
            elapsed_min = (now - first_ts) / 60.0
            delta = current_count - first_valid_count
            if elapsed_min > 0:
                rate_per_min = delta / elapsed_min

        if first_valid_count is None:
            first_valid_count = current_count
            first_ts = now

        # Clear screen for readability
        print("\033[2J\033[H", end="")

        render_table(valid_keys, null_count, is_running, pid, rate_per_min=rate_per_min)
        print(f"[{time.strftime('%H:%M:%S')}] Refreshing in 30 seconds …  (Ctrl-C to quit)")

        if not is_running:
            print("Process has ended.")
            break

        try:
            time.sleep(30)
        except KeyboardInterrupt:
            print("\nExiting watch mode.")
            break


if __name__ == "__main__":
    main()

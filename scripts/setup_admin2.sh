#!/usr/bin/env bash
# setup_admin2.sh
# Downloads geoBoundaries ADM2 GeoJSON files for all 29 CD_A1 countries,
# runs the precompute script to build CD_A2_PARENT, and patches data.js.
#
# Usage (from the project root):
#   bash scripts/setup_admin2.sh
#
# Prerequisites: node >= 18, python3, curl

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ADMIN2_DIR="$PROJECT_DIR/data/admin2"

echo "==> Project root: $PROJECT_DIR"
echo ""

# ── Step 1: Download GeoJSON files ───────────────────────────────────────────
echo "==> Step 1/3: Downloading geoBoundaries ADM2 files..."
mkdir -p "$ADMIN2_DIR"
cd "$ADMIN2_DIR"

declare -A COUNTRIES=(
  [AR]=ARG [AU]=AUS [CA]=CAN [CN]=CHN [CO]=COL
  [DE]=DEU [EG]=EGY [ES]=ESP [FR]=FRA [GB]=GBR [GR]=GRC
  [ID]=IDN [IN]=IND [IT]=ITA [JP]=JPN [MA]=MAR [MX]=MEX
  [NG]=NGA [NZ]=NZL [PE]=PER [PK]=PAK [PT]=PRT [RU]=RUS
  [TH]=THA [TR]=TUR [US]=USA [VN]=VNM [ZA]=ZAF
)

TOTAL=${#COUNTRIES[@]}
COUNT=0

for iso2 in "${!COUNTRIES[@]}"; do
  iso3="${COUNTRIES[$iso2]}"
  COUNT=$((COUNT + 1))
  OUTFILE="${ADMIN2_DIR}/${iso3}_ADM2_simplified.geojson"

  if [ -f "$OUTFILE" ]; then
    echo "  [$COUNT/$TOTAL] $iso3 — already exists, skipping"
    continue
  fi

  echo "  [$COUNT/$TOTAL] Fetching $iso2 ($iso3)..."
  URL=$(curl -sf "https://www.geoboundaries.org/api/current/gbOpen/${iso3}/ADM2/" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('simplifiedGeometryGeoJSON',''))" 2>/dev/null || echo "")

  if [ -n "$URL" ]; then
    curl -sfL "$URL" -o "$OUTFILE"
    SIZE=$(du -sh "$OUTFILE" | cut -f1)
    echo "     Saved ${iso3}_ADM2_simplified.geojson ($SIZE)"
  else
    echo "     WARN: Could not resolve URL for $iso3 — skipping"
  fi
  sleep 1
done

echo ""
echo "==> Download complete."
echo ""

# ── Step 2: Install turf dependencies ────────────────────────────────────────
echo "==> Step 2/3: Installing turf dependencies for precompute script..."
cd "$SCRIPT_DIR"

if [ ! -d "node_modules/@turf" ]; then
  npm install --no-save @turf/boolean-point-in-polygon @turf/helpers 2>&1 | tail -5
else
  echo "  turf already installed, skipping"
fi

echo ""

# ── Step 3: Run precompute and patch data.js ─────────────────────────────────
echo "==> Step 3/3: Running precompute_admin2.js..."
cd "$PROJECT_DIR"

TMPOUT=$(mktemp /tmp/cd_a2_parent_XXXX.js)
node scripts/precompute_admin2.js > "$TMPOUT" 2>/dev/null || {
  echo "  Precompute failed — check scripts/precompute_admin2.js output manually"
  exit 1
}

# Count lines generated
LINES=$(grep -c "^  '" "$TMPOUT" || echo 0)
echo "  Generated $LINES shapeID mappings"

if [ "$LINES" -eq 0 ]; then
  echo "  No mappings generated — check that GeoJSON files downloaded correctly"
  exit 1
fi

# Patch data.js: replace the empty CD_A2_PARENT = { } body with the generated one
# Extract just the key:value lines from the output
MAPPINGS=$(grep "^  '" "$TMPOUT" | sed "s/'$/,/" | sort)

python3 - <<PYEOF
import re

with open('data.js', 'r') as f:
    src = f.read()

# Build replacement block
with open('$TMPOUT', 'r') as f:
    new_block = f.read()

# Replace the CD_A2_PARENT constant (empty or previously populated)
pattern = r'const CD_A2_PARENT = \{[^}]*\};'
replacement = new_block.strip()
# Ensure it ends with };
if not replacement.endswith('};'):
    replacement = re.sub(r'\};\s*$', '};', replacement)
    if not replacement.endswith('};'):
        replacement += '\n};'

result = re.sub(pattern, replacement, src, flags=re.DOTALL)

if result == src:
    print('WARN: CD_A2_PARENT pattern not matched — manually paste output from $TMPOUT into data.js')
else:
    with open('data.js', 'w') as f:
        f.write(result)
    print('  data.js patched successfully')
PYEOF

rm -f "$TMPOUT"

echo ""
echo "==> All done!"
echo ""
echo "Next steps:"
echo "  1. git add data/admin2/ data.js"
echo "  2. git commit -m 'data: add admin-2 boundaries and CD_A2_PARENT mappings'"
echo "  3. git push origin feature/granularity-expansion"
echo ""
echo "The county fills will be live at zoom >= 6 once pushed and deployed."

# Admin-2 GeoJSON Files

Source: **[geoBoundaries](https://www.geoboundaries.org)** — CC-BY 4.0 / ODbL  
Level: ADM2 (county / municipality / district)  
Variant: `simplified` (smaller file size, sufficient for choropleth rendering)

## Attribution

These files are derived from geoBoundaries data and are used under the
[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) license.

The map displays the attribution:
> Admin-2 boundaries: [geoBoundaries](https://www.geoboundaries.org) (CC-BY 4.0)

## File naming convention

```
{ISO3}_ADM2_simplified.geojson
```

Example: `USA_ADM2_simplified.geojson` for United States counties.

## Downloading files

For each country, fetch the simplified GeoJSON URL from the geoBoundaries API:

```bash
# Get the download URL for a country (replace ISO3 with the 3-letter code)
curl "https://www.geoboundaries.org/api/current/gbOpen/{ISO3}/ADM2/" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['simplifiedGeometryGeoJSON'])"

# Then download the file
curl -L "{URL_FROM_ABOVE}" -o "{ISO3}_ADM2_simplified.geojson"
```

### Bulk download script (bash)

```bash
cd data/admin2

declare -A COUNTRIES=(
  [AR]=ARG [AU]=AUS [CA]=CAN [CN]=CHN [CO]=COL
  [DE]=DEU [EG]=EGY [ES]=ESP [FR]=FRA [GB]=GBR [GR]=GRC
  [ID]=IDN [IN]=IND [IT]=ITA [JP]=JPN [MA]=MAR [MX]=MEX
  [NG]=NGA [NZ]=NZL [PE]=PER [PK]=PAK [PT]=PRT [RU]=RUS
  [TH]=THA [TR]=TUR [US]=USA [VN]=VNM [ZA]=ZAF
)

for iso2 in "${!COUNTRIES[@]}"; do
  iso3="${COUNTRIES[$iso2]}"
  echo "Fetching $iso2 ($iso3)..."
  url=$(curl -s "https://www.geoboundaries.org/api/current/gbOpen/${iso3}/ADM2/" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('simplifiedGeometryGeoJSON',''))" 2>/dev/null)
  if [ -n "$url" ]; then
    curl -sL "$url" -o "${iso3}_ADM2_simplified.geojson"
    echo "  Saved ${iso3}_ADM2_simplified.geojson"
  else
    echo "  WARN: Could not resolve URL for $iso3"
  fi
  sleep 1  # be polite to the API
done
```

> Note: Brazil (BRA) is excluded from Phase 1 due to file size (~39 MB). Add it
> once the codebase supports progressive/chunked GeoJSON loading.

## After downloading new files

Re-run the pre-computation script to update `CD_A2_PARENT` in `data.js`:

```bash
cd scripts
npm install @turf/boolean-point-in-polygon @turf/helpers
node precompute_admin2.js > cd_a2_parent_output.js
# Review the output, then paste the CD_A2_PARENT object body into data.js
```

## File sizes (approximate)

| Country | ISO3 | Polygons | Size |
|---|---|---|---|
| USA | USA | 3,143 | 7.6 MB |
| India | IND | ~740 | 7.6 MB |
| China | CHN | 2,391 | ~7 MB |
| Russia | RUS | 1,851 | ~5 MB |
| France | FRA | ~5,000 | 3.7 MB |
| Germany | DEU | 401 | 1.9 MB |
| Others | — | varies | 0.1–3 MB |

Files are loaded on demand (one per country) when the user zooms to level 6+.
Only countries within the current map viewport are fetched.

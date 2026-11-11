# Content-Security-Policy

The policy is the `<meta http-equiv="Content-Security-Policy">` tag in `index.html`. It is the second line of defence against script injection. The first is escaping: the app builds HTML from strings and relies on `_esc()` for OSM and user text.

`python3 scripts/test_csp_policy.py` guards it. It fails when the policy loosens, when the code and the policy drift apart, and when an inline handler or inline script comes back.

## What the policy guarantees

In any browser that enforces CSP:

- **Script runs only from this site.** `script-src` is `'self'` plus one SHA-256 hash (the loading-overlay safety valve, below). Inline event-handler attributes, `javascript:` URLs, `eval()` and scripts from other hosts are refused. An injected script element or `onerror=` attribute does not run.
- **Data can leave only for listed hosts.** `connect-src` and `img-src` name the providers the app uses and nothing else; there is no bare `https:`. An injected script can no longer send `localStorage` (`na_nationality`, `na_trip_pins`, `na_wishlist`, `na_visited`) or the optional API key in `sessionStorage` (`na_api_key`) to an arbitrary host. Hosts that anyone can publish on (ArcGIS Online, GitHub, jsDelivr) are limited to one organisation or repository path.
- **`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`** close the plugin, `<base>` and form-post routes.

## What it does not guarantee

- **Inline styles.** `style-src` keeps `'unsafe-inline'` because the generated HTML sets many inline `style` attributes. Injected CSS can restyle or hide the page. It cannot run script. This is the remaining, lower-risk gap; removing it means moving every inline style in `app.js` and `index.html` into classes.
- **Header-only features.** A `<meta>` policy cannot carry `frame-ancestors`, `report-uri`, `report-to` or `sandbox`, and GitHub Pages cannot send response headers. Another site can still frame the page, and a violation is visible only in the visitor's own console. Moving to a host that sends headers (Cloudflare Pages, Netlify) would allow both.
- **Listed hosts.** Injected code can still send a request to a host that is on the list. The list is kept small, and the multi-tenant hosts are path-limited, to keep that set small.
- **Escaping.** The policy does not replace `_esc()`.
- **Browsers without CSP, and the service worker.** The worker (`sw.js`) is a separate script context; it only fetches this site's own files.

## The directives

| Directive | Value | Why |
| --- | --- | --- |
| `default-src` | `'self'` | Everything not named below (frames, media) is same-origin only. |
| `script-src` | `'self'`, one `'sha256-...'` | All scripts are files on this site; one inline block is allowed by hash. |
| `style-src` | `'self'`, `'unsafe-inline'`, `https://fonts.googleapis.com` | The Google Fonts stylesheet; inline styles (the gap above). |
| `font-src` | `'self'`, `https://fonts.gstatic.com`, `data:` | The font files the stylesheet names. |
| `img-src` | `'self'`, `data:`, tile hosts, the counter host | Map tiles; canvas icons are `data:` URLs; the style sheet has a `data:` SVG. |
| `connect-src` | `'self'`, the API hosts below | `fetch()` and `sendBeacon()`. |
| `worker-src` | `'self'` | Only `sw.js`. The old `blob:` was unused and is gone. |
| `manifest-src` | `'self'` | `manifest.json`. |
| `object-src`, `base-uri`, `form-action` | `'none'`, `'self'`, `'self'` | As above. |

## Host inventory

Built from the source (`BASEMAP_CONFIGS`, `TRANSPORT_LAYERS`, `CRIME_SOURCES`, every `fetch(` in `app.js`, `scripts/check_tiles.py`) and then compared with the hosts a real browser contacted while every layer and screen was exercised (see "How it was checked").

### `img-src` (tiles and images)

| Source | Used for |
| --- | --- |
| `https://server.arcgisonline.com` | Esri basemaps (satellite, streets, dark) and the place-label overlays |
| `https://gibs.earthdata.nasa.gov` | Night-lights basemap; the Wildfires overlay |
| `https://*.tile.opentopomap.org` | Terrain basemap and the elevation helper (hosts `a`, `b`, `c`) |
| `https://*.tiles.openrailwaymap.org` | Rail overlay (hosts `a`, `b`, `c`) |
| `https://tile.waymarkedtrails.org` | Hiking overlay |
| `https://*.openseamap.org` | Maritime overlay (hosts `t1`, `t2`, `t3`) |
| `https://nomadicalmanac.goatcounter.com` | Image fallback of the visit-count script, used only if `sendBeacon` is refused |

### `connect-src` (requests)

| Source | Used for |
| --- | --- |
| `https://overpass-api.de` | Roads, parks, rail stops, the point layers, the Overpass lookups in the dossier |
| `https://nominatim.openstreetmap.org` | Place search in the trip planner |
| `https://api.open-meteo.com` | Live weather in the dossier |
| `https://api.anthropic.com` | The optional AI brief (a key typed in by hand into `sessionStorage`) |
| `https://nomadicalmanac.goatcounter.com` | The visit beacon (`NA_ANALYTICS_SITE`) |
| `https://data.police.uk` | Live crime, England, Wales and Northern Ireland |
| `https://phl.carto.com` | Live crime, Philadelphia |
| `https://data.cityofchicago.org`, `data.lacity.org`, `data.seattle.gov`, `data.sfgov.org`, `data.cincinnati-oh.gov`, `data.montgomerycountymd.gov`, `data.buffalony.gov`, `data.nola.gov`, `data.cityofgainesville.org`, `www.dallasopendata.com`, `data.kcmo.org` | Live crime, Socrata city portals (`CRIME_SOURCES`, one host each) |
| `https://data.boston.gov` | Live crime, Boston (CKAN) |
| `https://services1.arcgis.com/<org>/` (two), `https://services2.arcgis.com/<org>/` (two), `https://services.arcgis.com/<org>/` (two), `https://utility.arcgis.com/usrsvcs/servers/<id>/`, `https://maps.austintexas.gov/arcgis/rest/services/CrimeViewer_new/` | Live crime, ArcGIS feature services. Each is limited to the city's own path because anyone can publish on these hosts. |
| `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/`, `https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/` | Fallbacks for the admin-1 boundaries, used only if `data/admin1.geojson` fails. Limited to that one repository. |

### Wildcards

A wildcard is allowed only where the provider rotates subdomains the app cannot list. The guard test holds the same table (`WILDCARDS`) and rejects any other wildcard.

| Source | Reason |
| --- | --- |
| `https://*.tile.opentopomap.org` | Tiles come from `a.tile`, `b.tile`, `c.tile`. |
| `https://*.tiles.openrailwaymap.org` | Tiles come from `a.tiles`, `b.tiles`, `c.tiles`. |
| `https://*.openseamap.org` | Tiles come from `t1`, `t2`, `t3`. |

Links the visitor clicks (Google Flights and Maps, Rome2rio, GetYourGuide, Booking.com, the OSM and provider attribution links) are navigations, which `connect-src` and `img-src` do not govern; they need no entry. The guard test lists them as `NAVIGATION_ONLY`.

## The inline block

`index.html` holds one inline script: the loading-overlay safety valve (`window._loTimer`), which hides the "Loading World Data" overlay after 3 s whatever the scripts or network do. It stays inline on purpose. It is the fallback for a page whose scripts or network are broken, so it must run at parse time with no request of its own, exactly where it did before. A file would add a request that can fail in precisely the case the valve exists for. It is allowed by hash instead of `'unsafe-inline'`.

The other inline script (service worker registration) and the inline `onload` of the Google Fonts link moved into `na-boot.js`, loaded with `defer` and first in document order, so it runs after parsing and before `leaflet.js`, `data.js` and `app.js`.

### Changing the inline block

Any edit to the text between the `<script>` tags changes its hash, and the page then loses its safety valve silently in the browser (the console shows a violation). Do this:

1. Edit the block.
2. Run `python3 scripts/test_csp_policy.py`. The failing test prints the new value (`Inline blocks hash to: ...`).
3. Put that value in `script-src` in `index.html`, replacing the old `'sha256-...'`.
4. Run the test again, and raise `CACHE` in `sw.js` (`index.html` is precached).

A second inline block needs a reason written here first; the guard test fails until it is allowed on purpose.

## Adding a host

1. Find out what kind of request it is. `fetch()` and `sendBeacon()` are `connect-src`; `<img>`, map tiles and CSS `url()` are `img-src`; the Google Fonts stylesheet and files are `style-src` and `font-src`.
2. Add the narrowest source that works: a single host, not a wildcard. If anyone can publish on the host (a shared cloud or code host), add the path of the one organisation or repository, with a trailing `/`. A path without a trailing slash matches that exact path only.
3. Add a wildcard only if the provider rotates subdomains, and then add it to `WILDCARDS` in `scripts/test_csp_policy.py` with the reason, and to the table above.
4. Run `python3 scripts/test_csp_policy.py`. It fails if the code names a host the policy does not allow, and it fails if the policy names a host no code uses, so a stale entry has to be removed with the code that needed it.
5. Raise `CACHE` in `sw.js`, and exercise the feature in a real browser while watching the console for `Content Security Policy` messages. The `securitypolicyviolation` event shows the blocked URL and the directive.

A link the visitor clicks (an `<a href>`) needs no policy entry; add its host to `NAVIGATION_ONLY` in the test instead.

## Clickable markup without inline handlers

Generated HTML marks a clickable element with `data-na-act="<name>"` (arguments in `data-na-arg` and `data-na-name`) and a typing field with `data-na-input="<name>"`. One capture-phase listener per event type in `app.js` runs the matching entry of `NA_ACTIONS` or `NA_INPUTS`. To add one: add the entry to the table, use the attribute in the markup, escape every value with `_esc()`. Buttons keep their native keyboard behaviour because Enter and Space on a `<button>` dispatch `click`. The guard test fails on any `onclick=`-style attribute in `index.html` or in `app.js` strings, on a `javascript:` URL, and on a name used in markup but missing from the table (or the reverse).

`el.onclick = fn` (a property assignment from script) is not an inline handler and is allowed, but `addEventListener` is preferred.

## Remaining gaps

- `style-src 'unsafe-inline'` (above). Out of scope for this change.
- No `frame-ancestors`, no violation reporting (a `<meta>` policy cannot carry them).
- Path-limited entries rely on the browser applying CSP3 redirect handling, which ignores the path after a redirect. Chrome does. None of the path-limited endpoints redirected when tested (`curl`, zero redirects for the ArcGIS services and `raw.githubusercontent.com`), so the point is theoretical today; a browser that checks the path after a redirect would block an endpoint that started redirecting, and the visible result would be the existing "crime data is unavailable" toast. Safari and Firefox were not tested.
- Hosts on the list are trusted: a compromise of a listed provider is not covered.

## Provider faults seen while testing (not caused by the policy)

Found in the same run on the unchanged page, so they are not regressions; they are listed so nobody mistakes them for policy blocks.

- `t3.openseamap.org` presents a certificate the browser rejects (`ERR_CERT_AUTHORITY_INVALID`), so about a third of maritime tiles never load.
- Six of the live-crime city portals failed in the test: Seattle, Montgomery County, Buffalo and New Orleans answered HTTP 400, Cincinnati HTTP 403, and San Francisco sends no CORS header. Boston, Chicago, Los Angeles, Dallas, Kansas City, Gainesville, the UK, Philadelphia and all eight ArcGIS services answered 200.
- `overpass-api.de` rate-limits (HTTP 429, then refused connections) when many layers are switched on in a short time.
- NASA GIBS answers a Wildfires tile with no hotspot in it with HTTP 404 and an HTML body, and the browser blocks that response (`ERR_BLOCKED_BY_ORB`). The code already treats missing tiles as empty, so nothing is drawn, as intended.
- The "Similar" row in the country dossier never renders: `_findSimilarCountries` reads `ISO_A2`, but `data/countries.geojson` carries `ISO3166-1-Alpha-2`. Its click handler was migrated and tested with the function stubbed.

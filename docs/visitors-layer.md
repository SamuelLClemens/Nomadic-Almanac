# Visitors layer: owner guide

The Visitors layer shows, as pins on the world map, which countries the visits to this site came from.

Status: visit counting is switched on for the GoatCounter site `nomadicalmanac` (PR 56). Every visitor whose browser allows it is counted once the page has finished loading, whether or not that visitor ever opens the layer, unless the visitor has used "Do not count my visits" in Preferences (see "Privacy notice and opt-out"). The steps below record how this was set up and how the data file is refreshed. Two states are still honest "off" states: while `NA_ANALYTICS_SITE` in `app.js` is empty, the page makes no analytics request of any kind, and while `data/visitors.json` is missing or holds no country at the floor, the layer shows "No visit data yet". The committed `data/visitors.json` is currently the empty document, because the only country in the previous file was below the new floor.

## How it works

- A privacy-first analytics service (GoatCounter) counts visits by country. It does not keep IP addresses.
- Visits are counted by the vendor's small count script, but this site serves its own pinned copy of it (`lib/count.js`, same origin). The page never loads a script from the vendor's host, so a change at the vendor cannot reach visitors' browsers; see "The pinned count script" below.
- `scripts/update_visitors.py` reads the per-country totals from the service and writes `data/visitors.json`.
- The map layer downloads `data/visitors.json` only when a visitor switches the layer on, and draws one pin per country, at the country centre, sized by the number of visits.
- Countries with fewer than 10 visits are hidden twice: the script never writes them, and the browser drops them again even if the file contains them (`MIN_FLOOR` in `scripts/update_visitors.py` and `NA_VISITORS_FLOOR` in `app.js`; a test fails if the two numbers differ). The file may raise the minimum (`minVisits`) but never lower it below 10.
- Every published count is rounded down to a multiple of 5 (12 becomes 10, 37 becomes 35), and a country is written only when its rounded count is at least the floor. `updated` is a date only (`YYYY-MM-DD`), never a time.
- Why: GoatCounter counts visitors per daily session, so one returning person is counted again each day; the number is a visit count, not a head count, and a small number can be one person. The repository is public, so every refresh of `data/visitors.json` stays in the git history permanently, and the history is a time series. A floor of 10 keeps small groups out of the file. Rounding down means a single extra visit changes the published file in only one case out of five (when it carries the raw count across a multiple of 5), so a reader of the history cannot tell one visit from the next. The date-only `updated` removes the time of day from that history. These are the safest settings that still give a useful map; they do not make the history anonymous against someone who knows exactly when a particular visit happened and can see the commit that follows it.
- No IP address is stored, committed, logged or shown by this repository. The script keeps only a two-letter country code and a whole number per country, and discards everything else.

Data file contract:

```json
{"updated": "2026-11-06", "minVisits": 10, "countries": {"US": 120, "DE": 40}}
```

`data/visitors.json` holds only totals written by the script. The first file came with PR 57 (and published one country at 3 visits, below today's floor); the slice B change replaced it with the honest empty document `{"updated": "2026-11-10", "minVisits": 10, "countries": {}}`, built offline with the script's own `build_document` logic (no token, no request). Do not add sample or invented numbers. The browser still accepts an older file with a full timestamp in `updated` (it shows the first 10 characters).

## Legal sign-off

The owner reports that Omri Siri has signed off on this layer (owner's statement in chat, 2026-11-06), so no further legal consultation is needed before collection is enabled. This document and the change itself give no legal advice. The plain-language note in the layer legend describes how the site handles the data; it is not legal text.

Slice B (privacy: raising the floor, rounding, date-only `updated`, the visible notice and the opt-out): the owner reports that Omri Siri is fine with these changes and delegated the design ("smartest safest"; owner's statement in chat, 2026-11-10). This is recorded as the owner's statement. It is not legal advice and not a legal review of the wording of the notice, which a native reader and Omri Siri may still want to confirm.

## What the owner supplies

- **The site code** (the `name` in `https://name.goatcounter.com`). It is not a secret: once collection is on it is visible in the page source. It goes into `NA_ANALYTICS_SITE` in `app.js` (step 3) and is the only value that needs to be handed to whoever makes that edit.
- **The API key.** It is a secret. It goes only into the environment variable `GOATCOUNTER_TOKEN` on the machine that runs the script (step 4). Do not send it to anyone in chat or email, and do not put it in a file in this repository.

## Step 1: create the analytics account (owner action)

Accounts cannot be created on the owner's behalf.

1. Sign up at goatcounter.com and choose a site code. The code becomes the address `https://CODE.goatcounter.com`. Use lower-case letters, digits and hyphens only.
2. In the site settings, switch off any data collection that the map does not need. The map uses the country only.
3. Open the user menu, then API, and create a key with the "Read statistics" permission and nothing else. Copy it once; it is not shown again.

## Step 2: keep the API key out of the repository

Keep the key in a secret manager (on macOS, the Keychain: see step 4) and hand it to the script as the environment variable `GOATCOUNTER_TOKEN` for a single run. Never commit it, paste it into a file, a ticket or a chat, or type it into a command line. That includes `export GOATCOUNTER_TOKEN='...'`, because the shell saves every line you type in its history file. The script accepts the key from the environment only and never prints it, including in error messages.

The script sends the key to one address only, `https://nomadicalmanac.goatcounter.com`. It refuses any other site code (from `app.js`, `GOATCOUNTER_SITE` or `--site`) unless `--allow-other-site` is given, and it never follows an HTTP redirect, because the key would travel with it. A redirect is reported as an error.

## Step 3: switch counting on

1. On a branch, edit `app.js` and set the single constant near the top of the file:

   ```js
   const NA_ANALYTICS_SITE = 'your-site-code';
   ```

2. Increase `CACHE` in `sw.js` by one (for example `nomadic-v55` to `nomadic-v56`), because `app.js` is a precached file.
3. Open a pull request and merge it as usual.

What the constant does:

- While it is empty, the page requests nothing from any analytics host.
- When it is set, one small script (`./lib/count.js`, the pinned copy served from this site) is added after the page has finished booting. It is skipped when the browser sends Do Not Track or Global Privacy Control, when the visitor has chosen "Do not count my visits" (the `skipgc` key is `'t'`), and when browser storage is blocked (the script would raise an error there). Nothing is requested from `gc.zgo.at`.
- The Content-Security-Policy in `index.html` names no script host other than this site (`'self'`) and allows no `'unsafe-inline'` script. The count itself is sent to `https://CODE.goatcounter.com/count`; the policy names exactly `https://<NA_ANALYTICS_SITE>.goatcounter.com` in `connect-src` (for the beacon) and `img-src` (for the vendor script's image fallback), and `scripts/test_csp_policy.py` fails if that entry and `NA_ANALYTICS_SITE` ever disagree. Changing the site code therefore means changing the policy too; see `docs/csp.md`.
- The page address fragment (the part after `#`, which holds month, nationality and trip pins) is never sent to the service.

## Step 4: generate the data file

On macOS, keep the key in the Keychain. Store it once. The command asks for the key without echoing it, so it never appears on a command line or in the shell history:

```bash
security add-generic-password -s goatcounter-nomadicalmanac -a "$USER" -w
```

Then read it into the environment for a single run, first as a dry run and then for real:

```bash
GOATCOUNTER_TOKEN="$(security find-generic-password -s goatcounter-nomadicalmanac -a "$USER" -w)" python3 scripts/update_visitors.py --dry-run
```

```bash
GOATCOUNTER_TOKEN="$(security find-generic-password -s goatcounter-nomadicalmanac -a "$USER" -w)" python3 scripts/update_visitors.py
```

The first command prints the result and writes nothing. The second writes `data/visitors.json`. Then commit that file on a branch and open a pull request. Do not commit to `main`.

On another system, read the key from your secret manager in the same way, as `GOATCOUNTER_TOKEN="$(your-secret-manager-command)" python3 scripts/update_visitors.py`. Do not type the key itself into a command.

Useful options:

- `--site CODE` overrides the code read from `app.js` (or from `GOATCOUNTER_SITE`). Only `nomadicalmanac`, the value of `EXPECTED_SITE` in `scripts/update_visitors.py`, is accepted; any other code is refused before a request is made.
- `--allow-other-site` lifts that refusal, for a run against another GoatCounter account of your own. Never use it with a code you were given by someone else.
- `--min-visits N` raises the minimum above 10. Values below 10 are refused. The minimum is tested on the published, rounded-down count, so a raw count that rounds to less than N is dropped (with `--min-visits 12`, a raw 14 publishes as 10 and is dropped; a raw 17 publishes as 15 and is kept).
- `--since YYYY-MM-DD` limits the count to visits on or after a date. The default is all time.
- `--allow-empty` lets an empty result replace a file that has countries. Without it, the script keeps the existing file, which protects against a temporary service fault.

On any error the existing file is left untouched and the script exits with a non-zero status.

## Step 5: refresh regularly

Choose one:

- Run the script by hand when an update is wanted.
- Schedule it on the owner's own computer with `cron` or `launchd`, supplying `GOATCOUNTER_TOKEN` from the owner's keychain or environment, then commit and open a pull request.
- A scheduled GitHub Actions workflow is possible but is deliberately not included here. If one is added later, it must store the key as an encrypted repository secret and open a pull request. It must not push to `main`.

## Privacy notice and opt-out

Every visitor is counted, not only those who open the Visitors layer, so the notice does not live in the layer legend (the legend keeps its own shorter note).

- Where: Settings (the gear in the bottom menu, on phone and on desktop), last row, "Privacy". It is the least intrusive place that already exists for choices of this kind; it adds one row to a sheet that every visitor can reach without opening any layer. The first-visit welcome card also carries a "Privacy" link on its own line, which opens Settings at that row.
- What it says (11 languages, keys `prefs.privacy`, `prefs.privacyNote`, `prefs.optout`, `prefs.optoutSignal`): visits are counted by country with GoatCounter; no IP address is stored or shown; the counting script is hosted on this site; Do Not Track and Global Privacy Control are honoured; countries with fewer than 10 visits are never shown and counts are rounded down to a multiple of 5. English is the reference text; the other ten are first drafts that a native reader should confirm. The plain-language "Is my data private?" answer in the FAQ was changed to match (it used to say nothing is sent to a server).
- The control: "Do not count my visits", an Off/On switch in the same row. On stores `localStorage.skipgc = 't'`, the vendor script's own opt-out key; Off removes it. `_naAnalyticsInit` reads the key and returns before it creates the script element, so an opted-out visitor never downloads `lib/count.js` and sends nothing. The change applies from the next page load. The vendor's `#toggle-goatcounter` fragment flips the same key, so the two stay in step.
- When the browser already sends Do Not Track or Global Privacy Control, a line under the switch says the visits are not counted anyway, so an Off switch is not read as "you are being counted".
- This is an opt-out, not an opt-in: a first-time visitor is counted on first load, before they can read the notice. Moving to opt-in would be a larger decision for the owner.

## Region level (off)

Region level means visits by state or province, drawn as pins on the map. It is built and **shipped switched off**: nothing about it changes what visitors see, what their browsers request or what is published in `data/visitors.json` until the owner turns it on. Region is more granular than country, so each count points at a smaller group of people; that is why it is gated.

What exists:

- **The switch.** `NA_VISITORS_REGIONS` in `app.js`, next to `NA_VISITORS_FLOOR`, is `false`. While it is false the page reads no region data, draws no region pin, shows no region legend row or text, and makes no request beyond today's. `python3 scripts/test_visitor_regions_off.py` proves this by running the real parsing code from `app.js` under JavaScriptCore with the switch false (a data file full of regions gives exactly the country-only result, no region state and no request), and it fails if a region function loses its guard. The test needs `jsc`, which ships with macOS; elsewhere that part is skipped with a message.
- **The data contract.** An optional `regions` object in `data/visitors.json`, with ISO 3166-2 codes as keys and whole counts as values, plus `minRegionVisits`:

  ```json
  {"updated": "2026-11-06", "minVisits": 10, "countries": {"US": 120}, "minRegionVisits": 25, "regions": {"US-CA": 40}}
  ```

  The committed file has neither key and stays the honest empty document; never put sample numbers in it.
- **The region floor is 25** (`NA_VISITORS_REGION_FLOOR` in `app.js`, `MIN_REGION_FLOOR` in `scripts/update_visitors.py`; a test fails if the two differ). Reason: a region is a smaller group than a country, so the same count points at fewer people, and the count is a visit count (a returning person is counted again each day). 25 is two and a half times the country floor of 10 and, like every published count, a multiple of 5. It is a proposal: the owner, with Omri Siri, can raise it. The file may raise it with `minRegionVisits`, never lower it. The browser applies it independently of the file, and never below the effective country floor (if the file raises `minVisits` to 50, regions need 50 too).
- **No region without its country.** A region is drawn only when its country is itself one of the published country rows, so no region can appear for a country below the country floor. The updater does not even request the regions of such a country.
- **The pins.** A region pin is a rounded teal square, a country pin is an amber circle; the legend names the difference, and the tooltip carries the words "State or province". Each sits at the centre of its admin-1 polygon (the same bounds-centre logic as the country pins) and is sized by its count on the same scale. The polygons come from `data/admin1.geojson` through the existing lazy load; no new host. A region code with no polygon in that file is not drawn.
- **The updater.** `python3 scripts/update_visitors.py --regions` collects regions; without the flag the script behaves exactly as before and never writes a `regions` key (running it without the flag over a file that has regions drops them). With the flag it applies the country rules, stricter: only published countries are asked, counts are rounded down to a multiple of 5, the region floor is at least 25 (`--min-region-visits N` raises it, never below `--min-visits`), only a code that exists in `data/admin1.geojson` for that country and a whole number are kept. An empty region result does not replace a file that has regions unless `--allow-empty` is given.

What could not be verified: how the live service answers a region request. The vendor's published API description and source show that regions come from a separate request per country, `GET /api/v0/stats/locations/CC` (the country code taken from the country query), and that each row of that answer carries a display name and a count but no code. The updater therefore matches the name to a code through `data/admin1.geojson`, drops a name that matches no code or more than one, and prints how many rows it could not match. Region collection is off in the owner's GoatCounter account, so no live region request was made, and the tests use synthetic data and a fake HTTP layer only. Expect partial coverage even when it works: where the admin-1 level in `data/admin1.geojson` differs from the vendor's, names will not match. In a spot check against the real file on 2026-11-11, the display names California, Ontario, Québec, Bayern, New South Wales, São Paulo, Maharashtra and Tel Aviv each resolved to one code, while Île-de-France, England, Catalonia and Bangkok matched nothing. Check the first `--dry-run` output (it prints the number of unmatched rows) before trusting it.

### Turning region on (owner steps, in order)

1. **Get Omri Siri's written confirmation** that region reporting may be switched on, and keep it with the other sign-offs. The owner reports that Omri Siri is fine with changes (an owner statement, not a record of his words); this document gives no legal advice and does not replace his confirmation.
2. **Switch Region on in GoatCounter.** Site settings, data collection: tick Region as well as Country. It applies to new visits only; nothing is backfilled.
3. **On a branch, flip the constant and bump the cache.** Set `const NA_VISITORS_REGIONS = true;` in `app.js`, increase `CACHE` in `sw.js` by one, and update the privacy notice (next paragraph) in the same change.
4. **Run the updater with the flag**, review the diff, and open a pull request:

   ```bash
   GOATCOUNTER_TOKEN="$(security find-generic-password -s goatcounter-nomadicalmanac -a "$USER" -w)" python3 scripts/update_visitors.py --regions --dry-run
   ```

   Read the dry run: published regions, the count of unmatched rows, and that no region belongs to an unpublished country. Then run it again without `--dry-run`, commit `data/visitors.json` on a branch and open a pull request. Do not commit to `main`.

The privacy notice must be updated when region goes on. It currently says visits are counted by country and nothing about regions, which would then be incomplete. The text lives in four places in this repository: `prefs.privacyNote` (11 languages) in `app.js`, with its English fallback in `index.html` (`#pref-privacy-note`, in Settings, row "Privacy"); the legend note `visitors.privacy` (11 languages) in `app.js`; and the FAQ answer "Is my data private?" in `app.js`. Each should say that visits are also counted by state or province, name the region floor, and keep the rounding sentence. Leave the English text as the reference and have the other ten read by a native speaker; Omri Siri may want to read the final wording.

## The pinned count script

`lib/count.js` is an unmodified copy of the vendor's count script. The first two lines are the vendor's header (it names GoatCounter and states the ISC licence); keep them. Do not edit the file by hand.

Pin record (the guard test reads the SHA-256 line below):

- Source URL: `https://gc.zgo.at/count.js`
- Fetched: 2026-11-10, 20:18 UTC
- Size: 9213 bytes
- SHA-256: `792b7abd26c1fb6ae62906833e09a301251e2641816e69e4f95aba518f3fe3f0`

What this version does (read in full on 2026-11-10; it contains no `eval`, no `Function` constructor and no script insertion):

- On load it sends one request to the address in the `data-goatcounter` attribute of its own script tag: the page path (taken from the canonical link, plus the query string), the referrer, the page title, the screen width, a bot code and a random cache-busting value. It never sends the address fragment (the part after `#`).
- It sends with `navigator.sendBeacon`, and falls back to a 1 by 1 pixel image request if the beacon is refused.
- It reads and writes one localStorage key, `skipgc`, which is the vendor's opt-out switch.
- It sets up click-event counting for elements marked `data-goatcounter-click`; no element in this page carries that attribute.
- Its own filter refuses to count from `localhost` and private network addresses, so a local test server never sends a count.

Why it is not precached: `lib/leaflet.js` is in `CORE` in `sw.js` because the page cannot start without it. The count script loads after boot, is optional (skipped for Do Not Track, Global Privacy Control and blocked storage), and its request needs the network anyway, so adding it to `CORE` would make every first visit download 9 KB that many visitors never use. The service worker still stores it after the first successful fetch, like every other file of this site.

How to update it on purpose (for example when the vendor announces a change, or once a year):

1. Fetch the current file to a scratch folder outside the repository and compare it with the pinned copy:

   ```bash
   d="$(mktemp -d)" && curl -sS --fail --max-time 30 -o "$d/count.js" https://gc.zgo.at/count.js && shasum -a 256 "$d/count.js" && diff "$d/count.js" lib/count.js; echo "$d"
   ```

   If `diff` prints nothing, the pinned copy is current and nothing else is needed.
2. Read the whole new file, not only the diff. Look for any new network destination (`sendBeacon`, `fetch`, `XMLHttpRequest`, image or script creation, `document.write`), any new storage key, any `eval` or `Function` use, and any new field in the data it sends. Refuse the update if anything is unexplained.
3. On a branch, copy the file over `lib/count.js`, then update the fetch date, size and SHA-256 in the pin record above (`shasum -a 256 lib/count.js`), and update the description of what the script does if it changed.
4. Increase `CACHE` in `sw.js` by one, so returning visitors drop the old copy.
5. Run `python3 scripts/test_count_js_pin.py`, load the page once with the analytics hosts unreachable, and open a pull request. Do not commit to `main`.

## Checks

- Pin guard: `python3 scripts/test_count_js_pin.py`. It fails when the SHA-256 of `lib/count.js` differs from the pin record above, when the vendor header is missing, when `NA_ANALYTICS_SRC` in `app.js` is not a same-origin path to an existing file, or when `index.html` names any host in `script-src`. It reads local files only and makes no request.
- Region level: `python3 scripts/test_update_visitors_regions.py` (the updater with `--regions`, synthetic data and a fake HTTP layer) and `python3 scripts/test_visitor_regions_off.py` (the shipped-off proof described in "Region level (off)").
- Unit tests for the script: `python3 scripts/test_update_visitors.py`. They use a fake HTTP layer and synthetic data held inside the test file. They cover the floor, the rounding (including that a single extra visit changes the file only at a multiple of 5), the date-only `updated`, that `MIN_FLOOR` equals `NA_VISITORS_FLOOR` in `app.js`, and that the committed `data/visitors.json` obeys the contract. One test starts two throw-away servers on `127.0.0.1` to prove that a redirect is not followed and that the key never reaches the redirect target; nothing leaves the machine.
- The script was run against the live account on 2026-11-10 (before the floor was raised from 3 to 10). The per-country query, the dry-run and the written file agreed: one country at the old floor of 3 visits (the owner's own visits plus one automated test visit). The request shape follows the vendor's published API description (`GET /api/v0/stats/locations`, bearer token, `limit` and `offset` paging, `count` meaning visitors).
- Pins are placed with the application's existing country-centre logic (`COUNTRY_CENTERS`, then the centre of the country polygon bounds). A country that straddles the date line is centred on its largest part.

## Known limits

- The count is GoatCounter's visitor count, not page views and not people. A person who returns on another day is counted again, so a country showing 10 may be fewer than 10 people.
- The public git history of `data/visitors.json` is a time series. Rounding and the floor hide single visits, but a change that appears between two commits still bounds when visits happened to the gap between those refreshes.
- Region level is off (see "Region level (off)"). When it is turned on, the difference between a published country count and the sum of its published region counts reveals only how many visits came from regions below the floor, rounded; it is still a smaller group per number than the country level, which is why the floor is higher.
- The opt-out is per browser (it lives in that browser's localStorage). Clearing site data, or using another browser or device, counts again until it is set again.
- The count script is a pinned copy, so it receives no vendor changes or fixes until someone updates it on purpose (see "The pinned count script"). The count keeps working as long as the vendor keeps accepting requests at `https://CODE.goatcounter.com/count`.
- Pinning the count script closes the route by which the vendor could change that script. What a script that is already running on the page could send out, and where, is limited by the Content-Security-Policy (`docs/csp.md`): connections and images may reach only the listed hosts, not any HTTPS host. The policy cannot report a violation anywhere and still allows inline styles.
- Loading the page with the fragment `#toggle-goatcounter` makes the pinned script switch counting off or on in that browser (it stores or removes the `skipgc` key in localStorage) and show a browser alert. This is the vendor's own switch for skipping one's own visits.
- Visitors who block the vendor host, send Do Not Track, or block browser storage are not counted, so the map understates real use.
- A visit takes about 30 to 40 seconds to show up in the API. Automated browsers that announce themselves as `HeadlessChrome` were not counted in testing, so check the counting with an ordinary browser.
- In the updater's `--dry-run` summary, "below the minimum" counts countries, not visits. For raw visit counts, query `/api/v0/stats/locations`.
- GitHub Pages names a deployment after its commit. If a deploy times out (it did on 2026-11-09, in the "syncing files" stage), a re-run or a new build request for the same commit is refused with "Deployment cancelled". Merge a new commit to deploy again.

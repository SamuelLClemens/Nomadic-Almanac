# Visitors layer: owner guide

The Visitors layer shows, as pins on the world map, which countries the visits to this site came from.

Status: visit counting is switched on for the GoatCounter site `nomadicalmanac` (PR 56). Every visitor whose browser allows it is counted once the page has finished loading, whether or not that visitor ever opens the layer. The steps below record how this was set up and how the data file is refreshed. Two states are still honest "off" states: while `NA_ANALYTICS_SITE` in `app.js` is empty, the page makes no analytics request of any kind, and while `data/visitors.json` is missing or holds no country at the floor, the layer shows "No visit data yet".

## How it works

- A privacy-first analytics service (GoatCounter) counts visits by country. It does not keep IP addresses.
- `scripts/update_visitors.py` reads the per-country totals from the service and writes `data/visitors.json`.
- The map layer downloads `data/visitors.json` only when a visitor switches the layer on, and draws one pin per country, at the country centre, sized by the number of visits.
- Countries with fewer than 3 visits are hidden twice: the script never writes them, and the browser drops them again even if the file contains them. The file may raise the minimum (`minVisits`) but never lower it below 3.
- No IP address is stored, committed, logged or shown by this repository. The script keeps only a two-letter country code and a whole number per country, and discards everything else.

Data file contract:

```json
{"updated": "2026-11-06T09:30:00Z", "minVisits": 3, "countries": {"US": 120, "DE": 44}}
```

`data/visitors.json` holds the real totals written by the script (the first file came with PR 57). Do not add sample or invented numbers.

## Legal sign-off

The owner reports that Omri Siri has signed off on this layer (owner's statement in chat, 2026-11-06), so no further legal consultation is needed before collection is enabled. This document and the change itself give no legal advice. The plain-language note in the layer legend describes how the site handles the data; it is not legal text.

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
- When it is set, one small script (`https://gc.zgo.at/count.js`) is added after the page has finished booting. It is skipped when the browser sends Do Not Track or Global Privacy Control, and when browser storage is blocked (the vendor script would raise an error there).
- The Content-Security-Policy in `index.html` allows scripts from `gc.zgo.at` and from no other additional host. The count itself is sent to `https://CODE.goatcounter.com/count`, which the existing `connect-src https:` rule already permits.
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
- `--min-visits N` raises the minimum above 3. Values below 3 are refused.
- `--since YYYY-MM-DD` limits the count to visits on or after a date. The default is all time.
- `--allow-empty` lets an empty result replace a file that has countries. Without it, the script keeps the existing file, which protects against a temporary service fault.

On any error the existing file is left untouched and the script exits with a non-zero status.

## Step 5: refresh regularly

Choose one:

- Run the script by hand when an update is wanted.
- Schedule it on the owner's own computer with `cron` or `launchd`, supplying `GOATCOUNTER_TOKEN` from the owner's keychain or environment, then commit and open a pull request.
- A scheduled GitHub Actions workflow is possible but is deliberately not included here. If one is added later, it must store the key as an encrypted repository secret and open a pull request. It must not push to `main`.

## Checks

- Unit tests for the script: `python3 scripts/test_update_visitors.py`. They use a fake HTTP layer and synthetic data held inside the test file. One test starts two throw-away servers on `127.0.0.1` to prove that a redirect is not followed and that the key never reaches the redirect target; nothing leaves the machine.
- The script has been run against the live account (2026-11-10). The per-country query, the dry-run and the written file agreed: one country at the floor of 3 visits (the owner's own visits plus one automated test visit). The request shape follows the vendor's published API description (`GET /api/v0/stats/locations`, bearer token, `limit` and `offset` paging, `count` meaning visitors).
- Pins are placed with the application's existing country-centre logic (`COUNTRY_CENTERS`, then the centre of the country polygon bounds). A country that straddles the date line is centred on its largest part.

## Known limits

- The count is GoatCounter's visitor count, not page views. A person who returns on another day is counted again.
- The vendor script is loaded without a pinned integrity hash, because the vendor replaces the file in place. Self-hosting a copy of the script is the alternative if a stricter policy is required.
- Visitors who block the vendor host, send Do Not Track, or block browser storage are not counted, so the map understates real use.
- A visit takes about 30 to 40 seconds to show up in the API. Automated browsers that announce themselves as `HeadlessChrome` were not counted in testing, so check the counting with an ordinary browser.
- In the updater's `--dry-run` summary, "below the minimum" counts countries, not visits. For raw visit counts, query `/api/v0/stats/locations`.
- GitHub Pages names a deployment after its commit. If a deploy times out (it did on 2026-11-09, in the "syncing files" stage), a re-run or a new build request for the same commit is refused with "Deployment cancelled". Merge a new commit to deploy again.

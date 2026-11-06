# Visitors layer: owner guide

The Visitors layer shows, as pins on the world map, which countries the visits to this site came from. It is off until the owner completes the steps below. Until then the layer shows the message "No visit data yet", and the page makes no analytics request of any kind.

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

The repository does not contain a `data/visitors.json`. Do not add sample numbers.

## Step 0: obtain advice before enabling collection

Whether a notice or a consent is needed for international visitors is a legal question. This change does not answer it. Consult Omer Hanegbi or Omri Siri before setting the site code in step 3. The plain-language note in the layer legend describes how the site handles the data; its final wording is also for them to confirm.

## Step 1: create the analytics account (owner action)

Accounts cannot be created on the owner's behalf.

1. Sign up at goatcounter.com and choose a site code. The code becomes the address `https://CODE.goatcounter.com`. Use lower-case letters, digits and hyphens only.
2. In the site settings, switch off any data collection that the map does not need. The map uses the country only.
3. Open the user menu, then API, and create a key with the "Read statistics" permission and nothing else. Copy it once; it is not shown again.

## Step 2: keep the API key out of the repository

Store the key as the environment variable `GOATCOUNTER_TOKEN` in the shell or in a secret manager. Never commit it, paste it into a file, a ticket or a chat, or pass it on the command line. The script accepts it from the environment only and never prints it, including in error messages.

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

```bash
export GOATCOUNTER_TOKEN='paste-the-key-here'
python3 scripts/update_visitors.py --dry-run
python3 scripts/update_visitors.py
```

The first command prints the result and writes nothing. The second writes `data/visitors.json`. Then commit that file on a branch and open a pull request. Do not commit to `main`.

Useful options:

- `--site CODE` overrides the code read from `app.js` (or from `GOATCOUNTER_SITE`).
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

- Unit tests for the script: `python3 scripts/test_update_visitors.py`. They use a fake HTTP layer and synthetic data held inside the test file.
- The script has not been run against a live GoatCounter account, because none exists yet. The request shape follows the vendor's published API description (`GET /api/v0/stats/locations`, bearer token, `limit` and `offset` paging, `count` meaning visitors). Run `--dry-run` once after the account exists and compare the output with the GoatCounter dashboard.
- Pins are placed with the application's existing country-centre logic (`COUNTRY_CENTERS`, then the centre of the country polygon bounds). A country that straddles the date line is centred on its largest part.

## Known limits

- The count is GoatCounter's visitor count, not page views. A person who returns on another day is counted again.
- The vendor script is loaded without a pinned integrity hash, because the vendor replaces the file in place. Self-hosting a copy of the script is the alternative if a stricter policy is required.
- Visitors who block the vendor host, send Do Not Track, or block browser storage are not counted, so the map understates real use.

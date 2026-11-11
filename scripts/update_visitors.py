#!/usr/bin/env python3
"""Refresh data/visitors.json from the country totals of a GoatCounter site.

GoatCounter counts visits by country and does not keep IP addresses. This script asks its read-only
statistics API for the per-country visitor totals, drops every country below the minimum, and writes
the small file the Visitors map layer reads. Nothing else is fetched and nothing else is written.

    export GOATCOUNTER_TOKEN='...'          # an API key with the "Read statistics" permission
    python3 scripts/update_visitors.py      # site code is read from NA_ANALYTICS_SITE in app.js

Privacy and safety rules this script keeps:
  * The token is read ONLY from the environment variable GOATCOUNTER_TOKEN. It is never accepted on
    the command line, never written to a file and never printed, including in error messages.
  * The only data kept is a two-letter country code and a whole number per country. A value that is
    not exactly that is dropped, so an IP address can never reach the output file.
  * Every published count is rounded DOWN to a multiple of ROUND_STEP (5), and a country is written
    only when its rounded count is at least the floor (MIN_FLOOR, 10). --min-visits can raise the
    floor but not lower it. The browser applies the same floor again. Why both: the count is a visit
    count (one person on several days is counted several times), and this repository is public, so
    every refresh of data/visitors.json stays in its history for good. Rounding means one extra
    visit usually changes nothing in the file, and the floor keeps small groups out of it.
  * "updated" is a date (YYYY-MM-DD) with no time, so the history does not show when a visit
    happened to a finer grain than the refresh day.
  * On any failure the existing data/visitors.json is left untouched (the write is atomic), and a
    result with no countries does not replace a file that has some unless --allow-empty is given.
  * An HTTP 404 from the service is retried twice (after 5 s and after 15 s) before it is reported,
    because the service has answered 404 once to the first request of a run and then answered normally.
    A rate limit (429) is retried once. No other status is retried.
  * The token is sent only to https://EXPECTED_SITE.goatcounter.com. A different site code (from
    app.js, GOATCOUNTER_SITE or --site) is refused unless --allow-other-site is given, so a changed
    NA_ANALYTICS_SITE cannot send the key to someone else's account. An HTTP redirect is never
    followed, because urllib would resend the Authorization header to the new address.

Region level (visits by state or province) is OFF unless --regions is given. Without the flag this
script behaves exactly as described above and never writes a "regions" key (a file that already has one
loses it on the next run without the flag). With --regions, after the country query it asks for each
PUBLISHED country's regions (GET /api/v0/stats/locations/CC, the vendor's detail view for one country)
and keeps the same rules, only stricter:
  * a region is written only when its country is itself published (at or above the country floor);
    the regions of any other country are not even requested;
  * the region floor is MIN_REGION_FLOOR (25), never lower, never below the country floor;
    --min-region-visits can raise it. The browser applies the same floor again (NA_VISITORS_REGION_FLOOR);
  * keys are ISO 3166-2 codes that exist in data/admin1.geojson for that country, counts are rounded
    DOWN to a multiple of ROUND_STEP before the floor is tested, and only the code and a whole number
    are kept. The vendor's detail view names a region by display name, not by code (as read from its
    published source); the name is matched to a code through data/admin1.geojson and a name that matches
    no code, or more than one, is dropped. Turning region on also needs the steps in
    docs/visitors-layer.md, section "Region level (off)". The live response could NOT be checked,
    because Region collection is off in the GoatCounter account; the tests use synthetic data only.

Python 3.8 or newer, standard library only. Run from anywhere; paths are relative to the repository.
"""
import argparse
import datetime
import json
import os
import re
import sys
import tempfile
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

MIN_FLOOR = 10                                  # the lowest floor that may ever be written
ROUND_STEP = 5                                  # published counts are rounded DOWN to a multiple of this
TOKEN_ENV = "GOATCOUNTER_TOKEN"
SITE_ENV = "GOATCOUNTER_SITE"
SITE_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,62}$")
# The one account this repository's key belongs to. The key is sent to this site only. Changing it is
# a reviewed edit of this file, not something a changed app.js or environment variable can do.
EXPECTED_SITE = "nomadicalmanac"
CODE_RE = re.compile(r"^[A-Z]{2}$")
MIN_REGION_FLOOR = 25                           # region floor: higher than MIN_FLOOR, same as app.js
REGION_CODE_RE = re.compile(r"^[A-Z]{2}-[A-Z0-9]{1,3}$")   # an ISO 3166-2 code such as US-CA
PAGE_LIMIT = 100                                # the API maximum
MAX_PAGES = 10                                  # 1,000 countries is far more than exist
PAUSE_SECONDS = 0.3                             # the API allows 4 requests per second
NOT_FOUND_WAITS = (5, 15)                       # seconds to wait before each retry of an HTTP 404 (see _get_with_retry)

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_OUT = os.path.join(REPO, "data", "visitors.json")
APP_JS = os.path.join(REPO, "app.js")
ADMIN1 = os.path.join(REPO, "data", "admin1.geojson")      # region names and codes, read only with --regions


class UpdateError(Exception):
    """A failure with a message that is safe to print (it never contains the token)."""


def site_from_app_js(path=APP_JS):
    """The analytics site code configured in app.js (NA_ANALYTICS_SITE), or '' when none is set."""
    try:
        with open(path, encoding="utf-8") as fh:
            m = re.search(r"const\s+NA_ANALYTICS_SITE\s*=\s*'([^']*)'", fh.read())
    except OSError:
        return ""
    return m.group(1).strip().lower() if m else ""


def clean_token(raw):
    token = (raw or "").strip()
    if not token:
        raise UpdateError("Set the environment variable %s to a GoatCounter API key." % TOKEN_ENV)
    # Reject anything that could not be a plain header value (no spaces, controls or non-ASCII).
    if not re.fullmatch(r"[\x21-\x7e]+", token):
        raise UpdateError("%s does not look like an API key (unexpected characters)." % TOKEN_ENV)
    return token


def clean_site(raw):
    site = (raw or "").strip().lower()
    if not SITE_RE.match(site):
        raise UpdateError("No valid site code. Pass --site, set %s, or set NA_ANALYTICS_SITE in app.js "
                          "(letters, digits and hyphens only)." % SITE_ENV)
    return site


def parse_locations(payload):
    """Pure. From one API page, return ({CODE: count}, more). Anything not a 2-letter code with a whole,
    non-negative count is dropped (this is also what keeps IP addresses and free text out)."""
    if not isinstance(payload, dict) or not isinstance(payload.get("stats"), list):
        raise UpdateError("Unexpected API response (no 'stats' list).")
    out = {}
    for row in payload["stats"]:
        if not isinstance(row, dict):
            continue
        code = row.get("id")
        count = row.get("count")
        if not isinstance(code, str) or not isinstance(count, int) or isinstance(count, bool) or count < 0:
            continue
        code = code.strip().upper()
        if CODE_RE.match(code):
            out[code] = out.get(code, 0) + count
    return out, bool(payload.get("more"))


def round_down(n):
    """Pure. A visit count rounded DOWN to a multiple of ROUND_STEP (12 -> 10, 37 -> 35, 4 -> 0)."""
    return n - (n % ROUND_STEP)


def build_document(counts, floor, now=None, regions=None, region_floor=None):
    """Pure. The document to write, largest first. Each count is rounded down to a multiple of
    ROUND_STEP first, and only countries whose ROUNDED count is at least the floor are kept, so every
    published number is at least the floor it advertises. "updated" is a date only, no time.

    `regions` is None for the country-only document (no "regions" key, exactly as before). A dict of
    {ISO 3166-2 code: raw count} adds "minRegionVisits" and "regions": the same rounding, the region
    floor (never below MIN_REGION_FLOOR or the country floor), and only regions whose country is a
    published country."""
    if floor < MIN_FLOOR:
        raise UpdateError("The minimum cannot be lower than %d." % MIN_FLOOR)
    kept = sorted(((c, round_down(n)) for c, n in counts.items()
                   if CODE_RE.match(c) and round_down(n) >= floor),
                  key=lambda kv: (-kv[1], kv[0]))
    now = now or datetime.datetime.now(datetime.timezone.utc)
    doc = {
        "updated": now.strftime("%Y-%m-%d"),
        "minVisits": floor,
        "countries": dict(kept),
    }
    if regions is not None:
        if region_floor is not None and region_floor < MIN_REGION_FLOOR:
            raise UpdateError("The region minimum cannot be lower than %d." % MIN_REGION_FLOOR)
        rfloor = max(MIN_REGION_FLOOR, region_floor or 0, floor)
        rkept = sorted(((c, round_down(n)) for c, n in regions.items()
                        if REGION_CODE_RE.match(c) and c[:2] in doc["countries"] and round_down(n) >= rfloor),
                       key=lambda kv: (-kv[1], kv[0]))
        doc["minRegionVisits"] = rfloor
        doc["regions"] = dict(rkept)
    return doc


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """Refuse every redirect. urllib's default handler copies the Authorization header to the new
    address, whatever its host, so following one could hand the API key to another server. With no
    redirect request built, the 3xx answer surfaces as an HTTPError and is reported, not followed."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


_OPENER = urllib.request.build_opener(_NoRedirect)


def http_get(url, token):
    """One GET with the token in the Authorization header. Returns (status, headers, parsed JSON).
    A redirect is not followed: it comes back as its own 3xx status with no payload."""
    req = urllib.request.Request(url, headers={
        "Authorization": "Bearer " + token,
        "Accept": "application/json",
        "User-Agent": "nomadic-almanac-update-visitors/1",
    })
    try:
        with _OPENER.open(req, timeout=30) as resp:
            return resp.status, resp.headers, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as err:
        return err.code, err.headers, None
    except (urllib.error.URLError, OSError, ValueError) as err:
        # str(err) can carry the URL but never the headers, so it is safe to show the type only.
        raise UpdateError("Could not reach GoatCounter (%s)." % type(err).__name__)


def _note(message):
    """One progress line on stderr. It never carries the address or the token."""
    sys.stderr.write("update_visitors: %s\n" % message)


def _get_with_retry(url, token, get, sleep):
    """One API page. Returns (status, payload). Two kinds of answer are retried, nothing else:
      * HTTP 429 (rate limit): once, after the wait the service asks for (1 to 10 seconds);
      * HTTP 404: up to len(NOT_FOUND_WAITS) times, after each wait in turn. The service has answered
        "site not found" to the first request of a run and then answered normally on the next call, with
        the same key and the same site code (2026-11-10 from a Mac, 2026-11-11 from a GitHub runner), so a
        single 404 is not trusted. A site that really does not exist answers 404 every time and still
        fails, after the last wait. 401, 403, 3xx and 5xx are not retried (a redirect must never be
        followed, a refused key does not get better, and a server fault is for a person to re-run)."""
    status, headers, payload = get(url, token)
    rate_limit_retried = False
    waits = list(NOT_FOUND_WAITS)
    while True:
        if status == 429 and not rate_limit_retried:
            rate_limit_retried = True
            wait = 2
            try:
                wait = min(10, max(1, int(headers.get("X-Rate-Limit-Reset", 2))))
            except (TypeError, ValueError, AttributeError):
                pass
        elif status == 404 and waits:
            wait = waits.pop(0)
            _note("GoatCounter answered HTTP 404; waiting %d s and trying again (retry %d of %d)."
                  % (wait, len(NOT_FOUND_WAITS) - len(waits), len(NOT_FOUND_WAITS)))
        else:
            return status, payload
        sleep(wait)
        status, headers, payload = get(url, token)


def _check_status(status, payload, site, not_found=None):
    """Raise UpdateError (a message that never contains the token) unless the page is a usable 200."""
    if status in (401, 403):
        raise UpdateError("GoatCounter refused the key (HTTP %d). It needs the 'Read statistics' permission "
                          "and must belong to site '%s'." % (status, site))
    if 300 <= status < 400:
        raise UpdateError("GoatCounter answered with a redirect (HTTP %d). It was not followed, because the "
                          "API key would be sent to the new address. Check the site code." % status)
    if status == 404:
        raise UpdateError(not_found or "Site '%s' was not found (HTTP 404). Check the site code." % site)
    if status != 200 or payload is None:
        raise UpdateError("GoatCounter returned HTTP %d." % status)


def fetch_counts(site, token, since, now=None, get=http_get, sleep=time.sleep):
    """All per-country totals from `since` to now, following the API's pagination."""
    now = now or datetime.datetime.now(datetime.timezone.utc)
    base = "https://%s.goatcounter.com/api/v0/stats/locations" % site
    totals, offset = {}, 0
    for _page in range(MAX_PAGES):
        query = urllib.parse.urlencode({
            "start": since.strftime("%Y-%m-%dT00:00:00Z"),
            "end": now.strftime("%Y-%m-%dT%H:00:00Z"),
            "limit": PAGE_LIMIT, "offset": offset,
        })
        status, payload = _get_with_retry(base + "?" + query, token, get, sleep)
        _check_status(status, payload, site)
        page, more = parse_locations(payload)
        for code, n in page.items():
            totals[code] = totals.get(code, 0) + n
        offset += len(payload["stats"])
        if not more or not payload["stats"]:
            break
        sleep(PAUSE_SECONDS)
    return totals


# ── Region level (only with --regions) ─────────────────────────────────────────────────────────────
def normalise_name(name):
    """Pure. A region display name reduced for matching: accents removed, case folded, punctuation and
    runs of spaces collapsed ("Île-de-France" and "Ile de France" match; "Zürich" matches "Zurich")."""
    if not isinstance(name, str):
        return ""
    base = unicodedata.normalize("NFKD", name)
    base = "".join(ch for ch in base if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", base.casefold()).strip()


def build_region_table(geojson):
    """Pure. From the parsed data/admin1.geojson: ({COUNTRY: {normalised name: {codes}}}, {COUNTRY: {codes}}).
    Only features with a well-formed ISO 3166-2 code are used; the country is the code's own prefix."""
    names, codes = {}, {}
    feats = geojson.get("features") if isinstance(geojson, dict) else None
    for f in feats if isinstance(feats, list) else []:
        props = f.get("properties") if isinstance(f, dict) else None
        if not isinstance(props, dict):
            continue
        code = props.get("iso_3166_2")
        if not isinstance(code, str) or not REGION_CODE_RE.match(code):
            continue
        country = code[:2]
        codes.setdefault(country, set()).add(code)
        key = normalise_name(props.get("name"))
        if key:
            names.setdefault(country, {}).setdefault(key, set()).add(code)
    return names, codes


def load_region_table(path=ADMIN1):
    try:
        with open(path, encoding="utf-8") as fh:
            return build_region_table(json.load(fh))
    except (OSError, ValueError):
        raise UpdateError("Could not read %s (needed for --regions)." % os.path.relpath(path, REPO))


def parse_region_rows(payload, country, table):
    """Pure. From one detail page for `country`, return ({CODE: count}, more, unmatched). A row counts
    only when it has a whole, non-negative count and resolves to exactly one ISO 3166-2 code of that
    country: through its own "id" if the vendor ever sends a known code, otherwise through its display
    "name" and the admin-1 table. Anything else is dropped (and counted in `unmatched`), so free text
    and unknown places never reach the output."""
    names, codes = table
    if not isinstance(payload, dict) or not isinstance(payload.get("stats"), list):
        raise UpdateError("Unexpected API response for the regions of %s (no 'stats' list)." % country)
    out, unmatched = {}, 0
    for row in payload["stats"]:
        if not isinstance(row, dict):
            continue
        count = row.get("count")
        if not isinstance(count, int) or isinstance(count, bool) or count < 0:
            continue
        rid = row.get("id")
        code = None
        if isinstance(rid, str) and rid.strip().upper() in codes.get(country, ()):
            code = rid.strip().upper()
        else:
            hits = names.get(country, {}).get(normalise_name(row.get("name")), set())
            if len(hits) == 1:
                code = next(iter(hits))
        if code is None:
            unmatched += 1
            continue
        out[code] = out.get(code, 0) + count
    return out, bool(payload.get("more")), unmatched


def fetch_region_counts(site, token, countries, since, table, now=None, get=http_get, sleep=time.sleep):
    """Per-region totals for each country in `countries` (the published ones only). Returns
    ({ISO 3166-2 code: count}, unmatched rows). One request per country and page; the country code is
    checked against CODE_RE before it goes into the address."""
    now = now or datetime.datetime.now(datetime.timezone.utc)
    totals, unmatched_total = {}, 0
    for country in countries:
        if not CODE_RE.match(country):
            continue
        base = "https://%s.goatcounter.com/api/v0/stats/locations/%s" % (site, country)
        offset = 0
        for _page in range(MAX_PAGES):
            query = urllib.parse.urlencode({
                "start": since.strftime("%Y-%m-%dT00:00:00Z"),
                "end": now.strftime("%Y-%m-%dT%H:00:00Z"),
                "limit": PAGE_LIMIT, "offset": offset,
            })
            sleep(PAUSE_SECONDS)
            status, payload = _get_with_retry(base + "?" + query, token, get, sleep)
            _check_status(status, payload, site,
                          not_found="Regions of %s were not found (HTTP 404)." % country)
            page, more, unmatched = parse_region_rows(payload, country, table)
            unmatched_total += unmatched
            for code, n in page.items():
                totals[code] = totals.get(code, 0) + n
            offset += len(payload["stats"])
            if not more or not payload["stats"]:
                break
    return totals, unmatched_total


def existing_country_count(path):
    try:
        with open(path, encoding="utf-8") as fh:
            doc = json.load(fh)
        return len(doc.get("countries", {})) if isinstance(doc, dict) else 0
    except (OSError, ValueError):
        return 0


def existing_region_count(path):
    try:
        with open(path, encoding="utf-8") as fh:
            doc = json.load(fh)
        regs = doc.get("regions", {}) if isinstance(doc, dict) else {}
        return len(regs) if isinstance(regs, dict) else 0
    except (OSError, ValueError):
        return 0


def write_atomic(path, doc):
    folder = os.path.dirname(path) or "."
    os.makedirs(folder, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=".visitors-", suffix=".tmp", dir=folder)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(doc, fh, indent=2, ensure_ascii=True)
            fh.write("\n")
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def run(argv=None, env=None, get=http_get, now=None, out_stream=None, region_table=None, sleep=time.sleep):
    env = os.environ if env is None else env
    out = out_stream or sys.stdout
    ap = argparse.ArgumentParser(description="Refresh data/visitors.json from GoatCounter country totals.")
    ap.add_argument("--site", help="GoatCounter site code (default: $%s, then NA_ANALYTICS_SITE in app.js)" % SITE_ENV)
    ap.add_argument("--min-visits", type=int, default=MIN_FLOOR,
                    help="hide countries below this many visits, counted after rounding down to a multiple of %d "
                         "(default and lowest allowed: %d)" % (ROUND_STEP, MIN_FLOOR))
    ap.add_argument("--regions", action="store_true",
                    help="also collect visits by state or province (OFF by default; needs the steps in "
                         "docs/visitors-layer.md, section 'Region level (off)')")
    ap.add_argument("--min-region-visits", type=int, default=MIN_REGION_FLOOR,
                    help="with --regions: hide regions below this many visits, counted after rounding down "
                         "(default and lowest allowed: %d; never below --min-visits)" % MIN_REGION_FLOOR)
    ap.add_argument("--since", default="2020-01-01", help="count visits from this date, YYYY-MM-DD (default 2020-01-01)")
    ap.add_argument("--out", default=DEFAULT_OUT, help="file to write (default data/visitors.json)")
    ap.add_argument("--dry-run", action="store_true", help="print the result, write nothing")
    ap.add_argument("--allow-empty", action="store_true",
                    help="let an empty result replace a file that has countries")
    ap.add_argument("--allow-other-site", action="store_true",
                    help="send the key to a site other than '%s' (only for an account of your own)" % EXPECTED_SITE)
    args = ap.parse_args(argv)

    token = clean_token(env.get(TOKEN_ENV))
    site = clean_site(args.site or env.get(SITE_ENV) or site_from_app_js())
    if site != EXPECTED_SITE and not args.allow_other_site:
        raise UpdateError("Refusing to send the API key to %s.goatcounter.com: this repository's site is '%s'. "
                          "If the account really changed, edit EXPECTED_SITE in scripts/update_visitors.py in a "
                          "reviewed change; for a run against another account of your own, pass --allow-other-site."
                          % (site, EXPECTED_SITE))
    if args.min_visits < MIN_FLOOR:
        raise UpdateError("--min-visits cannot be lower than %d." % MIN_FLOOR)
    if args.min_region_visits != MIN_REGION_FLOOR and not args.regions:
        raise UpdateError("--min-region-visits only applies together with --regions.")
    if args.min_region_visits < MIN_REGION_FLOOR:
        raise UpdateError("--min-region-visits cannot be lower than %d." % MIN_REGION_FLOOR)
    try:
        since = datetime.datetime.strptime(args.since, "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
    except ValueError:
        raise UpdateError("--since must be a date like 2024-01-31.")

    now = now or datetime.datetime.now(datetime.timezone.utc)
    counts = fetch_counts(site, token, since, now=now, get=get, sleep=sleep)
    doc = build_document(counts, args.min_visits, now=now)
    shown, hidden = len(doc["countries"]), len(counts) - len(doc["countries"])
    region_note = ""
    if args.regions:
        table = region_table if region_table is not None else load_region_table()
        region_counts, unmatched = fetch_region_counts(site, token, sorted(doc["countries"]), since, table,
                                                       now=now, get=get, sleep=sleep)
        doc = build_document(counts, args.min_visits, now=now, regions=region_counts,
                             region_floor=args.min_region_visits)
        rshown = len(doc["regions"])
        region_note = "; %d regions kept, %d below the region minimum of %d, %d rows matched no region code" % (
            rshown, len(region_counts) - rshown, doc["minRegionVisits"], unmatched)

    if args.dry_run:
        out.write(json.dumps(doc, indent=2) + "\n")
        out.write("dry run: %d countries kept, %d below the minimum%s, nothing written\n" % (shown, hidden, region_note))
        return 0
    if shown == 0 and not args.allow_empty and existing_country_count(args.out) > 0:
        raise UpdateError("The result has no countries but %s has some; refusing to replace it "
                          "(use --allow-empty if that is really intended)." % os.path.relpath(args.out, REPO))
    if args.regions and not doc["regions"] and not args.allow_empty and existing_region_count(args.out) > 0:
        raise UpdateError("The result has no regions but %s has some; refusing to replace it "
                          "(use --allow-empty if that is really intended)." % os.path.relpath(args.out, REPO))
    write_atomic(args.out, doc)
    out.write("wrote %s: %d countries kept, %d below the minimum of %d%s\n"
              % (os.path.relpath(args.out, REPO), shown, hidden, args.min_visits, region_note))
    return 0


def main():
    try:
        sys.exit(run())
    except UpdateError as err:
        sys.stderr.write("update_visitors: %s\n" % err)
        sys.exit(1)


if __name__ == "__main__":
    main()

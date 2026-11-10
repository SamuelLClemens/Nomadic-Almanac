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
  * Countries with fewer than MIN_FLOOR (3) visits are never written. --min-visits can raise the
    minimum but not lower it. The browser applies the same floor again.
  * On any failure the existing data/visitors.json is left untouched (the write is atomic), and a
    result with no countries does not replace a file that has some unless --allow-empty is given.
  * The token is sent only to https://EXPECTED_SITE.goatcounter.com. A different site code (from
    app.js, GOATCOUNTER_SITE or --site) is refused unless --allow-other-site is given, so a changed
    NA_ANALYTICS_SITE cannot send the key to someone else's account. An HTTP redirect is never
    followed, because urllib would resend the Authorization header to the new address.

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
import urllib.error
import urllib.parse
import urllib.request

MIN_FLOOR = 3                                   # the lowest minimum that may ever be written
TOKEN_ENV = "GOATCOUNTER_TOKEN"
SITE_ENV = "GOATCOUNTER_SITE"
SITE_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,62}$")
# The one account this repository's key belongs to. The key is sent to this site only. Changing it is
# a reviewed edit of this file, not something a changed app.js or environment variable can do.
EXPECTED_SITE = "nomadicalmanac"
CODE_RE = re.compile(r"^[A-Z]{2}$")
PAGE_LIMIT = 100                                # the API maximum
MAX_PAGES = 10                                  # 1,000 countries is far more than exist
PAUSE_SECONDS = 0.3                             # the API allows 4 requests per second

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_OUT = os.path.join(REPO, "data", "visitors.json")
APP_JS = os.path.join(REPO, "app.js")


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


def build_document(counts, floor, now=None):
    """Pure. The document to write: only countries at or above the floor, largest first."""
    if floor < MIN_FLOOR:
        raise UpdateError("The minimum cannot be lower than %d." % MIN_FLOOR)
    kept = sorted(((c, n) for c, n in counts.items() if CODE_RE.match(c) and n >= floor),
                  key=lambda kv: (-kv[1], kv[0]))
    now = now or datetime.datetime.now(datetime.timezone.utc)
    return {
        "updated": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "minVisits": floor,
        "countries": dict(kept),
    }


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
        status, headers, payload = get(base + "?" + query, token)
        if status == 429:
            wait = 2
            try:
                wait = min(10, max(1, int(headers.get("X-Rate-Limit-Reset", 2))))
            except (TypeError, ValueError, AttributeError):
                pass
            sleep(wait)
            status, headers, payload = get(base + "?" + query, token)
        if status in (401, 403):
            raise UpdateError("GoatCounter refused the key (HTTP %d). It needs the 'Read statistics' permission "
                              "and must belong to site '%s'." % (status, site))
        if 300 <= status < 400:
            raise UpdateError("GoatCounter answered with a redirect (HTTP %d). It was not followed, because the "
                              "API key would be sent to the new address. Check the site code." % status)
        if status == 404:
            raise UpdateError("Site '%s' was not found (HTTP 404). Check the site code." % site)
        if status != 200 or payload is None:
            raise UpdateError("GoatCounter returned HTTP %d." % status)
        page, more = parse_locations(payload)
        for code, n in page.items():
            totals[code] = totals.get(code, 0) + n
        offset += len(payload["stats"])
        if not more or not payload["stats"]:
            break
        sleep(PAUSE_SECONDS)
    return totals


def existing_country_count(path):
    try:
        with open(path, encoding="utf-8") as fh:
            doc = json.load(fh)
        return len(doc.get("countries", {})) if isinstance(doc, dict) else 0
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


def run(argv=None, env=None, get=http_get, now=None, out_stream=None):
    env = os.environ if env is None else env
    out = out_stream or sys.stdout
    ap = argparse.ArgumentParser(description="Refresh data/visitors.json from GoatCounter country totals.")
    ap.add_argument("--site", help="GoatCounter site code (default: $%s, then NA_ANALYTICS_SITE in app.js)" % SITE_ENV)
    ap.add_argument("--min-visits", type=int, default=MIN_FLOOR,
                    help="hide countries below this many visits (default and lowest allowed: %d)" % MIN_FLOOR)
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
    try:
        since = datetime.datetime.strptime(args.since, "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
    except ValueError:
        raise UpdateError("--since must be a date like 2024-01-31.")

    now = now or datetime.datetime.now(datetime.timezone.utc)
    counts = fetch_counts(site, token, since, now=now, get=get)
    doc = build_document(counts, args.min_visits, now=now)
    shown, hidden = len(doc["countries"]), len(counts) - len(doc["countries"])

    if args.dry_run:
        out.write(json.dumps(doc, indent=2) + "\n")
        out.write("dry run: %d countries kept, %d below the minimum, nothing written\n" % (shown, hidden))
        return 0
    if shown == 0 and not args.allow_empty and existing_country_count(args.out) > 0:
        raise UpdateError("The result has no countries but %s has some; refusing to replace it "
                          "(use --allow-empty if that is really intended)." % os.path.relpath(args.out, REPO))
    write_atomic(args.out, doc)
    out.write("wrote %s: %d countries kept, %d below the minimum of %d\n"
              % (os.path.relpath(args.out, REPO), shown, hidden, args.min_visits))
    return 0


def main():
    try:
        sys.exit(run())
    except UpdateError as err:
        sys.stderr.write("update_visitors: %s\n" % err)
        sys.exit(1)


if __name__ == "__main__":
    main()

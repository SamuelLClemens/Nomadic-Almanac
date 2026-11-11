#!/usr/bin/env python3
"""Small helper for the "Refresh visitor data" workflow (.github/workflows/refresh-visitors.yml).

Three commands, standard library only, no network, no secrets:

  python3 scripts/visitors_changed.py compare OLD.json NEW.json
      Prints "changed=true" or "changed=false" on stdout (the workflow appends it to $GITHUB_OUTPUT)
      and one plain sentence on stderr. The files are equal when minVisits, countries and, if either
      has any, regions (with minRegionVisits) are equal. "updated" is ignored on purpose: it is the run
      date, so counting it would open a pull request, and a Pages deploy, every week for nothing.

  python3 scripts/visitors_changed.py validate FILE.json
      Exit 0 when FILE is exactly the document the updater writes, exit 1 with the reasons when not.
      The rules are the browser's allowlist (app.js, _naVisitorsParse and _naRegionsParse), applied by
      REFUSING instead of silently dropping: only the keys updated, minVisits, countries and, with
      --allow-regions, minRegionVisits and regions (the two always together); two-letter upper-case
      country codes; ISO 3166-2 region codes such as US-CA, each only for a country that is itself
      published; whole, non-negative counts; the floors respected (never below the country floor of
      MIN_FLOOR, the file's own minVisits, and for a region the region floor of MIN_REGION_FLOOR, the
      file's own minRegionVisits and the effective country floor); and every count a multiple of
      ROUND_STEP (the updater's privacy rule, checked again here). Without --allow-regions a file with
      either region key is refused. Region level is switched on (slice G), so the workflow passes
      --allow-regions; the flag stays so the region-off path (a file with no regions) is still strict.

  python3 scripts/visitors_changed.py summary FILE.json
      Prints the published countries and their rounded counts as a Markdown list (public data), for
      the body of the pull request, and, when the document has a "regions" key, a second list of the
      published states or provinces. A document with no regions key prints the country list alone, as
      before. Run validate first.

Exit status 2 means a file could not be read or is not shaped like the data file at all.
The floors and the rounding step are imported from update_visitors.py so they cannot drift.
"""
import datetime
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from update_visitors import MIN_FLOOR, MIN_REGION_FLOOR, ROUND_STEP  # noqa: E402

MAX_BYTES = 256 * 1024                       # the real file is under 2 KB; refuse anything absurd
COUNTRY_RE = re.compile(r"[A-Z]{2}")       # always used with fullmatch: "$" would also accept "US\n"
REGION_RE = re.compile(r"[A-Z]{2}-[A-Z0-9]{1,3}")
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
ALLOWED_KEYS = {"updated", "minVisits", "countries"}
REGION_KEYS = {"minRegionVisits", "regions"}


class Problem(Exception):
    """A file that cannot be read or is not shaped like the data file at all (exit status 2)."""


def _no_constant(name):
    raise ValueError("%s is not valid JSON data" % name)


def _no_duplicates(pairs):
    seen = {}
    for key, value in pairs:
        if key in seen:
            raise ValueError("duplicate key %r" % key)
        seen[key] = value
    return seen


def load(path):
    """Parse one file strictly: size-limited, UTF-8, no NaN or Infinity, no duplicate keys, a JSON object."""
    try:
        with open(path, "rb") as fh:
            raw = fh.read(MAX_BYTES + 1)
    except OSError as err:
        raise Problem("cannot read %s (%s)" % (path, type(err).__name__))
    if len(raw) > MAX_BYTES:
        raise Problem("%s is larger than %d bytes" % (path, MAX_BYTES))
    try:
        doc = json.loads(raw.decode("utf-8"), parse_constant=_no_constant, object_pairs_hook=_no_duplicates)
    except (UnicodeDecodeError, ValueError) as err:
        raise Problem("%s is not valid JSON (%s)" % (path, err))
    if not isinstance(doc, dict):
        raise Problem("%s is not a JSON object" % path)
    return doc


def _whole(value):
    return isinstance(value, int) and not isinstance(value, bool)


def _count_map(value, label):
    if not isinstance(value, dict):
        raise Problem("%s is not an object" % label)
    for key, count in value.items():
        if not _whole(count):
            raise Problem("%s[%s] is not a whole number" % (label, key))
    return value


def comparable(doc):
    """The part of a document that is published: (minVisits, countries, regions, minRegionVisits).
    A missing regions key and an empty one publish the same nothing, so they are equal; the region floor
    only counts when there is at least one region."""
    if not _whole(doc.get("minVisits")):
        raise Problem("minVisits is missing or not a whole number")
    countries = _count_map(doc.get("countries"), "countries")
    regions = _count_map(doc.get("regions", {}), "regions")
    region_floor = doc.get("minRegionVisits") if regions else None
    return doc["minVisits"], dict(countries), dict(regions), region_floor


def changed(old, new):
    """True when the published counts differ. `updated` is ignored."""
    return comparable(old) != comparable(new)


def problems(doc, allow_regions=False):
    """Every reason the document is not exactly what the updater writes (empty list: acceptable)."""
    out = []
    allowed = ALLOWED_KEYS | (REGION_KEYS if allow_regions else set())
    for key in sorted(set(doc) - allowed, key=str):
        out.append("unexpected key %r%s" % (key, " (pass --allow-regions to accept the region keys)" if key in REGION_KEYS else ""))
    for key in sorted(ALLOWED_KEYS - set(doc)):
        out.append("missing key %r" % key)

    updated = doc.get("updated")
    if "updated" in doc:
        ok = isinstance(updated, str) and DATE_RE.fullmatch(updated)
        if ok:
            try:
                datetime.datetime.strptime(updated, "%Y-%m-%d")
            except ValueError:
                ok = False
        if not ok:
            out.append("updated must be a date YYYY-MM-DD with no time")

    floor = MIN_FLOOR
    if "minVisits" in doc:
        if not _whole(doc["minVisits"]) or doc["minVisits"] < MIN_FLOOR:
            out.append("minVisits must be a whole number of at least %d" % MIN_FLOOR)
        else:
            floor = doc["minVisits"]

    countries = doc.get("countries")
    published = set()
    if "countries" in doc:
        if not isinstance(countries, dict):
            out.append("countries must be an object")
        else:
            for code, count in countries.items():
                if not isinstance(code, str) or not COUNTRY_RE.fullmatch(code):
                    out.append("country code %r is not two upper-case letters" % (code,))
                elif not _whole(count) or count < 0:
                    out.append("count for %s is not a whole, non-negative number" % code)
                elif count < floor:
                    out.append("count for %s (%d) is below the floor of %d" % (code, count, floor))
                elif count % ROUND_STEP:
                    out.append("count for %s (%d) is not a multiple of %d" % (code, count, ROUND_STEP))
                else:
                    published.add(code)

    if allow_regions and "minRegionVisits" in doc and "regions" not in doc:
        out.append("minRegionVisits is present without regions")
    if allow_regions and "regions" in doc:
        rfloor = max(MIN_REGION_FLOOR, floor)
        if "minRegionVisits" not in doc:
            out.append("missing key 'minRegionVisits'")
        elif not _whole(doc["minRegionVisits"]) or doc["minRegionVisits"] < MIN_REGION_FLOOR:
            out.append("minRegionVisits must be a whole number of at least %d" % MIN_REGION_FLOOR)
        else:
            rfloor = max(rfloor, doc["minRegionVisits"])
        regions = doc["regions"]
        if not isinstance(regions, dict):
            out.append("regions must be an object")
        else:
            for code, count in regions.items():
                if not isinstance(code, str) or not REGION_RE.fullmatch(code):
                    out.append("region code %r is not an ISO 3166-2 code such as US-CA" % (code,))
                elif code[:2] not in published:
                    out.append("region %s belongs to a country that is not published" % code)
                elif not _whole(count) or count < 0:
                    out.append("count for %s is not a whole, non-negative number" % code)
                elif count < rfloor:
                    out.append("count for %s (%d) is below the region floor of %d" % (code, count, rfloor))
                elif count % ROUND_STEP:
                    out.append("count for %s (%d) is not a multiple of %d" % (code, count, ROUND_STEP))
    return out


def _list(counts, empty):
    rows = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    if not rows:
        return "- " + empty
    return "\n".join("- %s: %d" % (code, count) for code, count in rows)


def summary(doc):
    """Markdown list of published countries, largest first, and, when the document has a "regions" key,
    the published states or provinces after it. Only call it on a document that validates."""
    countries = _list(doc["countries"], "no country is at or above the floor of %d visits" % doc["minVisits"])
    if "regions" not in doc:
        return countries
    rfloor = max(MIN_REGION_FLOOR, doc["minVisits"], doc.get("minRegionVisits") or 0)
    regions = _list(doc["regions"], "no state or province is at or above the floor of %d visits" % rfloor)
    return "Countries:\n%s\n\nStates or provinces (a region is listed only when its country is):\n%s" % (countries, regions)


def main(argv):
    allow_regions = "--allow-regions" in argv
    args = [a for a in argv if a != "--allow-regions"]
    try:
        if len(args) == 3 and args[0] == "compare":
            differs = changed(load(args[1]), load(args[2]))
            sys.stderr.write("Published counts changed.\n" if differs else
                             "Published counts are unchanged (the date alone is ignored).\n")
            sys.stdout.write("changed=%s\n" % ("true" if differs else "false"))
            return 0
        if len(args) == 2 and args[0] == "validate":
            found = problems(load(args[1]), allow_regions=allow_regions)
            if found:
                for line in found:
                    sys.stderr.write("invalid: %s\n" % line)
                return 1
            sys.stderr.write("valid: %s matches the data file contract.\n" % args[1])
            return 0
        if len(args) == 2 and args[0] == "summary":
            sys.stdout.write(summary(load(args[1])) + "\n")
            return 0
    except Problem as err:
        sys.stderr.write("visitors_changed: %s\n" % err)
        return 2
    sys.stderr.write("usage: visitors_changed.py compare OLD.json NEW.json | "
                     "validate [--allow-regions] FILE.json | summary FILE.json\n")
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

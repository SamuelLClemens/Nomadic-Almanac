#!/usr/bin/env python3
"""Region level is built and shipped OFF: python3 scripts/test_visitor_regions_off.py

What this proves, without a browser:
  1. app.js ships NA_VISITORS_REGIONS as the literal `false`, and every region function starts with
     the switch guard (a new region function without one fails here).
  2. While the switch is false, the real parsing block of app.js (the code between @na-pure-begin and
     @na-pure-end, run under JavaScriptCore) produces exactly the country-only result, ignores a data
     file full of regions, keeps no region state and makes no request.
  3. While the switch is true (a throw-away copy of the constant in the test harness, never in the
     repository), the region rules hold: region floor 25 (the file may raise it, never lower it), never
     below the country floor, no region for a country that is not itself published, strict codes, finite
     whole numbers only.
  4. The data file in the repository has no region keys.

The JavaScript part needs `jsc` (JavaScriptCore, shipped with macOS) and is skipped with a message when it
is missing; the static checks always run. All data is synthetic and defined in this file. No network.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_JS = os.path.join(REPO, "app.js")
VISITORS_JSON = os.path.join(REPO, "data", "visitors.json")
JSC_FALLBACK = "/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc"

# Every function that does region work. Each must start with the NA_VISITORS_REGIONS guard.
REGION_FUNCTIONS = ["_naRegionsParse", "_naRegionCentroids", "_naRegionsEnsureData", "_naRegionsAdmin1Settled",
                    "_naRegionsRender", "_naRegionTooltip", "_naRegionsLegendHtml"]

with open(APP_JS, encoding="utf-8") as _fh:
    SRC = _fh.read()


def find_jsc():
    return shutil.which("jsc") or (JSC_FALLBACK if os.path.exists(JSC_FALLBACK) else None)


def const_value(name):
    m = re.search(r"^const\s+%s\s*=\s*([^;]+);" % re.escape(name), SRC, re.M)
    return m.group(1).strip() if m else None


def pure_block():
    a, b = SRC.find("// @na-pure-begin"), SRC.find("// @na-pure-end")
    assert 0 <= a < b, "the @na-pure-begin / @na-pure-end markers are missing from app.js"
    return SRC[a:b]


class StaticSwitch(unittest.TestCase):
    def test_switch_is_a_single_const_false(self):
        self.assertEqual(len(re.findall(r"\bNA_VISITORS_REGIONS\s*=(?!=)", SRC)), 1)
        self.assertEqual(const_value("NA_VISITORS_REGIONS"), "false")

    def test_region_floor_is_higher_than_the_country_floor(self):
        country, region = int(const_value("NA_VISITORS_FLOOR")), int(const_value("NA_VISITORS_REGION_FLOOR"))
        self.assertGreater(region, country)

    def test_every_region_function_starts_with_the_guard_and_none_is_missing(self):
        declared = re.findall(r"^function\s+(_naRegion\w*)\s*\(", SRC, re.M)
        self.assertEqual(sorted(declared), sorted(REGION_FUNCTIONS),
                         "a region function was added or removed: update REGION_FUNCTIONS and give it the guard")
        for name in REGION_FUNCTIONS:
            m = re.search(r"^function\s+%s\s*\([^)]*\)\s*\{\s*\n\s*(.*)$" % re.escape(name), SRC, re.M)
            self.assertIsNotNone(m, name)
            self.assertTrue(m.group(1).startswith("if (!NA_VISITORS_REGIONS)"),
                            "%s does not start with the NA_VISITORS_REGIONS guard: %r" % (name, m.group(1)))

    def test_region_functions_are_only_called_through_guarded_entry_points(self):
        # Calls from outside the region section go only to the guarded entry points.
        entry = {"_naRegionsRender", "_naRegionsLegendHtml", "_naRegionsAdmin1Settled", "_naRegionsParse"}
        for name in REGION_FUNCTIONS:
            if name in entry:
                continue
            outside = [m.start() for m in re.finditer(r"\b%s\s*\(" % re.escape(name), SRC)]
            # Allowed only inside other region functions (their own declaration line is one of them).
            for pos in outside:
                line_start = SRC.rfind("\n", 0, pos) + 1
                line = SRC[line_start:SRC.find("\n", pos)]
                if line.startswith("function %s" % name):
                    continue
                owner = None
                for other in REGION_FUNCTIONS:
                    d = SRC.find("\nfunction %s(" % other)
                    nxt = SRC.find("\nfunction ", d + 1)
                    if d != -1 and d < pos < nxt:
                        owner = other
                self.assertIsNotNone(owner, "%s is called outside the region section: %s" % (name, line.strip()))

    def test_no_region_text_is_used_outside_a_guarded_function(self):
        # The interface strings exist in the table but may be read only from inside the region functions.
        spans = []
        for name in REGION_FUNCTIONS:
            d = SRC.find("\nfunction %s(" % name)
            spans.append((d, SRC.find("\n}\n", d)))
        for m in re.finditer(r"_t\('visitors\.region", SRC):
            self.assertTrue(any(a < m.start() < b for a, b in spans), "region text read outside a guarded function")

    def test_committed_data_file_has_no_region_keys(self):
        with open(VISITORS_JSON, encoding="utf-8") as fh:
            doc = json.load(fh)
        self.assertNotIn("regions", doc)
        self.assertNotIn("minRegionVisits", doc)
        self.assertEqual(doc["countries"], {})                 # still the honest empty document

    def test_no_new_host_and_no_inline_handler_in_the_region_code(self):
        a, b = SRC.find("Visitors layer, region level (state or province pins"), SRC.find("function _naVisitorsTooltip(")
        section = SRC[a:b]
        self.assertNotRegex(section, r"https?://")
        self.assertNotRegex(section, r"\bon[a-z]+\s*=")
        self.assertNotIn("javascript:", section)
        self.assertEqual(len(re.findall(r"\bfetch\(", section)), 0, "region code makes no request of its own")


FIXTURE = {
    "updated": "2026-11-10", "minVisits": 10,
    "countries": {"US": 300, "CA": 80, "DE": 40, "FR": 8},
    "regions": {"US-CA": 120, "US-NY": 30, "US-TX": 24, "CA-ON": 60, "DE-BY": 25,
                "FR-75": 500,                                     # FR is below the country floor
                "XX-YY": 100,                                     # XX is not a published country at all
                "us-ca": 100, "US-": 100, "USA-CA": 100, "US-CALI": 100, "1.2.3.4": 100, "__proto__": 100,
                "US-NJ": 40.5, "US-WA": "60", "US-OR": -5, "US-FL": None, "US-AK": True, "US-MN": 1e999},
}

HARNESS = r"""
const NA_VISITORS_FLOOR = %(floor)s;
const NA_VISITORS_REGION_FLOOR = %(rfloor)s;
const NA_VISITORS_REGIONS = %(switch)s;
let _naVisitors = { active: false, state: 'idle', rows: [], updated: '', markers: [], json: null,
                    regions: [], regionMarkers: [], regionData: 'idle' };
const _requests = [];
function fetch(u) { _requests.push(String(u)); return Promise.reject(new Error('no network in this test')); }
const _centres = { US: {lat: 39, lng: -98}, CA: {lat: 56, lng: -106}, DE: {lat: 51, lng: 10}, FR: {lat: 46, lng: 2} };
function _naCountryCentroids() { return _centres; }
%(block)s
const FIX = %(fixture)s;
function run(doc) {
  _naVisitors.regions = ['stale']; _naVisitors.state = 'idle';
  _naVisitorsApply(doc);
  return { state: _naVisitors.state, countries: _naVisitors.rows.map(r => r.iso2 + ':' + r.count),
           regions: JSON.parse(JSON.stringify(_naVisitors.regions)), requests: _requests.length };
}
const out = {};
%(scenarios)s
print(JSON.stringify(out));
"""

SCENARIOS = r"""
out.base = run(FIX);
const noRegionsDoc = JSON.parse(JSON.stringify(FIX)); delete noRegionsDoc.regions;
out.noRegionsKey = run(noRegionsDoc);
const raised = JSON.parse(JSON.stringify(FIX)); raised.minVisits = 50;
out.countryFloor50 = run(raised);
const rr = JSON.parse(JSON.stringify(FIX)); rr.minRegionVisits = 100;
out.regionFloor100 = run(rr);
const low = JSON.parse(JSON.stringify(FIX)); low.minVisits = 1; low.minRegionVisits = 1;
out.lowered = run(low);
out.garbageMinRegion = ['abc', null, -1, [], {}, NaN, 'x', true].map(v => {
  const d = JSON.parse(JSON.stringify(FIX)); d.minRegionVisits = v; return run(d).regions.map(r => r.code).join(',');
});
out.badRegionsShapes = [null, [], 'US-CA', 5, true].map(v => {
  const d = JSON.parse(JSON.stringify(FIX)); d.regions = v; return run(d).regions.length;
});
const empty = JSON.parse(JSON.stringify(FIX)); empty.countries = {};
out.emptyCountries = run(empty);
out.parseDirect = _naRegionsParse(FIX, [{ iso2: 'US' }, { iso2: 'CA' }, { iso2: 'DE' }]).map(r => r.code + ':' + r.count);
"""


def run_js(switch, floor=None, rfloor=None):
    jsc = find_jsc()
    if not jsc:
        raise unittest.SkipTest("jsc (JavaScriptCore) not found; the static checks above still ran")
    script = HARNESS % {
        "floor": floor if floor is not None else const_value("NA_VISITORS_FLOOR"),
        "rfloor": rfloor if rfloor is not None else const_value("NA_VISITORS_REGION_FLOOR"),
        "switch": "true" if switch else "false",
        "block": pure_block(), "fixture": json.dumps(FIXTURE), "scenarios": SCENARIOS,
    }
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, "harness.js")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(script)
        res = subprocess.run([jsc, path], capture_output=True, text=True, timeout=60)
    if res.returncode != 0:
        raise AssertionError("jsc failed: %s %s" % (res.stdout[-400:], res.stderr[-400:]))
    return json.loads(res.stdout.strip().splitlines()[-1])


COUNTRIES = ["US:300", "CA:80", "DE:40"]          # FR (8) is below the country floor of 10


class SwitchOff(unittest.TestCase):
    """The shipped state: the real block, switch false, a file full of regions."""

    @classmethod
    def setUpClass(cls):
        cls.out = run_js(False)

    def test_the_result_is_exactly_the_country_only_result(self):
        o = self.out
        self.assertEqual(o["base"]["state"], "ready")
        self.assertEqual(o["base"]["countries"], COUNTRIES)
        # The same document with no regions key gives the identical country rows.
        self.assertEqual(o["base"]["countries"], o["noRegionsKey"]["countries"])
        self.assertEqual(o["base"]["state"], o["noRegionsKey"]["state"])

    def test_no_region_state_survives_and_no_request_is_made(self):
        o = self.out
        for key in ("base", "noRegionsKey", "countryFloor50", "regionFloor100", "lowered", "emptyCountries"):
            self.assertEqual(o[key]["regions"], [], key)
            self.assertEqual(o[key]["requests"], 0, key)

    def test_the_region_parser_returns_nothing_even_when_called_directly(self):
        self.assertEqual(self.out["parseDirect"], [])
        for k in ("garbageMinRegion", "badRegionsShapes"):
            self.assertTrue(all(not x for x in self.out[k]), k)

    def test_country_floor_still_applies_as_before(self):
        self.assertEqual(self.out["countryFloor50"]["countries"], ["US:300", "CA:80"])
        self.assertEqual(self.out["lowered"]["countries"], COUNTRIES)          # a lowered file floor is ignored


class SwitchOn(unittest.TestCase):
    """The switch is true only inside this harness. Proves the rules the owner relies on later."""

    @classmethod
    def setUpClass(cls):
        cls.out = run_js(True)

    def test_floor_rounding_codes_and_country_gate(self):
        # 24 and 20 are below 25; FR-75 and XX-YY have no published country; bad keys and values refused.
        self.assertEqual(self.out["parseDirect"], ["US-CA:120", "CA-ON:60", "US-NY:30", "DE-BY:25"])
        self.assertEqual([r["code"] + ":" + str(r["count"]) for r in self.out["base"]["regions"]],
                         ["US-CA:120", "CA-ON:60", "US-NY:30", "DE-BY:25"])
        for r in self.out["base"]["regions"]:
            self.assertGreaterEqual(r["count"], 25)
            self.assertEqual(r["iso2"], r["code"][:2])
            self.assertIn(r["iso2"] + ":", " ".join(c[:3] for c in self.out["base"]["countries"]))

    def test_no_region_for_a_country_below_the_country_floor_or_absent(self):
        codes = [r["code"] for r in self.out["base"]["regions"]]
        self.assertNotIn("FR-75", codes)
        self.assertNotIn("XX-YY", codes)
        # With no published country at all, no region appears either.
        self.assertEqual(self.out["emptyCountries"]["state"], "empty")
        self.assertEqual(self.out["emptyCountries"]["regions"], [])

    def test_the_file_can_raise_the_floors_and_never_lower_them(self):
        o = self.out
        # minVisits 50 drops DE from the countries, so DE-BY goes too, and the region floor follows to 50.
        self.assertEqual(o["countryFloor50"]["countries"], ["US:300", "CA:80"])
        self.assertEqual([r["code"] for r in o["countryFloor50"]["regions"]], ["US-CA", "CA-ON"])
        self.assertEqual([r["code"] for r in o["regionFloor100"]["regions"]], ["US-CA"])
        # A file that tries to lower either floor changes nothing.
        self.assertEqual(o["lowered"]["countries"], COUNTRIES)
        self.assertEqual([r["code"] for r in o["lowered"]["regions"]], ["US-CA", "CA-ON", "US-NY", "DE-BY"])
        # Garbage in minRegionVisits falls back to the built-in floor.
        self.assertEqual(o["garbageMinRegion"], ["US-CA,CA-ON,US-NY,DE-BY"] * 8)

    def test_a_regions_value_of_the_wrong_shape_gives_no_regions(self):
        self.assertEqual(self.out["badRegionsShapes"], [0, 0, 0, 0, 0])

    def test_no_request_is_made_by_the_parsing_block(self):
        self.assertEqual(self.out["base"]["requests"], 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)

#!/usr/bin/env python3
"""Region level is switched ON (slice G); the OFF path stays proven: python3 scripts/test_visitor_regions_off.py

(The file keeps its name from slice D, when region shipped off; it now tests both states.)

What this proves, without a browser:
  1. app.js ships NA_VISITORS_REGIONS as the literal `true`, and every region function starts with
     the switch guard (a new region function without one fails here), so setting it back to false
     still switches everything off. No region request is reachable while the data file holds no region.
  2. ON, the real parsing block of app.js (the code between @na-pure-begin and @na-pure-end, run under
     JavaScriptCore): region floor 25 (the file may raise it, never lower it), never below the country
     floor, no region for a country that is not itself published, strict codes, finite whole numbers only,
     and a file with no `regions` gives exactly the country-only result and makes no request.
  3. OFF, proved on a TEMPORARY COPY of app.js with that one constant set to false (never in the
     repository): the same parsing block produces exactly the country-only result, ignores a data file
     full of regions, keeps no region state and makes no request, and the copy differs from app.js in that
     one line only.
  4. The privacy texts that the page shows (the legend note, the Preferences notice, the FAQ answer, in all
     11 languages, and the English fallback in index.html) name region and both floors, so the notice
     matches what is collected.
  5. The data file in the repository obeys the contract with region level allowed.

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


def const_value(name, src=None):
    m = re.search(r"^const\s+%s\s*=\s*([^;]+);" % re.escape(name), SRC if src is None else src, re.M)
    return m.group(1).strip() if m else None


def pure_block(src=None):
    src = SRC if src is None else src
    a, b = src.find("// @na-pure-begin"), src.find("// @na-pure-end")
    assert 0 <= a < b, "the @na-pure-begin / @na-pure-end markers are missing from app.js"
    return src[a:b]


def switched_off_copy():
    """The text of app.js with the one constant set to false: the temporary copy the OFF path is proved on."""
    line = "const NA_VISITORS_REGIONS = true;"
    assert SRC.count(line) == 1, "expected exactly one `%s` in app.js" % line
    return SRC.replace(line, "const NA_VISITORS_REGIONS = false;")


def check_guards(test, src):
    declared = re.findall(r"^function\s+(_naRegion\w*)\s*\(", src, re.M)
    test.assertEqual(sorted(declared), sorted(REGION_FUNCTIONS),
                     "a region function was added or removed: update REGION_FUNCTIONS and give it the guard")
    for name in REGION_FUNCTIONS:
        m = re.search(r"^function\s+%s\s*\([^)]*\)\s*\{\s*\n\s*(.*)$" % re.escape(name), src, re.M)
        test.assertIsNotNone(m, name)
        test.assertTrue(m.group(1).startswith("if (!NA_VISITORS_REGIONS)"),
                        "%s does not start with the NA_VISITORS_REGIONS guard: %r" % (name, m.group(1)))


class StaticSwitch(unittest.TestCase):
    def test_switch_is_a_single_const_true(self):
        # Slice G: region level is switched on. One assignment, one literal, so nothing can flip it at run time.
        self.assertEqual(len(re.findall(r"\bNA_VISITORS_REGIONS\s*=(?!=)", SRC)), 1)
        self.assertEqual(const_value("NA_VISITORS_REGIONS"), "true")

    def test_region_floor_is_higher_than_the_country_floor(self):
        country, region = int(const_value("NA_VISITORS_FLOOR")), int(const_value("NA_VISITORS_REGION_FLOOR"))
        self.assertGreater(region, country)

    def test_every_region_function_starts_with_the_guard_and_none_is_missing(self):
        check_guards(self, SRC)

    def test_no_region_request_is_reachable_while_the_file_holds_no_region(self):
        # The admin-1 polygons (the only thing region pins need to fetch) are requested from
        # _naRegionsEnsureData, which _naRegionsRender reaches only after its early return for "no region
        # in the data" (and for no published country, an inactive layer and pins already drawn).
        a = SRC.find("\nfunction _naRegionsRender(")
        body = SRC[a:SRC.find("\n}\n", a)]
        early = body.find("!v.regions.length) return;")
        ensure = body.find("_naRegionsEnsureData()")
        self.assertTrue(0 < early < ensure, "the empty-regions early return must come before the polygon request")
        self.assertIn("!v.rows.length", body[:early])
        self.assertIn("!v.active", body[:early])
        # and nothing else calls the polygon request
        calls = [m.start() for m in re.finditer(r"\b_naRegionsEnsureData\s*\(", SRC)]
        self.assertEqual(len(calls), 2, "only the declaration and the one call in _naRegionsRender")

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

    def test_committed_data_file_obeys_the_contract_with_regions_allowed(self):
        # Not "is empty": a refresh pull request legitimately fills it in. What must hold at all times:
        # only known keys, floors, rounding, and a region only for a published country.
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import visitors_changed as vc
        with open(VISITORS_JSON, encoding="utf-8") as fh:
            doc = json.load(fh)
        self.assertEqual(vc.problems(doc, allow_regions=True), [])
        for code in doc.get("regions", {}):
            self.assertIn(code[:2], doc["countries"], "%s has no published country" % code)
        self.assertEqual(sorted(set(doc) - {"updated", "minVisits", "countries", "minRegionVisits", "regions"}), [])

    def test_no_new_host_and_no_inline_handler_in_the_region_code(self):
        a, b = SRC.find("Visitors layer, region level (state or province pins"), SRC.find("function _naVisitorsTooltip(")
        section = SRC[a:b]
        self.assertNotRegex(section, r"https?://")
        self.assertNotRegex(section, r"\bon[a-z]+\s*=")
        self.assertNotIn("javascript:", section)
        self.assertEqual(len(re.findall(r"\bfetch\(", section)), 0, "region code makes no request of its own")


INDEX_HTML = os.path.join(REPO, "index.html")
LANGS = ["en", "es", "fr", "de", "pt", "ar", "zh", "hi", "ja", "ru", "he"]
# A stem of the word for "state or province" in each language (the same as its visitors.region string),
# matched case-insensitively. Ten of the eleven texts are first drafts that a native reader should confirm.
REGION_STEM = {"en": "state", "es": "estado", "fr": "état", "de": "bundesl", "pt": "estado", "ar": "الولا",
               "zh": "州或省", "hi": "राज्य", "ja": "州・省", "ru": "штат", "he": "אזור"}
# key: (how many times the region stem must appear at least)
TEXT_KEYS = {"visitors.privacy": 2, "prefs.privacyNote": 3, "faq.7.a": 1}


def i18n_strings(src):
    """{key: {lang: text}} for the privacy keys, read from the interface-string tables in app.js."""
    out = {k: {} for k in TEXT_KEYS}
    lang = None
    for line in src.split("\n"):
        m = re.match(r'^\s{2}"?([a-z]{2})"?: \{', line)
        if m:
            lang = m.group(1)
        for key, text in re.findall(r'"(visitors\.privacy|prefs\.privacyNote|faq\.7\.a)": "((?:[^"\\]|\\.)*)"', line):
            assert lang not in out[key], "%s appears twice for %s" % (key, lang)
            out[key][lang] = text
    return out


class PrivacyTextNamesRegion(unittest.TestCase):
    """Region is on, so the notice must say what is collected: states or provinces, both floors, the opt-out."""

    @classmethod
    def setUpClass(cls):
        cls.t = i18n_strings(SRC)
        cls.country_floor = const_value("NA_VISITORS_FLOOR")
        cls.region_floor = const_value("NA_VISITORS_REGION_FLOOR")

    def test_every_language_has_every_text(self):
        for key in TEXT_KEYS:
            self.assertEqual(sorted(self.t[key]), sorted(LANGS), key)

    def test_each_text_names_region_often_enough(self):
        for key, least in TEXT_KEYS.items():
            for lang in LANGS:
                n = len(re.findall(re.escape(REGION_STEM[lang]), self.t[key][lang], re.I))
                self.assertGreaterEqual(n, least, "%s [%s] names region %d time(s), expected at least %d: %s"
                                        % (key, lang, n, least, self.t[key][lang]))

    def test_the_legend_note_and_the_notice_name_both_floors(self):
        for key in ("visitors.privacy", "prefs.privacyNote"):
            for lang in LANGS:
                text = self.t[key][lang]
                for floor in (self.country_floor, self.region_floor):
                    self.assertRegex(text, r"(?<!\d)%s(?!\d)" % floor, "%s [%s] does not name the floor %s" % (key, lang, floor))
                self.assertRegex(text, r"(?<!\d)5(?!\d)", "%s [%s] lost the rounding step of 5" % (key, lang))

    def test_the_notice_still_has_the_opt_out_sentence_that_covers_region(self):
        note = self.t["prefs.privacyNote"]["en"]
        self.assertIn("You can switch counting off for your browser below; this covers the count by state or province as well.", note)

    def test_english_fallbacks_match_the_reference_text(self):
        with open(INDEX_HTML, encoding="utf-8") as fh:
            html = fh.read()
        m = re.search(r'id="pref-privacy-note"[^>]*>([^<]*)</p>', html)
        self.assertIsNotNone(m)
        self.assertEqual(m.group(1), self.t["prefs.privacyNote"]["en"])
        faq = re.search(r"\{ q: 'Is my data private\?', a: '((?:[^'\\]|\\.)*)' \}", SRC)
        self.assertIsNotNone(faq)
        self.assertEqual(faq.group(1), self.t["faq.7.a"]["en"])

    def test_the_old_country_only_wording_is_gone(self):
        for lang in LANGS:
            for key in TEXT_KEYS:
                self.assertNotRegex(self.t[key][lang], r"(?i)\bonly country totals\b|\bby country \(no IP", key)


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


def run_js(src):
    """Run the scenarios on the parsing block of `src` (the text of app.js, or its switched-off copy), with the
    three constants read from that same text so the harness cannot disagree with the file it tests."""
    jsc = find_jsc()
    if not jsc:
        raise unittest.SkipTest("jsc (JavaScriptCore) not found; the static checks above still ran")
    script = HARNESS % {
        "floor": const_value("NA_VISITORS_FLOOR", src),
        "rfloor": const_value("NA_VISITORS_REGION_FLOOR", src),
        "switch": const_value("NA_VISITORS_REGIONS", src),
        "block": pure_block(src), "fixture": json.dumps(FIXTURE), "scenarios": SCENARIOS,
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
    """The OFF path: a TEMPORARY COPY of app.js with the one constant set to false, and a file full of
    regions. Nothing is written into the repository."""

    @classmethod
    def setUpClass(cls):
        cls._tmp = tempfile.TemporaryDirectory()
        cls.addClassCleanup(cls._tmp.cleanup)
        cls.copy_path = os.path.join(cls._tmp.name, "app.off.js")
        with open(cls.copy_path, "w", encoding="utf-8") as fh:
            fh.write(switched_off_copy())
        with open(cls.copy_path, encoding="utf-8") as fh:
            cls.copy_src = fh.read()
        cls.out = run_js(cls.copy_src)

    def test_the_copy_differs_from_app_js_in_exactly_one_line(self):
        a, b = SRC.split("\n"), self.copy_src.split("\n")
        self.assertEqual(len(a), len(b))
        self.assertEqual([(x, y) for x, y in zip(a, b) if x != y],
                         [("const NA_VISITORS_REGIONS = true;", "const NA_VISITORS_REGIONS = false;")])
        self.assertEqual(const_value("NA_VISITORS_REGIONS", self.copy_src), "false")

    def test_the_guards_are_all_still_in_the_copy(self):
        check_guards(self, self.copy_src)

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
    """The shipped state: the real block of app.js with the switch as shipped (true). Proves the rules the
    owner relies on."""

    @classmethod
    def setUpClass(cls):
        cls.out = run_js(SRC)

    def test_the_harness_ran_with_the_switch_as_shipped(self):
        self.assertEqual(const_value("NA_VISITORS_REGIONS"), "true")

    def test_a_file_without_regions_gives_the_country_only_result_and_no_request(self):
        o = self.out
        self.assertEqual(o["noRegionsKey"]["state"], "ready")
        self.assertEqual(o["noRegionsKey"]["countries"], COUNTRIES)
        self.assertEqual(o["noRegionsKey"]["regions"], [])
        self.assertEqual(o["noRegionsKey"]["requests"], 0)
        # ... the same country rows as the file with regions: region adds rows, never changes country rows
        self.assertEqual(o["noRegionsKey"]["countries"], o["base"]["countries"])

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

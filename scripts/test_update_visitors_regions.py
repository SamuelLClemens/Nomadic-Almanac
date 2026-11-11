#!/usr/bin/env python3
"""Tests for the region level of update_visitors.py: python3 scripts/test_update_visitors_regions.py

Region level is OFF unless --regions is given. All data below is synthetic test input defined in this
file (the real data/admin1.geojson is read only by the one test that checks name matching on real
region names, and nothing here is written to data/). The tests never touch the internet: the HTTP call
is replaced by a fake. The live shape of the vendor's per-country response could NOT be checked,
because Region collection is off in the owner's GoatCounter account; these tests encode what the
vendor's published API description and source say, nothing more.
"""
import datetime
import io
import json
import os
import re
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import update_visitors as uv  # noqa: E402

TOKEN = "tok_TEST_not_a_real_key_0123456789"
NOW = datetime.datetime(2026, 11, 6, 9, 30, tzinfo=datetime.timezone.utc)
SINCE = datetime.datetime(2020, 1, 1, tzinfo=datetime.timezone.utc)

# A tiny synthetic admin-1 file: the same properties as data/admin1.geojson, invented regions.
SYNTH = {"type": "FeatureCollection", "features": [
    {"properties": {"iso_a2": "US", "iso_3166_2": "US-CA", "name": "California"}},
    {"properties": {"iso_a2": "US", "iso_3166_2": "US-NY", "name": "New York"}},
    {"properties": {"iso_a2": "US", "iso_3166_2": "US-TX", "name": "Texas"}},
    {"properties": {"iso_a2": "CA", "iso_3166_2": "CA-QC", "name": "Québec"}},
    {"properties": {"iso_a2": "CA", "iso_3166_2": "CA-ON", "name": "Ontario"}},
    {"properties": {"iso_a2": "FR", "iso_3166_2": "FR-75", "name": "Paris"}},
    {"properties": {"iso_a2": "HU", "iso_3166_2": "HU-VE", "name": "Veszprém"}},
    {"properties": {"iso_a2": "HU", "iso_3166_2": "HU-VM", "name": "Veszprem"}},   # same name once accents go
    {"properties": {"iso_a2": "US", "iso_3166_2": "US-CA", "name": "California"}},  # second part, same code
    {"properties": {"iso_a2": "-99", "iso_3166_2": "-99-X16~", "name": "Nowhere"}},  # malformed code
    {"properties": {"iso_a2": "US", "iso_3166_2": "", "name": "No code"}},
    {"properties": None},
    "not a feature",
]}
TABLE = uv.build_region_table(SYNTH)


def country_page(rows, more=False):
    return {"more": more, "stats": [{"id": i, "name": "n", "count": c} for i, c in rows]}


def region_page(rows, more=False):
    """The vendor's detail view: a display name and a count, no id."""
    return {"more": more, "stats": [{"name": n, "count": c} for n, c in rows]}


class FakeApi:
    def __init__(self, answers):
        self.answers = list(answers)
        self.calls = []

    def __call__(self, url, token):
        self.calls.append((url, token))
        status, payload = self.answers.pop(0)
        return status, {}, payload


class Constants(unittest.TestCase):
    def test_region_floor_is_higher_than_the_country_floor(self):
        self.assertEqual(uv.MIN_REGION_FLOOR, 25)
        self.assertGreater(uv.MIN_REGION_FLOOR, uv.MIN_FLOOR)
        self.assertEqual(uv.MIN_REGION_FLOOR % uv.ROUND_STEP, 0)

    def test_app_js_region_floor_equals_the_updater_region_floor(self):
        with open(uv.APP_JS, encoding="utf-8") as fh:
            m = re.search(r"const\s+NA_VISITORS_REGION_FLOOR\s*=\s*(\d+)\s*;", fh.read())
        self.assertIsNotNone(m, "NA_VISITORS_REGION_FLOOR not found in app.js")
        self.assertEqual(int(m.group(1)), uv.MIN_REGION_FLOOR)


class BuildDocument(unittest.TestCase):
    def test_without_regions_the_document_is_exactly_the_country_document(self):
        doc = uv.build_document({"US": 120, "DE": 44}, 10, now=NOW)
        self.assertEqual(sorted(doc), ["countries", "minVisits", "updated"])
        self.assertNotIn("regions", doc)
        self.assertNotIn("minRegionVisits", doc)

    def test_region_floor_is_tested_on_the_rounded_value(self):
        regions = {"US-CA": 29, "US-NY": 25, "US-TX": 24, "CA-ON": 49}
        doc = uv.build_document({"US": 200, "CA": 60}, 10, now=NOW, regions=regions)
        # 29 publishes as 25 (kept); 24 publishes as 20 (below 25, dropped); 49 publishes as 45.
        self.assertEqual(doc["regions"], {"CA-ON": 45, "US-CA": 25, "US-NY": 25})
        self.assertEqual(doc["minRegionVisits"], 25)
        for n in doc["regions"].values():
            self.assertEqual(n % uv.ROUND_STEP, 0)
            self.assertGreaterEqual(n, doc["minRegionVisits"])
            self.assertGreater(doc["minRegionVisits"], doc["minVisits"])

    def test_a_region_of_an_unpublished_country_is_never_written(self):
        # FR has 8 visits (below the country floor) and DE is absent: their regions must not appear
        # however large the region counts are.
        regions = {"FR-75": 500, "DE-BY": 500, "US-CA": 60}
        doc = uv.build_document({"US": 200, "FR": 8}, 10, now=NOW, regions=regions)
        self.assertEqual(doc["regions"], {"US-CA": 60})
        # A country that rounds below the floor (raw 12 with floor 15) is unpublished too.
        doc = uv.build_document({"US": 200, "FR": 12}, 15, now=NOW, regions={"FR-75": 500, "US-CA": 60})
        self.assertNotIn("FR", doc["countries"])
        self.assertEqual(doc["regions"], {"US-CA": 60})

    def test_strict_code_allowlist(self):
        bad = {"US-": 100, "us-ca": 100, "USA-CA": 100, "US-CALI": 100, "US_CA": 100, "1.2.3.4": 100,
               "::1": 100, "US-C A": 100, "US": 100, "": 100, "US-CA<b>": 100, "-99-X16~": 100}
        regions = dict(bad)
        regions["US-CA"] = 100
        doc = uv.build_document({"US": 500}, 10, now=NOW, regions=regions)
        self.assertEqual(doc["regions"], {"US-CA": 100})

    def test_floor_can_be_raised_never_lowered(self):
        regions = {"US-CA": 59, "US-NY": 40}
        doc = uv.build_document({"US": 500}, 10, now=NOW, regions=regions, region_floor=50)
        self.assertEqual(doc["regions"], {"US-CA": 55})
        self.assertEqual(doc["minRegionVisits"], 50)
        for low in (24, 20, 10, 5, 0, -5):
            with self.assertRaises(uv.UpdateError):
                uv.build_document({"US": 500}, 10, now=NOW, regions=regions, region_floor=low)

    def test_region_floor_is_never_below_the_country_floor(self):
        doc = uv.build_document({"US": 500}, 40, now=NOW, regions={"US-CA": 35, "US-NY": 45})
        self.assertEqual(doc["minRegionVisits"], 40)
        self.assertEqual(doc["regions"], {"US-NY": 45})

    def test_empty_regions_are_an_honest_empty_object(self):
        doc = uv.build_document({"US": 500}, 10, now=NOW, regions={})
        self.assertEqual(doc["regions"], {})
        self.assertEqual(doc["minRegionVisits"], 25)

    def test_one_extra_visit_changes_a_region_only_at_a_multiple_of_five(self):
        changed = []
        for n in range(0, 200):
            a = uv.build_document({"US": 500}, 10, now=NOW, regions={"US-CA": n})
            b = uv.build_document({"US": 500}, 10, now=NOW, regions={"US-CA": n + 1})
            if a != b:
                changed.append(n + 1)
        self.assertTrue(changed)
        for n in changed:
            self.assertEqual(n % uv.ROUND_STEP, 0)


class RegionTable(unittest.TestCase):
    def test_only_well_formed_codes_are_used_and_the_country_is_the_prefix(self):
        names, codes = TABLE
        self.assertEqual(sorted(codes), ["CA", "FR", "HU", "US"])
        self.assertEqual(codes["US"], {"US-CA", "US-NY", "US-TX"})
        self.assertNotIn("nowhere", json.dumps({k: sorted(v) for k, v in names.items()}))

    def test_names_match_without_accents_case_or_punctuation(self):
        self.assertEqual(uv.normalise_name("Île-de-France"), "ile de france")
        self.assertEqual(uv.normalise_name("  QUÉBEC "), "quebec")
        self.assertEqual(uv.normalise_name("New   York"), "new york")
        self.assertEqual(uv.normalise_name(None), "")
        self.assertEqual(uv.normalise_name(12), "")

    def test_real_admin1_file_resolves_common_region_names(self):
        # The one test that reads the real data/admin1.geojson (about 3 s): names a visitor from the
        # largest countries would carry must resolve to exactly one code.
        names, _codes = uv.load_region_table()
        for country, name, code in (("US", "California", "US-CA"), ("CA", "Ontario", "CA-ON"),
                                    ("CA", "Québec", "CA-QC"), ("DE", "Bayern", "DE-BY"),
                                    ("AU", "New South Wales", "AU-NSW"), ("BR", "São Paulo", "BR-SP"),
                                    ("IN", "Maharashtra", "IN-MH"), ("IL", "Tel Aviv", "IL-TA")):
            self.assertEqual(names[country][uv.normalise_name(name)], {code}, "%s %s" % (country, name))


class ParseRegionRows(unittest.TestCase):
    def test_names_resolve_to_codes_and_counts_add_up(self):
        payload = region_page([("California", 40), ("california", 5), ("New York", 31), ("Texas", 7)])
        out, more, unmatched = uv.parse_region_rows(payload, "US", TABLE)
        self.assertEqual(out, {"US-CA": 45, "US-NY": 31, "US-TX": 7})
        self.assertFalse(more)
        self.assertEqual(unmatched, 0)

    def test_unknown_ambiguous_and_wrong_country_names_are_dropped_not_guessed(self):
        payload = region_page([("(unknown)", 90), ("Atlantis", 80), ("Ontario", 70), ("Paris", 60),
                               ("California", 50)])
        out, _more, unmatched = uv.parse_region_rows(payload, "US", TABLE)
        self.assertEqual(out, {"US-CA": 50})          # Ontario is Canadian, Paris is French
        self.assertEqual(unmatched, 4)
        # Two codes share one normalised name in HU: neither is guessed.
        out, _more, unmatched = uv.parse_region_rows(region_page([("Veszprem", 30)]), "HU", TABLE)
        self.assertEqual(out, {})
        self.assertEqual(unmatched, 1)

    def test_a_known_code_in_id_is_accepted_only_for_that_country(self):
        payload = {"stats": [{"id": "US-CA", "count": 30}, {"id": "CA-ON", "count": 30},
                             {"id": "US-ZZ", "name": "Texas", "count": 20}]}
        out, _more, unmatched = uv.parse_region_rows(payload, "US", TABLE)
        # An unknown id falls back to the name; a code of another country is not used for US.
        self.assertEqual(out, {"US-CA": 30, "US-TX": 20})
        self.assertEqual(unmatched, 1)

    def test_bad_counts_and_free_text_never_get_through(self):
        payload = {"stats": [
            {"name": "California", "count": -1}, {"name": "New York", "count": "17"},
            {"name": "Texas", "count": True}, {"name": "California", "count": 3.5},
            {"name": "203.0.113.7", "count": 40}, {"name": "<script>", "count": 40}, "x", None,
            {"name": "New York", "count": 33}]}
        out, _more, _unmatched = uv.parse_region_rows(payload, "US", TABLE)
        self.assertEqual(out, {"US-NY": 33})
        self.assertNotIn("203", json.dumps(out))

    def test_wrong_shape_is_an_error(self):
        for bad in (None, [], {}, {"stats": "x"}):
            with self.assertRaises(uv.UpdateError):
                uv.parse_region_rows(bad, "US", TABLE)


class FetchRegions(unittest.TestCase):
    def fetch(self, answers, countries=("US",)):
        api = FakeApi(answers)
        got = uv.fetch_region_counts("example", TOKEN, list(countries), SINCE, TABLE, now=NOW, get=api,
                                     sleep=lambda s: None)
        return got, api

    def test_asks_the_detail_view_once_per_published_country_and_keeps_the_token_in_the_header(self):
        (counts, unmatched), api = self.fetch([(200, region_page([("California", 40)])),
                                               (200, region_page([("Ontario", 33), ("Atlantis", 9)]))],
                                              countries=("US", "CA"))
        self.assertEqual(counts, {"US-CA": 40, "CA-ON": 33})
        self.assertEqual(unmatched, 1)
        self.assertEqual(len(api.calls), 2)
        self.assertTrue(api.calls[0][0].startswith("https://example.goatcounter.com/api/v0/stats/locations/US?"))
        self.assertTrue(api.calls[1][0].startswith("https://example.goatcounter.com/api/v0/stats/locations/CA?"))
        for url, token in api.calls:
            self.assertEqual(token, TOKEN)
            self.assertNotIn(TOKEN, url)

    def test_a_country_code_that_is_not_two_capital_letters_is_never_put_in_an_address(self):
        (counts, _u), api = self.fetch([], countries=("../x", "us", "USA", ""))
        self.assertEqual(counts, {})
        self.assertEqual(api.calls, [])

    def test_follows_pagination(self):
        (counts, _u), api = self.fetch([(200, region_page([("California", 40)], more=True)),
                                        (200, region_page([("California", 6), ("Texas", 3)]))])
        self.assertEqual(counts, {"US-CA": 46, "US-TX": 3})
        self.assertIn("offset=1", api.calls[1][0])

    def test_errors_never_show_the_token_and_redirects_are_not_followed(self):
        for status in (301, 302, 307, 308, 401, 403, 404, 500):
            with self.assertRaises(uv.UpdateError) as ctx:
                self.fetch([(status, None)])
            self.assertNotIn(TOKEN, str(ctx.exception))
            if 300 <= status < 400:
                self.assertIn("redirect", str(ctx.exception))
        with self.assertRaises(uv.UpdateError) as ctx:
            self.fetch([(404, None)])
        self.assertIn("Regions of US", str(ctx.exception))

    def test_rate_limit_is_retried_once(self):
        (counts, _u), api = self.fetch([(429, None), (200, region_page([("Texas", 30)]))])
        self.assertEqual(counts, {"US-TX": 30})
        self.assertEqual(len(api.calls), 2)


class EndToEnd(unittest.TestCase):
    def run_main(self, out_path, answers, extra=()):
        api = FakeApi(answers)
        stream = io.StringIO()
        env = {"GOATCOUNTER_TOKEN": TOKEN, "GOATCOUNTER_SITE": "example"}
        code = uv.run(["--out", out_path, "--allow-other-site"] + list(extra), env=env, get=api, now=NOW,
                      out_stream=stream, region_table=TABLE)
        return code, stream.getvalue(), api

    COUNTRIES = (200, country_page([("US", 300), ("CA", 80), ("FR", 8)]))

    def test_without_the_flag_one_request_and_no_regions_key_even_over_a_file_that_has_them(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            with open(out, "w", encoding="utf-8") as fh:
                json.dump({"countries": {"US": 300}, "regions": {"US-CA": 100}}, fh)
            code, text, api = self.run_main(out, [self.COUNTRIES])
            self.assertEqual(code, 0)
            self.assertEqual(len(api.calls), 1)                      # the country query only
            self.assertNotIn("/locations/", api.calls[0][0])
            with open(out, encoding="utf-8") as fh:
                doc = json.load(fh)
            self.assertEqual(sorted(doc), ["countries", "minVisits", "updated"])
            self.assertNotIn("region", text)

    def test_with_the_flag_only_published_countries_are_asked_and_the_file_has_both_levels(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "data", "visitors.json")
            # Countries are asked in sorted order: CA first, then US.
            answers = [self.COUNTRIES,
                       (200, region_page([("Ontario", 61), ("Québec", 12)])),
                       (200, region_page([("California", 120), ("New York", 31), ("Texas", 24), ("Atlantis", 50)]))]
            code, text, api = self.run_main(out, answers, extra=["--regions"])
            self.assertEqual(code, 0)
            # Country query, then US and CA detail views in order; FR (8 visits) is never asked about.
            self.assertEqual(len(api.calls), 3)
            asked = [u.split("?")[0].rsplit("/", 1)[1] for u, _t in api.calls[1:]]
            self.assertEqual(asked, ["CA", "US"])
            self.assertNotIn(TOKEN, text)
            with open(out, encoding="utf-8") as fh:
                raw = fh.read()
            self.assertNotIn(TOKEN, raw)
            doc = json.loads(raw)
            self.assertEqual(doc["countries"], {"US": 300, "CA": 80})
            self.assertEqual(doc["regions"], {"CA-ON": 60, "US-CA": 120, "US-NY": 30})
            self.assertEqual(doc["minRegionVisits"], 25)
            self.assertEqual(sorted(doc), ["countries", "minRegionVisits", "minVisits", "regions", "updated"])
            self.assertIn("1 rows matched no region code", text)

    def test_dry_run_with_the_flag_writes_nothing(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            code, text, _a = self.run_main(out, [self.COUNTRIES, (200, region_page([])),
                                                 (200, region_page([("Texas", 60)]))], extra=["--regions", "--dry-run"])
            self.assertEqual(code, 0)
            self.assertFalse(os.path.exists(out))
            self.assertIn("nothing written", text)
            self.assertIn('"US-TX": 60', text)

    def test_a_failed_region_request_leaves_the_existing_file_untouched(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            with open(out, "w", encoding="utf-8") as fh:
                fh.write('{"keep": "me"}')
            with self.assertRaises(uv.UpdateError):
                self.run_main(out, [self.COUNTRIES, (500, None)], extra=["--regions"])
            with open(out, encoding="utf-8") as fh:
                self.assertEqual(fh.read(), '{"keep": "me"}')

    def test_region_minimum_rules_are_refused_before_any_request(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            for extra in (["--regions", "--min-region-visits", "24"], ["--regions", "--min-region-visits", "10"],
                          ["--min-region-visits", "50"]):
                api = FakeApi([])
                with self.assertRaises(uv.UpdateError):
                    uv.run(["--out", out, "--allow-other-site"] + extra,
                           env={"GOATCOUNTER_TOKEN": TOKEN, "GOATCOUNTER_SITE": "example"},
                           get=api, now=NOW, out_stream=io.StringIO(), region_table=TABLE)
                self.assertEqual(api.calls, [])

    def test_a_raised_region_minimum_is_applied(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            self.run_main(out, [self.COUNTRIES, (200, region_page([])),
                                (200, region_page([("California", 120), ("New York", 40)]))],
                          extra=["--regions", "--min-region-visits", "50"])
            with open(out, encoding="utf-8") as fh:
                doc = json.load(fh)
            self.assertEqual(doc["regions"], {"US-CA": 120})
            self.assertEqual(doc["minRegionVisits"], 50)

    def test_an_empty_region_result_does_not_replace_a_file_that_has_regions(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            with open(out, "w", encoding="utf-8") as fh:
                json.dump({"countries": {"US": 300}, "regions": {"US-CA": 100}}, fh)
            answers = [self.COUNTRIES, (200, region_page([])), (200, region_page([]))]
            with self.assertRaises(uv.UpdateError):
                self.run_main(out, list(answers), extra=["--regions"])
            code, _t, _a = self.run_main(out, list(answers), extra=["--regions", "--allow-empty"])
            self.assertEqual(code, 0)
            with open(out, encoding="utf-8") as fh:
                self.assertEqual(json.load(fh)["regions"], {})

    def test_the_committed_data_file_has_no_regions(self):
        # Shipped OFF: data/visitors.json stays the honest empty document until the owner turns region on.
        with open(uv.DEFAULT_OUT, encoding="utf-8") as fh:
            doc = json.load(fh)
        self.assertNotIn("regions", doc)
        self.assertNotIn("minRegionVisits", doc)


if __name__ == "__main__":
    unittest.main(verbosity=2)

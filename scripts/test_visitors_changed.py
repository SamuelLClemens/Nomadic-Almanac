#!/usr/bin/env python3
"""Tests for visitors_changed.py: python3 scripts/test_visitors_changed.py

All documents below are synthetic test input defined in this file. The tests read no repository data
file except the committed one (which must validate and compare equal to itself), make no network request
and need no secret. The command-line entry point is run in a child process for the exit codes.
"""
import copy
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import update_visitors as uv  # noqa: E402
import visitors_changed as vc  # noqa: E402

ROOT = os.path.dirname(HERE)
SCRIPT = os.path.join(HERE, "visitors_changed.py")

BASE = {"updated": "2026-11-09", "minVisits": 10, "countries": {"US": 120, "DE": 40, "FR": 10}}
WITH_REGIONS = dict(copy.deepcopy(BASE), minRegionVisits=25, regions={"US-CA": 40, "DE-BY": 25})


def doc(**changes):
    out = copy.deepcopy(BASE)
    out.update(changes)
    return out


class Compare(unittest.TestCase):
    def test_identical_files_are_unchanged(self):
        self.assertFalse(vc.changed(BASE, copy.deepcopy(BASE)))

    def test_only_the_date_differs_is_unchanged(self):
        self.assertFalse(vc.changed(BASE, doc(updated="2026-11-16")))
        # even a full timestamp in an older file counts as the same
        self.assertFalse(vc.changed(BASE, doc(updated="2026-11-16T09:30:00Z")))

    def test_a_count_change_is_changed(self):
        self.assertTrue(vc.changed(BASE, doc(countries={"US": 125, "DE": 40, "FR": 10})))

    def test_a_country_added_or_removed_is_changed(self):
        self.assertTrue(vc.changed(BASE, doc(countries=dict(BASE["countries"], JP=10))))
        self.assertTrue(vc.changed(BASE, doc(countries={"US": 120, "DE": 40})))

    def test_key_order_does_not_matter(self):
        self.assertFalse(vc.changed(BASE, doc(countries={"FR": 10, "DE": 40, "US": 120})))

    def test_a_raised_floor_is_changed(self):
        self.assertTrue(vc.changed(BASE, doc(minVisits=15)))

    def test_empty_documents(self):
        empty = {"updated": "2026-11-10", "minVisits": 10, "countries": {}}
        self.assertFalse(vc.changed(empty, dict(empty, updated="2026-12-01")))
        self.assertTrue(vc.changed(empty, BASE))

    def test_regions_key_present_is_compared(self):
        self.assertTrue(vc.changed(BASE, WITH_REGIONS))
        self.assertTrue(vc.changed(WITH_REGIONS, BASE))
        other = copy.deepcopy(WITH_REGIONS)
        other["regions"]["US-CA"] = 45
        self.assertTrue(vc.changed(WITH_REGIONS, other))
        self.assertFalse(vc.changed(WITH_REGIONS, dict(WITH_REGIONS, updated="2027-01-01")))

    def test_region_floor_changes_count_only_with_regions(self):
        raised = dict(copy.deepcopy(WITH_REGIONS), minRegionVisits=50)
        self.assertTrue(vc.changed(WITH_REGIONS, raised))
        # no regions at all: a leftover region floor publishes nothing, so it is not a change
        self.assertFalse(vc.changed(BASE, dict(copy.deepcopy(BASE), minRegionVisits=50, regions={})))

    def test_missing_and_empty_regions_are_the_same(self):
        self.assertFalse(vc.changed(BASE, dict(copy.deepcopy(BASE), regions={})))

    def test_malformed_documents_raise(self):
        for bad in ({}, {"minVisits": 10}, {"minVisits": 10, "countries": []},
                    {"minVisits": "10", "countries": {}}, {"minVisits": True, "countries": {}},
                    {"minVisits": 10, "countries": {"US": "12"}},
                    {"minVisits": 10, "countries": {"US": 12.5}},
                    {"minVisits": 10, "countries": {}, "regions": []},
                    {"minVisits": 10, "countries": {}, "regions": {"US-CA": None}}):
            with self.assertRaises(vc.Problem, msg=repr(bad)):
                vc.changed(BASE, bad)
            with self.assertRaises(vc.Problem, msg=repr(bad)):
                vc.changed(bad, BASE)


class Validate(unittest.TestCase):
    def test_the_documents_the_updater_writes_are_valid(self):
        self.assertEqual(vc.problems(BASE), [])
        self.assertEqual(vc.problems({"updated": "2026-11-10", "minVisits": 10, "countries": {}}), [])
        built = uv.build_document({"US": 123, "DE": 41, "FR": 9, "XX": 400}, 10)
        self.assertEqual(vc.problems(built), [])
        regional = uv.build_document({"US": 123}, 10, regions={"US-CA": 77, "US-TX": 20}, region_floor=25)
        self.assertEqual(vc.problems(regional, allow_regions=True), [])

    def test_the_committed_data_file_is_valid_and_equal_to_itself(self):
        path = os.path.join(ROOT, "data", "visitors.json")
        committed = vc.load(path)
        self.assertEqual(vc.problems(committed), [])
        self.assertFalse(vc.changed(committed, vc.load(path)))

    def test_extra_keys_are_refused(self):
        self.assertTrue(vc.problems(doc(ip="203.0.113.7")))
        self.assertTrue(vc.problems(doc(visits=5)))

    def test_missing_keys_are_refused(self):
        for key in ("updated", "minVisits", "countries"):
            d = doc()
            del d[key]
            self.assertTrue(any("missing key" in p for p in vc.problems(d)), key)

    def test_updated_must_be_a_date_only(self):
        for bad in ("2026-11-09T09:30:00Z", "2026-13-01", "09/11/2026", "", 20261109, None, "2026-11-09 ", "2026-11-09\n"):
            self.assertTrue(vc.problems(doc(updated=bad)), repr(bad))

    def test_country_codes_must_be_two_upper_case_letters(self):
        for bad in ("us", "USA", "U", "U1", "", " US", "US\n"):
            self.assertTrue(vc.problems(doc(countries={bad: 120})), repr(bad))

    def test_counts_must_be_whole_non_negative_numbers(self):
        for bad in (-5, 12.5, 120.0, "120", None, True, [120], float("nan")):
            self.assertTrue(vc.problems(doc(countries={"US": bad})), repr(bad))

    def test_the_floor_is_respected(self):
        self.assertTrue(vc.problems(doc(countries={"US": 5})))                    # below 10
        self.assertTrue(vc.problems(doc(countries={"US": 0})))
        self.assertTrue(vc.problems(doc(minVisits=5)))                            # file may not lower it
        self.assertTrue(vc.problems(doc(minVisits=50, countries={"US": 45})))     # file's own higher floor
        self.assertEqual(vc.problems(doc(minVisits=50, countries={"US": 50})), [])

    def test_counts_must_be_rounded_to_the_step(self):
        self.assertTrue(vc.problems(doc(countries={"US": 12})))
        self.assertTrue(vc.problems(doc(countries={"US": 11, "DE": 10})))

    def test_regions_are_refused_while_region_level_is_off(self):
        problems = vc.problems(WITH_REGIONS)
        self.assertTrue(any("regions" in p and "switched off" in p for p in problems), problems)
        self.assertTrue(vc.problems(doc(minRegionVisits=25)))

    def test_region_rules_when_allowed(self):
        ok = copy.deepcopy(WITH_REGIONS)
        self.assertEqual(vc.problems(ok, allow_regions=True), [])
        for regions in ({"US-CA": 20},                     # below the region floor of 25
                        {"US-CA": 37},                     # not a multiple of 5
                        {"JP-13": 40},                     # country JP is not published
                        {"us-ca": 40}, {"US_CA": 40}, {"US-": 40}, {"US-CA\n": 40},
                        {"US-CA": 40.0}, {"US-CA": "40"}, {"US-CA": True}):
            d = copy.deepcopy(WITH_REGIONS)
            d["regions"] = regions
            self.assertTrue(vc.problems(d, allow_regions=True), regions)
        d = copy.deepcopy(WITH_REGIONS)
        del d["minRegionVisits"]
        self.assertTrue(vc.problems(d, allow_regions=True))
        d = copy.deepcopy(WITH_REGIONS)
        d["minRegionVisits"] = 10                           # lower than the region floor
        self.assertTrue(vc.problems(d, allow_regions=True))
        d = copy.deepcopy(WITH_REGIONS)
        d["regions"] = []
        self.assertTrue(vc.problems(d, allow_regions=True))

    def test_region_floor_is_never_below_the_country_floor(self):
        d = {"updated": "2026-11-09", "minVisits": 50, "countries": {"US": 100},
             "minRegionVisits": 25, "regions": {"US-CA": 40}}
        self.assertTrue(vc.problems(d, allow_regions=True))     # 40 < the country floor of 50
        d["regions"] = {"US-CA": 50}
        self.assertEqual(vc.problems(d, allow_regions=True), [])

    def test_floors_come_from_the_updater(self):
        self.assertEqual(vc.MIN_FLOOR, uv.MIN_FLOOR)
        self.assertEqual(vc.MIN_REGION_FLOOR, uv.MIN_REGION_FLOOR)
        self.assertEqual(vc.ROUND_STEP, uv.ROUND_STEP)


class Summary(unittest.TestCase):
    def test_lists_countries_largest_first_then_by_code(self):
        d = doc(countries={"FR": 10, "US": 120, "DE": 40, "BR": 40})
        self.assertEqual(vc.summary(d), "- US: 120\n- BR: 40\n- DE: 40\n- FR: 10")

    def test_empty_document(self):
        self.assertIn("no country", vc.summary({"minVisits": 10, "countries": {}}))


class Load(unittest.TestCase):
    def write(self, text):
        fd, path = tempfile.mkstemp(suffix=".json")
        self.addCleanup(os.unlink, path)
        with os.fdopen(fd, "wb") as fh:
            fh.write(text if isinstance(text, bytes) else text.encode("utf-8"))
        return path

    def test_good_file(self):
        self.assertEqual(vc.load(self.write(json.dumps(BASE))), BASE)

    def test_bad_files_raise_problem(self):
        for text in ("", "not json", "[1, 2]", "42", '{"a": NaN}', '{"a": Infinity}', '{"a": 1, "a": 2}',
                     b"\xff\xfe\x00", "{" + " " * (vc.MAX_BYTES + 10) + "}"):
            with self.assertRaises(vc.Problem, msg=repr(text)[:40]):
                vc.load(self.write(text))
        with self.assertRaises(vc.Problem):
            vc.load(os.path.join(tempfile.gettempdir(), "no-such-file-visitors.json"))


class CommandLine(unittest.TestCase):
    def run_cli(self, *args):
        p = subprocess.run([sys.executable, "-I", SCRIPT] + list(args), stdout=subprocess.PIPE,
                           stderr=subprocess.PIPE, universal_newlines=True)
        return p.returncode, p.stdout, p.stderr

    def path(self, name, content):
        folder = self._dir.name
        full = os.path.join(folder, name)
        with open(full, "w", encoding="utf-8") as fh:
            fh.write(content if isinstance(content, str) else json.dumps(content))
        return full

    def setUp(self):
        self._dir = tempfile.TemporaryDirectory()
        self.addCleanup(self._dir.cleanup)

    def test_compare_prints_a_github_output_line_on_stdout_only(self):
        a, b = self.path("a.json", BASE), self.path("b.json", doc(updated="2026-12-01"))
        code, out, err = self.run_cli("compare", a, b)
        self.assertEqual((code, out), (0, "changed=false\n"))
        self.assertIn("unchanged", err)
        c = self.path("c.json", doc(countries={"US": 125}))
        code, out, err = self.run_cli("compare", a, c)
        self.assertEqual((code, out), (0, "changed=true\n"))
        self.assertIn("changed", err)

    def test_compare_with_a_malformed_file_exits_2_and_prints_no_output_line(self):
        a, bad = self.path("a.json", BASE), self.path("bad.json", "{oops")
        code, out, err = self.run_cli("compare", a, bad)
        self.assertEqual((code, out), (2, ""))
        self.assertIn("visitors_changed:", err)
        code, out, _ = self.run_cli("compare", a, os.path.join(self._dir.name, "missing.json"))
        self.assertEqual((code, out), (2, ""))

    def test_validate_exit_codes(self):
        good, bad = self.path("g.json", BASE), self.path("b.json", doc(countries={"US": 12}))
        self.assertEqual(self.run_cli("validate", good)[0], 0)
        code, _, err = self.run_cli("validate", bad)
        self.assertEqual(code, 1)
        self.assertIn("invalid:", err)
        self.assertEqual(self.run_cli("validate", self.path("x.json", "{oops"))[0], 2)
        reg = self.path("r.json", WITH_REGIONS)
        self.assertEqual(self.run_cli("validate", reg)[0], 1)
        self.assertEqual(self.run_cli("validate", "--allow-regions", reg)[0], 0)

    def test_summary_output(self):
        code, out, _ = self.run_cli("summary", self.path("s.json", BASE))
        self.assertEqual((code, out), (0, "- US: 120\n- DE: 40\n- FR: 10\n"))

    def test_usage_error(self):
        self.assertEqual(self.run_cli()[0], 2)
        self.assertEqual(self.run_cli("compare", "only-one.json")[0], 2)
        self.assertEqual(self.run_cli("explode", "a", "b")[0], 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)

#!/usr/bin/env python3
"""Guard for the pinned visit-count script: python3 scripts/test_count_js_pin.py

lib/count.js is an unmodified copy of the vendor's script, served from this site so that no code from
the vendor's host runs in a visitor's browser. These tests fail when the file changes without the pin
record in docs/visitors-layer.md being updated on purpose (see "The pinned count script" there), and
when the page is wired to load the script from anywhere but this site.

The tests read local files only. They make no network request.
"""
import hashlib
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COUNT_JS = os.path.join(ROOT, "lib", "count.js")
DOC = os.path.join(ROOT, "docs", "visitors-layer.md")
APP_JS = os.path.join(ROOT, "app.js")
INDEX_HTML = os.path.join(ROOT, "index.html")


def read(path):
    with open(path, "rb") as fh:
        return fh.read()


def pinned_hash():
    """The SHA-256 recorded in the pin record of docs/visitors-layer.md (exactly one such line)."""
    lines = re.findall(r"^- SHA-256: `([0-9a-fA-F]+)`\s*$", read(DOC).decode("utf-8"), re.MULTILINE)
    return lines


class PinnedCountScript(unittest.TestCase):
    def test_pin_record_has_exactly_one_full_length_hash(self):
        found = pinned_hash()
        self.assertEqual(len(found), 1, "docs/visitors-layer.md must hold exactly one '- SHA-256: `...`' line")
        self.assertEqual(len(found[0]), 64, "the recorded SHA-256 must be 64 hex characters")

    def test_file_matches_the_recorded_sha256(self):
        recorded = pinned_hash()[0].lower()
        actual = hashlib.sha256(read(COUNT_JS)).hexdigest()
        self.assertEqual(
            actual, recorded,
            "lib/count.js changed. If that was deliberate, follow the update procedure in "
            "docs/visitors-layer.md (read the whole new file, then update the pin record and CACHE in sw.js).")

    def test_recorded_size_matches(self):
        m = re.search(r"^- Size: (\d+) bytes\s*$", read(DOC).decode("utf-8"), re.MULTILINE)
        self.assertIsNotNone(m, "the pin record must state the size in bytes")
        self.assertEqual(int(m.group(1)), len(read(COUNT_JS)))

    def test_vendor_header_and_licence_are_kept(self):
        head = read(COUNT_JS).decode("utf-8").splitlines()[:2]
        self.assertEqual(head[0], "// GoatCounter: https://www.goatcounter.com")
        self.assertIn("ISC license", head[1])


class PageWiring(unittest.TestCase):
    def test_script_source_is_a_same_origin_path_to_an_existing_file(self):
        app = read(APP_JS).decode("utf-8")
        m = re.search(r"^const NA_ANALYTICS_SRC\s*=\s*'([^']*)'\s*;", app, re.MULTILINE)
        self.assertIsNotNone(m, "NA_ANALYTICS_SRC must be a single-quoted string constant")
        src = m.group(1)
        self.assertRegex(src, r"^\./[A-Za-z0-9_./-]+$", "NA_ANALYTICS_SRC must be a relative path under this site")
        self.assertNotIn("..", src)
        self.assertTrue(os.path.isfile(os.path.join(ROOT, src[2:])), "NA_ANALYTICS_SRC names a file that does not exist")
        self.assertEqual(src, "./lib/count.js")

    def test_script_src_names_no_host(self):
        html = read(INDEX_HTML).decode("utf-8")
        m = re.search(r'<meta http-equiv="Content-Security-Policy" content="([^"]*)"', html)
        self.assertIsNotNone(m, "index.html must carry a Content-Security-Policy meta tag")
        directives = {}
        for part in m.group(1).split(";"):
            tokens = part.split()
            if tokens:
                directives[tokens[0]] = tokens[1:]
        self.assertIn("script-src", directives)
        hosts = [t for t in directives["script-src"] if not t.startswith("'")]
        self.assertEqual(hosts, [], "script-src must not name a host; the count script is served from 'self'")

    def test_the_vendor_host_is_not_referenced_by_the_page(self):
        # Only the docs (pin record and update procedure) may name the vendor host.
        for path in (APP_JS, INDEX_HTML, os.path.join(ROOT, "sw.js")):
            self.assertNotIn("zgo.at", read(path).decode("utf-8"), os.path.basename(path) + " must not name the vendor host")


if __name__ == "__main__":
    unittest.main(verbosity=2)

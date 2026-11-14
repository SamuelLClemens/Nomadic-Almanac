#!/usr/bin/env python3
"""Tests for check_update_delivery.py and bump_version.py: python3 -I scripts/test_update_delivery.py

Every tree and repository below is built in a temporary directory from text defined in this file. The
only real repository files read are in RealTreeTests, which require the committed tree to pass the
guard. No network request and no secret; git runs only inside the temporary repositories.
"""
import os
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bump_version as bv  # noqa: E402
import check_update_delivery as cud  # noqa: E402

ROOT = os.path.dirname(HERE)

SW = """const CACHE = 'nomadic-v%(n)d';
const CORE = [
  './', './index.html', './app.js', './na-update.js',   // a comment with 'quotes' inside
  './data/countries.geojson',
];
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('/version.json')) return;
});
"""
MANIFEST = '{"id": "./", "start_url": "./", "scope": "./"}\n'

GIT_ENV = dict(os.environ, GIT_CONFIG_GLOBAL=os.devnull, GIT_CONFIG_NOSYSTEM="1",
               GIT_AUTHOR_NAME="Test", GIT_AUTHOR_EMAIL="test@example.invalid",
               GIT_COMMITTER_NAME="Test", GIT_COMMITTER_EMAIL="test@example.invalid")


def tree(n):
    return {
        "sw.js": SW % {"n": n},
        "version.json": '{"version": %d}\n' % n,
        "na-update.js": "(function () {\n  'use strict';\n  var VERSION = %d;\n})();\n" % n,
        "index.html": '<script defer src="na-update.js"></script>\n<p id="na-version-line"></p>\n',
        "app.js": "var a = 1;\n",
        "data/countries.geojson": "{}\n",
        "manifest.json": MANIFEST,
        "Nomadic-Almanac/index.html": '<meta http-equiv="refresh" content="0; url=../">\n',
    }


def put(root, rel, text):
    path = os.path.join(root, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)


def get(root, rel):
    with open(os.path.join(root, rel), encoding="utf-8") as fh:
        return fh.read()


def write_tree(root, n=64, overrides=None):
    files = tree(n)
    files.update(overrides or {})
    for rel, text in files.items():
        put(root, rel, text)


def git(root, *args):
    out = subprocess.run(["git", "-C", root] + list(args), env=GIT_ENV, stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE, universal_newlines=True)
    if out.returncode != 0:
        raise AssertionError("git %s failed: %s" % (" ".join(args), out.stderr))
    return out.stdout


def make_repo(root, n=64):
    git(root, "init", "-q")
    git(root, "checkout", "-q", "-b", "main")
    write_tree(root, n)
    git(root, "add", "-A")
    git(root, "commit", "-q", "-m", "base")
    git(root, "checkout", "-q", "-b", "work")


class ParserTests(unittest.TestCase):
    def test_cache_number(self):
        self.assertEqual(cud.cache_number("const CACHE = 'nomadic-v64';"), 64)
        self.assertEqual(cud.cache_number('const CACHE = "nomadic-v7";'), 7)
        self.assertIsNone(cud.cache_number("const CACHE = 'other-v3';"))
        self.assertIsNone(cud.cache_number(""))

    def test_core_list_ignores_comments(self):
        self.assertEqual(cud.core_list(SW % {"n": 1}),
                         ["./", "./index.html", "./app.js", "./na-update.js", "./data/countries.geojson"])
        self.assertIsNone(cud.core_list("const X = [];"))

    def test_page_number(self):
        self.assertEqual(cud.page_number("  var VERSION = 65;"), 65)
        self.assertIsNone(cud.page_number("var VERSIONS = 65;"))
        self.assertIsNone(cud.page_number("var VERSION = '65';"))

    def test_json_number(self):
        self.assertEqual(cud.json_number('{"version": 3}'), 3)
        self.assertIsNone(cud.json_number('{"version": "3"}'))
        self.assertIsNone(cud.json_number('{"version": true}'))
        self.assertIsNone(cud.json_number("not json"))
        self.assertIsNone(cud.json_number("[1]"))

    def test_exempt_paths(self):
        for path in ("docs/x.md", "scripts/a.py", ".github/workflows/a.yml", "README.md", "notes/b.md",
                     "data/visitors.json", "CNAME"):
            self.assertTrue(cud.is_exempt(path), path)
        for path in ("app.js", "style.css", "data/countries.geojson", "lib/leaflet.js",
                     "Nomadic-Almanac/index.html", "sw.js", "version.json", "manifest.json"):
            self.assertFalse(cud.is_exempt(path), path)


class TreeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = self.tmp.name
        write_tree(self.root)

    def tearDown(self):
        self.tmp.cleanup()

    def has(self, fragment):
        problems = cud.check_tree(self.root)
        self.assertTrue([p for p in problems if fragment in p],
                        "no problem mentioning %r in %r" % (fragment, problems))

    def test_clean_tree_passes(self):
        self.assertEqual(cud.check_tree(self.root), [])

    def test_each_number_must_agree(self):
        for rel, text in (("version.json", '{"version": 63}\n'),
                          ("na-update.js", "var VERSION = 63;\n"),
                          ("sw.js", SW % {"n": 63})):
            with self.subTest(file=rel):
                write_tree(self.root, 64, {rel: text})
                self.has("release numbers differ")

    def test_number_must_be_a_whole_number(self):
        write_tree(self.root, 64, {"version.json": '{"version": "64"}\n'})
        self.has("version in version.json is missing or not a whole number")

    def test_missing_core_file(self):
        os.remove(os.path.join(self.root, "app.js"))
        self.has("./app.js")
        self.has("install would fail")

    def test_na_update_must_be_precached(self):
        write_tree(self.root, 64, {"sw.js": (SW % {"n": 64}).replace("'./na-update.js', ", "")})
        self.has("must list ./na-update.js")

    def test_index_must_load_the_script(self):
        write_tree(self.root, 64, {"index.html": '<p id="na-version-line"></p>\n'})
        self.has("does not load na-update.js")

    def test_index_must_have_the_version_line(self):
        write_tree(self.root, 64, {"index.html": '<script defer src="na-update.js"></script>\n'})
        self.has("na-version-line")

    def test_worker_must_step_aside_for_version_json(self):
        text = (SW % {"n": 64}).replace("endsWith('/version.json')", "endsWith('/other.json')")
        write_tree(self.root, 64, {"sw.js": text})
        self.has("steps aside for /version.json")

    def test_redirect_page_is_required(self):
        os.remove(os.path.join(self.root, "Nomadic-Almanac", "index.html"))
        self.has("Nomadic-Almanac/index.html cannot be read")

    def test_redirect_page_must_redirect(self):
        write_tree(self.root, 64, {"Nomadic-Almanac/index.html": "<p>moved</p>\n"})
        self.has("must redirect to ../")

    def test_manifest_must_stay_relative(self):
        for key in ("start_url", "scope", "id"):
            with self.subTest(key=key):
                doc = {"id": "./", "start_url": "./", "scope": "./"}
                doc[key] = "/Nomadic-Almanac/"
                write_tree(self.root, 64, {"manifest.json": __import__("json").dumps(doc)})
                self.has("manifest.json %s must be a relative address" % key)

    def test_manifest_must_name_all_three(self):
        write_tree(self.root, 64, {"manifest.json": '{"start_url": "./", "scope": "./"}'})
        self.has("manifest.json id must be a relative address")


class BaseTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = self.tmp.name
        make_repo(self.root)

    def tearDown(self):
        self.tmp.cleanup()

    def commit_all(self):
        git(self.root, "add", "-A")
        git(self.root, "commit", "-q", "-m", "change")

    def test_no_change_passes(self):
        self.assertEqual(cud.check_base(self.root, "main"), [])

    def test_shipped_change_without_a_bump_fails(self):
        put(self.root, "app.js", "var a = 2;\n")
        self.commit_all()
        problems = cud.check_base(self.root, "main")
        self.assertEqual(len(problems), 1)
        self.assertIn("without a new release number", problems[0])
        self.assertIn("app.js", problems[0])
        self.assertIn("bump_version.py", problems[0])

    def test_shipped_change_with_a_bump_passes(self):
        put(self.root, "app.js", "var a = 2;\n")
        bv.bump(self.root)
        self.commit_all()
        self.assertEqual(cud.check_base(self.root, "main"), [])
        self.assertEqual(cud.check_tree(self.root), [])

    def test_uncommitted_change_is_seen_too(self):
        put(self.root, "app.js", "var a = 3;\n")
        self.assertEqual(len(cud.check_base(self.root, "main")), 1)

    def test_new_untracked_shipped_file_fails(self):
        put(self.root, "extra.js", "var b = 1;\n")
        self.assertIn("extra.js", cud.check_base(self.root, "main")[0])

    def test_changing_the_manifest_or_the_redirect_needs_a_bump(self):
        for rel in ("manifest.json", "Nomadic-Almanac/index.html"):
            with self.subTest(file=rel):
                git(self.root, "checkout", "-q", "--", ".")
                put(self.root, rel, get(self.root, rel) + "\n")
                self.assertEqual(len(cud.check_base(self.root, "main")), 1)

    def test_docs_scripts_workflows_and_the_data_refresh_need_no_bump(self):
        put(self.root, "docs/notes.md", "x\n")
        put(self.root, "scripts/tool.py", "x = 1\n")
        put(self.root, ".github/workflows/a.yml", "name: a\n")
        put(self.root, "data/visitors.json", "{}\n")
        put(self.root, "README.md", "x\n")
        self.commit_all()
        self.assertEqual(cud.check_base(self.root, "main"), [])

    def test_a_number_that_goes_down_fails(self):
        write_tree(self.root, 63)
        self.commit_all()
        self.assertIn("went down", cud.check_base(self.root, "main")[0])

    def test_an_unknown_base_is_reported(self):
        problems = cud.check_base(self.root, "no-such-ref")
        self.assertTrue(problems and "cannot" in problems[0])


class BumpTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = self.tmp.name
        write_tree(self.root, 64)

    def tearDown(self):
        self.tmp.cleanup()

    def numbers(self):
        return (cud.cache_number(get(self.root, "sw.js")), cud.json_number(get(self.root, "version.json")),
                cud.page_number(get(self.root, "na-update.js")))

    def test_adds_one_everywhere(self):
        self.assertEqual(bv.bump(self.root), (64, 65))
        self.assertEqual(self.numbers(), (65, 65, 65))
        self.assertEqual(cud.check_tree(self.root), [])

    def test_sets_a_chosen_number(self):
        self.assertEqual(bv.bump(self.root, 70), (64, 70))
        self.assertEqual(self.numbers(), (70, 70, 70))

    def test_the_number_must_go_up(self):
        with self.assertRaises(ValueError):
            bv.bump(self.root, 64)
        self.assertEqual(self.numbers(), (64, 64, 64))

    def test_files_that_disagree_are_left_alone(self):
        put(self.root, "version.json", '{"version": 63}\n')
        with self.assertRaises(ValueError):
            bv.bump(self.root)
        self.assertEqual(self.numbers(), (64, 63, 64))

    def test_a_missing_file_changes_nothing(self):
        os.remove(os.path.join(self.root, "na-update.js"))
        with self.assertRaises(ValueError):
            bv.bump(self.root)
        self.assertEqual(cud.cache_number(get(self.root, "sw.js")), 64)

    def test_a_number_held_twice_changes_nothing(self):
        put(self.root, "na-update.js", "var VERSION = 64;\nvar VERSION = 64;\n")
        with self.assertRaises(ValueError):
            bv.bump(self.root)
        self.assertEqual(cud.cache_number(get(self.root, "sw.js")), 64)

    def test_command_line(self):
        script = os.path.join(HERE, "bump_version.py")
        done = subprocess.run([sys.executable, "-I", script, "--root", self.root], stdout=subprocess.PIPE,
                              stderr=subprocess.PIPE, universal_newlines=True)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn("64 -> 65", done.stdout)
        os.remove(os.path.join(self.root, "version.json"))
        failed = subprocess.run([sys.executable, "-I", script, "--root", self.root], stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE, universal_newlines=True)
        self.assertEqual(failed.returncode, 1)
        self.assertIn("version.json", failed.stderr)

    def test_guard_command_line(self):
        script = os.path.join(HERE, "check_update_delivery.py")
        done = subprocess.run([sys.executable, "-I", script, "--root", self.root], stdout=subprocess.PIPE,
                              stderr=subprocess.PIPE, universal_newlines=True)
        self.assertEqual(done.returncode, 0, done.stdout + done.stderr)
        self.assertIn("ok (release 64)", done.stdout)
        os.remove(os.path.join(self.root, "app.js"))
        failed = subprocess.run([sys.executable, "-I", script, "--root", self.root], stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE, universal_newlines=True)
        self.assertEqual(failed.returncode, 1)
        self.assertIn("FAILED", failed.stdout)


class RealTreeTests(unittest.TestCase):
    def test_the_committed_tree_passes_the_guard(self):
        self.assertEqual(cud.check_tree(ROOT), [])


if __name__ == "__main__":
    unittest.main(verbosity=1)

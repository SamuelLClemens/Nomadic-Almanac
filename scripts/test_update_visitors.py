#!/usr/bin/env python3
"""Tests for update_visitors.py: python3 scripts/test_update_visitors.py

All data below is synthetic test input defined in this file. Nothing here is written to data/.
The tests never touch the internet: the HTTP call is replaced by a fake. The one exception is
NoRedirect, which talks to two throw-away servers on 127.0.0.1 to prove that a redirect is not followed.
"""
import datetime
import http.server
import io
import json
import os
import re
import sys
import tempfile
import threading
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import update_visitors as uv  # noqa: E402

TOKEN = "tok_TEST_not_a_real_key_0123456789"
NOW = datetime.datetime(2026, 11, 6, 9, 30, tzinfo=datetime.timezone.utc)


def page(rows, more=False):
    return {"more": more, "stats": [{"id": i, "name": "n", "count": c} for i, c in rows]}


class FakeApi:
    """Serves queued (status, payload) answers and records every call."""

    def __init__(self, answers):
        self.answers = list(answers)
        self.calls = []

    def __call__(self, url, token):
        self.calls.append((url, token))
        status, payload = self.answers.pop(0)
        return status, {}, payload


class ParseAndBuild(unittest.TestCase):
    def test_parse_keeps_only_two_letter_codes_and_whole_counts(self):
        rows = [("US", 120), ("de", 44), ("USA", 9), ("", 5), ("A1", 7), ("1.2.3.4", 8), ("::1", 6),
                ("FR", -1), ("JP", "17"), ("BR", True), ("NL", 3.5)]
        counts, more = uv.parse_locations(page(rows))
        self.assertEqual(counts, {"US": 120, "DE": 44})
        self.assertFalse(more)

    def test_parse_rejects_wrong_shape(self):
        for bad in (None, [], {}, {"stats": "x"}):
            with self.assertRaises(uv.UpdateError):
                uv.parse_locations(bad)

    def test_floor_drops_small_countries(self):
        doc = uv.build_document({"US": 120, "DE": 3, "FR": 2, "IT": 1}, 3, now=NOW)
        self.assertEqual(doc["countries"], {"US": 120, "DE": 3})
        self.assertEqual(doc["minVisits"], 3)
        self.assertEqual(doc["updated"], "2026-11-06T09:30:00Z")

    def test_floor_can_be_raised_but_never_lowered(self):
        doc = uv.build_document({"US": 120, "DE": 44, "FR": 9}, 10, now=NOW)
        self.assertEqual(list(doc["countries"]), ["US", "DE"])
        for low in (2, 1, 0, -5):
            with self.assertRaises(uv.UpdateError):
                uv.build_document({"US": 120}, low, now=NOW)

    def test_output_is_sorted_by_count_then_code(self):
        doc = uv.build_document({"BR": 5, "AR": 5, "US": 50}, 3, now=NOW)
        self.assertEqual(list(doc["countries"]), ["US", "AR", "BR"])

    def test_document_has_only_the_agreed_keys(self):
        doc = uv.build_document({"US": 9}, 3, now=NOW)
        self.assertEqual(sorted(doc), ["countries", "minVisits", "updated"])


class Fetch(unittest.TestCase):
    def test_follows_pagination_and_sends_the_token_only_in_the_header(self):
        api = FakeApi([(200, page([("US", 100), ("DE", 40)], more=True)), (200, page([("FR", 9)], more=False))])
        counts = uv.fetch_counts("example", TOKEN, datetime.datetime(2024, 1, 1, tzinfo=datetime.timezone.utc),
                                 now=NOW, get=api, sleep=lambda s: None)
        self.assertEqual(counts, {"US": 100, "DE": 40, "FR": 9})
        self.assertEqual(len(api.calls), 2)
        self.assertIn("offset=0", api.calls[0][0])
        self.assertIn("offset=2", api.calls[1][0])
        for url, tok in api.calls:
            self.assertTrue(url.startswith("https://example.goatcounter.com/api/v0/stats/locations?"))
            self.assertNotIn(TOKEN, url)
            self.assertEqual(tok, TOKEN)

    def test_rejected_key_message_never_contains_the_token(self):
        for status in (401, 403):
            api = FakeApi([(status, None)])
            with self.assertRaises(uv.UpdateError) as ctx:
                uv.fetch_counts("example", TOKEN, NOW, now=NOW, get=api, sleep=lambda s: None)
            self.assertNotIn(TOKEN, str(ctx.exception))

    def test_unknown_site_and_server_errors(self):
        for status in (404, 500, 502):
            with self.assertRaises(uv.UpdateError):
                uv.fetch_counts("example", TOKEN, NOW, now=NOW, get=FakeApi([(status, None)]), sleep=lambda s: None)

    def test_rate_limit_is_retried_once(self):
        api = FakeApi([(429, None), (200, page([("US", 9)]))])
        counts = uv.fetch_counts("example", TOKEN, NOW, now=NOW, get=api, sleep=lambda s: None)
        self.assertEqual(counts, {"US": 9})


class Config(unittest.TestCase):
    def test_token_rules(self):
        self.assertEqual(uv.clean_token("  abc123  "), "abc123")
        for bad in ("", "   ", None, "has space", "tab\there", "line\nbreak", "café"):
            with self.assertRaises(uv.UpdateError):
                uv.clean_token(bad)

    def test_site_rules(self):
        self.assertEqual(uv.clean_site(" My-Site "), "my-site")
        for bad in ("", None, "a.b", "a/b", "evil.example.com/x", "-x", "x" * 64, "a b"):
            with self.assertRaises(uv.UpdateError):
                uv.clean_site(bad)

    def test_site_is_read_from_app_js(self):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, "app.js")
            with open(p, "w", encoding="utf-8") as fh:
                fh.write("let a = 1;\nconst NA_ANALYTICS_SITE = 'Nomad-Site';\n")
            self.assertEqual(uv.site_from_app_js(p), "nomad-site")
            with open(p, "w", encoding="utf-8") as fh:
                fh.write("const NA_ANALYTICS_SITE = '';\n")
            self.assertEqual(uv.site_from_app_js(p), "")
            self.assertEqual(uv.site_from_app_js(os.path.join(d, "missing.js")), "")

    def test_real_app_js_site_code_is_empty_or_well_formed(self):
        # Collection was switched on by the owner (site code set in app.js). Whatever the value is,
        # it must be empty (off) or a well-formed code, the same shape app.js itself accepts, so a
        # typo can never point the beacon at another host.
        site = uv.site_from_app_js()
        self.assertTrue(site == "" or re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", site), "malformed NA_ANALYTICS_SITE: %r" % site)


class EndToEnd(unittest.TestCase):
    def run_main(self, out_path, answers, extra=(), env=None):
        api = FakeApi(answers)
        stream = io.StringIO()
        env = {"GOATCOUNTER_TOKEN": TOKEN, "GOATCOUNTER_SITE": "example"} if env is None else env
        # The fixtures use the site code "example", so the run must be told that is intended.
        code = uv.run(["--out", out_path, "--allow-other-site"] + list(extra), env=env, get=api, now=NOW, out_stream=stream)
        return code, stream.getvalue(), api

    def test_writes_file_and_output_never_shows_token(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "data", "visitors.json")
            code, text, _api = self.run_main(out, [(200, page([("US", 120), ("DE", 44), ("FR", 2)]))])
            self.assertEqual(code, 0)
            self.assertNotIn(TOKEN, text)
            with open(out, encoding="utf-8") as fh:
                raw = fh.read()
            self.assertNotIn(TOKEN, raw)
            doc = json.loads(raw)
            self.assertEqual(doc["countries"], {"US": 120, "DE": 44})
            self.assertEqual(os.listdir(os.path.dirname(out)), ["visitors.json"])   # no temp file left behind

    def test_failure_leaves_the_existing_file_untouched(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            with open(out, "w", encoding="utf-8") as fh:
                fh.write('{"keep": "me"}')
            with self.assertRaises(uv.UpdateError):
                self.run_main(out, [(500, None)])
            with open(out, encoding="utf-8") as fh:
                self.assertEqual(fh.read(), '{"keep": "me"}')

    def test_empty_result_does_not_replace_a_file_that_has_countries(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            with open(out, "w", encoding="utf-8") as fh:
                json.dump({"countries": {"US": 9}}, fh)
            with self.assertRaises(uv.UpdateError):
                self.run_main(out, [(200, page([("US", 1)]))])
            code, _t, _a = self.run_main(out, [(200, page([("US", 1)]))], extra=["--allow-empty"])
            self.assertEqual(code, 0)
            with open(out, encoding="utf-8") as fh:
                self.assertEqual(json.load(fh)["countries"], {})

    def test_empty_result_creates_an_honest_empty_file_when_none_exists(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            code, _t, _a = self.run_main(out, [(200, page([]))])
            self.assertEqual(code, 0)
            with open(out, encoding="utf-8") as fh:
                self.assertEqual(json.load(fh)["countries"], {})

    def test_dry_run_writes_nothing(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            code, text, _a = self.run_main(out, [(200, page([("US", 120)]))], extra=["--dry-run"])
            self.assertEqual(code, 0)
            self.assertFalse(os.path.exists(out))
            self.assertIn("nothing written", text)

    def test_missing_token_and_low_minimum_are_refused_before_any_request(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            api = FakeApi([])
            with self.assertRaises(uv.UpdateError):
                uv.run(["--out", out], env={"GOATCOUNTER_SITE": "example"}, get=api, now=NOW, out_stream=io.StringIO())
            with self.assertRaises(uv.UpdateError):
                uv.run(["--out", out, "--allow-other-site", "--min-visits", "1"],
                       env={"GOATCOUNTER_TOKEN": TOKEN, "GOATCOUNTER_SITE": "example"},
                       get=api, now=NOW, out_stream=io.StringIO())
            self.assertEqual(api.calls, [])


class SiteBinding(unittest.TestCase):
    """The key may only be sent to the site this repository owns, unless the run says otherwise."""

    def run_site(self, argv, env_site=None, answers=()):
        env = {"GOATCOUNTER_TOKEN": TOKEN}
        if env_site is not None:
            env["GOATCOUNTER_SITE"] = env_site
        api = FakeApi(answers)
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            result = uv.run(["--out", out, "--dry-run"] + list(argv), env=env, get=api, now=NOW, out_stream=io.StringIO())
        return result, api

    def test_other_site_from_the_environment_is_refused_before_any_request(self):
        api = FakeApi([])
        with self.assertRaises(uv.UpdateError) as ctx:
            uv.run(["--dry-run"], env={"GOATCOUNTER_TOKEN": TOKEN, "GOATCOUNTER_SITE": "someone-else"},
                   get=api, now=NOW, out_stream=io.StringIO())
        self.assertEqual(api.calls, [])
        self.assertNotIn(TOKEN, str(ctx.exception))
        self.assertIn("someone-else", str(ctx.exception))

    def test_other_site_from_the_command_line_is_refused_before_any_request(self):
        api = FakeApi([])
        with self.assertRaises(uv.UpdateError):
            uv.run(["--dry-run", "--site", "someone-else"], env={"GOATCOUNTER_TOKEN": TOKEN}, get=api, now=NOW,
                   out_stream=io.StringIO())
        self.assertEqual(api.calls, [])

    def test_the_expected_site_is_accepted_and_is_the_only_host_called(self):
        code, api = self.run_site(["--site", uv.EXPECTED_SITE], answers=[(200, page([("US", 9)]))])
        self.assertEqual(code, 0)
        self.assertEqual(len(api.calls), 1)
        self.assertTrue(api.calls[0][0].startswith("https://%s.goatcounter.com/api/v0/stats/locations?" % uv.EXPECTED_SITE))

    def test_the_explicit_flag_allows_another_site(self):
        code, api = self.run_site(["--site", "my-own-test", "--allow-other-site"], answers=[(200, page([("US", 9)]))])
        self.assertEqual(code, 0)
        self.assertTrue(api.calls[0][0].startswith("https://my-own-test.goatcounter.com/"))

    def test_app_js_names_the_expected_site_or_none(self):
        # Switching counting to another account must be a visible change here as well as in app.js.
        self.assertIn(uv.site_from_app_js(), ("", uv.EXPECTED_SITE))


class NoRedirect(unittest.TestCase):
    """A redirect must never carry the Authorization header to another address."""

    def serve(self, handler):
        server = http.server.HTTPServer(("127.0.0.1", 0), handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        return server

    def test_http_get_reports_a_redirect_and_sends_nothing_to_the_new_address(self):
        reached = []

        class Target(http.server.BaseHTTPRequestHandler):
            def do_GET(self):
                reached.append(self.headers.get("Authorization"))
                body = b'{"stats": [], "more": false}'
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *args):
                pass

        target = self.serve(Target)

        class Redirector(http.server.BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(302)
                self.send_header("Location", "http://localhost:%d/api/v0/stats/locations" % target.server_port)
                self.send_header("Content-Length", "0")
                self.end_headers()

            def log_message(self, *args):
                pass

        redirector = self.serve(Redirector)
        status, _headers, payload = uv.http_get("http://127.0.0.1:%d/api/v0/stats/locations" % redirector.server_port, TOKEN)
        self.assertEqual(status, 302)
        self.assertIsNone(payload)
        self.assertEqual(reached, [])          # the second server was never contacted, so it saw no token

    def test_a_redirect_is_an_error_that_does_not_show_the_token(self):
        for status in (301, 302, 307, 308):
            with self.assertRaises(uv.UpdateError) as ctx:
                uv.fetch_counts("example", TOKEN, NOW, now=NOW, get=FakeApi([(status, None)]), sleep=lambda s: None)
            self.assertIn("redirect", str(ctx.exception))
            self.assertNotIn(TOKEN, str(ctx.exception))


if __name__ == "__main__":
    unittest.main(verbosity=2)

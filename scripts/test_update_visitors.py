#!/usr/bin/env python3
"""Tests for update_visitors.py: python3 scripts/test_update_visitors.py

All data below is synthetic test input defined in this file. Nothing here is written to data/.
The tests never touch the internet: the HTTP call is replaced by a fake. The one exception is
NoRedirect, which talks to two throw-away servers on 127.0.0.1 to prove that a redirect is not followed.
"""
import contextlib
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

    def test_floor_is_ten_and_rounding_step_is_five(self):
        self.assertEqual(uv.MIN_FLOOR, 10)
        self.assertEqual(uv.ROUND_STEP, 5)

    def test_floor_drops_small_countries(self):
        doc = uv.build_document({"US": 120, "DE": 10, "FR": 9, "IT": 3, "ES": 1}, 10, now=NOW)
        self.assertEqual(doc["countries"], {"US": 120, "DE": 10})
        self.assertEqual(doc["minVisits"], 10)

    def test_floor_can_be_raised_but_never_lowered(self):
        doc = uv.build_document({"US": 120, "DE": 44, "FR": 19}, 20, now=NOW)
        self.assertEqual(list(doc["countries"]), ["US", "DE"])
        self.assertEqual(doc["minVisits"], 20)
        for low in (9, 5, 3, 2, 1, 0, -5):
            with self.assertRaises(uv.UpdateError):
                uv.build_document({"US": 120}, low, now=NOW)

    def test_counts_are_rounded_down_to_a_multiple_of_five(self):
        self.assertEqual([uv.round_down(n) for n in (0, 4, 5, 9, 10, 12, 14, 15, 37, 120, 121)],
                         [0, 0, 5, 5, 10, 10, 10, 15, 35, 120, 120])
        doc = uv.build_document({"US": 121, "DE": 37, "FR": 14, "IT": 12, "ES": 10, "PT": 9, "NL": 5}, 10, now=NOW)
        self.assertEqual(doc["countries"], {"US": 120, "DE": 35, "FR": 10, "IT": 10, "ES": 10})
        for n in doc["countries"].values():
            self.assertEqual(n % 5, 0)

    def test_rounding_is_downward_only_so_it_never_overstates(self):
        for n in range(0, 400):
            self.assertLessEqual(uv.round_down(n), n)
            self.assertLess(n - uv.round_down(n), 5)

    def test_floor_is_tested_on_the_published_rounded_value(self):
        # With a floor of 12, a raw 14 would publish as 10, which is below the floor it advertises,
        # so the country is dropped; a raw 17 publishes as 15 and is kept.
        doc = uv.build_document({"US": 17, "DE": 14, "FR": 12}, 12, now=NOW)
        self.assertEqual(doc["countries"], {"US": 15})
        self.assertTrue(all(n >= doc["minVisits"] for n in doc["countries"].values()))

    def test_one_extra_visit_usually_changes_nothing_in_the_file(self):
        # A single visit may change the published file only when it carries the raw count across a
        # multiple of five. For every other raw count the two documents are identical.
        changed = []
        for n in range(0, 300):
            a = uv.build_document({"US": n}, 10, now=NOW)
            b = uv.build_document({"US": n + 1}, 10, now=NOW)
            if a != b:
                changed.append(n + 1)
        self.assertTrue(changed)
        for n in changed:
            self.assertEqual(n % 5, 0, "a change at raw count %d is not at a multiple of 5" % n)
        self.assertEqual(len(changed), 59)          # 10, 15, ..., 295 (every multiple of 5 from the floor)

    def test_updated_is_a_date_with_no_time(self):
        doc = uv.build_document({"US": 120}, 10, now=NOW)
        self.assertEqual(doc["updated"], "2026-11-06")
        self.assertRegex(doc["updated"], r"^\d{4}-\d{2}-\d{2}$")
        self.assertNotIn("T", doc["updated"])
        self.assertNotIn(":", doc["updated"])
        self.assertNotIn("09:30", json.dumps(doc))
        # Midnight and late evening give the same shape (a date, never a time).
        late = datetime.datetime(2026, 11, 6, 23, 59, 59, tzinfo=datetime.timezone.utc)
        self.assertEqual(uv.build_document({}, 10, now=late)["updated"], "2026-11-06")

    def test_empty_document_is_honest(self):
        doc = uv.build_document({}, 10, now=NOW)
        self.assertEqual(doc, {"updated": "2026-11-06", "minVisits": 10, "countries": {}})

    def test_output_is_sorted_by_count_then_code(self):
        doc = uv.build_document({"BR": 15, "AR": 15, "US": 50}, 10, now=NOW)
        self.assertEqual(list(doc["countries"]), ["US", "AR", "BR"])
        # Rounding can create a tie; the code then breaks it, so the order is stable.
        tied = uv.build_document({"BR": 17, "AR": 15}, 10, now=NOW)
        self.assertEqual(list(tied["countries"]), ["AR", "BR"])

    def test_document_has_only_the_agreed_keys(self):
        doc = uv.build_document({"US": 19}, 10, now=NOW)
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
        for status, answers in ((404, [(404, None)] * 3), (500, [(500, None)]), (502, [(502, None)])):
            with self.assertRaises(uv.UpdateError), contextlib.redirect_stderr(io.StringIO()):
                uv.fetch_counts("example", TOKEN, NOW, now=NOW, get=FakeApi(answers), sleep=lambda s: None)

    def test_rate_limit_is_retried_once(self):
        api = FakeApi([(429, None), (200, page([("US", 9)]))])
        counts = uv.fetch_counts("example", TOKEN, NOW, now=NOW, get=api, sleep=lambda s: None)
        self.assertEqual(counts, {"US": 9})


class NotFoundRetry(unittest.TestCase):
    """The service has answered "site not found" (HTTP 404) to the first request of a run and then answered
    normally on the next call (2026-11-10 from a Mac, 2026-11-11 from a GitHub runner), so one 404 must not
    fail a scheduled run. A site that does not exist must still fail. Nothing here sleeps for real."""

    def fetch(self, answers):
        api, waits, err = FakeApi(answers), [], io.StringIO()
        with contextlib.redirect_stderr(err):
            try:
                result = uv.fetch_counts("example", TOKEN, NOW, now=NOW, get=api, sleep=waits.append)
            except uv.UpdateError as exc:
                result = exc
        return result, api, waits, err.getvalue()

    def test_the_waits_are_five_then_fifteen_seconds(self):
        self.assertEqual(uv.NOT_FOUND_WAITS, (5, 15))

    def test_one_404_then_success_gives_the_counts_after_one_wait(self):
        result, api, waits, err = self.fetch([(404, None), (200, page([("US", 120)]))])
        self.assertEqual(result, {"US": 120})
        self.assertEqual(len(api.calls), 2)
        self.assertEqual(waits, [5])
        self.assertEqual(api.calls[0], api.calls[1])                 # the same request, same address, same key
        self.assertIn("HTTP 404", err)
        self.assertIn("retry 1 of 2", err)

    def test_two_404s_then_success_waits_five_then_fifteen(self):
        result, api, waits, err = self.fetch([(404, None), (404, None), (200, page([("US", 120)]))])
        self.assertEqual(result, {"US": 120})
        self.assertEqual(len(api.calls), 3)
        self.assertEqual(waits, [5, 15])
        self.assertIn("retry 2 of 2", err)

    def test_three_404s_in_a_row_still_fail_with_the_not_found_message_after_exactly_three_requests(self):
        result, api, waits, err = self.fetch([(404, None)] * 3)
        self.assertIsInstance(result, uv.UpdateError)
        self.assertIn("Site 'example' was not found (HTTP 404)", str(result))
        self.assertEqual(len(api.calls), 3)
        self.assertEqual(waits, [5, 15])

    def test_a_404_on_a_later_page_is_retried_too(self):
        result, api, waits, _err = self.fetch([(200, page([("US", 100)], more=True)), (404, None),
                                               (200, page([("DE", 40)]))])
        self.assertEqual(result, {"US": 100, "DE": 40})
        self.assertIn("offset=1", api.calls[1][0])
        self.assertEqual(api.calls[1], api.calls[2])
        self.assertEqual(waits[:1], [0.3])                           # the pause between pages, then the 404 wait
        self.assertEqual(waits[1:], [5])

    def test_the_retry_line_never_shows_the_token_or_the_address(self):
        _result, _api, _waits, err = self.fetch([(404, None), (200, page([("US", 120)]))])
        self.assertNotIn(TOKEN, err)
        self.assertNotIn("goatcounter.com", err)
        self.assertNotIn("http", err.lower().replace("http 404", ""))

    def test_only_404_and_429_are_retried(self):
        for status in (401, 403, 500, 502, 503, 301, 302, 307, 308):
            result, api, waits, err = self.fetch([(status, None), (200, page([("US", 120)]))])
            self.assertIsInstance(result, uv.UpdateError, status)
            self.assertEqual(len(api.calls), 1, "status %d must not be retried" % status)
            self.assertEqual(waits, [], status)
            self.assertEqual(err, "", status)

    def test_a_429_keeps_its_single_retry_and_a_404_after_it_gets_its_own(self):
        result, api, waits, _err = self.fetch([(429, None), (404, None), (200, page([("US", 120)]))])
        self.assertEqual(result, {"US": 120})
        self.assertEqual(len(api.calls), 3)
        self.assertEqual(waits, [2, 5])
        result, api, waits, _err = self.fetch([(429, None), (429, None), (200, page([("US", 120)]))])
        self.assertIsInstance(result, uv.UpdateError)                # a second 429 is still reported, as before
        self.assertEqual(len(api.calls), 2)

    def test_run_survives_a_single_404_end_to_end(self):
        # The whole script, with the same fake service: first call 404, then a normal answer.
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "visitors.json")
            api = FakeApi([(404, None), (200, page([("US", 123), ("DE", 41)]))])
            stream, waits = io.StringIO(), []
            with contextlib.redirect_stderr(io.StringIO()):
                code = uv.run(["--out", out, "--allow-other-site"],
                              env={"GOATCOUNTER_TOKEN": TOKEN, "GOATCOUNTER_SITE": "example"},
                              get=api, now=NOW, out_stream=stream, sleep=waits.append)
            self.assertEqual(code, 0)
            self.assertEqual(waits, [5])
            with open(out, encoding="utf-8") as fh:
                self.assertEqual(json.load(fh)["countries"], {"US": 120, "DE": 40})


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


class CommittedFileAndFloors(unittest.TestCase):
    """The floor lives in two independent places (here and in app.js), and data/visitors.json is
    published history, so both are checked against the contract."""

    def test_app_js_floor_equals_the_updater_floor(self):
        with open(uv.APP_JS, encoding="utf-8") as fh:
            m = re.search(r"const\s+NA_VISITORS_FLOOR\s*=\s*(\d+)\s*;", fh.read())
        self.assertIsNotNone(m, "NA_VISITORS_FLOOR not found in app.js")
        self.assertEqual(int(m.group(1)), uv.MIN_FLOOR)

    def test_committed_data_file_obeys_the_contract(self):
        with open(uv.DEFAULT_OUT, encoding="utf-8") as fh:
            doc = json.load(fh)
        self.assertEqual(sorted(doc), ["countries", "minVisits", "updated"])
        self.assertRegex(doc["updated"], r"^\d{4}-\d{2}-\d{2}$")       # a date, no time
        self.assertGreaterEqual(doc["minVisits"], uv.MIN_FLOOR)
        for code, n in doc["countries"].items():
            self.assertRegex(code, r"^[A-Z]{2}$")
            self.assertIsInstance(n, int)
            self.assertEqual(n % uv.ROUND_STEP, 0, "%s is not a multiple of %d" % (code, uv.ROUND_STEP))
            self.assertGreaterEqual(n, doc["minVisits"], "%s is below the floor" % code)


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
            self.assertEqual(doc["countries"], {"US": 120, "DE": 40})                # 44 is published as 40
            self.assertEqual(doc["updated"], "2026-11-06")                           # a date, no time
            self.assertEqual(doc["minVisits"], 10)
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
            for low in ("1", "3", "9"):
                with self.assertRaises(uv.UpdateError):
                    uv.run(["--out", out, "--allow-other-site", "--min-visits", low],
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

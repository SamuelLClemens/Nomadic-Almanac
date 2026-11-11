#!/usr/bin/env python3
"""Guard for the Content-Security-Policy in index.html: python3 scripts/test_csp_policy.py

The policy is a <meta> tag, so it is only as good as the page keeps it. These tests fail when:
  - 'unsafe-inline' (or 'unsafe-eval', a wildcard or a bare scheme) comes back to script-src;
  - connect-src or img-src names a bare scheme such as https:, a bare *, or a plain-http host;
  - an inline event-handler attribute or a javascript: URL appears in index.html or app.js;
  - the hash of an inline script no longer matches the policy (the test prints the new value);
  - a host that the code talks to is not allowed by the policy, or the policy lists a host that the
    code no longer uses (so the list cannot grow without a reason);
  - the data-na-act names in generated HTML do not match the dispatch table in app.js.
docs/csp.md explains each rule and how to add a host.

The tests read local files only. They make no network request.
"""
import base64
import hashlib
import os
import re
import unittest
from html.parser import HTMLParser
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_HTML = os.path.join(ROOT, "index.html")
APP_JS = os.path.join(ROOT, "app.js")
SW_JS = os.path.join(ROOT, "sw.js")
CODE_FILES = [APP_JS, os.path.join(ROOT, "data.js"), os.path.join(ROOT, "na-boot.js")]


def read(path):
    with open(path, "rb") as fh:
        return fh.read().decode("utf-8")


# --- policy parsing and source matching ---------------------------------------------------------

def policy_text(html):
    found = re.findall(r'<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]*)"', html)
    if len(found) != 1:
        raise AssertionError("index.html must carry exactly one Content-Security-Policy meta tag, found %d" % len(found))
    return found[0]


def parse_policy(text):
    directives = {}
    for part in text.split(";"):
        tokens = part.split()
        if not tokens:
            continue
        if tokens[0] in directives:
            raise AssertionError("duplicate directive %s (browsers ignore the second one)" % tokens[0])
        directives[tokens[0]] = tokens[1:]
    return directives


def host_sources(tokens):
    """The host-source expressions of a directive (not keywords, not bare schemes)."""
    return [t for t in tokens if not t.startswith("'") and not t.endswith(":")]


def source_allows(source, url):
    """CSP3 host-source matching, enough for this policy: scheme, host (leading *. wildcard), path.

    A path ending in "/" matches by prefix; any other path must match exactly (the query is ignored).
    """
    m = re.match(r"^(?:(https?)://)?(\*\.)?([A-Za-z0-9.-]+)(?::(\d+))?(/.*)?$", source)
    if not m:
        raise AssertionError("cannot read source expression %r" % source)
    scheme, wildcard, host, port, path = m.groups()
    u = urlparse(url)
    if scheme and u.scheme != scheme:
        return False
    uhost = (u.hostname or "").lower()
    if wildcard:
        if not uhost.endswith("." + host.lower()):
            return False
    elif uhost != host.lower():
        return False
    if port and str(u.port or "") != port:
        return False
    if path:
        if path.endswith("/"):
            return u.path.startswith(path)
        return u.path == path
    return True


def allowed_by(tokens, url):
    return any(source_allows(s, url) for s in host_sources(tokens))


# --- inline scripts, handlers --------------------------------------------------------------------

class PageScan(HTMLParser):
    """Collects inline script bodies and every attribute that could run script, ignoring comments."""

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.inline_scripts = []
        self.handler_attrs = []
        self.js_urls = []
        self._buf = None

    def handle_starttag(self, tag, attrs):
        names = dict(attrs)
        for name, value in attrs:
            if name.lower().startswith("on"):
                self.handler_attrs.append("<%s %s>" % (tag, name))
            if name.lower() in ("href", "src", "action", "formaction", "xlink:href", "data") and \
                    re.match(r"^\s*javascript:", value or "", re.I):
                self.js_urls.append("<%s %s=%r>" % (tag, name, (value or "")[:40]))
        if tag == "script":
            self._buf = None if "src" in names else []

    def handle_data(self, data):
        if self._buf is not None:
            self._buf.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self._buf is not None:
            self.inline_scripts.append("".join(self._buf))
            self._buf = None


def sha256_source(body):
    return "'sha256-%s'" % base64.b64encode(hashlib.sha256(body.encode("utf-8")).digest()).decode()


# The event-handler attributes a string of generated HTML could carry. A name outside this list is not
# a handler; a name inside it, written as an attribute (preceded by whitespace or a quote, followed by =
# and a quote), is. "el.onclick = fn" (a property assignment, which the policy allows) has a dot before it.
HANDLER_NAMES = (r"click|dblclick|auxclick|mouse\w+|key\w+|change|input|invalid|submit|reset|focus\w*|blur|load|unload|"
                 r"beforeunload|error|abort|resize|scroll|select|toggle|wheel|contextmenu|touch\w+|pointer\w+|drag\w*|drop|"
                 r"animation\w+|transition\w+|copy|cut|paste|hashchange|popstate|message|search|play|pause|ended")
HANDLER_IN_STRING = re.compile(r"""(?:^|[\s"'`<])on(?:%s)\s*=\s*\\?["']""" % HANDLER_NAMES, re.I)
SET_ATTRIBUTE_HANDLER = re.compile(r"""setAttribute\(\s*["']on[a-z]+["']""", re.I)
JS_URL_IN_STRING = re.compile(r"""["'`(=]\s*javascript\s*:""", re.I)


def strip_line_comments(text):
    """Drop // comments (not the // inside https://) so a URL or example in a comment is not scanned."""
    return "\n".join(re.sub(r"(?<![:'\"\w])//.*$", "", line) for line in text.split("\n"))


# --- host inventory ------------------------------------------------------------------------------

URL_LITERAL = re.compile(r"https://[A-Za-z0-9._{}$*-]+(?:/[^\s'\"`<>)\\]*)?")

# Hosts that appear in the code only as links the visitor clicks or as text. Navigation is not
# governed by connect-src or img-src, so these need no policy entry. Anything else must be in the policy.
NAVIGATION_ONLY = {
    "nomadicalmanac.com",              # own domain (canonical link)
    "samuellclemens.github.io",        # own Pages address
    "www.openstreetmap.org", "osm.org",  # attribution links in map credits
    "opentopomap.org", "openrailwaymap.org", "openseamap.org", "hiking.waymarkedtrails.org",
    "www.geoboundaries.org",           # attribution link
    "www.google.com",                  # Flights and Map hand-off links
    "www.rome2rio.com", "www.getyourguide.com", "www.booking.com",  # trip hand-off links
}

# A wildcard is allowed only where the provider rotates subdomains the app cannot list. Each entry is the
# exact source expression and the reason; docs/csp.md repeats this table.
WILDCARDS = {
    "https://*.tile.opentopomap.org": "OpenTopoMap serves tiles from a.tile, b.tile and c.tile",
    "https://*.tiles.openrailwaymap.org": "OpenRailwayMap serves tiles from a.tiles, b.tiles and c.tiles",
    "https://*.openseamap.org": "OpenSeaMap serves tiles from t1, t2 and t3",
}

# Entries that are kept although no literal in the code names them. Each must say why.
KEPT_WITHOUT_LITERAL = {
    "https://nomadicalmanac.goatcounter.com": "built from NA_ANALYTICS_SITE (checked separately below)",
}


def template_to_url(raw):
    """Fill the placeholders of a tile template or a JS template literal so the URL can be matched."""
    url = re.sub(r"\$\{[^}]*\}", "x", raw)
    url = url.replace("{s}", "a").replace("{z}", "1").replace("{x}", "1").replace("{y}", "1")
    return url.rstrip("'\",;")


def code_urls():
    urls = []
    for path in CODE_FILES:
        if not os.path.exists(path):
            continue
        for raw in URL_LITERAL.findall(strip_line_comments(read(path))):
            urls.append((os.path.basename(path), template_to_url(raw)))
    return urls


def analytics_site():
    m = re.search(r"^const NA_ANALYTICS_SITE\s*=\s*'([^']*)'", read(APP_JS), re.M)
    return m.group(1) if m else ""


HTML = read(INDEX_HTML)
POLICY = parse_policy(policy_text(HTML))
FETCH_DIRECTIVES = ("connect-src", "img-src", "font-src", "style-src", "script-src", "worker-src", "manifest-src", "default-src")


class ScriptSrc(unittest.TestCase):
    def test_script_src_is_self_plus_hashes_only(self):
        tokens = POLICY["script-src"]
        self.assertIn("'self'", tokens)
        for t in tokens:
            self.assertTrue(t == "'self'" or re.match(r"^'sha256-[A-Za-z0-9+/]{43}='$", t),
                            "script-src may hold 'self' and sha256 hashes of inline blocks, not %r" % t)

    def test_unsafe_inline_is_only_ever_in_style_src(self):
        for name, tokens in POLICY.items():
            if name == "style-src":
                continue
            for bad in ("'unsafe-inline'", "'unsafe-eval'", "'unsafe-hashes'", "'strict-dynamic'"):
                self.assertNotIn(bad, tokens, "%s must not contain %s" % (name, bad))

    def test_style_src_gap_is_still_documented(self):
        # style-src keeps 'unsafe-inline' (generated HTML sets many inline styles). If that is ever
        # removed, update docs/csp.md ("Remaining gap") and the comment in index.html with it.
        self.assertIn("'unsafe-inline'", POLICY["style-src"])
        self.assertIn("style-src", read(os.path.join(ROOT, "docs", "csp.md")))

    def test_fixed_directives_are_kept(self):
        self.assertEqual(POLICY["default-src"], ["'self'"])
        self.assertEqual(POLICY["object-src"], ["'none'"])
        self.assertEqual(POLICY["base-uri"], ["'self'"])
        self.assertEqual(POLICY["form-action"], ["'self'"])
        self.assertEqual(POLICY["worker-src"], ["'self'"])
        self.assertEqual(POLICY["manifest-src"], ["'self'"])


class InlineScriptHashes(unittest.TestCase):
    def setUp(self):
        self.scan = PageScan()
        self.scan.feed(HTML)

    def test_every_inline_script_is_allowed_by_exactly_its_hash(self):
        computed = [sha256_source(b) for b in self.scan.inline_scripts]
        listed = [t for t in POLICY["script-src"] if t.startswith("'sha256-")]
        self.assertEqual(sorted(computed), sorted(listed),
                         "the inline script blocks in index.html and the sha256 entries of script-src differ.\n"
                         "Inline blocks hash to: %s\nscript-src lists:     %s\n"
                         "Put the first list into script-src (docs/csp.md, 'Changing the inline block')."
                         % (computed, listed))

    def test_inline_blocks_are_the_expected_few(self):
        # One block today (the loading-overlay safety valve). A second one needs a reason in docs/csp.md.
        self.assertEqual(len(self.scan.inline_scripts), 1)
        self.assertIn("_loTimer", self.scan.inline_scripts[0])

    def test_hash_would_catch_a_one_character_edit(self):
        body = self.scan.inline_scripts[0]
        self.assertNotEqual(sha256_source(body), sha256_source(body + " "))


class NoInlineHandlers(unittest.TestCase):
    def test_index_html_has_no_handler_attributes_or_javascript_urls(self):
        scan = PageScan()
        scan.feed(HTML)
        self.assertEqual(scan.handler_attrs, [], "inline event-handler attributes in index.html")
        self.assertEqual(scan.js_urls, [], "javascript: URLs in index.html")

    def test_javascript_files_build_no_handler_attributes(self):
        for path in CODE_FILES:
            if not os.path.exists(path):
                continue
            text = strip_line_comments(read(path))
            hits = [m.group(0).strip() for m in HANDLER_IN_STRING.finditer(text)]
            self.assertEqual(hits, [], "%s builds inline handler attributes %s; use data-na-act (app.js, NA_ACTIONS)"
                             % (os.path.basename(path), hits[:3]))
            self.assertIsNone(SET_ATTRIBUTE_HANDLER.search(text), "%s sets a handler with setAttribute" % os.path.basename(path))
            self.assertIsNone(JS_URL_IN_STRING.search(text), "%s contains a javascript: URL" % os.path.basename(path))

    def test_detectors_catch_what_they_claim_to(self):
        # Proves the patterns above are not vacuous.
        self.assertTrue(HANDLER_IN_STRING.search("'<button onclick=\"x()\">'"))
        self.assertTrue(HANDLER_IN_STRING.search("`<img src=x onerror='x()'>`"))
        self.assertTrue(HANDLER_IN_STRING.search("' oninput=\"(function(el){'"))
        self.assertFalse(HANDLER_IN_STRING.search("btn.onclick = function () {}"))
        self.assertFalse(HANDLER_IN_STRING.search("const online = 'yes'"))
        self.assertTrue(SET_ATTRIBUTE_HANDLER.search("el.setAttribute('onclick', 'x()')"))
        self.assertTrue(JS_URL_IN_STRING.search("a.href = 'javascript:void(0)'"))
        self.assertFalse(JS_URL_IN_STRING.search(strip_line_comments("// javascript:/data: schemes are refused")))
        scan = PageScan()
        scan.feed('<a href="javascript:x()">a</a><b onclick="y()">b</b><!-- <i onclick="z()"> --><script>var a = "<p onclick=1>"</script>')
        self.assertEqual(len(scan.handler_attrs), 1)
        self.assertEqual(len(scan.js_urls), 1)


class FetchDirectives(unittest.TestCase):
    def test_no_bare_scheme_or_wildcard_in_connect_or_img_src(self):
        for name in ("connect-src", "img-src"):
            for t in POLICY[name]:
                self.assertNotIn(t, ("https:", "http:", "*", "ws:", "wss:", "blob:", "filesystem:"),
                                 "%s must not contain %s" % (name, t))
                if name == "connect-src":
                    self.assertNotEqual(t, "data:", "connect-src must not allow data:")

    def test_no_bare_https_anywhere(self):
        for name, tokens in POLICY.items():
            for t in tokens:
                self.assertNotIn(t, ("https:", "http:", "*"), "%s contains %s" % (name, t))

    def test_hosts_are_https_and_wildcards_are_the_listed_ones(self):
        for name in ("connect-src", "img-src", "font-src", "style-src"):
            for src in host_sources(POLICY[name]):
                self.assertTrue(src.startswith("https://"), "%s: %s is not an https:// host" % (name, src))
                if "*" in src:
                    self.assertIn(src, WILDCARDS, "%s: wildcard %s has no reason in WILDCARDS (docs/csp.md)" % (name, src))
                    self.assertGreaterEqual(src.count("."), 2, "wildcard %s is too broad" % src)

    def test_multi_tenant_hosts_are_limited_to_a_path(self):
        # Anyone can publish on these hosts, so a bare host entry would let injected code send data to an
        # attacker-owned tenant. Each entry must name the one organisation or repository the app reads.
        multi_tenant = ("services.arcgis.com", "services1.arcgis.com", "services2.arcgis.com", "utility.arcgis.com",
                        "raw.githubusercontent.com", "cdn.jsdelivr.net")
        for name in ("connect-src", "img-src"):
            for src in host_sources(POLICY[name]):
                host = urlparse(src).hostname
                if host in multi_tenant:
                    path = urlparse(src).path
                    self.assertTrue(path.endswith("/") and len(path) > 1,
                                    "%s: %s is a multi-tenant host and needs a path such as /<org>/" % (name, src))

    def test_matcher_behaves(self):
        self.assertTrue(source_allows("https://*.tile.example.org", "https://a.tile.example.org/1/2/3.png"))
        self.assertFalse(source_allows("https://*.tile.example.org", "https://tile.example.org/1.png"))
        self.assertFalse(source_allows("https://*.tile.example.org", "https://evil-tile.example.org/1.png"))
        self.assertTrue(source_allows("https://svc.example.com/org1/", "https://svc.example.com/org1/arcgis/x"))
        self.assertFalse(source_allows("https://svc.example.com/org1/", "https://svc.example.com/org2/arcgis/x"))
        self.assertFalse(source_allows("https://svc.example.com/org1/", "https://svc.example.com/org1"))
        self.assertTrue(source_allows("https://api.example.com/v1/x", "https://api.example.com/v1/x?q=1"))
        self.assertFalse(source_allows("https://api.example.com/v1/x", "https://api.example.com/v1/xy"))
        self.assertFalse(source_allows("https://api.example.com", "http://api.example.com/"))
        self.assertTrue(source_allows("https://api.example.com", "https://api.example.com/anything"))


class HostInventory(unittest.TestCase):
    def test_every_host_the_code_uses_is_allowed(self):
        every = []
        for name in ("connect-src", "img-src", "font-src", "style-src", "script-src"):
            every += POLICY[name]
        missing = []
        for fname, url in code_urls():
            host = urlparse(url).hostname or ""
            if host in NAVIGATION_ONLY:
                continue
            if not allowed_by(every, url):
                missing.append("%s: %s" % (fname, url))
        self.assertEqual(sorted(set(missing)), [],
                         "the code names URLs the policy does not allow. Add the host to the right directive in "
                         "index.html (docs/csp.md, 'Adding a host'), or, if it is only a link a visitor clicks, "
                         "to NAVIGATION_ONLY in this test.")

    def test_no_policy_entry_is_unused(self):
        urls = [u for _, u in code_urls()]
        site = analytics_site()
        if site:
            urls.append("https://%s.goatcounter.com/count" % site)
        stale = []
        for name in ("connect-src", "img-src", "font-src", "style-src"):
            for src in host_sources(POLICY[name]):
                if not any(source_allows(src, u) for u in urls) and src not in KEPT_WITHOUT_LITERAL:
                    stale.append("%s: %s" % (name, src))
        # fonts.googleapis.com / fonts.gstatic.com are named in index.html (the stylesheet link), not in JS.
        stale = [s for s in stale if not s.endswith(("fonts.googleapis.com", "fonts.gstatic.com"))]
        # img-src entries are tile hosts named in app.js; connect-src and img-src share some hosts.
        self.assertEqual(stale, [], "policy entries that no URL in the code uses; remove them or explain in KEPT_WITHOUT_LITERAL")

    def test_every_connect_src_host_is_used_for_a_request_not_just_an_image(self):
        # The tile hosts belong in img-src only. A tile host in connect-src would widen the channel for nothing.
        tile_hosts = ("server.arcgisonline.com", "gibs.earthdata.nasa.gov", "opentopomap.org", "openrailwaymap.org",
                      "waymarkedtrails.org", "openseamap.org")
        for src in host_sources(POLICY["connect-src"]):
            for h in tile_hosts:
                self.assertNotIn(h, src, "tile host %s should be in img-src only" % h)

    def test_tile_canary_hosts_are_allowed_by_img_src(self):
        # scripts/check_tiles.py (the weekly canary) probes the tile providers the app serves. If it probes
        # a host the policy blocks, the canary would report healthy tiles that visitors cannot load.
        canary = read(os.path.join(ROOT, "scripts", "check_tiles.py"))
        urls = [template_to_url(u) for u in re.findall(r'"(https://[^"\s]+)"', canary)]
        urls = [u for u in urls if (urlparse(u).hostname or "") not in NAVIGATION_ONLY]
        self.assertTrue(urls, "no tile URLs found in scripts/check_tiles.py")
        for u in urls:
            self.assertTrue(allowed_by(POLICY["img-src"], u), "check_tiles.py probes %s but img-src does not allow it" % u)

    def test_goatcounter_entries_match_the_site_constant(self):
        site = analytics_site()
        gc = [s for name in ("connect-src", "img-src") for s in host_sources(POLICY[name]) if "goatcounter" in s]
        if not site:
            self.assertEqual(gc, [], "counting is off (NA_ANALYTICS_SITE is empty), so no goatcounter host belongs in the policy")
            return
        self.assertEqual(sorted(set(gc)), ["https://%s.goatcounter.com" % site],
                         "the policy must name exactly https://<NA_ANALYTICS_SITE>.goatcounter.com, nothing broader")
        beacon = "https://%s.goatcounter.com/count" % site
        self.assertTrue(allowed_by(POLICY["connect-src"], beacon), "the beacon would be blocked by connect-src")
        self.assertTrue(allowed_by(POLICY["img-src"], beacon), "the image fallback would be blocked by img-src")

    def test_analytics_script_is_same_origin(self):
        self.assertTrue(all(not t.startswith("https://") for t in POLICY["script-src"]), "script-src names a host")


class DispatchTable(unittest.TestCase):
    def test_action_names_in_markup_match_the_table(self):
        app = read(APP_JS)
        table = re.search(r"const NA_ACTIONS = \{(.*?)\n\};", app, re.S)
        inputs = re.search(r"const NA_INPUTS = \{(.*?)\n\};", app, re.S)
        self.assertIsNotNone(table, "NA_ACTIONS table not found in app.js")
        self.assertIsNotNone(inputs, "NA_INPUTS table not found in app.js")
        defined_act = set(re.findall(r"^  (\w+):", table.group(1), re.M))
        defined_inp = set(re.findall(r"^  (\w+):", inputs.group(1), re.M))
        # Markup may sit in app.js strings or in index.html; the table text itself is excluded.
        body = app.replace(table.group(0), "").replace(inputs.group(0), "") + "\n" + HTML
        used_act = set(re.findall(r'data-na-act=\\?"([A-Za-z]+)\\?"', body))
        used_inp = set(re.findall(r'data-na-input=\\?"([A-Za-z]+)\\?"', body))
        self.assertEqual(used_act - defined_act, set(), "data-na-act names with no entry in NA_ACTIONS")
        self.assertEqual(defined_act - used_act, set(), "NA_ACTIONS entries no markup uses (delete them)")
        self.assertEqual(used_inp - defined_inp, set(), "data-na-input names with no entry in NA_INPUTS")
        self.assertEqual(defined_inp - used_inp, set(), "NA_INPUTS entries no markup uses (delete them)")

    def test_dispatcher_listens_in_capture_phase_on_document(self):
        app = read(APP_JS)
        self.assertRegex(app, r"document\.addEventListener\('click', function \(e\) \{\s*const el = e\.target[^}]*\}, true\);")
        self.assertRegex(app, r"document\.addEventListener\('input', function \(e\) \{[^}]*\}, true\);")


class ServiceWorkerWiring(unittest.TestCase):
    def test_boot_file_is_loaded_deferred_first_and_precached(self):
        order = re.findall(r'<script defer src="([^"]+)"></script>', HTML)
        self.assertEqual(order[0], "na-boot.js", "na-boot.js must run before leaflet.js, data.js and app.js")
        self.assertIn("./na-boot.js", read(SW_JS))
        self.assertTrue(os.path.isfile(os.path.join(ROOT, "na-boot.js")))

    def test_every_local_script_is_precached(self):
        sw = read(SW_JS)
        for src in re.findall(r'<script defer src="([^"]+)"></script>', HTML):
            self.assertIn("'./%s'" % src, sw, "%s is loaded by index.html but not precached in sw.js" % src)

    def test_cache_name_has_the_expected_shape(self):
        self.assertRegex(read(SW_JS), re.compile(r"^const CACHE = 'nomadic-v\d+';", re.M))

    def test_font_stylesheet_is_activated_by_the_boot_file(self):
        self.assertIn('id="na-fonts-css"', HTML)
        self.assertIn("na-fonts-css", read(os.path.join(ROOT, "na-boot.js")))
        self.assertNotIn("onload=", HTML)


if __name__ == "__main__":
    unittest.main(verbosity=2)

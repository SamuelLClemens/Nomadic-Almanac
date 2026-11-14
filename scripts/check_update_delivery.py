#!/usr/bin/env python3
"""Guard for update delivery: python3 scripts/check_update_delivery.py [--base REF]

An installed copy of the app (a Home Screen icon, an open tab) learns that a newer release exists by
comparing the release number it was loaded as with version.json on the server (na-update.js). So the
number must move whenever shipped files change, and the three places that hold it must agree. The
check fails when:
  - CACHE in sw.js, "version" in version.json and VERSION in na-update.js are not the same number;
  - a file named in the service worker's precache list (CORE) does not exist. One missing file makes
    the worker's install fail, and then the worker never takes over;
  - na-update.js is not precached, index.html does not load it or has no #na-version-line, sw.js no
    longer steps aside for /version.json, or the /Nomadic-Almanac/ redirect page is missing;
  - manifest.json names an absolute start_url, scope or id. A Home Screen icon keeps the address it
    was saved with, and the absolute /Nomadic-Almanac/ was a 404 on the real domain for five months;
  - with --base REF: a shipped file differs from REF and the release number is not higher.

python3 scripts/bump_version.py raises the number in all three places at once. docs/update-delivery.md
explains the whole mechanism. The check reads local files and runs git; it makes no network request.
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# What a visitor's browser does not load as the app. data/visitors.json is read on demand with a
# revalidating request and refreshed weekly by a bot, so it reaches visitors without a new release.
EXEMPT_PREFIXES = ("docs/", "scripts/", ".github/", ".claude/")
EXEMPT_FILES = frozenset([
    "CNAME", "README.md", "VERIFICATION_PROGRESS.md", "serve.py", ".gitignore", "data/visitors.json",
])


def is_exempt(path):
    return path.startswith(EXEMPT_PREFIXES) or path in EXEMPT_FILES or path.endswith(".md")


def read_text(root, rel):
    with open(os.path.join(root, rel), "rb") as fh:
        return fh.read().decode("utf-8")


def cache_number(sw_text):
    match = re.search(r"""const\s+CACHE\s*=\s*['"]nomadic-v(\d+)['"]""", sw_text or "")
    return int(match.group(1)) if match else None


def core_list(sw_text):
    match = re.search(r"const\s+CORE\s*=\s*\[(.*?)\]\s*;", sw_text or "", re.S)
    if not match:
        return None
    body = re.sub(r"//[^\n]*", "", match.group(1))
    return re.findall(r"""['"]([^'"]+)['"]""", body)


def page_number(js_text):
    match = re.search(r"\bvar\s+VERSION\s*=\s*(\d+)\s*;", js_text or "")
    return int(match.group(1)) if match else None


def json_number(text):
    try:
        value = json.loads(text).get("version")
    except (ValueError, AttributeError):
        return None
    return value if isinstance(value, int) and not isinstance(value, bool) else None


def check_tree(root):
    """Return a list of problems found in the files under root (empty when all is well)."""
    problems = []

    def need(rel):
        try:
            return read_text(root, rel)
        except (OSError, UnicodeDecodeError) as exc:
            problems.append("%s cannot be read (%s)" % (rel, exc.__class__.__name__))
            return None

    sw = need("sw.js")
    ver = need("version.json")
    upd = need("na-update.js")
    idx = need("index.html")
    redirect = need("Nomadic-Almanac/index.html")
    manifest = need("manifest.json")

    numbers = {
        "CACHE in sw.js": cache_number(sw) if sw is not None else None,
        "version in version.json": json_number(ver) if ver is not None else None,
        "VERSION in na-update.js": page_number(upd) if upd is not None else None,
    }
    for label, value in sorted(numbers.items()):
        if value is None and {"CACHE in sw.js": sw, "version in version.json": ver,
                              "VERSION in na-update.js": upd}[label] is not None:
            problems.append("%s is missing or not a whole number" % label)
    known = [v for v in numbers.values() if v is not None]
    if len(known) == 3 and len(set(known)) != 1:
        problems.append("release numbers differ: " + "; ".join("%s = %d" % (k, numbers[k]) for k in sorted(numbers)))

    if sw is not None:
        core = core_list(sw)
        if core is None:
            problems.append("sw.js: the CORE list was not found")
        else:
            for entry in core:
                rel = "index.html" if entry == "./" else (entry[2:] if entry.startswith("./") else entry)
                if not os.path.isfile(os.path.join(root, rel)):
                    problems.append("sw.js CORE names %s, which does not exist (the worker's install would fail)" % entry)
            if "./na-update.js" not in core:
                problems.append("sw.js CORE must list ./na-update.js")
        if not re.search(r"""endsWith\(\s*['"]/version\.json['"]\s*\)""", sw):
            problems.append("sw.js no longer steps aside for /version.json (it must always come from the network)")

    if idx is not None:
        if not re.search(r"""<script[^>]*\bsrc="na-update\.js\"""", idx):
            problems.append("index.html does not load na-update.js")
        if 'id="na-version-line"' not in idx:
            problems.append('index.html has no id="na-version-line" element for the release line')

    if redirect is not None and not (re.search(r"""http-equiv="refresh\"""", redirect) and "url=../" in redirect):
        problems.append("Nomadic-Almanac/index.html must redirect to ../ (old Home Screen icons start there)")

    if manifest is not None:
        try:
            document = json.loads(manifest)
        except ValueError:
            problems.append("manifest.json is not valid JSON")
        else:
            for key in ("start_url", "scope", "id"):
                value = document.get(key) if isinstance(document, dict) else None
                if not isinstance(value, str) or not value.startswith("."):
                    problems.append("manifest.json %s must be a relative address such as './' "
                                    "(an absolute path was a 404 on the real domain from 2026-06-11 to 2026-11-05)" % key)

    return problems


def _git(root, *args):
    return subprocess.run(["git", "-C", root] + list(args), stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                          universal_newlines=True)


def check_base(root, base):
    """Return problems found by comparing the files under root with the git ref base."""
    merge_base = _git(root, "merge-base", base, "HEAD")
    point = merge_base.stdout.strip() if merge_base.returncode == 0 and merge_base.stdout.strip() else base
    diff = _git(root, "diff", "--name-only", point)
    if diff.returncode != 0:
        return ["cannot compare with %s: %s" % (base, diff.stderr.strip() or "git diff failed")]
    changed = set(line for line in diff.stdout.splitlines() if line)
    untracked = _git(root, "ls-files", "--others", "--exclude-standard")
    if untracked.returncode == 0:
        changed.update(line for line in untracked.stdout.splitlines() if line)
    shipped = sorted(path for path in changed if not is_exempt(path))

    old = _git(root, "show", "%s:sw.js" % point)
    old_number = cache_number(old.stdout) if old.returncode == 0 else None
    try:
        new_number = cache_number(read_text(root, "sw.js"))
    except (OSError, UnicodeDecodeError):
        new_number = None
    if old_number is None or new_number is None:
        return ["cannot read the release number at %s (%s) or in this tree (%s)" % (base, old_number, new_number)]
    if new_number < old_number:
        return ["the release number went down: %d at %s, %d here" % (old_number, base, new_number)]
    if shipped and new_number == old_number:
        listed = ", ".join(shipped[:8]) + (" and %d more" % (len(shipped) - 8) if len(shipped) > 8 else "")
        return ["shipped files changed without a new release number (still %d): %s. "
                "Run: python3 scripts/bump_version.py" % (new_number, listed)]
    return []


def main(argv=None):
    parser = argparse.ArgumentParser(description="Check that every update can reach every installed copy.")
    parser.add_argument("--base", help="git ref this work merges into, for example origin/main")
    parser.add_argument("--root", default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)

    problems = check_tree(args.root)
    if args.base:
        problems += check_base(args.root, args.base)
    if problems:
        print("update delivery check: FAILED")
        for problem in problems:
            print("  - " + problem)
        return 1
    try:
        number = cache_number(read_text(args.root, "sw.js"))
    except (OSError, UnicodeDecodeError):
        number = None
    print("update delivery check: ok (release %s%s)" % (number, ", compared with " + args.base if args.base else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())

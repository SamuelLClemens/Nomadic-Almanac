#!/usr/bin/env python3
"""Raise the release number in every place that holds it: python3 scripts/bump_version.py [--to N]

The number lives in three files and must be the same in all of them (docs/update-delivery.md):
  sw.js          const CACHE = 'nomadic-v<N>'
  version.json   {"version": <N>}
  na-update.js   var VERSION = <N>;
Without --to the number goes up by one. The script changes nothing unless all three files are found,
agree with each other and each holds the number exactly once. scripts/check_update_delivery.py is the
guard that fails a pull request when shipped files change and the number does not.
"""
import argparse
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (file, pattern with three groups around the number)
TARGETS = (
    ("sw.js", re.compile(r"(const\s+CACHE\s*=\s*'nomadic-v)(\d+)(')")),
    ("version.json", re.compile(r'("version"\s*:\s*)(\d+)()')),
    ("na-update.js", re.compile(r"(\bvar\s+VERSION\s*=\s*)(\d+)(\s*;)")),
)


def bump(root, new_number=None):
    """Return (old, new). Raise ValueError, leaving every file untouched, if anything is off."""
    texts = {}
    found = {}
    for rel, pattern in TARGETS:
        path = os.path.join(root, rel)
        try:
            with open(path, "rb") as fh:
                texts[rel] = fh.read().decode("utf-8")
        except OSError as exc:
            raise ValueError("%s cannot be read: %s" % (rel, exc))
        matches = pattern.findall(texts[rel])
        if len(matches) != 1:
            raise ValueError("%s must hold the release number exactly once, found %d places" % (rel, len(matches)))
        found[rel] = int(matches[0][1])
    if len(set(found.values())) != 1:
        raise ValueError("the files disagree (%s); fix that first" % ", ".join("%s = %d" % kv for kv in sorted(found.items())))
    old = next(iter(found.values()))
    new = old + 1 if new_number is None else new_number
    if new <= old:
        raise ValueError("the new number (%d) must be higher than the current one (%d)" % (new, old))
    for rel, pattern in TARGETS:
        updated = pattern.sub(lambda m: m.group(1) + str(new) + m.group(3), texts[rel], count=1)
        with open(os.path.join(root, rel), "wb") as fh:
            fh.write(updated.encode("utf-8"))
    return old, new


def main(argv=None):
    parser = argparse.ArgumentParser(description="Raise the release number everywhere it lives.")
    parser.add_argument("--to", type=int, help="set this number instead of adding one")
    parser.add_argument("--root", default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)
    try:
        old, new = bump(args.root, args.to)
    except ValueError as exc:
        print("bump_version: %s" % exc, file=sys.stderr)
        return 1
    print("release %d -> %d (sw.js, version.json, na-update.js)" % (old, new))
    return 0


if __name__ == "__main__":
    sys.exit(main())

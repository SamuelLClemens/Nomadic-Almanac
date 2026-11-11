#!/usr/bin/env python3
"""Guard for .github/workflows/refresh-visitors.yml: python3 scripts/test_refresh_workflow.py

The workflow holds a read-only analytics key and can open pull requests, so the properties that keep
it safe are checked as text (there is no YAML parser in the standard library, so the rules read lines,
indentation and regular expressions; full-line and trailing comments are ignored). The tests fail when:
  - a pull_request or pull_request_target trigger appears, or the triggers are not exactly schedule
    and workflow_dispatch;
  - any `uses:` is not pinned to a full 40-hex commit SHA with a tag comment, or names an action outside
    the actions/ organisation (checkout, upload-artifact and download-artifact are all it needs);
  - the secret name GOATCOUNTER_TOKEN appears anywhere but the one step of the `fetch` job that runs the
    updater, or `fetch` loses the environment that limits the secret to the main branch;
  - `contents: write` appears outside the `propose` job, or any job's permissions differ from the exact
    set below, or the top-level permissions are more than none;
  - the `propose` or `report` job references any secret other than the built-in token;
  - any step pushes to main or master, forces a push, merges, enables auto-merge or calls `gh api`;
  - `--regions` appears (region level is shipped off), or the updater is told to leave its site binding
    (`--allow-other-site`) or its empty-result protection (`--allow-empty`);
  - a checkout lacks `persist-credentials: false`.
Each rule is also run against a deliberately broken copy of the workflow, so a rule that stops
matching fails here instead of passing silently. The tests read local files only and make no request.
"""
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKFLOW = os.path.join(ROOT, ".github", "workflows", "refresh-visitors.yml")
TILE_CHECK = os.path.join(ROOT, ".github", "workflows", "tile-check.yml")
DOCS = os.path.join(ROOT, "docs", "visitors-layer.md")

JOB_PERMISSIONS = {                    # the exact permissions each job may declare
    "fetch": {"contents": "read"},
    "propose": {"contents": "write", "pull-requests": "write"},
    "report": {"issues": "write"},
}
ALLOWED_USES = ("actions/checkout", "actions/upload-artifact", "actions/download-artifact")
SECRET = "GOATCOUNTER_TOKEN"
PIN = re.compile(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:/[A-Za-z0-9_./-]+)?@[0-9a-f]{40}")


def git_sub(sub):
    """Matches `git <sub>` even with options between the two, as in git -c "k=v" -C dir push."""
    return re.compile(r"""\bgit\b(?:\s+(?:-c\s+(?:"[^"]*"|'[^']*'|\S+)|-C\s+\S+|--[\w-]+(?:=\S+)?))*\s+%s\b""" % sub)


GIT_PUSH, GIT_COMMIT, GIT_MERGE = git_sub("push"), git_sub("commit"), git_sub("merge")


def read(path):
    with open(path, "rb") as fh:
        return fh.read().decode("utf-8")


# --- reading the file -----------------------------------------------------------------------------

def strip_comment(line):
    """The line without a full-line or trailing ` # comment`. A # inside quotes, or one not preceded by
    whitespace (such as ${#var}), is kept. Quote state is per line, which is enough for this file."""
    quote = None
    for i, ch in enumerate(line):
        if quote:
            if ch == quote:
                quote = None
        elif ch in "'\"":
            quote = ch
        elif ch == "#" and (i == 0 or line[i - 1] in " \t"):
            return line[:i].rstrip()
    return line.rstrip()


def code_lines(text):
    """[(line number, line without comments)] for every line that still has something on it."""
    out = []
    for n, raw in enumerate(text.split("\n"), 1):
        line = strip_comment(raw)
        if line.strip():
            out.append((n, line))
    return out


def split_jobs(lines):
    """({job name: [(n, line)]}, [lines before `jobs:`]). Job headers sit at two spaces of indent."""
    head, jobs, current = [], {}, None
    seen_jobs = False
    for n, line in lines:
        if not seen_jobs:
            if re.match(r"^jobs:\s*$", line):
                seen_jobs = True
            else:
                head.append((n, line))
            continue
        m = re.match(r"^  ([A-Za-z][\w-]*):\s*$", line)
        if m:
            current = m.group(1)
            jobs[current] = []
        elif current is not None:
            jobs[current].append((n, line))
    return jobs, head


def split_steps(job):
    """The steps of one job as lists of (n, line). A step starts at six spaces and a dash."""
    steps, current, in_steps = [], None, False
    for n, line in job:
        if re.match(r"^    steps:\s*$", line):
            in_steps = True
            continue
        if not in_steps:
            continue
        if re.match(r"^      - ", line):
            current = []
            steps.append(current)
        if current is not None:
            current.append((n, line))
    return steps


def permissions_of(lines, indent):
    """The permissions block whose key sits at `indent` spaces: {} for `{}`, a dict for a block, None when absent."""
    key = re.compile(r"^" + " " * indent + r"permissions:\s*(.*)$")
    item = re.compile(r"^" + " " * (indent + 2) + r"([\w-]+):\s*(\S+)\s*$")
    for i, (_, line) in enumerate(lines):
        m = key.match(line)
        if not m:
            continue
        rest = m.group(1).strip()
        if rest == "{}":
            return {}
        if rest:
            return {"_inline": rest}
        found = {}
        for _, nxt in lines[i + 1:]:
            mi = item.match(nxt)
            if not mi:
                break
            found[mi.group(1)] = mi.group(2)
        return found
    return None


def trigger_names(head):
    names, inside = [], False
    for _, line in head:
        if re.match(r"^on:\s*$", line):
            inside = True
            continue
        if inside:
            if re.match(r"^\S", line):
                break
            m = re.match(r"^  ([A-Za-z_]+):", line)
            if m:
                names.append(m.group(1))
    return names


def logical_lines(lines):
    """Code lines with shell continuations (a trailing backslash) joined, so a command split over lines is one."""
    out, buf = [], ""
    for _, line in lines:
        if line.rstrip().endswith("\\"):
            buf += line.rstrip()[:-1] + " "
            continue
        out.append(buf + line)
        buf = ""
    if buf:
        out.append(buf)
    return out


def expressions(lines):
    return re.findall(r"\$\{\{(.*?)\}\}", "\n".join(l for _, l in lines), re.S)


def cron_of(text):
    m = re.search(r"cron:\s*'([^']+)'", "\n".join(l for _, l in code_lines(text)))
    return m.group(1) if m else None


def dow_set(field):
    """The weekdays of a cron day-of-week field made of numbers, commas and ranges; None for anything else."""
    days = set()
    for part in field.split(","):
        m = re.fullmatch(r"(\d)(?:-(\d))?", part)
        if not m:
            return None
        lo, hi = int(m.group(1)), int(m.group(2) or m.group(1))
        days.update(d % 7 for d in range(lo, hi + 1))
    return days


def cron_overlaps(a, b):
    """True when two weekly cron expressions can fire at the same minute. Anything that is not a plain number
    (a list, a step, *) in the minute or hour counts as overlapping, and so does a day-of-week field that
    cannot be read: the check errs toward reporting a collision."""
    fa, fb = a.split(), b.split()
    for i in (0, 1):
        if fa[i].isdigit() and fb[i].isdigit() and int(fa[i]) != int(fb[i]):
            return False
    da, db = dow_set(fa[4]), dow_set(fb[4])
    return da is None or db is None or bool(da & db)


# --- the rules ------------------------------------------------------------------------------------

def problems(text, tile_text=None):
    """Every rule the workflow breaks, as readable strings. The real file must give an empty list."""
    found = []
    lines = code_lines(text)
    raw_lines = text.split("\n")
    jobs, head = split_jobs(lines)
    whole = "\n".join(l for _, l in lines)
    logical = logical_lines(lines)

    # 1. triggers
    if re.search(r"\bpull_request(_target)?\b", whole):
        found.append("a pull_request or pull_request_target trigger or condition appears")
    triggers = trigger_names(head)
    if sorted(triggers) != ["schedule", "workflow_dispatch"]:
        found.append("the triggers must be exactly schedule and workflow_dispatch, found %s" % triggers)
    if not re.search(r"workflow_dispatch:\s*\n\s+inputs:\s*\n\s+create_pr:\s*\n\s+description:.*\n\s+type: boolean\n\s+default: false", whole):
        found.append("workflow_dispatch must have a boolean input create_pr that defaults to false")

    # 2. every action pinned to a SHA, from the actions/ organisation only, with a tag comment
    uses = []
    for n, line in lines:
        m = re.match(r"^\s*(?:-\s+)?uses:\s*(\S+)\s*$", line)
        if m:
            uses.append((n, m.group(1)))
        elif re.search(r"\buses:", line):
            found.append("line %d: unreadable uses: line" % n)
    if len(uses) < 4:
        found.append("expected at least four uses: lines (two checkouts, upload, download), found %d" % len(uses))
    for n, ref in uses:
        if not PIN.fullmatch(ref):
            found.append("line %d: `uses: %s` is not pinned to a 40-character commit SHA" % (n, ref))
        elif ref.split("@")[0] not in ALLOWED_USES:
            found.append("line %d: %s is not one of the allowed actions %s" % (n, ref.split("@")[0], ALLOWED_USES))
        if not re.search(r"uses:\s*\S+\s+#\s*v\d+(\.\d+)*\s*$", raw_lines[n - 1]):
            found.append("line %d: the pinned action needs its tag in a trailing comment, such as # v7.0.1" % n)

    # 3. the secret
    if set(jobs) != set(JOB_PERMISSIONS):
        found.append("the jobs must be exactly %s, found %s" % (sorted(JOB_PERMISSIONS), sorted(jobs)))
    if SECRET in "\n".join(l for _, l in head):
        found.append("%s appears outside the jobs" % SECRET)
    for name, job in jobs.items():
        if name != "fetch" and any(SECRET in l for _, l in job):
            found.append("%s appears in the %s job; only fetch may name it" % (SECRET, name))
    fetch = jobs.get("fetch", [])
    holders = [s for s in split_steps(fetch) if any(SECRET in l for _, l in s)]
    if len(holders) != 1:
        found.append("%s must appear in exactly one step of fetch, found %d" % (SECRET, len(holders)))
    else:
        step = "\n".join(l for _, l in holders[0])
        if not re.search(r"^\s+env:\s*\n\s+%s: \$\{\{ secrets\.%s \}\}\s*\n" % (SECRET, SECRET), step, re.M) \
                or not re.search(r"run: python3 scripts/update_visitors\.py\s*$", step):
            found.append("the step that holds %s must be the updater step: the secret in its own env, run: python3 scripts/update_visitors.py" % SECRET)
    if not re.search(r"^    environment: visitor-refresh\s*$", "\n".join(l for _, l in fetch), re.M):
        found.append("fetch must run in the environment visitor-refresh (it limits the secret to main)")
    if not re.search(r"^    if: github\.ref == 'refs/heads/main'\s*$", "\n".join(l for _, l in fetch), re.M):
        found.append("fetch must run only on refs/heads/main")
    if any(re.match(r"^env:", l) for _, l in head):
        found.append("a top-level env: block would reach every job")

    # 4. permissions
    top = permissions_of(head, 0)
    if top not in ({}, {"contents": "read"}):
        found.append("top-level permissions must be {} or contents: read, found %s" % top)
    if re.search(r"write-all|read-all", whole):
        found.append("write-all or read-all permissions appear")
    for name, want in JOB_PERMISSIONS.items():
        got = permissions_of(jobs.get(name, []), 4)
        if got != want:
            found.append("job %s must declare exactly the permissions %s, found %s" % (name, want, got))
    for name, job in jobs.items():
        if name != "propose" and any(re.search(r"contents:\s*write", l) for _, l in job):
            found.append("contents: write appears in the %s job; only propose may have it" % name)
        if not any(re.match(r"^    timeout-minutes: \d+\s*$", l) for _, l in job):
            found.append("job %s has no timeout-minutes" % name)
    if any(re.search(r"contents:\s*write", l) for _, l in head):
        found.append("contents: write appears at the top level")

    # 5. secrets other than the built-in token
    for name in ("propose", "report"):
        job = jobs.get(name, [])
        for expr in expressions(job):
            for m in re.finditer(r"\bsecrets\b(\.\w+)?", expr):
                if m.group(1) not in (".GITHUB_TOKEN",):
                    found.append("the %s job reads a secret other than the built-in token: ${{%s}}" % (name, expr.rstrip()))
        if any(re.match(r"^\s*secrets:", l) for _, l in job):
            found.append("the %s job passes a secrets: block" % name)

    # 6. pushes, merges, auto-merge
    for name, job in jobs.items():
        for line in logical_lines(job):
            if GIT_PUSH.search(line):
                if name != "propose":
                    found.append("git push appears in the %s job" % name)
                if re.search(r"(?<![\w-])(--force\S*|-f|--mirror|--delete|--prune|--all|--tags)(?![\w-])|[\s'\x22]\+[\w$\x22{]", line):
                    found.append("a git push forces, deletes or pushes more than one branch: %s" % line.strip())
                if re.search(r"\b(main|master)\b", line):
                    found.append("a git push names main or master: %s" % line.strip())
                if not re.search(r"""\bHEAD:refs/heads/["{]*\$\{?branch\}?["}]*\s*$""", line):
                    found.append("the git push must end with HEAD:refs/heads/$branch: %s" % line.strip())
            if re.search(r"\bgh\s+pr\s+create\b", line) and name != "propose":
                found.append("gh pr create appears in the %s job" % name)
            if re.search(r"\bgh\s+issue\s+create\b", line) and name != "report":
                found.append("gh issue create appears in the %s job" % name)
    pushes = [l for l in logical_lines(jobs.get("propose", [])) if GIT_PUSH.search(l)]
    if len(pushes) != 1:
        found.append("propose must contain exactly one git push, found %d" % len(pushes))
    if not re.search(r"main\|master", "\n".join(l for _, l in jobs.get("propose", []))):
        found.append("propose must refuse a branch named main or master (a case guard)")
    for line in logical:
        if GIT_MERGE.search(line) or re.search(r"\bgh\s+pr\s+merge\b|(?<![\w-])--auto\b|(?<![\w-])--admin\b|auto[-_ ]?merge|"
                     r"enablePullRequestAutoMerge|\bgh\s+api\b|/merge\b|\bmerge_method\b", line, re.I):
            found.append("a step merges, enables auto-merge or calls the API directly: %s" % line.strip())

    # 7. region level and the updater's protections
    if re.search(r"(?<![\w-])--regions(?![\w-])", whole):
        found.append("--regions appears; region level is shipped off")
    for flag in ("--allow-other-site", "--allow-empty", "--site"):
        if re.search(r"(?<![\w-])%s(?![\w-])" % re.escape(flag), whole):
            found.append("%s appears; the updater must keep its site binding and its empty-result protection" % flag)

    # 8. checkout keeps no credentials
    checkouts = 0
    for name, job in jobs.items():
        for step in split_steps(job):
            body = "\n".join(l for _, l in step)
            if re.search(r"uses:\s*actions/checkout@", body):
                checkouts += 1
                if not re.search(r"^\s+persist-credentials: false\s*$", body, re.M):
                    found.append("a checkout in the %s job lacks persist-credentials: false" % name)
    if checkouts < 2:
        found.append("expected a checkout in fetch and in propose, found %d" % checkouts)
    if any(re.search(r"actions/checkout@", l) for _, l in jobs.get("report", [])):
        found.append("report must not check anything out")

    # 9. wiring that makes the trigger rules mean something
    propose = "\n".join(l for _, l in jobs.get("propose", []))
    report = "\n".join(l for _, l in jobs.get("report", []))
    fetch_text = "\n".join(l for _, l in fetch)
    if not re.search(r"^    needs: fetch\s*$", propose, re.M):
        found.append("propose must need fetch")
    m = re.search(r"^    if: (.*)$", propose, re.M)
    cond = m.group(1) if m else ""
    for part in ("needs.fetch.outputs.changed == 'true'", "github.event_name == 'schedule'",
                 "github.event_name == 'workflow_dispatch'", "inputs.create_pr", "refs/heads/main"):
        if part not in cond:
            found.append("the propose condition must include %s" % part)
    if not re.search(r"^    needs: \[fetch, propose\]\s*$", report, re.M) or "always()" not in report \
            or "needs.fetch.result == 'failure'" not in report or "needs.propose.result == 'failure'" not in report:
        found.append("report must need fetch and propose and run on a failure of either, under always()")
    if "scripts/visitors_changed.py compare" not in fetch_text:
        found.append("fetch must compare with scripts/visitors_changed.py compare")
    steps = split_steps(jobs.get("propose", []))
    order = ["\n".join(logical_lines(s)) for s in steps]
    validate_at = [i for i, s in enumerate(order) if "scripts/visitors_changed.py validate" in s]
    commit_at = [i for i, s in enumerate(order) if GIT_COMMIT.search(s)]
    if not validate_at or not commit_at or min(commit_at) < min(validate_at):
        found.append("propose must validate the file in a step before the step that commits")
    upload_paths = re.findall(r"uses: actions/upload-artifact@.*?(?=\n      - |\n  \w|\Z)", fetch_text, re.S)
    if len(upload_paths) != 1 or not re.search(r"^\s+path: data/visitors\.json\s*$", upload_paths[0], re.M):
        found.append("fetch must upload one artifact whose only path is data/visitors.json")
    if "visitor-data" not in propose or "visitor-refresh-failed" not in report:
        found.append("the dedupe labels visitor-data (propose) and visitor-refresh-failed (report) are missing")
    for name, job_text in (("propose", propose), ("report", report)):
        if not re.search(r"gh label create .*--force|gh label create .*\\\n?.*--force", job_text.replace("\\\n", " ")):
            found.append("%s must create its label idempotently (gh label create ... --force)" % name)

    # 10. the schedule is weekly and does not collide with the tile check
    cron = cron_of(text)
    if not cron or len(cron.split()) != 5 or cron.split()[4] == "*" or cron.split()[2:4] != ["*", "*"]:
        found.append("the schedule must be one weekly cron expression, found %r" % cron)
    elif tile_text is not None and cron_of(tile_text) and cron_overlaps(cron, cron_of(tile_text)):
        found.append("the schedule %r collides with the tile check %r" % (cron, cron_of(tile_text)))
    return found


# --- tests ----------------------------------------------------------------------------------------

TEXT = read(WORKFLOW)
TILE = read(TILE_CHECK)


def broken(old, new, count=1):
    """A copy of the real workflow with `old` replaced by `new`; fails loudly if `old` is not there, so a
    mutation can never silently do nothing."""
    assert TEXT.count(old) >= 1, "mutation target not found in the workflow: %r" % old
    return TEXT.replace(old, new, count)


class RealWorkflow(unittest.TestCase):
    def test_the_workflow_breaks_no_rule(self):
        self.assertEqual(problems(TEXT, TILE), [])

    def test_the_file_is_where_the_docs_say(self):
        self.assertTrue(os.path.isfile(WORKFLOW))
        self.assertIn("name: Refresh visitor data\n", TEXT)

    def test_the_three_jobs_and_their_powers(self):
        jobs, _ = split_jobs(code_lines(TEXT))
        self.assertEqual(sorted(jobs), ["fetch", "propose", "report"])
        self.assertEqual({n: permissions_of(j, 4) for n, j in jobs.items()}, JOB_PERMISSIONS)

    def test_the_secret_is_named_once_and_only_in_fetch(self):
        hits = [(n, l.strip()) for n, l in code_lines(TEXT) if SECRET in l]
        self.assertEqual(len(hits), 1, hits)       # one line: the env key and its secrets. reference

    def test_the_updater_step_passes_no_flags(self):
        self.assertRegex(TEXT, r"(?m)^        run: python3 scripts/update_visitors\.py\s*$")

    def test_schedule_is_weekly_and_off_the_tile_check_minute(self):
        cron, tile = cron_of(TEXT), cron_of(TILE)
        self.assertEqual(len(cron.split()), 5)
        self.assertNotEqual(cron, tile)
        self.assertNotEqual(cron.split()[:2], tile.split()[:2])
        self.assertEqual(cron.split()[2:4], ["*", "*"])


class Detectors(unittest.TestCase):
    """Each rule must fire on a copy of the workflow that breaks it (and only a comment must not)."""

    def fires(self, text, fragment):
        found = problems(text, TILE)
        self.assertTrue(any(fragment in p for p in found), "no problem mentioning %r in %s" % (fragment, found))

    def test_pull_request_triggers(self):
        self.fires(broken("on:\n  schedule:", "on:\n  pull_request:\n  schedule:"), "pull_request")
        self.fires(broken("on:\n  schedule:", "on:\n  pull_request_target:\n  schedule:"), "pull_request")
        self.fires(broken("on:\n  schedule:", "on:\n  push:\n  schedule:"), "triggers must be exactly")

    def test_a_comment_is_not_a_rule_break(self):
        text = broken("permissions: {}\n", "permissions: {}\n# pull_request: no, --regions no, gh pr merge --auto no, %s no\n" % SECRET)
        self.assertEqual(problems(text, TILE), [])
        text = broken("python3 scripts/update_visitors.py\n", "python3 scripts/update_visitors.py   # not --regions\n")
        self.assertEqual(problems(text, TILE), [])

    def test_unpinned_or_foreign_actions(self):
        sha, tag = re.search(r"actions/checkout@([0-9a-f]{40})  # (v[\d.]+)", TEXT).groups()
        pinned = "actions/checkout@%s  # %s" % (sha, tag)
        self.fires(broken(pinned, "actions/checkout@v4  # %s" % tag), "not pinned")
        self.fires(broken(pinned, "actions/checkout@%s  # %s" % (sha[:39], tag)), "not pinned")
        self.fires(broken(pinned, "actions/checkout@%s" % sha), "tag in a trailing comment")
        self.fires(broken(pinned, "somebody/else@%s  # v1" % sha), "allowed actions")
        self.fires(broken(pinned, "actions/checkout@%s  # %s\n        # x" % ("G" * 40, tag)), "not pinned")

    def test_secret_outside_fetch(self):
        self.fires(broken("          GH_TOKEN: ${{ github.token }}\n          PR_LABEL: visitor-data\n",
                          "          GH_TOKEN: ${{ github.token }}\n          %s: ${{ secrets.%s }}\n          PR_LABEL: visitor-data\n" % (SECRET, SECRET)),
                   "only fetch may name it")
        self.fires(broken("          GH_TOKEN: ${{ github.token }}\n          RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\n          ALERT_LABEL",
                          "          GH_TOKEN: ${{ secrets.%s }}\n          RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\n          ALERT_LABEL" % SECRET),
                   "only fetch may name it")

    def test_secret_in_another_fetch_step(self):
        self.fires(broken("      - name: Compare with the committed file\n        id: compare\n        run: |",
                          "      - name: Compare with the committed file\n        id: compare\n        env:\n          X: ${{ secrets.%s }}\n        run: |" % SECRET),
                   "exactly one step")

    def test_secret_at_the_top_or_the_environment_dropped(self):
        self.fires(broken("permissions: {}\n", "permissions: {}\nenv:\n  T: ${{ secrets.%s }}\n" % SECRET), "outside the jobs")
        self.fires(broken("    environment: visitor-refresh\n", ""), "environment visitor-refresh")
        self.fires(broken("    if: github.ref == 'refs/heads/main'\n", ""), "only on refs/heads/main")

    def test_contents_write_elsewhere(self):
        self.fires(broken("    permissions:\n      contents: read\n", "    permissions:\n      contents: write\n"), "contents: write")
        self.fires(broken("      issues: write ", "      contents: write\n      issues: write "), "contents: write")
        self.fires(broken("permissions: {}\n", "permissions:\n  contents: write\n"), "top-level permissions")
        self.fires(broken("permissions: {}\n", "permissions: write-all\n"), "write-all")

    def test_extra_or_missing_permissions(self):
        self.fires(broken("      pull-requests: write ", "      pull-requests: write\n      actions: write "), "exactly the permissions")
        self.fires(broken("      contents: write          # pushes", "      contents: read           # pushes"), "exactly the permissions")

    def test_other_secrets_in_propose_or_report(self):
        self.fires(broken("          PR_LABEL: visitor-data\n          RUN_ID", "          PR_LABEL: visitor-data\n          OTHER: ${{ secrets.DEPLOY_KEY }}\n          RUN_ID"), "secret other than")
        self.fires(broken("          PR_LABEL: visitor-data\n          RUN_ID", "          PR_LABEL: visitor-data\n          ALL: ${{ toJSON(secrets) }}\n          RUN_ID"), "secret other than")
        ok = broken("GH_TOKEN: ${{ github.token }}\n          PR_LABEL: visitor-data\n          RUN_ID",
                    "GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}\n          PR_LABEL: visitor-data\n          RUN_ID")
        self.assertEqual(problems(ok, TILE), [])         # the built-in token under its other name is fine

    def test_pushes_to_main_forced_or_extra(self):
        push = 'push origin "HEAD:refs/heads/$branch"'
        self.fires(broken(push, 'push --force origin "HEAD:refs/heads/$branch"'), "forces")
        self.fires(broken(push, 'push -f origin "HEAD:refs/heads/$branch"'), "forces")
        self.fires(broken(push, 'push --force-with-lease origin "HEAD:refs/heads/$branch"'), "forces")
        self.fires(broken(push, 'push origin "+HEAD:refs/heads/$branch"'), "forces")
        self.fires(broken(push, "push origin HEAD:main"), "names main or master")
        self.fires(broken(push, "push origin HEAD:refs/heads/master"), "names main or master")
        self.fires(broken(push, 'push origin "HEAD:refs/heads/$branch" main'), "names main or master")
        self.fires(broken(push, 'push origin HEAD'), "must end with HEAD:refs/heads/$branch")
        self.fires(broken("          set -euo pipefail\n          gh label create \"$ALERT_LABEL\"",
                          "          set -euo pipefail\n          git push origin HEAD:refs/heads/x\n          gh label create \"$ALERT_LABEL\""), "git push appears in the report job")
        self.fires(broken("      - name: Fetch the counts and rebuild the data file", "      - run: git push origin HEAD:refs/heads/x\n      - name: Fetch the counts and rebuild the data file"), "git push appears in the fetch job")
        self.fires(broken("            main|master|*/main|*/master|refs/*)", "            refs/*)"), "refuse a branch named main or master")

    def test_a_push_split_over_lines_is_still_read(self):
        text = broken('push origin "HEAD:refs/heads/$branch"', 'push \\\n            --force \\\n            origin "HEAD:refs/heads/$branch"')
        self.fires(text, "forces")

    def test_merges_and_auto_merge(self):
        for extra in ('gh pr merge "$branch" --squash', 'gh pr merge --auto "$branch"', "git merge origin/main",
                      "gh api -X PUT repos/o/r/pulls/1/merge", "gh pr create --auto-merge",
                      "gh api graphql -f query='mutation { enablePullRequestAutoMerge }'"):
            text = broken('          gh pr create --repo', '          %s\n          gh pr create --repo' % extra)
            self.fires(text, "merges, enables auto-merge or calls the API")

    def test_regions_flag(self):
        self.fires(broken("run: python3 scripts/update_visitors.py\n", "run: python3 scripts/update_visitors.py --regions\n"), "--regions")
        self.fires(broken("run: python3 scripts/update_visitors.py\n", "run: python3 scripts/update_visitors.py --dry-run --regions\n"), "--regions")

    def test_updater_protections_kept(self):
        for flag in ("--allow-other-site", "--allow-empty", "--site other"):
            self.fires(broken("run: python3 scripts/update_visitors.py\n", "run: python3 scripts/update_visitors.py %s\n" % flag),
                       flag.split()[0])

    def test_checkout_without_persist_credentials_false(self):
        marker = "        with:\n          persist-credentials: false\n"
        self.fires(broken(marker, ""), "lacks persist-credentials: false")
        self.fires(broken(marker, "        with:\n          persist-credentials: true\n"), "lacks persist-credentials: false")

    def test_wiring(self):
        self.fires(broken("    needs: fetch\n", ""), "propose must need fetch")
        self.fires(broken("needs.fetch.outputs.changed == 'true' && ", ""), "propose condition")
        self.fires(broken("(github.event_name == 'schedule' || ", "("), "propose condition")
        self.fires(broken("&& inputs.create_pr", ""), "propose condition")
        self.fires(broken("needs.propose.result == 'failure'", "needs.propose.result == 'cancelled'"), "report must need")
        self.fires(broken("always() && ", ""), "report must need")
        self.fires(broken("    needs: [fetch, propose]\n", "    needs: [fetch]\n"), "report must need")
        self.fires(broken("python3 scripts/visitors_changed.py validate", "python3 scripts/visitors_changed.py summary"), "validate the file")
        self.fires(broken("          path: data/visitors.json\n", "          path: data/\n"), "only path is data/visitors.json")
        self.fires(broken(' --force\n          open=', '\n          open='), "idempotently")
        self.fires(broken("        type: boolean\n        default: false\n", "        type: boolean\n        default: true\n"), "defaults to false")
        self.fires(broken("    timeout-minutes: 5\n", ""), "timeout-minutes")

    def test_schedule_rules(self):
        self.fires(broken("cron: '23 7 * * 1'", "cron: '17 6 * * 1'"), "collides")
        self.fires(broken("cron: '23 7 * * 1'", "cron: '17 6 * * 1,2'"), "collides")
        self.fires(broken("cron: '23 7 * * 1'", "cron: '17 6 * * 0-3'"), "collides")
        self.fires(broken("cron: '23 7 * * 1'", "cron: '23 7 * * *'"), "weekly")
        self.fires(broken("cron: '23 7 * * 1'", "cron: '23 7 1 * *'"), "weekly")
        self.assertEqual(problems(broken("cron: '23 7 * * 1'", "cron: '17 6 * * 3'"), TILE), [])
        self.assertEqual(problems(broken("cron: '23 7 * * 1'", "cron: '18 6 * * 1'"), TILE), [])

    def test_cron_overlap_helper(self):
        self.assertTrue(cron_overlaps("17 6 * * 1", "17 6 * * 1"))
        self.assertTrue(cron_overlaps("17 6 * * 1,2", "17 6 * * 2-4"))
        self.assertFalse(cron_overlaps("17 6 * * 1", "17 6 * * 2"))
        self.assertFalse(cron_overlaps("23 7 * * 1", "17 6 * * 1"))
        self.assertFalse(cron_overlaps("17 7 * * 1", "17 6 * * 1"))
        self.assertTrue(cron_overlaps("*/5 6 * * 1", "17 6 * * 1"))                   # a step is not read: report
        self.assertTrue(cron_overlaps("17 6 * * MON", "17 6 * * 1"))                  # unreadable weekday: report


class Docs(unittest.TestCase):
    def test_owner_guide_describes_the_workflow(self):
        docs = read(DOCS)
        for needle in ("refresh-visitors.yml", "visitor-refresh", SECRET, "create_pr", "visitor-refresh-failed",
                       "visitor-data", "Read statistics", "Allow GitHub Actions to create and approve pull requests",
                       "60 days"):
            self.assertTrue(needle in docs, "docs/visitors-layer.md does not mention %r" % needle)
        self.assertFalse("deliberately not included" in docs, "the old 'deliberately not included' sentence is still in docs/visitors-layer.md")
        self.assertNotIn("--regions", TEXT)


if __name__ == "__main__":
    unittest.main(verbosity=2)

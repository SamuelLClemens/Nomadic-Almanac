# Handoff, 2026-11-11: visitor work closed out

State at handoff: `origin/main` is `3fa8b15` (plus this file's own merge), no pull requests and no issues are open, the latest GitHub Pages build is `built`, and the live service worker cache is `nomadic-v61` (the same as `main`). The work order on the visitor layer, from the first layer to the independent security review's fixes and the automatic refresh, is finished. What follows is what is true now, what was not verified, and what could start the next piece of work.

## Shipped

| Pull request | What it did | Merged |
|---|---|---|
| [55](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/55), [56](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/56), [57](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/57), [58](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/58) | Visitors layer, counting switched on for the GoatCounter site `nomadicalmanac`, first data file, owner guide | 2026-11-06 to 2026-11-10 |
| [59](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/59) | Desktop bottom navigation no longer clips "Journey" and "Settings" | 2026-11-10 |
| [60](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/60) | Weekly map tile check (`.github/workflows/tile-check.yml`, Mondays 06:17 UTC, opens an issue on failure) | 2026-11-10 |
| [62](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/62) | Security review findings 3, 6, 7, 8: updater key bound to one site (`EXPECTED_SITE`), redirects refused, tile check split into a read-only job and a label-deduplicated `report` job | 2026-11-10 |
| [63](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/63) | Finding 1: pinned, self-hosted `lib/count.js` | 2026-11-10 |
| [64](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/64) | Findings 4 and 5: floor 10, counts rounded down to a multiple of 5, date-only `updated`, empty data file, privacy notice and opt-out | 2026-11-11 |
| [65](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/65) | Finding 2: the Content-Security-Policy made real (`docs/csp.md`, guard `scripts/test_csp_policy.py`) | 2026-11-11 |
| [66](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/66) | Region level built and shipped switched off (`NA_VISITORS_REGIONS = false`, region floor 25) | 2026-11-11 |
| [67](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/67) | Scheduled workflow "Refresh visitor data" (`.github/workflows/refresh-visitors.yml`) | 2026-11-11 |
| [69](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/69) | The updater retries an HTTP 404 twice (5 s, then 15 s) before failing | 2026-11-11 |
| [70](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/70) | This handoff document | 2026-11-11 |
| [71](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/71) | The pinned actions moved from Node 20 to Node 24 builds (`actions/checkout` v7.0.1 in both workflows, `actions/upload-artifact` v7.0.2, `actions/download-artifact` v8.0.2) | 2026-11-11 |

Which finding went where follows the owner's plan of 2026-11-10 and each pull request's own description.

## State of the visitor layer

- Counting is on for `nomadicalmanac`. Every visitor whose browser allows it is counted, unless they use "Do not count my visits" in Settings. The count script is a pinned copy served from this site; the page loads nothing from the vendor's host.
- `data/visitors.json` is the honest empty document. No country has reached the floor (10 visits, published rounded down to a multiple of 5), so the Visitors layer shows "No visit data yet".
- Region level (visits by state or province) is switched on by slice G, [pull request 73](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/73) (`NA_VISITORS_REGIONS = true`, region floor 25, the refresh workflow passes `--regions`). No region pin appears until a region reaches 25 visits in a published country, and the layer is unchanged until then. The owner's statement of 2026-11-11 that Omri Siri signed off on it is recorded in `docs/visitors-layer.md`, "Region level" (not verified, not legal advice), together with whether the GoatCounter Region setting and the live response shape were verified.
- The data file refreshes by itself: every Monday at 07:23 UTC, in the environment `visitor-refresh` (limited to `main`, holding the read-only key as the secret `GOATCOUNTER_TOKEN`). It opens a pull request only when the published counts change, never pushes to `main`, never merges, and opens one issue when it fails. Owner steps, failure messages, key rotation and limits: `docs/visitors-layer.md`, Step 5. The key in the macOS Keychain is a separate key, for runs by hand.
- Tests: 205 Python tests in 7 files (185 before slice G), each run as `python3 -I scripts/test_NAME.py` (`test_count_js_pin`, `test_csp_policy`, `test_refresh_workflow`, `test_update_visitors`, `test_update_visitors_regions`, `test_visitor_regions_off`, `test_visitors_changed`). No CI runs them on pull requests; run them by hand when the updater, the workflows or the policy change.

## Verified

- 2026-11-11, after PR 71, both workflows run by hand on `main` (`3fa8b15`): "Map tile check" 7 of 7 layers healthy; "Refresh visitor data" (`create_pr` off) 0 countries kept, counts unchanged. Neither log has the Node 20 warning. The artifact steps, which run only when the counts change, were proven before the merge in a throwaway round trip on GitHub (run 42944574263, branch since deleted): upload, download, `validate`, `compare` and `summary` all worked on a synthetic file. A harmless Node `DEP0005` warning remains, printed by `download-artifact` v8's own bundle.
- 2026-11-11, refresh workflow on `main` (manual runs, `create_pr` off):
  - the first run failed on one HTTP 404 from GoatCounter, the failure issue opened (the alert path is proven), and the re-run about a minute later succeeded;
  - after PR 69, a second run succeeded on its first attempt: 0 countries kept, counts unchanged, no issue;
  - in both runs the key showed as `***`.
- 2026-11-10, production: the 16-check smoke suite passed at 1440, 375 and 1920 px; counting works end to end (a visit reaches the API after about 30 to 40 seconds; automated `HeadlessChrome` visits are not counted); no navigation label clips at 1024, 1440, 1920 and 375 px; the tile canary was healthy.
- 2026-11-10, load time (375 px, 4x CPU throttle): LCP about 2.0 s, total blocking time 666 ms; with a 1.6 Mbit/s link, LCP 4.6 s. Lab figures, not field data.

## Not done / known limits

- The first scheduled run of the refresh workflow has not happened yet (Monday 2026-11-16, 07:23 UTC, an hour after the tile check). Expect no pull request while the file is empty.
- The 404 retry has never been seen live: its waits (5 s, 15 s) are an unmeasured first estimate. A run log with the line "waiting 5 s and trying again" followed by success means it worked; a failure after both retries means `NOT_FOUND_WAITS` in `scripts/update_visitors.py` should be longer.
- The tile check's own failure step has never run on a real tile failure (the refresh workflow's alert path has).
- GitHub pauses scheduled workflows after 60 days without repository activity. Run a workflow once by hand (Actions tab, "Run workflow") to switch it back on.
- The real artifact steps have never run inside the refresh workflow itself (only in the round-trip copy); they first run when a country reaches the floor. If that run fails, the failure issue opens as usual.
- Ten of the eleven languages of the privacy notice are first drafts that a native reader should confirm; slice G added the region wording to all eleven.
- The live response shape for regions has never been seen. The owner confirmed on 2026-11-11 that Region is ticked in GoatCounter, and a live `--regions --dry-run` ran cleanly that day, but no country was published, so no region request was made. The first run with a published country shows the `rows matched no region code` count.
- Speed: stop. Reopen only if real users report slowness.
- GitHub Pages names a deployment after its commit. If a deploy times out, a re-run for the same commit is refused with "Deployment cancelled"; merge a new commit.
- The auto-mode classifier refuses `gh pr merge` and `gh run cancel`, so the owner merges pull requests on GitHub. It allowed `gh pr ready` and `gh workflow run`.

## Open decisions (need the owner)

1. Region level is on. Still open: a written confirmation from Omri Siri if the owner wants one on file (the sign-off recorded is the owner's statement of 2026-11-11), and a native reader for the region wording in the ten non-English languages. After the owner merges slice G, watch the next scheduled refresh run (Mondays 07:23 UTC): it must pass `--regions` cleanly, and the `fetch` log shows how many regional rows matched no code.
2. Housekeeping outside the site (root checkout `/Users/zim/Claude Code`): on 2026-11-11, with the owner's approval and each item re-verified first, 9 merged worktrees (about 380 MB) and 51 merged local branches were removed with `git worktree remove` and `git branch -d` (never `--force`, never `-D`). Left, on purpose: 35 worktrees (about 1.5 GB) that hold nothing but a base commit but belong to Better Volunteer and Mekong sessions that are still open (archive those sessions first, then they can go); the preview worktree `nomadic-almanac-main`; the session worktree `refresh-visitor-data` and its merged branches `ci/actions-node24`, `docs/handoff-na-closeout` and `docs/handoff-final`; the branch `feat/gates-v2.1`, which is merged into `main` but git refuses a plain delete because its remote counterpart lacks one local commit; and three branches that are not merged and need the owner's word (`feature/design-overhaul-v1`, `ui-master-build-v2`, `wip/lcp-tbt-experiment`). Remote branches of merged pull requests were not touched.

## How to run things (no secrets in this file)

- By hand: `GOATCOUNTER_TOKEN="$(security find-generic-password -s goatcounter-nomadicalmanac -a "$USER" -w)" python3 scripts/update_visitors.py --dry-run`, then without `--dry-run`, then commit `data/visitors.json` on a branch and open a pull request. Never commit to `main`. If the Keychain entry is gone, create a new key with only "Read statistics" and store it with the prompted command in `docs/visitors-layer.md`.
- The workflow uses its own key (the environment secret). To rotate or revoke it, see `docs/visitors-layer.md`, Step 5. Deleting one key does not affect the other.
- Tools: audit drivers are in `~/Library/Caches/nomadic-audit/`. They need headless Chrome with `--no-sandbox`, and macOS has no `timeout` command. Any test that loads the live site must make `gc.zgo.at` and `*.goatcounter.com` unreachable, or it counts a visit.
- Project memory notes: `nomadic-almanac-audit-2026-11-05`, `nomadic-almanac-load-and-nav-2026-11-10`, `na-finish-plan-2026-11-10`, `na-csp-slice-c-2026-11-11`, `na-region-slice-d-2026-11-11`.

## Next session prompt

> Read docs/HANDOFF.md and docs/visitors-layer.md. First, in the Actions tab, check the "Map tile check" run of Monday 2026-11-16 (06:17 UTC) and the "Refresh visitor data" run (07:23 UTC): both should be green, and the second should report `changed=false` unless a country has reached 10 visits. If a run is red, read its log before anything else; the refresh workflow's messages are explained in `docs/visitors-layer.md`, Step 5. If the refresh run opened a pull request, review the diff against the contract in that document.
> Done when: both runs are accounted for, and any open decision above the owner has answered is acted on.
> Out of scope: speed work, any commit to `main`.

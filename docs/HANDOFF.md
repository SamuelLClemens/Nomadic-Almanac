# Handoff, 2026-11-10

State at handoff: `origin/main` is `baf8ee1`, no pull requests are open, the latest GitHub Pages build is `built`, and the live service worker cache is `nomadic-v57`.

## Shipped

- Visitors layer (one pin per country, sized by visits, read from `data/visitors.json`): [PR 55](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/55), `d88a169`, merged 2026-11-06.
- Visit counting switched on for the GoatCounter site `nomadicalmanac` (`NA_ANALYTICS_SITE` set, service worker cache v56): [PR 56](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/56), `d733627`.
- First data file, Israel with 3 visits: [PR 57](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/57), `28a1a33`.
- Owner guide updated (Keychain recipe, first live run, limits found while testing): [PR 58](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/58), `3e50503`.
- Desktop bottom navigation no longer clips "Journey" and "Settings" (cache v57): [PR 59](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/59), `0d0c256`.
- Weekly map tile check (`.github/workflows/tile-check.yml`, Mondays 06:17 UTC, opens an issue on failure): [PR 60](https://github.com/SamuelLClemens/Nomadic-Almanac/pull/60), `baf8ee1`.

## Verified (2026-11-10, production unless stated)

- Smoke suite (`~/Library/Caches/nomadic-audit/interact.py`, 16 checks): 16 of 16 at 1440, 375 and 1920 px, run with the analytics hosts unresolvable so no visit was counted.
- Visitors layer from the real data file: one pin on Israel labelled 3, inside the viewport, with a correct legend and tooltip, at 1440 and 375 px. No uncaught errors, no sideways scroll, no IP-address-shaped text on the page.
- Counting works end to end: the count script loads after boot, the request to the account is accepted, and a visit reaches the GoatCounter API after about 30 to 40 seconds. Automated headless visits (`HeadlessChrome`) were not counted in testing.
- Updater `scripts/update_visitors.py` ran against the live account. Its first call returned HTTP 404 once and later calls succeeded; the cause is unknown. A later read of the per-country query showed Israel at 4 visits.
- Navigation: no label clipped at 1024, 1440, 1920 and 375 px.
- Tile canary: 7 of 7 layers healthy locally, and the "Map tile check" workflow passed on GitHub's runner.
- Load time (live, 375 px, 4x CPU throttle, fresh profile, 30 s window, vendor script blocked): a quiet batch of 6 gave LCP 2026 ms, TBT 666 ms and longest task 284 ms. With a 1.6 Mbit/s link throttle LCP was 4600 ms. A TBT rise of about 0.2 s after the visitor layer appeared in one batch and did not replicate in a calibration-gated batch of 10 (median -100 ms, higher in 4 of 10 rounds); no build step introduces it. Pair-to-pair TBT noise is about 0.55 s, so about 70 pairs would be needed to resolve 0.2 s.

## Not done / known issues

- Region level reporting is not built. The owner reports saving the GoatCounter data-collection setting with Country only and Region off; this was not verified because it sits behind the owner's login. Omri Siri signed off on the country-level layer; whether region needs a fresh sign-off is his decision.
- `data/visitors.json` is a snapshot of 3 Israel visits, one of which was an automated test visit made while verifying. The current count is 4. No refresh is scheduled.
- No independent security review of the visitor layer has been done.
- Speed: TBT of 666 ms is above the usual 200 ms target, and slow-link LCP is 4.6 s. These are lab models, not field data, and not a regression.
- The tile check's failure step (opening an issue) has never run on a real failure.
- GitHub Pages names a deployment after its commit. The deploy of `28a1a33` timed out in the "syncing files" stage, and a re-run or new build request for the same commit is refused with "Deployment cancelled". Only a new commit deploys again. A queued run, `42723789925`, cannot be cancelled and is harmless.
- Housekeeping outside the site: the owner's root checkout is on the stale branch `feat/nav-rebuild-qa`; the preview worktree `.claude/worktrees/nomadic-almanac-main` still serves `b608d97`; the worktree `.claude/worktrees/visitor-map-layer` (merged branch) can be removed.
- The auto-mode classifier refuses `gh pr merge` and `gh run cancel`, so the owner merges pull requests on GitHub.

## Open decisions (need the owner)

1. Region level: ask Omri Siri whether region reporting needs a fresh sign-off before it is switched on in GoatCounter. Recommended: keep Region off until he answers.
2. Refreshing `data/visitors.json`: by hand, or a weekly scheduled run on the owner's Mac that opens a pull request. Recommended: by hand until several countries pass the floor of 3, because each refresh is a pull request and a Pages deploy.
3. Speed: stop here, or open an optimisation slice for TBT. Recommended: stop unless real users report slowness.
4. Independent security review of the visitor layer. Recommended: yes, as the next slice.

## How to run things (no secrets in this file)

- Updater: the API key lives in the macOS Keychain, service `goatcounter-nomadicalmanac`, account is the Mac user name. Run `GOATCOUNTER_TOKEN="$(security find-generic-password -s goatcounter-nomadicalmanac -a "$USER" -w)" python3 scripts/update_visitors.py --dry-run`, then the same without `--dry-run`, then commit `data/visitors.json` on a branch and open a pull request. If the Keychain entry is gone, create a new key with only the "Read statistics" permission at `https://nomadicalmanac.goatcounter.com/user/api` and store it with the prompted command in `docs/visitors-layer.md`.
- Tools: audit drivers are in `~/Library/Caches/nomadic-audit/`. They need headless Chrome with `--no-sandbox`, so the tool sandbox must be off, and macOS has no `timeout` command. Any test that loads the live site must make `gc.zgo.at` and `*.goatcounter.com` unreachable, or it counts a visit.
- Project memory notes: `nomadic-almanac-audit-2026-11-05` and `nomadic-almanac-load-and-nav-2026-11-10`.

## Next session prompt

> Read docs/HANDOFF.md and docs/visitors-layer.md. Task: independent security review of the visitor layer. Scope: the `NA_ANALYTICS_SITE` handling and `_naAnalyticsInit`, the `_naVisitors*` code and its parsing of `data/visitors.json` in `app.js`; `scripts/update_visitors.py`; the Content-Security-Policy in `index.html`; `.github/workflows/tile-check.yml`.
> Done when: a ranked list of findings, each with `file:line`, severity and a concrete failure scenario, and nothing changed in the repository.
> Out of scope: region level, speed work, fixing findings (needs the owner's approval first), any commit to `main`.

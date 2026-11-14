# Update delivery: how a release reaches an installed copy

Written 2026-11-13, release 65. The owner's rule (every project): every update reaches every installed
copy, whenever it was installed or saved to a Home Screen; no update may make anyone lose what they
entered; information is never compromised.

## The problem

A visitor who opens the site in a fresh browser tab always gets the current files. A Home Screen icon
(or any open tab) is different: iOS keeps a closed-looking Home Screen app suspended for hours or days
and resumes the same page when it is tapped. That page never asks the server anything, so before
release 65 nothing could tell it that a newer release existed. The service worker (`sw.js`) only helps
at launch. Release 65 adds the missing step: the page asks.

## The pieces

| File | Role |
|---|---|
| `na-update.js` | Runs in every page. Asks the server for `version.json`, reloads or shows a banner, and writes the release line in Preferences. Independent of `app.js`, so a release whose `app.js` fails to start can still be replaced. |
| `version.json` | `{"version": 65}`. Never cached by the worker, always read from the network. |
| `sw.js` | Network-first for the site's own files, asking the server to revalidate (the browser's own copy lives ten minutes on GitHub Pages). Steps aside for `version.json`. `CACHE = 'nomadic-v65'`. |
| `Nomadic-Almanac/index.html` | A redirect to the app. From 2026-05-31 to 2026-11-05 `manifest.json` named `/Nomadic-Almanac/` as the start page, which is a 404 on `nomadicalmanac.com`; an icon saved in that period can still start there. Keep this file. |
| `scripts/bump_version.py` | Raises the number in `sw.js`, `version.json` and `na-update.js` together. |
| `scripts/check_update_delivery.py` | The guard (below). Tests: `scripts/test_update_delivery.py`. CI: `.github/workflows/update-delivery.yml`. |

The release number lives in three places and must be the same in all of them. Do not edit it by hand.

## Shipping a release

1. Make the change on a branch.
2. `python3 scripts/bump_version.py` (adds one; `--to N` sets a number).
3. `python3 -I scripts/check_update_delivery.py --base origin/main`, then every `python3 -I scripts/test_*.py`.
4. Open a pull request. The "Update delivery guard" check fails it if shipped files changed without a new
   number, if the three numbers differ, if a file in the worker's precache list does not exist (one missing
   file makes the worker's install fail), or if `manifest.json` names an absolute start page.
5. The owner merges. After the Pages build, `curl -s https://nomadicalmanac.com/version.json` shows the new
   number. Copies pick it up the next time they come back to the app (below).

Exempt from the bump: `docs/`, `scripts/`, `.github/`, `.claude/`, any `*.md`, `CNAME`, `serve.py` and
`data/visitors.json` (read on demand and refreshed weekly by a bot).

## What a copy does

| Moment | What happens |
|---|---|
| About 8 seconds after launch | Asks for `version.json`. Newer: reload at once if nothing typed is at risk, otherwise the banner. |
| Back in the app after 30 seconds or more | The same. Detected by `visibilitychange`, `pageshow`, and a 5-second heartbeat (a long gap between ticks means the page was suspended). |
| In continuous use, every 10 minutes | Banner only. It never reloads under the user's hands. |
| A new worker takes over while the page is open | Asks again; banner only. |
| Offline or `version.json` unreachable | Nothing, silently. A request that fails at once (the connection may still be waking up after the resume) is tried once more after 3 seconds; a request that gets no answer is abandoned after 12 seconds and not repeated. The next trigger asks again. |

Each check also asks the worker to look for a new `sw.js`, so the offline copy keeps up.

## Rolling back

A copy acts only on a number higher than its own, so lowering the number does nothing for copies that already
run the higher release. To undo a release, revert the change on a branch and raise the number again with
`scripts/bump_version.py`; the revert then arrives like any other release.

Before a reload the page refreshes its own address and every same-origin script and stylesheet with
`cache: 'no-cache'`, so the reload cannot be answered from a ten-minute-old browser copy and bring back
the release that is already running. A page produced by a reload less than two minutes ago is not
reloaded again (it shows the banner instead), so a stale copy somewhere cannot cause a loop.

The banner reads "Update ready" with Reload and Later. Later hides it for ten minutes. Its text is English
only; the rest of the interface has languages, the banner does not yet.

## Protecting what people typed and saved

- A reload never runs over text the user wrote and has not saved: a `textarea` or text `input` that is on
  screen and whose value differs from its original value (the Journal editor holding a draft). If the page
  cannot tell, it assumes there is something. With unsaved text the banner appears; tapping Reload says
  "Save your text first". Three kinds of field never block an update: fields nobody can see (the Journal
  hides its editor after Save or Cancel but keeps the textarea, with the text in it), throwaway fields
  (search boxes, number fields such as the tip calculator, anything marked `data-na-ephemeral`), and a
  field still holding its original value. A new field that keeps what the user writes is protected by
  default; mark it `data-na-ephemeral` only if its text is throwaway.
- `na-update.js` reads and writes no `localStorage` or `sessionStorage`. Journal notes, wishlist, visited
  countries, trip pins and preferences are written only by `app.js` and are untouched by an update. The
  worker's caches hold code only (`nomadic-v<N>`), never user data.
- The only request `na-update.js` makes is a plain GET of `version.json` (no identifiers, no cookies, same
  origin). The Content-Security-Policy needed no change; `scripts/test_csp_policy.py` now scans the file.

## What it cannot do

1. **Copies already on phones have no update logic.** Release 65 reaches them the old way: on their next
   fresh launch (iOS closes a suspended app when it needs the memory, or swipe the app away once from the
   app switcher and reopen it). Nothing forces a reload, because the old page cannot say whether anything
   typed would be lost. From release 65 on, copies update themselves.
2. **Icons saved from `samuellclemens.github.io/Nomadic-Almanac/`** (before 2026-06-11). That address now
   answers `301` to `nomadicalmanac.com`. A worker script cannot be fetched through a redirect (the
   specification forbids it, not tested on a device), so the old worker there may never update, although
   the page itself loads through the redirect while online. Data saved under the old address stays in that
   address's storage; code on the new address cannot read it. Saving the icon again from
   `nomadicalmanac.com` is the clean fix. The release line in Preferences shows the address in use.
3. **The manifest is read when the icon is added.** Changes to its name, icons or start page do not reach
   installed icons (whether a newer iOS ever refreshes them is not confirmed). That is why the redirect
   page above must stay.
4. **A release published while someone is offline** arrives at their first return while online.
5. **Safari tabs** (not Home Screen apps): tracking prevention can clear a site's storage after a period
   without use. That is outside updates and is not addressed here.

## Reading what a phone runs

Preferences (the Settings button), last line: `v65 · nomadicalmanac.com`. A different address means the icon
was saved from an old address.

## Checking a release on a real phone

Version N live, icon already on the Home Screen:

1. Swipe the app away from the app switcher and open the icon. Preferences should read `vN` (the fresh-launch
   path).
2. Open the app, press the side button to lock the phone or switch to another app for a minute, publish
   release N+1, then return. Within a few seconds the app reloads and Preferences reads `vN+1`. If a Journal
   note was being typed, the banner appears instead and the note is intact.

## Tests

- `python3 -I scripts/test_update_delivery.py` covers the guard and the bump script with temporary trees and
  repositories.
- The real-Chrome harness is `~/Library/Caches/nomadic-audit/update_flow.py` (outside the repository, with the
  other audit drivers; needs Chrome and the tool sandbox off). It serves a copy of the site with
  GitHub-Pages-like headers (`max-age=600`, ETag, 304), registers the real worker, publishes release N+1
  while the page is open, and drives the return. Time and visibility are simulated in the page; the worker,
  fetches, reloads and input are real.

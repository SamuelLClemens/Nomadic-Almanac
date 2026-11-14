// Update delivery for installed copies (docs/update-delivery.md).
//
// Why this file exists: the service worker (sw.js) makes sure a FRESH LAUNCH receives the current
// files, but an app that is already open, or suspended in the background the way iOS keeps a Home
// Screen app for days, never launches again and so never learns that a newer release exists. This
// script asks.
//
// What it does:
//  - On coming back to the app after AWAY_MS or more, and once shortly after launch, it fetches
//    version.json from the network. If the release there is newer than VERSION below it reloads the
//    page at once, unless the user has typed something that a reload would discard; then it shows a
//    small "Update ready" banner instead.
//  - While the app stays in use it asks again every POLL_MS and shows the banner. It never reloads
//    under the user's hands.
//  - It asks the service worker to look for a new sw.js, so the offline copy keeps up.
//  - It prints the release in Settings (#na-version-line), so anyone can read what their phone runs.
//
// What it never does: read or write localStorage or sessionStorage, send anything but a plain GET
// for version.json, or reload over text the user has typed and not saved (the Journal editor, a
// search box). Saved notes, wishlist, visited countries and preferences are not touched.
//
// It is deliberately independent of app.js, so a release whose app.js fails to start can still be
// replaced by the next one. Keep it small and keep it in step: VERSION below must equal CACHE in
// sw.js and "version" in version.json. scripts/bump_version.py sets all three, and
// scripts/check_update_delivery.py fails the pull request when they differ or when shipped files
// change without a new version.
(function () {
  'use strict';

  var VERSION = 65;

  var AWAY_MS = 30000;          // away at least this long: coming back counts as a "return"
  var POLL_MS = 600000;         // while the app is in use, ask this often (ten minutes)
  var TICK_MS = 5000;           // heartbeat; a gap far longer than this means the page was suspended
  var MIN_GAP_MS = 15000;       // never ask more often than this
  var CHECK_TIMEOUT_MS = 12000; // give up on one request after this (signal bars but no data must not hang it)
  var RETRY_MS = 3000;          // a request that failed is tried once more after this (the radio may be waking up)
  var RELOAD_WAIT_MS = 4000;    // longest wait for fresh copies before the reload goes ahead
  var LOOP_MS = 120000;         // a page that a reload produced this recently is not reloaded again

  window.NA_VERSION = VERSION;

  var script = document.currentScript;
  var VERSION_URL = 'version.json';
  try { VERSION_URL = new URL('version.json', script && script.src ? script.src : document.baseURI).href; }
  catch (e) { /* keep the relative address */ }

  var checking = false;
  var reloading = false;
  var lastCheck = 0;
  var lastTick = Date.now();
  var hiddenAt = 0;
  var snoozedUntil = 0;
  var bar = null;

  // True when a field on screen holds text the user wrote and has not saved. A reload would discard
  // it, so it blocks every automatic reload. Three kinds of field never count:
  //  - fields nobody can see. The Journal keeps its textarea after Save or Cancel and only hides the
  //    editor, so a hidden field holds either saved text or text the user chose to abandon;
  //  - fields that hold throwaway text: search boxes, number fields (the tip calculator) and anything
  //    marked data-na-ephemeral;
  //  - a field still holding its original value (a saved note that was opened and not changed).
  // A new field that keeps what the user writes is protected by default. When the page cannot tell,
  // it assumes "yes".
  var KEEP_TYPES = { text: 1, email: 1, tel: 1, url: 1, password: 1 };

  function onScreen(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function unsavedInput() {
    try {
      var fields = document.querySelectorAll('textarea, input');
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (f.hasAttribute('data-na-ephemeral')) continue;
        if (f.tagName === 'INPUT' && !KEEP_TYPES[(f.type || '').toLowerCase()]) continue;
        if (!onScreen(f)) continue;
        if (f.value !== f.defaultValue) return true;
      }
      var editable = document.querySelectorAll('[contenteditable=""], [contenteditable="true"]');
      for (var j = 0; j < editable.length; j++) {
        if (onScreen(editable[j]) && (editable[j].textContent || '').trim()) return true;
      }
      return false;
    } catch (e) {
      return true;
    }
  }

  // True when this page was itself produced by a reload moments ago. If it is still behind after
  // that, something is wrong (a stale copy somewhere), so it shows the banner instead of reloading
  // in a loop. It uses the navigation type, not storage, so it also works where storage is blocked.
  function recentlyReloaded() {
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      var type = nav ? nav.type : ((performance.navigation && performance.navigation.type === 1) ? 'reload' : '');
      return type === 'reload' && performance.now() < LOOP_MS;
    } catch (e) {
      return performance.now() < LOOP_MS;
    }
  }

  // The page address and every same-origin script and stylesheet the page uses. Fetching these with
  // cache: 'no-cache' revalidates them with the server and refreshes the browser's own copy, which
  // GitHub Pages lets live for ten minutes. Without it a reload can be answered from that copy and
  // bring back the release that is already running.
  function ownFiles() {
    var urls = [location.href.split('#')[0]];
    try {
      var nodes = document.querySelectorAll('script[src], link[rel="stylesheet"][href]');
      for (var i = 0; i < nodes.length; i++) {
        var u = nodes[i].src || nodes[i].href;
        if (u && u.indexOf(location.origin + '/') === 0 && urls.indexOf(u) < 0) urls.push(u);
      }
    } catch (e) { /* the page address alone is still worth refreshing */ }
    return urls;
  }

  function reloadNow() {
    if (reloading) return;
    reloading = true;
    var finished = false;
    function go() {
      if (finished) return;
      finished = true;
      reloading = false;
      if (unsavedInput()) { blocked(); return; }       // the user typed while the copies were refreshed
      location.reload();
    }
    try {
      var jobs = ownFiles().map(function (u) {
        return fetch(u, { cache: 'no-cache', credentials: 'same-origin' }).catch(function () {});
      });
      Promise.all(jobs).then(go, go);
    } catch (e) {
      go();
    }
    setTimeout(go, RELOAD_WAIT_MS);                    // never wait on a slow link for ever
  }

  function hideBar() {
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    bar = null;
  }

  function showBar() {
    if (bar || Date.now() < snoozedUntil || !document.body) return;
    var wrap = document.createElement('div');
    wrap.id = 'na-update-bar';
    var box = document.createElement('div');
    box.className = 'na-update-banner';
    box.setAttribute('role', 'status');
    var msg = document.createElement('span');
    msg.className = 'na-update-msg';
    msg.textContent = 'Update ready';
    var go = document.createElement('button');
    go.type = 'button';
    go.className = 'na-update-btn';
    go.textContent = 'Reload';
    var later = document.createElement('button');
    later.type = 'button';
    later.className = 'na-update-later';
    later.textContent = 'Later';
    go.addEventListener('click', function () {
      if (unsavedInput()) { msg.textContent = 'Save your text first'; return; }
      msg.textContent = 'Updating…';
      reloadNow();
    });
    later.addEventListener('click', function () {
      snoozedUntil = Date.now() + POLL_MS;
      hideBar();
    });
    box.appendChild(msg);
    box.appendChild(go);
    box.appendChild(later);
    wrap.appendChild(box);
    document.body.appendChild(wrap);
    bar = wrap;
  }

  function blocked() {
    showBar();
    var msg = bar && bar.querySelector('.na-update-msg');
    if (msg) msg.textContent = 'Save your text first';
  }

  function onNewer(reason) {
    var arrived = reason === 'return' || reason === 'launch';
    if (arrived && !unsavedInput() && !recentlyReloaded()) reloadNow();
    else showBar();
  }

  function pokeWorker() {
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
        navigator.serviceWorker.getRegistration()
          .then(function (reg) { if (reg) return reg.update(); })
          .catch(function () {});
      }
    } catch (e) { /* no worker: the check below still works */ }
  }

  function check(reason, retry) {
    var t = Date.now();
    if (checking || document.hidden) return;
    if (!retry && reason !== 'launch' && t - lastCheck < MIN_GAP_MS) return;
    checking = true;
    lastCheck = t;
    pokeWorker();
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, CHECK_TIMEOUT_MS);
    function done() { clearTimeout(timer); checking = false; }
    try {
      fetch(VERSION_URL, { cache: 'no-store', credentials: 'same-origin', signal: ctl ? ctl.signal : undefined })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (doc) {
          var remote = doc && Number(doc.version);
          if (remote && remote > VERSION) onNewer(reason);
        })
        .then(done, function (err) {
          done();
          // A request made the moment the app was resumed can fail while the connection wakes up: once
          // more, shortly after. A request that timed out is not repeated (the link is bad, not waking).
          if (!retry && !(err && err.name === 'AbortError')) setTimeout(function () { check(reason, true); }, RETRY_MS);
        });
    } catch (e) {
      done();
    }
  }

  function onVisible() {
    var away = hiddenAt ? Date.now() - hiddenAt : 0;
    hiddenAt = 0;
    if (away >= AWAY_MS) check('return');
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) hiddenAt = Date.now();
    else onVisible();
  });
  window.addEventListener('pagehide', function () { hiddenAt = Date.now(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) onVisible(); });

  // The events above can be missed (older iOS versions skip some of them). Timers do not run while a
  // page is suspended, so a long gap between two ticks shows that the page was away.
  setInterval(function () {
    var t = Date.now();
    var gap = t - lastTick;
    lastTick = t;
    if (document.hidden) return;
    if (gap >= AWAY_MS) { hiddenAt = 0; check('return'); return; }
    if (t - lastCheck >= POLL_MS) check('poll');
  }, TICK_MS);

  window.addEventListener('load', function () { setTimeout(function () { check('launch'); }, 8000); });

  // A new worker that takes over while the page is open also means a newer release may exist.
  try {
    if (navigator.serviceWorker) {
      var hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (hadController) check('poll');
      });
    }
  } catch (e) { /* no worker support */ }

  function showVersion() {
    var el = document.getElementById('na-version-line');
    if (el) el.textContent = 'v' + VERSION + ' · ' + location.host;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showVersion);
  else showVersion();
})();

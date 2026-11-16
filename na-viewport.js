/* na-viewport.js: an iPhone Home Screen app whose page is shorter than the screen. ASCII-only source.
 *
 * Measured on a real iPhone (owner, 2026-11-16, release 66): window 390x797, screen 390x844, safe areas
 * 47 top and 34 bottom. The page starts under the status bar (y = 0) but is only as tall as the screen
 * minus the status-bar inset, so the bottom 47px of the screen lie outside the page and the bottom menu
 * sits 47px above the screen edge. WebKit bugs 237961 and 210009 describe the same family of defects.
 * This file:
 *   1. detects that signature (Home Screen app, portrait, screen height minus window height equals the
 *      top safe area) and tells the stylesheet through --na-vp-short, so the strip under the bottom menu
 *      is not added on top of the missing 47px;
 *   2. offers an opt-in full-height layout (html.na-fullh: the page is as tall as the screen). Only a real
 *      phone can show that the strip below the window can be drawn on and tapped, so the layout is tried for
 *      10 seconds and kept only when the owner taps the bottom menu while it is on; otherwise it undoes
 *      itself. The choice is the only thing stored (localStorage "na_fullh" = "1"). Nothing is sent anywhere.
 * Independent of app.js on purpose, like na-update.js.
 */
(function () {
  'use strict';

  var KEY = 'na_fullh';        // "1" once the full-height layout has been kept on this phone
  var TRY_MS = 10000;          // how long the layout is tried before it undoes itself
  var root = document.documentElement;
  var testing = false;         // the ten-second try is running
  var keptNow = false;         // kept in this session, even when the phone would not store the choice
  var tryTimer = 0, tickTimer = 0, hideTimer = 0, left = 0, bar = null;

  function stored() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }

  function standalone() {
    return navigator.standalone === true ||
      !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  }

  // The status-bar inset in px: 0 on a computer, on Android and on any phone that reports none.
  function insetTop() {
    var probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px)';
    (document.body || root).appendChild(probe);
    var px = parseInt(getComputedStyle(probe).paddingTop, 10) || 0;
    probe.parentNode.removeChild(probe);
    return px;
  }

  // null, or { gap, top, tall }: a Home Screen app in portrait whose page is shorter than the screen by about
  // the status-bar inset (390x797 in a 390x844 screen with a 47px inset on the owner's phone). While the
  // full-height layout is on, the window may report either height, so it only has to be that tall or taller;
  // a shorter window (the keyboard is open) or a landscape window turns the layout off again.
  function environment(fullOn) {
    if (!standalone()) return null;
    var h = window.innerHeight, w = window.innerWidth;
    if (!(h > w)) return null;
    var tall = Math.max(screen.width || 0, screen.height || 0);
    var top = insetTop();
    var gap = tall - h;
    if (top < 20) return null;
    if (fullOn) {
      if (h < tall - top - 3) return null;
    } else if (gap < 20 || Math.abs(gap - top) > 3) {
      return null;
    }
    return { gap: Math.max(gap, 0), top: top, tall: tall };
  }

  function refresh() {
    var fullOn = root.classList.contains('na-fullh');
    var env = environment(fullOn);
    var want = !!env && (testing || keptNow || stored());
    root.style.setProperty('--na-vp-short', (env && !want ? env.gap : 0) + 'px');
    if (want) root.style.setProperty('--na-full-h', env.tall + 'px');
    else root.style.removeProperty('--na-full-h');
    if (fullOn !== want) {
      root.classList.toggle('na-fullh', want);
      // The map measures itself on a window resize.
      try { window.dispatchEvent(new Event('resize')); } catch (e) { /* no synthetic events */ }
    }
  }

  function removeBar() {
    clearTimeout(hideTimer);
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    bar = null;
  }

  function message() {
    var m = bar && bar.firstChild;
    if (m) m.textContent = 'Full-height test, ' + left + ' seconds left. Is the whole bottom menu, labels included, ' +
      'at the very bottom of the screen? Tap Explore to keep it, or tap Undo.';
  }

  function showBar() {
    removeBar();
    bar = document.createElement('div');
    bar.id = 'na-vp-bar';
    bar.className = 'na-update-banner';
    bar.setAttribute('role', 'status');
    var text = document.createElement('span');
    text.className = 'na-vp-msg';
    var undo = document.createElement('button');
    undo.type = 'button';
    undo.className = 'na-update-later';
    undo.textContent = 'Undo';
    undo.addEventListener('click', function () { finish(false); });
    bar.appendChild(text);
    bar.appendChild(undo);
    document.body.appendChild(bar);
    message();
  }

  // A tap on the bottom menu while the layout is on proves it can be drawn on and tapped.
  function onTap(e) {
    var nav = document.getElementById('na-bottom-nav');
    if (nav && e.target && nav.contains(e.target)) finish(true);
  }

  function finish(kept) {
    clearTimeout(tryTimer);
    clearInterval(tickTimer);
    document.removeEventListener('click', onTap, true);
    testing = false;
    var saved = true;
    if (kept) {
      keptNow = true;
      try { localStorage.setItem(KEY, '1'); } catch (e) { saved = false; }
    }
    refresh();
    if (bar) {
      bar.firstChild.textContent = !kept ? 'Not kept. The layout is back to normal.'
        : (saved ? 'Kept. The bottom menu now uses the full screen on this phone.'
          : 'Kept for now. This phone would not let the app save the choice.');
      bar.lastChild.hidden = true;
      hideTimer = setTimeout(removeBar, 4500);
    }
  }

  function tick() {
    left -= 1;
    if (left > 0) message();
  }

  function test() {
    if (testing || !environment(root.classList.contains('na-fullh'))) return false;
    testing = true;
    refresh();
    left = Math.round(TRY_MS / 1000);
    showBar();
    document.addEventListener('click', onTap, true);
    tickTimer = setInterval(tick, 1000);
    tryTimer = setTimeout(function () { finish(false); }, TRY_MS);
    return true;
  }

  function off() {
    keptNow = false;
    try { localStorage.removeItem(KEY); } catch (e) { /* nothing was stored */ }
    refresh();
  }

  window.naViewport = {
    // available: this phone shows the short-window signature; on: the full-height layout is on now;
    // stored: the owner kept it on this phone.
    state: function () {
      var on = root.classList.contains('na-fullh');
      return { available: !!environment(on), on: on, stored: stored() };
    },
    test: test,
    off: off
  };

  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('orientationchange', refresh);
  window.addEventListener('pageshow', refresh);
  refresh();
})();

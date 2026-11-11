// Boot helpers that used to be inline in index.html. They live in a same-origin file so the page's
// Content-Security-Policy can refuse inline scripts (see docs/csp.md). Loaded with `defer`, first in
// document order, so it runs after parsing and before leaflet.js, data.js and app.js.
(function () {
  'use strict';

  // 1. Non-blocking Google Fonts. The stylesheet link in index.html starts as media="print", which
  //    does not block first paint; once it has arrived it is switched to "all". This replaces the old
  //    inline onload="this.media='all'". If it loaded before this script ran, link.sheet is already
  //    set and the switch happens at once; otherwise the load event does it. If Google Fonts is slow
  //    or blocked the page simply keeps its fallback fonts (display=swap), as before.
  var fonts = document.getElementById('na-fonts-css');
  if (fonts) {
    var showFonts = function () { fonts.media = 'all'; };
    if (fonts.sheet) showFonts();
    else fonts.addEventListener('load', showFonts, { once: true });
  }

  // 2. Service worker registration. The worker's install precaches about 15 MB (country polygons,
  //    county tables, scripts). Started at window load on a first visit it competed with the page's own
  //    country-polygon download on a slow link, so app.js calls _naSwRegister once the page is quiet
  //    (polygons built, data-detail.js loaded). The timer is only a backstop in case that never
  //    happens (a boot error, say).
  if ('serviceWorker' in navigator) {
    window._naSwRegister = function () {
      if (window._naSwDone) return;
      window._naSwDone = true;
      navigator.serviceWorker.register('./sw.js')
        .catch(function (e) { console.warn('SW registration failed:', e); });
    };
    window.addEventListener('load', function () { setTimeout(window._naSwRegister, 20000); });
  }
})();

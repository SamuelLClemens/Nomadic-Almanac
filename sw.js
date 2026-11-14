// Bump CACHE whenever a shipped file changes: python3 scripts/bump_version.py raises it here, in
// version.json and in na-update.js together, and scripts/check_update_delivery.py fails the pull
// request when they differ or when shipped files change without a new number. The activate handler
// deletes every cache whose name is not CACHE, so returning visitors drop stale copies on their next
// visit; na-update.js uses the same number to tell an open app that a newer release exists.
const CACHE = 'nomadic-v65';
const CORE = [
  './', './index.html', './app.js', './na-boot.js', './na-update.js', './data.js', './data-cities.js', './data-detail.js', './data-admin2.js', './style.css',
  './lib/leaflet.js', './lib/leaflet.css',
  './data/countries.geojson',
  './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
];

// How long our own files wait for the network before the cached copy is served instead. Without a
// limit, a "lie-fi" connection (signal bars but no data) leaves a returning visitor looking at a
// blank page for the browser's full timeout while a good copy sits in the cache.
const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only GET requests are cacheable. cache.put() throws on POST/PUT/etc., so non-GET requests
  // (the optional Anthropic API call, Overpass POSTs) pass straight through to the network.
  if (e.request.method !== 'GET') return;

  // Only our own files are handled here. Map tiles, fonts and every third-party API go straight to
  // the browser. Tiles are cross-origin images, so the worker only ever sees "opaque" responses:
  // they fail the res.ok test (so were never stored) and Chrome pads each opaque entry to several
  // megabytes of quota. Caching API replies here only grew the cache without bound and served stale
  // data offline. The browser's own HTTP cache already handles all of them correctly.
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  // version.json is how an open page asks "is there a newer release?" (na-update.js). It must come
  // from the network every time and never from this worker's cache, so the worker steps aside and the
  // browser answers it (the page asks with cache: 'no-store').
  if (url.pathname.endsWith('/version.json')) return;

  e.respondWith(networkFirst(e));
});

// App shell and data files (index.html, app.js, data*.js, style.css, lib/*, data/*): NETWORK-FIRST
// so a deploy always reaches online visitors (a cache-first shell pinned users to the HTML cached
// on a prior visit, the root cause of the old "Leaflet did not load" boot failure). The cached copy
// is used when the network fails or is slower than NETWORK_TIMEOUT_MS; a slow response still lands
// in the cache afterwards.
function networkFirst(e) {
  const req = e.request;
  // Ask the server whether its copy changed instead of trusting the browser's own copy. GitHub Pages
  // sends max-age=600, so without this a file deployed a few minutes ago could be answered from the
  // browser cache for ten more minutes, and a page reloaded to pick up a release would get the old
  // one back. An unchanged file costs one round trip and no body (304). A navigation is left as it
  // is: a navigate-mode Request cannot be rebuilt with new options, and a reload revalidates it.
  let asked = req;
  try { if (req.mode !== 'navigate') asked = new Request(req, { cache: 'no-cache' }); } catch (_) { /* keep req */ }
  // If an engine refuses the rebuilt request, fall back to the original one: fresher files are worth
  // having, a page that fails to load is not worth risking (Safari's worker cannot be tested here).
  const network = (asked === req ? fetch(req) : fetch(asked).catch(() => fetch(req))).then(res => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
    }
    return res;
  });
  e.waitUntil(network.catch(() => {}));   // keep the worker alive so a late response is still cached

  const cached = () =>
    caches.match(req, { ignoreSearch: true })
      // An offline deep link such as /?utm=x has no cache entry of its own: serve the app shell.
      .then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))
      .then(hit => hit || network);   // nothing cached yet: wait for the network after all

  const timer = new Promise(resolve => setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS));
  return Promise.race([network.catch(() => null), timer]).then(res => res || cached());
}

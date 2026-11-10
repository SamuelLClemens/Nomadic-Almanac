// Bump CACHE whenever any precached file changes. The activate handler deletes every cache whose
// name is not CACHE, so returning visitors drop stale copies on their next visit.
const CACHE = 'nomadic-v57';
const CORE = [
  './', './index.html', './app.js', './data.js', './data-cities.js', './data-detail.js', './data-admin2.js', './style.css',
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
  if (new URL(e.request.url).origin !== self.location.origin) return;

  e.respondWith(networkFirst(e));
});

// App shell and data files (index.html, app.js, data*.js, style.css, lib/*, data/*): NETWORK-FIRST
// so a deploy always reaches online visitors (a cache-first shell pinned users to the HTML cached
// on a prior visit, the root cause of the old "Leaflet did not load" boot failure). The cached copy
// is used when the network fails or is slower than NETWORK_TIMEOUT_MS; a slow response still lands
// in the cache afterwards.
function networkFirst(e) {
  const req = e.request;
  const network = fetch(req).then(res => {
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

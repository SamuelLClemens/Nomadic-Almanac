// Increment this version string whenever app.js, data.js, or style.css change.
// The activate handler deletes all caches whose name does not match CACHE,
// forcing clients to re-fetch the latest files and clearing any stale state.
const CACHE = 'nomadic-v30';
const CORE = [
  './', './index.html', './app.js', './data.js', './style.css',
  './lib/leaflet.js', './lib/leaflet.css',
  './data/countries.geojson',
];

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
  const url = new URL(e.request.url);

  // Map tiles: cache-first. Tiles are immutable and large, so serving a cached
  // copy is correct and enables offline browsing.
  if (url.hostname.includes('arcgisonline') || url.hostname.includes('cartocdn') || url.hostname.includes('opentopomap')) {
    e.respondWith(
      caches.open('nomadic-tiles').then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(res => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          }).catch(() => cached);
        })
      )
    );
    return;
  }

  // App shell and core files (index.html, app.js, data.js, style.css, lib/*):
  // NETWORK-FIRST. A cache-first shell pins returning users to whatever HTML was
  // cached on a prior visit, so a deploy that changes how Leaflet is loaded never
  // reaches them — the root cause of the "Leaflet did not load" boot failure.
  // Network-first always fetches the current files when online and falls back to
  // the cache only when the network is unavailable.
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});

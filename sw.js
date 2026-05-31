// Increment this version string whenever app.js, data.js, or style.css change.
// The activate handler deletes all caches whose name does not match CACHE,
// forcing clients to re-fetch the latest files and clearing any stale state.
const CACHE = 'nomadic-v3';
const CORE = [
  './', './index.html', './app.js', './data.js', './style.css',
  './lib/leaflet.js', './lib/leaflet.css',
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
  // Cache tile images for offline map browsing
  if (url.hostname.includes('arcgisonline') || url.hostname.includes('cartocdn')) {
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
  // Core files: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

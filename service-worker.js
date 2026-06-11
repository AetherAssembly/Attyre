const CACHE_VERSION = 'attyre-v4.0.1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/js/app.js',
  '/js/store.js',
  '/js/engine.js',
  '/js/tauri-fs.js',
  '/js/pages/home.js',
  '/js/pages/wardrobe.js',
  '/js/pages/add-item.js',
  '/js/pages/item-detail.js',
  '/js/pages/suggest.js',
  '/js/pages/calendar.js',
  '/js/pages/saved-outfits.js',
  '/js/pages/settings.js',
  '/js/pages/stats.js',
  '/assets/attyre-logo-small.svg',
  '/assets/attyre-logo-medium.svg',
  '/assets/attyre-logo-sm-cb.svg',
  '/assets/attyre-logo-med-cb.svg',
  '/assets/attyre-wordmark.svg',
  '/assets/attyre-wordmark-cb.svg',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: try network, fall back to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

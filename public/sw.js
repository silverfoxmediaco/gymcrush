const CACHE_NAME = 'gymcrush-v2'; // Increment version when updating
const urlsToCache = [
  '/',
  '/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Skip caching for assets with hash in filename
  if (event.request.url.includes('/assets/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Always fetch fresh HTML
        if (event.request.url.endsWith('.html') || event.request.url.endsWith('/')) {
          return fetch(event.request);
        }
        return response || fetch(event.request);
      })
      .catch(() => {
        return fetch(event.request);
      })
  );
});

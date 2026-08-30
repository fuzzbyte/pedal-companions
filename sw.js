// Here so the shelf is installable, and so an installed copy still opens when
// the server behind it is not running.
//
// Network first, always. These pages are edited in place, and a cache that
// answered before the server did would hand back yesterday's file. The cache is
// only ever the fallback for a fetch that failed outright.
const CACHE = 'pedal-manuals-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      // Opaque cross-origin replies (the webfonts) report neither ok nor a
      // usable body, so they stay out of the cache and fall back to the
      // system stack when offline.
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (offline) {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      throw offline;
    }
  })());
});

/* BazaarPulse Service Worker v2.0 */
const CACHE_NAME = 'bazaarpulse-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

/* Install — cache static shell */
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Fail silently if some assets not found
      });
    })
  );
});

/* Activate — clean old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch — cache-first for static, network-first for RSS */
self.addEventListener('fetch', event => {
  const url = event.request.url;

  /* Never cache RSS proxy calls — always fresh */
  if (url.includes('allorigins') || url.includes('corsproxy') ||
      url.includes('codetabs')   || url.includes('thingproxy') ||
      url.includes('rss')        || url.includes('feed')) {
    return; /* browser handles normally */
  }

  /* Cache-first for app shell */
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

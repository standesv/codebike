
const CACHE_NAME = 'velocode-kids-v2-cache';
const CORE = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './storage.js',
  './game-engine.js',
  './app.js',
  './manifest.json',
  './default-content.json',
  './assets/icon-192.png',
  './assets/icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
      if (event.request.method === 'GET' && new URL(event.request.url).origin === location.origin) {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});

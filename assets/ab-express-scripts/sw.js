/* Only AB Express resources are owned by this worker. */
const CACHE = 'ab-express-v22';
const SHELL = ['ab-express.html','ab-express.css?v=22','ab-express-config.js?v=22','ab-express-core.js?v=22','ab-express-assets.js?v=22','ab-express-effects.js?v=22','ab-express-audio.js?v=22','ab-express.js?v=22'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('ab-express-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || (!url.pathname.includes('/ab-express-scripts/') && !url.pathname.includes('/ab-express-assets/'))) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(event.request); if (hit) return hit;
    const response = await fetch(event.request); if (response.ok) await cache.put(event.request, response.clone()); return response;
  }));
});

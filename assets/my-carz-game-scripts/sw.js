importScripts('./my-carz-assets.js?v=031e0f3e29d576ee', './my-carz-asset-cache.js?v=1');
const PREFIX = 'my-carz-shell-', SHELL = PREFIX + 'v98';
const FILES = ['./my-carz.html', './my-carz.css?v=4', './my-carz-flow.css?v=68', './my-carz-config.js?v=28',
  './my-carz-core.js?v=2', './my-carz-store.js?v=1', './my-carz-assets.js?v=031e0f3e29d576ee', './my-carz-asset-cache.js?v=1',
  './my-carz-preload.js?v=2', './my-carz-paint.js?v=4', './my-carz-race-view.js?v=13', './my-carz-attention.js?v=12', './my-carz-reward-view.js?v=13', './my-carz-audio.js?v=2', './my-carz.js?v=59'];
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(SHELL); await cache.addAll(FILES); await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  await Promise.all((await caches.keys()).filter(key => key.startsWith(PREFIX) && key !== SHELL).map(key => caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('message', event => { if (event.data?.type === 'CARZ_CLAIM_CLIENTS') event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith(new URL('../my-carz-game-assets/', self.registration.scope).pathname)) {
    event.respondWith((async () => (await CarzAssetCache.cachedResponse(event.request, await caches.open(CarzAssetCache.cacheName), CARZ_ASSETS, self.registration.scope)) || fetch(event.request))()); return;
  }
  if (!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(SHELL);
    if (event.request.mode === 'navigate') {
      try { return await fetch(event.request); }
      catch (_) { return (await cache.match(event.request, { ignoreSearch: true })) || cache.match('./my-carz.html'); }
    }
    return (await cache.match(event.request)) || fetch(event.request);
  })());
});

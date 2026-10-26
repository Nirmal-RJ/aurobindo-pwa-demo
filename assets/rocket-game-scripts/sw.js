importScripts('./rocket-game-assets.js?v=8e89f790b2b7948b', './rocket-asset-cache.js?v=1');

const SHELL_PREFIX = 'rocketier-shell-';
const SHELL = `${SHELL_PREFIX}v24`;
const SHELL_FILES = [
  './rocket-game.html', './rocket-game.css?v=82', './rocket-game-core.js?v=5',
  './rocket-game.js?v=74', './rocket-game-loader.js?v=4',
  './rocket-game-assets.js?v=8e89f790b2b7948b', './rocket-asset-cache.js?v=1'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(SHELL_FILES);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(SHELL_PREFIX) && key !== SHELL).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ROCKET_CLAIM_CLIENTS') event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const mediaRoot = new URL('../rocket-game-assets/', self.registration.scope).pathname;
  if (url.pathname.startsWith(mediaRoot)) {
    event.respondWith((async () => {
      const cache = await caches.open(RocketAssetCache.cacheName);
      return (await RocketAssetCache.cachedResponse(event.request, cache, ROCKET_ASSETS, self.registration.scope)) || fetch(event.request);
    })());
    return;
  }
  if (!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(SHELL);
    if (event.request.mode === 'navigate') {
      try { return await fetch(event.request); }
      catch (_) { return (await cache.match(event.request, { ignoreSearch: true })) || cache.match('./rocket-game.html'); }
    }
    return (await cache.match(event.request)) || fetch(event.request);
  })());
});

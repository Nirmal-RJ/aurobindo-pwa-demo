const CACHE_PREFIX = 'aurobindo-shell-';
const CACHE = `${CACHE_PREFIX}v132`;
const ASSETS = ['./', './index.html', './styles.css?v=30', './app.js?v=18', './tile-match.js?v=23', './symptom-match.html', './symptom-match.css?v=18', './symptom-match.js?v=20', './chromatogram.html', './chromatogram.css?v=23', './chromatogram.js?v=22', './assets/toggle%20button.png', './assets/4%20arrow%20toggle%20outline.png', './assets/hpcl-logo-new.png', './assets/game-1-card.png', './assets/game-2-card.png', './assets/game-3-card.png', './assets/game-4-card.png', './logo.png', './icon.svg', './icons/icon-192.png', './icons/icon-512.png', './manifest.webmanifest'];
ASSETS.push('./cleaning-solution.html', './cleaning-solution.css?v=7', './cleaning-solution.js?v=6');
ASSETS.splice(ASSETS.indexOf('./styles.css?v=30'), 1, './styles.css?v=43');
ASSETS.push('./liquid-sort.html', './liquid-sort.css?v=29', './liquid-sort.js?v=31', './assets/test-tube.png', './audio/pour-audio.mp3');
ASSETS.splice(ASSETS.indexOf('./app.js?v=18'), 1, './app.js?v=25');
ASSETS.push('./account.js?v=11', './account.css?v=6', './hero-carousel.js?v=2', './leaderboard.css?v=5');
ASSETS.push('./wrong-sample.html', './wrong-sample.css?v=16', './wrong-sample.js?v=15');
ASSETS.push('./pill-perfect.html', './pill-perfect.css?v=25', './pill-perfect.js?v=24');
ASSETS.push('./assets/tile-match-game-assets/card-front.png', './assets/tile-match-game-assets/card-back.png');
ASSETS.push('./assets/sample-prep-game-1.png', './assets/sample-prep-game-2.png');
ASSETS.push(...['bg-img.png', 'bottle%201.png', 'bottle%202.png', 'bottle%203.png'].map(file => `./assets/sample-preparation-game-assets/${file}`));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(async () =>
      (await caches.match(event.request, { ignoreSearch: true })) ||
      caches.match(new URL('./index.html', self.registration.scope).href)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});

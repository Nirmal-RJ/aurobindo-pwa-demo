const CACHE_PREFIX = 'aurobindo-shell-';
const CACHE = `${CACHE_PREFIX}v217`;
const ASSETS = ['./', './index.html', './styles.css?v=30', './app.js?v=18', './tile-match.js?v=23', './symptom-match.html', './symptom-match.css?v=18', './symptom-match.js?v=20', './chromatogram.html', './chromatogram.css?v=23', './chromatogram.js?v=22', './assets/toggle%20button.png', './assets/4%20arrow%20toggle%20outline.png', './assets/hpcl-logo-new.png', './assets/game-1-card.png', './assets/game-2-card.png', './assets/game-3-card.png', './assets/game-4-card.png', './logo.png', './icon.svg', './icons/icon-192.png', './icons/icon-512.png', './manifest.webmanifest'];
ASSETS.push('./cleaning-solution.html', './cleaning-solution.css?v=7', './cleaning-solution.js?v=6');
ASSETS.splice(ASSETS.indexOf('./styles.css?v=30'), 1, './styles.css?v=43');
ASSETS.push('./audio/10s-timer-audio.wav', './assets/stopwatch.svg', './liquid-sort.html', './liquid-sort.css?v=60', './liquid-sort.js?v=58', './assets/test-tube.png', './audio/pour-audio.mp3', './assets/test-tube-game-assets/images/1-title-page/bg.webp', './assets/test-tube-game-assets/images/1-title-page/start-button.webp');
ASSETS.push('./assets/positive-stickers/Anna%20Nuvvu%20King%20Telugu.webp', './assets/positive-stickers/Box%20Office%20Badhalu%20Kottav%20Telugu.webp', './assets/positive-stickers/Kya%20Baat%20Hai%20Hindi.webp', './assets/positive-stickers/Nailed%20It%21%20English.webp', './assets/positive-stickers/Shabaash%20Hindi.webp', './assets/negative-stickers/1.png', './assets/negative-stickers/2.png', './assets/negative-stickers/3.png', './assets/negative-stickers/4.png', './assets/negative-stickers/5.png');
ASSETS.push(...['report-page-bg', 'watch-video-button', 'play-again-button', 'back-to-menu-button'].map(name => `./assets/test-tube-game-assets/images/9-report-page/${name}.webp`));
ASSETS.push('./assets/test-tube-game-assets/images/7-final-challenge-instruction/final-challenge-bg.webp', './assets/test-tube-game-assets/images/7-final-challenge-instruction/start-game-button.webp');
ASSETS.push('./assets/test-tube-game-assets/images/5-correct-answer-pop-up/popup-base-panel.webp', './assets/test-tube-game-assets/images/5-correct-answer-pop-up/next-solution%20button.webp', './assets/test-tube-game-assets/images/5-correct-answer-pop-up/proceed-to-challenge-button-for-last-answer.webp', './assets/test-tube-game-assets/images/6-wrong-answer-pop-up/wrong-answer-base-panel.webp', './assets/test-tube-game-assets/images/6-wrong-answer-pop-up/watch-video-button.webp');
ASSETS.push('./assets/test-tube-game-assets/images/4-slow-game-page/beaker.webp');
ASSETS.push('./assets/test-tube-game-assets/images/3-4-video-screen-and-game-screen-bg.webp', './assets/test-tube-game-assets/images/3-video-page/replay-video-button.webp', './assets/test-tube-game-assets/images/3-video-page/start-mixing-button.webp');
ASSETS.push('./assets/test-tube-game-assets/images/exit-button.webp', './assets/test-tube-game-assets/images/2-solution-name-page/watch-video-button.webp', ...['column-cleaning', 'strong-wash', 'needle-wash', 'column-storage'].map(name => `./assets/test-tube-game-assets/images/2-solution-name-page/${name}-intro-page.webp`));
ASSETS.splice(ASSETS.indexOf('./app.js?v=18'), 1, './app.js?v=25');
ASSETS.push('./account.js?v=15', './account.css?v=6', './hero-carousel.js?v=2', './leaderboard.css?v=5');
ASSETS.push('./wrong-sample.html', './wrong-sample.css?v=16', './wrong-sample.js?v=15');
ASSETS.push('./pill-perfect.html', './pill-perfect.css?v=25', './pill-perfect.js?v=24');
ASSETS.push('./assets/tile-match-game-assets/card-front.png', './assets/tile-match-game-assets/card-back.png');
ASSETS.push('./assets/sample-prep-game-1.png', './assets/sample-prep-game-2.png');
ASSETS.push(...['bg-img.png', 'bottle%201.png', 'bottle%202.png', 'bottle%203.png'].map(file => `./assets/sample-preparation-game-assets/${file}`));
ASSETS.push('./audit-game.html', './audit-game.css?v=24', './audit-game.js?v=30', './assets/audit-game-assets/empty-test-tube-with-water.webp', './assets/audit-game-assets/contaminated-test-tube-with-water.webp', ...['1-bg', '1-bg-stand-overlay', 'page-1-reference'].map(name => `./assets/audit-game-assets/page-1/${name}.webp`));
ASSETS.push('./assets/audit-game-assets/home-page-assets/bg.webp', './assets/audit-game-assets/home-page-assets/play-button.webp');
ASSETS.push('./assets/audit-game-assets/page-2/2-bg.webp', './assets/audit-game-assets/page-2/2-bg-overlay.webp');
ASSETS.push('./assets/audit-game-assets/page-3/3-bg.webp', './assets/audit-game-assets/page-3/3-bg-overlay.webp');
ASSETS.push('./assets/audit-game-assets/page-4/4-bg.webp', './assets/audit-game-assets/page-4/4-overlay.webp');
ASSETS.push('./audio/bacteria-laugh.mp3', './audio/bacteria-caught.mp3');
ASSETS.push('./checklist-game.html', './checklist-game.css?v=9', './checklist-game.js?v=7', './assets/checklist-game-assets/blur-bg.webp');
ASSETS.push('./assets/lane-rush-game-assets/home-lights-out.png', './lane-rush.html', './lane-rush.css?v=13', './lane-rush.js?v=16', './assets/lane-rush-game-assets/f1-car.png', './audio/lanerush-bgm.mp3', './audio/lanerush-correct.mp3', './audio/lanerush-wrong.mp3');
ASSETS.push('./assets/game-5-card.webp', './assets/game-6-card.webp', './assets/game-7-card.webp', './assets/game-8-card.webp');
ASSETS.push('./hazard-spotter.html', './hazard-spotter.css?v=6', './hazard-spotter.js?v=10', './hazard-spotter-settings.js?v=2', './assets/hazard-spotter-game-assets/home-bg.webp', './assets/hazard-spotter-game-assets/start-button.webp');
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const optional = ASSETS.filter(asset => /\.(?:mp3|wav)$/.test(asset));
    await cache.addAll(ASSETS.filter(asset => !optional.includes(asset)));
    await Promise.all(optional.map(async asset => {
      try { await cache.add(asset); }
      catch (error) { console.warn('Optional audio could not be cached:', asset, error); }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (/\.(?:mp4|webm)(?:\?|$)/i.test(event.request.url)) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(async () =>
      (await caches.match(event.request, { ignoreSearch: true })) ||
      caches.match(new URL('./index.html', self.registration.scope).href)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});

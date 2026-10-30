const CACHE_PREFIX = 'aurobindo-shell-';
const CACHE = `${CACHE_PREFIX}v464`;
const ASSETS = ['./', './index.html', './styles.css?v=30', './app.js?v=18', './tile-match.js?v=23', './symptom-match.html', './symptom-match.css?v=18', './symptom-match.js?v=20', './chromatogram.html', './chromatogram.css?v=23', './chromatogram.js?v=22', './assets/toggle%20button.png', './assets/4%20arrow%20toggle%20outline.png', './assets/hpcl-logo-new.png', './assets/game-1-card.png', './assets/game-2-card.png', './assets/game-3-card.png', './assets/game-4-card.png', './logo.png', './icon.svg', './icons/icon-192.png', './icons/icon-512.png', './manifest.webmanifest'];
ASSETS.push('./cleaning-solution.html', './cleaning-solution.css?v=7', './cleaning-solution.js?v=6');
ASSETS.splice(ASSETS.indexOf('./styles.css?v=30'), 1, './styles.css?v=48');
ASSETS.push('./audio/10s-timer-audio.wav', './assets/stopwatch.svg', './liquid-sort.html', './liquid-sort.css?v=60', './liquid-sort.js?v=58', './assets/test-tube.png', './audio/pour-audio.mp3', './assets/test-tube-game-assets/images/1-title-page/bg.webp', './assets/test-tube-game-assets/images/1-title-page/start-button.webp');
ASSETS.push('./assets/positive-stickers/Anna%20Nuvvu%20King%20Telugu.webp', './assets/positive-stickers/Box%20Office%20Badhalu%20Kottav%20Telugu.webp', './assets/positive-stickers/Kya%20Baat%20Hai%20Hindi.webp', './assets/positive-stickers/Nailed%20It%21%20English.webp', './assets/positive-stickers/Shabaash%20Hindi.webp', './assets/negative-stickers/1.png', './assets/negative-stickers/2.png', './assets/negative-stickers/3.png', './assets/negative-stickers/4.png', './assets/negative-stickers/5.png');
ASSETS.push(...['report-page-bg', 'watch-video-button', 'play-again-button', 'back-to-menu-button'].map(name => `./assets/test-tube-game-assets/images/9-report-page/${name}.webp`));
ASSETS.push('./assets/test-tube-game-assets/images/7-final-challenge-instruction/final-challenge-bg.webp', './assets/test-tube-game-assets/images/7-final-challenge-instruction/start-game-button.webp');
ASSETS.push('./assets/test-tube-game-assets/images/5-correct-answer-pop-up/popup-base-panel.webp', './assets/test-tube-game-assets/images/5-correct-answer-pop-up/next-solution%20button.webp', './assets/test-tube-game-assets/images/5-correct-answer-pop-up/proceed-to-challenge-button-for-last-answer.webp', './assets/test-tube-game-assets/images/6-wrong-answer-pop-up/wrong-answer-base-panel.webp', './assets/test-tube-game-assets/images/6-wrong-answer-pop-up/watch-video-button.webp');
ASSETS.push('./assets/test-tube-game-assets/images/4-slow-game-page/beaker.webp');
ASSETS.push('./assets/test-tube-game-assets/images/3-4-video-screen-and-game-screen-bg.webp', './assets/test-tube-game-assets/images/3-video-page/replay-video-button.webp', './assets/test-tube-game-assets/images/3-video-page/start-mixing-button.webp');
ASSETS.push('./assets/test-tube-game-assets/images/exit-button.webp', './assets/test-tube-game-assets/images/2-solution-name-page/watch-video-button.webp', ...['column-cleaning', 'strong-wash', 'needle-wash', 'column-storage'].map(name => `./assets/test-tube-game-assets/images/2-solution-name-page/${name}-intro-page.webp`));
ASSETS.splice(ASSETS.indexOf('./app.js?v=18'), 1, './app.js?v=26');
ASSETS.push('./hero-carousel.js?v=2', './leaderboard.css?v=5');
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
ASSETS.push('./assets/lane-rush-game-assets/home-lights-out.png', './lane-rush.html', './lane-rush.css?v=16', './lane-rush.js?v=19', './assets/lane-rush-game-assets/f1-car.png', './audio/lanerush-bgm.mp3', './audio/lanerush-correct.mp3', './audio/lanerush-wrong.mp3');
ASSETS.push('./assets/game-5-card.webp', './assets/game-6-card.webp', './assets/game-7-card.webp', './assets/game-8-card.webp', './assets/game-9-card-good-bad-ugly.webp');
ASSETS.push('./assets/lane-rush-game-assets/user-car.png', './assets/test-tube-game-assets/fonts/BMW%20Helvetica%2097%20Black%20Condense%20Regular.otf');
ASSETS.push('./assets/good-bad-ugly-assets/opening-bg.webp', ...['1-fiat-default.webp','2-ambassador-white.webp','3-maruti-white.webp','4-honda-white.webp','5-benz-white.webp','6-ferrari-white.webp'].map(file => './assets/good-bad-ugly-assets/' + file));
ASSETS.push('./good-bad-ugly-reverse.html', './good-bad-ugly-reverse.css?v=2');
ASSETS.push('./good-bad-ugly.html', './good-bad-ugly.css?v=65', './good-bad-ugly.js?v=67');
ASSETS.push('./audio/lab-process-bgm.mp3', './audio/snake-correct.mp3', './audio/snake-wrong.mp3');
ASSETS.push('./snake.html', './snake.css?v=9', './snake.js?v=29');
ASSETS.push(...[1, 2, 3, 4, 5].map(i => `./assets/snake-game-assets/spawnables/veg-${i}.webp`));
ASSETS.push('./hazard-spotter.html', './hazard-spotter.css?v=6', './hazard-spotter.js?v=10', './hazard-spotter-settings.js?v=2', './assets/hazard-spotter-game-assets/home-bg.webp', './assets/hazard-spotter-game-assets/start-button.webp');
ASSETS.push('./working-standard.html', './working-standard.css?v=7', './working-standard-data.js?v=1', './working-standard.js?v=7');
ASSETS.push(...['box-a-contents-page.webp','box-b-contents-page.webp','box-c-contents-page.webp','box-d-contents-page.webp','empty-tray.webp','cabinet-last-frame.webp','top-view-bottle.webp','front-view-bottle.webp','font-for-bottle-label.ttf','ui/working-standard-game-bg.webp','ui/working-standard-game-title-pg-bg.webp','ui/play-button-working-standard-game.webp'].map(file => './assets/working-standard-game-assets/'+file));
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const optional = ASSETS.filter(asset => /\.(?:mp3|wav)$/.test(asset));
    await cache.addAll(ASSETS.filter(asset => !optional.includes(asset)));
    await Promise.all(optional.map(async asset => {
      try { await cache.add(asset); }
      catch (error) { console.warn('Optional audio could not be cached:', asset, error); }
    }));
    // Level scenery is optional: missing files must not prevent offline installation.
    await Promise.all([1, 2, 3, 4, 5, 6].flatMap(level => ['left', 'right'].map(async side => {
      try { await cache.add(`./assets/good-bad-ugly-assets/${level}-bg-${side}.webp`); }
      catch (_) { /* Keep whichever level scenery is available. */ }
    })));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ROCKET_CLAIM_CLIENTS') event.waitUntil(self.clients.claim());
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

ASSETS.push(...['1-a','1-b','1-c','1-d','1-e','2-a','2-b','2-c','2-d','2-e','2-f','2-g','3-a','3-b','3-c','3-d'].map(label => './assets/snake-game-assets/lab-process-assets/' + label + '.webp'));

ASSETS.push("./assets/good-bad-ugly-assets/cars-iso-view/1-fiat-default-front-view.webp", "./assets/good-bad-ugly-assets/cars-iso-view/2-ambassador-white-front-view.webp", "./assets/good-bad-ugly-assets/cars-iso-view/3-maruti-white-front-view.webp", "./assets/good-bad-ugly-assets/cars-iso-view/4-honda-white-front-view.webp", "./assets/good-bad-ugly-assets/cars-iso-view/5-benz-white-front-view.webp", "./assets/good-bad-ugly-assets/cars-iso-view/6-ferrari-white-front-view.webp");

ASSETS.push('./assets/good-bad-ugly-assets/garage-pg-bg.webp');

ASSETS.push('./audio/gbu-button-click-sfx.mp3');

ASSETS.push('./audio/gbu-countdown-audio.wav');

ASSETS.push('./assets/good-bad-ugly-assets/confetti.gif');

ASSETS.push('./rocket-game.html');


ASSETS.push('./my-carz.html');

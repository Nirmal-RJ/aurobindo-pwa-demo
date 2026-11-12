const CACHE_PREFIX = 'see-saw-cache-';
const CACHE_NAME = `${CACHE_PREFIX}v18`;

const SHELL_ASSETS = [
  './see-saw.html',
  './see-saw.css?v=18',
  './see-saw-config.js?v=18',
  './see-saw-core.js?v=18',
  './see-saw-audio.js?v=18',
  './see-saw-video.js?v=18',
  './see-saw.js?v=18',
  '../see-saw-assets/next-button.webp',
  '../see-saw-assets/play-again-button.webp',
  '../see-saw-assets/star.webp',
  '../see-saw-assets/title-and-question-panel.webp',
  '../see-saw-assets/watch-video-and-try-again-button.webp',
  '../see-saw-assets/page-1/page-1-bg.webp',
  '../see-saw-assets/demo/1.gif',
  '../see-saw-assets/demo/2.gif',
  '../see-saw-assets/demo/3.gif',
  '../see-saw-assets/page-3/video-no-panel.webp',
  '../see-saw-assets/page-4/page-4-bg.webp',
  '../see-saw-assets/page-4/start-challenge-button.webp',
  '../see-saw-assets/page-4/watch-videos-button.webp',
  '../see-saw-assets/page-4/demo-button.webp',
  '../see-saw-assets/page-5/page-5-bg.webp',
  '../see-saw-assets/page-5/1-high-pressure.webp',
  '../see-saw-assets/page-5/11-column-blockage.webp',
  '../see-saw-assets/page-5/22-pressure-fluctuation.webp',
  '../see-saw-assets/page-5/22-air-bubble.webp',
  '../see-saw-assets/page-5/33-peak-tailing.webp',
  '../see-saw-assets/page-5/33-column-deterioration.webp',
  '../see-saw-assets/page-5/44-low-pressure.webp',
  '../see-saw-assets/page-5/44-leakage.webp',
  '../see-saw-assets/page-5/55-retention-time-shift.webp',
  '../see-saw-assets/page-5/55-mobile-phase-variation.webp',
  '../see-saw-assets/page-5/answers-tray.webp',
  '../see-saw-assets/page-5/see-saw-base.webp',
  '../see-saw-assets/page-5/see-saw-panel.webp',
  '../see-saw-assets/page-5/timer-panel.webp',
  '../see-saw-assets/page-6/correct-pop-up.webp',
  '../see-saw-assets/page-7/wrong-answer-pop-up.webp',
  '../see-saw-assets/page-8/time-up-pop-up.webp',
  '../see-saw-assets/page-9/try-again-button.webp',
  '../see-saw-assets/page-10/page-10-bg.webp',
  '../see-saw-assets/page-10/round-complete-bg-v1.webp',
  '../see-saw-assets/page-10/well-played-v1.webp',
  '../see-saw-assets/page-11/page-11-bg.webp',
  '../see-saw-assets/page-12/too-slow-pop-up.webp',
  '../see-saw-assets/mascot/idle.gif',
  '../see-saw-assets/mascot/correct-answer-once-v1.gif',
  '../see-saw-assets/mascot/wrong-answer-immediate-v2.gif',
  '../see-saw-assets/mascot/time-up-once-v1.gif',
  '../see-saw-assets/videos/fallback-slides/slide-1.webp',
  '../see-saw-assets/videos/fallback-slides/slide-2.webp',
  '../see-saw-assets/videos/fallback-slides/slide-3.webp',
  '../see-saw-assets/videos/fallback-slides/slide-4.webp'
];

const OPTIONAL_AUDIO = [
  '../see-saw-assets/audio/menu-bgm.mp3',
  '../see-saw-assets/audio/game-bgm.mp3',
  '../see-saw-assets/audio/correct.mp3',
  '../see-saw-assets/audio/wrong.mp3',
  '../see-saw-assets/audio/time-up.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL_ASSETS);
    await Promise.all(OPTIONAL_AUDIO.map(async url => {
      try {
        await cache.add(url);
      } catch (_) {
        /* Optional audio failure does not block installation */
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const reqUrl = new URL(event.request.url);
  if (reqUrl.origin === self.location.origin && /^\/review-api(?:\/|$)/.test(reqUrl.pathname)) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  if (event.request.method !== 'GET' || reqUrl.origin !== self.location.origin) {
    return;
  }
  if (/\.(?:mp4|webm)(?:\?|$)/i.test(reqUrl.pathname)) {
    event.respondWith(fetch(event.request));
    return;
  }
  // For HTML, CSS, JS: network-first so changes and alignment fixes appear immediately
  if (/\.(?:html|css|js)(?:\?|$)/i.test(reqUrl.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => cached || fetch(event.request))
  );
});


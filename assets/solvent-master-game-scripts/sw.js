const SHELL = 'solvent-master-shell-v43';
const MEDIA = 'solvent-master-media-v1';
// All soundtrack and effect assets are owned locally by Solvent Master.
const FILES = ['./solvent-master-fullscreen.js?v=1','./solvent-master-orientation.js?v=3','./solvent-master.html','./solvent-master.css?v=33','./solvent-master-config.js?v=11','./solvent-master-assets.js?v=9','./solvent-master-loader.js?v=1','./solvent-master.js?v=2','./solvent-master-core.js?v=2','./solvent-master-store.js?v=1','./solvent-master-audio.js?v=6','./solvent-master-play.js?v=26'];
self.addEventListener('install', event => event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('solvent-master-shell-') && k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('message', event => { if (event.data?.type === 'SOLVENT_MASTER_CLAIM') event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const assetRoot = new URL('../solvent-master-game-assets/', self.location.href).pathname;
  if (url.pathname.startsWith(assetRoot)) {
    event.respondWith(caches.open(MEDIA).then(async cache => {
      const response=await cache.match(event.request,{ignoreSearch:!url.searchParams.has('rev')});
      if(!response)return fetch(event.request);
      const range=event.request.headers.get('Range');if(!range)return response;
      const bytes=await response.arrayBuffer(),match=/^bytes=(\d*)-(\d*)$/.exec(range);
      const start=match?.[1]?Number(match[1]):Math.max(0,bytes.byteLength-Number(match?.[2]));
      const end=match?.[1]&&match?.[2]?Math.min(Number(match[2]),bytes.byteLength-1):bytes.byteLength-1;
      if(!match||(!match[1]&&!match[2])||!Number.isSafeInteger(start)||start>end||start>=bytes.byteLength)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
      return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':response.headers.get('Content-Type'),'Accept-Ranges':'bytes','Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${bytes.byteLength}`}});
    }));
  } else if (url.pathname.startsWith(new URL('./', self.location.href).pathname)) {
    event.respondWith(caches.open(SHELL).then(async cache => (await cache.match(event.request)) || fetch(event.request)));
  }
});

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else {
    const api = factory();
    root.RocketPreload = { ready: false };
    const $ = id => document.getElementById(id);
    let running = false;
    let layoutReady = false;
    async function prepareLayout() {
      if (layoutReady || !root.CSS?.supports || root.CSS.supports('width', '1cqw')) return;
      // Older Safari lacks container/modern viewport units; preserve the same proportional layout.
      const response = await fetch(document.querySelector('link[rel="stylesheet"]').href);
      if (!response.ok) throw new Error('The game layout could not be loaded.');
      const style = document.createElement('style');
      style.textContent = (await response.text()).replace(/(\d*\.?\d+)(cqw|svh|dvh)\b/g, (_, value, unit) => `calc(var(--rocket-${unit === 'cqw' ? 'cqw' : 'vh'}) * ${value})`);
      document.head.appendChild(style);
      const update = () => {
        document.documentElement.style.setProperty('--rocket-cqw', `${$('game').getBoundingClientRect().width / 100}px`);
        document.documentElement.style.setProperty('--rocket-vh', `${root.innerHeight / 100}px`);
      };
      update(); root.requestAnimationFrame?.(update);
      root.addEventListener('resize', update, { passive: true });
      if (root.ResizeObserver) new root.ResizeObserver(update).observe($('game'));
      layoutReady = true;
    }
    async function start() {
      if (running) return;
      running = true; $('load-retry').hidden = true;
      $('load-status').textContent = 'Preparing your mission…';
      try {
        if (!('serviceWorker' in navigator) || !root.caches) throw new Error('Open the game using HTTPS or localhost to prepare it for play.');
        const workerReady = (async () => {
          const registration = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
          try { await registration.update(); } catch (error) { if (!registration.active) throw error; }
          const worker = registration.installing || registration.waiting || registration.active;
          if (worker && worker.state !== 'activated') await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => { cleanup(); reject(new Error('Offline setup took too long. Please retry.')); }, 120000);
            function cleanup() { clearTimeout(timeout); worker.removeEventListener('statechange', check); }
            function check() {
              if (worker.state === 'activated') { cleanup(); resolve(); }
              else if (worker.state === 'redundant') { cleanup(); reject(new Error('Offline setup was interrupted.')); }
            }
            worker.addEventListener('statechange', check); check();
          });
          await navigator.serviceWorker.ready;
          if (navigator.serviceWorker.controller !== registration.active) await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => { navigator.serviceWorker.removeEventListener('controllerchange', check); reject(new Error('Offline setup needs a retry.')); }, 15000);
            function check() {
              if (navigator.serviceWorker.controller === registration.active) {
                clearTimeout(timeout); navigator.serviceWorker.removeEventListener('controllerchange', check); resolve();
              }
            }
            navigator.serviceWorker.addEventListener('controllerchange', check); check();
          });
        })();
        workerReady.catch(() => {}); // Downloads and worker setup run together; report either failure below.
        const connection = navigator.connection;
        await prepareLayout();
        await api.preload({ entries: root.ROCKET_ASSETS, cache: await caches.open(root.RocketAssetCache.cacheName), base: document.baseURI,
          assetKey: root.RocketAssetCache.assetKey, concurrency: connection?.saveData || connection?.effectiveType === '2g' ? 2 : 4,
          onProgress: ({ loaded, total, complete, count }) => {
            const percent = Math.min(99, Math.floor(loaded / total * 100));
            $('load-progress').value = percent;
            $('load-percent').textContent = `${percent}%`;
            $('load-status').textContent = `${complete}/${count} files ready · ${(loaded / 1048576).toFixed(1)} / ${(total / 1048576).toFixed(1)} MB`;
          }
        });
        $('load-status').textContent = 'Finishing offline setup…';
        await workerReady;
        $('load-status').textContent = 'Preparing mission artwork…';
        await api.prepareImages({ images: Array.from(document.images || []), entries: root.ROCKET_ASSETS, base: document.baseURI, assetKey: root.RocketAssetCache.assetKey });
        root.RocketPreload.ready = true;
        $('load-progress').value = 100; $('load-percent').textContent = '100%';
        $('load-status').textContent = 'Ready for launch!';
        $('start').disabled = false; $('start').hidden = false;
        $('asset-loader').hidden = true;
      } catch (error) {
        $('load-status').textContent = `Loading paused. ${error.message} Retry to continue with files already saved.`;
        $('load-retry').hidden = false;
      } finally { running = false; }
    }
    $('load-retry').addEventListener('click', start);
    start();
  }
})(typeof window !== 'undefined' ? window : globalThis, () => {
  async function prepareImages({ images, entries, base, assetKey }) {
    const byPath = new Map(entries.map(entry => [new URL(entry.url, base).pathname, entry]));
    await Promise.all(images.map(async image => {
      const source = image.getAttribute('src');
      if (!source) return;
      const entry = byPath.get(new URL(source, base).pathname);
      if (!entry) return;
      const key = assetKey(entry, base);
      // The original request may have failed before the service worker controlled this page.
      // Rebind to the exact verified cache entry, then wait for a renderable image.
      image.loading = 'eager';
      for (let attempt = 0; attempt < 2; attempt++) {
        let timer, cleanup = () => {};
        try {
          if (attempt) image.removeAttribute('src');
          image.src = key;
          const decoded = typeof image.decode === 'function' ? image.decode() : new Promise((resolve, reject) => {
            const loaded = () => image.naturalWidth ? resolve() : reject(new Error('Image is empty.'));
            const failed = () => reject(new Error('Image could not be loaded.'));
            cleanup = () => { image.removeEventListener('load', loaded); image.removeEventListener('error', failed); };
            image.addEventListener('load', loaded); image.addEventListener('error', failed);
            if (image.complete) loaded();
          });
          await Promise.race([decoded, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Artwork took too long to prepare.')), 15000); })]);
          if (!image.naturalWidth) throw new Error('Image is empty.');
          return;
        } catch (_) {
          if (attempt === 1) throw new Error(`Could not prepare ${entry.url.split('/').pop()}.`);
        } finally { clearTimeout(timer); cleanup(); }
      }
    }));
  }
  async function preload({ entries, cache, base, assetKey, concurrency = 4, onProgress = () => {}, fetcher = fetch }) {
    const total = entries.reduce((n, entry) => n + entry.bytes, 0), amounts = new Map();
    let complete = 0, cursor = 0, failure;
    const progress = () => onProgress({ loaded: [...amounts.values()].reduce((n, bytes) => n + bytes, 0), total, complete, count: entries.length });
    async function load(entry) {
      const key = assetKey(entry, base);
      const existing = await cache.match(key);
      if (existing && existing.status === 200 && Number(existing.headers.get('Content-Length')) === entry.bytes) { amounts.set(key, entry.bytes); complete++; progress(); return; }
      let lastError;
      for (let attempt = 0; attempt < 3; attempt++) {
        amounts.set(key, 0);
        try {
          const controller = new AbortController();
          let watchdog = setTimeout(() => controller.abort(), 30000);
          try {
            const response = await fetcher(key, { signal: controller.signal, cache: 'no-cache' });
            if (response.status !== 200) throw new Error(`Download failed (${response.status}).`);
            const chunks = []; let received = 0;
            if (response.body?.getReader) {
              const reader = response.body.getReader();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value); received += value.byteLength;
                amounts.set(key, Math.min(received, entry.bytes)); progress();
                clearTimeout(watchdog); watchdog = setTimeout(() => controller.abort(), 30000);
              }
            } else { const buffer = await response.arrayBuffer(); chunks.push(buffer); received = buffer.byteLength; }
            if (received !== entry.bytes) throw new Error('Incomplete download.');
            const headers = new Headers(response.headers);
            headers.delete('Content-Encoding'); headers.set('Content-Length', String(received));
            await cache.put(key, new Response(new Blob(chunks), { status: 200, headers }));
            amounts.set(key, entry.bytes); complete++; progress(); return;
          } finally { clearTimeout(watchdog); }
        } catch (error) { lastError = error; }
      }
      throw lastError;
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, entries.length) }, async () => {
      while (!failure && cursor < entries.length) {
        const entry = entries[cursor++];
        try { await load(entry); } catch (error) { failure = error; }
      }
    }));
    if (failure) throw failure;
  }
  return { preload, prepareImages };
});

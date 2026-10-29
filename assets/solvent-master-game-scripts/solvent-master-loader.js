(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const settings = SolventMasterConfig.loading;
  const entries = SOLVENT_MASTER_ASSETS;
  const state = globalThis.SolventMaster = { ready: false, nextRequested: false };
  let running = false;
  const key = entry => { const url = new URL(entry.url, document.baseURI); url.searchParams.set('rev', entry.revision); return url.href; };
  const digest = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
  async function setupWorker() {
    if (!navigator.serviceWorker || !globalThis.caches) throw new Error('Open using HTTPS or localhost.');
    const registration = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { cleanup(); reject(new Error('Offline setup timed out. Retry to continue.')); }, 20000);
      const worker = registration.installing || registration.waiting || registration.active;
      function cleanup() { clearTimeout(timeout); worker?.removeEventListener('statechange', check); navigator.serviceWorker.removeEventListener('controllerchange', check); }
      function check() {
        if (registration.active && navigator.serviceWorker.controller === registration.active) { cleanup(); resolve(); }
        else { registration.active?.postMessage({ type: 'SOLVENT_MASTER_CLAIM' }); if (worker?.state === 'redundant') { cleanup(); reject(new Error('Offline installation failed.')); } }
      }
      worker?.addEventListener('statechange', check);
      navigator.serviceWorker.addEventListener('controllerchange', check); check();
    });
  }
  async function start() {
    if (running || state.ready) return;
    running = true; $('load-retry').hidden = true;
    const loaded = new Map(entries.map(e => [e.url, 0]));
    const total = entries.reduce((sum,e) => sum + e.bytes, 0);
    let complete = 0, cursor = 0, failure = null;
    function report() {
      const bytes = Array.from(loaded.values()).reduce((a,b) => a+b,0);
      const percent = Math.min(99, Math.floor(bytes / total * 100));
      $('load-progress').value = percent; $('load-percent').textContent = `${percent}%`;
      $('load-status').textContent = `${complete}/${entries.length} files · ${(bytes/1048576).toFixed(1)} / ${(total/1048576).toFixed(1)} MB`;
    }
    try {
      if (!globalThis.caches || !crypto.subtle) throw new Error('Open using HTTPS or localhost.');
      const workerReady = setupWorker(); workerReady.catch(() => {});
      const cache = await caches.open(settings.cacheName);
      async function download(entry) {
        const cached = await cache.match(key(entry));
        if (cached) {
          const bytes = await cached.arrayBuffer();
          if (bytes.byteLength === entry.bytes && await digest(bytes) === entry.revision) { loaded.set(entry.url, entry.bytes); complete++; report(); return; }
          await cache.delete(key(entry));
        }
        for (let attempt = 0; attempt < settings.attempts; attempt++) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), settings.timeoutMs);
          try {
            loaded.set(entry.url, 0); report();
            const response = await fetch(key(entry), { cache: 'no-store', signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const chunks = []; let received = 0;
            if (response.body) {
              const reader = response.body.getReader();
              while (true) { const { value, done } = await reader.read(); if (done) break; chunks.push(value); received += value.length; loaded.set(entry.url, Math.min(received, entry.bytes)); report(); }
            } else { const value = new Uint8Array(await response.arrayBuffer()); chunks.push(value); received = value.length; }
            const bytes = new Uint8Array(received); let offset = 0;
            for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
            if (received !== entry.bytes || await digest(bytes) !== entry.revision) throw new Error('Incomplete or changed download');
            await cache.put(key(entry), new Response(bytes, { headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream' } }));
            loaded.set(entry.url, entry.bytes); complete++; report(); return;
          } catch (error) {
            loaded.set(entry.url, 0); report();
            if (attempt === settings.attempts - 1) throw new Error(`${decodeURIComponent(entry.url.split('/').pop())}: ${error.message}`);
          } finally { clearTimeout(timeout); }
        }
      }
      await Promise.all(Array.from({ length: navigator.connection?.saveData || navigator.connection?.effectiveType === '2g' ? 2 : settings.concurrency }, async () => {
        while (!failure && cursor < entries.length) { const entry = entries[cursor++]; try { await download(entry); } catch (error) { failure ||= error; } }
      }));
      if (failure) throw failure;
      $('load-status').textContent = 'Preparing landing artwork…';
      await workerReady;
      await Promise.all(['landing-art','next-art'].map(async id => {
        const image = $(id), entry = entries.find(e => new URL(e.url, document.baseURI).pathname === new URL(image.src).pathname);
        if (!entry) throw new Error('Landing artwork missing from manifest.');
        image.src = key(entry); await image.decode();
      }));
      $('load-progress').value = 100; $('load-percent').textContent = '100%';
      state.ready = true; $('game').setAttribute('aria-busy', 'false');
      $('loader').hidden = true; $('next').disabled = false; $('next').hidden = false;
    } catch (error) {
      $('load-status').textContent = `Loading paused. ${error.message}`; $('load-retry').hidden = false;
    } finally { running = false; }
  }
  $('load-retry').addEventListener('click', start);
  // Later pages are outside the landing-page scope. Expose one guarded integration event.
  $('next').addEventListener('click', () => { if (!state.ready || state.nextRequested) return; state.nextRequested = true; document.dispatchEvent(new CustomEvent('solvent-master:next')); });
  start();
})();

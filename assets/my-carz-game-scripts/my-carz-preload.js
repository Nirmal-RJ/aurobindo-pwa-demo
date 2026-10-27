(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CarzPreload=api;})(typeof window!=='undefined'?window:globalThis,()=>{
  function waitForControl(container, registration, timeoutMs = 15000) {
    if (registration.active && container.controller === registration.active) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const cleanup = () => { clearTimeout(timeout); container.removeEventListener('controllerchange', check); };
      function check() {
        if (registration.active && container.controller === registration.active) { cleanup(); resolve(); }
      }
      const timeout = setTimeout(() => { cleanup(); reject(new Error('Offline setup could not take control of this page.')); }, timeoutMs);
      container.addEventListener('controllerchange', check);
      // An already-active worker does not run its activate handler again on Retry.
      // Explicitly request a fresh claim instead of waiting for an event it may never emit.
      try { registration.active?.postMessage({ type: 'CARZ_CLAIM_CLIENTS' }); }
      catch (error) { cleanup(); reject(error); return; }
      check();
    });
  }
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
  return { preload, prepareImages, waitForControl };
});

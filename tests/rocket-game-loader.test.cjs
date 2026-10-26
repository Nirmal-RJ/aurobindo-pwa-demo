const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { preload, prepareImages, waitForControl } = require('../assets/rocket-game-scripts/rocket-game-loader.js');
const { assetKey, cachedResponse } = require('../assets/rocket-game-scripts/rocket-asset-cache.js');
const base = 'https://game.test/app/';

test('moving the game folder reuses existing revisioned media cache keys', () => {
  const oldEntry = { url: 'assets/rocket-game-assets/page-1/page-1-bg.webp', revision: 'same' };
  const movedEntry = { ...oldEntry, url: '../rocket-game-assets/page-1/page-1-bg.webp' };
  assert.equal(assetKey(oldEntry, base), assetKey(movedEntry, base + 'assets/rocket-game-scripts/'));
});

test('already active worker explicitly claims an uncontrolled page and cleans up its listener', async () => {
  const listeners = new Set();
  const container = {
    controller: null,
    addEventListener: (_, fn) => listeners.add(fn),
    removeEventListener: (_, fn) => listeners.delete(fn)
  };
  let requested = 0;
  const worker = { postMessage(message) {
    assert.equal(message.type, 'ROCKET_CLAIM_CLIENTS'); requested++;
    container.controller = worker;
    for (const listener of [...listeners]) listener();
  } };
  await waitForControl(container, { active: worker });
  assert.equal(requested, 1); assert.equal(listeners.size, 0);
  await waitForControl(container, { active: worker });
  assert.equal(requested, 1);
});

test('control wait rejects with a useful error and cleans up when a worker never claims', async () => {
  const listeners = new Set();
  const container = { controller: null, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn) };
  await assert.rejects(waitForControl(container, { active: { postMessage() {} } }, 5), /could not take control/);
  assert.equal(listeners.size, 0);
});
test('home loader unlocks Play only after complete downloads and worker readiness', async () => {
  const elements = new Map(['load-retry','load-status','load-progress','load-percent','start','asset-loader'].map(id => [id, { hidden: false, disabled: id === 'start', addEventListener() {} }]));
  let deliver;
  const worker = { state: 'activated' }, registration = { active: worker, update: async () => {} };
  const context = {
    document: { baseURI: base, getElementById: id => elements.get(id) },
    navigator: { serviceWorker: { register: async () => registration, ready: Promise.resolve(registration), controller: worker } },
    caches: { open: async () => memoryCache() },
    ROCKET_ASSETS: [{ url: 'asset', revision: 'v1', bytes: 4 }],
    RocketAssetCache: require('../assets/rocket-game-scripts/rocket-asset-cache.js'),
    fetch: () => new Promise(resolve => { deliver = resolve; }),
    Headers, Blob, Response, AbortController, URL, setTimeout, clearTimeout
  };
  context.window = context;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/rocket-game-scripts/rocket-game-loader.js'), 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.RocketPreload.ready, false);
  assert.equal(elements.get('start').disabled, true);
  deliver(new Response('film'));
  for (let i=0;i<10 && !context.RocketPreload.ready;i++) await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.RocketPreload.ready, true);
  assert.equal(elements.get('load-progress').value, 100);
  assert.equal(elements.get('start').disabled, false);
  assert.equal(elements.get('asset-loader').hidden, true);
});

test('initially broken artwork is rebound to the cache revision and must decode before readiness', async () => {
  const entry = { url: 'assets/rocket-game-assets/page-2/mission=brief.webp', revision: 'new-art', bytes: 10 };
  let release, ready = false;
  const image = { src: entry.url, naturalWidth: 0, getAttribute() { return this.src; }, decode() { return new Promise(resolve => { release = () => { this.naturalWidth = 770; resolve(); }; }); } };
  const pending = prepareImages({ images: [image], entries: [entry], base, assetKey }).then(() => { ready = true; });
  assert.equal(image.src, assetKey(entry, base));
  assert.equal(image.loading, 'eager');
  assert.equal(ready, false);
  release(); await pending; assert.equal(ready, true);
});

test('artwork decode retries once and reports a permanent failure instead of entering with missing art', async () => {
  const entry = { url: 'art.webp', revision: 'v1', bytes: 10 };
  let calls = 0;
  const image = { src: entry.url, naturalWidth: 0, getAttribute() { return this.src; }, removeAttribute() {}, decode() { calls++; if (calls === 1) return Promise.reject(new Error('Early request failed')); this.naturalWidth = 100; return Promise.resolve(); } };
  await prepareImages({ images: [image], entries: [entry], base, assetKey }); assert.equal(calls, 2);
  image.naturalWidth = 0; image.decode = () => Promise.reject(new Error('Missing'));
  await assert.rejects(prepareImages({ images: [image], entries: [entry], base, assetKey }), /Could not prepare art.webp/);
});
function memoryCache() {
  const entries = new Map();
  return { entries, match: async key => entries.get(String(key))?.clone(), put: async (key, response) => { entries.set(String(key), response.clone()); } };
}
test('preloader limits parallel downloads, reports bytes, reuses cache and fetches only changed revisions', async () => {
  const cache = memoryCache(), entries = Array.from({ length: 7 }, (_, i) => ({ url: `assets/${i}.mp4`, revision: 'v1', bytes: 4 }));
  let active = 0, peak = 0, calls = 0;
  const snapshots = [];
  async function fetcher() {
    calls++; active++; peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, 2)); active--;
    return new Response('film', { headers: { 'Content-Type': 'video/mp4' } });
  }
  const options = { entries, cache, base, assetKey, concurrency: 2, fetcher, onProgress: p => snapshots.push(p) };
  await preload(options);
  assert.equal(peak, 2); assert.equal(calls, 7);
  assert.equal(snapshots.at(-1).loaded, 28); assert.equal(snapshots.at(-1).complete, 7);
  await preload(options); assert.equal(calls, 7);
  entries[0].revision = 'v2'; await preload(options); assert.equal(calls, 8);
});
test('incomplete downloads retry, failures remain locked and completed files survive manual retry', async () => {
  const cache = memoryCache(), entries = [{ url: 'first', revision: 'a', bytes: 4 }, { url: 'second', revision: 'b', bytes: 4 }];
  let failed = 0;
  const options = { entries, cache, base, assetKey, concurrency: 1, fetcher: async url => {
    if (url.includes('second')) { failed++; return new Response('x'); }
    return new Response('done');
  } };
  await assert.rejects(preload(options), /Incomplete/);
  assert.equal(failed, 3); assert.equal(cache.entries.size, 1);
  const requested = [];
  await preload({ ...options, fetcher: async url => { requested.push(url); return new Response('done'); } });
  assert.equal(requested.length, 1); assert.match(requested[0], /second/);
});
test('cached media serves full content, seek ranges, suffix ranges and invalid-range responses', async () => {
  const cache = memoryCache(), entries = [{ url: 'assets/rocket-game-assets/lesson.mp4', bytes: 10, revision: 'film' }];
  const key = assetKey(entries[0], base), url = new URL(entries[0].url, base).href;
  await cache.put(key, new Response('0123456789', { headers: { 'Content-Type': 'video/mp4', 'Content-Length': '10' } }));
  const get = range => cachedResponse(new Request(url, { headers: range ? { Range: range } : {} }), cache, entries, base);
  assert.equal(await (await get()).text(), '0123456789');
  const middle = await get('bytes=2-5');
  assert.equal(middle.status, 206); assert.equal(middle.headers.get('Content-Range'), 'bytes 2-5/10');
  assert.equal(await middle.text(), '2345');
  assert.equal(await (await get('bytes=-3')).text(), '789');
  assert.equal(await (await get('bytes=7-')).text(), '789');
  assert.equal((await get('bytes=11-')).status, 416);
  assert.equal((await get('bytes=0-1,3-4')).status, 416);
  assert.equal(await cachedResponse(new Request(`${url}?rocketAsset=new`), cache, entries, base), null);
});
test('generated manifest includes all recipe videos and runtime art, omits references, and matches file sizes', () => {
  const root = path.join(__dirname, '../assets/rocket-game-scripts'), context = { self: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'rocket-game-assets.js'), 'utf8'), context);
  const entries = context.self.ROCKET_ASSETS, urls = new Set(entries.map(e => e.url));
  for (const recipe of require('../assets/rocket-game-scripts/rocket-game-core.js').recipes) assert.ok(urls.has(recipe.video));
  for (const entry of entries) {
    assert.equal(entry.bytes, fs.statSync(path.join(root, entry.url)).size);
    assert.doesNotMatch(entry.url, /reference|[- ]old\./i);
  }
  const sources = ['rocket-game.js', 'rocket-game.html', 'rocket-game.css'].map(p => fs.readFileSync(path.join(root, p), 'utf8')).join('\n');
  for (const match of sources.matchAll(/\.\.\/rocket-game-assets\/([^'"`]+)/g)) {
    assert.ok(urls.has(decodeURIComponent(match[0])), `Unlisted asset ${match[0]}`);
  }
});

test('generated sound clips are short mono PCM with headroom and softened endpoints', () => {
  for (const [file, duration] of Object.entries({ 'formula-reveal.wav': .72, 'nose-open.wav': .65, 'nose-close.wav': .6, 'number-count.wav': 1.52, 'route-glide.wav': 2.6, 'rocket-zoom.wav': 1.9 })) {
    const buffer = fs.readFileSync(path.join(__dirname, '../assets/rocket-game-assets/rocketier-audio/generated', file));
    assert.equal(buffer.toString('ascii', 0, 4), 'RIFF');
    assert.equal(buffer.readUInt16LE(22), 1); assert.equal(buffer.readUInt32LE(24), 24000);
    assert.equal(buffer.length, 44 + Math.round(duration * 24000) * 2);
    let peak = 0;
    for (let i=44; i<buffer.length; i+=2) peak = Math.max(peak, Math.abs(buffer.readInt16LE(i)));
    assert.ok(peak > 1000 && peak < 22000);
    assert.equal(buffer.readInt16LE(44), 0);
    assert.ok(Math.abs(buffer.readInt16LE(buffer.length-2)) < 100);
  }
});


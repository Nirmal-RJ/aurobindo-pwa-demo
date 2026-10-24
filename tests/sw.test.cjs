const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('Optional audio failure does not prevent service worker installation', async () => {
  const handlers = {}, required = [], optional = [];
  let activated = false;
  const cache = {
    async addAll(assets) { required.push(...assets); },
    async add(asset) { optional.push(asset); throw new Error('404'); }
  };
  vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../sw.js'), 'utf8'), {
    self: { addEventListener(name, handler) { handlers[name] = handler; }, async skipWaiting() { activated = true; } },
    caches: { async open() { return cache; } }, console: { warn() {} }, importScripts() {}
  });
  let installing;
  handlers.install({ waitUntil(promise) { installing = promise; } });
  await installing;
  assert.equal(activated, true);
  assert.ok(required.includes('./liquid-sort.css?v=60'));
  assert.equal(required.some(asset => asset.endsWith('.wav')), false);
  assert.ok(optional.includes('./audio/10s-timer-audio.wav'));
});

test('service worker upgrades preserve the separate downloaded rocket media cache', async () => {
  const handlers = {}, deleted = [];
  vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../sw.js'), 'utf8'), {
    self: { addEventListener(name, handler) { handlers[name] = handler; }, clients: { claim: async () => {} } },
    importScripts() {},
    caches: { keys: async () => ['aurobindo-shell-v430', 'aurobindo-shell-v450', 'rocketier-media-v1', 'other-app'], delete: async key => { deleted.push(key); } }
  });
  let activation;
  handlers.activate({ waitUntil(promise) { activation = promise; } });
  await activation;
  assert.deepEqual(deleted, ['aurobindo-shell-v430']);
});

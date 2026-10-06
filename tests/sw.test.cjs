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
    caches: { async open() { return cache; } }, console: { warn() {} }
  });
  let installing;
  handlers.install({ waitUntil(promise) { installing = promise; } });
  await installing;
  assert.equal(activated, true);
  assert.ok(required.includes('./liquid-sort.css?v=60'));
  assert.equal(required.some(asset => asset.endsWith('.wav')), false);
  assert.ok(optional.includes('./audio/10s-timer-audio.wav'));
});

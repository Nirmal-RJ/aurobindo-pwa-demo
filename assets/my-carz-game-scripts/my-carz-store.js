(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CarzStore = api;
})(globalThis, () => {
  'use strict';
  const key = 'my-carz-progress-v2';
  // Replace this adapter with an API adapter exposing async load/save. Presentation
  // and game rules do not access localStorage or depend on transport details.
  class LocalAdapter {
    constructor(storage) { this.storage = storage; }
    async load() {
      const raw = this.storage.getItem(key);
      if (!raw) return null;
      try { return JSON.parse(raw); }
      catch (_) { throw new Error('Saved game could not be read. Your saved data has not been overwritten.'); }
    }
    async save(profile) { this.storage.setItem(key, JSON.stringify(profile)); }
    legacyColors() {
      try { return JSON.parse(this.storage.getItem('my-carz-colors-v1') || '{}').colors || []; }
      catch (_) { return []; }
    }
  }
  class Repository {
    constructor(adapter) { this.adapter = adapter; this.queue = Promise.resolve(); }
    load() { return this.adapter.load(); }
    save(snapshot) {
      const frozen = JSON.parse(JSON.stringify(snapshot));
      const result = this.queue.then(() => this.adapter.save(frozen));
      this.queue = result.catch(() => {}); return result;
    }
  }
  return { LocalAdapter, Repository, key };
});

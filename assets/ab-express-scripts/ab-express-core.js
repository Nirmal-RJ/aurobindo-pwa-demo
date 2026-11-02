(function (root) {
  'use strict';
  const C = root.ABConfig || require('./ab-express-config.js');
  function shuffle(values, random = Math.random) {
    const out = values.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }
  function newRun(exclude = -1, random = Math.random) {
    const order = shuffle([0,1,2,3,4], random);
    if (order[0] === exclude) [order[0], order[1]] = [order[1], order[0]];
    return { order, index: 0 };
  }
  function evaluate(bucket, answer) {
    const correct = C.buckets[bucket];
    if (!correct || !Array.isArray(answer) || answer.length !== 8 || new Set(answer).size !== 8 || answer.some(id => !correct.includes(id))) throw new Error('Invalid sequence');
    const firstWrong = answer.findIndex((id, i) => id !== correct[i]);
    return { correct: firstWrong === -1, firstWrong, checked: firstWrong === -1 ? 8 : firstWrong + 1 };
  }
  function clean(value) {
    const p = { demoComplete: value?.demoComplete === true, stars: Number.isSafeInteger(value?.stars) && value.stars >= 0 ? value.stars : 0, run: null };
    const r = value?.run;
    if (r && Array.isArray(r.order) && r.order.length === 5 && new Set(r.order).size === 5 && r.order.every(v => Number.isInteger(v) && v >= 0 && v < 5) && Number.isInteger(r.index) && r.index >= 0 && r.index < 5) p.run = { order: r.order.slice(), index: r.index };
    return p;
  }
  function pass(progress) {
    const next = clean(progress);
    if (!next.run) throw new Error('No active challenge');
    next.run.index++;
    if (next.run.index === 5) { next.stars++; next.run = null; }
    return next;
  }
  root.ABCore = { shuffle, newRun, evaluate, clean, pass };
  if (typeof module !== 'undefined') module.exports = root.ABCore;
})(typeof window === 'undefined' ? globalThis : window);

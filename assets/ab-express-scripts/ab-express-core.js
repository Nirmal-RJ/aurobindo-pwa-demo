(function (root) {
  'use strict';
  const C = root.ABConfig || require('./ab-express-config.js');
  function shuffle(values, random = Math.random) {
    const out = values.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }
  const key = steps => steps.join(',');
  function validRound(steps) {
    return Array.isArray(steps) && steps.length === 8 && steps.every((id, i) => Number.isInteger(id) && id >= 1 && id <= C.steps.length && (!i || id > steps[i - 1])) && steps.filter(id => id <= 3).length === 1;
  }
  function drawRound(excluded = [], random = Math.random) {
    const blocked = new Set(excluded.map(key));
    let steps = [1 + Math.floor(random() * 3), ...shuffle(Array.from({length:C.steps.length - 3}, (_, i) => i + 4), random).slice(0, 7)].sort((a,b) => a-b);
    // Deterministic fallback also guarantees termination for a fixed test RNG.
    while (blocked.has(key(steps))) {
      const rest = steps.slice(1); let i = 6;
      while (i >= 0 && rest[i] === C.steps.length - 6 + i) i--;
      if (i < 0) steps = [steps[0] % 3 + 1,4,5,6,7,8,9,10];
      else { rest[i]++; for(let j=i+1;j<7;j++) rest[j]=rest[j-1]+1; steps=[steps[0],...rest]; }
    }
    return steps;
  }
  function newRun(exclude = null, random = Math.random) {
    const order = [];
    for (let i=0;i<5;i++) order.push(drawRound([...order, ...(validRound(exclude) ? [exclude] : [])], random));
    return { order, index: 0 };
  }
  function evaluate(correct, answer) {
    if (!validRound(correct) || !Array.isArray(answer) || answer.length !== 8 || new Set(answer).size !== 8 || answer.some(id => !correct.includes(id))) throw new Error('Invalid sequence');
    const firstWrong = answer.findIndex((id, i) => id !== correct[i]);
    return { correct: firstWrong === -1, firstWrong, checked: firstWrong === -1 ? 8 : firstWrong + 1 };
  }
  function clean(value) {
    const p = { demoComplete: value?.demoComplete === true, stars: Number.isSafeInteger(value?.stars) && value.stars >= 0 ? value.stars : 0, run: null };
    const r = value?.run;
    if (r && Array.isArray(r.order) && r.order.length === 5 && Number.isInteger(r.index) && r.index >= 0 && r.index < 5) {
      if (r.order.every(validRound) && new Set(r.order.map(key)).size === 5) p.run = {order:r.order.map(steps => steps.slice()),index:r.index};
      else if (r.order.every(v => Number.isInteger(v) && v >= 0 && v < 5) && new Set(r.order).size === 5) p.run = {...newRun(),index:r.index};
    }
    return p;
  }
  function pass(progress) {
    const next = clean(progress);
    if (!next.run) throw new Error('No active challenge');
    next.run.index++;
    if (next.run.index === 5) { next.stars++; next.run = null; }
    return next;
  }
  root.ABCore = { shuffle, drawRound, validRound, newRun, evaluate, clean, pass };
  if (typeof module !== 'undefined') module.exports = root.ABCore;
})(typeof window === 'undefined' ? globalThis : window);

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function game({ animated = false, reducedMotion = false } = {}) {
  const animations = [];
  class Element {
    constructor(dataset = {}) {
      this.dataset = dataset; this.events = {}; this.style = { setProperty() {} }; this.attributes = {};
      this.children = []; this.clientLeft = 1; this.clientTop = 1;
      this.classList = { toggle() {}, add() {} };
      if (animated) this.animate = () => {
        const animation = { cancelled: false, cancel() { this.cancelled = true; } };
        animations.push(animation); return animation;
      };
    }
    addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
    emit(name, args = {}) { (this.events[name] || []).forEach(fn => fn(args)); }
    setAttribute(name, value) { this.attributes[name] = value; }
    querySelector(selector) { return (this.selectors ||= {})[selector] ||= new Element(); }
    cloneNode() { return new Element(); }
    getBoundingClientRect() { return { left: 80, top: 100, width: 30, height: 130 }; }
    append(child) { this.children.push(child); }
    focus() {} remove() { this.removed = true; }
  }
  const ids = {}, get = id => ids[id] ||= new Element();
  const sources = ['Water', 'ACN', 'MeOH'].map(name => new Element({ chemical: name }));
  get('chemicals').querySelectorAll = () => sources;
  const document = new Element(), window = new Element();
  window.innerWidth = 390; window.innerHeight = 750;
  document.getElementById = get;
  document.createElement = () => new Element();
  window.matchMedia = () => ({ matches: reducedMotion });
  let now = 0, serial = 0;
  const intervals = new Map();
  vm.runInNewContext('Array.prototype.at = undefined;\n' + fs.readFileSync(path.join(__dirname, '../liquid-sort.js'), 'utf8'), {
    document, window, Date: { now: () => now },
    setInterval: fn => { intervals.set(++serial, fn); return serial; },
    clearInterval: id => intervals.delete(id)
  });
  return {
    get, window, document, sources, animations,
    start() { get('play').emit('click'); },
    pour(name, count = 1) { for (let i = 0; i < count; i++) sources.find(el => el.dataset.chemical === name).emit('click'); },
    advance(ms, runTimers = true) { now += ms; if (runTimers) [...intervals.values()].forEach(fn => fn()); },
    next() { get('next').emit('click'); }
  };
}

test('question-based pours complete all four recipes correctly in any pouring order', () => {
  const g = game(); g.start();
  const rounds = [
    [['MeOH', 1], ['ACN', 1], ['Water', 3]],
    [['ACN', 4], ['Water', 2]],
    [['MeOH', 2], ['Water', 2]],
    [['Water', 2], ['ACN', 7]]
  ];
  rounds.forEach((pours, i) => {
    assert.equal(g.get('progress').textContent, `ROUND ${i + 1} OF 4`);
    assert.equal(g.get('seconds').textContent, '30 sec');
    assert.match(g.get('fill-total').innerHTML, /^0</);
    g.pour(pours[0][0]);
    assert.match(g.get('fill-total').innerHTML, new RegExp(`^${[5, 20, 25, 15][i]}<`));
    g.pour(pours[0][0], pours[0][1] - 1);
    pours.slice(1).forEach(([name, count]) => g.pour(name, count));
    assert.equal(g.get('game').dataset.outcome, 'correct');
    assert.match(g.get('fill-total').innerHTML, /^100</);
    assert.equal(g.get('review').hidden, false);
    assert.ok(g.sources.every(source => source.disabled));
    g.pour('Water', 4);
    assert.match(g.get('fill-total').innerHTML, /^100</);
    g.next();
  });
  assert.equal(g.get('report').hidden, false);
  assert.equal(g.get('final-score').textContent, 4);
  assert.equal((g.get('results').innerHTML.match(/Correct · 1\/1/g) || []).length, 4);
  g.get('retry').emit('click');
  assert.equal(g.get('running-score').textContent, 'Score 0 / 4');
  assert.equal(g.get('progress').textContent, 'ROUND 1 OF 4');
  assert.equal(g.get('game').dataset.state, 'playing');
});

test('incorrect full mixture cannot be edited and reports the original recipe', () => {
  const g = game(); g.start(); g.pour('Water', 20);
  assert.equal(g.get('game').dataset.outcome, 'incorrect');
  assert.equal(g.get('running-score').textContent, 'Score 0 / 4');
  assert.match(g.get('correct-recipe').textContent, /Water 90% · ACN 5% · MeOH 5%/);
  g.pour('ACN');
  assert.match(g.get('receiver').attributes['aria-label'], /100 percent filled. Water 100%/);
  g.next();
  assert.equal(g.get('solution-name').textContent, 'Strong Wash Solvent');
  assert.equal(g.get('seconds').textContent, '30 sec');
});

test('visible and accessible pour amounts follow the question and remaining capacity', () => {
  const g = game({ animated: true }); g.start();
  const water = g.sources[0], acn = g.sources[1];
  assert.equal(water.querySelector('small').textContent, '+30% / tap');
  assert.equal(acn.querySelector('small').textContent, '+5% / tap');
  g.pour('Water', 3);
  assert.equal(water.querySelector('small').textContent, '+10% / tap');
  assert.equal(water.attributes['aria-label'], 'Pour 10 percent Water');
  g.pour('Water');
  assert.match(g.get('fill-total').innerHTML, /^100</);
  assert.equal(g.get('game').children.filter(child => child.className === 'pour-dose').at(-1).textContent, '+10%');
  g.next();
  assert.equal(water.querySelector('small').textContent, '+10% / tap');
  assert.equal(acn.querySelector('small').textContent, '+20% / tap');
  assert.equal(acn.attributes['aria-label'], 'Pour 20 percent ACN');
  g.pour('ACN');
  assert.match(g.get('feedback').textContent, /^Added 20% ACN\. 20% filled\./);
  assert.match(g.get('mixture').innerHTML, /height:20%/);
  assert.equal(g.sources[2].querySelector('small').textContent, '+10% / tap');
  g.pour('MeOH');
  assert.match(g.get('composition').innerHTML, /MeOH <strong>10%/);
});

test('late taps are rejected even when browser timers have been throttled', () => {
  const g = game(); g.start(); g.pour('Water', 2); g.advance(30000, false); g.pour('ACN');
  assert.match(g.get('outcome').textContent, /Time’s up/);
  assert.match(g.get('fill-total').innerHTML, /^60</);
  assert.equal(g.get('seconds').textContent, '0 sec');
  for (let i = 0; i < 3; i++) { g.next(); g.advance(30001); }
  g.next();
  assert.equal(g.get('final-score').textContent, 0);
  assert.equal((g.get('results').innerHTML.match(/Timed out · 0\/1/g) || []).length, 4);
});

test('history restore and foregrounding reconcile the countdown; next cannot skip active rounds', () => {
  const g = game(); g.start(); g.next();
  assert.equal(g.get('progress').textContent, 'ROUND 1 OF 4');
  g.window.emit('pagehide'); g.advance(12000); g.window.emit('pageshow', { persisted: true });
  assert.equal(g.get('seconds').textContent, '18 sec');
  g.advance(19000, false); g.document.emit('visibilitychange');
  assert.equal(g.get('game').dataset.state, 'review');
  g.next();
  assert.equal(g.get('progress').textContent, 'ROUND 2 OF 4');
  g.next();
  assert.equal(g.get('progress').textContent, 'ROUND 2 OF 4');
});

test('rapid animated pours count once each and changing rounds cancels all transient effects', () => {
  const g = game({ animated: true }); g.start();
  g.pour('Water', 3); g.pour('ACN'); g.pour('MeOH');
  assert.equal(g.get('game').dataset.outcome, 'correct');
  assert.equal(g.get('running-score').textContent, 'Score 1 / 4');
  assert.ok(g.animations.length > 0);
  assert.ok(g.animations.every(animation => !animation.cancelled));
  g.next();
  assert.ok(g.animations.every(animation => animation.cancelled));
  assert.ok(g.get('game').children.every(child => child.removed));
  assert.match(g.get('fill-total').innerHTML, /^0</);
});

test('reduced motion pours without animated effects; completed effects clean up independently', () => {
  const reduced = game({ animated: true, reducedMotion: true }); reduced.start(); reduced.pour('Water');
  assert.equal(reduced.animations.length, 0);
  assert.match(reduced.get('fill-total').innerHTML, /^30</);
  const g = game({ animated: true }); g.start(); g.pour('Water');
  const completed = [...g.animations];
  g.pour('ACN');
  completed[0].onfinish();
  assert.ok(completed.every(animation => animation.cancelled));
  assert.ok(g.animations.slice(completed.length).every(animation => !animation.cancelled));
  g.window.innerHeight = 670;
  g.window.emit('resize');
  assert.ok(g.animations.slice(completed.length).every(animation => !animation.cancelled));
  g.window.innerWidth = 750;
  g.window.emit('resize');
  assert.ok(g.animations.every(animation => animation.cancelled));
  assert.match(g.get('fill-total').innerHTML, /^35</);
});

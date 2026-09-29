const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { Round, rows } = require('../wrong-sample.js');

test('random rounds shuffle all 25 distinct chemicals, including all three targets and their alternatives', () => {
  const orders = new Set(), seenTargets = new Set();
  const allNames = [...new Set(rows.flat().map(([name]) => name))].sort();
  for (let i = 0; i < 500; i++) {
    const round = new Round();
    assert.equal(round.targets.length, 3);
    assert.equal(round.bottles.length, 25);
    assert.deepEqual(round.bottles.map(b => b.name).sort(), allNames);
    for (const target of round.targets) {
      seenTargets.add(target.name);
      for (const [name, formula] of rows.find(row => row[0][0] === target.name)) {
        assert.ok(round.bottles.some(b => b.name === name && b.formula === formula));
      }
    }
    orders.add(round.bottles.map(b => b.name).join(','));
  }
  assert.equal(seenTargets.size, 10);
  assert.ok(orders.size > 450);
});

test('initial memory time precedes countdown; recall is allowed once and does not stop countdown', () => {
  const round = new Round();
  assert.equal(round.select(round.targets[0].name), null);
  assert.equal(round.recall(), false);
  round.advance(2999);
  assert.equal(round.phase, 'memorize'); assert.equal(round.remaining, 60000);
  round.advance(1001);
  assert.equal(round.phase, 'playing'); assert.equal(round.remaining, 59000);
  assert.equal(round.listRemaining, 0);
  assert.equal(round.recall(), true);
  round.advance(1500); assert.equal(round.listRemaining, 1500); assert.equal(round.remaining, 57500);
  assert.equal(round.recall(), false);
  round.advance(1500); assert.equal(round.listRemaining, 0); assert.equal(round.recall(), false);
});

test('any target order works; repeated and invalid picks cannot change score; wrong picks count once', () => {
  const round = new Round(); round.advance(3000);
  const wrong = round.bottles.find(b => !round.targets.some(t => t.name === b.name)).name;
  assert.equal(round.select('unknown'), null);
  assert.equal(round.select(round.targets[2].name), true);
  assert.equal(round.score, 100);
  assert.equal(round.select(wrong), false); assert.equal(round.score, 75);
  assert.equal(round.select(wrong), null); assert.equal(round.misses, 1);
  assert.equal(round.select(round.targets[2].name), null);
  round.select(round.targets[0].name); round.select(round.targets[1].name);
  assert.equal(round.score, 275); assert.equal(round.found, 3); assert.equal(round.phase, 'results');
  assert.equal(round.select(wrong), null);
});

test('timeouts reject late picks and recall; replay starts fresh; score never becomes negative', () => {
  const round = new Round(); round.advance(3000);
  round.bottles.filter(b => !round.targets.some(t => t.name === b.name)).forEach(b => round.select(b.name));
  assert.equal(round.score, 0); assert.equal(round.misses, 22);
  round.advance(60001); assert.equal(round.phase, 'results'); assert.equal(round.remaining, 0);
  assert.equal(round.select(round.targets[0].name), null); assert.equal(round.recall(), false);
  const replay = new Round();
  assert.equal(replay.score, 0); assert.equal(replay.selected.size, 0); assert.equal(replay.recallUsed, false);
});

test('wrong picks made before a correct pick still reduce the final score', () => {
  const round = new Round(); round.advance(3000);
  round.select(round.bottles.find(b => !round.targets.some(t => t.name === b.name)).name);
  assert.equal(round.score, 0);
  round.targets.forEach(target => round.select(target.name));
  assert.equal(round.score, 275);
});

function browser() {
  const elements = new Map();
  function element() {
    const attributes = new Map(), classes = new Set();
    return {
      hidden: false, disabled: false, dataset: {}, children: [], events: {}, textContent: '',
      classList: { add: name => classes.add(name), remove: name => classes.delete(name), toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); } },
      addEventListener(name, callback) { this.events[name] = callback; },
      setAttribute(name, value) { attributes.set(name, value); }, getAttribute(name) { return attributes.get(name); },
      append(...children) { children.forEach(child => { child.parentElement = this; }); this.children.push(...children); },
      replaceChildren(...children) { this.children = []; this.append(...children); },
      querySelectorAll() { return this.children; },
      querySelector(selector) { return this.children.find(child => child.className === selector.slice(1)); },
      focus() { this.focused = true; }
    };
  }
  function node(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); }
  const source = element(), video = node('video');
  Object.assign(video, { muted: false, plays: 0, pauses: 0, currentTime: 0, load() {}, play() { this.plays++; return Promise.resolve(); }, pause() { this.pauses++; }, querySelector: () => source });
  node('time').parentElement = element();
  let time = 0;
  const portrait = { matches: false, addEventListener(name, handler) { this.change = handler; } };
  const window = { matchMedia: () => portrait, events: {}, addEventListener(name, handler) { this.events[name] = handler; } };
  const document = { hidden: false, documentElement: {}, events: {}, getElementById: node, createElement: element, addEventListener(name, handler) { this.events[name] = handler; }, querySelectorAll: () => [] };
  let interval;
  const context = { document, window, screen: {}, navigator: {}, performance: { now: () => time }, Image: class { set src(value) { queueMicrotask(() => this.onload()); } }, setInterval(handler) { interval = handler; }, Promise, console };
  vm.runInNewContext(fs.readFileSync(require.resolve('../wrong-sample.js'), 'utf8'), context);
  const advance = ms => { time += ms; interval(); };
  const targets = () => node('targets').children.map(li => li.textContent);
  const clickBottle = name => node('bottles').children.find(b => b.dataset.name === name || b.dataset.formula === name).events.click();
  async function start() { await node('start').events.click(); video.events.ended(); advance(450); }
  return { node, video, document, window, portrait, advance, targets, clickBottle, start, elapse: ms => { time += ms; } };
}

test('video ends into blackout then memory; a perfect game shows results and replay plays silent video again', async () => {
  const app = browser();
  await app.node('start').events.click();
  assert.equal(app.video.muted, true); assert.equal(app.video.plays, 1);
  assert.equal(app.node('walkthrough').hidden, false);
  app.video.events.ended(); app.advance(449); assert.equal(app.node('walkthrough').hidden, false);
  app.advance(1); assert.equal(app.node('game').hidden, false);
  assert.equal(app.node('bottles').children.every(b => b.disabled), true);
  app.advance(4000); app.targets().reverse().forEach(app.clickBottle);
  assert.equal(app.node('results').hidden, false); assert.equal(app.node('final-score').textContent, 300);
  assert.equal(app.node('results').dataset.outcome, 'success');
  assert.equal(app.node('result-badge').textContent, 'MISSION ACCOMPLISHED');
  await app.node('replay').events.click();
  assert.equal(app.video.plays, 2); assert.equal(app.video.currentTime, 0); assert.equal(app.node('walkthrough').hidden, false);
  assert.equal(app.node('bottles').children.length, 25);
  assert.equal(app.node('lab').scrollLeft, 0);
});

test('portrait and background pause list and countdown; portrait blocks selections and pauses video', async () => {
  const app = browser(); await app.start(); app.advance(2000);
  app.portrait.matches = true; app.portrait.change(); app.advance(10000);
  assert.equal(app.node('rotate').hidden, false); assert.equal(app.node('app').inert, true);
  assert.equal(app.node('list-countdown').textContent, '2s');
  app.clickBottle(app.targets()[0]); assert.equal(app.node('found').textContent, '0 / 3');
  app.portrait.matches = false; app.portrait.change(); app.advance(2000); app.advance(5000);
  assert.equal(app.node('time').textContent, '55s');
  app.document.hidden = true; app.document.events.visibilitychange(); app.advance(30000);
  app.document.hidden = false; app.document.events.visibilitychange();
  assert.equal(app.node('time').textContent, '55s');
  await app.node('replay').events.click();
  app.portrait.matches = true; app.portrait.change();
  assert.ok(app.video.pauses >= 2);
  app.portrait.matches = false; app.portrait.change(); assert.equal(app.video.plays, 3);
});

test('recall remains visible with an exhausted prompt; a click after the deadline cannot score', async () => {
  const app = browser(); await app.start(); app.advance(4000);
  assert.equal(app.node('mission').dataset.open, 'false');
  assert.equal(app.node('mission').inert, true);
  app.node('recall').events.click();
  assert.equal(app.node('mission').dataset.open, 'true');
  assert.equal(app.node('mission').getAttribute('aria-hidden'), 'false');
  assert.equal(app.node('mission').inert, false);
  assert.equal(app.node('recall-count').textContent, '0');
  app.advance(3000);
  assert.equal(app.node('mission').dataset.open, 'false');
  assert.equal(app.node('mission').getAttribute('aria-hidden'), 'true');
  assert.equal(app.node('mission').inert, true);
  // Content stays mounted for the downward exit animation; the hidden note is inaccessible.
  assert.equal(app.node('request-list').hidden, false);
  assert.equal(app.node('recall').hidden, false); assert.equal(app.node('recall').getAttribute('aria-disabled'), 'true');
  app.node('recall').events.click(); assert.match(app.node('feedback').textContent, /used your extra look/);
  app.elapse(57001); app.clickBottle(app.targets()[0]);
  assert.equal(app.node('results').hidden, false); assert.equal(app.node('final-score').textContent, 0);
  assert.equal(app.node('results').dataset.outcome, 'failed');
});

test('results distinguish success from failed without partial results', async () => {
  const app = browser(); await app.start(); app.advance(4000);
  const wrong = app.node('bottles').children.find(button => !app.targets().includes(button.dataset.formula));
  app.clickBottle(wrong.dataset.formula); app.targets().forEach(app.clickBottle);
  assert.equal(app.node('results').dataset.outcome, 'failed');
  assert.equal(app.node('final-score').textContent, 0);
  assert.match(app.node('result-message').textContent, /did not match/);
  await app.start(); app.advance(4000); app.clickBottle(app.targets()[0]); app.advance(60000);
  assert.equal(app.node('results').dataset.outcome, 'failed');
  assert.equal(app.node('final-score').textContent, 0);
  assert.equal(app.node('results').hidden, false);
});

test('unavailable video offers a working game fallback; history restoration preserves remaining time', async () => {
  const app = browser(); await app.node('start').events.click();
  app.video.events.error(); assert.equal(app.node('continue-video').hidden, false);
  app.node('continue-video').events.click(); app.advance(450); app.advance(5000);
  assert.equal(app.node('time').textContent, '59s');
  app.window.events.pagehide(); app.advance(90000); app.window.events.pageshow();
  assert.equal(app.node('time').textContent, '59s');
});

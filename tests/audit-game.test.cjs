const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function game(random = Math.random) {
  class Element {
    constructor() { this.events = {}; this.children = []; this.style = {}; this.attributes = {}; this.hidden = false; this.clientWidth = 844; this.clientHeight = 390; this.classes = new Set(); this.classList = { toggle: (name, active) => active ? this.classes.add(name) : this.classes.delete(name) }; }
    addEventListener(name, fn) { this.events[name] = fn; }
    append(...items) { this.children.push(...items); }
    replaceChildren() { this.children = []; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    focus() {}
    querySelector() { return new Element(); }
    click() { this.events.click?.({}); }
  }
  let now = 0, interval;
  const nodes = new Map();
  const get = id => { if (!nodes.has(id)) nodes.set(id, new Element()); return nodes.get(id); };
  const document = { hidden: false, events: {}, getElementById: get, createElement: () => new Element(), addEventListener(name, fn) { this.events[name] = fn; } };
  const window = { events: {}, addEventListener(name, fn) { this.events[name] = fn; } };
  const math = Object.create(Math); math.random = random;
  const context = { Math: math, document, window, innerWidth: 844, innerHeight: 390, performance: { now: () => now }, Image: class extends Element { set src(value) { this.url = value; this.onload?.(); } }, setInterval: fn => { interval = fn; } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../audit-game.js'), 'utf8'), context);
  return { get, submit: () => { get('submit').click(); get('scene-next').click(); }, start: () => get('start').click(), tubes: () => get('scene').children.filter(n => n.className === 'tube'), tick(ms) { now += ms; interval(); }, portrait(value) { context.innerWidth = value ? 390 : 844; context.innerHeight = value ? 844 : 390; window.events.resize(); }, hide(value) { document.hidden = value; document.events.visibilitychange(); } };
}

function dirty(g) { return g.tubes().filter(t => t.children[0].url.includes('contaminated')); }
function seeded(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

test('zero-contamination scenarios accept an empty submission and report a clean lab', () => {
  const g = game(() => 0); g.start();
  for (let i = 0; i < 10; i++) {
    assert.equal(dirty(g).length, i < 2 ? 1 : 0);
    if (i < 2) dirty(g)[0].click();
    g.get('submit').click();
    assert.match(g.get('selected-count').textContent, /Correct|All clean/);
    if (i >= 2) assert.equal(g.get('selected-count').textContent, '✓ All clean');
    if (i >= 2) assert.equal(g.get('scene').children.filter(n => n.className === 'scene-feedback').length, 0);
    g.get('scene-next').click();
  }
  assert.match(g.get('report-summary').textContent, /10 \/ 10 correct/);
  assert.equal(g.get('report-title').textContent, 'Bacteria busted!');
});

test('clean scenarios reject false selections; unsubmitted clean scenarios remain unanswered on timeout', () => {
  const g = game(() => 0); g.start(); g.tubes().find(t => !t.children[0].url.includes('contaminated')).click(); g.get('submit').click();
  assert.equal(g.get('selected-count').textContent, '✕ Not quite');
  assert.match(g.get('scene').children.find(n => n.className === 'scene-feedback').innerHTML, /incorrectly selected/);
  g.get('scene-next').click(); g.tick(90000);
  assert.match(g.get('report-summary').textContent, /0 \/ 10 correct/);
  assert.match(g.get('report-results').innerHTML, /Unanswered/);
});

test('random answers are used consistently in gameplay and both reports, using the water-filled tube assets', () => {
  const g = game(() => .99); g.start();
  const counts = [];
  for (let i = 0; i < 10; i++) {
    const tubes = dirty(g); counts.push(tubes.length);
    assert.ok(tubes.every(t => t.children[0].url.endsWith('contaminated-test-tube-with-water.webp')));
    for (const tube of tubes) tube.click();
    g.get('submit').click();
    const overlays = g.get('scene').children.filter(n => n.className === 'scene-feedback');
    assert.equal(g.get('selected-count').textContent, '✓ Correct');
    assert.equal(overlays.length, tubes.length);
    assert.ok(overlays.every(n => n.innerHTML.includes('bacteria-stage caught')));
    assert.ok(overlays.every(n => n.innerHTML.includes('animateTransform')));
    g.get('scene-next').click();
  }
  assert.deepEqual(counts, [1,1,4,5,5,6,5,7,5,7]);
  assert.match(g.get('report-summary').textContent, /10 \/ 10 correct/);
  assert.match(g.get('report-mascot').innerHTML, /animateTransform/);
});

test('replays vary contamination counts and positions, with clean rounds possible', () => {
  const g = game(seeded(42)), positions = new Set(), counts = new Set();
  for (let i = 0; i < 100; i++) {
    g.start(); const tubes = dirty(g);
    counts.add(tubes.length); positions.add(tubes.map(t => t.attributes['aria-label']).join(','));
  }
  assert.deepEqual([...counts], [1]); assert.equal(positions.size, 4);
});

test('individual report pauses timer and preserves answers through rotation and Next', () => {
  const g = game(() => .99); g.start(); g.tick(5000);
  const tube = dirty(g)[0]; tube.click(); tube.click(); assert.equal(g.get('selected-count').textContent, '0 selected');
  dirty(g).forEach(t => t.click()); g.get('submit').click();
  assert.equal(g.get('game').classes.has('scene-review'), true);
  assert.equal(g.get('report').hidden, true);
  g.tick(90000); assert.equal(g.get('seconds').textContent, 85);
  g.portrait(true); g.tick(10000); g.portrait(false);
  assert.equal(g.get('seconds').textContent, 85);
  g.get('scene-next').click(); assert.equal(g.get('progress').textContent, 'Scenario 2 / 10');
  g.tick(5000); assert.equal(g.get('seconds').textContent, 80);
  g.hide(true); g.tick(10000); g.hide(false); assert.equal(g.get('seconds').textContent, 80);
  g.tick(80000); assert.match(g.get('report-summary').textContent, /Time’s up/);
});

test('partial catches on timeout keep caught and missed bacteria with the randomized answer', () => {
  const g = game(() => .99); g.start(); dirty(g)[0].click(); g.tick(90000);
  assert.match(g.get('report-results').innerHTML, /caught-tube/);
  assert.match(g.get('report-results').innerHTML, /missed-tube/);
  assert.match(g.get('report-mascot').innerHTML, /bacteria-stage escaped/);
  assert.match(g.get('report-stats').innerHTML, /<b>1<\/b> caught/);
  g.get('replay').click(); assert.equal(g.get('seconds').textContent, 90);
  assert.equal(g.get('selected-count').textContent, '0 selected');
});


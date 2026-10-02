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
      const classes = new Set();
      this.classList = {
        toggle(name, on) { if (on ?? !classes.has(name)) classes.add(name); else classes.delete(name); },
        add(name) { classes.add(name); },
        contains(name) { return classes.has(name); }
      };
      if (animated) this.animate = (frames, options) => {
        const animation = { frames, options, cancelled: false, cancel() { this.cancelled = true; } };
        const timer = ++serial;
        timeouts.set(timer, { at: now + options.duration, fn: () => { if (!animation.cancelled) animation.onfinish?.(); } });
        animations.push(animation); return animation;
      };
    }
    showModal() { this.open = true; }
    close() { if (this.open) { this.open = false; this.emit('close'); } }
    play() { this.paused = false; this.emit('play'); return Promise.resolve(); }
    pause() { this.paused = true; this.emit('pause'); }
    load() { this.error = null; this.ended = false; }
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
  const intervals = new Map(), timeouts = new Map();
  vm.runInNewContext('Array.prototype.at = undefined;\n' + fs.readFileSync(path.join(__dirname, '../liquid-sort.js'), 'utf8'), {
    document, window, Date: { now: () => now },
    setInterval: fn => { intervals.set(++serial, fn); return serial; },
    clearInterval: id => intervals.delete(id),
    setTimeout: (fn, ms) => { timeouts.set(++serial, { fn, at: now + ms }); return serial; },
    clearTimeout: id => timeouts.delete(id)
  });
  return {
    get, window, document, sources, animations,
    start() { get('retry').emit('click'); },
    demo() { get('play').emit('click'); },
    finishVideo() { get('recipe-video').ended = true; get('recipe-video').emit('ended'); },
    pour(name, count = 1) { for (let i = 0; i < count; i++) sources.find(el => el.dataset.chemical === name).emit('click'); },
    advance(ms, runTimers = true) {
      const end = now + ms;
      if (runTimers) {
        let task;
        while ((task = [...timeouts].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0])) {
          now = task[1].at; timeouts.delete(task[0]); task[1].fn();
        }
      }
      now = end; if (runTimers) [...intervals.values()].forEach(fn => fn());
    },
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

test('tube pouring remains visible with reduced motion; completed effects clean up independently', () => {
  const reduced = game({ animated: true, reducedMotion: true }); reduced.start(); reduced.pour('Water');
  assert.ok(reduced.animations.length > 0);
  assert.ok(reduced.animations.some(animation => animation.frames.some(frame => /rotate\(-?108deg\)/.test(frame.transform))));
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


test('automated example and four guided recipes precede a fresh timed game', () => {
  const g = game({ animated: true }); g.demo();
  assert.equal(g.get('progress').textContent, 'WATCH & LEARN');
  assert.equal(g.get('timer').hidden, true);
  assert.equal(g.get('running-score').hidden, true);
  assert.ok(g.sources.every(source => source.disabled));
  g.pour('Water'); g.next();
  assert.match(g.get('fill-total').innerHTML, /^0</);
  g.advance(4150); assert.match(g.get('fill-total').innerHTML, /^30</);
  assert.ok(g.animations.length > 0);
  g.advance(30000);
  assert.equal(g.get('review').hidden, false);
  assert.match(g.get('correct-recipe').textContent, /Water 90%.*ACN 5%.*MeOH 5%/);
  g.get('replay-demo').emit('click');
  assert.match(g.get('fill-total').innerHTML, /^0</);
  g.advance(30000); g.next();
  const rounds = [[['Water', 3], ['ACN', 1], ['MeOH', 1]], [['Water', 2], ['ACN', 4]], [['Water', 2], ['MeOH', 2]], [['Water', 2], ['ACN', 7]]];
  rounds.forEach((steps, i) => {
    g.finishVideo();
    assert.equal(g.get('progress').textContent, `GUIDED PRACTICE ${i + 1} OF 4`);
    assert.equal(g.get('lesson-target').hidden, false);
    g.advance(60000); g.next();
    assert.match(g.get('fill-total').innerHTML, /^0</);
    g.pour('ACN'); // Only the highlighted Water tube is accepted first.
    assert.match(g.get('fill-total').innerHTML, /^0</);
    steps.forEach(([name, count]) => {
      for (let n = 0; n < count; n++) {
        assert.equal(g.sources.find(source => source.dataset.chemical === name).disabled, false);
        g.pour(name);
        const filled = g.get('fill-total').innerHTML;
        g.pour(name); assert.equal(g.get('fill-total').innerHTML, filled);
        g.advance(900);
      }
    });
    assert.match(g.get('fill-total').innerHTML, /^100</);
    assert.equal(g.get('review').hidden, false);
    g.next();
  });
  assert.equal(g.get('ready').hidden, false);
  g.get('start-game').emit('click');
  assert.equal(g.get('progress').textContent, 'ROUND 1 OF 4');
  assert.equal(g.get('seconds').textContent, '30 sec');
  assert.equal(g.get('running-score').textContent, 'Score 0 / 4');
  assert.equal(g.get('lesson-target').hidden, true);
  assert.equal(g.get('timer').hidden, false);
  assert.ok(g.sources.every(source => !source.disabled));
});

test('demo pauses in the background and restores safely after navigating away mid-pour', () => {
  const g = game(); g.demo();
  g.document.hidden = true; g.advance(20000);
  assert.match(g.get('fill-total').innerHTML, /^0</);
  g.document.hidden = false; g.document.emit('visibilitychange');
  g.advance(4150); assert.match(g.get('fill-total').innerHTML, /^30</);
  g.window.emit('pagehide'); g.advance(20000);
  assert.match(g.get('fill-total').innerHTML, /^30</);
  g.window.emit('pageshow', { persisted: true }); g.advance(30000);
  assert.equal(g.get('review').hidden, false);
  g.next(); g.finishVideo(); g.pour('Water'); g.window.emit('pagehide');
  g.window.emit('pageshow', { persisted: true });
  assert.equal(g.sources[0].disabled, false);
  g.pour('Water'); assert.match(g.get('fill-total').innerHTML, /^60</);
});


test('reduced-motion preference does not suppress tube movement in demo or guided practice', () => {
  const g = game({ animated: true, reducedMotion: true });
  const hasTilt = animations => animations.some(animation => animation.frames.some(frame => /rotate\(-?108deg\)/.test(frame.transform)));
  g.demo(); g.advance(3750);
  assert.ok(hasTilt(g.animations));
  g.advance(30000); g.next();
  g.finishVideo();
  const previous = g.animations.length;
  g.pour('Water');
  assert.ok(hasTilt(g.animations.slice(previous)));
});


test('demo explains taps, fills on landing, and waits for animation completion before advancing', () => {
  const g = game({ animated: true }); g.demo();
  assert.match(g.get('lesson-hint').textContent, /make Column Cleaning/);
  assert.ok(g.sources.every(source => !source.classList.contains('is-guided')));
  g.advance(1800);
  assert.match(g.get('lesson-hint').textContent, /Each Water tap adds 30%/);
  g.advance(1500);
  assert.equal(g.sources[0].classList.contains('demo-tap'), true);
  g.advance(450);
  assert.equal(g.sources[0].classList.contains('demo-tap'), false);
  assert.match(g.get('fill-total').innerHTML, /^0</);
  g.advance(360);
  assert.match(g.get('fill-total').innerHTML, /^0</);
  g.advance(1);
  assert.match(g.get('fill-total').innerHTML, /^30</);
  assert.match(g.get('target-recipe').innerHTML, /30<small> \/ 90%/);
  g.advance(459 + 800);
  assert.match(g.get('lesson-hint').textContent, /Two more Water pours/);
  g.advance(3570); // Second pour and its result pause.
  assert.match(g.get('lesson-hint').textContent, /One last Water pour/);
  g.advance(1950 + 361); // Third pour lands, source is still moving.
  assert.match(g.get('fill-total').innerHTML, /^90</);
  assert.equal(g.sources[0].classList.contains('is-guided'), true);
  assert.equal(g.sources[1].classList.contains('is-guided'), false);
  assert.match(g.get('target-recipe').innerHTML, /is-complete/);
  g.advance(459);
  assert.equal(g.sources[0].classList.contains('is-guided'), true);
  g.advance(800);
  assert.equal(g.sources[1].classList.contains('is-guided'), true);
  assert.match(g.get('lesson-hint').textContent, /Now add 5% ACN/);
  g.advance(15000);
  assert.equal(g.get('review').hidden, false);
  assert.match(g.get('outcome').textContent, /100% filled/);
  assert.equal(g.get('correct-recipe').hidden, true);
  g.get('replay-demo').emit('click');
  assert.match(g.get('fill-total').innerHTML, /^0</);
  g.advance(30000); g.next();
  g.finishVideo();
  assert.equal(g.get('game').dataset.mode, 'practice');
  assert.equal(g.get('tray-label').textContent, 'CHOOSE A CHEMICAL');
  g.start();
  assert.equal(g.get('correct-recipe').hidden, false);
});

test('leaving the animated demo before or after landing never duplicates a pour', () => {
  for (const afterLanding of [false, true]) {
    const g = game({ animated: true }); g.demo();
    g.advance(3750 + (afterLanding ? 400 : 100));
    g.document.hidden = true; g.document.emit('visibilitychange');
    g.advance(30000);
    assert.match(g.get('fill-total').innerHTML, afterLanding ? /^30</ : /^0</);
    g.document.hidden = false; g.document.emit('visibilitychange');
    g.advance(30000);
    assert.match(g.get('fill-total').innerHTML, /^100</);
    assert.equal(g.get('review').hidden, false);
  }
});


test('each guided recipe is gated by its matching audible video', () => {
  const g = game(); g.demo(); g.advance(30000); g.next();
  const files = ['column-cleaning.mp4', 'strong-wash.mp4', 'needle-cleaning.mp4', 'column-storage.mp4'];
  const pours = [[['Water', 3], ['ACN', 1], ['MeOH', 1]], [['Water', 2], ['ACN', 4]], [['Water', 2], ['MeOH', 2]], [['Water', 2], ['ACN', 7]]];
  files.forEach((file, i) => {
    const video = g.get('recipe-video');
    assert.equal(video.src, `assets/test-tube-game-video-assets/${file}`);
    assert.equal(video.muted, false); assert.equal(video.volume, 1);
    assert.equal(g.get('lesson-video').hidden, false);
    assert.equal(g.get('game').hidden, true);
    const fill = g.get('fill-total').innerHTML;
    g.pour('Water'); g.next(); g.advance(60000);
    assert.equal(g.get('fill-total').innerHTML, fill);
    assert.equal(g.get('game').hidden, true);
    video.emit('ended'); assert.equal(g.get('game').hidden, true);
    g.get('video-toggle').emit('click'); assert.equal(video.paused, true);
    g.get('video-toggle').emit('click'); assert.equal(video.paused, false);
    video.error = { code: 2 }; video.emit('error');
    assert.equal(g.get('video-toggle').textContent, 'Retry video');
    g.get('video-toggle').emit('click'); assert.equal(video.error, null);
    g.window.emit('pagehide'); assert.equal(video.paused, true);
    g.window.emit('pageshow', { persisted: true });
    assert.equal(g.get('lesson-video').hidden, false);
    g.finishVideo();
    assert.equal(g.get('lesson-video').hidden, true);
    assert.equal(g.get('game').hidden, false);
    assert.equal(video.paused, true);
    assert.equal(g.get('progress').textContent, `GUIDED PRACTICE ${i + 1} OF 4`);
    for (const [name, count] of pours[i]) for (let n = 0; n < count; n++) { g.pour(name); g.advance(900); }
    g.next();
  });
  assert.equal(g.get('ready').hidden, false);
  g.get('start-game').emit('click');
  assert.equal(g.get('seconds').textContent, '30 sec');
});


test('round result modal compares actual and target mixtures and supports next, close and reopen', () => {
  const g = game(); g.start(); g.pour('Water', 4);
  assert.equal(g.get('mix-result').open, true);
  assert.match(g.get('mix-result-tubes').innerHTML, /Your mixture: Water 100%/);
  assert.match(g.get('mix-result-tubes').innerHTML, /Correct recipe: Water 90%/);
  assert.match(g.get('mix-result-values').innerHTML, /10 percentage points too much/);
  assert.match(g.get('mix-result-values').innerHTML, /5 percentage points too little/);
  g.get('close-result').emit('click');
  assert.equal(g.get('mix-result').open, false);
  g.get('view-result').emit('click');
  assert.equal(g.get('mix-result').open, true);
  g.get('result-next').emit('click');
  assert.equal(g.get('mix-result').open, false);
  assert.equal(g.get('game-title').textContent, 'Strong Wash Solvent');
  g.pour('Water', 2); g.pour('ACN', 4);
  assert.equal(g.get('mix-result').dataset.outcome, 'correct');
  assert.match(g.get('mix-result-title').textContent, /Perfect match/);
  assert.doesNotMatch(g.get('mix-result-values').innerHTML, /too much|too little/);
  g.get('result-next').emit('click'); g.pour('Water'); g.advance(30000);
  assert.match(g.get('mix-result-summary').textContent, /25% before time ran out/);
  assert.match(g.get('mix-result-tubes').innerHTML, /25% filled/);
  g.get('result-next').emit('click'); g.advance(30000);
  assert.match(g.get('result-next').textContent, /See results/);
  g.get('result-next').emit('click');
  assert.equal(g.get('mix-result').open, false);
  assert.equal(g.get('report').hidden, false);
});

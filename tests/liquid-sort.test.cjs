const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const htmlContent = fs.readFileSync(path.join(__dirname, '../liquid-sort.html'), 'utf8');

function createGame({ animated = false, reducedMotion = false } = {}) {
  const animations = [];
  let serial = 0;
  let now = 0;
  const intervals = new Map(), timeouts = new Map();

  class Element {
    constructor(dataset = {}) {
      this.dataset = dataset;
      this.events = {};
      this.style = { setProperty() { } };
      this.attributes = {};
      this.children = [];
      this.clientLeft = 1;
      this.clientTop = 1;
      this.hidden = false;
      this.playbackRate = 1.0;
      this.currentTime = 0;
      this.paused = true;
      const classes = new Set();
      this.classList = {
        toggle(name, on) { if (on ?? !classes.has(name)) classes.add(name); else classes.delete(name); },
        add(name) { classes.add(name); },
        remove(name) { classes.delete(name); },
        contains(name) { return classes.has(name); }
      };
      if (animated) {
        this.animate = (frames, options) => {
          const animation = { frames, options, cancelled: false, cancel() { this.cancelled = true; } };
          const timer = ++serial;
          timeouts.set(timer, { at: now + (options.duration || 0), fn: () => { if (!animation.cancelled) animation.onfinish?.(); } });
          animations.push(animation);
          return animation;
        };
      }
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
    getBoundingClientRect() { return { left: 80, top: 100, width: 42, height: 180 }; }
    append(child) { this.children.push(child); }
    focus() { }
    remove() { this.removed = true; }
  }

  const ids = {}, get = id => ids[id] ||= new Element();
  const sources = ['Water', 'ACN', 'MeOH'].map(name => new Element({ chemical: name }));
  get('chemicals').querySelectorAll = () => sources;
  const demoSources = ['Water', 'ACN', 'MeOH'].map(name => new Element({ demoChem: name }));
  get('demo-chemicals').querySelector = sel => {
    const match = /data-demo-chem="([^"]+)"/.exec(sel);
    return match ? demoSources.find(s => s.dataset.demoChem === match[1]) : new Element();
  };

  const document = new Element(), window = new Element();
  window.innerWidth = 390;
  window.innerHeight = 750;
  document.getElementById = get;
  document.createElement = () => new Element();
  window.matchMedia = () => ({ matches: reducedMotion });

  vm.runInNewContext('Array.prototype.at = undefined;\n' + fs.readFileSync(path.join(__dirname, '../liquid-sort.js'), 'utf8'), {
    document, window, Date: { now: () => now },
    setInterval: fn => { intervals.set(++serial, fn); return serial; },
    clearInterval: id => intervals.delete(id),
    setTimeout: (fn, ms) => { timeouts.set(++serial, { fn, at: now + ms }); return serial; },
    clearTimeout: id => timeouts.delete(id)
  });

  return {
    get, window, document, sources, demoSources, animations,
    click(id) { get(id).emit('click'); },
    demo() { get('play').emit('click'); },
    skip() { get('skip').emit('click'); },
    tryBtn() { get('try-btn').emit('click'); },
    watchSolution() { get('solution-intro-btn').emit('click'); },
    startMixing() { get('video-next').emit('click'); },
    finishVideo() { get('recipe-video').ended = true; get('recipe-video').emit('ended'); },
    pour(name, count = 1) {
      for (let i = 0; i < count; i++) {
        sources.find(el => el.dataset.chemical === name).emit('click');
      }
    },
    next() { get('next').emit('click'); },
    advance(ms, runTimers = true) {
      const end = now + ms;
      if (runTimers) {
        let task;
        while ((task = [...timeouts].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0])) {
          now = task[1].at;
          timeouts.delete(task[0]);
          task[1].fn();
        }
      }
      now = end;
      if (runTimers) [...intervals.values()].forEach(fn => fn());
    }
  };
}

test('Opening Screen has correct Title "The Perfect Cleaning Solution" and Demo / Skip buttons in HTML', () => {
  assert.match(htmlContent, /<h1 id="title">The Perfect Cleaning Solution<\/h1>/);
  assert.match(htmlContent, /<button id="play" class="primary" type="button">Demo <span/);
  assert.match(htmlContent, /<button id="skip" class="button" type="button">Skip <span/);
});

test('Screen 2 Tutorial Demo runs automated pouring demo with Replay and Next controls', () => {
  assert.match(htmlContent, /<h1 id="demo-title">Demo Video<\/h1>/);
  assert.match(htmlContent, /<button id="demo-replay" class="button" type="button">Replay ↻<\/button>/);
  assert.match(htmlContent, /<button id="demo-next" class="primary" type="button">Next <span/);

  const g = createGame({ animated: true });
  g.demo(); // Click Demo button on Opening Screen
  assert.equal(g.get('demo-screen').hidden, false);
  assert.equal(g.get('intro').hidden, true);
  assert.match(g.get('demo-fill-total').innerHTML, /^0</);

  // Advance automated demo
  g.advance(550 + 450 + 700); // 1st pour lands
  assert.match(g.get('demo-fill-total').innerHTML, /^30</);

  // Complete all 5 demo pours
  g.advance(15000);
  assert.match(g.get('demo-fill-total').innerHTML, /^100</);

  // Test Replay button restarts demo
  g.click('demo-replay');
  assert.match(g.get('demo-fill-total').innerHTML, /^0</);

  // Test Next button advances to Screen 3 (Let's Try)
  g.click('demo-next');
  assert.equal(g.get('demo-screen').hidden, true);
  assert.equal(g.get('try-screen').hidden, false);
});

test('Screen 3 Let’s Try button advances to Screen 4 Solution Title', () => {
  assert.match(htmlContent, /<button id="try-btn" class="primary" type="button">Let’s Try <span/);

  const g = createGame();
  g.demo();
  g.click('demo-next'); // Now on Screen 3
  assert.equal(g.get('try-screen').hidden, false);

  g.tryBtn(); // Click Let's Try button
  assert.equal(g.get('try-screen').hidden, true);
  assert.equal(g.get('solution-intro').hidden, false);
  assert.equal(g.get('solution-intro-title').textContent, 'Column Cleaning');
  assert.match(g.get('solution-intro-eyebrow').textContent, /SOLUTION 1 OF 4/);
});

test('Skip button on Opening Screen bypasses demo and jumps to Screen 4 Solution 1', () => {
  const g = createGame();
  g.skip(); // Click Skip button on Screen 1
  assert.equal(g.get('intro').hidden, true);
  assert.equal(g.get('demo-screen').hidden, true);
  assert.equal(g.get('try-screen').hidden, true);
  assert.equal(g.get('solution-intro').hidden, false);
  assert.equal(g.get('solution-intro-title').textContent, 'Column Cleaning');
});

test('Screen 4 to Screen 5 (Solution Video) to Screen 6 (Mixing without Timer)', () => {
  const g = createGame();
  g.skip(); // On Screen 4
  g.watchSolution(); // Click "Watch Video"

  // Screen 5: Video Screen
  assert.equal(g.get('lesson-video').hidden, false);
  assert.match(g.get('video-title').textContent, /Column Cleaning/);
  const video = g.get('recipe-video');
  assert.equal(video.src, 'assets/test-tube-game-video-assets/column-cleaning.mp4?v=portrait-2');

  // Video toggle controls
  g.click('video-toggle'); // Pause
  assert.equal(video.paused, true);
  g.click('video-toggle'); // Play
  assert.equal(video.paused, false);

  // Advance to Screen 6 via Start Mixing button
  g.startMixing();
  assert.equal(g.get('lesson-video').hidden, true);
  assert.equal(g.get('game').hidden, false);

  // Verify Screen 6 has NO TIMER
  assert.equal(g.get('seconds').hidden, true);
  assert.equal(g.get('timer').hidden, true);
  assert.equal(g.get('game-title').textContent, 'Column Cleaning');
});

test('Screen 6 Interactive Guided Practice without timer: guides each pour and completes with Perfect recipe', () => {
  const g = createGame();
  g.skip();
  g.watchSolution();
  g.startMixing();

  // Column Cleaning: Water 90%, ACN 5%, MeOH 5%
  // In guided practice, timer and score are hidden, and active solvent is guided
  assert.equal(g.get('seconds').hidden, true);
  assert.equal(g.get('timer').hidden, true);
  assert.equal(g.get('running-score').hidden, true);
  assert.match(g.get('fill-total').innerHTML, /^0</);

  // Water is the first guided solvent
  const waterBtn = g.sources.find(s => s.dataset.chemical === 'Water');
  assert.equal(waterBtn.classList.contains('is-guided'), true);

  g.pour('Water', 3); // 90%
  assert.match(g.get('fill-total').innerHTML, /^90</);

  // Next guided is ACN
  const acnBtn = g.sources.find(s => s.dataset.chemical === 'ACN');
  assert.equal(acnBtn.classList.contains('is-guided'), true);
  g.pour('ACN', 1); // 5%

  // Next guided is MeOH
  const meohBtn = g.sources.find(s => s.dataset.chemical === 'MeOH');
  assert.equal(meohBtn.classList.contains('is-guided'), true);
  g.pour('MeOH', 1); // 5% -> 100%

  assert.match(g.get('fill-total').innerHTML, /^100</);
  assert.equal(g.get('game').dataset.outcome, 'correct');
  assert.match(g.get('outcome').textContent, /perfect recipe/i);
  assert.equal(g.get('correct-recipe').textContent, '');
  assert.equal(g.get('correct-recipe').hidden, true);
  assert.equal(g.get('review').hidden, false);
});

test('Full workflow: Interactive Guided Practice for all 4 solutions leads to Screen ready, which starts the Test Challenge', () => {
  const g = createGame();
  g.skip(); // Starts at Screen 4 for Solution 1

  const solutions = [
    { name: 'Column Cleaning', pours: [['Water', 3], ['ACN', 1], ['MeOH', 1]] },
    { name: 'Strong Wash Solvent', pours: [['Water', 2], ['ACN', 4]] },
    { name: 'Needle Wash Solvent', pours: [['Water', 2], ['MeOH', 2]] },
    { name: 'Column Storage (C18)', pours: [['Water', 2], ['ACN', 7]] }
  ];

  solutions.forEach((sol, i) => {
    // Screen 4: Title
    assert.equal(g.get('solution-intro').hidden, false);
    assert.equal(g.get('solution-intro-title').textContent, sol.name);

    // Screen 4 -> Screen 5: Video
    g.watchSolution();
    assert.equal(g.get('lesson-video').hidden, false);

    // Screen 5 -> Screen 6: Guided Practice
    g.finishVideo();
    assert.equal(g.get('game').hidden, false);
    assert.equal(g.get('game-title').textContent, sol.name);

    // Perform guided pours
    sol.pours.forEach(([chem, count]) => g.pour(chem, count));
    assert.equal(g.get('game').dataset.outcome, 'correct');
    assert.match(g.get('fill-total').innerHTML, /^100</);

    // Advance to next
    g.next();
  });

  // After all 4 guided solutions are complete, Screen 'ready' (Practice Complete) is shown!
  assert.equal(g.get('ready').hidden, false);

  // User clicks "Start Game" to begin the Test Challenge
  g.click('start-game');
  assert.equal(g.get('ready').hidden, true);
  assert.equal(g.get('game').hidden, false);
  assert.equal(g.get('seconds').hidden, false);
  assert.equal(g.get('timer').hidden, false);
  assert.equal(g.get('running-score').hidden, false);
  assert.equal(g.get('lesson-target').hidden, true); // Hidden target recipe tests memory!

  // Play through the 4 rounds of the test
  solutions.forEach((sol, i) => {
    assert.equal(g.get('game-title').textContent, sol.name);
    sol.pours.forEach(([chem, count]) => g.pour(chem, count));
    assert.equal(g.get('mix-result').open, true);
    g.next(); // Closes modal and advances to next test round
  });

  // Screen 7: Challenge Complete Report
  assert.equal(g.get('report').hidden, false);
  assert.equal(g.get('final-score').textContent, 4);
  assert.match(g.get('report-message').textContent, /perfectly prepared/);
});

test('Animated pours with reduced motion keep tube movement visible and clean up', () => {
  const g = createGame({ animated: true, reducedMotion: true });
  g.skip();
  g.watchSolution();
  g.startMixing();

  g.pour('Water');
  assert.ok(g.animations.length > 0);
  assert.ok(g.animations.some(anim => anim.frames.some(f => /rotate\(-?108deg\)/.test(f.transform))));
  assert.match(g.get('fill-total').innerHTML, /^30</);

  // Window resize cancels transient active animations safely
  g.window.innerWidth = 768;
  g.window.emit('resize');
  assert.ok(g.animations.every(anim => anim.cancelled));
});

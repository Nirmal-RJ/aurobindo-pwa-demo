const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const htmlContent = fs.readFileSync(path.join(__dirname, '../liquid-sort.html'), 'utf8');

function createGame({ animated = false, reducedMotion = false, random = Math.random, AudioContext, fetchAudio } = {}) {
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
    append(child) { this.children = this.children.filter(item => item !== child); this.children.push(child); }
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
  window.AudioContext = AudioContext;
  window.innerWidth = 390;
  window.innerHeight = 750;
  document.getElementById = get;
  document.createElement = () => new Element();
  window.matchMedia = () => ({ matches: reducedMotion });

  vm.runInNewContext('Array.prototype.at = undefined;\n' + fs.readFileSync(path.join(__dirname, '../liquid-sort.js'), 'utf8'), {
    document, window, fetch: fetchAudio, Math: Object.assign(Object.create(Math), { random }), Date: { now: () => now },
    setInterval: fn => { intervals.set(++serial, fn); return serial; },
    clearInterval: id => intervals.delete(id),
    setTimeout: (fn, ms) => { timeouts.set(++serial, { fn, at: now + ms }); return serial; },
    clearTimeout: id => timeouts.delete(id)
  });

  return {
    get, window, document, sources, demoSources, animations,
    click(id) { get(id).emit('click'); },
    demo() { get('play').emit('click'); },
    start() { get('play').emit('click'); },
    tryBtn() { get('try-btn').emit('click'); },
    watchSolution() { get('solution-intro-btn').emit('click'); },
    startMixing() { get('video-next').emit('click'); },
    finishVideo() { get('recipe-video').ended = true; get('recipe-video').emit('ended'); },
    pour(name, count = 1) {
      for (let i = 0; i < count; i++) {
        sources.find(el => el.dataset.chemical === name).emit('click');
        if (get('game').dataset.pouring === 'true') {
          const duration = animations.at(-1)?.options.duration || 820;
          this.advance(duration);
        }
      }
      if (get('game').dataset.state === 'settling') this.advance(1400);
    },
    next() { get(get('practice-result').open ? 'practice-result-action' : 'next').emit('click'); },
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

test('Opening Screen shows only background artwork and Start button', () => {
  const intro = htmlContent.match(/<section id="intro"[\s\S]*?<\/section>/)[0];
  assert.match(intro, /1-title-page\/bg\.webp/);
  assert.match(intro, /1-title-page\/start-button\.webp/);
  assert.match(intro, /id="play"[^>]*aria-label="Start"/);
  assert.doesNotMatch(intro, /<h1|id="skip"|intro-tubes/);
});

test('Start opens the first solution artwork without running an automatic demo', () => {
  const g = createGame({ animated: true });
  g.click('play');
  assert.equal(g.get('intro').hidden, true);
  assert.equal(g.get('demo-screen').hidden, true);
  assert.equal(g.get('solution-intro').hidden, false);
  assert.match(g.get('solution-intro-art').src, /column-cleaning-intro-page\.webp$/);
  g.advance(15000);
  assert.equal(g.animations.length, 0);
  assert.equal(g.get('solution-intro').hidden, false);
  const intro = htmlContent.match(/<section id="solution-intro"[\s\S]*?<\/section>/)[0];
  assert.match(intro, /watch-video-button\.webp/);
  assert.match(intro, /exit-button\.webp/);
  assert.match(intro, /href="index\.html#\/games"/);
});

test('Screen 4 to Screen 5 (Solution Video) to Screen 6 (Mixing without Timer)', () => {
  const g = createGame();
  g.start(); // On Screen 4
  g.watchSolution(); // Click "Watch Video"

  // Screen 5: Video Screen
  assert.equal(g.get('lesson-video').hidden, false);
  assert.match(g.get('video-title').textContent, /Column Cleaning/);
  const video = g.get('recipe-video');
  assert.equal(video.src, 'assets/test-tube-game-assets/column-cleaning.mp4?v=portrait-2');

  // Replay restarts the same solution and preserves the image button.
  video.currentTime = 12;
  video.pause();
  g.click('video-toggle');
  assert.equal(video.currentTime, 0);
  assert.equal(video.paused, false);
  assert.equal(g.get('video-toggle').attributes['aria-label'], 'Replay Video');
  g.finishVideo();
  assert.equal(g.get('lesson-video').hidden, false);
  const page = htmlContent.match(/<section id="lesson-video"[\s\S]*?<\/section>/)[0];
  assert.match(page, /<video[^>]*controls/);
  assert.match(page, /replay-video-button\.webp/);
  assert.match(page, /start-mixing-button\.webp/);

  // Advance to Screen 6 via Start Mixing button
  g.startMixing();
  assert.equal(g.get('lesson-video').hidden, true);
  assert.equal(g.get('game').hidden, false);

  // Verify Screen 6 has NO TIMER
  assert.equal(g.get('seconds').hidden, true);
  assert.equal(g.get('timer').hidden, true);
  assert.equal(g.get('game-title').textContent, 'Column Cleaning');
});

test('Manual practice accepts any solvent order without a timer and shows correct result', () => {
  const g = createGame();
  g.start(); g.watchSolution(); g.startMixing();
  assert.equal(g.get('timer').hidden, true);
  assert.equal(g.get('seconds').hidden, true);
  assert.equal(g.get('lesson-target').hidden, true);
  g.sources.forEach(button => {
    assert.equal(button.disabled, false);
    assert.equal(button.classList.contains('is-guided'), false);
  });
  g.advance(60000);
  assert.equal(g.get('practice-result').open, undefined);
  g.pour('MeOH'); g.pour('ACN'); g.pour('Water', 3);
  assert.equal(g.get('game').dataset.outcome, 'correct');
  assert.equal(g.get('practice-result').open, true);
  assert.match(g.get('practice-result-button').src, /next-solution%20button/);
  g.next();
  assert.equal(g.get('practice-result').open, false);
  assert.equal(g.get('solution-intro').hidden, false);
  assert.match(g.get('solution-intro-art').src, /strong-wash-intro/);
});

test('Wrong practice mixture offers the same video and resets on retry', () => {
  const g = createGame();
  g.start(); g.watchSolution(); g.startMixing();
  g.pour('Water', 4);
  assert.equal(g.get('game').dataset.outcome, 'incorrect');
  assert.equal(g.get('practice-result').open, true);
  assert.match(g.get('practice-result-button').src, /6-wrong-answer-pop-up\/watch-video-button/);
  g.click('practice-result-action');
  assert.equal(g.get('practice-result').open, false);
  assert.equal(g.get('lesson-video').hidden, false);
  assert.match(g.get('recipe-video').src, /column-cleaning/);
  g.startMixing();
  assert.match(g.get('fill-total').innerHTML, /^0</);
  g.sources.forEach(button => assert.equal(button.disabled, false));
});

test('Full workflow: Manual practice for all 4 solutions leads to Screen ready, which starts the Test Challenge', () => {
  const g = createGame();
  g.start(); // Starts at Screen 4 for Solution 1

  const solutions = [
    { name: 'Column Cleaning', pours: [['Water', 3], ['ACN', 1], ['MeOH', 1]] },
    { name: 'Strong Wash Solvent', pours: [['Water', 2], ['ACN', 4]] },
    { name: 'Needle Wash Solvent', pours: [['Water', 2], ['MeOH', 2]] },
    { name: 'Column Storage (C18)', pours: [['Water', 2], ['ACN', 2]] }
  ];

  solutions.forEach((sol, i) => {
    // Screen 4: Title
    assert.equal(g.get('solution-intro').hidden, false);
    assert.equal(g.get('solution-intro').attributes['aria-label'], sol.name);
    assert.match(g.get('solution-intro-art').src, new RegExp(['column-cleaning', 'strong-wash', 'needle-wash', 'column-storage'][i] + '-intro-page\\.webp$'));

    // Screen 4 -> Screen 5: Video
    g.watchSolution();
    assert.equal(g.get('lesson-video').hidden, false);

    // Screen 5 -> Screen 6: Guided Practice
    g.finishVideo();
    g.startMixing();
    assert.equal(g.get('game').hidden, false);
    assert.equal(g.get('game-title').textContent, sol.name);

    if (i === 3) {
      const acn = g.sources.find(button => button.dataset.chemical === 'ACN');
      assert.equal(acn.querySelector('small').textContent, '+35% / tap');
    }
    // Perform manual pours
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
  assert.equal(g.get('running-score').hidden, true);
  assert.equal(g.get('lesson-target').hidden, true); // Hidden target recipe tests memory!

  // Play through the 4 rounds of the test
  solutions.forEach((sol, i) => {
    assert.equal(g.get('game-title').textContent, sol.name);
    sol.pours.forEach(([chem, count]) => g.pour(chem, count));
    assert.notEqual(g.get('mix-result').open, true);
  });

  // Screen 7: Challenge Complete Report
  assert.equal(g.get('report').hidden, false);
  assert.equal(g.get('final-score').textContent, 4);
  assert.match(g.get('report-message').textContent, /perfectly prepared/);
});

test('Animated pours with reduced motion keep tube movement visible and clean up', () => {
  const g = createGame({ animated: true, reducedMotion: true });
  g.start();
  g.watchSolution();
  g.startMixing();

  g.sources.find(button => button.dataset.chemical === 'Water').emit('click');
  assert.ok(g.animations.length > 0);
  assert.ok(g.animations.some(anim => anim.frames.some(f => /rotate\(-?108deg\)/.test(f.transform))));
  assert.match(g.get('fill-total').innerHTML, /^30</);

  // Window resize cancels transient active animations safely
  g.window.innerWidth = 768;
  g.window.emit('resize');
  assert.ok(g.animations.every(anim => anim.cancelled));
});

test('Challenge automatically advances without popups and keeps one continuous deadline', () => {
  const g = createGame();
  g.click('start-game');
  g.advance(10000);
  g.pour('Water', 3); g.pour('ACN'); g.pour('MeOH');
  assert.notEqual(g.get('mix-result').open, true);
  assert.equal(g.get('game-title').textContent, 'Strong Wash Solvent');
  assert.equal(g.get('seconds').textContent, '00:34');
  g.advance(33600);
  assert.equal(g.get('report').hidden, false);
  assert.equal(g.get('final-score').textContent, 1);
});

test('Incorrect challenge mixes also advance automatically', () => {
  const g = createGame();
  g.click('start-game');
  g.pour('Water', 4);
  assert.equal(g.get('game-title').textContent, 'Strong Wash Solvent');
  assert.notEqual(g.get('mix-result').open, true);
  g.advance(45000);
  assert.equal(g.get('report').hidden, false);
  assert.equal(g.get('final-score').textContent, 0);
});

test('Practice orders solvents by descending target percentage for every recipe', () => {
  const g = createGame();
  g.start();
  const orders = [['Water', 'ACN', 'MeOH'], ['ACN', 'Water', 'MeOH'], ['Water', 'MeOH', 'ACN'], ['ACN', 'Water', 'MeOH']];
  const pours = [[['Water', 3], ['ACN', 1], ['MeOH', 1]], [['Water', 2], ['ACN', 4]], [['Water', 2], ['MeOH', 2]], [['Water', 2], ['ACN', 2]]];
  orders.forEach((expected, i) => {
    g.watchSolution(); g.startMixing();
    assert.deepEqual(g.get('chemicals').children.map(button => button.dataset.chemical), expected);
    pours[i].forEach(([name, count]) => g.pour(name, count));
    g.next();
  });
});

test('Challenge shuffles on each solution and preserves solvent click behavior', () => {
  const values = [0, 0, .99, .99];
  const g = createGame({ random: () => values.shift() ?? .5 });
  g.click('start-game');
  assert.deepEqual(g.get('chemicals').children.map(button => button.dataset.chemical), ['ACN', 'MeOH', 'Water']);
  g.pour('Water', 3); g.pour('ACN'); g.pour('MeOH');
  assert.notEqual(g.get('mix-result').open, true);
  assert.deepEqual(g.get('chemicals').children.map(button => button.dataset.chemical), ['Water', 'ACN', 'MeOH']);
  g.pour('Water', 2); g.pour('ACN', 4);
  assert.equal(g.get('game-title').textContent, 'Needle Wash Solvent');
});

test('Challenge finishes the pour animation before automatically starting the next solution', () => {
  const g = createGame({ animated: true });
  g.click('start-game');
  g.pour('Water', 3); g.pour('ACN');
  g.sources.find(button => button.dataset.chemical === 'MeOH').emit('click');
  assert.equal(g.get('game').dataset.state, 'settling');
  assert.notEqual(g.get('mix-result').open, true);
  g.advance(819);
  assert.notEqual(g.get('mix-result').open, true);
  g.advance(450);
  assert.notEqual(g.get('mix-result').open, true);
  g.advance(1);
  assert.notEqual(g.get('mix-result').open, true);
  assert.equal(g.get('game').dataset.state, 'playing');
  assert.equal(g.get('game-title').textContent, 'Strong Wash Solvent');
  assert.equal(g.get('seconds').textContent, '00:41');
});

test('Timer urgency starts at ten seconds and clears on a new challenge', () => {
  const g = createGame();
  g.click('start-game');
  g.advance(34999);
  assert.equal(g.get('timer').classList.contains('urgent'), false);
  g.advance(1);
  assert.equal(g.get('timer').classList.contains('urgent'), true);
  assert.equal(g.get('seconds').textContent, '00:10');
  g.pour('Water', 4);
  assert.equal(g.get('game').dataset.state, 'playing');
  assert.equal(g.get('timer').classList.contains('urgent'), true);
  g.click('start-game');
  assert.equal(g.get('timer').classList.contains('urgent'), false);
});

test('Report shows all four statuses and opens the selected solution video', () => {
  const g = createGame();
  g.click('start-game'); g.advance(45000);
  assert.equal(g.get('report').hidden, false);
  const markup = g.get('results').innerHTML;
  assert.equal((markup.match(/data-report-video=/g) || []).length, 4);
  assert.equal((markup.match(/aria-label="Incorrect"/g) || []).length, 4);
  assert.match(markup, /9-report-page\/watch-video-button\.webp/);
  g.get('results').emit('click', { target: { closest: () => ({ dataset: { reportVideo: '2' } }) } });
  assert.equal(g.get('lesson-video').hidden, false);
  assert.match(g.get('recipe-video').src, /needle-cleaning\.mp4/);
  g.click('retry');
  assert.equal(g.get('intro').hidden, false);
});

test('Every game screen and result dialog provides an exit to the menu', () => {
  const screens = htmlContent.match(/<(?:section|dialog)\b[\s\S]*?<\/(?:section|dialog)>/g);
  assert.ok(screens.length >= 10);
  screens.forEach(screen => {
    assert.match(screen, /class="game-exit" href="index\.html#\/games"/);
    assert.match(screen, /images\/exit-button\.webp/);
  });
});

test('Pour audio is prepared on Start and synchronized with practice and challenge pours', async () => {
  const requested = [], played = [];
  class AudioContext {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    resume() { return Promise.resolve(); }
    decodeAudioData() { return Promise.resolve({ duration: 2 }); }
    createBufferSource() {
      return { connect() {}, disconnect() {}, stop() {}, start: (...args) => played.push(args) };
    }
    createGain() {
      return { connect() {}, disconnect() {}, gain: { setValueAtTime() {}, linearRampToValueAtTime() {} } };
    }
  }
  const g = createGame({ animated: true, AudioContext, fetchAudio: async url => {
    requested.push(url);
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(1) };
  } });
  g.start();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested, ['audio/pour-audio.mp3']);
  g.watchSolution(); g.startMixing();
  g.pour('Water');
  assert.equal(played.length, 1);
  assert.ok(played[0][0] > 0);
  assert.equal(played[0][2], .45);
  assert.equal(played[0][0], .27);
  assert.equal(g.animations[0].options.duration, 1000);
  g.advance(1000);
  g.click('start-game');
  g.pour('Water');
  assert.equal(played.length, 2);
  assert.equal(requested.filter(url => url === 'audio/pour-audio.mp3').length, 1);
});

test('Both modes disable all solvent cards while pouring and recover after rotation', () => {
  for (const mode of ['practice', 'game']) {
    const g = createGame({ animated: true });
    if (mode === 'practice') { g.start(); g.watchSolution(); g.startMixing(); }
    else g.click('start-game');
    const water = g.sources.find(button => button.dataset.chemical === 'Water');
    water.emit('click');
    assert.equal(g.get('game').dataset.pouring, 'true');
    assert.equal(g.get('chemicals').attributes['aria-busy'], 'true');
    assert.match(g.get('feedback').textContent, /Pouring/);
    g.sources.forEach(button => assert.equal(button.disabled, true));
    g.sources.find(button => button.dataset.chemical === 'ACN').emit('click');
    assert.match(g.get('fill-total').innerHTML, /^30</);
    g.window.innerWidth = 750;
    g.window.emit('resize');
    assert.equal(g.get('game').dataset.pouring, 'false');
    g.sources.forEach(button => assert.equal(button.disabled, false));
    water.emit('click');
    g.advance(820);
    assert.equal(g.get('game').dataset.pouring, 'false');
    g.sources.forEach(button => assert.equal(button.disabled, false));
  }
});

test('Last ten seconds audio follows the continuous countdown across solutions', async () => {
  const sources = [], urls = [];
  class AudioContext {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    resume() { return Promise.resolve(); }
    decodeAudioData() { return Promise.resolve({ duration: 10 }); }
    createBufferSource() {
      const source = { stopped: false, connect() {}, disconnect() {}, stop() { this.stopped = true; }, start(...args) { this.args = args; } };
      sources.push(source); return source;
    }
  }
  const g = createGame({ AudioContext, fetchAudio: async url => {
    urls.push(url); return { ok: true, arrayBuffer: async () => new ArrayBuffer(1) };
  } });
  g.click('start-game');
  await new Promise(resolve => setImmediate(resolve));
  assert.ok(urls.includes('audio/10s-timer-audio.wav'));
  g.advance(35000);
  assert.deepEqual(sources[0].args, [0, 0, 10]);
  g.advance(2000);
  g.pour('Water', 4);
  assert.equal(sources[0].stopped, true);
  assert.deepEqual(sources[1].args, [0, 2.45, 7.55]);
  g.advance(6600);
  assert.equal(sources[1].stopped, true);
  assert.equal(g.get('report').hidden, false);
});

test('Practice chooses a sticker from the matching result collection', () => {
  for (const correct of [true, false]) {
    const g = createGame({ random: () => .5 });
    g.start(); g.watchSolution(); g.startMixing();
    if (correct) { g.pour('Water', 3); g.pour('ACN'); g.pour('MeOH'); }
    else g.pour('Water', 4);
    const sticker = g.get('practice-result-sticker');
    assert.equal(sticker.src, correct ? 'assets/positive-stickers/Kya%20Baat%20Hai%20Hindi.webp' : 'assets/negative-stickers/3.png');
    sticker.onload();
    assert.equal(sticker.classList.contains('is-visible'), true);
  }
});

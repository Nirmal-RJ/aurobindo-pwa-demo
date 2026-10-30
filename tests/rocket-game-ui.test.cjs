const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function mount() {
  let time = 0, serial = 0, stored;
  const preferences = new Map();
  const tasks = new Map(), elements = new Map();
  const sounds = [], documentEvents = {}, windowEvents = {};
  const chemicalNames = ['Water', 'ACN', 'MeOH'];
  class Element {
    constructor() {
      this.events = {}; this.dataset = {}; this.children = []; this.hidden = false; this.disabled = false;
      this.style = { writes: 0, setProperty(k, v) { this[k] = v; this.writes++; }, getPropertyValue(k) { return this[k] || ''; }, getPropertyPriority() { return ''; }, removeProperty(k) { delete this[k]; } }; this.parentElement = { appendChild() {}, classList: { toggle() {}, remove() {} } };
      this.attributes = {}; const classes = new Set();
      this.classList = { add: (...items) => items.forEach(i => classes.add(i)), remove: (...items) => items.forEach(i => classes.delete(i)), toggle: (i, on) => on ? classes.add(i) : classes.delete(i), contains: i => classes.has(i) };
    }
    addEventListener(name, fn) { this.events[name] = fn; }
    click() { if (!this.disabled) this.events.click?.({ detail: 0 }); }
    setAttribute(k, v) { this.attributes[k] = v; } focus() {} pause() {} close() { this.open = false; }
    showModal() { this.open = true; } play() { return Promise.resolve(); }
    querySelector(selector) { if (selector === '.belt') return this.belt ||= new Element(); return null; }
    querySelectorAll(selector) {
      if (selector === 'button') return [1,2,3,4,5].map(n => { const b = new Element(); b.dataset.rocket = n; return b; });
      return chemicalNames.map(c => elements.get(`${selector === '[data-fill]' ? 'fill' : 'undo'}-${c}`));
    }
  }
  const html = fs.readFileSync(path.join(__dirname, '../assets/rocket-game-scripts/rocket-game.html'), 'utf8');
  for (const [, id] of html.matchAll(/id="([^"]+)"/g)) elements.set(id, new Element());
  for (const c of chemicalNames) for (const kind of ['tank','fill','undo','amount','liquid','dispensed','pipe-art','pipe-outline','pipe-metal','pipe-core','pipe-flow']) {
    const e = new Element(); e.dataset[kind] = c; elements.set(`${kind}-${c}`, e);
  }
  const choices = [1,2,3,4,5].map(n => { const e = new Element(); e.dataset.rocket = n; return e; });
  elements.get('rocket-track').querySelectorAll = () => choices;
  elements.get('flames').children = [new Element(), new Element(), new Element()];
  const context = vm.createContext({
    Audio: class {
      constructor(src) { this.src = src; this.paused = true; this.plays = 0; this.currentTime = 0; sounds.push(this); }
      play() { this.plays++; this.paused = false; return Promise.resolve(); }
      pause() { this.paused = true; }
    },
    console, performance: { now: () => time }, Date, Math, JSON, Blob,
    localStorage: { getItem: key => key === 'aurobindo.rocketier.v1' ? stored || null : preferences.get(key) || null, setItem: (key, value) => { if (key === 'aurobindo.rocketier.v1') stored = value; else preferences.set(key, value); } },
    navigator: {}, location: {}, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    document: {
      getElementById: id => { assert.ok(elements.has(id), `Missing element ${id}`); return elements.get(id); },
      querySelector: selector => { const [, kind, c] = selector.match(/data-(fill|undo)="(\w+)"/); return elements.get(`${kind}-${c}`); },
      addEventListener(name, fn) { (documentEvents[name] ||= []).push(fn); }, createElement: () => Object.assign(new Element(), { remove() {} })
    },
    setTimeout: (fn, delay) => { const id = ++serial; tasks.set(id, { fn, at: time + delay }); return id; },
    requestAnimationFrame: fn => { const id = ++serial; tasks.set(id, { fn, at: time + 16 }); return id; },
    getComputedStyle: el => ({ transform: el.transform || 'matrix(1,0,0,1,0,0)' }),
    clearTimeout: id => tasks.delete(id),
    setInterval: (fn, delay) => { const id = ++serial; tasks.set(id, { fn, at: time + delay, delay }); return id; },
    clearInterval: id => tasks.delete(id)
  });
  context.window = context; context.scrollTo = () => {}; context.addEventListener = (name, fn) => { (windowEvents[name] ||= []).push(fn); };
  for (const file of ['rocket-game-core.js', 'rocket-game.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/rocket-game-scripts', file), 'utf8'), context);
  function advance(ms) {
    const end = time + ms;
    while (true) {
      const next = [...tasks].filter(([, task]) => task.at <= end).sort((a,b) => a[1].at - b[1].at)[0];
      if (!next) break;
      const [id, task] = next; time = task.at;
      if (task.delay) task.at += task.delay; else tasks.delete(id);
      task.fn();
    }
    time = end;
  }
  function begin(ready = true, variant = 1) {
    elements.get('start').click(); elements.get('start-mission').click(); elements.get('play').click(); choices[variant - 1].click();
    if (ready) advance(5150);
  }
  return { elements, choices, advance, begin, context, sounds, documentEvents, windowEvents, preferences, state: () => JSON.parse(stored) };
}
test('home cannot start until the asset loading gate is ready', () => {
  const ui = mount(); ui.context.RocketPreload = { ready: false };
  ui.elements.get('start').click();
  assert.equal(ui.elements.get('game').dataset.screen, undefined);
  ui.context.RocketPreload.ready = true;
  ui.elements.get('start').click();
  assert.equal(ui.elements.get('game').dataset.screen, 'brief');
});

test('page flow wires selection, correct fill, animation and next question', () => {
  const ui = mount(); ui.begin();
  let run = ui.state().runs[0], q = run.questions[0];
  assert.equal(q.attempts.length, 1); assert.equal(ui.elements.get('hangar').hidden, false);
  const recipe = ui.context.RocketGame.recipes[q.recipeId];
  for (const c of ['Water','ACN','MeOH']) {
    for (let i = 0; i < recipe.mix[c]; i += ui.context.RocketGame.increment(recipe, c)) ui.elements.get(`fill-${c}`).click();
  }
  assert.equal(ui.elements.get('launch').disabled, true);
  assert.equal(ui.elements.get('launch').hidden, true);
  ui.advance(650);
  assert.equal(ui.elements.get('launch').disabled, false);
  assert.equal(ui.elements.get('launch').hidden, false);
  assert.equal(ui.elements.get('launch').classList.contains('launch-ready'), true);
  ui.elements.get('launch').click();
  assert.equal(ui.elements.get('hangar').classList.contains('launching'), true);
  ui.advance(3500);
  assert.equal(ui.elements.get('hangar').hidden, false);
  assert.equal(ui.elements.get('hangar').classList.contains('smoke-cover'), false);
  assert.equal(ui.elements.get('hangar').classList.contains('launch-blackout'), false);
  ui.advance(1000);
  assert.equal(ui.elements.get('hangar').classList.contains('launch-blackout'), true);
  ui.advance(800);
  assert.equal(ui.elements.get('cinematic').hidden, false);
  assert.equal(ui.elements.get('journey').hidden, true);
  ui.advance(2400);
  assert.equal(ui.elements.get('cinematic').classList.contains('hovering'), true);
  ui.advance(1000);
  assert.equal(ui.elements.get('cinematic').classList.contains('accelerating'), true);
  ui.advance(3099);
  assert.equal(ui.elements.get('journey').hidden, true);
  ui.advance(1);
  assert.equal(ui.elements.get('journey').hidden, false);
  assert.equal(ui.state().runs[0].questions[0].attempts[0].outcome, 'correct');
  assert.equal(ui.elements.get('continue').disabled, true);
  assert.equal(ui.elements.get('journey-rocket').dataset.from, '0');
  assert.ok(Number(ui.elements.get('journey-rocket').dataset.to) > 0);
  ui.advance(3300);
  assert.equal(ui.elements.get('continue').disabled, true);
  assert.equal(ui.elements.get('journey-stats').hidden, false);
  assert.equal(ui.elements.get('journey-rocket').classList.contains('route-flying'), false);
  const initialStats = ui.elements.get('journey-stats').innerHTML;
  ui.advance(600);
  assert.notEqual(ui.elements.get('journey-stats').innerHTML, initialStats);
  assert.equal(ui.elements.get('continue').disabled, true);
  ui.advance(900);
  assert.equal(ui.elements.get('continue').disabled, false);
  assert.equal(ui.elements.get('journey-rocket').classList.contains('route-arrived'), true);
  ui.elements.get('continue').click();
  run = ui.state().runs[0]; assert.equal(run.questions.length, 2); assert.notEqual(run.questions[0].recipeId, run.questions[1].recipeId);
});

test('map resumes from cumulative distance and reaches the destination at mission completion', () => {
  const ui = mount(); ui.begin(); let previous = 0;
  for (let question = 0; question < 10; question++) {
    const run = ui.state().runs[0], q = run.questions.at(-1);
    const recipe = ui.context.RocketGame.recipes[q.recipeId];
    for (const c of ['Water','ACN','MeOH']) for (let amount = 0; amount < recipe.mix[c]; amount += ui.context.RocketGame.increment(recipe,c)) ui.elements.get(`fill-${c}`).click();
    ui.advance(650); ui.elements.get('launch').click(); ui.advance(11800);
    const rocket = ui.elements.get('journey-rocket');
    assert.ok(Math.abs(Number(rocket.dataset.from)-previous)<1e-10);
    const target = Number(rocket.dataset.to);
    assert.ok(target > previous && target <= 1);
    assert.equal(ui.elements.get('journey-stats').hidden, true);
    ui.advance(3300);
    assert.equal(ui.elements.get('journey-hero').hidden, false);
    assert.match(ui.elements.get('journey-hero').src, /journey-success-1\.webp$/);
    ui.advance(1500);
    assert.equal(ui.elements.get('route-covered').style.strokeDashoffset, String(1-target));
    if (ui.state().runs[0].status === 'completed') {
      assert.equal(target,1); assert.equal(rocket.style.left,'81%');
      ui.elements.get('continue').click();
      assert.equal(ui.elements.get('complete').hidden, false);
      assert.equal(ui.elements.get('best-pace-row').hidden, true);
      ui.advance(2200);
      const settledPace = ui.elements.get('complete-pace').textContent;
      assert.equal(ui.elements.get('best-pace-row').hidden, true);
      ui.advance(1499);
      assert.equal(ui.elements.get('best-pace-row').hidden, true);
      assert.equal(ui.elements.get('complete-pace').textContent, settledPace);
      ui.advance(1);
      assert.equal(ui.elements.get('best-pace-row').hidden, false);
      ui.advance(1500);
      assert.equal(ui.elements.get('complete-best-pace').textContent, settledPace);
      ui.elements.get('next-mission').click();
      assert.equal(ui.elements.get('mission').hidden, false);
      assert.equal(ui.elements.get('brief').hidden, true);
      assert.equal(ui.elements.get('mission-title').textContent, 'Mission 2');
      assert.equal(ui.state().runs.at(-1).missionId, 1);
      return;
    }
    previous = target;
    ui.elements.get('continue').click(); ui.choices[0].click(); ui.advance(5150);
  }
  assert.fail('Mission did not complete');
});
test('timeout opens failure/video/retry, resets input and retains damage', () => {
  const ui = mount(); ui.begin(); ui.advance(40100); ui.advance(3000);
  assert.equal(ui.elements.get('popup-title').textContent, 'Engine failure');
  assert.equal(ui.elements.get('popup-hero').hidden, false);
  assert.match(ui.elements.get('popup-hero').src, /astronaut-hero-lose-[123]\.webp$/);
  assert.equal(ui.elements.get('hangar').classList.contains('failure-resting'), true);
  ui.elements.get('popup-action').click();
  const recipeId = ui.state().runs[0].questions[0].recipeId;
  assert.equal(ui.elements.get('lesson').hidden, false);
  assert.equal(ui.elements.get('popup-hero').hidden, true);
  assert.equal(ui.elements.get('lesson').src, ui.context.RocketGame.recipes[recipeId].video);
  assert.equal(ui.elements.get('lesson').currentTime, 0);
  assert.equal(ui.elements.get('hangar').classList.contains('failure-resting'), true);
  assert.equal(ui.elements.get('popup-title').textContent, ui.context.RocketGame.recipes[recipeId].name);
  assert.equal(ui.elements.get('popup').classList.contains('video-popup'), true);
  assert.equal(ui.elements.get('popup-text').hidden, true);
  ui.elements.get('popup-action').click(); assert.equal(ui.elements.get('popup-title').textContent, 'Ready for another try?');
  assert.equal(ui.elements.get('popup').classList.contains('video-popup'), false);
  assert.equal(ui.elements.get('hangar').classList.contains('failure-resting'), true);
  ui.elements.get('popup-action').click();
  assert.equal(ui.elements.get('hangar').classList.contains('retry-preparing'), true);
  assert.equal(ui.elements.get('hangar').classList.contains('failure-resting'), false);
  assert.equal(ui.state().runs[0].questions[0].attempts.length, 1);
  ui.advance(1549); assert.equal(ui.state().runs[0].questions[0].attempts.length, 1);
  ui.advance(1);
  const run = ui.state().runs[0]; assert.equal(run.engines, 2); assert.equal(run.questions.length, 1);
  assert.equal(run.questions[0].attempts.length, 2); assert.equal(ui.elements.get('countdown').textContent, 'T-40');
  assert.equal(ui.elements.get('chamber-total').textContent, '0% filled');
});
test('holding fill repeats increments and releasing stops further input', () => {
  const ui = mount(); ui.begin();
  const button = ui.elements.get('fill-Water');
  button.events.pointerdown({ button: 0, pointerId: 1, preventDefault() {} });
  ui.advance(360);
  let attempt = ui.state().runs[0].questions[0].attempts[0];
  assert.equal(attempt.events.length, 2);
  button.events.pointerup(); ui.advance(1000);
  attempt = ui.state().runs[0].questions[0].attempts[0];
  assert.equal(attempt.events.length, 2);
});

test('failed pointer capture still fills and a global release stops the hold', () => {
  const ui = mount(); ui.begin();
  const button = ui.elements.get('fill-Water');
  button.setPointerCapture = () => { throw new Error('NotFoundError'); };
  button.events.pointerdown({ button: 0, pointerId: 1, preventDefault() {} });
  ui.advance(360);
  assert.equal(ui.state().runs[0].questions[0].attempts[0].events.length, 2);
  ui.windowEvents.pointerup.forEach(fn => fn());
  ui.advance(400);
  assert.equal(ui.state().runs[0].questions[0].attempts[0].events.length, 2);
});

test('legacy touch input holds and cancels without Pointer Events support', () => {
  const ui = mount(); ui.begin();
  const button = ui.elements.get('fill-Water');
  let prevented = false;
  button.events.touchstart({ preventDefault() { prevented = true; } });
  ui.advance(360); assert.equal(prevented, true);
  assert.equal(ui.state().runs[0].questions[0].attempts[0].events.length, 2);
  ui.windowEvents.touchcancel.forEach(fn => fn());
  ui.advance(400);
  assert.equal(ui.state().runs[0].questions[0].attempts[0].events.length, 2);
});

test('each lost engine plays one blowout, stays off on retry, and leaves surviving fires running', () => {
  const ui = mount(); ui.begin();
  const fires = ui.elements.get('flames').children;
  for (let remaining = 2; remaining >= 0; remaining--) {
    ui.advance(40000);
    assert.equal(ui.elements.get('hangar').classList.contains('failed-liftoff'), true);
    assert.equal(fires[remaining].classList.contains('blowing'), false);
    ui.advance(1150);
    assert.equal(fires[remaining].classList.contains('blowing'), true);
    assert.equal(fires[remaining].classList.contains('smoking'), true);
    assert.equal(fires[remaining].classList.contains('dead'), true);
    for (let i = 0; i < remaining; i++) {
      assert.equal(fires[i].classList.contains('dead'), false);
      assert.equal(fires[i].classList.contains('blowing'), false);
      assert.equal(fires[i].classList.contains('smoking'), false);
    }
    ui.advance(880);
    assert.equal(fires[remaining].classList.contains('blowing'), false);
    assert.equal(fires[remaining].classList.contains('smoking'), true);
    ui.advance(1070);
    assert.equal(fires[remaining].classList.contains('smoking'), false);
    assert.equal(ui.elements.get('hangar').classList.contains('failed-liftoff'), false);
    if (remaining) {
      ui.elements.get('popup-action').click();
      ui.elements.get('popup-action').click();
      ui.elements.get('popup-action').click();
      ui.advance(1550);
      assert.equal(fires[remaining].classList.contains('dead'), true);
    } else assert.equal(ui.elements.get('popup-title').textContent, 'Mission failed');
  }
});
test('screen transition exits before revealing the next page and unlocks after entrance', () => {
  const ui = mount();
  const frame = ui.elements.get('game'), intro = ui.elements.get('intro'), brief = ui.elements.get('brief');
  let cancelled = false;
  frame.dataset.screen = 'intro'; brief.hidden = true;
  intro.animate = (frames, options) => {
    assert.equal(options.duration, 220); assert.equal(frames[1].opacity, 0);
    return { cancel() { cancelled = true; } };
  };
  ui.elements.get('start').click();
  assert.equal(frame.inert, true); assert.equal(brief.hidden, true);
  ui.advance(220);
  assert.equal(intro.hidden, true); assert.equal(brief.hidden, false); assert.equal(cancelled, true);
  assert.equal(frame.inert, true);
  ui.advance(480); assert.equal(frame.inert, false);
});
test('rocket docks and the fuel station prepares before starting the full countdown', () => {
  const ui = mount(); ui.begin(false);
  const attempts = () => ui.state().runs[0].questions[0].attempts;
  assert.equal(attempts().length, 0);
  assert.equal(ui.elements.get('conveyor').hidden, false);
  assert.equal(ui.elements.get('pad-rocket').hidden, false);
  assert.equal(ui.elements.get('question-title').hidden, true);
  ui.advance(1900);
  assert.equal(attempts().length, 0);
  assert.equal(ui.elements.get('fuel-system').hidden, true);
  assert.equal(ui.elements.get('conveyor').hidden, true);
  assert.equal(ui.elements.get('pad-rocket').hidden, false);
  assert.equal(ui.elements.get('question-title').hidden, true);
  ui.advance(200);
  assert.equal(ui.elements.get('question-title').hidden, false);
  assert.equal(ui.elements.get('fuel-system').hidden, true);
  assert.equal(ui.elements.get('hangar').classList.contains('formula-reveal'), true);
  ui.advance(1499);
  assert.equal(ui.elements.get('fuel-system').hidden, true);
  assert.equal(attempts().length, 0);
  ui.elements.get('fill-Water').click();
  assert.equal(attempts().length, 0);
  ui.advance(1);
  assert.equal(ui.elements.get('hangar').classList.contains('formula-reveal'), false);
  assert.equal(ui.elements.get('hangar').classList.contains('filling'), true);
  ui.advance(650);
  assert.equal(ui.elements.get('fuel-system').hidden, false);
  ui.advance(899); assert.equal(attempts().length, 0);
  ui.advance(1); assert.equal(attempts().length, 1);
  assert.equal(ui.elements.get('countdown').textContent, 'T-40');
});
test('reduced-motion settings retain the continuous straight-line docking animation', () => {
  const ui = mount(), animations = [];
  ui.context.matchMedia = () => ({ matches: true });
  ui.choices[0].querySelector = () => ({ getBoundingClientRect: () => ({ left: 20, top: 550, width: 30, height: 50 }) });
  const rocket = ui.elements.get('pad-rocket');
  rocket.getBoundingClientRect = () => ({ left: 100, top: 300, width: 150, height: 250 });
  for (const element of [rocket, ui.elements.get('hangar-closeup')]) {
    element.animate = (frames, options) => {
      const record = { frames, options, cancelled: false }; animations.push(record);
      return { cancel() { record.cancelled = true; } };
    };
  }
  ui.begin(false);
  assert.equal(animations.length, 2);
  assert.equal(animations[0].frames.length, 2);
  assert.equal(animations[0].frames[0].transform, 'translate(-80px,250px) scale(0.2,0.2)');
  assert.equal(animations[0].options.easing, 'linear');
  assert.equal(animations[0].options.duration, 1900);
  const topImage = ui.elements.get('rocket-top').src;
  ui.advance(1899); assert.equal(animations[0].cancelled, false);
  assert.equal(ui.state().runs[0].questions[0].attempts.length, 0);
  ui.advance(3251);
  assert.equal(animations[0].cancelled, true);
  assert.equal(ui.elements.get('rocket-top').src, topImage);
  assert.equal(ui.elements.get('countdown').textContent, 'T-40');
});
test('fuel nozzle aligns with the opening of all five variants at different stage sizes', () => {
  const mouths = [[248.5/497,12/489],[234/466,12/480],[228.5/454,10/412],[225/483,11/471],[253.5/507,11/468]];
  for (const width of [320, 390, 560]) for (let variant = 1; variant <= 5; variant++) {
    const ui = mount(), height = width * 16 / 9;
    const stage = ui.elements.get('hangar'), fuel = ui.elements.get('fuel-system');
    stage.getBoundingClientRect = () => ({ left: 20, top: 30, width, height });
    const body = { left: 20 + width*.22, top: 30 + height*(.447 + .433*.32), width: width*.56, height: height*.433*.68 };
    ui.elements.get('rocket-bottom').getBoundingClientRect = () => body;
    ui.elements.get('tanks').offsetHeight = 150;
    const pipes = { style: {} }, chamber = { offsetTop: 300, offsetHeight: 100 };
    fuel.querySelector = selector => selector === '.chamber' ? chamber : pipes;
    ui.begin(true, variant);
    const [x,y] = mouths[variant-1];
    assert.equal(ui.elements.get('pad-rocket').dataset.variant, String(variant));
    assert.ok(Math.abs(parseFloat(fuel.style.left) + width*.42 - (body.left-20+body.width*x)) < .001);
    assert.ok(Math.abs(parseFloat(fuel.style.height) + parseFloat(fuel.style.top) - (body.top-30+body.height*y+height*.006)) < .001);
    const tankWidth = width*.84*.976/3;
    assert.ok(Math.abs(parseFloat(ui.elements.get('tanks').style.height)/tankWidth - 428/229) < .001);
    for (const c of ['Water','ACN','MeOH']) {
      const d = ui.elements.get(`pipe-flow-${c}`).attributes.d;
      const i = ['Water','ACN','MeOH'].indexOf(c), assemblyWidth = width*.84;
      const startX = i*(tankWidth+assemblyWidth*.012)+tankWidth*.5;
      const startY = tankWidth*428/229*.972;
      const coordinates = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
      assert.ok(Math.abs(coordinates[0]-startX)<.001);
      assert.ok(Math.abs(coordinates[1]-startY)<.001);
      const endY = tankWidth*428/229+assemblyWidth*.12+assemblyWidth*.76*798/1972*.14;
      assert.ok(Math.abs(coordinates.at(-1)-endY)<.001);
      assert.equal(d, ui.elements.get(`pipe-metal-${c}`).attributes.d);
      assert.equal(d, ui.elements.get(`pipe-core-${c}`).attributes.d);
    }
    assert.equal(ui.state().runs[0].questions[0].attempts.length, 1);
  }
});

test('full reservoirs drain in matching colours and undo reverses the same pipe', () => {
  const ui = mount(); ui.begin();
  const recipe = ui.context.RocketGame.recipes[ui.state().runs[0].questions[0].recipeId];
  for (const [c, color] of Object.entries({Water:'#00cfff', ACN:'#b627ed', MeOH:'#ffbf25'})) {
    const amount = ui.elements.get(`liquid-${c}`), chamber = ui.elements.get(`chamber-${c}`), pipe = ui.elements.get(`pipe-flow-${c}`);
    assert.equal(amount.style['--amount'], '100%');
    assert.equal(ui.elements.get(`amount-${c}`).textContent, '0%');
    assert.equal(chamber.style.backgroundColor, color);
    ui.elements.get(`fill-${c}`).click();
    const increment = ui.context.RocketGame.increment(recipe,c);
    assert.equal(amount.style['--amount'], `${100-increment}%`);
    assert.equal(chamber.style.height, `${increment}%`);
    ui.advance(288);
    assert.equal(ui.elements.get(`amount-${c}`).textContent, `${increment}%`);
    assert.equal(ui.elements.get(`amount-${c}`).dataset.delta, `+${increment}%`);
    assert.equal(ui.elements.get(`amount-${c}`).dataset.changing, 'fill');
    assert.equal(pipe.dataset.flow, 'forward');
    assert.equal(ui.elements.get(`pipe-core-${c}`).dataset.flow, 'forward');
    assert.equal(ui.elements.get(`pour-${c}`).dataset.flow, 'forward');
    assert.equal(ui.elements.get('chamber-liquid').style['--surface'], `${100-increment}%`);
    ui.elements.get('undo-mixture').click();
    assert.equal(pipe.dataset.flow, 'reverse');
    assert.equal(ui.elements.get(`amount-${c}`).dataset.delta, `\u2212${increment}%`);
    assert.equal(ui.elements.get(`amount-${c}`).dataset.changing, 'undo');
    assert.equal(ui.elements.get(`pour-${c}`).dataset.flow, 'reverse');
    assert.equal(amount.style['--amount'], '100%');
    assert.equal(chamber.style.height, '0%');
    assert.equal(ui.elements.get('launch').hidden, true);
    ui.advance(288);
    assert.equal(ui.elements.get(`amount-${c}`).textContent, '0%');
    ui.advance(650); assert.equal(pipe.dataset.flow, '');
    assert.equal(ui.elements.get(`pipe-core-${c}`).dataset.flow, '');
    assert.equal(ui.elements.get(`pour-${c}`).dataset.flow, '');
    assert.equal(ui.elements.get(`amount-${c}`).dataset.changing, '');
    assert.equal(ui.elements.get('launch').classList.contains('launch-ready'), false);
  }
});

test('flight rewards sequence damage, bonus and exit without changing cinematic duration', () => {
  for (const losses of [0,1,2]) {
    const ui = mount(); ui.begin();
    for (let i=0;i<losses;i++) {
      ui.advance(40000); ui.advance(3100);
      ui.elements.get('popup-action').click();
      ui.elements.get('popup-action').click();
      ui.elements.get('popup-action').click();
      ui.advance(1550);
    }
    const q=ui.state().runs[0].questions.at(-1), recipe=ui.context.RocketGame.recipes[q.recipeId];
    for(const c of ['Water','ACN','MeOH']) for(let n=0;n<recipe.mix[c];n+=ui.context.RocketGame.increment(recipe,c)) ui.elements.get('fill-'+c).click();
    ui.advance(650);ui.elements.get('launch').click();ui.advance(5300);
    const scene=ui.elements.get('cinematic'),factor=[1,.67,.34][losses];
    assert.equal(scene.style['--near-star-duration'],String(1.7/factor)+'s');
    assert.equal(ui.elements.get('flight-penalty').hidden,true);
    ui.advance(1200);
    assert.equal(ui.elements.get('flight-penalty').hidden,losses===0);
    if(losses) assert.equal(ui.elements.get('flight-speed').textContent,'SPEED \u2212'+(losses===1?33:66)+'%');
    ui.advance(1600);
    assert.equal(ui.elements.get('flight-bonus').hidden,false);
    const saved=ui.state().runs[0].questions.at(-1).attempts.at(-1).timeSaved.toFixed(1);
    assert.equal(ui.elements.get('flight-distance').textContent,'BONUS DISTANCE +'+saved+'%');
    ui.advance(600);
    assert.equal(scene.classList.contains('rewards-exit'),true);
    assert.equal(scene.classList.contains('bonus-boost'),true);
    ui.advance(3100);
    assert.equal(ui.elements.get('journey').hidden,false);
  }
});

test('sound effects follow liquid transfers, actual blowout, failure popup and correct launch', () => {
  const ui = mount(); ui.begin();
  const sound = name => ui.sounds.find(s => decodeURIComponent(s.src).endsWith(name+'.mp3'));
  const liquid = sound('Liquid Flowing'), blast = sound('Engine Blast 1'), wrong = sound('Wrong Question'), correct = sound('Correct Question');
  ui.elements.get('fill-Water').click();
  assert.equal(liquid.loop,true); assert.equal(liquid.plays,1);
  ui.elements.get('fill-Water').click(); assert.equal(liquid.plays,1);
  ui.advance(650); assert.equal(liquid.paused,true);
  ui.elements.get('undo-mixture').click(); assert.equal(liquid.plays,2);
  ui.advance(40000);
  assert.equal(liquid.paused,true); assert.equal(blast.plays,0); assert.equal(wrong.plays,0);
  ui.advance(1150); assert.equal(blast.plays,1); assert.equal(wrong.plays,0);
  ui.advance(1950); assert.equal(wrong.plays,1);
  ui.elements.get('popup-action').click();ui.elements.get('popup-action').click();ui.elements.get('popup-action').click();ui.advance(1550);
  const q=ui.state().runs[0].questions[0], recipe=ui.context.RocketGame.recipes[q.recipeId];
  for(const c of ['Water','ACN','MeOH']) for(let n=0;n<recipe.mix[c];n+=ui.context.RocketGame.increment(recipe,c)) ui.elements.get('fill-'+c).click();
  ui.advance(650);ui.elements.get('launch').click();
  assert.equal(correct.plays,1);assert.equal(wrong.plays,1);
  for(const fn of ui.windowEvents.blur)fn();
  assert.ok(ui.sounds.every(s=>s.paused));
});
test('button sound responds once per pointer press or keyboard click', async () => {
  const ui=mount(), target={closest:selector=>selector==='button,a'?{}:null};
  ui.documentEvents.pointerdown.forEach(fn=>fn({button:0,target}));
  await Promise.resolve();await Promise.resolve();
  const click=ui.sounds.find(s=>decodeURIComponent(s.src).endsWith('Button Click 2.mp3'));
  assert.equal(click.plays,1);
  ui.documentEvents.click.forEach(fn=>fn({detail:1,target}));assert.equal(click.plays,1);
  ui.documentEvents.click.forEach(fn=>fn({detail:0,target}));assert.equal(click.plays,2);
  for (const control of ['fill', 'undo', 'rocket']) {
    const excluded = { closest: selector => selector === '[data-fill], [data-undo], .rocket-choice, .tank' ? { control } : selector === 'button,a' ? {} : null };
    ui.documentEvents.pointerdown.forEach(fn => fn({ button: 0, target: excluded }));
    ui.documentEvents.click.forEach(fn => fn({ detail: 0, target: excluded }));
  }
  assert.equal(click.plays, 2);
});

test('generated cues follow question, nose preparation, route travel and counting', () => {
  const ui = mount(); ui.begin(false);
  const sound = file => ui.sounds.find(s => s.src.endsWith(file));
  const question = sound('formula-reveal.wav'), open = sound('nose-open.wav'), close = sound('nose-close.wav');
  const zoom = sound('rocket-zoom.wav');
  assert.equal(zoom.plays, 1); assert.equal(zoom.paused, false);
  ui.advance(2099); assert.equal(question.plays, 0);
  assert.equal(zoom.paused, true);
  ui.advance(1); assert.equal(question.plays, 1); assert.equal(open.plays, 0);
  ui.advance(1499); assert.equal(open.plays, 0);
  ui.advance(1); assert.equal(open.plays, 1);
  ui.advance(1550);
  const recipe = ui.context.RocketGame.recipes[ui.state().runs[0].questions[0].recipeId];
  for (const c of ['Water', 'ACN', 'MeOH']) for (let n=0; n<recipe.mix[c]; n+=ui.context.RocketGame.increment(recipe,c)) ui.elements.get('fill-'+c).click();
  ui.advance(650); ui.elements.get('launch').click(); assert.equal(close.plays, 1);
  ui.advance(11800);
  const route = sound('route-glide.wav'), numbers = sound('number-count.wav');
  assert.equal(route.plays, 0);
  ui.advance(700); assert.equal(route.plays, 1);
  ui.advance(2600); assert.equal(route.paused, true);
  assert.equal(numbers.paused, false);
  ui.advance(1500); assert.equal(numbers.paused, true);
});

test('new rockets reset engine penalties and show a new badge if damaged', () => {
  const ui=mount();ui.begin();
  assert.equal(ui.elements.get('hangar').classList.contains('selection-spotlight'),true);
  function loseEngine() {
    ui.advance(40000);ui.advance(3100);
    for(let i=0;i<3;i++)ui.elements.get('popup-action').click();
    ui.advance(1550);
  }
  function flight(expectBadge, factor) {
    const q=ui.state().runs[0].questions.at(-1), recipe=ui.context.RocketGame.recipes[q.recipeId];
    for(const c of ['Water','ACN','MeOH'])for(let n=0;n<recipe.mix[c];n+=ui.context.RocketGame.increment(recipe,c))ui.elements.get('fill-'+c).click();
    ui.advance(650);ui.elements.get('launch').click();ui.advance(5300);ui.advance(1200);
    assert.equal(ui.elements.get('flight-penalty').hidden,!expectBadge);
    assert.equal(ui.elements.get('cinematic').style['--near-star-duration'],String(1.7/factor)+'s');
    const attempt=ui.state().runs[0].questions.at(-1).attempts.at(-1);
    assert.equal(attempt.speed,7000000*factor);
    ui.advance(5300);ui.advance(4800);ui.elements.get('continue').click();assert.equal(ui.elements.get('hangar').classList.contains('selection-spotlight'),false);ui.choices[0].click();ui.advance(5150);
  }
  loseEngine();flight(true,.67);flight(false,1);loseEngine();flight(true,.67);
});

test('third timeout uses the mission-failed astronaut', () => {
  const ui = mount(); ui.begin();
  for (let i=0;i<3;i++) {
    ui.advance(40100); ui.advance(3000);
    if (i<2) { ui.elements.get('popup-action').click(); ui.elements.get('popup-action').click(); ui.elements.get('popup-action').click(); ui.advance(1550); }
  }
  assert.equal(ui.elements.get('popup-title').textContent, 'Mission failed');
  assert.equal(ui.elements.get('popup-hero').hidden, false);
  assert.match(ui.elements.get('popup-hero').src, /astronaut-hero-lose-[123]\.webp$/);
});

test('wrong-answer engine failure also shows the sad astronaut', () => {
  const ui = mount(); ui.begin();
  for(let i=0;i<30;i++) ui.elements.get('fill-Water').click();
  ui.advance(650); ui.elements.get('launch').click(); ui.advance(3100);
  assert.equal(ui.elements.get('popup-title').textContent, 'Engine failure');
  assert.equal(ui.elements.get('popup-hero').hidden, false);
  assert.match(ui.elements.get('popup-hero').src, /astronaut-hero-lose-[123]\.webp$/);
});

test('tank surface fills on hold, stops on release and ignores bubbled Fill presses', () => {
 const ui=mount();ui.begin();const tank=ui.elements.get('tank-Water');
 const recipe=ui.context.RocketGame.recipes[ui.state().runs[0].questions[0].recipeId];
 const step=ui.context.RocketGame.increment(recipe,'Water');
 tank.events.pointerdown({button:0,pointerId:1,preventDefault(){}});
 assert.equal(ui.elements.get('chamber-total').textContent,`${step}% filled`);
 ui.advance(350);assert.equal(ui.elements.get('chamber-total').textContent,`${step*2}% filled`);
 tank.events.pointerup({});ui.advance(350);
 assert.equal(ui.elements.get('chamber-total').textContent,`${step*2}% filled`);
 tank.events.pointerdown({button:0,target:{closest:()=>({})},preventDefault(){}});
 assert.equal(ui.elements.get('chamber-total').textContent,`${step*2}% filled`);
});

test('demo opens full screen and can close or start a mission without starting early', () => {
 const ui=mount();ui.elements.get('start').click();ui.advance(800);
 ui.elements.get('open-demo').click();
 assert.equal(ui.elements.get('demo-popup').open,true);
 assert.equal(ui.context.localStorage.getItem('aurobindo.rocketier.v1'),null);
 assert.equal(ui.elements.get('demo-placeholder').hidden,false);
 ui.elements.get('close-demo').click();assert.equal(ui.elements.get('demo-popup').open,false);
 ui.elements.get('open-demo').click();
 ui.elements.get('demo-next').click();ui.elements.get('demo-next').click();
 assert.equal(ui.elements.has('demo-start-mission'),false);
 assert.equal(ui.context.localStorage.getItem('aurobindo.rocketier.v1'),null);
 ui.elements.get('close-demo').click();ui.elements.get('start-mission').click();
 assert.equal(ui.elements.get('demo-popup').open,false);assert.equal(ui.state().runs.length,1);
 ui.advance(800);assert.equal(ui.elements.get('mission').hidden,false);
});

test('demo navigates three slides, respects boundaries and resets on reopen', () => {
 const ui=mount();ui.elements.get('start').click();ui.advance(800);
 ui.elements.get('open-demo').click();
 assert.equal(ui.elements.get('demo-slide-status').textContent,'1 / 3');
 assert.equal(ui.elements.get('demo-previous').disabled,true);
 ui.elements.get('demo-next').click();assert.equal(ui.elements.get('demo-slide-status').textContent,'2 / 3');
 ui.elements.get('demo-next').click();assert.equal(ui.elements.get('demo-slide-status').textContent,'3 / 3');
 assert.equal(ui.elements.get('demo-next').disabled,false);
 assert.equal(ui.elements.get('demo-next').textContent,'Finish');
 ui.elements.get('demo-previous').click();assert.equal(ui.elements.get('demo-slide-status').textContent,'2 / 3');
 assert.equal(ui.elements.get('demo-next').textContent,'Next \u2192');
 ui.elements.get('demo-next').click();ui.elements.get('demo-next').click();
 assert.equal(ui.elements.get('demo-popup').open,false);
 assert.equal(ui.elements.get('brief').hidden,false);
 assert.equal(ui.context.localStorage.getItem('aurobindo.rocketier.v1'),null);
 ui.elements.get('open-demo').click();
 assert.equal(ui.elements.get('demo-slide-status').textContent,'1 / 3');
});

test('conveyor restarts both layers on selection and recovers only while selecting', () => {
  const ui = mount();
  ui.elements.get('start').click(); ui.elements.get('start-mission').click(); ui.elements.get('play').click();
  const track = ui.elements.get('rocket-track'), belt = ui.elements.get('conveyor').querySelector('.belt');
  assert.ok(track.style.writes > 0);
  assert.equal(track.style.writes, belt.style.writes);
  const first = track.style.writes;
  ui.windowEvents.pageshow.forEach(fn => fn()); ui.advance(200);
  assert.equal(track.style.writes, first + 1);
  assert.equal(belt.style.writes, track.style.writes);
  ui.windowEvents.focus.forEach(fn => fn());
  ui.choices[0].click(); ui.advance(200);
  assert.equal(track.style.writes, first + 1, 'pending recovery must not restart during boarding');
  ui.windowEvents.pageshow.forEach(fn => fn()); ui.advance(200);
  assert.equal(track.style.writes, first + 1);
});

test('conveyor return check leaves advancing layers alone', () => {
  const ui = mount();
  ui.elements.get('start').click(); ui.elements.get('start-mission').click(); ui.elements.get('play').click();
  const track = ui.elements.get('rocket-track'), belt = ui.elements.get('conveyor').querySelector('.belt');
  const first = track.style.writes;
  ui.windowEvents.focus.forEach(fn => fn()); ui.advance(20);
  track.transform = belt.transform = 'matrix(1,0,0,1,12,0)';
  ui.advance(200);
  assert.equal(track.style.writes, first);
  assert.equal(belt.style.writes, first);
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function mount() {
  let time = 0, serial = 0, stored;
  const tasks = new Map(), elements = new Map();
  const chemicalNames = ['Water', 'ACN', 'MeOH'];
  class Element {
    constructor() {
      this.events = {}; this.dataset = {}; this.children = []; this.hidden = false; this.disabled = false;
      this.style = { setProperty(k, v) { this[k] = v; } }; this.parentElement = { classList: { toggle() {}, remove() {} } };
      this.attributes = {}; const classes = new Set();
      this.classList = { add: (...items) => items.forEach(i => classes.add(i)), remove: (...items) => items.forEach(i => classes.delete(i)), toggle: (i, on) => on ? classes.add(i) : classes.delete(i), contains: i => classes.has(i) };
    }
    addEventListener(name, fn) { this.events[name] = fn; }
    click() { if (!this.disabled) this.events.click?.({ detail: 0 }); }
    setAttribute(k, v) { this.attributes[k] = v; } focus() {} pause() {} close() { this.open = false; }
    showModal() { this.open = true; } play() { return Promise.resolve(); }
    querySelectorAll(selector) {
      if (selector === 'button') return [1,2,3,4,5].map(n => { const b = new Element(); b.dataset.rocket = n; return b; });
      return chemicalNames.map(c => elements.get(`${selector === '[data-fill]' ? 'fill' : 'undo'}-${c}`));
    }
  }
  const html = fs.readFileSync(path.join(__dirname, '../rocket-game.html'), 'utf8');
  for (const [, id] of html.matchAll(/id="([^"]+)"/g)) elements.set(id, new Element());
  for (const c of chemicalNames) for (const kind of ['fill','undo','amount','liquid','dispensed','pipe-outline','pipe-metal','pipe-core','pipe-flow']) {
    const e = new Element(); e.dataset[kind] = c; elements.set(`${kind}-${c}`, e);
  }
  const choices = [1,2,3,4,5].map(n => { const e = new Element(); e.dataset.rocket = n; return e; });
  elements.get('rocket-track').querySelectorAll = () => choices;
  elements.get('flames').children = [new Element(), new Element(), new Element()];
  const context = vm.createContext({
    console, performance: { now: () => time }, Date, Math, JSON, Blob,
    localStorage: { getItem: () => stored || null, setItem: (_, value) => { stored = value; } },
    navigator: {}, location: {}, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    document: {
      getElementById: id => { assert.ok(elements.has(id), `Missing element ${id}`); return elements.get(id); },
      querySelector: selector => { const [, kind, c] = selector.match(/data-(fill|undo)="(\w+)"/); return elements.get(`${kind}-${c}`); },
      addEventListener() {}, createElement: () => new Element()
    },
    setTimeout: (fn, delay) => { const id = ++serial; tasks.set(id, { fn, at: time + delay }); return id; },
    clearTimeout: id => tasks.delete(id),
    setInterval: (fn, delay) => { const id = ++serial; tasks.set(id, { fn, at: time + delay, delay }); return id; },
    clearInterval: id => tasks.delete(id)
  });
  context.window = context; context.scrollTo = () => {}; context.addEventListener = () => {};
  for (const file of ['rocket-game-core.js', 'rocket-game.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
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
    if (ready) advance(3650);
  }
  return { elements, choices, advance, begin, context, state: () => JSON.parse(stored) };
}
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
  ui.advance(200);
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
    ui.advance(650); ui.elements.get('launch').click(); ui.advance(11000);
    const rocket = ui.elements.get('journey-rocket');
    assert.ok(Math.abs(Number(rocket.dataset.from)-previous)<1e-10);
    const target = Number(rocket.dataset.to);
    assert.ok(target > previous && target <= 1);
    ui.advance(3300);
    assert.equal(ui.elements.get('route-covered').style.strokeDashoffset, String(1-target));
    if (ui.state().runs[0].status === 'completed') {
      assert.equal(target,1); assert.equal(rocket.style.left,'81%');
      return;
    }
    previous = target;
    ui.elements.get('continue').click(); ui.choices[0].click(); ui.advance(3650);
  }
  assert.fail('Mission did not complete');
});
test('timeout opens failure/video/retry, resets input and retains damage', () => {
  const ui = mount(); ui.begin(); ui.advance(40100); ui.advance(3000);
  assert.equal(ui.elements.get('popup-title').textContent, 'Engine failure');
  ui.elements.get('popup-action').click(); assert.equal(ui.elements.get('popup-title').textContent, 'Video coming soon');
  ui.elements.get('popup-action').click(); assert.equal(ui.elements.get('popup-title').textContent, 'Ready for another try?');
  ui.elements.get('popup-action').click();
  const run = ui.state().runs[0]; assert.equal(run.engines, 2); assert.equal(run.questions.length, 1);
  assert.equal(run.questions[0].attempts.length, 2); assert.equal(ui.elements.get('countdown').textContent, '40s');
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

test('each lost engine plays one blowout, stays off on retry, and leaves surviving fires running', () => {
  const ui = mount(); ui.begin();
  const fires = ui.elements.get('flames').children;
  for (let remaining = 2; remaining >= 0; remaining--) {
    ui.advance(40000);
    assert.equal(ui.elements.get('hangar').classList.contains('failed-liftoff'), true);
    assert.equal(fires[remaining].classList.contains('blowing'), false);
    ui.advance(1150);
    assert.equal(fires[remaining].classList.contains('blowing'), true);
    assert.equal(fires[remaining].classList.contains('dead'), true);
    for (let i = 0; i < remaining; i++) {
      assert.equal(fires[i].classList.contains('dead'), false);
      assert.equal(fires[i].classList.contains('blowing'), false);
    }
    ui.advance(880);
    assert.equal(fires[remaining].classList.contains('blowing'), false);
    ui.advance(1070);
    assert.equal(ui.elements.get('hangar').classList.contains('failed-liftoff'), false);
    if (remaining) {
      ui.elements.get('popup-action').click();
      ui.elements.get('popup-action').click();
      ui.elements.get('popup-action').click();
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
  ui.advance(650);
  assert.equal(ui.elements.get('fuel-system').hidden, false);
  assert.equal(attempts().length, 0);
  ui.advance(899); assert.equal(attempts().length, 0);
  ui.advance(1); assert.equal(attempts().length, 1);
  assert.equal(ui.elements.get('countdown').textContent, '40s');
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
  ui.advance(1751);
  assert.equal(animations[0].cancelled, true);
  assert.equal(ui.elements.get('rocket-top').src, topImage);
  assert.equal(ui.elements.get('countdown').textContent, '40s');
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
    assert.ok(Math.abs(parseFloat(ui.elements.get('tanks').style.height)/tankWidth - 1591/989) < .001);
    for (const c of ['Water','ACN','MeOH']) {
      const d = ui.elements.get(`pipe-flow-${c}`).attributes.d;
      const i = ['Water','ACN','MeOH'].indexOf(c), assemblyWidth = width*.84;
      const startX = i*(tankWidth+assemblyWidth*.012)+tankWidth*.5;
      const startY = tankWidth*1591/989*.972;
      const coordinates = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
      assert.ok(Math.abs(coordinates[0]-startX)<.001);
      assert.ok(Math.abs(coordinates[1]-startY)<.001);
      const endY = tankWidth*1591/989+assemblyWidth*.18+assemblyWidth*.88*798/1972*.14;
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
    assert.equal(ui.elements.get(`amount-${c}`).textContent, `${increment}%`);
    assert.equal(pipe.dataset.flow, 'forward');
    assert.equal(ui.elements.get(`pipe-core-${c}`).dataset.flow, 'forward');
    ui.elements.get(`undo-${c}`).click();
    assert.equal(pipe.dataset.flow, 'reverse');
    assert.equal(amount.style['--amount'], '100%');
    assert.equal(chamber.style.height, '0%');
    assert.equal(ui.elements.get('launch').hidden, true);
    assert.equal(ui.elements.get(`amount-${c}`).textContent, '0%');
    ui.advance(650); assert.equal(pipe.dataset.flow, '');
    assert.equal(ui.elements.get(`pipe-core-${c}`).dataset.flow, '');
    assert.equal(ui.elements.get('launch').classList.contains('launch-ready'), false);
  }
});

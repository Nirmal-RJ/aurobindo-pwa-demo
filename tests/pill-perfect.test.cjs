const { test } = require('node:test');
const assert = require('node:assert/strict');
const { PillRound } = require('../pill-perfect.js');

test('all five pairs join in either direction and freeze the completion time', () => {
  const round = new PillRound(500);
  for (let i = 0; i < 5; i++) assert.equal(round.attempt(i * 2 + 1, i * 2, 1500 + i * 1000), 'matched');
  assert.equal(round.matched.size, 5);
  assert.equal(round.elapsed, 5000);
  assert.equal(round.ended, true);
  round.tick(90000);
  assert.equal(round.elapsed, 5000);
  assert.equal(round.mistakes, 0);
});

test('incorrect and same-side pairs count attempts without a time penalty or revealing matches', () => {
  const round = new PillRound(1000);
  assert.equal(round.attempt(0, 3, 2000), 'wrong');
  assert.equal(round.attempt(2, 4, 3000), 'wrong');
  assert.equal(round.mistakes, 2);
  assert.equal(round.matched.size, 0);
  assert.equal(round.tick(4000), 42000);
  assert.equal(round.attempt(0, 1, 5000), 'matched');
});

test('same half, duplicate pairs, and stale events cannot add matches or mistakes', () => {
  const round = new PillRound();
  assert.equal(round.attempt(0, 0, 50), 'ignored');
  assert.equal(round.attempt(0, 1, 100), 'matched');
  assert.equal(round.attempt(1, 0, 200), 'ignored');
  assert.equal(round.attempt(0, 3, 300), 'ignored');
  assert.equal(round.attempt(-1, 3, 400), 'ignored');
  assert.equal(round.attempt(10, 11, 500), 'ignored');
  assert.equal(round.matched.size, 1);
  assert.equal(round.mistakes, 0);
});

test('deadline is authoritative even when a drop arrives before the next timer callback', () => {
  const round = new PillRound(200);
  assert.equal(round.attempt(0, 1, 45199), 'matched');
  assert.equal(round.attempt(2, 3, 45200), 'ended');
  assert.equal(round.elapsed, 45000);
  assert.equal(round.matched.size, 1);
  assert.equal(round.mistakes, 0);
});

test('background time expires the round rather than pausing the countdown', () => {
  const round = new PillRound(1000);
  round.tick(1200);
  assert.equal(round.tick(90000), 0);
  assert.equal(round.ended, true);
  assert.equal(round.elapsed, 45000);
  assert.equal(round.attempt(0, 1, 90001), 'ended');
});

// A small DOM/event harness exercises the actual browser entry point without dependencies.
function gameUI(language = 'en', { motion = false } = {}) {
  const vm = require('node:vm');
  const fs = require('node:fs');
  const animations = [];
  class Element {
    constructor(tag = 'div', attrs = {}) {
      this.tag = tag; this.attrs = attrs; this.dataset = {}; this.children = []; this.events = {}; this.style = {}; this._text = '';
      for (const [key, value] of Object.entries(attrs)) if (key.startsWith('data-')) this.dataset[key.slice(5)] = value;
      this.className = attrs.class || ''; this.disabled = 'disabled' in attrs;
      if (motion) this.animate = (frames, options) => {
        const animation = { node: this, frames, options, cancelled: false, cancel() { this.cancelled = true; } };
        animations.push(animation); return animation;
      };
      this.classList = {
        contains: name => this.className.split(' ').includes(name),
        add: name => { if (!this.classList.contains(name)) this.className += ` ${name}`; },
        remove: name => { this.className = this.className.split(' ').filter(n => n !== name).join(' '); },
        toggle: (name, on) => { if (on ?? !this.classList.contains(name)) this.classList.add(name); else this.classList.remove(name); }
      };
    }
    set innerHTML(value) {
      this._html = value; this.children = []; this._text = '';
      const stack = [this];
      for (const token of value.match(/<[^>]+>|[^<]+/g) || []) {
        if (token.startsWith('</')) { if (stack.length > 1) stack.pop(); }
        else if (token.startsWith('<')) {
          const tag = token.match(/^<([\w-]+)/)?.[1]; if (!tag) continue;
          const attrs = {};
          for (const match of token.slice(tag.length + 1, -1).matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[match[1]] = match[2] ?? '';
          const node = new Element(tag, attrs); stack.at(-1).append(node);
          if (!['br', 'img', 'input'].includes(tag) && !token.endsWith('/>')) stack.push(node);
        } else stack.at(-1)._text += token;
      }
    }
    get innerHTML() { return this._html || ''; }
    set textContent(value) { this._text = String(value); this.children = []; }
    get textContent() { return this._text + this.children.map(node => node.textContent).join(''); }
    matches(selector) {
      const negatives = [...selector.matchAll(/:not\(([^)]+)\)/g)].map(m => m[1]);
      if (negatives.some(part => this.matches(part))) return false;
      selector = selector.replace(/:not\([^)]+\)/g, '');
      if (selector === ':disabled') return this.disabled;
      if (selector.startsWith('.')) return selector.slice(1).split('.').every(name => this.classList.contains(name));
      if (selector.startsWith('[')) {
        const [, attr, value] = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
        return attr in this.attrs && (value === undefined || this.attrs[attr] === value);
      }
      return this.tag === selector;
    }
    querySelectorAll(selector) {
      if (selector.includes(' ')) { const [parent, ...rest] = selector.split(' '); return this.querySelectorAll(parent).flatMap(node => node.querySelectorAll(rest.join(' '))); }
      return this.children.flatMap(node => [...(node.matches(selector) ? [node] : []), ...node.querySelectorAll(selector)]);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    closest(selector) { return this.matches(selector) ? this : this.parent?.closest(selector); }
    setAttribute(key, value) { this.attrs[key] = value; }
    removeAttribute(key) { delete this.attrs[key]; }
    addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
    emit(name, event = {}) { for (const fn of this.events[name] || []) fn({ target: this, preventDefault() {}, ...event }); }
    append(node) { node.parent = this; this.children.push(node); }
    replaceChildren() { this.children = []; }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(n => n !== this); }
    focus() { document.activeElement = this; }
    cloneNode() { const node = new Element(this.tag, { ...this.attrs }); node._text = this._text; return node; }
    setPointerCapture() {} hasPointerCapture() { return false; }
    getBoundingClientRect() {
      const left = this.style.left !== undefined ? parseFloat(this.style.left) : Number(this.dataset.half || 0) * 120;
      const top = this.style.top !== undefined ? parseFloat(this.style.top) : 100;
      return { left, top, right: left + 100, bottom: top + 80, width: 100, height: 80 };
    }
  }
  const document = new Element('document'), window = new Element('window');
  document.documentElement = {}; document.body = new Element('body'); document.append(document.body);
  for (const id of ['app', 'effects', 'language', 'sound', 'edition', 'back', 'footer', 'sound-label', 'announcer']) document.body.append(new Element('div', { id }));
  document.getElementById = id => document.querySelectorAll('[id]').find(node => node.attrs.id === id);
  document.createElement = tag => new Element(tag);
  window.matchMedia = () => ({ matches: !motion }); window.scrollTo = () => {}; window.scrollBy = () => {}; window.innerHeight = 800; window.innerWidth = 390;
  let now = 0, serial = 0;
  const timeouts = new Map(), intervals = new Map(), storage = new Map([['aurobindo-language', language]]);
  vm.runInNewContext(fs.readFileSync(require.resolve('../pill-perfect.js'), 'utf8'), {
    document, window, performance: { now: () => now },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    setTimeout: (fn, ms) => { timeouts.set(++serial, { fn, at: now + ms }); return serial; }, clearTimeout: id => timeouts.delete(id),
    setInterval: fn => { intervals.set(++serial, fn); return serial; }, clearInterval: id => intervals.delete(id),
    requestAnimationFrame: () => ++serial, cancelAnimationFrame() {}
  });
  const get = id => document.getElementById(id), app = get('app');
  function click(selector) { const node = app.querySelector(selector); assert.ok(node, `Missing ${selector}`); if (!node.disabled) app.emit('click', { target: node, detail: 0 }); }
  function advance(ms) {
    const goal = now + ms;
    let next;
    while ((next = [...timeouts].filter(([, task]) => task.at <= goal).sort((a, b) => a[1].at - b[1].at)[0])) {
      now = next[1].at; timeouts.delete(next[0]); next[1].fn();
      for (const fn of [...intervals.values()]) fn();
    }
    now = goal;
    for (const fn of [...intervals.values()]) fn();
    for (const [id, task] of [...timeouts]) if (task.at <= now) { timeouts.delete(id); task.fn(); }
  }
  const action = name => click(`[data-action="${name}"]`);
  const half = id => click(`[data-half="${id}"]`);
  const join = i => { half(i * 2); half(i * 2 + 1); };
  function training() { action('demo'); action('continue'); advance(7500); action('practice'); for (let i = 0; i < 5; i++) { join(i); advance(3300); action('next'); } }
  return { get, app, document, window, click, advance, action, half, join, training, storage, animations,
    drag(a, b, cancel = false, edgeGap = null) {
      const node = app.querySelector(`[data-half="${a}"]`), target = app.querySelector(`[data-half="${b}"]`);
      const from = node.getBoundingClientRect(), to = target.getBoundingClientRect();
      app.emit('pointerdown', { target: node, button: 0, pointerId: 1, clientX: from.left + 50, clientY: 140 });
      document.emit('pointermove', { pointerId: 1, clientX: to.left + 50, clientY: 140 });
      const releaseX = edgeGap === null ? to.left + 50 : a % 2 === 0 ? to.left - 50 - edgeGap : to.right + 50 + edgeGap;
      document.emit('pointermove', { pointerId: 1, clientX: releaseX, clientY: 140 });
      const highlighted = target.classList.contains('hover-target');
      document.emit(cancel ? 'pointercancel' : 'pointerup', { pointerId: 1, clientX: releaseX, clientY: 140 });
      return highlighted;
    }
  };
}

test('mandatory demo and all five practice pills precede the timed challenge; replay repeats learning', () => {
  const ui = gameUI();
  assert.equal(ui.app.querySelector('[data-action="start"]'), null);
  ui.action('demo');
  assert.ok(ui.app.querySelector('[data-action="continue"]'));
  ui.action('continue');
  assert.equal(ui.app.querySelector('[data-action="practice"]').disabled, true);
  ui.advance(7500);
  assert.match(ui.get('equation').textContent, /%RSD = Precision/);
  ui.action('practice');
  for (let i = 0; i < 5; i++) {
    assert.equal(ui.app.querySelector('[data-action="next"]'), null);
    ui.join(i); ui.advance(3300);
    assert.match(ui.get('lesson-feedback').textContent, /Matched!/);
    ui.action('next');
  }
  ui.action('start');
  assert.equal(ui.app.querySelectorAll('[data-half]').length, 10);
  ui.advance(5000);
  ui.half(0); ui.half(3);
  assert.equal(ui.get('mistakes').textContent, '1');
  for (let i = 0; i < 5; i++) ui.join(i);
  ui.advance(1400);
  assert.match(ui.app.textContent, /Five pills. Perfectly connected!/);
  assert.match(ui.app.textContent, /5.0 s/);
  assert.match(ui.app.textContent, /Retention Time = Peak Identification/);
  ui.action('again');
  assert.ok(ui.app.querySelector('[data-action="demo"]'));
  assert.equal(ui.app.querySelector('[data-action="start"]'), null);
});

test('pointer drag joins pills in either direction; cancellation does not score and mismatches count', () => {
  const ui = gameUI(); ui.training(); ui.action('start');
  ui.drag(0, 1, true);
  assert.equal(ui.get('progress').textContent, '0 / 5 joined');
  ui.drag(1, 0);
  assert.equal(ui.get('progress').textContent, '1 / 5 joined');
  ui.drag(2, 5);
  assert.equal(ui.get('mistakes').textContent, '1');
  ui.drag(2, 3);
  assert.equal(ui.get('progress').textContent, '2 / 5 joined');
});

test('magnet highlights and joins at capsule edges in either direction while the pointer stays outside', () => {
  for (const [a, b] of [[0, 1], [1, 0]]) {
    for (const gap of [0, 18]) {
      const ui = gameUI(); ui.action('demo'); ui.action('continue'); ui.advance(7500); ui.action('practice');
      assert.equal(ui.drag(a, b, false, gap), true); ui.advance(3300);
      assert.ok(ui.app.querySelector('[data-action="next"]'));
    }
  }
});

test('magnet does not join distant or cancelled drops and still rejects an incorrect edge match', () => {
  const ui = gameUI(); ui.action('demo'); ui.action('continue'); ui.advance(7500); ui.action('practice');
  assert.equal(ui.drag(0, 1, false, 30), false);
  assert.equal(ui.app.querySelector('[data-action="next"]'), null);
  ui.drag(0, 1, true, 0);
  assert.equal(ui.app.querySelector('[data-action="next"]'), null);
  const challenge = gameUI(); challenge.training(); challenge.action('start');
  challenge.drag(0, 3, false, 0);
  assert.equal(challenge.get('mistakes').textContent, '1');
  assert.equal(challenge.get('progress').textContent, '0 / 5 joined');
});

test('Hindi and Telugu flow stays translated and switching language preserves round progress and deadline', () => {
  for (const language of ['hi', 'te']) {
    const ui = gameUI(language); ui.training(); ui.action('start'); ui.join(0); ui.advance(10000);
    assert.equal(ui.document.documentElement.lang, language);
    assert.doesNotMatch(ui.app.textContent, /undefined|Incorrect attempts|seconds left/);
    ui.get('language').value = 'en'; ui.get('language').emit('change');
    assert.equal(ui.get('seconds').textContent, '35');
    assert.equal(ui.get('progress').textContent, '1 / 5 joined');
    assert.equal(ui.storage.get('aurobindo-language'), 'en');
    ui.advance(35000);
    assert.match(ui.app.textContent, /Time’s up/);
    assert.match(ui.app.textContent, /45.0 s/);
    assert.equal(ui.app.querySelectorAll('.answer').length, 5);
  }
});

test('animated matches use two physical halves, emit reinforcement, and clean up after collection', () => {
  const ui = gameUI('en', { motion: true }); ui.training(); ui.action('start');
  ui.drag(0, 1);
  const flights = ui.animations.filter(a => a.node.classList.contains('flying-half') && !a.cancelled);
  assert.equal(flights.length, 2);
  assert.equal(ui.get('effects').querySelectorAll('.flying-half').length, 2);
  for (const flight of flights) {
    assert.equal(flight.options.duration, 1050);
    assert.equal(flight.frames.at(-1).opacity, 0);
    assert.ok(flight.frames.every(frame => !/NaN|undefined/.test(frame.transform)));
  }
  ui.advance(300);
  assert.ok(ui.get('effects').querySelectorAll('.spark').length >= 28);
  assert.equal(ui.get('effects').querySelectorAll('.snap-ray').length, 12);
  assert.match(ui.get('effects').textContent, /Nailed it!SNAP!/);
  ui.advance(800);
  assert.equal(ui.get('effects').querySelectorAll('.flying-half').length, 0);
  assert.equal(ui.get('effects').querySelectorAll('.snap-ray').length, 0);
  assert.equal(ui.get('tray').querySelector('.mini-pill').style.opacity, '');
  ui.join(1); ui.advance(300);
  assert.match(ui.get('effects').textContent, /2 in a row!/);
  ui.half(4); ui.half(7); ui.join(2); ui.advance(300);
  assert.doesNotMatch(ui.get('effects').textContent, /3 in a row!/);
});

test('switching language during a join cancels overlays and preserves playable progress', () => {
  const ui = gameUI('en', { motion: true }); ui.training(); ui.action('start'); ui.join(0);
  const flights = ui.animations.filter(a => a.node.classList.contains('flying-half') && !a.cancelled);
  ui.get('language').value = 'hi'; ui.get('language').emit('change');
  assert.ok(flights.every(animation => animation.cancelled));
  assert.equal(ui.get('effects').children.length, 0);
  assert.match(ui.get('progress').textContent, /1 \/ 5/);
  ui.join(1);
  assert.match(ui.get('progress').textContent, /2 \/ 5/);
});

test('primary actions remain outside scrolling content; Next Pill stays in the dock and unlocks on a match', () => {
  for (const language of ['en', 'hi', 'te']) {
    const ui = gameUI(language);
    function checkDock() {
      const panel = ui.app.querySelector('.panel');
      assert.equal(panel.querySelector('.screen-content').querySelector('.actions'), null);
      assert.equal(panel.querySelector('.actions').parent, panel);
    }
    checkDock(); ui.action('demo'); checkDock(); ui.action('continue'); ui.advance(7500); ui.action('practice');
    for (let i = 0; i < 5; i++) {
      checkDock();
      assert.equal(ui.app.querySelector('[data-action="next"]'), null);
      assert.equal(ui.app.querySelector('[data-action="next"]'), null);
      ui.join(i); ui.advance(3300);
      assert.equal(ui.app.querySelector('[data-action="next"]').disabled, false);
      assert.ok(ui.get('lesson-actions').classList.contains('is-ready'));
      checkDock(); ui.action('next');
    }
    checkDock(); ui.action('start'); ui.advance(45000); checkDock();
    assert.ok(ui.app.querySelector('details').querySelector('summary'));
  }
});

test('demo highlights and moves the capsule without a hand and explains each gesture before practice unlocks', () => {
  const ui = gameUI('en', { motion: true }); ui.action('demo');
  assert.ok(ui.app.querySelector('[data-action="continue"]'));
  ui.action('continue');
  assert.equal(ui.app.querySelector('.demo-hand'), null);
  assert.doesNotMatch(ui.app.textContent, /☝/);
  assert.match(ui.get('helper').textContent, /Press and hold/);
  const capsuleMotion = ui.animations.find(a => a.node.classList.contains('demo-grab'));
  assert.equal(capsuleMotion.options.duration, 4200);
  ui.advance(1250);
  assert.match(ui.get('helper').textContent, /Drag it towards Precision/);
  assert.equal(ui.get('capsule-stage').dataset.step, 'drag');
  ui.advance(2050);
  assert.match(ui.get('helper').textContent, /Release near the edge/);
  assert.equal(ui.app.querySelector('[data-action="practice"]').disabled, true);
  ui.advance(2100);
  assert.equal(ui.app.querySelector('[data-action="practice"]'), null);
  ui.advance(10000);
  assert.match(ui.get('equation').textContent, /%RSD = Precision/);
  assert.equal(ui.app.querySelector('.demo-hand'), null);
  assert.equal(ui.app.querySelector('[data-action="practice"]').disabled, false);
  ui.action('replay');
  assert.match(ui.get('helper').textContent, /Press and hold/);
  assert.equal(ui.app.querySelector('[data-action="practice"]').disabled, true);
});

test('one demo pass precedes practice, then the equation, explanation and button arrive in order', () => {
  const ui = gameUI('en', { motion: true }); ui.action('demo');
  ui.action('continue');
  ui.advance(7500);
  assert.equal(ui.app.querySelector('[data-action="practice"]').disabled, false);
  ui.advance(5000);
  assert.equal(ui.app.querySelector('.demo-hand'), null);
  assert.equal(ui.app.querySelector('[data-action="practice"]').disabled, false);
  ui.action('practice'); ui.join(0);
  assert.equal(ui.get('equation').textContent, '');
  assert.equal(ui.get('lesson-feedback').textContent, '');
  assert.equal(ui.app.querySelector('[data-action="next"]'), null);
  ui.advance(650);
  assert.ok(ui.get('effects').querySelector('.equation-flight'));
  ui.advance(650);
  assert.equal(ui.get('equation').textContent, '%RSD = Precision');
  ui.advance(999);
  assert.equal(ui.get('lesson-feedback').textContent, '');
  ui.advance(1);
  assert.match(ui.get('lesson-feedback').textContent, /consistent repeated results/);
  assert.equal(ui.app.querySelector('[data-action="next"]'), null);
  ui.advance(999);
  assert.equal(ui.app.querySelector('[data-action="next"]'), null);
  ui.advance(1);
  assert.equal(ui.app.querySelector('[data-action="next"]').disabled, false);
});

test('three mistakes end the game immediately and final report displays user connected and correct pills', () => {
  const round = new PillRound(0);
  assert.equal(round.attempt(0, 3, 100), 'wrong');
  assert.equal(round.mistakes, 1);
  assert.equal(round.ended, false);
  assert.equal(round.attempt(2, 5, 200), 'wrong');
  assert.equal(round.mistakes, 2);
  assert.equal(round.ended, false);
  assert.equal(round.attempt(4, 7, 300), 'wrong');
  assert.equal(round.mistakes, 3);
  assert.equal(round.ended, true);
  assert.equal(round.attempt(0, 1, 400), 'ended');

  const ui = gameUI();
  ui.training();
  ui.action('start');
  ui.half(0); ui.half(3);
  assert.equal(ui.get('mistakes').textContent, '1');
  ui.half(2); ui.half(5);
  assert.equal(ui.get('mistakes').textContent, '2');
  ui.half(4); ui.half(7);
  assert.equal(ui.get('mistakes').textContent, '3');
  ui.advance(800);
  assert.match(ui.app.textContent, /Out of lives!/);
  assert.ok(ui.app.querySelector('.report-pill-compare'));
  assert.ok(ui.app.querySelector('.pill-preview.wrong'));
  assert.ok(ui.app.querySelector('.pill-preview.correct'));
  assert.equal(ui.app.querySelectorAll('.answer').length, 5);
});


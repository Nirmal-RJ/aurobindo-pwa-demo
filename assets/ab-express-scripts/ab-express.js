/* AB Express owns its state, input and presentation; no other game runtime is used. */
(() => {
  'use strict';
  const C = window.ABConfig, Core = window.ABCore;
  const game = document.getElementById('game');
  let screen = document.getElementById('screen');
  let progress;
  try { progress = Core.clean(JSON.parse(localStorage.getItem(C.storageKey))); } catch { progress = Core.clean(null); }
  let page = '', mode = 'practice', bucket = 0, practiceRun = null, roundSteps = [], order = [], submitted = [], demoIndex = 0, learnIndex = 0;
  let generation = 0, elapsed = 0, lastFrame = performance.now(), paused = false, selected = -1, drag = null;
  let roundTick = null, lastUrgentTick = -1;
  let result = null, finishedStreak = 0, storagePending = false;
  const animations = new Set(), pausedAnimations = new Set();
  const readyAssets = new Map();
  const asset = path => readyAssets.get(path) || C.asset(path);
  function fit() {
    const padding = getComputedStyle(document.body);
    const width = Math.min(document.body.clientWidth, window.visualViewport?.width || innerWidth) - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight);
    const height = Math.min(document.body.clientHeight, window.visualViewport?.height || innerHeight) - parseFloat(padding.paddingTop) - parseFloat(padding.paddingBottom);
    const edgeToEdge = width <= 600 && height > width;
    // Match Rocketier: every portrait phone scene uses the viewport height.
    const flexible = edgeToEdge;
    const scale = flexible ? width / 360 : Math.min(width / 360, height / 640);
    game.style.width = `${edgeToEdge ? width : 360 * scale}px`; game.style.height = `${edgeToEdge ? height : 640 * scale}px`;
    game.classList.toggle('edge-to-edge', edgeToEdge);
    document.body.classList.toggle('portrait-viewport', edgeToEdge);
    screen.style.height = `${flexible ? height / scale : 640}px`;
    screen.style.setProperty('--scene-height', `${flexible ? height / scale : 640}px`);
    screen.style.setProperty('--step-font', flexible && height / scale >= 730 ? '12px' : '11px');
    screen.style.left = `${edgeToEdge ? (width - 360 * scale) / 2 : 0}px`;
    screen.style.top = `${edgeToEdge && !flexible ? (height - 640 * scale) / 2 : 0}px`;
    screen.style.setProperty('--scale', scale);
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
    document.body.classList.toggle('needs-portrait', mobile && width > height);
    syncPause();
    fitComparisonCopy();
    fitFooter();
  }
  function syncPause() {
    updateRoundClock();
    paused = document.hidden || document.body.classList.contains('needs-portrait');
    ABAudio.setPaused(paused);
    if (paused) {
      cancelDrag();
      for (const animation of game.getAnimations({ subtree: true })) if (animation.playState === 'running') { animation.pause(); pausedAnimations.add(animation); }
    } else {
      for (const animation of pausedAnimations) if (animation.effect?.target?.isConnected) animation.play();
      pausedAnimations.clear();
    }
  }
  new ResizeObserver(fit).observe(document.body);
  window.addEventListener('orientationchange', fit);
  window.visualViewport?.addEventListener('resize', fit);
  document.addEventListener('visibilitychange', () => { cancelDrag(); syncPause(); });
  function updateRoundClock(now = performance.now()) {
    if (roundTick !== null) {
      if (!paused && page === 'arrange' && !screen.inert && !storagePending) elapsed += Math.max(0, now - roundTick);
      roundTick = now;
    }
    return Math.max(0, C.challengeRoundSeconds * 1000 - elapsed);
  }
  function timerText(remaining) {
    const seconds = Math.ceil(remaining / 1000);
    return `Time ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }
  function frame(now) {
    const dt = Math.min(now - lastFrame, 100); lastFrame = now;
    if (!paused && !screen.inert) {
      if (page === 'arrange' && mode === 'challenge' && !storagePending) {
        const remaining = updateRoundClock(now);
        const label = screen.querySelector('.timer');
        if (label) {
          label.querySelector('strong').textContent = timerText(remaining).replace('Time ', '');
          label.classList.toggle('urgent', remaining > 0 && remaining <= 10000);
          label.classList.toggle('critical', remaining > 0 && remaining <= 5000);
          label.style.setProperty('--time-left', remaining / (C.challengeRoundSeconds * 1000));
          if (remaining > 0 && remaining <= 10000) {
            const interval = remaining <= 5000 ? 500 : 1000;
            const tick = Math.floor(elapsed / interval);
            if (tick !== lastUrgentTick) { lastUrgentTick = tick; ABAudio.cue('tick'); }
          }
        }
        if (roundTick !== null && remaining === 0) submit(true);
      }
      for (const a of [...animations]) {
        if (a.token !== generation) { animations.delete(a); a.resolve(false); continue; }
        a.time += dt; a.update(Math.min(a.time / a.duration, 1));
        if (a.time >= a.duration) { animations.delete(a); a.resolve(true); }
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  function tween(duration, update = () => {}) { return new Promise(resolve => animations.add({ token: generation, time: 0, duration, update, resolve })); }
  function background(name, path) {
    cancelDrag(); roundTick = null; generation++;
    for (const a of animations) a.resolve(false); animations.clear();
    page = name;
    ABAudio.setScene(name);
    document.getElementById('outgoing')?.remove();
    const outgoing = screen; outgoing.id = 'outgoing'; outgoing.inert = true; outgoing.style.pointerEvents = 'none'; outgoing.setAttribute('aria-hidden', 'true');
    screen = document.createElement('div'); screen.id = 'screen'; screen.dataset.page = name;
    screen.setAttribute('aria-busy', 'true'); game.dataset.transitioning = 'true';
    screen.style.setProperty('--scale', outgoing.style.getPropertyValue('--scale') || 1); screen.style.visibility = 'hidden'; screen.inert = true;
    game.insertBefore(screen, outgoing.nextSibling);
    screen.style.backgroundImage = `url("${asset(path)}")`;
    game.style.backgroundImage = screen.style.backgroundImage;
    document.body.style.setProperty('--scene-background', screen.style.backgroundImage);
    fit();
    document.getElementById('particles').replaceChildren();
    const token = generation, incoming = screen;
    // Retain the painted outgoing view until the incoming artwork is decoded.
    queueMicrotask(async () => {
      const bg = new Image(); bg.src = asset(path);
      await Promise.allSettled([bg.decode(), ...Array.from(incoming.querySelectorAll('img'), image => image.decode())]);
      requestAnimationFrame(() => { if (token !== generation) return; incoming.style.visibility = ''; incoming.inert = false; incoming.removeAttribute('aria-busy'); delete game.dataset.transitioning; outgoing.remove(); if (name === 'arrange' && mode === 'challenge') roundTick = performance.now(); });
    });
  }
  function img(path, cls, alt = '') { const e = new Image(); e.src = asset(path); e.alt = alt; e.draggable = false; e.className = cls; screen.append(e); return e; }
  const footerCrops = {
    'common-ui-buttons/next-button.webp':[558,168,0,0,558,168],
    'common-ui-buttons/back-button.webp':[2098,749,45,9,2009,740],
    'page-18/homw-button.webp':[2098,749,15,101,2056,525],
    'page-8/start-practising-button.webp':[2188,718,31,120,2125,454],
    'page-15/play-button.webp':[2170,725,30,83,2112,551],
    'common-ui-buttons/play-again-button.webp':[2170,725,31,84,2113,552],
    'page-9/start-the-train-button.webp':[2146,733,1,70,2142,540],
    'page-16/check-right-order-button.webp':[2170,725,78,99,2013,467]
  };
  function fitFooter() {
    for (const button of screen.querySelectorAll('.game-footer button')) {
      const face = button.querySelector('.button-face'); if (!face) continue;
      const ratio = Number(face.dataset.ratio), width = Math.min(button.clientWidth, button.clientHeight * ratio);
      face.style.width = `${width}px`; face.style.height = `${width / ratio}px`;
    }
  }
  function footerButton(button, path) {
    let footer = screen.querySelector('.game-footer');
    if (!footer) { footer = document.createElement('div'); footer.className = 'game-footer'; screen.append(footer); }
    footer.classList.toggle('stacked', ['practiceIntro','challengeIntro','reward'].includes(screen.dataset.page));
    button.style.order = button.classList.contains('bottom-back') ? 0 : button.classList.contains('nav-home') ? 1 : 2;
    if (footer.classList.contains('stacked')) button.style.order = button.classList.contains('nav-home') ? 2 : 1;
    const [w,h,x,y,cw,ch] = footerCrops[path], image = button.querySelector('img');
    const face = document.createElement('span'); face.className = 'button-face'; face.dataset.ratio = String(cw/ch);
    Object.assign(image.style,{position:'absolute',left:`${-x/cw*100}%`,top:`${-y/ch*100}%`,width:`${w/cw*100}%`,height:`${h/ch*100}%`,maxWidth:'none',objectFit:'fill'});
    face.append(image); button.append(face); footer.append(button); fitFooter();
  }
  function button(path, label, cls, action) {
    const b = document.createElement('button'); b.type = 'button'; b.className = `image-button ${cls}`; b.setAttribute('aria-label', label);
    const i = new Image(); i.src = asset(path); i.alt = ''; b.append(i); b.addEventListener('click', () => { if (screen.contains(b) && !b.disabled && !storagePending) action(); }); screen.append(b); if (footerCrops[path] && /(?:primary|nav-home|bottom-next|bottom-back)/.test(cls)) footerButton(b, path); return b;
  }
  function homeControl() { return button('page-18/homw-button.webp', 'Home', 'nav-home', home); }
  function next(action) { return button('common-ui-buttons/next-button.webp', 'Next', 'bottom-next', action); }
  function back(action) { return button('common-ui-buttons/back-button.webp', 'Back', 'bottom-back', action); }
  function announce(text) { const e = document.getElementById('notice'); e.textContent = text; e.className = 'visible'; setTimeout(() => e.className = '', 3500); }
  async function save(value) {
    storagePending = true;
    const write = () => { localStorage.setItem(C.storageKey, JSON.stringify(value)); progress = value; storagePending = false; };
    try { write(); } catch {
      await new Promise(resolve => {
        const box = document.createElement('div'); box.className = 'save-error'; box.setAttribute('role', 'alert');
        box.textContent = 'Your progress could not be saved. Free some browser storage, then retry to keep this result.';
        const retry = document.createElement('button'); retry.textContent = 'Retry saving'; retry.onclick = () => { try { write(); box.remove(); resolve(); } catch { retry.textContent = 'Still unavailable — retry'; } }; box.append(retry); screen.append(box);
      });
    }
  }
  function confetti() {
    const layer = document.getElementById('particles');
    for (let i = 0; i < 26; i++) { const p = document.createElement('i'); p.className = 'confetti'; p.style.left = `${8 + Math.random() * 84}%`; p.style.top = '25%'; p.style.background = ['#ffcc29','#fa5b46','#26d1ce','#fff3ad'][i % 4]; p.style.animationDelay = `${Math.random() * .35}s`; p.onanimationend = () => p.remove(); layer.append(p); }
  }
  function home() {
    if (storagePending) return;
    background('home', 'page-7/page-7-bg.webp');
    button('page-7/challenge mode butoon.webp', 'Challenge Mode', 'home-challenge enter', challengeIntro);
    button('page-7/practice-mode-button.webp', 'Practice Mode', 'home-practice enter', practiceIntro);
    button('page-7/demo-button.webp', 'Demo', 'home-demo enter', () => demo(0));
    button('page-7/learn-the-sequence-button.webp', 'Learn the Sequence', 'home-learn enter', () => learn(0));
  }
  function demo(index) {
    demoIndex = index;
    background('demo', `page-${index + 2}/page-${index + 2}-${index < 3 ? 'bg' : 'reference'}.webp`);
    // Reference-only slides contain baked navigation. Replace that strip with
    // the supplied scene background so there is exactly one live set of buttons.
    if (index >= 3) {
      const footer = document.createElement('div'); footer.className = 'demo-footer';
      footer.style.backgroundImage = `url("${asset(index === 3 ? 'page-9/page-9-bg-with-text.webp' : 'page-10/page-10-bg.webp')}")`;
      screen.append(footer);
    }
    next(async () => { if (demoIndex < 4) demo(demoIndex + 1); else { await save({ ...progress, demoComplete: true }); home(); } });
    if (index) back(() => demo(index - 1));
    if (progress.demoComplete) homeControl();
  }
  function learn(index) {
    learnIndex = index;
    background('learn', `page-18/page-18-${['a','b','c'][index]}.webp`);
    if (index) back(() => learn(index - 1));
    if (index < 2) next(() => learn(index + 1));
    homeControl();
  }
  function practiceIntro() {
    background('practiceIntro', 'page-8/page-8-bg.webp'); mode = 'practice'; bucket = 0; practiceRun = Core.newRun();
    button('page-8/start-practising-button.webp', 'Start Practising', 'primary', arrange); homeControl();
  }
  function drawStreak(count, celebrate) {
    const row = document.createElement('div'); row.className = 'streaks';
    for (let i = 0; i < 5; i++) { const node = document.createElement('div'); node.className = `streak-node ${i < count ? 'completed' : i === count ? 'current' : ''}${celebrate && i === count - 1 ? ' gained' : ''}`; const tunnel = new Image(); tunnel.src = asset('page-15/streak-tunnel.webp'); tunnel.alt = `Round ${i + 1}: ${i < count ? 'complete' : 'pending'}`; node.append(tunnel); const num = document.createElement('span'); num.textContent = String(i + 1); node.append(num); if (i < count) { const tick = new Image(); tick.src = asset('common-ui-buttons/correct.webp'); tick.alt = ''; tick.className = 'tick'; node.append(tick); } row.append(node); }
    screen.append(row);
  }
  function challengeIntro(celebrate = false) {
    mode = 'challenge'; background('challengeIntro', 'page-15/page-15-bg.webp');
    screen.classList.add('animated-challenge');
    const sections = [[0,15.3,0,'title'],[15.3,31,.15,'instructions'],[31,43,.25,'scenery'],[43,63,.55,'star'],[63,80,.75,'clock'],[80,100,0,'footer']];
    for (const [top,bottom,delay,name] of sections) {
      const section = img('page-15/page-15-bg.webp', `challenge-art-section challenge-art-${name}`);
      section.style.clipPath = `inset(${top}% 0 ${100-bottom}% 0)`;
      section.style.setProperty('--reveal-delay', `${delay}s`);
    }
    const halo = document.createElement('div'); halo.className = 'challenge-star-halo'; halo.setAttribute('aria-hidden','true'); screen.append(halo);
    const sparkles = document.createElement('div'); sparkles.className = 'challenge-sparkles'; sparkles.setAttribute('aria-hidden','true');
    [[35,49],[65,51],[38,59],[61,58]].forEach(([x,y],i)=>{const spark=document.createElement('i');spark.style.left=`${x}%`;spark.style.top=`${y}%`;spark.style.animationDelay=`${1+i*.45}s`;sparkles.append(spark);});screen.append(sparkles);
    drawStreak(progress.run?.index || 0, celebrate);
    for (const [index,node] of Array.from(screen.querySelectorAll('.streak-node')).entries()) {
      const slot = document.createElement('div'); slot.className = 'streak-slot'; slot.style.setProperty('--reveal-delay',`${.3+index*.09}s`); node.replaceWith(slot); slot.append(node);
    }
    const copy = document.createElement('div'); copy.className = 'timer-copy'; copy.innerHTML = `${C.challengeRoundSeconds} seconds<br><small>for each round</small>`; screen.append(copy);
    const play = button('page-15/play-button.webp', 'Play Challenge', 'primary', async () => {
      if (storagePending) return;
      if (!progress.run) await save({ ...progress, run: Core.newRun() });
      bucket = progress.run.index; arrange();
    }); homeControl();
    if (celebrate) { play.disabled = true; confetti(); tween(C.timing.streak).then(active => { if (active) play.disabled = false; }); }
  }
  function arrange() {
    background('arrange', 'page-9/page-9-bg-with-text.webp'); elapsed = 0; selected = -1; lastUrgentTick = -1; screen.classList.toggle('challenge-arrange', mode === 'challenge');
    roundSteps = (mode === 'practice' ? practiceRun : progress.run).order[bucket];
    order = Core.shuffle(roundSteps);
    if (order.every((v, i) => v === roundSteps[i])) [order[0], order[1]] = [order[1], order[0]];
    const list = document.createElement('ol'); list.className = 'sequence'; list.setAttribute('aria-label', 'Arrange the eight steps. Drag, or select a step then another position. Arrow keys move the focused step.'); screen.append(list);
    renderSteps();
    list.addEventListener('pointerdown', pointerDown); list.addEventListener('pointermove', pointerMove); list.addEventListener('pointerup', pointerUp); list.addEventListener('pointercancel', cancelDrag); list.addEventListener('lostpointercapture', cancelDrag);
    list.addEventListener('keydown', e => { const row = e.target.closest('.step'); if (!row) return; const from = order.indexOf(Number(row.dataset.id)); if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); const to = Math.max(0, Math.min(7, from + (e.key === 'ArrowUp' ? -1 : 1))); move(from, to); renderSteps(); list.children[to].focus(); } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectStep(from); } });
    button('page-9/start-the-train-button.webp', 'Start the Train', 'primary', submit);
    if (mode === 'challenge') { const timer = document.createElement('div'); timer.className = 'timer'; timer.setAttribute('role', 'timer'); timer.setAttribute('aria-label', 'Challenge time remaining'); const caption = document.createElement('span'); caption.textContent = 'Time '; const digits = document.createElement('strong'); digits.textContent = timerText(C.challengeRoundSeconds * 1000).replace('Time ', ''); timer.append(caption, digits); screen.querySelector('.game-footer').prepend(timer); fitFooter(); }
  }
  let lastWhoosh = -Infinity;
  function renderSteps() {
    const list = screen.querySelector('.sequence'); if (!list) return;
    const scale = game.getBoundingClientRect().width / 360;
    const previous = new Map(Array.from(list.children, row => [Number(row.dataset.id), { row, top: row.getBoundingClientRect().top }]));
    const scroll = list.scrollTop;
    list.replaceChildren();
    order.forEach((id, i) => { const li = document.createElement('li'); li.className = `step${selected === i ? ' selected' : ''}${drag?.moved && drag.id === id ? ' dragging' : ''}`; li.dataset.id = String(id); li.tabIndex = 0; li.setAttribute('aria-label', `Position ${i + 1}. ${C.steps[id - 1]}`); const frame = document.createElement('div'); frame.className = 'compartment-frame'; const art = new Image(); art.src = asset('page-9/question panel.webp'); art.alt = ''; frame.append(art); const icon = new Image(); icon.src = asset(`common-ui-buttons/${String(C.stepIcons[id - 1]).padStart(2,'0')}.webp`); icon.alt = ''; const text = document.createElement('span'); text.textContent = C.steps[id - 1]; li.title = C.steps[id - 1]; li.append(frame, icon, text); list.append(li); });
    list.scrollTop = scroll;
    for (const row of list.children) {
      const old = previous.get(Number(row.dataset.id)); if (!old) continue;
      const delta = (old.top - row.getBoundingClientRect().top) / scale;
      if (Math.abs(delta) > .5 && !(drag?.moved && drag.id === Number(row.dataset.id))) {
        row.animate([{ transform: `translateY(${delta}px)` }, { transform: 'translateY(0)' }], { duration: 240, easing: 'cubic-bezier(.22,.75,.25,1)' });
      }
    }
  }
  function move(from, to) { if (from === to) return; order.splice(to, 0, order.splice(from, 1)[0]); if (performance.now() - lastWhoosh > 140) { ABAudio.cue('whoosh'); lastWhoosh = performance.now(); } }
  function selectStep(index) { if (selected === -1) selected = index; else { move(selected, index); selected = -1; } renderSteps(); }
  function pointerDown(e) {
    if (e.button !== 0 || drag) return;
    const row = e.target.closest('.step'); if (!row) return;
    const list = row.parentElement; list.setPointerCapture(e.pointerId);
    drag = { id: Number(row.dataset.id), pointer: e.pointerId, x: e.clientX, y: e.clientY, before: order.slice(), moved: false, list };
  }
  function pointerMove(e) {
    if (!drag || drag.pointer !== e.pointerId) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
    if (!drag.moved) { drag.moved = true; selected = -1; const source = drag.list.querySelector(`[data-id="${drag.id}"]`); drag.width = source.offsetWidth; drag.height = source.offsetHeight; drag.ghost = source.cloneNode(true); drag.ghost.className = 'step drag-ghost'; drag.ghost.style.width = `${drag.width}px`; drag.ghost.style.height = `${drag.height}px`; drag.ghost.removeAttribute('tabindex'); drag.ghost.setAttribute('aria-hidden','true'); screen.append(drag.ghost); }
    const bounds = game.getBoundingClientRect(), scale = bounds.width / 360;
    drag.ghost.style.left = `${(e.clientX - bounds.left) / scale - drag.width / 2}px`; drag.ghost.style.top = `${(e.clientY - bounds.top) / scale - drag.height / 2}px`;
    const rect = drag.list.getBoundingClientRect();

    const rows = Array.from(drag.list.children);
    let index = rows.findIndex(row => { return e.clientY < rect.top + (row.offsetTop - drag.list.scrollTop + row.offsetHeight / 2) * scale; });
    if (index < 0) index = rows.length - 1;
    move(order.indexOf(drag.id), index); renderSteps();
  }
  function pointerUp(e) { if (!drag || drag.pointer !== e.pointerId) return; const current = drag; drag = null; current.ghost?.remove(); if (!current.moved) selectStep(order.indexOf(current.id)); else renderSteps(); }
  function cancelDrag() { if (!drag) return; const current = drag; drag = null; current.ghost?.remove(); order = current.before; renderSteps(); }
  async function submit(expired = false) {
    if (page !== 'arrange' || storagePending) return;
    if (mode === 'challenge' && updateRoundClock() === 0) expired = true;
    if (drag && !expired) return;
    submitted = order.slice();
    result = expired ? { correct: false, firstWrong: -1, checked: 0 } : Core.evaluate(roundSteps, submitted);
    background('checking', 'page-10/page-10-bg.webp');
    img('page-10/lets-check-your-sequence-pop-up.webp', 'art train-title');
    const train = document.createElement('div'); train.className = 'train-track';
    train.style.transform = `translateY(${screen.clientHeight * .75 + 4}px)`;
    const engine = new Image(); engine.src = asset('page-10/train-engine.webp'); engine.className = 'engine'; engine.alt = 'Train engine'; train.append(engine);
    for (const id of submitted) { const car = document.createElement('div'); car.className = 'carriage'; const body = new Image(); body.src = asset('page-10/icon-carrying-train-compartment.webp'); body.className = 'body'; body.alt = ''; const icon = new Image(); icon.src = asset(`common-ui-buttons/${String(C.stepIcons[id - 1]).padStart(2,'0')}.webp`); icon.className = 'icon'; icon.alt = C.steps[id - 1]; car.append(body, icon); train.append(car); }
    const window = document.createElement('div'); window.className = 'train-window'; window.append(train); screen.append(window); img('page-10/tunnel-cropped.webp', 'art tunnel');
    if (!expired && !await tween(C.timing.intro)) return;
    // The engine starts below the viewport, pulling the same attached carriages
    // continuously into position before individual compartments are checked.
    ABAudio.cue('trainEntry');
    if (!await tween(C.timing.trainEntry, t => {
      const smooth = t * t * (3 - 2 * t);
      train.style.transform = `translateY(${(screen.clientHeight * .75 + 4) * (1 - smooth)}px)`;
    })) return;
    let y = 0;
    for (let i = 0; i < result.checked; i++) {
      const target = -(i * 73 + 136);
      const start = y;
      if (!await tween(C.timing.compartment, t => { const smooth = t * t * (3 - 2 * t); y = start + (target - start) * smooth; train.style.transform = `translateY(${y}px)`; })) return;
      screen.querySelector('.check-mark')?.remove();
      const correct = result.firstWrong !== i;
      img(`common-ui-buttons/${correct ? 'correct' : 'wrong'}.webp`, 'check-mark', correct ? 'Correct step' : 'Incorrect step');
      if (correct) { ABAudio.cue('correct'); confetti(); }
      if (correct && !await tween(400)) return;
    }
    if (result.correct) {
      page = 'success'; screen.querySelector('.train-title')?.remove(); const answer = img('page-13/congratulations-pop-up.webp', 'art train-title'); confetti();
      screen.querySelector('.check-mark')?.classList.add('success-mark');
      if (mode === 'challenge') { finishedStreak = progress.run.index + 1; await save(Core.pass(progress)); }
      await answer.decode().catch(() => {});
      if (!await tween(Math.max(C.timing.feedback, C.timing.answerReveal + C.timing.answerRead))) return;
      next(mode === 'practice' ? () => { if (bucket < 4) { bucket++; arrange(); } else home(); } : () => finishedStreak === 5 ? reward() : challengeIntro(true));
    } else {
      page = 'failure'; ABAudio.wrong(); screen.classList.add('crashed'); screen.querySelector('.train-title')?.remove();
      if (mode === 'challenge') await save({ ...progress, run: Core.newRun(roundSteps) });
      const impact = ABEffects.crash({ screen, train, failedIndex: result.firstWrong, tween, asset, settings: C.crash });
      if (!await tween(C.crash.titleDelay)) return;
      img('page-12/train-crashed.webp', 'art train-title');
      if (expired) { const note = document.createElement('div'); note.className = 'timeout-note'; note.setAttribute('role', 'status'); note.textContent = "Time's up! 0:00"; screen.append(note); }
      if (!await tween(C.timing.feedback) || !await impact) return;
      // The supplied failure panel already contains its own wrong marker.
      screen.querySelector('.check-mark')?.remove();
      const answer = img(mode === 'practice' ? 'page-12/wrong-pop-up.webp' : 'page-16/streak-lost-panel.webp', 'art feedback-panel');
      answer.style.visibility = 'hidden';
      await answer.decode().catch(() => {});
      answer.style.visibility = ''; answer.style.animation = `pop ${C.timing.answerReveal}ms both`;
      if (!await tween(C.timing.answerReveal + C.timing.answerRead)) return;
      if (mode === 'practice') next(compare);
      else button('page-16/check-right-order-button.webp', 'Check Right Order', 'primary', compare);
    }
  }
  function fitComparisonCopy() {
    for (const text of screen.querySelectorAll('.compare-cell>span')) {
      let size = 11.5; text.style.fontSize = `${size}px`;
      const range = document.createRange(); range.selectNodeContents(text);
      while (size > 7 && (range.getBoundingClientRect().height > text.getBoundingClientRect().height + .5 || text.scrollWidth > text.clientWidth + 1)) {
        size -= .25; text.style.fontSize = `${size}px`;
      }
    }
  }
  window.addEventListener('resize', fitComparisonCopy);
  function compare() {
    background('compare', 'page-14/page-14-bg.webp');
    const grid = document.createElement('div'); grid.className = 'comparison';
    grid.setAttribute('role', 'region'); grid.setAttribute('aria-label', 'Your sequence and correct sequence');
    for (let i = 0; i < 8; i++) {
      [submitted[i], roundSteps[i]].forEach((id, column) => {
        const cell = document.createElement('div'); cell.className = 'compare-cell';
        if (!column && submitted[i] !== roundSteps[i]) cell.classList.add('misplaced');
        cell.style.left = `${column ? 52.7 : 5.9}%`;
        cell.style.top = `${23.1 + i * 8.14}%`;
        const icon = new Image(); icon.src = asset(`common-ui-buttons/${String(C.stepIcons[id - 1]).padStart(2,'0')}.webp`); icon.alt = '';
        const text = document.createElement('span'); text.textContent = C.steps[id - 1];
        cell.title = C.steps[id - 1];
        cell.setAttribute('aria-label', `${column ? 'Correct' : 'Your'} sequence, step ${i + 1}: ${C.steps[id - 1]}`);
        cell.append(icon, text); grid.append(cell);
      });
    }
    screen.append(grid); fitComparisonCopy();
    button('common-ui-buttons/play-again-button.webp', 'Play Again', 'primary', () => { if (mode === 'challenge') bucket = 0; arrange(); }); homeControl();
  }
  function reward() {
    background('reward', 'page-17/page-17-bg.webp');
    const ray = document.createElement('div'); ray.className = 'rays'; screen.append(ray);
    img('page-17/star.webp', 'art reward-star', 'One star earned'); confetti();
    const copy = document.createElement('div'); copy.className = 'reward-copy'; copy.textContent = 'You earned a star!'; screen.append(copy);
    const play = button('common-ui-buttons/play-again-button.webp', 'Play Again', 'primary', challengeIntro); play.disabled = true;
    tween(C.timing.reward).then(active => { if (active) play.disabled = false; }); homeControl();
  }
  async function load() {
    background('loading', 'page-1/page-1-bg.webp');
    const panel = document.createElement('div'); panel.className = 'load-area';
    const label = document.createElement('div'); label.textContent = 'Loading AB Express…';
    const bar = document.createElement('progress'); bar.max = ABAssets.reduce((n, item) => n + item.bytes, 0); bar.value = 0; panel.append(label, bar); screen.append(panel);
    let done = 0, cursor = 0, cache;
    try { cache = await caches.open(`ab-express-v${C.version}`); } catch { /* Online play works when cache storage is unavailable. */ }
    try {
      const loads = await Promise.allSettled(Array.from({ length: 4 }, async () => {
        while (cursor < ABAssets.length) {
          const item = ABAssets[cursor++]; const url = C.asset(item.path);
          if (readyAssets.has(item.path)) { done += item.bytes; bar.value = done; continue; }
          const response = await cache?.match(url) || await fetch(url); if (!response.ok) throw new Error(`Missing ${item.path}`);
          const copy = response.clone();
          const blob = await response.blob(); if (blob.size !== item.bytes) { await cache?.delete(url); throw new Error(`Incomplete ${item.path}`); }
          const objectUrl = URL.createObjectURL(blob), image = new Image();
          try { if (/\.(aac|wav|mp3)$/i.test(item.path)) await ABAudio.prepare(item.path, blob); else { image.src = objectUrl; await image.decode(); } } catch (error) { URL.revokeObjectURL(objectUrl); await cache?.delete(url); throw error; }
          readyAssets.set(item.path, objectUrl);
          if (cache) { try { await cache.put(url, copy); } catch { /* Storage pressure must not block online play. */ } }
          done += item.bytes; bar.value = done; label.textContent = `Loading ${Math.round(done / bar.max * 100)}%`;
        }
      }));
      const failed = loads.find(load => load.status === 'rejected');
      if (failed) throw failed.reason;
      panel.remove(); page = 'landing'; screen.style.backgroundImage = `url("${asset('page-1/page-1-bg.webp')}")`;
      button('common-ui-buttons/next-button.webp', 'Next', 'landing-next', () => progress.demoComplete ? home() : demo(0));
      if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
    } catch (error) {
      label.textContent = 'Some assets could not load. Check your connection and retry.';
      const retry = document.createElement('button'); retry.textContent = 'Retry'; retry.onclick = load; panel.append(retry); console.error(error);
    }
  }
  fit(); load();
})();

(() => {
  'use strict';
  const { Game, missions, recipes, chemicals, increment } = window.RocketGame;
  const $ = id => document.getElementById(id);
  const base = 'assets/rocket-game-assets/';
  const key = 'aurobindo.rocketier.v1';
  const names = { Water: 'Water', ACN: 'ACN', MeOH: 'MeOH' };
  // Match liquid-sort's active gameplay palette.
  const colors = { Water: '#00cfff', ACN: '#b627ed', MeOH: '#ffbf25' };
  const sounds = new Map();
  const soundFiles = { correct: 'Correct Question.mp3', liquid: 'Liquid Flowing.mp3', blast: 'Engine Blast 1.mp3', wrong: 'Wrong Question.mp3', click: 'Button Click 2.mp3', question: 'generated/formula-reveal.wav', noseOpen: 'generated/nose-open.wav', noseClose: 'generated/nose-close.wav', numbers: 'generated/number-count.wav', route: 'generated/route-glide.wav', zoom: 'generated/rocket-zoom.wav' };
  if (typeof Audio === 'function') for (const [name, file] of Object.entries(soundFiles)) {
    const audio = new Audio(`${base}rocketier-audio/${file.split('/').map(encodeURIComponent).join('/')}`);
    audio.preload = 'none'; audio.volume = ({ liquid: .45, click: .5, question: .5, noseOpen: .4, noseClose: .4, numbers: .26, route: .3, zoom: .4 })[name] ?? .8;
    audio.loop = name === 'liquid'; sounds.set(name, audio);
  }
  function stopSound(name) {
    const audio = sounds.get(name); if (!audio) return;
    audio.pause(); audio.currentTime = 0;
  }
  function playSound(name, continuous = false) {
    const audio = sounds.get(name); if (!audio || document.hidden) return;
    if (continuous && !audio.paused) return;
    try { audio.currentTime = 0; audio.play()?.catch(() => {}); } catch (_) { /* Sound must not block play. */ }
  }
  let soundsUnlocked = false;
  function buttonSound(event) {
    if (window.RocketPreload && !window.RocketPreload.ready) return;
    if (event.target.closest('[data-fill], [data-undo], .rocket-choice')) return;
    if (!event.target.closest('button,a') || event.target.closest('button:disabled')) return;
    if (!soundsUnlocked) {
      soundsUnlocked = true;
      // Prime delayed effects within a user gesture for mobile autoplay policies.
      for (const [name, audio] of sounds) if (name !== 'click') {
        audio.muted = true;
        try { Promise.resolve(audio.play()).then(() => { audio.pause(); audio.currentTime = 0; audio.muted = false; }).catch(() => { audio.muted = false; }); }
        catch (_) { audio.muted = false; }
      }
    }
    playSound('click');
  }
  let transferTimer = null, transferPending = false, visualAttemptId = null;
  const pipeTimers = new Map();
  const screens = ['intro', 'brief', 'mission', 'hangar', 'cinematic', 'journey', 'complete'];
  let saved, storageFailed = false;
  try { const raw = localStorage.getItem(key); if (raw) saved = JSON.parse(raw); }
  catch (_) { storageFailed = true; }
  const game = new Game(saved);
  let tick = null, hold = null, heldButton = null, screenVersion = 0, popupAction = null;
  let database = null, backupQueue = Promise.resolve();
  const fmt = n => Math.round(n).toLocaleString('en-IN');
  const seconds = n => `${n.toFixed(1)}s`;
  const haptic = pattern => { try { navigator.vibrate?.(pattern || 15); } catch (_) { /* optional */ } };
  function warn() { $('storage-warning').hidden = false; $('storage-warning').textContent = 'History could not be saved in this browser. Complete the mission and download game history to keep a copy.'; }
  // IndexedDB retains complete history as a second copy; localStorage enables immediate resume.
  if ('indexedDB' in window) {
    const request = indexedDB.open('aurobindo-rocketier', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('history');
    request.onsuccess = () => {
      database = request.result;
      const read = database.transaction('history').objectStore('history').get('state');
      read.onsuccess = () => {
        if (!saved && read.result && !game.run) {
          Object.assign(game, new Game(read.result));
        }
        persist();
      };
    };
    request.onerror = () => { if (storageFailed) warn(); };
  }
  function persist() {
    game.data.updatedAt = new Date().toISOString();
    const json = JSON.stringify(game.data);
    try { localStorage.setItem(key, json); storageFailed = false; }
    catch (_) { storageFailed = true; warn(); }
    if (database) {
      const snapshot = JSON.parse(json);
      backupQueue = backupQueue.catch(() => {}).then(() => new Promise((resolve, reject) => {
        const tx = database.transaction('history', 'readwrite');
        tx.objectStore('history').put(snapshot, 'state');
        tx.oncomplete = resolve; tx.onerror = () => { if (storageFailed) warn(); reject(tx.error); };
      }));
      backupQueue.catch(() => {});
    }
  }
  function stopHold() {
    clearInterval(hold); hold = null;
    if (heldButton) heldButton.classList.remove('held');
    heldButton = null;
  }
  function show(screen, immediate = false) {
    ['question', 'noseOpen', 'noseClose', 'numbers', 'route', 'zoom'].forEach(stopSound);
    screenVersion++; stopHold(); clearInterval(tick); tick = null;
    $('popup').close(); $('lesson').pause();
    const frame = $('game');
    const previous = frame.dataset.screen;
    const outgoing = screens.includes(previous) ? $(previous) : null;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const version = screenVersion;
    const reveal = () => {
      if (version !== screenVersion) return;
      screens.forEach(id => { $(id).hidden = id !== screen; });
      window.scrollTo(0, 0);
    };
    if (!immediate && outgoing && previous !== screen && outgoing.animate && !reducedMotion) {
      frame.inert = true;
      frame.classList.add('transitioning');
      const exit = outgoing.animate([
        { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
        { opacity: 0, transform: 'scale(1.06) translateY(-12px)', filter: 'blur(5px)' }
      ], { duration: 220, easing: 'ease-in', fill: 'forwards' });
      setTimeout(() => {
        if (version !== screenVersion) return;
        reveal(); exit.cancel();
      }, 220);
      setTimeout(() => {
        if (version !== screenVersion) return;
        frame.inert = false;
        frame.classList.remove('transitioning');
      }, 700);
    } else {
      frame.inert = false;
      frame.classList.remove('transitioning');
      reveal();
    }
    $('game').dataset.screen = screen;
  }
  function later(fn, delay) { const version = screenVersion; setTimeout(() => { if (version === screenVersion) fn(); }, delay); }
  let animationSerial = 0;
  function animateScene(element, frames, options) {
    try { if (typeof element.animate === 'function') return element.animate(frames, options); } catch (_) { /* Fall back to CSS keyframes. */ }
    if (!document.head) return null;
    const name = `rocket-fallback-${++animationSerial}`, style = document.createElement('style');
    style.textContent = `@keyframes ${name}{${frames.map((frame, i) => `${i / (frames.length - 1) * 100}%{${Object.entries(frame).map(([key, value]) => `${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}:${value}`).join(';')}}`).join('')}}`;
    document.head.appendChild(style);
    const previous = element.style.getPropertyValue('animation'), priority = element.style.getPropertyPriority('animation');
    element.style.setProperty('animation', `${name} ${options.duration}ms ${options.easing || 'linear'} ${options.fill || 'both'}`, 'important');
    return { cancel() { style.remove(); if (previous) element.style.setProperty('animation', previous, priority); else element.style.removeProperty('animation'); } };
  }
  function announce(message) { $('announcement').textContent = message; }
  function brief() {
    show('brief');
  }
  function engines(blown = -1) {
    $('engines').innerHTML = [0, 1, 2].map(i => `<img src="${base}page-4/rocket-1.webp" alt="Engine ${i + 1}: ${i < game.run.engines ? 'working' : 'failed'}" class="${i < game.run.engines ? '' : 'dead'}">`).join('');
    $('engines').setAttribute('aria-label', `${game.run.engines} of 3 engines working`);
    [...$('flames').children].forEach((el, i) => {
      el.classList.toggle('dead', i >= game.run.engines);
      el.classList.toggle('blowing', i === blown);
      el.classList.toggle('smoking', i === blown);
      if (i === blown) later(() => el.classList.remove('blowing'), 880);
      if (i === blown) later(() => el.classList.remove('smoking'), 1800);
    });
  }
  function clearTransfers() {
    stopSound('liquid');
    chemicals.forEach(c => { const display = $(`amount-${c}`); if (display) { display.dataset.changing = ''; display.dataset.delta = ''; display.feedbackAnimation?.cancel(); } });
    clearTimeout(transferTimer); transferPending = false;
    $('chamber-liquid').classList.remove('is-mixing');
    pipeTimers.forEach(timer => clearTimeout(timer)); pipeTimers.clear();
    chemicals.forEach(c => { const path = $(`pipe-flow-${c}`); if (path) path.dataset.flow = ''; const core = $(`pipe-core-${c}`); if (core) core.dataset.flow = ''; $(`pour-${c}`).dataset.flow = ''; });
  }
  function updateLaunch() {
    const ready = game.phase === 'fill' && game.total === 100 && !transferPending;
    $('launch').disabled = !ready;
    $('launch').hidden = !ready;
    $('launch').classList.toggle('launch-ready', ready);
    $('launch').setAttribute('aria-label', ready ? 'Mixture full. Launch rocket' : 'Launch when mixing chamber is full');
  }
  function animateTransfer(chemical, undo) {
    playSound('liquid', true);
    const display = $(`amount-${chemical}`);
    const previousAmount = parseInt(display.textContent, 10) || 0;
    const delta = game.mixture[chemical] - previousAmount;
    display.dataset.delta = `${delta < 0 ? '\u2212' : '+'}${Math.abs(delta)}%`;
    display.dataset.changing = undo ? 'undo' : 'fill';
    display.feedbackAnimation?.cancel();
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      display.feedbackAnimation = display.animate?.([
        { transform: 'scale(1)', offset: 0 },
        { transform: `translateY(${undo ? '1' : '-1'}px) scale(1.1)`, offset: .35 },
        { transform: 'scale(1)', offset: 1 }
      ], { duration: 260, easing: 'ease-out' });
    }
    transferPending = true;
    clearTimeout(transferTimer);
    const flow = $(`pipe-flow-${chemical}`);
    flow.dataset.flow = undo ? 'reverse' : 'forward';
    const core = $(`pipe-core-${chemical}`); core.dataset.flow = flow.dataset.flow;
    const pour = $(`pour-${chemical}`); pour.dataset.flow = flow.dataset.flow;
    clearTimeout(pipeTimers.get(chemical));
    pipeTimers.set(chemical, setTimeout(() => { flow.dataset.flow = ''; core.dataset.flow = ''; pour.dataset.flow = ''; display.dataset.changing = ''; display.dataset.delta = ''; pipeTimers.delete(chemical); }, 650));
    $('chamber-liquid').classList.add('is-mixing');
    transferTimer = setTimeout(() => {
      stopSound('liquid');
      transferPending = false;
      $('chamber-liquid').classList.remove('is-mixing');
      updateLaunch();
    }, 650);
  }
  function renderMixture() {
    $('chamber-liquid').style.setProperty('--surface', `${100 - game.total}%`);
    chemicals.forEach(c => {
      const remaining = 100 - game.mixture[c];
      $(`amount-${c}`).textContent = `${game.mixture[c]}%`;
      $(`amount-${c}`).setAttribute('aria-label', `${names[c]}: ${game.mixture[c]}% dispensed`);
      $(`liquid-${c}`).style.setProperty('--amount', `${remaining}%`);
      $(`chamber-${c}`).style.height = `${game.mixture[c]}%`;
      $(`chamber-${c}`).style.backgroundColor = colors[c];
      const fill = document.querySelector(`[data-fill="${c}"]`);
      fill.disabled = game.phase !== 'fill' || game.total >= 100;
      document.querySelector(`[data-undo="${c}"]`).disabled = game.phase !== 'fill' || !game.mixture[c];
    });
    $('chamber-total').textContent = `${game.total}% filled`;
    updateLaunch();
  }
  function makeTanks() {
    // Keep the layer elements alive so CSS interpolates their levels smoothly.
    clearTransfers();
    $('pipe-paths').innerHTML = chemicals.map(c => `<g style="--flow-color:${colors[c]}"><path id="pipe-outline-${c}" class="pipe-outline"/><path id="pipe-metal-${c}" class="pipe-metal"/><path id="pipe-core-${c}" class="pipe-core"/><path id="pipe-flow-${c}" class="pipe-flow" style="--flow-color:${colors[c]}"/></g>`).join('');
    $('tanks').innerHTML = chemicals.map(c => `<div id="tank-${c}" class="tank" style="--liquid:${colors[c]}"><div class="tank-liquid"><i id="liquid-${c}" style="--amount:100%"></i></div><img class="tank-art" src="${base}page-5/solvent-tank.webp" alt=""><output id="amount-${c}" aria-label="${c} dispensed">0%</output><span class="tank-name">${names[c]}</span><div class="tank-controls"><button type="button" data-fill="${c}" aria-label="Fill ${c}, ${increment(game.recipe, c)} percent per step"><img src="${base}page-5/fill-button.webp" alt="Fill"></button><button type="button" data-undo="${c}" aria-label="Undo ${increment(game.recipe, c)} percent ${c}"><img src="${base}page-5/undo-button.webp" alt="Undo"></button></div></div>`).join('');
    $('tanks').querySelectorAll('[data-fill]').forEach(button => {
      const c = button.dataset.fill;
      const change = () => {
        if (game.change(c)) { animateTransfer(c, false); haptic(8); persist(); renderMixture(); }
        processOutcome();
        if (game.total === 100 || game.phase !== 'fill') stopHold();
      };
      button.addEventListener('pointerdown', event => {
        if (event.button !== 0 || button.disabled) return;
        event.preventDefault(); stopHold(); heldButton = button;
        try { button.setPointerCapture?.(event.pointerId); } catch (_) { /* Global release listeners still stop filling. */ }
        change();
        if (game.phase === 'fill' && game.total < 100) hold = setInterval(change, 350);
      });
      button.addEventListener('pointerup', stopHold);
      button.addEventListener('pointercancel', stopHold);
      button.addEventListener('lostpointercapture', stopHold);
      if (!window.PointerEvent) {
        const legacyPress = event => {
          if (button.disabled || (event.button !== undefined && event.button !== 0)) return;
          event.preventDefault(); stopHold(); heldButton = button; change();
          if (game.phase === 'fill' && game.total < 100) hold = setInterval(change, 350);
        };
        button.addEventListener('touchstart', legacyPress, { passive: false });
        button.addEventListener('mousedown', legacyPress);
        button.addEventListener('touchend', stopHold);
        button.addEventListener('touchcancel', stopHold);
        button.addEventListener('mouseup', stopHold);
      }
      // Native keyboard/assistive-technology clicks have detail 0; pointer taps are handled above.
      button.addEventListener('click', event => { if (event.detail === 0) change(); });
    });
    $('tanks').querySelectorAll('[data-undo]').forEach(button => button.addEventListener('click', () => {
      stopHold(); if (game.change(button.dataset.undo, true)) { animateTransfer(button.dataset.undo, true); haptic(); persist(); renderMixture(); } processOutcome();
    }));
  }
  function hangar() {
    clearTransfers();
    show('hangar'); $('hangar').className = 'screen hangar selecting';
    const planet = game.mission.origin.toLowerCase();
    $('hangar').style.backgroundImage = 'none';
    $('hangar-closeup').style.backgroundImage = `url('${base}page-4/page-4-bg-${planet}.webp')`;
    $('hangar-closeup').style.transform = 'scale(1)';
    $('question-number').textContent = `${game.mission.origin} \u2192 ${game.mission.destination} \u00b7 QUESTION ${game.run.questions.length}`;
    $('question-title').textContent = game.recipe.name;
    $('question-title').hidden = true;
    $('instruction').textContent = 'Choose your rocket for this journey!';
    $('countdown').textContent = `${game.mission.seconds}s`;
    $('countdown').parentElement.classList.remove('urgent');
    $('fuel-system').hidden = true; $('pad-rocket').hidden = true; $('conveyor').hidden = false;
    $('rocket-track').innerHTML = Array.from({ length: 10 }, (_, n) => `<button class="rocket-choice" data-rocket="${n % 5 + 1}" aria-label="Choose rocket ${n % 5 + 1}"><span class="rocket-model" data-variant="${n % 5 + 1}" aria-hidden="true"><img class="rocket-top" src="${base}page-5/rocket-${n % 5 + 1}-top.webp" alt=""><img class="rocket-bottom" src="${base}page-5/rocket-${n % 5 + 1}-bottom.webp" alt=""></span></button>`).join('');
    $('rocket-track').querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      if (!game.selectRocket(Number(button.dataset.rocket))) return;
      haptic(); persist(); prepare(button);
    }));
    engines(); announce(`Prepare ${game.recipe.name}. Choose your rocket.`);
  }
  function prepare(button) {
    const stage = $('hangar'), rocket = $('pad-rocket'), scenery = $('hangar-closeup');
    // This is essential gameplay motion. Keep the sequence visible even when
    // the OS disables decorative effects; never collapse it into image swaps.
    const travelMs = 1900, settleMs = 200, openMs = 650, tanksMs = 900;
    stage.classList.add('boarding');
    playSound('zoom');
    $('instruction').textContent = 'Moving your rocket to the launch pad?';
    const sourceRect = button.querySelector?.('.rocket-model')?.getBoundingClientRect();
    rocket.dataset.variant = String(game.rocket);
    $('rocket-top').src = `${base}page-5/rocket-${game.rocket}-top.webp`;
    $('rocket-bottom').src = `${base}page-5/rocket-${game.rocket}-bottom.webp`;
    rocket.hidden = false;
    const targetRect = rocket.getBoundingClientRect?.();
    button.style.visibility = 'hidden';
    let travel, camera;
    if (sourceRect && targetRect && targetRect.width && targetRect.height) {
      const dx = sourceRect.left - targetRect.left;
      const dy = sourceRect.top - targetRect.top;
      // Two endpoints only: the centre, size and every rocket part interpolate
      // along one straight path, with no overshoot, bounce or second placement.
      travel = animateScene(rocket, [
        { transform: `translate(${dx}px,${dy}px) scale(${sourceRect.width / targetRect.width},${sourceRect.height / targetRect.height})` },
        { transform: 'translate(0,0) scale(1,1)' }
      ], { duration: travelMs, easing: 'linear', fill: 'both' });
      camera = animateScene(scenery, [
        { transform: 'scale(1)' }, { transform: 'scale(1.22)' }
      ], { duration: travelMs, easing: 'linear', fill: 'both' });
    }
    makeTanks();
    // The same scenery and the same split rocket stay on screen throughout.
    // Only the camera scale changes; there is no page-4/page-5 image handoff.
    later(() => {
      scenery.style.transform = 'scale(1.22)';
      stopSound('zoom');
      travel?.cancel(); camera?.cancel();
      $('conveyor').hidden = true;
      stage.classList.remove('selecting');
      stage.classList.add('docked');
      haptic(25);
      later(() => {
        stage.classList.add('fuel-ready', 'formula-reveal');
        $('question-title').hidden = false;
        playSound('question');
        announce(`Fuel formula: ${game.recipe.name}. Read the rocket panel before filling.`);
        later(() => {
          stage.classList.remove('formula-reveal');
          stage.classList.add('filling');
          playSound('noseOpen');
          later(() => {
            $('fuel-system').hidden = false;
            alignFuelSystem();
            renderMixture();
            later(() => {
              stage.classList.remove('boarding');
              game.beginAttempt(); persist(); filling();
            }, tanksMs);
          }, openMs);
        }, 1500);
      }, settleMs);
    }, travelMs);
  }
  function alignFuelSystem() {
    const stage = $('hangar'), fuel = $('fuel-system');
    if (stage.hidden || fuel.hidden || !stage.getBoundingClientRect) return;
    const stageRect = stage.getBoundingClientRect();
    const bodyRect = $('rocket-bottom').getBoundingClientRect();
    // Measured top-rim coordinates in each source body image, not a shared guess.
    const [mouthX, mouthY] = [
      [248.5 / 497, 12 / 489], [234 / 466, 12 / 480],
      [228.5 / 454, 10 / 412], [225 / 483, 11 / 471], [253.5 / 507, 11 / 468]
    ][game.rocket - 1];
    const mouth = bodyRect.top - stageRect.top + bodyRect.height * mouthY;
    const insertion = stageRect.height * .006;
    const assemblyWidth = stageRect.width * .84;
    const gap = assemblyWidth * .012;
    const tankWidth = (assemblyWidth - 2 * gap) / 3;
    const tankHeight = tankWidth * 1591 / 989;
    const chamberWidth = assemblyWidth * .88;
    const chamberHeight = chamberWidth * 798 / 1972;
    const pipeGap = assemblyWidth * .18;
    const assemblyHeight = tankHeight + pipeGap + chamberHeight;
    fuel.style.left = `${bodyRect.left - stageRect.left + bodyRect.width * mouthX - assemblyWidth / 2}px`;
    fuel.style.right = 'auto';
    fuel.style.top = `${mouth + insertion - assemblyHeight}px`;
    fuel.style.width = '84%';
    fuel.style.height = `${assemblyHeight}px`;
    $('tanks').style.height = `${tankHeight}px`;
    const network = $('pipe-network');
    network.setAttribute('viewBox', `0 0 ${assemblyWidth} ${assemblyHeight}`);
    const chamberY = tankHeight + pipeGap;
    const stroke = Math.max(7, tankWidth * .105);
    chemicals.forEach((c, i) => {
      const startX = i * (tankWidth + gap) + tankWidth * .5;
      const startY = tankHeight * .972;
      const endX = assemblyWidth * .06 + chamberWidth * [.33, .5, .67][i];
      const endY = chamberY + chamberHeight * .14;
      const midY = (startY + endY) / 2;
      const direction = Math.sign(endX - startX);
      const radius = Math.min(Math.abs(endX - startX) / 2, (endY - startY) / 4, stroke * 1.2);
      const d = Math.abs(endX - startX) < 1
        ? `M ${startX} ${startY} L ${endX} ${endY}`
        : `M ${startX} ${startY} V ${midY - radius} Q ${startX} ${midY} ${startX + direction * radius} ${midY} H ${endX - direction * radius} Q ${endX} ${midY} ${endX} ${midY + radius} V ${endY}`;
      ['outline', 'metal', 'core', 'flow'].forEach((part, j) => {
        const path = $(`pipe-${part}-${c}`);
        path.setAttribute('d', d);
        path.setAttribute('stroke-width', [stroke + 4, stroke + 1, stroke * .66, stroke * .32][j]);
      });
    });
  }
  window.addEventListener('resize', alignFuelSystem);
  function filling() {
    $('hangar').classList.add('fuel-ready');
    if (visualAttemptId !== game.attempt.id) { clearTransfers(); visualAttemptId = game.attempt.id; }
    $('hangar').classList.remove('engine-failure');
    $('instruction').textContent = 'Hold Fill \u00b7 Undo one step \u00b7 Launch at 100%';
    renderMixture(); engines();
    const update = () => {
      if (game.phase !== 'fill') return;
      $('countdown').textContent = `${Math.ceil(game.remaining)}s`;
      $('countdown').parentElement.classList.toggle('urgent', game.remaining <= 10);
      if (game.remaining <= 0) { game.submit(true); processOutcome(); }
    };
    clearInterval(tick); update(); tick = setInterval(update, 100);
    announce(`${game.recipe.name}. ${game.mission.seconds} seconds. Fill the correct solvent ratios.`);
  }
  let handledAttempt = null;
  function processOutcome() {
    if (!game.attempt || game.attempt.outcome === 'active' || handledAttempt === game.attempt.id) return;
    handledAttempt = game.attempt.id; stopHold(); clearTransfers(); clearInterval(tick); persist(); renderMixture();
    if (game.attempt.outcome === 'correct') {
      playSound('correct');
      playSound('noseClose');
      engines();
      $('instruction').textContent = 'Perfect mixture. Ignition!';
      $('hangar').classList.remove('filling'); $('hangar').classList.add('launching'); haptic([40, 40, 100]);
      announce('Correct mixture. Ignition. Liftoff!');
      later(() => {
        $('hangar').classList.add('launch-blackout');
        later(flightCinematic, 800);
      }, 4500);
    } else {
      const stage = $('hangar');
      stage.classList.add('failed-liftoff', 'failure-resting');
      playSound('noseClose');
      announce('Launch aborted. Watch the damaged engine. Returning to the pad.');
      haptic(35);
      later(() => {
        playSound('blast');
        engines(game.run.engines);
        stage.classList.add('engine-failure');
        haptic([100, 60, 100]);
      }, 1150);
      later(() => stage.classList.remove('failed-liftoff'), 3000);
      $('instruction').textContent = game.attempt.outcome === 'timeout' ? 'Time expired. Engine lost.' : 'Incorrect mixture. Engine lost.';
      later(() => {
        playSound('wrong');
        if (game.phase === 'failed') popup('Mission failed', 'All three engines are out. Restart this mission with three fresh engines.', 'page-7-3/mission-failed-panel.webp', 'Retry mission', brief);
        else popup('Engine failure', `${game.attempt.outcome === 'timeout' ? 'Time ran out.' : 'That mixture was incorrect.'} ${game.run.engines} engine${game.run.engines === 1 ? '' : 's'} remain. Review the lesson, then retry the same question.`, 'page-7-1/engine-failed-panel.webp', 'Watch video', video);
      }, 3100);
    }
  }
  function positionGamePopup() {
    const dialog = $('popup');
    if ((!dialog.classList.contains('engine-popup') && !dialog.classList.contains('video-popup')) || !$('hangar').getBoundingClientRect) return;
    const bounds = $('hangar').getBoundingClientRect();
    for (const key of ['left', 'top', 'width', 'height']) dialog.style.setProperty(`--popup-${key}`, `${bounds[key]}px`);
    if (dialog.classList.contains('video-popup')) {
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop || 0;
      const top = Math.max(viewportTop, bounds.top);
      const bottom = Math.min(viewportTop + (viewport?.height || window.innerHeight || bounds.height), bounds.top + bounds.height);
      dialog.style.setProperty('--popup-top', `${top}px`);
      dialog.style.setProperty('--popup-height', `${Math.max(0, bottom - top)}px`);
    }
  }
  window.addEventListener('resize', positionGamePopup);
  window.addEventListener('scroll', positionGamePopup, { passive: true });
  function popup(title, text, art, action, fn) {
    stopHold(); $('popup-title').textContent = title; $('popup-text').textContent = text;
    const enginePanel = art === 'page-7-1/engine-failed-panel.webp';
    const retryPanel = art === 'page-7-2/retry-panel.webp';
    const missionFailedPanel = art === 'page-7-3/mission-failed-panel.webp';
    const artOnly = enginePanel || retryPanel || missionFailedPanel;
    $('popup').classList.toggle('engine-popup', enginePanel || missionFailedPanel);
    $('popup').classList.toggle('retry-popup', retryPanel);
    $('popup').classList.toggle('mission-failed-popup', missionFailedPanel);
    $('popup').classList.remove('video-popup');
    positionGamePopup();
    $('popup-title').hidden = artOnly;
    $('popup-text').hidden = artOnly;
    $('popup').setAttribute('aria-label', title);
    $('popup-art').hidden = !art; if (art) $('popup-art').src = base + art;
    $('lesson').hidden = true; $('lesson').pause();
    $('popup-action').textContent = action; popupAction = fn;
    if (!$('popup').open) $('popup').showModal();
    $('popup-action').focus();
  }
  function video() {
    const source = recipes[game.question.recipeId].video;
    game.run.events.push({ type: 'lesson-opened', at: new Date().toISOString(), questionId: game.question.id, attemptId: game.attempt.id, available: Boolean(source) }); persist();
    popup(source ? 'Review the solution' : 'Video coming soon', source ? 'Watch the lesson before your next attempt.' : 'The lesson video will be added here. You can retry now.', '', 'Continue', retryPopup);
    if (source) {
      $('popup').classList.add('video-popup');
      $('popup-title').textContent = recipes[game.question.recipeId].name;
      $('popup').setAttribute('aria-label', `${recipes[game.question.recipeId].name} lesson`);
      $('popup-text').hidden = true;
      positionGamePopup();
      $('lesson').hidden = false; $('lesson').src = source; $('lesson').currentTime = 0;
      $('lesson').play().catch(() => {});
    }
  }
  function retryPopup() {
    popup('Ready for another try?', 'The chamber will be emptied and the countdown will restart. Engine damage remains for this mission.', 'page-7-2/retry-panel.webp', 'Retry', () => {
      if (game.phase !== 'failure') return;
      const stage = $('hangar');
      stage.classList.remove('failure-resting', 'engine-failure');
      stage.classList.add('retry-preparing', 'retry-station');
      playSound('noseOpen');
      later(() => {
        stage.classList.remove('retry-preparing');
        if (game.retry()) { persist(); filling(); }
      }, 1550);
    });
  }
  let penaltyRunId = null, lastShownEngines = 3;
  function flightCinematic() {
    const rocket = $('cinematic-rocket');
    rocket.dataset.variant = String(game.rocket);
    rocket.innerHTML = `<img class="rocket-top" src="${base}page-5/rocket-${game.rocket}-top.webp" alt=""><img class="rocket-bottom" src="${base}page-5/rocket-${game.rocket}-bottom.webp" alt=""><div class="flames" aria-hidden="true">${[0, 1, 2].map(i => `<i class="${i >= game.run.engines ? 'dead' : ''}"></i>`).join('')}</div>`;
    const scene = $('cinematic'), engines = game.run.engines;
    if (penaltyRunId !== game.run.id) { penaltyRunId = game.run.id; lastShownEngines = 3; }
    const showPenalty = engines < lastShownEngines;
    const factor = engines === 3 ? 1 : engines === 2 ? .67 : .34;
    const saved = game.attempt.timeSaved;
    scene.classList.remove('hovering', 'accelerating', 'rewards-exit', 'bonus-boost');
    scene.style.setProperty('--far-star-duration', `${5 / factor}s`);
    scene.style.setProperty('--near-star-duration', `${1.7 / factor}s`);
    $('flight-penalty').hidden = true;
    $('flight-bonus').hidden = true;
    $('flight-engines').textContent = `${engines} ENGINES ACTIVE`;
    $('flight-speed').textContent = `SPEED \u2212${engines === 2 ? 33 : 66}%`;
    show('cinematic', true);
    announce('Rocket in flight. Accelerating toward the destination.');
    if (showPenalty) later(() => { $('flight-penalty').hidden = false; lastShownEngines = engines; }, 1200);
    if (saved > 0) later(() => {
      $('flight-bonus').hidden = false;
      playSound('numbers');
      const started = performance.now();
      function countBonus() {
        const progress = Math.min(1, (performance.now() - started) / 650);
        const value = saved * (1 - Math.pow(1 - progress, 3));
        $('flight-saved').textContent = `${value.toFixed(1)}s SAVED`;
        $('flight-distance').textContent = `BONUS DISTANCE +${value.toFixed(1)}%`;
        if (progress < 1) later(countBonus, 30);
        else stopSound('numbers');
      }
      countBonus();
    }, showPenalty ? 2000 : 1600);
    later(() => $('cinematic').classList.add('hovering'), 2400);
    later(() => {
      $('cinematic').classList.remove('hovering');
      $('cinematic').classList.add('accelerating');
      scene.classList.add('rewards-exit');
      if (saved > 0) scene.classList.add('bonus-boost');
    }, 3400);
    later(journey, 6500);
  }
  function animateJourneyRoute() {
    const target = Math.min(1, game.run.distance / game.mission.distance);
    const previous = Math.max(0, (game.run.distance - game.attempt.appliedDistance) / game.mission.distance);
    // Arc-length lookup: equal distance increments occupy equal lengths of the curve.
    const points = []; let length = 0;
    for (let i = 0; i <= 200; i++) {
      const t = i / 200, u = 1 - t;
      const x = u*u*u*20 + 3*u*u*t*12 + 3*u*t*t*44 + t*t*t*81;
      const y = u*u*u*147.556 + 3*u*u*t*101 + 3*u*t*t*64 + t*t*t*41.778;
      if (i) length += Math.hypot(x - points[i-1].x, y - points[i-1].y);
      points.push({ x, y, distance: length });
    }
    function frame(fraction) {
      const distance = fraction * length;
      const index = Math.max(1, points.findIndex(p => p.distance >= distance));
      const a = points[index - 1], b = points[index];
      const ratio = (distance - a.distance) / (b.distance - a.distance);
      const x = a.x + (b.x-a.x)*ratio, y = a.y + (b.y-a.y)*ratio;
      const angle = Math.atan2(b.y-a.y, b.x-a.x)*180/Math.PI + 90;
      return { left: `${x}%`, top: `${y/177.778*100}%`, transform: `translate(-50%,-50%) rotate(${angle}deg)` };
    }
    const rocket = $('journey-rocket'), trail = $('route-covered');
    rocket.dataset.from = String(previous); rocket.dataset.to = String(target);
    Object.assign(rocket.style, frame(previous));
    trail.style.strokeDashoffset = String(1-previous);
    $('continue').disabled = true;
    later(() => {
      const frames = Array.from({length:61}, (_, i) => frame(previous + (target-previous)*i/60));
      playSound('route');
      const animation = animateScene(rocket, frames, {duration:2600, easing:'cubic-bezier(.4,0,.2,1)', fill:'forwards'});
      const pathAnimation = animateScene(trail, [{strokeDashoffset:1-previous},{strokeDashoffset:1-target}], {duration:2600,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
      later(() => {
        Object.assign(rocket.style, frame(target)); trail.style.strokeDashoffset = String(1-target);
        animation?.cancel(); pathAnimation?.cancel();
        rocket.classList.add('route-arrived');
        stopSound('route');
        rocket.classList.remove('route-flying');
        if (game.run.status === 'completed') {
          $('journey-title').hidden = false;
          $('journey').classList.add('destination-reached');
          announce(`Journey complete! Welcome to ${game.mission.destination}!`);
        }
        animateJourneyStats();
      }, 2600);
    }, 700);
    rocket.classList.remove('route-arrived');
    rocket.classList.add('route-flying');
  }
  function animateJourneyStats() {
    playSound('numbers');
    $('journey-stats').hidden = false;
    $('journey-stats').classList.add('counting');
    const started = performance.now();
    function tick() {
      const progress = Math.min(1, (performance.now() - started) / 1400);
      renderJourneyStats(1 - Math.pow(1 - progress, 3));
      if (progress < 1) later(tick, 30);
      else {
        $('journey-stats').classList.remove('counting');
        stopSound('numbers');
        $('continue').disabled = false;
      }
    }
    tick();
  }
  function renderJourneyStats(fraction) {
    const m = game.mission, a = game.attempt;
    $('journey-stats').innerHTML = [
      ['Distance travelled', `${fmt(a.appliedDistance * fraction)} km`],
      ['Distance remaining', `${fmt((m.distance - game.run.distance) * fraction)} km`],
      ['Time saved', seconds(a.timeSaved * fraction)],
      ['Speed', `${fmt(a.speed * fraction)} miles`]
    ].map(([label, value]) => `<div class="journey-stat"><dt>${label}</dt><dd>${value}</dd></div>`).join('');
  }
  function journey() {
    show('journey'); const m = game.mission, a = game.attempt;
    $('journey').style.backgroundImage = `url('${base}page-6/page-6-bg-${m.id + 1}.webp')`;
    $('planet-route').innerHTML = ['Earth', 'Venus', 'Mars', 'Mercury', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].map((p, i) => `<span class="${i <= m.id + 1 ? 'active' : ''}">${p}</span>`).join('');
    $('journey-route').textContent = `${m.origin} \u2192 ${m.destination}`;
    $('journey-title').textContent = 'Yay! Journey complete!';
    $('journey-title').hidden = true;
    $('journey').classList.remove('destination-reached');
    $('journey-stats').hidden = true;
    $('journey-stats').classList.remove('counting');
    $('distance-progress').value = game.run.distance / m.distance * 100;
    renderJourneyStats(0);
    animateJourneyRoute();
    $('continue').textContent = 'Continue mission';
    $('continue').setAttribute('aria-label', game.run.status === 'completed' ? 'Continue to mission results' : 'Continue mission to the next question');
  }
  function complete() {
    show('complete'); const m = game.mission;
    $('complete-title').textContent = m.id === 6 ? "You've reached Neptune! Solar journey complete!" : `You've reached ${m.destination}! Get ready for your next mission!`;
    const distance = game.run.distance, inputSeconds = game.run.inputSeconds;
    $('complete-distance').textContent = '0 km';
    $('complete-time').textContent = seconds(0);
    later(() => {
      playSound('numbers');
      const started = performance.now();
      function count() {
        const progress = Math.min(1, (performance.now() - started) / 1500);
        const eased = 1 - Math.pow(1 - progress, 3);
        $('complete-distance').textContent = `${fmt(distance * eased)} km`;
        $('complete-time').textContent = seconds(inputSeconds * eased);
        if (progress < 1) later(count, 30);
        else stopSound('numbers');
      }
      count();
    }, 700);
    $('next-mission').setAttribute('aria-label', m.id === 6 ? 'Back to Games' : 'Next mission');
  }
  $('start').addEventListener('click', () => { if (window.RocketPreload && !window.RocketPreload.ready) return; brief(); });
  function missionPopup() {
    game.startMission(); persist(); show('mission');
    $('mission-title').textContent = `Mission ${game.mission.id + 1}`;
    $('mission-route').textContent = `${game.mission.origin} \u2192 ${game.mission.destination}`;
    $('mission-distance').textContent = fmt(game.mission.distance);
    $('mission-destination').textContent = game.mission.destination;
  }
  $('start-mission').addEventListener('click', missionPopup);
  $('play').addEventListener('click', hangar);
  $('launch').addEventListener('click', () => { if (transferPending) return; stopHold(); game.submit(); processOutcome(); });
  $('continue').addEventListener('click', () => {
    if (game.run.status === 'completed') complete();
    else { game.nextQuestion(); persist(); hangar(); }
  });
  $('next-mission').addEventListener('click', () => { if (game.mission.id === 6) location.href = 'index.html#/games'; else missionPopup(); });
  $('popup-action').addEventListener('click', () => { const fn = popupAction; $('lesson').pause(); $('popup').close(); fn?.(); });
  $('popup').addEventListener('cancel', event => event.preventDefault());
  $('lesson').addEventListener('error', () => { $('lesson').hidden = true; $('popup-text').hidden = false; $('popup-text').textContent = 'Video unavailable. You can continue to retry.'; });
  document.addEventListener('click', event => { if (event.target.closest('button,a')) haptic(); });
  document.addEventListener('pointerdown', event => { if (event.button === 0) buttonSound(event); }, true);
  if (!window.PointerEvent) {
    let lastTouchSound = -1000;
    document.addEventListener('touchstart', event => { lastTouchSound = performance.now(); buttonSound(event); }, { capture: true, passive: true });
    document.addEventListener('mousedown', event => { if (event.button === 0 && performance.now() - lastTouchSound > 700) buttonSound(event); }, true);
  }
  window.addEventListener('pointerup', stopHold);
  window.addEventListener('pointercancel', stopHold);
  window.addEventListener('touchend', stopHold);
  window.addEventListener('touchcancel', stopHold);
  window.addEventListener('mouseup', stopHold);
  window.visualViewport?.addEventListener('resize', () => { positionGamePopup(); alignFuelSystem(); });
  document.addEventListener('click', event => { if (event.detail === 0) buttonSound(event); }, true);
  function silenceSounds() { for (const name of sounds.keys()) stopSound(name); }
  window.addEventListener('blur', () => { stopHold(); silenceSounds(); });
  document.addEventListener('visibilitychange', () => { stopHold(); if (document.hidden) { silenceSounds(); $('lesson').pause(); persist(); } });
  window.addEventListener('pagehide', () => {
    silenceSounds();
    $('lesson').pause();
    if (game.phase === 'fill') {
      game.attempt.lastElapsedSeconds = game.elapsed;
      game.attempt.events.push({ type: 'page-hidden', elapsedSeconds: game.elapsed, at: new Date().toISOString() });
    }
    persist();
  });
  if (storageFailed) warn();
  // Do not overwrite a possible IndexedDB recovery before its read completes.
  if (saved) persist();
})();

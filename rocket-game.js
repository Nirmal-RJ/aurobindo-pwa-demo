(() => {
  'use strict';
  const { Game, missions, recipes, chemicals, increment } = window.RocketGame;
  const $ = id => document.getElementById(id);
  const base = 'assets/rocket-game-assets/';
  const key = 'aurobindo.rocketier.v1';
  const names = { Water: 'Water', ACN: 'ACN', MeOH: 'MeOH' };
  // Match liquid-sort's active gameplay palette.
  const colors = { Water: '#00cfff', ACN: '#b627ed', MeOH: '#ffbf25' };
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
      if (i === blown) later(() => el.classList.remove('blowing'), 880);
    });
  }
  function clearTransfers() {
    clearTimeout(transferTimer); transferPending = false;
    $('chamber-liquid').classList.remove('is-mixing');
    pipeTimers.forEach(timer => clearTimeout(timer)); pipeTimers.clear();
    chemicals.forEach(c => { const path = $(`pipe-flow-${c}`); if (path) path.dataset.flow = ''; const core = $(`pipe-core-${c}`); if (core) core.dataset.flow = ''; });
  }
  function updateLaunch() {
    const ready = game.phase === 'fill' && game.total === 100 && !transferPending;
    $('launch').disabled = !ready;
    $('launch').hidden = !ready;
    $('launch').classList.toggle('launch-ready', ready);
    $('launch').setAttribute('aria-label', ready ? 'Mixture full. Launch rocket' : 'Launch when mixing chamber is full');
  }
  function animateTransfer(chemical, undo) {
    transferPending = true;
    clearTimeout(transferTimer);
    const flow = $(`pipe-flow-${chemical}`);
    flow.dataset.flow = undo ? 'reverse' : 'forward';
    const core = $(`pipe-core-${chemical}`); core.dataset.flow = flow.dataset.flow;
    clearTimeout(pipeTimers.get(chemical));
    pipeTimers.set(chemical, setTimeout(() => { flow.dataset.flow = ''; core.dataset.flow = ''; pipeTimers.delete(chemical); }, 650));
    $('chamber-liquid').classList.add('is-mixing');
    transferTimer = setTimeout(() => {
      transferPending = false;
      $('chamber-liquid').classList.remove('is-mixing');
      updateLaunch();
    }, 650);
  }
  function renderMixture() {
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
        button.setPointerCapture?.(event.pointerId); change();
        if (game.phase === 'fill' && game.total < 100) hold = setInterval(change, 350);
      });
      button.addEventListener('pointerup', stopHold);
      button.addEventListener('pointercancel', stopHold);
      button.addEventListener('lostpointercapture', stopHold);
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
    $('question-number').textContent = `${game.mission.origin} → ${game.mission.destination} · QUESTION ${game.run.questions.length}`;
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
    $('instruction').textContent = 'Moving your rocket to the launch pad?';
    const sourceRect = button.querySelector?.('.rocket-model')?.getBoundingClientRect();
    rocket.dataset.variant = String(game.rocket);
    $('rocket-top').src = `${base}page-5/rocket-${game.rocket}-top.webp`;
    $('rocket-bottom').src = `${base}page-5/rocket-${game.rocket}-bottom.webp`;
    rocket.hidden = false;
    const targetRect = rocket.getBoundingClientRect?.();
    button.style.visibility = 'hidden';
    let travel, camera;
    if (sourceRect && targetRect && targetRect.width && targetRect.height && rocket.animate) {
      const dx = sourceRect.left - targetRect.left;
      const dy = sourceRect.top - targetRect.top;
      // Two endpoints only: the centre, size and every rocket part interpolate
      // along one straight path, with no overshoot, bounce or second placement.
      travel = rocket.animate([
        { transform: `translate(${dx}px,${dy}px) scale(${sourceRect.width / targetRect.width},${sourceRect.height / targetRect.height})` },
        { transform: 'translate(0,0) scale(1,1)' }
      ], { duration: travelMs, easing: 'linear', fill: 'both' });
      camera = scenery.animate([
        { transform: 'scale(1)' }, { transform: 'scale(1.22)' }
      ], { duration: travelMs, easing: 'linear', fill: 'both' });
    }
    makeTanks();
    // The same scenery and the same split rocket stay on screen throughout.
    // Only the camera scale changes; there is no page-4/page-5 image handoff.
    later(() => {
      scenery.style.transform = 'scale(1.22)';
      travel?.cancel(); camera?.cancel();
      $('conveyor').hidden = true;
      stage.classList.remove('selecting');
      stage.classList.add('docked');
      haptic(25);
      later(() => {
        $('question-title').hidden = false;
        announce(`Fuel formula: ${game.recipe.name}. Read the rocket panel before filling.`);
        stage.classList.add('filling');
        later(() => {
          $('fuel-system').hidden = false;
          alignFuelSystem();
          renderMixture();
          later(() => {
            stage.classList.remove('boarding');
            game.beginAttempt(); persist(); filling();
          }, tanksMs);
        }, openMs);
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
    if (visualAttemptId !== game.attempt.id) { clearTransfers(); visualAttemptId = game.attempt.id; }
    $('hangar').classList.remove('engine-failure');
    $('instruction').textContent = 'Hold Fill · Undo one step · Launch at 100%';
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
      engines();
      $('instruction').textContent = 'Perfect mixture. Ignition!';
      $('hangar').classList.remove('filling'); $('hangar').classList.add('launching'); haptic([40, 40, 100]);
      announce('Correct mixture. Ignition. Liftoff!');
      later(() => {
        $('hangar').classList.add('launch-blackout');
        later(flightCinematic, 800);
      }, 3700);
    } else {
      const stage = $('hangar');
      stage.classList.add('failed-liftoff');
      announce('Launch aborted. Watch the damaged engine. Returning to the pad.');
      haptic(35);
      later(() => {
        engines(game.run.engines);
        stage.classList.add('engine-failure');
        haptic([100, 60, 100]);
      }, 1150);
      later(() => stage.classList.remove('failed-liftoff'), 3000);
      $('instruction').textContent = game.attempt.outcome === 'timeout' ? 'Time expired. Engine lost.' : 'Incorrect mixture. Engine lost.';
      later(() => {
        if (game.phase === 'failed') popup('Mission failed', 'All three engines are out. Restart this mission with three fresh engines.', 'page-7-3/mission-failed-panel.webp', 'Retry mission', brief);
        else popup('Engine failure', `${game.attempt.outcome === 'timeout' ? 'Time ran out.' : 'That mixture was incorrect.'} ${game.run.engines} engine${game.run.engines === 1 ? '' : 's'} remain. Review the lesson, then retry the same question.`, 'page-7-1/engine-failed-panel.webp', 'Watch video', video);
      }, 3100);
    }
  }
  function positionGamePopup() {
    const dialog = $('popup');
    if (!dialog.classList.contains('engine-popup') || !$('hangar').getBoundingClientRect) return;
    const bounds = $('hangar').getBoundingClientRect();
    for (const key of ['left', 'top', 'width', 'height']) dialog.style.setProperty(`--popup-${key}`, `${bounds[key]}px`);
  }
  window.addEventListener('resize', positionGamePopup);
  window.addEventListener('scroll', positionGamePopup, { passive: true });
  function popup(title, text, art, action, fn) {
    stopHold(); $('popup-title').textContent = title; $('popup-text').textContent = text;
    const enginePanel = art === 'page-7-1/engine-failed-panel.webp';
    const retryPanel = art === 'page-7-2/retry-panel.webp';
    const artOnly = enginePanel || retryPanel;
    $('popup').classList.toggle('engine-popup', enginePanel);
    $('popup').classList.toggle('retry-popup', retryPanel);
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
    popup(source ? 'Review the solution' : 'Video coming soon', source ? 'Watch the lesson before your next attempt.' : 'The lesson video will be added here. You can retry now.', '', 'Continue to retry', retryPopup);
    if (source) {
      $('lesson').hidden = false; $('lesson').src = source;
      $('lesson').play().catch(() => {});
    }
  }
  function retryPopup() {
    popup('Ready for another try?', 'The chamber will be emptied and the countdown will restart. Engine damage remains for this mission.', 'page-7-2/retry-panel.webp', 'Retry', () => {
      if (game.retry()) { persist(); filling(); }
    });
  }
  function flightCinematic() {
    const rocket = $('cinematic-rocket');
    rocket.dataset.variant = String(game.rocket);
    rocket.innerHTML = `<img class="rocket-top" src="${base}page-5/rocket-${game.rocket}-top.webp" alt=""><img class="rocket-bottom" src="${base}page-5/rocket-${game.rocket}-bottom.webp" alt=""><div class="flames" aria-hidden="true">${[0, 1, 2].map(i => `<i class="${i >= game.run.engines ? 'dead' : ''}"></i>`).join('')}</div>`;
    $('cinematic').classList.remove('hovering', 'accelerating');
    show('cinematic', true);
    announce('Rocket in flight. Accelerating toward the destination.');
    later(() => $('cinematic').classList.add('hovering'), 2400);
    later(() => {
      $('cinematic').classList.remove('hovering');
      $('cinematic').classList.add('accelerating');
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
      const animation = rocket.animate?.(frames, {duration:2600, easing:'cubic-bezier(.4,0,.2,1)', fill:'forwards'});
      const pathAnimation = trail.animate?.([{strokeDashoffset:1-previous},{strokeDashoffset:1-target}], {duration:2600,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
      later(() => {
        Object.assign(rocket.style, frame(target)); trail.style.strokeDashoffset = String(1-target);
        animation?.cancel(); pathAnimation?.cancel();
        rocket.classList.add('route-arrived');
        $('continue').disabled = false;
      }, 2600);
    }, 700);
    rocket.classList.remove('route-arrived');
  }
  function journey() {
    show('journey'); const m = game.mission, a = game.attempt;
    $('journey').style.backgroundImage = `url('${base}page-6/page-6-bg-${m.id + 1}.webp')`;
    $('planet-route').innerHTML = ['Earth', 'Venus', 'Mars', 'Mercury', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].map((p, i) => `<span class="${i <= m.id + 1 ? 'active' : ''}">${p}</span>`).join('');
    $('journey-route').textContent = `${m.origin} → ${m.destination}`;
    $('journey-title').textContent = game.run.status === 'completed' ? 'Yay! Mission complete!' : 'Yay! Journey complete!';
    $('distance-progress').value = game.run.distance / m.distance * 100;
    $('journey-stats').innerHTML = [
      ['Distance travelled', `${fmt(a.appliedDistance)} km`],
      ['Distance remaining', `${fmt(m.distance - game.run.distance)} km`],
      ['Time saved', seconds(a.timeSaved)],
      ['Speed', `${fmt(a.speed)} miles`]
    ].map(([label, value]) => `<div class="journey-stat"><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    animateJourneyRoute();
    $('continue').textContent = 'Continue mission';
    $('continue').setAttribute('aria-label', game.run.status === 'completed' ? 'Continue to mission results' : 'Continue mission to the next question');
  }
  function complete() {
    show('complete'); const m = game.mission;
    $('complete-title').textContent = m.id === 6 ? 'Solar journey complete!' : `Welcome to ${m.destination}!`;
    $('complete-details').textContent = `${fmt(game.run.distance)} km travelled · ${seconds(game.run.inputSeconds)} input time · ${game.run.questions.reduce((n, q) => n + q.attempts.length, 0)} attempts`;
    $('stars').textContent = `${'★'.repeat(m.stars)} Mission award · ${game.stars}/10 total stars`;
    $('next-mission').textContent = m.id === 6 ? 'Back to Games' : 'Next mission →';
  }
  $('start').addEventListener('click', brief);
  $('start-mission').addEventListener('click', () => {
    game.startMission(); persist(); show('mission');
    $('mission-title').textContent = `Mission ${game.mission.id + 1}`;
    $('mission-route').textContent = `${game.mission.origin} → ${game.mission.destination}`;
    $('mission-distance').textContent = fmt(game.mission.distance);
    $('mission-destination').textContent = game.mission.destination;
  });
  $('play').addEventListener('click', hangar);
  $('launch').addEventListener('click', () => { if (transferPending) return; stopHold(); game.submit(); processOutcome(); });
  $('continue').addEventListener('click', () => {
    if (game.run.status === 'completed') complete();
    else { game.nextQuestion(); persist(); hangar(); }
  });
  $('next-mission').addEventListener('click', () => { if (game.mission.id === 6) location.href = 'index.html#/games'; else brief(); });
  $('popup-action').addEventListener('click', () => { const fn = popupAction; $('lesson').pause(); $('popup').close(); fn?.(); });
  $('popup').addEventListener('cancel', event => event.preventDefault());
  $('lesson').addEventListener('error', () => { $('lesson').hidden = true; $('popup-text').textContent = 'Video unavailable. You can continue to retry.'; });
  $('export').addEventListener('click', () => {
    persist(); const url = URL.createObjectURL(new Blob([JSON.stringify(game.data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `rocketier-history-${Date.now()}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.addEventListener('click', event => { if (event.target.closest('button,a')) haptic(); });
  window.addEventListener('blur', stopHold);
  document.addEventListener('visibilitychange', () => { stopHold(); if (document.hidden) persist(); });
  window.addEventListener('pagehide', () => {
    if (game.phase === 'fill') {
      game.attempt.lastElapsedSeconds = game.elapsed;
      game.attempt.events.push({ type: 'page-hidden', elapsedSeconds: game.elapsed, at: new Date().toISOString() });
    }
    persist();
  });
  if (storageFailed) warn();
  // Do not overwrite a possible IndexedDB recovery before its read completes.
  if (saved) persist();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();

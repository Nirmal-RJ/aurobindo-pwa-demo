/* Chemical names, not formulas alone, identify bottles (isomers can share a formula). */
const SampleGame = (() => {
  'use strict';
  const rows = [
    [['Water', 'H₂O'], ['Hydrogen Peroxide', 'H₂O₂'], ['Heavy Water', 'D₂O']],
    [['Methanol', 'CH₃OH'], ['Ethanol', 'C₂H₅OH'], ['1-Propanol', 'C₃H₈O']],
    [['Acetonitrile', 'CH₃CN'], ['Acrylonitrile', 'C₃H₃N'], ['Acetamide', 'CH₃CONH₂']],
    [['Isopropanol', 'C₃H₈O'], ['1-Propanol', 'C₃H₈O'], ['Propylene Glycol', 'C₃H₈O₂']],
    [['Ethanol', 'C₂H₅OH'], ['Methanol', 'CH₃OH'], ['Ethylene Glycol', 'C₂H₆O₂']],
    [['Acetic Acid', 'CH₃COOH'], ['Formic Acid', 'HCOOH'], ['Propionic Acid', 'C₂H₅COOH']],
    [['Formic Acid', 'HCOOH'], ['Acetic Acid', 'CH₃COOH'], ['Oxalic Acid', 'C₂H₂O₄']],
    [['Phosphoric Acid', 'H₃PO₄'], ['Phosphorous Acid', 'H₃PO₃'], ['Sulfuric Acid', 'H₂SO₄']],
    [['Ammonium Acetate', 'CH₃COONH₄'], ['Ammonium Formate', 'HCOONH₄'], ['Sodium Acetate', 'CH₃COONa']],
    [['Sodium Phosphate', 'Na₃PO₄'], ['Sodium Phosphite', 'Na₃PO₃'], ['Potassium Phosphate', 'K₃PO₄']]
  ];
  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function makeRound(random = Math.random) {
    const chosen = shuffle(rows, random).slice(0, 3);
    const chemicals = new Map();
    // One bottle for every distinct chemical, including all confusing alternatives.
    rows.flat().forEach(([name, formula]) => chemicals.set(name, { name, formula }));
    return { targets: chosen.map(row => ({ name: row[0][0], formula: row[0][1] })), bottles: shuffle([...chemicals.values()], random) };
  }
  class Round {
    constructor(random) {
      Object.assign(this, makeRound(random));
      this.phase = 'memorize'; this.remaining = 60000; this.listRemaining = 3000;
      this.recallUsed = false; this.selected = new Map(); this.found = 0; this.misses = 0; this.score = 0;
      this.bench = [];
    }
    advance(milliseconds) {
      let elapsed = Math.max(0, milliseconds);
      if (this.phase === 'memorize') {
        const used = Math.min(elapsed, this.listRemaining);
        this.listRemaining -= used; elapsed -= used;
        if (this.listRemaining === 0) this.phase = 'playing';
      }
      if (this.phase !== 'playing') return;
      this.remaining = Math.max(0, this.remaining - elapsed);
      this.listRemaining = Math.max(0, this.listRemaining - elapsed);
      if (!this.remaining) this.phase = 'results';
    }
    recall() {
      if (this.phase !== 'playing' || this.recallUsed) return false;
      this.recallUsed = true; this.listRemaining = 3000; return true;
    }
    select(name) {
      if (this.phase !== 'playing' || this.selected.has(name) || !this.bottles.some(item => item.name === name || item.formula === name)) return null;
      const bottle = this.bottles.find(item => item.name === name || item.formula === name);
      const correct = this.targets.some(item => item.name === bottle.name);
      this.selected.set(bottle.name, correct);
      if (!this.bench.some(b => b.name === bottle.name) && this.bench.length < 3) {
        this.bench.push(bottle);
      }
      if (correct) this.found++;
      else this.misses++;
      this.score = Math.max(0, this.found * 100 - this.misses * 25);
      if (this.found === 3) this.phase = 'results';
      return correct;
    }
  }
  return { Round, makeRound, rows };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = SampleGame;

if (typeof document !== 'undefined') (() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const video = $('video');
  const portrait = window.matchMedia('(orientation: portrait)');
  const assetRoot = 'assets/sample-preparation-game-assets/';
  let round = null, phase = 'intro', paused = false, briefingActive = false, lastTime = performance.now(), blackoutRemaining = 0;
  let noteDelayRemaining = 0, pageAway = false, assetsReady = null, generation = 0, isReplay = false;

  function show(view) {
    $('app').dataset.view = view;
    ['intro', 'walkthrough', 'game', 'results'].forEach(id => { $(id).hidden = id !== view; });
  }
  async function exitToPortrait(targetUrl) {
    try {
      sessionStorage.setItem('aurobindo-force-portrait', '1');
    } catch (_) {}

    // On Android, lock to portrait BEFORE exiting fullscreen (Chrome allows lock only while fullscreen/standalone)
    if (screen.orientation && typeof screen.orientation.lock === 'function') {
      try {
        await screen.orientation.lock('portrait').catch(() => {});
      } catch (_) {}
    }

    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    } catch (_) {}

    if (targetUrl) {
      location.href = targetUrl;
    }
  }
  function updateFullscreenButtons() {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    const label = isFs ? 'Exit full screen' : 'Full screen';
    if ($('fullscreen')) $('fullscreen').textContent = label;
    if ($('game-fullscreen')) $('game-fullscreen').textContent = label;
  }
  function toggleFullscreen() {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (isFs) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      return;
    }
    const docEl = document.documentElement;
    const requestFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.webkitRequestFullScreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
    if (requestFs) {
      try {
        const req = requestFs.call(docEl);
        Promise.resolve(req).then(() => {
          screen.orientation?.lock?.('landscape').catch(() => {});
        }).catch(() => {});
      } catch (_) {}
    } else {
      const isStandalone = window.navigator?.standalone || window.matchMedia?.('(display-mode: standalone)')?.matches;
      if (isStandalone) {
        if ($('feedback')) $('feedback').textContent = 'Already running in full screen standalone mode.';
      } else {
        const help = $('fullscreen-help');
        const msg = $('fullscreen-help-message');
        if (help && msg) {
          msg.innerHTML = 'To play without browser bars on iPhone:<br><br>' +
            '1. Tap the <strong>Share</strong> button (box with arrow) in Safari.<br>' +
            '2. Select <strong>Add to Home Screen</strong>.<br>' +
            '3. Launch the app from your home screen for full immersion!<br><br>' +
            '<em>Tip: In Safari, tap the <strong>aA</strong> icon in the address bar and select <strong>Hide Toolbar</strong>.</em>';
          help.hidden = false;
        }
      }
    }
  }
  function loadAssets() {
    if (!assetsReady) assetsReady = Promise.all(['bg-img.png', 'bottle 1.png', 'bottle 2.png', 'bottle 3.png'].map(file => new Promise((resolve, reject) => {
      const img = new Image(); img.onload = resolve; img.onerror = reject; img.src = assetRoot + file;
    }))).catch(error => { assetsReady = null; throw error; });
    return assetsReady;
  }
  function playVideo() {
    if (phase !== 'video' || paused) return;
    $('video-recovery').hidden = true;
    video.muted = true;
    const playing = video.play();
    playing?.catch(() => {
      if (phase !== 'video') return;
      $('video-message').textContent = 'Tap to play the silent walkthrough.';
      $('resume-video').hidden = false; $('continue-video').hidden = true;
      $('video-recovery').hidden = false;
    });
  }
  function setStatus(text) {
    const el = $('load-status');
    if (el) el.textContent = text;
  }
  async function start() {
    if (paused || phase === 'loading') return;
    const current = ++generation;
    phase = 'loading'; show('intro'); $('start').disabled = true;
    setStatus('Preparing the laboratory…');
    const fade = $('scene-fade');
    if (fade) fade.dataset.dark = 'false';
    try { await loadAssets(); }
    catch (_) {
      if (current !== generation) return;
      phase = 'intro'; $('start').disabled = false;
      setStatus('The lab images could not load. Check your connection and tap Start game to retry.');
      return;
    }
    if (current !== generation) return;
    round = new SampleGame.Round();
    noteDelayRemaining = 0;
    briefingActive = true;
    if ($('game-briefing')) $('game-briefing').hidden = true;
    lastBenchKey = null;
    buildBottles(); buildList(); renderBench();
    $('start').disabled = false; setStatus('A silent lab walkthrough plays before every round.');
    $('walkthrough').classList.remove('blackout');
    const skipBtn = $('skip-video');
    if (skipBtn) skipBtn.hidden = !isReplay;
    $('video-recovery').hidden = true; video.load(); video.currentTime = 0;
    phase = 'video'; show('walkthrough'); lastTime = performance.now(); playVideo();
  }
  function videoEnded() {
    if (phase !== 'video') return;
    const skipBtn = $('skip-video');
    if (skipBtn) skipBtn.hidden = true;
    video.pause(); phase = 'blackout'; blackoutRemaining = 450;
    const fade = $('scene-fade');
    if (fade) fade.dataset.dark = 'true';
    $('video-recovery').hidden = true; $('walkthrough').classList.add('blackout');
    lastTime = performance.now();
  }
  function bottleType(chemical, index) {
    return /Ammonium|Sodium|Potassium|Acetamide/.test(chemical.name) ? 3 : index % 2 + 1;
  }

  let zoomScale = 1, panX = 0, panY = 0, wasPinchOrPan = false;

  function applyZoom(animated = false) {
    const lab = $('lab');
    if (!lab) return;
    const scene = (lab.querySelector && lab.querySelector('.shelf-scene')) || lab;

    const rect = typeof lab.getBoundingClientRect === 'function'
      ? lab.getBoundingClientRect()
      : { left: 0, top: 0, width: lab.clientWidth || 1000, height: lab.clientHeight || 500 };
    const labWidth = rect.width || lab.clientWidth || 1000;
    const labHeight = rect.height || lab.clientHeight || 500;

    zoomScale = Math.max(1, Math.min(3, zoomScale));

    if (zoomScale <= 1.001) {
      zoomScale = 1;
      panX = 0;
      panY = 0;
    } else {
      const minPanX = labWidth * (1 - zoomScale);
      const minPanY = labHeight * (1 - zoomScale);
      panX = Math.max(minPanX, Math.min(0, panX));
      panY = Math.max(minPanY, Math.min(0, panY));
    }

    if (!scene.style) scene.style = {};
    scene.style.transformOrigin = '0 0';
    scene.style.transition = animated ? 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)' : 'none';
    scene.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoomScale})`;

    const zoomInBtn = $('zoom-in');
    const zoomOutBtn = $('zoom-out');
    const zoomResetBtn = $('zoom-reset');
    if (zoomInBtn) zoomInBtn.disabled = zoomScale >= 2.95;
    if (zoomOutBtn) zoomOutBtn.disabled = zoomScale <= 1.05;
    if (zoomResetBtn) {
      zoomResetBtn.hidden = zoomScale <= 1.05;
      zoomResetBtn.textContent = `${zoomScale.toFixed(1)}x ↺`;
    }
  }

  function zoomAt(newScale, clientX, clientY, animated = false) {
    const lab = $('lab');
    if (!lab) return;
    const rect = typeof lab.getBoundingClientRect === 'function'
      ? lab.getBoundingClientRect()
      : { left: 0, top: 0, width: lab.clientWidth || 1000, height: lab.clientHeight || 500 };

    newScale = Math.max(1, Math.min(3, newScale));
    if (newScale === zoomScale && newScale === 1) return;

    const currentScale = zoomScale;
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    panX = relX - ((relX - panX) / currentScale) * newScale;
    panY = relY - ((relY - panY) / currentScale) * newScale;
    zoomScale = newScale;

    applyZoom(animated);
  }

  function resetZoom(animated = true) {
    zoomScale = 1;
    panX = 0;
    panY = 0;
    applyZoom(animated);
  }

  function buildBottles() {
    $('lab').scrollLeft = 0;
    resetZoom(false);
    $('bottles').replaceChildren();
    round.bottles.forEach((chemical, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'bottle';
      button.dataset.name = chemical.name;
      button.dataset.formula = chemical.formula;
      button.setAttribute('aria-label', `Sample ${chemical.formula}`);
      const img = document.createElement('img'); img.src = assetRoot + `bottle ${bottleType(chemical, index)}.png`; img.alt = ''; img.draggable = false;
      const label = document.createElement('span'); label.className = 'bottle-label';
      const formula = document.createElement('span'); formula.className = 'bottle-formula'; formula.textContent = chemical.formula;
      if (chemical.formula.length >= 8) formula.classList.add('formula-long');
      else if (chemical.formula.length >= 6) formula.classList.add('formula-medium');
      label.append(formula);
      button.append(img, label);
      button.addEventListener('click', () => selectBottle(chemical));
      $('bottles').append(button);
    });
  }
  function buildList() {
    $('targets').replaceChildren();
    round.targets.forEach(chemical => {
      const li = document.createElement('li');
      li.textContent = chemical.formula;
      li.dataset.formula = chemical.formula;
      li.dataset.name = chemical.name;
      $('targets').append(li);
    });
    $('feedback').textContent = 'Entering laboratory. Lab notes arriving…';
  }
  function selectBottle(chemical) {
    tick();
    if (briefingActive || wasPinchOrPan || paused || phase !== 'game' || round.phase !== 'playing') return;
    const existingIndex = round.bench.findIndex(b => b.name === chemical.name || b.formula === chemical.formula);
    if (existingIndex !== -1) {
      round.bench.splice(existingIndex, 1);
      $('feedback').textContent = `Sample returned to shelf. ${round.bench.length} of 3 samples on bench.`;
      render();
      return;
    }
    if (round.bench.length >= 3) {
      $('feedback').textContent = 'Bench is full (3/3). Tap a bottle on the bench to return it, or check samples.';
      return;
    }
    const bIndex = round.bottles.findIndex(b => b.name === chemical.name);
    const bType = bottleType(chemical, bIndex >= 0 ? bIndex : 0);
    round.bench.push({ name: chemical.name, formula: chemical.formula, bottleType: bType });
    round.select(chemical.name);
    if (round.bench.length === 3) {
      $('feedback').textContent = '3 samples on bench. Checking selection…';
      render();
      checkSamples();
    } else {
      $('feedback').textContent = `${round.bench.length} of 3 samples placed on bench.`;
      render();
    }
  }
  function checkSamples() {
    if (!round) return;
    results();
  }
  let lastBenchKey = null;
  function renderBench() {
    const tray = $('table-tray');
    if (!tray) return;
    const benchKey = round && round.bench ? round.bench.map(b => b.name).join('|') : '';
    if (benchKey === lastBenchKey) return;
    lastBenchKey = benchKey;
    tray.replaceChildren();
    for (let i = 0; i < 3; i++) {
      const bottle = round && round.bench ? round.bench[i] : null;
      if (bottle) {
        const item = document.createElement('div');
        item.className = 'bench-slot filled';
        item.setAttribute('data-slot', String(i + 1));
        const bottleEl = document.createElement('div');
        bottleEl.className = 'bench-bottle';
        bottleEl.setAttribute('role', 'button');
        bottleEl.setAttribute('tabindex', '0');
        bottleEl.setAttribute('aria-label', `Sample ${bottle.formula} on bench. Tap to return to shelf.`);
        const img = document.createElement('img');
        img.src = assetRoot + `bottle ${bottle.bottleType}.png`;
        img.alt = ''; img.draggable = false;
        const label = document.createElement('span');
        label.className = 'bottle-label';
        const formula = document.createElement('span');
        formula.className = 'bottle-formula';
        formula.textContent = bottle.formula;
        if (bottle.formula.length >= 8) formula.classList.add('formula-long');
        else if (bottle.formula.length >= 6) formula.classList.add('formula-medium');
        label.append(formula);
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'bench-remove-btn';
        removeBtn.setAttribute('aria-label', `Remove sample ${bottle.formula}`);
        removeBtn.textContent = '×';
        bottleEl.append(img, label, removeBtn);
        const slotIdx = i;
        bottleEl.addEventListener('click', () => {
          if (phase !== 'game' || round.phase !== 'playing') return;
          round.bench.splice(slotIdx, 1);
          $('feedback').textContent = `Sample returned to shelf. ${round.bench.length} of 3 samples placed.`;
          render();
        });
        item.append(bottleEl);
        tray.append(item);
      } else {
        const slot = document.createElement('div');
        slot.className = 'bench-slot empty';
        slot.setAttribute('data-slot', String(i + 1));
        tray.append(slot);
      }
    }
  }
  function render() {
    if (!round) return;
    const benchCount = round.bench ? round.bench.length : 0;
    $('found').textContent = `${benchCount} / 3`;
    if ($('score')) $('score').textContent = round.score;
    $('time').textContent = `${Math.ceil(round.remaining / 1000)}s`;
    $('time').parentElement.classList.toggle('urgent', round.remaining <= 10000);
    const listVisible = !briefingActive && noteDelayRemaining <= 0 && round.listRemaining > 0;
    $('mission').dataset.open = String(listVisible);
    $('mission').setAttribute('aria-hidden', String(!listVisible));
    $('mission').inert = !listVisible;
    if (listVisible) $('list-countdown').textContent = `${Math.ceil(round.listRemaining / 1000)}s`;
    $('recall').setAttribute('aria-disabled', String(round.phase !== 'playing' || round.recallUsed));
    $('recall').setAttribute('aria-expanded', String(listVisible));
    $('recall').setAttribute('aria-label', round.recallUsed ? 'Lab notes used. No extra looks left.' : 'Open lab notes. One extra look available.');
    $('recall-count').textContent = round.recallUsed ? '0' : '1';
    $('recall-label').textContent = round.recallUsed ? 'Notes used' : 'Open notes';
    const checkBtn = $('check-samples');
    if (checkBtn) {
      checkBtn.hidden = false;
      checkBtn.disabled = round.phase !== 'playing' || benchCount === 0 || paused;
    }
    $('bottles').querySelectorAll('button').forEach(button => {
      const onBench = round.bench.some(b => b.name === button.dataset.name || b.formula === button.dataset.formula);
      button.disabled = briefingActive || round.phase !== 'playing' || paused;
      button.dataset.onBench = String(onBench);
      button.setAttribute('aria-pressed', String(onBench));
      button.setAttribute('aria-label', `Sample ${button.dataset.formula}${onBench ? ', placed on bench' : ''}`);
    });
    renderBench();
  }
  function results() {
    phase = 'results'; show('results');
    briefingActive = false;
    if ($('game-briefing')) $('game-briefing').hidden = true;
    resetZoom(false);
    const benchPicks = [...(round.bench || [])];
    const availablePicks = [...benchPicks];
    let matchCount = 0;

    const comparisons = round.targets.map((target, idx) => {
      const matchIdx = availablePicks.findIndex(p => p && (p.formula === target.formula || p.name === target.name));
      if (matchIdx !== -1) {
        const matchedPick = availablePicks.splice(matchIdx, 1)[0];
        matchCount++;
        return { target, pick: matchedPick, matched: true, slotIndex: idx };
      }
      const unmatchedPick = availablePicks.shift() || null;
      return { target, pick: unmatchedPick, matched: false, slotIndex: idx };
    });

    const isSuccess = matchCount === 3 && benchPicks.length === 3;
    const outcome = isSuccess ? 'success' : 'failed';

    round.score = isSuccess ? 300 : 0;
    round.found = matchCount;
    round.misses = 3 - matchCount;

    $('results').dataset.outcome = outcome;
    $('result-icon').textContent = isSuccess ? '✓' : '×';
    $('result-badge').textContent = isSuccess ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED';
    $('result-title').textContent = isSuccess ? 'All Samples Matched!' : 'Incorrect Samples Selected';
    $('result-message').textContent = isSuccess
      ? 'Outstanding precision! You correctly identified and retrieved all 3 required chemical formulas.'
      : 'One or more samples on your bench did not match the requested formulas. Compare your selection below and try again.';

    $('final-score').textContent = round.score;
    $('final-found').textContent = `${matchCount} / 3`;
    $('final-misses').textContent = `${3 - matchCount}`;

    $('review').replaceChildren();
    comparisons.forEach(comp => {
      const card = document.createElement('div');
      card.className = 'compare-card';
      card.dataset.status = comp.matched ? 'success' : 'failed';

      const header = document.createElement('div');
      header.className = 'compare-header';
      header.innerHTML = `<span class="slot-tag">SAMPLE 0${comp.slotIndex + 1}</span>` +
        `<span class="status-pill ${comp.matched ? 'pill-success' : 'pill-failed'}">${comp.matched ? '✓ MATCHED' : '✗ MISMATCH'}</span>`;

      const body = document.createElement('div');
      body.className = 'compare-body';

      const targetCol = document.createElement('div');
      targetCol.className = 'compare-col target-col';
      targetCol.innerHTML = `
        <span class="compare-col-label">REQUESTED</span>
        <div class="compare-bottle-box">
          <img src="${assetRoot}bottle ${bottleType(comp.target, comp.slotIndex)}.png" alt="" class="compare-img">
          <span class="compare-formula-tag">${comp.target.formula}</span>
        </div>
      `;

      const vs = document.createElement('div');
      vs.className = 'compare-vs';
      vs.textContent = 'VS';

      const pickCol = document.createElement('div');
      pickCol.className = 'compare-col pick-col';
      if (comp.pick) {
        pickCol.innerHTML = `
          <span class="compare-col-label">YOUR BENCH</span>
          <div class="compare-bottle-box">
            <img src="${assetRoot}bottle ${comp.pick.bottleType || 1}.png" alt="" class="compare-img">
            <span class="compare-formula-tag ${comp.matched ? 'tag-correct' : 'tag-wrong'}">${comp.pick.formula}</span>
          </div>
        `;
      } else {
        pickCol.innerHTML = `
          <span class="compare-col-label">YOUR BENCH</span>
          <div class="compare-bottle-box empty-box">
            <span class="empty-icon">∅</span>
            <span class="compare-formula-tag tag-empty">Not selected</span>
          </div>
        `;
      }

      body.append(targetCol, vs, pickCol);
      card.append(header, body);
      $('review').append(card);
    });

    $('result-title').focus({ preventScroll: true });
  }
  function tick() {
    const now = performance.now(); const elapsed = now - lastTime; lastTime = now;
    if (paused) return;
    if (phase === 'blackout') {
      blackoutRemaining -= elapsed;
      if (blackoutRemaining <= 0) {
        phase = 'game';
        briefingActive = true;
        noteDelayRemaining = 0;
        show('game');
        if ($('game-briefing')) $('game-briefing').hidden = false;
        $('ready-start')?.focus?.({ preventScroll: true });
        render();
        const fade = $('scene-fade');
        if (fade) fade.dataset.dark = 'false';
        $('feedback').textContent = 'Laboratory ready. Tap "Show list & start" when you are ready to memorise.';
      }
      return;
    }
    if (phase !== 'game' || briefingActive) return;
    if (noteDelayRemaining > 0) {
      const consumed = Math.min(noteDelayRemaining, elapsed);
      noteDelayRemaining -= consumed;
      if (noteDelayRemaining <= 0) {
        $('feedback').textContent = 'Study your formulas. The timer starts next.';
      }
      const leftover = elapsed - consumed;
      if (leftover > 0) {
        const wasMemorizing = round.phase === 'memorize';
        round.advance(leftover);
        if (wasMemorizing && round.phase === 'playing') $('feedback').textContent = 'Find the three formulas. Select 3 to place on your bench.';
      }
      render();
      if (round.phase === 'results') results();
      return;
    }
    const wasMemorizing = round.phase === 'memorize';
    round.advance(elapsed);
    if (wasMemorizing && round.phase === 'playing') $('feedback').textContent = 'Find the three formulas. Select 3 to place on your bench.';
    render();
    if (round.phase === 'results') results();
  }
  function syncPause() {
    tick();
    const next = portrait.matches || document.hidden || pageAway;
    const wasPaused = paused; paused = next; lastTime = performance.now();
    $('app').dataset.paused = String(paused);
    $('rotate').hidden = !portrait.matches;
    $('app').inert = portrait.matches;
    if (phase === 'video') {
      if (paused) video.pause();
      else if (wasPaused) playVideo();
    }
    render();
  }
  $('start').addEventListener('click', () => { isReplay = false; return start(); });
  $('replay').addEventListener('click', () => { isReplay = true; return start(); });
  $('ready-start')?.addEventListener('click', () => {
    if (!briefingActive || phase !== 'game') return;
    briefingActive = false;
    if ($('game-briefing')) $('game-briefing').hidden = true;
    noteDelayRemaining = 1000;
    lastTime = performance.now();
    $('feedback').textContent = 'Study your formulas. The timer starts next.';
    render();
  });
  $('skip-video')?.addEventListener('click', () => {
    if (phase === 'video') videoEnded();
  });
  $('fullscreen').addEventListener('click', toggleFullscreen);
  $('game-fullscreen').addEventListener('click', toggleFullscreen);
  $('check-samples')?.addEventListener('click', () => { if (round && round.phase === 'playing') checkSamples(); });
  $('close-fullscreen-help')?.addEventListener('click', () => {
    if ($('fullscreen-help')) $('fullscreen-help').hidden = true;
  });
  document.addEventListener('fullscreenchange', updateFullscreenButtons);
  document.addEventListener('webkitfullscreenchange', updateFullscreenButtons);
  $('recall').addEventListener('click', () => {
    tick();
    if (paused || phase !== 'game') return;
    noteDelayRemaining = 0;
    if (round.recall()) $('feedback').textContent = 'Your final look. The countdown keeps running.';
    else $('feedback').textContent = round.recallUsed ? 'You have used your extra look. Select the formulas from memory.' : 'Your initial list is still visible. Save your extra look for later.';
    render();
  });
  if (typeof document.querySelectorAll === 'function') {
    document.querySelectorAll('a[href*="sample-preparation"], .game-exit, .back, .secondary, .rotate a').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        exitToPortrait(link.href);
      });
    });
  }
  window.addEventListener('beforeunload', () => { exitToPortrait(); });
  video.addEventListener('ended', videoEnded);
  function videoError() {
    if (phase !== 'video') return;
    $('video-message').textContent = 'The walkthrough could not load. You can still play the game.';
    $('resume-video').hidden = true; $('continue-video').hidden = false; $('video-recovery').hidden = false;
  }
  video.addEventListener('error', videoError); video.querySelector('source').addEventListener('error', videoError);
  $('resume-video').addEventListener('click', playVideo); $('continue-video').addEventListener('click', videoEnded);
  portrait.addEventListener('change', syncPause);
  document.addEventListener('visibilitychange', syncPause);
  window.addEventListener('pagehide', () => { pageAway = true; syncPause(); video.pause(); exitToPortrait(); });
  window.addEventListener('pageshow', () => { pageAway = false; syncPause(); });
  function setupZoom() {
    const lab = $('lab');
    if (!lab || !lab.addEventListener) return;

    let startDist = 0;
    let startScale = 1;
    let startMidX = 0;
    let startMidY = 0;
    let startPanX = 0;
    let startPanY = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;
    let lastTapTime = 0;
    let gestureEndTimer = null;

    function markGesturing() {
      wasPinchOrPan = true;
      if (gestureEndTimer) clearTimeout(gestureEndTimer);
    }

    function endGesturing() {
      if (gestureEndTimer) clearTimeout(gestureEndTimer);
      gestureEndTimer = setTimeout(() => {
        wasPinchOrPan = false;
      }, 120);
    }

    // Touch events for mobile (Android & iPhone)
    lab.addEventListener('touchstart', e => {
      const hint = $('zoom-hint');
      if (hint && hint.classList && !hint.classList.contains('fade-out')) hint.classList.add('fade-out');

      if (e.touches && e.touches.length === 2) {
        markGesturing();
        startDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        startScale = zoomScale;
        startMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        startMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        startPanX = panX;
        startPanY = panY;
        if (typeof e.preventDefault === 'function') e.preventDefault();
      } else if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        startPanX = panX;
        startPanY = panY;
        touchMoved = false;
      }
    }, { passive: false });

    lab.addEventListener('touchmove', e => {
      if (e.touches && e.touches.length === 2) {
        markGesturing();
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (startDist > 0) {
          const factor = currentDist / startDist;
          const targetScale = Math.max(1, Math.min(3, startScale * factor));
          const currentMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const currentMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

          const rect = typeof lab.getBoundingClientRect === 'function'
            ? lab.getBoundingClientRect()
            : { left: 0, top: 0, width: lab.clientWidth || 1000, height: lab.clientHeight || 500 };
          const relMidX = startMidX - rect.left;
          const relMidY = startMidY - rect.top;

          panX = relMidX - ((relMidX - startPanX) / startScale) * targetScale + (currentMidX - startMidX);
          panY = relMidY - ((relMidY - startPanY) / startScale) * targetScale + (currentMidY - startMidY);
          zoomScale = targetScale;
          applyZoom(false);
        }
        if (typeof e.preventDefault === 'function') e.preventDefault();
      } else if (e.touches && e.touches.length === 1 && zoomScale > 1.05) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        if (Math.hypot(dx, dy) > 6) {
          touchMoved = true;
          markGesturing();
          panX = startPanX + dx;
          panY = startPanY + dy;
          applyZoom(false);
          if (typeof e.preventDefault === 'function') e.preventDefault();
        }
      }
    }, { passive: false });

    lab.addEventListener('touchend', e => {
      if (e.touches && e.touches.length === 0) {
        if (touchMoved || startDist > 0) {
          applyZoom(true);
          endGesturing();
          startDist = 0;
        }
        const now = performance.now();
        const isDoubleTap = (now - lastTapTime < 320) && !touchMoved && !wasPinchOrPan;
        lastTapTime = now;
        if (isDoubleTap && e.changedTouches && e.changedTouches[0]) {
          const t = e.changedTouches[0];
          markGesturing();
          if (zoomScale > 1.2) {
            resetZoom(true);
          } else {
            zoomAt(2.2, t.clientX, t.clientY, true);
          }
          endGesturing();
        }
      } else if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        startPanX = panX;
        startPanY = panY;
        touchMoved = false;
        startDist = 0;
      }
    });

    lab.addEventListener('touchcancel', () => {
      applyZoom(true);
      endGesturing();
      startDist = 0;
    });

    // iOS Safari gesture events
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(evName => {
      lab.addEventListener(evName, e => {
        if (typeof e.preventDefault === 'function') e.preventDefault();
      }, { passive: false });
    });

    // Mouse wheel zoom
    lab.addEventListener('wheel', e => {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      const delta = (e.deltaY || 0) < 0 ? 0.35 : -0.35;
      zoomAt(zoomScale + delta, e.clientX || 0, e.clientY || 0, true);
    }, { passive: false });

    // Mouse drag to pan when zoomed in
    let isMouseDown = false;
    let mouseStartX = 0;
    let mouseStartY = 0;
    let mousePanStartX = 0;
    let mousePanStartY = 0;

    lab.addEventListener('mousedown', e => {
      if (zoomScale > 1.05 && e.button === 0) {
        isMouseDown = true;
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
        mousePanStartX = panX;
        mousePanStartY = panY;
      }
    });

    window.addEventListener('mousemove', e => {
      if (isMouseDown) {
        const dx = e.clientX - mouseStartX;
        const dy = e.clientY - mouseStartY;
        if (Math.hypot(dx, dy) > 5) {
          markGesturing();
          panX = mousePanStartX + dx;
          panY = mousePanStartY + dy;
          applyZoom(false);
        }
      }
    });

    window.addEventListener('mouseup', () => {
      if (isMouseDown) {
        isMouseDown = false;
        applyZoom(true);
        endGesturing();
      }
    });

    // Floating UI Buttons (+, -, Reset)
    $('zoom-in')?.addEventListener('click', e => {
      e?.stopPropagation?.();
      const rect = typeof lab.getBoundingClientRect === 'function' ? lab.getBoundingClientRect() : { left: 0, top: 0, width: 1000, height: 500 };
      zoomAt(zoomScale + 0.6, rect.left + rect.width / 2, rect.top + rect.height / 2, true);
    });

    $('zoom-out')?.addEventListener('click', e => {
      e?.stopPropagation?.();
      const rect = typeof lab.getBoundingClientRect === 'function' ? lab.getBoundingClientRect() : { left: 0, top: 0, width: 1000, height: 500 };
      zoomAt(zoomScale - 0.6, rect.left + rect.width / 2, rect.top + rect.height / 2, true);
    });

    $('zoom-reset')?.addEventListener('click', e => {
      e?.stopPropagation?.();
      resetZoom(true);
    });

    window.addEventListener('resize', () => {
      applyZoom(false);
    });

    applyZoom(false);
  }

  setupZoom();
  syncPause(); setInterval(tick, 100);
  loadAssets().catch(() => {});
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();

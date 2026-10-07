(() => {
  'use strict';
  if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
    navigator.serviceWorker.getRegistration().then(registration => registration?.update()).catch(() => {});
  }
  const root = 'assets/audit-game-assets/';
  // Positions use the original 1672 × 941 artwork, preserving alignment at every size.
  const scenarios = [{
    background: `${root}page-1/1-bg.webp`, overlay: `${root}page-1/1-bg-stand-overlay.webp`,
    tubes: [566, 744, 926, 1106].map((x, i) => ({ id: i + 1, x: x - 51, y: 371, width: 102, height: 355, contaminated: false }))
  }, {
    background: `${root}page-2/2-bg.webp`, overlay: `${root}page-2/2-bg-overlay.webp`,
    overlayClip: 'polygon(23.2% 63.1%,76.8% 63.1%,76.8% 65%,23.2% 65%)',
    tubes: [500, 613, 723, 835, 949, 1059, 1175].map((x, i) => ({ id: i + 1, x: x - 40, y: 389, width: 80, height: 290, contaminated: false }))
  }, {
    background: `${root}page-3/3-bg.webp`, overlay: `${root}page-3/3-bg-overlay.webp`,
    overlayClip: 'path("M 684 284 H 946 V 294 H 684 Z M 683 514 H 973 V 528 H 683 Z")',
    tubes: [
      ...[725, 769, 814, 859, 903].map((x, i) => ({ id: i + 1, x: x - 16, y: 213, width: 32, height: 108, contaminated: false })),
      ...[721, 774, 827, 880, 932].map((x, i) => ({ id: i + 6, x: x - 19, y: 435, width: 38, height: 127, contaminated: false, variant: 2 }))
    ]
  }, {
    background: `${root}page-4/4-bg.webp`, overlay: `${root}page-4/4-overlay.webp`,
    overlayClip: 'path("M 690 100 H 968 V 111 H 690 Z M 684 284 H 946 V 294 H 684 Z M 683 514 H 973 V 528 H 683 Z")',
    tubes: [
      ...[725, 775, 829, 878, 928].map((x, i) => ({ id: i + 1, x: x - 16, y: 25, width: 32, height: 108, contaminated: false })),
      ...[725, 769, 814, 859, 903].map((x, i) => ({ id: i + 6, x: x - 16, y: 213, width: 32, height: 108, contaminated: false, variant: 2 })),
      ...[721, 774, 827, 880, 932].map((x, i) => ({ id: i + 11, x: x - 19, y: 435, width: 38, height: 127, contaminated: false, variant: 2 }))
    ]
  }];
  // Later levels alternate the two- and three-rack scenes, each with independent answers.
  for (const layoutIndex of [2, 3, 2, 3, 2, 3]) {
    scenarios.push({ ...scenarios[layoutIndex], tubes: scenarios[layoutIndex].tubes.map(tube => ({ ...tube })) });
  }
  const tubeImage = tube => `${root}${tube.contaminated ? (tube.variant === 2 ? 'contaminated-test-tube-2' : 'contaminated-test-tube') : 'empty-test-tube'}.webp`;
  function randomizeScenarios() {
    scenarios.forEach((scenario, scenarioIndex) => {
      const tubes = [...scenario.tubes];
      for (const tube of tubes) { tube.contaminated = false; tube.variant = 1; }
      // Include clean scenarios, with a higher possible count as the scene gets harder.
      const maximum = Math.min(Math.floor(tubes.length / 2), Math.ceil(tubes.length / 3) + Math.max(0, Math.floor((scenarioIndex - 2) / 2)));
      const count = scenarioIndex < 2 ? 1 : Math.floor(Math.random() * (maximum + 1));
      for (let i = tubes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tubes[i], tubes[j]] = [tubes[j], tubes[i]];
      }
      const firstVariant = Math.random() < .5 ? 1 : 2;
      tubes.slice(0, count).forEach((tube, index) => {
        tube.contaminated = true;
        tube.variant = scenarioIndex < 2 ? scenarioIndex + 1 : (index % 2 ? 3 - firstVariant : firstVariant);
      });
    });
  }
  const $ = id => document.getElementById(id);
  const scene = $('scene'), viewport = $('viewport');
  let current = 0, running = false, remaining = 90000, lastTick = performance.now();
  let reviewing = false;
  let selections = scenarios.map(() => new Set()), submitted = scenarios.map(() => false);
  let zoom = 1, panX = 0, panY = 0, base = 1, offsetX = 0, offsetY = 0;
  const pointers = new Map();
  let gesture = null, moved = false;
  let audioContext, audioBuffer, audioSource, audioLoading = false;
  function stopWarning() {
    if (audioSource) { try { audioSource.stop(); } catch (_) {} audioSource.disconnect(); audioSource = null; }
  }
  function prepareWarning() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      audioContext ||= new AudioContext();
      audioContext.resume().catch(() => {});
      if (!audioBuffer && !audioLoading) {
        audioLoading = true;
        fetch('audio/10s-timer-audio.wav').then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
          .then(bytes => audioContext.decodeAudioData(bytes)).then(buffer => { audioBuffer = buffer; })
          .catch(() => {}).finally(() => { audioLoading = false; });
      }
    } catch (_) {}
  }
  function warningSound() {
    if (!running || paused() || remaining > 10000 || remaining <= 0) { stopWarning(); return; }
    if (!audioBuffer || audioSource || audioContext.state !== 'running') return;
    const offset = (10000 - remaining) / 1000;
    if (offset >= audioBuffer.duration) return;
    audioSource = audioContext.createBufferSource(); audioSource.buffer = audioBuffer;
    audioSource.connect(audioContext.destination);
    audioSource.start(0, offset, Math.min(remaining / 1000, audioBuffer.duration - offset));
  }
  function paused() { return reviewing || innerHeight > innerWidth || document.hidden; }
  function advanceClock(now = performance.now()) {
    if (running && !paused()) remaining = Math.max(0, remaining - (now - lastTick));
    lastTick = now;
    $('seconds').textContent = Math.ceil(remaining / 1000);
    $('time-bar').style.width = `${remaining / 900}%`;
    $('clock').classList.toggle('urgent', remaining <= 10000);
    $('clock').classList.toggle('warning', remaining <= 20000 && remaining > 10000);
    $('clock').classList.toggle('ticking', running && !paused());
    $('game').classList.toggle('time-critical', running && !paused() && remaining <= 10000);
    warningSound();
    if (running && remaining === 0) finish();
  }
  function transform() {
    const w = viewport.clientWidth, h = viewport.clientHeight;
    base = Math.min(w / 1672, h / 941);
    const sw = 1672 * base * zoom, sh = 941 * base * zoom;
    panX = Math.max(-Math.max(0, (sw - w) / 2), Math.min(Math.max(0, (sw - w) / 2), panX));
    panY = Math.max(-Math.max(0, (sh - h) / 2), Math.min(Math.max(0, (sh - h) / 2), panY));
    offsetX = (w - sw) / 2 + panX; offsetY = (h - sh) / 2 + panY;
    scene.style.transform = `translate(${offsetX}px,${offsetY}px) scale(${base * zoom})`;
    $('zoom-reset').textContent = `${Number(zoom.toFixed(1))}×`;
    $('zoom-out').disabled = zoom <= 1; $('zoom-in').disabled = zoom >= 3;
  }
  function setZoom(value) { zoom = Math.max(1, Math.min(3, value)); transform(); }
  function render() {
    $('scene-sticker').hidden = true; $('scene-sticker').replaceChildren();
    scene.replaceChildren();
    const scenario = scenarios[current];
    const bg = new Image(); bg.src = scenario.background; bg.className = 'scene-bg'; bg.alt = ''; scene.append(bg);
    for (const tube of scenario.tubes) {
      const button = document.createElement('button'); button.className = 'tube'; button.type = 'button';
      button.style.cssText = `left:${tube.x}px;top:${tube.y}px;width:${tube.width}px;height:${tube.height}px`;
      button.setAttribute('aria-label', `Tube ${tube.id}`); button.setAttribute('aria-pressed', selections[current].has(tube.id));
      const image = new Image(); image.src = tubeImage(tube); image.alt = ''; image.draggable = false;
      image.style.width = `${tube.width * 244 / 102}px`;
      image.style.height = `${tube.height * 366 / 355}px`;
      image.style.top = `${tube.height * -8 / 355}px`;
      const check = document.createElement('span'); check.className = 'check'; check.textContent = '✓'; check.setAttribute('aria-hidden', 'true'); button.append(image, check);
      check.style.cssText = `width:${tube.width * .31}px;height:${tube.width * .31}px;font-size:${tube.width * .23}px;top:${tube.height * .034}px;right:${tube.width * .08}px`;
      button.addEventListener('click', () => {
        if (!running || paused() || moved) return;
        advanceClock(); if (!running) return;
        const selected = selections[current]; selected.has(tube.id) ? selected.delete(tube.id) : selected.add(tube.id);
        button.setAttribute('aria-pressed', selected.has(tube.id)); updateSelection();
      }); scene.append(button);
    }
    const overlay = new Image(); overlay.src = scenario.overlay; overlay.className = 'rack'; overlay.alt = ''; scene.append(overlay);
    if (scenario.overlayClip) overlay.style.clipPath = scenario.overlayClip;
    $('progress').textContent = `Scenario ${current + 1} / ${scenarios.length}`;
    // The fourth scene's top rack occupies the centered countdown's usual position.
    $('clock').style.left = scenario.background.includes('page-4/') ? 'calc(100% - clamp(90px, 12vw, 135px))' : '50%';
    zoom = 1; panX = panY = 0; transform(); updateSelection();
  }
  function updateSelection() { $('selected-count').textContent = `${selections[current].size} selected`; }
  function start() {
    randomizeScenarios();
    reviewing = false; $('game').classList.toggle('scene-review', false); $('scene-next').hidden = true; $('submit').hidden = false;
    $('selected-count').classList.toggle('feedback-correct', false); $('selected-count').classList.toggle('feedback-wrong', false);
    stopWarning(); prepareWarning();
    current = 0; remaining = 90000; selections = scenarios.map(() => new Set()); submitted = scenarios.map(() => false);
    $('intro').hidden = $('report').hidden = true; running = true; lastTick = performance.now();
    $('submit').disabled = false; render(); advanceClock();
  }
  function chips(ids, chosen = false) {
    if (!ids.length) return 'None';
    return ids.map(id => `<span class="answer-chip${chosen ? ' chosen' : ''}">Tube ${id}</span>`).join(' ');
  }
  function bacteria(caught, compact = false) {
    const bodyMotion = caught
      ? '<animateTransform attributeName="transform" type="translate" values="-3 0;3 2;-3 0;3 -2;-3 0" dur="0.7s" repeatCount="indefinite"/>'
      : '<animateTransform attributeName="transform" type="rotate" values="-14 150 205;14 150 205;-14 150 205" dur="0.6s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -18;0 0" dur="0.6s" additive="sum" repeatCount="indefinite"/>';
    const limbMotion = (x, y, reverse = false) => caught ? '' : `<animateTransform attributeName="transform" type="rotate" values="${reverse ? 32 : -32} ${x} ${y};${reverse ? -32 : 32} ${x} ${y};${reverse ? 32 : -32} ${x} ${y}" dur="0.45s" repeatCount="indefinite"/>`;
    return `<div class="bacteria-stage ${caught ? 'caught' : 'escaped'}${compact ? ' compact' : ''}" role="img" aria-label="${caught ? 'Arrested bacteria crying behind bars' : 'Escaped bacteria dancing with a silly smile'}">
      <div class="bacteria-orbit"></div><span class="party-note note-one" aria-hidden="true">♪</span><span class="party-note note-two" aria-hidden="true">♫</span>
      <svg class="bacteria-art native-motion" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse class="germ-shadow" cx="150" cy="252" rx="64" ry="10" fill="#071c3530"/>
        <g class="germ-character" stroke="#234933" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
          ${bodyMotion}
          <g class="germ-leg leg-left">${limbMotion(126, 199)}<path d="M126 199 Q112 223 119 243" fill="none"/><path d="M119 243 l-24 4" fill="none"/></g>
          <g class="germ-leg leg-right">${limbMotion(174, 199, true)}<path d="M174 199 Q187 222 182 242" fill="none"/><path d="M182 242 l25 4" fill="none"/></g>
          <g class="germ-arm arm-left">${limbMotion(92, 131, true)}<path d="M92 131 Q64 155 48 128 l-10 -14 M48 128 l-18 -1 M48 128 l-2 -22" fill="none"/></g>
          <g class="germ-arm arm-right">${limbMotion(208, 131)}<path d="M208 131 Q237 155 250 125 l10 -14 M250 125 l20 1 M250 125 l1 -22" fill="none"/></g>
          <path d="M110 79 l-11 -18 M146 67 l-1 -23 M184 80 l14 -20 M91 99 l-20 -9 M208 101 l22 -10 M91 174 l-20 10 M207 172 l22 13 M145 208 l-1 18" fill="none" stroke="#508a37" stroke-width="11"/>
          <path d="M151 66 C104 60 77 93 83 142 C78 189 110 216 151 207 C192 219 225 184 217 139 C224 92 194 61 151 66Z" fill="#a8df56"/>
          <path d="M104 101 Q109 83 132 81" fill="none" stroke="#e3ff9e" stroke-width="9"/>
          <g fill="#78b739" stroke="none"><circle cx="99" cy="153" r="7"/><circle cx="195" cy="110" r="6"/><circle cx="183" cy="188" r="8"/><circle cx="118" cy="186" r="4"/></g>
          <g class="happy-face">
            <ellipse cx="124" cy="119" rx="18" ry="24" fill="white" stroke-width="3"/><ellipse cx="174" cy="115" rx="18" ry="24" fill="white" stroke-width="3"/>
            <circle class="germ-pupil" cx="132" cy="122" r="7" fill="#183d32" stroke="none"/><circle class="germ-pupil" cx="168" cy="113" r="7" fill="#183d32" stroke="none"/>
            <path d="M116 152 Q151 191 187 146 Q179 186 150 184 Q126 182 116 152Z" fill="#193c30" stroke-width="3"/>
            <path d="M128 159 l12 8 7 -7 12 7 11 -12" fill="white" stroke="none"/><path d="M148 177 Q157 164 173 175" fill="#ff87a0" stroke="none"/>
          </g>
          <g class="sad-face">
            <path d="M108 103 l24 10 M190 103 l-24 10" fill="none"/>
            <path d="M109 125 q13 -12 25 0 M166 125 q13 -12 25 0" fill="none" stroke-width="5"/>
            <path d="M127 174 Q151 150 175 174" fill="none"/>
            <g fill="#51c6ff" stroke="#168dce" stroke-width="2"><g class="tear tear-left"><animateTransform attributeName="transform" type="translate" values="0 0;0 52" dur="0.9s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" dur="0.9s" repeatCount="indefinite"/><path d="M111 131 Q96 153 110 156 Q124 153 111 131Z"/></g><g class="tear tear-right"><animateTransform attributeName="transform" type="translate" values="0 0;0 52" dur="0.9s" begin="0.45s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" dur="0.9s" begin="0.45s" repeatCount="indefinite"/><path d="M188 131 Q173 153 187 156 Q201 153 188 131Z"/></g></g>
          </g>
        </g>
        <g class="prison-bars" stroke="#466277" stroke-width="9"><path d="M63 46 v198 M106 46 v198 M150 46 v198 M194 46 v198 M237 46 v198"/><path d="M56 49 H244 M56 238 H244" stroke="#6d8fa2" stroke-width="14"/><rect x="136" y="156" width="28" height="32" rx="5" fill="#ffd469" stroke="#9a7629" stroke-width="3"/><path d="M150 167 v9" stroke="#705323" stroke-width="4"/></g>
      </svg><span class="bacteria-stamp">${caught ? 'BUSTED!' : 'STILL FREE!'}</span>
    </div>`;
  }
  function evidence(scenario, selected) {
    return scenario.tubes.map((tube, index) => {
      const picked = selected.has(tube.id);
      const verdict = tube.contaminated ? (picked ? 'caught-tube' : 'missed-tube') : (picked ? 'false-tube' : 'clean-tube');
      const emission = tube.contaminated ? `<div class="tube-emission"><i class="emission-bubble bubble-one"></i><i class="emission-bubble bubble-two"></i><i class="emission-bubble bubble-three"></i><div class="emerging-germ">${bacteria(picked, true)}</div></div>` : '<div class="tube-emission clean-emission" aria-hidden="true"></div>';
      return `<div class="evidence-tube ${verdict}" style="--arrival:${index * .07}s">${emission}<div class="tube-platform"><div class="mini-tube"><img src="${tubeImage(tube)}" alt=""><span>${picked ? '✓' : tube.contaminated ? '!' : ''}</span></div></div><strong>Tube ${tube.id}</strong><small>${tube.contaminated ? (picked ? 'Arrested' : 'Escaped') : (picked ? 'Clean · selected' : 'Clean')}</small></div>`;
    }).join('');
  }
  function finish() {
    reviewing = false; $('report').classList.toggle('individual-report', false);
    $('report-next').hidden = true; $('replay').hidden = false;
    $('report-label').textContent = 'AUDIT COMPLETE';
    running = false; $('submit').disabled = true; pointers.clear();
    stopWarning(); $('clock').classList.toggle('ticking', false); $('game').classList.toggle('time-critical', false);
    let correctCount = 0, caughtCount = 0, totalContaminated = 0;
    $('report-results').innerHTML = scenarios.map((scenario, i) => {
      const correct = scenario.tubes.filter(t => t.contaminated).map(t => t.id), chosen = [...selections[i]].sort((a,b) => a-b);
      const answered = submitted[i] || (i === current && chosen.length > 0);
      const correctAnswer = answered && chosen.length === correct.length && correct.every(id => selections[i].has(id));
      if (correctAnswer) correctCount++;
      const caught = correct.filter(id => selections[i].has(id)).length;
      caughtCount += caught; totalContaminated += correct.length;
      return `<article class="report-row"><div class="case-heading"><strong>Scenario ${i + 1}</strong><span class="case-status ${correctAnswer ? 'passed' : 'failed'}">${correctAnswer ? '✓ Correct' : answered ? 'Review' : 'Unanswered'}</span></div><div class="case-evidence">${bacteria(caught === correct.length, true)}<div class="evidence-tubes">${evidence(scenario, selections[i])}</div></div><details class="case-details"><summary>Answer details</summary><p>Correct: ${chips(correct)}</p><p>Your selection: ${chips(chosen, true)}</p></details></article>`;
    }).join('');
    $('report-summary').textContent = `${correctCount} / ${scenarios.length} correct · ${remaining === 0 ? 'Time’s up' : `${Math.ceil((90000 - remaining) / 1000)}s used`}`;
    const allCaught = caughtCount === totalContaminated;
    $('report-mascot').innerHTML = totalContaminated ? bacteria(allCaught) : '<div class="clean-lab-seal" role="img" aria-label="No contamination detected">✓</div>';
    $('report-title').textContent = !totalContaminated ? 'All tubes clean!' : allCaught ? 'Bacteria busted!' : 'Bacteria on the loose!';
    $('report-caption').textContent = allCaught ? (correctCount === scenarios.length ? 'Case closed. Lab safe.' : 'Germs caught. Check the clean tubes, too.') : 'They’re celebrating. Time for a rematch.';
    if (!totalContaminated) $('report-caption').textContent = correctCount === scenarios.length ? 'Sharp eye. Nothing to arrest.' : 'No contamination. Check your selections.';
    $('report-stats').innerHTML = `<span><b>${caughtCount}</b> caught</span><span><b>${totalContaminated - caughtCount}</b> escaped</span>`;
    $('report').hidden = false; $('replay').focus();
  }
  $('submit').addEventListener('click', () => {
    if (!running || paused()) return;
    advanceClock(); if (!running) return;
    submitted[current] = true;
    showScenarioReport();
  });
  function showScenarioReport() {
    reviewing = true; wasPaused = true; lastTick = performance.now();
    stopWarning(); $('clock').classList.toggle('ticking', false); $('game').classList.toggle('time-critical', false);
    pointers.clear(); gesture = null;
    const scenario = scenarios[current], selected = selections[current];
    const correct = scenario.tubes.filter(t => t.contaminated);
    const correctAnswer = selected.size === correct.length && correct.every(t => selected.has(t.id));
    const stickers = correctAnswer
      ? ['Anna Nuvvu King Telugu.webp', 'Box Office Badhalu Kottav Telugu.webp', 'Kya Baat Hai Hindi.webp', 'Nailed It! English.webp', 'Shabaash Hindi.webp']
      : ['1.png', '2.png', '3.png', '4.png', '5.png'];
    const sticker = new Image();
    sticker.alt = correctAnswer ? 'Great job!' : 'Try the next one!';
    sticker.className = 'feedback-sticker sticker-loading';
    sticker.onload = () => { sticker.className = 'feedback-sticker'; };
    sticker.src = `assets/${correctAnswer ? 'positive' : 'negative'}-stickers/${encodeURIComponent(stickers[Math.floor(Math.random() * stickers.length)])}`;
    $('scene-sticker').replaceChildren(); $('scene-sticker').append(sticker); $('scene-sticker').hidden = false;
    $('game').classList.toggle('scene-review', true);
    $('selected-count').textContent = correctAnswer ? (correct.length ? '✓ Correct' : '✓ All clean') : '✕ Not quite';
    $('selected-count').classList.toggle('feedback-correct', correctAnswer);
    $('selected-count').classList.toggle('feedback-wrong', !correctAnswer);
    $('submit').hidden = true; $('scene-next').hidden = false;
    $('scene-next').textContent = current + 1 === scenarios.length ? 'View report →' : 'Next →';
    for (const tube of scenario.tubes) {
      const picked = selected.has(tube.id);
      if (!tube.contaminated && !picked) continue;
      const overlay = document.createElement('div'); overlay.className = 'scene-feedback';
      const size = Math.max(64, Math.min(130, tube.width * 1.8));
      // Counter-scale markers so they remain readable even on the small distant racks.
      const markerSize = Math.min(54, Math.max(38, viewport.clientHeight * .105));
      overlay.style.cssText = `left:${tube.x + tube.width / 2}px;top:${tube.y}px;--germ-size:${size}px;--germ-top:${Math.max(4 - tube.y, -size + 16)}px;--badge-top:${tube.height - 12 + (tube.width * base < 30 ? (tube.id % 2) * markerSize / base : 0)}px;--marker-size:${markerSize}px;--marker-scale:${1 / base}`;
      overlay.innerHTML = `${tube.contaminated ? `<div class="scene-germ">${bacteria(picked, true)}</div>` : ''}<span class="scene-verdict ${tube.contaminated && picked ? 'arrested' : 'escaped'}" role="img" aria-label="Tube ${tube.id}: ${tube.contaminated ? (picked ? 'caught' : 'missed') : 'incorrectly selected'}">${tube.contaminated ? (picked ? '✓' : '!') : '✕'}</span>`;
      scene.append(overlay);
    }
    $('scene-next').focus();
  }
  $('scene-next').addEventListener('click', () => {
    if (!reviewing || innerHeight > innerWidth || document.hidden) return;
    if (current + 1 === scenarios.length) { finish(); return; }
    reviewing = false; current++; lastTick = performance.now(); wasPaused = paused();
    $('game').classList.toggle('scene-review', false); $('scene-next').hidden = true; $('submit').hidden = false;
    $('selected-count').classList.toggle('feedback-correct', false); $('selected-count').classList.toggle('feedback-wrong', false);
    prepareWarning(); render(); advanceClock(); $('submit').focus();
  });
  $('start').addEventListener('click', start); $('replay').addEventListener('click', start);
  $('zoom-in').addEventListener('click', () => setZoom(zoom + .5));
  $('zoom-out').addEventListener('click', () => setZoom(zoom - .5));
  $('zoom-reset').addEventListener('click', () => { panX = panY = 0; setZoom(1); });
  viewport.addEventListener('wheel', e => { if (!running) return; e.preventDefault(); setZoom(zoom + (e.deltaY < 0 ? .2 : -.2)); }, { passive: false });
  viewport.addEventListener('pointerdown', e => {
    if (!running || innerHeight > innerWidth || document.hidden) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = false;
    gesture = { x: e.clientX, y: e.clientY, panX, panY, zoom };
    if (pointers.size === 2) { const [a,b] = [...pointers.values()]; gesture.distance = Math.hypot(a.x-b.x,a.y-b.y); moved = true; }
  });
  viewport.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId) || !gesture) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && gesture.distance) {
      const [a,b] = [...pointers.values()]; setZoom(gesture.zoom * Math.hypot(a.x-b.x,a.y-b.y) / gesture.distance); moved = true;
    } else if (pointers.size === 1) {
      const dx = e.clientX - gesture.x, dy = e.clientY - gesture.y;
      if (Math.hypot(dx,dy) > 8) { moved = true; panX = gesture.panX + dx; panY = gesture.panY + dy; transform(); }
    }
  });
  window.addEventListener('pointerup', e => { pointers.delete(e.pointerId); if (!pointers.size) gesture = null; });
  window.addEventListener('pointercancel', e => { pointers.delete(e.pointerId); gesture = null; moved = true; });
  let wasPaused = paused();
  function visibilityChanged() {
    const now = performance.now();
    if (running && !wasPaused) remaining = Math.max(0, remaining - (now - lastTick));
    lastTick = now; wasPaused = paused(); $('rotate').hidden = innerWidth >= innerHeight;
    pointers.clear(); gesture = null; transform(); advanceClock(now);
  }
  window.addEventListener('resize', visibilityChanged); document.addEventListener('visibilitychange', visibilityChanged);
  setInterval(advanceClock, 100);
  render(); visibilityChanged();
  const assets = [...new Set(scenarios.flatMap(s => [s.background,s.overlay]).concat([`${root}empty-test-tube.webp`,`${root}contaminated-test-tube.webp`, `${root}contaminated-test-tube-2.webp`, `${root}home-page-assets/bg.webp`, `${root}home-page-assets/play-button.webp`]))];
  Promise.all(assets.map(src => new Promise((resolve,reject) => { const image = new Image(); image.onload = resolve; image.onerror = reject; image.src = src; })))
    .then(() => { $('start').disabled = false; })
    .catch(() => {
      // Keep the artwork intact; the same Play control retries loading after a failure.
      $('start').disabled = false; $('start').setAttribute('aria-label', 'Reload game');
      $('start').addEventListener('click', () => location.reload(), { capture: true, once: true });
    });
})();

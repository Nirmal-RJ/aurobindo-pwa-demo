(() => {
  'use strict';
  const names = ['Sample Preparation','Mobile Phase Preparation','Instrument Setup','Method Setup','Analysis & Data Review'];
  const $ = id => document.getElementById(id);
  const list = $('steps');
  let order = [], active = false, remaining = 20000, previous = performance.now(), attempts = 0, drag = null;
  let phase = 'home', phaseRemaining = 0;
  function setMode(mode) {
    document.querySelector('.game-shell').setAttribute('data-phase', mode);
    $('go-cue').hidden = mode !== 'play';
    $('mode-label').textContent = mode === 'memorize' ? 'STUDY THE SEQUENCE' : mode === 'shuffle' ? 'GET READY' : '20 SECOND CHALLENGE';
    $('game-title').innerHTML = mode === 'memorize' ? 'Remember<br><em>the order.</em>' : mode === 'shuffle' ? 'Mixing<br><em>things up.</em>' : 'Your turn.<br><em>Beat the clock!</em>';
    $('game-hint').textContent = mode === 'memorize' ? 'Look closely. You have 5 seconds.' : mode === 'shuffle' ? 'Watch the steps move. Then take control.' : 'Drag the steps back into the right order.';
  }
  let soundContext, countdownBuffer, countdownSource, loadingAudio = false;
  function stopCountdown() {
    if (!countdownSource) return;
    try { countdownSource.stop(); } catch (_) {}
    countdownSource.disconnect(); countdownSource = null;
  }
  function prepareCountdown() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      soundContext ||= new AudioContext(); soundContext.resume().catch(() => {});
      if (!countdownBuffer && !loadingAudio) {
        loadingAudio = true;
        fetch('audio/10s-timer-audio.wav').then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
          .then(bytes => soundContext.decodeAudioData(bytes)).then(buffer => { countdownBuffer = buffer; })
          .catch(() => {}).finally(() => { loadingAudio = false; });
      }
    } catch (_) {}
  }
  function playCountdown() {
    if (!active || document.hidden || remaining > 10000 || remaining <= 0) { stopCountdown(); return; }
    if (!countdownBuffer || countdownSource || soundContext.state !== 'running') return;
    const offset = (10000 - remaining) / 1000;
    if (offset >= countdownBuffer.duration) return;
    countdownSource = soundContext.createBufferSource(); countdownSource.buffer = countdownBuffer;
    countdownSource.connect(soundContext.destination);
    countdownSource.start(0, offset, Math.min(remaining / 1000, countdownBuffer.duration - offset));
  }
  function shuffled() {
    const items = [0,1,2,3,4];
    for (let i = 4; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [items[i],items[j]] = [items[j],items[i]]; }
    if (items.every((id,index) => id === index)) [items[0],items[4]] = [items[4],items[0]];
    return items;
  }
  function tick() {
    const now = performance.now();
    const elapsed = now - previous;
    if (!document.hidden && ['memorize','shuffle'].includes(phase)) {
      phaseRemaining = Math.max(0, phaseRemaining - elapsed);
      if (phase === 'memorize') {
        const seconds = Math.ceil(phaseRemaining / 1000);
        $('feedback').textContent = `Remember the order · ${seconds}s`;
        if (seconds >= 1 && seconds <= 3 && $('game-title').dataset.countdown !== String(seconds)) {
          $('game-title').dataset.countdown = String(seconds);
          $('game-title').innerHTML = `Shuffle in <em class="countdown-number">${seconds}</em>`;
        }
      }
      if (phaseRemaining === 0) {
        if (phase === 'memorize') beginShuffle();
        else { phase = 'play'; setMode('play'); active = true; $('submit').disabled = false; $('submit').textContent = 'Submit →'; $('feedback').textContent = 'Your turn. Drag to reorder!'; }
      }
    } else if (active && !document.hidden) remaining = Math.max(0, remaining - elapsed);
    previous = now;
    $('seconds').textContent = phase === 'memorize' ? Math.ceil(phaseRemaining / 1000) : phase === 'shuffle' ? '…' : Math.ceil(remaining / 1000);
    $('time-fill').style.width = `${remaining / 200}%`;
    $('clock').classList.toggle('urgent', remaining <= 5000);
    $('clock').classList.toggle('warning', remaining <= 10000 && remaining > 5000);
    $('clock').classList.toggle('ticking', active && !document.hidden);
    playCountdown();
    if (active && remaining === 0) finish(false);
  }
  function clearDrag() { if (!drag) return; drag.node.classList.remove('dragging'); drag.ghost.remove(); drag = null; }
  function render() {
    list.replaceChildren();
    for (const [position,id] of order.entries()) {
      const row = document.createElement('li'); row.className = 'step'; row.dataset.id = id;
      row.innerHTML = `<span class="step-number">${position + 1}</span><span class="step-name">${names[id]}</span><button class="drag-handle" type="button" aria-label="Move ${names[id]}. Use up and down arrow keys.">⠿</button>`;
      row.addEventListener('pointerdown', e => {
        if (!active || e.button !== 0 || document.hidden) return;
        tick(); if (!active) return; e.preventDefault();
        clearDrag(); const rect = row.getBoundingClientRect(), ghost = row.cloneNode(true);
        ghost.classList.add('drag-ghost'); ghost.setAttribute('aria-hidden','true');
        ghost.style.width = `${rect.width}px`; ghost.style.left = `${rect.left}px`; ghost.style.top = `${rect.top}px`;
        document.body.append(ghost); row.classList.add('dragging');
        drag = { id, node:row, ghost, pointer:e.pointerId, startX:e.clientX, startY:e.clientY, left:rect.left, top:rect.top, initial:[...order] };
        row.setPointerCapture(e.pointerId);
      });
      row.addEventListener('pointermove', e => {
        if (!drag || drag.pointer !== e.pointerId || !active) return;
        drag.ghost.style.left = `${drag.left + e.clientX - drag.startX}px`;
        drag.ghost.style.top = `${drag.top + e.clientY - drag.startY}px`;
        const rows = [...list.children], index = rows.findIndex(item => e.clientY < item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2);
        const target = index < 0 ? rows.length - 1 : index;
        const from = order.indexOf(drag.id);
        if (target !== from) { order.splice(from,1); order.splice(target,0,drag.id); sync(); }
      });
      row.addEventListener('pointerup', () => { clearDrag(); });
      row.addEventListener('pointercancel', () => { if (drag) { order = drag.initial; clearDrag(); sync(); } });
      row.querySelector('button').addEventListener('keydown', e => {
        if (!active || !['ArrowUp','ArrowDown'].includes(e.key)) return;
        e.preventDefault(); tick(); if (!active) return;
        const from = order.indexOf(id), target = Math.max(0, Math.min(4, from + (e.key === 'ArrowUp' ? -1 : 1)));
        [order[from],order[target]] = [order[target],order[from]]; sync();
        $('feedback').textContent = `${names[id]} moved to step ${target + 1}.`;
      });
      list.append(row);
    }
  }
  function sync() {
    const rows = [...list.children];
    order.forEach((id,index) => { const row = rows.find(item => Number(item.dataset.id) === id); row.querySelector('.step-number').textContent = index + 1; list.append(row); });
    if (drag) drag.node.setPointerCapture(drag.pointer);
  }
  function start() {
    stopCountdown(); prepareCountdown();
    clearDrag(); order = [0,1,2,3,4]; remaining = 20000; attempts = 0; active = false; previous = performance.now();
    phase = 'memorize'; phaseRemaining = 5000; $('game-title').dataset.countdown = '';
    setMode('memorize');
    $('intro').hidden = $('instructions').hidden = $('result').hidden = true; $('submit').disabled = true; $('submit').textContent = 'Remember this order';
    $('feedback').classList.remove('wrong'); render(); tick();
  }
  function beginShuffle() {
    phase = 'shuffle'; phaseRemaining = 1200;
    setMode('shuffle');
    $('feedback').textContent = 'Mixing things up…'; $('submit').textContent = 'Shuffling…';
    const rows = [...list.children], positions = new Map(rows.map(row => [row, row.getBoundingClientRect().top]));
    order = shuffled(); sync();
    rows.forEach((row,index) => {
      const delta = positions.get(row) - row.getBoundingClientRect().top;
      if (row.animate) row.animate([{transform:`translateY(${delta}px) rotate(0deg)`},{transform:`translateY(${delta * .45}px) rotate(${index % 2 ? 3 : -3}deg)`,offset:.45},{transform:'translateY(0) rotate(0deg)'}], {duration:950,delay:index*40,easing:'cubic-bezier(.2,.7,.3,1)'});
    });
  }
  function showInstructions() {
    active = false; phase = 'instructions'; stopCountdown(); clearDrag();
    $('intro').hidden = $('result').hidden = true; $('instructions').hidden = false; $('memorize').focus();
  }
  function finish(won) {
    phase = 'report';
    stopCountdown();
    active = false; clearDrag(); $('submit').disabled = true;
    $('clock').classList.toggle('ticking', false);
    const score = order.filter((id,index) => id === index).length;
    $('result-icon').textContent = won ? '✓' : '⌛'; $('result-tag').textContent = won ? 'WORKFLOW MASTER' : 'TIME’S UP';
    $('result-title').textContent = won ? 'Perfect sequence!' : 'A little out of order.';
    $('result-summary').textContent = won ? `${Math.ceil((20000 - remaining) / 1000)}s used · ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}` : `${score} / 5 steps in the right place.`;
    $('correct-order').innerHTML = names.map(name => `<li>${name}</li>`).join('');
    $('your-order').innerHTML = order.map((id,index) => `<li class="${id === index ? 'in-place' : 'out-of-place'}"><span class="order-position">${index + 1}</span><span>${names[id]}</span><b aria-label="${id === index ? 'Correct position' : 'Wrong position'}">${id === index ? '✓' : '✕'}</b></li>`).join('');
    $('result').hidden = false; $('replay').focus();
    if (won) for (let i = 0; i < 28; i++) {
      const piece = document.createElement('i'); piece.className = 'confetti';
      piece.style.cssText = `left:${Math.random()*100}%;background:${['#ffce59','#67ad79','#84c8ce','#fa9293'][i%4]};animation-delay:${Math.random()*.6}s`;
      document.body.append(piece); setTimeout(() => piece.remove(),3500);
    }
  }
  $('submit').addEventListener('click', () => {
    if (!active || document.hidden) return; tick(); if (!active) return; clearDrag(); attempts++;
    finish(order.every((id,index) => id === index));
    if (remaining > 0 && !order.every((id,index) => id === index)) $('result-tag').textContent = 'SEQUENCE REVIEW';
  });
  $('start').addEventListener('click', showInstructions); $('replay').addEventListener('click', showInstructions);
  $('memorize').addEventListener('click', start);
  document.addEventListener('visibilitychange', () => { clearDrag(); previous = performance.now(); if (document.hidden) stopCountdown(); else { if (soundContext) soundContext.resume().catch(() => {}); playCountdown(); } });
  window.addEventListener('resize', clearDrag);
  setInterval(tick,100); order = [0,1,2,3,4]; render();
  if (navigator.serviceWorker) navigator.serviceWorker.getRegistration().then(reg => reg?.update()).catch(() => {});
})();

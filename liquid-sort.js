(() => {
  'use strict';
  const recipes = [
    { name: 'Column Cleaning', mix: { Water: 90, ACN: 5, MeOH: 5 } },
    { name: 'Strong Wash Solvent', mix: { Water: 20, ACN: 80, MeOH: 0 } },
    { name: 'Needle Wash Solvent', mix: { Water: 50, ACN: 0, MeOH: 50 } },
    { name: 'Column Storage (C18)', mix: { Water: 30, ACN: 70, MeOH: 0 } }
  ];
  const chemicals = ['Water', 'ACN', 'MeOH'];
  const recipeVideos = ['column-cleaning.mp4', 'strong-wash.mp4', 'needle-cleaning.mp4', 'column-storage.mp4'];
  const colors = { Water: 'var(--water)', ACN: 'var(--acn)', MeOH: 'var(--meoh)' };
  const $ = id => document.getElementById(id);
  const buttons = [...$('chemicals').querySelectorAll('[data-chemical]')];
  let index = 0, mixture = {}, layers = [], results = [], deadline = 0, interval = null, playing = false;
  let mode = 'intro', lessonTimer = null, lessonBusy = false, lessonComplete = false;
  const effects = new Set();
  let pourAudioContext = null, pourAudioBuffer = null, pourAudioLoading = null;
  const pourSounds = new Set();
  function preparePourAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      pourAudioContext ||= new AudioContext();
      pourAudioContext.resume().catch(() => {});
      if (!pourAudioLoading && !pourAudioBuffer) {
        pourAudioLoading = fetch('audio/pour-audio.mp3')
          .then(response => { if (!response.ok) throw new Error('Audio unavailable'); return response.arrayBuffer(); })
          .then(bytes => pourAudioContext.decodeAudioData(bytes))
          .then(buffer => { pourAudioBuffer = buffer; })
          .catch(() => {})
          .finally(() => { pourAudioLoading = null; });
      }
    } catch (_) { /* Pouring remains playable without audio. */ }
  }
  function schedulePourSound(duration) {
    if (!pourAudioBuffer || pourAudioContext?.state !== 'running' || document.hidden) return () => {};
    const source = pourAudioContext.createBufferSource(), gain = pourAudioContext.createGain();
    source.buffer = pourAudioBuffer;
    source.connect(gain); gain.connect(pourAudioContext.destination);
    // Match the visible stream, with short fades to avoid audible cutoffs.
    const start = pourAudioContext.currentTime + duration * .33 / 1000;
    const length = Math.min(pourAudioBuffer.duration, duration * .39 / 1000);
    const fade = Math.min(.025, length / 3);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(.65, start + fade);
    gain.gain.setValueAtTime(.65, start + length - fade);
    gain.gain.linearRampToValueAtTime(0, start + length);
    const stop = () => {
      if (!pourSounds.has(stop)) return;
      source.onended = null;
      try { source.stop(); } catch (_) { /* Already stopped. */ }
      source.disconnect(); gain.disconnect(); pourSounds.delete(stop);
    };
    source.onended = stop; pourSounds.add(stop);
    source.start(start, 0, length);
    return stop;
  }
  const total = () => chemicals.reduce((sum, name) => sum + mixture[name], 0);
  const pourSize = name => {
    const target = recipes[index].mix[name];
    // Keep small ingredients precise and larger ingredients quick to fill.
    return target ? [30, 25, 20, 15, 10, 5].find(amount => amount <= target / 2 && target % amount === 0) || 5 : 10;
  };
  const recipeText = mix => chemicals.filter(name => mix[name]).map(name => `${name} ${mix[name]}%`).join(' · ') || 'Empty';

  function show(view) {
    $('mix-result').close();
    if (view !== 'lesson-video') $('recipe-video').pause();
    ['intro', 'game', 'report', 'ready', 'lesson-video'].forEach(id => { $(id).hidden = id !== view; });
    $(view).focus({ preventScroll: true });
    window.scrollTo?.(0, 0);
  }
  function clearEffects() {
    effects.forEach(dispose => dispose());
  }
  function render() {
    buttons.forEach(button => {
      const amount = mode === 'demo' ? pourSize(button.dataset.chemical) : Math.min(pourSize(button.dataset.chemical), 100 - total());
      button.querySelector('small').textContent = `+${amount}% / tap`;
      button.setAttribute('aria-label', `Pour ${amount} percent ${button.dataset.chemical}`);
    });
    $('mixture').innerHTML = layers.map(layer => `<span class="liquid-layer" style="height:${layer.amount}%;--chemical:${colors[layer.name]}"></span>`).join('');
    $('mixture').style.clipPath = `inset(${100 - total()}% 0 0)`;
    $('fill-total').innerHTML = `${total()}<span>% filled</span>`;
    if (mode === 'demo') renderDemoTargets();
    $('composition').innerHTML = chemicals.map(name => `<span style="--chemical:${colors[name]}"><i aria-hidden="true"></i>${name} <strong>${mixture[name]}%</strong></span>`).join('');
    $('receiver').setAttribute('aria-label', `${total()} percent filled. ${recipeText(mixture)}`);
  }
  function startRound() {
    $('mix-result').close(); $('view-result').hidden = true;
    $('correct-recipe').hidden = false;
    clearInterval(interval); clearEffects();
    mixture = { Water: 0, ACN: 0, MeOH: 0 }; layers = []; playing = true;
    $('game').dataset.state = 'playing'; delete $('game').dataset.outcome;
    $('review').hidden = true;
    $('progress').textContent = `ROUND ${index + 1} OF ${recipes.length}`;
    $('running-score').textContent = `Score ${results.filter(result => result.correct).length} / 4`;
    $('game-title').textContent = recipes[index].name;
    $('solution-name').textContent = recipes[index].name;
    $('feedback').textContent = 'Tap a chemical above to start pouring.';
    buttons.forEach(button => { button.disabled = false; });
    render(); deadline = Date.now() + 30000; tick(); interval = setInterval(tick, 100);
  }
  function start() {
    preparePourAudio();
    clearTimeout(lessonTimer); lessonBusy = false; mode = 'game';
    $('game').dataset.mode = mode; setTrayLabels(false);
    $('lesson-target').hidden = true; $('replay-demo').hidden = true;
    $('seconds').hidden = false; $('timer').hidden = false; $('running-score').hidden = false;
    buttons.forEach(button => button.classList.toggle('is-guided', false));
    index = 0; results = []; show('game'); startRound();
  }
  const nextChemical = () => chemicals.find(name => mixture[name] < recipes[index].mix[name]);
  function updateVideoControls() {
    const video = $('recipe-video');
    $('video-toggle').textContent = video.error ? 'Retry video' : video.paused ? 'Play video' : 'Pause video';
    $('video-status').textContent = video.error
      ? 'The video could not load. Check your connection and retry.'
      : 'Watch the full video. Guided practice starts when it finishes.';
  }
  function playRecipeVideo() {
    $('recipe-video').play().catch(() => { if (mode === 'video') updateVideoControls(); });
  }
  function beginRecipeVideo(recipeIndex = 0) {
    clearTimeout(lessonTimer); clearInterval(interval); clearEffects();
    mode = 'video'; index = recipeIndex; playing = false; lessonBusy = false; lessonComplete = false;
    buttons.forEach(button => { button.disabled = true; });
    const video = $('recipe-video');
    video.pause();
    video.src = `assets/test-tube-game-video-assets/${recipeVideos[index]}`;
    video.muted = false; video.volume = 1;
    video.setAttribute('aria-label', `${recipes[index].name} video`);
    $('video-title').textContent = recipes[index].name;
    $('video-progress').textContent = `WATCH & LEARN · RECIPE ${index + 1} OF 4`;
    video.load(); updateVideoControls(); show('lesson-video'); playRecipeVideo();
  }
  function guideLesson(name = nextChemical()) {
    buttons.forEach(button => {
      button.disabled = mode === 'demo' || lessonBusy || !name || button.dataset.chemical !== name;
      button.classList.toggle('is-guided', !!name && button.dataset.chemical === name);
    });
    $('lesson-hint').textContent = name
      ? `${mode === 'demo' ? 'Watch' : 'Tap'} ${name} +${pourSize(name)}% · ${mixture[name]} / ${recipes[index].mix[name]}% added`
      : '100% filled — the recipe is complete!';
  }
  function beginLesson(kind, recipeIndex = 0) {
    preparePourAudio();
    $('view-result').hidden = true;
    clearTimeout(lessonTimer); clearInterval(interval); clearEffects();
    mode = kind; $('game').dataset.mode = mode; setTrayLabels(kind === 'demo'); index = recipeIndex; playing = false; lessonBusy = false; lessonComplete = false;
    mixture = { Water: 0, ACN: 0, MeOH: 0 }; layers = [];
    $('game').dataset.state = 'learning'; delete $('game').dataset.outcome;
    $('seconds').hidden = true; $('timer').hidden = true; $('running-score').hidden = true;
    $('review').hidden = true; $('replay-demo').hidden = true; $('lesson-target').hidden = false;
    $('progress').textContent = kind === 'demo' ? 'WATCH & LEARN' : `GUIDED PRACTICE ${index + 1} OF 4`;
    $('game-title').textContent = recipes[index].name;
    $('solution-name').textContent = recipes[index].name;
    $('target-recipe').innerHTML = chemicals.map(name => `<div class="recipe-ingredient${recipes[index].mix[name] ? '' : ' is-zero'}" style="--chemical:${colors[name]}"><span><i aria-hidden="true"></i>${name}</span><strong>${recipes[index].mix[name]}<small>%</small></strong></div>`).join('');
    $('feedback').textContent = 'Each tap adds the percentage shown on the tube. Fill to 100% with the target recipe.';
    render(); guideLesson(); show('game');
    if (kind === 'demo') {
      guideLesson(null);
      $('lesson-hint').textContent = 'Let’s make Column Cleaning solution. Fill to 100% with these three ingredients.';
      lessonTimer = setTimeout(scheduleDemoPour, 1800);
    }
  }
  function setTrayLabels(demo) {
    $('tray-label').textContent = demo ? 'WATCH THE HIGHLIGHTED TUBE' : 'CHOOSE A CHEMICAL';
    $('tray-note').textContent = demo ? 'Automatic demo' : 'Pour % shown on each tube';
    buttons.forEach(button => button.classList.toggle('demo-tap', false));
  }
  function renderDemoTargets() {
    $('target-recipe').innerHTML = chemicals.map(name => {
      const target = recipes[index].mix[name], current = mixture[name], done = current === target;
      return `<div class="recipe-ingredient${done ? ' is-complete' : ''}" style="--chemical:${colors[name]}"><span><i aria-hidden="true"></i>${name}</span><strong>${done ? `✓ ${current}<small>%</small>` : `${current}<small> / ${target}%</small>`}</strong><span class="recipe-meter" aria-hidden="true"><i style="width:${current / target * 100}%"></i></span></div>`;
    }).join('');
  }
  function scheduleDemoPour() {
    clearTimeout(lessonTimer);
    if (mode !== 'demo' || document.hidden || lessonComplete) return;
    const name = nextChemical();
    if (!name) { finishLesson(); return; }
    guideLesson(name);
    const instruction = name === 'Water'
      ? mixture.Water === 0 ? 'Each Water tap adds 30%.' : mixture.Water === 30 ? 'Two more Water pours to reach 90%.' : 'One last Water pour to reach 90%.'
      : name === 'ACN' ? 'Now add 5% ACN — one tap.' : 'Finish with 5% MeOH — one tap.';
    $('lesson-hint').textContent = instruction;
    lessonTimer = setTimeout(() => {
      if (mode !== 'demo' || document.hidden) return;
      const button = buttons.find(node => node.dataset.chemical === name);
      button.classList.toggle('demo-tap', true);
      lessonTimer = setTimeout(() => {
        button.classList.toggle('demo-tap', false);
        if (mode !== 'demo' || document.hidden) return;
        lessonBusy = true;
        const amount = pourSize(name);
        animatePour(button, name, amount, {
          land() {
            commitPour(name, amount);
            $('lesson-hint').textContent = `${name}: ${mixture[name]}% of ${recipes[index].mix[name]}% added.`;
          },
          finish() {
            lessonBusy = false;
            $('lesson-hint').textContent = mixture[name] === recipes[index].mix[name]
              ? `${name} complete — ${mixture[name]}%.` : `${mixture[name]}% Water added. Keep going!`;
            lessonTimer = setTimeout(() => {
              if (total() === 100) finishLesson(); else scheduleDemoPour();
            }, 800);
          }
        });
      }, 450);
    }, 1500);
  }
  function finishLesson() {
    lessonBusy = false; lessonComplete = true;
    guideLesson();
    $('game').dataset.state = 'review'; $('game').dataset.outcome = 'correct';
    $('outcome').textContent = mode === 'demo' ? 'Perfect! Three ingredients, 100% filled.' : 'Perfect recipe!';
    $('correct-recipe').textContent = `${recipes[index].name}: ${recipeText(recipes[index].mix)}`;
    $('correct-recipe').hidden = true;
    $('next').textContent = mode === 'demo' ? 'Now you try →' : index === 3 ? 'Continue →' : 'Next recipe →';
    $('replay-demo').hidden = mode !== 'demo'; $('review').hidden = false;
    $('next').focus({ preventScroll: true });
  }
  function lessonPour(name) {
    if (lessonBusy || lessonComplete || name !== nextChemical()) return;
    const button = buttons.find(node => node.dataset.chemical === name);
    lessonBusy = true;
    addPour(name, button);
    // Keep the source highlighted through its 820 ms pour, then advance guidance.
    guideLesson(name);
    lessonTimer = setTimeout(() => {
      lessonBusy = false;
      if (total() === 100) { finishLesson(); return; }
      guideLesson();
      if (mode === 'demo') scheduleDemoPour();
    }, 900);
  }
  function tick() {
    if (!playing) return;
    const remaining = Math.max(0, deadline - Date.now());
    $('seconds').textContent = `${Math.ceil(remaining / 1000)} sec`;
    $('timer').setAttribute('aria-valuenow', Math.ceil(remaining / 1000));
    $('timer-fill').style.width = `${remaining / 300}%`;
    $('timer').classList.toggle('urgent', remaining <= 10000);
    if (!remaining) finish(true);
  }
  function animatePour(button, name, amount, callbacks = null) {
    // Keep the requested tube-pouring demonstration visible in every stage,
    // including when the browser reports reduced motion.
    const source = button.querySelector('.tube');
    if (!source.animate) {
      if (callbacks) { callbacks.land(); callbacks.finish(); }
      return;
    }
    const stage = $('game');
    const bounds = stage.getBoundingClientRect();
    const from = source.getBoundingClientRect(), to = $('receiver').getBoundingClientRect();
    const left = bounds.left + stage.clientLeft, top = bounds.top + stage.clientTop;
    const mouthX = to.left + to.width / 2 - left;
    const mouthY = to.top - top - 26;
    const surfaceY = to.top - top + to.height * (.96 - .84 * total() / 100);
    const duration = 820;
    const stopSound = schedulePourSound(duration);
    const nodes = [], animations = [];
    let landingTimer = null, landed = false, disposed = false;
    const land = () => { if (!landed && !disposed) { landed = true; callbacks?.land(); } };
    const dispose = () => {
      stopSound();
      disposed = true; clearTimeout(landingTimer);
      animations.forEach(animation => animation.cancel());
      nodes.forEach(node => node.remove());
      effects.delete(dispose);
    };
    effects.add(dispose);
    const mount = node => {
      node.setAttribute('aria-hidden', 'true');
      node.style.setProperty('--chemical', colors[name]);
      stage.append(node); nodes.push(node); return node;
    };
    const animate = (node, frames, options = {}) => {
      const animation = node.animate(frames, { duration, fill: 'both', easing: 'ease-in-out', ...options });
      animations.push(animation); return animation;
    };
    const particle = (className, x, y) => {
      const node = document.createElement('span'); node.className = className;
      Object.assign(node.style, { left: `${x}px`, top: `${y}px` });
      return mount(node);
    };
    const ghost = source.cloneNode(true);
    ghost.classList.add('pour-ghost');
    Object.assign(ghost.style, { left: `${from.left - left}px`, top: `${from.top - top}px`, width: `${from.width}px` });
    mount(ghost);
    // Rotate around the lip so the stream meets the opening throughout the pour.
    const dx = mouthX - (from.left - left + from.width / 2);
    const dy = mouthY - (from.top - top);
    const angle = from.left + from.width / 2 > to.left + to.width / 2 ? -108 : 108;
    const tilted = `translate(${dx}px,${dy}px) rotate(${angle}deg)`;
    const flight = animate(ghost, [
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * .65}px,${dy - 18}px) rotate(${angle * .35}deg)`, opacity: 1, offset: .2 },
      { transform: tilted, opacity: 1, offset: .34 },
      { transform: tilted, opacity: 1, offset: .65 },
      { transform: 'translate(0,-8px) rotate(0deg)', opacity: 1, offset: .92 },
      { transform: 'translate(0,0) rotate(0deg)', opacity: 0 }
    ]);
    const liquid = ghost.querySelector('.tube-liquid');
    animate(liquid, [{ height: '84%' }, { height: '84%', offset: .34 }, { height: '66%', offset: .65 }, { height: '66%' }]);
    const stream = particle('pour-stream', mouthX - 2, mouthY);
    stream.style.height = `${surfaceY - mouthY}px`;
    animate(stream, [
      { opacity: 0, transform: 'scaleY(0)' },
      { opacity: 0, transform: 'scaleY(0)', offset: .33 },
      { opacity: .9, transform: 'scaleY(1)', offset: .44 },
      { opacity: .9, transform: 'scaleY(1)', offset: .63 },
      { opacity: 0, transform: 'scaleY(1)', offset: .72 },
      { opacity: 0, transform: 'scaleY(1)' }
    ]);
    const ripple = particle('pour-ripple', mouthX, surfaceY);
    animate(ripple, [
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.25)' },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.25)', offset: .43 },
      { opacity: 1, transform: 'translate(-50%,-50%) scale(.6)', offset: .5 },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(1.3)' }
    ]);
    for (let i = 0; i < 4; i++) {
      const drop = particle('pour-droplet', mouthX, surfaceY);
      const spread = (i - 1.5) * 5;
      animate(drop, [
        { opacity: 0, transform: 'translate(-50%,0) scale(.3)' },
        { opacity: 0, transform: 'translate(-50%,0) scale(.3)', offset: .44 },
        { opacity: .85, transform: `translate(${spread}px,-${10 + i % 2 * 7}px) scale(1)`, offset: .6 },
        { opacity: 0, transform: `translate(${spread * 1.3}px,5px) scale(.3)`, offset: .84 },
        { opacity: 0 }
      ]);
    }
    const dose = particle('pour-dose', mouthX + to.width / 2 + 10, to.top - top + 12);
    dose.textContent = `+${amount}%`;
    animate(dose, [
      { opacity: 0, transform: 'translateY(8px) scale(.8)' },
      { opacity: 0, transform: 'translateY(8px) scale(.8)', offset: .35 },
      { opacity: 1, transform: 'translateY(0) scale(1.1)', offset: .55 },
      { opacity: 0, transform: 'translateY(-22px) scale(1)' }
    ]);
    if (callbacks) landingTimer = setTimeout(land, duration * .44);
    flight.onfinish = () => {
      if (disposed) return;
      if (callbacks) land();
      dispose(); callbacks?.finish();
    };
  }
  function pour(name, button) {
    preparePourAudio();
    if (mode === 'practice') { lessonPour(name); return; }
    if (!playing) return;
    tick();
    if (!playing || !chemicals.includes(name) || total() >= 100) return;
    addPour(name, button);
    if (total() === 100) finish(false);
  }
  function addPour(name, button) {
    const amount = Math.min(pourSize(name), 100 - total());
    commitPour(name, amount);
    animatePour(button, name, amount);
  }
  function commitPour(name, amount) {
    mixture[name] += amount;
    const lastLayer = layers[layers.length - 1];
    if (lastLayer?.name === name) lastLayer.amount += amount;
    else layers.push({ name, amount });
    render();
    $('feedback').textContent = `Added ${amount}% ${name}. ${total()}% filled. ${recipeText(mixture)}.`;
  }
  function finish(timedOut) {
    if (!playing) return;
    playing = false; clearInterval(interval);
    const correct = !timedOut && chemicals.every(name => mixture[name] === recipes[index].mix[name]);
    results.push({ correct, timedOut, mix: { ...mixture } });
    buttons.forEach(button => { button.disabled = true; });
    $('game').dataset.state = 'review'; $('game').dataset.outcome = correct ? 'correct' : 'incorrect';
    $('running-score').textContent = `Score ${results.filter(result => result.correct).length} / 4`;
    $('outcome').textContent = correct ? 'The perfect mix! +1 point' : timedOut ? 'Time’s up!' : 'Not quite the right mix';
    $('correct-recipe').textContent = `Correct recipe: ${recipeText(recipes[index].mix)}`;
    $('feedback').textContent = `${$('outcome').textContent}. ${$('correct-recipe').textContent}`;
    $('review').hidden = false;
    $('next').textContent = index === recipes.length - 1 ? 'See results →' : 'Next round →';
    $('view-result').hidden = false;
    renderMixResult(correct, timedOut);
    $('mix-result').showModal();
    $('result-next').focus({ preventScroll: true });
  }
  function renderMixResult(correct, timedOut) {
    const target = recipes[index].mix;
    const tube = (mix, label) => {
      const filled = chemicals.reduce((sum, name) => sum + mix[name], 0);
      return `<div class="comparison-card"><h3>${label}</h3><span class="tube comparison-tube" role="img" aria-label="${label}: ${recipeText(mix)}. ${filled}% filled"><img src="assets/test-tube.png" alt=""><span class="mixture">${chemicals.map(name => `<span class="liquid-layer" style="height:${mix[name]}%;--chemical:${colors[name]}"></span>`).join('')}</span></span><strong>${filled}% <small>filled</small></strong></div>`;
    };
    $('mix-result').dataset.outcome = correct ? 'correct' : 'incorrect';
    $('mix-result-recipe').textContent = recipes[index].name;
    $('mix-result-title').textContent = correct ? 'Perfect match! +1 point' : timedOut ? 'Time’s up — compare your mix' : 'Let’s compare the mixtures';
    $('mix-result-summary').textContent = correct ? 'Every ingredient matches the target recipe.'
      : timedOut && total() === 100 ? 'The mixture reached the time limit. Compare the amounts below.'
      : timedOut ? `You filled ${total()}% before time ran out. The target is 100%.` : 'The tube is full, but the ingredient amounts differ.';
    $('mix-result-tubes').innerHTML = tube(mixture, 'Your mixture') + tube(target, 'Correct recipe');
    $('mix-result-values').innerHTML = `<table class="comparison-table"><thead><tr><th scope="col">Ingredient</th><th scope="col">Yours</th><th scope="col">Correct</th></tr></thead><tbody>${chemicals.map(name => {
      const difference = mixture[name] - target[name];
      const note = !difference ? '✓ Matched' : `${Math.abs(difference)} percentage points ${difference > 0 ? 'too much' : 'too little'}`;
      return `<tr class="${difference ? 'needs-change' : 'matches'}"><th scope="row"><span class="ingredient-dot" style="--chemical:${colors[name]}" aria-hidden="true"></span>${name}<small>${note}</small></th><td>${mixture[name]}%</td><td>${target[name]}%</td></tr>`;
    }).join('')}</tbody></table>`;
    $('result-next').textContent = index === recipes.length - 1 ? 'See results →' : 'Next round →';
  }
  function next() {
    if (mode === 'demo' || mode === 'practice') {
      if (!lessonComplete) return;
      if (mode === 'demo') beginRecipeVideo();
      else if (index < recipes.length - 1) beginRecipeVideo(index + 1);
      else { clearEffects(); mode = 'ready'; show('ready'); }
      return;
    }
    if (mode !== 'game' || playing || results.length !== index + 1) return;
    $('mix-result').close();
    index++;
    if (index < recipes.length) { startRound(); $('game').focus({ preventScroll: true }); return; }
    clearEffects();
    const score = results.filter(result => result.correct).length;
    $('final-score').textContent = score;
    $('report-message').textContent = score === 4 ? 'Every solution, perfectly prepared!' : 'Keep practicing for the perfect mix.';
    $('results').innerHTML = results.map((result, i) => `<div class="result-row"><div><strong>${recipes[i].name}</strong><span>${result.correct ? 'Correct · 1/1' : result.timedOut ? 'Timed out · 0/1' : 'Incorrect · 0/1'}</span></div><p>Your mix: ${recipeText(result.mix)}<br>Correct recipe: ${recipeText(recipes[i].mix)}</p></div>`).join('');
    mode = 'report'; show('report');
  }
  buttons.forEach(button => button.addEventListener('click', () => pour(button.dataset.chemical, button)));
  $('play').addEventListener('click', () => { if (mode === 'intro') beginLesson('demo'); });
  $('replay-demo').addEventListener('click', () => { if (mode === 'demo' && lessonComplete) beginLesson('demo'); });
  $('start-game').addEventListener('click', () => { if (mode === 'ready') start(); });
  $('retry').addEventListener('click', start);
  $('next').addEventListener('click', next);
  $('result-next').addEventListener('click', next);
  $('close-result').addEventListener('click', () => $('mix-result').close());
  $('mix-result').addEventListener('close', () => { if (mode === 'game' && !playing) $('view-result').focus({ preventScroll: true }); });
  $('view-result').addEventListener('click', () => {
    if (mode === 'game' && !playing && results.length === index + 1) $('mix-result').showModal();
  });
  $('video-toggle').addEventListener('click', () => {
    if (mode !== 'video') return;
    const video = $('recipe-video');
    if (video.error) { video.load(); playRecipeVideo(); }
    else if (video.paused) playRecipeVideo();
    else video.pause();
  });
  for (const event of ['play', 'pause', 'error']) $('recipe-video').addEventListener(event, updateVideoControls);
  $('recipe-video').addEventListener('ended', () => {
    if (mode === 'video' && $('recipe-video').ended) beginLesson('practice', index);
  });
  function pauseDemo() {
    if (mode !== 'demo') return;
    clearTimeout(lessonTimer); clearEffects(); lessonBusy = false;
    buttons.forEach(button => button.classList.toggle('demo-tap', false));
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pourSounds.forEach(stop => stop()); pauseDemo(); if (mode === 'video') $('recipe-video').pause(); }
    if (!document.hidden) { tick(); if (mode === 'demo' && !lessonBusy && !lessonComplete) scheduleDemoPour(); }
  });
  window.addEventListener('pagehide', () => { $('recipe-video').pause(); pauseDemo(); clearTimeout(lessonTimer); lessonBusy = false; clearInterval(interval); clearEffects(); });
  let viewportWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    // Mobile browser controls can change viewport height during a pour.
    if (window.innerWidth !== viewportWidth) { clearEffects(); if (mode === 'demo' && !lessonComplete) { pauseDemo(); scheduleDemoPour(); } }
    viewportWidth = window.innerWidth;
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted && (mode === 'demo' || mode === 'practice')) {
      if (total() === 100) finishLesson();
      else { guideLesson(); if (mode === 'demo') scheduleDemoPour(); }
    }
    if (event.persisted && playing) { tick(); if (playing) interval = setInterval(tick, 100); }
  });
})();

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

  let index = 0;
  let mixture = { Water: 0, ACN: 0, MeOH: 0 };
  let layers = [];
  let results = [];
  let playing = false;
  let mode = 'intro'; // 'intro' | 'demo' | 'try' | 'solution-intro' | 'video' | 'practice' | 'ready' | 'game' | 'report'
  let deadline = 0;
  let interval = null;
  const effects = new Set();
  let pourAudioContext = null, pourAudioBuffer = null, pourAudioLoading = null;
  const pourSounds = new Set();

  // Screen 2 Automated Demo state
  let demoMixture = { Water: 0, ACN: 0, MeOH: 0 };
  let demoLayers = [];
  let demoTimer = null;
  let demoComplete = false;

  function preparePourAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      pourAudioContext ||= new AudioContext();
      pourAudioContext.resume().catch(() => { });
      if (!pourAudioLoading && !pourAudioBuffer) {
        pourAudioLoading = fetch('audio/pour-audio.mp3')
          .then(response => { if (!response.ok) throw new Error('Audio unavailable'); return response.arrayBuffer(); })
          .then(bytes => pourAudioContext.decodeAudioData(bytes))
          .then(buffer => { pourAudioBuffer = buffer; })
          .catch(() => { })
          .finally(() => { pourAudioLoading = null; });
      }
    } catch (_) { /* Pouring remains playable without audio. */ }
  }

  function schedulePourSound(duration) {
    if (!pourAudioBuffer || pourAudioContext?.state !== 'running' || document.hidden) return () => { };
    const source = pourAudioContext.createBufferSource(), gain = pourAudioContext.createGain();
    source.buffer = pourAudioBuffer;
    source.connect(gain);
    gain.connect(pourAudioContext.destination);

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
      try { source.stop(); } catch (_) { }
      source.disconnect();
      gain.disconnect();
      pourSounds.delete(stop);
    };
    source.onended = stop;
    pourSounds.add(stop);
    source.start(start, 0, length);
    return stop;
  }

  const total = () => chemicals.reduce((sum, name) => sum + mixture[name], 0);
  const demoTotal = () => chemicals.reduce((sum, name) => sum + demoMixture[name], 0);

  const pourSize = name => {
    const target = recipes[index].mix[name];
    return target ? [30, 25, 20, 15, 10, 5].find(amount => amount <= target / 2 && target % amount === 0) || 5 : 10;
  };

  const recipeText = mix => chemicals.filter(name => mix[name]).map(name => `${name} ${mix[name]}%`).join(' · ') || 'Empty';

  const allViews = ['intro', 'demo-screen', 'try-screen', 'solution-intro', 'lesson-video', 'game', 'ready', 'report'];

  function show(view) {
    $('mix-result')?.close();
    clearTimeout(demoTimer);
    if (view !== 'lesson-video') {
      const recipeVideo = $('recipe-video');
      if (recipeVideo) recipeVideo.pause();
    }
    allViews.forEach(id => {
      const el = $(id);
      if (el) el.hidden = (id !== view);
    });
    const target = $(view);
    if (target) {
      target.focus({ preventScroll: true });
    }
    window.scrollTo?.(0, 0);
  }

  function clearEffects() {
    effects.forEach(dispose => dispose());
    effects.clear();
  }

  function render() {
    buttons.forEach(button => {
      const amount = Math.min(pourSize(button.dataset.chemical), 100 - total());
      button.querySelector('small').textContent = `+${amount}% / tap`;
      button.setAttribute('aria-label', `Pour ${amount} percent ${button.dataset.chemical}`);
    });
    $('mixture').innerHTML = layers.map(layer => `<span class="liquid-layer" style="height:${layer.amount}%;--chemical:${colors[layer.name]}"></span>`).join('');
    $('mixture').style.clipPath = `inset(${100 - total()}% 0 0)`;
    $('fill-total').innerHTML = `${total()}<span>% filled</span>`;
    $('composition').innerHTML = chemicals.map(name => `<span style="--chemical:${colors[name]}"><i aria-hidden="true"></i>${name} <strong>${mixture[name]}%</strong></span>`).join('');
    $('receiver').setAttribute('aria-label', `${total()} percent filled. ${recipeText(mixture)}`);
  }

  /* Screen 1: Opening Screen */
  function showOpening() {
    clearEffects();
    clearInterval(interval);
    mode = 'intro';
    show('intro');
  }

  /* Screen 2: Automated Demo (fastened speed) */
  function renderDemo() {
    const dTotal = demoTotal();
    const demoMixtureEl = $('demo-mixture');
    if (demoMixtureEl) {
      demoMixtureEl.innerHTML = demoLayers.map(layer => `<span class="liquid-layer" style="height:${layer.amount}%;--chemical:${colors[layer.name]}"></span>`).join('');
      demoMixtureEl.style.clipPath = `inset(${100 - dTotal}% 0 0)`;
    }
    const demoFill = $('demo-fill-total');
    if (demoFill) demoFill.innerHTML = `${dTotal}<span>% filled</span>`;
    const demoComp = $('demo-composition');
    if (demoComp) demoComp.innerHTML = chemicals.map(name => `<span style="--chemical:${colors[name]}"><i aria-hidden="true"></i>${name} <strong>${demoMixture[name]}%</strong></span>`).join('');
  }

  const demoSteps = [
    { chemical: 'Water', amount: 30, text: 'Pouring 30% Water (1st pour)...' },
    { chemical: 'Water', amount: 30, text: 'Pouring 30% Water (2nd pour — 60% total)...' },
    { chemical: 'Water', amount: 30, text: 'Pouring 30% Water (3rd pour — 90% target reached)...' },
    { chemical: 'ACN', amount: 5, text: 'Pouring 5% ACN (95% total)...' },
    { chemical: 'MeOH', amount: 5, text: 'Pouring 5% MeOH (100% full — Recipe Complete!)' }
  ];

  function runDemoStep(stepIndex) {
    if (mode !== 'demo') return;
    if (stepIndex >= demoSteps.length) {
      demoComplete = true;
      $('demo-next')?.focus({ preventScroll: true });
      return;
    }

    const step = demoSteps[stepIndex];
    const demoChems = $('demo-chemicals');
    const button = demoChems ? demoChems.querySelector(`[data-demo-chem="${step.chemical}"]`) : null;

    if (!button) {
      runDemoStep(stepIndex + 1);
      return;
    }

    button.classList.add('demo-tap');

    demoTimer = setTimeout(() => {
      if (mode !== 'demo') return;
      button.classList.remove('demo-tap');
      animatePour(button, step.chemical, step.amount, {
        land() {
          demoMixture[step.chemical] += step.amount;
          const last = demoLayers[demoLayers.length - 1];
          if (last?.name === step.chemical) last.amount += step.amount;
          else demoLayers.push({ name: step.chemical, amount: step.amount });
          renderDemo();
        },
        finish() {
          demoTimer = setTimeout(() => {
            if (mode === 'demo') runDemoStep(stepIndex + 1);
          }, 450); // Fastened snappy timing!
        }
      });
    }, 450);
  }

  function startAutomatedDemo() {
    clearEffects();
    clearTimeout(demoTimer);
    preparePourAudio();
    mode = 'demo';
    demoMixture = { Water: 0, ACN: 0, MeOH: 0 };
    demoLayers = [];
    demoComplete = false;
    show('demo-screen');
    renderDemo();
    demoTimer = setTimeout(() => {
      if (mode === 'demo') runDemoStep(0);
    }, 550);
  }

  /* Screen 3: Let's Try */
  function showTryScreen() {
    clearEffects();
    clearTimeout(demoTimer);
    mode = 'try';
    show('try-screen');
  }

  /* Screen 4: Solution Title Screen */
  function showSolutionIntro(recipeIndex = 0) {
    clearEffects();
    clearTimeout(demoTimer);
    mode = 'solution-intro';
    index = recipeIndex;
    show('solution-intro');
    $('solution-intro-eyebrow').textContent = `SOLUTION ${index + 1} OF ${recipes.length}`;
    $('solution-intro-title').textContent = recipes[index].name;
    $('solution-intro-recipe').innerHTML = chemicals.map(name => {
      const target = recipes[index].mix[name];
      return `<div class="recipe-ingredient${target ? '' : ' is-zero'}" style="--chemical:${colors[name]}">
        <span><i aria-hidden="true"></i>${name}</span>
        <strong>${target}<small>%</small></strong>
      </div>`;
    }).join('');
  }

  /* Screen 5: Video of Solution */
  function updateVideoControls() {
    const video = $('recipe-video');
    if (!video) return;
    $('video-toggle').textContent = video.error ? 'Retry video' : video.paused ? 'Play video' : 'Pause video';
    $('video-status').textContent = video.error
      ? 'The video could not load. Check your connection and retry.'
      : 'Watch the full video to see how this solution is prepared.';
  }

  function playRecipeVideo() {
    $('recipe-video')?.play().catch(() => { if (mode === 'video') updateVideoControls(); });
  }

  function showSolutionVideo(recipeIndex = index) {
    clearEffects();
    mode = 'video';
    index = recipeIndex;
    playing = false;
    show('lesson-video');
    $('video-progress').textContent = `SOLUTION ${index + 1} OF ${recipes.length} · VIDEO`;
    $('video-title').textContent = `Video of ${recipes[index].name}`;
    const video = $('recipe-video');
    video.pause();
    video.src = `assets/test-tube-game-video-assets/${recipeVideos[index]}`;
    video.playbackRate = 1.0;
    video.muted = false;
    video.volume = 1;
    video.setAttribute('aria-label', `${recipes[index].name} video`);
    video.load();
    updateVideoControls();
    playRecipeVideo();
  }

  /* Screen 6: Interactive Guided Demo (Practice without Timer) */
  const nextChemical = () => chemicals.find(name => mixture[name] < recipes[index].mix[name]);

  function guidePractice(name = nextChemical()) {
    buttons.forEach(button => {
      const isTarget = !!name && button.dataset.chemical === name;
      button.disabled = !isTarget;
      button.classList.toggle('is-guided', isTarget);
    });

    if (name) {
      $('feedback').textContent = `Tap ${name} +${pourSize(name)}% · ${mixture[name]} / ${recipes[index].mix[name]}% added.`;
    } else {
      $('feedback').textContent = '100% filled — the recipe is complete!';
    }
  }

  function beginGuidedPractice(recipeIndex = index) {
    clearEffects();
    clearInterval(interval);
    preparePourAudio();
    mode = 'practice';
    index = recipeIndex;
    mixture = { Water: 0, ACN: 0, MeOH: 0 };
    layers = [];
    playing = false;

    $('game').dataset.mode = 'practice';
    $('game').dataset.state = 'learning';
    delete $('game').dataset.outcome;

    // No timer and no score during guided practice!
    $('seconds').hidden = true;
    $('timer').hidden = true;
    $('running-score').hidden = true;

    // Target recipe shown clearly
    $('lesson-target').hidden = false;
    $('review').hidden = true;
    $('view-result').hidden = true;
    $('retry-round').hidden = true;

    $('progress').textContent = `GUIDED PRACTICE · SOLUTION ${index + 1} OF ${recipes.length}`;
    $('game-title').textContent = recipes[index].name;
    if ($('solution-name')) $('solution-name').textContent = recipes[index].name;

    $('target-recipe').innerHTML = chemicals.map(name => {
      const target = recipes[index].mix[name];
      return `<div class="recipe-ingredient${target ? '' : ' is-zero'}" style="--chemical:${colors[name]}">
        <span><i aria-hidden="true"></i>${name}</span>
        <strong>${target}<small>%</small></strong>
      </div>`;
    }).join('');

    render();
    guidePractice();
    show('game');
  }

  function finishGuidedPractice() {
    buttons.forEach(button => {
      button.disabled = true;
      button.classList.remove('is-guided');
    });

    $('game').dataset.state = 'review';
    $('game').dataset.outcome = 'correct';
    $('outcome').textContent = 'Perfect recipe!';
    $('correct-recipe').textContent = '';
    $('correct-recipe').hidden = true;
    $('feedback').textContent = `Perfect recipe! Solution ${index + 1} prepared.`;

    $('retry-round').hidden = true;
    $('view-result').hidden = true;
    $('next').textContent = index === recipes.length - 1 ? 'Continue to Challenge →' : 'Next Solution →';
    $('review').hidden = false;
    $('next').focus({ preventScroll: true });
  }

  /* Transition: Practice Complete Screen */
  function showReadyScreen() {
    clearEffects();
    clearInterval(interval);
    mode = 'ready';
    show('ready');
  }

  /* Stage 3: Test Game (Memory Challenge with 30s Timer) */
  function tick() {
    if (!playing || mode !== 'game') return;
    const remaining = Math.max(0, deadline - Date.now());
    $('seconds').textContent = `${Math.ceil(remaining / 1000)} sec`;
    $('timer').setAttribute('aria-valuenow', Math.ceil(remaining / 1000));
    $('timer-fill').style.width = `${remaining / 300}%`;
    $('timer').classList.toggle('urgent', remaining <= 10000);
    if (!remaining) finishTestRound(true);
  }

  function startTestGame() {
    index = 0;
    results = [];
    startTestRound();
  }

  function startTestRound() {
    clearEffects();
    clearInterval(interval);
    preparePourAudio();
    mode = 'game';
    mixture = { Water: 0, ACN: 0, MeOH: 0 };
    layers = [];
    playing = true;

    $('game').dataset.mode = 'game';
    $('game').dataset.state = 'playing';
    delete $('game').dataset.outcome;

    // Timer & running score active!
    $('seconds').hidden = false;
    $('timer').hidden = false;
    $('running-score').hidden = false;

    // Target recipe hidden for memory test!
    $('lesson-target').hidden = true;
    $('review').hidden = true;
    $('view-result').hidden = true;
    $('retry-round').hidden = true;

    $('progress').textContent = `CHALLENGE · ROUND ${index + 1} OF ${recipes.length}`;
    $('running-score').textContent = `Score ${results.filter(r => r.correct).length} / ${recipes.length}`;
    $('game-title').textContent = recipes[index].name;
    if ($('solution-name')) $('solution-name').textContent = recipes[index].name;

    $('feedback').textContent = `Mix the ${recipes[index].name} from memory!`;
    buttons.forEach(button => {
      button.disabled = false;
      button.classList.remove('is-guided');
    });

    render();
    show('game');

    deadline = Date.now() + 30000;
    tick();
    interval = setInterval(tick, 100);
  }

  function finishTestRound(timedOut = false) {
    if (!playing) return;
    playing = false;
    clearInterval(interval);

    const correct = !timedOut && chemicals.every(name => mixture[name] === recipes[index].mix[name]);
    results.push({ correct, timedOut, mix: { ...mixture } });

    buttons.forEach(button => { button.disabled = true; });
    $('game').dataset.state = 'review';
    $('game').dataset.outcome = correct ? 'correct' : 'incorrect';
    $('running-score').textContent = `Score ${results.filter(r => r.correct).length} / ${recipes.length}`;

    $('outcome').textContent = correct ? 'The perfect mix! +1 point' : timedOut ? 'Time’s up!' : 'Not quite the right mix';
    $('correct-recipe').textContent = `Correct recipe: ${recipeText(recipes[index].mix)}`;
    $('correct-recipe').hidden = false;
    $('feedback').textContent = `${$('outcome').textContent}. ${$('correct-recipe').textContent}`;

    $('retry-round').hidden = true;
    $('view-result').hidden = false;
    $('next').textContent = index === recipes.length - 1 ? 'See Results →' : 'Next Round →';
    $('review').hidden = false;

    renderMixResult(correct, timedOut);
    $('mix-result').showModal();
    $('result-next').focus({ preventScroll: true });
  }

  function renderMixResult(correct, timedOut = false) {
    const target = recipes[index].mix;
    const tube = (mix, label) => {
      const filled = chemicals.reduce((sum, name) => sum + mix[name], 0);
      return `<div class="comparison-card">
        <h3>${label}</h3>
        <span class="tube comparison-tube" role="img" aria-label="${label}: ${recipeText(mix)}. ${filled}% filled">
          <img src="assets/test-tube.png" alt="">
          <span class="mixture">
            ${chemicals.map(name => `<span class="liquid-layer" style="height:${mix[name]}%;--chemical:${colors[name]}"></span>`).join('')}
          </span>
        </span>
        <strong>${filled}% <small>filled</small></strong>
      </div>`;
    };

    $('mix-result').dataset.outcome = correct ? 'correct' : 'incorrect';
    $('mix-result-recipe').textContent = recipes[index].name;
    $('mix-result-title').textContent = correct ? 'Perfect match! +1 point' : timedOut ? 'Time’s up — compare your mix' : 'Let’s compare the mixtures';
    $('mix-result-summary').textContent = correct
      ? 'Every solvent ratio matches the target recipe perfectly.'
      : timedOut && total() === 100
        ? 'The mixture reached the time limit. Compare the amounts below.'
        : timedOut
          ? `You filled ${total()}% before time ran out. The target is 100%.`
          : 'The tube reached 100%, but the solvent amounts differ from the required recipe.';
    $('mix-result-tubes').innerHTML = tube(mixture, 'Your mixture') + tube(target, 'Correct recipe');
    $('mix-result-values').innerHTML = `<table class="comparison-table">
      <thead><tr><th scope="col">Solvent</th><th scope="col">Yours</th><th scope="col">Correct</th></tr></thead>
      <tbody>${chemicals.map(name => {
      const difference = mixture[name] - target[name];
      const note = !difference ? '✓ Matched' : `${Math.abs(difference)} percentage points ${difference > 0 ? 'too much' : 'too little'}`;
      return `<tr class="${difference ? 'needs-change' : 'matches'}">
          <th scope="row"><span class="ingredient-dot" style="--chemical:${colors[name]}" aria-hidden="true"></span>${name}<small>${note}</small></th>
          <td>${mixture[name]}%</td>
          <td>${target[name]}%</td>
        </tr>`;
    }).join('')}</tbody>
    </table>`;
    $('result-next').textContent = index === recipes.length - 1 ? 'See Results →' : 'Next Round →';
  }

  function animatePour(button, name, amount, callbacks = null) {
    const source = button.querySelector('.tube');
    if (!source || !source.animate) {
      if (callbacks) { callbacks.land?.(); callbacks.finish?.(); }
      return;
    }
    const isDemo = mode === 'demo';
    const stage = isDemo ? $('demo-screen') : $('game');
    const receiver = isDemo ? $('demo-receiver') : $('receiver');
    const bounds = stage.getBoundingClientRect();
    const from = source.getBoundingClientRect(), to = receiver.getBoundingClientRect();
    const left = bounds.left + stage.clientLeft, top = bounds.top + stage.clientTop;
    const mouthX = to.left + to.width / 2 - left;
    const mouthY = to.top - top - 32;
    const currentTotal = isDemo ? demoTotal() : total();
    const surfaceY = to.top - top + to.height * (.96 - .84 * currentTotal / 100);
    const duration = isDemo ? 680 : 820;
    const stopSound = schedulePourSound(duration);
    const nodes = [], animations = [];
    let landingTimer = null, landed = false, disposed = false;

    const land = () => { if (!landed && !disposed) { landed = true; callbacks?.land?.(); } };
    const dispose = () => {
      stopSound();
      disposed = true;
      clearTimeout(landingTimer);
      animations.forEach(animation => animation.cancel());
      nodes.forEach(node => node.remove());
      effects.delete(dispose);
    };
    effects.add(dispose);

    const mount = node => {
      node.setAttribute('aria-hidden', 'true');
      node.style.setProperty('--chemical', colors[name]);
      stage.append(node);
      nodes.push(node);
      return node;
    };
    const animate = (node, frames, options = {}) => {
      const animation = node.animate(frames, { duration, fill: 'both', easing: 'ease-in-out', ...options });
      animations.push(animation);
      return animation;
    };
    const particle = (className, x, y) => {
      const node = document.createElement('span');
      node.className = className;
      Object.assign(node.style, { left: `${x}px`, top: `${y}px` });
      return mount(node);
    };

    const ghost = source.cloneNode(true);
    ghost.classList.add('pour-ghost');
    Object.assign(ghost.style, {
      left: `${from.left - left}px`,
      top: `${from.top - top}px`,
      width: `${from.width}px`,
      height: `${from.height}px`
    });
    mount(ghost);

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
    if (liquid) {
      animate(liquid, [
        { height: '84%' },
        { height: '84%', offset: .34 },
        { height: '66%', offset: .65 },
        { height: '66%' }
      ]);
    }

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
      dispose();
      callbacks?.finish?.();
    };
  }

  function commitPour(name, amount) {
    mixture[name] += amount;
    const lastLayer = layers[layers.length - 1];
    if (lastLayer?.name === name) lastLayer.amount += amount;
    else layers.push({ name, amount });
    render();
  }

  function pour(name, button) {
    preparePourAudio();
    if (mode === 'practice') {
      if (name !== nextChemical() || total() >= 100) return;
      const amount = Math.min(pourSize(name), 100 - total());
      buttons.forEach(b => { b.disabled = true; });
      commitPour(name, amount);
      animatePour(button, name, amount, {
        finish() {
          if (total() >= 100) {
            finishGuidedPractice();
          } else {
            guidePractice();
          }
        }
      });
      return;
    }

    if (mode === 'game') {
      if (!playing || !chemicals.includes(name) || total() >= 100) return;
      const amount = Math.min(pourSize(name), 100 - total());
      commitPour(name, amount);
      animatePour(button, name, amount);
      if (total() === 100) {
        finishTestRound(false);
      }
    }
  }

  function next() {
    $('mix-result')?.close();
    clearEffects();

    if (mode === 'practice') {
      if (index < recipes.length - 1) {
        index++;
        showSolutionIntro(index);
      } else {
        showReadyScreen();
      }
      return;
    }

    if (mode === 'game') {
      if (index < recipes.length - 1) {
        index++;
        startTestRound();
      } else {
        showReport();
      }
    }
  }

  function renderReportChips(mix, targetMix = null) {
    const active = chemicals.filter(name => (mix && mix[name]) || (targetMix && targetMix[name]));
    if (!active.length) return '<span class="res-chip is-empty">None</span>';
    return active.map(name => {
      const val = mix ? (mix[name] || 0) : 0;
      const targetVal = targetMix ? (targetMix[name] || 0) : null;
      const isMismatch = targetVal !== null && val !== targetVal;
      return `<span class="res-chip${isMismatch ? ' is-mismatch' : ''}" style="--c:${colors[name]}"><i class="chip-dot" aria-hidden="true"></i>${name} <strong>${val}%</strong>${isMismatch ? ` <small class="target-diff">(${targetVal}% req)</small>` : ''}</span>`;
    }).join('');
  }

  /* Screen 7: Report */
  function showReport() {
    clearEffects();
    clearInterval(interval);
    mode = 'report';
    show('report');
    const score = results.filter(r => r.correct).length;
    $('final-score').textContent = score;
    $('report-message').textContent = score === recipes.length
      ? 'Every solution, perfectly prepared!'
      : 'Great job! Keep practicing for the perfect mix every time.';

    const badgeChip = $('report-badge-chip');
    if (badgeChip) {
      if (score === recipes.length) {
        badgeChip.textContent = '★ 100% Accuracy · Master Chemist';
        badgeChip.className = 'report-badge-chip is-perfect';
      } else if (score >= 2) {
        badgeChip.textContent = `✓ ${Math.round((score / recipes.length) * 100)}% Accuracy · High Score`;
        badgeChip.className = 'report-badge-chip is-good';
      } else {
        badgeChip.textContent = `${Math.round((score / recipes.length) * 100)}% Accuracy · Keep Practicing`;
        badgeChip.className = 'report-badge-chip is-low';
      }
    }

    $('results').innerHTML = recipes.map((recipe, i) => {
      const res = results[i] || { correct: false, mix: { Water: 0, ACN: 0, MeOH: 0 } };
      return `<div class="result-row${res.correct ? ' is-correct' : ' incorrect is-incorrect'}">
        <div class="result-row-head">
          <div class="result-row-title">
            <span class="result-row-icon" aria-hidden="true">${res.correct ? '✓' : '✕'}</span>
            <strong>${recipe.name}</strong>
          </div>
          <span class="result-status-pill ${res.correct ? 'pill-correct' : 'pill-incorrect'}">${res.correct ? 'Correct · 1/1' : 'Incorrect · 0/1'}</span>
        </div>
        <div class="result-row-body">
          ${res.correct ? `
            <div class="result-spec-row">
              <span class="spec-label">Recipe:</span>
              <div class="spec-chips">${renderReportChips(recipe.mix)}</div>
            </div>
          ` : `
            <div class="result-spec-row">
              <span class="spec-label">Your mix:</span>
              <div class="spec-chips">${renderReportChips(res.mix, recipe.mix)}</div>
            </div>
            <div class="result-spec-row is-target">
              <span class="spec-label">Target:</span>
              <div class="spec-chips">${renderReportChips(recipe.mix)}</div>
            </div>
          `}
        </div>
      </div>`;
    }).join('');
  }

  /* Event Listeners */
  buttons.forEach(button => button.addEventListener('click', () => pour(button.dataset.chemical, button)));

  // Screen 1: Demo and Skip
  $('play').addEventListener('click', startAutomatedDemo);
  $('skip').addEventListener('click', () => showSolutionIntro(0));

  // Screen 2: Automated Demo Controls
  $('demo-replay').addEventListener('click', startAutomatedDemo);
  $('demo-next').addEventListener('click', () => {
    clearTimeout(demoTimer);
    clearEffects();
    showTryScreen();
  });

  // Screen 3: Let's Try
  $('try-btn').addEventListener('click', () => showSolutionIntro(0));

  // Screen 4: Solution Intro
  $('solution-intro-btn').addEventListener('click', () => showSolutionVideo(index));

  // Screen 5: Video of Solution
  $('video-toggle').addEventListener('click', () => {
    const video = $('recipe-video');
    if (!video) return;
    if (video.error) { video.load(); playRecipeVideo(); }
    else if (video.paused) playRecipeVideo();
    else video.pause();
  });
  $('video-next').addEventListener('click', () => beginGuidedPractice(index));
  for (const event of ['play', 'pause', 'error']) {
    $('recipe-video').addEventListener(event, updateVideoControls);
  }
  $('recipe-video').addEventListener('ended', () => {
    if (mode === 'video') beginGuidedPractice(index);
  });

  // Screen 6 & Ready & Game Controls
  $('start-game').addEventListener('click', startTestGame);
  $('retry-round').addEventListener('click', () => {
    if (mode === 'game') startTestRound();
    else beginGuidedPractice(index);
  });
  $('next').addEventListener('click', next);
  $('result-next').addEventListener('click', next);
  $('close-result').addEventListener('click', () => $('mix-result').close());
  $('view-result').addEventListener('click', () => {
    if (mode === 'game' && !playing) $('mix-result').showModal();
  });

  // Screen 7: Report Controls
  $('retry').addEventListener('click', () => {
    index = 0;
    results = [];
    showOpening();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pourSounds.forEach(stop => stop());
      if (mode === 'video') $('recipe-video')?.pause();
    }
  });

  window.addEventListener('pagehide', () => {
    clearTimeout(demoTimer);
    clearInterval(interval);
    $('recipe-video')?.pause();
    clearEffects();
  });

  let viewportWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth !== viewportWidth) {
      clearEffects();
    }
    viewportWidth = window.innerWidth;
  });
})();

(() => {
  'use strict';

  const recipes = [
    { name: 'Column Cleaning', mix: { Water: 90, ACN: 5, MeOH: 5 } },
    { name: 'Strong Wash Solvent', mix: { Water: 20, ACN: 80, MeOH: 0 } },
    { name: 'Needle Wash Solvent', mix: { Water: 50, ACN: 0, MeOH: 50 } },
    { name: 'Column Storage (C18)', mix: { Water: 30, ACN: 70, MeOH: 0 } }
  ];

  const chemicals = ['Water', 'ACN', 'MeOH'];
  const chemicalNames = { Water: 'Water', ACN: 'Acetonitrile (ACN)', MeOH: 'Methanol (MeOH)' };
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
  let challengeRemaining = 45000;
  let interval = null;
  const effects = new Set();
  let activePourFinish = null;
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

  function schedulePourSound(duration, audioDelay = duration * .33) {
    if (!pourAudioBuffer || pourAudioContext?.state !== 'running' || document.hidden) return () => { };
    const source = pourAudioContext.createBufferSource(), gain = pourAudioContext.createGain();
    source.buffer = pourAudioBuffer;
    source.connect(gain);
    gain.connect(pourAudioContext.destination);

    const start = pourAudioContext.currentTime + audioDelay / 1000;
    const length = pourAudioBuffer.duration;
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

  let timerAudioBuffer = null, timerAudioLoading = null, timerAudioSource = null;
  let timerAudioPlayed = false;

  function prepareTimerAudio() {
    preparePourAudio();
    if (!pourAudioContext || timerAudioBuffer || timerAudioLoading) return;
    timerAudioLoading = fetch('audio/10s-timer-audio.wav')
      .then(response => { if (!response.ok) throw new Error('Audio unavailable'); return response.arrayBuffer(); })
      .then(bytes => pourAudioContext.decodeAudioData(bytes))
      .then(buffer => { timerAudioBuffer = buffer; })
      .catch(() => {})
      .finally(() => { timerAudioLoading = null; });
  }

  function stopTimerAudio() {
    if (timerAudioSource) {
      timerAudioSource.onended = null;
      try { timerAudioSource.stop(); } catch (_) {}
      timerAudioSource.disconnect();
      timerAudioSource = null;
    }
    timerAudioPlayed = false;
  }

  function playTimerAudio(remaining) {
    if (remaining > 10000 || remaining <= 0 || timerAudioPlayed || !timerAudioBuffer || document.hidden || pourAudioContext?.state !== 'running') return;
    const offset = (10000 - remaining) / 1000;
    const length = Math.min(remaining / 1000, timerAudioBuffer.duration - offset);
    if (length <= 0) return;
    const source = pourAudioContext.createBufferSource();
    source.buffer = timerAudioBuffer;
    source.connect(pourAudioContext.destination);
    timerAudioSource = source;
    timerAudioPlayed = true;
    source.onended = () => { source.disconnect(); if (timerAudioSource === source) timerAudioSource = null; };
    source.start(0, offset, length);
  }

  const total = () => chemicals.reduce((sum, name) => sum + mixture[name], 0);
  const demoTotal = () => chemicals.reduce((sum, name) => sum + demoMixture[name], 0);

  const pourSize = name => {
    const target = recipes[index].mix[name];
    return target ? [35, 30, 25, 20, 15, 10, 5].find(amount => amount <= target / 2 && target % amount === 0) || 5 : 10;
  };

  const recipeText = mix => chemicals.filter(name => mix[name]).map(name => `${name} ${mix[name]}%`).join(' · ') || 'Empty';

  const allViews = ['intro', 'demo-screen', 'try-screen', 'solution-intro', 'lesson-video', 'game', 'ready', 'report'];

  function show(view) {
    stopTimerAudio();
    $('mix-result')?.close();
    $('practice-result')?.close();
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

  function setPourBusy(busy) {
    $('game').dataset.pouring = String(busy);
    $('chemicals').setAttribute('aria-busy', String(busy));
    buttons.forEach(button => { button.disabled = busy; });
    if (busy) $('feedback').textContent = 'Pouring? Please wait.';
    else $('feedback').textContent = 'Ready ? select a solvent.';
  }

  function clearEffects() {
    activePourFinish = null;
    $('game').dataset.pouring = 'false';
    $('chemicals').setAttribute('aria-busy', 'false');
    effects.forEach(dispose => dispose());
    effects.clear();
  }

  function arrangeSolvents() {
    const ordered = [...buttons];
    if (mode === 'practice') {
      ordered.sort((a, b) => recipes[index].mix[b.dataset.chemical] - recipes[index].mix[a.dataset.chemical]);
    } else {
      for (let i = ordered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
      }
    }
    // Move the actual buttons so keyboard navigation follows the visible order.
    ordered.forEach(button => $('chemicals').append(button));
  }

  function render() {
    buttons.forEach(button => {
      const amount = Math.min(pourSize(button.dataset.chemical), 100 - total());
      button.querySelector('.chemical-name').textContent = (mode === 'practice' || mode === 'game') ? chemicalNames[button.dataset.chemical] : button.dataset.chemical;
      button.querySelector('small').textContent = `+${amount}% / tap`;
      button.setAttribute('aria-label', `Pour ${amount} percent ${button.dataset.chemical}`);
    });
    $('mixture').innerHTML = layers.map(layer => `<span class="liquid-layer" style="height:${layer.amount}%;--chemical:${colors[layer.name]}"></span>`).join('');
    $('mixture').style.clipPath = `inset(${100 - total()}% 0 0)`;
    $('fill-total').innerHTML = `${total()}<span>% filled</span>`;
    $('composition').innerHTML = chemicals.map(name => `<span style="--chemical:${colors[name]}" aria-label="${chemicalNames[name]}: ${mixture[name]} percent"><i aria-hidden="true"></i>${name} <strong>${mixture[name]}%</strong></span>`).join('');
    $('receiver').setAttribute('aria-label', `${total()} percent filled. ${recipeText(mixture)}`);
  }

  /* Screen 1: Opening Screen */
  function showOpening() {
    clearEffects();
    clearInterval(interval);
    mode = 'intro';
    show('intro');
  }

  // Automatic demo and its transition are disabled; retained for reference.
//   /* Screen 2: Automated Demo (fastened speed) */
//   function renderDemo() {
//     const dTotal = demoTotal();
//     const demoMixtureEl = $('demo-mixture');
//     if (demoMixtureEl) {
//       demoMixtureEl.innerHTML = demoLayers.map(layer => `<span class="liquid-layer" style="height:${layer.amount}%;--chemical:${colors[layer.name]}"></span>`).join('');
//       demoMixtureEl.style.clipPath = `inset(${100 - dTotal}% 0 0)`;
//     }
//     const demoFill = $('demo-fill-total');
//     if (demoFill) demoFill.innerHTML = `${dTotal}<span>% filled</span>`;
//     const demoComp = $('demo-composition');
//     if (demoComp) demoComp.innerHTML = chemicals.map(name => `<span style="--chemical:${colors[name]}"><i aria-hidden="true"></i>${name} <strong>${demoMixture[name]}%</strong></span>`).join('');
//   }
// 
//   const demoSteps = [
//     { chemical: 'Water', amount: 30, text: 'Pouring 30% Water (1st pour)...' },
//     { chemical: 'Water', amount: 30, text: 'Pouring 30% Water (2nd pour — 60% total)...' },
//     { chemical: 'Water', amount: 30, text: 'Pouring 30% Water (3rd pour — 90% target reached)...' },
//     { chemical: 'ACN', amount: 5, text: 'Pouring 5% ACN (95% total)...' },
//     { chemical: 'MeOH', amount: 5, text: 'Pouring 5% MeOH (100% full — Recipe Complete!)' }
//   ];
// 
//   function showDemoPointer(button) {
//     const pointer = $('demo-touch-pointer');
//     const stage = $('demo-screen');
//     if (!pointer || !stage || !button) return;
//     const stageRect = stage.getBoundingClientRect();
//     const btnRect = button.getBoundingClientRect();
//     const x = btnRect.left + btnRect.width / 2 - stageRect.left;
//     const y = btnRect.top + btnRect.height * 0.45 - stageRect.top;
//     pointer.style.left = `${x}px`;
//     pointer.style.top = `${y}px`;
//     pointer.classList.remove('is-active');
//     void pointer.offsetWidth;
//     pointer.classList.add('is-active');
//   }
// 
//   function hideDemoPointer() {
//     const pointer = $('demo-touch-pointer');
//     if (pointer) pointer.classList.remove('is-active');
//   }
// 
//   function runDemoStep(stepIndex) {
//     if (mode !== 'demo') return;
//     if (stepIndex >= demoSteps.length) {
//   //       demoComplete = true;
//       $('demo-next')?.focus({ preventScroll: true });
//       return;
//     }
// 
//     const step = demoSteps[stepIndex];
//     const demoChems = $('demo-chemicals');
//     const button = demoChems ? demoChems.querySelector(`[data-demo-chem="${step.chemical}"]`) : null;
// 
//     if (!button) {
//       runDemoStep(stepIndex + 1);
//       return;
//     }
// 
//     showDemoPointer(button);
//     button.classList.add('demo-tap');
// 
//     demoTimer = setTimeout(() => {
//       if (mode !== 'demo') return;
//       button.classList.remove('demo-tap');
//   //       animatePour(button, step.chemical, step.amount, {
//         land() {
//           demoMixture[step.chemical] += step.amount;
//           const last = demoLayers[demoLayers.length - 1];
//           if (last?.name === step.chemical) last.amount += step.amount;
//           else demoLayers.push({ name: step.chemical, amount: step.amount });
//           renderDemo();
//         },
//         finish() {
//           demoTimer = setTimeout(() => {
//             if (mode === 'demo') runDemoStep(stepIndex + 1);
//           }, 450); // Fastened snappy timing!
//         }
//       });
//     }, 450);
//   }
// 
//   function startAutomatedDemo() {
//     clearEffects();
//     clearTimeout(demoTimer);
// //     preparePourAudio();
//     mode = 'demo';
//     demoMixture = { Water: 0, ACN: 0, MeOH: 0 };
//     demoLayers = [];
//     demoComplete = false;
//     show('demo-screen');
//     renderDemo();
//     demoTimer = setTimeout(() => {
//       if (mode === 'demo') runDemoStep(0);
//     }, 550);
//   }
// 
//   /* Screen 3: Let's Try */
//   function showTryScreen() {
//     clearEffects();
//     clearTimeout(demoTimer);
//     mode = 'try';
//     show('try-screen');
//   }
// 
  /* Screen 4: Solution Title Screen */
  function showSolutionIntro(recipeIndex = 0) {
    clearEffects();
    clearTimeout(demoTimer);
    mode = 'solution-intro';
    index = recipeIndex;
    show('solution-intro');
    const introImages = ['column-cleaning', 'strong-wash', 'needle-wash', 'column-storage'];
    $('solution-intro-art').src = `assets/test-tube-game-assets/images/2-solution-name-page/${introImages[index]}-intro-page.webp`;
    $('solution-intro-art').setAttribute('alt', `${recipes[index].name}. Watch the preparation video before making the mix.`);
    $('solution-intro').setAttribute('aria-label', recipes[index].name);
  }

  /* Screen 5: Video of Solution */
  function updateVideoControls() {
    const video = $('recipe-video');
    if (!video) return;
    $('video-toggle').setAttribute('aria-label', video.error ? 'Retry Video' : 'Replay Video');
    $('video-status').classList.toggle('sr-only', !video.error);
    $('video-status').textContent = video.error
      ? 'The video could not load. Check your connection and retry.'
      : 'Watch the full video to see how this solution is prepared.';
  }

  function playRecipeVideo() {
    $('recipe-video')?.play().catch(() => { if (mode === 'video') updateVideoControls(); });
  }

  function showSolutionVideo(recipeIndex = index) {
    clearEffects();
    preparePourAudio();
    mode = 'video';
    index = recipeIndex;
    playing = false;
    show('lesson-video');
    $('video-progress').textContent = `SOLUTION ${index + 1} OF ${recipes.length} · VIDEO`;
    $('video-title').textContent = `${recipes[index].name}`;
    const video = $('recipe-video');
    video.pause();
    video.src = `assets/test-tube-game-assets/${recipeVideos[index]}?v=portrait-2`;
    video.playbackRate = 1.0;
    video.muted = false;
    video.volume = 1;
    video.setAttribute('aria-label', `${recipes[index].name} video`);
    video.load();
    updateVideoControls();
    playRecipeVideo();
  }

  /* Manual practice without a timer. */
  function beginPractice(recipeIndex = index) {
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

    // Practice has no timer or score.
    $('seconds').hidden = true;
    $('timer').hidden = true;
    $('running-score').hidden = true;

    // Target recipe shown clearly
    $('lesson-target').hidden = true;
    $('review').hidden = true;
    $('view-result').hidden = true;
    $('retry-round').hidden = true;

    $('progress').textContent = `SOLUTION ${index + 1} OF ${recipes.length}`;
    $('game-title').textContent = recipes[index].name;
    if ($('solution-name')) $('solution-name').textContent = recipes[index].name;

    $('target-recipe').innerHTML = chemicals.map(name => {
      const target = recipes[index].mix[name];
      return `<div class="recipe-ingredient${target ? '' : ' is-zero'}" style="--chemical:${colors[name]}">
        <span><i aria-hidden="true"></i>${name}</span>
        <strong>${target}<small>%</small></strong>
      </div>`;
    }).join('');

    arrangeSolvents();
    render();
    buttons.forEach(button => { button.disabled = false; });
    $('feedback').textContent = 'Select any solvent to add to the container.';
    show('game');
  }

  function finishPractice() {
    const correct = chemicals.every(name => mixture[name] === recipes[index].mix[name]);
    buttons.forEach(button => { button.disabled = true; });
    $('game').dataset.state = 'review';
    $('game').dataset.outcome = correct ? 'correct' : 'incorrect';
    const folder = correct ? '5-correct-answer-pop-up' : '6-wrong-answer-pop-up';
    const last = index === recipes.length - 1;
    $('practice-result').dataset.outcome = correct ? 'correct' : 'incorrect';
    $('practice-result-panel').src = `assets/test-tube-game-assets/images/${folder}/${correct ? 'popup-base-panel' : 'wrong-answer-base-panel'}.webp`;
    $('practice-result-panel').setAttribute('alt', correct ? 'Perfect blend!' : 'Let?s rework it!');
    $('practice-result-action').setAttribute('aria-label', correct ? (last ? 'Proceed to Challenge' : 'Next Solution') : 'Watch Video');
    $('practice-result-button').src = `assets/test-tube-game-assets/images/${folder}/${correct ? (last ? 'proceed-to-challenge-button-for-last-answer.webp' : 'next-solution%20button.webp') : 'watch-video-button.webp'}`;
    $('feedback').textContent = correct ? 'Perfect blend!' : 'Incorrect mix. Watch the video and try again.';
    $('practice-result').showModal();
    $('practice-result-action').focus({ preventScroll: true });
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
    if (!playing || mode !== 'game' || results.length === recipes.length) return;
    const remaining = Math.max(0, deadline - Date.now());
    const seconds = Math.ceil(remaining / 1000);
    $('seconds').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    $('timer').setAttribute('aria-valuenow', Math.ceil(remaining / 1000));
    $('timer-fill').style.width = `${remaining / 450}%`;
    $('timer').classList.toggle('urgent', remaining <= 10000);
    playTimerAudio(remaining);
    if (!remaining) expireChallenge();
  }

  function expireChallenge() {
    if (mode !== 'game') return;
    playing = false;
    clearInterval(interval);
    clearEffects();
    while (results.length < recipes.length) {
      results.push({ correct: false, timedOut: true, mix: results.length === index ? { ...mixture } : { Water: 0, ACN: 0, MeOH: 0 } });
    }
    showReport();
  }

  function startTestGame() {
    stopTimerAudio();
    prepareTimerAudio();
    index = 0;
    results = [];
    challengeRemaining = 45000;
    startTestRound();
  }

  function startTestRound() {
    clearEffects();
    clearInterval(interval);
    preparePourAudio();
    mode = 'game';
    deadline = Date.now() + challengeRemaining;
    mixture = { Water: 0, ACN: 0, MeOH: 0 };
    layers = [];
    playing = true;

    $('game').dataset.mode = 'game';
    $('game').dataset.state = 'playing';
    delete $('game').dataset.outcome;

    // Timer & running score active!
    $('seconds').hidden = false;
    $('timer').hidden = false;
    $('running-score').hidden = true;

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

    arrangeSolvents();
    render();
    show('game');

    tick();
    interval = setInterval(tick, 100);
  }

  function finishTestRound(timedOut = false, deferResult = false) {
    stopTimerAudio();
    if (!playing) return;
    challengeRemaining = Math.max(0, deadline - Date.now());
    clearInterval(interval);
    playing = false;

    const correct = !timedOut && chemicals.every(name => mixture[name] === recipes[index].mix[name]);
    results.push({ correct, timedOut, mix: { ...mixture } });

    buttons.forEach(button => { button.disabled = true; });
    $('game').dataset.state = deferResult ? 'settling' : 'review';
    $('game').dataset.outcome = correct ? 'correct' : 'incorrect';
    $('running-score').textContent = `Score ${results.filter(r => r.correct).length} / ${recipes.length}`;

    $('outcome').textContent = correct ? 'The perfect mix! +1 point' : timedOut ? 'Time’s up!' : 'Not quite the right mix';
    $('correct-recipe').textContent = `Correct recipe: ${recipeText(recipes[index].mix)}`;
    $('correct-recipe').hidden = false;
    $('feedback').textContent = `${$('outcome').textContent}. ${$('correct-recipe').textContent}`;

    $('retry-round').hidden = true;
    $('view-result').hidden = deferResult;
    $('next').textContent = index === recipes.length - 1 ? 'See Results →' : 'Next Round →';
    $('review').hidden = deferResult;

    renderMixResult(correct, timedOut);
    if (!deferResult) revealTestResult();
  }

  function revealTestResult() {
    if (mode !== 'game') return;
    $('game').dataset.state = 'review';
    $('review').hidden = false;
    $('view-result').hidden = false;
    $('mix-result').showModal();
    $('result-next').focus({ preventScroll: true });
  }

  function delayTestResult() {
    const round = index;
    const dispose = () => { clearTimeout(timer); effects.delete(dispose); };
    const timer = setTimeout(() => {
      dispose();
      if (mode === 'game' && index === round && $('game').dataset.state === 'settling') revealTestResult();
    }, 450);
    effects.add(dispose);
  }

  function renderMixResult(correct, timedOut = false) {
    const target = recipes[index].mix;
    const tube = (mix, label) => {
      const filled = chemicals.reduce((sum, name) => sum + mix[name], 0);
      return `<div class="comparison-card">
        <h3>${label}</h3>
        <span class="tube comparison-beaker" role="img" aria-label="${label}: ${recipeText(mix)}. ${filled}% filled">
          <img src="assets/test-tube-game-assets/images/4-slow-game-page/beaker.webp" alt="">
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
          : 'The beaker reached 100%, but the solvent amounts differ from the required recipe.';
    $('mix-result-tubes').innerHTML = tube(mixture, 'Your mixture') + tube(target, 'Correct recipe');
    $('mix-result-values').innerHTML = `<table class="comparison-table">
      <thead><tr><th scope="col">Solvent</th><th scope="col">Yours</th><th scope="col">Correct</th></tr></thead>
      <tbody>${chemicals.map(name => {
      const difference = mixture[name] - target[name];
      return `<tr class="${difference ? 'needs-change' : 'matches'}">
          <th scope="row"><span class="ingredient-dot" style="--chemical:${colors[name]}" aria-hidden="true"></span>${name}</th>
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
    const isBeaker = mode === 'practice' || mode === 'game';
    const mouthY = to.top - top + (isBeaker ? to.height * .15 : 0) - 32;
    const currentTotal = isDemo ? demoTotal() : total();
    const surfaceY = to.top - top + to.height * (isBeaker ? .88 - .64 * currentTotal / 100 : .96 - .84 * currentTotal / 100);
    const audioLength = pourAudioBuffer?.duration * 1000 || 0;
    const approach = 270, returnTime = 280;
    const duration = audioLength ? approach + audioLength + returnTime : isDemo ? 680 : 820;
    const stopSound = schedulePourSound(duration, audioLength ? approach : duration * .33);
    // Keep approach/return snappy while stretching the liquid stream to the full clip.
    const timedOffset = offset => {
      if (!audioLength) return offset;
      const time = offset <= .33 ? approach * offset / .33
        : offset <= .72 ? approach + audioLength * (offset - .33) / .39
          : approach + audioLength + returnTime * (offset - .72) / .28;
      return time / duration;
    };
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
      const timedFrames = frames.map(frame => frame.offset === undefined ? frame : { ...frame, offset: timedOffset(frame.offset) });
      const animation = node.animate(timedFrames, { duration, fill: 'both', easing: 'ease-in-out', ...options });
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
      { transform: tilted, opacity: 1, offset: audioLength ? .72 : .65 },
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

    if (callbacks) landingTimer = setTimeout(land, duration * timedOffset(.44));

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
      if (!chemicals.includes(name) || button.disabled || total() >= 100 || $('game').dataset.state === 'review') return;
      const amount = Math.min(pourSize(name), 100 - total());
      setPourBusy(true);
      commitPour(name, amount);
      activePourFinish = () => {
        activePourFinish = null;
        if (mode !== 'practice') return;
        setPourBusy(false);
        if (total() >= 100) finishPractice();
      };
      animatePour(button, name, amount, { finish: () => activePourFinish?.() });
      return;
    }

    if (mode === 'game') {
      if (!playing || button.disabled || !chemicals.includes(name) || total() >= 100) return;
      if (Date.now() >= deadline) { expireChallenge(); return; }
      const amount = Math.min(pourSize(name), 100 - total());
      setPourBusy(true);
      commitPour(name, amount);
      const complete = total() === 100;
      if (complete) finishTestRound(false, true);
      activePourFinish = () => {
        activePourFinish = null;
        if (mode !== 'game') return;
        if (complete) {
          $('game').dataset.pouring = 'false';
          $('chemicals').setAttribute('aria-busy', 'false');
          delayTestResult();
        } else setPourBusy(false);
      };
      animatePour(button, name, amount, { finish: () => activePourFinish?.() });
    }
  }

  function next() {
    $('mix-result')?.close();
    $('practice-result')?.close();
    clearEffects();

    if (mode === 'practice') {
      if ($('game').dataset.outcome !== 'correct') return;
      if (index < recipes.length - 1) {
        index++;
        showSolutionIntro(index);
      } else {
        showReadyScreen();
      }
      return;
    }

    if (mode === 'game') {
      if (playing || $('game').dataset.state === 'settling') return;
      if (results.length < recipes.length && challengeRemaining <= 0) { expireChallenge(); return; }
      if (index < recipes.length - 1) {
        index++;
        startTestRound();
      } else {
        showReport();
      }
    }
  }

  function renderReportTube(mix, label, isTarget = false, isMatched = true) {
    const filled = chemicals.reduce((sum, name) => sum + (mix[name] || 0), 0);
    const chips = chemicals
      .filter(name => mix[name])
      .map(name => `<span class="mini-chip" style="--c:${colors[name]}"><i aria-hidden="true"></i>${name} <strong>${mix[name]}%</strong></span>`)
      .join('');

    return `<div class="report-tube-item ${isTarget ? 'is-target-tube' : isMatched ? 'is-matched' : 'is-mismatched'}">
      <span class="report-tube-badge">${label}</span>
      <div class="report-tube-visual">
        <span class="tube report-tube-glass" role="img" aria-label="${label}: ${recipeText(mix)}. ${filled}% filled">
          <img src="assets/test-tube.png" alt="">
          <span class="mixture">
            ${chemicals.map(name => `<span class="liquid-layer" style="height:${mix[name] || 0}%;--chemical:${colors[name]}"></span>`).join('')}
          </span>
        </span>
        <span class="report-tube-fill-num">${filled}%</span>
      </div>
      <div class="report-tube-recipe-chips">${chips || '<span class="mini-chip empty">Empty (0%)</span>'}</div>
    </div>`;
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

    const iconPaths = [
      '<path d="M8 3h8M9 3v16a3 3 0 0 0 6 0V3M9 8h6M9 13h6M9 18h6"/>',
      '<path d="M12 3C9 8 5 11 5 15a7 7 0 0 0 14 0c0-4-4-7-7-12Z"/>',
      '<path d="m6 18 10-10M4 20l2-2M13 5l6 6M16 2l6 6M15 7l3-3M8 12l4 4M5 15l4 4"/>',
      '<path d="M4 6h16v4H4zM6 10v11h12V10M10 13h4v3h-4z"/>'
    ];
    $('results').innerHTML = recipes.map((recipe, i) => {
      const res = results[i] || { correct: false };
      return `<div class="report-solution" style="--badge-color:${['#00e9ef', '#ffbf55', '#ad65eb', '#50dd9c'][i]}">
        <span class="report-solution-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPaths[i]}</svg></span>
        <strong>${recipe.name}</strong>
        <span class="report-solution-status ${res.correct ? 'is-correct' : 'is-incorrect'}" role="img" aria-label="${res.correct ? 'Correct' : 'Incorrect'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${res.correct ? '<path d="m4 12 5 5L20 5"/>' : '<path d="m5 5 14 14M19 5 5 19"/>'}</svg></span>
        <button class="image-control report-watch" type="button" data-report-video="${i}" aria-label="Watch ${recipe.name} video"><img src="assets/test-tube-game-assets/images/9-report-page/watch-video-button.webp" alt="" draggable="false"></button>
      </div>`;
    }).join('');
  }

  /* Event Listeners */
  buttons.forEach(button => button.addEventListener('click', () => pour(button.dataset.chemical, button)));

  // Start now opens the first solution directly, without the automatic demo.
  $('play').addEventListener('click', () => {
    preparePourAudio();
    showSolutionIntro(0);
  });

  // Disabled automatic demo controls:
  // $('demo-replay').addEventListener('click', startAutomatedDemo);
  // $('demo-next').addEventListener('click', showTryScreen);
  // $('try-btn').addEventListener('click', () => showSolutionIntro(0));

  // Screen 4: Solution Intro
  $('solution-intro-btn').addEventListener('click', () => showSolutionVideo(index));

  // Screen 5: Video of Solution
  $('video-toggle').addEventListener('click', () => {
    const video = $('recipe-video');
    if (!video) return;
    if (video.error) video.load();
    video.currentTime = 0;
    playRecipeVideo();
  });
  $('video-next').addEventListener('click', () => beginPractice(index));
  for (const event of ['play', 'pause', 'error']) {
    $('recipe-video').addEventListener(event, updateVideoControls);
  }
  $('recipe-video').addEventListener('ended', () => {
    if (mode === 'video') {
      updateVideoControls();
      $('video-next').focus({ preventScroll: true });
    }
  });

  $('practice-result-action').addEventListener('click', () => {
    if (mode !== 'practice' || $('game').dataset.state !== 'review') return;
    if ($('game').dataset.outcome === 'correct') next();
    else showSolutionVideo(index);
  });
  $('practice-result').addEventListener('cancel', event => event.preventDefault());

  // Screen 6 & Ready & Game Controls
  $('start-game').addEventListener('click', startTestGame);
  $('retry-round').addEventListener('click', () => {
    if (mode === 'game') startTestRound();
    else beginPractice(index);
  });
  $('next').addEventListener('click', next);
  $('result-next').addEventListener('click', next);
  $('close-result').addEventListener('click', () => $('mix-result').close());
  $('view-result').addEventListener('click', () => {
    if (mode === 'game' && !playing) $('mix-result').showModal();
  });

  $('results').addEventListener('click', event => {
    const button = event.target.closest?.('[data-report-video]');
    if (mode !== 'report' || !button) return;
    const recipeIndex = Number(button.dataset.reportVideo);
    if (Number.isInteger(recipeIndex) && recipeIndex >= 0 && recipeIndex < recipes.length) showSolutionVideo(recipeIndex);
  });

  // Screen 7: Report Controls
  $('retry').addEventListener('click', () => {
    index = 0;
    results = [];
    showOpening();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopTimerAudio();
      const finish = activePourFinish;
      if (finish) { clearEffects(); finish(); }
      pourSounds.forEach(stop => stop());
      if (mode === 'video') $('recipe-video')?.pause();
    }
  });

  window.addEventListener('pagehide', () => {
    stopTimerAudio();
    clearTimeout(demoTimer);
    clearInterval(interval);
    $('recipe-video')?.pause();
    clearEffects();
  });

  let viewportWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth !== viewportWidth) {
      const finish = activePourFinish;
      clearEffects();
      finish?.();
    }
    viewportWidth = window.innerWidth;
  });
})();

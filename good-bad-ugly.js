/* Three-lane adaptation of the supplied Infinite Scroller. */
'use strict';
const LANE_LABELS = ['Good', 'Bad', 'Ugly'];
const SCENARIOS = [
  { prompt: 'Pre-assumption of sample reading', lane: 2 },
  { prompt: 'Not wearing the required PPE', lane: 1 },
  { prompt: 'Reusage of butter paper', lane: 1 },
  { prompt: 'Usage of dried flask when adding samples', lane: 0 },
  { prompt: 'Excess sample from gross weight can be discarded', lane: 0 },
  { prompt: 'Vial can be filled as preferred', lane: 1 },
  { prompt: 'Check expiry dates of the standards/solvents', lane: 0 },
  { prompt: 'Place the vials in the tray in any order you prefer', lane: 2 },
  { prompt: 'Usage of solvent from the same batch/lot throughout the analysis', lane: 0 },
  { prompt: 'Ignore the flask labeling', lane: 2 }
];
const ROUND_COUNT = 5;
const CARS = [
  { name: 'Fiat Classic', file: '1-fiat-default.webp', rank: 'ROOKIE' },
  { name: 'Ambassador', file: '2-ambassador-white.webp', rank: 'STREET LEGEND' },
  { name: 'Maruti', file: '3-maruti-white.webp', rank: 'CITY RACER' },
  { name: 'Honda', file: '4-honda-white.webp', rank: 'SPORT CLASS' },
  { name: 'Benz', file: '5-benz-white.webp', rank: 'ELITE CLASS' },
  { name: 'Ferrari', file: '6-ferrari-white.webp', rank: 'SUPER CAR' }
];
const carAsset = car => `assets/good-bad-ugly-assets/${car.file}`;
const CAR_COLORS = [
  { id: 'original', name: 'Original', hex: '#eee9d8' },
  { id: 'red', name: 'Ruby', hex: '#cc3045' },
  { id: 'blue', name: 'Ocean', hex: '#287cce' },
  { id: 'green', name: 'Emerald', hex: '#299969' },
  { id: 'gold', name: 'Gold', hex: '#dfa62f' },
  { id: 'purple', name: 'Purple', hex: '#854dce' },
  { id: 'orange', name: 'Orange', hex: '#ed782c' },
  { id: 'pink', name: 'Pink', hex: '#e85ba1' },
  { id: 'teal', name: 'Teal', hex: '#24b7b0' },
  { id: 'silver', name: 'Silver', hex: '#b8c3d0' },
  { id: 'black', name: 'Black', hex: '#343b48' }
];
class GarageProgress {
  constructor(saved = {}) {
    this.level = 1;
    this.selected = 0;
    this.champion = false;
    this.colors = CARS.map((_, index) => {
      const value = saved && Array.isArray(saved.colors) ? saved.colors[index] : null;
      return CAR_COLORS.some(color => color.id === value) ? value : 'original';
    });
  }
  paint(color) {
    if (!CAR_COLORS.some(option => option.id === color)) return false;
    this.colors[this.selected] = color; return true;
  }
  preferences() { return { colors: [...this.colors] }; }
  select(index) { if (!Number.isInteger(index) || index < 0 || index >= this.level) return false; this.selected = index; return true; }
  complete(run) {
    if (!run.finished || run.count !== ROUND_COUNT || run.score !== ROUND_COUNT) return { passed: false, unlocked: null };
    if (this.level < CARS.length) { const unlocked = this.level; this.level++; return { passed: true, unlocked }; }
    this.champion = true; return { passed: true, unlocked: null };
  }
}
function shuffleLaneLabels(random = Math.random, previous = []) {
  const orders = [
    ['Good', 'Bad', 'Ugly'], ['Good', 'Ugly', 'Bad'],
    ['Bad', 'Good', 'Ugly'], ['Bad', 'Ugly', 'Good'],
    ['Ugly', 'Good', 'Bad'], ['Ugly', 'Bad', 'Good']
  ].filter(order => order.some((label, index) => label !== previous[index]));
  return [...orders[Math.floor(random() * orders.length)]];
}
class GoodBadUglyRun {
  constructor(random = Math.random, options = shuffleLaneLabels(random), level = 1) { this.level = Number.isInteger(level) ? Math.max(1, Math.min(CARS.length, level)) : 1; this.options = [...options]; this.random = random; this.score = 0; this.streak = 0; this.best = 0; this.lives = 3; this.misses = []; this.bag = []; this.round = null; this.count = 0; this.boosts = 0;  }
  next() {
    if (this.finished) return null;
    if (!this.bag.length) { this.bag = SCENARIOS.map((_, i) => i); for (let i = this.bag.length - 1; i > 0; i--) { const j = Math.floor(this.random() * (i + 1)); [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]; } }
    const index = this.bag.pop(); const { prompt, lane } = SCENARIOS[index];
    this.round = { index, prompt, answer: LANE_LABELS[lane], lane: this.options.indexOf(LANE_LABELS[lane]), options: [...this.options], resolved: false };
    return this.round;
  }
  resolve(lane) {
    if (!this.round || this.round.resolved || this.finished) return null;
    this.round.resolved = true; this.count++; const correct = lane === this.round.lane;
    if (correct) { this.streak++; this.best = Math.max(this.best, this.streak); this.score++; this.boosts++; }
    else { this.lives--; this.streak = 0; this.misses.push({ prompt: this.round.prompt, answer: this.round.answer, selected: this.round.options[lane] }); }
    return correct;
  }
  get finished() { return !this.lives || this.count >= ROUND_COUNT; }
  get multiplier() { return 1.3 + this.boosts * .1; }
  get duration() { return Math.max(3, 3.8 - this.boosts * .2) / (1 + (this.level - 1) * .06); }
}
function gatePosition(progress, height, reverse = false) {
  const carHeight = Math.min(height * .24, 130);
  const crossing = height - 48 - carHeight / 2 - 37;
  const position = -100 + Math.max(0, Math.min(1, progress)) * (crossing + 100);
  return reverse ? height - position - 74 : position;
}
function advanceCar(position, target, dt) {
  const next = position + (target - position) * (1 - Math.exp(-12 * dt));
  return Math.abs(next - target) < .0005 ? target : next;
}
// Missing level art keeps the current side, or finds another numbered image on first load.
async function findEnvironment(level, side, load, current = null) {
  const levels = [level, ...[1, 2, 3, 4, 5].filter(value => value !== level)];
  for (const candidate of levels) {
    const path = `assets/good-bad-ugly-assets/${candidate}-bg-${side}.webp`;
    if (await load(path)) return path;
    if (candidate === level && current) return current;
  }
  return null;
}
function needsPortraitPrompt(viewportWidth, viewportHeight, touchFirst) {
  return touchFirst && viewportWidth > viewportHeight;
}
if (typeof module !== 'undefined') module.exports = { GoodBadUglyRun, SCENARIOS, LANE_LABELS, ROUND_COUNT, CARS, CAR_COLORS, GarageProgress, advanceCar, gatePosition, findEnvironment, shuffleLaneLabels, needsPortraitPrompt };
if (typeof document !== 'undefined') (() => {
  const $ = id => document.getElementById(id);
  const reverse = document.body.dataset.direction === 'reverse';
  const shell = document.querySelector('.shell');
  const raceScene = document.querySelector('.race-scene');
  let sceneryOffset = 0, drivingDistance = 0, boostRemaining = 0;
  let layoutLevel = 0, levelOptions = [];
  const categoryIndex = label => LANE_LABELS.indexOf(label);
  const track = $('track'), canvas = $('road'), ctx = canvas.getContext('2d');
  let run, state = 'home', lane = 1, elapsed = 0, wait = 0, offset = 0, previous = 0, width = 0, height = 0, orientationPaused = false, countdown = 0, readingRemaining = 0;
  let audioContext, buffers = {}, gestureX, carPosition = .5, carAngle = 0;
  const progressKey = 'good-bad-ugly-colors-v1';
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(progressKey) || '{}') || {}; } catch (_) {}
  const progress = new GarageProgress(saved);
  const environment = { left: null, right: null };
  let environmentRequest = 0;
  function loadEnvironmentImage(path) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image.naturalWidth > 0);
      image.onerror = () => resolve(false);
      image.src = path;
    });
  }
  async function applyEnvironment() {
    const request = ++environmentRequest;
    await Promise.all(['left', 'right'].map(async side => {
      const path = await findEnvironment(progress.level, side, loadEnvironmentImage, environment[side]);
      if (request !== environmentRequest || !path) return;
      environment[side] = path;
      raceScene.style.setProperty(`--environment-${side}`, `url("${path}")`);
    }));
  }
  applyEnvironment();
  function saveProgress() { try { localStorage.setItem(progressKey, JSON.stringify(progress.preferences())); } catch (_) {} }
  const paintedCars = new Map();
  function paintedCar(index, colorId, source = carAsset(CARS[index])) {
    if (colorId === 'original') return Promise.resolve(source);
    const key = `${source}:${colorId}`;
    if (!paintedCars.has(key)) paintedCars.set(key, new Promise(resolve => {
      const image = new Image();
      image.onerror = () => resolve(source);
      image.onload = () => {
        try {
          const surface = document.createElement('canvas');
          const scale = Math.min(1, 768 / image.naturalHeight);
          surface.width = Math.round(image.naturalWidth * scale); surface.height = Math.round(image.naturalHeight * scale);
          const paint = surface.getContext('2d');
          paint.drawImage(image, 0, 0, surface.width, surface.height);
          const pixels = paint.getImageData(0, 0, surface.width, surface.height);
          const hex = CAR_COLORS.find(color => color.id === colorId).hex;
          const rgb = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
          for (let i = 0; i < pixels.data.length; i += 4) {
            const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
            const high = Math.max(r, g, b), low = Math.min(r, g, b);
            // All current cars have light body panels; retain dark glass, tyres, and colored lamps.
            const lightBody = low > 105 && high - low < 65;
            if (!pixels.data[i + 3] || !lightBody) continue;
            const shade = high / 255;
            const highlight = Math.max(0, (low - 225) / 30) * .65;
            for (let channel = 0; channel < 3; channel++) pixels.data[i + channel] = rgb[channel] * shade * (1 - highlight) + 255 * highlight;
          }
          paint.putImageData(pixels, 0, 0); resolve(surface.toDataURL('image/png'));
        } catch (_) { resolve(source); }
      };
      image.src = source;
    }));
    return paintedCars.get(key);
  }
  function showPaint(image, index) {
    const color = progress.colors[index];
    const source = image.id === 'garage-preview'
      ? `assets/good-bad-ugly-assets/cars-iso-view/${CARS[index].file.replace('.webp', '-front-view.webp')}`
      : carAsset(CARS[index]);
    image.src = source;
    image.dataset.paint = `${index}:${color}`;
    paintedCar(index, color, source).then(source => { if (image.dataset.paint === `${index}:${color}`) image.src = source; });
  }
  function applyCar() { showPaint($('car'), progress.selected); $('car').alt = `Your ${CARS[progress.selected].name}, ${CAR_COLORS.find(color => color.id === progress.colors[progress.selected]).name}`; }
  function updateGarageArrows() {
    const row = $('garage-cars');
    $('garage-prev').disabled = row.scrollLeft <= 1;
    $('garage-next').disabled = row.scrollLeft >= row.scrollWidth - row.clientWidth - 1;
  }
  function scrollGarage(direction) {
    const row = $('garage-cars');
    row.scrollBy({ left: direction * row.clientWidth * .8, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  function renderGaragePreview() {
    const car = CARS[progress.selected];
    showPaint($('garage-preview'), progress.selected);
    $('garage-preview').alt = car.name;
    $('garage-preview-name').textContent = car.name;
    $('garage-preview-rank').textContent = car.rank;
    const color = CAR_COLORS.find(item => item.id === progress.colors[progress.selected]);
    $('garage').style.setProperty('--garage-accent', color.hex);
    if (!reducedMotion.matches) $('garage-preview').animate([
      { opacity: 0, transform: 'translateY(16px) scale(.92)', filter: 'brightness(1.8)' },
      { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'brightness(1)' }
    ], { duration: 550, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
  function renderColors() {
    $('paint-title').textContent = `${CARS[progress.selected].name} paint`;
    $('car-colors').replaceChildren();
    CAR_COLORS.forEach(color => {
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'paint-option'; button.style.setProperty('--paint-color', color.hex);
      button.setAttribute('aria-label', color.name); button.title = color.name; button.setAttribute('aria-pressed', String(progress.colors[progress.selected] === color.id));
      button.addEventListener('click', () => {
        progress.paint(color.id); saveProgress(); applyCar(); renderColors(); renderGaragePreview();
        const image = $('garage-cars').children[progress.selected].querySelector('img'); showPaint(image, progress.selected);
        $('car-colors').children[CAR_COLORS.indexOf(color)].focus();
      });
      $('car-colors').append(button);
    });
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function motionEnabled() { return true; }
  track.classList.add('car-sway-enabled');
  function wrongImpact() { shell.classList.remove('wrong-impact'); void shell.offsetWidth; shell.classList.add('wrong-impact'); }
  shell.addEventListener('animationend', event => { if (event.target === shell) shell.classList.remove('wrong-impact'); });
  function resetEffects() { track.querySelectorAll('.answer-confetti-gif').forEach(image => image.remove()); boostRemaining = 0; shell.classList.remove('wrong-impact'); carPosition = .5; carAngle = 0; track.querySelectorAll('.answer-confetti').forEach(el => el.remove()); $('car').style.left = '0px'; $('car').style.transform = `translateX(${width * carPosition}px) translateX(-50%) rotate(${reverse ? 180 : 0}deg)`; $('boost-cue').hidden = true; $('powerup').classList.remove('show'); }

  const buttonClick = new Audio('audio/gbu-button-click-sfx.mp3');
  buttonClick.preload = 'auto';
  buttonClick.volume = .25;
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    try {
      buttonClick.currentTime = 0;
      buttonClick.play().catch(() => {});
    } catch (_) { /* Audio availability must not interrupt button actions. */ }
  }, { capture: true });
  const countdownAudio = new Audio('audio/gbu-countdown-audio.wav');
  countdownAudio.preload = 'auto';
  countdownAudio.volume = .5;
  function playCountdown(restart = false) {
    try {
      if (restart) countdownAudio.currentTime = 0;
      countdownAudio.play().catch(() => {});
    } catch (_) { /* Keep the visual countdown available if audio cannot play. */ }
  }
  const bgMusic = new Audio('audio/lanerush-bgm.mp3');
  bgMusic.loop = true; bgMusic.volume = .35; bgMusic.preload = 'auto';
  function playMusic() { bgMusic.play().catch(() => {}); }
  async function unlockAudio() {
    try { if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)(); await audioContext.resume();
      for (const name of ['correct', 'wrong']) { if (!buffers[name]) fetch(`audio/lanerush-${name}.mp3`).then(r => r.arrayBuffer()).then(data => audioContext.decodeAudioData(data)).then(buffer => { buffers[name] = buffer; }).catch(() => {}); }
    } catch (_) { /* Sound is optional. */ }
  }
  function sound(name) { if (!audioContext || !buffers[name] || audioContext.state !== 'running') return; const source = audioContext.createBufferSource(); source.buffer = buffers[name]; source.connect(audioContext.destination); source.start(); }
  function fit() { const rect = track.getBoundingClientRect(); width = rect.width; height = rect.height; const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); const landscape = needsPortraitPrompt(window.innerWidth, window.innerHeight, window.matchMedia('(pointer: coarse)').matches); $('rotate').hidden = !landscape; if (landscape && state === 'playing') { orientationPaused = true; pause(); } else if (!landscape && orientationPaused) { orientationPaused = false; } }
  function steer(next) { if (state !== 'playing' || wait || countdown) return; const target = Math.max(0, Math.min(2, next)); const direction = target - lane;
    if (!direction) return;
    lane = target;
    updateLane(); }
  function updateLane() {
    $('lane-glow').style.setProperty('--lane-color', ['#5cff7d', '#ffca39', '#ff344c'][categoryIndex(run.options[lane])]);
    $('lane-glow').style.transform = `translateX(${lane * 100}%)`;
    track.dataset.lane = lane;
  }
  function makeIcon(name) {
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 48 48'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '3'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
    const paths = {
      check: ['M24 3a21 21 0 1 0 0 42a21 21 0 1 0 0-42', 'M13 24l8 8 15-17'],
      warning: ['M24 4L3 42h42L24 4Z', 'M24 17v12', 'M24 35v1'],
      rules: ['M12 7h24v36H12Z', 'M18 7V3h12v4', 'M18 17h12M18 25h12M18 33h8'],
      goggles: ['M4 17h40v15H28l-4-8-4 8H4Z', 'M4 17L1 12M44 17l3-5'],
      report: ['M10 4h22l8 8v32H10Z', 'M32 4v10h8M17 22h16M17 29h16M17 36h9'],
      equipment: ['M5 40h38M13 40V12h22v28M18 12V5h12v7M18 21h12M24 28v6'],
      bench: ['M4 28h40M8 28v16M40 28v16M12 28V14h9v14M30 28V8h8v20M9 8l12 3']
    };
    for (const d of paths[name]) { const path = document.createElementNS(ns, 'path'); path.setAttribute('d', d); svg.append(path); }
    return svg;
  }
  function answerCelebration() {
    if (reducedMotion.matches) return;
    track.querySelectorAll('.answer-confetti-gif').forEach(image => image.remove());
    const burst = document.createElement('img');
    burst.className = 'answer-confetti-gif';
    burst.src = 'assets/good-bad-ugly-assets/confetti.gif';
    burst.alt = '';
    burst.setAttribute('aria-hidden', 'true');
    track.append(burst);
    window.setTimeout(() => burst.remove(), 3000);
  }
  function showFeedback(correct) {
    const feedback = $('feedback'); feedback.replaceChildren();
    feedback.classList.toggle('bad', !correct);
    feedback.classList.toggle('feedback-success', correct);
    if (correct) {
      const icon = makeIcon('check'), label = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true'); label.textContent = 'Correct';
      feedback.append(icon, label);
      answerCelebration();
      $(`gate-${run.round.lane}`).classList.add('match-pulse');
      return;
    }
    feedback.style.setProperty('--answer-color', ['#8effbc', '#ffdb7a', '#ff647e'][categoryIndex(run.round.answer)]);
    const caption = document.createElement('small'), answer = document.createElement('strong'), hint = document.createElement('span');
    caption.textContent = correct ? (run.streak >= 3 ? `${run.streak} IN A ROW!` : 'NAILED IT!') : 'THE RIGHT LANE WAS';
    answer.textContent = run.round.answer.toUpperCase();
    hint.textContent = correct ? 'Keep the streak going!' : ['GO LEFT', 'CHOOSE CENTER', 'GO RIGHT'][run.round.lane];
    feedback.append(caption, answer, hint);
    feedback.classList.remove('feedback-pop'); void feedback.offsetWidth; feedback.classList.add('feedback-pop');
  }
  function powerup() {
    boostRemaining = 1.1;

  }
  function hud() { $('race-level').textContent = `LEVEL ${progress.level}`; $('race-progress').textContent = `${Math.min(run.count + 1, ROUND_COUNT)} / ${ROUND_COUNT}`; }
  function nextRound() { const round = run.next(); elapsed = 0; readingRemaining = 2; $('question').textContent = round.prompt; $('round-time').style.transform = 'scaleX(1)'; $('feedback').textContent = ''; $('feedback').classList.remove('feedback-success', 'feedback-pop', 'bad'); $('gates').hidden = true; for (let i = 0; i < 3; i++) { $(`gate-${i}`).replaceChildren(); const icon = document.createElement('span'), label = document.createElement('strong'); icon.append(makeIcon(round.options[i] === 'Good' ? 'check' : 'warning')); icon.setAttribute('aria-hidden', 'true'); label.textContent = round.options[i]; $(`gate-${i}`).append(icon, label); $(`gate-${i}`).className = `gate lane-${categoryIndex(round.options[i])}`; } $('gates').style.transform = `translateY(${gatePosition(0, height, reverse)}px)`; }
  function start() { if (state !== 'paused') bgMusic.currentTime = 0; playMusic(); $('instructions').hidden = true; $('home').hidden = true; unlockAudio(); if (state === 'paused') { if (countdown > 0 || (countdownAudio.currentTime > 0 && countdownAudio.currentTime < 4)) playCountdown(); state = 'playing'; $('overlay').classList.remove('race-report'); previous = 0; $('overlay').hidden = true; $('pause').disabled = false; return; } resetEffects(); applyCar(); applyEnvironment(); $('garage').hidden = true; $('unlock').hidden = true; $('boost-cue').querySelector('span').textContent = `LEVEL ${progress.level} | FIVE QUESTIONS`; $('overlay').classList.remove('race-report'); track.classList.remove('boosted'); if (layoutLevel !== progress.level) { levelOptions = progress.level === 1 ? [...LANE_LABELS] : shuffleLaneLabels(Math.random, levelOptions); layoutLevel = progress.level; } run = new GoodBadUglyRun(Math.random, levelOptions, progress.level); state = 'playing'; wait = 0; countdown = 0; previous = 0; lane = 1; hud(); updateLane(); countdown = 3; playCountdown(true); $('gates').hidden = true; $('feedback').textContent = ''; $('boost-cue').hidden = false; $('boost-cue').querySelector('strong').textContent = '3'; $('boost-cue').classList.add('count-beat'); $('question').textContent = 'Get ready to race'; $('overlay').hidden = true; $('pause').disabled = false; fit(); }
  function pause() { if (state !== 'playing') return; state = 'paused'; bgMusic.pause(); countdownAudio.pause(); $('overlay').classList.remove('race-report'); $('pause').disabled = true; $('overlay').hidden = false; $('tag').textContent = 'PIT STOP'; $('title').textContent = 'Race paused'; $('description').textContent = 'Your run is waiting. Ready to get back on track?'; $('review').hidden = true; $('start').textContent = 'Resume racing'; }
  function openGarage() {
    state = 'garage'; bgMusic.pause(); $('home').hidden = true; $('instructions').hidden = true; $('overlay').hidden = true; $('unlock').hidden = true; $('garage').hidden = false; $('pause').disabled = true;
    $('garage-level').textContent = progress.champion ? 'CHAMPION | ALL CARS UNLOCKED' : `LEVEL ${progress.level} | ${progress.level} / ${CARS.length} CARS UNLOCKED`;
    $('garage-goal').textContent = progress.level < CARS.length ? `Score 5/5 to unlock ${CARS[progress.level].name}.` : 'Score 5/5 to claim the championship.';
    $('garage-cars').replaceChildren();
    CARS.forEach((car, index) => {
      const card = document.createElement('button'), image = document.createElement('img'), name = document.createElement('strong'), status = document.createElement('small');
      card.className = 'garage-card'; card.disabled = index >= progress.level; card.classList.toggle('selected', index === progress.selected); card.setAttribute('aria-pressed', String(index === progress.selected));
      showPaint(image, index); image.alt = car.name; name.textContent = car.name; status.textContent = index >= progress.level ? `LOCKED | CLEAR LEVEL ${index}` : index === progress.selected ? 'SELECTED' : 'TAP TO SELECT';
      card.append(image, name, status); card.addEventListener('click', () => { if (progress.select(index)) { saveProgress(); applyCar(); openGarage(); const cards = $('garage-cars').querySelectorAll('button'); cards[index].focus(); } }); $('garage-cars').append(card);
    });
    renderColors(); renderGaragePreview();
    requestAnimationFrame(updateGarageArrows);
    $('garage-race').textContent = `RACE LEVEL ${progress.level}`; $('garage-race').focus();
  }
  function celebrate(unlocked, clearedLevel) {
    $('overlay').hidden = true; $('unlock').hidden = false; state = 'unlock';
    const car = CARS[unlocked === null ? progress.selected : unlocked];
    $('unlock-tag').textContent = unlocked === null ? 'CHAMPIONSHIP WON' : 'NEW CAR UNLOCKED';
    $('unlock-title').textContent = unlocked === null ? 'You own the track.' : car.name;
    showPaint($('unlock-image'), unlocked === null ? progress.selected : unlocked); $('unlock-image').alt = car.name;
    $('unlock-rank').textContent = unlocked === null ? 'CHAMPION' : car.rank;
    $('unlock-copy').textContent = `Level ${clearedLevel} cleared${unlocked === null ? ' ? Champion!' : ''}`;
    $('confetti').replaceChildren();
    if (!reducedMotion.matches) for (let i = 0; i < 30; i++) { const piece = document.createElement('i'); piece.style.setProperty('--x', `${(i * 37) % 100}%`); piece.style.setProperty('--delay', `${(i % 8) * .12}s`); piece.style.setProperty('--color', ['#8effbc', '#ffdb7a', '#ff647e'][i % 3]); $('confetti').append(piece); }
    if (audioContext?.state === 'running') [523,659,784,1047].forEach((note, index) => { const tone = audioContext.createOscillator(), gain = audioContext.createGain(), at = audioContext.currentTime + index * .12; tone.frequency.value = note; gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.09,at+.02); gain.gain.exponentialRampToValueAtTime(.001,at+.3); tone.connect(gain); gain.connect(audioContext.destination); tone.start(at); tone.stop(at+.32); });
    $('unlock-garage').focus();
  }
  function finish() {
    bgMusic.pause(); resetEffects(); state = 'report'; $('gates').hidden = true; $('pause').disabled = true;
    const clearedLevel = progress.level, result = progress.complete(run);
    if (result.passed) { saveProgress(); celebrate(result.unlocked, clearedLevel); return; }
    $('overlay').classList.remove('report-enter');
    $('overlay').classList.add('race-report'); $('overlay').hidden = false; $('tag').textContent = `LEVEL ${progress.level} | RACE RESULTS`; $('title').textContent = `${run.score}/5`;
    $('description').replaceChildren(); const message = document.createElement('span'); message.textContent = `Get 5/5 to unlock ${progress.level < CARS.length ? CARS[progress.level].name : "the championship"}.`; $('description').append(message);
    $('review').replaceChildren(); run.misses.forEach(miss => { const row = document.createElement('div'), title = document.createElement('strong'), answer = document.createElement('span'); title.textContent = miss.prompt; answer.textContent = miss.answer; answer.className = `review-category category-${miss.answer.toLowerCase()}`; row.append(title, answer); $('review').append(row); }); $('review').hidden = run.misses.length === 0; $('start').textContent = 'Retry level';
    void $('overlay').offsetWidth; $('overlay').classList.add('report-enter');
    $('start').focus();
  }
  function road(dt) {
    // Match world travel to the distance each gate covers in one round.
    const speed = run ? Math.abs(gatePosition(1, height) - gatePosition(0, height)) / run.duration : 100;
    const distance = dt * speed;
    offset = (offset + distance) % 100;
    drivingDistance += distance;
    boostRemaining = Math.max(0, boostRemaining - dt);
    // Use continuous travel so wrapping the road markings never snaps the scenery.
    sceneryOffset += distance;
    raceScene.style.setProperty('--scenery-offset', (reverse ? -sceneryOffset : sceneryOffset) + 'px');
    ctx.fillStyle = '#15202b'; ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 3; i++) {
      const x = width * i / 3, laneWidth = width / 3;
      const asphalt = ctx.createLinearGradient(x, 0, x + laneWidth, 0);
      asphalt.addColorStop(0, '#19212b'); asphalt.addColorStop(.5, '#252d36'); asphalt.addColorStop(1, '#19212b');
      ctx.fillStyle = asphalt; ctx.fillRect(x, 0, laneWidth, height);
      ctx.fillStyle = '#9ba3aa55'; ctx.fillRect(x + 2, 0, 2, height);
    }
    ctx.fillStyle = '#9ba3aa55'; ctx.fillRect(width - 4, 0, 2, height);
    for (const edge of [0, width - 7]) {
      ctx.fillStyle = '#10151a'; ctx.fillRect(edge, 0, 7, height);
      for (let y = (drivingDistance % 32) - 32; y < height; y += 32) { ctx.fillStyle = '#879096'; ctx.fillRect(edge + 1, y, 5, 26); ctx.fillStyle = '#b3bbc0'; ctx.fillRect(edge + 1, y, 2, 26); }
    }
    ctx.fillStyle = '#ffffff08'; for (let i = 0; i < 200; i++) { const x = (i * 47.3) % width, y = (i * 89.7 + offset) % height; ctx.fillRect(x, y, 1, 1); }
    if (state === 'playing' && !reducedMotion.matches && !countdown) {
      // Six simple canvas streaks: no extra DOM, timers, or animation loops.
      ctx.fillStyle = boostRemaining > 0 ? '#ffe6a34d' : '#dcecff24';
      for (let i = 0; i < 6; i++) {
        const x = i < 3 ? 10 + i * 3 : width - 12 - (i - 3) * 3;
        const y = ((drivingDistance * 1.5 + i * height / 3) % (height + 90)) - 90;
        ctx.fillRect(x, y, 1.5, boostRemaining > 0 ? 80 : 45);
      }
    }
    if (state === 'playing' && !countdown && progress.selected >= 4) {
      // The canvas is mirrored in reverse mode, placing exhaust behind either car.
      const carHeight = Math.min(height * .24, 130);
      const carImage = $('car');
      const carWidth = Math.min(86, width * .22);
      // object-fit:contain centers the artwork inside a potentially taller image box.
      const visibleHeight = carImage.naturalWidth > 0
        ? Math.min(carHeight, carWidth * carImage.naturalHeight / carImage.naturalWidth) : carHeight;
      const x = width * carPosition, y = visibleHeight / 2 - 2;
      const boosted = boostRemaining > 0;
      const pulse = reducedMotion.matches ? 1 : .85 + .15 * Math.sin(drivingDistance * .12);
      const length = (boosted ? 28 : 20) * pulse;
      ctx.save();
      ctx.translate(x, height - 48 - carHeight / 2); ctx.rotate(carAngle * Math.PI / 180);
      ctx.globalAlpha = boosted ? .75 : .5; ctx.shadowColor = '#168cff'; ctx.shadowBlur = boosted ? 6 : 3;
      for (const side of [-1, 1]) {
        const exhaustX = side * Math.min(86, width * .22) * .17;
        const flame = ctx.createLinearGradient(0, y - 3, 0, y + length);
        flame.addColorStop(0, '#ecfbff'); flame.addColorStop(.25, '#55d8ff'); flame.addColorStop(.65, '#168cff');
        flame.addColorStop(1, '#287bff00'); ctx.fillStyle = flame;
        ctx.beginPath(); ctx.moveTo(exhaustX - 3, y - 3); ctx.lineTo(exhaustX + 3, y - 3);
        ctx.lineTo(exhaustX + 1, y + length); ctx.lineTo(exhaustX - 1, y + length); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

  }
  function frame(time) {
    const dt = previous ? Math.min((time - previous) / 1000, .05) : 0; previous = time;
    if (state === 'playing' && !document.hidden) {
      // Freeze travel while the answer feedback timer continues.
      const travelDt = readingRemaining > 0 ? Math.max(0, dt - readingRemaining) : dt;
      const motionDt = wait > 0 ? 0 : countdown > 0 ? dt : Math.min(travelDt, Math.max(0, run.duration - elapsed));
      const targetPosition = (lane + .5) / 3;
      const oldPosition = carPosition;
      const steeringDt = wait > 0 ? 0 : dt;
      carPosition = advanceCar(carPosition, targetPosition, steeringDt);
      const velocity = steeringDt > 0 ? (carPosition - oldPosition) / steeringDt : 0;
      const targetAngle = !motionEnabled() ? 0 : Math.max(-24, Math.min(24, velocity * 12));
      carAngle += (targetAngle - carAngle) * (1 - Math.exp(-18 * steeringDt));
      road(wait > 0 ? 0 : readingRemaining > 0 ? dt : motionDt);
      $('car').style.left = '0px';
      $('car').style.transform = `translateX(${width * carPosition}px) translateX(-50%) rotate(${reverse ? 180 - carAngle : carAngle}deg)`;

      if (countdown > 0) {
        countdown = Math.max(0, countdown - dt);
        const number = String(Math.ceil(countdown));
        if ($('boost-cue').querySelector('strong').textContent !== number) {
          $('boost-cue').querySelector('strong').textContent = number;
          $('boost-cue').classList.remove('count-beat'); void $('boost-cue').offsetWidth; $('boost-cue').classList.add('count-beat');
        }
        if (!countdown) { $('boost-cue').hidden = true; nextRound(); }
      }
      else if (wait > 0) { wait = Math.max(0, wait - dt); if (!wait) { if (run.finished) finish(); else nextRound(); } }
      else {
        readingRemaining = Math.max(0, readingRemaining - dt);
        $('gates').hidden = readingRemaining > 0;
        elapsed += motionDt; const progress = Math.min(1, elapsed / run.duration); $('round-time').style.transform = `scaleX(${1 - progress})`; $('gates').style.transform = `translateY(${gatePosition(progress, height, reverse)}px)`;
        if (progress >= 1) { const correct = run.resolve(lane); hud(); if (correct && run.count > 0) powerup(); sound(correct ? 'correct' : 'wrong'); $(`gate-${run.round.lane}`).classList.add('correct'); if (!correct) $(`gate-${lane}`).classList.add('wrong'); for (let i = 0; i < 3; i++) if (i !== run.round.lane) $(`gate-${i}`).classList.add('answer-dimmed'); showFeedback(correct); if (!correct) wrongImpact(); wait = correct ? .65 : 1.8; }
      }
    } else if (state === 'home') road(dt);
    requestAnimationFrame(frame);
  }
  $('home-start').addEventListener('click', () => { playMusic(); unlockAudio(); $('home').hidden = true; $('instructions').hidden = false; $('level-start').focus(); }); $('level-start').addEventListener('click', openGarage); $('garage-race').addEventListener('click', start); $('unlock-garage').addEventListener('click', openGarage); $('home-garage').addEventListener('click', openGarage); $('garage-menu').addEventListener('click', () => { progress.level = 1; progress.selected = 0; progress.champion = false; layoutLevel = 0; applyCar(); applyEnvironment(); $('garage').hidden = true; $('home').hidden = false; state = 'home'; }); applyCar(); $('start').addEventListener('click', start); $('pause').addEventListener('click', pause);
  $('garage-prev').addEventListener('click', () => scrollGarage(-1));
  $('garage-next').addEventListener('click', () => scrollGarage(1));
  $('garage-cars').addEventListener('scroll', updateGarageArrows, { passive: true });
  window.addEventListener('resize', updateGarageArrows);
  const garageShowcase = document.querySelector('.garage-showcase');
  garageShowcase.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType !== 'mouse') return;
    const bounds = garageShowcase.getBoundingClientRect();
    garageShowcase.style.setProperty('--garage-tilt', ((event.clientX - bounds.left) / bounds.width - .5) * 12 + 'deg');
    garageShowcase.style.setProperty('--garage-pitch', (-(event.clientY - bounds.top) / bounds.height + .5) * 8 + 'deg');
  });
  garageShowcase.addEventListener('pointerleave', () => {
    garageShowcase.style.setProperty('--garage-tilt', '0deg');
    garageShowcase.style.setProperty('--garage-pitch', '0deg');
  });
  track.addEventListener('pointerdown', e => { gestureX = e.clientX; }); track.addEventListener('pointerup', e => { if (gestureX === undefined) return; const delta = e.clientX - gestureX; if (Math.abs(delta) > 25) steer(lane + (delta > 0 ? 1 : -1)); else steer(Math.floor((e.clientX - track.getBoundingClientRect().left) / (width / 3))); gestureX = undefined; }); track.addEventListener('pointercancel', () => { gestureX = undefined; });
  window.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); steer(lane + (e.key === 'ArrowLeft' ? -1 : 1)); } if (['1', '2', '3'].includes(e.key)) steer(Number(e.key) - 1); if (e.key === 'Escape') pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { bgMusic.pause(); pause(); } previous = 0; }); window.addEventListener('pagehide', () => { bgMusic.pause(); countdownAudio.pause(); }); window.addEventListener('resize', fit); if ('ResizeObserver' in window) new ResizeObserver(fit).observe(track); fit(); requestAnimationFrame(frame);
})();

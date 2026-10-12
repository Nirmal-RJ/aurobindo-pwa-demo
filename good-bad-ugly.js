/* Three-lane adaptation of the supplied Infinite Scroller. */
'use strict';
const LANE_LABELS = ['Good', 'Bad', 'Ugly'];
const SCENARIOS = [
  { prompt: 'Followed the lab rules', lane: 0 },
  { prompt: 'Broken test tube', lane: 1 },
  { prompt: 'Contaminated sample', lane: 2 },
  { prompt: 'Wore the required protective equipment', lane: 0 },
  { prompt: 'Forgot to label a test tube', lane: 1 },
  { prompt: 'Falsified test results', lane: 2 },
  { prompt: 'Checked equipment before use', lane: 0 },
  { prompt: 'Left the workbench untidy', lane: 1 },
  { prompt: 'Mixed chemical waste into a clean sample', lane: 2 }
];
const ROUND_COUNT = 5;
const CARS = [
  { name: 'Fiat Classic', file: '1-fiat-default.webp', rank: 'ROOKIE' },
  { name: 'Ambassador', file: '2-ambassador-white.webp', rank: 'STREET LEGEND' },
  { name: 'Maruti', file: '3-maruti-white.webp', rank: 'CITY RACER' },
  { name: 'Honda', file: '4-honda-white.webp', rank: 'SPORT CLASS' },
  { name: 'Benz', file: '5-benz-white.webp', rank: 'ELITE CLASS' },
  { name: 'Ferrari', file: '6-ferrari-red.webp', rank: 'SUPER CAR' }
];
const carAsset = car => `assets/good-bad-ugly-assets/${car.file}`;
class GarageProgress {
  constructor(saved = {}) {
    this.level = Number.isInteger(saved.level) ? Math.max(1, Math.min(CARS.length, saved.level)) : 1;
    this.selected = Number.isInteger(saved.selected) && saved.selected >= 0 && saved.selected < this.level ? saved.selected : 0;
    this.champion = saved.champion === true && this.level === CARS.length;
  }
  select(index) { if (!Number.isInteger(index) || index < 0 || index >= this.level) return false; this.selected = index; return true; }
  complete(run) {
    if (!run.finished || run.count !== ROUND_COUNT || run.score !== ROUND_COUNT) return { passed: false, unlocked: null };
    if (this.level < CARS.length) { const unlocked = this.level; this.level++; return { passed: true, unlocked }; }
    this.champion = true; return { passed: true, unlocked: null };
  }
}
class GoodBadUglyRun {
  constructor(random = Math.random) { this.random = random; this.score = 0; this.streak = 0; this.best = 0; this.lives = 3; this.misses = []; this.bag = []; this.round = null; this.count = 0; this.boosts = 0;  }
  next() {
    if (this.finished) return null;
    if (!this.bag.length) { this.bag = SCENARIOS.map((_, i) => i); for (let i = this.bag.length - 1; i > 0; i--) { const j = Math.floor(this.random() * (i + 1)); [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]; } }
    const index = this.bag.pop(); const { prompt, lane } = SCENARIOS[index];
    this.round = { index, prompt, answer: LANE_LABELS[lane], lane, options: [...LANE_LABELS], resolved: false };
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
  get duration() { return Math.max(4, 5.2 - this.boosts * .25); }
}
function gatePosition(progress, height) {
  const carHeight = Math.min(height * .24, 130);
  const crossing = height - 8 - carHeight / 2 - 37;
  return -100 + Math.max(0, Math.min(1, progress)) * (crossing + 100);
}
function advanceCar(position, target, dt) {
  const next = position + (target - position) * (1 - Math.exp(-12 * dt));
  return Math.abs(next - target) < .0005 ? target : next;
}
if (typeof module !== 'undefined') module.exports = { GoodBadUglyRun, SCENARIOS, LANE_LABELS, ROUND_COUNT, CARS, GarageProgress, advanceCar, gatePosition };
if (typeof document !== 'undefined') (() => {
  const $ = id => document.getElementById(id);
  const shell = document.querySelector('.shell');
  const track = $('track'), canvas = $('road'), ctx = canvas.getContext('2d');
  let run, state = 'home', lane = 1, elapsed = 0, wait = 0, offset = 0, previous = 0, width = 0, height = 0, orientationPaused = false, countdown = 0;
  let audioContext, buffers = {}, gestureX, carPosition = .5, carAngle = 0;
  const progressKey = 'good-bad-ugly-garage-v1';
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(progressKey) || '{}') || {}; } catch (_) {}
  const progress = new GarageProgress(saved);
  function saveProgress() { try { localStorage.setItem(progressKey, JSON.stringify(progress)); } catch (_) {} }
  function applyCar() { $('car').src = carAsset(CARS[progress.selected]); $('car').alt = `Your ${CARS[progress.selected].name}`; }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function wrongImpact() { shell.classList.remove('wrong-impact'); void shell.offsetWidth; shell.classList.add('wrong-impact'); }
  shell.addEventListener('animationend', event => { if (event.target === shell) shell.classList.remove('wrong-impact'); });
  function resetEffects() { shell.classList.remove('wrong-impact'); carPosition = .5; carAngle = 0; track.querySelectorAll('.tyre-trail').forEach(el => el.remove()); $('car').style.left = '0px'; $('car').style.transform = `translateX(${width * carPosition}px) translateX(-50%)`; $('boost-cue').hidden = true; $('powerup').classList.remove('show'); }

  const bgMusic = new Audio('audio/lanerush-bgm.mp3');
  bgMusic.loop = true; bgMusic.volume = .35; bgMusic.preload = 'auto';
  function playMusic() { bgMusic.play().catch(() => {}); }
  async function unlockAudio() {
    try { audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); await audioContext.resume();
      for (const name of ['correct', 'wrong']) { if (!buffers[name]) fetch(`audio/lanerush-${name}.mp3`).then(r => r.arrayBuffer()).then(data => audioContext.decodeAudioData(data)).then(buffer => { buffers[name] = buffer; }).catch(() => {}); }
    } catch (_) { /* Sound is optional. */ }
  }
  function sound(name) { if (!audioContext || !buffers[name] || audioContext.state !== 'running') return; const source = audioContext.createBufferSource(); source.buffer = buffers[name]; source.connect(audioContext.destination); source.start(); }
  function fit() { const rect = track.getBoundingClientRect(); width = rect.width; height = rect.height; const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); const landscape = window.innerWidth > window.innerHeight; $('rotate').hidden = !landscape; if (landscape && state === 'playing') { orientationPaused = true; pause(); } else if (!landscape && orientationPaused) { orientationPaused = false; } }
  function steer(next) { if (state !== 'playing' || wait || countdown) return; const target = Math.max(0, Math.min(2, next)); const direction = target - lane;
    if (!direction) return;
    const car = $('car');
    const currentLeft = width * carPosition;
    lane = target;
    if (!reducedMotion.matches) {
      const startX = currentLeft, endX = width * ((lane + .5) / 3);
      for (const side of [-1, 1]) {
        const trail = document.createElement('div'); trail.className = 'tyre-trail';
        trail.style.left = `${startX + side * car.offsetWidth * .32}px`;
        trail.style.bottom = '20px'; track.append(trail);
        trail.style.setProperty('--trail-distance', `${endX - startX}px`);
        trail.style.setProperty('--trail-angle', `${-direction * 24}deg`);
        trail.addEventListener('animationend', () => trail.remove(), { once: true });
        // Cleanup also runs if a browser suppresses the decorative animation.
        window.setTimeout(() => trail.remove(), 750);
      }
    }
    updateLane(); }
  function updateLane() {
    $('lane-glow').style.setProperty('--lane-color', ['#5cff7d', '#ffca39', '#ff344c'][lane]);
    $('lane-glow').style.transform = `translateX(${lane * 100}%)`;
    $('left').disabled = lane === 0; $('right').disabled = lane === 2;
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
  function showFeedback(correct) {
    const feedback = $('feedback'); feedback.replaceChildren();
    feedback.classList.toggle('bad', !correct);
    feedback.style.setProperty('--answer-color', ['#8effbc', '#ffdb7a', '#ff647e'][run.round.lane]);
    const caption = document.createElement('small'), answer = document.createElement('strong'), hint = document.createElement('span');
    caption.textContent = correct ? (run.streak >= 3 ? `${run.streak} IN A ROW!` : 'NAILED IT!') : 'THE RIGHT LANE WAS';
    answer.textContent = run.round.answer.toUpperCase();
    hint.textContent = correct ? 'Keep the streak going!' : ['GO LEFT', 'CHOOSE CENTER', 'GO RIGHT'][run.round.lane];
    feedback.append(caption, answer, hint);
    feedback.classList.remove('feedback-pop'); void feedback.offsetWidth; feedback.classList.add('feedback-pop');
  }
  function powerup() {
    const popup = $('powerup'); popup.textContent = `${run.streak} STREAK | ${run.multiplier.toFixed(2)}x BOOST`;
    popup.classList.remove('show'); void popup.offsetWidth; popup.classList.add('show');
  }
  function hud() { $('race-level').textContent = `LEVEL ${progress.level}`; $('race-progress').textContent = `${Math.min(run.count + 1, ROUND_COUNT)} / ${ROUND_COUNT}`; }
  function nextRound() { const round = run.next(); elapsed = 0; $('question').textContent = round.prompt; $('round-time').style.transform = 'scaleX(1)'; $('feedback').textContent = ''; $('gates').hidden = false; for (let i = 0; i < 3; i++) { $(`gate-${i}`).replaceChildren(); const icon = document.createElement('span'), label = document.createElement('strong'); icon.append(makeIcon(i === 0 ? 'check' : 'warning')); icon.setAttribute('aria-hidden', 'true'); label.textContent = round.options[i]; $(`gate-${i}`).append(icon, label); $(`gate-${i}`).className = `gate lane-${i}`; } $('gates').style.transform = 'translateY(-100px)'; }
  function start() { if (state !== 'paused') bgMusic.currentTime = 0; playMusic(); $('instructions').hidden = true; $('home').hidden = true; unlockAudio(); if (state === 'paused') { state = 'playing'; $('overlay').classList.remove('race-report'); previous = 0; $('overlay').hidden = true; $('pause').disabled = false; return; } resetEffects(); applyCar(); $('garage').hidden = true; $('unlock').hidden = true; $('boost-cue').querySelector('span').textContent = `LEVEL ${progress.level} | FIVE QUESTIONS`; $('overlay').classList.remove('race-report'); track.classList.remove('boosted'); run = new GoodBadUglyRun(); state = 'playing'; wait = 0; countdown = 0; previous = 0; lane = 1; hud(); updateLane(); countdown = 3; $('gates').hidden = true; $('feedback').textContent = ''; $('boost-cue').hidden = false; $('boost-cue').querySelector('strong').textContent = '3'; $('boost-cue').classList.add('count-beat'); $('question').textContent = 'Get ready to race'; $('overlay').hidden = true; $('pause').disabled = false; fit(); }
  function pause() { if (state !== 'playing') return; state = 'paused'; bgMusic.pause(); $('overlay').classList.remove('race-report'); $('pause').disabled = true; $('overlay').hidden = false; $('tag').textContent = 'PIT STOP'; $('title').textContent = 'Race paused'; $('description').textContent = 'Your run is waiting. Ready to get back on track?'; $('review').hidden = true; $('start').textContent = 'Resume racing'; }
  function openGarage() {
    state = 'garage'; bgMusic.pause(); $('home').hidden = true; $('instructions').hidden = true; $('overlay').hidden = true; $('unlock').hidden = true; $('garage').hidden = false; $('pause').disabled = true;
    $('garage-level').textContent = progress.champion ? 'CHAMPION | ALL CARS UNLOCKED' : `LEVEL ${progress.level} | ${progress.level} / ${CARS.length} CARS UNLOCKED`;
    $('garage-goal').textContent = progress.level < CARS.length ? `Score 5/5 to unlock ${CARS[progress.level].name}.` : 'Score 5/5 to claim the championship.';
    $('garage-cars').replaceChildren();
    CARS.forEach((car, index) => {
      const card = document.createElement('button'), image = document.createElement('img'), name = document.createElement('strong'), status = document.createElement('small');
      card.className = 'garage-card'; card.disabled = index >= progress.level; card.classList.toggle('selected', index === progress.selected); card.setAttribute('aria-pressed', String(index === progress.selected));
      image.src = carAsset(car); image.alt = car.name; name.textContent = car.name; status.textContent = index >= progress.level ? `LOCKED | CLEAR LEVEL ${index}` : index === progress.selected ? 'SELECTED' : 'TAP TO SELECT';
      card.append(image, name, status); card.addEventListener('click', () => { if (progress.select(index)) { saveProgress(); applyCar(); openGarage(); const cards = $('garage-cars').querySelectorAll('button'); cards[index].focus(); } }); $('garage-cars').append(card);
    });
    $('garage-race').textContent = `RACE LEVEL ${progress.level}`; $('garage-race').focus();
  }
  function celebrate(unlocked, clearedLevel) {
    $('overlay').hidden = true; $('unlock').hidden = false; state = 'unlock';
    const car = CARS[unlocked === null ? progress.selected : unlocked];
    $('unlock-tag').textContent = unlocked === null ? 'CHAMPIONSHIP WON' : 'NEW CAR UNLOCKED';
    $('unlock-title').textContent = unlocked === null ? 'You own the track.' : car.name;
    $('unlock-image').src = carAsset(car); $('unlock-image').alt = car.name;
    $('unlock-rank').textContent = unlocked === null ? 'ALL SIX CARS. ONE CHAMPION.' : car.rank;
    $('unlock-copy').textContent = `Perfect 5/5! Level ${clearedLevel} conquered. ${unlocked === null ? 'Take any car for a victory lap.' : 'Your garage just got an upgrade. Pick your ride for the next level.'}`;
    $('confetti').replaceChildren();
    if (!reducedMotion.matches) for (let i = 0; i < 30; i++) { const piece = document.createElement('i'); piece.style.setProperty('--x', `${(i * 37) % 100}%`); piece.style.setProperty('--delay', `${(i % 8) * .12}s`); piece.style.setProperty('--color', ['#8effbc', '#ffdb7a', '#ff647e'][i % 3]); $('confetti').append(piece); }
    if (audioContext?.state === 'running') [523,659,784,1047].forEach((note, index) => { const tone = audioContext.createOscillator(), gain = audioContext.createGain(), at = audioContext.currentTime + index * .12; tone.frequency.value = note; gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.09,at+.02); gain.gain.exponentialRampToValueAtTime(.001,at+.3); tone.connect(gain); gain.connect(audioContext.destination); tone.start(at); tone.stop(at+.32); });
    $('unlock-garage').focus();
  }
  function finish() {
    bgMusic.pause(); resetEffects(); state = 'report'; $('gates').hidden = true; $('pause').disabled = true;
    const clearedLevel = progress.level, result = progress.complete(run);
    if (result.passed) { saveProgress(); celebrate(result.unlocked, clearedLevel); return; }
    $('overlay').classList.add('race-report'); $('overlay').hidden = false; $('tag').textContent = 'KEEP YOUR ENGINE RUNNING'; $('title').textContent = `${run.score}/5`;
    $('description').replaceChildren(); const message = document.createElement('span'); message.textContent = `Level ${progress.level}: get all five right to level up and unlock your next ride. Your garage is safe. Try again!`; $('description').append(message);
    $('review').replaceChildren(); run.misses.forEach(miss => { const row = document.createElement('div'), title = document.createElement('strong'), answer = document.createElement('span'); title.textContent = miss.prompt; answer.textContent = miss.answer; row.append(title, answer); $('review').append(row); }); $('review').hidden = run.misses.length === 0; $('start').textContent = 'Retry level'; $('start').focus();
  }
  function road(dt) {
    offset = (offset + dt * (300 * (run ? run.multiplier : 1))) % 100;
    ctx.fillStyle = '#15202b'; ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 3; i++) {
      const x = width * i / 3, laneWidth = width / 3;
      const asphalt = ctx.createLinearGradient(x, 0, x + laneWidth, 0);
      asphalt.addColorStop(0, '#19212b'); asphalt.addColorStop(.5, '#252d36'); asphalt.addColorStop(1, '#19212b');
      ctx.fillStyle = asphalt; ctx.fillRect(x, 0, laneWidth, height);
      ctx.fillStyle = '#c3c8cd70'; for (let y = offset - 100; y < height; y += 100) ctx.fillRect(x + laneWidth / 2 - 1, y, 2, 28);
      ctx.fillStyle = '#9ba3aa55'; ctx.fillRect(x + 2, 0, 2, height);
    }
    ctx.fillStyle = '#9ba3aa55'; ctx.fillRect(width - 4, 0, 2, height);
    for (const edge of [0, width - 7]) {
      ctx.fillStyle = '#10151a'; ctx.fillRect(edge, 0, 7, height);
      for (let y = offset - 100; y < height; y += 32) { ctx.fillStyle = '#879096'; ctx.fillRect(edge + 1, y, 5, 26); ctx.fillStyle = '#b3bbc0'; ctx.fillRect(edge + 1, y, 2, 26); }
    }
    ctx.fillStyle = '#ffffff08'; for (let i = 0; i < 200; i++) { const x = (i * 47.3) % width, y = (i * 89.7 + offset) % height; ctx.fillRect(x, y, 1, 1); }
  }
  function frame(time) {
    const dt = previous ? Math.min((time - previous) / 1000, .05) : 0; previous = time;
    if (state === 'playing' && !document.hidden) {
      road(dt);
      const targetPosition = (lane + .5) / 3;
      const oldPosition = carPosition;
      carPosition = advanceCar(carPosition, targetPosition, dt);
      const velocity = dt > 0 ? (carPosition - oldPosition) / dt : 0;
      const targetAngle = reducedMotion.matches ? 0 : Math.max(-24, Math.min(24, velocity * 12));
      carAngle += (targetAngle - carAngle) * (1 - Math.exp(-18 * dt));
      $('car').style.left = '0px';
      $('car').style.transform = `translateX(${width * carPosition}px) translateX(-50%) rotate(${carAngle}deg)`;

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
        elapsed += dt; const progress = Math.min(1, elapsed / run.duration); $('round-time').style.transform = `scaleX(${1 - progress})`; $('gates').style.transform = `translateY(${gatePosition(progress, height)}px)`;
        if (progress >= 1) { const correct = run.resolve(lane); hud(); if (correct && run.count > 0) powerup(); sound(correct ? 'correct' : 'wrong'); $(`gate-${run.round.lane}`).classList.add('correct'); if (!correct) $(`gate-${lane}`).classList.add('wrong'); showFeedback(correct); if (!correct) wrongImpact(); wait = correct ? .65 : 1.8; }
      }
    } else if (state === 'home') road(dt);
    requestAnimationFrame(frame);
  }
  $('home-start').addEventListener('click', () => { playMusic(); unlockAudio(); $('home').hidden = true; $('instructions').hidden = false; $('level-start').focus(); }); $('level-start').addEventListener('click', openGarage); $('garage-race').addEventListener('click', start); $('unlock-garage').addEventListener('click', openGarage); $('home-garage').addEventListener('click', openGarage); $('garage-menu').addEventListener('click', () => { $('garage').hidden = true; $('home').hidden = false; state = 'home'; }); applyCar(); $('start').addEventListener('click', start); $('pause').addEventListener('click', pause); $('left').addEventListener('click', () => steer(lane - 1)); $('right').addEventListener('click', () => steer(lane + 1));
  track.addEventListener('pointerdown', e => { gestureX = e.clientX; }); track.addEventListener('pointerup', e => { if (gestureX === undefined) return; const delta = e.clientX - gestureX; if (Math.abs(delta) > 25) steer(lane + (delta > 0 ? 1 : -1)); else steer(Math.floor((e.clientX - track.getBoundingClientRect().left) / (width / 3))); gestureX = undefined; }); track.addEventListener('pointercancel', () => { gestureX = undefined; });
  window.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); steer(lane + (e.key === 'ArrowLeft' ? -1 : 1)); } if (['1', '2', '3'].includes(e.key)) steer(Number(e.key) - 1); if (e.key === 'Escape') pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { bgMusic.pause(); pause(); } previous = 0; }); window.addEventListener('pagehide', () => bgMusic.pause()); window.addEventListener('resize', fit); if ('ResizeObserver' in window) new ResizeObserver(fit).observe(track); fit(); requestAnimationFrame(frame);
})();

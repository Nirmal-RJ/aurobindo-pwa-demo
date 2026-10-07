/* Two-lane adaptation of the supplied Infinite Scroller. */
'use strict';
const LANE_PAIRS = [ ['%RSD', 'Precision'], ['Resolution', 'Peak Separation'], ['Tailing Factor', 'Peak Symmetry'], ['Plate Count', 'Column Efficiency'], ['Retention Time', 'Peak Identification'] ];
class LaneRushRun {
  constructor(random = Math.random) { this.random = random; this.score = 0; this.streak = 0; this.best = 0; this.lives = 3; this.misses = []; this.bag = []; this.round = null; this.count = 0; this.boosts = 0; this.mastered = new Set(); this.phase = 'practice'; this.finalCount = 0; }
  next() {
    if (this.finished) return null;
    if (!this.bag.length) { this.bag = LANE_PAIRS.map((_, i) => i).filter(i => this.phase !== 'practice' || !this.mastered.has(i)); for (let i = this.bag.length - 1; i > 0; i--) { const j = Math.floor(this.random() * (i + 1)); [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]; } }
    const index = this.bag.pop(); const wrong = (index + 1 + Math.floor(this.random() * 4)) % 5; const lane = this.random() < .5 ? 0 : 1;
    const options = []; options[lane] = LANE_PAIRS[index][1]; options[1 - lane] = LANE_PAIRS[wrong][1];
    this.round = { index, prompt: LANE_PAIRS[index][0], answer: LANE_PAIRS[index][1], lane, options, resolved: false };
    return this.round;
  }
  resolve(lane) {
    if (!this.round || this.round.resolved || this.finished) return null;
    this.round.resolved = true; this.count++; const correct = lane === this.round.lane;
    if (this.phase === 'practice') {
      if (correct) this.mastered.add(this.round.index);
      this.streak = correct ? this.streak + 1 : 0;
      if (this.mastered.size === 5) { this.phase = 'final'; this.bag = []; this.streak = 0; }
    } else {
      this.finalCount++;
      if (correct) { this.streak++; this.best = Math.max(this.best, this.streak); this.score++; this.boosts++; }
      else { this.lives--; this.streak = 0; this.misses.push({ prompt: this.round.prompt, answer: this.round.answer, selected: this.round.options[lane] }); }
    }
    return correct;
  }
  get finished() { return this.phase === 'final' && (!this.lives || this.finalCount >= 5); }
  get multiplier() { return this.phase === 'practice' ? 1 : 1.3 + this.boosts * .1; }
  get duration() { return this.phase === 'practice' ? 5 : Math.max(1.8, 3.2 / this.multiplier); }
}
function advanceCar(position, target, dt) {
  const next = position + (target - position) * (1 - Math.exp(-12 * dt));
  return Math.abs(next - target) < .0005 ? target : next;
}
if (typeof module !== 'undefined') module.exports = { LaneRushRun, LANE_PAIRS, advanceCar };
if (typeof document !== 'undefined') (() => {
  const $ = id => document.getElementById(id);
  const shell = document.querySelector('.shell');
  const track = $('track'), canvas = $('road'), ctx = canvas.getContext('2d');
  let run, state = 'home', lane = 0, elapsed = 0, wait = 0, offset = 0, previous = 0, width = 0, height = 0, orientationPaused = false, boostShown = false, countdown = 0;
  let audioContext, buffers = {}, gestureX, carPosition = .25, carAngle = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function wrongImpact() { shell.classList.remove('wrong-impact'); void shell.offsetWidth; shell.classList.add('wrong-impact'); }
  shell.addEventListener('animationend', event => { if (event.target === shell) shell.classList.remove('wrong-impact'); });
  function resetEffects() { shell.classList.remove('wrong-impact'); carPosition = .25; carAngle = 0; track.querySelectorAll('.tyre-trail').forEach(el => el.remove()); $('car').style.left = '0px'; $('car').style.transform = `translateX(${width * carPosition}px) translateX(-50%)`; $('boost-cue').hidden = true; $('powerup').classList.remove('show'); }

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
  function steer(next) { if (state !== 'playing' || wait || countdown) return; const target = Math.max(0, Math.min(1, next)); const direction = target - lane;
    if (!direction) return;
    const car = $('car');
    const currentLeft = width * carPosition;
    lane = target;
    if (!reducedMotion.matches) {
      const startX = currentLeft, endX = width * (lane ? .75 : .25);
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
    $('lane-glow').classList.toggle('right', !!lane); $('left').classList.toggle('active', !lane); $('right').classList.toggle('active', !!lane); }
  function powerup() {
    const popup = $('powerup'); popup.textContent = `${run.streak} STREAK | ${run.multiplier.toFixed(2)}x BOOST`;
    popup.classList.remove('show'); void popup.offsetWidth; popup.classList.add('show');
  }
  function hud() { $('score').textContent = `${run.score}/5`; $('streak').textContent = run.streak; $('lives').textContent = run.phase === 'practice' ? 'FREE' : `${run.lives} / 3`; $('gear').textContent = `${run.multiplier.toFixed(2)}x SPEED`; $('race-progress').textContent = run.phase === 'practice' ? `PRACTICE ${run.mastered.size} / 5` : `FINAL ${Math.min(run.finalCount + 1, 5)} / 5`;  }
  function nextRound() { const round = run.next(); elapsed = 0; $('question').textContent = round.prompt; $('feedback').textContent = ''; $('gates').hidden = false; for (let i = 0; i < 2; i++) { $(`gate-${i}`).textContent = round.options[i]; $(`gate-${i}`).className = 'gate'; } $('gates').style.transform = 'translateY(-80px)'; }
  function start() { if (state !== 'paused') bgMusic.currentTime = 0; playMusic(); $('instructions').hidden = true; $('home').hidden = true; unlockAudio(); if (state === 'paused') { state = 'playing'; $('overlay').classList.remove('race-report'); previous = 0; $('overlay').hidden = true; $('pause').disabled = false; return; } resetEffects(); $('overlay').classList.remove('race-report'); track.classList.remove('boosted'); run = new LaneRushRun(); state = 'playing'; wait = 0; boostShown = false; countdown = 0; previous = 0; lane = 0; hud(); steer(0); nextRound(); $('overlay').hidden = true; $('pause').disabled = false; fit(); }
  function pause() { if (state !== 'playing') return; state = 'paused'; bgMusic.pause(); $('overlay').classList.remove('race-report'); $('pause').disabled = true; $('overlay').hidden = false; $('tag').textContent = 'PIT STOP'; $('title').textContent = 'Race paused'; $('description').textContent = 'Your run is waiting. Ready to get back on track?'; $('review').hidden = true; $('start').textContent = 'Resume racing'; }
  function finish() { bgMusic.pause(); resetEffects(); state = 'report'; $('overlay').classList.add('race-report'); $('gates').hidden = true; $('pause').disabled = true; $('overlay').hidden = false; $('tag').textContent = run.finalCount >= 5 ? 'RACE COMPLETE' : 'OUT OF LIVES'; $('title').textContent = `${run.score}/5`; $('description').replaceChildren(); for (const [value, label] of [[run.finalCount - run.misses.length, 'MATCHES CAUGHT'], [run.best, 'BEST STREAK']]) { const stat = document.createElement('span'), number = document.createElement('strong'), caption = document.createElement('small'); number.textContent = value; caption.textContent = label; stat.append(number, caption); $('description').append(stat); } $('review').replaceChildren(); run.misses.forEach(miss => { const row = document.createElement('div'), title = document.createElement('strong'), answer = document.createElement('span'); title.textContent = miss.prompt; answer.textContent = miss.answer; row.append(title, answer); $('review').append(row); }); $('review').hidden = run.misses.length === 0; $('start').textContent = 'Race again'; $('start').focus(); }
  function road(dt) { offset = (offset + dt * (520 * (run ? run.multiplier : 1))) % 80; ctx.fillStyle = '#101722'; ctx.fillRect(0, 0, width, height); const curb = Math.max(8, width * .025); ctx.fillStyle = '#111317'; ctx.fillRect(0, 0, curb, height); ctx.fillRect(width - curb, 0, curb, height); for (let y = offset - 80; y < height; y += 40) { ctx.fillStyle = Math.floor((y - offset) / 40) % 2 ? '#afbbcb' : '#ed2447'; ctx.fillRect(curb, y, curb, 40); ctx.fillRect(width - curb * 2, y, curb, 40); } ctx.fillStyle = '#aec2da65'; for (let y = offset - 80; y < height; y += 80) ctx.fillRect(width / 2 - 1, y, 2, 38); ctx.fillStyle = '#ffffff12'; for (let i = 0; i < 12; i++) { const x = (i % 2 ? width - curb * 3 - 6 : curb * 3 + 6); const y = (offset * 5 + i * height / 6) % (height + 100) - 100; ctx.fillRect(x, y, 2, 65); } }
  function frame(time) {
    const dt = previous ? Math.min((time - previous) / 1000, .05) : 0; previous = time;
    if (state === 'playing' && !document.hidden) {
      road(dt);
      const targetPosition = lane ? .75 : .25;
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
      else if (wait > 0) { wait -= dt; if (wait <= 0) { wait = 0; if (run.finished) finish(); else if (run.phase === 'final' && !boostShown) { boostShown = true; $('gates').hidden = true; $('feedback').textContent = ''; $('boost-cue').querySelector('strong').textContent = 'BUCKLE UP'; $('boost-cue').classList.remove('count-beat'); $('boost-cue').hidden = false; track.classList.add('boosted'); wait = 1.7; } else if (!$('boost-cue').hidden) { countdown = 3; $('boost-cue').querySelector('strong').textContent = '3'; $('boost-cue').classList.add('count-beat'); } else { nextRound(); } } }
      else {
        elapsed += dt; const carHeight = Math.min(height * .24, 140); const crossing = height - 12 - carHeight / 2 - 30; const progress = Math.min(1, elapsed / run.duration); $('gates').style.transform = `translateY(${-80 + progress * (crossing + 80)}px)`;
        if (progress >= 1) { const correct = run.resolve(lane); hud(); if (correct && run.finalCount > 0) powerup(); sound(correct ? 'correct' : 'wrong'); $(`gate-${run.round.lane}`).classList.add('correct'); if (!correct) $(`gate-${lane}`).classList.add('wrong'); $('feedback').textContent = correct ? (run.streak >= 3 ? `${run.streak} MATCH STREAK!` : `MATCH CAUGHT! ${run.multiplier.toFixed(2)}x`) : `Match: ${run.round.answer}`; $('feedback').classList.toggle('bad', !correct); if (!correct) wrongImpact(); wait = correct ? .28 : .85; }
      }
    } else if (state === 'home') road(dt);
    requestAnimationFrame(frame);
  }
  $('home-start').addEventListener('click', () => { playMusic(); unlockAudio(); $('home').hidden = true; $('instructions').hidden = false; $('practice-start').focus(); }); $('practice-start').addEventListener('click', start); $('start').addEventListener('click', start); $('pause').addEventListener('click', pause); $('left').addEventListener('click', () => steer(0)); $('right').addEventListener('click', () => steer(1));
  track.addEventListener('pointerdown', e => { gestureX = e.clientX; }); track.addEventListener('pointerup', e => { if (gestureX === undefined) return; const delta = e.clientX - gestureX; if (Math.abs(delta) > 25) steer(delta > 0 ? 1 : 0); else steer(e.clientX < track.getBoundingClientRect().left + width / 2 ? 0 : 1); gestureX = undefined; }); track.addEventListener('pointercancel', () => { gestureX = undefined; });
  window.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); steer(e.key === 'ArrowLeft' ? 0 : 1); } if (e.key === 'Escape') pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { bgMusic.pause(); pause(); } previous = 0; }); window.addEventListener('pagehide', () => bgMusic.pause()); window.addEventListener('resize', fit); if ('ResizeObserver' in window) new ResizeObserver(fit).observe(track); fit(); requestAnimationFrame(frame);
})();

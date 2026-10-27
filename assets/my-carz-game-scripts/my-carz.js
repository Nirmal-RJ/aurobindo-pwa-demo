/* Presentation controller: rules, persistence, config and media caching are separate modules. */
(() => {
  'use strict';
  const C = CarzConfig, $ = id => document.getElementById(id), app = $('game');
  const asset = file => new URL('../my-carz-game-assets/' + file, document.baseURI).href;
  const repository = new CarzStore.Repository(new CarzStore.LocalAdapter(localStorage));
  let game, returning = false, view = 'opening', phase = 'idle', busy = false, paused = false;
  let lane = 0, position = .25, tilt = 0, reading = 0, elapsed = 0, countdown = 0, previous = 0;
  let width = 1, height = 1, distance = 0, reward = null, demoIndex = 0, help = false, paintRevision = 0;
  let lastFocus, scratchDown = false, scratched = false, scratchLast;
  const clockWaiters = new Set(), sounds = {}, ctx = $('road').getContext('2d');
  for (const [name, [file, volume]] of Object.entries(C.sounds)) { const audio = new Audio(asset(file)); audio.volume = volume; audio.loop = name === 'music'; sounds[name] = audio; }
  const play = name => { if (document.hidden) return; const audio = sounds[name]; if (name !== 'music') audio.currentTime = 0; audio.play().catch(() => {}); };
  function silence() { for (const audio of Object.values(sounds)) audio.pause(); }
  function wait(seconds) { return new Promise(resolve => clockWaiters.add({ remaining: seconds, resolve })); }
  function on(id, action) {
    const control = $(id); let running = false;
    control.addEventListener('click', () => {
      if (running || control.disabled) return;
      running = true; control.disabled = true; play('click');
      Promise.resolve().then(action).catch(reportError).finally(() => { running = false; control.disabled = false; });
    });
  }
  function reportError(error) { $('save-error').textContent = error.message || 'Could not save progress. Please retry.'; $('save-error').hidden = false; }
  async function save() { await repository.save(game.checkpoint()); $('save-error').hidden = true; }
  function image(id, file) { $(id).src = asset(file); }
  function button(label, action, artwork) {
    const el = document.createElement('button'); el.type = 'button'; el.setAttribute('aria-label', label);
    if (artwork) { el.className = 'art-button'; const img = new Image(); img.src = asset(artwork); img.alt = ''; el.append(img); } else el.textContent = label;
    el.addEventListener('click', () => { if (el.disabled) return; el.disabled = true; play('click'); Promise.resolve().then(action).catch(reportError).finally(() => { el.disabled = false; }); });
    return el;
  }
  function animate(element, frames, duration = 380) {
    if (typeof element.animate !== 'function') {
      // Preserve a visible entrance/exit on browsers lacking Web Animations.
      element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
      Object.assign(element.style, frames[0]); void element.offsetWidth;
      requestAnimationFrame(() => Object.assign(element.style, frames[frames.length - 1]));
      return wait(duration / 1000).then(() => { element.style.transition = ''; element.style.opacity = ''; element.style.transform = ''; });
    }
    const motion = element.animate(frames, { duration, easing: 'cubic-bezier(.22,.75,.25,1)', fill: 'both' });
    return motion.finished.catch(() => {}).finally(() => motion.cancel());
  }
  async function show(target, backwards = false) {
    if (busy || target === view) return false;
    busy = true; app.dataset.transitioning = 'true';
    const old = $(view), next = $(target), direction = backwards ? -1 : 1;
    try {
      await animate(old, [{ opacity: 1, transform: 'translateX(0) scale(1)' }, { opacity: 0, transform: `translateX(${-direction * 7}%) scale(.94)` }], 260);
      old.hidden = true; next.hidden = false; view = target;
      await animate(next, [{ opacity: 0, transform: `translateX(${direction * 8}%) scale(.94)` }, { opacity: 1, transform: 'translateX(0) scale(1)' }], 380);
      next.querySelector('button:not(:disabled),a')?.focus({ preventScroll: true });
      return true;
    } finally { busy = false; delete app.dataset.transitioning; }
  }
  function modal(title, copy, actions = [], artwork) {
    lastFocus = document.activeElement;
    $('modal-title').textContent = title; $('modal-copy').textContent = copy;
    $('modal-art').hidden = !artwork; if (artwork) image('modal-art', artwork);
    for (const id of ['scratch-area', 'reward-car', 'next-car-info']) $(id).hidden = true;
    $('reward-car').classList.remove('rotating'); $('modal-actions').replaceChildren(...actions);
    $('modal').hidden = false; app.dataset.modal = 'true';
    $(view).inert = true;
    $('modal-actions').querySelector('button')?.focus();
  }
  function closeModal() { $('modal').hidden = true; delete app.dataset.modal; $(view).inert = false; lastFocus?.focus?.({ preventScroll: true }); }
  function diamonds() {
    const children = Array.from({ length: C.streakSize }, (_, i) => { const img = new Image(); img.src = asset('page-5/diamong.webp'); img.alt = ''; if (i < game.streak) img.className = 'earned'; return img; });
    const label = document.createElement('strong'); label.textContent = `${game.streak}/5`;
    $('diamonds').replaceChildren(...children, label); $('diamonds').setAttribute('aria-label', `${game.streak} of 5 diamonds`);
    $('race-level').textContent = game.freePlay ? 'FREE PLAY' : `LEVEL ${game.day.level}`;
  }
  async function paintImage(img, index, preview = true) {
    const source = asset(C.cars[index][preview ? 'preview' : 'driving']);
    const color = game.day.colors[index]; img.dataset.paintKey = `${index}:${color}`;
    const result = await CarzPaint.paintedCar(index, color, source);
    if (img.dataset.paintKey === `${index}:${color}`) { img.src = result; img.alt = C.cars[index].name; }
  }
  async function renderGarage() {
    const revision = ++paintRevision, d = game.day;
    $('home-level').textContent = game.freePlay ? 'ALL CARS UNLOCKED · FREE PLAY' : `LEVEL ${d.level} · 5 DIAMONDS TO UPGRADE`;
    $('unlocked-today').textContent = `${d.unlocked - 1}/8 earned today · ${d.unlocked}/9 cars available`;
    $('returning-actions').hidden = !returning;
    for (const prefix of ['home', 'collection']) {
      $(prefix + '-name').textContent = C.cars[d.selected].name;
      paintImage($(prefix + '-car'), d.selected);
      $(prefix + '-cars').replaceChildren(...C.cars.map((car, index) => {
        const el = button(car.name, async () => {
          if (!game.select(index)) return;
          await save(); await renderGarage();
          $(prefix + '-cars').children[index]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
        });
        el.className = 'carz-card'; el.disabled = index >= d.unlocked; el.setAttribute('aria-pressed', String(index === d.selected));
        const img = new Image(); img.src = asset(car.preview); img.alt = ''; const text = document.createElement('strong'); text.textContent = car.name;
        const note = document.createElement('small'); note.textContent = index >= d.unlocked ? 'LOCKED' : index === d.selected ? 'SELECTED' : 'UNLOCKED';
        el.replaceChildren(img, text, note); return el;
      }));
      $(prefix + '-paints').replaceChildren(...C.colors.map(([id, name, hex]) => {
        const el = button(name, async () => { game.paint(id); await save(); await renderGarage(); });
        el.replaceChildren(); el.title = name; el.style.setProperty('--paint', hex); el.setAttribute('aria-pressed', String(d.colors[d.selected] === id)); return el;
      }));
    }
    if (revision !== paintRevision) return;
  }
  const demoCopy = [
    ['Choose a tunnel', 'Read the action. Swipe left or right to choose Good or Bad.'],
    ['Earn your upgrade', 'Five correct answers in a row earn five diamonds and unlock the next car.'],
    ['Keep driving', 'A wrong answer resets your diamonds. See the correct answer and try fresh questions.'],
    ['Read, then steer', 'You have two seconds to read before the tunnels approach. Your current lane is your answer.']
  ];
  function renderDemo() {
    const slides = help && C.helpSlides.length ? C.helpSlides : C.demos;
    image('demo-image', slides[demoIndex]); $('demo-image').alt = demoCopy[demoIndex % 4][0];
    $('demo-title').textContent = demoCopy[demoIndex % 4][0]; $('demo-text').textContent = demoCopy[demoIndex % 4][1];
    $('demo-counter').textContent = `${demoIndex + 1} / ${slides.length}`; $('demo-prev').disabled = demoIndex === 0;
    $('demo-next').textContent = demoIndex === slides.length - 1 ? 'Finish' : 'Next →';
  }
  async function openDemo(asHelp) { if (busy) return; help = asHelp; demoIndex = 0; renderDemo(); await show('demo'); }
  function updateEnvironment() {
    const themes = ['1-vintage', '2', '3', '4', '5', '6']; const theme = themes[Math.min(5, game.day.level - 1)];
    for (const side of ['left', 'right']) app.style.setProperty(`--${side}-art`, `url("${asset(`page-5/${theme}-bg-${side}${theme === '2' ? '-v2' : ''}.webp`)}")`);
  }
  function tunnelArt() { game.day.lanes.forEach((label, i) => { image(`tunnel-${i}`, `page-5/${label.toLowerCase()}-tunnel.webp`); $(`tunnel-${i}`).alt = label; }); }
  function steer(next) {
    if (!['reading', 'travel'].includes(phase) || paused || !$('modal').hidden || busy) return;
    lane = next; updateArrow();
  }
  function updateArrow() {
    $('lane-arrow').style.transform = `translateX(${lane * 100}%)`;
    $('lane-arrow').style.setProperty('--arrow', game.day.lanes[lane] === 'Good' ? '#49ff47' : '#ff253b');
  }
  function newQuestion() {
    const question = game.next(); phase = 'reading'; reading = C.readingSeconds; elapsed = 0;
    $('question').textContent = question.prompt; $('question-time').style.transform = 'scaleX(1)'; $('feedback').hidden = true; $('tunnels').hidden = true;
    $('race-car').style.visibility = ''; tunnelArt(); updateArrow(); diamonds();
  }
  async function startDrive(upgraded = false, continuing = false) {
    if (busy) return;
    if (game.checkDay()) { await save(); await renderGarage(); }
    game.begin({ countPlay: !continuing }); phase = 'countdown'; lane = 0; position = .25; paused = false; countdown = 4;
    // Metadata/preferences can be saved without including the partial attempt.
    await save(); updateEnvironment(); tunnelArt(); diamonds(); updateArrow();
    $('question').textContent = 'Get ready'; $('feedback').hidden = true; $('tunnels').hidden = true;
    await paintImage($('race-car'), game.day.selected, false);
    await show('race'); fit();
    $('race-car').style.visibility = ''; $('race-car').classList.toggle('upgrade-entry', upgraded);
    if (upgraded) { phase = 'entry'; await wait(1.1); $('race-car').classList.remove('upgrade-entry'); phase = 'countdown'; }
    play('music'); play('countdown'); $('countdown').hidden = false; updateCountdown();
  }
  let countLabel = '';
  function updateCountdown() {
    const label = countdown > 3 ? 'READY' : String(Math.max(1, Math.ceil(countdown)));
    if (label !== countLabel) { countLabel = label; $('countdown').textContent = label; $('countdown').classList.remove('pulse'); void $('countdown').offsetWidth; $('countdown').classList.add('pulse'); }
  }
  function confetti() {
    const img = new Image(); img.className = 'answer-confetti-gif'; img.alt = ''; img.onload = () => wait(3).then(() => img.remove()); img.src = asset('inherited/confetti.gif'); app.append(img);
  }
  async function resolveAnswer() {
    if (phase !== 'travel') return;
    phase = 'feedback'; const result = game.answer(lane); if (!result) return;
    $('feedback').textContent = result.correct ? 'Correct' : 'Wrong'; $('feedback').hidden = false;
    if (result.correct) {
      play('correct'); confetti(); const gem = new Image(); gem.src = asset('page-5/diamong.webp'); gem.className = 'diamond-flight'; gem.alt = ''; app.append(gem);
      await wait(.75); gem.remove(); diamonds(); await wait(.55);
      if (!result.complete) { newQuestion(); return; }
      reward = game.complete();
      const reveal = async () => { await save(); await showUpgrade(); };
      try { await reveal(); }
      catch (error) { reportError(error); modal('Save paused', 'Keep this page open and retry saving your completed level.', [button('Retry save', reveal)]); }
    } else {
      play('wrong'); diamonds(); app.classList.remove('wrong-impact'); void app.offsetWidth; app.classList.add('wrong-impact');
      $('car-effects').style.setProperty('--crash-x', `${lane === 0 ? 25 : 75}%`); $('car-effects').replaceChildren(Object.assign(document.createElement('div'), { className: 'crash-effect' }));
      await wait(.65); $('race-car').style.visibility = 'hidden'; await wait(.65); app.classList.remove('wrong-impact'); $('car-effects').replaceChildren();
      modal('Wrong answer', `Correct answer: ${result.answer}. Your diamonds reset to 0. Keep driving with fresh questions.`,
        [button('Keep driving', () => { closeModal(); $('race-car').style.visibility = ''; newQuestion(); }, 'page-7/keep-driving-button.webp')], 'page-7/crash-panel.webp');
    }
  }
  async function showUpgrade() {
    if (reward.unlocked === null) {
      modal('Five in a row!', 'All nine cars are yours. Keep driving with fresh questions.', [button('Keep driving', continueReward)]); return;
    }
    modal('Upgrade unlocked', `Scratch to reveal ${C.cars[reward.unlocked].name}.`, [], 'page-8/5-correct-in-a-row-pop-up.webp');
    $('scratch-area').hidden = false; await paintImage($('scratch-car'), reward.unlocked); await initScratch(); $('reveal-car').focus();
  }
  async function initScratch() {
    scratched = false; scratchDown = false; scratchLast = null;
    const canvas = $('scratch'); delete canvas.dataset.ready; canvas.width = 320; canvas.height = 320; const brush = canvas.getContext('2d');
    brush.globalCompositeOperation = 'source-over'; const gradient = brush.createLinearGradient(0, 0, 320, 320);
    gradient.addColorStop(0, '#ffed83'); gradient.addColorStop(.5, '#dc8a19'); gradient.addColorStop(1, '#fff6b2'); brush.fillStyle = gradient; brush.fillRect(0, 0, 320, 320);
    brush.fillStyle = '#082337'; brush.font = '900 30px system-ui'; brush.textAlign = 'center'; brush.fillText('SCRATCH', 160, 145); brush.fillText('TO REVEAL', 160, 185);
    const artwork = new Image(); artwork.src = asset('page-8/scratch-card.webp');
    try {
      await artwork.decode();
      const bounds = document.createElement('canvas'); bounds.width = artwork.naturalWidth; bounds.height = artwork.naturalHeight;
      const scan = bounds.getContext('2d'); scan.drawImage(artwork, 0, 0);
      const pixels = scan.getImageData(0, 0, bounds.width, bounds.height).data;
      let left = bounds.width, top = bounds.height, right = 0, bottom = 0;
      for (let y = 0; y < bounds.height; y++) for (let x = 0; x < bounds.width; x++) {
        if (pixels[(y * bounds.width + x) * 4 + 3] < 32) continue;
        left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      if (!scratched && right > left) brush.drawImage(artwork, left, top, right - left + 1, bottom - top + 1, 0, 0, 320, 320);
    } catch (_) { /* Keep the visible, scratchable fallback if the artwork cannot decode. */ }
    canvas.dataset.ready = 'true';
  }
  function scratchPoint(event) {
    if (!scratchDown || scratched || $('scratch-area').hidden || $('scratch').dataset.ready !== 'true') return;
    const canvas = $('scratch'), rect = canvas.getBoundingClientRect(), brush = canvas.getContext('2d');
    const p = { x: (event.clientX - rect.left) * 320 / rect.width, y: (event.clientY - rect.top) * 320 / rect.height };
    brush.globalCompositeOperation = 'destination-out'; brush.lineWidth = 42; brush.lineCap = 'round'; brush.beginPath(); brush.moveTo(scratchLast?.x ?? p.x, scratchLast?.y ?? p.y); brush.lineTo(p.x, p.y); brush.stroke(); scratchLast = p;
    // Measure actual erased pixels on a 16px grid, including interpolated strokes.
    const data = brush.getImageData(0, 0, 320, 320).data; let clear = 0;
    for (let y = 8; y < 320; y += 16) for (let x = 8; x < 320; x += 16) if (data[(y * 320 + x) * 4 + 3] < 64) clear++;
    if (clear / 400 >= .6) revealCar().catch(reportError);
  }
  let rotationTimer;
  async function revealCar() {
    if (scratched || !reward || reward.unlocked === null) return;
    scratched = true; scratchDown = false;
    await animate($('scratch'), [{ opacity: 1 }, { opacity: 0 }], 400);
    modal('Car upgraded!', `You unlocked ${C.cars[reward.unlocked].name}.`, [button('Keep driving', continueReward, 'page-9/keep-driving-button.webp')], 'page-9/car-upgraded-pop-up.webp');
    const img = $('reward-car'); img.hidden = false; await paintImage(img, reward.unlocked);
    const frames = C.cars[reward.unlocked].frames;
    if (frames.length) { let i = 0; rotationTimer = setInterval(() => { if (!document.hidden) img.src = asset(frames[(i++) % frames.length]); }, 100); }
    else img.classList.add('rotating'); // Temporary turntable effect; production frames plug in above.
    $('next-car-info').hidden = false; $('next-car-info').textContent = game.freePlay ? 'All 9 cars unlocked' : `Next: ${C.cars[game.day.unlocked].name} · 0/5 diamonds`;
    confetti();
  }
  async function continueReward() {
    clearInterval(rotationTimer);
    if (reward?.allCars && $('modal-title').textContent !== 'All cars unlocked!') {
      modal('All cars unlocked!', 'You earned all nine cars. The road continues in free play.',
        [button('Keep driving', continueReward, 'page-10/keep-driving-button.webp'), button('My cars', async () => { closeModal(); reward = null; await homeAfterDrive('collection'); }, 'page-10/my-cars-button.webp')], 'page-10/all-cars-unlocked-panel.webp'); return;
    }
    const upgraded = reward?.unlocked !== null; reward = null; closeModal();
    if (game.checkDay()) { await resetHome(); return; }
    await startDrive(upgraded, true);
  }
  async function homeAfterDrive(target = 'home') {
    game.discard(); game.checkDay(); phase = 'idle'; paused = false; silence();
    try { await save(); }
    catch (error) {
      reportError(error);
      modal('Save paused', 'Retry saving your completed progress before returning home.', [button('Retry save', () => homeAfterDrive(target))]);
      return;
    }
    closeModal(); await renderGarage(); await show(target, true);
  }
  function exitDialog(isPause = false) {
    if (!game?.active || busy || !$('modal').hidden || !['reading', 'travel', 'countdown'].includes(phase)) return;
    paused = true; silence();
    modal(isPause ? 'Paused' : 'Leave the track?', 'Save & Exit keeps completed levels. Your current diamond streak will be lost.', [
      button('Keep playing', () => { closeModal(); paused = false; play('music'); }),
      button('Save & Exit', async () => { closeModal(); await homeAfterDrive(); }, 'page-11/save-and-evit-button.webp')
    ], isPause ? null : 'page-11/exit-panel.webp');
  }
  async function resetHome() {
    phase = 'idle'; silence(); await save(); await renderGarage(); if (view !== 'home') await show('home', true);
    modal('A new day on the track', 'Your daily collection has reset. Start again with Car-1. Previous completed progress remains in your history.', [button('Let’s drive', closeModal)]);
  }
  let dayChecking = false;
  async function checkClock() {
    if (!game || dayChecking) return;
    dayChecking = true;
    try {
      const remaining = CarzCore.nextMidnight(Date.now()) - Date.now(); const changed = CarzCore.dayKey(Date.now()) !== game.day.date;
      const hold = game.active || reward !== null || busy;
      $('reset-notice').hidden = !(remaining <= 300000 || changed && hold);
      if (!$('reset-notice').hidden) $('reset-notice').textContent = changed ? 'Daily reset pending — finish this level first.' : `Track resets at midnight IST · ${Math.floor(remaining / 60000)}:${String(Math.floor(remaining / 1000) % 60).padStart(2, '0')}`;
      if (changed && hold) game.pendingReset = true;
      else if (changed && game.checkDay()) { closeModal(); await resetHome(); }
    } finally { dayChecking = false; }
  }
  function fit() {
    const rect = $('track').getBoundingClientRect(); width = rect.width || 1; height = rect.height || 1;
    const scale = Math.min(devicePixelRatio || 1, 2); $('road').width = Math.round(width * scale); $('road').height = Math.round(height * scale); ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const landscape = matchMedia('(pointer:coarse)').matches && innerWidth > innerHeight;
    $('portrait').hidden = !landscape;
  }
  function drawRoad(dt) {
    distance += dt * height / (game?.travelSeconds || 3.8);
    app.style.setProperty('--scenery-offset', `${distance}px`);
    ctx.fillStyle = '#263b4b'; ctx.fillRect(0, 0, width, height);
    for (const x of [2, width - 5, width / 2 - 3]) { ctx.fillStyle = '#f2cb39'; ctx.fillRect(x, 0, 3, height); }
    for (const x of [width * .25, width * .75]) { ctx.fillStyle = '#eaf0f5'; for (let y = distance % 100 - 100; y < height; y += 100) ctx.fillRect(x - 1.5, y, 3, 45); }
    ctx.fillStyle = '#ffffff08'; for (let i = 0; i < 100; i++) ctx.fillRect(i * 47.3 % width, (i * 89.7 + distance) % height, 1, 1);
    ctx.fillStyle = '#dcf5ff44'; for (let i = 0; i < 6; i++) ctx.fillRect(i < 3 ? 5 + i * 3 : width - 7 - i * 2, (distance * 1.5 + i * height / 3) % height, 1, 40);
    if (game?.day.selected >= 4) {
      const x = position * width, y = height * .85; ctx.fillStyle = '#55caffaa';
      for (const dx of [-6, 6]) { ctx.beginPath(); ctx.moveTo(x + dx - 3, y); ctx.lineTo(x + dx + 3, y); ctx.lineTo(x + dx, y + 20 + Math.sin(distance / 10) * 4); ctx.fill(); }
    }
  }
  function frame(time) {
    const raw = previous ? Math.min(.05, (time - previous) / 1000) : 0; previous = time;
    const frozen = document.hidden || paused || !$('portrait').hidden;
    const dt = frozen ? 0 : raw;
    for (const task of clockWaiters) { task.remaining -= dt; if (task.remaining <= 0) { clockWaiters.delete(task); task.resolve(); } }
    if (view === 'race') {
      const moving = !busy && $('modal').hidden && ['countdown', 'reading', 'travel', 'entry'].includes(phase);
      drawRoad(moving ? dt : 0);
      const target = lane === 0 ? .25 : .75; const old = position;
      if (!frozen) position += (target - position) * (1 - Math.exp(-12 * dt));
      tilt += ((position - old) * -450 - tilt) * (1 - Math.exp(-14 * dt));
      $('race-car').style.transform = `translateX(${position * width}px) translateX(-50%) rotate(${tilt}deg)`;
      if (moving && dt) {
        if (phase === 'countdown') { countdown -= dt; updateCountdown(); if (countdown <= 0) { $('countdown').hidden = true; sounds.countdown.pause(); newQuestion(); } }
        else if (phase === 'reading') { reading -= dt; if (reading <= 0) { phase = 'travel'; $('tunnels').hidden = false; } }
        else if (phase === 'travel') {
          elapsed += dt; const progress = Math.min(1, elapsed / game.travelSeconds);
          $('question-time').style.transform = `scaleX(${1 - progress})`;
          $('tunnels').style.transform = `translateY(${-height * .22 + progress * height * .88}px)`;
          if (progress === 1) resolveAnswer().catch(reportError);
        }
      }
    }
    requestAnimationFrame(frame);
  }
  let loading = false;
  async function loadGame() {
    if (loading) return; loading = true; $('load-retry').hidden = true;
    try {
      if (!('serviceWorker' in navigator) || !globalThis.caches) throw new Error('Open using HTTPS or localhost to prepare offline play.');
      if (!game) {
        const saved = await repository.load(); game = new CarzCore.Game(saved);
        if (!saved) { const colors = repository.adapter.legacyColors(); colors.forEach((color, i) => { if (i < C.cars.length && C.colors.some(c => c[0] === color)) game.day.colors[i] = color; }); }
        returning = game.open();
      }
      await save();
      const registration = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
      const worker = registration.installing || registration.waiting || registration.active;
      if (worker && worker.state !== 'activated') await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('Offline setup timed out. Retry to continue.')), 60000); worker.addEventListener('statechange', () => { if (worker.state === 'activated') { clearTimeout(timer); resolve(); } else if (worker.state === 'redundant') { clearTimeout(timer); reject(new Error('Offline setup interrupted.')); } }); });
      await CarzPreload.waitForControl(navigator.serviceWorker, registration);
      await CarzPreload.preload({ entries: CARZ_ASSETS, cache: await caches.open(CarzAssetCache.cacheName), base: document.baseURI, assetKey: CarzAssetCache.assetKey,
        concurrency: navigator.connection?.saveData || /2g/.test(navigator.connection?.effectiveType || '') ? 2 : 4,
        onProgress: ({ loaded, total, complete, count }) => { const percent = Math.min(99, Math.floor(loaded / total * 100)); $('load-progress').value = percent; $('load-percent').textContent = `${percent}%`; $('load-status').textContent = `${complete}/${count} files · ${(loaded / 1048576).toFixed(1)} / ${(total / 1048576).toFixed(1)} MB`; }
      });
      await CarzPreload.prepareImages({ images: [...document.images], entries: CARZ_ASSETS, base: document.baseURI, assetKey: CarzAssetCache.assetKey });
      $('load-progress').value = 100; $('load-percent').textContent = '100%'; $('load-status').textContent = 'Ready to drive'; $('loader').hidden = true; $('opening-next').disabled = false;
      app.dataset.ready = 'true'; await renderGarage();
    } catch (error) { $('load-status').textContent = `Loading paused. ${error.message}`; $('load-retry').hidden = false; }
    finally { loading = false; }
  }
  on('load-retry', loadGame);
  on('opening-next', async () => { if (busy) return; play('music'); if (!game.profile.device.demoDone) await openDemo(false); else { await renderGarage(); await show('home'); } });
  on('demo-prev', () => { if (!busy && demoIndex > 0) { demoIndex--; renderDemo(); } });
  on('demo-next', async () => { if (busy) return; const slides = help && C.helpSlides.length ? C.helpSlides : C.demos; if (demoIndex < slides.length - 1) { demoIndex++; renderDemo(); } else { if (!help) { game.profile.device.demoDone = true; await save(); } await renderGarage(); await show('home', true); } });
  on('start-driving', () => startDrive()); on('open-help', () => openDemo(true));
  on('open-cars', async () => { await renderGarage(); await show('collection'); }); on('collection-back', () => show('home', true));
  on('exit-race', () => exitDialog()); on('pause-race', () => exitDialog(true)); on('reveal-car', revealCar);
  for (const el of document.querySelectorAll('[data-lane]')) el.addEventListener('click', () => steer(Number(el.dataset.lane)));
  let gesture;
  $('track').addEventListener('pointerdown', e => { gesture = e.clientX; });
  $('track').addEventListener('pointerup', e => { if (gesture === undefined) return; if (Math.abs(e.clientX - gesture) > 18) steer(e.clientX > gesture ? 1 : 0); else steer(e.clientX < $('track').getBoundingClientRect().left + width / 2 ? 0 : 1); gesture = undefined; });
  $('track').addEventListener('pointercancel', () => { gesture = undefined; });
  document.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key) && view === 'race') { e.preventDefault(); steer(e.key === 'ArrowLeft' ? 0 : 1); } if (e.key === 'Escape') exitDialog(true);
    if (e.key === 'Tab' && !$('modal').hidden) { const buttons = [...$('modal').querySelectorAll('button')].filter(el => !el.disabled && el.offsetParent); const first = buttons[0], last = buttons.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } }
  });
  $('scratch').addEventListener('pointerdown', e => { scratchDown = true; scratchLast = null; try { $('scratch').setPointerCapture(e.pointerId); } catch (_) {} scratchPoint(e); });
  $('scratch').addEventListener('pointermove', scratchPoint);
  window.addEventListener('pointerup', () => { scratchDown = false; scratchLast = null; }); window.addEventListener('pointercancel', () => { scratchDown = false; scratchLast = null; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { silence(); if (game?.active && $('modal').hidden && ['reading', 'travel', 'countdown'].includes(phase)) exitDialog(true); } else { previous = 0; if (!paused && view !== 'opening') play('music'); checkClock().catch(reportError); } });
  window.addEventListener('pagehide', silence);
  window.addEventListener('resize', fit); if (globalThis.ResizeObserver) new ResizeObserver(fit).observe(app);
  setInterval(() => checkClock().catch(reportError), 1000); requestAnimationFrame(frame); fit(); loadGame();
  // Read-only diagnostics for QA; interactions still go through the visible controls.
  globalThis.CarzGame = { get state() { return { view, phase, lane, paused, busy, streak: game?.streak, level: game?.day.level, lanes: game?.day.lanes, question: game?.question, unlocked: game?.day.unlocked, ready: app.dataset.ready === 'true' }; } };
})();

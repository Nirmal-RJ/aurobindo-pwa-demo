/* Presentation controller: rules, persistence, config and media caching are separate modules. */
(() => {
  'use strict';
  const C = CarzConfig, $ = id => document.getElementById(id), app = $('game');
  const asset = file => new URL('../my-carz-game-assets/' + file, document.baseURI).href;
  const repository = new CarzStore.Repository(new CarzStore.LocalAdapter(localStorage));
  let game, returning = false, view = 'opening', phase = 'idle', busy = false, paused = false;
  let lane = 0, position = .25, tilt = 0, reading = 0, elapsed = 0, countdown = 0, previous = 0;
  let width = 1, reward = null, demoIndex = 0, help = false, paintRevision = 0;
  let lastFocus, scratchDown = false, scratched = false, scratchLast, displayedDiamonds = 0;
  const clockWaiters = new Set(), sounds = {};
  const cssClocks = new WeakMap(); let activeTime = 0, uiTime = 0;
  const steering = new CarzRaceView.Steering();
  const raceView = CarzRaceView.create({ app, track: $('track'), road: $('road'), car: $('race-car'), arrow: $('lane-arrow'), tunnels: $('tunnels') });
  const attention = CarzAttention.create({ race: $('race'), car: $('race-car'), question: document.querySelector('.carz-question'), diamonds: $('diamonds'), tunnels: $('tunnels'), animate, wait });
  let introToken = 0, upgradePending = false;
  let collectionUpgradePending=false;
  const rewardView = CarzRewardView.create({ app, asset, animate, wait, playSound: name=>play(name) });
  const audioEngine=CarzAudio.create(C.sounds,asset);
  document.addEventListener('pointerdown',audioEngine.unlock,{capture:true,passive:true});
  document.addEventListener('keydown',audioEngine.unlock,{capture:true});
  for (const [name, [file, volume]] of Object.entries(C.sounds)) { const audio = new Audio(asset(file)); audio.volume = volume; audio.loop = name === 'music'; sounds[name] = audio; }
  let musicPath=C.musicTracks.menu;
  function syncMusic(){
    if(document.hidden||paused)return;
    const file=view==='race'?C.musicTracks.game:C.musicTracks.menu;
    const music=sounds.music;
    if(file!==musicPath){music.pause();music.src=asset(file);musicPath=file;}
    music.play().catch(error=>console.warn('My Carz music:',error.message));
  }
  const play = name => { if (document.hidden) return; if(name==='music'){syncMusic();return;}if(audioEngine.play(name))return;const audio = sounds[name]; audio.currentTime = 0; audio.play().catch(error => console.warn(`My Carz ${name} audio:`,error.message)); };
  const suspendedSounds = new Set();
  function silence(remember = false) {
    audioEngine.silence(remember);
    if (!remember) suspendedSounds.clear();
    for (const audio of Object.values(sounds)) { if (remember && !audio.paused) suspendedSounds.add(audio); audio.pause(); }
  }
  function resumeSounds() { audioEngine.resume();for (const audio of suspendedSounds) audio.play().catch(() => {}); suspendedSounds.clear(); if (view !== 'opening') play('music'); }
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
  function animate(element, frames, duration = 380, easing = null) {
    if (typeof element.animate !== 'function') {
      // Preserve a visible entrance/exit on browsers lacking Web Animations.
      element.style.transition = `opacity ${duration}ms ${easing||'ease'}, transform ${duration}ms ${easing||'ease'}`;
      Object.assign(element.style, frames[0]); void element.offsetWidth;
      requestAnimationFrame(() => Object.assign(element.style, frames[frames.length - 1]));
      return wait(duration / 1000).then(() => { element.style.transition = ''; element.style.opacity = ''; element.style.transform = ''; });
    }
    const motion = element.animate(frames, { duration, easing: easing||'cubic-bezier(.22,.75,.25,1)', fill: 'both' });
    motion.pause(); motion.currentTime = 0;
    return new Promise(resolve => clockWaiters.add({ remaining: duration / 1000,
      update: remaining => { motion.currentTime = Math.min(duration, duration - remaining * 1000); },
      resolve: () => { motion.cancel(); resolve(); } }));
  }
  async function show(target, backwards = false) {
    if (busy || target === view) return false;
    busy = true; app.dataset.transitioning = 'true';
    const old = $(view), next = $(target), direction = backwards ? -1 : 1;
    try {
      await animate(old, [{ opacity: 1, transform: 'translateX(0) scale(1)' }, { opacity: 0, transform: `translateX(${-direction * 7}%) scale(.94)` }], 260);
      old.hidden = true; next.hidden = false; view = target;
      syncMusic();
      if(target==='home')updateHomeCarouselArrow();
      if(target==='collection')$('collection-cars').children[game.day.selected]?.scrollIntoView({block:'nearest',inline:'center'});
      await animate(next, [{ opacity: 0, transform: `translateX(${direction * 8}%) scale(.94)` }, { opacity: 1, transform: 'translateX(0) scale(1)' }], 380);
      next.querySelector('button:not(:disabled),a')?.focus({ preventScroll: true });
      return true;
    } finally { busy = false; delete app.dataset.transitioning; }
  }
  function modal(title, copy, actions = [], artwork) {
    $('modal').classList.toggle('exit-modal', artwork === 'page-11/exit-panel.webp');
    $('modal').classList.toggle('reward-modal', artwork === 'page-9/car-upgraded-pop-up.webp');
    $('modal').classList.toggle('all-cars-modal', artwork === 'page-10/all-cars-unlocked-panel.webp');
    $('all-cars-summary').hidden=true;
    $('modal').classList.toggle('scratch-modal', artwork === 'page-8/5-correct-in-a-row-pop-up.webp');
    $('modal').classList.toggle('crash-modal', artwork === 'page-7/crash-panel.webp');
    lastFocus = document.activeElement;
    $('modal-title').textContent = title; $('modal-copy').textContent = copy;
    const crash=artwork==='page-7/crash-panel.webp';
    $('streak-broken').hidden=!crash;
    if(crash){
      const label=document.createElement('span');label.className='crash-answer-label';label.textContent='Right answer:';
      const answer=document.createElement('span');answer.className='crash-answer-text';answer.textContent=copy.replace(/^Correct answer:\s*/, '');
      $('modal-copy').replaceChildren(label,document.createTextNode(' '),answer);
    }
    $('modal-art').hidden = !artwork; if (artwork) image('modal-art', artwork);
    for (const id of ['scratch-area', 'reward-car', 'next-car-info']) $(id).hidden = true;
    $('reward-car').classList.remove('rotating'); $('modal-actions').replaceChildren(...actions);
    $('modal').hidden = false; app.dataset.modal = 'true';
    $(view).inert = true;
    fitCrashCopy();
    $('modal-actions').querySelector('button')?.focus();
  }
  function fitCrashCopy(){
    if($('modal').hidden || !$('modal').classList.contains('crash-modal'))return;
    const text=$('modal-copy').querySelector('.crash-answer-text');if(!text)return;
    text.style.fontSize='';let size=parseFloat(getComputedStyle(text).fontSize);
    const box=$('modal-copy'),label=box.querySelector('.crash-answer-label');
    const fits=()=>label.offsetHeight+text.offsetHeight+parseFloat(getComputedStyle(box).rowGap)<=box.clientHeight && text.scrollWidth<=box.clientWidth;
    while(!fits() && size>11){size-=.5;text.style.fontSize=`${size}px`;}
  }
  function closeModal() { $('modal').hidden = true; delete app.dataset.modal; $(view).inert = false; lastFocus?.focus?.({ preventScroll: true }); }
  function diamonds() {
    const children = Array.from({ length: C.streakSize }, (_, i) => { const img = new Image(); img.src = asset('page-5/diamong.webp'); img.alt = ''; if (i < game.streak) img.className = i >= displayedDiamonds ? 'earned newly-earned' : 'earned'; return img; });
    displayedDiamonds = game.streak;
    const label = document.createElement('strong'); label.textContent = `${game.streak}/5`;
    $('diamonds').replaceChildren(...children, label); $('diamonds').setAttribute('aria-label', `${game.streak} of 5 diamonds`);
    $('race-level').textContent = game.freePlay ? 'FREE PLAY' : `LEVEL ${game.day.level}`;
  }
  async function paintImage(img, index, preview = true) {
    const source = asset(C.cars[index][preview === 'garage' ? 'garagePreview' : preview ? 'preview' : 'driving']);
    const color = game.day.colors[index]; img.dataset.paintKey = `${index}:${color}`;
    const result = await CarzPaint.paintedCar(index, color, source);
    if (img.dataset.paintKey === `${index}:${color}`) { img.src = result; img.alt = C.cars[index].name; }
  }
  async function renderGarage() {
    const revision = ++paintRevision, d = game.day;
    const painted=[];
    $('home-level').textContent = game.freePlay ? 'ALL CARS UNLOCKED · FREE PLAY' : `LEVEL ${d.level} · 5 DIAMONDS TO UPGRADE`;
    $('unlocked-today').textContent = `${d.unlocked}/9`;
    $('collection-previous').disabled=d.selected===0;
    $('collection-next').disabled=d.selected+1>=d.unlocked;
    $('collection-drive').hidden=false;
    $('collection').classList.add('choose-before-drive');
    $('returning-actions').hidden = !returning;
    $('home-previous').disabled = d.selected === 0;
    $('home-next').disabled = d.selected + 1 >= d.unlocked;
    for (const prefix of ['home', 'collection']) {
      $(prefix + '-name').textContent = C.cars[d.selected].name;
      painted.push(paintImage($(prefix + '-car'), d.selected, 'garage'));
      $(prefix + '-cars').replaceChildren(...C.cars.map((car, index) => {
        if(prefix==='home' && index<d.selected)return null;
        const el = prefix==='home'?document.createElement('div'):button(car.name, async () => {
          if (!game.select(index)) return;
          await save(); await renderGarage();
          if (prefix === 'collection') $(prefix + '-cars').children[index]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
        });
        el.className = 'carz-card';
        if(prefix==='home'){
          el.dataset.current=String(index===d.selected);el.classList.toggle('preview-locked',index>=d.unlocked);
          el.setAttribute('role','group');el.setAttribute('aria-label',`${index===d.selected?'Current car':'Next car'}: ${car.name}`);
        }else{el.disabled = index >= d.unlocked; el.setAttribute('aria-pressed', String(index === d.selected));}
        const img = new Image(); img.src = asset(car.garagePreview); img.alt = ''; painted.push(paintImage(img,index,'garage')); const text = document.createElement('strong'); text.textContent = car.name;
        const note = document.createElement('small'); note.textContent = index >= d.unlocked ? 'LOCKED' : index === d.selected ? 'SELECTED' : 'UNLOCKED';
        if (prefix === 'home') {
          const heading = document.createElement('span'); heading.className = 'home-card-heading';
          heading.textContent = index === d.selected ? 'Current car' : 'Next car';
          el.style.order = String(index - d.selected);
          el.replaceChildren(heading, img, text, note);
        } else {
          if(index>=d.unlocked){
            const status=document.createElement('span');status.className='locked-car-copy';
            const label=document.createElement('span');label.textContent='LOCKED';
            const level=document.createElement('span');level.className='unlock-level';level.textContent=`CLEAR LEVEL ${index}`;
            status.append(label,level);note.className='locked-car-status';note.replaceChildren(status);
            el.setAttribute('aria-label',`${car.name}, locked, clear level ${index}`);
          }
          el.replaceChildren(img, text, note);
        }
        if(index>=d.unlocked){
          const overlay=document.createElement('i');overlay.className='car-lock silhouette-lock';overlay.setAttribute('aria-hidden','true');el.append(overlay);
        }
        return el;
      }).filter(Boolean));
      if (prefix === 'home') {
        const row=$('home-cars');
        for(const card of [...row.children]){
          const order=Number(card.style.order);card.style.order=String(order*2);
          if(order===C.cars.length-d.selected-1)continue;
          const gap=document.createElement('div');gap.className='home-card-gap';gap.style.order=String(order*2+1);
          for(const direction of [-1,1]){
            const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');
            arrow.textContent=direction<0?'\u276e':'\u276f';gap.append(arrow);
          }
          row.append(gap);
        }
        row.scrollTo({ left: 0, behavior: 'smooth' });
      }
      $(prefix + '-paints').replaceChildren(...C.colors.map(([id, name, hex]) => {
        const el = button(name, async () => { game.paint(id); await save(); await renderGarage(); });
        el.replaceChildren(); el.title = name; el.style.setProperty('--paint', hex); el.setAttribute('aria-pressed', String(d.colors[d.selected] === id)); return el;
      }));
    }
    await Promise.all(painted);
    if (revision !== paintRevision) return;
    updateHomeCarouselArrow();
  }
  const demoTitles = ['Read the question', 'Swipe towards the Good or Bad tunnel', 'Earn diamonds and upgrade your car', 'Wrong answers reset diamonds'];
  function renderDemo() {
    const slides = help && C.helpSlides.length ? C.helpSlides : C.demos;
    image('demo-image', slides[demoIndex]); $('demo-image').alt = demoTitles[demoIndex % demoTitles.length];
    $('demo-counter').textContent = `${demoIndex + 1} / ${slides.length}`; $('demo-prev').disabled = demoIndex === 0;
    $('demo-next').textContent = demoIndex === slides.length - 1 ? 'Finish' : 'Next →';
  }
  async function openDemo(asHelp) { if (busy) return; help = asHelp; demoIndex = 0; renderDemo(); await show('demo'); }
  function updateEnvironment() {
    const themes = ['1-a', '2', '3', '4', '5', '6']; const theme = themes[Math.min(5, game.day.level - 1)];
    // Only theme 2 has wide transparent canvases. All other themes are narrow strips.
    // Width + auto height retains source aspect ratio instead of stretching to the viewport.
    app.style.setProperty('--left-scenery-width', theme === '2' ? `${940 / 167 * 100}%` : '100%');
    app.style.setProperty('--right-scenery-width', theme === '2' ? `${940 / 172 * 100}%` : '100%');
    const paths = ['left', 'right'].map(side => `page-5/${theme}-bg-${side}${theme === '2' ? '-v2' : ''}.webp`);
    ['left', 'right'].forEach((side, i) => app.style.setProperty(`--${side}-art`, `url("${asset(paths[i])}")`));
    return paths;
  }
  function tunnelArt() { game.day.lanes.forEach((label, i) => { image(`tunnel-${i}`, C.tunnels[label]); $(`tunnel-${i}`).alt = label; }); }
  function steer(next) {
    if (!['intro', 'question', 'reading', 'travel', 'recovery'].includes(phase) || paused || !$('modal').hidden || busy) return;
    if(phase==='recovery')steering.locked=false;
    if (steering.request(next, phase === 'travel' ? game.travelSeconds - elapsed : Infinity)) { lane = next; }
  }
  function updateArrow() {
    const visibleLane = position < .5 ? 0 : 1;
    $('lane-arrow').style.setProperty('--arrow', game.day.lanes[visibleLane] === 'Good' ? '#49ff47' : '#ff253b');
  }
  async function newQuestion(first = false, token = introToken, preDim = false) {
    const question = game.next(); phase = 'question'; reading = C.readingSeconds; elapsed = 0; steering.locked = false;
    $('question').textContent = question.prompt; $('question-time').style.transform = 'scaleX(1)'; $('feedback').hidden = true;
    $('race-car').style.visibility = ''; tunnelArt(); updateArrow(); diamonds();
    attention.question(first, preDim);
    if (preDim) {
      await wait(.22);
      if (!attention.current(token) || phase !== 'question') return;
    }
    play('question');
    await Promise.all([attention.questionIn(), animate($('question'), [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0px)' }], 380)]);
    if (!attention.current(token) || phase !== 'question') return;
    if (first) {
      await wait(CarzAttention.pacing.questionHoldSeconds); // Let the question settle before the HUD reveal.
      if (!attention.current(token) || phase !== 'question') return;
      attention.ready(token);
    }
    if (phase === 'question' && attention.current(token)) phase = 'reading';
  }
  let preparedRaceArt = [];
  async function prepareRace(environment) {
    // Keep decoded CSS backgrounds alive until the visible screen has painted them.
    const paths = [...environment, 'page-5/diamond-panel.webp', 'page-5/question-panel-white.webp'];
    preparedRaceArt = await Promise.all(paths.map(async file => {
      const img = new Image(); img.src = asset(file);
      let timeout;
      try { await Promise.race([img.decode(), new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Race artwork is taking too long. Please retry.')), 15000); })]); }
      finally { clearTimeout(timeout); }
      return img;
    }));
    const race = $('race'), wasHidden = race.hidden, visibility = race.style.visibility;
    race.style.visibility = 'hidden'; race.hidden = false;
    try {
      fit(); await raceView.calibrate();
      raceView.render({ phase: 'preparing', progress: 0, dt: 0, moving: false, travelSeconds: game.travelSeconds, position, tilt: 0, selected: game.day.selected });
      if (!$('road').width || !raceView.width) throw new Error('Race layout could not be prepared. Please retry.');
    } finally { race.hidden = wasHidden; race.style.visibility = visibility; }
  }
  async function startDrive(upgraded = false, continuing = false) {
    if (busy) return;
    if (game.checkDay()) { await save(); await renderGarage(); }
    introToken = attention.prepare(); upgradePending = upgraded;
    game.begin({ countPlay: !continuing }); phase = 'preparing'; lane = 0; position = .25; paused = false; countdown = 4; steering.reset(); raceView.reset();
    // Metadata/preferences can be saved without including the partial attempt.
    await save(); const environment = updateEnvironment(); tunnelArt(); diamonds(); updateArrow();
    $('question').textContent = 'Get ready'; $('feedback').hidden = true; $('tunnels').hidden = true;
    countLabel = ''; $('countdown').classList.remove('leaving');
    $('countdown').hidden = false; updateCountdown();
    const drivingScale=C.cars[game.day.selected].drivingScale || 1;
    $('race-car').style.setProperty('--driving-scale',drivingScale);
    $('race-car').style.setProperty('--car-rest-bottom',`${23-9*drivingScale}%`);
    await paintImage($('race-car'), game.day.selected, false);
    try { await prepareRace(environment); }
    catch (error) { attention.cancel(); game.discard(); phase = 'idle'; throw error; }
    await show('race'); fit();
    $('race-car').style.visibility = '';
    $('race-car').classList.remove('upgrade-entry');
    phase = 'countdown';
    play('music'); play('countdown'); $('countdown').hidden = false; updateCountdown();
  }
  async function revealRace() {
    const token = introToken;
    phase = 'intro';
    if (!await attention.car(token, upgradePending) || phase !== 'intro') return;
    if (!await attention.hud(token) || phase !== 'intro') return;
    await newQuestion(true, token);
  }
  let countLabel = '';
  function updateCountdown() {
    const label = countdown > 1 ? String(Math.ceil(countdown) - 1) : 'GO!';
    if (label !== countLabel) {
      countLabel = label; $('countdown-value').textContent = label;
      if(label==='GO!'){sounds.countdown.pause();audioEngine.stop('countdown');play('go');}
      $('countdown').dataset.step = label;
      $('countdown-value').classList.remove('pulse'); void $('countdown-value').offsetWidth; $('countdown-value').classList.add('pulse');
    }
    $('countdown').classList.toggle('leaving', countdown > 0 && countdown <= .22);
  }
  function confetti() {
    return rewardView.confetti();
  }
  async function resolveAnswer() {
    if (phase !== 'travel') return;
    const earnedBefore=game.streak;
    lane = steering.commit(); phase = 'feedback'; const result = game.answer(lane); if (!result) return;
    raceView.outcome(result.correct);
    $('feedback').textContent = result.correct ? 'Correct' : 'Wrong'; $('feedback').hidden = false;
    if (result.correct) {
      $('feedback').hidden = true;
      await wait(C.correctCinematic.slowSeconds);
      play('pass');
      await wait(C.correctCinematic.returnSeconds);
      play('correct'); $('feedback').hidden = true;
      let collectionCelebration;
      await Promise.all([
        rewardView.play(game.streak, lane, () => {diamonds();if(!result.complete)play('unlock');collectionCelebration=confetti();}),
        (async () => { await wait(CarzRaceView.motion.passSeconds + CarzRaceView.motion.returnSeconds - .26); await attention.questionOut(); })()
      ]);
      if (!result.complete) {
        await collectionCelebration;
        await newQuestion(false, introToken, true); return;
      }
      audioEngine.stop('unlock');sounds.unlock.pause();
      reward = game.complete();
      const reveal = async () => { await save(); await rewardView.merge(async()=>{await collectionCelebration;await confetti();}, showUpgrade); };
      try { await reveal(); }
      catch (error) { reportError(error); modal('Save paused', 'Keep this page open and retry saving your completed level.', [button('Retry save', reveal)]); }
    } else {
      $('feedback').hidden = true;
      await wait(C.crashSequence.entrySeconds);
      play('wrong'); app.classList.remove('wrong-impact'); void app.offsetWidth; app.classList.add('wrong-impact');
      $('car-effects').style.setProperty('--crash-y', `${raceView.snapshot.front.y * 100}%`);
      $('car-effects').style.setProperty('--crash-x', `${raceView.snapshot.front.x * 100}%`); $('car-effects').replaceChildren(...Array.from({ length: 7 }, (_, i) => {
        const smoke = document.createElement('div'); smoke.className = 'crash-smoke';
        smoke.style.setProperty('--smoke-x', `${(i - 3) * 13}px`);
        smoke.style.setProperty('--smoke-y', `${-35 - i * 10}px`);
        smoke.style.animationDelay = `${i * .014}s`; return smoke;
      }));
      rewardView.explosion($('car-effects'));
      play('explosion');
      await wait(Math.max(0,C.explosion.seconds-.26));
      await attention.questionOut(); app.classList.remove('wrong-impact'); $('car-effects').replaceChildren();
      await rewardView.lose(earnedBefore);diamonds();
      modal('Wrong answer', `Correct answer: ${game.question.rightAction || result.answer}`,
        [button('Keep driving', async () => {
          await animate($('modal').firstElementChild, [{ opacity: 1, transform: 'translateY(0px)' }, { opacity: 0, transform: 'translateY(20px)' }], 260);
          closeModal(); phase = 'recovery'; raceView.reset(); $('race-car').style.visibility = ''; $('feedback').hidden = true;
          await wait(1.1); if (phase === 'recovery') await newQuestion();
        }, 'page-7/keep-driving-button.webp')], 'page-7/crash-panel.webp');
    }
  }
  async function showUpgrade() {
    if (reward.unlocked === null) {
      await showAllCars(); return;
    }
    const card=$('modal').querySelector('.carz-modal-card');
    card.style.visibility='hidden';
    try {
      modal('Upgrade unlocked', `Scratch to reveal ${C.cars[reward.unlocked].name}.`, [], 'page-8/5-correct-in-a-row-pop-up.webp');
      $('scratch-area').style.visibility='hidden';$('scratch-area').hidden = false; $('scratch-area').inert = true;
      await paintImage($('scratch-car'), reward.unlocked); await initScratch();
    } catch(error) {card.style.visibility='';throw error;}
  }
  async function initScratch() {
    scratched = false; scratchDown = false; scratchLast = null;
    const canvas = $('scratch'); delete canvas.dataset.ready; canvas.width = canvas.height = C.scratchCard.resolution; const brush = canvas.getContext('2d');
    brush.setTransform(canvas.width / 320, 0, 0, canvas.height / 320, 0, 0);
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
      if (!scratched && right > left) { brush.clearRect(0, 0, 320, 320); brush.drawImage(artwork, left, top, right - left + 1, bottom - top + 1, 0, 0, 320, 320); }
    } catch (_) { /* Keep the visible, scratchable fallback if the artwork cannot decode. */ }
    canvas.dataset.ready = 'true'; canvas.dataset.scratchRow='0';
  }
  function scratchPoint(event) {
    if (!scratchDown || scratched || $('scratch-area').hidden || $('scratch').dataset.ready !== 'true') return;
    const canvas = $('scratch'), rect = canvas.getBoundingClientRect(), brush = canvas.getContext('2d');
    const p = { x: (event.clientX - rect.left) * 320 / rect.width, y: (event.clientY - rect.top) * 320 / rect.height };
    brush.save(); brush.beginPath(); brush.rect(12, 12, 296, 296); brush.clip();
    brush.globalCompositeOperation = 'destination-out'; brush.lineWidth = 42; brush.lineCap = 'round'; brush.beginPath(); brush.moveTo(scratchLast?.x ?? p.x, scratchLast?.y ?? p.y); brush.lineTo(p.x, p.y); brush.stroke(); brush.restore(); scratchLast = p;
    // Measure actual erased pixels on a 16px grid, including interpolated strokes.
    const data = brush.getImageData(0, 0, canvas.width, canvas.height).data; let clear = 0;
    for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) {
      const px=Math.floor((12+(x+.5)*296/20)*canvas.width/320),py=Math.floor((12+(y+.5)*296/20)*canvas.height/320);
      if (data[(py * canvas.width + px) * 4 + 3] < 64) clear++;
    }
    if (clear / 400 >= C.scratchCard.revealFraction) revealCar().catch(reportError);
  }
  let rotationTimer;
  async function revealCar() {
    if (scratched || !reward || reward.unlocked === null) return;
    scratched = true; scratchDown = false;
    await animate($('scratch'), [{ opacity: 1 }, { opacity: 0 }], 400);
    modal('Car upgraded!', `You unlocked ${C.cars[reward.unlocked].name}.`, [button('Keep driving', continueReward, 'page-9/keep-driving-button.webp')], 'page-9/car-upgraded-pop-up.webp');
    play('unlock');
    const img = $('reward-car'); img.hidden = false; await paintImage(img, reward.unlocked);
    const frames = C.cars[reward.unlocked].frames;
    if (frames.length) { let i = 0; rotationTimer = setInterval(() => { if (!document.hidden) img.src = asset(frames[(i++) % frames.length]); }, 100); }
    else img.classList.add('rotating'); // Temporary turntable effect; production frames plug in above.
    const nextPanel=$('next-car-info');nextPanel.hidden=false;nextPanel.replaceChildren();nextPanel.classList.toggle('all-unlocked',game.freePlay);
    if(game.freePlay){nextPanel.textContent='All 9 cars unlocked';}
    else{
      const copy=document.createElement('div');copy.className='next-car-copy';
      const title=document.createElement('strong');title.append('Next: ');const name=document.createElement('span');name.textContent=C.cars[game.day.unlocked].name;title.append(name);
      const progress=document.createElement('div');progress.className='next-car-diamonds';
      for(let i=0;i<5;i++){const gem=new Image();gem.src=asset('page-5/diamong.webp');gem.alt='';progress.append(gem);}
      const count=document.createElement('span');count.textContent='0/5';progress.append(count);copy.append(title,progress);
      const nextCar=new Image();nextCar.className='next-car-preview';nextPanel.append(copy,nextCar);await paintImage(nextCar,game.day.unlocked,true);
    }
    confetti();
  }
  async function continueReward() {
    clearInterval(rotationTimer);
    if (reward?.allCars && $('modal-title').textContent !== 'All cars unlocked!') {
      await showAllCars(); return;
    }
    const upgraded = reward?.unlocked !== null; reward = null; closeModal();
    if (game.checkDay()) { await resetHome(); return; }
    if(upgraded){collectionUpgradePending=true;await renderGarage();await show('collection',true);return;}
    await startDrive(upgraded, true);
  }
  async function showAllCars() {
    modal('All cars unlocked!', 'You earned all nine cars. Keep driving until midnight, or view your cars.',
      [button('Keep driving', continueReward, 'page-10/keep-driving-button.webp'),button('My cars',async()=>{collectionUpgradePending=!!reward?.allCars;closeModal();reward=null;await homeAfterDrive('collection');},'page-10/my-cars-button.webp')], 'page-10/all-cars-unlocked-panel.webp');
    $('all-cars-summary').hidden=false;
    const grid=$('all-cars-grid');grid.replaceChildren();
    await Promise.all([paintImage($('all-cars-hero'),game.day.selected,false),...C.cars.map((car,index)=>{
      const tile=document.createElement('div');tile.className='all-cars-tile';tile.classList.toggle('selected',index===game.day.selected);
      const img=new Image();img.alt=car.name;tile.append(img);grid.append(tile);return paintImage(img,index);
    })]);
  }
  async function homeAfterDrive(target = 'home') {
    attention.cancel();
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
    if (!game?.active || busy || !$('modal').hidden || !['intro', 'question', 'reading', 'travel', 'countdown', 'recovery', 'entry'].includes(phase)) return;
    paused = true; silence(true);
    modal(isPause ? 'Paused' : 'Leave the track?', isPause ? 'Save & Exit keeps completed levels. Your current diamond streak will be lost.' : 'Leaving the track will reset your current streak', [
      button('Keep playing', () => { closeModal(); paused = false; resumeSounds(); }, isPause ? null : 'page-11/keep-driving-button.webp'),
      button('Save & Exit', async () => { closeModal(); await homeAfterDrive(); }, 'page-11/save-and-evit-button.webp')
    ], isPause ? null : 'page-11/exit-panel.webp');
  }
  async function resetHome() {
    phase = 'idle'; silence(); await save(); await renderGarage(); if (view !== 'home') await show('home', true);
    modal('A new day on the track', `Your daily collection has reset. Start again with ${C.cars[0].name}. Previous completed progress remains in your history.`, [button('Let’s drive', closeModal)]);
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
    fitCrashCopy();
    raceView.resize(); width = raceView.width;
    const landscape = matchMedia('(pointer:coarse)').matches && innerWidth > innerHeight;
    $('portrait').hidden = !landscape;
  }
  function frame(time) {
    const raw = previous ? (time - previous) / 1000 : 0; previous = time;
    if (raw > .25 && view === 'race') exitDialog(true);
    const frozen = document.hidden || paused || !$('portrait').hidden;
    const dt = frozen ? 0 : Math.min(raw, .25);
    activeTime += dt * 1000; uiTime += document.hidden ? 0 : Math.min(raw, .25) * 1000;
    for (const animation of app.getAnimations?.({ subtree: true }) || []) {
      if (!animation.animationName && !animation.transitionProperty) continue;
      const target=animation.effect?.target;
      // Attention fades keep one native timeline; do not rewind a running CSS
      // transition when the frame loop first discovers it. Pause still freezes it.
      if(animation.transitionProperty && target?.matches?.('.intro-dimmer,.carz-hud,.carz-question,#exit-race')){
        if(frozen){if(animation.playState==='running')animation.pause();}
        else if(animation.playState==='paused')animation.play();
        continue;
      }
      const clock = target?.closest?.('#modal') ? uiTime : activeTime;
      if (!cssClocks.has(animation)) { cssClocks.set(animation, clock); animation.pause(); }
      animation.currentTime = clock - cssClocks.get(animation);
    }
    rewardView.update(dt);
    for (const task of clockWaiters) { task.remaining -= dt; task.update?.(task.remaining); if (task.remaining <= 0) { clockWaiters.delete(task); task.resolve(); } }
    if (view === 'race') {
      const moving = (!busy || phase === 'preparing') && $('modal').hidden && ['preparing', 'intro', 'question', 'countdown', 'reading', 'travel', 'entry', 'recovery'].includes(phase);
      if (!frozen) steering.advance(dt);
      position = steering.position; tilt = steering.tilt; updateArrow();
      if (moving && dt) {
        if (phase === 'countdown') { countdown -= dt; updateCountdown(); if (countdown <= 0) { $('countdown').hidden = true; sounds.countdown.pause(); revealRace().catch(reportError); } }
        else if (phase === 'reading') { reading -= dt; if (reading <= 0) {
          phase = 'travel'; raceView.approach();
        } }
        else if (phase === 'travel') {
          elapsed += dt; const progress = Math.min(1, elapsed / game.travelSeconds);
          attention.approach(CarzRaceView.worldProgress(progress));
          $('question-time').style.transform = `scaleX(${1 - progress})`;
        }
      }
      raceView.render({ phase, progress: elapsed / game.travelSeconds, dt, moving, travelSeconds: game.travelSeconds, position, tilt, selected: game.day.selected });
      if (phase === 'travel' && elapsed >= game.travelSeconds) resolveAnswer().catch(reportError);
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
      $('load-status').textContent = 'Downloads complete. Preparing game visuals…';
      await CarzPreload.prepareImages({ images: [...document.images], entries: CARZ_ASSETS, base: document.baseURI, assetKey: CarzAssetCache.assetKey });
      await rewardView.prepareExplosion();
      await audioEngine.prepare();
      await renderGarage();
      $('load-progress').value = 100; $('load-percent').textContent = '100%'; $('load-status').textContent = 'Ready to drive'; $('loader').hidden = true; $('opening-next').hidden = false; $('opening-next').disabled = false;
      app.dataset.ready = 'true';
    } catch (error) { $('load-status').textContent = `Loading paused. ${error.message}`; $('load-retry').hidden = false; }
    finally { loading = false; }
  }
  on('load-retry', loadGame);
  on('opening-next', async () => { if (busy) return; play('music'); if (!game.profile.device.demoDone) await openDemo(false); else { await renderGarage(); await show('home'); } });
  on('demo-prev', () => { if (!busy && demoIndex > 0) { demoIndex--; renderDemo(); } });
  on('demo-next', async () => { if (busy) return; const slides = help && C.helpSlides.length ? C.helpSlides : C.demos; if (demoIndex < slides.length - 1) { demoIndex++; renderDemo(); } else { if (!help) { game.profile.device.demoDone = true; await save(); } await renderGarage(); await show('home', true); } });
  on('start-driving', () => startDrive()); on('open-help', () => openDemo(true));
  let choosingHomeCar = false;
  function updateHomeCarouselArrow(){
    const row=$('home-cars');
    const bounds=row.getBoundingClientRect();
    row.querySelectorAll('.home-card-gap').forEach(gap=>{const r=gap.getBoundingClientRect();gap.style.visibility=r.left>=bounds.left-.5&&r.right<=bounds.right+.5?'visible':'hidden';});
    row.querySelectorAll('[data-car-scroll]').forEach(button=>button.disabled=Number(button.dataset.carScroll)<0?row.scrollLeft<=2:row.scrollLeft+row.clientWidth>=row.scrollWidth-2);
  }
  async function chooseHomeCar(index){
    if(busy||choosingHomeCar||index===game.day.selected||index<0||index>=game.day.unlocked)return;
    choosingHomeCar=true;$('home').inert=true;
    const direction=index>game.day.selected?1:-1,parts=[$('home-car'),$('home-cars'),$('home-name')];
    try{
      await Promise.all(parts.map((el,i)=>animate(el,[{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${-direction*(i===0?24:12)}%)`}],C.garageMotion.exitMs)));
      parts.forEach(el=>el.style.opacity='0');
      game.select(index);await save();await renderGarage();await $('home-car').decode();
      await Promise.all(parts.map((el,i)=>animate(el,[{opacity:0,transform:`translateX(${direction*(i===0?24:12)}%)`},{opacity:1,transform:'translateX(0)'}],C.garageMotion.enterMs)));
    }finally{
      parts.forEach(el=>{el.style.opacity='';el.style.transform='';});
      choosingHomeCar=false;$('home').inert=false;
      $('home-previous').disabled=game.day.selected===0;$('home-next').disabled=game.day.selected+1>=game.day.unlocked;
      updateHomeCarouselArrow();
    }
  }
  for (const [id, step] of [['home-previous', -1], ['home-next', 1]]) {
    $(id).addEventListener('click', async () => {
      if (busy || choosingHomeCar) return;
      play('click');
      try { await chooseHomeCar(game.day.selected+step); }
      catch (error) { reportError(error); }
    });
  }
  on('open-cars', async () => { collectionUpgradePending=false;await renderGarage(); await show('collection'); });
  on('collection-back', () => {collectionUpgradePending=false;return show('home', true);});
  on('collection-drive',async()=>{const continuing=collectionUpgradePending;collectionUpgradePending=false;await startDrive(continuing,continuing);});
  let choosingCollectionCar=false;
  async function chooseCollectionCar(index){
    if(busy||choosingCollectionCar||index===game.day.selected||index<0||index>=game.day.unlocked)return;
    choosingCollectionCar=true;$('collection').inert=true;
    const direction=index>game.day.selected?1:-1,parts=[$('collection-car'),$('collection-name')];
    try{
      await Promise.all(parts.map(el=>animate(el,[{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${-direction*24}%)`}],C.garageMotion.exitMs)));
      parts.forEach(el=>el.style.opacity='0');
      game.select(index);await save();await renderGarage();await $('collection-car').decode();
      $('collection-cars').children[index]?.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
      await Promise.all(parts.map(el=>animate(el,[{opacity:0,transform:`translateX(${direction*24}%)`},{opacity:1,transform:'translateX(0)'}],C.garageMotion.enterMs)));
    }finally{
      parts.forEach(el=>{el.style.opacity='';el.style.transform='';});
      choosingCollectionCar=false;$('collection').inert=false;
      $('collection-previous').disabled=game.day.selected===0;$('collection-next').disabled=game.day.selected+1>=game.day.unlocked;
    }
  }
  for(const [id,direction] of [['collection-previous',-1],['collection-next',1]])$(id).addEventListener('click',async()=>{
    if(busy||choosingCollectionCar)return;play('click');
    try{await chooseCollectionCar(game.day.selected+direction);}catch(error){reportError(error);}
  });
  on('exit-race', () => exitDialog());
  let gesture;
  $('track').addEventListener('pointerdown', e => { gesture = e.clientX; });
  $('track').addEventListener('pointerup', e => { if (gesture === undefined) return; if (Math.abs(e.clientX - gesture) > 18) steer(e.clientX > gesture ? 1 : 0); else steer(e.clientX < $('track').getBoundingClientRect().left + width / 2 ? 0 : 1); gesture = undefined; });
  $('track').addEventListener('pointercancel', () => { gesture = undefined; });
  document.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key) && view === 'race') { e.preventDefault(); steer(e.key === 'ArrowLeft' ? 0 : 1); } if (e.key === 'Escape') exitDialog();
    if (e.key === 'Tab' && !$('modal').hidden) { const buttons = [...$('modal').querySelectorAll('button')].filter(el => !el.disabled && el.offsetParent); const first = buttons[0], last = buttons.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } }
  });
  $('scratch').addEventListener('pointerdown', e => { scratchDown = true; scratchLast = null; try { $('scratch').setPointerCapture(e.pointerId); } catch (_) {} scratchPoint(e); });
  $('scratch').addEventListener('pointermove', scratchPoint);
  $('scratch').addEventListener('keydown', event => {
    if (![' ', 'Enter'].includes(event.key) || $('scratch-area').inert || scratched) return;
    event.preventDefault();
    const canvas=$('scratch'),rect=canvas.getBoundingClientRect(),row=Number(canvas.dataset.scratchRow||0)%8;
    canvas.dataset.scratchRow=String(row+1);scratchDown=true;scratchLast=null;
    const clientY=rect.top+rect.height*(.09+row*.115);
    scratchPoint({clientX:rect.left+rect.width*.07,clientY});
    scratchPoint({clientX:rect.left+rect.width*.93,clientY});
    scratchDown=false;scratchLast=null;
  });
  window.addEventListener('pointerup', () => { scratchDown = false; scratchLast = null; }); window.addEventListener('pointercancel', () => { scratchDown = false; scratchLast = null; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { silence(true); if (game?.active && $('modal').hidden) exitDialog(true); }
    else { previous = 0; if (!paused) resumeSounds(); checkClock().catch(reportError); }
  });
  window.addEventListener('pagehide', silence);
  window.addEventListener('resize', fit); if (globalThis.ResizeObserver) new ResizeObserver(fit).observe(app);
  setInterval(() => checkClock().catch(reportError), 1000); requestAnimationFrame(frame); fit(); loadGame();
  // Read-only diagnostics for QA; interactions still go through the visible controls.
  globalThis.CarzGame = { get audio(){return audioEngine.state;},sampleAudioPeak:()=>audioEngine.samplePeak(),get state() { return { view, phase, lane, position, scene: raceView.snapshot, remaining: game ? game.travelSeconds - elapsed : 0, paused, busy, streak: game?.streak, level: game?.day.level, lanes: game?.day.lanes, question: game?.question, unlocked: game?.day.unlocked, ready: app.dataset.ready === 'true' }; } };
})();

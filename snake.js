'use strict';
// World coordinates are independent of viewport size and rendering resolution.
const SnakePhysics = {
  turn(angle, target, limit) {
    const difference = Math.atan2(Math.sin(target - angle), Math.cos(target - angle));
    return angle + Math.max(-limit, Math.min(limit, difference));
  },
  move(snake, dt, speed) {
    snake.angle = this.turn(snake.angle, snake.target, dt * 3.8);
    snake.x += Math.cos(snake.angle) * speed * dt;
    snake.y += Math.sin(snake.angle) * speed * dt;
    snake.path.unshift({ x: snake.x, y: snake.y });
    // Simulation uses a fixed timestep: samples remain evenly spaced at each speed.
    snake.path.length = Math.min(snake.path.length, Math.ceil(snake.length / 2) + 8);
  },
  body(snake) {
    if (snake.bodyCache && snake.bodyCache.head === snake.path[0] && snake.bodyCache.length === snake.length) return snake.bodyCache.points;
    const result = []; let distance = 0, next = 0;
    for (let i = 1; i < snake.path.length; i++) {
      const a = snake.path[i - 1], b = snake.path[i], segment = Math.hypot(b.x - a.x, b.y - a.y);
      while (next <= distance + segment && next <= snake.length) {
        const t = segment ? (next - distance) / segment : 0;
        result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        next += 10;
      }
      distance += segment;
    }
    snake.bodyCache = { head: snake.path[0], length: snake.length, points: result };
    return result;
  },
  hits(head, body, radius = 19) { return body.some(p => Math.hypot(head.x - p.x, head.y - p.y) < radius); },
  eat(snake, grow) {
    snake.score += 1;
    if (grow) snake.length = Math.min(950, snake.length + 7);
  },
  number(run, value) {
    if (run.next > (run.total || 40) || value !== run.next) return false;
    run.next++; run.correct++; return true;
  },
  unlocked(correct, count = 6) { return Math.min(count, 1 + Math.floor(Math.max(0, correct) / 4)); },
  speed(boosted, manual) { return manual ? 230 : boosted ? 190 : 125; },
  medal(correct, mistakes, total = 40) {
    if (correct < total) return 'Keep going';
    return mistakes === 0 ? 'Gold' : mistakes <= 3 ? 'Silver' : 'Bronze';
  },
  trail(kind, x, y, angle, count = 7) {
    return Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1), forward = (i - (count - 1) / 2) * 72;
      const side = kind === 'curve' ? Math.sin(t * Math.PI) * 125 : kind === 'zigzag' ? Math.sin(t * Math.PI * 2) * 65 : 0;
      return { x: x + forward * Math.cos(angle) - side * Math.sin(angle), y: y + forward * Math.sin(angle) + side * Math.cos(angle) };
    });
  }
};
if (typeof module !== 'undefined') module.exports = SnakePhysics;
if (typeof document !== 'undefined') (() => {
  const $ = id => document.getElementById(id), canvas = $('arena'), ctx = canvas.getContext('2d');
  const WORLD = 2600, STEP = 1 / 60;
  const processLabels = ['1-a','1-b','1-c','1-d','1-e','2-a','2-b','2-c','2-d','2-e','2-f','2-g','3-a','3-b','3-c','3-d'];
  const processImages = processLabels.map(label => {
    const image = document.createElement('img');
    image.src = `assets/snake-game-assets/lab-process-assets/${label}.webp`;
    return image;
  });
  const processLabel = number => processLabels[number - 1] || 'Done';
  const levels = [{ start: 1, end: 5 }, { start: 6, end: 12 }, { start: 13, end: 16 }];
  let level = 0, completedLevels = 0;
  try { completedLevels = Math.min(3, Math.max(0, Math.floor(Number(localStorage.getItem('snake-lab-levels')) || 0))); } catch (_) {}
  const unlockedSkins = () => 1 + completedLevels;
  const processSize = () => 76 / zoom;
  function drawProcess(number, x, y, size, label = false) {
    const image = processImages[number - 1];
    if (image && image.complete && image.naturalWidth) {
      const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
      const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
      ctx.drawImage(image, x - w / 2, y - h / 2, w, h);
    } else {
      ctx.fillStyle = '#e5edf4'; ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
    if (label || !image || !image.complete) {
      ctx.fillStyle = '#243b50'; ctx.font = `bold ${14 / zoom}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(processLabel(number), x, y + (label ? size / 2 + 12 / zoom : 0));
      ctx.textBaseline = 'alphabetic';
    }
  }
  const skins = [
    { id: 'ruby', name: 'Ruby', color: '#c72e3f', light: '#ee5360', dark: '#591725', band: true },
    { id: 'ocean', name: 'Ocean', color: '#287fca', light: '#78d4ff', dark: '#123653', band: true },
    { id: 'emerald', name: 'Emerald', color: '#259878', light: '#81efbd', dark: '#103f38', band: false },
    { id: 'royal', name: 'Royal', color: '#8852c8', light: '#d5a1ff', dark: '#392053', band: true },
    { id: 'sunrise', name: 'Sunrise', color: '#e49d2e', light: '#ffe698', dark: '#62401e', band: false },
    { id: 'rose', name: 'Rose', color: '#cd5386', light: '#ffb5d3', dark: '#571c3a', band: true }
  ];
  let selectedSkin = skins[0];
  let totalCorrect = 0;
  try { totalCorrect = Math.max(0, Math.floor(Number(localStorage.getItem('snake-number-unlocks')) || 0)); } catch (_) {}
  let selectedType = 'textured';
  try { if (localStorage.getItem('snake-arena-type') === 'classic') selectedType = 'classic'; } catch (_) {}
  try { selectedSkin = skins.find(s => s.id === localStorage.getItem('snake-arena-skin')) || skins[0]; } catch (_) {}
  if (skins.indexOf(selectedSkin) >= unlockedSkins()) selectedSkin = skins[0];
  let sequence = { next: 1, correct: 0, total: processLabels.length }, digestion = [], expelled = [];
  let biteTime = 0, biteCorrect = true, effects = [], feedbackTime = 0;
  let biteFeedback = null;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let screenImpact = null;
  function announceBite(kind, label, detail, image = null, x = player.x, y = player.y) {
    biteFeedback = { kind, label, image, x, y, age: 0 };
    // Rapid vegetable chains keep the feedback visible without retriggering flashes.
    if (!screenImpact || screenImpact.age > .65 || screenImpact.kind !== kind) screenImpact = { kind, age: 0 };
    $('bite-feedback').hidden = false; $('bite-feedback').className = `bite-feedback ${kind}`;
    $('bite-label').textContent = label; $('bite-detail').textContent = detail;
  }
  let runTime = 0, mistakes = 0, streak = 0, longestStreak = 0, toastTime = 0, soundOn = true, audio;
  try { soundOn = localStorage.getItem('snake-sound') !== 'off'; } catch (_) {}
  function sound(kind) {
    if (!soundOn || !audio) return;
    try {
      const notes = kind === 'unlock' ? [440, 554, 659] : kind === 'wrong' ? [220, 140] : kind === 'speed' ? [330, 660, 880] : kind === 'digest' ? [660] : [420, 620];
      notes.forEach((frequency, i) => {
        const oscillator = audio.createOscillator(), gain = audio.createGain(), at = audio.currentTime + i * .09;
        oscillator.type = 'sine'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.06, at + .015); gain.gain.exponentialRampToValueAtTime(.001, at + .14);
        oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(at); oscillator.stop(at + .15);
      });
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(kind === 'unlock' ? [20, 40, 20] : 12);
    } catch (_) {}
  }
  function celebrate(text, skin) {
    $('celebration-text').textContent = text; $('celebration').hidden = false; toastTime = 3;
    const preview = $('reward-preview'); preview.hidden = !skin;
    if (skin) {
      preview.width = 240; preview.height = 90; const paint = preview.getContext('2d');
      const body = Array.from({ length: 18 }, (_, i) => ({ x: 205 - i * 10, y: 43 + Math.sin(i * .3) * 10 }));
      if (selectedType === 'classic') drawClassic(body, () => true, skin.color, paint); else drawRibbon(body, () => true, skin, paint);
      paint.drawImage(sprite(skin.color, true, selectedType === 'classic'), 177, 15, 56, 56);
    }
    sound('unlock');
  }
  function burst(x, y, correct, count = 12) {
    count = Math.min(count, Math.max(0, 96 - effects.length));
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2;
      effects.push({ x, y, vx: Math.cos(angle) * (45 + Math.random() * 45), vy: Math.sin(angle) * (45 + Math.random() * 45), age: 0, correct });
    }
  }
  let width = 0, height = 0, zoom = 1, state = 'home', player, snakes = [], food = [], score = 0, best = 0;
  let camera = { x: WORLD / 2, y: WORLD / 2 }, last = 0, accumulator = 0, hudTime = 0, boost = false;
  let pointer = null, joystickPointer = null, joystickVector = null, touchSteering = null, quality = 1, slowFrames = 0;
  let lastDraw = 0, renderInterval = 0, hudSignature = '';
  const keys = new Set(), sprites = new Map();
  let pickups = [], pickupTimer = 0, speedRemaining = 0;
  const pickupImages = [];
  for (let i = 1; i <= 5; i++) {
    const image = document.createElement('img');
    image.onload = () => {
      const tile = document.createElement('canvas'); tile.width = tile.height = 80;
      const scale = Math.min(72 / image.naturalWidth, 72 / image.naturalHeight);
      const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
      tile.getContext('2d').drawImage(image, (80 - w) / 2, (80 - h) / 2, w, h);
      pickupImages.push(tile);
    };
    image.src = `assets/snake-game-assets/spawnables/veg-${i}.webp`;
  }
  function spawnPickup() {
    if (!pickupImages.length || pickups.length > 41) return;
    for (let attempt = 0; attempt < 30; attempt++) {
      const kind = ['line', 'curve', 'zigzag'][Math.floor(Math.random() * 3)];
      const points = SnakePhysics.trail(kind, 400 + Math.random() * (WORLD - 800), 400 + Math.random() * (WORLD - 800), Math.random() * Math.PI * 2);
      if (points.some(p => Math.hypot(p.x - player.x, p.y - player.y) < 180 || food.some(f => Math.hypot(f.x - p.x, f.y - p.y) < 60) || pickups.some(f => Math.hypot(f.x - p.x, f.y - p.y) < 90))) continue;
      const image = pickupImages[Math.floor(Math.random() * pickupImages.length)];
      // Keep the complete pattern and one vegetable type per trail for readability.
      pickups.push(...points.map(p => ({ ...p, image, age: 0 }))); return;
    }
  }
  try { best = Number(localStorage.getItem('snake-arena-best')) || 0; } catch (_) {}
  $('best').textContent = best;
  function fit() {
    width = Math.max(1, canvas.clientWidth); height = Math.max(1, canvas.clientHeight);
    zoom = Math.max(.65, Math.min(1, Math.min(width, height) / 640));
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * quality;
    const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function makeSnake(name, color, x, y, angle = 0) {
    const snake = { name, color, x, y, angle, target: angle, length: 170, path: [], score: 0, decision: 0 };
    for (let i = 0; i < 100; i++) snake.path.push({ x: x - Math.cos(angle) * i * 2, y: y - Math.sin(angle) * i * 2 });
    return snake;
  }
  function numberedFood(number) {
    let x, y;
    do { x = 200 + Math.random() * (WORLD - 400); y = 200 + Math.random() * (WORLD - 400); }
    while (food.some(p => Math.hypot(p.x - x, p.y - y) < 170) || Math.hypot(player.x - x, player.y - y) < 150);
    return { x, y, number, radius: 38 };
  }
  function reset(nextLevel = 0, continueRun = false) {
    const saved = continueRun ? { score, sequence, runTime, mistakes, streak, longestStreak, length: player.length } : null;
    level = nextLevel;
    score = 0; boost = false; keys.clear(); pointer = null; releaseJoystick();
    sequence = { next: 1, correct: 0, total: processLabels.length }; digestion = []; expelled = [];
    biteTime = 0; effects = []; feedbackTime = 0;
    runTime = 0; mistakes = 0; streak = 0; longestStreak = 0; toastTime = 0; $('celebration').hidden = true; $('results').hidden = true;
    pickups = []; pickupTimer = 1; speedRemaining = 0;
    biteFeedback = null; screenImpact = null; $('bite-feedback').hidden = true;
    player = makeSnake('You', selectedSkin.color, WORLD / 2, WORLD / 2);
    player.skin = selectedSkin;
    player.bodyType = selectedType;
    snakes = [player, ...['Mint', 'Orbit', 'Blossom', 'Ripple'].map((name, index) => {
      const angle = index * Math.PI / 2, x = WORLD / 2 + Math.cos(angle) * 700, y = WORLD / 2 + Math.sin(angle) * 700;
      const bot = makeSnake(name, ['#63e1c6', '#9f9aff', '#ff89b1', '#70cbff'][index], x, y, angle + Math.PI / 2);
      bot.patrol = { x: x - Math.cos(angle) * 180, y: y - Math.sin(angle) * 180 }; return bot;
    })];
    if (saved) {
      score = saved.score; sequence = saved.sequence; runTime = saved.runTime; mistakes = saved.mistakes;
      streak = saved.streak; longestStreak = saved.longestStreak; player.length = saved.length; player.score = score;
      player.path = Array.from({length: Math.ceil(player.length / 2) + 8}, (_, i) => ({x: player.x - Math.cos(player.angle) * i * 2, y: player.y - Math.sin(player.angle) * i * 2}));
    }
    food = [];
    for (let number = levels[level].start; number <= levels[level].end; number++) food.push(numberedFood(number));
    for (let i = 0; i < 3; i++) spawnPickup();
    camera = { x: player.x, y: player.y }; updateHud();
  }
  function updateHud() {
    const signature = `${level}:${score}:${best}:${sequence.next}:${totalCorrect}:${streak}:${feedbackTime > 0}:${Math.ceil(speedRemaining)}`;
    if (signature === hudSignature) return;
    hudSignature = signature;
    $('score').textContent = score; $('best').textContent = Math.max(best, score);

    $('unlock-progress').textContent = `Level ${level + 1} / 3 · Complete this series to unlock a snake`;
    if (feedbackTime <= 0) $('hint').textContent = sequence.next <= processLabels.length ? `Eat ${processLabel(sequence.next)} next · ${score} / ${processLabels.length} correct${speedRemaining > 0 ? ` · SPEED ${Math.ceil(speedRemaining)}s` : ''}` : 'Finishing digestion…';
    $('leaders').replaceChildren(...[{ name: 'Next step', score: sequence.next <= processLabels.length ? processLabel(sequence.next) : 'Done' }, { name: 'Skins unlocked', score: `${unlockedSkins()} / ${skins.length}` }].map(s => {
      const li = document.createElement('li'); li.className = s === player ? 'you' : '';
      li.append(document.createTextNode(s.name)); const value = document.createElement('b'); value.textContent = s.score; li.append(value); return li;
    }));
  }
  function showOverlay(title, message, label) {
    $('title').textContent = title; $('message').textContent = message; $('start').textContent = label;
    $('overlay').hidden = false; $('pause').disabled = true; $('start').focus();
    $('snake-picker').hidden = state === 'paused';
  }
  function end() {
    state = 'over'; boost = false;
    if (score > best) { best = score; try { localStorage.setItem('snake-arena-best', best); } catch (_) {} }
    updateHud(); $('announcement').textContent = `Run finished. Score ${score}.`;
    showOverlay('Nice run!', `You collected ${score} points. Best: ${best}. Avoid the glowing arena boundary.`, 'Play again →');
    $('results').hidden = false;
    $('results').textContent = `${SnakePhysics.medal(score, mistakes, processLabels.length)} · ${Math.floor(runTime / 60)}:${String(Math.floor(runTime % 60)).padStart(2, '0')} · ${mistakes} mistakes · Best streak ${longestStreak}`;
    renderPicker();
  }
  function pause() {
    if (state !== 'playing') return;
    state = 'paused'; boost = false; $('boost').classList.remove('active'); keys.clear(); pointer = null; releaseJoystick();
    showOverlay('Take a breath', 'Your snake is waiting. Resume whenever you’re ready.', 'Resume →');
  }
  function steer(dt) {
    const x = Number(keys.has('arrowright') || keys.has('d')) - Number(keys.has('arrowleft') || keys.has('a'));
    const y = Number(keys.has('arrowdown') || keys.has('s')) - Number(keys.has('arrowup') || keys.has('w'));
    if (x || y) player.target = Math.atan2(y, x);
    else if (joystickVector) player.target = Math.atan2(joystickVector.y, joystickVector.x);
    else if (pointer) {
      const px = (player.x - camera.x) * zoom + width / 2, py = (player.y - camera.y) * zoom + height / 2;
      if (Math.hypot(pointer.x - px, pointer.y - py) > 14) player.target = Math.atan2(pointer.y - py, pointer.x - px);
    }
    SnakePhysics.move(player, dt, SnakePhysics.speed(speedRemaining > 0, boost || keys.has(' ')));
  }
  function simulate(dt) {
    for (let i = 1; i < snakes.length; i++) {
      const bot = snakes[i]; bot.decision -= dt;
      if (bot.decision <= 0) {
        bot.decision = .35;
        const radial = Math.atan2(bot.y - bot.patrol.y, bot.x - bot.patrol.x);
        const targetX = bot.patrol.x + Math.cos(radial + .45) * 180, targetY = bot.patrol.y + Math.sin(radial + .45) * 180;
        bot.target = Math.atan2(targetY - bot.y, targetX - bot.x);
      }
      SnakePhysics.move(bot, dt, 95);
    }
    runTime += dt; toastTime = Math.max(0, toastTime - dt); if (toastTime === 0) $('celebration').hidden = true;
    biteTime = Math.max(0, biteTime - dt); feedbackTime = Math.max(0, feedbackTime - dt);
    if (biteFeedback) { biteFeedback.age += dt; if (biteFeedback.age > 1.7) { biteFeedback = null; $('bite-feedback').hidden = true; } }
    if (screenImpact) { screenImpact.age += dt; if (screenImpact.age > .8) screenImpact = null; }
    speedRemaining = Math.max(0, speedRemaining - dt);
    pickupTimer -= dt;
    if (pickupTimer <= 0) { const count = pickups.length === 0 ? 3 : 1; for (let i = 0; i < count; i++) spawnPickup(); pickupTimer = 6 + Math.random() * 3; }
    for (let i = pickups.length - 1; i >= 0; i--) {
      const pickup = pickups[i]; pickup.age += dt;
      if (pickup.age > 60) { pickups.splice(i, 1); continue; }
      if (Math.hypot(player.x - pickup.x, player.y - pickup.y) < 33) {
        pickups.splice(i, 1); speedRemaining = 5; biteTime = .48; biteCorrect = true;
        burst(player.x, player.y, true, 24); feedbackTime = 1.5;
        sound('speed');
        announceBite('speed', 'SPEED SURGE!', '5 seconds of extra speed', pickup.image, pickup.x, pickup.y);
        $('hint').textContent = 'Speed snack! Faster for 5 seconds';
        $('announcement').textContent = 'Speed boost for five seconds. Lab step order unchanged.';
      }
    }
    for (let i = effects.length - 1; i >= 0; i--) {
      const p = effects[i]; p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.age > .65) effects.splice(i, 1);
    }
    steer(dt);
    for (let i = food.length - 1; i >= 0; i--) {
      const p = food[i];
      if (Math.hypot(player.x - p.x, player.y - p.y) < processSize() * .4 + 12) {
        const correct = SnakePhysics.number(sequence, p.number);
        digestion.push({ number: p.number, correct, distance: 0, age: 0, originX: p.x, originY: p.y }); food.splice(i, 1);
        biteTime = .48; biteCorrect = correct; feedbackTime = 1.5;
        $('hint').textContent = correct ? `${processLabel(p.number)} — delicious! Watch it digest →` : `${processLabel(p.number)} — wrong order! Passing through…`;
        burst(player.x, player.y, correct, correct ? 26 : 20);
        announceBite(correct ? 'correct' : 'wrong', correct ? `${processLabel(p.number)} · PERFECT BITE!` : `${processLabel(p.number)} · WRONG STEP!`, correct ? 'Digesting → growth at the tail' : `No growth · You need ${processLabel(sequence.next)}`);
        sound(correct ? 'bite' : 'wrong');
        if (correct) {
          streak++; longestStreak = Math.max(longestStreak, streak);
          score = sequence.correct; player.score = score;
          totalCorrect++;
          $('announcement').textContent = 'Correct lab step!';
          if (score % 10 === 0) {
            const milestone = score === processLabels.length ? 'All lab steps complete!' : `${score} complete! Next chapter`;
            if (toastTime > 0) $('celebration-text').textContent += ` ${milestone}`;
            else celebrate(milestone);
            burst(player.x, player.y, true, 24);
          }
          else if (streak % 4 === 0 && toastTime <= 0) celebrate('Perfect streak! Four in a row.');
        } else { mistakes++; streak = 0; $('announcement').textContent = `Wrong step ${processLabel(p.number)}. Eat ${processLabel(sequence.next)} next. No growth.`; }
      }
    }
    const body = SnakePhysics.body(player), tail = body[body.length - 1];
    for (let i = digestion.length - 1; i >= 0; i--) {
      const item = digestion[i]; item.age += dt;
      if (item.age > .35) item.distance += dt * Math.max(95, player.length / 3);
      if (item.distance >= (body.length - 1) * 10) {
        digestion.splice(i, 1);
        if (item.correct) { player.length = Math.min(950, player.length + 18); burst(tail.x, tail.y, true, 18); sound('digest'); }
        else {
          const previous = body[body.length - 2] || player;
          const angle = Math.atan2(tail.y - previous.y, tail.x - previous.x);
          expelled.push({ number: item.number, x: tail.x, y: tail.y, originX: tail.x, originY: tail.y, vx: Math.cos(angle) * 170, vy: Math.sin(angle) * 170, time: 0 });
          burst(tail.x, tail.y, false, 8);
        }
      }
    }
    for (let i = expelled.length - 1; i >= 0; i--) {
      const item = expelled[i]; const travel = Math.min(dt, Math.max(0, .45 - item.time));
      item.time += dt; item.x += item.vx * travel; item.y += item.vy * travel;
      if (item.time > 1.8) { food.push(numberedFood(item.number)); expelled.splice(i, 1); }
    }
    if (sequence.next > levels[level].end && !digestion.length && !expelled.length) {
      completedLevels = Math.max(completedLevels, level + 1);
      try { localStorage.setItem('snake-lab-levels', completedLevels); } catch (_) {}
      const reward = skins[level + 1];
      selectedSkin = reward;
      try { localStorage.setItem('snake-arena-skin', reward.id); } catch (_) {}
      boost = false; keys.clear(); pointer = null; releaseJoystick();
      $('boost').classList.remove('active'); $('bite-feedback').hidden = true;
      $('celebration').hidden = true;
      if (level === levels.length - 1) {
        end();
        showOverlay('All 3 levels complete!', `${reward.name} snake unlocked! Every lab process completed.`, 'Play again →');
      } else {
        state = 'levelup';
        showOverlay(`Level ${level + 1} complete!`, `${reward.name} snake unlocked! Next: Level ${level + 2}, series ${level + 2}. Choose your snake below.`, `Next level →`);
        renderPicker();
      }
      sound('unlock'); updateHud(); return;
    }
    const outside = s => s.x < 15 || s.y < 15 || s.x > WORLD - 15 || s.y > WORLD - 15;
    if (outside(player)) { end(); return; }
    for (let i = 1; i < snakes.length; i++) {
      const bot = snakes[i];
      // Reject distant snakes before testing individual body samples.
      if (Math.hypot(bot.x - player.x, bot.y - player.y) <= bot.length + 25 && SnakePhysics.hits(player, SnakePhysics.body(bot))) {
        end(); $('message').textContent = 'You touched another snake. Keep clear of their bodies and try again.'; return;
      }
    }
    const follow = 1 - Math.exp(-7 * dt);
    camera.x += (player.x - camera.x) * follow; camera.y += (player.y - camera.y) * follow;
  }
  function classicColor(color) {
    const colors = { '#c72e3f': '#f23c61', '#287fca': '#249fff', '#259878': '#20dba1', '#8852c8': '#a36aff', '#e49d2e': '#ffc342', '#cd5386': '#ff66b0' };
    return colors[color] || color;
  }
  function tint(color, target, amount) {
    const rgb = [1, 3, 5].map(offset => Math.round(parseInt(color.slice(offset, offset + 2), 16) * (1 - amount) + target * amount));
    return `rgb(${rgb.join(',')})`;
  }
  function sprite(color, head = false, glossy = false) {
    const key = `${color}:${head}:${glossy}`;
    if (sprites.has(key)) return sprites.get(key);
    const surface = document.createElement('canvas'); surface.width = surface.height = 96; const c = surface.getContext('2d');
    // Painted once, then reused: rich material detail without per-frame lighting.
    const g = c.createRadialGradient(37, 30, 3, 48, 48, 37);
    if (glossy) {
      color = classicColor(color);
      g.addColorStop(0, tint(color, 255, .78));
      g.addColorStop(.18, tint(color, 255, .32));
      g.addColorStop(.42, color);
      g.addColorStop(.7, tint(color, 0, .16));
      g.addColorStop(.9, tint(color, 0, .4));
      g.addColorStop(1, tint(color, 0, .58));
    } else {
      color = classicColor(color);
      g.addColorStop(0, tint(color, 255, .55)); g.addColorStop(.24, tint(color, 255, .15)); g.addColorStop(.62, color); g.addColorStop(.88, tint(color, 0, .35)); g.addColorStop(1, tint(color, 0, .55));
    }
    c.fillStyle = g; c.beginPath();
    if (head) {
      c.moveTo(14, 48); c.bezierCurveTo(14, 34, 24, 33, 31, 22);
      c.bezierCurveTo(42, 8, 65, 12, 74, 25);
      c.bezierCurveTo(81, 33, 91, 35, 91, 48);
      c.bezierCurveTo(91, 61, 81, 63, 74, 71);
      c.bezierCurveTo(65, 84, 42, 88, 31, 74);
      c.bezierCurveTo(24, 63, 14, 62, 14, 48);
    } else c.arc(48, 48, 31, 0, Math.PI * 2);
    c.fill(); c.save(); c.clip();
    // Body material stays smooth and cheap; only the head carries scale detail.
    c.lineWidth = 1.2; c.strokeStyle = glossy ? '#ffffff18' : '#17393630';
    for (let row = 0; head && row < 6; row++) for (let col = 0; col < 6; col++) {
      const x = 17 + col * 12 + (row % 2) * 6, y = 17 + row * 12;
      c.beginPath(); c.arc(x, y, 7, .15, Math.PI - .15); c.stroke();
    }
    c.fillStyle = glossy ? '#ffffff55' : '#fff9db45'; c.beginPath(); c.ellipse(39, 28, 17, 6, -.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffffff70'; c.beginPath(); c.ellipse(31, 26, 6, 2, -.4, 0, Math.PI * 2); c.fill();
    c.restore();
    if (head) {
      // A softly shaded muzzle joins the neck, with eyes seated in raised brows.
      const muzzle = c.createRadialGradient(76, 40, 1, 77, 48, 19);
      muzzle.addColorStop(0, tint(color, 255, .48)); muzzle.addColorStop(1, tint(color, 0, .18));
      c.fillStyle = muzzle; c.beginPath(); c.ellipse(76, 48, 15, 15, 0, 0, Math.PI * 2); c.fill();
      for (const y of [28, 68]) {
        c.fillStyle = '#00172755'; c.beginPath(); c.ellipse(57, y + 3, 13, 12, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = tint(color, 0, .25); c.beginPath(); c.ellipse(56, y, 13, 12, 0, 0, Math.PI * 2); c.fill();
        const eye = c.createRadialGradient(55, y - 4, 1, 58, y, 12);
        eye.addColorStop(0, '#ffffff'); eye.addColorStop(.65, '#f1f8ef'); eye.addColorStop(1, '#a5c7c8');
        c.fillStyle = eye; c.beginPath(); c.ellipse(58, y, 10, 10, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = glossy ? '#2b7188' : '#bd8d35'; c.beginPath(); c.arc(62, y, 6, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#081e2d'; c.beginPath(); c.ellipse(63, y, glossy ? 3.7 : 2.3, 5, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(61, y - 3, 2.2, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff85'; c.beginPath(); c.arc(65, y + 2, .9, 0, Math.PI * 2); c.fill();
        c.strokeStyle = tint(color, 255, .36); c.lineWidth = 2; c.beginPath(); c.arc(56, y, 12, Math.PI * 1.1, Math.PI * 1.8); c.stroke();
      }
      c.fillStyle = tint(color, 0, .65);
      for (const y of [42, 54]) { c.beginPath(); c.ellipse(82, y, 2.3, 1.7, -.25, 0, Math.PI * 2); c.fill(); }
      c.strokeStyle = tint(color, 0, .55); c.lineWidth = 1.5; c.beginPath(); c.moveTo(72, 58); c.quadraticCurveTo(84, 65, 88, 53); c.stroke();
      c.fillStyle = '#ffffff65'; c.beginPath(); c.ellipse(75, 36, 6, 2, -.2, 0, Math.PI * 2); c.fill();
    }
    sprites.set(key, surface); return surface;
  }
  function ribbonTile(band, skin) {
    const key = band ? 'cream-band' : `scales:${skin.id}`;
    if (sprites.has(key)) return sprites.get(key);
    const tile = document.createElement('canvas'); tile.width = 64; tile.height = 128;
    const c = tile.getContext('2d');
    // Across-body shading creates a cylinder; along-body tiles overlap at joints.
    const material = c.createLinearGradient(0, 0, 0, 128);
    const rich = classicColor(skin.color);
    const stops = band
      ? [[0,'#9c896b'],[.12,'#e6d6b4'],[.32,'#fff8e1'],[.5,'#f4e6c6'],[.76,'#dac6a0'],[1,'#8b7657']]
      : [[0,tint(rich,0,.52)],[.12,tint(rich,0,.15)],[.32,tint(rich,255,.36)],[.5,rich],[.76,tint(rich,0,.12)],[1,tint(rich,0,.48)]];
    for (const [offset, color] of stops) material.addColorStop(offset, color);
    c.fillStyle = material; c.fillRect(0, 0, 64, 128);
    if (band) {
      // Folded, irregular cream scales instead of a flat painted stripe.
      for (let row = 0; row < 9; row++) {
        const y = row * 16, shift = row % 2 ? 9 : -4;
        c.fillStyle = '#fff6db90'; c.beginPath(); c.moveTo(14 + shift, y);
        c.lineTo(43 + shift, y + 4); c.lineTo(52 + shift, y + 13);
        c.lineTo(22 + shift, y + 10); c.closePath(); c.fill();
        c.strokeStyle = '#76634d55'; c.lineWidth = 2; c.beginPath();
        c.moveTo(14 + shift, y + 2); c.lineTo(22 + shift, y + 10); c.lineTo(52 + shift, y + 13); c.stroke();
      }
    } else {
      for (let row = 0; row < 7; row++) for (let col = -1; col < 4; col++) {
        const x = col * 24 + (row % 2) * 12, y = row * 20;
        c.strokeStyle = '#05192945'; c.lineWidth = 1.5; c.beginPath();
        c.moveTo(x - 7, y); c.quadraticCurveTo(x, y + 11, x + 7, y); c.stroke();
        c.strokeStyle = '#ffffff55'; c.beginPath(); c.moveTo(x - 4, y + 1); c.lineTo(x, y + 4); c.stroke();
      }
    }
    sprites.set(key, tile); return tile;
  }
  function bellyScale(distance, meals) {
    return 1 + Math.min(.55, meals.reduce((sum, item) => sum + .42 * Math.exp(-Math.pow((distance - item.distance) / 28, 2)) * Math.min(1, item.age / .35), 0));
  }
  function digestionGlow(correct) {
    const key = `digestion-glow:${correct}`;
    if (sprites.has(key)) return sprites.get(key);
    const tile = document.createElement('canvas'); tile.width = tile.height = 48;
    const paint = tile.getContext('2d'), glow = paint.createRadialGradient(24, 24, 1, 24, 24, 21);
    glow.addColorStop(0, correct ? '#fff2b988' : '#ffc2d088'); glow.addColorStop(1, '#ffffff00');
    paint.fillStyle = glow; paint.fillRect(0, 0, 48, 48); sprites.set(key, tile); return tile;
  }
  function drawRibbon(body, visible, skin, paint = ctx, meals = []) {
    // A continuous rounded silhouette hides seams between the lightweight tiles.
    if (body.length > 8) {
      paint.save(); paint.lineCap = 'round'; paint.lineJoin = 'round';
      paint.beginPath(); paint.moveTo(body[0].x, body[0].y);
      for (let i = 1; i < body.length - 7; i++) paint.lineTo(body[i].x, body[i].y);
      paint.strokeStyle = tint(classicColor(skin.color), 0, .42); paint.lineWidth = 32; paint.stroke();
      paint.strokeStyle = classicColor(skin.color); paint.lineWidth = 28; paint.stroke(); paint.restore();
    }
    for (let i = body.length - 1; i > 0;) {
      // Two samples per tile on the main body; finer geometry only at the tail.
      const frontIndex = Math.max(0, i - (i < body.length - 8 && i % 2 === 0 ? 2 : 1));
      const back = body[i], front = body[frontIndex], backIndex = i;
      i = frontIndex;
      if (!visible(back.x, back.y) && !visible(front.x, front.y)) continue;
      const dx = front.x - back.x, dy = front.y - back.y, distance = Math.hypot(dx, dy);
      if (distance < .001) continue;
      // Continuous widths at both ends avoid the staircase of constant-width tiles.
      const tailWidth = index => {
        const t = Math.min(1, (body.length - 1 - index) / 8);
        return (1 + 31 * Math.sin(t * Math.PI / 2)) * bellyScale(index * 10, meals);
      };
      const backWidth = tailWidth(backIndex), frontWidth = tailWidth(frontIndex);
      const diameter = Math.max(backWidth, frontWidth);
      paint.save(); paint.translate((back.x + front.x) / 2, (back.y + front.y) / 2); paint.rotate(Math.atan2(dy, dx));
      if (Math.abs(backWidth - frontWidth) > .1) {
      paint.beginPath(); paint.moveTo(-distance / 2 - 1, -backWidth / 2);
      paint.lineTo(distance / 2 + 1, -frontWidth / 2); paint.lineTo(distance / 2 + 1, frontWidth / 2);
      paint.lineTo(-distance / 2 - 1, backWidth / 2); paint.closePath(); paint.clip();
      }
      const band = skin.band && Math.floor(backIndex / 10) !== Math.floor(frontIndex / 10) && backWidth > 22;
      paint.drawImage(ribbonTile(band, skin), -distance / 2 - 3, -diameter / 2, distance + 6, diameter);
      paint.restore();
    }
  }
  function drawClassic(body, visible, color, paint = ctx, meals = []) {
    const image = sprite(color, false, true);
    for (let i = body.length - 1; i >= 0; i--) {
      const p = body[i]; if (!visible(p.x, p.y)) continue;
      const size = 50 * Math.min(1, .22 + (body.length - i) / 8) * bellyScale(i * 10, meals);
      paint.drawImage(image, p.x - size / 2, p.y - size / 2, size, size);
    }
  }
  function slitheringBody(snake) {
    const body = SnakePhysics.body(snake);
    // A visible travelling S-wave moves down the body without changing its physics path.
    return body.map((point, index) => {
      if (index === 0) return point;
      const front = body[index - 1], back = body[Math.min(index + 1, body.length - 1)];
      const dx = front.x - back.x, dy = front.y - back.y;
      const length = Math.hypot(dx, dy) || 1;
      const envelope = Math.min(1, index / 4);
      const offset = Math.sin(index * .48 - runTime * 7) * 14 * envelope;
      return { x: point.x - dy / length * offset, y: point.y + dx / length * offset };
    });
  }
  function draw() {
    ctx.fillStyle = '#fbfcfd'; ctx.fillRect(0, 0, width, height);
    const impact = screenImpact ? Math.max(0, 1 - screenImpact.age / .5) : 0;
    const amplitude = screenImpact && screenImpact.kind === 'wrong' ? 13 : 7;
    const shakeX = !reducedMotion.matches && screenImpact ? Math.sin(screenImpact.age * 65) * amplitude * impact : 0;
    const shakeY = !reducedMotion.matches && screenImpact ? Math.cos(screenImpact.age * 53) * amplitude * impact * .6 : 0;
    const punch = !reducedMotion.matches ? 1 + impact * .035 : 1;
    ctx.save(); ctx.translate(width / 2 + shakeX, height / 2 + shakeY); ctx.scale(zoom * punch, zoom * punch); ctx.translate(-camera.x, -camera.y);
    const left = camera.x - width / zoom / 2, top = camera.y - height / zoom / 2;
    const visible = (x, y, margin = 140) => x > left - margin && x < left + width / zoom + margin && y > top - margin && y < top + height / zoom + margin;
    ctx.strokeStyle = '#dfe6eb'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = Math.floor(left / 128) * 128; x < left + width / zoom; x += 128) { ctx.moveTo(x, top); ctx.lineTo(x, top + height / zoom); }
    for (let y = Math.floor(top / 128) * 128; y < top + height / zoom; y += 128) { ctx.moveTo(left, y); ctx.lineTo(left + width / zoom, y); } ctx.stroke();
    ctx.fillStyle = '#cbd5df'; ctx.fillRect(-WORLD, -WORLD, WORLD * 3, WORLD); ctx.fillRect(-WORLD, WORLD, WORLD * 3, WORLD); ctx.fillRect(-WORLD, 0, WORLD, WORLD); ctx.fillRect(WORLD, 0, WORLD, WORLD);
    // Layer a soft warning halo behind the red neon collision boundary.
    ctx.save();
    ctx.strokeStyle = '#ff26261a'; ctx.lineWidth = 32; ctx.strokeRect(0, 0, WORLD, WORLD);
    ctx.strokeStyle = '#ff262638'; ctx.lineWidth = 18; ctx.strokeRect(0, 0, WORLD, WORLD);
    ctx.shadowColor = '#ff2020'; ctx.shadowBlur = 18;
    ctx.strokeStyle = '#ff2929'; ctx.lineWidth = 6; ctx.strokeRect(0, 0, WORLD, WORLD);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffe0d8'; ctx.lineWidth = 2; ctx.strokeRect(0, 0, WORLD, WORLD);
    ctx.restore();
    for (const p of food) {
      if (!visible(p.x, p.y)) continue;
      drawProcess(p.number, p.x, p.y, processSize());
    }
    for (const pickup of pickups) {
      if (!visible(pickup.x, pickup.y)) continue;
      ctx.fillStyle = '#52677d25'; ctx.beginPath(); ctx.ellipse(pickup.x + 2, pickup.y + 14, 19, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.drawImage(pickup.image, pickup.x - 25, pickup.y - 25, 50, 50);
      ctx.fillStyle = '#fff1a9'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.fillText('⚡', pickup.x, pickup.y - 27);
    }
    for (const snake of snakes) {
      const body = slitheringBody(snake);
      // Render shadows as one layer beneath the entire body, so joints stay clean.
      ctx.strokeStyle = '#00192355'; ctx.lineWidth = 28; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
      if (snake === player && snake.bodyType === 'textured') {
        for (let i = body.length - 1; i > 0; i--) {
          const t = Math.min(1, (body.length - i) / 8);
          ctx.lineWidth = 1 + 27 * Math.sin(t * Math.PI / 2);
          ctx.beginPath(); ctx.moveTo(body[i].x + 4, body[i].y + 7);
          ctx.lineTo(body[i - 1].x + 4, body[i - 1].y + 7); ctx.stroke();
        }
      } else {
        body.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x + 4, p.y + 7); else ctx.lineTo(p.x + 4, p.y + 7); }); ctx.stroke();
      }
      if (snake === player && snake.bodyType === 'textured') drawRibbon(body, visible, snake.skin, ctx, digestion);
      else drawClassic(body, visible, snake.color, ctx, snake === player ? digestion : []);
      if (!visible(snake.x, snake.y)) continue;
      ctx.save(); ctx.translate(snake.x, snake.y); ctx.rotate(snake.angle);
      const chew = snake === player && biteTime > 0 ? Math.sin((.48 - biteTime) / .48 * Math.PI) : 0;
      ctx.scale(1 + chew * .12, 1 - chew * .08);
      ctx.drawImage(sprite(snake.color, true, snake !== player || snake.bodyType === 'classic'), -28, -28, 56, 56);
      if (chew > 0) {
        ctx.fillStyle = '#251a2d'; ctx.beginPath(); ctx.ellipse(22, 0, 4 + chew * 3, 1 + chew * 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = biteCorrect ? '#ffe6a4' : '#ff9ba8'; ctx.beginPath(); ctx.ellipse(23, 2, 3, chew * 2, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore(); ctx.fillStyle = snake === player ? '#72501b' : '#354b60'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.fillText(snake.name, snake.x, snake.y - 34);
    }
    if (biteFeedback) {
      const event = biteFeedback, progress = Math.min(1, event.age / .75);
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = event.kind === 'wrong' ? '#ff3333' : event.kind === 'speed' ? '#00f0ff' : '#a8ff00';
      ctx.lineWidth = 5 * (1 - progress) + 1; ctx.beginPath(); ctx.arc(player.x, player.y, 22 + progress * 65, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
      if (event.image && event.age < .4) {
        const t = event.age / .4, size = 52 * (1 - t * .85);
        const x = event.x + (player.x - event.x) * t, y = event.y + (player.y - event.y) * t;
        ctx.drawImage(event.image, x - size / 2, y - size / 2, size, size);
      }
    }
    const playerBody = slitheringBody(player);
    for (const item of digestion) {
      const index = Math.min(playerBody.length - 1, Math.floor(item.distance / 10));
      const a = playerBody[index], b = playerBody[Math.min(index + 1, playerBody.length - 1)];
      const t = (item.distance % 10) / 10;
      const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      if (item.age < .35) {
        const swallow = Math.min(1, item.age / .35);
        ctx.globalAlpha = 1 - swallow * .6; ctx.save();
        ctx.translate(item.originX + (player.x - item.originX) * swallow, item.originY + (player.y - item.originY) * swallow);
        ctx.scale(1 - swallow * .65, 1 - swallow * .65); drawNumber(item.number, 0, 0, item.correct); ctx.restore(); ctx.globalAlpha = 1;
      } else {
        // Soft light follows the body's actual curve; no separate badge or ring.
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const remaining = (playerBody.length - 1) * 10 - item.distance;
        const fade = item.correct ? Math.min(1, Math.max(0, remaining / 28)) : 1;
        for (let offset = 5; offset >= 1; offset--) {
          const behind = playerBody[Math.max(0, index - offset)];
          const ahead = playerBody[Math.max(0, index - offset + 1)];
          ctx.globalAlpha = (1 - offset / 6) * .3 * fade;
          ctx.strokeStyle = item.correct ? '#fff1ac' : '#ff9ba8'; ctx.lineWidth = 8; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(behind.x, behind.y); ctx.lineTo(ahead.x, ahead.y); ctx.stroke();
        }
        ctx.globalAlpha = fade;
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
        ctx.drawImage(digestionGlow(item.correct), -32, -19, 64, 38);
        ctx.fillStyle = item.correct ? '#fff5cb75' : '#ffb5bf75';
        ctx.beginPath(); ctx.ellipse(-2, -10, 13, 3, -.12, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = item.correct ? '#fff9da' : '#ffd3da'; ctx.font = '800 15px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#162d3ac9'; ctx.lineWidth = 3; drawProcess(item.number, x, y, 28 / zoom); ctx.textBaseline = 'alphabetic';
        ctx.globalAlpha = 1;
      }
    }
    for (const item of expelled) drawSlime(item);
    ctx.globalAlpha = 1;
    for (const p of effects) {
      ctx.globalAlpha = Math.max(0, 1 - p.age / .65); ctx.fillStyle = p.correct ? '#baff25' : '#ff3333';
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.5 * (1 - p.age / .65), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const target = food.find(p => p.number === sequence.next);
    ctx.restore();
    if (screenImpact) {
      const fade = Math.max(0, 1 - screenImpact.age / .8);
      const color = screenImpact.kind === 'wrong' ? '#ff3333' : screenImpact.kind === 'speed' ? '#00f0ff' : '#a8ff00';
      ctx.globalAlpha = fade * .15; ctx.strokeStyle = color; ctx.lineWidth = 26; ctx.strokeRect(13, 13, width - 26, height - 26);
      ctx.globalAlpha = fade * .9; ctx.strokeStyle = color; ctx.lineWidth = 12; ctx.strokeRect(6, 6, width - 12, height - 12);
      ctx.globalAlpha = 1;
    }
    // Tiny arena map also indicates the boundary before it enters the camera.
    const size = width < 600 ? 65 : 86, x = width - size - 20, y = height - size - (matchMedia('(pointer:coarse)').matches ? 145 : 24);
    ctx.fillStyle = '#05232d99'; ctx.fillRect(x, y, size, size); ctx.strokeStyle = '#a8e7dd55'; ctx.lineWidth = 1; ctx.strokeRect(x, y, size, size);
    for (const s of snakes) { ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(x + s.x / WORLD * size, y + s.y / WORLD * size, s === player ? 3 : 2, 0, Math.PI * 2); ctx.fill(); }
    if (target) { ctx.fillStyle = '#ffe18a'; ctx.beginPath(); ctx.arc(x + target.x / WORLD * size, y + target.y / WORLD * size, 3, 0, Math.PI * 2); ctx.fill(); }
  }
  function drawSlime(item) {
    const fade = Math.min(1, (1.8 - item.time) / .55), landed = item.time >= .45;
    ctx.globalAlpha = Math.max(0, fade);
    // Sticky droplets stretch behind the ejected food, then settle into a splat.
    for (let i = 1; i <= 5; i++) {
      const t = i / 7, x = item.x + (item.originX - item.x) * t, y = item.y + (item.originY - item.y) * t;
      ctx.fillStyle = i % 2 ? '#baff22' : '#729d20'; ctx.beginPath(); ctx.ellipse(x, y + Math.sin(i * 2) * 9, 6 - i * .5, 3.5, Math.atan2(item.vy, item.vx), 0, Math.PI * 2); ctx.fill();
    }
    ctx.save(); ctx.translate(item.x, item.y);
    ctx.fillStyle = '#183913'; ctx.beginPath(); ctx.ellipse(3, 6, landed ? 31 : 22, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#83b928'; ctx.strokeStyle = '#d9ff55'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const angle = i / 16 * Math.PI * 2, radius = (i % 2 ? 17 : landed ? 29 : 23);
      const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius * .75;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#d9ff6f'; ctx.beginPath(); ctx.arc(-12 + i * 12, -6 + (i % 2) * 13, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.font = '900 17px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeStyle = '#153016'; ctx.lineWidth = 3;
    drawProcess(item.number, item.x, item.y, 40 / zoom); ctx.textBaseline = 'alphabetic';
    ctx.font = '900 13px system-ui'; ctx.fillStyle = '#d9ff55'; ctx.fillText('BLEURGH!', item.x, item.y - 30);
    ctx.globalAlpha = 1;
  }
  function drawNumber(number, x, y, correct) {
    drawProcess(number, x, y, 32 / zoom);
  }
  function frame(time) {
    const delta = Math.min(.1, (time - (last || time)) / 1000); last = time;
    if (state === 'playing') {
      if (delta > .028) slowFrames++; else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 120 && quality > .65) { quality = .65; renderInterval = 1000 / 30; fit(); slowFrames = 0; }
      accumulator += delta;
      while (accumulator >= STEP && state === 'playing') { simulate(STEP); accumulator -= STEP; }
      hudTime += delta; if (hudTime > .2) { updateHud(); hudTime = 0; }
    } else accumulator = 0;
    if (!document.hidden && (time - lastDraw >= (state === 'playing' ? renderInterval : 1000 / 15))) { draw(); lastDraw = time; }
    requestAnimationFrame(frame);
  }
  function releaseJoystick() { joystickPointer = null; joystickVector = null; touchSteering = null; $('stick').style.transform = ''; }
  function joystickMove(e) {
    const r = $('joystick').getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
    const distance = Math.hypot(x, y), scale = Math.min(1, 32 / (distance || 1));
    joystickVector = distance > 7 ? { x, y } : null; pointer = null;
    $('stick').style.transform = `translate(${x * scale}px,${y * scale}px)`;
  }
  $('joystick').addEventListener('pointerdown', e => { if (state !== 'playing' || joystickPointer !== null || touchSteering) return; joystickPointer = e.pointerId; $('joystick').setPointerCapture(e.pointerId); joystickMove(e); });
  $('joystick').addEventListener('pointermove', e => { if (e.pointerId === joystickPointer) joystickMove(e); });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('joystick').addEventListener(type, e => { if (e.pointerId === joystickPointer) releaseJoystick(); });
  canvas.addEventListener('pointerdown', e => {
    if (state !== 'playing' || e.pointerType === 'mouse' || touchSteering || joystickPointer !== null) return;
    touchSteering = { id: e.pointerId, x: e.clientX, y: e.clientY };
    pointer = null; joystickVector = null;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (state !== 'playing') return;
    if (touchSteering && e.pointerId === touchSteering.id) {
      const x = e.clientX - touchSteering.x, y = e.clientY - touchSteering.y;
      const distance = Math.hypot(x, y), scale = Math.min(1, 32 / (distance || 1));
      if (distance > 6) {
        joystickVector = { x, y };
        // Follow long drags so changing direction needs only a small thumb movement.
        touchSteering.x = e.clientX - x * scale;
        touchSteering.y = e.clientY - y * scale;
      }
      $('stick').style.transform = `translate(${x * scale}px,${y * scale}px)`;
    } else if (e.pointerType === 'mouse') {
      const r = canvas.getBoundingClientRect(); pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    }
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, e => {
    if (touchSteering && e.pointerId === touchSteering.id) releaseJoystick();
  });
  canvas.addEventListener('pointerleave', () => { pointer = null; });
  $('boost').addEventListener('pointerdown', e => { if (state !== 'playing') return; boost = true; $('boost').classList.add('active'); $('boost').setPointerCapture(e.pointerId); });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('boost').addEventListener(type, () => { boost = false; $('boost').classList.remove('active'); });
  window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    if (key === 'escape' || key === 'p') { if (!e.repeat) pause(); return; }
    if (state === 'playing' && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) { e.preventDefault(); keys.add(key); pointer = null; }
  });
  window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
  $('start').addEventListener('click', () => {
    if (soundOn) try { const Audio = window.AudioContext || window.webkitAudioContext; if (Audio) { audio = audio || new Audio(); audio.resume(); } } catch (_) {}
    if (state === 'levelup') reset(level + 1, true);
    else if (state !== 'paused') reset();
    state = 'playing'; last = 0; accumulator = 0;
    $('overlay').hidden = true; $('pause').disabled = false; $('start').blur();
    $('hint').textContent = matchMedia('(pointer:coarse)').matches ? 'Drag anywhere to steer · Hold ⚡ to boost' : 'Mouse / WASD / arrows to steer · Space to boost · P to pause';
  });
  $('pause').addEventListener('click', pause);
  $('sound').textContent = soundOn ? '♪' : '♪ off'; $('sound').setAttribute('aria-pressed', String(soundOn));
  $('sound').addEventListener('click', () => {
    soundOn = !soundOn; $('sound').textContent = soundOn ? '♪' : '♪ off'; $('sound').setAttribute('aria-pressed', String(soundOn));
    try { localStorage.setItem('snake-sound', soundOn ? 'on' : 'off'); if (soundOn) { const Audio = window.AudioContext || window.webkitAudioContext; if (Audio) { audio = audio || new Audio(); audio.resume(); } } } catch (_) {}
  });
  function renderPicker() {
    $('snake-types').replaceChildren(...[['textured', 'Textured'], ['classic', 'Classic glossy']].map(([id, label]) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
      button.setAttribute('aria-pressed', String(selectedType === id));
      button.addEventListener('click', () => {
        selectedType = id;
        try { localStorage.setItem('snake-arena-type', id); } catch (_) {}
        if (state !== 'playing' && state !== 'paused') player.bodyType = id;
        renderPicker();
        $('snake-types').querySelectorAll('button')[id === 'textured' ? 0 : 1].focus();
        $('announcement').textContent = `${label} body selected.`;
      });
      return button;
    }));
    $('snake-options').replaceChildren(...skins.map(skin => {
      const button = document.createElement('button'); button.type = 'button';
      const locked = skins.indexOf(skin) >= unlockedSkins();
      button.disabled = locked;
      button.className = 'snake-choice'; button.setAttribute('aria-pressed', String(skin === selectedSkin));
      button.setAttribute('aria-label', `Select ${skin.name} snake`);
      const preview = document.createElement('canvas'); preview.width = 240; preview.height = 110;
      preview.setAttribute('aria-hidden', 'true');
      const paint = preview.getContext('2d');
      const body = Array.from({ length: 20 }, (_, i) => ({ x: 210 - i * 9, y: 54 + Math.sin(i * .29) * 16 }));
      if (selectedType === 'textured') drawRibbon(body, () => true, skin, paint);
      else drawClassic(body, () => true, skin.color, paint);
      paint.drawImage(sprite(skin.color, true, selectedType === 'classic'), body[0].x - 28, body[0].y - 28, 56, 56);
      const name = document.createElement('span'); name.textContent = locked ? `${skin.name} · ${skins.indexOf(skin) * 4} correct` : skin.name;
      button.append(preview, name);
      button.addEventListener('click', () => {
        if (locked) return;
        selectedSkin = skin;
        try { localStorage.setItem('snake-arena-skin', skin.id); } catch (_) {}
        renderPicker();
        if (state !== 'playing' && state !== 'paused') { player.skin = skin; player.color = skin.color; }
        $('announcement').textContent = `${skin.name} snake selected.`;
        const choices = $('snake-options').querySelectorAll('button'); choices[skins.indexOf(skin)].focus();
      });
      return button;
    }));
  }
  window.addEventListener('blur', pause); document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('resize', fit);
  fit(); reset(); renderPicker(); requestAnimationFrame(frame);
})();

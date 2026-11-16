import {
  PAIR_BY_ID,
  ROUND_SECONDS,
  STORAGE_KEY,
  applyRoundOutcome,
  createBoard,
  createInitialProgress,
  evaluateBoard,
  formatTime,
  isBoardComplete,
  placeCard,
  removeSlotCard
} from './back-to-school-core.js';
import { createAudioManager } from './back-to-school-audio.js';

const $ = (sel) => document.querySelector(sel);
const audio = createAudioManager();

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    return { ...createInitialProgress(), ...JSON.parse(raw) };
  } catch {
    return createInitialProgress();
  }
}

function saveProgress(p) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // Ignore storage quota issues
  }
}

let progress = loadProgress();
let currentScreen = 1;
let demoStep = 1;
let board = createBoard();
let remainingSeconds = ROUND_SECONDS;
let roundStartMs = 0;
let timerInterval = null;
let selectedSlotCard = null; // { side: 'left'|'right', id: string, slotIndex: number }
let lastPlacedCard = null; // { side: 'left'|'right', id: string }
let lastEval = null;
let wrongWalkIndex = 0;
let checkTimers = [];

function clearCheckTimers() {
  for (const t of checkTimers) clearTimeout(t);
  checkTimers = [];
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function clearFx() {
  const layer = $('#bts-fx-layer');
  if (layer) layer.innerHTML = '';
}

function triggerFlash(kind) {
  const layer = $('#bts-fx-layer');
  if (!layer) return;
  const flash = document.createElement('div');
  flash.className = `bts-vignette-flash ${kind}`;
  layer.appendChild(flash);
  setTimeout(() => flash.remove(), 700);
}

function spawnConfetti(count = 36, withStars = false) {
  const layer = $('#bts-fx-layer');
  if (!layer) return;
  clearFx();
  const colors = ['#ffe24a', '#44e5e7', '#ff6b6b', '#7dff7a', '#ff9ff3', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const isStar = withStars && i % 4 === 0;
    el.className = isStar ? 'bts-confetti star' : 'bts-confetti';
    if (isStar) {
      el.textContent = '⭐';
    } else {
      el.style.background = colors[i % colors.length];
    }
    el.style.left = `${4 + Math.random() * 92}%`;
    el.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
    el.style.setProperty('--rot', `${(Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540)}deg`);
    el.style.setProperty('--dur', `${1.6 + Math.random() * 1.3}s`);
    el.style.animationDelay = `${Math.random() * 0.35}s`;
    layer.appendChild(el);
  }
}

function hideModals() {
  $('#modal-6').hidden = true;
  $('#modal-7').hidden = true;
  $('#modal-9').hidden = true;
  $('#modal-10').hidden = true;
}

function renderHome() {
  const targetSec = progress.targetSeconds || ROUND_SECONDS;
  const secEl = $('#p3-seconds-heading');
  if (secEl) secEl.textContent = `${targetSec} seconds.`;
  const boxes = $('#p3-streak-boxes');
  if (boxes) {
    boxes.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      if (i < (progress.streak || 0)) {
        const img = document.createElement('img');
        img.className = 'bts-streak-icon';
        img.src = '../back-to-school-assets/page-6/right.webp';
        img.alt = 'Win';
        boxes.appendChild(img);
      } else {
        boxes.appendChild(span);
      }
    }
  }
}

function showScreen(num) {
  currentScreen = num;
  hideModals();
  clearFx();
  if (num === 3) renderHome();
  for (let i = 1; i <= 11; i++) {
    const el = $(`#screen-${i}`);
    if (el) el.classList.toggle('active', i === num);
  }
  if (num <= 3) {
    audio.setTrack('menu');
  } else {
    audio.setTrack('game');
  }
}

// Corner HUD
function updateMuteIcon() {
  const muted = audio.isMuted();
  const svg = $('#bts-mute-icon');
  if (muted) {
    svg.innerHTML =
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
      '<line x1="23" y1="9" x2="17" y2="15"></line>' +
      '<line x1="17" y1="9" x2="23" y2="15"></line>';
  } else {
    svg.innerHTML =
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
      '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
      '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>';
  }
}

$('#bts-mute-btn').addEventListener('click', () => {
  audio.unlock();
  audio.toggleMute();
  updateMuteIcon();
});

$('#bts-exit-btn').addEventListener('click', () => {
  stopTimer();
  clearCheckTimers();
  const from = new URLSearchParams(location.search).get('from');
  const hash = from === 'games' ? '#games' : '#rc-games';
  location.href = `../../index.html${hash}`;
});

// Page 1: Loading simulation + Start
function startLoading() {
  const fill = $('#p1-loading-fill');
  const label = $('#p1-loading-label');
  const wrap = $('#p1-loading');
  const startBtn = $('#p1-start-btn');

  let pct = 0;
  const iv = setInterval(() => {
    pct = Math.min(100, pct + 18 + Math.floor(Math.random() * 14));
    fill.style.width = `${pct}%`;
    label.textContent = `Loading... ${pct}%`;
    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        wrap.hidden = true;
        startBtn.hidden = false;
      }, 160);
    }
  }, 110);
}

$('#p1-start-btn').addEventListener('click', () => {
  audio.unlock();
  if (!progress.demoSeen) {
    openDemo();
  } else {
    showScreen(3);
  }
});

// Page 2: Demo (2.1 - 2.3)
const DEMO_GIFS = [
  '../back-to-school-assets/page-2/demo-2.1.gif',
  '../back-to-school-assets/page-2/demo-2.2.gif',
  '../back-to-school-assets/page-2/demo-2.3.gif'
];

function openDemo() {
  demoStep = 1;
  renderDemo();
  showScreen(2);
}

function renderDemo() {
  $('#p2-demo-img').src = DEMO_GIFS[demoStep - 1];
  $('#p2-step').textContent = `Step ${demoStep} / 3`;
}

$('#p2-next-btn').addEventListener('click', () => {
  audio.unlock();
  if (demoStep < 3) {
    demoStep++;
    renderDemo();
  } else {
    progress.demoSeen = true;
    saveProgress(progress);
    showScreen(3);
  }
});

// Page 3: Home
$('#p3-play-btn').addEventListener('click', () => {
  audio.unlock();
  startRound();
});

$('#p3-demo-btn').addEventListener('click', () => {
  audio.unlock();
  openDemo();
});

// Page 4: Main Game Board
function startRound() {
  stopTimer();
  clearCheckTimers();
  board = createBoard();
  selectedSlotCard = null;
  remainingSeconds = ROUND_SECONDS;
  roundStartMs = Date.now();
  showScreen(4);
  renderTimer();
  renderBoard();

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - roundStartMs) / 1000);
    remainingSeconds = Math.max(0, ROUND_SECONDS - elapsed);
    renderTimer();
    if (remainingSeconds <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 250);
}

function renderTimer() {
  const el = $('#p4-timer');
  el.textContent = formatTime(remainingSeconds);
  el.classList.toggle('urgent', remainingSeconds <= 15);
}

function createCardElement(side, id, source) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `bts-card ${side}`;
  if (selectedSlotCard && selectedSlotCard.side === side && selectedSlotCard.id === id) {
    btn.classList.add('selected');
  }
  if (source === 'slot' && lastPlacedCard && lastPlacedCard.side === side && lastPlacedCard.id === id) {
    btn.classList.add('just-placed');
  }
  btn.textContent = side === 'left' ? PAIR_BY_ID[id].situation : PAIR_BY_ID[id].response;
  btn.dataset.side = side;
  btn.dataset.id = id;
  btn.dataset.source = source;

  attachCardInteractions(btn, side, id, source);
  return btn;
}

function attachCardInteractions(btn, side, id, source) {
  let startX = 0;
  let startY = 0;
  let dragging = false;
  let ghost = null;
  let activePointerId = null;

  function findHoveredSlot(clientX, clientY) {
    const slots = document.querySelectorAll(`.bts-slot[data-side="${side}"]`);
    for (const s of slots) {
      const r = s.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return s;
      }
    }
    return null;
  }

  function clearDropHighlights() {
    document.querySelectorAll('.bts-slot').forEach((s) => {
      s.classList.remove('drop-target', 'drop-hover');
    });
  }

  btn.addEventListener('pointerdown', (e) => {
    if (currentScreen !== 4 || remainingSeconds <= 0) return;
    e.stopPropagation();
    activePointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    dragging = false;
    btn.setPointerCapture(e.pointerId);
  });

  btn.addEventListener('pointermove', (e) => {
    if (activePointerId !== e.pointerId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!dragging && Math.hypot(dx, dy) > 8) {
      dragging = true;
      const rect = btn.getBoundingClientRect();
      ghost = btn.cloneNode(true);
      ghost.classList.add('dragging');
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      ghost.style.left = `${e.clientX - rect.width / 2}px`;
      ghost.style.top = `${e.clientY - rect.height / 2}px`;
      document.body.appendChild(ghost);
      btn.style.opacity = '0.35';
      document.querySelectorAll(`.bts-slot[data-side="${side}"]`).forEach((s) => {
        s.classList.add('drop-target');
      });
    }
    if (dragging && ghost) {
      ghost.style.left = `${e.clientX - ghost.offsetWidth / 2}px`;
      ghost.style.top = `${e.clientY - ghost.offsetHeight / 2}px`;
      document.querySelectorAll(`.bts-slot[data-side="${side}"]`).forEach((s) => {
        s.classList.remove('drop-hover');
      });
      const hovered = findHoveredSlot(e.clientX, e.clientY);
      if (hovered) hovered.classList.add('drop-hover');
    }
  });

  function finishPointer(e) {
    if (activePointerId !== e.pointerId) return;
    e.stopPropagation();
    activePointerId = null;

    if (dragging) {
      const hovered = findHoveredSlot(e.clientX, e.clientY);
      if (ghost) {
        ghost.remove();
        ghost = null;
      }
      btn.style.opacity = '';
      clearDropHighlights();
      if (hovered) {
        const targetIndex = Number(hovered.dataset.index);
        board = placeCard(board, side, id, targetIndex);
        lastPlacedCard = { side, id };
        selectedSlotCard = null;
        renderBoard();
      } else if (source === 'slot') {
        const key = side === 'left' ? 'leftSlots' : 'rightSlots';
        const idx = board[key].indexOf(id);
        if (idx !== -1) {
          board = removeSlotCard(board, side, idx);
          lastPlacedCard = null;
          selectedSlotCard = null;
          renderBoard();
        }
      }
      dragging = false;
      return;
    }

    if (source === 'slot') {
      const key = side === 'left' ? 'leftSlots' : 'rightSlots';
      const idx = board[key].indexOf(id);
      if (selectedSlotCard && selectedSlotCard.side === side && selectedSlotCard.id !== id) {
        // Swap with the previously selected slot card!
        board = placeCard(board, side, selectedSlotCard.id, idx);
        lastPlacedCard = { side, id: selectedSlotCard.id };
        selectedSlotCard = null;
        renderBoard();
      } else if (idx !== -1) {
        // Tap placed card -> return to bank immediately
        board = removeSlotCard(board, side, idx);
        lastPlacedCard = null;
        selectedSlotCard = null;
        renderBoard();
      }
    } else {
      // Tap bank card -> place in first open slot of its column
      board = placeCard(board, side, id, null);
      lastPlacedCard = { side, id };
      selectedSlotCard = null;
      renderBoard();
    }
  }

  btn.addEventListener('pointerup', finishPointer);
  btn.addEventListener('pointercancel', finishPointer);
}

function renderBoard() {
  const leftSlotsEl = $('#p4-left-slots');
  const rightSlotsEl = $('#p4-right-slots');
  const leftBankEl = $('#p4-left-bank');
  const rightBankEl = $('#p4-right-bank');

  leftSlotsEl.innerHTML = '';
  rightSlotsEl.innerHTML = '';
  leftBankEl.innerHTML = '';
  rightBankEl.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    const lSlot = document.createElement('div');
    lSlot.className = 'bts-slot';
    lSlot.dataset.side = 'left';
    lSlot.dataset.index = String(i);
    if (board.leftSlots[i]) {
      lSlot.appendChild(createCardElement('left', board.leftSlots[i], 'slot'));
    }
    leftSlotsEl.appendChild(lSlot);

    const rSlot = document.createElement('div');
    rSlot.className = 'bts-slot';
    rSlot.dataset.side = 'right';
    rSlot.dataset.index = String(i);
    if (board.rightSlots[i]) {
      rSlot.appendChild(createCardElement('right', board.rightSlots[i], 'slot'));
    }
    rightSlotsEl.appendChild(rSlot);
  }

  for (const id of board.situationsOrder) {
    const wrap = document.createElement('div');
    wrap.className = 'bts-bank-slot';
    if (!board.leftSlots.includes(id)) {
      wrap.appendChild(createCardElement('left', id, 'bank'));
    }
    leftBankEl.appendChild(wrap);
  }

  for (const id of board.responsesOrder) {
    const wrap = document.createElement('div');
    wrap.className = 'bts-bank-slot';
    if (!board.rightSlots.includes(id)) {
      wrap.appendChild(createCardElement('right', id, 'bank'));
    }
    rightBankEl.appendChild(wrap);
  }

  const ready = isBoardComplete(board);
  const checkBtn = $('#p4-check-btn');
  checkBtn.disabled = !ready;
  $('#p4-check-img').src = ready
    ? '../back-to-school-assets/page-4/page4-check-my-board-button-on.webp'
    : '../back-to-school-assets/page-4/page4-check-my-board-button.webp';
  lastPlacedCard = null;
}

function handleTimeout() {
  const res = applyRoundOutcome(progress, { allCorrect: false, elapsedSeconds: ROUND_SECONDS, timedOut: true });
  progress = res.progress;
  saveProgress(progress);
  audio.playSfx('timeUp');
  triggerFlash('danger');
  $('#modal-10').hidden = false;
}

$('#p4-check-btn').addEventListener('click', () => {
  if (!isBoardComplete(board)) return;
  stopTimer();
  const elapsedSeconds = Math.max(1, Math.min(ROUND_SECONDS, Math.round((Date.now() - roundStartMs) / 1000)));
  runCheckingSequence(elapsedSeconds);
});

// Page 5: Checking Animation + Result Popups
function runCheckingSequence(elapsedSeconds) {
  clearCheckTimers();
  lastEval = evaluateBoard(board);
  const container = $('#p5-rows');
  container.innerHTML = '';

  const rowEls = lastEval.rows.map((r, i) => {
    const row = document.createElement('div');
    row.className = 'bts-check-row';

    const leftPill = document.createElement('div');
    leftPill.className = 'bts-check-pill left';
    leftPill.textContent = `${i + 1} ${r.situation}`;

    const rightPill = document.createElement('div');
    rightPill.className = 'bts-check-pill right';
    rightPill.textContent = r.response;

    const ring = document.createElement('img');
    ring.className = 'bts-wrong-ring';
    ring.alt = '';
    rightPill.appendChild(ring);

    const mark = document.createElement('div');
    mark.className = 'bts-check-mark';
    const markImg = document.createElement('img');
    markImg.alt = r.correct ? 'Correct' : 'Wrong';
    mark.appendChild(markImg);

    row.append(leftPill, rightPill, mark);
    container.appendChild(row);
    return { row, ring, markImg, correct: r.correct };
  });

  showScreen(5);

  rowEls.forEach((item, idx) => {
    const tHighlight = setTimeout(() => {
      item.row.classList.add('checking-active');
    }, 220 + idx * 480);
    const tReveal = setTimeout(() => {
      item.row.classList.remove('checking-active');
      if (item.correct) {
        item.markImg.src = '../back-to-school-assets/page-5/right.webp';
        item.row.classList.add('is-right');
      } else {
        item.ring.src = '../back-to-school-assets/page-5/red-circle.webp';
        item.markImg.src = '../back-to-school-assets/page-5/wrong.webp';
        item.row.classList.add('is-wrong');
      }
    }, 420 + idx * 480);
    checkTimers.push(tHighlight, tReveal);
  });

  // Give ~3 full seconds after the 5th row reveals so the player can read all right/wrong pairs
  const doneTimer = setTimeout(() => {
    const res = applyRoundOutcome(progress, {
      allCorrect: lastEval.allCorrect,
      elapsedSeconds,
      timedOut: false
    });
    progress = res.progress;
    saveProgress(progress);

    if (res.outcome === 'star') {
      audio.playSfx('correct');
      $('#p11-avg').textContent = formatTime(res.averageSeconds);
      $('#p11-next-target').textContent = `${formatTime(res.targetSeconds)}.`;
      showScreen(11);
      triggerFlash('gold');
      spawnConfetti(48, true);
    } else if (res.outcome === 'correct') {
      audio.playSfx('correct');
      $('#p6-time').textContent = formatTime(res.elapsedSeconds);
      $('#p6-target').textContent = formatTime(res.targetSeconds);
      $('#p6-streak-text').textContent = `${res.streak}/3`;
      const boxes = $('#p6-streak-boxes');
      boxes.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const span = document.createElement('span');
        if (i < res.streak) {
          const img = document.createElement('img');
          img.className = 'bts-streak-icon';
          img.src = '../back-to-school-assets/page-6/right.webp';
          img.alt = 'Win';
          boxes.appendChild(img);
        } else {
          boxes.appendChild(span);
        }
      }
      $('#modal-6').hidden = false;
      spawnConfetti(32, false);
    } else if (res.outcome === 'too-slow') {
      audio.playSfx('tooSlow');
      $('#p9-time').textContent = formatTime(res.elapsedSeconds);
      $('#p9-target').textContent = formatTime(res.targetSeconds);
      triggerFlash('warn');
      $('#modal-9').hidden = false;
    } else {
      audio.playSfx('wrong');
      const countBadge = $('#p7-wrong-count');
      countBadge.textContent = String(lastEval.wrongCount);
      countBadge.hidden = false;
      triggerFlash('danger');
      $('#modal-7').hidden = false;
    }
  }, 420 + (rowEls.length - 1) * 480 + 3000);
  checkTimers.push(doneTimer);
}

// Page 6 actions
$('#p6-next-btn').addEventListener('click', () => startRound());

// Page 7 actions -> Page 8 (walkthrough of wrong pairs) or Home (Page 3)
$('#p7-next-btn').addEventListener('click', () => {
  wrongWalkIndex = 0;
  renderWrongWalkthrough();
  showScreen(8);
});
$('#p7-home-btn').addEventListener('click', () => showScreen(3));

// Page 8: Wrong Pairs Correct Response Walkthrough
function renderWrongWalkthrough() {
  const wrongPairs = lastEval?.wrongPairs || [];
  if (!wrongPairs.length) {
    startRound();
    return;
  }
  const pair = wrongPairs[wrongWalkIndex];
  const sitEl = $('#p8-sit');
  const respEl = $('#p8-resp');
  const expEl = $('#p8-exp');

  for (const el of [sitEl, respEl, expEl]) {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }

  sitEl.textContent = pair.situation;
  respEl.textContent = pair.response;
  expEl.textContent = pair.explanation;

  const isLast = wrongWalkIndex >= wrongPairs.length - 1;
  $('#p8-next-btn').hidden = isLast;
  $('#p8-play-btn').hidden = !isLast;
  $('#p8-home-btn').hidden = !isLast;
}

$('#p8-next-btn').addEventListener('click', () => {
  const wrongPairs = lastEval?.wrongPairs || [];
  if (wrongWalkIndex < wrongPairs.length - 1) {
    wrongWalkIndex++;
    renderWrongWalkthrough();
  }
});
$('#p8-play-btn').addEventListener('click', () => startRound());
$('#p8-home-btn').addEventListener('click', () => showScreen(3));

// Page 9 actions
$('#p9-play-btn').addEventListener('click', () => startRound());
$('#p9-home-btn').addEventListener('click', () => showScreen(3));

// Page 10 actions
$('#p10-play-btn').addEventListener('click', () => startRound());
$('#p10-home-btn').addEventListener('click', () => showScreen(3));

// Page 11 actions
$('#p11-play-btn').addEventListener('click', () => startRound());
$('#p11-home-btn').addEventListener('click', () => showScreen(3));

updateMuteIcon();
startLoading();

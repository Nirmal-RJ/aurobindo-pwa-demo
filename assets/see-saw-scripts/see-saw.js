(function (root) {
  'use strict';

  var Config = root.SeeSawConfig;
  var Core = root.SeeSawCore;
  var AudioCtrl = root.SeeSawAudio;
  var VideoCtrl = root.SeeSawVideo;

  var stageEl = document.getElementById('stage');
  var rotateOverlayEl = document.getElementById('rotate-overlay');
  var closeBtnEl = document.getElementById('close-btn');

  // Page sections
  var pages = {
    'page-1': document.getElementById('page-1'),
    'page-2': document.getElementById('page-2'),
    'page-3': document.getElementById('page-3'),
    'page-4': document.getElementById('page-4'),
    'page-5': document.getElementById('page-5'),
    'page-10': document.getElementById('page-10'),
    'page-11': document.getElementById('page-11'),
    'page-13': document.getElementById('page-13')
  };

  // Page 1 elements
  var preloadPanelEl = document.getElementById('preload-panel');
  var preloadFillEl = document.getElementById('preload-fill');
  var preloadTextEl = document.getElementById('preload-text');
  var preloadRetryBtn = document.getElementById('preload-retry-btn');
  var page1NextBtn = document.getElementById('page1-next-btn');

  // Page 2 elements
  var demoGifImg = document.getElementById('demo-gif-img');
  var demoNextBtn = document.getElementById('demo-next-btn');

  // Page 3 elements
  var p3SymptomTitle = document.getElementById('p3-symptom-title');
  var p3VideoCounter = document.getElementById('p3-video-counter');
  var p3VideoHost = document.getElementById('p3-video-host');
  var p3NextBtn = document.getElementById('p3-next-btn');

  // Page 4 elements
  var p4SecondsText = document.getElementById('p4-seconds-text');
  var p4StartBtn = document.getElementById('p4-start-btn');
  var p4WatchVideosBtn = document.getElementById('p4-watch-videos-btn');
  var p4DemoBtn = document.getElementById('p4-demo-btn');

  // Page 5 + Outcome elements
  var p5QBadge = document.getElementById('p5-q-badge');
  var p5TimerWrap = document.querySelector('.ss-p5-timer-wrap');
  var p5TimerText = document.getElementById('p5-timer-text');
  var p5MascotWrap = document.getElementById('p5-mascot-wrap') || document.querySelector('.ss-mascot-wrap');
  var p5MascotImg = document.getElementById('p5-mascot-img');
  var seesawBeam = document.getElementById('seesaw-beam');
  var p5SymptomRock = document.getElementById('p5-symptom-rock');
  var p5DropZone = document.getElementById('p5-drop-zone');
  var p5DropPlaceholder = document.getElementById('p5-drop-placeholder');
  var p5PlacedRock = document.getElementById('p5-placed-rock');
  var p5TrayArea = document.getElementById('p5-tray-area');
  var p5OptionsContainer = document.getElementById('p5-options-container');

  // Popups 6, 7, 8, 12 + Modal 9
  var popupCorrect = document.getElementById('popup-correct');
  var celebrationLayer = document.getElementById('celebration-layer');
  var p6TimeValue = document.getElementById('p6-time-value');
  var p6StreakDots = Array.prototype.slice.call(document.querySelectorAll('#p6-streak-row .ss-streak-dot'));
  var popupWrong = document.getElementById('popup-wrong');
  var p7WatchBtn = document.getElementById('p7-watch-btn');
  var popupTimeUp = document.getElementById('popup-timeup');
  var p8WatchBtn = document.getElementById('p8-watch-btn');
  var popupTooSlow = document.getElementById('popup-tooslow');
  var p12YourTime = document.getElementById('p12-your-time');
  var p12TargetTime = document.getElementById('p12-target-time');
  var p12WatchBtn = document.getElementById('p12-watch-btn');
  var modalPage9 = document.getElementById('modal-page-9');
  var p9VideoHost = document.getElementById('p9-video-host');
  var p9SymptomPill = document.getElementById('p9-symptom-pill');
  var p9TryAgainBtn = document.getElementById('p9-try-again-btn');

  // Page 10 & 11 elements
  var p10ThisRound = document.getElementById('p10-this-round');
  var p10PrevBest = document.getElementById('p10-prev-best');
  var p10ContinueBtn = document.getElementById('p10-continue-btn');
  var p11Stars = Array.prototype.slice.call(document.querySelectorAll('#p11-stars-row .ss-p11-star'));
  var p11StarsText = document.getElementById('p11-stars-text');
  var p11PlayAgainBtn = document.getElementById('p11-play-again-btn');

  // Page 13 elements
  var p13VideoList = document.getElementById('p13-video-list');
  var p13HomeBtn = document.getElementById('p13-home-btn');
  var p13VideoModal = document.getElementById('p13-video-modal');
  var p13ModalTitle = document.getElementById('p13-modal-title');
  var p13VideoHost = document.getElementById('p13-video-host');
  var p13SymptomPill = document.getElementById('p13-symptom-pill');
  var p13CloseModalBtn = document.getElementById('p13-close-modal-btn');

  // Tray slot order matching page-5-reference.webp compartments
  var TRAY_CAUSE_ORDER = [
    'high-pressure',
    'pressure-fluctuation',
    'low-pressure',
    'peak-tailing',
    'retention-time-shift'
  ];

  var controller = Core.createGameController({
    config: Config,
    storage: root.localStorage
  });

  // Question timer state
  var questionDurationMs = (Config.questionSeconds || 10) * 1000;
  var questionElapsedMs = 0;
  var questionLastTick = 0;
  var questionTimerRaf = null;
  var questionTimerRunning = false;
  var correctAutoAdvanceTimer = null;
  var isLandscapeLocked = false;
  var isDocumentHidden = false;
  var lastRenderedPage = null;
  var lastOnboardingVideoKey = '';
  var lastRemediationVideoKey = '';
  var lastWatchModalPairId = null;

  function setupCloseLink() {
    try {
      var params = new URLSearchParams(root.location.search || '');
      var from = params.get('from');
      if (from === 'games') {
        closeBtnEl.href = '../../index.html#/games';
      } else {
        closeBtnEl.href = '../../index.html#/rc-games';
      }
    } catch (_) {
      closeBtnEl.href = '../../index.html#/rc-games';
    }
  }

  function updateStageWidthVar() {
    if (!stageEl) return;
    var rect = stageEl.getBoundingClientRect();
    if (rect.width > 0) {
      stageEl.style.setProperty('--stage-w', rect.width + 'px');
    }
  }

  function checkOrientationAndVisibility() {
    updateStageWidthVar();
    var vw = root.innerWidth || 360;
    var vh = root.innerHeight || 640;
    var mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
    var mobileLandscape = mobile && vw > vh;
    isLandscapeLocked = mobileLandscape;
    if (rotateOverlayEl) {
      rotateOverlayEl.classList.toggle('is-visible', isLandscapeLocked);
      rotateOverlayEl.setAttribute('aria-hidden', isLandscapeLocked ? 'false' : 'true');
    }
    isDocumentHidden = Boolean(document.hidden);
    var shouldSuspend = isLandscapeLocked || isDocumentHidden;
    AudioCtrl.setSystemSuspended(shouldSuspend);

    if (questionTimerRunning) {
      if (shouldSuspend) {
        if (questionTimerRaf) {
          cancelAnimationFrame(questionTimerRaf);
          questionTimerRaf = null;
        }
      } else if (!questionTimerRaf) {
        questionLastTick = performance.now();
        questionTimerRaf = requestAnimationFrame(tickQuestionTimer);
      }
    }
  }

  function stopQuestionTimer() {
    questionTimerRunning = false;
    if (questionTimerRaf) {
      cancelAnimationFrame(questionTimerRaf);
      questionTimerRaf = null;
    }
    if (p5TimerWrap) {
      p5TimerWrap.classList.remove('is-urgent');
    }
  }

  function startQuestionTimer() {
    stopQuestionTimer();
    questionDurationMs = (Config.questionSeconds || 10) * 1000;
    questionElapsedMs = 0;
    questionTimerRunning = true;
    updateTimerDisplay(questionDurationMs);
    if (!isLandscapeLocked && !isDocumentHidden) {
      questionLastTick = performance.now();
      questionTimerRaf = requestAnimationFrame(tickQuestionTimer);
    }
  }

  function updateTimerDisplay(remainingMs) {
    if (!p5TimerText) return;
    p5TimerText.textContent = Core.formatTimerMMSS(remainingMs);
    if (p5TimerWrap) {
      p5TimerWrap.classList.toggle('is-urgent', remainingMs > 0 && remainingMs <= 3000);
    }
  }

  function tickQuestionTimer(now) {
    if (!questionTimerRunning) return;
    if (isLandscapeLocked || isDocumentHidden) {
      questionTimerRaf = null;
      return;
    }
    var delta = Math.max(0, now - questionLastTick);
    questionLastTick = now;
    questionElapsedMs += delta;
    var remaining = Math.max(0, questionDurationMs - questionElapsedMs);
    updateTimerDisplay(remaining);

    if (remaining <= 0) {
      stopQuestionTimer();
      AudioCtrl.playTimeUp();
      render(controller.expireQuestion());
      return;
    }
    questionTimerRaf = requestAnimationFrame(tickQuestionTimer);
  }

  function clearCelebrationConfetti() {
    if (celebrationLayer) {
      celebrationLayer.innerHTML = '';
    }
  }

  function spawnCelebrationConfetti() {
    if (!celebrationLayer) return;
    celebrationLayer.innerHTML = '';

    var colors = [
      '#ffd32a', '#ff3f34', '#0be881', '#05c46b', '#1e90ff',
      '#ff5e57', '#ffa801', '#ffffff', '#a55eea', '#00d2d3'
    ];

    // 1. Staggered confetti burst cannons from bottom-left & bottom-right
    var totalPieces = 42;
    for (var i = 0; i < totalPieces; i += 1) {
      var piece = document.createElement('i');
      var isLeft = i % 2 === 0;
      var isStar = i % 4 === 0;
      var isSparkle = i % 7 === 0;

      piece.className = 'ss-confetti-piece ' + (isStar ? 'ss-confetti-star' : (isSparkle ? 'ss-confetti-sparkle' : 'ss-confetti-ribbon'));

      var startX = isLeft ? (6 + Math.random() * 24) : (70 + Math.random() * 24);
      var startY = 64 + Math.random() * 12;
      piece.style.left = startX + '%';
      piece.style.top = startY + '%';

      var dx = (isLeft ? 1 : -1) * (45 + Math.random() * 130) + (Math.random() - 0.5) * 40;
      var rise = -(140 + Math.random() * 250) + 'px';
      var drop = (280 + Math.random() * 260) + 'px';

      piece.style.setProperty('--dx', dx + 'px');
      piece.style.setProperty('--rise', rise);
      piece.style.setProperty('--drop', drop);

      var color = colors[i % colors.length];
      if (isStar) {
        piece.style.backgroundColor = '#ffd700';
      } else if (isSparkle) {
        piece.innerHTML = '<svg viewBox="0 0 24 24" fill="#ffd700"><polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9"/></svg>';
      } else {
        piece.style.backgroundColor = color;
      }

      var delay = (Math.random() * 0.45);
      piece.style.animationDelay = delay + 's';

      celebrationLayer.appendChild(piece);
    }

    // 2. Extra floating sparkles around mascot & balanced see-saw
    for (var s = 0; s < 6; s += 1) {
      var star = document.createElement('i');
      star.className = 'ss-confetti-piece ss-confetti-sparkle';
      star.innerHTML = '<svg viewBox="0 0 24 24" fill="#ffe066" filter="drop-shadow(0 0 6px rgba(255,224,102,0.9))"><polygon points="12,1 14.5,8.5 22,12 14.5,15.5 12,23 9.5,15.5 2,12 9.5,8.5"/></svg>';
      var starX = 26 + Math.random() * 48;
      var starY = 20 + Math.random() * 28;
      star.style.left = starX + '%';
      star.style.top = starY + '%';
      star.style.animationDelay = (s * 0.22) + 's';
      celebrationLayer.appendChild(star);
    }
  }

  function clearAutoAdvance() {
    if (correctAutoAdvanceTimer) {
      clearTimeout(correctAutoAdvanceTimer);
      correctAutoAdvanceTimer = null;
    }
    clearCelebrationConfetti();
  }

  function advanceAfterCorrectImmediately() {
    clearAutoAdvance();
    var nextSnap = controller.advanceAfterCorrect();
    if (nextSnap.page === 'page-10' && nextSnap.lastStarSummary.newlyEarnedStar) {
      AudioCtrl.playStar();
    }
    render(nextSnap);
  }

  function preloadImage(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        if (typeof img.decode === 'function') {
          img.decode().then(resolve).catch(resolve);
        } else {
          resolve();
        }
      };
      img.onerror = function () {
        reject(new Error('Failed to load ' + url));
      };
      img.src = url;
    });
  }

  function runPreloadGate() {
    preloadRetryBtn.hidden = true;
    page1NextBtn.hidden = true;
    preloadPanelEl.hidden = false;
    preloadFillEl.style.width = '0%';
    preloadTextEl.textContent = 'Loading assets... 0%';

    var imgUrls = Config.preloadImages || [];
    var totalImages = imgUrls.length || 1;
    var loadedImages = 0;
    var audioProgress = 0;

    function updateProgressUI() {
      var imgRatio = loadedImages / totalImages;
      var combined = Math.min(1, imgRatio * 0.8 + audioProgress * 0.2);
      var pct = Math.round(combined * 100);
      preloadFillEl.style.width = pct + '%';
      preloadTextEl.textContent = 'Loading assets... ' + pct + '%';
    }

    var imagePromises = imgUrls.map(function (url) {
      return preloadImage(url).then(function () {
        loadedImages += 1;
        updateProgressUI();
      }).catch(function (err) {
        console.warn('Non-blocking asset load warning for ' + url + ':', err);
        loadedImages += 1;
        updateProgressUI();
      });
    });

    var audioPromise = AudioCtrl.preloadAll(function (val) {
      audioProgress = val;
      updateProgressUI();
    });

    Promise.all([Promise.all(imagePromises), audioPromise])
      .then(function () {
        preloadFillEl.style.width = '100%';
        preloadTextEl.textContent = 'Ready! 100%';
        preloadPanelEl.hidden = true;
        page1NextBtn.hidden = false;
      })
      .catch(function () {
        preloadTextEl.textContent = 'Some assets failed to load.';
        preloadRetryBtn.hidden = false;
      });
  }

  function getPairById(pairId) {
    for (var i = 0; i < Config.pairs.length; i += 1) {
      if (Config.pairs[i].id === pairId) return Config.pairs[i];
    }
    return null;
  }

  function buildTrayOptions() {
    p5OptionsContainer.innerHTML = '';
    TRAY_CAUSE_ORDER.forEach(function (pairId, slotIndex) {
      var pair = getPairById(pairId);
      if (!pair) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ss-cause-option';
      btn.setAttribute('data-slot', String(slotIndex));
      btn.setAttribute('data-cause-id', pair.id);
      btn.setAttribute('aria-label', pair.cause);
      btn.tabIndex = -1;
      var img = document.createElement('img');
      img.src = pair.causeImg;
      img.alt = pair.cause;
      img.draggable = false;
      btn.appendChild(img);
      attachCauseInteraction(btn, pair);
      p5OptionsContainer.appendChild(btn);
    });
  }

  function attachCauseInteraction(btn, pair) {
    var activePointerId = null;
    var startX = 0;
    var startY = 0;
    var ghostEl = null;
    var hasDragged = false;

    function cleanupDrag() {
      if (ghostEl && ghostEl.parentNode) {
        ghostEl.parentNode.removeChild(ghostEl);
      }
      ghostEl = null;
      activePointerId = null;
      hasDragged = false;
      btn.classList.remove('is-dragging');
      p5DropZone.classList.remove('is-drag-over');
    }

    function isOverDropTarget(clientX, clientY) {
      var dropRect = p5DropZone.getBoundingClientRect();
      var marginX = dropRect.width * 0.35;
      var marginY = dropRect.height * 0.45;
      if (
        clientX >= dropRect.left - marginX &&
        clientX <= dropRect.right + marginX &&
        clientY >= dropRect.top - marginY &&
        clientY <= dropRect.bottom + marginY
      ) {
        return true;
      }
      var beamRect = seesawBeam.getBoundingClientRect();
      return (
        clientX >= beamRect.left + beamRect.width * 0.42 &&
        clientX <= beamRect.right &&
        clientY >= beamRect.top - marginY &&
        clientY <= beamRect.bottom + marginY
      );
    }

    btn.addEventListener('pointerdown', function (ev) {
      var snap = controller.getSnapshot();
      if (snap.page !== 'page-5') return;
      if (ev.button && ev.button !== 0) return;
      ev.preventDefault();
      AudioCtrl.unlock();

      activePointerId = ev.pointerId;
      startX = ev.clientX;
      startY = ev.clientY;
      hasDragged = false;

      try {
        btn.setPointerCapture(ev.pointerId);
      } catch (_) {
        /* ignore */
      }
    });

    btn.addEventListener('pointermove', function (ev) {
      if (activePointerId === null || ev.pointerId !== activePointerId) return;
      var dx = ev.clientX - startX;
      var dy = ev.clientY - startY;
      if (!hasDragged && Math.hypot(dx, dy) > 8) {
        hasDragged = true;
        btn.classList.add('is-dragging');
        var rect = btn.getBoundingClientRect();
        ghostEl = document.createElement('img');
        ghostEl.src = pair.causeImg;
        ghostEl.alt = '';
        ghostEl.className = 'ss-drag-ghost';
        ghostEl.style.width = rect.width + 'px';
        ghostEl.style.height = rect.height + 'px';
        document.body.appendChild(ghostEl);
      }
      if (hasDragged && ghostEl) {
        ghostEl.style.left = ev.clientX + 'px';
        ghostEl.style.top = ev.clientY + 'px';
        p5DropZone.classList.toggle('is-drag-over', isOverDropTarget(ev.clientX, ev.clientY));
      }
    });

    function handlePointerFinish(ev) {
      if (activePointerId === null || ev.pointerId !== activePointerId) return;
      var droppedOnTarget = hasDragged && isOverDropTarget(ev.clientX, ev.clientY);
      cleanupDrag();

      if (droppedOnTarget) {
        handleCauseChosen(pair.id);
      }
    }

    btn.addEventListener('pointerup', handlePointerFinish);
    btn.addEventListener('pointercancel', cleanupDrag);


  }

  function handleCauseChosen(causeId) {
    var snap = controller.getSnapshot();
    if (snap.page !== 'page-5') return;
    var elapsed = Math.max(50, Math.round(questionElapsedMs));
    stopQuestionTimer();
    AudioCtrl.playPlace();

    var nextSnap = controller.submitAnswer(causeId, elapsed);
    if (nextSnap.page === 'page-6') {
      AudioCtrl.playCorrect();

    }
    render(nextSnap);
  }

  function buildWatchVideosList() {
    p13VideoList.innerHTML = '';
    Config.pairs.forEach(function (pair) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ss-p13-item-btn';
      btn.setAttribute('data-pair-id', pair.id);

      var rock = document.createElement('img');
      rock.className = 'ss-p13-item-rock';
      rock.src = pair.symptomImg;
      rock.alt = pair.symptom;

      var info = document.createElement('div');
      info.className = 'ss-p13-item-info';

      var sym = document.createElement('div');
      sym.className = 'ss-p13-item-symptom';
      sym.textContent = pair.symptom;

      var cause = document.createElement('div');
      cause.className = 'ss-p13-item-cause';
      cause.textContent = 'Probable Cause: ' + pair.cause;

      info.appendChild(sym);
      info.appendChild(cause);

      var playIcon = document.createElement('div');
      playIcon.className = 'ss-p13-item-play';
      playIcon.textContent = '▶';

      btn.appendChild(rock);
      btn.appendChild(info);
      btn.appendChild(playIcon);

      btn.addEventListener('click', function () {
        AudioCtrl.unlock();
        AudioCtrl.playClick();
        render(controller.selectWatchVideoPair(pair.id));
      });

      p13VideoList.appendChild(btn);
    });
  }

  function syncAudioForPage(snap) {
    var page = snap.page;
    if (page === 'page-3' || page === 'page-9' || (page === 'page-13' && snap.watchVideosActivePairId)) {
      AudioCtrl.setMode('none');
    } else if (
      page === 'page-5' ||
      page === 'page-6' ||
      page === 'page-7' ||
      page === 'page-8' ||
      page === 'page-12'
    ) {
      AudioCtrl.setMode('game');
    } else {
      AudioCtrl.setMode('menu');
    }
  }

  function render(snap) {
    clearAutoAdvance();
    stageEl.setAttribute('data-page', snap.page);
    syncAudioForPage(snap);

    var isGameplayComposite =
      snap.page === 'page-5' ||
      snap.page === 'page-6' ||
      snap.page === 'page-7' ||
      snap.page === 'page-8' ||
      snap.page === 'page-9' ||
      snap.page === 'page-12';

    Object.keys(pages).forEach(function (key) {
      var section = pages[key];
      if (!section) return;
      var active = key === snap.page || (key === 'page-5' && isGameplayComposite);
      section.hidden = !active;
      section.classList.toggle('is-active', active);
    });

    if (snap.page !== 'page-3') {
      lastOnboardingVideoKey = '';
    }
    if (snap.page !== 'page-9') {
      lastRemediationVideoKey = '';
    }
    if (snap.page !== 'page-13' || !snap.watchVideosActivePairId) {
      lastWatchModalPairId = null;
    }
    if (
      snap.page !== 'page-3' &&
      snap.page !== 'page-9' &&
      !(snap.page === 'page-13' && snap.watchVideosActivePairId)
    ) {
      VideoCtrl.stopActiveVideo();
    }

    // PAGE 2: Demo (1.gif, 2.gif, 3.gif)
    if (snap.page === 'page-2') {
      var demoImgs = [Config.images.demo1, Config.images.demo2, Config.images.demo3];
      var targetGif = demoImgs[(snap.demoStep || 1) - 1] || Config.images.demo1;
      if (demoGifImg.getAttribute('src') !== targetGif) {
        demoGifImg.src = targetGif;
      }
    }

    // PAGE 3: Onboarding 5 Videos
    if (snap.page === 'page-3') {
      var obPair = snap.onboardingPair || Config.pairs[0];
      p3SymptomTitle.textContent = obPair.symptom;
      p3VideoCounter.textContent = 'Video ' + (snap.onboardingIndex + 1) + ' of ' + snap.onboardingTotal;
      p3NextBtn.disabled = !snap.onboardingVideoDone;

      var obKey = snap.onboardingIndex + ':' + obPair.id;
      if (lastOnboardingVideoKey !== obKey) {
        lastOnboardingVideoKey = obKey;
        VideoCtrl.mountVideo(p3VideoHost, obPair, {
          allowControls: false,
          onComplete: function () {
            render(controller.completeOnboardingVideo());
          }
        });
      }
    }

    // PAGE 4: Home Page
    if (snap.page === 'page-4') {
      p4SecondsText.textContent = (Config.questionSeconds || 10) + ' seconds each';

    }

    // PAGE 5 (+ Pop-ups 6, 7, 8, 12 + Modal 9)
    if (isGameplayComposite) {
      var q = snap.currentQuestion || Config.pairs[0];
      p5QBadge.textContent = snap.questionNumber + '/' + snap.questionsTotal;
      if (p5SymptomRock.getAttribute('src') !== q.symptomImg) {
        p5SymptomRock.src = q.symptomImg;
        p5SymptomRock.alt = q.symptom;
      }

      var placedPair = snap.selectedCauseId ? getPairById(snap.selectedCauseId) : null;
      if (placedPair) {
        p5DropPlaceholder.hidden = true;
        p5PlacedRock.hidden = false;
        p5PlacedRock.src = placedPair.causeImg;
        p5PlacedRock.alt = placedPair.cause;
      } else {
        p5DropPlaceholder.hidden = false;
        p5PlacedRock.hidden = true;
      }

      // Mascot & See-Saw Beam Tilt
      var mascotSrc = Config.images.mascotIdle;
      var beamTilt = 'left';
      if (snap.page === 'page-6') {
        mascotSrc = Config.images.mascotCorrect;
        beamTilt = 'balanced';
      } else if (snap.page === 'page-7' || snap.page === 'page-12') {
        mascotSrc = Config.images.mascotWrong;
        beamTilt = 'wrong';
      } else if (snap.page === 'page-8') {
        mascotSrc = Config.images.mascotTimeUp;
        beamTilt = 'left';
      }
      if (beamTilt !== 'wrong') p5MascotImg.style.visibility = '';
      if (mascotSrc === Config.images.mascotIdle) {
        if (p5MascotImg.getAttribute('data-mascot-mode') !== 'idle') {
          p5MascotImg.setAttribute('data-mascot-mode', 'idle');
          p5MascotImg.src = mascotSrc;
        }
      } else {
        var modeKey = snap.page + '_' + snap.questionNumber;
        if (p5MascotImg.getAttribute('data-mascot-mode') !== modeKey) {
          p5MascotImg.setAttribute('data-mascot-mode', modeKey);
          p5MascotImg.src = mascotSrc + '?play=' + modeKey + '_' + Date.now();
        }
      }
      function applyBeamMotion() {
        seesawBeam.setAttribute('data-tilt', beamTilt);
        if (p5MascotWrap) p5MascotWrap.setAttribute('data-mode', beamTilt);
      }
      if (beamTilt === 'wrong') {
        var reactionSrc = p5MascotImg.src;
        p5MascotImg.style.visibility = 'hidden';
        var decoded = typeof p5MascotImg.decode === 'function' ? p5MascotImg.decode() : new Promise(function (resolve) {
          if (p5MascotImg.complete) resolve();
          else p5MascotImg.addEventListener('load', resolve, { once: true });
        });
        decoded.catch(function () {}).then(function () {
          requestAnimationFrame(function () {
            if (p5MascotImg.src !== reactionSrc || controller.getSnapshot().page !== snap.page) return;
            p5MascotImg.style.visibility = '';
            if (p5MascotImg.getAttribute('data-reaction-played') !== reactionSrc) {
              p5MascotImg.setAttribute('data-reaction-played', reactionSrc);
              AudioCtrl.playWrong();
            }
            applyBeamMotion();
          });
        });
      } else {
        applyBeamMotion();
      }

      // Show/Hide Tray vs Outcome Layers (remove back answers and answer tray on outcome popups)
      p5TrayArea.hidden = snap.page !== 'page-5';
      p5TrayArea.classList.toggle('is-inert', snap.page !== 'page-5');
      popupCorrect.hidden = snap.page !== 'page-6';
      popupWrong.hidden = snap.page !== 'page-7';
      popupTimeUp.hidden = snap.page !== 'page-8';
      popupTooSlow.hidden = snap.page !== 'page-12';
      modalPage9.hidden = snap.page !== 'page-9';

      if (snap.page === 'page-5' && lastRenderedPage !== 'page-5') {
        startQuestionTimer();
      } else if (snap.page !== 'page-5') {
        stopQuestionTimer();
      }

      if (snap.page === 'page-6' && snap.outcome) {
        p6TimeValue.textContent = Core.formatSecondsDecimal(snap.outcome.elapsedMs);
        var earnedStreak = snap.outcome.streak || 1;
        p6StreakDots.forEach(function (dot, idx) {
          var isEarned = idx < earnedStreak;
          dot.classList.toggle('is-earned', isEarned);
          dot.classList.toggle('is-newly-earned', idx === earnedStreak - 1);
        });
        spawnCelebrationConfetti();
        correctAutoAdvanceTimer = setTimeout(function () {
          advanceAfterCorrectImmediately();
        }, Config.correctHoldMs || 3800);
      } else if (snap.page !== 'page-6') {
        clearCelebrationConfetti();
      }

      if (snap.page === 'page-8') {
        updateTimerDisplay(0);
      }

      if (snap.page === 'page-12' && snap.outcome) {
        p12YourTime.textContent = Core.formatSecondsDecimal(snap.outcome.elapsedMs);
        p12TargetTime.textContent = Core.formatSecondsDecimal(snap.outcome.timeToBeatMs);
      }

      if (snap.page === 'page-9') {
        p9SymptomPill.textContent = q.symptom;
        p9TryAgainBtn.disabled = !snap.remediationVideoDone;
        var remKey = q.id;
        if (lastRemediationVideoKey !== remKey) {
          lastRemediationVideoKey = remKey;
          VideoCtrl.mountVideo(p9VideoHost, q, {
            allowControls: false,
            onComplete: function () {
              render(controller.completeRemediationVideo());
            }
          });
        }
      }
    } else {
      stopQuestionTimer();
    }

    // PAGE 10: New Star!
    if (snap.page === 'page-10') {
      var summary = snap.lastStarSummary || {};
      var earnedNewStar = Boolean(summary.newlyEarnedStar);
      pages['page-10'].classList.toggle('is-practice-result', !earnedNewStar);
      pages['page-10'].querySelector('.ss-bg-img').src = earnedNewStar ? Config.images.page10Bg : Config.images.roundCompleteBg;
      document.getElementById('p10-well-played').hidden = earnedNewStar;
      pages['page-10'].querySelector('.ss-p10-star-wrap').hidden = !earnedNewStar;
      p10ThisRound.textContent = Core.formatSecondsDecimal(summary.thisRoundAverageMs);
      p10PrevBest.textContent = Core.formatSecondsDecimal(summary.previousBestAverageMs);
    }

    // PAGE 11: Star Earned
    if (snap.page === 'page-11') {
      var earnedCount = (snap.progress && snap.progress.stars) || 1;
      var maxStars = Config.maxStars || 5;
      p11Stars.forEach(function (starImg, idx) {
        starImg.classList.toggle('is-unearned', idx >= earnedCount);
      });
      p11StarsText.textContent = earnedCount + ' of ' + maxStars + ' stars earned';
    }

    // PAGE 13: Watch Videos
    if (snap.page === 'page-13') {
      var activePair = snap.watchVideosActivePair;
      p13VideoModal.hidden = !activePair;
      if (activePair) {
        p13ModalTitle.textContent = activePair.symptom;
        p13SymptomPill.textContent = activePair.symptom + ' → ' + activePair.cause;
        if (lastWatchModalPairId !== activePair.id) {
          lastWatchModalPairId = activePair.id;
          VideoCtrl.mountVideo(p13VideoHost, activePair, {
            allowControls: true
          });
        }
      }
    }

    lastRenderedPage = snap.page;
  }

  function bindEvents() {
    root.addEventListener('resize', checkOrientationAndVisibility);
    root.addEventListener('orientationchange', checkOrientationAndVisibility);
    document.addEventListener('visibilitychange', checkOrientationAndVisibility);

    preloadRetryBtn.addEventListener('click', function () {
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      runPreloadGate();
    });

    page1NextBtn.addEventListener('click', function () {
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      render(controller.handlePage1Next());
    });

    demoNextBtn.addEventListener('click', function () {
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      render(controller.handleDemoNext());
    });

    p3NextBtn.addEventListener('click', function () {
      if (p3NextBtn.disabled) return;
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      render(controller.handleOnboardingNext());
    });

    p4StartBtn.addEventListener('click', function () {
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      render(controller.startRound());
    });

    p4WatchVideosBtn.addEventListener('click', function () {
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      render(controller.openWatchVideosPage());
    });

    p4DemoBtn.addEventListener('click', function () {
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      render(controller.openDemoFromHome());
    });

    function onWatchAndTryAgain() {
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      render(controller.openRemediationVideo());
    }

    popupCorrect.addEventListener('click', function () {
      advanceAfterCorrectImmediately();
    });

    p7WatchBtn.addEventListener('click', onWatchAndTryAgain);
    p8WatchBtn.addEventListener('click', onWatchAndTryAgain);
    p12WatchBtn.addEventListener('click', onWatchAndTryAgain);

    p9TryAgainBtn.addEventListener('click', function () {
      if (p9TryAgainBtn.disabled) return;
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      render(controller.retryCurrentQuestion());
    });

    p10ContinueBtn.addEventListener('click', function () {
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      render(controller.proceedFromNewStarToStarEarned());
    });

    p11PlayAgainBtn.addEventListener('click', function () {
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      render(controller.startRound());
    });

    p13HomeBtn.addEventListener('click', function () {
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      render(controller.goToHome());
    });

    p13CloseModalBtn.addEventListener('click', function () {
      AudioCtrl.unlock();
      AudioCtrl.playClick();
      render(controller.closeWatchVideoModal());
    });
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && root.location && /^https?:$/i.test(root.location.protocol)) {
      navigator.serviceWorker.register('./sw.js?v=2').catch(function () {});
    }
  }

  function init() {
    setupCloseLink();
    buildTrayOptions();
    buildWatchVideosList();
    bindEvents();
    checkOrientationAndVisibility();
    render(controller.getSnapshot());
    runPreloadGate();
    registerServiceWorker();
  }

  root.SeeSawApp = {
    getController: function () {
      return controller;
    },
    getState: function () {
      return controller.getSnapshot();
    },
    render: function () {
      render(controller.getSnapshot());
    },
    submitAnswerWithTime: function (causeId, elapsedMs) {
      stopQuestionTimer();
      var snap = controller.submitAnswer(causeId, elapsedMs);
      render(snap);
      return snap;
    },
    forceCompleteCurrentVideo: function () {
      var snap = controller.getSnapshot();
      if (snap.page === 'page-3') {
        return render(controller.completeOnboardingVideo());
      }
      if (snap.page === 'page-9') {
        return render(controller.completeRemediationVideo());
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);

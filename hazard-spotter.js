/**
 * Find the Mistake - Main Game Controller
 * Video-specific Grid Configuration, Answer Confirmation, In-Place Result Revelation,
 * Dev Mode, Fullscreen / Immersive Mobile Mode, PWA Install Flow & Install Guide Modal.
 */

class FindTheMistakeGame {
  constructor() {
    this.levels = [];
    this.currentLevelIndex = 0;
    this.gameState = 'LANDING'; // LANDING, PLAYING_PRE_PAUSE, WAITING_USER_INPUT, ANSWER_REVEALED, PLAYING_POST_PAUSE, SHOWING_RESULT
    this.hasPausedForQuestion = false;
    this.selectedGridNumber = null;
    this.tentativeSelection = null;
    this.animFrameId = null;
    this.deferredPrompt = null;
    this.resumePlaybackTimer = null;
    this.isPseudoFullscreen = false;
    this.countdownInterval = null;
    this.countdownDuration = 7;
    this.isTimerPaused = false;
    this.isTutorial = false;
    this.demoStartDelayTimer = null;
    this.demoIntroTimer = null;

    // Dedicated Interactive Demo Scenario (Dynamically inherits from Scenario 01 in levels.json)
    this.demoLevel = {
      id: 'demo',
      title: "Tutorial: Practice Demo",
      videoSrc: "videos/case-01.webm",
      pauseSecond: 5.0,
      rows: 3,
      cols: 3,
      correctGrid: 8,
      hint: "Look closely at the test tubes for signs of contamination.",
      explanation: "A contaminated test tube was spotted in the rack. It should be isolated and replaced with a clean tube before use."
    };

    // DOM Elements
    this.landingView = document.getElementById('landingView');
    this.gameViewport = document.getElementById('gameViewport');
    this.video = document.getElementById('gameVideo');
    this.gridOverlay = document.getElementById('gridOverlay');
    this.actionPromptBanner = document.getElementById('actionPromptBanner');
    this.selectionConfirmBanner = document.getElementById('selectionConfirmBanner');
    this.retouchBtn = document.getElementById('retouchBtn');
    this.confirmLockBtn = document.getElementById('confirmLockBtn');
    this.bottomExplanationBanner = document.getElementById('bottomExplanationBanner');
    this.bottomExplanationText = document.getElementById('bottomExplanationText');
    this.resultScreen = document.getElementById('resultScreen');
    this.toast = document.getElementById('toast');
    this.currentScenarioBadge = document.getElementById('currentScenarioBadge');
    this.installGuideModal = document.getElementById('installGuideModal');
    this.tutorialGuideBanner = document.getElementById('tutorialGuideBanner');
    this.tutorialGuideMsg = document.getElementById('tutorialGuideMsg');
    this.tutorialPointer = document.getElementById('tutorialPointer');
    this.tutorialGraduationModal = document.getElementById('tutorialGraduationModal');
    this.demoIntroOverlay = document.getElementById('demoIntroOverlay');

    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadLevels();
    this.renderLandingSettings();
    this.updateScenarioBadge();
    this.applyDevModeState();
    this.checkStandaloneMode();
    this.updateFullscreenUI();
    this.registerServiceWorker();
  }

  checkStandaloneMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');
    const standaloneBadge = document.getElementById('standaloneBadge');
    const installPwaBtn = document.getElementById('installPwaBtn');
    if (isStandalone) {
      if (standaloneBadge) standaloneBadge.style.display = 'inline-block';
      if (installPwaBtn) installPwaBtn.style.display = 'none';
    }
  }

  applyDevModeState() {
    document.body.classList.toggle('dev-mode-active', window.gameSettings.devMode);
  }

  /* ==========================================================================
     Level Data Management
     ========================================================================== */
  async loadLevels() {
    if (!this.levels || this.levels.length === 0) {
      this.levels = [
        {
          id: 1,
          title: "Scenario 01: Contaminated Test Tube",
          videoSrc: "videos/case-01.webm",
          pauseSecond: 5.0,
          rows: 3,
          cols: 3,
          correctGrid: 8,
          hint: "Look closely at the test tubes for signs of contamination.",
          explanation: "A contaminated test tube was spotted in the rack. It should be isolated and replaced with a clean tube before use."
        }
      ];
    }
    document.getElementById('startPlayBtn').disabled = false;
  }

  get currentLevel() {
    if (this.isTutorial) {
      const scenarioOne = this.levels && this.levels.length > 0 ? this.levels[0] : null;
      if (scenarioOne) {
        return {
          id: 'demo',
          title: "Tutorial: Practice Demo",
          videoSrc: scenarioOne.videoSrc || this.demoLevel.videoSrc,
          pauseSecond: scenarioOne.pauseSecond !== undefined ? scenarioOne.pauseSecond : this.demoLevel.pauseSecond,
          rows: scenarioOne.rows || this.demoLevel.rows,
          cols: scenarioOne.cols || this.demoLevel.cols,
          correctGrid: scenarioOne.correctGrid !== undefined ? scenarioOne.correctGrid : this.demoLevel.correctGrid,
          hint: scenarioOne.hint || this.demoLevel.hint,
          explanation: scenarioOne.explanation || this.demoLevel.explanation
        };
      }
      return this.demoLevel;
    }
    return this.levels[this.currentLevelIndex] || this.levels[0];
  }

  get currentRows() {
    return parseInt(this.currentLevel.rows, 10) || 3;
  }

  get currentCols() {
    return parseInt(this.currentLevel.cols, 10) || 3;
  }

  getVideoUrl(src) {
    if (!src) return '';
    const version = window.GAME_VERSION || Date.now();
    const cleanSrc = src.split('?')[0];
    return `assets/hazard-spotter-game-assets/${cleanSrc}`;
  }

  updateScenarioBadge() {
    if (this.currentScenarioBadge) {
      if (this.isTutorial) {
        this.currentScenarioBadge.textContent = 'Tutorial Demo';
      } else {
        const num = String(this.currentLevelIndex + 1).padStart(2, '0');
        this.currentScenarioBadge.textContent = `Scenario ${num}`;
      }
    }
  }

  /* ==========================================================================
     Interactive Grid Generation (Video-Based Rows x Columns)
     ========================================================================== */
  buildInteractiveGrid() {
    const rows = this.currentRows;
    const cols = this.currentCols;

    this.gridOverlay.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    this.gridOverlay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    this.gridOverlay.innerHTML = '';

    const total = rows * cols;
    for (let i = 1; i <= total; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.gridIndex = i;
      const numberBadge = document.createElement('span');
      numberBadge.className = 'cell-number-badge';
      numberBadge.textContent = String(i);
      cell.appendChild(numberBadge);

      let triggered = false;
      const doSelect = (e) => {
        if (triggered) return;
        triggered = true;
        setTimeout(() => { triggered = false; }, 300);
        this.handleGridCellSelect(i, cell);
      };

      cell.addEventListener('click', doSelect);
      cell.addEventListener('touchend', doSelect, { passive: true });
      this.gridOverlay.appendChild(cell);
    }
  }

  setTutorialGuide(msg) {
    if (this.tutorialGuideMsg) {
      this.tutorialGuideMsg.textContent = msg || '';
    }
    if (this.tutorialGuideBanner) {
      if (msg) {
        this.tutorialGuideBanner.classList.add('active');
      } else {
        this.tutorialGuideBanner.classList.remove('active');
      }
    }
  }

  positionPointerOnElement(element, labelText = 'Tap Here') {
    const pointer = this.tutorialPointer || document.getElementById('tutorialPointer');
    const label = document.getElementById('tutorialPointerLabel');
    if (!pointer || !element) return;

    const container = document.querySelector('.video-canvas-container') || this.gameViewport;
    const containerRect = container.getBoundingClientRect();
    const elRect = element.getBoundingClientRect();

    const left = elRect.left - containerRect.left + elRect.width / 2;
    const top = elRect.top - containerRect.top + elRect.height / 2;

    pointer.style.left = `${left}px`;
    pointer.style.top = `${top}px`;
    if (label) label.textContent = labelText;
    pointer.classList.add('active');
  }

  hideTutorialPointer() {
    const pointer = this.tutorialPointer || document.getElementById('tutorialPointer');
    if (pointer) pointer.classList.remove('active');
  }

  showDemoIntro(onComplete) {
    this.hideDemoIntro();
    const overlay = this.demoIntroOverlay || document.getElementById('demoIntroOverlay');
    if (!overlay) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    // Activate full pitch-black intro overlay with center DEMO MODE text
    document.body.classList.add('demo-intro-active');
    overlay.classList.remove('fading-out');
    overlay.classList.add('active');

    // Display for 2 seconds, then smoothly fade out
    this.demoIntroTimer = setTimeout(() => {
      overlay.classList.add('fading-out');

      this.demoIntroTimer = setTimeout(() => {
        overlay.classList.remove('active', 'fading-out');
        document.body.classList.remove('demo-intro-active');
        this.demoIntroTimer = null;
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 500);
    }, 2000);
  }

  hideDemoIntro() {
    if (this.demoIntroTimer) {
      clearTimeout(this.demoIntroTimer);
      this.demoIntroTimer = null;
    }
    document.body.classList.remove('demo-intro-active');
    const overlay = this.demoIntroOverlay || document.getElementById('demoIntroOverlay');
    if (overlay) {
      overlay.classList.remove('active', 'fading-out');
    }
  }

  skipTutorial() {
    window.gameSettings.playClick();
    this.hideDemoIntro();
    if (this.demoStartDelayTimer) {
      clearTimeout(this.demoStartDelayTimer);
      this.demoStartDelayTimer = null;
    }
    this.isTutorial = false;
    document.body.classList.remove('tutorial-mode-active');
    this.hideTutorialPointer();
    if (this.tutorialGraduationModal) this.tutorialGraduationModal.classList.remove('active');
    this.currentLevelIndex = 0;
    this.startChallenge(false);
  }

  showGrid() {
    this.gridOverlay.classList.add('active');
    this.actionPromptBanner.className = 'action-prompt-banner active';
    const icon = this.actionPromptBanner.querySelector('.prompt-icon');
    const text = this.actionPromptBanner.querySelector('.prompt-text');
    const timerPill = document.getElementById('promptTimerPill');
    if (icon) icon.textContent = '';
    if (text) text.textContent = '';

    if (this.isTutorial) {
      if (timerPill) timerPill.style.display = 'none';
      this.setTutorialGuide('Step 1: Tap the potential hazard area');
      const correctCell = this.gridOverlay.querySelector(`[data-grid-index="${this.currentLevel.correctGrid}"]`);
      if (correctCell) {
        correctCell.classList.add('tutorial-target-tile');
        setTimeout(() => {
          this.positionPointerOnElement(correctCell, 'Tap Here');
        }, 120);
      }
    } else {
      if (timerPill) timerPill.style.display = 'inline-flex';
    }
  }

  hideGrid() {
    this.stopCountdownTimer();
    this.gridOverlay.classList.remove('active', 'grid-locked');
    this.actionPromptBanner.className = 'action-prompt-banner';
    this.selectionConfirmBanner.classList.remove('active');
    this.gridOverlay.querySelectorAll('.grid-cell').forEach(c => {
      c.classList.remove('selected-user', 'cell-correct', 'cell-wrong', 'tutorial-target-tile');
    });
    this.hideTutorialPointer();
    const icon = this.actionPromptBanner.querySelector('.prompt-icon');
    const text = this.actionPromptBanner.querySelector('.prompt-text');
    if (icon) icon.textContent = '';
    if (text) text.textContent = '';
  }

  /* ==========================================================================
     Countdown Timer (7 Seconds Response Limit)
     ========================================================================== */
  startCountdownTimer() {
    this.stopCountdownTimer();

    const timerPill = document.getElementById('promptTimerPill');
    const timerVal = document.getElementById('timerCountdownVal');
    const ringProgress = document.getElementById('timerRingProgress');
    const circumference = 56.55; // 2 * PI * 9

    if (timerPill) {
      timerPill.style.display = this.isTutorial ? 'none' : 'inline-flex';
      timerPill.classList.remove('urgent', 'paused');
    }
    if (timerVal) timerVal.textContent = '7s';
    if (ringProgress) {
      ringProgress.style.strokeDasharray = `${circumference}`;
      ringProgress.style.strokeDashoffset = '0';
    }

    this.countdownDuration = 7.0;
    this.remainingTime = 7.0;
    this.lastTickSecond = null;
    this.isTimerPaused = false;

    if (!this.isTutorial) {
      this.runCountdownInterval();
    }
  }

  runCountdownInterval() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    const timerPill = document.getElementById('promptTimerPill');
    const timerVal = document.getElementById('timerCountdownVal');
    const ringProgress = document.getElementById('timerRingProgress');
    const circumference = 56.55;
    const totalDurationMs = this.countdownDuration * 1000;
    const startTime = Date.now();
    const startRemainingMs = this.remainingTime * 1000;

    this.countdownInterval = setInterval(() => {
      if (this.gameState !== 'WAITING_USER_INPUT' || this.isTimerPaused) {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        return;
      }

      const elapsed = Date.now() - startTime;
      const remainingMs = Math.max(0, startRemainingMs - elapsed);
      const remainingSec = remainingMs / 1000;
      this.remainingTime = remainingSec;

      const ceilSec = Math.ceil(remainingSec);
      if (ceilSec > 0 && ceilSec !== this.lastTickSecond) {
        this.lastTickSecond = ceilSec;
        const isUrgent = ceilSec <= 3;
        window.gameSettings.playTick(isUrgent);
      }

      if (timerVal) {
        timerVal.textContent = `${Math.ceil(remainingSec)}s`;
      }

      if (ringProgress) {
        const progressRatio = (totalDurationMs - remainingMs) / totalDurationMs;
        ringProgress.style.strokeDashoffset = `${circumference * progressRatio}`;
      }

      if (remainingSec <= 3.0 && timerPill) {
        timerPill.classList.add('urgent');
      }

      if (remainingMs <= 0) {
        this.stopCountdownTimer();
        this.triggerTimesUp();
      }
    }, 40);
  }

  pauseCountdownTimer() {
    this.isTimerPaused = true;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    const timerPill = document.getElementById('promptTimerPill');
    if (timerPill) {
      timerPill.classList.add('paused');
    }
  }

  resumeCountdownTimer() {
    if (this.gameState !== 'WAITING_USER_INPUT' || this.remainingTime <= 0 || this.isTutorial) return;
    this.isTimerPaused = false;
    const timerPill = document.getElementById('promptTimerPill');
    if (timerPill) {
      timerPill.classList.remove('paused');
    }
    this.runCountdownInterval();
  }

  stopCountdownTimer() {
    this.isTimerPaused = false;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    const timerPill = document.getElementById('promptTimerPill');
    if (timerPill) {
      timerPill.classList.remove('urgent', 'paused');
    }
  }

  triggerTimesUp() {
    if (this.gameState !== 'WAITING_USER_INPUT') return;

    this.stopCountdownTimer();
    this.gameState = 'TIMES_UP';
    this.tentativeSelection = null;

    window.gameSettings.playTimeoutAlert();
    this.hideGrid();

    // Show top banner timeout feedback
    this.actionPromptBanner.className = 'action-prompt-banner active failure-feedback times-up-feedback';
    const icon = this.actionPromptBanner.querySelector('.prompt-icon');
    const text = this.actionPromptBanner.querySelector('.prompt-text');
    const timerPill = document.getElementById('promptTimerPill');
    if (icon) icon.textContent = '⏰';
    if (text) text.textContent = "Time's Up! You ran out of time.";
    if (timerPill) timerPill.style.display = 'none';

    // Do not show explanation on timeout
    this.bottomExplanationBanner.classList.remove('active');

    // Show HUD dock with Retry and Menu options
    this.showTimesUpHUD();
  }

  showTimesUpHUD() {
    const resultCard = document.getElementById('resultCard');
    const resultCardBadge = document.getElementById('resultCardBadge');
    const resultDesc = document.getElementById('resultDesc');
    const nextBtn = document.getElementById('nextLevelBtn');
    const replayBtn = document.getElementById('replayBtn');
    const returnToMenuBtn = document.getElementById('returnToMenuBtn');
    const hudScenarioTitle = document.getElementById('hudScenarioTitle');

    if (hudScenarioTitle) {
      const num = String(this.currentLevelIndex + 1).padStart(2, '0');
      hudScenarioTitle.textContent = `${this.currentLevel.title || 'Scenario ' + num}`;
    }

    if (resultCard) resultCard.className = 'hud-dock-content timeout';
    if (resultCardBadge) resultCardBadge.textContent = "⏰ Time's Up";
    if (resultDesc) {
      resultDesc.textContent = '';
      resultDesc.style.display = 'none';
    }

    if (replayBtn) {
      replayBtn.className = 'hud-btn hud-btn-primary';
      replayBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg> <span>Retry Scenario</span>`;
      replayBtn.style.display = 'inline-flex';
    }

    if (nextBtn) {
      nextBtn.style.display = 'none';
    }

    if (returnToMenuBtn) {
      returnToMenuBtn.style.display = 'inline-flex';
    }

    this.resultScreen.classList.add('timeout-hud');
    this.resultScreen.classList.add('active');
  }

  /* ==========================================================================
     Seamless Game Transitions (Landing -> Gameplay -> Results)
     ========================================================================== */
  startChallenge(isTutorialMode = false) {
    this.isTutorial = Boolean(isTutorialMode);

    const level = this.currentLevel;
    this.stopCountdownTimer();
    if (this.resumePlaybackTimer) {
      clearTimeout(this.resumePlaybackTimer);
      this.resumePlaybackTimer = null;
    }
    this.hasPausedForQuestion = false;
    this.selectedGridNumber = null;
    this.tentativeSelection = null;
    this.gameState = 'PLAYING_PRE_PAUSE';
    this.applyDevModeState();
    this.updateScenarioBadge();

    if (this.isTutorial) {
      document.body.classList.add('tutorial-mode-active');
      this.setTutorialGuide('');
      this.hideTutorialPointer();
      if (this.tutorialGraduationModal) this.tutorialGraduationModal.classList.remove('active');
    } else {
      document.body.classList.remove('tutorial-mode-active');
      this.setTutorialGuide('');
      this.hideTutorialPointer();
      if (this.tutorialGraduationModal) this.tutorialGraduationModal.classList.remove('active');
    }

    // Hide landing hub and banners, activate game viewport
    this.landingView.classList.add('hidden');
    this.gameViewport.classList.add('active');
    this.resultScreen.classList.remove('active');
    this.resultScreen.classList.remove('timeout-hud');
    this.bottomExplanationBanner.classList.remove('active');
    this.hideGrid();

    // Prepare video & interactive grid
    this.buildInteractiveGrid();
    this.video.src = this.getVideoUrl(level.videoSrc);
    this.video.currentTime = 0;
    this.video.volume = 1.0; // Video audio at 100% full priority
    this.video.load();

    window.gameSettings.playClick();
    window.gameSettings.duckBGM(true); // Duck BGM so video audio is clear and prominent

    if (this.demoStartDelayTimer) {
      clearTimeout(this.demoStartDelayTimer);
      this.demoStartDelayTimer = null;
    }
    this.hideDemoIntro();

    const beginPlayback = () => {
      if (this.gameState !== 'PLAYING_PRE_PAUSE') return;
      const playPromise = this.video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Auto-play gesture requirement:', err);
        });
      }
      this.startPlaybackMonitor();
    };

    if (this.isTutorial) {
      // Show full black intro screen with 'DEMO MODE' text for a few seconds before playing
      this.showDemoIntro(() => {
        beginPlayback();
      });
    } else {
      beginPlayback();
    }
  }

  startPlaybackMonitor() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    const checkTimestamp = () => {
      if (this.gameState === 'PLAYING_PRE_PAUSE' && !this.hasPausedForQuestion) {
        const pauseTime = this.currentLevel.pauseSecond;
        if (this.video.currentTime >= pauseTime) {
          this.triggerPauseCheckpoint();
          return;
        }
      }

      if (!this.video.paused && !this.video.ended) {
        this.animFrameId = requestAnimationFrame(checkTimestamp);
      }
    };

    this.animFrameId = requestAnimationFrame(checkTimestamp);
  }

  triggerPauseCheckpoint() {
    this.hasPausedForQuestion = true;
    this.video.pause();
    this.gameState = 'WAITING_USER_INPUT';
    this.tentativeSelection = null;

    window.gameSettings.duckBGM(false); // Restore ambient BGM while user contemplates choice
    window.gameSettings.playPauseAlert();
    this.showGrid();
    this.startCountdownTimer();
  }

  /* ==========================================================================
     Cell Selection & Confirmation Flow
     ========================================================================== */
  handleGridCellSelect(gridNumber, cellElement) {
    if (this.gameState !== 'WAITING_USER_INPUT') return;

    // Lock out taps on any other cell while confirmation is pending
    if (this.tentativeSelection) return;

    this.tentativeSelection = { gridNumber, cellElement };
    window.gameSettings.playClick();

    // Mark selected area and lock grid interaction
    this.gridOverlay.querySelectorAll('.grid-cell').forEach(c => {
      c.classList.remove('selected-user', 'tutorial-target-tile');
    });
    cellElement.classList.add('selected-user');
    this.gridOverlay.classList.add('grid-locked');

    // Show answer confirmation banner
    const confirmText = this.selectionConfirmBanner.querySelector('.confirm-text');
    if (confirmText) {
      confirmText.textContent = 'Lock in this area as your answer?';
    }
    this.selectionConfirmBanner.classList.add('active');

    if (this.isTutorial) {
      this.setTutorialGuide('Step 2: Tap Confirm to lock in your answer');
      setTimeout(() => {
        this.positionPointerOnElement(this.confirmLockBtn, 'Confirm & Lock');
      }, 100);
    }
  }

  cancelSelection() {
    window.gameSettings.playClick();
    this.selectionConfirmBanner.classList.remove('active');
    this.gridOverlay.classList.remove('grid-locked');
    this.gridOverlay.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('selected-user'));
    this.tentativeSelection = null;

    if (this.isTutorial) {
      this.setTutorialGuide('Step 1: Tap the potential hazard area');
      const correctCell = this.gridOverlay.querySelector(`[data-grid-index="${this.currentLevel.correctGrid}"]`);
      if (correctCell) {
        correctCell.classList.add('tutorial-target-tile');
        setTimeout(() => {
          this.positionPointerOnElement(correctCell, 'Tap Here');
        }, 100);
      }
    }
  }

  confirmAndLockAnswer() {
    if (!this.tentativeSelection || this.gameState !== 'WAITING_USER_INPUT') return;

    this.stopCountdownTimer();

    const chosenGrid = this.tentativeSelection.gridNumber;
    const correctGrid = this.currentLevel.correctGrid;
    this.selectedGridNumber = chosenGrid;
    this.gameState = 'ANSWER_REVEALED';

    window.gameSettings.playClick();
    this.selectionConfirmBanner.classList.remove('active');
    this.gridOverlay.classList.remove('grid-locked');
    this.hideTutorialPointer();

    if (this.isTutorial) {
      this.setTutorialGuide('Step 3: Watch the hazard unfold!');
    }

    // In-place answer feedback on grid tiles
    const isCorrect = chosenGrid === correctGrid;

    // Display immediate outcome banner at top
    const timerPill = document.getElementById('promptTimerPill');
    if (timerPill) timerPill.style.display = 'none';

    if (isCorrect) {
      this.actionPromptBanner.className = 'action-prompt-banner active success-feedback';
      const icon = this.actionPromptBanner.querySelector('.prompt-icon');
      const text = this.actionPromptBanner.querySelector('.prompt-text');
      if (icon) icon.textContent = '✅';
      if (text) text.textContent = 'Hazard Spotted!';
      window.gameSettings.playSuccess();
    } else {
      this.actionPromptBanner.className = 'action-prompt-banner active failure-feedback';
      const icon = this.actionPromptBanner.querySelector('.prompt-icon');
      const text = this.actionPromptBanner.querySelector('.prompt-text');
      if (icon) icon.textContent = '❌';
      if (text) text.textContent = 'Hazard Missed!';
      window.gameSettings.playFailure();
    }

    // Highlight user selection and correct grid
    const userCell = this.gridOverlay.querySelector(`[data-grid-index="${chosenGrid}"]`);
    const correctCell = this.gridOverlay.querySelector(`[data-grid-index="${correctGrid}"]`);

    if (isCorrect) {
      if (userCell) userCell.classList.add('cell-correct');
    } else {
      if (userCell) userCell.classList.add('cell-wrong');
      if (correctCell) correctCell.classList.add('cell-correct');
    }

    // Show bottom explanation banner
    if (this.bottomExplanationText) {
      this.bottomExplanationText.textContent = `Hint: ${this.currentLevel.hint || 'Check the test tubes carefully.'}`;
    }
    this.bottomExplanationBanner.classList.add('active');

    // Show answer feedback & highlights while paused for 2.2 seconds, then hide grid and resume video cleanly
    if (this.resumePlaybackTimer) clearTimeout(this.resumePlaybackTimer);
    this.resumePlaybackTimer = setTimeout(() => {
      if (this.gameState === 'ANSWER_REVEALED') {
        this.hideGrid();
        this.bottomExplanationBanner.classList.remove('active');
        this.gameState = 'PLAYING_POST_PAUSE';
        window.gameSettings.duckBGM(true);
        this.video.play().catch(e => console.warn('Resume video:', e));
      }
    }, 2200);
  }

  handleVideoEnded() {
    this.stopCountdownTimer();
    if (this.resumePlaybackTimer) {
      clearTimeout(this.resumePlaybackTimer);
      this.resumePlaybackTimer = null;
    }

    if (this.isTutorial) {
      this.gameState = 'TUTORIAL_COMPLETED';
      window.gameSettings.duckBGM(false);
      this.hideGrid();
      this.bottomExplanationBanner.classList.remove('active');
      this.hideTutorialPointer();
      const gradModal = this.tutorialGraduationModal || document.getElementById('tutorialGraduationModal');
      if (gradModal) {
        gradModal.classList.add('active');
        window.gameSettings.playSuccess();
      }
      return;
    }

    this.gameState = 'SHOWING_RESULT';
    window.gameSettings.duckBGM(false);
    this.hideGrid();
    this.bottomExplanationBanner.classList.remove('active');
    this.showInVideoResultHUD();
  }

  /* ==========================================================================
     In-Video Lower-Third Result HUD
     ========================================================================== */
  showInVideoResultHUD() {
    const isCorrect = this.selectedGridNumber === this.currentLevel.correctGrid;
    const resultCard = document.getElementById('resultCard');
    const resultCardBadge = document.getElementById('resultCardBadge');
    const resultDesc = document.getElementById('resultDesc');
    const nextBtn = document.getElementById('nextLevelBtn');
    const replayBtn = document.getElementById('replayBtn');
    const returnToMenuBtn = document.getElementById('returnToMenuBtn');
    const hudScenarioTitle = document.getElementById('hudScenarioTitle');

    if (hudScenarioTitle) {
      const num = String(this.currentLevelIndex + 1).padStart(2, '0');
      hudScenarioTitle.textContent = `${this.currentLevel.title || 'Scenario ' + num}`;
    }

    if (isCorrect) {
      if (resultCard) resultCard.className = 'hud-dock-content success';
      if (resultCardBadge) resultCardBadge.textContent = '✅ Hazard Spotted';
    } else {
      if (resultCard) resultCard.className = 'hud-dock-content failure';
      if (resultCardBadge) resultCardBadge.textContent = '⚠️ Hazard Missed';
    }

    if (resultDesc) {
      resultDesc.style.display = 'block';
      resultDesc.textContent = this.currentLevel.explanation || 'Review the scenario to observe the hazard.';
    }

    if (replayBtn) {
      replayBtn.className = 'hud-btn hud-btn-secondary';
      replayBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg> <span>Replay</span>`;
      replayBtn.style.display = 'inline-flex';
    }

    if (returnToMenuBtn) {
      returnToMenuBtn.style.display = 'inline-flex';
    }

    if (nextBtn) {
      nextBtn.style.display = 'inline-flex';
      if (this.currentLevelIndex < this.levels.length - 1) {
        nextBtn.innerHTML = `<span>Next Scenario</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg>`;
      } else {
        nextBtn.innerHTML = `<span>Restart from #1</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`;
      }
    }

    this.resultScreen.classList.remove('timeout-hud');
    this.resultScreen.classList.add('active');
  }

  returnToLandingMenu() {
    this.stopCountdownTimer();
    if (this.resumePlaybackTimer) {
      clearTimeout(this.resumePlaybackTimer);
      this.resumePlaybackTimer = null;
    }
    if (this.demoStartDelayTimer) {
      clearTimeout(this.demoStartDelayTimer);
      this.demoStartDelayTimer = null;
    }
    this.hideDemoIntro();
    this.isTutorial = false;
    document.body.classList.remove('tutorial-mode-active');
    this.hideTutorialPointer();
    if (this.tutorialGraduationModal) {
      this.tutorialGraduationModal.classList.remove('active');
    }
    window.gameSettings.playClick();
    window.gameSettings.duckBGM(false);
    this.video.pause();
    this.resultScreen.classList.remove('active');
    this.resultScreen.classList.remove('timeout-hud');
    this.gameViewport.classList.remove('active');
    this.selectionConfirmBanner.classList.remove('active');
    this.bottomExplanationBanner.classList.remove('active');
    this.landingView.classList.remove('hidden');
    this.updateScenarioBadge();
    this.renderLandingSettings();
    this.updateFullscreenUI();
    this.gameState = 'LANDING';
  }

  replayCurrentScenario() {
    this.stopCountdownTimer();
    window.gameSettings.playClick();
    this.startChallenge(this.isTutorial);
  }

  goToNextScenario() {
    this.stopCountdownTimer();
    window.gameSettings.playClick();
    this.isTutorial = false;
    if (this.currentLevelIndex < this.levels.length - 1) {
      this.currentLevelIndex++;
    } else {
      this.currentLevelIndex = 0;
    }
    this.updateScenarioBadge();
    this.renderLandingSettings();
    this.startChallenge(false);
  }

  /* ==========================================================================
     Fullscreen / Immersive Mode Helpers
     ========================================================================== */
  isIOSDevice() {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }

  isFullscreenActive() {
    const isStandalone = (window.navigator.standalone === true) ||
      window.matchMedia('(display-mode: standalone)').matches;
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      this.isPseudoFullscreen ||
      isStandalone
    );
  }

  updateFullscreenUI() {
    const isFullscreen = this.isFullscreenActive();
    const fullscreenToggleBtn = document.getElementById('fullscreenToggleBtn');
    const stageFullscreenBtn = document.getElementById('stageFullscreenBtn');

    const expandSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
    const compressSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;

    if (fullscreenToggleBtn) {
      if (isFullscreen) {
        fullscreenToggleBtn.classList.remove('highlight-fullscreen-prompt');
        fullscreenToggleBtn.classList.add('is-fullscreen');
        fullscreenToggleBtn.innerHTML = `${compressSvg}<span class="btn-text">Exit Fullscreen</span>`;
        fullscreenToggleBtn.setAttribute('title', 'Exit Fullscreen Mode');
      } else {
        fullscreenToggleBtn.classList.add('highlight-fullscreen-prompt');
        fullscreenToggleBtn.classList.remove('is-fullscreen');
        fullscreenToggleBtn.innerHTML = `${expandSvg}<span class="btn-text">Fullscreen</span>`;
        fullscreenToggleBtn.setAttribute('title', 'Go Fullscreen (Recommended)');
      }
    }

    if (stageFullscreenBtn) {
      stageFullscreenBtn.classList.toggle('active', isFullscreen);
      stageFullscreenBtn.innerHTML = isFullscreen
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
      stageFullscreenBtn.setAttribute('title', isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen');
    }
  }

  toggleFullscreen() {
    window.gameSettings?.playClick();
    if (!this.isFullscreenActive()) {
      this.requestFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  requestFullscreen() {
    const docEl = document.documentElement;
    const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
    if (req) {
      const res = req.call(docEl);
      if (res && typeof res.then === 'function') {
        res.then(() => this.updateFullscreenUI()).catch(() => {
          this.enterPseudoFullscreen();
        });
      } else {
        setTimeout(() => this.updateFullscreenUI(), 100);
      }
    } else {
      // Fallback for iOS iPhone Safari and browsers lacking HTML5 Fullscreen API
      this.enterPseudoFullscreen();
    }
  }

  enterPseudoFullscreen() {
    this.isPseudoFullscreen = true;
    document.documentElement.classList.add('pseudo-fullscreen');
    document.body.classList.add('pseudo-fullscreen');
    window.scrollTo(0, 1);
    this.updateFullscreenUI();

    if (this.isIOSDevice() && !window.navigator.standalone) {
      this.showToast('Immersive Mode Active! 📲 Tip: Add to Home Screen for borderless app');
    } else {
      this.showToast('Immersive Window Mode Active');
    }
  }

  exitFullscreen() {
    if (this.isPseudoFullscreen) {
      this.isPseudoFullscreen = false;
      document.documentElement.classList.remove('pseudo-fullscreen');
      document.body.classList.remove('pseudo-fullscreen');
    }

    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (exit && (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)) {
      const res = exit.call(document);
      if (res && typeof res.then === 'function') {
        res.then(() => this.updateFullscreenUI()).catch(() => this.updateFullscreenUI());
      } else {
        setTimeout(() => this.updateFullscreenUI(), 100);
      }
    } else {
      this.updateFullscreenUI();
    }
  }

  /* ==========================================================================
     Install Guide Modal
     ========================================================================== */
  openInstallModal() {
    window.gameSettings?.playClick();
    if (this.installGuideModal) {
      this.installGuideModal.classList.add('active');
      // If user is on an iOS device, auto-switch to the iOS guide tab
      if (this.isIOSDevice()) {
        const tabIosBtn = document.getElementById('tabIosBtn');
        const tabAndroidBtn = document.getElementById('tabAndroidBtn');
        const tabPaneIos = document.getElementById('tabPaneIos');
        const tabPaneAndroid = document.getElementById('tabPaneAndroid');
        if (tabIosBtn && tabAndroidBtn && tabPaneIos && tabPaneAndroid) {
          tabIosBtn.classList.add('active');
          tabAndroidBtn.classList.remove('active');
          tabPaneIos.classList.add('active');
          tabPaneAndroid.classList.remove('active');
        }
      }
    }
  }

  closeInstallModal() {
    window.gameSettings?.playClick();
    if (this.installGuideModal) {
      this.installGuideModal.classList.remove('active');
    }
  }

  /* ==========================================================================
     Landing Settings & Audio Preferences
     ========================================================================== */
  renderLandingSettings() {
    const soundToggle = document.getElementById('soundToggle');
    const bgmToggle = document.getElementById('bgmToggle');
    const devModeToggle = document.getElementById('devModeToggle');
    const demoModeToggle = document.getElementById('demoModeToggle');
    const bgmVolumeSlider = document.getElementById('bgmVolumeSlider');
    const bgmVolumeVal = document.getElementById('bgmVolumeVal');
    const bgmVolumeRow = document.getElementById('bgmVolumeRow');

    if (soundToggle) soundToggle.checked = window.gameSettings.soundEnabled;
    if (bgmToggle) bgmToggle.checked = window.gameSettings.bgmEnabled;
    if (devModeToggle) devModeToggle.checked = window.gameSettings.devMode;
    if (demoModeToggle) demoModeToggle.checked = window.gameSettings.demoMode;
    if (bgmVolumeSlider) bgmVolumeSlider.value = window.gameSettings.bgmVolume;
    if (bgmVolumeVal) bgmVolumeVal.textContent = window.gameSettings.bgmVolume + '%';
    if (bgmVolumeRow) bgmVolumeRow.style.opacity = window.gameSettings.bgmEnabled ? '1' : '0.4';

    this.applyDevModeState();
  }

  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2200);
  }

  /* ==========================================================================
     Event Bindings
     ========================================================================== */
  bindEvents() {
    // Video events
    this.video.addEventListener('timeupdate', () => {
      if (this.gameState === 'PLAYING_PRE_PAUSE' && !this.hasPausedForQuestion) {
        if (this.video.currentTime >= this.currentLevel.pauseSecond) {
          this.triggerPauseCheckpoint();
        }
      }
    });

    this.video.addEventListener('ended', () => this.handleVideoEnded());

    // Confirmation banner buttons
    this.retouchBtn?.addEventListener('click', () => this.cancelSelection());
    this.confirmLockBtn?.addEventListener('click', () => this.confirmAndLockAnswer());

    // Tutorial actions
    document.getElementById('skipTutorialBtn')?.addEventListener('click', () => {
      this.skipTutorial();
    });

    document.getElementById('tutorialRetryDemoBtn')?.addEventListener('click', () => {
      window.gameSettings.playClick();
      if (this.tutorialGraduationModal) {
        this.tutorialGraduationModal.classList.remove('active');
      }
      this.startChallenge(true);
    });

    document.getElementById('tutorialStartRealBtn')?.addEventListener('click', () => {
      window.gameSettings.playClick();
      this.isTutorial = false;
      document.body.classList.remove('tutorial-mode-active');
      this.hideTutorialPointer();
      if (this.tutorialGraduationModal) {
        this.tutorialGraduationModal.classList.remove('active');
      }
      this.currentLevelIndex = 0;
      this.startChallenge(false);
    });

    // Landing screen actions
    document.getElementById('startPlayBtn')?.addEventListener('click', () => {
      this.startChallenge(false);
    });

    // Fullscreen buttons & change listener
    document.getElementById('fullscreenToggleBtn')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('stageFullscreenBtn')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('modalFullscreenDirectBtn')?.addEventListener('click', () => {
      this.closeInstallModal();
      this.toggleFullscreen();
    });

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
      document.addEventListener(evt, () => this.updateFullscreenUI());
    });

    // Install Modal Triggers & Tabs
    const installPwaBtn = document.getElementById('installPwaBtn');
    installPwaBtn?.addEventListener('click', () => {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            this.showToast('Installing Hazard Spotter...');
          }
          this.deferredPrompt = null;
        });
      } else {
        this.openInstallModal();
      }
    });

    document.getElementById('closeInstallModalBtn')?.addEventListener('click', () => this.closeInstallModal());
    document.getElementById('closeInstallModalBackdrop')?.addEventListener('click', () => this.closeInstallModal());

    // Tab buttons in Install modal
    const tabAndroidBtn = document.getElementById('tabAndroidBtn');
    const tabIosBtn = document.getElementById('tabIosBtn');
    const tabPaneAndroid = document.getElementById('tabPaneAndroid');
    const tabPaneIos = document.getElementById('tabPaneIos');

    tabAndroidBtn?.addEventListener('click', () => {
      tabAndroidBtn.classList.add('active');
      tabIosBtn?.classList.remove('active');
      if (tabPaneAndroid) tabPaneAndroid.classList.add('active');
      if (tabPaneIos) tabPaneIos.classList.remove('active');
    });

    tabIosBtn?.addEventListener('click', () => {
      tabIosBtn.classList.add('active');
      tabAndroidBtn?.classList.remove('active');
      if (tabPaneIos) tabPaneIos.classList.add('active');
      if (tabPaneAndroid) tabPaneAndroid.classList.remove('active');
    });

    // Demo Scene Mode toggle
    document.getElementById('demoModeToggle')?.addEventListener('change', (e) => {
      window.gameSettings.demoMode = e.target.checked;
      this.showToast(e.target.checked ? 'Demo Scene Enabled 🎓' : 'Demo Scene Off (Direct Play)');
    });

    // Sound FX toggle
    document.getElementById('soundToggle')?.addEventListener('change', (e) => {
      window.gameSettings.soundEnabled = e.target.checked;
      this.showToast(e.target.checked ? 'Sound FX Enabled' : 'Sound FX Muted');
    });

    // BGM toggle & volume slider
    document.getElementById('bgmToggle')?.addEventListener('change', (e) => {
      window.gameSettings.bgmEnabled = e.target.checked;
      const bgmVolumeRow = document.getElementById('bgmVolumeRow');
      if (bgmVolumeRow) bgmVolumeRow.style.opacity = e.target.checked ? '1' : '0.4';
      this.showToast(e.target.checked ? 'Music Enabled' : 'Music Off');
    });

    // Dev Mode toggle
    document.getElementById('devModeToggle')?.addEventListener('change', (e) => {
      window.gameSettings.devMode = e.target.checked;
      this.applyDevModeState();
      this.showToast(e.target.checked ? 'Dev Grid Enabled' : 'Dev Grid Off');
    });

    document.getElementById('bgmVolumeSlider')?.addEventListener('input', (e) => {
      const vol = parseInt(e.target.value, 10) || 0;
      window.gameSettings.bgmVolume = vol;
      const bgmVolumeVal = document.getElementById('bgmVolumeVal');
      if (bgmVolumeVal) bgmVolumeVal.textContent = vol + '%';
    });

    // Result screen actions
    document.getElementById('returnToMenuBtn')?.addEventListener('click', () => this.returnToLandingMenu());
    document.getElementById('replayBtn')?.addEventListener('click', () => this.replayCurrentScenario());
    document.getElementById('nextLevelBtn')?.addEventListener('click', () => this.goToNextScenario());

    // PWA beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (installPwaBtn) {
        installPwaBtn.style.display = 'inline-flex';
      }
    });

    // App installed event
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.showToast('App installed successfully! 🎉');
      this.checkStandaloneMode();
    });

    // Orientation change & resize listener
    window.addEventListener('orientationchange', () => {
      setTimeout(() => window.scrollTo(0, 0), 200);
    });

    window.addEventListener('resize', () => {
      if (this.isTutorial && this.gameState === 'WAITING_USER_INPUT') {
        if (this.tentativeSelection) {
          this.positionPointerOnElement(this.confirmLockBtn, 'Confirm & Lock');
        } else {
          const correctCell = this.gridOverlay.querySelector(`[data-grid-index="${this.currentLevel.correctGrid}"]`);
          if (correctCell) this.positionPointerOnElement(correctCell, 'Tap Here');
        }
      }
    });
  }

  /* ==========================================================================
     Service Worker Registration (Auto-Refresh on Updates)
     ========================================================================== */
  registerServiceWorker() {
    if (navigator.serviceWorker) navigator.serviceWorker.getRegistration().then(reg => reg?.update()).catch(() => {});
  }

}

document.addEventListener('DOMContentLoaded', () => {
  window.game = new FindTheMistakeGame();
});

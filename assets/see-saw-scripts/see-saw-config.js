(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SeeSawConfig = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var ASSET_BASE = '../see-saw-assets';

  var PAIRS = [
    {
      id: 'high-pressure',
      order: 1,
      symptom: 'High Pressure',
      cause: 'Column Blockage',
      symptomImg: ASSET_BASE + '/page-5/1-high-pressure.webp',
      causeImg: ASSET_BASE + '/page-5/11-column-blockage.webp',
      youtube: 'https://youtube.com/shorts/qp7AV0sm9IY?feature=share',
      video: ''
    },
    {
      id: 'pressure-fluctuation',
      order: 2,
      symptom: 'Pressure Fluctuation',
      cause: 'Air Bubble',
      symptomImg: ASSET_BASE + '/page-5/22-pressure-fluctuation.webp',
      causeImg: ASSET_BASE + '/page-5/22-air-bubble.webp',
      youtube: 'https://youtube.com/shorts/BSuYdW8Rctk?feature=share',
      video: ''
    },
    {
      id: 'peak-tailing',
      order: 3,
      symptom: 'Peak Tailing',
      cause: 'Column Deterioration',
      symptomImg: ASSET_BASE + '/page-5/33-peak-tailing.webp',
      causeImg: ASSET_BASE + '/page-5/33-column-deterioration.webp',
      youtube: 'https://youtube.com/shorts/Lzsot0zqUWA?feature=share',
      video: ''
    },
    {
      id: 'low-pressure',
      order: 4,
      symptom: 'Low Pressure',
      cause: 'Leakage',
      symptomImg: ASSET_BASE + '/page-5/44-low-pressure.webp',
      causeImg: ASSET_BASE + '/page-5/44-leakage.webp',
      youtube: 'https://youtube.com/shorts/dZSrWQI4M-Q?feature=share',
      video: ''
    },
    {
      id: 'retention-time-shift',
      order: 5,
      symptom: 'Retention Time Shift',
      cause: 'Mobile Phase Variation',
      symptomImg: ASSET_BASE + '/page-5/55-retention-time-shift.webp',
      causeImg: ASSET_BASE + '/page-5/55-mobile-phase-variation.webp',
      youtube: 'https://youtube.com/shorts/TtUwfHJX4b4?feature=share',
      video: ''
    }
  ];

  var IMAGES = {
    watchToUnlock: ASSET_BASE + '/page-3/watch-to-unlock.webp',
    page1Bg: ASSET_BASE + '/page-1/page-1-bg.webp',
    demo1: ASSET_BASE + '/demo/1.gif',
    demo2: ASSET_BASE + '/demo/2.gif',
    demo3: ASSET_BASE + '/demo/3.gif',
    videoNoPanel: ASSET_BASE + '/page-3/video-no-panel.webp',
    page4Bg: ASSET_BASE + '/page-4/page-4-bg.webp',
    startChallengeBtn: ASSET_BASE + '/page-4/start-challenge-button.webp',
    watchVideosBtn: ASSET_BASE + '/page-4/watch-videos-button.webp',
    demoBtn: ASSET_BASE + '/page-4/demo-button.webp',
    page5Bg: ASSET_BASE + '/page-5/page-5-bg.webp',
    answersTray: ASSET_BASE + '/page-5/answers-tray.webp',
    seeSawBase: ASSET_BASE + '/page-5/see-saw-base.webp',
    seeSawPanel: ASSET_BASE + '/page-5/see-saw-panel.webp',
    timerPanel: ASSET_BASE + '/page-5/timer-panel.webp',
    correctPopup: ASSET_BASE + '/page-6/correct-pop-up.webp',
    wrongPopup: ASSET_BASE + '/page-7/wrong-answer-pop-up.webp',
    timeUpPopup: ASSET_BASE + '/page-8/time-up-pop-up.webp',
    tryAgainBtn: ASSET_BASE + '/page-9/try-again-button.webp',
    page10Bg: ASSET_BASE + '/page-10/page-10-bg.webp',
    roundCompleteBg: ASSET_BASE + '/page-10/round-complete-bg-v1.webp',
    wellPlayed: ASSET_BASE + '/page-10/well-played-v1.webp',
    page11Bg: ASSET_BASE + '/page-11/page-11-bg.webp',
    tooSlowPopup: ASSET_BASE + '/page-12/too-slow-pop-up.webp',
    nextBtn: ASSET_BASE + '/next-button.webp',
    playAgainBtn: ASSET_BASE + '/play-again-button.webp',
    star: ASSET_BASE + '/star.webp',
    titleQuestionPanel: ASSET_BASE + '/title-and-question-panel.webp',
    watchVideoTryAgainBtn: ASSET_BASE + '/watch-video-and-try-again-button.webp',
    mascotIdle: ASSET_BASE + '/mascot/idle.gif',
    mascotCorrect: ASSET_BASE + '/mascot/correct-answer-once-v1.gif',
    mascotWrong: ASSET_BASE + '/mascot/wrong-answer-immediate-v2.gif',
    mascotTimeUp: ASSET_BASE + '/mascot/time-up-once-v1.gif',
    videoSlide1: ASSET_BASE + '/videos/fallback-slides/slide-1.webp',
    videoSlide2: ASSET_BASE + '/videos/fallback-slides/slide-2.webp',
    videoSlide3: ASSET_BASE + '/videos/fallback-slides/slide-3.webp',
    videoSlide4: ASSET_BASE + '/videos/fallback-slides/slide-4.webp'
  };

  var PRELOAD_IMAGES = Object.keys(IMAGES).map(function (key) {
    return IMAGES[key];
  });
  PAIRS.forEach(function (pair) {
    if (PRELOAD_IMAGES.indexOf(pair.symptomImg) === -1) PRELOAD_IMAGES.push(pair.symptomImg);
    if (PRELOAD_IMAGES.indexOf(pair.causeImg) === -1) PRELOAD_IMAGES.push(pair.causeImg);
  });

  return {
    version: '1',
    gameId: 'see-saw',
    title: 'See Saw',
    storageKey: 'see-saw-progress-v1',
    assetBase: ASSET_BASE,
    questionSeconds: 10,
    questionsPerRound: 5,
    maxStars: 5,
    dailyStarQuota: 3,
    correctHoldMs: 3800,
    placeholderVideoSeconds: 4,
    audio: {
      menuBgm: ASSET_BASE + '/audio/menu-bgm.mp3',
      gameBgm: ASSET_BASE + '/audio/game-bgm.mp3',
      correctSfx: ASSET_BASE + '/audio/correct.mp3',
      wrongStartOffsetSeconds: 1.4,
      wrongSfx: ASSET_BASE + '/audio/wrong.mp3',
      timeUpSfx: ASSET_BASE + '/audio/time-up.mp3',
      menuVolume: 0.42,
      gameVolume: 0.48,
      sfxVolume: 0.70,
      crossfadeDuration: 1.2
    },
    pairs: PAIRS,
    images: IMAGES,
    preloadImages: PRELOAD_IMAGES
  };
});


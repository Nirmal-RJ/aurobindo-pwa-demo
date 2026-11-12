(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./see-saw-config.js'));
  } else {
    root.SeeSawCore = factory(root.SeeSawConfig);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (DefaultConfig) {
  'use strict';

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function shuffleArray(items, rng) {
    var random = typeof rng === 'function' ? rng : Math.random;
    var arr = items.slice();
    for (var i = arr.length - 1; i > 0; i -= 1) {
      var j = Math.floor(random() * (i + 1));
      if (j < 0) j = 0;
      if (j > i) j = i;
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function formatSecondsDecimal(ms) {
    if (typeof ms !== 'number' || !isFinite(ms) || ms < 0) {
      return '--';
    }
    return (ms / 1000).toFixed(1) + ' s';
  }

  function formatTimerMMSS(remainingMs) {
    var clamped = Math.max(0, Math.ceil((remainingMs || 0) / 1000));
    var mins = Math.floor(clamped / 60);
    var secs = clamped % 60;
    return (mins < 10 ? '0' + mins : String(mins)) + ':' + (secs < 10 ? '0' + secs : String(secs));
  }

  function getTodayDateString(d) {
    return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(d || new Date());
  }

  function createDefaultProgress(todayDate) {
    var today = todayDate || getTodayDateString();
    return {
      version: 1,
      onboardingComplete: false,
      stars: 0,
      dailyStarsDate: today,
      dailyStarsEarned: 0,
      timeToBeatMs: null, // Average time from previous winning star round used as benchmark
      bestAverageMs: null
    };
  }

  function sanitizeProgress(raw, config, todayDate) {
    var cfg = config || DefaultConfig;
    var maxStars = (cfg && cfg.maxStars) || 5;
    var dailyQuota = (cfg && cfg.dailyStarQuota) || 3;
    var today = todayDate || getTodayDateString();
    var base = createDefaultProgress(today);
    if (!raw || typeof raw !== 'object') {
      return base;
    }
    base.onboardingComplete = Boolean(raw.onboardingComplete);

    // Stars and benchmark time are permanent - no midnight reset
    var stars = Number(raw.stars !== undefined ? raw.stars : raw.dailyStarsEarned);
    if (isFinite(stars) && stars >= 0) {
      base.stars = Math.min(maxStars, Math.floor(stars));
    }

    var savedDate = typeof raw.dailyStarsDate === 'string' && raw.dailyStarsDate ? raw.dailyStarsDate : today;
    base.dailyStarsDate = savedDate;
    if (savedDate !== today) {
      base.dailyStarsDate = today;
      base.dailyStarsEarned = 0;
    } else {
      var dailyEarned = Number(raw.dailyStarsEarned);
      base.dailyStarsEarned = isFinite(dailyEarned) && dailyEarned >= 0
        ? Math.min(dailyQuota, Math.floor(dailyEarned))
        : Math.min(dailyQuota, base.stars);
    }

    if (typeof raw.timeToBeatMs === 'number' && isFinite(raw.timeToBeatMs) && raw.timeToBeatMs > 0) {
      base.timeToBeatMs = Math.round(raw.timeToBeatMs);
    } else if (raw.timeToBeatMs && typeof raw.timeToBeatMs === 'object') {
      var sum = 0;
      var count = 0;
      Object.keys(raw.timeToBeatMs).forEach(function (key) {
        var val = Number(raw.timeToBeatMs[key]);
        if (isFinite(val) && val > 0) {
          sum += val;
          count += 1;
        }
      });
      if (count > 0) {
        base.timeToBeatMs = Math.round(sum / count);
      }
    }

    if (typeof raw.bestAverageMs === 'number' && isFinite(raw.bestAverageMs) && raw.bestAverageMs > 0) {
      base.bestAverageMs = Math.round(raw.bestAverageMs);
    }
    return base;
  }

  function loadProgress(storage, storageKey, config, todayDate) {
    var key = storageKey || (config && config.storageKey) || 'see-saw-progress-v1';
    if (!storage || typeof storage.getItem !== 'function') {
      return createDefaultProgress(todayDate);
    }
    try {
      var raw = storage.getItem(key);
      if (!raw) return createDefaultProgress(todayDate);
      return sanitizeProgress(JSON.parse(raw), config, todayDate);
    } catch (_) {
      return createDefaultProgress(todayDate);
    }
  }

  function saveProgress(storage, storageKey, progress, config, todayDate) {
    var key = storageKey || (config && config.storageKey) || 'see-saw-progress-v1';
    var clean = sanitizeProgress(progress, config, todayDate);
    if (storage && typeof storage.setItem === 'function') {
      try {
        storage.setItem(key, JSON.stringify(clean));
      } catch (_) {
        /* ignore quota errors */
      }
    }
    return clean;
  }

  function createGameController(options) {
    var opts = options || {};
    var config = opts.config || DefaultConfig;
    var storage = opts.storage || null;
    var rng = typeof opts.rng === 'function' ? opts.rng : Math.random;
    var shuffleQuestions = opts.shuffleQuestions !== false;
    var storageKey = opts.storageKey || config.storageKey || 'see-saw-progress-v1';

    var getTodayDate = typeof opts.getTodayDate === 'function'
      ? opts.getTodayDate
      : function () {
          return opts.todayDate || getTodayDateString(typeof opts.now === 'function' ? opts.now() : new Date());
        };

    var progress = loadProgress(storage, storageKey, config, getTodayDate());

    function syncDailyQuota() {
      // Benchmark and stars are permanent — no midnight reset
      var today = getTodayDate();
      if (progress.dailyStarsDate !== today) {
        progress.dailyStarsDate = today;
        progress.dailyStarsEarned = 0;
        persist();
      }
    }

    var state = {
      page: 'page-1',
      demoMode: 'onboarding', // 'onboarding' | 'home'
      demoStep: 1,            // 1 | 2 | 3
      onboardingVideos: [],   // shuffled pairs for Page 3
      onboardingIndex: 0,     // 0..4
      onboardingVideoDone: false,
      questions: [],          // 5 pairs for current round
      questionIndex: 0,       // 0..4
      streak: 0,              // 0..5
      inRetryQuestion: false, // true when retrying a failed question after Page 9
      roundTimesMs: {},       // pairId -> elapsedMs in current round
      selectedCauseId: null,  // currently placed causeId on right seat
      outcome: null,          // { type: 'correct'|'wrong'|'time-up'|'too-slow', elapsedMs, timeToBeatMs, pair }
      remediationVideoDone: false,
      lastStarSummary: {
        starsEarned: progress.stars,
        dailyStarsEarned: progress.dailyStarsEarned,
        maxDailyStars: config.dailyStarQuota || config.maxStars || 3,
        dailyQuotaReached: progress.dailyStarsEarned >= ((config.dailyStarQuota || config.maxStars) || 3),
        newlyEarnedStar: false,
        thisRoundAverageMs: null,
        previousBestAverageMs: null
      },
      watchVideosActivePairId: null
    };

    function persist() {
      progress = saveProgress(storage, storageKey, progress, config, getTodayDate());
    }

    function getPairById(pairId) {
      for (var i = 0; i < config.pairs.length; i += 1) {
        if (config.pairs[i].id === pairId) {
          return config.pairs[i];
        }
      }
      return null;
    }

    function getCurrentQuestion() {
      return state.questions[state.questionIndex] || config.pairs[0];
    }

    function getTimeToBeatForQuestion() {
      syncDailyQuota();
      // Round 1 (0 stars earned today): "5 in a row = first star" - no comparison check
      if (progress.stars < 1) {
        return null;
      }
      var target = progress.timeToBeatMs;
      return typeof target === 'number' && isFinite(target) && target > 0 ? target : null;
    }

    function handlePage1Next() {
      if (!progress.onboardingComplete) {
        state.demoMode = 'onboarding';
        state.demoStep = 1;
        state.page = 'page-2';
      } else {
        state.page = 'page-4';
      }
      return getSnapshot();
    }

    function openDemoFromHome() {
      state.demoMode = 'home';
      state.demoStep = 1;
      state.page = 'page-2';
      return getSnapshot();
    }

    function handleDemoNext() {
      if (state.page !== 'page-2') {
        return getSnapshot();
      }
      if (state.demoStep < 3) {
        state.demoStep += 1;
        return getSnapshot();
      }
      if (state.demoMode === 'onboarding') {
        state.onboardingVideos = shuffleQuestions
          ? shuffleArray(config.pairs, rng)
          : config.pairs.slice();
        state.onboardingIndex = 0;
        state.onboardingVideoDone = false;
        state.page = 'page-3';
      } else {
        state.page = 'page-4';
      }
      return getSnapshot();
    }

    function completeOnboardingVideo() {
      if (state.page === 'page-3') {
        state.onboardingVideoDone = true;
      }
      return getSnapshot();
    }

    function handleOnboardingNext() {
      if (state.page !== 'page-3' || !state.onboardingVideoDone) {
        return getSnapshot();
      }
      if (state.onboardingIndex + 1 < state.onboardingVideos.length) {
        state.onboardingIndex += 1;
        state.onboardingVideoDone = false;
        return getSnapshot();
      }
      progress.onboardingComplete = true;
      persist();
      state.page = 'page-4';
      return getSnapshot();
    }

    function startRound() {
      syncDailyQuota();
      state.questions = shuffleQuestions
        ? shuffleArray(config.pairs, rng)
        : config.pairs.slice();
      state.questionIndex = 0;
      state.streak = 0;
      state.inRetryQuestion = false;
      state.roundTimesMs = {};
      state.selectedCauseId = null;
      state.outcome = null;
      state.remediationVideoDone = false;
      state.page = 'page-5';
      return getSnapshot();
    }

    function submitAnswer(causeId, rawElapsedMs) {
      if (state.page !== 'page-5') {
        return getSnapshot();
      }
      syncDailyQuota();
      var maxMs = (config.questionSeconds || 10) * 1000;
      var elapsedMs = Math.max(1, Math.min(maxMs, Math.round(Number(rawElapsedMs) || 0)));
      var currentPair = getCurrentQuestion();
      state.selectedCauseId = causeId;

      if (causeId !== currentPair.id) {
        state.streak = 0;
        state.inRetryQuestion = true;
        state.outcome = {
          type: 'wrong',
          elapsedMs: elapsedMs,
          timeToBeatMs: getTimeToBeatForQuestion(currentPair.id),
          pair: clone(currentPair)
        };
        state.page = 'page-7';
        return getSnapshot();
      }

      var targetMs = getTimeToBeatForQuestion(currentPair.id);
      if (targetMs !== null && elapsedMs >= targetMs) {
        state.streak = 0;
        state.inRetryQuestion = true;
        state.outcome = {
          type: 'too-slow',
          elapsedMs: elapsedMs,
          timeToBeatMs: targetMs,
          pair: clone(currentPair)
        };
        state.page = 'page-12';
        return getSnapshot();
      }

      if (!state.inRetryQuestion) {
        state.streak = Math.min(config.questionsPerRound || 5, state.streak + 1);
        state.roundTimesMs[currentPair.id] = elapsedMs;
      }

      state.outcome = {
        type: 'correct',
        elapsedMs: elapsedMs,
        timeToBeatMs: targetMs,
        streak: state.inRetryQuestion ? 1 : state.streak,
        isRetrySuccess: state.inRetryQuestion,
        pair: clone(currentPair)
      };
      state.page = 'page-6';
      return getSnapshot();
    }

    function expireQuestion() {
      if (state.page !== 'page-5') {
        return getSnapshot();
      }
      var targetMs = getTimeToBeatForQuestion();
      var maxMs = (config.questionSeconds || 10) * 1000;
      var currentPair = getCurrentQuestion();
      state.selectedCauseId = null;
      state.streak = 0;
      state.inRetryQuestion = true;
      state.outcome = {
        type: 'time-up',
        elapsedMs: maxMs,
        timeToBeatMs: targetMs,
        pair: clone(currentPair)
      };
      state.page = 'page-8';
      return getSnapshot();
    }

    function advanceAfterCorrect() {
      if (state.page !== 'page-6') {
        return getSnapshot();
      }
      if (state.inRetryQuestion) {
        return startRound();
      }
      var totalQuestions = config.questionsPerRound || 5;
      if (state.streak >= totalQuestions) {
        syncDailyQuota();
        var sumMs = 0;
        var count = 0;
        state.questions.forEach(function (q) {
          var t = state.roundTimesMs[q.id];
          if (typeof t === 'number' && isFinite(t)) {
            sumMs += t;
            count += 1;
          }
        });
        var avgMs = count > 0 ? Math.round(sumMs / count) : 0;
        var prevBest = progress.bestAverageMs;

        // The user's average time from this winning round becomes the benchmark to beat in the next star round
        if (avgMs > 0) {
          progress.timeToBeatMs = avgMs;
        }

        var maxDailyStars = (config && (config.dailyStarQuota || config.maxStars)) || 3;
        var newlyEarnedStar = false;
        if (progress.dailyStarsEarned < maxDailyStars && progress.stars < (config.maxStars || 5)) {
          progress.dailyStarsEarned += 1;
          progress.stars += 1;
          newlyEarnedStar = true;
        }

        if (progress.bestAverageMs === null || (avgMs > 0 && avgMs < progress.bestAverageMs)) {
          progress.bestAverageMs = avgMs;
        }
        persist();

        state.lastStarSummary = {
          starsEarned: progress.stars,
          dailyStarsEarned: progress.dailyStarsEarned,
          maxDailyStars: maxDailyStars,
          dailyQuotaReached: progress.dailyStarsEarned >= maxDailyStars,
          newlyEarnedStar: newlyEarnedStar,
          thisRoundAverageMs: avgMs,
          previousBestAverageMs: prevBest
        };
        state.page = 'page-10';
        return getSnapshot();
      }

      state.questionIndex = Math.min(state.questions.length - 1, state.questionIndex + 1);
      state.selectedCauseId = null;
      state.outcome = null;
      state.page = 'page-5';
      return getSnapshot();
    }

    function openRemediationVideo() {
      if (state.page !== 'page-7' && state.page !== 'page-8' && state.page !== 'page-12') {
        return getSnapshot();
      }
      state.remediationVideoDone = false;
      state.page = 'page-9';
      return getSnapshot();
    }

    function completeRemediationVideo() {
      if (state.page === 'page-9') {
        state.remediationVideoDone = true;
      }
      return getSnapshot();
    }

    function retryCurrentQuestion() {
      if (state.page !== 'page-9' || !state.remediationVideoDone) {
        return getSnapshot();
      }
      state.selectedCauseId = null;
      state.outcome = null;
      state.remediationVideoDone = false;
      state.inRetryQuestion = true;
      state.page = 'page-5';
      return getSnapshot();
    }

    function proceedFromNewStarToStarEarned() {
      if (state.page === 'page-10') {
        if (!state.lastStarSummary.newlyEarnedStar) return startRound();
        state.page = 'page-11';
      }
      return getSnapshot();
    }

    function openWatchVideosPage() {
      state.watchVideosActivePairId = null;
      state.page = 'page-13';
      return getSnapshot();
    }

    function selectWatchVideoPair(pairId) {
      if (state.page === 'page-13') {
        var found = getPairById(pairId);
        state.watchVideosActivePairId = found ? found.id : null;
      }
      return getSnapshot();
    }

    function closeWatchVideoModal() {
      if (state.page === 'page-13') {
        state.watchVideosActivePairId = null;
      }
      return getSnapshot();
    }

    function goToHome() {
      state.watchVideosActivePairId = null;
      state.outcome = null;
      state.selectedCauseId = null;
      state.page = 'page-4';
      return getSnapshot();
    }

    function getSnapshot() {
      syncDailyQuota();
      var maxDailyStars = (config && (config.dailyStarQuota || config.maxStars)) || 3;
      var currentQ = getCurrentQuestion();
      var onboardingPair = state.onboardingVideos[state.onboardingIndex] || config.pairs[0];
      return {
        page: state.page,
        demoMode: state.demoMode,
        demoStep: state.demoStep,
        onboardingIndex: state.onboardingIndex,
        onboardingTotal: state.onboardingVideos.length || config.pairs.length,
        onboardingPair: onboardingPair ? clone(onboardingPair) : null,
        onboardingVideoDone: state.onboardingVideoDone,
        questionIndex: state.questionIndex,
        questionNumber: state.questionIndex + 1,
        questionsTotal: config.questionsPerRound || 5,
        currentQuestion: currentQ ? clone(currentQ) : null,
        currentTimeToBeatMs: currentQ ? getTimeToBeatForQuestion(currentQ.id) : null,
        streak: state.streak,
        inRetryQuestion: state.inRetryQuestion,
        selectedCauseId: state.selectedCauseId,
        outcome: state.outcome ? clone(state.outcome) : null,
        remediationVideoDone: state.remediationVideoDone,
        lastStarSummary: clone(state.lastStarSummary),
        watchVideosActivePairId: state.watchVideosActivePairId,
        watchVideosActivePair: state.watchVideosActivePairId ? clone(getPairById(state.watchVideosActivePairId)) : null,
        dailyQuotaReached: progress.dailyStarsEarned >= maxDailyStars,
        dailyStarsEarned: progress.dailyStarsEarned,
        maxDailyStars: maxDailyStars,
        progress: clone(progress)
      };
    }

    return {
      getSnapshot: getSnapshot,
      handlePage1Next: handlePage1Next,
      openDemoFromHome: openDemoFromHome,
      handleDemoNext: handleDemoNext,
      completeOnboardingVideo: completeOnboardingVideo,
      handleOnboardingNext: handleOnboardingNext,
      startRound: startRound,
      submitAnswer: submitAnswer,
      expireQuestion: expireQuestion,
      advanceAfterCorrect: advanceAfterCorrect,
      openRemediationVideo: openRemediationVideo,
      completeRemediationVideo: completeRemediationVideo,
      retryCurrentQuestion: retryCurrentQuestion,
      proceedFromNewStarToStarEarned: proceedFromNewStarToStarEarned,
      openWatchVideosPage: openWatchVideosPage,
      selectWatchVideoPair: selectWatchVideoPair,
      closeWatchVideoModal: closeWatchVideoModal,
      goToHome: goToHome
    };
  }

  return {
    getTodayDateString: getTodayDateString,
    createDefaultProgress: createDefaultProgress,
    sanitizeProgress: sanitizeProgress,
    loadProgress: loadProgress,
    saveProgress: saveProgress,
    formatSecondsDecimal: formatSecondsDecimal,
    formatTimerMMSS: formatTimerMMSS,
    shuffleArray: shuffleArray,
    createGameController: createGameController
  };
});


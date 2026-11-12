const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const Config = require('../assets/see-saw-scripts/see-saw-config.js');
const Core = require('../assets/see-saw-scripts/see-saw-core.js');

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, val) {
      map.set(key, String(val));
    }
  };
}

test('See Saw config defines 5 Symptom-Cause pairs and 10s question timer', () => {
  assert.equal(Config.questionSeconds, 10);
  assert.equal(Config.questionsPerRound, 5);
  assert.equal(Config.maxStars, 5);
  assert.equal(Config.pairs.length, 5);
  const expectedIds = [
    'high-pressure',
    'pressure-fluctuation',
    'peak-tailing',
    'low-pressure',
    'retention-time-shift'
  ];
  assert.deepEqual(
    Config.pairs.map(p => p.id),
    expectedIds
  );

  // Audio configuration & physical file verification
  assert.ok(Config.audio);
  assert.ok(Config.audio.menuBgm.endsWith('menu-bgm.mp3'));
  assert.ok(Config.audio.gameBgm.endsWith('game-bgm.mp3'));
  assert.ok(Config.audio.correctSfx.endsWith('correct.mp3'));
  assert.ok(Config.audio.wrongSfx.endsWith('wrong.mp3'));
  assert.ok(Config.audio.timeUpSfx.endsWith('time-up.mp3'));
  assert.ok(Config.audio.crossfadeDuration >= 1.0);

  const audioDir = path.join(__dirname, '../assets/see-saw-assets/audio');
  assert.ok(fs.existsSync(path.join(audioDir, 'menu-bgm.mp3')));
  assert.ok(fs.existsSync(path.join(audioDir, 'game-bgm.mp3')));
  assert.ok(fs.existsSync(path.join(audioDir, 'correct.mp3')));
  assert.ok(fs.existsSync(path.join(audioDir, 'wrong.mp3')));
  assert.ok(fs.existsSync(path.join(audioDir, 'time-up.mp3')));
});

test('First-time onboarding requires Demo 2.1-2.3 and 5 unskippable videos before reaching Page 4', () => {
  const storage = createMemoryStorage();
  const ctrl = Core.createGameController({
    config: Config,
    storage,
    shuffleQuestions: false
  });

  let snap = ctrl.getSnapshot();
  assert.equal(snap.page, 'page-1');
  assert.equal(snap.progress.onboardingComplete, false);

  // Page 1 Next -> Page 2.1
  snap = ctrl.handlePage1Next();
  assert.equal(snap.page, 'page-2');
  assert.equal(snap.demoStep, 1);

  // Page 2.1 -> 2.2 -> 2.3 -> Page 3
  snap = ctrl.handleDemoNext();
  assert.equal(snap.page, 'page-2');
  assert.equal(snap.demoStep, 2);

  snap = ctrl.handleDemoNext();
  assert.equal(snap.page, 'page-2');
  assert.equal(snap.demoStep, 3);

  snap = ctrl.handleDemoNext();
  assert.equal(snap.page, 'page-3');
  assert.equal(snap.onboardingIndex, 0);
  assert.equal(snap.onboardingVideoDone, false);

  // Cannot advance Page 3 video before completion
  snap = ctrl.handleOnboardingNext();
  assert.equal(snap.page, 'page-3');
  assert.equal(snap.onboardingIndex, 0);

  // Complete all 5 videos on Page 3
  for (let i = 0; i < 5; i += 1) {
    assert.equal(snap.onboardingIndex, i);
    snap = ctrl.completeOnboardingVideo();
    assert.equal(snap.onboardingVideoDone, true);
    snap = ctrl.handleOnboardingNext();
  }

  assert.equal(snap.page, 'page-4');
  assert.equal(snap.progress.onboardingComplete, true);

  // Subsequent visit skips Page 2 & Page 3 and goes straight from Page 1 to Page 4
  const ctrl2 = Core.createGameController({
    config: Config,
    storage,
    shuffleQuestions: false
  });
  const snap2 = ctrl2.handlePage1Next();
  assert.equal(snap2.page, 'page-4');

  // Demo button from Page 4 opens Page 2 and returns directly to Page 4
  let demoSnap = ctrl2.openDemoFromHome();
  assert.equal(demoSnap.page, 'page-2');
  assert.equal(demoSnap.demoStep, 1);
  demoSnap = ctrl2.handleDemoNext();
  assert.equal(demoSnap.demoStep, 2);
  demoSnap = ctrl2.handleDemoNext();
  assert.equal(demoSnap.demoStep, 3);
  demoSnap = ctrl2.handleDemoNext();
  assert.equal(demoSnap.page, 'page-4');
});

test('Earning Star 1 records round average as benchmark timeToBeat and enforces beating it for Star 2 and Star 3', () => {
  const storage = createMemoryStorage();
  const ctrl = Core.createGameController({
    config: Config,
    storage,
    shuffleQuestions: false
  });

  ctrl.startRound();
  const round1Times = [5200, 4800, 6000, 5000, 4000]; // sum = 25000ms, avg = 5000ms (5.0 s)

  for (let i = 0; i < 5; i += 1) {
    const q = ctrl.getSnapshot().currentQuestion;
    let snap = ctrl.submitAnswer(q.id, round1Times[i]);
    assert.equal(snap.page, 'page-6');
    assert.equal(snap.streak, i + 1);
    snap = ctrl.advanceAfterCorrect();
    if (i < 4) {
      assert.equal(snap.page, 'page-5');
      assert.equal(snap.questionNumber, i + 2);
    } else {
      assert.equal(snap.page, 'page-10');
      assert.equal(snap.progress.stars, 1);
      assert.equal(snap.lastStarSummary.thisRoundAverageMs, 5000);
      assert.equal(snap.lastStarSummary.previousBestAverageMs, null);
    }
  }

  let snap = ctrl.proceedFromNewStarToStarEarned();
  assert.equal(snap.page, 'page-11');
  assert.equal(snap.progress.stars, 1);

  // Start Round 2 (working toward Star 2): benchmark is the 5.0 s (5000ms) average from Round 1
  snap = ctrl.startRound();
  assert.equal(snap.page, 'page-5');
  assert.equal(snap.currentTimeToBeatMs, 5000);

  // Answering Question 1 correctly but slower than the 5.0s benchmark (5800ms >= 5000ms) triggers Page 12 (Too slow!)
  const q1 = snap.currentQuestion;
  snap = ctrl.submitAnswer(q1.id, 5800);
  assert.equal(snap.page, 'page-12');
  assert.equal(snap.streak, 0);
  assert.equal(snap.outcome.type, 'too-slow');
  assert.equal(snap.outcome.elapsedMs, 5800);
  assert.equal(snap.outcome.timeToBeatMs, 5000);

  // Must watch remediation video on Page 9 and retry the SAME question until right, then restart from 1/5
  snap = ctrl.openRemediationVideo();
  assert.equal(snap.page, 'page-9');
  assert.equal(snap.remediationVideoDone, false);

  // Try again is blocked before video finishes
  snap = ctrl.retryCurrentQuestion();
  assert.equal(snap.page, 'page-9');

  snap = ctrl.completeRemediationVideo();
  assert.equal(snap.remediationVideoDone, true);

  snap = ctrl.retryCurrentQuestion();
  assert.equal(snap.page, 'page-5');
  assert.equal(snap.currentQuestion.id, q1.id);
  assert.equal(snap.inRetryQuestion, true);

  // Now answer the retried question faster (4100ms < 5000ms) -> Page 6 -> restarts from Question 1/5
  snap = ctrl.submitAnswer(q1.id, 4100);
  assert.equal(snap.page, 'page-6');
  snap = ctrl.advanceAfterCorrect();
  assert.equal(snap.page, 'page-5');
  assert.equal(snap.questionNumber, 1);
  assert.equal(snap.streak, 0);
  assert.equal(snap.inRetryQuestion, false);

  // Complete all 5 questions faster than the 5000ms benchmark to earn Star 2
  const round2Times = [4000, 3800, 4500, 3900, 3300]; // avg = 3900ms (3.9 s)
  for (let i = 0; i < 5; i += 1) {
    const q = ctrl.getSnapshot().currentQuestion;
    assert.equal(ctrl.getSnapshot().currentTimeToBeatMs, 5000);
    snap = ctrl.submitAnswer(q.id, round2Times[i]);
    assert.equal(snap.page, 'page-6');
    snap = ctrl.advanceAfterCorrect();
  }
  assert.equal(snap.page, 'page-10');
  assert.equal(snap.progress.stars, 2);
  assert.equal(snap.lastStarSummary.thisRoundAverageMs, 3900);
  assert.equal(snap.lastStarSummary.previousBestAverageMs, 5000);
  assert.equal(snap.progress.timeToBeatMs, 3900); // New benchmark for Star 3 is 3900ms!
});

test('Wrong answer and Time Up reset streak, require Page 9 video, retry same question, then restart from 1/5', () => {
  const storage = createMemoryStorage();
  const ctrl = Core.createGameController({
    config: Config,
    storage,
    shuffleQuestions: false
  });

  // Answer Question 1 right (streak = 1)
  let snap = ctrl.startRound();
  const q1 = snap.currentQuestion;
  snap = ctrl.submitAnswer(q1.id, 3000);
  assert.equal(snap.page, 'page-6');
  snap = ctrl.advanceAfterCorrect();
  assert.equal(snap.questionNumber, 2);
  assert.equal(snap.streak, 1);

  // Question 2: submit wrong cause -> Page 7
  const q2 = snap.currentQuestion;
  snap = ctrl.submitAnswer(q1.id, 3200);
  assert.equal(snap.page, 'page-7');
  assert.equal(snap.streak, 0);

  // Watch video on Page 9 -> retry Question 2
  snap = ctrl.openRemediationVideo();
  assert.equal(snap.page, 'page-9');
  ctrl.completeRemediationVideo();
  snap = ctrl.retryCurrentQuestion();
  assert.equal(snap.page, 'page-5');
  assert.equal(snap.currentQuestion.id, q2.id);

  // Expire timer on Question 2 retry -> Page 8 (Time Up!)
  snap = ctrl.expireQuestion();
  assert.equal(snap.page, 'page-8');
  assert.equal(snap.streak, 0);

  // Watch video again -> retry Question 2 again
  ctrl.openRemediationVideo();
  ctrl.completeRemediationVideo();
  snap = ctrl.retryCurrentQuestion();
  assert.equal(snap.page, 'page-5');
  assert.equal(snap.currentQuestion.id, q2.id);

  // Get Question 2 right -> Page 6 -> restarts round at Question 1/5
  snap = ctrl.submitAnswer(q2.id, 2900);
  assert.equal(snap.page, 'page-6');
  snap = ctrl.advanceAfterCorrect();
  assert.equal(snap.page, 'page-5');
  assert.equal(snap.questionNumber, 1);
  assert.equal(snap.streak, 0);
  assert.equal(snap.inRetryQuestion, false);
});

test('Star logic: up to 3 stars, 5-in-a-row for star 1, beat round average for stars 2 & 3, permanent stars and benchmark with no midnight reset', () => {
  const storage = createMemoryStorage();
  let simulatedDate = '2026-11-12';

  const ctrl = Core.createGameController({
    config: Config,
    storage,
    shuffleQuestions: false,
    getTodayDate: () => simulatedDate
  });

  // ROUND 1: Pursuing Star 1 (5 in a row = first star).
  // Questions in same round are NEVER checked for short time.
  ctrl.startRound();
  assert.equal(ctrl.getSnapshot().progress.stars, 0);
  assert.equal(ctrl.getSnapshot().progress.dailyStarsEarned, 0);

  // Submit varying times, e.g. Question 1 takes 2000ms, Question 2 takes 7500ms.
  // Question 2 taking longer than Question 1 must NOT trigger "too slow" because questions in the same round are not compared!
  const round1Times = [2000, 7500, 8000, 6200, 5000];
  for (let i = 0; i < 5; i += 1) {
    const q = ctrl.getSnapshot().currentQuestion;
    assert.equal(ctrl.getSnapshot().currentTimeToBeatMs, null); // No time-to-beat in round 1
    let snap = ctrl.submitAnswer(q.id, round1Times[i]);
    assert.equal(snap.page, 'page-6');
    snap = ctrl.advanceAfterCorrect();
  }

  // Star 1 won!
  let snap = ctrl.getSnapshot();
  assert.equal(snap.page, 'page-10');
  assert.equal(snap.progress.stars, 1);
  assert.equal(snap.progress.dailyStarsEarned, 1);
  assert.equal(snap.lastStarSummary.thisRoundAverageMs, 5740);
  assert.equal(snap.progress.timeToBeatMs, 5740); // Benchmark for Round 2 is 5740ms
  assert.equal(snap.dailyQuotaReached, false);

  // ROUND 2: Pursuing Star 2 (Beat previous winning round average: 5740ms).
  ctrl.proceedFromNewStarToStarEarned();
  ctrl.startRound();

  const round2Times = [1800, 4500, 4800, 4200, 3700]; // sum = 19000ms, avg = 3800ms
  for (let i = 0; i < 5; i += 1) {
    const q = ctrl.getSnapshot().currentQuestion;
    assert.equal(ctrl.getSnapshot().currentTimeToBeatMs, 5740); // Consistent benchmark from Round 1 average
    let snap = ctrl.submitAnswer(q.id, round2Times[i]);
    assert.equal(snap.page, 'page-6');
    snap = ctrl.advanceAfterCorrect();
  }

  // Star 2 won!
  snap = ctrl.getSnapshot();
  assert.equal(snap.page, 'page-10');
  assert.equal(snap.progress.stars, 2);
  assert.equal(snap.progress.dailyStarsEarned, 2);
  assert.equal(snap.lastStarSummary.thisRoundAverageMs, 3800);
  assert.equal(snap.progress.timeToBeatMs, 3800); // Benchmark for Round 3 is 3800ms
  assert.equal(snap.dailyQuotaReached, false);

  // ROUND 3: Pursuing Star 3 (Beat previous winning round average: 3800ms).
  ctrl.proceedFromNewStarToStarEarned();
  ctrl.startRound();

  const round3Times = [1500, 3200, 3400, 3000, 2900]; // sum = 14000ms, avg = 2800ms
  for (let i = 0; i < 5; i += 1) {
    const q = ctrl.getSnapshot().currentQuestion;
    assert.equal(ctrl.getSnapshot().currentTimeToBeatMs, 3800); // Consistent benchmark from Round 2 average
    let snap = ctrl.submitAnswer(q.id, round3Times[i]);
    assert.equal(snap.page, 'page-6');
    snap = ctrl.advanceAfterCorrect();
  }

  // Star 3 won! Daily quota reached (3 of 3 stars today)
  snap = ctrl.getSnapshot();
  assert.equal(snap.page, 'page-10');
  assert.equal(snap.progress.stars, 3);
  assert.equal(snap.progress.dailyStarsEarned, 3);
  assert.equal(snap.lastStarSummary.thisRoundAverageMs, 2800);
  assert.equal(snap.dailyQuotaReached, true);
  assert.equal(snap.lastStarSummary.dailyQuotaReached, true);

  // Playing again on the same day allows practice but caps daily stars at 3
  ctrl.proceedFromNewStarToStarEarned();
  ctrl.startRound();
  const round4Times = [1200, 2500, 2600, 2400, 2300];
  for (let i = 0; i < 5; i += 1) {
    const q = ctrl.getSnapshot().currentQuestion;
    let snap = ctrl.submitAnswer(q.id, round4Times[i]);
    assert.equal(snap.page, 'page-6');
    snap = ctrl.advanceAfterCorrect();
  }
  snap = ctrl.getSnapshot();
  assert.equal(snap.progress.stars, 3);
  assert.equal(snap.progress.dailyStarsEarned, 3);
  assert.equal(snap.dailyQuotaReached, true);

  // CALENDAR DAY CHANGE: No midnight reset — stars and benchmark time are permanent
  simulatedDate = '2026-11-13';
  ctrl.goToHome();
  snap = ctrl.getSnapshot();
  assert.equal(snap.progress.dailyStarsDate, '2026-11-13');
  assert.equal(snap.progress.stars, 3); // Stars do NOT reset at midnight
  assert.equal(snap.progress.timeToBeatMs, 2200); // Benchmark is preserved across days — no reset
});

test('See Saw service worker installs cleanly and index.html includes See Saw banner in #rc-game-gallery', async () => {
  const handlers = {};
  const cachedRequired = [];
  let skippedWaiting = false;

  const cache = {
    async addAll(list) {
      cachedRequired.push(...list);
    },
    async add() {
      throw new Error('optional audio 404');
    }
  };

  const swPath = path.join(__dirname, '../assets/see-saw-scripts/sw.js');
  vm.runInNewContext(fs.readFileSync(swPath, 'utf8'), {
    self: {
      addEventListener(type, fn) {
        handlers[type] = fn;
      },
      async skipWaiting() {
        skippedWaiting = true;
      }
    },
    caches: {
      async open() {
        return cache;
      }
    },
    URL
  });

  let installPromise;
  handlers.install({
    waitUntil(p) {
      installPromise = p;
    }
  });
  await installPromise;
  assert.equal(skippedWaiting, true);
  assert.ok(cachedRequired.includes('./see-saw.html'));

  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const rcSectionStart = indexHtml.indexOf('id="rc-game-gallery"');
  const rcSectionEnd = indexHtml.indexOf('</section>', rcSectionStart);
  const rcGalleryMarkup = indexHtml.slice(rcSectionStart, rcSectionEnd);
  assert.ok(/assets\/see-saw-scripts\/see-saw\.html\?v=\d+&amp;from=rc-games/.test(rcGalleryMarkup));
  assert.ok(rcGalleryMarkup.includes('assets/see-saw-assets/page-1/page-1-bg.webp'));
});

test('Answer tray and options are hidden when outcome popups (correct, wrong, time-up, too-slow) are displayed', () => {
  const jsSource = fs.readFileSync(path.join(__dirname, '../assets/see-saw-scripts/see-saw.js'), 'utf8');
  assert.ok(
    jsSource.includes("p5TrayArea.hidden = snap.page !== 'page-5';"),
    'p5TrayArea must be hidden whenever page is not page-5'
  );
});

test('Page 4 rule text font-size matches other page text and shows configured question time', () => {
  const cssSource = fs.readFileSync(path.join(__dirname, '../assets/see-saw-scripts/see-saw.css'), 'utf8').replace(/\r\n/g, '\n');
  assert.ok(
    cssSource.includes('calc(var(--u) * 6.7)'),
    'Rule line 1 font size should match other page text (~5.7u)'
  );

  const jsSource = fs.readFileSync(path.join(__dirname, '../assets/see-saw-scripts/see-saw.js'), 'utf8');
  assert.ok(
    jsSource.includes("(Config.questionSeconds || 10) + ' seconds each'"),
    'Seconds display should use configured question duration'
  );
});

test('Wrong answer triggers dynamic seesaw tilt and smooth mascot sliding sequence towards the stone', () => {
  const cssSource = fs.readFileSync(path.join(__dirname, '../assets/see-saw-scripts/see-saw.css'), 'utf8').replace(/\r\n/g, '\n');
  assert.ok(cssSource.includes('ssSeesawTiltWrong'), 'Should define seesaw tilt keyframe animation');
  assert.ok(cssSource.includes('ssMascotSlideWrong'), 'Should define mascot sliding keyframe animation');
  assert.ok(cssSource.includes('.ss-mascot-wrap[data-mode="wrong"]'), 'Should bind mascot slide animation on wrong mode');
  assert.ok(cssSource.includes('.ss-seesaw-beam[data-tilt="wrong"]'), 'Should bind seesaw tilt animation on wrong tilt');

  const jsSource = fs.readFileSync(path.join(__dirname, '../assets/see-saw-scripts/see-saw.js'), 'utf8');
  assert.ok(jsSource.includes("p5MascotWrap.setAttribute('data-mode', beamTilt)"), 'Should update mascot wrap data-mode');
});

test('Question and answer stones are properly placed, symmetric, and seated on seesaw beam', () => {
  const cssSource = fs.readFileSync(path.join(__dirname, '../assets/see-saw-scripts/see-saw.css'), 'utf8').replace(/\r\n/g, '\n');

  // Verify left seat positioning
  assert.ok(cssSource.includes('.ss-seat-left {'), 'Should define .ss-seat-left');
  assert.ok(cssSource.includes('left: 4.8%;'), 'Left seat should start at 4.8% for snug yellow cap fit');
  assert.ok(cssSource.includes('top: 31.0%;'), 'Left seat should sit flush on plank surface at 30.2%');

  // Verify right seat symmetric positioning
  assert.ok(cssSource.includes('.ss-seat-right {'), 'Should define .ss-seat-right');
  assert.ok(cssSource.includes('left: 63.7%;'), 'Right seat should mirror left seat with 4.8% margin (63.7% + 31.5% = 95.2%)');

  // Verify z-index layering so rocks rest on top of plank rather than being clipped
  assert.ok(cssSource.includes('.ss-plank-wrap {\n  position: absolute;\n  left: 5.5%;\n  top: 42.2%;\n  width: 89.0%;\n  height: 5.5%;\n  z-index: 1;'), 'Plank wrap should have z-index: 1');
});



test('five lifetime stars, three per IST day; capped rounds earn no star and next day resumes',()=>{
 const storage=createMemoryStorage();let today='2026-11-12';const c=Core.createGameController({config:Config,storage,shuffleQuestions:false,getTodayDate:()=>today});
 const win=ms=>{c.startRound();for(let i=0;i<5;i++){const q=c.getSnapshot().currentQuestion;assert.equal(c.submitAnswer(q.id,ms).page,'page-6');c.advanceAfterCorrect();}return c.getSnapshot();};
 for(const ms of [7000,6000,5000])assert.equal(win(ms).lastStarSummary.newlyEarnedStar,true);
 let s=win(4000);assert.equal(s.progress.stars,3);assert.equal(s.lastStarSummary.newlyEarnedStar,false);assert.equal(c.proceedFromNewStarToStarEarned().page,'page-5');
 today='2026-11-13';s=c.getSnapshot();assert.equal(s.progress.stars,3);assert.equal(s.progress.dailyStarsEarned,0);
 assert.equal(win(3000).progress.stars,4);s=win(2000);assert.equal(s.progress.stars,5);assert.equal(s.progress.dailyStarsEarned,2);
 s=win(1000);assert.equal(s.progress.stars,5);assert.equal(s.progress.dailyStarsEarned,2);assert.equal(s.lastStarSummary.newlyEarnedStar,false);
 const reload=Core.createGameController({config:Config,storage,getTodayDate:()=>today});assert.equal(reload.getSnapshot().progress.stars,5);
 today='2026-11-14';assert.equal(c.getSnapshot().progress.stars,5);assert.equal(win(500).lastStarSummary.newlyEarnedStar,false);
 assert.equal(Core.getTodayDateString(new Date('2026-11-12T18:29:59Z')),'2026-11-12');assert.equal(Core.getTodayDateString(new Date('2026-11-12T18:30:00Z')),'2026-11-13');
});

test('fixed configured timeout with benchmark comparison after answer, including retries and equality',()=>{
 const make=()=>{const storage=createMemoryStorage();storage.setItem(Config.storageKey,JSON.stringify({version:1,stars:1,timeToBeatMs:5000}));const c=Core.createGameController({config:Config,storage,shuffleQuestions:false});c.startRound();return c;};
 for(const [ms,page]of [[4999,'page-6'],[5000,'page-12'],[5001,'page-12'],[9000,'page-12']]){const c=make();assert.equal(c.submitAnswer(c.getSnapshot().currentQuestion.id,ms).page,page);}
 const c=make();let s=c.submitAnswer(c.getSnapshot().currentQuestion.id,6000);assert.equal(s.page,'page-12');c.openRemediationVideo();c.completeRemediationVideo();c.retryCurrentQuestion();s=c.submitAnswer(c.getSnapshot().currentQuestion.id,6000);assert.equal(s.page,'page-12');
 const timeout=make().expireQuestion();assert.equal(timeout.outcome.elapsedMs,Config.questionSeconds*1000);assert.equal(timeout.page,'page-8');
});

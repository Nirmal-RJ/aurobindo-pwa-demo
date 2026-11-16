const { test } = require('node:test');
const assert = require('node:assert/strict');

let core;
test('load back-to-school-core module', async () => {
  core = await import('../assets/back-to-school-scripts/back-to-school-core.js');
  assert.equal(core.PAIRS.length, 5);
  assert.equal(core.ROUND_SECONDS, 90);
});

test('board creation, placement, return, swap, and completion', () => {
  let b = core.createBoard(() => 0.42);
  assert.equal(b.situationsOrder.length, 5);
  assert.equal(b.responsesOrder.length, 5);
  assert.equal(core.isBoardComplete(b), false);

  for (const p of core.PAIRS) {
    b = core.placeCard(b, 'left', p.id);
    b = core.placeCard(b, 'right', p.id);
  }
  assert.equal(core.isBoardComplete(b), true);

  // Swap two responses
  const before0 = b.rightSlots[0];
  const before1 = b.rightSlots[1];
  b = core.placeCard(b, 'right', before0, 1);
  assert.equal(b.rightSlots[1], before0);
  assert.equal(b.rightSlots[0], before1);

  const ev = core.evaluateBoard(b);
  assert.equal(ev.allCorrect, false);
  assert.equal(ev.wrongCount, 2);
  assert.equal(ev.wrongPairs.length, 2);

  // Return one card back to bank
  b = core.removeSlotCard(b, 'right', 0);
  assert.equal(b.rightSlots[0], null);
  assert.equal(core.isBoardComplete(b), false);
});

test('streak, star earned (3-game average target), too slow, and timeout', () => {
  let p = core.createInitialProgress();
  assert.equal(p.targetSeconds, 90);

  let r1 = core.applyRoundOutcome(p, { allCorrect: true, elapsedSeconds: 60, timedOut: false });
  assert.equal(r1.outcome, 'correct');
  assert.equal(r1.streak, 1);
  p = r1.progress;

  let r2 = core.applyRoundOutcome(p, { allCorrect: true, elapsedSeconds: 70, timedOut: false });
  assert.equal(r2.outcome, 'correct');
  assert.equal(r2.streak, 2);
  p = r2.progress;

  let r3 = core.applyRoundOutcome(p, { allCorrect: true, elapsedSeconds: 50, timedOut: false });
  assert.equal(r3.outcome, 'star');
  assert.equal(r3.averageSeconds, 60);
  assert.equal(r3.progress.stars, 1);
  assert.equal(r3.progress.streak, 0);
  assert.equal(r3.progress.targetSeconds, 60);
  p = r3.progress;

  // Too slow on next round (65s > 60s target)
  let rSlow = core.applyRoundOutcome(p, { allCorrect: true, elapsedSeconds: 65, timedOut: false });
  assert.equal(rSlow.outcome, 'too-slow');
  assert.equal(rSlow.progress.streak, 0);

  // Timeout resets streak
  let rTime = core.applyRoundOutcome({ ...p, streak: 2 }, { allCorrect: false, elapsedSeconds: 90, timedOut: true });
  assert.equal(rTime.outcome, 'timeout');
  assert.equal(rTime.progress.streak, 0);
});


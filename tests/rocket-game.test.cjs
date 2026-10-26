const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Game, recipes, missions, increment, bag } = require('../assets/rocket-game-scripts/rocket-game-core.js');

function setup(mission = 0) {
  let time = 0;
  const game = new Game({ schemaVersion: 1, unlocked: mission, completed: [], runs: [] }, () => time, () => .5);
  game.startMission(); game.selectRocket(2); game.beginAttempt();
  return { game, advance: seconds => { time += seconds * 1000; } };
}
function fillCorrect(game) {
  for (const c of ['Water', 'ACN', 'MeOH']) {
    while (game.mixture[c] < game.recipe.mix[c]) game.change(c);
  }
}
test('recipe bags exhaust five unique recipes and never repeat across boundaries', () => {
  let last;
  for (let i = 0; i < 100; i++) {
    const next = bag(last); assert.equal(new Set(next).size, 5); assert.notEqual(next[0], last); last = next.at(-1);
  }
});
test('pour increments match liquid-sort data and algorithm', () => {
  assert.deepEqual(recipes.map(r => ['Water', 'ACN', 'MeOH'].map(c => increment(r, c))), [[30,5,5],[10,20,10],[25,10,25],[15,35,10],[5,15,15]]);
  const fs = require('node:fs');
  const source = fs.readFileSync(require('node:path').join(__dirname, '../liquid-sort.js'), 'utf8');
  for (const r of recipes.slice(0, 4).map(r => ({ ...r, name: r.name === 'C Column Wash' ? 'Column Cleaning' : r.name }))) assert.ok(source.includes(`name: '${r.name}', mix: { Water: ${r.mix.Water}, ACN: ${r.mix.ACN}, MeOH: ${r.mix.MeOH} }`));
});
test('fill capacity and solvent-specific undo are bounded; partial launch rejected', () => {
  const { game } = setup();
  assert.equal(game.submit(), null);
  for (let i = 0; i < 30; i++) game.change('Water');
  assert.equal(game.total, 100); assert.equal(game.change('ACN'), false);
  game.change('Water', true); assert.equal(game.total, 100 - increment(game.recipe, 'Water'));
  for (let i = 0; i < 30; i++) game.change('Water', true);
  assert.equal(game.total, 0);
});

test('D Column Wash accepts 10/45/45 with matching fill and undo steps', () => {
  const { game } = setup();
  game.queue = [recipes.findIndex(r => r.name === 'D Column Wash')];
  game.nextQuestion(); game.selectRocket(1); game.beginAttempt();
  assert.deepEqual(game.recipe.mix, { Water: 10, ACN: 45, MeOH: 45 });
  fillCorrect(game);
  game.change('ACN', true); assert.equal(game.mixture.ACN, 30);
  game.change('ACN'); assert.equal(game.total, 100);
  assert.equal(game.submit().outcome, 'correct');
  assert.match(game.recipe.video, /d-column-wash\.webm$/);
});
test('correct launch applies time bonus and stores complete attempt data', () => {
  const { game, advance } = setup(); fillCorrect(game); advance(29);
  const result = game.submit();
  assert.equal(result.outcome, 'correct'); assert.equal(result.timeSaved, 11);
  assert.ok(Math.abs(result.calculatedDistance - 7770000) < .001);
  assert.equal(game.run.engines, 3); assert.equal(result.elapsedSeconds, 29);
  assert.ok(result.events.length); assert.deepEqual(result.mixture, game.recipe.mix);
});
test('wrong and timeout attempts never travel; retry empties chamber with full timer', () => {
  const { game, advance } = setup(); const recipeId = game.question.recipeId;
  for (let i = 0; i < 30; i++) game.change('Water');
  assert.equal(game.submit().outcome, 'incorrect'); assert.equal(game.run.distance, 0); assert.equal(game.run.engines, 2);
  game.retry(); assert.equal(game.total, 0); assert.equal(game.remaining, 40); assert.equal(game.question.recipeId, recipeId);
  advance(40); assert.equal(game.submit().outcome, 'timeout'); assert.equal(game.run.engines, 1);
  game.retry(); advance(41); assert.equal(game.submit().outcome, 'timeout');
  assert.equal(game.phase, 'failed'); assert.equal(game.run.status, 'failed'); assert.equal(game.run.distance, 0);
  assert.equal(game.question.attempts.length, 3);
  game.startMission(); assert.equal(game.run.engines, 3); assert.equal(game.data.runs.length, 2);
});
test('damaged engines use exact 33 and 66 percent penalties', () => {
  for (const engines of [1, 2]) {
    const { game, advance } = setup(); game.run.engines = engines; fillCorrect(game); advance(20);
    const a = game.submit(); assert.equal(a.engineFactor, engines === 2 ? .67 : .34);
    assert.equal(a.speed, 7000000 * a.engineFactor);
    assert.equal(a.calculatedDistance, a.speed * 1.2);
  }
});
test('deadline wins over a full correct mixture', () => {
  const { game, advance } = setup(); fillCorrect(game); advance(40);
  assert.equal(game.submit().outcome, 'timeout'); assert.equal(game.run.engines, 2);
});
test('travel caps at destination, unlocks next mission and awards stars once', () => {
  const { game } = setup(); game.run.distance = game.mission.distance - 10; fillCorrect(game);
  const result = game.submit(); assert.equal(result.appliedDistance, 10); assert.equal(game.run.distance, game.mission.distance);
  assert.equal(game.run.status, 'completed'); assert.equal(game.data.unlocked, 1); assert.equal(game.stars, 1);
  assert.equal(game.submit(), null);
  game.startMission(); assert.equal(game.mission.id, 1); assert.equal(game.run.engines, 3);
  assert.equal(missions.reduce((n, m) => n + m.stars, 0), 10);
});
test('restored history preserves attempts and marks unfinished runs interrupted', () => {
  const { game } = setup(); game.change('Water');
  const restored = new Game(JSON.parse(JSON.stringify(game.data)));
  assert.equal(restored.data.runs[0].status, 'interrupted');
  assert.equal(restored.data.runs[0].questions[0].attempts[0].outcome, 'interrupted');
  assert.ok(restored.data.runs[0].questions[0].attempts[0].events.length);
});
test('all seven missions reach Neptune and award exactly ten stars with preserved history', () => {
  const { game } = setup();
  for (let mission = 0; mission < 7; mission++) {
    if (mission) { game.startMission(); game.selectRocket(1); game.beginAttempt(); }
    assert.equal(game.mission.id, mission);
    while (game.run.status === 'active') {
      fillCorrect(game); game.submit();
      if (game.run.status === 'active') { game.nextQuestion(); game.selectRocket(1); game.beginAttempt(); }
    }
    assert.equal(game.run.distance, missions[mission].distance);
  }
  assert.equal(game.stars, 10); assert.equal(game.data.runs.length, 7); assert.equal(game.data.unlocked, 6);
  assert.equal(game.data.completed.length, 7);
  assert.equal(game.data.runs.reduce((sum, r) => sum + r.awardedStars, 0), 10);
});

 test('shared undo restores actual last fills in reverse order and logs them', () => {
  const { game } = setup();
  game.change('Water'); const first = {...game.mixture};
  game.change('ACN');
  assert.equal(game.undoLast(), 'ACN'); assert.deepEqual(game.mixture, first);
  while (game.total < 100) game.change('MeOH');
  const last = game.attempt.events.at(-1).amount;
  assert.equal(game.undoLast(), 'MeOH'); assert.equal(game.total, 100-last);
  while(game.fillHistory.length) game.undoLast();
  assert.equal(game.total,0); assert.equal(game.undoLast(),false);
  assert.equal(game.attempt.events.at(-1).source,'shared-undo');
 });

test('mission pace includes all resolved attempts and best spans completed missions only', () => {
 const {missionPace,bestMissionPace}=require('../assets/rocket-game-scripts/rocket-game-core.js');
 const run={missionId:0,status:'completed',questions:[{attempts:[{outcome:'incorrect',elapsedSeconds:10},{outcome:'timeout',elapsedSeconds:40},{outcome:'correct',elapsedSeconds:10},{outcome:'active',elapsedSeconds:0}]}]};
 assert.deepEqual(missionPace(run),{attemptCount:3,responseSeconds:60,averageSeconds:20});
 const other={missionId:4,status:'completed',questions:[{attempts:[{outcome:'correct',elapsedSeconds:12}]}]};
 assert.equal(bestMissionPace([run,other,{...other,status:'failed',questions:[{attempts:[{outcome:'incorrect',elapsedSeconds:1}]}]}]),12);
 assert.equal(bestMissionPace([]),null); assert.equal(missionPace({questions:[]}).averageSeconds,null);
 assert.equal(bestMissionPace([JSON.parse(JSON.stringify(run)),JSON.parse(JSON.stringify(other))]),12);
});

test('each selected rocket starts with three engines while retries retain its damage', () => {
 for (const losses of [1,2]) {
  const {game,advance}=setup();
  for(let i=0;i<losses;i++){advance(40);game.submit(true);game.retry();}
  assert.equal(game.run.engines,3-losses);
  fillCorrect(game);advance(10);const launched=game.submit();
  assert.equal(launched.engineFactor,losses===1?.67:.34);
  const distance=game.run.distance;const questions=game.run.questions.length;
  game.nextQuestion();game.selectRocket(2);game.beginAttempt();
  assert.equal(game.run.engines,3);assert.equal(game.attempt.enginesBefore,3);
  assert.equal(game.run.distance,distance);assert.equal(game.run.questions.length,questions+1);
  assert.equal(launched.enginesAfter,3-losses);
  assert.equal(game.run.events.at(-1).enginesAfter,3);
  fillCorrect(game);assert.equal(game.submit().engineFactor,1);
 }
});

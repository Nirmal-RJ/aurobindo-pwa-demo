const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = '../assets/my-carz-game-scripts/';
const C = require(base + 'my-carz-config.js');
const { Game, QuestionPicker, freshProfile, dayKey, nextMidnight } = require(base + 'my-carz-core.js');
const { LocalAdapter, Repository, key } = require(base + 'my-carz-store.js');
const { preload } = require(base + 'my-carz-preload.js');
const { assetKey, cachedResponse } = require(base + 'my-carz-asset-cache.js');
const raceView = require(base + 'my-carz-race-view.js');
const today = Date.parse('2026-10-27T09:00:00Z');
const make = (saved, options = {}) => new Game(saved, { now: () => today, random: () => .2, ...options });
function answer(game, correct = true) {
  const q = game.next(), lane = game.day.lanes.indexOf(q.answer);
  return game.answer(correct ? lane : 1 - lane);
}
function complete(game) { game.begin(); for (let i = 0; i < 5; i++) answer(game); return game.complete(); }

test('Starts with car-1 and unlocks precisely eight further cars', () => {
  const g = make(); assert.equal(g.day.unlocked, 1);
  for (let i = 1; i < 9; i++) {
    const result = complete(g); assert.equal(result.unlocked, i); assert.equal(g.day.unlocked, i + 1);
    assert.equal(g.day.selected, i); assert.equal(g.day.level, i + 1); assert.equal(g.streak, 0);
  }
  assert.equal(g.freePlay, true); const speed = g.travelSeconds;
  assert.equal(complete(g).unlocked, null); assert.equal(g.day.unlocked, 9); assert.equal(g.travelSeconds, speed);
});
test('Wrong third answer clears diamonds without losing the car/level/lane assignment', () => {
  const g = make(); complete(g); g.begin(); const lanes = [...g.day.lanes];
  answer(g); answer(g); const oldQuestion = g.question.id; assert.equal(g.streak, 2);
  const result = answer(g, false); assert.equal(result.correct, false); assert.equal(g.streak, 0);
  assert.equal(g.day.level, 2); assert.equal(g.day.selected, 1); assert.deepEqual(g.day.lanes, lanes);
  const failed = g.question.id; assert.notEqual(g.next().id, failed); assert.notEqual(oldQuestion, failed);
});
test('No three-life limit; a failed attempt can recover with five correct answers', () => {
  const g = make(); g.begin(); for (let i = 0; i < 8; i++) answer(g, false);
  for (let i = 0; i < 5; i++) answer(g); g.complete(); assert.equal(g.day.unlocked, 2);
  assert.equal(g.day.stats.wrong, 8); assert.equal(g.day.stats.answered, 13);
});
test('Partial progress is never in checkpoints, even after preference saves', () => {
  const g = make(); complete(g); complete(g); assert.equal(g.day.level, 3);
  g.begin(); answer(g); answer(g); g.select(0); g.paint('blue');
  const reopened = make(g.checkpoint()); assert.equal(reopened.day.level, 3); assert.equal(reopened.streak, 0);
  assert.equal(reopened.day.stats.answered, 10); assert.equal(reopened.day.selected, 0); assert.equal(reopened.day.colors[0], 'blue');
  assert.deepEqual(reopened.day.exposure, g.committed.exposure);
});
test('Save/exit discards pending answers and retains completed stats and color', () => {
  const g = make(); complete(g); g.begin(); answer(g, false); g.paint('red'); g.discard();
  assert.equal(g.active, false); assert.equal(g.day.stats.answered, 5); assert.equal(g.day.colors[1], 'red');
});
test('Full-bank coverage and balanced exposure over many failed attempts', () => {
  let seed = 7; const random = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const picker = new QuestionPicker(C.questions, {}, [], random); const first = [];
  for (let i = 0; i < C.questions.length; i++) first.push(picker.next().id);
  assert.equal(new Set(first).size, C.questions.length);
  let previous;
  for (let i = 0; i < 1000; i++) { const q = picker.next(); assert.notEqual(q.id, previous); previous = q.id; }
  const counts = Object.values(picker.exposure); assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
});
test('No repetition within five-question streak and progress survives checkpoint', () => {
  const g = make(); g.begin(); const seen = new Set();
  for (let i = 0; i < 5; i++) { const q = g.next(); assert.ok(!seen.has(q.id)); seen.add(q.id); answer(g); }
  g.complete(); const resumed = make(g.checkpoint()); resumed.begin(); const next = resumed.next(); assert.ok(!seen.has(next.id));
});
test('Duplicate resolutions cannot award diamonds or cars twice', () => {
  const g = make(); g.begin(); answer(g); assert.equal(g.answer(0), null); assert.equal(g.streak, 1);
  assert.throws(() => g.complete(), /Five consecutive/); for (let i = 0; i < 4; i++) answer(g);
  g.complete(); assert.throws(() => g.complete(), /Five consecutive/);
});
test('Random lanes assigned once per level; failures do not reroll', () => {
  let n = 0; const g = make(null, { random: () => (++n % 2 ? .1 : .9) });
  const before = [...g.day.lanes]; g.begin(); answer(g, false); assert.deepEqual(g.day.lanes, before);
  for (let i = 0; i < 5; i++) answer(g); g.complete(); assert.ok(['Good,Bad', 'Bad,Good'].includes(g.day.lanes.join()));
});
test('Every upgrade and free play retain the level-one answer window', () => {
  const g = make();
  for (let level = 1; level <= 9; level++) {
    assert.equal(g.travelSeconds, 3.8);
    assert.equal(g.select(0), true); assert.equal(g.travelSeconds, 3.8);
    complete(g);
  }
  assert.equal(g.freePlay, true); assert.equal(g.travelSeconds, 3.8);
  assert.equal(C.readingSeconds, 2);
});
test('Midnight is fixed IST and active levels defer reset through retries', () => {
  assert.equal(dayKey(Date.parse('2026-10-27T18:29:59Z')), '2026-10-27');
  assert.equal(dayKey(Date.parse('2026-10-27T18:30:00Z')), '2026-10-28');
  assert.equal(nextMidnight(today), Date.parse('2026-10-27T18:30:00Z'));
  let now = today; const g = make(null, { now: () => now }); g.profile.device.demoDone = true; g.begin(); answer(g);
  now = Date.parse('2026-10-27T18:30:01Z'); assert.equal(g.checkDay(), false); assert.equal(g.pendingReset, true);
  answer(g, false); assert.equal(g.checkDay(), false); assert.equal(g.day.date, '2026-10-27');
  for (let i = 0; i < 5; i++) answer(g); g.complete(); assert.equal(g.checkDay(), true);
  assert.equal(g.day.date, '2026-10-28'); assert.equal(g.day.unlocked, 1); assert.equal(g.day.selected, 0);
  assert.equal(g.profile.device.demoDone, true); assert.equal(g.profile.lifetime.archives[0].unlocked, 2);
});
test('Reopen on another day resets immediately, retaining archived completed progress', () => {
  const g = make(); complete(g); const old = g.checkpoint();
  const reopened = make(old, { now: () => today + 86400000 });
  assert.equal(reopened.day.unlocked, 1); assert.equal(reopened.profile.lifetime.archives[0].stats.answered, 5);
});
test('Daily archives retain the latest car/paint preferences without partial answers', () => {
  let time = today;
  const g = make(null, { now: () => time }); complete(g); g.select(0); g.paint('blue');
  g.begin(); answer(g); g.discard(); time += 86400000; g.checkDay();
  const archived = g.profile.lifetime.archives[0];
  assert.equal(archived.colors[0], 'blue'); assert.equal(archived.selected, 0); assert.equal(archived.stats.answered, 5);
});
test('Incomplete tutorial remains incomplete; device completion survives daily resets', () => {
  const g = make(); assert.equal(g.open(), false); const reopened = make(g.checkpoint());
  assert.equal(reopened.open(), true); assert.equal(reopened.profile.device.demoDone, false);
  reopened.profile.device.demoDone = true; assert.equal(make(reopened.checkpoint()).profile.device.demoDone, true);
});
test('Locked cars and invalid colors cannot be selected', () => {
  const g = make(); assert.equal(g.select(5), false); assert.equal(g.select(-1), false);
  assert.equal(g.paint('invalid'), false); complete(g); assert.equal(g.select(0), true);
});
test('Plays count starts from home, not automatic continuation after an upgrade', () => {
  const g = make(); complete(g); g.begin({ countPlay: false });
  assert.equal(g.profile.lifetime.plays, 1); assert.equal(g.day.stats.plays, 1);
  g.discard(); g.begin(); assert.equal(g.profile.lifetime.plays, 2);
  assert.equal(make(g.checkpoint()).day.stats.plays, 2);
});
test('Repository is replaceable and serializes checkpoints; failures are surfaced', async () => {
  const writes = []; let value; const repo = new Repository({ load: async () => value, save: async data => { writes.push(data.day.level); value = data; } });
  const g = make(); const first = repo.save(g.checkpoint()); complete(g); const second = repo.save(g.checkpoint());
  await Promise.all([first, second]); assert.deepEqual(writes, [1, 2]); assert.equal((await repo.load()).day.level, 2);
  const broken = new Repository({ save: async () => { throw new Error('quota'); } }); await assert.rejects(broken.save(g.checkpoint()), /quota/);
});
test('Corrupt JSON is reported without overwriting the original saved data', async () => {
  const adapter = new LocalAdapter({ getItem: () => '{oops', setItem: () => assert.fail('must not overwrite') });
  await assert.rejects(adapter.load(), /not been overwritten/); assert.equal(key, 'my-carz-progress-v2');
});
test('Manifest only includes real production media and all configured car/demo paths', () => {
  const folder = path.resolve(__dirname, base), context = {};
  vm.runInNewContext(fs.readFileSync(path.join(folder, 'my-carz-assets.js'), 'utf8') + ';globalThis.entries=CARZ_ASSETS;', context);
  const entries = context.entries;
  for (const entry of entries) { const bytes = fs.readFileSync(path.resolve(folder, entry.url)); assert.equal(bytes.length, entry.bytes); assert.ok(!/reference|referene|\/old-/i.test(entry.url)); }
  for (const file of [...C.cars.flatMap(c => [c.driving, c.preview]), ...C.demos]) assert.ok(entries.some(e => e.url.endsWith('/' + file)), file);
});
test('Preload streams byte progress, retries, and reuses completed content revisions', async () => {
  const entries = [{ url: '../media/a.webp', bytes: 4, revision: 'one' }], saved = new Map(); let calls = 0, last;
  const cache = { match: async k => saved.get(k)?.clone(), put: async (k, v) => saved.set(k, v) };
  const options = { entries, cache, base: 'https://game.test/scripts/', assetKey, onProgress: p => { last = p; }, fetcher: async () => { calls++; if (calls === 1) throw Error('temporary'); return new Response('test', { headers: { 'Content-Type': 'image/webp' } }); } };
  await preload(options); assert.equal(calls, 2); assert.equal(last.loaded, 4); assert.equal(last.complete, 1);
  await preload(options); assert.equal(calls, 2);
});
test('Cached media supports ranges for future supplied audio/video', async () => {
  const entries = [{ url: '../media/a.wav', bytes: 4, revision: 'one' }];
  const result = await cachedResponse(new Request('https://game.test/media/a.wav', { headers: { Range: 'bytes=1-2' } }),
    { match: async () => new Response('test') }, entries, 'https://game.test/scripts/');
  assert.equal(result.status, 206); assert.equal(await result.text(), 'es');
});
test('Faster moving tunnels still cross the measured car nose at the original deadline', () => {
  for (const nose of [.55, .7, .8]) {
    assert.ok(raceView.gatePosition(0, nose) + .225 < 0, 'gate begins outside the viewport');
    assert.ok(Math.abs(raceView.gatePosition(1, nose) + .225 / 2 - nose) < 1e-10);
    let previous = raceView.gatePosition(0, nose);
    for (let i = 1; i <= 100; i++) {
      const y = raceView.gatePosition(i / 100, nose);
      assert.ok(y > previous); previous = y;
    }
  }
});
test('Lane guidance remains tied to physical nearness after the motion synchronization', () => {
  assert.equal(raceView.geometry('reading', 1).arrow, false);
  assert.equal(raceView.geometry('intro', 1).arrow, false);
  assert.equal(raceView.geometry('travel', .6).arrow, false);
  assert.equal(raceView.geometry('travel', .9).arrow, true);
  const nose = .7, late = 1 - (1 - raceView.motion.arrowAt) / raceView.motion.visualSpeed;
  const gap = nose - (raceView.gatePosition(late, nose) + .225 / 2);
  assert.ok(gap > 0 && gap < .3, 'guidance begins only near the car');
});

test('Per-model paint preferences survive reload, midnight and re-unlocking', () => {
  const g=make();g.paint('gold');complete(g);g.paint('blue');complete(g);g.paint('red');
  const saved=g.checkpoint();assert.deepEqual(saved.preferences.carColors, Object.fromEntries(C.cars.map((car,i)=>[car.id,['gold','blue','red'][i]||'original'])));
  const reopened=make(saved);assert.deepEqual(reopened.day.colors.slice(0,3),['gold','blue','red']);
  const tomorrow=make(saved,{now:()=>today+86400000});assert.equal(tomorrow.day.unlocked,1);assert.equal(tomorrow.day.selected,0);
  assert.deepEqual(tomorrow.day.colors.slice(0,3),['gold','blue','red']);complete(tomorrow);assert.equal(tomorrow.day.colors[1],'blue');
});
test('Legacy daily paint migrates to stable model IDs and invalid preference values are ignored', () => {
  const saved=make().checkpoint();delete saved.preferences;saved.day.colors[0]='purple';
  const migrated=make(saved);assert.equal(migrated.checkpoint().preferences.carColors['car-1'],'purple');
  const profile=migrated.checkpoint();profile.preferences.carColors['car-1']='not-a-color';
  assert.equal(make(profile).day.colors[0],'purple');
});
test('Repository sends per-model preferences with the same checkpoint contract to any adapter', async () => {
  let row;const repo=new Repository({save:async value=>{row=value;},load:async()=>row});
  const g=make();g.paint('pink');g.begin();answer(g);await repo.save(g.checkpoint());
  const recovered=make(await repo.load());assert.equal(recovered.day.colors[0],'pink');assert.equal(recovered.streak,0);assert.equal(recovered.day.stats.answered,0);
  assert.equal(row.preferences.carColors['car-1'],'pink');
});


test('All car display paths use supplied models in the approved order', () => {
  assert.deepEqual(C.cars.map(car=>car.name), ['Mini','Hatchback','Sedan','SUV','Luxury','Limousine','Sports','F2','F1']);
  for(const car of C.cars){
    assert.match(car.driving, /^cars-top-view\//);
    assert.match(car.preview, /^car-iso-view\//);
    assert.equal(car.preview,car.garagePreview);
  }
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { GoodBadUglyRun, SCENARIOS, LANE_LABELS, ROUND_COUNT, CARS, GarageProgress, advanceCar, gatePosition } = require('../good-bad-ugly.js');
test('A level scores immediately and ends after five distinct questions',()=>{
 const run=new GoodBadUglyRun();const seen=new Set();assert.equal(ROUND_COUNT,5);
 for(let i=0;i<5;i++){const r=run.next();seen.add(r.index);const speed=run.multiplier;assert.equal(run.resolve(r.lane),true);assert.ok(run.multiplier>speed);assert.equal(run.resolve(r.lane),null);assert.equal(run.finished,i===4);}
 assert.equal(seen.size,5);assert.equal(run.score,5);assert.equal(run.count,5);assert.equal(run.next(),null);
});
test('Wrong choices cost lives from the first question and three mistakes end the run',()=>{
 const run=new GoodBadUglyRun();
 for(let i=0;i<3;i++){const r=run.next();run.resolve((r.lane+1)%3);assert.equal(run.lives,2-i);}
 assert.equal(run.finished,true);assert.equal(run.misses.length,3);assert.equal(run.next(),null);
});
test('Five answered questions complete a level even with mistakes',()=>{
 const run=new GoodBadUglyRun();for(let i=0;i<5;i++){const r=run.next();run.resolve(i<2?(r.lane+1)%3:r.lane);}
 assert.equal(run.finished,true);assert.equal(run.count,5);assert.equal(run.score,3);assert.equal(run.lives,1);
});
test('Car interpolates and reverses without snapping',()=>{const p=advanceCar(.25,.75,1/60);assert.ok(p>.25&&p<.75);assert.ok(advanceCar(p,.25,1/60)<p);assert.equal(advanceCar(.4,.75,0),.4);});

test('Every scenario uses fixed Good, Bad, Ugly lanes without revealing its answer',()=>{
 const run=new GoodBadUglyRun();const seen=new Set();
 for(let i=0;i<ROUND_COUNT;i++){const r=run.next();seen.add(r.lane);assert.deepEqual(r.options,['Good','Bad','Ugly']);assert.equal(r.lane,SCENARIOS[r.index].lane);assert.equal(r.answer,LANE_LABELS[r.lane]);assert.doesNotMatch(r.prompt,/\b(good|bad|ugly)\b/i);run.resolve(r.lane);}
 assert.ok(seen.size >= 1);
 for(const [prompt,lane] of [['Broken test tube',1],['Followed the lab rules',0],['Contaminated sample',2]]) assert.equal(SCENARIOS.find(s=>s.prompt===prompt).lane,lane);
});

test('Incoming gates start above track and reach the car as the round ends',()=>{
 for(const height of [300,500,800]){
  assert.equal(gatePosition(0,height),-100);
  assert.ok(gatePosition(.5,height)>gatePosition(0,height));
  assert.ok(gatePosition(1,height)>gatePosition(.5,height));
  assert.equal(gatePosition(1,height)+37,height-8-Math.min(height*.24,130)/2);
 }
});

test('Questions allow 5.2 seconds initially and at least 4.2 seconds throughout a level',()=>{
 const run=new GoodBadUglyRun();assert.equal(run.duration,5.2);
 for(let i=0;i<5;i++){assert.ok(run.duration>=4.2);const r=run.next();run.resolve(r.lane);}
});

function perfectLevel(){const run=new GoodBadUglyRun();for(let i=0;i<5;i++){const r=run.next();run.resolve(r.lane);}return run;}
test('Fiat starts unlocked; a perfect level unlocks exactly one car and preserves selection',()=>{
 const garage=new GarageProgress();assert.equal(garage.level,1);assert.equal(garage.selected,0);assert.equal(garage.select(1),false);
 assert.deepEqual(garage.complete(perfectLevel()),{passed:true,unlocked:1});assert.equal(garage.level,2);assert.equal(garage.selected,0);assert.equal(garage.select(1),true);assert.equal(garage.select(2),false);
 assert.equal(new GarageProgress(JSON.parse(JSON.stringify(garage))).selected,1);
});
test('An imperfect or unfinished run cannot advance the garage',()=>{
 const garage=new GarageProgress();const run=new GoodBadUglyRun();assert.equal(garage.complete(run).passed,false);
 for(let i=0;i<5;i++){const r=run.next();run.resolve(i===0?(r.lane+1)%3:r.lane);}assert.equal(garage.complete(run).passed,false);assert.equal(garage.level,1);
});
test('All six cars unlock in order and the final perfect level earns champion status',()=>{
 const garage=new GarageProgress();for(let i=1;i<CARS.length;i++){assert.equal(garage.complete(perfectLevel()).unlocked,i);assert.equal(garage.level,i+1);}
 assert.equal(garage.champion,false);assert.equal(garage.complete(perfectLevel()).unlocked,null);assert.equal(garage.champion,true);for(let i=0;i<CARS.length;i++)assert.equal(garage.select(i),true);
});
test('Invalid saved progress cannot select locked or nonexistent cars',()=>{
 for(const saved of [{level:-1,selected:5},{level:2,selected:4},{level:'6',selected:-1}]){const garage=new GarageProgress(saved);assert.equal(garage.selected,0);assert.ok(garage.level>=1&&garage.level<=6);}
});

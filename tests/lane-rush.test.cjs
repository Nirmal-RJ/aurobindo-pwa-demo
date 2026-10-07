const { test } = require('node:test');
const assert = require('node:assert/strict');
const { LaneRushRun, advanceCar } = require('../lane-rush.js');
function practice(run) { for(let i=0;i<5;i++){const r=run.next();run.resolve(r.lane);} }
test('Practice repeats missed pairs without losing lives until all five are correct',()=>{
 const run=new LaneRushRun();const first=run.next();run.resolve(1-first.lane);assert.equal(run.lives,3);assert.equal(run.duration,5);assert.equal(run.score,0);
 for(let i=0;i<4;i++){const r=run.next();assert.notEqual(r.prompt,first.prompt);run.resolve(r.lane);}
 assert.equal(run.phase,'practice');assert.equal(run.mastered.size,4);const retry=run.next();assert.equal(retry.prompt,first.prompt);run.resolve(retry.lane);assert.equal(run.phase,'final');assert.equal(run.mastered.size,5);
});
test('Final set covers all five pairs, boosts speed, and finishes',()=>{
 const run=new LaneRushRun();practice(run);assert.ok(run.duration > 2.4);const seen=new Set();
 for(let i=0;i<5;i++){const r=run.next();seen.add(r.prompt);const speed=run.multiplier;run.resolve(r.lane);assert.ok(run.multiplier>speed);assert.equal(run.resolve(r.lane),null);}
 assert.equal(seen.size,5);assert.equal(run.score,5);assert.equal(run.finalCount,5);assert.equal(run.finished,true);assert.equal(run.next(),null);
});
test('Three final mistakes end race; practice mistakes do not',()=>{
 const run=new LaneRushRun();for(let i=0;i<12;i++){const r=run.next();run.resolve(1-r.lane);}assert.equal(run.finished,false);assert.equal(run.lives,3);practice(run);
 for(let i=0;i<3;i++){const r=run.next();run.resolve(1-r.lane);}assert.equal(run.finished,true);assert.equal(run.misses.length,3);
});
test('Car interpolates and reverses without snapping',()=>{const p=advanceCar(.25,.75,1/60);assert.ok(p>.25&&p<.75);assert.ok(advanceCar(p,.25,1/60)<p);assert.equal(advanceCar(.4,.75,0),.4);});

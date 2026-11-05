const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../assets/ab-express-scripts/ab-express-config.js');
const Core = require('../assets/ab-express-scripts/ab-express-core.js');
test('shared pool draws eight ordered unique steps with exactly one of the first three', () => {
  assert.equal(C.steps.length,17);
  const seen=new Set();
  for(let i=0;i<1000;i++){const round=Core.drawRound();assert.ok(Core.validRound(round));round.forEach(id=>seen.add(id));}
  assert.equal(seen.size,17);
});
test('validation stops at first wrong compartment',()=>{
 const correct=Core.drawRound();assert.equal(Core.evaluate(correct,correct).correct,true);
 for(let i=0;i<7;i++){const answer=correct.slice();[answer[i],answer[i+1]]=[answer[i+1],answer[i]];assert.equal(Core.evaluate(correct,answer).checked,i+1);}
 assert.throws(()=>Core.evaluate(correct,Array(8).fill(correct[0])));
});
test('three fresh selections and failure avoids failed selection even with fixed RNG',()=>{
 for(const random of [Math.random,()=>0,()=>.999]){const failed=Core.drawRound([],random);const run=Core.newRun(failed,random);assert.equal(new Set(run.order.map(x=>x.join(','))).size,3);run.order.forEach(x=>{assert.ok(Core.validRound(x));assert.notDeepEqual(x,failed);});}
});
test('saved selections and streak survive reload; three successes award one star',()=>{
 let p={demoComplete:true,stars:2,run:Core.newRun()};const initial=structuredClone(p.run.order);
 for(let i=1;i<=2;i++){p=Core.pass(p);p=Core.clean(JSON.parse(JSON.stringify(p)));assert.equal(p.run.index,i);assert.deepEqual(p.run.order,initial);assert.equal(p.stars,2);}
 p=Core.pass(p);assert.equal(p.stars,3);assert.equal(p.run,null);
});
test('legacy saves retain completed streak; malformed runs are rejected',()=>{
 const p=Core.clean({demoComplete:true,stars:2,run:{order:[0,1,2,3,4],index:2}});assert.equal(p.run.index,2);assert.equal(p.stars,2);assert.ok(p.run.order.every(Core.validRound));
 assert.equal(Core.clean({run:{order:[0,0,2,3,4],index:2}}).run,null);
 const run=Core.newRun();run.order[1]=run.order[0];assert.equal(Core.clean({run}).run,null);
});

test('legacy streaks already at three award once; practice retains five rounds',()=>{let p=Core.clean({stars:2,run:{order:[0,1,2,3,4],index:3}});assert.equal(p.stars,3);assert.equal(p.run,null);assert.deepEqual(Core.clean(p),p);assert.equal(Core.newRun(null,Math.random,C.practiceRounds).order.length,5);});

test('tester screenshot exact arrangement is correct',()=>{const steps=[2,5,6,7,8,11,14,15];assert.deepEqual(Core.evaluate(steps,steps),{correct:true,firstWrong:-1,checked:8});});

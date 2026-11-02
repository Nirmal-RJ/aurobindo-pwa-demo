const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../assets/ab-express-scripts/ab-express-config.js');
const Core = require('../assets/ab-express-scripts/ab-express-core.js');
test('all five approved buckets contain eight unique canonical steps', () => {
  assert.equal(C.steps.length, 24);
  assert.deepEqual(C.buckets, [[1,3,6,7,8,13,15,21],[2,4,5,8,9,10,12,13],[3,9,10,11,12,13,15,16],[8,13,15,16,17,18,21,22],[8,9,10,14,19,20,23,24]]);
  assert.equal(new Set(C.buckets.flat()).size, 24);
});
test('validation stops at the first wrong compartment and rejects malformed submissions', () => {
  for (let bucket = 0; bucket < 5; bucket++) {
    const correct = C.buckets[bucket];
    assert.deepEqual(Core.evaluate(bucket, correct), { correct: true, firstWrong: -1, checked: 8 });
    for (let i = 0; i < 7; i++) { const answer = correct.slice(); [answer[i],answer[i+1]]=[answer[i+1],answer[i]]; assert.equal(Core.evaluate(bucket,answer).checked,i+1); }
    assert.throws(() => Core.evaluate(bucket,Array(8).fill(correct[0])));
  }
});
test('challenge visits each bucket once and failure starts with a different bucket', () => {
  for (let failed = 0; failed < 5; failed++) for (let attempt = 0; attempt < 100; attempt++) {
    const run = Core.newRun(failed); assert.equal(new Set(run.order).size,5); assert.notEqual(run.order[0],failed);
  }
});
test('five successes award exactly one star and interrupted progress retains current bucket', () => {
  let p = { demoComplete:true, stars:2, run:Core.newRun() }; const initial=p.run.order.slice();
  for(let i=1;i<=4;i++){p=Core.pass(p);assert.equal(p.run.index,i);p=Core.clean(JSON.parse(JSON.stringify(p)));assert.deepEqual(p.run.order,initial);assert.equal(p.stars,2);}
  p=Core.pass(p);assert.equal(p.stars,3);assert.equal(p.run,null);assert.throws(()=>Core.pass(p));
});
test('corrupt saved runs cannot skip or duplicate buckets', () => {
  assert.equal(Core.clean({run:{order:[0,0,2,3,4],index:2}}).run,null);
  assert.equal(Core.clean({run:{order:[0,1,2,3,4],index:5}}).run,null);
  assert.equal(Core.clean({stars:-1}).stars,0);
});

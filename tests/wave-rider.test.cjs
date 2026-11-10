const {test}=require('node:test'),assert=require('node:assert/strict');const C=require('../assets/wave-rider-scripts/wave-rider-config.js'),K=require('../assets/wave-rider-scripts/wave-rider-core.js');
test('spreadsheet bank preserves all 87 questions, answers and explanations',()=>{assert.equal(C.boats.length,9);assert.equal(C.questions.length,87);assert.equal(C.questions.filter(q=>q.answer).length,44);assert.equal(new Set(C.questions.map(q=>q.id)).size,87);assert.equal(require('node:crypto').createHash('sha256').update(JSON.stringify(C.questions)).digest('hex'),'005463c8d3b1d2a5165a07f74187385e27bc8e4a4826a5f5c3953cd7d65b2706');});
test('lane changes remove time only; cannot return to center; selected final lane grades once',()=>{let t=0;const r=new K.Run(C,K.fresh(),()=>t);r.next();r.question={answer:true};t=1000;assert(r.change(1));assert.equal(r.remaining(),7000);assert(!r.change(0));assert(!r.change(1));t=2000;r.change(-1);assert.equal(r.remaining(),4000);t=2500;r.change(1);assert.equal(r.remaining(),1500);t=4000;const a=r.settle();assert(a.correct);assert.equal(a.points,6);assert.equal(r.settle(),null);});
test('penalty exhaustion earns flag but zero points if final lane correct; no swipe crashes',()=>{let t=0;const r=new K.Run(C,K.fresh(),()=>t);r.next();r.change(-1);r.change(1);r.change(-1);r.change(1);r.change(-1);r.question={answer:false};assert.equal(r.remaining(),0);const a=r.settle();assert(a.correct);assert.equal(a.points,0);assert.equal(r.flags,1);r.next();t=9000;assert(r.settle().crash);assert.equal(r.flags,0);});
test('56 correct unlocks final boat and one star; three stars capped; score retained through restart',()=>{let t=0;const s=K.fresh(),r=new K.Run(C,s,()=>t);for(let star=1;star<=3;star++){for(let level=0;level<8;level++){for(let flag=0;flag<7;flag++){r.next();r.question={answer:true};t+=1000;r.change(1);t+=7000;const a=r.settle();assert(a.correct);assert.equal(a.upgrade,flag===6);}assert.equal(r.upgrade(),level===7);}assert.equal(s.stars,star);assert.equal(s.level,8);const score=s.score;r.restartCycle();assert.equal(s.score,score);if(star<3)assert.equal(s.level,0);}for(let i=0;i<7;i++){r.next();r.question={answer:true};r.change(1);r.settle();}assert.equal(r.upgrade(),false);assert.equal(s.stars,3);});
test('midnight IST resets score/boats/stars but preserves completed demo; reload loses streak only',()=>{const before=Date.parse('2026-11-10T18:29:59Z'),after=before+2000;const s=K.fresh(before,true);Object.assign(s,{score:100,stars:2,level:4,unlocked:4});const reload=K.load(s,before);assert.equal(reload.level,4);assert.equal(new K.Run(C,reload).flags,0);assert.deepEqual(K.load(s,after),K.fresh(after,true));});

test('correct-lane elapsed seconds reset on leaving and persist with settled question only',()=>{
 let t=100000;const saved=K.fresh(),r=new K.Run(C,saved,()=>t);r.next();r.question={id:'timing-test',answer:true};
 assert.equal(r.correctLaneEnteredSeconds,null);
 t+=1250;r.change(1);assert.equal(r.correctLaneEnteredSeconds,1.25);
 t+=250;assert.equal(r.change(1),false);assert.equal(r.correctLaneEnteredSeconds,1.25);
 r.change(-1);assert.equal(r.correctLaneEnteredSeconds,null);
 t+=625;r.change(1);assert.equal(r.correctLaneEnteredSeconds,2.125);assert.equal(r.penalty,4000);
 assert.equal(saved.questionResults.length,0);
 t+=3000;const result=r.settle();assert.equal(result.correctLaneEnteredSeconds,2.125);
 assert.equal(saved.questionResults.length,1);r.settle();assert.equal(saved.questionResults.length,1);
 const restored=K.load(JSON.parse(JSON.stringify(saved)));assert.deepEqual(restored.questionResults,saved.questionResults);
 assert.equal(restored.questionResults[0].questionId,'timing-test');
 r.next();r.question={id:'wrong',answer:true};assert.equal(r.correctLaneEnteredSeconds,null);
 r.change(1);t+=100;r.change(-1);assert.equal(r.settle().correctLaneEnteredSeconds,null);
 r.next();assert.equal(r.settle().correctLaneEnteredSeconds,null);
});
test('older progress without question results remains loadable',()=>{
 const old=K.fresh();delete old.questionResults;assert.deepEqual(K.load(old).questionResults,[]);
});

test('up commitment freezes time and lane while scoring keeps correct entry time',()=>{
 let t=0;const r=new K.Run(C,K.fresh(),()=>t);r.next();r.question={id:'commit',answer:true};t=1250;r.change(1);t=3000;assert(r.commit());const remaining=r.remaining();t=9000;assert.equal(r.remaining(),remaining);assert(!r.change(-1));assert(!r.commit());const result=r.settle();assert.equal(result.points,7);assert.equal(result.correctLaneEnteredSeconds,1.25);assert(result.correct);
 r.next();assert(!r.committed);t+=100;assert(r.commit());assert(r.settle().crash);
 r.next();t+=8001;assert(!r.commit());
});

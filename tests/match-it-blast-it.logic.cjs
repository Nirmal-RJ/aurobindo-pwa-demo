const assert=require('node:assert/strict'),L=require('../assets/match-it-blast-it-scripts/match-it-blast-it-logic.js');
const attempt=(p,time,correct=true,expired=false)=>L.complete(p,{elapsedMs:time,correct,expired});
assert.equal(attempt(L.empty(),19999).qualified,true);
assert.equal(attempt(L.empty(),20000).qualified,false);
assert.equal(attempt(L.empty(),20001).reason,'target');
let p=L.empty();for(const time of [18000,19000,17000]){var o=attempt(p,time);p=o.progress;}
assert.equal(o.won,true);assert.equal(p.stars,1);assert.equal(p.bestAverageMs,18000);assert.deepEqual(p.streak,[]);
assert.equal(attempt(p,18000).qualified,false);assert.equal(attempt(p,17999).qualified,true);
p=attempt(p,17000).progress;assert.deepEqual(L.restore(JSON.parse(JSON.stringify(p))),p);
for(const [correct,expired] of [[false,false],[true,true],[false,true]])assert.deepEqual(attempt(p,1000,correct,expired).progress.streak,[]);
for(const time of [16000,15000]){o=attempt(p,time);p=o.progress;}assert.equal(p.stars,2);assert.equal(p.bestAverageMs,16000);
assert.deepEqual(L.restore({streak:[NaN,2],stars:-1}),L.empty());
console.log('Strict timing boundaries, streak resets, persistence, repeat awards and best averages passed');

assert.equal(attempt({stars:1,bestAverageMs:17000.5,streak:[]},17000.6).qualified,false);
assert.equal(attempt({stars:1,bestAverageMs:17000.5,streak:[]},17000.4).qualified,true);

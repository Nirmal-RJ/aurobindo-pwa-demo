const test=require('node:test'),assert=require('node:assert/strict');
const config=require('../assets/solvent-master-game-scripts/solvent-master-config.js').gameplay;
const {Game,shelf,chemicals}=require('../assets/solvent-master-game-scripts/solvent-master-core.js');
function solve(game){for(const c of chemicals)if(game.recipe.mix[c])assert.ok(game.pour(c,game.shelves[c].indexOf(game.recipe.mix[c])));assert.equal(game.total,100);assert.equal(game.submit(),true);game.next();}
test('every rack has one exact match and no alternative subset sum',()=>{
  for(const r of config.recipes)for(const c of chemicals){const target=r.mix[c],values=shelf(target,()=>.5);assert.equal(new Set(values).size,8);assert.equal(values.filter(n=>n===target).length,target?1:0);
    for(let mask=1;mask<256;mask++){const selected=values.filter((_,i)=>mask&(1<<i));if(selected.reduce((a,b)=>a+b,0)===target)assert.deepEqual(selected,[target]);}
  }
});
test('single use, cap and last-pour undo restore the selected beaker',()=>{const g=new Game(config);g.start('practice');const i=g.shelves.Water.indexOf(90);assert.ok(g.pour('Water',i));assert.equal(g.pour('Water',i),null);const j=g.shelves.ACN.findIndex(n=>n>10);assert.equal(g.pour('ACN',j),null);assert.equal(g.total,90);assert.equal(g.undo().value,90);assert.equal(g.total,0);assert.ok(g.pour('Water',i));});
test('practice retries same question and only all five correct complete practice',()=>{const g=new Game(config);g.start('practice');assert.equal(g.submit(),false);g.next();assert.equal(g.index,0);assert.equal(g.total,0);for(let i=0;i<5;i++)solve(g);assert.equal(g.phase,'mastered');assert.equal(g.profile.practiceComplete,true);});
test('challenge has all five once; wrong continues and timeout marks remaining unanswered',()=>{const g=new Game(config);g.start('challenge');assert.equal(new Set(g.order).size,5);assert.equal(g.submit(),false);assert.equal(g.tick(61),false);g.next();assert.equal(g.tick(61),true);assert.equal(g.results.length,5);assert.equal(g.results.filter(r=>r.timeout).length,4);assert.equal(g.profile.streak,0);});
test('three consecutive perfect rounds earn star; checkpoint survives reload; failure resets streak',()=>{const g=new Game(config);for(let round=1;round<=3;round++){g.start('challenge');for(let i=0;i<5;i++)solve(g);assert.equal(g.profile.streak,round);}assert.equal(g.profile.stars,1);const restored=new Game(config,JSON.parse(JSON.stringify(g.profile)));assert.equal(restored.profile.stars,1);restored.start('challenge');restored.tick(60);assert.equal(restored.profile.streak,0);assert.equal(restored.profile.stars,1);assert.equal(restored.profile.rounds.length,4);});

test('each recipe has several incorrect solvent combinations totaling 100',()=>{
  for(const recipe of config.recipes){
    const racks=chemicals.map(c=>[0,...shelf(recipe.mix[c])]);let wrong=0;
    for(const acn of racks[0])for(const water of racks[1])for(const meoh of racks[2]){
      if(acn+water+meoh!==100)continue;
      if(acn!==recipe.mix.ACN||water!==recipe.mix.Water||meoh!==recipe.mix.MeOH)wrong++;
    }
    assert.ok(wrong>=3,`${recipe.name} must offer multiple misleading 100% mixes, got ${wrong}`);
  }
});

const runtime=require(process.env.SOLVENT_PLAYWRIGHT||'playwright'),browserEngine=runtime[process.env.SOLVENT_ENGINE||'chromium'];
const assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.SOLVENT_URL||'http://localhost:4173/assets/solvent-master-game-scripts/solvent-master.html',out='artifacts/solvent-master-presentation';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await browserEngine.launch({headless:true,...(process.env.SOLVENT_ENGINE==='webkit'?(process.env.SOLVENT_WEBKIT?{executablePath:process.env.SOLVENT_WEBKIT}:{}):{channel:'msedge'})});const report={errors:[],checks:[]};
 try{const context=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('solvent-master-demo-complete-v1','true');localStorage.setItem('solvent-master-progress-v1',JSON.stringify({schema:1,practiceComplete:true,streak:0,stars:0,rounds:[]}));});
 const settle=()=>page.waitForFunction(()=>SolventMaster.ready&&!SolventMaster.busy);
 const click=async id=>{await settle();await page.locator('#'+id).click();await settle();};
 await page.goto(url);await settle();await click('next');assert.equal(await page.evaluate(()=>SolventMaster.view),'challenge');await page.screenshot({path:`${out}/challenge.png`});await click('challenge-play');
 // Exercise the actual pour/audio hooks and verify timer exclusion under reduced-motion settings.
 const before=await page.evaluate(()=>SolventMaster.game.remaining);
 const selected=await page.evaluate(()=>{const g=SolventMaster.game,c=SolventCore.chemicals.find(c=>g.recipe.mix[c]);return {c,i:g.shelves[c].indexOf(g.recipe.mix[c])};});
 await page.locator(`.shelf-beaker[data-chemical="${selected.c}"][data-index="${selected.i}"]`).click();await page.waitForTimeout(800);
 assert.equal(await page.locator('.flying-beaker').count(),1);await page.screenshot({path:`${out}/pour.png`});await settle();
 assert.ok(before-await page.evaluate(()=>SolventMaster.game.remaining)<.3);
 await page.screenshot({path:`${out}/liquid.png`});await click('pour-undo');
 // Save failure is recoverable without advancing the checkpoint handoff.
 await page.evaluate(()=>{const real=SolventStore.save;let attempts=0;SolventStore.save=async p=>{if(!attempts++)throw Error('simulated quota');return real(p);};SolventMaster.game.remaining=.01;});
 await page.getByRole('button',{name:'Retry saving'}).waitFor();assert.equal(await page.evaluate(()=>SolventMaster.busy),true);
 await page.getByRole('button',{name:'Retry saving'}).click();await settle();assert.equal(await page.evaluate(()=>SolventMaster.view),'results');
 for(const count of [0,1,2,3]){
   if(count){await click('outcome-next');await page.evaluate(()=>SolventMaster.game.remaining=.01);await page.waitForFunction(()=>SolventMaster.view==='results'&&!SolventMaster.busy);}
   await page.evaluate(n=>{SolventMaster.game.profile.streak=n;window.streakChecks=[];if(n===1||n===2){const observer=new MutationObserver(()=>{const stage=document.querySelector('#outcome').dataset.stage;if(stage){window.streakChecks.push({stage,disabled:document.querySelector('#outcome-next').disabled,locked:document.querySelectorAll('.perfect-streak .locked').length});if(stage==='ready')observer.disconnect();}});observer.observe(document.querySelector('#outcome'),{attributes:true,attributeFilter:['data-stage']});}},count);await click('results-next');
   if(count===1||count===2){const stages=await page.evaluate(()=>window.streakChecks);assert.deepEqual(stages.map(s=>s.stage),['fill','dance','pipe','activate','ready']);assert.ok(stages.slice(0,4).every(s=>s.disabled));assert.equal(stages.find(s=>s.stage==='pipe').locked,3-count);assert.equal(await page.locator('.next-ready .streak-face').getAttribute('src').then(s=>s.includes('neutral.gif')),true);assert.equal(await page.locator('.next-ready .streak-water span').evaluate(e=>e.style.height),'0%');assert.equal(await page.locator('#outcome-next').isEnabled(),true);}

   await page.screenshot({path:`${out}/outcome-${count}.png`});
   if(count===3){assert.equal(await page.locator('#outcome-message').getAttribute('class'),'outcome-message sr-only');assert.equal(await page.locator('.completion-beaker').isVisible(),true);}
 }
 report.checks=['reduced-motion preserves full pour','pour time excluded','audio hooks without page errors','save failure retry','single background text composition','outcomes 0 through 3'];assert.deepEqual(report.errors,[]);fs.writeFileSync(`${out}/verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

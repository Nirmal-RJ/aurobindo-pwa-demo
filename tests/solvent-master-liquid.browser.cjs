const {chromium}=require(process.env.SOLVENT_PLAYWRIGHT||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const out='artifacts/solvent-master-liquid',url=process.env.SOLVENT_URL||'http://localhost:4173/assets/solvent-master-game-scripts/solvent-master.html';
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});const report={errors:[],viewports:[]};
try{for(const [width,height]of [[1280,720],[844,390]]){const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
await page.addInitScript(()=>{localStorage.setItem('solvent-master-demo-complete-v1','true');localStorage.setItem('solvent-master-progress-v1',JSON.stringify({schema:1,practiceComplete:true,streak:0,stars:0,rounds:[]}));});
const ready=()=>page.waitForFunction(()=>SolventMaster.ready&&!SolventMaster.busy);const click=async id=>{await ready();await page.locator('#'+id).click();await ready();};
await page.goto(url);await ready();await click('next');await click('challenge-play');
const shelfLevels=await page.evaluate(()=>Array.from(document.querySelectorAll('.shelf-beaker'),b=>{const art=b.querySelector('.shelf-art').getBoundingClientRect(),liquid=b.querySelector('.small-liquid').getBoundingClientRect();return {value:parseFloat(b.querySelector('.beaker-value').textContent),fill:liquid.height/(art.height*.71)*100};}));
assert.equal(shelfLevels.length,24);assert.ok(shelfLevels.every(s=>Math.abs(s.fill-s.value)<.2),'Shelf liquid must match its percentage of usable glass height');
const choice=await page.evaluate(()=>{const g=SolventMaster.game,c=SolventCore.chemicals.find(c=>g.recipe.mix[c]>=45);return {c,i:g.shelves[c].indexOf(g.recipe.mix[c]),value:g.recipe.mix[c]};});
await page.evaluate(()=>{window.fluidSamples=[];window.sampling=true;function sample(){const stream=document.querySelector('.pour-stream'),well=document.querySelector('#main-liquid'),ghost=document.querySelector('.flying-beaker');if(stream&&!stream.hidden&&parseFloat(stream.style.opacity)>.1){const r=stream.getBoundingClientRect(),w=well.getBoundingClientRect(),total=parseFloat(well.style.getPropertyValue('--surface'));const source=ghost.querySelector('.small-liquid');window.fluidSamples.push({total,source:parseFloat(source.style.height),endpointError:Math.abs(r.bottom-(w.bottom-w.height*total/100)),inside:r.left>=w.left&&r.right<=w.right});}if(window.sampling)requestAnimationFrame(sample);}requestAnimationFrame(sample);});
const before=await page.evaluate(()=>SolventMaster.game.remaining);
await page.locator(`.shelf-beaker[data-chemical="${choice.c}"][data-index="${choice.i}"]`).click();
await page.waitForTimeout(850);await page.screenshot({path:`${out}/pour-${width}x${height}.png`});await ready();
const samples=await page.evaluate(()=>{window.sampling=false;return window.fluidSamples;});assert.ok(samples.length>=8);assert.ok(samples.every(s=>s.endpointError<2&&s.inside));
for(let i=1;i<samples.length;i++){assert.ok(samples[i].total>=samples[i-1].total);assert.ok(samples[i].source<=samples[i-1].source+.01);}
assert.ok(before-await page.evaluate(()=>SolventMaster.game.remaining)<.35);assert.equal(await page.evaluate(()=>SolventMaster.game.total),choice.value);
await page.screenshot({path:`${out}/filled-${width}x${height}.png`});await click('pour-undo');assert.equal(await page.evaluate(()=>SolventMaster.game.total),0);assert.equal(await page.locator('.solvent-layer').count(),0);
report.viewports.push({width,height,samples:samples.length,maxEndpointError:Math.max(...samples.map(s=>s.endpointError)),monotonicTransfer:true,undo:true});await context.close();}
assert.deepEqual(report.errors,[]);fs.writeFileSync(`${out}/verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

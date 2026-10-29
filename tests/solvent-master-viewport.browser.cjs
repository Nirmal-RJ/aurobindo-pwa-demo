const {chromium}=require(process.env.SOLVENT_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const out='artifacts/solvent-master-viewport',url=process.env.SOLVENT_URL||'http://localhost:4173/assets/solvent-master-game-scripts/solvent-master.html';
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});const report={errors:[],checks:[]};
try{const context=await browser.newContext({viewport:{width:2560,height:1080}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('solvent-master-demo-complete-v1','true'));
const settle=()=>page.waitForFunction(()=>SolventMaster.ready&&!SolventMaster.busy);const click=async id=>{await settle();await page.locator('#'+id).click();await settle();};
await page.goto(url);await settle();await click('next');
async function bounds(ids){return page.evaluate(ids=>{const stage=document.querySelector('#game').getBoundingClientRect();return {full:Math.abs(stage.width-innerWidth)<1&&Math.abs(stage.height-innerHeight)<1,inside:ids.every(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;})};},ids);}
for(const [width,height]of [[2560,1080],[1920,900],[1024,768],[844,390],[667,375]]){await page.setViewportSize({width,height});const b=await bounds(['mixing-demo','mixing-play']);assert.ok(b.full&&b.inside);await page.screenshot({path:`${out}/mixing-${width}x${height}.png`});report.checks.push({width,height,view:'mixing',...b});}
await page.setViewportSize({width:2560,height:1080});await click('mixing-play');await click('lesson-next');const b=await bounds(['mix-submit','pour-undo','round-name','main-vessel']);assert.ok(b.full&&b.inside);
const index=await page.evaluate(()=>SolventMaster.game.shelves.ACN.indexOf(5));await page.locator(`.shelf-beaker[data-chemical="ACN"][data-index="${index}"]`).click();await page.waitForTimeout(800);
const jet=await page.evaluate(()=>{const s=document.querySelector('.pour-stream').getBoundingClientRect(),v=document.querySelector('#main-vessel').getBoundingClientRect();return s.left>=v.left&&s.right<=v.right&&s.bottom>=v.top&&s.bottom<=v.bottom;});assert.ok(jet);await page.screenshot({path:`${out}/pour-2560x1080.png`});await settle();assert.equal(await page.evaluate(()=>SolventMaster.game.total),5);
report.checks.push({view:'round',...b,jetInsideVessel:jet});
await page.setViewportSize({width:667,height:375});await page.screenshot({path:`${out}/shelf-labels-667x375.png`});
const shelfFit=await page.evaluate(()=>Array.from(document.querySelectorAll('.shelf-beaker')).every(button=>{
 const image=button.querySelector('.shelf-art>img'),r=image.getBoundingClientRect(),label=button.querySelector('.beaker-value');
 return Math.abs((r.width/r.height)/(image.naturalWidth/image.naturalHeight)-1)<.01&&label.scrollWidth<=label.clientWidth+1&&label.scrollHeight<=label.clientHeight+1;
}));assert.ok(shelfFit);report.checks.push({proportionalShelvesAndFittingLabels:shelfFit});
assert.deepEqual(report.errors,[]);fs.writeFileSync(`${out}/verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

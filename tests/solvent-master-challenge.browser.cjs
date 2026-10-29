const {chromium}=require(process.env.SOLVENT_PLAYWRIGHT||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const out='artifacts/solvent-master-challenge',url=process.env.SOLVENT_URL||'http://localhost:4173/assets/solvent-master-game-scripts/solvent-master.html';
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true}),report={errors:[],viewports:[]};
try{const context=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
await page.addInitScript(()=>{localStorage.setItem('solvent-master-demo-complete-v1','true');localStorage.setItem('solvent-master-progress-v1',JSON.stringify({schema:1,practiceComplete:true,streak:0,stars:0,rounds:[]}));});
await page.goto(url);await page.waitForFunction(()=>SolventMaster.ready);await page.locator('#next').click();await page.waitForFunction(()=>SolventMaster.view==='challenge'&&!SolventMaster.busy);
for(const [width,height]of [[1280,720],[1920,900],[2560,1080],[844,390],[667,375]]){
await page.setViewportSize({width,height});
const result=await page.evaluate(()=>{
 const panel=document.querySelector('.challenge-summary'),r=panel.getBoundingClientRect(),text=panel.querySelector('strong').getBoundingClientRect();
 const images=['.challenge-title','.challenge-summary img','.challenge-star','#challenge-play img'].map(selector=>{const image=document.querySelector(selector);return {selector,error:Math.abs((image.offsetWidth/image.offsetHeight)/(image.naturalWidth/image.naturalHeight)-1)};});
 const star=document.querySelector('.challenge-star'),heading=document.querySelector('.challenge-heading');
 const spin=star.getAnimations().find(a=>a.animationName==='challenge-star-spin'),pulse=heading.getAnimations().find(a=>a.animationName==='challenge-pulse');
 const play=document.querySelector('#challenge-play').getBoundingClientRect();
 let clear=true;
 for(const time of [0,1000,2000,3000,4000,5000,6000,7000]){spin.currentTime=time;const s=star.getBoundingClientRect();clear&&=s.bottom<play.top&&s.left>=0&&s.right<=innerWidth;}
 spin.currentTime=1000;
 return {images,textInside:text.left>=r.left&&text.top>=r.top&&text.right<=r.right&&text.bottom<=r.bottom,starClear:clear,spin:spin.effect.getTiming().iterations===Infinity,pulse:pulse.effect.getTiming().iterations===Infinity};
});
assert.ok(result.images.every(i=>i.error<.02),JSON.stringify(result));assert.ok(result.textInside&&result.starClear&&result.spin&&result.pulse,JSON.stringify(result));
report.viewports.push({width,height,...result});await page.screenshot({path:`${out}/challenge-${width}x${height}.png`});}
assert.deepEqual(report.errors,[]);fs.writeFileSync(`${out}/verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

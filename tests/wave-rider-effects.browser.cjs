const {chromium,webkit}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{for(const name of ['edge','webkit']){
 const b=name==='edge'?await chromium.launch({channel:'msedge'}):await webkit.launch({executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/webkit-2359/Playwright.exe'});
 try{const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('qc-wave-rider-v1',JSON.stringify({day:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),demo:true,level:0,unlocked:0,score:0,stars:0})));
 await p.goto('http://localhost:4174/assets/wave-rider-scripts/wave-rider.html');await p.locator('[data-action=next]').click();await p.locator('[data-action=start]').click();
 await p.waitForTimeout(2200);await p.screenshot({path:`artifacts/wave-rider/${name}-new-water.png`});
 for(const [width,height]of [[320,568],[390,844],[768,1024]]){await p.setViewportSize({width,height});assert(await p.evaluate(()=>{const t=document.querySelector('.time').getBoundingClientRect(),f=document.querySelector('.flag-hud').getBoundingClientRect();return t.right<f.left&&document.querySelectorAll('svg.hud-flag').length===7;}));}
 await p.setViewportSize({width:390,height:844});await p.locator('.crash').waitFor({timeout:10000});await p.waitForTimeout(500);await p.screenshot({path:`artifacts/wave-rider/${name}-impact-fire.png`});await p.waitForTimeout(900);await p.screenshot({path:`artifacts/wave-rider/${name}-impact-smoke.png`});
 await p.locator('[data-action=retry]').click();await p.waitForTimeout(600);const answer=await p.evaluate(()=>WaveConfig.questions.find(q=>q.prompt===document.querySelector('#question-copy').textContent).answer);await p.keyboard.press(answer?'ArrowLeft':'ArrowRight');await p.locator('.sinking').waitFor({timeout:10000});await p.waitForTimeout(1200);await p.screenshot({path:`artifacts/wave-rider/${name}-submerge.png`});await p.locator('.failure').waitFor();assert.deepEqual(errors,[]);console.log('PASS '+name+': new timer/7 flags fit 320/390/768; crash, smoke and submerge complete without errors.');
 }finally{await b.close();}
}})().catch(e=>{console.error(e);process.exitCode=1});

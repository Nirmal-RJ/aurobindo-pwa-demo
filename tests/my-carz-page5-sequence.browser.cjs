const {chromium}=require(process.env.CARZ_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');const {Game}=require('../assets/my-carz-game-scripts/my-carz-core.js');
const url=process.env.CARZ_URL||'http://localhost:4187/assets/my-carz-game-scripts/my-carz.html';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const context=await browser.newContext({viewport:{width:393,height:852}}),g=new Game();g.profile.device.demoDone=true;g.profile.device.opened=true;
 await context.addInitScript(data=>localStorage.setItem('my-carz-progress-v2',JSON.stringify(data)),g.checkpoint());
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('artifacts/my-carz-page5-sequence',{recursive:true});
 await p.goto(url);await p.waitForFunction(()=>CarzGame.state.ready,{}, {timeout:90000});await p.locator('#opening-next').click();await p.waitForFunction(()=>CarzGame.state.view==='home'&&!CarzGame.state.busy);
 await p.evaluate(()=>{window.sequence=[];new MutationObserver(()=>window.sequence.push({stage:document.querySelector('#race').dataset.introStage,time:performance.now()})).observe(document.querySelector('#race'),{attributes:true,attributeFilter:['data-intro-stage']});});
 await p.locator('#start-driving').click();await p.waitForFunction(()=>CarzGame.state.phase==='countdown');
 assert.equal(await p.locator('#race-car').isVisible(),false);assert.equal(await p.locator('.carz-question').isVisible(),false);assert.equal(await p.locator('#diamonds').isVisible(),false);
 await p.waitForFunction(()=>document.querySelector('#race').dataset.introStage==='car');
 await p.locator('#exit-race').click();await p.waitForTimeout(450);assert.equal(await p.locator('#race').getAttribute('data-intro-stage'),'car');await p.getByRole('button',{name:'Keep playing',exact:true}).click();
 await p.waitForFunction(()=>document.querySelector('#race').dataset.introStage==='question');assert.equal(await p.locator('#diamonds').isVisible(),true);await p.screenshot({path:'artifacts/my-carz-page5-sequence/question.png'});
 assert.equal((await p.evaluate(()=>CarzGame.state)).phase,'question');
 await p.waitForFunction(()=>CarzGame.state.phase==='reading');const readingStart=await p.evaluate(()=>performance.now());const state=await p.evaluate(()=>CarzGame.state);await p.keyboard.press(state.lanes.indexOf(state.question.answer)?'ArrowRight':'ArrowLeft');
 await p.waitForFunction(()=>CarzGame.state.phase==='travel');const readingSeconds=(await p.evaluate(()=>performance.now())-readingStart)/1000;assert.ok(readingSeconds>=1.8);
 await p.locator('.tunnels.tunnel-attention').waitFor();assert.equal(await p.locator('#lane-arrow').getAttribute('data-active'),'false');await p.screenshot({path:'artifacts/my-carz-page5-sequence/tunnels.png'});
 await p.waitForFunction(()=>document.querySelector('#lane-arrow').dataset.active==='true');await p.screenshot({path:'artifacts/my-carz-page5-sequence/entry.png'});
 await p.waitForFunction(()=>CarzGame.state.phase==='feedback');await p.waitForFunction(()=>CarzGame.state.phase==='reading');assert.equal((await p.evaluate(()=>CarzGame.state)).streak,1);
 for(let i=1;i<5;i++){const s=await p.evaluate(()=>CarzGame.state);await p.keyboard.press(s.lanes.indexOf(s.question.answer)?'ArrowRight':'ArrowLeft');await p.waitForFunction(()=>CarzGame.state.phase==='feedback',{}, {timeout:15000});if(i<4)await p.waitForFunction(()=>CarzGame.state.phase==='reading');}
 await p.locator('#scratch-area:not([hidden])').waitFor();await p.waitForFunction(()=>!document.querySelector('#scratch-area').inert);await p.locator('#scratch').focus();for(let row=0;row<8;row++){if(await p.locator('#scratch-area').isHidden())break;await p.keyboard.press('Space');}await p.locator('#reward-car:not([hidden])').waitFor();await p.getByRole('button',{name:'Keep driving',exact:true}).click();
 await p.waitForFunction(()=>CarzGame.state.view==='collection'&&!CarzGame.state.busy);await p.locator('#collection-drive').click();await p.waitForFunction(()=>CarzGame.state.phase==='countdown');assert.equal(await p.locator('#race-car').isVisible(),false);
 await p.waitForFunction(()=>CarzGame.state.phase==='intro');assert.equal(await p.locator('#race-car').evaluate(el=>el.classList.contains('upgrade-entry')),true);
 await p.waitForFunction(()=>CarzGame.state.phase==='reading');assert.equal((await p.evaluate(()=>CarzGame.state)).level,2);
 await p.locator('#exit-race').click();await p.getByRole('button',{name:'Save & Exit',exact:true}).click();await p.waitForFunction(()=>CarzGame.state.view==='home'&&!CarzGame.state.busy);
 const sequence=await p.evaluate(()=>window.sequence.map(s=>s.stage));assert.deepEqual(sequence.slice(0,5),['countdown','car','diamonds','question','drive']);assert.deepEqual(errors,[]);
 fs.writeFileSync('artifacts/my-carz-page5-sequence/verification.json',JSON.stringify({sequence,readingSeconds,errors,checks:['countdown hides upcoming elements','ordered car/question/diamond reveals','intro pauses without advancing','full reading window','tunnel cue precedes late guidance','five correct and upgrade entry after countdown','level 2 and Save & Exit']},null,2));console.log('Page 5 sequence browser checks passed');await context.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

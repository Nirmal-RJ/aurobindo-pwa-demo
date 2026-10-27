const {chromium}=require(process.env.CARZ_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {Game}=require('../assets/my-carz-game-scripts/my-carz-core.js');
const url=process.env.CARZ_URL||'http://localhost:4187/assets/my-carz-game-scripts/my-carz.html';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const first=await browser.newContext({viewport:{width:393,height:852},hasTouch:true,isMobile:true});
  const page=await first.newPage();
  await page.addInitScript(()=>{const realFetch=window.fetch;window.__blockDownloads=true;window.__blocked=0;window.fetch=(input,...args)=>{if(window.__blockDownloads&&String(input).includes('/page-10/my-cars-button.webp')){window.__blocked++;return Promise.reject(new TypeError('Simulated network failure'));}return realFetch(input,...args);};});
  await page.goto(url);await page.locator('#load-retry:not([hidden])').waitFor({timeout:90000});
  assert.equal(await page.locator('#opening-next').isDisabled(),true); assert.equal(await page.evaluate(()=>window.__blocked),3);
  await page.evaluate(()=>{window.__blockDownloads=false;}); await page.locator('#load-retry').click(); await page.waitForFunction(()=>CarzGame.state.ready,{}, {timeout:90000});
  await page.locator('#opening-next').tap();await page.waitForFunction(()=>CarzGame.state.view==='demo'&&!CarzGame.state.busy);
  for(let i=0;i<4;i++)await page.locator('#demo-next').tap();await page.waitForFunction(()=>CarzGame.state.view==='home'&&!CarzGame.state.busy);
  assert.equal(await page.locator('#returning-actions').isVisible(),false);
  await page.setViewportSize({width:852,height:393});await page.locator('#portrait:not([hidden])').waitFor();assert.equal(await page.locator('#portrait').isVisible(),true);
  await page.screenshot({path:'artifacts/my-carz-flow/touch-landscape.png'});await first.close();
  // A real saved checkpoint at level eight exercises the final unlock UI.
  const game=new Game();for(let level=1;level<8;level++){game.begin();for(let q=0;q<5;q++){const question=game.next();game.answer(game.day.lanes.indexOf(question.answer));}game.complete();}
  const snapshot=game.checkpoint();snapshot.device.demoDone=true;snapshot.device.opened=true;
  const context=await browser.newContext({viewport:{width:393,height:852}});await context.addInitScript(profile=>{localStorage.setItem('my-carz-progress-v2',JSON.stringify(profile));const actual=Date.now;Date.now=()=>window.__testNow??actual();},snapshot);
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.waitForFunction(()=>CarzGame.state.ready,{}, {timeout:90000});
  await p.locator('#opening-next').click();await p.waitForFunction(()=>CarzGame.state.view==='home'&&!CarzGame.state.busy);await p.locator('#start-driving').click();
  for(let i=0;i<5;i++){
   await p.waitForFunction(()=>CarzGame.state.phase==='reading'&&!CarzGame.state.busy);const state=await p.evaluate(()=>CarzGame.state);await p.keyboard.press(state.lanes.indexOf(state.question.answer)?'ArrowRight':'ArrowLeft');
   await p.waitForFunction(()=>CarzGame.state.phase==='travel');
   if(i===0){await p.waitForTimeout(1200);await p.screenshot({path:'artifacts/my-carz-flow/tunnels.png'});}
   await p.waitForFunction(()=>CarzGame.state.phase==='feedback',{}, {timeout:15000});
   if(i<4)await p.waitForFunction(n=>CarzGame.state.streak===n&&CarzGame.state.phase==='reading',i+1);
  }
  await p.locator('#scratch-area:not([hidden])').waitFor();await p.locator('#scratch[data-ready=true]').waitFor();await p.screenshot({path:'artifacts/my-carz-flow/supplied-scratch.png'});const box=await p.locator('#scratch').boundingBox();
  for(let row=0;row<8;row++){const y=box.y+box.height*(.05+row*.1);await p.mouse.move(box.x+box.width*.03,y);await p.mouse.down();await p.mouse.move(box.x+box.width*.97,y,{steps:18});await p.mouse.up();}
  await p.locator('#reward-car:not([hidden])').waitFor();assert.equal((await p.evaluate(()=>CarzGame.state)).unlocked,9);
  await p.getByRole('button',{name:'Keep driving',exact:true}).click();await p.getByRole('heading',{name:'All cars unlocked!',exact:true}).waitFor();await p.screenshot({path:'artifacts/my-carz-flow/all-cars.png'});
  await p.getByRole('button',{name:'Keep driving',exact:true}).click();await p.waitForFunction(()=>CarzGame.state.phase==='reading');assert.equal(await p.locator('#race-level').textContent(),'FREE PLAY');
  await p.evaluate(()=>{window.__testNow=Date.now()+86400000;});await p.waitForTimeout(1200);assert.match(await p.locator('#reset-notice').textContent(),/finish this level/);assert.equal((await p.evaluate(()=>CarzGame.state)).unlocked,9);
  await p.locator('#exit-race').click();await p.getByRole('button',{name:'Save & Exit',exact:true}).click();await p.waitForFunction(()=>CarzGame.state.view==='home'&&!CarzGame.state.busy);assert.equal((await p.evaluate(()=>CarzGame.state)).unlocked,1);
  const stored=await p.evaluate(()=>JSON.parse(localStorage.getItem('my-carz-progress-v2')));assert.equal(stored.lifetime.archives.at(-1).unlocked,9);assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/my-carz-flow/extra-verification.json',JSON.stringify({checks:['loader blocks Next on 3 failed downloads','Retry resumes completed cache','first-session returning actions hidden','touch-landscape guidance','final Car-9 unlock','real 60% scratch gestures','all-cars celebration','free play','midnight deferral','exit applies reset and archives prior collection'],errors},null,2));await context.close();console.log('My Carz extra browser checks passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

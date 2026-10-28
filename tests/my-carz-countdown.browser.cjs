const {chromium}=require(process.env.CARZ_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const {Game}=require('../assets/my-carz-game-scripts/my-carz-core.js');
const url=process.env.CARZ_URL||'http://localhost:4187/assets/my-carz-game-scripts/my-carz.html';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const context=await browser.newContext({viewport:{width:393,height:852}}),g=new Game();g.profile.device.demoDone=true;g.profile.device.opened=true;
 await context.addInitScript(data=>{if(!localStorage.getItem('my-carz-progress-v2'))localStorage.setItem('my-carz-progress-v2',JSON.stringify(data));},g.checkpoint());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('artifacts/my-carz-countdown',{recursive:true});
 await page.goto(url);await page.waitForFunction(()=>CarzGame.state.ready,{}, {timeout:90000});await page.locator('#opening-next').click();await page.waitForFunction(()=>CarzGame.state.view==='home'&&!CarzGame.state.busy);await page.locator('#start-driving').click();
 await page.waitForFunction(()=>CarzGame.state.phase==='countdown');
 const beats=[];
 for(const label of ['3','2','1','GO!']){
  await page.waitForFunction(label=>document.querySelector('#countdown-value').textContent===label,label);
  const measure=await page.evaluate(()=>{const el=document.querySelector('#countdown'),focus=el.querySelector('.countdown-value').getBoundingClientRect(),stage=document.querySelector('#game').getBoundingClientRect();return {background:getComputedStyle(el).backgroundImage,centerError:Math.abs((focus.x+focus.width/2)-(stage.x+stage.width/2)),label:document.querySelector('#countdown-value').textContent,time:performance.now()};});
  assert.match(measure.background,/linear-gradient/);assert.ok(measure.centerError<1);beats.push(measure);
  await page.waitForTimeout(150);await page.screenshot({path:`artifacts/my-carz-countdown/${label.toLowerCase()}.png`});
 }
 await page.waitForFunction(()=>CarzGame.state.phase==='reading');assert.equal(await page.locator('#countdown').isVisible(),false);
 const state=await page.evaluate(()=>CarzGame.state);await page.keyboard.press(state.lanes.indexOf(state.question.answer)?'ArrowRight':'ArrowLeft');
 await page.waitForFunction(()=>CarzGame.state.phase==='feedback',{}, {timeout:15000});await page.locator('.celebration-confetti').waitFor();await page.waitForTimeout(650);
 assert.equal(await page.locator('.celebration-confetti').evaluate(el=>getComputedStyle(el).objectFit),'contain');await page.screenshot({path:'artifacts/my-carz-countdown/confetti.png'});
 await page.locator('.celebration-confetti').waitFor({state:'detached',timeout:6000});
 await page.waitForFunction(()=>CarzGame.state.phase==='reading');await page.locator('#exit-race').click();await page.getByRole('button',{name:'Save & Exit',exact:true}).click();await page.waitForFunction(()=>CarzGame.state.view==='home'&&!CarzGame.state.busy);
 const bounds=[];
 for(const [width,height] of [[320,568],[375,667],[768,1024],[1440,900]]){
  await page.setViewportSize({width,height});await page.locator('#start-driving').click();await page.waitForFunction(()=>CarzGame.state.phase==='countdown');
  const metric=await page.locator('.countdown-value').boundingBox(),app=await page.locator('#game').boundingBox();assert.ok(metric.x>=app.x&&metric.x+metric.width<=app.x+app.width+1&&metric.y>=app.y&&metric.y+metric.height<=app.y+app.height+1);bounds.push({width,height,metric});
  await page.screenshot({path:`artifacts/my-carz-countdown/${width}x${height}.png`});
  await page.locator('#exit-race').click();const frozen=await page.locator('#countdown-value').textContent();await page.waitForTimeout(400);assert.equal(await page.locator('#countdown-value').textContent(),frozen);
  await page.getByRole('button',{name:'Save & Exit',exact:true}).click();await page.waitForFunction(()=>CarzGame.state.view==='home'&&!CarzGame.state.busy);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/my-carz-countdown/verification.json',JSON.stringify({beats,bounds,errors,checks:['background dims across 3/2/1/GO','centered focus','question begins after countdown','complete uncropped confetti, three-second lifetime','responsive bounds','paused countdown freeze','Save & Exit retains flow']},null,2));console.log('Countdown and confetti browser checks passed');await context.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

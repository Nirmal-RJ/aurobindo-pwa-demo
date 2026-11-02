const { chromium, webkit } = require(process.env.AB_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const url = process.env.AB_URL || 'http://localhost:4173/assets/ab-express-scripts/ab-express.html';
(async () => {
  const browser = process.env.AB_WEBKIT ? await webkit.launch({headless:true,executablePath:process.env.AB_WEBKIT}) : await chromium.launch({channel:'msedge',headless:true});
  const context = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,reducedMotion:process.env.AB_REDUCED_MOTION?'reduce':'no-preference'});
  const page = await context.newPage(), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  fs.mkdirSync('artifacts/ab-express',{recursive:true});
  const shot = async name=>{
    await page.locator('#screen').waitFor({state:'visible'});
    for(const [width,height] of (process.env.AB_AUDIT_VIEWPORTS?[[320,568],[390,844],[768,1024],[1440,900]]:[[390,844]])){
      await page.setViewportSize({width,height});await page.waitForTimeout(80);
      const bad=await page.locator('#screen button').evaluateAll(buttons=>buttons.filter(b=>{const r=b.getBoundingClientRect(),g=document.querySelector('#game').getBoundingClientRect();return r.left<g.left-1||r.right>g.right+1||r.top<g.top-1||r.bottom>g.bottom+1;}).map(b=>b.getAttribute('aria-label')));assert.deepEqual(bad,[]);
      await page.screenshot({path:`artifacts/ab-express/${process.env.AB_WEBKIT?'webkit-':''}${name}${width===390?'':'-'+width}.png`});
    }
    await page.setViewportSize({width:390,height:844});
  };
  const click = name=>page.getByRole('button',{name,exact:true}).click();
  const saved = ()=>page.evaluate(()=>JSON.parse(localStorage.getItem(ABConfig.storageKey)));
  const open = async()=>{await page.goto(url);await page.getByRole('button',{name:'Next',exact:true}).waitFor();};
  const solve = async()=>{
    await page.locator('#screen[data-page="arrange"]').waitFor({state:'visible'});
    await page.locator('#outgoing').waitFor({state:'detached'});
    const ids=await page.locator('.step').evaluateAll(rows=>rows.map(row=>Number(row.dataset.id)).sort((a,b)=>a-b));
    // User-equivalent keyboard reordering, exercising production input/state.
    for(let i=0;i<ids.length;i++) {
      const row=page.locator(`.step[data-id="${ids[i]}"]`); await row.focus();
      const pos=await row.evaluate(el=>Array.from(el.parentNode.children).indexOf(el));
      for(let j=pos;j>i;j--)await page.keyboard.press('ArrowUp');
    }
  };
  try {
    await open(); await shot('landing'); await click('Next');
    for(let i=0;i<5;i++)await click('Next');
    assert.equal((await saved()).demoComplete,true);
    await shot('home');await click('Practice Mode');await shot('practice');await click('Start Practising');await shot('arrange');
    // Touch-pointer drag changes order, cancellation restores it.
    const before=await page.locator('.step').evaluateAll(rows=>rows.map(row=>row.dataset.id));
    const a=await page.locator('.step').nth(0).boundingBox(),z=await page.locator('.step').nth(7).boundingBox();
    await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(z.x+z.width/2,z.y+z.height/2,{steps:10});await page.mouse.up();
    const after=await page.locator('.step').evaluateAll(rows=>rows.map(row=>row.dataset.id));assert.notDeepEqual(after,before);assert.equal(new Set(after).size,8);
    await solve();await click('Start the Train');await page.waitForTimeout(1800);
    const trainY=()=>page.locator('#screen .train-track').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).m42);
    const y1=await trainY();await page.waitForTimeout(100);assert((await trainY())<y1);
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    const frozenY=await trainY();await page.waitForTimeout(120);assert.equal(await trainY(),frozenY);
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
    await shot('train');
    await page.getByRole('button',{name:'Next',exact:true}).waitFor({timeout:20000});await shot('success');await click('Next');await page.locator('.sequence').waitFor();await page.reload();await click('Next');
    await click('Challenge Mode');await shot('challenge');await click('Play Challenge');
    const run=await saved();await page.reload();await click('Next');await click('Challenge Mode');await click('Play Challenge');assert.deepEqual((await saved()).run,run.run);
    await page.locator('#screen[data-page="arrange"]').waitFor({state:'visible'});await page.waitForTimeout(1100);assert.match(await page.locator('.timer').textContent(),/Time 0:5[0-9]/);
    await solve();await click('Start the Train');await page.getByRole('button',{name:'Next',exact:true}).waitFor({timeout:20000});assert.equal((await saved()).run.index,1);await click('Next');await shot('streak');await click('Play Challenge');
    await solve();await page.locator('.step').first().focus();await page.keyboard.press('ArrowDown');
    const failed=(await saved()).run.order[1];await click('Start the Train');await page.getByRole('button',{name:'Check Right Order',exact:true}).waitFor({timeout:10000});await shot('failure');assert.equal((await saved()).run.index,0);assert.notEqual((await saved()).run.order[0],failed);
    await click('Check Right Order');await shot('comparison');await click('Play Again');
    // Speed only the QA run after visually checking the real train timing above.
    await page.evaluate(()=>{ABConfig.timing.intro=1;ABConfig.timing.compartment=1;ABConfig.timing.feedback=1;});
    for(let round=0;round<5;round++) {await solve();await click('Start the Train');await page.getByRole('button',{name:'Next',exact:true}).waitFor();await click('Next');if(round<4)await click('Play Challenge');}
    assert.equal((await saved()).stars,1);assert.equal((await saved()).run,null);await shot('reward');
    const starTransform=await page.locator('.reward-star').evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(200);assert.notEqual(await page.locator('.reward-star').evaluate(e=>getComputedStyle(e).transform),starTransform);
    assert.equal(await page.locator('.rays').evaluate(e=>getComputedStyle(e).animationDuration),'15s');
    await click('Home');await click('Learn the Sequence');await shot('learn');await click('Next');await click('Next');await click('Home');
    for(const size of [{width:320,height:568},{width:768,height:1024},{width:1440,height:900}]) {await page.setViewportSize(size);await page.waitForFunction(({width,height})=>{const b=document.querySelector('#game').getBoundingClientRect();return b.x>=-1&&b.y>=-1&&b.right<=width+1&&b.bottom<=height+1;},size);await shot(`home-${size.width}`);}
    assert.deepEqual(errors,[]);console.log('AB Express browser flow passed: onboarding, input, train, retry, checkpoint, five-round reward, responsive layout.');
  } catch(error) {await page.screenshot({path:'artifacts/ab-express/test-failure.png'});console.error(await page.evaluate(()=>({screen:document.querySelector('#screen').dataset.page,progress:localStorage.getItem(ABConfig.storageKey)})));throw error;} finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1);});

const { chromium } = require(process.env.AB_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'});
    const page=await context.newPage();
    const url=process.env.AB_URL || 'http://localhost:4173/assets/ab-express-scripts/ab-express.html';
    await page.route('**/01.webp',route=>route.abort()); await page.goto(url);
    await page.getByText('Some assets could not load.',{exact:false}).waitFor();
    assert.equal(await page.getByRole('button',{name:'Next',exact:true}).count(),0);
    await page.unroute('**/01.webp'); await page.getByText('Retry',{exact:true}).click();await page.getByRole('button',{name:'Next',exact:true}).waitFor();
    await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>navigator.serviceWorker.controller);
    await context.setOffline(true);await page.reload();await page.getByRole('button',{name:'Next',exact:true}).waitFor();
    await page.setViewportSize({width:844,height:390});await page.locator('body.needs-portrait').waitFor();
    fs.mkdirSync('artifacts/ab-express',{recursive:true});await page.screenshot({path:'artifacts/ab-express/portrait-prompt.png'});
    await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>!document.body.classList.contains('needs-portrait'));
    // Real touch input: move the first compartment to the last position.
    for(let i=0;i<6;i++)await page.getByRole('button',{name:'Next',exact:true}).click();
    await page.getByLabel('Practice Mode',{exact:true}).click();await page.getByLabel('Start Practising').click();await page.locator('#screen[data-page="arrange"]').waitFor({state:'visible'});
    const viewport = await page.locator('#screen').boundingBox();
    assert(Math.abs(viewport.x) < 1 && Math.abs(viewport.y) < 1 && Math.abs(viewport.width - 390) < 1 && Math.abs(viewport.height - 844) < 1, 'Mobile gameplay must fill the viewport rather than letterbox');
    const before=await page.locator('#screen .step').evaluateAll(rows=>rows.map(row=>row.dataset.id));
    const a=await page.locator('#screen .step').first().boundingBox(),z=await page.locator('#screen .step').last().boundingBox();
    const session=await context.newCDPSession(page);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:z.x+z.width/2,y:z.y+z.height/2}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    const after=await page.locator('#screen .step').evaluateAll(rows=>rows.map(row=>row.dataset.id));assert.equal(after[7],before[0]);assert.equal(new Set(after).size,8);
    // Cancellation restores the order present when this drag began.
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:z.x+z.width/2,y:z.y+z.height/2}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
    assert.deepEqual(await page.locator('#screen .step').evaluateAll(rows=>rows.map(row=>row.dataset.id)),after);
    console.log('AB Express resilience passed: failed asset retry, offline reload, mobile portrait prompt, touch reorder/cancel.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

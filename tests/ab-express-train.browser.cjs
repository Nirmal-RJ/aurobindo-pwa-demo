const { chromium } = require(process.env.AB_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844}});
    await page.addInitScript(()=>localStorage.setItem('ab-express-progress-v1',JSON.stringify({demoComplete:true})));
    await page.goto(process.env.AB_URL || 'http://localhost:4173/assets/ab-express-scripts/ab-express.html');
    const click=name=>page.getByRole('button',{name,exact:true}).click();
    await click('Next');await click('Practice Mode');await click('Start Practising');
    await page.locator('#screen[data-page="arrange"]').waitFor({state:'visible'});
    if(await page.locator('.step').first().getAttribute('data-id')==='1'){await page.locator('.step').first().focus();await page.keyboard.press('ArrowDown');}
    await click('Start the Train');await page.locator('#screen[data-page="checking"]').waitFor({state:'visible'});
    const screen=await page.locator('#screen').boundingBox(),initial=await page.locator('.engine').boundingBox();
    assert(initial.y>=screen.y+screen.height,'Train must start below the screen');
    await page.waitForTimeout(2100);
    const entered=await page.locator('.engine').boundingBox();assert(entered.y<initial.y&&entered.y>screen.y+screen.height*.25,'Engine must travel up from the bottom');
    assert.equal(await page.getByRole('button',{name:'Next',exact:true}).count(),0);
    await page.locator('.feedback-panel').waitFor({state:'visible',timeout:15000});
    assert.equal(await page.getByRole('button',{name:'Next',exact:true}).count(),0);
    await page.waitForTimeout(1000);assert.equal(await page.getByRole('button',{name:'Next',exact:true}).count(),0,'Next must wait while the answer is presented');
    await page.getByRole('button',{name:'Next',exact:true}).waitFor();await click('Next');await click('Play Again');
    await page.locator('#screen[data-page="arrange"]').waitFor({state:'visible'});
    const ids=await page.locator('.step').evaluateAll(es=>es.map(e=>+e.dataset.id).sort((a,b)=>a-b));
    for(let i=0;i<8;i++){const row=page.locator(`.step[data-id="${ids[i]}"]`);await row.focus();const pos=await row.evaluate(e=>[...e.parentElement.children].indexOf(e));for(let j=pos;j>i;j--)await page.keyboard.press('ArrowUp');}
    await click('Start the Train');
    await page.waitForFunction(()=>document.querySelector('.train-title')?.src.includes('blob:')&&document.querySelectorAll('.carriage').length===8);
    await page.getByRole('button',{name:'Next',exact:true}).waitFor({timeout:25000});
    assert.equal(await page.locator('.success-mark').count(),1);await click('Next');await page.locator('#screen[data-page="arrange"]').waitFor({state:'visible'});
    console.log('Bottom entry, continuous movement, delayed failure Next, and successful completion passed.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

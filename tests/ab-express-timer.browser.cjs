const { chromium } = require(process.env.AB_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.clock.install();
    await page.addInitScript(() => localStorage.setItem('ab-express-progress-v1', JSON.stringify({demoComplete:true, stars:2, run:{order:[0,1,2,3,4],index:2}})));
    await page.goto(process.env.AB_URL || 'http://localhost:4173/assets/ab-express-scripts/ab-express.html');
    const click = name => page.getByRole('button', {name,exact:true}).click();
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem(ABConfig.storageKey)));
    await click('Next');await click('Challenge Mode');await click('Play Challenge');
    await page.locator('#screen[data-page="arrange"]').waitFor({state:'visible'});
    const failedSelection=await page.locator('#screen .step').evaluateAll(rows=>rows.map(row=>+row.dataset.id).sort((a,b)=>a-b));
    assert.equal(failedSelection.filter(id=>id<=3).length,1);
    assert.equal(await page.evaluate(()=>ABConfig.challengeRoundSeconds),90);
    assert.match(await page.locator('.timer').textContent(),/Time 1:30|Time 1:29/);
    // Correct but unsubmitted arrangements still fail when time expires.
    async function solve() {
      const ids=await page.locator('#screen .step').evaluateAll(rows=>rows.map(row=>+row.dataset.id).sort((a,b)=>a-b));
      for(let i=0;i<8;i++){const row=page.locator(`#screen .step[data-id="${ids[i]}"]`);await row.focus();const pos=await row.evaluate(el=>Array.from(el.parentNode.children).indexOf(el));for(let n=pos;n>i;n--)await page.keyboard.press('ArrowUp');}
    }
    await page.clock.runFor(3800);
    await solve();
    // A background interruption pauses the round instead of consuming the limit.
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    const frozen=await page.locator('.timer').textContent();await page.clock.fastForward(95000);assert.equal(await page.locator('.timer').textContent(),frozen);
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
    // Simulate a stalled foreground frame: do not cap timer accounting to animation dt.
    await page.clock.fastForward(91000);
    await page.getByAltText("Time's up!",{exact:true}).waitFor();
    await page.clock.runFor(1500);await click('Check Right Order');
    await page.getByText('Review the correct order below.',{exact:true}).waitFor();
    assert.equal(await page.locator('.compare-cell').count(),0);
    assert.equal(await page.locator('.timeout-correct-list .step').count(),8);
    const labels=await page.locator('.timeout-correct-list .step>span').allTextContents();
    assert.deepEqual(labels,await page.evaluate(ids=>ids.map(id=>ABConfig.steps[id-1]),failedSelection));
    for(const [width,height] of [[320,568],[390,844],[768,1024]]){await page.setViewportSize({width,height});await page.clock.runFor(100);assert(await page.locator('.timeout-correct-list').evaluate(e=>e.scrollHeight<=e.clientHeight+1));assert(await page.locator('.timeout-correct-list .step>span').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1&&e.getBoundingClientRect().height<e.parentElement.getBoundingClientRect().height*.8)));}
    await page.setViewportSize({width:390,height:844});await page.clock.runFor(100);await page.screenshot({path:'artifacts/ab-timeout-correct.png'});
    assert.equal((await saved()).run.index,0);assert.notDeepEqual((await saved()).run.order[0],failedSelection);assert.equal((await saved()).stars,2);
    await click('Play Again');await page.locator('#screen[data-page="arrange"]').waitFor({state:'visible'});
    assert.match(await page.locator('.timer').textContent(),/Time 1:30|Time 1:29/);
    await page.clock.runFor(3800);
    await solve();await click('Start the Train');await page.clock.runFor(16000);await page.clock.fastForward(95000);
    await page.getByRole('button',{name:'Next',exact:true}).waitFor();assert.equal((await saved()).run.index,1);
    assert.equal(await page.locator('.timeout-note').count(),0);
    await click('Next');await click('Home');await click('Practice Mode');await click('Start Practising');await page.locator('#screen[data-page="arrange"]').waitFor({state:'visible'});
    await page.clock.fastForward(95000);assert.equal(await page.locator('#screen .step').count(),8);assert.equal(await page.locator('.timer').count(),0);
    console.log('90-second timer passed: expiry, streak reset, different retry, fresh limit, pause, stalled frame, submitted-result protection, untimed practice.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

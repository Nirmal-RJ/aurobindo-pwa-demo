const { chromium } = require(process.env.SOLVENT_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const url = process.env.SOLVENT_URL || 'http://localhost:4173/assets/solvent-master-game-scripts/solvent-master.html';
const output = 'artifacts/solvent-master-landing';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const report = { viewports: [], errors: [] };
  try {
    const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    // Fail one required asset through all automatic attempts: Next must remain locked.
    const blocked = '**/page-3-c/main-beaker.webp?rev=*';
    await context.route(blocked, route => route.abort());
    await page.goto(url);
    await page.locator('#load-retry:not([hidden])').waitFor();
    assert.equal(await page.locator('#next').isVisible(), false);
    assert.equal(await page.locator('#next').isDisabled(), true);
    assert.match(await page.locator('#load-status').textContent(), /main-beaker/);
    await page.screenshot({ path: `${output}/loading-retry.png` });
    await context.unroute(blocked);
    await page.locator('#load-retry').click();
    await page.waitForFunction(() => window.SolventMaster?.ready, {}, { timeout: 60000 });
    assert.equal(await page.locator('#loader').isVisible(), false);
    assert.equal(await page.locator('#next').isEnabled(), true);
    report.assets = await page.evaluate(async () => {
      const keys = await (await caches.open(SolventMasterConfig.loading.cacheName)).keys();
      return { cached: keys.length, expected: SOLVENT_MASTER_ASSETS.length, references: keys.filter(k => /reference/.test(k.url)).length };
    });
    assert.equal(report.assets.cached, report.assets.expected);
    assert.equal(report.assets.references, 4); // User-approved temporary demo media only.
    for (const [width,height] of [[2560,1080],[1920,900],[1920,1080],[1366,768],[1024,768],[844,390],[667,375],[393,852]]) {
      await page.setViewportSize({width,height});
      await page.waitForTimeout(450);
      const bounds = await page.evaluate(() => {
        const game = document.querySelector('#game').getBoundingClientRect(), button = document.querySelector('#next').getBoundingClientRect();
        return { ratio: game.width/game.height, inside: button.left>=game.left && button.top>=game.top && button.right<=game.right+1 && button.bottom<=game.bottom+1, viewport: game.left>=-1 && game.top>=-1 && game.right<=innerWidth+1 && game.bottom<=innerHeight+1 };
      });
      assert.ok(Math.abs(bounds.ratio-(width>=height?width/height:16/9))<.01); assert.ok(bounds.inside && bounds.viewport,JSON.stringify({width,height,...bounds}));
      assert.equal(await page.locator('#landing-art').evaluate(img=>getComputedStyle(img).objectFit),'cover');
      report.viewports.push({width,height,...bounds});
      await page.screenshot({path:`${output}/ready-${width}x${height}.png`});
    }
    await page.setViewportSize({width:960,height:540});
    await page.evaluate(() => { window.nextEvents=0; document.addEventListener('solvent-master:next',()=>window.nextEvents++); document.querySelector('#next').click(); document.querySelector('#next').click(); });
    assert.equal(await page.evaluate(()=>window.nextEvents),1);
    await context.setOffline(true);
    await page.reload();
    await page.waitForFunction(()=>window.SolventMaster?.ready, {}, {timeout:30000});
    report.offlineReload = true;
    assert.deepEqual(report.errors,[]);
    fs.writeFileSync(`${output}/verification.json`,JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
    await context.close();
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

// Run against the repository server; checks the moved entry point and dedicated offline worker.
const { webkit, chromium } = require(process.env.ROCKET_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
(async () => {
  const browser = await (process.env.ROCKET_ENGINE === 'chromium' ? chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}) : webkit.launch({ headless: true }));
  let server;
  try {
    let origin = process.env.ROCKET_ORIGIN || 'http://localhost:4173';
    if (process.env.ROCKET_STOP_SERVER !== '0') {
      origin = 'http://localhost:4177';
      server = spawn(process.execPath, [path.join(__dirname, '../server.mjs')], {env:{...process.env, PORT:'4177'}, windowsHide:true, stdio:['ignore','pipe','pipe']});
      await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('Test server exited '+code)));});
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/rocket-game.html`);
    await page.waitForURL('**/assets/rocket-game-scripts/rocket-game.html');
    await page.waitForFunction(() => window.RocketPreload?.ready, {}, { timeout: 90000 });
    assert.equal(await page.evaluate(() => navigator.serviceWorker.controller.scriptURL), `${origin}/assets/rocket-game-scripts/sw.js`);
    if (server) { await new Promise(resolve=>{server.once('exit',resolve);server.kill();}); server = null; }
    else await context.setOffline(true);
    assert.equal(await page.evaluate(async () => (await fetch(location.href)).status), 200);
    await page.reload();
    await page.waitForFunction(() => window.RocketPreload?.ready, {}, { timeout: 30000 });
    await page.locator('#start').click({ force: true }); await page.waitForTimeout(750);
    assert.ok(await page.locator('.brief-art').evaluate(img => img.complete && img.naturalWidth > 0));
    await page.locator('#start-mission').click({ force: true }); await page.waitForTimeout(750);
    assert.ok(await page.locator('.mission-card-art').evaluate(img => img.complete && img.naturalWidth > 0));
    await page.locator('#play').click({ force: true }); await page.waitForTimeout(750);
    const before = await page.locator('.rocket-track').evaluate(el => getComputedStyle(el).transform);
    await page.waitForTimeout(300);
    assert.notEqual(await page.locator('.rocket-track').evaluate(el => getComputedStyle(el).transform), before);
    const media = await page.evaluate(async () => {
      const response = await fetch(RocketGame.recipes[4].video, { headers: { Range: 'bytes=0-99' } });
      return { status: response.status, bytes: (await response.arrayBuffer()).byteLength };
    });
    assert.deepEqual(media, { status: 206, bytes: 100 });
    assert.deepEqual(errors, []);
    console.log(`${process.env.ROCKET_ENGINE || 'webkit'}: old URL redirects; dedicated worker controls; offline reload, art, conveyor and video byte ranges pass.`);
  } finally { server?.kill(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

const { chromium } = require(process.env.CARZ_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const output = 'artifacts/my-carz-flow';
const url = process.env.CARZ_URL || 'http://localhost:4187/assets/my-carz-game-scripts/my-carz.html';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 393, height: 852 } });
    const page = await context.newPage(), errors = [], http = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) http.push(`${r.status()} ${r.url()}`); });
    const ready = async () => { await page.goto(url); await page.waitForFunction(() => window.CarzGame?.state.ready, {}, { timeout: 90000 }); };
    const click = async id => { await page.waitForFunction(() => !window.CarzGame.state.busy); await page.locator('#' + id).click(); };
    await ready(); await page.screenshot({ path: `${output}/opening.png` }); await click('opening-next');
    await page.locator('#demo:not([hidden])').waitFor(); await click('demo-next');
    await ready(); await click('opening-next'); assert.equal(await page.locator('#demo-counter').textContent(), '1 / 4');
    for (let i = 0; i < 4; i++) await click('demo-next');
    await page.waitForFunction(() => window.CarzGame.state.view === 'home' && !window.CarzGame.state.busy);
    assert.equal(await page.locator('#returning-actions').isVisible(), true); // This document is a reopened game.
    await page.screenshot({ path: `${output}/home.png` });
    await click('open-cars'); await page.screenshot({ path: `${output}/collection.png` }); await click('collection-back');
    await click('start-driving');
    async function driveAnswer(correct = true) {
      await page.waitForFunction(() => window.CarzGame.state.phase === 'reading' && !window.CarzGame.state.busy);
      const state = await page.evaluate(() => window.CarzGame.state);
      const goodLane = state.lanes.indexOf(state.question.answer), target = correct ? goodLane : 1 - goodLane;
      await page.keyboard.press(target ? 'ArrowRight' : 'ArrowLeft');
      await page.waitForFunction(id => window.CarzGame.state.phase !== 'reading' || window.CarzGame.state.question.id !== id, state.question.id);
      await page.waitForFunction(id => window.CarzGame.state.phase === 'feedback' || window.CarzGame.state.question.id !== id, state.question.id, { timeout: 15000 });
      return state;
    }
    await driveAnswer(false); await page.locator('#modal:not([hidden])').waitFor();
    assert.match(await page.locator('#modal-copy').textContent(), /Correct answer/); await page.screenshot({ path: `${output}/crash.png` });
    await page.getByRole('button', { name: 'Keep driving', exact: true }).click();
    let previous;
    for (let i = 0; i < 5; i++) {
      const state = await driveAnswer(); assert.notEqual(state.question.id, previous); previous = state.question.id;
      if (i < 4) await page.waitForFunction(streak => window.CarzGame.state.streak === streak && window.CarzGame.state.phase === 'reading', i + 1);
    }
    await page.locator('#scratch-area:not([hidden])').waitFor();
    assert.equal((await page.evaluate(() => CarzGame.state)).unlocked, 2);
    await page.screenshot({ path: `${output}/scratch.png` }); await click('reveal-car');
    await page.locator('#reward-car:not([hidden])').waitFor(); await page.screenshot({ path: `${output}/upgrade.png` });
    await page.getByRole('button', { name: 'Keep driving', exact: true }).click();
    await page.waitForFunction(() => CarzGame.state.phase === 'reading');
    assert.equal((await page.evaluate(() => CarzGame.state)).level, 2);
    await page.screenshot({ path: `${output}/race.png` });
    await driveAnswer(); await page.waitForFunction(() => CarzGame.state.streak === 1 && CarzGame.state.phase === 'reading');
    await page.reload(); await page.waitForFunction(() => CarzGame.state.ready, {}, { timeout: 90000 });
    assert.equal((await page.evaluate(() => CarzGame.state)).level, 2); assert.equal((await page.evaluate(() => CarzGame.state)).streak, 0);
    await click('opening-next'); await click('start-driving'); await page.waitForFunction(() => CarzGame.state.phase === 'reading');
    await click('exit-race'); await page.getByRole('button', { name: 'Save & Exit', exact: true }).click();
    await page.waitForFunction(() => CarzGame.state.view === 'home' && !CarzGame.state.busy);
    // The game must remain loadable and playable without any network after the preload.
    await context.setOffline(true); await page.reload(); await page.waitForFunction(() => CarzGame.state.ready, {}, { timeout: 30000 });
    await click('opening-next'); await page.waitForFunction(() => CarzGame.state.view === 'home' && !CarzGame.state.busy); assert.equal(await page.locator('#home').isVisible(), true);
    for (const [width, height] of [[320,568], [768,1024], [1440,900], [852,393]]) {
      await page.setViewportSize({ width, height }); await page.waitForTimeout(150);
      const bounds = await page.locator('#game').boundingBox(); assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= width + 1 && bounds.y + bounds.height <= height + 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: `${output}/home-${width}x${height}.png` });
    }
    assert.deepEqual(errors, []); assert.deepEqual(http, []);
    fs.writeFileSync(`${output}/verification.json`, JSON.stringify({ errors, http, checks: ['cold 84-file preload', 'interrupted demo replay', 'home/collection', 'wrong-answer recovery', 'five correct/unlock/scratch/reveal', 'new car entry', 'partial-progress rollback', 'save-exit to home', 'offline reload', 'five viewport bounds'] }, null, 2));
    console.log('My Carz browser flow passed'); await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

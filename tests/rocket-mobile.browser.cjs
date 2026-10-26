// Optional real-browser checks. Point ROCKET_PLAYWRIGHT at an installed Playwright package.
// PLAYWRIGHT_BROWSERS_PATH selects installed WebKit binaries; Edge supplies Chromium on Windows.
const { chromium, webkit } = require(process.env.ROCKET_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const output = 'artifacts/rocket-mobile-qa';
fs.mkdirSync(output, { recursive: true });
const url = process.env.ROCKET_URL || 'http://localhost:4173/assets/rocket-game-scripts/rocket-game.html';
async function run(type, options, label, width, height, fallback = false) {
  const browser = await type.launch({ headless: true, ...options });
  try {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true });
    if (fallback) await context.addInitScript(() => {
      Element.prototype.animate = undefined;
      const supports = CSS.supports.bind(CSS);
      CSS.supports = (property, value) => property === 'width' && value === '1cqw' ? false : supports(property, value);
    });
    const page = await context.newPage(), errors = [];
    if (process.env.ROCKET_REDUCED_MOTION === '1') await page.emulateMedia({reducedMotion:'reduce'});
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(url);
    await page.waitForFunction(() => window.RocketPreload?.ready, {}, { timeout: 90000 });
    const tap = async selector => {
      await page.locator('#game:not(.transitioning)').waitFor();
      await page.locator(selector).tap({ force: true });
    };
    await tap('#start'); await tap('#start-mission'); await tap('#play');
    await page.locator('#game:not(.transitioning)').waitFor();
    const before = await page.locator('.rocket-track').evaluate(el => getComputedStyle(el).transform);
    await page.waitForTimeout(250);
    assert.notEqual(await page.locator('.rocket-track').evaluate(el => getComputedStyle(el).transform), before, 'Conveyor must move');
    await tap('.rocket-choice:nth-child(8)');
    await page.waitForTimeout(250);
    assert.ok(await page.locator('#pad-rocket').evaluate(el => el.getAnimations().some(a => a.playState === 'running')), 'Docking must animate');
    const moving = await page.locator('#pad-rocket').boundingBox();
    await page.waitForTimeout(300);
    assert.notEqual((await page.locator('#pad-rocket').boundingBox()).y, moving.y, 'Docking must change position');
    await page.waitForFunction(() => document.querySelector('#hangar').classList.contains('formula-reveal'));
    assert.equal(await page.locator('.rocket-model-name').evaluate(el => getComputedStyle(el, '::before').animationName), 'formula-sweep');
    assert.notEqual(await page.locator('.rocket-model-name').evaluate(el => getComputedStyle(el, '::after').display), 'none');
    assert.equal(await page.locator('#fuel-system').isVisible(), false);
    await page.waitForFunction(() => !document.querySelector('#hangar').classList.contains('boarding') && !document.querySelector('[data-fill="Water"]').disabled);
    await page.screenshot({ path: `${output}/${label}-filling.png` });
    await page.setViewportSize({ width: height, height: width });
    await page.waitForTimeout(150);
    assert.ok(await page.evaluate(() => document.querySelector('#game').getBoundingClientRect().width <= innerWidth + 1), 'Landscape must fit screen width');
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(150);
    const fill = page.locator('[data-fill="Water"]');
    await fill.tap({ force: true });
    let state = await page.evaluate(() => JSON.parse(localStorage.getItem('aurobindo.rocketier.v1')));
    assert.equal(state.runs.at(-1).questions.at(-1).attempts.at(-1).events.length, 1, 'Touch tap adds exactly one increment');
    await page.locator('#undo-mixture').tap({ force: true });
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('aurobindo.rocketier.v1'));
      const recipe = RocketGame.recipes[state.runs.at(-1).questions.at(-1).recipeId];
      for (const c of RocketGame.chemicals) for (let n=0; n<recipe.mix[c]; n+=RocketGame.increment(recipe,c)) document.querySelector(`[data-fill="${c}"]`).click();
    });
    await page.waitForFunction(() => !document.querySelector('#launch').disabled);
    await page.locator('#launch').tap({ force: true });
    await page.waitForTimeout(1400);
    assert.ok(await page.locator('.launch-plume i').first().evaluate(el => getComputedStyle(el).opacity > 0), 'Launch smoke must animate');
    assert.equal(await page.locator('#hangar').evaluate(el => getComputedStyle(el).animationName), 'launch-camera-shake');
    assert.notEqual(await page.locator('.launch-plume i').first().evaluate(el => getComputedStyle(el).display), 'none');
    assert.equal(await page.locator('.launch-plume i').first().evaluate(el => getComputedStyle(el).animationName), 'launch-cloud-roll');
    await page.screenshot({ path: `${output}/${label}-launch.png` });
    await page.waitForFunction(() => !document.querySelector('#cinematic').hidden, {}, { timeout: 10000 });
    assert.ok(await page.locator('.cinematic-path').evaluate(el => el.getAnimations().some(a => a.playState === 'running')), 'Flight must animate');
    await page.waitForFunction(() => !document.querySelector('#journey').hidden, {}, { timeout: 10000 });
    await page.waitForTimeout(1000);
    assert.ok(await page.locator('#journey-rocket').evaluate(el => el.getAnimations().some(a => a.playState === 'running')), 'Route must animate');
    const routePosition = await page.locator('#journey-rocket').boundingBox();
    await page.waitForTimeout(300);
    assert.notEqual((await page.locator('#journey-rocket').boundingBox()).y, routePosition.y, 'Route must change position');
    await page.waitForFunction(() => !document.querySelector('#continue').disabled);
    await page.screenshot({ path: `${output}/${label}-journey.png` });
    await tap('#continue');
    await page.locator('#game:not(.transitioning)').waitFor();
    await tap('.rocket-choice:nth-child(8)');
    await page.waitForFunction(() => !document.querySelector('#hangar').classList.contains('boarding') && !document.querySelector('[data-fill="Water"]').disabled);
    // Fill a deliberately wrong all-water mixture, avoiding a 40-second timeout.
    await page.evaluate(() => { const b=document.querySelector('[data-fill="Water"]'); for(let i=0;i<20&&!b.disabled;i++)b.click(); });
    await page.waitForFunction(() => !document.querySelector('#launch').disabled);
    await page.locator('#launch').tap({ force: true });
    await page.waitForTimeout(1450);
    assert.equal(await page.locator('#flames .smoking').count(), 1);
    await page.screenshot({ path: `${output}/${label}-failure-smoke.png` });
    await page.locator('#popup.engine-popup[open]').waitFor();
    await page.locator('#popup-action').tap({ force: true });
    await page.locator('#popup.video-popup[open]').waitFor();
    const video = await page.locator('#lesson').evaluate(async el => {
      try { await Promise.race([el.play(), new Promise(resolve => setTimeout(resolve, 3000))]); } catch (_) {}
      return { readyState: el.readyState, decoder: el.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'), error: el.error?.message || null, inline: el.playsInline, width: el.clientWidth, height: el.clientHeight };
    });
    await page.screenshot({ path: `${output}/${label}-video.png` });
    assert.equal(video.inline, true);
    assert.ok(video.width > width * .75 && video.height > height * .6);
    await page.locator('#popup-action').tap({ force: true }); await page.locator('#popup-action').tap({ force: true });
    await page.waitForFunction(() => !document.querySelector('#hangar').classList.contains('boarding') && !document.querySelector('[data-fill="Water"]').disabled);
    assert.equal(await page.locator('#countdown').textContent(), 'T-40');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ label, width, height, fallback, animations: 'passed', touch: 'passed', failureRetry: 'passed', video, errors }));
    await context.close();
  } finally { await browser.close(); }
}
(async () => {
  const edge = { executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' };
  await run(chromium, edge, 'android-chromium', 393, 851);
  await run(webkit, {}, 'iphone-webkit', 390, 844);
  await run(webkit, {}, 'small-iphone-fallback', 320, 568, true);
})().catch(error => { console.error(error); process.exitCode = 1; });

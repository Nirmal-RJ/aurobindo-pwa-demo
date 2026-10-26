const { chromium, webkit } = require(process.env.ROCKET_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
async function run(type, options, label) {
  const browser = await type.launch({ headless: true, ...options });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    let interrupted = 0;
    await context.route(url => url.pathname.endsWith('/page-2/mission=brief.webp') && !url.searchParams.has('rocketAsset'), route => { interrupted++; return route.abort(); });
    await context.addInitScript(() => {
      const decode = HTMLImageElement.prototype.decode;
      HTMLImageElement.prototype.decode = async function () {
        await decode.call(this);
        if (this.src.includes('mission=brief.webp') && !window.__briefDecodeWaiting) {
          window.__briefDecodeWaiting = true;
          await new Promise(resolve => { window.__releaseBrief = resolve; });
        }
      };
    });
    const page = await context.newPage();
    await page.goto(process.env.ROCKET_URL || 'http://localhost:4173/assets/rocket-game-scripts/rocket-game.html');
    await page.waitForFunction(() => window.__briefDecodeWaiting, {}, { timeout: 90000 });
    assert.ok(interrupted > 0, 'Initial brief request must fail to reproduce the first-visit bug');
    assert.equal(await page.evaluate(() => RocketPreload.ready), false);
    assert.equal(await page.locator('#start').isDisabled(), true);
    await page.evaluate(() => window.__releaseBrief());
    await page.waitForFunction(() => RocketPreload.ready);
    await page.locator('#start').tap({ force: true });
    await page.locator('#brief').waitFor({ state: 'visible' });
    const art = await page.locator('.brief-art').evaluate(img => ({ loaded: img.complete && img.naturalWidth > 0, src: img.src }));
    assert.ok(art.loaded); assert.match(art.src, /rocketAsset=/);
    console.log(`${label}: first-visit failed image repaired; Start waits for decoding; brief visible without reopening`);
  } finally { await browser.close(); }
}
(async () => {
  await run(chromium, { executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' }, 'Chromium');
  await run(webkit, {}, 'WebKit');
})().catch(error => { console.error(error); process.exitCode = 1; });

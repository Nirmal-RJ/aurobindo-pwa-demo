const installReviewAuth=require('./review-auth-fixture.cjs');
const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT),assert=require('node:assert/strict');
(async()=>{for(const engine of ['edge','webkit']){const browser=engine==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:process.env.AB_WEBKIT,headless:true});try{
 const p=await browser.newPage({serviceWorkers:'block'});await p.route('**/*',r=>new URL(r.request().url()).origin==='http://localhost:4174'?r.continue():r.abort());
 const auth=await installReviewAuth(p);
 for(const width of [320,450,1280]){await p.setViewportSize({width,height:850});await p.goto('http://localhost:4174/index.html#/');await p.locator('.rc-chat-entry').waitFor();assert.deepEqual(await p.locator('#activities .card-title').allTextContents(),['App Report','Games','Coming Soon','Priority/Approval','RC Chat']);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await p.locator('footer').evaluate(e=>parseFloat(getComputedStyle(e).paddingBottom)<=14));await p.locator('.rc-chat-entry').scrollIntoViewIfNeeded();await p.waitForTimeout(1000);await p.screenshot({path:`artifacts/review-rc-home-${engine}-${width}.png`});}
 await p.locator('.rc-chat-entry').click();await p.getByRole('heading',{name:'RC discussions',exact:true}).waitFor();
 auth.role='director';await p.reload();await p.getByRole('heading',{name:'Global discussions',exact:true}).waitFor();await p.locator('.brand').click();await p.waitForURL('**/index.html#/');await p.waitForTimeout(150);assert.equal(await p.locator('.rc-chat-entry').isVisible(),false);
 console.log(engine+': RC homepage order, ghost direct entry, director/core exclusion, compact footer and responsive widths passed');
}finally{await browser.close();}}})().catch(e=>{console.error(e);process.exit(1)});

const {chromium,webkit}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{for(const name of ['edge','webkit']){
 const browser=name==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/webkit-2359/Playwright.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.addInitScript(()=>localStorage.setItem('qc-wave-rider-v1',JSON.stringify({version:1,day:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),demo:true,level:2,unlocked:2,score:42,stars:1})));
  await page.goto('http://localhost:4174/assets/wave-rider-scripts/wave-rider.html');
  await page.locator('[data-action=next]').click();
  await page.locator('[data-action=start]').click();
  await page.waitForTimeout(600);
  await page.locator('[data-action=leave]').click();
  await page.locator('[data-action=exit-home]').click();
  assert.equal(await page.locator('.boat-choice:not([disabled])').count(),3);
  await page.locator('[data-boat="0"]').click();
  assert.equal(await page.locator('.boat-name>span').textContent(),'Bamboo Raft');
  await page.locator('[data-action=boat-next]').click();
  assert.equal(await page.locator('.boat-name>span').textContent(),'Round River Boat');
  assert(await page.locator('[data-boat="3"]').isDisabled());
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('qc-wave-rider-v1')));
  assert.deepEqual([saved.level,saved.unlocked,saved.score,saved.stars],[2,2,42,1]);
  await page.locator('[data-action=start]').click();
  assert.equal(await page.locator('#ship img').getAttribute('alt'),'Round River Boat');
  console.log('PASS '+name+': exit restores card/arrow selection; locked boats stay locked; progression retained; chosen boat sails.');
 }finally{await browser.close();}
}})().catch(e=>{console.error(e);process.exitCode=1;});

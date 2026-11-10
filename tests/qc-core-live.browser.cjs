const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const base='https://apl-qc-core-app-f5a3e.web.app';
(async()=>{
 const directory=path.resolve(__dirname,'../artifacts/qc-core-live');await fs.mkdir(directory,{recursive:true});
 for(const engine of ['edge','webkit']){
  const browser=engine==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:process.env.AB_WEBKIT,headless:true});
  try{
   const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
   // Do not access the employee app, Wall of Fame, videos or any third-party host.
   await context.route('**/*',route=>route.request().url().startsWith(base+'/')||/^(data:|blob:)/.test(route.request().url())?route.continue():route.abort());
   for(const [width,height]of [[320,568],[390,844],[1440,900]]){
    await page.setViewportSize({width,height});await page.goto(base+'/');await page.locator('a[data-activity=games]').waitFor();
    await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('a[data-activity=games]')).opacity)>.99);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Live home overflow');
    await page.screenshot({path:path.join(directory,`${engine}-home-${width}.png`)});
    await page.goto(base+'/index.html#/games');await page.locator('a.poster-match-blast:visible').waitFor();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Live gallery overflow');
   }
   await page.goto(base+'/review/');await page.getByRole('button',{name:'Retry',exact:true}).waitFor();assert.equal(await page.locator('.review-app').isVisible(),false);
   await page.goto(base+'/review/login.html');await page.locator('#employee-id:enabled').waitFor();assert.equal(await page.locator('input').count(),1);
   assert.match(await page.locator('#login-error').textContent(),/database connection is awaiting approval/i);
   await page.locator('#employee-id').fill('123');await page.locator('#login-submit').click();await page.locator('#login-submit:enabled').waitFor();
   assert.match(await page.locator('#login-error').textContent(),/database connection is awaiting approval/i);
   assert.equal(await page.evaluate(()=>localStorage.getItem('qsl-review-session-v1')),null,'Disconnected service issues no session');
   await page.screenshot({path:path.join(directory,`${engine}-login-disabled.png`)});
   assert.deepEqual(errors,[]);await context.close();
   console.log('PASS '+engine+': live home/Games 320/390/1440, review restore unavailable/retry, ID-only disabled login, no session issued, no browser errors; all other hosts blocked.');
  }finally{await browser.close();}
 }
})().catch(error=>{console.error(error);process.exitCode=1;});

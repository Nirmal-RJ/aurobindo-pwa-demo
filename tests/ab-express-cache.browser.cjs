const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const replacedAssets=JSON.parse(fs.readFileSync('assets/ab-express-scripts/ab-express-assets.js','utf8').replace(/^window\.ABAssets = /,'').replace(/;\s*$/,'')).map(item=>item.path);
(async()=>{
 const browser=process.env.AB_WEBKIT?await webkit.launch({headless:true,executablePath:process.env.AB_WEBKIT}):await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844}}), page=await context.newPage();
  const url=process.env.AB_URL||'http://localhost:4174/assets/ab-express-scripts/ab-express.html?v=46';
  await page.goto(new URL('/favicon.ico',url).href);
  await page.evaluate(async url=>{
   const old=await caches.open('ab-express-v25');
   await old.put(new URL('../ab-express-assets/page-2/page-2-bg.webp',url).href,new Response('stale background'));
  },url);
  await page.goto(url);await page.getByRole('button',{name:'Next',exact:true}).waitFor();
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>navigator.serviceWorker.controller);
  for(const asset of replacedAssets){
   const expected=crypto.createHash('sha256').update(fs.readFileSync('assets/ab-express-assets/'+asset)).digest('hex');
   const actual=await page.evaluate(async asset=>{
    const cache=await caches.open('ab-express-v'+ABConfig.version),response=await cache.match(ABConfig.asset(asset));
    const hash=await crypto.subtle.digest('SHA-256',await response.arrayBuffer());return [...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,'0')).join('');
   },asset);assert.equal(actual,expected,'Versioned cache must contain current bytes: '+asset);
  }
  await page.getByRole('button',{name:'Next',exact:true}).click();await page.locator('#outgoing').waitFor({state:'detached'});
  assert.match(await page.locator('#screen').getAttribute('style'),/blob:/);
  await page.evaluate(async()=>{
   const cache=await caches.open('ab-express-v'+ABConfig.version);
   const response=await fetch(location.href);const html=await response.text();
   await cache.put(location.href,new Response(html.replace('<head>','<head><meta name="stale-shell" content="true">'),{headers:{'Content-Type':'text/html'}}));
  });
  await page.reload();await page.getByRole('button',{name:'Next',exact:true}).waitFor();assert.equal(await page.locator('meta[name="stale-shell"]').count(),0,'Online navigation must refresh stale cached HTML');
  if(process.env.AB_WEBKIT){console.log('WebKit cache regression passed: all 88 asset hashes and online shell refresh. Offline navigation not covered by this runner.');return;}
  await context.setOffline(true);await page.reload();await page.getByRole('button',{name:'Next',exact:true}).waitFor();
  await page.getByRole('button',{name:'Next',exact:true}).click();await page.locator('#outgoing').waitFor({state:'detached'});
  assert.match(await page.locator('#screen').getAttribute('style'),/blob:/);
  console.log('Cache regression passed: stale unversioned image bypassed, all 88 current asset hashes verified, online shell refreshed, offline demo retained.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});

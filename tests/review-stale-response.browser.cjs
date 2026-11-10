const installReviewAuth=require('./review-auth-fixture.cjs');
const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT),assert=require('node:assert/strict');
const adapter=`import {createMockAPI} from './mock-api.js';
export function createReviewAPI(){
 const api=createMockAPI();let hold=null;const listeners=new Set();
 const get=api.getMessage.bind(api);
 api.getMessage=async id=>{const value=await get(id);const pending=hold;if(pending&&value.roomId==='rc'){pending.started++;await pending.promise;}return value;};
 const subscribe=api.subscribe.bind(api);api.subscribe=fn=>{listeners.add(fn);return subscribe(fn);};
 window.race={api,arm(){let release;const promise=new Promise(r=>release=r);hold={promise,release,started:0};},started:()=>hold?.started||0,release(){const pending=hold;hold=null;pending.release();},emit:event=>{for(const fn of listeners)fn(event);}};
 return api;
}`;
(async()=>{for(const engine of ['edge','webkit']){
 const browser=engine==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:process.env.AB_WEBKIT,headless:true});
 try{for(const kind of ['message','reaction','delivery']){
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/review/api.js',route=>route.fulfill({contentType:'text/javascript',body:adapter}));
  // Isolated local-demo view race: expose test participants only in this intercepted source.
  // Actual authenticated-role restrictions are covered in review-auth.browser.cjs.
  await installReviewAuth(page);await page.route('**/review/app.js',async route=>{const response=await route.fetch();const source=await response.text();await route.fulfill({response,body:source.replace('accounts.filter(a=>a.role===signedInAccount.role)','accounts')});});await page.goto('http://localhost:4174/review/index.html#/rc/game/blast');await page.locator('.message').first().waitFor();
  const rcIds=await page.evaluate(async()=>{const messages=(await race.api.listMessages('rc','blast-30',undefined,100)).messages;race.arm();return messages.map(m=>m.id);});
  await page.evaluate(async kind=>{if(kind==='message')await race.api.simulateIncoming('rc','blast-30');else{const message=(await race.api.listMessages('rc','blast-30')).messages[0];race.emit({kind,roomId:'rc',buildId:'blast-30',messageId:message.id});}},kind);
  await page.waitForFunction(()=>race.started()>0);
  await page.locator('#account').selectOption('director-1');await page.locator('[data-discussion="blast"]').click();await page.locator('.message').first().waitFor();
  const globalIds=await page.locator('.message').evaluateAll(rows=>rows.map(row=>row.dataset.messageId));assert(globalIds.length>0);
  await page.evaluate(()=>{window.rcLeaks=[];window.audit=new MutationObserver(()=>{for(const row of document.querySelectorAll('.message'))if(window.rcMessageIds.includes(row.dataset.messageId))window.rcLeaks.push(row.dataset.messageId);});audit.observe(document.querySelector('#messages'),{childList:true,subtree:true});},null);
  await page.evaluate(ids=>{window.rcMessageIds=ids;},rcIds);
  await page.evaluate(()=>race.release());await page.waitForTimeout(100);
  // A subsequent Global render exposes contamination of the internal list, even
  // when the stale response itself returned before rendering.
  await page.evaluate(()=>race.api.simulateIncoming('global','blast-30'));
  await page.waitForFunction(n=>document.querySelectorAll('.message').length===n+1,globalIds.length,{timeout:2500});
  const shown=await page.locator('.message').evaluateAll(rows=>rows.map(row=>row.dataset.messageId));
  assert(globalIds.every(id=>shown.includes(id)),'Global history must remain intact');
  assert(!shown.some(id=>rcIds.includes(id)),'No RC message may enter the director Global list');
  const authorized=await page.evaluate(async()=>{const allowed=(await race.api.listMessages('global','blast-30',undefined,100)).messages.map(m=>m.id);return [...document.querySelectorAll('.message')].every(row=>allowed.includes(row.dataset.messageId));});
  assert(authorized,'Every rendered message must belong to the director Global chat');
  assert.deepEqual(await page.evaluate(()=>rcLeaks),[]);assert.deepEqual(errors,[]);
  console.log(engine+': delayed RC '+kind+' response discarded after director Global switch; subsequent Global render remains clean');
  await page.close();
 }}finally{await browser.close();}
}})().catch(e=>{console.error(e);process.exit(1)});

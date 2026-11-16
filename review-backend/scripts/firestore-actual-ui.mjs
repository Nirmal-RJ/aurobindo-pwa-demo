import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {Firestore} from '@google-cloud/firestore';
import {FirestoreReviewStore} from '../src/firestore-store.mjs';
import {createReviewServer} from '../src/server.mjs';
import {createFrontendServer} from '../../server.mjs';
import net from 'node:net';
async function freePort(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}


const require = createRequire(import.meta.url);
const {chromium, webkit} = require(process.env.REVIEW_PLAYWRIGHT_MODULE || 'playwright');
const key = 'qsl-review-session-v1';
const listen = (server, port=0) => new Promise((resolve,reject) => { server.once('error',reject); server.listen(port,'127.0.0.1',resolve); });
const close = async server => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); };
const token = page => page.evaluate(key => localStorage.getItem(key),key);
const ready = page => page.locator('.discussion-card').first().waitFor();
async function login(page, base, id) {
  await page.goto(base+'/review/login.html');
  await page.locator('#employee-id:enabled').waitFor();
  assert.equal(await page.locator('input').count(),1,'Employee ID is the only login field');
  await page.locator('#employee-id').fill(id);
  await page.locator('#login-submit').click();
  await ready(page);
}

// Hard guard: this suite must never authenticate to a real Google project.
if(!/^127\.0\.0\.1:\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST||''))throw Error('Loopback Firestore emulator is required.');
const db=new Firestore({projectId:'demo-qc-core-review',databaseId:'(default)'});
let frontend,backend;
try {
 for(const [employeeId,name,role,status] of [['100021','Local RC member','ghost','allowed'],['100024','Local director','director','allowed'],['100001','Blocked reviewer','ghost','blocked'],['100002','Wrong role','director','allowed']]){
  await db.collection('reviewAccounts').doc(employeeId).set({id:randomUUID(),employeeId,name,role,status});
 }
 const direct=await fetch('http://'+process.env.FIRESTORE_EMULATOR_HOST+'/v1/projects/demo-qc-core-review/databases/(default)/documents/reviewAccounts/100021');assert.equal(direct.status,403,'Client rules deny direct browser reads');
 let clock=new Date();const store=new FirestoreReviewStore(db,{now:()=>new Date(clock)});
 await assert.rejects(store.login('100022'),e=>e.status===403);
 await assert.rejects(store.login('100002'),e=>e.status===403);
 const issued=await store.login('100021'),session=await store.resolve({recovery:issued.recovery});
 assert(session.account.role==='ghost');
 await assert.rejects(store.resolve({cookie:issued.token,recovery:'invalid'}),e=>e.status===401);
 const before=await db.collection('reviewSessions').doc(session.sessionId).get();
 assert(!JSON.stringify(before.data()).includes(issued.recovery));
 clock=new Date(+clock+25*3600000);const expiry=await store.renew(session);assert(+expiry>+session.expiresAt);
 const renewed=await Promise.all(Array.from({length:4},()=>store.renew(session)));assert(renewed.every(d=>+d===+expiry),'Concurrent renewal preserves single renewed expiry');
 await Promise.all([store.logout(session),store.logout(session)]);
 await assert.rejects(store.resolve({recovery:issued.recovery}),e=>e.status===401);
 const expired=await store.login('100021');clock=new Date(+clock+91*86400000);await assert.rejects(store.resolve({cookie:expired.token}),e=>e.status===401);
 const audits=await db.collection('reviewAudit').where('sessionId','==',session.sessionId).where('action','==','logout').get();assert.equal(audits.size,1);
 console.log('PASS real Firestore transactions: denied IDs/roles, hash-only sessions, recovery precedence, concurrent renewal/logout, audit idempotency, expiration.');
    const apiPort = await freePort();
    frontend = createFrontendServer({reviewApiTarget:`http://127.0.0.1:${apiPort}`});
    await listen(frontend);
    const base = 'http://127.0.0.1:'+frontend.address().port;
    const startAPI = async () => { backend = createReviewServer({store:new FirestoreReviewStore(db),origin:base,secure:false,webRoot:null}); await listen(backend,apiPort); };
    await startAPI();
    assert.equal((await fetch(base+'/review-api/health')).status,200);
    assert.equal((await fetch(base+'/review-backend/test-fixtures/web/index.html')).status,403,'Backend fixtures are never public static files');
    assert.equal((await fetch(base+'/index.html')).status,200,'Public app remains available');
    for (const file of ['/assets/rocket-game-scripts/rocket-game.html','/assets/ab-express-scripts/ab-express.html','/assets/match-it-blast-it-scripts/match-it-blast-it.html']) {
      assert.equal((await fetch(base+file)).status,200,'Existing game entry remains served: '+file);
    }
    assert.equal((await fetch(base+'/review-api/me',{headers:{Origin:'http://different.invalid'}})).status,403,'Proxy preserves browser Origin checks');
    const unknown = await fetch(base+'/review-api/not-a-page');
    assert.equal(unknown.status,404);assert.match(unknown.headers.get('content-type'),/application\/json/);
    await mkdir(new URL('../scratch/actual-ui/',import.meta.url),{recursive:true});
    for (const engine of ['edge','webkit']) {
      const browser = engine==='edge' ? await chromium.launch({channel:'msedge',headless:true}) : await webkit.launch({executablePath:process.env.REVIEW_WEBKIT_EXECUTABLE,headless:true});
      try {
        const context = await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
        const page = await context.newPage(), errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        let loginRequests=0;page.on('request',request=>{if(new URL(request.url()).pathname==='/review-api/login')loginRequests++;});
        await page.goto(base+'/review/index.html#/rc/game/blast');
        await page.locator('#employee-id:enabled').waitFor();
        for (const id of ['100022','100001','100002']) {
          await page.locator('#employee-id').fill(id);await page.locator('#login-submit').click();
          await page.locator('#login-error:visible').waitFor();await page.locator('#login-submit:enabled').waitFor();
          assert.equal(await token(page),null,'Denied identities never receive a recovery credential');
        }
        for (const [width,height] of [[320,568],[390,844],[1440,900]]) {
          await page.setViewportSize({width,height});
          assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Login has no horizontal overflow');
        }
        await page.screenshot({path:new URL('../scratch/actual-ui/'+engine+'-login.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
        await login(page,base,'100021');
        const credential = await token(page);assert(credential,'Real backend issued a recovery credential');
        const cookie = (await context.cookies()).find(value=>value.name==='__session');
        assert(cookie?.httpOnly && cookie.path==='/review-api','Copied HttpOnly __session cookie survives proxy');
        assert(!(await page.evaluate(()=>document.cookie)).includes('__session'),'Session cookie is not script-readable');
        assert(await page.locator('[data-room=rc]').count(),'Ghost can see RC local-demo space');
        assert.match(await page.locator('.demo-banner').textContent(),/Not shared conversations/);
        const beforeRestore=loginRequests;
        await page.reload();await ready(page);assert.equal(loginRequests,beforeRestore,'Restoration does not create another login');
        await context.clearCookies();await page.reload();await ready(page);
        assert((await context.cookies()).some(value=>value.name==='__session'),'Bearer recovery recreates missing cookie');
        const persisted=await context.storageState();
        const reopened=await browser.newContext({storageState:persisted,serviceWorkers:'block'}), re=await reopened.newPage();
        await re.goto(base+'/review/profile.html');await re.locator('#profile:visible').waitFor();
        assert.equal(await re.locator('#profile-name').textContent(),'Local RC member');await reopened.close();
        await page.evaluate(key=>localStorage.removeItem(key),key);await page.reload();await ready(page);
        assert.equal(await token(page),null,'Cookie-only restoration works without inventing a token');
        await page.locator('#profile-link').click();await page.locator('#profile:visible').waitFor();
        assert.equal(await page.locator('#profile-employee-id').textContent(),'100021');
        await page.locator('#profile-logout').click();await page.locator('#employee-id:enabled').waitFor();
        await login(page,base,'100021');
        const retained = await token(page);
        await close(backend);backend=null;
        await page.reload();await page.getByRole('button',{name:'Retry',exact:true}).waitFor();
        assert((await token(page))===retained,'Upstream outage preserves recovery credential');
        assert.equal(await page.locator('.review-app').isVisible(),false,'Protected view stays hidden during restore failure');
        await startAPI();await page.getByRole('button',{name:'Retry',exact:true}).click();await ready(page);
        await page.locator('#profile-link').click();await page.locator('#profile:visible').waitFor();
        await close(backend);backend=null;
        await page.locator('#profile-logout').click();await page.getByRole('button',{name:'Retry logout',exact:true}).waitFor();
        assert((await token(page))===retained,'Failed logout preserves credential for retry');
        await startAPI();await page.getByRole('button',{name:'Retry logout',exact:true}).click();await page.locator('#employee-id:enabled').waitFor();
        assert.equal(await token(page),null);
        const revoked=await fetch(base+'/review-api/me',{headers:{Authorization:'Bearer '+retained}});
        assert.equal(revoked.status,401,'Logout actually revoked the Firestore session');

        // Hold an actual RC-member /me response, log in as director in another tab,
        // then release it. No authentication response is fabricated in this test.
        await login(page,base,'100021');
        let release, holding=true;
        await page.route('**/review-api/me',async route=>{
          if(!holding)return route.continue();holding=false;
          const response=await route.fetch();await new Promise(resolve=>release=resolve);
          await route.fulfill({response});
        });
        await page.goto(base+'/review/profile.html',{waitUntil:'domcontentloaded'});
        await assertEventually(()=>!!release);
        const other=await context.newPage();await other.goto(base+'/review/profile.html');await other.locator('#profile:visible').waitFor();
        await other.locator('#profile-logout').click();await other.locator('#employee-id:enabled').waitFor();
        await login(other,base,'100024');
        release();await page.getByRole('button',{name:'Retry',exact:true}).waitFor();
        assert.equal(await page.locator('#profile').isVisible(),false,'Delayed ghost identity never mounts over director login');
        await page.getByRole('button',{name:'Retry',exact:true}).click();await page.locator('#profile:visible').waitFor();
        assert.equal(await page.locator('#profile-name').textContent(),'Local director');
        await page.unroute('**/review-api/me');await other.close();
        await page.locator('#profile-back').click();await ready(page);
        assert.equal(await page.locator('[data-room=rc]').count(),0,'Director sees no RC controls');
        await page.goto(base+'/review/index.html#/rc/game/blast');await page.locator('.discussion-card, .conversation:visible').first().waitFor();
        assert.equal(await page.locator('[data-room=rc]').count(),0,'Direct RC route does not grant access');
        await page.goto(base+'/review/profile.html');await page.locator('#profile:visible').waitFor();
        await page.setViewportSize({width:320,height:568});
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Profile fits small viewport');
        await page.screenshot({path:new URL('../scratch/actual-ui/'+engine+'-profile.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
        // Standalone roster access changes are enforced on restore, even for existing sessions.
        await db.collection('reviewAccounts').doc('100024').update({status:'blocked'});
        await page.reload();await page.locator('#employee-id:enabled').waitFor();assert.equal(await token(page),null);
        await db.collection('reviewAccounts').doc('100024').update({status:'allowed'});
        assert.deepEqual(errors,[],'Actual UI has no browser runtime errors');
        await context.close();

        const noCookie=await browser.newContext({serviceWorkers:'block'});
        await noCookie.route('**/review-api/**',async route=>{
          const headers={...route.request().headers()};delete headers.cookie;
          const response=await route.fetch({headers}),returned={...response.headers()};delete returned['set-cookie'];
          await route.fulfill({response,headers:returned});
        });
        const c=await noCookie.newPage();await login(c,base,'100021');await c.reload();await ready(c);await noCookie.close();
        const noStorage=await browser.newContext({serviceWorkers:'block'});
        await noStorage.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}}));
        // Chat's local demo needs storage; test authentication recovery on Profile
        // independently rather than pretending its browser-local data is shared.
        const s=await noStorage.newPage();await s.goto(base+'/review/login.html?return=/review/profile.html');
        await s.locator('#employee-id:enabled').waitFor();await s.locator('#employee-id').fill('100024');await s.locator('#login-submit').click();
        await s.locator('#profile:visible').waitFor();await s.reload();await s.locator('#profile:visible').waitFor();
        assert.equal(await s.locator('#profile-name').textContent(),'Local director');await noStorage.close();
        console.log('PASS '+engine+': actual review UI + real Firestore emulator backend through same-origin proxy; allowed/denied IDs, server profile/role, reload/reopen, cookie and bearer recovery, outage/retry, logout revocation, stale identity guard, access revocation, small-screen layout.');
      } finally { await browser.close(); }
    }
  } finally { if(backend)await close(backend);if(frontend)await close(frontend);await db.terminate(); }


async function assertEventually(check) {
  for(let attempt=0;attempt<100;attempt++){if(check())return;await new Promise(resolve=>setTimeout(resolve,30));}
  assert.fail('Real backend response was not captured in time');
}


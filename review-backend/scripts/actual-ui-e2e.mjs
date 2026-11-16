import {createRequire} from 'node:module';
import {readFile, mkdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import assert from 'node:assert/strict';
import pg from 'pg';
import {ReviewStore} from '../src/store.mjs';
import {createReviewServer} from '../src/server.mjs';
import {createFrontendServer} from '../../server.mjs';
import {withTestPostgres, freePort} from './with-test-postgres.mjs';
import {restrictedFixturePool,assertRestrictedAccess,verifyProductionEntry} from './restricted-fixture.mjs';

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

await withTestPostgres(async connectionString => {
  // Run the copied SQL/HTTP suite against this independent cluster too.
  const {stdout} = await promisify(execFile)(process.execPath,['--test','--test-isolation=none','test/login.test.mjs'],{
    cwd: new URL('..',import.meta.url), env:{...process.env,REVIEW_TEST_DATABASE_URL:connectionString}, windowsHide:true, timeout:120000,
  });
  process.stdout.write(stdout);
  const pool = new pg.Pool({connectionString,max:2});
  let frontend, backend, runtimePool;
  try {
    await pool.query(await readFile(new URL('../src/schema.sql',import.meta.url),'utf8'));
    for (const [id,name,flag,status] of [
      ['100021','Local RC member',true,'allowed'],['100024','Local director',true,'allowed'],
      ['100022','Excluded employee',true,'allowed'],['100001','Ordinary employee',false,'allowed'],['100002','Blocked member',true,'blocked'],
    ]) {
      if(id==='100022')continue;await pool.query('INSERT INTO review_auth.accounts(id,employee_id,name,role,status) VALUES($1,$2,$3,$4,$5)',[randomUUID(),id,name,id==='100024'?'director':'ghost',flag?status:'blocked']);
    }
    await pool.query(await readFile(new URL('../src/schema.sql',import.meta.url),'utf8'));
    runtimePool=await restrictedFixturePool(pool,connectionString);
    await assertRestrictedAccess(runtimePool);
    await assert.rejects(runtimePool.query('SELECT a.id FROM review_auth.accounts a FOR SHARE OF a'),error=>error.code==='42501','Old locking query must fail with the restricted role');
    const runtimeStore=new ReviewStore(runtimePool),rosterBefore=(await pool.query('SELECT * FROM review_auth.accounts ORDER BY employee_id')).rows;
    const saved=await runtimeStore.login('100021');
    const restored=await runtimeStore.resolve({recovery:saved.recovery});
    await pool.query("UPDATE review_auth.sessions SET renewed_at=clock_timestamp()-interval '2 days',expires_at=clock_timestamp()+interval '1 hour' WHERE id=$1",[restored.sessionId]);
    const expiring=await runtimeStore.resolve({recovery:saved.recovery});
    assert(Date.parse(await runtimeStore.renew(expiring))>Date.now()+89*86400000,'Restricted runtime renews session');
    await runtimeStore.logout(await runtimeStore.resolve({recovery:saved.recovery}));
    await assert.rejects(runtimeStore.resolve({recovery:saved.recovery}),error=>error.status===401);
    assert.deepEqual((await pool.query('SELECT * FROM review_auth.accounts ORDER BY employee_id')).rows,rosterBefore,'Review operations do not modify the standalone roster');
    console.log('PASS restricted SQL role: old locking query denied, roster writes/DDL denied, actual login/recovery/renewal/logout/audit succeed; standalone roster unchanged.');
    await verifyProductionEntry(runtimePool.options.connectionString);
    console.log('PASS production entrypoint: starts without runtime schema DDL, logs in/out with restricted SQL role and sets Secure cookie.');
    const apiPort = await freePort();
    frontend = createFrontendServer({reviewApiTarget:`http://127.0.0.1:${apiPort}`});
    await listen(frontend);
    const base = 'http://127.0.0.1:'+frontend.address().port;
    const startAPI = async () => { backend = createReviewServer({store:new ReviewStore(runtimePool),origin:base,secure:false,webRoot:null}); await listen(backend,apiPort); };
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
        assert.equal(revoked.status,401,'Logout actually revoked the SQL session');

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
        await pool.query("UPDATE review_auth.accounts SET status='blocked' WHERE employee_id='100024'");
        await page.reload();await page.locator('#employee-id:enabled').waitFor();assert.equal(await token(page),null);
        await pool.query("UPDATE review_auth.accounts SET status='allowed' WHERE employee_id='100024'");
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
        console.log('PASS '+engine+': actual review UI + real SQL backend through same-origin proxy; allowed/denied IDs, server profile/role, reload/reopen, cookie and bearer recovery, outage/retry, logout revocation, stale identity guard, access revocation, small-screen layout.');
      } finally { await browser.close(); }
    }
  } finally { if(backend)await close(backend);if(frontend)await close(frontend);await runtimePool?.end();await pool.end(); }
});

async function assertEventually(check) {
  for(let attempt=0;attempt<100;attempt++){if(check())return;await new Promise(resolve=>setTimeout(resolve,30));}
  assert.fail('Real backend response was not captured in time');
}

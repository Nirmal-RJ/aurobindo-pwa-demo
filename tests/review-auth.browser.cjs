const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT),assert=require('node:assert/strict');
const account={id:'fixture-anand',employeeId:'100016',name:'Anand',role:'ghost',identityMethod:'employee-id-only'},expiresAt='2099-01-01T00:00:00Z',key='qsl-review-session-v1';
(async()=>{for(const engine of ['edge','webkit']){
 const browser=engine==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:process.env.AB_WEBKIT,headless:true});
 try{
  const p=await browser.newPage({viewport:{width:390,height:844}}),calls=[],errors=[];let active=null,mode='ok';p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/review-api/**',async route=>{const request=route.request(),endpoint=new URL(request.url()).pathname;calls.push({endpoint,method:request.method(),body:request.postDataJSON()});
   assert(!request.url().includes('fixture-token'));assert(!endpoint.includes('messages'));
   if(mode==='unavailable')return route.fulfill({status:503,json:{message:'Review service temporarily unavailable'}});
   if(endpoint.endsWith('/login')){assert.deepEqual(request.postDataJSON(),{employeeId:'100016'});active={...account};return route.fulfill({status:200,json:{account:active,expiresAt,recoveryToken:'fixture-token'}});}
   if(endpoint.endsWith('/logout')){assert.equal(request.headers().authorization,'Bearer fixture-token');active=null;return route.fulfill({status:204});}
   return route.fulfill(active?{status:200,json:{account:active,expiresAt}}:{status:401,json:{message:'Sign in'}});
  });
  await p.goto('http://localhost:4174/review/index.html#/rc/game/blast');await p.waitForURL('**/login.html?**');await p.locator('#employee-id').waitFor();assert.equal(await p.locator('input').count(),1);
  await p.locator('#employee-id').fill('100016');await p.locator('#login-submit').click();await p.locator('.message').first().waitFor();assert.equal(await p.locator('#chat-room').textContent(),'RC');assert.match(await p.locator('.brand small').textContent(),/Chat demo/);assert.equal(await p.evaluate(key=>localStorage.getItem(key),key),'fixture-token');assert(!(await p.locator('body').innerText()).includes('fixture-token'));
  await p.locator('#profile-link').click();await p.locator('#profile').waitFor();assert.equal(await p.locator('#profile-name').textContent(),'Anand');assert.equal(await p.locator('#profile-employee-id').textContent(),'100016');
  mode='unavailable';await p.locator('#profile-logout').click();await p.getByRole('button',{name:'Retry logout',exact:true}).waitFor();assert.equal(await p.evaluate(key=>localStorage.getItem(key),key),'fixture-token');
  mode='ok';await p.locator('#profile-logout').click();await p.waitForURL('**/login.html?**');await p.locator('#employee-id').waitFor();assert.equal(await p.evaluate(key=>localStorage.getItem(key),key),null);
  active={...account,id:'fixture-director',name:'Director',role:'director'};await p.goto('http://localhost:4174/review/index.html?room=rc');await p.locator('.discussion-card').first().waitFor();assert.equal(await p.locator('[data-room=rc]').count(),0);assert.equal(await p.locator('#account option').count(),1);assert.match(await p.locator('#directory-title').textContent(),/Global/);
  mode='unavailable';await p.evaluate(key=>localStorage.setItem(key,'fixture-token'),key);await p.reload();await p.getByRole('button',{name:'Retry',exact:true}).waitFor();assert.equal(await p.locator('.review-app').isVisible(),false);assert.equal(await p.evaluate(key=>localStorage.getItem(key),key),'fixture-token');mode='ok';await p.getByRole('button',{name:'Retry',exact:true}).click();await p.locator('.discussion-card').first().waitFor();
  const previous=calls.length;await p.waitForTimeout(250);assert.equal(calls.length,previous,'No login polling');assert.deepEqual(errors,[]);
  console.log(engine+': Employee-ID login/restore, true profile identity, logout retry, director RC exclusion and transient startup retry passed');
 }finally{await browser.close();}
}})().catch(e=>{console.error(e);process.exit(1)});

const installReviewAuth=require('./review-auth-fixture.cjs');
const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT),assert=require('node:assert/strict');
(async()=>{for(const engine of ['edge','webkit']){
 const browser=engine==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:process.env.AB_WEBKIT,headless:true});
 try{const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const auth=await installReviewAuth(p);await p.goto('http://localhost:4174/review/profile.html');await p.locator('#profile').waitFor();assert.equal(await p.locator('#profile-employee-id').textContent(),'100016');assert.equal(await p.locator('#profile-name').textContent(),'Anand');
  await p.locator('#profile-back').click();await p.locator('[data-discussion="blast"]').click();await p.locator('.message').first().waitFor();await p.locator('#message').fill('Retained profile-navigation draft');await p.locator('#profile-link').click();await p.locator('#profile').waitFor();await p.locator('#profile-back').click();await p.locator('.message').first().waitFor();assert.equal(await p.locator('#message').inputValue(),'Retained profile-navigation draft');
  auth.role='director';await p.reload();await p.locator('.message').first().waitFor();await p.locator('#profile-link').click();await p.locator('#profile').waitFor();assert.equal(await p.locator('#profile-employee-id').textContent(),'100017');assert.match(await p.locator('#profile-name').textContent(),/Review director/);
  for(const width of [320,390,1280]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await p.setViewportSize({width:390,height:844});await p.screenshot({path:`artifacts/review-profile-${engine}.png`});
  assert.deepEqual(errors,[]);console.log(engine+': profile name/employee ID, demo-account changes, draft-preserving return, authenticated identity and responsive bounds passed');
 }finally{await browser.close();}
}})().catch(e=>{console.error(e);process.exit(1)});

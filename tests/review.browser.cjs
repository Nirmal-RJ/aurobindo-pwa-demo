const installReviewAuth=require('./review-auth-fixture.cjs');
const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT);
const assert=require('node:assert/strict');
const url='http://localhost:4174/review/';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAO0lEQVR4nO3RQREAMAjEwKOKaqsqsF4J4cMvK+CYCXX7ZdNZXY8HBvwBMhEyETIRMhEyETIRMhEyUcgH0YkBWIKU6bYAAAAASUVORK5CYII=','base64');
(async()=>{for(const engine of ['edge','webkit']){
 const browser=engine==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:process.env.AB_WEBKIT,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  const auth=await installReviewAuth(page);await page.goto(url);await page.locator('[data-discussion="blast"]').click();await page.locator('.message').first().waitFor();await page.waitForTimeout(150);
  assert.equal(await page.locator('.message').count(),12);
  assert.equal(await page.locator('[data-room="rc"]').count(),1);
  assert((await page.locator('[data-room="rc"] .unread').textContent()).length>0);
  assert.equal(await page.locator('.date-separator').count()>0,true);
  // Older messages must retain the position of the previous first message.
  await page.locator('#messages').evaluate(e=>e.scrollTop=0);await page.waitForTimeout(50);
  const first=await page.locator('.message').first().getAttribute('id');
  const before=await page.locator('#'+first).evaluate(e=>e.getBoundingClientRect().top);
  await page.getByRole('button',{name:'Load older messages',exact:true}).click();
  await page.waitForTimeout(100);assert.equal(await page.locator('.message').count(),24);
  const after=await page.locator('#'+first).evaluate(e=>e.getBoundingClientRect().top);assert(Math.abs(after-before)<3,'Older pagination must preserve visible message position');
  // New arrivals do not steal scroll; indicator jumps to bottom.
  await page.locator('#dev-tools').evaluate(e=>e.open=true);
  const scroll=await page.locator('#messages').evaluate(e=>e.scrollTop);
  await page.getByRole('button',{name:'Simulate incoming message'}).click();await page.locator('#new-messages').waitFor();
  assert(Math.abs(await page.locator('#messages').evaluate(e=>e.scrollTop)-scroll)<3);
  await page.locator('#new-messages').click();await page.waitForTimeout(80);
  assert(await page.locator('#messages').evaluate(e=>e.scrollHeight-e.clientHeight-e.scrollTop<5));
  // Sending, screenshots, feedback, reply and reactions.
  await page.locator('#attachments').setInputFiles({name:'phone.png',mimeType:'image/png',buffer:png});
  await page.locator('.draft-file').waitFor();await page.locator('#message').fill('Please retest this screenshot on the current build.');
  await page.getByRole('button',{name:'Send',exact:true}).click();
  await page.getByText('Sending…',{exact:true}).waitFor();await page.waitForTimeout(800);
  const sentId=await page.locator('.message').filter({hasText:'Please retest this screenshot on the current build.'}).last().getAttribute('id');const sent=page.locator('#'+sentId);
  await sent.getByRole('button',{name:'Open screenshot phone.png',exact:true}).click();await page.locator('dialog[open] img').waitFor();
  await page.getByRole('button',{name:'Close screenshot'}).click();
  await sent.getByRole('button',{name:'Reply',exact:true}).click();await page.locator('#message').fill('Retest queued.');await page.getByRole('button',{name:'Send',exact:true}).click();await page.waitForTimeout(800);
  const reply=page.locator('.message').filter({hasText:'Retest queued.'}).last();assert.equal(await reply.locator('.reply-preview').count(),1);
  await reply.getByRole('button',{name:'React',exact:true}).click();await page.getByRole('button',{name:'👎',exact:true}).click();await page.waitForTimeout(100);assert.equal(await reply.locator('.reaction.active').count(),1);
  // Failed send and retry must keep the same message.
  await page.locator('#fail-send').check();await page.locator('#message').fill('Retry this demo send.');await page.getByRole('button',{name:'Send',exact:true}).click();
  await page.getByText('Not sent',{exact:true}).waitFor();const failed=page.locator('.message').filter({hasText:'Retry this demo send.'}).last(),failedId=await failed.getAttribute('id');
  await failed.getByRole('button',{name:'Retry',exact:true}).click();await page.waitForTimeout(800);assert.equal(await page.locator('#'+failedId+' .failed').count(),0);
  // Global -> RC snapshot + comment, no return post; view original.
  const globalCount=await page.locator('.message').count();
  await sent.getByRole('button',{name:'More message actions',exact:true}).click();await page.getByRole('button',{name:'Discuss in RC',exact:true}).click();await page.locator('#rc-comment').fill('Let’s reproduce this internally before replying.');
  await page.locator('#modal[open] .screenshot').click();await page.getByRole('button',{name:'Close screenshot',exact:true}).click();assert((await page.locator('#rc-comment').inputValue()).includes('internally before replying'));
  await page.getByRole('button',{name:'Post to RC',exact:true}).click();await page.waitForTimeout(850);
  assert.equal(await page.locator('#chat-room').textContent(),'RC');
  const ref=page.locator('.referenced').last();assert((await ref.locator('.reference-card').textContent()).includes('Please retest this screenshot'));
  assert.equal(await ref.locator('.reference-card .screenshot').count(),1);
  await ref.getByRole('button',{name:'Reply',exact:true}).click();await page.locator('#message').fill('Private RC reply.');await page.getByRole('button',{name:'Send',exact:true}).click();await page.waitForTimeout(800);
  await ref.getByRole('button',{name:'View original ↗',exact:true}).click();await page.waitForTimeout(120);
  assert.equal(await page.locator('#chat-room').textContent(),'Global');assert.equal(await page.getByText('Private RC reply.',{exact:true}).count(),0);
  assert.equal(await page.locator('.message').count(),12);assert(await sent.evaluate(e=>e.classList.contains('highlight')));
  // All account types, RC exclusion and build-isolated votes.
  auth.role='director';await page.reload();await page.locator('.message').first().waitFor();assert.equal(await page.locator('[data-room=rc]').count(),0);
  await page.locator('#review-toggle').click();await page.getByRole('button',{name:'✓ Approve',exact:true}).click();await page.waitForTimeout(80);assert.equal(await page.locator('.release-card,#permissions').count(),0);
  await page.locator('#review-close').click();await page.locator('#dev-tools').evaluate(e=>e.open=true);await page.getByRole('button',{name:'Add empty demo build'}).click();await page.locator('#build-version').fill('v31-demo');await page.getByRole('button',{name:'Create build',exact:true}).click();await page.getByText('Start the review',{exact:true}).waitFor();
  assert.equal(await page.locator('.vote-totals').textContent(),'0 approve0 request changes');
  // A long unbroken message should wrap, and demo state survives reload.
  const long='Long mobile feedback '.repeat(120)+'X'.repeat(500);await page.locator('#message').fill(long);await page.getByRole('button',{name:'Send',exact:true}).click();await page.waitForTimeout(800);
  await page.reload();await page.locator('.message').first().waitFor();await page.getByRole('button',{name:'Back to Global discussions',exact:true}).click();await page.locator('[data-discussion="blast"]').click();await page.waitForTimeout(100);assert((await page.locator('.message-text').last().textContent()).includes('X'.repeat(500)));
  await page.setViewportSize({width:320,height:568});await page.waitForTimeout(100);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No mobile horizontal overflow');
  await page.locator('#message').focus();await page.setViewportSize({width:320,height:360});await page.waitForTimeout(100);
  assert(await page.locator('#composer').evaluate(e=>{const r=e.getBoundingClientRect();return r.bottom<=innerHeight+1&&r.top>=0;}),'Composer must fit the shortened keyboard viewport');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);await page.screenshot({path:`artifacts/review-${engine}-mobile.png`});
  await page.getByRole('button',{name:'Review & votes',exact:true}).click();assert.equal(await page.locator('#review-panel').isVisible(),true);await page.getByRole('button',{name:'Close review'}).click();
  await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:`artifacts/review-${engine}-desktop.png`});
  assert.deepEqual(errors,[]);
  assert(!requests.some(u=>/^https?:/.test(u)&&!u.startsWith('http://localhost:4174/review/')&&!/\/review-api\/(?:me|login|logout)$/.test(u)&&!u.endsWith('/icon.svg')&&!/\/assets\/.*(?:page-1-bg|6-ferrari-white-front-view)\.webp$/.test(u)),'Review must not fetch external APIs, game assets or packages');
  console.log(engine+': roles, rooms, paging/scroll, unread, files, replies, references, votes, retry, persistence, empty build and mobile checks passed');
 }finally{await browser.close();}
}})().catch(e=>{console.error(e);process.exit(1)});

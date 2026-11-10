const installReviewAuth=require('./review-auth-fixture.cjs');
const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT),assert=require('node:assert/strict');
const origin='http://localhost:4174';
(async()=>{for(const engine of ['edge','webkit']){
 const browser=engine==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:process.env.AB_WEBKIT,headless:true});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const auth=await installReviewAuth(p);await p.goto(origin+'/review/');await p.getByRole('heading',{name:'Global discussions',exact:true}).waitFor();
  assert.equal(await p.locator('#build').count(),0,'Old game/build dropdown must be removed');
  assert.equal(await p.locator('.discussion-card').count(),6);
  assert.deepEqual(await p.locator('.discussion-card h3').allTextContents(),['General Discussion','Match It, Blast It','AB Express','Solvent Master',"Rocket'ier",'My Carz']);
  assert.equal(await p.locator('.conversation').isVisible(),false);
  assert.equal(await p.locator('.discussion-card img[loading="lazy"]').count(),5);
  assert.equal(await p.locator('[data-discussion="blast"] .discussion-unread').count(),1);
  await p.screenshot({path:`artifacts/review-directory-${engine}-desktop.png`});
  await p.locator('[data-discussion="blast"]').click();await p.locator('.message').first().waitFor();
  assert.equal(await p.locator('#room-title').textContent(),'Match It, Blast It');
  assert.equal(await p.locator('#chat-room').textContent(),'Global');
  await p.goBack();await p.getByRole('heading',{name:'Global discussions',exact:true}).waitFor();
  await p.goForward();await p.locator('.message').first().waitFor();
  await p.getByRole('button',{name:'Back to Global discussions',exact:true}).click();
  await p.locator('[data-room="rc"]').click();await p.getByRole('heading',{name:'RC discussions',exact:true}).waitFor();
  assert.equal(await p.locator('.discussion-card').count(),6);
  await p.locator('[data-discussion="general"]').click();await p.getByRole('heading',{name:'General Discussion',exact:true}).waitFor();
  assert.equal(await p.locator('#review-panel').isVisible(),false);assert.equal(await p.locator('.feedback-toggle').isVisible(),false);
  await p.locator('#message').fill('RC-only general discussion.');await p.getByRole('button',{name:'Send',exact:true}).click();await p.waitForTimeout(750);
  await p.locator('[data-room="global"]').click();await p.getByRole('heading',{name:'Global discussions',exact:true}).waitFor();
  await p.locator('[data-discussion="general"]').click();await p.getByText('Start the conversation',{exact:true}).waitFor();
  assert.equal(await p.getByText('RC-only general discussion.',{exact:true}).count(),0);
  await p.locator('#message').fill('Global general announcement.');await p.getByRole('button',{name:'Send',exact:true}).click();await p.waitForTimeout(750);
  await p.getByRole('button',{name:'More message actions',exact:true}).click();await p.getByRole('button',{name:'Discuss in RC',exact:true}).click();await p.locator('#rc-comment').fill('Discuss this announcement privately.');await p.getByRole('button',{name:'Post to RC',exact:true}).click();await p.waitForTimeout(750);
  assert.equal(await p.locator('#chat-room').textContent(),'RC');assert.equal(await p.locator('#room-title').textContent(),'General Discussion');
  assert.equal(await p.getByText('RC-only general discussion.',{exact:true}).count(),1);
  await p.getByRole('button',{name:'View original ↗',exact:true}).click();await p.locator('.message.highlight').waitFor();
  assert.equal(await p.locator('#chat-room').textContent(),'Global');
  await p.reload();await p.getByText('Global general announcement.',{exact:true}).waitFor();
  await p.getByRole('button',{name:'Back to Global discussions',exact:true}).click();
  for(const [width,height] of [[320,568],[390,844],[768,1024]]){
   await p.setViewportSize({width,height});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await p.locator('[data-discussion="general"]').scrollIntoViewIfNeeded();await p.waitForTimeout(80);
   assert(await p.locator('.discussion-card').evaluateAll(cards=>cards.every(c=>{const r=c.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1;})));
   await p.screenshot({path:`artifacts/review-directory-${engine}-${width}.png`});
  }
  auth.role='director';await p.reload();await p.getByRole('heading',{name:'Global discussions',exact:true}).waitFor();assert.equal(await p.locator('[data-room=rc]').count(),0);
  await p.goto(origin+'/review/index.html?room=rc');await p.getByRole('heading',{name:'Global discussions',exact:true}).waitFor();
  assert.deepEqual(errors,[]);console.log(engine+': directory cards, history/back, both rooms, separate General chats, RC reference/original, role restrictions and responsive bounds passed');
 }finally{await browser.close();}
}})().catch(e=>{console.error(e);process.exit(1)});

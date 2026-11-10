const installReviewAuth=require('./review-auth-fixture.cjs');
const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT),assert=require('node:assert/strict');
const url='http://localhost:4174/review/index.html#/global/game/blast';
const png='iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAO0lEQVR4nO3RQREAMAjEwKOKaqsqsF4J4cMvK+CYCXX7ZdNZXY8HBvwBMhEyETIRMhEyETIRMhEyUcgH0YkBWIKU6bYAAAAASUVORK5CYII=';
(async()=>{for(const engine of ['edge','webkit']){
 const browser=engine==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:process.env.AB_WEBKIT,headless:true});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));const auth=await installReviewAuth(p);await p.goto(url);await p.locator('.message').first().waitFor();
  assert(await p.getByRole('button',{name:'Send',exact:true}).isDisabled());
  await p.locator('#message').fill('Global unsent draft');await p.locator('[data-room="rc"]').click();await p.locator('[data-discussion="blast"]').click();assert.equal(await p.locator('#message').inputValue(),'');
  await p.locator('#message').fill('RC unsent draft');await p.locator('[data-room="global"]').click();await p.locator('[data-discussion="blast"]').click();assert.equal(await p.locator('#message').inputValue(),'Global unsent draft');
  auth.role='director';await p.reload();await p.locator('.message').first().waitFor();assert.equal(await p.locator('#message').inputValue(),'');
  auth.role='ghost';await p.reload();await p.locator('.message').first().waitFor();assert.equal(await p.locator('#message').inputValue(),'Global unsent draft');
  await p.waitForTimeout(250);await p.reload();await p.locator('.message').first().waitFor();assert.equal(await p.locator('#message').inputValue(),'Global unsent draft');
  await p.locator('#message').press('Shift+Enter');assert((await p.locator('#message').inputValue()).endsWith('\n'));await p.locator('#message').press('Control+Enter');await p.waitForTimeout(750);
  const sentId=await p.locator('.message').filter({hasText:'Global unsent draft'}).last().getAttribute('id'),sent=p.locator('#'+sentId);
  await p.locator('#messages').focus();await p.keyboard.press('ArrowUp');assert.equal(await p.evaluate(()=>document.activeElement.id),sentId);await p.keyboard.press('r');assert.equal(await p.locator('.draft-reply').count(),1);await p.locator('#message').fill('Keep this text');await p.keyboard.press('Escape');assert.equal(await p.locator('.draft-reply').count(),0);assert.equal(await p.locator('#message').inputValue(),'Keep this text');
  await sent.locator('.message-text').click({button:'right'});await p.getByRole('dialog',{name:'Message actions',exact:true}).waitFor();await p.keyboard.press('Escape');
  await sent.focus();await p.keyboard.press('e');await p.getByRole('dialog',{name:'React to message',exact:true}).waitFor();await p.getByRole('button',{name:'👍',exact:true}).click();await p.waitForTimeout(80);assert.equal(await sent.locator('.reaction.active').count(),1);
  await p.keyboard.press('Control+/');await p.getByRole('dialog',{name:'Keyboard & touch controls',exact:true}).waitFor();await p.keyboard.press('Escape');
  // Paste and drop are on-demand local attachments, not uploads.
  await p.locator('#message').evaluate((input,png)=>{const dt=new DataTransfer();dt.items.add(new File([Uint8Array.from(atob(png),c=>c.charCodeAt(0))],'pasted.png',{type:'image/png'}));input.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:dt}));},png);await p.locator('.draft-file').first().waitFor();
  await p.locator('.conversation').evaluate((target,png)=>{const dt=new DataTransfer();dt.items.add(new File([Uint8Array.from(atob(png),c=>c.charCodeAt(0))],'dropped.png',{type:'image/png'}));target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt}));},png);
  await p.waitForFunction(()=>document.querySelectorAll('.draft-file').length===2);await p.locator('#message').fill('Pasted and dropped screenshots');await p.getByRole('button',{name:'Send',exact:true}).click();await p.waitForTimeout(750);
  const photo=p.locator('.message').filter({hasText:'Pasted and dropped screenshots'}).last();await photo.getByRole('button',{name:'Open screenshot pasted.png',exact:true}).click();await p.waitForFunction(()=>document.querySelector('.image-canvas img')?.naturalWidth>0);
  const width=await p.locator('.image-canvas img').evaluate(e=>e.getBoundingClientRect().width);await p.getByRole('button',{name:'Zoom in',exact:true}).click();assert(await p.locator('.image-canvas img').evaluate(e=>e.getBoundingClientRect().width)>width);
  await p.getByRole('button',{name:'Fit',exact:true}).click();await p.getByRole('button',{name:'Next screenshot',exact:true}).click();await p.getByRole('dialog',{name:'Screenshot: dropped.png',exact:true}).waitFor();await p.keyboard.press('ArrowLeft');await p.getByRole('dialog',{name:'Screenshot: pasted.png',exact:true}).waitFor();await p.keyboard.press('Escape');
  await p.setViewportSize({width:390,height:844});await p.getByRole('button',{name:'Review & votes',exact:true}).click();await p.getByRole('dialog',{name:'Build review',exact:true}).waitFor();await p.keyboard.press('Tab');assert(await p.evaluate(()=>!!document.activeElement.closest('.review-sheet')));await p.keyboard.press('Escape');assert.equal(await p.locator('.review-sheet').isVisible(),false);
  // Synthetic pointer intent checks in both engines; hardware gestures still need device QA.
  await photo.scrollIntoViewIfNeeded();const body=photo.locator('.message-body');const box=await body.boundingBox(),x=Math.max(40,box.x+10),y=box.y+20;
  const pointer=(type,dx,dy)=>body.dispatchEvent(type,{pointerId:1,pointerType:'touch',isPrimary:true,clientX:x+dx,clientY:y+dy,bubbles:true});
  await pointer('pointerdown',0,0);await pointer('pointermove',84,3);await pointer('pointerup',84,3);assert.equal(await p.locator('.draft-reply').count(),1);await p.keyboard.press('Escape');
  await pointer('pointerdown',0,0);await pointer('pointermove',3,80);await pointer('pointerup',3,80);assert.equal(await p.locator('.draft-reply').count(),0);
  await pointer('pointerdown',0,0);await p.waitForTimeout(650);await p.getByRole('dialog',{name:'Message actions',exact:true}).waitFor();await pointer('pointercancel',0,0);await p.keyboard.press('Escape');
  await p.setViewportSize({width:320,height:360});await p.locator('#message').focus();assert(await p.locator('#composer').evaluate(e=>{const r=e.getBoundingClientRect();return r.bottom<=innerHeight+1&&r.top>=0;}));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);console.log(engine+': saved drafts, keyboard actions, paste/drop, gallery zoom/navigation, focus-trapped review and touch intent passed');
  const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await installReviewAuth(touch);await touch.goto(url);await touch.locator('.message').first().waitFor();await touch.locator('#message').fill('Mobile line');await touch.locator('#message').press('Enter');assert((await touch.locator('#message').inputValue()).endsWith('\n'));assert.equal(await touch.locator('.message').filter({hasText:'Mobile line'}).count(),0);await touch.getByRole('button',{name:'Send',exact:true}).click();await touch.waitForTimeout(750);assert.equal(await touch.locator('.message').filter({hasText:'Mobile line'}).count(),1);await touch.screenshot({path:`artifacts/review-controls-${engine}-mobile.png`});
  console.log(engine+': touch Return adds a line; explicit Send submits');
 }finally{await browser.close();}
}})().catch(e=>{console.error(e);process.exit(1)});

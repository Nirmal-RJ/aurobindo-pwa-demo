const installReviewAuth=require('./review-auth-fixture.cjs');
const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT),assert=require('node:assert/strict');
(async()=>{for(const engine of ['edge','webkit']){
 const browser=engine==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:process.env.AB_WEBKIT,headless:true});
 try{const p=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const auth=await installReviewAuth(p);
  await p.goto('http://localhost:4174/review/index.html#/global/game/blast');await p.locator('.message').first().waitFor();
  await p.locator('#message').fill('Swipe test');await p.locator('#send').click();const row=p.locator('.message').filter({hasText:'Swipe test'}).last();await p.waitForFunction(()=>[...document.querySelectorAll('.message')].some(e=>e.textContent.includes('Swipe test')&&e.dataset.delivery==='sent'));
  const point=await row.evaluate(e=>{const r=e.getBoundingClientRect();return {x:Math.min(r.right-8,innerWidth-32),y:r.top+12};});
  assert(await p.evaluate(({x,y})=>!!document.elementFromPoint(x,y)?.closest('.message')&&!document.elementFromPoint(x,y)?.closest('.message-text'),point));
  if(engine==='edge'){
   // Real Chromium touch input catches native horizontal pointer cancellation,
   // unlike dispatchEvent-only tests. Start in the row's blank space.
   const cdp=await p.context().newCDPSession(p);
   const starts=[point];for(const selector of ['.message-text','.message-meta','.avatar']){const r=await row.locator(selector).boundingBox();starts.push({x:r.x+8,y:r.y+8});}
   for(const start of starts){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
    for(const dx of [15,35,60,86])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+dx,y:start.y+2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await p.locator('.draft-reply').waitFor();await p.getByRole('button',{name:'Cancel reply',exact:true}).click();
   }
  }
  const swipe=async(target,moves,options={})=>{
   const r=await target.boundingBox(),x=Math.max(35,r.x+6),y=r.y+6,props={pointerId:7,pointerType:'touch',isPrimary:true,bubbles:true,cancelable:true};
   await target.dispatchEvent('pointerdown',{...props,clientX:x,clientY:y});
   for(const [dx,dy] of moves)await target.dispatchEvent('pointermove',{...props,clientX:x+dx,clientY:y+dy});
   await target.dispatchEvent(options.cancel?'pointercancel':'pointerup',{...props,clientX:x+moves.at(-1)[0],clientY:y+moves.at(-1)[1]});
  };
  for(const target of [row,row.locator('.message-body'),row.locator('.message-meta'),row.locator('.message-text'),row.locator('.avatar')]){
   await swipe(target,[[20,1],[85,2]]);await p.locator('.draft-reply').waitFor();await p.getByRole('button',{name:'Cancel reply',exact:true}).click();
  }
  // A child's lost capture during transfer must not cancel the active row swipe.
  const text=row.locator('.message-text'),r=await text.boundingBox(),props={pointerId:8,pointerType:'touch',isPrimary:true,bubbles:true,cancelable:true,clientX:r.x+8,clientY:r.y+8};
  await text.dispatchEvent('pointerdown',props);await text.dispatchEvent('pointermove',{...props,clientX:props.clientX+25});await text.dispatchEvent('lostpointercapture',props);await row.dispatchEvent('pointermove',{...props,clientX:props.clientX+86});await row.dispatchEvent('pointerup',{...props,clientX:props.clientX+86});await p.locator('.draft-reply').waitFor();await p.getByRole('button',{name:'Cancel reply',exact:true}).click();
  await swipe(row,[[2,20],[3,90]]);assert.equal(await p.locator('.draft-reply').count(),0,'Vertical scroll does not reply');
  await swipe(row,[[80,1],[20,1]]);assert.equal(await p.locator('.draft-reply').count(),0,'Retracted swipe does not reply');
  await swipe(row,[[85,1]],{cancel:true});assert.equal(await p.locator('.draft-reply').count(),0,'Cancelled swipe does not reply');
  await row.getByRole('button',{name:'Reply',exact:true}).click();await p.locator('.draft-reply').waitFor();await p.getByRole('button',{name:'Cancel reply',exact:true}).click();
  // Screenshot taps stay functional; horizontal swipes can also start on them.
  const image=p.locator('.message .screenshot').first();await image.scrollIntoViewIfNeeded();await swipe(image,[[20,0],[85,1]]);await p.locator('.draft-reply').waitFor();assert.equal(await p.locator('.image-inspector').count(),0);await p.getByRole('button',{name:'Cancel reply',exact:true}).click();
  await image.click();await p.locator('.image-inspector').waitFor();await p.getByRole('button',{name:'Close screenshot',exact:true}).click();
  assert.deepEqual(errors,[]);console.log(engine+': row/padding/meta/text/avatar/image swipes, retract/cancel/scroll and normal taps passed'+(engine==='edge'?' (includes native touch input)':''));
 }finally{await browser.close();}
}})().catch(e=>{console.error(e);process.exit(1)});

const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=process.env.AB_WEBKIT?await webkit.launch({headless:true,executablePath:process.env.AB_WEBKIT}):await chromium.launch({channel:'msedge',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('ab-express-progress-v1',JSON.stringify({demoComplete:true})));
 await page.goto(process.env.AB_URL||'http://localhost:4174/assets/ab-express-scripts/ab-express.html');
 const click=name=>page.getByRole('button',{name,exact:true}).click();
 await click('Next');await click('Practice Mode');await click('Start Practising');
 await page.locator('.step').first().waitFor();
 if(await page.locator('.step').first().getAttribute('data-id')==='1'){await page.locator('.step').first().focus();await page.keyboard.press('ArrowDown');}
 fs.mkdirSync('artifacts/ab-express-impact',{recursive:true});
 await page.screenshot({path:'artifacts/ab-express-impact/arrange-padding.png'});
 await click('Start the Train');
 await page.locator('.impact-canvas').waitFor();
 fs.mkdirSync('artifacts/ab-express-impact',{recursive:true});
 const prefix=process.env.AB_WEBKIT?'webkit':'edge';
 await page.screenshot({path:`artifacts/ab-express-impact/${prefix}-impact.png`});
 await page.waitForTimeout(450);await page.screenshot({path:`artifacts/ab-express-impact/${prefix}-sparks.png`});
 assert.equal(await page.getByRole('button',{name:'Next',exact:true}).count(),0);
 await page.waitForTimeout(650);await page.screenshot({path:`artifacts/ab-express-impact/${prefix}-smoke.png`});
 await page.locator('.feedback-panel').waitFor();assert.equal(await page.locator('.impact-canvas').count(),0);
 assert.equal(await page.getByRole('button',{name:'Next',exact:true}).count(),0);
 await click('Next');
 assert.equal(await page.locator('.compare-cell').count(),16);
 for(const [width,height] of [[320,568],[390,844],[430,932],[768,1024]]){
 await page.setViewportSize({width,height});await page.waitForTimeout(150);
 const info=await page.locator('.comparison').evaluate(e=>({scroll:e.scrollHeight>e.clientHeight,font:parseFloat(getComputedStyle(e.querySelector('.compare-cell')).fontSize),clipped:[...e.querySelectorAll('.compare-cell>span')].some(t=>t.scrollWidth>t.clientWidth+1)}));
 assert(!info.clipped);
 const overflow=await page.locator('.compare-cell>span').evaluateAll(es=>es.some(e=>e.scrollHeight>e.clientHeight+1));assert(!overflow,'Comparison text must fit the supplied panels');
 const labelOverflow=await page.locator('.compare-cell>span').first().evaluate(e=>{const original=e.textContent;const bad=ABConfig.steps.filter(label=>{e.textContent=label;window.dispatchEvent(new Event('resize'));return e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1});e.textContent=original;return bad});assert.deepEqual(labelOverflow,[],'Every full client instruction must fit');
 await page.locator('.comparison').evaluate(e=>e.scrollTop=0);
 await page.screenshot({path:`artifacts/ab-express-impact/${prefix}-comparison-${width}.png`});
 await page.locator('.comparison').evaluate(e=>e.scrollTop=e.scrollHeight);
 await page.screenshot({path:`artifacts/ab-express-impact/${prefix}-comparison-bottom-${width}.png`});
 }
 assert.deepEqual(errors,[]);console.log(prefix+': crash phases, delayed continuation and artwork comparison passed at four sizes, with reduced motion enabled.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

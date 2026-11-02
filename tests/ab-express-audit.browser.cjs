const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT || 'playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const out='artifacts/ab-express-audit';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=process.env.AB_WEBKIT?await webkit.launch({headless:true,executablePath:process.env.AB_WEBKIT}):await chromium.launch({headless:true,channel:'msedge'});
 const engine=process.env.AB_WEBKIT?'webkit':'edge',report={engine,errors:[],screens:[]};
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>report.errors.push(e.message));
  const click=name=>page.getByRole('button',{name,exact:true}).click();
  async function audit(name){
   await page.locator('#screen').waitFor({state:'visible'});await page.locator('#outgoing').waitFor({state:'detached'});
   for(const [width,height] of [[320,568],[360,640],[390,844],[430,932],[768,1024],[1024,768],[1440,900]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(80);
    const result=await page.evaluate(()=>{
     const root=document.querySelector('#screen'),game=document.querySelector('#game').getBoundingClientRect(),scale=game.width/360;
     const controls=[...root.querySelectorAll('button')].filter(e=>getComputedStyle(e).visibility!=='hidden').map(e=>{const r=e.getBoundingClientRect();return{name:e.getAttribute('aria-label')||e.textContent,x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};});
     const text=[...root.querySelectorAll('.step span,.compare-cell span')].map(e=>{const r=e.getBoundingClientRect(),parent=e.parentElement.getBoundingClientRect();return{text:e.textContent,height:r.height/scale,width:r.width/scale,font:parseFloat(getComputedStyle(e).fontSize),overflow:e.scrollWidth>e.clientWidth+1,outside:r.left<parent.left||r.right>parent.right+1||r.top<parent.top||r.bottom>parent.bottom+1};});
     const overlaps=[];for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++){const a=controls[i],b=controls[j];if(Math.min(a.right,b.right)>Math.max(a.x,b.x)+1&&Math.min(a.bottom,b.bottom)>Math.max(a.y,b.y)+1)overlaps.push([a.name,b.name]);}
     const scene=root.getBoundingClientRect();
     return{width:innerWidth,height:innerHeight,scene:{x:scene.x,y:scene.y,width:scene.width,height:scene.height},game:{x:game.x,y:game.y,right:game.right,bottom:game.bottom},controls,text,overlaps,content:root.innerText};
    });
    report.screens.push({name,...result});
    const home=result.controls.find(button=>button.name==='Home');
    if(home)assert(home.w >= (result.game.right-result.game.x)*.25,`${name}: Home must remain a readable full-size control`);
    if(name==='practice'){
     const start=result.controls.find(button=>button.name==='Start Practising');
     assert(home.y>=start.bottom-1,'Practice Home belongs below Start Practising');
    }
    if(width<=430)assert(Math.abs(result.scene.x)<1&&Math.abs(result.scene.y)<1&&Math.abs(result.scene.width-width)<1&&Math.abs(result.scene.height-height)<1,`${name} must fill the ${width}x${height} portrait viewport`);
    if(width===320||width===390)await page.screenshot({path:`${out}/${engine}-${name}-${width}.png`});
   }
   await page.setViewportSize({width:390,height:844});
  }
  await page.goto(process.env.AB_URL||'http://localhost:4173/assets/ab-express-scripts/ab-express.html');await page.getByRole('button',{name:'Next',exact:true}).waitFor();await audit('landing');await click('Next');
  for(let n=1;n<=5;n++){await audit(`demo-${n}`);await click('Next');}
  await audit('home');await click('Learn the Sequence');for(let n=1;n<=3;n++){await audit(`learn-${n}`);if(n<3)await click('Next');}await click('Home');
  for(let bucket=1;bucket<=5;bucket++){
   await click('Practice Mode');if(bucket===1)await audit('practice');await click('Start Practising');await require('./ab-express-practice-helper.cjs')(page,bucket);await audit(`arrange-${bucket}`);
   await page.evaluate(()=>{ABConfig.timing.intro=1;ABConfig.timing.compartment=1;ABConfig.timing.feedback=1;});
   // Arrangement starts shuffled and guaranteed not fully correct.
   await click('Start the Train');await page.getByRole('button',{name:'Next',exact:true}).waitFor();
   if(bucket===1)await audit('wrong');await click('Next');await audit(`compare-${bucket}`);await click('Home');
  }
  await click('Challenge Mode');await audit('challenge');
  fs.writeFileSync(`${out}/${engine}-report.json`,JSON.stringify(report,null,2));
  const faults=report.screens.flatMap(s=>[...s.overlaps.map(pair=>({screen:s.name,width:s.width,overlap:pair})),...s.text.filter(t=>t.outside||t.overflow).map(t=>({screen:s.name,width:s.width,text:t.text}))]);
  assert.deepEqual(report.errors,[]);assert.deepEqual(faults,[]);console.log(JSON.stringify({engine,screens:report.screens.length,faults},null,2));
 }finally{fs.writeFileSync(`${out}/${engine}-report.json`,JSON.stringify(report,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

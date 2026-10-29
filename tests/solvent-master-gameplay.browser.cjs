const {chromium}=require(process.env.SOLVENT_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.SOLVENT_URL||'http://localhost:4173/assets/solvent-master-game-scripts/solvent-master.html';
const out='artifacts/solvent-master-gameplay';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});const report={errors:[],httpErrors:[],checks:[]};
 try{
  const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.httpErrors.push(`${r.status()} ${r.url()}`);});
  await page.addInitScript(()=>localStorage.setItem('solvent-master-demo-complete-v1','true'));
  const ready=()=>page.waitForFunction(()=>SolventMaster.ready&&!SolventMaster.busy);
  const settle=()=>page.waitForFunction(()=>!SolventMaster.busy);
  const click=async id=>{await settle();await page.locator('#'+id).click();await settle();};
  const view=async expected=>assert.equal(await page.evaluate(()=>SolventMaster.view),expected);
  const shot=async name=>page.screenshot({path:`${out}/${name}.png`});
  await page.goto(url);await ready();await click('next');await view('mixing');await click('mixing-play');await view('lesson');
  await page.waitForFunction(()=>document.querySelector('#lesson-video').readyState>=1);
  assert.match(await page.locator('#lesson-video').getAttribute('src'),/solvent-master-game-assets\/lesson-videos/);
  await shot('lesson');await click('lesson-next');await view('round');await shot('practice');
  // Wrong practice answer returns to same lesson and clears mixture.
  await click('mix-submit');await shot('wrong-practice');await click('feedback-next');await view('lesson');
  assert.equal(await page.evaluate(()=>SolventMaster.game.index),0);await click('lesson-next');
  async function solveQuestion(capture=false){
    const choices=await page.evaluate(()=>{const g=SolventMaster.game;return SolventCore.chemicals.filter(c=>g.recipe.mix[c]).map(c=>({c,i:g.shelves[c].indexOf(g.recipe.mix[c])}));});
    for(let n=0;n<choices.length;n++){
      const {c,i}=choices[n];await settle();const selector=`.shelf-beaker[data-chemical="${c}"][data-index="${i}"]`;
      await page.locator(selector).click();
      if(capture&&n===0){await page.waitForTimeout(800);await shot('pour-in-flight');}
      await settle();
    }
    assert.equal(await page.evaluate(()=>SolventMaster.game.total),100);
    if(capture){await shot('filled');await click('pour-undo');assert.ok(await page.evaluate(()=>SolventMaster.game.total<100));const {c,i}=choices.at(-1);await page.locator(`.shelf-beaker[data-chemical="${c}"][data-index="${i}"]`).click();await settle();}
    await click('mix-submit');assert.equal(await page.evaluate(()=>SolventMaster.game.lastCorrect),true);await click('feedback-next');
  }
  for(let i=0;i<5;i++){if(i)await click('lesson-next');await solveQuestion(i===0);if(i<4){await view('lesson'); // Correct practice Next opens the next lesson.
      // The lesson is required for every new practice recipe.
    }}
  await view('mastered');await shot('practice-mastered');assert.equal(await page.evaluate(()=>SolventMaster.game.profile.practiceComplete),true);
  await click('mastered-next');await view('challenge');await shot('challenge');await click('challenge-play');await view('round');
  const initial=await page.evaluate(()=>SolventMaster.game.remaining);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForTimeout(600);assert.ok(Math.abs(await page.evaluate(()=>SolventMaster.game.remaining)-initial)<.15);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await click('mix-submit');assert.equal(await page.evaluate(()=>SolventMaster.game.lastCorrect),false);
  const paused=await page.evaluate(()=>SolventMaster.game.remaining);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>SolventMaster.game.remaining),paused);
  await click('feedback-next');assert.equal(await page.evaluate(()=>SolventMaster.game.index),1);
  await page.evaluate(()=>SolventMaster.game.remaining=.05);await page.waitForFunction(()=>SolventMaster.view==='results'&&!SolventMaster.busy);
  assert.equal(await page.locator('.result-row').count(),5);assert.equal(await page.evaluate(()=>SolventMaster.game.results.filter(r=>r.timeout).length),4);
  await shot('timeout-results');await click('result-video-0');await view('lesson');await click('lesson-back');await view('results');await click('results-next');await shot('streak-lost');
  for(let round=1;round<=3;round++){
    await click('outcome-next');for(let i=0;i<5;i++)await solveQuestion();await view('results');
    assert.equal(await page.evaluate(()=>SolventMaster.game.profile.streak),round);
    await click('results-next');await shot(`streak-${round}`);
  }
  assert.equal(await page.evaluate(()=>SolventMaster.game.profile.stars),1);
  await click('outcome-next');assert.equal(await page.evaluate(()=>SolventMaster.game.profile.streak),0);assert.equal(await page.evaluate(()=>SolventMaster.game.profile.practiceComplete),true);
  await page.reload();await ready();await click('next');await view('challenge');report.checks.push('completed practice skips on reopening','wrong practice retry','one-step undo','wrong challenge continuation','feedback/background timer pause','timeout unanswered','results lesson return','three consecutive rounds','play again preserves practice');
  await context.setOffline(true);await click('challenge-play');await solveQuestion();
  await page.evaluate(async()=>{const entry=SOLVENT_MASTER_ASSETS.find(e=>e.url.endsWith('c-column-wash.webm'));const u=new URL(entry.url,location.href);u.searchParams.set('rev',entry.revision);const r=await fetch(u,{headers:{Range:'bytes=0-99'}});if(r.status!==206||(await r.arrayBuffer()).byteLength!==100)throw Error('Cached video range failed');});
  report.checks.push('offline game and video ranges');
  for(const [width,height]of [[1920,1080],[844,390],[667,375]]){await page.setViewportSize({width,height});await shot(`round-${width}x${height}`);}
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.httpErrors,[]);fs.writeFileSync(`${out}/verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

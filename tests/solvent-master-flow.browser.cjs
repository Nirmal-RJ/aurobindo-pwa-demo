const { chromium } = require(process.env.SOLVENT_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const url = process.env.SOLVENT_URL || 'http://localhost:4173/assets/solvent-master-game-scripts/solvent-master.html';
const output = 'artifacts/solvent-master-flow';
(async () => {
  fs.mkdirSync(output,{recursive:true});
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const report={errors:[],viewports:[]};
  try {
    const context=await browser.newContext({viewport:{width:960,height:540}});
    const page=await context.newPage(); page.on('pageerror',e=>report.errors.push(e.message));
    const open=async()=>{await page.goto(url);await page.waitForFunction(()=>SolventMaster.ready);};
    const settled=async view=>page.waitForFunction(view=>SolventMaster.view===view&&!SolventMaster.busy,view);
    const click=async id=>{await page.waitForFunction(()=>!SolventMaster.busy);await page.locator('#'+id).click();};
    await open();await click('next');await settled('demo');
    assert.equal(await page.locator('#demo-previous').isDisabled(),true);
    await click('demo-next');await settled('demo');
    assert.equal(await page.locator('#demo-counter').textContent(),'2 / 4');
    await click('demo-previous');await settled('demo');
    assert.equal(await page.locator('#demo-counter').textContent(),'1 / 4');
    // Interrupt before Finish: reopening must replay from slide one.
    await open();await click('next');await settled('demo');
    assert.equal(await page.locator('#demo-counter').textContent(),'1 / 4');
    assert.equal(await page.evaluate(()=>localStorage.getItem(SolventMasterConfig.flow.demoStorageKey)),null);
    for(let i=0;i<3;i++){await click('demo-next');await settled('demo');}
    assert.equal(await page.locator('#demo-next').textContent(),'Finish');
    await page.screenshot({path:`${output}/demo-final.png`});
    await click('demo-next');await settled('mixing');
    assert.equal(await page.evaluate(()=>localStorage.getItem(SolventMasterConfig.flow.demoStorageKey)),'true');
    await open();await click('next');await settled('mixing');report.returningSkip=true;
    for(const [width,height] of [[1920,1080],[1024,768],[844,390],[667,375]]){
      await page.setViewportSize({width,height});
      const bounds=await page.evaluate(()=>{
        const stage=document.querySelector('#game').getBoundingClientRect();
        return ['mixing-demo','mixing-play'].map(id=>{
          const r=document.getElementById(id).getBoundingClientRect();
          return {id,inside:r.left>=stage.left&&r.top>=stage.top&&r.right<=stage.right+1&&r.bottom<=stage.bottom+1};
        });
      });
      assert.ok(bounds.every(b=>b.inside));report.viewports.push({width,height,bounds});
      await page.screenshot({path:`${output}/mixing-${width}x${height}.png`});
    }
    await click('mixing-demo');await settled('demo');
    assert.equal(await page.locator('#demo-counter').textContent(),'1 / 4');
    await page.screenshot({path:`${output}/demo-first.png`});
    for(let i=0;i<4;i++){await click('demo-next');await settled(i===3?'mixing':'demo');}
    report.replay=true;
    await context.setOffline(true);await open();await click('next');await settled('mixing');
    await click('mixing-demo');await settled('demo');await click('demo-next');await settled('demo');
    report.offline=true;
    assert.deepEqual(report.errors,[]);
    fs.writeFileSync(`${output}/verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

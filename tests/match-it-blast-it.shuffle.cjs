const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT);
const assert=require('node:assert/strict');
(async()=>{for(const engine of ['edge','webkit']){
 const browser=engine==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:process.env.AB_WEBKIT,headless:true});
 try{
  const p=await browser.newPage({viewport:{width:390,height:844}});
  await p.addInitScript(()=>{sessionStorage.setItem('rc-games-unlocked','1');localStorage.setItem('match-it-blast-it-progress-v1',JSON.stringify({demoComplete:true,streak:[]}));Element.prototype.requestFullscreen=()=>Promise.resolve();});
  await p.goto('http://localhost:4174/#/rc-games');
  await p.locator('.poster-match-blast').click();
  await p.waitForURL('**/match-it-blast-it.html?v=30&from=rc-games');
  await p.getByRole('button',{name:'Next',exact:true}).click();
  await p.clock.install();await p.clock.runFor(800);
  await p.getByRole('button',{name:'Start Challenge',exact:true}).click();await p.clock.runFor(1400);
  const order=()=>p.locator('#scene .pair-row').evaluateAll(rows=>rows.map(r=>Number(r.dataset.pair)));
  const first=await order();assert.deepEqual([...first].sort(),[0,1,2,3,4]);
  const terms=['% RSD','Resolution','Tailing Factor','Plate Count','Retention Time'],names=['Precision','Peak Separation','Peak Symmetry','Column Efficiency','Peak Identification'];
  for(let i=0;i<5;i++){await p.getByRole('button',{name:names[i],exact:true}).click();await p.getByRole('button',{name:`Place selected meaning beside ${terms[i]}`,exact:true}).click();}
  await p.getByRole('button',{name:'Light',exact:true}).click();await p.clock.runFor(9000);
  await p.getByAltText('Correct!',{exact:true}).waitFor();
  await p.getByRole('button',{name:'Next',exact:true}).click();await p.clock.runFor(3500);
  await p.getByRole('button',{name:'Play Again',exact:true}).click();await p.clock.runFor(1400);
  const second=await order();assert.deepEqual([...second].sort(),[0,1,2,3,4]);assert.notDeepEqual(second,first);
  console.log(engine+': RC banner opens game; shuffled correct matches accepted; replay changes cracker order');
 }finally{await browser.close();}
}})().catch(e=>{console.error(e);process.exit(1);});

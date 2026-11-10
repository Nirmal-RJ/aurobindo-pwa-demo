const {chromium,webkit}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{for(const name of ['edge','webkit']){const browser=name==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/webkit-2359/Playwright.exe',headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.addInitScript(()=>{
  const Base=window.AudioContext||window.webkitAudioContext;
  window.audioProbe={supported:!!Base,decoded:0,errors:[],sources:[],gains:[],tones:[]};
  if(!Base)return;
  window.AudioContext=function(...args){
   let context;try{context=new Base(...args);}catch(e){audioProbe.errors.push('context: '+e.name+': '+e.message);throw e;}audioProbe.context=context;
   const decode=context.decodeAudioData.bind(context),source=context.createBufferSource.bind(context),gain=context.createGain.bind(context);
   context.decodeAudioData=async data=>{try{const buffer=await decode(data);audioProbe.decoded++;return buffer;}catch(e){audioProbe.errors.push(e.name+': '+e.message);throw e;}};
   context.createBufferSource=()=>{const node=source();audioProbe.sources.push(node);return node;};
   context.createGain=()=>{const node=gain();audioProbe.gains.push(node);return node;};
   const oscillator=context.createOscillator.bind(context);context.createOscillator=()=>{const node=oscillator();audioProbe.tones.push(node);return node;};
   return context;
  };
  localStorage.setItem('qc-wave-rider-v1',JSON.stringify({day:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),demo:true}));
 });
 await page.goto('http://localhost:4174/assets/wave-rider-scripts/wave-rider.html');
 if(!await page.evaluate(()=>audioProbe.supported)){console.log('SKIP '+name+': this Windows WebKit runtime exposes no AudioContext; physical Safari verification required');continue;}
 await page.locator('[data-action=next]').click();
 try{await page.waitForFunction(()=>audioProbe.decoded===6&&audioProbe.context.state==='running',{},{timeout:10000});}catch(e){console.log(name,await page.evaluate(()=>({decoded:audioProbe.decoded,state:audioProbe.context?.state,errors:audioProbe.errors})));throw e;}
 await page.waitForTimeout(1200);
 assert.equal(await page.evaluate(()=>audioProbe.sources.filter(n=>n.loop).length),2);
 for(const cue of ['correct','wrong','crash']){const before=await page.evaluate(()=>audioProbe.sources.length);await page.evaluate(c=>WaveAudio.cue(c),cue);assert.equal(await page.evaluate(()=>audioProbe.sources.length),before+1);}
 await page.evaluate(()=>{WaveAudio.accent('penalty');WaveAudio.accent('celebrate');WaveAudio.accent('flag-land');});
 assert.equal(await page.evaluate(()=>audioProbe.tones.length),10);
 await page.locator('[data-action=start]').click();
 await page.waitForTimeout(1300);
 const gains=await page.evaluate(()=>audioProbe.gains.slice(0,2).map(n=>n.gain.value).sort());
 assert(gains[0]<.001&&Math.abs(gains[1]-.28)<.01,JSON.stringify(gains));
 await page.evaluate(()=>{WaveAudio.scene('home');WaveAudio.scene('play');WaveAudio.scene('home');});
 await page.waitForTimeout(1300);
 assert.equal(await page.evaluate(()=>audioProbe.sources.filter(n=>n.loop).length),2);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(()=>audioProbe.context.state==='suspended');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(()=>audioProbe.context.state==='running');
 console.log('PASS '+name+': six MP3s decoded, gesture unlock, effects, crossfade and rapid reversal without duplicated music loops');
 }finally{await browser.close();}}})().catch(e=>{console.error(e);process.exitCode=1});

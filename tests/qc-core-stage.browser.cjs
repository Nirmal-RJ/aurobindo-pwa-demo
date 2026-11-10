const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.AB_PLAYWRIGHT);
const root=path.resolve(__dirname,'../dist/qc-core'),artifacts=path.resolve(__dirname,'../artifacts/qc-core-stage');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.gif':'image/gif','.webmanifest':'application/manifest+json','.webm':'video/webm','.mp4':'video/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.aac':'audio/aac','.ttf':'font/ttf','.otf':'font/otf'};
(async()=>{
 const server=http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost');
  if(/^\/review-api(?:\/|$)/.test(url.pathname)){res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'private, no-store'}).end(JSON.stringify({message:'Review backend is not deployed. Local staging preview only.'}));return;}
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(path.relative(root,file).startsWith('..')){res.writeHead(403).end();return;}
  if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');const body=await fs.readFile(file),headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'};
  if(req.headers.range){const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);assert(match);const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),body.length-1):body.length-1;res.writeHead(206,{...headers,'Accept-Ranges':'bytes','Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${body.length}`}).end(body.subarray(start,end+1));return;}
  res.writeHead(200,headers).end(body);
 }catch{res.writeHead(404).end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;await fs.mkdir(artifacts,{recursive:true});
 try{
  const range=await fetch(base+'/assets/match-it-blast-it-assets/videos/1-rsd.webm',{headers:{Range:'bytes=0-31'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,32);
  for(const engine of ['edge','webkit']){
   const browser=engine==='edge'?await chromium.launch({channel:'msedge',headless:true}):await webkit.launch({executablePath:process.env.AB_WEBKIT,headless:true});
   try{
    const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),errors=[],missing=[];
    page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.url().startsWith(base)&&response.status()===404)missing.push(new URL(response.url()).pathname);});
    // Test the staged app without contacting iframe/video/analytics providers.
    await context.route('**/*',route=>route.request().url().startsWith(base)||/^(?:data:|blob:)/.test(route.request().url())?route.continue():route.abort());
    for(const [width,height]of [[390,844],[1440,900]]){
     await page.setViewportSize({width,height});await page.goto(base+'/index.html');await page.locator('a[data-activity=games]').waitFor();
     await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('a[data-activity=games]')).opacity)>.99);
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Staged homepage overflow');
     await page.screenshot({path:path.join(artifacts,`${engine}-home-${width}.png`)});
     await page.goto(base+'/index.html#/games');await page.locator('a.poster-match-blast:visible').waitFor();
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Staged Games page overflow');
    }
    for(const entry of ['assets/my-carz-game-scripts/my-carz.html','assets/rocket-game-scripts/rocket-game.html','assets/solvent-master-game-scripts/solvent-master.html','assets/ab-express-scripts/ab-express.html','assets/match-it-blast-it-scripts/match-it-blast-it.html']){
     // Isolate each game's audio context. Destroying a WebKit document during
     // pending media work can report "Context is stopped" from the old page.
     const gamePage=await context.newPage(),gameErrors=[];let closing=false;
     gamePage.on('pageerror',error=>{if(!closing)gameErrors.push(error.message);});
     gamePage.on('response',response=>{if(!closing&&response.url().startsWith(base)&&response.status()===404)missing.push(new URL(response.url()).pathname);});
     try{
      const response=await gamePage.goto(base+'/'+entry);assert.equal(response.status(),200);await gamePage.waitForTimeout(1200);
      assert((await gamePage.title()).trim(),'Game entry has a title');assert.deepEqual(gameErrors,[],'Game entry runtime error: '+entry);
     }finally{closing=true;await gamePage.close();}
    }
    await page.goto(base+'/review/login.html');await page.locator('#employee-id:enabled').waitFor();assert.equal(await page.locator('input').count(),1);assert.match(await page.locator('#login-error').textContent(),/not deployed/);
    await page.goto(base+'/review/');await page.getByRole('button',{name:'Retry',exact:true}).waitFor();assert.equal(await page.locator('.review-app').isVisible(),false,'Staging cannot fake backend login');
    assert.deepEqual(errors,[],'Staged browser runtime errors');assert.deepEqual([...new Set(missing)],[],'Missing staged browser resources');await context.close();
    console.log('PASS '+engine+': staged homepage/Games at 390/1440, five game entries, media range, single-field login and explicit unavailable-backend state; no runtime errors or local 404s.');
   }finally{await browser.close();}
  }
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});

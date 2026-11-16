import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDisconnectedServer} from '../src/disconnected.mjs';
import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {once} from 'node:events';
import {freePort} from '../scripts/with-test-postgres.mjs';
test('disconnected service never authenticates, sets cookies or revokes sessions',async()=>{
 const server=createDisconnectedServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const [path,method]of [['me','GET'],['login','POST'],['logout','POST']]){
   const response=await fetch(base+'/review-api/'+path,{method,headers:{Authorization:'Bearer synthetic'},...(method==='POST'?{body:'{}'}:{})});
   assert.equal(response.status,503);assert.equal(response.headers.get('set-cookie'),null);assert.equal(response.headers.get('cache-control'),'private, no-store');
   const data=await response.json();assert(!data.account&&!data.recoveryToken);assert.match(data.message,/awaiting approval/);
  }
  const health=await fetch(base+'/review-api/health');assert.deepEqual(await health.json(),{alive:true,loginReady:false,databaseConnected:false});
  assert.equal((await fetch(base+'/review-api/messages')).status,404);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
test('actual production entry starts with no database and rejects supplied credentials in setup mode',async()=>{
 const port=await freePort(),env={...process.env,NODE_ENV:'production',REVIEW_LOGIN_ENABLED:'false',PORT:String(port)};
 delete env.REVIEW_DATABASE_URL;delete env.REVIEW_MIGRATION_DATABASE_URL;
 const child=spawn(process.execPath,['src/main.mjs'],{cwd:new URL('../',import.meta.url),env,windowsHide:true,stdio:['ignore','pipe','pipe']});
 child.stdout.resume();child.stderr.resume();
 try{
  let ready=false;for(let i=0;i<100;i++){
   assert.equal(child.exitCode,null,'Disconnected entry should stay alive');
   try{const response=await fetch(`http://127.0.0.1:${port}/review-api/health`,{signal:AbortSignal.timeout(300)});assert.equal((await response.json()).databaseConnected,false);ready=true;break;}catch{}
   await new Promise(resolve=>setTimeout(resolve,50));
  }
  assert(ready);assert.equal((await fetch(`http://127.0.0.1:${port}/review-api/me`)).status,503);
 }finally{if(child.exitCode===null){const ended=once(child,'exit');child.kill();await ended;}}
 await assert.rejects(promisify(execFile)(process.execPath,['src/main.mjs'],{cwd:new URL('../',import.meta.url),env:{...env,REVIEW_DATABASE_URL:'must-not-be-used'},windowsHide:true,timeout:5000}),error=>error.stderr.includes('SQL configuration is obsolete'));
});




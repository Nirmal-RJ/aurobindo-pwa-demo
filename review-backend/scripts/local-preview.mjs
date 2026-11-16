// Manual review of the finished UI with real login and synthetic local SQL data.
import pg from 'pg';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {ReviewStore} from '../src/store.mjs';
import {createReviewServer} from '../src/server.mjs';
import {createFrontendServer} from '../../server.mjs';
import {withTestPostgres,freePort} from './with-test-postgres.mjs';
const stopped=new Promise(resolve=>{process.once('SIGINT',resolve);process.once('SIGTERM',resolve);});
const listen=(server,port)=>new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
const close=async server=>{if(server?.listening){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}};
await withTestPostgres(async connectionString=>{
 const pool=new pg.Pool({connectionString,max:2});let frontend,backend;
 try{
  await pool.query(await readFile(new URL('../src/schema.sql',import.meta.url),'utf8'));
  for(const [id,name]of [['100021','Local RC member'],['100024','Local director']]){
   await pool.query("INSERT INTO review_auth.accounts(id,employee_id,name,role,status) VALUES($1,$2,$3,$4,'allowed')",[randomUUID(),id,name,id==='100024'?'director':'ghost']);
  }
  await pool.query(await readFile(new URL('../src/schema.sql',import.meta.url),'utf8'));
  const port=Number(process.env.REVIEW_PREVIEW_PORT||4175),apiPort=await freePort(),origin='http://127.0.0.1:'+port;
  backend=createReviewServer({store:new ReviewStore(pool),origin,secure:false,webRoot:null});await listen(backend,apiPort);
  frontend=createFrontendServer({reviewApiTarget:'http://127.0.0.1:'+apiPort});await listen(frontend,port);
  console.log('Finished review UI: '+origin+'/review/');
  console.log('Synthetic local accounts only: 100021 (ghost), 100024 (director). No production database or employee app is used.');
  console.log('Chat, votes and attachments remain browser-local simulations. Ctrl+C stops services and removes the test cluster.');
  if(process.argv.includes('--smoke')){
   for(const [pathname,status]of [['/review/',200],['/review-api/health',200],['/review-api/me',401]]){
    const response=await fetch(origin+pathname);if(response.status!==status)throw Error('Fixture preview smoke failed: '+pathname);await response.arrayBuffer();
   }
   console.log('PASS local preview startup, same-origin API and cleanup.');
  }else await stopped;
 }finally{await close(frontend);await close(backend);await pool.end();}
});

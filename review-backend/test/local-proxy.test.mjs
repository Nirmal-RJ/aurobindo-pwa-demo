import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createFrontendServer} from '../../server.mjs';
import {createReviewProxy} from '../local-proxy.mjs';
const listen=server=>new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const close=async server=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));};
test('local proxy preserves API semantics and never exposes backend files',async()=>{
 let observed;
 const api=http.createServer(async(req,res)=>{
  let body='';for await(const chunk of req)body+=chunk;
  observed={method:req.method,headers:req.headers,body,url:req.url};
  res.writeHead(204,{'Set-Cookie':['__session=synthetic; Path=/review-api; HttpOnly; SameSite=Lax'],'Cache-Control':'public,max-age=900'});res.end();
 });
 await listen(api);
 const frontend=createFrontendServer({reviewApiTarget:'http://127.0.0.1:'+api.address().port});await listen(frontend);
 const base='http://127.0.0.1:'+frontend.address().port;
 try {
  const response=await fetch(base+'/review-api/logout',{method:'POST',headers:{Origin:base,Authorization:'Bearer synthetic','Content-Type':'application/json',Cookie:'__session=synthetic'},body:'{}'});
  assert.equal(response.status,204);assert.equal(await response.text(),'');assert.match(response.headers.get('set-cookie'),/HttpOnly/);assert.equal(response.headers.get('cache-control'),'private, no-store');
  assert.equal(observed.headers.origin,base);assert.equal(observed.headers.authorization,'Bearer synthetic');assert.equal(observed.headers.cookie,'__session=synthetic');assert.equal(observed.body,'{}');assert.equal(observed.method,'POST');
  assert.equal((await fetch(base+'/review-backend/test-fixtures/web/index.html')).status,403);
  assert.equal((await fetch(base+'/ReView-BaCkEnD/test-fixtures/web/index.html')).status,403,'Windows case-insensitive paths cannot bypass the backend block');
  assert.equal((await fetch(base+'/review/login.html')).status,200);
  await close(api);
  const outage=await fetch(base+'/review-api/me');assert.equal(outage.status,503);assert.match(outage.headers.get('content-type'),/json/);assert.equal(outage.headers.get('cache-control'),'private, no-store');
 }finally{if(api.listening)await close(api);await close(frontend);}
 const disabled=createFrontendServer({reviewApiTarget:null});await listen(disabled);
 try{assert.equal((await fetch('http://127.0.0.1:'+disabled.address().port+'/review-api/me')).status,503);}finally{await close(disabled);}
 for(const target of ['https://127.0.0.1','http://remote.invalid','http://user:private@localhost','http://localhost/path'])assert.throws(()=>createReviewProxy(target));
});
test('service worker bypasses poisoned auth caches for GET, POST and navigation',async()=>{
 const handlers={},requests=[];let cacheReads=0;
 const context={self:{location:{origin:'https://review.invalid'},addEventListener:(name,fn)=>handlers[name]=fn},URL,
  caches:{match:()=>{cacheReads++;return Promise.resolve('poisoned');}},fetch:(request,options)=>{requests.push({request,options});return Promise.resolve('network');}};
 vm.runInNewContext(await readFile(new URL('../../sw.js',import.meta.url),'utf8'),context);
 for(const [method,mode]of [['GET','cors'],['POST','cors'],['GET','navigate']]){
  let result;handlers.fetch({request:{url:'https://review.invalid/review-api/me',method,mode},respondWith:value=>result=value});assert.equal(await result,'network');
 }
 assert.equal(cacheReads,0);assert.equal(requests.length,3);assert(requests.every(value=>value.options.cache==='no-store'));
});

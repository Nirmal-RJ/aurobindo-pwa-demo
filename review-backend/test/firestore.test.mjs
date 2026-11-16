import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FirestoreReviewStore} from '../src/firestore-store.mjs';
import {createReviewServer} from '../src/server.mjs';
import {hash,sessionSeconds} from '../src/policy.mjs';
// Deterministic contract double. Real Firestore/emulator validation is separate.
function fixture(){
 const rows=new Map(),db={collection:c=>({doc:id=>({path:c+'/'+id})}),runTransaction:async fn=>{
  const pending=[];const result=await fn({get:async r=>({data:()=>structuredClone(rows.get(r.path))}),create:(r,v)=>pending.push(()=>{assert(!rows.has(r.path));rows.set(r.path,structuredClone(v));}),update:(r,v)=>pending.push(()=>rows.set(r.path,{...rows.get(r.path),...structuredClone(v)}))});
  pending.forEach(f=>f());return result;
 }};
 for(const [employeeId,role]of [['100021','ghost'],['100024','director']])rows.set('reviewAccounts/'+employeeId,{id:employeeId,employeeId,name:'Synthetic reviewer',role,status:'allowed'});
 let clock=new Date('2026-11-09T00:00:00Z');
 return {rows,db,store:new FirestoreReviewStore(db,{now:()=>new Date(clock)}),advance:ms=>clock=new Date(+clock+ms)};
}
test('Firestore store contract: access, hash-only storage, recovery precedence, renewal and revocation',async()=>{
 const f=fixture(),s=f.store;
 await assert.rejects(s.login('100022'),{status:403});
 const login=await s.login('100021');assert.equal(login.account.role,'ghost');
 assert.equal(+login.expiresAt-Date.parse('2026-11-09T00:00:00Z'),sessionSeconds*1000);
 assert(!JSON.stringify([...f.rows]).includes(login.recovery));assert(!JSON.stringify([...f.rows]).includes(login.token));
 const session=await s.resolve({cookie:login.token});assert(session.cookieMatches);
 assert.equal((await s.resolve({recovery:login.recovery})).account.id,login.account.id);
 await assert.rejects(s.resolve({cookie:login.token,recovery:'invalid'}),{status:401});
 const before=f.rows.get('reviewSessions/'+session.sessionId).renewedAt;
 await s.renew(session);assert.deepEqual(f.rows.get('reviewSessions/'+session.sessionId).renewedAt,before);
 f.advance(25*3600000);assert(+await s.renew(session)>+session.expiresAt);
 f.rows.get('reviewAccounts/100021').status='blocked';await assert.rejects(s.resolve({cookie:login.token}),{status:403});
 f.rows.get('reviewAccounts/100021').status='allowed';
 await s.logout(session);await s.logout(session);await assert.rejects(s.resolve({recovery:login.recovery}),{status:401});
 assert.equal([...f.rows.values()].filter(v=>v.action==='logout').length,1);
 const director=await s.login('100024');assert.equal(director.account.role,'director');
 f.advance((sessionSeconds+1)*1000);await assert.rejects(s.resolve({cookie:director.token}),{status:401});
 assert(f.rows.has('reviewCredentials/'+hash(login.recovery)));
});
test('unchanged HTTP contract runs against Firestore adapter with synthetic storage',async()=>{
 const {store}=fixture(),origin='https://review.example.test',server=createReviewServer({store,origin,secure:true,webRoot:null});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/review-api/';
 try{
  const response=await fetch(url+'login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({employeeId:'100024'})});
  assert.equal(response.status,200);assert.match(response.headers.get('set-cookie'),/__session=.*HttpOnly.*Secure/);
  const {recoveryToken,account}=await response.json();assert.equal(account.role,'director');
  const headers={Authorization:'Bearer '+recoveryToken,Origin:origin};
  assert.equal((await fetch(url+'me',{headers})).status,200);
  const logout=await fetch(url+'logout',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'{}'});assert.equal(logout.status,204);
  assert.equal((await fetch(url+'me',{headers})).status,401);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});


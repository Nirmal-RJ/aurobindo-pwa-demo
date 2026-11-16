import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FirestoreReviewStore} from '../src/firestore-store.mjs';
import {createReviewServer} from '../src/server.mjs';

function makeQuery(rows,prefix,filters=[],order=null,lim=null){
 const q={
  where(field,op,val){return makeQuery(rows,prefix,[...filters,{field,op,val}],order,lim);},
  orderBy(field,dir='asc'){return makeQuery(rows,prefix,filters,{field,dir},lim);},
  limit(n){return makeQuery(rows,prefix,filters,order,n);},
  async get(){
   let entries=[...rows.entries()]
    .filter(([k])=>k.startsWith(prefix)&&!k.slice(prefix.length).includes('/'))
    .map(([,v])=>structuredClone(v));
   for(const f of filters){
    entries=entries.filter(doc=>{
     const v=doc?.[f.field];
     if(f.op==='==')return v===f.val;
     if(f.op==='>')return v>f.val;
     if(f.op==='<')return v<f.val;
     if(f.op==='>=')return v>=f.val;
     if(f.op==='<=')return v<=f.val;
     return true;
    });
   }
   if(order){
    const dir=order.dir==='desc'?-1:1;
    entries.sort((a,b)=>(a[order.field]<b[order.field]?-1:a[order.field]>b[order.field]?1:0)*dir);
   }
   if(lim!==null)entries=entries.slice(0,lim);
   return {docs:entries.map(data=>({data:()=>data}))};
  }
 };
 return q;
}

function makeCollection(rows,prefix){
 const q=makeQuery(rows,prefix);
 return {
  ...q,
  doc:id=>{
   const path=prefix+id;
   return {
    path,
    async get(){return {data:()=>structuredClone(rows.get(path))};},
    async set(v,opts){
     const val=structuredClone(v);
     rows.set(path,opts?.merge?{...(rows.get(path)||{}),...val}:val);
    },
    collection:sub=>makeCollection(rows,path+'/'+sub+'/')
   };
  }
 };
}

function fixture(){
 const rows=new Map();
 const db={
  collection:name=>makeCollection(rows,name+'/'),
  getAll:async(...refs)=>refs.map(r=>({data:()=>structuredClone(rows.get(r.path))})),
  runTransaction:async fn=>{
   const pending=[];
   const tx={
    get:async r=>({data:()=>structuredClone(rows.get(r.path))}),
    create:(r,v)=>pending.push(()=>{assert(!rows.has(r.path),'Document already exists: '+r.path);rows.set(r.path,structuredClone(v));}),
    set:(r,v,opts)=>pending.push(()=>{const val=structuredClone(v);rows.set(r.path,opts?.merge?{...(rows.get(r.path)||{}),...val}:val);}),
    update:(r,v)=>pending.push(()=>rows.set(r.path,{...rows.get(r.path),...structuredClone(v)}))
   };
   const result=await fn(tx);
   pending.forEach(f=>f());
   return result;
  }
 };
 rows.set('reviewAccounts/100021',{id:'100021',employeeId:'100021',name:'Ghost Reviewer',role:'ghost',status:'allowed'});
 rows.set('reviewAccounts/100024',{id:'100024',employeeId:'100024',name:'Director Reviewer',role:'director',status:'allowed'});
 let clock=new Date('2026-11-13T00:00:00Z');
 return {
  rows,
  db,
  store:new FirestoreReviewStore(db,{now:()=>{clock=new Date(+clock+1000);return clock;}})
 };
}

async function loginUser(baseUrl,origin,employeeId){
 const res=await fetch(baseUrl+'login',{
  method:'POST',
  headers:{Origin:origin,'Content-Type':'application/json'},
  body:JSON.stringify({employeeId})
 });
 assert.equal(res.status,200);
 const data=await res.json();
 return {
  account:data.account,
  headers:{Authorization:'Bearer '+data.recoveryToken,Origin:origin}
 };
}

test('Chat HTTP endpoints: Global/RC isolation, messaging, reactions, votes, read state, and chunked attachments',async()=>{
 const f=fixture();
 const origin='https://review.example.test';
 const server=createReviewServer({store:f.store,origin,secure:true,webRoot:null});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const baseUrl='http://127.0.0.1:'+server.address().port+'/review-api/';
 try{
  // 1. Unauthenticated access rejected
  assert.equal((await fetch(baseUrl+'chat/bootstrap')).status,401);

  const ghost=await loginUser(baseUrl,origin,'100021');
  const director=await loginUser(baseUrl,origin,'100024');

  // 2. Global messaging & pagination
  const m1Res=await fetch(baseUrl+'chat/messages',{
   method:'POST',
   headers:{...ghost.headers,'Content-Type':'application/json'},
   body:JSON.stringify({roomId:'global',buildId:'blast-30',text:'First global note',attachments:[]})
  });
  assert.equal(m1Res.status,201);
  const m1=await m1Res.json();

  const m2Res=await fetch(baseUrl+'chat/messages',{
   method:'POST',
   headers:{...ghost.headers,'Content-Type':'application/json'},
   body:JSON.stringify({roomId:'global',buildId:'blast-30',text:'Second global note',attachments:[]})
  });
  assert.equal(m2Res.status,201);
  const m2=await m2Res.json();

  // Check unread count for director before director replies
  const bootDirBefore=await (await fetch(baseUrl+'chat/bootstrap',{headers:director.headers})).json();
  assert.equal(bootDirBefore.unread.global['blast-30'],2);
  assert.equal(bootDirBefore.unread.rc,undefined);

  const m3Res=await fetch(baseUrl+'chat/messages',{
   method:'POST',
   headers:{...director.headers,'Content-Type':'application/json'},
   body:JSON.stringify({roomId:'global',buildId:'blast-30',text:'Director reply',replyTo:m2.id,attachments:[]})
  });
  assert.equal(m3Res.status,201);
  const m3=await m3Res.json();
  assert.equal(m3.replyTo,m2.id);

  const page1=await (await fetch(baseUrl+'chat/messages?roomId=global&buildId=blast-30&limit=2',{headers:director.headers})).json();
  assert.equal(page1.messages.length,2);
  assert.equal(page1.hasOlder,true);
  assert.deepEqual(page1.messages.map(m=>m.id),[m2.id,m3.id]);

  const page2=await (await fetch(baseUrl+`chat/messages?roomId=global&buildId=blast-30&limit=2&before=${page1.cursor}`,{headers:director.headers})).json();
  assert.equal(page2.messages.length,1);
  assert.equal(page2.hasOlder,false);
  assert.equal(page2.messages[0].id,m1.id);

  // 3. Unread & Read tracking after a new ghost message
  const m4=await (await fetch(baseUrl+'chat/messages',{
   method:'POST',
   headers:{...ghost.headers,'Content-Type':'application/json'},
   body:JSON.stringify({roomId:'global',buildId:'blast-30',text:'Fourth global note',attachments:[]})
  })).json();
  const bootDir=await (await fetch(baseUrl+'chat/bootstrap',{headers:director.headers})).json();
  assert.equal(bootDir.unread.global['blast-30'],1);

  const readRes=await fetch(baseUrl+'chat/read',{
   method:'POST',
   headers:{...director.headers,'Content-Type':'application/json'},
   body:JSON.stringify({roomId:'global',buildId:'blast-30',sequence:m4.sequence})
  });
  assert.equal(readRes.status,200);
  const bootDirAfter=await (await fetch(baseUrl+'chat/bootstrap',{headers:director.headers})).json();
  assert.equal(bootDirAfter.unread.global['blast-30'],0);

  // 4. Reactions & sync
  const r1=await fetch(baseUrl+`chat/messages/${m1.id}/react`,{
   method:'POST',
   headers:{...director.headers,'Content-Type':'application/json'},
   body:JSON.stringify({emoji:'👍'})
  });
  assert.equal(r1.status,200);
  const reacted=await r1.json();
  assert.deepEqual(reacted.reactions['👍'],['100024']);

  const syncRes=await (await fetch(baseUrl+`chat/sync?roomId=global&buildId=blast-30&sinceSequence=${m1.sequence}&loadedIds=${m1.id}`,{headers:ghost.headers})).json();
  assert.equal(syncRes.newMessages.length,3);
  assert.equal(syncRes.updatedMessages.length,1);
  assert.deepEqual(syncRes.updatedMessages[0].reactions['👍'],['100024']);

  // Toggle off
  const r2=await (await fetch(baseUrl+`chat/messages/${m1.id}/react`,{
   method:'POST',
   headers:{...director.headers,'Content-Type':'application/json'},
   body:JSON.stringify({emoji:'👍'})
  })).json();
  assert.equal(r2.reactions['👍'],undefined);

  // 5. Votes
  const v1=await (await fetch(baseUrl+'chat/votes',{
   method:'POST',
   headers:{...director.headers,'Content-Type':'application/json'},
   body:JSON.stringify({buildId:'blast-30',decision:'approve'})
  })).json();
  assert.equal(v1.length,1);
  assert.equal(v1[0].decision,'approve');

  const vBad=await fetch(baseUrl+'chat/votes',{
   method:'POST',
   headers:{...director.headers,'Content-Type':'application/json'},
   body:JSON.stringify({buildId:'general-discussion',decision:'approve'})
  });
  assert.equal(vBad.status,400);

  // 6. RC isolation & Discuss in RC
  const rcPost=await fetch(baseUrl+'chat/messages',{
   method:'POST',
   headers:{...ghost.headers,'Content-Type':'application/json'},
   body:JSON.stringify({
    roomId:'rc',
    buildId:'blast-30',
    text:'Internal ghost note',
    attachments:[],
    reference:{messageId:m3.id,author:{id:director.account.id,name:director.account.name,role:director.account.role}}
   })
  });
  assert.equal(rcPost.status,201);
  const rcMsg=await rcPost.json();
  assert.equal(rcMsg.reference.messageId,m3.id);
  assert.equal(rcMsg.reference.text,'Director reply');

  // Director blocked from all RC endpoints
  assert.equal((await fetch(baseUrl+'chat/messages?roomId=rc&buildId=blast-30',{headers:director.headers})).status,403);
  assert.equal((await fetch(baseUrl+'chat/messages',{
   method:'POST',
   headers:{...director.headers,'Content-Type':'application/json'},
   body:JSON.stringify({roomId:'rc',buildId:'blast-30',text:'Sneak in',attachments:[]})
  })).status,403);
  assert.equal((await fetch(baseUrl+'chat/messages',{
   method:'POST',
   headers:{...director.headers,'Content-Type':'application/json'},
   body:JSON.stringify({roomId:'global',buildId:'blast-30',text:'Bad ref',attachments:[],reference:{messageId:m1.id}})
  })).status,403);
  assert.equal((await fetch(baseUrl+`chat/messages/${rcMsg.id}`,{headers:director.headers})).status,403);
  assert.equal((await fetch(baseUrl+`chat/messages/${rcMsg.id}/react`,{
   method:'POST',
   headers:{...director.headers,'Content-Type':'application/json'},
   body:JSON.stringify({emoji:'👍'})
  })).status,403);
  assert.equal((await fetch(baseUrl+'chat/sync?roomId=rc&buildId=blast-30',{headers:director.headers})).status,403);

  // 7. Chunked attachments (1.6 MB -> 3 chunks) + RC attachment isolation
  const largePng=Buffer.alloc(1600*1024,0xab);
  const upGlobal=await fetch(baseUrl+'chat/attachments?roomId=global&buildId=blast-30&name=shot.png&type=image/png',{
   method:'POST',
   headers:{...ghost.headers,'Content-Type':'image/png'},
   body:largePng
  });
  assert.equal(upGlobal.status,201);
  const metaGlobal=await upGlobal.json();
  assert.equal(metaGlobal.size,largePng.length);
  const chunkKeys=[...f.rows.keys()].filter(k=>k.startsWith(`reviewAttachmentChunks/${metaGlobal.id}__`));
  assert.equal(chunkKeys.length,3);

  const downGlobal=await fetch(baseUrl+`chat/attachments/${metaGlobal.id}`,{headers:director.headers});
  assert.equal(downGlobal.status,200);
  assert.equal(downGlobal.headers.get('content-type'),'image/png');
  const downloadedBuf=Buffer.from(await downGlobal.arrayBuffer());
  assert.equal(Buffer.compare(downloadedBuf,largePng),0);

  // RC attachment blocked for director
  const upRc=await fetch(baseUrl+'chat/attachments?roomId=rc&buildId=blast-30&name=secret.png&type=image/png',{
   method:'POST',
   headers:{...ghost.headers,'Content-Type':'image/png'},
   body:Buffer.from([1,2,3,4])
  });
  assert.equal(upRc.status,201);
  const metaRc=await upRc.json();
  assert.equal((await fetch(baseUrl+`chat/attachments/${metaRc.id}`,{headers:director.headers})).status,403);
  assert.equal((await fetch(baseUrl+`chat/attachments/${metaRc.id}`,{headers:ghost.headers})).status,200);
  assert.equal((await fetch(baseUrl+'chat/attachments?roomId=rc&buildId=blast-30&name=nope.png&type=image/png',{
   method:'POST',
   headers:{...director.headers,'Content-Type':'image/png'},
   body:Buffer.from([1,2,3])
  })).status,403);
 }finally{
  server.closeAllConnections();
  await new Promise(r=>server.close(r));
 }
});

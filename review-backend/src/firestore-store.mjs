import {randomUUID} from 'node:crypto';
import {hash,newToken,cookieForRecovery,roleFor,sessionSeconds,renewalSeconds} from './policy.mjs';
const denied=(status,message)=>Object.assign(Error(message),{status});
const date=value=>value?.toDate?value.toDate():new Date(value);
const eligible=a=>a&&a.status==='allowed'&&a.role===roleFor(a.employeeId);
const view=a=>({id:a.id,employeeId:a.employeeId,name:a.name,role:a.role,identityMethod:'employee-id-only'});
const ROOMS=new Set(['global','rc']);
const EMOJIS=new Set(['\u{1F44D}','\u{1F44E}','\u2705','\u2764\uFE0F']);
const MIME_TYPES=new Set(['image/png','image/jpeg','image/webp','image/gif']);
const MAX_ATTACHMENT_BYTES=5*1024*1024;
const CHUNK_BYTES=700000;
const scopeKey=(roomId,buildId)=>`${roomId}__${buildId}`;
const validScopeId=id=>typeof id==='string'&&id.length>0&&id.length<=120&&!/[\/\\]/.test(id);
function permitRoom(account,roomId){
 if(!ROOMS.has(roomId))throw denied(400,'Invalid chat room.');
 if(roomId==='rc'&&account.role!=='ghost')throw denied(403,'Only ghost testers can access RC.');
}
function cleanAttachments(list){
 if(list===undefined||list===null)return [];
 if(!Array.isArray(list)||list.length>4)throw denied(400,'Attach up to four screenshots per message.');
 return list.map(a=>{
  if(!a||typeof a.id!=='string'||!a.id||typeof a.name!=='string'||typeof a.type!=='string'||typeof a.size!=='number')throw denied(400,'Invalid attachment metadata.');
  return {id:a.id,name:a.name.slice(0,255),type:a.type,size:a.size,...(typeof a.width==='number'?{width:a.width}:{}),...(typeof a.height==='number'?{height:a.height}:{})};
 });
}
// Server-only collections. Browser rules deny access; credential IDs are hashes.
export class FirestoreReviewStore {
 constructor(db,{now=()=>new Date()}={}){this.db=db;this.now=now;}
 ref(collection,id){return this.db.collection(collection).doc(id);}
 async login(employeeId){
  const id=randomUUID(),recovery=newToken(),token=cookieForRecovery(recovery),now=this.now(),expiresAt=new Date(+now+sessionSeconds*1000);
  return this.db.runTransaction(async tx=>{
   const account=(await tx.get(this.ref('reviewAccounts',employeeId))).data();
   if(!eligible(account)||account.employeeId!==employeeId)throw denied(403,'This account does not have review access.');
   tx.create(this.ref('reviewSessions',id),{accountId:account.id,employeeId,tokenHash:hash(token),recoveryHash:hash(recovery),createdAt:now,renewedAt:now,expiresAt,revokedAt:null});
   tx.create(this.ref('reviewCredentials',hash(token)),{sessionId:id,kind:'cookie'});
   tx.create(this.ref('reviewCredentials',hash(recovery)),{sessionId:id,kind:'recovery'});
   tx.create(this.ref('reviewAudit',randomUUID()),{accountId:account.id,sessionId:id,action:'login',at:now});
   return {account:view(account),token,recovery,expiresAt};
  });
 }
 async resolve({cookie,recovery}){
  if(!cookie&&!recovery)throw denied(401,'Please sign in.');
  return this.db.runTransaction(async tx=>{
   const c=(await tx.get(this.ref('reviewCredentials',hash(recovery||cookie)))).data();
   if(!c||c.kind!==(recovery?'recovery':'cookie'))throw denied(401,'Please sign in again.');
   const s=(await tx.get(this.ref('reviewSessions',c.sessionId))).data();
   if(!s||s.revokedAt||+date(s.expiresAt)<=+this.now()||(recovery?s.recoveryHash:s.tokenHash)!==hash(recovery||cookie))throw denied(401,'Please sign in again.');
   const a=(await tx.get(this.ref('reviewAccounts',s.employeeId))).data();
   if(!eligible(a)||a.id!==s.accountId||a.employeeId!==s.employeeId)throw denied(403,'This account no longer has review access.');
   return {account:view(a),sessionId:c.sessionId,expiresAt:date(s.expiresAt),renewedAt:date(s.renewedAt),cookieMatches:!!cookie&&s.tokenHash===hash(cookie)};
  });
 }
 async renew(session){
  if(+this.now()-+session.renewedAt<renewalSeconds*1000)return session.expiresAt;
  return this.db.runTransaction(async tx=>{
   const ref=this.ref('reviewSessions',session.sessionId),s=(await tx.get(ref)).data(),now=this.now();
   if(!s||s.revokedAt||+date(s.expiresAt)<=+now)throw denied(401,'Please sign in again.');
   const a=(await tx.get(this.ref('reviewAccounts',s.employeeId))).data();
   if(!eligible(a)||a.id!==s.accountId)throw denied(403,'This account no longer has review access.');
   if(+now-+date(s.renewedAt)<renewalSeconds*1000)return date(s.expiresAt);
   const expiresAt=new Date(+now+sessionSeconds*1000);tx.update(ref,{renewedAt:now,expiresAt});return expiresAt;
  });
 }
 async logout(session){
  await this.db.runTransaction(async tx=>{
   const ref=this.ref('reviewSessions',session.sessionId),s=(await tx.get(ref)).data();
   if(!s||s.revokedAt)return;
   tx.update(ref,{revokedAt:this.now()});
   tx.create(this.ref('reviewAudit',randomUUID()),{accountId:s.accountId,sessionId:session.sessionId,action:'logout',at:this.now()});
  });
 }

 scopeRef(roomId,buildId){return this.ref('reviewScopes',scopeKey(roomId,buildId));}
 msgRef(roomId,buildId,messageId){return this.scopeRef(roomId,buildId).collection('messages').doc(messageId);}

 async listAccounts(){
  const snap=await this.db.collection('reviewAccounts').where('status','==','allowed').get();
  return snap.docs.map(d=>d.data()).filter(eligible).map(a=>({id:a.id,employeeId:a.employeeId,name:a.name,role:a.role}));
 }

 async listVotes(buildId){
  const col=this.db.collection('reviewVotes');
  const snap=buildId?await col.where('buildId','==',buildId).get():await col.get();
  return snap.docs.map(d=>d.data());
 }

 async computeUnread(account){
  const unread={global:{}};
  if(account.role==='ghost')unread.rc={};
  const [scopesSnap,readsSnap]=await Promise.all([
   this.db.collection('reviewScopes').get(),
   this.db.collection('reviewReadState').where('accountId','==',account.id).get()
  ]);
  const readMap=new Map();
  for(const doc of readsSnap.docs){
   const r=doc.data();
   readMap.set(scopeKey(r.roomId,r.buildId),r.lastSequence||0);
  }
  const checks=[];
  for(const doc of scopesSnap.docs){
   const scope=doc.data();
   if(!scope||!ROOMS.has(scope.roomId))continue;
   if(scope.roomId==='rc'&&account.role!=='ghost')continue;
   const lastRead=readMap.get(scopeKey(scope.roomId,scope.buildId))||0;
   if((scope.latestSequence||0)<=lastRead){
    unread[scope.roomId][scope.buildId]=0;
    continue;
   }
   checks.push((async()=>{
    const msgSnap=await this.scopeRef(scope.roomId,scope.buildId).collection('messages').where('sequence','>',lastRead).get();
    let count=0;
    for(const mDoc of msgSnap.docs){
     const m=mDoc.data();
     if(m.authorId!==account.id&&m.delivery==='sent')count++;
    }
    unread[scope.roomId][scope.buildId]=count;
   })());
  }
  await Promise.all(checks);
  return unread;
 }

 async getBootstrapState(account){
  const [accounts,votes,unread]=await Promise.all([
   this.listAccounts(),
   this.listVotes(),
   this.computeUnread(account)
  ]);
  return {accounts,votes,unread};
 }

 async listMessages(account,{roomId,buildId,before,limit=12}){
  permitRoom(account,roomId);
  if(!validScopeId(buildId))throw denied(400,'Invalid discussion scope.');
  const lim=Math.min(Math.max(Number(limit)||12,1),50);
  let q=this.scopeRef(roomId,buildId).collection('messages');
  if(Number.isFinite(before)){
   q=q.where('sequence','<',before);
  }
  const snap=await q.orderBy('sequence','desc').limit(lim+1).get();
  const docs=snap.docs.map(d=>d.data());
  const hasOlder=docs.length>lim;
  const messages=docs.slice(0,lim).reverse();
  return {messages,hasOlder,cursor:messages[0]?.sequence};
 }

 async getMessage(account,messageId){
  if(typeof messageId!=='string'||!messageId)throw denied(400,'Invalid message ID.');
  const idx=(await this.ref('reviewMessageIndex',messageId).get()).data();
  if(!idx)throw denied(404,'Message no longer available.');
  permitRoom(account,idx.roomId);
  const msg=(await this.msgRef(idx.roomId,idx.buildId,messageId).get()).data();
  if(!msg)throw denied(404,'Message no longer available.');
  return msg;
 }

 async sendMessage(account,input){
  if(!input||typeof input!=='object')throw denied(400,'Invalid message payload.');
  const {roomId,buildId,text='',replyTo,reference}=input;
  permitRoom(account,roomId);
  if(!validScopeId(buildId))throw denied(400,'Invalid discussion scope.');
  if(typeof text!=='string')throw denied(400,'Message text must be a string.');
  if(text.length>6000)throw denied(400,'Messages can contain up to 6,000 characters.');
  const attachments=cleanAttachments(input.attachments);
  if(!text.trim()&&!attachments.length&&!reference)throw denied(400,'Write a message or attach a screenshot.');
  if(reference!==undefined&&reference!==null){
   if(account.role!=='ghost'||roomId!=='rc')throw denied(403,'Only ghosts can discuss Global messages internally.');
   if(!reference||typeof reference!=='object'||typeof reference.messageId!=='string')throw denied(400,'Invalid message reference.');
  }
  const msgId=randomUUID();
  const createdAt=this.now().toISOString();
  return this.db.runTransaction(async tx=>{
   if(replyTo){
    const parent=(await tx.get(this.msgRef(roomId,buildId,replyTo))).data();
    if(!parent||parent.roomId!==roomId||parent.buildId!==buildId)throw denied(400,'Reply must belong to this room and build.');
   }
   let cleanRef=null;
   if(reference){
    const origIdx=(await tx.get(this.ref('reviewMessageIndex',reference.messageId))).data();
    if(!origIdx||origIdx.roomId!=='global'||origIdx.buildId!==buildId)throw denied(400,'Invalid original message.');
    const orig=(await tx.get(this.msgRef('global',buildId,reference.messageId))).data();
    if(!orig)throw denied(400,'Invalid original message.');
    cleanRef={
     roomId:'global',
     messageId:orig.id,
     buildId:orig.buildId,
     author:reference.author&&typeof reference.author==='object'?{id:String(reference.author.id||orig.authorId),name:String(reference.author.name||'Reviewer'),role:reference.author.role==='ghost'?'ghost':'director'}:{id:orig.authorId,name:'Reviewer',role:'director'},
     createdAt:orig.createdAt,
     text:orig.text,
     attachments:orig.attachments||[]
    };
   }
   const seqRef=this.ref('reviewChatState','sequence');
   const seqDoc=(await tx.get(seqRef)).data();
   const sequence=(seqDoc?.nextSequence||0)+1;
   tx.set(seqRef,{nextSequence:sequence},{merge:true});
   const message={
    id:msgId,
    roomId,
    buildId,
    authorId:account.id,
    text,
    createdAt,
    sequence,
    attachments,
    ...(replyTo?{replyTo}:{}),
    ...(cleanRef?{reference:cleanRef}:{}),
    reactions:{},
    delivery:'sent'
   };
   tx.create(this.msgRef(roomId,buildId,msgId),message);
   tx.create(this.ref('reviewMessageIndex',msgId),{id:msgId,roomId,buildId,sequence});
   tx.set(this.scopeRef(roomId,buildId),{roomId,buildId,latestSequence:sequence,updatedAt:createdAt},{merge:true});
   tx.set(this.ref('reviewReadState',`${account.id}__${roomId}__${buildId}`),{accountId:account.id,roomId,buildId,lastSequence:sequence,updatedAt:createdAt},{merge:true});
   return message;
  });
 }

 async toggleReaction(account,messageId,emoji){
  if(!EMOJIS.has(emoji))throw denied(400,'Invalid reaction.');
  const idx=(await this.ref('reviewMessageIndex',messageId).get()).data();
  if(!idx)throw denied(404,'Message no longer available.');
  permitRoom(account,idx.roomId);
  return this.db.runTransaction(async tx=>{
   const ref=this.msgRef(idx.roomId,idx.buildId,messageId);
   const msg=(await tx.get(ref)).data();
   if(!msg)throw denied(404,'Message no longer available.');
   const reactions={...(msg.reactions||{})};
   const list=Array.isArray(reactions[emoji])?reactions[emoji]:[];
   const next=list.includes(account.id)?list.filter(id=>id!==account.id):[...list,account.id];
   if(next.length)reactions[emoji]=next;else delete reactions[emoji];
   tx.update(ref,{reactions});
   return {...msg,reactions};
  });
 }

 async castVote(account,{buildId,decision}){
  if(!validScopeId(buildId)||buildId==='general-discussion')throw denied(400,'Invalid build for voting.');
  if(!['approve','changes'].includes(decision))throw denied(400,'Invalid vote decision.');
  const createdAt=this.now().toISOString();
  const vote={buildId,accountId:account.id,decision,createdAt};
  await this.ref('reviewVotes',`${buildId}__${account.id}`).set(vote);
  return this.listVotes(buildId);
 }

 async markRead(account,{roomId,buildId,sequence}){
  permitRoom(account,roomId);
  if(!validScopeId(buildId))throw denied(400,'Invalid discussion scope.');
  const seq=Number(sequence);
  if(!Number.isFinite(seq)||seq<0)throw denied(400,'Invalid sequence.');
  const ref=this.ref('reviewReadState',`${account.id}__${roomId}__${buildId}`);
  const updatedAt=this.now().toISOString();
  await this.db.runTransaction(async tx=>{
   const existing=(await tx.get(ref)).data();
   const lastSequence=Math.max(existing?.lastSequence||0,seq);
   tx.set(ref,{accountId:account.id,roomId,buildId,lastSequence,updatedAt},{merge:true});
  });
 }

 async syncState(account,{roomId,buildId,sinceSequence=0,loadedIds=[]}){
  let newMessages=[];
  let updatedMessages=[];
  if(roomId&&buildId){
   permitRoom(account,roomId);
   if(!validScopeId(buildId))throw denied(400,'Invalid discussion scope.');
   const since=Number(sinceSequence)||0;
   const snap=await this.scopeRef(roomId,buildId).collection('messages').where('sequence','>',since).orderBy('sequence','asc').limit(50).get();
   newMessages=snap.docs.map(d=>d.data());
   if(Array.isArray(loadedIds)&&loadedIds.length){
    const idsToFetch=loadedIds.filter(id=>typeof id==='string'&&id).slice(0,50);
    if(idsToFetch.length){
     const refs=idsToFetch.map(id=>this.msgRef(roomId,buildId,id));
     const docs=typeof this.db.getAll==='function'?await this.db.getAll(...refs):await Promise.all(refs.map(r=>r.get()));
     updatedMessages=docs.map(d=>d.data()).filter(Boolean);
    }
   }
  }
  const [votes,unread]=await Promise.all([
   this.listVotes(),
   this.computeUnread(account)
  ]);
  return {newMessages,updatedMessages,votes,unread};
 }

 async saveAttachment(account,{roomId,buildId,name,type,bytes}){
  permitRoom(account,roomId);
  if(!validScopeId(buildId))throw denied(400,'Invalid discussion scope.');
  if(!MIME_TYPES.has(type))throw denied(400,'Choose a PNG, JPEG, WebP or GIF screenshot.');
  if(!Buffer.isBuffer(bytes)||bytes.length===0||bytes.length>MAX_ATTACHMENT_BYTES)throw denied(400,'Each screenshot must be smaller than 5 MB.');
  const attachmentId=randomUUID();
  const cleanName=String(name||'screenshot').slice(0,255);
  const createdAt=this.now().toISOString();
  const chunkCount=Math.ceil(bytes.length/CHUNK_BYTES);
  const meta={id:attachmentId,name:cleanName,type,size:bytes.length,roomId,buildId,uploaderId:account.id,chunkCount,createdAt};
  await this.db.runTransaction(async tx=>{
   tx.create(this.ref('reviewAttachments',attachmentId),meta);
   for(let i=0;i<chunkCount;i++){
    const slice=bytes.subarray(i*CHUNK_BYTES,(i+1)*CHUNK_BYTES);
    tx.create(this.ref('reviewAttachmentChunks',`${attachmentId}__${i}`),{bytes:slice});
   }
  });
  return {id:meta.id,name:meta.name,type:meta.type,size:meta.size};
 }

 async getAttachment(account,attachmentId){
  if(typeof attachmentId!=='string'||!attachmentId)throw denied(400,'Invalid attachment ID.');
  const meta=(await this.ref('reviewAttachments',attachmentId).get()).data();
  if(!meta)throw denied(404,'Screenshot not found.');
  permitRoom(account,meta.roomId);
  const refs=[];
  for(let i=0;i<(meta.chunkCount||0);i++)refs.push(this.ref('reviewAttachmentChunks',`${attachmentId}__${i}`));
  const docs=refs.length?(typeof this.db.getAll==='function'?await this.db.getAll(...refs):await Promise.all(refs.map(r=>r.get()))):[];
  const buffers=docs.map(d=>{
   const b=d.data()?.bytes;
   return Buffer.isBuffer(b)?b:Buffer.from(b);
  });
  return {meta,buffer:Buffer.concat(buffers)};
 }

 async savePushToken(account,token){
  if(typeof token!=='string'||token.length<20||token.length>4096)throw denied(400,'Invalid push token.');
  const id=`${account.id}__${hash(token).slice(0,24)}`;
  await this.ref('reviewPushTokens',id).set({
   id,
   accountId:account.id,
   role:account.role,
   token,
   updatedAt:this.now().toISOString()
  });
  return {saved:true};
 }

 async deletePushToken(account,token){
  if(typeof token!=='string'||!token)return {deleted:false};
  const id=`${account.id}__${hash(token).slice(0,24)}`;
  await this.ref('reviewPushTokens',id).delete();
  return {deleted:true};
 }

 async removePushTokenById(id){
  if(!id)return;
  await this.ref('reviewPushTokens',id).delete().catch(()=>{});
 }

 async listPushTokensForRoom(roomId,excludeAccountId){
  const snap=await this.db.collection('reviewPushTokens').get();
  const list=[];
  for(const doc of snap.docs){
   const d=doc.data();
   if(!d||!d.token||d.accountId===excludeAccountId)continue;
   if(roomId==='rc'&&d.role!=='ghost')continue;
   list.push({id:d.id||doc.id,token:d.token});
  }
  return list;
 }
}

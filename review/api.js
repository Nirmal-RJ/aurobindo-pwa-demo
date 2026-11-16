import {publicGames,generalDiscussionId} from './public-games.js';
import {reviewSession} from './session.js';
/** @typedef {import('./contracts').ReviewAPI} ReviewAPI */

const SESSION_KEY='qsl-review-session-v1';
const MIME_TYPES=new Set(['image/png','image/jpeg','image/webp','image/gif']);
const MAX_ATTACHMENT_BYTES=5*1024*1024;

function withPhoto(account){
 const next={...account};
 if(!next.photo){
  const initial=Array.from((next.name||'?').trim())[0]||'?';
  const fill=next.role==='ghost'?'#efe6fb':'#e1f2ed';
  const ink=next.role==='ghost'?'#5b2b96':'#216e63';
  next.photo='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="24" fill="${fill}"/><text x="40" y="53" text-anchor="middle" font-family="Arial,sans-serif" font-size="40" fill="${ink}">&#${initial.codePointAt(0)};</text></svg>`);
 }
 return next;
}

function bearerToken(){
 try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'{}')?.recoveryToken||'';}
 catch{return '';}
}

async function apiFetch(path,options={}){
 const headers=new Headers(options.headers||{});
 const token=bearerToken();
 if(token&&!headers.has('Authorization'))headers.set('Authorization',`Bearer ${token}`);
 const response=await fetch(path,{
  credentials:'same-origin',
  cache:'no-store',
  ...options,
  headers
 });
 if(response.status===401){
  reviewSession.clear?.();
  const err=Error('Your review session has expired. Please sign in again.');
  err.status=401;
  throw err;
 }
 const isJson=(response.headers.get('content-type')||'').includes('application/json');
 if(!response.ok){
  const body=isJson?await response.json().catch(()=>({})):{};
  const err=Error(body.message||`Request failed (${response.status}).`);
  err.status=response.status;
  throw err;
 }
 if(response.status===204)return null;
 return isJson?response.json():response;
}

/** @returns {ReviewAPI} */
export function createReviewAPI(){
 const session=reviewSession.current();
 if(!session)throw Error('Restore your review session before opening the preview.');

 let viewer=withPhoto(session.account);
 const accountsList=[viewer];
 const buildsList=publicGames.map(game=>({
  id:game.defaultBuildId,
  gameId:game.id,
  gameName:game.name,
  version:'Review build A',
  createdAt:new Date(0).toISOString()
 }));
 const roomsList=viewer.role==='ghost'
  ?[{id:'global',name:'Global',label:'Global',description:'Directors, testers and approved core team'},{id:'rc',name:'RC',label:'RC',description:'Ghost testers only · internal discussion'}]
  :[{id:'global',name:'Global',label:'Global',description:'Directors, testers and approved core team'}];

 const votesByBuild=new Map();
 let unreadState={global:{},rc:{}};
 const scopeState=new Map(); // `${roomId}::${buildId}` -> { maxSequence, reactionsById: Map<string, string> }
 let activeScope={roomId:'global',buildId:buildsList.find(b=>b.id==='blast-30')?.id||buildsList[0]?.id||generalDiscussionId};

 const listeners=new Set();
 let pollTimer=null;
 let pollInFlight=false;
 let readyPromise=null;

 const scopeKey=(roomId,buildId)=>`${roomId}::${buildId}`;
 function ensureScope(roomId,buildId){
  const key=scopeKey(roomId,buildId);
  let entry=scopeState.get(key);
  if(!entry){entry={maxSequence:0,reactionsById:new Map()};scopeState.set(key,entry);}
  return entry;
 }

 function trackMessages(roomId,buildId,messages){
  const entry=ensureScope(roomId,buildId);
  for(const m of messages){
   if(typeof m.sequence==='number'&&m.sequence>entry.maxSequence)entry.maxSequence=m.sequence;
   entry.reactionsById.set(m.id,JSON.stringify(m.reactions||{}));
  }
 }

 function emit(event){
  for(const fn of listeners){
   try{fn(event);}catch{}
  }
 }

 function applyVotes(votes){
  const grouped=new Map();
  for(const v of votes||[]){
   if(!grouped.has(v.buildId))grouped.set(v.buildId,[]);
   grouped.get(v.buildId).push(v);
  }
  const prevActive=JSON.stringify(votesByBuild.get(activeScope.buildId)||[]);
  votesByBuild.clear();
  for(const [bId,list] of grouped)votesByBuild.set(bId,list);
  const nextActive=JSON.stringify(votesByBuild.get(activeScope.buildId)||[]);
  if(prevActive!==nextActive){
   emit({kind:'review',buildId:activeScope.buildId});
  }
 }

 function applyUnread(nextUnread){
  const normalized=nextUnread&&typeof nextUnread==='object'
   ?{global:{...(nextUnread.global||{})},rc:{...(nextUnread.rc||{})}}
   :{global:{},rc:{}};
  const changed=JSON.stringify(unreadState)!==JSON.stringify(normalized);
  unreadState=normalized;
  if(changed)emit({kind:'build'});
 }

 async function bootstrap(){
  const data=await apiFetch('/review-api/chat/bootstrap');
  if(Array.isArray(data.accounts)&&data.accounts.length){
   const mapped=data.accounts.map(withPhoto);
   accountsList.splice(0,accountsList.length,...mapped);
   const match=accountsList.find(a=>a.id===viewer.id);
   if(match)viewer=match;
  }
  applyVotes(data.votes);
  applyUnread(data.unread);
 }

 async function syncNow(){
  if(pollInFlight||typeof document!=='undefined'&&document.visibilityState==='hidden')return;
  const {roomId,buildId}=activeScope||{};
  if(!roomId||!buildId)return;
  pollInFlight=true;
  try{
   const entry=ensureScope(roomId,buildId);
   const loadedIds=Array.from(entry.reactionsById.keys()).slice(-50);
   const params=new URLSearchParams({
    roomId,
    buildId,
    sinceSequence:String(entry.maxSequence||0)
   });
   if(loadedIds.length)params.set('loadedIds',loadedIds.join(','));
   const data=await apiFetch(`/review-api/chat/sync?${params}`);
   applyVotes(data.votes);
   applyUnread(data.unread);
   for(const msg of data.newMessages||[]){
    trackMessages(msg.roomId,msg.buildId,[msg]);
    emit({kind:'message',roomId:msg.roomId,buildId:msg.buildId,messageId:msg.id});
   }
   for(const msg of data.updatedMessages||[]){
    const nextReact=JSON.stringify(msg.reactions||{});
    if(entry.reactionsById.get(msg.id)!==nextReact){
     entry.reactionsById.set(msg.id,nextReact);
     emit({kind:'reaction',roomId:msg.roomId,buildId:msg.buildId,messageId:msg.id});
    }
   }
  }catch{
   // Background poll errors are transient; next interval retries.
  }finally{
   pollInFlight=false;
  }
 }

 function startPolling(){
  if(pollTimer)return;
  pollTimer=setInterval(syncNow,3500);
 }

 function stopPolling(){
  if(!pollTimer)return;
  clearInterval(pollTimer);
  pollTimer=null;
 }

 const blobURLs=new Map();

 return {
  ready(){
   if(!readyPromise)readyPromise=bootstrap();
   return readyPromise;
  },
  accounts:()=>accountsList,
  currentAccount:()=>viewer,
  rooms:()=>roomsList,
  builds:()=>buildsList,
  unread:(roomId,scopeId)=>unreadState[roomId]?.[scopeId]||0,
  votes:buildId=>votesByBuild.get(buildId)||[],
  async listMessages(roomOrObj,buildIdParam,beforeParam,limitParam=12){
   let roomId,buildId,before,limit=limitParam;
   if(typeof roomOrObj==='object'&&roomOrObj!==null){
    roomId=roomOrObj.roomId;buildId=roomOrObj.buildId;before=roomOrObj.before;if(roomOrObj.limit)limit=roomOrObj.limit;
   }else{
    roomId=roomOrObj;buildId=buildIdParam;before=beforeParam;
   }
   if(!roomId||!buildId)throw Error('Invalid chat room or build.');
   if(before===undefined)activeScope={roomId,buildId};
   const params=new URLSearchParams({roomId,buildId,limit:String(limit)});
   if(before!==undefined&&before!==null)params.set('before',String(before));
   const page=await apiFetch(`/review-api/chat/messages?${params}`);
   trackMessages(roomId,buildId,page.messages||[]);
   return page;
  },
  getMessage(messageId){
   return apiFetch(`/review-api/chat/messages/${encodeURIComponent(messageId)}`);
  },
  async send(input){
   const message=await apiFetch('/review-api/chat/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(input)
   });
   trackMessages(message.roomId,message.buildId,[message]);
   emit({kind:'message',roomId:message.roomId,buildId:message.buildId,messageId:message.id});
   return message;
  },
  async react(messageId,emoji){
   const message=await apiFetch(`/review-api/chat/messages/${encodeURIComponent(messageId)}/react`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({emoji})
   });
   trackMessages(message.roomId,message.buildId,[message]);
   emit({kind:'reaction',roomId:message.roomId,buildId:message.buildId,messageId:message.id});
   return message;
  },
  async vote(buildIdOrObj,decisionParam){
   let buildId,decision;
   if(typeof buildIdOrObj==='object'&&buildIdOrObj!==null){
    buildId=buildIdOrObj.buildId;decision=buildIdOrObj.decision;
   }else{
    buildId=buildIdOrObj;decision=decisionParam;
   }
   const votes=await apiFetch('/review-api/chat/votes',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({buildId,decision})
   });
   votesByBuild.set(buildId,votes);
   emit({kind:'review',buildId});
   return votes;
  },
  async read(roomOrObj,buildIdParam,sequenceParam){
   let roomId,buildId,sequence;
   if(typeof roomOrObj==='object'&&roomOrObj!==null){
    roomId=roomOrObj.roomId;buildId=roomOrObj.buildId;sequence=roomOrObj.sequence;
   }else{
    roomId=roomOrObj;buildId=buildIdParam;sequence=sequenceParam;
   }
   if(!roomId||!buildId)return;
   if(!unreadState[roomId])unreadState[roomId]={};
   unreadState[roomId][buildId]=0;
   emit({kind:'build'});
   if(typeof sequence==='number'&&Number.isFinite(sequence)){
    await apiFetch('/review-api/chat/read',{
     method:'POST',
     headers:{'Content-Type':'application/json'},
     body:JSON.stringify({roomId,buildId,sequence})
    }).catch(()=>{});
   }
  },
  async attach(file,{roomId=activeScope.roomId,buildId=activeScope.buildId}={}){
   if(!file||!MIME_TYPES.has(file.type))throw Error('Choose a PNG, JPEG, WebP or GIF screenshot.');
   if(file.size>MAX_ATTACHMENT_BYTES)throw Error('Each screenshot must be smaller than 5 MB.');
   const params=new URLSearchParams({
    roomId,
    buildId,
    name:file.name||'screenshot.png',
    type:file.type
   });
   return apiFetch(`/review-api/chat/attachments?${params}`,{
    method:'POST',
    headers:{'Content-Type':file.type},
    body:file
   });
  },
  async attachmentURL(attachment){
   if(!attachment||!attachment.id)return '';
   if(blobURLs.has(attachment.id))return blobURLs.get(attachment.id);
   const response=await apiFetch(`/review-api/chat/attachments/${encodeURIComponent(attachment.id)}`);
   const blob=await response.blob();
   const url=URL.createObjectURL(blob);
   blobURLs.set(attachment.id,url);
   return url;
  },
  releaseURLs(){
   for(const url of blobURLs.values())URL.revokeObjectURL(url);
   blobURLs.clear();
  },
  subscribe(fn){
   listeners.add(fn);
   startPolling();
   return ()=>{
    listeners.delete(fn);
    if(listeners.size===0)stopPolling();
   };
  }
 };
}

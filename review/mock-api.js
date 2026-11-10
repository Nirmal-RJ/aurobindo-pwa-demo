import {publicGames,generalDiscussionId} from './public-games.js';
import {reactionEmojis} from './reactions.js';
import {accounts, rooms, seedState} from './mock-data.js';
import {development} from './config.js';
/** @typedef {import('./contracts').ReviewAPI} ReviewAPI */
const KEY='qc-review-demo-v1', DB='qc-review-demo-attachments';
const clone=value=>structuredClone(value);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const id=()=>crypto.randomUUID?.()||`local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
function openDB(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Screenshot storage is unavailable in this browser.'));});}
async function blobStore(mode, key, value){const db=await openDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('files',mode),store=tx.objectStore('files');let result;const request=mode==='readonly'?store.get(key):key===null?store.clear():store.put(value,key);request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(Error('Could not save screenshots. Browser storage may be full.'));});}finally{db.close();}}
/** @returns {ReviewAPI} */
export function createMockAPI({viewerRole}={}){
 let state;try{state=JSON.parse(localStorage.getItem(KEY));}catch{}if(state?.schema!==1)state=seedState();
 // One-time removal of known shipped sample messages; user-created UUID messages survive.
 if(!state.emptyStartV1){
  state.messages=state.messages.filter(m=>!(/^(global-(?:[0-9]|[12][0-9]|3[0-7])|rc-[0-6])$/.test(m.id)));
  state.emptyStartV1=true;
 }
 // Add missing public games to existing demo saves without resetting conversations/votes.
 for(const game of publicGames)if(!state.builds.some(b=>b.gameId===game.id))state.builds.push({id:game.defaultBuildId,gameId:game.id,gameName:game.name,version:'Review build A',createdAt:new Date().toISOString()});
 state.messages.forEach(m=>{delete m.feedbackStatus;for(const emoji of Object.keys(m.reactions||{}))if(!reactionEmojis.includes(emoji))delete m.reactions[emoji];});delete state.approvals;delete state.config;const listeners=new Set(),urls=new Map();let failNext=false;
 if(viewerRole){if(!['ghost','director'].includes(viewerRole))throw Error('This account cannot open the review preview.');if(!accounts.some(a=>a.id===state.accountId&&a.role===viewerRole))state.accountId=accounts.find(a=>a.role===viewerRole).id;}
 const me=()=>accounts.find(a=>a.id===state.accountId)||accounts[0];
 const permit=room=>{if(!['global','rc'].includes(room)||room==='rc'&&me().role!=='ghost')throw Error('This demo account cannot open that room.');};
 const build=id=>{if(!state.builds.some(b=>b.id===id))throw Error('Build not found.');};
 const scope=id=>{if(id!==generalDiscussionId)build(id);};
 const message=id=>{const m=state.messages.find(m=>m.id===id);if(!m)throw Error('Message no longer available.');permit(m.roomId);return m;};
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{throw Error('Demo storage is full or unavailable. Free browser storage and retry.');}}
 function emit(event){for(const fn of listeners)fn(event);}
 function commit(event){save();emit(event);}
 // A reload interrupted a send: expose Retry instead of an endless sending spinner.
 state.messages.forEach(m=>{if(m.delivery==='sending')m.delivery='failed';});save();
 const page=(room,buildId,before=Infinity,limit=12)=>{permit(room);scope(buildId);const all=state.messages.filter(m=>m.roomId===room&&m.buildId===buildId&&m.sequence<before).sort((a,b)=>a.sequence-b.sequence);const selected=all.slice(-limit);return clone({messages:selected,hasOlder:all.length>selected.length,cursor:selected[0]?.sequence});};
 async function deliver(m,fail){await pause(650);m.delivery=fail?'failed':'sent';try{commit({kind:'delivery',roomId:m.roomId,buildId:m.buildId,messageId:m.id});}catch{m.delivery='failed';emit({kind:'delivery',roomId:m.roomId,buildId:m.buildId,messageId:m.id});}}
 const api={
  accounts:()=>clone(accounts),currentAccount:()=>clone(me()),
  switchAccount(accountId){if(!accounts.some(a=>a.id===accountId&&(!viewerRole||a.role===viewerRole)))throw Error('This demo participant is not available for your review role.');state.accountId=accountId;save();},
  rooms:()=>clone(rooms.filter(r=>r.id!=='rc'||me().role==='ghost')),builds:()=>publicGames.flatMap(game=>clone(state.builds.filter(b=>b.gameId===game.id).map(b=>({...b,gameName:game.name})))),
  async listMessages(room,buildId,before,limit){return page(room,buildId,before,limit);},
  async getMessage(messageId){return clone(message(messageId));},
  async send(input){
   permit(input.roomId);scope(input.buildId);if(!input.text.trim()&&!input.attachments.length&&!input.reference)throw Error('Write a message or attach a screenshot.');if(input.text.length>6000)throw Error('Messages can contain up to 6,000 characters.');
   if(input.replyTo){const parent=message(input.replyTo);if(parent.roomId!==input.roomId||parent.buildId!==input.buildId)throw Error('Reply must belong to this room and build.');}
   if(input.reference){if(me().role!=='ghost'||input.roomId!=='rc')throw Error('Only ghosts can discuss Global messages internally.');const original=message(input.reference.messageId);if(original.roomId!=='global'||original.buildId!==input.buildId)throw Error('Invalid original message.');}
   const m={...clone(input),id:id(),authorId:me().id,createdAt:new Date().toISOString(),sequence:++state.sequence,reactions:{},delivery:'sending'};
   state.messages.push(m);try{commit({kind:'message',roomId:m.roomId,buildId:m.buildId,messageId:m.id});}catch(e){state.messages.pop();throw e;}
   const fail=failNext;failNext=false;void deliver(m,fail);return clone(m);
  },
  async retry(messageId){const m=message(messageId);if(m.authorId!==me().id||m.delivery!=='failed')throw Error('Only your failed messages can be retried.');m.delivery='sending';commit({kind:'delivery',roomId:m.roomId,buildId:m.buildId,messageId:m.id});const fail=failNext;failNext=false;void deliver(m,fail);},
  async attach(file){if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type))throw Error('Choose a PNG, JPEG, WebP or GIF screenshot.');if(file.size>5*1024*1024)throw Error('Each screenshot must be smaller than 5 MB.');const attachment={id:id(),name:file.name,type:file.type,size:file.size};await blobStore('readwrite',attachment.id,{bytes:await file.arrayBuffer(),type:file.type});return attachment;},
  async attachmentURL(attachment){if(attachment.seedUrl)return attachment.seedUrl;if(urls.has(attachment.id))return urls.get(attachment.id);const stored=await blobStore('readonly',attachment.id);if(!stored)throw Error('Screenshot not found in this browser.');const blob=stored instanceof Blob?stored:new Blob([stored.bytes],{type:stored.type});const url=URL.createObjectURL(blob);urls.set(attachment.id,url);return url;},
  releaseURLs(){for(const url of urls.values())URL.revokeObjectURL(url);urls.clear();},
  async react(messageId,emoji){if(!reactionEmojis.includes(emoji))return;const m=message(messageId),list=m.reactions[emoji]||[];m.reactions[emoji]=list.includes(me().id)?list.filter(a=>a!==me().id):[...list,me().id];commit({kind:'reaction',roomId:m.roomId,buildId:m.buildId,messageId:m.id});},
  async vote(buildId,decision){build(buildId);if(!['approve','changes'].includes(decision))throw Error('Invalid vote.');state.votes=state.votes.filter(v=>v.buildId!==buildId||v.accountId!==me().id);state.votes.push({buildId,accountId:me().id,decision,createdAt:new Date().toISOString()});commit({kind:'review',buildId});},
  votes:buildId=>clone(state.votes.filter(v=>v.buildId===buildId)),
  unread(room,buildId){permit(room);const last=state.read[`${me().id}:${room}:${buildId}`]||0;return state.messages.filter(m=>m.roomId===room&&m.buildId===buildId&&m.sequence>last&&m.authorId!==me().id&&m.delivery==='sent').length;},
  read(room,buildId,sequence){permit(room);const key=`${me().id}:${room}:${buildId}`;state.read[key]=Math.max(state.read[key]||0,sequence);save();},
  subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
  failNext(){if(development)failNext=true;},
  async simulateIncoming(room,buildId){if(!development)return;permit(room);scope(buildId);const other=accounts.find(a=>a.id!==me().id&&(room!=='rc'||a.role==='ghost'));const m={id:id(),roomId:room,buildId,authorId:other.id,text:'New demo update: I have completed another review pass. Can you check this build?',createdAt:new Date().toISOString(),sequence:++state.sequence,attachments:[],reactions:{},delivery:'sent'};state.messages.push(m);commit({kind:'message',roomId:room,buildId,messageId:m.id});},
  async addBuild(gameId,version){if(!development)throw Error('Development setting only.');const game=publicGames.some(g=>g.id===gameId)&&state.builds.find(b=>b.gameId===gameId);if(!game||!version.trim()||version.length>40)throw Error('Enter a build/version name of 1–40 characters.');if(state.builds.some(b=>b.gameId===gameId&&b.version===version.trim()))throw Error('That build already exists.');const item={...game,id:id(),version:version.trim(),createdAt:new Date().toISOString()};state.builds.unshift(item);commit({kind:'build',buildId:item.id});return clone(item);},
  async reset(){if(!development)throw Error('Development setting only.');api.releaseURLs();await blobStore('readwrite',null);localStorage.removeItem(KEY);localStorage.removeItem('qc-review-drafts-v1');location.reload();}
 };
 return api;
}

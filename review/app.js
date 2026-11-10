import {icon} from './icons.js';
import {reactionEmojis,reactionLabels} from './reactions.js';
import {reviewSession} from './session.js';
import {createDraftStore} from './drafts.js';
import {messageGestures,messageKeys} from './interactions.js';
import {openImageViewer} from './image-viewer.js';
import {publicGames,generalDiscussionId} from './public-games.js';
import {discussionCard} from './directory.js';
import {createReviewAPI} from './api.js';
import {development} from './config.js';
import {el,button,avatar,time,date,messageCard,referenceCard,attachment} from './components.js';
/** @typedef {import('./contracts').Message} Message */
const api=createReviewAPI(),$=selector=>document.querySelector(selector);
const signedInAccount=reviewSession.current().account;
const accounts=api.accounts();let account=api.currentAccount(),room=(new URLSearchParams(location.search).get('room')==='rc'&&account.role==='ghost'?'rc':'global'),buildId=(api.builds().find(b=>b.id==='blast-30')||api.builds()[0]).id;
let loaded=[],hasOlder=false,replyTo=null,pending=[],busyFiles=false,loadToken=0,newCount=0,refreshQueue=Promise.resolve();
let pinnedToBottom=true,screen='directory';
const directoryScroll=new Map(),drafts=createDraftStore();
let draftReady=false,draftTimer=0,attachmentJob=0,submitJob=0,isSubmitting=false;
const observers=new Set(),modal=$('#modal'),scroller=$('#messages');
const context=()=>({api,accounts,account,loaded,builds:api.builds(),observers,preview,original,jump,reply,discuss,actions:messageActions,reactionDetails,run});
const nearBottom=()=>scroller.scrollHeight-scroller.scrollTop-scroller.clientHeight<100;
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,4500);}
async function run(fn){try{return await fn();}catch(e){toast(e.message);}}
function stopObservers(){for(const observer of observers)observer.disconnect();observers.clear();}
function viewport(){const pinned=screen==='chat'&&pinnedToBottom,v=window.visualViewport;document.documentElement.style.setProperty('--app-height',`${v?.height||innerHeight}px`);document.documentElement.style.setProperty('--app-top',`${v?.offsetTop||0}px`);if(pinned)requestAnimationFrame(bottom);}
window.visualViewport?.addEventListener('resize',viewport);window.visualViewport?.addEventListener('scroll',viewport);window.addEventListener('resize',viewport);viewport();
function showModal(content,cls=''){modal.setAttribute('aria-label',content.querySelector('h2')?.textContent||'Dialog');modal.className=cls;$('#modal-content').replaceChildren(content);modal.showModal();}
async function preview(item,gallery=[]){await run(()=>openImageViewer(item,gallery,a=>api.attachmentURL(a)));}

modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});
function selectedTopic(){return buildId===generalDiscussionId?{id:generalDiscussionId,gameName:'General Discussion',version:''}:api.builds().find(b=>b.id===buildId);}
function targets(){const builds=api.builds();return publicGames.map(game=>({game,scopeId:builds.find(b=>b.gameId===game.id).id}));}
function roomUnread(id){return [...targets().map(t=>t.scopeId),generalDiscussionId].reduce((n,scopeId)=>n+api.unread(id,scopeId),0);}
function renderNav(){
 if(document.body.dataset.space!==room)document.body.dataset.space=room;const internal=room==='rc';
 const spaceLabel=internal?'RC / Ghost testers':'Global / Shared team review';if($('#space-badge').textContent!==spaceLabel)$('#space-badge').textContent=spaceLabel;
 $('#chat-space-note').textContent=internal?'Ghost testers only':'Shared team review';
 $('#chat-room').setAttribute('aria-label',internal?'RC, ghost testers only':'Global, shared team review');
 const accountSelect=$('#account');if(!accountSelect.options.length)for(const a of accounts.filter(a=>a.role===signedInAccount.role)){const option=el('option','',`${a.name} (${a.role})`);option.value=a.id;accountSelect.append(option);}accountSelect.value=account.id;
 const rooms=$('#rooms'),available=api.rooms();
 if([...rooms.children].map(b=>b.dataset.room).join()!==available.map(r=>r.id).join()){
  rooms.replaceChildren();for(const item of available){const b=button('',()=>showDirectory(item.id),'room-button');b.dataset.room=item.id;b.append(el('span','room-symbol',item.id==='global'?'\u25ce':'\u25c8'),el('span','room-name',item.name),el('span','unread'));rooms.append(b);}
 }
 for(const b of rooms.children){const active=b.dataset.room===room;b.classList.toggle('selected',active);b.setAttribute('aria-current',active?'page':'false');const count=roomUnread(b.dataset.room),badge=b.querySelector('.unread');badge.textContent=String(count);badge.hidden=!count;}

 $('#all-discussions').hidden=screen!=='chat';
 $('#new-build').disabled=screen!=='chat'||buildId===generalDiscussionId;
 $('#incoming').disabled=screen!=='chat';$('#fail-send').disabled=screen!=='chat';
 const selected=api.rooms().find(r=>r.id===room),topic=selectedTopic(),art=$('#chat-topic-art'),artKey=buildId===generalDiscussionId?'general':topic.gameId;
 if(art.dataset.topic!==artKey){art.replaceChildren();art.dataset.topic=artKey;const game=publicGames.find(g=>g.id===artKey);if(game){const image=el('img');image.src=game.image;image.alt='';art.append(image);}else art.append(el('span','general-topic-icon','...'));}
 $('#chat-room').textContent=selected.name;$('#room-title').textContent=topic.gameName;
 $('#room-description').textContent=buildId===generalDiscussionId?'Team updates and open conversation.':selected.description;
 $('#back-to-discussions').setAttribute('aria-label',`Back to ${selected.name} discussions`);
 $('#message').placeholder=buildId===generalDiscussionId?'Message General Discussion...':`Share feedback about ${topic.gameName}...`;
 $('#review-toggle').hidden=buildId===generalDiscussionId;
}
function renderDirectory(){
 const selected=api.rooms().find(r=>r.id===room),rc=room==='rc';
 $('#directory-kicker').textContent=rc?'GHOST TESTERS':'TEAM REVIEW';
 $('#directory-title').textContent=`${selected.name} discussions`;
 $('#directory-description').textContent=rc?'A focused space for ghost testers. Choose a game or General Discussion.':'Choose a game to review together, or join General Discussion.';
 $('#directory-count').textContent=`${publicGames.length+1} discussions`;
 const focused=document.activeElement?.closest('.discussion-card')?.dataset.discussion,grid=$('#discussion-grid');grid.replaceChildren();
 for(const item of [{game:null,scopeId:generalDiscussionId},...targets().reverse()])grid.append(discussionCard({...item,room,unread:api.unread(room,item.scopeId),onOpen:id=>{directoryScroll.set(room,$('#discussion-directory').scrollTop);switchChat(room,id);}}));
 if(focused)grid.querySelector(`[data-discussion="${focused}"]`)?.focus({preventScroll:true});
}
function routeFor(id,scopeId){if(!scopeId)return `#/${id}`;if(scopeId===generalDiscussionId)return `#/${id}/general`;const b=api.builds().find(b=>b.id===scopeId);return `#/${id}/game/${b.gameId}`;}
function recordRoute(id,scopeId,replace=false){const hash=routeFor(id,scopeId),state={scopeId:scopeId||null};if(location.hash!==hash||history.state?.scopeId!==state.scopeId)history[replace?'replaceState':'pushState'](state,'',hash);}
function showDirectory(nextRoom,record=true){
 persistDraft();draftReady=false;attachmentJob++;submitJob++;busyFiles=false;isSubmitting=false;
 if(!api.rooms().some(r=>r.id===nextRoom))nextRoom='global';
 if(screen==='directory')directoryScroll.set(room,$('#discussion-directory').scrollTop);
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());room=nextRoom;screen='directory';loadToken++;loaded=[];hasOlder=false;replyTo=null;pending=[];$('#message').value='';
 stopObservers();scroller.replaceChildren();api.releaseURLs();renderDraft();modal.close();
 $('.workspace').dataset.view='directory';$('.conversation').hidden=true;$('#review-panel').hidden=true;$('#review-panel').classList.remove('open');$('#review-toggle').setAttribute('aria-expanded','false');$('#discussion-directory').hidden=false;
 if(record)recordRoute(room);renderNav();renderDirectory();
 requestAnimationFrame(()=>{$('#discussion-directory').scrollTop=directoryScroll.get(room)||0;$('#directory-title').focus({preventScroll:true});});
}
function applyRoute(){
 const parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean),requested=parts[0]||(new URLSearchParams(location.search).get('room')==='rc'?'rc':'global');
 const allowed=api.rooms().some(r=>r.id===requested);if(!allowed){recordRoute('global',null,true);showDirectory('global',false);return;}
 if(parts[1]==='general'){switchChat(requested,generalDiscussionId,false);return;}
 if(parts[1]==='game'){
  const game=publicGames.find(g=>g.id===parts[2]),saved=api.builds().find(b=>b.id===history.state?.scopeId&&b.gameId===game?.id),latest=api.builds().find(b=>b.gameId===game?.id);
  if(latest){switchChat(requested,(saved||latest).id,false);return;}
 }
 recordRoute(requested,null,true);showDirectory(requested,false);
}
let routing=false;function routeChanged(){if(routing)return;routing=true;queueMicrotask(()=>{routing=false;applyRoute();});}
window.addEventListener('popstate',routeChanged);window.addEventListener('hashchange',routeChanged);
$('#back-to-discussions').onclick=()=>showDirectory(room);
$('#all-discussions').onclick=()=>showDirectory(room);

function renderReview(){
 const root=$('#review-content'),votersOpen=root.querySelector('.voters')?.open,focusAction=root.contains(document.activeElement)?document.activeElement.dataset.reviewAction:null;root.replaceChildren();if(buildId===generalDiscussionId)return;const build=api.builds().find(b=>b.id===buildId);
 const header=el('header','review-summary-header');header.append(el('span','eyebrow','REVIEW & VOTES'),el('h2','',build.gameName),el('span','version-pill',build.version));root.append(header,el('p','review-intro','Share your feedback on this game.'));
 const votes=api.votes(buildId),mine=votes.find(v=>v.accountId===account.id),buttons=el('div','vote-buttons');buttons.setAttribute('aria-label','Your vote');
 for(const [decision,label] of [['approve','Approve'],['changes','Changes requested']]){const selected=mine?.decision===decision,b=button('',()=>run(()=>api.vote(buildId,decision)),selected?'chosen':'');b.dataset.reviewAction=decision;b.setAttribute('aria-label',`${decision==='approve'?'\u2713':'\u21ba'} ${label}`);b.setAttribute('aria-pressed',String(selected));b.append(el('span','vote-label',label));if(selected){const badge=el('span','vote-selected','Selected');badge.setAttribute('aria-hidden','true');b.append(badge);}buttons.append(b);}root.append(buttons);
 const counts=el('div','vote-totals');counts.append(el('span','',`${votes.filter(v=>v.decision==='approve').length} approve`),el('span','',`${votes.filter(v=>v.decision==='changes').length} request changes`));root.append(counts);
 const detail=el('details','voters');detail.open=!!votersOpen;detail.append(el('summary','',`Voter details (${votes.length})`));const voterList=el('div','voter-grid');
 for(const [decision,label] of [['approve','Approved'],['changes','Changes requested']]){const group=el('section',`voter-group voter-group-${decision}`),members=votes.filter(v=>v.decision===decision),heading=el('h3','',label);heading.append(el('span','voter-group-count',String(members.length)));group.append(heading);const list=el('ul','voter-names');for(const vote of members){const person=accounts.find(a=>a.id===vote.accountId);if(person)list.append(el('li','voter',person.name));}if(!members.length)group.append(el('p','voter-empty','No votes yet'));else group.append(list);voterList.append(group);}detail.append(voterList);root.append(detail);
 if(focusAction)root.querySelector(`[data-review-action="${focusAction}"]`)?.focus({preventScroll:true});
}
function renderMessages(){
 const active=document.activeElement,focused=active?.closest('.message'),focusId=focused?.id,focusAction=active?.dataset.action;
 stopObservers();const fragment=document.createDocumentFragment();
 if(hasOlder){const older=button('Load older messages',()=>loadOlder(),'load-older');fragment.append(older);}
 if(!loaded.length){const empty=el('div','empty-state');empty.append(el('span','empty-symbol','✦'),el('h3','',buildId===generalDiscussionId?'Start the conversation':'Start the review'),el('p','','No messages here yet. Share a screenshot or start the conversation.'));fragment.append(empty);}
 let lastDate='';for(const message of loaded){const day=date(message.createdAt);if(day!==lastDate){fragment.append(el('div','date-separator',day));lastDate=day;}fragment.append(messageCard(message,context()));}scroller.replaceChildren(fragment);renderReview();if(focusId&&!document.querySelector('dialog[open]')){const row=document.getElementById(focusId);(focusAction?row?.querySelector(`[data-action="${CSS.escape(focusAction)}"]`)||row:row)?.focus({preventScroll:true});}
}
function markRead(){if(screen!=='chat'||document.hidden||!nearBottom()||!loaded.length)return;api.read(room,buildId,Math.max(...loaded.map(m=>m.sequence)));newCount=0;$('#new-messages').hidden=true;renderNav();}
function bottom(){pinnedToBottom=true;scroller.scrollTop=scroller.scrollHeight;markRead();}
function captureChatRequest(){return {accountId:account.id,roomId:room,buildId,version:loadToken};}
function isCurrentChatRequest(request){const authenticated=reviewSession.current()?.account;return authenticated?.id===signedInAccount.id&&authenticated?.role===signedInAccount.role&&screen==='chat'&&request.accountId===account.id&&request.accountId===api.currentAccount().id&&request.roomId===room&&request.buildId===buildId&&request.version===loadToken;}
async function switchChat(nextRoom,nextBuild,record=true){
 persistDraft();draftReady=false;attachmentJob++;submitJob++;busyFiles=false;isSubmitting=false;
 if(!api.rooms().some(r=>r.id===nextRoom))nextRoom='global';document.querySelectorAll('dialog[open]').forEach(d=>d.close());room=nextRoom;buildId=nextBuild;screen='chat';$('.workspace').dataset.view='chat';$('.workspace').dataset.general=String(buildId===generalDiscussionId);$('#discussion-directory').hidden=true;$('.conversation').hidden=false;$('#review-panel').hidden=buildId===generalDiscussionId;$('#review-panel').classList.remove('open');$('#review-toggle').setAttribute('aria-expanded','false');if(record)recordRoute(room,buildId);const current=++loadToken;replyTo=null;pending=[];$('#message').value='';renderDraft();renderNav();scroller.replaceChildren(el('p','empty-state','Loading local messages…'));newCount=0;$('#new-messages').hidden=true;
 loaded=[];hasOlder=false;const request=captureChatRequest();
 const page=await api.listMessages(request.roomId,request.buildId);if(!isCurrentChatRequest(request))return;loaded=page.messages;hasOlder=page.hasOlder;renderMessages();await restoreDraft(current);if(isCurrentChatRequest(request))requestAnimationFrame(()=>{if(isCurrentChatRequest(request))bottom();});
}
async function loadOlder(){const request=captureChatRequest(),first=loaded[0]?.sequence,height=scroller.scrollHeight,top=scroller.scrollTop;const b=scroller.querySelector('.load-older');if(b)b.disabled=true;await run(async()=>{const page=await api.listMessages(request.roomId,request.buildId,first);if(!isCurrentChatRequest(request))return;loaded=[...page.messages,...loaded];hasOlder=page.hasOlder;renderMessages();scroller.scrollTop=top+(scroller.scrollHeight-height);});}
async function refresh(event){
 if(screen==='directory'){renderNav();renderDirectory();return;}
 if(event.kind==='build'){renderNav();renderReview();return;}
 if(event.roomId&&event.roomId!==room||event.buildId&&event.buildId!==buildId){renderNav();return;}
 if(!event.roomId){renderReview();return;}
 const request=captureChatRequest(),wasBottom=nearBottom(),top=scroller.scrollTop;
 const isNew=event.kind==='message';
 let response;
 try{response=isNew?[await api.getMessage(event.messageId)]:await Promise.all(loaded.map(m=>api.getMessage(m.id)));}
 catch(error){if(!isCurrentChatRequest(request))return;throw error;}
 // Never mutate the active list until identity, scope and request version match.
 if(!isCurrentChatRequest(request))return;
 if(response.some(m=>m.roomId!==request.roomId||m.buildId!==request.buildId))return;
 loaded=isNew?[...loaded,...response.filter(m=>!loaded.some(existing=>existing.id===m.id))]:response;
 renderMessages();if(event.kind==='delivery'){const m=loaded.find(m=>m.id===event.messageId);if(m?.authorId===account.id)$('#chat-status').textContent=m.delivery==='failed'?'Message not sent. Retry is available.':m.delivery==='sent'?'Message sent.':'Sending message.';}
 if(wasBottom){bottom();}else{scroller.scrollTop=top;if(isNew){newCount++;$('#new-messages').textContent=`${newCount} new message${newCount===1?'':'s'} ↓`;$('#new-messages').hidden=false;}}renderNav();
}
api.subscribe(event=>{refreshQueue=refreshQueue.then(()=>refresh(event)).catch(e=>toast(e.message));});
scroller.addEventListener('scroll',()=>{pinnedToBottom=nearBottom();if(pinnedToBottom)markRead();},{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)markRead();});
$('#new-messages').onclick=bottom;
$('#account').onchange=()=>{persistDraft();draftReady=false;api.switchAccount($('#account').value);account=api.currentAccount();modal.close();showDirectory('global');};
$('#profile-link').onclick=event=>{persistDraft();const url=new URL('./profile.html',location.href);url.searchParams.set('return',location.pathname+location.search+location.hash);event.currentTarget.href=url;};

function draftKey(){return `${account.id}:${room}:${buildId}`;}
function persistDraft(){clearTimeout(draftTimer);if(screen!=='chat'||!draftReady)return;try{drafts.save(draftKey(),{text:$('#message').value,attachments:pending,replyTo:replyTo?.id||null});$('#draft-saved').hidden=!($('#message').value.trim()||pending.length||replyTo);}catch{$('#draft-saved').hidden=true;}}
function queueDraft(){clearTimeout(draftTimer);$('#draft-saved').hidden=true;draftTimer=setTimeout(persistDraft,200);}
async function restoreDraft(token){const saved=drafts.load(draftKey());if(saved){$('#message').value=saved.text||'';pending=(saved.attachments||[]).slice(0,4);if(saved.replyTo){try{const parent=await api.getMessage(saved.replyTo);if(token!==loadToken)return;if(parent.roomId===room&&parent.buildId===buildId)replyTo=parent;}catch{}}}if(token!==loadToken)return;draftReady=true;renderDraft();$('#draft-saved').hidden=!saved;}
function reply(message){replyTo=message;renderDraft();queueDraft();$('#message').focus();$('#chat-status').textContent=`Replying to ${accounts.find(a=>a.id===message.authorId).name}`;}
function renderDraft(){
 const root=$('#draft-context');root.replaceChildren();if(replyTo){const label=el('div','draft-reply'),cancel=button('',()=>{replyTo=null;renderDraft();queueDraft();$('#message').focus();},'icon-button');cancel.setAttribute('aria-label','Cancel reply');cancel.append(icon('close'));label.append(el('span','',`Replying to ${accounts.find(a=>a.id===replyTo.authorId).name}: ${replyTo.text.slice(0,100)||'Screenshot'}`),cancel);root.append(label);}
 const images=$('#draft-attachments');images.replaceChildren();for(const item of pending){const card=el('div','draft-file'),remove=button('Remove',()=>{pending=pending.filter(a=>a.id!==item.id);renderDraft();queueDraft();});remove.setAttribute('aria-label',`Remove screenshot ${item.name}`);card.append(attachment(item,context(),pending),remove);images.append(card);}resizeInput();
}
function syncComposer(){const text=$('#message').value;$('#send').disabled=busyFiles||isSubmitting||(!text.trim()&&!pending.length);$('#attachments').disabled=busyFiles;$('#attachment-status').textContent=busyFiles?'Preparing screenshots...':'';$('#character-count').textContent=`${text.length} / 6000`;$('#character-count').hidden=text.length<5400;}
function resizeInput(){const input=$('#message');input.style.height='auto';input.style.height=`${Math.min(input.scrollHeight,120)}px`;syncComposer();}
const touchInput=()=>matchMedia('(pointer: coarse)').matches;
function updateComposerHint(){$('#composer-hint').textContent=touchInput()?'Return for a new line · Tap Send':'Enter to send · Shift + Enter for a new line';}
updateComposerHint();matchMedia('(pointer: coarse)').addEventListener('change',updateComposerHint);
$('#message').addEventListener('input',()=>{resizeInput();queueDraft();});
$('#message').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing&&!e.shiftKey&&(!touchInput()||e.ctrlKey||e.metaKey)){e.preventDefault();$('#composer').requestSubmit();}});
async function attachFiles(files){if(!files.length||screen!=='chat')return;if(pending.length+files.length>4){toast('Attach up to four screenshots per message.');return;}if(busyFiles)return;const job=++attachmentJob,token=loadToken;busyFiles=true;syncComposer();for(const file of files){try{const item=await api.attach(file);if(job!==attachmentJob||token!==loadToken)return;pending.push(item);}catch(e){toast(e.message);}}if(job===attachmentJob&&token===loadToken){busyFiles=false;renderDraft();queueDraft();}}
$('#attachments').onchange=e=>{const files=[...e.target.files];e.target.value='';attachFiles(files);};
$('#message').addEventListener('paste',e=>{const files=[...(e.clipboardData?.files||[])];if(files.length){e.preventDefault();attachFiles(files);}});
let dragDepth=0;const conversation=$('.conversation');
conversation.addEventListener('dragenter',e=>{if([...e.dataTransfer.types].includes('Files')){e.preventDefault();dragDepth++;$('#drop-hint').hidden=false;}});
conversation.addEventListener('dragover',e=>{if([...e.dataTransfer.types].includes('Files')){e.preventDefault();e.dataTransfer.dropEffect='copy';}});
conversation.addEventListener('dragleave',()=>{if(--dragDepth<=0){dragDepth=0;$('#drop-hint').hidden=true;}});
conversation.addEventListener('drop',e=>{if([...e.dataTransfer.types].includes('Files')){e.preventDefault();dragDepth=0;$('#drop-hint').hidden=true;attachFiles([...e.dataTransfer.files]);}});
$('#composer').onsubmit=async e=>{e.preventDefault();if(busyFiles||isSubmitting)return;const text=$('#message').value;if(!text.trim()&&!pending.length)return;const key=draftKey(),job=++submitJob,input={roomId:room,buildId,text,attachments:[...pending],...(replyTo?{replyTo:replyTo.id}:{})};isSubmitting=true;syncComposer();await run(async()=>{if($('#fail-send').checked){api.failNext();$('#fail-send').checked=false;}await api.send(input);drafts.remove(key);if(draftKey()===key&&job===submitJob){if($('#message').value===text)$('#message').value='';const sent=new Set(input.attachments.map(a=>a.id));pending=pending.filter(a=>!sent.has(a.id));if(replyTo?.id===input.replyTo)replyTo=null;renderDraft();persistDraft();}});if(job===submitJob){isSubmitting=false;syncComposer();}};
async function copyMessage(message){try{await navigator.clipboard.writeText(message.text);toast('Message copied');}catch{const panel=el('div'),text=el('textarea');panel.append(el('h2','','Copy message'),el('p','muted','Select the text below and use Copy.'));text.value=message.text;text.readOnly=true;text.rows=6;panel.append(text);showModal(panel);text.focus();text.select();}}
function messageActions(message,reactionsOnly=false){
 const panel=el('div','actions-panel');let chosen=false;panel.append(el('h2','',reactionsOnly?'React to message':'Message actions'),el('p','action-excerpt',`${accounts.find(a=>a.id===message.authorId).name}: ${message.text.slice(0,160)||'Screenshot'}`));
 function choose(fn){chosen=true;modal.close();fn();}
 const reactions=el('div','action-reactions');for(const emoji of reactionEmojis){const b=button(emoji,()=>choose(()=>run(()=>api.react(message.id,emoji))));b.setAttribute('aria-label',emoji);b.title=reactionLabels[emoji];b.setAttribute('aria-pressed',String((message.reactions[emoji]||[]).includes(account.id)));reactions.append(b);}panel.append(reactions);
 if(reactionEmojis.some(emoji=>message.reactions[emoji]?.length))panel.append(button('See who reacted',()=>{chosen=true;reactionDetails(message);},'see-reactions'));
 if(!reactionsOnly){const list=el('div','action-list');const item=(label,glyph,fn)=>{const b=button('',()=>choose(fn));b.append(icon(glyph),el('span','',label));list.append(b);return b;};item('Reply','reply',()=>reply(message));const copy=item('Copy text','copy',()=>copyMessage(message));copy.disabled=!message.text;if(account.role==='ghost'&&message.roomId==='global')item('Discuss in RC','discuss',()=>discuss(message));panel.append(list);}
 panel.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;const buttons=[...panel.querySelectorAll('button:not(:disabled)')],at=buttons.indexOf(document.activeElement),to=e.key==='Home'?0:e.key==='End'?buttons.length-1:(at+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;e.preventDefault();buttons[to]?.focus();});
 showModal(panel,'action-sheet');modal.addEventListener('close',()=>{if(!chosen&&!modal.open)document.getElementById(`message-${message.id}`)?.focus({preventScroll:true});},{once:true});
}
function reactionDetails(message,selectedEmoji){
 const panel=el('div','reaction-details');panel.append(el('h2','','Who reacted'));
 const emojis=selectedEmoji?[selectedEmoji]:reactionEmojis;
 for(const emoji of emojis){if(!reactionEmojis.includes(emoji))continue;const ids=message.reactions[emoji]||[],section=el('section','reaction-group');if(!ids.length)continue;
  section.append(el('h3','',`${emoji} ${reactionLabels[emoji]} · ${ids.length}`));
  for(const id of ids){const person=accounts.find(a=>a.id===id);if(!person)continue;const row=el('div','reactor');row.append(avatar(person),el('span','',person.name));if(id===account.id)row.append(el('small','','You'));section.append(row);}panel.append(section);
 }
 if(selectedEmoji&&reactionEmojis.includes(selectedEmoji)){const mine=(message.reactions[selectedEmoji]||[]).includes(account.id);panel.append(button(mine?'Remove my reaction':`React with ${selectedEmoji}`,()=>run(async()=>{await api.react(message.id,selectedEmoji);modal.close();}),'reaction-own-action'));}
 showModal(panel,'action-sheet');
}
const messageById=id=>loaded.find(m=>m.id===id);
messageGestures(scroller,{reply:id=>{const m=messageById(id);if(m)reply(m);},actions:id=>{const m=messageById(id);if(m)messageActions(m);}});
messageKeys(scroller,{reply:id=>{const m=messageById(id);if(m)reply(m);},actions:id=>{const m=messageById(id);if(m)messageActions(m);},react:id=>{const m=messageById(id);if(m)messageActions(m,true);}});

function discuss(message){
 if(account.role!=='ghost')return;const panel=el('div','discuss-panel');panel.append(el('span','eyebrow','INTERNAL DISCUSSION'),el('h2','','Discuss in RC'),el('p','muted','Share a reference with ghost testers. Nothing is posted back to Global.'));
 const ref={roomId:'global',messageId:message.id,buildId:message.buildId,author:accounts.find(a=>a.id===message.authorId),createdAt:message.createdAt,text:message.text,attachments:message.attachments};panel.append(referenceCard(ref,context()));
 const label=el('label','field-label','Your comment'),input=el('textarea');input.id='rc-comment';input.maxLength=6000;input.rows=3;label.htmlFor=input.id;panel.append(label,input);const submit=button('Post to RC',()=>run(async()=>{if(!input.value.trim()){input.focus();toast('Add a comment for the RC discussion.');return;}submit.disabled=true;try{await api.send({roomId:'rc',buildId:message.buildId,text:input.value,attachments:[],reference:ref});modal.close();await switchChat('rc',message.buildId);}finally{submit.disabled=false;}}),'primary');panel.append(submit);showModal(panel);input.focus();
}
async function original(ref){await run(async()=>{const message=await api.getMessage(ref.messageId);modal.close();await switchChat('global',message.buildId);await jump(message.id);});}
async function jump(messageId){await run(async()=>{const target=await api.getMessage(messageId);if(screen!=='chat'||target.roomId!==room||target.buildId!==buildId)await switchChat(target.roomId,target.buildId);while(!loaded.some(m=>m.id===messageId)&&hasOlder)await loadOlder();const node=document.getElementById(`message-${messageId}`);if(node){node.scrollIntoView({block:'center'});node.classList.add('highlight');setTimeout(()=>node.classList.remove('highlight'),2400);node.tabIndex=-1;node.focus({preventScroll:true});}else toast('Original message is unavailable.');});}
const reviewDrawer=el('dialog','review-sheet'),reviewPanel=$('#review-panel');reviewDrawer.setAttribute('aria-label','Build review');document.body.append(reviewDrawer);
reviewDrawer.addEventListener('close',()=>{reviewPanel.classList.remove('open');$('.workspace').append(reviewPanel);$('#review-toggle').setAttribute('aria-expanded','false');});
$('#review-toggle').onclick=()=>{reviewDrawer.append(reviewPanel);reviewPanel.classList.add('open');$('#review-toggle').setAttribute('aria-expanded','true');reviewDrawer.showModal();$('#review-close').focus();};
$('#review-close').onclick=()=>reviewDrawer.close();
reviewDrawer.addEventListener('click',e=>{if(e.target===reviewDrawer)reviewDrawer.close();});
matchMedia('(min-width:1101px)').addEventListener('change',e=>{if(e.matches&&reviewDrawer.open)reviewDrawer.close();});
function controlsHelp(){const panel=el('div','controls-panel');panel.append(el('h2','','Keyboard & touch controls'),el('p','muted','Chat is a local frontend preview. Login uses the separate review service; messages are not shared conversations.'));const rows=[['Desktop composer','Enter sends \u00b7 Shift + Enter adds a line \u00b7 Ctrl/Cmd + Enter also sends'],['Message navigation','Focus Messages, then use arrow keys. R replies; E reacts; Shift + F10 opens actions.'],['Touch messages','Swipe a message right to reply. More opens all actions; hold the message background for the same actions. Text selection and vertical scrolling remain available.'],['Screenshots','Paste or drop images into the chat, or use Attach. In the viewer, use Fit / zoom, arrow buttons or swipe between images while fitted. Pan when zoomed; browser pinch zoom remains available.'],['Escape','Closes a dialog or cancels the reply context. Message text is preserved.'],['Drafts','Unsent text and attachment references are saved per demo account, space and topic on this browser.'],['Open controls','Ctrl/Cmd + /']];for(const [title,description] of rows){const row=el('div','control-row');row.append(el('strong','',title),el('p','',description));panel.append(row);}showModal(panel);}
$('#controls-help').onclick=controlsHelp;
$('.navigation').append($('#controls-help'));$('.brand small').textContent='Chat demo \u00b7 local only';

document.addEventListener('keydown',e=>{if(e.isComposing||e.defaultPrevented)return;if((e.ctrlKey||e.metaKey)&&e.key==='/'){e.preventDefault();if(!document.querySelector('dialog[open]'))controlsHelp();return;}if(e.key==='Escape'&&!document.querySelector('dialog[open]')&&replyTo){replyTo=null;renderDraft();queueDraft();$('#message').focus();}});
$('#back-to-discussions').replaceChildren(icon('back'));$('.attach-button>span[aria-hidden]').replaceChildren(icon('attach'));$('#send span').replaceChildren(icon('send'));$('#review-toggle').prepend(icon('review'));

$('#dev-tools').hidden=!development;
$('#incoming').onclick=()=>run(()=>api.simulateIncoming(room,buildId));
$('#new-build').onclick=()=>{if(screen!=='chat'||buildId===generalDiscussionId)return;const panel=el('div'),label=el('label','field-label','Build/version'),input=el('input');input.id='build-version';input.maxLength=40;label.htmlFor=input.id;panel.append(el('h2','','Add an empty demo build'),el('p','muted','A new build starts with no messages or votes.'),label,input,button('Create build',()=>run(async()=>{const selected=api.builds().find(b=>b.id===buildId),item=await api.addBuild(selected.gameId,input.value);modal.close();await switchChat(room,item.id);}),'primary'));showModal(panel);input.focus();};
$('#reset').onclick=()=>{const panel=el('div');panel.append(el('h2','','Reset this local demo?'),el('p','','This removes review messages, screenshots and votes from this browser. Game progress is not affected.'),button('Reset review demo',()=>run(()=>{draftReady=false;clearTimeout(draftTimer);return api.reset();}),'danger'));showModal(panel);};
window.addEventListener('pagehide',()=>{persistDraft();stopObservers();api.releaseURLs();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)persistDraft();});
const imageResize=new ResizeObserver(()=>{if(nearBottom())markRead();});imageResize.observe(scroller);
applyRoute();

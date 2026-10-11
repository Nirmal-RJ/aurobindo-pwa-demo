/* Landscape memory challenge: all feedback is deferred until the clock expires. */
(() => {
'use strict';
const $=id=>document.getElementById(id), video=$('video'), asset='assets/working-standard-game-assets/';
const portrait=matchMedia('(orientation: portrait)');
let view='intro',round=null,box='A',paused=false,last=performance.now(),videoFinished=false,briefingActive=false,instructionsOpen=false;
let scale=1,panX=0,panY=0,baseWidth=0,baseHeight=0,moved=false,gesture=null;
const pointers=new Map();
function show(id){view=id;$('app').dataset.view=id;$('bench').hidden=!round||['intro','results'].includes(id);for(const name of ['intro','cabinet','contents','tray','results'])$(name).hidden=name!==id;sizeScenes();}
function sizeScenes(){
 const rect=$('stage').getBoundingClientRect();$('app').style.setProperty('--scene-unit',rect.width/100+'px');
 const ratio=(video.videoWidth&&video.videoHeight)?video.videoWidth/video.videoHeight:16/9;
 const cabinetWidth=Math.max(rect.width,rect.height*ratio),cabinetHeight=cabinetWidth/ratio;
 const cabinet=$('cabinet-scene');
 cabinet.style.width=cabinetWidth+'px';cabinet.style.height=cabinetHeight+'px';
 cabinet.style.left=(rect.width-cabinetWidth)/2+'px';cabinet.style.top=(rect.height-cabinetHeight)/2+'px';
 // Each opened box is a full-page scene; its image, table and bottles share one coordinate space.
 for(const id of ['tray-scene','contents-scene']){const el=$(id);el.style.width=rect.width+'px';el.style.height=rect.height+'px';el.style.left='0px';el.style.top='0px';}
 baseWidth=rect.width;baseHeight=rect.height;applyZoom();
}
function applyZoom(){const w=$('stage').clientWidth,h=$('stage').clientHeight;const maxX=Math.max(0,(baseWidth*scale-w)/2),maxY=Math.max(0,(baseHeight*scale-h)/2);panX=Math.max(-maxX,Math.min(maxX,panX));panY=Math.max(-maxY,Math.min(maxY,panY));$('contents-scene').style.transform='translate('+((1-scale)*baseWidth/2+panX)+'px,'+((1-scale)*baseHeight/2+panY)+'px) scale('+scale+')';$('zoom-reset').textContent=scale.toFixed(1)+'×';$('zoom-out').disabled=scale<=1;$('zoom-in').disabled=scale>=4;}
function zoom(next){scale=Math.max(1,Math.min(4,next));applyZoom();}
function resetZoom(){scale=1;panX=panY=0;applyZoom();}
function fullscreenHelp(){tick();instructionsOpen=true;$('fullscreen-help').hidden=false;video.pause();last=performance.now();updateNotes();}
async function enterFullscreen(showHelp){
 const element=document.documentElement;
 const request=element?.requestFullscreen||element?.webkitRequestFullscreen;
 if(!request){if(showHelp)fullscreenHelp();return;}
 try{await Promise.resolve(request.call(element));if(typeof screen.orientation?.lock==='function')await screen.orientation.lock('landscape').catch(()=>{});}catch{if(showHelp)fullscreenHelp();}
}
async function fullscreen(){
 if(document.fullscreenElement||document.webkitFullscreenElement){
  const exit=document.exitFullscreen||document.webkitExitFullscreen;
  try{if(exit)await Promise.resolve(exit.call(document));screen.orientation?.unlock?.();}catch{}
 }else await enterFullscreen(true);
}
$('close-fullscreen-help').onclick=()=>{instructionsOpen=false;$('fullscreen-help').hidden=true;last=performance.now();updateNotes();playVideo();};
$('fullscreen').onclick=fullscreen;
$('how-to').onclick=()=>{tick();instructionsOpen=true;$('instructions').hidden=false;last=performance.now();video.pause();updateNotes();};
$('close-instructions').onclick=()=>{instructionsOpen=false;$('instructions').hidden=true;last=performance.now();updateNotes();playVideo();};
video.addEventListener('loadedmetadata',sizeScenes);
function playVideo(){if(paused||instructionsOpen||view!=='cabinet'||videoFinished)return;video.muted=true;video.playsInline=true;Promise.resolve(video.play()).then(()=>{$('video-recovery').hidden=true;}).catch(()=>{$('video-message').textContent='Tap to play the opening animation.';$('video-recovery').hidden=false;});}
function syncPause(){const before=paused;paused=portrait.matches||document.hidden;$('rotate').hidden=!portrait.matches;$('app').inert=portrait.matches;last=performance.now();if(paused){video.pause();}else if(before){playVideo();}}
if(portrait.addEventListener)portrait.addEventListener('change',syncPause);else portrait.addListener?.(syncPause);document.addEventListener('visibilitychange',syncPause);window.addEventListener('resize',()=>{sizeScenes();syncPause();});window.visualViewport?.addEventListener('resize',sizeScenes);window.addEventListener('orientationchange',()=>{sizeScenes();syncPause();});window.addEventListener('pagehide',()=>{paused=true;video.pause();last=performance.now();pointers.clear();gesture=null;});
function start(){round=null;videoFinished=false;briefingActive=false;instructionsOpen=false;$('game-briefing').hidden=true;$('instructions').hidden=true;$('app').dataset.video='playing';$('cabinet-still').hidden=true;$('fullscreen-help').hidden=true;$('boxes').hidden=true;$('cabinet-hint').hidden=true;$('bench').hidden=true;$('timer').hidden=true;$('recall').hidden=true;$('notes').hidden=true;$('video-recovery').hidden=true;show('cabinet');video.currentTime=0;playVideo();if(!document.fullscreenElement&&!document.webkitFullscreenElement)enterFullscreen(false);}
$('start').onclick=start;$('replay').onclick=start;$('resume-video').onclick=()=>{if(video.error){video.load();}playVideo();};
video.addEventListener('error',()=>{if(view==='cabinet'){$('video-message').textContent='The animation could not load. Tap to retry.';$('video-recovery').hidden=false;}});
video.addEventListener('ended',()=>{videoFinished=true;$('cabinet-still').hidden=false;briefingActive=true;$('app').dataset.video='ended';$('game-briefing').hidden=false;video.pause();$('video-recovery').hidden=true;$('boxes').hidden=false;$('cabinet-hint').hidden=false;round=new WorkingStandard.Round();$('targets').replaceChildren(...round.targets.map(t=>{const li=document.createElement('li');li.textContent=t.name;return li;}));$('timer').hidden=false;$('recall').hidden=false;$('recall').disabled=true;$('recall-label').textContent='One extra look';$('recall-count').textContent='1';$('recall').setAttribute('aria-label','Open Lab Notes. One extra look available.');$('bench').hidden=false;renderBench();sizeScenes();last=performance.now();updateNotes();});
function updateNotes(){
 if(!round)return;
 const open=round.noteRemaining>0&&round.phase!=='results'&&!briefingActive&&!instructionsOpen;
 const notes=$('notes');
 if(open){if(notes.hidden){notes.hidden=false;notes.dataset.open='true';}}
 else if(!notes.hidden){
  notes.dataset.open='false';
  const paper=notes.querySelector('.notes-card');
  if(paper?.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   if(!notes.hiding){notes.hiding=true;const animation=paper.animate([{transform:'translate(-50%,0) rotate(-2deg)',opacity:1},{transform:'translate(-50%,calc(100% + 50px)) rotate(5deg)',opacity:0}],{duration:280,easing:'cubic-bezier(.55,0,1,.45)'});animation.finished.then(()=>{notes.hiding=false;if(notes.dataset.open==='false')notes.hidden=true;}).catch(()=>{notes.hiding=false;});}
  }else notes.hidden=true;
 }
 $('note-count').textContent=Math.ceil(round.noteRemaining/1000)+'s';
 const blocked=open||briefingActive||instructionsOpen;
 $('stage').querySelectorAll('.view').forEach(el=>el.inert=blocked);$('bench').inert=blocked;
 $('recall').disabled=round.phase!=='playing'||round.recallUsed||blocked;
 $('recall').setAttribute('aria-disabled',String($('recall').disabled));
}
$('ready-start').onclick=()=>{if(paused)return;briefingActive=false;$('game-briefing').hidden=true;last=performance.now();updateNotes();};
$('recall').onclick=()=>{tick();if(!paused&&!instructionsOpen&&round?.recall()){$('recall-label').textContent='Extra look used';$('recall-count').textContent='0';$('recall').setAttribute('aria-label','Lab Notes. Extra look already used.');updateNotes();}};
function canPlay(){tick();return !paused&&!briefingActive&&!instructionsOpen&&round?.phase==='playing'&&round.noteRemaining===0;}

function correctedSheet(){const sheet=$('corrected-sheet');sheet.hidden=!['A','C'].includes(box);if(sheet.hidden)return;const list=WorkingStandard.bottles.filter(b=>b.box===box);const ordered=box==='A'?[...list.filter(b=>b.code.startsWith('A')),...list.filter(b=>b.code.startsWith('B')&&b.code!=='B5'&&b.code!=='B6'),list.find(b=>b.code==='B6'),list.find(b=>b.code==='B5'),...list.filter(b=>/^[CE]/.test(b.code))]:list;const half=Math.ceil(ordered.length/2);sheet.style.top=box==='A'?'20.7%':'26.5%';sheet.style.minHeight=box==='A'?'54.7%':'38.5%';sheet.innerHTML='<h2>BOX - '+box+'</h2><div class="sheet-columns"></div><p class="sheet-note">Corrected code: '+(box==='A'?'B6 · Blackberry Caramel Truffle':'M7 · Mocha Caramel Truffle')+'</p>';for(const chunk of [ordered.slice(0,half),ordered.slice(half)]){const table=document.createElement('table');table.innerHTML='<thead><tr><th>S.No</th><th>Name</th></tr></thead>';const tbody=document.createElement('tbody');for(const b of chunk){const row=document.createElement('tr');for(const text of [b.code,b.name]){const td=document.createElement('td');td.textContent=text;row.append(td);}tbody.append(row);}table.append(tbody);sheet.querySelector('.sheet-columns').append(table);}}
function openContents(value){if(!canPlay())return;box=value;$('contents-image').src=asset+'box-'+box.toLowerCase()+'-contents-page.webp';$('contents-image').alt='Box '+box+' contents and codeword meanings';correctedSheet();resetZoom();show('contents');}
for(const el of document.querySelectorAll('.box'))el.onclick=()=>openContents(el.dataset.box);
function bottleButton(b){const button=document.createElement('button');button.className='bottle';button.style.setProperty('--hue',b.hue);button.dataset.code=b.code;button.setAttribute('aria-label','Select bottle '+b.code);button.setAttribute('aria-pressed',String(round.selected.some(s=>s.code===b.code)));const img=document.createElement('img');img.src=asset+'top-view-bottle.webp';img.alt='';img.draggable=false;const text=document.createElement('span');text.textContent=b.code;button.append(img,text);button.onclick=()=>{if(!canPlay())return;if(round.select(b.code)){const from=button.getBoundingClientRect();renderBench();animatePickup(from,b,round.selected.length-1);renderBottles();if(round.selected.length<3)$('status').textContent='Bottle '+b.code+' collected. '+(3-round.selected.length)+' more to find.';}else if(round.selected.length===3){$('status').textContent='Bench ready — check your selections or remove a bottle to replace it.';}};return button;}
function renderBottles(entering=false){$('bottles').replaceChildren(...round.layouts[box].map((b,i)=>{const button=bottleButton(b);if(entering&&!matchMedia('(prefers-reduced-motion: reduce)').matches)button.style.animation='bottle-arrive .35s '+Math.min(i*12,280)+'ms cubic-bezier(.2,.8,.2,1) both';return button;}));}
function openTray(){if(!canPlay())return;resetZoom();renderBottles(true);$('tray-title').textContent='Box '+box+' · Open';show('tray');}
$('open-tray').onclick=$('open-handle').onclick=openTray;$('contents-back').onclick=$('tray-back').onclick=()=>{if(canPlay())show('cabinet');};$('tray-sheet').onclick=()=>openContents(box);
function animatePickup(from,b,index){
 if(!document.body||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const target=$('slots').children[index];if(!target)return;
 const to=target.getBoundingClientRect(),ghost=document.createElement('img');if(!ghost.animate)return;
 ghost.className='flying-bottle';ghost.src=asset+'front-view-bottle.webp';ghost.alt='';
 Object.assign(ghost.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});document.body.append(ghost);
 const dx=to.left-from.left,dy=to.top-from.top;
 const animation=ghost.animate([{transform:'translate(0,0) scale(1) rotate(-8deg)',opacity:1},{transform:'translate('+dx*.5+'px,'+(dy*.5-50)+'px) scale(.85) rotate(8deg)',offset:.5},{transform:'translate('+dx+'px,'+dy+'px) scale(.6) rotate(0)',opacity:0}],{duration:480,easing:'cubic-bezier(.2,.8,.2,1)'});
 animation.finished.then(()=>ghost.remove()).catch(()=>ghost.remove());
}

function renderBench(){const complete=round.selected.length===3;$('bench').dataset.ready=String(complete);$('check-selections').disabled=!complete;$('check-selections').setAttribute('aria-label',complete?'Check these three bottle selections':'Select three bottles before checking your selections');$('selected-count').textContent=round.selected.length+' / 3';$('status').textContent=complete?'Your bench is ready. Check your selections or tap a bottle to replace it.':'Collect '+(3-round.selected.length)+' more bottle'+(round.selected.length===2?'':'s')+'. Tap a selected bottle to replace it.';$('slots').replaceChildren(...Array.from({length:3},(_,i)=>{const b=round.selected[i],button=document.createElement('button');button.className='slot';button.disabled=!b;button.setAttribute('aria-label',b?'Remove selected bottle '+b.code:'Empty selection '+(i+1));if(b){button.style.setProperty('--hue',b.hue+'deg');const img=document.createElement('img');img.src=asset+'front-view-bottle.webp';img.alt='';const code=document.createElement('span');code.className='code';code.textContent=b.code;const remove=document.createElement('span');remove.className='remove';remove.textContent='×';button.append(img,code,remove);button.onclick=()=>{if(canPlay()){round.remove(b.code);renderBench();if(view==='tray')renderBottles();$('status').textContent='Selection removed. Choose another bottle.';}};}else{button.innerHTML='<span class="empty">Bottle '+(i+1)+'</span>';}return button;}));}
$('check-selections').onclick=()=>{if(!canPlay()||round.selected.length!==3)return;round.phase='results';round.noteRemaining=0;finish();};
function finish(){
 show('results');$('notes').hidden=true;$('bench').hidden=true;$('recall').hidden=true;$('timer').hidden=true;updateNotes();
 const matches=round.matches;
 $('result-title').textContent=matches===3?'Standard mastered!':matches===0?'Let’s try that again':matches===1?'One standard found':'Almost there!';
 $('result-score').textContent=matches+' / 3';$('score-orbit').style.setProperty('--score',matches*120+'deg');
 $('result-medal').textContent=matches===3?'★':'✦';
 $('result-stars').replaceChildren(...Array.from({length:3},(_,i)=>{const star=document.createElement('span');star.className=i<matches?'earned':'unearned';star.textContent='★';return star;}));
 $('result-summary').textContent=matches===3?'All three bottles match your Lab Notes. Excellent work!':'Compare the bottle labels below, then give your memory another round.';
 for(const [id,list] of [['correct-answers',round.targets],['your-answers',round.selected]]){
  $(id).replaceChildren(...list.map(b=>{
   const requested=round.targets.some(t=>t.code===b.code),selected=round.selected.some(t=>t.code===b.code),match=requested&&selected;
   const li=document.createElement('li');li.className='bottle-review '+(match?'match':id==='correct-answers'?'miss':'wrong');
   const actual=round.layouts[b.box].find(item=>item.code===b.code);
   const visual=document.createElement('div');visual.className='review-specimen';visual.style.setProperty('--hue',(actual?.hue||0)+'deg');
   const img=document.createElement('img');img.src=asset+'front-view-bottle.webp';img.alt='Bottle '+b.code;
   const code=document.createElement('span');code.className='review-bottle-code';code.textContent=b.code;visual.append(img,code);
   const copy=document.createElement('div');copy.className='review-copy';
   const tag=document.createElement('small');tag.className='review-box';tag.textContent='BOX '+b.box+' · '+b.code;
   const name=document.createElement('strong');name.textContent=b.name;
   const badge=document.createElement('span');badge.className='review-verdict';badge.textContent=match?'✓ Correct match':id==='correct-answers'?'↗ Needed on your bench':'× Not requested';
   copy.append(tag,name,badge);li.append(visual,copy);return li;
  }));
 }
 const missing=3-round.selected.length;
 if(missing){const li=document.createElement('li');li.className='empty-review';const icon=document.createElement('span');icon.className='empty-bottle';icon.textContent='?';icon.setAttribute('aria-hidden','true');const message=document.createElement('span');message.textContent=missing===3?'No bottles selected':missing+' empty slot'+(missing===1?'':'s');li.append(icon,message);$('your-answers').append(li);}
 $('result-title').focus();
}

function tick(){const now=performance.now(),elapsed=now-last;last=now;if(paused||briefingActive||instructionsOpen||!round||round.phase==='results')return;round.advance(elapsed);$('timer').textContent=Math.ceil(round.remaining/1000)+'s';$('timer').classList.toggle('urgent',round.remaining<=10000);updateNotes();if(round.phase==='results')finish();}
setInterval(tick,50);window.addEventListener('pageshow',syncPause);
// Pointer events support mouse dragging, touch panning and two-finger pinch without accidental box opening.
const viewport=$('contents-viewport');
function snapshot(){const points=[...pointers.values()];return {scale,x:panX,y:panY,points,distance:points.length>1?Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y):0,mid:points.length>1?{x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2}:points[0]};}
viewport.addEventListener('pointerdown',e=>{if(!canPlay()||e.button!==0||e.target?.closest?.('button'))return;try{viewport.setPointerCapture?.(e.pointerId);}catch{}if(!pointers.size)moved=false;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});gesture=snapshot();if(pointers.size>1)moved=true;});
viewport.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const points=[...pointers.values()];if(points.length>1&&gesture.distance){const mid={x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2};const distance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);scale=Math.max(1,Math.min(4,gesture.scale*distance/gesture.distance));panX=gesture.x+mid.x-gesture.mid.x;panY=gesture.y+mid.y-gesture.mid.y;moved=true;}else if(points.length===1){const dx=points[0].x-gesture.mid.x,dy=points[0].y-gesture.mid.y;if(Math.hypot(dx,dy)>7)moved=true;if(scale>1){panX=gesture.x+dx;panY=gesture.y+dy;}}applyZoom();});
viewport.addEventListener('pointerup',e=>{const tracked=pointers.has(e.pointerId);pointers.delete(e.pointerId);if(!pointers.size){// Reading taps leave the closed box closed; only its handle opens it.
gesture=null;}else gesture=snapshot();});
viewport.addEventListener('lostpointercapture',e=>{pointers.delete(e.pointerId);gesture=pointers.size?snapshot():null;});
viewport.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);moved=true;gesture=pointers.size?snapshot():null;});
viewport.addEventListener('wheel',e=>{e.preventDefault();zoom(scale+(e.deltaY<0?.25:-.25));},{passive:false});viewport.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();panX+=(e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0);panY+=(e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0);applyZoom();}});
$('zoom-in').onclick=()=>zoom(scale+.5);$('zoom-out').onclick=()=>zoom(scale-.5);$('zoom-reset').onclick=resetZoom;
for(const a of document.querySelectorAll('a[href]'))a.addEventListener('click',()=>{screen.orientation?.unlock?.();const exit=document.exitFullscreen||document.webkitExitFullscreen;if((document.fullscreenElement||document.webkitFullscreenElement)&&exit){try{Promise.resolve(exit.call(document)).catch(()=>{});}catch{}}});
show('intro');syncPause();if('serviceWorker' in navigator&&window.isSecureContext)navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();

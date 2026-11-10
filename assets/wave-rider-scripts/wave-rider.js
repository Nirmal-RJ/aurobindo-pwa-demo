(() => {
'use strict';
const C=WaveConfig,K=WaveCore,A='../wave-rider-assets/',key='qc-wave-rider-v1';
const scene=document.querySelector('#scene'),effects=document.querySelector('#effects'),modal=document.querySelector('#modal'),game=document.querySelector('#game');
let raw;try{raw=JSON.parse(localStorage.getItem(key));}catch{}
let saved=K.load(raw),run=new K.Run(C,saved),screen='landing',generation=0,demoIndex=0,demoReturn='home',selectionAvailable=true,frame=0,ready=false,voyage=null;
let motion={x:50,from:50,to:50,start:0,duration:420,lastRemaining:null,offset:0,correctionAt:0,correctionDuration:350};
const image=(src,cls='',alt='')=>`<img draggable="false" class="${cls}" src="${A+src}" alt="${alt}">`;
const button=(src,action,cls='',label='')=>`<button type="button" class="art-button ${cls}" data-action="${action}" aria-label="${label}">${image(src,'',label)}</button>`;
const save=()=>{try{localStorage.setItem(key,JSON.stringify(saved));}catch{notice('Progress could not be saved on this device.');}};
const notice=text=>{document.querySelector('#notice').textContent=text;setTimeout(()=>document.querySelector('#notice').textContent='',3500);};
let dayCheckAt=0,dayCheckValue='';
function daily(){const now=Date.now();if(now>=dayCheckAt){dayCheckValue=K.day(now);dayCheckAt=now+Math.min(1000,86400000-((now+19800000)%86400000));}if(saved.day===dayCheckValue)return false;saved=K.fresh(Date.now(),saved.demo);run=new K.Run(C,saved);save();notice('A new sailing day has started.');return true;}
function mount(name,html){scene.getAnimations().forEach(a=>a.cancel());cancelAnimationFrame(frame);generation++;screen=name;window.WaveAudio?.scene(name);game.dataset.screen=name;modal.replaceChildren();effects.replaceChildren();window.WaveWater?.reset();scene.className=name;scene.innerHTML=html;scene.animate([{opacity:0,transform:'scale(1.015)'},{opacity:1,transform:'scale(1)'}],{duration:C.timings.enter,easing:'ease-out'});}
function exitIcon(){return '<button class="close" data-action="leave" aria-label="Exit game">&times;</button>';}
function outside(){const from=new URLSearchParams(location.search).get('from')==='games'?'games':'rc-games';location.href=new URL('../../index.html#/'+from,location.href).href;}
function showHome(){daily();const boat=C.boats[run.selected];mount('home',`${exitIcon()}<div class="boat-name">${image('page-3/boat-selection-button.webp')}<span>${boat.name}</span><button class="boat-previous" data-action="boat-previous" aria-label="Previous unlocked boat" ${!selectionAvailable||run.selected===0?'disabled':''}></button><button class="boat-next" data-action="boat-next" aria-label="Next unlocked boat" ${!selectionAvailable||run.selected>=saved.unlocked?'disabled':''}></button></div><div class="home-boat">${image(boat.image,'float',boat.name)}</div><div class="boat-list">${image('page-3/button-place-holder.webp','list-frame')}${button('page-3/button-up.webp','boats-up','boats-up','Previous boats')}<div class="boat-scroll">${C.boats.map((b,i)=>`<button class="boat-choice ${i===run.selected?'selected':''}" data-boat="${i}" ${i>saved.unlocked||!selectionAvailable?'disabled':''} aria-label="${b.name}${i>saved.unlocked?' locked':''}">${image(b.image)}<span>${b.name}</span><small class="${i>saved.unlocked?'boat-locked':i===run.selected?'boat-selected':''}">${i>saved.unlocked?'<svg viewBox="0 0 24 28" aria-hidden="true"><path d="M6 11V7a6 6 0 0 1 12 0v4" fill="none" stroke="currentColor" stroke-width="3"/><rect x="2" y="11" width="20" height="16" rx="2" fill="currentColor"/><circle cx="12" cy="17" r="2" fill="#073051"/><path d="M12 18v5" stroke="#073051" stroke-width="2"/></svg><span>LOCKED<br>CLEAR LEVEL '+i+'</span>':i===run.selected?'SELECTED':''}</small></button>`).join('')}</div>${button('page-3/button-down.webp','boats-down','boats-down','Next boats')}</div>${image('page-3/collect-7-flags-to-upgrade.webp','collect')}${button('page-3/start-sailing-button.webp','start','start','Start Sailing')}${button('page-3/how-to-play-button.webp','how','how','How to play')}`);const list=scene.querySelector('.boat-scroll');list.addEventListener('scroll',boatScrollState);requestAnimationFrame(()=>{const selected=list.querySelector('.selected');if(selected)list.scrollTop=Math.max(0,selected.offsetTop-list.clientHeight/2+selected.clientHeight/2);boatScrollState();});}
function demo(index=0){demoIndex=index;const src=index<3?`page-2/demo-${index+1}-v1.gif`:'page-2/page-2-4-bg.webp';mount('demo',`${image(src,'full-demo',`Demo ${index+1} of 4`)}${exitIcon()}<div class="demo-nav">${index?'<button data-action="previous" class="demo-button" aria-label="Previous"><span class="demo-chevron demo-chevron-left" aria-hidden="true"></span> Previous</button>':'<span></span>'}<button data-action="demo-next" class="demo-button" aria-label="Next">Next <span class="demo-chevron" aria-hidden="true"></span></button></div>`);}
function hud(){return `${exitIcon()}<div class="flag-hud">${image('page-4/flag-panel.webp')}<span>${Array.from({length:7},(_,i)=>'<svg class="hud-flag '+(i<run.flags?'filled':'')+'" viewBox="0 0 24 40" aria-hidden="true"><path d="M4 36V4L22 13 4 23" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><circle cx="4" cy="4" r="2.5"/><circle cx="4" cy="36" r="2.5"/></svg>').join('')} <b>${run.flags}/7</b></span></div>`;}

function boatScrollState(){const list=scene.querySelector('.boat-scroll');if(!list)return;scene.querySelector('[data-action="boats-up"]').disabled=list.scrollTop<2;scene.querySelector('[data-action="boats-down"]').disabled=list.scrollTop+list.clientHeight>=list.scrollHeight-2;}
function voyageGeometry(){
 const ship=scene.querySelector('#ship'),boat=ship.querySelector('img'),line=scene.querySelector('.lane.left img:last-child');
 const stage=scene.getBoundingClientRect(),rect=line.getBoundingClientRect();
 const lineScale=Math.min(line.clientWidth/line.naturalWidth,line.clientHeight/line.naturalHeight);
 const lineY=rect.top-stage.top+(line.clientHeight-line.naturalHeight*lineScale)/2+line.naturalHeight*lineScale*.64;
 const boatScale=Math.min(boat.clientWidth/boat.naturalWidth,boat.clientHeight/boat.naturalHeight);
 const bowInset=(boat.clientHeight-boat.naturalHeight*boatScale)/2+boat.naturalHeight*boatScale*C.boats[run.selected].frontInkTop;
 return {width:stage.width,hullWidth:ship.clientWidth,hullHeight:ship.clientHeight,start:stage.height*.86,end:lineY+ship.clientHeight/2-bowInset};
}
function placeShip(remaining){
 const ship=scene.querySelector('#ship'),geometry=voyage||(voyage=voyageGeometry()),now=performance.now();
 const dt=Math.min(64,Math.max(0,now-(motion.lastPaint??now)));motion.lastPaint=now;
 const progress=Math.min(1,Math.max(0,1-remaining/(C.questionSeconds*1000)));
 const target=geometry.start+(geometry.end-geometry.start)*progress;
 if(!run.committed&&motion.lastRemaining!==null&&motion.lastRemaining-remaining>250&&remaining>0){
  motion.offset=(motion.y??target)-target;motion.correctionAt=now;motion.correctionDuration=Math.min(380,remaining);
 }
 const correction=Math.max(0,1-(now-motion.correctionAt)/motion.correctionDuration);
 motion.y=target+(remaining>0?motion.offset*correction*correction*(3-2*correction):0);
 motion.lastRemaining=remaining;
 const t=Math.min(1,Math.max(0,(now-motion.start)/motion.duration)),ease=t*t*(3-2*t);
 motion.x=motion.from+(motion.to-motion.from)*ease;
 // Keep layout stationary during sailing; only composite the moving hull.
 ship.style.top='0px';ship.style.left='50%';
 ship.style.translate=((motion.x-50)*geometry.width/100)+'px '+motion.y+'px';
 const bank=(motion.to-motion.from)*.38*Math.sin(Math.PI*t);
 motion.heading=(motion.heading||0)+(bank-(motion.heading||0))*(1-Math.exp(-dt/84));
 ship.dataset.heading=motion.heading;
 const bob=window.WaveWater?.bob(motion.x,motion.y,now)||0;
 ship.querySelector('img').style.transform='rotate('+motion.heading+'deg) translateY('+bob+'px)';
 window.WaveWater?.pose(motion.x*geometry.width/100,motion.y,motion.heading,bob,geometry.hullWidth,geometry.hullHeight,C.boats[run.selected]);
}


function sailing(){if(daily()){showHome();return;}selectionAvailable=false;ready=false;voyage=null;motion={x:50,from:50,to:50,start:0,duration:420,lastRemaining:null,offset:0,correctionAt:0,correctionDuration:350};const q=run.next();mount('play',`${hud()}<div class="question">${image('page-4/question-panel.webp')}<p id="question-copy"></p></div><button class="lane left" data-lane="-1" aria-label="False: left lane">${image('page-4/false-panel.webp')}${image('page-4/false-line.webp')}</button><button class="lane right" data-lane="1" aria-label="True: right lane">${image('page-4/true-panel.webp')}${image('page-4/true-line.webp')}</button><div class="time">${image('page-4/timer-panel.webp')}<span id="seconds">8s</span><div><i id="time-fill"></i></div></div><div id="ship" class="ship">${image(C.boats[run.selected].front,'',C.boats[run.selected].name)}</div>`);
 scene.querySelector('#question-copy').textContent=q.prompt;
 const entering=scene.querySelector('#ship'),entryHeight=scene.clientHeight;
 entering.style.top='0px';entering.style.translate='0px '+entryHeight*.86+'px';
 const entry=entering.animate([{translate:'0px '+entryHeight*1.12+'px'},{translate:'0px '+entryHeight*.86+'px'}],{duration:C.timings.enter,easing:'cubic-bezier(.2,.45,.4,1)',fill:'both'});
 const token=generation;const start=()=>{if(generation!==token)return;entry.cancel();voyage=null;run.started=Date.now();ready=true;placeShip(C.questionSeconds*1000);paint();};
 // Start on actual animation completion, not a competing wall-clock timeout.
 entry.finished.then(start).catch(()=>{});
 function paint(){if(generation!==token||screen!=='play')return;if(daily()){showHome();return;}const remaining=run.remaining(),fraction=remaining/(C.questionSeconds*1000);const seconds=scene.querySelector('#seconds'),label=(remaining/1000).toFixed(1)+'s';if(seconds.textContent!==label)seconds.textContent=label;scene.querySelector('#time-fill').style.transform=`scaleX(${fraction})`;scene.querySelector('.time').classList.toggle('urgent',remaining<2000);if(run.committed){const t=Math.min(1,(performance.now()-motion.boostAt)/C.timings.fastFinish);placeShip(motion.boostRemaining*(1-t*t));if(t>=1){finish();return;}}else{placeShip(remaining);if(!remaining){finish();return;}}frame=requestAnimationFrame(paint);}
}
function lane(value){if(screen!=='play'||!ready||modal.children.length)return;if(!run.change(value))return;const ship=scene.querySelector('#ship');motion.from=motion.x;motion.to=value===1?79:21;motion.start=performance.now();motion.duration=Math.max(1,Math.min(480,run.remaining()));if(run.swipes>1){showTimePenalty(ship);}if(run.remaining()<=0)finish();}
function fastFinish(){
 if(screen!=='play'||!ready||modal.children.length||!run.commit())return;
 ready=false;const geometry=voyage||(voyage=voyageGeometry());
 motion.boostRemaining=Math.max(0,Math.min(C.questionSeconds*1000,(motion.y-geometry.end)/(geometry.start-geometry.end)*C.questionSeconds*1000));
 motion.boostAt=performance.now();motion.offset=0;motion.duration=Math.min(motion.duration,C.timings.fastFinish);
}
function showTimePenalty(ship){
 window.WaveAudio?.accent('penalty');
 const timer=scene.querySelector('.time'),stage=game.getBoundingClientRect(),hull=ship.getBoundingClientRect(),target=timer.getBoundingClientRect(),token=generation;
 const x=hull.left-stage.left+hull.width/2,y=hull.top-stage.top-16;
 const dx=target.left-stage.left+target.width*.6-x,dy=target.top-stage.top+target.height*.5-y;
 const badge=document.createElement('span');badge.className='penalty';badge.textContent='−2s';badge.style.left=x+'px';badge.style.top=y+'px';effects.append(badge);
 const flash=()=>{if(token!==generation||!timer.isConnected)return;timer.getAnimations().filter(a=>a.id==='time-penalty').forEach(a=>a.cancel());const a=timer.animate([{filter:'drop-shadow(0 0 0 transparent)'},{filter:'drop-shadow(0 0 3px #ff201d) drop-shadow(0 0 7px #ff201d)',offset:.3},{filter:'drop-shadow(0 0 0 transparent)',offset:.5},{filter:'drop-shadow(0 0 4px #ff201d) drop-shadow(0 0 9px #ff201d)',offset:.72},{filter:'none'}],{duration:650});a.id='time-penalty';timer.querySelector('#seconds').animate([{color:'#ff2929',textShadow:'0 0 3px #fff',transform:'scale(1.18)'},{color:'#ff2929',offset:.75},{color:'#fff',transform:'scale(1)'}],{duration:650});};
 flash();
 const flight=badge.animate([{transform:'translate(-50%,-50%) scale(.6)',opacity:0},{transform:'translate(-50%,-50%) scale(1.18)',opacity:1,offset:.16},{transform:'translate(-50%,-50%) scale(1)',opacity:1,offset:.4},{transform:`translate(calc(-50% + ${dx*.45}px),calc(-50% + ${dy*.55}px)) scale(.85)`,opacity:1,offset:.7},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.35)`,opacity:0}],{duration:1000,easing:'ease-in-out',fill:'both'});
 flight.finished.then(()=>{badge.remove();flash();}).catch(()=>badge.remove());
}
function particles(kind,count=34){effects.replaceChildren();for(let i=0;i<count;i++){const p=document.createElement('i');p.className='particle '+kind;p.style.cssText=`--x:${(Math.random()-.5)*100}cqw;--y:${(Math.random()-.5)*100}cqh;--r:${Math.random()*720}deg;--delay:${Math.random()*.35}s;left:${45+Math.random()*10}%;top:${35+Math.random()*10}%;background:${kind==='paper'?['#ffdd65','#fff','#20e2e4','#ff8c47'][i%4]:''}`;effects.append(p);}}
function finish(){
 const result=run.settle();if(!result)return;
 cancelAnimationFrame(frame);modal.replaceChildren();save();const token=generation;
 screen='feedback';ready=false;const ship=scene.querySelector('#ship');
 const fromTop=motion.y+'px',fromLeft=motion.x+'%';
 placeShip(0);const targetTop=motion.y+'px';
 // Commit the composited position before the existing arrival/outcome animations.
 window.WaveWater?.clearPose();ship.style.translate='none';ship.style.top=targetTop;ship.style.left=motion.to+'%';
 const needsSettle=Math.abs(motion.x-motion.to)>.1||Math.abs(parseFloat(fromTop)-parseFloat(targetTop))>2;
 if(needsSettle){
  const arrival=ship.animate([{left:fromLeft,top:fromTop},{left:motion.to+'%',top:targetTop}],{duration:300,easing:'cubic-bezier(.25,.1,.25,1)'});
  arrival.finished.then(()=>{if(token===generation)showOutcome(result,token,ship);}).catch(()=>{});
 }else showOutcome(result,token,ship);
}
function showOutcome(result,token,ship){
 window.WaveAudio?.cue(result.correct?'correct':result.crash?'crash':'wrong');
 if(!result.crash){const line=scene.querySelector(run.lane===1?'.lane.right img:last-child':'.lane.left img:last-child');line.animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(5px) rotate(-3deg)',offset:.2},{transform:'translateY(-3px) rotate(2deg)',offset:.5},{transform:'translateY(1px) rotate(-1deg)',offset:.75},{transform:'none'}],{duration:850,easing:'ease-out'});window.WaveWater?.crossing(run.lane===1?.79:.21);}
 ship.querySelector('img').style.transform='';ship.classList.add('arrived');scene.classList.add(result.correct?'success':result.crash?'crash':'sinking');ship.classList.add(result.correct?'pass':result.crash?'wreck':'sink');
 if(result.correct){
  scene.style.setProperty('--victory-duration',C.timings.correct+'ms');
  const gate=scene.querySelector(run.lane===1?'.lane.right':'.lane.left');
  gate.animate([{filter:'brightness(1)'},{filter:'brightness(1.35) drop-shadow(0 0 8px #ffe77b)',offset:.2},{filter:'brightness(1)'}],{duration:900,easing:'ease-out'});
  const pace=C.timings.celebrationScale;
  // One outcome clock: contact -> surf -> salute -> flag -> calm handoff.
  const stage=game.getBoundingClientRect(),surge=stage.height*.105,bank=run.lane===1?-4:4;
  const startTop=parseFloat(ship.style.top),endTop=startTop-surge*1.1;
  ship.style.top=endTop+'px';
  ship.animate([
   {top:startTop+'px'},
   {top:(startTop-surge*.15)+'px',offset:.22},
   {top:(startTop-surge)+'px',offset:.75},
   {top:endTop+'px'}
  ],{duration:2000*pace,fill:'backwards',easing:'cubic-bezier(.32,.05,.23,1)'});
  ship.querySelector('img').animate([{transform:'rotate(0)'},{transform:`rotate(${bank}deg) translateY(-2px)`,offset:.3},{transform:`rotate(${-bank*.3}deg)`,offset:.65},{transform:'rotate(0)'}],{duration:1900*pace,fill:'forwards',easing:'ease-in-out'});
  window.WaveWater?.salute(650*pace);
  window.WaveAudio?.accent('celebrate');
  effects.innerHTML=`<div class="flag-rays" aria-hidden="true"><i></i></div><div class="earned-flag">${image('page-5/flag.webp')}</div><div class="right-answer">${image('page-5/right-answer-panel.webp')}</div>`;
  effects.querySelector('.flag-rays').animate([{opacity:0},{opacity:1,offset:.12},{opacity:1,offset:.88},{opacity:0}],{delay:650*pace,duration:3500*pace,fill:'both'});
  const answer=effects.querySelector('.right-answer');
  answer.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)',offset:.22},{opacity:1,offset:.8},{opacity:0,transform:'translateY(-4px)'}],{delay:3800*pace,duration:2100*pace,fill:'both',easing:'linear'});
  const flag=effects.querySelector('.earned-flag'),slot=scene.querySelectorAll('.hud-flag')[Math.min(6,run.flags-1)];
  flag.style.transform='translate(-50%,-50%)';
  const source=flag.getBoundingClientRect(),target=slot.getBoundingClientRect();
  const dx=target.left+target.width/2-source.left-source.width/2,dy=target.top+target.height/2-source.top-source.height/2;
  flag.style.transformOrigin='50% 50%';
  const flight=flag.animate([
   {transform:'translate(-50%,-50%) scale(.2) rotate(-10deg)',opacity:0},
   {transform:'translate(-50%,-50%) scale(.8) rotate(0)',opacity:1,offset:.09},
   {transform:'translate(-50%,-50%) scale(.8) rotate(0)',opacity:1,offset:.6774},
   {transform:'translate(-50%,-50%) scale(1.22) rotate(-2deg)',opacity:1,offset:.78},
   {transform:`translate(calc(-50% + ${dx*.25-stage.width*.08}px),calc(-50% + ${dy*.5}px)) scale(.7) rotate(7deg)`,opacity:1,offset:.91},
   {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${target.width/source.width}) rotate(0)`,opacity:1}
  ],{delay:650*pace,duration:4650*pace,fill:'both',easing:'linear'});
  flight.finished.then(()=>{if(token!==generation)return;window.WaveAudio?.accent('flag-land');flag.remove();slot.classList.add('filled');scene.querySelector('.flag-hud b').textContent=run.flags+'/7';slot.animate([{transform:'scale(1.6)'},{transform:'scale(1)'}],{duration:300});}).catch(()=>{});
  scene.animate([{opacity:1},{opacity:0}],{delay:Math.max(0,C.timings.correct-250),duration:250,fill:'forwards'});
  setTimeout(()=>{if(token!==generation)return;if(result.upgrade){const star=run.upgrade();save();reward(star);}else sailing();},C.timings.correct);
 }else{
  const bounds=ship.getBoundingClientRect(),stage=game.getBoundingClientRect();
  const hull=ship.querySelector('img'),scale=Math.min(hull.clientWidth/hull.naturalWidth,hull.clientHeight/hull.naturalHeight);
  const bowY=bounds.top-stage.top+(hull.clientHeight-hull.naturalHeight*scale)/2+hull.naturalHeight*scale*C.boats[run.selected].frontInkTop;
  window.WaveWater?.impact(result.crash?'crash':'sink',(bounds.left+bounds.width/2-stage.left)/stage.width,(result.crash?bowY:bounds.top+bounds.height/2-stage.top)/stage.height);
  if(result.crash){
   const rim=document.createElement('div');rim.className='crash-rim';effects.append(rim);
   game.animate([{transform:'translate(0)'},{transform:'translate(-7px,4px) rotate(-.5deg)'},{transform:'translate(7px,-5px) rotate(.5deg)'},{transform:'translate(-5px,2px)'},{transform:'translate(4px,-2px)'},{transform:'translate(0)'}],{duration:650,easing:'ease-out'});
  }
  setTimeout(()=>{if(token!==generation)return;failure(result.crash);},result.crash?C.timings.crash:C.timings.wrong);
 }
}
function failure(crash){const q=run.question;mount('failure',`${exitIcon()}<div class="failure-card" style="--panel-ratio:${crash?'1144 / 1375':'1032 / 1179'}">${image(crash?'page-7/lighthouse-crash-panel.webp':'page-6/wrong-answer-pop-up.webp')}${crash?'':'<p id="explanation"></p>'}</div>${button('try-again-button.webp','retry','retry','Try Again')}`);if(!crash)scene.querySelector('#explanation').textContent=q.rightAction;}
function reward(star){const b=C.boats[saved.level];mount(star?'star':'upgrade',`${exitIcon()}${star?image('page-9/star-panel.webp','reward-heading')+'<p class="reward-copy">'+saved.stars+' of 3 stars today</p>':'<div class="upgrade-banner"><div class="upgrade-art">'+image('page-8/boat-upgraded-panel.webp')+'<span class="upgrade-level">LEVEL '+(saved.level+1)+'</span><span class="upgrade-name">'+b.name+'</span></div></div>'}<div class="rays"></div><div class="reward-boat">${image(b.image,'float',b.name)}</div>${star?image('page-9/luxury-voyager-panel.webp','luxury'):''}${button('continue-button.webp',star?'star-next':'continue','continue','Continue')}`);particles('paper',64);}
function leave(){if(screen==='landing'||screen==='home'||screen==='demo'){outside();return;}modal.innerHTML=`<div class="exit-shade"><div class="exit-card">${image('page-10/exit-panel.webp')}${button('page-10/keep-sailing-button.webp','keep','keep','Keep Sailing')}${button('page-10/exit-button.webp','exit-home','exit-home','Exit to home')}</div></div>`;}
scene.addEventListener('click',e=>{const b=e.target.closest('[data-boat]');if(b&&!b.disabled){run.selected=Number(b.dataset.boat);showHome();}const l=e.target.closest('[data-lane]');if(l)lane(Number(l.dataset.lane));});
game.addEventListener('click',e=>{const a=e.target.closest('[data-action]')?.dataset.action;if(!a)return;
 if((a==='boat-previous'||a==='boat-next')&&selectionAvailable){run.selected=Math.max(0,Math.min(saved.unlocked,run.selected+(a==='boat-next'?1:-1)));showHome();}if(a==='boats-up'||a==='boats-down'){const list=scene.querySelector('.boat-scroll');list.scrollBy({top:list.clientHeight*(a==='boats-up'?-1:1),behavior:'smooth'});}if(a==='leave')leave();if(a==='next'){saved.demo?showHome():demo(0);}if(a==='how'){demoReturn='home';demo(0);}if(a==='previous')demo(demoIndex-1);if(a==='demo-next'){if(demoIndex<3)demo(demoIndex+1);else{saved.demo=true;save();showHome();}}if(a==='start'||a==='retry'||a==='continue')sailing();if(a==='star-next'){run.restartCycle();save();sailing();}if(a==='keep')modal.replaceChildren();if(a==='exit-home'){selectionAvailable=true;run.flags=0;run.settled=true;save();showHome();}});
let touch;game.addEventListener('pointerdown',e=>{if(screen==='play'&&!e.target.closest('button')&&!modal.children.length){touch={id:e.pointerId,x:e.clientX,y:e.clientY};game.setPointerCapture(e.pointerId);}});game.addEventListener('pointerup',e=>{if(!touch||touch.id!==e.pointerId)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(dy < -25&&Math.abs(dy)>Math.abs(dx)*1.2){fastFinish();return;}if(Math.abs(dx)>25&&Math.abs(dx)>Math.abs(dy)*1.2)lane(dx>0?1:-1);});game.addEventListener('pointercancel',()=>touch=null);window.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();fastFinish();return;}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();lane(e.key==='ArrowRight'?1:-1);}});
window.addEventListener('resize',()=>{voyage=null;});
window.addEventListener('pagehide',()=>{run.flags=0;save();});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&screen==='play'){if(daily())showHome();else if(run.remaining()<=0)finish();}});
async function landing(){mount('landing',`${image('page-1/page-1-bg.webp','landing-bg')}<div class="loading" role="progressbar" aria-label="Loading game assets" aria-valuemin="0" aria-valuemax="100"><div class="loading-heading"><span>Loading</span><span class="loading-percent">0%</span></div><div class="loading-track"><i></i></div></div>`);let loaded=0;const failed=[];await Promise.all(C.assets.map(src=>new Promise(resolve=>{const im=new Image();im.onload=()=>done();im.onerror=()=>{failed.push(src);done();};function done(){loaded++;const bar=scene.querySelector('.loading');if(bar){const percent=Math.round(loaded/C.assets.length*100);bar.setAttribute('aria-valuenow',percent);bar.querySelector('.loading-percent').textContent=percent+'%';bar.querySelector('i').style.transform='scaleX('+loaded/C.assets.length+')';}resolve();}im.src=A+src;})));if(failed.length){scene.querySelector('.loading').innerHTML='<button onclick="location.reload()">Assets could not load. Retry</button>';return;}scene.querySelector('.loading').outerHTML=button('next-button.webp','next','landing-next','Next');}
save();landing();
})();

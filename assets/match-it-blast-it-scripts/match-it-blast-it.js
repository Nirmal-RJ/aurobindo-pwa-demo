(() => {
 'use strict';
 const C=BlastConfig, scene=document.querySelector('#scene'), game=document.querySelector('#game'), canvas=document.querySelector('#effects'), ctx=canvas.getContext('2d');
 const asset=p=>`../match-it-blast-it-assets/${p}?v=${C.version}`;
 let phase='loading', selected=null, slots=Array(5).fill(null), remaining=C.roundSeconds, last=performance.now(), clock=0, token=0, dragging=null, demo=false;
 const jobs=[], particles=[], tweens=[];
 const motionIds=new WeakMap();
 let navigating=false, previousStreak=[];
 const storageKey='match-it-blast-it-progress-v1';
 let progress;try{progress=BlastLogic.restore(JSON.parse(localStorage.getItem(storageKey)));}catch{progress=BlastLogic.empty();}
 let outcome=null, wrongPair=-1, elapsedMs=0;
 function save(){try{localStorage.setItem(storageKey,JSON.stringify(progress));}catch{}}
 function unlockAudio(){BlastAudio.unlock();}
 function pop(){BlastAudio.pop();}
 function copy(text,cls,parent=scene){const el=document.createElement('div');el.className=cls;el.textContent=text;parent.append(el);return el;}
 function action(label,cls,fn){const b=document.createElement('button');b.className='text-button '+cls;b.textContent=label;b.onclick=()=>{if(!navigating){unlockAudio();fn();}};scene.append(b);return b;}
 const seconds=ms=>`${(ms/1000).toFixed(2)}s`;
 function tick(dt){elapsedMs+=dt;remaining=Math.max(0,C.roundSeconds-elapsedMs/1000);updateTimer();}

 const mobile=()=>/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Macintosh/.test(navigator.userAgent));
 function paused(){return document.hidden||document.body.classList.contains('portrait-needed');}
 function resize(){const s=getComputedStyle(document.body), w=document.documentElement.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight), h=window.innerHeight-parseFloat(s.paddingTop)-parseFloat(s.paddingBottom);const width=w<h?w:Math.min(w,h*9/16);game.style.width=`${width}px`;game.style.height=`${h}px`;canvas.width=Math.round(width*devicePixelRatio);canvas.height=Math.round(h*devicePixelRatio);ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);document.body.classList.toggle('portrait-needed',mobile()&&w>h);syncPause();}
 function syncPause(){BlastAudio.setPaused(paused());document.body.classList.toggle('paused',paused());last=performance.now();if(paused())cancelDrag();}
 window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);document.addEventListener('visibilitychange',syncPause);window.addEventListener('pagehide',cancelDrag);window.addEventListener('pageshow',syncPause);resize();
 function later(ms,fn){jobs.push({at:clock+ms,token,fn});}
 function frame(now){const dt=Math.max(0,now-last);last=now;if(!paused()){
  clock+=dt;
  if(phase==='playing'&&!demo){tick(dt);if(remaining===0)finish(true);}
  for(let i=jobs.length-1;i>=0;i--){if(jobs[i].token!==token)jobs.splice(i,1);else if(jobs[i].at<=clock){const job=jobs.splice(i,1)[0];job.fn();}}
  for(const tween of [...tweens]){if(tween.token!==token){tweens.splice(tweens.indexOf(tween),1);continue;}const t=Math.min(1,(clock-tween.start)/tween.duration);tween.draw(t);if(t===1){tweens.splice(tweens.indexOf(tween),1);tween.done?.();}}
  paint(Math.min(dt,50)/1000);
 }requestAnimationFrame(frame);}
 requestAnimationFrame(frame);
 function image(path,cls,parent=scene,alt=''){const im=new Image();im.src=asset(path);im.className=cls;im.alt=alt;im.draggable=false;parent.append(im);return im;}
 function button(path,label,cls,fn,parent=scene){const b=document.createElement('button');b.type='button';b.className=`image-button ${cls}`;b.setAttribute('aria-label',label);image(path,'',b);b.onclick=()=>{if(navigating)return;unlockAudio();fn();};parent.append(b);if(navigating&&cls!=='light-button'){b.disabled=true;later(C.timing.transition+30,()=>b.disabled=false);}return b;}
 function tween(duration,draw,done){const item={token,start:clock,duration,draw,done};tweens.push(item);draw(0);}
 const ease=t=>1-Math.pow(1-t,3);
 function fade(el,to,duration,done){const from=Number(getComputedStyle(el).opacity);tween(duration,t=>el.style.opacity=String(from+(to-from)*ease(t)),done);}
 function visualRect(el){const r=el.getBoundingClientRect();if(el instanceof HTMLImageElement&&getComputedStyle(el).objectFit==='contain'&&el.naturalWidth){const scale=Math.min(r.width/el.naturalWidth,r.height/el.naturalHeight),width=el.naturalWidth*scale,height=el.naturalHeight*scale;return {x:r.x+(r.width-width)/2,y:r.y+(r.height-height)/2,width,height};}return r;}
 function capture(nodes){return [...nodes].map(el=>({el,rect:visualRect(el)}));}
 function settle(items,duration,done){
  const moves=items.map(({el,rect})=>{const id=(motionIds.get(el)||0)+1;motionIds.set(el,id);el.style.removeProperty('transform');const end=visualRect(el),base=getComputedStyle(el).transform;return {el,id,base:base==='none'?'':base,dx:rect.x+rect.width/2-end.x-end.width/2,dy:rect.y+rect.height/2-end.y-end.height/2,sx:rect.width/end.width,sy:rect.height/end.height};});
  tween(duration,t=>{const u=1-ease(t);for(const m of moves){if(motionIds.get(m.el)!==m.id)continue;m.el.style.transformOrigin='center';m.el.style.transform=`${m.base} translate(${m.dx*u}px,${m.dy*u}px) scale(${1+(m.sx-1)*u},${1+(m.sy-1)*u})`;}},()=>{for(const m of moves){if(motionIds.get(m.el)!==m.id)continue;m.el.style.removeProperty('transform');m.el.style.removeProperty('transform-origin');}done?.();});
 }
 function view(bg){
  document.querySelector('.scene-outgoing')?.remove();
  const old=scene.childElementCount&&phase!=='loading'?scene.cloneNode(true):null;
  if(old){old.removeAttribute('id');old.classList.add('scene-outgoing');old.setAttribute('aria-hidden','true');old.inert=true;old.querySelectorAll('video').forEach(v=>v.remove());game.append(old);}
  scene.classList.remove('checking-scene','blast-focused','failure-focused','video-page');scene.style.transform='';scene.style.opacity=old?'0':'1';BlastAudio.setScene(phase);token++;jobs.length=0;tweens.length=0;cancelDrag();scene.replaceChildren();particles.length=0;ctx.clearRect(0,0,game.clientWidth,game.clientHeight);scene.style.backgroundImage=`url("${asset(bg)}")`;selected=null;
  navigating=!!old;
  if(old)tween(C.timing.transition,t=>{scene.style.opacity=String(ease(t));old.style.opacity=String(1-ease(t));},()=>{old.remove();scene.style.removeProperty('opacity');navigating=false;});
 }
 document.querySelector('#game-exit').onclick=()=>{if(phase==='loading')return;unlockAudio();scene.querySelectorAll('video').forEach(v=>v.pause());BlastAudio.stopEffects();introduction();};
 function revealControl(ms,create){later(navigating?Math.max(ms,C.timing.transition+30):ms,()=>{const el=create();el.classList.add('control-reveal');});}
 function fullscreen(){const fn=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen;if(fn&&!document.fullscreenElement){try{Promise.resolve(fn.call(document.documentElement)).catch(()=>{});}catch{}}}
 function landing(){document.querySelector('#game-exit').disabled=false;phase='landing';view(`page-1/page-1${C.theme==='diwali'?'':'-non-diwali'}-bg.webp`);const glow=document.createElement('div');glow.className='landing-glow';scene.append(glow);revealControl(350,()=>button('next-button.webp','Next','landing-next',()=>{fullscreen();progress.demoComplete?introduction():demoPage(0);}));revealControl(550,()=>button('page-1/demo-button.webp','Demo','demo-button',()=>demoPage(0)));}
 function introduction(){phase='intro';demo=false;view('page-2/page-2-bg.webp');
  copy(`Finish under ${seconds(BlastLogic.target(progress))}\nto light a diya.`, 'home-target');
  for(let i=0;i<progress.streak.length;i++)diyaFlame(`art home-diya diya-${i}`);
  copy(`Gold Stars: ${progress.stars}  |  Diya streak: ${progress.streak.length}/3`,'home-progress');
  revealControl(700,()=>button('page-2/start-challenge-button.webp','Start Challenge','start-challenge',()=>board(false)));
 }
 function demoPage(index){phase='demo';demo=true;view('page-3/page-3-bg.webp');scene.style.backgroundImage='none';
  const frame=copy('','demo-slide-frame');
  image(`demo/page-${index+1}-demo.webp`,'demo-slide-image',frame,`Demo ${index+1} of 3`);
  copy(`Demo ${index+1} of 3`,'demo-kicker sr-only');
  const next=document.createElement('button');next.className='demo-slide-next';next.setAttribute('aria-label','Next');
  if(index<2)image('next-button.webp','',next,'');
  next.onclick=()=>{if(navigating)return;unlockAudio();if(index<2)demoPage(index+1);else{progress.demoComplete=true;save();introduction();}};
  frame.append(next);
  if(index>0){const previous=document.createElement('button');previous.className='demo-slide-previous';previous.type='button';previous.setAttribute('aria-label','Previous');previous.innerHTML='<span aria-hidden="true">&#8249;</span> Previous';previous.onclick=()=>{if(navigating)return;unlockAudio();demoPage(index-1);};frame.append(previous);}
 }
 function shuffled(){const a=C.pairs.map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 let trayOrder=[],rowOrder=C.pairs.map((_,i)=>i);
 function nextOrder(previous){const order=shuffled();if(order.every((id,i)=>id===previous[i]))order.push(order.shift());return order;}
 function board(isDemo){demo=isDemo;phase='entering';view('page-3/page-3-bg.webp');slots=Array(5).fill(null);remaining=C.roundSeconds;elapsedMs=0;outcome=null;wrongPair=-1;trayOrder=nextOrder(trayOrder);rowOrder=nextOrder(rowOrder);
  const timer=document.createElement('div');timer.className='timer';timer.style.backgroundImage=`url("${asset('page-3/time-panel.webp')}")`;timer.innerHTML='<span class="sr-only">Time</span><strong></strong>';timer.setAttribute('role','timer');scene.append(timer);
  createFuse('art thread');const rows=document.createElement('div');rows.className='board';scene.append(rows);
  rowOrder.forEach((id,i)=>{const pair=C.pairs[id],row=document.createElement('div');row.className='pair-row';row.dataset.pair=id;row.style.setProperty('--i',i);image(`page-3/${pair.left}`,'term',row,pair.term);const slot=document.createElement('div');slot.className='slot';slot.dataset.slot=id;slot.setAttribute('role','group');slot.setAttribute('aria-label',`Match for ${pair.term}`);const target=document.createElement('button');target.className='slot-target';target.style.cssText='position:absolute;inset:0;width:100%;height:100%';target.setAttribute('aria-label',`Place selected meaning beside ${pair.term}`);target.onclick=()=>{if(selected!==null)place(selected,id);};slot.append(target);row.append(slot);rows.append(row);});
  image('page-3/meaning-panel.webp','art meaning-panel');const tray=document.createElement('div');tray.className='tray';tray.setAttribute('aria-label','Meanings');scene.append(tray);
  const light=button('page-3/light-button.webp','Light','light-button',()=>finish(false));light.disabled=true;
  renderMeanings();updateTimer();
  later(C.timing.entrance,()=>{phase='playing';BlastAudio.setScene(phase);last=performance.now();renderMeanings();});
 }
 function meaning(id){const b=document.createElement('button');b.type='button';b.className='meaning';b.dataset.id=id;b.setAttribute('aria-label',C.pairs[id].meaning);b.setAttribute('aria-pressed',String(selected===id));image(`page-3/${C.pairs[id].right}`,'',b);b.onclick=()=>{if(phase!=='playing'||demo||performance.now()<Number(b.dataset.suppressUntil||0))return;const destination=slots.indexOf(id);if(selected!==null&&selected!==id&&destination>=0){place(selected,destination);return;}selected=selected===id?null:id;highlight();};b.onpointerdown=e=>startDrag(e,b,id);b.onkeydown=e=>{if((e.key==='Delete'||e.key==='Backspace')&&phase==='playing'&&!demo){const i=slots.indexOf(id);if(i>=0){slots[i]=null;renderMeanings();}e.preventDefault();}};return b;}
 function renderMeanings(){const existing=new Map([...scene.querySelectorAll('.meaning')].map(e=>[+e.dataset.id,e]));const get=id=>existing.get(id)||meaning(id);scene.querySelectorAll('.meaning').forEach(e=>e.remove());slots.forEach((id,i)=>{const s=scene.querySelector(`[data-slot="${i}"]`);s.classList.toggle('filled',id!==null);if(id!==null)s.append(get(id));});for(const id of trayOrder)if(!slots.includes(id))scene.querySelector('.tray').append(get(id));const b=scene.querySelector('.light-button');if(b){b.disabled=slots.some(v=>v===null)||phase!=='playing';b.classList.toggle('ready',!b.disabled);}highlight();}
 function highlight(){scene.querySelectorAll('.meaning').forEach(b=>{b.classList.toggle('selected',+b.dataset.id===selected);b.setAttribute('aria-pressed',String(+b.dataset.id===selected));});scene.querySelectorAll('.slot').forEach(s=>s.classList.toggle('target',selected!==null));}
 function place(id,index){if(phase!=='playing')return;const moving=capture(scene.querySelectorAll('.meaning img'));const old=slots.indexOf(id),replaced=slots[index];if(old>=0)slots[old]=replaced;slots[index]=id;selected=null;renderMeanings();settle(moving,C.timing.placement);document.querySelector('#announcement').textContent=`${C.pairs[id].meaning} matched with ${C.pairs[index].term}`;}
 function startDrag(e,b,id){if(phase!=='playing'||demo||e.button>0)return;dragging={id,b,pointer:e.pointerId,x:e.clientX,y:e.clientY,moved:false};b.setPointerCapture(e.pointerId);b.onpointermove=moveDrag;b.onpointerup=endDrag;b.onpointercancel=cancelDrag;}
 function moveDrag(e){if(!dragging||dragging.pointer!==e.pointerId)return;const d=dragging;if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>7){d.moved=true;const r=d.b.getBoundingClientRect();d.ghost=d.b.querySelector('img').cloneNode();d.ghost.className='drag-ghost';d.ghost.style.width=`${r.width}px`;d.ghost.style.height=`${r.height}px`;document.body.append(d.ghost);d.b.classList.add('dragging');}if(d.ghost){d.ghost.style.left=`${e.clientX-d.ghost.offsetWidth/2}px`;d.ghost.style.top=`${e.clientY-d.ghost.offsetHeight/2}px`;}}
 function endDrag(e){if(!dragging)return;const d=dragging;let target=null;if(d.moved){target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-slot]');d.b.dataset.suppressUntil=performance.now()+100;e.preventDefault();}cancelDrag();if(target)place(d.id,+target.dataset.slot);else if(d.moved)renderMeanings();}
 function cancelDrag(){if(dragging){dragging.ghost?.remove();dragging.b.classList.remove('dragging');try{dragging.b.releasePointerCapture(dragging.pointer);}catch{}dragging=null;}}
 function updateTimer(){const t=scene.querySelector('.timer');if(!t)return;t.querySelector('strong').textContent=`${Math.ceil(remaining)}s`;t.classList.toggle('urgent',!demo&&phase==='playing'&&remaining>0&&remaining<=10);t.classList.toggle('critical',!demo&&phase==='playing'&&remaining>0&&remaining<=5);if(phase==='playing'&&!demo)BlastAudio.urgent(remaining);t.setAttribute('aria-label',`${Math.ceil(remaining)} seconds remaining`);}
 function burst(x,y,count=65){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=45+Math.random()*170;particles.push({x:x*game.clientWidth,y:y*game.clientHeight,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:.8+Math.random()*1.1,size:2+Math.random()*4,color:['#ffd449','#ff663b','#fff2c2','#f883ff','#6dfaff'][i%5]});}}
 // Soft smoke sprites are painted once; live effects only transform cached bitmaps.
 const smokeSprites=new Map();
 // Slice the original artwork without changing its proportions or visible design.
 function createFuse(cls){const el=copy('',cls);el.setAttribute('aria-hidden','true');el.innerHTML='<svg viewBox="0 0 66 798" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">'+Array.from({length:60},(_,i)=>{const y=i*13.3;return `<g class="fuse-section" data-y="${y}" transform="translate(0 ${y})"><svg width="66" height="13.3" viewBox="0 ${y} 66 13.3" overflow="hidden"><image href="${asset('page-3/thread.webp')}" width="66" height="798"/></svg></g>`;}).join('')+'</svg>';return el;}
 function burnFuse(el,screenY){const r=el.getBoundingClientRect(),height=Math.min(r.height,r.width*798/66),top=r.top+(r.height-height)/2,edge=(screenY-top)/height*798;for(const part of el.querySelectorAll('.fuse-section:not(.charred)')){const y=Number(part.dataset.y);if(y<edge)continue;part.classList.add('charred');part.style.filter='grayscale(1) brightness(.18)';tween(1250,t=>{const bend=Math.sin(y*.13)*8*t;part.setAttribute('transform',`translate(${bend} ${y+9*t}) translate(33 0) rotate(${Math.sin(y)*35*t}) scale(${1-.85*t} 1) translate(-33 0)`);part.style.opacity=String(1-.98*t);});}}
 function fireBloom(x,y,strength=1){particles.push({kind:'glow',x:x*game.clientWidth,y:y*game.clientHeight,vx:0,vy:0,age:0,life:.55,size:game.clientWidth*.55*strength});for(let i=0;i<22;i++){const a=Math.random()*Math.PI*2,s=40+Math.random()*170;particles.push({kind:'fire',x:x*game.clientWidth,y:y*game.clientHeight,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:.25+Math.random()*.45,size:(10+Math.random()*22)*strength,color:i%2?'#ff751a':'#fff3a6'});}}
 function smokeSprite(dark){if(smokeSprites.has(dark))return smokeSprites.get(dark);const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');for(let i=0;i<9;i++){const x=32+Math.random()*32,y=32+Math.random()*32,r=12+Math.random()*18,grad=g.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,dark?'rgba(20,17,22,.6)':'rgba(218,207,191,.4)');grad.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=grad;g.fillRect(0,0,96,96);}smokeSprites.set(dark,c);return c;}
 function smoke(x,y,dark=true,anchor=null){for(let i=0;i<18;i++)particles.push({kind:'smoke',anchor,anchorX:anchor?.x,anchorY:anchor?.y,sprite:smokeSprite(dark),x:x*game.clientWidth,y:y*game.clientHeight,vx:(Math.random()-.5)*45,vy:-25-Math.random()*40,age:-i*.035,life:1.8,size:game.clientWidth*(.07+Math.random()*.07),angle:Math.random()*6,spin:(Math.random()-.5)*.5});}
 function blastImpact(x,y){
  scene.classList.add('blast-focused');
  const light=copy('','blast-illumination');light.style.background=`radial-gradient(ellipse at ${x*100}% ${y*100}%,#fff2b9 0%,#ffb12b99 38%,#ff621b44 75%,transparent),linear-gradient(#ff9c2922,#ffbf5266)`;
  tween(560,t=>{light.style.opacity=String(.82*Math.pow(1-t,1.6));},()=>light.remove());
  tween(360,t=>{const force=(1-t)*(1-t),px=Math.min(9,game.clientWidth*.022);scene.style.transform=`translate(${Math.sin(t*75)*px*force}px,${Math.cos(t*93)*px*.7*force}px) scale(${1+.025*force})`;},()=>scene.style.transform='');
 }
 function gifEffect(path,x,y,cls,hold){const im=image(`effects/${path}`,`art supplied-effect ${cls}`);im.style.left=`${x*100}%`;im.style.top=`${y*100}%`;if(hold)later(hold,()=>fade(im,0,200,()=>im.remove()));return im;}
 function diyaFlame(cls,parent=scene){const wrap=copy('',cls+' supplied-flame',parent);image('effects/diya-flame.gif','gif-flame-art',wrap);return wrap;}
 function crackerBlast(row,x,y){
  gifEffect('cracker-blast.gif',x,y,'blast-gif',700);blastImpact(x,y);const base=game.getBoundingClientRect();
  for(const img of row.querySelectorAll('img')){const r=visualRect(img);for(let i=0;i<60;i++){const col=i%12,line=Math.floor(i/12);particles.push({kind:'paper',image:img,sx:col*img.naturalWidth/12,sy:line*img.naturalHeight/5,sw:img.naturalWidth/12,sh:img.naturalHeight/5,x:r.x-base.left+r.width*(col+.5)/12,y:r.y-base.top+r.height*(line+.5)/5,vx:(Math.random()-.5)*480,vy:-80-Math.random()*310,age:0,life:1.6+Math.random()*.6,size:r.width/12,h:r.height/5,angle:Math.random()*3,spin:(Math.random()-.5)*24});}
   const cx=(r.x-base.left+r.width/2)/base.width;fireBloom(cx,y);smoke(cx,y,false);
   for(let j=0;j<3;j++)later(80+j*100,()=>fireBloom(Math.max(.07,Math.min(.93,cx+(Math.random()-.5)*.3)),y+(Math.random()-.5)*.08,.55));
  }
  for(let i=0;i<120;i++)particles.push({kind:'scrap',x:(x+(Math.random()-.5)*.65)*game.clientWidth,y:y*game.clientHeight,vx:(Math.random()-.5)*540,vy:-40-Math.random()*340,age:0,life:1.7+Math.random()*.5,size:3+Math.random()*7,h:4+Math.random()*10,angle:Math.random()*6,spin:(Math.random()-.5)*28,color:['#b9231a','#e74728','#f7d2a0','#8b2d20'][i%4]});
  row.classList.add('blast');
  for(let i=0;i<28;i++){const a=Math.random()*Math.PI*2,s=35+Math.random()*150;particles.push({kind:'fire',x:(x+(Math.random()-.5)*.5)*game.clientWidth,y:y*game.clientHeight,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:.35+Math.random()*.35,size:10+Math.random()*18,color:i%2?'#ff751a':'#fff3a6'});}
  smoke(x,y,false);burst(x,y,55);pop();
 }
 function paint(dt){ctx.clearRect(0,0,game.clientWidth,game.clientHeight);if(particles.length>2200)particles.splice(0,particles.length-2200);for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.age+=dt;if(p.age>p.life){particles.splice(i,1);continue;}if(p.age<0)continue;const t=p.age/p.life;if(p.anchor){p.x+=p.anchor.x-p.anchorX;p.y+=p.anchor.y-p.anchorY;p.anchorX=p.anchor.x;p.anchorY=p.anchor.y;}if(p.kind==='paper'||p.kind==='scrap'){p.vx+=Math.sin(p.age*11+p.spin)*75*dt;p.vx*=Math.exp(-.38*dt);}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.kind==='smoke'?-5:['paper','scrap'].includes(p.kind)?230:p.kind==='glow'?0:70)*dt;ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=p.kind==='smoke'?Math.sin(Math.PI*t)*.85:1-t;if(p.kind==='smoke'){const size=p.size*(1+3*t);ctx.rotate(p.angle+p.spin*p.age);ctx.drawImage(p.sprite,-size/2,-size/2,size,size);}else if(p.kind==='paper'){ctx.rotate(p.angle+p.spin*p.age);ctx.scale(1,.35+.65*Math.abs(Math.cos(p.age*7)));ctx.beginPath();ctx.moveTo(-p.size/2,-p.h/2);ctx.lineTo(p.size*.35,-p.h*.4);ctx.lineTo(p.size/2,p.h*.35);ctx.lineTo(-p.size*.3,p.h/2);ctx.closePath();ctx.clip();ctx.drawImage(p.image,p.sx,p.sy,p.sw,p.sh,-p.size/2,-p.h/2,p.size,p.h);}else if(p.kind==='scrap'){ctx.rotate(p.angle+p.spin*p.age);ctx.scale(1,.3+.7*Math.abs(Math.cos(p.age*8)));ctx.fillStyle=p.color;ctx.beginPath();ctx.moveTo(-p.size/2,-p.h/2);ctx.lineTo(p.size/2,-p.h*.25);ctx.lineTo(p.size*.3,p.h/2);ctx.lineTo(-p.size*.4,p.h*.3);ctx.fill();}else if(p.kind==='glow'){ctx.globalCompositeOperation='screen';ctx.globalAlpha=(1-t)*.38;const r=p.size*(.5+t),g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'#fff3b0');g.addColorStop(.25,'#ff9a28');g.addColorStop(1,'rgba(255,50,0,0)');ctx.fillStyle=g;ctx.fillRect(-r,-r,r*2,r*2);}else if(p.kind==='fire'){ctx.globalCompositeOperation='lighter';const r=p.size*(1-t),g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'#fffde4');g.addColorStop(.3,p.color);g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();}else{ctx.fillStyle=p.color;ctx.fillRect(0,0,p.size,p.size*.6);}ctx.restore();}}

 function finish(expired){
  if(phase!=='playing'||demo||(!expired&&slots.some(v=>v===null)))return;
  // Account for the fraction of time since the last animation frame at the actual tap.
  if(!paused()){const now=performance.now();tick(Math.max(0,now-last));last=now;}
  expired=expired||remaining<=0;phase='checking';cancelDrag();selected=null;highlight();
  const correct=slots.every((id,i)=>id===i);
  previousStreak=progress.streak.slice();outcome=BlastLogic.complete(progress,{correct,expired,elapsedMs});progress=outcome.progress;save();
  if(expired){scene.querySelectorAll('button').forEach(b=>b.disabled=true);copy("Time's up!",'timeout-label');later(C.timing.timeoutHold,()=>streakLost(true));return;}BlastAudio.fuse(true);
  scene.querySelectorAll('button').forEach(b=>b.disabled=true);scene.querySelector('.timer').classList.remove('urgent','critical');
  const moving=capture(scene.querySelectorAll('.term,.slot .meaning img,.thread,.light-button'));
  scene.classList.add('checking-scene');
  const rig=copy('','checking-rig'),boardNode=scene.querySelector('.board'),thread=scene.querySelector('.thread');
  boardNode.classList.add('checking');thread.classList.add('checking');rig.append(boardNode,thread);
  for(const cls of ['.tray','.meaning-panel']){const el=scene.querySelector(cls);el.style.pointerEvents='none';fade(el,0,C.timing.assemble,()=>el.style.visibility='hidden');}
  fade(scene.querySelector('.timer strong'),0,C.timing.assemble);
  scene.querySelector('.light-button').classList.remove('ready');
  let sparkler,tip;
  const rows=[...boardNode.querySelectorAll('.pair-row')];
  function point(index){const g=game.getBoundingClientRect(),r=thread.getBoundingClientRect(),row=index===null?null:rows[index].getBoundingClientRect();return {x:(r.left+r.width/2-g.left)/g.width,y:((row?row.top+row.height/2:r.bottom)-g.top)/g.height};}
  function positionTip(x,y){tip.style.left=`${x*100}%`;tip.style.top=`${y*100}%`;burnFuse(thread,game.getBoundingClientRect().top+y*game.clientHeight);}

  function check(index){
   const started=clock,duration=index===4?C.timing.ignition:C.timing.burstGap;
   function burn(){const startPoint=point(index===4?null:index+1),endPoint=point(index),to=endPoint.y,t=Math.min((clock-started)/duration,1),y=startPoint.y+(to-startPoint.y)*t;const x=endPoint.x;positionTip(x,y);burst(x,y,4);
    if(t<1){later(30,burn);return;}
    if(slots[rowOrder[index]]!==rowOrder[index]){wrongPair=rowOrder[index];failedCracker(rows[index],tip);return;}
    crackerBlast(rows[index],x,to);
    if(index>0)check(index-1);else{burnFuse(thread,thread.getBoundingClientRect().top);BlastAudio.fuse(false);tip.remove();scene.querySelector('.sparkler')?.remove();later(C.timing.correctHold,()=>result(true));}
   }burn();
  }
  settle(moving,C.timing.assemble,()=>{
   sparkler=image('page-3/sparkler.webp','sparkler',rig);sparkler.style.animation='none';const approachSpark=image('effects/cracker-sparkle.gif','art approach-sparkle',rig);approachSpark.style.opacity='0';
   tween(C.timing.sparklerApproach,t=>{const u=1-ease(t);approachSpark.style.opacity=String(ease(t));approachSpark.style.transform=`translate(calc(-50% + ${18*u}px),calc(-50% + ${32*u}px))`;sparkler.style.opacity=String(ease(t));sparkler.style.transform=`translate(${18*u}px,${32*u}px)`;},()=>{
    approachSpark.remove();tip=copy('','fuse-tip');image('effects/cracker-sparkle.gif','fuse-sparkle-gif',tip);const contact=point(null);positionTip(contact.x,contact.y);burst(contact.x,contact.y,24);
    later(C.timing.contact,()=>{fade(sparkler,0,500,()=>sparkler.remove());check(4);});
   });
  });
 }

 function failedCracker(row,tip){
  BlastAudio.fuse(false);scene.querySelector('.sparkler')?.remove();
  const rig=scene.querySelector('.checking-rig');
  scene.classList.add('blast-focused','failure-focused');row.classList.add('failure-target');
  for(const other of rig.querySelectorAll('.pair-row'))if(other!==row&&!other.classList.contains('blast'))fade(other,.12,450);
  // Let the previous successful detonation settle before taking the camera closer.
  later(C.timing.failSettle,()=>{
   const thread=rig.querySelector('.thread'),boardNode=rig.querySelector('.board'),anchors=[{x:0,y:0},{x:0,y:0}];let failureGif;
   const sockets=[47.5,52.5].map(left=>{const point=copy('','failure-socket',row);point.style.left=`${left}%`;return point;});
   const camera=t=>{
    const localY=boardNode.offsetTop+row.offsetTop+row.offsetHeight/2,localX=thread.offsetLeft+thread.offsetWidth/2;
    rig.style.transformOrigin=`${localX}px ${localY}px`;
    const dy=game.clientHeight*.43-(rig.offsetTop+localY);
    rig.style.transform=`translateX(-50%) translateY(${dy*t}px) scale(${1+.16*t})`;
    const g=game.getBoundingClientRect(),r=thread.getBoundingClientRect(),rowBox=row.getBoundingClientRect(),x=(r.left+r.width/2-g.left)/g.width,y=(rowBox.top+rowBox.height/2-g.top)/g.height;
    tip.style.left=`${x*100}%`;tip.style.top=`${y*100}%`;
    if(failureGif){failureGif.style.left=`${x*100}%`;failureGif.style.top=`${y*100}%`;}
    sockets.forEach((point,i)=>{const r=point.getBoundingClientRect();anchors[i].x=r.left-g.left;anchors[i].y=r.top-g.top;});
   };
   tween(C.timing.failZoom,t=>camera(ease(t)),()=>{
    row.classList.add('fuse-struggling');tip.classList.add('struggling-tip');
    const flicker=copy('','failure-ember',row);BlastAudio.struggle();for(const at of [80,320,570,880,1150,1340])later(at,()=>{const r=tip.getBoundingClientRect(),g=game.getBoundingClientRect();burst((r.left+r.width/2-g.left)/g.width,(r.top+r.height/2-g.top)/g.height,12);});
    tween(C.timing.failStruggle,t=>{const pulse=.4+.6*Math.abs(Math.sin(t*19));tip.style.opacity=String(pulse*(1-.55*t));tip.style.transform=`translate(-50%,-50%) scale(${.9+pulse*.35})`;flicker.style.opacity=String(pulse*(1-t*.6));row.style.transform=`rotate(${Math.sin(t*45)*(1-t)*1.1}deg)`;camera(1);},()=>{
     tip.remove();flicker.remove();row.classList.remove('fuse-struggling');row.classList.add('failed-dud');row.style.transform='rotate(3deg)';BlastAudio.wrong();
     camera(1);failureGif=gifEffect('cracker-fail.gif',0,0,'fail-gif failure-closeup',C.timing.failSmoke-100);camera(1);
     for(const anchor of anchors)smoke(anchor.x/game.clientWidth,anchor.y/game.clientHeight,true,anchor);
     tween(C.timing.failSmoke,()=>camera(1),()=>tween(C.timing.failReturn,t=>camera(1-ease(t)),()=>{rig.style.transform='translateX(-50%)';rig.style.transformOrigin='';sockets.forEach(point=>point.remove());result(false);}));

    });
   });
  });
 }
 function result(correct){phase='result';BlastAudio.setScene(phase);const shade=copy('','feedback-shade');image(correct?'page-5/correct-panel.webp':'page-6/wrong-panel.webp','feedback-panel',scene,correct?'Correct!':'Incorrect!');
  if(correct){for(let i=0;i<5;i++)later(i*250,()=>burst(.1+Math.random()*.8,.15+Math.random()*.5,75));later(C.timing.feedback,()=>button('next-button.webp','Next','result-next',()=>outcome.qualified?streakPage():streakLost(false)));}
  else later(C.timing.feedback,()=>action('Watch Video and Play Again','result-next video-action',feedbackVideo));
  document.querySelector('#announcement').textContent=correct?'All five matches correct!':'Incorrect match. Review the feedback.';
 }
 function timeLabels(times,cls=''){for(let i=0;i<3;i++){const el=copy(times[i]===undefined?'--':seconds(times[i]),`round-time ${cls}`);el.style.left=`${11+i*28}%`;}}
 function streakPage(){phase='streak';view('page-8/page-8-bg.webp');copy(`${outcome.times.length} of 3 diyas lit!`,'streak-heading');
  for(let i=0;i<3;i++){const lit=i<outcome.times.length;const im=copy('','streak-diya'+(lit?' lit':''));im.style.left=`${9+i*28}%`;image('page-8/diya.webp','diya-bowl',im);if(lit){const flame=diyaFlame('diya-flame',im);if(i===outcome.times.length-1){flame.style.opacity='0';later(C.timing.diyaLead,()=>{im.classList.add('new-diya');fade(flame,1,C.timing.diyaLight);});}}}
  timeLabels(outcome.times);const newest=scene.querySelectorAll('.round-time')[outcome.times.length-1];newest.style.opacity='0';later(C.timing.diyaLead,()=>fade(newest,1,C.timing.diyaLight));
  if(outcome.won)later(C.timing.diyaLead+C.timing.diyaLight+C.timing.diyaHold,goldStar);else revealControl(C.timing.diyaLead+C.timing.diyaLight,()=>button('page-8/play-again-button.webp','Play Again','outcome-action',()=>board(false)));
 }
 function streakLost(expired){phase='lost';view('page-9/page-9-bg.webp');for(let i=0;i<previousStreak.length;i++){const flame=diyaFlame('art reset-flame');flame.style.left=`${18+i*28}%`;later(500,()=>fade(flame,0,900,()=>flame.remove()));}if(expired)copy("Time's up!",'time-up-sticker');
  copy(expired?'The 60-second timer ran out.\nStart a fresh round.':`Your time: ${seconds(outcome.elapsedMs)}\nFinish under ${seconds(outcome.targetMs)} to light a diya.`,'lost-copy');
  revealControl(C.timing.resetHold,()=>button('page-9/try-again-button.webp','Play Again','outcome-action',()=>board(false)));
 }
 function goldStar(){phase='gold';view('page-10/page-10-bg.webp');for(let i=0;i<3;i++){const flame=diyaFlame('art gold-flame');flame.style.left=`${18+i*28}%`;}image('page-10/star.webp','art won-star');timeLabels(outcome.times,'gold-time');
  copy(`Gold Stars: ${progress.stars}`,'star-count');revealControl(C.timing.goldHold,()=>button('page-10/home-button.webp','Home','outcome-action',introduction));
  for(let i=0;i<9;i++)later(i*200,()=>burst(.1+Math.random()*.8,.15+Math.random()*.45,80));
 }
 function feedbackVideo(){phase='video';view('page-3/page-3-bg.webp');scene.classList.add('video-page');const pair=C.pairs[wrongPair];copy(pair.term,'video-heading');
  if(pair.video){const video=document.createElement('video');video.className='feedback-video';video.controls=true;video.playsInline=true;video.preload='metadata';video.autoplay=true;video.src=/^https:\/\//.test(pair.video)?pair.video:asset(pair.video);scene.append(video);video.play().catch(()=>{if(!video.isConnected)return;const tap=document.createElement('button');tap.className='video-tap';tap.textContent='Tap to play';tap.onclick=()=>video.play().then(()=>tap.remove()).catch(()=>{});scene.append(tap);video.addEventListener('playing',()=>tap.remove(),{once:true});});}
  else{const panel=copy('','video-placeholder');copy('Feedback video coming soon','',panel);copy(`${pair.term} = ${pair.meaning}`,'video-answer',panel);}
  button('page-8/play-again-button.webp','Play Again','outcome-action',()=>{scene.querySelector('video')?.pause();board(false);});
 }
 const required=['demo/page-1-demo.webp','demo/page-2-demo.webp','demo/page-3-demo.webp','effects/cracker-sparkle.gif','effects/diya-flame.gif','effects/cracker-fail.gif','effects/cracker-blast.gif','page-8/page-8-bg.webp','page-8/diya.webp','page-8/diya-lit.webp','page-8/play-again-button.webp','page-9/page-9-bg.webp','page-9/try-again-button.webp','page-10/page-10-bg.webp','page-10/star.webp','page-10/home-button.webp','page-2/page-2-bg.webp','page-2/start-challenge-button.webp','next-button.webp','page-1/demo-button.webp','page-1/page-1-bg.webp','page-1/page-1-non-diwali-bg.webp','page-3/page-3-bg.webp','page-3/thread.webp','page-3/time-panel.webp','page-3/meaning-panel.webp','page-3/light-button.webp','page-3/sparkler.webp','page-5/correct-panel.webp','page-6/wrong-panel.webp',...C.pairs.flatMap(p=>[`page-3/${p.left}`,`page-3/${p.right}`])];
 async function load(){phase='loading';view('page-1/page-1-bg.webp');const box=document.createElement('div');box.className='loader';box.innerHTML='<span>Loading...</span><progress max="1" value="0"></progress>';scene.append(box);let done=0;try{await Promise.all([...required,'__audio__'].map(async path=>{if(path==='__audio__')await BlastAudio.load();else{const im=new Image();im.src=asset(path);await im.decode();}done++;box.querySelector('progress').value=done/(required.length+1);box.querySelector('span').textContent=`Loading ${Math.round(done/(required.length+1)*100)}%`;}));landing();}catch{box.replaceChildren();const b=document.createElement('button');b.className='load-retry';b.textContent='Loading failed. Tap to retry';b.onclick=load;box.append(b);}}
 load();
 if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
})();

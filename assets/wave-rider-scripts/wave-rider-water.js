(() => {
'use strict';
const game=document.querySelector('#game');
const canvas=document.createElement('canvas');canvas.id='ocean';canvas.setAttribute('aria-hidden','true');game.prepend(canvas);
const spray=document.createElement('canvas');spray.id='water-effects';spray.setAttribute('aria-hidden','true');game.append(spray);
const wake=document.createElement('canvas');wake.id='boat-wake';wake.setAttribute('aria-hidden','true');game.insertBefore(wake,document.querySelector('#scene'));
const ctx=canvas.getContext('2d',{alpha:false}),fx=spray.getContext('2d'),wakeCtx=wake.getContext('2d');
const tau=Math.PI*2;
let boatPose=null;
let width=1,height=1,dpr=1,last=0,emitted=0,particles=[],event=null,previous=null,saluteAt=-Infinity,effectEmitted=0,saluteSpray=[];
function resize(){const r=game.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(devicePixelRatio,1.5);for(const c of [canvas,spray,wake]){c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);fx.setTransform(dpr,0,0,dpr,0,0);wakeCtx.setTransform(dpr,0,0,dpr,0,0);}
new ResizeObserver(resize).observe(game);resize();
const random=(a,b)=>a+Math.random()*(b-a);
function add(p){if(particles.length<320)particles.push(p);}
window.WaveWater={
 pose(x,y,heading,bob,w,h,boat){boatPose={x,y,heading,bob,w,h,boat};},
 clearPose(){boatPose=null;},
 reset(){boatPose=null;event=null;particles=[];previous=null;saluteAt=-Infinity;saluteSpray=[];game.style.removeProperty('--splash-blur');},
 bob(x,y,t){
  // Slow heave is continuous across lane changes and current-speed boosts.
  const seconds=t*.001;
  return Math.sin(seconds*tau/3.4)*2+Math.sin(seconds*tau/5.7+.8)*.65;
 },
 salute(delay=0){
  saluteAt=performance.now()+delay;
  // Sample once: coherent trajectories, never frame-to-frame random flicker.
  saluteSpray=Array.from({length:560},(_,i)=>({side:i%2?1:-1,delay:random(0,1.55),
   vx:random(.68,.78),vy:random(1.0,1.12),origin:random(.79,.83),
   life:random(1.18,1.52),size:random(.0018,.009),mist:i%4===0}));
  // Low, broad secondary spray fills the foreground beneath the main arch.
  // Seed once so droplets move continuously instead of flickering each frame.
  saluteSpray.push(...Array.from({length:420},(_,i)=>({
   foreground:true,side:i%2?1:-1,delay:random(.08,1.65),
   vx:random(.2,.7),vy:random(.18,.38),origin:random(.94,1.04),
   life:random(.65,1.05),size:random(.003,.011),mist:i%5===0
  })));


 },
 crossing(x){
  const line=game.querySelector(x>.5?'.lane.right img:last-child':'.lane.left img:last-child');
  if(!line)return;const r=line.getBoundingClientRect(),g=game.getBoundingClientRect();
  const y=r.top-g.top+r.height*.64;
  for(let i=0;i<45;i++)add({kind:'foam',x:x*width+random(-18,18),y:y+random(-3,3),vx:random(-65,65),vy:random(-40,40),life:random(.45,.9),age:0,r:random(1,2.5)*width/390});
 },
 impact(kind,x,y){
  event={kind,x:x*width,y:y*height,start:performance.now()};
  for(let i=0;i<(kind==='crash'?65:30);i++){
   const angle=random(0,tau),speed=random(15,kind==='crash'?160:50)*width/390;
   add({kind:kind==='crash'?'ember':'foam',x:x*width,y:y*height,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:random(.5,1.4),age:0,r:random(1,3)*width/390});
  }
 }
};
// Low-resolution, continuously shaded wave surface; browser interpolates to the stage.
// Separable phases avoid trigonometry per pixel and keep mobile rendering bounded.
const surface=document.createElement('canvas');surface.width=192;surface.height=320;
const surfaceCtx=surface.getContext('2d'),surfacePixels=surfaceCtx.createImageData(192,320);
const swells=[ [.72,7.7,.64,.65],[-1.31,13.9,.91,.32],[2.17,24.3,1.23,.16],
 [-3.63,39.7,1.61,.085],[4.19,62.1,2.07,.045],[-5.71,89.3,2.53,.023] ];
const waveRows=swells.map(()=>new Float32Array(320*2));
const waveCols=swells.map(()=>new Float32Array(192*2));
for(let n=0;n<swells.length;n++)for(let x=0;x<192;x++){
 const u=x/192;const phase=u*swells[n][0]*tau+Math.sin(u*9.13+n*2.3)*.7+Math.sin(u*21.7+n)*.18;
 waveCols[n][x*2]=Math.sin(phase);waveCols[n][x*2+1]=Math.cos(phase);
}
function surfaceWave(t){
 // The same bounded, gentle surface motion on menus and while sailing.
 const seconds=t*.001,advance=Math.sin(seconds*.22)*.008;
 for(let n=0;n<swells.length;n++)for(let y=0;y<320;y++){
  const drift=advance;
  const v=y/320;const phase=(v-drift)*swells[n][1]*tau-seconds*swells[n][2]+Math.sin(v*7.31+n)*.8;
  waveRows[n][y*2]=Math.sin(phase);waveRows[n][y*2+1]=Math.cos(phase);
 }
 const data=surfacePixels.data;
 for(let y=0;y<320;y++)for(let x=0;x<192;x++){
  let h=0,nx=0,ny=0;
  for(let n=0;n<swells.length;n++){
   const c=waveCols[n],r=waveRows[n],w=swells[n];
   const sn=c[x*2]*r[y*2+1]+c[x*2+1]*r[y*2];
   const cs=c[x*2+1]*r[y*2+1]-c[x*2]*r[y*2];
   h+=sn*w[3];nx+=cs*w[0]*w[3]*.13;ny+=cs*w[1]*w[3]*.13;
  }
  const normal=1/Math.sqrt(nx*nx+ny*ny+1);
  const light=Math.max(0,(-nx*.12-ny*.48+.86)*normal);
  // Sky reflected across narrow wave faces, not closed caustic-cell outlines.
  // Exact integer power through six multiplications instead of per-pixel pow.
  const reflect=Math.max(0,(-nx*.08-ny*.3+.95)*normal);
  const r2=reflect*reflect,r4=r2*r2,r8=r4*r4,r16=r8*r8,r32=r16*r16;
  const glint=r32*r16*r4*r2;
  const depth=(h+1.3)/2.6,p=(y*192+x)*4;
  data[p]=2+light*6+glint*24;
  data[p+1]=117+light*36+depth*17+glint*36;
  data[p+2]=173+light*32+depth*15+glint*31;
  data[p+3]=255;
 }
 surfaceCtx.putImageData(surfacePixels,0,0);
}
function ocean(t,flowing){
 surfaceWave(t);
 ctx.save();
 ctx.drawImage(surface,0,0,width,height);
 // No tiled caustics: the entire visible surface is shaded once in stage coordinates.
 const gradient=ctx.createLinearGradient(0,0,width,0);gradient.addColorStop(0,'#00588b24');gradient.addColorStop(.5,'#08b6cb00');gradient.addColorStop(1,'#00588b24');ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
 if(!flowing){
  const boat=game.querySelector('.home-boat img,.reward-boat img');
  if(boat&&boat.naturalWidth){
   const r=boat.getBoundingClientRect(),g=game.getBoundingClientRect(),scale=Math.min(r.width/boat.naturalWidth,r.height/boat.naturalHeight);
   const bw=boat.naturalWidth*scale,bh=boat.naturalHeight*scale,x=r.left-g.left+r.width/2,y=r.top-g.top+r.height/2+bh*.23;
   ctx.lineWidth=1;
   for(let i=0;i<3;i++){
    const phase=(t*.00022+i/3)%1;
    ctx.strokeStyle='rgba(203,255,255,'+(Math.sin(phase*Math.PI)*.18)+')';
    ctx.beginPath();ctx.ellipse(x,y,bw*(.38+phase*.15),bh*(.12+phase*.07),-.08,0,tau);ctx.stroke();
   }
  }
 }
 ctx.restore();
}
// A cached soft foam stamp avoids hard outlines and per-particle gradient work.
const foamStamp=document.createElement('canvas');foamStamp.width=foamStamp.height=32;
const foamCtx=foamStamp.getContext('2d'),foamGlow=foamCtx.createRadialGradient(16,16,1,16,16,16);
foamGlow.addColorStop(0,'#edffffcc');foamGlow.addColorStop(.4,'#c8ffff88');foamGlow.addColorStop(1,'#b8ffff00');foamCtx.fillStyle=foamGlow;foamCtx.fillRect(0,0,32,32);
function emitBoat(t){
 if(t-emitted<24)return;
 const ship=document.querySelector('.play .ship:not(.arrived),.play .ship.pass');
 if(!ship||(ship.classList.contains('pass')&&t-saluteAt>1450)){previous=null;return;}
 let x,y,angle,bw,bh,boat;
 if(boatPose&&!ship.classList.contains('arrived')){
  const p=boatPose;boat=p.boat;angle=p.heading*Math.PI/180;
  const img=ship.querySelector('img'),scale=Math.min(p.w/img.naturalWidth,p.h/img.naturalHeight);
  bw=img.naturalWidth*scale;bh=img.naturalHeight*scale;
  // Same 50% / 60% transform origin and rotate-then-heave as the hull.
  x=p.x+Math.sin(angle)*(p.h*.1-p.bob);
  y=p.y+p.h*.1+Math.cos(angle)*(p.bob-p.h*.1);
 }else{
 const r=ship.getBoundingClientRect(),g=game.getBoundingClientRect(),img=ship.querySelector('img');
 const scale=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight);bw=img.naturalWidth*scale;bh=img.naturalHeight*scale;
 boat=WaveConfig.boats.find(b=>img.getAttribute('src').split('?')[0].endsWith(b.front));
 if(!boat?.waterline)return;
 const style=getComputedStyle(img),matrix=new DOMMatrixReadOnly(style.transform==='none'?undefined:style.transform);
 const origin=style.transformOrigin.split(' ').map(parseFloat),ox=origin[0],oy=origin[1];
 const localX=r.width/2,localY=r.height/2;
 x=r.left-g.left+ox+matrix.a*(localX-ox)+matrix.c*(localY-oy)+matrix.e;
 y=r.top-g.top+oy+matrix.b*(localX-ox)+matrix.d*(localY-oy)+matrix.f;
 angle=Math.atan2(matrix.b,matrix.a);
 }
 if(!boat?.waterline)return;
 const old=previous||{x,y,angle},distance=Math.hypot(x-old.x,y-old.y),steps=Math.min(5,Math.max(1,Math.ceil(distance/5)));
 emitted=t;
 // Deposit foam along the travelled arc, then let it spread independently in the water.
 for(let step=1;step<=steps;step++){
  const f=step/steps,cx=old.x+(x-old.x)*f,cy=old.y+(y-old.y)*f,heading=old.angle+(angle-old.angle)*f;
  const c=Math.cos(heading),sn=Math.sin(heading);
  for(const side of [-1,1])for(let i=0;i<3;i++){
   const line=boat.waterline,along=random(line[0][0],line[line.length-1][0]);
   let index=1;while(index<line.length-1&&line[index][0]<along)index++;
   const a=line[index-1],b=line[index],blend=(along-a[0])/(b[0]-a[0]),edge=side<0?1:2;
   const radius=Math.max(.8,Math.min(bw,bh)*random(.021,.034));
   const hx=(a[edge]+(b[edge]-a[edge])*blend-.5)*bw+side*radius*.85,hy=(along-.5)*bh;
   add({kind:'hullfoam',x:cx+hx*c-hy*sn,y:cy+hx*sn+hy*c,vx:side*random(5,13)*c-sn*12,vy:random(12,24)+side*8*sn,life:random(.48,.8),age:0,r:radius});
  }
  // A separate stern wake follows each hull's own rear waterline, then disperses.
  const stern=boat.waterline[boat.waterline.length-1],rear=(stern[0]-.5)*bh;
  for(const side of [-1,1]){
   const hx=((stern[1]+stern[2])*.5-.5)*bw+side*bw*.055,hy=rear+bh*.025;
   add({kind:'hullfoam',x:cx+hx*c-hy*sn,y:cy+hx*sn+hy*c,
    vx:side*random(8,16)*c-sn*26,vy:random(24,38)*c+side*10*sn,
    life:random(.9,1.25),age:0,r:Math.max(1.2,Math.min(bw,bh)*random(.028,.042))});
  }
 }
 previous={x,y,angle};
}
function drawWaterSalute(age){
 fx.save();
 // Continuous ballistic jets: visible ascent, rounded apex and falling water.
 // Many narrow moving filaments form the stream, without a luminous foam tube.
 for(const side of [-1,1])for(let strand=0;strand<18;strand++){
  const spread=(strand-8.5)/8.5;
  const vx=.73+spread*.04,vy=1.065+Math.sin(strand*2.4)*.025;
  for(let i=1;i<65;i++){
   const t=i/64*1.45,emission=age-t;
   if(emission<0||emission>1.65)continue;
   const pressure=Math.min(1,emission/.1)*Math.min(1,(1.65-emission)/.3);
   const point=u=>({
    x:width*((side<0?-.03:1.03)-side*vx*u+spread*(.008+u*.012)+Math.sin(u*47-age*20+strand)*.002*u),
    y:height*(.81-vy*u+.76*u*u)+Math.sin(u*33-age*18+strand)*width*.002
   });
   const p=point(t),q=point(t-1.45/64);
   fx.globalAlpha=pressure*(t<.65?.5:.32)*Math.min(1,(1.48-t)/.2);
   const baseVolume=1+Math.max(0,1-t/.35)*.85;
   fx.lineWidth=width*(strand%3===0?.006:.004)*(1+t*.3)*baseVolume;
   fx.strokeStyle=strand%3===0?'#d6faff':strand%3===1?'#7ce1f5':'#22b6df';
   fx.lineCap='round';fx.beginPath();fx.moveTo(q.x,q.y);fx.lineTo(p.x,p.y);fx.stroke();
  }
 }

 // Dense ballistic spray breaks apart into mist; no solid ribbons or outlined arcs.
 for(const p of saluteSpray){
  const t=age-p.delay;if(t<0||t>p.life)continue;
  const k=t/p.life,alpha=Math.min(1,t/.08)*Math.pow(1-k,.7);
  const x=(p.side<0?-.025:1.025)*width-p.side*p.vx*width*t;
  const y=height*(p.origin-p.vy*t+(p.foreground?.48:.76)*t*t);
  const r=p.size*width*(1+k*2.3);
  if(p.mist){
   fx.globalAlpha=alpha*.065;
   fx.drawImage(foamStamp,x-r*3,y-r*2,r*6,r*4);
  }else{
   fx.globalAlpha=alpha*.78;
   fx.drawImage(foamStamp,x-r*1.5,y-r,r*3,r*2);
   // Small clear glints sit inside softer foam, not long confetti-like dashes.
   fx.fillStyle='#e3f8ff';fx.beginPath();fx.ellipse(x,y,r*.34,r*.55,-p.side*.5,0,tau);fx.fill();
  }
 }
 fx.restore();
}
function drawEffects(t,dt){
 fx.clearRect(0,0,width,height);wakeCtx.clearRect(0,0,width,height);emitBoat(t);
 const emitNow=t-effectEmitted>=32;if(emitNow)effectEmitted=t;
 const saluteAge=(t-saluteAt)/(1000*window.WaveConfig.timings.celebrationScale);
 if(saluteAge>=0&&saluteAge<3.4){
  drawWaterSalute(saluteAge);

 }else if(saluteAge>=3.4)game.style.removeProperty('--splash-blur');
 if(event){
  const age=(t-event.start)/1000,{x,y,kind}=event;
  if(kind==='crash'){
   if(age<.9){const radius=width*(.05+age*.28),glow=fx.createRadialGradient(x,y,0,x,y,radius);glow.addColorStop(0,'#fffbe8');glow.addColorStop(.18,'#fff3a0');glow.addColorStop(.45,'#ffb323bb');glow.addColorStop(.75,'#ff431355');glow.addColorStop(1,'#ff220000');fx.globalAlpha=Math.max(0,1-age/.9);fx.fillStyle=glow;fx.fillRect(x-radius,y-radius,radius*2,radius*2);fx.globalAlpha=1;}
   if(emitNow&&age<1.7)for(let i=0;i<2;i++)add({kind:'smoke',x:x+random(-24,24)*width/390,y:y+random(-10,6),vx:random(-30,30),vy:random(-55,-20),life:random(1.2,2.2),age:0,r:random(8,18)*width/390});
  }else{
   // Broad surface rings, then bubbles left behind after the hull submerges.
   for(let i=0;i<4;i++){const phase=(age-i*.3);if(phase<0||phase>2)continue;fx.strokeStyle=`rgba(214,255,255,${.55*(1-phase/2)})`;fx.lineWidth=1.4;fx.beginPath();fx.ellipse(x,y+height*.018,width*(.035+phase*.08),width*(.013+phase*.022),0,0,tau);fx.stroke();}
   if(emitNow&&age<2.2)add({kind:'bubble',x:x+random(-12,12),y:y+random(0,18),vx:random(-9,9),vy:random(-25,-10),life:.8,age:0,r:random(1.5,3)});
  }
 }
 particles=particles.filter(p=>p.age<p.life);
 for(const p of particles){
  if(p.kind==='salute')p.vy+=height*.7*dt;
  p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const k=Math.min(1,p.age/p.life),alpha=(1-k);
  fx.globalAlpha=alpha;
  if(p.kind==='hullfoam'){
   const fade=Math.min(1,p.age/.065)*(1-k);wakeCtx.globalAlpha=fade*.98;
   p.vx*=Math.exp(-dt*2);const radius=p.r*(1+k*.8);wakeCtx.drawImage(foamStamp,p.x-radius,p.y-radius*.55,radius*2,radius*1.1);
  }else if(p.kind==='smoke'){
   const r=p.r*(.6+k*2.8),g=fx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
   g.addColorStop(0,'#14262bea');g.addColorStop(.4,'#26383bc9');g.addColorStop(.75,'#34464a65');g.addColorStop(1,'#34464a00');fx.fillStyle=g;fx.fillRect(p.x-r,p.y-r,r*2,r*2);
  }else if(p.kind==='salute'){
   fx.strokeStyle=k<.55?'#e8ffff':'#93eaff';fx.lineWidth=p.r;fx.lineCap='round';fx.beginPath();fx.moveTo(p.x,p.y);fx.lineTo(p.x-p.vx*.018,p.y-p.vy*.018);fx.stroke();
  }else if(p.kind==='ring'||p.kind==='bubble'){
   fx.strokeStyle='#d7ffff';fx.lineWidth=p.kind==='ring'?1:.8;fx.beginPath();fx.ellipse(p.x,p.y,p.r*(1+k*2),p.r*(p.kind==='ring'?.35:1),0,0,tau);fx.stroke();
  }else{
   fx.fillStyle=p.kind==='ember'?(k<.4?'#fff4af':'#ff7837'):'#e5ffff';fx.beginPath();fx.ellipse(p.x,p.y,p.r,p.r*(p.kind==='foam'?.6:1),0,0,tau);fx.fill();if(p.kind==='ember')p.vy+=80*dt;
  }
 }
 fx.globalAlpha=1;
}
let oceanFrame=0;
function tick(t){
 requestAnimationFrame(tick);if(document.hidden)return;
 const dt=Math.min(.05,(t-last)/1000);last=t;
 if(['landing','demo'].includes(game.dataset.screen))return;
 const flowing=game.dataset.screen==='play';
 // Keep the texture at 30fps, but follow hull motion at the display refresh rate.
 if(t-oceanFrame>=32){ocean(t,flowing);oceanFrame=t;}
 drawEffects(t,dt);
}
requestAnimationFrame(tick);
})();

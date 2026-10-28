/* Correct-answer presentation, fitted inside the existing 1.3 second feedback window. */
(function(root){
  root.CarzRewardView = {
    create({app, asset, animate, wait, playSound = () => {}}) {
      const celebrations=new Set();
      let explosionFrames=[];
      return {
        async prepareExplosion() {
          explosionFrames=await Promise.all(root.CarzConfig.explosion.frames.map(async file=>{
            const img=new Image();img.src=asset(file);await img.decode();return img;
          }));
        },
        explosion(container) {
          const config=root.CarzConfig.explosion,img=new Image();img.className='crash-explosion';img.alt='';
          img.style.width=`${config.widthPercent}%`;container.append(img);let time=0,frame=-1;
          const draw=dt=>{if(!img.isConnected){celebrations.delete(draw);return;}time+=dt;
            const index=Math.min(explosionFrames.length-1,Math.floor(time/config.seconds*explosionFrames.length));
            if(index!==frame){img.src=explosionFrames[index].src;frame=index;img.dataset.frame=String(index);}
          };celebrations.add(draw);draw(0);
        },
        update(dt) { for (const draw of celebrations) draw(dt); },
        async confetti() {
          const config=root.CarzConfig.confetti,canvas=document.createElement('canvas');
          canvas.className='celebration-confetti golden-confetti'+(app.querySelector('#modal').hidden?'':' reward-confetti');
          canvas.setAttribute('aria-hidden','true');app.append(canvas);
          const ctx=canvas.getContext('2d');let elapsed=0,width=0,height=0;
          const particles=Array.from({length:config.particles},(_,i)=>({side:i%2,delay:Math.random()*.55,
            vx:.15+Math.random()*.72,vy:.78+Math.random()*.65,gravity:.8+Math.random()*.4,
            size:3+Math.random()*4,spin:Math.random()*Math.PI*2,turn:(Math.random()-.5)*11,
            color:config.colors[i%config.colors.length],ribbon:i%4===0}));
          const draw=dt=>{
            elapsed+=dt;const w=app.clientWidth,h=app.clientHeight;
            if(w!==width||h!==height){width=w;height=h;const dpr=Math.min(root.devicePixelRatio||1,config.pixelRatioLimit);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
            ctx.clearRect(0,0,width,height);
            for(const p of particles){const t=elapsed-p.delay;if(t<0)continue;
              const x=(p.side?width:0)+(p.side?-1:1)*p.vx*width*t;
              const y=height*(1.02-p.vy*t+.5*p.gravity*t*t);
              if(y>height+20||x < -20||x>width+20)continue;
              ctx.save();ctx.translate(x,y);ctx.rotate(p.spin+p.turn*t);
              ctx.globalAlpha=Math.min(1,t*12,Math.max(0,(config.seconds-elapsed)/.45));
              ctx.fillStyle=p.color;
              ctx.scale(Math.max(.15,Math.abs(Math.cos(p.spin+t*7))),1);
              ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*(p.ribbon?2.4:1.2));
              ctx.fillStyle='#fff8';ctx.fillRect(-p.size/2,-p.size/2,p.size,.7);ctx.restore();
            }
          };
          celebrations.add(draw);draw(0);
          try {await wait(config.seconds);} finally {celebrations.delete(draw);canvas.remove();}
        },
        async merge(celebrate, reveal) {
          const config=root.CarzConfig.diamondFinale;
          const layer=document.createElement('div'); layer.className='diamond-finale';
          layer.setAttribute('aria-label','Five diamonds collected');
          const bounds=app.getBoundingClientRect(), sources=[...app.querySelectorAll('#diamonds img')];
          const center={x:bounds.width*config.centerX,y:bounds.height*config.centerY};
          const hero=document.createElement('div'); hero.className='finale-hero';
          layer.style.setProperty('--finale-x',`${config.centerX*100}%`);layer.style.setProperty('--finale-y',`${config.centerY*100}%`);
          hero.style.width=`${config.heroWidth*100}%`;
          const halo=document.createElement('i');halo.className='award-halo';
          const gem=new Image();gem.src=asset('page-5/diamong.webp');gem.alt='Five diamonds combined';hero.append(halo,gem);layer.append(hero);
          Array.from({length:config.sparkCount},(_,i)=>{const spark=document.createElement('i');spark.className='finale-spark';const angle=i*Math.PI*2/config.sparkCount;spark.style.setProperty('--spark-x',`${Math.cos(angle)*bounds.width*config.sparkRadius}px`);spark.style.setProperty('--spark-y',`${Math.sin(angle)*bounds.width*config.sparkRadius}px`);spark.style.setProperty('--spark-delay',`${i%5*config.sparkDelaySeconds}s`);layer.append(spark);});
          const clones=sources.map(source=>{const r=source.getBoundingClientRect(),clone=source.cloneNode();clone.className='finale-small';Object.assign(clone.style,{left:`${r.x-bounds.x}px`,top:`${r.y-bounds.y}px`,width:`${r.width}px`,height:`${r.height}px`});layer.append(clone);return {clone,source,r};});
          app.append(layer);
          try {
            await animate(layer,[{opacity:0},{opacity:1}],config.dimMs);
            sources.forEach(source=>source.style.visibility='hidden');
            await Promise.all(clones.map(({clone,r},i)=>{const dx=center.x-(r.x-bounds.x+r.width/2),dy=center.y-(r.y-bounds.y+r.height/2),angle=i*Math.PI*2/5;return animate(clone,[{transform:'translate3d(0,0,0) scale(1)',opacity:1},{transform:`translate3d(${dx+Math.cos(angle)*bounds.width*config.orbitRadius}px,${dy+Math.sin(angle)*bounds.width*config.orbitRadius}px,0) scale(1.8)`,offset:.68,opacity:1},{transform:`translate3d(${dx}px,${dy}px,0) scale(.6)`,opacity:0}],config.gatherMs+i*config.gatherStaggerMs).then(()=>{clone.style.opacity=0;});}));
            clones.forEach(({clone})=>clone.remove());layer.classList.add('merged');
            playSound('streak');
            await animate(hero,[{opacity:0,transform:'translate(-50%,-50%) scale(.25)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.12)',offset:.7},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],config.mergeMs);
            layer.classList.add('celebrating');
            await celebrate();
            layer.dataset.stage='exit';layer.style.setProperty('--finale-exit-duration',`${config.exitMs}ms`);
            // Charge, recoil and launch out of frame before revealing the upgrade.
            await animate(hero,[
              {opacity:1,transform:'translate(-50%,-50%) scale(1) rotate(0deg)'},
              {opacity:1,transform:`translate(-50%,-42%) scale(${config.exitPeakScale}) rotate(-12deg)`,offset:.28},
              {opacity:1,transform:`translate(-50%,calc(-50% - ${bounds.height*config.exitLift*.25}px)) scale(.9) rotate(35deg)`,offset:.55},
              {opacity:0,transform:`translate(-50%,calc(-50% - ${bounds.height*config.exitLift}px)) scale(.25) rotate(${config.exitTurnDegrees}deg)`}
            ],config.exitMs);
            hero.style.visibility='hidden';
            // Continue the existing fade behind the incoming modal: its backdrop
            // must never sample/filter the banner that is entering above it.
            layer.style.zIndex='19';
            await reveal();
            const scratch=app.querySelector('#scratch-area'), flying=!scratch.hidden;
            let flyover=null;
            if(flying){
              const r=scratch.getBoundingClientRect(),a=app.getBoundingClientRect();
              flyover=scratch.cloneNode(true);flyover.removeAttribute('id');flyover.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
              flyover.classList.add('scratch-flyover');flyover.setAttribute('aria-hidden','true');flyover.inert=true;
              Object.assign(flyover.style,{left:`${r.left-a.left}px`,top:`${r.top-a.top}px`,width:`${r.width}px`,height:`${r.height}px`,visibility:'visible'});
              flyover.querySelector('canvas').getContext('2d').drawImage(scratch.querySelector('canvas'),0,0);
              app.append(flyover);
            }
            const card=app.querySelector('.carz-modal-card');
            const entrance=animate(card,[{opacity:0,transform:'translateY(28px) scale(.92)'},{opacity:1,transform:'translateY(0) scale(1)'}],config.transitionMs);
            card.style.visibility='';
            try {await Promise.all([
              animate(layer,[{opacity:1},{opacity:0}],config.transitionMs),
              entrance,
              flying ? animate(flyover,[{opacity:0,transform:'translate3d(95%,-150%,0) rotate(24deg) scale(.45)'},{opacity:1,transform:'translate3d(-7%,4%,0) rotate(-7deg) scale(1.06)',offset:.78},{opacity:1,transform:'translate3d(0,0,0) rotate(0deg) scale(1)'}],root.CarzConfig.scratchCard.entranceMs,'cubic-bezier(.35,.05,.35,1)') : Promise.resolve()
            ]);}finally{scratch.style.visibility='';flyover?.remove();}
            if (flying) {scratch.inert=false;app.querySelector('#scratch').focus({preventScroll:true});}
          } finally {sources.forEach(source=>source.style.visibility='');layer.remove();}
        },
        async lose(count){
          if(!count)return;
          const layer=document.createElement('div');layer.className='diamond-loss';
          const message=document.createElement('div');message.className='correct-badge diamond-loss-message';message.setAttribute('role','status');
          const cross=document.createElement('span');cross.className='award-check';cross.textContent='\u00d7';cross.setAttribute('aria-hidden','true');
          const text=document.createElement('strong');text.append(document.createTextNode('Wrong!'),document.createElement('br'),document.createTextNode(`${count} diamond${count===1?'':'s'} lost`));
          message.append(cross,text);layer.append(message);app.append(layer);
          const hud=app.querySelector('#diamonds'),images=[...hud.querySelectorAll('img')],bounds=app.getBoundingClientRect(),config=root.CarzConfig.diamondLoss;
          try{
            for(let index=count-1;index>=0;index--){
              const source=images[index],r=source.getBoundingClientRect(),gem=source.cloneNode();gem.className='lost-diamond';
              Object.assign(gem.style,{left:`${r.left-bounds.left}px`,top:`${r.top-bounds.top}px`,width:`${r.width}px`,height:`${r.height}px`});layer.append(gem);
              source.classList.remove('earned','newly-earned');hud.querySelector('strong').textContent=`${index}/5`;hud.setAttribute('aria-label',`${index} of 5 diamonds`);
              playSound('diamondLost');
              await animate(gem,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:1,transform:'translateY(12px) scale(2.4)',offset:.35},{opacity:0,transform:`translateY(${bounds.height*config.dropHeightRatio}px) rotate(${index%2?35:-35}deg) scale(.65)`}],config.stepMs);
              gem.remove();
            }
            await animate(layer,[{opacity:1},{opacity:0}],200);
          }finally{layer.remove();}
        },
        async play(count, lane, onLand) {
          const layer=document.createElement('div'); layer.className='correct-award';
          const glow=document.createElement('div'); glow.className='award-gem';
          const halo=document.createElement('i'); halo.className='award-halo';
          const diamond=new Image();diamond.src=asset('page-5/diamong.webp');diamond.alt='Diamond earned';
          glow.append(halo,diamond);
          const car=app.querySelector('#race-car').getBoundingClientRect(),stage=app.getBoundingClientRect();
          glow.style.left=`${(car.left+car.width/2-stage.left)/stage.width*100}%`;
          glow.style.top=`${(car.top+car.height/2-stage.top)/stage.height*100}%`;
          const badge=document.createElement('div');badge.className='correct-badge';badge.setAttribute('role','status');
          badge.style.left=lane===0?'67%':'33%';
          const check=document.createElement('span');check.className='award-check';check.textContent='\u2713';check.setAttribute('aria-hidden','true');
          const text=document.createElement('strong');text.append(document.createTextNode(`${count}/5`),document.createElement('br'),document.createTextNode('Correct!'),document.createElement('br'),document.createTextNode('+1 Diamond'));
          badge.append(check,text);layer.append(glow,badge);app.append(layer);
          try {
            // Big, readable award first; then retain the original 750ms flight duration.
            await wait(.35);
            const from=glow.getBoundingClientRect(),target=app.querySelectorAll('#diamonds img')[count-1].getBoundingClientRect();
            const dx=target.x+target.width/2-from.x-from.width/2,dy=target.y+target.height/2-from.y-from.height/2;
            await animate(glow,[{transform:'translate(-50%,-50%) scale(1)'},{transform:`translate(calc(-50% + ${dx*.45}px),calc(-50% + ${dy*.68}px)) scale(.75)`,offset:.55},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${target.width/from.width})`}],750);
            glow.hidden=true;onLand();
            await animate(layer,[{opacity:1},{opacity:0}],200);
          } finally {layer.remove();}
        }
      };
    }
  };
})(globalThis);

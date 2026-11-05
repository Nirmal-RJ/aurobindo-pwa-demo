(() => {
 'use strict';
 const settings=BlastConfig.audio, buffers=new Map(), tracks=new Map(),effects=new Set();
 // Older/limited browsers retain music through HTML audio instead of failing silently.
 if(!window.AudioContext&&!window.webkitAudioContext){
  const media={};let active=false,held=false,mode='menu',burning=false,last=0,next=0,duckLeft=0;
  for(const name of ['menu','game','sparkle','tick','blast','wrong','struggle']){const a=new Audio(`../match-it-blast-it-assets/${settings[name]}?v=${BlastConfig.version}`);a.loop=['menu','game','sparkle'].includes(name);a.preload='auto';a.volume=['menu','game'].includes(name)?0:Math.min(1,settings[name+'Volume']);a.dataset.blastAudio=name;a.hidden=true;document.body.append(a);media[name]=a;}
  function rewind(a){try{if(a.readyState>0)a.currentTime=0;}catch{}}
  function play(a){if(a.paused)a.play().catch(()=>{});}
  function unlock(){active=true;if(held)return;play(media.menu);play(media.game);if(burning)play(media.sparkle);}
  function fade(now){const dt=Math.max(0,Math.min((now-last)/1000,.1));last=now;if(active&&!held){duckLeft=Math.max(0,duckLeft-dt);for(const name of ['menu','game','sparkle']){const audible=name==='sparkle'?burning:mode===name,target=audible?settings[name+'Volume']*(duckLeft>0?settings.blastDuck:1):0,a=media[name],duration=duckLeft>0?.025:name==='sparkle'?.3:settings.crossfade;a.volume+=Math.sign(target-a.volume)*Math.min(Math.abs(target-a.volume),dt/duration*settings[name+'Volume']);}}requestAnimationFrame(fade);}requestAnimationFrame(fade);
  function fuse(value){burning=value;if(value){if(active&&!held)play(media.sparkle);}else{media.sparkle.pause();rewind(media.sparkle);}}
  function pause(value){held=value;if(value)Object.values(media).forEach(a=>a.pause());else if(active)unlock();}
  window.BlastAudio={stopEffects(){fuse(false);for(const name of ['tick','blast','wrong','struggle']){media[name].pause();rewind(media[name]);}duckLeft=0;next=0;},load:()=>Promise.resolve(),unlock,setPaused:pause,setScene(name){mode=['entering','playing','checking'].includes(name)?'game':name==='video'?'silent':'menu';fuse(false);media.tick.pause();rewind(media.tick);next=0;},fuse,urgent(remaining){if(!active||held||remaining<=0||remaining>10){next=0;return;}const now=performance.now();if(now<next)return;next=now+(remaining<=5?350:650);rewind(media.tick);play(media.tick);},struggle(){if(active&&!held){duckLeft=1.5;rewind(media.struggle);play(media.struggle);}},wrong(){if(active&&!held){duckLeft=settings.blastDuckSeconds;rewind(media.wrong);play(media.wrong);}},pop(){if(active&&!held){duckLeft=settings.blastDuckSeconds;rewind(media.blast);play(media.blast);}}};
  document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('touchend',unlock,{passive:true,capture:true});document.addEventListener('keydown',unlock,true);window.addEventListener('pagehide',()=>pause(true));return;
 }
 let context, output, duckUntil=0, ducked=false, loading, unlocked=false, paused=false, scene='menu', sparkle=false, nextTick=0;
 function getContext(){if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;context=new Audio();output=context.createDynamicsCompressor();output.threshold.value=-3;output.knee.value=3;output.ratio.value=12;output.attack.value=.003;output.release.value=.12;output.connect(context.destination);context.onstatechange=()=>{if(context.state==='running'&&unlocked&&!paused)mix();};}return context;}
 function load(){if(loading)return loading;const c=getContext();if(!c)return Promise.resolve();
  loading=Promise.all(['menu','game','sparkle','tick','blast','wrong','struggle'].map(async name=>{const r=await fetch(`../match-it-blast-it-assets/${settings[name]}?v=${BlastConfig.version}`);if(!r.ok)throw Error(`Audio load failed: ${name}`);const buffer=await c.decodeAudioData(await r.arrayBuffer());buffers.set(name,buffer);})).then(mix).catch(e=>{loading=null;throw e;});return loading;
 }
 function source(name,loop,volume){const c=getContext(),buffer=buffers.get(name);if(!buffer)return null;const node=c.createBufferSource(),gain=c.createGain();node.buffer=buffer;node.loop=loop;gain.gain.value=volume;node.connect(gain);gain.connect(output);node.start();if(!loop)effects.add(node);return {node,gain,from:volume,to:volume,start:c.currentTime,duration:0};}
 function ramp(track,value,duration){const now=context.currentTime,ratio=track.duration?Math.min(1,(now-track.start)/track.duration):1,current=track.from+(track.to-track.from)*ratio;track.gain.gain.cancelScheduledValues(now);track.gain.gain.setValueAtTime(current,now);track.gain.gain.linearRampToValueAtTime(value,now+duration);Object.assign(track,{from:current,to:value,start:now,duration});}
 function stop(name){const t=tracks.get(name);if(!t)return;t.node.stop();t.node.disconnect();t.gain.disconnect();tracks.delete(name);}
 function mix(){if(!context||context.state!=='running'||!unlocked||paused)return;
  for(const name of ['menu','game']){if(!tracks.has(name)){const t=source(name,true,0);if(t)tracks.set(name,t);}const t=tracks.get(name),volume=scene===name?settings[name+'Volume']*(ducked?settings.blastDuck:1):0;if(t&&t.to!==volume)ramp(t,volume,ducked?.025:settings.crossfade);}
  if(sparkle&&!tracks.has('sparkle')){const t=source('sparkle',true,settings.sparkleVolume*(ducked?settings.blastDuck:1));if(t)tracks.set('sparkle',t);}else if(!sparkle)stop('sparkle');const fuseTrack=tracks.get('sparkle');if(fuseTrack){const volume=settings.sparkleVolume*(ducked?settings.blastDuck:1);if(fuseTrack.to!==volume)ramp(fuseTrack,volume,ducked?.025:.3);}
 }
 function unlock(){const c=getContext();if(!c||paused)return;unlocked=true;try{const silent=c.createBufferSource();silent.buffer=c.createBuffer(1,1,c.sampleRate);silent.connect(c.destination);silent.start();silent.onended=()=>silent.disconnect();c.resume().then(mix).catch(()=>{});}catch{}if(c.state==='running')mix();}
 function setPaused(value){paused=value;if(!context)return;if(value)context.suspend().catch(()=>{});else if(unlocked)unlock();}
 function setScene(name){scene=['entering','playing','checking'].includes(name)?'game':name==='video'?'silent':'menu';sparkle=false;nextTick=0;stop('sparkle');mix();}
 function fuse(value){sparkle=value;if(!value)stop('sparkle');else mix();}
 function urgent(remaining){if(!context||!unlocked||paused||context.state!=='running'||remaining<=0||remaining>10){nextTick=0;return;}const now=context.currentTime;if(now<nextTick)return;nextTick=now+(remaining<=5?.35:.65);const t=source('tick',false,settings.tickVolume);if(t)t.node.onended=()=>{effects.delete(t.node);t.node.disconnect();t.gain.disconnect();};}
 document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('touchend',unlock,{passive:true,capture:true});document.addEventListener('keydown',unlock,true);
 window.addEventListener('pagehide',()=>setPaused(true));
 function effect(name){if(!context||context.state!=='running'||paused||!unlocked)return;duckUntil=context.currentTime+(name==='struggle'?1.5:name==='wrong'?.8:settings.blastDuckSeconds);ducked=true;mix();const t=source(name,false,settings[name+'Volume']);if(t)t.node.onended=()=>{effects.delete(t.node);t.node.disconnect();t.gain.disconnect();};}
 function recover(){if(ducked&&context&&context.currentTime>=duckUntil){ducked=false;mix();}requestAnimationFrame(recover);}requestAnimationFrame(recover);
 window.BlastAudio={stopEffects(){fuse(false);for(const node of effects){try{node.stop();}catch{}}effects.clear();duckUntil=0;ducked=false;nextTick=0;mix();},load,unlock,setPaused,setScene,fuse,urgent,pop:()=>effect('blast'),wrong:()=>effect('wrong'),struggle:()=>effect('struggle')};
})();

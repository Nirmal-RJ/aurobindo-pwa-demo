(() => {
 'use strict';
 const settings=WaveConfig.audio,buffers={},tracks={},shots=new Set();
 let context,loading,mode='menu',unlocked=false,epoch=0,waterNoise;
 // Fetch compressed files ahead of the first tap; decoding/unlock uses its gesture.
 const downloads=Object.fromEntries(Object.entries(settings.files).map(([name,file])=>[name,
  fetch('../wave-rider-assets/audio/'+file).then(r=>{if(!r.ok)throw Error('Audio unavailable');return r.arrayBuffer();}).catch(()=>null)
 ]));
 function stopShots(){epoch++;for(const node of shots){try{node.stop();}catch{}node.disconnect();}shots.clear();}
 function fade(){
  if(!context)return;
  const now=context.currentTime;
  for(const [name,track] of Object.entries(tracks)){
   const gain=track.gain.gain;
   if(gain.cancelAndHoldAtTime)gain.cancelAndHoldAtTime(now);
   else{const value=gain.value;gain.cancelScheduledValues(now);gain.setValueAtTime(value,now);}
   gain.linearRampToValueAtTime(name===mode?settings.musicVolume:0,now+settings.crossfadeSeconds);
  }
 }
 function unlock(){
  try{
   if(!context)context=new (window.AudioContext||window.webkitAudioContext)();
   unlocked=true;
   if(!document.hidden)context.resume().catch(()=>{});
   if(!loading)loading=Promise.all(Object.entries(downloads).map(async([name,download])=>{
    const bytes=await download;if(!bytes)return;
    try{
     buffers[name]=await context.decodeAudioData(bytes.slice(0));
     if(name==='menu'||name==='game'){
      const gain=context.createGain(),node=context.createBufferSource();
      gain.gain.value=0;gain.connect(context.destination);node.buffer=buffers[name];node.loop=true;node.connect(gain);node.start();
      tracks[name]={gain,node};fade();
     }
    }catch{/* Missing audio never blocks sailing. */}
   }));
  }catch{/* Audio unavailable on this browser. */}
  return loading;
 }
 function cue(name){
  const token=epoch,at=performance.now();
  const play=()=>{
   if(token!==epoch||document.hidden||context?.state!=='running'||!buffers[name]||performance.now()-at>500)return;
   const node=context.createBufferSource(),gain=context.createGain();node.buffer=buffers[name];
   gain.gain.value=settings.volumes[name]??.8;node.connect(gain);gain.connect(context.destination);shots.add(node);
   node.onended=()=>{shots.delete(node);node.disconnect();gain.disconnect();};node.start();
  };
  if(buffers[name])play();else if(loading)loading.then(play);
 }
 function tone(frequency,end,delay,duration,volume,type='sine'){
  const node=context.createOscillator(),gain=context.createGain(),at=context.currentTime+delay;
  node.type=type;node.frequency.setValueAtTime(frequency,at);node.frequency.exponentialRampToValueAtTime(end,at+duration);
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.018);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  node.connect(gain);gain.connect(context.destination);shots.add(node);
  node.onended=()=>{shots.delete(node);node.disconnect();gain.disconnect();};node.start(at);node.stop(at+duration+.02);
 }
 function accent(name){
  if(document.hidden||context?.state!=='running')return;
  if(name==='penalty'){
   const volume=settings.volumes.penalty;
   tone(330,170,0,.24,volume,'triangle');tone(220,110,.12,.28,volume*.7,'triangle');
  }else if(name==='celebrate'){
   const volume=settings.volumes.celebration,pace=window.WaveConfig.timings.celebrationScale;
   // One soft, filtered water swell under a bright ascending major arpeggio.
   if(!waterNoise){waterNoise=context.createBuffer(1,context.sampleRate*1.6,context.sampleRate);const data=waterNoise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
   const node=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),at=context.currentTime+.65*pace;
   node.buffer=waterNoise;node.playbackRate.value=1/pace;filter.type='lowpass';filter.frequency.setValueAtTime(600,at);filter.frequency.linearRampToValueAtTime(2400,at+.55*pace);filter.frequency.linearRampToValueAtTime(500,at+1.6*pace);
   gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume*.65,at+.35*pace);gain.gain.linearRampToValueAtTime(0,at+1.6*pace);
   node.connect(filter);filter.connect(gain);gain.connect(context.destination);shots.add(node);
   node.onended=()=>{shots.delete(node);node.disconnect();filter.disconnect();gain.disconnect();};node.start(at);
   [523.25,659.25,783.99,1046.5].forEach((hz,i)=>tone(hz,hz,(.65+i*.12)*pace,.7*pace,volume*.6));
   tone(660,1320,3.8*pace,.65*pace,volume*.45);
  }else if(name==='flag-land'){
   [783.99,1046.5,1318.5].forEach(hz=>tone(hz,hz,0,.4,settings.volumes.celebration*.42));
  }
 }
 window.WaveAudio={
  scene(name){stopShots();const next=name==='play'?'game':'menu';if(mode!==next){mode=next;fade();}},
  cue,accent
 };
 document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
 document.addEventListener('keydown',unlock,{capture:true});
 document.addEventListener('click',event=>{unlock();const button=event.target.closest('button');if(button&&!button.disabled)cue('button');});
 document.addEventListener('visibilitychange',()=>{
  if(!context)return;
  if(document.hidden){stopShots();context.suspend().catch(()=>{});}
  else if(unlocked)context.resume().catch(()=>{});
 });
 window.addEventListener('pagehide',()=>{stopShots();context?.suspend().catch(()=>{});});
})();

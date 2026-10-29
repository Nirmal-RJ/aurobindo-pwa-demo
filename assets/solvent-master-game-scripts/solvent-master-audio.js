(() => {
  'use strict';
  const settings=SolventMasterConfig.gameplay.audio,buffers={},tracks={};
  let context,loading,mode,liquidNode=null,warningNode=null,wantsLiquid=false,lastCue=null;
  const oneShots={};
  function tone(frequency,seconds=.15,volume=settings.effects,delay=0,type='sine',bus){
    if(!context||context.state!=='running')return;
    const oscillator=context.createOscillator(),gain=context.createGain(),at=context.currentTime+delay;
    oscillator.type=type;oscillator.frequency.value=frequency;
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.015);gain.gain.exponentialRampToValueAtTime(.0001,at+seconds);
    oscillator.connect(gain);gain.connect(bus||context.destination);oscillator.start(at);oscillator.stop(at+seconds+.02);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  }
  function source(name,gain,offset=0,loop=true){
    if(!buffers[name])return null;
    const node=context.createBufferSource();node.buffer=buffers[name];node.loop=loop;
    node.connect(gain);node.start(0,offset%node.buffer.duration);return node;
  }
  function stop(node){if(node){try{node.stop();}catch{}node.disconnect();}}
  function unlock(){
    try{
      if(!context){context=new (window.AudioContext||window.webkitAudioContext)();
        for(const name of Object.keys(settings.files)){const gain=context.createGain();gain.gain.value=['menu','game','celebration'].includes(name)?0:settings[name];gain.connect(context.destination);tracks[name]={gain};}
      }
      context.resume().catch(()=>{});
      if(!loading)loading=Promise.all(Object.entries(settings.files).map(async([name,path])=>{
        const response=await fetch(SolventFlow.source('../solvent-master-game-assets/'+path));if(!response.ok)throw Error('Audio download failed');
        buffers[name]=await context.decodeAudioData(await response.arrayBuffer());
      })).then(()=>{for(const name of ['menu','game'])tracks[name].node=source(name,tracks[name].gain);mode=undefined;frame(SolventMaster.view);}).catch(()=>{loading=null;});
    }catch{/* Audio availability must not block game controls. */}
  }
  function liquid(stopPour=false){
    wantsLiquid=!stopPour;stop(liquidNode);liquidNode=null;
    if(wantsLiquid&&context?.state==='running')liquidNode=source('liquid',tracks.liquid.gain);
  }
  function oneShot(name){
    if(!context||context.state!=='running'||!buffers[name])return;
    stop(oneShots[name]);const node=source(name,tracks[name].gain,0,false);oneShots[name]=node;lastCue=name;
    node.onended=()=>{node.disconnect();if(oneShots[name]===node)delete oneShots[name];};
  }
  function cue(name){
    if(name==='correct'||name==='wrong'){
      for(const key of ['mixHappy','mixSad']){stop(oneShots[key]);delete oneShots[key];}
      oneShot(name==='correct'?'mixHappy':'mixSad');return;
    }
    if(name==='menuClick'||name==='shatter'){oneShot(name);return;}
    if(name==='streak'||name==='win'){[523.25,659.25,783.99,...(name==='win'?[1046.5]:[])].forEach((n,i)=>tone(n,.28,settings.effects,i*.12));}
    else if(name==='timer')return;
    else if(name==='popup')tone(392,.18,settings.effects*.5);
    else tone(620,.06,settings.effects*.25);
  }
  function frame(view){
    if(!context||context.state!=='running'||!buffers.menu||!buffers.game)return;
    const celebration=view==='outcome'&&SolventMaster.game?.profile.streak>0;
    const desired=celebration?'celebration':view==='lesson'?'lesson':view==='round'?'game':'menu';
    if(view!=='outcome'&&oneShots.shatter){stop(oneShots.shatter);delete oneShots.shatter;}
    if(mode!==desired){mode=desired;if(mode==='celebration'){stop(tracks.celebration.node);tracks.celebration.node=source('celebration',tracks.celebration.gain);}for(const name of ['menu','game','celebration']){
      const param=tracks[name].gain.gain,now=context.currentTime;
      // Continue from the current envelope when navigation reverses a crossfade.
      if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(now);else{const value=param.value;param.cancelScheduledValues(now);param.setValueAtTime(value,now);}
      param.linearRampToValueAtTime(name===mode?settings[name]:0,now+settings.crossfadeSeconds);
    }}
    const state=SolventMaster,g=state.game;
    if(view!=='round'||g?.phase!=='feedback')for(const key of ['mixHappy','mixSad']){stop(oneShots[key]);delete oneShots[key];}
    const warning=desired==='game'&&g?.mode==='challenge'&&g.phase==='mix'&&g.remaining>0&&g.remaining<=10&&!state.busy&&!document.hidden;
    if(warning&&!warningNode)warningNode=source('warning',tracks.warning.gain,10-g.remaining);
    else if(!warning&&warningNode){stop(warningNode);warningNode=null;}
    if(wantsLiquid&&!liquidNode)liquidNode=source('liquid',tracks.liquid.gain);
  }
  document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);
  document.addEventListener('click',event=>{if(event.target.closest('button')){const menu=!['round','lesson'].includes(SolventMaster.view);if(menu){if(buffers.menuClick)cue('menuClick');else loading?.then(()=>cue('menuClick'));}else cue('click');}});
  document.addEventListener('visibilitychange',()=>{if(!context)return;if(document.hidden)context.suspend().catch(()=>{});else context.resume().catch(()=>{});});
  globalThis.SolventAudio={cue,liquid,frame,status:()=>({mode,loaded:Object.keys(buffers),warning:!!warningNode,liquid:!!liquidNode,context:context?.state,lastCue,celebrationGain:tracks.celebration?.gain.gain.value,menuGain:tracks.menu?.gain.gain.value,gameGain:tracks.game?.gain.gain.value})};
})();

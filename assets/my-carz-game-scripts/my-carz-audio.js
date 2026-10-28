/* Shared, gesture-unlocked Web Audio playback for delayed game sound effects. */
(function(root){
  root.CarzAudio={create(sounds,asset){
    let context=null,analyser=null;const buffers=new Map(),sources=new Map(),paused=new Map(),events=[],errors=[];
    const fail=error=>{errors.push(String(error.message||error));if(errors.length>20)errors.shift();};
    function ensure(){
      const Context=root.AudioContext||root.webkitAudioContext;if(!Context)return null;
      if(!context){context=new Context();analyser=context.createAnalyser();analyser.fftSize=512;analyser.connect(context.destination);}
      return context;
    }
    function resume(){const ctx=ensure();if(ctx&&ctx.state!=='running')ctx.resume().catch(fail);}
    function halt(name){const old=sources.get(name);if(old){try{old.node.stop();}catch(_){}old.node.disconnect();old.gain.disconnect();sources.delete(name);}}
    function stop(name){paused.delete(name);halt(name);}
    function start(name,offset=0){
      if(!buffers.has(name))return false;resume();stop(name);
      if(offset>=buffers.get(name).duration)return true;
      const node=context.createBufferSource(),gain=context.createGain();node.buffer=buffers.get(name);gain.gain.value=sounds[name][1];
      node.connect(gain);gain.connect(analyser);const record={node,gain,offset,started:context.currentTime};sources.set(name,record);
      node.onended=()=>{if(sources.get(name)===record)sources.delete(name);node.disconnect();gain.disconnect();};node.start(0,offset);
      events.push({name,at:performance.now(),state:context.state,offset});if(events.length>200)events.shift();return true;
    }
    return {
      unlock:resume,
      async prepare(){
        const ctx=ensure();if(!ctx)return;
        await Promise.all(Object.entries(sounds).filter(([name])=>name!=='music').map(async([name,[file]])=>{
          const response=await fetch(asset(file));if(!response.ok)throw new Error(`Could not prepare ${name} sound.`);
          buffers.set(name,await ctx.decodeAudioData(await response.arrayBuffer()));
        }));
      },
      play:start,
      duration(name){return buffers.get(name)?.duration||0;},
      stop,
      silence(remember){if(!context)return;if(!remember)paused.clear();for(const [name,record] of [...sources]){if(remember)paused.set(name,record.offset+context.currentTime-record.started);halt(name);}context.suspend().catch(fail);},
      resume(){resume();for(const [name,offset] of [...paused])start(name,offset);paused.clear();},
      get state(){return {context:context?.state||'uninitialized',prepared:[...buffers.keys()],durations:Object.fromEntries([...buffers].map(([name,buffer])=>[name,buffer.duration])),events:[...events],errors:[...errors]};},
      samplePeak(){if(!analyser)return 0;const values=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(values);return values.reduce((peak,v)=>Math.max(peak,Math.abs(v)),0);}
    };
  }};
})(globalThis);

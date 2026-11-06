(() => {
 'use strict';
 let apiPromise;
 function loadAPI(){
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(apiPromise)return apiPromise;
  apiPromise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   const timeout=setTimeout(()=>fail(),15000);
   const previous=window.onYouTubeIframeAPIReady;
   function fail(){clearTimeout(timeout);script.remove();apiPromise=null;reject(Error('YouTube unavailable'));}
   window.onYouTubeIframeAPIReady=()=>{clearTimeout(timeout);previous?.();resolve(window.YT);};
   script.onerror=fail;script.src='https://www.youtube.com/iframe_api';document.head.append(script);
  });
  return apiPromise;
 }
 function mount(scene,pair,asset){
  let disposed=false,local=false,player=null,video=null,readyTimer=null,tap=null;
  const host=document.createElement('div');host.className='feedback-video';scene.append(host);
  function clearTimer(){clearTimeout(readyTimer);readyTimer=null;}
  function destroyPlayer(){clearTimer();try{player?.destroy();}catch{}player=null;}
  function showTap(play){if(disposed||tap)return;tap=document.createElement('button');tap.className='video-tap';tap.textContent='Tap to play';tap.onclick=()=>{play();};scene.append(tap);}
  function removeTap(){tap?.remove();tap=null;}
  function fallback(){
   if(disposed||local)return;local=true;destroyPlayer();removeTap();host.remove();
   // Do not create a local media element or assign its URL until YouTube fails.
   video=document.createElement('video');video.className='feedback-video';video.controls=true;video.playsInline=true;video.autoplay=true;video.preload='none';
   video.src=asset(pair.video);scene.append(video);
   const play=()=>video.play().then(removeTap).catch(()=>{if(!disposed)showTap(play);});
   video.addEventListener('playing',removeTap);play();
  }
  if(!pair.youtube)fallback();
  else loadAPI().then(YT=>{
   if(disposed||local)return;
   readyTimer=setTimeout(fallback,15000);
   player=new YT.Player(host,{videoId:pair.youtube,width:'100%',height:'100%',playerVars:{autoplay:1,playsinline:1,controls:1,rel:0,origin:location.origin},events:{
    onReady:e=>{if(disposed||local)return;clearTimer();const frame=e.target.getIframe();frame.className='feedback-video';frame.title=pair.term+' feedback video';e.target.playVideo();},
    onError:()=>fallback(),
    onAutoplayBlocked:()=>{if(disposed||local)return;clearTimer();showTap(()=>player?.playVideo());},
    onStateChange:e=>{if(e.data===1)removeTap();}
   }});
  }).catch(fallback);
  function pause(){if(document.hidden){try{player?.pauseVideo();}catch{}video?.pause();}}
  document.addEventListener('visibilitychange',pause);
  return ()=>{disposed=true;document.removeEventListener('visibilitychange',pause);destroyPlayer();removeTap();if(video){video.pause();video.removeAttribute('src');video.load();video.remove();}host.remove();};
 }
 window.BlastVideo={mount};
})();

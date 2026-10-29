(() => {
  'use strict';
  const state=SolventMaster,game=document.getElementById('game'),prompt=document.getElementById('rotate-prompt');
  // Include iPadOS desktop-style user agents; a narrow desktop window alone is not mobile.
  const isMobile=()=>/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||navigator.userAgentData?.mobile===true||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)||(navigator.maxTouchPoints>0&&matchMedia('(pointer: coarse)').matches&&matchMedia('(hover: none)').matches);
  const portrait=matchMedia('(orientation: portrait)'),held=new Set();
  function update(){
    const blocked=isMobile()&&portrait.matches;
    state.orientationBlocked=blocked;prompt.hidden=!blocked;game.inert=blocked||!!state.fullscreenHelpOpen;
    document.dispatchEvent(new Event('solvent-master:orientation'));
    if(!blocked&&!state.fullscreenHelpOpen&&!document.hidden){for(const animation of held)if(animation.playState==='paused')animation.play();held.clear();}
  }
  function hold(){
    if(state.orientationBlocked||state.fullscreenHelpOpen)for(const animation of game.getAnimations({subtree:true}))if(animation.playState==='running'){held.add(animation);animation.pause();}
    requestAnimationFrame(hold);
  }
  if(portrait.addEventListener)portrait.addEventListener('change',update);else portrait.addListener?.(update);
  window.addEventListener('resize',update);window.addEventListener('orientationchange',update);window.addEventListener('pageshow',update);
  window.visualViewport?.addEventListener('resize',update);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
  document.addEventListener('solvent-master:fullscreen-help',update);
  update();requestAnimationFrame(hold);
})();

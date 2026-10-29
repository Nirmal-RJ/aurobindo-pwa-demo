(() => {
  'use strict';
  const state=SolventMaster,game=document.getElementById('game'),prompt=document.getElementById('rotate-prompt');
  // Include iPadOS desktop-style user agents; a narrow desktop window alone is not mobile.
  const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const portrait=matchMedia('(orientation: portrait)'),held=new Set();
  function update(){
    const blocked=mobile&&portrait.matches;
    state.orientationBlocked=blocked;prompt.hidden=!blocked;game.inert=blocked||!!state.fullscreenHelpOpen;
    document.dispatchEvent(new Event('solvent-master:orientation'));
    if(!blocked&&!state.fullscreenHelpOpen&&!document.hidden){for(const animation of held)if(animation.playState==='paused')animation.play();held.clear();}
  }
  function hold(){
    if(state.orientationBlocked||state.fullscreenHelpOpen)for(const animation of game.getAnimations({subtree:true}))if(animation.playState==='running'){held.add(animation);animation.pause();}
    requestAnimationFrame(hold);
  }
  portrait.addEventListener('change',update);document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
  document.addEventListener('solvent-master:fullscreen-help',update);
  update();requestAnimationFrame(hold);
})();

(() => {
  'use strict';
  const state=SolventMaster,button=document.getElementById('fullscreen-toggle'),help=document.getElementById('fullscreen-help'),close=document.getElementById('fullscreen-help-close');
  const active=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
  function sync(){button.setAttribute('aria-label',active()?'Exit full screen':'Enter full screen');button.setAttribute('aria-pressed',String(active()));}
  function showHelp(open){state.fullscreenHelpOpen=open;help.hidden=!open;document.dispatchEvent(new Event('solvent-master:fullscreen-help'));(open?close:button).focus();}
  async function enter(explain){
    const root=document.documentElement,request=root.requestFullscreen||root.webkitRequestFullscreen;
    if(!request){if(explain)showHelp(true);return;}
    try{await Promise.resolve(request.call(root));if(screen.orientation?.lock)await screen.orientation.lock('landscape').catch(()=>{});}
    catch{if(explain)showHelp(true);}sync();
  }
  let attempted=false;
  document.addEventListener('click',event=>{
    if(attempted||!event.target.closest('#game button'))return;attempted=true;if(!active())enter(false);
  },true);
  button.addEventListener('click',async()=>{attempted=true;if(active()){screen.orientation?.unlock?.();const exit=document.exitFullscreen||document.webkitExitFullscreen;try{await Promise.resolve(exit.call(document));}catch{}}else await enter(true);sync();});
  close.addEventListener('click',()=>showHelp(false));
  help.addEventListener('keydown',event=>{if(event.key==='Escape')showHelp(false);if(event.key==='Tab'){event.preventDefault();close.focus();}});
  document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);sync();
})();

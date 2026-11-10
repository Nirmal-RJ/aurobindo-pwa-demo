const interactive='button,a,input,textarea,select,summary,.reference-card,.reply-preview';
const swipeExcluded='input,textarea,select,summary,[contenteditable=true],.message-actions,.reaction-list';

/** Touch gestures stay inside messages; vertical scroll, text selection and OS edges win. */
export function messageGestures(container,{reply,actions}){
 let gesture=null,timer=0,suppressClick=null;
 function reset(){clearTimeout(timer);const active=gesture;gesture=null;if(active){active.article.classList.remove('swipe-active','swipe-ready');active.bubble.style.removeProperty('--swipe-x');if(active.article.hasPointerCapture?.(active.pointerId))active.article.releasePointerCapture(active.pointerId);}}
 container.addEventListener('pointerdown',event=>{
  reset();suppressClick=null;if(event.pointerType!=='touch'||!event.isPrimary||event.clientX<24||event.clientX>innerWidth-24||event.target.closest(swipeExcluded)||window.getSelection()?.toString())return;
  const article=event.target.closest('.message[data-delivery="sent"]');if(!article)return;
  gesture={article,bubble:article.querySelector('.message-body'),id:article.dataset.messageId,pointerId:event.pointerId,x:event.clientX,y:event.clientY,dx:0,swiping:false};
  if(!event.target.closest('.message-text')&&!event.target.closest(interactive))timer=setTimeout(()=>{if(gesture&&!window.getSelection()?.toString()){const id=gesture.id;reset();actions(id);}},600);
 });
 container.addEventListener('pointermove',event=>{
  if(!gesture||event.pointerId!==gesture.pointerId)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(Math.abs(dx)>7||Math.abs(dy)>7)clearTimeout(timer);
  if(!gesture.swiping&&Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){reset();return;}
  if(!gesture.swiping&&dx>12&&dx>Math.abs(dy)*1.5){gesture.swiping=true;try{gesture.article.setPointerCapture(event.pointerId);}catch{/* Synthetic events do not own a native pointer. */}}
  if(gesture.swiping){if(event.cancelable)event.preventDefault();gesture.dx=Math.max(0,dx);gesture.article.classList.add('swipe-active');gesture.article.classList.toggle('swipe-ready',gesture.dx>=68);gesture.bubble.style.setProperty('--swipe-x',`${Math.min(52,gesture.dx*.55)}px`);}
 });
 container.addEventListener('pointerup',event=>{if(!gesture||event.pointerId!==gesture.pointerId)return;const active=gesture,id=active.swiping&&active.dx>=68?active.id:null;if(active.swiping)suppressClick={article:active.article,at:performance.now()};reset();if(id)reply(id);});
 container.addEventListener('click',event=>{if(suppressClick&&event.detail&&performance.now()-suppressClick.at<400&&suppressClick.article.contains(event.target)){suppressClick=null;event.preventDefault();event.stopImmediatePropagation();}},true);
 container.addEventListener('pointercancel',reset);
 // Implicit capture transfers from the touched child to the row on horizontal
 // intent. The child's bubbling loss event is not a cancelled gesture.
 container.addEventListener('lostpointercapture',event=>{if(gesture?.swiping&&event.pointerId===gesture.pointerId&&event.target===gesture.article&&!gesture.article.hasPointerCapture?.(gesture.pointerId))reset();});
 container.addEventListener('scroll',reset,{passive:true});
 container.addEventListener('contextmenu',event=>{const article=event.target.closest('.message[data-delivery="sent"]');if(!article||event.target.closest(interactive)||window.getSelection()?.toString())return;event.preventDefault();reset();actions(article.dataset.messageId);});
 return reset;
}

/** Familiar message-list shortcuts, without intercepting typing or browser shortcuts. */
export function messageKeys(container,{reply,actions,react}){
 container.addEventListener('keydown',event=>{
  if(event.target.closest(interactive)||event.ctrlKey||event.metaKey||event.altKey)return;
  const messages=[...container.querySelectorAll('.message')],current=event.target.closest('.message'),index=messages.indexOf(current);let next;
  if(event.key==='ArrowDown')next=messages[Math.min(messages.length-1,index+1)];
  if(event.key==='ArrowUp')next=messages[index<0?messages.length-1:Math.max(0,index-1)];
  if(event.key==='Home')next=messages[0];if(event.key==='End')next=messages.at(-1);
  if(next){event.preventDefault();next.focus({preventScroll:true});next.scrollIntoView({block:'nearest'});return;}
  if(!current||current.dataset.delivery!=='sent')return;
  if(event.key.toLowerCase()==='r'){event.preventDefault();reply(current.dataset.messageId);}
  if(event.key.toLowerCase()==='e'){event.preventDefault();react(current.dataset.messageId);}
  if(event.key==='F10'&&event.shiftKey||event.key==='ContextMenu'){event.preventDefault();actions(current.dataset.messageId);}
 });
}

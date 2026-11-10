import {el} from './components.js';

/** One clear navigation target per card; images are posters, never game packages. */
export function discussionCard({game,room,scopeId,unread,onOpen}){
 const general=!game,name=general?'General Discussion':game.name;
 const card=el('a',`discussion-card${general?' general-discussion':''}`);
 card.href=general?`#/${room}/general`:`#/${room}/game/${game.id}`;
 card.dataset.discussion=general?'general':game.id;
 card.setAttribute('aria-label',`Open ${name} in ${room==='rc'?'RC':'Global'}`);
 const visual=el('div',`discussion-art${game?.id==='my-carz'?' car-art':''}`);
 if(general){
  visual.classList.add('general-art');visual.setAttribute('aria-hidden','true');
  const back=el('span','chat-illustration back'),front=el('span','chat-illustration front');
  for(let i=0;i<3;i++)front.append(el('i'));
  visual.append(el('span','illustration-orbit'),back,front);
 }else{
  const image=el('img');image.src=game.image;image.alt='';image.width=320;image.height=210;image.loading='lazy';image.decoding='async';
  image.onerror=()=>{image.remove();visual.append(el('span','poster-fallback',game.name));};visual.append(image);
 }
 const content=el('div','discussion-card-content'),arrow=el('span','card-enter','›');arrow.setAttribute('aria-hidden','true');
 if(general){const pin=el('span','discussion-pin','Pinned');visual.append(pin);}
 content.append(el('h3','',name),arrow);
 if(unread){const badge=el('span','discussion-unread',`${unread} new`);badge.setAttribute('aria-label',`${unread} unread messages`);visual.append(badge);}
 card.append(visual,content);
 card.addEventListener('click',event=>{if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();onOpen(scopeId);});
 return card;
}

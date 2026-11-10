import {icon} from './icons.js';
export function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
export function button(text,action,cls=''){const b=el('button',cls,text);b.type='button';b.onclick=action;return b;}
export function avatar(account){const im=el('img','avatar');im.src=account.photo;im.alt=account.name;im.width=40;im.height=40;return im;}
export function time(value){return new Intl.DateTimeFormat('en',{hour:'numeric',minute:'2-digit'}).format(new Date(value));}
export function date(value){return new Intl.DateTimeFormat('en',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date(value));}
export function timestamp(value){const t=el('time','timestamp',time(value));t.dateTime=value;t.title=new Date(value).toLocaleString();return t;}
export function attachment(attachment,context,gallery=[]){
 const box=button('',()=>context.preview(attachment,gallery),'screenshot');box.setAttribute('aria-label',`Open screenshot ${attachment.name}`);
 const im=el('img');im.loading='lazy';im.decoding='async';im.alt=attachment.name;im.width=220;im.height=155;box.append(im,el('span','attachment-name',attachment.name));
 const load=()=>context.api.attachmentURL(attachment).then(url=>{if(im.isConnected)im.src=url;}).catch(()=>{if(box.isConnected){box.replaceChildren(el('span','attachment-error','Screenshot unavailable in this browser'));box.disabled=true;}});
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();load();}},{rootMargin:'160px'});observer.observe(box);context.observers.add(observer);}else load();
 return box;
}
export function referenceCard(ref,context){const build=context.builds.find(b=>b.id===ref.buildId);const card=el('div','reference-card');card.append(el('span','reference-label','FROM GLOBAL'),el('small','reference-build',build?build.gameName:ref.buildId==='general-discussion'?'General Discussion':ref.buildId),el('strong','',ref.author.name),timestamp(ref.createdAt),el('p','message-text',ref.text||'Screenshot'));if(ref.attachments.length){const images=el('div','attachments');ref.attachments.forEach(a=>images.append(attachment(a,context,ref.attachments)));card.append(images);}card.append(button('View original ↗',()=>context.original(ref),'view-original'));return card;}
export function messageCard(message,context){
 const author=context.accounts.find(a=>a.id===message.authorId),own=message.authorId===context.account.id;
 const article=el('article',`message ${own?'own':''} ${message.reference?'referenced':''}`);article.id=`message-${message.id}`;article.dataset.messageId=message.id;article.dataset.delivery=message.delivery;article.tabIndex=-1;article.setAttribute('aria-label',`${author.name}, ${time(message.createdAt)}${own?', your message':''}`);
 article.append(avatar(author));const bubble=el('div','message-body');const head=el('header','message-meta');head.append(el('strong','',author.name),el('span','role-label',author.role==='ghost'?'Tester':author.role==='core'?'Core team':'Director'),timestamp(message.createdAt));bubble.append(head);
 if(message.replyTo){const parent=context.loaded.find(m=>m.id===message.replyTo);const reply=button('',()=>context.jump(message.replyTo),'reply-preview');reply.append(el('strong','',parent?context.accounts.find(a=>a.id===parent.authorId).name:'Reply to earlier message'),el('span','',parent?.text.slice(0,140)||'View message'));bubble.append(reply);}
 if(message.reference)bubble.append(referenceCard(message.reference,context));
 if(message.text)bubble.append(el('p','message-text',message.text));
 if(message.attachments.length){const images=el('div','attachments');message.attachments.forEach(a=>images.append(attachment(a,context,message.attachments)));bubble.append(images);}
 const reactions=el('div','reaction-list');for(const [emoji,ids] of Object.entries(message.reactions)){if(!ids.length)continue;const chip=button(`${emoji} ${ids.length}`,()=>context.reactionDetails(message,emoji),ids.includes(context.account.id)?'reaction active':'reaction');chip.dataset.action=`reaction-${emoji}`;chip.title=ids.map(id=>context.accounts.find(a=>a.id===id)?.name).join(', ');chip.setAttribute('aria-label',`See who reacted ${emoji}: ${chip.title}`);chip.setAttribute('aria-haspopup','dialog');reactions.append(chip);}bubble.append(reactions);
 const actions=el('div','message-actions');
 if(message.delivery==='sent'){
  const reply=button('',()=>context.reply(message),'message-action');reply.dataset.action='reply';reply.setAttribute('aria-label','Reply');reply.title='Reply';reply.append(icon('reply'),el('span','','Reply'));
  const react=button('',()=>context.actions(message,true),'message-action');react.dataset.action='react';react.setAttribute('aria-label','React');react.title='React';react.append(icon('smile'),el('span','','React'));
  const more=button('',()=>context.actions(message),'message-action icon-button');more.dataset.action='more';more.setAttribute('aria-label','More message actions');more.title='More message actions';more.append(icon('more'));
  actions.append(reply,react,more);
 }
 if(own&&message.delivery==='sending')actions.append(el('span','delivery sending','Sending…'));
 if(own&&message.delivery==='failed')actions.append(el('span','delivery failed','Not sent'),button('Retry',()=>context.run(()=>context.api.retry(message.id)),'retry'));
 if(own&&message.delivery==='sent')actions.append(el('span','delivery','Sent ✓'));
 bubble.append(actions);article.append(bubble);return article;
}

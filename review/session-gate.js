import {reviewSession,isRejectedSession,loginURL} from './session.js';
/** One restore on entry (or explicit retry), never a polling loop. */
export async function restoreReviewSession(){
 const panel=document.createElement('main');panel.className='session-status';
 const title=document.createElement('h1'),message=document.createElement('p'),retry=document.createElement('button');
 title.textContent='Checking your review session';message.textContent='Please wait...';message.setAttribute('role','status');retry.textContent='Retry';retry.type='button';retry.hidden=true;panel.append(title,message,retry);document.body.prepend(panel);
 return new Promise(resolve=>{
  async function restore(){retry.disabled=true;retry.hidden=true;title.textContent='Checking your review session';message.textContent='Please wait...';
   try{const session=await reviewSession.me();panel.remove();resolve(session);}
   catch(error){if(isRejectedSession(error)){location.replace(loginURL());return;}title.textContent=error.stale?'Review account changed':'Review service unavailable';message.textContent=error.message;retry.hidden=false;retry.disabled=false;}
  }
  retry.onclick=restore;void restore();
 });
}
export function watchReviewSession(){
 const mounted=reviewSession.current().account;
 reviewSession.subscribe(()=>{const next=reviewSession.current()?.account;if(!next||next.id!==mounted.id||next.role!==mounted.role){const app=document.querySelector('.review-app'),profile=document.querySelector('#profile');if(app)app.hidden=true;if(profile)profile.hidden=true;if(!next)location.replace(loginURL());else location.reload();}});
 window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
}

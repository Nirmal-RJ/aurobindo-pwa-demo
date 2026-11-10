import {reviewSession} from './session.js';
// Public home remains public. RC entry uses the server role, never the mock role.
const link=document.querySelector('.rc-chat-entry');
let request=0;
async function updateEntry(){const current=++request;if(link)link.hidden=true;try{const session=await reviewSession.me();if(current===request&&link)link.hidden=session.account.role!=='ghost';}catch{/* Public home/games remain available if review sign-in is unavailable. */}}
void updateEntry();
window.addEventListener('pageshow',event=>{if(event.persisted)void updateEntry();});
reviewSession.subscribe(()=>{const account=reviewSession.current()?.account;if(link)link.hidden=account?.role!=='ghost';});

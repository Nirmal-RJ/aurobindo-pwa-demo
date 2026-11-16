import {reviewSession} from './session.js';
const $=id=>document.getElementById(id);let busy=false,generation=0,restorePending=false;
function drain(){if(restorePending){restorePending=false;void restore();}}
function error(e){if(e.stale){restorePending=true;return;}$('error').textContent=e.name==='AbortError'?'Connection timed out. Please try again.':e.message||'Unable to connect. Please try again.';$('error').hidden=false;}
function render(account){$('login').hidden=!!account;$('signed-in').hidden=!account;$('heading').textContent=account?'You’re in.':'Welcome back.';$('description').textContent=account?'Your review login is ready.':'Enter your employee ID to continue.';if(account){$('name').textContent=account.name;$('member').textContent=`${account.employeeId} · ${account.role==='ghost'?'RC team':'Director'}`;$('initial').textContent=Array.from(account.name)[0]||'Q';}}
async function restore(){if(busy){restorePending=true;return;}busy=true;const version=++generation;$('error').hidden=true;$('retry').hidden=true;$('status').textContent='Checking your saved login…';try{const data=await reviewSession.me();if(version===generation)render(data.account);}catch(e){if(version!==generation)return;if([401,403].includes(e.status)){render(null);if(e.status===403)error(e);}else{error(e);$('retry').hidden=!!e.stale;}}finally{if(version===generation){busy=false;$('status').textContent='';drain();}}}
$('login').addEventListener('submit',async e=>{e.preventDefault();if(busy)return;busy=true;++generation;$('submit').disabled=true;$('error').hidden=true;$('status').textContent='Signing you in…';try{const data=await reviewSession.login($('employee').value.trim());render(data.account);$('employee').value='';}catch(e){error(e);}finally{busy=false;$('submit').disabled=false;$('status').textContent='';drain();}});
$('logout').addEventListener('click',async()=>{if(busy)return;busy=true;++generation;$('logout').disabled=true;$('error').hidden=true;try{await reviewSession.logout();render(null);$('employee').focus();}catch(e){error(e);}finally{busy=false;$('logout').disabled=false;drain();}});
$('retry').addEventListener('click',()=>void restore());
window.addEventListener('storage',event=>{if(event.key==='qsl-review-session-v1')void restore();});
window.addEventListener('pageshow',event=>{if(event.persisted)void restore();});
void restore();

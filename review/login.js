import {reviewSession,isRejectedSession,returnURL} from './session.js';
const form=document.querySelector('#login-form'),input=document.querySelector('#employee-id'),submit=document.querySelector('#login-submit'),error=document.querySelector('#login-error'),intro=document.querySelector('.intro'),retry=document.createElement('button');
retry.type='button';retry.textContent='Retry session restore';retry.className='restore-retry';retry.hidden=true;form.after(retry);
let busy=false;
function setBusy(value){busy=value;submit.disabled=value;input.disabled=value;retry.disabled=value;}
function showError(reason){error.textContent=reason.message;error.hidden=false;}
function ready(){form.hidden=false;intro.textContent='Enter your employee ID to continue.';setBusy(false);submit.textContent='Continue';}
async function restore(){setBusy(true);form.hidden=true;retry.hidden=true;error.hidden=true;intro.textContent='Checking your saved session...';
 try{await reviewSession.me();location.replace(returnURL());}
 catch(reason){ready();if(!isRejectedSession(reason)){showError(reason);retry.hidden=false;}}
}
input.addEventListener('input',()=>{input.removeAttribute('aria-invalid');error.hidden=true;});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;
 const employeeId=input.value.trim();if(!employeeId){input.setAttribute('aria-invalid','true');showError(Error('Enter your employee ID.'));input.focus();return;}
 setBusy(true);submit.textContent='Continuing...';error.hidden=true;retry.hidden=true;
 try{await reviewSession.login(employeeId);location.replace(returnURL());}
 catch(reason){ready();showError(reason);if(reason.stale)retry.hidden=false;if([400,401,403].includes(reason.status))input.setAttribute('aria-invalid','true');input.focus();}
});
retry.onclick=restore;
reviewSession.subscribe(()=>{if(!reviewSession.current()&&!busy)void restore();});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
void restore();

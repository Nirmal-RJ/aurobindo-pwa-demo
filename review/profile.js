import {reviewSession,isRejectedSession,returnURL} from './session.js';
import {restoreReviewSession,watchReviewSession} from './session-gate.js';
const {account}=await restoreReviewSession();
watchReviewSession();
document.querySelector('#profile-employee-id').textContent=account.employeeId;
document.querySelector('#profile-name').textContent=account.name;
// The session contract has no photo. This local initials avatar needs no network.
const initials=account.name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase(),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 64 64');const rect=document.createElementNS(svg.namespaceURI,'rect');rect.setAttribute('width','64');rect.setAttribute('height','64');rect.setAttribute('rx','18');rect.setAttribute('fill','#e2efe9');const text=document.createElementNS(svg.namespaceURI,'text');text.setAttribute('x','32');text.setAttribute('y','41');text.setAttribute('text-anchor','middle');text.setAttribute('font-family','Arial,sans-serif');text.setAttribute('font-size','24');text.setAttribute('fill','#205f53');text.textContent=initials;svg.append(rect,text);document.querySelector('#profile-photo').src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));
document.querySelector('#profile-back').href=returnURL();
const logout=document.querySelector('#profile-logout'),error=document.createElement('p');error.className='profile-error';error.setAttribute('role','alert');error.hidden=true;logout.after(error);
logout.onclick=async()=>{logout.disabled=true;error.hidden=true;logout.textContent='Logging out...';try{await reviewSession.logout();}catch(reason){if(reason.stale)return;if(isRejectedSession(reason))return;error.textContent=reason.message;error.hidden=false;logout.disabled=false;logout.textContent='Retry logout';}};
document.querySelector('#profile').hidden=false;

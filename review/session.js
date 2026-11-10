// Matches the copied review-backend contract, with response-version guards.
// Authentication uses the same-origin API; chat stays local.
export const sessionKey='qsl-review-session-v1';
let memory=null,current=null,version=0;
const listeners=new Set();
function saved(){try{return localStorage.getItem(sessionKey);}catch{return memory;}}
function notify(){for(const fn of listeners)fn();}
function remember(token){memory=token;try{localStorage.setItem(sessionKey,token);}catch{/* The HttpOnly cookie can still restore the session. */}}
function forget(){version++;memory=null;current=null;try{localStorage.removeItem(sessionKey);}catch{}notify();}
function stale(){return Object.assign(Error('The review account changed. Please retry.'),{stale:true});}
function validAccount(a){return a&&typeof a.id==='string'&&typeof a.employeeId==='string'&&typeof a.name==='string'&&['ghost','director'].includes(a.role)&&a.identityMethod==='employee-id-only';}
async function request(path,body,operation){
 const token=saved(),headers={...(body===undefined?{}:{'Content-Type':'application/json'}),...(token&&path!=='login'?{Authorization:'Bearer '+token}:{})};
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 const isCurrent=()=>operation===version&&saved()===token;
 try{
  const response=await fetch('/review-api/'+path,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers,body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});
  if(!isCurrent())throw stale();
  // Authorization failure clears rejected credentials even for non-JSON errors.
  if(path!=='login'&&[401,403].includes(response.status)){forget();throw Object.assign(Error('Your review session is no longer valid. Please sign in.'),{status:response.status});}
  let data=null;if(response.status!==204){try{data=await response.json();}catch{if(response.ok)throw Error('The review service returned an invalid response. Retry.');}}
  if(!isCurrent())throw stale();
  if(!response.ok){const message=response.status===404?'Review sign-in is unavailable on this host. Same-origin /review-api routing is not configured.':data?.message||'Unable to connect to the review service. Please retry.';throw Object.assign(Error(message),{status:response.status});}
  if(path!=='logout'&&(!validAccount(data?.account)||typeof data?.expiresAt!=='string'||!Number.isFinite(Date.parse(data.expiresAt))))throw Error('The review service returned an invalid account. Retry.');
  if(path==='login'&&(typeof data?.recoveryToken!=='string'||!data.recoveryToken))throw Error('The review service returned an invalid session. Retry.');
  return data;
 }catch(error){
  if(error.stale||[401,403].includes(error.status)&&path!=='login')throw error;
  if(!isCurrent())throw stale();
  if(error.name==='AbortError')throw Object.assign(Error('The review service took too long to respond. Please retry.'),{timeout:true});
  if(error instanceof TypeError)throw Error('Unable to reach the review service. Check your connection and retry.');
  throw error;
 }finally{clearTimeout(timer);}
}
export const reviewSession={
 async me(){const operation=++version,token=saved(),result=await request('me',undefined,operation);if(operation!==version||saved()!==token)throw stale();current={account:result.account,expiresAt:result.expiresAt};return structuredClone(current);},
 async login(employeeId){const operation=++version,token=saved(),result=await request('login',{employeeId:employeeId.trim()},operation);if(operation!==version||saved()!==token)throw stale();remember(result.recoveryToken);current={account:result.account,expiresAt:result.expiresAt};notify();return structuredClone(current);},
 async logout(){const operation=++version,token=saved();await request('logout',{},operation);if(operation!==version||saved()!==token)throw stale();forget();},
 current:()=>current?structuredClone(current):null,
 subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
 clearLocal:forget,
};
window.addEventListener('storage',event=>{if(event.key===sessionKey||event.key===null){version++;memory=null;current=null;notify();}});
export const isRejectedSession=error=>[401,403].includes(error.status);
export function loginURL(){const url=new URL('./login.html',import.meta.url);url.searchParams.set('return',location.pathname+location.search+location.hash);return url;}
export function returnURL(){const fallback=new URL('./index.html',import.meta.url),raw=new URLSearchParams(location.search).get('return');if(!raw)return fallback;try{const url=new URL(raw,location.href);return url.origin===location.origin&&[fallback.pathname,new URL('./profile.html',import.meta.url).pathname].includes(url.pathname)?url:fallback;}catch{return fallback;}}

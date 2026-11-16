const key='qsl-review-session-v1';
let memory=null;
function saved(){try{return localStorage.getItem(key)||memory;}catch{return memory;}}
function remember(token){memory=token;try{localStorage.setItem(key,token);}catch{/* Cookie still persists independently when allowed. */}}
function forget(){memory=null;try{localStorage.removeItem(key);}catch{}}
async function request(path,body){
 const token=saved(),headers={...(body===undefined?{}:{'Content-Type':'application/json'}),...(token?{Authorization:'Bearer '+token}:{})};
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{const r=await fetch('/review-api/'+path,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers,body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});const data=r.status===204?null:await r.json();if(path!=='login'&&saved()!==token)throw Object.assign(Error('Review account changed.'),{stale:true});if(!r.ok){if([401,403].includes(r.status)&&saved()===token)forget();throw Object.assign(Error(data?.message||'Unable to connect.'),{status:r.status});}return data;}finally{clearTimeout(timer);}
}
export const reviewSession={
 async me(){return request('me');},
 async login(employeeId){const result=await request('login',{employeeId});remember(result.recoveryToken);return {account:result.account,expiresAt:result.expiresAt};},
 async logout(){await request('logout',{});forget();},
 clearLocal:forget,
};

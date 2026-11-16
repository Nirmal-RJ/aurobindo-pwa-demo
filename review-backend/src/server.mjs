import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {employeeId,credentials,sessionCookie,clearCookie,cookieForRecovery,hash} from './policy.mjs';

let fcmAuth=null;
async function getFcmAccessToken(){
 const {GoogleAuth}=await import('google-auth-library');
 if(!fcmAuth)fcmAuth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/firebase.messaging']});
 const client=await fcmAuth.getClient();
 const {token}=await client.getAccessToken();
 return token;
}

async function notifyPushSubscribers(store,sender,message){
 const projectId=process.env.REVIEW_FIRESTORE_PROJECT;
 if(!projectId||typeof store.listPushTokensForRoom!=='function')return;
 const targets=await store.listPushTokensForRoom(message.roomId,sender.id);
 if(!targets.length)return;
 const accessToken=await getFcmAccessToken();
 if(!accessToken)return;
 const roomLabel=message.roomId==='rc'?'RC':'Global';
 const bodyText=message.text&&message.text.trim()?message.text.trim().slice(0,140):'Sent a screenshot';
 const targetPath=message.buildId==='general-discussion'?`/review/#/${message.roomId}/general`:`/review/#/${message.roomId}/game/${message.buildId}`;
 await Promise.allSettled(targets.map(async t=>{
  const res=await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,{
   method:'POST',
   headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},
   body:JSON.stringify({
    message:{
     token:t.token,
     notification:{title:`${sender.name} (${roomLabel})`,body:bodyText},
     data:{roomId:message.roomId,buildId:message.buildId,messageId:message.id,url:targetPath},
     webpush:{fcm_options:{link:targetPath}}
    }
   })
  });
  if(res.status===404||res.status===410){
   await store.removePushTokenById?.(t.id);
  }
 }));
}
const fail=(status,message)=>Object.assign(Error(message),{status});
const files=new Map([['/review/',['index.html','text/html']],['/review/index.html',['index.html','text/html']],['/review/session.js',['session.js','text/javascript']],['/review/login.js',['login.js','text/javascript']],['/review/login.css',['login.css','text/css']]]);
async function readJson(req,maxBytes,invalidMsg='Invalid JSON request.'){
 if(!String(req.headers['content-type']||'').startsWith('application/json'))throw fail(415,'Use JSON.');
 if(Number(req.headers['content-length']||0)>maxBytes){req.resume();throw fail(413,'Request is too large.');}
 let bytes=0,data='';
 for await(const chunk of req){bytes+=chunk.length;if(bytes>maxBytes)throw fail(413,'Request is too large.');data+=chunk;}
 try{return JSON.parse(data);}catch{throw fail(400,invalidMsg);}
}
async function readBinary(req,maxBytes){
 if(Number(req.headers['content-length']||0)>maxBytes){req.resume();throw fail(413,'Each screenshot must be smaller than 5 MB.');}
 const chunks=[];let bytes=0;
 for await(const chunk of req){bytes+=chunk.length;if(bytes>maxBytes)throw fail(413,'Each screenshot must be smaller than 5 MB.');chunks.push(chunk);}
 return Buffer.concat(chunks);
}
export function createReviewServer({store,origin,secure,webRoot=new URL('../test-fixtures/web/',import.meta.url),onError=()=>{}}){
 const expected=new URL(origin);if(expected.origin!==origin||expected.pathname!=='/')throw Error('Use an exact review origin');
 if(secure&&expected.protocol!=='https:')throw Error('Production review origin must use HTTPS');
 let inflight=0;const attempts=new Map();
 return http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','private,no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  const url=new URL(req.url,'http://localhost'),path=url.pathname;
  const json=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(body));};
  try{
   if(webRoot&&req.method==='GET'&&files.has(path)){const [file,type]=files.get(path);res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data: blob:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");res.writeHead(200,{'Content-Type':type+'; charset=utf-8'});res.end(await readFile(new URL(file,webRoot)));return;}
   if(path==='/review-api/health'&&req.method==='GET'){json(200,{ready:true});return;}
   const isChat=path.startsWith('/review-api/chat/');
   if(!isChat&&!['/review-api/login','/review-api/me','/review-api/logout'].includes(path))throw fail(404,'Not found.');
   if(req.headers.origin&&req.headers.origin!==origin)throw fail(403,'Request origin is not allowed.');
   if(req.method==='POST'&&req.headers.origin!==origin)throw fail(403,'Request origin is not allowed.');
   if(inflight>=40)throw fail(503,'Please try again shortly.');inflight++;
   try{
    if(path==='/review-api/login'&&req.method==='POST'){
     if(!String(req.headers['content-type']||'').startsWith('application/json'))throw fail(415,'Use JSON.');
     if(Number(req.headers['content-length']||0)>256){req.resume();throw fail(413,'Request is too large.');}
     let bytes=0,data='';for await(const chunk of req){bytes+=chunk.length;if(bytes>256)throw fail(413,'Request is too large.');data+=chunk;}
     let body;try{body=JSON.parse(data);}catch{throw fail(400,'Enter your employee ID.');}const id=employeeId(body);
     // Bounded single-process abuse control; this is not proof of identity or a
     // substitute for a deployment-level distributed rate limit.
     // Never group the whole office behind one shared NAT/proxy address.
     const key=hash(id),now=Date.now();let window=attempts.get(key);if(!window||window.until<=now){window={count:0,until:now+60000};if(attempts.size>=1000)attempts.delete(attempts.keys().next().value);attempts.set(key,window);}if(++window.count>30){res.setHeader('Retry-After','60');throw fail(429,'Please wait a minute before trying again.');}
     const saved=await store.login(id);res.setHeader('Set-Cookie',sessionCookie(saved.token,secure));json(200,{account:saved.account,recoveryToken:saved.recovery,expiresAt:saved.expiresAt});return;
    }
    if(path==='/review-api/me'&&req.method==='GET'){
     const cred=credentials(req),session=await store.resolve(cred),expiresAt=await store.renew(session);
     if(!session.cookieMatches||new Date(expiresAt).getTime()!==new Date(session.expiresAt).getTime())res.setHeader('Set-Cookie',sessionCookie(cred.recovery?cookieForRecovery(cred.recovery):cred.cookie,secure));json(200,{account:session.account,expiresAt});return;
    }
    if(path==='/review-api/logout'&&req.method==='POST'){
     try{await store.logout(await store.resolve(credentials(req)));}catch(e){if(![401,403].includes(e.status))throw e;}
     res.setHeader('Set-Cookie',clearCookie(secure));res.writeHead(204);res.end();return;
    }
    if(isChat){
     const session=await store.resolve(credentials(req));
     if(path==='/review-api/chat/bootstrap'&&req.method==='GET'){json(200,await store.getBootstrapState(session.account));return;}
     if(path==='/review-api/chat/sync'&&req.method==='GET'){
      const loadedIds=(url.searchParams.get('loadedIds')||'').split(',').filter(Boolean);
      json(200,await store.syncState(session.account,{roomId:url.searchParams.get('roomId'),buildId:url.searchParams.get('buildId'),sinceSequence:Number(url.searchParams.get('sinceSequence')||0),loadedIds}));return;
     }
     if(path==='/review-api/chat/messages'&&req.method==='GET'){
      const limitParam=url.searchParams.get('limit'),beforeParam=url.searchParams.get('before');
      json(200,await store.listMessages(session.account,{roomId:url.searchParams.get('roomId'),buildId:url.searchParams.get('buildId'),before:beforeParam!==null&&beforeParam!==''?Number(beforeParam):undefined,limit:limitParam?Number(limitParam):undefined}));return;
     }
     if(path==='/review-api/chat/messages'&&req.method==='POST'){
      const body=await readJson(req,16384,'Message payload is too large.');
      const saved=await store.sendMessage(session.account,body);
      void notifyPushSubscribers(store,session.account,saved).catch(()=>{});
      json(201,saved);return;
     }
     if(path==='/review-api/chat/push-token'&&req.method==='POST'){
      const body=await readJson(req,8192,'Push token payload is too large.');
      json(200,await store.savePushToken(session.account,body?.token));return;
     }
     if(path==='/review-api/chat/push-token'&&req.method==='DELETE'){
      const body=await readJson(req,8192,'Push token payload is too large.');
      json(200,await store.deletePushToken(session.account,body?.token));return;
     }
     const reactMatch=path.match(/^\/review-api\/chat\/messages\/([^/]+)\/react$/);
     if(reactMatch&&req.method==='POST'){
      const body=await readJson(req,1024,'Reaction payload is too large.');
      json(200,await store.toggleReaction(session.account,decodeURIComponent(reactMatch[1]),body?.emoji));return;
     }
     const msgMatch=path.match(/^\/review-api\/chat\/messages\/([^/]+)$/);
     if(msgMatch&&req.method==='GET'){
      json(200,await store.getMessage(session.account,decodeURIComponent(msgMatch[1])));return;
     }
     if(path==='/review-api/chat/votes'&&req.method==='GET'){json(200,{votes:await store.listVotes(url.searchParams.get('buildId'))});return;}
     if(path==='/review-api/chat/votes'&&req.method==='POST'){
      const body=await readJson(req,1024,'Vote payload is too large.');
      json(200,await store.castVote(session.account,body));return;
     }
     if(path==='/review-api/chat/read'&&req.method==='POST'){
      const body=await readJson(req,1024,'Read state payload is too large.');
      json(200,await store.markRead(session.account,body));return;
     }
     if(path==='/review-api/chat/attachments'&&req.method==='POST'){
      const bytes=await readBinary(req,5*1024*1024,'Attachment exceeds 5 MB.');
      const type=url.searchParams.get('type')||String(req.headers['content-type']||'application/octet-stream').split(';')[0].trim();
      const saved=await store.saveAttachment(session.account,{roomId:url.searchParams.get('roomId'),buildId:url.searchParams.get('buildId'),name:url.searchParams.get('name')||'screenshot.png',type,bytes});
      json(201,saved);return;
     }
     const attMatch=path.match(/^\/review-api\/chat\/attachments\/([^/]+)$/);
     if(attMatch&&req.method==='GET'){
      const file=await store.getAttachment(session.account,decodeURIComponent(attMatch[1]));
      res.writeHead(200,{'Content-Type':file.meta?.type||'application/octet-stream','Content-Length':String(file.buffer.length),'Content-Disposition':'inline'});res.end(file.buffer);return;
     }
     throw fail(404,'Not found.');
    }
    throw fail(405,'Method not allowed.');
   }finally{inflight--;}
  }catch(e){const status=e.status||503;if(status>=500)onError({event:'review_auth_failed',status,code:typeof e.code==='string'?e.code:'unavailable'});if(!res.headersSent)json(status,{message:e.status?e.message:'Review service is temporarily unavailable. Please try again.'});else res.end();}
 });
}

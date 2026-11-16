import http from 'node:http';

/** Explicit setup mode: no SQL pool, credentials, identity lookup or fake login. */
export function createDisconnectedServer(){
 return http.createServer((request,response)=>{
  response.setHeader('Content-Type','application/json; charset=utf-8');
  response.setHeader('Cache-Control','private, no-store');
  response.setHeader('X-Content-Type-Options','nosniff');
  const pathname=new URL(request.url,'http://localhost').pathname;
  if(pathname==='/review-api/health'&&request.method==='GET'){
   response.writeHead(200).end(JSON.stringify({alive:true,loginReady:false,databaseConnected:false}));return;
  }
  const auth=['/review-api/login','/review-api/me','/review-api/logout'].includes(pathname);
  response.writeHead(auth?503:404).end(JSON.stringify({message:auth?'Review sign-in is not enabled yet. The database connection is awaiting approval.':'Not found.'}));
 });
}

import {Firestore} from '@google-cloud/firestore';
import {FirestoreReviewStore} from './firestore-store.mjs';
import {createReviewServer} from './server.mjs';
import {createDisconnectedServer} from './disconnected.mjs';
const production=process.env.NODE_ENV==='production';
let db,server;
if(process.env.REVIEW_DATABASE_URL)throw Error('SQL configuration is obsolete. Remove REVIEW_DATABASE_URL.');
if(production&&process.env.FIRESTORE_EMULATOR_HOST)throw Error('Production must not use the Firestore emulator.');
if(process.env.REVIEW_LOGIN_ENABLED!=='true')server=createDisconnectedServer();
else {
 const projectId=process.env.REVIEW_FIRESTORE_PROJECT;
 if(projectId!=='apl-qc-core-app-f5a3e'&&!(!production&&projectId==='demo-qc-core-review'))throw Error('Use only the standalone QC Core Firestore project.');
 db=new Firestore({projectId,databaseId:projectId==='demo-qc-core-review'?'(default)':'apl-core-chat-app'});
 const roster=await db.collection('reviewConfig').doc('roster').get();
 if(roster.data()?.state!=='verified'||roster.data()?.total!==42)throw Error('Approved Firestore roster has not been verified.');
 server=createReviewServer({store:new FirestoreReviewStore(db),origin:process.env.REVIEW_ORIGIN||'http://localhost:4174',secure:production,webRoot:null,onError:event=>console.warn(JSON.stringify(event))});
}
server.requestTimeout=10000;server.headersTimeout=10000;
await new Promise(resolve=>server.listen(Number(process.env.REVIEW_PORT||process.env.PORT||4180),production?'0.0.0.0':'127.0.0.1',resolve));
console.log('Review service listening; login '+(db?'enabled with Firestore.':'disabled.'));
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{
 server.close(()=>void Promise.resolve(db?.terminate()).then(()=>process.exit(0)));
 server.closeIdleConnections();setTimeout(()=>process.exit(1),10000).unref();
});

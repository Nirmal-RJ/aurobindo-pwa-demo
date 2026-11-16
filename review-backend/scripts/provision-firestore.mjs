import {Firestore} from '@google-cloud/firestore';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {roleFor} from '../src/policy.mjs';
const projectId='apl-qc-core-app-f5a3e';
if(process.env.GOOGLE_CLOUD_PROJECT&&process.env.GOOGLE_CLOUD_PROJECT!==projectId)throw Error('Wrong project.');
if(process.env.FIRESTORE_EMULATOR_HOST)throw Error('This provisioning command is for the standalone QC Core database only.');
const roster=JSON.parse(await readFile(new URL('../private/approved-reviewers.json',import.meta.url),'utf8'));
assert.equal(roster.length,42);assert.equal(new Set(roster.map(a=>a.employeeId)).size,42);
for(const a of roster){assert.equal(a.role,roleFor(a.employeeId));assert(a.name?.trim());}
assert.equal(roster.filter(a=>a.role==='ghost').length,22);
let auth;
if(process.argv.includes('--gcloud-account')){
 const {execFileSync}=await import('node:child_process');
 const {GoogleAuth,OAuth2Client}=await import('google-auth-library');
 const token=execFileSync(process.platform==='win32'?'gcloud.cmd':'gcloud',['auth','print-access-token'],{encoding:'utf8',windowsHide:true,shell:process.platform==='win32'}).trim();
 const client=new OAuth2Client();client.setCredentials({access_token:token});auth=new GoogleAuth({authClient:client,projectId});
}
const db=new Firestore({projectId,databaseId:'apl-core-chat-app',...(auth?{auth}:{})});
try{
 const accounts=db.collection('reviewAccounts'),config=db.collection('reviewConfig').doc('roster');
 await db.runTransaction(async tx=>{
  const existing=await tx.get(accounts);
  assert(existing.empty||existing.size===42,'Refusing to overwrite an unexpected roster.');
  const byId=new Map(existing.docs.map(d=>[d.id,d.data()]));
  for(const a of roster){
   const old=byId.get(a.employeeId);
   if(old){for(const key of ['employeeId','name','role'])assert.equal(old[key],a[key]);assert.equal(old.status,'allowed');assert(old.id);}
   else tx.create(accounts.doc(a.employeeId),{...a,id:randomUUID(),status:'allowed',createdAt:new Date()});
  }
  tx.set(config,{state:'pending-verification',total:42});
 });
 const saved=await accounts.get();assert.equal(saved.size,42);
 const expected=new Map(roster.map(a=>[a.employeeId,a]));
 for(const doc of saved.docs){const a=doc.data(),e=expected.get(doc.id);assert(e);for(const key of ['employeeId','name','role'])assert.equal(a[key],e[key]);assert.equal(a.status,'allowed');assert(a.id);}
 await config.set({state:'verified',total:42,ghosts:22,directors:20,verifiedAt:new Date()});
 console.log('QC Core Firestore roster verified: 42 total, 22 ghosts, 20 directors. No credentials printed.');
}finally{await db.terminate();}


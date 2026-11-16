import {Firestore} from '@google-cloud/firestore';
import {FirestoreReviewStore} from '../src/firestore-store.mjs';
import {createReviewServer} from '../src/server.mjs';
import {createFrontendServer} from '../../server.mjs';
if(!/^127\.0\.0\.1:\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST||''))throw Error('Local Firestore emulator required.');
const db=new Firestore({projectId:'demo-qc-core-review',databaseId:'(default)'});
for(const [employeeId,name,role]of [['100021','Local tester','ghost'],['100024','Local director','director']])await db.collection('reviewAccounts').doc(employeeId).set({id:'local-'+employeeId,employeeId,name,role,status:'allowed'});
const backend=createReviewServer({store:new FirestoreReviewStore(db),origin:'http://localhost:4174',secure:false,webRoot:null});

await new Promise(r=>backend.listen(0,'127.0.0.1',r));const frontend=createFrontendServer({reviewApiTarget:'http://127.0.0.1:'+backend.address().port});await new Promise(r=>frontend.listen(4174,r));
console.log('LOCAL PREVIEW http://localhost:4174/review/login.html | Tester 100021 | Director 100024 | synthetic local data only');
async function stop(){frontend.closeAllConnections();backend.closeAllConnections();await Promise.all([new Promise(r=>frontend.close(r)),new Promise(r=>backend.close(r))]);await db.terminate();process.exit(0);}
process.once('SIGINT',stop);process.once('SIGTERM',stop);


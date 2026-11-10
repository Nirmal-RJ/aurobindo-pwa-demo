const installReviewAuth=require('./review-auth-fixture.cjs');
const {chromium}=require(process.env.AB_PLAYWRIGHT),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage();await page.route('**/review/app.js',r=>r.fulfill({contentType:'text/javascript',body:''}));const auth=await installReviewAuth(page);await page.goto('http://localhost:4174/review/');
 const results=await page.evaluate(async()=>{
  const {createMockAPI}=await import('./mock-api.js'),api=createMockAPI(),result=[];
  const expect=(value,label)=>{if(!value)throw Error(label);result.push(label);};
  const rejects=async(fn,label)=>{let rejected=false;try{await fn();}catch{rejected=true;}expect(rejected,label);};
  const page1=await api.listMessages('global','blast-30'),page2=await api.listMessages('global','blast-30',page1.cursor);
  expect(page1.messages.length===12&&page2.messages.length===12&&!page1.messages.some(a=>page2.messages.some(b=>b.id===a.id)),'Stable nonoverlapping history pages');
  const original=page1.messages.find(m=>m.attachments.length),snapshot={roomId:'global',messageId:original.id,buildId:original.buildId,author:api.accounts().find(a=>a.id===original.authorId),createdAt:original.createdAt,text:original.text,attachments:original.attachments};
  const globalLength=(await api.listMessages('global','blast-30',undefined,100)).messages.length;
  const ref=await api.send({roomId:'rc',buildId:'blast-30',text:'Internal comment',attachments:[],reference:snapshot});await new Promise(r=>setTimeout(r,700));
  expect((await api.getMessage(ref.id)).reference.attachments.length===1,'Reference retains screenshot and original snapshot');
  expect((await api.listMessages('global','blast-30',undefined,100)).messages.length===globalLength,'RC reference never posts to Global');
  for(const id of ['director-1','core-1']){api.switchAccount(id);expect(api.rooms().length===1,'No RC navigation for '+id);await rejects(()=>api.listMessages('rc','blast-30'),'No RC history for '+id);await rejects(()=>api.getMessage(ref.id),'No RC by-ID access for '+id);}
  api.switchAccount('ghost-1');
  await rejects(()=>api.attach(new File(['x'],'bad.txt',{type:'text/plain'})),'Reject non-image attachments');
  const file=new File([new Uint8Array([1,2,3])],'sample.png',{type:'image/png'}),attachment=await api.attach(file);
  const restored=createMockAPI();const imageURL=await restored.attachmentURL(attachment);expect(imageURL.startsWith('blob:'),'Screenshot bytes persist across adapter reload');restored.releaseURLs();
  api.failNext();const failed=await api.send({roomId:'global',buildId:'blast-30',text:'Retry invariant',attachments:[]});await new Promise(r=>setTimeout(r,700));expect((await api.getMessage(failed.id)).delivery==='failed','Deterministic mock failure');
  await api.retry(failed.id);await new Promise(r=>setTimeout(r,700));expect((await api.getMessage(failed.id)).delivery==='sent','Retry completes');expect((await api.listMessages('global','blast-30',undefined,100)).messages.filter(m=>m.id===failed.id).length===1,'Retry is not duplicated');
  await api.vote('blast-30','approve');await api.vote('blast-30','changes');expect(api.votes('blast-30').filter(v=>v.accountId==='ghost-1').length===1,'One replaceable individual vote per build');expect(!('approveRelease' in api)&&!('approval' in api)&&!('setApprovers' in api),'No release approval API');
  const fresh=await api.addBuild('blast','fresh-isolated');expect(api.votes(fresh.id).length===0,'Fresh build has independent votes');expect((await api.listMessages('global',fresh.id)).messages.length===0,'Fresh build has empty chat');
  await rejects(()=>api.send({roomId:'rc',buildId:fresh.id,text:'Wrong build reference',attachments:[],reference:snapshot}),'Reject references across builds');
  const buildCount=api.builds().length;
  expect((await api.listMessages('global','general-discussion')).messages.length===0,'General Discussion begins independently');
  const general=await api.send({roomId:'global',buildId:'general-discussion',text:'General update',attachments:[]});await new Promise(r=>setTimeout(r,700));
  expect((await api.getMessage(general.id)).delivery==='sent','General messages persist through the same delivery flow');
  expect(api.builds().length===buildCount,'General Discussion is not a fabricated game build');
  await rejects(()=>api.vote('general-discussion','approve'),'No game voting in General Discussion');
  return result;
 });assert(results.length>=20);console.log(results.join('\n'));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

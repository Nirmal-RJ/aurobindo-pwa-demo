const KEY='qc-review-drafts-v1';
/** Browser-local drafts only; identity/room/topic keys prevent cross-account display. */
export function createDraftStore(){
 function read(){try{const drafts=JSON.parse(localStorage.getItem(KEY))||{};for(const draft of Object.values(drafts))delete draft.feedback;return drafts;}catch{return {};}}
 return {
  load(key){return read()[key]||null;},
  save(key,draft){const all=read();if(!draft.text.trim()&&!draft.attachments.length&&!draft.replyTo)delete all[key];else all[key]={...draft,text:draft.text.slice(0,6000),savedAt:Date.now()};const entries=Object.entries(all).sort((a,b)=>b[1].savedAt-a[1].savedAt).slice(0,40);localStorage.setItem(KEY,JSON.stringify(Object.fromEntries(entries)));},
  remove(key){const all=read();delete all[key];localStorage.setItem(KEY,JSON.stringify(all));}
 };
}

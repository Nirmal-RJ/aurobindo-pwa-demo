import {readFile,readdir,stat,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url)),stage=path.join(root,'dist','qc-core');
const manifest=JSON.parse(await readFile(path.join(root,'deployment/qc-core/publish-manifest.json'),'utf8'));
const config=JSON.parse(await readFile(path.join(root,'firebase.qc-core.json'),'utf8'));
assert.equal(config.hosting.site,'apl-qc-core-app-f5a3e');assert.equal(config.hosting.public,'dist/qc-core');
assert.deepEqual(config.hosting.rewrites,[{source:'/review-api/**',run:{serviceId:'aurobindo-review-api',region:'asia-south1'}}]);
assert(!config.hosting.rewrites.some(rule=>rule.destination),'No broad HTML fallback can swallow API errors');
assert(config.hosting.headers.some(rule=>rule.source==='/review-api/**'&&rule.headers.some(h=>h.key==='Cache-Control'&&h.value==='private, no-store')));
const staged=new Set(manifest.files.map(file=>file.path)),missing=[];
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const file of manifest.files){
 assert(!/(?:^|\/)(?:review-backend|node_modules|artifacts|tests|docs|scratch|\.git)(?:\/|$)/i.test(file.path),'Private directory in stage');
 assert(!/\.(?:md|docx?|sql|env|log|map|cjs|mjs|ts|json)$/i.test(file.path),'Development file in stage');
 const [source,copy]=await Promise.all([readFile(path.join(root,file.path)),readFile(path.join(stage,file.path))]);
 assert(digest(source)===file.sha256&&digest(copy)===file.sha256,'Stale or modified staged file: '+file.path);
 // Fail on private-key or standard service-account credential formats, without printing contents.
 if(/\.(?:js|html|css|webmanifest|svg)$/.test(file.path))assert(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|"type"\s*:\s*"service_account"|"private_key"\s*:\s*"-----BEGIN/.test(copy.toString('utf8')),'Credential-shaped content in public file: '+file.path);
 if(/\.(?:html|css)$/.test(file.path)){
  const text=copy.toString('utf8'),refs=[...text.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']|url\(\s*["']?([^\s"')]+)["']?\s*\)/gi)];
  for(const match of refs){const ref=match[1]||match[2];if(/^(?:[a-z]+:|\/\/|#)|\$\{|\{\{/i.test(ref))continue;
   const url=new URL(ref,'https://stage.invalid/'+file.path);let target=decodeURIComponent(url.pathname.slice(1));if(!target||target.endsWith('/'))target+='index.html';
   if(!staged.has(target))missing.push({from:file.path,target});
  }
 }
}
async function all(directory,prefix=''){const result=[];for(const entry of await readdir(directory,{withFileTypes:true})){const name=prefix+entry.name;if(entry.isDirectory())result.push(...await all(path.join(directory,entry.name),name+'/'));else result.push(name);}return result;}
assert.deepEqual((await all(stage)).sort(),[...staged].sort(),'Unmanifested files in output');
assert.equal(missing.length,0,'Missing HTML/CSS asset links: '+JSON.stringify(missing));
for(const file of ['index.html','review/index.html','review/login.html','review/profile.html','rocket-game.html','my-carz.html','assets/solvent-master-game-scripts/solvent-master.html','assets/ab-express-scripts/ab-express.html','assets/match-it-blast-it-scripts/match-it-blast-it.html'])assert(staged.has(file),'Missing entry: '+file);
console.log(`PASS ${manifest.fileCount} staged hashes, exact file inventory, private-file/credential-format exclusion, HTML/CSS links and project/API configuration. No cloud calls.`);

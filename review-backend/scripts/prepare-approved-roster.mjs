// Owner-supplied identity data stays in ignored private/scratch, never frontend.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {ghostIds,directorIds,roleFor} from '../src/policy.mjs';
import assert from 'node:assert/strict';
const input=new URL('../private/approved-reviewers.json',import.meta.url),output=new URL('../scratch/standalone-provision/',import.meta.url);
const roster=JSON.parse(await readFile(input,'utf8'));
assert(Array.isArray(roster)&&roster.length===42,'Expected the owner-approved 42-person roster');
const ids=new Set();
for(const account of roster){
 assert.deepEqual(Object.keys(account).sort(),['employeeId','name','role']);
 assert(typeof account.employeeId==='string'&&roleFor(account.employeeId)===account.role,'ID/role must match approved policy');
 assert(typeof account.name==='string'&&account.name.trim()===account.name&&account.name.length>0&&account.name.length<=120,'Name must be explicit and preserved');
 assert(!ids.has(account.employeeId),'Duplicate employee ID');ids.add(account.employeeId);
}
assert.equal(roster.filter(a=>a.role==='ghost').length,ghostIds.size);
assert.equal(roster.filter(a=>a.role==='director').length,directorIds.size);
const quote=value=>"'"+value.replaceAll("'","''")+"'";
const rows=roster.map(a=>'('+[randomUUID(),a.employeeId,a.name,a.role,'allowed'].map(quote).join(',')+')');
const schema=await readFile(new URL('../src/schema.sql',import.meta.url),'utf8');
const sql=`BEGIN;\n${schema}\nDO $$ BEGIN IF EXISTS(SELECT 1 FROM review_auth.accounts) THEN RAISE EXCEPTION 'Roster already populated; explicit review is required before replacing existing accounts.'; END IF; END $$;\nINSERT INTO review_auth.accounts(id,employee_id,name,role,status) VALUES\n${rows.join(',\n')};\nDO $$ BEGIN IF (SELECT count(*) FROM review_auth.accounts)<>42 OR (SELECT count(*) FROM review_auth.accounts WHERE role='ghost')<>22 OR (SELECT count(*) FROM review_auth.accounts WHERE role='director')<>20 THEN RAISE EXCEPTION 'Unexpected roster counts'; END IF; END $$;\nCOMMIT;\n`;
await mkdir(output,{recursive:true});await writeFile(new URL('bootstrap.sql',output),sql);
console.log('PASS approved roster: 42 unique IDs, 22 ghosts, 20 directors. Exact names preserved; private transactional SQL prepared, no credentials or public files.');

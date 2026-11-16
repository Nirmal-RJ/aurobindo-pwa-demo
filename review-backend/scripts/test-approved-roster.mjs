import pg from 'pg';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {withTestPostgres} from './with-test-postgres.mjs';
import {restrictedFixturePool} from './restricted-fixture.mjs';
import {ReviewStore} from '../src/store.mjs';
const expected=JSON.parse(await readFile(new URL('../private/approved-reviewers.json',import.meta.url),'utf8'));
const sql=await readFile(new URL('../scratch/standalone-provision/bootstrap.sql',import.meta.url),'utf8');
await withTestPostgres(async connectionString=>{
 const admin=new pg.Pool({connectionString,max:1});let runtime;
 try{
  await admin.query(sql);const rows=(await admin.query('SELECT employee_id,name,role,status FROM review_auth.accounts ORDER BY employee_id')).rows;
  assert.deepEqual(rows,expected.map(a=>({employee_id:a.employeeId,name:a.name,role:a.role,status:'allowed'})).sort((a,b)=>a.employee_id.localeCompare(b.employee_id)));
  runtime=await restrictedFixturePool(admin,connectionString);const store=new ReviewStore(runtime);
  for(const account of expected){
   const saved=await store.login(account.employeeId);assert.equal(saved.account.name,account.name);assert.equal(saved.account.role,account.role);
   const restored=await store.resolve({recovery:saved.recovery});assert.equal(restored.account.employeeId,account.employeeId);await store.logout(restored);
  }
  await assert.rejects(store.login('100022'),error=>error.status===403);
  await assert.rejects(admin.query(sql),/Roster already populated/);await admin.query('ROLLBACK');
  assert.equal((await admin.query('SELECT count(*)::int n FROM review_auth.accounts')).rows[0].n,42);
  console.log('PASS private approved-roster bootstrap: all 42 exact names/roles match, all 42 login/restore/logout under restricted role, excluded ID denied, repeat import refused without changing roster. Disposable local DB only.');
 }finally{await runtime?.end();await admin.end();}
});

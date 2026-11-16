import pg from 'pg';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {freePort} from './with-test-postgres.mjs';

/** Only called against synthetic disposable fixtures; never production grants. */
export async function restrictedFixturePool(admin,connectionString){
 const url=new URL(connectionString);assert(['127.0.0.1','localhost'].includes(url.hostname),'Restricted fixture must be local');
 const name='review_runtime_'+randomUUID().replaceAll('-',''),role='"'+name+'"';
 await admin.query(`CREATE ROLE ${role} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS`);
 await admin.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC');
 await admin.query(`GRANT USAGE ON SCHEMA public,review_auth TO ${role}`);
 await admin.query(`GRANT SELECT(id,employee_id,name,role,status) ON review_auth.accounts TO ${role}`);
 await admin.query(`GRANT SELECT,INSERT,UPDATE ON review_auth.sessions TO ${role}`);
 await admin.query(`GRANT INSERT ON review_auth.audit TO ${role}`);
 await admin.query(`GRANT USAGE ON SEQUENCE review_auth.audit_id_seq TO ${role}`);
 url.username=name;url.password='';
 return new pg.Pool({connectionString:url.toString(),max:2});
}

export async function assertRestrictedAccess(pool){
 const result=await pool.query(`SELECT current_user AS name,
  has_table_privilege(current_user,'review_auth.accounts','UPDATE') AS account_update,
  has_schema_privilege(current_user,'public','CREATE') AS public_create,
  has_schema_privilege(current_user,'review_auth','CREATE') AS review_create`);
 assert(result.rows[0].name.startsWith('review_runtime_'),'Must actually use restricted connection');
 assert(Object.entries(result.rows[0]).filter(([key])=>key!=='name').every(([,value])=>value===false),'Runtime cannot update the reviewer roster or create schema objects');
 for(const sql of [
  "UPDATE review_auth.accounts SET name='forbidden' WHERE false",
  'DELETE FROM review_auth.accounts WHERE false',
  "INSERT INTO review_auth.accounts(id) VALUES('00000000-0000-0000-0000-000000000000')",
  'CREATE TABLE public.forbidden_table(id int)',
  'CREATE TABLE review_auth.forbidden_table(id int)',
  'DELETE FROM review_auth.sessions WHERE false',
  'UPDATE review_auth.audit SET action=action WHERE false',
  'DELETE FROM review_auth.audit WHERE false',
 ])await assert.rejects(pool.query(sql),error=>error.code==='42501','Expected SQL permission denial');
}

export async function verifyProductionEntry(connectionString){
 const port=await freePort(),origin='https://review.fixture.invalid';
 const child=spawn(process.execPath,['src/main.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,NODE_ENV:'production',REVIEW_DATABASE_URL:connectionString,REVIEW_DATABASE_SSL:'false',REVIEW_PORT:String(port),REVIEW_ORIGIN:origin},windowsHide:true,stdio:['ignore','pipe','pipe']});
 child.stdout.resume();child.stderr.resume(); // Never print connection/session details.
 let startupError;child.on('error',error=>{startupError=error;});
 try{
  let ready=false;
  for(let i=0;i<100;i++){
   if(startupError||child.exitCode!==null)throw Error('Production entrypoint failed under restricted SQL role');
   try{const response=await fetch(`http://127.0.0.1:${port}/review-api/health`,{signal:AbortSignal.timeout(500)});await response.arrayBuffer();if(response.status===200){ready=true;break;}}catch{}
   await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert(ready,'Production entrypoint starts with no runtime DDL permissions');
  const response=await fetch(`http://127.0.0.1:${port}/review-api/login`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({employeeId:'100021'})});
  assert.equal(response.status,200,'Production entrypoint login works with restricted database role');
  assert.match(response.headers.get('set-cookie'),/; Secure/,'Production cookie remains Secure');
  const session=await response.json();
  const logout=await fetch(`http://127.0.0.1:${port}/review-api/logout`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Authorization:'Bearer '+session.recoveryToken},body:'{}'});
  assert.equal(logout.status,204);
 }finally{if(child.exitCode===null&&!startupError){const ended=once(child,'exit');child.kill();await ended;}}
}

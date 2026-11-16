import {randomUUID} from 'node:crypto';
import {hash,newToken,cookieForRecovery,roleFor,sessionSeconds,renewalSeconds} from './policy.mjs';
const identity=`SELECT a.id,a.employee_id,a.name,a.role,a.status FROM review_auth.accounts a`;
const eligible=row=>row&&row.status==='allowed'&&row.role===roleFor(row.employee_id);
const view=row=>({id:row.id,employeeId:row.employee_id,name:row.name,role:row.role,identityMethod:'employee-id-only'});
export class ReviewStore {
 constructor(pool){this.pool=pool;}
 async login(employeeId){
  const c=await this.pool.connect();try{await c.query('BEGIN');
   // QC Core owns its reviewer roster. Runtime may read, not edit it.
   // Eligibility and role are checked again on every session restoration.
   const rows=(await c.query(identity+' WHERE a.employee_id=$1',[employeeId])).rows;
   if(rows.length!==1||!eligible(rows[0]))throw Object.assign(Error('This account does not have review access.'),{status:403});
   const account=rows[0],id=randomUUID(),recovery=newToken(),token=cookieForRecovery(recovery);
   const row=(await c.query(`INSERT INTO review_auth.sessions(id,account_id,token_hash,recovery_hash,expires_at) VALUES($1,$2,$3,$4,clock_timestamp()+$5*interval '1 second') RETURNING expires_at`,[id,account.id,hash(token),hash(recovery),sessionSeconds])).rows[0];
   await c.query("INSERT INTO review_auth.audit(account_id,session_id,action) VALUES($1,$2,'login')",[account.id,id]);await c.query('COMMIT');
   return {account:view(account),token,recovery,expiresAt:row.expires_at};
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
 }
 async resolve({cookie,recovery}){
  if(!cookie&&!recovery)throw Object.assign(Error('Please sign in.'),{status:401});
  const rows=(await this.pool.query(`SELECT s.id session_id,s.token_hash,s.recovery_hash,s.expires_at,s.renewed_at,a.id,a.employee_id,a.name,a.role,a.status FROM review_auth.sessions s JOIN review_auth.accounts a ON a.id=s.account_id WHERE s.revoked_at IS NULL AND s.expires_at>clock_timestamp() AND (CASE WHEN $2::text IS NOT NULL THEN s.recovery_hash=$2 ELSE s.token_hash=$1 END)`,[cookie?hash(cookie):null,recovery?hash(recovery):null])).rows;
  if(rows.length!==1)throw Object.assign(Error('Please sign in again.'),{status:401});const row=rows[0];
  if(!eligible(row))throw Object.assign(Error('This account no longer has review access.'),{status:403});
  return {account:view(row),sessionId:row.session_id,expiresAt:row.expires_at,renewedAt:row.renewed_at,cookieMatches:!!cookie&&row.token_hash===hash(cookie)};
 }
 async renew(session){
  if(Date.now()-new Date(session.renewedAt).getTime()<renewalSeconds*1000)return session.expiresAt;
  const result=await this.pool.query(`UPDATE review_auth.sessions SET renewed_at=clock_timestamp(),expires_at=clock_timestamp()+$2*interval '1 second' WHERE id=$1 AND revoked_at IS NULL AND expires_at>clock_timestamp() AND renewed_at<=clock_timestamp()-$3*interval '1 second' RETURNING expires_at`,[session.sessionId,sessionSeconds,renewalSeconds]);
  return result.rows[0]?.expires_at||session.expiresAt;
 }
 async logout(session){const c=await this.pool.connect();try{await c.query('BEGIN');const r=await c.query('UPDATE review_auth.sessions SET revoked_at=clock_timestamp() WHERE id=$1 AND revoked_at IS NULL RETURNING account_id',[session.sessionId]);if(r.rowCount)await c.query("INSERT INTO review_auth.audit(account_id,session_id,action) VALUES($1,$2,'logout')",[r.rows[0].account_id,session.sessionId]);await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}
}

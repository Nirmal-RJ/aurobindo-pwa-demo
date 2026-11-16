import {createHash,randomBytes} from 'node:crypto';
export const sessionSeconds=90*24*60*60;
export const renewalSeconds=24*60*60;
export const ghostIds=new Set([...Array.from({length:21},(_,i)=>String(100001+i)),'100023']);
export const directorIds=new Set(Array.from({length:20},(_,i)=>String(100024+i)));
export function roleFor(id){return ghostIds.has(id)?'ghost':directorIds.has(id)?'director':null;}
export function employeeId(body){if(!body||Array.isArray(body)||Object.keys(body).length!==1||typeof body.employeeId!=='string'||!/^\d{1,12}$/.test(body.employeeId.trim()))throw Object.assign(Error('Enter your employee ID.'),{status:400});return body.employeeId.trim();}
export const hash=token=>createHash('sha256').update(token).digest('hex');
export const newToken=()=>randomBytes(32).toString('base64url');
// A recovery credential can recreate its own cookie without rotating sessions in
// concurrent tabs. Knowing the cookie cannot recover the separate recovery token.
export const cookieForRecovery=token=>createHash('sha256').update('review-cookie-v1:'+token).digest('base64url');
export function credentials(req){
 const cookie=String(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('__session='))?.slice(10);
 const auth=req.headers.authorization;
 const recovery=typeof auth==='string'&&auth.startsWith('Bearer ')?auth.slice(7):null;
 if((cookie&&!/^[A-Za-z0-9_-]{43}$/.test(cookie))||(auth&&(!recovery||!/^[A-Za-z0-9_-]{43}$/.test(recovery))))throw Object.assign(Error('Please sign in again.'),{status:401});
 return {cookie:cookie||null,recovery};
}
export function sessionCookie(token,secure){return `__session=${token}; Path=/review-api; HttpOnly; SameSite=Lax; Max-Age=${sessionSeconds}${secure?'; Secure':''}`;}
export function clearCookie(secure){return `__session=; Path=/review-api; HttpOnly; SameSite=Lax; Max-Age=0${secure?'; Secure':''}`;}

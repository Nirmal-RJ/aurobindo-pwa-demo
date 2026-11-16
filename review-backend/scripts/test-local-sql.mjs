import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {withTestPostgres} from './with-test-postgres.mjs';
await withTestPostgres(async connectionString=>{
 const {stdout}=await promisify(execFile)(process.execPath,['--test','--test-isolation=none','test/login.test.mjs','test/disconnected.test.mjs','test/local-proxy.test.mjs'],{
  cwd:new URL('../',import.meta.url),env:{...process.env,REVIEW_TEST_DATABASE_URL:connectionString},windowsHide:true,timeout:120000,
 });
 process.stdout.write(stdout);
});

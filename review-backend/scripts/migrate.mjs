// Explicit administrative step. Never invoked by the production runtime.
import pg from 'pg';
import {readFile} from 'node:fs/promises';
const connectionString=process.env.REVIEW_MIGRATION_DATABASE_URL;
if(!connectionString)throw Error('REVIEW_MIGRATION_DATABASE_URL is required for an explicitly authorized schema migration.');
const pool=new pg.Pool({connectionString,max:1,connectionTimeoutMillis:3000,statement_timeout:15000,ssl:process.env.REVIEW_DATABASE_SSL==='true'?{rejectUnauthorized:true}:undefined});
try{await pool.query(await readFile(new URL('../src/schema.sql',import.meta.url),'utf8'));console.log('Review schema migration completed.');}finally{await pool.end();}

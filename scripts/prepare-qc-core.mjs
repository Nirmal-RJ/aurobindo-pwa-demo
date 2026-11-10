import {readdir,readFile,writeFile,mkdir,copyFile,rm,stat,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'dist','qc-core');
const reports=path.join(root,'deployment','qc-core');
const extensions=new Set(['.html','.css','.js','.png','.webp','.jpg','.jpeg','.gif','.svg','.ico','.mp3','.wav','.aac','.m4a','.ogg','.mp4','.webm','.ttf','.otf','.woff','.woff2','.webmanifest']);
const roots=new Set(['assets','audio','icons','review']);
const posix=value=>value.split(path.sep).join('/');
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const size=bytes=>(bytes/1048576).toFixed(2)+' MiB';
const excluded=[],files=[];

async function collect(directory,relative=''){
 for(const entry of (await readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
  const name=posix(path.join(relative,entry.name));
  if(entry.isSymbolicLink())throw Error('Refusing symlink in publish inputs: '+name);
  if(entry.isDirectory()){
   if((!relative&&!roots.has(entry.name))||entry.name.startsWith('.')||['node_modules','docs','scratch','test','tests'].includes(entry.name)){excluded.push(name+'/');continue;}
   await collect(path.join(directory,entry.name),name);continue;
  }
  if(entry.name.startsWith('.')||!extensions.has(path.extname(entry.name).toLowerCase())){excluded.push(name);continue;}
  files.push(name);
 }
}
await collect(root);
// Rebuild only this exact generated directory. Never delete a computed parent.
if(path.resolve(output)!==path.resolve(root,'dist','qc-core'))throw Error('Invalid publish destination');
for(const directory of [path.dirname(output),output]){
 try{if((await lstat(directory)).isSymbolicLink())throw Error('Refusing linked publish destination');}catch(error){if(error.code!=='ENOENT')throw error;}
}
await mkdir(path.dirname(output),{recursive:true});
try{if(!(await stat(output)).isDirectory())throw Error('Publish destination is not a directory');}catch(error){if(error.code!=='ENOENT')throw error;}
// Check existing output for directory links before recursive cleanup.
async function refuseLinks(directory){for(const entry of await readdir(directory,{withFileTypes:true})){if(entry.isSymbolicLink())throw Error('Refusing linked output: '+entry.name);if(entry.isDirectory())await refuseLinks(path.join(directory,entry.name));}}
try{await refuseLinks(output);}catch(error){if(error.code!=='ENOENT')throw error;}
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});await mkdir(reports,{recursive:true});
const manifest=[];
for(const file of files){
 const source=path.join(root,file),destination=path.join(output,file),bytes=await readFile(source);
 await mkdir(path.dirname(destination),{recursive:true});await copyFile(source,destination);
 if(hash(await readFile(destination))!==hash(bytes))throw Error('Copy verification failed: '+file);
 manifest.push({path:file,bytes:bytes.length,sha256:hash(bytes)});
}
const groups={};for(const file of manifest){const parts=file.path.split('/'),group=parts[0]==='assets'&&parts.length>2?parts.slice(0,2).join('/'):parts.length>1?parts[0]:'app shell';groups[group]=(groups[group]||0)+file.bytes;}
// Evaluate only worker registration-time declarations in an isolated context;
// no install/fetch handlers execute, and no network is available.
const shellAssets=vm.runInNewContext((await readFile(path.join(output,'sw.js'),'utf8'))+'\n;ASSETS',{self:{addEventListener(){}},URL},{timeout:1000});
const shellFiles=[...new Set(shellAssets.map(value=>decodeURIComponent(new URL(value,'https://stage.invalid/').pathname.slice(1)||'index.html')))];
const byPath=new Map(manifest.map(file=>[file.path,file]));
const missingShell=shellFiles.filter(file=>!byPath.has(file));
if(missingShell.length)throw Error('Missing shell precache files: '+missingShell.join(', '));
const shellBytes=shellFiles.reduce((total,file)=>total+byPath.get(file).bytes,0),totalBytes=manifest.reduce((total,file)=>total+file.bytes,0);
const largest=[...manifest].sort((a,b)=>b.bytes-a.bytes).slice(0,20);
await writeFile(path.join(reports,'publish-manifest.json'),JSON.stringify({project:'apl-qc-core-app-f5a3e',site:'apl-qc-core-app-f5a3e',output:'dist/qc-core',fileCount:manifest.length,totalBytes,shellPrecache:{files:shellFiles.length,bytes:shellBytes},files:manifest,excluded},null,2)+'\n');
const table=entries=>entries.map(([name,bytes])=>`| ${name} | ${size(bytes)} |`).join('\n');
await writeFile(path.join(reports,'ASSET_REPORT.md'),`# QC Core staged asset report\n\nGenerated locally; no upload or deployment.\n\n- Files: ${manifest.length}\n- Total uncompressed file bytes: ${totalBytes} (${size(totalBytes)}). This is the full deployment, not one user's download.\n- Root service-worker precache: ${shellFiles.length} unique paths, ${size(shellBytes)} uncompressed. Games may separately preload additional packages after launch; repeat visits depend on cache state/version changes.\n- All staged files were SHA-256 compared against source. No game or UI source was rewritten.\n- Media fallback files are retained so existing offline/fallback behavior is preserved. YouTube-first playback does not itself download those fallback videos.\n\n## By directory\n\n| Directory | Uncompressed size |\n|---|---:|\n${table(Object.entries(groups).sort((a,b)=>b[1]-a[1]))}\n\n## Largest files\n\n| File | Uncompressed size |\n|---|---:|\n${table(largest.map(file=>[file.path,file.bytes]))}\n\n## Transfer planning\n\nThese are filesystem sizes, not measured CDN transfer, compression or user traffic. As an illustrative calculation, 100 fresh clients each downloading 10 MB is approximately 1 GB of transfer. A storage total alone cannot establish whether a free transfer quota is sufficient. Existing caches, per-game loaders, fallback videos and updates affect real consumption. No preload/cache/animation/audio behavior was changed to reduce size.\n\nThe JSON manifest lists every published file/hash and excluded path. Backend, credentials, tests, artifacts, documentation and development tools are excluded by construction.\n`);
console.log(`Prepared ${manifest.length} verified files, ${size(totalBytes)}; shell precache ${size(shellBytes)}. Output: dist/qc-core. Reports: deployment/qc-core. No deployment.`);

// Independent, disposable, synthetic test cluster. Never uses an existing DB URL.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdir, mkdtemp, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import net from 'node:net';
const run = promisify(execFile);
export async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
export async function withTestPostgres(test) {
  const {initdb, pg_ctl} = await import('@embedded-postgres/windows-x64');
  const scratch = fileURLToPath(new URL('../scratch/', import.meta.url));
  await mkdir(scratch, {recursive: true});
  const directory = await mkdtemp(path.join(scratch, 'actual-ui-db-'));
  const data = path.join(directory, 'data'), port = await freePort();
  let started = false;
  try {
    await run(initdb, ['-D', data, '-U', 'review_fixture', '--auth=trust', '--encoding=UTF8', '--locale=C'], {windowsHide: true, timeout: 60000});
    await run(pg_ctl, ['-D', data, '-l', path.join(directory, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port}`, '-w', 'start'], {windowsHide: true, timeout: 60000});
    started = true;
    await test(`postgresql://review_fixture@127.0.0.1:${port}/postgres`);
  } finally {
    if (started) await run(pg_ctl, ['-D', data, '-m', 'immediate', '-w', 'stop'], {windowsHide: true, timeout: 30000});
    // Only remove the exact directory created above, strictly inside scratch.
    if (path.dirname(directory) !== path.resolve(scratch) || !path.basename(directory).startsWith('actual-ui-db-')) throw Error('Unsafe test cleanup path');
    await rm(directory, {recursive: true, force: true});
  }
}

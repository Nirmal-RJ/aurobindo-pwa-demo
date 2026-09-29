import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webmanifest': 'application/manifest+json' };
http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = path.resolve(root, `.${pathname}`);
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(part => part.startsWith('.'))) {
      response.writeHead(403).end('Forbidden'); return;
    }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    if (!mime[path.extname(file)]) { response.writeHead(404).end('Not found'); return; }
    const body = await readFile(file);
    if (path.extname(file) === '.mp4') {
      const headers = { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
      if (request.headers.range) {
        const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
        const start = range && range[1] ? Number(range[1]) : Math.max(0, body.length - Number(range?.[2]));
        const end = range && range[1] && range[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
        if (!range || (!range[1] && !range[2]) || !Number.isSafeInteger(start) || start > end || start >= body.length) {
          response.writeHead(416, { ...headers, 'Content-Range': `bytes */${body.length}` }).end(); return;
        }
        response.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${body.length}`, 'Content-Length': end - start + 1 });
        response.end(body.subarray(start, end + 1)); return;
      }
      response.writeHead(200, { ...headers, 'Content-Length': body.length }).end(body); return;
    }
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    response.end(body);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(port, '0.0.0.0', () => console.log(`Aurobindo Pharma is running at http://localhost:${port}`));

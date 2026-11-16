import http from 'node:http';

const isAPI = pathname => pathname === '/review-api' || pathname.startsWith('/review-api/');
const hopHeaders = ['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade'];
function headersFor(headers) {
  const result = {...headers};
  for (const name of [...hopHeaders, ...String(headers.connection || '').split(',').map(value => value.trim().toLowerCase())]) delete result[name];
  return result;
}

/** Local development only. Preserve browser Origin and HttpOnly Set-Cookie. */
export function createReviewProxy(rawTarget) {
  let target;
  if (rawTarget) {
    target = new URL(rawTarget);
    if (target.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) || target.username || target.password || target.pathname !== '/' || target.search || target.hash) {
      throw Error('REVIEW_API_TARGET must be a loopback HTTP origin, without credentials or a path.');
    }
  }
  return (request, response) => {
    if (!isAPI(new URL(request.url, 'http://localhost').pathname)) return false;
    const unavailable = () => {
      if (response.destroyed) return;
      if (response.headersSent) { response.destroy(); return; }
      response.writeHead(503, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store'});
      response.end(JSON.stringify({message: 'Local review service is unavailable. Start the review backend and retry.'}));
    };
    if (!target) { request.resume(); unavailable(); return true; }
    const headers = headersFor(request.headers);
    headers.host = target.host;
    const upstream = http.request(target, {method: request.method, path: request.url, headers}, incoming => {
      const returned = headersFor(incoming.headers);
      returned['cache-control'] = 'private, no-store';
      response.writeHead(incoming.statusCode, returned);
      incoming.on('error', () => response.destroy());
      incoming.pipe(response);
    });
    upstream.setTimeout(11000, () => upstream.destroy(Error('Local review upstream timed out')));
    upstream.on('error', unavailable);
    request.on('aborted', () => upstream.destroy());
    response.on('close', () => { if (!response.writableFinished) upstream.destroy(); });
    request.pipe(upstream);
    return true;
  };
}

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RocketAssetCache = api;
})(typeof self !== 'undefined' ? self : globalThis, () => {
  const cacheName = 'rocketier-media-v1';
  function assetKey(entry, base) {
    const url = new URL(entry.url, base);
    url.searchParams.set('rocketAsset', entry.revision);
    return url.href;
  }
  async function cachedResponse(request, cache, entries, base) {
    const url = new URL(request.url);
    if (url.searchParams.has('rocketAsset')) return (await cache.match(url.href)) || null;
    const entry = entries.find(item => new URL(item.url, base).pathname === url.pathname);
    if (!entry) return null;
    const response = await cache.match(assetKey(entry, base));
    if (!response) return null;
    const range = request.headers.get('range');
    if (!range) return response;
    const blob = await response.blob();
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const start = match?.[1] ? Number(match[1]) : Math.max(0, blob.size - Number(match?.[2]));
    const end = match?.[1] && match[2] ? Math.min(Number(match[2]), blob.size - 1) : blob.size - 1;
    const headers = new Headers(response.headers);
    headers.set('Accept-Ranges', 'bytes');
    if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || start > end || start >= blob.size) {
      headers.set('Content-Range', `bytes */${blob.size}`);
      headers.delete('Content-Length');
      return new Response(null, { status: 416, headers });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${blob.size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(blob.slice(start, end + 1, blob.type), { status: 206, headers });
  }
  return { cacheName, assetKey, cachedResponse };
});

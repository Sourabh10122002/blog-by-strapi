const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const srcParam = urlObj.searchParams.get('url');
    if (!srcParam) {
      return new Response('Missing url', { status: 400 });
    }
    let srcUrl: URL;
    try {
      srcUrl = new URL(srcParam);
    } catch {
      return new Response('Invalid url', { status: 400 });
    }
    const allowedDefault = new URL(STRAPI_URL).host;
    const allowedHosts = new Set([allowedDefault, 'localhost:1337', '127.0.0.1:1337']);
    if (!allowedHosts.has(srcUrl.host)) {
      return new Response('Host not allowed', { status: 403 });
    }

    const upstream = await fetch(srcUrl.href, { cache: 'no-store' });
    if (!upstream.ok) {
      return new Response('Upstream fetch failed', { status: upstream.status });
    }
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const buf = await upstream.arrayBuffer();
    return new Response(buf, {
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=600',
      },
    });
  } catch (e) {
    return new Response('Proxy error', { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getBackendOrigin } from './backend-api-config';

/**
 * Same-origin reverse proxy to the AriesXpert backend.
 *
 * The mobile app calls `https://api.ariesxpert.com/api/{app,admin,v1}/...` directly
 * with a `Authorization: Bearer <jwt>` header. The browser cannot do that without
 * tripping CORS, so every parity-app request is issued against the app's own origin
 * and forwarded here verbatim — same path, same method, same body, same auth header —
 * so both clients hit an identical backend contract.
 */
/**
 * `prefix` names the backend path segment to forward under. `'root'` forwards to the
 * backend origin with no `/api/<prefix>` segment — needed for the handful of endpoints
 * the mobile app calls at the root (e.g. `POST /attendance`).
 */
export function createBackendProxy(prefix: 'app' | 'admin' | 'v1' | 'root') {
  async function proxyRequest(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
  ) {
    const { path } = await params;
    const subpath = (path || []).join('/');
    const url = new URL(req.url);
    const targetUrl =
      prefix === 'root'
        ? `${getBackendOrigin()}/${subpath}${url.search}`
        : `${getBackendOrigin()}/api/${prefix}/${subpath}${url.search}`;

    try {
      const headers: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        // Hop-by-hop and host-scoped headers must not be forwarded upstream.
        if (
          ![
            'host',
            'connection',
            'content-length',
            'accept-encoding',
            'transfer-encoding',
          ].includes(key.toLowerCase())
        ) {
          headers[key] = value;
        }
      });

      const method = req.method;
      const body = ['GET', 'HEAD'].includes(method) ? undefined : await req.arrayBuffer();

      const upstreamRes = await fetch(targetUrl, {
        method,
        headers,
        body,
        cache: 'no-store',
        redirect: 'manual',
      });

      const responseBody = await upstreamRes.arrayBuffer();
      const responseHeaders = new Headers();
      upstreamRes.headers.forEach((val, key) => {
        // Content-encoding/length describe the already-decoded upstream payload.
        if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
          responseHeaders.set(key, val);
        }
      });

      return new NextResponse(responseBody, {
        status: upstreamRes.status,
        statusText: upstreamRes.statusText,
        headers: responseHeaders,
      });
    } catch (err: any) {
      console.error(`[/api/${prefix} proxy error] ${targetUrl}:`, err?.message);
      return NextResponse.json(
        { success: false, message: 'Backend service temporarily unavailable' },
        { status: 502 }
      );
    }
  }

  return {
    GET: proxyRequest,
    POST: proxyRequest,
    PUT: proxyRequest,
    PATCH: proxyRequest,
    DELETE: proxyRequest,
    OPTIONS: proxyRequest,
  };
}

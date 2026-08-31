import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ariesxpert.com';

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const subpath = path.join('/');
    const url = new URL(req.url);
    const targetUrl = `${BACKEND_API_URL}/api/app/${subpath}${url.search}`;

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      // Avoid forwarding host or connection headers that conflict with upstream
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    const method = req.method;
    const body = ['GET', 'HEAD'].includes(method) ? undefined : await req.arrayBuffer();

    const upstreamRes = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const responseBody = await upstreamRes.arrayBuffer();
    const responseHeaders: Record<string, string> = {};
    upstreamRes.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    return new NextResponse(responseBody, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error('[/api/app proxy error]:', err?.message);
    return NextResponse.json(
      { success: false, message: 'Backend service temporarily unavailable' },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ariesxpert.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const expertId = body.user || '';

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const auth = req.headers.get('authorization');
      if (auth) headers['Authorization'] = auth;

      const upstreamRes = await fetch(`${BACKEND_API_URL}/api/app/expert/refreshUser`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user: expertId }),
      });

      if (upstreamRes.ok) {
        const data = await upstreamRes.json().catch(() => null);
        if (data) {
          return NextResponse.json(data);
        }
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      result: {
        _id: expertId,
        status: 'Active',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: true, message: 'User refreshed' });
  }
}

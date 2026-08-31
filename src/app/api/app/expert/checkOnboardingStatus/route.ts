import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ariesxpert.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = body.phone ? String(body.phone).replace(/\D/g, '').slice(-10) : '';

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const auth = req.headers.get('authorization');
      if (auth) headers['Authorization'] = auth;

      const upstreamRes = await fetch(`${BACKEND_API_URL}/api/app/expert/checkOnboardingStatus`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ phone }),
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
        phone,
        onboardingStatus: 'pending',
        onboardingStep: 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: true, message: 'Status checked' });
  }
}

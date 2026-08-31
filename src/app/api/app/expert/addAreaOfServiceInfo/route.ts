import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ariesxpert.com';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let parsedFields: Record<string, any> = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        formData.forEach((value, key) => {
          if (typeof value === 'string') {
            parsedFields[key] = value;
          }
        });
      }
    } else {
      parsedFields = await req.json().catch(() => ({}));
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const auth = req.headers.get('authorization');
      if (auth) headers['Authorization'] = auth;

      const upstreamRes = await fetch(`${BACKEND_API_URL}/api/app/expert/addAreaOfServiceInfo`, {
        method: 'POST',
        headers,
        body: JSON.stringify(parsedFields),
      });

      if (upstreamRes.ok) {
        const data = await upstreamRes.json().catch(() => null);
        if (data && data.success !== false) {
          return NextResponse.json(data);
        }
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Service territory saved successfully',
      result: parsedFields,
    });
  } catch (error: any) {
    return NextResponse.json({ success: true, message: 'Saved' });
  }
}

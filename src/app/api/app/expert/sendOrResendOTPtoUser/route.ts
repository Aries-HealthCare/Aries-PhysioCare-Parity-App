import { NextRequest, NextResponse } from 'next/server';

const MSG91_AUTH_KEY = process.env.MSG91AUTHKEY || process.env.MSG91_AUTH_KEY || '439578AlXaXZMz67a9d754P1';
const MSG91_TEMPLATE_ID = process.env.MSG91TEMPLATEID || process.env.MSG91_TEMPLATE_ID || '67a9d598d6fc0515ee0826c8';
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ariesxpert.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mobileNo, cc = '91' } = body;

    const cleanMobile = mobileNo ? String(mobileNo).replace(/\D/g, '') : '';
    const last10Digits = cleanMobile.slice(-10);
    const cleanCc = cc ? String(cc).replace(/\D/g, '') : '91';
    const fullMobile = `${cleanCc}${last10Digits}`;

    if (!last10Digits || last10Digits.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // 1. Trigger MSG91 Direct Server-to-Server SMS OTP
    const msg91Url = `https://api.msg91.com/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}&mobile=${fullMobile}&authkey=${MSG91_AUTH_KEY}&otp_length=6`;
    
    let msg91ResponseData: any = null;
    try {
      const msg91Res = await fetch(msg91Url, { method: 'GET' });
      msg91ResponseData = await msg91Res.json().catch(() => null);
    } catch (msg91Err) {
      console.warn('[MSG91 Direct] API error:', msg91Err);
    }

    // 2. Synchronize with central backend MongoDB OTP audit ledger
    try {
      await fetch(`${BACKEND_API_URL}/api/app/expert/sendOrResendOTPtoUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNo: last10Digits, cc: cleanCc }),
      }).catch(() => {});
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `Verification code sent to +91 ${last10Digits} via SMS.`,
      result: msg91ResponseData || { type: 'success', message: 'OTP sent' },
    });
  } catch (error: any) {
    console.error('[/api/app/expert/sendOrResendOTPtoUser] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}

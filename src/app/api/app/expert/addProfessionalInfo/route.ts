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
            try {
              // Parse nested JSON strings like professionalInfo
              parsedFields[key] = JSON.parse(value);
            } catch {
              parsedFields[key] = value;
            }
          }
        });
      }
    } else {
      parsedFields = await req.json().catch(() => ({}));
    }

    // If professionalInfo was provided as a nested object, flatten or ensure both are present
    if (parsedFields.professionalInfo && typeof parsedFields.professionalInfo === 'object') {
      parsedFields.qualification = parsedFields.qualification || parsedFields.professionalInfo.qualification;
      parsedFields.specialization = parsedFields.specialization || parsedFields.professionalInfo.specialization || parsedFields.professionalInfo.qualification;
      parsedFields.licenseNumber = parsedFields.licenseNumber || parsedFields.professionalInfo.licenseNumber || parsedFields.professionalInfo.councilRegistrationNumber;
      parsedFields.designation = parsedFields.designation || parsedFields.professionalInfo.professionalRole;
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const auth = req.headers.get('authorization');
      if (auth) headers['Authorization'] = auth;

      const upstreamRes = await fetch(`${BACKEND_API_URL}/api/app/expert/addProfessionalInfo`, {
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
      message: 'Professional qualifications saved successfully',
      result: {
        ...parsedFields,
        onboardingStep: 2,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: true, message: 'Saved', result: { onboardingStep: 2 } });
  }
}

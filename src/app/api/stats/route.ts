import { NextResponse } from 'next/server';
import { getWebsiteStatsUrl } from '@/lib/backend-api-config';

/**
 * GET /api/stats
 * Server-side proxy to GET /website/stats on the backend.
 * Returns real therapist count, patient count, and city count.
 * Revalidates every 5 minutes (ISR).
 */
export const revalidate = 300;

export interface WebsiteStats {
  therapistCount: number;
  patientCount: number;
  cityCount: number;
}

export async function GET() {
  try {
    const url = getWebsiteStatsUrl();
    const res = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Backend responded ${res.status}`);
    }

    const json = await res.json();
    const stats: WebsiteStats = json?.stats ?? null;

    if (!stats) {
      return NextResponse.json(
        { error: 'Stats data missing from backend response' },
        { status: 502 },
      );
    }

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    console.error('[/api/stats] Failed to fetch stats from backend:', err?.message);
    return NextResponse.json(
      { error: 'Stats temporarily unavailable' },
      { status: 503 },
    );
  }
}

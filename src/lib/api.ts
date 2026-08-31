/**
 * Centralised API client for the AriesXpert website.
 * 
 * CLIENT calls (from 'use client' components):
 *   - /api/therapists  → secure server-side proxy (token never exposed)
 * 
 * SERVER calls (from RSC / route handlers):
 *   - Direct to backend with ADMIN_API_TOKEN
 */

// Public-facing base (used by server route handlers)
const PRODUCTION_API_BASE = 'https://api.ariesxpert.com/api/v1';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  PRODUCTION_API_BASE;

if (
  typeof process !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  API_BASE.includes('onrender.com')
) {
  throw new Error(
    'Invalid production API base: Render fallback is not allowed. Set NEXT_PUBLIC_API_BASE_URL to https://api.ariesxpert.com/api/v1',
  );
}

// ─── Generic helpers ──────────────────────────────────────────────────────────

export async function apiGet(path: string, params?: Record<string, any>) {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API POST error ${res.status}: ${path}`);
  return res.json();
}

// ─── Therapists ───────────────────────────────────────────────────────────────

/**
 * CLIENT-SIDE: calls the internal proxy (/api/therapists).
 * Safe to use in 'use client' components — token is never exposed.
 */
export async function getTherapistsClient(params: {
  specialization?: string;
  city?: string;
  state?: string;
  area?: string;
  limit?: number;
} = {}) {
  const qs = new URLSearchParams();
  if (params.specialization) qs.set('specialization', params.specialization);
  if (params.city) qs.set('city', params.city);
  if (params.state) qs.set('state', params.state);
  if (params.area) qs.set('area', params.area);
  if (params.limit) qs.set('limit', String(params.limit));

  const res = await fetch(`/api/therapists?${qs.toString()}`);
  if (!res.ok) return { therapists: [], total: 0 };
  return res.json();
}

/**
 * SERVER-SIDE: calls backend directly with admin token.
 * Use in RSC or route handlers only.
 */
export async function getTherapists(params: { specialization?: string; city?: string } = {}) {
  const TOKEN = process.env.ADMIN_API_TOKEN || '';
  const qs = new URLSearchParams({ status: 'active', isVerified: 'true' });
  if (params.specialization) qs.set('specialization', params.specialization);
  if (params.city) qs.set('city', params.city);

  try {
    const res = await fetch(`${API_BASE}/therapists?${qs}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.data ?? data.therapists ?? [];
  } catch {
    return [];
  }
}

// ─── Visits/Bookings ──────────────────────────────────────────────────────────

export async function createVisit(data: {
  therapistId: string;
  visitDate: string;
  type: string;
  status: string;
  notes?: string;
}) {
  return apiPost('/visits', data);
}

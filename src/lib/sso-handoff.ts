/**
 * Cross-origin SSO handoff parser for AriesXpert-Website-India -> Aries-PhysioCare-Parity-App.
 *
 * Reads `#sso_token=<jwt>&expert_id=<objectId>` from the URL hash fragment (never query params
 * so tokens never enter HTTP requests, CDN/server logs, or Referer headers) and immediately
 * strips the fragment from browser history.
 */

export interface SsoHandoffPayload {
  token: string;
  expertId: string;
}

const MONGO_ID_RE = /^[0-9a-fA-F]{24}$/;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function parseSsoHash(hash: string | null | undefined): SsoHandoffPayload | null {
  if (!hash || typeof hash !== 'string') return null;
  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!cleaned || !cleaned.includes('sso_token=')) return null;

  const params = new URLSearchParams(cleaned);
  const token = (params.get('sso_token') || '').trim();
  if (!token || token.length < 16 || token.length > 8192 || token.split('.').length !== 3) {
    return null;
  }

  let expertId = (params.get('expert_id') || '').trim();
  if (!MONGO_ID_RE.test(expertId)) {
    const claims = decodeJwtPayload(token);
    const candidate =
      claims?.therapistProfileId ?? claims?.expertId ?? claims?.id ?? claims?._id;
    expertId = typeof candidate === 'string' && MONGO_ID_RE.test(candidate.trim())
      ? candidate.trim()
      : '';
  }

  if (!expertId) return null;

  return { token, expertId };
}

export function stripSsoHashFromUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.location.hash && window.location.hash.includes('sso_token=')) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`,
      );
    }
  } catch {
    /* ignore history restrictions */
  }
}

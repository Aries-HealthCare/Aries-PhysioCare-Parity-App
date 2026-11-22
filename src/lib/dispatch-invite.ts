/**
 * Pure domain helpers for Therapist Dispatch Claim invite tokens and error mapping.
 * Mirrors `dispatch_link_handler.dart` and `therapist_dispatch_claim_page.dart`.
 */

export const DISPATCH_TOKEN_REGEX = /^[A-Za-z0-9_-]{43}$/;
export const PENDING_DISPATCH_STORAGE_KEY = 'aries_pending_dispatch_token';

const IGNORED_INVITE_SEGMENTS = new Set(['payment-success', 'payment-failed']);

export function isValidDispatchToken(token: string | null | undefined): boolean {
  return typeof token === 'string' && DISPATCH_TOKEN_REGEX.test(token);
}

export function extractDispatchToken(input: {
  tokenParam?: string | null;
  pathname?: string | null;
}): string | null {
  const rawParam = typeof input.tokenParam === 'string' ? input.tokenParam.trim() : '';
  if (rawParam && isValidDispatchToken(rawParam)) {
    return rawParam;
  }

  const pathname = typeof input.pathname === 'string' ? input.pathname : '';
  const match = pathname.match(/\/invites\/([^/?#]+)/i);
  if (!match) return null;

  let segment = match[1];
  try {
    segment = decodeURIComponent(segment).trim();
  } catch {
    segment = segment.trim();
  }

  if (!segment || IGNORED_INVITE_SEGMENTS.has(segment.toLowerCase())) {
    return null;
  }

  return isValidDispatchToken(segment) ? segment : null;
}

export interface DispatchErrorMapping {
  title: string;
  message: string;
  requiresLogin?: boolean;
}

const DISPATCH_ERROR_MAP: Record<string, DispatchErrorMapping> = {
  DISPATCH_EXPIRED: {
    title: 'Invite Expired',
    message:
      'This visit assignment link has expired. Check your Leads inbox for new opportunities.',
  },
  DISPATCH_ALREADY_ASSIGNED: {
    title: 'Already Assigned',
    message: 'Another therapist has already accepted this visit assignment.',
  },
  DISPATCH_ALREADY_RESOLVED: {
    title: 'Assignment Closed',
    message: 'This visit assignment has already been resolved and is no longer available.',
  },
  DISPATCH_UNAUTHORIZED: {
    title: 'Not Authorized',
    message:
      'This invite belongs to a different therapist account. Sign in with the invited account or contact support.',
  },
  DISPATCH_THERAPIST_DOUBLE_BOOKED: {
    title: 'Schedule Conflict',
    message: 'You already have another appointment scheduled at this time slot.',
  },
  DISPATCH_SESSION_EXPIRED: {
    title: 'Session Expired',
    message: 'Your session has expired. Sign in again to accept or decline this visit.',
    requiresLogin: true,
  },
};

export function mapDispatchErrorCode(
  code?: string | null,
  fallback?: string
): DispatchErrorMapping {
  if (typeof code === 'string' && code.trim()) {
    const trimmed = code.trim();
    const upper = trimmed.toUpperCase();
    if (DISPATCH_ERROR_MAP[upper]) {
      return DISPATCH_ERROR_MAP[upper];
    }
    const embedded = upper.match(/DISPATCH_[A-Z_]+/);
    if (embedded && DISPATCH_ERROR_MAP[embedded[0]]) {
      return DISPATCH_ERROR_MAP[embedded[0]];
    }
  }

  return {
    title: 'Unable to Process Assignment',
    message:
      (typeof fallback === 'string' && fallback.trim()) ||
      'We could not process this visit assignment right now. Please try again.',
  };
}

export function savePendingDispatchToken(token: string): void {
  if (typeof window === 'undefined' || !isValidDispatchToken(token)) return;
  try {
    window.sessionStorage.setItem(PENDING_DISPATCH_STORAGE_KEY, token);
  } catch {
    /* ignore storage unavailability */
  }
}

export function readPendingDispatchToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_DISPATCH_STORAGE_KEY);
    return isValidDispatchToken(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function clearPendingDispatchToken(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(PENDING_DISPATCH_STORAGE_KEY);
  } catch {
    /* ignore storage unavailability */
  }
}

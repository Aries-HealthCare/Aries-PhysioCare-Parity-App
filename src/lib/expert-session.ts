export const SESSION_COOKIE = 'ax_expert_session';
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0-parity';

const PROTECTED_PREFIXES = ['/app', '/onboarding', '/onboarding-status'];
const AUTH_PATHS = ['/login', '/verify', '/reset-password'];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function persistBrowserSession(token: string | null): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
    } else {
      await fetch('/api/session', { method: 'DELETE', credentials: 'include' });
    }
  } catch {
    /* cookie persistence is best-effort; localStorage remains the fallback */
  }
}

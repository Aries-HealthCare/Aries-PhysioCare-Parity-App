import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, isAuthPath, isProtectedPath } from '@/lib/expert-session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (isProtectedPath(pathname) && !hasSession) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }

  if (isAuthPath(pathname) && hasSession && !request.nextUrl.searchParams.get('force')) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/app/:path*',
    '/app',
    '/onboarding',
    '/onboarding/:path*',
    '/onboarding-status',
    '/login',
    '/verify',
    '/reset-password',
  ],
};

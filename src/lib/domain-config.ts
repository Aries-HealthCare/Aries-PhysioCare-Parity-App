/**
 * Domain & Subdomain Configuration for Aries HealthCare EcoSystem
 * Separates Main Website (ariesphysiocare.com) and Provider Parity App (app.ariesphysiocare.com)
 */

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'ariesphysiocare.com';
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'app.ariesphysiocare.com';

/**
 * Returns the fully qualified URL for the Parity App (app.ariesphysiocare.com)
 */
export function getAppUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    // If already on app subdomain, keep relative path
    if (host.startsWith('app.')) {
      return cleanPath;
    }
    // If in dev
    if (host.includes('localhost')) {
      const port = window.location.port ? `:${window.location.port}` : '';
      return `${window.location.protocol}//app.localhost${port}${cleanPath}`;
    }
  }

  if (IS_PRODUCTION) {
    return `https://${APP_DOMAIN}${cleanPath}`;
  }

  return cleanPath;
}

/**
 * Returns the fully qualified URL for the Main Marketing Website (ariesphysiocare.com)
 */
export function getMainWebsiteUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    // If on main domain, keep relative path
    if (!host.startsWith('app.')) {
      return cleanPath;
    }
    if (host.includes('localhost')) {
      const port = window.location.port ? `:${window.location.port}` : '';
      return `${window.location.protocol}//localhost${port}${cleanPath}`;
    }
  }

  if (IS_PRODUCTION) {
    return `https://${MAIN_DOMAIN}${cleanPath}`;
  }

  return cleanPath;
}

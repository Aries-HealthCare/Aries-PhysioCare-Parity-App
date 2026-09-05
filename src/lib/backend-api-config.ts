/**
 * Shared backend API base URL resolution.
 *
 * The mobile app (ariesxpertv2) talks to a single origin — `Environment.apiBaseUrl`
 * (`https://api.ariesxpert.com`) — and appends full paths such as
 * `/api/app/...`, `/api/admin/...` and `/api/v1/...` to it.
 *
 * The web parity app must resolve the *same* origin, regardless of whether the
 * deployment env var is configured with an `/api/v1` suffix (as documented in
 * `.env.example`) or as a bare origin. Everything downstream builds mobile-shaped
 * paths on top of `getBackendOrigin()`.
 */

const DEFAULT_ORIGIN = 'https://api.ariesxpert.com';

function readConfiguredBaseUrl(): string | undefined {
  const raw =
    process.env.BACKEND_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.API_BASE_URL?.trim();

  return raw ? raw.replace(/\/$/, '') : undefined;
}

/**
 * Bare backend origin with any `/api`, `/api/v1` suffix stripped.
 * Mirrors `Environment.apiBaseUrl` in the Flutter app.
 */
export function getBackendOrigin(): string {
  const configured = readConfiguredBaseUrl();
  if (!configured) return DEFAULT_ORIGIN;
  const origin = configured.replace(/\/api(\/v\d+)?\/?$/, '').replace(/\/$/, '');
  return origin || DEFAULT_ORIGIN;
}

/**
 * Socket.io origin — identical to `Environment.socketBaseUrl` in the Flutter app.
 */
export function getSocketOrigin(): string {
  return getBackendOrigin();
}

export function getBackendApiBaseUrl(): string {
  const configured = readConfiguredBaseUrl();
  if (configured) {
    return configured;
  }

  // Canonical live production backend endpoint
  return `${DEFAULT_ORIGIN}/api/v1`;
}

export function getWebsiteTherapistsUrl(params: URLSearchParams): string {
  return `${getBackendApiBaseUrl()}/website/therapists?${params.toString()}`;
}

export function getWebsiteStatsUrl(): string {
  return `${getBackendApiBaseUrl()}/website/stats`;
}

/**
 * Shared backend API base URL resolution for server-side Website proxies.
 * BACK-012 — therapist proxy URL alignment.
 */

const DEV_DEFAULT_BASE_URL = 'http://localhost:5001/api/v1';

function readConfiguredBaseUrl(): string | undefined {
  const raw =
    process.env.BACKEND_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.API_BASE_URL?.trim();

  return raw ? raw.replace(/\/$/, '') : undefined;
}

export function getBackendApiBaseUrl(): string {
  const configured = readConfiguredBaseUrl();
  if (configured) {
    return configured;
  }

  // Canonical live production backend endpoint
  return 'https://api.ariesxpert.com/api/v1';
}

export function getWebsiteTherapistsUrl(params: URLSearchParams): string {
  return `${getBackendApiBaseUrl()}/website/therapists?${params.toString()}`;
}

export function getWebsiteStatsUrl(): string {
  return `${getBackendApiBaseUrl()}/website/stats`;
}

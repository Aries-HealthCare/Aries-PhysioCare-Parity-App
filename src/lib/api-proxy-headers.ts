const STRIPPED_UPSTREAM_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'accept-encoding',
  'transfer-encoding',
  'cookie',
  // Server-to-server proxy requests must never forward browser CORS/fetch headers;
  // otherwise upstream CORS middleware treats proxied same-origin POSTs as cross-origin.
  'origin',
  'referer',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-forwarded-port',
]);

export const STRIPPED_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'content-security-policy',
  'x-frame-options',
]);

export function buildUpstreamHeaders(
  incoming: Headers | Record<string, string>,
  sessionToken?: string
): Record<string, string> {
  const headers: Record<string, string> = {};
  const entries: Array<[string, string]> =
    incoming instanceof Headers ? Array.from(incoming.entries()) : Object.entries(incoming);

  for (const [key, value] of entries) {
    const lower = key.toLowerCase();
    if (STRIPPED_UPSTREAM_HEADERS.has(lower) || lower.startsWith('sec-fetch-')) {
      continue;
    }
    headers[key] = value;
  }

  if (sessionToken && !headers.authorization && !headers.Authorization) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  return headers;
}

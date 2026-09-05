/**
 * Mobile-parity HTTP transport.
 *
 * A 1:1 port of `ApiService._makeRequest` / `_multipart` from the Flutter app
 * (`ariesxpertv2/lib/core/network/api_service.dart`), so the web parity app and the
 * mobile app produce byte-identical requests against the same backend:
 *
 *  - identical paths (`/api/app/...`, `/api/admin/...`, `/api/v1/...`)
 *  - identical `Authorization: Bearer <jwt>` header
 *  - identical JSON bodies
 *  - identical response envelope handling (`{ success, message, result | data }`)
 *  - 30s timeout, one retry on a transport-level failure
 *  - a 401 throws but does NOT destroy the session (mobile does the same)
 *
 * Crucially, failures **throw**. The parity app must never render invented data in
 * place of backend data — if the backend is unreachable the caller surfaces the error.
 */

import { getBackendOrigin } from '@/lib/backend-api-config';

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 0) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }

  get isUnauthorized() {
    return this.statusCode === 401;
  }

  get isOffline() {
    return this.statusCode === 0 || this.statusCode === 408;
  }
}

const TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 2;

const TOKEN_KEYS = ['jwt_token', 'provider_jwt'];

export function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  for (const key of TOKEN_KEYS) {
    try {
      const value = window.localStorage.getItem(key);
      if (value) return value;
    } catch {
      /* storage unavailable (private mode) — treat as anonymous */
    }
  }
  return null;
}

export function writeToken(token: string) {
  if (typeof window === 'undefined') return;
  for (const key of TOKEN_KEYS) {
    try {
      window.localStorage.setItem(key, token);
    } catch {
      /* ignore */
    }
  }
}

export function clearStoredToken() {
  if (typeof window === 'undefined') return;
  for (const key of [...TOKEN_KEYS, 'expert_user_data']) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Resolve a mobile-shaped path (e.g. `/api/app/expert/refreshUser`) to a fetchable URL.
 * In the browser this stays same-origin so the Next route handlers proxy it (no CORS);
 * on the server it targets the backend origin directly.
 */
export function resolveUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined') return `${getBackendOrigin()}${normalized}`;

  // `/api/{app,admin,v1}/...` have their own same-origin proxies. Anything else the
  // mobile app calls at the backend root (e.g. `/attendance`) goes through the root
  // proxy so it reaches the backend rather than 404ing against this Next app.
  if (/^\/api\/(app|admin|v1)\//.test(normalized)) return normalized;
  return `/api/backend${normalized}`;
}

function buildHeaders(includeAuth: boolean, isMultipart: boolean): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (!isMultipart) headers['Content-Type'] = 'application/json';
  if (includeAuth) {
    const token = readToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface ApiEnvelope<T = any> {
  success?: boolean;
  message?: string;
  result?: T;
  data?: T;
  count?: number;
  [key: string]: any;
}

interface RequestOptions {
  body?: unknown;
  includeAuth?: boolean;
  /** Multipart payload — mirrors `ApiService.postMultipart`. */
  formData?: FormData;
  signal?: AbortSignal;
}

/**
 * Port of `ApiService._makeRequest`. Returns the decoded response envelope,
 * or throws `ApiError`.
 */
export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  options: RequestOptions = {}
): Promise<ApiEnvelope<T>> {
  const { body, includeAuth = true, formData, signal } = options;
  const url = resolveUrl(path);

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort);

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: buildHeaders(includeAuth, !!formData),
        body:
          method === 'GET'
            ? undefined
            : formData
              ? formData
              : body !== undefined
                ? JSON.stringify(body)
                : undefined,
        cache: 'no-store',
        signal: controller.signal,
      });
    } catch (err: any) {
      const aborted = err?.name === 'AbortError';
      if (attempt < MAX_ATTEMPTS && !signal?.aborted) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      throw new ApiError(
        aborted ? 'Request timed out. Check your connection.' : 'No internet connection',
        aborted ? 408 : 0
      );
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }

    return handleResponse<T>(response);
  }
}

/** Port of `ApiService._handleResponse`. */
async function handleResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  const status = response.status;
  const text = await response.text();

  let parsed: any;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    if (status >= 200 && status < 300) return {} as ApiEnvelope<T>;
    // A non-JSON error body means the path is not served by the API at all
    // (a 404 HTML page, a gateway error). Say so plainly.
    throw new ApiError(
      status === 404
        ? 'That endpoint is not available on the backend (404).'
        : `Request failed (${status})`,
      status
    );
  }

  if (status >= 200 && status < 300) {
    return (parsed ?? {}) as ApiEnvelope<T>;
  }

  if (status === 401) {
    // Mirrors mobile: a 401 on a feature endpoint must not destroy the session.
    throw new ApiError('Session expired. Please login again.', 401);
  }

  throw new ApiError(parsed?.message || 'Request failed', status);
}

export const apiGet = <T = any>(path: string, options?: Omit<RequestOptions, 'body'>) =>
  apiRequest<T>('GET', path, options);

export const apiPost = <T = any>(path: string, body?: unknown, options?: RequestOptions) =>
  apiRequest<T>('POST', path, { ...options, body });

export const apiPut = <T = any>(path: string, body?: unknown, options?: RequestOptions) =>
  apiRequest<T>('PUT', path, { ...options, body });

export const apiPatch = <T = any>(path: string, body?: unknown, options?: RequestOptions) =>
  apiRequest<T>('PATCH', path, { ...options, body });

export const apiDelete = <T = any>(path: string, options?: RequestOptions) =>
  apiRequest<T>('DELETE', path, options);

/**
 * Unwraps the backend envelope the same way the Flutter models do:
 * `result` first, then `data`, then the raw body.
 */
export function unwrap<T = any>(envelope: ApiEnvelope<T> | null | undefined): any {
  if (!envelope) return null;
  if (envelope.result !== undefined && envelope.result !== null) return envelope.result;
  if (envelope.data !== undefined && envelope.data !== null) return envelope.data;
  return envelope;
}

/** Unwraps to an array, tolerating `{result: []}`, `{data: {items: []}}` and bare arrays. */
export function unwrapList(envelope: ApiEnvelope | null | undefined, ...keys: string[]): any[] {
  if (!envelope) return [];
  for (const key of keys) {
    const direct = (envelope as any)[key];
    if (Array.isArray(direct)) return direct;
    const nestedResult = (envelope as any).result?.[key];
    if (Array.isArray(nestedResult)) return nestedResult;
    const nestedData = (envelope as any).data?.[key];
    if (Array.isArray(nestedData)) return nestedData;
  }
  if (Array.isArray(envelope.result)) return envelope.result as any[];
  if (Array.isArray(envelope.data)) return envelope.data as any[];
  if (Array.isArray(envelope)) return envelope as any;
  return [];
}

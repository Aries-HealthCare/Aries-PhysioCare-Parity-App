import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DISPATCH_TOKEN_REGEX,
  PENDING_DISPATCH_STORAGE_KEY,
  clearPendingDispatchToken,
  extractDispatchToken,
  isValidDispatchToken,
  mapDispatchErrorCode,
  readPendingDispatchToken,
  savePendingDispatchToken,
} from './dispatch-invite.ts';

const VALID_TOKEN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk0123_-'; // 43 chars

test('isValidDispatchToken accepts exact 43-char base64url tokens and rejects invalid ones', () => {
  assert.equal(VALID_TOKEN.length, 43);
  assert.equal(DISPATCH_TOKEN_REGEX.test(VALID_TOKEN), true);
  assert.equal(isValidDispatchToken(VALID_TOKEN), true);

  // Shorter / longer
  assert.equal(isValidDispatchToken(VALID_TOKEN.slice(0, 42)), false);
  assert.equal(isValidDispatchToken(`${VALID_TOKEN}a`), false);

  // Invalid characters
  assert.equal(isValidDispatchToken(`${VALID_TOKEN.slice(0, 42)}!`), false);
  assert.equal(isValidDispatchToken(`${VALID_TOKEN.slice(0, 42)} `), false);
  assert.equal(isValidDispatchToken(`${VALID_TOKEN.slice(0, 42)}/`), false);

  // Empty / nullish
  assert.equal(isValidDispatchToken(''), false);
  assert.equal(isValidDispatchToken(null), false);
  assert.equal(isValidDispatchToken(undefined), false);
});

test('extractDispatchToken resolves ?token= and /invites/<token> while ignoring payment routes', () => {
  assert.equal(extractDispatchToken({ tokenParam: VALID_TOKEN }), VALID_TOKEN);
  assert.equal(
    extractDispatchToken({ pathname: `/invites/${VALID_TOKEN}` }),
    VALID_TOKEN
  );
  assert.equal(
    extractDispatchToken({
      tokenParam: 'invalid',
      pathname: `/invites/${VALID_TOKEN}`,
    }),
    VALID_TOKEN
  );

  // Ignored payment routes
  assert.equal(extractDispatchToken({ pathname: '/invites/payment-success' }), null);
  assert.equal(extractDispatchToken({ pathname: '/invites/payment-failed' }), null);
  assert.equal(extractDispatchToken({ pathname: '/invites/PAYMENT-SUCCESS' }), null);

  // Unrelated / invalid paths
  assert.equal(extractDispatchToken({ pathname: '/invites/too-short' }), null);
  assert.equal(extractDispatchToken({ pathname: '/app/leads' }), null);
  assert.equal(extractDispatchToken({}), null);
});

test('mapDispatchErrorCode maps all 6 DISPATCH_* codes and flags DISPATCH_SESSION_EXPIRED for login', () => {
  const codes = [
    'DISPATCH_EXPIRED',
    'DISPATCH_ALREADY_ASSIGNED',
    'DISPATCH_ALREADY_RESOLVED',
    'DISPATCH_UNAUTHORIZED',
    'DISPATCH_THERAPIST_DOUBLE_BOOKED',
    'DISPATCH_SESSION_EXPIRED',
  ] as const;

  for (const code of codes) {
    const mapped = mapDispatchErrorCode(code);
    assert.ok(mapped.title.length > 0, `${code} should have a title`);
    assert.ok(mapped.message.length > 0, `${code} should have a clinician-facing message`);
    if (code === 'DISPATCH_SESSION_EXPIRED') {
      assert.equal(mapped.requiresLogin, true);
    } else {
      assert.notEqual(mapped.requiresLogin, true);
    }
  }

  // Supports embedded code inside error message string
  const embedded = mapDispatchErrorCode('Error: DISPATCH_THERAPIST_DOUBLE_BOOKED at slot');
  assert.equal(embedded.title, mapDispatchErrorCode('DISPATCH_THERAPIST_DOUBLE_BOOKED').title);

  // Fallback for unknown code
  const fallback = mapDispatchErrorCode('UNKNOWN_ERROR', 'Custom fallback message');
  assert.equal(fallback.message, 'Custom fallback message');
  assert.notEqual(fallback.requiresLogin, true);
});

test('sessionStorage helpers are SSR-safe when window is undefined and persist when available', () => {
  assert.ok(PENDING_DISPATCH_STORAGE_KEY.length > 0);

  // Node SSR environment (no window)
  assert.doesNotThrow(() => savePendingDispatchToken(VALID_TOKEN));
  assert.equal(readPendingDispatchToken(), null);
  assert.doesNotThrow(() => clearPendingDispatchToken());

  // Mock browser sessionStorage
  const store = new Map<string, string>();
  (globalThis as any).window = {
    sessionStorage: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    },
  };
  try {
    savePendingDispatchToken('invalid-token');
    assert.equal(readPendingDispatchToken(), null);

    savePendingDispatchToken(VALID_TOKEN);
    assert.equal(readPendingDispatchToken(), VALID_TOKEN);

    clearPendingDispatchToken();
    assert.equal(readPendingDispatchToken(), null);
  } finally {
    delete (globalThis as any).window;
  }
});

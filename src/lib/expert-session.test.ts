import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isAuthPath, isProtectedPath, resolveSafeNextPath } from './expert-session.ts';

test('protects the expert workstation and onboarding status while allowing public registration on /onboarding', () => {
  assert.equal(isProtectedPath('/app'), true);
  assert.equal(isProtectedPath('/app/visits'), true);
  assert.equal(isProtectedPath('/onboarding-status'), true);
  assert.equal(isProtectedPath('/onboarding'), false);
  assert.equal(isProtectedPath('/privacy-policy'), false);
});

test('treats login and reset as auth paths', () => {
  assert.equal(isAuthPath('/login'), true);
  assert.equal(isAuthPath('/reset-password'), true);
  assert.equal(isAuthPath('/app'), false);
});

test('resolveSafeNextPath blocks open redirects and auth-path loops while allowing safe deep links', () => {
  const origin = 'https://app.ariesxpert.com';

  // Open-redirect attempts
  assert.equal(resolveSafeNextPath('/\\evil.com', origin), '/app');
  assert.equal(resolveSafeNextPath('//evil.com', origin), '/app');
  assert.equal(resolveSafeNextPath('/..//evil.com', origin), '/app');
  assert.equal(resolveSafeNextPath('/.//evil.com', origin), '/app');
  assert.equal(resolveSafeNextPath('/a/..//evil.com', origin), '/app');
  assert.equal(resolveSafeNextPath('/\t/evil.com', origin), '/app');
  assert.equal(resolveSafeNextPath('/app\r\nLocation: https://evil.com', origin), '/app');
  assert.equal(resolveSafeNextPath('https://evil.com/app', origin), '/app');

  // Auth-path redirect loops
  assert.equal(resolveSafeNextPath('/login', origin), '/app');
  assert.equal(resolveSafeNextPath('/login?next=/app', origin), '/app');
  assert.equal(resolveSafeNextPath('/verify', origin), '/app');
  assert.equal(resolveSafeNextPath('/reset-password', origin), '/app');

  // Empty / nullish
  assert.equal(resolveSafeNextPath(null, origin), '/app');
  assert.equal(resolveSafeNextPath('', origin), '/app');

  // Safe same-origin deep links
  assert.equal(
    resolveSafeNextPath('/dispatch/claim?token=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk0123_-', origin),
    '/dispatch/claim?token=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk0123_-'
  );
  assert.equal(resolveSafeNextPath('/app/visits?apt=123', origin), '/app/visits?apt=123');
});

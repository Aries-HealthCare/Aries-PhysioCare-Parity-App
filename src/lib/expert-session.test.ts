import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isAuthPath, isProtectedPath } from './expert-session.ts';

test('protects the expert workstation and onboarding', () => {
  assert.equal(isProtectedPath('/app'), true);
  assert.equal(isProtectedPath('/app/visits'), true);
  assert.equal(isProtectedPath('/onboarding-status'), true);
  assert.equal(isProtectedPath('/privacy-policy'), false);
});

test('treats login and reset as auth paths', () => {
  assert.equal(isAuthPath('/login'), true);
  assert.equal(isAuthPath('/reset-password'), true);
  assert.equal(isAuthPath('/app'), false);
});

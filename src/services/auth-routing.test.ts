import assert from 'node:assert/strict';
import { test } from 'node:test';
import { needsOnboarding, isOnboardingPendingReview } from '../lib/onboarding-gate.ts';

test('approved experts skip onboarding', () => {
  assert.equal(needsOnboarding({ _id: 't1', isProfileActive: true, onboardingStep: 2 } as any), false);
  assert.equal(needsOnboarding({ _id: 't1', onboardingStatus: 'approved', onboardingStep: 5 } as any), false);
});

test('incomplete experts resume onboarding', () => {
  assert.equal(needsOnboarding({ _id: 't1', onboardingStep: 2, onboardingStatus: 'incomplete' } as any), true);
});

test('submitted experts wait on the status page', () => {
  assert.equal(
    isOnboardingPendingReview({ _id: 't1', onboardingStep: 5, onboardingStatus: 'pending' } as any),
    true
  );
});

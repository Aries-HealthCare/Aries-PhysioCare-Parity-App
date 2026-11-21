import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  needsOnboarding,
  isOnboardingPendingReview,
  resolvePostAuthRoute,
  resolveOnboardingDisplayState,
} from '../lib/onboarding-gate.ts';
import {
  extractDocUrl,
  isFeeSettled,
  normalizeChecklist,
  getNextPendingStep,
} from '../lib/onboarding-checklist.ts';

test('approved experts skip onboarding and route to /app', () => {
  assert.equal(needsOnboarding({ _id: 't1', isProfileActive: true, onboardingStep: 2 } as any), false);
  assert.equal(needsOnboarding({ _id: 't1', onboardingStatus: 'approved', onboardingStep: 5 } as any), false);
  assert.equal(resolvePostAuthRoute({ _id: 't1', isProfileActive: true, onboardingStep: 2 }), '/app');
  assert.equal(resolvePostAuthRoute({ _id: 't1', onboardingStatus: 'approved', onboardingStep: 5 }), '/app');
  assert.equal(resolvePostAuthRoute({ _id: 't1', status: 'Active', onboardingStep: 5 }), '/app');
});

test('incomplete experts without checklist resume onboarding when step < 5', () => {
  const user = { _id: 't1', onboardingStep: 2, onboardingStatus: 'incomplete' };
  assert.equal(needsOnboarding(user as any), true);
  assert.equal(isOnboardingPendingReview(user as any), false);
  assert.equal(resolvePostAuthRoute(user), '/onboarding');
});

test('incomplete experts with step 5 and non-empty incompleteChecklist route to /onboarding-status (not /app)', () => {
  const user = {
    _id: 't1',
    onboardingStep: 5,
    onboardingStatus: 'incomplete',
    status: 'Incomplete',
    isProfileActive: false,
    incompleteChecklist: [
      { key: 'cancelledCheque', label: 'Cancelled Cheque / Bank Statement', step: 2, note: 'Blurry upload', status: 'pending' },
    ],
  };
  assert.equal(resolvePostAuthRoute(user), '/onboarding-status');
  assert.equal(isOnboardingPendingReview(user), true);
  assert.equal(needsOnboarding(user), true);
});

test('incomplete experts with early step and non-empty incompleteChecklist still route to /onboarding-status first', () => {
  const user = {
    _id: 't1',
    onboardingStep: 1,
    onboardingStatus: 'incomplete',
    incompleteChecklist: [{ key: 'profilePhoto', status: 'pending' }],
  };
  assert.equal(resolvePostAuthRoute(user), '/onboarding-status');
});

test('stale or conflicting isProfileActive / status flags never bypass /onboarding-status into /app', () => {
  const activeIncompleteWithChecklist = {
    _id: 't1',
    isProfileActive: true,
    onboardingStatus: 'incomplete',
    incompleteChecklist: [{ key: 'profilePhoto', status: 'pending' }],
  };
  const activeUnderReview = {
    _id: 't1',
    isProfileActive: true,
    onboardingStatus: 'under_review',
    onboardingStep: 5,
  };
  const approvedButStatusIncomplete = {
    _id: 't1',
    onboardingStatus: 'approved',
    status: 'Incomplete',
  };
  const approvedWithChecklist = {
    _id: 't1',
    isProfileActive: true,
    onboardingStatus: 'approved',
    status: 'Approved',
    incompleteChecklist: [{ key: 'cancelledCheque', status: 'pending' }],
  };

  assert.equal(resolvePostAuthRoute(activeIncompleteWithChecklist), '/onboarding-status');
  assert.equal(needsOnboarding(activeIncompleteWithChecklist), true);
  assert.equal(isOnboardingPendingReview(activeIncompleteWithChecklist), true);

  assert.equal(resolvePostAuthRoute(activeUnderReview), '/onboarding-status');
  assert.equal(needsOnboarding(activeUnderReview), true);

  assert.equal(resolvePostAuthRoute(approvedButStatusIncomplete), '/onboarding-status');
  assert.equal(needsOnboarding(approvedButStatusIncomplete), true);

  assert.equal(resolvePostAuthRoute(approvedWithChecklist), '/onboarding-status');
  assert.equal(needsOnboarding(approvedWithChecklist), true);
});

test('incomplete experts with step >= 5 and no checklist route to /onboarding-status', () => {
  assert.equal(
    resolvePostAuthRoute({ _id: 't1', onboardingStep: 5, onboardingStatus: 'incomplete', incompleteChecklist: [] }),
    '/onboarding-status'
  );
});

test('rejected and suspended experts route to /onboarding-status even with onboardingStep 5 or stale isProfileActive', () => {
  const rejected = { _id: 't1', onboardingStep: 5, onboardingStatus: 'rejected', status: 'Rejected' };
  const suspended = { _id: 't1', onboardingStep: 5, onboardingStatus: 'suspended', status: 'Suspended' };
  const suspendedApproved = { _id: 't1', isProfileActive: true, onboardingStep: 5, onboardingStatus: 'approved', status: 'Suspended' };

  assert.equal(resolvePostAuthRoute(rejected), '/onboarding-status');
  assert.equal(resolvePostAuthRoute(suspended), '/onboarding-status');
  assert.equal(resolvePostAuthRoute(suspendedApproved), '/onboarding-status');
  assert.equal(needsOnboarding(rejected), true);
  assert.equal(needsOnboarding(suspended), true);
  assert.equal(needsOnboarding(suspendedApproved), true);
  assert.equal(isOnboardingPendingReview(rejected), true);
  assert.equal(isOnboardingPendingReview(suspended), true);
});

test('submitted and explicit pending experts wait on /onboarding-status while pre-normalized step < 5 resumes /onboarding', () => {
  const pendingStep5 = { _id: 't1', onboardingStep: 5, onboardingStatus: 'pending' };
  const pendingStep2 = { _id: 't1', onboardingStep: 2, onboardingStatus: 'pending' };
  const underReview = { _id: 't1', onboardingStep: 5, onboardingStatus: 'UNDER_REVIEW' };
  const rawPendingStep2 = { _id: 't1', onboardingStep: 2, status: 'Pending' };

  assert.equal(isOnboardingPendingReview(pendingStep5 as any), true);
  assert.equal(resolvePostAuthRoute(pendingStep5), '/onboarding-status');
  assert.equal(resolvePostAuthRoute(pendingStep2), '/onboarding-status');
  assert.equal(resolvePostAuthRoute(underReview), '/onboarding-status');
  assert.equal(resolvePostAuthRoute(rawPendingStep2), '/onboarding');

  assert.equal(resolveOnboardingDisplayState(pendingStep2), 'pending');
  assert.equal(resolveOnboardingDisplayState(rawPendingStep2), 'incomplete');
});

test('resolveOnboardingDisplayState resolves all 5 states and conflicting combinations consistently', () => {
  assert.equal(resolveOnboardingDisplayState(null), 'pending');
  assert.equal(resolveOnboardingDisplayState(undefined), 'pending');
  assert.equal(
    resolveOnboardingDisplayState({ _id: 't1', onboardingStatus: 'pending', onboardingStep: 5 }),
    'pending'
  );
  assert.equal(
    resolveOnboardingDisplayState({ _id: 't1', isProfileActive: true, onboardingStatus: 'under_review', onboardingStep: 5 }),
    'pending'
  );
  assert.equal(
    resolveOnboardingDisplayState({ _id: 't1', onboardingStatus: 'draft', incompleteChecklist: [] }),
    'incomplete'
  );
  assert.equal(
    resolveOnboardingDisplayState({
      _id: 't1',
      isProfileActive: true,
      onboardingStatus: 'incomplete',
      incompleteChecklist: [{ key: 'profilePhoto', status: 'pending' }],
    }),
    'incomplete'
  );
  assert.equal(
    resolveOnboardingDisplayState({ _id: 't1', onboardingStatus: 'approved', status: 'Incomplete' }),
    'incomplete'
  );
  assert.equal(
    resolveOnboardingDisplayState({ _id: 't1', onboardingStatus: 'rejected', status: 'Rejected' }),
    'rejected'
  );
  assert.equal(
    resolveOnboardingDisplayState({ _id: 't1', onboardingStatus: 'suspended', status: 'Suspended' }),
    'suspended'
  );
  assert.equal(
    resolveOnboardingDisplayState({ _id: 't1', isProfileActive: true, onboardingStatus: 'approved', status: 'Suspended' }),
    'suspended'
  );
  assert.equal(
    resolveOnboardingDisplayState({ _id: 't1', isProfileActive: true, onboardingStep: 2 }),
    'approved'
  );
  assert.equal(
    resolveOnboardingDisplayState({ _id: 't1', onboardingStatus: 'approved', onboardingStep: 5 }),
    'approved'
  );
});

test('unauthenticated users route to /login', () => {
  assert.equal(resolvePostAuthRoute(null), '/login');
  assert.equal(resolvePostAuthRoute(undefined), '/login');
  assert.equal(resolvePostAuthRoute({}), '/login');
});

test('extractDocUrl unwraps document objects and strings safely', () => {
  assert.equal(extractDocUrl({ name: 'reg.pdf', url: 'https://s3/reg.pdf' }), 'https://s3/reg.pdf');
  assert.equal(extractDocUrl('https://s3/reg.pdf'), 'https://s3/reg.pdf');
  assert.equal(extractDocUrl('  https://s3/reg.pdf  '), 'https://s3/reg.pdf');
  assert.equal(extractDocUrl({ name: 'empty.pdf' }), '');
  assert.equal(extractDocUrl(null), '');
  assert.equal(extractDocUrl(undefined), '');
  assert.equal(extractDocUrl(''), '');
});

test('isFeeSettled matches canonical rule (isOnboardingPaid, pre-2026 createdAt, explicit waiver)', () => {
  assert.equal(isFeeSettled({ isOnboardingPaid: true, createdAt: '2026-05-01T00:00:00Z' }), true);
  assert.equal(isFeeSettled({ isOnboardingPaid: false, createdAt: '2025-12-31T23:59:59Z' }), true);
  assert.equal(isFeeSettled({ isFeeWaived: true, createdAt: '2026-05-01T00:00:00Z' }), true);
  assert.equal(isFeeSettled({ paymentStatus: 'WAIVED', createdAt: '2026-05-01T00:00:00Z' }), true);
  assert.equal(isFeeSettled({ paymentStatus: 'ALREADY_PAID', createdAt: '2026-05-01T00:00:00Z' }), true);
  assert.equal(isFeeSettled({ paymentStatus: 'EXEMPT', createdAt: '2026-05-01T00:00:00Z' }), true);
  assert.equal(isFeeSettled({ isOnboardingPaid: false, paymentStatus: 'PENDING', createdAt: '2026-01-01T00:00:00Z' }), false);
  assert.equal(isFeeSettled(null), false);
  assert.equal(isFeeSettled(undefined), false);
});

test('normalizeChecklist and getNextPendingStep track pending and resubmitted steps', () => {
  const normalized = normalizeChecklist([
    { key: 'cancelledCheque', note: 'Upload clear photo', status: 'resubmitted' },
    { key: 'profilePhoto', note: 'Face obscured' },
    { key: 'profilePhoto', note: 'Duplicate should be ignored' },
  ]);

  assert.equal(normalized.length, 2);
  assert.deepEqual(normalized[0], {
    key: 'cancelledCheque',
    label: 'Cancelled Cheque / Bank Statement',
    step: 2,
    note: 'Upload clear photo',
    status: 'resubmitted',
  });
  assert.deepEqual(normalized[1], {
    key: 'profilePhoto',
    label: 'Profile Photo',
    step: 0,
    note: 'Face obscured',
    status: 'pending',
  });

  assert.equal(getNextPendingStep(normalized), 0);
  assert.equal(
    getNextPendingStep([
      { key: 'profilePhoto', label: 'Profile Photo', step: 0, note: '', status: 'resubmitted' },
      { key: 'cancelledCheque', label: 'Cancelled Cheque', step: 2, note: '', status: 'resubmitted' },
    ]),
    4
  );
  assert.equal(getNextPendingStep([]), 0);
});

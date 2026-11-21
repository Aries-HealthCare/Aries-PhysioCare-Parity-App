import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  extractDocUrl,
  extractDocName,
  getNextPendingStep,
  isAdminIncompleteResubmissionMode,
  markParityStepResubmitted,
  normalizeChecklist,
  parseOnboardingQueryParams,
  parseSubmitForReviewError,
  shouldHydrateFromServerDraft,
  shouldSkipLocalDraftStepOverride,
  type ParityChecklistItem,
} from './onboarding-checklist.ts';

test('shouldHydrateFromServerDraft handles async user arrival and avoids duplicate re-hydration', () => {
  assert.equal(shouldHydrateFromServerDraft(null, null), false);
  assert.equal(shouldHydrateFromServerDraft(undefined, null), false);
  assert.equal(shouldHydrateFromServerDraft({}, null), false);

  // User finishes loading asynchronously after null mount
  assert.equal(shouldHydrateFromServerDraft({ _id: 'therapist_1' }, null), true);

  // Subsequent re-renders with the same _id must not re-hydrate over in-progress edits
  assert.equal(shouldHydrateFromServerDraft({ _id: 'therapist_1' }, 'therapist_1'), false);

  // Switching to a different user re-hydrates
  assert.equal(shouldHydrateFromServerDraft({ _id: 'therapist_2' }, 'therapist_1'), true);
});

test('shouldSkipLocalDraftStepOverride returns true for incomplete accounts and false otherwise', () => {
  assert.equal(shouldSkipLocalDraftStepOverride({ onboardingStatus: 'incomplete' }), true);
  assert.equal(shouldSkipLocalDraftStepOverride({ onboardingStatus: 'INCOMPLETE' }), true);
  assert.equal(shouldSkipLocalDraftStepOverride({ status: 'Incomplete' }), true);
  assert.equal(
    shouldSkipLocalDraftStepOverride({
      onboardingStatus: 'pending',
      incompleteChecklist: [{ key: 'cancelledCheque', status: 'pending' }],
    }),
    true
  );

  assert.equal(shouldSkipLocalDraftStepOverride({ onboardingStatus: 'draft' }), false);
  assert.equal(shouldSkipLocalDraftStepOverride({ onboardingStatus: 'in_progress' }), false);
  assert.equal(shouldSkipLocalDraftStepOverride(null), false);
  assert.equal(shouldSkipLocalDraftStepOverride(undefined), false);
});

test('markParityStepResubmitted updates only target step items and getNextPendingStep advances cleanly', () => {
  const initial: ParityChecklistItem[] = normalizeChecklist([
    { key: 'profilePhoto', note: 'Upload clear headshot' },
    { key: 'bankDetails', note: 'Verify account number' },
    { key: 'cancelledCheque', note: 'Upload readable cheque' },
    { key: 'serviceAreas', note: 'Add at least 1 pincode' },
  ]);

  assert.equal(getNextPendingStep(initial), 0);

  const afterStep2 = markParityStepResubmitted(initial, 2);
  assert.equal(afterStep2[0].status, 'pending');
  assert.equal(afterStep2[1].status, 'resubmitted');
  assert.equal(afterStep2[2].status, 'resubmitted');
  assert.equal(afterStep2[3].status, 'pending');
  // Original items remain untouched (pure helper)
  assert.equal(initial[1].status, 'pending');
  assert.equal(initial[2].status, 'pending');
  assert.equal(getNextPendingStep(afterStep2), 0);

  const afterStep0 = markParityStepResubmitted(afterStep2, 0);
  assert.equal(getNextPendingStep(afterStep0), 3);

  const afterStep3 = markParityStepResubmitted(afterStep0, 3);
  assert.equal(getNextPendingStep(afterStep3), 4);
});

test('extractDocUrl and extractDocName unwrap { name, url } objects, plain URLs, and empty values safely', () => {
  assert.equal(
    extractDocUrl({ name: 'Cheque.jpg', url: 'https://cdn/c.jpg' }),
    'https://cdn/c.jpg'
  );
  assert.equal(extractDocUrl('https://cdn/c.jpg'), 'https://cdn/c.jpg');
  assert.equal(extractDocUrl('  https://cdn/doc.pdf  '), 'https://cdn/doc.pdf');
  assert.equal(extractDocUrl({}), '');
  assert.equal(extractDocUrl({ name: 'Empty.pdf' }), '');
  assert.equal(extractDocUrl(null), '');
  assert.equal(extractDocUrl(undefined), '');

  assert.equal(
    extractDocName({ name: 'Cheque.jpg', url: 'https://cdn/c.jpg' }, 'Fallback.pdf'),
    'Cheque.jpg'
  );
  assert.equal(
    extractDocName('https://cdn/uploads/degree_cert.pdf?v=1', 'Fallback.pdf'),
    'degree_cert.pdf'
  );
  assert.equal(extractDocName({}, 'Fallback.pdf'), 'Fallback.pdf');
});

test('parseSubmitForReviewError extracts target step for 400 INCOMPLETE_ITEMS_PENDING and REGISTRATION_FEE_REQUIRED', () => {
  const checklist = normalizeChecklist([
    { key: 'cancelledCheque', status: 'pending' },
    { key: 'registrationFee', status: 'pending' },
  ]);

  const itemsPendingWithPayload = parseSubmitForReviewError(
    {
      statusCode: 400,
      code: 'INCOMPLETE_ITEMS_PENDING',
      message: 'Please update all flagged sections before resubmitting.',
      pendingItems: [{ key: 'cancelledCheque', label: 'Cancelled Cheque', step: 2 }],
    },
    checklist
  );
  assert.equal(itemsPendingWithPayload.code, 'INCOMPLETE_ITEMS_PENDING');
  assert.equal(itemsPendingWithPayload.targetStep, 2);

  // ApiError from api-transport.ts carries only message + statusCode (no code/pendingItems fields)
  const itemsPendingMessageOnly = parseSubmitForReviewError(
    {
      statusCode: 400,
      message: 'Please update all flagged sections before resubmitting.',
    },
    checklist
  );
  assert.equal(itemsPendingMessageOnly.code, 'INCOMPLETE_ITEMS_PENDING');
  assert.equal(itemsPendingMessageOnly.targetStep, 2);

  const feeRequiredMessageOnly = parseSubmitForReviewError(
    {
      statusCode: 400,
      message: 'Please complete the registration fee payment before resubmitting.',
    },
    checklist
  );
  assert.equal(feeRequiredMessageOnly.code, 'REGISTRATION_FEE_REQUIRED');
  assert.equal(feeRequiredMessageOnly.targetStep, 4);

  const genericError = parseSubmitForReviewError(new Error('Network timeout'), checklist);
  assert.equal(genericError.code, null);
  assert.equal(genericError.targetStep, null);
  assert.equal(genericError.message, 'Network timeout');
});

test('parseOnboardingQueryParams safely parses step and focus query params', () => {
  assert.deepEqual(parseOnboardingQueryParams('?step=2&focus=cancelledCheque'), {
    step: 2,
    focusKey: 'cancelledCheque',
  });
  assert.deepEqual(parseOnboardingQueryParams('?step=0'), {
    step: 0,
    focusKey: null,
  });
  assert.deepEqual(parseOnboardingQueryParams('?step=99&focus=%20profilePhoto%20'), {
    step: 4,
    focusKey: 'profilePhoto',
  });
  assert.deepEqual(parseOnboardingQueryParams('?step=invalid'), {
    step: null,
    focusKey: null,
  });
  assert.deepEqual(parseOnboardingQueryParams(''), {
    step: null,
    focusKey: null,
  });
});

test('isAdminIncompleteResubmissionMode separates brand-new fallback incomplete drafts from genuine admin-flagged profiles', () => {
  // Brand-new Step 0/1 registrants hitting provider-api fallback `onboardingStatus: "incomplete"`
  assert.equal(
    isAdminIncompleteResubmissionMode(
      {
        onboardingStatus: 'incomplete',
        status: 'Draft',
        onboardingStep: 1,
        incompleteChecklist: [],
      },
      [],
      ''
    ),
    false
  );
  assert.equal(
    isAdminIncompleteResubmissionMode(
      {
        onboardingStatus: 'incomplete',
        status: undefined,
        onboardingStep: 1,
        incompleteChecklist: [],
      },
      [],
      ''
    ),
    false
  );
  assert.equal(
    isAdminIncompleteResubmissionMode(
      {
        onboardingStatus: 'incomplete',
        status: 'Pending',
        onboardingStep: 1,
        incompleteChecklist: [],
      },
      [],
      ''
    ),
    false
  );

  // Pending / approved accounts at step 5 without checklist or note are not in resubmission mode
  assert.equal(
    isAdminIncompleteResubmissionMode(
      { onboardingStatus: 'pending', status: 'Pending', onboardingStep: 5, incompleteChecklist: [] },
      [],
      ''
    ),
    false
  );
  assert.equal(
    isAdminIncompleteResubmissionMode(
      { onboardingStatus: 'approved', status: 'Active', onboardingStep: 5, incompleteChecklist: [] },
      [],
      ''
    ),
    false
  );
  assert.equal(isAdminIncompleteResubmissionMode(null, [], ''), false);

  // Genuine admin-flagged incomplete profiles
  assert.equal(
    isAdminIncompleteResubmissionMode(
      { onboardingStatus: 'incomplete', status: 'Pending', onboardingStep: 1 },
      normalizeChecklist([{ key: 'cancelledCheque', status: 'pending' }]),
      ''
    ),
    true
  );
  assert.equal(
    isAdminIncompleteResubmissionMode(
      { onboardingStatus: 'incomplete', status: 'Pending', onboardingStep: 1, incompleteChecklist: [] },
      [],
      'Please re-upload clearer Aadhaar photo'
    ),
    true
  );
  assert.equal(
    isAdminIncompleteResubmissionMode(
      { onboardingStatus: 'incomplete', status: 'Incomplete', onboardingStep: 1, incompleteChecklist: [] },
      [],
      ''
    ),
    true
  );
  assert.equal(
    isAdminIncompleteResubmissionMode(
      { onboardingStatus: 'incomplete', status: 'Pending', onboardingStep: 5, incompleteChecklist: [] },
      [],
      ''
    ),
    true
  );
});

test('malformed focus query params parse safely and onboarding page never interpolates checklist keys into querySelector', () => {
  assert.deepEqual(parseOnboardingQueryParams('?step=2&focus=%22cancelledCheque%5D'), {
    step: 2,
    focusKey: '"cancelledCheque]',
  });

  const onboardingPageSource = readFileSync(
    new URL('../app/onboarding/page.tsx', import.meta.url),
    'utf8'
  );
  assert.equal(
    onboardingPageSource.includes('querySelector(`[data-checklist-key='),
    false,
    'onboarding/page.tsx must not interpolate checklist keys into document.querySelector'
  );
  assert.match(onboardingPageSource, /querySelectorAll<HTMLElement>\('\[data-checklist-key\]'\)/);
  assert.match(onboardingPageSource, /el\.dataset\.checklistKey === key/);
});

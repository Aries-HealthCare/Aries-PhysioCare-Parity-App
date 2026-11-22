import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canEditProfileAndDocuments,
  isProfileEditRequested,
} from './profile-edit-lock.ts';

test('active/approved therapist is locked in Preview Mode by default', () => {
  const activeUser = {
    isProfileActive: true,
    status: 'Approved',
    onboardingStatus: 'approved',
    profileEditAllowed: false,
  };
  assert.equal(canEditProfileAndDocuments(activeUser), false);
});

test('active therapist unlocks when Admin grants profileEditAllowed', () => {
  const unlockedUser = {
    isProfileActive: true,
    status: 'Approved',
    onboardingStatus: 'approved',
    profileEditAllowed: true,
  };
  assert.equal(canEditProfileAndDocuments(unlockedUser), true);
  assert.equal(isProfileEditRequested({ ...unlockedUser, profileEditRequested: true }), false);
});

test('therapist with pending incompleteChecklist from Admin can edit to resubmit', () => {
  const flaggedUser = {
    isProfileActive: false,
    status: 'Incomplete',
    onboardingStatus: 'incomplete',
    profileEditAllowed: false,
    incompleteChecklist: [{ status: 'pending' }],
  };
  assert.equal(canEditProfileAndDocuments(flaggedUser), true);
});

test('isProfileEditRequested reflects pending edit permission request', () => {
  assert.equal(
    isProfileEditRequested({ profileEditAllowed: false, profileEditRequested: true }),
    true
  );
  assert.equal(
    isProfileEditRequested({ profileEditAllowed: false, profileEditRequested: false }),
    false
  );
});

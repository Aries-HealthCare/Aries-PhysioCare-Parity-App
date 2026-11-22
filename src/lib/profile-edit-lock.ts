/**
 * Profile & Document Preview Mode Policy.
 *
 * All verified/active (and pending-review) therapists see their profile details
 * and KYC/professional/banking documents in read-only **Preview Mode** until
 * Admin explicitly grants permission (`profileEditAllowed === true`) or flags
 * specific items in `incompleteChecklist` for resubmission.
 */

export interface ProfileLockSubject {
  profileEditAllowed?: boolean;
  profileEditRequested?: boolean;
  profileEditRequestReason?: string;
  isProfileActive?: boolean;
  status?: string;
  onboardingStatus?: string;
  incompleteChecklist?: Array<{ status?: string }>;
}

export function hasPendingIncompleteChecklist(user: ProfileLockSubject | null | undefined): boolean {
  if (!user || !Array.isArray(user.incompleteChecklist)) return false;
  return user.incompleteChecklist.some(
    (item) => String(item?.status || 'pending').toLowerCase() !== 'resubmitted'
  );
}

/**
 * Returns `true` ONLY when the therapist is permitted to edit profile fields
 * or upload/replace KYC/clinical/bank documents.
 *
 * Returns `false` (Preview Mode) by default for all approved/active/reviewing
 * profiles until Admin explicitly enables `profileEditAllowed`.
 */
export function canEditProfileAndDocuments(user: ProfileLockSubject | null | undefined): boolean {
  if (!user) return false;
  if (user.profileEditAllowed === true) return true;
  if (hasPendingIncompleteChecklist(user)) return true;

  const status = String(user.status || '').trim().toLowerCase();
  const onboarding = String(user.onboardingStatus || '').trim().toLowerCase();
  const isInitialDraft =
    !user.isProfileActive &&
    status !== 'approved' &&
    status !== 'active' &&
    onboarding !== 'approved' &&
    onboarding !== 'active' &&
    onboarding !== 'completed' &&
    (onboarding === 'draft' || onboarding === 'in_progress' || onboarding === 'incomplete');

  return isInitialDraft;
}

export function isProfileEditRequested(user: ProfileLockSubject | null | undefined): boolean {
  return Boolean(user?.profileEditRequested && !user?.profileEditAllowed);
}

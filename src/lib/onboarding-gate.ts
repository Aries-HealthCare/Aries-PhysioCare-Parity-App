export type PostAuthRoute = '/login' | '/app' | '/onboarding' | '/onboarding-status';

export type OnboardingDisplayState =
  | 'pending'
  | 'incomplete'
  | 'rejected'
  | 'suspended'
  | 'approved';

export interface OnboardingGateUser {
  _id?: string;
  isProfileActive?: boolean;
  onboardingStatus?: string;
  status?: string;
  onboardingStep?: number;
  incompleteChecklist?: Array<{ key?: string; status?: string } | null> | null;
}

function normalizeGateStatus(value?: string): string {
  return (value || '').toString().trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function hasChecklistItems(user: OnboardingGateUser): boolean {
  return Array.isArray(user.incompleteChecklist) && user.incompleteChecklist.filter(Boolean).length > 0;
}

const NON_APPROVED_STATUSES = new Set([
  'pending',
  'under_review',
  'incomplete',
  'draft',
  'in_progress',
  'rejected',
  'suspended',
]);

function isApprovedUser(
  user: OnboardingGateUser,
  obStatus: string,
  accStatus: string
): boolean {
  if (hasChecklistItems(user)) return false;
  if (NON_APPROVED_STATUSES.has(obStatus) || NON_APPROVED_STATUSES.has(accStatus)) {
    return false;
  }
  if (user.isProfileActive === true) return true;
  if (
    obStatus === 'approved' ||
    obStatus === 'active' ||
    obStatus === 'completed' ||
    accStatus === 'approved' ||
    accStatus === 'active'
  ) {
    return true;
  }
  return false;
}

/**
 * Resolves the canonical post-authentication destination for an expert profile.
 * Non-approved users (incomplete, pending, rejected, suspended) are never routed to `/app`.
 */
export function resolvePostAuthRoute(
  user: OnboardingGateUser | null | undefined
): PostAuthRoute {
  if (!user?._id) return '/login';

  const obStatus = normalizeGateStatus(user.onboardingStatus);
  const accStatus = normalizeGateStatus(user.status);

  if (
    obStatus === 'rejected' ||
    obStatus === 'suspended' ||
    accStatus === 'rejected' ||
    accStatus === 'suspended'
  ) {
    return '/onboarding-status';
  }

  if (hasChecklistItems(user)) {
    return '/onboarding-status';
  }

  if (isApprovedUser(user, obStatus, accStatus)) {
    return '/app';
  }

  if (obStatus === 'pending' || obStatus === 'under_review' || accStatus === 'under_review') {
    return '/onboarding-status';
  }

  if (
    obStatus === 'incomplete' ||
    obStatus === 'draft' ||
    obStatus === 'in_progress' ||
    accStatus === 'incomplete' ||
    accStatus === 'draft' ||
    accStatus === 'in_progress'
  ) {
    if (obStatus === 'approved' || obStatus === 'active' || obStatus === 'completed') {
      return '/onboarding-status';
    }
    return (user.onboardingStep ?? 0) >= 5 ? '/onboarding-status' : '/onboarding';
  }

  return (user.onboardingStep ?? 0) >= 5 ? '/onboarding-status' : '/onboarding';
}

/**
 * Maps an authenticated expert record onto one of the 5 onboarding status screen states.
 */
export function resolveOnboardingDisplayState(
  user: OnboardingGateUser | null | undefined
): OnboardingDisplayState {
  if (!user) return 'pending';

  const obStatus = normalizeGateStatus(user.onboardingStatus);
  const accStatus = normalizeGateStatus(user.status);

  if (obStatus === 'rejected' || accStatus === 'rejected') return 'rejected';
  if (obStatus === 'suspended' || accStatus === 'suspended') return 'suspended';
  if (hasChecklistItems(user)) return 'incomplete';
  if (isApprovedUser(user, obStatus, accStatus)) return 'approved';

  if (
    obStatus === 'incomplete' ||
    obStatus === 'draft' ||
    obStatus === 'in_progress' ||
    accStatus === 'incomplete' ||
    accStatus === 'draft' ||
    accStatus === 'in_progress'
  ) {
    return 'incomplete';
  }

  if (!obStatus && accStatus === 'pending' && (user.onboardingStep ?? 0) < 5) {
    return 'incomplete';
  }

  return 'pending';
}

/**
 * Backward-compatible helper: returns true for any unauthenticated or non-approved user
 * so gated callers never allow non-approved accounts into `/app`.
 */
export function needsOnboarding(user: OnboardingGateUser | null | undefined): boolean {
  if (!user?._id) return true;
  return resolvePostAuthRoute(user) !== '/app';
}

/**
 * Backward-compatible helper: returns true whenever the expert should be on `/onboarding-status`
 * (submitted for review, flagged with checklist items, rejected, or suspended).
 */
export function isOnboardingPendingReview(
  user: OnboardingGateUser | null | undefined
): boolean {
  return resolvePostAuthRoute(user) === '/onboarding-status';
}

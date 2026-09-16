export function needsOnboarding(user: {
  _id?: string;
  isProfileActive?: boolean;
  onboardingStatus?: string;
  status?: string;
  onboardingStep?: number;
} | null | undefined): boolean {
  if (!user?._id) return true;
  if (user.isProfileActive) return false;
  const status = (user.onboardingStatus || user.status || '').toString().toLowerCase();
  if (['approved', 'active'].includes(status)) return false;
  return (user.onboardingStep ?? 0) < 5;
}

export function isOnboardingPendingReview(user: {
  _id?: string;
  onboardingStatus?: string;
  status?: string;
  onboardingStep?: number;
} | null | undefined): boolean {
  if (!user?._id) return false;
  const status = (user.onboardingStatus || user.status || '').toString().toLowerCase();
  return ['pending', 'under_review', 'under-review'].includes(status) && (user.onboardingStep ?? 0) >= 5;
}

'use client';

import { useProviderAuth } from '@/services/provider-auth-context';
import { StatusBadge, PageHeader } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function OnboardingStatusPage() {
  const { user, refreshProfile, logout } = useProviderAuth();
  const router = useRouter();
  const status = user?.onboardingStatus || user?.status || 'pending';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-3xl border border-border bg-card p-8 space-y-5">
        <PageHeader
          title="Onboarding review"
          description="This is the same Therapist.status the admin dashboard writes. Continue on mobile or web from this state."
        />
        <StatusBadge value={String(status)} />
        <p className="text-sm text-muted-foreground">
          Step {user?.onboardingStep ?? '—'} of 5 stored on your expert record.
          {String(status).toLowerCase().includes('reject')
            ? ' HQ requested changes. Open onboarding to update documents.'
            : ' You will be activated when verification completes.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button className="rounded-2xl" onClick={() => refreshProfile()}>Refresh status</Button>
          <Button variant="outline" className="rounded-2xl" onClick={() => router.push('/onboarding')}>
            Continue onboarding
          </Button>
          <Button variant="ghost" className="rounded-2xl" onClick={logout}>Logout</Button>
        </div>
      </div>
    </div>
  );
}

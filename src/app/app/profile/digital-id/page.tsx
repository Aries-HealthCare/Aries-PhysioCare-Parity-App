'use client';

import { PageHeader } from '@/components/ds';
import { useProviderAuth } from '@/services/provider-auth-context';
import { resolveProfileImage } from '@/services/provider-api';

export default function DigitalIdPage() {
  const { user } = useProviderAuth();
  const name = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Provider';
  const photo = resolveProfileImage(user?.profilePhoto);
  const axId = user?.axId || user?.ariesId || '—';

  return (
    <div className="max-w-md mx-auto space-y-6">
      <PageHeader title="Digital ID" description="Same Therapist record the mobile digital ID card reads." />
      <div className="rounded-[2rem] border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-card p-6 shadow-xl space-y-4">
        <p className="text-[10px] font-outfit font-bold uppercase tracking-[0.2em] text-primary">AriesXpert credential</p>
        <div className="flex items-center gap-4">
          {photo ? (
            <img src={photo} alt="" className="w-20 h-20 rounded-2xl object-cover border border-primary/30" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-black">
              {name[0]}
            </div>
          )}
          <div>
            <h2 className="font-outfit text-xl font-black">{name}</h2>
            <p className="font-mono text-sm text-primary">{axId}</p>
            <p className="text-xs text-muted-foreground">{user?.professionalInfo?.professionalRole || user?.designation || 'Specialist'}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-muted-foreground">License</dt>
            <dd className="font-bold">{user?.licenseNumber || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">City</dt>
            <dd className="font-bold">{user?.city || user?.areaOfServiceInfo?.city || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-bold">{user?.status || user?.onboardingStatus || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Duty</dt>
            <dd className="font-bold">{user?.isTherapistActive ? 'On duty' : 'Off duty'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

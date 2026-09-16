'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { providerApi } from '@/services/provider-api';
import { useProviderAuth } from '@/services/provider-auth-context';

const STEPS = [
  { title: 'Your board', body: 'KPIs, duty status and today’s itinerary sync from the same Mongo records as the phone.', href: '/app' },
  { title: 'Leads', body: 'Accept or pass broadcasts in real time. new_broadcast arrives over Socket.io.', href: '/app/leads' },
  { title: 'Visits', body: 'Arrival validation, treatment timer, assessment and payment finalize on the appointment document.', href: '/app/visits' },
  { title: 'Wallet', body: 'Balances and payouts come only from the backend ledger.', href: '/app/wallet' },
  { title: 'SOS', body: 'Dispatch uses browser geolocation while this tab is open.', href: '/app/sos' },
  { title: 'Settings', body: 'Notification channels, quiet hours and language stay on your therapist record / this device.', href: '/app/settings' },
];

export function ProductTour() {
  const { user } = useProviderAuth();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    if (user.onboardingTourCompleted) return;
    const seen = localStorage.getItem('ax_product_tour');
    if (seen === user._id) return;
    setOpen(true);
  }, [user]);

  if (!open) return null;
  const current = STEPS[step];

  const finish = async () => {
    setOpen(false);
    if (user?._id) localStorage.setItem('ax_product_tour', user._id);
    await providerApi.updateOnboardingTour({ completed: true, step: STEPS.length }).catch(() => undefined);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 space-y-4">
        <p className="text-[10px] font-outfit font-bold uppercase tracking-widest text-primary">
          Product tour {step + 1}/{STEPS.length}
        </p>
        <h2 className="text-xl font-outfit font-black">{current.title}</h2>
        <p className="text-sm text-muted-foreground">{current.body}</p>
        <Link href={current.href} className="text-xs font-bold text-primary" onClick={() => setOpen(false)}>
          Open this module →
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-2xl" onClick={finish}>
            Skip
          </Button>
          <Button
            className="flex-1 rounded-2xl"
            onClick={() => (step + 1 >= STEPS.length ? finish() : setStep(step + 1))}
          >
            {step + 1 >= STEPS.length ? 'Done' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}

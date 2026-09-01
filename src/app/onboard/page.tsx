'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const OnboardingFlow = dynamic(
  () => import('@/components/onboarding/onboarding-flow').then((m) => m.OnboardingFlow),
  { ssr: false }
);

export default function OnboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // If already onboarded, skip straight to login
    try {
      if (localStorage.getItem('onboarding_complete') === 'true') {
        router.replace('/');
        return;
      }
    } catch (_) {}
    setReady(true);
  }, [router]);

  if (!ready) {
    // Brief blank screen while checking localStorage
    return <div className="min-h-screen bg-[#030a12]" />;
  }

  return <OnboardingFlow />;
}

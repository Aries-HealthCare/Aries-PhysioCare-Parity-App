'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginPortal } from '@/components/auth/login-portal';

export default function RootParityPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem('onboarding_complete');
      if (!done) {
        // First-time user → show onboarding
        router.replace('/onboard');
        return;
      }
    } catch (_) {}
    setChecked(true);
  }, [router]);

  // Brief blank while checking; avoids flash of login before redirect
  if (!checked) return <div className="min-h-screen bg-[#030712]" />;

  return <LoginPortal />;
}

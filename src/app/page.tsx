'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginPortal } from '@/components/auth/login-portal';

export default function RootParityPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const done = localStorage.getItem('onboarding_complete');
      if (!done) {
        router.replace('/onboard');
      }
    } catch (_) {}
  }, [router]);

  return <LoginPortal />;
}

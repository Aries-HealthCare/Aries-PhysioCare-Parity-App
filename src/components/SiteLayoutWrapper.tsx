'use client';

import React from 'react';
import { ProviderAuthProvider } from '@/services/provider-auth-context';

export default function SiteLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProviderAuthProvider>
      <main className="flex-1 bg-background text-foreground">
        {children}
      </main>
    </ProviderAuthProvider>
  );
}

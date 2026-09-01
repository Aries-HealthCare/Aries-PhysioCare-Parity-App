'use client';

import React from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import ProviderLoginPage from './login/page';
import AppLayout from './app/layout';
import DashboardPage from './app/page';

export default function RootParityPage() {
  const { isAuthenticated, isLoading } = useProviderAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#0088FF]/30 border-t-[#0088FF] rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400 tracking-wider">Loading AriesXpert Workstation...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    );
  }

  return <ProviderLoginPage />;
}


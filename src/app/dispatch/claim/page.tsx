'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { DispatchClaimView } from '@/components/dispatch/dispatch-claim-view';

function DispatchClaimQueryReader() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  return <DispatchClaimView token={token} />;
}

function DispatchClaimFallback() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-lg mx-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-center gap-2.5 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading visit assignment…</span>
        </div>
      </div>
    </div>
  );
}

export default function DispatchClaimPage() {
  return (
    <Suspense fallback={<DispatchClaimFallback />}>
      <DispatchClaimQueryReader />
    </Suspense>
  );
}

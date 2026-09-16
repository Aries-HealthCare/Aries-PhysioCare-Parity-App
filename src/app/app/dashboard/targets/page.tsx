'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';

export default function TargetSetupPage() {
  const { user, refreshProfile } = useProviderAuth();
  const [target, setTarget] = useState(String(user?.monthlyVisitTarget || user?.monthlyTargetEarnings || ''));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title="Monthly target" description="POST /api/app/expert/setMonthlyTarget — stored on the therapist profile." />
      <form
        className="rounded-3xl border border-border bg-card p-5 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setError(null);
          try {
            const res = await providerApi.setMonthlyTarget(Number(target));
            if (!res.success) throw new Error(res.message);
            await refreshProfile();
            setMessage('Target saved on your expert record.');
          } catch (err: any) {
            setError(err?.message || 'Could not save target');
          } finally {
            setSaving(false);
          }
        }}
      >
        <Input type="number" min={1} value={target} onChange={(e) => setTarget(e.target.value)} className="rounded-2xl" />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        <Button type="submit" disabled={saving} className="rounded-2xl">Save target</Button>
      </form>
    </div>
  );
}

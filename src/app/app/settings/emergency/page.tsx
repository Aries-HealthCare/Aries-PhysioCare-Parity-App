'use client';

import { useState } from 'react';
import { PageHeader, EmptyState, ErrorState, PageSkeleton } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';

export default function EmergencyContactsPage() {
  const { data, error, loading, reload } = useBackendQuery(() => providerApi.fetchEmergencyContacts(), []);
  const contacts = Array.isArray(data) ? data : [];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <PageHeader title="Emergency contacts" description="SOS roster stored on the same therapistEmergencyContact APIs as mobile." />
      <form
        className="rounded-3xl border border-border bg-card p-4 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setFormError(null);
          try {
            const res = await providerApi.saveEmergencyContact({ name, phone });
            if (!res.success) throw new Error(res.message);
            setName('');
            setPhone('');
            await reload();
          } catch (err: any) {
            setFormError(err?.message || 'Could not save contact');
          } finally {
            setSaving(false);
          }
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="rounded-2xl" />
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" required className="rounded-2xl" />
        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        <Button type="submit" disabled={saving} className="rounded-2xl">Save contact</Button>
      </form>
      {loading ? <PageSkeleton rows={3} /> : null}
      {error ? <ErrorState error={error} onRetry={reload} /> : null}
      {!loading && !contacts.length ? (
        <EmptyState title="No emergency contacts" description="Add at least one contact the SOS desk can reach." />
      ) : (
        <ul className="space-y-2">
          {contacts.map((contact: any) => (
            <li key={contact._id || contact.id} className="rounded-2xl border border-border p-3 flex justify-between">
              <div>
                <p className="font-bold text-sm">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.phone}</p>
              </div>
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={async () => {
                  await providerApi.deleteEmergencyContact(contact._id || contact.id);
                  await reload();
                }}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

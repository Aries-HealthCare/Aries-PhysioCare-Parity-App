'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Phone,
  Plus,
  ShieldAlert,
  Trash2,
  Users,
} from 'lucide-react';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';

const RELATIONS = ['Family / Spouse', 'Parent', 'Sibling', 'Clinical Lead', 'Colleague', 'Friend'];

export default function EmergencyContactsPage() {
  const { toast } = useToast();
  const { data, error, loading, reload } = useBackendQuery(() => providerApi.fetchEmergencyContacts(), []);
  const contacts = Array.isArray(data) ? data : [];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState(RELATIONS[0]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (!name.trim() || cleanPhone.replace(/\D/g, '').length < 10) {
      toast({
        title: 'Invalid contact details',
        description: 'Enter a contact name and a valid 10-digit mobile number.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const res = await providerApi.saveEmergencyContact({
        name: name.trim(),
        phone: cleanPhone,
        relation,
      });
      if (!res.success) throw new Error(res.message || 'Could not save emergency contact.');
      setName('');
      setPhone('');
      toast({ title: 'Emergency contact saved', description: `${name.trim()} added to your SOS alert roster.` });
      await reload();
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err?.message || 'Could not save contact.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, contactName: string) => {
    setDeletingId(id);
    try {
      await providerApi.deleteEmergencyContact(id);
      toast({ title: 'Contact removed', description: `${contactName} was removed from your SOS roster.` });
      await reload();
    } catch (err: any) {
      toast({
        title: 'Remove failed',
        description: err?.message || 'Could not remove contact.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/app/settings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Settings</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Emergency Contacts</h1>
              <p className="text-xs text-muted-foreground">
                Trusted contacts automatically notified with your live GPS location during an Emergency SOS.
              </p>
            </div>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="h-10 rounded-2xl text-xs font-bold border-destructive/30 text-destructive">
          <Link href="/app/sos">Open SOS Hub</Link>
        </Button>
      </div>

      <form onSubmit={handleSave} className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-outfit font-extrabold flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          <span>Add Trusted Contact</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-bold">Full Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contact name" className="h-10 rounded-xl" required />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold">Mobile Number *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98XXXXXXXX" className="h-10 rounded-xl font-mono" required />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold">Relationship</Label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
            >
              {RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="h-10 px-6 rounded-2xl text-xs font-extrabold gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{saving ? 'Saving…' : 'Save Contact'}</span>
          </Button>
        </div>
      </form>

      {loading ? <PageSkeleton rows={3} /> : null}
      {error ? <ErrorState error={error} onRetry={reload} /> : null}
      {!loading && !error && !contacts.length ? (
        <EmptyState
          icon={Users}
          title="No emergency contacts saved yet"
          description="Add at least one trusted family member or clinical lead so dispatch can coordinate immediately in an emergency."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts.map((contact: any, idx: number) => {
            const id = String(contact._id || contact.id || idx);
            return (
              <div
                key={id}
                className="rounded-3xl border border-border/80 bg-card p-5 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-outfit font-extrabold text-sm truncate">{contact.name}</p>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">{contact.phone}</p>
                  {contact.relation && <p className="text-[11px] text-muted-foreground">{contact.relation}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild variant="outline" size="sm" className="h-9 px-3 rounded-xl text-xs font-bold">
                    <a href={`tel:${contact.phone}`}>
                      <Phone className="w-3.5 h-3.5 mr-1" /> Call
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={deletingId === id}
                    onClick={() => handleDelete(id, contact.name || 'Contact')}
                    className="h-9 px-3 rounded-xl text-destructive border-destructive/30"
                    aria-label={`Remove ${contact.name}`}
                  >
                    {deletingId === id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

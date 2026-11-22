'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Eye,
  FileText,
  Loader2,
  LogOut,
  Navigation,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';

export default function PrivacySettingsPage() {
  const { user, refreshProfile, logout } = useProviderAuth();
  const { toast } = useToast();

  const [profileVisible, setProfileVisible] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileVisible(user.isProfileVisible ?? true);
    setActivityTracking(user.isActivityTracking ?? true);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await providerApi.setProfileVisible(profileVisible);
      await providerApi.setActivityTracking(activityTracking);
      await refreshProfile();
      toast({ title: 'Privacy settings updated', description: 'Your visibility and tracking preferences are saved.' });
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err?.message || 'Could not save privacy preferences.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Settings</span>
        </Link>
        <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Privacy &amp; Security</h1>
        <p className="text-xs text-muted-foreground">
          Manage public clinician directory visibility, location check-in permissions, and account security.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/25 cursor-pointer">
            <div className="flex items-start gap-3">
              <Eye className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Public Profile Visibility</p>
                <p className="text-[11px] text-muted-foreground">
                  Allow patients searching in your registered service territory to discover your verified profile.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profileVisible}
              onChange={(e) => setProfileVisible(e.target.checked)}
              className="h-4 w-4 rounded text-primary"
            />
          </label>

          <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/25 cursor-pointer">
            <div className="flex items-start gap-3">
              <Navigation className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Activity &amp; Arrival Location Tracking</p>
                <p className="text-[11px] text-muted-foreground">
                  Used for geo-verified doorstep arrival validation and live Emergency SOS coordinates while active.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={activityTracking}
              onChange={(e) => setActivityTracking(e.target.checked)}
              className="h-4 w-4 rounded text-primary"
            />
          </label>

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={saving} className="h-10 px-6 rounded-2xl text-xs font-extrabold gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving…' : 'Save Privacy Preferences'}</span>
            </Button>
          </div>
        </section>
      </form>

      <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-outfit font-extrabold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Policies &amp; Session</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <Link
            href="/privacy-policy"
            className="p-4 rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/40 flex items-center gap-2.5 font-bold"
          >
            <FileText className="w-4 h-4 text-primary" /> Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            className="p-4 rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/40 flex items-center gap-2.5 font-bold"
          >
            <FileText className="w-4 h-4 text-primary" /> Terms of Service
          </Link>
        </div>
        <div className="pt-3 border-t border-border/60 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Signed in on this browser session</p>
          <Button
            type="button"
            variant="outline"
            onClick={logout}
            className="rounded-xl text-xs font-bold text-destructive border-destructive/30 gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      </section>
    </div>
  );
}

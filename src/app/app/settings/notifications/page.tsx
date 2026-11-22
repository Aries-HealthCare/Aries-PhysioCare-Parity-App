'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Loader2, Moon, Save, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { browserNotifyEnabled, disableBrowserNotify, enableBrowserNotify } from '@/lib/browser-notify';

export default function NotificationSettingsPage() {
  const { user, refreshProfile } = useProviderAuth();
  const { toast } = useToast();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [tone, setTone] = useState('default');
  const [quietEnabled, setQuietEnabled] = useState(false);
  const [quietFrom, setQuietFrom] = useState('22:00');
  const [quietTo, setQuietTo] = useState('07:00');
  const [browserNotif, setBrowserNotif] = useState<'on' | 'off' | 'unsupported'>('off');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPushEnabled(user.enablePushNotification ?? true);
    setWhatsappEnabled(user.enableWhatsAppNotification ?? false);
    setSmsEnabled(user.enableSMSNotification ?? true);
    setEmailEnabled(user.enableEmailNotification ?? true);
    setTone(user.notificationTone || 'default');
    setQuietEnabled(user.isQuietHoursEnabled ?? false);
    setQuietFrom(user.quietHoursFrom || '22:00');
    setQuietTo(user.quietHoursTo || '07:00');
    if (typeof window !== 'undefined') {
      setBrowserNotif('Notification' in window ? (browserNotifyEnabled() ? 'on' : 'off') : 'unsupported');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await providerApi.updateNotificationSettings({
        enablePushNotification: pushEnabled,
        enableWhatsAppNotification: whatsappEnabled,
        enableSMSNotification: smsEnabled,
        enableEmailNotification: emailEnabled,
        notificationTone: tone,
      });
      await providerApi.updateQuietHours({
        enabled: quietEnabled,
        start: quietFrom,
        end: quietTo,
      });
      await refreshProfile();
      toast({ title: 'Notification preferences saved', description: 'Synced with your AriesXpert profile.' });
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err?.message || 'Could not update notification preferences.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Settings</span>
        </Link>
        <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Notification Settings</h1>
        <p className="text-xs text-muted-foreground">
          Choose how lead broadcasts, appointment reminders, and payout confirmations reach you.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-outfit font-extrabold flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-primary" />
            <span>Delivery Channels</span>
          </h2>
          {[
            { label: 'Push Notifications', desc: 'Instant broadcast and visit alerts.', checked: pushEnabled, set: setPushEnabled },
            { label: 'WhatsApp Visit Dispatches', desc: 'Schedule briefs and urgent booking links on WhatsApp.', checked: whatsappEnabled, set: setWhatsappEnabled },
            { label: 'SMS Fallback Alerts', desc: 'Critical dispatch notices when mobile data is weak.', checked: smsEnabled, set: setSmsEnabled },
            { label: 'Email Summaries', desc: 'Payout receipts, tax invoices, and weekly summaries.', checked: emailEnabled, set: setEmailEnabled },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/25 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.set(e.target.checked)}
                className="h-4 w-4 rounded text-primary"
              />
            </label>
          ))}

          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/25">
            <div className="flex items-start gap-2">
              <Volume2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Broadcast Alert Tone</p>
                <p className="text-[11px] text-muted-foreground">Sound profile for urgent lead notifications.</p>
              </div>
            </div>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="h-9 px-3 rounded-xl border border-input bg-background text-xs font-bold"
            >
              <option value="default">Default</option>
              <option value="urgent">Urgent Siren</option>
              <option value="chime">Soft Chime</option>
              <option value="silent">Silent</option>
            </select>
          </div>
        </section>

        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-outfit font-extrabold flex items-center gap-2">
            <Moon className="w-4 h-4 text-primary" />
            <span>Quiet Hours &amp; Desktop Alerts</span>
          </h2>
          <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/25 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-foreground">Enable Quiet Hours</p>
              <p className="text-[11px] text-muted-foreground">Mute non-urgent alerts overnight. Emergency SOS always overrides quiet hours.</p>
            </div>
            <input
              type="checkbox"
              checked={quietEnabled}
              onChange={(e) => setQuietEnabled(e.target.checked)}
              className="h-4 w-4 rounded text-primary"
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="p-4 rounded-2xl bg-muted/25 block text-xs">
              <span className="font-bold block mb-1.5">Quiet From</span>
              <input
                type="time"
                value={quietFrom}
                disabled={!quietEnabled}
                onChange={(e) => setQuietFrom(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background font-mono font-bold disabled:opacity-50"
              />
            </label>
            <label className="p-4 rounded-2xl bg-muted/25 block text-xs">
              <span className="font-bold block mb-1.5">Quiet Until</span>
              <input
                type="time"
                value={quietTo}
                disabled={!quietEnabled}
                onChange={(e) => setQuietTo(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background font-mono font-bold disabled:opacity-50"
              />
            </label>
          </div>

          <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/25 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-foreground">Browser Desktop Notifications</p>
              <p className="text-[11px] text-muted-foreground">
                Show OS notifications on this laptop/phone browser when leads or SOS alerts arrive.
              </p>
            </div>
            <input
              type="checkbox"
              checked={browserNotif === 'on'}
              disabled={browserNotif === 'unsupported'}
              onChange={async (e) => {
                if (e.target.checked) {
                  const res = await enableBrowserNotify();
                  setBrowserNotif(res === 'granted' ? 'on' : res === 'unsupported' ? 'unsupported' : 'off');
                  toast({
                    title: res === 'granted' ? 'Desktop notifications enabled' : 'Permission not granted',
                    description:
                      res === 'granted'
                        ? 'You will now receive browser alerts while signed in.'
                        : 'Enable notification permissions in your browser settings.',
                  });
                } else {
                  disableBrowserNotify();
                  setBrowserNotif('off');
                }
              }}
              className="h-4 w-4 rounded text-primary"
            />
          </label>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="h-11 px-8 rounded-2xl text-xs font-extrabold gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving…' : 'Save Notification Settings'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

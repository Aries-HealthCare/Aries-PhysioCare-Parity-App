'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import {
  Settings,
  Bell,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Save,
  LogOut,
  Eye,
  Moon,
  Navigation,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LOCALES, LOCALE_STORAGE_KEY, readLocale, type Locale } from '@/lib/i18n';
import { browserNotifyEnabled, disableBrowserNotify, enableBrowserNotify } from '@/lib/browser-notify';

/**
 * Provider settings — backed by the same endpoints the mobile settings screen writes:
 *   POST /api/app/expert/notificationEnableOrDisable  (per-channel flags + tone)
 *   POST /api/app/expert/updateQuietHours
 *   POST /api/app/expert/isProfileVisible
 *   POST /api/app/expert/isActivityTracking
 * Values are read back from the therapist record so a change made on the phone shows
 * here and vice versa.
 */

interface SettingsState {
  enablePushNotification: boolean;
  enableEmailNotification: boolean;
  enableWhatsAppNotification: boolean;
  enableSMSNotification: boolean;
  notificationTone: string;
  isQuietHoursEnabled: boolean;
  quietHoursFrom: string;
  quietHoursTo: string;
  isProfileVisible: boolean;
  isActivityTracking: boolean;
}

const DEFAULTS: SettingsState = {
  enablePushNotification: true,
  enableEmailNotification: true,
  enableWhatsAppNotification: false,
  enableSMSNotification: true,
  notificationTone: 'default',
  isQuietHoursEnabled: false,
  quietHoursFrom: '00:00',
  quietHoursTo: '00:00',
  isProfileVisible: true,
  isActivityTracking: true,
};

function fromProfile(user: any): SettingsState {
  if (!user) return DEFAULTS;
  return {
    enablePushNotification: user.enablePushNotification ?? DEFAULTS.enablePushNotification,
    enableEmailNotification: user.enableEmailNotification ?? DEFAULTS.enableEmailNotification,
    enableWhatsAppNotification: user.enableWhatsAppNotification ?? DEFAULTS.enableWhatsAppNotification,
    enableSMSNotification: user.enableSMSNotification ?? DEFAULTS.enableSMSNotification,
    notificationTone: user.notificationTone || DEFAULTS.notificationTone,
    isQuietHoursEnabled: user.isQuietHoursEnabled ?? DEFAULTS.isQuietHoursEnabled,
    quietHoursFrom: user.quietHoursFrom || DEFAULTS.quietHoursFrom,
    quietHoursTo: user.quietHoursTo || DEFAULTS.quietHoursTo,
    isProfileVisible: user.isProfileVisible ?? DEFAULTS.isProfileVisible,
    isActivityTracking: user.isActivityTracking ?? DEFAULTS.isActivityTracking,
  };
}

export default function ProviderSettingsPage() {
  const { user, logout, refreshProfile } = useProviderAuth();

  const [form, setForm] = useState<SettingsState>(() => fromProfile(user));
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifyPref, setNotifyPref] = useState<'on' | 'off' | 'unsupported'>('off');
  const [locale, setLocale] = useState<Locale>('en');

  // Re-hydrate whenever the backing profile changes (login, refresh, mobile edit).
  useEffect(() => {
    setForm(fromProfile(user));
    setLocale(readLocale());
    if (typeof window !== 'undefined' && !('Notification' in window)) setNotifyPref('unsupported');
    else setNotifyPref(browserNotifyEnabled() ? 'on' : 'off');
  }, [user]);

  const set = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setSavedSuccess(false);
    try {
      await providerApi.updateNotificationSettings({
        enablePushNotification: form.enablePushNotification,
        enableEmailNotification: form.enableEmailNotification,
        enableWhatsAppNotification: form.enableWhatsAppNotification,
        enableSMSNotification: form.enableSMSNotification,
        notificationTone: form.notificationTone,
      });
      await providerApi.updateQuietHours({
        enabled: form.isQuietHoursEnabled,
        start: form.quietHoursFrom,
        end: form.quietHoursTo,
      });
      await providerApi.setProfileVisible(form.isProfileVisible);
      await providerApi.setActivityTracking(form.isActivityTracking);

      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setError(err?.message || 'Could not save your preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [form, refreshProfile]);

  const toggles: Array<{ key: keyof SettingsState; title: string; description: string }> = [
    {
      key: 'enablePushNotification',
      title: 'Push Notifications',
      description: 'High-priority lead broadcasts and visit dispatches on this device.',
    },
    {
      key: 'enableWhatsAppNotification',
      title: 'WhatsApp Visit Dispatches',
      description: 'Daily schedule briefs and urgent booking alerts on WhatsApp.',
    },
    {
      key: 'enableSMSNotification',
      title: 'SMS Alerts',
      description: 'Fallback SMS for time-critical dispatches when data is unavailable.',
    },
    {
      key: 'enableEmailNotification',
      title: 'Email Summaries',
      description: 'Invoices, payout confirmations and weekly practice summaries.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Application Settings</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Notification channels, quiet hours, visibility and tracking — synced with your mobile app.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-10 px-5 rounded-xl bg-primary text-white font-bold text-xs shadow-md"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-1.5" />
          )}
          <span>{isSaving ? 'Saving…' : 'Save Preferences'}</span>
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved to your provider record.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Notification channels */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span>Alerts &amp; Notifications</span>
        </h3>

        <div className="space-y-3 text-xs">
          {toggles.map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between p-3.5 bg-muted/20 rounded-2xl">
              <div>
                <div className="font-bold text-foreground">{toggle.title}</div>
                <div className="text-muted-foreground">{toggle.description}</div>
              </div>
              <input
                type="checkbox"
                checked={form[toggle.key] as boolean}
                onChange={(e) => set(toggle.key, e.target.checked as any)}
                className="h-4 w-4 rounded text-primary"
              />
            </div>
          ))}

          <div className="flex items-center justify-between p-3.5 bg-muted/20 rounded-2xl">
            <div>
              <div className="font-bold text-foreground">Alert Tone</div>
              <div className="text-muted-foreground">Sound played for a new high-urgency lead broadcast.</div>
            </div>
            <select
              value={form.notificationTone}
              onChange={(e) => set('notificationTone', e.target.value)}
              className="px-3 py-1.5 bg-background border border-input rounded-xl text-xs font-bold"
            >
              <option value="default">Default</option>
              <option value="urgent">Urgent Siren</option>
              <option value="chime">Soft Chime</option>
              <option value="silent">Silent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quiet hours */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
          <Moon className="w-4 h-4 text-primary" />
          <span>Quiet Hours</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 bg-muted/20 rounded-2xl">
            <div>
              <div className="font-bold text-foreground">Mute non-urgent alerts</div>
              <div className="text-muted-foreground">
                Emergency SOS and active-visit alerts always come through.
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.isQuietHoursEnabled}
              onChange={(e) => set('isQuietHoursEnabled', e.target.checked)}
              className="h-4 w-4 rounded text-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="p-3.5 bg-muted/20 rounded-2xl block">
              <span className="font-bold text-foreground block mb-1.5">From</span>
              <input
                type="time"
                value={form.quietHoursFrom}
                disabled={!form.isQuietHoursEnabled}
                onChange={(e) => set('quietHoursFrom', e.target.value)}
                className="w-full px-3 py-1.5 bg-background border border-input rounded-xl text-xs font-bold disabled:opacity-50"
              />
            </label>
            <label className="p-3.5 bg-muted/20 rounded-2xl block">
              <span className="font-bold text-foreground block mb-1.5">To</span>
              <input
                type="time"
                value={form.quietHoursTo}
                disabled={!form.isQuietHoursEnabled}
                onChange={(e) => set('quietHoursTo', e.target.value)}
                className="w-full px-3 py-1.5 bg-background border border-input rounded-xl text-xs font-bold disabled:opacity-50"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Visibility & tracking */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span>Visibility &amp; Tracking</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 bg-muted/20 rounded-2xl">
            <div>
              <div className="font-bold text-foreground">Public Profile Visibility</div>
              <div className="text-muted-foreground">Show your profile to patients searching in your service area.</div>
            </div>
            <input
              type="checkbox"
              checked={form.isProfileVisible}
              onChange={(e) => set('isProfileVisible', e.target.checked)}
              className="h-4 w-4 rounded text-primary"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-muted/20 rounded-2xl">
            <div>
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />
                <span>Activity &amp; Location Tracking</span>
              </div>
              <div className="text-muted-foreground">
                Required for geo-verified visit check-ins and SOS dispatch accuracy.
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.isActivityTracking}
              onChange={(e) => set('isActivityTracking', e.target.checked)}
              className="h-4 w-4 rounded text-primary"
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span>Appearance</span>
        </h3>

        <div className="p-3.5 bg-muted/20 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-foreground">Theme Mode</div>
            <div className="text-muted-foreground">
              Switch between the light and dark clinical theme. Stored on this device.
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          Language
        </h3>
        <p className="text-xs text-muted-foreground">
          Display language for this browser. Mobile AppLocalizations still follow the phone locale — there is no separate backend preference.
        </p>
        <select
          value={locale}
          onChange={(e) => {
            const next = e.target.value as Locale;
            setLocale(next);
            localStorage.setItem(LOCALE_STORAGE_KEY, next);
            document.documentElement.lang = next;
            document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
          }}
          className="px-3 py-2 bg-background border border-input rounded-xl text-xs font-bold"
        >
          {LOCALES.map((code) => (
            <option key={code} value={code}>
              {code === 'en' ? 'English' : code === 'hi' ? 'Hindi' : code === 'ar' ? 'Arabic' : 'Spanish'}
            </option>
          ))}
        </select>
        <div className="flex items-center justify-between p-3.5 bg-muted/20 rounded-2xl text-xs">
          <div>
            <div className="font-bold">Browser notifications</div>
            <div className="text-muted-foreground">
              When this tab is in the background, leads, SOS and flash alerts can surface as OS notifications. FCM web tokens are not required.
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifyPref === 'on'}
            disabled={notifyPref === 'unsupported'}
            onChange={async (e) => {
              if (e.target.checked) {
                const result = await enableBrowserNotify();
                setNotifyPref(result === 'granted' ? 'on' : result === 'unsupported' ? 'unsupported' : 'off');
              } else {
                disableBrowserNotify();
                setNotifyPref('off');
              }
            }}
            className="h-4 w-4 rounded text-primary"
          />
        </div>
        <Link href="/app/settings/emergency" className="inline-flex text-sm font-bold text-primary">
          Manage emergency contacts →
        </Link>
      </div>

      {/* System status & logout */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>AriesXpert parity {process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0-parity'}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-destructive font-bold hover:underline flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

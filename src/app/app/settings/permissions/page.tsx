'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  Camera,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Mic,
  RefreshCw,
  ShieldCheck,
  Wand2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { computePermissionHealth, type WebPermissionStatus } from '@/lib/wave2-helpers';

type PermKey = 'geolocation' | 'notifications' | 'camera' | 'microphone';

const PERMISSION_META: Array<{
  key: PermKey;
  title: string;
  desc: string;
  icon: typeof MapPin;
  usedFor: string;
}> = [
  {
    key: 'geolocation',
    title: 'Location (GPS)',
    desc: 'Verifies doorstep arrival check-in, Live Map distances, and Emergency SOS coordinates.',
    icon: MapPin,
    usedFor: 'Visits, Live Map & SOS',
  },
  {
    key: 'notifications',
    title: 'Browser Notifications',
    desc: 'Delivers urgent patient lead broadcasts, booking approvals, and flash alerts.',
    icon: Bell,
    usedFor: 'Leads & Alerts',
  },
  {
    key: 'camera',
    title: 'Camera',
    desc: 'Used for Telehealth video sessions, Emergency SOS safety monitor, and receipt capture.',
    icon: Camera,
    usedFor: 'Telehealth & SOS',
  },
  {
    key: 'microphone',
    title: 'Microphone',
    desc: 'Enables Telehealth audio, Buddy voice dictation, and AI Avatar Studio conversations.',
    icon: Mic,
    usedFor: 'Telehealth & AI Voice',
  },
];

async function queryBrowserPermission(name: PermissionName): Promise<WebPermissionStatus> {
  if (typeof navigator === 'undefined') return 'unsupported';
  if (!navigator.permissions?.query) return 'prompt';
  try {
    const res = await navigator.permissions.query({ name });
    if (res.state === 'granted' || res.state === 'denied' || res.state === 'prompt') return res.state;
    return 'prompt';
  } catch {
    return 'prompt';
  }
}

export default function PermissionMonitorPage() {
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<Record<PermKey, WebPermissionStatus>>({
    geolocation: 'prompt',
    notifications: 'prompt',
    camera: 'prompt',
    microphone: 'prompt',
  });
  const [checking, setChecking] = useState(true);

  const checkAll = useCallback(async () => {
    setChecking(true);
    const next: Record<PermKey, WebPermissionStatus> = {
      geolocation:
        typeof navigator !== 'undefined' && 'geolocation' in navigator
          ? await queryBrowserPermission('geolocation')
          : 'unsupported',
      notifications:
        typeof window !== 'undefined' && 'Notification' in window
          ? window.Notification.permission === 'granted'
            ? 'granted'
            : window.Notification.permission === 'denied'
              ? 'denied'
              : 'prompt'
          : 'unsupported',
      camera:
        typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function'
          ? await queryBrowserPermission('camera' as PermissionName)
          : 'unsupported',
      microphone:
        typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function'
          ? await queryBrowserPermission('microphone' as PermissionName)
          : 'unsupported',
    };
    setStatuses(next);
    setChecking(false);
  }, []);

  useEffect(() => {
    void checkAll();
  }, [checkAll]);

  const requestPermission = async (key: PermKey) => {
    try {
      if (key === 'geolocation' && navigator.geolocation) {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(() => resolve(), (err) => reject(err), { timeout: 8000 });
        });
      } else if (key === 'notifications' && 'Notification' in window) {
        await window.Notification.requestPermission();
      } else if (key === 'camera' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
      } else if (key === 'microphone' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
      await checkAll();
      toast({ title: 'Permission status refreshed', description: `Checked ${key} access for this browser.` });
    } catch {
      await checkAll();
      toast({
        title: 'Permission blocked or dismissed',
        description: `Allow ${key} access in your browser site settings (lock icon in the address bar).`,
        variant: 'destructive',
      });
    }
  };

  const health = computePermissionHealth(statuses);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/app/settings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Settings</span>
          </Link>
          <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Device &amp; Browser Permissions</h1>
          <p className="text-xs text-muted-foreground">
            Monitor browser capabilities required for GPS arrival checks, telehealth calls, voice AI, and SOS alerts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={checkAll} disabled={checking} className="h-10 rounded-2xl text-xs font-bold gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>Re-check</span>
          </Button>
          <Button asChild size="sm" className="h-10 rounded-2xl text-xs font-extrabold gap-1.5">
            <Link href="/app/settings/permissions/wizard">
              <Wand2 className="w-3.5 h-3.5" /> Guided Setup Wizard
            </Link>
          </Button>
        </div>
      </div>

      {/* Health Score Banner */}
      <div className="rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card to-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-mono text-2xl font-black">
            {health.score}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{health.statusLabel}</span>
            </div>
            <h2 className="text-base font-outfit font-extrabold mt-0.5">
              {health.grantedCount} of {health.totalSupported} browser permissions granted
            </h2>
            <p className="text-xs text-muted-foreground">
              Permissions apply to this browser on your desktop, tablet, or mobile device.
            </p>
          </div>
        </div>
      </div>

      {/* Permission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PERMISSION_META.map((item) => {
          const Icon = item.icon;
          const status = statuses[item.key];
          return (
            <div key={item.key} className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-outfit font-extrabold">{item.title}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.usedFor}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      status === 'granted'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : status === 'denied'
                          ? 'bg-destructive/10 text-destructive border-destructive/30'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    }`}
                  >
                    {status === 'granted' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : status === 'denied' ? (
                      <XCircle className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <span className="text-[11px] text-muted-foreground">
                  {status === 'granted'
                    ? 'Ready for clinical workflows'
                    : status === 'denied'
                      ? 'Blocked in browser site settings'
                      : status === 'unsupported'
                        ? 'Not available in this browser'
                        : 'Click to grant access'}
                </span>
                {status !== 'granted' && status !== 'unsupported' && (
                  <Button
                    type="button"
                    size="sm"
                    variant={status === 'denied' ? 'outline' : 'default'}
                    onClick={() => requestPermission(item.key)}
                    className="h-8 rounded-xl text-xs font-bold"
                  >
                    {status === 'denied' ? 'Retry Access' : 'Grant Access'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Mic,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const STEPS = [
  {
    key: 'geolocation' as const,
    title: 'Enable Location Access',
    desc: 'Allows geo-verified doorstep arrival check-ins, live distance calculations on your map, and accurate Emergency SOS dispatch coordinates.',
    icon: MapPin,
  },
  {
    key: 'notifications' as const,
    title: 'Enable Browser Alerts',
    desc: 'Surfaces real-time patient lead broadcasts and booking approvals even when your workstation tab is in the background.',
    icon: Bell,
  },
  {
    key: 'camera' as const,
    title: 'Enable Camera Access',
    desc: 'Powers Telehealth video sessions, Emergency SOS safety monitoring, and instant payment receipt capture.',
    icon: Camera,
  },
  {
    key: 'microphone' as const,
    title: 'Enable Microphone Access',
    desc: 'Powers Telehealth audio consultations, Buddy voice dictation, and interactive AI Avatar Studio sessions.',
    icon: Mic,
  },
];

export default function PermissionWizardPage() {
  const { toast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [results, setResults] = useState<Record<string, 'granted' | 'skipped' | 'denied'>>({});
  const [busy, setBusy] = useState(false);

  const isComplete = stepIndex >= STEPS.length;
  const current = STEPS[stepIndex];

  const handleGrant = async () => {
    if (!current) return;
    setBusy(true);
    try {
      if (current.key === 'geolocation' && navigator.geolocation) {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(() => resolve(), (e) => reject(e), { timeout: 8000 });
        });
      } else if (current.key === 'notifications' && 'Notification' in window) {
        const perm = await window.Notification.requestPermission();
        if (perm !== 'granted') throw new Error('denied');
      } else if (current.key === 'camera' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
      } else if (current.key === 'microphone' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
      setResults((prev) => ({ ...prev, [current.key]: 'granted' }));
      toast({ title: `${current.title} enabled` });
      setStepIndex((i) => i + 1);
    } catch {
      setResults((prev) => ({ ...prev, [current.key]: 'denied' }));
      toast({
        title: 'Permission was not granted',
        description: 'You can enable it anytime from the browser address bar or Permission Monitor.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/app/settings/permissions"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Permission Monitor</span>
      </Link>

      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-outfit font-extrabold uppercase tracking-widest text-primary">
            Permission Setup Wizard
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            Step {Math.min(stepIndex + 1, STEPS.length)} of {STEPS.length}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(Math.min(stepIndex, STEPS.length) / STEPS.length) * 100}%` }}
          />
        </div>

        {!isComplete && current ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <current.icon className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h1 className="text-xl font-outfit font-extrabold">{current.title}</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">{current.desc}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResults((prev) => ({ ...prev, [current.key]: 'skipped' }));
                  setStepIndex((i) => i + 1);
                }}
                className="w-full sm:w-auto h-11 px-6 rounded-2xl text-xs font-bold"
              >
                Skip for Now
              </Button>
              <Button
                type="button"
                disabled={busy}
                onClick={handleGrant}
                className="w-full sm:w-auto h-11 px-8 rounded-2xl text-xs font-extrabold gap-1.5"
              >
                <span>{busy ? 'Waiting for browser prompt…' : 'Allow & Continue'}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-outfit font-extrabold">Browser Setup Complete</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Your clinical web workstation permissions have been reviewed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left text-xs max-w-md mx-auto">
              {STEPS.map((s) => (
                <div key={s.key} className="p-3 rounded-2xl bg-muted/30 flex items-center justify-between">
                  <span className="font-bold capitalize">{s.key}</span>
                  <span
                    className={`font-bold text-[10px] uppercase ${
                      results[s.key] === 'granted' ? 'text-emerald-500' : 'text-muted-foreground'
                    }`}
                  >
                    {results[s.key] === 'granted' ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Granted
                      </span>
                    ) : (
                      results[s.key] || 'Pending'
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline" className="h-11 rounded-2xl text-xs font-bold">
                <Link href="/app/settings/permissions">View Permission Monitor</Link>
              </Button>
              <Button asChild className="h-11 px-8 rounded-2xl text-xs font-extrabold">
                <Link href="/app">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

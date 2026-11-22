'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Globe } from 'lucide-react';
import { LOCALE_STORAGE_KEY, readLocale, type Locale } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

const LANGUAGE_OPTIONS: Array<{
  code: Locale;
  name: string;
  nativeName: string;
  region: string;
  dir: 'ltr' | 'rtl';
  sample: string;
}> = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'Global / India', dir: 'ltr', sample: 'Dashboard · Appointments · Active Visits' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'India', dir: 'ltr', sample: 'डैशबोर्ड · अपॉइंटमेंट्स · विज़िट्स' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'UAE / MENA (RTL)', dir: 'rtl', sample: 'لوحة التحكم · المواعيد · الزيارات' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'Global', dir: 'ltr', sample: 'Panel · Citas · Visitas' },
];

export default function LanguageSettingsPage() {
  const { toast } = useToast();
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    setLocale(readLocale());
  }, []);

  const handleSelect = (opt: (typeof LANGUAGE_OPTIONS)[number]) => {
    setLocale(opt.code);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, opt.code);
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = opt.code;
      document.documentElement.dir = opt.dir;
    }
    toast({
      title: `Language switched to ${opt.name}`,
      description: 'Navigation labels and layout direction updated for this browser.',
    });
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
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Language &amp; Region</h1>
            <p className="text-xs text-muted-foreground">
              Choose your preferred workspace display language on this device.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LANGUAGE_OPTIONS.map((opt) => {
          const active = locale === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`p-5 rounded-3xl border text-left transition-all space-y-2 ${
                active
                  ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                  : 'border-border/80 bg-card hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-outfit font-extrabold text-foreground">{opt.nativeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {opt.name} · {opt.region}
                  </p>
                </div>
                {active && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
              </div>
              <p className="text-[11px] font-medium text-muted-foreground pt-2 border-t border-border/60" dir={opt.dir}>
                {opt.sample}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { providerApi } from '@/services/provider-api';
import { ArenaHeader, RewardsPausedNotice } from '@/components/gaming/arena-shell';
import { BookOpen, ChevronRight, ShieldCheck, Swords, Zap } from 'lucide-react';

const QUIZ_CATEGORIES = [
  {
    group: 'Clinical Specialist Tracks',
    items: [
      {
        title: 'Orthopaedics & Splinting',
        subtitle: 'Joint arthroplasty, fracture mobilization, ligament protocols',
        href: '/app/gaming/topic-quizzes',
      },
      {
        title: 'Neurological Rehabilitation',
        subtitle: 'Stroke recovery, spasticity grading, gait & balance scaling',
        href: '/app/gaming/topic-quizzes',
      },
      {
        title: 'Cardiopulmonary & Geriatrics',
        subtitle: 'Airway clearance, vitals monitoring, fall prevention',
        href: '/app/gaming/topic-quizzes',
      },
      {
        title: 'Sports & Biomechanics',
        subtitle: 'Return-to-play testing, tendon loading, kinesiology',
        href: '/app/gaming/topic-quizzes',
      },
    ],
  },
  {
    group: 'General Knowledge & Speed Rounds',
    items: [
      {
        title: 'Science & Pharmacology',
        subtitle: 'NSAIDs, pain pathways, electrotherapy physics',
        href: '/app/gaming/rapid-fire',
      },
      {
        title: 'History & Clinical Evolution',
        subtitle: 'Rehabilitation standards, clinical ethics & milestones',
        href: '/app/gaming/rapid-fire',
      },
    ],
  },
];

export default function HeadToHeadPage() {
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    providerApi
      .getGamingProfile()
      .then((p) => {
        if (typeof p?.coins === 'number') setCoins(p.coins);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ArenaHeader
        title="Head-to-Head & Quiz Categories"
        description="Browse clinical specialist quiz tracks or sharpen reflexes in Rapid Fire while real-time H2H matchmaking is verified."
        coins={coins}
      />

      {/* Honest H2H Matchmaking Status Card */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
            <Swords className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-foreground">Live 1v1 Matchmaking Queue</h2>
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                Server Verification Pending
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              To ensure fair play, Aries Arena never uses simulated bots or local-only coin wagers. Live peer-to-peer clinician duels will open once server-authoritative matchmaking and ledger settlement are activated.
            </p>
          </div>
        </div>

        <Link
          href="/app/gaming/rapid-fire"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-extrabold shrink-0"
        >
          <Zap className="w-4 h-4" />
          Play Rapid Fire Practice
        </Link>
      </section>

      <RewardsPausedNotice compact />

      {/* Category Tracks */}
      <div className="space-y-6">
        {QUIZ_CATEGORIES.map((section) => (
          <section key={section.group} className="space-y-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
              {section.group}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {section.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-3xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 flex items-center gap-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>No Arena coins are deducted when browsing categories or playing unrated practice sprints.</span>
      </div>
    </div>
  );
}

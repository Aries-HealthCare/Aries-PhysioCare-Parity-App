'use client';

import React from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import {
  Award,
  Star,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy,
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProviderRewardsPage() {
  const { user } = useProviderAuth();
  const completed = user?.completedVisitsCount ?? user?.totalVisits ?? 0;
  const rating = user?.rating ?? 0;

  let tierName = 'Silver Practitioner Tier';
  let nextTier = 'Gold Specialist';
  let target = 25;
  let prevTarget = 0;

  if (completed >= 150) {
    tierName = 'Diamond Master Tier';
    nextTier = 'Apex Legend';
    prevTarget = 150;
    target = 300;
  } else if (completed >= 75) {
    tierName = 'Platinum Healer Tier';
    nextTier = 'Diamond Master';
    prevTarget = 75;
    target = 150;
  } else if (completed >= 25) {
    tierName = 'Gold Specialist Tier';
    nextTier = 'Platinum Healer';
    prevTarget = 25;
    target = 75;
  }

  const remaining = Math.max(0, target - completed);
  const progressPercent = Math.min(100, Math.max(8, Math.round(((completed - prevTarget) / Math.max(1, target - prevTarget)) * 100)));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Clinical Tier & Rewards</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Achieve higher tiers for top broadcast routing priority and commission bonuses.
          </p>
        </div>
      </div>

      {/* Tier Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-card to-card border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-500">
                Current Level
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                {tierName}
              </h2>
              <div className="text-xs text-muted-foreground mt-0.5">
                {rating} Rating • {completed} Total Visits Completed
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs font-bold text-foreground">Next: {nextTier}</div>
            <div className="text-[11px] text-muted-foreground font-mono">{remaining} more sessions needed</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 pt-2">
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>{prevTarget} Sessions</span>
            <span>{target} Sessions</span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-foreground">Earned Clinical Badges</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              title: '5-Star Healer',
              desc: 'Maintained 4.9+ rating for 30 consecutive visits',
              unlocked: true,
              icon: Star,
              color: 'text-amber-500 bg-amber-500/10',
            },
            {
              title: 'Punctuality Master',
              desc: '98% on-time doorstep arrival rate',
              unlocked: true,
              icon: Zap,
              color: 'text-sky-500 bg-sky-500/10',
            },
            {
              title: 'Neuro Champion',
              desc: 'Completed 20+ stroke motor recovery sessions',
              unlocked: true,
              icon: Sparkles,
              color: 'text-emerald-500 bg-emerald-500/10',
            },
            {
              title: 'Century Milestone',
              desc: 'Complete 100 doorstep sessions (94/100)',
              unlocked: false,
              icon: Trophy,
              color: 'text-muted-foreground bg-muted',
            },
          ].map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex flex-col justify-between text-center space-y-2 ${
                  badge.unlocked
                    ? 'border-border/80 bg-muted/20'
                    : 'border-border/40 bg-muted/10 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center ${badge.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-foreground">{badge.title}</div>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{badge.desc}</p>
                </div>
                <div className="text-[10px] font-bold">
                  {badge.unlocked ? (
                    <span className="text-emerald-500">✓ Unlocked</span>
                  ) : (
                    <span className="text-muted-foreground">🔒 In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

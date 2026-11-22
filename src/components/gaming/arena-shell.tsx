'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Coins, Sparkles } from 'lucide-react';

export function ArenaHeader({
  eyebrow = 'Aries Arena',
  title,
  description,
  coins,
  backHref = '/app/gaming',
  backLabel = 'Back to Arena Hub',
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  coins?: number | null;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel}</span>
        </Link>

        {typeof coins === 'number' && (
          <Link
            href="/app/gaming/coin-shop"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-extrabold hover:bg-amber-500/15 transition-colors"
          >
            <Coins className="w-3.5 h-3.5" />
            <span className="font-mono">{coins}</span>
            <span className="text-[10px] uppercase">Coins</span>
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{eyebrow}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-outfit font-black tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">{description}</p>
          ) : null}
        </div>

        {actions ? <div className="flex items-center gap-2 flex-wrap">{actions}</div> : null}
      </div>
    </div>
  );
}

export function RewardsPausedNotice({
  message,
  compact = false,
}: {
  message?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-amber-500/35 bg-amber-500/10 text-foreground flex items-start gap-3 ${
        compact ? 'p-3.5 text-xs' : 'p-4 sm:p-5 text-xs sm:text-sm'
      }`}
    >
      <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-extrabold">Server Rewards Temporarily Paused</p>
        <p className="text-muted-foreground leading-relaxed">
          {message ||
            'Paid Arena entries, coin transfers, and reward redemptions are temporarily paused during backend security maintenance. Your wallet balance, appointments, and Proactive Clinical Task submissions remain unaffected.'}
        </p>
      </div>
    </div>
  );
}

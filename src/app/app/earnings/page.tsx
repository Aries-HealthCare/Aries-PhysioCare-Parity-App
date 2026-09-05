'use client';

import React, { useState, useEffect } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  CheckCircle2,
  Award,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProviderEarningsPage() {
  const { user } = useProviderAuth();
  const [period, setPeriod] = useState<'WEEK' | 'MONTH' | 'LIFETIME'>('MONTH');
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Earnings are read from the wallet ledger
   * (`POST /api/app/walletTransaction/fetchWalletTransactions`) plus the referral totals
   * the dashboard endpoints return — never derived from a per-visit rate assumption,
   * which would disagree with the amount the mobile wallet shows.
   */
  const load = React.useCallback(async () => {
    setIsLoading(true);
    const [statsRes, txRes] = await Promise.allSettled([
      providerApi.getDashboardStats(),
      providerApi.getTransactions(),
    ]);
    if (statsRes.status === 'fulfilled') setStats(statsRes.value);
    if (txRes.status === 'fulfilled') setTransactions(txRes.value);

    setError(
      statsRes.status === 'rejected' && txRes.status === 'rejected'
        ? 'Could not load your earnings from the server.'
        : null
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const SETTLED = ['completed', 'success'];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const creditsSince = (since: Date | null, categoryFilter?: (category: string) => boolean) =>
    transactions.reduce((sum: number, tx: any) => {
      if (String(tx.type).toUpperCase() !== 'CREDIT') return sum;
      if (!SETTLED.includes(String(tx.status || '').toLowerCase())) return sum;
      if (since && new Date(tx.createdAt || tx.date || 0) < since) return sum;
      if (categoryFilter && !categoryFilter(String(tx.category || '').toUpperCase())) return sum;
      return sum + (Number(tx.amount) || 0);
    }, 0);

  const weekly = creditsSince(startOfWeek);
  const monthly = creditsSince(startOfMonth);
  const lifetimeFromLedger = creditsSince(null);
  const lifetime = lifetimeFromLedger || Number(stats?.totalEarnings ?? user?.totalEarnings ?? 0) || 0;

  const currentRevenue = period === 'WEEK' ? weekly : period === 'MONTH' ? monthly : lifetime;
  const since = period === 'WEEK' ? startOfWeek : period === 'MONTH' ? startOfMonth : null;

  const visitPayouts = creditsSince(since, (category) => category.includes('VISIT') || category === '');
  const refCommissions =
    creditsSince(since, (category) => category.includes('REFERRAL')) ||
    (period === 'LIFETIME'
      ? Number(stats?.totalReferralEarnings ?? 0) + Number(stats?.totalPatientReferralEarnings ?? 0)
      : 0);
  const bonusEarnings = creditsSince(
    since,
    (category) => category.includes('REWARD') || category.includes('BONUS') || category.includes('ADJUST')
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Earnings & Revenue Analytics</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Detailed breakdown of clinical session payouts, 60/40 splits, travel incentives, and referral commissions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl">
          {(['WEEK', 'MONTH', 'LIFETIME'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === p
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === 'WEEK' ? 'This Week' : p === 'MONTH' ? 'This Month' : 'Lifetime'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl text-xs font-bold flex items-center gap-2 bg-red-500/10 text-red-600 border border-red-500/30">
          <span>{error}</span>
          <button type="button" onClick={() => load()} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground">Total Revenue</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground mt-2">
            ₹{currentRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Loading ledger…' : 'Settled wallet credits'}</span>
          </div>
        </div>

        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground">Doorstep Visit Payouts</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground mt-2">
            ₹{visitPayouts.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Direct session fees</div>
        </div>

        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground">Referral Commissions</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground mt-2">
            ₹{refCommissions.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Colleague & patient rewards</div>
        </div>

        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground">Rewards &amp; Adjustments</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground mt-2">
            ₹{bonusEarnings.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Bonuses and ledger adjustments</div>
        </div>
      </div>

      {/* Commission Model Transparency Card */}
      <div className="bg-gradient-to-r from-card to-primary/5 border border-primary/20 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-extrabold text-foreground">Aries Transparent 60/40 Commission Model</h3>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Illustrative examples of the standard split. Your actual credits are the settled ledger
          amounts shown above and in your wallet.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-card/80 rounded-2xl border border-border/60 space-y-1">
            <div className="font-bold text-foreground">Single Home Session (₹1,200)</div>
            <div className="text-muted-foreground">Therapist receives: <strong className="text-emerald-500 font-mono">₹720 (60%)</strong></div>
            <div className="text-muted-foreground">Platform covers: Marketing, Insurance, AI Copilot, Payment gateway</div>
          </div>
          <div className="p-4 bg-card/80 rounded-2xl border border-border/60 space-y-1">
            <div className="font-bold text-foreground">Neuro / Specialized Rehab (₹1,500)</div>
            <div className="text-muted-foreground">Therapist receives: <strong className="text-emerald-500 font-mono">₹900 (60%)</strong></div>
            <div className="text-muted-foreground">Additional equipment subsidy available for post-stroke cases</div>
          </div>
          <div className="p-4 bg-card/80 rounded-2xl border border-border/60 space-y-1">
            <div className="font-bold text-foreground">10-Session Package (₹10,500)</div>
            <div className="text-muted-foreground">Therapist receives: <strong className="text-emerald-500 font-mono">₹6,300 (60%)</strong></div>
            <div className="text-muted-foreground">Guaranteed recurring booking with daily credit on session completion</div>
          </div>
        </div>
      </div>
    </div>
  );
}

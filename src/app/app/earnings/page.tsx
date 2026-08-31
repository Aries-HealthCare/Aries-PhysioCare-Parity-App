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

  useEffect(() => {
    providerApi.getDashboardStats().then((data) => setStats(data));
  }, []);

  const lifetime = user?.totalEarnings ?? stats?.totalEarnings ?? (user?.walletAmount ?? 0);
  const monthly = stats?.monthlyEarnings ?? (stats?.totalVisits ? stats.totalVisits * 600 : 0);
  const weekly = stats?.todayEarnings ?? (stats?.todayVisits ? stats.todayVisits * 600 : 0);

  const currentRevenue = period === 'WEEK' ? weekly : period === 'MONTH' ? monthly : lifetime;
  const visitPayouts = currentRevenue;
  const refCommissions = 0;
  const travelBonus = 0;

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

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground">Total Revenue</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground mt-2">
            ₹{currentRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active earning cycle</span>
          </div>
        </div>

        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground">Doorstep Visit Payouts (60%)</span>
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
          <span className="text-xs font-bold text-muted-foreground">Travel & Peak Bonus</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground mt-2">
            ₹{travelBonus.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Distance allowance subsidy</div>
        </div>
      </div>

      {/* Commission Model Transparency Card */}
      <div className="bg-gradient-to-r from-card to-primary/5 border border-primary/20 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-extrabold text-foreground">Aries Transparent 60/40 Commission Model</h3>
        </div>
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

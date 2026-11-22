'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  HelpCircle,
  History,
  Loader2,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { computeTargetMetrics } from '@/lib/dashboard-analytics';
import { providerApi } from '@/services/provider-api';
import { useProviderAuth } from '@/services/provider-auth-context';

const MIN_TARGET = 5000;
const MAX_TARGET = 150000;
const STEP_TARGET = 500;

const AI_PRESETS = [
  { amount: 5000, label: '₹5,000', tag: 'Starter' },
  { amount: 15000, label: '₹15,000', tag: 'Conservative' },
  { amount: 30000, label: '₹30,000', tag: 'Balanced' },
  { amount: 60000, label: '₹60,000', tag: 'Growth' },
  { amount: 100000, label: '₹1,00,000', tag: 'Pro' },
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function TargetSetupPage() {
  const { user, refreshProfile } = useProviderAuth();
  const { toast } = useToast();

  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentMonthEntry = useMemo(
    () =>
      user?.monthlyTargets?.find((t) => t.month === currentMonth && t.year === currentYear),
    [user?.monthlyTargets, currentMonth, currentYear]
  );

  const initialTarget =
    Number(currentMonthEntry?.target ?? user?.monthlyTargetEarnings ?? 30000) || 30000;

  const [targetAmount, setTargetAmount] = useState<number>(initialTarget);
  const [inputValue, setInputValue] = useState<string>(String(initialTarget));
  const [liveAchieved, setLiveAchieved] = useState<number>(
    Number(currentMonthEntry?.achieved ?? user?.monthlyCurrentEarnings ?? 0) || 0
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Sync if user profile refreshes with updated target/achieved figures
  useEffect(() => {
    const profileTarget = Number(currentMonthEntry?.target ?? user?.monthlyTargetEarnings ?? 0);
    if (profileTarget > 0) {
      setTargetAmount(profileTarget);
      setInputValue(String(profileTarget));
    }
    const profileAchieved = Number(currentMonthEntry?.achieved ?? user?.monthlyCurrentEarnings ?? 0);
    if (profileAchieved >= 0) {
      setLiveAchieved(profileAchieved);
    }
  }, [currentMonthEntry?.target, currentMonthEntry?.achieved, user?.monthlyTargetEarnings, user?.monthlyCurrentEarnings]);

  // Fetch latest dashboard stats in background to ensure achieved revenue is current
  useEffect(() => {
    let active = true;
    providerApi
      .getDashboardStats()
      .then((stats) => {
        if (!active || !stats) return;
        if (typeof stats.monthlyAchieved === 'number') {
          setLiveAchieved(stats.monthlyAchieved);
        }
      })
      .catch(() => {
        // Non-blocking: profile values remain authoritative fallback
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!showGuideModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGuideModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showGuideModal]);

  const metrics = useMemo(
    () =>
      computeTargetMetrics({
        target: targetAmount,
        achieved: liveAchieved,
        now,
      }),
    [targetAmount, liveAchieved, now]
  );

  const historicalTargets = useMemo(() => {
    const list = Array.isArray(user?.monthlyTargets) ? [...user.monthlyTargets] : [];
    return list.sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month));
  }, [user?.monthlyTargets]);

  const handleSliderChange = (nextVal: number) => {
    setTargetAmount(nextVal);
    setInputValue(String(nextVal));
    setError(null);
  };

  const handleNumericInputChange = (raw: string) => {
    setInputValue(raw);
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0) {
      setTargetAmount(parsed);
      setError(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericTarget = Number(inputValue);
    if (!Number.isFinite(numericTarget) || numericTarget < 500) {
      const msg = 'Please enter a valid monthly target of at least ₹500.';
      setError(msg);
      toast({
        variant: 'destructive',
        title: 'Invalid target amount',
        description: msg,
      });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await providerApi.setMonthlyTarget(Math.round(numericTarget));
      if (!res.success) {
        throw new Error(res.message || 'Could not save your monthly target.');
      }
      await refreshProfile();
      toast({
        title: 'Monthly target saved',
        description: `Tracking ₹${Math.round(numericTarget).toLocaleString('en-IN')} for ${MONTH_NAMES[now.getMonth()]} ${currentYear}.`,
      });
    } catch (err: any) {
      const msg = err?.message || 'Could not save your monthly target.';
      setError(msg);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const sliderClampedValue = Math.min(MAX_TARGET, Math.max(MIN_TARGET, targetAmount || MIN_TARGET));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Breadcrumb + Header */}
      <div className="space-y-3">
        <Link
          href="/app"
          prefetch={false}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-outfit font-bold uppercase tracking-[0.18em] text-primary">
              Earnings Goal Planner
            </p>
            <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Monthly Target Setup
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Set your monthly earnings goal and track daily visit pace, milestones, and past months.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowGuideModal(true)}
            className="h-10 px-4 rounded-2xl text-xs font-bold gap-2 self-start sm:self-auto"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Target Guide</span>
          </Button>
        </div>
      </div>

      {/* Desktop 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Current Month Progress Card */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {MONTH_NAMES[now.getMonth()]} {currentYear} Progress
                </p>
                <p className="font-outfit text-2xl sm:text-3xl font-black mt-1 tabular-nums text-foreground">
                  ₹{metrics.achieved.toLocaleString('en-IN')}{' '}
                  <span className="text-base sm:text-lg font-bold text-muted-foreground">
                    / ₹{metrics.target.toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
              <span className="inline-flex items-center rounded-2xl bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-sm font-black font-mono text-primary">
                {metrics.progressPct}%
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
                style={{ width: `${metrics.progressPct}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Achieved: <strong className="text-foreground">₹{metrics.achieved.toLocaleString('en-IN')}</strong>
              </span>
              <span>
                {metrics.remainingAmount > 0 ? (
                  <>
                    Remaining:{' '}
                    <strong className="text-foreground">
                      ₹{metrics.remainingAmount.toLocaleString('en-IN')}
                    </strong>
                  </>
                ) : (
                  <strong className="text-emerald-600">Monthly goal achieved!</strong>
                )}
              </span>
            </div>
          </div>

          {/* Interactive Set Monthly Target Form */}
          <form
            onSubmit={handleSave}
            className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-foreground">Set Monthly Target</h2>
                <p className="text-xs text-muted-foreground">
                  Slide or enter an exact rupee amount to preview your daily visit pace
                </p>
              </div>
            </div>

            {/* Numeric Input + Slider */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="monthly-target-input" className="text-xs font-bold text-foreground">
                  Monthly Target Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-extrabold text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="monthly-target-input"
                    type="number"
                    min={500}
                    step={1}
                    value={inputValue}
                    onChange={(e) => handleNumericInputChange(e.target.value)}
                    className="pl-9 h-12 rounded-2xl text-xl font-mono font-black border-2 border-primary/30 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  aria-label="Monthly target slider"
                  min={MIN_TARGET}
                  max={MAX_TARGET}
                  step={STEP_TARGET}
                  value={sliderClampedValue}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>₹5,000</span>
                  <span>₹50,000</span>
                  <span>₹1,00,000</span>
                  <span>₹1,50,000</span>
                </div>
              </div>
            </div>

            {/* Live Derived Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Daily Target
                </p>
                <p className="font-outfit text-xl sm:text-2xl font-black text-primary mt-1 tabular-nums">
                  ₹{metrics.dailyTarget.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Per remaining day</p>
              </div>
              <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Visits Needed
                </p>
                <p className="font-outfit text-xl sm:text-2xl font-black text-emerald-600 mt-1 tabular-nums">
                  {metrics.visitsNeeded}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Est. at ₹800 / visit</p>
              </div>
            </div>

            {/* AI Preset Chips */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Quick Goal Presets</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {AI_PRESETS.map((preset) => {
                  const active = targetAmount === preset.amount;
                  return (
                    <button
                      key={preset.amount}
                      type="button"
                      onClick={() => handleSliderChange(preset.amount)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/30 text-foreground border-border hover:border-primary/40 hover:bg-muted/60'
                      }`}
                    >
                      <span className="font-mono">{preset.label}</span>
                      <span
                        className={`text-[10px] ${
                          active ? 'text-white/80' : 'text-muted-foreground'
                        }`}
                      >
                        {preset.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error ? (
              <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={saving}
              className="w-full h-12 rounded-2xl text-sm font-extrabold gap-2 shadow-md shadow-primary/20"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Target…</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Save Target &amp; Start Tracking</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right Column (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Days Remaining & Shortfall Card */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-foreground">Days Remaining &amp; Shortfall</h2>
                <p className="text-xs text-muted-foreground">Month-end pacing snapshot</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/40 border border-border/60 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Days Left
                </span>
                <p className="font-outfit text-2xl font-black text-foreground mt-1 tabular-nums">
                  {metrics.daysRemaining}
                </p>
                <span className="text-[11px] text-muted-foreground">Including today</span>
              </div>
              <div className="rounded-2xl bg-muted/40 border border-border/60 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Shortfall
                </span>
                <p className="font-outfit text-2xl font-black text-foreground mt-1 tabular-nums">
                  ₹{metrics.remainingAmount.toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  {metrics.remainingAmount === 0 && metrics.target > 0 ? 'Goal met!' : 'To reach 100%'}
                </span>
              </div>
            </div>
          </div>

          {/* Target Milestones Visual Stepper */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-foreground">Target Milestones</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Checkpoints along your monthly target journey
              </p>
            </div>

            <div className="space-y-3">
              {metrics.milestones.map((m, idx) => (
                <div key={m.pct} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-colors ${
                        m.reached
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-card border-border text-muted-foreground'
                      }`}
                    >
                      {m.reached ? <CheckCircle2 className="w-4 h-4" /> : `${idx + 1}`}
                    </div>
                  </div>
                  <div
                    className={`flex-1 rounded-2xl border px-3.5 py-2.5 flex items-center justify-between gap-2 ${
                      m.reached
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-border/70 bg-muted/20'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-extrabold text-foreground">{m.pct}% Milestone</p>
                      <p className="text-[11px] text-muted-foreground">
                        {m.reached ? 'Reached' : 'Upcoming checkpoint'}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-mono font-black ${
                        m.reached ? 'text-emerald-600' : 'text-foreground'
                      }`}
                    >
                      ₹{m.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Performance */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-foreground">Historical Performance</h2>
                <p className="text-xs text-muted-foreground">Saved monthly targets &amp; outcomes</p>
              </div>
            </div>

            {historicalTargets.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">
                Your past monthly targets will be archived here automatically once saved.
              </p>
            ) : (
              <div className="space-y-3">
                {historicalTargets.slice(0, 6).map((entry) => {
                  const pct =
                    entry.target > 0
                      ? Math.min(100, Math.round(((entry.achieved || 0) / entry.target) * 100))
                      : 0;
                  const monthLabel = MONTH_NAMES[(entry.month || 1) - 1] || `Month ${entry.month}`;
                  return (
                    <div
                      key={`${entry.year}-${entry.month}`}
                      className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-foreground">
                          {monthLabel} {entry.year}
                        </span>
                        <span className="font-mono font-extrabold text-primary">{pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 100 ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                        <span>Achieved: ₹{(entry.achieved || 0).toLocaleString('en-IN')}</span>
                        <span>Goal: ₹{(entry.target || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Help Card */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-foreground">Need Help Planning Your Target?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Learn how Aries computes daily visit pacing or chat with Payment Support about payout schedules and bonus tiers.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGuideModal(true)}
                className="h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Read Target Guide</span>
              </Button>
              <Link href="/app/chat?dept=Payment%20Support" prefetch={false}>
                <Button variant="outline" className="h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Payment Support</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Target Guide Modal */}
      {showGuideModal ? (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="target-guide-title"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
              <h3 id="target-guide-title" className="text-base font-extrabold text-foreground">
                How Monthly Targets Work
              </h3>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Close target guide"
                className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">1. Daily Target:</strong> We divide your remaining shortfall by the number of days left in the current calendar month (including today).
              </p>
              <p>
                <strong className="text-foreground">2. Visits Needed:</strong> Estimated using a standard ₹800 average doorstep session fee. Multi-session packages and add-ons help you reach milestones faster.
              </p>
              <p>
                <strong className="text-foreground">3. Milestones &amp; History:</strong> As completed visits settle, your 25%, 50%, 75%, and 100% checkpoints update automatically across both web and mobile.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full h-10 rounded-2xl text-xs font-extrabold"
            >
              Got It
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

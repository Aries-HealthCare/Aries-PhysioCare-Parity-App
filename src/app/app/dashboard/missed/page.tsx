'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { useToast } from '@/hooks/use-toast';
import { aggregateMissedLeadReasons } from '@/lib/dashboard-analytics';
import { providerApi } from '@/services/provider-api';

function formatRelativeOrDate(raw?: string): string {
  if (!raw) return 'Recently';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  const diffMs = Date.now() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours >= 0 && diffHours < 1) return 'Just now';
  if (diffHours >= 1 && diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays >= 1 && diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function resolveMissedLead(lead: any, index: number) {
  const broadcast = lead?.broadcast || {};
  const patient = broadcast?.patient || lead?.patient || {};
  const nameFromParts = [patient?.firstName, patient?.lastName].filter(Boolean).join(' ').trim();
  const patientName =
    lead?.patientName ||
    patient?.fullName ||
    patient?.name ||
    nameFromParts ||
    lead?.name ||
    'Patient';

  const medicalCondition = Array.isArray(patient?.medicalConditions)
    ? patient.medicalConditions.filter(Boolean).join(', ')
    : '';

  const condition =
    lead?.condition ||
    broadcast?.condition ||
    broadcast?.concern ||
    broadcast?.treatmentType ||
    medicalCondition ||
    'Physiotherapy consultation';

  const potentialFee =
    Number(broadcast?.estimatedFee || broadcast?.sessionFee || lead?.estimatedFee || 0) || 0;

  const reason = String(
    lead?.notIntrestedRemark || lead?.remark || lead?.reason || lead?.therapistResponse || 'No Response'
  ).trim() || 'No Response';

  const rawDate = String(lead?.createdAt || lead?.updatedAt || broadcast?.createdAt || '');
  const city = lead?.city || broadcast?.city || patient?.city || patient?.address?.city || '';

  return {
    id: String(lead?._id || lead?.id || `missed-${index}`),
    patientName: String(patientName),
    condition: String(condition),
    city: String(city),
    potentialFee,
    reason,
    timeLabel: formatRelativeOrDate(rawDate),
  };
}

export default function MissedLeadsPage() {
  const { toast } = useToast();
  const [recoveringId, setRecoveringId] = useState<string | null>(null);
  const [hoveredReason, setHoveredReason] = useState<string | null>(null);
  const [optimisticallyRecovered, setOptimisticallyRecovered] = useState<Set<string>>(new Set());

  const { data, error, loading, reload } = useBackendQuery(
    () => providerApi.fetchMissedLeadsAnalysis(),
    []
  );

  const effectiveRows = useMemo(() => {
    const raw = Array.isArray(data) ? data : [];
    if (optimisticallyRecovered.size === 0) return raw;
    return raw.map((row) => {
      const id = String(row?._id || row?.id || '');
      if (id && optimisticallyRecovered.has(id)) {
        return { ...row, isRecover: true };
      }
      return row;
    });
  }, [data, optimisticallyRecovered]);

  const analytics = useMemo(() => aggregateMissedLeadReasons(effectiveRows), [effectiveRows]);

  const recentMissedCards = useMemo(
    () => analytics.missed.map((lead, idx) => resolveMissedLead(lead, idx)),
    [analytics.missed]
  );

  const handleRecoverLead = async (leadId: string, patientName: string) => {
    setRecoveringId(leadId);
    try {
      const res = await providerApi.recoverMissedLead(leadId);
      if (!res.success) {
        throw new Error(res.message || 'Unable to recover this lead.');
      }
      setOptimisticallyRecovered((prev) => {
        const next = new Set(prev);
        next.add(leadId);
        return next;
      });
      toast({
        title: 'Lead recovery requested',
        description: res.message || `Marked interested in ${patientName}'s broadcast for HQ reassignment.`,
      });
      await reload();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Recovery failed',
        description: err?.message || 'Could not recover this lead. Please try again.',
      });
    } finally {
      setRecoveringId(null);
    }
  };

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  // SVG Donut geometry
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let cumulativeFraction = 0;
  const donutSegments = analytics.reasons.map((item) => {
    const fraction = analytics.totalMissed > 0 ? item.count / analytics.totalMissed : 0;
    const dashLength = fraction * circumference;
    const offset = -cumulativeFraction * circumference;
    cumulativeFraction += fraction;
    return {
      ...item,
      dashLength,
      offset,
    };
  });

  const topReason = analytics.reasons[0];
  const recoveryInsight = topReason
    ? `"${topReason.reason}" accounts for ${topReason.pct}% of your missed broadcasts. Responding within 15 minutes and keeping your service pincodes updated can recover a large share of this ₹${analytics.potentialLoss.toLocaleString('en-IN')} opportunity.`
    : 'Excellent response discipline! You currently have no missed broadcasts to recover.';

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
              Lead Recovery
            </p>
            <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Missed Leads &amp; Recovery
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Understand why broadcasts were missed and recover open patient opportunities in one click.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => void reload()}
              className="h-10 px-4 rounded-2xl text-xs font-bold gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>
            <Link href="/app/availability" prefetch={false}>
              <Button variant="outline" className="h-10 px-4 rounded-2xl text-xs font-bold">
                Tune Pincodes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Card KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Missed
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums text-red-600">
            {analytics.totalMissed}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Unclaimed broadcasts</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Recovered
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums text-emerald-600">
            {analytics.recoveredCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Re-engaged leads</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Recovery Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums">
            {analytics.recoveryRate}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Of all missed opportunities</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Potential Loss
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums text-amber-600">
            ₹{analytics.potentialLoss.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Estimated fee value</p>
        </div>
      </div>

      {/* Desktop 2-Column Row: Reasons Donut + Recovery Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reasons for Missed Leads Donut */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground">Reasons for Missed Leads</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Distribution of pass remarks and expired broadcast responses
            </p>
          </div>

          {analytics.reasons.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No missed lead reasons recorded yet.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Crisp SVG Donut */}
              <div className="relative w-44 h-44 shrink-0">
                <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90" role="img" aria-label="Missed lead reasons chart">
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    className="text-muted/40"
                    strokeWidth="22"
                  />
                  {donutSegments.map((seg) => {
                    const dimmed = hoveredReason !== null && hoveredReason !== seg.reason;
                    return (
                      <circle
                        key={seg.reason}
                        cx="90"
                        cy="90"
                        r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={hoveredReason === seg.reason ? '26' : '22'}
                        strokeDasharray={`${seg.dashLength} ${circumference}`}
                        strokeDashoffset={seg.offset}
                        className="transition-all duration-300 cursor-pointer"
                        style={{ opacity: dimmed ? 0.35 : 1 }}
                        onMouseEnter={() => setHoveredReason(seg.reason)}
                        onMouseLeave={() => setHoveredReason(null)}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="font-outfit text-2xl font-black text-foreground tabular-nums">
                    {analytics.totalMissed}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Missed
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 w-full space-y-2.5 min-w-0">
                {analytics.reasons.map((item) => {
                  const active = hoveredReason === item.reason;
                  return (
                    <button
                      key={item.reason}
                      type="button"
                      onMouseEnter={() => setHoveredReason(item.reason)}
                      onMouseLeave={() => setHoveredReason(null)}
                      onClick={() => setHoveredReason((prev) => (prev === item.reason ? null : item.reason))}
                      className={`w-full flex items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left transition-colors ${
                        active ? 'bg-muted/70' : 'hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-semibold text-foreground truncate">
                          {item.reason}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
                        <span className="font-bold text-foreground">{item.count}</span>
                        <span className="text-muted-foreground">({item.pct}%)</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recovery Tips & AI Insight */}
        <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-foreground">Recovery Tips &amp; AI Insight</h2>
                <p className="text-xs text-muted-foreground">Actionable steps to protect earnings</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{recoveryInsight}</p>

            <ul className="space-y-2 text-xs text-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Keep Duty Status active during your preferred consultation hours so priority broadcasts reach you first.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Use <strong>Recover Lead</strong> below for recently missed inquiries that still match your travel radius.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Review your service pincodes to avoid receiving out-of-range broadcasts.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/app/leads" prefetch={false}>
              <Button className="h-9 px-4 rounded-xl text-xs font-bold">Open Live Broadcasts →</Button>
            </Link>
            <Link href="/app/settings" prefetch={false}>
              <Button variant="outline" className="h-9 px-4 rounded-xl text-xs font-bold">
                Notification Alerts
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Missed Leads List/Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-foreground">Recent Missed Leads</h2>
            <p className="text-xs text-muted-foreground">
              {recentMissedCards.length} lead{recentMissedCards.length === 1 ? '' : 's'} available for recovery
            </p>
          </div>
        </div>

        {recentMissedCards.length === 0 ? (
          <EmptyState
            title="No missed leads right now"
            description="Great job staying responsive! Passed or expired patient broadcasts will appear here if any occur."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recentMissedCards.map((lead) => {
              const isRecovering = recoveringId === lead.id;
              return (
                <div
                  key={lead.id}
                  className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-primary/30 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-foreground truncate">
                          {lead.patientName}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {lead.condition}
                          {lead.city ? ` • ${lead.city}` : ''}
                        </p>
                      </div>
                      {lead.potentialFee > 0 ? (
                        <span className="shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-extrabold font-mono text-amber-700 dark:text-amber-300">
                          ₹{lead.potentialFee.toLocaleString('en-IN')}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full border border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300 px-2.5 py-0.5 text-[10px] font-bold">
                        {lead.reason}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {lead.timeLabel}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => void handleRecoverLead(lead.id, lead.patientName)}
                    disabled={isRecovering}
                    className="w-full h-10 rounded-2xl text-xs font-extrabold gap-2"
                  >
                    {isRecovering ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Recovering Lead…</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Recover Lead</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

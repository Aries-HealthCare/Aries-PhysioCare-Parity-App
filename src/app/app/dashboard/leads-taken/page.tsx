'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { EmptyState, ErrorState, PageSkeleton, StatusBadge } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';

interface NormalizedTakenLead {
  id: string;
  patientName: string;
  city: string;
  condition: string;
  status: string;
  dateLabel: string;
  rawDate: string;
}

function formatDate(raw?: string) {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function normalizeLeadRow(row: any, idx: number): NormalizedTakenLead {
  const broadcast = row?.broadcast || {};
  const patient = broadcast?.patient || row?.patient || {};
  const fullNameFromParts = [patient?.firstName, patient?.lastName].filter(Boolean).join(' ').trim();
  const patientName =
    row?.patientName ||
    patient?.fullName ||
    patient?.name ||
    fullNameFromParts ||
    row?.name ||
    'Patient';

  const city =
    row?.city ||
    broadcast?.city ||
    patient?.city ||
    patient?.address?.city ||
    row?.location ||
    '—';

  const medicalCondition = Array.isArray(patient?.medicalConditions)
    ? patient.medicalConditions.filter(Boolean).join(', ')
    : '';
  const condition =
    row?.condition ||
    broadcast?.condition ||
    broadcast?.treatmentType ||
    broadcast?.concern ||
    medicalCondition ||
    'Physiotherapy';

  const status = String(row?.status || row?.therapistResponse || broadcast?.status || 'Acquired');
  const rawDate = String(row?.createdAt || row?.updatedAt || broadcast?.createdAt || '');

  return {
    id: String(row?._id || row?.id || `lead-${idx}`),
    patientName: String(patientName),
    city: String(city),
    condition: String(condition),
    status,
    dateLabel: formatDate(rawDate),
    rawDate,
  };
}

function clampPct(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export default function LeadsTakenPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, error, loading, reload } = useBackendQuery(
    () => providerApi.fetchLeadsTakenAnalysis(),
    []
  );

  const metrics = data?.metrics || {};
  const leads = useMemo(
    () => (Array.isArray(data?.leads) ? data.leads : []).map((row, idx) => normalizeLeadRow(row, idx)),
    [data?.leads]
  );

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.patientName.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.condition.toLowerCase().includes(q) ||
        l.status.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const totalLeads = Number(metrics.totalLeads ?? leads.length) || 0;
  const avgVisitsRaw = Number(metrics.avgVisitsPerLead ?? 0);
  const avgVisitsPerLead = Number.isFinite(avgVisitsRaw) ? avgVisitsRaw.toFixed(1) : '0.0';
  const conversionRate = clampPct(metrics.conversionRate);
  const onTimePaymentRate = clampPct(metrics.onTimePaymentRate);
  const patientOnTimeRate = clampPct(metrics.patientOnTimeRate);
  const physioOnTimeRate = clampPct(metrics.physioOnTimeRate);
  const packageRenewalRate = clampPct(metrics.packageRenewalRate);
  const avgAssessmentDuration =
    metrics.avgAssessmentDuration !== undefined && metrics.avgAssessmentDuration !== null && metrics.avgAssessmentDuration !== ''
      ? String(metrics.avgAssessmentDuration)
      : '—';
  const paymentDelayIndex =
    metrics.paymentDelayIndex !== undefined && metrics.paymentDelayIndex !== null && metrics.paymentDelayIndex !== ''
      ? String(metrics.paymentDelayIndex)
      : '—';

  const funnel = metrics.conversionFunnel || {};
  const funnelLeadsTaken = Number(funnel.leadsTaken ?? totalLeads) || 0;
  const funnelAssessmentsDone = Number(funnel.assessmentsDone ?? 0) || 0;
  const funnelConverted = Number(funnel.convertedToPackage ?? 0) || 0;
  const funnelBase = Math.max(funnelLeadsTaken, funnelAssessmentsDone, funnelConverted, 1);

  const funnelSteps = [
    {
      label: 'Leads Taken',
      count: funnelLeadsTaken,
      pct: funnelLeadsTaken > 0 ? 100 : 0,
      barWidth: Math.round((funnelLeadsTaken / funnelBase) * 100),
      barClass: 'bg-sky-500',
    },
    {
      label: 'Assessments Done',
      count: funnelAssessmentsDone,
      pct: funnelLeadsTaken > 0 ? Math.round((funnelAssessmentsDone / funnelLeadsTaken) * 100) : 0,
      barWidth: Math.round((funnelAssessmentsDone / funnelBase) * 100),
      barClass: 'bg-indigo-500',
    },
    {
      label: 'Converted to Package',
      count: funnelConverted,
      pct: funnelLeadsTaken > 0 ? Math.round((funnelConverted / funnelLeadsTaken) * 100) : 0,
      barWidth: Math.round((funnelConverted / funnelBase) * 100),
      barClass: 'bg-emerald-500',
    },
  ];

  const aiInsight =
    conversionRate >= 60
      ? `Strong conversion momentum (${conversionRate}%). Keep reinforcing structured 10-session recovery plans during first-visit assessments to lift package renewals further.`
      : totalLeads === 0
        ? 'Accept nearby patient broadcasts to start building your conversion funnel and clinical productivity benchmarks.'
        : `Your current lead-to-package conversion is ${conversionRate}%. Setting clear functional milestones during the initial assessment typically lifts package conversion by 15–25%.`;

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
              Acquisition &amp; Conversion
            </p>
            <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Leads Taken Analysis
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track how acquired patient leads convert into completed assessments, packages, and timely payouts.
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
            <Link href="/app/leads" prefetch={false}>
              <Button className="h-10 px-4 rounded-2xl text-xs font-bold gap-2">
                <Zap className="w-3.5 h-3.5" />
                <span>Browse Broadcasts</span>
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
              Total Leads
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums">{totalLeads}</p>
          <p className="text-xs text-muted-foreground mt-1">Leads accepted</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Visits / Lead
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums">{avgVisitsPerLead}</p>
          <p className="text-xs text-muted-foreground mt-1">Average sessions per patient</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Conversion Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums text-emerald-600">
            {conversionRate}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Lead to care package</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              On-Time Payment
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums">
            {onTimePaymentRate}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Settlement timeliness</p>
        </div>
      </div>

      {/* Desktop 2-Column Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Breakdown */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-foreground">Performance Breakdown</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Clinical turnaround, renewals, and payment punctuality
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-muted/40 border border-border/60 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Avg. Assessment</span>
              </div>
              <p className="text-lg font-extrabold font-mono mt-1 text-foreground">
                {avgAssessmentDuration}
              </p>
            </div>
            <div className="rounded-2xl bg-muted/40 border border-border/60 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Package Renewal</span>
              </div>
              <p className="text-lg font-extrabold font-mono mt-1 text-foreground">
                {packageRenewalRate}%
              </p>
            </div>
            <div className="rounded-2xl bg-muted/40 border border-border/60 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                <Filter className="w-3.5 h-3.5 text-amber-500" />
                <span>Payment Delay Index</span>
              </div>
              <p className="text-lg font-extrabold font-mono mt-1 text-foreground">
                {paymentDelayIndex}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Patient On-Time Payment</span>
                <span className="font-mono font-bold text-emerald-600">{patientOnTimeRate}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${patientOnTimeRate}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Physio Payout On-Time</span>
                <span className="font-mono font-bold text-primary">{physioOnTimeRate}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${physioOnTimeRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lead Conversion Funnel */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-foreground">Lead Conversion Funnel</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step-by-step progression from broadcast acceptance to care package
            </p>
          </div>

          <div className="space-y-4">
            {funnelSteps.map((step, index) => (
              <div key={step.label} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-muted text-foreground font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-bold text-foreground truncate">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-extrabold text-foreground">{step.count}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">({step.pct}%)</span>
                  </div>
                </div>
                <div className="h-7 w-full rounded-xl bg-muted/60 overflow-hidden p-1">
                  <div
                    className={`h-full rounded-lg ${step.barClass} transition-all duration-700 flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(step.count > 0 ? 8 : 0, step.barWidth)}%` }}
                  >
                    {step.barWidth >= 18 ? (
                      <span className="text-[10px] font-mono font-bold text-white">{step.pct}%</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Productivity Insight */}
      <div className="rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/5 via-card to-card p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-extrabold text-foreground">AI Productivity Insight</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-0.5">{aiInsight}</p>
        </div>
        <Link href="/app/dashboard/missed" prefetch={false} className="shrink-0">
          <Button variant="outline" className="h-9 px-4 rounded-xl text-xs font-bold border-primary/30 text-primary hover:bg-primary/10">
            Review Missed Leads →
          </Button>
        </Link>
      </div>

      {/* Searchable Leads Table / Cards */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-foreground">Acquired Leads History</h2>
            <p className="text-xs text-muted-foreground">
              Showing {filteredLeads.length} of {leads.length} acquired lead{leads.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, city, condition..."
              className="pl-10 h-10 rounded-2xl text-xs"
            />
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={leads.length === 0 ? 'No acquired leads yet' : 'No matching leads'}
              description={
                leads.length === 0
                  ? 'Leads you accept from Broadcasts will appear here along with their conversion progress.'
                  : 'Try clearing or adjusting your search query.'
              }
              actionLabel={searchQuery ? 'Clear Search' : undefined}
              onAction={searchQuery ? () => setSearchQuery('') : undefined}
            />
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border/70">
                  <tr>
                    <th className="text-left px-5 py-3 text-[11px] font-outfit font-bold uppercase tracking-wider text-muted-foreground">
                      Patient
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-outfit font-bold uppercase tracking-wider text-muted-foreground">
                      City
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-outfit font-bold uppercase tracking-wider text-muted-foreground">
                      Condition
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-outfit font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-outfit font-bold uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-foreground">{lead.patientName}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{lead.city}</td>
                      <td className="px-5 py-3.5 text-foreground">{lead.condition}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge value={lead.status} />
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">
                        {lead.dateLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border/60">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-foreground">{lead.patientName}</span>
                    <StatusBadge value={lead.status} />
                  </div>
                  <p className="text-xs text-foreground font-medium">{lead.condition}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {lead.city}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {lead.dateLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

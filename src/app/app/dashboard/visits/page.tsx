'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Navigation,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { EmptyState, ErrorState, PageSkeleton, StatusBadge } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { useBackendQuery } from '@/hooks/use-backend-query';
import {
  aggregateVisitTrends,
  type VisitTrendPoint,
  type VisitTrendRange,
} from '@/lib/dashboard-analytics';
import { providerApi } from '@/services/provider-api';

type ViewMode = 'cards' | 'list';

function isCompletedStatus(apt: any): boolean {
  const s = String(apt?.appointmentStatus ?? apt?.status ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return s === 'completed' || s === 'done' || s === 'cancelled';
}

function formatDate(raw?: string): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function resolvePatientName(apt: any): string {
  const p = apt?.patient || {};
  const fromParts = [p?.firstName, p?.lastName].filter(Boolean).join(' ').trim();
  return String(
    apt?.patientName ||
      p?.fullName ||
      p?.name ||
      fromParts ||
      apt?.patientDetails?.name ||
      'Patient'
  );
}

function VisitBarChart({ series }: { series: VisitTrendPoint[] }) {
  const maxVal = Math.max(1, ...series.map((p) => Math.max(p.total, p.completed)));
  const chartWidth = 600;
  const chartHeight = 220;
  const padLeft = 36;
  const padRight = 18;
  const padTop = 24;
  const padBottom = 36;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;
  const groupW = plotW / Math.max(series.length, 1);
  const barW = Math.min(24, Math.max(10, groupW * 0.28));
  const barGap = 4;

  const yTicks = [0, Math.ceil(maxVal / 2), maxVal];

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="w-full h-56 sm:h-64"
      role="img"
      aria-label="Visit trends grouped bar chart"
    >
      {/* Horizontal Gridlines */}
      {yTicks.map((tick, idx) => {
        const y = padTop + plotH - (tick / maxVal) * plotH;
        return (
          <g key={`${tick}-${idx}`}>
            <line
              x1={padLeft}
              y1={y}
              x2={chartWidth - padRight}
              y2={y}
              stroke="currentColor"
              className="text-border/70"
              strokeDasharray="4 4"
            />
            <text
              x={padLeft - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[10px] font-mono"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* Grouped Bars */}
      {series.map((pt, i) => {
        const cx = padLeft + i * groupW + groupW / 2;
        const totalH = (pt.total / maxVal) * plotH;
        const completedH = (pt.completed / maxVal) * plotH;
        const totalX = cx - barW - barGap / 2;
        const completedX = cx + barGap / 2;
        const totalY = padTop + plotH - totalH;
        const completedY = padTop + plotH - completedH;

        return (
          <g key={pt.label}>
            {/* Total bar */}
            <rect
              x={totalX}
              y={totalY}
              width={barW}
              height={Math.max(pt.total > 0 ? 4 : 0, totalH)}
              rx={5}
              className="fill-primary/80"
            />
            {pt.total > 0 ? (
              <text
                x={totalX + barW / 2}
                y={Math.max(12, totalY - 5)}
                textAnchor="middle"
                className="fill-foreground text-[10px] font-mono font-bold"
              >
                {pt.total}
              </text>
            ) : null}

            {/* Completed bar */}
            <rect
              x={completedX}
              y={completedY}
              width={barW}
              height={Math.max(pt.completed > 0 ? 4 : 0, completedH)}
              rx={5}
              className="fill-emerald-500"
            />
            {pt.completed > 0 ? (
              <text
                x={completedX + barW / 2}
                y={Math.max(12, completedY - 5)}
                textAnchor="middle"
                className="fill-emerald-600 text-[10px] font-mono font-bold"
              >
                {pt.completed}
              </text>
            ) : null}

            {/* X-axis label */}
            <text
              x={cx}
              y={chartHeight - 10}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px] font-bold"
            >
              {pt.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function VisitLineChart({ series }: { series: VisitTrendPoint[] }) {
  const maxVal = Math.max(1, ...series.map((p) => Math.max(p.total, p.completed)));
  const chartWidth = 600;
  const chartHeight = 220;
  const padLeft = 36;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 36;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;
  const baseY = padTop + plotH;

  const coords = series.map((pt, i) => {
    const x =
      series.length > 1
        ? padLeft + (i / (series.length - 1)) * plotW
        : padLeft + plotW / 2;
    const totalY = baseY - (pt.total / maxVal) * plotH;
    const completedY = baseY - (pt.completed / maxVal) * plotH;
    return { ...pt, x, totalY, completedY };
  });

  const totalLine = coords.map((c) => `${c.x},${c.totalY}`).join(' ');
  const completedLine = coords.map((c) => `${c.x},${c.completedY}`).join(' ');
  const totalArea =
    coords.length > 0
      ? `M ${coords[0].x},${baseY} ${coords.map((c) => `L ${c.x},${c.totalY}`).join(' ')} L ${coords[coords.length - 1].x},${baseY} Z`
      : '';
  const completedArea =
    coords.length > 0
      ? `M ${coords[0].x},${baseY} ${coords.map((c) => `L ${c.x},${c.completedY}`).join(' ')} L ${coords[coords.length - 1].x},${baseY} Z`
      : '';

  const yTicks = [0, Math.ceil(maxVal / 2), maxVal];

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="w-full h-56 sm:h-64"
      role="img"
      aria-label="Monthly visit trends line chart"
    >
      <defs>
        <linearGradient id="visitTotalArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.28" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="visitCompletedArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Gridlines */}
      {yTicks.map((tick, idx) => {
        const y = baseY - (tick / maxVal) * plotH;
        return (
          <g key={`${tick}-${idx}`}>
            <line
              x1={padLeft}
              y1={y}
              x2={chartWidth - padRight}
              y2={y}
              stroke="currentColor"
              className="text-border/70"
              strokeDasharray="4 4"
            />
            <text
              x={padLeft - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[10px] font-mono"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* Area Fills */}
      {totalArea ? <path d={totalArea} fill="url(#visitTotalArea)" /> : null}
      {completedArea ? <path d={completedArea} fill="url(#visitCompletedArea)" /> : null}

      {/* Lines */}
      {coords.length > 1 ? (
        <>
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={totalLine}
          />
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={completedLine}
          />
        </>
      ) : null}

      {/* Data Points & Labels */}
      {coords.map((c) => (
        <g key={c.label}>
          <circle cx={c.x} cy={c.totalY} r="4.5" fill="hsl(var(--primary))" />
          {c.total > 0 ? (
            <text
              x={c.x}
              y={Math.max(12, c.totalY - 9)}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-mono font-bold"
            >
              {c.total}
            </text>
          ) : null}
          <circle cx={c.x} cy={c.completedY} r="4" fill="#10b981" />
          <text
            x={c.x}
            y={chartHeight - 10}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px] font-bold"
          >
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function DashboardVisitsPage() {
  const router = useRouter();
  const [range, setRange] = useState<VisitTrendRange>('week');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const { data, error, loading, reload } = useBackendQuery(
    () => providerApi.getAppointments(),
    []
  );

  const appointments = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const trend = useMemo(() => aggregateVisitTrends(appointments, range), [appointments, range]);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const rangeOptions: Array<{ key: VisitTrendRange; label: string }> = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
  ];

  const scheduleTitle =
    range === 'today'
      ? "Today's Schedule"
      : range === 'week'
        ? "This Week's Visits"
        : "This Month's Visits";

  const aiInsight =
    trend.summary.total === 0
      ? `No visits are scheduled in this ${range} window yet. Accept nearby patient broadcasts to fill open slots and keep your weekly cadence strong.`
      : trend.summary.completionRate >= 80
        ? `Outstanding consistency — ${trend.summary.completionRate}% completion rate across ${trend.summary.total} visit${trend.summary.total === 1 ? '' : 's'}. High reliability boosts priority dispatch matching.`
        : `You have ${trend.summary.pending} pending visit${trend.summary.pending === 1 ? '' : 's'} remaining in this period (${trend.summary.completionRate}% completed). Confirm arrival times early to prevent reschedules.`;

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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-outfit font-bold uppercase tracking-[0.18em] text-primary">
              Clinical Throughput
            </p>
            <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Visit Analytics &amp; Schedule
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review completion pace, daily and weekly trends, and launch active home visits directly.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => void reload()}
              className="h-10 px-4 rounded-2xl text-xs font-bold gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>
            <Link href="/app/appointments" prefetch={false}>
              <Button className="h-10 px-4 rounded-2xl text-xs font-bold gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Full Calendar</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Controls Bar: Time Range + View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex items-center rounded-2xl border border-border bg-card p-1 shadow-xs"
          role="tablist"
          aria-label="Time range selector"
        >
          {rangeOptions.map((opt) => {
            const active = range === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRange(opt.key)}
                className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div
          className="inline-flex items-center rounded-2xl border border-border bg-card p-1 shadow-xs"
          role="group"
          aria-label="Schedule view mode"
        >
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
              viewMode === 'cards'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* 4-Card KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Visits
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums">
            {trend.summary.total}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Scheduled in range</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums text-emerald-600">
            {trend.summary.completed}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Finished sessions</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Pending
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums text-amber-600">
            {trend.summary.pending}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Remaining visits</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Completion Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums text-indigo-600">
            {trend.summary.completionRate}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Completed vs total</p>
        </div>
      </div>

      {/* Visit Trends Chart Card */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-foreground">Visit Trends</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {range === 'today'
                ? 'Morning, Afternoon, and Evening session distribution'
                : range === 'week'
                  ? 'Monday through Sunday total vs completed visits'
                  : 'Weekly progression across W1–W5 this month'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              Total
            </span>
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Completed
            </span>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          {range === 'month' ? (
            <VisitLineChart series={trend.series} />
          ) : (
            <VisitBarChart series={trend.series} />
          )}
        </div>
      </div>

      {/* Filtered Schedule List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-foreground">{scheduleTitle}</h2>
            <p className="text-xs text-muted-foreground">
              {trend.filteredAppointments.length} visit
              {trend.filteredAppointments.length === 1 ? '' : 's'} in selected range
            </p>
          </div>
        </div>

        {trend.filteredAppointments.length === 0 ? (
          <EmptyState
            title={`No visits for ${range === 'today' ? 'today' : range === 'week' ? 'this week' : 'this month'}`}
            description="Switch time range or browse new patient broadcasts to add visits to your schedule."
            actionLabel="Browse Leads"
            onAction={() => router.push('/app/leads')}
          />
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {trend.filteredAppointments.map((apt, idx) => {
              const aptId = String(apt?._id || apt?.id || `visit-${idx}`);
              const completed = isCompletedStatus(apt);
              const patientName = resolvePatientName(apt);
              const dateStr = formatDate(apt?.appointmentDate || apt?.scheduledDate || apt?.createdAt);
              const timeStr = apt?.appointmentTime || apt?.startTime || apt?.scheduledTime || '';
              const visitType = apt?.visitType || apt?.type || apt?.condition || 'Physiotherapy Visit';
              const fee = Number(apt?.totalAmount ?? apt?.sessionFee ?? 0) || 0;

              return (
                <div
                  key={aptId}
                  className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-primary/35 transition-all"
                >
                  <Link
                    href={`/app/appointments/${encodeURIComponent(aptId)}`}
                    prefetch={false}
                    className="space-y-2.5 group block"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors truncate">
                          {patientName}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{visitType}</p>
                      </div>
                      <StatusBadge value={apt?.appointmentStatus || apt?.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {dateStr}
                      </span>
                      {timeStr ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {timeStr}
                        </span>
                      ) : null}
                      {fee > 0 ? (
                        <span className="font-bold text-foreground">
                          ₹{fee.toLocaleString('en-IN')}
                        </span>
                      ) : null}
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/app/appointments/${encodeURIComponent(aptId)}`}
                      prefetch={false}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full h-9 rounded-xl text-xs font-bold">
                        View Details
                      </Button>
                    </Link>
                    {!completed ? (
                      <Link
                        href={`/app/visits?apt=${encodeURIComponent(aptId)}`}
                        prefetch={false}
                        className="flex-1"
                      >
                        <Button className="w-full h-9 rounded-xl text-xs font-bold gap-1.5">
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Start Visit</span>
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="divide-y divide-border/60">
              {trend.filteredAppointments.map((apt, idx) => {
                const aptId = String(apt?._id || apt?.id || `visit-${idx}`);
                const completed = isCompletedStatus(apt);
                const patientName = resolvePatientName(apt);
                const dateStr = formatDate(apt?.appointmentDate || apt?.scheduledDate || apt?.createdAt);
                const timeStr = apt?.appointmentTime || apt?.startTime || apt?.scheduledTime || '';
                const visitType = apt?.visitType || apt?.type || apt?.condition || 'Physiotherapy Visit';

                return (
                  <div
                    key={aptId}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <Link
                      href={`/app/appointments/${encodeURIComponent(aptId)}`}
                      prefetch={false}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0 group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {patientName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{visitType}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground shrink-0">
                        <span>{dateStr}</span>
                        {timeStr ? <span>{timeStr}</span> : null}
                        <StatusBadge value={apt?.appointmentStatus || apt?.status} />
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {!completed ? (
                        <Link href={`/app/visits?apt=${encodeURIComponent(aptId)}`} prefetch={false}>
                          <Button className="h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5">
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Start Visit</span>
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/app/appointments/${encodeURIComponent(aptId)}`} prefetch={false}>
                          <Button variant="outline" className="h-9 px-3.5 rounded-xl text-xs font-bold">
                            Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* AI Clinical Consistency Insight */}
      <div className="rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/5 via-card to-card p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-extrabold text-foreground">AI Clinical Consistency Insight</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-0.5">
            {aiInsight}
          </p>
        </div>
        <Link href="/app/dashboard/targets" prefetch={false} className="shrink-0">
          <Button variant="outline" className="h-9 px-4 rounded-xl text-xs font-bold border-primary/30 text-primary hover:bg-primary/10">
            Adjust Monthly Target →
          </Button>
        </Link>
      </div>
    </div>
  );
}

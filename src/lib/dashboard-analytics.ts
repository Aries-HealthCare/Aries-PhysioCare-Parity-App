/**
 * Pure clinical dashboard analytics, form visibility, and geo distance helpers.
 * Unit-tested with `node --experimental-strip-types --test`.
 */

export interface TargetMetricsInput {
  target: number;
  achieved: number;
  now?: Date;
  avgSessionFee?: number;
}

export interface TargetMilestone {
  pct: number;
  amount: number;
  reached: boolean;
}

export interface TargetMetrics {
  target: number;
  achieved: number;
  progressPct: number;
  remainingAmount: number;
  daysRemaining: number;
  dailyTarget: number;
  visitsNeeded: number;
  milestones: TargetMilestone[];
}

export function computeTargetMetrics({
  target,
  achieved,
  now,
  avgSessionFee = 800,
}: TargetMetricsInput): TargetMetrics {
  const safeTarget = Math.max(0, Number(target) || 0);
  const safeAchieved = Math.max(0, Number(achieved) || 0);
  const refDate = now ?? new Date();

  const progressPct =
    safeTarget > 0 ? Math.min(100, Math.max(0, Math.round((safeAchieved / safeTarget) * 100))) : 0;
  const remainingAmount = Math.max(0, safeTarget - safeAchieved);

  const daysInMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - refDate.getDate() + 1);

  const dailyTarget = remainingAmount > 0 ? Math.ceil(remainingAmount / daysRemaining) : 0;
  const fee = Number.isFinite(avgSessionFee) && avgSessionFee > 0 ? avgSessionFee : 800;
  const visitsNeeded = remainingAmount > 0 ? Math.ceil(remainingAmount / fee) : 0;

  const milestones: TargetMilestone[] = [25, 50, 75, 100].map((pct) => {
    const amount = Math.round((safeTarget * pct) / 100);
    return {
      pct,
      amount,
      reached: safeTarget > 0 && safeAchieved >= amount,
    };
  });

  return {
    target: safeTarget,
    achieved: safeAchieved,
    progressPct,
    remainingAmount,
    daysRemaining,
    dailyTarget,
    visitsNeeded,
    milestones,
  };
}

export type VisitTrendRange = 'today' | 'week' | 'month';

export interface VisitTrendPoint {
  label: string;
  total: number;
  completed: number;
}

export interface VisitTrendResult {
  summary: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  series: VisitTrendPoint[];
  filteredAppointments: any[];
}

function parseAppointmentDate(apt: any): Date | null {
  const raw = apt?.appointmentDate ?? apt?.date ?? apt?.scheduledDate ?? apt?.createdAt;
  if (!raw) return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;

  const str = String(raw).trim();
  if (!str) return null;

  // YYYY-MM-DD (treat as local date to avoid UTC midnight day-shift)
  const isoDateOnly = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnly) {
    const d = new Date(
      Number(isoDateOnly[1]),
      Number(isoDateOnly[2]) - 1,
      Number(isoDateOnly[3])
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // DD/MM/YYYY
  const dmy = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) {
    const d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseAppointmentHour(apt: any, parsedDate: Date): number {
  const rawTime = apt?.appointmentTime ?? apt?.time ?? apt?.scheduledTime;
  if (typeof rawTime === 'string' && rawTime.trim()) {
    const m = rawTime.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (m) {
      let hour = Number(m[1]);
      const meridiem = m[3]?.toUpperCase();
      if (meridiem === 'PM' && hour < 12) hour += 12;
      if (meridiem === 'AM' && hour === 12) hour = 0;
      if (Number.isFinite(hour) && hour >= 0 && hour <= 23) return hour;
    }
  }
  return parsedDate.getHours();
}

function isAppointmentCompleted(apt: any): boolean {
  const status = String(apt?.status || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return status === 'completed' || status === 'done';
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function aggregateVisitTrends(
  appointments: any[],
  range: VisitTrendRange,
  now?: Date
): VisitTrendResult {
  const refDate = now ?? new Date();
  const list = Array.isArray(appointments) ? appointments : [];

  const filteredAppointments: any[] = [];
  let series: VisitTrendPoint[] = [];

  if (range === 'today') {
    series = [
      { label: 'Morning', total: 0, completed: 0 },
      { label: 'Afternoon', total: 0, completed: 0 },
      { label: 'Evening', total: 0, completed: 0 },
    ];
    const dayStart = startOfDay(refDate).getTime();
    const dayEnd = endOfDay(refDate).getTime();

    for (const apt of list) {
      const d = parseAppointmentDate(apt);
      if (!d) continue;
      const t = d.getTime();
      if (t < dayStart || t > dayEnd) continue;

      filteredAppointments.push(apt);
      const hour = parseAppointmentHour(apt, d);
      const idx = hour < 12 ? 0 : hour < 17 ? 1 : 2;
      series[idx].total += 1;
      if (isAppointmentCompleted(apt)) series[idx].completed += 1;
    }
  } else if (range === 'week') {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    series = labels.map((label) => ({ label, total: 0, completed: 0 }));

    const dayOffsetFromMon = (refDate.getDay() + 6) % 7;
    const monday = new Date(
      refDate.getFullYear(),
      refDate.getMonth(),
      refDate.getDate() - dayOffsetFromMon,
      0,
      0,
      0,
      0
    );
    const sunday = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + 6,
      23,
      59,
      59,
      999
    );

    const weekStart = monday.getTime();
    const weekEnd = sunday.getTime();

    for (const apt of list) {
      const d = parseAppointmentDate(apt);
      if (!d) continue;
      const t = d.getTime();
      if (t < weekStart || t > weekEnd) continue;

      filteredAppointments.push(apt);
      const idx = (d.getDay() + 6) % 7;
      series[idx].total += 1;
      if (isAppointmentCompleted(apt)) series[idx].completed += 1;
    }
  } else {
    series = ['W1', 'W2', 'W3', 'W4', 'W5'].map((label) => ({
      label,
      total: 0,
      completed: 0,
    }));
    const targetYear = refDate.getFullYear();
    const targetMonth = refDate.getMonth();

    for (const apt of list) {
      const d = parseAppointmentDate(apt);
      if (!d) continue;
      if (d.getFullYear() !== targetYear || d.getMonth() !== targetMonth) continue;

      filteredAppointments.push(apt);
      const idx = Math.min(4, Math.floor((d.getDate() - 1) / 7));
      series[idx].total += 1;
      if (isAppointmentCompleted(apt)) series[idx].completed += 1;
    }
  }

  const total = filteredAppointments.length;
  const completed = filteredAppointments.filter(isAppointmentCompleted).length;
  const pending = Math.max(0, total - completed);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    summary: { total, completed, pending, completionRate },
    series,
    filteredAppointments,
  };
}

export interface MissedLeadReasonItem {
  reason: string;
  count: number;
  pct: number;
  color: string;
}

export interface MissedLeadAnalytics {
  missed: any[];
  recovered: any[];
  totalMissed: number;
  recoveredCount: number;
  recoverableCount: number;
  recoveryRate: number;
  potentialLoss: number;
  reasons: MissedLeadReasonItem[];
}

const REASON_PALETTE = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#6366f1',
  '#14b8a6',
  '#8b5cf6',
  '#ec4899',
];

export function aggregateMissedLeadReasons(rows: any[]): MissedLeadAnalytics {
  const list = Array.isArray(rows) ? rows : [];
  const recovered = list.filter((l) => l?.isRecover === true);
  const missed = list.filter((l) => l?.isRecover !== true);

  let potentialLoss = 0;
  const counts = new Map<string, number>();

  for (const l of missed) {
    const fee = Number(
      l?.broadcast?.estimatedFee || l?.broadcast?.sessionFee || l?.estimatedFee || 0
    );
    if (Number.isFinite(fee) && fee > 0) {
      potentialLoss += fee;
    }
    const rawReason = l?.remark || l?.reason || l?.therapistResponse || 'No Response';
    const reason = String(rawReason).trim() || 'No Response';
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }

  const recoveryRate = list.length > 0 ? Math.round((recovered.length / list.length) * 100) : 0;

  const reasons: MissedLeadReasonItem[] = Array.from(counts.entries())
    .sort((a, b) => (b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0])))
    .map(([reason, count], index) => ({
      reason,
      count,
      pct: missed.length > 0 ? Math.round((count / missed.length) * 100) : 0,
      color: REASON_PALETTE[index % REASON_PALETTE.length],
    }));

  return {
    missed,
    recovered,
    totalMissed: missed.length,
    recoveredCount: recovered.length,
    recoverableCount: missed.length,
    recoveryRate,
    potentialLoss,
    reasons,
  };
}

function matchesSingleVisibilityValue(parentVal: unknown, expected: unknown): boolean {
  if (typeof parentVal === 'boolean') {
    if (typeof expected === 'boolean') return parentVal === expected;
    const expStr = String(expected ?? '').trim().toLowerCase();
    return parentVal
      ? expStr === 'true' || expStr === 'yes'
      : expStr === 'false' || expStr === 'no';
  }

  if (typeof expected === 'boolean' && typeof parentVal === 'string') {
    const valStr = parentVal.trim().toLowerCase();
    return expected
      ? valStr === 'true' || valStr === 'yes'
      : valStr === 'false' || valStr === 'no';
  }

  return String(parentVal ?? '') === String(expected ?? '');
}

export function isDynamicQuestionVisible(
  question: { parentFieldId?: string; visibilityValue?: unknown },
  formData: Record<string, any>
): boolean {
  if (!question?.parentFieldId) return true;

  const parentVal = formData?.[question.parentFieldId];
  if (parentVal === undefined || parentVal === null) return false;

  const expected = question.visibilityValue;
  if (Array.isArray(expected)) {
    if (Array.isArray(parentVal)) {
      return parentVal.some((item) =>
        expected.some((exp) => matchesSingleVisibilityValue(item, exp))
      );
    }
    return expected.some((exp) => matchesSingleVisibilityValue(parentVal, exp));
  }

  if (Array.isArray(parentVal)) {
    return parentVal.some((item) => matchesSingleVisibilityValue(item, expected));
  }

  return matchesSingleVisibilityValue(parentVal, expected);
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lng1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lng2)
  ) {
    return 0;
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

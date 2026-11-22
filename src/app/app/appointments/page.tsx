'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Play,
  Navigation,
  Loader2,
  Eye,
  MessageSquare,
  RefreshCw,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { ApiError } from '@/services/api-transport';
import { useRealtimeEvent } from '@/services/provider-realtime';

const TIME_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
];

type DateFilter = 'ALL' | 'Today' | 'Tomorrow' | 'Upcoming';
type StatusFilter = 'ALL' | 'Scheduled' | 'InProgress' | 'Completed';

interface AppointmentItem {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  phone: string;
  condition: string;
  serviceType: 'Home Visit' | 'Clinic Visit';
  dateKey: string; // YYYY-MM-DD in local time (empty if unknown)
  dateLabel: string;
  dateBucket: 'Today' | 'Tomorrow' | 'Upcoming' | 'Past';
  isFuture: boolean;
  timeSlot: string;
  address: string;
  pincode: string;
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
  sessionNumber: number;
  totalSessions: number;
  fee: number;
  sortTimestamp: number;
}

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getRelativeLocalDateKey(offsetDays: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
  return toLocalDateKey(target);
}

function parseAppointmentDate(raw: unknown): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? null : raw;
  }
  const str = String(raw).trim();
  if (!str) return null;

  // YYYY-MM-DD (avoid UTC midnight shift into previous day)
  const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (isoDateOnly) {
    const [, y, m, d] = isoDateOnly;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  // DD/MM/YYYY
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str);
  if (dmy) {
    const [, d, m, y] = dmy;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatAddress(rawAddress: unknown, fallback: string): string {
  if (!rawAddress) return fallback;
  if (typeof rawAddress === 'string') return rawAddress.trim() || fallback;
  if (typeof rawAddress === 'object') {
    const a = rawAddress as Record<string, unknown>;
    const parts = [a.street, a.addressLine2, a.landMark || a.landmark, a.city, a.state]
      .map((p) => (p ? String(p).trim() : ''))
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : fallback;
  }
  return fallback;
}

export default function ProviderAppointmentsPage() {
  const { user } = useProviderAuth();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');

  const [reschedulingApt, setReschedulingApt] = useState<AppointmentItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(() => getRelativeLocalDateKey(1));
  const [rescheduleTime, setRescheduleTime] = useState('10:00 AM');
  const [rescheduleRemark, setRescheduleRemark] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const todayIso = getRelativeLocalDateKey(0);

  const loadAppointments = useCallback(
    async (silent = false) => {
      if (silent) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const data = await providerApi.getAppointments(user?._id);
        const todayKey = getRelativeLocalDateKey(0);
        const tomorrowKey = getRelativeLocalDateKey(1);

        if (Array.isArray(data) && data.length > 0) {
          const mapped: AppointmentItem[] = data.map((item: any, idx: number) => {
            const patient = item.patient && typeof item.patient === 'object'
              ? item.patient
              : item.patientDetails && typeof item.patientDetails === 'object'
                ? item.patientDetails
                : {};

            const rawDate = item.appointmentDate || item.scheduledAt || item.scheduledDate || item.date;
            const parsedDate = parseAppointmentDate(rawDate);
            const dateKey = parsedDate ? toLocalDateKey(parsedDate) : '';

            let dateBucket: AppointmentItem['dateBucket'] = 'Upcoming';
            let dateLabel = 'Date TBD';
            let isFuture = false;

            if (dateKey) {
              if (dateKey === todayKey) {
                dateBucket = 'Today';
                dateLabel = 'Today';
              } else if (dateKey === tomorrowKey) {
                dateBucket = 'Tomorrow';
                dateLabel = 'Tomorrow';
                isFuture = true;
              } else if (dateKey > tomorrowKey) {
                dateBucket = 'Upcoming';
                dateLabel = parsedDate!.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                isFuture = true;
              } else {
                dateBucket = 'Past';
                dateLabel = parsedDate!.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
              }
            }

            const statusRaw = String(item.appointmentStatus || item.status || 'scheduled')
              .trim()
              .toLowerCase()
              .replace(/[\s-]+/g, '_');

            const status: AppointmentItem['status'] =
              statusRaw === 'completed' || statusRaw === 'closed' || statusRaw === 'done'
                ? 'Completed'
                : statusRaw === 'in_progress' || statusRaw === 'inprogress' || statusRaw === 'ongoing'
                  ? 'InProgress'
                  : statusRaw === 'cancelled' || statusRaw === 'canceled'
                    ? 'Cancelled'
                    : 'Scheduled';

            const timeSlot =
              String(item.appointmentTime || item.timeSlot || '').trim() ||
              (parsedDate && rawDate && String(rawDate).includes('T')
                ? parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Time TBD');

            const patientName =
              `${patient.firstName || ''} ${patient.lastName || ''}`.trim() ||
              patient.fullName ||
              patient.name ||
              item.patientName ||
              'Patient';

            const patientId = String(
              patient._id || patient.id || (typeof item.patient === 'string' ? item.patient : '') || ''
            );

            return {
              id: String(item._id || item.id || `apt_${idx}`),
              patientId,
              patientName,
              patientAge: Number(patient.age || item.patientAge || 0) || 0,
              patientGender: String(patient.gender || item.patientGender || '').trim(),
              phone: String(patient.phone || patient.mobileNo || item.phone || '').trim(),
              condition: String(
                patient.condition ||
                  item.condition ||
                  (Array.isArray(patient.medicalConditions) ? patient.medicalConditions.filter(Boolean).join(', ') : '') ||
                  'Physiotherapy Session'
              ),
              serviceType: String(item.visitType || '').toLowerCase() === 'clinic' ? 'Clinic Visit' : 'Home Visit',
              dateKey,
              dateLabel,
              dateBucket,
              isFuture,
              timeSlot,
              address: formatAddress(patient.address, String(item.location || 'Doorstep Visit')),
              pincode: String(patient.address?.pinCode || patient.address?.zipCode || item.pincode || ''),
              status,
              sessionNumber: Number(item.sessionIndex || item.sessionNumber || 0) || 0,
              totalSessions: Number(item.totalSessions || 0) || 0,
              fee: Number(item.sessionAmount ?? item.fee ?? item.amount ?? item.therapistSessionAmount ?? item.perSessionPrice ?? 0) || 0,
              sortTimestamp: parsedDate ? parsedDate.getTime() : 0,
            };
          });

          setAppointments(mapped);
        } else {
          setAppointments([]);
        }
        setLoadError(null);
      } catch (err: any) {
        setLoadError(err?.message || 'Could not load your appointments from the server.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user?._id]
  );

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  useRealtimeEvent(['lead_approved', 'payment_success'], () => {
    void loadAppointments(true);
  });

  useEffect(() => {
    if (!reschedulingApt) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRescheduling) {
        setReschedulingApt(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [reschedulingApt, isRescheduling]);

  const openRescheduleModal = (apt: AppointmentItem) => {
    setReschedulingApt(apt);
    setRescheduleDate(apt.dateKey && apt.dateKey >= todayIso ? apt.dateKey : getRelativeLocalDateKey(1));
    setRescheduleTime(TIME_SLOTS.includes(apt.timeSlot) ? apt.timeSlot : '10:00 AM');
    setRescheduleRemark('');
    setRescheduleError(null);
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApt) return;
    setRescheduleError(null);

    if (!rescheduleDate) {
      setRescheduleError('Please select a new appointment date.');
      return;
    }
    if (!rescheduleTime) {
      setRescheduleError('Please select an appointment time slot.');
      return;
    }

    setIsRescheduling(true);
    try {
      const res = await providerApi.rescheduleAppointment({
        appointmentId: reschedulingApt.id,
        appointmentDate: rescheduleDate,
        appointmentTime: rescheduleTime,
        remark: rescheduleRemark.trim() || 'Rescheduled by therapist',
      });

      if (res.success === false) {
        throw new Error(res.message || 'Could not reschedule this appointment.');
      }

      toast({
        title: 'Appointment rescheduled',
        description: `${reschedulingApt.patientName} moved to ${rescheduleDate} at ${rescheduleTime}.`,
      });
      setReschedulingApt(null);
      await loadAppointments(true);
    } catch (err: any) {
      const isConflict =
        err instanceof ApiError
          ? err.statusCode === 409
          : err?.statusCode === 409 || err?.status === 409;
      const msg = String(err?.message || '');
      if (isConflict || msg.toLowerCase().includes('already has an appointment')) {
        setRescheduleError(
          msg || 'Schedule conflict: you already have another appointment booked at this date and time. Please choose a different slot.'
        );
      } else {
        setRescheduleError(msg || 'Failed to reschedule appointment. Please try again.');
      }
    } finally {
      setIsRescheduling(false);
    }
  };

  const dateCounts = useMemo(() => {
    let today = 0;
    let tomorrow = 0;
    let upcoming = 0;
    for (const a of appointments) {
      if (a.dateBucket === 'Today') today += 1;
      if (a.dateBucket === 'Tomorrow') tomorrow += 1;
      if (a.isFuture) upcoming += 1;
    }
    return { today, tomorrow, upcoming };
  }, [appointments]);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (dateFilter === 'Today' && a.dateBucket !== 'Today') return false;
      if (dateFilter === 'Tomorrow' && a.dateBucket !== 'Tomorrow') return false;
      if (dateFilter === 'Upcoming' && !a.isFuture) return false;
      return true;
    });
  }, [appointments, statusFilter, dateFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {loadError && (
        <div className="p-4 rounded-2xl text-xs font-bold flex items-center gap-2 bg-red-500/10 text-red-600 border border-red-500/30">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{loadError}</span>
          <button type="button" onClick={() => void loadAppointments()} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Appointments &amp; Treatment Schedule</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your patient visits, reschedule confirmed slots, and launch doorstep clinical flows.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            disabled={isRefreshing}
            onClick={() => void loadAppointments(true)}
            className="h-10 px-3.5 rounded-xl text-xs font-bold gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Link href="/app/visits" prefetch={false}>
            <Button className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>Doorstep Visit Engine</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'Scheduled', 'InProgress', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                statusFilter === tab
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'ALL'
                ? `All (${appointments.length})`
                : tab === 'InProgress'
                  ? 'In Progress'
                  : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'Today', 'Tomorrow', 'Upcoming'] as const).map((d) => {
            const count =
              d === 'Today'
                ? dateCounts.today
                : d === 'Tomorrow'
                  ? dateCounts.tomorrow
                  : d === 'Upcoming'
                    ? dateCounts.upcoming
                    : null;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDateFilter(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  dateFilter === d
                    ? 'bg-muted text-foreground border border-border shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d === 'ALL' ? 'All Dates' : count !== null ? `${d} (${count})` : d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="bg-card border border-border/80 rounded-3xl p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p>Loading your scheduled appointments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-3xl p-12 text-center text-xs text-muted-foreground space-y-3">
          <CalendarCheck className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="font-bold text-sm text-foreground">No appointments match these filters</p>
          <p className="text-xs max-w-sm mx-auto">
            {appointments.length === 0
              ? 'New appointments assigned to your schedule will appear here automatically.'
              : 'Try switching the status or date filter above to see your other appointments.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            {(statusFilter !== 'ALL' || dateFilter !== 'ALL') && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStatusFilter('ALL');
                  setDateFilter('ALL');
                }}
                className="h-9 px-4 rounded-xl text-xs font-bold"
              >
                Reset Filters
              </Button>
            )}
            <Link href="/app/leads" prefetch={false}>
              <Button className="h-9 px-4 rounded-xl text-xs font-bold bg-primary text-white">
                View Available Leads
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((apt) => {
            const isCompleted = apt.status === 'Completed';
            const isInProgress = apt.status === 'InProgress';
            const isScheduled = apt.status === 'Scheduled';
            const isCancelled = apt.status === 'Cancelled';
            const canAct = isScheduled || isInProgress;

            const demographics = [
              apt.patientAge > 0 ? `${apt.patientAge}y` : null,
              apt.patientGender || null,
            ]
              .filter(Boolean)
              .join(', ');

            return (
              <div
                key={apt.id}
                className={`bg-card border rounded-3xl p-5 sm:p-6 shadow-sm transition-all flex flex-col justify-between gap-4 ${
                  isScheduled || isInProgress
                    ? 'border-primary/35 bg-gradient-to-br from-card to-primary/[0.03]'
                    : isCancelled
                      ? 'border-border/40 opacity-65'
                      : 'border-border/80'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : isInProgress
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              : isCancelled
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-primary text-white'
                        }`}
                      >
                        {isInProgress ? 'In Progress' : apt.status}
                      </span>
                      {apt.sessionNumber > 0 && (
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                          {apt.totalSessions > 0
                            ? `Session ${apt.sessionNumber} of ${apt.totalSessions}`
                            : `Session #${apt.sessionNumber}`}
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold text-accent-foreground bg-accent/20 px-2 py-0.5 rounded-full">
                        {apt.serviceType}
                      </span>
                    </div>

                    {apt.fee > 0 && (
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-foreground font-mono">
                          ₹{apt.fee.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-foreground leading-snug">
                      <Link
                        href={`/app/appointments/${encodeURIComponent(apt.id)}`}
                        className="hover:text-primary transition-colors"
                      >
                        {apt.patientName}
                      </Link>
                      {demographics && (
                        <span className="text-xs text-muted-foreground font-normal ml-1.5">
                          ({demographics})
                        </span>
                      )}
                    </h3>
                    <p className="text-xs font-bold text-primary mt-0.5">{apt.condition}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground/90">
                        {apt.dateLabel} · {apt.timeSlot}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{apt.address}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60">
                  <Link href={`/app/appointments/${encodeURIComponent(apt.id)}`} prefetch={false}>
                    <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl text-xs font-bold gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </Button>
                  </Link>

                  <div className="flex flex-wrap items-center gap-2">
                    {canAct && (
                      <>
                        <Button
                          type="button"
                          onClick={() => openRescheduleModal(apt)}
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 rounded-xl text-xs font-bold"
                        >
                          Reschedule
                        </Button>
                        <Link href={`/app/visits?apt=${encodeURIComponent(apt.id)}`} prefetch={false}>
                          <Button
                            size="sm"
                            className="h-9 px-4 rounded-xl text-xs font-extrabold bg-primary text-white shadow-sm flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isInProgress ? 'Resume Visit' : 'Start Visit'}</span>
                          </Button>
                        </Link>
                      </>
                    )}

                    {isCompleted && (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Visit Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-modal-title"
          onClick={() => {
            if (!isRescheduling) setReschedulingApt(null);
          }}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div>
                <h3 id="reschedule-modal-title" className="text-base font-extrabold text-foreground">
                  Reschedule Appointment
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Patient: <strong className="text-foreground">{reschedulingApt.patientName}</strong>
                </p>
              </div>
              <button
                type="button"
                aria-label="Close reschedule dialog"
                disabled={isRescheduling}
                onClick={() => setReschedulingApt(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {rescheduleError && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <form onSubmit={handleSaveReschedule} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="reschedule-date" className="font-bold text-foreground block">
                  New Appointment Date
                </label>
                <input
                  id="reschedule-date"
                  type="date"
                  min={todayIso}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  disabled={isRescheduling}
                  required
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reschedule-time" className="font-bold text-foreground block">
                  New Time Slot
                </label>
                <select
                  id="reschedule-time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  disabled={isRescheduling}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reschedule-remark" className="font-bold text-foreground block">
                  Remark <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  id="reschedule-remark"
                  rows={2}
                  value={rescheduleRemark}
                  onChange={(e) => setRescheduleRemark(e.target.value)}
                  disabled={isRescheduling}
                  placeholder="e.g. Patient requested schedule change"
                  className="w-full p-3 bg-background border border-input rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isRescheduling}
                  onClick={() => setReschedulingApt(null)}
                  className="flex-1 h-10 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isRescheduling}
                  className="flex-1 h-10 rounded-xl bg-primary text-white text-xs font-extrabold shadow-sm gap-1.5"
                >
                  {isRescheduling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isRescheduling ? 'Saving...' : 'Confirm Reschedule'}</span>
                </Button>
              </div>
            </form>

            {/* Honest cancellation guidance */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-2.5 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Need to cancel? Contact Operations Support so the patient is notified and reassigned.
              </p>
              <Link href="/app/chat?dept=Patient%20Support" prefetch={false} className="block">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-9 rounded-xl text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contact Patient Support</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
